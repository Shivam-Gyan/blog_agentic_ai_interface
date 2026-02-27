import { useEffect, useRef, useState } from "react"

const useSpeechRecognition = (isActive: boolean) => {
  const recognitionRef = useRef<any>(null);

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = true; 
    recognition.lang = "en-US";
    recognition.continuous = true;

    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        setTranscript(lastResult[0].transcript);
      }
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);

      // 🔥 Restart if still active
      if (recognitionRef.current && isActive) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    };

    return () => {
      recognition.stop();
    };
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isActive) {
      try {
        recognitionRef.current.start();
      } catch {}
    } else {
      recognitionRef.current.stop();
    }
  }, [isActive]);

  return { transcript, isListening, error };
};

export default useSpeechRecognition;