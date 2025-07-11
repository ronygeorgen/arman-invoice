// import axios from "axios";
// import { axiosInstance, BASE_URL } from "./api";

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const res = await axios.post(`${BASE_URL}/token/refresh/`, {}, { withCredentials: true });
//         const newAccessToken = res.data.accessToken;
//         localStorage.setItem('accessToken', newAccessToken);
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         console.error('Refresh token invalid, logging out');
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );


import { axiosInstance, BASE_URL } from "./api";

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Verify your actual refresh endpoint
        const refreshEndpoint = '/api/auth/refresh/'; // Adjust this!
        const res = await axiosInstance.post(refreshEndpoint);
        
        const newAccessToken = res.data.access;
        localStorage.setItem('accessToken', newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh failed', refreshError);
        // Redirect to login or handle logout
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);