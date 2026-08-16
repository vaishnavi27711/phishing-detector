import { useEffect, useRef } from 'react';

// This hook creates the "magnetic cursor" effect:
// a dot follows the mouse, and snaps/grows onto any element
// with the class "magnetic" (buttons, dropzone, etc).
//
// It returns a ref you attach to the cursor <div> in your JSX.
// All the movement math happens here, in one place.
export function useMagneticCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    function handleMouseMove(e) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Default: cursor follows the mouse exactly, small size.
      let targetX = mouseX;
      let targetY = mouseY;
      let size = 16;
      let snapped = false;

      // Re-query magnetic elements on every move. The DOM is small here,
      // so this is cheap, and it means newly-rendered buttons work too.
      const magneticEls = document.querySelectorAll('.magnetic');

      magneticEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(mouseX - cx, mouseY - cy);
        const pullRadius = Math.max(rect.width, rect.height) / 2 + 20;

        if (dist < pullRadius) {
          targetX = cx;
          targetY = cy;
          size = Math.max(rect.width, rect.height) * 0.9;
          snapped = true;
        }
      });

      cursor.style.left = targetX + 'px';
      cursor.style.top = targetY + 'px';
      cursor.style.width = size + 'px';
      cursor.style.height = size + 'px';
      cursor.style.opacity = snapped ? '0.2' : '1';
    }

    document.addEventListener('mousemove', handleMouseMove);

    // cleanup: remove the listener if this component ever unmounts
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return cursorRef;
}