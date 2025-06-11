'use client';

import { useState } from 'react';
import { Timer, Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TimerControlsProps {
  boardId: string;
  isActive: boolean;
  isPaused: boolean;
  onStart: (duration: number) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const PRESET_TIMES = [
  { label: '5 phút', minutes: 5 },
  { label: '10 phút', minutes: 10 },
  { label: '15 phút', minutes: 15 },
  { label: '30 phút', minutes: 30 },
];

export default function TimerControls({
  boardId,
  isActive,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
}: TimerControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const [customSeconds, setCustomSeconds] = useState('');

  const handlePresetStart = (minutes: number) => {
    const duration = minutes * 60; // Convert to seconds
    onStart(duration);
    setIsOpen(false);
  };

  const handleCustomStart = () => {
    const minutes = parseInt(customMinutes) || 0;
    const seconds = parseInt(customSeconds) || 0;
    const totalSeconds = minutes * 60 + seconds;
    
    if (totalSeconds > 0) {
      onStart(totalSeconds);
      setCustomMinutes('');
      setCustomSeconds('');
      setIsOpen(false);
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      onResume();
    } else {
      onPause();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Timer controls when active */}
      {isActive && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePauseResume}
            className={cn(
              "h-8 w-8 p-0",
              isPaused ? "text-green-600 hover:text-green-700" : "text-amber-600 hover:text-amber-700"
            )}
            title={isPaused ? "Tiếp tục timer" : "Tạm dừng timer"}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            title="Dừng timer"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Timer start control */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              isActive 
                ? "text-gray-400 cursor-not-allowed opacity-50" 
                : "text-blue-600 hover:text-blue-700"
            )}
            disabled={isActive}
            title="Bắt đầu timer"
          >
            <Timer className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-sm">Đặt Timer</h4>
            </div>

            {/* Preset times */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Thời gian có sẵn</Label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_TIMES.map((preset) => (
                  <Button
                    key={preset.minutes}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetStart(preset.minutes)}
                    className="h-8 text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom time input */}
            <div className="space-y-3">
              <Label className="text-xs text-gray-600">Tùy chỉnh thời gian</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Phút"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    min="0"
                    max="60"
                    className="h-8 text-xs"
                  />
                </div>
                <span className="text-xs text-gray-500">:</span>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Giây"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(e.target.value)}
                    min="0"
                    max="59"
                    className="h-8 text-xs"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleCustomStart}
                  disabled={!customMinutes && !customSeconds}
                  className="h-8 px-3 text-xs"
                >
                  Bắt đầu
                </Button>
              </div>
            </div>

            {/* Quick note */}
            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              💡 Timer sẽ được đồng bộ với tất cả thành viên trong board
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 