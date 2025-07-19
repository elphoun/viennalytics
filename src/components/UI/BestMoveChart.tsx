import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';

const BEST_MOVE_NO_DATA_MSG = "Best move analysis not available";

interface BestMoveData {
  move: string;
  evaluation: number;
  frequency: number;
}

interface BestMoveChartProps {
  data: BestMoveData[];
  className?: string;
}

const BestMoveChart: React.FC<BestMoveChartProps> = ({
  data,
  className = ""
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.length === 0 || !svgRef.current || !containerRef.current) { return; }

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

      // Sort data by evaluation (best moves first)
      const sortedData = [...data].sort((moveA, moveB) => moveB.evaluation - moveA.evaluation);

      // Create scales
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(sortedData, bm => bm.evaluation)!])
        .range([0, chartWidth]);

      const yScale = d3.scaleBand()
        .domain(sortedData.map(bm => bm.move))
        .range([0, chartHeight])
        .padding(0.1);

      // Create chart group
      const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Add grid lines
      chart.append("g")
        .attr("class", "grid")
        .call(d3.axisBottom(xScale)
          .tickSize(-chartHeight)
          .tickFormat(() => "")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

      // Add bars
      chart.selectAll(".bar")
        .data(sortedData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", bm => yScale(bm.move)!)
        .attr("width", bm => xScale(bm.evaluation))
        .attr("height", yScale.bandwidth())
        .attr("fill", bm => {
          // Color gradient based on evaluation
          if (bm.evaluation > 0.5) {
            // Green for good moves
            return "#10b981";
          }
          if (bm.evaluation > 0) {
            // Yellow for neutral
            return "#f59e0b";
          }
          // Red for bad moves
          return "#ef4444";
        })
        .attr("rx", 2)
        .attr("ry", 2);

      // Add evaluation text on bars
      chart.selectAll(".eval-text")
        .data(sortedData)
        .enter().append("text")
        .attr("class", "eval-text")
        .attr("x", bm => xScale(bm.evaluation) + 5)
        .attr("y", bm => yScale(bm.move)! + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .style("fill", "white")
        .text(bm => bm.evaluation.toFixed(2));

      // Add axes
      chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(val => `${val}`)
        )
        .style("font-size", "10px")
        .style("color", "#6b7280");

      chart.append("g")
        .attr("transform", `translate(0,0)`)
        .call(d3.axisLeft(yScale))
        .style("font-size", "10px")
        .style("color", "#6b7280");

      // Add frequency indicators
      chart.selectAll(".freq-indicator")
        .data(sortedData)
        .enter().append("circle")
        .attr("class", "freq-indicator")
        .attr("cx", bm => xScale(bm.evaluation) + 5)
        .attr("cy", bm => yScale(bm.move)! + yScale.bandwidth() + 15)
        .attr("r", bm => Math.max(2, bm.frequency * 3))
        .attr("fill", "#8b5cf6")
        .attr("opacity", 0.7);
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
          {BEST_MOVE_NO_DATA_MSG}
        </span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="w-full h-full"
      />
    </div>
  );
};

export default BestMoveChart; 