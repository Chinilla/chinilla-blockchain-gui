import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function chinillaToVojo(chinilla: string | number | Big): number {
  return chinillaFormatter(chinilla, Unit.CHINILLA)
    .to(Unit.VOJO)
    .toNumber();
}