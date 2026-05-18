"use client";

import { useState, useEffect } from "react";
import { X, Play, Pause, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Memory {
  _id: string;
  title: string;
  description: string;
  image?: string;
  mood: string;
  date: string;
}

interface SlideshowPlayerProps {
  memories: Memory[];
  isOpen: boolean;
  onClose: () => void;
}

export function SlideshowPlayer({ memories, isOpen, onClose }: SlideshowPlayerProps) {
  const imageMemories = memories.filter(m => m.image);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isOpen || !isPlaying || imageMemories.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageMemories.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, imageMemories.length]);

  if (!isOpen || imageMemories.length === 0) return null;

  const currentMemory = imageMemories[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + imageMemories.length) % imageMemories.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageMemories.length);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 md:p-12 text-white"
      >
        {/* Soft background ambient glow based on image */}
        <div 
          className="absolute inset-0 opacity-30 blur-[100px] transition-all duration-1000 -z-10 scale-125 pointer-events-none"
          style={{
            backgroundImage: `url(${currentMemory.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

        {/* Top Header controls */}
        <div className="flex items-center justify-between w-full relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400 animate-pulse" />
            <span className="font-playfair text-lg font-bold tracking-wide">সিনেমাটিক স্মৃতির জানালা</span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-10 w-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-white text-white" /> : <Play className="h-4 w-4 fill-white text-white" />}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mid Display Section */}
        <div className="flex-1 flex items-center justify-center relative w-full max-w-5xl mx-auto my-6 z-10">
          {/* Previous Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="absolute left-0 md:-left-16 h-12 w-12 rounded-full border border-white/5 bg-black/30 hover:bg-white/10 text-white shrink-0 cursor-pointer hidden sm:flex items-center justify-center"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Core Image Display with Fading */}
          <div className="w-full h-full max-h-[60vh] md:max-h-[65vh] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative bg-black/40">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentMemory._id}
                src={currentMemory.image}
                alt={currentMemory.title}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-full h-full object-contain"
              />
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 md:-right-16 h-12 w-12 rounded-full border border-white/5 bg-black/30 hover:bg-white/10 text-white shrink-0 cursor-pointer hidden sm:flex items-center justify-center"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Bottom Text Description Section */}
        <div className="w-full max-w-3xl mx-auto text-center space-y-4 relative z-10">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground/90 font-semibold">
            <span>{new Date(currentMemory.date).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/10 text-white">{currentMemory.mood}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentMemory._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h2 className="font-playfair font-extrabold text-2xl md:text-3xl tracking-wide">{currentMemory.title}</h2>
              <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto leading-relaxed font-serif line-clamp-3">
                {currentMemory.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Pagination dots indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {imageMemories.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-amber-400" : "w-2 bg-white/20 hover:bg-white/40"} cursor-pointer`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
