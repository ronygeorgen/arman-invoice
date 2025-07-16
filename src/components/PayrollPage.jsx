import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayrollData } from '../features/payroll/payrollSlice';
import { FileText, DollarSign, User, Calendar, Loader2, ChevronDown, ChevronUp, Edit, Check, X as CloseIcon , X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logoutUser } from '../features/auth/authThunks';
import { updateUserPercentage } from '../features/payroll/payrollSlice';

const PayrollPage = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.payroll);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [percentageValue, setPercentageValue] = useState('');

  useEffect(() => {
    dispatch(fetchPayrollData());
  }, [dispatch]);


   const handleViewPayouts = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.user_id);
    setPercentageValue(user.percentage.toString());
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setPercentageValue('');
  };

  const handleSavePercentage = async (userId) => {
    console.log(`Saving percentage for user ${userId}: ${percentageValue}`);
    try {
      await dispatch(updateUserPercentage({
        userId,
        percentage: percentageValue
      })).unwrap();
      setEditingUserId(null);
      dispatch(fetchPayrollData()); // Refresh data after update
    } catch (error) {
      console.error('Failed to update percentage:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Fixed Navbar */}
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
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Invoice
                  </Link>
                  <Link
                    to="/payroll"
                    className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Payroll
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => dispatch(logoutUser())}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Payroll Management</h2>
                <p className="text-blue-100">View and manage employee payouts</p>
              </div>
            </div>
          </div>

          {/* Data Loading State */}
          {loading && (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500 mr-3" />
              <span className="text-gray-600">Loading payroll data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">Error loading payroll data: {error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Data Display */}
          {!loading && !error && (
            <div className="p-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Payout</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((employee) => (
                    <tr key={employee.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${employee.total_payout.toFixed(2)}
                        </div>
                      </td>
                      {/* Percentage Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === employee.user_id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={percentageValue}
                          onChange={(e) => setPercentageValue(e.target.value)}
                          className="w-20 px-2 py-1 border rounded"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span>%</span>
                        <button 
                          onClick={() => handleSavePercentage(employee.user_id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:text-red-800"
                        >
                          <CloseIcon size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{employee?.percentage || '0'}%</span>
                        <button 
                          onClick={() => handleEditClick(employee)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewPayouts(employee)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                          <ChevronDown className="w-4 h-4 mr-1" />
                          View Payouts
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      </div>
      {/* Payout Details Modal */}
      {showModal && selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Payout Details for {selectedUser.name}
          </h3>
          <button 
            onClick={closeModal} 
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Total Payout: ${selectedUser.total_payout.toFixed(2)}
        </p>
      </div>
      
      {/* Scrollable content area */}
      <div className="px-6 py-4 overflow-y-auto flex-grow">
        <div className="space-y-4">
          {selectedUser.payouts.map((payout, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Opportunity ID</p>
                  <p className="mt-1 text-sm text-gray-900 break-all">
                    {payout.opportunity_id}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p className="mt-1 text-sm text-gray-900">
                    ${payout.amount.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(payout.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={closeModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default PayrollPage;