import type { MatchInfo } from "../src/types";
import { buildPosterConfig } from "../src/poster/buildPosterConfig";

// Sample inputs for inspecting player selection, not a live match schedule.
const sampleMatch: MatchInfo = {
  opponent: "Real Madrid",
  competition: "La Liga",
  date: "2026-10-31",
  day: "Saturday",
  kickoffTime: "12:00 PM",
  matchVenue: "Sample stadium",
  watchVenue: "Mad Dog in the Fog",
  isHomeGame: true,
};

const examples = [
  sampleMatch,
  { ...sampleMatch, opponent: "Paris Saint Germain", competition: "UEFA Champions League" },
  { ...sampleMatch, opponent: "Atletico Madrid" },
  { ...sampleMatch, opponent: "Real Betis" },
];

console.log("Poster selection preview (sample inputs; no API calls).\n");

for (const match of examples) {
  const config = buildPosterConfig(match);

  console.log(`Barcelona vs ${match.opponent} (${match.competition})`);
  console.log(`  Style: ${config.style}`);
  console.log(`  Barcelona players: ${config.featuredBarcelonaPlayers.join(", ")}`);
  console.log(`  Opponent players: ${config.featuredOpponentPlayers.join(", ") || "none"}`);
  console.log();
}

// These names demonstrate the rules; they are not claimed to be recent performers.
const sampleStandouts = ["Fermin Lopez", "Pau Cubarsi"];
console.log("Sample priority demonstration (not real recent-match data):");

for (const match of examples) {
  const config = buildPosterConfig(match, sampleStandouts);
  console.log(`  vs ${match.opponent}: ${config.featuredBarcelonaPlayers.join(", ")}`);
}
