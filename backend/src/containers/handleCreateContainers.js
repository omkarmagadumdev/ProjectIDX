import Docker  from 'dockerode';


const docker = new Docker();

export const handleCreateContainer = async ({projectId,socket})=>{
        console.log("Project id recieved for conatiner create",projectId);
        try {
const container = await docker.createContainer({
            Image:'sandbox',
            AttachStdin:true,
            AttachStdout:true,
            AttachStderr: true,
            CMD:['/bin/bash'],
            Tty:true,
            User:'sandbox',
            HostConfig:{
                Binds:[
                    `${process.cwd()}/projects/${projectId}:/home/sandbox/app`
                ],
                PortBindings:{
                    "5173/tcp":[
                        {
                            'HostPort':'0'
                        }
                    ]
                    
                },
                ExposedPorts:{
                    '5173/tcp':{}
                },
                Env:[
                    "HOST=0.0.0.0"
                ]
            }
        })

        console.log("continer created",container.id);

        await container.start()

        console.log("conatiner started");

        container.exec({
            CMD:['/bin/bash'],
            AttachStdin:true,
            AttachStdout:true,
            AttachStderr:true
        },(err,exec)=>{
            if(err){
                console.log("Error while creating exec",err);
                return;
            }

            exec.start({ hijack:true },(err,stream) => {
                if(err){
                    console.log("error while starting exec");
                    return;
                }

                processStream(stream,socket);


                socket.on("shell-input",(data)=>{
                    stream.write('pwd\n');
                })
                
            })
        })
        
        
        } catch (error) {
            console.log("error while creating container",error); 
        }
        
}


export function processStream(stream,socket){
    let buffer = Buffer.from("");
    stream.on("data",(data)=>{
        buffer = Buffer.concat([buffer,data])
        socket.emit("shell-output",buffer.toString())
        buffer = Buffer.from('')
    })

    stream.on("end",(data)=>{
        console.log("stream ended");
        socket.emit("shell-output","Steam ended");        
    })

    stream.on("error",(error)=>{
        console.log("Stream error",err);
        socket.emit("Shell-output","stream error")
        
    })

}