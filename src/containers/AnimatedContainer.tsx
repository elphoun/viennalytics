import { lazy, Suspense, ReactNode } from 'react';

// Lazy load the heavy framer-motion components
const MotionDiv = lazy(() => 
  import('framer-motion').then(module => ({ default: module.motion.div }))
);

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  transition?: any;
}

const AnimatedContainer = ({ children, className, ...motionProps }: AnimatedContainerProps) => (
  <Suspense fallback={<div className={className}>{children}</div>}>
    <MotionDiv className={className} {...motionProps}>
      {children}
    </MotionDiv>
  </Suspense>
);

export default AnimatedContainer;
