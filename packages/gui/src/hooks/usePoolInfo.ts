import { useAsync } from 'react-use';
import isURL from 'validator/es/lib/isURL';
import { t } from '@lingui/macro';
import normalizeUrl from '../util/normalizeUrl';
import type PoolInfo from '../types/PoolInfo';
import useIsVanillanet from './useIsVanillanet';
import getPoolInfo from '../util/getPoolInfo';

export default function usePoolInfo(poolUrl?: string): {
  error?: Error;
  loading: boolean;
  poolInfo?: PoolInfo;
} {
  const isVanillanet = useIsVanillanet();

  const poolInfo = useAsync(async () => {
    if (isVanillanet === undefined) {
      return undefined;
    }

    if (!poolUrl) {
      return undefined;
    }

    const isUrlOptions = {
      allow_underscores: true,
      require_valid_protocol: true,
    };

    if (isVanillanet) {
      isUrlOptions.protocols = ['https'];
    }

    const normalizedUrl = normalizeUrl(poolUrl);
    const isValidUrl = isURL(normalizedUrl, isUrlOptions);

    if (!isValidUrl) {
      if (isVanillanet && !normalizedUrl.startsWith('https:')) {
        throw new Error(
          t`The pool URL needs to use protocol https. ${normalizedUrl}`,
        );
      }

      throw new Error(t`The pool URL is not valid. ${normalizedUrl}`);
    }

    try {
      const data = await getPoolInfo(normalizedUrl);

      console.log('data', data);

      return {
        poolUrl: normalizedUrl,
        ...data,
      };
    } catch (e) {
      console.log(e);
      throw new Error(
        t`The pool URL "${normalizedUrl}" is not working. Is it pool? Error: ${e.message}`,
      );
    }
  }, [poolUrl, isVanillanet]);

  return {
    error: poolInfo.error,
    loading: poolInfo.loading,
    poolInfo: poolInfo.value,
  };
}
