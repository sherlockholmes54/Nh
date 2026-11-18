import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Volume2, VolumeX, Maximize2, Minimize2, Sparkles, BookOpen, Clock, AlertCircle, Headphones, Plus } from 'lucide-react';
import { Subject, Task, FocusModeType, StudySession, UserPreferences, SessionMood } from '../types';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface FocusTimerProps {
  subjects: Subject[];
  tasks: Task[];
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onLogSession: (session: Omit<StudySession, 'id'>) => void;
  activeTaskId?: string | null;
  onClearActiveTask?: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  subjects,
  tasks,
  preferences,
  onUpdatePreferences,
  onLogSession,
  activeTaskId,
  onClearActiveTask
}) => {
  const [mode, setMode] = useState<FocusModeType>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(activeTaskId || '');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(preferences.pomodoroMinutes * 60);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  const [distractionNote, setDistractionNote] = useState('');
  const [distractionList, setDistractionList] = useState<string[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionMood, setSessionMood] = useState<SessionMood>('focused');
  const [sessionRating, setSessionRating] = useState(5);
  const [completedDurationMinutes, setCompletedDurationMinutes] = useState(0);

  const timerRef = useRef<number | null>(null);

  // Sync active task from props
  useEffect(() => {
    if (activeTaskId) {
      setSelectedTaskId(activeTaskId);
      const foundTask = tasks.find(t => t.id === activeTaskId);
      if (foundTask) {
        setSelectedSubjectId(foundTask.subjectId);
      }
    }
  }, [activeTaskId, tasks]);

  // Update timer initial time on mode change
  const getDurationForMode = (targetMode: FocusModeType) => {
    switch (targetMode) {
      case 'pomodoro':
        return preferences.pomodoroMinutes * 60;
      case 'short_break':
        return preferences.shortBreakMinutes * 60;
      case 'long_break':
        return preferences.longBreakMinutes * 60;
      case 'deep_work':
        return 50 * 60;
      case 'stopwatch':
        return 0;
      default:
        return 25 * 60;
    }
  };

  const handleModeChange = (newMode: FocusModeType) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    if (newMode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      setSecondsLeft(getDurationForMode(newMode));
    }
  };

  // Timer interval
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchSeconds(prev => prev + 1);
        } else {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (preferences.soundEnabled) {
      soundManager.playChime();
    }
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }

    if (mode === 'pomodoro' || mode === 'deep_work') {
      const minutes = mode === 'pomodoro' ? preferences.pomodoroMinutes : 50;
      setCompletedDurationMinutes(minutes);
      setShowLogModal(true);
    }
  };

  const togglePlayPause = () => {
    if (!isRunning) {
      // Start
      setIsRunning(true);
      if (preferences.ambientSound !== 'none') {
        soundManager.setAmbient(preferences.ambientSound, preferences.ambientVolume);
      }
    } else {
      // Pause
      setIsRunning(false);
      soundManager.stopAmbient();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    soundManager.stopAmbient();
    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
    } else {
      setSecondsLeft(getDurationForMode(mode));
    }
  };

  const finishSessionEarly = () => {
    setIsRunning(false);
    soundManager.stopAmbient();
    let duration = 0;
    if (mode === 'stopwatch') {
      duration = Math.max(1, Math.round(stopwatchSeconds / 60));
    } else {
      const totalModeSecs = getDurationForMode(mode);
      const elapsed = totalModeSecs - secondsLeft;
      duration = Math.max(1, Math.round(elapsed / 60));
    }
    setCompletedDurationMinutes(duration);
    setShowLogModal(true);
  };

  const handleSaveSession = () => {
    if (completedDurationMinutes > 0 && selectedSubjectId) {
      onLogSession({
        subjectId: selectedSubjectId,
        durationMinutes: completedDurationMinutes,
        date: new Date().toISOString(),
        technique: mode,
        notes: sessionNotes.trim() || (distractionList.length > 0 ? `Captured: ${distractionList.join('; ')}` : 'Productive focused session.'),
        rating: sessionRating,
        mood: sessionMood,
        taskId: selectedTaskId || undefined
      });
      if (preferences.soundEnabled) {
        soundManager.playComplete();
      }
    }
    setShowLogModal(false);
    setSessionNotes('');
    setDistractionList([]);
    resetTimer();
    if (onClearActiveTask) onClearActiveTask();
  };

  const handleAmbientChange = (type: 'none' | 'brown' | 'white' | 'binaural') => {
    onUpdatePreferences({ ...preferences, ambientSound: type });
    if (isRunning) {
      soundManager.setAmbient(type, preferences.ambientVolume);
    }
  };

  const handleVolumeChange = (vol: number) => {
    onUpdatePreferences({ ...preferences, ambientVolume: vol });
    soundManager.setAmbientVolume(vol);
  };

  const addDistractionNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (distractionNote.trim()) {
      setDistractionList([...distractionList, distractionNote.trim()]);
      setDistractionNote('');
    }
  };

  // Format time display
  const currentTotal = mode === 'stopwatch' ? stopwatchSeconds : secondsLeft;
  const mins = Math.floor(currentTotal / 60);
  const secs = currentTotal % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  const linkedTask = tasks.find(t => t.id === selectedTaskId);

  // Percentage for progress ring / bar
  const totalTargetSec = getDurationForMode(mode);
  const progressPercent = mode === 'stopwatch' 
    ? Math.min(100, (stopwatchSeconds / 3600) * 100)
    : totalTargetSec > 0 ? Math.max(0, Math.min(100, ((totalTargetSec - secondsLeft) / totalTargetSec) * 100)) : 0;

  return (
    <div className={`transition-all duration-300 ${isZenMode ? 'fixed inset-0 z-50 bg-[#0b0f17] flex flex-col justify-center items-center p-6' : 'w-full'}`}>
      {/* Zen Mode Header */}
      {isZenMode && (
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            title="Exit Zen Mode (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen Mode</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className={`mx-auto w-full ${isZenMode ? 'max-w-2xl text-center' : 'max-w-4xl'}`}>
        {/* Card Container */}
        <div className="rounded-2xl border border-slate-800/90 bg-[#111726]/90 backdrop-blur-md p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle accent glow matching subject */}
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none transition-all duration-700"
            style={{ backgroundColor: currentSubject?.color || '#3b82f6' }}
          />

          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800/80">
              {(
                [
                  { id: 'pomodoro', label: 'Pomodoro 25m' },
                  { id: 'deep_work', label: 'Deep Work 50m' },
                  { id: 'short_break', label: 'Short Break 5m' },
                  { id: 'long_break', label: 'Long Break 15m' },
                  { id: 'stopwatch', label: 'Stopwatch' }
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleModeChange(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    mode === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {!isZenMode && (
              <button
                onClick={() => setIsZenMode(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-slate-800 transition-colors"
                title="Full-screen Zen Study Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zen Mode</span>
              </button>
            )}
          </div>

          {/* Subject & Linked Task Selector Row */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Study Subject
              </label>
              <div className="relative">
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} · {s.name}
                    </option>
                  ))}
                </select>
                <div
                  className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-l"
                  style={{ backgroundColor: currentSubject?.color || '#3b82f6' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Working on Task (Optional)
              </label>
              <select
                value={selectedTaskId}
                onChange={e => {
                  setSelectedTaskId(e.target.value);
                  const found = tasks.find(t => t.id === e.target.value);
                  if (found) setSelectedSubjectId(found.subjectId);
                }}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                <option value="">None / General Study Session</option>
                {tasks
                  .filter(t => t.status !== 'completed')
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.priority.toUpperCase()})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Linked Task Banner if selected */}
          {linkedTask && (
            <div className="mt-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">
                  Target: <strong className="text-white font-medium">{linkedTask.title}</strong> · {linkedTask.spentMinutes}m logged so far (est. {linkedTask.estimatedMinutes}m)
                </span>
              </div>
              <button
                onClick={() => setSelectedTaskId('')}
                className="text-slate-400 hover:text-slate-200 text-xs ml-2 underline shrink-0"
              >
                Detach
              </button>
            </div>
          )}

          {/* Central Timer Display */}
          <div className="my-8 sm:my-10 flex flex-col items-center justify-center">
            {/* Circular / Progress Indicator */}
            <div className="relative flex items-center justify-center">
              {/* Outer soft ring */}
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-slate-800/90 flex flex-col items-center justify-center relative bg-slate-950/40 shadow-inner">
                {/* Visual SVG Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={currentSubject?.color || '#6366f1'}
                    strokeWidth="4"
                    strokeDasharray="282.74"
                    strokeDashoffset={282.74 - (282.74 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>

                <span className="text-xs uppercase tracking-widest text-slate-400 mb-1 font-medium">
                  {mode === 'pomodoro'
                    ? 'Pomodoro Session'
                    : mode === 'deep_work'
                    ? 'Deep Focus'
                    : mode === 'short_break'
                    ? 'Short Rest'
                    : mode === 'long_break'
                    ? 'Long Rest'
                    : 'Stopwatch Mode'}
                </span>

                {/* Big Numerals */}
                <div className="font-mono-tabular text-5xl sm:text-6xl font-bold tracking-tight text-white drop-shadow-sm">
                  {timeFormatted}
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: currentSubject?.color || '#3b82f6' }}
                  />
                  <span className="max-w-[170px] truncate font-medium text-slate-300">
                    {currentSubject ? currentSubject.name : 'Study Focus'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Action Controls */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={resetTimer}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                className={`px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center gap-2.5 shadow-lg transition-all transform active:scale-95 ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pause Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Focusing</span>
                  </>
                )}
              </button>

              <button
                onClick={finishSessionEarly}
                className="p-3 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                title="Complete & Log Session"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ambient Sound & Audio Engine Control Bar */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mr-1">
                <Headphones className="w-4 h-4 text-indigo-400" />
                <span>Ambient Sound:</span>
              </div>
              {(
                [
                  { id: 'none', label: 'Off' },
                  { id: 'brown', label: 'Brown Noise' },
                  { id: 'white', label: 'Rain / White' },
                  { id: 'binaural', label: 'Alpha 10Hz' }
                ] as const
              ).map(snd => (
                <button
                  key={snd.id}
                  onClick={() => handleAmbientChange(snd.id)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    preferences.ambientSound === snd.id
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {snd.label}
                </button>
              ))}
            </div>

            {/* Volume & Sound Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  onUpdatePreferences({ ...preferences, soundEnabled: !preferences.soundEnabled })
                }
                className={`text-slate-400 hover:text-slate-200 p-1.5 rounded-lg ${
                  preferences.soundEnabled ? 'text-indigo-400' : 'text-slate-600'
                }`}
                title={preferences.soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
              >
                {preferences.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {preferences.ambientSound !== 'none' && (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={preferences.ambientVolume}
                    onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1.5 bg-slate-800 rounded-lg accent-indigo-500 cursor-pointer"
                    title="Ambient Sound Volume"
                  />
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    {Math.round(preferences.ambientVolume * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brain Dump / Distraction Parking Lot */}
        <div className="mt-6 rounded-xl border border-slate-800/80 bg-[#111726]/60 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Distraction Parking Lot</span>
              <span className="text-slate-500 font-normal">
                (Park random thoughts here so you don't break flow)
              </span>
            </div>
            {distractionList.length > 0 && (
              <button
                onClick={() => setDistractionList([])}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Clear all
              </button>
            )}
          </div>

          <form onSubmit={addDistractionNote} className="flex gap-2">
            <input
              type="text"
              value={distractionNote}
              onChange={e => setDistractionNote(e.target.value)}
              placeholder="e.g. Remember to pay electric bill, search for internship article..."
              className="flex-1 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Park</span>
            </button>
          </form>

          {distractionList.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {distractionList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/60 text-xs text-slate-300"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => setDistractionList(distractionList.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-slate-200 ml-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session Reflection & Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/80 bg-[#111726] p-6 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Log Study Session</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Great work! Record your reflection to track your cognitive habits and learning efficiency.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                  <span>Subject: <strong>{currentSubject?.name}</strong></span>
                  <span className="font-mono-tabular font-bold text-indigo-400">
                    {completedDurationMinutes} minutes
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  How was your focus & clarity?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(
                    [
                      { id: 'focused', label: 'Laser Focused', icon: '🎯' },
                      { id: 'energetic', label: 'Energetic', icon: '⚡' },
                      { id: 'neutral', label: 'Steady', icon: '📖' },
                      { id: 'tired', label: 'Fatigued', icon: '🥱' },
                      { id: 'distracted', label: 'Wandering', icon: '💭' }
                    ] as const
                  ).map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSessionMood(m.id)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        sessionMood === m.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-lg block mb-0.5">{m.icon}</span>
                      <span className="text-[10px] block leading-tight font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Efficiency Rating ({sessionRating} / 5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSessionRating(star)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                        sessionRating >= star
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                          : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Session Notes & Key Insights Learned
                </label>
                <textarea
                  rows={3}
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  placeholder="What key concept did you master? What roadblock did you hit? (e.g., Solved Raft split-vote case, need to drill p-values tomorrow)..."
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowLogModal(false);
                  resetTimer();
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveSession}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 transition-colors"
              >
                Save & Log Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
