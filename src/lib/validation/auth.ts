import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const passwordSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères")
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre");

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(120),
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: passwordSchema,
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(120).optional(),
  email: z.string().trim().toLowerCase().email("Adresse email invalide").optional(),
  password: passwordSchema.optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

// Formulaire d'édition côté admin : mot de passe laissé vide = « ne pas changer ».
export const adminEditUserSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(120),
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z.union([z.literal(""), passwordSchema]),
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
});

export type AdminEditUserInput = z.infer<typeof adminEditUserSchema>;
