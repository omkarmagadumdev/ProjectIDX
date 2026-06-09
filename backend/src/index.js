import express from 'express';
import cors from 'cors';
import { PORT } from './config/serverConfig.js'
import apiRouter from './routes/index.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleEditorSocketEvents } from './SockateHandlers/editorHandlers..js'
import { startProjectWatcher } from './watchers/projectWatcher.js'
import { handleCreateContainer, listContainer, getContainerPort } from './containers/handleCreateContainers.js';
import { handleTerminalCreation } from './containers/handleTerminalCreation.js';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Log incoming requests for debugging
app.use((req, res, next) => {
    console.log('[req]', req.method, req.path);
    next();
});

app.get('/ping', (req, res) => {
    return res.json({ message: "pong" })
})

app.use('/api', apiRouter)

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

const editorNamespace = io.of('/editor');

editorNamespace.on('connection', (socket) => {
    const projectId = socket.handshake?.query?.projectId || socket.handshake?.auth?.projectId;
    if (projectId) {
        socket.data.projectId = projectId;
        socket.join(projectId);
    }
    console.log('Editor socket connected', socket.id, 'projectId:', projectId);

    socket.on("getPort",()=>{
        console.log("getPort event received");
        listContainer()
        
    })


    handleEditorSocketEvents(socket, editorNamespace);
});

// start fs watcher to notify editor clients of filesystem changes (e.g. rm -rf node_modules)
try {
    startProjectWatcher(editorNamespace);
    console.log('project watcher started');
} catch (e) {
    console.warn('failed to start project watcher', e);
}


// Try to listen on the configured PORT, and if it's in use try subsequent ports
const MAX_PORT_ATTEMPTS = 10;
let attempted = 0;
let currentPort = Number(PORT) || 3000;

function startServer(port) {
    attempted += 1;
    server.listen(port, () => {
        console.log(`server is running on the following port ${port}`);
    });

    server.once('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is already in use. Attempt ${attempted}/${MAX_PORT_ATTEMPTS}.`);
            if (attempted < MAX_PORT_ATTEMPTS) {
                // remove the error listener and try next port
                server.removeAllListeners('error');
                currentPort = port + 1;
                startServer(currentPort);
                return;
            }
            console.error(`All ${MAX_PORT_ATTEMPTS} port attempts failed. Exiting.`);
            process.exit(1);
        }
        console.error('Server error', err);
        process.exit(1);
    });
}

startServer(currentPort);

const webSocketForTerminal = new WebSocketServer({
    noServer: true
})


server.on('upgrade', (req, tcpsocket, head) => {
    // this call will be called when client tries to connect to the server through websocket
    const idTerminal = req.url.includes('/terminal');

    if (idTerminal) {
        console.log("Request url received", req.url);
        try {
            // parse projectId robustly from upgrade request URL
            const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const projectId = parsed.searchParams.get('projectId');
            console.log("project id received after connect", projectId);

                    webSocketForTerminal.handleUpgrade(req, tcpsocket, head, async (establishedWSConn) => {
                        try {
                            const container = await handleCreateContainer(projectId);
                            if (!container) {
                                console.log('No container available for terminal connection', { projectId });
                                try { establishedWSConn.close(); } catch (closeErr) {}
                                return;
                            }

                            // emit the host port to any connected editor clients in the project room
                            try {
                                const hostPort = await getContainerPort(projectId);
                                if (hostPort && editorNamespace) {
                                    editorNamespace.to(projectId).emit('getPortSuccess', { port: hostPort });
                                    console.log('emitted getPortSuccess for', projectId, hostPort);
                                }
                            } catch (emitErr) {
                                console.warn('failed to emit getPortSuccess', emitErr);
                            }

                            handleTerminalCreation(container, establishedWSConn);
                            console.log('terminal connected', { projectId, url: req.url });

                            establishedWSConn.on('close', () => {
                                console.log('terminal websocket closed', { projectId, containerId: container.id });
                            });
                        } catch (err) {
                            console.error('failed to create terminal container', err);
                            try { establishedWSConn.close(); } catch (closeErr) {}
                        }
                    });
        } catch (err) {
            console.error('failed to parse upgrade request url', err, req.url);
        }
    }

})
process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection', reason);
});
