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

interface ChessOpeningClustersProps {
  height?: number;
}

interface ClusterData {
  openings: string[];
  winrates: number[];
  clusters: number[];
}

const CLUSTER_DATA_URL =
  "https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingWinrates-F6v81U2KqlmCJqkpF0Sfos6R1Ji0hJ.json";

const ChessOpeningClusters: FC<ChessOpeningClustersProps> = memo(
  ({ height = 520 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { containerRef, dimensions } = useChartResize(height);
    const [tooltip, setTooltip] = useState<{
      x: number;
      y: number;
      html: string;
    } | null>(null);

    const query = useChartQuery<ClusterData>(
      ["chessOpeningClusters"],
      CLUSTER_DATA_URL,
    );
    const { data, isLoading, error, isSuccess } = query;

    const handleMouseMove = useCallback(
      (event: MouseEvent, d: any) => {
        const rect = containerRef.current?.getBoundingClientRect();
        const clientX = event.clientX || 0;
        const clientY = event.clientY || 0;
        const left = rect
          ? Math.max(8, clientX - rect.left + CHART_MARGINS.medium.left)
          : clientX + CHART_MARGINS.medium.left;
        const top = rect
          ? Math.max(8, clientY - rect.top + CHART_MARGINS.medium.top - 20)
          : clientY + CHART_MARGINS.medium.top - 20;

        setTooltip({
          x: left,
          y: top,
          html: `<div style='font-size:13px'><b>${d.opening}</b><br/>Win Rate: <b>${d.winrate.toFixed(1)}%</b><br/>Cluster: <b>${d.cluster}</b></div>`,
        });
      },
      [containerRef]
    );

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

      let chartData;
      if (Array.isArray(data)) {
        chartData = data.map((item) => ({
          opening: item.opening || item.name || "Unknown",
          winrate: item.winrate || item.winRate || item.win_rate || 0,
          cluster: item.cluster || item.group || 0,
        }));
      } else if (data && data.openings && data.winrates && data.clusters) {
        chartData = data.openings.map((opening, i) => ({
          opening,
          winrate: data.winrates[i] || 0,
          cluster: data.clusters[i] || 0,
        }));
      } else {
        return;
      }

      if (!chartData?.length) {
        return;
      }

      const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);
      const yScale = d3.scaleLinear().domain([0, 100]).range([chartHeight, 0]);
      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      const chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xAxis = d3.axisBottom(xScale).ticks(10);
      chartGroup
        .append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("fill", CHART_STYLES.axis.text.fill)
        .style("font-size", CHART_STYLES.axis.text.fontSize);

      const yAxis = d3.axisLeft(yScale).ticks(10);
      chartGroup
        .append("g")
        .call(yAxis)
        .selectAll("text")
        .style("fill", CHART_STYLES.axis.text.fill)
        .style("font-size", CHART_STYLES.axis.text.fontSize);

      chartGroup
        .append("text")
        .attr(
          "transform",
          `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 10})`,
        )
        .style("text-anchor", "middle")
        .style("fill", CHART_COLORS.primary)
        .style("font-size", "14px")
        .text("Win Rate (%)");

      chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - chartHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", CHART_COLORS.primary)
        .style("font-size", "14px")
        .text("Win Rate (%)");

      chartGroup
        .selectAll("circle")
        .data(chartData)
        .join("circle")
        .attr("cx", (d) => xScale(d.winrate))
        .attr("cy", (d) => yScale(d.winrate))
        .attr("r", 6)
        .attr("fill", (d) => colorScale(d.cluster.toString()))
        .attr("stroke", CHART_COLORS.border)
        .attr("stroke-width", 1)
        .style("opacity", 0.8)
        .style("cursor", "pointer")
        .on("mousemove", function (event, d) {
          d3.select(this).style("opacity", 1).attr("r", 8);
          handleMouseMove(event, d);
        })
        .on("mouseleave", function () {
          d3.select(this).style("opacity", 0.8).attr("r", 6);
          handleMouseLeave();
        });

      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${dimensions.width - margin.right + 20}, ${margin.top})`,
        );

      const uniqueClusters = [...new Set(chartData.map((d) => d.cluster))].sort(
        (a, b) => a - b,
      );

      legend
        .selectAll("g")
        .data(uniqueClusters)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`)
        .each(function (d) {
          const g = d3.select(this);

          g.append("circle")
            .attr("r", 6)
            .attr("fill", colorScale(d.toString()))
            .attr("stroke", CHART_COLORS.border)
            .attr("stroke-width", 1);

          g.append("text")
            .attr("x", 15)
            .attr("y", 4)
            .style("fill", CHART_STYLES.axis.text.fill)
            .style("font-size", CHART_STYLES.axis.text.fontSize)
            .text(`Cluster ${d}`);
        });

    }, [isSuccess, isLoading, data, dimensions, height, handleMouseMove, handleMouseLeave]);

    if (isLoading) {
      return <ChartLoading message="Loading cluster data..." />;
    }

    if (error) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-red-400 mb-2">
              Error loading chart
            </div>
            <div className="text-sm text-gray-400">{error.message}</div>
            <div className="text-xs text-gray-500 mt-2">ChessOpeningClusters</div>
          </div>
        </div>
      );
    }

    if (!isSuccess || !data) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4">
          <span className="text-gray-400 italic mb-4">No cluster data available</span>
          <div className="text-xs text-gray-500">
            Success: {isSuccess ? 'Yes' : 'No'}, 
            Data: {data ? 'Yes' : 'No'}
          </div>
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
        aria-label="Chess Opening Clusters Chart"
      >
        <svg
          ref={svgRef}
          width={Math.max(dimensions.width, 800)}
          height={height}
          aria-label="Chess Opening Clusters Scatter Plot"
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

ChessOpeningClusters.displayName = "ChessOpeningClusters";

export default ChessOpeningClusters;
