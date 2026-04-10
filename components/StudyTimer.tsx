
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayIcon, PauseIcon, RefreshIcon, FlagIcon } from './icons';

type TimerMode = 'stopwatch' | 'timer';

const StudyTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [displayTime, setDisplayTime] = useState<number>(0);
  
  // Stopwatch State
  const [swAccumulated, setSwAccumulated] = useState<number>(0);
  const [swStart, setSwStart] = useState<number | null>(null);
  const [swLaps, setSwLaps] = useState<number[]>([]);

  // Timer State
  const [timerDurationMinutes, setTimerDurationMinutes] = useState<number>(25);
  const [timerLeft, setTimerLeft] = useState<number>(25 * 60 * 1000);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  // Initialize persistence
  useEffect(() => {
    // Restore Mode
    const savedMode = localStorage.getItem('focusFlow_mode') as TimerMode;
    if (savedMode) setMode(savedMode);

    // Restore Stopwatch
    const savedSwStart = localStorage.getItem('focusFlow_timer_start'); // Legacy key support
    const savedSwAcc = localStorage.getItem('focusFlow_timer_accumulated'); // Legacy key support
    const savedLaps = localStorage.getItem('focusFlow_sw_laps');
    
    if (savedSwAcc) setSwAccumulated(parseInt(savedSwAcc, 10));
    if (savedSwStart) setSwStart(parseInt(savedSwStart, 10));
    if (savedLaps) setSwLaps(JSON.parse(savedLaps));

    // Restore Timer
    const savedTmEnd = localStorage.getItem('focusFlow_tm_end');
    const savedTmLeft = localStorage.getItem('focusFlow_tm_left');
    const savedTmDur = localStorage.getItem('focusFlow_tm_duration');

    if (savedTmDur) {
        const dur = parseInt(savedTmDur, 10);
        setTimerDurationMinutes(dur);
        if (!savedTmEnd && !savedTmLeft) setTimerLeft(dur * 60 * 1000);
    }
    
    if (savedTmEnd) {
      const endTime = parseInt(savedTmEnd, 10);
      if (endTime > Date.now()) {
        setTimerEndTime(endTime);
        setIsTimerRunning(true);
      } else {
        // Expired while closed
        setTimerLeft(0);
        setIsTimerRunning(false);
        localStorage.removeItem('focusFlow_tm_end');
      }
    } else if (savedTmLeft) {
      setTimerLeft(parseInt(savedTmLeft, 10));
    }

    // Request notification permission if not granted/denied
    if (Notification.permission === 'default') {
        Notification.requestPermission();
    }
  }, []);

  // Save Mode
  useEffect(() => {
    localStorage.setItem('focusFlow_mode', mode);
  }, [mode]);

  // Animation Loop
  useEffect(() => {
    let animationFrameId: number;

    const updateLoop = () => {
      const now = Date.now();

      if (mode === 'stopwatch') {
        if (swStart) {
          setDisplayTime(swAccumulated + (now - swStart));
        } else {
          setDisplayTime(swAccumulated);
        }
      } else {
        // Timer Mode
        if (isTimerRunning && timerEndTime) {
          const remaining = timerEndTime - now;
          if (remaining <= 0) {
            setDisplayTime(0);
            handleTimerComplete();
          } else {
            setDisplayTime(remaining);
          }
        } else {
          setDisplayTime(timerLeft);
        }
      }

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    updateLoop();

    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, swStart, swAccumulated, isTimerRunning, timerEndTime, timerLeft]);


  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false);
    setTimerEndTime(null);
    setTimerLeft(0);
    localStorage.removeItem('focusFlow_tm_end');
    
    // Play Sound if not already playing or just started
    if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
    
    // Show Notification
    if (Notification.permission === 'granted') {
        new Notification("FocusFlow", {
            body: "Time is up! Great focus session.",
            icon: '/vite.svg'
        });
    }
  }, []);

  // --- Stopwatch Logic ---
  const toggleStopwatch = useCallback(() => {
    if (swStart) {
      // Pause
      const now = Date.now();
      const elapsed = now - swStart;
      const newAcc = swAccumulated + elapsed;
      setSwAccumulated(newAcc);
      setSwStart(null);
      localStorage.setItem('focusFlow_timer_accumulated', newAcc.toString());
      localStorage.removeItem('focusFlow_timer_start');
    } else {
      // Start
      const now = Date.now();
      setSwStart(now);
      localStorage.setItem('focusFlow_timer_start', now.toString());
    }
  }, [swStart, swAccumulated]);

  const resetStopwatch = useCallback(() => {
    if (swAccumulated === 0 && !swStart) return; // Already reset

    if (window.confirm("Reset stopwatch?")) {
      setSwStart(null);
      setSwAccumulated(0);
      setSwLaps([]);
      localStorage.removeItem('focusFlow_timer_start');
      localStorage.removeItem('focusFlow_timer_accumulated');
      localStorage.removeItem('focusFlow_sw_laps');
    }
  }, [swAccumulated, swStart]);

  const lapStopwatch = useCallback(() => {
     if (swStart || swAccumulated > 0) {
         const current = swStart ? swAccumulated + (Date.now() - swStart) : swAccumulated;
         const newLaps = [current, ...swLaps];
         setSwLaps(newLaps);
         localStorage.setItem('focusFlow_sw_laps', JSON.stringify(newLaps));
     }
  }, [swStart, swAccumulated, swLaps]);


  // --- Timer Logic ---
  const toggleTimer = useCallback(() => {
    if (isTimerRunning) {
        // Pause
        if (timerEndTime) {
            const now = Date.now();
            const left = Math.max(0, timerEndTime - now);
            setTimerLeft(left);
            setTimerEndTime(null);
            setIsTimerRunning(false);
            localStorage.setItem('focusFlow_tm_left', left.toString());
            localStorage.removeItem('focusFlow_tm_end');
        }
    } else {
        // Start
        
        // Stop any playing audio when starting/restarting
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        if (timerLeft <= 0) {
            // Restart with default duration if finished
            const durMs = timerDurationMinutes * 60 * 1000;
            const now = Date.now();
            const end = now + durMs;
            setTimerLeft(durMs);
            setTimerEndTime(end);
            setIsTimerRunning(true);
            localStorage.setItem('focusFlow_tm_end', end.toString());
            localStorage.removeItem('focusFlow_tm_left');
        } else {
            // Resume
            const now = Date.now();
            const end = now + timerLeft;
            setTimerEndTime(end);
            setIsTimerRunning(true);
            localStorage.setItem('focusFlow_tm_end', end.toString());
            localStorage.removeItem('focusFlow_tm_left');
        }
        
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
  }, [isTimerRunning, timerEndTime, timerLeft, timerDurationMinutes]);

  const resetTimer = useCallback(() => {
      // Stop audio if playing
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }

      setIsTimerRunning(false);
      setTimerEndTime(null);
      const newLeft = timerDurationMinutes * 60 * 1000;
      setTimerLeft(newLeft);
      localStorage.removeItem('focusFlow_tm_end');
      localStorage.setItem('focusFlow_tm_left', newLeft.toString());
  }, [timerDurationMinutes]);

  const updateTimerDuration = (mins: number) => {
      setTimerDurationMinutes(mins);
      localStorage.setItem('focusFlow_tm_duration', mins.toString());
      if (!isTimerRunning) {
          setTimerLeft(mins * 60 * 1000);
          localStorage.setItem('focusFlow_tm_left', (mins * 60 * 1000).toString());
      }
  };


  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        mode === 'stopwatch' ? toggleStopwatch() : toggleTimer();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        mode === 'stopwatch' ? resetStopwatch() : resetTimer();
      } else if (e.key.toLowerCase() === 'l' && mode === 'stopwatch') {
          e.preventDefault();
          lapStopwatch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, toggleStopwatch, resetStopwatch, toggleTimer, resetTimer, lapStopwatch]);


  const formatTime = (ms: number, includeMs = false) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => n.toString().padStart(2, '0');
    let str = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    if (includeMs) str += `.${pad(milliseconds)}`;
    return str;
  };

  return (
    <div className={`mt-6 rounded-xl border overflow-hidden transition-all duration-300 ${
        (mode === 'stopwatch' && swStart) || (mode === 'timer' && isTimerRunning)
        ? 'bg-gray-800/90 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
        : 'bg-gray-800/60 border-gray-700'
    }`}>
      {/* Tabs */}
      <div className="flex border-b border-gray-700/50">
        <button 
            onClick={() => setMode('stopwatch')}
            className={`flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-colors ${
                mode === 'stopwatch' ? 'bg-cyan-900/20 text-cyan-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
        >
            Stopwatch
        </button>
        <button 
            onClick={() => setMode('timer')}
            className={`flex-1 py-3 text-sm font-bold tracking-wider uppercase transition-colors ${
                mode === 'timer' ? 'bg-purple-900/20 text-purple-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
        >
            Timer
        </button>
      </div>

      <div className="p-6 flex flex-col items-center">
        {/* Time Display */}
        <div className={`text-6xl sm:text-7xl font-orbitron tracking-widest tabular-nums mb-6 transition-colors ${
             (mode === 'stopwatch' && swStart) ? 'text-cyan-400' : 
             (mode === 'timer' && isTimerRunning) ? 'text-purple-400' : 
             (mode === 'timer' && displayTime === 0 && !isTimerRunning && timerDurationMinutes > 0) ? 'text-red-400 animate-pulse' :
             'text-gray-300'
        }`}>
            {formatTime(displayTime)}
        </div>

        {/* Timer Config */}
        {mode === 'timer' && !isTimerRunning && (
             <div className="flex items-center gap-3 mb-6 bg-gray-900/50 p-2 rounded-lg border border-gray-700">
                <span className="text-gray-400 text-sm font-bold uppercase">Duration:</span>
                <input 
                    type="number" 
                    min="1" 
                    max="999"
                    value={timerDurationMinutes} 
                    onChange={(e) => updateTimerDuration(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-16 bg-transparent text-white text-center font-orbitron focus:outline-none border-b border-gray-500 focus:border-purple-500 transition-colors"
                />
                <span className="text-gray-400 text-sm">min</span>
                <div className="flex gap-1 ml-2">
                    {[15, 25, 45, 60].map(m => (
                        <button 
                            key={m} 
                            onClick={() => updateTimerDuration(m)}
                            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-6">
            {mode === 'stopwatch' && (
                <button
                    onClick={lapStopwatch}
                    className="p-4 rounded-full bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    title="Lap (L)"
                >
                    <FlagIcon className="w-6 h-6" />
                </button>
            )}

            <button
                onClick={mode === 'stopwatch' ? toggleStopwatch : toggleTimer}
                className={`p-5 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 transform hover:scale-105 ${
                    (mode === 'stopwatch' && swStart) || (mode === 'timer' && isTimerRunning)
                    ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 ring-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                    : mode === 'stopwatch'
                        ? 'bg-cyan-600 text-white hover:bg-cyan-500 ring-cyan-500/30 shadow-[0_0_20px_rgba(8,145,178,0.4)]'
                        : 'bg-purple-600 text-white hover:bg-purple-500 ring-purple-500/30 shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                }`}
                title="Space to Start/Pause"
            >
                {(mode === 'stopwatch' && swStart) || (mode === 'timer' && isTimerRunning) 
                    ? <PauseIcon className="w-10 h-10" /> 
                    : <PlayIcon className="w-10 h-10 pl-1" />
                }
            </button>

            <button
                onClick={mode === 'stopwatch' ? resetStopwatch : resetTimer}
                className="p-4 rounded-full bg-gray-700 text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                title="Reset (R)"
            >
                <RefreshIcon className="w-6 h-6" />
            </button>
        </div>

        {/* Laps Display */}
        {mode === 'stopwatch' && swLaps.length > 0 && (
            <div className="w-full mt-6 border-t border-gray-700/50 pt-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Laps</h4>
                <div className="max-h-32 overflow-y-auto scrollbar-thin pr-2 space-y-1">
                    {swLaps.map((lap, i) => (
                        <div key={i} className="flex justify-between text-sm font-mono text-gray-400 px-2 py-1 bg-gray-900/30 rounded">
                            <span>Lap {swLaps.length - i}</span>
                            <span>{formatTime(lap, true)}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimer;
