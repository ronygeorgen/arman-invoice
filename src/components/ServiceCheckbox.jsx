// ServiceCheckbox.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleServiceSelection, updateServicePrice } from '../features/fservices/servicesSlice';
import { Check } from 'lucide-react';

const ServiceCheckbox = ({ service }) => {
  const dispatch = useDispatch();
  const selectedServices = useSelector((state) => state.services.selectedServices);
  const isSelected = selectedServices.some(item => item.id === service.id);
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (isSelected) {
      const selectedService = selectedServices.find(item => item.id === service.id);
      setPrice(selectedService?.price || '');
    }
  }, [isSelected, selectedServices, service.id]);

  const handleToggle = () => {
    dispatch(toggleServiceSelection({ 
      id: service.id, 
      price: price || service.price || 0 
    }));
  };

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPrice(newPrice);
    if (isSelected) {
      dispatch(updateServicePrice({ 
        id: service.id, 
        price: newPrice || 0 
      }));
    }
  };

 return (
  <div className={`p-4 rounded-xl border transition-all duration-200 ${
    isSelected 
      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' 
      : 'bg-white border-gray-200'
  }`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleToggle}
          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <p className="font-semibold text-gray-900">{service.name}</p>
          <p className="text-sm text-gray-600">{service.description}</p>
        </div>
      </div>
      
      {isSelected ? (
        <div className="p-1 bg-blue-500 rounded-full">
          <Check className="w-4 h-4 text-white" />
        </div>
      ) : (
        <div className="text-gray-400">${service.price || '0.00'}</div>
      )}
    </div>
  </div>
);
};

export default ServiceCheckbox;