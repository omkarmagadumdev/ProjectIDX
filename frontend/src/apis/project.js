import axios from '../config/axiosConfig.js'

export const createProjectApi = async () => {
        try{
            const response = await axios.post('/api/v1/projects');
            console.log(response.data);
            
            return response.data
        }
        catch(error){
            console.log(error);
            throw error;
        }
} 

export const getProjectTree = async ({ projectId })=>{
    try{
        // Try plural route first; fallback to singular if backend uses a different path
        try {
            const response = await axios.get(`/api/v1/projects/${projectId}/tree`);
            console.log(response.data);
            return response.data?.data ?? response.data
        } catch (err) {
            if (err.response && err.response.status === 404) {
                const response = await axios.get(`/api/v1/project/${projectId}/tree`);
                console.log(response?.data?.data);
                return response.data?.data ?? response.data
            }
            throw err
        }

    }
    catch(error){
        console.log(error);
        throw error;
    }
}