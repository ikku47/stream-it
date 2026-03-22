import {
  PROVIDERS,
  getProvider,
  afterDarkProvider
} from "./streamingProviders";

export { PROVIDERS, getProvider, afterDarkProvider };

export const getProviderUrl = (providerId, item, season = 1, episode = 1, opts) => {
  const provider = getProvider(providerId);
  return provider.getUrl(item, season, episode, opts);
};
