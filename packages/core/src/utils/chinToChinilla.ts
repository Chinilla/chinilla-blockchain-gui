import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function chinToChinilla(chin: string | number | Big): number {
  return chinillaFormatter(chin, Unit.CHIN)
    .to(Unit.CHINILLA)
    .toNumber();
}