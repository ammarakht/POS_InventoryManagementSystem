import { useEffect, useRef } from 'react';

/**
 * Robust Hardware & Virtual Barcode Scanner Hook
 * 
 * Solves the core issues in POS systems:
 * 1. Prevents premature form submission / accidental bill generation on Enter key.
 * 2. Accurately distinguishes rapid hardware scanner keystrokes (< 50ms interval) from human typing.
 * 3. Captures global scans even when focus is not explicitly inside the search input.
 * 4. Dispatches clean barcode string to onScan callback.
 */
export function useBarcodeScanner({ onScan, enabled = true, maxInterval = 50, minLength = 3 }) {
  const bufferRef = useRef('');
  const lastTimeRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // If user is typing in a modal input, text area, or non-POS input, handle carefully
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';
      const isBarcodeSpecificInput = document.activeElement?.getAttribute('data-barcode-input') === 'true';

      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Handle Enter key (Hardware scanners emit Enter after barcode string)
      if (e.key === 'Enter') {
        const buffer = bufferRef.current.trim();
        bufferRef.current = '';

        if (buffer.length >= minLength) {
          // Scanner burst detected
          e.preventDefault();
          e.stopPropagation();
          if (onScanRef.current) {
            onScanRef.current(buffer);
          }
          return;
        }

        // If active in standard barcode search input and user pressed enter manually
        if (isBarcodeSpecificInput && document.activeElement.value) {
          const manualVal = document.activeElement.value.trim();
          if (manualVal.length >= minLength) {
            e.preventDefault();
            e.stopPropagation();
            if (onScanRef.current) {
              onScanRef.current(manualVal);
            }
          }
        }
        return;
      }

      // If key is a printable character (ignore Shift, Ctrl, Alt, Meta, CapsLock, etc.)
      if (e.key.length === 1) {
        // If elapsed time between characters is greater than maxInterval and buffer already had content,
        // it's likely manual typing rather than hardware scanner -> reset buffer
        if (elapsed > maxInterval && bufferRef.current.length > 0) {
          // If not focused on general text inputs, we still allow buffering
          if (isInput && !isBarcodeSpecificInput) {
            bufferRef.current = '';
            return;
          }
          bufferRef.current = '';
        }

        // Ignore inputs in standard inputs unless it's the POS scanner input or burst scanning
        if (isInput && !isBarcodeSpecificInput && elapsed > maxInterval) {
          return;
        }

        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, maxInterval, minLength]);
}
