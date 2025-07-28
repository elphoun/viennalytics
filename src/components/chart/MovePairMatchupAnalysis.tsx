import { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

type MovePairMatchupAnalysisProps = object

export default function MovePairMatchupAnalysis({ }: MovePairMatchupAnalysisProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/WhiteBlackWinrates-hxshcz94wZXNxSAcrM02g3d53JhU2G.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json();

        setData(fetchedData.matrix);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">No data available</span>
      </div>
    );
  }

  const possibleWhiteMoves = [
    'a3', 'a4', 'b3', 'b4', 'c3', 'c4', 'd3', 'd4', 'e3', 'e4', 'f3', 'f4', 'g3', 'g4', 'h3', 'h4', // pawn moves
    'Na3', 'Nc3', 'Nf3', 'Nh3' // knight moves (N = Knight)
  ];

  const possibleBlackMoves = [
    'a6', 'a5', 'b6', 'b5', 'c6', 'c5', 'd6', 'd5', 'e6', 'e5', 'f6', 'f5', 'g6', 'g5', 'h6', 'h5', // pawn moves
    'Na6', 'Nc6', 'Nf6', 'Nh6' // knight moves (N = Knight)
  ];

  const plotXLabels = possibleWhiteMoves;
  const plotYLabels = possibleBlackMoves;
  const plotData = data || [];

  // Calculate average win rates
  if (plotData.length > 0) {
    // Average win rate for each white move (column averages)
    const whiteMoveAverages = plotXLabels.map((move, colIndex) => {
      const columnValues = plotData.map((row: number[]) => row[colIndex]).filter((val: number) => val !== null && val !== undefined);
      const average = columnValues.length > 0 ? columnValues.reduce((sum: number, val: number) => sum + val, 0) / columnValues.length : 0;
      return { move, average: average.toFixed(2) };
    });

    // Average win rate for each black response (row averages)
    const blackMoveAverages = plotYLabels.map((move, rowIndex) => {
      const rowValues = plotData[rowIndex]?.filter((val: number) => val !== null && val !== undefined) || [];
      const average = rowValues.length > 0 ? rowValues.reduce((sum: number, val: number) => sum + val, 0) / rowValues.length : 0;
      return { move, average: average.toFixed(2) };
    });

    console.log('Average win rates for White moves:', whiteMoveAverages);
    console.log('Average win rates for Black responses:', blackMoveAverages);

    // Count wins for each group (win rate > 50%)
    const whiteWins = whiteMoveAverages.filter(move => parseFloat(move.average) > 50);
    const blackWins = blackMoveAverages.filter(move => parseFloat(move.average) < 50); // For black, lower win rate means white wins more

    console.log(`White moves that win on average (${whiteWins.length}/${whiteMoveAverages.length}):`, whiteWins);
    console.log(`Black responses that win on average (${blackWins.length}/${blackMoveAverages.length}):`, blackWins);

    // Overall statistics
    const totalWhiteWinRate = whiteMoveAverages.reduce((sum, move) => sum + parseFloat(move.average), 0) / whiteMoveAverages.length;
    const totalBlackWinRate = 100 - totalWhiteWinRate; // Since win rates are from white's perspective

    console.log(`Overall White win rate: ${totalWhiteWinRate.toFixed(2)}%`);
    console.log(`Overall Black win rate: ${totalBlackWinRate.toFixed(2)}%`);

    // Calculate standard deviations
    const whiteAverageValues = whiteMoveAverages.map(move => parseFloat(move.average));
    const blackAverageValues = blackMoveAverages.map(move => parseFloat(move.average));

    const whiteStdDev = Math.sqrt(
      whiteAverageValues.reduce((sum, val) => sum + Math.pow(val - totalWhiteWinRate, 2), 0) / whiteAverageValues.length
    );

    const totalBlackAverage = blackAverageValues.reduce((sum, val) => sum + val, 0) / blackAverageValues.length;
    const blackStdDev = Math.sqrt(
      blackAverageValues.reduce((sum, val) => sum + Math.pow(val - totalBlackAverage, 2), 0) / blackAverageValues.length
    );

    console.log(`White moves standard deviation: ${whiteStdDev.toFixed(2)}%`);
    


  }

  return (
    <Plot
      data={[
        {
          type: 'heatmap',
          x: plotXLabels,
          y: plotYLabels,
          z: plotData,
          colorscale: [
            [0, '#ffffff'],
            [1, '#000000']
          ],
          showscale: true,
          colorbar: {
            title: { text: 'Win Rate %', font: { color: '#ea580c' } },
            tickfont: { color: '#c2410c' }
          }
        },
      ]}
      layout={{
        height: 300,
        margin: { t: 30, r: 80, b: 60, l: 60 },
        xaxis: {
          title: { text: 'White Opening Move', font: { color: '#ea580c', size: 12 } },
          tickfont: { color: '#c2410c', size: 10 }
        },
        yaxis: {
          title: { text: 'Black Response', font: { color: '#ea580c', size: 12 } },
          tickfont: { color: '#c2410c', size: 10 }
        },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#ea580c' },
      }}
      config={{ responsive: true, displayModeBar: false }}
    />
  );
}