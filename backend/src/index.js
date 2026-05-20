import express from 'express';
import cors from 'cors';
import  { PORT  } from './config/serverConfig.js'
import apiRouter from './routes/index.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleEditorSocketEvents } from './SockateHandlers/editorHandlers..js'

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

const terminalNamespace = io.of('/shell');

terminalNamespace.on("connection",(socket)=>{
    console.log("terminal connected");

    socket.on("shell-input",(data)=>{
        console.log("input recieved",data);
        terminalNamespace.emit('shell-output',data)
        
    })

    socket.on("disconnect",()=>{
        console.log("terminal disconnected");
        
    })


    
})

server.listen(PORT,()=>{
    console.log(`server is running on the following port ${PORT} `);
})

process.on('uncaughtException', (err) => {
    console.error('uncaughtException', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection', reason);
});
