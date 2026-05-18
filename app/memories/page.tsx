"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { MemoryCard } from "@/components/MemoryCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

const topics = ["সব", "ভালোবাসার গল্প", "দুঃখের স্মৃতি", "সাফল্য", "ব্যর্থতা", "বন্ধুত্ব", "বিশ্বাসঘাতকতা", "ক্যারিয়ার", "শেখা", "ব্যবসা", "কোডিং যাত্রা", "মাদরাসা জীবন", "বিষণ্ণতা", "স্বপ্ন", "অনুপ্রেরণা", "টার্নিং পয়েন্ট"];

export default function MemoriesPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("সব");
  const [sort, setSort] = useState("desc");

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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-playfair font-bold">আপনার স্মৃতিসমূহ</h1>
          <p className="text-muted-foreground mt-2 text-lg">প্রতিটি গল্প, নিরাপদে সংরক্ষিত।</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="শিরোনাম খুঁজুন..."
              className="pl-9 border-white/10 bg-white/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="w-full md:w-40 border-white/10 bg-white/5">
              <SelectValue placeholder="বিষয়" />
            </SelectTrigger>
            <SelectContent>
              {topics.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-40 border-white/10 bg-white/5">
              <SelectValue placeholder="সাজান" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">নতুনগুলো আগে</SelectItem>
              <SelectItem value="asc">পুরোনো আগে</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : memories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {memories.map((memory, index) => (
            <MemoryCard key={memory._id} memory={memory} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center p-20 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
          <p className="text-xl font-playfair mb-2">কোনো স্মৃতি পাওয়া যায়নি</p>
          <p className="text-muted-foreground">আপনার অনুসন্ধান পরিবর্তন করার চেষ্টা করুন অথবা নতুন স্মৃতি যোগ করুন।</p>
        </div>
      )}
    </div>
  );
}
