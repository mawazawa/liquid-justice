/**
 * Hero Section Component
 *
 * Full-screen landing section with 2025 design trends:
 * - Mesh gradients (Stripe-inspired multi-directional depth)
 * - Grainy texture overlay (aurora/dreamy aesthetic)
 * - Scroll-triggered animations
 * - Gradient text support
 * - Responsive typography (clamp-based fluid scaling)
 *
 * RESEARCH BACKING:
 * - Mesh Gradients: Stripe uses for futuristic aesthetic, creates perceived depth
 * - Grainy Texture: 2025 "aurora" trend, adds organic feel to digital surfaces
 * - Scroll Animations: Apple/Linear standard, maintains user engagement
 * - Fluid Typography: Prevents jarring size changes, feels premium
 *
 * USER IMPACT:
 * - Immediate "wow" on page load (first impression = trust)
 * - Scroll interaction maintains engagement (reduces bounce rate)
 * - Gradient aesthetics signal modernity (subconscious "cutting-edge" association)
 * - Smooth responsiveness feels polished (mobile = desktop quality)
 *
 * PERFORMANCE:
 * - CSS-based gradients (GPU-accelerated)
 * - IntersectionObserver for scroll (no scroll listeners)
 * - Will-change hints for transform properties
 * - Respects prefers-reduced-motion
 *
 * @see https://stripe.com (mesh gradient inspiration)
 * @see https://linear.app (scroll animation patterns)
 * @see https://www.awwwards.com/gradients-in-web-design-elements.html
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export interface HeroSectionProps {
  /** Headline text (supports React nodes for custom styling) */
  headline: React.ReactNode;

  /** Subheadline/description */
  description?: React.ReactNode;

  /** Call-to-action buttons */
  actions?: React.ReactNode;

  /** Background variant */
  variant?: "mesh" | "aurora" | "gradient" | "solid";

  /** Enable grainy texture overlay (2025 trend) */
  grainy?: boolean;

  /** Apply gradient to headline text */
  gradientHeadline?: boolean;

  /** Gradient type for headline */
  gradientType?: "primary" | "aurora" | "sunset";

  /** Enable scroll-triggered fade-in animation */
  scrollReveal?: boolean;

  /** Alignment */
  align?: "left" | "center" | "right";

  /** Padding size */
  padding?: "sm" | "md" | "lg" | "xl";

  /** Full viewport height */
  fullHeight?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Additional styles */
  style?: React.CSSProperties;

  /** Children (rendered below description) */
  children?: React.ReactNode;
}

export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
      headline,
      description,
      actions,
      variant = "mesh",
      grainy = true,
      gradientHeadline = true,
      gradientType = "primary",
      scrollReveal = true,
      align = "center",
      padding = "lg",
      fullHeight = true,
      className,
      style,
      children,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(!scrollReveal);
    const [reducedMotion, setReducedMotion] = React.useState(false);
    const sectionRef = React.useRef<HTMLElement>(null);

    // Check for reduced motion preference
    React.useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Scroll-triggered reveal animation
    React.useEffect(() => {
      if (!scrollReveal || reducedMotion) {
        setIsVisible(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
            }
          });
        },
        {
          threshold: 0.1, // Trigger when 10% visible
          rootMargin: '0px 0px -100px 0px', // Start slightly before entering viewport
        }
      );

      const currentRef = sectionRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, [scrollReveal, reducedMotion]);

    // Merge refs - handle null case properly
    React.useImperativeHandle(ref, () => sectionRef.current ?? (null as unknown as HTMLElement));

    // Background classes
    const backgroundClasses = {
      mesh: "bg-mesh-primary",
      aurora: "bg-aurora",
      gradient: "bg-gradient-to-br from-primary/10 via-accent/5 to-background",
      solid: "bg-background",
    };

    // Padding classes
    const paddingClasses = {
      sm: "py-12 px-6",
      md: "py-20 px-8",
      lg: "py-32 px-8",
      xl: "py-40 px-12",
    };

    // Alignment classes
    const alignClasses = {
      left: "text-left items-start",
      center: "text-center items-center",
      right: "text-right items-end",
    };

    // Gradient headline classes
    const gradientClasses = {
      primary: "text-gradient",
      aurora: "text-gradient-aurora",
      sunset: "text-gradient-sunset",
    };

    return (
      <section
        ref={sectionRef}
        className={cn(
          "relative overflow-hidden",
          backgroundClasses[variant],
          grainy && "bg-grainy",
          fullHeight && "min-h-screen",
          paddingClasses[padding],
          className
        )}
        style={style}
      >
        {/* Content Container */}
        <div
          className={cn(
            "relative z-10 mx-auto max-w-7xl",
            fullHeight && "flex flex-col justify-center min-h-screen"
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-6",
              alignClasses[align],
              // Scroll reveal animation
              scrollReveal && !reducedMotion && (
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              ),
              scrollReveal && !reducedMotion && "transition-all duration-1000 ease-out"
            )}
            style={{
              willChange: scrollReveal && !reducedMotion ? 'opacity, transform' : undefined,
            }}
          >
            {/* Headline */}
            <h1
              className={cn(
                "text-hero font-bold",
                gradientHeadline && gradientClasses[gradientType]
              )}
            >
              {headline}
            </h1>

            {/* Description */}
            {description && (
              <p
                className={cn(
                  "text-xl md:text-2xl text-muted-foreground max-w-3xl",
                  align === "center" && "mx-auto",
                  align === "right" && "ml-auto"
                )}
              >
                {description}
              </p>
            )}

            {/* Actions */}
            {actions && (
              <div
                className={cn(
                  "flex flex-wrap gap-4 mt-4",
                  align === "center" && "justify-center",
                  align === "right" && "justify-end"
                )}
              >
                {actions}
              </div>
            )}

            {/* Children */}
            {children}
          </div>
        </div>

        {/* Decorative Elements */}
        {variant === "mesh" && (
          <>
            {/* Animated mesh gradient orbs (subtle movement) */}
            <div
              className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"
              style={{
                animationDuration: '8s',
                animationDelay: '0s',
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-96 h-96 bg-accent/15 rounded-full blur-[100px] animate-pulse"
              style={{
                animationDuration: '10s',
                animationDelay: '2s',
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-destructive/10 rounded-full blur-[120px] animate-pulse"
              style={{
                animationDuration: '12s',
                animationDelay: '4s',
              }}
            />
          </>
        )}
      </section>
    );
  }
);

HeroSection.displayName = "HeroSection";

/**
 * Variant: Hero with Image/Media
 *
 * Split layout with content on one side, media on the other
 */
export interface HeroWithMediaProps extends Omit<HeroSectionProps, 'align'> {
  /** Media element (image, video, 3D element) */
  media: React.ReactNode;

  /** Layout direction */
  layout?: "media-left" | "media-right";

  /** Media container className */
  mediaClassName?: string;
}

export const HeroWithMedia = React.forwardRef<HTMLElement, HeroWithMediaProps>(
  (
    {
      headline,
      description,
      actions,
      media,
      layout = "media-right",
      variant = "mesh",
      grainy = true,
      gradientHeadline = true,
      gradientType = "primary",
      scrollReveal = true,
      padding = "lg",
      fullHeight = true,
      className,
      mediaClassName,
      style,
      children,
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(!scrollReveal);
    const [reducedMotion, setReducedMotion] = React.useState(false);
    const sectionRef = React.useRef<HTMLElement>(null);

    // Check for reduced motion preference
    React.useEffect(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Scroll-triggered reveal animation
    React.useEffect(() => {
      if (!scrollReveal || reducedMotion) {
        setIsVisible(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -100px 0px',
        }
      );

      const currentRef = sectionRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
      };
    }, [scrollReveal, reducedMotion]);

    // Merge refs - handle null case properly
    React.useImperativeHandle(ref, () => sectionRef.current ?? (null as unknown as HTMLElement));

    // Background classes
    const backgroundClasses = {
      mesh: "bg-mesh-primary",
      aurora: "bg-aurora",
      gradient: "bg-gradient-to-br from-primary/10 via-accent/5 to-background",
      solid: "bg-background",
    };

    // Padding classes
    const paddingClasses = {
      sm: "py-12 px-6",
      md: "py-20 px-8",
      lg: "py-32 px-8",
      xl: "py-40 px-12",
    };

    // Gradient headline classes
    const gradientClasses = {
      primary: "text-gradient",
      aurora: "text-gradient-aurora",
      sunset: "text-gradient-sunset",
    };

    return (
      <section
        ref={sectionRef}
        className={cn(
          "relative overflow-hidden",
          backgroundClasses[variant],
          grainy && "bg-grainy",
          fullHeight && "min-h-screen",
          paddingClasses[padding],
          className
        )}
        style={style}
      >
        {/* Content Container */}
        <div
          className={cn(
            "relative z-10 mx-auto max-w-7xl",
            fullHeight && "flex items-center min-h-screen"
          )}
        >
          <div
            className={cn(
              "grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full",
              layout === "media-left" && "lg:grid-flow-dense"
            )}
          >
            {/* Content */}
            <div
              className={cn(
                "flex flex-col gap-6 text-left items-start",
                layout === "media-left" && "lg:col-start-2",
                // Scroll reveal animation
                scrollReveal && !reducedMotion && (
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : layout === "media-left"
                    ? "opacity-0 translate-x-12"
                    : "opacity-0 -translate-x-12"
                ),
                scrollReveal && !reducedMotion && "transition-all duration-1000 ease-out delay-100"
              )}
              style={{
                willChange: scrollReveal && !reducedMotion ? 'opacity, transform' : undefined,
              }}
            >
              {/* Headline */}
              <h1
                className={cn(
                  "text-hero font-bold",
                  gradientHeadline && gradientClasses[gradientType]
                )}
              >
                {headline}
              </h1>

              {/* Description */}
              {description && (
                <p className="text-xl md:text-2xl text-muted-foreground">
                  {description}
                </p>
              )}

              {/* Actions */}
              {actions && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {actions}
                </div>
              )}

              {/* Children */}
              {children}
            </div>

            {/* Media */}
            <div
              className={cn(
                "relative",
                layout === "media-left" && "lg:col-start-1",
                mediaClassName,
                // Scroll reveal animation (opposite direction)
                scrollReveal && !reducedMotion && (
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : layout === "media-left"
                    ? "opacity-0 -translate-x-12"
                    : "opacity-0 translate-x-12"
                ),
                scrollReveal && !reducedMotion && "transition-all duration-1000 ease-out delay-300"
              )}
              style={{
                willChange: scrollReveal && !reducedMotion ? 'opacity, transform' : undefined,
              }}
            >
              {media}
            </div>
          </div>
        </div>
      </section>
    );
  }
);

HeroWithMedia.displayName = "HeroWithMedia";
