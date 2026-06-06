import Docker from "dockerode";
import fs from 'fs'

const docker = new Docker();
// const projectContainerCache = new Map();

export const listContainer = async ()=>{
      const containers = await docker.listContainers();
      console.log("containers",containers);
      containers.forEach((containersInfo)=>{
        console.log(containersInfo.Ports);
        
      })
      
}

export const handleCreateContainer = async ( projectId ) => {
  console.log("Project id recieved for conatiner create", projectId);
  if (!fs.existsSync('/var/run/docker.sock')) {
    console.log('Docker socket /var/run/docker.sock not found — skipping container creation');
    return null;
  }

  

  try {
    await docker.ping();

    const existingContainer = await docker.listContainers({
      name:projectId
    });

    if(existingContainer.length > 0){
        console.log("conatiner already exists, stopping and removing it");
        const container =  docker.getContainer(existingContainer[0].Id) 
        await container.stop();
        await container.remove();
        
    }

    // const cachedContainer = projectContainerCache.get(projectId);
    // if (cachedContainer) {
    //   try {
    //     await cachedContainer.inspect();
    //     console.log('Reusing existing container', cachedContainer.id);
    //     return cachedContainer;
    //   } catch (inspectError) {
    //     projectContainerCache.delete(projectId);
    //   }
    // }
    
    console.log("creating a new container");
    
    const container = await docker.createContainer({
      Image: "sandbox",
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ["/bin/bash", "-i"],
      name:projectId,
      Tty: true,
      ExposedPorts: {
        "5173/tcp": {},
      },
      Env: ["HOST=0.0.0.0", "TERM=xterm-256color"],
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
    // attempt to start the dev server inside the container so the mapped port becomes active
    try {
      const execInstance = await container.exec({
        Cmd: ['bash','-lc','cd /home/sandbox/app/sandbox && npm install --silent || true && npm run dev -- --host 0.0.0.0'],
        AttachStdout: true,
        AttachStderr: true,
        Tty: false,
      });

      // start detached so the container keeps running the dev server
      await execInstance.start({ Detach: true });
      console.log('started dev server in container', container.id);
    } catch (err) {
      console.warn('failed to start dev server inside container', err);
    }
    // projectContainerCache.set(projectId, container);

    return container;

    }

   catch (error) {
    console.log("error while creating container", error);
    return null;
  }
};


export async function getContainerPort(containerName){
        const container = await docker.listContainers({
          name:containerName
        })

        if(container.length > 0){
          const  containerInfo = await docker.getContainer(container[0].Id).inspect();
          console.log("Container info",containerInfo);
          try {
          return containerInfo.NetworkSettings.Ports['5173/tcp'][0].HostPort;
            
          } catch (error) {
            console.log("port not present");
            return undefined
          }
        }
}