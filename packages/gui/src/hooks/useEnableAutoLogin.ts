import { useLocalStorage } from '@chinilla/api-react';

export default function useEnableAutoLogin() {
  return useLocalStorage<boolean>('enableAutoLogin', true);
}
