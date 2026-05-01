import { useEffect } from "react";
import { Mail, Twitter, Github } from "lucide-react";

export default function Contact() {
  useEffect(() => {
    document.title = "Contact BoomType — Get in Touch";
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-3">Contact Us</h1>
          <p className="text-muted-foreground text-lg">We love hearing from the typing community</p>
        </div>

        <div className="grid gap-5">
          {[
            { icon: Mail, title: "General Inquiries", email: "hello@boomtype.com", desc: "Questions, feedback, partnerships" },
            { icon: Mail, title: "Premium Support", email: "premium@boomtype.com", desc: "Billing, subscription, access issues" },
            { icon: Mail, title: "Privacy & Legal", email: "privacy@boomtype.com", desc: "Data requests, GDPR, terms" },
          ].map(contact => (
            <div key={contact.title} className="p-6 rounded-2xl bg-card border border-border/60 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <contact.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold mb-0.5">{contact.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{contact.desc}</p>
                <a href={`mailto:${contact.email}`} className="text-primary text-sm hover:underline">{contact.email}</a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-card border border-border/60">
          <h3 className="font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-4 h-4" />
              @boomtype
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
              github/boomtype
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
