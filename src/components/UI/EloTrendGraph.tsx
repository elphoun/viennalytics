import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

const ELO_TREND_NO_DATA_MSG = "Elo trend data not available";

interface EloTrendData {
  date: string;
  elo: number;
}

interface EloTrendGraphProps {
  data: EloTrendData[];
  className?: string;
}

const EloTrendGraph: React.FC<EloTrendGraphProps> = ({
  data,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length === 0 || !svgRef.current || !containerRef.current) {
      return;
    }

    const renderChart = () => {
      // Clear previous content
      d3.select(svgRef.current).selectAll("*").remove();

      const container = containerRef.current;
      if (!container) { return; }

      const width = container.clientWidth;
      const height = container.clientHeight;

      const svg = d3.select(svgRef.current);
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      // Parse dates
      const parseDate = d3.timeParse("%Y-%m-%d");
      const processedData = data.map(dp => ({
        date: parseDate(dp.date)!,
        elo: dp.elo
      }));

      // Create scales
      const xScale = d3.scaleTime()
        .domain(d3.extent(processedData, dp => dp.date) as [Date, Date])
        .range([0, chartWidth]);

      const yScale = d3.scaleLinear()
        .domain([d3.min(processedData, dp => dp.elo)! - 50, d3.max(processedData, dp => dp.elo)! + 50])
        .range([chartHeight, 0]);

      // Create line generator
      const line = d3.line<{ date: Date, elo: number }>()
        .x(dp => xScale(dp.date))
        .y(dp => yScale(dp.elo))
        .curve(d3.curveMonotoneX);

      // Create chart group
      const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Add grid lines
      chart.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-chartHeight)
          .tickFormat(() => "")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

      chart.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
          .tickSize(-chartWidth)
          .tickFormat(() => "")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

      // Add the line path
      chart.append("path")
        .datum(processedData)
        .attr("fill", "none")
        .attr("stroke", "#8b5cf6")
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add data points
      chart.selectAll(".dot")
        .data(processedData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", dp => xScale(dp.date))
        .attr("cy", dp => yScale(dp.elo))
        .attr("r", 3)
        .attr("fill", "#8b5cf6")
        .attr("stroke", "white")
        .attr("stroke-width", 1);

      // Add axes
      chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale)
          .tickFormat((domainValue) => {
            if (domainValue instanceof Date) {
              return d3.timeFormat("%b")(domainValue);
            }
            return "";
          })
          .ticks(4)
        )
        .style("font-size", "10px")
        .style("color", "#6b7280");

      chart.append("g")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisLeft(yScale)
          .ticks(4)
          .tickFormat(val => `${val}`)
        )
        .style("font-size", "10px")
        .style("color", "#6b7280");
    };

    // Initial render
    renderChart();

    // Add resize listener
    const resizeObserver = new ResizeObserver(() => {
      renderChart();
    });

    resizeObserver.observe(containerRef.current);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full w-full ${className}`}>
        <span className="text-sm sm:text-base text-gray-600 text-center">
          {ELO_TREND_NO_DATA_MSG}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <svg
        ref={svgRef}
      />
    </div>
  );
};

export default EloTrendGraph; 