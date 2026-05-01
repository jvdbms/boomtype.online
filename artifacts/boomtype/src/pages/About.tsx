import { useEffect } from "react";
import { Zap, Users, Target, Heart } from "lucide-react";

export default function About() {
  useEffect(() => {
    document.title = "About BoomType — Our Mission to Make the World Type Faster";
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-4xl font-black mb-4">About BoomType</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            BoomType was born from a simple idea: typing speed matters, and improving it should be fun, competitive, and rewarding.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 mb-12 text-muted-foreground leading-relaxed">
          <p>
            In a world where we type thousands of words every day — emails, messages, code, documents — typing speed is one of the most underrated productivity skills. We believe that with the right tools and the right motivation, anyone can become a faster, more accurate typist.
          </p>
          <p>
            BoomType combines the precision of professional typing tools with the addictiveness of competitive gaming. Real-time WPM tracking, global leaderboards, achievement badges, and viral sharing make every test feel like an event — not a chore.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {[
            { icon: Users, title: "10,000+", desc: "Active typists worldwide" },
            { icon: Target, title: "500K+", desc: "Tests completed" },
            { icon: Zap, title: "142 WPM", desc: "All-time record on BoomType" },
          ].map(stat => (
            <div key={stat.title} className="p-6 rounded-2xl bg-card border border-border/60 text-center">
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-3xl font-black gradient-text mb-1">{stat.title}</div>
              <div className="text-sm text-muted-foreground">{stat.desc}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-card border border-border/60 p-8">
          <h2 className="text-2xl font-black mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We believe keyboard proficiency is a superpower in the digital age. Our mission is to help 1 million people improve their typing speed through engaging, data-driven, and socially-connected tools.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            BoomType is built by typists, for typists. Every feature is designed with one goal: help you get faster, track your progress, and have fun doing it.
          </p>
        </div>
      </div>
    </div>
  );
}
