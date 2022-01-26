import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function chinillaToChin(chinilla: string | number | Big): number {
  return chinillaFormatter(chinilla, Unit.CHINILLA)
    .to(Unit.CHIN)
    .toNumber();
}