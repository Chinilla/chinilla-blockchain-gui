import { useGetNetworkInfoQuery } from '@chinilla/api-react';

export default function useIsVanillanet(): boolean | undefined {
  const { data: networkInfo } = useGetNetworkInfoQuery();
  const networkPrefix = networkInfo?.networkPrefix;

  if (!networkPrefix) {
    return undefined;
  }

  return networkPrefix.toLowerCase() === 'hcx';
}
