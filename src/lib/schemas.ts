import { z } from 'zod';

/**
 * Runtime contracts for the slice of the WeatherAPI.com payload this app uses.
 *
 * Parsing rather than trusting keeps a provider-side schema change from
 * surfacing as a cryptic `undefined is not an object` deep inside a chart.
 * Every field the UI reads is declared here; unknown extras are stripped.
 */

export const conditionSchema = z.object({
  text: z.string(),
  icon: z.string(),
  code: z.number(),
});

export const airQualitySchema = z
  .object({
    co: z.number().optional(),
    no2: z.number().optional(),
    o3: z.number().optional(),
    so2: z.number().optional(),
    pm2_5: z.number().optional(),
    pm10: z.number().optional(),
    'us-epa-index': z.number().optional(),
    'gb-defra-index': z.number().optional(),
  })
  .nullable()
  .optional();

export const locationSchema = z.object({
  name: z.string(),
  region: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
  tz_id: z.string(),
  localtime_epoch: z.number(),
  localtime: z.string(),
});

export const currentSchema = z.object({
  last_updated_epoch: z.number(),
  last_updated: z.string(),
  temp_c: z.number(),
  temp_f: z.number(),
  is_day: z.number(),
  condition: conditionSchema,
  wind_kph: z.number(),
  wind_mph: z.number(),
  wind_degree: z.number(),
  wind_dir: z.string(),
  pressure_mb: z.number(),
  precip_mm: z.number(),
  humidity: z.number(),
  cloud: z.number(),
  feelslike_c: z.number(),
  feelslike_f: z.number(),
  vis_km: z.number(),
  uv: z.number(),
  gust_kph: z.number(),
  air_quality: airQualitySchema,
});

export const hourSchema = z.object({
  time_epoch: z.number(),
  time: z.string(),
  temp_c: z.number(),
  temp_f: z.number(),
  is_day: z.number(),
  condition: conditionSchema,
  wind_kph: z.number(),
  wind_mph: z.number(),
  wind_dir: z.string(),
  precip_mm: z.number(),
  humidity: z.number(),
  feelslike_c: z.number(),
  feelslike_f: z.number(),
  chance_of_rain: z.number(),
  chance_of_snow: z.number(),
  uv: z.number(),
});

export const dayAstroSchema = z.object({
  sunrise: z.string(),
  sunset: z.string(),
  moonrise: z.string(),
  moonset: z.string(),
  moon_phase: z.string(),
  moon_illumination: z.union([z.number(), z.string()]).optional(),
});

export const daySummarySchema = z.object({
  maxtemp_c: z.number(),
  maxtemp_f: z.number(),
  mintemp_c: z.number(),
  mintemp_f: z.number(),
  avgtemp_c: z.number(),
  avgtemp_f: z.number(),
  maxwind_kph: z.number(),
  maxwind_mph: z.number(),
  totalprecip_mm: z.number(),
  avghumidity: z.number(),
  daily_chance_of_rain: z.number().optional(),
  daily_chance_of_snow: z.number().optional(),
  condition: conditionSchema,
  uv: z.number(),
});

export const forecastDaySchema = z.object({
  date: z.string(),
  date_epoch: z.number(),
  day: daySummarySchema,
  astro: dayAstroSchema,
  hour: z.array(hourSchema),
});

export const alertSchema = z.object({
  headline: z.string().optional(),
  event: z.string().optional(),
  severity: z.string().optional(),
  urgency: z.string().optional(),
  areas: z.string().optional(),
  effective: z.string().optional(),
  expires: z.string().optional(),
  desc: z.string().optional(),
  instruction: z.string().optional(),
});

export const forecastResponseSchema = z.object({
  location: locationSchema,
  current: currentSchema,
  forecast: z.object({ forecastday: z.array(forecastDaySchema) }),
  alerts: z.object({ alert: z.array(alertSchema) }).optional(),
});

export const historyResponseSchema = z.object({
  location: locationSchema,
  forecast: z.object({ forecastday: z.array(forecastDaySchema) }),
});

export const searchResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  region: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
  url: z.string(),
});

export const searchResponseSchema = z.array(searchResultSchema);

/** Query accepted by `/api/weather`. Coordinates or a free-text place name. */
export const weatherQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  days: z.coerce.number().int().min(1).max(14).default(7),
  history: z.coerce.number().int().min(0).max(7).default(5),
});

export type Condition = z.infer<typeof conditionSchema>;
export type WeatherLocation = z.infer<typeof locationSchema>;
export type CurrentWeather = z.infer<typeof currentSchema>;
export type ForecastHour = z.infer<typeof hourSchema>;
export type ForecastDay = z.infer<typeof forecastDaySchema>;
export type WeatherAlert = z.infer<typeof alertSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;

/** The shape `/api/weather` returns to the browser. */
export interface WeatherBundle {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: ForecastDay[];
  history: ForecastDay[];
  alerts: WeatherAlert[];
  fetchedAt: string;
}
