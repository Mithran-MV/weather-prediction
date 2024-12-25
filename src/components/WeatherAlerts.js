const WeatherAlerts = ({ alerts }) => {
    if (!alerts || !alerts.alert.length) {
      return (
        <div className="bg-green-100 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-bold text-green-700">No Active Alerts</h3>
        </div>
      );
    }
  
    return (
      <div className="bg-red-100 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-red-700 mb-4">Weather Alerts</h2>
        {alerts.alert.map((alert, index) => (
          <div key={index} className="mb-4">
            <h3 className="font-semibold">{alert.headline}</h3>
            <p>{alert.desc}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default WeatherAlerts;
  