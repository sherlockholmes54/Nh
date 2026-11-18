import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Play, 
  Calendar, 
  CheckSquare, 
  Tag, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertTriangle
} from 'lucide-react';
import { Task, Subject, Priority, TaskStatus, Subtask } from '../types';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface TaskManagerProps {
  tasks: Task[];
  subjects: Subject[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStartFocusOnTask: (taskId: string) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  subjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onStartFocusOnTask
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setSubjectId(subjects[0]?.id || '');
    setPriority('medium');
    setDueDate(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
    setEstimatedMinutes(60);
    setTagInput('');
    setSubtasks([]);
    setNewSubtaskText('');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setSubjectId(task.subjectId);
    setPriority(task.priority);
    setDueDate(task.dueDate);
    setEstimatedMinutes(task.estimatedMinutes);
    setTagInput(task.tags.join(', '));
    setSubtasks([...task.subtasks]);
    setNewSubtaskText('');
    setIsModalOpen(true);
  };

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      setSubtasks([...subtasks, { id: 'st-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6), text: newSubtaskText.trim(), completed: false }]);
      setNewSubtaskText('');
    }
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title: title.trim(),
        description: description.trim(),
        subjectId,
        priority,
        dueDate,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        subtasks,
        tags: parsedTags
      });
    } else {
      onAddTask({
        title: title.trim(),
        description: description.trim(),
        subjectId,
        priority,
        status: 'todo',
        dueDate,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        spentMinutes: 0,
        subtasks,
        tags: parsedTags
      });
    }

    setIsModalOpen(false);
  };

  const toggleSubtaskCompletion = (task: Task, subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
    
    // If all subtasks completed, prompt/offer status change
    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
      status: allDone ? 'review' : task.status
    });
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    const wasCompleted = task.status === 'completed';
    const isNowCompleted = newStatus === 'completed';

    if (!wasCompleted && isNowCompleted) {
      soundManager.playComplete();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {
        // safe fallback
      }
    }

    onUpdateTask({
      ...task,
      status: newStatus,
      completedAt: isNowCompleted ? new Date().toISOString() : undefined
    });
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTaskIds(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubjectFilter === 'all' || task.subjectId === selectedSubjectFilter;

    const matchesPriority =
      selectedPriorityFilter === 'all' || task.priority === selectedPriorityFilter;

    const matchesStatus =
      statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesSubject && matchesPriority && matchesStatus;
  });

  // Count summary metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'completed') return false;
    const due = new Date(t.dueDate).setHours(23, 59, 59, 999);
    return due < Date.now();
  }).length;

  const KANBAN_LANES: Array<{ id: TaskStatus; label: string; dotColor: string }> = [
    { id: 'todo', label: 'To Do', dotColor: 'bg-slate-400' },
    { id: 'in_progress', label: 'In Progress', dotColor: 'bg-blue-400' },
    { id: 'review', label: 'Review & Verify', dotColor: 'bg-amber-400' },
    { id: 'completed', label: 'Completed', dotColor: 'bg-emerald-400' }
  ];

  const getPriorityBadgeClass = (p: Priority) => {
    switch (p) {
      case 'urgent':
        return 'text-rose-400 font-semibold';
      case 'high':
        return 'text-amber-400 font-medium';
      case 'medium':
        return 'text-sky-400';
      case 'low':
        return 'text-slate-400';
    }
  };

  const getDueDateLabel = (dueDateStr: string, isDone: boolean) => {
    if (isDone) return { text: 'Done', isOverdue: false, isNear: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dueDateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isNear: false };
    }
    if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false, isNear: true };
    }
    if (diffDays === 1) {
      return { text: 'Due tomorrow', isOverdue: false, isNear: true };
    }
    return { text: `Due in ${diffDays}d`, isOverdue: false, isNear: false };
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#111726]/70">
          <span className="text-xs text-slate-400 block mb-1">Total Active Tasks</span>
          <div className="text-2xl font-mono-tabular font-bold text-white">
            {totalTasks - completedTasks}
          </div>
          <span className="text-[11px] text-slate-500">{totalTasks} registered tasks</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111726]/70">
          <span className="text-xs text-slate-400 block mb-1">In Progress</span>
          <div className="text-2xl font-mono-tabular font-bold text-blue-400">
            {inProgressTasks}
          </div>
          <span className="text-[11px] text-slate-500">Actively being worked</span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111726]/70">
          <span className="text-xs text-slate-400 block mb-1">Completed</span>
          <div className="text-2xl font-mono-tabular font-bold text-emerald-400">
            {completedTasks}
          </div>
          <span className="text-[11px] text-slate-500">
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate
          </span>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-[#111726]/70">
          <span className="text-xs text-slate-400 block mb-1">Overdue Alerts</span>
          <div className={`text-2xl font-mono-tabular font-bold ${overdueTasks > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {overdueTasks}
          </div>
          <span className="text-[11px] text-slate-500">Requires prompt attention</span>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Modes, Add Task Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#111726]/80">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks, tags, or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={e => setSelectedSubjectFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} · {s.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriorityFilter}
            onChange={e => setSelectedPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* View Toggle (Kanban / List) */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Detailed List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Task Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-900/30 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {KANBAN_LANES.map(lane => {
            const laneTasks = filteredTasks.filter(t => t.status === lane.id);
            return (
              <div
                key={lane.id}
                className="rounded-xl border border-slate-800/80 bg-[#111726]/50 p-3.5 flex flex-col min-h-[450px]"
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${lane.dotColor}`} />
                    <h4 className="text-xs font-semibold text-slate-200">{lane.label}</h4>
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-medium tabular-nums">
                    {laneTasks.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="space-y-3 flex-1">
                  {laneTasks.map(task => {
                    const subject = subjects.find(s => s.id === task.subjectId);
                    const dueInfo = getDueDateLabel(task.dueDate, task.status === 'completed');
                    const isExpanded = !!expandedTaskIds[task.id];
                    const completedSubtasks = task.subtasks.filter(s => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        className="rounded-lg border border-slate-800/90 bg-[#131b2e] p-3.5 shadow-sm hover:border-slate-700 transition-all group"
                      >
                        {/* Meta line: subject code and priority */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: subject?.color || '#94a3b8' }}
                            />
                            <span className="font-medium text-slate-300 truncate">
                              {subject?.code || 'General'}
                            </span>
                          </div>
                          <span className={`capitalize ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h5 className={`text-xs font-semibold text-white mb-1.5 leading-snug ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h5>

                        {/* Description (truncated unless expanded) */}
                        {task.description && (
                          <p className={`text-[11px] text-slate-400 mb-2 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {task.description}
                          </p>
                        )}

                        {/* Subtasks Progress */}
                        {task.subtasks.length > 0 && (
                          <div className="my-2 p-2 rounded bg-slate-900/60 border border-slate-800/50">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <span>Checklist</span>
                              <span className="font-mono tabular-nums">
                                {completedSubtasks}/{task.subtasks.length}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${(completedSubtasks / task.subtasks.length) * 100}%`
                                }}
                              />
                            </div>

                            {/* Subtask items if expanded */}
                            {isExpanded && (
                              <div className="mt-2 space-y-1.5 border-t border-slate-800 pt-2">
                                {task.subtasks.map(st => (
                                  <label
                                    key={st.id}
                                    className="flex items-start gap-2 text-[11px] text-slate-300 cursor-pointer hover:text-white"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={st.completed}
                                      onChange={() => toggleSubtaskCompletion(task, st.id)}
                                      className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                                    />
                                    <span className={st.completed ? 'line-through text-slate-500' : ''}>
                                      {st.text}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Due Date & Time Spent Info (Zero-Pill: Clean unboxed metadata) */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                            <span
                              className={
                                dueInfo.isOverdue
                                  ? 'text-rose-400 font-medium'
                                  : dueInfo.isNear
                                  ? 'text-amber-400 font-medium'
                                  : 'text-slate-400'
                              }
                            >
                              {dueInfo.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 font-mono-tabular text-slate-500">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{task.spentMinutes}m / {task.estimatedMinutes}m</span>
                          </div>
                        </div>

                        {/* Action buttons row */}
                        <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-slate-800/40">
                          <div className="flex items-center gap-1">
                            {/* Start Timer with this task */}
                            {task.status !== 'completed' && (
                              <button
                                onClick={() => onStartFocusOnTask(task.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 text-[10px] font-medium transition-colors"
                                title="Focus on this task with Timer"
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>Focus</span>
                              </button>
                            )}

                            {/* Expand / Collapse Subtasks toggle */}
                            {task.subtasks.length > 0 && (
                              <button
                                onClick={() => toggleTaskExpanded(task.id)}
                                className="p-1 rounded text-slate-500 hover:text-slate-300"
                                title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Move status arrows */}
                            {task.status !== 'todo' && (
                              <button
                                onClick={() => {
                                  const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'completed'];
                                  const idx = statuses.indexOf(task.status);
                                  if (idx > 0) handleStatusChange(task, statuses[idx - 1]);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                title="Move back"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}

                            {task.status !== 'completed' ? (
                              <button
                                onClick={() => {
                                  const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'completed'];
                                  const idx = statuses.indexOf(task.status);
                                  if (idx < statuses.length - 1) handleStatusChange(task, statuses[idx + 1]);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-indigo-300 hover:bg-slate-800"
                                title="Move forward"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(task, 'todo')}
                                className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 text-[10px]"
                                title="Reopen task"
                              >
                                Reopen
                              </button>
                            )}

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                              title="Edit task"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {laneTasks.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs">
                      <span>No tasks in {lane.label}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed List / Table View */
        <div className="rounded-xl border border-slate-800 bg-[#111726]/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-3 px-4 w-8">Status</th>
                  <th className="py-3 px-4">Task Name & Details</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Est. / Spent</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.map(task => {
                  const subject = subjects.find(s => s.id === task.subjectId);
                  const dueInfo = getDueDateLabel(task.dueDate, task.status === 'completed');
                  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-900/50 transition-colors group"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              task,
                              task.status === 'completed' ? 'todo' : 'completed'
                            )
                          }
                          className="text-slate-500 hover:text-emerald-400"
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-semibold text-white ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                        {task.subtasks.length > 0 && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            {completedSubtasks} of {task.subtasks.length} subtasks completed
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: subject?.color || '#94a3b8' }}
                          />
                          <span>{subject?.name || 'General'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap capitalize">
                        <span className={getPriorityBadgeClass(task.priority)}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={
                            dueInfo.isOverdue
                              ? 'text-rose-400 font-semibold'
                              : dueInfo.isNear
                              ? 'text-amber-400 font-semibold'
                              : 'text-slate-300'
                          }
                        >
                          {task.dueDate} ({dueInfo.text})
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono-tabular">
                        {task.spentMinutes}m / {task.estimatedMinutes}m
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => onStartFocusOnTask(task.id)}
                              className="p-1 rounded text-indigo-400 hover:bg-indigo-900/30"
                              title="Start timer for this task"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-[#111726] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingTask ? 'Edit Task' : 'Create New Study Task'}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Complete Problem Set 3, Write Lit Review section..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description & Context
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Additional instructions, lecture references, or links..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subject *
                  </label>
                  <select
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} · {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Estimated Focus Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={estimatedMinutes}
                    onChange={e => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Subtasks checklist builder */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Subtasks & Milestones
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubtaskText}
                    onChange={e => setNewSubtaskText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    placeholder="Add step (e.g. Read chapter, Draft section 1)..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
                  >
                    Add
                  </button>
                </div>

                {subtasks.length > 0 && (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-900/50 rounded-lg border border-slate-800/80">
                    {subtasks.map((st, i) => (
                      <div key={st.id || i} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate">{st.text}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(st.id)}
                          className="text-slate-500 hover:text-rose-400 ml-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="e.g. Lab 2, Exam Prep, Solo..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
