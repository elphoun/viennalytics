'use client';

import * as d3 from 'd3';
import { FC, memo, useLayoutEffect, useRef } from 'react';
import {
  CHART_COLORS,
  CHART_MARGINS,
  CHART_STYLES,
  ChartLoading,
  ChartNoData,
  useChartQuery,
  useChartResize,
  useChartState,
} from './chartUtils';

// ─ Types ────────────────────────────────────────────────────────────────────────────────────────

interface OpeningEvalBoxPlotProps {
  height?: number;
}

interface EvalData {
  openings: string[];
  evaluations: number[][];
}

// ─ Data Fetching ──────────────────────────────────────────────────────────────────────────────────

const EVAL_DATA_URL =
  'https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingEvalDistribution-zcNUCsOq3UAIfhJyxcC4g5SIcYvk1I.json';

// ─ Component ──────────────────────────────────────────────────────────────────────────────────────

const OpeningEvalBoxPlot: FC<OpeningEvalBoxPlotProps> = memo(
  ({ height = 520 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { containerRef, dimensions } = useChartResize(height);

    const query = useChartQuery<EvalData>(
      ['openingEvalBoxPlot'],
      EVAL_DATA_URL
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

      const { openings, evaluations } = data;

      // Validate data structure
      if (
        !openings ||
        !evaluations ||
        !Array.isArray(openings) ||
        !Array.isArray(evaluations) ||
        openings.length === 0 ||
        evaluations.length === 0
      ) {
        console.warn('Invalid data structure for OpeningEvalBoxPlot:', data);
        return;
      }

      // Calculate statistics for each opening
      const boxPlotData = evaluations.map((evals, i) => {
        const sorted = evals.sort((a, b) => a - b);
        const q1 = d3.quantile(sorted, 0.25) || 0;
        const q2 = d3.quantile(sorted, 0.5) || 0;
        const q3 = d3.quantile(sorted, 0.75) || 0;
        const iqr = q3 - q1;
        const lowerWhisker = Math.max(sorted[0], q1 - 1.5 * iqr);
        const upperWhisker = Math.min(
          sorted[sorted.length - 1],
          q3 + 1.5 * iqr
        );

        return {
          opening: openings[i],
          q1,
          q2,
          q3,
          iqr,
          lowerWhisker,
          upperWhisker,
          outliers: sorted.filter(d => d < lowerWhisker || d > upperWhisker),
        };
      });

      // Create scales
      const xScale = d3
        .scaleBand()
        .domain(openings)
        .range([0, chartWidth])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([
          d3.min(boxPlotData, d => d.lowerWhisker) || 0,
          d3.max(boxPlotData, d => d.upperWhisker) || 0,
        ])
        .range([chartHeight, 0]);

      // Create chart group
      const chartGroup = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

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
        .style('font-size', '12px');

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
        .text('Opening');

      chartGroup
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - chartHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', CHART_COLORS.primary)
        .style('font-size', '14px')
        .text('Evaluation');

      // Draw box plots
      boxPlotData.forEach((d, _i) => {
        const x = xScale(d.opening) || 0;
        const width = xScale.bandwidth();

        // Whiskers
        chartGroup
          .append('line')
          .attr('x1', x + width / 2)
          .attr('x2', x + width / 2)
          .attr('y1', yScale(d.lowerWhisker))
          .attr('y2', yScale(d.upperWhisker))
          .attr('stroke', CHART_COLORS.primary)
          .attr('stroke-width', 2);

        // Box
        chartGroup
          .append('rect')
          .attr('x', x + width * 0.1)
          .attr('y', yScale(d.q3))
          .attr('width', width * 0.8)
          .attr('height', yScale(d.q1) - yScale(d.q3))
          .attr('fill', CHART_COLORS.primary)
          .attr('stroke', CHART_COLORS.border)
          .attr('stroke-width', 1);

        // Median line
        chartGroup
          .append('line')
          .attr('x1', x + width * 0.1)
          .attr('x2', x + width * 0.9)
          .attr('y1', yScale(d.q2))
          .attr('y2', yScale(d.q2))
          .attr('stroke', CHART_COLORS.border)
          .attr('stroke-width', 2);

        // Outliers
        d.outliers.forEach(outlier => {
          chartGroup
            .append('circle')
            .attr('cx', x + width / 2)
            .attr('cy', yScale(outlier))
            .attr('r', 3)
            .attr('fill', CHART_COLORS.error)
            .attr('stroke', CHART_COLORS.border)
            .attr('stroke-width', 1);
        });
      });

      // Add title
      svg
        .append('text')
        .attr('x', dimensions.width / 2)
        .attr('y', 25)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_COLORS.primary)
        .attr('font-size', '16px')
        .text('Opening Evaluation Distribution');
    }, [shouldRender, data, dimensions, height]);

    // ─ Render States ──────────────────────────────────────────────────────────────────────────────

    if (isLoading) {
      return <ChartLoading message='Loading evaluation data...' />;
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
        aria-label='Opening Evaluation Box Plot Chart'
      >
        {dimensions.width > 0 && (
          <svg
            ref={svgRef}
            width={Math.max(dimensions.width, 800)}
            height={height}
            aria-label='Opening Evaluation Box Plot'
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

OpeningEvalBoxPlot.displayName = 'OpeningEvalBoxPlot';

export default OpeningEvalBoxPlot;
