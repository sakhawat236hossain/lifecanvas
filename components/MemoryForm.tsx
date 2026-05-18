"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { CalendarIcon, ImagePlus, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { uploadImageToCloudinary } from "@/lib/cloudinary";

const topics = [
  "ভালোবাসার গল্প", "দুঃখের স্মৃতি", "সাফল্য", "ব্যর্থতা", "বন্ধুত্ব",
  "বিশ্বাসঘাতকতা", "ক্যারিয়ার", "শেখা", "ব্যবসা", "কোডিং যাত্রা",
  "মাদরাসা জীবন", "বিষণ্ণতা", "স্বপ্ন", "অনুপ্রেরণা", "টার্নিং পয়েন্ট"
];

const moods = ["আনন্দদায়ক", "স্মৃতিকাতর", "বিষণ্ণ", "গর্বিত", "অনুশোচনাপূর্ণ", "কৃতজ্ঞ", "রাগান্বিত", "শান্তিপূর্ণ", "সাধারণ"];

const memorySchema = z.object({
  title: z.string().min(3, "শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে").max(100),
  topic: z.string().min(1, "অনুগ্রহ করে একটি বিষয় নির্বাচন করুন"),
  description: z.string().min(10, "অনুগ্রহ করে বিস্তারিত লিখুন (কমপক্ষে ১০ অক্ষর)"),
  mood: z.string().min(1, "অনুগ্রহ করে মেজাজ নির্বাচন করুন"),
  tags: z.string(),
  date: z.string().min(1, "তারিখ দেওয়া আবশ্যক"),
  location: z.string().optional(),
  privacy: z.enum(["সবার জন্য", "ব্যক্তিগত", "শুধুমাত্র বন্ধুদের জন্য"]),
});

type MemoryFormValues = z.infer<typeof memorySchema>;

export function MemoryForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MemoryFormValues>({
    resolver: zodResolver(memorySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      privacy: "ব্যক্তিগত",
    }
  });

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

  const onSubmit = async (data: MemoryFormValues) => {
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const memoryData = {
        ...data,
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        image: imageUrl,
      };

      await axios.post("/api/memories", memoryData);
      
      router.push("/memories");
      router.refresh();
    } catch (error) {
      console.error("Failed to save memory:", error);
      alert("স্মৃতি সংরক্ষণ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-white/10 bg-background/60 backdrop-blur-md shadow-2xl">
      <CardContent className="p-6 sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-2">
            <Label htmlFor="title" className="text-lg font-playfair flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> গল্পটা কী?
            </Label>
            <Input 
              id="title" 
              placeholder="একটি সুন্দর সন্ধ্যা..." 
              className="text-xl py-6 border-white/10 bg-white/5 focus-visible:ring-primary/50"
              {...register("title")} 
            />
            {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="topic">বিষয় / বিভাগ</Label>
              <Select onValueChange={(val) => setValue("topic", val)}>
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue placeholder="একটি বিষয় নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.topic && <p className="text-destructive text-sm mt-1">{errors.topic.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">আপনার কেমন লেগেছিল?</Label>
              <Select onValueChange={(val) => setValue("mood", val)}>
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue placeholder="মেজাজ নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mood && <p className="text-destructive text-sm mt-1">{errors.mood.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">বিস্তারিত</Label>
            <Textarea 
              id="description" 
              placeholder="পুরো গল্পটা বলুন..." 
              className="min-h-[200px] resize-y border-white/10 bg-white/5"
              {...register("description")}
            />
            {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">স্মৃতির তারিখ</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="date" 
                  type="date" 
                  className="pl-9 border-white/10 bg-white/5"
                  {...register("date")} 
                />
              </div>
              {errors.date && <p className="text-destructive text-sm mt-1">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">স্থান (ঐচ্ছিক)</Label>
              <Input 
                id="location" 
                placeholder="কোথায় ঘটেছিল?" 
                className="border-white/10 bg-white/5"
                {...register("location")} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">ট্যাগ (কমা দিয়ে আলাদা করুন)</Label>
            <Input 
              id="tags" 
              placeholder="পরিবার, ট্যুর, সাফল্য..." 
              className="border-white/10 bg-white/5"
              {...register("tags")} 
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <Label>কভার ছবি</Label>
            <div className="flex items-center gap-6">
              <label 
                htmlFor="image-upload" 
                className="flex flex-col items-center justify-center w-full max-w-[200px] h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-8 h-8 mb-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">আপলোড করতে ক্লিক করুন</p>
                </div>
                <input 
                  id="image-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
              
              {imagePreview && (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden shadow-xl border border-white/10">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-6 text-lg font-medium rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  সংরক্ষণ করা হচ্ছে...
                </>
              ) : (
                "স্মৃতি সংরক্ষণ করুন"
              )}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
