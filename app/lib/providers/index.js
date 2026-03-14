import { nunesProvider } from "./nunes";
import { vidSrcProvider } from "./vidsrc";
import { vidLinkProvider } from "./vidlink";
import { vidsrcAltProviders } from "./vidsrc-alt";
import { moflixProvider } from "./moflix";

export const PROVIDERS = [
  nunesProvider,
  vidSrcProvider,
  vidLinkProvider,
  moflixProvider,
  ...vidsrcAltProviders,
];

export const getProvider = (id) => PROVIDERS.find(p => p.id === id) || nunesProvider;

export const getProviderUrl = (providerId, item, season = 1, episode = 1) => {
  const provider = getProvider(providerId);
  return provider.getUrl(item, season, episode);
};
