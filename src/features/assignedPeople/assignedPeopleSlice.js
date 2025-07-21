import { createSlice } from '@reduxjs/toolkit';
// Remove the problematic import since searchAssignedPeople is already in thunks

const initialState = {
  people: [],
  selectedPeople: [],
  loading: false,
  error: null,
  searchQuery: '',
  isValid: true,
  validationMessages: []
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
        state.selectedPeople.splice(existingIndex, 1);
      } else {
        state.selectedPeople.push(person);
      }
    },
    removeSelectedPerson: (state, action) => {
      const personId = action.payload;
      state.selectedPeople = state.selectedPeople.filter(
        person => person.id !== personId
      );
      state.isValid = state.selectedPeople.length === 0 ? true : state.isValid;
    },
    resetValidation: (state) => {
      state.isValid = true;
      state.validationMessages = [];
    },
    setValidationStatus: (state, action) => {
      state.isValid = action.payload;
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
      state.isValid = true;
      state.validationMessages = [];
    }
  },
  // Remove the extraReducers section entirely since we don't need it
});

export const { 
  setPeople, 
  togglePersonSelection,
  removeSelectedPerson,
  resetValidation,
  setValidationStatus,
  setSearchQuery, 
  setLoading, 
  setError, 
  resetPeople,
  resetSelectedPeople 
} = assignedPeopleSlice.actions;

export default assignedPeopleSlice.reducer;