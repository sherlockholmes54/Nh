import React, { useState } from 'react';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  Target, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Smile, 
  Filter,
  Sparkles
} from 'lucide-react';
import { StudySession, Subject, Task, UserPreferences, FocusModeType, SessionMood } from '../types';

interface StudyAnalyticsProps {
  sessions: StudySession[];
  subjects: Subject[];
  tasks: Task[];
  preferences: UserPreferences;
  onLogSession: (session: Omit<StudySession, 'id'>) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({
  sessions,
  subjects,
  tasks,
  preferences,
  onLogSession,
  onDeleteSession
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual session modal form
  const [manualSubjectId, setManualSubjectId] = useState(subjects[0]?.id || '');
  const [manualDuration, setManualDuration] = useState(45);
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualTechnique, setManualTechnique] = useState<FocusModeType>('deep_work');
  const [manualRating, setManualRating] = useState(5);
  const [manualMood, setManualMood] = useState<SessionMood>('focused');
  const [manualNotes, setManualNotes] = useState('');

  // Calculations
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Calculate past 7 days data
  const daysData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

    const dayMinutes = sessions
      .filter(s => s.date.slice(0, 10) === dateStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    return {
      date: dateStr,
      day: dayLabel,
      minutes: dayMinutes,
      hours: (dayMinutes / 60).toFixed(1)
    };
  });

  const maxDayMinutes = Math.max(...daysData.map(d => d.minutes), 60);

  // Weekly hours calculation (last 7 days sum)
  const past7DaysTotalMinutes = daysData.reduce((acc, d) => acc + d.minutes, 0);
  const weeklyHoursLogged = (past7DaysTotalMinutes / 60).toFixed(1);
  const weeklyGoalPercent = Math.min(
    100,
    Math.round((past7DaysTotalMinutes / (preferences.weeklyHoursGoal * 60)) * 100)
  );

  // Average Rating
  const avgRating = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + s.rating, 0) / sessions.length).toFixed(1)
    : '5.0';

  // Per subject breakdown
  const subjectBreakdown = subjects.map(subj => {
    const subjMinutes = sessions
      .filter(s => s.subjectId === subj.id)
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    const percent = totalMinutes > 0 ? Math.round((subjMinutes / totalMinutes) * 100) : 0;
    return {
      ...subj,
      loggedMinutes: subjMinutes,
      loggedHours: (subjMinutes / 60).toFixed(1),
      percent
    };
  });

  // Filtered session list
  const filteredSessions = sessions
    .filter(s => selectedSubjectFilter === 'all' || s.subjectId === selectedSubjectFilter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualDuration <= 0) return;

    onLogSession({
      subjectId: manualSubjectId,
      durationMinutes: Number(manualDuration),
      date: new Date(manualDate + 'T12:00:00').toISOString(),
      technique: manualTechnique,
      notes: manualNotes.trim() || 'Offline study session recorded.',
      rating: manualRating,
      mood: manualMood
    });

    setIsManualModalOpen(false);
    setManualNotes('');
  };

  const getMoodEmoji = (mood: SessionMood) => {
    switch (mood) {
      case 'focused':
        return '🎯 Focused';
      case 'energetic':
        return '⚡ Energetic';
      case 'neutral':
        return '📖 Steady';
      case 'tired':
        return '🥱 Fatigued';
      case 'distracted':
        return '💭 Wandering';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Analytics Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#111726]/70">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Total Study Hours</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-mono-tabular font-bold text-white">
            {totalHours} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <span className="text-[11px] text-slate-500">{sessions.length} total logged sessions</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111726]/70">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono-tabular font-bold text-amber-400">
            {preferences.dailyStreak} <span className="text-xs font-normal text-slate-400">days</span>
          </div>
          <span className="text-[11px] text-slate-500">Consecutive days focused</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111726]/70">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Weekly Goal Progress</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono-tabular font-bold text-white">
            {weeklyHoursLogged} / {preferences.weeklyHoursGoal} <span className="text-xs font-normal text-slate-400">hrs</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${weeklyGoalPercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111726]/70">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Avg Session Quality</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono-tabular font-bold text-white">
            ★ {avgRating} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <span className="text-[11px] text-slate-500">Self-reported focus efficiency</span>
        </div>
      </div>

      {/* 7-Day Velocity Chart & Subject Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 7-Day Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-[#111726]/70 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-sm font-semibold text-white">7-Day Study Velocity</h4>
              <span className="text-xs text-slate-400">Minutes of deliberate practice per day</span>
            </div>
            <div className="text-xs font-mono-tabular text-indigo-400 font-semibold">
              {past7DaysTotalMinutes} mins past week
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
            {daysData.map((d, i) => {
              const heightPercent = maxDayMinutes > 0 ? (d.minutes / maxDayMinutes) * 100 : 0;
              const isToday = i === 6;

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-200 pointer-events-none whitespace-nowrap">
                    {d.minutes}m ({d.hours}h)
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-slate-800/80 rounded-t-md overflow-hidden relative flex items-end h-full">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isToday
                          ? 'bg-indigo-500 group-hover:bg-indigo-400'
                          : 'bg-slate-600 group-hover:bg-slate-500'
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className={`text-xs font-medium ${isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Allocation Breakdown */}
        <div className="rounded-2xl border border-slate-800 bg-[#111726]/70 p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Subject Time Distribution</h4>
            <p className="text-xs text-slate-400 mb-4">Focus allocation across your courses</p>

            <div className="space-y-3.5">
              {subjectBreakdown.map(s => (
                <div key={s.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-300 font-medium">{s.code}</span>
                    </div>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {s.loggedHours}h ({s.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: s.color,
                        width: `${s.percent}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log Offline Study Session</span>
          </button>
        </div>
      </div>

      {/* Session Logs History Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#111726]/70 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Deliberate Study Session Log</h4>
            <span className="text-xs text-slate-400">Historical study intervals, ratings, and reflections</span>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSubjectFilter}
              onChange={e => setSelectedSubjectFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} · {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Quality</th>
                  <th className="py-2.5 px-3">Mood</th>
                  <th className="py-2.5 px-3">Notes & Reflection</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSessions.map(session => {
                  const subject = subjects.find(s => s.id === session.subjectId);
                  const dateFormatted = new Date(session.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={session.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 font-mono">
                        {dateFormatted}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: subject?.color || '#94a3b8' }}
                          />
                          <span className="font-medium text-white">{subject?.code}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono-tabular font-semibold text-indigo-400">
                        {session.durationMinutes} mins
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap capitalize text-slate-400">
                        {session.technique.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-amber-400 font-semibold">
                        ★ {session.rating}.0
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-300">
                        {getMoodEmoji(session.mood)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                        {session.notes || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onDeleteSession(session.id)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Session Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No study sessions recorded yet for this filter. Start a session with the Focus Timer!
          </div>
        )}
      </div>

      {/* Log Offline Session Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111726] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Log Offline Study Session</h3>
            <p className="text-xs text-slate-400 mb-4">
              Studied in library or offline? Record your hours to keep your streak and weekly analytics accurate.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <select
                  value={manualSubjectId}
                  onChange={e => setManualSubjectId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} · {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={manualDuration}
                    onChange={e => setManualDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Technique</label>
                  <select
                    value={manualTechnique}
                    onChange={e => setManualTechnique(e.target.value as FocusModeType)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="deep_work">Deep Work Block</option>
                    <option value="pomodoro">Pomodoro Drill</option>
                    <option value="stopwatch">Free Study</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quality (1-5)</label>
                  <select
                    value={manualRating}
                    onChange={e => setManualRating(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="5">★ 5 - Exceptional</option>
                    <option value="4">★ 4 - Good</option>
                    <option value="3">★ 3 - Average</option>
                    <option value="2">★ 2 - Distracted</option>
                    <option value="1">★ 1 - Low focus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes & Key Takeaways</label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  placeholder="What concepts or problems did you tackle?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Record Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
