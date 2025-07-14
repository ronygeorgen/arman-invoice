import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  togglePersonSelection, 
  removeSelectedPerson,
  setSearchQuery,
  resetPeople
} from "../features/assignedPeople/assignedPeopleSlice";
import { searchAssignedPeople } from "../features/assignedPeople/assignedPeopleThunks";
import { useDebounce } from "../hooks/useDebounce";
import { Check, User, X, Search, Loader2 } from "lucide-react";

const AssignedPeopleSelector = () => {
  const dispatch = useDispatch();
  const [localSearch, setLocalSearch] = useState("");
  const debouncedSearch = useDebounce(localSearch, 500);

  const { 
    people = [], 
    selectedPeople = [], 
    loading, 
    error
  } = useSelector((state) => state.assignedPeople || {});

  useEffect(() => {
    if (debouncedSearch) {
      dispatch(setSearchQuery(debouncedSearch));
      dispatch(searchAssignedPeople(debouncedSearch));
    } else {
      dispatch(resetPeople());
    }
  }, [debouncedSearch, dispatch]);

  const handleTogglePerson = (person) => {
    dispatch(togglePersonSelection(person));
    setLocalSearch(""); // Clear search input but don't reset people
  };

  const handleRemovePerson = (personId) => {
    dispatch(removeSelectedPerson(personId));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <User className="w-4 h-4" />
        Assign To
      </label>
      
      {/* Search Input - Always visible */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search team members to assign"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {/* People Results - Show whenever there's a search query */}
      {localSearch && people.length > 0 && !loading && (
        <div className="space-y-2 max-h-64 overflow-y-auto bg-white rounded-2xl border border-gray-200 p-2">
          {people
            .filter(person => !selectedPeople.some(selected => selected.id === person.id)) // Filter out already selected
            .map((person) => (
              <div
                key={person.id}
                className="p-4 rounded-xl cursor-pointer hover:bg-gray-50 border border-transparent transition-all duration-200"
                onClick={() => handleTogglePerson(person)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {person.first_name} {person.last_name}
                    </p>
                    {person.email && <p className="text-sm text-gray-600">{person.email}</p>}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Selected People Display - Always visible if there are selections */}
      {selectedPeople.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Assigned to:</p>
          {selectedPeople.map((person) => (
            <div key={person.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <span>
                {person.first_name} {person.last_name}
              </span>
              <button 
                onClick={() => handleRemovePerson(person.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 text-red-500 bg-red-50 rounded-xl">
          {error}
        </div>
      )}
    </div>
  );
};

export default AssignedPeopleSelector;