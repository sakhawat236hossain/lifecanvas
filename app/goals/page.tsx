"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Target, Plus, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { GoalCard } from "@/components/GoalCard";
import { AddGoalDialog } from "@/components/AddGoalDialog";

interface Goal {
  _id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchGoals = async () => {
    try {
      setError(null);
      const res = await axios.get("/api/goals");
      setGoals(res.data);
    } catch (err) {
      console.error("Error fetching goals:", err);
      setError("লক্ষ্যগুলো লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto min-h-screen pb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary-foreground">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
            <span>লাইফ টার্গেটস এবং প্রগ্রেস ট্র্যাকার</span>
          </div>
          <h1 className="text-4xl font-playfair font-bold tracking-tight">আমার লক্ষ্যসমূহ</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            আপনার জীবনের বড় লক্ষ্যগুলো যুক্ত করুন, ছোট ছোট ধাপে অগ্রগতি পরিমাপ করুন এবং নিজেকে ছাড়িয়ে যান।
          </p>
        </div>

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="rounded-full shadow-lg shadow-primary/20 hover:scale-[1.03] active:scale-[0.97] transition-all gap-2 h-12 px-6 font-medium cursor-pointer self-start sm:self-center"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>নতুন লক্ষ্য যোগ করুন</span>
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
        /* Premium Skeleton Loading States */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-white/5 bg-white/5 rounded-3xl p-6 h-[255px] space-y-6 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="h-6 bg-white/10 rounded-full w-2/3" />
                <div className="h-8 w-8 bg-white/10 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <div className="h-9 bg-white/10 rounded-md w-1/4" />
                  <div className="h-4 bg-white/10 rounded-md w-1/3" />
                </div>
                <div className="h-3 bg-white/10 rounded-full w-full" />
              </div>
              <div className="h-12 bg-white/10 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : goals.length > 0 ? (
        /* Goals Grid display */
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
          {goals.map((goal, index) => (
            <GoalCard key={goal._id} goal={goal} index={index} onUpdate={fetchGoals} />
          ))}
        </motion.div>
      ) : (
        /* Empty State with CTA */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center p-12 sm:p-20 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-md max-w-2xl mx-auto space-y-8"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner relative overflow-hidden">
            <Target className="h-10 w-10 text-primary-foreground animate-bounce" />
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[10px] -z-10" />
          </div>

          <div className="space-y-3">
            <h3 className="font-playfair text-2xl font-bold tracking-tight">আপনার কোনো লক্ষ্য এখনও যুক্ত করা হয়নি</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              জীবনকে সফল এবং সুশৃঙ্খল করতে আপনার স্বপ্ন ও কাজের রূপরেখা তৈরি করুন। আজই আপনার প্রথম বড় লক্ষ্যটি যোগ করুন!
            </p>
          </div>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
            className="rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform px-8 h-14 text-base cursor-pointer"
          >
            প্রথম লক্ষ্য যোগ করুন
          </Button>
        </motion.div>
      )}

      {/* Add New Goal Dialog Modal */}
      <AddGoalDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={fetchGoals}
      />
    </div>
  );
}
