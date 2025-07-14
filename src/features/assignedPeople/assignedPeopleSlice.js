// assignedPeopleSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  people: [],
  selectedPeople: [], // Array to store multiple selected people
  loading: false,
  error: null,
  searchQuery: '',
};

const assignedPeopleSlice = createSlice({
  name: 'assignedPeople',
  initialState,
  reducers: {
    setPeople: (state, action) => {
      state.people = action.payload;
    },
    togglePersonSelection: (state, action) => {
      const person = action.payload;
      const existingIndex = state.selectedPeople.findIndex(p => p.id === person.id);
      
      if (existingIndex >= 0) {
        // Remove if already exists
        state.selectedPeople.splice(existingIndex, 1);
      } else {
        // Add new person
        state.selectedPeople.push(person);
      }
    },
    removeSelectedPerson: (state, action) => {
      state.selectedPeople = state.selectedPeople.filter(
        person => person.id !== action.payload
      );
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
    resetPeople: (state) => {
      state.people = [];
      state.searchQuery = '';
    },
    resetSelectedPeople: (state) => {
    state.selectedPeople = [];
    }
  },
});

export const { 
  setPeople, 
  togglePersonSelection,
  removeSelectedPerson,
  setSearchQuery, 
  setLoading, 
  setError, 
  resetPeople,
  resetSelectedPeople 
} = assignedPeopleSlice.actions;

export default assignedPeopleSlice.reducer;