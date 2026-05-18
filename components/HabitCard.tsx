"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Trash2, Calendar } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Habit {
  _id: string;
  title: string;
  color: string;
  history: string[];
  streak: number;
  createdAt: string;
  updatedAt: string;
}

interface HabitCardProps {
  habit: Habit;
  index: number;
  onUpdate: () => void;
}

export function HabitCard({ habit, index, onUpdate }: HabitCardProps) {
  const [localHistory, setLocalHistory] = useState<string[]>(habit.history || []);
  const [localStreak, setLocalStreak] = useState(habit.streak || 0);

  // Sync state with incoming props
  useEffect(() => {
    setLocalHistory(habit.history || []);
    setLocalStreak(habit.streak || 0);
  }, [habit.history, habit.streak]);

  // Generates past 7 days (from 6 days ago up to today, left-to-right)
  const getPast7Days = () => {
    const days = [];
    const daysOfWeek = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      days.push({
        dateStr,
        dayLabel: daysOfWeek[date.getDay()],
        dayNum: date.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  };

  const past7Days = getPast7Days();

  const handleToggleDate = async (dateStr: string) => {
    const alreadyCompleted = localHistory.includes(dateStr);
    const updatedHistory = alreadyCompleted
      ? localHistory.filter(d => d !== dateStr)
      : [...localHistory, dateStr];

    // Optimistic UI updates
    const previousHistory = localHistory;
    setLocalHistory(updatedHistory);

    try {
      const res = await axios.patch(`/api/habits/${habit._id}`, { date: dateStr });
      setLocalStreak(res.data.streak);
      onUpdate();
    } catch (error) {
      console.error("Failed to toggle date:", error);
      toast.error("আপডেট করতে ব্যর্থ হয়েছে।");
      setLocalHistory(previousHistory); // Rollback
    }
  };

  const handleDelete = () => {
    toast(`আপনি কি নিশ্চিতভাবে "${habit.title}" অভ্যাসটি মুছে ফেলতে চান?`, {
      action: {
        label: "হ্যাঁ, মুছুন",
        onClick: async () => {
          try {
            await axios.delete(`/api/habits/${habit._id}`);
            toast.success("অভ্যাসটি সফলভাবে মুছে ফেলা হয়েছে!");
            onUpdate();
          } catch (error) {
            console.error("Failed to delete habit:", error);
            toast.error("অভ্যাস মুছে ফেলতে ব্যর্থ হয়েছে।");
          }
        },
      },
    });
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
        {/* Top Accent Gradient Highlight */}
        <div className={cn("absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r", habit.color)} />

        <CardHeader className="p-6 pb-2 flex flex-row items-center justify-between space-y-0">
          <h3 className="font-playfair text-xl font-bold tracking-tight line-clamp-1 text-foreground group-hover:text-primary transition-colors duration-300 pr-4">
            {habit.title}
          </h3>

          <div className="flex items-center gap-2">
            {localStreak > 0 && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold"
                title="চলতি ধারাবাহিকতা"
              >
                <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{localStreak} দিন</span>
              </motion.div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-white/5 hover:bg-white/10 hover:text-destructive opacity-40 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
              onClick={handleDelete}
              title="মুছে ফেলুন"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-6 pt-2 flex flex-col justify-end space-y-4">
          <div className="text-xs text-muted-foreground/80 font-medium mb-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span>গত ৭ দিনের ট্র্যাকার (আজকে ডানে):</span>
          </div>

          {/* Past 7 Days Interactive Bubbles Grid */}
          <div className="grid grid-cols-7 gap-2 bg-white/5 p-3 rounded-2xl border border-white/5">
            {past7Days.map((day) => {
              const isChecked = localHistory.includes(day.dateStr);

              return (
                <div key={day.dateStr} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground/60 font-semibold">{day.dayLabel}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleDate(day.dateStr)}
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center border cursor-pointer transition-all duration-300 active:scale-90 hover:scale-105",
                      isChecked
                        ? cn("bg-gradient-to-br text-primary-foreground border-transparent shadow-md shadow-primary/20", habit.color)
                        : day.isToday
                        ? "border-primary/50 bg-primary/5 text-muted-foreground hover:bg-primary/10"
                        : "border-white/10 bg-white/5 text-muted-foreground/45 hover:bg-white/10"
                    )}
                    title={isChecked ? "সম্পন্ন" : "অসম্পূর্ণ"}
                  >
                    {isChecked ? (
                      <Check className="h-4.5 w-4.5 stroke-[3]" />
                    ) : (
                      <span className="text-xs font-bold font-mono">{day.dayNum}</span>
                    )}
                  </button>
                  {day.isToday && (
                    <span className="text-[8px] bg-primary/20 text-primary-foreground px-1 py-0.2 rounded-full font-bold uppercase tracking-wide mt-0.5 scale-90">
                      আজ
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
