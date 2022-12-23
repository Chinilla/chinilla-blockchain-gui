import type WalletConnectMetadata from './WalletConnectMetadata';
import type WalletConnectNamespaces from './WalletConnectNamespaces';

type Pair = {
  topic: string;
  vanillanet: boolean;
  fingerprints: number[];
  sessions: {
    topic: string;
    metadata?: WalletConnectMetadata;
    namespaces: WalletConnectNamespaces;
  }[];
  metadata?: WalletConnectMetadata;
};

export default Pair;
