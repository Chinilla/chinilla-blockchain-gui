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
import chinillaToChin from '../../utils/chinillaToChin';
import catToChin from '../../utils/catToChin';
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
  children?: (props: { chin: number; value: string | undefined }) => ReactNode;
  name?: string;
  symbol?: string; // if set, overrides the currencyCode. empty string is allowed
  showAmountInChins?: boolean; // if true, shows the chin amount below the input field
  feeMode?: boolean // if true, amounts are expressed in chins used to set a transaction fee
};

export default function Amount(props: AmountProps) {
  const { children, name, symbol, showAmountInChins, variant, fullWidth, ...rest } = props;
  const { control } = useFormContext();
  const defaultCurrencyCode = useCurrencyCode();

  const value = useWatch<string>({
    control,
    name,
  });

  const currencyCode = symbol === undefined ? defaultCurrencyCode : symbol;
  const isChinillaCurrency = ['XCHI', 'TXCHI'].includes(currencyCode);
  const chin = isChinillaCurrency ? chinillaToChin(value) : catToChin(value);

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
            {showAmountInChins && (
              <Flex flexGrow={1} gap={1}>
                {!!chin && (
                  <>
                    <FormatLargeNumber value={chin} />
                    <Box>
                      <Plural value={chin} one="chin" other="chins" />
                    </Box>
                  </>
                )}
              </Flex>
            )}
            {children &&
              children({
                chin,
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
  showAmountInChins: true,
  feeMode: false,
};
