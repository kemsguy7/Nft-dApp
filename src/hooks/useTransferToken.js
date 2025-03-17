import { Contract } from 'ethers';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast'; // Assuming you're using react-hot-toast for notifications
import { getSigner } from '../utils';
import NFT_ABI from '../ABI/nft.json';
import { useAppContext } from '../contexts/appContext';

const useTransferToken = () => {
  const { refreshData } = useAppContext();
  const [isTransferring, setIsTransferring] = useState(false);

  const transferToken = useCallback(
    async (tokenId, toAddress) => {
      try {
        setIsTransferring(true);
        const signer = await getSigner();
        if (!signer) {
          toast.error('Please connect your wallet');
          setIsTransferring(false);
          return;
        }

        const address = await signer.getAddress();
        const contract = new Contract(import.meta.env.VITE_NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

        toast.loading('Preparing transfer...', { id: 'transfer' });

        // Call the transferFrom function
        const tx = await contract.transferFrom(address, toAddress, tokenId);

        toast.loading('Transaction submitted. Waiting for confirmation...', { id: 'transfer' });

        // Wait for transaction to be mined
        const receipt = await tx.wait();

        console.log('Transfer transaction successful:', receipt);

        // Add a slight delay before refreshing to give the blockchain time to update
        setTimeout(() => {
          refreshData();
        }, 2000);

        // Refresh data after transfer

        toast.success('NFT transferred successfully!', { id: 'transfer' });
        return true;
      } catch (error) {
        console.error('Transfer error:', error);
        const errorMessage =
          error.reason || error.message || 'Failed to transfer NFT. Please try again.';

        toast.error(errorMessage, { id: 'transfer' });
        return false;
      } finally {
        setIsTransferring(false);
      }
    },
    [refreshData],
  );

  return { transferToken, isTransferring };
};

export default useTransferToken;
