import { z } from "zod";

const optional = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const announcementSchema = z.object({
  enabled: z.coerce.boolean().default(false),
  // Chaînes ISO ou vides (champs <input type="datetime-local">).
  startsAt: z.string().optional().or(z.literal("")),
  endsAt: z.string().optional().or(z.literal("")),
  imageId: z.string().cuid().optional().nullable(),
  content: z.string().max(20000).optional().or(z.literal("")),
  contentEn: z.string().max(20000).optional().or(z.literal("")),
  buttonLabel: optional(80),
  buttonLabelEn: optional(80),
  buttonUrl: z.string().trim().max(500).optional().or(z.literal("")),
  dismissDays: z.coerce.number().int().min(0).max(365).default(7),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
