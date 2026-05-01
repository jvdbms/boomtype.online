import { useEffect } from "react";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms & Conditions | BoomType";
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-3">Terms & Conditions</h1>
        <p className="text-muted-foreground mb-10">Last updated: May 1, 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          {[
            {
              title: "Acceptance of Terms",
              content: "By using BoomType, you agree to these Terms and Conditions. If you do not agree, please do not use the service.",
            },
            {
              title: "Use of Service",
              content: "BoomType is provided for personal, non-commercial use. You may not use automated tools to take tests, manipulate leaderboard scores, or otherwise abuse the platform. Any attempt to cheat or manipulate results will result in removal from the leaderboard.",
            },
            {
              title: "User Content",
              content: "When you submit a nickname to the leaderboard, you grant BoomType the right to display it publicly. Please choose an appropriate nickname — we reserve the right to remove entries with offensive or inappropriate nicknames.",
            },
            {
              title: "Premium Subscriptions",
              content: "Premium subscriptions are billed monthly and may be cancelled at any time. Cancellation takes effect at the end of the current billing period. We do not offer refunds for partial months.",
            },
            {
              title: "Intellectual Property",
              content: "All content on BoomType, including word lists, design, and branding, is the property of BoomType. You may not reproduce or distribute our content without explicit permission.",
            },
            {
              title: "Disclaimer",
              content: "BoomType is provided 'as is' without warranties of any kind. We are not responsible for any interruptions in service or inaccuracies in WPM calculations.",
            },
            {
              title: "Changes to Terms",
              content: "We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.",
            },
            {
              title: "Contact",
              content: "For questions about these terms, contact us at legal@boomtype.com.",
            },
          ].map(section => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-foreground mb-3">{section.title}</h2>
              <p>{section.content}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
