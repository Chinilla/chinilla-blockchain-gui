import React, { ReactNode } from 'react';
import { Trans, Plural } from '@lingui/macro';
import NumberFormat from 'react-number-format';
import {
  Box,
  InputAdornment,
  FormControl,
  FormHelperText,
} from '@material-ui/core';
import { useWatch, useFormContext } from 'react-hook-form';
import TextField, { TextFieldProps } from '../TextField';
import chinillaToVojo from '../../utils/chinillaToVojo';
import catToVojo from '../../utils/catToVojo';
import useCurrencyCode from '../../hooks/useCurrencyCode';
import FormatLargeNumber from '../FormatLargeNumber';
import Flex from '../Flex';

interface NumberFormatCustomProps {
  inputRef: (instance: NumberFormat | null) => void;
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

function NumberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props;

  function handleChange(values: Object) {
    onChange(values.value);
  }

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={handleChange}
      thousandSeparator
      allowNegative={false}
      isNumericString
    />
  );
}

export type AmountProps = TextFieldProps & {
  children?: (props: { vojo: number; value: string | undefined }) => ReactNode;
  name?: string;
  symbol?: string; // if set, overrides the currencyCode. empty string is allowed
  showAmountInVojos?: boolean; // if true, shows the vojoamount below the input field
  feeMode?: boolean // if true, amounts are expressed in vojos used to set a transaction fee
};

export default function Amount(props: AmountProps) {
  const { children, name, symbol, showAmountInVojos, variant, fullWidth, ...rest } = props;
  const { control } = useFormContext();
  const defaultCurrencyCode = useCurrencyCode();

  const value = useWatch<string>({
    control,
    name,
  });

  const correctedValue = value[0] === '.' ? `0${value}` : value;

  const currencyCode = symbol === undefined ? defaultCurrencyCode : symbol;
  const isChinillaCurrency = ['HCX', 'THCX'].includes(currencyCode);
  const vojo= isChinillaCurrency 
    ? chinillaToVojo(correctedValue) 
    : catToVojo(correctedValue);

  return (
    <FormControl variant={variant} fullWidth={fullWidth}>
      <TextField
        name={name}
        variant={variant}
        autoComplete="off"
        InputProps={{
          spellCheck: false,
          inputComponent: NumberFormatCustom as any,
          inputProps: {
            decimalScale: isChinillaCurrency ? 12 : 3,
          },
          endAdornment: (
            <InputAdornment position="end">{currencyCode}</InputAdornment>
          ),
        }}
        {...rest}
      />
        <FormHelperText component='div' >
          <Flex alignItems="center" gap={2}>
            {showAmountInVojos && (
              <Flex flexGrow={1} gap={1}>
                {!!vojo&& (
                  <>
                    <FormatLargeNumber value={vojo} />
                    <Box>
                      <Plural value={vojo} one="vojo" other="vojos" />
                    </Box>
                  </>
                )}
              </Flex>
            )}
            {children &&
              children({
                vojo,
                value,
              })}
          </Flex>
        </FormHelperText>
    </FormControl>
  );
}

Amount.defaultProps = {
  label: <Trans>Amount</Trans>,
  name: 'amount',
  children: undefined,
  showAmountInVojos: true,
  feeMode: false,
};
