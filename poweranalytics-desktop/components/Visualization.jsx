
import React from 'react';
import {
    ResponsiveContainer,
    BarChart, Bar,
    LineChart, Line,
    PieChart, Pie, Cell,
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    RadialBarChart, RadialBar,
    Treemap,
    ComposedChart
} from 'recharts';
import { ChartType } from '../types';
import { CHART_COLORS } from '../constants';
import { MoreHorizontal, Download, Maximize2, GripHorizontal, Table as TableIcon, CreditCard, Filter } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-white/10 text-[11px] backdrop-blur-md">
                <p className="font-bold mb-2 border-b border-white/10 pb-2 uppercase tracking-wider">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 mb-1 last:mb-0">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                            <span className="opacity-70">{p.name}:</span>
                        </div>
                        <span className="font-black">
                            {typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : p.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const Visualization = ({ config, dataset, isActive, isEditMode }) => {
    if (!dataset) return null;

    const applyFilters = (data) => {
        if (!config.filters || config.filters.length === 0) return data;

        return data.filter(row => {
            return config.filters.every(f => {
                const val = row[f.column];
                const target = f.value;
                const targetSec = f.valueSecondary;

                switch (f.operator) {
                    // Text
                    case 'EQUALS': return String(val).toLowerCase() === String(target).toLowerCase();
                    case 'CONTAINS': return String(val).toLowerCase().includes(String(target).toLowerCase());
                    case 'STARTS_WITH': return String(val).toLowerCase().startsWith(String(target).toLowerCase());
                    case 'IS_EMPTY': return !val || val === '';
                    // Number
                    case 'GT': return Number(val) > Number(target);
                    case 'LT': return Number(val) < Number(target);
                    case 'BETWEEN': return Number(val) >= Number(target) && Number(val) <= Number(targetSec);
                    // Logic
                    case 'IS_TRUE': return !!val;
                    case 'IS_FALSE': return !val;
                    default: return true;
                }
            });
        });
    };

    const processData = () => {
        const { dimension, measures, aggregation, type } = config;
        if (!dimension || !measures || measures.length === 0) return [];

        const filteredData = applyFilters(dataset.data);
        const groups = {};

        filteredData.forEach(row => {
            const dimVal = String(row[dimension] || 'Unknown');
            if (!groups[dimVal]) groups[dimVal] = {};

            measures.forEach(m => {
                if (!groups[dimVal][m]) groups[dimVal][m] = { sum: 0, count: 0, min: Infinity, max: -Infinity };
                const val = Number(row[m]);
                if (!isNaN(val)) {
                    groups[dimVal][m].sum += val;
                    groups[dimVal][m].count += 1;
                    groups[dimVal][m].min = Math.min(groups[dimVal][m].min, val);
                    groups[dimVal][m].max = Math.max(groups[dimVal][m].max, val);
                }
            });
        });

        let result = Object.entries(groups).map(([name, statsMap]) => {
            const row = { name };
            measures.forEach(m => {
                const s = statsMap[m] || { sum: 0, count: 0, min: 0, max: 0 };
                if (aggregation === 'AVG') row[m] = s.count > 0 ? s.sum / s.count : 0;
                else if (aggregation === 'COUNT') row[m] = s.count;
                else if (aggregation === 'MIN') row[m] = s.min === Infinity ? 0 : s.min;
                else if (aggregation === 'MAX') row[m] = s.max === -Infinity ? 0 : s.max;
                else row[m] = s.sum;
            });
            return row;
        });

        if (type.includes('PERCENT')) {
            result = result.map(row => {
                const total = measures.reduce((acc, m) => acc + (row[m] || 0), 0);
                const newRow = { ...row };
                measures.forEach(m => {
                    newRow[m] = total === 0 ? 0 : (row[m] / total) * 100;
                });
                return newRow;
            });
        }

        return result.sort((a, b) => (b[measures[0]] || 0) - (a[measures[0]] || 0)).slice(0, 15);
    };

    const chartData = processData();
    const isSmall = config.layout.w < 4;

    const renderVisual = () => {
        if (chartData.length === 0) return (
            <div className="h-full flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase tracking-widest p-12 text-center">
                No results match the current filters
            </div>
        );

        const { type, measures } = config;

        if (type === ChartType.TABLE) {
            return (
                <div className="h-full overflow-auto text-[11px] font-medium text-slate-600">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="py-3 px-4 uppercase tracking-widest font-black text-slate-400 text-[9px] sticky top-0 bg-white">{config.dimension}</th>
                                {measures.map(m => <th key={m} className="py-3 px-4 uppercase tracking-widest font-black text-slate-400 text-[9px] sticky top-0 bg-white">{m}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map((row, idx) => (
                                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                                    {measures.map(m => <td key={m} className="py-3 px-4">{Number(row[m]).toLocaleString()}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (type === ChartType.KPI_SINGLE) {
            const primaryValue = chartData.reduce((acc, curr) => acc + (curr[measures[0]] || 0), 0);
            return (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{config.title || measures[0]}</p>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                        {primaryValue > 1000 ? (primaryValue / 1000).toFixed(1) + 'k' : primaryValue.toLocaleString()}
                    </h2>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Filtered Total
                    </div>
                </div>
            );
        }

        switch (type) {
            case ChartType.BAR_CLUSTERED:
            case ChartType.BAR_STACKED:
            case ChartType.BAR_PERCENT:
                return (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} hide={isSmall} />
                        <YAxis fontSize={9} axisLine={false} tickLine={false} hide={isSmall} />
                        <Tooltip content={<CustomTooltip />} />
                        {measures.map((m, i) => (
                            <Bar key={m} dataKey={m} stackId={type === ChartType.BAR_CLUSTERED ? undefined : 'stack'} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={type === ChartType.BAR_STACKED && i < measures.length - 1 ? [0, 0, 0, 0] : [4, 4, 0, 0]} />
                        ))}
                    </BarChart>
                );

            case ChartType.LINE_SMOOTH:
            case ChartType.LINE_STRAIGHT:
                return (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={9} hide={isSmall} axisLine={false} tickLine={false} />
                        <YAxis fontSize={9} hide={isSmall} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        {measures.map((m, i) => (
                            <Line key={m} type={type === ChartType.LINE_SMOOTH ? 'monotone' : 'linear'} dataKey={m} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={3} dot={{ r: 3, strokeWidth: 2, fill: '#fff' }} />
                        ))}
                    </LineChart>
                );

            case ChartType.PIE:
            case ChartType.DONUT:
                return (
                    <PieChart>
                        <Pie data={chartData} dataKey={measures[0]} nameKey="name" innerRadius={type.includes('DONUT') ? '60%' : '0%'} outerRadius="85%" stroke="none">
                            {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                );

            default:
                return <div className="h-full flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Visual Type</div>;
        }
    };

    return (
        <div className={`h-full w-full bg-white rounded-[2.5rem] border flex flex-col group overflow-hidden transition-all duration-300 ${isEditMode ? 'p-5 shadow-sm' : 'p-6 shadow-none border-transparent'} ${isActive ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-xl scale-[1.01]' : 'border-white hover:border-slate-100'}`}>
            <div className="flex justify-between items-start mb-4 shrink-0">
                <div className="flex items-start gap-3 overflow-hidden">
                    {isEditMode && <div className="drag-handle mt-0.5 cursor-move p-1 text-slate-300 hover:text-indigo-500 transition-colors shrink-0"><GripHorizontal size={14} /></div>}
                    <div className="overflow-hidden">
                        <h3 className="text-[11px] font-black text-slate-800 tracking-tight uppercase leading-none truncate">{config.title || "Analytics Card"}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">{config.type.replace(/_/g, ' ')}</p>
                            {config.filters.length > 0 && <Filter size={8} className="text-indigo-500" />}
                        </div>
                    </div>
                </div>
                {isEditMode && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Maximize2 size={14} /></button>
                        <button className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><MoreHorizontal size={14} /></button>
                    </div>
                )}
            </div>
            <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    {renderVisual()}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Visualization;
