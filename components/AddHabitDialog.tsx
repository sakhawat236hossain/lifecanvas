"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { colorPresets } from "./AddGoalDialog";

const habitSchema = z.object({
  title: z.string().min(2, "অভ্যাসের নাম কমপক্ষে ২ অক্ষরের হতে হবে").max(80),
  color: z.string().min(1, "কালার থিম সিলেক্ট করুন"),
});

type HabitFormValues = z.infer<typeof habitSchema>;

interface AddHabitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddHabitDialog({ isOpen, onClose, onSuccess }: AddHabitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorPresets[2].value); // Default to emerald for habit

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      title: "",
      color: colorPresets[2].value,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        color: colorPresets[2].value,
      });
      setSelectedColor(colorPresets[2].value);
    }
  }, [isOpen, reset]);

  const handleColorSelect = (colorValue: string) => {
    setSelectedColor(colorValue);
    setValue("color", colorValue);
  };

  const onSubmit = async (values: HabitFormValues) => {
    setIsSubmitting(true);
    try {
      await axios.post("/api/habits", values);
      toast.success("নতুন অভ্যাস সফলভাবে যুক্ত করা হয়েছে!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save habit:", error);
      toast.error("অভ্যাস সংরক্ষণ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] border-white/10 bg-background/95 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl font-bold">নতুন অভ্যাস যোগ করুন</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            আপনার প্রতিদিনের রুটিন বা ভালো অভ্যাসটি ট্র্যাক করতে নিচে নাম ও রঙ নির্বাচন করুন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">অভ্যাসের নাম</Label>
            <Input
              id="title"
              placeholder="যেমন: সকালে হাঁটা, ব্যায়াম করা, ১০ পৃষ্ঠা পড়া..."
              className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
              {...register("title")}
            />
            {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">থিম কালার নির্বাচন করুন</Label>
            <div className="grid grid-cols-6 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleColorSelect(preset.value)}
                  className={cn(
                    "h-10 w-full rounded-lg bg-gradient-to-br cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center border border-white/5",
                    preset.value,
                    selectedColor === preset.value
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                      : "opacity-80"
                  )}
                  title={preset.name}
                >
                  {selectedColor === preset.value && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
            </div>
            <input type="hidden" {...register("color")} />
          </div>

          <DialogFooter className="pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-white/10 hover:bg-white/5 rounded-full"
            >
              বাতিল করুন
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  যোগ হচ্ছে...
                </>
              ) : (
                "যুক্ত করুন"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
