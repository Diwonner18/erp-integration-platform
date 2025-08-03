
import { useEffect } from 'react';

type ShortcutConfig = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description?: string;
};

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrl, shift, alt, callback }) => {
        const isCtrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const isShiftMatch = shift ? event.shiftKey : !event.shiftKey;
        const isAltMatch = alt ? event.altKey : !event.altKey;
        const isKeyMatch = event.key.toLowerCase() === key.toLowerCase();

        if (isCtrlMatch && isShiftMatch && isAltMatch && isKeyMatch) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
