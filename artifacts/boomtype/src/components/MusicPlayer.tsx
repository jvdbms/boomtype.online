import { useState, useEffect, useRef, useCallback } from "react";
import { Music, Volume2, VolumeX, Play, Pause, Zap } from "lucide-react";

const MUSIC_PREF_KEY = "boomtype_music_enabled";
const VOLUME_PREF_KEY = "boomtype_music_volume";
const BPM = 128;
const BEAT = 60 / BPM;

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem(VOLUME_PREF_KEY) || "0.25"));
  const [isMuted, setIsMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const scheduleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextBeatRef = useRef(0);
  const beatRef = useRef(0);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  // ── Drum voices ──────────────────────────────────────────────
  const kick = useCallback((t: number, gain: GainNode) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);
    env.gain.setValueAtTime(1.2, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(env); env.connect(gain);
    osc.start(t); osc.stop(t + 0.3);
  }, [getCtx]);

  const snare = useCallback((t: number, gain: GainNode) => {
    const ctx = getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 1800;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.45, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    src.connect(hp); hp.connect(env); env.connect(gain);
    src.start(t); src.stop(t + 0.15);
  }, [getCtx]);

  const hihat = useCallback((t: number, gain: GainNode, open = false) => {
    const ctx = getCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * (open ? 0.18 : 0.06), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 7000;
    const env = ctx.createGain();
    const dur = open ? 0.18 : 0.06;
    env.gain.setValueAtTime(0.18, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(hp); hp.connect(env); env.connect(gain);
    src.start(t); src.stop(t + dur);
  }, [getCtx]);

  // ── Bass synth ───────────────────────────────────────────────
  const BASS_PATTERN = [55, 55, 73.42, 55, 65.41, 55, 73.42, 65.41]; // A1, A1, D2, A1, C2, A1, D2, C2
  const bass = useCallback((t: number, gain: GainNode, beat: number) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const env = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 280; lp.Q.value = 3;
    const freq = BASS_PATTERN[beat % BASS_PATTERN.length];
    osc.type = "square"; osc.frequency.value = freq;
    sub.type = "sine"; sub.frequency.value = freq * 0.5;
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.55, t + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, t + BEAT * 0.85);
    osc.connect(lp); sub.connect(lp); lp.connect(env); env.connect(gain);
    osc.start(t); sub.start(t); osc.stop(t + BEAT); sub.stop(t + BEAT);
  }, [getCtx]);

  // ── Lead synth arpeggio ──────────────────────────────────────
  const LEAD = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 440]; // C5 arp
  const lead = useCallback((t: number, gain: GainNode, beat: number) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const hp = ctx.createBiquadFilter();
    hp.type = "bandpass"; hp.frequency.value = 900; hp.Q.value = 1;
    osc.type = "sawtooth";
    osc.frequency.value = LEAD[beat % LEAD.length];
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.09, t + 0.005);
    env.gain.exponentialRampToValueAtTime(0.001, t + BEAT * 0.5);
    osc.connect(hp); hp.connect(env); env.connect(gain);
    osc.start(t); osc.stop(t + BEAT);
  }, [getCtx]);

  // ── Pad chord ────────────────────────────────────────────────
  const PAD_FREQS = [220, 261.63, 329.63]; // A3, C4, E4
  const padRef = useRef<OscillatorNode[] | null>(null);
  const padEnvRef = useRef<GainNode | null>(null);
  const startPad = useCallback((gain: GainNode) => {
    const ctx = getCtx();
    if (padRef.current) return;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5);
    env.connect(gain);
    padEnvRef.current = env;
    padRef.current = PAD_FREQS.map(f => {
      const o = ctx.createOscillator();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 600;
      o.type = "sawtooth"; o.frequency.value = f;
      o.connect(lp); lp.connect(env);
      o.start(); return o;
    });
  }, [getCtx]);

  const stopPad = useCallback(() => {
    if (!padEnvRef.current || !ctxRef.current) return;
    const t = ctxRef.current.currentTime;
    padEnvRef.current.gain.setValueAtTime(padEnvRef.current.gain.value, t);
    padEnvRef.current.gain.linearRampToValueAtTime(0.0001, t + 0.4);
    setTimeout(() => {
      padRef.current?.forEach(o => { try { o.stop(); } catch {} });
      padRef.current = null; padEnvRef.current = null;
    }, 500);
  }, []);

  // ── Scheduler ────────────────────────────────────────────────
  const schedule = useCallback(() => {
    if (!ctxRef.current || !masterRef.current) return;
    const ctx = ctxRef.current;
    const gain = masterRef.current;
    const now = ctx.currentTime;
    const lookAhead = 0.1;

    while (nextBeatRef.current < now + lookAhead) {
      const t = nextBeatRef.current;
      const b = beatRef.current;
      const step = b % 8; // 8 eighth-note steps per bar (at 128 BPM half-beats)

      // Kick: steps 0 and 4 (beats 1 and 3)
      if (step === 0 || step === 4) kick(t, gain);
      // Snare: steps 2 and 6 (beats 2 and 4)
      if (step === 2 || step === 6) snare(t, gain);
      // Hi-hat every step; open on step 3 and 7
      hihat(t, gain, step === 3 || step === 7);
      // Bass every step
      bass(t, gain, b);
      // Lead every 2 steps
      if (b % 2 === 0) lead(t, gain, Math.floor(b / 2));

      nextBeatRef.current += BEAT * 0.5; // eighth note
      beatRef.current++;
    }
    scheduleRef.current = setTimeout(schedule, 40);
  }, [kick, snare, hihat, bass, lead]);

  const startMusic = useCallback(() => {
    const ctx = getCtx();
    const master = ctx.createGain();
    master.gain.value = isMuted ? 0 : volume;
    master.connect(ctx.destination);
    masterRef.current = master;
    beatRef.current = 0;
    nextBeatRef.current = ctx.currentTime + 0.05;
    startPad(master);
    schedule();
  }, [getCtx, volume, isMuted, schedule, startPad]);

  const stopMusic = useCallback(() => {
    if (scheduleRef.current) clearTimeout(scheduleRef.current);
    scheduleRef.current = null;
    stopPad();
    if (masterRef.current) {
      masterRef.current.gain.setValueAtTime(masterRef.current.gain.value, ctxRef.current?.currentTime || 0);
      masterRef.current.gain.linearRampToValueAtTime(0.0001, (ctxRef.current?.currentTime || 0) + 0.2);
      setTimeout(() => { masterRef.current?.disconnect(); masterRef.current = null; }, 300);
    }
  }, [stopPad]);

  useEffect(() => {
    const saved = localStorage.getItem(MUSIC_PREF_KEY);
    if (saved === "true") setIsPlaying(true);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startMusic();
      localStorage.setItem(MUSIC_PREF_KEY, "true");
    } else {
      stopMusic();
      localStorage.setItem(MUSIC_PREF_KEY, "false");
    }
    return stopMusic;
  }, [isPlaying]);

  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = isMuted ? 0 : volume;
    localStorage.setItem(VOLUME_PREF_KEY, volume.toString());
  }, [volume, isMuted]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="relative rounded-2xl bg-card/90 border border-border/60 backdrop-blur-xl shadow-2xl overflow-hidden"
        style={{ minWidth: expanded ? "210px" : "auto" }}
      >
        {expanded && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-bold text-foreground">Energy Music</span>
              <span className="text-xs text-muted-foreground ml-auto">{BPM} BPM</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setIsMuted(m => !m)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05" value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 accent-primary cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground">Fast-paced typing beats</p>
          </div>
        )}
        <div className="flex items-center gap-1 p-2">
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            title="Music settings"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPlaying(p => !p)}
            className={`p-2 rounded-xl transition-all font-medium ${
              isPlaying
                ? "bg-primary/20 text-primary hover:bg-primary/30 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
            title={isPlaying ? "Pause music" : "Play energetic music"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{
                width: "40%",
                animation: "slide-beat 0.469s steps(1) infinite",
              }}
            />
          </div>
        )}
      </div>
      <style>{`
        @keyframes slide-beat {
          0%   { transform: translateX(0); }
          25%  { transform: translateX(62px); }
          50%  { transform: translateX(124px); }
          75%  { transform: translateX(186px); }
          100% { transform: translateX(248px); }
        }
      `}</style>
    </div>
  );
}
