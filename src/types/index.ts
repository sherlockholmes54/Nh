export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  estimatedMinutes: number;
  spentMinutes: number;
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  completedAt?: string;
  linkedIdeaId?: string;
}

export type FocusModeType = 'pomodoro' | 'short_break' | 'long_break' | 'deep_work' | 'stopwatch';

export type SessionMood = 'focused' | 'energetic' | 'neutral' | 'tired' | 'distracted';

export interface StudySession {
  id: string;
  subjectId: string;
  durationMinutes: number;
  date: string; // ISO string
  technique: FocusModeType;
  notes: string;
  rating: number; // 1 - 5
  mood: SessionMood;
  taskId?: string;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Hex color
  targetWeeklyHours: number;
  syllabusTopics: SyllabusTopic[];
}

export type IdeaCategory = 'project' | 'essay' | 'research' | 'hackathon' | 'general' | 'creative';
export type IdeaStatus = 'seedling' | 'incubating' | 'ready' | 'archived';

export interface IdeaActionItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  category: IdeaCategory;
  status: IdeaStatus;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  actionItems: IdeaActionItem[];
  color: string;
  createdAt: string;
  updatedAt: string;
  linkedSubjectId?: string;
}

export type ExamType = 'final_exam' | 'midterm' | 'quiz' | 'project_deadline' | 'paper_submission';

export interface ExamMilestone {
  id: string;
  title: string;
  subjectId: string;
  date: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  type: ExamType;
  weightPercentage: number;
  targetGrade: string;
  notes: string;
  completed: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  lastReviewed?: string;
  repetitions: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface FlashcardDeck {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  cards: Flashcard[];
}

export interface UserPreferences {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  soundEnabled: boolean;
  ambientSound: 'none' | 'brown' | 'white' | 'binaural';
  ambientVolume: number; // 0 to 1
  weeklyHoursGoal: number;
  dailyStreak: number;
  lastActiveDate: string;
}
