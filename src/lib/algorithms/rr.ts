import { Process, GanttStep, ProcessResult, SimulationResults } from '../../types';
import { finalizeResults } from './utils.ts';

export const solveRR = (processes: Process[], quantum: number): SimulationResults => {
  const ganttChart: GanttStep[] = [];
  const resultsMap: Record<string, ProcessResult> = {};
  let currentTime = 0;
  const remainingBurstTime: Record<string, number> = {};
  processes.forEach(p => remainingBurstTime[p.id] = p.burstTime);

  const queue: string[] = [];
  const inQueue = new Set<string>();
  let completedCount = 0;

  // Add initially arrived processes
  const addArrived = () => {
    processes.forEach(p => {
      if (p.arrivalTime <= currentTime && remainingBurstTime[p.id] > 0 && !inQueue.has(p.id)) {
        queue.push(p.id);
        inQueue.add(p.id);
      }
    });
  };

  addArrived();

  while (completedCount < processes.length) {
    if (queue.length === 0) {
      const remainingProcesses = processes.filter(p => remainingBurstTime[p.id] > 0);
      const nextArrival = remainingProcesses.length > 0 ? Math.min(...remainingProcesses.map(p => p.arrivalTime)) : undefined;
      
      if (nextArrival !== undefined && nextArrival > currentTime) {
        ganttChart.push({ processId: 'IDLE', startTime: currentTime, endTime: nextArrival, progress: 1 });
        currentTime = nextArrival;
        addArrived();
        continue;
      }
      break;
    }

    const pid = queue.shift()!;
    inQueue.delete(pid);
    const p = processes.find(proc => proc.id === pid)!;

    const executeTime = Math.min(remainingBurstTime[pid], quantum);
    const startTime = currentTime;
    
    // We increment tick by tick to check for new arrivals during execution
    for(let t = 0; t < executeTime; t++) {
        currentTime++;
        remainingBurstTime[pid]--;
        addArrived(); // New processes arrive and go to end of queue
    }

    ganttChart.push({ processId: pid, startTime, endTime: currentTime, progress: 1 });

    if (remainingBurstTime[pid] > 0) {
      queue.push(pid);
      inQueue.add(pid);
    } else {
      completedCount++;
      const turnaroundTime = currentTime - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;
      resultsMap[pid] = { ...p, completionTime: currentTime, turnaroundTime, waitingTime };
    }
  }

  return finalizeResults(ganttChart, Object.values(resultsMap));
};
