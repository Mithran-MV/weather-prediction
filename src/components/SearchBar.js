import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    if (location.trim()) {
      onSearch(location);
    }
  };

  return (
    <div className="flex justify-center my-4">
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Enter location"
        className="p-2 border rounded-l"
      />
      <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded-r">
        Search
      </button>
    </div>
  );
};

export default SearchBar;
