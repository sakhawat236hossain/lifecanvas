"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Mic, Square, Trash } from "lucide-react";
import { uploadAudioToCloudinary } from "@/lib/cloudinary";

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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const moodsList = [
  { name: "আনন্দদায়ক 😊", value: "আনন্দদায়ক 😊" },
  { name: "শান্তিপূর্ণ 🧘", value: "শান্তিপূর্ণ 🧘" },
  { name: "স্মৃতিকাতর 🥹", value: "স্মৃতিকাতর 🥹" },
  { name: "বিষণ্ণ 😔", value: "বিষণ্ণ 😔" },
  { name: "কৃতজ্ঞ 💖", value: "কৃতজ্ঞ 💖" },
  { name: "উত্তেজিত 🤩", value: "উত্তেজিত 🤩" },
];

const journalSchema = z.object({
  title: z.string().min(2, "শিরোনাম কমপক্ষে ২ অক্ষরের হতে হবে").max(100),
  mood: z.string().min(1, "অনুগ্রহ করে অনুভূতি সিলেক্ট করুন"),
  date: z.string().min(1, "তারিখ দেওয়া আবশ্যক"),
  content: z.string().min(5, "দিনলিপি কমপক্ষে ৫ অক্ষরের হতে হবে"),
});

type JournalFormValues = z.infer<typeof journalSchema>;

interface AddJournalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function AddJournalDialog({ isOpen, onClose, onSuccess, initialData }: AddJournalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialData?.audio || null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      mood: moodsList[1].value,
      date: new Date().toISOString().split("T")[0],
      content: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        mood: initialData.mood || moodsList[1].value,
        date: initialData.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        content: initialData.content,
      });
      setAudioUrl(initialData.audio || null);
      setAudioBlob(null);
    } else {
      reset({
        title: "",
        mood: moodsList[1].value,
        date: new Date().toISOString().split("T")[0],
        content: "",
      });
      setAudioUrl(null);
      setAudioBlob(null);
    }
  }, [initialData, reset, isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      setAudioChunks(chunks);
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast.error("মাইক্রোফোন অ্যাক্সেস করতে ব্যর্থ হয়েছে।");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setAudioChunks([]);
  };

  const onSubmit = async (values: JournalFormValues) => {
    setIsSubmitting(true);
    try {
      let finalAudioUrl = initialData?.audio || null;
      if (audioBlob) {
        const uploadedUrl = await uploadAudioToCloudinary(audioBlob);
        if (uploadedUrl) {
          finalAudioUrl = uploadedUrl;
        }
      }

      const payload = {
        ...values,
        audio: finalAudioUrl,
      };

      if (initialData?._id) {
        await axios.patch(`/api/journals/${initialData._id}`, payload);
        toast.success("দিনলিপি সফলভাবে আপডেট করা হয়েছে!");
      } else {
        await axios.post("/api/journals", payload);
        toast.success("নতুন দিনলিপি সফলভাবে সংরক্ষণ করা হয়েছে!");
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save journal:", error);
      toast.error("দিনলিপি সংরক্ষণ করতে ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] border-white/10 bg-background/95 backdrop-blur-md shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl font-bold">
            {initialData ? "দিনলিপি সম্পাদনা করুন" : "নতুন দিনলিপি লিখুন"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            আপনার আজকের ভাবনা, কাজের রূপরেখা বা স্মরণীয় মুহূর্তগুলো লিখে রাখুন।
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">শিরোনাম</Label>
            <Input
              id="title"
              placeholder="আজকের দিনলিপির একটি সুন্দর শিরোনাম..."
              className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
              {...register("title")}
            />
            {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">আপনার অনুভূতি (Mood)</Label>
              <Select
                defaultValue={initialData?.mood || moodsList[1].value}
                onValueChange={(val) => setValue("mood", val)}
              >
                <SelectTrigger className="border-white/10 bg-white/5">
                  <SelectValue placeholder="কেমন লাগছে?" />
                </SelectTrigger>
                <SelectContent>
                  {moodsList.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      {mood.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mood && <p className="text-destructive text-xs">{errors.mood.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">তারিখ</Label>
              <Input
                id="date"
                type="date"
                className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                {...register("date")}
              />
              {errors.date && <p className="text-destructive text-xs">{errors.date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">বিস্তারিত দিনলিপি</Label>
            <Textarea
              id="content"
              placeholder="আপনার সমস্ত ভাবনা ও অনুভূতির কথা বিস্তারিত লিখুন..."
              className="min-h-[180px] border-white/10 bg-white/5 focus-visible:ring-primary/50 resize-y"
              {...register("content")}
            />
            {errors.content && <p className="text-destructive text-xs">{errors.content.message}</p>}
          </div>

          {/* Voice Recorder Section */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Mic className="h-4 w-4 text-primary" />
              <span>কণ্ঠস্বর রেকর্ড করুন (ভয়েস ডায়েরি - ঐচ্ছিক)</span>
            </Label>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4">
              {!audioUrl ? (
                <div className="flex items-center gap-4 w-full">
                  {isRecording ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-semibold text-red-400 animate-pulse">রেকর্ড হচ্ছে...</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={stopRecording}
                        className="rounded-full border-red-500/20 hover:bg-red-500/10 hover:text-red-400 text-red-500 gap-1.5 h-9"
                      >
                        <Square className="h-4 w-4 fill-red-500" />
                        রেকর্ডিং থামান
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs text-muted-foreground font-medium">আজকের দিনলিপিতে একটি ভয়েস নোট যোগ করুন</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={startRecording}
                        className="rounded-full border-white/10 hover:bg-white/5 gap-1.5 h-9"
                      >
                        <Mic className="h-4 w-4" />
                        রেকর্ড শুরু করুন
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between w-full gap-4">
                  <div className="flex-1">
                    <audio src={audioUrl} controls className="w-full h-9 rounded-full bg-transparent border border-white/5 shadow-inner" />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={deleteRecording}
                    className="h-9 w-9 rounded-full hover:bg-red-500/10 text-red-400 hover:text-red-500 shrink-0 cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
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
                "আপডেট করুন"
              ) : (
                "সংরক্ষণ করুন"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
