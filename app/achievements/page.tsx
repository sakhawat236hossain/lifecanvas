"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trophy, Plus, Sparkles, AlertCircle, ShieldAlert, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { AchievementCard } from "@/components/AchievementCard";
import { AddAchievementDialog } from "@/components/AddAchievementDialog";

interface Achievement {
  _id: string;
  title: string;
  description?: string;
  icon: string;
  points: number;
  date: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchAchievements = async () => {
    try {
      setError(null);
      const res = await axios.get("/api/achievements");
      setAchievements(res.data);
    } catch (err) {
      console.error("Error fetching achievements:", err);
      setError("অর্জনগুলো লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const totalXP = achievements.reduce((acc, ach) => acc + (ach.points || 0), 0);
  const totalCount = achievements.length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto min-h-screen pb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>লাইফ অ্যাচিভমেন্টস গ্যালারি ও গ্যামিফিকেশন</span>
          </div>
          <h1 className="text-4xl font-playfair font-bold tracking-tight">আমার অর্জনসমূহ</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            আপনার ক্যারিয়ার, পড়াশোনা বা ব্যক্তিগত জীবনে জয় করা প্রতিটি ছোট-বড় মাইলফলক স্বর্ণাক্ষরে জমিয়ে রাখুন।
          </p>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="rounded-full shadow-lg shadow-amber-500/10 bg-amber-500 hover:bg-amber-600 text-black hover:scale-[1.03] active:scale-[0.97] transition-all gap-2 h-12 px-6 font-semibold cursor-pointer self-start sm:self-center"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>নতুন অর্জন যোগ করুন</span>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 border border-destructive/20 bg-destructive/5 backdrop-blur-md rounded-2xl text-destructive-foreground">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div className="flex-1 text-sm">
            <span className="font-bold block mb-0.5">ত্রুটি</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Dynamic XP Progression Bar Header (Shows only when achievements exist) */}
      {!loading && totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] opacity-10 -z-10 bg-amber-500" />
          
          <div className="flex items-center gap-4.5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner">
              <Trophy className="h-9 w-9 text-amber-400 stroke-[1.5]" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest font-mono">লাইফ লেভেল স্ট্যাটাস</span>
              <h2 className="text-2xl sm:text-3xl font-playfair font-black tracking-tight flex items-baseline gap-2">
                <span>মাস্টার লিডার</span>
                <span className="text-xs font-sans px-2 py-0.5 bg-amber-500 text-black font-extrabold rounded-md shadow-sm">Level Max</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 w-full md:w-auto">
            {/* XP Statistics */}
            <div className="text-center sm:text-right space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">সর্বমোট অর্জিত XP পয়েন্ট</span>
              <div className="text-3xl font-black text-amber-400 font-mono tracking-tight flex items-center justify-center sm:justify-end gap-1">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                <span>{totalXP} XP</span>
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6 text-center sm:text-right space-y-1">
              <span className="text-xs text-muted-foreground font-semibold">আনলক মাইলফলক</span>
              <div className="text-3xl font-black font-mono tracking-tight text-white flex items-center justify-center sm:justify-end gap-1.5">
                <Award className="h-6 w-6 text-primary" />
                <span>{totalCount} টি</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Area */}
      {loading ? (
        /* Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-white/5 bg-white/5 rounded-3xl p-6 h-[190px] space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="h-14 w-14 bg-white/10 rounded-2xl" />
                <div className="h-6 bg-white/10 rounded-full w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-white/10 rounded-full w-2/3" />
                <div className="h-4 bg-white/10 rounded-full w-full" />
              </div>
              <div className="h-4 bg-white/10 rounded-full w-1/3" />
            </div>
          ))}
        </div>
      ) : achievements.length > 0 ? (
        /* Achievements Grid */
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {achievements.map((achievement, index) => (
            <AchievementCard key={achievement._id} achievement={achievement} index={index} onUpdate={fetchAchievements} />
          ))}
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center p-12 sm:p-20 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-md max-w-2xl mx-auto space-y-8"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-inner relative overflow-hidden">
            <Trophy className="h-10 w-10 text-amber-400 animate-bounce" />
            <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-[10px] -z-10" />
          </div>

          <div className="space-y-3">
            <h3 className="font-playfair text-2xl font-bold tracking-tight">আপনার কোনো অর্জন এখনও সংরক্ষিত হয়নি</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              নিজের কোনো বিশেষ জয়, কাজের প্রশংসা বা মাইলফলক উদ্যাপন করতে এবং নিজেকে সামনে এগিয়ে নিতে আজই প্রথম মাইলফলকটি যোগ করুন!
            </p>
          </div>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
            className="rounded-full shadow-xl shadow-amber-500/10 bg-amber-500 hover:bg-amber-600 text-black hover:scale-105 transition-transform px-8 h-14 text-base font-semibold cursor-pointer"
          >
            প্রথম অর্জন যোগ করুন
          </Button>
        </motion.div>
      )}

      {/* Add Achievement Dialog Modal */}
      <AddAchievementDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={fetchAchievements}
      />
    </div>
  );
}
