
import { FC, useEffect, useState, useMemo, useCallback } from "react";
import Plot from 'react-plotly.js';

interface EloDistributionByOpeningProps {
  binSize?: number;
  height?: number;
}

const NO_DATA_MSG = "No data";

/** Truncates opening names to fit within legend */
const truncateOpening = (opening: string, maxLength = 20): string => {
  if (opening.length <= maxLength) { return opening; }
  return `${opening.substring(0, maxLength - 3)}...`;
};

const EloDistributionByOpening: FC<EloDistributionByOpeningProps> = ({ height }) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [data, setData] = useState<{ bins: number[]; opening_counts: Record<string, number[]>; bin_size: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ show: boolean; text: string; x: number; y: number }>({
    show: false,
    text: '',
    x: 0,
    y: 0
  });

  // Optimized data fetching with error handling and caching
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/ELODistributionByOpening-vydZU4JNkBdKbCmGopeEkOF7Qe6Pf1.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const fetchedData = await response.json();
        console.log('EloDistributionByOpening - Raw fetched data:', fetchedData);

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

  const { chartData, openingMap } = useMemo(() => {
    if (!data || !data.bins || !data.opening_counts) {
      return { chartData: null, openingMap: {} };
    }

    const { bins, opening_counts, bin_size } = data;

    // Get all openings sorted by total count (frequency)
    const allOpenings = Object.entries(opening_counts)
      .map(([opening, counts]) => ({
        opening,
        counts,
        total: counts.reduce((sum, count) => sum + count, 0)
      }))
      .filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);


    if (allOpenings.length === 0) {
      return { chartData: null, openingMap: {} };
    }

    // Generate colors for all openings
    const generateColors = (count: number) => {
      const baseColors = [
        '#fb923c', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
        '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
        '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316'
      ];

      const colors = [];
      for (let i = 0; i < count; i++) {
        if (i < baseColors.length) {
          colors.push(baseColors[i]);
        } else {
          // Generate additional colors by varying hue
          const hue = (i * 137.5) % 360;
          colors.push(`hsl(${hue}, 65%, 55%)`);
        }
      }
      return colors;
    };

    const colors = generateColors(allOpenings.length);

    // Create mapping of truncated to full opening names
    const openingNameMap: Record<string, string> = {};
    allOpenings.forEach(({ opening }) => {
      openingNameMap[truncateOpening(opening)] = opening;
    });

    // Create stacked bar traces for all openings
    const traces = allOpenings.map(({ opening, counts }, index) => {
      // Create custom hover text for each bar
      const hoverText = bins.map((bin, binIndex) => {
        const binEnd = bin + bin_size - 1;
        const count = counts[binIndex] || 0;
        const allOpeningsInBin = allOpenings
          .map(({ opening: openingName, counts: openingCounts }) => {
            const openingCount = openingCounts[binIndex] || 0;
            return openingCount > 0 ? `${openingName}: ${openingCount}` : null;
          })
          .filter(Boolean)
          .join('<br>');

        return `ELO Range: ${bin}-${binEnd}<br>Total Players: ${count}<br><br>By Opening:<br>${allOpeningsInBin}`;
      });

      return {
        type: 'bar' as const,
        name: truncateOpening(opening),
        x: bins.map(bin => `${bin}-${bin + bin_size - 1}`),
        y: counts,
        hovertemplate: '%{hovertext}<extra></extra>',
        hovertext: hoverText,
        marker: {
          color: colors[index],
          line: {
            color: 'transparent',
            width: 1
          }
        },
      };
    });

    return { chartData: traces, openingMap: openingNameMap };
  }, [data]);

  // Optimized event handlers with useCallback to prevent unnecessary re-renders
  const handleLegendHover = useCallback((event: any) => {
    if (event?.points?.[0]?.data?.name) {
      const truncatedName = event.points[0].data.name;
      const fullName = openingMap[truncatedName];
      if (fullName && fullName !== truncatedName) {
        setTooltip({
          show: true,
          text: fullName,
          x: event.event.clientX,
          y: event.event.clientY
        });
      }
    }
  }, [openingMap]);

  const handleLegendUnhover = useCallback(() => {
    setTooltip({ show: false, text: '', x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!containerRef) { return; }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      setDimensions({
        width: Math.max(width - 8, 200),
        height: Math.max(height - 8, 100)
      });
    });

    resizeObserver.observe(containerRef);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

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
        <span className="text-gray-400 italic">{NO_DATA_MSG}</span>
      </div>
    );
  }

  if (chartData === null) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <span className="text-gray-400 italic">No valid ELO data</span>
      </div>
    );
  }

  const chartHeight = height || Math.max(dimensions.height, 400);

  return (
    <div
      ref={setContainerRef}
      className="h-fit w-full relative"
    >
      {dimensions.width > 0 && (
        <div className="min-w-fit">
          <Plot
            data={chartData}
            layout={{
              width: dimensions.width,
              height: chartHeight,
              barmode: 'stack',
              xaxis: {
                title: {
                  text: 'Elo Rating',
                  font: { size: 13, color: '#ea580c' }
                },
                tickfont: { size: 10, color: '#c2410c' }
              },
              yaxis: {
                title: {
                  text: 'Players',
                  font: { size: 13, color: '#ea580c' }
                },
                tickfont: { size: 10, color: '#c2410c' },
                gridcolor: 'transparent'
              },
              legend: {
                font: { size: 9, color: '#ea580c' },
                bgcolor: 'transparent',
                bordercolor: 'transparent',
                orientation: 'v',
                x: 1.01,
                y: 1,
                itemsizing: 'trace',
                itemwidth: 30
              },
              margin: { t: 30, r: 10, b: 80, l: 60 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
            }}
            config={{ responsive: false, displayModeBar: false }}
            onLegendClick={() => false}
            onHover={handleLegendHover}
            onUnhover={handleLegendUnhover}
          />
        </div>
      )}

      {tooltip.show && (
        <div
          className="absolute z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 30,
            transform: 'translate(-50%, 0)'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default EloDistributionByOpening; 