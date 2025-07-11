import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchContacts } from '../features/contacts/contactsThunks';
import { fetchServices } from '../features/fservices/servicesThunks';
import { toggleServiceSelection } from '../features/fservices/servicesSlice';
import { useDebounce } from '../hooks/useDebounce';
import Navbar from '../components/Navbar';
import ServiceCheckbox from '../components/ServiceCheckbox';

const Home = () => {
  const dispatch = useDispatch();
  const [invoiceTitle, setInvoiceTitle] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  
  const debouncedContactSearch = useDebounce(contactSearch, 500);
  const debouncedServiceSearch = useDebounce(serviceSearch, 500);
  
  // Safely access Redux state with defaults
  const { contacts = [], loading: contactsLoading = false } = useSelector((state) => state.contacts || {});
  const { services = [], selectedServices = [], loading: servicesLoading = false } = useSelector((state) => state.services || {});

  useEffect(() => {
    if (debouncedContactSearch) {
      dispatch(searchContacts(debouncedContactSearch));
    }
  }, [debouncedContactSearch, dispatch]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && debouncedServiceSearch !== '') {
      dispatch(fetchServices(debouncedServiceSearch));
    }
  }, [debouncedServiceSearch, dispatch]);

  const handleCreateInvoice = () => {
    console.log('Creating invoice with:', {
      title: invoiceTitle,
      contact: contactSearch,
      services: selectedServices,
    });
    alert('Invoice creation functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Invoice</h3>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Invoice Title */}
                <div>
                  <label htmlFor="invoice-title" className="block text-sm font-medium text-gray-700">
                    Invoice Title
                  </label>
                  <input
                    type="text"
                    id="invoice-title"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={invoiceTitle}
                    onChange={(e) => setInvoiceTitle(e.target.value)}
                    placeholder="Enter invoice title"
                  />
                </div>
                
                {/* Contact Search */}
                <div>
                  <label htmlFor="contact-search" className="block text-sm font-medium text-gray-700">
                    Search Contact
                  </label>
                  <input
                    type="text"
                    id="contact-search"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search by name, phone, or email"
                  />
                  
                  {contactsLoading && (
                    <div className="mt-2 text-sm text-gray-500">Searching contacts...</div>
                  )}
                  
                  {debouncedContactSearch && contacts.length > 0 && !contactsLoading && (
                    <div className="mt-2 space-y-2">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="p-2 border border-gray-200 rounded-md">
                          <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                          <p className="text-sm text-gray-600">{contact.phone}</p>
                          {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {debouncedContactSearch && contacts.length === 0 && !contactsLoading && (
                    <div className="mt-2 text-sm text-gray-500">No contacts found</div>
                  )}
                </div>
                
                {/* Services Selection */}
                <div>
                  <label htmlFor="service-search" className="block text-sm font-medium text-gray-700">
                    Line Items (Services)
                  </label>
                  <input
                    type="text"
                    id="service-search"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search services"
                  />
                  
                  {servicesLoading && (
                    <div className="mt-2 text-sm text-gray-500">Loading services...</div>
                  )}
                  
                  <div className="mt-4 space-y-4">
                    {services.map((service) => (
                      <ServiceCheckbox key={service.id} service={service} />
                    ))}
                    
                    {services.length === 0 && !servicesLoading && (
                      <p className="text-sm text-gray-500">No services found</p>
                    )}
                  </div>
                </div>
                
                {/* Create Invoice Button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateInvoice}
                    disabled={!invoiceTitle || selectedServices.length === 0}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;