import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';

interface GameData {
  whiteWins: number[];
  draws: number[];
  blackWins: number[];
}

const CONTENT = {
  loading: "Loading...",
  error: "Error: ",
  noData: "No data available"
};

export default function OpeningEvalBoxPlot() {
  const [data, setData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/EloByOpening-UvR61aOt7qIZRQ68EmEABIyH5U1ICw.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json() as GameData;
        
        if (isMounted) {
          setData(fetchedData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoized chart data for optimal performance
  const chartData = useMemo(() => {
    if (!data) {return null;}

    return [
      {
        type: 'box' as const,
        y: data.whiteWins || [],
        name: 'White Wins',
        marker: {
          color: '#22c55e',
          line: {
            color: '#16a34a',
            width: 2
          }
        },
        boxpoints: 'outliers' as const,
        jitter: 0.3,
        pointpos: -1.8
      },
      {
        type: 'box' as const,
        y: data.draws || [],
        name: 'Draws',
        marker: {
          color: '#6b7280',
          line: {
            color: '#4b5563',
            width: 2
          }
        },
        boxpoints: 'outliers' as const,
        jitter: 0.3,
        pointpos: -1.8
      },
      {
        type: 'box' as const,
        y: data.blackWins || [],
        name: 'Black Wins',
        marker: {
          color: '#ef4444',
          line: {
            color: '#dc2626',
            width: 2
          }
        },
        boxpoints: 'outliers' as const,
        jitter: 0.3,
        pointpos: -1.8
      }
    ];
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
        <span className="text-gray-400 italic">{CONTENT.noData}</span>
      </div>
    );
  }

  return (
    <Plot
      data={chartData}
      layout={{
        height: 400,
        xaxis: {
          title: { text: 'Game Result', font: { color: '#ea580c', size: 12 } },
          tickfont: { color: '#c2410c', size: 10 },
          gridcolor: '#ea580c20'
        },
        yaxis: {
          title: { text: 'Opening Evaluation (centipawns)', font: { color: '#ea580c', size: 12 } },
          tickfont: { color: '#c2410c', size: 10 },
          gridcolor: '#ea580c20',
          zerolinecolor: '#ea580c40'
        },
        margin: { t: 30, r: 30, b: 60, l: 60 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#ea580c' },
        showlegend: false
      }}
      config={{ responsive: true, displayModeBar: false }}
    />
  );
}
