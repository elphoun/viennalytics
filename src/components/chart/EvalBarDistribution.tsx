import { useState, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';

interface EvalData {
  blackWins: number[];
  draws: number[];
  whiteWins: number[];
}

const CONTENT = {
  loading: "Loading...",
  error: "Error: ",
  noData: "No data available or invalid data structure"
};

export default function EvalBarDistribution() {
  const [data, setData] = useState<EvalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/OpeningEval-FQ3iNEzFnkyqjJmWRd8ydMzcU0ZuCn.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json() as EvalData;

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

  // Helper function to calculate frequency distribution
  const calculateFrequencyDistribution = (values: number[]) => {
    const frequencyMap = new Map<number, number>();

    values.forEach(value => {
      const rounded = Math.round(value * 10) / 10; // Round to 1 decimal place
      frequencyMap.set(rounded, (frequencyMap.get(rounded) || 0) + 1);
    });

    return Array.from(frequencyMap.entries()).map(([value, frequency]) => ({
      value,
      frequency
    }));
  };

  // Memoized chart data combining both frequency scatter and box plots
  const combinedData = useMemo(() => {
    if (!data || !Array.isArray(data.blackWins) || !Array.isArray(data.draws) || !Array.isArray(data.whiteWins)) {
      return null;
    }

    const blackWinsFreq = calculateFrequencyDistribution(data.blackWins);
    const drawsFreq = calculateFrequencyDistribution(data.draws);
    const whiteWinsFreq = calculateFrequencyDistribution(data.whiteWins);

    const maxFrequency = Math.max(
      ...blackWinsFreq.map(item => item.frequency),
      ...drawsFreq.map(item => item.frequency),
      ...whiteWinsFreq.map(item => item.frequency)
    );

    return [
      // Box plots
      {
        type: 'box' as const,
        name: 'Black Wins (Box)',
        y: data.blackWins,
        x: Array(data.blackWins.length).fill('Black Wins'),
        marker: {
          color: '#374151'
        },
        line: {
          color: '#111827'
        },
        fillcolor: '#37415140',
        boxpoints: false,
        showlegend: true
      },
      {
        type: 'box' as const,
        name: 'Draws (Box)',
        y: data.draws,
        x: Array(data.draws.length).fill('Draws'),
        marker: {
          color: '#6b7280'
        },
        line: {
          color: '#4b5563'
        },
        fillcolor: '#6b728040',
        boxpoints: false,
        showlegend: true
      },
      {
        type: 'box' as const,
        name: 'White Wins (Box)',
        y: data.whiteWins,
        x: Array(data.whiteWins.length).fill('White Wins'),
        marker: {
          color: '#f3f4f6'
        },
        line: {
          color: '#d1d5db'
        },
        fillcolor: '#f3f4f640',
        boxpoints: false,
        showlegend: true
      },
      // Frequency scatter points
      {
        type: 'scatter' as const,
        mode: 'markers' as const,
        name: 'Black Wins (Freq)',
        x: Array(blackWinsFreq.length).fill('Black Wins'),
        y: blackWinsFreq.map(item => item.value),
        marker: {
          color: '#dc2626',
          size: blackWinsFreq.map(item => Math.max(8, (item.frequency / maxFrequency) * 40)),
          opacity: 0.8,
          line: {
            color: '#991b1b',
            width: 2
          },
          symbol: 'circle'
        },
        text: blackWinsFreq.map(item => `Value: ${item.value}<br>Frequency: ${item.frequency}`),
        hovertemplate: '%{text}<extra></extra>',
        showlegend: true
      },
      {
        type: 'scatter' as const,
        mode: 'markers' as const,
        name: 'Draws (Freq)',
        x: Array(drawsFreq.length).fill('Draws'),
        y: drawsFreq.map(item => item.value),
        marker: {
          color: '#f59e0b',
          size: drawsFreq.map(item => Math.max(8, (item.frequency / maxFrequency) * 40)),
          opacity: 0.8,
          line: {
            color: '#d97706',
            width: 2
          },
          symbol: 'circle'
        },
        text: drawsFreq.map(item => `Value: ${item.value}<br>Frequency: ${item.frequency}`),
        hovertemplate: '%{text}<extra></extra>',
        showlegend: true
      },
      {
        type: 'scatter' as const,
        mode: 'markers' as const,
        name: 'White Wins (Freq)',
        x: Array(whiteWinsFreq.length).fill('White Wins'),
        y: whiteWinsFreq.map(item => item.value),
        marker: {
          color: '#10b981',
          size: whiteWinsFreq.map(item => Math.max(8, (item.frequency / maxFrequency) * 40)),
          opacity: 0.8,
          line: {
            color: '#059669',
            width: 2
          },
          symbol: 'circle'
        },
        text: whiteWinsFreq.map(item => `Value: ${item.value}<br>Frequency: ${item.frequency}`),
        hovertemplate: '%{text}<extra></extra>',
        showlegend: true
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

  if (!combinedData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-yellow-400 italic">{CONTENT.noData}</span>
      </div>
    );
  }

  return (
    <Plot
      data={combinedData}
      layout={{
        height: 400,
        margin: { t: 30, r: 30, b: 80, l: 60 },
        xaxis: {
          title: { text: 'Game Result', font: { color: '#ea580c', size: 12 } },
          tickfont: { color: '#c2410c', size: 10 },
          gridcolor: '#ea580c20'
        },
        yaxis: {
          title: { text: 'Evaluation', font: { color: '#ea580c', size: 12 } },
          tickfont: { color: '#c2410c', size: 10 },
          gridcolor: '#ea580c20',
          zerolinecolor: '#ea580c40'
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#ea580c' },
        showlegend: true,
        legend: {
          font: { color: '#ea580c', size: 9 },
          bgcolor: 'transparent',
          bordercolor: 'transparent',
          orientation: 'h',
          x: 0,
          y: -0.2
        },
        hovermode: 'closest',
        boxmode: 'group'
      }}
      config={{ responsive: true, displayModeBar: false }}
    />
  );
}
