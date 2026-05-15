import express from 'express';
import cors from 'cors';
import  { PORT  } from './config/serverConfig.js'
import apiRouter from './routes/index.js'
import { Server } from 'socket.io';
import { createServer, get } from 'node:http'
import chokidar from 'chokidar';
import path from 'path'
import { handleEditorSocketEvents } from './SockateHandlers/editorHandlers..js';



const app = express();

const server = createServer(app);

const io = new Server(server,{
    cors:{
        origin:'*',
        methods:['GET','POST']
    }
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/ping',(req,res)=>{
    return res.json({ message:"pong" })
})

io.on('connection',(socket)=>{
    console.log("a user connected");    
})

const editorNamespace = io.of('/editor')

editorNamespace.on('connection',(socket)=>{
    console.log("editor connected", socket.id);

    console.log(socket.handshake.query['projectId']);

    // `socket.handshake.query` is already an object parsed by Socket.IO.
    // Use it directly instead of calling `query-string`.
    const queryParams = socket.handshake.query;
    let projectId = queryParams.projectId;

    // keep watcher in this scope so we can close it on disconnect
    let watcher = null;

    if(projectId){
        watcher = chokidar.watch(`projects/${projectId}`,{
            ignored:(path)=>path.includes('node_modules'),
            persistent:true,
            awaitWriteFinish:{
                stabilityThreshold:2000,
            },
            ignoreInitial:true
        });

        watcher.on('all',(event,path)=>{
            console.log(event,path);
        });
    }

    handleEditorSocketEvents(socket)

    socket.on('disconnect',(reason)=>{
        console.log('editor disconnected', socket.id, reason);
        if(watcher){
            watcher.close().catch(()=>{});
            watcher = null;
        }
    });

});


app.use('/api',apiRouter)

server.listen(PORT,()=>{
    console.log(`server is running on the following port ${PORT} `);
})