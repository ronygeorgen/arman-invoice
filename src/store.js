import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import contactsReducer from './features/contacts/contactsSlice';
import servicesReducer from './features/fservices/servicesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    services: servicesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;