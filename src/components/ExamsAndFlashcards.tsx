import React, { useState } from 'react';
import { 
  GraduationCap, 
  Layers, 
  Plus, 
  Calendar, 
  CheckCircle, 
  RotateCw, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Check, 
  Trash2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ExamMilestone, FlashcardDeck, Flashcard, Subject } from '../types';
import { soundManager } from '../utils/sound';
import confetti from 'canvas-confetti';

interface ExamsAndFlashcardsProps {
  exams: ExamMilestone[];
  decks: FlashcardDeck[];
  subjects: Subject[];
  onAddExam: (exam: Omit<ExamMilestone, 'id'>) => void;
  onUpdateExam: (exam: ExamMilestone) => void;
  onDeleteExam: (examId: string) => void;
  onToggleTopicCompleted: (subjectId: string, topicId: string) => void;
  onAddDeck: (deck: Omit<FlashcardDeck, 'id'>) => void;
  onUpdateDeck: (deck: FlashcardDeck) => void;
  onDeleteDeck: (deckId: string) => void;
}

export const ExamsAndFlashcards: React.FC<ExamsAndFlashcardsProps> = ({
  exams,
  decks,
  subjects,
  onAddExam,
  onUpdateExam,
  onDeleteExam,
  onToggleTopicCompleted,
  onAddDeck,
  onUpdateDeck,
  onDeleteDeck
}) => {
  const [activeTab, setActiveTab] = useState<'exams' | 'flashcards'>('exams');

  // Exam modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState(new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10));
  const [examType, setExamType] = useState<ExamMilestone['type']>('midterm');
  const [examWeight, setExamWeight] = useState(20);
  const [examTargetGrade, setExamTargetGrade] = useState('A');
  const [examNotes, setExamNotes] = useState('');

  // Flashcards state
  const [activeDeckId, setActiveDeckId] = useState<string>(decks[0]?.id || '');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isNewDeckModalOpen, setIsNewDeckModalOpen] = useState(false);

  // New card inputs
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');

  // New deck inputs
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckSubjectId, setNewDeckSubjectId] = useState(subjects[0]?.id || '');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  // Countdown helper
  const getCountdown = (dateString: string) => {
    const target = new Date(dateString).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return { days: 0, hours: 0, isPast: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, isPast: false };
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    onAddExam({
      title: examTitle.trim(),
      subjectId: examSubjectId,
      date: examDate,
      type: examType,
      weightPercentage: Number(examWeight) || 15,
      targetGrade: examTargetGrade,
      notes: examNotes.trim(),
      completed: false
    });

    setIsExamModalOpen(false);
    setExamTitle('');
    setExamNotes('');
  };

  const currentDeck = decks.find(d => d.id === activeDeckId) || decks[0];

  const handleStartReview = () => {
    setReviewIndex(0);
    setIsFlipped(false);
    setIsReviewMode(true);
  };

  const handleRateCard = (rating: 'hard' | 'medium' | 'easy') => {
    if (!currentDeck || !currentDeck.cards[reviewIndex]) return;

    const currentCard = currentDeck.cards[reviewIndex];
    const updatedCards = [...currentDeck.cards];

    updatedCards[reviewIndex] = {
      ...currentCard,
      difficulty: rating,
      lastReviewed: new Date().toISOString(),
      repetitions: rating === 'easy' ? currentCard.repetitions + 1 : currentCard.repetitions
    };

    onUpdateDeck({
      ...currentDeck,
      cards: updatedCards
    });

    if (reviewIndex < currentDeck.cards.length - 1) {
      setReviewIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Completed deck!
      soundManager.playComplete();
      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {
        // safe fallback
      }
      setIsReviewMode(false);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim() || !currentDeck) return;

    const newCard: Flashcard = {
      id: 'c-' + Date.now(),
      front: cardFront.trim(),
      back: cardBack.trim(),
      difficulty: 'medium',
      repetitions: 0
    };

    onUpdateDeck({
      ...currentDeck,
      cards: [...currentDeck.cards, newCard]
    });

    setCardFront('');
    setCardBack('');
    setIsCardModalOpen(false);
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;

    onAddDeck({
      title: newDeckTitle.trim(),
      subjectId: newDeckSubjectId,
      description: newDeckDescription.trim(),
      cards: []
    });

    setIsNewDeckModalOpen(false);
    setNewDeckTitle('');
    setNewDeckDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveTab('exams');
              setIsReviewMode(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'exams'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Exams & Milestones</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'flashcards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Active Recall Decks</span>
          </button>
        </div>

        {activeTab === 'exams' ? (
          <button
            onClick={() => setIsExamModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-900/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Exam / Milestone</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewDeckModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700"
            >
              + New Deck
            </button>
            {currentDeck && !isReviewMode && (
              <button
                onClick={() => setIsCardModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* EXAMS & DEADLINES VIEW */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {/* Exam countdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map(exam => {
              const subject = subjects.find(s => s.id === exam.subjectId);
              const countdown = getCountdown(exam.date);

              return (
                <div
                  key={exam.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    exam.completed
                      ? 'border-slate-800/60 bg-slate-900/30 opacity-75'
                      : 'border-slate-800 bg-[#111726]/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: subject?.color || '#94a3b8' }}
                      />
                      <span className="text-xs font-semibold text-slate-300">
                        {subject?.code} · {subject?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateExam({ ...exam, completed: !exam.completed })
                        }
                        className={`text-xs px-2 py-0.5 rounded transition-colors ${
                          exam.completed
                            ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {exam.completed ? '✓ Completed' : 'Mark Done'}
                      </button>
                      <button
                        onClick={() => onDeleteExam(exam.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className={`text-base font-bold text-white mb-2 ${exam.completed ? 'line-through text-slate-400' : ''}`}>
                    {exam.title}
                  </h4>

                  {exam.notes && (
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {exam.notes}
                    </p>
                  )}

                  {/* Countdown Ticker Box (Zero-Pill: clean numerical alignment) */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">
                        Target Date
                      </span>
                      <span className="text-xs font-mono-tabular font-medium text-slate-200">
                        {exam.date}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">
                        Countdown
                      </span>
                      {countdown.isPast ? (
                        <span className="text-xs font-medium text-slate-400">Date has arrived</span>
                      ) : (
                        <span className="text-sm font-mono-tabular font-bold text-amber-400">
                          {countdown.days}d {countdown.hours}h left
                        </span>
                      )}
                    </div>

                    <div className="text-right border-l border-slate-800 pl-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">
                        Weight / Target
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {exam.weightPercentage}% · Grade {exam.targetGrade}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Course Syllabus Topic Mastery Trackers */}
          <div className="rounded-2xl border border-slate-800 bg-[#111726]/70 p-5">
            <h4 className="text-sm font-bold text-white mb-1">
              Course Syllabus Topic Mastery
            </h4>
            <p className="text-xs text-slate-400 mb-5">
              Check off concepts as you master them to guarantee complete coverage before exam day.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {subjects.map(subj => {
                const totalTopics = subj.syllabusTopics.length;
                const completedCount = subj.syllabusTopics.filter(t => t.completed).length;
                const percent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

                return (
                  <div key={subj.id} className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subj.color }} />
                        <span className="text-xs font-bold text-white">{subj.code} · {subj.name}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-indigo-400 tabular-nums">
                        {percent}% ({completedCount}/{totalTopics})
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3.5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ backgroundColor: subj.color, width: `${percent}%` }}
                      />
                    </div>

                    <div className="space-y-2">
                      {subj.syllabusTopics.map(topic => (
                        <label
                          key={topic.id}
                          className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer hover:text-white group"
                        >
                          <input
                            type="checkbox"
                            checked={topic.completed}
                            onChange={() => onToggleTopicCompleted(subj.id, topic.id)}
                            className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                          />
                          <span className={topic.completed ? 'line-through text-slate-500' : ''}>
                            {topic.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE RECALL FLASHCARDS VIEW */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6">
          {/* Deck selector bar */}
          <div className="flex flex-wrap items-center gap-2">
            {decks.map(deck => {
              const subject = subjects.find(s => s.id === deck.subjectId);
              const isActive = deck.id === activeDeckId;

              return (
                <button
                  key={deck.id}
                  onClick={() => {
                    setActiveDeckId(deck.id);
                    setIsReviewMode(false);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                    isActive
                      ? 'border-indigo-500/80 bg-indigo-950/40 text-white font-semibold'
                      : 'border-slate-800 bg-[#111726] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: subject?.color || '#3b82f6' }}
                  />
                  <span>{deck.title}</span>
                  <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                    ({deck.cards.length})
                  </span>
                </button>
              );
            })}
          </div>

          {currentDeck && !isReviewMode ? (
            /* Deck Overview & Cards Preview */
            <div className="rounded-2xl border border-slate-800 bg-[#111726]/80 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{currentDeck.title}</h3>
                  <p className="text-xs text-slate-400">{currentDeck.description || 'Active recall study deck.'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onDeleteDeck(currentDeck.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg"
                    title="Delete Deck"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    disabled={currentDeck.cards.length === 0}
                    onClick={handleStartReview}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-900/30 transition-all"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Start Active Recall Drill ({currentDeck.cards.length} cards)</span>
                  </button>
                </div>
              </div>

              {/* Cards Grid Preview */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Cards in Deck ({currentDeck.cards.length})
                </h4>

                {currentDeck.cards.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {currentDeck.cards.map((card, idx) => (
                      <div
                        key={card.id}
                        className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span>Card #{idx + 1}</span>
                          <span className="capitalize">{card.difficulty} · {card.repetitions} reps</span>
                        </div>
                        <p className="text-xs font-semibold text-white">{card.front}</p>
                        <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 line-clamp-2">
                          {card.back}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    No flashcards in this deck yet. Click "+ Add Card" to create your first question and answer!
                  </div>
                )}
              </div>
            </div>
          ) : currentDeck && isReviewMode ? (
            /* Interactive Flip Card Drill Mode */
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Card {reviewIndex + 1} of {currentDeck.cards.length}</span>
                <button
                  onClick={() => setIsReviewMode(false)}
                  className="text-slate-400 hover:text-white underline"
                >
                  Exit Drill
                </button>
              </div>

              {/* Flip Card Box */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[280px] rounded-2xl border border-slate-700 bg-[#131b2e] p-8 flex flex-col justify-between shadow-2xl hover:border-indigo-500/50 transition-all text-center relative"
              >
                <div className="text-[11px] uppercase tracking-widest text-indigo-400 font-semibold">
                  {isFlipped ? 'Answer & Explanation' : 'Prompt / Question'}
                </div>

                <div className="my-auto">
                  {isFlipped ? (
                    <div className="text-base sm:text-lg font-medium text-white leading-relaxed animate-in fade-in duration-200">
                      {currentDeck.cards[reviewIndex]?.back}
                    </div>
                  ) : (
                    <div className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {currentDeck.cards[reviewIndex]?.front}
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {isFlipped ? 'How well did you know this?' : 'Click anywhere or press Space to reveal answer'}
                </div>
              </div>

              {/* Rating Controls when flipped */}
              {isFlipped && (
                <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-150">
                  <button
                    onClick={() => handleRateCard('hard')}
                    className="py-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-colors"
                  >
                    Need Review 🔄
                  </button>
                  <button
                    onClick={() => handleRateCard('medium')}
                    className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Good 👍
                  </button>
                  <button
                    onClick={() => handleRateCard('easy')}
                    className="py-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    Mastered ⚡
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Add Exam Modal */}
      {isExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111726] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Exam or Project Milestone</h3>

            <form onSubmit={handleSaveExam} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={examTitle}
                  onChange={e => setExamTitle(e.target.value)}
                  placeholder="e.g. Midterm 2, Final Term Paper..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                  <select
                    value={examSubjectId}
                    onChange={e => setExamSubjectId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={examType}
                    onChange={e => setExamType(e.target.value as ExamMilestone['type'])}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="midterm">Midterm Exam</option>
                    <option value="final_exam">Final Exam</option>
                    <option value="quiz">Quiz</option>
                    <option value="project_deadline">Project Deadline</option>
                    <option value="paper_submission">Paper Submission</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Weight (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={examWeight}
                    onChange={e => setExamWeight(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Grade</label>
                  <input
                    type="text"
                    value={examTargetGrade}
                    onChange={e => setExamTargetGrade(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Key Topics & Notes</label>
                <textarea
                  rows={2}
                  value={examNotes}
                  onChange={e => setExamNotes(e.target.value)}
                  placeholder="Chapters covered, formulas sheet allowed, etc..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExamModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111726] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Add Flashcard</h3>

            <form onSubmit={handleAddCard} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Front (Question or Concept) *</label>
                <textarea
                  rows={2}
                  required
                  value={cardFront}
                  onChange={e => setCardFront(e.target.value)}
                  placeholder="e.g. What is the difference between synchronous and asynchronous consensus?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Back (Answer & Explanation) *</label>
                <textarea
                  rows={3}
                  required
                  value={cardBack}
                  onChange={e => setCardBack(e.target.value)}
                  placeholder="Provide the concise, accurate concept breakdown..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Add to Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Deck Modal */}
      {isNewDeckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111726] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-3">Create Active Recall Deck</h3>

            <form onSubmit={handleCreateDeck} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Deck Title *</label>
                <input
                  type="text"
                  required
                  value={newDeckTitle}
                  onChange={e => setNewDeckTitle(e.target.value)}
                  placeholder="e.g. Chapter 6: Neurotransmitters"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
                <select
                  value={newDeckSubjectId}
                  onChange={e => setNewDeckSubjectId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} · {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDeckDescription}
                  onChange={e => setNewDeckDescription(e.target.value)}
                  placeholder="What topics does this deck cover?"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewDeckModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
