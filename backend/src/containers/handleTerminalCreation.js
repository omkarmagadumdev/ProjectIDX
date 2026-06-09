export const handleTerminalCreation = ( container,ws )=>{
        container.exec({
            Cmd:["/bin/bash", "--noprofile", "--norc", "-i"],
            AttachStdin:true,
            AttachStdout:true,
            AttachStderr:true,
            Tty:true,
            Env:[
                "TERM=xterm-256color",
                "CI=true",
                "FORCE_COLOR=0",
                "npm_config_progress=false",
                "npm_config_audit=false",
                "npm_config_fund=false",
                "npm_config_update_notifier=false"
            ]
        },(err,exec) => {
            if(err){
                console.log("Error while creating exec",err);
                return;
            }

            exec.start({
                        hijack: true,
                        stdin: true,
                        tty: true
                    },(err,stream) => {
                 if(err){
                    console.log("error while sdtarting exec");
                    return;
                 }

                 // write incoming websocket messages to the container stdin
                 ws.on('message',(data)=>{
                    try{
                        // handle different payload types: string, Buffer, ArrayBuffer
                        let payload;
                        if (Buffer.isBuffer(data)) {
                            payload = data;
                        } else if (data instanceof ArrayBuffer) {
                            payload = Buffer.from(data);
                        } else if (Array.isArray(data)) {
                            payload = Buffer.from(data);
                        } else {
                            payload = String(data);
                        }

                            // write payload directly (string or binary). We removed the npm install interception
                            // so that typed commands behave exactly like a normal terminal session.
                            stream.write(payload);
                    }catch(e){ console.error('stream.write failed', e); }
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

