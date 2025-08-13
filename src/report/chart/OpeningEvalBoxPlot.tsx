import * as d3 from 'd3';
import { useState, useEffect, useRef, useMemo } from 'react';
import { CHART_MESSAGES } from './Constants';

interface GameData {
  whiteWins: number[];
  draws: number[];
  blackWins: number[];
}

const CONTENT = CHART_MESSAGES;

const COLORS = [
  { fill: '#22c55e', stroke: '#16a34a' },
  { fill: '#6b7280', stroke: '#4b5563' },
  { fill: '#ef4444', stroke: '#dc2626' }
];
const LABELS = ['White Wins', 'Draws', 'Black Wins'];

function OpeningEvalViolinPlot() {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch data from remote URL with fallback
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[OpeningEvalViolinPlot] Starting data fetch...');
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingEvalDistribution-zcNUCsOq3UAIfhJyxcC4g5SIcYvk1I.json');
        console.log('[OpeningEvalViolinPlot] Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json() as GameData;
        console.log('[OpeningEvalViolinPlot] Raw fetched data:', fetchedData);
        console.log('[OpeningEvalViolinPlot] Data structure:', {
          whiteWins: Array.isArray(fetchedData?.whiteWins) ? fetchedData.whiteWins.length : 'not array',
          draws: Array.isArray(fetchedData?.draws) ? fetchedData.draws.length : 'not array',
          blackWins: Array.isArray(fetchedData?.blackWins) ? fetchedData.blackWins.length : 'not array'
        });

        if (isMounted) {
          setData(fetchedData);
          setError(null);
        }
      } catch (err) {
        console.error('[OpeningEvalViolinPlot] Error fetching data:', err);
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

  useEffect(() => {
    const initializeDimensions = () => {
      if (!containerRef.current) { 
        console.log('[OpeningEvalViolinPlot] Container ref not available, retrying...');
        setTimeout(initializeDimensions, 100);
        return; 
      }

      const rect = containerRef.current.getBoundingClientRect();
      const newDimensions = {
        width: Math.max(rect.width - 8, 800),
        height: 520
      };
      console.log('[OpeningEvalViolinPlot] Setting dimensions:', newDimensions);
      setDimensions(newDimensions);

      const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        const resizedDimensions = {
          width: Math.max(entry.contentRect.width - 8, 800),
          height: 520
        };
        console.log('[OpeningEvalViolinPlot] Resizing dimensions:', resizedDimensions);
        setDimensions(resizedDimensions);
      });
      resizeObserver.observe(containerRef.current);
    };

    initializeDimensions();
  }, []);

  const violinData = useMemo(() => {
    if (!data) { 
      console.log('[OpeningEvalViolinPlot] Violin data is null, no data available');
      return null; 
    }
    const safeArr = (arr: unknown): number[] => Array.isArray(arr) ? arr.filter((value) => typeof value === 'number') : [];
    const result = [safeArr(data.whiteWins), safeArr(data.draws), safeArr(data.blackWins)];
    console.log('[OpeningEvalViolinPlot] Violin data processed:', {
      whiteWins: result[0].length,
      draws: result[1].length,
      blackWins: result[2].length
    });
    return result;
  }, [data]);

  useEffect(() => {
    console.log('[OpeningEvalViolinPlot] D3 render effect triggered:', {
      hasSvgRef: !!svgRef.current,
      hasViolinData: !!violinData,
      dimensionsWidth: dimensions.width,
      dimensionsHeight: dimensions.height
    });
    
    if (!svgRef.current || !violinData || dimensions.width === 0) { 
      console.log('[OpeningEvalViolinPlot] D3 render skipped - missing requirements');
      return; 
    }
    
    

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 30, right: 30, bottom: 60, left: 60 };
    const width = dimensions.width;
    const height = 520;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Ensure we have valid dimensions
    if (chartWidth <= 0 || chartHeight <= 0) { return; }

    // Flatten all values for y scale
    const allValues = violinData.flat().filter(val => typeof val === 'number' && !isNaN(val));
    if (allValues.length === 0) { return; }

    const y = d3.scaleLinear()
      .domain(d3.extent(allValues) as [number, number])
      .nice()
      .range([chartHeight, 0]);

    const x = d3.scaleBand()
      .domain(LABELS)
      .range([0, chartWidth])
      .padding(0.4);

    const group = svg.append('g').attr('transform', `translate(${padding.left},${padding.top})`);

    // Draw axes with proper styling
    const xAxis = group.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));

    xAxis.selectAll('text')
      .attr('fill', '#ea580c')
      .attr('font-size', 12);

    xAxis.selectAll('path, line')
      .attr('stroke', '#ea580c');

    const yAxis = group.append('g')
      .call(d3.axisLeft(y).ticks(8));

    yAxis.selectAll('text')
      .attr('fill', '#ea580c')
      .attr('font-size', 12);

    yAxis.selectAll('path, line')
      .attr('stroke', '#ea580c');

    // Axis labels
    svg.append('text')
      .attr('x', padding.left + chartWidth / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 13)
      .text('Game Result');

    svg.append('text')
      .attr('transform', `translate(20,${padding.top + chartHeight / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 13)
      .text('Opening Evaluation (centipawns)');

    // Kernel density estimation functions
    function kernelDensityEstimator(kernel: (v: number) => number, X: number[]) {
      return function(V: number[]) {
        return X.map(function(x) {
          return [x, d3.mean(V, function(v) { return kernel(x - v); }) || 0] as [number, number];
        });
      };
    }

    function kernelEpanechnikov(k: number) {
      return function(v: number) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
      };
    }

    // Create violin plots for each group
    violinData.forEach((arr, idx) => {
      if (!arr.length) { return; }

      const xBand = x(LABELS[idx]);
      if (xBand === undefined) { return; }

      const xCenter = xBand + x.bandwidth() / 2;
      const violinWidth = x.bandwidth() * 0.8;

      // Calculate statistics for reference lines
      const sortedData = arr.slice().sort((ia, ib) => ia - ib);
      const median = d3.quantile(sortedData, 0.5) || 0;
      const q1 = d3.quantile(sortedData, 0.25) || 0;
      const q3 = d3.quantile(sortedData, 0.75) || 0;

      // Create kernel density estimation
      const kde = kernelDensityEstimator(kernelEpanechnikov(7), y.ticks(40));
      const density = kde(arr);

      // Scale density values to fit within violin width
      const maxDensity = d3.max(density, d => d[1]) || 1;
      const xScale = d3.scaleLinear()
        .domain([0, maxDensity])
        .range([0, violinWidth / 2]);

      // Create the violin shape using area generator
      const area = d3.area<[number, number]>()
        .x0(d => xCenter - xScale(d[1]))
        .x1(d => xCenter + xScale(d[1]))
        .y(d => y(d[0]))
        .curve(d3.curveBasis);

      // Draw the violin shape with interactivity
      const violinPath = group.append('path')
        .datum(density)
        .attr('d', area)
        .attr('fill', COLORS[idx].fill)
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', 1.5)
        .attr('opacity', highlightedIndex === null || highlightedIndex === idx ? 0.7 : 0.3)
        .style('cursor', 'pointer')
        .on('mouseenter', function(event) {
          setHighlightedIndex(idx);
          
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            const tooltipContent = `
              <strong>${LABELS[idx]}</strong><br/>
              Data points: ${arr.length.toLocaleString()}<br/>
              Median: ${median.toFixed(1)} cp<br/>
              Q1: ${q1.toFixed(1)} cp<br/>
              Q3: ${q3.toFixed(1)} cp<br/>
              Range: ${Math.min(...arr).toFixed(1)} to ${Math.max(...arr).toFixed(1)} cp
            `;
            
            setTooltip({
              x: event.clientX - rect.left + 10,
              y: event.clientY - rect.top - 10,
              html: tooltipContent
            });
          }
        })
        .on('mouseleave', function() {
          setHighlightedIndex(null);
          setTooltip(null);
        });

      // Draw median line with highlighting
      group.append('line')
        .attr('x1', xCenter - violinWidth / 4)
        .attr('x2', xCenter + violinWidth / 4)
        .attr('y1', y(median))
        .attr('y2', y(median))
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', highlightedIndex === idx ? 4 : 3)
        .attr('opacity', highlightedIndex === null || highlightedIndex === idx ? 1 : 0.4);

      // Draw quartile lines with highlighting
      group.append('line')
        .attr('x1', xCenter - violinWidth / 6)
        .attr('x2', xCenter + violinWidth / 6)
        .attr('y1', y(q1))
        .attr('y2', y(q1))
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', highlightedIndex === idx ? 2 : 1.5)
        .attr('opacity', highlightedIndex === null || highlightedIndex === idx ? 0.6 : 0.2);

      group.append('line')
        .attr('x1', xCenter - violinWidth / 6)
        .attr('x2', xCenter + violinWidth / 6)
        .attr('y1', y(q3))
        .attr('y2', y(q3))
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', highlightedIndex === idx ? 2 : 1.5)
        .attr('opacity', highlightedIndex === null || highlightedIndex === idx ? 0.6 : 0.2);
    });

    // Cleanup function
    return () => {
      setTooltip(null);
      setHighlightedIndex(null);
    };
  }, [violinData, dimensions, highlightedIndex]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{CONTENT.loading}</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-red-400 italic">{CONTENT.error}{error}</span>
      </div>
    );
  }
  if (!violinData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{CONTENT.noData}</span>
      </div>
    );
  }
  return (
    <div ref={containerRef} className="w-full h-fit min-h-[520px] relative">
      <svg
        ref={svgRef}
        width={dimensions.width || 800}
        height={520}
        aria-label="Opening Evaluation Distribution Violin Plot"
        style={{ display: 'block', width: '100%', border: '3px solid #ea580c', background: '#18181b' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            pointerEvents: 'none',
            color: '#fff',
            backgroundColor: '#1f2937',
            borderRadius: 8,
            padding: '6px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
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
  );
}

export default OpeningEvalViolinPlot;
