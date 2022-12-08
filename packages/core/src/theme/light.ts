import { createTheme } from '@mui/material/styles';
import theme from './default';

export default createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    background: {
      ...theme.palette.background,
      card: '#f2ecd5',
      paper: '#f2ecd5',
    },
  },
});
