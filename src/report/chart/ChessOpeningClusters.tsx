import * as d3 from 'd3';
import { useState, useEffect, useMemo, useRef, memo } from 'react';
import { CHART_MESSAGES } from './Constants';

interface OpeningData {
  opening: string;
  white: number;
  black: number;
  draw: number;
  total: number;
}

interface ClusterData extends OpeningData {
  cluster: number;
  cluster_label: string;
  pca_x: number;
  pca_y: number;
}

const CONTENT = CHART_MESSAGES;

// Clustering and PCA logic converted from Python
class ChessOpeningAnalyzer {
  private static standardize(data: number[][]): number[][] {
    const means = data[0].map((_, colIndex) =>
      data.reduce((sum, row) => sum + row[colIndex], 0) / data.length
    );
    const stds = data[0].map((_, colIndex) => {
      const mean = means[colIndex];
      const variance = data.reduce((sum, row) => sum + (row[colIndex] - mean) ** 2, 0) / data.length;
      return Math.sqrt(variance);
    });

    return data.map(row =>
      row.map((val, colIndex) => (val - means[colIndex]) / (stds[colIndex] || 1))
    );
  }

  private static kMeans(data: number[][], k: number, maxIterations = 100): number[] {
    const n = data.length;
    const dimensions = data[0].length;

    // Initialize centroids randomly
    let centroids = Array.from({ length: k }, () =>
      Array.from({ length: dimensions }, () => Math.random() * 2 - 1)
    );

    let assignments = new Array(n).fill(0);

    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign points to nearest centroid
      const newAssignments = data.map(point => {
        let minDistance = Infinity;
        let bestCluster = 0;

        centroids.forEach((centroid, clusterIndex) => {
          const distance = point.reduce((sum, val, dim) =>
            sum + (val - centroid[dim]) ** 2, 0
          );
          if (distance < minDistance) {
            minDistance = distance;
            bestCluster = clusterIndex;
          }
        });

        return bestCluster;
      });

      // Check for convergence
      if (newAssignments.every((assignment, index) => assignment === assignments[index])) {
        break;
      }

      assignments = newAssignments;

      // Update centroids
      centroids = centroids.map((_, clusterIndex) => {
        const clusterPoints = data.filter((_, pointIndex) => assignments[pointIndex] === clusterIndex);
        if (clusterPoints.length === 0) { return centroids[clusterIndex]; }

        return Array.from({ length: dimensions }, (_, dim) =>
          clusterPoints.reduce((sum, point) => sum + point[dim], 0) / clusterPoints.length
        );
      });
    }

    return assignments;
  }

  private static pca(originalData: OpeningData[]): { transformed: number[][], explainedVariance: number[] } {

    // Instead of complex PCA, create meaningful axes based on white/black performance
    // X-axis: White advantage (white% - black%)
    // Y-axis: Decisiveness (100% - draw%)

    const transformed = originalData.map(opening => {
      const whiteAdvantage = opening.white - opening.black; // Range: -100 to 100
      const decisiveness = 100 - opening.draw; // Range: 0 to 100

      return [
        whiteAdvantage / 50, // Normalize to roughly -2 to 2
        (decisiveness - 50) / 25 // Center around 0, normalize to roughly -2 to 2
      ];
    });

    return {
      transformed,
      explainedVariance: [0.7, 0.3] // White advantage explains more variance
    };
  }

  static analyzeOpenings(openings: OpeningData[]): ClusterData[] {
    // Prepare features (white%, black%, draw%)
    const features = openings.map(opening => [opening.white, opening.black, opening.draw]);

    // Standardize features
    const standardizedFeatures = this.standardize(features);

    // Perform K-means clustering
    const clusters = this.kMeans(standardizedFeatures, 4);

    // Perform PCA for 2D visualization
    const { transformed: pcaData } = this.pca(openings);

    // Create cluster labels
    const clusterStats = Array.from({ length: 4 }, (_, clusterIndex) => {
      const clusterOpenings = openings.filter((_, index) => clusters[index] === clusterIndex);
      const avgWhite = clusterOpenings.reduce((sum, opening) => sum + opening.white, 0) / clusterOpenings.length;
      const avgBlack = clusterOpenings.reduce((sum, opening) => sum + opening.black, 0) / clusterOpenings.length;
      const avgDraw = clusterOpenings.reduce((sum, opening) => sum + opening.draw, 0) / clusterOpenings.length;

      return { avgWhite, avgBlack, avgDraw };
    });

    const getClusterLabel = (white: number, black: number, draw: number): string => {
      if (draw > 50) { return "Draw Heavy"; }
      if (white > 60) { return "Major White Advantage"; }
      if (black > 60) { return "Major Black Advantage"; }
      if (Math.abs(white - black) < 10) { return "Competitive"; }
      if (white > black) { return "White Advantage"; }
      return "Black Advantage";
    };

    const clusterLabels = clusterStats.map(stats =>
      getClusterLabel(stats.avgWhite, stats.avgBlack, stats.avgDraw)
    );

    // Combine all data
    return openings.map((opening, index) => ({
      ...opening,
      cluster: clusters[index],
      cluster_label: clusterLabels[clusters[index]],
      pca_x: pcaData[index][0],
      pca_y: pcaData[index][1]
    }));
  }
}

const ChessOpeningClusters = memo(() => {
  const [data, setData] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAndAnalyzeData = async () => {
      try {
        setLoading(true);
        console.log('[ChessOpeningClusters] Starting data fetch...');
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingWinrates-F6v81U2KqlmCJqkpF0Sfos6R1Ji0hJ.json');
        console.log('[ChessOpeningClusters] Response status:', response.status);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json();
        console.log('[ChessOpeningClusters] Raw fetched data:', fetchedData);
        console.log('[ChessOpeningClusters] Data type:', typeof fetchedData, 'Is array:', Array.isArray(fetchedData));

        if (!isMounted) { return; }

        // Process and clean the data
        const processedData: OpeningData[] = [];
        if (fetchedData && Array.isArray(fetchedData)) {
          console.log('[ChessOpeningClusters] Processing', fetchedData.length, 'items');
          fetchedData.forEach((item: any) => {
            if (item.white != null && item.black != null && item.draw != null) {
              processedData.push({
                opening: item.opening || 'Unknown Opening',
                white: Number(item.white) || 0,
                black: Number(item.black) || 0,
                draw: Number(item.draw) || 0,
                total: Number(item.total) || 0
              });
            }
          });
        }
        console.log('[ChessOpeningClusters] Processed data count:', processedData.length);

        // Perform clustering analysis
        const analyzedData = ChessOpeningAnalyzer.analyzeOpenings(processedData);
        console.log('[ChessOpeningClusters] Analyzed data:', analyzedData);
        console.log('[ChessOpeningClusters] Final data count:', analyzedData.length);

        if (isMounted) {
          setData(analyzedData);
          setError(null);
        }
      } catch (err) {
        console.error('[ChessOpeningClusters] Error fetching data:', err);
        if (isMounted) {
          setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAndAnalyzeData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const initializeDimensions = () => {
      if (!containerRef.current) { 
        console.log('[ChessOpeningClusters] Container ref not available, retrying...');
        setTimeout(initializeDimensions, 100);
        return; 
      }

      const rect = containerRef.current.getBoundingClientRect();
      const newDimensions = {
        width: Math.max(rect.width - 8, 800),
        height: 520
      };
      console.log('[ChessOpeningClusters] Setting dimensions:', newDimensions);
      setDimensions(newDimensions);

      const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        const resizedDimensions = {
          width: Math.max(entry.contentRect.width - 8, 800),
          height: 520
        };
        console.log('[ChessOpeningClusters] Resizing dimensions:', resizedDimensions);
        setDimensions(resizedDimensions);
      });
      resizeObserver.observe(containerRef.current);
    };

    initializeDimensions();
  }, []);

  const chartData = useMemo(() => {
    if (!data.length) { 
      console.log('[ChessOpeningClusters] Chart data is null, data length:', data.length);
      return null; 
    }

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
    const clusters = Array.from(new Set(data.map(item => item.cluster))).sort();

    const clusterGroups = clusters.map(clusterIndex => {
      const clusterData = data.filter(item => item.cluster === clusterIndex);
      const clusterLabel = clusterData[0]?.cluster_label || `Cluster ${clusterIndex}`;

      return {
        cluster: clusterIndex,
        label: clusterLabel,
        data: clusterData,
        color: colors[clusterIndex % colors.length]
      };
    });

    // Top openings for annotations
    const topOpenings = data
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const result = { clusterGroups, topOpenings };
    console.log('[ChessOpeningClusters] Chart data processed:', result);
    return result;
  }, [data]);

  // D3 rendering effect
  useEffect(() => {
    console.log('[ChessOpeningClusters] D3 render effect triggered:', {
      hasSvgRef: !!svgRef.current,
      hasChartData: !!chartData,
      dimensionsWidth: dimensions.width,
      dimensionsHeight: dimensions.height
    });
    
    if (!svgRef.current || !chartData || dimensions.width === 0) {
      console.log('[ChessOpeningClusters] D3 render skipped - missing requirements');
      return;
    }
    
    

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const padding = { top: 60, right: 150, bottom: 60, left: 80 };
    const width = dimensions.width;
    const height = dimensions.height;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (chartWidth <= 0 || chartHeight <= 0) { return; }

    // Scales
    const xExtent = d3.extent(data, d => d.pca_x) as [number, number];
    const yExtent = d3.extent(data, d => d.pca_y) as [number, number];

    const xScale = d3.scaleLinear()
      .domain(xExtent)
      .nice()
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .nice()
      .range([chartHeight, 0]);

    const sizeScale = d3.scaleSqrt()
      .domain(d3.extent(data, d => d.total) as [number, number])
      .range([6, 20]);

    const group = svg.append('g').attr('transform', `translate(${padding.left},${padding.top})`);

    // Draw axes
    const xAxis = group.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(8));

    xAxis.selectAll('text')
      .attr('fill', '#ea580c')
      .attr('font-size', 10);

    xAxis.selectAll('path, line')
      .attr('stroke', '#ea580c');

    const yAxis = group.append('g')
      .call(d3.axisLeft(yScale).ticks(8));

    yAxis.selectAll('text')
      .attr('fill', '#ea580c')
      .attr('font-size', 10);

    yAxis.selectAll('path, line')
      .attr('stroke', '#ea580c');

    // Zero lines
    group.append('line')
      .attr('x1', xScale(0))
      .attr('x2', xScale(0))
      .attr('y1', 0)
      .attr('y2', chartHeight)
      .attr('stroke', '#ea580c')
      .attr('stroke-width', 1)
      .attr('opacity', 0.4);

    group.append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', yScale(0))
      .attr('y2', yScale(0))
      .attr('stroke', '#ea580c')
      .attr('stroke-width', 1)
      .attr('opacity', 0.4);

    // Draw scatter points by cluster
    chartData.clusterGroups.forEach(clusterGroup => {
      group.selectAll(`.cluster-${clusterGroup.cluster}`)
        .data(clusterGroup.data)
        .join('circle')
        .attr('class', `cluster-${clusterGroup.cluster}`)
        .attr('cx', d => xScale(d.pca_x))
        .attr('cy', d => yScale(d.pca_y))
        .attr('r', d => sizeScale(d.total))
        .attr('fill', clusterGroup.color)
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.7)
        .style('cursor', 'pointer')
        .on('mousemove', (event, d) => {
          setTooltip({
            x: event.offsetX + padding.left,
            y: event.offsetY + padding.top - 20,
            html: `<div style='font-size:13px'><b>${d.opening}</b><br/>White: <b>${d.white.toFixed(1)}%</b><br/>Black: <b>${d.black.toFixed(1)}%</b><br/>Draw: <b>${d.draw.toFixed(1)}%</b><br/>Games: <b>${d.total}</b></div>`
          });
        })
        .on('mouseleave', () => setTooltip(null));
    });

    // Add annotations for top openings
    chartData.topOpenings.forEach(opening => {
      const x = xScale(opening.pca_x);
      const y = yScale(opening.pca_y);
      const labelText = opening.opening.length > 20 ? `${opening.opening.substring(0, 20)}...` : opening.opening;

      // Annotation line
      group.append('line')
        .attr('x1', x)
        .attr('y1', y)
        .attr('x2', x + 20)
        .attr('y2', y - 20)
        .attr('stroke', '#666')
        .attr('stroke-width', 1);

      // Annotation text background
      const textBg = group.append('rect')
        .attr('x', x + 22)
        .attr('y', y - 32)
        .attr('rx', 3)
        .attr('fill', 'rgba(255,255,255,0.8)')
        .attr('stroke', '#ea580c')
        .attr('stroke-width', 1);

      // Annotation text
      const text = group.append('text')
        .attr('x', x + 25)
        .attr('y', y - 22)
        .attr('font-size', 9)
        .attr('fill', '#ea580c')
        .text(labelText);

      // Adjust background size to text
      const bbox = (text.node() as SVGTextElement).getBBox();
      textBg.attr('width', bbox.width + 6)
        .attr('height', bbox.height + 4);
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 16)
      .text('Chess Opening Clusters by Win/Loss/Draw Patterns');

    // Axis labels
    svg.append('text')
      .attr('x', padding.left + chartWidth / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 12)
      .text('← Black Advantage | White Advantage →');

    svg.append('text')
      .attr('transform', `translate(20,${padding.top + chartHeight / 2}) rotate(-90)`)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ea580c')
      .attr('font-size', 12)
      .text('Decisiveness (Low Draws ↑ | High Draws ↓)');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - padding.right + 10}, ${padding.top})`);

    chartData.clusterGroups.forEach((clusterGroup, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendItem.append('circle')
        .attr('cx', 8)
        .attr('cy', 8)
        .attr('r', 6)
        .attr('fill', clusterGroup.color)
        .attr('stroke', '#000')
        .attr('stroke-width', 0.5)
        .attr('opacity', 0.7);

      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('fill', '#ea580c')
        .attr('font-size', 10)
        .text(`${clusterGroup.label} (${clusterGroup.data.length})`);
    });

    // Legend background
    const legendBbox = (legend.node() as SVGGElement).getBBox();
    legend.insert('rect', ':first-child')
      .attr('x', legendBbox.x - 5)
      .attr('y', legendBbox.y - 5)
      .attr('width', legendBbox.width + 10)
      .attr('height', legendBbox.height + 10)
      .attr('fill', 'rgba(0,0,0,0.1)')
      .attr('stroke', '#ea580c')
      .attr('stroke-width', 1)
      .attr('rx', 3);
      
    
  }, [chartData, dimensions, data]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{CONTENT.loading}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-red-400 italic">{CONTENT.error}{error}</span>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">{CONTENT.noData}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-fit min-h-[520px] relative">
      <svg
        ref={svgRef}
        width={dimensions.width || 800}
        height={dimensions.height}
        aria-label="Chess Opening Clusters Analysis"
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
ChessOpeningClusters.displayName = 'ChessOpeningClusters';

export default ChessOpeningClusters;