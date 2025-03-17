import { Contract } from 'ethers';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast'; // Assuming you're using react-hot-toast for notifications
import { getSigner } from '../utils';
import NFT_ABI from '../ABI/nft.json';
import { useAppContext } from '../contexts/appContext';

const useMintToken = () => {
  const { mintPrice, refreshData } = useAppContext();
  const [isMinting, setIsMinting] = useState(false);

  const mintToken = useCallback(async () => {
    try {
      setIsMinting(true);
      const signer = await getSigner();
      if (!signer) {
        toast.error('Please connect your wallet');
        setIsMinting(false);
        return;
      }

      const contract = new Contract(import.meta.env.VITE_NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

      toast.loading('Minting NFT...', { id: 'mint' });

      // Call the mint function with the correct value
      const tx = await contract.mint({
        value: mintPrice,
      });

      toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'mint' });

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Instead of trying to parse events which might be inconsistent,
      // simply refresh the data after a successful transaction

      console.log('Mint transaction successful:', receipt);

      // Add a slight delay before refreshing to give the blockchain time to update
      setTimeout(() => {
        refreshData();
      }, 2000);

      // Refresh data after minting
      refreshData();

      toast.success('NFT minted successfully!', { id: 'mint' });
      return true;
    } catch (error) {
      console.error('Mint error:', error);
      const errorMessage = error.reason || error.message || 'Failed to mint NFT. Please try again.';

      toast.error(errorMessage, { id: 'mint' });
      return false;
    } finally {
      setIsMinting(false);
    }
  }, [mintPrice, refreshData]);

  return { mintToken, isMinting };
};

export default useMintToken;
