import React from 'react';
import { SimulationResults } from '../types';
import { cn } from '../lib/utils';

interface ProcessTableProps {
  results: SimulationResults;
  currentTime: number;
  compareMode: boolean;
  algorithmName: string;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({
  results,
  currentTime,
  compareMode,
  algorithmName
}) => {
  return (
    <div className="bg-white border border-brand-border rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden min-h-75">
      <div className="p-6 border-b border-brand-border flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-brand-muted">Detailed Statistics</h3>
          <p className="text-[9px] text-[#9CA3AF]">Metrics for <span className="font-bold text-brand-text">{algorithmName}</span> algorithm</p>
        </div>
        {!compareMode && (
          <div className="flex gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Waiting</span>
              <span className="text-lg font-bold text-brand-primary">{results.averageWaitingTime.toFixed(2)}ms</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Turnaround</span>
              <span className="text-lg font-bold text-brand-primary">{results.averageTurnaroundTime.toFixed(2)}ms</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-brand-bg">
              <th className="p-5 text-[10px] font-bold text-brand-muted uppercase tracking-wider border-b border-brand-border">Process ID</th>
              <th className="p-5 text-[10px] font-bold text-brand-muted uppercase tracking-wider border-b border-brand-border">Arrival</th>
              <th className="p-5 text-[10px] font-bold text-brand-muted uppercase tracking-wider border-b border-brand-border">Burst</th>
              <th className="p-5 text-[10px] font-bold text-brand-muted uppercase tracking-wider border-b border-brand-border">Priority</th>
              <th className="p-5 text-[10px] font-bold text-brand-muted] uppercase tracking-wider border-b border-brand-border">Completion</th>
              <th className="p-5 text-[10px] font-bold text-brand-muted uppercase tracking-wider border-b border-brand-border">Turnaround</th>
              <th className="p-5 text-[10px] font-bold text-brand-muted uppercase tracking-wider border-b border-brand-border">Waiting</th>
              <th className="p-5 text-[10px] font-bold text-brand-muted uppercase tracking-wider border-b border-brand-border">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {results.processResults.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true})).map((r) => {
              const isFinished = currentTime >= r.completionTime;
              return (
                <tr key={r.id} className="hover:bg-brand-bg transition-colors">
                  <td className="p-5 text-sm font-bold text-brand-text">{r.id} Unit</td>
                  <td className="p-5 text-sm text-brand-muted font-mono">{r.arrivalTime}</td>
                  <td className="p-5 text-sm text-brand-muted font-mono">{r.burstTime}</td>
                  <td className="p-5 text-sm text-brand-muted font-mono">{r.priority}</td>
                  <td className="p-5 text-sm font-bold font-mono">{isFinished ? r.completionTime : '--'}</td>
                  <td className="p-5 text-sm font-bold text-brand-primary font-mono">{isFinished ? r.turnaroundTime : '--'}</td>
                  <td className="p-5 text-sm font-bold text-brand-primary font-mono">{isFinished ? r.waitingTime : '--'}</td>
                  <td className="p-5 text-sm">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      isFinished ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F3F4F6] text-brand-muted"
                    )}>
                      {isFinished ? 'Finished' : 'Waiting'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
