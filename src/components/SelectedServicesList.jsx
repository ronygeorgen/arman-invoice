import { useDispatch, useSelector } from 'react-redux';
import { updateServicePrice, removeSelectedService } from '../features/fservices/servicesSlice';

const SelectedServicesList = () => {
  const dispatch = useDispatch();
  // Get selectedServices from Redux store with a default empty array
  const selectedServices = useSelector((state) => state.services?.selectedServices || []);
  // Get all services from Redux store with a default empty array
  const allServices = useSelector((state) => state.services?.allFetchedServices || []);

  const getServiceDetails = (id) => {
    return allServices.find(service => service.id === id) || {};
  };

  const handlePriceChange = (id, newPrice) => {
    dispatch(updateServicePrice({ id, price: newPrice }));
  };

  const handleRemoveService = (id) => {
    dispatch(removeSelectedService(id));
  }; 

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <h3 className="font-semibold text-gray-700 mb-3">Selected Services</h3>
      {selectedServices.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No services selected yet</p>
      ) : (
        <div className="space-y-3">
          {selectedServices.map((selectedService) => {
            const service = getServiceDetails(selectedService.id);
            return (
              <div key={selectedService.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{service?.name || 'Unknown Service'}</p>
                    <p className="text-sm text-gray-600">{service?.description || ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">$</span>
                      <input
                        type="number"
                        value={selectedService.price || ''}
                        onChange={(e) => handlePriceChange(selectedService.id, e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveService(selectedService.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                      aria-label="Remove service"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SelectedServicesList;