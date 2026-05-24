import { useEffect, useRef, useState } from "react";
import { Share2, Check } from "lucide-react";

interface BadgeShareButtonProps {
  badgeName: string;
  badgeIcon: string;
}

type Platform = "whatsapp" | "facebook" | "twitter" | "copy";

export function BadgeShareButton({ badgeName, badgeIcon }: BadgeShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const shareText = `I just unlocked the ${badgeName} badge on BoomType! ${badgeIcon}`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleShare = (platform: Platform) => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    const links: Record<Exclude<Platform, "copy">, string> = {
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    };
    if (platform === "copy") {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      return;
    }
    window.open(links[platform], "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        title={`Share ${badgeName}`}
        aria-label={`Share ${badgeName} badge`}
        data-testid={`button-badge-share-${badgeName.toLowerCase().replace(/\s+/g, "-")}`}
        className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors border border-border/40"
      >
        <Share2 className="w-3 h-3" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 z-30 w-40 rounded-lg bg-card border border-border shadow-xl p-1.5 flex flex-col gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { platform: "whatsapp" as const, label: "WhatsApp", color: "text-green-400 hover:bg-green-500/10" },
            { platform: "facebook" as const, label: "Facebook", color: "text-blue-400 hover:bg-blue-500/10" },
            { platform: "twitter" as const, label: "Twitter/X", color: "text-sky-400 hover:bg-sky-500/10" },
            { platform: "copy" as const, label: copied ? "Copied!" : "Copy Link", color: "text-foreground hover:bg-white/5" },
          ].map(({ platform, label, color }) => (
            <button
              key={platform}
              type="button"
              onClick={() => handleShare(platform)}
              data-testid={`button-badge-share-${platform}`}
              className={`text-left text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 ${color}`}
            >
              {platform === "copy" && copied && <Check className="w-3 h-3" />}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
