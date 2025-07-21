import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchPayrollData, 
  updateUserPercentage,
  updatePercentageLocally,
  startPercentageEdit,
  cancelPercentageEdit
} from '../features/payroll/payrollSlice';
import { FileText, DollarSign, User, Filter, Loader2, ChevronDown, X as CloseIcon, X, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logoutUser } from '../features/auth/authThunks';
import { axiosInstance } from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PayrollPage = () => {
  const dispatch = useDispatch();
  const { 
      data, 
      loading, 
      error, 
      percentageUpdates 
    } = useSelector((state) => state.payroll);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [filteredPayouts, setFilteredPayouts] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionRules, setCommissionRules] = useState([]);
  const [isSavingCommission, setIsSavingCommission] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState(null);
  const modalContentRef = useRef(null);

  const [filteredTotalPayout, setFilteredTotalPayout] = useState();

  const [originalCommissionRules, setOriginalCommissionRules] = useState([]);


  useEffect(() => {
    dispatch(fetchPayrollData());
  }, [dispatch]);

  useEffect(() => {
    // Scroll to bottom when new rule is added
    if (modalContentRef.current && commissionRules.length > 0) {
      modalContentRef.current.scrollTop = modalContentRef.current.scrollHeight;
    }
  }, [commissionRules.length]);

  const handleViewPayouts = (user) => {
    setSelectedUser(user);
    setFilteredPayouts(user.payouts);
    setShowModal(true);
    setDateRange([null, null]);
    setIsFiltering(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFilteredPayouts([]);
    setIsFiltering(false);
  };

  const applyFilter = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    try {
      setIsFilterLoading(true);
      setIsFiltering(true);
      setShowDatePicker(false);
      
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const response = await axiosInstance.get('/payroll/', {
        params: {
          user_id: selectedUser.user_id,
          start_date: formatDate(startDate),
          end_date: formatDate(endDate)
        }
      });
      setFilteredTotalPayout(response.data?.total_payout)      
      setFilteredPayouts(response.data.payouts || []);
    } catch (error) {
      console.error('Error filtering payouts:', error);
      setIsFiltering(false);
    } finally {
      setIsFilterLoading(false);
    }
  };

  const resetFilter = () => {
    setFilteredPayouts(selectedUser.payouts);
    setDateRange([null, null]);
    setIsFiltering(false);
  };

  const handleManageCommission = (user) => {

    const original = user.commission_rules ? JSON.parse(JSON.stringify(user.commission_rules)) : [];
    setOriginalCommissionRules(original);
    setCommissionRules(original); // editable version
    setSelectedUser(user);
    setShowCommissionModal(true);
    setEditingRuleIndex(null);
  };

  const handleAddCommissionRule = () => {
    const newNumEmployees = commissionRules.length > 0 
      ? Math.max(...commissionRules.map(rule => rule.num_other_employees)) + 1
      : 1;
    
    const newRule = {
      num_other_employees: newNumEmployees,
      commission_percentage: "0.00"
    };
    
    setCommissionRules([...commissionRules, newRule]);
    setEditingRuleIndex(commissionRules.length);
  };

  const handleCommissionPercentageChange = (index, value) => {
    const newRules = [...commissionRules];
    newRules[index] = {
      ...newRules[index],
      commission_percentage: value
    };
    setCommissionRules(newRules);
  };

 const handleRemoveCommissionRule = async (index) => {
    const newRules = [...commissionRules];
    newRules.splice(index, 1);
    
    // Update local state only after successful API call
    setCommissionRules(newRules);
    if (editingRuleIndex === index) {
      setEditingRuleIndex(null);
    } else if (editingRuleIndex > index) {
    // Adjust the index because one item is removed
    setEditingRuleIndex((prev) => prev - 1);
  }
};

  const handleEditRule = (index) => {
    setEditingRuleIndex(index === editingRuleIndex ? null : index);
  };

  const handleSaveCommissionRules = async () => {
    try {
      setIsSavingCommission(true);
      const payload = commissionRules.map(rule => ({
        id: rule.id,
        num_other_employees: rule.num_other_employees,
        commission_percentage: parseFloat(rule.commission_percentage)
      }));
      await axiosInstance.put(
        `/payroll/commission/${selectedUser.user_id}/`,
        {
          commission_rules: payload
        }
      );
      
      setShowCommissionModal(false);
      dispatch(fetchPayrollData());
    } catch (error) {
      console.error('Error saving commission rules:', error);
    } finally {
      setIsSavingCommission(false);
    }
  };

  const displayPayouts = isFiltering ? filteredPayouts : (selectedUser?.payouts || []);

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
                    Work Order Creation
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User's Percentage </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission Rules</th>
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
                        <td className="px-6 py-4 whitespace-nowrap">
  {employee.editingPercentage ? (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={employee.newPercentage ?? ''}
        onChange={(e) => dispatch(updatePercentageLocally({
          userId: employee.user_id,
          percentage: e.target.value === '' ? '' : parseFloat(e.target.value)
        }))}
        className="w-20 px-2 py-1 border rounded text-sm"
        min="0"
        max="100"
        step="0.01"
        placeholder="Enter percentage"
      />
      
      {percentageUpdates[employee.user_id]?.loading ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <>
          <button
            onClick={() => {
              if (employee.newPercentage !== undefined && employee.newPercentage !== '') {
                dispatch(updateUserPercentage({
                  userId: employee.user_id,
                  percentage: employee.newPercentage
                }));
              }
            }}
            disabled={employee.newPercentage === undefined || employee.newPercentage === ''}
            className={`${(employee.newPercentage === undefined || employee.newPercentage === '') ? 'text-gray-400' : 'text-green-600 hover:text-green-800'}`}
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => dispatch(cancelPercentageEdit(employee.user_id))}
            className="text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </>
      )}
      
      {percentageUpdates[employee.user_id]?.error && (
        <span className="text-xs text-red-500">
          {percentageUpdates[employee.user_id].error}
        </span>
      )}
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <span className="text-sm">{employee.percentage}%</span>
      <button
        onClick={() => dispatch(startPercentageEdit(employee.user_id))}
        className="text-indigo-600 hover:text-indigo-800"
      >
        <FileText size={16} />
      </button>
    </div>
  )}
</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleManageCommission(employee)}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200"
                          >
                            Manage
                          </button>
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
                Total Payout: $
                {isFiltering
                  ? filteredTotalPayout
                  : selectedUser.total_payout}
              </p>
            </div>
            
            {/* Filter Section */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter by date</span>
                  {isFiltering && (
                    <span className="ml-1 text-xs text-gray-500">
                      {startDate && endDate ? 
                        `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : 
                        'No date range selected'}
                    </span>
                  )}
                </button>
                
                {showDatePicker && (
                  <div className="absolute z-10 mt-2 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <DatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(update) => {
                        setDateRange(update);
                      }}
                      isClearable={true}
                      inline
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setDateRange([null, null]);
                          setShowDatePicker(false);
                        }}
                        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          applyFilter();
                        }}
                        disabled={!startDate || !endDate}
                        className={`px-3 py-1 text-sm text-white rounded ${
                          !startDate || !endDate 
                            ? 'bg-gray-400' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {isFiltering && (
                <button
                  onClick={resetFilter}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-4 h-4" />
                  Clear filter
                </button>
              )}
            </div>
            
            {/* Scrollable content area */}
            <div className="px-6 py-4 overflow-y-auto flex-grow">
              {isFilterLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-500 mr-3" />
                  <span className="text-gray-600">Loading payouts...</span>
                </div>
              ) : isFiltering && filteredPayouts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No payouts found for the selected date range
                </div>
              ) : (
                <div className="space-y-4">
                  {displayPayouts.map((payout, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Opportunity</p>
                          <p className="mt-1 text-sm text-gray-900 break-all">
                            {payout.opportunity_name || `ID: ${payout.opportunity_id}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Amount</p>
                          <p className="mt-1 text-sm text-gray-900">
                            ${payout.amount}
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
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Commission Management Modal */}
      {showCommissionModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Commission Rules for {selectedUser.name}
                </h3>
                <button 
                  onClick={() => setShowCommissionModal(false)} 
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div 
              className="px-6 py-4 overflow-y-auto flex-grow"
              ref={modalContentRef}
            >
              <div className="space-y-4">
                {commissionRules.map((rule, index) => (
  <div key={index} className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div className="font-medium">
        Working with {rule.num_other_employees} other:
      </div>
      <div className="flex items-center gap-2">
        {editingRuleIndex === index ? (
          <>
            <input
              type="number"
              value={rule.commission_percentage}
              onChange={(e) => handleCommissionPercentageChange(index, e.target.value)}
              className="w-20 px-2 py-1 border rounded"
              min="0"
              max="100"
              step="0.1"
            />
            <span>%</span>
            <button
              onClick={() => setEditingRuleIndex(null)}
              className="text-green-600 hover:text-green-800"
            >
              <Check size={16} />
            </button>
          </>
        ) : (
          <>
            <span>{rule.commission_percentage}%</span>
            <button
              onClick={() => handleEditRule(index)}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={() => handleRemoveCommissionRule(index)}
              className="text-red-600 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  </div>
))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={handleAddCommissionRule}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <Plus size={16} />
                Add Person
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCommissionModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={isSavingCommission}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCommissionRules}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center min-w-24"
                  disabled={isSavingCommission}
                >
                  {isSavingCommission ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;