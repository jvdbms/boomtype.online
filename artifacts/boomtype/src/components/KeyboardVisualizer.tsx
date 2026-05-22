interface KeyboardVisualizerProps {
  highlightKey?: string;
}

const ROWS = [
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l",";"],
  ["z","x","c","v","b","n","m",",",".","/"],
];

const FINGER_COLORS: Record<string, string> = {
  "a": "text-red-400 border-red-500/40 bg-red-500/10",
  "q": "text-red-400 border-red-500/40 bg-red-500/10",
  "z": "text-red-400 border-red-500/40 bg-red-500/10",
  "s": "text-orange-400 border-orange-500/40 bg-orange-500/10",
  "w": "text-orange-400 border-orange-500/40 bg-orange-500/10",
  "x": "text-orange-400 border-orange-500/40 bg-orange-500/10",
  "d": "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  "e": "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  "c": "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  "f": "text-green-400 border-green-500/40 bg-green-500/10",
  "r": "text-green-400 border-green-500/40 bg-green-500/10",
  "v": "text-green-400 border-green-500/40 bg-green-500/10",
  "g": "text-green-400 border-green-500/40 bg-green-500/10",
  "t": "text-green-400 border-green-500/40 bg-green-500/10",
  "b": "text-green-400 border-green-500/40 bg-green-500/10",
  "h": "text-blue-400 border-blue-500/40 bg-blue-500/10",
  "y": "text-blue-400 border-blue-500/40 bg-blue-500/10",
  "n": "text-blue-400 border-blue-500/40 bg-blue-500/10",
  "j": "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  "u": "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  "m": "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  "k": "text-purple-400 border-purple-500/40 bg-purple-500/10",
  "i": "text-purple-400 border-purple-500/40 bg-purple-500/10",
  ",": "text-purple-400 border-purple-500/40 bg-purple-500/10",
  "l": "text-pink-400 border-pink-500/40 bg-pink-500/10",
  "o": "text-pink-400 border-pink-500/40 bg-pink-500/10",
  ".": "text-pink-400 border-pink-500/40 bg-pink-500/10",
  ";": "text-rose-400 border-rose-500/40 bg-rose-500/10",
  "p": "text-rose-400 border-rose-500/40 bg-rose-500/10",
  "/": "text-rose-400 border-rose-500/40 bg-rose-500/10",
};

export default function KeyboardVisualizer({ highlightKey }: KeyboardVisualizerProps) {
  const activeKey = highlightKey?.toLowerCase();

  return (
    <div className="rounded-2xl bg-card/60 border border-border/40 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keyboard Guide</span>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500/60 inline-block" />Index</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/60 inline-block" />Middle</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500/60 inline-block" />Ring</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500/60 inline-block" />Pinky</span>
        </div>
      </div>
      <div className="space-y-1.5">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1" style={{ marginLeft: ri === 1 ? "12px" : ri === 2 ? "24px" : "0" }}>
            {row.map(key => {
              const isActive = activeKey === key;
              const fingerColor = FINGER_COLORS[key] || "text-muted-foreground border-border/40 bg-card/40";
              return (
                <div
                  key={key}
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-bold uppercase transition-all duration-150 font-mono
                    ${isActive
                      ? "bg-primary text-white border-primary scale-110 shadow-lg shadow-primary/40"
                      : fingerColor
                    }
                  `}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
        <div className="flex gap-1" style={{ marginLeft: "36px" }}>
          <div className="h-8 flex items-center justify-center rounded-lg border border-border/40 bg-card/40 text-xs text-muted-foreground font-medium px-8">
            space
          </div>
        </div>
      </div>
    </div>
  );
}
