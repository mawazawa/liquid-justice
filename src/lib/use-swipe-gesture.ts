/**
 * Swipe Gesture Hooks for Mobile Interactions
 *
 * Touch-based gesture system for swipe-to-delete, swipe-between-tabs, etc.
 * iOS/Android-standard interaction patterns.
 *
 * RESEARCH BACKING:
 * - iOS Human Interface Guidelines: swipe patterns are primary navigation
 * - Material Design 3: swipe actions for list items (archive, delete)
 * - Touch velocity threshold: 0.3px/ms minimum for intentional swipe
 * - Friction coefficient: 0.4-0.6 for natural feel (physics-based)
 *
 * PSYCHOLOGY:
 * - Swipe feels natural (muscle memory from phone UI)
 * - Visual feedback reduces uncertainty ("did that register?")
 * - Threshold prevents accidental actions
 * - Snap-back feels forgiving (undo-able)
 *
 * USER IMPACT:
 * - Faster actions than tapping buttons (1 motion vs 2)
 * - Familiar pattern (muscle memory from native apps)
 * - Fat-finger friendly (large swipe area)
 * - Reduces UI clutter (actions hidden until swipe)
 *
 * PERFORMANCE:
 * - Uses touch events (native, no polyfill)
 * - GPU-accelerated transforms
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/gestures
 * @see https://m3.material.io/components/lists/specs#5c67e11f-c7bb-49fc-8764-c5a6e35f47c6
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export interface SwipeGestureOptions {
  /** Minimum distance (px) to trigger swipe */
  threshold?: number;

  /** Minimum velocity (px/ms) to trigger swipe */
  velocityThreshold?: number;

  /** Maximum time (ms) for gesture to be considered swipe */
  maxDuration?: number;

  /** Friction coefficient (0-1, lower = more resistance) */
  friction?: number;

  /** Enable horizontal swipe */
  enableHorizontal?: boolean;

  /** Enable vertical swipe */
  enableVertical?: boolean;

  /** Prevent default touch behavior */
  preventDefault?: boolean;
}

export interface SwipeCallbacks {
  /** Swipe left callback */
  onSwipeLeft?: () => void;

  /** Swipe right callback */
  onSwipeRight?: () => void;

  /** Swipe up callback */
  onSwipeUp?: () => void;

  /** Swipe down callback */
  onSwipeDown?: () => void;

  /** Swipe start callback */
  onSwipeStart?: (direction: 'left' | 'right' | 'up' | 'down') => void;

  /** Swipe move callback (for visual feedback) */
  onSwipeMove?: (deltaX: number, deltaY: number, progress: number) => void;

  /** Swipe end callback */
  onSwipeEnd?: () => void;
}

export interface SwipeGestureResult {
  /** Ref to attach to swipeable element */
  ref: RefObject<HTMLElement>;

  /** Is currently swiping */
  isSwiping: boolean;

  /** Current swipe delta */
  delta: { x: number; y: number };

  /** Swipe progress (0-1) */
  progress: number;
}

/**
 * Hook for swipe gesture detection
 *
 * @example
 * ```tsx
 * const { ref, isSwiping, progress } = useSwipeGesture({
 *   onSwipeLeft: () => archive(),
 *   onSwipeRight: () => favorite(),
 *   threshold: 100
 * });
 *
 * return <div ref={ref} style={{ transform: `translateX(${progress * 100}px)` }}>
 *   Swipeable content
 * </div>;
 * ```
 */
export function useSwipeGesture(
  callbacks: SwipeCallbacks,
  options: SwipeGestureOptions = {}
): SwipeGestureResult {
  const {
    threshold = 80,
    velocityThreshold = 0.3,
    maxDuration = 300,
    friction = 0.5,
    enableHorizontal = true,
    enableVertical = true,
    preventDefault = true,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [delta, setDelta] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);

  // Touch state
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTouch = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasStartedRef = useRef<boolean>(false);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!ref.current || e.touches.length !== 1) return;

      const touch = e.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      lastTouch.current = { ...touchStart.current };
      hasStartedRef.current = false;
      setIsSwiping(true);
    },
    []
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!ref.current || !touchStart.current || e.touches.length !== 1) return;

      if (preventDefault) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;

      // Apply friction
      const frictionedDeltaX = deltaX * friction;
      const frictionedDeltaY = deltaY * friction;

      // Determine primary direction (horizontal or vertical)
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      // Only track enabled directions
      if ((isHorizontal && !enableHorizontal) || (!isHorizontal && !enableVertical)) {
        return;
      }

      setDelta({
        x: enableHorizontal ? frictionedDeltaX : 0,
        y: enableVertical ? frictionedDeltaY : 0,
      });

      // Calculate progress (0-1 based on threshold)
      const progressValue = Math.min(
        1,
        Math.abs(isHorizontal ? frictionedDeltaX : frictionedDeltaY) / threshold
      );
      setProgress(progressValue);

      // Update last touch for velocity calculation
      lastTouch.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      // Callback for visual feedback
      callbacks.onSwipeMove?.(frictionedDeltaX, frictionedDeltaY, progressValue);

      // Determine direction
      let direction: 'left' | 'right' | 'up' | 'down';
      if (isHorizontal) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      // Fire start callback once
      if (!hasStartedRef.current) {
        callbacks.onSwipeStart?.(direction);
        hasStartedRef.current = true;
      }
    },
    [threshold, friction, enableHorizontal, enableVertical, preventDefault, callbacks]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (_e: TouchEvent) => {
      if (!ref.current || !touchStart.current || !lastTouch.current) return;

      const deltaX = lastTouch.current.x - touchStart.current.x;
      const deltaY = lastTouch.current.y - touchStart.current.y;
      const duration = lastTouch.current.time - touchStart.current.time;

      // Calculate velocity (px/ms)
      const velocityX = Math.abs(deltaX) / duration;
      const velocityY = Math.abs(deltaY) / duration;

      // Determine if gesture completed
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
      const distance = isHorizontal ? Math.abs(deltaX) : Math.abs(deltaY);
      const velocity = isHorizontal ? velocityX : velocityY;

      const completed =
        duration < maxDuration &&
        (distance > threshold || velocity > velocityThreshold);

      if (completed) {
        // Determine direction and fire callback
        if (isHorizontal && enableHorizontal) {
          if (deltaX > 0) {
            callbacks.onSwipeRight?.();
          } else {
            callbacks.onSwipeLeft?.();
          }
        } else if (!isHorizontal && enableVertical) {
          if (deltaY > 0) {
            callbacks.onSwipeDown?.();
          } else {
            callbacks.onSwipeUp?.();
          }
        }
      }

      // Reset state
      setIsSwiping(false);
      setDelta({ x: 0, y: 0 });
      setProgress(0);
      touchStart.current = null;
      lastTouch.current = null;
      hasStartedRef.current = false;

      callbacks.onSwipeEnd?.();
    },
    [
      threshold,
      velocityThreshold,
      maxDuration,
      enableHorizontal,
      enableVertical,
      callbacks,
    ]
  );

  // Attach event listeners
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Passive listeners for performance
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return {
    ref,
    isSwiping,
    delta,
    progress,
  };
}

/**
 * Swipe-to-Delete Pattern (iOS-style)
 *
 * @example
 * ```tsx
 * const { ref, revealed } = useSwipeToDelete({
 *   onDelete: () => deleteItem(),
 *   threshold: 100
 * });
 *
 * return (
 *   <div ref={ref} className="relative">
 *     <div className={revealed ? 'translate-x-[-100px]' : ''}>Content</div>
 *     {revealed && <button>Delete</button>}
 *   </div>
 * );
 * ```
 */
export function useSwipeToDelete(options: {
  onDelete: () => void;
  threshold?: number;
  deleteText?: string;
}) {
  const { onDelete, threshold = 100, deleteText = 'Delete' } = options;

  const [revealed, setRevealed] = useState(false);
  const [offset, setOffset] = useState(0);

  const { ref, isSwiping, progress } = useSwipeGesture(
    {
      onSwipeLeft: () => {
        setRevealed(true);
        setOffset(-threshold);
      },
      onSwipeRight: () => {
        setRevealed(false);
        setOffset(0);
      },
      onSwipeMove: (deltaX) => {
        if (deltaX < 0) {
          setOffset(Math.max(deltaX, -threshold));
        }
      },
      onSwipeEnd: () => {
        if (!revealed) {
          setOffset(0);
        }
      },
    },
    { threshold, enableVertical: false }
  );

  const executeDelete = useCallback(() => {
    onDelete();
    setRevealed(false);
    setOffset(0);
  }, [onDelete]);

  return {
    ref,
    revealed,
    offset,
    isSwiping,
    progress,
    executeDelete,
    deleteText,
  };
}
