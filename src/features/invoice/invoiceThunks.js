import { axiosInstance } from '../../services/api';

export const createInvoice = (invoiceData) => async () => {
  try {
    const response = await axiosInstance.post('/api/save-invoice/', invoiceData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create invoice' 
    };
  }
};