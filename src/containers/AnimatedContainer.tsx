// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { lazy, Suspense, ReactNode } from 'react';

// ─ Lazy Imports ─────────────────────────────────────────────────────────────────────────────────
// Lazy load the heavy framer-motion components
const MotionDiv = lazy(() => 
  import('framer-motion').then(module => ({ default: module.motion.div }))
);

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  transition?: any;
}

/**
 * AnimatedContainer component provides lazy-loaded framer-motion animations.
 * Falls back to a regular div if motion components haven't loaded yet.
 * @param children - The content to animate
 * @param className - CSS classes to apply
 * @param motionProps - Framer motion properties (initial, animate, transition, etc.)
 */
const AnimatedContainer = ({ children, className, ...motionProps }: AnimatedContainerProps) => (
  <Suspense fallback={<div className={className}>{children}</div>}>
    <MotionDiv className={className} {...motionProps}>
      {children}
    </MotionDiv>
  </Suspense>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default AnimatedContainer;
