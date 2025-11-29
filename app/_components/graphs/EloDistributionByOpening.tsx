"use client";

import * as d3 from "d3";
import {
  FC,
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CHART_COLORS,
  CHART_STYLES,
  ChartLoading,
  useChartQuery,
  useChartResize,
} from "./chartUtils";

const DEFAULT_HEIGHT = 500;
const DEFAULT_MAX_OPENINGS = 10;
const MIN_CHART_WIDTH = 500;
const MIN_CHART_HEIGHT = 500;
const LEGEND_WIDTH = 240;
const PADDING = {
  top: 30,
  right: 20,
  bottom: 80,
  left: 60,
};
const MAX_X_LABELS = 6;
const TOOLTIP_MIN_WIDTH = 120;
const TOOLTIP_MAX_WIDTH = 320;
const LEGEND_MAX_HEIGHT = 400;

const BASE_COLORS = [
  "#fb923c",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
];

const ELO_DATA_URL =
  "https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingUsagebyELO-mp8Bv10TiZ7jhqE1XPb4JQeAMBKi8R.json";

interface EloDistributionByOpeningProps {
  height?: number;
  maxOpenings?: number;
}

interface EloData {
  bins: string[];
  opening_counts: Record<string, number[]>;
  bin_size: number;
}

interface ChartData {
  stackedData: number[][];
  binLabels: string[];
  openings: Array<{ opening: string; counts: number[]; total: number }>;
}

interface ProcessedData {
  chartData: ChartData | null;
  labels: string[];
  fullLabels: string[];
  maxValue: number;
}

const EloDistributionByOpening: FC<EloDistributionByOpeningProps> = memo(
  ({ height = DEFAULT_HEIGHT, maxOpenings = DEFAULT_MAX_OPENINGS }) => {
    const { containerRef, dimensions } = useChartResize(height, 300, 100);
    const svgRef = useRef<SVGSVGElement>(null);
    const [activeOpenings, setActiveOpenings] = useState<Set<string> | null>(
      null
    );
    const [tooltip, setTooltip] = useState<{
      x: number;
      y: number;
      html: string;
    } | null>(null);

    const query = useChartQuery<EloData>(
      ["eloDistributionByOpening"],
      ELO_DATA_URL
    );
    const { data, isLoading, error, isSuccess } = query;

    const processedData = useMemo((): ProcessedData => {
      if (!data || !isSuccess) {
        return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
      }

      const { bins, opening_counts } = data;

      if (
        !bins?.length ||
        !opening_counts ||
        typeof opening_counts !== "object"
      ) {
        return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
      }

      const allOpenings = Object.entries(opening_counts)
        .filter(([, counts]) => Array.isArray(counts) && counts.length > 0)
        .map(([opening, counts]) => ({
          opening,
          counts: counts as number[],
          total: (counts as number[]).reduce(
            (sum, count) => sum + (count || 0),
            0
          ),
        }))
        .filter((item) => item.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, maxOpenings);

      if (allOpenings.length === 0) {
        return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
      }

      const labels = allOpenings.map(({ opening }) => opening);
      const stackedData = bins.map((_, binIndex) =>
        allOpenings.map(({ counts }) => counts[binIndex] || 0)
      );

      const maxValue = Math.max(
        ...stackedData.map((binData) =>
          binData.reduce((sum, val) => sum + val, 0)
        )
      );

      return {
        chartData: { stackedData, binLabels: bins, openings: allOpenings },
        labels,
        fullLabels: labels,
        maxValue,
      };
    }, [data, maxOpenings, isSuccess]);

    const { chartData, labels, fullLabels, maxValue } = processedData;

    const handleMouseMove = useCallback(
      (
        event: MouseEvent,
        bin: [number, number],
        openingLabel: string,
        binIdx: number
      ) => {
        const fullOpening = fullLabels[labels.indexOf(openingLabel)];
        const elo = chartData?.binLabels[binIdx];
        const count = Math.round(bin[1] - bin[0]);

        const rect = containerRef.current?.getBoundingClientRect();
        const clientX = event.clientX || 0;
        const clientY = event.clientY || 0;
        const left = rect
          ? Math.max(8, clientX - rect.left + PADDING.left)
          : clientX + PADDING.left;
        const top = rect
          ? Math.max(8, clientY - rect.top + PADDING.top - 20)
          : clientY + PADDING.top - 20;

        setTooltip({
          x: left,
          y: top,
          html: `<div style='font-size:13px'><b>${fullOpening}</b><br/>ELO: <b>${elo}</b><br/>Count: <b>${count}</b></div>`,
        });
      },
      [chartData?.binLabels, fullLabels, labels, containerRef]
    );

    const handleMouseLeave = useCallback(() => setTooltip(null), []);

    const handleLegendClick = useCallback(
      (label: string) => {
        setActiveOpenings((prev) => {
          if (!prev) {
            return new Set(labels.filter((lbl) => lbl !== label));
          }
          const next = new Set(prev);
          if (next.has(label)) {
            next.delete(label);
          } else {
            next.add(label);
          }
          return next.size === 0 ? null : next;
        });
      },
      [labels]
    );

    const handleLegendDoubleClick = useCallback((label: string) => {
      setActiveOpenings(new Set([label]));
    }, []);

    useLayoutEffect(() => {
      if (
        !isSuccess ||
        isLoading ||
        !svgRef.current ||
        !chartData ||
        !labels.length ||
        dimensions.width <= 0 ||
        dimensions.height <= 0
      ) {
        return;
      }

      const shownOpenings = activeOpenings
        ? Array.from(activeOpenings)
        : labels;
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const chartWidth = dimensions.width - PADDING.left - PADDING.right;
      const chartHeightInner = height - PADDING.top - PADDING.bottom;
      const { stackedData, binLabels } = chartData;

      const colors = d3
        .scaleOrdinal<number, string>()
        .domain(d3.range(labels.length))
        .range(
          BASE_COLORS.concat(
            d3
              .range(Math.max(0, labels.length - BASE_COLORS.length))
              .map((i) =>
                d3.interpolateRainbow((i + BASE_COLORS.length) / labels.length)
              )
          )
        );

      const stackInput = binLabels.map((_, binIdx) => {
        const obj: Record<string, number> = {};
        shownOpenings.forEach((label) => {
          const origIdx = labels.indexOf(label);
          obj[label] = stackedData[binIdx]?.[origIdx] || 0;
        });
        return obj;
      });

      let yMax = maxValue;
      if (shownOpenings.length === 1) {
        const openingIdx = labels.indexOf(shownOpenings[0]);
        yMax = Math.max(...stackedData.map((bin) => bin[openingIdx] || 0));
      }

      const xScale = d3
        .scaleBand()
        .domain(binLabels)
        .range([0, chartWidth])
        .paddingInner(0.1)
        .paddingOuter(0.05);

      const yScale = d3
        .scaleLinear()
        .domain([0, yMax])
        .range([chartHeightInner, 0]);

      const stack = d3.stack<Record<string, number>>().keys(shownOpenings);

      const series = stack(stackInput);

      const mainGroup = svg
        .append("g")
        .attr("transform", `translate(${PADDING.left},${PADDING.top})`);

      mainGroup
        .selectAll("g.opening")
        .data(series)
        .join("g")
        .attr("class", "opening")
        .attr("fill", (d, i) => colors(labels.indexOf(shownOpenings[i])))
        .selectAll("rect")
        .data((d) => d)
        .join("rect")
        .attr("x", (_, binIdx) => xScale(binLabels[binIdx]) || 0)
        .attr("y", (d) => yScale(d[1]))
        .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
        .attr("width", xScale.bandwidth())
        .attr("stroke", CHART_COLORS.border)
        .attr("stroke-width", 0.5)
        .style("cursor", "pointer")
        .on("mousemove", function (event, d) {
          const element = this as SVGRectElement;
          const parent = element.parentNode;
          if (!parent) return;

          const svgParent = parent as SVGGElement;
          const datum = d3.select(svgParent).datum() as { key: string };
          const binIdx = Array.from(svgParent.children).indexOf(element);
          const dataPoint: [number, number] = [d[0], d[1]];
          handleMouseMove(event, dataPoint, datum.key, binIdx);
        });

      const labelStep = Math.ceil(binLabels.length / MAX_X_LABELS);

      const xAxis = d3
        .axisBottom(xScale)
        .tickFormat((d, i) => (i % labelStep === 0 ? (d as string) : ""));

      mainGroup
        .append("g")
        .attr("transform", `translate(0,${chartHeightInner})`)
        .call(xAxis)
        .selectAll("text")
        .style("fill", CHART_STYLES.axis.text.fill)
        .style("font-size", "11px")
        .style("font-family", "inherit")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      const yAxis = d3.axisLeft(yScale).ticks(5);
      mainGroup.append("g").call(yAxis);

      svg
        .append("text")
        .attr("x", PADDING.left + chartWidth / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .attr("fill", CHART_COLORS.primary)
        .attr("font-size", 13)
        .text("ELO Rating");

      const yLabel = shownOpenings.length === 1 ? shownOpenings[0] : "Players";
      svg
        .append("text")
        .attr(
          "transform",
          `translate(20,${PADDING.top + chartHeightInner / 2}) rotate(-90)`
        )
        .attr("text-anchor", "middle")
        .attr("fill", CHART_COLORS.primary)
        .attr("font-size", 13)
        .text(yLabel);
    }, [
      isSuccess,
      isLoading,
      chartData,
      labels,
      fullLabels,
      dimensions,
      dimensions.width,
      dimensions.height,
      height,
      maxValue,
      activeOpenings,
      handleMouseMove,
      handleMouseLeave,
    ]);

    if (isLoading) {
      return <ChartLoading message="Loading ELO distribution data..." />;
    }

    if (error) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-red-400 mb-2">Error loading chart</div>
            <div className="text-sm text-gray-400">{error.message}</div>
            <div className="text-xs text-gray-500 mt-2">EloDistributionByOpening</div>
          </div>
        </div>
      );
    }

    if (!isSuccess || !chartData || !labels.length) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-4">
          <span className="text-gray-400 italic mb-4">No ELO distribution data available</span>
          <div className="text-xs text-gray-500">
            Success: {isSuccess ? 'Yes' : 'No'}, 
            Data: {chartData ? 'Yes' : 'No'}, 
            Labels: {labels.length}
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

    const colors = d3
      .scaleOrdinal<number, string>()
      .domain(d3.range(labels.length))
      .range(
        BASE_COLORS.concat(
          d3
            .range(Math.max(0, labels.length - BASE_COLORS.length))
            .map((i) =>
              d3.interpolateRainbow((i + BASE_COLORS.length) / labels.length)
            )
        )
      );

    return (
      <div
        ref={containerRef}
        className="w-full h-fit min-h-fit relative"
        role="region"
        aria-label="ELO Distribution by Opening Chart"
      >
        <div
          className="flex-1 w-full overflow-y-hidden scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-slate-800 absolute"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#ea580c rgba(30,41,59,0.3)",
          }}
        >
          <svg
            ref={svgRef}
            width={Math.max(dimensions.width, MIN_CHART_WIDTH)}
            height={Math.max(dimensions.height, MIN_CHART_HEIGHT)}
            aria-label="ELO Distribution by Opening Histogram"
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
                minWidth: TOOLTIP_MIN_WIDTH,
                maxWidth: TOOLTIP_MAX_WIDTH,
                whiteSpace: "pre-line",
                textAlign: "left",
              }}
              dangerouslySetInnerHTML={{ __html: tooltip.html }}
              role="tooltip"
            />
          )}
        </div>

        <div
          style={{
            position: "absolute",
            right: 20,
            top: 20,
            maxHeight: LEGEND_MAX_HEIGHT,
            overflowY: "auto",
            overflowX: "hidden",
            width: LEGEND_WIDTH,
            background: "rgba(30,41,59,0.95)",
            borderRadius: 8,
            border: "1px solid #ea580c",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            zIndex: 5,
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            scrollbarWidth: "thin",
            scrollbarColor: "#ea580c rgba(30,41,59,0.3)",
          }}
          className="scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-slate-700"
          role="listbox"
          aria-label="Opening legend"
        >
          {labels.map((label, i) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: !activeOpenings || activeOpenings.has(label) ? 1 : 0.3,
                cursor: "pointer",
                userSelect: "none",
                fontSize: 11,
                fontFamily: "inherit",
                padding: "2px 4px",
                borderRadius: 4,
                minWidth: 0,
              }}
              title={label}
              onClick={() => handleLegendClick(label)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleLegendDoubleClick(label);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLegendClick(label);
                }
              }}
              role="option"
              tabIndex={0}
              aria-selected={!activeOpenings || activeOpenings.has(label)}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: colors(i),
                  border: "1px solid #fff3",
                  marginRight: 6,
                  flexShrink: 0,
                }}
                aria-hidden="true"
              />
              <span
                style={{
                  color: "#ea580c",
                  fontWeight: 500,
                  fontSize: 11,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

EloDistributionByOpening.displayName = "EloDistributionByOpening";

export default EloDistributionByOpening;
