"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email && !checkRateLimit(`login:admin:${email}`, 5, 15 * 60 * 1000)) {
    return { error: "Trop de tentatives de connexion. Réessayez dans quelques minutes." };
  }
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Email ou mot de passe incorrect."
            : "Une erreur est survenue lors de la connexion.",
      };
    }
    throw error; // NEXT_REDIRECT (succès)
  }
}
