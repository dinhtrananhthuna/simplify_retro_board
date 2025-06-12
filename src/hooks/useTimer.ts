import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState } from '@/types/board';
import { useAppToast } from './useAppToast';

interface UseTimerReturn {
  timeLeft: number;
  isActive: boolean;
  isPaused: boolean;
  formattedTime: string;
  progress: number; // 0-100 percentage
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  onTimerEvent: (event: { type: string; data: TimerState }) => void;
  // Add broadcast functions
  setBroadcastActions?: (actions: {
    timerBroadcastStart: (data: any) => void;
    timerBroadcastPause: (data: any) => void;
    timerBroadcastResume: (data: any) => void;
    timerBroadcastStop: (data: any) => void;
  }) => void;
}

export const useTimer = (boardId: string): UseTimerReturn => {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const toast = useAppToast();
  const broadcastActionsRef = useRef<{
    timerBroadcastStart: (data: any) => void;
    timerBroadcastPause: (data: any) => void;
    timerBroadcastResume: (data: any) => void;
    timerBroadcastStop: (data: any) => void;
  } | null>(null);

  // Format time as MM:SS
  const formattedTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Calculate progress percentage
  const progress = timerState ? 
    ((timerState.duration - timeLeft) / timerState.duration) * 100 : 0;

  // Main timer tick function
  const tick = useCallback(() => {
    if (!timerState || !timerState.isActive || timerState.isPaused) return;

    const now = Date.now();
    const elapsed = (now - timerState.startTime) / 1000;
    const remaining = Math.max(0, timerState.duration - elapsed);

    setTimeLeft(Math.ceil(remaining));

    // Timer finished
    if (remaining <= 0) {
      setTimerState(prev => prev ? { ...prev, isActive: false } : null);
      toast?.success?.('⏰ Hết thời gian!');
      
      // Optional: Play notification sound
      if (typeof window !== 'undefined' && 'Audio' in window) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.6;
          audio.play().catch(() => {
            // Gracefully handle if audio fails
            console.log('Could not play notification sound - file might be missing');
          });
        } catch (error) {
          // Audio not supported or file not found
          console.log('Audio notification not available');
        }
      }
    }
  }, [timerState, toast]);

  // Setup interval
  useEffect(() => {
    if (timerState?.isActive && !timerState.isPaused) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tick, timerState?.isActive, timerState?.isPaused]);

  // Timer control functions
  const startTimer = useCallback((duration: number) => {
    console.log('[useTimer] 🚀 Starting timer with duration:', duration);
    console.log('[useTimer] 📡 Broadcast actions available:', !!broadcastActionsRef.current);
    
    const newTimer: TimerState = {
      id: `timer-${Date.now()}`,
      boardId,
      duration,
      startTime: Date.now(),
      isActive: true,
      isPaused: false,
      createdBy: '', // Will be set by the calling component
    };
    setTimerState(newTimer);
    setTimeLeft(duration);
    
    // Broadcast to other clients
    if (broadcastActionsRef.current?.timerBroadcastStart) {
      console.log('[useTimer] 📡 Broadcasting timer start:', newTimer);
      broadcastActionsRef.current.timerBroadcastStart(newTimer);
    } else {
      console.warn('[useTimer] ⚠️ No broadcast actions available for timer start');
    }
  }, [boardId]);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev) return null;
      const now = Date.now();
      const elapsed = (now - prev.startTime) / 1000;
      const remaining = Math.max(0, prev.duration - elapsed);
      
      const updatedTimer = { 
        ...prev, 
        isPaused: true,
        // Store current remaining time when paused
        remainingTime: remaining
      };
      
      // Also update local timeLeft for immediate UI update
      setTimeLeft(Math.ceil(remaining));
      
      // Broadcast to other clients
      broadcastActionsRef.current?.timerBroadcastPause?.(updatedTimer);
      return updatedTimer;
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState(prev => {
      if (!prev || !prev.remainingTime) return null;
      
      // Calculate new startTime: current time - (total duration - remaining time)
      const newStartTime = Date.now() - (prev.duration - prev.remainingTime) * 1000;
      
      const updatedTimer = { 
        ...prev, 
        isPaused: false,
        startTime: newStartTime,
        // Clear remainingTime as we're now using calculated time
        remainingTime: undefined
      };
      
      // Broadcast to other clients
      broadcastActionsRef.current?.timerBroadcastResume?.(updatedTimer);
      return updatedTimer;
    });
  }, []);

  const stopTimer = useCallback(() => {
    // Store current state before clearing for broadcast
    setTimerState(prev => {
      if (prev) {
        // Broadcast to other clients
        broadcastActionsRef.current?.timerBroadcastStop?.(prev);
      }
      return null;
    });
    setTimeLeft(0);
  }, []);

  // Handle timer events from other clients
  const onTimerEvent = useCallback((event: { type: string; data: TimerState }) => {
    switch (event.type) {
      case 'timer:start':
        setTimerState(event.data);
        // Calculate current time left based on elapsed time
        const now = Date.now();
        const elapsed = (now - event.data.startTime) / 1000;
        const remaining = Math.max(0, event.data.duration - elapsed);
        setTimeLeft(Math.ceil(remaining));
        break;
        
      case 'timer:pause':
        setTimerState(prev => {
          if (!prev) return null;
          
          // If the event data has remainingTime, use it, otherwise calculate
          let remaining;
          if (event.data.remainingTime !== undefined) {
            remaining = event.data.remainingTime;
          } else {
            const now = Date.now();
            const elapsed = (now - prev.startTime) / 1000;
            remaining = Math.max(0, prev.duration - elapsed);
          }
          
          // Update timeLeft immediately for UI
          setTimeLeft(Math.ceil(remaining));
          
          return { 
            ...prev, 
            isPaused: true,
            remainingTime: remaining
          };
        });
        break;
        
      case 'timer:resume':
        // Fix: Update both isPaused and startTime from broadcasted data
        setTimerState(event.data);
        // Recalculate time left based on the new startTime
        const nowResume = Date.now();
        const elapsedResume = (nowResume - event.data.startTime) / 1000;
        const remainingResume = Math.max(0, event.data.duration - elapsedResume);
        setTimeLeft(Math.ceil(remainingResume));
        break;
        
      case 'timer:stop':
        setTimerState(null);
        setTimeLeft(0);
        break;
    }
  }, []);

  // Function to set broadcast actions from useAbly
  const setBroadcastActions = useCallback((actions: {
    timerBroadcastStart: (data: any) => void;
    timerBroadcastPause: (data: any) => void;
    timerBroadcastResume: (data: any) => void;
    timerBroadcastStop: (data: any) => void;
  }) => {
    console.log('[useTimer] 🔗 Setting broadcast actions:', Object.keys(actions));
    broadcastActionsRef.current = actions;
  }, []);

  return {
    timeLeft,
    isActive: timerState?.isActive ?? false,
    isPaused: timerState?.isPaused ?? false,
    formattedTime: formattedTime(timeLeft),
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    onTimerEvent,
    setBroadcastActions,
  };
}; 