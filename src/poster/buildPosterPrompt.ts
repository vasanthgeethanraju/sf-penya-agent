import type { MatchInfo, PosterConfig } from "../types";

export function buildPosterPrompt(
  match: MatchInfo,
  config: PosterConfig
) {
  const barcaPlayers =
    config.featuredBarcelonaPlayers.join(", ");

  const opponentPlayers =
    config.featuredOpponentPlayers.length > 0
      ? config.featuredOpponentPlayers.join(", ")
      : "none";

  return `
Create a vertical Instagram match-day poster for
Penya Barcelonista San Francisco.

MATCH INFORMATION
Opponent: ${match.opponent}
Competition: ${match.competition}
Day: ${match.day}
Date: ${match.date}
Kickoff time: ${match.kickoffTime}
Watch venue: ${match.watchVenue}

POSTER STYLE
Style: ${config.style}

FEATURED PLAYERS
Barcelona players: ${barcaPlayers}
Opponent players: ${opponentPlayers}

VISUAL REQUIREMENTS
- Use a premium, cinematic football poster style.
- Use Barça-inspired blaugrana colors.
- Feature only the named players.
- Do not invent or add additional football players.
- Make the featured players recognizable.
- ${config.includeGoldenGateBridge
    ? "Include the Golden Gate Bridge or San Francisco skyline."
    : "Do not include the Golden Gate Bridge."}
- ${config.includePenyaLogo
    ? "Include the Penya Barcelonista San Francisco identity."
    : ""}
- ${config.includeBarcaLogo
    ? "Include FC Barcelona visual identity."
    : ""}
- Make each weekly poster visually different while keeping a consistent PBSF identity.
- Use a 4:5 Instagram portrait layout.

TEXT TO DISPLAY
Penya Barcelonista San Francisco
BARÇA vs ${match.opponent.toUpperCase()}
${match.day.toUpperCase()} • ${match.date} • ${match.kickoffTime}
${match.watchVenue}
1568 Haight St • San Francisco
ALL AGES

Important:
- Keep all event text accurate.
- Do not change the date, time, opponent, or venue.
- Do not add players who are not listed above.
`;
}