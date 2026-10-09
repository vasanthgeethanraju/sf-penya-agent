import { getSfWeather } from "./tools/getSfWeather";

async function main() {
  const weather = await getSfWeather(
    "2026-10-10",
    9
  );

  console.log("MATCH WEATHER");
  console.log(weather);
}

main().catch(console.error);