import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function catToVojo(cat: string | number | BigNumber): BigNumber {
  return chinillaFormatter(cat, Unit.CAT)
    .to(Unit.VOJO)
    .toBigNumber();
}