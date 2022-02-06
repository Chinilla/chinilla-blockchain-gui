import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function vojoToCAT(vojo: string | number | Big): number {
  return chinillaFormatter(vojo, Unit.VOJO)
    .to(Unit.CAT)
    .toNumber();
}