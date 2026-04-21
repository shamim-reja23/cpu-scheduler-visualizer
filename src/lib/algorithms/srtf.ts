import { Process, GanttStep, ProcessResult, SimulationResults } from '../../types';
import { finalizeResults } from './utils.ts';

export const solveSRTF = (processes: Process[]): SimulationResults => {
  const ganttChart: GanttStep[] = [];
  const resultsMap: Record<string, ProcessResult> = {};
  let currentTime = 0;
  const remainingBurstTime: Record<string, number> = {};
  processes.forEach(p => remainingBurstTime[p.id] = p.burstTime);

  let completedCount = 0;
  let lastProcessId: string | null = null;
  let lastStartTime = 0;

  while (completedCount < processes.length) {
    const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && remainingBurstTime[p.id] > 0);

    if (availableProcesses.length === 0) {
      if (lastProcessId !== 'IDLE') {
        if (lastProcessId !== null) {
          ganttChart.push({ processId: lastProcessId, startTime: lastStartTime, endTime: currentTime, progress: 1 });
        }
        lastProcessId = 'IDLE';
        lastStartTime = currentTime;
      }
      currentTime++;
      continue;
    }

    const currentProcess = availableProcesses.reduce((prev, curr) => 
      remainingBurstTime[curr.id] < remainingBurstTime[prev.id] ? curr : prev
    );

    if (lastProcessId !== currentProcess.id) {
      if (lastProcessId !== null) {
        ganttChart.push({ processId: lastProcessId, startTime: lastStartTime, endTime: currentTime, progress: 1 });
      }
      lastProcessId = currentProcess.id;
      lastStartTime = currentTime;
    }

    remainingBurstTime[currentProcess.id]--;
    currentTime++;

    if (remainingBurstTime[currentProcess.id] === 0) {
      completedCount++;
      const turnaroundTime = currentTime - currentProcess.arrivalTime;
      const waitingTime = turnaroundTime - currentProcess.burstTime;
      resultsMap[currentProcess.id] = { ...currentProcess, completionTime: currentTime, turnaroundTime, waitingTime };
    }
  }

  if (lastProcessId !== null) {
    ganttChart.push({ processId: lastProcessId, startTime: lastStartTime, endTime: currentTime, progress: 1 });
  }

  return finalizeResults(ganttChart, Object.values(resultsMap));
};
