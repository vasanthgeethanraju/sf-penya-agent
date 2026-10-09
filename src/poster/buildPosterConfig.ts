import type { MatchInfo, PosterConfig } from "../types";

const barcelonaPlayers = [
  "Lamine Yamal",
  "Raphinha",
  "Pedri",
  "Fermin Lopez",
  "Pau Cubarsi",
];

function pickRandomPlayers(players: string[], count: number) {
  return [...players]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

export function buildPosterConfig(
  match: MatchInfo
): PosterConfig {
  const isElClasico =
    match.opponent.toLowerCase() === "real madrid";

  if (isElClasico) {
    return {
      featuredBarcelonaPlayers: pickRandomPlayers(
        barcelonaPlayers,
        1
      ),
      featuredOpponentPlayers: ["Kylian Mbappe"],
      includeGoldenGateBridge: true,
      includePenyaLogo: true,
      includeBarcaLogo: true,
      style: "el-clasico",
    };
  }

  return {
    featuredBarcelonaPlayers: pickRandomPlayers(
      barcelonaPlayers,
      2
    ),
    featuredOpponentPlayers: [],
    includeGoldenGateBridge: true,
    includePenyaLogo: true,
    includeBarcaLogo: true,
    style: "standard",
  };
}