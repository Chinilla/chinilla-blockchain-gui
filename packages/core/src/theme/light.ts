import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import theme from './default';

export default createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    background: {
      ...theme.palette.background,
      card: '#fff',
    },
  },
});
