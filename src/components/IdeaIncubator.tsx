import React, { useState } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Search, 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  Send, 
  BookOpen, 
  Tag, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Idea, IdeaCategory, IdeaStatus, Subject, Task } from '../types';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface IdeaIncubatorProps {
  ideas: Idea[];
  subjects: Subject[];
  onAddIdea: (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateIdea: (idea: Idea) => void;
  onDeleteIdea: (ideaId: string) => void;
  onConvertIdeaToTask: (idea: Idea) => void;
}

export const IdeaIncubator: React.FC<IdeaIncubatorProps> = ({
  ideas,
  subjects,
  onAddIdea,
  onUpdateIdea,
  onDeleteIdea,
  onConvertIdeaToTask
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('project');
  const [status, setStatus] = useState<IdeaStatus>('seedling');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [color, setColor] = useState('#3b82f6');
  const [tagInput, setTagInput] = useState('');
  const [actionItems, setActionItems] = useState<Array<{ id: string; text: string; done: boolean }>>([]);
  const [newItemText, setNewItemText] = useState('');
  const [linkedSubjectId, setLinkedSubjectId] = useState<string>('');

  const openCreateModal = () => {
    setEditingIdea(null);
    setTitle('');
    setDescription('');
    setCategory('project');
    setStatus('seedling');
    setPriority('medium');
    setColor('#3b82f6');
    setTagInput('');
    setActionItems([]);
    setNewItemText('');
    setLinkedSubjectId('');
    setIsModalOpen(true);
  };

  const openEditModal = (idea: Idea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setDescription(idea.description);
    setCategory(idea.category);
    setStatus(idea.status);
    setPriority(idea.priority);
    setColor(idea.color);
    setTagInput(idea.tags.join(', '));
    setActionItems([...idea.actionItems]);
    setNewItemText('');
    setLinkedSubjectId(idea.linkedSubjectId || '');
    setIsModalOpen(true);
  };

  const handleAddActionItem = () => {
    if (newItemText.trim()) {
      setActionItems([
        ...actionItems,
        {
          id: 'ai-' + Date.now(),
          text: newItemText.trim(),
          done: false
        }
      ]);
      setNewItemText('');
    }
  };

  const handleRemoveActionItem = (id: string) => {
    setActionItems(actionItems.filter(item => item.id !== id));
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingIdea) {
      onUpdateIdea({
        ...editingIdea,
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        priority,
        color,
        tags: parsedTags,
        actionItems,
        linkedSubjectId: linkedSubjectId || undefined,
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddIdea({
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        priority,
        color,
        tags: parsedTags,
        actionItems,
        linkedSubjectId: linkedSubjectId || undefined
      });
    }

    setIsModalOpen(false);
  };

  const toggleActionItem = (idea: Idea, itemId: string) => {
    const updated = idea.actionItems.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    onUpdateIdea({
      ...idea,
      actionItems: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const handleStatusLaneChange = (idea: Idea, newStatus: IdeaStatus) => {
    if (newStatus === 'ready' && idea.status !== 'ready') {
      soundManager.playComplete();
      try {
        confetti({ particleCount: 40, spread: 50 });
      } catch {
        // safe fallback
      }
    }
    onUpdateIdea({
      ...idea,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch =
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || idea.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' || idea.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const STATUS_LANES: Array<{ id: IdeaStatus; title: string; icon: string; description: string }> = [
    { id: 'seedling', title: 'Sparks & Seedlings', icon: '🌱', description: 'Raw sparks and early brainstorming' },
    { id: 'incubating', title: 'Incubating & Outlining', icon: '💡', description: 'Gathering notes and defining scope' },
    { id: 'ready', title: 'Ready to Build / Execute', icon: '🚀', description: 'Validated concepts ready for tasks' },
    { id: 'archived', title: 'Archived Vault', icon: '📁', description: 'Past explorations and completed concepts' }
  ];

  const COLOR_CHOICES = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Intro Header & Banner */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-[#111726]/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Idea Incubator & Brainstorming Vault</h3>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Nurture your project concepts, research questions, essay thesis angles, and creative sparks. Refine them through structured action items, then convert them directly into active tasks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-900/30 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Idea</span>
        </button>
      </div>

      {/* Control Bar: Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#111726]/80">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ideas by topic, keyword, or tag..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="project">Project / Coding</option>
            <option value="essay">Essay / Writing</option>
            <option value="research">Research Question</option>
            <option value="hackathon">Hackathon / Startup</option>
            <option value="creative">Creative Exploration</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Stages</option>
            <option value="seedling">Seedlings</option>
            <option value="incubating">Incubating</option>
            <option value="ready">Ready to Build</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Idea Stages Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STATUS_LANES.map(lane => {
          const laneIdeas = filteredIdeas.filter(i => i.status === lane.id);
          return (
            <div
              key={lane.id}
              className="rounded-xl border border-slate-800/80 bg-[#111726]/40 p-3.5 flex flex-col min-h-[450px]"
            >
              {/* Lane Header */}
              <div className="pb-3 border-b border-slate-800/60 mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{lane.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{lane.title}</h4>
                    <span className="text-[10px] text-slate-500 block">{lane.description}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-medium text-slate-400 tabular-nums">
                  {laneIdeas.length}
                </span>
              </div>

              {/* Ideas Cards in Lane */}
              <div className="space-y-3 flex-1">
                {laneIdeas.map(idea => {
                  const linkedSubject = subjects.find(s => s.id === idea.linkedSubjectId);
                  const completedActions = idea.actionItems.filter(a => a.done).length;

                  return (
                    <div
                      key={idea.id}
                      className="rounded-xl border border-slate-800/90 bg-[#131b2e] p-4 shadow-sm hover:border-slate-700 transition-all relative overflow-hidden"
                    >
                      {/* Top Accent bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: idea.color || '#3b82f6' }}
                      />

                      {/* Category & Priority Line (Zero-Pill: Clean unboxed metadata) */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 mt-0.5">
                        <span className="uppercase tracking-wide font-medium text-slate-400">
                          {idea.category}
                        </span>
                        <span className="capitalize text-slate-500">
                          {idea.priority} priority
                        </span>
                      </div>

                      {/* Title */}
                      <h5 className="text-sm font-semibold text-white mb-2 leading-snug">
                        {idea.title}
                      </h5>

                      {/* Description */}
                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                        {idea.description}
                      </p>

                      {/* Tags */}
                      {idea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3 text-[10px] text-slate-400">
                          {idea.tags.map((t, idx) => (
                            <span key={idx} className="text-slate-400">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action items checklist */}
                      {idea.actionItems.length > 0 && (
                        <div className="mb-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-medium">
                            <span>Key Explorations</span>
                            <span className="font-mono tabular-nums">
                              {completedActions}/{idea.actionItems.length}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {idea.actionItems.map(item => (
                              <label
                                key={item.id}
                                className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer hover:text-white"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.done}
                                  onChange={() => toggleActionItem(idea, item.id)}
                                  className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                                />
                                <span className={item.done ? 'line-through text-slate-500' : ''}>
                                  {item.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Linked Subject indicator */}
                      {linkedSubject && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                          <BookOpen className="w-3 h-3 text-slate-500" />
                          <span>Related to: <strong>{linkedSubject.code}</strong></span>
                        </div>
                      )}

                      {/* Action buttons footer */}
                      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        {/* Convert to Task CTA */}
                        <button
                          onClick={() => onConvertIdeaToTask(idea)}
                          className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-[11px] font-semibold py-1 transition-colors"
                          title="Generate actionable study task from this idea"
                        >
                          <Send className="w-3 h-3" />
                          <span>Push to Tasks</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Move lane selector */}
                          <select
                            value={idea.status}
                            onChange={e => handleStatusLaneChange(idea, e.target.value as IdeaStatus)}
                            className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
                          >
                            <option value="seedling">🌱 Seedling</option>
                            <option value="incubating">💡 Incubating</option>
                            <option value="ready">🚀 Ready</option>
                            <option value="archived">📁 Archived</option>
                          </select>

                          <button
                            onClick={() => openEditModal(idea)}
                            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded"
                            title="Edit Idea"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => onDeleteIdea(idea.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded"
                            title="Delete Idea"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {laneIdeas.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-lg text-slate-600 text-xs">
                    <span>No ideas in this stage</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Idea Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#111726] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingIdea ? 'Edit Idea' : 'Incubate New Idea or Project'}
            </h3>

            <form onSubmit={handleSaveIdea} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Idea Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Hash Ring Simulator, Free-Rider Game Theory Proof..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Core Concept & Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Elaborate on the hypothesis, design motivation, and what makes it interesting..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as IdeaCategory)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="project">Project / Coding</option>
                    <option value="essay">Essay / Writing</option>
                    <option value="research">Research Question</option>
                    <option value="hackathon">Hackathon / Startup</option>
                    <option value="creative">Creative Exploration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Development Stage
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as IdeaStatus)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="seedling">🌱 Seedling (Early Spark)</option>
                    <option value="incubating">💡 Incubating (Outlining)</option>
                    <option value="ready">🚀 Ready to Build / Execute</option>
                    <option value="archived">📁 Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Linked Subject (Optional)
                  </label>
                  <select
                    value={linkedSubjectId}
                    onChange={e => setLinkedSubjectId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">None / Independent</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code} · {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Color Accent
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {COLOR_CHOICES.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action items builder */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Exploration Steps & Action Items
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddActionItem();
                      }
                    }}
                    placeholder="e.g. Find 2 related survey papers, prototype wireframe..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddActionItem}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg"
                  >
                    Add
                  </button>
                </div>

                {actionItems.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                    {actionItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate">{item.text}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveActionItem(item.id)}
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
                  placeholder="e.g. Algorithms, Simulation, Paper..."
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
                  {editingIdea ? 'Save Changes' : 'Incubate Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
