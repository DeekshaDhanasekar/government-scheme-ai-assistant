
import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Mic, MicOff } from "lucide-react";

export default function ChatInput({ onSend, disabled, language = "English" }) {
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [value]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setValue("");
    setSpeechError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const startVoiceInput = () => {
    setSpeechError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        "Voice input is not supported in this browser. Try Google Chrome."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const languageCodes = {
      English: "en-IN",
      Tamil: "ta-IN",
      Hindi: "hi-IN",
    };

    const recognition = new SpeechRecognition();
    recognition.lang = languageCodes[language] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setValue(transcript);
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setSpeechError("Microphone permission denied. Allow microphone access.");
      } else if (event.error === "no-speech") {
        setSpeechError("No speech detected. Please try again.");
      } else {
        setSpeechError("Voice input failed. Please try again.");
      }

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError("Could not start the microphone. Please try again.");
    }
  };

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm transition focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Your question"
          placeholder="Ask about a scheme, eligibility or how to apply"
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[0.9375rem] text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        <button
          type="button"
          onClick={startVoiceInput}
          disabled={disabled}
          aria-label={isListening ? "Stop voice input" : "Start voice input"}
          title={isListening ? "Stop listening" : `Speak in ${language}`}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            isListening
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {isListening ? <MicOff size={17} /> : <Mic size={17} />}
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-800 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <SendHorizontal size={16} />
        </button>
      </div>

      {isListening && (
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-red-600">
          Listening… Speak your question.
        </p>
      )}

      {speechError && (
        <p role="status" className="mx-auto mt-2 max-w-3xl text-center text-xs text-red-600">
          {speechError}
        </p>
      )}

      <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-slate-500">
        Answers can contain errors. Confirm important details on the official scheme portal.
      </p>
    </div>
  );
}
