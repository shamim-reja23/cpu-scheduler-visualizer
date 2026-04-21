import React from 'react';
import { SimulationResults, UIProcess } from '../types';
import { generateColor, generateDarkColor } from '../lib/utils';
import { motion, AnimatePresence, scale } from 'motion/react';


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
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0 }}
        className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col gap-4"
    >
      <div className="flex flex-col min-[450px]:flex-row justify-between items-start min-[450px]:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-brand-bg border border-brand-border rounded text-[9px] md:text[10px] font-mono font-bold text-brand-muted">
            {algName}
          </div>
          <h4 className="text-[11px] md:text-xs font-bold text-brand-text">
            {displayName}
          </h4>
        </div>
        <div className="lex gap-4 w-full min-[450px]:w-auto justify-between min-[450px]:justify-end">
           <div className="flex flex-col items-end">
              <span className="text-[7px] md:text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Wait</span>
              <span className="text-[10px] md:text-xs font-bold text-brand-primary">{algResults.averageWaitingTime.toFixed(1)}ms</span>
           </div>
           <div className="flex flex-col items-end border-l border-brand-border pl-4">
              <span className="text-[7px] md:text-[8px] font-bold text-[#9CA3AF] uppercase">Avg Turnaround</span>
              <span className="text-[10px] md:text-xs font-bold text-brand-primary">{algResults.averageTurnaroundTime.toFixed(1)}ms</span>
           </div>
        </div>
      </div>

      <div className="h-15 bg-brand-bg border border-brand-border rounded-xl flex overflow-hidden relative shadow-inner">
        <AnimatePresence initial={false}>
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
                <motion.div 
                    key={`${step.processId}-${step.startTime}`} 
                    layout
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: `${widthPercent}%` }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        opacity: { duration: 0.2 },
                    }}
                    className="h-full relative overflow-hidden border-r border-brand-border/50 last:border-0">
                    <motion.div 
                        className="absolute inset-0"
                        initial={false}
                        animate={{ 
                            backgroundColor: bgColor,
                            opacity: isStarted ? 1 : 0.5 
                        }}
                        transition={{ duration: 0.3 }}
                    />
                    {isActive && (
                        <motion.div 
                        className="absolute inset-y-0 left-0 bg-white/30 z-10"
                        initial={false}
                        animate={{ width: `${progressValue * 100}%` }}
                        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        />
                    )}
                    {isStarted && widthPercent > 3 && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <span className="font-bold text-[9px] tracking-tight truncate px-1" style={{ color: textColor }}>{step.processId}</span>
                        </motion.div>
                    )}
                    
                    {/* Time Markers */}
                    <span className="absolute bottom-0.5 left-1 text-[8px] font-bold text-brand-muted/70 z-20 font-mono pointer-events-none">{step.startTime}</span>
                    {i === algResults.ganttChart.length - 1 && (
                        <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-brand-muted/70 z-20 font-mono pointer-events-none">{step.endTime}</span>
                    )}
                </motion.div>
            );
            })}
        </AnimatePresence>
        {/* Playhead */}
        <motion.div 
            className="absolute top-0 bottom-0 w-px bg-brand-primary z-30 pointer-events-none"
            initial={false}
            animate={{ left: `${(currentTime / maxTime) * 100}%` }}
            transition={{ type: 'linear', duration: 0.05 }}
        >
           <div className="absolute top-0 -translate-x-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
};
