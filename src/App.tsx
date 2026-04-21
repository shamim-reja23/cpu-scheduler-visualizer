import { useState, useMemo, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Trash2, Settings2, BarChart3, Clock, Cpu, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlgorithmType, Process, UIProcess, SimulationResults } from './types';
import { calculateScheduling } from './lib/algorithms';
import { generateColor, generateDarkColor, cn } from './lib/utils';

const INITIAL_PROCESSES: UIProcess[] = [
  { id: 'P1', arrivalTime: 0, burstTime: 4, priority: 2, color: generateColor(0) },
  { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, color: generateColor(1) },
  { id: 'P3', arrivalTime: 2, burstTime: 1, priority: 3, color: generateColor(2) },
  { id: 'P4', arrivalTime: 3, burstTime: 2, priority: 2, color: generateColor(3) },
];

export default function App() {
  const [processes, setProcesses] = useState<UIProcess[]>(INITIAL_PROCESSES);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('FCFS');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<AlgorithmType[]>(['FCFS', 'SJF']);
  const [quantum, setQuantum] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const resultsMap = useMemo<Record<string, SimulationResults>>(() => {
    const sanitizedProcesses = processes.map(p => ({
      ...p,
      arrivalTime: p.arrivalTime === '' ? 0 : Number(p.arrivalTime),
      burstTime: p.burstTime === '' ? 1 : Math.max(1, Number(p.burstTime)),
      priority: p.priority === '' ? 1 : Number(p.priority)
    }));

    const algsToRun = compareMode ? selectedAlgorithms : [algorithm];
    const map: Record<string, SimulationResults> = {};
    algsToRun.forEach(alg => {
      map[alg] = calculateScheduling(alg, sanitizedProcesses, { quantum });
    });
    return map;
  }, [algorithm, processes, quantum, compareMode, selectedAlgorithms]);

  const maxTime = useMemo(() => {
    let max = 0;
    Object.values(resultsMap).forEach((res: any) => {
      if (res.ganttChart.length > 0) {
        max = Math.max(max, res.ganttChart[res.ganttChart.length - 1].endTime);
      }
    });
    return max;
  }, [resultsMap]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && currentTime < maxTime) {
      interval = setInterval(() => {
        setCurrentTime(t => Math.min(t + 0.1, maxTime));
      }, 100 / playbackSpeed);
    } else if (currentTime >= maxTime) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, maxTime, playbackSpeed]);

  const addProcess = () => {
    // Generate a unique ID based on the max ID in existing processes
    const maxNum = processes.reduce((acc, p) => {
        const num = parseInt(p.id.replace('P', ''));
        return isNaN(num) ? acc : Math.max(acc, num);
    }, 0);
    const newId = `P${maxNum + 1}`;
    const newProcess: UIProcess = {
      id: newId,
      arrivalTime: 0,
      burstTime: 5,
      priority: 1,
      color: generateColor(processes.length),
    };
    setProcesses([...processes, newProcess]);
    resetSimulation();
  };

  const removeProcess = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
    resetSimulation();
  };

  const updateProcess = (id: string, field: keyof UIProcess, value: any) => {
    // If user clears the input, we keep it as empty string so they can type,
    // but the simulation will treat it as 0 or its default.
    setProcesses(processes.map(p => p.id === id ? { ...p, [field]: value } : p));
    resetSimulation();
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const skipToStart = () => {
    setCurrentTime(0);
  };

  const skipToEnd = () => {
    setCurrentTime(maxTime);
  };

  const resultsArray = Object.values(resultsMap) as SimulationResults[];
  const mainResults = resultsArray[0];

  return (
    <div className="flex h-screen bg-[#F9FAFB] text-[#111827] font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-[300px] bg-white border-r border-[#E5E7EB] flex flex-col p-6 h-full overflow-y-auto shrink-0">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-[#2563EB] rounded-lg"></div>
          <span className="font-bold text-lg tracking-tight">CPU Scheduler</span>
        </div>

        <div className="flex items-center justify-between mb-2 px-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Algorithm</label>
          <button 
            onClick={() => { setCompareMode(!compareMode); resetSimulation(); }}
            className="flex items-center gap-1.5 px-1.5 py-1 bg-[#F9FAFB] rounded-full border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-all"
          >
            <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full", !compareMode ? "bg-[#2563EB] text-white shadow-sm" : "text-[#6B7280]")}>Single</span>
            <span className={cn("text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full", compareMode ? "bg-[#2563EB] text-white shadow-sm" : "text-[#6B7280]")}>Compare</span>
          </button>
        </div>

        {!compareMode ? (
          <select 
            value={algorithm}
            onChange={(e) => { setAlgorithm(e.target.value as AlgorithmType); resetSimulation(); }}
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
            {(['FCFS', 'SJF', 'SRTF', 'RR', 'Priority', 'Priority-Preemptive'] as AlgorithmType[]).map((alg) => (
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
                      setSelectedAlgorithms(next);
                      resetSimulation();
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
              onChange={(e) => { setQuantum(Number(e.target.value)); resetSimulation(); }}
              className="w-full p-2.5 bg-white border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>
        )}

        <label className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280] mb-3 px-1">Process Units</label>
        <div className="space-y-3 mb-6">
          <div className="flex flex-col gap-2.5">
             {/* Header Labels */}
             <div className="grid grid-cols-3 gap-2 px-3">
               <span className="text-[9px] font-bold text-[#9CA3AF] uppercase text-center">Arrival Time</span>
               <span className="text-[9px] font-bold text-[#9CA3AF] uppercase text-center">Burst Time</span>
               <span className="text-[9px] font-bold text-[#9CA3AF] uppercase text-center">Priority</span>
             </div>
             {processes.map((p) => (
               <div key={p.id} className="flex flex-col p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold">{p.id} Unit</span>
                    <button onClick={() => removeProcess(p.id)} className="text-[#6B7280] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input 
                      type="number" 
                      placeholder="0"
                      value={p.arrivalTime === '' ? '' : p.arrivalTime} 
                      onChange={(e) => updateProcess(p.id, 'arrivalTime', e.target.value === '' ? '' : Number(e.target.value))}
                      className="p-1.5 border border-[#E5E7EB] rounded text-[11px] text-center outline-none focus:border-[#2563EB] transition-all bg-white"
                    />
                    <input 
                      type="number" 
                      placeholder="0"
                      value={p.burstTime === '' ? '' : p.burstTime} 
                      onChange={(e) => updateProcess(p.id, 'burstTime', e.target.value === '' ? '' : Number(e.target.value))}
                      className="p-1.5 border border-[#E5E7EB] rounded text-[11px] text-center outline-none focus:border-[#2563EB] transition-all bg-white"
                    />
                    <input 
                      type="number" 
                      placeholder="1"
                      value={p.priority === '' ? '' : p.priority} 
                      onChange={(e) => updateProcess(p.id, 'priority', e.target.value === '' ? '' : Number(e.target.value))}
                      className="p-1.5 border border-[#E5E7EB] rounded text-[11px] text-center outline-none focus:border-[#2563EB] transition-all bg-white"
                    />
                  </div>
               </div>
             ))}
          </div>
          <button 
            onClick={addProcess}
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
                 onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                 className="flex-1 accent-[#2563EB] h-1"
               />
               <span className="text-[10px] font-mono text-[#6B7280] w-6">{playbackSpeed.toFixed(1)}x</span>
             </div>
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-full bg-[#111827] text-white p-3 rounded-lg font-bold text-sm hover:bg-black transition-colors"
          >
            {isPlaying ? 'Pause Simulation' : 'Execute Simulation'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 h-full overflow-y-auto space-y-8 flex flex-col custom-scrollbar">
        {/* Controls Bar */}
        <div className="flex justify-between items-center bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#9CA3AF] uppercase">Global Timer</span>
              <span className="text-sm font-mono font-bold">{currentTime.toFixed(1)}ms / {maxTime.toFixed(1)}ms</span>
            </div>
            <div className="w-px h-8 bg-[#E5E7EB]" />
            <div className="flex items-center gap-1.5 bg-[#F9FAFB] p-1 rounded-xl border border-[#E5E7EB]">
              <button onClick={skipToStart} className="p-1.5 hover:text-[#2563EB] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => { setIsPlaying(false); setCurrentTime(prev => Math.max(0, Math.floor(prev - 1))); }} className="p-1.5 hover:text-[#2563EB] transition-colors"><RotateCcw className="w-3.5 h-3.5 -scale-x-100" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className={cn("p-1.5 rounded-lg transition-all", isPlaying ? "bg-[#2563EB] text-white" : "hover:text-[#2563EB]")}>{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
              <button onClick={() => { setIsPlaying(false); setCurrentTime(prev => Math.min(maxTime, Math.ceil(prev + 1))); }} className="p-1.5 hover:text-[#2563EB] transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
              <button onClick={skipToEnd} className="p-1.5 hover:text-[#2563EB] transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <span className={cn(
               "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
               isPlaying ? "bg-blue-50 text-[#2563EB] animate-pulse" : "bg-gray-50 text-[#9CA3AF]"
             )}>
               {isPlaying ? 'Simulation Active' : 'Simulation Idle'}
             </span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className={cn("grid gap-6", compareMode && Object.keys(resultsMap).length > 2 ? "grid-cols-2" : "grid-cols-1")}>
          {(Object.entries(resultsMap) as [string, SimulationResults][]).map(([algName, algResults]) => (
            <div key={algName} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[10px] font-mono font-bold text-[#6B7280]">
                    {algName}
                  </div>
                  <h4 className="text-xs font-bold text-[#111827]">
                    {algName === 'Priority-Preemptive' ? 'Preemptive Priority' : algName === 'Priority' ? 'Priority (Non-P)' : algName === 'RR' ? 'Round Robin' : algName}
                  </h4>
                </div>
                <div className="flex gap-4">
                   <div className="flex flex-col items-end">
                      <span className="text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Wait</span>
                      <span className="text-xs font-bold text-[#2563EB]">{algResults.averageWaitingTime.toFixed(1)}ms</span>
                   </div>
                   <div className="flex flex-col items-end border-l border-[#E5E7EB] pl-4">
                      <span className="text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Turnaround</span>
                      <span className="text-xs font-bold text-[#2563EB]">{algResults.averageTurnaroundTime.toFixed(1)}ms</span>
                   </div>
                </div>
              </div>

              <div className="h-[60px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex overflow-hidden relative shadow-inner">
                {algResults.ganttChart.map((step: any, i: number) => {
                  const duration = step.endTime - step.startTime;
                  const widthPercent = (duration / maxTime) * 100;
                  const isStarted = currentTime >= step.startTime;
                  const isActive = currentTime >= step.startTime && currentTime < step.endTime;
                  const progressValue = isActive ? (currentTime - step.startTime) / duration : isStarted ? 1 : 0;
                  
                  const pIndex = processes.findIndex(proc => proc.id === step.processId);
                  const bgColor = step.processId === 'IDLE' ? '#F3F4F6' : generateColor(pIndex);
                  const textColor = step.processId === 'IDLE' ? '#6B7280' : generateDarkColor(pIndex);

                  return (
                    <div key={i} style={{ width: `${widthPercent}%` }} className="h-full relative overflow-hidden border-r border-[#E5E7EB]/50 last:border-0">
                       <div 
                         className="absolute inset-0 transition-opacity duration-300"
                         style={{ 
                           backgroundColor: bgColor,
                           opacity: isStarted ? 1 : 0.05 
                         }}
                       />
                       {isActive && (
                         <div 
                           className="absolute inset-y-0 left-0 bg-white/30 z-10"
                           style={{ width: `${progressValue * 100}%` }}
                         />
                       )}
                       {isStarted && widthPercent > 3 && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                           <span className="font-bold text-[9px] tracking-tight truncate px-1" style={{ color: textColor }}>{step.processId}</span>
                         </div>
                       )}
                       
                       {/* Time Markers */}
                       <span className="absolute bottom-0.5 left-1 text-[8px] font-bold text-[#6B7280]/70 z-20 font-mono pointer-events-none">{step.startTime}</span>
                       {i === algResults.ganttChart.length - 1 && (
                         <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-[#6B7280]/70 z-20 font-mono pointer-events-none">{step.endTime}</span>
                       )}
                    </div>
                  );
                })}
                
                {/* Playhead */}
                <div 
                  className="absolute top-0 bottom-0 w-px bg-[#2563EB] z-30 pointer-events-none"
                  style={{ left: `${(currentTime / maxTime) * 100}%` }}
                >
                   <div className="absolute top-0 -translate-x-1/2 w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Summary Table (Detail View) */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden min-h-[300px]">
          <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-[#6B7280]">Detailed Statistics</h3>
              <p className="text-[9px] text-[#9CA3AF]">Metrics for <span className="font-bold text-[#111827]">{Object.keys(resultsMap)[0]}</span> algorithm</p>
            </div>
            {!compareMode && (
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Waiting</span>
                  <span className="text-lg font-bold text-[#2563EB]">{mainResults.averageWaitingTime.toFixed(2)}ms</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Turnaround</span>
                  <span className="text-lg font-bold text-[#2563EB]">{mainResults.averageTurnaroundTime.toFixed(2)}ms</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="p-5 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">Process ID</th>
                  <th className="p-5 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">Arrival</th>
                  <th className="p-5 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">Burst</th>
                  <th className="p-5 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">Priority</th>
                  <th className="p-5 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">Completion</th>
                  <th className="p-5 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">Turnaround</th>
                  <th className="p-5 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">Waiting</th>
                  <th className="p-5 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {mainResults.processResults.sort((a, b) => a.id.localeCompare(b.id, undefined, {numeric: true})).map((r) => {
                  const isFinished = currentTime >= r.completionTime;
                  return (
                    <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="p-5 text-sm font-bold text-[#111827]">{r.id} Unit</td>
                      <td className="p-5 text-sm text-[#6B7280] font-mono">{r.arrivalTime}</td>
                      <td className="p-5 text-sm text-[#6B7280] font-mono">{r.burstTime}</td>
                      <td className="p-5 text-sm text-[#6B7280] font-mono">{r.priority}</td>
                      <td className="p-5 text-sm font-bold font-mono">{isFinished ? r.completionTime : '--'}</td>
                      <td className="p-5 text-sm font-bold text-[#2563EB] font-mono">{isFinished ? r.turnaroundTime : '--'}</td>
                      <td className="p-5 text-sm font-bold text-[#2563EB] font-mono">{isFinished ? r.waitingTime : '--'}</td>
                      <td className="p-5 text-sm">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          isFinished ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F3F4F6] text-[#6B7280]"
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
      </main>

      {/* Global CSS for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
