"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Image as ImageIcon, BookHeart, Calendar, Shield, Activity, Heart, PenTool, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex-1 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16 pb-32 px-4">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-background overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] opacity-30" />
        </div>

        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>আপনার জীবনের ব্যক্তিগত আর্কাইভ</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-playfair font-bold leading-tight tracking-tight">
              প্রতিটি <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                সুন্দর মুহূর্ত
              </span> সংরক্ষণ করুন
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              LifeCanvas হলো আপনার সিনেমাটিক ডায়েরি। আপনার গল্প, আবেগ, সাফল্য এবং জীবনের মোড় ঘোরানো মুহূর্তগুলো একটি সুন্দর ও প্রিমিয়াম জায়গায় সংরক্ষণ করুন।
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/add-memory">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg gap-2 shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
                  ডায়েরি লেখা শুরু করুন <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg border-white/10 hover:bg-white/5 backdrop-blur-md">
                  ড্যাশবোর্ড দেখুন
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[600px] w-full hidden lg:block"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 z-20 bg-card">
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-transparent flex flex-col items-center justify-center p-8 text-center space-y-4">
                 <ImageIcon className="h-16 w-16 text-primary/50" />
                 <h3 className="font-playfair text-2xl font-bold">একটি সুন্দর স্মৃতি</h3>
                 <p className="text-muted-foreground text-sm">ছবি ও গল্প যোগ করে এগুলোকে জীবন্ত করে তুলুন।</p>
              </div>
            </div>
            
            <div className="absolute top-10 left-10 w-64 aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-xl -rotate-6 z-10 bg-secondary/10 backdrop-blur-md">
            </div>
            
            <div className="absolute bottom-20 right-10 w-72 aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-xl rotate-6 z-30 bg-card p-6 flex flex-col justify-between">
               <BookHeart className="h-8 w-8 text-primary" />
               <div>
                 <p className="font-playfair text-lg font-bold">"সবচেয়ে সুন্দর দিন।"</p>
                 <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> আজ</p>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-background relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-playfair font-bold mb-4">আপনার জীবনের প্রতিটি অধ্যায়</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              LifeCanvas আপনাকে একটি নিরাপদ ও সুন্দর পরিবেশে আপনার স্মৃতিগুলো সাজিয়ে রাখার সুযোগ দেয়।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "স্মৃতি সংরক্ষণ",
                desc: "আপনার জীবনের বিশেষ মুহূর্তগুলো ছবি, তারিখ ও অনুভূতির সাথে চিরতরে ধরে রাখুন।"
              },
              {
                icon: Activity,
                title: "মেজাজ ট্র্যাকিং",
                desc: "প্রতিটি স্মৃতির সাথে আপনার মেজাজ কেমন ছিল তা রেকর্ড করুন এবং পরে বিশ্লেষণ করুন।"
              },
              {
                icon: Shield,
                title: "নিরাপদ আর্কাইভ",
                desc: "আপনার সমস্ত ডেটা নিরাপদে সংরক্ষিত থাকে, এটি আপনার নিজস্ব একান্ত ব্যক্তিগত জায়গা।"
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-playfair mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 bg-secondary/5 relative border-t border-white/5">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 space-y-8"
            >
              <h2 className="text-3xl md:text-5xl font-playfair font-bold">খুব সহজেই শুরু করুন</h2>
              <div className="space-y-6">
                {[
                  { icon: PenTool, text: "আপনার অনুভূতি এবং গল্পগুলো লিখুন" },
                  { icon: ImageIcon, text: "কভার ছবি ও লোকেশন যোগ করুন" },
                  { icon: CheckCircle, text: "আপনার ব্যক্তিগত ড্যাশবোর্ডে উপভোগ করুন" }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-lg font-medium">{step.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex-1 w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-card flex items-center justify-center"
            >
               <div className="text-center space-y-4">
                 <div className="inline-flex p-4 rounded-full bg-primary/20 text-primary">
                   <BookHeart className="h-12 w-12" />
                 </div>
                 <h3 className="text-2xl font-playfair font-bold">আপনার ডায়েরি প্রস্তুত</h3>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-background py-12 px-4 text-center">
        <p className="text-muted-foreground font-playfair text-xl mb-4">LifeCanvas</p>
        <p className="text-sm text-muted-foreground/60">
          © {new Date().getFullYear()} LifeCanvas. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
