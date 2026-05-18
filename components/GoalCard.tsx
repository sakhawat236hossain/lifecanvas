"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isPast } from "date-fns";
import { CalendarDays, Edit3, Plus, Minus, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddGoalDialog } from "./AddGoalDialog";
import { cn } from "@/lib/utils";

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

interface GoalCardProps {
  goal: Goal;
  index: number;
  onUpdate: () => void;
}

export function GoalCard({ goal, index, onUpdate }: GoalCardProps) {
  const [currentProgress, setCurrentProgress] = useState(goal.current);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Sync state if prop changes (e.g. from parent refresh or editing)
  useEffect(() => {
    setCurrentProgress(goal.current);
  }, [goal.current]);

  const percentage = Math.min(100, Math.max(0, Math.round((currentProgress / goal.target) * 100)));

  const handleProgressChange = async (amount: number) => {
    const newProgress = Math.max(0, Math.min(goal.target, currentProgress + amount));
    if (newProgress === currentProgress) return;

    // Optimistic update
    const previousProgress = currentProgress;
    setCurrentProgress(newProgress);

    try {
      await axios.patch(`/api/goals/${goal._id}`, { current: newProgress });
      // Call parent update to sync DB state smoothly
      onUpdate();
    } catch (error) {
      console.error("Failed to update progress:", error);
      toast.error("প্রগ্রেস আপডেট করতে ব্যর্থ হয়েছে।");
      setCurrentProgress(previousProgress); // Rollback on failure
    }
  };

  const handleDelete = () => {
    toast(`আপনি কি নিশ্চিতভাবে "${goal.title}" লক্ষ্যটি মুছে ফেলতে চান?`, {
      action: {
        label: "হ্যাঁ, মুছুন",
        onClick: async () => {
          try {
            await axios.delete(`/api/goals/${goal._id}`);
            toast.success("লক্ষ্যটি সফলভাবে মুছে ফেলা হয়েছে!");
            onUpdate();
          } catch (error) {
            console.error("Failed to delete goal:", error);
            toast.error("লক্ষ্য মুছে ফেলতে ব্যর্থ হয়েছে।");
          }
        },
      },
    });
  };

  const getDaysRemaining = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isPast(targetDate) && targetDate.getDate() !== today.getDate()) {
      return "সময় পার হয়ে গেছে";
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "আজই শেষ দিন!";
    } else if (diffDays < 0) {
      return "সময় পার হয়ে গেছে";
    }

    return `${diffDays} দিন বাকি`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="h-full flex"
    >
      <Card className="relative overflow-hidden border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/10 h-full flex flex-col w-full group">
        {/* Top Gradient Highlight */}
        <div className={cn("absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r", goal.color)} />

        <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1 pr-6">
            <h3 className="font-playfair text-xl font-bold tracking-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
              {goal.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-white/5 hover:bg-white/10 hover:text-foreground cursor-pointer"
              onClick={() => setIsEditDialogOpen(true)}
              title="এডিট করুন"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-white/5 hover:bg-white/10 hover:text-destructive cursor-pointer"
              onClick={handleDelete}
              title="মুছে ফেলুন"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-6 pt-2 flex flex-col justify-between space-y-6">
          {/* Progress Details */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-extrabold font-playfair tracking-tight">
                {percentage}%
              </span>
              <span className="text-sm text-muted-foreground font-medium">
                {currentProgress} / {goal.target} {goal.unit}
              </span>
            </div>

            {/* Custom Premium Animated Progress Bar */}
            <div className="relative h-2.5 w-full rounded-full bg-white/10 overflow-hidden border border-white/5">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", goal.color)}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Adjust Progress Controls */}
          <div className="flex items-center justify-between gap-4 bg-white/5 p-2.5 rounded-2xl border border-white/5">
            <span className="text-xs font-semibold text-muted-foreground/80 pl-2">অগ্রগতি আপডেট:</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentProgress <= 0}
                onClick={() => handleProgressChange(-1)}
                className="h-8 w-8 rounded-full border-white/10 hover:bg-white/10 cursor-pointer active:scale-90 transition-transform"
                title="-১"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-bold min-w-[20px] text-center font-mono">
                {currentProgress}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={currentProgress >= goal.target}
                onClick={() => handleProgressChange(1)}
                className="h-8 w-8 rounded-full border-white/10 hover:bg-white/10 cursor-pointer active:scale-90 transition-transform"
                title="+১"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground bg-white/[0.01]">
          <div className="flex items-center gap-1.5 font-medium">
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/75" />
            <span>ডেডলাইন: {format(new Date(goal.deadline), "MMM d, yyyy")}</span>
          </div>

          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-[10px] font-bold border",
              getDaysRemaining(goal.deadline) === "সময় পার হয়ে গেছে"
                ? "bg-destructive/10 border-destructive/20 text-destructive-foreground"
                : getDaysRemaining(goal.deadline) === "আজই শেষ দিন!"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-primary/10 border-primary/20 text-primary-foreground"
            )}
          >
            {getDaysRemaining(goal.deadline)}
          </span>
        </CardFooter>
      </Card>

      {/* Edit Goal Dialog Modal */}
      <AddGoalDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={onUpdate}
        initialData={goal}
      />
    </motion.div>
  );
}
