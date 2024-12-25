const Forecast = ({ forecast }) => {
  if (!forecast) return null;

  const forecastDays = [
    { label: "Tomorrow", data: forecast.forecastday[0] },
    { label: "Day 2", data: forecast.forecastday[1] },
    { label: "Day 3", data: forecast.forecastday[2] },
  ];

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
        Forecasted Weather
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {forecastDays.map((day, index) => (
          <div
            key={index}
            className="bg-yellow-50 border border-yellow-200 p-4 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all"
          >
            <h3 className="text-lg font-bold text-yellow-600">{day.label}</h3>
            <p className="text-gray-600 flex items-center mt-2">
              <img
                src={day.data.day.condition.icon}
                alt={day.data.day.condition.text}
                className="w-6 h-6 mr-2"
              />
              {day.data.day.condition.text}
            </p>
            <p className="mt-2">
              <span className="font-bold">Max Temp:</span> {day.data.day.maxtemp_c}°C
            </p>
            <p>
              <span className="font-bold">Min Temp:</span> {day.data.day.mintemp_c}°C
            </p>
            <p className="mt-2">
              <span className="font-bold">Sunrise:</span> {day.data.astro.sunrise}
            </p>
            <p>
              <span className="font-bold">Sunset:</span> {day.data.astro.sunset}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Forecast;
