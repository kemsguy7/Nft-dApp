import { Icon } from '@iconify/react/dist/iconify.js';
import { Dialog, Flex } from '@radix-ui/themes';
import React, { useState } from 'react';
import { useConnectors } from 'wagmi';

const WalletModal = () => {
  const connectors = useConnectors();
  const [pendingConnectorUID, setPendingConnectorUID] = useState(null);

  const walletConnectConnector = connectors.find((connector) => connector.id === 'walletConnect');

  const otherConnectors = connectors.filter((connector) => connector.id !== 'walletConnect');

  const connectWallet = async (connector) => {
    try {
      setPendingConnectorUID(connector.id);
      await connector.connect();
    } catch (error) {
      console.error(error);
    } finally {
      setPendingConnectorUID(null);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button
          className='
                    bg-secondary text-primary 
                    px-4 py-2 rounded-lg 
                    font-medium shadow-md hover:shadow-lg
                    transition-all duration-200 transform hover:scale-105
                    flex items-center gap-2
                '
        >
          <Icon icon='heroicons:wallet-20-solid' className='w-5 h-5' />
          <span className='hidden sm:inline'>Connect Wallet</span>
          <span className='sm:hidden'>Connect</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Content
        maxWidth='450px'
        className='!p-0 overflow-hidden rounded-lg border border-gray-200 shadow-xl'
      >
        <div className='bg-secondary/10 p-6 border-b border-gray-200'>
          <Dialog.Title className='text-primary text-xl font-semibold m-0'>
            Connect Your Wallet
          </Dialog.Title>
          <p className='text-gray-600 text-sm mt-2 mb-0'>
            Connect with one of our available wallet providers
          </p>
        </div>

        <div className='p-6'>
          <Flex direction='column' gap='3'>
            {walletConnectConnector && (
              <button
                onClick={() => connectWallet(walletConnectConnector)}
                disabled={pendingConnectorUID === walletConnectConnector.uid}
                className='
                                    w-full flex items-center justify-between
                                    p-4 bg-white border border-gray-200
                                    text-primary rounded-lg
                                    hover:bg-gray-50 transition-colors
                                    shadow-sm hover:shadow-md
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                '
              >
                <Flex align='center' gap='2'>
                  <img
                    src='https://logosarchive.com/wp-content/uploads/2022/02/WalletConnect-icon.svg'
                    className='w-6 h-6'
                    alt='WalletConnect'
                  />
                  <span className='font-medium'>WalletConnect</span>
                </Flex>

                {pendingConnectorUID === walletConnectConnector.uid ? (
                  <Icon
                    icon='svg-spinners:270-ring'
                    className='w-5 h-5 text-blue-500 animate-spin'
                  />
                ) : (
                  <Icon icon='heroicons:arrow-right-20-solid' className='w-5 h-5 text-gray-400' />
                )}
              </button>
            )}

            <div className='flex flex-col gap-3'>
              {otherConnectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connectWallet(connector)}
                  disabled={pendingConnectorUID === connector.uid}
                  className='
                                        w-full flex items-center justify-between
                                        p-4 bg-white border border-gray-200
                                        text-primary rounded-lg
                                        hover:bg-gray-50 transition-colors
                                        shadow-sm hover:shadow-md
                                        disabled:opacity-70 disabled:cursor-not-allowed
                                    '
                >
                  <Flex align='center' gap='2'>
                    <img src={connector.icon} className='w-6 h-6' alt={connector.name} />
                    <span className='font-medium'>{connector.name}</span>
                  </Flex>

                  {pendingConnectorUID === connector.uid ? (
                    <Icon
                      icon='svg-spinners:270-ring'
                      className='w-5 h-5 text-blue-500 animate-spin'
                    />
                  ) : (
                    <Icon icon='heroicons:arrow-right-20-solid' className='w-5 h-5 text-gray-400' />
                  )}
                </button>
              ))}
            </div>
          </Flex>
        </div>

        <div className='p-4 border-t bg-gray-50 text-center'>
          <p className='text-xs text-gray-500 m-0'>
            By connecting a wallet, you agree to our Terms of Service
          </p>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default WalletModal;
