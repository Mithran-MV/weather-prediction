const AirQuality = ({ airQuality }) => {
    if (!airQuality) return null;
  
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-yellow-600">Air Quality Index</h3>
        <div className="mt-4 grid grid-cols-2 gap-2 text-gray-700">
          <p><span className="font-bold">CO:</span> {airQuality.co.toFixed(2)}</p>
          <p><span className="font-bold">NO2:</span> {airQuality.no2.toFixed(2)}</p>
          <p><span className="font-bold">O3:</span> {airQuality.o3.toFixed(2)}</p>
          <p><span className="font-bold">PM2.5:</span> {airQuality.pm2_5.toFixed(2)}</p>
          <p><span className="font-bold">PM10:</span> {airQuality.pm10.toFixed(2)}</p>
        </div>
      </div>
    );
  };
  
  export default AirQuality;
  