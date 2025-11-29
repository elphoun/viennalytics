"use client";

import { Player } from "@/app/types";
import * as d3 from "d3";
import { ReactElement, memo, useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  CHART_COLORS,
  CHART_STYLES,
  ChartLoading,
  useChartResize,
} from "./chartUtils";

interface EloBarChartProps {
  eloData: Player[];
  height?: number;
}

interface EloRangeData {
  range: string;
  count: number;
  rangeStart: number;
  names: string[];
}

const EloBarChart = memo(({ eloData, height = 400 }: EloBarChartProps): ReactElement => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, dimensions } = useChartResize(height);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    html: string;
  } | null>(null);

  const groupByEloRange = useCallback((players: Player[]): EloRangeData[] => {
    // Validate input data
    if (!Array.isArray(players)) return [];

    const ranges: Record<string, number> = {};

    players.forEach((player) => {
      if (
        !player ||
        typeof player !== "object" ||
        typeof player.name !== "string" ||
        typeof player.elo !== "number" ||
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
        const startA = parseInt(rangeA.split("-")[0], 10);
        const startB = parseInt(rangeB.split("-")[0], 10);
        return startA - startB;
      })
      .map((range) => ({
        range,
        count: ranges[range],
        rangeStart: parseInt(range.split("-")[0], 10),
        names: players
          .filter((p) => {
            if (
              !p ||
              typeof p !== "object" ||
              typeof p.name !== "string" ||
              typeof p.elo !== "number" ||
              isNaN(p.elo)
            ) {
              return false; // Skip invalid players
            }
            const rs = Math.floor(p.elo / 100) * 100;
            return `${rs}-${rs + 99}` === range;
          })
          .map((p) => String(p.name)), // Ensure names are strings
      }));
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent, d: EloRangeData) => {
      const rect = containerRef.current?.getBoundingClientRect();
      const clientX = event.clientX || 0;
      const clientY = event.clientY || 0;
      const left = rect
        ? Math.max(8, clientX - rect.left + 60)
        : clientX + 60;
      const top = rect
        ? Math.max(8, clientY - rect.top + 20 - 20)
        : clientY + 20 - 20;

      const maxNames = 12;
      const names = Array.isArray(d.names)
        ? d.names.filter((name) => typeof name === "string")
        : [];
      const shown = names
        .slice(0, maxNames)
        .map((n) => `• ${n}`)
        .join("<br>");
      const more =
        names.length > maxNames
          ? `<br>and ${names.length - maxNames} more...`
          : "";

      setTooltip({
        x: left,
        y: top,
        html: `<div style='font-size:13px'><b>${d.range}</b><br/>Players: <b>${d.count}</b>${names.length ? "<br><br>" + shown + more : ""}</div>`,
      });
    },
    [containerRef]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  useLayoutEffect(() => {
    if (
      !svgRef.current ||
      !containerRef.current ||
      dimensions.width <= 0 ||
      dimensions.height <= 0 ||
      !Array.isArray(eloData)
    ) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = dimensions.width;
    const chartHeight = height;

    const margin = { top: 20, right: 20, bottom: 100, left: 60 };
    const chartWidth = Math.max(100, width - margin.left - margin.right);
    const innerHeight = Math.max(
      200,
      chartHeight - margin.top - margin.bottom - 15,
    );

    const data = groupByEloRange(eloData);

      const maxCount = Math.max(1, d3.max(data, (d) => d.count) || 0);

      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.range))
        .range([0, chartWidth])
        .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([innerHeight, 0]);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("role", "group")
      .attr("aria-label", "ELO distribution chart");

    chartGroup
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => xScale(d.range) ?? 0)
      .attr("y", (d) => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.count))
      .attr("fill", CHART_COLORS.primary)
      .attr("stroke", CHART_COLORS.border)
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .attr("role", "button")
      .attr("tabindex", "0")
      .attr("aria-label", (d) => `${d.range} ELO range: ${d.count} players`)
      .on("mousemove", function (event, d) {
        handleMouseMove(event, d);
      })
      .on("mouseleave", function () {
        handleMouseLeave();
      });

    chartGroup
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr("role", "group")
      .attr("aria-label", "ELO ranges")
      .selectAll("text")
      .style("fill", CHART_STYLES.axis.text.fill)
      .style("font-size", Math.max(9, Math.min(13, chartWidth / 36)) + "px")
      .style("font-family", "inherit")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .attr("dy", "0.25em");

    chartGroup
      .append("g")
      .call(d3.axisLeft(yScale).ticks(Math.min(6, maxCount)))
      .attr("role", "group")
      .attr("aria-label", "Player count")
      .selectAll("text")
      .style("fill", CHART_STYLES.axis.text.fill)
      .style("font-size", "11px")
      .style("font-family", "inherit");

    chartGroup.selectAll(".domain").style("stroke", "#4B5563");
    chartGroup.selectAll(".tick line").style("stroke", "#4B5563");

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - margin.left)
      .attr("x", 0 - innerHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", CHART_COLORS.primary)
      .style("font-size", "12px")
      .style("font-family", "inherit")
      .text("Number of Players");

    chartGroup
      .append("text")
      .attr(
        "transform",
        `translate(${chartWidth / 2}, ${innerHeight + margin.bottom - 22})`,
      )
      .style("text-anchor", "middle")
      .style("fill", CHART_COLORS.primary)
      .style("font-size", "12px")
      .style("font-family", "inherit")
      .text("ELO Range");
  }, [eloData, dimensions, height, groupByEloRange, handleMouseMove, handleMouseLeave]);

  if (!Array.isArray(eloData) || eloData.length === 0) {
    return <ChartLoading message="Loading ELO data..." />;
  }

  if (dimensions.width <= 0) {
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
      aria-label="ELO distribution bar chart"
    >
      <svg
        ref={svgRef}
        width={Math.max(dimensions.width, 800)}
        height={height}
        aria-label="ELO Distribution Bar Chart"
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
});

EloBarChart.displayName = "EloBarChart";

EloBarChart.displayName = "EloBarChart";

export default EloBarChart;
