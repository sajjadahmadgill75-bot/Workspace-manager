'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { openModal, closeModal, setActiveViewMode } from '../store/slices/uiSlice';

export function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();
  const { activeUserId } = useAppSelector((state) => state.auth);
  const { activeModal } = useAppSelector((state) => state.ui);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow Esc to work even in inputs to blur or close modal
        if (e.key === 'Escape') {
          if (activeModal) {
            dispatch(closeModal());
          } else {
            target.blur();
          }
        }
        return;
      }

      // 1. Esc: Close active modals
      if (e.key === 'Escape') {
        dispatch(closeModal());
        return;
      }

      // 2. C: New Task
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        dispatch(openModal({ modal: 'createTask' }));
        return;
      }

      // 3. /: Focus Search (Command Palette)
      if (e.key === '/') {
        e.preventDefault();
        dispatch(openModal({ modal: 'commandPalette' }));
        return;
      }

      // 4. M: Filter my assigned tasks (Switch to My Work view)
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        dispatch(setActiveViewMode('my_work'));
        // Optionally, we could also set the global filter, but 'my_work' is better aligned
        // dispatch(setAssigneeFilter(activeUserId));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, activeUserId, activeModal]);
}
