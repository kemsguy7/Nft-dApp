import React, { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import WalletModal from './WalletModal';
import { shortenAddress } from '../../utils';
import { Flex, Popover } from '@radix-ui/themes';
import { Icon } from '@iconify/react/dist/iconify.js';
import { supportedNetworks } from '../../config/wallet-connection/wagmi';

const WalletConnection = () => {
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  // Function to copy address to clipboard
  const copyAddress = () => {
    if (account.address) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!account.address) {
    return <WalletModal />;
  }

  return (
    <Popover.Root>
      <Popover.Trigger>
        <button
          className='
                    flex items-center gap-2 
                    px-3 py-2 
                    bg-secondary/10 hover:bg-secondary/15
                    border border-secondary/30
                    rounded-lg
                    transition-all duration-200
                    shadow-sm hover:shadow-md
                '
        >
          <div
            className='
                        w-2 h-2 
                        rounded-full 
                        bg-green-500 
                        shadow-sm shadow-green-300 
                        animate-pulse
                    '
          ></div>
          <Flex align='center' gap='2'>
            <span className='text-secondary font-medium'>{shortenAddress(account.address)}</span>
            <Icon icon='radix-icons:caret-down' className='w-4 h-4 text-secondary' />
          </Flex>
        </button>
      </Popover.Trigger>
      <Popover.Content
        width='280px'
        className='!p-0 shadow-lg rounded-lg border border-gray-200 overflow-hidden'
      >
        <div className='py-3 px-4 bg-secondary/5 border-b border-gray-200'>
          <p className='text-xs text-gray-500 m-0'>Connected Wallet</p>
          <p className='font-medium truncate text-sm m-0'>{account.address}</p>
        </div>

        <a
          className='flex items-center gap-4 w-full px-4 py-3 hover:bg-gray-50 transition-colors'
          href={`${supportedNetworks[0].blockExplorers.default.url}/address/${account.address}`}
          target='_blank'
          rel='noreferrer'
        >
          <Icon icon='gridicons:external' className='w-5 h-5 text-gray-600' />
          <span>View on Explorer</span>
        </a>

        <button
          onClick={copyAddress}
          className='w-full flex gap-4 items-center px-4 py-3 hover:bg-gray-50 transition-colors text-left'
        >
          <Icon
            icon={copied ? 'mdi:check' : 'solar:copy-line-duotone'}
            className={`w-5 h-5 ${copied ? 'text-green-500' : 'text-gray-600'}`}
          />
          <span>{copied ? 'Address Copied!' : 'Copy Address'}</span>
        </button>

        <button
          onClick={disconnect}
          className='w-full flex gap-4 items-center px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-gray-200'
        >
          <Icon icon='grommet-icons:power-shutdown' className='w-5 h-5 text-red-500' />
          <span className='text-red-500'>Disconnect</span>
        </button>
      </Popover.Content>
    </Popover.Root>
  );
};

export default WalletConnection;
