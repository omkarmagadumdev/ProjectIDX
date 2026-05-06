import util from 'util'
import child_process from 'child_process'
import uuid4 from 'uuid4';
import { mkdir } from 'fs/promises';

  const execPromisified = util.promisify(child_process.exec);
  
  
  export const createProjectConroller = async (req,res)=>{
            const projectId = uuid4();
            console.log(projectId);

            await mkdir(`./projects/${projectId}`)

            const response = await execPromisified('npm create vite@latest sandbox -- --template react',{ 
                cwd:`./projects/${projectId}`
             })

            return res.json({ message:'Project created', data:projectId })
            
            
  }