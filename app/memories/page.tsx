"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { MemoryCard } from "@/components/MemoryCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const topics = ["সব", "ভালোবাসার গল্প", "দুঃখের স্মৃতি", "সাফল্য", "ব্যর্থতা", "বন্ধুত্ব", "বিশ্বাসঘাতকতা", "ক্যারিয়ার", "শেখা", "ব্যবসা", "কোডিং যাত্রা", "মাদরাসা জীবন", "বিষণ্ণতা", "স্বপ্ন", "অনুপ্রেরণা", "টার্নিং পয়েন্ট"];

export default function MemoriesPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("সব");
  const [sort, setSort] = useState("desc");
  const [selectedTimelineKey, setSelectedTimelineKey] = useState<string>("সব");

  useEffect(() => {
    const fetchMemories = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/memories?search=${search}&topic=${topic}&sort=${sort}`);
        setMemories(res.data);
      } catch (error) {
        console.error("Failed to fetch memories:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchMemories();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, topic, sort]);

  // Extract chronologically sorted timeline keys (Month Year format in Bengali)
  const getTimelineKeys = () => {
    const keysSet = new Set<string>();
    memories.forEach(m => {
      if (m.date) {
        const d = new Date(m.date);
        const monthStr = d.toLocaleDateString("bn-BD", { month: "long" });
        const yearStr = d.toLocaleDateString("bn-BD", { year: "numeric" });
        keysSet.add(`${monthStr} ${yearStr}`);
      }
    });
    return ["সব", ...Array.from(keysSet)];
  };

  const timelineKeys = getTimelineKeys();

  // Filter memories based on selected timeline key
  const filteredMemories = selectedTimelineKey === "সব"
    ? memories
    : memories.filter(m => {
        if (!m.date) return false;
        const d = new Date(m.date);
        const monthStr = d.toLocaleDateString("bn-BD", { month: "long" });
        const yearStr = d.toLocaleDateString("bn-BD", { year: "numeric" });
        return `${monthStr} ${yearStr}` === selectedTimelineKey;
      });

  return (
    <div className="space-y-8 max-w-7xl mx-auto min-h-screen pb-16">
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-playfair font-bold">আপনার স্মৃতিসমূহ</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">প্রতিটি সুন্দর গল্প, নিরাপদে সংরক্ষিত।</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="শিরোনাম খুঁজুন..."
              className="pl-9 border-white/10 bg-white/5 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="w-full md:w-40 border-white/10 bg-white/5 rounded-full">
              <SelectValue placeholder="বিষয়" />
            </SelectTrigger>
            <SelectContent>
              {topics.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-40 border-white/10 bg-white/5 rounded-full">
              <SelectValue placeholder="সাজান" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">নতুনগুলো আগে</SelectItem>
              <SelectItem value="asc">পুরোনো আগে</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interactive Horizontal Life Chronicle Timeline Slider */}
      {!loading && memories.length > 0 && timelineKeys.length > 2 && (
        <div className="w-full border-y border-white/5 py-4 bg-white/[0.01] backdrop-blur-md flex items-center gap-3 px-4 overflow-x-auto scrollbar-none rounded-2xl">
          <span className="text-xs font-bold text-muted-foreground/80 shrink-0 font-mono flex items-center gap-1.5 mr-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            জীবন রেখা টাইমলাইন:
          </span>
          <div className="flex items-center gap-2">
            {timelineKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedTimelineKey(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  selectedTimelineKey === key
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105"
                    : "bg-white/5 border border-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredMemories.length > 0 ? (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredMemories.map((memory, index) => (
              <motion.div
                key={memory._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <MemoryCard memory={memory} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center p-20 border border-white/10 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-md max-w-2xl mx-auto">
          <p className="text-xl font-playfair mb-2">কোনো স্মৃতি পাওয়া যায়নি</p>
          <p className="text-muted-foreground text-sm">আপনার অনুসন্ধান পরিবর্তন করার চেষ্টা করুন অথবা নতুন স্মৃতি যোগ করুন।</p>
        </div>
      )}
    </div>
  );
}
