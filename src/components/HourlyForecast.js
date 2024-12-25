import { Line } from "react-chartjs-2";

const HourlyForecast = ({ hourly }) => {
  const labels = hourly.map((hour) => `${new Date(hour.time).getHours()}:00`);
  const temperatures = hourly.map((hour) => hour.temp_c);

  const data = {
    labels,
    datasets: [
      {
        label: "Hourly Temperature (°C)",
        data: temperatures,
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded shadow-md mt-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Hourly Temperature Forecast</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default HourlyForecast;
