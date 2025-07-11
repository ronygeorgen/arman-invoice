import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  contacts: [],
  selectedContact: null,
  loading: false,
  error: null,
  searchQuery: '',
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setContacts: (state, action) => {
      state.contacts = action.payload;
    },
     setSelectedContact: (state, action) => {  // New reducer
      state.selectedContact = action.payload;
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
    resetContacts: (state) => {
      state.contacts = [];
      state.searchQuery = '';
    },
  },
});

export const { setContacts, setSelectedContact, setSearchQuery, setLoading, setError, resetContacts } = contactsSlice.actions;
export default contactsSlice.reducer; // Changed from export default contactsSlice