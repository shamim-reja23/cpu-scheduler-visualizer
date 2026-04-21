import { useState, useMemo, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { AlgorithmType, UIProcess, SimulationResults } from './types';
import { calculateScheduling } from './lib/algorithms';
import { generateColor, cn } from './lib/utils';
import { Sidebar } from './components/Sidebar';
import { ControlsBar } from './components/ControlsBar';
import { GanttChart } from './components/GanttChart';
import { ProcessTable } from './components/ProcessTable';

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
  const [playbackSpeed, setPlaybackSpeed] = useState(1.6);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
    (Object.values(resultsMap) as SimulationResults[]).forEach((res) => {
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

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const addProcess = () => {
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
    setProcesses(processes.map(p => p.id === id ? { ...p, [field]: value } : p));
    resetSimulation();
  };

  const resultsArray = Object.values(resultsMap) as SimulationResults[];
  const mainResults = resultsArray[0];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-brand-bg text-brand-text font-sans overflow-hidden relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-brand-border z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-primary rounded"></div>
          <span className="font-bold text-sm tracking-tight">CPU Scheduler</span>
        </div>
        <button 
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="p-2 hover:bg-brand-bg rounded-lg transition-colors"
        >
          {showMobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <Sidebar 
        processes={processes}
        algorithm={algorithm}
        compareMode={compareMode}
        selectedAlgorithms={selectedAlgorithms}
        quantum={quantum}
        playbackSpeed={playbackSpeed}
        isPlaying={isPlaying}
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        onUpdateProcess={updateProcess}
        onRemoveProcess={removeProcess}
        onAddProcess={addProcess}
        onSetAlgorithm={setAlgorithm}
        onSetCompareMode={setCompareMode}
        onSetSelectedAlgorithms={setSelectedAlgorithms}
        onSetQuantum={setQuantum}
        onSetPlaybackSpeed={setPlaybackSpeed}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onReset={resetSimulation}
      />

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-[2px]"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto space-y-4 md:space-y-8 flex flex-col custom-scrollbar">
        <ControlsBar 
          currentTime={currentTime}
          maxTime={maxTime}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onSkipToStart={() => setCurrentTime(0)}
          onSkipToEnd={() => setCurrentTime(maxTime)}
          onStepBack={() => { setIsPlaying(false); setCurrentTime(prev => Math.max(0, Math.floor(prev - 1))); }}
          onStepForward={() => { setIsPlaying(false); setCurrentTime(prev => Math.min(maxTime, Math.ceil(prev + 1))); }}
        />

        <div className={cn("grid gap-4 md:gap-6", compareMode && resultsArray.length > 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
          {(Object.entries(resultsMap) as [string, SimulationResults][]).map(([algName, algResults]) => (
            <GanttChart 
              key={algName}
              algName={algName}
              algResults={algResults}
              currentTime={currentTime}
              maxTime={maxTime}
              processes={processes}
            />
          ))}
        </div>

        <div className="flex-1 min-h-100">
          <ProcessTable 
            results={mainResults}
            currentTime={currentTime}
            compareMode={compareMode}
            algorithmName={Object.keys(resultsMap)[0]}
          />
        </div>
      </main>

    </div>
  );
}
