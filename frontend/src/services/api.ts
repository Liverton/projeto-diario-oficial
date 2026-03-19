// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
    // URL do seu backend Django no Docker
    baseURL: 'http://localhost:8000/api/',
});

export default api;