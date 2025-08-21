'use client';

import * as d3 from 'd3';
import { FC, memo, useLayoutEffect, useRef } from 'react';
import {
  CHART_COLORS,
  CHART_MARGINS,
  CHART_STYLES,
  ChartLoading,
  ChartNoData,
  createTooltip,
  removeTooltips,
  useChartQuery,
  useChartResize,
  useChartState,
} from './chartUtils';

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────

interface MovePairMatchupAnalysisProps {
  height?: number;
}

interface MoveData {
  moves: string[];
  popularity: number[][];
}

// ─ Data Fetching ──────────────────────────────────────────────────────────────────────────────────

const MOVE_DATA_URL =
  'https://6sf2y06qu1484byz.public.blob.vercel-storage.com/move_popularity_heatmap.json';

// ─ Component ──────────────────────────────────────────────────────────────────────────────────────

const MovePairMatchupAnalysis: FC<MovePairMatchupAnalysisProps> = memo(
  ({ height = 520 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { containerRef, dimensions } = useChartResize(height);

    const query = useChartQuery<MoveData>(
      ['movePairMatchupAnalysis'],
      MOVE_DATA_URL
    );

    const { data, isLoading, error, isSuccess, shouldRender } = useChartState(
      query,
      dimensions
    );

    // ─ Chart Rendering ────────────────────────────────────────────────────────────────────────────

    useLayoutEffect(() => {
      if (!shouldRender || !svgRef.current || !data) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const margin = CHART_MARGINS.large;
      const chartWidth = dimensions.width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const { moves, popularity } = data;

      // Validate data structure
      if (
        !moves ||
        !popularity ||
        !Array.isArray(moves) ||
        !Array.isArray(popularity) ||
        moves.length === 0 ||
        popularity.length === 0
      ) {
        console.warn(
          'Invalid data structure for MovePairMatchupAnalysis:',
          data
        );
        return;
      }

      // Create scales
      const xScale = d3
        .scaleBand()
        .domain(moves)
        .range([0, chartWidth])
        .padding(0.01);

      const yScale = d3
        .scaleBand()
        .domain(moves)
        .range([0, chartHeight])
        .padding(0.01);

      const colorScale = d3
        .scaleSequential()
        .domain([0, d3.max(popularity.flat()) || 1])
        .interpolator(d3.interpolateBlues);

      // Create chart group
      const chartGroup = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add heatmap cells
      chartGroup
        .selectAll('rect')
        .data(
          popularity.flatMap((row, i) =>
            row.map((value, j) => ({
              value,
              x: moves[j],
              y: moves[i],
              i,
              j,
            }))
          )
        )
        .join('rect')
        .attr('x', d => xScale(d.x) || 0)
        .attr('y', d => yScale(d.y) || 0)
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(d.value))
        .attr('stroke', CHART_COLORS.border)
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          d3.select(this).attr('stroke-width', 2);

          const tooltip = createTooltip(
            `<strong>${d.x} vs ${d.y}</strong><br/>Popularity: ${d.value.toFixed(2)}`,
            event.pageX,
            event.pageY
          );
          document.body.appendChild(tooltip);
        })
        .on('mouseleave', function () {
          d3.select(this).attr('stroke-width', 0.5);
          removeTooltips();
        });

      // Add axes
      chartGroup
        .append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', CHART_STYLES.axis.text.fill)
        .style('font-size', '10px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      chartGroup
        .append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('fill', CHART_STYLES.axis.text.fill)
        .style('font-size', '10px');

      // Add axis labels
      chartGroup
        .append('text')
        .attr(
          'transform',
          `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 20})`
        )
        .style('text-anchor', 'middle')
        .style('fill', CHART_COLORS.primary)
        .style('font-size', '14px')
        .text('Move 1');

      chartGroup
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - chartHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', CHART_COLORS.primary)
        .style('font-size', '14px')
        .text('Move 2');

      // Add title
      svg
        .append('text')
        .attr('x', dimensions.width / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.primary)
        .attr('font-size', '16px')
        .text('Move Pair Popularity Heatmap');

      // Add color legend
      const legend = svg
        .append('g')
        .attr(
          'transform',
          `translate(${dimensions.width - margin.right + 20}, ${margin.top})`
        );

      const legendScale = d3
        .scaleLinear()
        .domain([0, d3.max(popularity.flat()) || 1])
        .range([0, 100]);

      const legendAxis = d3
        .axisRight(legendScale)
        .ticks(5)
        .tickFormat(d3.format('.2f'));

      legend
        .append('g')
        .call(legendAxis)
        .selectAll('text')
        .style('fill', CHART_STYLES.axis.text.fill)
        .style('font-size', '10px');

      // Add legend title
      legend
        .append('text')
        .attr('x', 20)
        .attr('y', -10)
        .style('fill', CHART_COLORS.primary)
        .style('font-size', '12px')
        .text('Popularity');

      // Cleanup function
      return () => {
        removeTooltips();
      };
    }, [shouldRender, data, dimensions, height]);

    // ─ Render States ──────────────────────────────────────────────────────────────────────────────

    if (isLoading) {
      return <ChartLoading message='Loading move data...' />;
    }

    if (error) {
      return (
        <div className='h-full w-full flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-lg font-semibold text-red-400 mb-2'>
              Error loading data
            </div>
            <div className='text-sm text-gray-400'>{error.message}</div>
          </div>
        </div>
      );
    }

    if (!isSuccess || !data) {
      return <ChartNoData />;
    }

    // ─ Main Render ────────────────────────────────────────────────────────────────────────────────

    return (
      <div
        ref={containerRef}
        className='w-full h-fit min-h-[520px] relative'
        role='region'
        aria-label='Move Pair Matchup Analysis Chart'
      >
        {dimensions.width > 0 && (
          <svg
            ref={svgRef}
            width={Math.max(dimensions.width, 800)}
            height={height}
            aria-label='Move Pair Matchup Analysis Heatmap'
            style={{
              display: 'block',
              border: '3px solid #ea580c',
              background: '#18181b',
            }}
          />
        )}
      </div>
    );
  }
);

MovePairMatchupAnalysis.displayName = 'MovePairMatchupAnalysis';

export default MovePairMatchupAnalysis;
