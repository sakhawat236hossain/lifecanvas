"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookImage, Plus, User, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <BookImage className="h-6 w-6 text-primary" />
          <Link href="/" className="font-playfair text-2xl font-bold tracking-tight">
            LifeCanvas
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link 
            href="/dashboard" 
            className={`transition-colors hover:text-foreground ${pathname === '/dashboard' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            ড্যাশবোর্ড
          </Link>
          <Link 
            href="/memories" 
            className={`transition-colors hover:text-foreground ${pathname === '/memories' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            স্মৃতিসমূহ
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">থিম পরিবর্তন করুন</span>
          </Button>
          
          <Link href="/add-memory">
            <Button className="rounded-full gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">স্মৃতি যোগ করুন</span>
            </Button>
          </Link>

          <Button variant="outline" size="icon" className="rounded-full border-white/10">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
