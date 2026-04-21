import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AlgorithmType, UIProcess } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  processes: UIProcess[];
  algorithm: AlgorithmType;
  compareMode: boolean;
  selectedAlgorithms: AlgorithmType[];
  quantum: number;
  playbackSpeed: number;
  isPlaying: boolean;
  onUpdateProcess: (id: string, field: keyof UIProcess, value: any) => void;
  onRemoveProcess: (id: string) => void;
  onAddProcess: () => void;
  onSetAlgorithm: (alg: AlgorithmType) => void;
  onSetCompareMode: (mode: boolean) => void;
  onSetSelectedAlgorithms: (algs: AlgorithmType[]) => void;
  onSetQuantum: (q: number) => void;
  onSetPlaybackSpeed: (speed: number) => void;
  onTogglePlay: () => void;
  onReset: () => void;
}

const ALGORITHMS: AlgorithmType[] = ['FCFS', 'SJF', 'SRTF', 'RR', 'Priority', 'Priority-Preemptive'];

export const Sidebar: React.FC<SidebarProps> = ({
  processes,
  algorithm,
  compareMode,
  selectedAlgorithms,
  quantum,
  playbackSpeed,
  isPlaying,
  onUpdateProcess,
  onRemoveProcess,
  onAddProcess,
  onSetAlgorithm,
  onSetCompareMode,
  onSetSelectedAlgorithms,
  onSetQuantum,
  onSetPlaybackSpeed,
  onTogglePlay,
  onReset
}) => {
  return (
    <aside className="w-[300px] bg-white border-r border-[#E5E7EB] flex flex-col p-6 h-full overflow-y-auto shrink-0">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 bg-[#2563EB] rounded-lg"></div>
        <span className="font-bold text-lg tracking-tight">CPU Scheduler</span>
      </div>

      <div className="flex items-center justify-between mb-2 px-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Algorithm</label>
        <button 
          onClick={() => { onSetCompareMode(!compareMode); onReset(); }}
          className="flex items-center gap-1.5 px-1.5 py-1 bg-[#F9FAFB] rounded-full border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-all"
        >
          <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full", !compareMode ? "bg-[#2563EB] text-white shadow-sm" : "text-[#6B7280]")}>Single</span>
          <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full", compareMode ? "bg-[#2563EB] text-white shadow-sm" : "text-[#6B7280]")}>Compare</span>
        </button>
      </div>

      {!compareMode ? (
        <select 
          value={algorithm}
          onChange={(e) => { onSetAlgorithm(e.target.value as AlgorithmType); onReset(); }}
          className="w-full p-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm mb-6 outline-none focus:border-[#2563EB] transition-colors"
        >
          <option value="FCFS">First Come First Serve (FCFS)</option>
          <option value="SJF">Shortest Job First (SJF)</option>
          <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
          <option value="RR">Round Robin (RR)</option>
          <option value="Priority">Priority (Non-preemptive)</option>
          <option value="Priority-Preemptive">Priority (Preemptive)</option>
        </select>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-6">
          {ALGORITHMS.map((alg) => (
            <label 
              key={alg} 
              className={cn(
                "flex items-center gap-2 p-1.5 border rounded-lg cursor-pointer transition-all",
                selectedAlgorithms.includes(alg) ? "border-[#2563EB] bg-blue-50/30" : "border-[#E5E7EB] hover:border-[#D1D5DB]"
              )}
            >
              <input 
                type="checkbox" 
                className="hidden" 
                checked={selectedAlgorithms.includes(alg)}
                onChange={() => {
                  const next = selectedAlgorithms.includes(alg) 
                    ? selectedAlgorithms.filter(a => a !== alg)
                    : [...selectedAlgorithms, alg];
                  if (next.length > 0) {
                    onSetSelectedAlgorithms(next);
                    onReset();
                  }
                }}
              />
              <span className={cn("text-[9px] font-bold uppercase truncate", selectedAlgorithms.includes(alg) ? "text-[#2563EB]" : "text-[#6B7280]")}>
                {alg === 'Priority-Preemptive' ? 'Priority (P)' : alg}
              </span>
            </label>
          ))}
        </div>
      )}

      {((!compareMode && algorithm === 'RR') || (compareMode && selectedAlgorithms.includes('RR'))) && (
        <div className="mb-6 px-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-2 block">Time Quantum</label>
          <input 
            type="number" 
            min={1} 
            value={quantum} 
            onChange={(e) => { onSetQuantum(Number(e.target.value)); onReset(); }}
            className="w-full p-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>
      )}

      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-3 px-1">Process Units</label>
      <div className="space-y-3 mb-6">
        <div className="flex flex-col gap-2.5">
           <div className="grid grid-cols-3 gap-2 px-3">
             <span className="text-[9px] font-bold text-[#9CA3AF] uppercase text-center">Arrival Time</span>
             <span className="text-[9px] font-bold text-[#9CA3AF] uppercase text-center">Burst Time</span>
             <span className="text-[9px] font-bold text-[#9CA3AF] uppercase text-center">Priority</span>
           </div>
           {processes.map((p) => (
             <div key={p.id} className="flex flex-col p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold">{p.id} Unit</span>
                  <button onClick={() => onRemoveProcess(p.id)} className="text-[#6B7280] hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input 
                    type="number" 
                    placeholder="0"
                    value={p.arrivalTime === '' ? '' : p.arrivalTime} 
                    onChange={(e) => onUpdateProcess(p.id, 'arrivalTime', e.target.value === '' ? '' : Number(e.target.value))}
                    className="p-1.5 border border-[#E5E7EB] rounded text-[11px] text-center outline-none focus:border-[#2563EB] transition-all bg-white"
                  />
                  <input 
                    type="number" 
                    placeholder="0"
                    value={p.burstTime === '' ? '' : p.burstTime} 
                    onChange={(e) => onUpdateProcess(p.id, 'burstTime', e.target.value === '' ? '' : Number(e.target.value))}
                    className="p-1.5 border border-[#E5E7EB] rounded text-[11px] text-center outline-none focus:border-[#2563EB] transition-all bg-white"
                  />
                  <input 
                    type="number" 
                    placeholder="1"
                    value={p.priority === '' ? '' : p.priority} 
                    onChange={(e) => onUpdateProcess(p.id, 'priority', e.target.value === '' ? '' : Number(e.target.value))}
                    className="p-1.5 border border-[#E5E7EB] rounded text-[11px] text-center outline-none focus:border-[#2563EB] transition-all bg-white"
                  />
                </div>
             </div>
           ))}
        </div>
        <button 
          onClick={onAddProcess}
          className="w-full p-2.5 border border-dashed border-[#E5E7EB] text-[#6B7280] rounded-lg text-xs font-bold uppercase tracking-widest hover:border-[#2563EB] hover:text-[#2563EB] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Unit
        </button>
      </div>

      <div className="mt-auto pt-6 border-t border-[#E5E7EB]">
        <div className="mb-4">
           <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-2 block">Playback Speed</label>
           <div className="flex items-center gap-3">
             <input 
               type="range" 
               min={0.1} 
               max={5} 
               step={0.1} 
               value={playbackSpeed}
               onChange={(e) => onSetPlaybackSpeed(Number(e.target.value))}
               className="flex-1 accent-[#2563EB] h-1"
             />
             <span className="text-[10px] font-mono text-[#6B7280] w-6">{playbackSpeed.toFixed(1)}x</span>
           </div>
        </div>
        <button 
          onClick={onTogglePlay}
          className="w-full bg-[#111827] text-white p-3 rounded-lg font-bold text-sm hover:bg-black transition-colors"
        >
          {isPlaying ? 'Pause Simulation' : 'Execute Simulation'}
        </button>
      </div>
    </aside>
  );
};
