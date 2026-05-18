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

// Presets for gorgeous card gradients
export const colorPresets = [
  { name: "Sunset Orange", value: "from-amber-400 to-orange-600" },
  { name: "Rose Gold", value: "from-pink-500 to-rose-600" },
  { name: "Emerald Breeze", value: "from-emerald-400 to-teal-600" },
  { name: "Oceanic Blue", value: "from-cyan-400 to-blue-600" },
  { name: "Royal Indigo", value: "from-purple-500 to-indigo-600" },
  { name: "Cosmic Neon", value: "from-violet-600 to-fuchsia-600" },
];

const goalSchema = z.object({
  title: z.string().min(3, "শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে").max(80),
  target: z.number().min(1, "টার্গেট কমপক্ষে ১ হতে হবে"),
  current: z.number().min(0, "অগ্রগতি ০ বা তার বেশি হতে হবে"),
  unit: z.string().min(1, "ইউনিট আবশ্যক (যেমন: %, ঘণ্টা, টি)").max(15),
  deadline: z.string().min(1, "তারিখ দেওয়া আবশ্যক"),
  color: z.string().min(1, "কালার থিম সিলেক্ট করুন"),
});

type GoalFormValues = z.infer<typeof goalSchema>;

interface AddGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddGoalDialog({ isOpen, onClose, onSuccess, initialData }: AddGoalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorPresets[0].value);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      target: 100,
      current: 0,
      unit: "%",
      deadline: new Date().toISOString().split("T")[0],
      color: colorPresets[0].value,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        target: Number(initialData.target),
        current: Number(initialData.current),
        unit: initialData.unit || "%",
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        color: initialData.color || colorPresets[0].value,
      });
      setSelectedColor(initialData.color || colorPresets[0].value);
    } else {
      reset({
        title: "",
        target: 100,
        current: 0,
        unit: "%",
        deadline: new Date().toISOString().split("T")[0],
        color: colorPresets[0].value,
      });
      setSelectedColor(colorPresets[0].value);
    }
  }, [initialData, reset, isOpen]);

  const handleColorSelect = (colorValue: string) => {
    setSelectedColor(colorValue);
    setValue("color", colorValue);
  };

  const onSubmit = async (values: GoalFormValues) => {
    setIsSubmitting(true);
    try {
      if (initialData?._id) {
        // Edit Mode
        await axios.patch(`/api/goals/${initialData._id}`, values);
        toast.success("লক্ষ্য সফলভাবে আপডেট করা হয়েছে!");
      } else {
        // Create Mode
        await axios.post("/api/goals", values);
        toast.success("নতুন লক্ষ্য সফলভাবে যোগ করা হয়েছে!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save goal:", error);
      toast.error("লক্ষ্য সংরক্ষণ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-white/10 bg-background/95 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl font-bold">
            {initialData ? "লক্ষ্যটি সম্পাদন করুন" : "নতুন লক্ষ্য যোগ করুন"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            আপনার লক্ষ্যটি ডাইনামিক করতে নিচের তথ্যগুলো পূরণ করুন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">লক্ষ্যের নাম</Label>
            <Input
              id="title"
              placeholder="যেমন: গীটার শেখা, বই পড়া..."
              className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
              {...register("title")}
            />
            {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target" className="text-sm font-medium">টার্গেট / লক্ষ্যমাত্রা</Label>
              <Input
                id="target"
                type="number"
                placeholder="যেমন: ১০০"
                className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                {...register("target", { valueAsNumber: true })}
              />
              {errors.target && <p className="text-destructive text-xs">{errors.target.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current" className="text-sm font-medium">বর্তমান অগ্রগতি</Label>
              <Input
                id="current"
                type="number"
                placeholder="যেমন: ০"
                className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                {...register("current", { valueAsNumber: true })}
              />
              {errors.current && <p className="text-destructive text-xs">{errors.current.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-sm font-medium">প্রগ্রেস ইউনিট</Label>
              <Input
                id="unit"
                placeholder="যেমন: %, ঘণ্টা, টি"
                className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                {...register("unit")}
              />
              {errors.unit && <p className="text-destructive text-xs">{errors.unit.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm font-medium">শেষ সময় (ডেডলাইন)</Label>
              <Input
                id="deadline"
                type="date"
                className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                {...register("deadline")}
              />
              {errors.deadline && <p className="text-destructive text-xs">{errors.deadline.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">কালার থিম নির্বাচন করুন</Label>
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
                  সংরক্ষণ হচ্ছে...
                </>
              ) : initialData ? (
                "লক্ষ্য আপডেট করুন"
              ) : (
                "লক্ষ্য সংরক্ষণ করুন"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
