import type { MatchInfo } from "../types";

export type PosterContext = {
  style:
    | "standard"
    | "big-match"
    | "champions-league"
    | "el-clasico";

  featuredBarcelonaPlayers: string[];
  featuredOpponentPlayers: string[];
};

const BARCA_CORE_PLAYERS = [
  "Lamine Yamal",
  "Raphinha",
  "Pedri",
  "Fermin Lopez",
  "Pau Cubarsi",
  "Gavi",
  "Jules Kounde",
  "Alejandro Balde",
  "Dani Olmo",
  "Rodri",
  "Frenkie de Jong",
  "Anthony Gordon",
  "Karim Adeyemi",
  "Gabriel Jesus"
];

const BARCA_BIG_MATCH_PLAYERS = [
  "Lamine Yamal",
  "Raphinha",
  "Pedri",
    "Rodri",
  "Frenkie de Jong",
  "Anthony Gordon",
  "Karim Adeyemi"
];

const OPPONENT_STAR_MAP: Record<string, string[]> = {
  "real madrid": ["Kylian Mbappe"],
  "paris saint germain": ["Ousmane Dembele"],
  "real betis": ["Isco"],
  "atletico madrid": ["Giuliano Simeone"],
  "girona": [],
  "sevilla": [],
  "valencia": [],
  "athletic club": ["Nico Williams"],
  "villarreal": [],
};

function uniquePlayers(players: string[]) {
  return [...new Set(players.map((player) => player.trim()).filter(Boolean))];
}

function pickPlayers(
  players: string[],
  count: number,
  recentStandouts: string[] = []
) {
  const priorityPlayers = uniquePlayers(recentStandouts).slice(0, count);
  const remainingPlayers = uniquePlayers(players)
    .filter((player) => !priorityPlayers.includes(player))
    .sort(() => Math.random() - 0.5)
    .slice(0, count - priorityPlayers.length);

  return [...priorityPlayers, ...remainingPlayers];
}

function getOpponentStars(opponent: string) {
  return OPPONENT_STAR_MAP[opponent.toLowerCase()] ?? [];
}

export function getPosterContext(
  match: MatchInfo,
  recentStandouts: string[] = []
): PosterContext {
  const opponent = match.opponent.toLowerCase().trim();
  const competition = match.competition.toLowerCase();

  const isElClasico = opponent === "real madrid";
  const isChampionsLeague =
    competition.includes("champions league") ||
    competition.includes("uefa champions");
  const isBigMatch =
    isElClasico ||
    isChampionsLeague ||
    opponent === "paris saint germain" ||
    opponent === "atletico madrid";

  if (isElClasico) {
    return {
      style: "el-clasico",
      featuredBarcelonaPlayers: ["Lamine Yamal"],
      featuredOpponentPlayers: ["Kylian Mbappe"],
    };
  }

  if (isChampionsLeague) {
    return {
      style: "champions-league",
      featuredBarcelonaPlayers: pickPlayers(BARCA_BIG_MATCH_PLAYERS, 2, recentStandouts),
      featuredOpponentPlayers: getOpponentStars(opponent),
    };
  }

  if (isBigMatch) {
    return {
      style: "big-match",
      featuredBarcelonaPlayers: pickPlayers(BARCA_BIG_MATCH_PLAYERS, 2, recentStandouts),
      featuredOpponentPlayers: getOpponentStars(opponent),
    };
  }

  return {
    style: "standard",
    featuredBarcelonaPlayers: pickPlayers(BARCA_CORE_PLAYERS, 2, recentStandouts),
    featuredOpponentPlayers: getOpponentStars(opponent),
  };
}
