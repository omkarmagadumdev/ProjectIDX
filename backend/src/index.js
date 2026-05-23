import express from 'express';
import cors from 'cors';
import  { PORT  } from './config/serverConfig.js'
import apiRouter from './routes/index.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { handleEditorSocketEvents } from './SockateHandlers/editorHandlers..js'
import {handleCreateContainer} from './containers/handleCreateContainers.js';
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



server.listen(PORT,()=>{
    console.log(`server is running on the following port ${PORT} `);
})

const webSocketForTerminal = new WebSocketServer({
    noServer:true
})


server.on('upgrade',(req,tcpsocket,head)=>{
    // this call will be called when client tries to connect to the server through websocket
    const idTerminal =  req.url.includes('/terminal');

    if(idTerminal){
        console.log("Request url recived",req.url);
        const projectId = req.url.split('=')[1]
        console.log("project id recived after connect",projectId);
        
        handleCreateContainer(projectId,webSocketForTerminal,req,tcpsocket,head)
    }
    
})
webSocketForTerminal.on('connection',(ws,req,conatiner)=>{
        console.log("terminal connected",ws,req,conatiner);
        handleTerminaCreation(conatiner,ws)
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

