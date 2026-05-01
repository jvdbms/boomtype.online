import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Landing from "@/pages/Landing";
import TypingTest from "@/pages/TypingTest";
import Results from "@/pages/Results";
import Leaderboard from "@/pages/Leaderboard";
import Lessons from "@/pages/Lessons";
import Blog from "@/pages/Blog";
import Premium from "@/pages/Premium";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/test" component={TypingTest} />
          <Route path="/results" component={Results} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/lessons" component={Lessons} />
          <Route path="/blog" component={Blog} />
          <Route path="/premium" component={Premium} />
          <Route path="/about" component={About} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route path="/contact" component={Contact} />
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
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
