import { Link } from "wouter";
import { Zap, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xl font-black">
                <span className="text-primary">Boom</span>
                <span className="text-foreground">Type</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Test your typing speed, compete with others, and improve your skills every day.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Practice</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/test", label: "Typing Test" },
                { href: "/lessons", label: "Lessons" },
                { href: "/leaderboard", label: "Leaderboard" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About Us" },
                { href: "/blog", label: "Blog" },
                { href: "/premium", label: "Premium" },
                { href: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms & Conditions" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BoomType. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for speed junkies worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
