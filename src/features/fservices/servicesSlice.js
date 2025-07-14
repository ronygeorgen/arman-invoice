// servicesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [],
  allFetchedServices: [],
  selectedServices: [], // This will now store objects with id and price
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
      const { id, price } = action.payload;
      const existingIndex = state.selectedServices.findIndex(item => item.id === id);
      
      if (existingIndex >= 0) {
        // Remove if already exists
        state.selectedServices.splice(existingIndex, 1);
      } else {
        // Add new service with price
        state.selectedServices.push({ id, price: price || 0 });
      }
    },
    setServices: (state, action) => {
      state.services = action.payload;
      // Add new services to allFetchedServices if they don't exist
      action.payload.forEach(service => {
        if (!state.allFetchedServices.some(s => s.id === service.id)) {
          state.allFetchedServices.push(service);
        }
      });
    },
    updateServicePrice: (state, action) => {
      const { id, price } = action.payload;
      const service = state.selectedServices.find(item => item.id === id);
      if (service) {
        service.price = price;
      }
    },
    removeSelectedService: (state, action) => {
      state.selectedServices = state.selectedServices.filter(
        item => item.id !== action.payload
      );
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
  updateServicePrice,
  removeSelectedService,
  resetServices
} = servicesSlice.actions;

export default servicesSlice.reducer;