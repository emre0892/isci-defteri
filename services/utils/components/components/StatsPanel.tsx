import React from 'react';
import { MonthlyStats, AppSettings } from '../types';

interface StatsPanelProps {
  stats: MonthlyStats;
  settings: AppSettings;
  texts: any;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, settings, texts }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 mb-6 relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wide">{texts.statsTitle}</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-slate-400 font-semibold">{texts.netPayable}:</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-800 mt-0">
            {stats.netPayable.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} 
            <span className="text-lg font-semibold text-slate-400 ml-1">{settings.currency}</span>
          </div>
          {stats.totalAdvances > 0 && (
            <div className="text-xs text-red-500 mt-1 font-medium">
               - {stats.totalAdvances.toLocaleString()} {settings.currency} ({texts.totalAdvance})
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-blue-50 p-2 rounded-xl border border-blue-100 text-center">
          <div className="text-blue-600 text-[10px] font-bold uppercase">{texts.full}</div>
          <div className="text-xl font-bold text-slate-800">{stats.totalFullDays}</div>
        </div>
        <div className="bg-orange-50 p-2 rounded-xl border border-orange-100 text-center">
          <div className="text-orange-600 text-[10px] font-bold uppercase">{texts.half}</div>
          <div className="text-xl font-bold text-slate-800">{stats.totalHalfDays}</div>
        </div>
        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100 text-center">
          <div className="text-emerald-600 text-[10px] font-bold uppercase">{texts.gross}</div>
          <div className="text-sm font-bold text-slate-800 truncate">
             {stats.grossEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
    </div>
  );
};
