
import ReactMarkdown from "react-markdown";
import {
  Landmark,
  FileText,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const TTS_URL = "http://127.0.0.1:8000/tts";

export default function MessageBubble({
  role,
  content = "",
  sources = [],
  language = "English",
}) {
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState("");
  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const requestRef = useRef(null);

  function stopSpeech() {
    if (requestRef.current) {
      requestRef.current.abort();
      requestRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setSpeaking(false);
  }

  useEffect(() => {
    return () => {
      if (requestRef.current) {
        requestRef.current.abort();
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  async function handleVoice() {
    if (speaking || requestRef.current) {
      stopSpeech();
      setAudioError("");
      return;
    }

    const cleanText = content
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/[#*_>`~]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      setAudioError("There is no answer text to read.");
      return;
    }

    setAudioError("");

    const controller = new AbortController();
    requestRef.current = controller;
    setSpeaking(true);

    try {
      const response = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: cleanText,
          language,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = "";

        try {
          const errorData = await response.json();
          detail =
            errorData.detail ||
            errorData.message ||
            JSON.stringify(errorData);
        } catch {
          detail = await response.text();
        }

        throw new Error(
          detail || `TTS request failed (${response.status}).`
        );
      }

      const audioBlob = await response.blob();

      if (!audioBlob.size) {
        throw new Error("The speech service returned empty audio.");
      }

      if (controller.signal.aborted) return;

      const objectUrl = URL.createObjectURL(audioBlob);
      objectUrlRef.current = objectUrl;

      const audio = new Audio(objectUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setSpeaking(false);
        audioRef.current = null;

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }

        if (requestRef.current === controller) {
          requestRef.current = null;
        }
      };

      audio.onerror = () => {
        setAudioError(
          "Unable to play the generated audio. Check the TTS response format."
        );
        setSpeaking(false);
        audioRef.current = null;

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }

        if (requestRef.current === controller) {
          requestRef.current = null;
        }
      };

      await audio.play();
    } catch (error) {
      if (error.name === "AbortError") return;

      setAudioError(
        error.message ||
          "Could not generate speech. Check that FastAPI and ElevenLabs are running."
      );
      setSpeaking(false);

      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }
  }

  if (role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand-800 px-4 py-2.5 text-[0.9375rem] leading-relaxed text-white sm:max-w-[75%]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-800 text-white">
        <Landmark size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="markdown">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        <button
          type="button"
          onClick={handleVoice}
          className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
          aria-label={speaking ? "Stop audio" : "Listen to answer"}
        >
          {speaking ? (
            <VolumeX size={14} />
          ) : (
            <Volume2 size={14} />
          )}

          {speaking ? "Stop" : "Listen"}
        </button>

        {audioError && (
          <p role="status" className="mt-2 text-xs text-red-600">
            {audioError}
          </p>
        )}

        {sources.length > 0 && (
          <div className="mt-4 border-t border-slate-200 pt-3">
            <p className="text-xs font-medium text-slate-500">
              Sources
            </p>

            <ul className="mt-2 flex flex-wrap gap-2">
              {sources.map((source, index) => (
                <li key={index}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    <FileText size={12} />
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
