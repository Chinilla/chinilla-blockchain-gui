import BigNumber from 'bignumber.js';
import Unit from '../constants/Unit';
import chinillaFormatter from './chinillaFormatter';

export default function chinillaToVojo(chinilla: string | number | BigNumber): BigNumber {
  return chinillaFormatter(chinilla, Unit.CHINILLA)
    .to(Unit.VOJO)
    .toBigNumber();
}