/**
 * Maps a WeatherAPI condition code to a hero gradient class.
 *
 * Codes are grouped rather than enumerated: the provider ships ~40 codes and
 * the difference between "light drizzle" and "patchy light drizzle" does not
 * warrant its own background.
 */
const THUNDER = new Set([1087, 1273, 1276, 1279, 1282]);
const SNOW = new Set([
  1066, 1069, 1072, 1114, 1117, 1147, 1168, 1171, 1198, 1201, 1204, 1207, 1210, 1213,
  1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264,
]);
const RAIN = new Set([
  1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246,
]);
const CLOUD = new Set([1003, 1006, 1009, 1030, 1135, 1147]);

export function skyClass(code: number, isDay: boolean): string {
  if (THUNDER.has(code)) return 'sky-storm';
  if (SNOW.has(code)) return 'sky-snow';
  if (RAIN.has(code)) return 'sky-rain';
  if (CLOUD.has(code)) return isDay ? 'sky-cloud-day' : 'sky-cloud-night';
  return isDay ? 'sky-clear-day' : 'sky-clear-night';
}

/** True when the snow gradient is light enough to need dark text on top. */
export function skyNeedsDarkText(code: number): boolean {
  return SNOW.has(code);
}
