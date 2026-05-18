"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, Target, Activity, BookHeart, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "সারসংক্ষেপ", href: "/dashboard", icon: LayoutDashboard },
  { name: "স্মৃতিসমূহ", href: "/memories", icon: ImageIcon },
  { name: "অভ্যাস", href: "/habits", icon: Activity },
  { name: "লক্ষ্য", href: "/goals", icon: Target },
  { name: "দিনলিপি", href: "/journals", icon: BookHeart },
  { name: "অর্জন", href: "/achievements", icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-white/10 bg-background/50 backdrop-blur-sm min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
