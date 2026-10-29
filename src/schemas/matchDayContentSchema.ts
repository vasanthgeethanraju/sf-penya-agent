import { z } from "zod";

export const MatchDayContentSchema = z.object({
  // WhatsApp content generation is on hold pending a business phone number/account.
  // whatsapp: z.string(),
  instagram: z.string(),
  emailSubject: z.string(),
  emailBody: z.string(),
});

export type MatchDayContent = z.infer<
  typeof MatchDayContentSchema
>;
