export const handleTerminalCreation = ( container,ws )=>{
        container.exec({
            Cmd:["/bin/bash"],
            AttachStdin:true,
            AttachStdout:true,
            AttachStderr:true,
            Tty:true,
            User:'sandbox'
        },(err,exec) => {
            if(err){
                console.log("Error while creating exec",err);
                return;
            }

            exec.start({
                hijack:true,

            },(err,stream) => {
                 if(err){
                    console.log("error while sdtarting exec");
                    return;
                 }

                 processStreamOutput(stream,ws)

                 // write incoming websocket messages to the container stdin
                 ws.on('message',(data)=>{
                    try{ stream.write(data); }catch(e){ console.error('stream.write failed', e); }
                 })

                 // forward container output back to the websocket so the browser terminal receives stdout/stderr
                 stream.on('data', (chunk) => {
                     try{
                         if (ws && ws.readyState === ws.OPEN) {
                             ws.send(chunk);
                         }
                     }catch(e){
                         console.error('failed sending chunk to websocket', e);
                     }
                 });

                 stream.on('end', () => {
                     try{ ws.close(); }catch(e){}
                 });
            })

        })
}

function processStreamOutput(stream,ws){
    let nextDataType = null;
    let nextDataLength=null;
    let buffer = Buffer.from('');

    function processStreamData(data){
        if(data){
            buffer = Buffer.concat([buffer,data])
        }

        if(!nextDataType){

            if(buffer.length >= 8){
                const harder = bufferSlicer(8);
                nextDataType = header.readUInt32BE(0);
                nextDataLength = header.readUInt32BE(4);

                processStreamData()
            }

        }else{
            if(buffer.length >= nextDataLength){
                const content = bufferSlicer(nextDataLength);
                ws.send(content);
                nextDataType = null;
                processStreamData();
                
            }
        }
    }

    function bufferSlicer(end){
        const outPut = buffer.slice(0,end);
        buffer = Buffer.from(buffer.slice(end,buffer.length));


        return outPut;
    }

    stream.on("data",processStreamData);

}

