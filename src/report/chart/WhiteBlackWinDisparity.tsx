import { useState, useEffect, useMemo, useRef, memo } from 'react';
import * as d3 from 'd3';
import { CHART_MESSAGES } from './Constants';

interface OpeningData {
  opening: string;
  white: number;
  black: number;
  draw: number;
  total: number;
}

const WhiteBlackWinDisparity = memo(() => {
  const [data, setData] = useState<OpeningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[WhiteBlackWinDisparity] Starting data fetch...');
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingWinrates-F6v81U2KqlmCJqkpF0Sfos6R1Ji0hJ.json');
        console.log('[WhiteBlackWinDisparity] Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json();
        console.log('[WhiteBlackWinDisparity] Raw fetched data:', fetchedData);
        console.log('[WhiteBlackWinDisparity] Data type:', typeof fetchedData, 'Is array:', Array.isArray(fetchedData));
        
        // Process the fetched data into the expected format
        const processedData: OpeningData[] = [];

        if (fetchedData && Array.isArray(fetchedData)) {
          console.log('[WhiteBlackWinDisparity] Processing', fetchedData.length, 'items');
          fetchedData.forEach((item: any, index: number) => {
            processedData.push({
              opening: item.opening || `Opening ${index + 1}`,
              white: item.white_win_rate || item.white || 50,
              black: item.black_win_rate || item.black || 40,
              draw: item.draw_rate || item.draw || 10,
              total: item.total_games || item.total || 100
            });
          });
        }

        // Sort by win rate difference (most decisive matchups first)
        const sortedData = processedData.sort((a, b) => Math.abs(b.white - 50) - Math.abs(a.white - 50));
        console.log('[WhiteBlackWinDisparity] Processed data:', sortedData);
        console.log('[WhiteBlackWinDisparity] Final data count:', sortedData.length);

        setData(sortedData);
        setError(null);
      } catch (err) {
        console.error('[WhiteBlackWinDisparity] Error fetching data:', err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const initializeDimensions = () => {
      if (!containerRef.current) { 
        console.log('[WhiteBlackWinDisparity] Container ref not available, retrying...');
        setTimeout(initializeDimensions, 100);
        return; 
      }

      const rect = containerRef.current.getBoundingClientRect();
      const newDimensions = {
        width: Math.max(rect.width - 8, 800),
        height: 520
      };
      console.log('[WhiteBlackWinDisparity] Setting dimensions:', newDimensions);
      setDimensions(newDimensions);

      const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        const resizedDimensions = {
          width: Math.max(entry.contentRect.width - 8, 800),
          height: 520
        };
        console.log('[WhiteBlackWinDisparity] Resizing dimensions:', resizedDimensions);
        setDimensions(resizedDimensions);
      });
      resizeObserver.observe(containerRef.current);
    };

    initializeDimensions();
  }, []);

  // Memoize processed chart data to avoid recalculating on every render
  const chartData = useMemo(() => {
    if (loading || error || !data.length) { 
      console.log('[WhiteBlackWinDisparity] Chart data is null:', { loading, error, dataLength: data.length });
      return null; 
    }

    const truncateLabel = (label: string, maxLength = 25) =>
      label.length > maxLength ? `${label.substring(0, maxLength)}...` : label;

    const result = {
      openings: data,
      labels: data.map(item => truncateLabel(item.opening)),
      fullLabels: data.map(item => item.opening),
      colors: {
        white: '#ffffff',
        black: '#1a1a1a', 
        draw: '#888888'
      }
    };
    
    console.log('[WhiteBlackWinDisparity] Chart data processed:', result);
    return result;
  }, [data, loading, error]);

  // D3 rendering effect
  useEffect(() => {
    console.log('[WhiteBlackWinDisparity] D3 render effect triggered:', {
      hasSvgRef: !!svgRef.current,
      hasChartData: !!chartData,
      dimensionsWidth: dimensions.width,
      dimensionsHeight: dimensions.height
    });
    
    if (!svgRef.current || !chartData || dimensions.width === 0) {
      console.log('[WhiteBlackWinDisparity] D3 render skipped - missing requirements');
      return;
    }
    
    console.log('[WhiteBlackWinDisparity] Starting D3 render...');

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 40, right: 40, bottom: 120, left: 60 };
    const width = dimensions.width;
    const height = dimensions.height;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (chartWidth <= 0 || chartHeight <= 0) { return; }

    // Scales
    const x = d3.scaleBand()
      .domain(chartData.labels)
      .range([0, chartWidth])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([chartHeight, 0]);

    const group = svg.append('g').attr('transform', `translate(${padding.left},${padding.top})`);

    // Draw axes
    const xAxis = group.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x));

    xAxis.selectAll('text')
      .attr('fill', '#ea580c')
      .attr('font-size', 11)
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    xAxis.selectAll('path, line')
      .attr('stroke', '#ea580c');

    const yAxis = group.append('g')
      .call(d3.axisLeft(y).ticks(10));

    yAxis.selectAll('text')
      .attr('fill', '#ea580c')
      .attr('font-size', 11);

    yAxis.selectAll('path, line')
      .attr('stroke', '#ea580c');

    // Axis labels
    svg.append('text')
      .attr('x', padding.left + chartWidth / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 14)
      .text('Opening');

    svg.append('text')
      .attr('transform', `translate(20,${padding.top + chartHeight / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 14)
      .text('Win Percentage (%)');

    // Stack generator
    const stackKeys = ['white', 'black', 'draw'];
    const stackData = chartData.openings.map((d, i) => ({
      index: i,
      label: chartData.labels[i],
      fullLabel: chartData.fullLabels[i],
      white: d.white,
      black: d.black,
      draw: d.draw,
      total: d.total
    }));

    const stack = d3.stack<typeof stackData[0]>()
      .keys(stackKeys as (keyof typeof stackData[0])[])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(stackData);

    // Draw stacked bars
    const colors = [chartData.colors.white, chartData.colors.black, chartData.colors.draw];
    const labels = ['White Wins', 'Black Wins', 'Draws'];

    series.forEach((serie, serieIndex) => {
      group.selectAll(`.bar-${serieIndex}`)
        .data(serie)
        .join('rect')
        .attr('class', `bar-${serieIndex}`)
        .attr('x', d => x(chartData.labels[d.data.index]) ?? 0)
        .attr('y', d => y(d[1]))
        .attr('height', d => y(d[0]) - y(d[1]))
        .attr('width', x.bandwidth())
        .attr('fill', colors[serieIndex])
        .attr('stroke', '#666666')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mousemove', function(event, d) {
          const value = d[1] - d[0];
          setTooltip({
            x: event.offsetX + padding.left,
            y: event.offsetY + padding.top - 20,
            html: `<div style='font-size:13px'><b>${d.data.fullLabel}</b><br/>${labels[serieIndex]}: <b>${value.toFixed(1)}%</b><br/>Games: <b>${d.data.total}</b></div>`
          });
        })
        .on('mouseleave', () => setTooltip(null));
    });

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${padding.left + chartWidth / 2 - 150}, ${padding.top - 20})`);

    labels.forEach((label, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${i * 100}, 0)`);

      legendItem.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colors[i])
        .attr('stroke', '#666666')
        .attr('stroke-width', 1);

      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('fill', '#ea580c')
        .attr('font-size', 12)
        .text(label);
    });
    
    console.log('[WhiteBlackWinDisparity] D3 render completed successfully');
  }, [chartData, dimensions]);

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

  if (!chartData) {
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
        height={dimensions.height}
        aria-label="White vs Black Win Rate Disparity by Opening"
        style={{ display: 'block', width: '100%', border: '3px solid #ea580c', background: '#18181b' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            pointerEvents: 'none',
            color: '#fff',
            backgroundColor: 'rgba(30,41,59,0.97)',
            borderRadius: 8,
            padding: '6px 12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 10,
            fontFamily: 'inherit',
            fontSize: 13,
            border: '1px solid #ea580c',
            minWidth: 120,
            maxWidth: 220,
            whiteSpace: 'pre-line',
            textAlign: 'left',
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.html }}
        />
      )}
    </div>
  );
});
WhiteBlackWinDisparity.displayName = 'WhiteBlackWinDisparity';

export default WhiteBlackWinDisparity;
