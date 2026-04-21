import { Process, GanttStep, SimulationResults, ProcessResult, AlgorithmType } from '../types';

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

  // Clone processes to avoid mutations
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

const solveFCFS = (processes: Process[]): SimulationResults => {
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

const solveSJF = (processes: Process[]): SimulationResults => {
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

const solveSRTF = (processes: Process[]): SimulationResults => {
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

const solveRR = (processes: Process[], quantum: number): SimulationResults => {
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
      const nextArrival = processes.find(p => remainingBurstTime[p.id] > 0)?.arrivalTime;
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

const solvePriority = (processes: Process[], preemptive: boolean): SimulationResults => {
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

const finalizeResults = (ganttChart: GanttStep[], processResults: ProcessResult[]): SimulationResults => {
  const avgWaiting = processResults.reduce((acc, curr) => acc + curr.waitingTime, 0) / processResults.length;
  const avgTurnaround = processResults.reduce((acc, curr) => acc + curr.turnaroundTime, 0) / processResults.length;

  return {
    ganttChart,
    processResults,
    averageWaitingTime: avgWaiting,
    averageTurnaroundTime: avgTurnaround,
  };
};
