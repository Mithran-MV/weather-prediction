import axios from "axios";

// Base API URL with the API key and location included
const apiUrl = "https://api.weatherapi.com/v1/forecast.json?key=d25f57f770c7415a9e880329242512&q=Sriperumbudur";

export const getWeatherData = async () => {
  try {
    // Fetch current weather, forecast, and air quality
    const forecastResponse = await axios.get(apiUrl, {
      params: {
        days: 3, // Fetch forecast for 3 days
        aqi: "yes", // Include air quality index
        alerts: "yes", // Include weather alerts
      },
    });

    // Calculate the date range for historical data (last 7 days)
    const today = new Date();
    const pastWeek = new Date(today);
    pastWeek.setDate(pastWeek.getDate() - 7);

    const historyUrl = `https://api.weatherapi.com/v1/history.json?key=d25f57f770c7415a9e880329242512&q=Sriperumbudur&dt=${pastWeek
      .toISOString()
      .split("T")[0]}&end_dt=${today.toISOString().split("T")[0]}`;

    // Fetch historical weather data for the past 7 days
    const historyResponse = await axios.get(historyUrl);

    return {
      current: forecastResponse.data.current,
      forecast: forecastResponse.data.forecast,
      alerts: forecastResponse.data.alerts,
      airQuality: forecastResponse.data.current.air_quality,
      history: historyResponse.data.forecast.forecastday,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};
