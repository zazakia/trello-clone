import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, DollarSign } from 'lucide-react';
import type { TimeEntry } from '../types';

interface TimeTrackerProps {
  cardId: string;
  projectId: string;
  onTimeEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  existingEntries?: TimeEntry[];
  hourlyRate?: number;
  className?: string;
}

export function TimeTracker({ 
  cardId, 
  projectId, 
  onTimeEntry, 
  existingEntries = [],
  hourlyRate = 50,
  className = "" 
}: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total time from existing entries
  const totalTime = existingEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalBillableTime = existingEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + entry.duration, 0);
  const totalValue = (totalBillableTime / 60) * hourlyRate;

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        if (startTime) {
          setElapsedTime(Date.now() - startTime.getTime());
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTracking, startTime]);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleStart = () => {
    setStartTime(new Date());
    setIsTracking(true);
    setElapsedTime(0);
  };

  const handlePause = () => {
    setIsTracking(false);
  };

  const handleStop = () => {
    if (startTime) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60); // minutes
      
      const timeEntry: Omit<TimeEntry, 'id' | 'createdAt'> = {
        cardId,
        projectId,
        userId: 'current-user', // In a real app, this would come from auth
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        description: description.trim() || 'Work on task',
        billable: isBillable,
        rate: isBillable ? hourlyRate : undefined
      };
      
      onTimeEntry(timeEntry);
      
      // Reset state
      setIsTracking(false);
      setStartTime(null);
      setElapsedTime(0);
      setDescription('');
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Timer Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className={`text-2xl font-mono font-bold ${isTracking ? 'text-purple-600' : 'text-gray-900'}`}>
              {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-gray-500">
              {isTracking ? 'Tracking time...' : 'Ready to track'}
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-2">
          {!isTracking ? (
            <button
              onClick={handleStart}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Start</span>
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
              >
                <Pause className="h-4 w-4" />
              </button>
              <button
                onClick={handleStop}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
              >
                <Square className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Description Input */}
      {(isTracking || startTime) && (
        <div className="mb-4">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <div className="flex items-center space-x-4 mt-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">Billable</span>
            </label>
            {isBillable && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <DollarSign className="h-3 w-3" />
                <span>${hourlyRate}/hr</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time Summary */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total Time</span>
            <div className="font-semibold text-gray-900">{formatDuration(totalTime)}</div>
          </div>
          <div>
            <span className="text-gray-600">Billable</span>
            <div className="font-semibold text-gray-900">{formatDuration(totalBillableTime)}</div>
          </div>
          <div>
            <span className="text-gray-600">Sessions</span>
            <div className="font-semibold text-gray-900">{existingEntries.length}</div>
          </div>
          <div>
            <span className="text-gray-600">Value</span>
            <div className="font-semibold text-green-600">${totalValue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Time History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {showHistory ? 'Hide' : 'Show'} Time History ({existingEntries.length} entries)
        </button>
        
        {showHistory && existingEntries.length > 0 && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {existingEntries.slice().reverse().map((entry) => (
              <div key={entry.id} className="bg-white border border-gray-200 rounded p-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{entry.description}</span>
                  <div className="flex items-center space-x-2">
                    {entry.billable && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                        Billable
                      </span>
                    )}
                    <span className="font-semibold text-gray-900">
                      {formatDuration(entry.duration)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>{new Date(entry.startTime).toLocaleDateString()}</span>
                  {entry.billable && entry.rate && (
                    <span className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${((entry.duration / 60) * entry.rate).toFixed(2)}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}