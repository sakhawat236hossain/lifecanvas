import { SignupForm } from "@/components/SignupForm";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function SignupPage() {
  // If already authenticated, redirect directly to dashboard
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden">
      {/* Background neon ambient highlights */}
      <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] opacity-40 -z-10" />
      <div className="absolute bottom-1/4 -left-1/4 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px] opacity-30 -z-10" />

      <SignupForm />
    </div>
  );
}
