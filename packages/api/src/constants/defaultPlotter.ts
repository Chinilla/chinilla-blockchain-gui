import PlotterName from './PlotterName';
import optionsForPlotter from '../utils/optionsForPlotter';
import defaultsForPlotter from '../utils/defaultsForPlotter';

export default {
  displayName: 'Chinilla Proof of Space',
  options: optionsForPlotter(PlotterName.CHINILLAPOS),
  defaults: defaultsForPlotter(PlotterName.CHINILLAPOS),
  installInfo: { installed: true },
};
