import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Twitter, Github, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = "Contact BoomType — Get in Touch";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Contact the BoomType team for support, partnerships, or feedback.");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1200);
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Mail className="w-4 h-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl font-black mb-3">Contact Us</h1>
          <p className="text-muted-foreground text-lg">We love hearing from the typing community</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-card border border-border/60 p-7"
          >
            <h2 className="text-xl font-black mb-6">Send a Message</h2>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm">We'll get back to you within 24 hours.</p>
                <Button
                  variant="outline"
                  className="mt-6 border-border/60 hover:bg-white/5"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Name</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="bg-background border-border/60 focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="bg-background border-border/60 focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1.5">Message</label>
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    required
                    rows={5}
                    className="bg-background border-border/60 focus:border-primary/50 resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending || !name.trim() || !email.trim() || !message.trim()}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold gap-2 py-5 h-auto hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                  {sending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {[
              { icon: Mail, title: "General Inquiries", email: "hello@boomtype.com", desc: "Questions, feedback, partnerships" },
              { icon: Mail, title: "Premium Support", email: "premium@boomtype.com", desc: "Billing, subscription, access issues" },
              { icon: Mail, title: "Privacy & Legal", email: "privacy@boomtype.com", desc: "Data requests, GDPR, terms" },
            ].map((contact, i) => (
              <motion.div
                key={contact.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-5 rounded-2xl bg-card border border-border/60 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <contact.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-0.5">{contact.title}</h3>
                  <p className="text-xs text-muted-foreground mb-1.5">{contact.desc}</p>
                  <a href={`mailto:${contact.email}`} className="text-primary text-sm hover:underline font-medium">
                    {contact.email}
                  </a>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-2xl bg-card border border-border/60"
            >
              <h3 className="font-bold mb-4">Follow Us</h3>
              <div className="flex gap-3">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <Twitter className="w-4 h-4" />
                  @boomtype
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <Github className="w-4 h-4" />
                  github/boomtype
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
