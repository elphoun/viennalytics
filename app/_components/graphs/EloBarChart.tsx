// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { Player } from '@/app/types';
import * as d3 from 'd3';
import { ReactElement, memo, useCallback, useEffect, useRef } from 'react';
import {
  CHART_COLORS,
  CHART_STYLES,
  removeTooltips,
  useChartResize,
} from './chartUtils';

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────

interface EloBarChartProps {
  eloData: Player[];
}

interface EloRangeData {
  range: string;
  count: number;
  rangeStart: number;
  names: string[];
}

// ─ Component ──────────────────────────────────────────────────────────────────────────────────────

/**
 * EloBarChart component displays a bar chart showing the distribution of players across ELO ranges.
 * Groups players into 100-point ELO ranges and visualizes the count in each range using D3.
 * @param eloData - Array of player objects with name and ELO rating
 */
const EloBarChart = memo(({ eloData }: EloBarChartProps): ReactElement => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartResize(400, 200, 100);

  const groupByEloRange = useCallback((players: Player[]): EloRangeData[] => {
    // Validate input data
    if (!Array.isArray(players)) return [];

    const ranges: Record<string, number> = {};

    players.forEach(player => {
      if (
        !player ||
        typeof player !== 'object' ||
        typeof player.name !== 'string' ||
        typeof player.elo !== 'number' ||
        isNaN(player.elo)
      ) {
        return;
      }

      const rangeStart = Math.floor(player.elo / 100) * 100;
      const rangeEnd = rangeStart + 99;
      const rangeKey = `${rangeStart}-${rangeEnd}`;

      if (!ranges[rangeKey]) {
        ranges[rangeKey] = 0;
      }
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
        rangeStart: parseInt(range.split('-')[0], 10),
        names: players
          .filter(p => {
            if (
              !p ||
              typeof p !== 'object' ||
              typeof p.name !== 'string' ||
              typeof p.elo !== 'number' ||
              isNaN(p.elo)
            ) {
              return false; // Skip invalid players
            }
            const rs = Math.floor(p.elo / 100) * 100;
            return `${rs}-${rs + 99}` === range;
          })
          .map(p => String(p.name)), // Ensure names are strings
      }));
  }, []);

  // ─ Chart Rendering ────────────────────────────────────────────────────────────────────────────

  const renderChart = useCallback(() => {
    if (!svgRef.current || !containerRef.current || dimensions.width === 0)
      return;

    const svg = d3.select(svgRef.current);

    // Remove existing tooltips
    removeTooltips();

    // Create tooltip with better accessibility
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'elo-chart-tooltip')
      .style('position', 'fixed')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', '#F3F4F6')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('font-family', 'Electrolize, sans-serif')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000)
      .style('border', '1px solid #ea580c')
      .style('max-width', '300px')
      .attr('role', 'tooltip');

    const draw = () => {
      if (!svgRef.current || !containerRef.current) return;

      svg.selectAll('*').remove();

      const width = dimensions.width;
      const height = dimensions.height;

      const margin = { top: 20, right: 20, bottom: 100, left: 60 };
      const chartWidth = Math.max(100, width - margin.left - margin.right);
      const chartHeight = Math.max(
        200,
        height - margin.top - margin.bottom - 15
      );

      const data = groupByEloRange(eloData);

      const maxCount = Math.max(1, d3.max(data, d => d.count) || 0);

      const xScale = d3
        .scaleBand()
        .domain(data.map(d => d.range))
        .range([0, chartWidth])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, maxCount])
        .range([chartHeight, 0]);

      const chartGroup = svg
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .attr('role', 'group')
        .attr('aria-label', 'ELO distribution chart');

      // Add bars with improved accessibility and performance
      chartGroup
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('x', d => xScale(d.range) ?? 0)
        .attr('y', chartHeight) // start collapsed
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .attr('fill', CHART_COLORS.primary)
        .attr('stroke', CHART_COLORS.border)
        .attr('stroke-width', 1.5)
        .attr('role', 'button')
        .attr('tabindex', '0')
        .attr('aria-label', d => `${d.range} ELO range: ${d.count} players`)
        .on('mouseenter', (event, d) => {
          const maxNames = 12;
          const names = Array.isArray(d.names)
            ? d.names.filter(name => typeof name === 'string')
            : [];
          const shown = names
            .slice(0, maxNames)
            .map(n => `&bull; ${n}`)
            .join('<br>');
          const more =
            names.length > maxNames
              ? `<br>and ${names.length - maxNames} more...`
              : '';

          tooltip
            .html(
              `<b>${d.range}</b><br>Players: ${d.count}${names.length ? '<br><br>' + shown + more : ''}`
            )
            .style('opacity', 1);
          const x = (event as MouseEvent).clientX + 12;
          const y = (event as MouseEvent).clientY + 6;
          tooltip.style('left', `${x}px`).style('top', `${y}px`);
        })
        .on('mousemove', event => {
          const x = (event as MouseEvent).clientX + 12;
          const y = (event as MouseEvent).clientY + 6;
          tooltip.style('left', `${x}px`).style('top', `${y}px`);
        })
        .on('mouseleave', () => {
          tooltip.style('opacity', 0);
        })
        .on('focus', (event, d) => {
          const maxNames = 12;
          const names = Array.isArray(d.names)
            ? d.names.filter(name => typeof name === 'string')
            : [];
          const shown = names
            .slice(0, maxNames)
            .map(n => `&bull; ${n}`)
            .join('<br>');
          const more =
            names.length > maxNames
              ? `<br>and ${names.length - maxNames} more...`
              : '';

          tooltip
            .html(
              `<b>${d.range}</b><br>Players: ${d.count}${names.length ? '<br><br>' + shown + more : ''}`
            )
            .style('opacity', 1);
          const x = (event as MouseEvent).clientX + 12;
          const y = (event as MouseEvent).clientY + 6;
          tooltip.style('left', `${x}px`).style('top', `${y}px`);
        })
        .on('blur', () => {
          tooltip.style('opacity', 0);
        });

      // Apply final positions immediately (avoid d3.transition() errors in some builds)
      chartGroup
        .selectAll('rect')
        .attr('y', (d: any) => yScale(d.count))
        .attr('height', (d: any) => chartHeight - yScale(d.count));

      // Add axes with accessibility
      chartGroup
        .append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .attr('role', 'group')
        .attr('aria-label', 'ELO ranges')
        .selectAll('text')
        .style('fill', CHART_STYLES.axis.text.fill)
        .style('font-size', Math.max(9, Math.min(13, chartWidth / 36)) + 'px')
        .style('font-family', 'Electrolize, sans-serif')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.5em')
        .attr('dy', '0.25em');

      chartGroup
        .append('g')
        .call(d3.axisLeft(yScale).ticks(Math.min(6, maxCount)))
        .attr('role', 'group')
        .attr('aria-label', 'Player count')
        .selectAll('text')
        .style('fill', CHART_STYLES.axis.text.fill)
        .style('font-size', '11px')
        .style('font-family', 'Electrolize, sans-serif');

      chartGroup.selectAll('.domain').style('stroke', '#4B5563');

      chartGroup.selectAll('.tick line').style('stroke', '#4B5563');

      // Add axis labels with better positioning
      chartGroup
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 10 - margin.left)
        .attr('x', 0 - chartHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', CHART_COLORS.textLight)
        .style('font-size', '12px')
        .style('font-family', 'Electrolize, sans-serif')
        .text('Number of Players');

      chartGroup
        .append('text')
        .attr(
          'transform',
          `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 22})`
        )
        .style('text-anchor', 'middle')
        .style('fill', CHART_COLORS.textLight)
        .style('font-size', '12px')
        .style('font-family', 'Electrolize, sans-serif')
        .text('ELO Range');
    };

    draw();

    return () => {
      tooltip.remove();
    };
  }, [
    eloData,
    dimensions.width,
    dimensions.height,
    groupByEloRange,
    containerRef,
  ]);

  // Use effect to trigger chart rendering — depend on primitive dimension values
  useEffect(() => {
    const cleanup = renderChart();
    if (typeof cleanup === 'function') return cleanup;
    return undefined;
  }, [renderChart, dimensions.width, dimensions.height, eloData]);

  return (
    <div
      ref={containerRef}
      className='h-full w-full border border-gray-600/50 rounded-lg content-scrollbar'
      role='region'
      aria-label='ELO distribution bar chart'
    >
      <svg ref={svgRef} className='w-full h-full' />
    </div>
  );
});

EloBarChart.displayName = 'EloBarChart';

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default EloBarChart;
