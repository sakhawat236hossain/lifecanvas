"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  UserPlus,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  Camera,
} from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("সবগুলো ফিল্ড পূরণ করা আবশ্যক");
      return;
    }

    if (password.length < 6) {
      toast.error("পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("পাসওয়ার্ড দুটি মেলেনি!");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await uploadImageToCloudinary(imageFile);
        setUploadingImage(false);
      }

      const res = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
        image: imageUrl,
      });

      toast.success(
        res.data.message ||
          "নিবন্ধন সফল হয়েছে!",
      );

      // Automatically sign in the newly registered user
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        toast.error(
          "স্বয়ংক্রিয় লগইন ব্যর্থ হয়েছে, অনুগ্রহ করে ম্যানুয়ালি লগইন করুন।",
        );
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      const errMsg =
        err?.response?.data?.error ||
        "নিবন্ধন করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।";
      toast.error(errMsg);
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
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 via-primary/5 to-primary/20 rounded-[2.5rem] blur-[25px] opacity-70 group-hover:opacity-90 transition-opacity -z-10" />

      <div className="border border-white/10 bg-black/60 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-2xl space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary-foreground mb-2">
            <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
          </div>
          <h2 className="font-playfair text-3xl font-extrabold tracking-tight">
            নতুন অ্যাকাউন্ট তৈরি
          </h2>
          <p className="text-muted-foreground text-sm">
            লাইফক্যানভাস-এ যোগ দিয়ে জীবনের গল্পগুলো ধরে রাখুন
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Image Uploader */}
          <div className="flex flex-col items-center justify-center space-y-2 mb-4">
            <div className="relative group/avatar cursor-pointer">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 hover:border-secondary/50 overflow-hidden flex items-center justify-center bg-white/5 transition-all">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center flex flex-col items-center justify-center p-2">
                    <Camera className="h-6 w-6 text-muted-foreground group-hover/avatar:text-secondary transition-colors" />
                    <span className="text-[10px] text-muted-foreground mt-1">
                      ছবি আপলোড
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={loading}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              আপনার একটি প্রোফাইল ছবি যুক্ত করুন
            </span>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-bold text-muted-foreground pl-1"
            >
              আপনার নাম
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="MD Sakhawat Hossain"
                className="pl-10.5 h-12 border-white/10 bg-white/5 rounded-2xl focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

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
                className="pl-10.5 h-12 border-white/10 bg-white/5 rounded-2xl focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-bold text-muted-foreground pl-1"
            >
              পাসওয়ার্ড (অন্তত ৬ অক্ষর)
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10.5 pr-10 h-12 border-white/10 bg-white/5 rounded-2xl focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all"
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

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-bold text-muted-foreground pl-1"
            >
              পাসওয়ার্ড নিশ্চিত করুন
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10.5 pr-10 h-12 border-white/10 bg-white/5 rounded-2xl focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
              >
                {showConfirmPassword ? (
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
            className="w-full h-12 rounded-2xl text-base font-semibold shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-secondary hover:bg-secondary/95 text-secondary-foreground gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>
                  {uploadingImage ? "ছবি আপলোড হচ্ছে..." : "নিবন্ধন হচ্ছে..."}
                </span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>নিবন্ধন সম্পন্ন করুন</span>
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-white/5">
          <p className="text-xs text-muted-foreground">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link
              href="/login"
              className="text-secondary hover:underline font-bold transition-all ml-1"
            >
              লগ ইন করুন
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
