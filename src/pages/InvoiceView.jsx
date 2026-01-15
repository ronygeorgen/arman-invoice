import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { fetchInvoiceByToken, saveInvoiceSignature, verifyPaymentStatus } from '../features/invoice/invoiceThunks';
import { useDispatch } from 'react-redux';
import { axiosInstance } from '../services/api';
import SignaturePad from '../components/SignatureCanvas';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  CreditCard
} from 'lucide-react';

const InvoiceView = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [savingSignature, setSavingSignature] = useState(false);
  const [signatureMessage, setSignatureMessage] = useState(null);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!token) {
        setError('Invalid invoice token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await dispatch(fetchInvoiceByToken(token));
        
        if (result.success) {
          setInvoice(result.data);
        } else {
          setError(result.error || 'Failed to load invoice');
        }
      } catch (err) {
        setError('An error occurred while loading the invoice');
        console.error('Error loading invoice:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [token, dispatch]);

  // Check for payment status in URL params and verify payment
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      // Verify payment status with backend and update invoice
      const verifyPayment = async () => {
        try {
          setPaymentMessage({ type: 'info', text: 'Verifying payment status...' });
          
          // Verify payment with Stripe
          const verifyResult = await dispatch(verifyPaymentStatus(token));
          
          if (verifyResult.success) {
            if (verifyResult.data.status === 'paid') {
              setPaymentMessage({ 
                type: 'success', 
                text: 'Payment successful! Your invoice has been marked as paid.' 
              });
            } else {
              setPaymentMessage({ 
                type: 'info', 
                text: `Payment status: ${verifyResult.data.status}. Please wait a moment and refresh.` 
              });
            }
          } else {
            setPaymentMessage({ 
              type: 'warning', 
              text: verifyResult.error || 'Payment verification failed. Please refresh the page.' 
            });
          }
          
      // Reload invoice to get updated status
          const result = await dispatch(fetchInvoiceByToken(token));
          if (result.success) {
            setInvoice(result.data);
          }
        } catch (err) {
          console.error('Error verifying payment:', err);
          setPaymentMessage({ 
            type: 'warning', 
            text: 'Payment verification failed. Please refresh the page to see updated status.' 
          });
          // Still try to reload invoice
        dispatch(fetchInvoiceByToken(token)).then(result => {
          if (result.success) {
            setInvoice(result.data);
          }
        });
        }
      };
      
      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
      setPaymentMessage({ type: 'warning', text: 'Payment was cancelled. You can try again when ready.' });
    }
  }, [searchParams, token, dispatch]);

  const handleSignatureSave = async (signatureData) => {
    if (!token) return;

    try {
      setSavingSignature(true);
      setSignatureMessage(null);

      const result = await dispatch(saveInvoiceSignature(token, signatureData));
      
      if (result.success) {
        setSignatureMessage({ type: 'success', text: 'Signature saved successfully!' });
        // Reload invoice to get updated signature
        setTimeout(() => {
          dispatch(fetchInvoiceByToken(token)).then(result => {
            if (result.success) {
              setInvoice(result.data);
            }
          });
        }, 500);
      } else {
        setSignatureMessage({ type: 'error', text: result.error || 'Failed to save signature. Please try again.' });
      }
    } catch (err) {
      console.error('Error saving signature:', err);
      setSignatureMessage({ 
        type: 'error', 
        text: 'Failed to save signature. Please try again.' 
      });
    } finally {
      setSavingSignature(false);
    }
  };

  const handlePayment = async () => {
    if (!token) return;

    // Check if signature is required
    if (!invoice?.signature) {
      setPaymentMessage({ 
        type: 'error', 
        text: 'Please sign the invoice before proceeding with payment.' 
      });
      return;
    }

    try {
      setProcessingPayment(true);
      setPaymentMessage(null);

      const response = await axiosInstance.post(`/api/invoice/${token}/create-checkout-session/`);
      
      if (response.data && response.data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.checkout_url;
      } else {
        setPaymentMessage({ type: 'error', text: 'Failed to create payment session. Please try again.' });
        setProcessingPayment(false);
      }
    } catch (err) {
      console.error('Error creating payment session:', err);
      setPaymentMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Failed to initiate payment. Please try again.' 
      });
      setProcessingPayment(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice?.currency || 'USD'
    }).format(num);
  };

  const calculateItemTotal = (item) => {
    const amount = parseFloat(item.amount) || 0;
    const quantity = parseFloat(item.quantity) || 1;
    return amount * quantity;
  };

  const calculateTax = (item) => {
    if (!item.taxes || item.taxes.length === 0) return 0;
    const itemTotal = calculateItemTotal(item);
    let taxTotal = 0;
    
    item.taxes.forEach(tax => {
      const rate = parseFloat(tax.rate) || 0;
      if (tax.calculation === 'exclusive') {
        taxTotal += itemTotal * (rate / 100);
      } else {
        // Inclusive tax
        taxTotal += itemTotal - (itemTotal / (1 + rate / 100));
      }
    });
    
    return taxTotal;
  };

  const calculateSubtotal = () => {
    if (!invoice?.items) return 0;
    return invoice.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateTotalTax = () => {
    if (!invoice?.items) return 0;
    return invoice.items.reduce((sum, item) => sum + calculateTax(item), 0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Paid' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'Sent' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText, label: 'Draft' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'Overdue' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle, label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-600">{error || 'The invoice you are looking for does not exist or has been removed.'}</p>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const totalTax = calculateTotalTax();
  const total = parseFloat(invoice.total) || (subtotal + totalTax);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto print:max-w-full">
        {/* Invoice Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {invoice.business?.logo_url && (
                  <img 
                    src={invoice.business.logo_url} 
                    alt={invoice.business.name}
                    className="w-16 h-16 rounded-lg bg-white p-2 object-contain"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">INVOICE</h1>
                  <p className="text-blue-100 text-sm">#{invoice.invoice_number || 'N/A'}</p>
                </div>
              </div>
              <div className="text-right">
                {getStatusBadge(invoice.status)}
              </div>
            </div>
          </div>

          {/* Invoice Details Section */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Business Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  From
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold text-gray-900">{invoice.business?.name}</p>
                  
                  {/* Business details for TruShine Window Cleaning (location_id: b8qvo7VooP3JD3dIZU42) */}
                  {invoice.location_id === 'b8qvo7VooP3JD3dIZU42' && (
                    <>
                      <p className="text-sm text-gray-600">TRUSHINE WINDOW CLEANING LLC</p>
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        trushinehouston@gmail.com
                      </p>
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        +1 832-713-3545
                      </p>
                      <p className="text-sm flex items-start gap-1">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        3525 Murdock St, Houston, TX, 77047, United States
                      </p>
                    </>
                  )}
                  
                  {invoice.business?.logo_url && (
                    <div className="mt-2">
                      <img 
                        src={invoice.business.logo_url} 
                        alt={invoice.business.name}
                        className="h-12 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Bill To
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold text-gray-900">{invoice.contact?.name}</p>
                  {invoice.contact?.company_name && (
                    <p className="text-sm">{invoice.contact.company_name}</p>
                  )}
                  {invoice.contact?.address && (
                    <p className="text-sm flex items-start gap-1">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {invoice.contact.address}
                    </p>
                  )}
                  {invoice.contact?.email && (
                    <p className="text-sm flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {invoice.contact.email}
                    </p>
                  )}
                  {invoice.contact?.phone && (
                    <p className="text-sm flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {invoice.contact.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Info Section */}
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Invoice Number
                </p>
                <p className="font-semibold text-gray-900">#{invoice.invoice_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Issue Date
                </p>
                <p className="font-semibold text-gray-900">{formatDate(invoice.issue_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </p>
                <p className="font-semibold text-gray-900">{formatDate(invoice.due_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Amount Due
                </p>
                <p className="font-semibold text-gray-900">{formatCurrency(invoice.amount_due)}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Tax</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => {
                      const itemTotal = calculateItemTotal(item);
                      const itemTax = calculateTax(item);
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right text-gray-700">{item.quantity}</td>
                          <td className="py-4 px-4 text-right text-gray-700">{formatCurrency(item.amount)}</td>
                          <td className="py-4 px-4 text-right text-gray-700">
                            {itemTax > 0 ? formatCurrency(itemTax) : '-'}
                          </td>
                          <td className="py-4 px-4 text-right font-semibold text-gray-900">
                            {formatCurrency(itemTotal + itemTax)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Section */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {totalTax > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Tax:</span>
                  <span className="font-medium">{formatCurrency(totalTax)}</span>
                </div>
              )}
              {invoice.amount_paid > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Amount Paid:</span>
                  <span className="font-medium">{formatCurrency(invoice.amount_paid)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              {invoice.amount_due > 0 && (
                <div className="flex justify-between text-lg font-bold text-red-600 pt-2">
                  <span>Amount Due:</span>
                  <span>{formatCurrency(invoice.amount_due)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Signature Section */}
          {invoice.signature && (
            <div className="px-8 py-6 border-t border-gray-200 bg-white">
              <div className="max-w-2xl mx-auto">
                <SignaturePad
                  onSave={handleSignatureSave}
                  initialSignature={invoice.signature}
                  signedAt={invoice.signed_at}
                  disabled={true}
                />
              </div>
            </div>
          )}
          
          {/* Signature Section - Editable (only if not paid and amount due) */}
          {!invoice.is_paid && invoice.amount_due > 0 && !invoice.signature && (
            <div className="px-8 py-6 border-t border-gray-200 bg-white">
              <div className="max-w-2xl mx-auto">
                <SignaturePad
                  onSave={handleSignatureSave}
                  initialSignature={invoice.signature}
                  signedAt={invoice.signed_at}
                  disabled={savingSignature}
                />
                
                {signatureMessage && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    signatureMessage.type === 'success' ? 'bg-green-50 border border-green-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      signatureMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {signatureMessage.text}
                    </p>
                  </div>
                )}
                
                {savingSignature && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <p className="text-sm">Saving signature...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Message */}
          {paymentMessage && (
            <div className={`px-8 py-4 border-t border-gray-200 ${
              paymentMessage.type === 'success' ? 'bg-green-50' :
              paymentMessage.type === 'error' ? 'bg-red-50' :
              paymentMessage.type === 'info' ? 'bg-blue-50' : 'bg-yellow-50'
            }`}>
              <div className="max-w-md mx-auto text-center">
                <p className={`text-sm font-medium ${
                  paymentMessage.type === 'success' ? 'text-green-800' :
                  paymentMessage.type === 'error' ? 'text-red-800' :
                  paymentMessage.type === 'info' ? 'text-blue-800' : 'text-yellow-800'
                }`}>
                  {paymentMessage.text}
                </p>
              </div>
            </div>
          )}

          {/* Payment Button Section */}
          {!invoice.is_paid && invoice.amount_due > 0 && (
            <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200">
              <div className="max-w-md mx-auto text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Required</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {!invoice.signature 
                    ? 'Please sign the invoice above before proceeding with payment.'
                    : 'Please complete your payment to finalize this invoice.'}
                </p>
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePayment}
                  disabled={processingPayment || !invoice.signature}
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay {formatCurrency(invoice.amount_due)}
                    </>
                  )}
                </button>
                {!invoice.signature && (
                  <p className="mt-3 text-xs text-amber-600">
                    ⚠️ Signature required to proceed with payment
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Paid Status */}
          {invoice.is_paid && (
            <div className="px-8 py-6 bg-green-50 border-t border-gray-200">
              <div className="max-w-md mx-auto text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">Payment Received</h3>
                <p className="text-sm text-green-700">
                  Thank you for your payment. This invoice has been marked as paid.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-100 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Thank you for your business!</p>
            {invoice.business?.name && (
              <p className="mt-1">{invoice.business.name}</p>
            )}
          </div>
        </div>

        {/* Print Button */}
        <div className="mt-6 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FileText className="w-5 h-5" />
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;

