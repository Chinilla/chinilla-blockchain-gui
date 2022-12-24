import { useGetNetworkInfoQuery } from '@chinilla/api-react';

export default function useIVanillanet(): boolean | undefined {
  const { data: networkInfo } = useGetNetworkInfoQuery();
  const networkPrefix = networkInfo?.networkPrefix;

  if (!networkPrefix) {
    return undefined;
  }

  return networkPrefix.toLowerCase() === 'hcx';
}
