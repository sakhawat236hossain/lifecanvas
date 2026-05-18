"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { MemoryCard } from "@/components/MemoryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Image as ImageIcon, Sparkles, Flame, Target, Trophy, Calendar, BookHeart, Mic, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
      <div className="h-full flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const levelStats = data?.levelStats;
  const rewind = data?.rewindItem;

  const moodName = data?.moodStats?.length > 0 
    ? [...data.moodStats].sort((a, b) => b.value - a.value)[0].name 
    : "শান্তিপূর্ণ 🧘";

  // Generate dates array for the past year (52 weeks x 7 days = 364 days)
  const getPixelGridData = () => {
    const grid = [];
    const pixelsMap: { [key: string]: any } = {};
    if (data?.pixelsData) {
      data.pixelsData.forEach((p: any) => {
        if (p.date) {
          pixelsMap[p.date] = p;
        }
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 363); // 364 days ago

    for (let i = 0; i < 364; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split("T")[0];
      grid.push({
        date: dateStr,
        ...pixelsMap[dateStr]
      });
    }
    return grid;
  };
  
  const pixelGrid = getPixelGridData();

  const getMoodColor = (mood: string) => {
    if (!mood) return "bg-white/5 border border-white/5 hover:bg-white/10";
    if (mood.includes("😊")) return "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.45)] border-transparent hover:scale-115";
    if (mood.includes("🧘")) return "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)] border-transparent hover:scale-115";
    if (mood.includes("🥹")) return "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.45)] border-transparent hover:scale-115";
    if (mood.includes("😔")) return "bg-slate-500 shadow-[0_0_12px_rgba(107,114,128,0.45)] border-transparent hover:scale-115";
    if (mood.includes("💖")) return "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.45)] border-transparent hover:scale-115";
    if (mood.includes("🤩")) return "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.45)] border-transparent hover:scale-115";
    return "bg-white/10 border-transparent hover:scale-115";
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary-foreground">
            <Sparkles className="h-3 w-3 text-primary-foreground animate-pulse" />
            <span>লাইফক্যানভাস প্রিমিয়াম ড্যাশবোর্ড</span>
          </div>
          <h1 className="text-4xl font-playfair font-bold">সারসংক্ষেপ ও পরিসংখ্যান</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            আপনার গ্যামিফাইড এক্সপি স্তর, দৈনন্দিন মুড ক্যানভাস এবং অতীতে কাটানো মধুর স্মৃতিমালার সারসংক্ষেপ।
          </p>
        </div>
      </div>

      {/* Grid of four premium stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Level Up & XP Stats Card */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 transition-all duration-300 flex flex-col justify-between h-full group p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">ইউজার স্তর (Gamified XP)</span>
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-red-500/20 border-2 border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.25)] shrink-0 animate-pulse">
              <span className="text-2xl font-extrabold text-amber-400 font-playfair">{levelStats?.level || 1}</span>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-md font-bold text-foreground">{levelStats?.levelTitle || "অভিযাত্রী"}</h4>
              <p className="text-xs text-muted-foreground/80">পরবর্তী স্তর: {levelStats?.levelXP || 0} / 500 XP</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative h-2 w-full rounded-full bg-white/10 overflow-hidden border border-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${levelStats?.levelProgress || 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground/60 font-semibold font-mono">
              <span>{levelStats?.levelProgress || 0}% সম্পূর্ণ</span>
              <span>মোট: {data?.totalXP || 0} XP</span>
            </div>
          </div>
        </Card>

        {/* Memories stats */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 transition-all duration-300 flex flex-col justify-between h-full p-6 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-muted-foreground">মোট স্মৃতি</span>
            <ImageIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-playfair">{data?.totalMemories || 0} টি</div>
            <p className="text-xs text-muted-foreground/80">প্রধান মেজাজ: {moodName}</p>
          </div>
        </Card>

        {/* Habits stats */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 transition-all duration-300 flex flex-col justify-between h-full p-6 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-muted-foreground">সচল অভ্যাসসমূহ</span>
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-playfair">{data?.totalHabits || 0} টি</div>
            <p className="text-xs text-orange-400/90 font-semibold flex items-center gap-1">
              <Flame className="h-3 w-3 fill-orange-500 text-orange-500" />
              <span>সর্বোচ্চ ধারাবাহিকতা: {data?.maxStreak || 0} দিন</span>
            </p>
          </div>
        </Card>

        {/* Goals stats */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 transition-all duration-300 flex flex-col justify-between h-full p-6 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm font-semibold text-muted-foreground">লক্ষ্যমাত্রা</span>
            <Target className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold font-playfair">{data?.totalGoals || 0} টি</div>
            <p className="text-xs text-emerald-400/90 font-semibold">সম্পন্ন হয়েছে: {data?.completedGoals || 0} টি</p>
          </div>
        </Card>
      </div>

      {/* Row 2: Year in Pixels & Memory Rewind Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Year in Pixels Canvas */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 transition-all duration-300 p-6 lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-playfair text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>বছরের লাইফ ক্যানভাস (Year in Pixels)</span>
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              Your visual mood canvas over the last 364 days. hover for details!
            </p>
          </div>

          {/* Interactive CSS Grid Canvas */}
          <div 
            className="flex-1 w-full overflow-hidden p-2 rounded-2xl bg-white/[0.01] border border-white/5 shadow-inner"
            style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(13px, 1fr))", 
              gap: "7px" 
            }}
          >
            {pixelGrid.map((cell, idx) => (
              <div
                key={idx}
                className={`h-3.5 w-3.5 rounded-[4px] cursor-pointer transition-all duration-305 relative group/pixel ${getMoodColor(cell.mood)}`}
              >
                {/* Custom glowing floating hover tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover/pixel:flex flex-col items-center bg-black/90 backdrop-blur-md border border-white/10 text-white rounded-xl p-2.5 text-[10px] shadow-2xl z-30 pointer-events-none">
                  <span className="font-bold font-mono text-muted-foreground">{cell.date}</span>
                  <span className="text-primary font-black mt-0.5 text-center">{cell.mood ? `অনুভূতি: ${cell.mood}` : "কোনো দিনলিপি নেই"}</span>
                  {cell.title && <span className="text-[9px] text-white/70 mt-1 italic text-center line-clamp-1">"{cell.title}"</span>}
                  <div className="w-2.5 h-2.5 bg-black/90 border-r border-b border-white/10 rotate-45 -mt-1 absolute top-full left-1/2 -translate-x-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Pixel Legends */}
          <div className="pt-4 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground/80 font-semibold justify-center sm:justify-start">
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-500" /> আনন্দদায়ক 😊</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500" /> শান্তপূর্ণ 🧘</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-indigo-500" /> স্মৃতিকাতর 🥹</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-500" /> বিষণ্ণ 😔</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-rose-500" /> কৃতজ্ঞ 💖</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-cyan-500" /> উত্তেজিত 🤩</span>
          </div>
        </Card>

        {/* Memory Rewind Banner */}
        {rewind ? (
          <Card className="border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 transition-all duration-300 overflow-hidden flex flex-col justify-between group relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-primary/30 backdrop-blur-md border border-primary/20 text-primary-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                {rewind.badge}
              </span>
            </div>
            
            {/* Cinematic Image Frame */}
            <div className="relative w-full h-44 bg-white/[0.02] border-b border-white/5 overflow-hidden">
              {rewind.image ? (
                <img 
                  src={rewind.image} 
                  alt={rewind.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 flex items-center justify-center">
                  <span className="font-playfair text-xl opacity-20">LifeCanvas Rewind</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/25 to-transparent" />
            </div>

            <CardContent className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground/60 font-mono">
                  {new Date(rewind.date).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <h3 className="font-playfair font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                  {rewind.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3 font-serif">
                  {rewind.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    if (rewind.type === "memory") {
                      window.location.href = `/memories/${rewind._id}`;
                    } else {
                      window.location.href = `/journals`;
                    }
                  }}
                  className="rounded-full text-[10px] font-semibold border-white/10 hover:bg-white/5 gap-1.5 cursor-pointer h-8"
                >
                  স্মৃতিতে ফিরে যান
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <span className="font-playfair text-xl opacity-20">LifeCanvas Rewind</span>
            <p className="text-muted-foreground text-xs">আজকের দিনে অতীতে কোনো স্মৃতি নেই। নতুন স্মৃতি বা ডায়েরি লিখলে তা ১ বছর পর চমৎকারভাবে এখানে রিকল হবে!</p>
          </Card>
        )}
      </div>

      {/* Row 3: Mood Analytics Bar Charts & Side-by-Side Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Mood Analytics Charts Column */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-md hover:border-white/10 transition-all duration-300 p-6 space-y-6 flex flex-col justify-between">
          <div className="border-b border-white/5 pb-4">
            <h3 className="font-playfair text-xl font-bold flex items-center gap-2">
              <BookHeart className="h-5 w-5 text-pink-400" />
              <span>আবেগ ও মুড অ্যানালিটিক্স</span>
            </h3>
            <p className="text-muted-foreground text-xs mt-1">
              আপনার ডায়েরি এবং সুন্দর স্মৃতিগুলো থেকে সামগ্রিকভাবে সংগৃহীত মুডের পার্সেন্টেজ বিশ্লেষণ।
            </p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {data?.moodStats && data.moodStats.length > 0 ? (
              data.moodStats.slice(0, 5).map((mood: any, idx: number) => {
                let progressColor = "from-amber-400 to-orange-500";
                if (mood.name.includes("🧘")) progressColor = "from-emerald-400 to-teal-500";
                if (mood.name.includes("🥹")) progressColor = "from-indigo-400 to-purple-500";
                if (mood.name.includes("😔")) progressColor = "from-slate-400 to-zinc-500";
                if (mood.name.includes("💖")) progressColor = "from-rose-400 to-pink-500";
                if (mood.name.includes("🤩")) progressColor = "from-cyan-400 to-blue-500";

                return (
                  <div key={mood.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-foreground/90">
                      <span>{mood.name}</span>
                      <span className="font-mono text-muted-foreground">{mood.percentage}% ({mood.value} টি)</span>
                    </div>

                    <div className="relative h-2 w-full rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${mood.percentage}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground text-xs">
                অ্যানালাইসিস করার জন্য এখনও কোনো ডাটা যোগ করা হয়নি।
              </div>
            )}
          </div>
        </Card>

        {/* Side-by-Side Recents Feeds (Memories & Journals) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          {/* Recent Memories */}
          <div className="space-y-6">
            <h2 className="text-2xl font-playfair font-bold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              <span>সাম্প্রতিক স্মৃতিসমূহ</span>
            </h2>
            {data?.recentMemories && data.recentMemories.length > 0 ? (
              <div className="space-y-6">
                {data.recentMemories.slice(0, 2).map((memory: any, idx: number) => (
                  <MemoryCard key={memory._id} memory={memory} index={idx} />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02] backdrop-blur-md">
                <p className="text-muted-foreground text-xs">স্মৃতির ডায়েরি ফাকা।</p>
              </div>
            )}
          </div>

          {/* Recent Journals */}
          <div className="space-y-6">
            <h2 className="text-2xl font-playfair font-bold flex items-center gap-2">
              <BookHeart className="h-5 w-5 text-pink-400" />
              <span>সাম্প্রতিক দিনলিপিসমূহ</span>
            </h2>
            {data?.recentJournals && data.recentJournals.length > 0 ? (
              <div className="space-y-6">
                {data.recentJournals.slice(0, 2).map((journal: any, idx: number) => (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    key={journal._id} 
                    className="border border-white/5 bg-white/5 backdrop-blur-md rounded-2xl p-6 space-y-3 hover:border-white/10 transition-all duration-300 relative group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 font-semibold font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(journal.date).toLocaleDateString("bn-BD", { day: "numeric", month: "long" })}
                        </span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {journal.audio && (
                          <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary-foreground">
                            <Mic className="h-3 w-3 text-primary animate-pulse" />
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                          {journal.mood}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-playfair font-bold text-md text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">{journal.title}</h3>
                    <p className="text-muted-foreground/80 text-xs font-serif line-clamp-2 leading-relaxed">{journal.content}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.02] backdrop-blur-md">
                <p className="text-muted-foreground text-xs">দিনলিপি ফাকা।</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
