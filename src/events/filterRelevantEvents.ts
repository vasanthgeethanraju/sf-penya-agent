type SfEvent = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  venue: string | null;
  city: string | null;
};

function timeToMinutes(time: string) {
  const [hours, minutes] = time
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

export function filterRelevantEvents(
  events: SfEvent[],
  kickoffHour: number
) {
  const kickoffMinutes = kickoffHour * 60;

  const windowStart =
    kickoffMinutes - 180; // 3 hours before

  const windowEnd =
    kickoffMinutes + 240; // 4 hours after

  return events.filter((event) => {
    if (!event.time) {
      return false;
    }

    if (
      event.name
        .toLowerCase()
        .includes("private event")
    ) {
      return false;
    }

    const eventMinutes =
      timeToMinutes(event.time);

    return (
      eventMinutes >= windowStart &&
      eventMinutes <= windowEnd
    );
  });
}