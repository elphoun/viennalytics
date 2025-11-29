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

interface MovePairMatchupAnalysisProps {
  height?: number;
}

interface MoveData {
  moves: string[];
  popularity: number[][];
}

const MOVE_DATA_URL =
  "https://6sf2y06qu1484byz.public.blob.vercel-storage.com/move_popularity_heatmap.json";

const MovePairMatchupAnalysis: FC<MovePairMatchupAnalysisProps> = memo(
  ({ height = 520 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { containerRef, dimensions } = useChartResize(height);
    const [tooltip, setTooltip] = useState<{
      x: number;
      y: number;
      html: string;
    } | null>(null);

    const query = useChartQuery<MoveData>(
      ["movePairMatchupAnalysis"],
      MOVE_DATA_URL
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
          html: `<div style='font-size:13px'><b>${d.x} vs ${d.y}</b><br/>Popularity: <b>${d.value.toFixed(2)}</b></div>`,
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

      let moves: string[], popularity: number[][];
      if (
        data &&
        "matrix" in data &&
        "whiteLabels" in data &&
        "blackLabels" in data
      ) {
        moves = data.whiteLabels as string[];
        popularity = data.matrix as number[][];
      } else if (data && "moves" in data && "popularity" in data) {
        moves = data.moves;
        popularity = data.popularity;
      } else {
        return;
      }

      if (!moves?.length || !popularity?.length) {
        return;
      }

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

      const chartGroup = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      chartGroup
        .selectAll("rect")
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
        .join("rect")
        .attr("x", (d) => xScale(d.x) || 0)
        .attr("y", (d) => yScale(d.y) || 0)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", (d) => colorScale(d.value))
        .attr("stroke", CHART_COLORS.border)
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("mousemove", function (event, d) {
          d3.select(this).attr("stroke-width", 2);
          handleMouseMove(event, d);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("stroke-width", 0.5);
          handleMouseLeave();
        });

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
        .style("font-size", "10px");

      chartGroup
        .append("text")
        .attr(
          "transform",
          `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 20})`
        )
        .style("text-anchor", "middle")
        .style("fill", CHART_COLORS.primary)
        .style("font-size", "14px")
        .text("Move 1");

      chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - chartHeight / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", CHART_COLORS.primary)
        .style("font-size", "14px")
        .text("Move 2");

      svg
        .append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .attr("fill", CHART_COLORS.primary)
        .attr("font-size", "16px")
        .text("Move Pair Popularity Heatmap");

      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${dimensions.width - margin.right + 20}, ${margin.top})`
        );

      const legendScale = d3
        .scaleLinear()
        .domain([0, d3.max(popularity.flat()) || 1])
        .range([0, 100]);

      const legendAxis = d3
        .axisRight(legendScale)
        .ticks(5)
        .tickFormat(d3.format(".2f"));

      legend
        .append("g")
        .call(legendAxis)
        .selectAll("text")
        .style("fill", CHART_STYLES.axis.text.fill)
        .style("font-size", "10px");

      legend
        .append("text")
        .attr("x", 20)
        .attr("y", -10)
        .style("fill", CHART_COLORS.primary)
        .style("font-size", "12px")
        .text("Popularity");

    }, [isSuccess, isLoading, data, dimensions, height, handleMouseMove, handleMouseLeave]);

    if (isLoading) {
      return <ChartLoading message="Loading move data..." />;
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
        aria-label="Move Pair Matchup Analysis Chart"
      >
        <svg
          ref={svgRef}
          width={Math.max(dimensions.width, 800)}
          height={height}
          aria-label="Move Pair Matchup Analysis Heatmap"
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
  }
);

MovePairMatchupAnalysis.displayName = "MovePairMatchupAnalysis";

export default MovePairMatchupAnalysis;
