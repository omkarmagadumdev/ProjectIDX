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

    // include stopped containers as well so we can remove/replace them
    const existingContainer = await docker.listContainers({
      all: true,
      name: projectId
    });

    if(existingContainer.length > 0){
        console.log("conatiner already exists, stopping and removing it");
        const container =  docker.getContainer(existingContainer[0].Id) 
        try {
          await container.remove({ force: true });
          console.log('removed existing container', existingContainer[0].Id);
        } catch (removeErr) {
          console.warn('failed to remove existing container, continuing', removeErr);
        }
        
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
    // NOTE: we intentionally do NOT auto-run `npm install` / `npm run dev` inside the
    // container. Starting the dev server should be done manually from the in-browser
    // terminal (or by an explicit user action) to avoid surprising port bindings.
    // projectContainerCache.set(projectId, container);

    return container;

    }

   catch (error) {
    console.log("error while creating container", error);
    return null;
  }
};


export async function getContainerPort(containerName){
        // include stopped containers when looking up ports
        const container = await docker.listContainers({
          all: true,
          name: containerName
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