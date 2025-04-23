
import { useState, useCallback } from 'react';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    // Try to copy to clipboard
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return true;
    } catch (error) {
      console.warn('Copy failed', error);
      setCopied(false);
      return false;
    }
  }, []);

  return { copied, copy };
}
