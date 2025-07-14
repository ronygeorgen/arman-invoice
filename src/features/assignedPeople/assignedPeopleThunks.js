// assignedPeopleThunks.js
import { axiosInstance } from '../../services/api';
import { setPeople, setLoading, setError } from './assignedPeopleSlice';

export const searchAssignedPeople = (query) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axiosInstance.get(`/users/?search=${query}`);
    // Extract results from paginated response
    console.log('in assigned  people thunk== ',response.data.results );
    dispatch(setPeople(response.data.results || response.data));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Failed to search assigned people'));
  } finally {
    dispatch(setLoading(false));
  }
};

// Make sure this export exists
export default {
  searchAssignedPeople
};