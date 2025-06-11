'use client';

import { Clock, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
  isActive: boolean;
  isPaused: boolean;
  formattedTime: string;
  progress: number;
  className?: string;
}

export default function TimerDisplay({ 
  isActive, 
  isPaused, 
  formattedTime, 
  progress, 
  className 
}: TimerDisplayProps) {
  if (!isActive) {
    return null; // Don't show anything when timer is not active
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border bg-white shadow-sm",
      isPaused ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50",
      className
    )}>
      {/* Timer Icon with status */}
      <div className={cn(
        "relative flex items-center justify-center w-6 h-6 rounded-full",
        isPaused ? "text-amber-600" : "text-blue-600"
      )}>
        <Clock className="w-4 h-4" />
        
        {/* Progress ring */}
        <svg 
          className="absolute inset-0 w-6 h-6 transform -rotate-90" 
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="opacity-20"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 10}`}
            strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
      </div>

      {/* Time display */}
      <div className={cn(
        "font-mono text-sm font-medium",
        isPaused ? "text-amber-700" : "text-blue-700"
      )}>
        {formattedTime}
      </div>

      {/* Status indicator */}
      <div className={cn(
        "flex items-center justify-center w-4 h-4",
        isPaused ? "text-amber-500" : "text-blue-500"
      )}>
        {isPaused ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </div>

      {/* Pulse animation when active */}
      {isActive && !isPaused && (
        <div className="relative">
          <div className={cn(
            "absolute inset-0 w-2 h-2 rounded-full animate-ping",
            "bg-blue-400 opacity-75"
          )} />
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  );
} 