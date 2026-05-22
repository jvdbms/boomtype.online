import { useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, CheckCircle, MessageCircle, Smartphone, Banknote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PHONE = "03217106893";
const WHATSAPP_MSG = encodeURIComponent(`Hi! I've sent the payment for BoomType Premium. Please activate my account. Phone: `);

const PLANS = [
  { label: "Monthly", price: "500", per: "/month", usd: "($1.99)", save: null },
  { label: "Yearly", price: "4,000", per: "/year", usd: "($14.99)", save: "Save 33%", highlight: true },
];

const FEATURES = [
  "All Premium lessons unlocked",
  "No ads — clean, distraction-free experience",
  "Detailed analytics & performance graphs",
  "Official BoomType certificate",
  "All typing games unlocked",
  "Priority leaderboard badge",
  "Voice instructor all modes",
];

const STEPS = [
  { icon: Smartphone, title: "Choose a plan below", desc: "Monthly or yearly — both are great value" },
  { icon: Banknote, title: "Send payment", desc: `Send PKR to the account number shown below via JazzCash or EasyPaisa` },
  { icon: MessageCircle, title: "WhatsApp confirmation", desc: "Send a payment screenshot to our WhatsApp and we'll activate your account within 1 hour" },
];

export default function Payment() {
  useEffect(() => {
    document.title = "Get Premium | BoomType — JazzCash & EasyPaisa";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Upgrade BoomType Premium via JazzCash or EasyPaisa. Account number: 03217106893. Unlock all lessons, games, and analytics.");
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
            <Crown className="w-4 h-4" />
            BoomType Premium
          </div>
          <h1 className="text-4xl font-black mb-3">Upgrade via JazzCash / EasyPaisa</h1>
          <p className="text-muted-foreground text-lg">Pay locally in PKR — no card required</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border ${
                plan.highlight
                  ? "bg-gradient-to-br from-accent/20 to-primary/10 border-accent/40"
                  : "bg-card border-border/60"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white text-xs font-bold">
                  Best Value
                </div>
              )}
              {plan.save && (
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold mb-3">
                  {plan.save}
                </span>
              )}
              <div className="mb-1">
                <span className="text-muted-foreground text-sm font-medium">{plan.label}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black">PKR {plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.per}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">{plan.usd} equivalent</p>
              <a
                href={`https://wa.me/92${PHONE.slice(1)}?text=${WHATSAPP_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className={`w-full gap-2 font-bold ${plan.highlight ? "bg-gradient-to-r from-primary to-accent text-white" : "bg-card border border-border/60 hover:bg-white/5"}`}>
                  <MessageCircle className="w-4 h-4" />
                  Get {plan.label} — Contact Us
                </Button>
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card border border-border/60 p-6 mb-6"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            What You Get
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FEATURES.map(f => (
              <div key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl bg-card border border-border/60 p-6 mb-6"
        >
          <h2 className="text-lg font-bold mb-5">How to Pay</h2>
          <div className="space-y-4">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="font-semibold text-sm mb-0.5 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-primary" />
                    {title}
                  </div>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          {[
            { name: "JazzCash", emoji: "📱", color: "from-red-500/20 to-orange-500/10", border: "border-red-500/30", accent: "text-red-400" },
            { name: "EasyPaisa", emoji: "💚", color: "from-green-500/20 to-emerald-500/10", border: "border-green-500/30", accent: "text-green-400" },
          ].map(p => (
            <div key={p.name} className={`rounded-2xl bg-gradient-to-br ${p.color} border ${p.border} p-5`}>
              <div className="text-3xl mb-2">{p.emoji}</div>
              <div className={`font-black text-lg mb-1 ${p.accent}`}>{p.name}</div>
              <div className="text-sm text-muted-foreground mb-2">Account Number:</div>
              <div className="font-mono font-black text-xl tracking-widest text-foreground bg-black/20 rounded-xl px-4 py-2 text-center select-all">
                {PHONE}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Account Name: BoomType</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 text-center"
        >
          <div className="text-3xl mb-3">💬</div>
          <h2 className="text-lg font-black mb-2">After Sending Payment</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Send your payment screenshot to our WhatsApp at <strong className="text-foreground">{PHONE}</strong>.
            We'll verify and activate your Premium account within 1 hour (during business hours).
          </p>
          <a
            href={`https://wa.me/92${PHONE.slice(1)}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2 px-8">
              <MessageCircle className="w-4 h-4" />
              Contact to Activate
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
}
