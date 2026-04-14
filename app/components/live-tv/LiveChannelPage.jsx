'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LivePlayer from "./LivePlayer";
import useStore from "@/store/useStore";

export default function LiveChannelPage({ channel }) {
  const router = useRouter();
  const { activeLiveChannel, setActiveLiveChannel } = useStore();
  const currentChannel = channel || activeLiveChannel;

  useEffect(() => {
    if (channel) {
      setActiveLiveChannel(channel);
    }
  }, [channel, setActiveLiveChannel]);

  useEffect(() => {
    if (!currentChannel) {
      router.replace("/live-tv");
    }
  }, [currentChannel, router]);

  if (!currentChannel) {
    return null;
  }

  return (
    <div className="bg-black w-screen h-screen overflow-hidden">
      <LivePlayer
        channel={currentChannel}
        onClose={() => {
          setActiveLiveChannel(null);
          router.push("/live-tv");
        }}
      />
    </div>
  );
}
