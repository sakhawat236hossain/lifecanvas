"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookImage, Plus, User, Moon, Sun, LogOut, LayoutDashboard, Image as ImageIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-2">
          <BookImage className="h-6 w-6 text-primary" />
          <Link href="/" className="font-playfair text-2xl font-bold tracking-tight">
            LifeCanvas
          </Link>
        </div>

        {/* Middle Section: Navigation (Only for logged-in users) */}
        {status === "authenticated" && (
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link 
              href="/dashboard" 
              className={`transition-colors hover:text-foreground ${pathname === '/dashboard' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
            >
              ড্যাশবোর্ড
            </Link>
            <Link 
              href="/memories" 
              className={`transition-colors hover:text-foreground ${pathname === '/memories' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
            >
              স্মৃতিসমূহ
            </Link>
          </div>
        )}

        {/* Right Section: Theme Toggle + Session Controls */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full cursor-pointer hover:bg-white/5"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">থিম পরিবর্তন করুন</span>
          </Button>
          
          {status === "authenticated" ? (
            <>
              {/* Add Memory Shortcut */}
              <Link href="/add-memory">
                <Button className="rounded-full gap-2 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">স্মৃতি যোগ করুন</span>
                </Button>
              </Link>

              {/* User Avatar + Premium Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 active:scale-95 transition-all overflow-hidden cursor-pointer"
                >
                  {session?.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User Avatar"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold uppercase text-primary">
                      {session?.user?.name ? session.user.name.charAt(0) : <User className="h-4 w-4" />}
                    </span>
                  )}
                </button>

                {/* Dropdown Card */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <>
                      {/* Click Outside overlay */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setDropdownOpen(false)}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl p-2 shadow-2xl z-50 space-y-1.5"
                      >
                        {/* User Credentials details */}
                        <div className="px-3 py-2 border-b border-white/5 space-y-0.5 text-left">
                          <p className="text-xs font-semibold text-muted-foreground">লগড ইন আছেন:</p>
                          <p className="text-sm font-bold truncate max-w-full text-foreground">{session?.user?.name || "LifeCanvas User"}</p>
                          <p className="text-[10px] truncate max-w-full text-muted-foreground font-mono">{session?.user?.email}</p>
                        </div>

                        {/* Navigation Links for Mobile & general */}
                        <div className="space-y-0.5">
                          <Link href="/dashboard" onClick={() => setDropdownOpen(false)}>
                            <button className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all cursor-pointer">
                              <LayoutDashboard className="h-4 w-4" />
                              <span>ড্যাশবোর্ড</span>
                            </button>
                          </Link>
                          <Link href="/memories" onClick={() => setDropdownOpen(false)}>
                            <button className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all cursor-pointer">
                              <ImageIcon className="h-4 w-4" />
                              <span>স্মৃতিসমূহ</span>
                            </button>
                          </Link>
                        </div>

                        {/* Logout Button */}
                        <div className="pt-1.5 border-t border-white/5">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              handleLogout();
                            }}
                            className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>লগ আউট করুন</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            status !== "loading" && (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full text-sm font-semibold hover:bg-white/5 cursor-pointer">
                    লগ ইন
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-full text-sm font-semibold shadow-md bg-secondary hover:bg-secondary/90 text-secondary-foreground cursor-pointer">
                    নিবন্ধন
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
