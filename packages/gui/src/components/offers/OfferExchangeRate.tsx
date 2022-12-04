import React, { useMemo, useState } from "react";
import NumberFormat from 'react-number-format';
import {
  Flex,
} from '@chinilla/core';
import {
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { ImportExport } from '@mui/icons-material';
import { AssetIdMapEntry } from '../../hooks/useAssetIdName';
import { WalletType } from '@chinilla/api';

interface OfferEhcxangeRateNumberFormatProps {
  inputRef: (instance: NumberFormat | null) => void;
  name: string;
};

function OfferEhcxangeRateNumberFormat(props: OfferEhcxangeRateNumberFormatProps) {
  const { inputRef, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      allowNegative={false}
      isNumericString
    />
  );
}

type Props = {
  readOnly: boolean;
  makerAssetInfo: AssetIdMapEntry;
  takerAssetInfo: AssetIdMapEntry;
  makerEhcxangeRate?: number;
  takerEhcxangeRate?: number;
  takerEhcxangeRateChanged: (newRate: number) => void;
  makerEhcxangeRateChanged: (newRate: number) => void;
};
export default function OfferEhcxangeRate(props: Props) {
  const {
    readOnly,
    makerAssetInfo,
    takerAssetInfo,
    makerEhcxangeRate,
    takerEhcxangeRate,
    takerEhcxangeRateChanged,
    makerEhcxangeRateChanged,
  } = props;

  const [editingMakerEhcxangeRate, setEditingMakerEhcxangeRate] = useState(false);
  const [editingTakerEhcxangeRate, setEditingTakerEhcxangeRate] = useState(false);
  const [makerDisplayRate, takerDisplayRate] = useMemo(() => {
    return [
      {rate: makerEhcxangeRate, walletType: makerAssetInfo.walletType, counterCurrencyName: takerAssetInfo.displayName},
      {rate: takerEhcxangeRate, walletType: takerAssetInfo.walletType, counterCurrencyName: makerAssetInfo.displayName}
    ].map(({rate, walletType}) => {
      let displayRate = '';

      if (Number.isInteger(rate)) {
        displayRate = `${rate}`;
      }
      else if (rate && Number.isFinite(rate)) {  // !(NaN or Infinity)
        const fixed = rate.toFixed(walletType === WalletType.STANDARD_WALLET ? 9 : 12);

        // remove trailing zeros
        displayRate = fixed.replace(/\.0+$/, '');
      }
      return `${displayRate}`;
    });
  }, [makerAssetInfo, takerAssetInfo, makerEhcxangeRate, takerEhcxangeRate]);

  const makerValueProps = editingMakerEhcxangeRate === false ? { value: makerDisplayRate } : {};
  const takerValueProps = editingTakerEhcxangeRate === false ? { value: takerDisplayRate } : {};

  return (
    <Flex flexDirection="row">
      <Flex flexDirection="row" flexGrow={1} justifyContent="flex-end" gap={3} style={{width: '45%'}}>
        <Flex alignItems="baseline" gap={1}>
          <Typography variant="subtitle1" noWrap>1 {makerAssetInfo.displayName} =</Typography>
          <TextField
            {...makerValueProps}
            key={`makerEhcxangeRate-${takerAssetInfo.displayName}`}
            id={`makerEhcxangeRate-${takerAssetInfo.displayName}`}
            variant="outlined"
            size="small"
            onFocus={() => setEditingMakerEhcxangeRate(true)}
            onBlur={() => setEditingMakerEhcxangeRate(false)}
            onChange={(event) => takerEhcxangeRateChanged(Number(event.target.value))}
            InputProps={{
              inputComponent: OfferEhcxangeRateNumberFormat as any,
              inputProps: {
                decimalScale: takerAssetInfo.walletType === WalletType.STANDARD_WALLET ? 12 : 9,
              },
              endAdornment: <InputAdornment position="end">{takerAssetInfo.displayName}</InputAdornment>,
              readOnly: readOnly,
            }}
            fullWidth={false}
          />
        </Flex>
      </Flex>
      <Flex flexDirection="column" alignItems="center" justifyContent="center" style={{width: '2em'}}>
        <ImportExport style={{transform: 'rotate(90deg)'}} />
      </Flex>
      <Flex flexDirection="row" gap={3} flexGrow={1} style={{width: '45%'}}>
        <Flex alignItems="baseline" gap={1}>
          <TextField
            {...takerValueProps}
            key={`takerEhcxangeRate-${makerAssetInfo.displayName}`}
            id={`takerEhcxangeRate-${makerAssetInfo.displayName}`}
            variant="outlined"
            size="small"
            onFocus={() => setEditingTakerEhcxangeRate(true)}
            onBlur={() => setEditingTakerEhcxangeRate(false)}
            onChange={(event) => makerEhcxangeRateChanged(Number(event.target.value))}
            InputProps={{
              inputComponent: OfferEhcxangeRateNumberFormat as any,
              inputProps: {
                decimalScale: makerAssetInfo.walletType === WalletType.STANDARD_WALLET ? 12 : 9,
              },
              endAdornment: <InputAdornment position="end">{makerAssetInfo.displayName}</InputAdornment>,
              readOnly: readOnly,
            }}
            fullWidth={false}
          />
          <Typography variant="subtitle1" noWrap>= 1 {takerAssetInfo.displayName}</Typography>
        </Flex>
      </Flex>
    </Flex>
  );
}

OfferEhcxangeRate.defaultProps = {
  readOnly: true,
};
