interface AdBannerProps {
  size?: "leaderboard" | "rectangle" | "square";
  className?: string;
}

export default function AdBanner({ size = "leaderboard", className = "" }: AdBannerProps) {
  const dimensions = {
    leaderboard: { width: "100%", height: "90px", label: "Advertisement — 728×90" },
    rectangle: { width: "300px", height: "250px", label: "Advertisement — 300×250" },
    square: { width: "250px", height: "250px", label: "Advertisement — 250×250" },
  };

  const d = dimensions[size];

  return (
    <div
      className={`ad-placeholder adsense-ready ${className}`}
      style={{ width: d.width, minHeight: d.height, maxWidth: "100%" }}
      data-ad-slot="boomtype-ad"
      aria-label="Advertisement"
    >
      <span>{d.label}</span>
    </div>
  );
}
