'use client';

import { useEffect } from 'react';

/**
 * SecurityShield - Client-side protection against:
 * - DevTools inspection (F12, Ctrl+Shift+I)
 * - Right-click context menu
 * - Text selection and copy
 * - Drag and drop of elements
 * - View source (Ctrl+U)
 * - Bot/RPA detection via automation flags
 * 
 * Does NOT break any functional behavior of the app.
 */
export function SecurityShield() {
  useEffect(() => {
    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts for DevTools and view source
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') { e.preventDefault(); return false; }
      // Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); return false; }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') { e.preventDefault(); return false; }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
      // Ctrl+S (Save page)
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); return false; }
      // Ctrl+Shift+C (Inspect element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); return false; }
    };

    // Block text selection via CSS is better but this adds extra layer
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      // Allow selection in input/textarea fields (functional requirement)
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Block drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Block copy (except in form fields)
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // Detect automation/bot
    const detectBot = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      if (nav.webdriver || nav.domAutomation || nav.domAutomationController) {
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;"><h1>Acceso no autorizado</h1></div>';
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('copy', handleCopy);
    detectBot();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  return null;
}
