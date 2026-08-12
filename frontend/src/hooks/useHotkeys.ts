"use client"

import { useEffect } from 'react';

export function useHotkeys(key: string, callback: () => void, ctrlKey: boolean = false) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const matchCtrl = ctrlKey ? event.ctrlKey || event.metaKey : true;
      const matchKey = event.key.toLowerCase() === key.toLowerCase();

      if (matchKey && matchCtrl) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrlKey]);
}
