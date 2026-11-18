import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  CheckSquare, 
  Lightbulb, 
  BarChart2, 
  GraduationCap, 
  Settings as SettingsIcon, 
  Flame, 
  Plus, 
  Sparkles,
  Headphones,
  Calendar
} from 'lucide-react';
import { 
  Subject, 
  Task, 
  StudySession, 
  Idea, 
  ExamMilestone, 
  FlashcardDeck, 
  UserPreferences,
  FocusModeType 
} from './types';
import { 
  INITIAL_SUBJECTS, 
  INITIAL_TASKS, 
  INITIAL_SESSIONS, 
  INITIAL_IDEAS, 
  INITIAL_EXAMS, 
  INITIAL_DECKS, 
  INITIAL_PREFERENCES,
  STORAGE_KEYS, 
  loadData, 
  saveData 
} from './utils/storage';
import { FocusTimer } from './components/FocusTimer';
import { TaskManager } from './components/TaskManager';
import { IdeaIncubator } from './components/IdeaIncubator';
import { StudyAnalytics } from './components/StudyAnalytics';
import { ExamsAndFlashcards } from './components/ExamsAndFlashcards';
import { SettingsModal } from './components/SettingsModal';
import { soundManager } from './utils/sound';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

type ActiveTab = 'timer' | 'tasks' | 'ideas' | 'analytics' | 'exams';

export default function App() {
  // State loaded from LocalStorage
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadData(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS)
  );
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadData(STORAGE_KEYS.TASKS, INITIAL_TASKS)
  );
  const [sessions, setSessions] = useState<StudySession[]>(() =>
    loadData(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS)
  );
  const [ideas, setIdeas] = useState<Idea[]>(() =>
    loadData(STORAGE_KEYS.IDEAS, INITIAL_IDEAS)
  );
  const [exams, setExams] = useState<ExamMilestone[]>(() =>
    loadData(STORAGE_KEYS.EXAMS, INITIAL_EXAMS)
  );
  const [decks, setDecks] = useState<FlashcardDeck[]>(() =>
    loadData(STORAGE_KEYS.DECKS, INITIAL_DECKS)
  );
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    loadData(STORAGE_KEYS.PREFS, INITIAL_PREFERENCES)
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('timer');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save changes to LocalStorage
  useEffect(() => {
    saveData(STORAGE_KEYS.SUBJECTS, subjects);
  }, [subjects]);

  useEffect(() => {
    saveData(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveData(STORAGE_KEYS.SESSIONS, sessions);
  }, [sessions]);

  useEffect(() => {
    saveData(STORAGE_KEYS.IDEAS, ideas);
  }, [ideas]);

  useEffect(() => {
    saveData(STORAGE_KEYS.EXAMS, exams);
  }, [exams]);

  useEffect(() => {
    saveData(STORAGE_KEYS.DECKS, decks);
  }, [decks]);

  useEffect(() => {
    saveData(STORAGE_KEYS.PREFS, preferences);
  }, [preferences]);

  // Daily streak check
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (preferences.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      let newStreak = preferences.dailyStreak;
      if (preferences.lastActiveDate === yesterday) {
        // Continuous streak maintained
      } else {
        // Streak missed
        // If more than 1 day lapsed, keep it unless resetting
      }
      setPreferences(prev => ({ ...prev, lastActiveDate: today }));
    }
  }, [preferences.lastActiveDate, preferences.dailyStreak]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // --- Handlers ---
  const handleLogSession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: 'sess-' + Date.now()
    };
    setSessions(prev => [newSession, ...prev]);

    // If session had a linked task, update task's spent minutes
    if (sessionData.taskId) {
      setTasks(prev =>
        prev.map(t =>
          t.id === sessionData.taskId
            ? { ...t, spentMinutes: t.spentMinutes + sessionData.durationMinutes }
            : t
        )
      );
    }

    // Update daily streak
    const today = new Date().toISOString().slice(0, 10);
    setPreferences(prev => ({
      ...prev,
      dailyStreak: prev.lastActiveDate === today ? prev.dailyStreak : prev.dailyStreak + 1,
      lastActiveDate: today
    }));

    showToast(`Logged ${sessionData.durationMinutes} min focus session! Keep up the momentum.`);
  };

  const handleStartFocusOnTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setActiveTab('timer');
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
    showToast(`Created task "${newTask.title}"`);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (activeTaskId === taskId) setActiveTaskId(null);
  };

  const handleAddIdea = (ideaData: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIdea: Idea = {
      ...ideaData,
      id: 'idea-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setIdeas(prev => [newIdea, ...prev]);
    showToast(`Incubated idea "${newIdea.title}"`);
  };

  const handleUpdateIdea = (updatedIdea: Idea) => {
    setIdeas(prev => prev.map(i => (i.id === updatedIdea.id ? updatedIdea : i)));
  };

  const handleDeleteIdea = (ideaId: string) => {
    setIdeas(prev => prev.filter(i => i.id !== ideaId));
  };

  const handleConvertIdeaToTask = (idea: Idea) => {
    const newTask: Task = {
      id: 'task-' + Date.now(),
      title: idea.title,
      description: idea.description,
      subjectId: idea.linkedSubjectId || subjects[0]?.id || '',
      priority: idea.priority === 'high' ? 'high' : 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      estimatedMinutes: 90,
      spentMinutes: 0,
      subtasks: idea.actionItems.map((item, idx) => ({
        id: 'st-' + Date.now() + '-' + idx,
        text: item.text,
        completed: item.done
      })),
      tags: [...idea.tags, idea.category],
      createdAt: new Date().toISOString(),
      linkedIdeaId: idea.id
    };

    setTasks(prev => [newTask, ...prev]);
    setActiveTab('tasks');
    showToast(`Converted idea into an actionable task!`);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleToggleTopicCompleted = (subjectId: string, topicId: string) => {
    setSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          syllabusTopics: s.syllabusTopics.map(topic =>
            topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
          )
        };
      })
    );
  };

  // Export all user data as JSON file
  const handleExportData = () => {
    const fullBackup = {
      subjects,
      tasks,
      sessions,
      ideas,
      exams,
      decks,
      preferences,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `keystone-study-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup successfully downloaded!');
  };

  // Import data from JSON file
  const handleImportData = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.subjects) setSubjects(parsed.subjects);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.sessions) setSessions(parsed.sessions);
      if (parsed.ideas) setIdeas(parsed.ideas);
      if (parsed.exams) setExams(parsed.exams);
      if (parsed.decks) setDecks(parsed.decks);
      if (parsed.preferences) setPreferences(parsed.preferences);
      showToast('Successfully restored data from backup!');
    } catch {
      showToast('Failed to import: Invalid JSON backup file.');
    }
  };

  // Reset to initial starter data
  const handleResetData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setTasks(INITIAL_TASKS);
    setSessions(INITIAL_SESSIONS);
    setIdeas(INITIAL_IDEAS);
    setExams(INITIAL_EXAMS);
    setDecks(INITIAL_DECKS);
    setPreferences(INITIAL_PREFERENCES);
    showToast('Reset data to initial sample courses and records.');
  };

  // Count active incomplete tasks
  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract:
          Zone 1: Single text element wordmark
          Zone 2: 4-6 clean text navigation links
          Zone 3: 1-2 primary actions
      */}
      <header className="sticky top-0 z-40 bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setActiveTab('timer'); }}
            className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
            <span>Keystone Study</span>
          </a>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {([
            { id: 'timer' as const, label: 'Focus Timer', icon: Timer, badge: undefined },
            { id: 'tasks' as const, label: 'Tasks & Board', icon: CheckSquare, badge: pendingTasksCount },
            { id: 'ideas' as const, label: 'Ideas Vault', icon: Lightbulb, badge: ideas.length },
            { id: 'analytics' as const, label: 'Analytics & Logs', icon: BarChart2, badge: undefined },
            { id: 'exams' as const, label: 'Exams & Decks', icon: GraduationCap, badge: undefined }
          ]).map(nav => {
            const IconComponent = nav.icon;
            const isActive = activeTab === nav.id;

            return (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{nav.label}</span>
                {nav.badge !== undefined && nav.badge > 0 && (
                  <span className="ml-0.5 text-[10px] font-mono tabular-nums text-slate-500">
                    ({nav.badge})
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak Indicator */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs font-semibold text-amber-300"
            title={`${preferences.dailyStreak} consecutive days study streak`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span className="font-mono tabular-nums">{preferences.dailyStreak}d streak</span>
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Settings Trigger */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors border border-slate-800 cursor-pointer"
            title="Studio Preferences & Data Management"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Tab Bar (sticky at bottom for compact screens) */}
      <div className="md:hidden sticky bottom-0 z-40 bg-[#0e1422]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-1">
        {(
          [
            { id: 'timer', label: 'Timer', icon: Timer },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'ideas', label: 'Ideas', icon: Lightbulb },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            { id: 'exams', label: 'Exams', icon: GraduationCap }
          ] as const
        ).map(nav => {
          const IconComponent = nav.icon;
          const isActive = activeTab === nav.id;
          return (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded text-[10px] transition-colors ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{nav.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'timer' && (
          <FocusTimer
            subjects={subjects}
            tasks={tasks}
            preferences={preferences}
            onUpdatePreferences={setPreferences}
            onLogSession={handleLogSession}
            activeTaskId={activeTaskId}
            onClearActiveTask={() => setActiveTaskId(null)}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManager
            tasks={tasks}
            subjects={subjects}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onStartFocusOnTask={handleStartFocusOnTask}
          />
        )}

        {activeTab === 'ideas' && (
          <IdeaIncubator
            ideas={ideas}
            subjects={subjects}
            onAddIdea={handleAddIdea}
            onUpdateIdea={handleUpdateIdea}
            onDeleteIdea={handleDeleteIdea}
            onConvertIdeaToTask={handleConvertIdeaToTask}
          />
        )}

        {activeTab === 'analytics' && (
          <StudyAnalytics
            sessions={sessions}
            subjects={subjects}
            tasks={tasks}
            preferences={preferences}
            onLogSession={handleLogSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'exams' && (
          <ExamsAndFlashcards
            exams={exams}
            decks={decks}
            subjects={subjects}
            onAddExam={(newExam) => {
              setExams(prev => [{ ...newExam, id: 'exam-' + Date.now() }, ...prev]);
              showToast(`Added milestone "${newExam.title}"`);
            }}
            onUpdateExam={(updated) => {
              setExams(prev => prev.map(e => e.id === updated.id ? updated : e));
            }}
            onDeleteExam={(id) => {
              setExams(prev => prev.filter(e => e.id !== id));
            }}
            onToggleTopicCompleted={handleToggleTopicCompleted}
            onAddDeck={(newDeck) => {
              setDecks(prev => [{ ...newDeck, id: 'deck-' + Date.now() }, ...prev]);
              showToast(`Created active recall deck "${newDeck.title}"`);
            }}
            onUpdateDeck={(updated) => {
              setDecks(prev => prev.map(d => d.id === updated.id ? updated : d));
            }}
            onDeleteDeck={(id) => {
              setDecks(prev => prev.filter(d => d.id !== id));
            }}
          />
        )}
      </main>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-white animate-in slide-in-from-bottom-2 fade-in duration-200">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={setPreferences}
        subjects={subjects}
        onAddSubject={(subj) => {
          const newSubj: Subject = {
            ...subj,
            id: 'subj-' + Date.now()
          };
          setSubjects(prev => [...prev, newSubj]);
          showToast(`Added course "${newSubj.name}"`);
        }}
        onDeleteSubject={(id) => {
          setSubjects(prev => prev.filter(s => s.id !== id));
        }}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
