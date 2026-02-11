
import React, { useState } from 'react';
import {
    BarChart, LineChart, PieChart, Table as TableIcon, Search, Database,
    Calendar, Layers, Box, Maximize2, Settings2, ArrowRight,
    CheckCircle2, Target, Grid3X3, Activity, PieChart as PieIcon, LayoutGrid, Type,
    CreditCard, Filter, X, Plus, ChevronDown
} from 'lucide-react';
import { ChartType } from '../types';

const VISUAL_CATEGORIES = [
    {
        name: 'Comparison',
        icon: Grid3X3,
        types: [
            ChartType.BAR_CLUSTERED, ChartType.BAR_STACKED, ChartType.BAR_PERCENT,
            ChartType.BAR_HORIZONTAL, ChartType.RADAR
        ]
    },
    {
        name: 'Trend',
        icon: Activity,
        types: [
            ChartType.LINE_SMOOTH, ChartType.LINE_STRAIGHT, ChartType.AREA_SMOOTH,
            ChartType.COMBO_BAR_LINE
        ]
    },
    {
        name: 'Part-to-Whole',
        icon: PieIcon,
        types: [ChartType.PIE, ChartType.DONUT, ChartType.TREEMAP]
    },
    {
        name: 'Indicators',
        icon: Type,
        types: [ChartType.KPI_SINGLE, ChartType.TABLE]
    }
];

const OPERATORS_MAP = {
    string: [
        { label: 'Equals', value: 'EQUALS' },
        { label: 'Contains', value: 'CONTAINS' },
        { label: 'Starts With', value: 'STARTS_WITH' },
        { label: 'Is Empty', value: 'IS_EMPTY' }
    ],
    number: [
        { label: 'Greater Than', value: 'GT' },
        { label: 'Less Than', value: 'LT' },
        { label: 'Equals', value: 'EQUALS' },
        { label: 'Between', value: 'BETWEEN' }
    ],
    boolean: [
        { label: 'Is True', value: 'IS_TRUE' },
        { label: 'Is False', value: 'IS_FALSE' }
    ]
};

const DataPanel = ({
    datasets,
    selectedDatasetId,
    setSelectedDatasetId,
    activeChartConfig,
    onUpdateConfig,
    onUpdateLayout,
}) => {
    const [activePane, setActivePane] = useState('data');
    const [fieldSearch, setFieldSearch] = useState('');
    const [visualSearch, setVisualSearch] = useState('');

    const selectedDataset = datasets.find(d => d.id === selectedDatasetId);
    const filteredColumns = selectedDataset?.columns.filter(col =>
        col.name.toLowerCase().includes(fieldSearch.toLowerCase())
    ) || [];

    const addFilter = () => {
        if (!activeChartConfig || !selectedDataset) return;
        const col = selectedDataset.columns[0];
        const newFilter = {
            id: Math.random().toString(36).substr(2, 9),
            column: col.name,
            operator: OPERATORS_MAP[col.type][0].value,
            value: col.type === 'number' ? 0 : ''
        };
        onUpdateConfig({ filters: [...(activeChartConfig.filters || []), newFilter] });
    };

    const removeFilter = (id) => {
        if (!activeChartConfig) return;
        onUpdateConfig({ filters: activeChartConfig.filters.filter(f => f.id !== id) });
    };

    const updateFilter = (id, updates) => {
        if (!activeChartConfig) return;
        onUpdateConfig({
            filters: activeChartConfig.filters.map(f => f.id === id ? { ...f, ...updates } : f)
        });
    };

    return (
        <aside className="w-80 shrink-0 h-full flex flex-col gap-6 overflow-hidden">
            <div className="glass-panel rounded-[2.5rem] border-white shadow-sm flex flex-col h-full overflow-hidden">

                <div className="flex border-b border-slate-50 p-2 gap-1 shrink-0">
                    <button onClick={() => setActivePane('data')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[11px] font-bold transition-all ${activePane === 'data' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <Database size={14} /> Data
                    </button>
                    <button onClick={() => setActivePane('format')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[11px] font-bold transition-all ${activePane === 'format' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
                        <Settings2 size={14} /> Format
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 designer-scroll-container">
                    {activePane === 'data' ? (
                        <>
                            {/* Visual Gallery */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Gallery</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {VISUAL_CATEGORIES.flatMap(c => c.types).slice(0, 12).map(type => (
                                        <button key={type} onClick={() => onUpdateConfig({ type })} className={`aspect-square flex items-center justify-center rounded-xl border transition-all ${activeChartConfig?.type === type ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'}`}>
                                            {type.includes('BAR') && <BarChart size={16} />}
                                            {type.includes('LINE') && <LineChart size={16} />}
                                            {type.includes('PIE') && <PieChart size={16} />}
                                            {type.includes('TABLE') && <TableIcon size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filtering Engine */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Filters</h4>
                                    <button onClick={addFilter} disabled={!activeChartConfig} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {activeChartConfig?.filters?.map(f => {
                                        const col = selectedDataset?.columns.find(c => c.name === f.column);
                                        const ops = OPERATORS_MAP[col?.type || 'string'];

                                        return (
                                            <div key={f.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 group relative">
                                                <button onClick={() => removeFilter(f.id)} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <X size={12} />
                                                </button>

                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">Column</p>
                                                    <select
                                                        value={f.column}
                                                        onChange={(e) => updateFilter(f.id, { column: e.target.value })}
                                                        className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-[10px] font-bold focus:outline-none"
                                                    >
                                                        {selectedDataset?.columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Operator</p>
                                                        <select
                                                            value={f.operator}
                                                            onChange={(e) => updateFilter(f.id, { operator: e.target.value })}
                                                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-[10px] font-bold"
                                                        >
                                                            {ops.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Value</p>
                                                        <input
                                                            type={col?.type === 'number' ? 'number' : 'text'}
                                                            value={f.value}
                                                            onChange={(e) => updateFilter(f.id, { value: e.target.value })}
                                                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-[10px] font-bold"
                                                            placeholder="..."
                                                        />
                                                    </div>
                                                </div>

                                                {f.operator === 'BETWEEN' && (
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">To Value</p>
                                                        <input
                                                            type="number"
                                                            value={f.valueSecondary || ''}
                                                            onChange={(e) => updateFilter(f.id, { valueSecondary: e.target.value })}
                                                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-[10px] font-bold"
                                                            placeholder="Max range..."
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {(!activeChartConfig?.filters || activeChartConfig.filters.length === 0) && (
                                        <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <Filter size={16} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">No Active Filters</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Field Picker */}
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Fields</h4>
                                <div className="space-y-1">
                                    {filteredColumns.map(col => {
                                        const isSelected = activeChartConfig?.dimension === col.name || activeChartConfig?.measures.includes(col.name);
                                        return (
                                            <div key={col.name} className={`flex items-center gap-3 py-2 px-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                                                <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-lg bg-white shadow-sm text-slate-400">{col.type === 'number' ? 'Σ' : 'Aa'}</span>
                                                <span className="text-[11px] font-bold text-slate-600 truncate">{col.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Properties</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visual Title</label>
                                    <input type="text" value={activeChartConfig?.title || ''} onChange={(e) => onUpdateConfig({ title: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold" />
                                </div>
                                <div className="p-5 bg-slate-50 rounded-[1.5rem] space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between"><span className="text-[10px] font-bold text-slate-400 uppercase">Width</span><span className="text-xs font-black text-indigo-600">{activeChartConfig?.layout.w}</span></div>
                                        <input type="range" min="2" max="12" value={activeChartConfig?.layout.w || 4} onChange={(e) => onUpdateLayout({ w: parseInt(e.target.value) })} className="w-full accent-indigo-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!activeChartConfig && (
                    <div className="mt-auto p-8 text-center bg-slate-50/50">
                        <Target size={32} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">Focus a visual to tweak</p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default DataPanel;
