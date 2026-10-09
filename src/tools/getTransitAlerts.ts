type Translation = {
  Text?: string;
  Language?: string;
};

type InformedEntity = {
  AgencyId?: string;
  RouteId?: string;
  StopId?: string;
};

type RawTransitEntity = {
  Id?: string;

  Alert?: {
    InformedEntity?: InformedEntity[];

    HeaderText?: {
      Translation?: Translation[];
    };

    DescriptionText?: {
      Translation?: Translation[];
    };
  };
};

type TransitResponse = {
  Entity?: RawTransitEntity[];
};

export type TransitAlert = {
  id: string;
  agency: string | null;
  title: string | null;
  description: string | null;
};

function getEnglishText(
  translations?: Translation[]
): string | null {
  if (!translations?.length) {
    return null;
  }

  const english = translations.find(
    (translation) =>
      translation.Language === "en"
  );

  return (
    english?.Text ??
    translations[0]?.Text ??
    null
  );
}

export async function getTransitAlerts(): Promise<
  TransitAlert[]
> {
  const apiKey = process.env["511_API_KEY"];

  if (!apiKey) {
    throw new Error("511_API_KEY is missing.");
  }

  const url = new URL(
    "https://api.511.org/transit/servicealerts"
  );

  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("agency", "RG");
  url.searchParams.set("format", "json");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `511 transit API failed: ${response.status}`
    );
  }

  const data =
    (await response.json()) as TransitResponse;

  const entities = data.Entity ?? [];

  return entities.map((entity) => ({
    id: entity.Id ?? "unknown",

    agency:
      entity.Alert?.InformedEntity?.[0]
        ?.AgencyId ?? null,

    title: getEnglishText(
      entity.Alert?.HeaderText?.Translation
    ),

    description: getEnglishText(
      entity.Alert?.DescriptionText
        ?.Translation
    ),
  }));
}