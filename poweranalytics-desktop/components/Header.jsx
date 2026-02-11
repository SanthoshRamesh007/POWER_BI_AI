
import React from 'react';
import { Bell, HelpCircle, Layout, Search, Settings } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-16 glass-panel border-b border-white/50 px-8 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-8 flex-1">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95">
                        <Layout className="text-white" size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">PowerBI Lite</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Workspace v2.0</span>
                    </div>
                </div>

                <div className="max-w-md w-full relative">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Find visuals, reports or help..."
                            className="w-full bg-slate-100/50 border border-transparent rounded-2xl px-11 py-2.5 text-sm text-slate-600 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white"
                        />
                        <Search size={18} className="absolute left-4 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 pr-4 border-r border-slate-100">
                    <button className="p-2.5 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-xl transition-all relative">
                        <Bell size={20} />
                        <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></div>
                    </button>
                    <button className="p-2.5 text-slate-400 hover:bg-white hover:text-indigo-600 rounded-xl transition-all">
                        <HelpCircle size={20} />
                    </button>
                </div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-800">Local User</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Editor Access</span>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-slate-200 border border-white shadow-sm flex items-center justify-center text-slate-600 font-bold text-sm">
                        LU
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
