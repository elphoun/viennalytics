import { UseQueryResult, useQuery } from '@tanstack/react-query';
import * as d3 from 'd3';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────

export interface ChartDimensions {
  width: number;
  height: number;
}

export interface ChartErrorType {
  message: string;
  status?: number;
}

export interface ChartLoadingState {
  isLoading: boolean;
  error: ChartErrorType | null;
  isSuccess: boolean;
}

// ─ Data Fetching Utilities ──────────────────────────────────────────────────────────────────────

export const useChartQuery = <T,>(
  queryKey: string[],
  url: string,
  options?: {
    staleTime?: number;
    gcTime?: number;
    retry?: number;
    retryDelay?: number;
  }
) => {
  const defaultOptions = {
    staleTime: Infinity, // Chess data never goes stale
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000,
  };

  return useQuery<T, Error>({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }
      return response.json();
    },
    ...defaultOptions,
    ...options,
  });
};

// ─ Resize Observer Hook ──────────────────────────────────────────────────────────────────────────

export const useChartResize = (
  height: number,
  minWidth = 800,
  debounceMs = 100
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: 0,
    height,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(entries => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const { width } = entries[0].contentRect;
        setDimensions({
          width: Math.max(width - 8, minWidth),
          height,
        });
      }, debounceMs);
    });

    resizeObserver.observe(containerRef.current);
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [height, minWidth, debounceMs]);

  return { containerRef, dimensions };
};

// ─ Loading and Error Components ──────────────────────────────────────────────────────────────────

export const ChartLoading = ({
  message = 'Loading...',
}: {
  message?: string;
}) => (
  <div className='h-full w-full flex items-center justify-center'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-2'></div>
      <span className='text-gray-400 italic'>{message}</span>
    </div>
  </div>
);

export const ChartError = ({ error }: { error: Error }) => (
  <div className='h-full w-full flex items-center justify-center'>
    <div className='text-center'>
      <div className='text-lg font-semibold text-red-400 mb-2'>
        Error loading data
      </div>
      <div className='text-sm text-gray-400'>{error.message}</div>
    </div>
  </div>
);

export const ChartNoData = ({
  message = 'No data available',
}: {
  message?: string;
}) => (
  <div className='h-full w-full flex items-center justify-center'>
    <span className='text-gray-400 italic'>{message}</span>
  </div>
);

// ─ Chart Container Component ──────────────────────────────────────────────────────────────────────

export const ChartContainer = ({
  children,
  dimensions,
  height: _height,
  ariaLabel,
  className = 'w-full h-fit min-h-[520px] relative',
}: {
  children: React.ReactNode;
  dimensions: ChartDimensions;
  height: number;
  ariaLabel: string;
  className?: string;
}) => {
  return (
    <div className={className} role='region' aria-label={ariaLabel}>
      {dimensions.width > 0 && children}
    </div>
  );
};

// ─ SVG Container Component ────────────────────────────────────────────────────────────────────────

export const ChartSVG = ({
  ref,
  dimensions,
  height,
  ariaLabel,
  style = {
    display: 'block',
    border: '3px solid #ea580c',
    background: '#18181b',
  },
}: {
  ref: React.RefObject<SVGSVGElement>;
  dimensions: ChartDimensions;
  height: number;
  ariaLabel: string;
  style?: React.CSSProperties;
}) => {
  return (
    <svg
      ref={ref}
      width={Math.max(dimensions.width, 800)}
      height={height}
      aria-label={ariaLabel}
      style={style}
    />
  );
};

// ─ Common Chart Margins ───────────────────────────────────────────────────────────────────────────

export const CHART_MARGINS = {
  small: { top: 20, right: 20, bottom: 60, left: 60 },
  medium: { top: 40, right: 120, bottom: 80, left: 80 },
  large: { top: 60, right: 120, bottom: 100, left: 80 },
} as const;

// ─ Common Chart Colors ────────────────────────────────────────────────────────────────────────────

export const CHART_COLORS = {
  primary: '#ea580c',
  secondary: '#f97316',
  accent: '#fb923c',
  background: '#18181b',
  border: '#1e293b',
  text: '#d1d5db',
  textLight: '#f9fafb',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
} as const;

// ─ Common Chart Styles ────────────────────────────────────────────────────────────────────────────

export const CHART_STYLES = {
  axis: {
    text: {
      fill: CHART_COLORS.text,
      fontSize: '12px',
      fontFamily: 'inherit',
    },
    line: {
      stroke: '#4B5563',
    },
  },
  tooltip: {
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '12px',
    border: `1px solid ${CHART_COLORS.primary}`,
  },
} as const;

// ─ Utility Functions ──────────────────────────────────────────────────────────────────────────────

export const createTooltip = (content: string, x: number, y: number) => {
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  tooltip.style.cssText = `
    position: absolute;
    background: ${CHART_STYLES.tooltip.background};
    color: ${CHART_STYLES.tooltip.color};
    padding: ${CHART_STYLES.tooltip.padding};
    border-radius: ${CHART_STYLES.tooltip.borderRadius};
    font-size: ${CHART_STYLES.tooltip.fontSize};
    pointer-events: none;
    z-index: 1000;
    border: ${CHART_STYLES.tooltip.border};
    left: ${x + 10}px;
    top: ${y - 10}px;
  `;
  tooltip.innerHTML = content;
  return tooltip;
};

export const removeTooltips = () => {
  document.querySelectorAll('.chart-tooltip').forEach(el => el.remove());
};

// ─ Hook for Chart State Management ────────────────────────────────────────────────────────────────

export const useChartState = <T,>(
  query: UseQueryResult<T, Error>,
  dimensions: ChartDimensions
) => {
  const { data, isLoading, error, isSuccess } = query;

  const shouldRender = useCallback(() => {
    return isSuccess && !isLoading && data && dimensions.width > 0;
  }, [isSuccess, isLoading, data, dimensions.width]);

  return {
    data,
    isLoading,
    error,
    isSuccess,
    shouldRender: shouldRender(),
  };
};

// ─ D3 Chart Utilities ─────────────────────────────────────────────────────────────────────────────

export const createChartGroup = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  margin: { top: number; right: number; bottom: number; left: number },
  className = 'chart-group'
) => {
  return svg
    .append('g')
    .attr('class', className)
    .attr('transform', `translate(${margin.left},${margin.top})`);
};

export const createAxis = (
  chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  scale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>,
  position: 'left' | 'bottom',
  chartHeight?: number
) => {
  let axis: d3.Axis<number> | d3.Axis<string>;

  if (position === 'left') {
    axis = d3.axisLeft(scale as d3.ScaleLinear<number, number>);
  } else {
    axis = d3.axisBottom(scale as d3.ScaleBand<string>);
  }

  const axisGroup = chartGroup
    .append('g')
    .attr('class', `axis axis-${position}`)
    .call(axis);

  if (position === 'bottom' && chartHeight) {
    axisGroup.attr('transform', `translate(0,${chartHeight})`);
  }

  // Apply consistent styling
  axisGroup
    .selectAll('text')
    .style('fill', CHART_STYLES.axis.text.fill)
    .style('font-size', CHART_STYLES.axis.text.fontSize)
    .style('font-family', CHART_STYLES.axis.text.fontFamily);

  axisGroup.selectAll('.domain').style('stroke', CHART_STYLES.axis.line.stroke);
  axisGroup
    .selectAll('.tick line')
    .style('stroke', CHART_STYLES.axis.line.stroke);

  return axisGroup;
};
