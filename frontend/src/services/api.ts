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

// Interceptor de resposta para lidar com tokens expirados (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Recarrega a página para resetar o estado do App e mostrar o Login
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;