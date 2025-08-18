"use client"

import * as d3 from 'd3';
import { FC, useEffect, useState, useMemo, memo, useRef, useCallback } from "react";
import { useQuery } from '@tanstack/react-query';
import { CHART_MESSAGES } from './Constants';

interface EloDistributionByOpeningProps {
    height?: number;
    maxOpenings?: number;
}

interface DataType {
    bins: string[];
    opening_counts: Record<string, number[]>;
}

interface ChartData {
    stackedData: number[][];
    binLabels: string[];
    openings: Array<{ opening: string; counts: number[]; total: number }>;
}

interface ProcessedData {
    chartData: ChartData | null;
    labels: string[];
    fullLabels: string[];
    maxValue: number;
}

const fetchEloData = async (): Promise<DataType> => {
    try {
        const response = await fetch('https://6sf2y06qu1484byz.public.blob.vercel-storage.com/openingUsagebyELO-mp8Bv10TiZ7jhqE1XPb4JQeAMBKi8R.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

const EloDistributionByOpening: FC<EloDistributionByOpeningProps> = memo(({ height = 520, maxOpenings = 10 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [activeOpenings, setActiveOpenings] = useState<Set<string> | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; html: string } | null>(null);
    const [isClient, setIsClient] = useState(false);

    const { data, isLoading: loading, error, isSuccess } = useQuery({
        queryKey: ['eloDistributionData'],
        queryFn: fetchEloData,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });

    const processedData = useMemo((): ProcessedData => {
        // Don't process if data isn't ready
        if (!data || !isSuccess) {
            return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
        }

        // Extract bins and opening_counts from the correct JSON structure
        const { bins, opening_counts } = data;

        if (!bins || !Array.isArray(bins) || bins.length === 0) {
            return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
        }

        if (!opening_counts || typeof opening_counts !== 'object') {
            return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
        }

        const allOpenings = Object.entries(opening_counts)
            .filter(([_, counts]) => Array.isArray(counts) && counts.length > 0)
            .map(([opening, counts]) => ({
                opening,
                counts: counts as number[],
                total: (counts as number[]).reduce((sum, count) => sum + (count || 0), 0)
            }))
            .filter(item => item.total > 0)
            .sort((a, b) => b.total - a.total)
            .slice(0, maxOpenings);

        if (allOpenings.length === 0) {
            return { chartData: null, labels: [], fullLabels: [], maxValue: 0 };
        }

        const labels = allOpenings.map(({ opening }) => opening);
        const stackedData = bins.map((_, binIndex) =>
            allOpenings.map(({ counts }) => counts[binIndex] || 0)
        );

        const maxValue = Math.max(...stackedData.map(binData =>
            binData.reduce((sum, val) => sum + val, 0)
        ));

        return {
            chartData: { stackedData, binLabels: bins, openings: allOpenings },
            labels,
            fullLabels: labels,
            maxValue
        };
    }, [data, maxOpenings, isSuccess]);

    const { chartData, labels, fullLabels, maxValue } = processedData;

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!containerRef.current || !isClient) return;

        const resizeObserver = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect;
            setDimensions({
                width: Math.max(width - 8, 1000),
                height
            });
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, [height, isClient]);

    const handleMouseMove = useCallback((event: any, bin: any, openingLabel: string, binIdx: number) => {
        const legendWidth = 240;
        const padding = { top: 30, right: legendWidth + 30, bottom: 80, left: 60 };
        const fullOpening = fullLabels[labels.indexOf(openingLabel)];
        const elo = chartData?.binLabels[binIdx];
        const count = Math.round(bin[1] - bin[0]);

        setTooltip({
            x: event.offsetX + padding.left,
            y: event.offsetY + padding.top - 20,
            html: `<div style='font-size:13px'><b>${fullOpening}</b><br/>ELO: <b>${elo}</b><br/>Count: <b>${count}</b></div>`
        });
    }, [chartData?.binLabels, fullLabels, labels]);

    const handleMouseLeave = useCallback(() => setTooltip(null), []);

    useEffect(() => {
        // Only render chart when all conditions are met:
        // 1. Data has been successfully fetched
        // 2. Chart data has been processed
        // 3. Dimensions are available
        // 4. SVG ref is ready
        if (!isSuccess || loading || !svgRef.current || !chartData || !labels.length || dimensions.width === 0) return;

        const shownOpenings = activeOpenings ? Array.from(activeOpenings) : labels;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const legendWidth = 240;
        const padding = { top: 30, right: legendWidth + 30, bottom: 80, left: 60 };
        const chartWidth = dimensions.width - padding.left - padding.right;
        const chartHeightInner = height - padding.top - padding.bottom;
        const { stackedData, binLabels } = chartData;

        const baseColors = [
            '#fb923c', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
            '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
            '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316'
        ];
        const colors = d3.range(labels.length).map((i: number) =>
            i < baseColors.length ? baseColors[i] : d3.interpolateRainbow(i / labels.length)
        );

        const stackInput = binLabels.map((_: string, binIdx: number) => {
            const obj: Record<string, number> = {};
            shownOpenings.forEach((label) => {
                const origIdx = labels.indexOf(label);
                obj[label] = stackedData[binIdx][origIdx] || 0;
            });
            return obj;
        });

        let yMax = maxValue;
        if (shownOpenings.length === 1) {
            const openingIdx = labels.indexOf(shownOpenings[0]);
            yMax = Math.max(...stackedData.map(bin => bin[openingIdx] || 0));
        }

        const y = d3.scaleLinear()
            .domain([0, yMax])
            .range([chartHeightInner, 0]);

        const x = d3.scaleBand()
            .domain(binLabels)
            .range([0, chartWidth])
            .paddingInner(0.1)
            .paddingOuter(0.05);

        const stack = d3.stack<Record<string, number>>().keys(shownOpenings);
        const series = stack(stackInput);

        const mainGroup = svg.append('g')
            .attr('transform', `translate(${padding.left},${padding.top})`);

        mainGroup.selectAll('g.opening')
            .data(series)
            .join('g')
            .attr('class', 'opening')
            .attr('fill', (_: any, openingIdx: number) => colors[labels.indexOf(shownOpenings[openingIdx])])
            .selectAll('rect')
            .data((binStack: any) => binStack)
            .join('rect')
            .attr('x', (_: any, binIdx: number) => x(binLabels[binIdx]) ?? 0)
            .attr('y', (d: any) => y(d[1]))
            .attr('height', (d: any) => y(d[0]) - y(d[1]))
            .attr('width', x.bandwidth())
            .style('cursor', 'pointer')
            .on('mousemove', (event: any, d: any) => {
                const target = event.currentTarget as SVGRectElement;
                const parent = target.parentNode as SVGGElement;
                const datum = d3.select(parent).datum() as { key: string };
                const binIdx = Array.from(parent.children).indexOf(target);
                handleMouseMove(event, d, datum.key, binIdx);
            })
            .on('mouseleave', handleMouseLeave);

        const maxXLabels = 6;
        const labelStep = Math.ceil(binLabels.length / maxXLabels);

        mainGroup.append('g')
            .attr('transform', `translate(0,${chartHeightInner})`)
            .call(d3.axisBottom(x).tickFormat((tickLabel: any, i: number) =>
                i % labelStep === 0 ? tickLabel as string : ''
            ))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        mainGroup.append('g').call(d3.axisLeft(y).ticks(5));

        svg.append('text')
            .attr('x', padding.left + chartWidth / 2)
            .attr('y', height - 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ea580c')
            .attr('font-size', 13)
            .text('ELO Rating');

        const yLabel = shownOpenings.length === 1 ? shownOpenings[0] : 'Players';
        svg.append('text')
            .attr('transform', `translate(20,${padding.top + chartHeightInner / 2}) rotate(-90)`)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ea580c')
            .attr('font-size', 13)
            .text(yLabel);
    }, [isSuccess, loading, chartData, labels, fullLabels, dimensions, height, maxValue, activeOpenings, handleMouseMove, handleMouseLeave]);

    const handleLegendClick = useCallback((label: string) => {
        setActiveOpenings(prev => {
            if (!prev) {
                return new Set(labels.filter(lbl => lbl !== label));
            }
            const next = new Set(prev);
            if (next.has(label)) {
                next.delete(label);
            } else {
                next.add(label);
            }
            return next.size === 0 ? null : next;
        });
    }, [labels]);

    const handleLegendDoubleClick = useCallback((label: string) => {
        setActiveOpenings(new Set([label]));
    }, []);

    // Show loading state while data is being fetched or processed
    if (loading || (!isSuccess && !error)) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <span className="text-gray-400 italic">{CHART_MESSAGES.loading}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <span className="text-red-400 italic">{CHART_MESSAGES.error}{error instanceof Error ? error.message : 'Unknown error'}</span>
            </div>
        );
    }

    if (!chartData) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-4">
                <span className="text-gray-400 italic mb-4">{CHART_MESSAGES.noData}</span>
                {data && (
                    <div className="text-xs text-gray-500 max-w-md">
                        <p>Debug info:</p>
                        <p>Data keys: {Object.keys(data).join(', ')}</p>
                        <p>Has bins: {!!data.bins}</p>
                        <p>Has opening_counts: {!!data.opening_counts}</p>
                        <p>Bins length: {data.bins?.length || 0}</p>
                        <p>Opening count keys: {data.opening_counts ? Object.keys(data.opening_counts).length : 0}</p>
                    </div>
                )}
            </div>
        );
    }

    const legendWidth = 240;
    const padding = { top: 30, right: legendWidth + 30, bottom: 80, left: 60 };
    const chartHeightInner = height - padding.top - padding.bottom;
    const baseColors = [
        '#fb923c', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
        '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
        '#d946ef', '#ec4899', '#f43f5e', '#ef4444', '#f97316'
    ];
    const colors = d3.range(labels.length).map((i: number) =>
        i < baseColors.length ? baseColors[i] : d3.interpolateRainbow(i / labels.length)
    );

    return (
        <div ref={containerRef} className="w-full h-fit min-h-[520px] relative">
            {isClient && dimensions.width > 0 && isSuccess && chartData && (
                <div className="flex relative">
                    {/* Scrollable Chart Area */}
                    <div
                        className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-slate-800"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#ea580c rgba(30,41,59,0.3)',
                            marginRight: `${legendWidth + 20}px`
                        }}
                    >
                        <svg
                            ref={svgRef}
                            width={Math.max(dimensions.width, 1200)}
                            height={height}
                            aria-label="ELO Distribution by Opening Histogram"
                            style={{
                                display: 'block',
                                minWidth: '1200px',
                                border: '3px solid #ea580c',
                                background: '#18181b'
                            }}
                        />
                        {tooltip && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: tooltip.x,
                                    top: tooltip.y,
                                    pointerEvents: 'none',
                                    background: 'rgba(30,41,59,0.97)',
                                    color: '#fff',
                                    borderRadius: 8,
                                    padding: '6px 12px',
                                    boxShadow: '0 2px 8px #0002',
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

                    {/* Fixed Legend */}
                    <div
                        style={{
                            position: 'absolute',
                            right: 10,
                            top: padding.top + 10,
                            maxHeight: Math.min(chartHeightInner - 20, 350),
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            width: legendWidth,
                            background: 'rgba(30,41,59,0.95)',
                            borderRadius: 8,
                            border: '1px solid #ea580c',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            zIndex: 5,
                            padding: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#ea580c rgba(30,41,59,0.3)',
                        }}
                        className="scrollbar-thin scrollbar-thumb-orange-600 scrollbar-track-slate-700"
                    >
                        {labels.map((label, i) => (
                            <div
                                key={label}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    opacity: !activeOpenings || activeOpenings.has(label) ? 1 : 0.3,
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    fontSize: 11,
                                    fontFamily: 'inherit',
                                    padding: '2px 4px',
                                    borderRadius: 4,
                                    minWidth: 0,
                                }}
                                title={label}
                                onClick={() => handleLegendClick(label)}
                                onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    handleLegendDoubleClick(label);
                                }}
                            >
                                <span
                                    style={{
                                        display: 'inline-block',
                                        width: 12,
                                        height: 12,
                                        borderRadius: 3,
                                        background: colors[i],
                                        border: '1px solid #fff3',
                                        marginRight: 6,
                                        flexShrink: 0,
                                    }}
                                />
                                <span style={{
                                    color: '#ea580c',
                                    fontWeight: 500,
                                    fontSize: 11,
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1
                                }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

EloDistributionByOpening.displayName = 'EloDistributionByOpening';

export default EloDistributionByOpening;