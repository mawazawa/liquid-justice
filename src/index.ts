/**
 * Liquid Justice Design System
 *
 * Premium UI component library for legal tech applications.
 * Features Apple-inspired Liquid Glass aesthetics, science-backed UX patterns,
 * and bleeding-edge CSS features.
 *
 * @see README.md for documentation
 * @see DESIGN_PRINCIPLES.md for research and psychology
 */

// UI Components
export { Button, buttonVariants, type ButtonProps } from './components/ui/button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, type CardProps } from './components/ui/card';
export { Input, type InputProps } from './components/ui/input';
export { Label } from './components/ui/label';
export { Badge, badgeVariants } from './components/ui/badge';
export { Separator } from './components/ui/separator';
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './components/ui/tooltip';
export { LiquidSlider, type LiquidSliderProps } from './components/ui/liquid-slider';
export { LiquidGlassAccordion, type LiquidGlassAccordionProps } from './components/ui/liquid-glass-accordion';
export { StatefulButton, type StatefulButtonProps } from './components/ui/stateful-button';

// === NEW 2025 COMPONENTS (World-Class Design Enhancements) ===

// Magnetic Interaction (Apple iPad-style)
export { MagneticButton, type MagneticButtonProps } from './components/ui/magnetic-button';

// Premium 3D Chamfered Button
export { ChamferedButton, chamferedButtonVariants, type ChamferedButtonProps } from './components/ui/chamfered-button';

// Hero Sections (Mesh Gradients, Scroll Animations)
export {
  HeroSection,
  HeroWithMedia,
  type HeroSectionProps,
  type HeroWithMediaProps
} from './components/ui/hero-section';

// Loading Skeletons (Reduce Perceived Wait Time)
export {
  Skeleton,
  SkeletonCard,
  SkeletonListItem,
  SkeletonTableRow,
  SkeletonForm,
  SkeletonHero,
  SkeletonGrid,
  type SkeletonProps
} from './components/ui/skeleton';

// Bento Grid System (Nike/Linear-style Asymmetric Layouts)
export {
  BentoGrid,
  BentoCard,
  BentoHeroLayout,
  BentoFeatureLayout,
  BentoMasonryLayout,
  BentoProductLayout,
  type BentoGridProps,
  type BentoCardProps
} from './components/ui/bento-grid';

// Utilities
export { cn } from './lib/utils';
export { triggerHaptic, type HapticPattern } from './lib/haptics';

// Squircle Utilities (Apple-style Smooth Corners)
export {
  generateSquirclePath,
  getSquircleClipPath,
  generateSquircleSVG,
  squirclePaintWorklet,
  supportsCornerShape,
  supportsPaintWorklet,
  useSquircleSupport
} from './lib/squircle';

// Scroll Animation Hooks
export {
  useScrollReveal,
  useStaggeredReveal,
  useParallaxScroll,
  type UseScrollRevealOptions,
  type ScrollRevealResult
} from './lib/use-scroll-reveal';

// Icons (re-export from lucide-react)
export * from './icons';
