import * as d3 from 'd3';
import { FC, useEffect, useState, useMemo, memo, useRef } from "react";
import { CHART_MESSAGES } from './Constants';

interface EloDistributionByOpeningProps {
  binSize?: number;
  height?: number;
  maxOpenings?: number;
}

interface DataType {
  bins: number[];
  binLabels: string[];
  openingCounts: Record<string, number[]>;
  binSize: number;
  // ...other fields
}

const NO_DATA_MSG = CHART_MESSAGES.noData;

/** */
const EloDistributionByOpening: FC<EloDistributionByOpeningProps> = memo(({ height, maxOpenings = 10 }) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Interactivity state
  const [activeOpenings, setActiveOpenings] = useState<Set<string> | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string } | null>(null);

  // Simplified data fetching without intersection observer
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[EloDistributionByOpening] Starting data fetch...');
        const response = await fetch('/backend/data/generated_data/elo_histogram_data.json');
        console.log('[EloDistributionByOpening] Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json();
        console.log('[EloDistributionByOpening] Raw fetched data:', fetchedData);
        console.log('[EloDistributionByOpening] Data structure:', {
          bins: Array.isArray(fetchedData?.bins) ? fetchedData.bins.length : 'not array',
          binLabels: Array.isArray(fetchedData?.binLabels) ? fetchedData.binLabels.length : 'not array',
          openingCounts: typeof fetchedData?.openingCounts === 'object' ? Object.keys(fetchedData.openingCounts).length : 'not object'
        });
        
        if (isMounted) {
          setData(fetchedData);
          setError(null);
        }
      } catch (err) {
        console.error('[EloDistributionByOpening] Error fetching data:', err);
        if (isMounted) {
          setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const { chartData, labels, maxValue, fullLabels } = useMemo(() => {
    if (
      !data ||
      !Array.isArray(data.binLabels)
    ) {
      console.log('[EloDistributionByOpening] Chart data is null:', {
        hasData: !!data,
        binLabelsIsArray: Array.isArray(data?.binLabels)
      });
      return { chartData: null, labels: [], maxValue: 0 };
    }

    const { binLabels, openingCounts } = data;

    // Get all openings sorted by total count (frequency) and limit to maxOpenings
    const allOpenings = Object.entries(openingCounts)
      .map(([opening, counts]) => ({
        opening,
        counts: counts as number[],
        total: (counts as number[]).reduce((sum, count) => sum + count, 0)
      }))
      .filter(item => item.total > 0)
      .sort((itemA, itemB) => itemB.total - itemA.total)
      .slice(0, maxOpenings);

    if (allOpenings.length === 0) {
      console.log('[EloDistributionByOpening] No valid openings found');
      return { chartData: null, labels: [], maxValue: 0 };
    }

    // Create labels for the chart (opening names)
    const openingLabels = allOpenings.map(({ opening }) => opening);
    const fullOpeningLabels = allOpenings.map(({ opening }) => opening);
    // Calculate stacked data for histogram
    const stackedData = binLabels.map((_, binIndex) => {
      const binData = allOpenings.map(({ counts }) => counts[binIndex] || 0);
      return binData;
    });

    // Find max stacked value for scaling
    const maxStackedValue = Math.max(...stackedData.map(binData =>
      binData.reduce((sum, val) => sum + val, 0)
    ));

    const result = {
      chartData: { stackedData, binLabels, openings: allOpenings },
      labels: openingLabels,
      fullLabels: fullOpeningLabels,
      maxValue: maxStackedValue
    };
    
    console.log('[EloDistributionByOpening] Chart data processed:', result);
    return result;
  }, [data, maxOpenings]);

  useEffect(() => {
    if (!containerRef) { 
      console.log('[EloDistributionByOpening] Container ref not available');
      return; 
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      const newDimensions = {
        width: Math.max(width - 8, 800),
        height: 520
      };
      console.log('[EloDistributionByOpening] Setting dimensions:', newDimensions);
      setDimensions(newDimensions);
    });

    resizeObserver.observe(containerRef);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  // D3 rendering effect
  useEffect(() => {
    console.log('[EloDistributionByOpening] D3 render effect triggered:', {
      hasSvgRef: !!svgRef.current,
      hasChartData: !!chartData,
      labelsLength: labels.length,
      dimensionsWidth: dimensions.width,
      dimensionsHeight: dimensions.height
    });
    
    if (!svgRef.current || !chartData || !labels.length || dimensions.width === 0) {
      console.log('[EloDistributionByOpening] D3 render skipped - missing requirements');
      return;
    }
    
    console.log('[EloDistributionByOpening] Starting D3 render...');

    // Openings to show (by default all, or filtered by legend click)
    const shownOpenings = activeOpenings ? Array.from(activeOpenings) : labels;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartHeight = height || 520;
    const padding = { top: 30, right: 20, bottom: 80, left: 60 };
    const chartWidth = dimensions.width - padding.left - padding.right;
    const chartHeightInner = chartHeight - padding.top - padding.bottom;
    const { stackedData, binLabels } = chartData;

    // Color scale
    const baseColors = [
      '#fb923c', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
      '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
      '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316'
    ];
    const colors = d3.range(labels.length).map(i => i < baseColors.length ? baseColors[i] : d3.interpolateRainbow(i / labels.length));

    // Transform stackedData (number[][]) to array of objects for d3.stack
    // Each object: { [label]: value, ... } for each bin
    const stackInput = binLabels.map((_, binIdx) => {
      const obj: Record<string, number> = {};
      shownOpenings.forEach((label) => {
        const origIdx = labels.indexOf(label);
        obj[label] = stackedData[binIdx][origIdx] || 0;
      });
      return obj;
    });

    // Dynamic y-axis range: if only one opening, use its max; else use stacked max
    let yMax = maxValue;
    if (shownOpenings.length === 1) {
      const openingIdx = labels.indexOf(shownOpenings[0]);
      yMax = Math.max(...stackedData.map(bin => bin[openingIdx] || 0));
    }
    const y = d3.scaleLinear()
      .domain([0, yMax])
      .range([chartHeightInner, 0]);

    // X scale
    const x = d3.scaleBand()
      .domain(binLabels)
      .range([0, chartWidth])
      .paddingInner(0.1)
      .paddingOuter(0.05);

    // Stack generator
    const stack = d3.stack<Record<string, number>>()
      .keys(shownOpenings);
    const series = stack(stackInput);

    // Main group
    const mainGroup = svg.append('g')
      .attr('transform', `translate(${padding.left},${padding.top})`);

    // Draw bars
    mainGroup.selectAll('g.opening')
      .data(series)
      .join('g')
      .attr('class', 'opening')
      .attr('fill', (_, openingIdx) => colors[labels.indexOf(shownOpenings[openingIdx])])
      .selectAll('rect')
      .data(binStack => binStack)
      .join('rect')
      .attr('x', (_bin, binIdx) => x(binLabels[binIdx]) ?? 0)
      .attr('y', bin => y(bin[1]))
      .attr('height', bin => y(bin[0]) - y(bin[1]))
      .attr('width', x.bandwidth())
      .style('cursor', 'pointer')
      .on('mousemove', (event, bin) => {
        const target = event.currentTarget as SVGRectElement;
        const parent = target.parentNode as SVGGElement | null;
        let openingLabel = '';
        if (parent) {
          const datum = d3.select(parent).datum() as { key: string };
          openingLabel = datum.key;
        }
        const origIdx = labels.indexOf(openingLabel);
        const fullOpening = fullLabels[origIdx];
        let binIdx = -1;
        if (parent) {
          const children = Array.from(parent.children);
          binIdx = children.indexOf(target);
        }
        const elo = binLabels[binIdx];
        const count = Math.round(bin[1] - bin[0]);
        setTooltip({
          x: event.offsetX + padding.left,
          y: event.offsetY + padding.top - 20,
          html: `<div style='font-size:13px'><b>${fullOpening}</b><br/>ELO: <b>${elo}</b><br/>Count: <b>${count}</b></div>`
        });
      })
      .on('mouseleave', () => setTooltip(null));

    // X axis with limited labels
    const maxXLabels = 6; // Show maximum 6 labels
    const labelStep = Math.ceil(binLabels.length / maxXLabels);
    
    mainGroup.append('g')
      .attr('transform', `translate(0,${chartHeightInner})`)
      .call(d3.axisBottom(x).tickFormat((tickLabel, i) => {
        // Show every nth label based on labelStep
        return i % labelStep === 0 ? tickLabel as string : '';
      }))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Y axis
    mainGroup.append('g')
      .call(d3.axisLeft(y).ticks(5));

    // Axis labels
    svg.append('text')
      .attr('x', padding.left + chartWidth / 2)
      .attr('y', chartHeight - 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 13)
      .text('ELO Rating');
    // Dynamic y-axis label
    let yLabel = 'Players';
    if (shownOpenings.length === 1) {
      yLabel = shownOpenings[0];
    }
    svg.append('text')
      .attr('transform', `translate(20,${padding.top + chartHeightInner / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 13)
      .text(yLabel);
      
    console.log('[EloDistributionByOpening] D3 render completed successfully');
  }, [chartData, labels, fullLabels, dimensions, height, maxValue, activeOpenings]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{CHART_MESSAGES.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-red-400 italic">{CHART_MESSAGES.error}{error}</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{NO_DATA_MSG}</span>
      </div>
    );
  }

  if (chartData === null) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{CHART_MESSAGES.noData}</span>
      </div>
    );
  }
  const chartHeight = height || 520;
  const padding = { top: 30, right: 20, bottom: 80, left: 60 };
  
  const chartHeightInner = chartHeight - padding.top - padding.bottom;
  const baseColors = [
    '#fb923c', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
    '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316'
  ];
  const colors = d3.range(labels.length).map(i => i < baseColors.length ? baseColors[i] : d3.interpolateRainbow(i / labels.length));

  return (
    <div
      ref={setContainerRef}
      className="w-full h-fit min-h-[520px] relative"
    >
      {dimensions.width > 0 && (
        <div className="min-w-fit" style={{ position: 'relative' }}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={chartHeight}
            aria-label="ELO Distribution by Opening Histogram"
            style={{ display: 'block', width: '100%', border: '3px solid #ea580c', background: '#18181b' }}
          />
          {/* Legend positioned inside the chart area */}
          <div
            style={{
              position: 'absolute',
              right: padding.right + 10,
              top: padding.top + 10,
              maxHeight: Math.min(chartHeightInner - 20, 200),
              overflowY: 'auto',
              width: 160,
              background: 'rgba(30,41,59,0.95)',
              borderRadius: 8,
              border: '1px solid #ea580c',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              zIndex: 5,
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {labels.map((label, i) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: !activeOpenings || activeOpenings.has(label) ? 1 : 0.3,
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  padding: '1px 0',
                }}
                onClick={() => {
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
                    if (next.size === 0) {return null;}
                    return next;
                  });
                }}
                onDoubleClick={e => {
                  e.stopPropagation();
                  setActiveOpenings(new Set([label]));
                }}
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
                />
                <span style={{ color: '#ea580c', fontWeight: 500, fontSize: 11, lineHeight: 1.2 }}>{label}</span>
              </div>
            ))}
          </div>
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
                maxWidth: 220,
                whiteSpace: 'pre-line',
                textAlign: 'left',
              }}
              dangerouslySetInnerHTML={{ __html: tooltip.html }}
            />
          )}
        </div>
      )}
    </div>
  );
});

EloDistributionByOpening.displayName = 'EloDistributionByOpening';

export default EloDistributionByOpening;