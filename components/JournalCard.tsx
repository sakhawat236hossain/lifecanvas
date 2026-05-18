"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Trash2, Calendar, BookOpen, Quote, Smile, Mic, Volume2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddJournalDialog } from "@/components/AddJournalDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface Journal {
  _id: string;
  title: string;
  content: string;
  mood: string;
  date: string;
  audio?: string;
  createdAt: string;
  updatedAt: string;
}

interface JournalCardProps {
  journal: Journal;
  index: number;
  onUpdate: () => void;
}

export function JournalCard({ journal, index, onUpdate }: JournalCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const formattedDate = new Date(journal.date).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the view modal
    toast(`আপনি কি নিশ্চিতভাবে "${journal.title}" দিনলিপিটি মুছে ফেলতে চান?`, {
      action: {
        label: "হ্যাঁ, মুছুন",
        onClick: async () => {
          try {
            await axios.delete(`/api/journals/${journal._id}`);
            toast.success("দিনলিপি সফলভাবে মুছে ফেলা হয়েছে!");
            onUpdate();
          } catch (error) {
            console.error("Failed to delete journal:", error);
            toast.error("দিনলিপি মুছে ফেলতে ব্যর্থ হয়েছে।");
          }
        },
      },
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        whileHover={{ y: -6 }}
        onClick={() => setIsViewOpen(true)}
        className="cursor-pointer h-full"
      >
        <Card className="relative overflow-hidden border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:shadow-2xl hover:shadow-primary/5 flex flex-col justify-between h-full group p-6 space-y-4">
          
          <div className="space-y-3">
            {/* Top row with Date & Actions */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-white/15 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditDialogOpen(true);
                  }}
                  title="সম্পাদনা করুন"
                >
                  <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-white/15 hover:text-destructive cursor-pointer"
                  onClick={handleDelete}
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-playfair text-xl font-bold tracking-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300">
              {journal.title}
            </h3>

            {/* Truncated Snippet */}
            <p className="text-muted-foreground/80 text-sm leading-relaxed line-clamp-4 font-serif">
              {journal.content}
            </p>
          </div>

          {/* Bottom row with Mood Indicator */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">
                <Smile className="h-3.5 w-3.5 text-primary" />
                <span>{journal.mood}</span>
              </span>

              {journal.audio && (
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground" title="ভয়েস ডায়েরি সংযুক্ত">
                  <Mic className="h-3.5 w-3.5 text-primary" />
                </span>
              )}
            </div>
            <span className="text-xs text-primary/70 font-semibold group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-1">
              পড়ুন <BookOpen className="h-3.5 w-3.5" />
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Elegant Read View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[650px] border-white/10 bg-background/95 backdrop-blur-lg shadow-2xl p-8 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-4 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formattedDate}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">
                <span>অনুভূতি: {journal.mood}</span>
              </span>
            </div>
            <DialogTitle className="font-playfair text-3xl font-bold tracking-tight text-foreground leading-tight">
              {journal.title}
            </DialogTitle>
          </DialogHeader>

          {/* Full readable content body */}
          <div className="py-6 relative">
            <Quote className="absolute top-2 left-0 h-10 w-10 text-primary/10 -translate-x-2 -translate-y-2 select-none" />
            
            {/* Audio note player if exists */}
            {journal.audio && (
              <div className="mb-6 bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
                <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4 text-primary animate-pulse" />
                  ভয়েস নোট শুনুন:
                </span>
                <audio src={journal.audio} controls className="w-full h-10 rounded-full bg-transparent border border-white/5" />
              </div>
            )}

            <p className="text-foreground/90 font-serif leading-relaxed text-lg whitespace-pre-wrap pl-6 relative z-10">
              {journal.content}
            </p>
          </div>

          <DialogFooter className="pt-6 border-t border-white/5 flex flex-row items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-white/10 hover:bg-white/5 rounded-full px-5"
                onClick={() => {
                  setIsViewOpen(false);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                সম্পাদনা করুন
              </Button>
              <Button
                variant="destructive"
                className="rounded-full px-5"
                onClick={() => {
                  toast("আপনি কি নিশ্চিতভাবে এই দিনলিপিটি মুছে ফেলতে চান?", {
                    action: {
                      label: "হ্যাঁ, মুছুন",
                      onClick: async () => {
                        try {
                          await axios.delete(`/api/journals/${journal._id}`);
                          toast.success("দিনলিপি সফলভাবে মুছে ফেলা হয়েছে!");
                          setIsViewOpen(false);
                          onUpdate();
                        } catch (e) {
                          toast.error("মুছে ফেলতে ব্যর্থ হয়েছে।");
                        }
                      },
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                মুছে ফেলুন
              </Button>
            </div>
            <Button
              className="rounded-full px-6"
              onClick={() => setIsViewOpen(false)}
            >
              বন্ধ করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog Modal */}
      <AddJournalDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={onUpdate}
        initialData={journal}
      />
    </>
  );
}
