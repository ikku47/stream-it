import { nunesProvider } from "./nunes";
import { vidSrcProvider } from "./vidsrc";
import { vidLinkProvider } from "./vidlink";
import { vidsrcAltProviders } from "./vidsrc-alt";

export const PROVIDERS = [
  nunesProvider,
  vidSrcProvider,
  vidLinkProvider,
  ...vidsrcAltProviders,
];

export const getProviderUrl = (providerId, item, season = 1, episode = 1) => {
  const provider = PROVIDERS.find(p => p.id === providerId) || nunesProvider;
  return provider.getUrl(item, season, episode);
};
