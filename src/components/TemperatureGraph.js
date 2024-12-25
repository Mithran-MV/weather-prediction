import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";
  import { Line } from "react-chartjs-2";
  
  // Register components
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  
  const TemperatureGraph = ({ history, current, forecast }) => {
    if (!history || !current || !forecast) return null;
  
    // Combine labels (dates) for historical, current, and forecast data
    const labels = [
      ...history.map((day) => day.date),
      "Today",
      ...forecast.forecastday.map((day) => day.date),
    ];
  
    // Combine max temperature data
    const maxTemps = [
      ...history.map((day) => day.day.maxtemp_c),
      current.temp_c, // Real-time temperature
      ...forecast.forecastday.map((day) => day.day.maxtemp_c),
    ];
  
    // Combine min temperature data
    const minTemps = [
      ...history.map((day) => day.day.mintemp_c),
      current.temp_c, // Real-time temperature
      ...forecast.forecastday.map((day) => day.day.mintemp_c),
    ];
  
    const data = {
      labels,
      datasets: [
        {
          label: "Max Temperature (°C)",
          data: maxTemps,
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Min Temperature (°C)",
          data: minTemps,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: true,
          tension: 0.4,
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
          title: {
            display: true,
            text: "Temperature (°C)",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      },
    };
  
    return (
      <div className="bg-white p-6 rounded shadow-md mt-4">
        <h2 className="text-2xl font-bold mb-4 text-center">Temperature Trends</h2>
        <Line data={data} options={options} />
      </div>
    );
  };
  
  export default TemperatureGraph;
  