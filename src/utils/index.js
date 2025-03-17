import { JsonRpcProvider, BrowserProvider } from 'ethers';
import { supportedNetworks } from '../config/wallet-connection/wagmi';

export const shortenAddress = (address, length = 4) => {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

export const truncateString = (str, num) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
};

let readonlyProvider = null;

export const getReadOnlyProvider = () => {
  if (readonlyProvider) return readonlyProvider;
  readonlyProvider = new JsonRpcProvider(supportedNetworks[0].rpcUrls.default.http[0]);

  return readonlyProvider;
};

export const isSupportedNetwork = (chainId) => {
  return supportedNetworks.some((network) => network.id === chainId);
};

// Add the getSigner function
export const getSigner = async () => {
  // Check if window.ethereum is available (MetaMask or other wallet)
  if (!window.ethereum) {
    console.error('No wallet provider found');
    return null;
  }

  try {
    // Create a browser provider from window.ethereum
    const provider = new BrowserProvider(window.ethereum);

    // Request user's accounts
    await provider.send('eth_requestAccounts', []);

    // Get signer
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    console.error('Error getting signer:', error);
    return null;
  }
};
