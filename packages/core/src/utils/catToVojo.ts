import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function catToVojo(cat: string | number | Big): number {
  return chinillaFormatter(cat, Unit.CAT)
    .to(Unit.VOJO)
    .toNumber();
}