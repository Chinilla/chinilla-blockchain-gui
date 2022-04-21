import React from 'react';
import styled from 'styled-components';
import { Box, BoxProps } from '@mui/material';
import { Chinilla } from '@chinilla/icons';

const StyledChinilla = styled(Chinilla)`
  max-width: 100%;
  width: auto;
  height: auto;
`;

export default function Logo(props: BoxProps) {
  return (
    <Box {...props}>
      <StyledChinilla />
    </Box>
  );
}
