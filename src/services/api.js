import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Named export for BASE_URL
export { BASE_URL };