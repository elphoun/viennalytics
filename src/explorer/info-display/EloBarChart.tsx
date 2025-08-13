// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import * as d3 from 'd3';
import { memo, ReactElement, useEffect, useRef } from 'react';

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────
interface PlayerElo {
  name: string;
  elo: number;
}

interface EloBarChartProps {
  eloData: PlayerElo[];
}

interface EloRangeData {
  range: string;
  count: number;
  rangeStart: number;
}

/**
 * EloBarChart component displays a bar chart showing the distribution of players across ELO ranges.
 * Groups players into 100-point ELO ranges and visualizes the count in each range using D3.
 * @param eloData - Array of player objects with name and ELO rating
 */
const EloBarChart = memo(({ eloData }: EloBarChartProps): ReactElement => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const groupByEloRange = (players: PlayerElo[]): EloRangeData[] => {
    const ranges: Record<string, number> = {};

    players.forEach(player => {
      const rangeStart = Math.floor(player.elo / 100) * 100;
      const rangeEnd = rangeStart + 99;
      const rangeKey = `${rangeStart}-${rangeEnd}`;

      ranges[rangeKey] = (ranges[rangeKey] || 0) + 1;
    });

    return Object.keys(ranges)
      .sort((rangeA, rangeB) => {
        const startA = parseInt(rangeA.split('-')[0], 10);
        const startB = parseInt(rangeB.split('-')[0], 10);
        return startA - startB;
      })
      .map(range => ({
        range,
        count: ranges[range],
        rangeStart: parseInt(range.split('-')[0], 10)
      }));
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || eloData.length === 0) { return; }

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;

    // Clear previous chart
    svg.selectAll('*').remove();

    // Get container dimensions
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;

    // Set up margins
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom - 15; // Reduce chart height to make room

    // Process data
    const data = groupByEloRange(eloData);

    // Set up scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.range))
      .range([0, chartWidth])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) || 0])
      .range([chartHeight, 0]);

    // Create main group
    const chartGroup = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid lines
    chartGroup.selectAll('.grid-line')
      .data(yScale.ticks())
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#4B5563')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.7);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'elo-chart-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', '#F3F4F6')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('font-family', 'Electrolize, sans-serif')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Add bars
    chartGroup.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.range) || 0)
      .attr('y', chartHeight - 5) // Start bars at x-axis position
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .attr('fill', '#FB923C')
      .attr('stroke', '#EA580C')
      .attr('stroke-width', 1.5)
      .on('mouseover', (event, d) => {
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(`<b>${d.range}</b><br>Players: ${d.count}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`);
      })
      .on('mouseout', () => {
        tooltip.transition().duration(200).style('opacity', 0);
      })
      .transition()
      .duration(800)
      .attr('y', d => yScale(d.count))
      .attr('height', d => (chartHeight - 5) - yScale(d.count));

    // Add X axis
    chartGroup.append('g')
      .attr('transform', `translate(0,${chartHeight - 5})`) // Move x-axis closer to bars
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('fill', '#D1D5DB')
      .style('font-size', '8px')
      .style('font-family', 'Electrolize, sans-serif')

    // Add Y axis
    chartGroup.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('fill', '#D1D5DB')
      .style('font-size', '11px')
      .style('font-family', 'Electrolize, sans-serif');

    // Style axis lines
    chartGroup.selectAll('.domain')
      .style('stroke', '#4B5563');

    chartGroup.selectAll('.tick line')
      .style('stroke', '#4B5563');

    // Add axis labels
    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (chartHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#F9FAFB')
      .style('font-size', '12px')
      .style('font-family', 'Electrolize, sans-serif')
      .text('Number of Players');

    chartGroup.append('text')
      .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 20})`)
      .style('text-anchor', 'middle')
      .style('fill', '#F9FAFB')
      .style('font-size', '12px')
      .style('font-family', 'Electrolize, sans-serif')
      .text('ELO Range');

    // Cleanup function
    return () => {
      d3.selectAll('.elo-chart-tooltip').remove();
    };
  }, [eloData]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[200px] border border-gray-600/50 rounded-lg p-2 sm:p-4 content-scrollbar"
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
});

EloBarChart.displayName = "EloBarChart";

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default EloBarChart;