"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, MapPin, Tag, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function SingleMemoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const res = await axios.get(`/api/memories/${id}`);
        setMemory(res.data);
      } catch (error) {
        console.error("Failed to fetch memory:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMemory();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি এই স্মৃতি মুছে ফেলতে চান? এটি আর ফিরে পাওয়া যাবে না।")) return;
    
    setDeleting(true);
    try {
      await axios.delete(`/api/memories/${id}`);
      toast.success("স্মৃতি সফলভাবে মুছে ফেলা হয়েছে!");
      router.push("/memories");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("স্মৃতি মুছে ফেলতে ব্যর্থ হয়েছে।");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-1 items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-playfair mb-4">স্মৃতি পাওয়া যায়নি</h2>
        <Button onClick={() => router.push("/memories")}>ফিরে যান</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background min-h-screen">
      {/* Cinematic Header */}
      <div className="relative w-full h-[50vh] md:h-[70vh] border-b border-white/10">
        {memory.image ? (
          <Image
            src={memory.image}
            alt={memory.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center">
            <span className="font-playfair text-6xl opacity-20">{memory.topic}</span>
          </div>
        )}
        
        {/* Gradients for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        {/* Top Navigation */}
        <div className="absolute top-0 w-full p-4 md:p-8 flex justify-between items-center z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40"
              onClick={() => router.push(`/memories/${id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon" 
              className="rounded-full backdrop-blur-md opacity-80 hover:opacity-100"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 w-full p-4 md:p-8 md:pb-12 max-w-5xl mx-auto left-0 right-0 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-primary text-primary-foreground hover:bg-primary">{memory.topic}</Badge>
              <Badge variant="secondary">{memory.mood}</Badge>
              <Badge variant="outline" className="border-white/20">{memory.privacy}</Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-foreground leading-tight shadow-sm drop-shadow-lg">
              {memory.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-12 border-b border-white/5 pb-8"
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {format(new Date(memory.date), "MMMM d, yyyy")}
          </div>
          {memory.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {memory.location}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="prose prose-invert prose-lg max-w-none font-sans leading-relaxed text-foreground/90"
        >
          {memory.description.split('\n').map((paragraph: string, i: number) => (
            <p key={i} className="mb-6">{paragraph}</p>
          ))}
        </motion.div>

        {memory.tags && memory.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-2"
          >
            {memory.tags.map((tag: string, i: number) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-sm text-muted-foreground">
                <Tag className="h-3 w-3" /> {tag}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
