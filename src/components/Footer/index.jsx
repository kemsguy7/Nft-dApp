import { Box, Flex, Text } from '@radix-ui/themes';
import React from 'react';

const Footer = () => {
  return (
    <Flex
      as='footer'
      width='100%'
      align='center'
      justify='center'
      className='border-t border-primary p-4 items-center h-18'
    >
      <Box>
        <Text className='text-primary text-xl' as='span' role='img' aria-label='logo'>
          &copy; 2025 cohort XII
        </Text>
      </Box>
    </Flex>
  );
};

export default Footer;
