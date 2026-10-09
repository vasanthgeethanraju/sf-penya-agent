import { z } from "zod";

export const MatchDayContentSchema = z.object({
  whatsapp: z.string(),
  instagram: z.string(),
  emailSubject: z.string(),
  emailBody: z.string(),
});

export type MatchDayContent = z.infer<
  typeof MatchDayContentSchema
>;