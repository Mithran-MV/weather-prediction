import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import CurrentWeather from "../components/CurrentWeather";
import Forecast from "../components/Forecast";
import HistoricalWeather from "../components/HistoricalWeather";
import WeatherAlerts from "../components/WeatherAlerts";
import AirQuality from "../components/AirQuality";
import TemperatureGraph from "../components/TemperatureGraph";
import HourlyForecast from "../components/HourlyForecast";
import { getWeatherData } from "../lib/weather";

const WeatherMap = dynamic(() => import("../components/WeatherMap"), { ssr: false });

const COLLEGE_DETAILS = {
  name: "Sri Venkateswara College of Engineering (SVCE)",
  location: "Sriperumbudur, Tamil Nadu, India",
  lat: 12.9687,
  lon: 79.9488,
  builtBy: "Dr. Vijayanand",
};

export default function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await getWeatherData(COLLEGE_DETAILS.lat, COLLEGE_DETAILS.lon);
        setWeatherData(data);
      } catch (err) {
        console.error("Error fetching weather data:", err.message);
        setError("Failed to fetch weather data. Please check the console for details.");
      }
    };

    fetchWeatherData();
  }, []);

  const Card = ({ children, className }) => (
    <div
      className={`bg-yellow-50 border border-yellow-200 p-4 rounded-md shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all ${className}`}
    >
      {children}
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white py-10">
        <div className="container mx-auto text-center">
          <img
            src="https://www.svce.ac.in/wp-content/uploads/2021/01/logo.png"
            alt="SVCE Logo"
            className="mx-auto mb-4 h-16"
          />
          <h1 className="text-4xl font-bold">{COLLEGE_DETAILS.name}</h1>
          <p className="text-lg mt-2">{`Real-time and forecast weather data for ${COLLEGE_DETAILS.location}`}</p>
          <p className="text-sm mt-1">Built by {COLLEGE_DETAILS.builtBy}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 container mx-auto">
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!error && !weatherData && (
          <p className="text-center text-gray-500">Loading weather data...</p>
        )}
        {weatherData && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CurrentWeather data={weatherData.current} location={COLLEGE_DETAILS} />
              </Card>
              <Card>
                <AirQuality airQuality={weatherData.airQuality} />
              </Card>
              <Card>
                <HourlyForecast hourly={weatherData.forecast.forecastday[0].hour} />
              </Card>
              <Card>
                <WeatherAlerts alerts={weatherData.alerts} />
              </Card>
            </div>
            <section className="mt-10">
              <Forecast forecast={weatherData.forecast} />
            </section>
            <div className="my-6">
              <HistoricalWeather history={weatherData.history} />
              <TemperatureGraph
                history={weatherData.history}
                current={weatherData.current}
                forecast={weatherData.forecast}
              />
            </div>
            <section className="mt-10">
              <Card>
                <WeatherMap location={COLLEGE_DETAILS} />
              </Card>
            </section>
          </>
        )}
      </main>

      {/* Footer Section */}
      <footer className="bg-yellow-600 text-white py-6 mt-10">
        <div className="container mx-auto text-center">
          <p className="text-sm">{COLLEGE_DETAILS.name}</p>
          <p className="text-sm">Real-time Weather Dashboard | Built by {COLLEGE_DETAILS.builtBy}</p>
          <p className="text-sm mt-2">
            For more information, visit our{" "}
            <a href="https://www.svce.ac.in" target="_blank" className="underline">
              official website
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
