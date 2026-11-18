import { Subject, Task, StudySession, Idea, ExamMilestone, FlashcardDeck, UserPreferences } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-cs',
    name: 'Distributed Systems & Algorithms',
    code: 'CS-301',
    color: '#3b82f6',
    targetWeeklyHours: 10,
    syllabusTopics: [
      { id: 'cs-t1', title: 'Paxos & Raft Consensus Protocols', completed: true },
      { id: 'cs-t2', title: 'Byzantine Fault Tolerance (BFT)', completed: true },
      { id: 'cs-t3', title: 'Consistent Hashing & DynamoDB Ring', completed: false },
      { id: 'cs-t4', title: 'Vector Clocks & Eventual Consistency', completed: false },
      { id: 'cs-t5', title: 'MapReduce & Spark Distributed Execution', completed: false }
    ]
  },
  {
    id: 'subj-neuro',
    name: 'Cognitive Neuroscience & Memory',
    code: 'NEUR-204',
    color: '#10b981',
    targetWeeklyHours: 8,
    syllabusTopics: [
      { id: 'n-t1', title: 'Hippocampal Long-Term Potentiation (LTP)', completed: true },
      { id: 'n-t2', title: 'Prefrontal Cortex Working Memory Gating', completed: true },
      { id: 'n-t3', title: 'Dopaminergic Reward Prediction Error', completed: false },
      { id: 'n-t4', title: 'Sleep Oscillations & Memory Consolidation', completed: false }
    ]
  },
  {
    id: 'subj-econ',
    name: 'Microeconomic Policy & Game Theory',
    code: 'ECON-105',
    color: '#f59e0b',
    targetWeeklyHours: 6,
    syllabusTopics: [
      { id: 'e-t1', title: 'Nash Equilibrium & Mixed Strategies', completed: true },
      { id: 'e-t2', title: 'Subgame Perfect Equilibrium & Backward Induction', completed: false },
      { id: 'e-t3', title: 'Vickrey-Clarke-Groves (VCG) Mechanism Design', completed: false },
      { id: 'e-t4', title: 'Externalities, Pigouvian Taxes & Public Goods', completed: false }
    ]
  },
  {
    id: 'subj-phil',
    name: 'Philosophy of Mind & Ethics',
    code: 'PHIL-120',
    color: '#8b5cf6',
    targetWeeklyHours: 4,
    syllabusTopics: [
      { id: 'p-t1', title: 'The Hard Problem of Consciousness & Qualia', completed: true },
      { id: 'p-t2', title: 'Functionalism and the Chinese Room Argument', completed: false },
      { id: 'p-t3', title: 'Moral Realism vs. Constructivism', completed: false }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Implement Raft leader election simulation',
    description: 'Build a Go or TypeScript state machine testing heartbeat timeouts, term increments, and split-vote resolution.',
    subjectId: 'subj-cs',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), // in 2 days
    estimatedMinutes: 180,
    spentMinutes: 90,
    subtasks: [
      { id: 'st-1', text: 'Set up node state enum (Follower, Candidate, Leader)', completed: true },
      { id: 'st-2', text: 'Implement randomized election ticker (150ms-300ms)', completed: true },
      { id: 'st-3', text: 'Handle RequestVote RPC and majority counting', completed: false },
      { id: 'st-4', text: 'Simulate network partition recovery', completed: false }
    ],
    tags: ['Lab 3', 'Coding', 'Simulation'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'task-2',
    title: 'Review Nature paper: Synaptic plasticity in dentate gyrus',
    description: 'Summarize methodology and prepare 3 discussion questions for Friday seminar.',
    subjectId: 'subj-neuro',
    priority: 'high',
    status: 'todo',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    estimatedMinutes: 75,
    spentMinutes: 0,
    subtasks: [
      { id: 'st-5', text: 'Read abstract & results section', completed: false },
      { id: 'st-6', text: 'Annotate optogenetic stimulation figures', completed: false },
      { id: 'st-7', text: 'Write down 3 seminar critique points', completed: false }
    ],
    tags: ['Paper Reading', 'Seminar'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'task-3',
    title: 'Problem Set 4: Cournot vs. Bertrand duopoly proof',
    description: 'Complete mathematical derivations for n-firm Bertrand paradox with asymmetric marginal costs.',
    subjectId: 'subj-econ',
    priority: 'medium',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    estimatedMinutes: 120,
    spentMinutes: 50,
    subtasks: [
      { id: 'st-8', text: 'Question 1: Standard Cournot symmetric reaction curves', completed: true },
      { id: 'st-9', text: 'Question 2: Asymmetric costs threshold derivation', completed: false },
      { id: 'st-10', text: 'Question 3: Welfare comparison and deadweight loss', completed: false }
    ],
    tags: ['Problem Set', 'Math'],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'task-4',
    title: 'Outline final essay on Chalmers philosophical zombies',
    description: 'Analyze modal argument against physicalism and write 2-page thesis proposal with citations.',
    subjectId: 'subj-phil',
    priority: 'medium',
    status: 'review',
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().slice(0, 10),
    estimatedMinutes: 90,
    spentMinutes: 80,
    subtasks: [
      { id: 'st-11', text: 'Thesis definition and structural outline', completed: true },
      { id: 'st-12', text: 'Counter-arguments from illusionism (Dennett)', completed: true },
      { id: 'st-13', text: 'Proofread and check bibliography style', completed: false }
    ],
    tags: ['Essay', 'Writing'],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'task-5',
    title: 'Chapter 4 Spaced Repetition flashcards drill',
    description: 'Review 45 memory cards on hippocampal pathways before the weekend check-in.',
    subjectId: 'subj-neuro',
    priority: 'low',
    status: 'completed',
    dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    estimatedMinutes: 40,
    spentMinutes: 40,
    subtasks: [
      { id: 'st-14', text: 'Schaffer collaterals to CA1 projection review', completed: true },
      { id: 'st-15', text: 'Perforant path terminology recall', completed: true }
    ],
    tags: ['Flashcards', 'Active Recall'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'subj-cs',
    durationMinutes: 50,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    technique: 'pomodoro',
    notes: 'Debugged election timeout edge cases in node partition logic. Made great headway.',
    rating: 5,
    mood: 'focused'
  },
  {
    id: 'sess-2',
    subjectId: 'subj-cs',
    durationMinutes: 40,
    date: new Date(Date.now() - 86400000 * 2 + 3600000 * 2).toISOString(),
    technique: 'pomodoro',
    notes: 'Finished reading chapter on vector clocks and causally ordered delivery.',
    rating: 4,
    mood: 'energetic'
  },
  {
    id: 'sess-3',
    subjectId: 'subj-neuro',
    durationMinutes: 60,
    date: new Date(Date.now() - 86400000).toISOString(),
    technique: 'deep_work',
    notes: 'Diagrammed LTP signaling cascade (NMDA receptors, Ca2+ influx, CaMKII phosphorylation).',
    rating: 5,
    mood: 'focused'
  },
  {
    id: 'sess-4',
    subjectId: 'subj-econ',
    durationMinutes: 45,
    date: new Date(Date.now() - 86400000 + 3600000 * 3).toISOString(),
    technique: 'pomodoro',
    notes: 'Worked on Question 1 derivations. Cournot best-response functions match textbook solutions.',
    rating: 4,
    mood: 'neutral'
  },
  {
    id: 'sess-5',
    subjectId: 'subj-phil',
    durationMinutes: 50,
    date: new Date().toISOString(),
    technique: 'deep_work',
    notes: 'Drafted 2 sections comparing epistemic possibility with metaphysical necessity.',
    rating: 4,
    mood: 'focused'
  }
];

export const INITIAL_IDEAS: Idea[] = [
  {
    id: 'idea-1',
    title: 'Visual Interactive Raft Visualizer for Browser',
    description: 'An interactive canvas showing 5 distributed nodes sending log replication RPCs with packet delay sliders to teach freshmen consensus in an intuitive way.',
    category: 'project',
    status: 'incubating',
    tags: ['Interactive Tool', 'Open Source', 'Web Audio / Canvas'],
    priority: 'high',
    color: '#3b82f6',
    actionItems: [
      { id: 'ai-1', text: 'Sketch node UI states on paper', done: true },
      { id: 'ai-2', text: 'Build simple tick loop with dropped packet probability', done: false },
      { id: 'ai-3', text: 'Publish interactive demo on GitHub Pages', done: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    linkedSubjectId: 'subj-cs'
  },
  {
    id: 'idea-2',
    title: 'Spaced Repetition audio podcast generator based on lecture notes',
    description: 'Turn study markdown notes into 5-minute audio recall recaps so I can study while jogging or commuting.',
    category: 'hackathon',
    status: 'seedling',
    tags: ['Audio', 'Productivity', 'Commute'],
    priority: 'medium',
    color: '#10b981',
    actionItems: [
      { id: 'ai-4', text: 'Test note condensation structure', done: false },
      { id: 'ai-5', text: 'Prototype active recall quiz pauses', done: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'idea-3',
    title: 'Game-Theoretic Model of Student Study Group Collaboration',
    description: 'Analyze free-rider dynamics in collaborative problem sets as a repeated Prisoner Dilemma with reputational tit-for-tat mechanisms.',
    category: 'research',
    status: 'ready',
    tags: ['Paper Topic', 'Economics', 'Behavioral'],
    priority: 'high',
    color: '#f59e0b',
    actionItems: [
      { id: 'ai-6', text: 'Draft payoff matrix for 3-person homework group', done: true },
      { id: 'ai-7', text: 'Survey 20 classmates on group coordination strategies', done: true },
      { id: 'ai-8', text: 'Submit proposal to Undergraduate Research Symposium', done: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    linkedSubjectId: 'subj-econ'
  },
  {
    id: 'idea-4',
    title: 'Feynman Technique Audio Journaling Experiment',
    description: 'Record a 2-minute voice explanation of every new concept immediately after studying it without checking notes. Score how simply it was explained.',
    category: 'creative',
    status: 'incubating',
    tags: ['Active Recall', 'Metacognition'],
    priority: 'medium',
    color: '#8b5cf6',
    actionItems: [
      { id: 'ai-9', text: 'Create dedicated audio folder', done: true },
      { id: 'ai-10', text: 'Try with 3 hardest CS301 concepts', done: false }
    ],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString()
  }
];

export const INITIAL_EXAMS: ExamMilestone[] = [
  {
    id: 'exam-1',
    title: 'Midterm Exam: Distributed Algorithms & Consistency',
    subjectId: 'subj-cs',
    date: new Date(Date.now() + 86400000 * 9).toISOString().slice(0, 10),
    type: 'midterm',
    weightPercentage: 25,
    targetGrade: 'A',
    notes: 'Covers Paxos, Raft, Byzantine Generals, and Distributed Snapshots (Chandy-Lamport).',
    completed: false
  },
  {
    id: 'exam-2',
    title: 'Neurobiology Quiz: Synaptic Transmission & LTP',
    subjectId: 'subj-neuro',
    date: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    type: 'quiz',
    weightPercentage: 10,
    targetGrade: 'A+',
    notes: 'Focus heavily on glutamate receptor subunits AMPA vs NMDA and retrograde messengers (NO).',
    completed: false
  },
  {
    id: 'exam-3',
    title: 'Term Paper: Mechanism Design for Carbon Credits',
    subjectId: 'subj-econ',
    date: new Date(Date.now() + 86400000 * 18).toISOString().slice(0, 10),
    type: 'paper_submission',
    weightPercentage: 30,
    targetGrade: 'A',
    notes: 'Needs 12 peer-reviewed sources and empirical verification of auction pricing.',
    completed: false
  },
  {
    id: 'exam-4',
    title: 'Final Seminar Presentation: Consciousness & AI Functionalism',
    subjectId: 'subj-phil',
    date: new Date(Date.now() + 86400000 * 25).toISOString().slice(0, 10),
    type: 'project_deadline',
    weightPercentage: 20,
    targetGrade: 'A',
    notes: '15-minute presentation with 10 minutes of Q&A from faculty panel.',
    completed: false
  }
];

export const INITIAL_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-1',
    subjectId: 'subj-cs',
    title: 'Consensus & Distributed Invariants',
    description: 'Key theorems, consensus bounds, and failure models.',
    cards: [
      {
        id: 'c-1',
        front: 'What is the FLP Impossibility Result (Fischer, Lynch, Paterson 1985)?',
        back: 'In an asynchronous network, no deterministic consensus protocol can guarantee both safety and liveness in the presence of even a single unannounced crash failure.',
        difficulty: 'medium',
        repetitions: 3
      },
      {
        id: 'c-2',
        front: 'What quorum size is required for Raft to tolerate f crash failures?',
        back: 'At least 2f + 1 total nodes, requiring a majority quorum of f + 1 nodes to elect a leader or commit an entry.',
        difficulty: 'easy',
        repetitions: 5
      },
      {
        id: 'c-3',
        front: 'What is the difference between Linearizability and Sequential Consistency?',
        back: 'Linearizability requires operations to appear instantaneous at a point in real (wall-clock) time. Sequential consistency only requires operations to appear in some total order that respects the program order of each process.',
        difficulty: 'hard',
        repetitions: 2
      }
    ]
  },
  {
    id: 'deck-2',
    subjectId: 'subj-neuro',
    title: 'LTP & Synaptic Memory Mechanisms',
    description: 'Molecular cascades for memory formation.',
    cards: [
      {
        id: 'c-4',
        front: 'Why does the NMDA receptor act as a molecular coincidence detector?',
        back: 'It requires simultaneous presynaptic glutamate release AND postsynaptic depolarization to expel the Mg2+ (magnesium) ion block.',
        difficulty: 'easy',
        repetitions: 4
      },
      {
        id: 'c-5',
        front: 'What enzyme acts as a molecular memory trigger during Ca2+ influx?',
        back: 'CaMKII (Calmodulin-dependent protein kinase II) autophosphorylates and drives insertion of AMPA receptors into the postsynaptic membrane.',
        difficulty: 'medium',
        repetitions: 3
      }
    ]
  }
];

export const INITIAL_PREFERENCES: UserPreferences = {
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  soundEnabled: true,
  ambientSound: 'none',
  ambientVolume: 0.35,
  weeklyHoursGoal: 28,
  dailyStreak: 4,
  lastActiveDate: new Date().toISOString().slice(0, 10)
};

const STORAGE_KEYS = {
  SUBJECTS: 'keystone_subjects_v1',
  TASKS: 'keystone_tasks_v1',
  SESSIONS: 'keystone_sessions_v1',
  IDEAS: 'keystone_ideas_v1',
  EXAMS: 'keystone_exams_v1',
  DECKS: 'keystone_decks_v1',
  PREFS: 'keystone_preferences_v1'
};

export const loadData = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Local storage quota handled safely
  }
};

export { STORAGE_KEYS };
