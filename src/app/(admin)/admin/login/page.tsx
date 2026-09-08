import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user && (session.user.role === "SUPER_ADMIN" || session.user.role === "ADMIN")) {
    redirect("/admin");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl">
        <h1 className="text-center font-display text-xl text-ink-900">Administration</h1>
        <p className="mb-6 text-center text-sm text-ink-500">L&apos;Insouciant</p>
        <LoginForm />
      </div>
    </div>
  );
}
