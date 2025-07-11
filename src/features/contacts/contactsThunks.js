import { axiosInstance } from '../../services/api';
import { setContacts, setLoading, setError } from './contactsSlice';

export const searchContacts = (query) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get(`/contacts/?first_name=${query}`);
    // Extract results from paginated response
    dispatch(setContacts(response.data.results || response.data));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to search contacts'));
  } finally {
    dispatch(setLoading(false));
  }
};