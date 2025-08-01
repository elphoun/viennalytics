import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';

function WhiteBlackWinDisparity() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingWinrates-F6v81U2KqlmCJqkpF0Sfos6R1Ji0hJ.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json();
        // Process the fetched data into the expected format
        const processedData: any[] = [];

        if (fetchedData && Array.isArray(fetchedData)) {
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

        setData(sortedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch opening data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoize processed chart data to avoid recalculating on every render
  const chartData = useMemo(() => {
    if (loading) { return null; }
    if (error) { return null; }
    if (!data.length) { return null; }

    const truncateLabel = (label: string, maxLength = 25) =>
      label.length > maxLength ? `${label.substring(0, maxLength)}...` : label;

    const labels = data.map(item => truncateLabel(item.opening));
    const fullLabels = data.map(item => item.opening);

    return {
      traces: [
        {
          type: 'bar' as const,
          x: labels,
          y: data.map(item => item.white),
          name: 'White Wins',
          marker: { color: '#ffffff', line: { color: '#cccccc', width: 1 } },
          hovertemplate: '<b>%{customdata}</b><br>White Wins: %{y:.1f}%<br>Games: %{text}<extra></extra>',
          text: data.map(item => item.total),
          customdata: fullLabels
        },
        {
          type: 'bar' as const,
          x: labels,
          y: data.map(item => item.black),
          name: 'Black Wins',
          marker: { color: '#1a1a1a', line: { color: '#666666', width: 1 } },
          hovertemplate: '<b>%{customdata}</b><br>Black Wins: %{y:.1f}%<br>Games: %{text}<extra></extra>',
          text: data.map(item => item.total),
          customdata: fullLabels
        },
        {
          type: 'bar' as const,
          x: labels,
          y: data.map(item => item.draw),
          name: 'Draws',
          marker: { color: '#888888', line: { color: '#aaaaaa', width: 1 } },
          hovertemplate: '<b>%{customdata}</b><br>Draws: %{y:.1f}%<br>Games: %{text}<extra></extra>',
          text: data.map(item => item.total),
          customdata: fullLabels
        }
      ],
      layout: {
        autosize: true,
        height: 500,
        barmode: 'stack' as const,
        hovermode: 'x unified' as const,
        margin: { t: 40, r: 40, b: 120, l: 60 },
        xaxis: {
          title: { text: 'Opening', font: { color: '#ea580c', size: 14 } },
          tickfont: { color: '#c2410c', size: 11 },
          tickangle: -45,
          gridcolor: '#ea580c20',
          showgrid: false
        },
        yaxis: {
          title: { text: 'Win Percentage (%)', font: { color: '#ea580c', size: 14 } },
          tickfont: { color: '#c2410c', size: 11 },
          gridcolor: '#ea580c20',
          range: [0, 100]
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#ea580c', family: 'system-ui, sans-serif' },
        legend: {
          font: { color: '#ea580c', size: 12 },
          bgcolor: 'rgba(0,0,0,0.1)',
          bordercolor: '#ea580c40',
          borderwidth: 1,
          orientation: 'h' as const,
          x: 0.5,
          xanchor: 'center' as const,
          y: 1.02,
          yanchor: 'bottom' as const
        },
        showlegend: true
      }
    };
  }, [data, loading, error]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-red-400 italic">Error: {error}</span>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">No opening data available</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Plot
        data={chartData.traces}
        layout={chartData.layout}
        config={{
          responsive: true,
          displayModeBar: false,
          staticPlot: false,
          scrollZoom: false,
          doubleClick: false,
          showTips: false
        }}
        className="w-full h-full"
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default WhiteBlackWinDisparity;
