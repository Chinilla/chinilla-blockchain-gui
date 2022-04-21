import { createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import theme from './default';

export default createTheme(deepmerge(theme, {
  palette: {
    background: {
      default: '#F3E5AB',
      paper: '#FCF6E0',
    },
    secondary: {
      main: '#000000',
      contrastText: '#000000',
    },
    mode: 'light',
  },
}));
