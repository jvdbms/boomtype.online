import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

const VOICE_ENABLED_KEY = "boomtype_voice_enabled";
const VOICE_GENDER_KEY = "boomtype_voice_gender";

interface VoiceContextValue {
  enabled: boolean;
  gender: "male" | "female";
  speak: (text: string, priority?: boolean) => void;
  toggleEnabled: () => void;
  toggleGender: () => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(VOICE_ENABLED_KEY) === "true");
  const [gender, setGender] = useState<"male" | "female">(
    () => (localStorage.getItem(VOICE_GENDER_KEY) as "male" | "female") || "female"
  );
  const enabledRef = useRef(enabled);
  const genderRef = useRef(gender);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { genderRef.current = gender; }, [gender]);

  useEffect(() => {
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }, []);

  const speak = useCallback((text: string, priority = false) => {
    if (!enabledRef.current) return;
    if (!window.speechSynthesis) return;
    if (priority) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const g = genderRef.current;
    const preferred = voices.find(v =>
      g === "female"
        ? v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("victoria") || v.name.toLowerCase().includes("karen") || v.name.toLowerCase().includes("female")
        : v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("alex") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("male")
    );
    if (preferred) utterance.voice = preferred;
    utterance.pitch = g === "female" ? 1.2 : 0.8;
    utterance.rate = 0.95;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  }, []);

  const toggleEnabled = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      localStorage.setItem(VOICE_ENABLED_KEY, next.toString());
      if (!next) window.speechSynthesis?.cancel();
      enabledRef.current = next;
      return next;
    });
  }, []);

  const toggleGender = useCallback(() => {
    setGender(prev => {
      const next = prev === "female" ? "male" : "female";
      localStorage.setItem(VOICE_GENDER_KEY, next);
      genderRef.current = next;
      return next;
    });
  }, []);

  return (
    <VoiceContext.Provider value={{ enabled, gender, speak, toggleEnabled, toggleGender }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used inside VoiceProvider");
  return ctx;
}

export default function VoiceInstructor() {
  const { enabled, gender, toggleEnabled, toggleGender } = useVoice();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/60">
      <button
        onClick={toggleEnabled}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          enabled ? "text-primary" : "text-muted-foreground"
        }`}
        title={enabled ? "Disable voice instructor" : "Enable voice instructor"}
      >
        {enabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        Voice
      </button>
      {enabled && (
        <button
          onClick={toggleGender}
          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium hover:bg-primary/20 transition-colors"
        >
          {gender === "female" ? "♀ Female" : "♂ Male"}
        </button>
      )}
    </div>
  );
}
