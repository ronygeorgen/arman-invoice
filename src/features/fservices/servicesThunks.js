import { axiosInstance } from '../../services/api';
import { setServices, setLoading, setError } from './servicesSlice';

export const fetchServices = (query = '') => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get(`/services/?name=${query}`);
    dispatch(setServices(response.data));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to fetch services'));
  } finally {
    dispatch(setLoading(false));
  }
};