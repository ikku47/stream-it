'use client';
import { useRouter } from "next/navigation";
import LivePlayer from "@/components/live-tv/LivePlayer";
import useStore from "@/store/useStore";

export default function WatchLivePage() {
  const { activeLiveChannel, setActiveLiveChannel } = useStore();
  const router = useRouter();

  if (!activeLiveChannel) {
    if (typeof window !== "undefined") router.replace("/live-tv");
    return null;
  }

  return (
    <div className="bg-black w-screen h-screen overflow-hidden">
      <LivePlayer 
        channel={activeLiveChannel} 
        onClose={() => {
          setActiveLiveChannel(null);
          router.push("/live-tv");
        }} 
      />
    </div>
  );
}
