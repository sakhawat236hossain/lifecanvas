"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { MemoryForm } from "@/components/MemoryForm";
import { Loader2 } from "lucide-react";

export default function EditMemoryPage() {
  const { id } = useParams();
  const [memory, setMemory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <p className="text-xl font-playfair">স্মৃতি পাওয়া যায়নি</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold">স্মৃতি সম্পাদনা করুন</h1>
          <p className="text-lg text-muted-foreground">আপনার পুরোনো স্মৃতিটি আপডেট করুন।</p>
        </div>
        
        <MemoryForm initialData={memory} />
      </div>
    </div>
  );
}
