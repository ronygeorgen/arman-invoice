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

export const fetchInvoiceByToken = (token) => async (dispatch) => {
  try {
    const response = await axiosInstance.get(`/api/invoice/${token}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.response?.data?.detail || 'Failed to fetch invoice' 
    };
  }
};

export const saveInvoiceSignature = (token, signature) => async () => {
  try {
    const response = await axiosInstance.post(`/api/invoice/${token}/signature/`, {
      signature: signature
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to save signature' 
    };
  }
};

export const verifyPaymentStatus = (token) => async () => {
  try {
    const response = await axiosInstance.post(`/api/invoice/${token}/verify-payment/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to verify payment status' 
    };
  }
};