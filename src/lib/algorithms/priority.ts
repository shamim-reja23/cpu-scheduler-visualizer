import { Process, GanttStep, ProcessResult, SimulationResults } from '../../types';
import { finalizeResults } from './utils.ts';

export const solvePriority = (processes: Process[], preemptive: boolean): SimulationResults => {
  if (!preemptive) {
    const ganttChart: GanttStep[] = [];
    const results: ProcessResult[] = [];
    let currentTime = 0;
    let completedCount = 0;
    const processesLeft = [...processes];

    while (completedCount < processes.length) {
      const available = processesLeft.filter(p => p.arrivalTime <= currentTime);
      if (available.length === 0) {
        const nextArrival = processesLeft.sort((a,b) => a.arrivalTime - b.arrivalTime)[0].arrivalTime;
        ganttChart.push({ processId: 'IDLE', startTime: currentTime, endTime: nextArrival, progress: 1 });
        currentTime = nextArrival;
        continue;
      }

      // Priority: lower number = higher priority
      available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
      const p = available[0];
      const index = processesLeft.findIndex(proc => proc.id === p.id);
      processesLeft.splice(index, 1);

      const startTime = currentTime;
      currentTime += p.burstTime;
      ganttChart.push({ processId: p.id, startTime, endTime: currentTime, progress: 1 });

      const turnaroundTime = currentTime - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;
      results.push({ ...p, completionTime: currentTime, turnaroundTime, waitingTime });
      completedCount++;
    }
    return finalizeResults(ganttChart, results);
  } else {
    // Preemptive Priority
    const ganttChart: GanttStep[] = [];
    const resultsMap: Record<string, ProcessResult> = {};
    let currentTime = 0;
    const remainingBurstTime: Record<string, number> = {};
    processes.forEach(p => remainingBurstTime[p.id] = p.burstTime);

    let completedCount = 0;
    let lastProcessId: string | null = null;
    let lastStartTime = 0;

    while (completedCount < processes.length) {
      const available = processes.filter(p => p.arrivalTime <= currentTime && remainingBurstTime[p.id] > 0);
      if (available.length === 0) {
        if (lastProcessId !== 'IDLE') {
          if (lastProcessId !== null) ganttChart.push({ processId: lastProcessId, startTime: lastStartTime, endTime: currentTime, progress: 1 });
          lastProcessId = 'IDLE';
          lastStartTime = currentTime;
        }
        currentTime++;
        continue;
      }

      available.sort((a, b) => a.priority - b.priority || a.arrivalTime - b.arrivalTime);
      const currentProcess = available[0];

      if (lastProcessId !== currentProcess.id) {
        if (lastProcessId !== null) ganttChart.push({ processId: lastProcessId, startTime: lastStartTime, endTime: currentTime, progress: 1 });
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
    if (lastProcessId !== null) ganttChart.push({ processId: lastProcessId, startTime: lastStartTime, endTime: currentTime, progress: 1 });
    return finalizeResults(ganttChart, Object.values(resultsMap));
  }
};
