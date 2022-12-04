import { useLocalStorage } from '@chinilla/api-react';

export default function useEnableDataLayerService() {
  return useLocalStorage<boolean>('enableDataLayerService', false);
}
