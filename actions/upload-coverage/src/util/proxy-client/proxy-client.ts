import createHttpsProxyAgent, { HttpsProxyAgent } from 'https-proxy-agent';

export const createProxyAgent = (): HttpsProxyAgent => {
  const { https_proxy, HTTPS_PROXY } = process.env;

  const proxy = https_proxy || HTTPS_PROXY;

  if (!proxy) {
    throw new Error(`Couldn't create proxy agent: No proxy configuration found`);
  }

  return createHttpsProxyAgent(proxy);
};
