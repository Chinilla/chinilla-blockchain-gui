import defaultsForPlotter from '../utils/defaultsForPlotter';
import optionsForPlotter from '../utils/optionsForPlotter';
import PlotterName from './PlotterName';

export default {
  displayName: 'Chinilla Proof of Space',
  options: optionsForPlotter(PlotterName.CHINILLAPOS),
  defaults: defaultsForPlotter(PlotterName.CHINILLAPOS),
  installInfo: { installed: true },
};
