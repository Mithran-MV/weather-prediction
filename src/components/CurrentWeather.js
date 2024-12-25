const CurrentWeather = ({ data, location }) => {
  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-yellow-600">
        {location.name}
      </h3>
      <p className="text-gray-600">{data.condition.text}</p>
      <p className="mt-2 text-3xl font-semibold text-yellow-700">
        Temperature: {data.temp_c}°C
      </p>
      <div className="mt-4">
        <p className="text-gray-700">
          <span className="font-bold">Humidity:</span> {data.humidity}%
        </p>
        <p className="text-gray-700">
          <span className="font-bold">Wind:</span> {data.wind_kph} kph
        </p>
      </div>
    </div>
  );
};

export default CurrentWeather;
