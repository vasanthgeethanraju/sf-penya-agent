import type { MatchInfo } from "../types";
import type { MatchDayContent } from "../schemas/matchDayContentSchema";
import type { TransitAlert } from "../tools/getTransitAlerts";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "published"
  | "failed";

export type WeatherContext = {
  time: string;
  temperature: number;
  rainChance: number;
  condition: string;
};

export type EventContext = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  venue: string | null;
  city: string | null;
};

export type ApprovalPackage = {
  id: string;
  createdAt: string;
  status: ApprovalStatus;

  match: MatchInfo;
  weather: WeatherContext | null;
  events: EventContext[];
  transitAlerts: TransitAlert[];

  content: MatchDayContent;

  posterPath: string | null;

  notes: string[];
};