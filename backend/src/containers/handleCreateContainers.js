import Docker from "dockerode";
import fs from 'fs'

const docker = new Docker();
const CONTAINER_IMAGE = "sandbox";
const PROJECT_MOUNT_ROOT = "/home/sandbox/app";

async function findContainerByProjectId(projectId, includeStopped = true) {
  const containers = await docker.listContainers({
    all: includeStopped,
    filters: {
      name: [projectId]
    }
  });

  if (!containers.length) {
    return null;
  }

  return docker.getContainer(containers[0].Id);
}

async function createProjectContainer(projectId) {
  return docker.createContainer({
    Image: CONTAINER_IMAGE,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ["/bin/bash", "-i"],
    name: projectId,
    Tty: true,
    ExposedPorts: {
      "5173/tcp": {},
    },
    Env: ["HOST=0.0.0.0", "TERM=xterm-256color"],
    HostConfig: {
      Binds: [`${process.cwd()}/projects/${projectId}:${PROJECT_MOUNT_ROOT}`],
      PortBindings: {
        "5173/tcp": [
          {
            HostPort: "0",
          },
        ],
      },

    },
  });
}

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

    let container = await findContainerByProjectId(projectId);

    if (!container) {
      console.log("creating a new container");
      container = await createProjectContainer(projectId);
      console.log("continer created", container.id);
    } else {
      console.log("reusing existing container", container.id);
    }

    const details = await container.inspect();
    if (!details.State?.Running) {
      await container.start();
      console.log("conatiner started");
    }

    return container;

    }

   catch (error) {
    console.log("error while creating container", error);
    return null;
  }
};

export async function runCommandInProjectContainer(projectId, command, options = {}) {
  const container = await handleCreateContainer(projectId);
  if (!container) {
    throw new Error('Container is not available');
  }

  const workdir = options.workdir || `${PROJECT_MOUNT_ROOT}/sandbox`;
  const exec = await container.exec({
    Cmd: ["/bin/bash", "-lc", `cd ${workdir} && ${command}`],
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Env: [
      "TERM=xterm-256color",
      "CI=true",
      "FORCE_COLOR=0",
      "npm_config_progress=false",
      "npm_config_audit=false",
      "npm_config_fund=false",
      "npm_config_update_notifier=false"
    ]
  });

  const stream = await exec.start({
    hijack: true,
    tty: true
  });

  const chunks = [];

  await new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    stream.on('end', resolve);
    stream.on('error', reject);
  });

  const result = await exec.inspect();

  return {
    exitCode: result.ExitCode,
    output: Buffer.concat(chunks).toString('utf8')
  };
}


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
