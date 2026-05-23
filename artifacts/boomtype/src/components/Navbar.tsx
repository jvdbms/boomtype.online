import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Zap, Menu, X, Crown, Star, Flame, Gamepad2, Download, LayoutDashboard, CreditCard, MonitorDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTotalXP, getStreak } from "@/lib/storage";
import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();

  const xp = getTotalXP();
  const { count: streak } = getStreak();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/test",        label: "Test" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/lessons",     label: "Lessons" },
    { href: "/games",       label: "Games", icon: Gamepad2 },
    { href: "/blog",        label: "Blog" },
    { href: "/payment",     label: "Payment", icon: CreditCard },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-primary">Boom</span>
              <span className="text-foreground">Type</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = location === link.href || (link.href !== "/" && location.startsWith(link.href + "/"));
              return (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                    active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  data-testid={`nav-link-${link.label.toLowerCase()}`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {xp > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold">
                <Star className="w-3 h-3 fill-yellow-400" />{xp.toLocaleString()} XP
              </div>
            )}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
                <Flame className="w-3 h-3" />{streak}d streak
              </div>
            )}
            {canInstall && !isInstalled && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => promptInstall()}
                className="border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary gap-1.5"
                data-testid="button-install-pwa"
              >
                <MonitorDown className="w-3.5 h-3.5" />Install App
              </Button>
            )}
            <Link href="/download">
              <Button size="sm" variant="outline" className="border-border/60 hover:bg-white/5 gap-1.5 text-muted-foreground hover:text-foreground">
                <Download className="w-3.5 h-3.5" />Get App
              </Button>
            </Link>
            <Link href="/premium">
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:opacity-90 transition-opacity gap-1.5">
                <Crown className="w-3.5 h-3.5" />Go Premium
              </Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            onClick={() => setIsOpen(!isOpen)} data-testid="nav-mobile-toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {(xp > 0 || streak > 0) && (
              <div className="flex gap-2 pb-2">
                {xp > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold">
                    <Star className="w-3 h-3 fill-yellow-400" />{xp.toLocaleString()} XP
                  </div>
                )}
                {streak > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
                    <Flame className="w-3 h-3" />{streak}d
                  </div>
                )}
              </div>
            )}
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = location === link.href || (link.href !== "/" && location.startsWith(link.href + "/"));
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
            {canInstall && !isInstalled && (
              <Button
                onClick={() => { promptInstall(); setIsOpen(false); }}
                variant="outline"
                className="w-full mt-2 border-primary/40 bg-primary/5 text-primary gap-1.5"
              >
                <MonitorDown className="w-3.5 h-3.5" />Install BoomType App
              </Button>
            )}
            <Link href="/download" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full mt-2 border-border/60 gap-1.5 text-muted-foreground">
                <Download className="w-3.5 h-3.5" />Download Desktop App
              </Button>
            </Link>
            <Link href="/premium" onClick={() => setIsOpen(false)}>
              <Button className="w-full mt-1 bg-gradient-to-r from-primary to-accent text-white font-semibold gap-1.5">
                <Crown className="w-3.5 h-3.5" />Go Premium
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
