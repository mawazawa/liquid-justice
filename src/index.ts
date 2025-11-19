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

// Utilities
export { cn } from './lib/utils';
export { triggerHaptic, type HapticPattern } from './lib/haptics';

// Icons (re-export from lucide-react)
export * from './icons';
