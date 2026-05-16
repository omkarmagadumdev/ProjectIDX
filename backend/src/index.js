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
    console.log('Editor socket connected', socket.id);
    handleEditorSocketEvents(socket);
});

server.listen(PORT,()=>{
    console.log(`server is running on the following port ${PORT} `);
})