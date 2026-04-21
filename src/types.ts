export type AlgorithmType = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'Priority' | 'Priority-Preemptive';

export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
}

export interface UIProcess {
  id: string;
  arrivalTime: number | '';
  burstTime: number | '';
  priority: number | '';
  color: string;
}

export interface GanttStep {
  processId: string | 'IDLE';
  startTime: number;
  endTime: number;
  progress: number; // 0 to 1
}

export interface ProcessResult extends Process {
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
}

export interface SimulationResults {
  ganttChart: GanttStep[];
  processResults: ProcessResult[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
}
