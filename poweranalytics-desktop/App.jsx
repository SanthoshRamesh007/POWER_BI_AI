
import React, { useState, useMemo, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Visualization from './components/Visualization';
import DataSourceView from './components/DataSourceView';
import DataPanel from './components/DataPanel';
import {
    Plus,
    BarChart as BarChartIcon,
    Database,
    Save,
    Trash2,
    Eye,
    Settings,
    X,
    PlusCircle
} from 'lucide-react';
import { ChartType } from './types';
import { MOCK_EMPLOYEES, INITIAL_CHARTS } from './constants';

const ResponsiveGridLayout = WidthProvider(Responsive);
const STORAGE_KEY_CHARTS = 'power_bi_v3_charts_restored';
const STORAGE_KEY_PAGES = 'power_bi_v3_pages_restored';

const App = () => {
    const [view, setView] = useState('report');
    const [isEditMode, setIsEditMode] = useState(true);
    const [datasets, setDatasets] = useState([]);
    const [pages, setPages] = useState([]);
    const [activePageId, setActivePageId] = useState('');
    const [charts, setCharts] = useState([]);
    const [selectedDatasetId, setSelectedDatasetId] = useState('');
    const [activeChartId, setActiveChartId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const sampleId = 'sample-hr-data';
        const sampleDataset = {
            id: sampleId,
            name: 'Workforce Master Data',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'department', type: 'string' },
                { name: 'salary', type: 'number' },
                { name: 'rating', type: 'number' },
                { name: 'tenure', type: 'number' },
                { name: 'satisfaction', type: 'number' },
                { name: 'gender', type: 'string' },
            ],
            data: MOCK_EMPLOYEES
        };
        setDatasets([sampleDataset]);
        setSelectedDatasetId(sampleId);

        const savedPages = localStorage.getItem(STORAGE_KEY_PAGES);
        const savedCharts = localStorage.getItem(STORAGE_KEY_CHARTS);

        if (savedPages && savedCharts) {
            try {
                setPages(JSON.parse(savedPages));
                setCharts(JSON.parse(savedCharts));
                const parsedPages = JSON.parse(savedPages);
                if (parsedPages.length > 0) setActivePageId(parsedPages[0].id);
            } catch (e) { console.error(e); }
        } else {
            const firstPageId = 'page-1';
            setPages([{ id: firstPageId, name: 'Workforce Overview' }]);
            setCharts(INITIAL_CHARTS);
            setActivePageId(firstPageId);
        }
    }, []);

    const handleSaveDashboard = () => {
        setIsSaving(true);
        localStorage.setItem(STORAGE_KEY_CHARTS, JSON.stringify(charts));
        localStorage.setItem(STORAGE_KEY_PAGES, JSON.stringify(pages));
        setTimeout(() => setIsSaving(false), 800);
    };

    const handleAddPage = () => {
        const newPage = { id: `page-${Date.now()}`, name: `Page ${pages.length + 1}` };
        setPages([...pages, newPage]);
        setActivePageId(newPage.id);
    };

    const handleRemovePage = (e, id) => {
        e.stopPropagation();
        if (pages.length <= 1) return;
        const updatedPages = pages.filter(p => p.id !== id);
        setPages(updatedPages);
        setCharts(charts.filter(c => c.pageId !== id));
        if (activePageId === id) setActivePageId(updatedPages[0].id);
    };

    const handleAddChart = () => {
        const dataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];
        if (!dataset || !activePageId) return;

        const newChart = {
            id: Math.random().toString(36).substr(2, 9),
            pageId: activePageId,
            datasetId: dataset.id,
            title: 'New Comparison Visual',
            type: ChartType.BAR_CLUSTERED,
            dimension: dataset.columns.find(c => c.type === 'string')?.name || '',
            measures: [dataset.columns.find(c => c.type === 'number')?.name || ''],
            aggregation: 'SUM',
            layout: { x: 0, y: Infinity, w: 6, h: 8 },
            filters: []
        };
        setCharts([...charts, newChart]);
        setActiveChartId(newChart.id);
        if (view !== 'report') setView('report');
    };

    const handleRemoveChart = (id) => {
        setCharts(prev => prev.filter(c => c.id !== id));
        if (activeChartId === id) setActiveChartId(null);
    };

    const onLayoutChange = (currentLayout) => {
        setCharts(prev => prev.map(chart => {
            const gridItem = currentLayout.find(item => item.i === chart.id);
            if (gridItem && chart.pageId === activePageId) {
                return { ...chart, layout: { x: gridItem.x, y: gridItem.y, w: gridItem.w, h: gridItem.h } };
            }
            return chart;
        }));
    };

    const currentPageCharts = useMemo(() => charts.filter(c => c.pageId === activePageId), [charts, activePageId]);
    const gridLayouts = useMemo(() => currentPageCharts.map(c => ({ i: c.id, ...c.layout })), [currentPageCharts]);

    return (
        <div className="flex flex-col h-screen text-slate-800 overflow-hidden font-jakarta bg-[#f8fafc]">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar setView={setView} currentView={view} />
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {view === 'data' ? (
                        <DataSourceView datasets={datasets} onAddDataset={ds => { setDatasets(p => [...p, ds]); setSelectedDatasetId(ds.id); }} onRemoveDataset={id => setDatasets(p => p.filter(d => d.id !== id))} />
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-8 pt-8 flex items-center justify-between shrink-0 z-20">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                                        <Database size={12} />
                                        <span>Report: {pages.find(p => p.id === activePageId)?.name}</span>
                                    </div>
                                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">{isEditMode ? 'Visual Designer' : 'Report Preview'}</h1>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsEditMode(!isEditMode)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold border transition-all ${isEditMode ? 'bg-white text-slate-600 border-slate-200 shadow-sm' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                                        {isEditMode ? <Eye size={18} /> : <Settings size={18} />}
                                        <span>{isEditMode ? 'Preview' : 'Edit Mode'}</span>
                                    </button>
                                    <button onClick={handleSaveDashboard} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm border ${isSaving ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                        <Save size={18} className={isSaving ? 'animate-pulse' : ''} />
                                        <span>{isSaving ? 'Saving...' : 'Save Layout'}</span>
                                    </button>
                                    <button onClick={handleAddChart} disabled={datasets.length === 0} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50">
                                        <Plus size={18} />
                                        <span>Add Visual</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden p-8 gap-8">
                                <div className={`flex-1 overflow-y-auto designer-scroll-container rounded-[3rem] border border-slate-200 shadow-inner p-4 relative transition-colors duration-500 ${isEditMode ? 'designer-canvas bg-white/50' : 'bg-white border-transparent shadow-none'}`}>
                                    <ResponsiveGridLayout className="layout" layouts={{ lg: gridLayouts }} breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }} cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }} rowHeight={40} draggableHandle=".drag-handle" onLayoutChange={onLayoutChange} isDraggable={isEditMode} isResizable={isEditMode} margin={[24, 24]}>
                                        {currentPageCharts.map(config => (
                                            <div key={config.id} onClick={() => isEditMode && setActiveChartId(config.id)}>
                                                <div className={`h-full w-full relative group transition-all ${activeChartId === config.id && isEditMode ? 'z-10' : ''}`}>
                                                    <Visualization config={config} dataset={datasets.find(d => d.id === config.datasetId)} isActive={activeChartId === config.id && isEditMode} isEditMode={isEditMode} />
                                                    {activeChartId === config.id && isEditMode && (
                                                        <button onClick={(e) => { e.stopPropagation(); handleRemoveChart(config.id); }} className="absolute -top-3 -right-3 bg-white text-rose-500 p-2.5 rounded-full shadow-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all z-20">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </ResponsiveGridLayout>
                                    {currentPageCharts.length === 0 && <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none"><BarChartIcon size={64} className="opacity-10 mb-4" /><p className="text-lg font-medium">Add visuals to start your report.</p></div>}
                                </div>

                                <DataPanel datasets={datasets} selectedDatasetId={selectedDatasetId} setSelectedDatasetId={setSelectedDatasetId} activeChartConfig={charts.find(c => c.id === activeChartId) || null} onUpdateConfig={(updates) => { if (activeChartId) setCharts(p => p.map(c => c.id === activeChartId ? { ...c, ...updates } : c)); }} onUpdateLayout={(updates) => { if (activeChartId) setCharts(p => p.map(c => c.id === activeChartId ? { ...c, layout: { ...c.layout, ...updates } } : c)); }} chartsCount={charts.length} />
                            </div>
                        </div>
                    )}
                </main>
            </div>
            <footer className="h-14 bg-white border-t border-slate-100 px-8 flex items-center justify-between shrink-0 z-40">
                <div className="flex items-center gap-1">
                    {pages.map((p) => (
                        <div key={p.id} className="group relative flex items-center">
                            <button onClick={() => { setActivePageId(p.id); setView('report'); }} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activePageId === p.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
                                {p.name}
                                {pages.length > 1 && <span onClick={(e) => handleRemovePage(e, p.id)} className={`ml-1 hover:text-rose-200 transition-colors ${activePageId === p.id ? 'opacity-50' : 'hidden group-hover:block'}`}><X size={12} /></span>}
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAddPage} className="p-2 ml-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><PlusCircle size={18} /></button>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>{currentPageCharts.length} Objects</span>
                    <div className="h-4 w-[1px] bg-slate-200" />
                    <span>PowerBI Engine v3.0</span>
                </div>
            </footer>
        </div>
    );
};

export default App;
