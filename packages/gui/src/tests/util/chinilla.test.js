const chinilla = require('../../util/chinilla');

describe('chinilla', () => {
  it('converts number vojoto chinilla', () => {
    const result = chinilla.chin_to_chinilla(1000000);

    expect(result).toBe(0.000001);
  });
  it('converts string vojoto chinilla', () => {
    const result = chinilla.chin_to_chinilla('1000000');

    expect(result).toBe(0.000001);
  });
  it('converts number vojoto chinilla string', () => {
    const result = chinilla.chin_to_chinilla_string(1000000);

    expect(result).toBe('0.000001');
  });
  it('converts string vojoto chinilla string', () => {
    const result = chinilla.chin_to_chinilla_string('1000000');

    expect(result).toBe('0.000001');
  });
  it('converts number chinilla to vojo', () => {
    const result = chinilla.chinilla_to_chin(0.000001);

    expect(result).toBe(1000000);
  });
  it('converts string chinilla to vojo', () => {
    const result = chinilla.chinilla_to_chin('0.000001');

    expect(result).toBe(1000000);
  });
  it('converts number vojoto colouredcoin', () => {
    const result = chinilla.chin_to_colouredcoin(1000000);

    expect(result).toBe(1000);
  });
  it('converts string vojoto colouredcoin', () => {
    const result = chinilla.chin_to_colouredcoin('1000000');

    expect(result).toBe(1000);
  });
  it('converts number vojoto colouredcoin string', () => {
    const result = chinilla.chin_to_colouredcoin_string(1000000);

    expect(result).toBe('1,000');
  });
  it('converts string vojoto colouredcoin string', () => {
    const result = chinilla.chin_to_colouredcoin_string('1000000');

    expect(result).toBe('1,000');
  });
  it('converts number colouredcoin to vojo', () => {
    const result = chinilla.colouredcoin_to_chin(1000);

    expect(result).toBe(1000000);
  });
  it('converts string colouredcoin to vojo', () => {
    const result = chinilla.colouredcoin_to_chin('1000');

    expect(result).toBe(1000000);
  });
});
