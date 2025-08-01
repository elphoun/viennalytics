// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactNode, useState, useEffect, useRef } from 'react';

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface LazyChartProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
}

// ─ Constants ────────────────────────────────────────────────────────────────────────────────────
const LOADING = "Chart Loading...";

/**
 * LazyChart component that only renders its children when they come into view.
 * Uses Intersection Observer API for efficient lazy loading.
 * @param children - The content to lazy load
 * @param fallback - Optional fallback content to show while loading
 * @param rootMargin - Margin around the root for intersection detection
 */
const LazyChart = ({ children, fallback, rootMargin = '100px' }: LazyChartProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  if (isVisible) { 
    return <>{children}</>; 
  }

  return (
    <div ref={ref}>
      {fallback || (
        <div className="flex items-center justify-center h-[300px] text-orange-400">
          {LOADING}
        </div>
      )}
    </div>
  );
};

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default LazyChart;