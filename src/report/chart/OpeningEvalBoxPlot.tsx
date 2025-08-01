import * as d3 from 'd3';
import { useState, useEffect, useRef, useMemo } from 'react';

import localEvalData from '../../../backend/data/generated_data/opening_evaluation_distribution.json';

interface GameData {
  whiteWins: number[];
  draws: number[];
  blackWins: number[];
}

const CONTENT = {
  loading: "Loading...",
  error: "Error: ",
  noData: "No data available"
};

const COLORS = [
  { fill: '#22c55e', stroke: '#16a34a' },
  { fill: '#6b7280', stroke: '#4b5563' },
  { fill: '#ef4444', stroke: '#dc2626' }
];
const LABELS = ['White Wins', 'Draws', 'Black Wins'];

function OpeningEvalBoxPlot() {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip] = useState<{ x: number; y: number; html: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Use local static data for the chart
  useEffect(() => {
    setData(localEvalData as GameData);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!containerRef.current) { return; }

    // Set initial dimensions
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({
      width: Math.max(rect.width - 8, 600),
      height: 400
    });

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      setDimensions({
        width: Math.max(entry.contentRect.width - 8, 600),
        height: 400
      });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const boxData = useMemo(() => {
    if (!data) { return null; }
    const safeArr = (arr: unknown): number[] => Array.isArray(arr) ? arr.filter((value) => typeof value === 'number') : [];
    return [safeArr(data.whiteWins), safeArr(data.draws), safeArr(data.blackWins)];
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || !boxData || dimensions.width === 0) { return; }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 30, right: 30, bottom: 60, left: 60 };
    const width = dimensions.width;
    const height = 400;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Ensure we have valid dimensions
    if (chartWidth <= 0 || chartHeight <= 0) { return; }

    // Flatten all values for y scale
    const allValues = boxData.flat().filter(val => typeof val === 'number' && !isNaN(val));
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

    // Create box plots for each group
    boxData.forEach((arr, idx) => {
      if (!arr.length) { return; }

      const xBand = x(LABELS[idx]);
      if (xBand === undefined) { return; }

      const xCenter = xBand + x.bandwidth() / 2;
      const boxWidth = x.bandwidth() * 0.6;

      // Calculate quartiles
      const sortedData = arr.slice().sort((ia, ib) => ia - ib);
      const q1 = d3.quantile(sortedData, 0.25) || 0;
      const median = d3.quantile(sortedData, 0.5) || 0;
      const q3 = d3.quantile(sortedData, 0.75) || 0;
      const min = d3.min(sortedData) || 0;
      const max = d3.max(sortedData) || 0;

      // Draw box
      group.append('rect')
        .attr('x', xCenter - boxWidth / 2)
        .attr('y', y(q3))
        .attr('width', boxWidth)
        .attr('height', y(q1) - y(q3))
        .attr('fill', COLORS[idx].fill)
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', 2)
        .attr('opacity', 0.7);

      // Draw median line
      group.append('line')
        .attr('x1', xCenter - boxWidth / 2)
        .attr('x2', xCenter + boxWidth / 2)
        .attr('y1', y(median))
        .attr('y2', y(median))
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', 3);

      // Draw whiskers
      const whiskerWidth = boxWidth * 0.5;

      // Top whisker
      group.append('line')
        .attr('x1', xCenter)
        .attr('x2', xCenter)
        .attr('y1', y(q3))
        .attr('y2', y(max))
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', 2);

      group.append('line')
        .attr('x1', xCenter - whiskerWidth / 2)
        .attr('x2', xCenter + whiskerWidth / 2)
        .attr('y1', y(max))
        .attr('y2', y(max))
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', 2);

      // Bottom whisker
      group.append('line')
        .attr('x1', xCenter)
        .attr('x2', xCenter)
        .attr('y1', y(q1))
        .attr('y2', y(min))
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', 2);

      group.append('line')
        .attr('x1', xCenter - whiskerWidth / 2)
        .attr('x2', xCenter + whiskerWidth / 2)
        .attr('y1', y(min))
        .attr('y2', y(min))
        .attr('stroke', COLORS[idx].stroke)
        .attr('stroke-width', 2);
    });
  }, [boxData, dimensions]);

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
  if (!boxData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{CONTENT.noData}</span>
      </div>
    );
  }
  return (
    <div ref={containerRef} className="w-full h-fit min-h-[420px] relative">
      <svg
        ref={svgRef}
        width={dimensions.width || 600}
        height={400}
        aria-label="Opening Evaluation Distribution Box Plot"
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

export default OpeningEvalBoxPlot;
