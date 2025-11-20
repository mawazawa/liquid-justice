/**
 * Magnetic Button Component
 *
 * Apple iPad-style magnetic hover interaction where the button "pulls" toward the cursor.
 *
 * RESEARCH BACKING:
 * - Introduced by Apple for iPad OS (2025 web implementation)
 * - Reduces click precision anxiety - "the button comes to you"
 * - Anticipatory UX: System helps user complete action
 * - Physics-based: Damping + stiffness create realistic spring behavior
 *
 * USER IMPACT:
 * - Reduces cognitive load for clicking (especially on mobile/tablet)
 * - Creates delight through unexpected but helpful interaction
 * - Signals "this app is helping me" vs "I have to be precise"
 * - Particularly helpful for users with motor control challenges (accessibility++)
 *
 * PERFORMANCE:
 * - Uses requestAnimationFrame for 60fps
 * - Debounced mousemove for efficiency
 * - Respects prefers-reduced-motion
 *
 * @see https://framer.university/resources/magnetic-hover-component-for-framer
 * @see https://www.apple.com/ipados/ (original inspiration)
 */

import * as React from "react";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps extends ButtonProps {
  /**
   * How far the button moves toward cursor (in pixels)
   * Default: 8px (iOS-calibrated for subtle effect)
   * Higher values = more dramatic effect
   */
  distance?: number;

  /**
   * Area around button that triggers magnetic effect (in pixels)
   * Default: 120px (iPad standard hover area)
   * Larger area = easier to trigger, more forgiving
   */
  hoverArea?: number;

  /**
   * Spring physics damping (0-1)
   * Lower = more bouncy, Higher = more damped
   * Default: 0.25 (Apple-calibrated for premium feel)
   */
  damping?: number;

  /**
   * Spring stiffness (0-300)
   * Lower = slower response, Higher = snappier
   * Default: 150 (balance between responsive and smooth)
   */
  stiffness?: number;

  /**
   * Enable magnetic effect
   * Default: true (disable for reduced motion users automatically)
   */
  enabled?: boolean;

  /**
   * Child elements can have stronger/weaker magnetic pull
   * Creates parallax effect for nested elements
   * Default: 1 (same as parent)
   */
  childIntensity?: number;
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      distance = 8,
      hoverArea = 120,
      damping = 0.25,
      stiffness = 150,
      enabled = true,
      childIntensity = 1,
      children,
      className,
      onMouseEnter,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const childRef = React.useRef<HTMLSpanElement>(null);

    // Animation state
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [childPosition, setChildPosition] = React.useState({ x: 0, y: 0 });
    const velocity = React.useRef({ x: 0, y: 0 });
    const childVelocity = React.useRef({ x: 0, y: 0 });
    const animationFrame = React.useRef<number | null>(null);

    // Check for reduced motion preference
    const [reducedMotion, setReducedMotion] = React.useState(false);

    React.useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Spring physics animation
    const animate = React.useCallback((targetX: number, targetY: number) => {
      if (!enabled || reducedMotion) return;

      const spring = () => {
        // Parent button spring physics
        const dx = targetX - position.x;
        const dy = targetY - position.y;

        // Apply stiffness and damping (simplified spring physics)
        const ax = (dx * stiffness) / 1000 - velocity.current.x * damping;
        const ay = (dy * stiffness) / 1000 - velocity.current.y * damping;

        velocity.current.x += ax;
        velocity.current.y += ay;

        const newX = position.x + velocity.current.x;
        const newY = position.y + velocity.current.y;

        setPosition({ x: newX, y: newY });

        // Child element parallax (stronger movement)
        const childTargetX = targetX * childIntensity;
        const childTargetY = targetY * childIntensity;

        const cdx = childTargetX - childPosition.x;
        const cdy = childTargetY - childPosition.y;

        const cax = (cdx * stiffness) / 1000 - childVelocity.current.x * damping;
        const cay = (cdy * stiffness) / 1000 - childVelocity.current.y * damping;

        childVelocity.current.x += cax;
        childVelocity.current.y += cay;

        const newChildX = childPosition.x + childVelocity.current.x;
        const newChildY = childPosition.y + childVelocity.current.y;

        setChildPosition({ x: newChildX, y: newChildY });

        // Continue animation if not settled
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          animationFrame.current = requestAnimationFrame(spring);
        }
      };

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(spring);
    }, [enabled, reducedMotion, position, childPosition, stiffness, damping, childIntensity]);

    // Handle mouse enter
    const handleMouseEnter = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!enabled || reducedMotion) {
          onMouseEnter?.(e);
          return;
        }

        onMouseEnter?.(e);
      },
      [enabled, reducedMotion, onMouseEnter]
    );

    // Handle mouse move
    const handleMouseMove = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!enabled || reducedMotion || !buttonRef.current) {
          onMouseMove?.(e);
          return;
        }

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate distance from center
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Check if within hover area
        const distanceFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = hoverArea;

        if (distanceFromCenter < maxDistance) {
          // Calculate magnetic pull (inverse square law for realism)
          const pullStrength = 1 - distanceFromCenter / maxDistance;
          const targetX = (deltaX / distanceFromCenter) * distance * pullStrength;
          const targetY = (deltaY / distanceFromCenter) * distance * pullStrength;

          animate(targetX, targetY);
        }

        onMouseMove?.(e);
      },
      [enabled, reducedMotion, distance, hoverArea, animate, onMouseMove]
    );

    // Handle mouse leave
    const handleMouseLeave = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!enabled || reducedMotion) {
          onMouseLeave?.(e);
          return;
        }

        // Snap back to center with spring physics
        animate(0, 0);
        onMouseLeave?.(e);
      },
      [enabled, reducedMotion, animate, onMouseLeave]
    );

    // Cleanup animation frame
    React.useEffect(() => {
      return () => {
        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }
      };
    }, []);

    // Merge refs
    React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

    return (
      <Button
        ref={buttonRef}
        className={cn("relative overflow-visible", className)}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={
          {
            transform: enabled && !reducedMotion
              ? `translate(${position.x}px, ${position.y}px)`
              : undefined,
            transition: enabled && !reducedMotion ? 'none' : undefined,
            willChange: enabled && !reducedMotion ? 'transform' : undefined,
          } as React.CSSProperties
        }
        {...props}
      >
        <span
          ref={childRef}
          className="inline-flex items-center gap-2"
          style={
            {
              transform: enabled && !reducedMotion
                ? `translate(${childPosition.x}px, ${childPosition.y}px)`
                : undefined,
              transition: enabled && !reducedMotion ? 'none' : undefined,
              willChange: enabled && !reducedMotion ? 'transform' : undefined,
            } as React.CSSProperties
          }
        >
          {children}
        </span>
      </Button>
    );
  }
);

MagneticButton.displayName = "MagneticButton";
