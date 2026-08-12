"use client";

import { useEffect } from "react";

export interface HotkeyOptions {
  ctrl?: boolean;   // Requires Ctrl (Windows/Linux) or Cmd (macOS)
  shift?: boolean;  // Requires Shift
  alt?: boolean;    // Requires Alt
}

export function useHotkeys(
  key: string,
  callback: () => void,
  options: HotkeyOptions | boolean = false
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input element
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target.isContentEditable)
      ) {
        return;
      }

      const reqCtrl = typeof options === "boolean" ? options : !!options.ctrl;
      const reqShift = typeof options === "object" ? !!options.shift : false;
      const reqAlt = typeof options === "object" ? !!options.alt : false;

      const hasCtrl = event.ctrlKey || event.metaKey;
      const hasShift = event.shiftKey;
      const hasAlt = event.altKey;

      // Ensure modifier state matches requirements exactly
      if (reqCtrl !== hasCtrl) return;
      if (reqShift !== hasShift && key !== "?") return; // ? inherently requires shift on US keyboards
      if (reqAlt !== hasAlt) return;

      const eventKey = event.key.toLowerCase();
      const targetKey = key.toLowerCase();

      if (
        eventKey === targetKey ||
        event.code.toLowerCase() === `key${targetKey}` ||
        (key === "?" && (eventKey === "?" || (eventKey === "/" && hasShift)))
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, options]);
}
