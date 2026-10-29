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

  const isChampionsLeague =
    match.competition.toLowerCase().includes("champions");

  const barcelonaKit = match.isHomeGame ? "home" : "away";

  const matchTone =
    config.style === "el-clasico"
      ? "high-intensity rivalry, star versus star, iconic and dramatic"
      : config.style === "big-match"
      ? "major European or marquee match, premium and cinematic"
      : "clean modern match-day poster, energetic and polished";

  return `
Create a premium vertical 4:5 Instagram match-day poster for Penya Barcelonista San Francisco.

This poster must feel CURRENT and MODERN for the present football season.

MATCH INFORMATION
Opponent: ${match.opponent}
Competition: ${match.competition}
Match venue: ${match.matchVenue}
Fixture: ${match.isHomeGame ? "home" : "away"}
Barcelona kit: current-season ${barcelonaKit} kit
Day: ${match.day}
Date: ${match.date}
Kickoff time: ${match.kickoffTime}
Watch venue: ${match.watchVenue}

POSTER STYLE
Style: ${config.style}
Tone: ${matchTone}

FEATURED PLAYERS
Barcelona players: ${barcaPlayers}
Opponent players: ${opponentPlayers}

VISUAL REQUIREMENTS
- Use a premium cinematic football poster style.
- Use Barça-inspired blaugrana colors.
- Show ONLY the named players.
- Do not invent or add extra football players.
- Make the named players recognizable and realistic.
- Show the players as present-day footballers in their CURRENT ERA appearance.
- Dress every named Barcelona player in FC Barcelona's current-season ${barcelonaKit} kit.
- Use the correct ${barcelonaKit} kit design, colors, and details for the current season.
- Do not use retro jerseys, old kit designs, vintage styling, or outdated-looking player appearances.
- Avoid older-looking faces or younger early-career versions of the players.
- Avoid using the same repeated pose or composition as previous posters.
- Keep the overall Penya Barcelonista San Francisco identity consistent while making each weekly poster visually fresh.
- Barcelona players should be the main focus.
- If an opponent player is included, use them only as the rival focal point.
- Keep faces clear and unobstructed.
- Keep a clean text-safe area in the middle and lower section so all text stays readable.
- ${
    config.includeGoldenGateBridge
      ? "Include the Golden Gate Bridge or San Francisco skyline in the background."
      : "Do not include the Golden Gate Bridge."
  }
- ${
    config.includePenyaLogo
      ? "Place the Penya Barcelonista San Francisco logo clearly at the top."
      : ""
  }
- ${
    config.includeBarcaLogo
      ? "Include FC Barcelona visual identity and club crest."
      : ""
  }
- Include the opponent club crest near the matchup title.
- ${
    isChampionsLeague
      ? "Add a subtle Champions League atmosphere or design cues, but keep the layout clean."
      : "Keep the competition styling appropriate for a domestic match."
  }

TEXT TO DISPLAY
Penya Barcelonista San Francisco
BARÇA vs ${match.opponent.toUpperCase()}
${match.day.toUpperCase()} • ${match.date} • ${match.kickoffTime}
${match.watchVenue}
1568 Haight St • San Francisco
ALL AGES

IMPORTANT
- Keep all event text accurate.
- Do not change the opponent, date, time, or venue.
- Spell Barça correctly.
- Do not add extra players.
- Do not add extra text outside the listed event details.
- Prioritize realistic present-day player likeness and current kits.
`;
}
