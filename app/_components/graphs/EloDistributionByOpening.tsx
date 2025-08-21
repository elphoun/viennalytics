'use client';

import * as d3 from 'd3';
import {
  FC,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  CHART_COLORS,
  CHART_STYLES,
  ChartLoading,
  useChartQuery,
  useChartResize,
} from './chartUtils';

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────

interface EloDistributionByOpeningProps {
  height?: number;
  maxOpenings?: number;
}

interface EloData {
  bins: string[];
  opening_counts: Record<string, number[]>;
}

interface ChartData {
  stackedData: number[][];
  binLabels: string[];
  openings: Array<{ opening: string; counts: number[]; total: number }>;
}

interface ProcessedData {
  chartData: ChartData | null;
  labels: string[];
  fullLabels: string[];
  maxValue: number;
}

// ─ Data Fetching ──────────────────────────────────────────────────────────────────────────────────

const ELO_DATA_URL =
  'https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingUsagebyELO-mp8Bv10TiZ7jhqE1XPb4JQeAMBKi8R.json';

// ─ Component ──────────────────────────────────────────────────────────────────────────────────────

const EloDistributionByOpening: FC<EloDistributionByOpeningProps> = memo(
  ({ height = 520, maxOpenings = 10 }) => {
    const { containerRef, dimensions } = useChartResize(height, 300, 100);
    const svgRef = useRef<SVGSVGElement>(null);
    const [activeOpenings, setActiveOpenings] = useState<Set<string> | null>(
      null
    );
    const [tooltip, setTooltip] = useState<{
      x: number;
      y: number;
      html: string;
    } | null>(null);
    const [isClient, setIsClient] = useState(false);

    const query = useChartQuery<EloData>(
      ['eloDistributionByOpening'],
      ELO_DATA_URL
    );

    const { data, isLoading, error, isSuccess } = query;

    const processedData = useMemo((): ProcessedData => {
      if (!data || !isSuccess) {
        return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
      }

      const { bins, opening_counts } = data;

      if (!bins || !Array.isArray(bins) || bins.length === 0) {
        return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
      }

      if (!opening_counts || typeof opening_counts !== 'object') {
        return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
      }

      const allOpenings = Object.entries(opening_counts)
        .filter(([_, counts]) => Array.isArray(counts) && counts.length > 0)
        .map(([opening, counts]) => ({
          opening,
          counts: counts as number[],
          total: (counts as number[]).reduce(
            (sum, count) => sum + (count || 0),
            0
          ),
        }))
        .filter(item => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, maxOpenings);

      if (allOpenings.length === 0) {
        return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
      }

      const labels = allOpenings.map(({ opening }) => opening);
      const stackedData = bins.map((_, binIndex) =>
        allOpenings.map(({ counts }) => counts[binIndex] || 0)
      );

      const maxValue = Math.max(
        ...stackedData.map(binData =>
          binData.reduce((sum, val) => sum + val, 0)
        )
      );

      return {
        chartData: { stackedData, binLabels: bins, openings: allOpenings },
        labels,
        fullLabels: labels,
        maxValue,
      };
    }, [data, maxOpenings, isSuccess]);

    const { chartData, labels, fullLabels, maxValue } = processedData;

    useLayoutEffect(() => {
      setIsClient(true);
    }, []);

    const handleMouseMove = useCallback(
      (event: any, bin: any, openingLabel: string, binIdx: number) => {
        const legendWidth = 240;
        const padding = {
          top: 30,
          right: legendWidth + 30,
          bottom: 80,
          left: 60,
        };
        const fullOpening = fullLabels[labels.indexOf(openingLabel)];
        const elo = chartData?.binLabels[binIdx];
        const count = Math.round(bin[1] - bin[0]);

        const rect = containerRef.current?.getBoundingClientRect();
        const clientX = (event && (event.clientX ?? event.pageX)) || 0;
        const clientY = (event && (event.clientY ?? event.pageY)) || 0;
        const left = rect
          ? Math.max(8, clientX - rect.left + padding.left)
          : clientX + padding.left;
        const top = rect
          ? Math.max(8, clientY - rect.top + padding.top - 20)
          : clientY + padding.top - 20;

        setTooltip({
          x: left,
          y: top,
          html: `<div style='font-size:13px'><b>${fullOpening}</b><br/>ELO: <b>${elo}</b><br/>Count: <b>${count}</b></div>`,
        });
      },
      [chartData?.binLabels, fullLabels, labels, containerRef]
    );

    const handleMouseLeave = useCallback(() => setTooltip(null), []);

    // ─ Chart Rendering ────────────────────────────────────────────────────────────────────────────

    useLayoutEffect(() => {
      if (
        !isSuccess ||
        isLoading ||
        !svgRef.current ||
        !chartData ||
        !labels.length ||
        dimensions.width === 0
      ) {
        return;
      }

      const shownOpenings = activeOpenings
        ? Array.from(activeOpenings)
        : labels;
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const legendWidth = 240;
      const padding = {
        top: 30,
        right: legendWidth + 30,
        bottom: 80,
        left: 60,
      };
      const chartWidth = dimensions.width - padding.left - padding.right;
      const chartHeightInner = height - padding.top - padding.bottom;
      const { stackedData, binLabels } = chartData;

      const baseColors = [
        '#fb923c',
        '#f59e0b',
        '#eab308',
        '#84cc16',
        '#22c55e',
        '#06b6d4',
        '#3b82f6',
        '#6366f1',
        '#8b5cf6',
        '#a855f7',
        '#d946ef',
        '#ec4899',
        '#f43f5e',
        '#ef4444',
        '#f97316',
      ];
      const colors = d3
        .range(labels.length)
        .map((i: number) =>
          i < baseColors.length
            ? baseColors[i]
            : d3.interpolateRainbow(i / labels.length)
        );

      const stackInput = binLabels.map((_: string, binIdx: number) => {
        const obj: Record<string, number> = {};
        shownOpenings.forEach(label => {
          const origIdx = labels.indexOf(label);
          obj[label] = stackedData[binIdx][origIdx] || 0;
        });
        return obj;
      });

      let yMax = maxValue;
      if (shownOpenings.length === 1) {
        const openingIdx = labels.indexOf(shownOpenings[0]);
        yMax = Math.max(...stackedData.map(bin => bin[openingIdx] || 0));
      }

      const y = d3.scaleLinear().domain([0, yMax]).range([chartHeightInner, 0]);

      const x = d3
        .scaleBand()
        .domain(binLabels)
        .range([0, chartWidth])
        .paddingInner(0.1)
        .paddingOuter(0.05);

      const stack = d3.stack<Record<string, number>>().keys(shownOpenings);
      const series = stack(stackInput);

      const mainGroup = svg
        .append('g')
        .attr('transform', `translate(${padding.left},${padding.top})`);

      mainGroup
        .selectAll('g.opening')
        .data(series)
        .join('g')
        .attr('class', 'opening')
        .attr(
          'fill',
          (_: any, openingIdx: number) =>
            colors[labels.indexOf(shownOpenings[openingIdx])]
        )
        .selectAll('rect')
        .data((binStack: any) => binStack)
        .join('rect')
        .attr('x', (_: any, binIdx: number) => x(binLabels[binIdx]) ?? 0)
        .attr('y', (d: any) => y(d[1]))
        .attr('height', (d: any) => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth())
        .attr('stroke', CHART_COLORS.border)
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mousemove', (event: any, d: any) => {
          const target = event.currentTarget as SVGRectElement;
          const parent = target.parentNode as SVGGElement;
          const datum = d3.select(parent).datum() as { key: string };
          const binIdx = Array.from(parent.children).indexOf(target);
          handleMouseMove(event, d, datum.key, binIdx);
        })
        .on('mouseleave', handleMouseLeave);

      const maxXLabels = 6;
      const labelStep = Math.ceil(binLabels.length / maxXLabels);

      mainGroup
        .append('g')
        .attr('transform', `translate(0,${chartHeightInner})`)
        .call(
          d3
            .axisBottom(x)
            .tickFormat((tickLabel: any, i: number) =>
              i % labelStep === 0 ? (tickLabel as string) : ''
            )
        )
        .selectAll('text')
        .style('fill', CHART_STYLES.axis.text.fill)
        .style('font-size', '11px')
        .style('font-family', 'inherit')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      mainGroup.append('g').call(d3.axisLeft(y).ticks(5));

      svg
        .append('text')
        .attr('x', padding.left + chartWidth / 2)
        .attr('y', height - 20)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.primary)
        .attr('font-size', 13)
        .text('ELO Rating');

      const yLabel = shownOpenings.length === 1 ? shownOpenings[0] : 'Players';
      svg
        .append('text')
        .attr(
          'transform',
          `translate(20,${padding.top + chartHeightInner / 2}) rotate(-90)`
        )
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.primary)
        .attr('font-size', 13)
        .text(yLabel);
    }, [
      isSuccess,
      isLoading,
      chartData,
      labels,
      fullLabels,
      dimensions,
      height,
      maxValue,
      activeOpenings,
      handleMouseMove,
      handleMouseLeave,
    ]);

    const handleLegendClick = useCallback(
      (label: string) => {
        setActiveOpenings(prev => {
          if (!prev) {
            return new Set(labels.filter(lbl => lbl !== label));
          }
          const next = new Set(prev);
          if (next.has(label)) {
            next.delete(label);
          } else {
            next.add(label);
          }
          return next.size === 0 ? null : next;
        });
      },
      [labels]
    );

    const handleLegendDoubleClick = useCallback((label: string) => {
      setActiveOpenings(new Set([label]));
    }, []);

    // ─ Render States ──────────────────────────────────────────────────────────────────────────────

    if (isLoading) {
      return <ChartLoading />;
    }

    if (error) {
      return (
        <div className='h-full w-full flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-lg font-semibold text-red-400 mb-2'>Error</div>
            <div className='text-sm text-gray-400'>{error.message}</div>
          </div>
        </div>
      );
    }

    if (!isSuccess || !chartData || !labels.length) {
      return (
        <div className='h-full w-full flex flex-col items-center justify-center p-4'>
          <span className='text-gray-400 italic mb-4'>No data available</span>
          <div className='text-xs text-gray-500 max-w-md text-center'>
            <p>Waiting for data to load...</p>
            <p>Data status: {isSuccess ? 'Success' : 'Not ready'}</p>
            <p>Chart data: {chartData ? 'Available' : 'Not available'}</p>
            <p>Labels: {labels.length}</p>
          </div>
        </div>
      );
    }

    // ─ Main Render ────────────────────────────────────────────────────────────────────────────────

    const legendWidth = 240;
    const padding = { top: 30, right: legendWidth + 30, bottom: 80, left: 60 };
    const chartHeightInner = height - padding.top - padding.bottom;
    const baseColors = [
      '#fb923c',
      '#f59e0b',
      '#eab308',
      '#84cc16',
      '#22c55e',
      '#06b6d4',
      '#3b82f6',
      '#6366f1',
      '#8b5cf6',
      '#a855f7',
      '#d946ef',
      '#ec4899',
      '#f43f5e',
      '#ef4444',
      '#f97316',
    ];
    const colors = d3
      .range(labels.length)
      .map((i: number) =>
        i < baseColors.length
          ? baseColors[i]
          : d3.interpolateRainbow(i / labels.length)
      );

    return (
      <div
        ref={containerRef}
        className='w-full h-fit min-h-[520px] relative'
        role='region'
        aria-label='ELO Distribution by Opening Chart'
      >
        {isClient && dimensions.width > 0 && isSuccess && chartData && (
          <div className='flex relative'>
            {/* Scrollable Chart Area */}
            <div
              className='flex-1 w-full overflow-y-hidden scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-slate-800'
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#ea580c rgba(30,41,59,0.3)',
                marginRight: `${legendWidth + 20}px`,
              }}
            >
              <svg
                ref={svgRef}
                width={Math.max(dimensions.width, 700)}
                height={height}
                aria-label='ELO Distribution by Opening Histogram'
                style={{
                  display: 'block',
                  border: '3px solid #ea580c',
                  background: '#18181b',
                }}
              />
              {tooltip && (
                <div
                  style={{
                    position: 'absolute',
                    left: tooltip.x,
                    top: tooltip.y,
                    pointerEvents: 'none',
                    background: 'rgba(30,41,59,0.97)',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '6px 12px',
                    boxShadow: '0 2px 8px #0002',
                    zIndex: 10,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    border: '1px solid #ea580c',
                    minWidth: 120,
                    maxWidth: 320,
                    whiteSpace: 'pre-line',
                    textAlign: 'left',
                  }}
                  dangerouslySetInnerHTML={{ __html: tooltip.html }}
                  role='tooltip'
                />
              )}
            </div>

            {/* Fixed Legend */}
            <div
              style={{
                position: 'absolute',
                right: 10,
                top: padding.top + 10,
                maxHeight: Math.min(chartHeightInner - 20, 350),
                overflowY: 'auto',
                overflowX: 'hidden',
                width: legendWidth,
                background: 'rgba(30,41,59,0.95)',
                borderRadius: 8,
                border: '1px solid #ea580c',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                zIndex: 5,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                scrollbarWidth: 'thin',
                scrollbarColor: '#ea580c rgba(30,41,59,0.3)',
              }}
              className='scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-slate-700'
              role='listbox'
              aria-label='Opening legend'
            >
              {labels.map((label, i) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity:
                      !activeOpenings || activeOpenings.has(label) ? 1 : 0.3,
                    cursor: 'pointer',
                    userSelect: 'none',
                    fontSize: 11,
                    fontFamily: 'inherit',
                    padding: '2px 4px',
                    borderRadius: 4,
                    minWidth: 0,
                  }}
                  title={label}
                  onClick={() => handleLegendClick(label)}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    handleLegendDoubleClick(label);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLegendClick(label);
                    }
                  }}
                  role='option'
                  tabIndex={0}
                  aria-selected={!activeOpenings || activeOpenings.has(label)}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      borderRadius: 3,
                      background: colors[i],
                      border: '1px solid #fff3',
                      marginRight: 6,
                      flexShrink: 0,
                    }}
                    aria-hidden='true'
                  />
                  <span
                    style={{
                      color: '#ea580c',
                      fontWeight: 500,
                      fontSize: 11,
                      lineHeight: 1.2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

EloDistributionByOpening.displayName = 'EloDistributionByOpening';

export default EloDistributionByOpening;
