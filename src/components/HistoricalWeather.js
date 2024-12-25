const HistoricalWeather = ({ history }) => {
    if (!history) return null;
  
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Historical Weather (Last 7 Days)</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {history.map((day, index) => (
            <div
              key={index}
              className="card bg-yellow-50 border border-yellow-200 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-yellow-700">{day.date}</h3>
              <p className="text-gray-600 flex items-center mt-2">
                <img
                  src={day.day.condition.icon}
                  alt={day.day.condition.text}
                  className="h-6 w-6 mr-2"
                />
                {day.day.condition.text}
              </p>
              <p className="text-gray-800 font-semibold mt-2">Max Temp: {day.day.maxtemp_c}°C</p>
              <p className="text-gray-800 font-semibold">Min Temp: {day.day.mintemp_c}°C</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default HistoricalWeather;
  