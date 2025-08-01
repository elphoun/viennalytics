/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable id-length */
// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactElement } from 'react';

import PlotlyLazy from '../../report/chart/PlotlyLazy';

// ─ Interfaces ───────────────────────────────────────────────────────────────────────────────────
interface PlayerElo {
    name: string;
    elo: number;
}

interface EloBarChartProps {
    eloData: PlayerElo[];
}

const EloBarChart = ({ eloData }: EloBarChartProps): ReactElement => {
    const groupByEloRange = (players: PlayerElo[]) => {
        const ranges: Record<string, number> = {};

        players.forEach(player => {
            const rangeStart = Math.floor(player.elo / 100) * 100;
            const rangeEnd = rangeStart + 99;
            const rangeKey = `${rangeStart}-${rangeEnd}`;

            ranges[rangeKey] = (ranges[rangeKey] || 0) + 1;
        });

        return ranges;
    };

    const eloRanges = groupByEloRange(eloData);
    const sortedRanges = Object.keys(eloRanges).sort((a, b) => {
        const aStart = parseInt(a.split('-')[0], 2);
        const bStart = parseInt(b.split('-')[0], 2);
        return aStart - bStart;
    });

    const data = [{
        x: sortedRanges,
        y: sortedRanges.map(range => eloRanges[range]),
        type: 'bar' as const,
        marker: {
            color: '#F59E0B',
            line: {
                color: '#D97706',
                width: 1
            }
        },
        hovertemplate: '<b>%{x}</b><br>Players: %{y}<extra></extra>'
    }];

    const layout = {
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: '#9CA3AF' },
        xaxis: {
            gridcolor: '#374151',
            gridwidth: 0.5,
            tickfont: { size: 10 },
            title: { text: 'ELO Range', font: { size: 10 } }
        },
        yaxis: {
            gridcolor: '#374151',
            gridwidth: 0.5,
            tickfont: { size: 10 },
            title: { text: 'Number of Players', font: { size: 10 } }
        },
        margin: { l: 50, r: 50, t: 20, b: 70 },
        showlegend: false
    };

    const config = {
        displayModeBar: false,
        responsive: true
    };

    return (
        <div className="h-full w-full bg-black/20 rounded border border-gray-600/30">
            <PlotlyLazy
              data={data}
              layout={layout}
              config={config}
              style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default EloBarChart;