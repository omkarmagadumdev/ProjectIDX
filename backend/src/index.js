import express from 'express';
import cors from 'cors';
import  { PORT  } from './config/serverConfig.js'
import apiRouter from './routes/index.js'
import { Server } from 'socket.io';
import { createServer, get } from 'node:http'
import chokidar from 'chokidar';
import path from 'path'



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
    console.log("editor connected");
    
    let projectId = '123';

    if(projectId){
        var watcher = chokidar.watch(`projects/${projectId}`,{
            ignored:(path)=>path.includes(node_modules),
            persistent:true,
            awaitWriteFinish:{
                stabilityThreshold:2000,
            },
            ignoreInitial:true
        });

        watcher.on('all',(event,path)=>{
            console.log(event,path);
 
        })
    }


    socket.on('message',(data)=>{
        console.log(data);
        console.log("got a message event",data);
        
        
    })

    socket.on('disconnect',()=>{
        console.log("editor disconnected");
        watcher.close()
    })
    
})


app.use('/api',apiRouter)

server.listen(PORT,()=>{
    console.log(`server is running on the following port ${PORT} `);
})