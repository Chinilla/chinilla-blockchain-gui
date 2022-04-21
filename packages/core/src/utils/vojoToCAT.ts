import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function vojoToCAT(vojo: string | number | BigNumber): BigNumber {
  return chinillaFormatter(vojo, Unit.VOJO)
    .to(Unit.CAT)
    .toBigNumber();
}