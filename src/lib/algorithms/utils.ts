import { SimulationResults, GanttStep, ProcessResult } from '../../types';

export const finalizeResults = (ganttChart: GanttStep[], processResults: ProcessResult[]): SimulationResults => {
  const avgWaiting = processResults.length > 0 
    ? processResults.reduce((acc, curr) => acc + curr.waitingTime, 0) / processResults.length 
    : 0;
  const avgTurnaround = processResults.length > 0 
    ? processResults.reduce((acc, curr) => acc + curr.turnaroundTime, 0) / processResults.length 
    : 0;

  return {
    ganttChart,
    processResults,
    averageWaitingTime: avgWaiting,
    averageTurnaroundTime: avgTurnaround,
  };
};
