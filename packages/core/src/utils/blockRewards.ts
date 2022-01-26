import Big from 'big.js';

const CHIN_PER_CHINILLA = Big('1000000000000');
const BLOCKS_PER_YEAR = 1681920;
const POOL_REWARD = '0.875'; // 7 / 8
const FARMER_REWARD = '0.125'; // 1 /8

export function calculatePoolReward(height: number): Big {
  if (height === 0) {
    return CHIN_PER_CHINILLA.times('21000000').times(POOL_REWARD);
  }
  if (height < 3 * BLOCKS_PER_YEAR) {
    return CHIN_PER_CHINILLA.times('2').times(POOL_REWARD);
  }
  if (height < 6 * BLOCKS_PER_YEAR) {
    return CHIN_PER_CHINILLA.times('1').times(POOL_REWARD);
  }
  if (height < 9 * BLOCKS_PER_YEAR) {
    return CHIN_PER_CHINILLA.times('0.5').times(POOL_REWARD);
  }
  if (height < 12 * BLOCKS_PER_YEAR) {
    return CHIN_PER_CHINILLA.times('0.25').times(POOL_REWARD);
  }

  return CHIN_PER_CHINILLA.times('0.125').times(POOL_REWARD);
}

export function calculateBaseFarmerReward(height: number): Big {
  if (height === 0) {
    return CHIN_PER_CHINILLA.times('21000000').times(FARMER_REWARD);
  }
  if (height < 3 * BLOCKS_PER_YEAR) {
    return CHIN_PER_CHINILLA.times('2').times(FARMER_REWARD);
  }
  if (height < 6 * BLOCKS_PER_YEAR) {
    return CHIN_PER_CHINILLA.times('1').times(FARMER_REWARD);
  }
  if (height < 9 * BLOCKS_PER_YEAR) {
    return CHIN_PER_CHINILLA.times('0.5').times(FARMER_REWARD);
  }
  if (height < 12 * BLOCKS_PER_YEAR) {
    return CHIN_PER_CHINILLA.times('0.25').times(FARMER_REWARD);
  }

  return CHIN_PER_CHINILLA.times('0.125').times(FARMER_REWARD);
}
