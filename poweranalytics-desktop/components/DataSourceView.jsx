
import React, { useRef, useState } from 'react';
import { Upload, FileText, Trash2, Database, Table, CheckCircle2 } from 'lucide-react';

const DataSourceView = ({ datasets, onAddDataset, onRemoveDataset }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                const rows = text.split('\n').map(row => row.trim()).filter(row => row !== '');

                if (rows.length < 1) throw new Error("Empty file");

                const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
                const data = rows.slice(1).map(row => {
                    const values = row.split(',');
                    return headers.reduce((obj, header, i) => {
                        let val = values[i]?.trim().replace(/^"|"$/g, '');
                        // Simple type inference
                        obj[header] = isNaN(Number(val)) || val === "" ? val : Number(val);
                        return obj;
                    }, {});
                });

                const columns = headers.map(h => ({
                    name: h,
                    type: typeof data[0][h] === 'number' ? 'number' : 'string'
                }));

                onAddDataset({
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    columns,
                    data
                });
            } catch (err) {
                alert("Failed to parse CSV. Please ensure it is a valid comma-separated file.");
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="p-10 space-y-10 max-w-6xl mx-auto min-h-full">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                        <Database size={12} />
                        Data Hub
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">External Sources</h2>
                    <p className="text-slate-500 max-w-lg">Manage your business data. Upload CSV files to create new visuals and unlock real-time dashboard insights.</p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-bold hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                    ) : (
                        <Upload size={20} />
                    )}
                    <span>{isUploading ? 'Processing...' : 'Add New CSV'}</span>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".csv"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {datasets.length === 0 ? (
                    <div className="col-span-full border-2 border-dashed border-slate-200 rounded-[3rem] p-32 flex flex-col items-center justify-center text-slate-400 bg-white/40">
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-6">
                            <Database size={48} className="text-indigo-600 opacity-20" />
                        </div>
                        <p className="text-lg font-bold text-slate-600">No data connected</p>
                        <p className="text-sm opacity-60 mt-2">Connect a source to begin your report analysis.</p>
                    </div>
                ) : (
                    datasets.map(ds => (
                        <div key={ds.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 tracking-tight text-lg truncate max-w-[160px]">{ds.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                                            <CheckCircle2 size={12} className="text-emerald-500" />
                                            <span>{ds.data.length} Records</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemoveDataset(ds.id)}
                                    className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                                    title="Remove Source"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Table size={12} />
                                    Column Dictionary
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {ds.columns.map(col => (
                                        <div key={col.name} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full hover:bg-white hover:border-indigo-100 transition-colors">
                                            <span className={`w-2 h-2 rounded-full ${col.type === 'number' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                            <span className="text-[11px] font-bold text-slate-600">{col.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-50">
                                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                    <span>Source: CSV</span>
                                    <span>Ready for Design</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DataSourceView;
