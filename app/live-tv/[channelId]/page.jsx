import LiveChannelPage from "@/components/live-tv/LiveChannelPage";
import { getChannelByRouteKey } from "@/lib/iptv";
import { generateLiveChannelMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { channelId } = await params;
  const channel = await getChannelByRouteKey(channelId);
  return generateLiveChannelMetadata(channel, `/live-tv/${channelId}`);
}

export default async function LiveChannelRoutePage({ params }) {
  const { channelId } = await params;
  const channel = await getChannelByRouteKey(channelId);

  return <LiveChannelPage channel={channel} />;
}
