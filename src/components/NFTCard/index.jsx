import { Icon } from '@iconify/react/dist/iconify.js';
import { formatEther } from 'ethers';
import React from 'react';
import { truncateString } from '../../utils';

const NFTCard = ({ metadata, mintPrice, tokenId, nextTokenId, mintNFT, owned = false }) => {
  const handleMint = () => {
    if (mintNFT && typeof mintNFT.mintToken === 'function') {
      mintNFT.mintToken();
    }
  };

  return (
    <div className='w-full h-full flex flex-col rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden'>
      <div className='relative'>
        <img
          src={metadata.image}
          alt={`${metadata.name} image`}
          className='w-full h-64 object-cover'
        />
        {owned && (
          <div className='absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold'>
            Owned
          </div>
        )}
      </div>

      <div className='p-4 flex flex-col flex-grow'>
        <h2 className='font-bold text-lg text-gray-800'>{metadata.name}</h2>
        <p className='text-sm text-gray-600 mb-3'>{truncateString(metadata.description, 100)}</p>

        <div className='flex flex-wrap gap-2 mb-3'>
          {metadata.attributes &&
            metadata.attributes.slice(0, 3).map((attr, index) => (
              <span
                key={index}
                className='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full'
              >
                {attr.trait_type}: {attr.value}
              </span>
            ))}
          {metadata.attributes && metadata.attributes.length > 3 && (
            <span className='text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full'>
              +{metadata.attributes.length - 3} more
            </span>
          )}
        </div>

        <div className='mt-auto'>
          <div className='py-3 border-t border-gray-100 flex justify-between items-center'>
            <div className='flex items-center gap-1 text-gray-700'>
              <Icon icon='ri:eth-line' className='w-5 h-5' />
              <span className='font-medium'>{formatEther(mintPrice)} ETH</span>
            </div>

            <div className='flex items-center gap-1 text-gray-700'>
              <Icon icon='ri:file-list-3-line' className='w-5 h-5' />
              <span>ID: {tokenId}</span>
            </div>
          </div>

          {!owned && (
            <button
              disabled={Number(nextTokenId) !== tokenId || (mintNFT && mintNFT.isMinting)}
              onClick={handleMint}
              className='w-full mt-3 p-3 bg-primary rounded-md text-white font-bold hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:text-gray-500 flex justify-center items-center'
            >
              {mintNFT && mintNFT.isMinting ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Minting...
                </>
              ) : Number(nextTokenId) <= tokenId ? (
                'Mint NFT'
              ) : (
                'Already Minted'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTCard;
