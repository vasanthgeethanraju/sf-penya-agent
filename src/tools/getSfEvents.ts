type TicketmasterEvent = {
  id: string;
  name: string;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  _embedded?: {
    venues?: Array<{
      name?: string;
      city?: {
        name?: string;
      };
    }>;
  };
};

type TicketmasterResponse = {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
};

export async function getSfEvents(
  matchDate: string
) {
  const apiKey =
    process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TICKETMASTER_API_KEY is missing."
    );
  }

  const url = new URL(
    "https://app.ticketmaster.com/discovery/v2/events.json"
  );

  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("city", "San Francisco");
  url.searchParams.set("stateCode", "CA");
  url.searchParams.set("countryCode", "US");

url.searchParams.set(
  "localStartDateTime",
  `${matchDate}T00:00:00,${matchDate}T23:59:59`
);

  url.searchParams.set("size", "20");
  url.searchParams.set("sort", "date,asc");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Ticketmaster API failed: ${response.status}`
    );
  }

  const data =
    (await response.json()) as TicketmasterResponse;

  const events =
    data._embedded?.events ?? [];

  return events.map((event) => ({
    id: event.id,
    name: event.name,

    date:
      event.dates?.start?.localDate ?? null,

    time:
      event.dates?.start?.localTime ?? null,

    venue:
      event._embedded?.venues?.[0]?.name ??
      null,

    city:
      event._embedded?.venues?.[0]?.city
        ?.name ?? null,
  }));
}