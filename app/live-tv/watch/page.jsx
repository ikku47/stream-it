'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useStore from "@/store/useStore";
import { encodeChannelRouteKey } from "@/lib/iptv";

export default function WatchLivePage() {
  const { activeLiveChannel } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (activeLiveChannel) {
      router.replace(`/live-tv/${encodeChannelRouteKey(activeLiveChannel)}`);
      return;
    }
    router.replace("/live-tv");
  }, [activeLiveChannel, router]);

  return null;
}
