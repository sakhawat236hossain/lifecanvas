"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  LogIn,
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  googleEnabled: boolean;
  githubEnabled: boolean;
}

export function LoginForm({ googleEnabled, githubEnabled }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if there was an auth error passed in URL (e.g., from OAuth)
  const error = searchParams.get("error");
  const getErrorMessage = (errType: string) => {
    if (errType === "OAuthSignin" || errType === "OAuthCallback") {
      return "সোশ্যাল লগইন প্রক্রিয়াকালীন সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
    }
    if (errType === "OAuthCreateAccount") {
      return "সোশ্যাল লগইন অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে।";
    }
    if (errType === "Callback") {
      return "লগইন প্রসেসিংয়ে সমস্যা হয়েছে।";
    }
    return "লগইন করতে ব্যর্থ হয়েছে।";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("সবগুলো ফিল্ড পূরণ করা আবশ্যক");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("সফলভাবে লগ ইন হয়েছে!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("লগইন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto relative group"
    >
      {/* Background Neon Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/5 to-secondary/20 rounded-[2.5rem] blur-[25px] opacity-70 group-hover:opacity-90 transition-opacity -z-10" />

      <div className="border border-white/10 bg-black/60 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-8">
        {/* Title Cover */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary-foreground mb-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <h2 className="font-playfair text-3xl font-extrabold tracking-tight">
            লাইফক্যানভাস-এ লগ ইন
          </h2>
          <p className="text-muted-foreground text-sm">
            আপনার ব্যক্তিগত সিনেমাটিক আর্কাইভে ফিরে যান
          </p>
        </div>

        {/* OAuth Error Alert */}
        {error && (
          <div className="flex items-center gap-3 p-4 border border-destructive/20 bg-destructive/5 backdrop-blur-md rounded-2xl text-destructive-foreground text-xs leading-relaxed">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <span>{getErrorMessage(error)}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-bold text-muted-foreground pl-1"
            >
              আপনার ইমেইল
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className="pl-10.5 h-12 border-white/10 bg-white/5 rounded-2xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <Label
                htmlFor="password"
                className="text-xs font-bold text-muted-foreground"
              >
                পাসওয়ার্ড
              </Label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10.5 pr-10 h-12 border-white/10 bg-white/5 rounded-2xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>লগইন হচ্ছে...</span>
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                <span>লগ ইন করুন</span>
              </>
            )}
          </Button>
        </form>

        {/* Social Providers Divider */}
        {(googleEnabled || githubEnabled) && (
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-muted-foreground text-xs font-bold">
              অথবা এগুলোর মাধ্যমে
            </span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>
        )}

        {/* Social Sign In Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {googleEnabled && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="h-12 border-white/10 bg-white/5 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl gap-2 font-medium cursor-pointer"
            >
              {/* Google Brand Color SVG */}
              <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.577 0 3.012.581 4.114 1.536l3.07-3.07C19.167 1.83 15.932 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.48 0 10.748-4.55 10.748-10.925 0-.719-.08-1.285-.24-2.27H12.24Z"
                />
              </svg>
              <span>Google লগইন</span>
            </Button>
          )}

          {githubEnabled && (
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="h-12 border-white/10 bg-white/5 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl gap-2 font-medium cursor-pointer"
            >
              <svg
                className="h-4.5 w-4.5 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span>GitHub লগইন</span>
            </Button>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            আপনার কোনো অ্যাকাউন্ট নেই?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-bold transition-all ml-1"
            >
              নতুন অ্যাকাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
