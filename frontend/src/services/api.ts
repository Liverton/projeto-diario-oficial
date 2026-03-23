// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
    // URL do seu backend Django no Docker
    baseURL: 'http://localhost:8000/api/',
});

// Adiciona o token JWT em todas as requisições, se existir
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;