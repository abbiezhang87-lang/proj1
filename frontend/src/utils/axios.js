import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/api', // 只要写 /api，Vite 就会自动转发到 5000 端口
    headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：每次发请求前自动检查并携带 Token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // 按照后端通用的 Bearer Token 格式发送
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器：统一处理报错（比如 Token 过期）
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // 如果后端返回 401，说明没登录或 Token 失效，可以在这里处理跳转登录页
            console.log('User unauthorized, redirecting to login...');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;