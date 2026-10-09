import { getNextBarcaMatch } from "./getNextBarcaMatch";
import { getSfWeather } from "./getSfWeather";
import { getSfEvents } from "./getSfEvents";
import { filterRelevantEvents } from "../events/filterRelevantEvents";
import { getTransitAlerts } from "./getTransitAlerts";
import { filterRelevantTransitAlerts } from "../transit/filterRelevantTransitAlerts";

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

  const allEvents = await getSfEvents(
    match.date
  );

  const events = filterRelevantEvents(
    allEvents,
    kickoffHour
  );

  const allTransitAlerts =
  await getTransitAlerts();

const transitAlerts =
  filterRelevantTransitAlerts(
    allTransitAlerts
  );

  return {
    match,
    weather,
    events,
    transitAlerts,
  };
}