import Docker from "dockerode";
import fs from 'fs'

const docker = new Docker();
const projectContainerCache = new Map();

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

    const cachedContainer = projectContainerCache.get(projectId);
    if (cachedContainer) {
      try {
        await cachedContainer.inspect();
        console.log('Reusing existing container', cachedContainer.id);
        return cachedContainer;
      } catch (inspectError) {
        projectContainerCache.delete(projectId);
      }
    }

    const container = await docker.createContainer({
      Image: "sandbox",
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Cmd: ["/bin/bash", "-i"],
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
    projectContainerCache.set(projectId, container);

    return container;

    }

   catch (error) {
    console.log("error while creating container", error);
    return null;
  }
};
