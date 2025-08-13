import { useState, useEffect, useRef, memo } from 'react';
import * as d3 from 'd3';
import { CHART_MESSAGES } from './Constants';

const MovePairMatchupAnalysis = memo(() => {
  const [data, setData] = useState<number[][]>([]);
  const [whiteMovesLabels, setWhiteMovesLabels] = useState<string[]>([]);
  const [blackMovesLabels, setBlackMovesLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string } | null>(null);

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true);


      try {
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/move_popularity_heatmap.json');


        if (response.ok) {
          const fetchedData = await response.json();
          console.log('[MovePairMatchupAnalysis] Raw fetched data:', fetchedData);

          // Handle the move_popularity_heatmap.json format
          if (Array.isArray(fetchedData)) {
            // Direct array format - use default labels
            const defaultWhiteMoves = ['e4', 'd4', 'Nf3', 'c4', 'b3', 'f4', 'g3', 'b4', 'a3', 'd3', 'Nc3', 'e3', 'c3', 'h3', 'g4', 'a4', 'h4', 'f3'];
            const defaultBlackMoves = ['e5', 'e6', 'd5', 'd6', 'Nf6', 'c5', 'c6', 'g6', 'Nc6', 'f5', 'Be7', 'Bb4', 'a6', 'h6', 'b6', 'a5', 'h5', 'f6'];

            setData(fetchedData);
            setWhiteMovesLabels(defaultWhiteMoves.slice(0, fetchedData[0]?.length || 0));
            setBlackMovesLabels(defaultBlackMoves.slice(0, fetchedData.length));
            setError(null);
            setLoading(false);
            return;

          } else if (fetchedData?.matrix && Array.isArray(fetchedData.matrix)) {
            // Object format with matrix property
            const matrixData = fetchedData.matrix;

            // Check for new format with separate white/black labels
            if (fetchedData.whiteLabels && fetchedData.blackLabels) {
              console.log('[MovePairMatchupAnalysis] Using new format with separate labels');
              console.log('[MovePairMatchupAnalysis] White labels:', fetchedData.whiteLabels);
              console.log('[MovePairMatchupAnalysis] Black labels:', fetchedData.blackLabels);

              setWhiteMovesLabels(fetchedData.whiteLabels);
              setBlackMovesLabels(fetchedData.blackLabels);
              setData(matrixData);
              setError(null);
              setLoading(false);
              return;

            } else if (fetchedData.labels) {
              // Legacy format with single labels array (symmetric matrix)
              console.log('[MovePairMatchupAnalysis] Using legacy format with single labels');
              setWhiteMovesLabels(fetchedData.labels);
              setBlackMovesLabels(fetchedData.labels);
              setData(matrixData);
              setError(null);
              setLoading(false);
              return;

            } else {
              // No labels provided, use defaults
              const defaultWhiteMoves = ['e4', 'd4', 'Nf3', 'c4', 'b3', 'f4', 'g3', 'b4', 'a3', 'd3', 'Nc3', 'e3', 'c3', 'h3', 'g4', 'a4', 'h4', 'f3'];
              const defaultBlackMoves = ['e5', 'e6', 'd5', 'd6', 'Nf6', 'c5', 'c6', 'g6', 'Nc6', 'f5', 'Be7', 'Bb4', 'a6', 'h6', 'b6', 'a5', 'h5', 'f6'];

              setData(matrixData);
              setWhiteMovesLabels(defaultWhiteMoves.slice(0, matrixData[0]?.length || 0));
              setBlackMovesLabels(defaultBlackMoves.slice(0, matrixData.length));
              setError(null);
              setLoading(false);
              return;
            }

          } else {
            throw new Error('Invalid data format: expected array or object with matrix property');
          }
        } else {
          throw new Error('No data received from server');
        }
      } catch (err) {
        
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const initializeDimensions = () => {
      if (!containerRef.current) {
        setTimeout(initializeDimensions, 100);
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const newDimensions = {
        width: Math.max(rect.width - 16, 800),
        height: 520
      };
      setDimensions(newDimensions);

      const resizeObserver = new ResizeObserver(() => {
        const resizedDimensions = {
          width: Math.max(containerRef.current!.getBoundingClientRect().width - 16, 800),
          height: 520
        };
        setDimensions(resizedDimensions);
      });
      resizeObserver.observe(containerRef.current);
    };

    initializeDimensions();
  }, []);

  // D3 rendering effect
  useEffect(() => {
    if (!svgRef.current || !data.length || dimensions.width === 0 || !whiteMovesLabels.length || !blackMovesLabels.length) {
      return;
    }



    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 40, right: 120, bottom: 80, left: 80 };
    const width = dimensions.width;
    const height = dimensions.height;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (chartWidth <= 0 || chartHeight <= 0) { return; }

    // Calculate cell dimensions
    const cellWidth = chartWidth / whiteMovesLabels.length;
    const cellHeight = chartHeight / blackMovesLabels.length;

    // Find data range for better color scaling
    const flatData = data.flat().filter(d => d !== null && d !== undefined && !isNaN(d));
    const dataMin = Math.min(...flatData);
    const dataMax = Math.max(...flatData);
    const dataRange = dataMax - dataMin;

    // Improved color scale - using a proper heatmap color scheme
    const colorScale = d3.scaleSequential()
      .domain([dataMin, dataMax])
      .interpolator(d3.interpolateRdYlBu)
      .clamp(true);

    const group = svg.append('g').attr('transform', `translate(${padding.left},${padding.top})`);

    // Draw heatmap cells
    blackMovesLabels.forEach((blackMove, rowIndex) => {
      whiteMovesLabels.forEach((whiteMove, colIndex) => {
        const value = data[rowIndex]?.[colIndex];
        if (value !== null && value !== undefined && !isNaN(value)) {
          const rect = group.append('rect')
            .attr('x', colIndex * cellWidth)
            .attr('y', rowIndex * cellHeight)
            .attr('width', cellWidth - 1) // Small gap between cells
            .attr('height', cellHeight - 1)
            .attr('fill', colorScale(value))
            .attr('stroke', '#374151')
            .attr('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .style('opacity', 0.9);

          // Add hover effects
          rect
            .on('mouseenter', function () {
              d3.select(this)
                .style('opacity', 1)
                .attr('stroke', '#ea580c')
                .attr('stroke-width', 2);
            })
            .on('mouseleave', function () {
              d3.select(this)
                .style('opacity', 0.9)
                .attr('stroke', '#374151')
                .attr('stroke-width', 0.5);
              setTooltip(null);
            })
            .on('mousemove', function (event) {
              const [mouseX, mouseY] = d3.pointer(event, svg.node());
              setTooltip({
                x: mouseX + 10,
                y: mouseY - 10,
                html: `<div style='font-size:13px; line-height: 1.4;'><b>Matchup:</b> ${whiteMove} vs ${blackMove}<br/><b>White Win Rate:</b> <span style='color: #ea580c;'>${value.toFixed(1)}%</span><br/><small>White opens with ${whiteMove}, Black responds with ${blackMove}</small></div>`
              });
            });

          // Add text labels for values if cells are large enough
          if (cellWidth > 30 && cellHeight > 20) {
            group.append('text')
              .attr('x', colIndex * cellWidth + cellWidth / 2)
              .attr('y', rowIndex * cellHeight + cellHeight / 2)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle')
              .attr('fill', value > (dataMin + dataRange * 0.5) ? '#000' : '#fff')
              .attr('font-size', Math.min(cellWidth / 4, cellHeight / 3, 10))
              .attr('font-weight', 'bold')
              .style('pointer-events', 'none')
              .text(value.toFixed(0));
          }
        }
      });
    });

    // X axis (White moves)
    const xScale = d3.scaleBand()
      .domain(whiteMovesLabels)
      .range([0, chartWidth])
      .padding(0);

    const xAxis = group.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0));

    xAxis.selectAll('text')
      .attr('fill', '#ea580c')
      .attr('font-size', Math.min(12, cellWidth / 3))
      .attr('font-weight', 'bold')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.15em');

    xAxis.select('.domain').remove();

    // Y axis (Black moves)
    const yScale = d3.scaleBand()
      .domain(blackMovesLabels)
      .range([0, chartHeight])
      .padding(0);

    const yAxis = group.append('g')
      .call(d3.axisLeft(yScale).tickSize(0));

    yAxis.selectAll('text')
      .attr('fill', '#ea580c')
      .attr('font-size', Math.min(12, cellHeight / 2))
      .attr('font-weight', 'bold')
      .attr('dx', '-0.5em');

    yAxis.select('.domain').remove();

    // Axis labels
    svg.append('text')
      .attr('x', padding.left + chartWidth / 2)
      .attr('y', height - 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text('White Opening Move');

    svg.append('text')
      .attr('transform', `translate(25,${padding.top + chartHeight / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text('Black Response Move');

    // Color bar legend
    const legendWidth = 20;
    const legendHeight = Math.min(chartHeight, 200);
    const legend = svg.append('g')
      .attr('transform', `translate(${width - padding.right + 30}, ${padding.top + (chartHeight - legendHeight) / 2})`);

    const legendScale = d3.scaleLinear()
      .domain([dataMin, dataMax])
      .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(6)
      .tickFormat(d => `${Number(d).toFixed(0)}%`);

    // Create gradient for legend
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', legendHeight)
      .attr('x2', 0).attr('y2', 0);

    const gradientStops = d3.range(0, 1.01, 0.1);
    gradient.selectAll('stop')
      .data(gradientStops)
      .join('stop')
      .attr('offset', d => `${d * 100}%`)
      .attr('stop-color', d => colorScale(dataMin + d * dataRange));

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')
      .attr('stroke', '#ea580c')
      .attr('stroke-width', 1);

    legend.append('g')
      .attr('transform', `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll('text')
      .attr('fill', '#ea580c')
      .attr('font-size', 10);

    legend.selectAll('path, line')
      .attr('stroke', '#ea580c');

    // Legend title
    legend.append('text')
      .attr('transform', `translate(${legendWidth + 50}, ${legendHeight / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 12)
      .attr('font-weight', 'bold')
      .text('White Win Rate %');

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .text('White Opening vs Black Response Analysis');


  }, [data, dimensions, whiteMovesLabels, blackMovesLabels]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{CHART_MESSAGES.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-red-400 italic">{CHART_MESSAGES.error}{error}</span>
      </div>
    );
  }

  // Debug: Check render conditions
  const hasData = data.length > 0;


  if (!hasData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{CHART_MESSAGES.noData}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-fit min-h-[520px] relative">

      <svg
        ref={svgRef}
        width={dimensions.width || 800}
        height={dimensions.height || 520}
        aria-label="Opening Move Matchup Analysis"
        style={{ display: 'block', width: '100%', border: '3px solid #ea580c', background: '#18181b' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(tooltip.x, dimensions.width - 200),
            top: Math.max(tooltip.y, 10),
            pointerEvents: 'none',
            color: '#fff',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderRadius: 8,
            padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: 1000,
            fontFamily: 'inherit',
            fontSize: 13,
            border: '1px solid #ea580c',
            minWidth: 140,
            maxWidth: 200,
            whiteSpace: 'pre-line',
            textAlign: 'left',
            backdropFilter: 'blur(4px)',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}
    </div>
  );
});
MovePairMatchupAnalysis.displayName = 'MovePairMatchupAnalysis';

export default MovePairMatchupAnalysis;