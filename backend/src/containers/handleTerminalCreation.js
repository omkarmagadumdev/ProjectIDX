export const handleTerminaCreation = ( container,ws )=>{
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

                 ws.on('message',(data)=>{
                    stream.write(data)
                 })

                 
            })

        })
}

function processStreamData(stream,ws){
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

