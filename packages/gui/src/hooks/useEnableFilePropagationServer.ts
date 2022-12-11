import { usePrefs } from '@chinilla/api-react';

export default function useEnableFilePropagationServer() {
  return usePrefs<boolean>('enableFilePropagationServer', false);
}
