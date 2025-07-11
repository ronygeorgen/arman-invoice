import { useDispatch, useSelector } from 'react-redux';
import { toggleServiceSelection } from '../features/fservices/servicesSlice';

const ServiceCheckbox = ({ service }) => {
  const dispatch = useDispatch();
  const selectedServices = useSelector((state) => state.services.selectedServices);

  const isSelected = selectedServices.includes(service.id);

  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={`service-${service.id}`}
          name={`service-${service.id}`}
          type="checkbox"
          checked={isSelected}
          onChange={() => dispatch(toggleServiceSelection(service.id))}
          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={`service-${service.id}`} className="font-medium text-gray-700">
          {service.name}
        </label>
        <p className="text-gray-500">{service.description}</p>
      </div>
    </div>
  );
};

export default ServiceCheckbox;