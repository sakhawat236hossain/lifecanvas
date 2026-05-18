"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Memory {
  _id: string;
  title: string;
  topic: string;
  description: string;
  image?: string;
  mood: string;
  tags: string[];
  date: string;
  location?: string;
  privacy: string;
}

interface MemoryCardProps {
  memory: Memory;
  index: number;
}

export function MemoryCard({ memory, index }: MemoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group h-full"
    >
      <Link href={`/memories/${memory._id}`}>
        <Card className="overflow-hidden border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 h-full flex flex-col cursor-pointer">
          <div className="relative h-48 w-full overflow-hidden">
            {memory.image ? (
              <Image
                src={memory.image}
                alt={memory.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <span className="font-playfair text-3xl font-bold text-foreground/30">
                  {memory.topic}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-80" />
            <div className="absolute bottom-3 left-3 flex gap-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-md">
                {memory.topic}
              </Badge>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-white/20">
                {memory.mood}
              </Badge>
            </div>
          </div>
          
          <CardContent className="flex-1 p-5">
            <h3 className="font-playfair text-xl font-bold line-clamp-1 mb-2 group-hover:text-primary transition-colors">
              {memory.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {memory.description}
            </p>
            
            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {memory.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs text-primary/80 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {tag}
                  </span>
                ))}
                {memory.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{memory.tags.length - 3}</span>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-5 pt-0 flex justify-between items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(new Date(memory.date), "MMM d, yyyy")}
            </div>
            {memory.location && (
              <div className="flex items-center gap-1 max-w-[50%] truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{memory.location}</span>
              </div>
            )}
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
