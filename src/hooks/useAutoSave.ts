import { useCallback, useRef } from 'react';

export function useAutoSave(saveFn: () => void, delay = 500) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const trigger = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(saveFn, delay);
  }, [saveFn, delay]);

  return trigger;
}
