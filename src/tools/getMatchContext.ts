import { getNextBarcaMatch } from "./getNextBarcaMatch";
import { getSfWeather } from "./getSfWeather";

function getKickoffHour(kickoffTime: string): number {
  const [time, period] = kickoffTime.split(" ");
  const [hourString] = time.split(":");

  let hour = Number(hourString);

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour;
}

export async function getMatchContext() {
  const match = await getNextBarcaMatch();

  const kickoffHour = getKickoffHour(match.kickoffTime);

  const weather = await getSfWeather(
    match.date,
    kickoffHour
  );

  return {
    match,
    weather,
  };
}