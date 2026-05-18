"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BookHeart, Plus, Sparkles, AlertCircle, Printer } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { JournalCard } from "@/components/JournalCard";
import { AddJournalDialog } from "@/components/AddJournalDialog";

interface Journal {
  _id: string;
  title: string;
  content: string;
  mood: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function JournalsPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchJournals = async () => {
    try {
      setError(null);
      const res = await axios.get("/api/journals");
      setJournals(res.data);
    } catch (err) {
      console.error("Error fetching journals:", err);
      setError("দিনলিপিগুলো লোড করতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto min-h-screen pb-16 relative">
      {/* Dynamic CSS Print Injections */}
      <style jsx global>{`
        @media print {
          /* Force classic light style for printed pages */
          html, body {
            background: white !important;
            color: #111827 !important;
            font-family: 'Playfair Display', Georgia, serif !important;
          }
          /* Hide screen-only layouts */
          header, nav, aside, footer, button, .no-print, [role="dialog"], .bg-primary\/10 {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-book-container {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-title-page {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100vh !important;
            page-break-after: always !important;
            border: 3px double #374151 !important;
            padding: 4rem !important;
            margin: 2rem !important;
            text-align: center !important;
          }
          .print-journal-card {
            page-break-inside: avoid !important;
            margin-bottom: 3.5rem !important;
            border-bottom: 1px dashed #9ca3af !important;
            padding-bottom: 2.5rem !important;
          }
          .print-journal-title {
            font-size: 2.2rem !important;
            font-weight: bold !important;
            color: #111827 !important;
            margin-bottom: 0.6rem !important;
            font-family: 'Playfair Display', Georgia, serif !important;
          }
          .print-journal-meta {
            font-family: monospace !important;
            font-size: 0.9rem !important;
            color: #4b5563 !important;
            margin-bottom: 1.5rem !important;
            font-weight: bold !important;
          }
          .print-journal-content {
            font-size: 1.15rem !important;
            line-height: 1.85 !important;
            color: #1f2937 !important;
            white-space: pre-wrap !important;
            text-align: justify !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>

      {/* Print-Only Title Cover and Chapter Pages */}
      <div className="print-only print-book-container">
        <div className="print-title-page flex flex-col items-center justify-center">
          <h1 className="text-5xl font-playfair font-extrabold text-center mt-32 text-black">লাইফক্যানভাস দিনলিপি</h1>
          <p className="text-lg text-center text-gray-600 mt-4 font-serif italic">আমার জীবনের অমূল্য স্মৃতি ও চিন্তাগুলোর ধ্রুপদী সংকলন</p>
          <div className="border-t-2 border-black/20 w-44 my-16" />
          <p className="text-sm font-mono text-center text-gray-500">
            মুদ্রণ তারিখ: {new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        
        <div className="space-y-16 p-8">
          {journals.map((j) => (
            <div key={j._id} className="print-journal-card">
              <h2 className="print-journal-title">{j.title}</h2>
              <div className="print-journal-meta">
                <span>তারিখ: {new Date(j.date).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="mx-4">|</span>
                <span>অনুভূতি: {j.mood}</span>
              </div>
              <p className="print-journal-content">{j.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 no-print">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary-foreground">
            <Sparkles className="h-3 w-3 text-primary-foreground animate-pulse" />
            <span>ডিজিটাল ব্যক্তিগত ডায়েরি ও রিফ্লেকশন</span>
          </div>
          <h1 className="text-4xl font-playfair font-bold tracking-tight">আমার দিনলিপি</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            আপনার মনের অনুভূতি, গুরুত্বপূর্ণ স্মৃতি, বা প্রতিদিনের চিন্তাগুলো চমৎকার পোস্টকার্ডের মতো সংরক্ষণ করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {journals.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:scale-[1.03] active:scale-[0.97] transition-all gap-2 h-12 px-6 font-medium cursor-pointer"
            >
              <Printer className="h-4.5 w-4.5" />
              <span>পিডিএফ বুক প্রিন্ট 📄</span>
            </Button>
          )}

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="rounded-full shadow-lg shadow-primary/20 hover:scale-[1.03] active:scale-[0.97] transition-all gap-2 h-12 px-6 font-medium cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>নতুন দিনলিপি লিখুন</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 border border-destructive/20 bg-destructive/5 backdrop-blur-md rounded-2xl text-destructive-foreground no-print">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div className="flex-1 text-sm">
            <span className="font-bold block mb-0.5">ত্রুটি</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        /* Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-white/5 bg-white/5 rounded-3xl p-6 h-[255px] space-y-6 animate-pulse"
            >
              <div className="h-4 bg-white/10 rounded-full w-1/4" />
              <div className="h-6 bg-white/10 rounded-full w-2/3" />
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded-full w-full" />
                <div className="h-4 bg-white/10 rounded-full w-full" />
                <div className="h-4 bg-white/10 rounded-full w-4/5" />
              </div>
              <div className="h-8 bg-white/10 rounded-full w-1/3" />
            </div>
          ))}
        </div>
      ) : journals.length > 0 ? (
        /* Journals Grid */
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print"
        >
          {journals.map((journal, index) => (
            <JournalCard key={journal._id} journal={journal} index={index} onUpdate={fetchJournals} />
          ))}
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center p-12 sm:p-20 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-md max-w-2xl mx-auto space-y-8 no-print"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner relative overflow-hidden">
            <BookHeart className="h-10 w-10 text-primary-foreground animate-pulse" />
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-[10px] -z-10" />
          </div>

          <div className="space-y-3">
            <h3 className="font-playfair text-2xl font-bold tracking-tight">আপনার কোনো দিনলিপি এখনও লেখা হয়নি</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              দিনের সেরা মুহূর্তগুলো, উপলব্ধি বা কোনো বিশেষ চিন্তা চিরস্মরণীয় করে রাখতে আজই আপনার প্রথম দিনলিপিটি লিখে ফেলুন!
            </p>
          </div>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="lg"
            className="rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform px-8 h-14 text-base cursor-pointer"
          >
            প্রথম দিনলিপি লিখুন
          </Button>
        </motion.div>
      )}

      {/* Add Journal Dialog Modal */}
      <AddJournalDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={fetchJournals}
      />
    </div>
  );
}
