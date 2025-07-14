import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import contactsReducer from './features/contacts/contactsSlice';
import servicesReducer from './features/fservices/servicesSlice';
import assignedPeopleReducer from './features/assignedPeople/assignedPeopleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    services: servicesReducer,
    assignedPeople: assignedPeopleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;