import { PlotterDefaults } from '../@types/Plotter';
import PlotterName from '../constants/PlotterName';
import { bladebitRamDefaults, bladebitDiskDefaults, madmaxDefaults, chinillaposDefaults } from '../constants/Plotters';

export default function defaultsForPlotter(plotterName: PlotterName): PlotterDefaults {
  switch (plotterName) {
    case PlotterName.BLADEBIT_RAM:
      return bladebitRamDefaults;
    case PlotterName.BLADEBIT_DISK:
      return bladebitDiskDefaults;
    case PlotterName.MADMAX:
      return madmaxDefaults;
    case PlotterName.CHINILLAPOS: // fallthrough
    default:
      return chinillaposDefaults;
  }
}
