import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import MusicPlayer from "@/components/MusicPlayer";
import { VoiceProvider } from "@/components/VoiceInstructor";
import Landing from "@/pages/Landing";
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
import Payment from "@/pages/Payment";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
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
          <Route path="/payment" component={Payment} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
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
            <Router />
            <MusicPlayer />
          </VoiceProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
