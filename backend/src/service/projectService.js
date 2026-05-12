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

    const response = await execPromisified(REACT_PROJECT_COMMOND,{ 
        cwd:`./projects/${projectId}`
     })

    return projectId;

}

export const getProgectTreeService = async (projectId)=>{
            const projecPath = path.resolve(`./projects/${projectId}`);
            const tree = directoryTree(projecPath);
            
            return tree
}


