import Big from 'big.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function vojoToCATLocaleString(vojo: string | number | Big) {
  return chinillaFormatter(Number(vojo), Unit.VOJO)
    .to(Unit.CAT)
    .toLocaleString();
}