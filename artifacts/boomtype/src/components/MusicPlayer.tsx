import { useState, useEffect, useRef, useCallback } from "react";
import { Music, Volume2, VolumeX, Play, Pause } from "lucide-react";

const MUSIC_PREF_KEY = "boomtype_music_enabled";
const VOLUME_PREF_KEY = "boomtype_music_volume";

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem(VOLUME_PREF_KEY) || "0.3"));
  const [isMuted, setIsMuted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const oscRefs = useRef<OscillatorNode[]>([]);
  const noiseRef = useRef<AudioBufferSourceNode | null>(null);

  const createNoise = useCallback((ctx: AudioContext, gain: GainNode) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.015;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    source.connect(filter);
    filter.connect(gain);
    source.start();
    return source;
  }, []);

  const startMusic = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    const masterGain = ctx.createGain();
    masterGain.gain.value = isMuted ? 0 : volume;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    const notes = [130.81, 164.81, 196.00, 220.00, 261.63];
    const newOscs: OscillatorNode[] = [];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      oscGain.gain.value = 0.06 / (i + 1);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      newOscs.push(osc);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.1 + i * 0.05;
      lfoGain.gain.value = freq * 0.003;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      newOscs.push(lfo);
    });

    oscRefs.current = newOscs;
    noiseRef.current = createNoise(ctx, masterGain);
  }, [volume, isMuted, createNoise]);

  const stopMusic = useCallback(() => {
    oscRefs.current.forEach(o => { try { o.stop(); } catch {} });
    oscRefs.current = [];
    if (noiseRef.current) { try { noiseRef.current.stop(); } catch {} noiseRef.current = null; }
    if (gainRef.current) { gainRef.current.disconnect(); gainRef.current = null; }
  }, []);

  useEffect(() => {
    const savedPref = localStorage.getItem(MUSIC_PREF_KEY);
    if (savedPref === "true") {
      setIsPlaying(true);
    }
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
    if (gainRef.current) {
      gainRef.current.gain.value = isMuted ? 0 : volume;
    }
    localStorage.setItem(VOLUME_PREF_KEY, volume.toString());
  }, [volume, isMuted]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className="relative rounded-2xl bg-card/90 border border-border/60 backdrop-blur-xl shadow-xl overflow-hidden"
        style={{ minWidth: expanded ? "200px" : "auto" }}
      >
        {expanded && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Ambient Music</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setIsMuted(m => !m)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1 accent-primary cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground">Lo-fi ambient tones</p>
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
            className={`p-2 rounded-xl transition-colors font-medium ${
              isPlaying
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
            title={isPlaying ? "Pause music" : "Play ambient music"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20">
            <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
          </div>
        )}
      </div>
    </div>
  );
}
