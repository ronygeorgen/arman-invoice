import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [],
  selectedServices: [],
  loading: false,
  error: null,
  searchQuery: '',
};

export const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action) => {
      state.services = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    toggleServiceSelection: (state, action) => {
      const serviceId = action.payload;
      if (state.selectedServices.includes(serviceId)) {
        state.selectedServices = state.selectedServices.filter(id => id !== serviceId);
      } else {
        state.selectedServices.push(serviceId);
      }
    },
    resetServices: (state) => {
      state.services = [];
      state.selectedServices = [];
      state.searchQuery = '';
    },
  },
});

export const { 
  setServices, 
  setSearchQuery, 
  setLoading, 
  setError, 
  toggleServiceSelection,
  resetServices
} = servicesSlice.actions;

export default servicesSlice.reducer;
