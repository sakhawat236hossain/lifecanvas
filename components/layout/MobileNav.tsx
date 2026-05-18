"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Image as ImageIcon, Target, Activity, BookHeart, Trophy } from "lucide-react";

const navItems = [
  { name: "সারসংক্ষেপ", href: "/dashboard", icon: LayoutDashboard },
  { name: "স্মৃতিসমূহ", href: "/memories", icon: ImageIcon },
  { name: "অভ্যাস", href: "/habits", icon: Activity },
  { name: "লক্ষ্য", href: "/goals", icon: Target },
  { name: "দিনলিপি", href: "/journals", icon: BookHeart },
  { name: "অর্জন", href: "/achievements", icon: Trophy },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 md:hidden bg-background/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 shadow-[0_10px_35px_rgba(0,0,0,0.4)] no-print">
      <div className="grid grid-cols-6 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center py-1 cursor-pointer">
              <div
                className={cn(
                  "p-2.5 rounded-2xl transition-all duration-300 relative flex items-center justify-center",
                  isActive 
                    ? "bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className={cn(
                "text-[9px] mt-1 font-bold tracking-tight transition-colors duration-300",
                isActive ? "text-primary font-black" : "text-muted-foreground/80"
              )}>
                {item.name.slice(0, 5)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
