import { Link } from "wouter";
import { motion } from "framer-motion";
import { Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="text-[120px] font-black leading-none gradient-text mb-4">404</div>
        <h1 className="text-2xl font-black mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Looks like this page typed a wrong key. Let's get you back on track.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-primary to-accent text-white gap-2 font-bold">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/test">
            <Button variant="outline" className="gap-2 border-border/60 hover:bg-white/5">
              <Zap className="w-4 h-4" />
              Take a Test
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
