import { useEffect, useState } from "react";

interface KeyboardVisualizerProps {
  highlightKey?: string;
  showFingerGuide?: boolean;
}

const ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l",";"],
  ["z","x","c","v","b","n","m",",",".","/"],
];

// Which finger (0=pinky,1=ring,2=middle,3=index) and hand ('L'/'R')
const KEY_FINGER: Record<string, { hand: "L" | "R"; finger: 0 | 1 | 2 | 3 }> = {
  "q":{"hand":"L","finger":0}, "a":{"hand":"L","finger":0}, "z":{"hand":"L","finger":0},
  "w":{"hand":"L","finger":1}, "s":{"hand":"L","finger":1}, "x":{"hand":"L","finger":1},
  "e":{"hand":"L","finger":2}, "d":{"hand":"L","finger":2}, "c":{"hand":"L","finger":2},
  "r":{"hand":"L","finger":3}, "f":{"hand":"L","finger":3}, "v":{"hand":"L","finger":3},
  "t":{"hand":"L","finger":3}, "g":{"hand":"L","finger":3}, "b":{"hand":"L","finger":3},
  "y":{"hand":"R","finger":3}, "h":{"hand":"R","finger":3}, "n":{"hand":"R","finger":3},
  "u":{"hand":"R","finger":3}, "j":{"hand":"R","finger":3}, "m":{"hand":"R","finger":3},
  "i":{"hand":"R","finger":2}, "k":{"hand":"R","finger":2}, ",":{"hand":"R","finger":2},
  "o":{"hand":"R","finger":1}, "l":{"hand":"R","finger":1}, ".":{"hand":"R","finger":1},
  "p":{"hand":"R","finger":0}, ";":{"hand":"R","finger":0}, "/":{"hand":"R","finger":0},
};

const FINGER_COLORS: Record<string, string> = {
  "a":"text-rose-400 border-rose-500/50 bg-rose-500/12",
  "q":"text-rose-400 border-rose-500/50 bg-rose-500/12",
  "z":"text-rose-400 border-rose-500/50 bg-rose-500/12",
  "s":"text-orange-400 border-orange-500/50 bg-orange-500/12",
  "w":"text-orange-400 border-orange-500/50 bg-orange-500/12",
  "x":"text-orange-400 border-orange-500/50 bg-orange-500/12",
  "d":"text-yellow-400 border-yellow-500/50 bg-yellow-500/12",
  "e":"text-yellow-400 border-yellow-500/50 bg-yellow-500/12",
  "c":"text-yellow-400 border-yellow-500/50 bg-yellow-500/12",
  "f":"text-green-400 border-green-500/50 bg-green-500/12",
  "r":"text-green-400 border-green-500/50 bg-green-500/12",
  "v":"text-green-400 border-green-500/50 bg-green-500/12",
  "g":"text-green-400 border-green-500/50 bg-green-500/12",
  "t":"text-green-400 border-green-500/50 bg-green-500/12",
  "b":"text-green-400 border-green-500/50 bg-green-500/12",
  "y":"text-sky-400 border-sky-500/50 bg-sky-500/12",
  "h":"text-sky-400 border-sky-500/50 bg-sky-500/12",
  "n":"text-sky-400 border-sky-500/50 bg-sky-500/12",
  "u":"text-cyan-400 border-cyan-500/50 bg-cyan-500/12",
  "j":"text-cyan-400 border-cyan-500/50 bg-cyan-500/12",
  "m":"text-cyan-400 border-cyan-500/50 bg-cyan-500/12",
  "k":"text-purple-400 border-purple-500/50 bg-purple-500/12",
  "i":"text-purple-400 border-purple-500/50 bg-purple-500/12",
  ",":"text-purple-400 border-purple-500/50 bg-purple-500/12",
  "l":"text-pink-400 border-pink-500/50 bg-pink-500/12",
  "o":"text-pink-400 border-pink-500/50 bg-pink-500/12",
  ".":"text-pink-400 border-pink-500/50 bg-pink-500/12",
  ";":"text-rose-400 border-rose-500/50 bg-rose-500/12",
  "p":"text-rose-400 border-rose-500/50 bg-rose-500/12",
  "/":"text-rose-400 border-rose-500/50 bg-rose-500/12",
};

// Finger display config per hand
const LEFT_FINGERS = [
  { id: 0, label: "Pinky", short: "P", color: "bg-rose-500",   glow: "shadow-rose-500/60",   ring: "ring-rose-400" },
  { id: 1, label: "Ring",  short: "R", color: "bg-orange-500", glow: "shadow-orange-500/60", ring: "ring-orange-400" },
  { id: 2, label: "Mid",   short: "M", color: "bg-yellow-500", glow: "shadow-yellow-500/60", ring: "ring-yellow-400" },
  { id: 3, label: "Index", short: "I", color: "bg-green-500",  glow: "shadow-green-500/60",  ring: "ring-green-400" },
];
const RIGHT_FINGERS = [
  { id: 3, label: "Index", short: "I", color: "bg-sky-500",    glow: "shadow-sky-500/60",    ring: "ring-sky-400" },
  { id: 2, label: "Mid",   short: "M", color: "bg-cyan-500",   glow: "shadow-cyan-500/60",   ring: "ring-cyan-400" },
  { id: 1, label: "Ring",  short: "R", color: "bg-pink-500",   glow: "shadow-pink-500/60",   ring: "ring-pink-400" },
  { id: 0, label: "Pinky", short: "P", color: "bg-rose-600",   glow: "shadow-rose-600/60",   ring: "ring-rose-500" },
];

function FingerGuide({ activeKey }: { activeKey?: string }) {
  const [blink, setBlink] = useState(true);
  const fingerInfo = activeKey ? KEY_FINGER[activeKey] : null;

  useEffect(() => {
    if (!fingerInfo) return;
    const t = setInterval(() => setBlink(b => !b), 400);
    return () => clearInterval(t);
  }, [fingerInfo, activeKey]);

  return (
    <div className="flex items-end justify-between px-2 mb-2">
      {/* Left hand */}
      <div className="flex flex-col items-start gap-1">
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-0.5 pl-1">Left Hand</span>
        <div className="flex gap-1.5 items-end">
          {LEFT_FINGERS.map((f, idx) => {
            const isActive = fingerInfo?.hand === "L" && fingerInfo.finger === f.id;
            const isHome = f.id <= 1 ? false : false; // not used yet
            return (
              <div key={f.id} className="flex flex-col items-center gap-0.5">
                {/* Finger tip */}
                <div className={`
                  relative w-7 rounded-t-full transition-all duration-200
                  ${isActive && blink
                    ? `${f.color} shadow-lg ${f.glow} scale-110 ring-2 ${f.ring} ring-offset-1 ring-offset-background`
                    : isActive
                    ? `${f.color} opacity-60`
                    : "bg-white/10 border border-white/10"
                  }
                `} style={{ height: idx === 1 ? 28 : idx === 2 ? 32 : idx === 3 ? 30 : 24 }}>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </div>
                {/* Finger palm base */}
                <div className={`w-7 h-3 rounded-b-sm ${isActive ? f.color.replace("bg-", "bg-") + " opacity-70" : "bg-white/8"}`} />
                <span className={`text-[9px] font-bold mt-0.5 ${isActive ? "text-white" : "text-muted-foreground/40"}`}>{f.short}</span>
              </div>
            );
          })}
          {/* Thumb */}
          <div className="flex flex-col items-center gap-0.5 ml-1 rotate-12 origin-bottom">
            <div className={`w-5 h-5 rounded-full ${fingerInfo?.hand === "L" ? "bg-white/10" : "bg-white/5"} border border-white/10`} />
            <span className="text-[8px] text-muted-foreground/30">T</span>
          </div>
        </div>
        {/* Hand palm */}
        <div className="w-36 h-5 rounded-b-xl bg-white/5 border border-white/8 mt-0.5" />
      </div>

      {/* Center instruction */}
      {fingerInfo ? (
        <div className="flex flex-col items-center gap-1 px-4">
          <div className={`text-2xl font-black px-3 py-1 rounded-xl transition-all duration-200 ${blink ? "bg-primary text-white shadow-lg shadow-primary/40 scale-110" : "bg-primary/30 text-primary"}`}>
            {activeKey?.toUpperCase()}
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {fingerInfo.hand === "L" ? "Left" : "Right"} {LEFT_FINGERS.find(f => f.id === fingerInfo.finger)?.label || RIGHT_FINGERS.find(f => f.id === fingerInfo.finger)?.label}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 px-4">
          <div className="text-3xl">⌨️</div>
          <div className="text-xs text-muted-foreground">Type the highlighted key</div>
        </div>
      )}

      {/* Right hand */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-0.5 pr-1">Right Hand</span>
        <div className="flex gap-1.5 items-end">
          {/* Thumb */}
          <div className="flex flex-col items-center gap-0.5 mr-1 -rotate-12 origin-bottom">
            <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10" />
            <span className="text-[8px] text-muted-foreground/30">T</span>
          </div>
          {RIGHT_FINGERS.map((f, idx) => {
            const isActive = fingerInfo?.hand === "R" && fingerInfo.finger === f.id;
            return (
              <div key={f.id} className="flex flex-col items-center gap-0.5">
                <div className={`
                  relative w-7 rounded-t-full transition-all duration-200
                  ${isActive && blink
                    ? `${f.color} shadow-lg ${f.glow} scale-110 ring-2 ${f.ring} ring-offset-1 ring-offset-background`
                    : isActive
                    ? `${f.color} opacity-60`
                    : "bg-white/10 border border-white/10"
                  }
                `} style={{ height: idx === 0 ? 30 : idx === 1 ? 32 : idx === 2 ? 28 : 24 }}>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </div>
                <div className={`w-7 h-3 rounded-b-sm ${isActive ? f.color + " opacity-70" : "bg-white/8"}`} />
                <span className={`text-[9px] font-bold mt-0.5 ${isActive ? "text-white" : "text-muted-foreground/40"}`}>{f.short}</span>
              </div>
            );
          })}
        </div>
        <div className="w-36 h-5 rounded-b-xl bg-white/5 border border-white/8 mt-0.5 self-end" />
      </div>
    </div>
  );
}

export default function KeyboardVisualizer({ highlightKey, showFingerGuide = true }: KeyboardVisualizerProps) {
  const activeKey = highlightKey?.toLowerCase();

  return (
    <div className="rounded-2xl bg-card/60 border border-border/40 p-4 backdrop-blur-sm">
      {/* Finger guide */}
      {showFingerGuide && <FingerGuide activeKey={activeKey} />}

      {/* Legend */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Keyboard Guide</span>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500/70 inline-block" />Index</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500/70 inline-block" />Middle</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500/70 inline-block" />Ring</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500/70 inline-block" />Pinky</span>
        </div>
      </div>

      {/* Keys */}
      <div className="space-y-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1" style={{ marginLeft: ri === 1 ? "12px" : ri === 2 ? "24px" : "0" }}>
            {row.map(key => {
              const isActive = activeKey === key;
              const fingerColor = FINGER_COLORS[key] || "text-muted-foreground border-border/40 bg-card/40";
              return (
                <div key={key}
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-black uppercase transition-all duration-150 font-mono
                    ${isActive
                      ? "bg-primary text-white border-primary scale-115 shadow-xl shadow-primary/50 ring-2 ring-primary/30"
                      : fingerColor
                    }
                  `}
                >{key}</div>
              );
            })}
          </div>
        ))}
        <div className="flex gap-1" style={{ marginLeft: "36px" }}>
          <div className={`h-8 flex items-center justify-center rounded-lg border px-8 text-xs font-medium transition-all ${
            activeKey === " " ? "bg-primary text-white border-primary shadow-lg shadow-primary/40" : "border-border/40 bg-card/40 text-muted-foreground"
          }`}>
            space
          </div>
        </div>
      </div>

      {/* Home row indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex gap-1">
          {["f","j"].map(k => (
            <div key={k} className="w-5 h-1 rounded-full bg-primary/40 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground/60">F and J have bumps — home row anchor keys</span>
      </div>
    </div>
  );
}
