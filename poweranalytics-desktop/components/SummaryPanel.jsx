
import React from 'react';
import { Users, DollarSign, Star, Briefcase, TrendingUp } from 'lucide-react';

const SummaryPanel = ({ data }) => {
    if (!data || data.length === 0) return null;

    const avgSalary = data.reduce((acc, curr) => acc + curr.salary, 0) / data.length;
    const avgSatisfaction = data.reduce((acc, curr) => acc + curr.satisfaction, 0) / data.length;
    const deptCount = new Set(data.map(e => e.department)).size;

    return (
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <TrendingUp size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Workforce Summary</h3>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl group hover:bg-indigo-50 transition-colors">
                    <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Staff</p>
                        <h4 className="text-xl font-black text-slate-900 leading-none mt-1">{data.length}</h4>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl group hover:bg-indigo-50 transition-colors">
                    <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Salary</p>
                        <h4 className="text-xl font-black text-slate-900 leading-none mt-1">
                            ${(avgSalary / 1000).toFixed(1)}k
                        </h4>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl group hover:bg-indigo-50 transition-colors">
                    <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm">
                        <Star size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Satisfaction</p>
                        <h4 className="text-xl font-black text-slate-900 leading-none mt-1">{avgSatisfaction.toFixed(0)}%</h4>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl group hover:bg-indigo-50 transition-colors">
                    <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm">
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departments</p>
                        <h4 className="text-xl font-black text-slate-900 leading-none mt-1">{deptCount} active</h4>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8">
                <div className="p-4 bg-indigo-600 rounded-3xl text-white text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Status</p>
                    <p className="text-sm font-bold">Data Hub Connected</p>
                </div>
            </div>
        </div>
    );
};

export default SummaryPanel;
