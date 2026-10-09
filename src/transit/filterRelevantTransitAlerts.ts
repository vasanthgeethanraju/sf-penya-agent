import type { TransitAlert } from "../tools/getTransitAlerts";

const RELEVANT_AGENCIES = new Set([
  "SF",
]);

const RELEVANT_TERMS = [
  "haight",
  "market",
  "duboce",
  "church",
  "castro",
  "cole",
  "carl",
  "frederick",
  "masonic",
  "divisadero",
  "page",
  "fillmore",
  "van ness",
  "n judah",
  "7 haight",
  "6 haight",
  "43 masonic",
];

export function filterRelevantTransitAlerts(
  alerts: TransitAlert[]
) {
  return alerts.filter((alert) => {
    if (
      !alert.agency ||
      !RELEVANT_AGENCIES.has(alert.agency)
    ) {
      return false;
    }

    const text = `
      ${alert.title ?? ""}
      ${alert.description ?? ""}
    `.toLowerCase();

    return RELEVANT_TERMS.some((term) =>
      text.includes(term)
    );
  });
}