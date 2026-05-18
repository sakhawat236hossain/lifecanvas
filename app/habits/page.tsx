"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Activity, Plus, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { HabitCard } from "@/components/HabitCard";
import { AddHabitDialog } from "@/components/AddHabitDialog";

interface Habit {
  _id: string;
  title: string;
  color: string;
  history: string[];
  streak: number;
  createdAt: string;
  updatedAt: string;
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchHabits = async () => {
    try {
      setError(null);
      const res = await axios.get("/api/habits");
      setHabits(res.data);
    } catch (err) {
      console.error("Error fetching habits:", err);
      setError("অভ্যাসগুলো লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto min-h-screen pb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary-foreground">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
            <span>প্রতিদিনের রুটিন এবং অভ্যাস ট্র্যাকার</span>
          </div>
          <h1 className="text-4xl font-playfair font-bold tracking-tight">আমার অভ্যাসসমূহ</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            আপনার প্রতিদিনের কাজ ও অভ্যাসগুলো নিয়মিত টিক (✅) দিন এবং দীর্ঘমেয়াদী ধারাবাহিকতা বজায় রাখুন।
          </p>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="rounded-full shadow-lg shadow-primary/20 hover:scale-[1.03] active:scale-[0.97] transition-all gap-2 h-12 px-6 font-medium cursor-pointer self-start sm:self-center"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>নতুন অভ্যাস যোগ করুন</span>
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

      {/* Content Area */}
      {loading ? (
        /* Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-white/5 bg-white/5 rounded-3xl p-6 h-[178px] space-y-6 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="h-6 bg-white/10 rounded-full w-2/3" />
                <div className="h-8 w-8 bg-white/10 rounded-full" />
              </div>
              <div className="h-16 bg-white/10 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : habits.length > 0 ? (
        /* Habits Grid */
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
          {habits.map((habit, index) => (
            <HabitCard key={habit._id} habit={habit} index={index} onUpdate={fetchHabits} />
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
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner relative overflow-hidden">
            <Activity className="h-10 w-10 text-primary-foreground animate-pulse" />
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[10px] -z-10" />
          </div>

          <div className="space-y-3">
            <h3 className="font-playfair text-2xl font-bold tracking-tight">আপনার কোনো অভ্যাস এখনও যুক্ত করা হয়নি</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              সফল জীবনের অন্যতম চাবিকাঠি হলো সুঅভ্যাস গড়ে তোলা। আপনার প্রথম অভ্যাসটি যুক্ত করে আজ থেকেই ট্র্যাকিং শুরু করুন!
            </p>
          </div>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
            className="rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform px-8 h-14 text-base cursor-pointer"
          >
            প্রথম অভ্যাস যোগ করুন
          </Button>
        </motion.div>
      )}

      {/* Add Habit Dialog Modal */}
      <AddHabitDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={fetchHabits}
      />
    </div>
  );
}
