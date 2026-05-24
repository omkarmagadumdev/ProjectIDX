import express from 'express';
import cors from 'cors';
import  { PORT  } from './config/serverConfig.js'
import apiRouter from './routes/index.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleEditorSocketEvents } from './SockateHandlers/editorHandlers..js'
import {handleCreateContainer} from './containers/handleCreateContainers.js';
import { handleTerminalCreation } from './containers/handleTerminalCreation.js';
import WebSocket, { WebSocketServer } from 'ws';
// import { Container } from 'dockerode';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Log incoming requests for debugging
app.use((req, res, next) => {
    console.log('[req]', req.method, req.path);
    next();
});

app.get('/ping',(req,res)=>{
    return res.json({ message:"pong" })
})

app.use('/api',apiRouter)

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
    handleEditorSocketEvents(socket, editorNamespace);
});



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
    noServer:true
})


server.on('upgrade',(req,tcpsocket,head)=>{
    // this call will be called when client tries to connect to the server through websocket
    const idTerminal =  req.url.includes('/terminal');

    if(idTerminal){
        console.log("Request url received", req.url);
        try{
            // parse projectId robustly from upgrade request URL
            const parsed = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const projectId = parsed.searchParams.get('projectId');
            console.log("project id received after connect", projectId);
            handleCreateContainer(projectId, webSocketForTerminal, req, tcpsocket, head);
        }catch(err){
            console.error('failed to parse upgrade request url', err, req.url);
        }
    }
    
})
webSocketForTerminal.on('connection',(ws,req,conatiner)=>{
        console.log("terminal connected");
        handleTerminalCreation(conatiner,ws)
        ws.on("close",()=>{
            conatiner.remove({ force:true },(err,data)=>{
                if(err){
                    console.log("Error while removing conatiner",err);
                    
                }
                console.log("Container removed",data);
                
            })
        })
        
})
process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection', reason);
});

