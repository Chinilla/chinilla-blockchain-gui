import { usePrefs } from '@chinilla/api-react';

export default function useEnableAutoLogin() {
  return usePrefs<boolean>('enableAutoLogin', true);
}
