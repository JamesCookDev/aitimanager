/**
 * useSpeech — Hook + Provider para síntese e reconhecimento de voz
 * 
 * Exposto via SpeechContext para que qualquer componente do totem
 * possa iniciar/parar TTS ou STT sem prop drilling.
 * 
 * Variáveis de ambiente opcionais:
 *   VITE_TTS_URL   — endpoint TTS externo (se omitido usa Web Speech API)
 *   VITE_STT_URL   — endpoint STT externo (se omitido usa SpeechRecognition nativo)
 */
import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────
const SpeechContext = createContext(null);

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────
export function SpeechProvider({ children }) {
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [transcript, setTranscript]     = useState("");
  const [lastUtterance, setLastUtterance] = useState("");

  const audioRef       = useRef(null);   // HTMLAudioElement para TTS externo
  const recognitionRef = useRef(null);   // SpeechRecognition
  const utteranceRef   = useRef(null);   // SpeechSynthesisUtterance

  const ttsUrl = import.meta.env.VITE_TTS_URL || "";
  const sttUrl = import.meta.env.VITE_STT_URL || "";

  // ── Registrar handler global para que o Avatar possa disparar TTS ──
  useEffect(() => {
    window.__totemSpeak = speak;
    window.__totemStopSpeech = stopSpeech;
    window.__totemStartListening = startListening;
    window.__totemStopListening = stopListening;

    return () => {
      delete window.__totemSpeak;
      delete window.__totemStopSpeech;
      delete window.__totemStartListening;
      delete window.__totemStopListening;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────
  // TTS — Text To Speech
  // ─────────────────────────────────────────────
  const speak = useCallback(async (text, options = {}) => {
    if (!text) return;
    stopSpeech();                 // cancela qualquer fala anterior
    setIsSpeaking(true);
    setLastUtterance(text);

    // 1️⃣ TTS externo (edge function ou endpoint local)
    if (ttsUrl) {
      try {
        const res = await fetch(ttsUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: options.voice || import.meta.env.VITE_TTS_VOICE || "alloy",
            model: options.model || import.meta.env.VITE_TTS_MODEL || "tts-1",
            speed: options.speed ?? Number(import.meta.env.VITE_TTS_SPEED ?? 1),
          }),
        });
        if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => setIsSpeaking(false);
        audio.play();
        return;
      } catch (err) {
        console.warn("[Speech] TTS externo falhou, usando Web Speech:", err.message);
      }
    }

    // 2️⃣ Fallback — Web Speech API nativa
    if (!window.speechSynthesis) {
      console.warn("[Speech] speechSynthesis não disponível.");
      setIsSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = options.lang || import.meta.env.VITE_TTS_LANG || "pt-BR";
    utter.rate  = options.rate ?? Number(import.meta.env.VITE_TTS_SPEED ?? 1);
    utter.pitch = options.pitch ?? 1;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [ttsUrl]);

  const stopSpeech = useCallback(() => {
    // Para áudio externo
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    // Para Web Speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // ─────────────────────────────────────────────
  // STT — Speech To Text
  // ─────────────────────────────────────────────
  const startListening = useCallback((onResult) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[Speech] SpeechRecognition não disponível.");
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const rec = new SpeechRecognition();
    rec.lang = import.meta.env.VITE_STT_LANG || "pt-BR";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => setIsListening(false);
    rec.onerror  = () => setIsListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      if (typeof onResult === "function") onResult(text);
      // Envia automaticamente para a IA
      if (typeof window.__totemSendMessage === "function") {
        window.__totemSendMessage(text);
      }
    };

    recognitionRef.current = rec;
    rec.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ─────────────────────────────────────────────
  // CONTEXT VALUE
  // ─────────────────────────────────────────────
  const value = {
    // Estado
    isSpeaking,
    isListening,
    transcript,
    lastUtterance,
    // Ações
    speak,
    stopSpeech,
    startListening,
    stopListening,
  };

  return (
    <SpeechContext.Provider value={value}>
      {children}
    </SpeechContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────
export function useSpeech() {
  const ctx = useContext(SpeechContext);
  if (!ctx) {
    throw new Error("useSpeech deve ser usado dentro de <SpeechProvider>");
  }
  return ctx;
}

export default useSpeech;
