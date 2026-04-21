import LiveChannelPage from "@/components/live-tv/LiveChannelPage";
import { getChannelByRouteKey } from "@/lib/iptv";
import {
  generateLiveChannelMetadata,
  getBreadcrumbJsonLd,
  getWebPageJsonLd,
} from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { channelId } = await params;
  const channel = await getChannelByRouteKey(channelId);
  return generateLiveChannelMetadata(channel, `/live-tv/${channelId}`);
}

export default async function LiveChannelRoutePage({ params }) {
  const { channelId } = await params;
  const channel = await getChannelByRouteKey(channelId);
  const schema = [
    getBreadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Live TV", url: "/live-tv" },
      { name: channel?.name || "Channel", url: `/live-tv/${channelId}` },
    ]),
    getWebPageJsonLd(
      channel?.name ? `${channel.name} Live` : "Live TV",
      channel?.group
        ? `Watch ${channel.name || "this channel"} live on Stream It.`
        : "Watch live TV channels on Stream It with fast discovery and direct playback.",
      `/live-tv/${channelId}`
    ),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <LiveChannelPage channel={channel} />
    </>
  );
}
