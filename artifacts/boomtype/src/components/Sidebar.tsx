import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, Keyboard, GraduationCap, Gamepad2,
  Trophy, BookOpen, Download, ChevronLeft, ChevronRight,
  Star, Flame, Target, TrendingUp, Lock, CheckCircle2,
  CloudRain, Sword, CircleDot, Waves, Wrench, Layers, Timer, Wind,
  Menu, BarChart2
} from "lucide-react";
import { getTotalXP, getStreak, getHighScore } from "@/lib/storage";

const COMPLETED_KEY = "boomtype_completed_lessons";
function getCompleted(): number[] {
  try { return JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]"); } catch { return []; }
}

const NAV_SECTIONS = [
  {
    label: "Practice",
    items: [
      { href: "/dashboard",    icon: LayoutDashboard, label: "Dashboard",   badge: null },
      { href: "/test",         icon: Keyboard,        label: "Typing Test", badge: null },
      { href: "/lessons",      icon: GraduationCap,   label: "Lessons",     badge: "7" },
      { href: "/leaderboard",  icon: Trophy,          label: "Leaderboard", badge: null },
      { href: "/analytics",    icon: BarChart2,       label: "Analytics",   badge: null },
    ],
  },
  {
    label: "Games",
    items: [
      { href: "/games",              icon: Gamepad2,   label: "All Games",      badge: "8" },
      { href: "/games/word-rain",    icon: CloudRain,  label: "Word Rain",      badge: null },
      { href: "/games/zombie-attack",icon: Sword,      label: "Zombie Attack",  badge: null },
      { href: "/games/speed-burst",  icon: Zap,        label: "Speed Burst",    badge: null },
      { href: "/games/bubble-pop",   icon: CircleDot,  label: "Bubble Pop",     badge: "NEW" },
      { href: "/games/pipe-run",     icon: Wrench,     label: "Pipe Run",       badge: "NEW" },
      { href: "/games/word-tetris",  icon: Layers,     label: "Word Tetris",    badge: "NEW" },
      { href: "/games/alphabet-race",icon: Timer,      label: "Alphabet Race",  badge: "NEW" },
      { href: "/games/cloud-race",   icon: Wind,       label: "Cloud Race",     badge: "NEW" },
    ],
  },
  {
    label: "More",
    items: [
      { href: "/blog",     icon: BookOpen, label: "Blog & Tips",  badge: null },
      { href: "/download", icon: Download, label: "Desktop App",  badge: null },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    setXp(getTotalXP());
    setStreak(getStreak().count);
    setBestWpm(getHighScore());
    setCompletedCount(getCompleted().length);
  }, [location]);

  const level = Math.floor(xp / 200) + 1;
  const xpToNext = 200 - (xp % 200);
  const xpProgress = ((xp % 200) / 200) * 100;

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative h-full bg-card/50 border-r border-border/50 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden z-40"
    >
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border/60 flex items-center justify-center z-50 hover:bg-primary/10 transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-3 h-3 text-muted-foreground" /> : <ChevronLeft className="w-3 h-3 text-muted-foreground" />}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-3 py-4 border-b border-border/40 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="text-lg font-black whitespace-nowrap overflow-hidden"
            >
              <span className="text-primary">Boom</span><span>Type</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Stats bar (collapsed: icons only) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-3 py-3 border-b border-border/40 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {xp.toLocaleString()} XP
              </div>
              <span className="text-muted-foreground/50">Lv.{level}</span>
            </div>
            <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all" style={{ width: `${xpProgress}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs mt-1">
              {streak > 0 && (
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 py-1">
                  <Flame className="w-3 h-3 text-orange-400 mx-auto mb-0.5" />
                  <span className="text-orange-400 font-bold">{streak}d</span>
                </div>
              )}
              <div className="rounded-lg bg-primary/10 border border-primary/20 py-1">
                <Target className="w-3 h-3 text-primary mx-auto mb-0.5" />
                <span className="text-primary font-bold">{bestWpm}</span>
              </div>
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 py-1">
                <CheckCircle2 className="w-3 h-3 text-green-400 mx-auto mb-0.5" />
                <span className="text-green-400 font-bold">{completedCount}/7</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2 scrollbar-thin">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-2 pt-3 pb-1 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                {section.label}
              </div>
            )}
            {section.items.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer relative group
                    ${active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}>
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
                        >{item.label}</motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && item.badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        item.badge === "NEW" ? "bg-accent/20 text-accent border border-accent/30" : "bg-primary/20 text-primary"
                      }`}>{item.badge}</span>
                    )}
                    {/* Tooltip for collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-card border border-border/60 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                        {item.label}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* WPM display bottom */}
      {!collapsed && bestWpm > 0 && (
        <div className="px-3 pb-3 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span>Best: <span className="text-primary font-bold">{bestWpm} WPM</span></span>
          </div>
        </div>
      )}
    </motion.aside>
  );
}

// Mobile sidebar toggle button (floating)
export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 left-3 z-50 md:hidden w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center shadow-lg"
    >
      <Menu className="w-4 h-4 text-foreground" />
    </button>
  );
}
