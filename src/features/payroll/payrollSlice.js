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
    percentageUpdates: {}, // Tracks update states per user { userId: { loading, error } }
  },
  reducers: {
    updatePercentageLocally: (state, action) => {
      const { userId, percentage } = action.payload;
      const userIndex = state.data.findIndex(user => user.user_id === userId);
      if (userIndex !== -1) {
        state.data[userIndex].newPercentage = percentage;
      }
    },
    startPercentageEdit: (state, action) => {
      const userId = action.payload;
      const userIndex = state.data.findIndex(user => user.user_id === userId);
      if (userIndex !== -1) {
        state.data[userIndex].editingPercentage = true;
        state.data[userIndex].newPercentage = state.data[userIndex].percentage;
        // Clear any previous errors when starting new edit
        if (state.percentageUpdates[userId]) {
          state.percentageUpdates[userId].error = null;
        }
      }
    },
    cancelPercentageEdit: (state, action) => {
      const userId = action.payload;
      const userIndex = state.data.findIndex(user => user.user_id === userId);
      if (userIndex !== -1) {
        state.data[userIndex].editingPercentage = false;
        delete state.data[userIndex].newPercentage;
        // Clear any errors when canceling
        if (state.percentageUpdates[userId]) {
          state.percentageUpdates[userId].error = null;
        }
      }
    },
    clearPercentageUpdateError: (state, action) => {
      const userId = action.payload;
      if (state.percentageUpdates[userId]) {
        state.percentageUpdates[userId].error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrollData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.map(employee => ({
          ...employee,
          editingPercentage: false,
        }));
      })
      .addCase(fetchPayrollData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserPercentage.pending, (state, action) => {
        const { userId } = action.meta.arg;
        state.percentageUpdates[userId] = {
          loading: true,
          error: null
        };
      })
      .addCase(updateUserPercentage.fulfilled, (state, action) => {
          const { userId } = action.meta.arg;
          const responseData = action.payload;
          
          // Find the user in state
          const userIndex = state.data.findIndex(user => user.user_id === userId);
          
          if (userIndex !== -1) {
            // Update the user's percentage from the response
            state.data[userIndex] = {
              ...state.data[userIndex],
              percentage: responseData.percentage?.percentage || 
                        responseData.percentage || // Handle both response formats
                        state.data[userIndex].percentage, // Fallback to existing value
              editingPercentage: false,
              newPercentage: undefined
            };
          }
          
          // Clear the loading state
          delete state.percentageUpdates[userId];
        })
      .addCase(updateUserPercentage.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        if (state.percentageUpdates[userId]) {
          state.percentageUpdates[userId] = {
            loading: false,
            error: action.payload
          };
        }
      });
  },
});

export const { 
  updatePercentageLocally,
  startPercentageEdit,
  cancelPercentageEdit,
  clearPercentageUpdateError
} = payrollSlice.actions;

export default payrollSlice.reducer;