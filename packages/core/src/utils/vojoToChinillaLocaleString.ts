import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function vojoToChinillaLocaleString(vojo: string | number | Big) {
  return chinillaFormatter(Number(vojo), Unit.VOJO)
    .to(Unit.CHINILLA)
    .toLocaleString();
}