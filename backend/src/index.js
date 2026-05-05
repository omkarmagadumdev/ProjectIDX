import express from 'express';
import cors from 'cors';
import  { PORT  } from './config/serverConfig.js'

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors);


app.listen(PORT,()=>{
    console.log(`server is running on the following port ${PORT} `);
    
})

app.get('/ping',(req,res)=>{
    return res.json({ message:"pong" })
})