import uuid4 from "uuid4";
import { mkdir } from 'fs/promises';
import { REACT_PROJECT_COMMOND } from "../config/serverConfig.js";
import { execPromisified } from "../utils/execUtility.js";
import directoryTree from "directory-tree";
import path from "path";


export const createProjectService = async () => {
    const projectId = uuid4();
    console.log(projectId);

    await mkdir(`./projects/${projectId}`)

    // Run project scaffolding command in background so HTTP request doesn't hang.
    if (REACT_PROJECT_COMMOND) {
        try {
            const r = await execPromisified(REACT_PROJECT_COMMOND, { cwd: `./projects/${projectId}` });
            console.log('scaffold finished', r)
        } catch (err) {
            console.error('scaffold error', err)
        }
    }

    return projectId;

}

export const getProgectTreeService = async (projectId)=>{
            const projecPath = path.resolve(`./projects/${projectId}`);
            const tree = directoryTree(projecPath);
            
            return tree
}


