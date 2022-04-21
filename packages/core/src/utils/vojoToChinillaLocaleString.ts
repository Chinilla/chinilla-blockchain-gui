import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function vojoToChinillaLocaleString(vojo: string | number | BigNumber, locale?: string) {
  return chinillaFormatter(vojo, Unit.VOJO)
    .to(Unit.CHINILLA)
    .toLocaleString(locale);
}
