import { Process, GanttStep, ProcessResult, SimulationResults } from '../../types';
import { finalizeResults } from './utils.ts';

export const solveFCFS = (processes: Process[]): SimulationResults => {
  const ganttChart: GanttStep[] = [];
  const results: ProcessResult[] = [];
  let currentTime = 0;

  processes.forEach((p) => {
    if (currentTime < p.arrivalTime) {
      ganttChart.push({
        processId: 'IDLE',
        startTime: currentTime,
        endTime: p.arrivalTime,
        progress: 1,
      });
      currentTime = p.arrivalTime;
    }

    const startTime = currentTime;
    currentTime += p.burstTime;
    
    ganttChart.push({
      processId: p.id,
      startTime,
      endTime: currentTime,
      progress: 1,
    });

    const turnaroundTime = currentTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;

    results.push({
      ...p,
      completionTime: currentTime,
      turnaroundTime,
      waitingTime,
    });
  });

  return finalizeResults(ganttChart, results);
};
