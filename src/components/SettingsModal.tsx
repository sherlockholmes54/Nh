import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  Volume2, 
  VolumeX, 
  Sliders, 
  BookOpen 
} from 'lucide-react';
import { UserPreferences, Subject } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onDeleteSubject: (subjectId: string) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  subjects,
  onAddSubject,
  onDeleteSubject,
  onExportData,
  onImportData,
  onResetData
}) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'subjects' | 'data'>('timer');

  // Form states for preferences
  const [pomoMinutes, setPomoMinutes] = useState(preferences.pomodoroMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(preferences.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(preferences.longBreakMinutes);
  const [weeklyGoal, setWeeklyGoal] = useState(preferences.weeklyHoursGoal);

  // New subject inputs
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('#3b82f6');
  const [newSubjHours, setNewSubjHours] = useState(8);

  if (!isOpen) return null;

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      ...preferences,
      pomodoroMinutes: Number(pomoMinutes) || 25,
      shortBreakMinutes: Number(shortBreakMinutes) || 5,
      longBreakMinutes: Number(longBreakMinutes) || 15,
      weeklyHoursGoal: Number(weeklyGoal) || 25
    });
    onClose();
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim() || !newSubjCode.trim()) return;

    onAddSubject({
      name: newSubjName.trim(),
      code: newSubjCode.trim(),
      color: newSubjColor,
      targetWeeklyHours: Number(newSubjHours) || 6,
      syllabusTopics: []
    });

    setNewSubjName('');
    setNewSubjCode('');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        onImportData(text);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-[#111726] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Study Studio Settings & Data</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timer'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Focus & Intervals
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'subjects'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Courses & Subjects
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'data'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Backup & Sync
          </button>
        </div>

        {/* TIMER & INTERVALS TAB */}
        {activeTab === 'timer' && (
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Pomodoro (min)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={pomoMinutes}
                  onChange={e => setPomoMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Short Rest (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={shortBreakMinutes}
                  onChange={e => setShortBreakMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Long Rest (min)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={longBreakMinutes}
                  onChange={e => setLongBreakMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Weekly Study Hours Goal
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={weeklyGoal}
                onChange={e => setWeeklyGoal(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Used to calculate your velocity rings and weekly progress bar.
              </span>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Save Preferences
              </button>
            </div>
          </form>
        )}

        {/* SUBJECTS & COURSES TAB */}
        {activeTab === 'subjects' && (
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Active Courses & Subjects
              </h4>
              <div className="space-y-2">
                {subjects.map(s => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <div>
                        <span className="text-xs font-semibold text-white mr-2">{s.code}</span>
                        <span className="text-xs text-slate-400">{s.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {s.targetWeeklyHours}h/wk
                      </span>
                      {subjects.length > 1 && (
                        <button
                          onClick={() => onDeleteSubject(s.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add new subject form */}
            <form onSubmit={handleCreateSubject} className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 space-y-3">
              <h5 className="text-xs font-bold text-white">Add New Subject / Course</h5>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={newSubjName}
                    onChange={e => setNewSubjName(e.target.value)}
                    placeholder="e.g. Organic Chemistry"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Course Code</label>
                  <input
                    type="text"
                    required
                    value={newSubjCode}
                    onChange={e => setNewSubjCode(e.target.value)}
                    placeholder="e.g. CHEM-210"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Color</label>
                  <input
                    type="color"
                    value={newSubjColor}
                    onChange={e => setNewSubjColor(e.target.value)}
                    className="w-full h-8 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Weekly Target Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={newSubjHours}
                    onChange={e => setNewSubjHours(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                + Add Course
              </button>
            </form>
          </div>
        )}

        {/* DATA BACKUP & SYNC TAB */}
        {activeTab === 'data' && (
          <div className="space-y-4 text-xs">
            {/* PWA Standalone Install Card */}
            <PWAInstallButton variant="settings" />

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
              <h5 className="font-semibold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Local Data Backup</span>
              </h5>
              <p className="text-slate-400 text-[11px]">
                Download your complete study logs, tasks, ideas, exams, and flashcard decks as a JSON file.
              </p>
              <button
                onClick={onExportData}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                Download JSON Backup
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
              <h5 className="font-semibold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restore from JSON Backup</span>
              </h5>
              <p className="text-slate-400 text-[11px]">
                Restore your previous state from an exported JSON file.
              </p>
              <label className="inline-block mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium cursor-pointer border border-slate-700 transition-colors">
                <span>Select Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20 space-y-2">
              <h5 className="font-semibold text-rose-300 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>Reset to Sample Data</span>
              </h5>
              <p className="text-slate-400 text-[11px]">
                Erase local changes and load default subjects, sample tasks, and study records.
              </p>
              <button
                onClick={() => {
                  if (window.confirm('Reset all study data and tasks to sample defaults?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="mt-2 px-4 py-2 bg-rose-900/40 hover:bg-rose-900/70 border border-rose-800 text-rose-200 rounded-lg font-medium transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
