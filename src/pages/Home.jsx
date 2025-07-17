"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { searchContacts } from "../features/contacts/contactsThunks"
import { fetchServices } from "../features/fservices/servicesThunks"
import { useDebounce } from "../hooks/useDebounce"
import Navbar from "../components/Navbar"
import ServiceCheckbox from "../components/ServiceCheckbox"
import { setSelectedContact } from "../features/contacts/contactsSlice"
import { axiosInstance } from "../services/api"
import { Search, User, FileText, Plus, Check, Loader2, Sparkles } from "lucide-react"
import SelectedServicesList from "../components/SelectedServicesList"
import AssignedPeopleSelector from '../components/AssignedPeopleSelector';
import { resetSelectedServices } from '../features/fservices/servicesSlice';
import { resetSelectedPeople } from '../features/assignedPeople/assignedPeopleSlice';
import { Link } from 'react-router-dom';
import { logoutUser } from '../features/auth/authThunks';
const Home = () => {
  const dispatch = useDispatch()
  const [invoiceTitle, setInvoiceTitle] = useState("")
  const [contactSearch, setContactSearch] = useState("")
  const [serviceSearch, setServiceSearch] = useState("")

  const debouncedContactSearch = useDebounce(contactSearch, 500)
  const debouncedServiceSearch = useDebounce(serviceSearch, 500)

  // Safely access Redux state with defaults
  const { contacts = [], selectedContact, loading: contactsLoading } = useSelector((state) => state.contacts || {})
  const [isFirstTime, setIsFirstTime] = useState(false);

  const handleLogout = () => {
  dispatch(logoutUser());
};

  const {
    services = [],
    selectedServices = [],
    loading: servicesLoading,
  } = useSelector((state) => state.services || {})

  const handleSelectContact = (contact) => {
    dispatch(setSelectedContact(contact))
    setContactSearch(`${contact.first_name} ${contact.last_name}`)
  }

  useEffect(() => {
    if (debouncedContactSearch) {
      dispatch(searchContacts(debouncedContactSearch))
    }
  }, [debouncedContactSearch, dispatch])

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken && debouncedServiceSearch !== "") {
      dispatch(fetchServices(debouncedServiceSearch))
    }
  }, [debouncedServiceSearch, dispatch])

  const {
    selectedPeople = [], // Add this line
  } = useSelector((state) => state.assignedPeople || {});

  const handleCreateInvoice = async () => {
  if (!selectedContact || selectedServices.length === 0 ) {
    alert("Please select a contact and at least one service");
    return;
  }

  // Prepare line items with prices
  const service = selectedServices.map(service => ({
    // service_id: service.id,
    name: service.name,
    description: service.description,
    price: parseFloat(service.price) || 0,
    quantity: 1 // You can add quantity field if needed
  }));

  console.log("Selected Services:", service);
  
  const assigned_people_ids = selectedPeople.map(person => person.user_id);

  const invoiceData = {
    title: invoiceTitle,
    contact_id: selectedContact.contact_id,
    assigned_to: assigned_people_ids,
    service, // Send the array of services with prices
    is_first_time: isFirstTime,
  };

  try {
    const response = await axiosInstance.post("/create/job/", invoiceData);
    alert("Invoice created successfully!");
    console.log("Invoice response:", response.data);
    resetForm();
  } catch (error) {
    console.error("Error creating invoice:", error);
    alert("Failed to create invoice");
  }
}; 

const resetForm = () => {
  
  setInvoiceTitle("");
  setContactSearch("");
  setServiceSearch("");
  
  
  dispatch(setSelectedContact(null)); 
  dispatch(resetSelectedServices()); 
  dispatch(resetSelectedPeople()); 
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Make Navbar fixed and add z-index to ensure it stays above other content */}
        <div className="fixed top-0 left-0 right-0 z-50">
  <nav className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold text-indigo-600">Work Order Creator</span>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link
              to="/"
              className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              Work Order Creation
            </Link>
            <Link
              to="/payroll"
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              Payroll
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</div>
        
      {/* Hero Section */}
      

      {/* Main Content */}
      <div className="mt-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">New Work Order Creation</h2>
                <p className="text-blue-100">Fill in the details below to create your Work Order </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Invoice Title */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4" />
                Work Order Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  placeholder="Enter a descriptive title for your Work Order"
                />
              </div>
            </div>

            {/* Contact Search */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4" />
                Select Contact
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search by name, phone, or email"
                />
                {contactsLoading && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Contact Results */}
              {debouncedContactSearch && contacts.length > 0 && !contactsLoading && (
                <div className="space-y-2 max-h-64 overflow-y-auto bg-white rounded-2xl border border-gray-200 p-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedContact?.id === contact.id
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {contact.first_name} {contact.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{contact.phone}</p>
                          {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                        </div>
                        {selectedContact?.id === contact.id && (
                          <div className="p-1 bg-blue-500 rounded-full">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Contact Display */}
              {selectedContact && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">
                        Selected: {selectedContact.first_name} {selectedContact.last_name}
                      </p>
                      <p className="text-sm text-green-600">{selectedContact.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Services Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Plus className="w-4 h-4" />
                Line Items (Services)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Search for services to add"
                />
                {servicesLoading && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>

              {/* Services List */}
              {/* <div className="space-y-3">
                {services.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                    {services.map((service) => (
                      <ServiceCheckbox key={service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  !servicesLoading &&
                  serviceSearch && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No services found</p>
                    </div>
                  )
                )}
              </div> */}
            </div>

            <div className="space-y-3">
              {/* Existing Services Search and List */}
              {services.length > 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                  {services.map((service) => (
                    <ServiceCheckbox key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                !servicesLoading &&
                serviceSearch && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No services found</p>
                  </div>
                )
              )}
              
              {/* Add this new Selected Services List */}
              <SelectedServicesList />
            </div>

            <AssignedPeopleSelector />

            {/* First Time Work Order Checkbox */}
            <div className="flex items-center space-x-2 pt-4">
              <input
                type="checkbox"
                id="firstTimeCheckbox"
                checked={isFirstTime}
                onChange={(e) => setIsFirstTime(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="firstTimeCheckbox" className="text-sm font-medium text-gray-700">
                Is it your first time work order creation?
              </label>
            </div>

            {/* Create Invoice Button */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleCreateInvoice}
                disabled={!invoiceTitle || !selectedContact || selectedServices.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Create Work Order
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* In your Home component's stats cards section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-gray-900">
                  ${selectedServices.reduce((total, service) => total + (parseFloat(service.price) || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Selected Services</p>
                <p className="font-semibold text-gray-900">{selectedServices.length} items</p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Invoice Status</p>
                <p className="font-semibold text-gray-900">
                  {invoiceTitle && selectedContact && selectedServices.length > 0 ? "Ready" : "Incomplete"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
