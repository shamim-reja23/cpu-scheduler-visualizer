import React from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface ControlsBarProps {
  currentTime: number;
  maxTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSkipToStart: () => void;
  onSkipToEnd: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  currentTime,
  maxTime,
  isPlaying,
  onTogglePlay,
  onSkipToStart,
  onSkipToEnd,
  onStepBack,
  onStepForward
}) => {
  return (
    <div className="flex justify-between items-center bg-white border border-[#E5E7EB] p-4 rounded-2xl shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-[#9CA3AF] uppercase">Global Timer</span>
          <span className="text-sm font-mono font-bold">{currentTime.toFixed(1)}ms / {maxTime.toFixed(1)}ms</span>
        </div>
        <div className="w-px h-8 bg-[#E5E7EB]" />
        <div className="flex items-center gap-1.5 bg-[#F9FAFB] p-1 rounded-xl border border-[#E5E7EB]">
          <button onClick={onSkipToStart} className="p-1.5 hover:text-[#2563EB] transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={onStepBack} className="p-1.5 hover:text-[#2563EB] transition-colors"><RotateCcw className="w-3.5 h-3.5 -scale-x-100" /></button>
          <button onClick={onTogglePlay} className={cn("p-1.5 rounded-lg transition-all", isPlaying ? "bg-[#2563EB] text-white" : "hover:text-[#2563EB]")}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={onStepForward} className="p-1.5 hover:text-[#2563EB] transition-colors"><RotateCcw className="w-3.5 h-3.5" /></button>
          <button onClick={onSkipToEnd} className="p-1.5 hover:text-[#2563EB] transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
         <span className={cn(
           "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
           isPlaying ? "bg-blue-50 text-[#2563EB] animate-pulse" : "bg-gray-50 text-[#9CA3AF]"
         )}>
           {isPlaying ? 'Simulation Active' : 'Simulation Idle'}
         </span>
      </div>
    </div>
  );
};
