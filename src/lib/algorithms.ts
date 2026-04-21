import { Process, SimulationResults, AlgorithmType } from '../types';
import { solveFCFS } from './algorithms/fcfs';
import { solveSJF } from './algorithms/sjf';
import { solveSRTF } from './algorithms/srtf';
import { solveRR } from './algorithms/rr';
import { solvePriority } from './algorithms/priority';

export const calculateScheduling = (
  algorithm: AlgorithmType,
  processes: Process[],
  options: { quantum?: number } = {}
): SimulationResults => {
  if (processes.length === 0) {
    return {
      ganttChart: [],
      processResults: [],
      averageWaitingTime: 0,
      averageTurnaroundTime: 0,
    };
  }

  // Clone processes to avoid mutations and sort by arrival time for consistent processing
  const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  switch (algorithm) {
    case 'FCFS':
      return solveFCFS(sortedProcesses);
    case 'SJF':
      return solveSJF(sortedProcesses);
    case 'SRTF':
      return solveSRTF(sortedProcesses);
    case 'RR':
      return solveRR(sortedProcesses, options.quantum || 2);
    case 'Priority':
      return solvePriority(sortedProcesses, false);
    case 'Priority-Preemptive':
      return solvePriority(sortedProcesses, true);
    default:
      return solveFCFS(sortedProcesses);
  }
};
