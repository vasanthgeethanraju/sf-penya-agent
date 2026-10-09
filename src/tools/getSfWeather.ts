const SF_LATITUDE = 37.7749;
const SF_LONGITUDE = -122.4194;

function getWeatherCondition(code: number): string {
  if (code === 0) return "Clear";

  if (code === 1 || code === 2) {
    return "Partly cloudy";
  }

  if (code === 3) {
    return "Cloudy";
  }

  if (code === 45 || code === 48) {
    return "Foggy";
  }

  if (code >= 51 && code <= 67) {
    return "Rainy";
  }

  if (code >= 71 && code <= 77) {
    return "Snowy";
  }

  if (code >= 80 && code <= 82) {
    return "Rain showers";
  }

  if (code >= 95) {
    return "Thunderstorms";
  }

  return "Unknown";
}

export async function getSfWeather(
  matchDate: string,
  kickoffHour: number
) {
  const url = new URL(
    "https://api.open-meteo.com/v1/forecast"
  );

  url.searchParams.set("latitude", String(SF_LATITUDE));
  url.searchParams.set("longitude", String(SF_LONGITUDE));

  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,weather_code"
  );

  url.searchParams.set(
    "temperature_unit",
    "fahrenheit"
  );

  url.searchParams.set(
    "timezone",
    "America/Los_Angeles"
  );

  url.searchParams.set(
    "start_date",
    matchDate
  );

  url.searchParams.set(
    "end_date",
    matchDate
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Weather API failed: ${response.status}`
    );
  }

  const data = await response.json();

  const targetTime =
    `${matchDate}T${String(kickoffHour).padStart(2, "0")}:00`;

  const index =
    data.hourly.time.indexOf(targetTime);

  if (index === -1) {
    throw new Error(
      `Weather not found for ${targetTime}`
    );
  }

  const weatherCode =
    data.hourly.weather_code[index];

  return {
    time: data.hourly.time[index],

    temperature:
      data.hourly.temperature_2m[index],

    rainChance:
      data.hourly.precipitation_probability[index],

    condition:
      getWeatherCondition(weatherCode),
  };
}