// hooks/useTTS.ts
import { useConversationStore } from "@/stores/conversationStore";
import { useUserStore } from "@/stores/userStore";
import { useRef, useState } from "react";

export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading]  = useState(false);
  const audioCtxRef  = useRef<AudioContext | null>(null);
  const sourceRef    = useRef<AudioBufferSourceNode | null>(null);
  const jwtToken = useUserStore((state) => state.jwtToken);
  const thread_id = useConversationStore((state) => state.currentThreadId);

  const stop = () => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setIsPlaying(false);
  };

  const speak = async (text: string) => {
    // Stop any current playback
    stop();
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tts/${thread_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!res.ok) throw new Error(`TTS failed: ${res.status}`);

      // Read the full audio blob from the stream
      const arrayBuffer = await res.arrayBuffer();

      // Decode and play via Web Audio API
      const audioCtx = new AudioContext();
      console.log("AudioContext created:", audioCtx);
      audioCtxRef.current = audioCtx;

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      console.log("AudioBuffer decoded:", audioBuffer);
      const source = audioCtx.createBufferSource();
      console.log("AudioBufferSource created:", source);
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      console.log("AudioBufferSource connected to destination:", source);

      source.onended = () => {
        setIsPlaying(false);
        setIsLoading(false);
      };

      sourceRef.current = source;
      setIsLoading(false);
      setIsPlaying(true);
      source.start(0);

    } catch (err) {
      console.error("TTS error:", err);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  return { speak, stop, isPlaying, isLoading };
}