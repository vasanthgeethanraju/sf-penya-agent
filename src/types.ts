export type MatchInfo = {
  opponent: string;
  competition: string;
  date: string;
  day: string;
  kickoffTime: string;
  matchVenue: string;
  watchVenue: string;
  isHomeGame: boolean;
};

export type PosterConfig = {
  featuredBarcelonaPlayers: string[];
  featuredOpponentPlayers: string[];
  includeGoldenGateBridge: boolean;
  includePenyaLogo: boolean;
  includeBarcaLogo: boolean;
  style: "standard" | "el-clasico" | "big-match";
};