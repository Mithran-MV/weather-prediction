import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL;
const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export const getWeatherData = async (lat, lon) => {
  try {
    // Fetch current weather, forecast, and air quality
    const forecastResponse = await axios.get(`${baseUrl}/forecast.json`, {
      params: {
        key: apiKey,
        q: `${lat},${lon}`,
        days: 3,
        aqi: "yes",
        alerts: "yes",
      },
    });

    // Fetch historical weather data for the past 7 days
    const today = new Date();
    const pastWeek = new Date(today);
    pastWeek.setDate(pastWeek.getDate() - 7);

    const historyResponse = await axios.get(`${baseUrl}/history.json`, {
      params: {
        key: apiKey,
        q: `${lat},${lon}`,
        dt: pastWeek.toISOString().split("T")[0],
        end_dt: today.toISOString().split("T")[0],
      },
    });

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
