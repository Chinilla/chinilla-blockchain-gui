import { SvgIcon, SvgIconProps } from '@mui/material';
import React from 'react';

import ChinillaIcon from './images/chinilla.svg';

export default function Keys(props: SvgIconProps) {
  return <SvgIcon component={ChinillaIcon} viewBox="0 0 150 58" {...props} />;
}
