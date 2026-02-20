"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Augment Window for the Web Speech API (not in all TS lib versions)
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

type STTState = "idle" | "listening" | "processing" | "unsupported";

interface SpeechToTextButtonProps {
  /** Called with the accumulated transcript text */
  onTranscript: (text: string) => void;
  /** Optional className for the button */
  className?: string;
  /** aria-label / title */
  label?: string;
}

export function SpeechToTextButton({
  onTranscript,
  className,
  label = "Speak to fill description",
}: SpeechToTextButtonProps) {
  const [state, setState] = useState<STTState>("idle");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ReturnType<typeof window.SpeechRecognition> | null>(null);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;
    if (!SpeechRecognitionAPI) {
      setState("unsupported");
    }
  }, []);

  function startListening() {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-IN"; // can be changed by user locale
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setState("listening");
      setError(null);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      setState("processing");
      const transcript = Array.from(event.results as ArrayLike<SpeechRecognitionResult>)
        .map((r) => (r as SpeechRecognitionResult)[0].transcript)
        .join(" ");
      onTranscript(transcript.trim());
      setState("idle");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow mic permission.");
      } else if (event.error === "no-speech") {
        setError("No speech detected. Try again.");
      } else if (event.error === "network") {
        setError("Network error. Check your connection.");
      } else {
        setError(`Speech error: ${event.error}`);
      }
      setState("idle");
    };

    recognition.onend = () => {
      if (state === "listening") setState("idle");
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setState("idle");
  }

  function handleClick() {
    if (state === "idle") startListening();
    else if (state === "listening") stopListening();
  }

  if (state === "unsupported") {
    return (
      <button
        type="button"
        disabled
        title="Speech-to-text is not supported in this browser"
        className={cn(
          "flex items-center justify-center rounded-lg p-1.5 text-muted-foreground/40 cursor-not-allowed",
          className
        )}
      >
        <MicOff className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        title={state === "listening" ? "Stop recording" : label}
        className={cn(
          "flex items-center justify-center rounded-lg p-1.5 transition-all",
          state === "listening"
            ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-300 dark:shadow-red-900"
            : state === "processing"
            ? "bg-muted text-muted-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
          className
        )}
      >
        {state === "processing" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : state === "listening" ? (
          <Mic className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>

      {/* Listening indicator */}
      {state === "listening" && (
        <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-medium text-white shadow">
          Listening…
        </span>
      )}

      {/* Error tooltip */}
      {error && (
        <span className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-48 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 px-2 py-1.5 text-[10px] text-orange-700 dark:text-orange-300 shadow-md text-center">
          {error}
        </span>
      )}
    </div>
  );
}
