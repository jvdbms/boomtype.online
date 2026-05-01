import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy | BoomType";
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: May 1, 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          {[
            {
              title: "Information We Collect",
              content: "We collect typing test results (WPM, accuracy, duration) and your chosen nickname when you submit to the leaderboard. We do not require account registration. We may also collect anonymized usage analytics to improve the service.",
            },
            {
              title: "How We Use Your Information",
              content: "Test results are used to populate the leaderboard and calculate platform-wide statistics. We may use anonymized data to improve our typing algorithms and word lists. We never sell personal data to third parties.",
            },
            {
              title: "Cookies and Local Storage",
              content: "BoomType uses localStorage to save your nickname, high score, streak, and XP locally on your device. This data never leaves your device unless you submit to the leaderboard. We may use analytics cookies (e.g., Google Analytics) to understand how users interact with the platform.",
            },
            {
              title: "Advertising",
              content: "Free tier users will see advertisements served by Google AdSense. AdSense may use cookies to serve personalized ads. Premium users enjoy an ad-free experience.",
            },
            {
              title: "Data Retention",
              content: "Leaderboard entries (nickname and score) are retained indefinitely as they are part of the public leaderboard. Local storage data remains on your device until you clear it.",
            },
            {
              title: "Your Rights",
              content: "You may request removal of your leaderboard entries by contacting us at privacy@boomtype.com. You can clear your local data at any time by clearing your browser's localStorage for this site.",
            },
            {
              title: "Contact",
              content: "For privacy concerns, contact us at privacy@boomtype.com.",
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
