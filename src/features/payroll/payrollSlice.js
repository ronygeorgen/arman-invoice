import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../services/api';

export const fetchPayrollData = createAsyncThunk(
  'payroll/fetchPayrollData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payroll/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUserPercentage = createAsyncThunk(
  'payroll/updateUserPercentage',
  async ({ userId, percentage }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/payroll/${userId}/`, 
        { percentage: parseFloat(percentage) }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrollData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPayrollData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserPercentage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPercentage.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific user's percentage in the state
        const updatedUser = action.payload;
        state.data = state.data.map(user => 
          user.user_id === updatedUser.user_id ? updatedUser : user
        );
      })
      .addCase(updateUserPercentage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default payrollSlice.reducer;