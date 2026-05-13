import express from 'express';
import cors from 'cors';
import  { PORT  } from './config/serverConfig.js'
import apiRouter from './routes/index.js'
import { Server } from 'socket.io';
import { createServer, get } from 'node:http'
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

app.use('/api',apiRouter)

server.listen(PORT,()=>{
    console.log(`server is running on the following port ${PORT} `);
})