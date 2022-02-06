const Big = require('big.js');
const units = require('./units');

// TODO: use bigint instead of float
const convert = (amount, from, to) => {
  if (Number.isNaN(Number.parseFloat(amount)) || !Number.isFinite(amount)) {
    return 0;
  }

  const amountInFromUnit = Big(amount).times(units.getUnit(from));

  return Number.parseFloat(amountInFromUnit.div(units.getUnit(to)));
};

class Chinilla {
  constructor(value, unit) {
    this._value = value;
    this._unit = unit;
  }

  to(newUnit) {
    this._value = convert(this._value, this._unit, newUnit);
    this._unit = newUnit;

    return this;
  }

  value() {
    return this._value;
  }

  format() {
    const displayUnit = units.getDisplay(this._unit);

    const { format, fractionDigits, trailing } = displayUnit;

    let options = { maximumFractionDigits: fractionDigits };

    if (trailing) {
      options = { minimumFractionDigits: fractionDigits };
    }

    let value;

    if (fractionDigits !== undefined) {
      const fractionPower = Big(10).pow(fractionDigits);
      value = Number.parseFloat(
        Big(Math.floor(Big(this._value).times(fractionPower))).div(
          fractionPower,
        ),
      );
    } else {
      value = this._value;
    }

    let formatted = format.replace(
      '{amount}',
      Number.parseFloat(value).toLocaleString(undefined, options),
    );

    if (displayUnit.pluralize && this._value !== 1) {
      formatted += 's';
    }

    return formatted;
  }

  toString() {
    const displayUnit = units.getDisplay(this._unit);
    const { fractionDigits } = displayUnit;
    const options = { maximumFractionDigits: fractionDigits };
    return Number.parseFloat(this._value).toLocaleString(undefined, options);
  }
}

export const chinilla_formatter = (value, unit) => new Chinilla(value, unit);

chinilla_formatter.convert = convert;
chinilla_formatter.setDisplay = units.setDisplay;
chinilla_formatter.setUnit = units.setUnit;
chinilla_formatter.getUnit = units.getUnit;
chinilla_formatter.setFiat = (currency, rate, display = null) => {
  units.setUnit(currency, 1 / rate, display);
};

export const vojo_to_chinilla = (vojo) => {
  return chinilla_formatter(Number.parseInt(vojo), 'vojo').to('chinilla').value();
};

export const chinilla_to_vojo= (chinilla) => {
  return chinilla_formatter(Number.parseFloat(Number(chinilla)), 'chinilla')
    .to('vojo')
    .value();
};

export const vojo_to_chinilla_string = (vojo) => {
  return chinilla_formatter(Number(vojo), 'vojo').to('chinilla').toString();
};

export const vojo_to_colouredcoin = (vojo) => {
  return chinilla_formatter(Number.parseInt(vojo), 'vojo')
    .to('colouredcoin')
    .value();
};

export const colouredcoin_to_vojo= (colouredcoin) => {
  return chinilla_formatter(Number.parseFloat(Number(colouredcoin)), 'colouredcoin')
    .to('vojo')
    .value();
};

export const vojo_to_colouredcoin_string = (vojo) => {
  return chinilla_formatter(Number(vojo), 'vojo').to('colouredcoin').toString();
};
