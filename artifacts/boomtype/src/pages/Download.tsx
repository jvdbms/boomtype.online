import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Monitor, Apple, Terminal, Download as DownloadIcon, CheckCircle2, Zap,
  Keyboard, Trophy, BookOpen, Gamepad2, Wifi, HardDrive,
  Star, ChevronRight, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const FEATURES = [
  { icon: Keyboard,   label: "Offline Typing Tests",   desc: "Practice without internet — all lessons and tests work offline" },
  { icon: Zap,        label: "Instant Launch",          desc: "Opens in seconds from your desktop or taskbar like a native app" },
  { icon: Trophy,     label: "Synced Leaderboard",      desc: "Scores sync to the global leaderboard whenever you're online" },
  { icon: BookOpen,   label: "All 7 Lessons",           desc: "Full Typing Master Path with progress tracking, locally stored" },
  { icon: Gamepad2,   label: "8 Typing Games",          desc: "Bubble Pop, Word Tetris, Cloud Race and more — all offline ready" },
  { icon: HardDrive,  label: "Under 2 MB",              desc: "Tiny footprint — no bloated installer, no background services" },
  { icon: Wifi,       label: "No Internet Required",    desc: "Core features work fully offline after the first install" },
  { icon: Star,       label: "Free Forever",            desc: "The desktop app is completely free, same as the web version" },
];

const OS_STEPS: Record<string, { icon: typeof Monitor; label: string; color: string; steps: string[] }> = {
  windows: {
    icon: Monitor, label: "Windows", color: "from-blue-500 to-cyan-500",
    steps: [
      'Click "Install Desktop App" below',
      'A browser prompt will appear — click "Install"',
      'BoomType appears on your Desktop and Start Menu',
      "Launch it anytime — it opens like a native app",
    ],
  },
  mac: {
    icon: Apple, label: "macOS", color: "from-gray-400 to-gray-600",
    steps: [
      'Click "Install Desktop App" below',
      'In Chrome/Edge: click the ⊕ icon in the address bar',
      'In Safari: Share → "Add to Dock"',
      "Find BoomType in your Applications folder or Dock",
    ],
  },
  linux: {
    icon: Terminal, label: "Linux", color: "from-orange-500 to-amber-500",
    steps: [
      'Click "Install Desktop App" below',
      'Chrome/Chromium: click the ⊕ in the address bar',
      'Click "Install" in the confirmation dialog',
      "Launch from your app launcher or terminal",
    ],
  },
};

export default function DownloadPage() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [activeOs, setActiveOs] = useState<keyof typeof OS_STEPS>("windows");
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    document.title = "Download BoomType Desktop | Typing Master App";

    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect OS for default tab
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("mac")) setActiveOs("mac");
    else if (ua.includes("linux")) setActiveOs("linux");
    else setActiveOs("windows");

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      setIsInstalling(true);
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setJustInstalled(true);
        setIsInstalled(true);
      }
      setIsInstalling(false);
      setInstallPrompt(null);
    } else {
      // Fallback — open instructions in a new tab (current page with anchor)
      document.getElementById("install-guide")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const OsIcon = OS_STEPS[activeOs].icon;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-5">
            <DownloadIcon className="w-4 h-4" />
            Desktop App — Free
          </div>

          {/* App icon */}
          <div className="w-24 h-24 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.4)]">
            <Zap className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-white via-white to-accent/80 bg-clip-text text-transparent">
            BoomType Desktop
          </h1>
          <p className="text-xl text-muted-foreground mb-2">The full Typing Master experience — on your desktop.</p>
          <p className="text-sm text-muted-foreground">Works on Windows, macOS, and Linux · No download required · Under 2 MB</p>

          {/* Main CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
            {isInstalled ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-400 font-bold"
              >
                <CheckCircle2 className="w-5 h-5" />
                {justInstalled ? "App installed successfully!" : "BoomType is already installed on this device"}
              </motion.div>
            ) : (
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-gradient-to-r from-primary to-accent text-white font-black text-lg px-8 py-6 h-auto rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:opacity-90 hover:scale-105 transition-all gap-3"
              >
                <DownloadIcon className="w-6 h-6" />
                {isInstalling ? "Installing…" : "Install Desktop App"}
              </Button>
            )}
            <Link href="/test">
              <Button variant="outline" className="border-border/60 hover:bg-white/5 gap-2 py-6 h-auto px-6 rounded-2xl text-base">
                Use in Browser <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Uses PWA technology — installs directly from your browser, no app store needed
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                className="rounded-2xl bg-card border border-border/60 p-4 hover:border-primary/30 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="font-bold text-sm mb-1">{f.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Install guide */}
        <motion.div id="install-guide" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-3xl bg-card border border-border/60 p-8 mb-10"
        >
          <h2 className="text-2xl font-black mb-6 text-center">How to Install</h2>

          {/* OS tabs */}
          <div className="flex gap-2 justify-center mb-7">
            {(Object.keys(OS_STEPS) as Array<keyof typeof OS_STEPS>).map(os => {
              const OsTab = OS_STEPS[os].icon;
              return (
                <button key={os} onClick={() => setActiveOs(os)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    activeOs === os
                      ? `bg-gradient-to-r ${OS_STEPS[os].color} text-white border-transparent shadow-lg`
                      : "bg-white/5 border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <OsTab className="w-4 h-4" />
                  {OS_STEPS[os].label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeOs} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${OS_STEPS[activeOs].color} flex items-center justify-center shrink-0 shadow-lg`}>
                  <OsIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <ol className="space-y-3">
                    {OS_STEPS[activeOs].steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {!isInstalled && (
                    <Button onClick={handleInstall} className={`mt-5 bg-gradient-to-r ${OS_STEPS[activeOs].color} text-white font-bold gap-2 hover:opacity-90`}>
                      <DownloadIcon className="w-4 h-4" />
                      Install for {OS_STEPS[activeOs].label}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Comparison: Browser vs Desktop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-3xl bg-card border border-border/60 p-8 mb-10"
        >
          <h2 className="text-2xl font-black mb-6 text-center">Browser vs Desktop App</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="font-bold text-muted-foreground text-xs uppercase tracking-wide" />
            <div className="rounded-xl bg-white/5 border border-border/50 p-3 text-center font-bold text-sm">Browser</div>
            <div className="rounded-xl bg-primary/10 border border-primary/30 p-3 text-center font-black text-primary text-sm">Desktop App</div>
            {[
              ["Works offline",         "❌",  "✅"],
              ["Desktop shortcut",      "❌",  "✅"],
              ["No browser chrome",     "❌",  "✅"],
              ["Taskbar icon",          "❌",  "✅"],
              ["All features",          "✅",  "✅"],
              ["Free",                  "✅",  "✅"],
              ["Always up to date",     "✅",  "✅"],
              ["No install required",   "✅",  "❌"],
            ].map(([feature, browser, desktop]) => (
              <React.Fragment key={feature}>
                <div className="flex items-center text-muted-foreground py-2 border-b border-border/30">{feature}</div>
                <div className="flex items-center justify-center text-lg py-2 border-b border-border/30">{browser}</div>
                <div className="flex items-center justify-center text-lg py-2 border-b border-border/30 bg-primary/3 rounded-sm">{desktop}</div>
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* CTA bottom */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-3xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 p-10 text-center"
        >
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-3xl font-black mb-2">Ready to level up?</h2>
          <p className="text-muted-foreground mb-6">Install BoomType once. Open it from your desktop forever.</p>
          {isInstalled ? (
            <Link href="/test">
              <Button className="bg-gradient-to-r from-primary to-accent text-white font-black text-base px-8 py-5 h-auto rounded-2xl gap-2 hover:opacity-90">
                Start Typing <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Button onClick={handleInstall}
              className="bg-gradient-to-r from-primary to-accent text-white font-black text-base px-8 py-5 h-auto rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.3)] gap-2 hover:opacity-90 hover:scale-105 transition-all"
            >
              <DownloadIcon className="w-5 h-5" />
              Install Free Desktop App
            </Button>
          )}
        </motion.div>

      </div>
    </div>
  );
}
