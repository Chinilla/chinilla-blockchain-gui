import { useLocalStorage } from '@chinilla/api-react';

export default function useEnableFilePropagationServer() {
  return useLocalStorage<boolean>('enableFilePropagationServer', false);
}
