import { Process, GanttStep, ProcessResult, SimulationResults } from '../../types';
import { finalizeResults } from './utils.ts';

export const solveSJF = (processes: Process[]): SimulationResults => {
  const ganttChart: GanttStep[] = [];
  const results: ProcessResult[] = [];
  let currentTime = 0;
  const readyQueue: Process[] = [];
  const completed: string[] = [];
  const processesLeft = [...processes];

  while (completed.length < processes.length) {
    // Add arrived processes to ready queue
    for (let i = 0; i < processesLeft.length; i++) {
        if (processesLeft[i].arrivalTime <= currentTime) {
            readyQueue.push(processesLeft.splice(i, 1)[0]);
            i--;
        }
    }

    if (readyQueue.length === 0) {
        if (processesLeft.length > 0) {
            const nextArrival = processesLeft[0].arrivalTime;
            ganttChart.push({ processId: 'IDLE', startTime: currentTime, endTime: nextArrival, progress: 1 });
            currentTime = nextArrival;
            continue;
        }
        break;
    }

    // Sort ready queue by burst time
    readyQueue.sort((a, b) => a.burstTime - b.burstTime);
    const p = readyQueue.shift()!;
    
    const startTime = currentTime;
    currentTime += p.burstTime;
    
    ganttChart.push({ processId: p.id, startTime, endTime: currentTime, progress: 1 });
    
    const turnaroundTime = currentTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;

    results.push({ ...p, completionTime: currentTime, turnaroundTime, waitingTime });
    completed.push(p.id);
  }

  return finalizeResults(ganttChart, results);
};
