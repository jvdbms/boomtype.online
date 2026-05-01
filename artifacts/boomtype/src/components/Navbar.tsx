import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Zap, Menu, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/test", label: "Test" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/lessons", label: "Lessons" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xl font-black tracking-tight">
              <span className="text-primary">Boom</span>
              <span className="text-foreground">Type</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === link.href
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/premium">
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-lg hover:opacity-90 transition-opacity gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                Go Premium
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="nav-mobile-toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  location === link.href
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/premium" onClick={() => setIsOpen(false)}>
              <Button className="w-full mt-2 bg-gradient-to-r from-primary to-accent text-white font-semibold gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                Go Premium
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
