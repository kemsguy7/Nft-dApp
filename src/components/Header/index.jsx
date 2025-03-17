import { Box, Flex, Text } from '@radix-ui/themes';
import React, { useState, useEffect } from 'react';
import WalletConnection from './WalletConnection';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position to add shadow when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Flex
      gap='3'
      as='header'
      width='100%'
      align='center'
      justify='between'
      className={`
        bg-primary p-4 items-center transition-all duration-300
        ${scrolled ? 'shadow-lg' : ''}
        sticky top-0 z-10
        sm:px-6 md:px-8 lg:px-12
      `}
    >
      <Box className='flex items-center'>
        <Text
          className='text-secondary font-bold text-xl sm:text-2xl md:text-3xl flex items-center'
          as='span'
          role='img'
          aria-label='logo'
        >
          <span className='mr-2'>NFT dApp</span>
          <span className='animate-pulse'>🚀</span>
        </Text>
      </Box>

      <WalletConnection />
    </Flex>
  );
};

export default Header;
