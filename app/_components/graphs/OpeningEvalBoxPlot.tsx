"use client";

import * as d3 from "d3";
import { FC, memo, useLayoutEffect, useRef, useState, useCallback } from "react";
import {
  CHART_COLORS,
  CHART_MARGINS,
  CHART_STYLES,
  ChartLoading,
  useChartQuery,
  useChartResize,
} from "./chartUtils";

interface OpeningEvalBoxPlotProps {
  height?: number;
}

interface EvalData {
  openings: string[];
  evaluations: number[][];
}

const EVAL_DATA_URL =
  "https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingEvalDistribution-zcNUCsOq3UAIfhJyxcC4g5SIcYvk1I.json";

const OpeningEvalBoxPlot: FC<OpeningEvalBoxPlotProps> = memo(
  ({ height = 520 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { containerRef, dimensions } = useChartResize(height);
    const [tooltip, setTooltip] = useState<{
      x: number;
      y: number;
      html: string;
    } | null>(null);

    const query = useChartQuery<EvalData>(
      ["openingEvalBoxPlot"],
      EVAL_DATA_URL,
    );
    const { data, isLoading, error, isSuccess } = query;

    const handleMouseLeave = useCallback(() => setTooltip(null), []);

    useLayoutEffect(() => {
      if (
        !isSuccess ||
        isLoading ||
        !svgRef.current ||
        !data ||
        dimensions.width <= 0 ||
        dimensions.height <= 0
      ) {
        return;
      }

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = CHART_MARGINS.medium;
      const chartWidth = dimensions.width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      let openings: string[], evaluations: number[][];
      if (
        data &&
        "whiteWins" in data &&
        "draws" in data &&
        "blackWins" in data
      ) {
        const whiteWins = (data.whiteWins as number[]) || [];
        const draws = (data.draws as number[]) || [];
        const blackWins = (data.blackWins as number[]) || [];
        openings = ["White Wins", "Draws", "Black Wins"];
        evaluations = [whiteWins, draws, blackWins];
      } else if (data && "openings" in data && "evaluations" in data) {
        openings = data.openings;
        evaluations = data.evaluations;
      } else {
        return;
      }

      if (!openings?.length || !evaluations?.length) {
        return;
      }

      const boxPlotData = evaluations.map((evals, i) => {
        const sorted = [...evals].sort((a, b) => a - b);
        const q1 = d3.quantile(sorted, 0.25) || 0;
        const q2 = d3.quantile(sorted, 0.5) || 0;
        const q3 = d3.quantile(sorted, 0.75) || 0;
        const iqr = q3 - q1;
        const lowerWhisker = Math.max(sorted[0], q1 - 1.5 * iqr);
        const upperWhisker = Math.min(
          sorted[sorted.length - 1],
          q3 + 1.5 * iqr,
        );

        return {
          opening: openings[i],
          q1,
          q2,
          q3,
          iqr,
          lowerWhisker,
          upperWhisker,
          outliers: sorted.filter((d) => d < lowerWhisker || d > upperWhisker),
        };
      });

      const xScale = d3
        .scaleBand()
        .domain(openings)
        .range([0, chartWidth])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([
          d3.min(boxPlotData, (d) => d.lowerWhisker) || 0,
          d3.max(boxPlotData, (d) => d.upperWhisker) || 0,
        ])
        .range([chartHeight, 0]);

      const chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xAxis = d3.axisBottom(xScale);
      chartGroup
        .append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("fill", CHART_STYLES.axis.text.fill)
        .style("font-size", "10px")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      const yAxis = d3.axisLeft(yScale);
      chartGroup
        .append("g")
        .call(yAxis)
        .selectAll("text")
        .style("fill", CHART_STYLES.axis.text.fill)
        .style("font-size", "12px");

      chartGroup
        .append("text")
        .attr(
          "transform",
          `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 20})`,
        )
        .style("text-anchor", "middle")
        .style("fill", CHART_COLORS.primary)
        .style("font-size", "14px")
        .text("Opening");

      chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - chartHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", CHART_COLORS.primary)
        .style("font-size", "14px")
        .text("Evaluation");

      boxPlotData.forEach((d) => {
        const x = xScale(d.opening) || 0;
        const width = xScale.bandwidth();

        chartGroup
          .append("line")
          .attr("x1", x + width / 2)
          .attr("x2", x + width / 2)
          .attr("y1", yScale(d.lowerWhisker))
          .attr("y2", yScale(d.upperWhisker))
          .attr("stroke", CHART_COLORS.primary)
          .attr("stroke-width", 2);

        chartGroup
          .append("rect")
          .attr("x", x + width * 0.1)
          .attr("y", yScale(d.q3))
          .attr("width", width * 0.8)
          .attr("height", yScale(d.q1) - yScale(d.q3))
          .attr("fill", CHART_COLORS.primary)
          .attr("stroke", CHART_COLORS.border)
          .attr("stroke-width", 1);

        chartGroup
          .append("line")
          .attr("x1", x + width * 0.1)
          .attr("x2", x + width * 0.9)
          .attr("y1", yScale(d.q2))
          .attr("y2", yScale(d.q2))
          .attr("stroke", CHART_COLORS.border)
          .attr("stroke-width", 2);

        d.outliers.forEach((outlier) => {
          chartGroup
            .append("circle")
            .attr("cx", x + width / 2)
            .attr("cy", yScale(outlier))
            .attr("r", 3)
            .attr("fill", CHART_COLORS.error)
            .attr("stroke", CHART_COLORS.border)
            .attr("stroke-width", 1);
        });
      });

      svg
        .append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", CHART_COLORS.primary)
        .attr("font-size", "16px")
        .text("Opening Evaluation Distribution");
    }, [isSuccess, isLoading, data, dimensions, height, handleMouseLeave]);

    if (isLoading) {
      return <ChartLoading message="Loading evaluation data..." />;
    }

    if (error) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-red-400 mb-2">
              Error loading data
            </div>
            <div className="text-sm text-gray-400">{error.message}</div>
          </div>
        </div>
      );
    }

    if (!isSuccess || !data) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4">
          <span className="text-gray-400 italic mb-4">No data available</span>
        </div>
      );
    }

    if (dimensions.width <= 0 || !containerRef.current) {
      return (
        <div
          ref={containerRef}
          className="w-full h-fit min-h-fit relative"
          style={{ height }}
        >
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-gray-400">Initializing chart...</span>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className="w-full h-fit min-h-fit relative"
        role="region"
        aria-label="Opening Evaluation Box Plot Chart"
      >
        <svg
          ref={svgRef}
          width={Math.max(dimensions.width, 800)}
          height={height}
          aria-label="Opening Evaluation Box Plot"
          style={{
            display: "block",
            border: "3px solid #ea580c",
            background: "#18181b",
          }}
        />
        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y,
              pointerEvents: "none",
              background: "rgba(30,41,59,0.97)",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 12px",
              boxShadow: "0 2px 8px #0002",
              zIndex: 10,
              fontFamily: "inherit",
              fontSize: 13,
              border: "1px solid #ea580c",
              minWidth: 120,
              maxWidth: 320,
              whiteSpace: "pre-line",
              textAlign: "left",
            }}
            dangerouslySetInnerHTML={{ __html: tooltip.html }}
            role="tooltip"
          />
        )}
      </div>
    );
  },
);

OpeningEvalBoxPlot.displayName = "OpeningEvalBoxPlot";

export default OpeningEvalBoxPlot;
