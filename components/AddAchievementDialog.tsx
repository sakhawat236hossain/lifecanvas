"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import { toast } from "sonner";
import { Loader2, ImagePlus } from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { colorPresets } from "./AddGoalDialog";

export const iconPresets = [
  { name: "Trophy 🏆", value: "Trophy" },
  { name: "Medal 🏅", value: "Medal" },
  { name: "Crown 👑", value: "Crown" },
  { name: "Star ⭐", value: "Star" },
  { name: "Sparkles ✨", value: "Sparkles" },
  { name: "BookOpen 📖", value: "BookOpen" },
];

const achievementSchema = z.object({
  title: z.string().min(2, "অর্জনের শিরোনাম কমপক্ষে ২ অক্ষরের হতে হবে").max(80),
  description: z.string().max(200).optional(),
  icon: z.string().min(1, "একটি আইকন নির্বাচন করুন -->"),
  points: z.number().min(0, "পয়েন্ট ০ বা তার বেশি হতে হবে"),
  date: z.string().min(1, "তারিখ দেওয়া আবশ্যক"),
  color: z.string().min(1, "কালার থিম সিলেক্ট করুন"),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

interface AddAchievementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddAchievementDialog({ isOpen, onClose, onSuccess, initialData }: AddAchievementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorPresets[0].value); // Sunset Orange default for achievement
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: iconPresets[0].value,
      points: 100,
      date: new Date().toISOString().split("T")[0],
      color: colorPresets[0].value,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        description: initialData.description || "",
        icon: initialData.icon || iconPresets[0].value,
        points: Number(initialData.points) || 100,
        date: initialData.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        color: initialData.color || colorPresets[0].value,
      });
      setSelectedColor(initialData.color || colorPresets[0].value);
      setImagePreview(initialData.image || null);
      setImageFile(null);
    } else {
      reset({
        title: "",
        description: "",
        icon: iconPresets[0].value,
        points: 100,
        date: new Date().toISOString().split("T")[0],
        color: colorPresets[0].value,
      });
      setSelectedColor(colorPresets[0].value);
      setImagePreview(null);
      setImageFile(null);
    }
  }, [initialData, reset, isOpen]);

  const handleColorSelect = (colorValue: string) => {
    setSelectedColor(colorValue);
    setValue("color", colorValue);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: AchievementFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = initialData?.image || null;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const payload = {
        ...values,
        image: imageUrl,
      };

      if (initialData?._id) {
        await axios.patch(`/api/achievements/${initialData._id}`, payload);
        toast.success("অর্জন সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await axios.post("/api/achievements", payload);
        toast.success("নতুন অর্জন সফলভাবে যুক্ত করা হয়েছে!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save achievement:", error);
      toast.error("অর্জন সংরক্ষণ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-white/10 bg-background/95 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl font-bold">
            {initialData ? "অর্জনটি সম্পাদন করুন" : "নতুন অর্জন যোগ করুন"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            আপনার জীবনে অর্জন করা বড় বা ছোট যেকোনো মাইলফলক স্বর্ণাক্ষরে লিখে রাখুন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">অর্জনের শিরোনাম</Label>
            <Input
              id="title"
              placeholder="যেমন: ম্যারাথন রান শেষ করেছি, নতুন চাকরি পেয়েছি..."
              className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
              {...register("title")}
            />
            {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">বিস্তারিত বিবরণ (ঐচ্ছিক)</Label>
            <Input
              id="description"
              placeholder="অর্জনটি সম্পর্কে সংক্ষেপে কিছু লিখুন..."
              className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
              {...register("description")}
            />
            {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="points" className="text-sm font-medium">XP পয়েন্ট</Label>
              <Input
                id="points"
                type="number"
                placeholder="যেমন: ১০০"
                className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                {...register("points", { valueAsNumber: true })}
              />
              {errors.points && <p className="text-destructive text-xs">{errors.points.message}</p>}
            </div>

            <div className="space-y-2 col-span-1">
              <Label className="text-sm font-medium">ব্যাজ আইকন</Label>
              <Select
                defaultValue={initialData?.icon || iconPresets[0].value}
                onValueChange={(val) => setValue("icon", val)}
              >
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue placeholder="আইকন" />
                </SelectTrigger>
                <SelectContent>
                  {iconPresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-1">
              <Label htmlFor="date" className="text-sm font-medium">অর্জনের তারিখ</Label>
              <Input
                id="date"
                type="date"
                className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                {...register("date")}
              />
              {errors.date && <p className="text-destructive text-xs">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">অ্যাওয়ার্ড থিম কালার</Label>
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

          <div className="space-y-3 pt-2 border-t border-white/5">
            <Label className="text-sm font-medium">অর্জনের ছবি (ঐচ্ছিক)</Label>
            <div className="flex items-center gap-6">
              <label 
                htmlFor="achievement-image-upload" 
                className="flex flex-col items-center justify-center w-full max-w-[150px] h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all select-none"
              >
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <ImagePlus className="w-6 h-6 mb-1 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">ছবি নির্বাচন করুন</span>
                </div>
                <input 
                  id="achievement-image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
              
              {imagePreview && (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-xl border border-white/10 shrink-0">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
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
                "অর্জন আপডেট করুন"
              ) : (
                "অর্জন যুক্ত করুন"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
