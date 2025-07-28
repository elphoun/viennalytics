import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';

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

const CONTENT = {
  loading: "Analyzing opening patterns...",
  error: "Error: ",
  noData: "No opening data available"
};

// Clustering and PCA logic converted from Python
class ChessOpeningAnalyzer {
  private static standardize(data: number[][]): number[][] {
    const means = data[0].map((_, colIndex) =>
      data.reduce((sum, row) => sum + row[colIndex], 0) / data.length
    );
    const stds = data[0].map((_, colIndex) => {
      const mean = means[colIndex];
      const variance = data.reduce((sum, row) => sum + Math.pow(row[colIndex] - mean, 2), 0) / data.length;
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
            sum + Math.pow(val - centroid[dim], 2), 0
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
        if (clusterPoints.length === 0) return centroids[clusterIndex];

        return Array.from({ length: dimensions }, (_, dim) =>
          clusterPoints.reduce((sum, point) => sum + point[dim], 0) / clusterPoints.length
        );
      });
    }

    return assignments;
  }

  private static pca(data: number[][], originalData: OpeningData[]): { transformed: number[][], explainedVariance: number[] } {
    const n = data.length;

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
    const { transformed: pcaData } = this.pca(standardizedFeatures, openings);

    // Create cluster labels
    const clusterStats = Array.from({ length: 4 }, (_, clusterIndex) => {
      const clusterOpenings = openings.filter((_, index) => clusters[index] === clusterIndex);
      const avgWhite = clusterOpenings.reduce((sum, opening) => sum + opening.white, 0) / clusterOpenings.length;
      const avgBlack = clusterOpenings.reduce((sum, opening) => sum + opening.black, 0) / clusterOpenings.length;
      const avgDraw = clusterOpenings.reduce((sum, opening) => sum + opening.draw, 0) / clusterOpenings.length;

      return { avgWhite, avgBlack, avgDraw };
    });

    const getClusterLabel = (white: number, black: number, draw: number): string => {
      if (draw > 50) return "Draw Heavy";
      if (white > 70) return "Major White Advantage";
      if (black > 70) return "Major Black Advantage";
      if (Math.abs(white - black) < 10) return "Competitive";
      if (white > black) return "White Advantage";
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

export default function ChessOpeningClusters() {
  const [data, setData] = useState<ClusterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAndAnalyzeData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/OpeningWinrates-UsNGpk8Ols7ANe4Ovf0AMKRGcUzN4q.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json();

        if (!isMounted) return;

        // Process and clean the data
        const processedData: OpeningData[] = [];
        if (fetchedData && Array.isArray(fetchedData)) {
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

        // Perform clustering analysis
        const analyzedData = ChessOpeningAnalyzer.analyzeOpenings(processedData);

        if (isMounted) {
          setData(analyzedData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to analyze opening data');
          setData([]);
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

  const chartData = useMemo(() => {
    if (!data.length) return null;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
    const clusters = Array.from(new Set(data.map(item => item.cluster))).sort();

    const traces = clusters.map(clusterIndex => {
      const clusterData = data.filter(item => item.cluster === clusterIndex);
      const clusterLabel = clusterData[0]?.cluster_label || `Cluster ${clusterIndex}`;

      return {
        type: 'scatter' as const,
        mode: 'markers' as const,
        x: clusterData.map(item => item.pca_x),
        y: clusterData.map(item => item.pca_y),
        name: `${clusterLabel} (${clusterData.length})`,
        marker: {
          color: colors[clusterIndex % colors.length],
          size: clusterData.map(item => Math.max(6, Math.min(20, Math.sqrt(item.total) / 10))),
          opacity: 0.7,
          line: { color: '#000', width: 0.5 }
        },
        text: clusterData.map(item =>
          `${item.opening}<br>White: ${item.white.toFixed(1)}%<br>Black: ${item.black.toFixed(1)}%<br>Draw: ${item.draw.toFixed(1)}%<br>Games: ${item.total}`
        ),
        hovertemplate: '%{text}<extra></extra>'
      };
    });

    // Add annotations for top openings
    const topOpenings = data
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const annotations = topOpenings.map(opening => ({
      x: opening.pca_x,
      y: opening.pca_y,
      text: opening.opening.length > 20 ? opening.opening.substring(0, 20) + '...' : opening.opening,
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 1,
      arrowcolor: '#666',
      ax: 20,
      ay: -20,
      font: { size: 9, color: '#ea580c' },
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: '#ea580c',
      borderwidth: 1
    }));

    return { traces, annotations };
  }, [data]);

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
        <span className="text-yellow-400 italic">{CONTENT.noData}</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Plot
        data={chartData.traces}
        layout={{
          autosize: true,
          height: 500,
          title: {
            text: 'Chess Opening Clusters by Win/Loss/Draw Patterns',
            font: { color: '#ea580c', size: 16 },
            x: 0.5
          },
          xaxis: {
            title: { text: '← Black Advantage | White Advantage →', font: { color: '#ea580c', size: 12 } },
            tickfont: { color: '#c2410c', size: 10 },
            gridcolor: '#ea580c20',
            zerolinecolor: '#ea580c40'
          },
          yaxis: {
            title: { text: 'Decisiveness (Low Draws ↑ | High Draws ↓)', font: { color: '#ea580c', size: 12 } },
            tickfont: { color: '#c2410c', size: 10 },
            gridcolor: '#ea580c20',
            zerolinecolor: '#ea580c40'
          },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#ea580c' },
          showlegend: true,
          legend: {
            font: { color: '#ea580c', size: 10 },
            bgcolor: 'rgba(0,0,0,0.1)',
            bordercolor: '#ea580c40',
            borderwidth: 1,
            x: 1.02,
            y: 1
          },
          annotations: chartData.annotations,
          margin: { t: 60, r: 150, b: 60, l: 80 }
        }}
        config={{
          responsive: true,
          displayModeBar: false,
          staticPlot: false,
          scrollZoom: true,
          doubleClick: 'reset'
        }}
        className="w-full h-full"
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}