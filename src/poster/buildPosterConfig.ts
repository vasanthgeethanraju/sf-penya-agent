import type { MatchInfo, PosterConfig } from "../types";
import { getPosterContext } from "./getPosterContext";

export function buildPosterConfig(
  match: MatchInfo,
  recentStandouts: string[] = []
): PosterConfig {
  const context = getPosterContext(match, recentStandouts);

  return {
    ...context,
    // The poster currently treats Champions League games as big matches.
    style: context.style === "champions-league" ? "big-match" : context.style,
    includeGoldenGateBridge: true,
    includePenyaLogo: true,
    includeBarcaLogo: true,
  };
}
