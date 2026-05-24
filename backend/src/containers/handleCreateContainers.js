import Docker from "dockerode";

const docker = new Docker();

export const handleCreateContainer = async ( projectId, terminalSocket,req,tcpsocket,head) => {
  console.log("Project id recieved for conatiner create", projectId);
  try {
    const container = await docker.createContainer({
      Image: "sandbox",
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ["/bin/bash"],
      Tty: true,
      ExposedPorts: {
        "5173/tcp": {},
      },
      Env: ["HOST=0.0.0.0"],
      HostConfig: {
        Binds: [`${process.cwd()}/projects/${projectId}:/home/sandbox/app`],
        PortBindings: {
          "5173/tcp": [
            {
              HostPort: "0",
            },
          ],
        },

      },
    });

    console.log("continer created", container.id);

    await container.start();

    console.log("conatiner started");

    terminalSocket.handleUpgrade(req,tcpsocket ,head,(establishedWSConn)=>{
         terminalSocket.emit('connection',establishedWSConn,req,container)
    }) 

    }

   catch (error) {
    console.log("error while creating container", error);
  }
};
