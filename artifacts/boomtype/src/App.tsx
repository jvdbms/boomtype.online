import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import MusicPlayer from "@/components/MusicPlayer";
import { VoiceProvider } from "@/components/VoiceInstructor";
import Sidebar from "@/components/Sidebar";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import TypingTest from "@/pages/TypingTest";
import Results from "@/pages/Results";
import Leaderboard from "@/pages/Leaderboard";
import Lessons from "@/pages/Lessons";
import LessonTest from "@/pages/LessonTest";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Premium from "@/pages/Premium";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import Profile from "@/pages/Profile";
import Games from "@/pages/Games";
import WordRain from "@/pages/WordRain";
import ZombieAttack from "@/pages/ZombieAttack";
import SpeedBurst from "@/pages/SpeedBurst";
import BubblePop from "@/pages/BubblePop";
import PipeRun from "@/pages/PipeRun";
import WordTetris from "@/pages/WordTetris";
import AlphabetRace from "@/pages/AlphabetRace";
import CloudRace from "@/pages/CloudRace";
import Download from "@/pages/Download";
import Payment from "@/pages/Payment";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1 } },
});

// Paths where the sidebar should be hidden (immersive game/lesson views)
const SIDEBAR_HIDDEN_PREFIXES = [
  "/games/word-rain", "/games/zombie-attack", "/games/speed-burst",
  "/games/bubble-pop", "/games/pipe-run", "/games/word-tetris",
  "/games/alphabet-race", "/games/cloud-race",
  "/lessons/",
];

function AppLayout() {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem("boomtype_sidebar_collapsed") === "1"; } catch { return false; }
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const hideSidebar = SIDEBAR_HIDDEN_PREFIXES.some(p => location.startsWith(p));

  useEffect(() => {
    try { localStorage.setItem("boomtype_sidebar_collapsed", sidebarCollapsed ? "1" : "0"); } catch {}
  }, [sidebarCollapsed]);

  // Close mobile sidebar on navigation
  useEffect(() => { setMobileSidebarOpen(false); }, [location]);

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar — desktop */}
        {!hideSidebar && (
          <div className="hidden md:block h-[calc(100vh-4rem)] sticky top-16 overflow-hidden shrink-0">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(c => !c)} />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && !hideSidebar && (
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div className="absolute left-0 top-0 h-full" onClick={e => e.stopPropagation()}>
              <Sidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/test" component={TypingTest} />
            <Route path="/results" component={Results} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/lessons" component={Lessons} />
            <Route path="/lessons/:id" component={LessonTest} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route path="/premium" component={Premium} />
            <Route path="/about" component={About} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/contact" component={Contact} />
            <Route path="/profile/:nickname" component={Profile} />
            <Route path="/games" component={Games} />
            <Route path="/games/word-rain" component={WordRain} />
            <Route path="/games/zombie-attack" component={ZombieAttack} />
            <Route path="/games/speed-burst" component={SpeedBurst} />
            <Route path="/games/bubble-pop" component={BubblePop} />
            <Route path="/games/pipe-run" component={PipeRun} />
            <Route path="/games/word-tetris" component={WordTetris} />
            <Route path="/games/alphabet-race" component={AlphabetRace} />
            <Route path="/games/cloud-race" component={CloudRace} />
            <Route path="/download" component={Download} />
            <Route path="/payment" component={Payment} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      <Footer />

      {/* Mobile sidebar toggle */}
      {!hideSidebar && (
        <button
          onClick={() => setMobileSidebarOpen(o => !o)}
          className="fixed bottom-20 left-3 z-50 md:hidden w-10 h-10 rounded-xl bg-card border border-border/60 flex items-center justify-center shadow-lg"
        >
          <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <VoiceProvider>
            <AnimatedBackground />
            <AppLayout />
            <MusicPlayer />
          </VoiceProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
