import axios from 'axios'

const axiosController = axios.create({
    baseURL:import.meta.env.VITE_BACKEND_URL
})

export default axiosController;
