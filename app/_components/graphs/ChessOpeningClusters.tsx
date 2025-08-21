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

interface ChessOpeningClustersProps {
  height?: number;
}

interface ClusterData {
  openings: string[];
  winrates: number[];
  clusters: number[];
}

// ─ Data Fetching ──────────────────────────────────────────────────────────────────────────────────

const CLUSTER_DATA_URL =
  'https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingWinrates-F6v81U2KqlmCJqkpF0Sfos6R1Ji0hJ.json';

// ─ Component ──────────────────────────────────────────────────────────────────────────────────────

const ChessOpeningClusters: FC<ChessOpeningClustersProps> = memo(
  ({ height = 520 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { containerRef, dimensions } = useChartResize(height);

    const query = useChartQuery<ClusterData>(
      ['chessOpeningClusters'],
      CLUSTER_DATA_URL
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

      const margin = CHART_MARGINS.medium;
      const chartWidth = dimensions.width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const { openings, winrates, clusters } = data;

      // Validate data structure
      if (
        !openings ||
        !winrates ||
        !clusters ||
        !Array.isArray(openings) ||
        !Array.isArray(winrates) ||
        !Array.isArray(clusters) ||
        openings.length === 0 ||
        winrates.length === 0 ||
        clusters.length === 0
      ) {
        console.warn('Invalid data structure for ChessOpeningClusters:', data);
        return;
      }

      // Create scales
      const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);
      const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      // Create chart group
      const chartGroup = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Add axes
      chartGroup
        .append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale).ticks(10))
        .selectAll('text')
        .style('fill', CHART_STYLES.axis.text.fill)
        .style('font-size', CHART_STYLES.axis.text.fontSize);

      chartGroup
        .append('g')
        .call(d3.axisLeft(yScale).ticks(10))
        .selectAll('text')
        .style('fill', CHART_STYLES.axis.text.fill)
        .style('font-size', CHART_STYLES.axis.text.fontSize);

      // Add axis labels
      chartGroup
        .append('text')
        .attr(
          'transform',
          `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 10})`
        )
        .style('text-anchor', 'middle')
        .style('fill', CHART_COLORS.primary)
        .style('font-size', '14px')
        .text('Win Rate (%)');

      chartGroup
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - chartHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', CHART_COLORS.primary)
        .style('font-size', '14px')
        .text('Win Rate (%)');

      // Add scatter plot points
      chartGroup
        .selectAll('circle')
        .data(
          openings.map((opening, i) => ({
            opening,
            winrate: winrates[i] || 0,
            cluster: clusters[i] || 0,
          }))
        )
        .join('circle')
        .attr('cx', d => xScale(d.winrate))
        .attr('cy', d => yScale(d.winrate))
        .attr('r', 6)
        .attr('fill', d => colorScale(d.cluster.toString()))
        .attr('stroke', CHART_COLORS.border)
        .attr('stroke-width', 1)
        .style('opacity', 0.8)
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          d3.select(this).style('opacity', 1).attr('r', 8);

          const tooltip = createTooltip(
            `<strong>${d.opening}</strong><br/>Win Rate: ${d.winrate.toFixed(1)}%<br/>Cluster: ${d.cluster}`,
            event.pageX,
            event.pageY
          );
          document.body.appendChild(tooltip);
        })
        .on('mouseleave', function () {
          d3.select(this).style('opacity', 0.8).attr('r', 6);
          removeTooltips();
        });

      // Add legend
      const legend = svg
        .append('g')
        .attr(
          'transform',
          `translate(${dimensions.width - margin.right + 20}, ${margin.top})`
        );

      const uniqueClusters = [...new Set(clusters)].sort((a, b) => a - b);

      legend
        .selectAll('g')
        .data(uniqueClusters)
        .join('g')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`)
        .each(function (d) {
          const g = d3.select(this);

          g.append('circle')
            .attr('r', 6)
            .attr('fill', colorScale(d.toString()))
            .attr('stroke', CHART_COLORS.border)
            .attr('stroke-width', 1);

          g.append('text')
            .attr('x', 15)
            .attr('y', 4)
            .style('fill', CHART_STYLES.axis.text.fill)
            .style('font-size', CHART_STYLES.axis.text.fontSize)
            .text(`Cluster ${d}`);
        });

      // Cleanup function
      return () => {
        removeTooltips();
      };
    }, [shouldRender, data, dimensions, height]);

    // ─ Render States ──────────────────────────────────────────────────────────────────────────────

    if (isLoading) {
      return <ChartLoading message='Loading cluster data...' />;
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
        aria-label='Chess Opening Clusters Chart'
      >
        {dimensions.width > 0 && (
          <svg
            ref={svgRef}
            width={Math.max(dimensions.width, 800)}
            height={height}
            aria-label='Chess Opening Clusters Scatter Plot'
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

ChessOpeningClusters.displayName = 'ChessOpeningClusters';

export default ChessOpeningClusters;
