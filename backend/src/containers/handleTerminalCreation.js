export const handleTerminalCreation = ( container,ws )=>{
        container.exec({
            Cmd:["/bin/bash", "-i"],
            AttachStdin:true,
            AttachStdout:true,
            AttachStderr:true,
            Tty:true,
            Env:["TERM=xterm-256color"]
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

                 // write incoming websocket messages to the container stdin
                 ws.on('message',(data)=>{
                    if(data === 'getPort'){
                        
                    }
                    try{ stream.write(data); }catch(e){ console.error('stream.write failed', e); }
                 })

                 // forward container output back to the websocket so the browser terminal receives stdout/stderr
                 stream.on('data', (chunk) => {
                     try{
                         if (ws && ws.readyState === 1) {
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

