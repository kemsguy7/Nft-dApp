import { Contract } from 'ethers';
import { createContext, useContext, useEffect, useState } from 'react';
import { getReadOnlyProvider, getSigner } from '../utils';
import NFT_ABI from '../ABI/nft.json';
import { useAccount } from 'wagmi'; // Assuming you're using wagmi for wallet connection

const appContext = createContext();

export const useAppContext = () => {
  const context = useContext(appContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
};

export const AppProvider = ({ children }) => {
  const { address, isConnected } = useAccount();
  const [nextTokenId, setNextTokenId] = useState(null);
  const [maxSupply, setMaxSupply] = useState(null);
  const [baseTokenURI, setBaseTokenURI] = useState('');
  const [tokenMetaData, setTokenMetaData] = useState(new Map());
  const [mintPrice, setMintPrice] = useState(null);
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(true);

  // Function to force a refresh of contract data
  const refreshData = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Initialize contract data
  useEffect(() => {
    setLoading(true);
    const provider = getReadOnlyProvider();
    const contract = new Contract(import.meta.env.VITE_NFT_CONTRACT_ADDRESS, NFT_ABI, provider);

    // Instead of using event listeners which might cause issues,
    // we'll just poll for contract data periodically

    // Fetch contract data
    const fetchData = async () => {
      try {
        const [nextId, uri, supply, price] = await Promise.all([
          contract.nextTokenId(),
          contract.baseTokenURI(),
          contract.maxSupply(),
          contract.mintPrice(),
        ]);

        setNextTokenId(nextId);
        setBaseTokenURI(uri);
        setMaxSupply(supply);
        setMintPrice(price);
      } catch (error) {
        console.error('Error fetching contract data:', error);
      } finally {
        // Don't set loading to false here - wait for metadata
      }
    };

    fetchData();

    // No need for cleanup since we're not setting up event listeners
  }, [refreshTrigger]);

  // Fetch metadata for all tokens
  useEffect(() => {
    if (!maxSupply || !baseTokenURI) return;

    const tokenIds = Array.from({ length: Number(maxSupply) }, (_, i) => i);

    const promises = tokenIds.map((id) => {
      return fetch(`${baseTokenURI}${id}.json`)
        .then((response) => response.json())
        .catch((error) => {
          console.error(`Error fetching metadata for token ${id}:`, error);
          return null;
        });
    });

    Promise.all(promises)
      .then((responses) => {
        const tokenMetaData = new Map();
        responses.forEach((response, index) => {
          if (response) {
            tokenMetaData.set(index, response);
          }
        });
        setTokenMetaData(tokenMetaData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching metadata:', error);
        setLoading(false);
      });
  }, [baseTokenURI, maxSupply, refreshTrigger]);

  // Fetch owned tokens when address changes
  useEffect(() => {
    const fetchOwnedTokens = async () => {
      if (!address || !isConnected || !maxSupply) {
        setOwnedTokens([]);
        return;
      }

      setLoading(true);
      try {
        const contract = new Contract(
          import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
          NFT_ABI,
          getReadOnlyProvider(),
        );

        // Since the contract doesn't implement ERC721Enumerable, we need to check ownership
        // for each token individually (up to maxSupply)
        const checkOwnership = [];
        const maxTokensToCheck = Number(maxSupply);

        // Only check tokens that might exist (up to nextTokenId if available, otherwise maxSupply)
        const tokensToCheck = nextTokenId
          ? Math.min(Number(nextTokenId), maxTokensToCheck)
          : maxTokensToCheck;

        for (let i = 0; i < tokensToCheck; i++) {
          checkOwnership.push(
            contract
              .ownerOf(i)
              .then((owner) => ({ tokenId: i, owner }))
              .catch(() => null), // Token might not exist or be burned
          );
        }

        const results = await Promise.all(checkOwnership);
        const ownedTokenIds = results
          .filter((result) => result && result.owner.toLowerCase() === address.toLowerCase())
          .map((result) => result.tokenId);

        setOwnedTokens(ownedTokenIds);
      } catch (error) {
        console.error('Error fetching owned tokens:', error);
        setOwnedTokens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnedTokens();
  }, [address, isConnected, maxSupply, nextTokenId, refreshTrigger]);

  return (
    <appContext.Provider
      value={{
        nextTokenId,
        maxSupply,
        baseTokenURI,
        tokenMetaData,
        mintPrice,
        ownedTokens,
        refreshData,
        loading,
      }}
    >
      {children}
    </appContext.Provider>
  );
};
