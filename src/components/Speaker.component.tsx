// components/SpeakerButton.tsx
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useTTS } from "@/hooks/useAudioStream";

export function SpeakerButton({ text }: { text: string }) {
  const { speak, stop, isPlaying, isLoading } = useTTS();

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 
                 hover:bg-gray-100 transition-colors disabled:opacity-50"
      title={isPlaying ? "Stop" : "Listen"}
    >
      {isLoading  ? <Loader2 className="size-4 animate-spin" /> :
       isPlaying  ? <VolumeX className="size-4 text-blue-500" /> :
                    <Volume2 className="size-4" />}
    </button>
  );
}