"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { MemoryCard } from "@/components/MemoryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image as ImageIcon, Sparkles, Activity } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("/api/dashboard");
        setData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl font-playfair font-bold">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground mt-2 text-lg">আপনার ব্যক্তিগত আর্কাইভের একটি সংক্ষিপ্ত রূপরেখা।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">মোট স্মৃতি</CardTitle>
            <ImageIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-playfair">{data?.totalMemories || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-secondary/5 border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">প্রধান মেজাজ</CardTitle>
            <Sparkles className="h-5 w-5 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-playfair">
              {data?.moodStats?.length > 0 
                ? [...data.moodStats].sort((a,b) => b.value - a.value)[0].name 
                : "প্রযোজ্য নয়"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">লগ করা স্মৃতি</CardTitle>
            <Activity className="h-5 w-5 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-playfair">{data?.totalMemories || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-playfair font-bold mb-6">সাম্প্রতিক স্মৃতিসমূহ</h2>
        {data?.recentMemories && data.recentMemories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.recentMemories.map((memory: any, idx: number) => (
              <MemoryCard key={memory._id} memory={memory} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
            <p className="text-muted-foreground">আপনি এখনও কোনো স্মৃতি যোগ করেননি।</p>
          </div>
        )}
      </div>
    </div>
  );
}
