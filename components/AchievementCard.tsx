"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Calendar, Trophy, Medal, Crown, Star, Sparkles, BookOpen, Award } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddAchievementDialog } from "@/components/AddAchievementDialog";
import { cn } from "@/lib/utils";

const iconMap: { [key: string]: React.ComponentType<any> } = {
  Trophy,
  Medal,
  Crown,
  Star,
  Sparkles,
  BookOpen
};

interface Achievement {
  _id: string;
  title: string;
  description?: string;
  icon: string;
  points: number;
  date: string;
  color: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
  onUpdate: () => void;
}

export function AchievementCard({ achievement, index, onUpdate }: AchievementCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const IconComponent = iconMap[achievement.icon] || Award;

  const formattedDate = new Date(achievement.date).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDelete = () => {
    toast(`আপনি কি নিশ্চিতভাবে "${achievement.title}" মাইলফলকটি মুছে ফেলতে চান?`, {
      action: {
        label: "হ্যাঁ, মুছুন",
        onClick: async () => {
          try {
            await axios.delete(`/api/achievements/${achievement._id}`);
            toast.success("মাইলফলক সফলভাবে মুছে ফেলা হয়েছে!");
            onUpdate();
          } catch (error) {
            console.error("Failed to delete achievement:", error);
            toast.error("মুছে ফেলতে ব্যর্থ হয়েছে।");
          }
        },
      },
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        whileHover={{ scale: 1.03, rotateY: 3, rotateX: -3 }}
        className="h-full"
      >
        <Card className="relative overflow-hidden border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] flex flex-col justify-between h-full group p-6 space-y-4">
          {/* Top Left Gradient Spotlight Glow */}
          <div className={cn("absolute -top-12 -left-12 w-28 h-28 rounded-full blur-[40px] opacity-20 -z-10 bg-gradient-to-br", achievement.color)} />

          <div className="flex items-start justify-between gap-4">
            {/* Round Icon container */}
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br text-primary-foreground shadow-lg shrink-0", achievement.color)}>
              <IconComponent className="h-7 w-7 text-white stroke-[2]" />
            </div>

            {/* XP Points and Action buttons */}
            <div className="flex items-center gap-1.5 self-start">
              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-black tracking-wide shrink-0 shadow-inner">
                +{achievement.points} XP
              </span>

              {/* Hover Actions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-white/10 cursor-pointer"
                  onClick={() => setIsEditDialogOpen(true)}
                  title="সম্পাদনা করুন"
                >
                  <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-white/10 hover:text-destructive cursor-pointer"
                  onClick={handleDelete}
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Achievement Image if exists */}
          {achievement.image && (
            <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-inner border border-white/5 shrink-0">
              <img 
                src={achievement.image} 
                alt={achievement.title} 
                className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
          )}

          {/* Texts content */}
          <div className="space-y-2 flex-1 flex flex-col justify-end">
            <h3 className="font-playfair text-xl font-bold tracking-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
              {achievement.title}
            </h3>
            {achievement.description && (
              <p className="text-muted-foreground/80 text-sm leading-relaxed line-clamp-3">
                {achievement.description}
              </p>
            )}
            
            <div className="pt-2 flex items-center gap-1.5 text-xs text-muted-foreground/60 font-semibold font-mono">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Edit Form Dialog Modal */}
      <AddAchievementDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={onUpdate}
        initialData={achievement}
      />
    </>
  );
}
