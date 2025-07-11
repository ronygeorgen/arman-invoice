import { axiosInstance } from "../../services/api";
import { setCredentials, setLoading, setError } from "./authSlice";

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await axiosInstance.post('/login/', formData);
    
    if (response.data.access) {
      dispatch(setCredentials({
        user: { username: credentials.username },
        accessToken: response.data.access,
      }));
      return { success: true };
    }
    return { success: false, error: 'No access token received' };
  } catch (error) {
    let errorMsg = error.response?.data?.detail || 'Login failed';
    dispatch(setError(errorMsg));
    return { success: false, error: errorMsg };
  } finally {
    dispatch(setLoading(false));
  }
};
export const logoutUser = () => (dispatch) => {
  dispatch(logout());
};