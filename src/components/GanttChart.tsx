import React from 'react';
import { SimulationResults, UIProcess } from '../types';
import { generateColor, generateDarkColor } from '../lib/utils';

interface GanttChartProps {
  algName: string;
  algResults: SimulationResults;
  currentTime: number;
  maxTime: number;
  processes: UIProcess[];
}

export const GanttChart: React.FC<GanttChartProps> = ({
  algName,
  algResults,
  currentTime,
  maxTime,
  processes
}) => {
  const displayName = algName === 'Priority-Preemptive' ? 'Preemptive Priority' : algName === 'Priority' ? 'Priority (Non-P)' : algName === 'RR' ? 'Round Robin' : algName;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[10px] font-mono font-bold text-[#6B7280]">
            {algName}
          </div>
          <h4 className="text-xs font-bold text-[#111827]">
            {displayName}
          </h4>
        </div>
        <div className="flex gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Wait</span>
              <span className="text-xs font-bold text-[#2563EB]">{algResults.averageWaitingTime.toFixed(1)}ms</span>
           </div>
           <div className="flex flex-col items-end border-l border-[#E5E7EB] pl-4">
              <span className="text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Turnaround</span>
              <span className="text-xs font-bold text-[#2563EB]">{algResults.averageTurnaroundTime.toFixed(1)}ms</span>
           </div>
        </div>
      </div>

      <div className="h-[60px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl flex overflow-hidden relative shadow-inner">
        {algResults.ganttChart.map((step, i) => {
          const duration = step.endTime - step.startTime;
          const widthPercent = (duration / maxTime) * 100;
          const isStarted = currentTime >= step.startTime;
          const isActive = currentTime >= step.startTime && currentTime < step.endTime;
          const progressValue = isActive ? (currentTime - step.startTime) / duration : isStarted ? 1 : 0;
          
          const pIndex = processes.findIndex(proc => proc.id === step.processId);
          const bgColor = step.processId === 'IDLE' ? '#F3F4F6' : generateColor(pIndex);
          const textColor = step.processId === 'IDLE' ? '#6B7280' : generateDarkColor(pIndex);

          return (
            <div key={i} style={{ width: `${widthPercent}%` }} className="h-full relative overflow-hidden border-r border-[#E5E7EB]/50 last:border-0">
               <div 
                 className="absolute inset-0 transition-opacity duration-300"
                 style={{ 
                   backgroundColor: bgColor,
                   opacity: isStarted ? 1 : 0.05 
                 }}
               />
               {isActive && (
                 <div 
                   className="absolute inset-y-0 left-0 bg-white/30 z-10"
                   style={{ width: `${progressValue * 100}%` }}
                 />
               )}
               {isStarted && widthPercent > 3 && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                   <span className="font-bold text-[9px] tracking-tight truncate px-1" style={{ color: textColor }}>{step.processId}</span>
                 </div>
               )}
               
               {/* Time Markers */}
               <span className="absolute bottom-0.5 left-1 text-[8px] font-bold text-[#6B7280]/70 z-20 font-mono pointer-events-none">{step.startTime}</span>
               {i === algResults.ganttChart.length - 1 && (
                 <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-[#6B7280]/70 z-20 font-mono pointer-events-none">{step.endTime}</span>
               )}
            </div>
          );
        })}
        
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-[#2563EB] z-30 pointer-events-none"
          style={{ left: `${(currentTime / maxTime) * 100}%` }}
        >
           <div className="absolute top-0 -translate-x-1/2 w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
        </div>
      </div>
    </div>
  );
};
