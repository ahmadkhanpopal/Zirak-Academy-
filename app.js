// ===== CONSTANTS =====
const APP_CACHE = 'zirak-v1-17I6H-D19-dialogue-level-progression-long-form-pronunciation-pashto';

// ===================================================================
// ZIRAK v1.13B — SPEAKING / MIC / FEEDBACK CONSTANTS
// ===================================================================
// Centralised timing constants so all mic/speaking areas share the same
// learner-friendly patience. Adjust here; all flows benefit automatically.
const SPEECH_SILENCE_GRACE_MS  = 3000;  // ms of real silence before finalising
const RESULT_REVEAL_DELAY_MS   = 2600;  // ms after speech ends before showing result
const FEEDBACK_SPEAK_DELAY_MS  = 500;   // ms after result appears before speaking feedback
// ===================================================================

// ===================================================================
// ZIRAK v1.13B — TEACHER-LIKE LOCAL FEEDBACK (OFFLINE)
// ===================================================================
// Returns a warm, teacher-style English feedback string based on score
// and optionally on missed word count. Works 100% offline — no AI needed.
function zirakTeacherFeedback(score, spokenNorm, expectedNorm) {
  var expectedWords = (expectedNorm || '').split(/\s+/).filter(Boolean);
  var spokenWords   = (spokenNorm  || '').split(/\s+/).filter(Boolean);
  var missedWords   = expectedWords.filter(function(w) { return !spokenWords.includes(w); });
  var missedCount   = missedWords.length;
  var firstMissed   = missedWords[0] || '';

  if (score >= 90) {
    var ex = [
      'Excellent! You said the full sentence perfectly.',
      'Perfect! Your pronunciation was very clear.',
      'Outstanding! Well done. Keep practising like this.',
      'Excellent work. Every word was clear and correct.',
      'Perfect score! You are doing really well.'
    ];
    return ex[Math.floor(Math.random() * ex.length)];
  }
  if (score >= 70) {
    var good = [
      'Good job! You said most of the sentence correctly.',
      'Well done! Your answer was almost perfect.',
      'Good effort! You are very close to a perfect score.',
      'Nice work! Keep practising and you will reach 100.'
    ];
    var base = good[Math.floor(Math.random() * good.length)];
    if (missedCount === 1 && firstMissed) {
      return base + ' Try to say the word "' + firstMissed + '" more clearly next time.';
    }
    if (missedCount > 1) {
      return base + ' You missed ' + missedCount + ' words. Try again slowly.';
    }
    return base;
  }
  if (score >= 40) {
    var partial = [
      'Good try! You said part of the sentence.',
      'Keep going! You are making progress.',
      'Almost there! Listen to the sentence again and try once more.'
    ];
    var pb = partial[Math.floor(Math.random() * partial.length)];
    if (firstMissed) {
      return pb + ' Focus on saying the word "' + firstMissed + '".';
    }
    return pb + ' Speak slowly and say every word.';
  }
  // score < 40
  var low = [
    'Good effort. Listen to the sentence carefully and try again.',
    'Keep trying. Speak slowly, word by word.',
    'Do not worry. Listen once more and repeat after the speaker.',
    'Good attempt. Take your time and say each word clearly.'
  ];
  return low[Math.floor(Math.random() * low.length)];
}

// ===================================================================
// ZIRAK v1.13B — SAFE MEANING EXTRACTOR
// Reads Pashto support meaning from any content item.
// Legacy property names are accepted only as compatibility slots after
// pashto-only-migration.js has overwritten them with Pashto/blank values.
// Returns { dari: null, pashto: string|null }
// ===================================================================
function zirakExtractMeaning(item) {
  if (!item) return { dari: null, pashto: null };
  // Pashto only — never fall back to old Pashto values.
  var pashto = item.meaningPashto
    || item.pashto
    || item.answerPashto
    || item.promptPashto
    || item.examplePashto
    || item.ex_pashto
    || null;
  return { dari: null, pashto: pashto || null };
}

// ===================================================================
// ZIRAK v1.13B — SAFE SMOOTH SCROLL TO RESULT
// Scrolls the given element into view with mobile nav spacing.
// Waits for a small delay so the DOM is rendered before scrolling.
// ===================================================================
function zirakScrollToResult(elementId, delayMs) {
  var delay = (typeof delayMs === 'number') ? delayMs : 200;
  setTimeout(function() {
    var el = document.getElementById(elementId);
    if (!el) return;
    // Use scrollIntoView with 'nearest' to avoid jumping past nav
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch(e) {
      try { el.scrollIntoView(false); } catch(e2) {}
    }
  }, delay);
}

// ===================================================================
// ZIRAK v1.13B — SAFE SPEAK FEEDBACK
// Speaks a feedback message after a short delay.
// Uses existing speak() / speechSynthesis — does not create new TTS.
// Fails silently if speechSynthesis is unavailable.
// ===================================================================
function zirakSpeakFeedback(text, delayMs) {
  if (!text || !window.speechSynthesis) return;
  var delay = (typeof delayMs === 'number') ? delayMs : FEEDBACK_SPEAK_DELAY_MS;
  setTimeout(function() {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = (typeof state !== 'undefined' && state.speechRate) ? state.speechRate : 0.9;
      window.speechSynthesis.speak(utter);
    } catch(e) { /* fail silently */ }
  }, delay);
}

// ===================================================================
// ZIRAK v1.13B — CHECKING STATE DISPLAY
// Shows a "checking your answer" interim state while waiting for
// RESULT_REVEAL_DELAY_MS before the actual result is rendered.
// ===================================================================
var _checkingMessages = [
  'Checking your answer…',
  'Great, let me listen carefully…',
  'Analysing your sentence…',
  'Just a moment…',
  'Reviewing what you said…'
];
function zirakGetCheckingMessage() {
  return _checkingMessages[Math.floor(Math.random() * _checkingMessages.length)];
}
// ===================================================================
// Shared proof code — set by sendWhatsAppReport(), read by markFatherSeen()
// so the WhatsApp message and the local approval record always use the same code.
let _lastReportCode = null;

// ===== v1.11D1: CENTRALIZED FEEDBACK BANK =====
const FEEDBACK_BANK = {
  // Per-item spoken feedback (short — after each answer)
  item: {
    excellent: [
      'Excellent. Very clear pronunciation.',
      'Perfect. Well done.',
      'Outstanding. Keep going.',
      'Excellent work. Your pronunciation is clear.',
      'Great job. You said it perfectly.',
      'Perfect score. Your fluency is improving.'
    ],
    pass: [
      'Good. Keep practicing.',
      'Nice effort. Continue.',
      'Good work. Move to the next one.',
      'Well done. Keep it up.',
      'Good progress. Continue learning.',
      'Not bad. Try to be even clearer next time.'
    ],
    weak: [
      'Try again. Listen carefully.',
      'Good try. Focus on the sounds.',
      'Almost. Try one more time.',
      'Not quite. Listen to the model and try again.',
      'Keep trying. You are improving.',
      'Careful. You missed one important word. Listen again and repeat slowly.',
      'Good effort. The mistake is small, but say the full sentence clearly.'
    ],
    wrong: [
      'Not correct. Try again.',
      'Incorrect. Listen and try once more.',
      'Not right. Focus and try again.',
      'Careful. Focus on the highlighted word and try again.',
      'Good try. The answer needs correction. Listen to the model clearly.'
    ],
    retry_success: [
      'Excellent. You improved on the second try.',
      'Good. You got it right this time.',
      'Well done. Practice makes perfect.',
      'Great improvement. Keep this up.'
    ],
    retry_weak: [
      'Still needs work. Continue practicing.',
      'Keep trying. Review this word again.',
      'Good effort. Practice this one more time.',
      'Do not give up. Every repetition helps.'
    ]
  },
  // Word-specific feedback
  word: {
    excellent: [
      'Excellent pronunciation.',
      'Very clear. Well done.',
      'Perfect. Your pronunciation is improving.'
    ],
    pass: [
      'Good. Keep practicing this word.',
      'Nice try. Your pronunciation is getting better.',
      'Good work. Continue.'
    ],
    weak: [
      'Listen to the model word and try again.',
      'Focus on the sounds. Try once more.',
      'Good try. Listen carefully and repeat.'
    ]
  },
  // Sentence-specific feedback
  sentence: {
    excellent: [
      'Excellent sentence. Very fluent.',
      'Perfect sentence. Well done.',
      'Great fluency. Keep going.'
    ],
    pass: [
      'Good sentence. Keep practicing.',
      'Nice effort on the sentence. Continue.',
      'Good progress on the full sentence.'
    ],
    weak: [
      'Listen to the full sentence and try again.',
      'Speak the complete sentence slowly and clearly.',
      'Good effort. Practice the whole sentence once more.'
    ]
  },
  // Quiz feedback
  quiz: {
    correct: [
      'Correct. Very good.',
      'Right answer. Well done.',
      'Correct. Keep going.'
    ],
    wrong: [
      'Not correct. One mistake. Move to the next question.',
      'Incorrect answer. Continue to the next one.',
      'Not right. Try the retry quiz for this word.'
    ],
    result_pass: [
      'You completed the quiz. Good score. Well done.',
      'Quiz complete. You passed. Excellent work.',
      'Good result on the quiz. Keep practicing.'
    ],
    result_fail: [
      'You completed the quiz. Some words need more practice. Please retry the weak items.',
      'Quiz complete. Review the weak items and try again.',
      'Practice the missed words and retry the weak item quiz.'
    ]
  },
  // Phonics and Minimal Pairs
  phonics: {
    correct: [
      'Correct. Good listening.',
      'Right. You heard the difference.',
      'Correct. Excellent ear training.'
    ],
    wrong: [
      'Not correct. Listen again carefully.',
      'Incorrect. Focus on the sounds.',
      'Try again. The two sounds are very close.'
    ]
  },
  // Final session results (longer — only at end)
  final: {
    pass: [
      'You completed the practice. Your score is {score} percent. You passed. Excellent work. Keep practicing every day.',
      'Well done. You finished the session with a score of {score} percent. You passed. Review the weak words to improve further.',
      'Good job. Your score is {score} percent. You passed. Practice the weak items again to strengthen your skills.',
      'Strong effort. Your score is {score} percent. You passed. Your pronunciation is getting clearer every session.',
      'Session complete. {score} percent. Well done. Keep this habit and your English will improve quickly.'
    ],
    fail: [
      'You completed the practice. Your score is {score} percent. Some items need more practice. Please review the weak items and try again.',
      'Good effort. Your score is {score} percent. Please practice the weak words before continuing.',
      'You finished the session. Your score is {score} percent. Focus on the missed items and practice again.',
      'Not bad. {score} percent. Careful — you missed some important words. Listen again and repeat slowly.',
      'Good try. {score} percent. The mistakes are small but you must say each word clearly. Review and try again.'
    ],
    parent_guidance: 'You can share this result with your father so he can see your progress and help you practice the weak items.'
  },
  // Level-adjusted phrases (used in buildFeedbackMsg)
  beginner_encouragement: [
    'You are learning well. Keep going.',
    'Good job. Practice a little every day.',
    'Well done. You are making progress.'
  ],
  intermediate_encouragement: [
    'Good progress. Your accuracy is improving.',
    'Strong effort. Review the weak items once more.',
    'Good work. Keep building your fluency.'
  ],
  advanced_encouragement: [
    'Good work. Your accuracy is improving, but fluency still needs practice.',
    'Solid performance. Review weak items to strengthen consistency.',
    'You completed the task with acceptable accuracy. Review the weak items.'
  ]
};

// Pick a random item from an array
function _fbPick(arr) {
  if (!arr || !arr.length) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

// Build a spoken feedback message using the FEEDBACK_BANK
// type: 'word'|'sentence'|'quiz'|'phonics'|'item'
// result: 'excellent'|'pass'|'weak'|'wrong'|'correct'|'retry_success'|'retry_weak'
// score: numeric 0-100
function buildFeedbackMsg(type, result, score) {
  const level = (typeof state !== 'undefined' && state.level) || 'beginner';
  const bank = FEEDBACK_BANK[type] || FEEDBACK_BANK.item;
  const key  = result || (score >= 90 ? 'excellent' : score >= 70 ? 'pass' : score >= 40 ? 'weak' : 'wrong');
  const phrases = bank[key] || FEEDBACK_BANK.item[key] || FEEDBACK_BANK.item.pass;
  return _fbPick(phrases);
}

// Build final-result spoken text with score substitution
// PHASE: Teaching Display & Voice Professionalization Fix — Part 7
// Added optional 3rd param `studentName` — when provided, the spoken
// summary opens with the student's name. Existing 2-arg callers are
// completely unaffected (name defaults to '' -> no prefix added).
function buildFinalFeedbackMsg(score, includeParentGuidance, studentName) {
  const pool = score >= 70 ? FEEDBACK_BANK.final.pass : FEEDBACK_BANK.final.fail;
  const msg  = _fbPick(pool).replace('{score}', score);
  const named = studentName ? (studentName + ', ' + msg.charAt(0).toLowerCase() + msg.slice(1)) : msg;
  if (includeParentGuidance) {
    return named + ' ' + FEEDBACK_BANK.final.parent_guidance;
  }
  return named;
}

// PHASE: Teaching Display & Voice Professionalization Fix — Part 7
// Speaks each weak/missed word ONCE, as a single short follow-up
// utterance after the main summary — never loops, never repeats.
// Called from the practice-final summary builders below.
function _zirakSpeakWeakItemsOnce(missedWords, delayMs) {
  try {
    const words = (missedWords || []).filter(Boolean).slice(0, 8); // cap so the follow-up stays short
    if (!words.length) return;
    setTimeout(function () {
      const u = new SpeechSynthesisUtterance('Let us review: ' + words.join(', ') + '.');
      u.lang = 'en-US';
      u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85;
      window.speechSynthesis.speak(u);
    }, delayMs || 0);
  } catch (e) { /* never let this break the summary flow */ }
}

// ===== v1.11D: PHONICS DATA =====
const PHONICS_PAIRS = [
  { sound: 'V vs W', pairs: [['very','wary'],['vine','wine'],['vest','west'],['vet','wet']] },
  { sound: 'P vs B', pairs: [['pen','ben'],['pat','bat'],['pit','bit'],['park','bark']] },
  { sound: 'Short I vs Long EE', pairs: [['fish','fleece'],['sit','seat'],['ship','sheep'],['bit','beat']] },
  { sound: 'TH vs D', pairs: [['this','dis'],['then','den'],['there','dare'],['though','dough']] },
  { sound: 'TH vs T', pairs: [['think','tink'],['three','tree'],['thank','tank'],['thin','tin']] },
  { sound: 'Short A vs Short E', pairs: [['man','men'],['bad','bed'],['hat','het'],['ran','ren']] }
];

const MINIMAL_PAIRS = [
  ['ship','sheep'], ['man','men'],  ['live','leave'],
  ['bit','beat'],   ['bad','bed'],  ['cat','cut'],
  ['full','fool'],  ['pull','pool'], ['not','note'],
  ['sit','seat'],   ['hat','hate'], ['hop','hope']
];
const LS = 'roshan_';
const QUOTES = [
  "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself. — Rumi",
  "Silence is an ocean. Speech is a river. — Rumi",
  "Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there. — Rumi",
  "هوښیار انسان د نورو له تجربو زده کړه کوي. — افغاني حکمت",
  "بې احتیاطه ژبه انسان ته تاوان رسوي. — متل"
];

// ===== GRAMMAR MINI-CARDS v1.11G =====
const GRAMMAR_CARDS = [
  {
    id: 'g01',
    pattern: 'I am / You are / He is / She is',
    dari_note: 'فعل to be په حال زمان کې — د هر شخص لپاره توپیر لري',
    example_en: 'I am a student. She is my teacher.',
    example_dari: 'زه یو محصل یم. هغه زما ښوونکی دی.'
  },
  {
    id: 'g02',
    pattern: 'verb + ing = happening right now',
    dari_note: 'اوسنی جاري زمان — هغه کار چې همدا اوس روان وي',
    example_en: 'She is eating. They are playing outside.',
    example_dari: 'هغه خواړه خوري. هغوی بهر لوبې کوي.'
  },
  {
    id: 'g03',
    pattern: 'I went / not I goed — irregular past',
    dari_note: 'بې قاعدې تېره زمانه — باید یادې شي',
    example_en: 'I went to school. She came home late.',
    example_dari: 'زه ښوونځي ته ولاړم. هغه ناوخته کور ته راغی.'
  },
  {
    id: 'g04',
    pattern: 'a / an — talking about one thing',
    dari_note: 'نامعلوم شی — a د غږیز توري مخکې an کېږي',
    example_en: 'I have a book. She found an apple.',
    example_dari: 'زه یو کتاب لرم. هغې یوه مڼه پیدا کړه.'
  },
  {
    id: 'g05',
    pattern: 'the — talking about a specific thing',
    dari_note: 'یو معلوم شی چې مخکې پېژندل شوی وي',
    example_en: 'Please close the door. The book is on the table.',
    example_dari: 'مهرباني وکړه دروازه وتړه. کتاب پر میز دی.'
  },
  {
    id: 'g06',
    pattern: 'Do you...? Does he...? Did they...?',
    dari_note: 'پوښتنه جوړول — د do / does / did سره پیلېږي',
    example_en: 'Do you like fish? Does she speak English?',
    example_dari: 'ایا ته ماهي خوښوې؟ ایا هغه انګلیسي خبرې کوي؟'
  },
  {
    id: 'g07',
    pattern: "I don't / He doesn't / They didn't",
    dari_note: 'منفي کول — د do not یا does not سره جوړېږي',
    example_en: "I don't know. She doesn't like cold weather.",
    example_dari: 'زه نه پوهېږم. هغه سړه هوا نه خوښوي.'
  },
  {
    id: 'g08',
    pattern: 'will + verb = future action',
    dari_note: 'راتلونکی زمان — هغه کار چې وروسته کېږي',
    example_en: 'I will come tomorrow. She will help you.',
    example_dari: 'زه سبا راځم. هغه به له تا سره مرسته وکړي.'
  },
  {
    id: 'g09',
    pattern: 'There is / There are',
    dari_note: 'شتون — د یوه شي لپاره is، د څو شیانو لپاره are',
    example_en: 'There is a cat in the garden. There are three books.',
    example_dari: 'په باغ کې یوه پیشو ده. درې کتابونه شته.'
  },
  {
    id: 'g10',
    pattern: "can = ability / can't = not able",
    dari_note: 'توانېدل — can د وړتیا لپاره کارېږي',
    example_en: "I can swim. She can't fly. Can you help me?",
    example_dari: 'زه لامبو وهلی شم. هغه الوتلی نه شي.'
  }
];

// ===== STATE =====
let state = {
  mode: load('active_mode') === 'dari' ? 'parallel' : (load('active_mode') || 'parallel'),
  level: load('selected_level') || 'beginner',
  category: load('selected_category') || 'daily-life',
  speechRate: parseFloat(load('speech_rate')) || 0.85,
  autoContinue: load('auto_continue') === 'true',
  showPashto: load('show_pashto_support') !== 'false',
  showTranslit: load('show_transliteration') === 'true',
  theme: load('theme') || 'system',
  dariFontSize: load('pashto_font_size') || load('dari_font_size') || 'medium',
  history: JSON.parse(load('practice_history') || '[]'),
  bookmarks: JSON.parse(load('word_bookmarks') || '[]'),
  wordSRS: JSON.parse(load('word_srs') || '{}'),
  streak: JSON.parse(load('streak') || '{"current":0,"longest":0,"lastDate":null}'),
  milestones: JSON.parse(load('milestones') || '[]'),
  lpLevel: load('lp_start_level') || 'beginner',
  lpProgress: JSON.parse(load('lp_progress') || '{}'),
  // School Path v1.7
  schoolCurrentClass: resolveLegacySchoolClassId(load('school_class')) || null,
  schoolCurrentUnit: load('school_unit') || null,
  schoolCompletedSteps: JSON.parse(load('school_steps') || '[]'),
  schoolUnitScores: JSON.parse(load('school_scores') || '{}'),
  schoolUnitPassStatus: JSON.parse(load('school_unit_pass') || '{}'),
  schoolCompletedClasses: JSON.parse(load('roshan_school_completed_classes') || '[]'),
  quizHistory: JSON.parse(load('quiz_history') || '[]'),
  placementResult: JSON.parse(load('placement_result') || 'null'),
  placementMode: 'quick',
  placementTotal: 10,
  schoolModeStarted: load('school_started') === '1',
  schoolActiveTab: 'path',
  dailyGoal: parseInt(load('daily_goal_minutes')) || 10,
  activeScreen: 'home',
  activeUnitQuiz: null,
  currentDialogue: null,
  currentStep: 0,
  currentTopic: null,
  currentWizardMode: null,
  currentStory: null,
  storyMode: 'read',
  currentFlashSet: null,
  flashIndex: 0,
  currentQuizSet: null,
  quizIndex: 0,
  quizScore: 0,
  quizStreak: 0,
  listenSentIdx: 0,
  dictationIdx: 0,
  shadowSpeed: 1.0,
  placementQ: 0,
  placementAnswers: [],
  listenSentenceIdx: 0,
  // I6H-D16 (Task 10): explicit Listening session/mode/item identity —
  // fixes the real defect where Shadow Repeat scored against
  // state.listenSentenceIdx (a different mode's global index) instead
  // of the item the student actually clicked.
  listeningSessionId: 0,
  listenActiveMode: '',
  listenActiveItemIdx: null,
  recognition: null,
  isListening: false,
  transcript: '',
  lastScore: 0,
  // I6H-D19: one governed Dialogue route/session state. Progress itself is
  // persisted by ZirakCurriculumContent under student-scoped keys.
  d19RouteMode: 'official',
  d19ThemeId: 'all',
  d19FreePage: 0,
  d19ListLimit: 20,
  d19ActiveRaw: null,
  d19ActiveProgress: null,
  d19ModelRevealed: false,
  d19ScoreMeta: null,
  d19RuntimeToken: 0,
  d19AttemptSequence: 0,
  d19ActiveAttemptId: null
};
// PHASE I6A5B — Part 6: this was the real root cause of "TTS is too
// fast" / "voice speed not respected everywhere". Roughly 19 TTS call
// sites across app.js, grammar-world.js, and interview-voice-wizard.js
// all read the rate via the guard `(window.state && window.state.
// speechRate) ? window.state.speechRate : <hardcoded fallback>` — but
// window.state was NEVER assigned anywhere, so that guard was ALWAYS
// false, meaning every one of those call sites ALWAYS used its
// hardcoded fallback (0.85, 0.9, or — worst case, in Interview Wizard —
// 1.0) and completely ignored whatever speed the student actually
// saved. `state` is never wholesale-reassigned anywhere else in this
// file (only individual properties are mutated), so this reference
// stays valid and in sync for the lifetime of the app — this single
// line repairs every one of those call sites at once, with no risk to
// the call sites that were already reading the bare `state` variable
// correctly (unaffected either way).
window.state = state;
let currentQuizSet = null;

// ===== STORAGE HELPERS =====
function load(key) { try { return localStorage.getItem(LS + (window.__zirakNS?window.__zirakNS():'') + key); } catch(e) { return null; } }
// I6H-D15A (Task 4): legacy class id -> real (renamed) class id resolver.
// A student whose stored School Path class is still the legacy value
// 'nursery' resolves to the real, current class id 'starter' the
// instant it enters live state — every existing SCHOOL_PATH.find(c =>
// c.id === state.schoolCurrentClass) comparison then works unchanged.
function resolveLegacySchoolClassId(rawId) { return (rawId === 'nursery') ? 'starter' : rawId; }
function save(key, val) { try { localStorage.setItem(LS + (window.__zirakNS?window.__zirakNS():'') + key, typeof val === 'object' ? JSON.stringify(val) : String(val)); } catch(e) {} }
function saveSetting(key, val) { save(key, val); if(key==='theme') setTheme(val); }

// ===== v1.11B: WORD MASTERY HELPERS =====
function loadMastery(wordId) {
  try {
    const raw = load('wm_' + wordId);
    return raw ? JSON.parse(raw) : { level: 0, streak: 0 };
  } catch(e) { return { level: 0, streak: 0 }; }
}
function saveMastery(wordId, data) {
  save('wm_' + wordId, JSON.stringify(data));
}
function updateWordMastery(wordId, isCorrect, mode) {
  // mode: 'wizard' (score-based) or 'quiz' (correct/wrong)
  const m = loadMastery(wordId);
  if (mode === 'wizard') {
    if (isCorrect) { // isCorrect means score >= 70
      m.streak++;
      if (m.streak >= 2) m.level = Math.min(5, m.level + 1);
    } else {
      m.streak = 0;
      m.level = Math.max(0, m.level - 1);
    }
  } else { // quiz mode
    if (isCorrect) {
      m.streak++;
      if (m.streak >= 3) m.level = Math.min(5, m.level + 1);
    } else {
      m.streak = 0;
    }
  }
  saveMastery(wordId, m);
  return m;
}
function buildMasteryDots(wordId) {
  const m = loadMastery(wordId);
  let html = '<div class="ww-mastery-dots">';
  for (let i = 0; i < 5; i++) {
    html += `<span class="ww-mastery-dot${i < m.level ? ' filled' : ''}"></span>`;
  }
  html += '</div>';
  return html;
}
function getMasteredCountForSet(setKey) {
  const ws = WORD_SETS[setKey];
  if (!ws || !ws.words) return { mastered: 0, total: 0 };
  const total = ws.words.length;
  const mastered = ws.words.filter(w => loadMastery(w.id).level >= 3).length;
  return { mastered, total };
}

// ===== v1.11C: SMART REVIEW =====
function getSmartReviewWords() {
  // Gather all words across all sets with level > 0, sorted by review priority
  const allWords = Object.values(WORD_SETS).flatMap(ws => ws.words);
  const seen = [];
  allWords.forEach(w => {
    const m = loadMastery(w.id);
    if (m.level > 0) {
      seen.push({ word: w, level: m.level, priority: (5 - m.level) * 10 });
    }
  });
  seen.sort((a, b) => b.priority - a.priority);
  return seen;
}

function renderSmartReviewButton() {
  const container = document.getElementById('smart-review-container');
  if (!container) return;
  const seen = getSmartReviewWords();
  if (seen.length < 5) {
    container.innerHTML = `<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:4px 0 8px;">Practice more words to unlock Smart Review.</div>`;
    return;
  }
  const topWords = seen.slice(0, 8);
  const count = topWords.length;
  container.innerHTML = `
    <button class="btn btn-gold btn-full" onclick="startSmartReview()" style="margin-bottom:10px;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;">
      🧠 Smart Review — <span style="font-weight:900;">${count} word${count !== 1 ? 's' : ''} need${count === 1 ? 's' : ''} practice</span>
    </button>`;
}

function startSmartReview() {
  const seen = getSmartReviewWords();
  if (seen.length < 5) return;
  const topWords = seen.slice(0, 8).map(item => item.word);
  // Use all words across all sets as the wrong-options pool
  const allWords = Object.values(WORD_SETS).flatMap(ws => ws.words);

  // Build questions
  const questions = [];
  topWords.forEach((word, i) => {
    const wrongs = allWords.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...wrongs, word].sort(() => Math.random() - 0.5);
    const types = [1, 2, 3];
    if (word.ex_en) types.push(4);
    const t = types[i % types.length];
    questions.push({ word, type: t, opts });
  });

  wqState.setKey    = '__smart__';
  wqState.questions = questions;
  wqState.index     = 0;
  wqState.correct   = 0;
  wqState.wrong     = 0;
  wqState.weakItems = [];
  wqState.isRetry   = false;
  wqState.prevWeakCount = 0;

  document.getElementById('quiz-set-selector').style.display = 'none';
  document.getElementById('quiz-area').style.display = 'block';
  wqRenderQuestion();
}

function wqRetrySmartReview() {
  const weak = wqState.weakItems.slice();
  if (!weak.length) return;
  const allWords = Object.values(WORD_SETS).flatMap(ws => ws.words);
  wqState.prevWeakCount = weak.length;
  wqState.isRetry = true;
  document.getElementById('quiz-area').innerHTML = '';
  document.getElementById('quiz-area').style.display = 'block';
  document.getElementById('quiz-set-selector').style.display = 'none';

  const questions = [];
  weak.forEach((wi, i) => {
    const word = allWords.find(w => w.en === wi.word);
    if (!word) return;
    const wrongs = allWords.filter(w => w.id !== word.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [...wrongs, word].sort(() => Math.random() - 0.5);
    const types = [1, 2, 3];
    if (word.ex_en) types.push(4);
    const t = types[i % types.length];
    questions.push({ word, type: t, opts });
  });

  wqState.questions = questions;
  wqState.index     = 0;
  wqState.correct   = 0;
  wqState.wrong     = 0;
  wqState.weakItems = [];
  wqRenderQuestion();
}

// ===== NAVIGATION =====
function navigate(screen) {
  // PHASE I6A5 — Part A: scope the floating profile chip to Home only.
  // Placed BEFORE the interview-wizard early return so that path is
  // covered too — every screen this function is ever asked to show
  // (including the early-return case) passes through this one line.
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.setChipVisible === 'function') {
    window.ZirakProfile.setChipVisible(screen === 'home');
  }
  // v1.16I: Interview Wizard is handled by its own open function
  if (screen === 'interview-wizard') { if (typeof window.openInterviewWizard === 'function') window.openInterviewWizard(); return; }
  // PHASE I6B2 — Part 5: a page change must cancel any guide/reading speech,
  // so a guide never speaks over the next page (or over a practice mic).
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('screen-' + screen);
  if (el) { el.classList.add('active'); el.scrollTop = 0; }
  const btn = document.querySelector(`.nav-item[data-screen="${screen}"]`);
  if (btn) btn.classList.add('active');
  state.activeScreen = screen;
  // lazy init screens
  if (screen === 'wordlab') initWordLab();
  if (screen === 'review') renderReview();
  if (screen === 'path') { renderSchoolPath(); }
  if (screen === 'listening') initListening();
  if (screen === 'stories') { renderStories(); }
  if (screen === 'topics') { renderTopics(); }
  if (screen === 'dialogue') renderDialogue();
  if (screen === 'progress') initProgress();
  if (screen === 'grammar') renderGrammarCards();
  // PHASE I6B2 — Part 2/4/5: ONE guide framework. Mount the compact guide
  // card (idempotent) at the top of the page and auto-read it ONCE if Auto
  // Read is ON. Grammar World mounts its own guide from grammar-world.js
  // (dynamic innerHTML), so it is excluded from SCREEN_MAP.
  try { if (window.ZirakPageGuides) window.ZirakPageGuides.mountForScreen(screen); } catch (e) {}
}

// PHASE I6A5 — Part G: page-intro spoken explanations, gated by the SAME
// global Auto Read setting already used by Grammar World / Quick
// Practice (window.ZirakAutoReadOn — default ON, so behavior is
// unchanged unless the student turns Auto Read OFF). Called only from
// navigate()'s one-time dispatch above — never from internal re-renders
// — so each page speaks its intro once per actual visit, never loops,
// and respects the same "Stop Reading" system as everything else since
// it goes through the shared speak() function.
// PHASE I6A5 — Part G / superseded by I6B2: page-intro spoken explanations.
// The guidance TEXT now lives in ONE place — window.ZirakPageGuides (see
// zirak-page-guides.js). navigate() no longer calls this directly; the guide
// framework's mountForScreen() handles both the visible guide card and the
// one-time auto-read (gated by the same window.ZirakAutoReadOn setting and the
// same shared speak()/Stop Reading system). This wrapper is kept only so any
// old/external caller keeps working, and it delegates to the single system so
// there is never a second guide voice.
function zirakSpeakPageIntro(key) {
  try {
    if (window.ZirakPageGuides && window.ZirakPageGuides.get(key)) {
      window.ZirakPageGuides.autoSpeak(key);
      return;
    }
  } catch (e) {}
}

// PHASE I6A5 — Part G: manual "read this hint aloud" used by the green
// recommended-bar banners on Stories/Topics (replaces showToast() for
// these two, which produced a floating box that overlapped the list
// below it — see real-device screenshots). A manual tap always speaks
// regardless of the Auto Read setting (same as every other manual
// Read/Hear button in the app) since it's a direct response to the
// student's own action, not an automatic page-open event.
function zirakSpeakBannerHint(text) {
  try { speak(text, 'en'); } catch (e) {}
}

// ===== HOME =====
function initHome() {
  const hour = new Date().getHours();
  const greetings = [
    ['Good night!','شپه مو پخیر!'],
    ['Good morning!','سهار مو پخیر!'],
    ['Good afternoon!','غرمه مو پخیر!'],
    ['Good evening!','ماښام مو پخیر!']
  ];
  const idx = hour < 5 ? 0 : hour < 12 ? 1 : hour < 17 ? 2 : hour < 21 ? 3 : 0;
  document.getElementById('hero-greeting').textContent = greetings[idx][0] + ' Let\'s learn today! ✨';
  document.getElementById('hero-greeting-dari').textContent = greetings[idx][1] + ' نن یې زده کړو.';
  const q = QUOTES[Math.floor(Date.now()/86400000) % QUOTES.length];
  document.getElementById('hero-quote').textContent = '"' + q + '"';
  updateStreakDisplay();
  updateModeSelector();
  renderProgressRings();
  updateThemeToggleBtn();
  // v1.11H: Weekly report banner check
  try {
    const thisWeek = getISOWeek();
    const lastSent = load('weekly_sent_week') || '';
    const lastDismissed = load('weekly_dismissed') || '';
    if (thisWeek !== lastSent && thisWeek !== lastDismissed) {
      showWeeklyReportBanner();
    }
  } catch(e) {}
}

function updateStreakDisplay() {
  const s = state.streak;
  document.getElementById('streak-badge').textContent = '🔥 ' + s.current + ' day streak';
  // v1.11B: Hero streak line
  const count = parseInt(load('streak_count') || '0');
  const el = document.getElementById('hero-streak-line');
  if (el) {
    if (count >= 30) {
      el.textContent = '🔥 ' + count + '-day streak — outstanding!';
    } else if (count >= 7) {
      el.textContent = '🔥 ' + count + '-day streak — excellent habit!';
    } else if (count >= 1) {
      el.textContent = '🔥 ' + count + '-day streak';
    } else {
      el.textContent = 'Practice today to start your streak!';
      el.style.color = 'rgba(255,255,255,0.7)';
      return;
    }
    el.style.color = '#f59e0b';
  }
}

function renderProgressRings() {
  const enStreak = state.streak.current;
  const topicsDone = state.history.filter(h => h.type === 'topic').length;
  const maxStreak = 30;
  const circumference = 214;
  const enOffset = circumference - (Math.min(enStreak, maxStreak) / maxStreak) * circumference;
  const dariOffset = circumference - (Math.min(enStreak, maxStreak) / maxStreak) * circumference;
  const topicsOffset = circumference - (Math.min(topicsDone, 20) / 20) * circumference;
  document.getElementById('ring-en').style.strokeDashoffset = enOffset;
  document.getElementById('ring-dari').style.strokeDashoffset = dariOffset;
  document.getElementById('ring-topics').style.strokeDashoffset = topicsOffset;
  document.getElementById('ring-en-val').textContent = enStreak;
  document.getElementById('ring-dari-val').textContent = enStreak;
  document.getElementById('ring-topics-val').textContent = topicsDone;
}

function setMode(mode) {
  if (mode === 'dari') mode = 'parallel';
  if (!['english','parallel'].includes(mode)) mode = 'parallel';
  state.mode = mode;
  save('active_mode', mode);
  updateModeSelector();
  updatePashtoRecognitionNotice();
  if (state.currentDialogue) resetMicBtn();
}

function updateModeSelector() {
  document.querySelectorAll('.mode-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === state.mode);
  });
}

// ===== DIALOGUE WIZARD · I6H-D19 =====
// One governed Dialogue route controller. It uses ZirakCurriculumContent for
// resolution/progress and the existing Universal Practice Engine for speech.
function _d19CC() { return window.ZirakCurriculumContent || null; }
function _d19Registration() {
  const cc = _d19CC();
  return cc && typeof cc.getD19DialogueRegistration === 'function' ? cc.getD19DialogueRegistration() : null;
}
function _d19StudentContext() {
  return typeof _d18StudentContext === 'function' ? _d18StudentContext() : { ok:false, reason:'student-context-unavailable' };
}
function _d19AcceptedLevels() {
  const levels = window.ZirakAcademicProgram && Array.isArray(window.ZirakAcademicProgram.ACCEPTED_LEVELS)
    ? window.ZirakAcademicProgram.ACCEPTED_LEVELS
    : [
      {id:'starter',label:'Starter',order:1},{id:'basic',label:'Basic',order:2},
      {id:'beginner',label:'Beginner',order:3},{id:'elementary',label:'Elementary',order:4},
      {id:'intermediate',label:'Intermediate',order:5},{id:'advanced',label:'Advanced',order:6},
      {id:'academic',label:'Academic',order:7}
    ];
  return levels.map(function(level, index) {
    return {
      id: String(level.id || '').toLowerCase(),
      en: level.en || level.label || level.name || level.title || (String(level.id || '').charAt(0).toUpperCase() + String(level.id || '').slice(1)),
      order: Number(level.order || index + 1)
    };
  }).filter(function(level) { return ['starter','basic','beginner','elementary','intermediate','advanced','academic'].includes(level.id); })
    .sort(function(a,b) { return a.order - b.order; });
}
function _d19LevelLabel(levelId) {
  const level = _d19AcceptedLevels().find(function(row) { return row.id === levelId; });
  return level ? level.en : String(levelId || '');
}
function _d19PathwayLabel(pathwayId) {
  const labels = {
    child:'Child', teen:'Teen', 'general-adult':'General Adult',
    'job-professional':'Job / Professional', 'academic-preparation':'Academic Preparation'
  };
  return labels[pathwayId] || String(pathwayId || '');
}
function _d19SetStatus(message, tone) {
  const el = document.getElementById('d19-dialogue-status');
  if (!el) return;
  el.textContent = message || '';
  el.className = 'd19-route-status' + (tone ? ' ' + tone : '');
}
function _d19ClearElement(el) { while (el && el.firstChild) el.removeChild(el.firstChild); }
function _d19MakeBadge(text, className) {
  const badge = document.createElement('span');
  badge.className = 'badge ' + (className || 'badge-lapis');
  badge.textContent = text;
  return badge;
}
function _d19RouteButtonState() {
  ['official','candidate-preview','free-practice'].forEach(function(mode) {
    const id = mode === 'official' ? 'd19-official-route-btn' : (mode === 'candidate-preview' ? 'd19-candidate-route-btn' : 'd19-free-route-btn');
    const btn = document.getElementById(id);
    if (btn) btn.classList.toggle('active', state.d19RouteMode === mode);
  });
}
function _d19RenderLevelPills() {
  const host = document.getElementById('level-pills');
  if (!host) return;
  _d19ClearElement(host);
  const ctx = _d19StudentContext();
  const selected = ctx.ok ? ctx.level : '';
  _d19AcceptedLevels().forEach(function(level) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pill' + (level.id === selected ? ' active' : '');
    button.dataset.levelId = level.id;
    button.textContent = level.en;
    button.setAttribute('aria-pressed', level.id === selected ? 'true' : 'false');
    button.addEventListener('click', function() { selectLevel(level.id); });
    host.appendChild(button);
  });
  const note = document.getElementById('d19-level-lock-note');
  if (note) {
    note.textContent = ctx.ok
      ? 'Dialogue level is governed by the active student’s accepted placement: ' + _d19LevelLabel(ctx.level) + '. Pathway: ' + _d19PathwayLabel(ctx.pathway) + '.'
      : (ctx.reason === 'no-student' ? 'Select or log in as a student before starting Dialogue practice.' : 'The active student needs an accepted placement level before Dialogue routing can begin.');
  }
}
function _d19AvailableThemes() {
  const reg = _d19Registration(), ctx = _d19StudentContext();
  if (!reg || !ctx.ok) return [];
  let themes = [];
  if (state.d19RouteMode === 'free-practice') {
    themes = (reg.legacyEditorialDecisions || []).filter(function(d) {
      return d.normalizedAcceptedLevelId === ctx.level && d.freePracticeEligible !== false &&
        !(d.pathwaySafetyStatus === 'restricted-no-child-default' && ctx.pathway === 'child');
    }).map(function(d) { return d.categoryId || 'legacy'; });
  } else {
    themes = (reg.candidateDialogues || []).filter(function(d) {
      return d.acceptedLevelId === ctx.level && Array.isArray(d.pathwayIds) && d.pathwayIds.includes(ctx.pathway);
    }).map(function(d) { return d.themeId; });
  }
  return Array.from(new Set(themes.filter(Boolean))).sort();
}
function _d19RenderThemePills() {
  const host = document.getElementById('category-pills');
  if (!host) return;
  _d19ClearElement(host);
  const options = ['all'].concat(_d19AvailableThemes());
  if (!options.includes(state.d19ThemeId)) state.d19ThemeId = 'all';
  options.forEach(function(themeId) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pill' + (themeId === state.d19ThemeId ? ' active' : '');
    button.dataset.themeId = themeId;
    button.textContent = themeId === 'all' ? 'All themes' : themeId.replace(/-/g, ' ').replace(/\b\w/g, function(ch) { return ch.toUpperCase(); });
    button.addEventListener('click', function() { selectCategory(themeId); });
    host.appendChild(button);
  });
}
function renderDialogue() {
  state.d19RouteMode = 'official';
  state.d19ThemeId = 'all';
  state.d19FreePage = 0;
  const list = document.getElementById('dialogue-topic-list');
  const area = document.getElementById('dialogue-practice-area');
  if (list) list.style.display = 'block';
  if (area) area.style.display = 'none';
  _d19RenderLevelPills();
  _d19RenderThemePills();
  _d19RouteButtonState();
  renderDialogueTopics();
}
function selectLevel(id) {
  const ctx = _d19StudentContext();
  if (!ctx.ok) {
    _d19SetStatus(ctx.reason === 'no-student' ? 'Select a student first.' : 'An accepted placement level is required.', 'warning');
    return;
  }
  if (id !== ctx.level) {
    _d19SetStatus('Dialogue level cannot be changed here. The active student is placed at ' + _d19LevelLabel(ctx.level) + '. Switch the active student or update placement through the accepted placement lifecycle.', 'warning');
    return;
  }
  _d19RenderLevelPills();
  renderDialogueTopics();
}
function selectCategory(id) {
  state.d19ThemeId = id || 'all';
  state.d19FreePage = 0;
  _d19RenderThemePills();
  renderDialogueTopics();
}
function openD19DialogueRoute(routeMode) {
  if (!['official','candidate-preview','free-practice'].includes(routeMode)) return;
  state.d19RouteMode = routeMode;
  state.d19ThemeId = 'all';
  state.d19FreePage = 0;
  _d19RouteButtonState();
  _d19RenderThemePills();
  renderDialogueTopics();
}
function _d19TitleMemberIndex(reg) {
  const index = Object.create(null);
  (reg.titleDisambiguationGroups || []).forEach(function(group) {
    (group.members || []).forEach(function(member) { index[member.legacyDialogueId] = member; });
  });
  return index;
}
function _d19LegacyList(reg, ctx) {
  const titleIndex = _d19TitleMemberIndex(reg);
  return (reg.legacyEditorialDecisions || []).filter(function(decision) {
    if (decision.normalizedAcceptedLevelId !== ctx.level || decision.freePracticeEligible === false) return false;
    if (ctx.pathway === 'child' && decision.pathwaySafetyStatus === 'restricted-no-child-default') return false;
    if (state.d19ThemeId !== 'all' && decision.categoryId !== state.d19ThemeId) return false;
    return true;
  }).sort(function(a,b) { return a.legacyDialogueId < b.legacyDialogueId ? -1 : 1; })
    .map(function(decision) {
      const title = titleIndex[decision.legacyDialogueId];
      return {
        dialogueId: decision.legacyDialogueId,
        titleEn: title ? title.displayTitleEn : decision.originalTitleEn,
        titlePashto: '', titlePashtoStatus: decision.titlePashtoStatus,
        acceptedLevelId: decision.normalizedAcceptedLevelId,
        themeId: decision.categoryId || 'legacy', turnCount: decision.exactStepCount,
        supportMode: 'legacy-full-model', ownerApprovalStatus: 'pending',
        officialCandidateEligible: false, officialCurriculumEligible: false,
        freePracticeEligible: true, _legacyDecision: decision
      };
    });
}
function _d19CreateTopicCard(dialogue, routeMode) {
  const card = document.createElement('article');
  card.className = 'card d19-dialogue-card';
  const head = document.createElement('div');
  head.className = 'd19-dialogue-card-head';
  const text = document.createElement('div');
  const title = document.createElement('div'); title.className = 'd19-dialogue-card-title'; title.textContent = dialogue.titleEn || dialogue.dialogueId;
  const ps = document.createElement('div'); ps.className = 'dari d19-dialogue-card-title-ps';
  ps.textContent = dialogue.titlePashto || (routeMode === 'free-practice' ? 'Pashto title pending human review' : '');
  text.appendChild(title); text.appendChild(ps);
  const icon = document.createElement('span'); icon.className = 'd19-dialogue-card-icon'; icon.textContent = '💬';
  head.appendChild(text); head.appendChild(icon); card.appendChild(head);
  const badges = document.createElement('div'); badges.className = 'd19-dialogue-card-badges';
  badges.appendChild(_d19MakeBadge(_d19LevelLabel(dialogue.acceptedLevelId), 'badge-lapis'));
  badges.appendChild(_d19MakeBadge(String(dialogue.turnCount || 0) + (routeMode === 'free-practice' ? ' legacy turns' : ' response turns'), 'badge-gold'));
  badges.appendChild(_d19MakeBadge((dialogue.themeId || 'general').replace(/-/g, ' '), 'badge-sky'));
  card.appendChild(badges);
  const route = document.createElement('div'); route.className = 'd19-dialogue-card-route';
  route.textContent = routeMode === 'candidate-preview'
    ? 'Teacher/Pilot Preview · Owner Approval Pending'
    : (routeMode === 'free-practice' ? 'Free Practice · Legacy micro-dialogue · Not official curriculum' : 'Official curriculum');
  card.appendChild(route);
  if (dialogue.contextSummaryEn && routeMode !== 'free-practice') {
    const context = document.createElement('p'); context.className = 'd19-dialogue-card-context'; context.textContent = dialogue.contextSummaryEn; card.appendChild(context);
  }
  const controls = document.createElement('div'); controls.className = 'd19-dialogue-card-actions';
  const auto = document.createElement('button'); auto.type = 'button'; auto.className = 'btn btn-primary btn-sm'; auto.textContent = '⚡ Auto Practice';
  auto.addEventListener('click', function() { startAutoDialogue(dialogue.dialogueId); });
  const manual = document.createElement('button'); manual.type = 'button'; manual.className = 'btn btn-outline btn-sm'; manual.textContent = '🎙️ Manual Practice';
  manual.addEventListener('click', function() { startDialogue(dialogue.dialogueId); });
  controls.appendChild(auto); controls.appendChild(manual); card.appendChild(controls);
  return card;
}
function _d19RenderPager(total) {
  const host = document.getElementById('d19-free-practice-page');
  if (!host) return;
  _d19ClearElement(host);
  if (state.d19RouteMode !== 'free-practice' || total <= state.d19ListLimit) { host.hidden = true; return; }
  host.hidden = false;
  const pages = Math.ceil(total / state.d19ListLimit), page = Math.max(0, Math.min(pages - 1, state.d19FreePage));
  const prev = document.createElement('button'); prev.type = 'button'; prev.className = 'btn btn-outline btn-sm'; prev.textContent = '‹ Previous'; prev.disabled = page === 0;
  prev.addEventListener('click', function() { changeD19FreePracticePage(-1); });
  const label = document.createElement('span'); label.textContent = 'Page ' + (page + 1) + ' of ' + pages + ' · ' + total + ' eligible legacy records';
  const next = document.createElement('button'); next.type = 'button'; next.className = 'btn btn-outline btn-sm'; next.textContent = 'Next ›'; next.disabled = page >= pages - 1;
  next.addEventListener('click', function() { changeD19FreePracticePage(1); });
  host.appendChild(prev); host.appendChild(label); host.appendChild(next);
}
function changeD19FreePracticePage(delta) {
  state.d19FreePage = Math.max(0, Number(state.d19FreePage || 0) + Number(delta || 0));
  renderDialogueTopics();
}
function renderDialogueTopics() {
  const host = document.getElementById('dialogue-topic-list');
  if (!host) return;
  _d19ClearElement(host);
  const cc = _d19CC(), reg = _d19Registration(), ctx = _d19StudentContext();
  if (!cc || !reg) {
    _d19SetStatus('The governed D19 Dialogue curriculum is unavailable. No legacy or unrelated fallback was started.', 'error');
    _d19RenderPager(0); return;
  }
  if (!ctx.ok) {
    _d19SetStatus(ctx.reason === 'no-student' ? 'Select or log in as a student before Dialogue practice.' : 'The active student needs an accepted placement level before Dialogue practice.', 'warning');
    _d19RenderPager(0); return;
  }
  const themeId = state.d19ThemeId === 'all' ? null : state.d19ThemeId;
  if (state.d19RouteMode === 'official') {
    const resolved = cc.resolveD19Dialogue({ studentId:ctx.student.studentId, acceptedLevelId:ctx.level, learnerPathwayId:ctx.pathway, routeMode:'official', purpose:'continue', themeId:themeId });
    if (!resolved.ok) {
      _d19SetStatus('Official Dialogue is unavailable because owner approval is still pending. Choose the explicit Teacher/Pilot Preview route for reviewed candidate content, or Free Practice for legacy micro-dialogues.', 'warning');
      const card = document.createElement('div'); card.className = 'empty-state d19-empty-state';
      const icon = document.createElement('div'); icon.className = 'es-icon'; icon.textContent = '🔒';
      const title = document.createElement('div'); title.className = 'es-text'; title.textContent = 'No owner-approved official Dialogue is available.';
      const ps = document.createElement('div'); ps.className = 'es-dari dari'; ps.textContent = 'رسمي خبرې اترې لا د مالک د منظورۍ په تمه دي.';
      card.appendChild(icon); card.appendChild(title); card.appendChild(ps); host.appendChild(card);
    } else {
      _d19SetStatus('Official route · ' + _d19LevelLabel(ctx.level) + ' · ' + _d19PathwayLabel(ctx.pathway), 'success');
      host.appendChild(_d19CreateTopicCard(resolved.dialogue, 'official'));
    }
    _d19RenderPager(0); return;
  }
  if (state.d19RouteMode === 'candidate-preview') {
    const list = (reg.candidateDialogues || []).filter(function(dialogue) {
      return dialogue.acceptedLevelId === ctx.level && Array.isArray(dialogue.pathwayIds) && dialogue.pathwayIds.includes(ctx.pathway) &&
        dialogue.officialCandidateEligible === true && dialogue.ownerApprovalStatus === 'pending' && (!themeId || dialogue.themeId === themeId);
    }).sort(function(a,b) { return a.dialogueId < b.dialogueId ? -1 : 1; });
    _d19SetStatus('Teacher/Pilot Preview · Owner Approval Pending · ' + list.length + ' eligible ' + _d19LevelLabel(ctx.level) + ' candidate Dialogue' + (list.length === 1 ? '' : 's') + '.', 'candidate');
    if (!list.length) {
      const empty = document.createElement('div'); empty.className = 'empty-state'; empty.textContent = 'No candidate Dialogue matches this exact level, pathway, and theme. No unrelated fallback was used.'; host.appendChild(empty);
    } else list.forEach(function(dialogue) { host.appendChild(_d19CreateTopicCard(dialogue, 'candidate-preview')); });
    _d19RenderPager(0); return;
  }
  const legacy = _d19LegacyList(reg, ctx);
  const start = state.d19FreePage * state.d19ListLimit;
  const page = legacy.slice(start, start + state.d19ListLimit);
  if (!page.length && legacy.length && state.d19FreePage > 0) { state.d19FreePage = 0; return renderDialogueTopics(); }
  _d19SetStatus('Free Practice / Legacy Micro-dialogues · bounded to ' + state.d19ListLimit + ' cards per page · not official level curriculum.', 'free');
  if (!page.length) {
    const empty = document.createElement('div'); empty.className = 'empty-state'; empty.textContent = 'No pathway-safe legacy Free Practice record matches this selection.'; host.appendChild(empty);
  } else page.forEach(function(dialogue) { host.appendChild(_d19CreateTopicCard(dialogue, 'free-practice')); });
  _d19RenderPager(legacy.length);
}
function _d19AdaptDialogue(dialogue) {
  return {
    id: dialogue.dialogueId, dialogueId: dialogue.dialogueId, titleEn: dialogue.titleEn,
    titlePashto: dialogue.titlePashto || '', level: dialogue.acceptedLevelId, category: dialogue.themeId,
    supportMode: dialogue.supportMode, expectedResponseDemand: dialogue.expectedResponseDemand,
    _d19: true, _d19Raw: dialogue,
    steps: (dialogue.turns || []).map(function(turn) {
      return {
        promptEn: turn.promptEn, promptPashto: turn.promptPashto, promptDari: turn.promptPashto,
        answerEn: turn.modelAnswerEn, answerPashto: turn.modelAnswerPashto, answerDari: turn.modelAnswerPashto,
        phonetic: '', _d19Turn: turn
      };
    })
  };
}
function _d19InvalidateRuntime(reason) {
  state.d19RuntimeToken = Number(state.d19RuntimeToken || 0) + 1;
  state.listeningSessionId = Number(state.listeningSessionId || 0) + 1;
  state.d19LastInvalidationReason = reason || '';
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  try { if (state.recognition) state.recognition.abort(); } catch (e) {}
  state.recognition = null; state.isListening = false;
}
function _d19StartSession(dialogueId, flow) {
  const cc = _d19CC(), ctx = _d19StudentContext();
  if (!cc || !ctx.ok) { _d19SetStatus(!ctx.ok && ctx.reason === 'no-student' ? 'Select a student first.' : 'A governed accepted level is required.', 'warning'); return null; }
  const routeMode = state.d19RouteMode;
  if (routeMode === 'official') {
    _d19SetStatus('Official Dialogue cannot start while owner approval is pending. Use the explicit preview or Free Practice route.', 'warning'); return null;
  }
  const started = cc.startDialogueSessionD19({
    studentId:ctx.student.studentId, acceptedLevelId:ctx.level, learnerPathwayId:ctx.pathway,
    dialogueId:dialogueId, routeMode:routeMode, purpose:'continue'
  });
  if (!started || !started.ok) {
    _d19SetStatus('Dialogue could not start: ' + ((started && started.reason) || 'unknown-error') + '. No unrelated fallback was used.', 'error');
    return null;
  }
  _d19InvalidateRuntime('start-' + flow);
  state.d19ActiveRaw = started.dialogue;
  state.d19ActiveProgress = started.progress;
  state.d19ModelRevealed = false;
  state.d19ScoreMeta = null;
  state.d19ActiveAttemptId = null;
  state.currentDialogue = _d19AdaptDialogue(started.dialogue);
  state.currentStep = Math.max(0, Math.min(state.currentDialogue.steps.length - 1, Number(started.progress.activeTurnIndex || 0)));
  state.dlgSessionScores = [];
  const old = document.getElementById('dlg-completion-card'); if (old) old.remove();
  const list = document.getElementById('dialogue-topic-list'), area = document.getElementById('dialogue-practice-area');
  if (list) list.style.display = 'none';
  if (area) area.style.display = 'block';
  if (flow === 'manual') {
    renderStep();
    document.getElementById('score-display')?.classList.remove('visible');
    const ai = document.getElementById('ai-feedback-area'); if (ai) ai.style.display = 'none';
  }
  return started;
}
function startDialogue(id) { _d19StartSession(id, 'manual'); }
function _d19CurrentTurn() {
  const raw = state.d19ActiveRaw || (state.currentDialogue && state.currentDialogue._d19Raw);
  return raw && raw.turns ? raw.turns[state.currentStep] : null;
}
function _d19CurrentProgress() {
  const cc = _d19CC(), ctx = _d19StudentContext(), raw = state.d19ActiveRaw;
  if (!cc || !ctx.ok || !raw) return null;
  return cc.getDialogueProgressD19(ctx.student.studentId, raw.dialogueId);
}
function _d19ModelVisibleBeforeResponse(dialogue) {
  return ['full-model','full-support','legacy-full-model'].includes(dialogue && dialogue.supportMode);
}
function renderStep() {
  const d = state.currentDialogue, raw = state.d19ActiveRaw, turn = _d19CurrentTurn();
  if (!d || !raw || !turn) return;
  const progress = _d19CurrentProgress(); state.d19ActiveProgress = progress;
  const ctx = _d19StudentContext();
  const completed = !!(progress && progress.completedTurnIds && progress.completedTurnIds.includes(turn.turnId));
  const showModel = _d19ModelVisibleBeforeResponse(raw) || state.d19ModelRevealed || completed;
  const badge = document.getElementById('dialogue-step-badge'); if (badge) badge.textContent = 'Turn ' + (state.currentStep + 1) + ' of ' + raw.turns.length;
  const promptEn = document.getElementById('dialogue-prompt-en'); if (promptEn) promptEn.textContent = turn.promptEn;
  const promptPs = document.getElementById('dialogue-prompt-dari'); if (promptPs) promptPs.textContent = turn.promptPashto || '';
  const phonetic = document.getElementById('dialogue-phonetic'); if (phonetic) { phonetic.textContent = ''; phonetic.hidden = true; }
  const answerEn = document.getElementById('dialogue-answer-en'); if (answerEn) answerEn.textContent = showModel ? turn.modelAnswerEn : '';
  const answerPs = document.getElementById('dialogue-answer-dari'); if (answerPs) { answerPs.textContent = showModel ? turn.modelAnswerPashto : ''; answerPs.hidden = !showModel; }
  const visibility = document.getElementById('dialogue-answer-visibility');
  if (visibility) visibility.textContent = showModel ? 'Model support is visible under this turn’s support contract.' : 'The complete model is hidden until after your response. Use the task and support prompt.';
  const reveal = document.getElementById('d19-reveal-model-btn');
  if (reveal) { reveal.hidden = showModel; reveal.disabled = !completed && !state.d19ScoreMeta; }
  const audio = document.getElementById('d19-model-audio-btn'); if (audio) audio.hidden = !showModel;
  const pbtn = document.getElementById('dialogue-pronun-btn');
  const safePronunciation = raw.pronunciationSupportMode !== 'tts-only-legacy-transliteration-hidden' && turn.pronunciationDisplaySafe !== false && Array.isArray(turn.pronunciationFocus) && turn.pronunciationFocus.length > 0;
  if (pbtn) pbtn.hidden = !safePronunciation;
  const panel = document.getElementById('pronun-panel'); if (panel) { panel.classList.remove('visible'); _d19ClearElement(panel); }
  const title = document.getElementById('d19-active-title'); if (title) title.textContent = raw.titleEn;
  const titlePs = document.getElementById('d19-active-title-pashto'); if (titlePs) titlePs.textContent = raw.titlePashto || 'Pashto title pending human review';
  const gov = document.getElementById('d19-governance-status'); if (gov) gov.textContent = progress && progress.routeMode === 'candidate-preview' ? 'Teacher/Pilot Preview · Owner Approval Pending' : 'Free Practice · Legacy Micro-dialogue';
  const badgeHost = document.getElementById('d19-active-badges');
  if (badgeHost) { _d19ClearElement(badgeHost); badgeHost.appendChild(_d19MakeBadge(_d19LevelLabel(raw.acceptedLevelId),'badge-lapis')); badgeHost.appendChild(_d19MakeBadge(_d19PathwayLabel(ctx.ok ? ctx.pathway : ''),'badge-gold')); }
  const objective = document.getElementById('d19-objective'); if (objective) objective.textContent = Array.isArray(raw.objectivesEn) && raw.objectivesEn.length ? raw.objectivesEn[0] : raw.contextSummaryEn || 'Legacy Free Practice exchange.';
  const task = document.getElementById('d19-student-task'); if (task) task.textContent = turn.studentTaskEn;
  const support = document.getElementById('d19-support-status'); if (support) support.textContent = raw.supportMode + ' · ' + turn.scoringMode + (turn.automatedScoreIsPartial ? ' · automated evidence is partial' : '');
  const progressEl = document.getElementById('d19-progress-status'); if (progressEl) progressEl.textContent = (progress ? progress.completedTurnIds.length : 0) + ' of ' + raw.turns.length + ' turns completed · state ' + (progress ? progress.stateStatus : 'active');
  document.getElementById('score-display')?.classList.remove('visible');
  _d19ResetManualFallback();
  const ai = document.getElementById('ai-feedback-area'); if (ai) ai.style.display = 'none';
  const transcript = document.getElementById('transcript-display'); if (transcript) transcript.textContent = '';
  document.getElementById('replay-bar')?.classList.add('visible');
  updatePashtoRecognitionNotice(); resetMicBtn();
  if (cc && ctx.ok) cc.updateDialoguePositionD19({ studentId:ctx.student.studentId, dialogueId:raw.dialogueId, turnId:turn.turnId, activeTurnIndex:state.currentStep });
  replayPrompt();
}
function closePractice() {
  const cc = _d19CC(), ctx = _d19StudentContext(), raw = state.d19ActiveRaw;
  _d19InvalidateRuntime('close'); stopSpeech();
  if (cc && ctx.ok && raw) cc.pauseDialogueD19(ctx.student.studentId, raw.dialogueId);
  document.getElementById('replay-bar')?.classList.remove('visible');
  const list = document.getElementById('dialogue-topic-list'), area = document.getElementById('dialogue-practice-area');
  if (list) list.style.display = 'block'; if (area) area.style.display = 'none';
  state.currentDialogue = null; state.d19ActiveRaw = null; state.d19ActiveProgress = null; state.d19ModelRevealed = false;
  renderDialogueTopics();
}
function getCurrentDialogueStep() { return state.currentDialogue?.steps?.[state.currentStep] || null; }
function getDialogueSpeakLang() { return 'en'; }
function updatePashtoRecognitionNotice() {
  const notice = document.getElementById('dari-recognition-notice') || document.querySelector('.support-recognition-notice');
  if (!notice) return;
  notice.classList.add('visible');
  notice.textContent = 'Pashto is visual support only. Speech recognition listens to English; technical failures do not create an academic zero.';
}
function replayPrompt() { const turn = _d19CurrentTurn(); if (turn) speak(turn.promptEn, 'en'); }
function replayAnswer() {
  const raw = state.d19ActiveRaw, turn = _d19CurrentTurn(), progress = _d19CurrentProgress();
  if (!turn || !raw) return;
  const completed = !!(progress && progress.completedTurnIds && progress.completedTurnIds.includes(turn.turnId));
  if (!_d19ModelVisibleBeforeResponse(raw) && !state.d19ModelRevealed && !completed) { showToast('Respond first. The complete model is hidden under this level’s support contract.'); return; }
  speak(turn.modelAnswerEn, 'en');
}
function revealD19ModelAnswer() {
  const progress = _d19CurrentProgress(), turn = _d19CurrentTurn();
  if (!turn) return;
  const completed = !!(progress && progress.completedTurnIds && progress.completedTurnIds.includes(turn.turnId));
  if (!completed && !state.d19ScoreMeta) { showToast('Give your response before revealing the complete model.'); return; }
  state.d19ModelRevealed = true;
  const en = document.getElementById('dialogue-answer-en'); if (en) en.textContent = turn.modelAnswerEn;
  const ps = document.getElementById('dialogue-answer-dari'); if (ps) { ps.textContent = turn.modelAnswerPashto; ps.hidden = false; }
  const vis = document.getElementById('dialogue-answer-visibility'); if (vis) vis.textContent = 'Model revealed after the response for review.';
  const btn = document.getElementById('d19-reveal-model-btn'); if (btn) btn.hidden = true;
  const audio = document.getElementById('d19-model-audio-btn'); if (audio) audio.hidden = false;
}
function showD19PronunciationSupport() {
  const raw = state.d19ActiveRaw, turn = _d19CurrentTurn(), panel = document.getElementById('pronun-panel');
  if (!raw || !turn || !panel) return;
  if (panel.classList.contains('visible')) { panel.classList.remove('visible'); return; }
  if (raw.pronunciationSupportMode === 'tts-only-legacy-transliteration-hidden' || turn.pronunciationDisplaySafe === false || !Array.isArray(turn.pronunciationFocus) || !turn.pronunciationFocus.length) {
    panel.classList.remove('visible'); showToast('Verified English pronunciation support is pending. Use the English TTS model.'); return;
  }
  _d19ClearElement(panel);
  const heading = document.createElement('div'); heading.className = 'd19-pronun-heading'; heading.textContent = 'English Pronunciation Support'; panel.appendChild(heading);
  const note = document.createElement('div'); note.className = 'd19-pronun-note'; note.textContent = 'TTS audio is the primary pronunciation model. The focus words below are phase-reviewed and still pending human confirmation; no IPA is fabricated.'; panel.appendChild(note);
  const list = document.createElement('div'); list.className = 'd19-pronun-focus-list';
  turn.pronunciationFocus.forEach(function(word) { const chip = document.createElement('span'); chip.textContent = word; list.appendChild(chip); });
  panel.appendChild(list); panel.classList.add('visible');
}
function togglePronun() { showD19PronunciationSupport(); }
function pauseD19DialogueSession() {
  const cc = _d19CC(), ctx = _d19StudentContext(), raw = state.d19ActiveRaw; if (!cc || !ctx.ok || !raw) return;
  _d19InvalidateRuntime('pause'); state.d19ActiveProgress = cc.pauseDialogueD19(ctx.student.studentId, raw.dialogueId); renderStep();
}
function resumeD19DialogueSession() {
  const cc = _d19CC(), ctx = _d19StudentContext(), raw = state.d19ActiveRaw; if (!cc || !ctx.ok || !raw) return;
  state.d19ActiveProgress = cc.resumeDialogueD19(ctx.student.studentId, raw.dialogueId); renderStep();
}
function stopD19DialogueSession() {
  const cc = _d19CC(), ctx = _d19StudentContext(), raw = state.d19ActiveRaw; if (!cc || !ctx.ok || !raw) return;
  _d19InvalidateRuntime('stop'); state.d19ActiveProgress = cc.stopDialogueD19(ctx.student.studentId, raw.dialogueId);
  const status = document.getElementById('d19-progress-status'); if (status) status.textContent = 'Session stopped safely. Position remains resumable.';
}


// ===== SPEECH =====
function toggleSpeech() {
  if (state.isListening) stopSpeech();
  else startSpeech();
}

function _d18SpeechTechnicalErrorCode(errorName) {
  const name = String(errorName || '').toLowerCase();
  if (name === 'not-allowed' || name === 'permission-denied') return 'microphone-permission-denied';
  if (name === 'audio-capture' || name === 'no-microphone') return 'no-microphone';
  if (name === 'network' || name === 'service-not-allowed' || name === 'speech-service-unavailable') return 'speech-service-unavailable';
  if (name === 'no-speech') return 'recognition-technical-timeout';
  if (name === 'invalidstateerror' || name === 'invalid-state') return 'invalid-state-double-start';
  return 'speech-recognition-' + (name || 'unknown-error');
}

function startSpeech() {
  if (state.activeScreen === 'dialogue' && state.d19ActiveRaw) {
    const progress = _d19CurrentProgress();
    const turn = _d19CurrentTurn();
    state.d19AttemptSequence = Number(state.d19AttemptSequence || 0) + 1;
    state.d19ActiveAttemptId = [progress && progress.sessionId || 'd19-session', turn && turn.turnId || 'turn', 'manual', state.d19AttemptSequence].join('::');
  }
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    var unsupportedStatus = document.getElementById('speech-status');
    if (unsupportedStatus) unsupportedStatus.textContent = 'Speech recognition is not supported in this browser. Use typing/manual fallback.';
    _recordD18TechnicalFailure('recognition-unsupported');
    if (state.activeScreen === 'dialogue') _d19ShowManualFallback('Speech recognition is unsupported. Type the English response or ask a teacher to record an unscored completion.');
    return;
  }
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { _recordD18TechnicalFailure('tts-hardware-release-failure'); }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;
  try { recognition = new SR(); }
  catch (e) { _recordD18TechnicalFailure(_d18SpeechTechnicalErrorCode(e && e.name)); return; }
  state.recognition = recognition;
  recognition.lang = 'en-US';
  recognition.continuous = false;
  recognition.interimResults = true;

  // D16/D18A stale-session guard: recognition may only score the item/section
  // that was active when this recognition instance started.
  var _mySpeechSession = state.listeningSessionId || 0;
  var _graceUsed = false;
  var _silTimer = null;
  var _scored13B = false;
  var _technicalFailure = false;

  function _resetSilTimer() {
    clearTimeout(_silTimer);
    if (_scored13B || _technicalFailure) return;
    _silTimer = setTimeout(function() {
      if (state.recognition) { try { state.recognition.stop(); } catch(e) {} }
    }, SPEECH_SILENCE_GRACE_MS);
  }
  function _finishAndScore() {
    if (_scored13B || _technicalFailure) return;
    _scored13B = true;
    clearTimeout(_silTimer);
    state.isListening = false;
    resetMicBtn();
    if (!state.transcript) {
      _recordD18TechnicalFailure('recognition-technical-timeout');
      var emptyStatus = document.getElementById('speech-status');
      if (emptyStatus) emptyStatus.textContent = 'Nothing was captured. Retry the mic or use the manual fallback; no academic score was recorded.';
      if (state.activeScreen === 'dialogue') _d19ShowManualFallback('No speech was captured. Retry, type the English response, or use teacher unscored completion.');
      return;
    }
    var status = document.getElementById('speech-status');
    var statusPs = document.getElementById('speech-status-dari');
    if (status) status.textContent = zirakGetCheckingMessage();
    if (statusPs) statusPs.textContent = 'ستاسو ځواب کتل کېږي…';
    var transcriptDisplay = document.getElementById('transcript-display');
    if (transcriptDisplay) transcriptDisplay.textContent = '💬 "' + state.transcript + '"';
    setTimeout(function() {
      if (_mySpeechSession !== (state.listeningSessionId || 0)) return;
      if (state.transcript && state.activeScreen === 'dialogue') scoreAnswer();
      if (state.transcript && state.activeScreen === 'listening') scoreListenRepeat();
    }, RESULT_REVEAL_DELAY_MS);
  }
  function _handleTechnicalError(errorName, statusEl) {
    if (String(errorName || '') === 'aborted') return;
    _technicalFailure = true;
    clearTimeout(_silTimer);
    state.recognition = null;
    state.isListening = false;
    resetMicBtn();
    const code = _d18SpeechTechnicalErrorCode(errorName);
    _recordD18TechnicalFailure(code);
    if (statusEl) statusEl.textContent = 'Microphone/recognition error (' + code + '). Retry or use the manual fallback; no score was recorded.';
    if (state.activeScreen === 'dialogue') _d19ShowManualFallback('Microphone/recognition error (' + code + '). No academic zero was recorded. Use retry, typing, or teacher unscored completion.');
  }
  function _wireRecognition(rec, isGrace) {
    rec.onresult = function(e) {
      const interim = Array.from(e.results).map(function(r){ return r[0].transcript; }).join('');
      const display = document.getElementById('transcript-display');
      if (display) display.textContent = interim;
      _resetSilTimer();
      if (e.results[e.results.length - 1].isFinal) {
        state.transcript = isGrace && state.transcript ? state.transcript + ' ' + interim : interim;
      }
    };
    rec.onerror = function(e) { _handleTechnicalError(e && e.error, document.getElementById('speech-status')); };
  }
  _wireRecognition(recognition, false);
  recognition.onend = function() {
    state.recognition = null;
    if (_scored13B || _technicalFailure) return;
    if (state.transcript && !_graceUsed) {
      _graceUsed = true;
      const status = document.getElementById('speech-status');
      if (status) status.textContent = '⏳ Keep speaking… still listening';
      let rec2;
      try { rec2 = new SR(); }
      catch (e) { _handleTechnicalError(e && e.name, status); return; }
      rec2.lang = 'en-US'; rec2.continuous = false; rec2.interimResults = true;
      state.recognition = rec2; state.isListening = true;
      _wireRecognition(rec2, true);
      rec2.onend = function(){ state.recognition = null; _finishAndScore(); };
      try { rec2.start(); _resetSilTimer(); return; }
      catch (e) { _handleTechnicalError(e && e.name || 'invalid-state', status); return; }
    }
    _finishAndScore();
  };

  state.transcript = '';
  state.isListening = true;
  const btn = document.getElementById('mic-btn');
  if (btn) { btn.classList.add('listening'); btn.textContent = '🔴'; }
  const status = document.getElementById('speech-status');
  const statusPs = document.getElementById('speech-status-dari');
  if (status) status.textContent = '🎙️ Listening… speak English now. Take your time.';
  if (statusPs) statusPs.textContent = 'اورم… په انګلیسي ورو او روښانه خبرې وکړئ!';
  try { recognition.start(); _resetSilTimer(); }
  catch (e) { _handleTechnicalError(e && e.name || 'invalid-state', status); }
}

function stopSpeech() {
  if (state.recognition) { try { state.recognition.stop(); } catch(e) {} }
  state.isListening = false;
  resetMicBtn();
}

function resetMicBtn() {
  const btn = document.getElementById('mic-btn');
  if (btn) { btn.classList.remove('listening'); btn.classList.remove('success'); btn.textContent = '🎙️'; }
  const st = document.getElementById('speech-status');
  const std = document.getElementById('speech-status-dari');
  if (st) st.textContent = 'Tap the mic or press Space to start speaking';
  if (std) std.textContent = 'د خبرو پیل لپاره مایکروفون ټچ کړئ';
  updatePashtoRecognitionNotice();
}


function _d19ManualFallbackElements() {
  return {
    area:document.querySelector('#dialogue-practice-area .d19-manual-fallback'),
    note:document.querySelector('#dialogue-practice-area .d19-manual-fallback-note'),
    input:document.querySelector('#dialogue-practice-area .d19-manual-fallback-input')
  };
}
function _d19ShowManualFallback(message) {
  const parts = _d19ManualFallbackElements();
  if (parts.area) parts.area.hidden = false;
  if (parts.note && message) parts.note.textContent = message;
}
function _d19ResetManualFallback() {
  const parts = _d19ManualFallbackElements();
  if (parts.area) parts.area.hidden = true;
  if (parts.input) parts.input.value = '';
  if (parts.note) parts.note.textContent = 'Use this only when speech recognition is unavailable. A typed response is scored by the same D19 contract; a teacher may instead record an unscored completion.';
}
function submitD19ManualTypingFallback() {
  const parts = _d19ManualFallbackElements(), value = String(parts.input && parts.input.value || '').trim();
  if (!value) {
    if (parts.note) parts.note.textContent = 'Type an English response before submitting. No academic score has been recorded.';
    return;
  }
  const progress = _d19CurrentProgress(), turn = _d19CurrentTurn();
  state.d19AttemptSequence = Number(state.d19AttemptSequence || 0) + 1;
  state.d19ActiveAttemptId = [progress && progress.sessionId || 'd19-session', turn && turn.turnId || 'turn', 'typing-fallback', state.d19AttemptSequence].join('::');
  state.transcript = value;
  const display = document.getElementById('transcript-display');
  if (display) display.textContent = value;
  scoreAnswer();
}
function recordD19TeacherUnscoredCompletion() {
  const cc = _d19CC(), ctx = _d19StudentContext(), raw = state.d19ActiveRaw, turn = _d19CurrentTurn(), progress = _d19CurrentProgress();
  if (!cc || !ctx.ok || !raw || !turn || !progress) return;
  state.d19AttemptSequence = Number(state.d19AttemptSequence || 0) + 1;
  const attemptId = [progress.sessionId, turn.turnId, 'teacher-unscored', state.d19AttemptSequence].join('::');
  state.d19ActiveProgress = cc.recordDialogueTurnResultD19({
    studentId:ctx.student.studentId, dialogueId:raw.dialogueId, turnId:turn.turnId,
    attemptId:attemptId, manualComplete:true, scoreStatus:'unscored-manual-completion'
  });
  state.d19ModelRevealed = true;
  const scoreCard = document.getElementById('score-display'); if (scoreCard) scoreCard.classList.add('visible');
  const label = document.getElementById('d19-score-label'); if (label) label.textContent = 'Teacher completion — unscored';
  const number = document.getElementById('score-num'); if (number) { number.textContent = 'No %'; number.style.color = 'var(--text-muted)'; }
  const feedback = document.getElementById('score-feedback-en'); if (feedback) feedback.textContent = 'The turn was marked complete without a percentage. No 100% score was created.';
  const feedbackPs = document.getElementById('score-feedback-dari'); if (feedbackPs) feedbackPs.textContent = 'دا پړاو بې له سلنې بشپړ ثبت شو؛ سل سلنه نمره نه ده جوړه شوې.';
  const reveal = document.getElementById('d19-reveal-model-btn'); if (reveal) reveal.disabled = false;
  _d19ShowManualFallback('Teacher unscored completion recorded. Use Next to continue.');
}

function _d19PhrasePresent(normalizedTranscript, phrase) {
  const target = normalizeForScore(phrase || '');
  if (!target) return false;
  return (' ' + normalizedTranscript + ' ').includes(' ' + target + ' ') || normalizedTranscript.includes(target);
}
function _d19GroupCoverage(transcript, groups) {
  const normalized = normalizeForScore(transcript || '');
  const list = Array.isArray(groups) ? groups : [];
  if (!list.length) return 1;
  const matched = list.filter(function(group) {
    return (Array.isArray(group) ? group : [group]).some(function(term) { return _d19PhrasePresent(normalized, term); });
  }).length;
  return matched / list.length;
}
function _d19AlternativeSimilarity(transcript, turn) {
  const candidates = [turn.modelAnswerEn].concat((turn.acceptableAlternativeAnswers || []).filter(function(answer) {
    return answer && !/^A different answer is acceptable/i.test(answer);
  }));
  return candidates.reduce(function(best, candidate) { return Math.max(best, calculateScore(transcript, candidate)); }, 0) / 100;
}
function calculateD19TurnScore(transcript, turn, dialogueId) {
  // D19 has one deterministic scoring authority. Both Manual and Auto paths
  // delegate to ZirakCurriculumContent so the same intent/keyword/rubric
  // contract is used everywhere and no competing UI-only score can drift.
  const cc = _d19CC();
  const resolvedDialogueId = dialogueId || state.d19ActiveRaw?.dialogueId || '';
  if (!cc || typeof cc.evaluateDialogueResponseD19 !== 'function' || !turn || !resolvedDialogueId) {
    return {
      score:null, partial:true, scoringMode:turn?.scoringMode || 'teacher-rubric',
      scoreStatus:'technical-neutral-unscored', automatedScoreIsPartial:true,
      teacherRubricId:turn?.teacherRubricId || null,
      reason:'dialogue-scoring-authority-unavailable'
    };
  }
  const evaluated = cc.evaluateDialogueResponseD19({
    dialogueId:resolvedDialogueId,
    turnId:turn.turnId,
    transcript:String(transcript || '')
  }) || {};
  return {
    score:typeof evaluated.score === 'number' ? evaluated.score : null,
    partial:evaluated.automatedScoreIsPartial === true,
    automatedScoreIsPartial:evaluated.automatedScoreIsPartial === true,
    scoringMode:evaluated.scoringMode || turn.scoringMode,
    scoreStatus:evaluated.scoreStatus || 'unscored',
    requiredCoverage:evaluated.requiredKeywordGroupCount
      ? Math.round((evaluated.requiredKeywordGroupsMet / evaluated.requiredKeywordGroupCount) * 100)
      : 100,
    responseLengthWords:normalizeForScore(transcript || '').split(/\s+/).filter(Boolean).length,
    teacherRubricId:evaluated.teacherRubricId || turn.teacherRubricId || null,
    academicOutcome:evaluated.academicOutcome || 'unscored',
    reason:evaluated.reason || ''
  };
}

function scoreAnswer() {
  const step = state.currentDialogue?.steps[state.currentStep];
  const turn = _d19CurrentTurn(), raw = state.d19ActiveRaw, cc = _d19CC(), ctx = _d19StudentContext();
  if (!step || !turn || !raw || !state.transcript) return;
  const result = calculateD19TurnScore(state.transcript, turn, raw.dialogueId);
  const score = result.score;
  if (typeof score !== 'number') {
    _recordD18TechnicalFailure(result.reason || 'dialogue-scoring-authority-unavailable');
    const status = document.getElementById('speech-status');
    if (status) status.textContent = 'The Dialogue scoring authority is temporarily unavailable. No academic score was recorded; retry or use teacher/manual fallback.';
    return;
  }
  state.lastScore = score;
  state.d19ScoreMeta = result;
  showScore(score, state.transcript, turn.modelAnswerEn, step);
  const label = document.getElementById('d19-score-label');
  const number = document.getElementById('score-num');
  const feedback = document.getElementById('score-feedback-en');
  if (result.partial) {
    if (label) label.textContent = 'Automated partial evidence';
    if (number) number.textContent = score + '/100 partial evidence';
    if (feedback) feedback.textContent = (feedback.textContent ? feedback.textContent + ' ' : '') + 'A teacher rubric is still required for nuance, organization, register, or evidence. This is not a complete speaking grade.';
  } else if (label) label.textContent = 'Deterministic speaking evidence';
  const reveal = document.getElementById('d19-reveal-model-btn'); if (reveal) reveal.disabled = false;
  if (cc && ctx.ok) {
    const progress = cc.getDialogueProgressD19(ctx.student.studentId, raw.dialogueId);
    const attemptId = state.d19ActiveAttemptId || [progress && progress.sessionId || 'd19-session', turn.turnId, 'manual-fallback'].join('::');
    state.d19ActiveProgress = cc.recordDialogueTurnResultD19({
      studentId:ctx.student.studentId, dialogueId:raw.dialogueId, turnId:turn.turnId,
      transcript:state.transcript, score:score, attemptId:attemptId,
      scoreStatus:result.scoreStatus,
      automatedScoreIsPartial:result.automatedScoreIsPartial === true
    });
  }
  // showScore records the visible attempt once for the completion summary.
  if (Array.isArray(state.dlgSessionScores) && state.dlgSessionScores.length) {
    state.dlgSessionScores[state.dlgSessionScores.length - 1].partial = result.partial;
  }
  saveToHistory({
    type:'dialogue', topic:raw.titleEn, score:score, mode:state.mode,
    routeMode:state.d19RouteMode, dialogueId:raw.dialogueId, turnId:turn.turnId,
    scoringMode:turn.scoringMode, automatedScoreIsPartial:result.partial, date:new Date().toISOString()
  });
  checkAndAwardBadges(); updateStreak(); awardMilestone('first-practice');
  if (score >= 70) {
    const btn = document.getElementById('mic-btn'); if (btn) btn.classList.add('success');
    if (state.autoContinue) setTimeout(nextStep, 2000);
  }
}


// ===== NUMBER NORMALIZATION (v1.6B) =====
const NUM_WORDS = {
  '0':'zero','1':'one','2':'two','3':'three','4':'four','5':'five',
  '6':'six','7':'seven','8':'eight','9':'nine','10':'ten',
  '11':'eleven','12':'twelve','13':'thirteen','14':'fourteen','15':'fifteen',
  '16':'sixteen','17':'seventeen','18':'eighteen','19':'nineteen','20':'twenty',
  '21':'twenty one','22':'twenty two','23':'twenty three','24':'twenty four','25':'twenty five',
  '30':'thirty','40':'forty','50':'fifty','60':'sixty','70':'seventy',
  '80':'eighty','90':'ninety','100':'one hundred'
};
const WORD_NUMS = {};
Object.entries(NUM_WORDS).forEach(([k,v]) => { WORD_NUMS[v] = k; });

// ===== CONTRACTION EXPANSION MAP (v1.8B) =====
const CONTRACTION_MAP = {
  "i'm": "i am", "you're": "you are", "he's": "he is", "she's": "she is",
  "it's": "it is", "we're": "we are", "they're": "they are",
  "i'll": "i will", "you'll": "you will", "he'll": "he will",
  "she'll": "she will", "we'll": "we will", "they'll": "they will",
  "i've": "i have", "you've": "you have", "we've": "we have", "they've": "they have",
  "i'd": "i would", "you'd": "you would", "he'd": "he would",
  "she'd": "she would", "we'd": "we would", "they'd": "they would",
  "don't": "do not", "doesn't": "does not", "didn't": "did not",
  "can't": "cannot", "won't": "will not", "isn't": "is not",
  "aren't": "are not", "wasn't": "was not", "weren't": "were not",
  "haven't": "have not", "hasn't": "has not", "hadn't": "had not",
  "shouldn't": "should not", "wouldn't": "would not", "couldn't": "could not",
  "mustn't": "must not", "needn't": "need not",
  "that's": "that is", "there's": "there is", "here's": "here is",
  "what's": "what is", "who's": "who is", "how's": "how is",
  "let's": "let us", "there're": "there are",
  // Informal equivalents
  "thanks": "thank you",
  "ok": "okay",
  "hi": "hello"
};

function expandContractions(t) {
  // Normalize ALL apostrophe/quote variants to straight apostrophe before lookup.
  // Uses explicit Unicode escapes so no editor/encoding can silently collapse them:
  //   \u2018 = '  (left  single quotation mark)
  //   \u2019 = '  (right single quotation mark — the most common curly apostrophe)
  //   \u02BC = ʼ  (modifier letter apostrophe)
  //   \uFF07 = ＇  (fullwidth apostrophe)
  let s = t.replace(/[\u2018\u2019\u02BC\uFF07]/g, "'");
  // Replace each contraction (word-boundary aware)
  for (const [contracted, expanded] of Object.entries(CONTRACTION_MAP)) {
    const escaped = contracted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp('\\b' + escaped + '\\b', 'gi'), ' ' + expanded + ' ');
  }
  return s.replace(/\s+/g, ' ').trim();
}

function normalizeNumbers(t) {
  // Digits → words (sorted longest key first to avoid partial matches)
  const digits = Object.keys(NUM_WORDS).sort((a,b) => parseInt(b) - parseInt(a));
  for (const n of digits) {
    t = t.replace(new RegExp('\\b' + n + '\\b', 'g'), ' ' + NUM_WORDS[n] + ' ');
  }
  return t.replace(/\s+/g, ' ').trim();
}

function normalizeForScore(text) {
  let s = String(text || '').toLowerCase();
  // Expand contractions before stripping punctuation (v1.8B)
  s = expandContractions(s);
  s = s
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ۀة]/g, 'ه')
    .replace(/[َُِّْٰـ]/g, '')
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Normalize numbers so "3" and "three" both score as matching
  s = normalizeNumbers(s);
  return s.replace(/\s+/g, ' ').trim();
}

function calculateScore(spoken, expected) {
  if (!spoken) return 0;
  const spokenWords = normalizeForScore(spoken).split(/\s+/).filter(Boolean);
  const expectedWords = normalizeForScore(expected).split(/\s+/).filter(Boolean);
  if (!expectedWords.length) return 0;
  let matched = 0;
  spokenWords.forEach(w => {
    if (expectedWords.includes(w)) matched++;
  });
  return Math.min(100, Math.round((matched / expectedWords.length) * 100));
}

function showScore(score, spoken, expected, contentItem) {
  const el = document.getElementById('score-display');
  if (!el) return;
  el.classList.add('visible');

  // I6H-B1: record the dialogue step result for the completion summary card.
  // Keyed by step index later, so a retryStep re-score replaces the old one.
  if (state.currentDialogue && Array.isArray(state.dlgSessionScores)) {
    state.dlgSessionScores.push({ step: state.currentStep, score: score, expected: expected || '', spoken: spoken || '' });
  }

  // Score number with colour
  const numEl = document.getElementById('score-num');
  if (numEl) {
    numEl.textContent = score + '%';
    numEl.style.color = score >= 70 ? 'var(--emerald)' : score >= 40 ? 'var(--gold)' : 'var(--red)';
  }

  // v1.13B: teacher-like local feedback (offline)
  const spokenNorm   = normalizeForScore(spoken   || '');
  const expectedNorm = normalizeForScore(expected  || '');
  const scoreMeta = state.d19ScoreMeta || null;
  const teacherMsg   = scoreMeta && scoreMeta.automatedScoreIsPartial
    ? 'Automated partial evidence recorded. A teacher rubric is still required for a complete speaking judgment.'
    : zirakTeacherFeedback(score, spokenNorm, expectedNorm);

  const feedbackEnEl   = document.getElementById('score-feedback-en');
  const feedbackPashtoEl = document.getElementById('score-feedback-dari');
  if (feedbackEnEl)   feedbackEnEl.textContent = teacherMsg;

  // Pashto feedback label (short motivational)
  const dariLabels = [
    { min:0,  dari:'دوام ورکړه! ته زده کړه کوې!' },
    { min:40, dari:'ښه هڅه! بیا یې ورو وازمویه!' },
    { min:70, dari:'آفرین! ښه و!' },
    { min:90, dari:'عالي! بشپړه نمره!' }
  ];
  const dariMsg = [...dariLabels].reverse().find(m => score >= m.min) || dariLabels[0];
  if (feedbackPashtoEl) feedbackPashtoEl.textContent = dariMsg.dari;

  // v1.17C: meaning display — Pashto support only
  const meaning = zirakExtractMeaning(contentItem || {});
  const meaningEl = document.getElementById('score-meaning-area');
  if (meaningEl) {
    let html = '';
    if (meaning.pashto) {
      html += `<div class="score-meaning-pashto dari">${meaning.pashto}</div>`;
    }
    meaningEl.innerHTML = html;
    meaningEl.style.display = html ? 'block' : 'none';
  }

  // Word chip highlights
  const expectedWords = expectedNorm.split(/\s+/).filter(Boolean);
  const spokenWords   = spokenNorm.split(/\s+/).filter(Boolean);
  const hl = document.getElementById('word-highlights');
  if (hl) {
    hl.innerHTML = expectedWords.map(w =>
      `<span class="word-chip ${spokenWords.includes(w) ? 'correct' : 'missed'}">${escHtml(w)}</span>`
    ).join('');
  }

  // v1.13B: smooth scroll to result card
  zirakScrollToResult('score-display', 180);

  // v1.13B: speak teacher feedback after short delay (does not overlap prompt TTS)
  zirakSpeakFeedback(teacherMsg, FEEDBACK_SPEAK_DELAY_MS);
}

function nextStep() {
  const d = state.currentDialogue, raw = state.d19ActiveRaw, cc = _d19CC(), ctx = _d19StudentContext();
  if (!d || !raw || !cc || !ctx.ok) return;
  const turn = _d19CurrentTurn();
  const progress = cc.getDialogueProgressD19(ctx.student.studentId, raw.dialogueId);
  if (!turn || !progress || !progress.completedTurnIds.includes(turn.turnId)) {
    showToast('Complete the current response before moving to the next turn.');
    return;
  }
  if (state.currentStep < d.steps.length - 1) {
    state.currentStep++;
    state.d19ModelRevealed = false;
    state.d19ScoreMeta = null;
    state.d19ActiveAttemptId = null;
    cc.updateDialoguePositionD19({
      studentId:ctx.student.studentId, dialogueId:raw.dialogueId,
      activeTurnIndex:state.currentStep, turnId:raw.turns[state.currentStep].turnId
    });
    renderStep();
    return;
  }

  const eventId = ['d19-dialogue-complete',ctx.student.studentId,raw.dialogueId,raw.recordVersion || 'D19-1',progress.sessionId].join('::');
  const completed = cc.completeDialogueD19({
    studentId:ctx.student.studentId, dialogueId:raw.dialogueId, completionEventId:eventId
  });
  if (!completed || !completed.completedAt) {
    showToast('This Dialogue is not complete yet. Finish every governed turn first.');
    return;
  }

  // Preserve display data before the close path clears active runtime state.
  const completedDialogue = d;
  _d19InvalidateRuntime('completed');
  document.getElementById('replay-bar')?.classList.remove('visible');
  const list = document.getElementById('dialogue-topic-list'), area = document.getElementById('dialogue-practice-area');
  if (list) list.style.display = 'block';
  if (area) area.style.display = 'none';
  state.currentDialogue = null;
  state.d19ActiveRaw = null;
  state.d19ActiveProgress = completed;
  state.d19ModelRevealed = false;
  state.d19ActiveAttemptId = null;

  const dlgFinalMsgs = [
    'Well done. You completed the Dialogue. Review weak turns before the next session.',
    'Dialogue complete. Your route and turn evidence were saved.',
    'Session complete. Keep practising the weak turns and review again when due.'
  ];
  const dlgMsg = dlgFinalMsgs[(completedDialogue.dialogueId || '').length % dlgFinalMsgs.length];
  setTimeout(function() { speak(dlgMsg, 'en'); }, 500);
  showToast('✅ Dialogue complete. Candidate or Free Practice evidence was saved under its exact route.');
  generateProofCode(completedDialogue.titleEn, completedDialogue.level);
  _dlgShowCompletionCard(completedDialogue);
  renderDialogueTopics();
}

// I6H-B1 — Basic Dialogue completion result card: score, item-by-item
// review, weak steps, and the shared WhatsApp proof button (ZirakResultProof).
// Inserted above the dialogue topic list after closePractice(); dismissible;
// replaced on each new completion. No engine rewrite — display only.
function _dlgShowCompletionCard(d) {
  try {
    var listEl = document.getElementById('dialogue-topic-list');
    if (!listEl || !listEl.parentNode) return;
    var old = document.getElementById('dlg-completion-card');
    if (old) old.remove();

    // Keep only the LAST attempt per step (retryStep can re-score a step).
    var byStep = {};
    (state.dlgSessionScores || []).forEach(function (r) { byStep[r.step] = r; });
    var rows = Object.keys(byStep).map(function (k) { return byStep[k]; })
      .sort(function (a, b) { return a.step - b.step; });
    var total = (d.steps || []).length;
    var good  = rows.filter(function (r) { return r.score >= 60; }).length;
    var pct   = total ? Math.round((good / total) * 100) : 0;
    var weak  = rows.filter(function (r) { return r.score < 60; });

    var reviewHtml = rows.length ? rows.map(function (r) {
      var ok = r.score >= 60;
      return '<div class="dlg-sum-row ' + (ok ? 'dlg-sum-ok' : 'dlg-sum-bad') + '">' +
        '<div class="dlg-sum-q">' + (ok ? '\u2705' : '\u274C') + ' Step ' + (r.step + 1) + ' \u00b7 ' + r.score + '% \u2014 ' + _zrpEsc(r.expected) + '</div>' +
        (r.spoken ? '<div class="dlg-sum-said">You said: <em>' + _zrpEsc(String(r.spoken).slice(0, 100)) + '</em></div>' : '') +
      '</div>';
    }).join('') : '<div class="dlg-sum-said">No spoken steps were scored this session.</div>';

    var weakHtml = weak.length
      ? '<div class="dlg-sum-weak-lbl">\uD83D\uDD01 Practice these again (' + weak.length + '):</div>' +
        weak.map(function (r) { return '<div class="dlg-sum-said">\u2022 ' + _zrpEsc(r.expected) + '</div>'; }).join('')
      : '<div class="dlg-sum-noweak">\u2705 No weak steps. Great work!</div>';

    var card = document.createElement('div');
    card.id = 'dlg-completion-card';
    card.className = 'card dlg-complete-card';
    card.innerHTML =
      '<div class="dlg-sum-head">' +
        '<div class="dlg-sum-title">\uD83C\uDF89 Dialogue Complete \u2014 ' + _zrpEsc(d.titleEn || '') + '</div>' +
        '<button type="button" class="dlg-sum-close" aria-label="Dismiss">\u2715</button>' +
      '</div>' +
      '<div class="dlg-sum-score">' + good + ' / ' + total + ' steps spoken well (' + pct + '%)</div>' +
      reviewHtml + weakHtml +
      (window.ZirakResultProof
        ? window.ZirakResultProof.renderButtonHtml('Basic Dialogue: ' + (d.titleEn || ''), good, total, { source: 'dialogue', contentId: d.id })
        : '');
    listEl.parentNode.insertBefore(card, listEl);
    var closeBtn = card.querySelector('.dlg-sum-close');
    if (closeBtn) closeBtn.addEventListener('click', function () { card.remove(); });
    try { card.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e2) {}
  } catch (e) {}
}
// Tiny local escaper for the completion card.
function _zrpEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function retryStep() {
  document.getElementById('score-display')?.classList.remove('visible');
  const ai = document.getElementById('ai-feedback-area'); if (ai) ai.style.display = 'none';
  const transcript = document.getElementById('transcript-display'); if (transcript) transcript.textContent = '';
  resetMicBtn();
  state.transcript = '';
  state.d19ScoreMeta = null;
  state.d19ModelRevealed = false;
  const raw = state.d19ActiveRaw, answer = document.getElementById('dialogue-answer-en'), ps = document.getElementById('dialogue-answer-dari');
  if (raw && !_d19ModelVisibleBeforeResponse(raw)) {
    if (answer) answer.textContent = '';
    if (ps) { ps.textContent = ''; ps.hidden = true; }
    const reveal = document.getElementById('d19-reveal-model-btn'); if (reveal) { reveal.hidden = false; reveal.disabled = true; }
    const audio = document.getElementById('d19-model-audio-btn'); if (audio) audio.hidden = true;
  }
}

// ===== AI TUTOR =====
async function getAIFeedback(spoken, expected, step) {
  const area = document.getElementById('ai-feedback-area');
  const content = document.getElementById('ai-feedback-content');
  area.style.display = 'block';
  content.innerHTML = '<div class="ai-thinking"><span></span><span></span><span></span></div>';
  const prompt = `The student said: "${spoken}" but expected: "${expected}". Give: 1) A short score comment 2) One pronunciation tip 3) One encouragement. Respond ONLY as JSON: {"feedbackEn":"...","feedbackPashto":"...","tipEn":"...","tipPashto":"..."}. Pashto must be Afghan Pashto in Pashto script. Do not use Dari, Persian, or Farsi.`;
  try {
    const raw = await cohereCall([{ role: 'user', content: prompt }], 400);
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    content.innerHTML = `
      <div style="font-size:14px;margin-bottom:6px;">${parsed.feedbackEn || ''}</div>
      <div class="dari" style="font-size:14px;margin-bottom:8px;">${parsed.feedbackPashto || ''}</div>
      ${parsed.tipEn ? `<div style="font-size:12px;color:var(--text-muted);font-style:italic;">💡 ${parsed.tipEn}</div>` : ''}
      ${parsed.tipPashto ? `<div class="dari" style="font-size:12px;color:var(--text-muted);font-style:italic;">${parsed.tipPashto}</div>` : ''}
    `;
  } catch(e) {
    let errText = 'AI feedback unavailable offline.';
    if (e.message === 'NO_KEY') errText = 'AI key is not configured. Add your Cohere API key in Settings to use this feature.';
    else if (e.message === 'OFFLINE') errText = 'AI is unavailable offline. Connect to the internet and try again.';
    content.innerHTML = `<div style="font-size:13px;color:var(--text-muted);">${errText}</div>`;
  }
}

function speak(text, lang='en') {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  document.querySelectorAll('.speak-btn.speaking').forEach(b => b.classList.remove('speaking'));
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === 'en' ? 'en-US' : 'ps-AF';
  utter.rate = state.speechRate;
  utter.onend = () => document.querySelectorAll('.speak-btn.speaking').forEach(b => b.classList.remove('speaking'));
  window.speechSynthesis.speak(utter);
}

// ===================================================================
// PHASE: Teaching Display & Voice Professionalization Fix
// Global "Stop Reading" button — appears automatically whenever ANY
// speechSynthesis utterance is playing anywhere in the app (Home
// welcome, Review summary, wizard/session summaries, Quick Practice
// feedback, Word Wizard, Interview Wizard, Listening Room, etc.).
// Implemented as a single wrap of the native speechSynthesis.speak()
// and .cancel() methods, so every existing and future TTS call site
// gets the button for free — no per-page button code needed, and no
// existing onend/onerror handler is removed (they are chained, not
// replaced), so this never breaks existing TTS-driven flows.
// ===================================================================
(function () {
  var activeCount = 0;
  function ensureBtn() {
    var btn = document.getElementById('zirak-stop-reading-btn');
    if (btn) return btn;
    btn = document.createElement('button');
    btn.id = 'zirak-stop-reading-btn';
    btn.type = 'button';
    btn.className = 'zirak-stop-reading-btn';
    btn.innerHTML = '⏹ Stop Reading';
    btn.setAttribute('aria-label', 'Stop reading aloud');
    btn.onclick = function () {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    };
    (document.body || document.documentElement).appendChild(btn);
    return btn;
  }
  function showBtn() { ensureBtn().classList.add('visible'); }
  function hideBtn() {
    var b = document.getElementById('zirak-stop-reading-btn');
    if (b) b.classList.remove('visible');
  }

  // PHASE I6A5B — Part 10: a small registry so ANY page's chained/multi-
  // step reading system (Grammar World's section-by-section reader,
  // Interview Wizard's sentence-by-sentence sample reader, etc.) can
  // register a "cancel me" callback that fires whenever speech is
  // stopped from ANYWHERE — including the GLOBAL floating Stop Reading
  // button below, which calls speechSynthesis.cancel() directly and
  // does NOT know about any individual page's own stop function. This
  // is what guarantees a stale chain can never keep advancing after the
  // student taps Stop, regardless of which specific button they tapped.
  window.__zirakChainCancelers = window.__zirakChainCancelers || [];
  window.zirakRegisterChainCanceler = function (fn) {
    if (typeof fn === 'function') window.__zirakChainCancelers.push(fn);
  };
  window.zirakCancelAllChains = function () {
    window.__zirakChainCancelers.forEach(function (fn) { try { fn(); } catch (e) {} });
  };

  if (window.speechSynthesis && !window.speechSynthesis.__zirakStopBtnWrapped) {
    var origSpeak  = window.speechSynthesis.speak.bind(window.speechSynthesis);
    var origCancel = window.speechSynthesis.cancel.bind(window.speechSynthesis);

    window.speechSynthesis.speak = function (utter) {
      activeCount++;
      showBtn();
      var origOnEnd = utter.onend, origOnErr = utter.onerror;
      utter.onend = function (e) {
        activeCount = Math.max(0, activeCount - 1);
        if (activeCount === 0) hideBtn();
        if (typeof origOnEnd === 'function') origOnEnd.call(this, e);
      };
      utter.onerror = function (e) {
        activeCount = Math.max(0, activeCount - 1);
        if (activeCount === 0) hideBtn();
        if (typeof origOnErr === 'function') origOnErr.call(this, e);
      };
      return origSpeak(utter);
    };

    window.speechSynthesis.cancel = function () {
      activeCount = 0;
      hideBtn();
      window.zirakCancelAllChains();
      return origCancel();
    };

    window.speechSynthesis.__zirakStopBtnWrapped = true;
  }

  // Small helper other files can call: window.zirakActiveStudentName()
  // Thin, defensive wrapper over pashto-display-shell.js's
  // window.zirakActiveStudentInfo(), kept here too so app.js's own
  // functions don't need to know which file defines it. Always safe —
  // never throws, never returns undefined.
  window.zirakActiveStudentName = function () {
    try {
      if (typeof window.zirakActiveStudentInfo === 'function') {
        return window.zirakActiveStudentInfo();
      }
    } catch (e) {}
    return { hasStudent:false, fullName:'', firstName:'Student', title:'', greetName:'Student' };
  };

  // ===================================================================
  // PHASE I6A5B — Part 3: shared, safe scroll-into-view helper.
  // Used by Interview Wizard (transcript/sample/feedback), Quick
  // Practice (feedback), and available to Grammar World too — one
  // implementation so scroll timing/centering behaves consistently
  // everywhere instead of each file inventing slightly different logic.
  // ===================================================================
  window.scrollLearningElementIntoView = function (el, options) {
    if (!el) return;
    var opts = options || {};
    var delay = (typeof opts.delay === 'number') ? opts.delay : 60; // let the DOM paint first
    var block = opts.block || 'center';
    setTimeout(function () {
      try { el.scrollIntoView({ behavior: 'smooth', block: block }); }
      catch (e) { try { el.scrollIntoView(); } catch (e2) {} } // older-browser fallback
    }, delay);
  };

  // ===================================================================
  // PHASE I6A5B — Part 5/6/8/9/10: shared sentence/section-chained TTS
  // reader. One implementation reused by Interview Wizard's sample-
  // answer reading and Grammar World's Read Full Lesson (Quick Practice
  // reuses it where safe), so all three behave identically and Stop
  // Reading works the same way everywhere — per the "do not create a
  // second TTS system" rule.
  //
  // segments: [{ text, ...caller-defined fields }]
  // opts.onSegmentStart(seg, index) — caller highlights/scrolls here
  // opts.onSegmentEnd(seg, index)   — caller clears highlight here
  // opts.onAllDone()                — chain finished normally
  // opts.pauseMs                    — pause between segments (default 350ms,
  //                                    "calm not rushed" per Part 9)
  //
  // Uses the SAVED voice speed (window.state.speechRate, now correctly
  // wired everywhere after the Part 6 fix) unless the caller overrides
  // via opts.rate. Includes an Android-safe timeout fallback: some
  // browsers do not reliably fire onend/onerror after certain
  // interrupt/cancel sequences, so each segment also arms a generous,
  // text-length-based timer that advances the chain anyway if neither
  // callback fires — this keeps the chain from getting permanently
  // stuck without ever racing ahead of NORMAL speech (the timer is long
  // enough that it only ever matters as a true fallback).
  // ===================================================================
  var __zirakChainSession = 0;
  window.zirakSpeakChain = function (segments, opts) {
    opts = opts || {};
    var mySession = ++__zirakChainSession;
    var rate = (typeof opts.rate === 'number') ? opts.rate
      : ((window.state && window.state.speechRate) ? window.state.speechRate : 0.85);
    var pauseMs = (typeof opts.pauseMs === 'number') ? opts.pauseMs : 350;
    var i = 0;

    function isCurrent() { return mySession === __zirakChainSession; }

    function finish() { if (isCurrent() && typeof opts.onAllDone === 'function') { try { opts.onAllDone(); } catch (e) {} } }

    function next() {
      if (!isCurrent()) return;
      if (i >= segments.length) { finish(); return; }
      var seg = segments[i]; var idx = i; i++;
      if (typeof opts.onSegmentStart === 'function') { try { opts.onSegmentStart(seg, idx); } catch (e) {} }
      var text = (seg.text || '').trim();
      if (!text) { setTimeout(next, 10); return; }

      var advanced = false;
      function advance() {
        if (advanced || !isCurrent()) return;
        advanced = true;
        if (typeof opts.onSegmentEnd === 'function') { try { opts.onSegmentEnd(seg, idx); } catch (e) {} }
        setTimeout(next, pauseMs);
      }

      try {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = rate;
        u.onend = function () { advance(); };
        u.onerror = function () { advance(); };
        window.speechSynthesis.speak(u);
        // Android-safe fallback (Part 8/10) — see header comment above.
        var estMs = Math.max(1500, Math.round((text.length / 12) * 1000 / Math.max(rate, 0.5)) + 800);
        setTimeout(function () { advance(); }, estMs);
      } catch (e) { advance(); }
    }

    next();

    var stopFn = function () {
      if (mySession === __zirakChainSession) __zirakChainSession++;
      if (typeof opts.onSegmentEnd === 'function' && i > 0 && i <= segments.length) {
        try { opts.onSegmentEnd(segments[i - 1], i - 1); } catch (e) {}
      }
    };
    // Register with the global cancel() hook (Part 10) so the floating
    // Stop Reading button — which calls speechSynthesis.cancel()
    // directly and knows nothing about this specific chain — still
    // halts it correctly.
    if (typeof window.zirakRegisterChainCanceler === 'function') {
      window.zirakRegisterChainCanceler(function () { if (mySession === __zirakChainSession) stopFn(); });
    }
    return stopFn;
  };

  // PHASE I6A5B — Part 5: safe English sentence splitter for the
  // chained sample/feedback reader. Deliberately simple (split on
  // ./!/? followed by a space or end-of-string) — good enough for the
  // short, plain teaching sentences used in this app, and never throws
  // on unusual input. Never touches Pashto text or content banks.
  window.zirakSplitSentences = function (text) {
    var t = String(text || '').trim();
    if (!t) return [];
    var parts = t.match(/[^.!?]+[.!?]*(\s+|$)/g);
    if (!parts) return [t];
    return parts.map(function (s) { return s.trim(); }).filter(Boolean);
  };
})();

// ===== TOPIC STUDIO =====
function renderTopics() {
  const topicList = document.getElementById('topics-list');
  if (!topicList) return;
  topicList.innerHTML = TOPIC_STUDIO_DATA.map(t => `
    <div class="card" style="cursor:pointer;" onclick="openTopicWizard('${t.id}')">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:16px;font-weight:800;">${t.titleEn}</div>
          <div class="dari" style="font-size:15px;">${t.titlePashto}</div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <span class="badge badge-lapis">${LEVELS.find(l=>l.id===t.level)?.en||t.level}</span>
            <span class="badge badge-gold">${t.paragraphs.length} paragraphs</span>
          </div>
        </div>
        <span style="font-size:24px;">📝</span>
      </div>
    </div>
  `).join('');
}

function openTopicWizard(id) {
  const topic = TOPIC_STUDIO_DATA.find(t => t.id === id);
  if (!topic) return;
  state.currentTopic = topic;
  document.getElementById('topics-list').style.display = 'none';
  document.getElementById('topic-wizard-area').style.display = 'block';
  document.getElementById('topic-wizard-title').textContent = topic.titleEn;
  document.getElementById('topic-wizard-title-dari').textContent = topic.titlePashto;
  const grid = document.getElementById('wizard-modes-grid');
  grid.innerHTML = WIZARD_MODES.map(m => `
    <div class="mode-card" onclick="startTopicWizard('${m.id}')">
      <span class="mc-icon">${m.icon}</span>
      <span class="mc-en">${m.en}</span>
      <span class="mc-dari dari">${m.dari}</span>
    </div>
  `).join('');
}

function closeTopicWizard() {
  // v1.10B: stop TTS, mic, timers before closing
  window.speechSynthesis.cancel();
  closePracticeEngine();
  document.getElementById('topics-list').style.display = 'block';
  document.getElementById('topic-wizard-area').style.display = 'none';
  state.currentTopic = null;
}

// startTopicWizard — see Practice Engine section below (Phase 5)

function completeTopic() {
  saveToHistory({ type:'topic', topic:state.currentTopic.titleEn, score:100, mode:state.mode, date:new Date().toISOString() });
  checkAndAwardBadges();
  awardMilestone('first-practice');
  showToast('✅ Topic completed! / موضوع بشپړ شو!');
  renderProgressRings();
}

// ===== STORIES =====
function renderStories() {
  const grid = document.getElementById('stories-grid');
  if (!grid) return;
  grid.innerHTML = STORIES.map(s => `
    <div class="card" onclick="openStory('${s.id}')">
      <div class="story-card">
        <div class="story-cover" style="background:${s.color};">${s.icon}</div>
        <div class="story-info">
          <div class="story-title-en">${s.titleEn}</div>
          <div class="story-title-dari dari">${s.titlePashto}</div>
          <div class="story-meta">
            <span class="badge badge-lapis">${LEVELS.find(l=>l.id===s.level)?.en||s.level}</span>
            <span class="badge badge-gold">⏱ ${s.time}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function openStory(id) {
  state.currentStory = STORIES.find(s => s.id === id);
  if (!state.currentStory) return;
  document.getElementById('story-list-view').style.display = 'none';
  document.getElementById('story-reader-view').style.display = 'block';
  setStoryMode('read');
}

function closeStory() {
  // v1.10B: stop TTS, mic before closing
  window.speechSynthesis.cancel();
  closePracticeEngine();
  document.getElementById('story-list-view').style.display = 'block';
  document.getElementById('story-reader-view').style.display = 'none';
}

function setStoryMode(mode) {
  state.storyMode = mode;
  const story = state.currentStory;
  const area = document.getElementById('story-content-area');
  ['read','listen'].forEach(m => {
    const btn = document.getElementById('story-'+m+'-btn');
    if (btn) btn.classList.toggle('btn-primary', m===mode);
  });
  if (mode === 'read') {
    area.innerHTML = `<div style="padding:0 16px;">
      <h2 style="font-size:20px;margin-bottom:4px;">${story.titleEn}</h2>
      <div class="dari" style="font-size:18px;margin-bottom:16px;">${story.titlePashto}</div>
      ${story.paragraphs.map(p=>`
        <div class="card-inner" style="margin-bottom:12px;">
          <div class="bilingual-block">
            <div class="en-text">${p.en}</div>
            ${renderPashtoLine(getPashtoText(p, 'paragraph'), 'dari-text', { mode:'story' })}
          </div>
        </div>
      `).join('')}
    </div>`;
  } else if (mode === 'listen') {
    area.innerHTML = `<div style="padding:0 16px;">
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
        <button class="btn btn-primary" onclick="playStory()">▶️ Play Story</button>
        <button class="btn btn-outline btn-sm" onclick="window.speechSynthesis.cancel()">⏹ Stop</button>
        <button class="btn btn-emerald btn-sm" onclick="startStoryPractice()">⚡ Practice After</button>
      </div>
      ${story.paragraphs.map(p=>`
        <div class="card-inner" style="margin-bottom:10px;">
          <div class="bilingual-block">
            <div class="en-text">${p.en}</div>
            ${renderPashtoLine(getPashtoText(p, 'paragraph'), 'dari-text', { mode:'story' })}
          </div>
        </div>
      `).join('')}
    </div>`;
  }
}

function playStory() {
  const texts = state.currentStory.paragraphs.map(p => p.en).join('. ');
  speak(texts, 'en');
}

// ===== WORD LAB =====
function initWordLab() {
  // Word of the day — data still loaded for bookmarkWord() and practiceWotd() compatibility
  const dayIdx = Math.floor(Date.now() / 86400000) % WORD_OF_DAY.length;
  const wotd = WORD_OF_DAY[dayIdx];
  // Elements are now in a hidden container — still set them so hearWord/bookmarkWord work
  const elEn = document.getElementById('wotd-en');
  const elPashto = document.getElementById('wotd-dari');
  const elPos = document.getElementById('wotd-pos');
  const elExEn = document.getElementById('wotd-en-example');
  const elExPashto = document.getElementById('wotd-dari-example');
  if (elEn) elEn.textContent = wotd.en;
  if (elPashto) elPashto.textContent = wotd.dari;
  if (elPos) elPos.textContent = wotd.pos;
  if (elExEn) elExEn.textContent = wotd.ex_en;
  if (elExPashto) elExPashto.textContent = wotd.ex_dari;
  // Word sets grid
  const grid = document.getElementById('wordset-grid');
  grid.innerHTML = Object.entries(WORD_SETS).map(([key, ws]) => {
    const mc = getMasteredCountForSet(key);
    return `
    <div class="wordset-card" onclick="openWordSetWithPractice('${key}')">
      <span class="wordset-icon">${ws.icon}</span>
      <span class="wordset-en">${ws.en}</span>
      <span class="wordset-dari dari">${ws.dari}</span>
      <span class="badge badge-lapis" style="margin-top:4px;">${ws.words.length} words</span>
      <span class="wordset-mastery-count">${mc.mastered} / ${mc.total} mastered</span>
    </div>
  `}).join('');
  // FC & quiz set pills
  const pills = Object.entries(WORD_SETS).map(([k,ws]) => `<button class="pill" onclick="startFlashcards('${k}')">${ws.icon} ${ws.en}</button>`).join('');
  document.getElementById('fc-set-pills').innerHTML = pills;
  const qpills = Object.entries(WORD_SETS).map(([k,ws]) => `<button class="pill" onclick="startQuiz('${k}')">${ws.icon} ${ws.en}</button>`).join('');
  document.getElementById('quiz-set-pills').innerHTML = qpills;
  // v1.10A: Word Wizard set pills (hidden tab — kept for startWordWizard() compatibility)
  renderWordWizardSetPicker();
  // v1.10E: Populate overlay set pills
  renderWordWizardOverlayPicker();
  renderSavedWords();
  // v1.11C: Smart Review button
  renderSmartReviewButton();
  // v1.11E: Sentence Practice pills
  renderSentencePracticePills();
}

function openWordSet(key) {
  const ws = WORD_SETS[key];
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:300;display:flex;align-items:flex-end;';
  modal.innerHTML = `<div style="background:var(--bg-card);border-radius:20px 20px 0 0;width:100%;max-width:640px;margin:0 auto;padding:20px;max-height:80vh;overflow-y:auto;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <div><div style="font-size:18px;font-weight:800;">${ws.icon} ${ws.en}</div><div class="dari" style="font-size:16px;">${ws.dari}</div></div>
      <button onclick="this.closest('[style]').remove()" style="background:var(--border);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;">✕</button>
    </div>
    ${ws.words.map(w=>`<div style="padding:10px 0;border-bottom:1px solid var(--divider);">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:17px;font-weight:700;">${w.en}</div>
        <div class="dari" style="font-size:17px;">${w.dari}</div>
      </div>
      <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">${w.ex_en}</div>
      <div class="dari" style="font-size:13px;color:var(--text-muted);">${w.ex_dari}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:6px;" onclick="speak('${w.en}','en')">🔊</button>
    </div>`).join('')}
  </div>`;
  modal.onclick = e => { if(e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}

function showWordTab(tab) {
  // v1.10F: 'flashcard' and 'wizard' tab pills removed from DOM; backing divs kept for compat
  ['sets','flashcard','quiz','wizard','saved'].forEach(t => {
    const el = document.getElementById('wordtab-'+t);
    if (el) el.style.display = t===tab ? 'block' : 'none';
    const pill = document.getElementById('tab-'+t);
    if (pill) pill.classList.toggle('active', t===tab);
  });
  if (tab === 'wizard') renderWordWizardSetPicker();
}

function hearWord() {
  const en = document.getElementById('wotd-en').textContent;
  speak(en, 'en');
}

function hearExample() {
  const example = document.getElementById('wotd-en-example')?.textContent || '';
  speak(example, 'en');
}

function bookmarkWord() {
  const dayIdx = Math.floor(Date.now() / 86400000) % WORD_OF_DAY.length;
  const wotd = WORD_OF_DAY[dayIdx];
  if (!state.bookmarks.includes(wotd.en)) {
    state.bookmarks.push(wotd.en);
    save('word_bookmarks', state.bookmarks);
    awardMilestone('words-10');
    showToast('🔖 Word saved! / کلیمه خوندي شوه!');
  }
}

function startFlashcards(setKey) {
  const ws = WORD_SETS[setKey];
  state.currentFlashSet = ws.words;
  state.flashIndex = 0;
  document.getElementById('flashcard-set-selector').style.display = 'none';
  document.getElementById('flashcard-container').style.display = 'block';
  renderFlashcard();
}

function renderFlashcard() {
  const words = state.currentFlashSet;
  if (!words || state.flashIndex >= words.length) {
    document.getElementById('flashcard-set-selector').style.display = 'block';
    document.getElementById('flashcard-container').style.display = 'none';
    showToast('🎉 Set complete! / ټولګه بشپړه شوه!');
    return;
  }
  const w = words[state.flashIndex];
  const fc = document.getElementById('flashcard');
  fc.classList.remove('flipped');
  document.getElementById('fc-front').textContent = w.en;
  document.getElementById('fc-back-dari').textContent = w.dari;
  document.getElementById('fc-back-en').textContent = w.en;
  document.getElementById('fc-back-example').textContent = w.ex_en;
  document.getElementById('fc-progress').textContent = `Card ${state.flashIndex+1} of ${words.length}`;
}

function flipCard() {
  document.getElementById('flashcard').classList.toggle('flipped');
}

function rateCard(rating) {
  state.flashIndex++;
  renderFlashcard();
}

// ===== WORD QUIZ v1.10G — SPOKEN LEARNING QUIZ ENGINE =====
// Four question types: dari→english, english→dari, listening, sentence-context.
// Spoken instructions in English only. Pashto support is shown visually, never spoken automatically.

let wqState = {
  setKey: null,
  questions: [],
  index: 0,
  correct: 0,
  wrong: 0,
  weakItems: [],   // { word, dari, type, question } for each wrong answer
  isRetry: false,
  prevWeakCount: 0
};

// Keep legacy var for compat with other code that reads currentQuizSet
// (declared at top of state section; do not redeclare)

function startQuiz(setKey) {
  currentQuizSet = setKey;
  state.currentQuizSet = setKey;
  wqState.setKey = setKey;
  wqState.isRetry = false;
  wqState.prevWeakCount = 0;
  wqBuild(setKey, null);
  document.getElementById('quiz-set-selector').style.display = 'none';
  document.getElementById('quiz-area').style.display = 'block';
}

function wqStartRetry() {
  // Build a new quiz using only the weak items from the last run
  const weak = wqState.weakItems.slice();
  if (!weak.length) return;
  const setKey = wqState.setKey;
  wqState.prevWeakCount = weak.length;
  wqState.isRetry = true;
  document.getElementById('quiz-area').innerHTML = '';
  document.getElementById('quiz-area').style.display = 'block';
  document.getElementById('quiz-set-selector').style.display = 'none';
  // Build questions only from weak items
  wqBuildFromItems(setKey, weak);
}

function wqBuild(setKey, limitItems) {
  const ws = WORD_SETS[setKey];
  if (!ws) return;
  const pool = limitItems || ws.words.slice();
  const total = Math.min(pool.length, 10);
  const chosen = pool.slice().sort(() => Math.random()-0.5).slice(0, total);
  const allWords = ws.words;
  const questions = [];

  chosen.forEach((word, i) => {
    // Determine available question types for this word
    const types = [1, 2, 3]; // always available
    if (word.ex_en) types.push(4);
    const t = types[i % types.length];
    questions.push(wqBuildQuestion(word, t, allWords));
  });

  wqState.questions = questions;
  wqState.index = 0;
  wqState.correct = 0;
  wqState.wrong = 0;
  wqState.weakItems = [];
  wqRenderQuestion();
}

function wqBuildFromItems(setKey, weakItems) {
  const ws = WORD_SETS[setKey];
  if (!ws) return;
  const allWords = ws.words;
  const questions = [];
  weakItems.forEach((wi, i) => {
    const word = allWords.find(w => w.en === wi.word) || allWords[0];
    if (!word) return;
    const types = [1, 2, 3];
    if (word.ex_en) types.push(4);
    const t = types[i % types.length];
    questions.push(wqBuildQuestion(word, t, allWords));
  });
  wqState.questions = questions;
  wqState.index = 0;
  wqState.correct = 0;
  wqState.wrong = 0;
  wqState.weakItems = [];
  wqRenderQuestion();
}

function wqBuildQuestion(word, type, allWords) {
  // Generate 3 wrong options
  const wrongs = allWords.filter(w => w.id !== word.id).sort(() => Math.random()-0.5).slice(0, 3);
  const opts4 = [...wrongs, word].sort(() => Math.random()-0.5);
  return { word, type, opts: opts4 };
}

function wqRenderQuestion() {
  const area = document.getElementById('quiz-area');
  if (!area) return;
  const total = wqState.questions.length;
  if (wqState.index >= total) {
    wqShowResult();
    return;
  }
  const q = wqState.questions[wqState.index];
  const qNum = wqState.index + 1;
  const word = q.word;
  const type = q.type;

  // Build instruction and prompt
  let instruction = '';
  let promptHTML = '';
  let optionHTML = '';
  let typeLabel = '';

  if (type === 1) {
    // Pashto shown → choose English
    typeLabel = 'Pashto → English';
    instruction = 'What is the meaning of this word? Choose the correct answer below.';
    promptHTML = `<div class="dari" style="font-size:34px;font-weight:900;text-align:center;padding:14px 0;">${escHtml(word.dari)}</div>`;
    optionHTML = q.opts.map(o =>
      `<button class="quiz-opt-btn" data-id="${escHtml(o.id)}" data-correct="${escHtml(word.id)}" onclick="wqAnswer(this)">${escHtml(o.en)}</button>`
    ).join('');
  } else if (type === 2) {
    // English shown → choose Pashto
    typeLabel = 'English → Pashto';
    instruction = 'What is the meaning of this word? Choose the correct answer below.';
    promptHTML = `<div style="font-size:32px;font-weight:900;text-align:center;padding:14px 0;color: var(--lapis-text);">${escHtml(word.en)}</div>`;
    optionHTML = q.opts.map(o =>
      `<button class="quiz-opt-btn dari" data-id="${escHtml(o.id)}" data-correct="${escHtml(word.id)}" onclick="wqAnswer(this)" style="font-size:17px;">${escHtml(o.dari)}</button>`
    ).join('');
  } else if (type === 3) {
    // Listening — speak English, choose English
    typeLabel = 'Listening';
    instruction = 'Listen carefully and choose the word you heard.';
    promptHTML = `<div style="text-align:center;padding:10px 0;">
      <button class="btn btn-outline btn-sm" onclick="wqSpeak('${escHtml(word.en)}')" style="font-size:14px;">🔊 Play word</button>
    </div>`;
    optionHTML = q.opts.map(o =>
      `<button class="quiz-opt-btn" data-id="${escHtml(o.id)}" data-correct="${escHtml(word.id)}" onclick="wqAnswer(this)">${escHtml(o.en)}</button>`
    ).join('');
  } else {
    // Type 4 — Sentence context
    typeLabel = 'Sentence Context';
    instruction = 'Read the sentence. What does the highlighted word mean? Choose the correct answer below.';
    const ex = word.ex_en || '';
    // Highlight the target word in the sentence (case-insensitive)
    const highlighted = ex.replace(
      new RegExp('\\b' + word.en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b', 'gi'),
      m => `<strong style="color: var(--lapis-text);border-bottom:2px solid var(--gold);">${m}</strong>`
    );
    promptHTML = `<div style="font-size:15px;line-height:1.7;padding:10px 0;text-align:center;">${highlighted}</div>`;
    optionHTML = q.opts.map(o =>
      `<button class="quiz-opt-btn dari" data-id="${escHtml(o.id)}" data-correct="${escHtml(word.id)}" onclick="wqAnswer(this)" style="font-size:17px;">${escHtml(o.dari)}</button>`
    ).join('');
  }

  area.innerHTML = `
    <div class="card" style="margin:0 16px 12px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div class="badge badge-lapis">Q ${qNum} of ${total}</div>
        <div class="badge badge-gold" style="font-size:10px;">${typeLabel}</div>
      </div>
      <div style="background:var(--border);height:3px;border-radius:3px;margin-bottom:12px;">
        <div style="background:var(--lapis);height:3px;border-radius:3px;width:${Math.round((wqState.index/total)*100)}%;transition:width 0.3s;"></div>
      </div>
      <div style="font-size:14px;color:var(--text-muted);text-align:center;margin-bottom:4px;">${escHtml(instruction)}</div>
      ${promptHTML}
      <div id="wq-feedback" style="min-height:24px;"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 16px 16px;">
      ${optionHTML}
    </div>
  `;

  // Speak instruction after brief delay (do not speak Pashto support text)
  // v1.10G2 TASK 6: onend/onerror must be assigned BEFORE speak() so they are guaranteed to fire.
  // For listening type: instruction first, then target word, no overlap.
  window.speechSynthesis.cancel();
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(instruction);
    u.lang = 'en-US'; u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; u.volume = 1.0;
    if (type === 3) {
      // Assign onend BEFORE speak so handler is always registered in time
      let instrDone = false;
      function playTarget() {
        if (instrDone) return;
        instrDone = true;
        clearTimeout(instrFallback);
        setTimeout(() => wqSpeak(word.en), 400);
      }
      const instrFallback = setTimeout(playTarget, 4500);
      u.onend   = playTarget;
      u.onerror = playTarget;
    }
    window.speechSynthesis.speak(u);
  }, 300);
}

function wqSpeak(text) {
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; u.volume = 1.0;
  window.speechSynthesis.speak(u);
}

function wqAnswer(btn) {
  const answeredId = btn.getAttribute('data-id');
  const correctId  = btn.getAttribute('data-correct');
  const isCorrect  = answeredId === correctId;
  const q = wqState.questions[wqState.index];
  const word = q.word;

  // Disable all buttons
  const btns = btn.closest('[style]') ? btn.parentElement.querySelectorAll('.quiz-opt-btn') :
    document.querySelectorAll('.quiz-opt-btn');
  btns.forEach(b => {
    b.onclick = null;
    if (b.getAttribute('data-id') === correctId) b.classList.add('correct-ans');
    else if (b.getAttribute('data-id') === answeredId && !isCorrect) b.classList.add('wrong-ans');
    b.style.pointerEvents = 'none';
  });

  // Track results
  if (isCorrect) {
    wqState.correct++;
  } else {
    wqState.wrong++;
    wqState.weakItems.push({ word: word.en, dari: word.dari, type: q.type });
  }

  // v1.11B: Update word mastery level
  if (word && word.id) {
    updateWordMastery(word.id, isCorrect, 'quiz');
  }
  // v1.11B: Update daily streak
  updateStreak();

  // Feedback text + speech — v1.11D1: use FEEDBACK_BANK for varied responses
  let feedbackText = '';
  let feedbackColor = '';
  if (isCorrect) {
    feedbackText = _fbPick(FEEDBACK_BANK.quiz.correct);
    feedbackColor = 'var(--emerald)';
  } else {
    feedbackText = _fbPick(FEEDBACK_BANK.quiz.wrong);
    feedbackColor = 'var(--red)';
  }

  const fbEl = document.getElementById('wq-feedback');
  if (fbEl) {
    fbEl.innerHTML = `<div style="text-align:center;font-size:13px;font-weight:700;color:${feedbackColor};padding:4px 0;">${isCorrect ? '✅' : '❌'} ${escHtml(feedbackText)}</div>`;
  }

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(feedbackText);
  u.lang = 'en-US'; u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; u.volume = 1.0;

  // I6H-C1 FIX: Patience — wait for TTS to fully end, then 1000ms more.
  // Fallback 4500ms covers slow TTS engines. Guard flag prevents double-advance.
  let wqAdvanced = false;
  function wqAdvance() {
    if (wqAdvanced) return;
    wqAdvanced = true;
    clearTimeout(wqFallback);
    wqState.index++;
    wqRenderQuestion();
  }
  // Extend spoken text so wrong answers hear the correct answer aloud.
  if (!isCorrect && word) {
    var correctBtn = document.querySelector('.quiz-opt-btn.correct-ans');
    var correctLabel = correctBtn ? correctBtn.textContent.trim() : (word.ps || word.en || '');
    u.text = feedbackText + '. The correct answer is: ' + correctLabel;
  }
  // Fallback: 4500ms (generous — covers slow devices + long feedback).
  const wqFallback = setTimeout(wqAdvance, 4500);
  u.onend   = () => setTimeout(wqAdvance, 1000);   // I6H-C1: 1000ms patience after TTS
  u.onerror = () => setTimeout(wqAdvance, 1800);   // I6H-C1: 1800ms visual fallback
  window.speechSynthesis.speak(u);
}

function wqShowResult() {
  const isSmartReview = wqState.setKey === '__smart__';
  const ws = isSmartReview ? null : WORD_SETS[wqState.setKey];
  const total = wqState.questions.length;
  const pct = total > 0 ? Math.round((wqState.correct / total) * 100) : 0;
  const passed = pct >= 70;
  const isRetry = wqState.isRetry;
  let sectionLabel, sessionTitle;
  if (isSmartReview) {
    sectionLabel = isRetry ? 'Smart Review Retry' : 'Smart Review';
    sessionTitle = 'Smart Review — ' + total + ' word' + (total !== 1 ? 's' : '');
  } else {
    sectionLabel = isRetry ? 'Word Quiz Retry' : 'Word Quiz';
    sessionTitle = (ws ? ws.en : '') + ' — ' + sectionLabel;
  }

  saveToHistory({ type: 'quiz', topic: isSmartReview ? 'Smart Review' : (ws ? ws.en : ''), score: pct, mode: isRetry ? 'retry' : (state.mode || 'en'), date: new Date().toISOString() });
  // I6H-C: Learning Ledger record (final quiz result only)
  try {
    if (window.ZirakLearningLedger) {
      window.ZirakLearningLedger.recordActivity({
        source: 'quiz', sectionTitle: sessionTitle,
        good: wqState.correct, total: total, pct: pct,
        activityType: 'word-quiz',
        contentId: wqState.setKey // I6H-D13B (Task 9): '__smart__' for Smart Review, the real word-set key otherwise
      });
    }
  } catch (eLlg) {}
  checkAndAwardBadges();
  // Update legacy state for history compat
  state.quizScore = wqState.correct;
  state.quizStreak = 0;

  // v1.11D1: Varied spoken final feedback using FEEDBACK_BANK + parent guidance
  window.speechSynthesis.cancel();
  let spokenResult = '';
  if (isRetry) {
    spokenResult = passed
      ? _fbPick(FEEDBACK_BANK.quiz.result_pass)
      : _fbPick(FEEDBACK_BANK.quiz.result_fail);
  } else {
    const baseMsg = passed
      ? _fbPick(FEEDBACK_BANK.final.pass).replace('{score}', pct)
      : _fbPick(FEEDBACK_BANK.final.fail).replace('{score}', pct);
    spokenResult = baseMsg + ' ' + FEEDBACK_BANK.final.parent_guidance;
  }
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(spokenResult);
    u.lang = 'en-US'; u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }, 400);

  const area = document.getElementById('quiz-area');
  if (!area) return;
  area.innerHTML = `<div id="wq-result-inner" style="padding:0;"></div>`;
  const inner = document.getElementById('wq-result-inner');

  // v1.11D1: Scroll quiz result into view
  setTimeout(() => {
    const quizArea = document.getElementById('quiz-area');
    if (quizArea) quizArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);

  // Build retry WhatsApp extra fields if needed
  const weakWords = wqState.weakItems.map(wi => wi.word);
  const retryNote = isRetry
    ? `Retry of ${wqState.prevWeakCount} weak items. Corrected: ${wqState.correct}/${total}.${weakWords.length ? ' Remaining weak: ' + weakWords.join(', ') : ' All corrected!'}`
    : null;

  // Build professional result card
  const proCard = buildProResultCard({
    score: pct,
    sessionTitle: sessionTitle,
    sectionType: sectionLabel,
    missedWords: weakWords,
    extraWords: [],
    sessionDetails: `${wqState.correct} correct / ${wqState.wrong} wrong out of ${total}`,
    onPracticeAgain: function() {
      window.speechSynthesis.cancel();
      if (isSmartReview) {
        startSmartReview();
      } else {
        document.getElementById('quiz-set-selector').style.display = 'none';
        document.getElementById('quiz-area').style.display = 'block';
        startQuiz(wqState.setKey);
      }
    },
    onContinue: function() {
      window.speechSynthesis.cancel();
      showWordTab('sets');
    }
  });
  inner.appendChild(proCard);

  // v1.11C: Smart Review improvement message
  if (isSmartReview && !isRetry) {
    const msgEl = document.createElement('div');
    msgEl.style.cssText = 'margin:0 16px 12px;font-size:13px;color:var(--text-muted);background:var(--bg-card2);border-radius:8px;padding:8px 12px;text-align:center;';
    msgEl.textContent = weakWords.length > 0
      ? 'Keep reviewing these words tomorrow.'
      : 'Great session. Your weak words are improving.';
    inner.appendChild(msgEl);
  }

  // Append Retry Weak Items Only button if there are weak items
  const retryFn = isSmartReview ? 'wqRetrySmartReview()' : 'wqStartRetry()';
  if (wqState.weakItems.length > 0 && !passed) {
    const retryBtnWrap = document.createElement('div');
    retryBtnWrap.style.cssText = 'padding:0 16px 16px;';
    retryBtnWrap.innerHTML = `<button class="btn btn-gold btn-full" style="margin-top:0;" onclick="${retryFn}">🔁 Retry Weak Items Only (${wqState.weakItems.length})</button>`;
    inner.appendChild(retryBtnWrap);
  } else if (wqState.weakItems.length > 0 && passed) {
    // Passed but had some wrong — still offer retry
    const retryBtnWrap = document.createElement('div');
    retryBtnWrap.style.cssText = 'padding:0 16px 16px;';
    retryBtnWrap.innerHTML = `<button class="btn btn-outline btn-full" style="margin-top:0;" onclick="${retryFn}">🔁 Retry Weak Items Only (${wqState.weakItems.length})</button>`;
    inner.appendChild(retryBtnWrap);
  }

  // Retry summary note for WhatsApp — add to the result card's WA share as extra context
  if (isRetry && retryNote) {
    const noteEl = document.createElement('div');
    noteEl.style.cssText = 'margin:0 16px 12px;font-size:12px;color:var(--text-muted);background:var(--bg-card2);border-radius:8px;padding:8px 12px;border-left:3px solid var(--gold);';
    noteEl.textContent = retryNote;
    inner.insertBefore(noteEl, inner.firstChild);
  }
}

// ===== SENTENCE PRACTICE v1.11E — FILL-IN-THE-BLANK =====
// Uses word.ex_en example sentences. Blanks the target word.
// English word buttons. Spoken feedback. Reuses buildProResultCard().

let spState = {
  setKey:    null,
  questions: [],   // { word, blankedSentence, opts }
  index:     0,
  correct:   0,
  wrong:     0,
  weakItems: [],   // { word } for each wrong answer
  isRetry:   false,
  prevWeakCount: 0
};

/**
 * spGetValidWords(setKey)
 * Returns words from the set that have ex_en AND whose word
 * appears in ex_en so we can produce a visible ___ gap.
 */
function spGetValidWords(setKey) {
  const ws = WORD_SETS[setKey];
  if (!ws) return [];
  return ws.words.filter(function(word) {
    if (!word.ex_en) return false;
    const blanked = word.ex_en.replace(
      new RegExp('\\b' + word.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'),
      '___'
    );
    return blanked !== word.ex_en; // word was found and replaced
  });
}

/**
 * spHasEnough(setKey)
 * True if the set has >= 4 valid sentence-practice words.
 */
function spHasEnough(setKey) {
  return spGetValidWords(setKey).length >= 4;
}

/**
 * renderSentencePracticePills()
 * Builds a pill for every word set. If the set has >= 4 valid
 * SP words the pill is enabled; otherwise grayed with tooltip.
 * The whole container is only shown if at least one set qualifies.
 */
function renderSentencePracticePills() {
  var container  = document.getElementById('sp-btn-container');
  var pillsArea  = document.getElementById('sp-set-pills');
  if (!container || !pillsArea) return;

  var anyEnabled = false;
  var html = Object.entries(WORD_SETS).map(function(entry) {
    var k  = entry[0];
    var ws = entry[1];
    var enough = spHasEnough(k);
    if (enough) anyEnabled = true;
    if (enough) {
      return '<button class="pill" onclick="startSentencePractice(\'' + k + '\')">' +
             ws.icon + ' ' + ws.en + ' — Sentence Practice</button>';
    } else {
      return '<button class="pill" style="opacity:0.45;cursor:not-allowed;" disabled ' +
             'title="Not enough sentence data for this set.">' +
             ws.icon + ' ' + ws.en + ' — Sentence Practice</button>';
    }
  }).join('');

  pillsArea.innerHTML = html;
  container.style.display = anyEnabled ? 'block' : 'none';
}

/**
 * startSentencePractice(setKey)
 * Entry point. Validates, builds questions, runs session.
 */
function startSentencePractice(setKey) {
  var ws = WORD_SETS[setKey];
  if (!ws) return;

  var validWords = spGetValidWords(setKey);
  if (validWords.length < 4) {
    // Show message inside quiz-area
    document.getElementById('quiz-set-selector').style.display = 'none';
    var area = document.getElementById('quiz-area');
    area.style.display = 'block';
    area.innerHTML = '<div class="card" style="margin:16px;">' +
      '<div style="text-align:center;padding:20px;color:var(--text-muted);">' +
      '📝 Sentence practice is not available for this set yet.</div>' +
      '<div style="padding:0 16px 16px;"><button class="btn btn-outline btn-full" ' +
      'onclick="document.getElementById(\'quiz-area\').style.display=\'none\';' +
      'document.getElementById(\'quiz-area\').innerHTML=\'\';' +
      'document.getElementById(\'quiz-set-selector\').style.display=\'\';">← Back</button></div></div>';
    return;
  }

  // Shuffle and take up to 8
  var shuffled = validWords.slice().sort(function() { return Math.random() - 0.5; });
  var chosen   = shuffled.slice(0, 8);
  var allWords = ws.words;

  // Build question objects
  var questions = chosen.map(function(word) {
    var blankedSentence = word.ex_en.replace(
      new RegExp('\\b' + word.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'),
      '___'
    );
    // 3 wrong options (different words, same set)
    var wrongs = allWords
      .filter(function(w) { return w.id !== word.id; })
      .sort(function() { return Math.random() - 0.5; })
      .slice(0, 3);
    var opts = wrongs.concat([word]).sort(function() { return Math.random() - 0.5; });
    return { word: word, blankedSentence: blankedSentence, opts: opts };
  });

  // Init spState
  spState.setKey        = setKey;
  spState.questions     = questions;
  spState.index         = 0;
  spState.correct       = 0;
  spState.wrong         = 0;
  spState.weakItems     = [];
  spState.isRetry       = false;
  spState.prevWeakCount = 0;

  // Show quiz area
  document.getElementById('quiz-set-selector').style.display = 'none';
  var area = document.getElementById('quiz-area');
  area.style.display = 'block';
  area.innerHTML = '';

  // Speak opening instruction once
  window.speechSynthesis.cancel();
  setTimeout(function() {
    var u = new SpeechSynthesisUtterance('Read the sentence carefully and choose the missing word.');
    u.lang = 'en-US'; u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }, 300);

  spRenderQuestion();
}

/**
 * spRenderQuestion()
 * Renders the current fill-in-the-blank question.
 */
function spRenderQuestion() {
  var area = document.getElementById('quiz-area');
  if (!area) return;
  var total = spState.questions.length;

  if (spState.index >= total) {
    spShowResult();
    return;
  }

  var q      = spState.questions[spState.index];
  var qNum   = spState.index + 1;
  var word   = q.word;

  // Progress bar percentage
  var pct = Math.round((spState.index / total) * 100);

  // Build option buttons (English words)
  var optHTML = q.opts.map(function(o) {
    return '<button class="quiz-opt-btn" ' +
      'data-id="'      + escHtml(o.id)   + '" ' +
      'data-correct="' + escHtml(word.id) + '" ' +
      'onclick="spAnswer(this)">' + escHtml(o.en) + '</button>';
  }).join('');

  area.innerHTML =
    '<div class="card" style="margin:0 16px 12px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
        '<div class="badge badge-lapis">Q ' + qNum + ' of ' + total + '</div>' +
        '<div class="badge badge-gold" style="font-size:10px;">Sentence Practice</div>' +
      '</div>' +
      '<div style="background:var(--border);height:3px;border-radius:3px;margin-bottom:12px;">' +
        '<div style="background:var(--lapis);height:3px;border-radius:3px;width:' + pct + '%;transition:width 0.3s;"></div>' +
      '</div>' +
      '<div style="font-size:14px;color:var(--text-muted);text-align:center;margin-bottom:10px;">' +
        'Read the sentence. What is the missing word?' +
      '</div>' +
      '<div style="font-size:18px;font-weight:700;text-align:center;line-height:1.6;' +
           'padding:12px 8px;background:var(--bg-card2);border-radius:10px;margin-bottom:12px;' +
           'border:1px solid var(--border);">' +
        escHtml(q.blankedSentence).replace('___',
          '<span style="display:inline-block;min-width:60px;border-bottom:3px solid var(--gold);' +
          'color:var(--gold);font-weight:900;padding:0 4px;">___</span>') +
      '</div>' +
      '<div id="sp-feedback" style="min-height:24px;"></div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 16px 16px;">' +
      optHTML +
    '</div>';

  // Speak instruction (quietly, after render)
  window.speechSynthesis.cancel();
  setTimeout(function() {
    var u = new SpeechSynthesisUtterance('Read the sentence. What is the missing word?');
    u.lang = 'en-US'; u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }, 300);
}

/**
 * spAnswer(btn)
 * Handles a sentence-practice answer tap.
 */
function spAnswer(btn) {
  var answeredId = btn.getAttribute('data-id');
  var correctId  = btn.getAttribute('data-correct');
  var isCorrect  = answeredId === correctId;
  var q    = spState.questions[spState.index];
  var word = q.word;

  // Disable all option buttons
  var btns = document.querySelectorAll('.quiz-opt-btn');
  btns.forEach(function(b) {
    b.onclick = null;
    b.style.pointerEvents = 'none';
    if (b.getAttribute('data-id') === correctId) b.classList.add('correct-ans');
    else if (b.getAttribute('data-id') === answeredId && !isCorrect) b.classList.add('wrong-ans');
  });

  // Update state
  if (isCorrect) {
    spState.correct++;
  } else {
    spState.wrong++;
    spState.weakItems.push({ word: word.en, dari: word.dari, type: 'sentence' });
  }

  // Update mastery + streak
  if (word && word.id) {
    updateWordMastery(word.id, isCorrect, 'quiz');
  }
  updateStreak();

  // Build reconstructed sentence for correct-feedback speech
  var reconstructed = word.ex_en || word.en;

  // Feedback
  var feedbackText  = '';
  var feedbackColor = '';
  var spokenText    = '';

  if (isCorrect) {
    feedbackText  = '✅ Correct!';
    feedbackColor = 'var(--emerald)';
    spokenText    = 'Correct. The word is ' + word.en + '. ' + reconstructed;
  } else {
    feedbackText  = '❌ The word was: ' + word.en;
    feedbackColor = 'var(--red)';
    spokenText    = 'Not correct. The word was ' + word.en + '.';
  }

  var fbEl = document.getElementById('sp-feedback');
  if (fbEl) {
    fbEl.innerHTML = '<div style="text-align:center;font-size:13px;font-weight:700;' +
      'color:' + feedbackColor + ';padding:4px 0;">' + escHtml(feedbackText) + '</div>';
  }

  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(spokenText);
  u.lang = 'en-US'; u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; u.volume = 1.0;

  // I6H-C1 FIX: Same patience as wq — 1000ms after TTS ends; 4500ms fallback.
  var spAdvanced = false;
  function spAdvance() {
    if (spAdvanced) return;
    spAdvanced = true;
    clearTimeout(spFallback);
    spState.index++;
    spRenderQuestion();
  }
  var spFallback = setTimeout(spAdvance, 4500);          // generous fallback
  u.onend   = function() { setTimeout(spAdvance, 1000); }; // 1000ms patience
  u.onerror = function() { setTimeout(spAdvance, 1800); }; // 1800ms visual fallback
  window.speechSynthesis.speak(u);
}

/**
 * spShowResult()
 * Builds the result card at the end of a sentence practice session.
 */
function spShowResult() {
  var ws    = WORD_SETS[spState.setKey];
  var total = spState.questions.length;
  var pct   = total > 0 ? Math.round((spState.correct / total) * 100) : 0;
  var passed = pct >= 70;
  var setName = ws ? ws.en : '';
  // I6H-C: Learning Ledger record (final sentence-practice result only)
  try {
    if (window.ZirakLearningLedger) {
      window.ZirakLearningLedger.recordActivity({
        source: 'wordlab', contentId: spState.setKey, // I6H-D13B (Task 9)
        sectionTitle: 'Sentence Practice' + (setName ? ' \u2014 ' + setName : ''),
        good: spState.correct, total: total, pct: pct,
        activityType: 'sentence-practice'
      });
    }
  } catch (eLlg) {}

  var sectionLabel  = spState.isRetry ? 'Sentence Practice Retry' : 'Sentence Practice';
  var sessionTitle  = setName + ' — ' + sectionLabel;
  var weakWords     = spState.weakItems.map(function(wi) { return wi.word; });

  // Save to history
  saveToHistory({
    type: 'sentence', topic: setName + ' (Sentence Practice)',
    score: pct, mode: 'en', date: new Date().toISOString()
  });
  checkAndAwardBadges();

  // Spoken result
  window.speechSynthesis.cancel();
  var spokenResult = passed
    ? _fbPick(FEEDBACK_BANK.final.pass).replace('{score}', pct) + ' ' + FEEDBACK_BANK.final.parent_guidance
    : _fbPick(FEEDBACK_BANK.final.fail).replace('{score}', pct) + ' ' + FEEDBACK_BANK.final.parent_guidance;
  setTimeout(function() {
    var u = new SpeechSynthesisUtterance(spokenResult);
    u.lang = 'en-US'; u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; u.volume = 1.0;
    window.speechSynthesis.speak(u);
  }, 400);

  var area = document.getElementById('quiz-area');
  if (!area) return;
  area.innerHTML = '<div id="sp-result-inner" style="padding:0;"></div>';
  var inner = document.getElementById('sp-result-inner');

  setTimeout(function() {
    if (area) area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 200);

  var proCard = buildProResultCard({
    score:          pct,
    sessionTitle:   sessionTitle,
    sectionType:    sectionLabel,
    missedWords:    weakWords,
    extraWords:     [],
    sessionDetails: spState.correct + '/' + total + ' sentences correct',
    onPracticeAgain: function() {
      window.speechSynthesis.cancel();
      document.getElementById('quiz-set-selector').style.display = 'none';
      document.getElementById('quiz-area').style.display = 'block';
      startSentencePractice(spState.setKey);
    },
    onContinue: function() {
      window.speechSynthesis.cancel();
      showWordTab('sets');
    }
  });
  inner.appendChild(proCard);

  // Retry weak items button (sentence practice)
  if (spState.weakItems.length > 0) {
    var retryWrap = document.createElement('div');
    retryWrap.style.cssText = 'padding:0 16px 16px;';
    retryWrap.innerHTML = '<button class="btn ' + (passed ? 'btn-outline' : 'btn-gold') +
      ' btn-full" style="margin-top:0;" onclick="spStartRetry()">' +
      '🔁 Retry Weak Items Only (' + spState.weakItems.length + ')</button>';
    inner.appendChild(retryWrap);
  }
}

/**
 * spStartRetry()
 * Re-runs sentence practice with only the weak words.
 */
function spStartRetry() {
  var weak    = spState.weakItems.slice();
  if (!weak.length) return;
  var setKey  = spState.setKey;
  var ws      = WORD_SETS[setKey];
  if (!ws) return;
  var allWords = ws.words;

  // Rebuild questions from weak items only
  var questions = weak.map(function(wi) {
    var word = allWords.find(function(w) { return w.en === wi.word; });
    if (!word || !word.ex_en) return null;
    var blankedSentence = word.ex_en.replace(
      new RegExp('\\b' + word.en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi'),
      '___'
    );
    if (blankedSentence === word.ex_en) return null;
    var wrongs = allWords
      .filter(function(w) { return w.id !== word.id; })
      .sort(function() { return Math.random() - 0.5; })
      .slice(0, 3);
    var opts = wrongs.concat([word]).sort(function() { return Math.random() - 0.5; });
    return { word: word, blankedSentence: blankedSentence, opts: opts };
  }).filter(Boolean);

  if (!questions.length) return;

  spState.prevWeakCount = weak.length;
  spState.isRetry       = true;
  spState.questions     = questions;
  spState.index         = 0;
  spState.correct       = 0;
  spState.wrong         = 0;
  spState.weakItems     = [];

  document.getElementById('quiz-area').innerHTML  = '';
  document.getElementById('quiz-area').style.display = 'block';
  document.getElementById('quiz-set-selector').style.display = 'none';

  spRenderQuestion();
}
// ===== END SENTENCE PRACTICE v1.11E =====


function renderSavedWords() {
  const list = document.getElementById('saved-words-list');
  if (!list) return;
  if (!state.bookmarks.length) {
    list.innerHTML = `<div class="empty-state"><div class="es-icon">🔖</div><div class="es-text">No saved words yet. Bookmark words to study them!</div></div>`;
    return;
  }
  const allWords = Object.values(WORD_SETS).flatMap(ws => ws.words);
  const saved = allWords.filter(w => state.bookmarks.includes(w.en));
  list.innerHTML = saved.map(w => `<div style="padding:10px 16px;border-bottom:1px solid var(--divider);display:flex;justify-content:space-between;align-items:center;">
    <div><div style="font-weight:700;">${w.en}</div><div class="dari" style="font-size:15px;">${w.dari}</div></div>
    <button class="btn btn-ghost btn-sm" onclick="speak('${w.en}','en')">🔊</button>
  </div>`).join('');
}

// ===== LISTENING ROOM =====
// I6H-D18: initListening no longer eagerly renders all 400 Shadow cards.
// renderShadowSentences() is deferred until the Shadow tab is explicitly opened.
// Shadow, Repeat, and Dictation now use the active D18 pack, not the raw 400-item bank.
function initListening() {
  state.listenSentenceIdx = 0;
  renderListenSentence();
  renderSoundPairs();
  // D18: shadow sentences rendered lazily when Shadow tab opens, not here
  initDictation();
  // Initialize D18 active-pack state
  state.d18ActivePack = null;
  state.d18ActivePackItems = [];
  state.d18ActivePackIndex = 0;
  _initD18ListeningRoom();
  // PHASE I6B2 — Part 4: show the guidance line for the default (repeat) mode.
  // The page-level guide card + its auto-read are handled by
  // ZirakPageGuides.mountForScreen('listening') in navigate(); to avoid two
  // voices at once, populate the mode hint here WITHOUT auto-speaking it.
  try {
    var g = window.ZirakPageGuides ? window.ZirakPageGuides.listenModeText('repeat') : null;
    var box = document.getElementById('listen-mode-hint');
    window.__zirakListenMode = 'repeat';
    if (g && box) {
      var en = document.getElementById('listen-mode-hint-en');
      var ps = document.getElementById('listen-mode-hint-ps');
      if (en) en.textContent = g.en;
      if (ps) ps.textContent = g.ps;
      box.style.display = 'block';
    }
  } catch (e) {}
}

function showListenTab(tab) {
  ['repeat','shadow','dictation','pairs','phonics','minpairs'].forEach(t => {
    const el = document.getElementById('listentab-'+t);
    if (el) el.style.display = t===tab ? 'block' : 'none';
    document.getElementById('ltab-'+t)?.classList.toggle('active', t===tab);
  });
  if (tab === 'phonics')   { window.speechSynthesis.cancel(); initPhonics();  }
  if (tab === 'minpairs')  { window.speechSynthesis.cancel(); initMinPairs(); }
  // PHASE I6B2 — Part 4/5: show a short mode-guide line and, if Auto Read is
  // ON, speak it once. Uses the ONE guide system (window.ZirakPageGuides).
  window.__zirakListenMode = tab;
  try {
    var g = window.ZirakPageGuides ? window.ZirakPageGuides.listenModeText(tab) : null;
    var box = document.getElementById('listen-mode-hint');
    if (g && box) {
      var en = document.getElementById('listen-mode-hint-en');
      var ps = document.getElementById('listen-mode-hint-ps');
      if (en) en.textContent = g.en;
      if (ps) ps.textContent = g.ps;
      box.style.display = 'block';
      window.ZirakPageGuides.speakListenMode(tab, true); // auto (respects Auto Read)
    } else if (box) {
      box.style.display = 'none';
    }
  } catch (e) {}
}

// PHASE I6B2 — Part 4: manual "Hear" for the current listening mode guide.
function hearListenModeGuide() {
  try {
    var tab = window.__zirakListenMode || 'repeat';
    if (window.ZirakPageGuides) window.ZirakPageGuides.speakListenMode(tab, false);
  } catch (e) {}
}

// PHASE I6B2 — Part 12: clear Exit/Close path out of the Listening Room.
// Stops any audio first, then returns to Home (does not disturb bottom nav).
function exitListeningRoom() {
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  try { navigate('home'); } catch (e) {}
}

// I6H-D18A — one bounded Listening pack/session controller.
// Candidate preview is explicit; official entry never silently falls back.
function _d18CC() { return window.ZirakCurriculumContent || null; }
function _d18CompleteText(item, includeSpeakers) {
  const cc = _d18CC();
  if (cc && typeof cc.getCompleteListeningItemTextD18 === 'function') return cc.getCompleteListeningItemTextD18(item, !!includeSpeakers);
  if (item && Array.isArray(item.script)) return item.script.map(function(line){ return (includeSpeakers && line.speaker ? line.speaker + ': ' : '') + (line.text || ''); }).filter(Boolean).join(' ');
  return String((item && (item.text || item.englishText || item.en)) || '');
}
function _d18Sections(item) {
  const cc = _d18CC();
  if (cc && typeof cc.getListeningItemSectionsD18 === 'function') return cc.getListeningItemSectionsD18(item);
  const text = _d18CompleteText(item, false);
  return text ? [{ sectionId: (item.contentId || item.canonicalListeningId || 'item') + '-section-1', text: text, speaker: '', position: 0 }] : [];
}
function _d18StudentContext() {
  const student = window.ZirakProfile && window.ZirakProfile.currentStudent ? window.ZirakProfile.currentStudent() : null;
  if (!student) return { ok:false, reason:'no-student' };
  const profile = window.ZirakAcademicProgram && window.ZirakAcademicProgram.getStudentAcademicProfile ? window.ZirakAcademicProgram.getStudentAcademicProfile(student.studentId) : null;
  const level = profile && profile.acceptedLevelId ? profile.acceptedLevelId : '';
  if (!level) return { ok:false, reason:'no-accepted-level', student:student, profile:profile };
  const pathway = (profile && (profile.learnerPathwayId || profile.pathwayId)) || student.learnerPathwayId || student.pathwayId || 'general-adult';
  return { ok:true, student:student, profile:profile, level:level, pathway:pathway };
}
function _d18InvalidateRuntime(reason) {
  state.d18RuntimeToken = (state.d18RuntimeToken || 0) + 1;
  state.listeningSessionId = (state.listeningSessionId || 0) + 1;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  try { if (state.recognition) state.recognition.abort(); } catch (e) {}
  state.d18LastInvalidationReason = reason || '';
}
function _d18ActiveProgress() {
  const cc = _d18CC();
  const ctx = _d18StudentContext();
  if (!cc || !ctx.ok || !state.d18ActivePack || typeof cc.getListeningPackProgressD18 !== 'function') return null;
  return cc.getListeningPackProgressD18(ctx.student.studentId, state.d18ActivePack.packId);
}
function _d18ActiveItem() {
  const items = _getD18ActivePackItems();
  if (!items.length) return null;
  const idx = Math.max(0, Math.min(items.length - 1, Number(state.d18ActivePackIndex || 0)));
  return items[idx];
}
function _d18SelectedSection(item) {
  const sections = _d18Sections(item);
  if (!sections.length) return null;
  const idx = Math.max(0, Math.min(sections.length - 1, Number(state.d18ActiveSectionIndex || 0)));
  return sections[idx];
}
function _d18SetActivePosition(itemIndex, sectionIndex, taskId) {
  const items = _getD18ActivePackItems();
  if (!items.length || !state.d18ActivePack) return;
  state.d18ActivePackIndex = Math.max(0, Math.min(items.length - 1, Number(itemIndex || 0)));
  const item = items[state.d18ActivePackIndex];
  const sections = _d18Sections(item);
  state.d18ActiveSectionIndex = Math.max(0, Math.min(Math.max(0, sections.length - 1), Number(sectionIndex || 0)));
  const section = sections[state.d18ActiveSectionIndex] || null;
  _d18InvalidateRuntime('position-change');
  const cc = _d18CC(), ctx = _d18StudentContext(), progress = _d18ActiveProgress();
  if (cc && ctx.ok && typeof cc.updateListeningPositionD18 === 'function') {
    cc.updateListeningPositionD18({
      studentId:ctx.student.studentId, packId:state.d18ActivePack.packId,
      stageId:progress && progress.activeStageId, itemId:item.contentId || item.canonicalListeningId,
      sectionId:section && section.sectionId, taskId:taskId || (progress && progress.activeTaskId),
      currentPosition:state.d18ActivePackIndex
    });
  }
  renderD18ActivePackPanel();
  renderListenSentence();
}
function _d18LoadResolvedPack(resolved) {
  if (!resolved || !resolved.ok) return false;
  _d18InvalidateRuntime('pack-load');
  state.d18ActivePack = resolved.pack;
  state.d18ActivePackItems = resolved.items || [];
  state.d18ActivePackTasks = resolved.tasks || [];
  state.d18ActiveRouteMode = resolved.routeMode;
  state.d18ActivePackIndex = 0;
  state.d18ActiveSectionIndex = 0;
  state.d18ActiveSessionId = resolved.sessionId || (resolved.progress && resolved.progress.sessionId) || '';
  const p = resolved.progress || _d18ActiveProgress();
  if (p) {
    const itemIndex = state.d18ActivePackItems.findIndex(function(item){ return (item.contentId || item.canonicalListeningId) === p.activeItemId; });
    if (itemIndex >= 0) state.d18ActivePackIndex = itemIndex;
    const activeItem = state.d18ActivePackItems[state.d18ActivePackIndex];
    const sectionIndex = _d18Sections(activeItem).findIndex(function(section){ return section.sectionId === p.activeSectionId; });
    if (sectionIndex >= 0) state.d18ActiveSectionIndex = sectionIndex;
  }
  _updateD18ListeningRoomUI(resolved);
  renderD18ActivePackPanel();
  renderListenSentence();
  return true;
}
function _d18StageTasks(progress) {
  const tasks = state.d18ActivePackTasks || [];
  if (!progress) return [];
  return tasks.filter(function(task){ return task.stageId === progress.activeStageId; });
}
function renderD18ActivePackPanel() {
  const panel = document.getElementById('d18-active-pack-panel');
  if (!panel) return;
  const pack = state.d18ActivePack;
  if (!pack) { panel.hidden = true; return; }
  panel.hidden = false;
  const progress = _d18ActiveProgress();
  const item = _d18ActiveItem();
  const sections = _d18Sections(item);
  const activeSectionIndex = Math.max(0, Math.min(Math.max(0, sections.length - 1), Number(state.d18ActiveSectionIndex || 0)));
  const title = document.getElementById('d18-active-pack-title');
  const meta = document.getElementById('d18-active-pack-meta');
  const gov = document.getElementById('d18-active-pack-governance');
  if (title) title.textContent = pack.themeLabel || pack.theme || pack.packId;
  if (meta) meta.textContent = pack.packId + ' · Level ' + pack.acceptedLevelId + ' · ' + state.d18ActivePackItems.length + ' item(s) · ' + pack.estimatedFullPackMinutes + ' min';
  if (gov) gov.textContent = state.d18ActiveRouteMode === 'official' ? 'Official Listening' : 'Teacher/Pilot Preview — Owner Approval Pending';
  const stageEl = document.getElementById('d18-stage-progress');
  if (stageEl) {
    const completed = progress ? Object.keys(progress.stageCompletionMap || {}).length : 0;
    stageEl.textContent = 'Stage: ' + ((progress && progress.activeStageId) || 'not started') + ' · Completed ' + completed + ' of ' + pack.stages.length + ' · Item ' + (state.d18ActivePackIndex + 1) + ' of ' + state.d18ActivePackItems.length + ' · Section ' + (activeSectionIndex + 1) + ' of ' + Math.max(1, sections.length) + ' · State: ' + ((progress && progress.stateStatus) || 'active');
  }
  const passage = document.getElementById('d18-passage-view');
  if (passage) {
    passage.textContent = '';
    sections.forEach(function(section, idx){
      const row = document.createElement('div');
      row.className = 'd18-passage-line' + (idx === activeSectionIndex ? ' is-active' : '');
      row.dataset.sectionIndex = String(idx);
      row.addEventListener('click', function(){ _d18SetActivePosition(state.d18ActivePackIndex, idx); });
      if (section.speaker) {
        const speaker = document.createElement('span');
        speaker.className = 'd18-passage-speaker'; speaker.textContent = section.speaker + ':'; row.appendChild(speaker);
      }
      const text = document.createElement('span'); text.textContent = section.text; row.appendChild(text);
      passage.appendChild(row);
    });
  }
  renderD18TaskArea(progress);
  const summary = document.getElementById('d18-pack-summary');
  if (summary) {
    summary.hidden = !(progress && progress.packCompleted);
    if (progress && progress.packCompleted) summary.textContent = 'Pack completed once at ' + progress.completedAt + '. Review becomes due on ' + progress.reviewDueAt + '. Route: ' + progress.routeMode + '.';
  }
}
function renderD18TaskArea(progress) {
  const area = document.getElementById('d18-task-area');
  if (!area) return;
  area.textContent = '';
  if (!progress) { area.textContent = 'Start or continue the pack to load its stage tasks.'; return; }
  const tasks = _d18StageTasks(progress);
  if (!tasks.length) { area.textContent = 'This stage is completed through its playback, repeat, oral, or recovery criterion. Use Complete stage when finished.'; return; }
  const task = tasks.find(function(t){ return !(progress.taskCompletionMap || {})[t.taskId]; }) || tasks[0];
  const heading = document.createElement('div'); heading.style.fontWeight = '800'; heading.textContent = 'Task · ' + task.taskType; area.appendChild(heading);
  const prompt = document.createElement('div'); prompt.style.marginTop = '6px'; prompt.textContent = task.prompt; area.appendChild(prompt);
  if (Array.isArray(task.options) && task.options.length) {
    task.options.forEach(function(option, idx){
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn btn-outline btn-sm d18-task-option'; btn.textContent = option;
      btn.addEventListener('click', function(){ submitD18TaskAnswer(task.taskId, idx); }); area.appendChild(btn);
    });
  } else {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn btn-outline btn-sm d18-task-option'; btn.textContent = task.scoringMode === 'teacher-rubric' ? 'Mark teacher/manual rubric attempt complete' : 'Submit task';
    btn.addEventListener('click', function(){ submitD18TaskAnswer(task.taskId, null); }); area.appendChild(btn);
  }
  const feedback = document.createElement('div'); feedback.id = 'd18-task-feedback'; feedback.style.marginTop = '8px'; feedback.style.fontSize = '13px'; area.appendChild(feedback);
}
function submitD18TaskAnswer(taskId, selectedIndex) {
  const task = (state.d18ActivePackTasks || []).find(function(t){ return t.taskId === taskId; });
  const cc = _d18CC(), ctx = _d18StudentContext(), progress = _d18ActiveProgress();
  if (!task || !cc || !ctx.ok || !progress) return;
  const teacher = task.scoringMode === 'teacher-rubric';
  const correct = teacher ? true : Number(selectedIndex) === Number(task.correctIndex);
  const score = correct ? 100 : 0;
  const attemptId = [progress.sessionId, task.stageId, task.itemId, task.taskId, 'ui-attempt'].join('::');
  cc.completeListeningTaskD18({
    studentId:ctx.student.studentId, packId:state.d18ActivePack.packId, packVersion:state.d18ActivePack.packVersion,
    routeMode:state.d18ActiveRouteMode, stageId:task.stageId, itemId:task.itemId, taskId:task.taskId,
    score:score, attemptId:attemptId, currentPosition:state.d18ActivePackIndex
  });
  const feedback = document.getElementById('d18-task-feedback');
  if (feedback) feedback.textContent = teacher ? 'Manual/teacher rubric attempt saved. ' + task.explanation : (correct ? 'Correct. ' : 'Try again. ') + task.explanation;
  renderD18ActivePackPanel();
}
function playD18WholePassage() {
  const item = _d18ActiveItem(); if (!item) return;
  const token = state.d18RuntimeToken || 0;
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const text = _d18CompleteText(item, true);
    if (token !== (state.d18RuntimeToken || 0) || !text) return;
    speak(text, 'en');
  } catch (e) { _recordD18TechnicalFailure('tts-hardware-release-failure'); }
}
function playD18SelectedSection() {
  const item = _d18ActiveItem(), section = _d18SelectedSection(item); if (!section) return;
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); speak(section.text, 'en'); }
  catch (e) { _recordD18TechnicalFailure('tts-hardware-release-failure'); }
}
function previousD18Section() {
  const item = _d18ActiveItem(), sections = _d18Sections(item);
  if (!sections.length) return;
  if ((state.d18ActiveSectionIndex || 0) > 0) _d18SetActivePosition(state.d18ActivePackIndex, state.d18ActiveSectionIndex - 1);
  else if ((state.d18ActivePackIndex || 0) > 0) {
    const nextItemIndex = state.d18ActivePackIndex - 1;
    const prevSections = _d18Sections(state.d18ActivePackItems[nextItemIndex]);
    _d18SetActivePosition(nextItemIndex, Math.max(0, prevSections.length - 1));
  }
}
function nextD18Section() {
  const item = _d18ActiveItem(), sections = _d18Sections(item);
  if (!sections.length) return;
  if ((state.d18ActiveSectionIndex || 0) < sections.length - 1) _d18SetActivePosition(state.d18ActivePackIndex, state.d18ActiveSectionIndex + 1);
  else if ((state.d18ActivePackIndex || 0) < state.d18ActivePackItems.length - 1) _d18SetActivePosition(state.d18ActivePackIndex + 1, 0);
}
function pauseD18ListeningSession() {
  const cc = _d18CC(), ctx = _d18StudentContext(); if (!cc || !ctx.ok || !state.d18ActivePack) return;
  _d18InvalidateRuntime('pause'); cc.pauseListeningPackD18(ctx.student.studentId, state.d18ActivePack.packId); renderD18ActivePackPanel();
}
function resumeD18ListeningSession() {
  const cc = _d18CC(), ctx = _d18StudentContext(); if (!cc || !ctx.ok || !state.d18ActivePack) return;
  cc.resumeListeningPackD18(ctx.student.studentId, state.d18ActivePack.packId); renderD18ActivePackPanel();
}
function stopD18ListeningSession() {
  const cc = _d18CC(), ctx = _d18StudentContext(); if (!cc || !ctx.ok || !state.d18ActivePack) return;
  _d18InvalidateRuntime('stop'); cc.stopListeningPackD18(ctx.student.studentId, state.d18ActivePack.packId); renderD18ActivePackPanel();
}
function completeD18ActiveStage() {
  const cc = _d18CC(), ctx = _d18StudentContext(), progress = _d18ActiveProgress();
  if (!cc || !ctx.ok || !progress || !state.d18ActivePack) return;
  _d18InvalidateRuntime('stage-complete');
  cc.completeListeningStageD18({ studentId:ctx.student.studentId, packId:state.d18ActivePack.packId, stageId:progress.activeStageId, completionEventId:progress.sessionId + '::stage::' + progress.activeStageId });
  renderD18ActivePackPanel(); renderListenSentence();
}
function _recordD18TechnicalFailure(errorCode) {
  // I6H-D19: this remains the single speech-error entry point. It routes an
  // active Dialogue error into the existing D19 progress/Ledger authority;
  // otherwise it preserves the D18 Listening behavior. No score zero and no
  // weak item is created by either branch.
  const cc = _d18CC(), ctx = _d18StudentContext();
  if (!cc || !ctx.ok) return;
  if (state.activeScreen === 'dialogue' && state.d19ActiveRaw && typeof cc.recordDialogueTechnicalFailureD19 === 'function') {
    const progress = cc.getDialogueProgressD19(ctx.student.studentId, state.d19ActiveRaw.dialogueId);
    const turn = _d19CurrentTurn();
    const eventId = [progress && progress.sessionId || 'd19-session', turn && turn.turnId || 'turn', errorCode, Number(progress && progress.technicalFailureCount || 0) + 1].join('::');
    cc.recordDialogueTechnicalFailureD19({
      studentId:ctx.student.studentId, dialogueId:state.d19ActiveRaw.dialogueId,
      turnId:turn && turn.turnId, errorCode:errorCode, errorId:eventId
    });
    return;
  }
  const progress = _d18ActiveProgress(), item = _d18ActiveItem();
  if (!state.d18ActivePack || typeof cc.recordListeningTechnicalFailureD18 !== 'function') return;
  cc.recordListeningTechnicalFailureD18({
    studentId:ctx.student.studentId, packId:state.d18ActivePack.packId, packVersion:state.d18ActivePack.packVersion,
    routeMode:state.d18ActiveRouteMode || 'candidate-preview', stageId:progress && progress.activeStageId,
    itemId:item && (item.contentId || item.canonicalListeningId), taskId:progress && progress.activeTaskId,
    errorCode:errorCode, errorId:[progress && progress.sessionId || 'session', errorCode, Number(progress && progress.technicalFailureCount || 0) + 1].join('::')
  });
}

function _getRepeatItem() {
  const d18items = _getD18ActivePackItems();
  if (d18items.length > 0) {
    const idx = Math.max(0, Math.min(d18items.length - 1, Number(state.d18ActivePackIndex || state.listenSentenceIdx || 0)));
    const item = d18items[idx];
    const section = _d18SelectedSection(item) || _d18Sections(item)[0];
    const text = section ? section.text : _d18CompleteText(item, false);
    const pashto = (typeof item.pashtoSupport === 'string') ? item.pashtoSupport : (item.pashto || item.dari || '');
    return { en:text, dari:pashto, pashto:pashto, _d18:true, contentId:item.contentId || item.canonicalListeningId, sectionId:section && section.sectionId, itemIndex:idx };
  }
  return LISTEN_SENTENCES[state.listenSentenceIdx % LISTEN_SENTENCES.length] || { en:'', dari:'' };
}
function renderListenSentence() {
  const s = _getRepeatItem();
  const enEl = document.getElementById('listen-sentence-en'); if (enEl) enEl.textContent = s.en;
  const dariEl = document.getElementById('listen-sentence-dari');
  if (dariEl) {
    const ps = s._d18 ? (s.pashto || '') : getPashtoText(s, 'listening');
    dariEl.classList.add('pashto-on-dark'); dariEl.classList.toggle('pashto-pending-marker', !ps); dariEl.textContent = ps || 'Pashto translation pending.';
  }
  const labelEl = document.getElementById('d18-repeat-item-label');
  if (labelEl) labelEl.textContent = s._d18 ? ('Pack item ' + (s.itemIndex + 1) + ' of ' + _getD18ActivePackItems().length + ' · ' + s.contentId + (s.sectionId ? ' · ' + s.sectionId : '')) : ('Legacy item ' + (state.listenSentenceIdx % LISTEN_SENTENCES.length + 1) + ' of ' + LISTEN_SENTENCES.length + ' (Free Practice)');
}
function playListenSentence() { const s = _getRepeatItem(); if (s.en) { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); speak(s.en, 'en'); } catch(e){ _recordD18TechnicalFailure('tts-hardware-release-failure'); } } }
function startListenRepeat() {
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  state.listeningSessionId = (state.listeningSessionId || 0) + 1;
  state.listenActiveMode = 'auto-manual'; state.listenActiveItemIdx = Number.isInteger(state.d18ActivePackIndex) ? state.d18ActivePackIndex : null; state.listenActiveSectionIdx = state.d18ActiveSectionIndex || 0;
  state.listenActiveD18Mode = _getD18ActivePackItems().length > 0; startSpeech();
}
function scoreListenRepeat() {
  var s;
  if (state.listenActiveMode === 'shadow' && state.listenActiveItemIdx !== null) {
    if (state.listenActiveD18Mode) {
      const items = _getD18ActivePackItems(), item = items[state.listenActiveItemIdx] || {};
      const sections = _d18Sections(item), section = sections[Math.max(0, Math.min(sections.length - 1, Number(state.listenActiveSectionIdx || 0)))] || sections[0];
      s = { en:section ? section.text : _d18CompleteText(item, false), _d18:true, contentId:item.contentId || item.canonicalListeningId, sectionId:section && section.sectionId };
    } else s = LISTEN_SENTENCES[state.listenActiveItemIdx % LISTEN_SENTENCES.length];
  } else s = _getRepeatItem();
  const score = calculateScore(state.transcript, s.en || '');
  const el = document.getElementById('listen-repeat-score'); if (el) el.style.display = 'block';
  const scoreText = document.getElementById('lr-score-text'); if (scoreText) scoreText.textContent = 'Score: ' + score + '% — "' + state.transcript + '"';
  const lrMsg = score >= 90 ? _fbPick(FEEDBACK_BANK.item.excellent) : score >= 70 ? _fbPick(FEEDBACK_BANK.item.pass) : score >= 40 ? _fbPick(FEEDBACK_BANK.item.weak) : _fbPick(FEEDBACK_BANK.item.wrong);
  setTimeout(function(){ speak(lrMsg, 'en'); }, 400);
  if (s._d18 && s.contentId) {
    const cc = _d18CC(), ctx = _d18StudentContext(), progress = _d18ActiveProgress();
    if (cc && ctx.ok && progress) cc.updateListeningItemProgressD18(ctx.student.studentId, state.d18ActivePack.packId, s.contentId, score, false, { packVersion:state.d18ActivePack.packVersion, routeMode:state.d18ActiveRouteMode, stageId:progress.activeStageId, taskId:progress.activeTaskId, currentPosition:state.d18ActivePackIndex, attemptId:[progress.sessionId, progress.activeStageId, s.contentId, s.sectionId || 'section', 'repeat'].join('::') });
  }
  renderD18ActivePackPanel();
}
function nextListenSentence() {
  if (_getD18ActivePackItems().length) nextD18Section();
  else { state.listenSentenceIdx++; renderListenSentence(); }
  const score = document.getElementById('listen-repeat-score'); if (score) score.style.display = 'none'; state.transcript = '';
}
function setSpeed(spd) {
  state.shadowSpeed = spd; state.speechRate = spd; save('speech_rate', spd);
  document.querySelectorAll('.speed-btn').forEach(function(b){ b.classList.remove('active'); });
  const speedButton = document.querySelector('.speed-btn[onclick="setSpeed(' + spd + ')"]'); if (speedButton) speedButton.classList.add('active');
  const dispEl = document.getElementById('speed-display'); if (dispEl) dispEl.textContent = parseFloat(spd).toFixed(2) + 'x';
  const sliderEl = document.getElementById('set-speed'); if (sliderEl) sliderEl.value = Math.round(spd * 100);
}
function renderShadowSentences() {
  const el = document.getElementById('shadow-sentences'); if (!el) return;
  const items = _getD18ActivePackItems(); el.textContent = '';
  if (!items.length) {
    const empty = document.createElement('div'); empty.className = 'card'; empty.style.cssText = 'padding:16px;color:var(--text-muted);text-align:center;'; empty.textContent = 'No active Listening pack. Start official Listening, choose Teacher/Pilot Preview, or use bounded Free Practice.'; el.appendChild(empty); return;
  }
  items.forEach(function(item, itemIndex){
    const card = document.createElement('div'); card.className = 'card'; card.style.marginBottom = '10px';
    const label = document.createElement('div'); label.style.cssText = 'font-size:11px;color:var(--text-muted);margin-bottom:6px;'; label.textContent = 'Pack item ' + (itemIndex + 1) + ' of ' + items.length + ' · ' + (item.contentId || item.canonicalListeningId); card.appendChild(label);
    _d18Sections(item).forEach(function(section, sectionIndex){
      const line = document.createElement('div'); line.style.cssText = 'margin:6px 0;line-height:1.5;'; line.textContent = (section.speaker ? section.speaker + ': ' : '') + section.text; card.appendChild(line);
      const repeat = document.createElement('button'); repeat.className = 'btn btn-outline btn-sm'; repeat.style.marginRight = '6px'; repeat.textContent = '🎙️ Repeat section ' + (sectionIndex + 1); repeat.addEventListener('click', function(){ shadowRepeatD18(itemIndex, sectionIndex); }); card.appendChild(repeat);
    });
    const whole = document.createElement('button'); whole.className = 'btn btn-primary btn-sm'; whole.style.marginTop = '8px'; whole.textContent = '🔊 Whole passage'; whole.addEventListener('click', function(){ shadowPlayD18(itemIndex); }); card.appendChild(whole);
    el.appendChild(card);
  });
}
function shadowPlayD18(idx) {
  const items = _getD18ActivePackItems(); if (idx < 0 || idx >= items.length) return;
  _d18SetActivePosition(idx, 0);
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); speak(_d18CompleteText(items[idx], true), 'en'); }
  catch(e){ _recordD18TechnicalFailure('tts-hardware-release-failure'); }
}
function shadowRepeatD18(idx, sectionIdx) {
  const items = _getD18ActivePackItems(); if (idx < 0 || idx >= items.length) return;
  _d18SetActivePosition(idx, Number(sectionIdx || 0));
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch(e){}
  state.listeningSessionId = (state.listeningSessionId || 0) + 1; state.listenActiveMode = 'shadow'; state.listenActiveItemIdx = idx; state.listenActiveSectionIdx = Number(sectionIdx || 0); state.listenActiveD18Mode = true; startSpeech();
}
function _getD18ActivePackItems() { return state.d18ActivePackItems && state.d18ActivePackItems.length ? state.d18ActivePackItems : []; }
function _initD18ListeningRoom() {
  const ctx = _d18StudentContext(), cc = _d18CC();
  state.d18ActivePack = null; state.d18ActivePackItems = []; state.d18ActivePackTasks = []; state.d18ActiveRouteMode = 'official';
  if (!cc || typeof cc.resolveD18ListeningPack !== 'function') return;
  if (!ctx.ok) { _updateD18ListeningRoomUI({ ok:false, reason:ctx.reason }); return; }
  const resolved = cc.resolveD18ListeningPack({ studentId:ctx.student.studentId, acceptedLevelId:ctx.level, learnerPathwayId:ctx.pathway, routeMode:'official', purpose:'continue' });
  if (resolved.ok) {
    const started = cc.startListeningPackSessionD18({ studentId:ctx.student.studentId, acceptedLevelId:ctx.level, learnerPathwayId:ctx.pathway, routeMode:'official', purpose:'continue', packId:resolved.pack.packId });
    _d18LoadResolvedPack(started);
  } else _updateD18ListeningRoomUI(resolved);
}
function _updateD18ListeningRoomUI(resolved) {
  const statusEl = document.getElementById('d18-pack-status'); if (!statusEl) return;
  statusEl.textContent = '';
  const badge = document.createElement('span'); badge.className = 'badge ' + (resolved && resolved.ok && resolved.routeMode === 'official' ? 'badge-emerald' : 'badge-gold');
  badge.textContent = resolved && resolved.ok && resolved.routeMode === 'official' ? 'Official Listening' : 'Official Listening unavailable — Owner Approval Pending'; statusEl.appendChild(badge);
  const line = document.createElement('div'); line.style.cssText = 'margin-top:6px;font-size:12px;color:var(--text-muted);';
  if (!resolved || !resolved.ok) line.textContent = 'No owner-approved official pack is available (' + ((resolved && resolved.reason) || 'unavailable') + '). Teacher/Pilot Preview is available only through the separate preview control. Free Practice remains separate.';
  else line.textContent = (resolved.pack.themeLabel || resolved.pack.packId) + ' · ' + resolved.pack.acceptedLevelId + ' · ' + resolved.pack.packId;
  statusEl.appendChild(line);
}

// I6H-D16 (Task 10): the ONE entry point for Shadow-mode Repeat. Sets
// the explicit item identity BEFORE recognition starts, so
// scoreListenRepeat() scores against the item the student actually
// clicked — never state.listenSentenceIdx (a different mode's index).
// Also bumps listeningSessionId so a stale recognition callback from a
// PREVIOUS click (e.g. the student clicked B, then C, before B's
// recognition finished) is rejected rather than silently scored.
// I6H-D18: shadowRepeat/shadowPlay now route through D18 active pack by default.
// Legacy LISTEN_SENTENCES index versions kept as internal fallback for Free Practice only.
function shadowRepeat(idx) {
  // D18 active pack takes priority
  if (state.d18ActivePackItems && state.d18ActivePackItems.length > 0) {
    shadowRepeatD18(idx);
    return;
  }
  // Legacy fallback (Free Practice only — not recommended for normal curriculum use)
  state.listeningSessionId = (state.listeningSessionId || 0) + 1;
  state.listenActiveMode = 'shadow';
  state.listenActiveItemIdx = idx;
  state.listenActiveD18Mode = false;
  startSpeech();
}

function shadowPlay(idx) {
  if (state.d18ActivePackItems && state.d18ActivePackItems.length > 0) {
    shadowPlayD18(idx);
    return;
  }
  const s = LISTEN_SENTENCES[idx];
  if (s) speak(s.en, 'en');
}

function initDictation() {
  state.dictationIdx = 0;
}

// I6H-D18: playDictation and checkDictation use D18 active pack items when available.
// Falls back to legacy LISTEN_SENTENCES only in Free Practice mode.
function _getDictationItem() {
  const d18items = _getD18ActivePackItems();
  if (d18items.length > 0) {
    const progress = _d18ActiveProgress();
    const tasks = state.d18ActivePackTasks || [];
    const keywordTask = tasks.find(function(task){
      return task.taskType === 'keyword-dictation' && (!progress || task.stageId === progress.activeStageId);
    });
    let itemIndex = Math.max(0, Math.min(d18items.length - 1, Number(state.d18ActivePackIndex || 0)));
    if (keywordTask) {
      const taskItemIndex = d18items.findIndex(function(item){ return (item.contentId || item.canonicalListeningId) === keywordTask.itemId; });
      if (taskItemIndex >= 0) itemIndex = taskItemIndex;
    }
    const item = d18items[itemIndex];
    const sections = _d18Sections(item);
    let section = _d18SelectedSection(item) || sections[0] || null;
    if (keywordTask && keywordTask.passageOrSectionIdentity) {
      section = sections.find(function(s){ return s.sectionId === keywordTask.passageOrSectionIdentity; }) || section;
    }
    const expectedKeywords = keywordTask && keywordTask.correctAnswer && Array.isArray(keywordTask.correctAnswer.expectedKeywords)
      ? keywordTask.correctAnswer.expectedKeywords.slice() : [];
    const text = section ? section.text : _d18CompleteText(item, false);
    const pashto = (typeof item.pashtoSupport === 'string') ? item.pashtoSupport : (item.pashto || item.dari || '');
    return {
      en:text, dari:pashto, _d18:true, contentId:item.contentId || item.canonicalListeningId,
      itemIndex:itemIndex, sectionId:section && section.sectionId,
      taskId:keywordTask && keywordTask.taskId, stageId:(keywordTask && keywordTask.stageId) || (progress && progress.activeStageId),
      scoringMode:keywordTask ? keywordTask.scoringMode : 'text-similarity', expectedKeywords:expectedKeywords,
      minimumMatches:keywordTask && keywordTask.correctAnswer ? Number(keywordTask.correctAnswer.minimumMatches || 1) : 0
    };
  }
  const legacy = LISTEN_SENTENCES[state.dictationIdx % LISTEN_SENTENCES.length] || { en:'', dari:'' };
  return Object.assign({ _d18:false }, legacy);
}

function playDictation(slow) {
  const item = _getDictationItem();
  if (!item.en) return;
  try {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (slow) {
      state.speechRate = 0.6; speak(item.en, 'en');
      state.speechRate = parseFloat(load('speech_rate')) || 0.85;
    } else speak(item.en, 'en');
  } catch (e) { _recordD18TechnicalFailure('tts-hardware-release-failure'); }
}

function checkDictation() {
  const inputEl = document.getElementById('dictation-input');
  const input = inputEl ? inputEl.value.trim() : '';
  const item = _getDictationItem();
  let score;
  if (item.scoringMode === 'keyword-match' && item.expectedKeywords.length) {
    const normalized = input.toLowerCase();
    const matches = item.expectedKeywords.filter(function(word){ return normalized.indexOf(String(word).toLowerCase()) !== -1; }).length;
    score = Math.round((matches / item.expectedKeywords.length) * 100);
  } else score = calculateScore(input, item.en);
  const result = document.getElementById('dictation-result');
  if (result) {
    result.style.display = 'block'; result.textContent = '';
    const badge = document.createElement('div');
    badge.className = 'badge ' + (score >= 70 ? 'badge-emerald' : score >= 40 ? 'badge-gold' : 'badge-red');
    badge.textContent = score + '%'; result.appendChild(badge);
    const expected = document.createElement('div'); expected.style.cssText = 'margin-top:6px;font-size:13px;';
    expected.textContent = item.scoringMode === 'keyword-match' ? 'Expected key words: ' + item.expectedKeywords.join(', ') : 'Expected: ' + item.en;
    result.appendChild(expected);
    const support = document.createElement('div'); support.style.cssText = 'font-size:13px;color:var(--text-muted);direction:rtl;text-align:right;';
    support.textContent = item.dari || item.pashto || ''; result.appendChild(support);
  }
  const message = score >= 90 ? 'Excellent. Your dictation was accurate.' : score >= 70 ? 'Good work. Your dictation was mostly correct.' : score >= 40 ? 'Listen again and check the missed words.' : 'Keep practicing. Replay the selected section and try again.';
  setTimeout(function(){ speak(message, 'en'); }, 400);
  if (item._d18 && item.contentId) {
    try {
      const cc = _d18CC(), ctx = _d18StudentContext(), progress = _d18ActiveProgress();
      if (cc && ctx.ok && progress && state.d18ActivePack) {
        const attemptId = [progress.sessionId, item.stageId || progress.activeStageId, item.contentId, item.taskId || 'dictation', 'dictation-' + state.dictationIdx].join('::');
        if (item.taskId && typeof cc.completeListeningTaskD18 === 'function') {
          cc.completeListeningTaskD18({ studentId:ctx.student.studentId, packId:state.d18ActivePack.packId, packVersion:state.d18ActivePack.packVersion, routeMode:state.d18ActiveRouteMode, stageId:item.stageId, itemId:item.contentId, taskId:item.taskId, score:score, attemptId:attemptId, currentPosition:item.itemIndex });
        } else if (typeof cc.updateListeningItemProgressD18 === 'function') {
          cc.updateListeningItemProgressD18(ctx.student.studentId, state.d18ActivePack.packId, item.contentId, score, false, { packVersion:state.d18ActivePack.packVersion, routeMode:state.d18ActiveRouteMode, stageId:item.stageId, taskId:item.taskId, attemptId:attemptId, currentPosition:item.itemIndex });
        }
      }
    } catch (e) {}
  }
}

function nextDictation() {
  state.dictationIdx++;
  const inp = document.getElementById('dictation-input');
  if (inp) inp.value = '';
  document.getElementById('dictation-result').style.display = 'none';
  const statusEl = document.getElementById('dictation-mic-status');
  if (statusEl) statusEl.textContent = '';
  const btn = document.getElementById('dictation-mic-btn');
  if (btn) { btn.classList.remove('listening'); btn.textContent = '🎙️'; }
}

// v1.13B: Mic answer for Dictation — patience improved
function dictationMicSpeak() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    const statusEl = document.getElementById('dictation-mic-status');
    if (statusEl) statusEl.textContent = 'Speech recognition not supported. Type your answer; no score was recorded.';
    _recordD18TechnicalFailure('recognition-unsupported');
    return;
  }
  window.speechSynthesis.cancel();

  const btn      = document.getElementById('dictation-mic-btn');
  const statusEl = document.getElementById('dictation-mic-status');
  const inputEl  = document.getElementById('dictation-input');

  // If already listening, stop
  if (btn && btn.classList.contains('listening')) {
    if (window._dictationRec) { try { window._dictationRec.stop(); } catch(e){} }
    return;
  }

  if (btn) { btn.classList.add('listening'); btn.textContent = '🔴'; }
  if (statusEl) statusEl.textContent = '🎙️ Listening… speak clearly. Take your time.';

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  rec.lang = 'en-US';
  rec.continuous = false;
  rec.interimResults = true;
  window._dictationRec = rec;

  // v1.13B: silence patience for dictation
  var _dictSilTimer = null;
  function _dictResetSil() {
    clearTimeout(_dictSilTimer);
    _dictSilTimer = setTimeout(function() {
      if (window._dictationRec) { try { window._dictationRec.stop(); } catch(e){} }
    }, SPEECH_SILENCE_GRACE_MS);
  }

  rec.onresult = (e) => {
    const interim = Array.from(e.results).map(r => r[0].transcript).join('');
    if (inputEl) inputEl.value = interim;
    _dictResetSil();
    if (e.results[e.results.length-1].isFinal) {
      if (statusEl) statusEl.textContent = '✅ Heard: "' + interim + '" — tap Check ✓ to score';
    } else {
      if (statusEl) statusEl.textContent = '🎙️ Hearing: "' + interim + '"…';
    }
  };
  rec.onend = () => {
    clearTimeout(_dictSilTimer);
    window._dictationRec = null;
    if (btn) { btn.classList.remove('listening'); btn.textContent = '🎙️'; }
    const val = inputEl ? inputEl.value.trim() : '';
    if (!val && statusEl) statusEl.textContent = 'Nothing heard — try again or type your answer.';
  };
  rec.onerror = (e) => {
    clearTimeout(_dictSilTimer);
    window._dictationRec = null;
    if (btn) { btn.classList.remove('listening'); btn.textContent = '🎙️'; }
    if (statusEl) {
      const code = _d18SpeechTechnicalErrorCode(e.error);
      statusEl.textContent = 'Microphone/recognition error (' + code + '). Retry or type the answer; no score was recorded.';
      _recordD18TechnicalFailure(code);
    }
  };
  try { rec.start(); _dictResetSil(); }
  catch (e) {
    window._dictationRec = null;
    if (btn) { btn.classList.remove('listening'); btn.textContent = '🎙️'; }
    const code = _d18SpeechTechnicalErrorCode(e && e.name || 'invalid-state');
    if (statusEl) statusEl.textContent = 'Microphone could not start (' + code + '). Type the answer; no score was recorded.';
    _recordD18TechnicalFailure(code);
  }
}

function renderSoundPairs() {
  const el = document.getElementById('sound-pairs-list');
  if (!el) return;
  el.innerHTML = SOUND_PAIRS.map(p => `
    <div class="card" style="margin-bottom:10px;">
      <div style="font-size:18px;font-weight:800;color: var(--lapis-text);margin-bottom:8px;">${p.pair}</div>
      <div style="font-size:14px;margin-bottom:4px;"><b>Example 1:</b> ${p.example_v}</div>
      <div style="font-size:14px;margin-bottom:8px;"><b>Example 2:</b> ${p.example_w}</div>
      <div style="font-size:13px;color:var(--text-muted);">${p.tip}</div>
      <div class="dari" style="font-size:13px;color:var(--text-muted);">${p.dari_tip}</div>
      <button class="btn btn-outline btn-sm mt-8" onclick="speak('${p.example_v.split(',')[0].trim()}','en')">🔊 Hear</button>
    </div>
  `).join('');
}

// ===== REVIEW =====
function renderReview() {
  const history = state.history;
  const today = new Date().toDateString();
  const todaySessions = history.filter(h => new Date(h.date).toDateString() === today);
  document.getElementById('sum-sessions').textContent = todaySessions.length || '0';
  const avgScore = todaySessions.length ? Math.round(todaySessions.reduce((a,b) => a + (b.score||0), 0) / todaySessions.length) : 0;
  document.getElementById('sum-score').textContent = avgScore ? avgScore + '%' : '—';
  document.getElementById('review-streak').textContent = state.streak.current;
  document.getElementById('review-streak-msg').textContent = state.streak.current > 0 ? `Keep it up! Longest: ${state.streak.longest} days` : 'Start your streak today!';
  renderBadges();
  renderHistory('all');
  renderWeakAreas();

  // PHASE: Teaching Display & Voice Professionalization Fix — Part 6
  // Auto-read a professional, personalized English summary aloud each
  // time the Review page opens. speak()/speechSynthesis.cancel() already
  // prevent overlap, so rapid re-navigation just restarts cleanly — no
  // looping. The "Stop Reading" button appears automatically (global wrap).
  try {
    const who = window.zirakActiveStudentName ? window.zirakActiveStudentName() : null;
    const name = (who && who.hasStudent) ? who.firstName : '';
    const weakCount = history.filter(h => (h.score||0) < 60).length;

    let reviewMsg;
    if (todaySessions.length === 0) {
      reviewMsg = (name ? name + ', ' : '') + 'you have not practiced today yet. Open a lesson and start your first session.';
    } else {
      const subject = name || 'You';
      const sessionsWord = todaySessions.length === 1 ? 'session' : 'sessions';
      reviewMsg = `Today, ${subject} completed ${todaySessions.length} ${sessionsWord}. ` +
        (avgScore ? `Average score is ${avgScore} percent. ` : '') +
        (avgScore >= 90 ? 'Excellent work. ' : avgScore >= 70 ? 'Good work. ' : avgScore > 0 ? 'Keep practicing — you are improving. ' : '') +
        (weakCount > 0 ? `Please review the ${weakCount} item${weakCount===1?'':'s'} in Needs Practice.` : 'Continue practicing every day to keep your streak going.');
    }
    speak(reviewMsg, 'en');
  } catch (e) { /* never let TTS errors break the Review page */ }
}

function renderBadges() {
  const el = document.getElementById('badges-area');
  el.innerHTML = MILESTONES.map(m => `
    <div class="badge ${state.milestones.includes(m.id) ? 'badge-gold' : 'badge-lapis'}" style="opacity:${state.milestones.includes(m.id)?1:0.4};">
      ${m.icon} ${m.en}
    </div>
  `).join('');
}

function filterHistory(filter) {
  ['all','en'].forEach(f => {
    document.getElementById('hf-'+f)?.classList.toggle('active', f===filter);
  });
  renderHistory(filter);
}

function renderHistory(filter) {
  const el = document.getElementById('history-list');
  let history = state.history;
  if (filter === 'english') history = history.filter(h => h.mode === 'english');
    if (!history.length) {
    el.innerHTML = `<div class="empty-state" style="padding:32px 20px;"><div class="es-icon">📚</div><div class="es-text">No history yet. Start practicing!</div><div class="es-dari dari">لا تاریخچه نشته.</div></div>`;
    return;
  }
  const icons = { dialogue:'💬', topic:'📝', quiz:'🔤', listen:'🔊' };
  el.innerHTML = history.slice().reverse().slice(0, 20).map(h => `
    <div class="history-item">
      <div class="history-icon" style="background:${h.score>=70?'rgba(26,107,74,0.12)':'rgba(212,160,23,0.12)'};">
        ${icons[h.type] || '📚'}
      </div>
      <div class="history-info">
        <div class="history-title">${h.topic || 'Practice'}</div>
        <div class="history-meta">${new Date(h.date).toLocaleDateString()} · ${h.mode || 'parallel'} mode</div>
      </div>
      <div class="history-score" style="color:${h.score>=70?'var(--emerald)':h.score>=40?'var(--gold)':'var(--red)'};">${h.score||0}%</div>
    </div>
  `).join('');
}

function renderWeakAreas() {
  const el = document.getElementById('weak-areas-list');
  const poor = state.history.filter(h => h.score < 60).slice(-5);
  if (!poor.length) return;
  el.innerHTML = poor.map(h => `
    <div style="padding:10px 0;border-bottom:1px solid var(--divider);">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="font-size:14px;font-weight:700;">${h.topic}</div>
        <span class="badge badge-red">${h.score||0}%</span>
      </div>
      <div style="font-size:12px;color:var(--text-muted);">${h.type} · ${new Date(h.date).toLocaleDateString()}</div>
    </div>
  `).join('') + `<button class="btn btn-primary btn-sm mt-8" onclick="navigate('dialogue')">📚 Practice These</button>`;
}

// ===== LEARNING PATH =====
// ===== SCHOOL PATH v1.7 =====

// School Path data — classes, units, steps (mapped to existing content)
const SCHOOL_PATH = [
  {
    id: 'starter', icon: '🌱', color: '#e8f8f0',
    en: 'Starter', dari:'',
    units: [
      { id: 'nursery-greet', en: 'Greetings', dari:'',
        steps: [
          { id:'nG-w', type:'words', en:'Learn Words', dari:'', target:'animals' },
          { id:'nG-l', type:'listening', en:'Listening Practice', dari:'' },
          { id:'nG-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'greet-01' },
          { id:'nG-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'nursery-family', en: 'My Family', dari:'',
        steps: [
          { id:'nF-w', type:'words', en:'Learn Words', dari:'', target:'family' },
          { id:'nF-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'family-03' },
          { id:'nF-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'nursery-food', en: 'Food & Eating', dari:'',
        steps: [
          { id:'nFd-w', type:'words', en:'Learn Words', dari:'', target:'food' },
          { id:'nFd-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'food-06' },
          { id:'nFd-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      }
    ]
  },
  {
    id: 'basic', icon: '📘', color: '#e8f4fd',
    en: 'Basic English', dari:'',
    units: [
      { id: 'basic-intro', en: 'Introducing Yourself', dari:'',
        steps: [
          { id:'bI-w', type:'words', en:'Learn Words', dari:'', target:'school' },
          { id:'bI-l', type:'listening', en:'Listening Practice', dari:'' },
          { id:'bI-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'intro-02' },
          { id:'bI-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'basic-school', en: 'At School', dari:'',
        steps: [
          { id:'bS-w', type:'words', en:'Learn Words', dari:'', target:'school' },
          { id:'bS-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'school-04' },
          { id:'bS-s', type:'story', en:'Story Practice', dari:'', target:'first-day' },
          { id:'bS-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'basic-daily', en: 'Daily Routine', dari:'',
        steps: [
          { id:'bD-w', type:'words', en:'Learn Words', dari:'', target:'home' },
          { id:'bD-d', type:'topic', en:'Topic Practice', dari:'', target:'daily-morning' },
          { id:'bD-t', type:'topic', en:'Topic Practice', dari:'', target:'my-community' },
          { id:'bD-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      }
    ]
  },
  {
    id: 'beginner', icon: '🗣️', color: '#fdf0e8',
    en: 'Beginner Speaking', dari:'',
    units: [
      { id: 'beg-shopping', en: 'Shopping', dari:'',
        steps: [
          { id:'bgSh-w', type:'words', en:'Learn Words', dari:'', target:'food' },
          { id:'bgSh-l', type:'listening', en:'Listening Practice', dari:'' },
          { id:'bgSh-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'supermarket-beginner' },
          { id:'bgSh-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'beg-directions', en: 'Asking Directions', dari:'',
        steps: [
          { id:'bgDr-w', type:'words', en:'Learn Words', dari:'', target:'places' },
          { id:'bgDr-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'directions-beginner' },
          { id:'bgDr-t', type:'topic', en:'Topic Practice', dari:'', target:'my-community' },
          { id:'bgDr-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'beg-health', en: 'Doctor Visit', dari:'',
        steps: [
          { id:'bgH-w', type:'words', en:'Learn Words', dari:'', target:'health_body' },
          { id:'bgH-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'health-05' },
          { id:'bgH-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      }
    ]
  },
  {
    id: 'elementary', icon: '🌿', color: '#fffbe8',
    en: 'Elementary Conversation', dari:'',
    units: [
      { id: 'elem-daily', en: 'Daily Conversations', dari:'',
        steps: [
          { id:'elD-w', type:'words', en:'Learn Words', dari:'', target:'daily_actions' },
          { id:'elD-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'morning-routine-basic' },
          { id:'elD-t', type:'topic', en:'Topic Practice', dari:'', target:'my-community' },
          { id:'elD-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'elem-places', en: 'Visiting Places', dari:'',
        steps: [
          { id:'elP-w', type:'words', en:'Learn Words', dari:'', target:'places' },
          { id:'elP-d', type:'story', en:'Story Practice', dari:'', target:'museum-visit' },
          { id:'elP-t', type:'topic', en:'Topic Practice', dari:'', target:'my-community' },
          { id:'elP-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'elem-school', en: 'School and Study', dari:'',
        steps: [
          { id:'elS-w', type:'words', en:'Learn Words', dari:'', target:'school' },
          { id:'elS-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'homework-help-basic' },
          { id:'elS-s', type:'topic', en:'Topic Practice', dari:'', target:'my-school-day' },
          { id:'elS-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'elem-opinion', en: 'Simple Opinions', dari:'',
        steps: [
          { id:'elO-l', type:'listening', en:'Listening Practice', dari:'' },
          { id:'elO-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'hobbies-beginner' },
          { id:'elO-t', type:'topic', en:'Topic Practice', dari:'', target:'afghan-heritage' },
          { id:'elO-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'elem-problems', en: 'Everyday Problems', dari:'',
        steps: [
          { id:'elPr-w', type:'words', en:'Learn Words', dari:'', target:'community_services' },
          { id:'elPr-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'internet-problem-basic' },
          { id:'elPr-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      }
    ]
  },
  {
    id: 'intermediate', icon: '💬', color: '#f0f8ee',
    en: 'Intermediate Real Life', dari:'',
    units: [
      { id: 'int-job', en: 'Job Interview', dari:'',
        steps: [
          { id:'iJ-w', type:'words', en:'Learn Words', dari:'', target:'business' },
          { id:'iJ-l', type:'listening', en:'Listening Practice', dari:'' },
          { id:'iJ-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'job-interview-advanced' },
          { id:'iJ-t', type:'topic', en:'Topic Practice', dari:'', target:'afghan-heritage' },
          { id:'iJ-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'int-bank', en: 'Bank & Services', dari:'',
        steps: [
          { id:'iB-w', type:'words', en:'Learn Words', dari:'', target:'business' },
          { id:'iB-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'bank-intermediate' },
          { id:'iB-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'int-transport', en: 'Transport', dari:'',
        steps: [
          { id:'iT-w', type:'words', en:'Learn Words', dari:'', target:'transport' },
          { id:'iT-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'bus-card-03' },
          { id:'iT-s', type:'story', en:'Story Practice', dari:'', target:'calling-grandma' },
          { id:'iT-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      }
    ]
  },
  {
    id: 'advanced', icon: '⚡', color: '#f4e8fd',
    en: 'Advanced Speaking', dari:'',
    units: [
      { id: 'adv-opinion', en: 'Giving Opinions', dari:'',
        steps: [
          { id:'aO-l', type:'listening', en:'Listening Practice', dari:'' },
          { id:'aO-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'climate-change-advanced' },
          { id:'aO-t', type:'topic', en:'Topic Practice', dari:'', target:'environment' },
          { id:'aO-s', type:'story', en:'Story Practice', dari:'', target:'kabul-market' },
          { id:'aO-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'adv-culture', en: 'Culture & Identity', dari:'',
        steps: [
          { id:'aC-w', type:'words', en:'Learn Words', dari:'', target:'nature' },
          { id:'aC-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'nowruz-intermediate' },
          { id:'aC-t', type:'topic', en:'Topic Practice', dari:'', target:'afghan-heritage' },
          { id:'aC-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      }
    ]
  },
  {
    id: 'academic', icon: '🎓', color: '#e8fdf4',
    en: 'Academic / IELTS', dari:'',
    units: [
      { id: 'aca-part1', en: 'Personal Questions', dari:'',
        steps: [
          { id:'aP1-l', type:'listening', en:'Listening Practice', dari:'' },
          { id:'aP1-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'ielts-part1' },
          { id:'aP1-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'aca-part2', en: 'Topic Card', dari:'',
        steps: [
          { id:'aP2-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'ielts-part2' },
          { id:'aP2-t', type:'topic', en:'Topic Practice', dari:'', target:'environment' },
          { id:'aP2-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      },
      { id: 'aca-academic', en: 'Academic Vocabulary', dari:'',
        steps: [
          { id:'aAc-w', type:'words', en:'Learn Words', dari:'', target:'business' },
          { id:'aAc-d', type:'dialogue', en:'Dialogue Practice', dari:'', target:'university-application-academic' },
          { id:'aAc-t', type:'dialogue', en:'Dialogue Practice', dari:'', target:'academic-presentation' },
          { id:'aAc-q', type:'quiz', en:'Unit Review', dari:'' }
        ]
      }
    ]
  }
];
// I6H-D13: expose SCHOOL_PATH on window. Top-level `const` in a classic
// script never becomes a window property, so window.SCHOOL_PATH was
// silently undefined everywhere it was already relied on (the D12A
// Placement Engine's classDisplayName(), and this phase's new activity
// registry). This is a one-line, read-only, additive fix — SCHOOL_PATH
// itself is completely unchanged.
window.SCHOOL_PATH = SCHOOL_PATH;

// v1.17C: Pashto-only support labels for the legacy School Path.
// The UI still reads `.dari` compatibility slots, so this safely fills them with Pashto.
(function normalizeSchoolPathPashtoOnly() {
  try {
    var classPs = {
      nursery: 'پیل کچه',
      basic: 'بنسټیزه انګلیسي',
      beginner: 'د پیل کوونکي خبرې',
      elementary: 'ابتدایي خبرې اترې',
      intermediate: 'منځنی واقعي ژوند',
      advanced: 'پرمختللې خبرې',
      academic: 'اکاډمیک / IELTS'
    };
    var unitPs = {
      'nursery-greet': 'سلامونه',
      'nursery-family': 'زما کورنۍ',
      'nursery-food': 'خواړه او خوړل',
      'basic-intro': 'ځان پېژندنه',
      'basic-school': 'په ښوونځي کې',
      'basic-daily': 'ورځنی معمول',
      'beg-shopping': 'پېرود',
      'beg-directions': 'د لارې پوښتنه',
      'beg-health': 'ډاکټر ته تګ',
      'elem-daily': 'ورځنۍ خبرې',
      'elem-places': 'ځایونو ته تلل',
      'elem-school': 'ښوونځی او مطالعه',
      'elem-opinion': 'ساده نظرونه',
      'elem-problems': 'ورځنۍ ستونزې',
      'int-services': 'خدمتونه او دفترونه',
      'int-travel': 'سفر او ټرانسپورټ',
      'int-work': 'کار او مسلک',
      'int-community': 'ټولنه او اړیکې',
      'adv-arguments': 'دلیل او بحث',
      'adv-interview': 'مرکه او خبرې اترې',
      'adv-explain': 'تشریح او بیان',
      'academic-ielts1': 'IELTS خبرې ـ لومړی پړاو',
      'academic-writing': 'اکاډمیک لیکل',
      'academic-presentation': 'اکاډمیک وړاندې کول'
    };
    var stepPs = {
      words: 'د کلیمو زده کړه',
      listening: 'د اورېدلو تمرین',
      dialogue: 'د خبرو تمرین',
      story: 'د کیسې تمرین',
      topic: 'د موضوع تمرین',
      quiz: 'د واحد بیاکتنه'
    };
    (SCHOOL_PATH || []).forEach(function(cls) {
      cls.dari = classPs[cls.id] || cls.en || '';
      (cls.units || []).forEach(function(unit) {
        unit.dari = unitPs[unit.id] || unit.en || '';
        (unit.steps || []).forEach(function(step) {
          step.dari = stepPs[step.type] || step.en || '';
        });
      });
    });
  } catch (e) {}
})();


const STEP_ICONS = { words:'🔤', listening:'🔊', dialogue:'🎙️', story:'📖', topic:'💬', quiz:'📝' };

// ===== SCHOOL PATH MAPPING VALIDATOR (v1.8A) =====
// Runs once after content loads. Logs mismatches to console — no UI impact.
function validateSchoolPathMappings() {
  const issues = [];
  for (const cls of SCHOOL_PATH) {
    for (const unit of cls.units) {
      for (const step of unit.steps) {
        if (!step.target) continue;
        const t = step.target;
        let ok = false;
        if (step.type === 'words') {
          ok = !!(WORD_SETS && WORD_SETS[t]);
        } else if (step.type === 'dialogue') {
          ok = DIALOGUES.some(d => d.id === t);
        } else if (step.type === 'story') {
          ok = STORIES.some(s => s.id === t);
        } else if (step.type === 'topic') {
          ok = TOPIC_STUDIO_DATA.some(tp => tp.id === t);
        } else if (step.type === 'listening' || step.type === 'quiz') {
          ok = true; // listening uses generic fallback; quiz is placeholder
        }
        if (!ok) {
          issues.push(`[School Path] ${cls.id} / ${unit.id} / ${step.id}: type="${step.type}" target="${t}" NOT FOUND`);
        }
      }
    }
  }
  if (issues.length === 0) {
    console.log('[Zirak v1.8A] School Path mappings: all OK ✓');
  } else {
    issues.forEach(msg => console.warn(msg));
  }
}
// Run validator after a short delay to ensure content arrays are populated
setTimeout(validateSchoolPathMappings, 500);



function renderSchoolPath() {
  updateSchoolHomeCard();
  showSchoolTab(state.schoolActiveTab || 'path');
}

function showSchoolTab(tab) {
  state.schoolActiveTab = tab;
  ['path','placement','free'].forEach(t => {
    const el = document.getElementById('sp-view-' + t);
    const btn = document.getElementById('sp-tab-' + t);
    if (el) el.style.display = t === tab ? '' : 'none';
    if (btn) btn.classList.toggle('active', t === tab);
  });
  if (tab === 'path') renderSchoolClasses();
  if (tab === 'placement') {
    // I6H-D12: ONE placement system — the professional adaptive engine.
    if (window.ZirakPlacementEngine && typeof window.ZirakPlacementEngine.open === 'function') {
      window.ZirakPlacementEngine.open();
    }
  }
}

function renderSchoolClasses() {
  const list = document.getElementById('sp-classes-list');
  if (!list) return;

  const currentClass = state.schoolCurrentClass;
  const currentUnit = state.schoolCurrentUnit;

  // Guidance text
  const guide = document.getElementById('sp-guidance-text');
  if (guide) {
    if (!state.schoolModeStarted) {
      guide.innerHTML = '👋 <strong>School Path</strong> = guided learning, step by step. Tap a class below to start. Use <strong>Placement</strong> to find your level, or <strong>Free Practice</strong> to explore freely.';
    } else {
      const cls = SCHOOL_PATH.find(c => c.id === currentClass);
      const unit = cls?.units.find(u => u.id === currentUnit);
      guide.innerHTML = `📖 Continue My Lesson: <strong>${unit?.en || cls?.en || 'your current unit'}</strong>. Tap the highlighted unit below to continue.`;
    }
  }

  // Unit panel (if a unit is selected)
  const panel = document.getElementById('sp-unit-panel');
  if (panel) {
    if (currentUnit) {
      renderSchoolUnitPanel(currentUnit);
      panel.style.display = '';
    } else {
      panel.style.display = 'none';
    }
  }

  list.innerHTML = SCHOOL_PATH.map((cls, ci) => {
    const isCurrentClass = cls.id === currentClass;
    const isClassCompleted = state.schoolCompletedClasses.includes(cls.id);

    const unitsHtml = cls.units.map((unit, ui) => {
      const isCurrentUnit = unit.id === currentUnit;
      const completedCount = unit.steps.filter(s => state.schoolCompletedSteps.includes(s.id)).length;
      const unitStatus = getUnitStatus(unit);
      const statusInfo = UNIT_STATUS_LABELS[unitStatus] || UNIT_STATUS_LABELS['not-started'];
      const quizScore = state.schoolUnitScores[unit.id];
      const locked = state.schoolModeStarted && isCurrentClass && !isUnitUnlocked(cls, ui);

      return `
        <div class="school-unit-row ${locked ? 'unit-locked' : ''}" onclick="${locked ? 'showLockedUnitMsg()' : `selectSchoolUnit('${cls.id}','${unit.id}')`}" style="${locked ? 'opacity:0.5;cursor:not-allowed;' : ''}">
          <div class="school-unit-dot ${unitStatus==='passed'?'done':isCurrentUnit?'current':''}">
            ${unitStatus==='passed' ? '✓' : locked ? '🔒' : (isCurrentUnit ? '▶' : (ui+1))}
          </div>
          <div class="school-unit-info">
            <div class="school-unit-name">${unit.en}</div>
            <div class="school-unit-dari dari">${unit.dari}</div>
            <div style="margin-top:3px;">
              <span style="font-size:10px;padding:2px 6px;border-radius:99px;background:${statusInfo.bg};color:${statusInfo.color};font-weight:600;">${statusInfo.badge}</span>
              ${quizScore !== undefined ? `<span style="font-size:10px;margin-left:4px;color:var(--text-muted);">Quiz: ${quizScore}%</span>` : ''}
            </div>
          </div>
          <div style="font-size:11px;color:var(--text-muted);margin-right:4px;">${completedCount}/${unit.steps.length}</div>
          <div class="school-unit-arrow">${locked ? '' : '›'}</div>
        </div>`;
    }).join('');

    const passedCount = cls.units.filter(u => state.schoolUnitPassStatus[u.id] === 'passed').length;

    return `
      <div class="school-class-card ${isCurrentClass?'active-class':''}">
        <div class="school-class-header" onclick="toggleSchoolClass('${cls.id}')">
          <div class="school-class-icon" style="background:${cls.color};">${cls.icon}</div>
          <div class="school-class-info">
            <div class="school-class-name">${cls.en} ${isClassCompleted ? '🏆' : ''}</div>
            <div class="school-class-dari dari">${cls.dari}</div>
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-right:4px;">${passedCount}/${cls.units.length} passed</div>
          <div class="school-class-badge">${isCurrentClass ? '▼' : '›'}</div>
        </div>
        <div class="school-units-area ${isCurrentClass?'open':''}" id="cls-units-${cls.id}">
          ${unitsHtml}
          ${!state.schoolModeStarted ?
            `<div style="padding:10px 14px;">
              <button class="btn btn-primary btn-sm" onclick="startSchoolPath('${cls.id}')">▶ Start Here</button>
            </div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function showLockedUnitMsg() {
  showToast('🔒 Pass the previous unit quiz first to unlock this unit.');
}

function toggleSchoolClass(classId) {
  SCHOOL_PATH.forEach(cls => {
    const el = document.getElementById('cls-units-' + cls.id);
    if (el) {
      if (cls.id === classId) el.classList.toggle('open');
      else el.classList.remove('open');
    }
  });
}

function startSchoolPath(classId) {
  const cls = SCHOOL_PATH.find(c => c.id === classId);
  if (!cls || !cls.units.length) return;
  state.schoolModeStarted = true;
  state.schoolCurrentClass = classId;
  state.schoolCurrentUnit = cls.units[0].id;
  save('school_started', '1');
  save('school_class', classId);
  // I6H-D11B: choosing a class through the approved School Path flow IS the
  // existing manual level selection — record it (unless placement already
  // accepted this exact level, keep that source).
  try {
    var _acc = JSON.parse(load('placement_accepted') || 'null');
    if (!_acc || _acc.level !== classId) {
      save('placement_accepted', JSON.stringify({
        level: classId, source: 'manual', at: new Date().toISOString()
      }));
    }
  } catch(e) {}
  // I6H-D12A Task 27: the ONE manual picker calls the ONE narrow decision
  // bridge after its own accepted-level save succeeds. Idempotent and
  // safe (no-op) when no unresolved Placement result exists, or when the
  // latest result is already resolved (e.g. this call is itself nested
  // inside acceptRecommendation()'s own window.acceptPlacement() call,
  // which resolves the result BEFORE calling here).
  try {
    if (window.ZirakPlacementEngine && typeof window.ZirakPlacementEngine.recordLevelDecision === 'function') {
      window.ZirakPlacementEngine.recordLevelDecision({ levelId: classId, source: 'manual', decisionType: 'manualLevelSelected' });
    }
  } catch(e) {}
  // I6H-D13: tell the Personalized Learning Plan engine directly too —
  // covers pure manual selection with no Placement result at all, which
  // the recordLevelDecision bridge above safely no-ops on (nothing to
  // resolve there is not the same as "nothing changed here").
  try {
    if (window.ZirakLearningPlan && typeof window.ZirakLearningPlan.onAcceptedLevelChanged === 'function') {
      var _curStu = (window.ZirakProfile && window.ZirakProfile.currentStudent) ? window.ZirakProfile.currentStudent() : null;
      window.ZirakLearningPlan.onAcceptedLevelChanged(_curStu ? _curStu.studentId : '');
    }
  } catch(e) {}
  save('school_unit', cls.units[0].id);
  updateSchoolHomeCard();
  renderSchoolClasses();
  showToast('🎓 School Path started: ' + cls.en);
}

function selectSchoolUnit(classId, unitId) {
  state.schoolCurrentClass = classId;
  state.schoolCurrentUnit = unitId;
  save('school_class', classId);
  save('school_unit', unitId);
  if (!state.schoolModeStarted) {
    state.schoolModeStarted = true;
    save('school_started', '1');
  }
  updateSchoolHomeCard();
  // Show unit panel
  const panel = document.getElementById('sp-unit-panel');
  if (panel) {
    renderSchoolUnitPanel(unitId);
    panel.style.display = '';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  renderSchoolClasses();
}

function renderSchoolUnitPanel(unitId) {
  const panel = document.getElementById('sp-unit-panel');
  if (!panel) return;
  let unit = null;
  let cls = null;
  for (const c of SCHOOL_PATH) {
    const u = c.units.find(u => u.id === unitId);
    if (u) { unit = u; cls = c; break; }
  }
  if (!unit) { panel.style.display = 'none'; return; }

  const unitStatus = getUnitStatus(unit);
  const statusInfo = UNIT_STATUS_LABELS[unitStatus] || UNIT_STATUS_LABELS['not-started'];
  const quizScore = state.schoolUnitScores[unit.id];
  const nonQuizSteps = unit.steps.filter(s => s.type !== 'quiz');
  const practiceStepsDone = nonQuizSteps.filter(s => state.schoolCompletedSteps.includes(s.id)).length;
  const practiceRatio = nonQuizSteps.length > 0 ? practiceStepsDone / nonQuizSteps.length : 0;
  const readyForQuiz = practiceRatio >= 0.7 || unitStatus === 'ready-for-quiz';
  const passed = unitStatus === 'passed';

  const stepsHtml = unit.steps.map((step, i) => {
    const done = state.schoolCompletedSteps.includes(step.id);
    const isCurrent = !done && unit.steps.slice(0,i).every(s => state.schoolCompletedSteps.includes(s.id));
    const isQuiz = step.type === 'quiz';

    if (isQuiz) {
      // Quiz step — show as special button
      return `
        <div class="school-step-row" onclick="launchSchoolStep('${step.id}','${unit.id}')" style="${passed ? 'opacity:0.7;' : ''}">
          <div class="school-step-num ${passed?'done':readyForQuiz?'current':''}">${passed?'✓':'📝'}</div>
          <div class="school-step-info">
            <div class="school-step-name">📝 ${step.en}</div>
            <div class="school-step-dari dari">${step.dari}</div>
            ${quizScore !== undefined ? `<div style="font-size:11px;margin-top:2px;color:${quizScore>=70?'var(--emerald)':'var(--coral)'};">Last score: ${quizScore}% ${quizScore>=70?'✅':'❌'}</div>` : ''}
          </div>
          <div class="school-step-arrow">${readyForQuiz || passed ? '›' : ''}</div>
        </div>`;
    }

    return `
      <div class="school-step-row" onclick="launchSchoolStep('${step.id}','${unit.id}')">
        <div class="school-step-num ${done?'done':isCurrent?'current':''}">${done?'✓':i+1}</div>
        <div class="school-step-info">
          <div class="school-step-name">${STEP_ICONS[step.type]||'▶'} ${step.en}</div>
          <div class="school-step-dari dari">${step.dari}</div>
        </div>
        <div class="school-step-arrow">›</div>
      </div>`;
  }).join('');

  const completedCount = unit.steps.filter(s => state.schoolCompletedSteps.includes(s.id)).length;
  const pct = Math.round(completedCount / unit.steps.length * 100);

  // Action button based on status
  let actionBtn = '';
  if (passed) {
    actionBtn = `<div style="padding:10px 14px 4px;"><button class="btn btn-outline btn-sm" onclick="launchUnitQuiz('${unit.id}')">🔄 Retake Unit Quiz</button></div>`;
  } else if (readyForQuiz) {
    actionBtn = `<div style="padding:10px 14px 4px;"><button class="btn btn-primary btn-sm" onclick="launchUnitQuiz('${unit.id}')">📝 Take Unit Quiz</button></div>`;
  } else if (unitStatus === 'needs-practice') {
    actionBtn = `<div style="padding:10px 14px 4px;"><button class="btn btn-outline btn-sm" style="color:var(--coral);" onclick="launchUnitQuiz('${unit.id}')">🔁 Retry Quiz</button></div>`;
  }

  panel.innerHTML = `
    <div class="school-unit-panel">
      <div class="school-unit-panel-header">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <div style="font-size:16px;font-weight:800;">${unit.en}</div>
            <div class="dari" style="font-size:13px;opacity:0.8;">${unit.dari}</div>
            <div style="margin-top:4px;"><span style="font-size:11px;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,0.25);font-weight:600;">${statusInfo.badge}</span></div>
          </div>
          <button onclick="closeSchoolUnitPanel()" style="background:rgba(255,255,255,0.2);border:none;border-radius:50%;width:30px;height:30px;cursor:pointer;font-size:14px;color:white;">✕</button>
        </div>
        <div style="background:rgba(255,255,255,0.2);border-radius:99px;height:5px;margin-top:10px;overflow:hidden;">
          <div style="height:100%;background:var(--gold-light);width:${pct}%;transition:width 0.3s;"></div>
        </div>
        <div style="font-size:11px;opacity:0.8;margin-top:4px;">${completedCount} of ${unit.steps.length} steps done · ${practiceStepsDone}/${nonQuizSteps.length} practice steps</div>
      </div>
      ${stepsHtml}
      ${actionBtn}
    </div>`;
}

function closeSchoolUnitPanel() {
  const panel = document.getElementById('sp-unit-panel');
  if (panel) panel.style.display = 'none';
}

function launchSchoolStep(stepId, unitId) {
  let step = null;
  let parentUnit = null;
  let parentCls = null;
  for (const cls of SCHOOL_PATH) {
    for (const unit of cls.units) {
      const s = unit.steps.find(s => s.id === stepId);
      if (s) { step = s; parentUnit = unit; parentCls = cls; break; }
    }
    if (step) break;
  }
  if (!step) return;

  // Quiz step — launch quiz engine
  if (step.type === 'quiz') {
    const unitStatus = getUnitStatus(parentUnit);
    const nonQuizSteps = parentUnit.steps.filter(s => s.type !== 'quiz');
    const practiceStepsDone = nonQuizSteps.filter(s => state.schoolCompletedSteps.includes(s.id)).length;
    const practiceRatio = nonQuizSteps.length > 0 ? practiceStepsDone / nonQuizSteps.length : 0;
    if (practiceRatio < 0.7) {
      showToast('📚 Complete at least 70% of practice steps first.');
      return;
    }
    launchUnitQuiz(parentUnit.id);
    return;
  }

  // Navigate to appropriate section
  if (step.type === 'words') {
    navigate('wordlab');
    if (step.target && WORD_SETS[step.target]) {
      setTimeout(() => {
        openWordSet(step.target);
        setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 800);
      }, 300);
    } else {
      showToast('🔤 Choose a word set to practice for this unit.');
      setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 600);
    }
  } else if (step.type === 'listening') {
    navigate('listening');
    showToast('🔊 Practice listening for this unit.');
    setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 600);
  } else if (step.type === 'dialogue') {
    navigate('dialogue');
    if (step.target) {
      setTimeout(() => {
        const d = DIALOGUES.find(d => d.id === step.target);
        if (d) {
          startDialogue(d.id);
          setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 800);
        } else {
          showToast('🎙️ Choose a dialogue to practice for this unit.');
          setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 600);
        }
      }, 300);
    } else {
      showToast('🎙️ Choose a dialogue to practice for this unit.');
      setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 600);
    }
  } else if (step.type === 'story') {
    navigate('stories');
    if (step.target) {
      setTimeout(() => {
        const s = STORIES.find(s => s.id === step.target);
        if (s) {
          openStory(s.id);
          setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 800);
        } else {
          showToast('📖 Choose a story to practice for this unit.');
          setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 600);
        }
      }, 300);
    } else {
      showToast('📖 Choose a story to practice for this unit.');
      setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 600);
    }
  } else if (step.type === 'topic') {
    navigate('topics');
    if (step.target) {
      setTimeout(() => {
        const t = TOPIC_STUDIO_DATA.find(t => t.id === step.target);
        if (t) {
          openTopicWizard(t.id);
          setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 800);
        } else {
          showToast('💬 Choose a topic to practice for this unit.');
          setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 600);
        }
      }, 300);
    } else {
      showToast('💬 Choose a topic to practice for this unit.');
      setTimeout(() => showMarkPracticedPrompt(stepId, unitId), 600);
    }
  }
}

// Called from practice engines when a scored session completes from a school step
function tryAutoCompleteSchoolStep(stepId, score) {
  if (!stepId) return;
  if (score >= 70) {
    if (!state.schoolCompletedSteps.includes(stepId)) {
      state.schoolCompletedSteps.push(stepId);
      save('school_steps', JSON.stringify(state.schoolCompletedSteps));
      showToast('✅ Step auto-completed! Score: ' + score + '%');
      updateSchoolHomeCard();
      if (state.schoolCurrentUnit) renderSchoolUnitPanel(state.schoolCurrentUnit);
      renderSchoolClasses();
    }
  } else if (score > 0) {
    showToast('🔁 Score ' + score + '% — practice more to complete this step (need 70%).');
  }
}

function showMarkPracticedPrompt(stepId, unitId) {
  const existing = document.getElementById('mark-practiced-toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'mark-practiced-toast';
  el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--lapis);color:#fff;padding:10px 16px;border-radius:12px;z-index:9999;display:flex;gap:10px;align-items:center;font-size:13px;box-shadow:0 4px 16px rgba(0,0,0,0.3);max-width:340px;';
  el.innerHTML = `
    <span>Finished practicing?</span>
    <button onclick="markSchoolStepDone('${stepId}','${unitId||''}')" style="background:var(--gold);color:#1a1a1a;border:none;border-radius:8px;padding:5px 10px;font-weight:700;cursor:pointer;font-size:11px;white-space:nowrap;">✓ Mark Practiced Manually</button>
    <button onclick="document.getElementById('mark-practiced-toast').remove()" style="background:transparent;color:#aaa;border:none;cursor:pointer;font-size:16px;">✕</button>`;
  document.body.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 14000);
}

function markSchoolStepDone(stepId, unitId) {
  if (!state.schoolCompletedSteps.includes(stepId)) {
    state.schoolCompletedSteps.push(stepId);
    save('school_steps', JSON.stringify(state.schoolCompletedSteps));
  }
  const el = document.getElementById('mark-practiced-toast');
  if (el) el.remove();
  updateSchoolHomeCard();
  showToast('✅ Step marked as practiced!');
  // Refresh unit panel if open
  if (state.schoolCurrentUnit) {
    const panel = document.getElementById('sp-unit-panel');
    if (panel && panel.style.display !== 'none') {
      renderSchoolUnitPanel(state.schoolCurrentUnit);
    }
  }
  renderSchoolClasses();
}

function updateSchoolHomeCard() {
  const cls = SCHOOL_PATH.find(c => c.id === state.schoolCurrentClass);
  const unit = cls?.units.find(u => u.id === state.schoolCurrentUnit);

  const titleEl = document.getElementById('sh-class-title');
  const subEl = document.getElementById('sh-unit-sub');
  const fillEl = document.getElementById('sh-progress-fill');
  const btnEl = document.getElementById('sh-continue-btn');

  if (!state.schoolModeStarted || !cls) {
    if (titleEl) titleEl.textContent = 'Start Here';
    if (subEl) subEl.textContent = 'New student? Start School Path for guided lessons.';
    if (fillEl) fillEl.style.width = '0%';
    if (btnEl) btnEl.textContent = '▶ Start School Path';
    return;
  }

  if (titleEl) titleEl.textContent = cls.en + ' · ' + cls.dari;
  if (unit) {
    const completedCount = unit.steps.filter(s => state.schoolCompletedSteps.includes(s.id)).length;
    const unitStatus = getUnitStatus(unit);
    const statusInfo = UNIT_STATUS_LABELS[unitStatus] || UNIT_STATUS_LABELS['not-started'];
    if (subEl) subEl.textContent = `Unit: ${unit.en} — ${completedCount}/${unit.steps.length} steps · ${statusInfo.badge}`;
    if (fillEl) fillEl.style.width = Math.round(completedCount / unit.steps.length * 100) + '%';
  } else {
    if (subEl) subEl.textContent = cls.en + ' — tap to choose a unit';
  }
  if (btnEl) btnEl.textContent = '▶ Continue My Lesson';

  // Save current class/unit for roshan_ prefixed keys
  save('roshan_school_current_class', state.schoolCurrentClass || '');
  save('roshan_school_current_unit', state.schoolCurrentUnit || '');
}

function continueSchoolPath() {
  navigate('path');
  setTimeout(() => {
    showSchoolTab('path');
    if (state.schoolCurrentUnit) {
      renderSchoolUnitPanel(state.schoolCurrentUnit);
      const panel = document.getElementById('sp-unit-panel');
      if (panel) panel.style.display = '';
    }
  }, 100);
}

function openFreePractice() {
  navigate('path');
  setTimeout(() => showSchoolTab('free'), 100);
}

// ===== PLACEMENT v1.8 =====
/* I6H-D12: the old 10/20-question demo placement (startPlacement /
   renderPlacementQ / answerPlacement / showPlacementResult / cancelPlacement /
   getPlacementSuggestedClass / resetPlacement) has been RETIRED. The ONE
   placement system is now zirak-placement-engine.js (professional adaptive
   diagnostic). The demo question list in content.js is intentionally left
   untouched (frozen content file; simply no longer referenced). The
   acceptance path below (acceptPlacement) is unchanged — the engine calls it. */
function chooseDifferentClass() {
  showSchoolTab('path');
  showToast('Choose any class below to start.');
  // Show mode selector again
  const sel = document.getElementById('placement-mode-selector');
  if (sel) sel.style.display = '';
}

function acceptPlacement(levelId) {
  state.lpLevel = levelId;
  save('lp_start_level', levelId);
  // I6H-D11B (Workstream A): a placement RESULT is only a recommendation.
  // Acceptance is recorded explicitly so Home onboarding and the
  // Recommended Next Step engine can distinguish:
  //   placementTestCompleted (placement_result exists)  vs
  //   placementAccepted      (this record exists)
  // Additive key, namespaced per student by the existing save() helper.
  try {
    save('placement_accepted', JSON.stringify({
      level: levelId, source: 'placement', at: new Date().toISOString()
    }));
  } catch(e) {}
  const cls = SCHOOL_PATH.find(c => c.id === levelId) || SCHOOL_PATH[1];
  if (!state.schoolModeStarted) {
    startSchoolPath(cls.id);
  } else {
    state.schoolCurrentClass = cls.id;
    state.schoolCurrentUnit = cls.units[0].id;
    save('school_class', cls.id);
    save('school_unit', cls.units[0].id);
    updateSchoolHomeCard();
    renderSchoolClasses();
    showToast('✅ Class changed to: ' + cls.en);
  }
  showSchoolTab('path');
}



function startPathLevel(levelId) {
  const cls = SCHOOL_PATH.find(c => c.id === levelId);
  if (cls) startSchoolPath(cls.id);
  else navigate('dialogue');
}

// ===== QUIZ ENGINE v1.8 =====
function getUnitQuizQuestions(unitId) {
  // Build a small quiz from PLACEMENT_QUESTIONS pool, sliced per unit
  // Map units to question ranges so each unit gets distinct questions
  const allUnits = [];
  SCHOOL_PATH.forEach(cls => cls.units.forEach(u => allUnits.push(u.id)));
  const idx = allUnits.indexOf(unitId);
  const qPerUnit = 8;
  const start = (idx * qPerUnit) % Math.max(1, PLACEMENT_QUESTIONS.length - qPerUnit);
  return PLACEMENT_QUESTIONS.slice(start, start + qPerUnit);
}

function launchUnitQuiz(unitId) {
  let unit = null, cls = null;
  for (const c of SCHOOL_PATH) {
    const u = c.units.find(u => u.id === unitId);
    if (u) { unit = u; cls = c; break; }
  }
  if (!unit) return;

  const questions = getUnitQuizQuestions(unitId);
  if (!questions.length) { showToast('No quiz questions available for this unit.'); return; }

  state.activeUnitQuiz = { unitId, unitTitle: (unit.en || unit.id), clsId: cls.id, questions, idx: 0, answers: [], score: 0 };
  renderUnitQuiz();
}

function renderUnitQuiz() {
  const q_state = state.activeUnitQuiz;
  if (!q_state) return;
  const overlay = getOrCreateQuizOverlay();

  if (q_state.idx >= q_state.questions.length) {
    showUnitQuizResult();
    return;
  }

  const q = q_state.questions[q_state.idx];
  const total = q_state.questions.length;
  const pct = Math.round(q_state.idx / total * 100);

  overlay.innerHTML = `
    <div style="background:var(--surface);border-radius:16px;padding:20px;max-width:400px;width:100%;margin:20px;position:relative;max-height:90vh;overflow-y:auto;">
      <div style="font-size:13px;font-weight:700;color:var(--text-muted);margin-bottom:6px;">
        Unit Quiz · ${q_state.idx+1} of ${total}
        <button onclick="closeUnitQuiz()" style="float:right;background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);">✕</button>
      </div>
      <div style="background:var(--surface-alt);border-radius:99px;height:4px;margin-bottom:12px;overflow:hidden;">
        <div style="height:100%;background:var(--lapis);width:${pct}%;transition:width 0.3s;"></div>
      </div>
      <div style="font-size:15px;font-weight:700;margin-bottom:4px;">${q.q}</div>
      <div class="dari" style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">${q.qd}</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${q.options.map((o,i) => `<button class="btn btn-outline quiz-opt-btn" id="qopt-${i}" onclick="answerUnitQuiz(${i})" style="justify-content:flex-start;text-align:left;">${o}</button>`).join('')}
      </div>
    </div>`;
}

function getOrCreateQuizOverlay() {
  let ov = document.getElementById('unit-quiz-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'unit-quiz-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9990;display:flex;align-items:center;justify-content:center;';
    document.body.appendChild(ov);
  }
  ov.style.display = 'flex';
  return ov;
}

function closeUnitQuiz() {
  const ov = document.getElementById('unit-quiz-overlay');
  if (ov) ov.style.display = 'none';
  state.activeUnitQuiz = null;
}

function answerUnitQuiz(idx) {
  const q_state = state.activeUnitQuiz;
  if (!q_state) return;
  const q = q_state.questions[q_state.idx];
  const correct = (idx === q.correct);
  q_state.answers.push({ idx, correct });
  if (correct) q_state.score++;

  // Brief visual feedback
  const ov = document.getElementById('unit-quiz-overlay');
  const btn = document.getElementById('qopt-' + idx);
  const correctBtn = document.getElementById('qopt-' + q.correct);
  if (btn) btn.style.background = correct ? 'var(--emerald)' : 'var(--coral)';
  if (!correct && correctBtn) correctBtn.style.background = 'var(--emerald)';

  setTimeout(() => {
    q_state.idx++;
    renderUnitQuiz();
  }, 600);
}

function showUnitQuizResult() {
  const q_state = state.activeUnitQuiz;
  if (!q_state) return;
  const overlay = getOrCreateQuizOverlay();
  const score = q_state.score;
  const total = q_state.questions.length;
  const pct = Math.round(score / total * 100);
  const passed = pct >= 70;
  const passColor = passed ? 'var(--emerald)' : 'var(--coral)';
  const passLabel = passed ? '✅ PASSED' : '❌ Needs Practice';

  // Save quiz result
  const histEntry = {
    unitId: q_state.unitId,
    score, total, pct, passed,
    date: new Date().toISOString()
  };
  state.quizHistory.push(histEntry);
  if (state.quizHistory.length > 100) state.quizHistory = state.quizHistory.slice(-100);
  save('quiz_history', JSON.stringify(state.quizHistory));
  // I6H-D13A: unit quizzes do not write to the Learning Ledger at all
  // (see quiz_history/school_scores above) — report the result directly
  // to the Personalized Learning Plan's evidence matcher instead, using
  // the SAME idempotent matching logic the Ledger bridge uses elsewhere.
  try {
    if (window.ZirakLearningPlan && typeof window.ZirakLearningPlan.onExternalResult === 'function') {
      window.ZirakLearningPlan.onExternalResult(null, { id: 'unitquiz-' + q_state.unitId + '-' + Date.now(), source: 'unit-quiz', contentId: q_state.unitId, good: score, total: total, pct: pct });
    }
  } catch (ePlanEvid) {}

  // Save unit score
  state.schoolUnitScores[q_state.unitId] = pct;
  save('school_scores', JSON.stringify(state.schoolUnitScores));

  // Update pass status and unlock next if passed
  if (passed) {
    state.schoolUnitPassStatus[q_state.unitId] = 'passed';
    save('school_unit_pass', JSON.stringify(state.schoolUnitPassStatus));
    unlockNextUnitIfReady(q_state.unitId, q_state.clsId);
  } else {
    if (!state.schoolUnitPassStatus[q_state.unitId]) {
      state.schoolUnitPassStatus[q_state.unitId] = 'needs-practice';
      save('school_unit_pass', JSON.stringify(state.schoolUnitPassStatus));
    }
  }

  const wrongCount = total - score;
  const unitLabel = (q_state.unitTitle || q_state.unitId || 'Unit Quiz');
  const clsLabel  = q_state.clsId ? ('School Path — ' + q_state.clsId) : 'School Path';

  overlay.innerHTML = `<div id="unit-quiz-result-wrap" style="background:var(--surface);border-radius:16px;padding:20px;max-width:420px;width:100%;margin:20px;text-align:center;">
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:4px;">Correct: <strong>${score}</strong> · Wrong: <strong>${wrongCount}</strong> · Total: <strong>${total}</strong></div>
      ${passed ? `<div style="font-size:13px;color: var(--emerald-text);margin:8px 0;">🎉 Unit quiz passed! Next unit is now available.</div>` :
        `<div style="font-size:13px;color:var(--coral);margin:8px 0;">Score 70% or more to pass. Keep practicing!</div>`}
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:14px 0 4px;">
        <button class="btn btn-primary btn-sm" onclick="closeUnitQuizAndRefresh()">✔ Done</button>
        ${!passed ? `<button class="btn btn-outline btn-sm" onclick="retakeUnitQuiz()">🔄 Try Again</button>` : ''}
      </div>
    </div>`;
  // Append professional result card inside overlay
  setTimeout(() => {
    const wrap = document.getElementById('unit-quiz-result-wrap');
    if (wrap && !wrap.querySelector('.pro-result-card')) {
      const proCard = buildProResultCard({
        score: pct,
        sessionTitle: unitLabel,
        sectionType: clsLabel,
        missedWords: [],
        extraWords: [],
        onPracticeAgain: function() { retakeUnitQuiz(); },
        onContinue: function() { closeUnitQuizAndRefresh(); }
      });
      wrap.appendChild(proCard);
    }
  }, 0);

  // v1.10G2 TASK 4: Speak unit quiz result aloud (English only, short)
  window.speechSynthesis.cancel();
  const uqMsg = passed
    ? `You completed the unit quiz. Your score is ${pct} percent. You passed. Very good work.`
    : `You completed the unit quiz. Your score is ${pct} percent. Some questions need more practice. Please try again.`;
  setTimeout(() => {
    const uqU = new SpeechSynthesisUtterance(uqMsg);
    uqU.lang = 'en-US'; uqU.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; uqU.volume = 1.0;
    window.speechSynthesis.speak(uqU);
  }, 400);

  updateSchoolHomeCard();
  renderSchoolClasses();
}

function closeUnitQuizAndRefresh() {
  closeUnitQuiz();
  if (state.schoolCurrentUnit) {
    renderSchoolUnitPanel(state.schoolCurrentUnit);
  }
  renderSchoolClasses();
}

function retakeUnitQuiz() {
  const q_state = state.activeUnitQuiz;
  if (!q_state) { closeUnitQuiz(); return; }
  const unitId = q_state.unitId;
  closeUnitQuiz();
  setTimeout(() => launchUnitQuiz(unitId), 100);
}

// ===== UNIT UNLOCK LOGIC v1.8 =====
function isUnitUnlocked(cls, unitIdx) {
  if (unitIdx === 0) return true; // first unit always open
  // Check previous unit is passed
  const prevUnit = cls.units[unitIdx - 1];
  if (!prevUnit) return true;
  return state.schoolUnitPassStatus[prevUnit.id] === 'passed';
}

function unlockNextUnitIfReady(unitId, clsId) {
  const cls = SCHOOL_PATH.find(c => c.id === clsId);
  if (!cls) return;
  const idx = cls.units.findIndex(u => u.id === unitId);
  const nextUnit = cls.units[idx + 1];
  if (nextUnit) {
    showToast('🔓 Next unit unlocked: ' + nextUnit.en);
    state.schoolCurrentUnit = nextUnit.id;
    save('school_unit', nextUnit.id);
  } else {
    // All units in this class done — check class completion
    const allPassed = cls.units.every(u => state.schoolUnitPassStatus[u.id] === 'passed');
    if (allPassed) {
      if (!state.schoolCompletedClasses.includes(clsId)) {
        state.schoolCompletedClasses.push(clsId);
        save('roshan_school_completed_classes', JSON.stringify(state.schoolCompletedClasses));
        save('roshan_school_current_class', clsId);
      }
      showClassCompletionCard(clsId);
    }
  }
}

function showClassCompletionCard(clsId) {
  const cls = SCHOOL_PATH.find(c => c.id === clsId);
  const clsIdx = SCHOOL_PATH.findIndex(c => c.id === clsId);
  const nextCls = SCHOOL_PATH[clsIdx + 1];

  const ov = getOrCreateQuizOverlay();
  ov.style.display = 'flex';
  ov.innerHTML = `
    <div style="background:var(--surface);border-radius:16px;padding:24px;max-width:380px;width:100%;margin:20px;text-align:center;">
      <div style="font-size:48px;margin-bottom:8px;">🎓</div>
      <div style="font-size:20px;font-weight:800;color:var(--gold);margin-bottom:4px;">Class Completed!</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;">${cls?.en}</div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">You passed all units in this class. Great work!</div>
      ${nextCls ? `
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;">Next Recommended: ${nextCls.en}</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" onclick="startNextClass('${nextCls.id}')">▶ Start ${nextCls.en}</button>
          <button class="btn btn-outline btn-sm" onclick="closeUnitQuiz()">✔ Stay Here</button>
        </div>` :
        `<div style="font-size:14px;color: var(--emerald-text);font-weight:700;margin-bottom:12px;">🏆 You have completed all available classes!</div>
        <button class="btn btn-primary btn-sm" onclick="closeUnitQuiz()">✔ Done</button>`}
    </div>`;
}

function startNextClass(classId) {
  closeUnitQuiz();
  startSchoolPath(classId);
  showSchoolTab('path');
}

function getUnitStatus(unit) {
  const passStatus = state.schoolUnitPassStatus[unit.id];
  if (passStatus === 'passed') return 'passed';
  const quizScore = state.schoolUnitScores[unit.id];
  const completedCount = unit.steps.filter(s => state.schoolCompletedSteps.includes(s.id)).length;
  const nonQuizSteps = unit.steps.filter(s => s.type !== 'quiz');
  const practiceStepsDone = nonQuizSteps.filter(s => state.schoolCompletedSteps.includes(s.id)).length;
  const practiceRatio = nonQuizSteps.length > 0 ? practiceStepsDone / nonQuizSteps.length : 0;
  if (passStatus === 'needs-practice') return 'needs-practice';
  if (completedCount === 0) return 'not-started';
  if (practiceRatio >= 0.7) return 'ready-for-quiz';
  return 'in-progress';
}

const UNIT_STATUS_LABELS = {
  'not-started':     { badge: '🔘 Not Started',    color: 'var(--text-muted)', bg: 'var(--surface-alt)' },
  'in-progress':     { badge: '📖 In Progress',     color: '#b45309',           bg: '#fef9c3' },
  'ready-for-quiz':  { badge: '📝 Ready for Quiz',  color: '#1d4ed8',           bg: '#dbeafe' },
  'passed':          { badge: '✅ Passed',           color: '#065f46',           bg: '#d1fae5' },
  'needs-practice':  { badge: '🔁 Needs Practice',  color: '#991b1b',           bg: '#fee2e2' }
};

// ===== PROOF CODES =====
function generateProofCode(topic, level) {
  const code = generateZRKCode();
  const area = document.getElementById('proof-area');
  area.style.display = 'block';
  document.getElementById('proof-code-val').textContent = code;
  document.getElementById('proof-topic-name').textContent = topic + ' · ' + (LEVELS.find(l=>l.id===level)?.en || level);
  document.getElementById('proof-date').textContent = new Date().toLocaleDateString();
  state.lpProgress[level] = { code, topic, date: new Date().toISOString() };
  save('lp_progress', state.lpProgress);
  navigate('path');
}

// ===== STREAK & MILESTONES =====
function updateStreak() {
  const today = new Date().toDateString();
  const s = state.streak;
  if (s.lastDate === today) {
    // Already counted for today in old system — but still update new system
    updateStreakNewKeys();
    return;
  }
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (s.lastDate === yesterday) {
    s.current++;
  } else if (s.lastDate !== today) {
    s.current = 1;
  }
  s.longest = Math.max(s.longest, s.current);
  s.lastDate = today;
  state.streak = s;
  save('streak', s);
  updateStreakNewKeys();
  updateStreakDisplay();
  if (s.current >= 5) awardMilestone('streak-5');
  if (s.current >= 30) awardMilestone('streak-30');
}

// v1.11B: New streak keys (YYYY-MM-DD format) per spec
function updateStreakNewKeys() {
  const today = new Date().toISOString().slice(0, 10);
  const last  = load('streak_last_date') || '';
  const count = parseInt(load('streak_count') || '0');
  if (last === today) return; // already counted today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (last === yesterday) {
    save('streak_count', String(count + 1));
  } else {
    save('streak_count', '1'); // reset — missed a day
  }
  save('streak_last_date', today);
  updateStreakDisplay();
}

function awardMilestone(id) {
  if (!state.milestones.includes(id)) {
    state.milestones.push(id);
    save('milestones', state.milestones);
    const m = MILESTONES.find(mil => mil.id === id);
    if (m) showToast(`${m.icon} ${m.en} / ${m.dari}`);
  }
}

// ===== HISTORY =====
function saveToHistory(entry) {
  state.history.push(entry);
  if (state.history.length > 200) state.history = state.history.slice(-200);
  save('practice_history', state.history);
}

// ===== SETTINGS =====
function openSettings() {
  document.getElementById('settings-overlay').classList.add('open');
  document.getElementById('settings-drawer').classList.add('open');
  // PHASE I6A5 — Part A: Settings is an overlay outside navigate()'s
  // reach — hide the floating chip explicitly (it was visible behind
  // the drawer per real-device screenshots).
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.setChipVisible === 'function') {
    window.ZirakProfile.setChipVisible(false);
  }
  // Load settings into UI
  const onl = navigator.onLine;
  document.getElementById('settings-offline-status').innerHTML = `<span class="${onl?'badge badge-emerald':'badge badge-gold'}">${onl?'🟢 Online':'🟡 Offline'}</span>`;
  document.getElementById('set-speed').value = Math.round(state.speechRate * 100);
  document.getElementById('speed-display').textContent = state.speechRate.toFixed(2) + 'x';
  document.getElementById('set-auto-continue').checked = state.autoContinue;
  document.getElementById('set-transliteration').checked = state.showTranslit;
  document.getElementById('set-theme').value = state.theme;
  document.getElementById('set-dari-size').value = state.dariFontSize;
  document.getElementById('set-goal').value = state.dailyGoal;
  // v1.8B: populate parent profile
  populateParentProfileFields();
  // v1.11H1: load AI settings status
  loadAISettingsUI();
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
  document.getElementById('settings-drawer').classList.remove('open');
  // PHASE I6A5 — Part A: restore the chip only if Home is underneath.
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.setChipVisible === 'function') {
    var homeEl = document.getElementById('screen-home');
    window.ZirakProfile.setChipVisible(!!(homeEl && homeEl.classList.contains('active')));
  }
}

// PHASE I6A5B — Part 7: a REAL force-save, not just a confirmation
// toast. Each individual control already persists on its own change
// event (saveSetting / setTheme / updateSpeed) — that auto-save
// behavior is UNCHANGED and still runs — but this function additionally
// re-reads every visible control's CURRENT value directly from the DOM
// and force-persists + force-syncs it to `state`, using the exact SAME
// existing storage keys (no renames). This closes any edge case where
// an individual control's own event might not have fired reliably
// (e.g. a range input's `input` event behaving inconsistently on some
// mobile browsers) — tapping Save always guarantees every visible
// value is genuinely on disk and reflected in memory before closing.
function saveSettingsAndClose() {
  try {
    var speedEl = document.getElementById('set-speed');
    if (speedEl) {
      var spd = Math.round(parseFloat(speedEl.value)) / 100;
      if (!isNaN(spd) && spd > 0) {
        state.speechRate = spd;
        save('speech_rate', spd);
        var speedDisp = document.getElementById('speed-display');
        if (speedDisp) speedDisp.textContent = spd.toFixed(2) + 'x';
      }
    }

    var dariSizeEl = document.getElementById('set-dari-size');
    if (dariSizeEl) { state.dariFontSize = dariSizeEl.value; save('pashto_font_size', dariSizeEl.value); }

    var translitEl = document.getElementById('set-transliteration');
    if (translitEl) { state.showTranslit = translitEl.checked; save('show_transliteration', translitEl.checked); }

    var autoContEl = document.getElementById('set-auto-continue');
    if (autoContEl) { state.autoContinue = autoContEl.checked; save('auto_continue', autoContEl.checked); }

    var themeEl = document.getElementById('set-theme');
    if (themeEl) { setTheme(themeEl.value); } // setTheme() both persists and applies the theme immediately

    var goalEl = document.getElementById('set-goal');
    if (goalEl) { var goalVal = parseInt(goalEl.value); if (!isNaN(goalVal)) { state.dailyGoal = goalVal; save('daily_goal_minutes', goalVal); } }
  } catch (e) { /* never let a save hiccup block closing the drawer */ }

  if (typeof showToast === 'function') showToast('✅ Settings saved');
  closeSettings();
}

// ===== PARENT PROFILE (v1.8B) =====
function saveParentProfile() {
  const profile = {
    studentName: (document.getElementById('pp-student-name')?.value || '').trim(),
    fatherName:  (document.getElementById('pp-father-name')?.value || '').trim(),
    fatherWA:    (document.getElementById('pp-father-wa')?.value || '').trim(),
    parentPin:   (document.getElementById('pp-parent-pin')?.value || '').trim()
  };
  save('parent_profile', JSON.stringify(profile));
}

function loadParentProfile() {
  try {
    const raw = load('parent_profile');
    return raw ? JSON.parse(raw) : { studentName:'', fatherName:'', fatherWA:'', parentPin:'' };
  } catch(e) { return { studentName:'', fatherName:'', fatherWA:'', parentPin:'' }; }
}

function populateParentProfileFields() {
  const p = loadParentProfile();
  const s = document.getElementById('pp-student-name');
  const f = document.getElementById('pp-father-name');
  const w = document.getElementById('pp-father-wa');
  const n = document.getElementById('pp-parent-pin');
  if (s) s.value = p.studentName || '';
  if (f) f.value = p.fatherName  || '';
  if (w) w.value = p.fatherWA    || '';
  if (n) n.value = p.parentPin   || '';
}

// ===== WHATSAPP PROGRESS REPORT (v1.8B) =====
// ===== v1.9 PROFESSIONAL RESULT CARD BUILDER =====
// v1.9A: In-memory store for result-card data — avoids inline JSON in onclick attributes
// Keys are safe alphanumeric report IDs. Cleared when a new card is built for same slot.
const _proReports   = {};   // reportId → report data (score, title, proof code, etc.)
const _proCallbacks = {};   // reportId → { onPracticeAgain, onContinue }

function shareProResult(reportId) {
  const r = _proReports[reportId];
  if (!r) { console.warn('[Zirak] shareProResult: report not found', reportId); return; }
  const p = loadParentProfile();
  const studentName = p.studentName || 'Student';
  const fatherName  = p.fatherName  || 'Parent';
  const rawWA = (p.fatherWA || '').replace(/[^0-9]/g, '');
  const status = r.score >= 70 ? 'Passed ✅' : 'Needs Practice 🔁';
  const missedLine = r.missed.length ? 'Missed words: ' + r.missed.join(', ') : 'Missed words: —';
  const extraLine  = r.extra.length  ? 'Extra words: '  + r.extra.join(', ')  : 'Extra words: —';
  const rec = r.recommendation;
  const detailLine = r.sessionDetails ? 'Details: ' + r.sessionDetails + '\n' : '';
  const msg =
    '📊 *Zirak Progress Report*\n' +
    'Student: ' + studentName + '\n' +
    'Father: '  + fatherName  + '\n' +
    'Lesson: '  + (r.sessionTitle || '—') + '\n' +
    'Section: ' + (r.sectionType  || '—') + '\n' +
    detailLine +
    'Score: '   + r.score + '%\n' +
    'Status: '  + status + '\n' +
    missedLine + '\n' +
    extraLine  + '\n' +
    'Recommendation: ' + rec + '\n' +
    'Date: '       + r.dateStr + '\n' +
    'Proof Code: ' + r.code + '\n\n' +
    '(This proof code is only a reference number. No action needed from father — student continues automatically.)\n\n' +
    'Sent via Zirak English App 🌟';
  _lastReportCode = r.code;
  const encoded = encodeURIComponent(msg);
  const url = rawWA ? 'https://wa.me/' + rawWA + '?text=' + encoded : 'https://wa.me/?text=' + encoded;
  window.open(url, '_blank');
}

function proResultAgain(reportId) {
  const cb = _proCallbacks[reportId];
  if (cb && typeof cb.onPracticeAgain === 'function') cb.onPracticeAgain();
}

function proResultContinue(reportId) {
  const cb = _proCallbacks[reportId];
  if (cb && typeof cb.onContinue === 'function') cb.onContinue();
}

function buildProResultCard({
  score, sessionTitle, sectionType, missedWords, extraWords,
  onPracticeAgain, onContinue, proofCode, sessionDetails
}) {
  const p = loadParentProfile();
  const studentName = p.studentName || 'Student';
  const fatherName  = p.fatherName  || '';
  const dateStr     = new Date().toLocaleString();
  // TASK 1: generate proof code ONCE here and reuse for both display and WA message
  const code        = proofCode || generateZRKCode();
  const passed      = score >= 70;
  const circleClass = score >= 70 ? 'pass' : score >= 40 ? 'warn' : 'fail';

  const rec = score >= 70
    ? 'Good result, continue'
    : score >= 40
    ? 'Practice these words again'
    : 'Repeat this lesson';
  const recDisplay = score >= 70 ? '✅ ' + rec : score >= 40 ? '🔁 ' + rec : '📚 ' + rec;

  const missed = (missedWords || []).filter(Boolean);
  const extra  = (extraWords  || []).filter(Boolean);

  // TASK 2: store report data in memory — keyed by safe report ID
  const reportId = 'prc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  _proReports[reportId] = {
    score, sessionTitle, sectionType, missed, extra,
    recommendation: rec, code, dateStr, sessionDetails: sessionDetails || null
  };
  _proCallbacks[reportId] = { onPracticeAgain, onContinue };
  // Publish proof code to shared _lastReportCode so markFatherSeen() matches
  _lastReportCode = code;

  const missedHTML = missed.length
    ? missed.map(w => '<span class="pro-word-chip missed">' + escHtml(w) + '</span>').join('')
    : '<span style="font-size:12px;color: var(--emerald-text);font-weight:600;">✅ Excellent. No weak words found.</span>';

  const extraHTML = extra.length
    ? extra.map(w => '<span class="pro-word-chip extra">' + escHtml(w) + '</span>').join('')
    : '';

  const namesHTML = [
    studentName ? '<span>👤 ' + escHtml(studentName) + '</span>' : '',
    fatherName  ? '<span>👨 ' + escHtml(fatherName)  + '</span>' : ''
  ].filter(Boolean).join('');

  const rId = escHtml(reportId); // safe — alphanumeric + underscore only

  const div = document.createElement('div');
  div.className = 'pro-result-card';
  div.innerHTML =
    '<div class="pro-result-header">' +
      '<div class="pro-result-logo">📊 Zirak Progress</div>' +
      '<div class="pro-result-date">' + escHtml(dateStr) + '</div>' +
    '</div>' +
    (namesHTML ? '<div class="pro-result-names">' + namesHTML + '</div>' : '') +
    '<div class="pro-result-score-row">' +
      '<div class="pro-result-circle ' + circleClass + '">' + score + '%</div>' +
      '<div>' +
        '<div class="pro-result-title">' + escHtml(sessionTitle || 'Practice Session') + '</div>' +
        (sectionType ? '<div class="pro-result-section">📁 ' + escHtml(sectionType) + '</div>' : '') +
        (sessionDetails ? '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">📋 ' + escHtml(sessionDetails) + '</div>' : '') +
        '<div class="pro-result-status ' + (passed ? 'pass' : 'fail') + '">' + (passed ? 'Passed ✅' : 'Needs Practice 🔁') + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="pro-result-section-block">' +
      '<div class="block-title">Missed Words</div>' +
      '<div class="pro-word-chips">' + missedHTML + '</div>' +
      (extraHTML ? '<div class="block-title" style="margin-top:8px;">Extra / Wrong Words</div><div class="pro-word-chips">' + extraHTML + '</div>' : '') +
    '</div>' +
    '<div class="pro-result-recommendation">' + escHtml(recDisplay) + '</div>' +
    '<div class="pro-result-proof">' +
      '🔑 Proof Code: <strong>' + escHtml(code) + '</strong><br>' +
      '<span style="font-weight:400;">This proof code is only a reference for the parent report. It does not block lessons.</span>' +
    '</div>' +
    '<div class="pro-result-actions" id="prc-act-' + rId + '">' +
      '<button class="btn btn-sm prc-wa" style="background:#25D366;color:#fff;border:none;cursor:pointer;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;">Share to Father (WhatsApp)</button>' +
      (onPracticeAgain ? '<button class="btn btn-outline btn-sm prc-again">Practice Again</button>' : '') +
      (onContinue      ? '<button class="btn btn-primary btn-sm prc-cont">Continue</button>' : '') +
    '</div>' +
    '<div style="margin-top:10px;font-size:11px;color:var(--text-muted);text-align:center;">' +
      'The father receives this report. No approval needed. Student continues learning automatically.' +
    '</div>';
  // Attach events via JS (avoids all inline onclick / quote / emoji issues)
  var actDiv = div.querySelector('#prc-act-' + reportId);
  if (actDiv) {
    var waBtn = actDiv.querySelector('.prc-wa');
    if (waBtn) waBtn.addEventListener('click', function() { shareProResult(reportId); });
    var agBtn = actDiv.querySelector('.prc-again');
    if (agBtn) agBtn.addEventListener('click', function() { proResultAgain(reportId); });
    var coBtn = actDiv.querySelector('.prc-cont');
    if (coBtn) coBtn.addEventListener('click', function() { proResultContinue(reportId); });
  }
  // v1.11H: Show newly earned badge notifications on this result card
  try { showNewBadgesOnResult(div); } catch(e) {}
  return div;
}

// HTML-escape helper (safe for text nodes inside innerHTML)
function escHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateZRKCode() {
  const d = new Date();
  const ymd = d.getFullYear().toString()
    + String(d.getMonth()+1).padStart(2,'0')
    + String(d.getDate()).padStart(2,'0');
  const rand = Math.random().toString(36).substr(2,4).toUpperCase();
  return 'ZRK-' + ymd + '-' + rand;
}

function sendWhatsAppReport({ score: rawScore, sessionTitle, classLabel, sectionType, missedWords, extraWords, recommendation, proofCode: fixedProofCode }) {
  const p = loadParentProfile();
  const studentName = p.studentName || 'Student';
  const fatherName  = p.fatherName  || 'Parent';
  // Safe score conversion and clamping
  let score = parseFloat(String(rawScore ?? '0').replace(/[^0-9.\-]/g, ''));
  if (isNaN(score)) score = 0;
  score = Math.max(0, Math.min(100, Math.round(score)));
  // Clean WhatsApp number — digits only
  const rawWA   = (p.fatherWA || '').replace(/[^0-9]/g, '');
  const dateStr  = new Date().toLocaleString();
  const status   = score >= 70 ? 'Passed ✅' : 'Needs Practice 🔁';
  // Use a fixed proof code if supplied (e.g. from result card) so display and WA always match
  const proofCode = fixedProofCode || generateZRKCode();
  _lastReportCode = proofCode;

  const missedLine = missedWords && missedWords.length ? 'Missed words: ' + missedWords.join(', ') : 'Missed words: —';
  const extraLine  = extraWords  && extraWords.length  ? 'Extra words: '  + extraWords.join(', ')  : 'Extra words: —';
  const rec = recommendation || (score >= 70 ? 'Good result, continue' : score >= 40 ? 'Practice these words again' : 'Repeat this lesson');
  const section = sectionType || classLabel || state.schoolCurrentClass || '—';

  const msg =
    `📊 *Zirak Progress Report*\n` +
    `Student: ${studentName}\n` +
    `Father: ${fatherName}\n` +
    `Lesson: ${sessionTitle || '—'}\n` +
    `Section: ${section}\n` +
    `Score: ${score}%\n` +
    `Status: ${status}\n` +
    `${missedLine}\n` +
    `${extraLine}\n` +
    `Recommendation: ${rec}\n` +
    `Date: ${dateStr}\n` +
    `Proof Code: ${proofCode}\n\n` +
    `(This proof code is only a reference number. No action needed from father — student continues automatically.)\n\n` +
    `Sent via Zirak English App 🌟`;

  const encoded = encodeURIComponent(msg);
  const url = rawWA
    ? `https://wa.me/${rawWA}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}

// WA report from the proof-area (School Path completion).
// Uses the proof code already displayed in #proof-code-val for consistency.
function sendWhatsAppProofReport() {
  const topicEl  = document.getElementById('proof-topic-name');
  const codeEl   = document.getElementById('proof-code-val');
  const sessionTitle = topicEl ? topicEl.textContent.trim() : '—';

  let proofCode = codeEl ? codeEl.textContent.trim() : '';
  if (!proofCode) {
    proofCode = generateZRKCode();
    if (codeEl) codeEl.textContent = proofCode;
  }
  _lastReportCode = proofCode;

  const p           = loadParentProfile();
  const studentName = p.studentName || 'Student';
  const fatherName  = p.fatherName  || 'Parent';
  const rawWA       = (p.fatherWA || '').replace(/[^0-9]/g, '');
  const section     = state.schoolCurrentClass || state.level || '—';
  const dateStr     = new Date().toLocaleString();
  const score       = 100;
  const status      = 'Passed ✅';

  const msg =
    `📊 *Zirak Progress Report*\n` +
    `Student: ${studentName}\n` +
    `Father: ${fatherName}\n` +
    `Lesson: ${sessionTitle}\n` +
    `Section: School Path — ${section}\n` +
    `Score: ${score}%\n` +
    `Status: ${status}\n` +
    `Missed words: —\n` +
    `Extra words: —\n` +
    `Recommendation: Good result, continue\n` +
    `Date: ${dateStr}\n` +
    `Proof Code: ${proofCode}\n\n` +
    `(This proof code is only a reference number. No action needed from father — student continues automatically.)\n\n` +
    `Sent via Zirak English App 🌟`;

  const encoded = encodeURIComponent(msg);
  const url = rawWA
    ? `https://wa.me/${rawWA}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}

// TASK 5/8B3: Local parent seen/approved placeholder — no backend, no login, no unlock
// Uses _lastReportCode so the approval record matches the WhatsApp message code exactly.
function markFatherSeen({ proofCode, score, sessionTitle, classLabel }) {
  try {
    // Use the code that was sent in the WhatsApp message; fall back to any provided code.
    const code = proofCode || _lastReportCode || 'unknown';
    const baseKey = 'roshan_approval_' + code;
    const key = (window.ZirakStorageKey ? window.ZirakStorageKey(baseKey) : baseKey);
    const listKey = (window.ZirakStorageKey ? window.ZirakStorageKey('roshan_approval_list') : 'roshan_approval_list');
    const record = {
      proofCode: code,
      score: score ?? 0,
      sessionTitle: sessionTitle || '—',
      classLabel: classLabel || '—',
      approvedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };
    localStorage.setItem(key, JSON.stringify(record));
    // Append to master list (per-student)
    let allKeys = [];
    try { allKeys = JSON.parse(localStorage.getItem(listKey) || '[]'); } catch(e) {}
    if (!allKeys.includes(key)) { allKeys.push(key); localStorage.setItem(listKey, JSON.stringify(allKeys)); }
    showToast('✅ Marked as Father Seen — saved locally. No approval or PIN required. (code: ' + code + ')');
  } catch(e) {
    showToast('⚠️ Could not save locally');
  }
}

function updateSpeed(val) {
  const spd = Math.round(val) / 100;
  state.speechRate = spd;
  save('speech_rate', spd);
  document.getElementById('speed-display').textContent = spd.toFixed(2) + 'x';
}

function setTheme(theme) {
  state.theme = theme;
  save('theme', theme);
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme','dark');
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme','light');
  } else {
    // system: REMOVE the override so @media (prefers-color-scheme) takes effect
    document.documentElement.removeAttribute('data-theme');
  }
  updateThemeToggleBtn();
  // also update settings dropdown if open
  const setThemeEl = document.getElementById('set-theme');
  if (setThemeEl) setThemeEl.value = theme;
}

function resetProgress() {
  const keys = ['practice_history','word_bookmarks','word_srs','streak','milestones','lp_start_level','lp_progress'];
  keys.forEach(k => localStorage.removeItem(LS + (window.__zirakNS?window.__zirakNS():'') + k));
  state.history = [];
  state.bookmarks = [];
  state.streak = { current:0, longest:0, lastDate:null };
  state.milestones = [];
  state.lpProgress = {};
  closeSettings();
  showToast('🗑 Progress reset. / پرمختګ پاک شو.');
  renderProgressRings();
}

// ===== TOAST =====
function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--lapis);color:white;padding:10px 20px;border-radius:24px;font-size:14px;font-weight:700;z-index:1000;max-width:280px;text-align:center;box-shadow:0 4px 16px rgba(26,58,92,0.35);transition:opacity 0.3s;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ===== PWA =====
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  document.getElementById('install-bar')?.classList.add('visible');
});
function installPWA() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(() => { deferredInstallPrompt = null; document.getElementById('install-bar')?.classList.remove('visible'); });
  }
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  });
}

// ===== OFFLINE STATUS =====
function updateOfflineStatus() {
  const badge = document.getElementById('offline-badge');
  if (badge) badge.textContent = navigator.onLine ? '🟢 Ready offline' : '🟡 Offline mode';
}
window.addEventListener('online', updateOfflineStatus);
window.addEventListener('offline', updateOfflineStatus);


// ===== AI — COHERE CONFIG =====
// NOTE: No API key is hardcoded here. Key is stored locally via Settings.
const COHERE_KEY = ''; // REMOVED — use localStorage key instead
const COHERE_URL = 'https://api.cohere.com/v2/chat';
const COHERE_MODEL = 'command-r-plus';
const COHERE_LS_KEY = 'zirak_cohere_api_key';
const AI_SYSTEM = `You are Zirak (ځيرک), a warm and encouraging English tutor with Afghan Pashto support for Afghan learners. Always respond with BOTH an English version AND an Afghan Pashto version. Format your response EXACTLY as JSON: {"en":"...","pashto":"..."}. Pashto must be in Pashto script. Do not use Dari, Persian, or Farsi. Keep responses SHORT (under 60 words each language). Be culturally respectful of Afghan heritage, Islam, and diaspora experience.`;

function getStoredCohereKey() {
  try { return (localStorage.getItem(COHERE_LS_KEY) || '').trim(); } catch(e) { return ''; }
}

async function cohereCall(messages, maxTokens = 500) {
  const key = getStoredCohereKey();
  if (!key) throw new Error('NO_KEY');
  if (!navigator.onLine) throw new Error('OFFLINE');
  const res = await fetch(COHERE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: COHERE_MODEL,
      messages: [{ role: 'system', content: AI_SYSTEM }, ...messages],
      max_tokens: maxTokens
    })
  });
  if (!res.ok) throw new Error('API_ERROR_' + res.status);
  const data = await res.json();
  return data.message?.content?.[0]?.text || '';
}

// ===== AI SETTINGS FUNCTIONS =====
function saveAIKey() {
  const input = document.getElementById('ai-key-input');
  const val = (input.value || '').trim();
  if (!val) { setAIKeyStatus('Please enter a key first.', 'warn'); return; }
  try {
    localStorage.setItem(COHERE_LS_KEY, val);
    input.value = '';
    setAIKeyStatus('✓ API key saved.', 'ok');
  } catch(e) { setAIKeyStatus('Could not save key.', 'err'); }
}
function clearAIKey() {
  try {
    localStorage.removeItem(COHERE_LS_KEY);
    document.getElementById('ai-key-input').value = '';
    setAIKeyStatus('Key cleared.', 'warn');
  } catch(e) {}
}
function toggleAIKeyVisibility() {
  const inp = document.getElementById('ai-key-input');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}
function setAIKeyStatus(msg, type) {
  const el = document.getElementById('ai-key-status');
  if (!el) return;
  const colors = { ok: 'var(--emerald,#34a853)', warn: 'var(--text-muted)', err: '#e53935' };
  el.style.color = colors[type] || 'var(--text-muted)';
  el.textContent = msg;
}
async function testAIConnection() {
  const key = getStoredCohereKey();
  if (!key) { setAIKeyStatus('Please enter a Cohere API key first.', 'warn'); return; }
  if (!navigator.onLine) { setAIKeyStatus('Offline — connect to internet first.', 'warn'); return; }
  setAIKeyStatus('Testing…', 'warn');
  try {
    const res = await fetch(COHERE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ model: COHERE_MODEL, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 })
    });
    if (res.ok) { setAIKeyStatus('✓ AI connection works.', 'ok'); }
    else { setAIKeyStatus('AI connection failed. Check your key or internet connection.', 'err'); }
  } catch(e) { setAIKeyStatus('AI connection failed. Check your key or internet connection.', 'err'); }
}
function loadAISettingsUI() {
  const el = document.getElementById('ai-key-status');
  if (!el) return;
  const key = getStoredCohereKey();
  el.style.color = 'var(--text-muted)';
  el.textContent = key ? '🔑 Key is saved (not shown for security).' : 'No key saved.';
}

// ===== AI CONVERSATION PARTNER =====
let convHistory = [];

function openAIConv() {
  document.getElementById('ai-conv-modal').style.display = 'flex';
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.setChipVisible === 'function') {
    window.ZirakProfile.setChipVisible(false);
  }
}
function closeAIConv() {
  document.getElementById('ai-conv-modal').style.display = 'none';
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.setChipVisible === 'function') {
    var homeEl = document.getElementById('screen-home');
    window.ZirakProfile.setChipVisible(!!(homeEl && homeEl.classList.contains('active')));
  }
}
function sendConvPrompt(text) {
  document.getElementById('conv-input').value = text;
  sendConvMessage();
}
async function sendConvMessage() {
  const input = document.getElementById('conv-input');
  const text = input.value.trim();
  if (!text) return;

  // v1.16I: Check local command router first (no AI needed for navigation)
  if (typeof window.zirakLocalCommandRouter === 'function') {
    const cmd = window.zirakLocalCommandRouter(text);
    if (cmd && typeof window.zirakExecuteZirakSafeAction === 'function') {
      input.value = '';
      window.zirakExecuteZirakSafeAction(cmd);
      return;
    }
  }

  input.value = '';
  const msgs = document.getElementById('ai-conv-messages');
  const studentMsg = document.createElement('div');
  studentMsg.className = 'chat-msg student';
  studentMsg.textContent = text;
  msgs.appendChild(studentMsg);
  const thinking = document.createElement('div');
  thinking.className = 'ai-thinking';
  thinking.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(thinking);
  msgs.scrollTop = msgs.scrollHeight;
  convHistory.push({ role: 'user', content: text });
  try {
    const raw = await cohereCall(convHistory.slice(-10), 600);
    let parsed;
    try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()); }
    catch { parsed = { en: raw, pashto: '' }; }
    convHistory.push({ role: 'assistant', content: raw });
    thinking.remove();
    const tutorMsg = document.createElement('div');
    tutorMsg.className = 'chat-msg tutor';
    tutorMsg.innerHTML = `<div>${parsed.en || ''}</div>${parsed.pashto ? `<div class="msg-dari">${parsed.pashto}</div>` : ''}`;
    msgs.appendChild(tutorMsg);
    msgs.scrollTop = msgs.scrollHeight;
    if (parsed.en) speak(parsed.en, 'en');
  } catch(e) {
    thinking.remove();
    const errMsg = document.createElement('div');
    errMsg.className = 'chat-msg tutor';
    let errText = 'AI unavailable. Check internet.';
    if (e.message === 'NO_KEY') errText = 'AI key is not configured. Add your Cohere API key in Settings to use this feature.';
    else if (e.message === 'OFFLINE') errText = 'AI is unavailable offline. Connect to the internet and try again.';
    errMsg.innerHTML = `<div>${errText}</div>`;
    msgs.appendChild(errMsg);
  }
}

// ===== WRITING FEEDBACK =====
function openWriting() {
  document.getElementById('writing-modal').style.display = 'flex';
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.setChipVisible === 'function') {
    window.ZirakProfile.setChipVisible(false);
  }
}
function closeWriting() {
  document.getElementById('writing-modal').style.display = 'none';
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.setChipVisible === 'function') {
    var homeEl = document.getElementById('screen-home');
    window.ZirakProfile.setChipVisible(!!(homeEl && homeEl.classList.contains('active')));
  }
}
async function getWritingFeedback() {
  const text = document.getElementById('writing-input').value.trim();
  if (!text) return;
  const result = document.getElementById('writing-feedback-result');
  const content = document.getElementById('writing-feedback-content');
  result.style.display = 'block';
  content.innerHTML = '<div class="ai-thinking"><span></span><span></span><span></span></div>';
  const prompt = `Analyze this student writing: "${text}"\n\nGive: 1) Grammar corrections (if any) 2) A better version 3) One tip. Respond ONLY as JSON: {"correctionEn":"...","correctionPashto":"...","betterEn":"...","tipEn":"...","tipPashto":"..."}. Pashto must be Afghan Pashto in Pashto script. Do not use Dari, Persian, or Farsi.`;
  try {
    const raw = await cohereCall([{ role: 'user', content: prompt }], 500);
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    content.innerHTML = `
      ${parsed.correctionEn ? `<div style="margin-bottom:8px;"><span class="badge badge-lapis">Correction</span><div style="margin-top:4px;font-size:14px;">${parsed.correctionEn}</div><div class="dari" style="font-size:14px;">${parsed.correctionPashto || ''}</div></div>` : `<div class="badge badge-emerald" style="margin-bottom:8px;">✓ Great writing!</div>`}
      ${parsed.betterEn ? `<div style="margin-bottom:8px;padding:10px;background:var(--sky);border-radius:10px;font-size:14px;font-style:italic;">"${parsed.betterEn}"</div>` : ''}
      ${parsed.tipEn ? `<div style="font-size:13px;color:var(--text-muted);">💡 ${parsed.tipEn}</div>` : ''}
      ${parsed.tipPashto ? `<div class="dari" style="font-size:13px;color:var(--text-muted);">${parsed.tipPashto}</div>` : ''}
    `;
  } catch(e) {
    let errText = 'AI feedback unavailable. Check internet connection.';
    if (e.message === 'NO_KEY') errText = 'AI key is not configured. Add your Cohere API key in Settings to use this feature.';
    else if (e.message === 'OFFLINE') errText = 'AI is unavailable offline. Connect to the internet and try again.';
    content.innerHTML = `<div style="font-size:13px;color:var(--text-muted);">${errText}</div>`;
  }
}

// Close modals on outside click
document.getElementById('ai-conv-modal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('ai-conv-modal')) closeAIConv();
});
document.getElementById('writing-modal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('writing-modal')) closeWriting();
});

document.addEventListener('keydown', e => {
  const target = e.target;
  const typing = target && ['INPUT','TEXTAREA','SELECT'].includes(target.tagName);
  if (typing) return;
  if (e.code === 'Space' && state.activeScreen === 'dialogue' && state.currentDialogue) {
    e.preventDefault();
    toggleSpeech();
  }
});


// ===== UNIVERSAL PRACTICE ENGINE (v1.4 → v1.6C patient listening hotfix) =====
// Uses the same Web Speech API logic as the Listening Room — one system only.

// I6H-D11B (Workstream C): central Auto Mode timing — do NOT scatter these.
const DIALOGUE_AUTO_AUDIO_RELEASE_MS = 1400;   // Android-safe speaker→mic release
const DIALOGUE_MIC_RETRY_DELAYS_MS   = [400, 800, 1200]; // transient start failures

let peState = {
  items: [],          // array of { targetText, targetPashto, lang, label }
  index: 0,
  flow: 'auto',       // 'auto' | 'manual'
  recognition: null,
  isListening: false,
  transcript: '',
  results: [],        // { score, transcript, targetText }
  title: '',
  onComplete: null,   // callback(results)
  autoTimer: null,
  ttsTimer: null,         // v1.6B: fallback timer for TTS completion
  resultVoiceTimer: null, // v1.6B: fallback timer for result voice
  graceTimer: null,       // grace period
  graceRestarted: 0,      // count of grace restarts
  _pendingScore: null,    // pending score fn for Done Speaking
  _silenceTimer: null,    // v1.10C: sliding silence countdown
  _activeRec: null,       // v1.10C: currently active recognition instance
  _doneSpeaking: false,   // v1.10C: true when Done Speaking tapped
  _autoRetryCount: 0,     // v1.10C: per-item retry count (max 2 in auto)
  autoPaused: false,  // v1.6: pause auto-advance
  config: {},
  /* ── I6H-D11B Dialogue Auto state machine ──────────────────────────
     autoPhase: idle → preparing → speaking → releasingAudio → startingMic
                → listening → evaluating → feedback → waiting
                → advancing/retrying  (+ paused / stopped / manualFallback)
     sessionToken: incremented by EVERY start/stop/close/next/previous/
     replay/pause/mode-change — every delayed callback re-checks it, so a
     stale timer can never open the microphone on the wrong dialogue line. */
  sessionToken: 0,
  autoPhase: 'idle',
  releaseTimer: null,     // speaker→mic audio-release delay
  micRetryTimer: null,    // transient mic-start backoff
  micRetryCount: 0,
  _micStarting: false     // duplicate-start guard
};

// ONE cleanup function — called on close / stop / pause / replay / item
// navigation / mode change / new session. Cancels every pending timer,
// pending speech and (safely) recognition, and invalidates the token.
function cancelDialogueAutoCycle(reason){
  peState.sessionToken++;                    // stale-callback protection
  peState.autoPhase = (reason === 'pause') ? 'paused' : 'idle';
  clearTimeout(peState.autoTimer);
  clearTimeout(peState.ttsTimer);
  clearTimeout(peState.resultVoiceTimer);
  clearTimeout(peState.graceTimer);
  clearTimeout(peState._silenceTimer);
  clearTimeout(peState.releaseTimer);
  clearTimeout(peState.micRetryTimer);
  peState._silenceTimer = null;
  peState.releaseTimer  = null;
  peState.micRetryTimer = null;
  peState.micRetryCount = 0;
  peState._micStarting  = false;
  try { window.speechSynthesis.cancel(); } catch(e){}
  if (peState._activeRec)  { try { peState._activeRec.stop(); }  catch(e){} peState._activeRec = null; }
  if (peState.recognition) { try { peState.recognition.stop(); } catch(e){} }
  peState.isListening = false;
}

// v1.10B: Paragraph patience — detect multi-sentence or long items
// These need the patient listening mode so Afghan students can pause between sentences
function peIsLongItem(item) {
  if (!item) return false;
  const text = item.targetText || '';
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount >= 10) return true;
  // Multi-sentence check — contains sentence-ending punctuation
  if (/[.!?]/.test(text.trim().slice(0, -1))) return true; // punctuation before last char
  const title = (peState.title || '').toLowerCase();
  if (/story|topic|paragraph|speech|dialogue|listening|full/i.test(title)) return true;
  return false;
}

// v1.10B: Count sentences in a text
function peCountSentences(text) {
  if (!text) return 1;
  const parts = text.split(/[.!?]+/).filter(s => s.trim().length > 2);
  return Math.max(1, parts.length);
}


// I6H-D19: one small adapter layer lets the existing Universal Practice
// Engine serve governed Dialogue turns without creating a second speech or
// recognition state machine. Non-D19 practice items keep their old behavior.
function _pePromptText(item) {
  return String(item && (item.promptText || item.targetText) || '');
}
function _pePromptPashto(item) {
  return String(item && (item.promptPashto || item.targetPashto) || '');
}
function _peIsD19Item(item) { return !!(item && item._d19Turn && item._d19TurnId); }
function _peTechnicalCode(errorName) {
  const name = String(errorName || '').toLowerCase();
  if (name === 'not-allowed' || name === 'permission-denied' || name === 'service-not-allowed') return 'microphone-permission-denied';
  if (name === 'audio-capture' || name === 'no-microphone' || name === 'notfounderror') return 'no-microphone';
  if (name === 'network' || name === 'speech-service-unavailable') return 'speech-service-unavailable';
  if (name === 'no-speech' || name === 'recognition-technical-timeout') return 'recognition-technical-timeout';
  if (name === 'invalidstateerror' || name === 'invalid-state' || name === 'aborterror') return 'invalid-state-double-start';
  if (name === 'recognition-unsupported') return 'recognition-unsupported';
  if (name === 'tts-hardware-release-failure' || name === 'speechsynthesiserror') return 'tts-hardware-release-failure';
  return 'speech-recognition-' + (name || 'unknown-error');
}
function _peReportTechnicalFailure(errorName, detail) {
  const code = _peTechnicalCode(errorName);
  const payload = {
    code: code,
    detail: String(detail || ''),
    item: peState.items[peState.index] || null,
    index: peState.index,
    sessionToken: peState.sessionToken
  };
  try {
    if (peState.config && typeof peState.config.onTechnicalFailure === 'function') {
      peState.config.onTechnicalFailure(payload);
    } else if (typeof _recordD18TechnicalFailure === 'function') {
      _recordD18TechnicalFailure(code);
    }
  } catch (e) { console.error('[Practice Engine] technical evidence callback failed', e); }
  return code;
}
function _peShowFallbackControls(message) {
  const area = document.getElementById('pe-fallback-area');
  if (area) area.hidden = false;
  const note = document.getElementById('pe-fallback-note');
  if (note && message) note.textContent = message;
}
function peToggleTypingFallback() {
  const area = document.getElementById('pe-fallback-area');
  if (!area) return;
  area.hidden = !area.hidden;
  if (!area.hidden) document.getElementById('pe-typing-input')?.focus();
}
function peSubmitTypingFallback() {
  const input = document.getElementById('pe-typing-input');
  const value = String(input && input.value || '').trim();
  if (!value) {
    const note = document.getElementById('pe-fallback-note');
    if (note) note.textContent = 'Type an English response before submitting. No score has been recorded.';
    return;
  }
  peState.transcript = value;
  const box = document.getElementById('pe-transcript-box');
  if (box) box.textContent = value;
  scorePracticeAnswer({ inputMethod:'typing-fallback' });
}
function peRecordTeacherUnscoredCompletion() {
  const item = peState.items[peState.index];
  if (!_peIsD19Item(item)) return;
  const key = item._d19TurnId;
  const count = (peState.attemptCounts[key] || 0) + 1;
  peState.attemptCounts[key] = count;
  const result = {
    score:null, transcript:'', targetText:item.targetText, promptText:_pePromptText(item),
    scoreStatus:'unscored-manual-completion', scoringMode:item._d19Turn.scoringMode,
    automatedScoreIsPartial:false, manualComplete:true, inputMethod:'teacher-manual-unscored',
    turnId:item._d19TurnId,
    attemptId:[peState.config.sessionId || 'd19-session', item._d19TurnId, 'teacher-unscored', count].join('::')
  };
  peState.results.push(result);
  try { if (typeof peState.config.onItemResult === 'function') peState.config.onItemResult(result, item, peState.index); }
  catch (e) { console.error('[D19] unscored teacher completion callback failed', e); }
  const area = document.getElementById('pe-result-area');
  if (area) {
    area.innerHTML = '<div class="pe-result-card"><div class="pe-feedback-text">Teacher completion recorded without a percentage. No 100% score was created.</div><div class="pe-feedback-dari dari">د ښوونکي بې نمرې بشپړول ثبت شول؛ سل سلنه نمره نه ده جوړه شوې.</div></div><div class="pe-action-row"><button class="btn btn-primary btn-sm" onclick="peNext()">Continue ➡️</button></div>';
  }
}

function openPracticeEngine(config) {
  // config: { title, items, startIndex, onItemResult, onTechnicalFailure,
  // onPause/onResume/onStop/onClose/onComplete, flow }
  config = config || {};
  cancelDialogueAutoCycle('newSession');
  peState.items = Array.isArray(config.items) ? config.items : [];
  const requestedIndex = Number(config.startIndex || 0);
  peState.index = Math.max(0, Math.min(peState.items.length, Number.isFinite(requestedIndex) ? requestedIndex : 0));
  peState.results = [];
  peState.title = config.title || 'Practice';
  peState.onComplete = config.onComplete || null;
  peState.flow = config.flow || load('pe_flow') || 'auto';
  peState.autoPaused = false;
  peState.config = config;
  peState.attemptCounts = Object.assign(Object.create(null), config.initialAttemptCounts || {});
  peState.closeHandled = false;
  peState.stopHandled = false;
  peState.completionHandled = false;
  peState._autoRetryCount = 0;
  const title = document.getElementById('pe-title');
  if (title) title.textContent = peState.title;
  const overlay = document.getElementById('practice-engine-overlay');
  if (overlay) overlay.classList.add('open');
  updatePracticeFlowBtns();
  renderPracticeItem();
}

function closePracticeEngine() {
  // I6H-D11B/D19: ONE cleanup path — after close, no timer may open the mic.
  if (peState.closeHandled) return;
  peState.closeHandled = true;
  cancelDialogueAutoCycle('close');
  peState._pendingScore  = null;
  peState._doneSpeaking  = false;
  peState.graceRestarted = 0;
  const overlay = document.getElementById('practice-engine-overlay');
  if (overlay) overlay.classList.remove('open');
  peState.recognition = null;
  try {
    if (peState.config && typeof peState.config.onClose === 'function') {
      peState.config.onClose({ completed:!!peState.completionHandled, index:peState.index, results:peState.results.slice() });
    }
  } catch (e) { console.error('[Practice Engine] close callback failed', e); }
}

function setPracticeFlow(flow) {
  if (flow !== 'auto' && flow !== 'manual') return;
  const previous = peState.flow;
  // I6H-D11B: mode change invalidates any pending auto callbacks.
  cancelDialogueAutoCycle('modeChange');
  peState.flow = flow;
  peState.autoPaused = false;
  save('pe_flow', flow);
  updatePracticeFlowBtns();
  try { if (peState.config && typeof peState.config.onModeChange === 'function') peState.config.onModeChange({from:previous,to:flow,index:peState.index}); }
  catch (e) { console.error('[Practice Engine] mode callback failed', e); }
  const overlay = document.getElementById('practice-engine-overlay');
  if (overlay && overlay.classList.contains('open') && peState.index < peState.items.length) renderPracticeItem();
}

function updatePracticeFlowBtns() {
  document.getElementById('pe-auto-btn').classList.toggle('active', peState.flow === 'auto');
  document.getElementById('pe-manual-btn').classList.toggle('active', peState.flow === 'manual');
}

function renderPracticeItem() {
  clearTimeout(peState.autoTimer);
  const area = document.getElementById('pe-content-area');
  const total = peState.items.length;
  const idx = peState.index;

  if (idx >= total) {
    renderPracticeFinal();
    return;
  }

  const item = peState.items[idx];
  const pct = Math.round((idx / Math.max(1, total)) * 100);
  const fill = document.getElementById('pe-progress-fill');
  if (fill) fill.style.width = pct + '%';

  try { if (peState.config && typeof peState.config.onItemChange === 'function') peState.config.onItemChange(item, idx); }
  catch (e) { console.error('[Practice Engine] item-change callback failed', e); }

  const isAuto = peState.flow === 'auto';
  const isD19 = _peIsD19Item(item);
  const promptText = _pePromptText(item);
  const promptPashto = _pePromptPashto(item);
  const showModel = !isD19 || item.showModelBeforeResponse === true;
  const manualControls = isAuto ? '' : `
    <div class="pe-controls">
      <button class="btn btn-primary btn-sm" onclick="pePlayAudio()">🔊 Hear Prompt</button>
      <button class="btn btn-outline btn-sm" id="pe-start-btn" onclick="peStartSpeech()">🎙️ Start Speaking</button>
      <button class="btn btn-ghost btn-sm" id="pe-done-btn" onclick="peStopSpeech()" style="display:none">⏹ Done Speaking</button>
    </div>
  `;
  const autoDoneBtn = isAuto ? '<div style="text-align:center;margin-top:8px;"><button class="btn btn-ghost btn-sm" id="pe-done-btn" onclick="peStopSpeech()" style="display:none;font-size:12px;">⏹ Done Speaking</button></div>' : '';
  const d19Details = isD19 ? `
      <div class="pe-d19-governance">${escHtml(item.routeLabel || 'Dialogue practice')}</div>
      <div class="pe-d19-task"><strong>Your task:</strong> ${escHtml(item.studentTaskText || '')}</div>
      ${item.supportPrompt ? `<div class="pe-d19-support"><strong>Support:</strong> ${escHtml(item.supportPrompt)}</div>` : ''}
      ${showModel ? `<div class="pe-d19-model"><strong>Model response:</strong> ${escHtml(item.targetText || '')}${item.targetPashto ? `<div class="dari">${escHtml(item.targetPashto)}</div>` : ''}</div>` : '<div class="pe-d19-model-pending">The complete model response is hidden until after you answer.</div>'}
    ` : '';
  const fallback = isD19 ? `
    <div class="pe-fallback-tools">
      <button type="button" class="btn btn-ghost btn-sm" onclick="peToggleTypingFallback()">⌨️ Typing / teacher fallback</button>
      <div id="pe-fallback-area" class="pe-fallback-area" hidden>
        <div id="pe-fallback-note" class="pe-fallback-note">Typing is a fallback when recognition is unavailable. It is labelled separately from spoken evidence.</div>
        <textarea id="pe-typing-input" rows="3" maxlength="1000" placeholder="Type the English response here"></textarea>
        <div class="pe-fallback-actions">
          <button type="button" class="btn btn-outline btn-sm" onclick="peSubmitTypingFallback()">Submit typed response</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="peRecordTeacherUnscoredCompletion()">Teacher: mark completed without score</button>
        </div>
      </div>
    </div>` : '';

  area.innerHTML = `
    <div class="pe-item-card${isD19 ? ' pe-d19-item-card' : ''}">
      <div class="pe-counter">${isD19 ? 'Turn' : 'Item'} ${idx+1} of ${total}</div>
      ${isD19 ? '<div class="pe-d19-prompt-label">Conversation partner</div>' : ''}
      <div class="pe-target-text">${escHtml(promptText)}</div>
      ${promptPashto ? `<div class="pe-target-dari dari">${escHtml(promptPashto)}</div>` : ''}
      ${d19Details}
      <div style="text-align:center;margin-top:8px;">
        <button class="btn btn-ghost btn-sm" onclick="peReplayPrompt()" style="font-size:12px;">🔊 Hear Again</button>
      </div>
    </div>
    <div class="pe-mic-area">
      <button class="pe-mic-btn" id="pe-mic-btn" onclick="peToggleSpeech()" title="Tap to speak">🎙️</button>
      <div class="pe-status-text" id="pe-status-text">${isAuto ? 'Getting ready...' : 'Tap 🎙️ or Start Speaking to begin'}</div>
    </div>
    ${manualControls}
    ${autoDoneBtn}
    ${fallback}
    <div class="pe-transcript-box" id="pe-transcript-box">Your speech will appear here...</div>
    <div id="pe-result-area"></div>
    ${isAuto ? '<div class="pe-auto-countdown" id="pe-countdown"></div>' : ''}
  `;

  peState.transcript = '';
  peState.isListening = false;

  if (peState.flow === 'auto') peAutoFlow(item);
  else peManualReadPrompt(item);
}

function peManualReadPrompt(item) {
  // Speak the partner prompt in manual mode; do NOT auto-open the mic afterward.
  const statusEl = document.getElementById('pe-status-text');
  if (statusEl) statusEl.textContent = '🔊 Listen carefully...';
  try { window.speechSynthesis.cancel(); } catch (e) { _peReportTechnicalFailure('tts-hardware-release-failure', e && e.message); }
  clearTimeout(peState.ttsTimer);
  const promptText = _pePromptText(item);
  if (!promptText || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
    _peReportTechnicalFailure('tts-hardware-release-failure', 'speech-synthesis-unavailable');
    if (statusEl) statusEl.textContent = 'Audio is unavailable. Read the prompt, then use the mic or typing/teacher fallback.';
    _peShowFallbackControls('Audio is unavailable. No academic score was recorded.');
    return;
  }
  const utter = new SpeechSynthesisUtterance(promptText);
  utter.lang  = item.lang === 'ps' ? 'ps-AF' : 'en-US';
  utter.rate  = state.speechRate || 0.9;
  utter.onend = function() {
    const st = document.getElementById('pe-status-text');
    if (st) st.textContent = 'Tap 🎙️ or Start Speaking to begin';
  };
  utter.onerror = function(e) {
    _peReportTechnicalFailure('tts-hardware-release-failure', e && e.error);
    const st = document.getElementById('pe-status-text');
    if (st) st.textContent = 'Prompt audio failed. Read the prompt and use the mic or fallback; no score was recorded.';
    _peShowFallbackControls('TTS failed. The turn remains available for retry, typing, or teacher completion.');
  };
  try { window.speechSynthesis.speak(utter); }
  catch (e) {
    _peReportTechnicalFailure('tts-hardware-release-failure', e && e.message);
    if (statusEl) statusEl.textContent = 'Prompt audio could not start. Read the prompt and use a fallback.';
    _peShowFallbackControls('TTS could not start. No academic score was recorded.');
  }
  const fallback = Math.max(3000, promptText.length * 90 + 1000);
  peState.ttsTimer = setTimeout(function() {
    const st = document.getElementById('pe-status-text');
    if (st && st.textContent === '🔊 Listen carefully...') st.textContent = 'Tap 🎙️ or Start Speaking to begin';
  }, fallback);
}

function peAutoFlow(item) {
  /* I6H-D11B/D19: one true Auto Mode cycle — preparing → speaking →
     releasingAudio(1400ms) → startingMic → listening. Every delayed step is
     session-token guarded, so a stale prompt can never open the mic or score
     the wrong Dialogue turn. */
  const tok = ++peState.sessionToken;
  peState.autoPhase = 'preparing';
  const statusEl = document.getElementById('pe-status-text');
  if (statusEl) statusEl.textContent = '🔊 Listen carefully...';
  try { window.speechSynthesis.cancel(); } catch (e) { _peReportTechnicalFailure('tts-hardware-release-failure', e && e.message); }
  clearTimeout(peState.autoTimer);
  clearTimeout(peState.ttsTimer);
  clearTimeout(peState.releaseTimer);

  function cycleStillValid(){
    if (tok !== peState.sessionToken) return false;
    const ov = document.getElementById('practice-engine-overlay');
    if (!ov || !ov.classList.contains('open')) return false;
    if (peState.autoPaused || peState.flow !== 'auto') return false;
    return true;
  }

  let ttsDone = false;
  const afterTTS = () => {
    if (ttsDone) return;
    ttsDone = true;
    clearTimeout(peState.ttsTimer);
    if (!cycleStillValid()) return;
    try {
      if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        peState.ttsTimer = setTimeout(afterTTSRecheck, 250);
        return;
      }
    } catch(e){}
    enterReleasingAudio();
  };
  function afterTTSRecheck(){
    if (!cycleStillValid()) return;
    try {
      if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        peState.ttsTimer = setTimeout(afterTTSRecheck, 250);
        return;
      }
    } catch(e){}
    enterReleasingAudio();
  }
  function enterReleasingAudio(){
    if (!cycleStillValid()) return;
    peState.autoPhase = 'releasingAudio';
    const st = document.getElementById('pe-status-text');
    if (st) st.textContent = 'Get ready to speak...';
    peState.releaseTimer = setTimeout(function(){
      if (!cycleStillValid()) return;
      if (peState.isListening || peState._activeRec) return;
      try { if (window.speechSynthesis && window.speechSynthesis.speaking) return; } catch(e){}
      peState.autoPhase = 'startingMic';
      peStartSpeech(tok);
    }, DIALOGUE_AUTO_AUDIO_RELEASE_MS);
  }

  const promptText = _pePromptText(item);
  if (!promptText || !window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
    _peReportTechnicalFailure('tts-hardware-release-failure', 'speech-synthesis-unavailable');
    peState.autoPhase = 'manualFallback';
    if (statusEl) statusEl.textContent = 'Prompt audio is unavailable. Read the prompt, then use the mic or typing/teacher fallback.';
    _peShowFallbackControls('TTS is unavailable. The turn was not scored.');
    return;
  }
  const utter = new SpeechSynthesisUtterance(promptText);
  utter.lang = item.lang === 'ps' ? 'ps-AF' : 'en-US';
  utter.rate = state.speechRate || 0.9;
  utter.onstart = function(){ if (tok === peState.sessionToken) peState.autoPhase = 'speaking'; };
  utter.onend = afterTTS;
  utter.onerror = function(e) {
    if (tok !== peState.sessionToken) return;
    ttsDone = true;
    clearTimeout(peState.ttsTimer);
    _peReportTechnicalFailure('tts-hardware-release-failure', e && e.error);
    peState.autoPhase = 'manualFallback';
    const st = document.getElementById('pe-status-text');
    if (st) st.textContent = 'Prompt audio failed. Read the prompt and start the mic manually; no score was recorded.';
    _peShowFallbackControls('TTS failed. Retry, type the response, or use teacher completion.');
  };
  try { window.speechSynthesis.speak(utter); }
  catch (e) {
    _peReportTechnicalFailure('tts-hardware-release-failure', e && e.message);
    peState.autoPhase = 'manualFallback';
    if (statusEl) statusEl.textContent = 'Prompt audio could not start. Use the manual fallback; no score was recorded.';
    _peShowFallbackControls('TTS could not start. The current turn remains intact.');
    return;
  }
  const charMs = promptText.length * 95;
  peState.ttsTimer = setTimeout(afterTTS, Math.max(4000, charMs + 1500));
}

function peReplayPrompt() {
  const item = peState.items[peState.index];
  if (!item) return;
  if (peState.flow === 'auto' && !peState.autoPaused) {
    cancelDialogueAutoCycle('replay');
    peAutoFlow(item);
    return;
  }
  clearTimeout(peState.ttsTimer);
  try { window.speechSynthesis.cancel(); } catch (e) { _peReportTechnicalFailure('tts-hardware-release-failure', e && e.message); }
  const promptText = _pePromptText(item);
  try {
    const u = new SpeechSynthesisUtterance(promptText);
    u.lang = item.lang === 'ps' ? 'ps-AF' : 'en-US';
    u.rate = state.speechRate || 0.9;
    u.onerror = function(e) { _peReportTechnicalFailure('tts-hardware-release-failure', e && e.error); _peShowFallbackControls('Replay audio failed. The turn remains available.'); };
    window.speechSynthesis.speak(u);
  } catch (e) {
    _peReportTechnicalFailure('tts-hardware-release-failure', e && e.message);
    _peShowFallbackControls('Replay audio failed. Read the prompt and use a fallback.');
  }
}

function pePlayAudio() {
  const item = peState.items[peState.index];
  if (!item) return;
  try { speak(_pePromptText(item), item.lang || 'en'); }
  catch (e) { _peReportTechnicalFailure('tts-hardware-release-failure', e && e.message); _peShowFallbackControls('Prompt audio failed. No academic score was recorded.'); }
}

function peToggleSpeech() {
  if (peState.isListening) peStopSpeech();
  else peStartSpeech();
}

function _peRecordTechnicalFailure(code, detail) {
  // Backward-compatible alias kept for the existing D11B call sites. All
  // technical evidence flows through the single D19/D18 neutral reporter.
  return _peReportTechnicalFailure(code, detail);
}

function peStartSpeech(cycleTok) {
  // v1.10C: True paragraph patience — sliding silence timer resets on every new speech
  // I6H-D11B: cycleTok (optional) ties this start to one auto cycle; a manual
  // tap passes no token and always runs. Duplicate-start guard added.
  if (peState.isListening || peState._activeRec || peState._micStarting) return;
  if (typeof cycleTok === 'number' && cycleTok !== peState.sessionToken) return; // stale
  clearTimeout(peState.autoTimer);
  clearTimeout(peState.graceTimer);
  peState._pendingScore = null;
  peState._doneSpeaking = false;

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    const stNS = document.getElementById('pe-status-text');
    if (stNS) stNS.textContent = 'Speech recognition is not supported. Use typing or teacher fallback; no academic score was recorded.';
    peState.autoPhase = 'manualFallback';
    _peRecordTechnicalFailure('recognition-unsupported');
    _peShowFallbackControls('Recognition is unsupported. Type a response or use teacher completion.');
    return;
  }
  try { window.speechSynthesis.cancel(); } catch (e) { _peRecordTechnicalFailure('tts-hardware-release-failure', e && e.message); }

  const item    = peState.items[peState.index];
  const lang    = item?.lang === 'ps' ? 'ps-AF' : 'en-US';
  const isLong  = peIsLongItem(item);
  const SR      = window.SpeechRecognition || window.webkitSpeechRecognition;
  const SILENCE = 3000; // three seconds of real silence before scoring
  const MAX_RESTARTS = 3; // safety cap so we never get stuck

  peState.transcript     = '';
  peState.graceRestarted = 0;
  peState._silenceTimer  = null;

  // --- Scoring gate — called exactly once ---
  let scored = false;
  function doFinalScore() {
    if (scored || peState._doneSpeaking) {
      if (!scored) { scored = true; _executeScore(); }
      return;
    }
    scored = true;
    _executeScore();
  }
  function _executeScore() {
    clearTimeout(peState.graceTimer);
    clearTimeout(peState._silenceTimer);
    peState._pendingScore = null;
    // v1.10G2 TASK 2: Use best available transcript — state → DOM interim → nothing
    if (!peState.transcript) {
      const box = document.getElementById('pe-transcript-box');
      const domText = box ? box.textContent.replace(' ▋','').trim() : '';
      if (domText && domText.length > 2 && !domText.startsWith('Your speech') && domText !== '...') {
        peState.transcript = domText;
      }
    }
    if (peState.transcript) {
      scorePracticeAnswer();
    } else {
      _peRecordTechnicalFailure('recognition-technical-timeout', 'empty-transcript-at-score-gate');
      const st2 = document.getElementById('pe-status-text');
      if (st2) st2.textContent = 'Nothing heard — retry or use typing/teacher fallback. No score was recorded.';
      _peShowFallbackControls('Nothing was captured. The turn remains unscored and resumable.');
    }
  }
  peState._pendingScore = doFinalScore; // Done Speaking can call this

  // --- Silence timer — resets every time new speech is detected ---
  function resetSilenceTimer() {
    clearTimeout(peState._silenceTimer);
    if (peState._doneSpeaking) return;
    peState._silenceTimer = setTimeout(() => {
      // Real silence — stop current rec (onend → maybe restart or score)
      if (peState._activeRec) {
        try { peState._activeRec.stop(); } catch(e) {}
      }
    }, SILENCE);
  }

  // --- Merge helper to avoid duplicate words at restart boundary ---
  function mergeTranscripts(prev, next) {
    const pWords = prev.trim().split(/\s+/);
    const nWords = next.trim().split(/\s+/);
    let overlap = 0;
    for (let n = Math.min(pWords.length, nWords.length, 6); n > 0; n--) {
      if (pWords.slice(-n).join(' ').toLowerCase() === nWords.slice(0, n).join(' ').toLowerCase()) {
        overlap = n; break;
      }
    }
    return overlap > 0
      ? (prev.trim() + ' ' + nWords.slice(overlap).join(' ')).trim()
      : (prev.trim() + ' ' + next.trim()).trim();
  }

  // --- Start one recognition session, restart on end if still in patience window ---
  function startRec() {
    if (scored || peState._doneSpeaking) return;
    if (peState.graceRestarted >= MAX_RESTARTS) { doFinalScore(); return; }

    let rec;
    try { rec = new SR(); }
    catch (e) {
      peState.autoPhase = 'manualFallback';
      const code = _peReportTechnicalFailure(e && e.name || 'speech-service-unavailable', e && e.message);
      const st = document.getElementById('pe-status-text');
      if (st) st.textContent = 'Recognition could not start (' + code + '). Use typing or teacher fallback.';
      _peShowFallbackControls('Recognition could not be created. The turn remains unscored.');
      return;
    }
    rec.lang            = lang;
    rec.continuous      = false;
    rec.interimResults  = true;
    peState._activeRec  = rec;
    peState.recognition = rec;

    rec.onresult = (e) => {
      const interim = Array.from(e.results).map(r => r[0].transcript).join('');
      const box = document.getElementById('pe-transcript-box');

      if (isLong) {
        // Accumulate — show cursor while listening
        const combined = peState.transcript
          ? mergeTranscripts(peState.transcript, interim)
          : interim;
        if (box) box.textContent = combined + ' ▋';
        // Reset silence timer on every result event
        resetSilenceTimer();
      } else {
        if (box) box.textContent = interim || '...';
      }

      if (e.results[e.results.length - 1].isFinal) {
        const finalText = interim;
        if (peState.transcript) {
          peState.transcript = mergeTranscripts(peState.transcript, finalText);
        } else {
          peState.transcript = finalText;
        }
        if (box) {
          box.textContent = isLong ? peState.transcript + ' ▋' : peState.transcript;
        }
        if (isLong) resetSilenceTimer(); // keep patience window alive
      }
    };

    rec.onend = () => {
      peState._activeRec  = null;
      peState.isListening = false;
      const micBtn   = document.getElementById('pe-mic-btn');
      const startBtn = document.getElementById('pe-start-btn');
      const doneBtn  = document.getElementById('pe-done-btn');
      if (micBtn)   { micBtn.classList.remove('listening'); micBtn.textContent = '🎙️'; }
      if (startBtn) startBtn.style.display = '';
      if (doneBtn)  doneBtn.style.display  = 'none';

      if (scored || peState._doneSpeaking) { if (!scored) doFinalScore(); return; }

      if (isLong && peState.transcript && peState.graceRestarted < MAX_RESTARTS) {
        // Still in patience window — restart recognition
        peState.graceRestarted++;
        const st = document.getElementById('pe-status-text');
        if (st) st.textContent = '⏳ Keep speaking... still listening';
        const box = document.getElementById('pe-transcript-box');
        if (box) box.textContent = peState.transcript + ' ▋';

        // Show the mic is "alive" again
        if (micBtn)  { micBtn.classList.add('listening'); micBtn.textContent = '🔴'; }
        if (doneBtn) doneBtn.style.display = '';
        peState.isListening = true;

        // Safety cap — score if silence timer already expired (rec ended from silence timeout)
        // The silence timer may have fired rec.stop(); if so, silence was real → score
        if (!peState._silenceTimer) {
          // Silence timer already cleared → that was a real silence → score
          doFinalScore();
          return;
        }
        // Otherwise restart and keep going
        try { startRec(); } catch(e) { doFinalScore(); }
      } else {
        doFinalScore();
      }
    };

    rec.onerror = (e) => {
      peState._activeRec  = null;
      peState.isListening = false;
      peState._micStarting = false;
      const micBtn = document.getElementById('pe-mic-btn');
      if (micBtn) { micBtn.classList.remove('listening'); micBtn.textContent = '🎙️'; }
      const st = document.getElementById('pe-status-text');
      const errorName = e && e.error || 'unknown-error';
      /* Errors are academically neutral. Natural end-of-speech after a real
         transcript is not misclassified as a technical failure. */
      if (errorName === 'not-allowed' || errorName === 'service-not-allowed' || errorName === 'permission-denied') {
        peState.autoPhase = 'manualFallback'; clearTimeout(peState.micRetryTimer);
        _peReportTechnicalFailure('microphone-permission-denied', errorName);
        if (st) st.textContent = 'Microphone permission is needed. Allow access or use typing/teacher fallback; no score was recorded.';
        _peShowFallbackControls('Microphone permission was denied. The turn remains available.');
      } else if (errorName === 'audio-capture') {
        peState.autoPhase = 'manualFallback'; _peReportTechnicalFailure('no-microphone', errorName);
        if (st) st.textContent = 'No microphone was found. Connect one or use typing/teacher fallback.';
        _peShowFallbackControls('No microphone was found. No academic zero was created.');
      } else if (errorName === 'network') {
        _peReportTechnicalFailure('speech-service-unavailable', errorName);
        if (st) st.textContent = 'Speech service connection problem — retry or use a fallback. No score was recorded.';
        _peShowFallbackControls('Speech service is unavailable. The turn remains intact.');
      } else if (errorName === 'no-speech') {
        if (isLong && peState.transcript && peState.graceRestarted < MAX_RESTARTS) {
          doFinalScore();
        } else {
          _peReportTechnicalFailure('recognition-technical-timeout', errorName);
          if (st) st.textContent = 'Nothing heard — retry when ready or use a fallback. No score was recorded.';
          _peShowFallbackControls('No speech was captured. This is a technical-neutral event, not a wrong answer.');
        }
      } else if (errorName !== 'aborted') {
        const code = _peReportTechnicalFailure(errorName, errorName);
        if (st) st.textContent = 'Mic error (' + code + '). Retry or use a fallback; no score was recorded.';
        _peShowFallbackControls('Recognition failed. The turn remains available for retry.');
      }
    };

    function showListeningUI(){
      peState.isListening = true;
      peState._micStarting = false;
      peState.autoPhase = 'listening';
      const micBtn   = document.getElementById('pe-mic-btn');
      const startBtn = document.getElementById('pe-start-btn');
      const doneBtn  = document.getElementById('pe-done-btn');
      if (micBtn)   { micBtn.classList.add('listening'); micBtn.textContent = '🔴'; }
      if (startBtn) startBtn.style.display = 'none';
      if (doneBtn)  doneBtn.style.display  = '';
      const st = document.getElementById('pe-status-text');
      if (st) st.textContent = isLong
        ? '🎙️ Speak the full text — pausing between sentences is OK!'
        : '🎙️ Speak now — listening!';
      if (isLong) {
        peState._silenceTimer = setTimeout(() => {
          if (!peState.transcript) { try { rec.stop(); } catch(e) {} }
        }, SILENCE + 2000);
      }
    }
    /* I6H-D11B: transient start failures (InvalidStateError / AbortError /
       audio device not yet released / recognition still stopping) are
       RETRIED with a short centralized backoff — they are NEVER scored as a
       wrong answer and NEVER evaluate an empty transcript. */
    function attemptStart(){
      if (typeof cycleTok === 'number' && cycleTok !== peState.sessionToken) { peState._micStarting = false; return; }
      try {
        peState._micStarting = true;
        rec.start();
        peState.micRetryCount = 0;
        showListeningUI();
      } catch(e) {
        peState._micStarting = false;
        const attempt = peState.micRetryCount;
        if (attempt < DIALOGUE_MIC_RETRY_DELAYS_MS.length) {
          peState.micRetryCount++;
          const st = document.getElementById('pe-status-text');
          if (st) st.textContent = '⏳ Preparing microphone… (' + peState.micRetryCount + ')';
          clearTimeout(peState.micRetryTimer);
          peState.micRetryTimer = setTimeout(function(){
            if (typeof cycleTok === 'number' && cycleTok !== peState.sessionToken) return; // stale retry
            attemptStart();
          }, DIALOGUE_MIC_RETRY_DELAYS_MS[attempt]);
        } else {
          // Retry exhausted → manualFallback: current item stays intact,
          // no scoring, visible manual start affordance.
          peState.micRetryCount = 0;
          peState.autoPhase = 'manualFallback';
          _peRecordTechnicalFailure('invalid-state-double-start', e && (e.name || e.message));
          const st2 = document.getElementById('pe-status-text');
          if (st2) st2.textContent = 'Automatic microphone start was blocked. Tap 🎙️ or use typing/teacher fallback; no score was recorded.';
          _peShowFallbackControls('Automatic mic start failed after bounded retries. The turn remains intact.');
          const micBtn2 = document.getElementById('pe-mic-btn');
          if (micBtn2) micBtn2.classList.add('pe-mic-attention');
          const doneBtn2 = document.getElementById('pe-done-btn');
          if (doneBtn2) doneBtn2.style.display = 'none';
        }
      }
    }
    attemptStart();
  }

  startRec();
}

function peStopSpeech() {
  // v1.10C: Done Speaking — score immediately, stop ALL recognition and timers
  peState._doneSpeaking = true;
  clearTimeout(peState.graceTimer);
  clearTimeout(peState.autoTimer);
  clearTimeout(peState._silenceTimer);
  peState._silenceTimer = null;

  // Stop active recognition (the sliding-window rec)
  if (peState._activeRec) {
    try { peState._activeRec.stop(); } catch(e) {}
    peState._activeRec = null;
  }
  if (peState.recognition) {
    try { peState.recognition.stop(); } catch(e) {}
  }
  peState.isListening = false;

  // v1.10G2 TASK 2: If state transcript is empty, try DOM interim text as fallback
  if (!peState.transcript) {
    const box = document.getElementById('pe-transcript-box');
    const domText = box ? box.textContent.replace(' ▋','').trim() : '';
    if (domText && domText.length > 2 && !domText.startsWith('Your speech') && domText !== '...') {
      peState.transcript = domText;
    }
  }

  // Fire pending score immediately
  if (peState._pendingScore) {
    const fn = peState._pendingScore;
    peState._pendingScore = null;
    fn();
  } else if (peState.transcript) {
    scorePracticeAnswer();
  }
}

function scorePracticeAnswer(options) {
  options = options || {};
  const item = peState.items[peState.index];
  if (!item || !peState.transcript) return;
  let scoreMeta;
  if (_peIsD19Item(item)) scoreMeta = calculateD19TurnScore(peState.transcript, item._d19Turn, item._d19DialogueId);
  else scoreMeta = { score:calculateScore(peState.transcript, item.targetText), partial:false, scoringMode:'model-repeat' };
  const score = scoreMeta.score;
  if (_peIsD19Item(item) && typeof score !== 'number') {
    _peReportTechnicalFailure(scoreMeta.reason || 'dialogue-scoring-authority-unavailable', 'No D19 score was created.');
    _peShowFallbackControls('The Dialogue scoring authority is temporarily unavailable. No academic score was recorded; retry, type the response, or ask a teacher to record an unscored completion.');
    return;
  }
  const key = item._d19TurnId || ('item-' + peState.index);
  const count = (peState.attemptCounts[key] || 0) + 1;
  peState.attemptCounts[key] = count;
  const attemptId = [peState.config.sessionId || 'practice-session', key, options.inputMethod || (peState.flow === 'auto' ? 'auto' : 'manual'), count].join('::');
  const result = {
    score:score, transcript:peState.transcript, targetText:item.targetText,
    promptText:_pePromptText(item), turnId:item._d19TurnId || null,
    scoringMode:scoreMeta.scoringMode || item._d19Turn?.scoringMode || 'model-repeat',
    automatedScoreIsPartial:scoreMeta.partial === true || scoreMeta.automatedScoreIsPartial === true,
    scoreStatus:scoreMeta.scoreStatus || ((scoreMeta.partial === true || scoreMeta.automatedScoreIsPartial === true) ? 'automated-partial' : 'automated-complete'),
    teacherRubricId:scoreMeta.teacherRubricId || item._d19Turn?.teacherRubricId || null,
    inputMethod:options.inputMethod || (peState.flow === 'auto' ? 'speech-auto' : 'speech-manual'),
    attemptId:attemptId
  };
  peState.results.push(result);
  try { if (peState.config && typeof peState.config.onItemResult === 'function') result.progress = peState.config.onItemResult(result, item, peState.index) || null; }
  catch (e) { console.error('[Practice Engine] item result callback failed', e); }
  if (_peIsD19Item(item)) {
    savePracticeResult({ type:'dialogue', topic:peState.title, score:score, mode:'en', dialogueId:peState.config.dialogueId || '', turnId:item._d19TurnId, routeMode:peState.config.routeMode || '', scoringMode:result.scoringMode, automatedScoreIsPartial:result.automatedScoreIsPartial, inputMethod:result.inputMethod, date:new Date().toISOString() });
  } else {
    savePracticeResult({ type:'practice', topic:peState.title, score:score, mode:'en', date:new Date().toISOString() });
  }
  showPracticeResult(score, peState.transcript, item.targetText, item.targetPashto, result);
}

function savePracticeResult(entry) {
  saveToHistory(entry);
}

function pePauseToggle() {
  peState.autoPaused = !peState.autoPaused;
  const btn = document.getElementById('pe-pause-btn');
  const indicator = document.getElementById('pe-pause-indicator');
  if (peState.autoPaused) {
    cancelDialogueAutoCycle('pause');
    if (btn) { btn.textContent = '▶️ Resume'; btn.classList.add('active'); }
    if (indicator) indicator.classList.add('visible');
    try { if (peState.config && typeof peState.config.onPause === 'function') peState.config.onPause({index:peState.index,item:peState.items[peState.index] || null}); }
    catch (e) { console.error('[Practice Engine] pause callback failed', e); }
  } else {
    if (btn) { btn.textContent = '⏸ Pause'; btn.classList.remove('active'); }
    if (indicator) indicator.classList.remove('visible');
    try { if (peState.config && typeof peState.config.onResume === 'function') peState.config.onResume({index:peState.index,item:peState.items[peState.index] || null}); }
    catch (e) { console.error('[Practice Engine] resume callback failed', e); }
    const cdEl = document.getElementById('pe-countdown');
    if (cdEl && cdEl.dataset.score) startAutoCountdown(parseInt(cdEl.dataset.score));
    else if (peState.flow === 'auto' && peState.index < peState.items.length) peAutoFlow(peState.items[peState.index]);
  }
}

function peStopSession() {
  if (peState.stopHandled) return;
  peState.stopHandled = true;
  peState.closeHandled = true;
  cancelDialogueAutoCycle('stop');
  peState._pendingScore = null;
  peState._doneSpeaking = false;
  const overlay = document.getElementById('practice-engine-overlay');
  if (overlay) overlay.classList.remove('open');
  try { if (peState.config && typeof peState.config.onStop === 'function') peState.config.onStop({index:peState.index,results:peState.results.slice()}); }
  catch (e) { console.error('[Practice Engine] stop callback failed', e); }
}

function speakResult(score, spoken, expected, onDone) {
  // v1.13B: use teacher-like local feedback for the spoken message
  if (!window.speechSynthesis) { if (onDone) setTimeout(onDone, 400); return; }
  const spokenNorm   = normalizeForScore(spoken   || '');
  const expectedNorm = normalizeForScore(expected  || '');
  const msg = zirakTeacherFeedback(score, spokenNorm, expectedNorm);

  window.speechSynthesis.cancel();
  clearTimeout(peState.resultVoiceTimer);

  const utter = new SpeechSynthesisUtterance(msg);
  utter.lang = 'en-US';
  utter.rate = state.speechRate || 0.9;

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(peState.resultVoiceTimer);
    if (onDone) setTimeout(onDone, 350);
  };
  utter.onend   = finish;
  utter.onerror = finish;

  // Fallback so we never get stuck if onend doesn't fire
  const fallbackMs = Math.max(3000, msg.length * 75);
  peState.resultVoiceTimer = setTimeout(finish, fallbackMs);

  window.speechSynthesis.speak(utter);
}

function startAutoCountdown(score) {
  // v1.10C: Auto mode — always advance; max 2 auto-retries for weak items
  if (peState.autoPaused) return;

  const isWeak = score < 70;
  // Track auto-retries per item — reset when moving to a new item (peNext resets it)
  if (isWeak) {
    peState._autoRetryCount = (peState._autoRetryCount || 0) + 1;
  }
  const maxed = isWeak && peState._autoRetryCount > 2;

  const waitSec = score >= 90 ? 3 : score >= 70 ? 4 : 4;
  let remaining  = waitSec;
  let action, nextFn;

  if (!isWeak) {
    action = 'Auto-next'; nextFn = peNext;
  } else if (maxed) {
    action = 'Moving to next (max retries reached)'; nextFn = peNext;
  } else {
    action = `Auto-retry (${peState._autoRetryCount}/2)`; nextFn = peRetry;
  }

  const cdEl = document.getElementById('pe-countdown');
  if (cdEl) cdEl.dataset.score = score;

  const tick = () => {
    if (peState.autoPaused) return;
    if (!document.getElementById('pe-result-area')?.firstChild) return;
    const cdEl2 = document.getElementById('pe-countdown');
    if (cdEl2) cdEl2.textContent = remaining > 0
      ? `${action} in ${remaining}s… tap Pause or Try Again to stop`
      : '';
    if (remaining <= 0) { nextFn(); return; }
    remaining--;
    peState.autoTimer = setTimeout(tick, 1000);
  };
  peState.autoTimer = setTimeout(tick, 500);
}

function showPracticeResult(score, spoken, expected, expectedPashto, scoreMeta) {
  const area = document.getElementById('pe-result-area');
  if (!area) return;
  const btn = document.getElementById('pe-mic-btn');
  if (btn) {
    btn.classList.remove('listening');
    btn.classList.toggle('success', score >= 70);
    btn.textContent = score >= 70 ? '✅' : '🎙️';
  }
  const scoreClass = score >= 90 ? 'pe-score-excellent' : score >= 70 ? 'pe-score-good' : score >= 40 ? 'pe-score-ok' : 'pe-score-low';

  // v1.13B: teacher-like local feedback
  const spokenNorm   = normalizeForScore(spoken   || '');
  const expectedNorm = normalizeForScore(expected  || '');
  const teacherMsg = scoreMeta && scoreMeta.automatedScoreIsPartial
    ? 'Automated partial evidence recorded. A teacher rubric is still required for a complete speaking judgment.'
    : zirakTeacherFeedback(score, spokenNorm, expectedNorm);

  // Pashto support label (short motivational)
  const dariLabels = [
    { min:0,  dari:'بیا یې ورو وازمویه' },
    { min:40, dari:'نور تمرین ته اړتیا لري' },
    { min:70, dari:'ښه دی، دوام ورکړه!' },
    { min:90, dari:'عالي!' }
  ];
  const fbPashto = [...dariLabels].reverse().find(f => score >= f.min) || dariLabels[0];

  // v1.13B: extract Pashto meaning from current item if available
  const currentItem = peState.items ? peState.items[peState.index] : null;
  const meaning = zirakExtractMeaning(currentItem || {});
  // Also use the passed-in expectedPashto compatibility slot as Pashto fallback only
  const dariToShow   = meaning.pashto || expectedPashto || null;
  const pashtoToShow = null;

  // Build meaning block HTML
  let meaningHtml = '';
  if (dariToShow) {
    meaningHtml += `<div class="pe-meaning-dari dari" style="font-size:14px;color:var(--text-dari);margin-top:6px;padding:6px 10px;background:var(--bg-card2);border-radius:8px;border-right:3px solid var(--gold);">${escHtml(dariToShow)}</div>`;
  }
  if (pashtoToShow) {
    meaningHtml += `<div class="pe-meaning-pashto" style="font-size:13px;color:var(--text-muted);margin-top:4px;padding:4px 10px;background:var(--bg-card2);border-radius:8px;border-right:3px solid var(--lapis-light);">${escHtml(pashtoToShow)}</div>`;
  }

  // Build word comparison
  const expectedWords = expectedNorm.split(/\s+/).filter(Boolean);
  const spokenWords   = spokenNorm.split(/\s+/).filter(Boolean);
  const targetChips   = expectedWords.map(w =>
    `<span class="pe-word-chip ${spokenWords.includes(w) ? 'correct' : 'missed'}">${escHtml(w)}</span>`
  ).join('');
  const extraWords = spokenWords.filter(w => !expectedWords.includes(w));
  const extraChips = extraWords.length
    ? `<div class="pe-compare-label" style="margin-top:6px;">Extra words spoken:</div>
       <div class="pe-extra-chips">${extraWords.map(w => `<span class="pe-word-chip extra">${escHtml(w)}</span>`).join('')}</div>`
    : '';

  const autoMsg = peState.flow === 'auto'
    ? `<div class="pe-auto-countdown" id="pe-countdown"></div>`
    : '';

  area.innerHTML = `
    <div class="pe-result-card" id="pe-result-card">
      <div class="pe-score-row">
        <div class="pe-score-circle ${scoreClass}">${score}%</div>
        <div style="flex:1;">
          <div class="pe-feedback-text">${escHtml(teacherMsg)}</div>
          <div class="pe-feedback-dari dari">${escHtml(fbPashto.dari)}</div>
          ${scoreMeta && scoreMeta.automatedScoreIsPartial ? '<div class="pe-partial-label">Partial automated evidence · teacher rubric pending</div>' : ''}
        </div>
      </div>
      <div class="pe-compare-label" style="margin-top:10px;">Target sentence:</div>
      <div class="pe-word-chips">${targetChips}</div>
      ${extraChips}
      ${meaningHtml}
      <div style="margin-top:8px;font-size:12px;color:var(--text-muted);">You said:</div>
      <div style="font-size:14px;font-style:italic;margin-bottom:4px;">"${escHtml(spoken || '(nothing heard)')}"</div>
    </div>
    <div class="pe-action-row" style="margin-bottom:8px;">
      <button class="btn btn-outline btn-sm" onclick="peRetry()">🔄 Try Again</button>
      <button class="btn btn-primary btn-sm" onclick="peNext()">Continue ➡️</button>
      <button class="btn btn-ghost btn-sm" onclick="peReplayResult()">🔊 Replay</button>
    </div>
    ${autoMsg}
  `;

  // v1.13B: smooth scroll — use 'nearest' to respect mobile nav spacing
  zirakScrollToResult('pe-result-card', 200);

  // Speak teacher feedback then start auto countdown
  speakResult(score, spoken, expected, () => {
    if (peState.flow === 'auto' && !peState.autoPaused) {
      startAutoCountdown(score);
    }
  });
}

function peReplayResult() {
  // v1.6B: Replay result voice; do NOT restart countdown after replay
  clearTimeout(peState.autoTimer);
  clearTimeout(peState.resultVoiceTimer);
  const lastResult = peState.results[peState.results.length - 1];
  if (lastResult) {
    speakResult(lastResult.score, lastResult.transcript, lastResult.targetText, null);
  }
}

function peRetry() {
  // I6H-D11B: ONE cleanup — an old mic retry can never fire on the new take.
  cancelDialogueAutoCycle('retry');
  peState._pendingScore = null;
  peState._doneSpeaking = false;
  peState.transcript = '';
  peState.graceRestarted = 0;
  if (peState.results.length) peState.results.pop();
  renderPracticeItem();
}

function peNext() {
  // I6H-D11B: ONE cleanup — an old retry/release timer can never open the
  // microphone on the next dialogue line (test matrix F).
  cancelDialogueAutoCycle('next');
  peState._pendingScore   = null;
  peState._doneSpeaking   = false;
  peState._autoRetryCount = 0; // v1.10C: reset per-item retry counter
  peState.index++;
  if (peState.config && typeof peState.config.onPositionChange === 'function') {
    try { peState.config.onPositionChange(peState.index, peState.items[peState.index] || null); } catch (e) {}
  }
  renderPracticeItem();
}

function renderPracticeFinal() {
  if (peState.completionHandled) return;
  peState.completionHandled = true;
  cancelDialogueAutoCycle('complete');
  const area = document.getElementById('pe-content-area');
  const scored = peState.results.filter(function(r) { return typeof r.score === 'number' && isFinite(r.score); });
  const total = peState.results.length;
  const avg = scored.length ? Math.round(scored.reduce(function(s,r){ return s+r.score; },0) / scored.length) : null;
  const fill = document.getElementById('pe-progress-fill'); if (fill) fill.style.width = '100%';
  const sessionLabel = peState.title || 'Practice Session';
  const allMissed = [], allExtra = [];
  scored.forEach(function(r) {
    if (r.targetText && r.transcript !== undefined) {
      const norm = function(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g,'').trim(); };
      const expected = norm(r.targetText).split(/\s+/).filter(Boolean);
      const spoken = norm(r.transcript || '').split(/\s+/).filter(Boolean);
      expected.forEach(function(w){ if (!spoken.includes(w) && !allMissed.includes(w)) allMissed.push(w); });
      spoken.forEach(function(w){ if (!expected.includes(w) && !allExtra.includes(w)) allExtra.push(w); });
    }
  });
  const breakdownHTML = peState.results.map(function(r) {
    const scoreText = typeof r.score === 'number' ? r.score + '%' : 'Unscored';
    const tone = typeof r.score === 'number' && r.score >= 70 ? 'var(--emerald)' : (typeof r.score === 'number' ? 'var(--coral,#e05555)' : 'var(--text-muted)');
    const target = String(r.targetText || 'Teacher-recorded completion');
    return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--divider);">' +
      '<span style="font-size:12px;font-weight:700;color:' + tone + '">' + escHtml(scoreText) + '</span>' +
      '<span style="font-size:12px;flex:1;">' + escHtml(target.substring(0,38) + (target.length>38?'...':'')) + '</span>' +
      (r.automatedScoreIsPartial ? '<span class="pe-partial-label">partial</span>' : '') + '</div>';
  }).join('');
  area.innerHTML = '<div class="pe-final-card"><div class="pe-final-label" style="margin-bottom:4px;">' +
    (avg == null ? 'Session complete — no percentage was invented' : 'Average scored evidence: ' + avg + '%') +
    ' · ' + total + ' turn' + (total!==1?'s':'') + '</div><div style="text-align:left;margin-bottom:12px;">' + breakdownHTML + '</div></div>';

  const proCard = buildProResultCard({
    score: avg == null ? 0 : avg,
    sessionTitle: sessionLabel,
    sectionType: avg == null ? 'Practice Engine · unscored completion' : 'Practice Engine',
    missedWords: allMissed,
    extraWords: allExtra,
    onPracticeAgain: function() {
      if (peState.config && typeof peState.config.onPracticeAgain === 'function') peState.config.onPracticeAgain();
      else { peState.completionHandled=false; peState.index=0; peState.results=[]; renderPracticeItem(); }
    },
    onContinue: function() { closePracticeEngine(); }
  });
  area.appendChild(proCard);
  setTimeout(function(){ if (area.firstChild) area.firstChild.scrollIntoView({behavior:'smooth',block:'start'}); },200);

  try {
    if (window.speechSynthesis && avg != null) {
      window.speechSynthesis.cancel();
      const peWho = window.zirakActiveStudentName ? window.zirakActiveStudentName() : null;
      const peName = peWho && peWho.hasStudent ? peWho.firstName : '';
      const peFinalMsg = buildFinalFeedbackMsg(avg, true, peName);
      setTimeout(function(){ const u=new SpeechSynthesisUtterance(peFinalMsg);u.lang='en-US';u.rate=state.speechRate||0.85;u.volume=1;window.speechSynthesis.speak(u); },450);
      _zirakSpeakWeakItemsOnce(allMissed,450+Math.max(2000,peFinalMsg.length*60));
    }
  } catch(e) { _peReportTechnicalFailure('tts-hardware-release-failure', e && e.message); }
  try { if (peState.onComplete) peState.onComplete(peState.results.slice()); }
  catch (e) { console.error('[Practice Engine] completion callback failed', e); }
  updateStreak(); awardMilestone('first-practice');
}

// ===== I6H-D19: AUTO DIALOGUE PRACTICE =====
// Reuses the one Universal Practice Engine and its D11B speaker-to-mic state
// machine. No second recognition engine or competing Dialogue controller.


function startAutoPracticeDialogue() {
  // Normal entry is the official route. D19 has no owner-approved Dialogue yet,
  // so this must fail honestly rather than silently opening candidate content.
  state.d19RouteMode = 'official';
  _d19RouteButtonState();
  renderDialogueTopics();
  _d19SetStatus('Official Dialogue is unavailable while owner approval is pending. Choose Teacher/Pilot Preview explicitly.', 'warning');
}
function startAutoDialogue(id) {
  const started = _d19StartSession(id, 'auto');
  if (!started || !started.ok) return;
  const cc = _d19CC(), ctx = _d19StudentContext(), dialogue = started.dialogue, progress = started.progress;
  if (!cc || !ctx.ok || !dialogue || !progress) return;
  const runtimeToken = state.d19RuntimeToken;
  const initialAttemptCounts = Object.create(null);
  Object.keys(progress.turnAttempts || {}).forEach(function(key) {
    const attempt = progress.turnAttempts[key];
    if (attempt && attempt.turnId) initialAttemptCounts[attempt.turnId] = (initialAttemptCounts[attempt.turnId] || 0) + 1;
  });
  const showModelBefore = _d19ModelVisibleBeforeResponse(dialogue);
  const items = dialogue.turns.map(function(turn) {
    return {
      promptText:turn.promptEn, promptPashto:turn.promptPashto,
      targetText:turn.modelAnswerEn, targetPashto:turn.modelAnswerPashto,
      studentTaskText:turn.studentTaskEn, supportPrompt:turn.supportPrompt,
      lang:'en', label:dialogue.titleEn, showModelBeforeResponse:showModelBefore,
      routeLabel:progress.routeMode === 'candidate-preview' ? 'Teacher/Pilot Preview · Owner Approval Pending' : 'Free Practice · Legacy micro-dialogue · Not official curriculum',
      _d19Turn:turn, _d19TurnId:turn.turnId, _d19DialogueId:dialogue.dialogueId
    };
  });
  function stillCurrent() { return runtimeToken === state.d19RuntimeToken && state.d19ActiveRaw && state.d19ActiveRaw.dialogueId === dialogue.dialogueId; }
  openPracticeEngine({
    title:'💬 ' + dialogue.titleEn,
    items:items,
    startIndex:Number(progress.activeTurnIndex || 0),
    flow:'auto',
    sessionId:progress.sessionId,
    dialogueId:dialogue.dialogueId,
    routeMode:progress.routeMode,
    initialAttemptCounts:initialAttemptCounts,
    onItemChange:function(item,index) {
      if (!stillCurrent()) return;
      state.currentStep=index;
      state.d19ActiveProgress=cc.updateDialoguePositionD19({studentId:ctx.student.studentId,dialogueId:dialogue.dialogueId,turnId:item._d19TurnId,activeTurnIndex:index});
    },
    onItemResult:function(result,item) {
      if (!stillCurrent()) return null;
      const options={
        studentId:ctx.student.studentId,dialogueId:dialogue.dialogueId,turnId:item._d19TurnId,
        transcript:result.transcript,attemptId:result.attemptId,scoreStatus:result.scoreStatus,
        automatedScoreIsPartial:result.automatedScoreIsPartial===true,manualComplete:result.manualComplete===true
      };
      if (typeof result.score === 'number') options.score=result.score;
      state.d19ActiveProgress=cc.recordDialogueTurnResultD19(options);
      return state.d19ActiveProgress;
    },
    onTechnicalFailure:function(event) {
      if (!stillCurrent()) return;
      const current=cc.getDialogueProgressD19(ctx.student.studentId,dialogue.dialogueId);
      const item=event.item || items[Math.max(0,Math.min(items.length-1,event.index||0))];
      const errorId=[current&&current.sessionId||progress.sessionId,item&&item._d19TurnId||'turn',event.code,Number(current&&current.technicalFailureCount||0)+1].join('::');
      state.d19ActiveProgress=cc.recordDialogueTechnicalFailureD19({studentId:ctx.student.studentId,dialogueId:dialogue.dialogueId,turnId:item&&item._d19TurnId,errorCode:event.code,errorId:errorId});
    },
    onPause:function(){ if(stillCurrent()) state.d19ActiveProgress=cc.pauseDialogueD19(ctx.student.studentId,dialogue.dialogueId); },
    onResume:function(){ if(stillCurrent()) state.d19ActiveProgress=cc.resumeDialogueD19(ctx.student.studentId,dialogue.dialogueId); },
    onStop:function(){ if(stillCurrent()) state.d19ActiveProgress=cc.stopDialogueD19(ctx.student.studentId,dialogue.dialogueId); },
    onClose:function(info){ if(stillCurrent() && !info.completed) state.d19ActiveProgress=cc.pauseDialogueD19(ctx.student.studentId,dialogue.dialogueId); },
    onComplete:function(results) {
      if (!stillCurrent()) return;
      const current=cc.getDialogueProgressD19(ctx.student.studentId,dialogue.dialogueId);
      if (!current || current.completedTurnIds.length < dialogue.turns.length) return;
      const completionEventId=['d19-dialogue-complete',current.studentId,current.dialogueId,current.dialogueVersion,current.sessionId].join('::');
      state.d19ActiveProgress=cc.completeDialogueD19({studentId:ctx.student.studentId,dialogueId:dialogue.dialogueId,completionEventId:completionEventId});
      const scored=results.filter(function(r){return typeof r.score==='number';});
      const avg=scored.length?Math.round(scored.reduce(function(s,r){return s+r.score;},0)/scored.length):null;
      saveToHistory({type:'dialogue',topic:dialogue.titleEn,score:avg,scoreStatus:avg==null?'unscored-completion':'mixed-scored-completion',mode:state.mode,dialogueId:dialogue.dialogueId,routeMode:progress.routeMode,completionEventId:completionEventId,date:new Date().toISOString()});
      showToast('✅ Dialogue session completed as ' + (progress.routeMode === 'candidate-preview' ? 'candidate-preview evidence.' : 'Free Practice evidence.'));
      updateStreak(); checkAndAwardBadges();
    }
  });
}

// ===== V1.5 (superseded I6H-D16 Task 9): LISTENING ROOM AUTO/MANUAL PRACTICE =====
// I6H-D16: resolves ONE assigned pack for the student's accepted level
// via the real pack registry (ZirakCurriculumContent). Never maps the
// full 400-record bank — a missing pack/level/registry shows an honest
// message rather than silently launching everything.
// I6H-D18: _resolveOfficialListeningPack now uses the D18 resolver as primary path.
// Falls back to D16 legacy packs only if D18 registration is unavailable.
// The official route requires officialCurriculumEligible=true (owner approved).
// The candidate-preview route returns D18 phase-reviewed packs (pending owner approval).
function _resolveOfficialListeningPack(routeMode, options) {
  options = options || {};
  try {
    const cc = _d18CC(), ctx = _d18StudentContext();
    if (!cc || typeof cc.resolveD18ListeningPack !== 'function') return { ok:false, reason:'registry-unavailable' };
    if (!ctx.ok) return { ok:false, reason:ctx.reason };
    return cc.resolveD18ListeningPack({
      studentId:ctx.student.studentId, acceptedLevelId:ctx.level, learnerPathwayId:ctx.pathway,
      packId:options.packId || null, requestedStageId:options.requestedStageId || null,
      routeMode:routeMode || 'official', purpose:options.purpose || 'continue'
    });
  } catch (e) { return { ok:false, reason:'error', error:String(e) }; }
}
function _d18StartResolvedSession(resolved, routeMode, options) {
  options = options || {};
  const cc = _d18CC(), ctx = _d18StudentContext();
  if (!resolved || !resolved.ok || !cc || !ctx.ok) return resolved || { ok:false, reason:'unavailable' };
  const started = cc.startListeningPackSessionD18({
    studentId:ctx.student.studentId, acceptedLevelId:ctx.level, learnerPathwayId:ctx.pathway,
    packId:resolved.pack.packId, requestedStageId:options.requestedStageId || null,
    routeMode:routeMode, purpose:options.purpose || 'continue', forceNew:!!options.forceNew
  });
  if (started.ok) _d18LoadResolvedPack(started);
  return started;
}
function _officialListeningItemsOrHonestMessage(modeLabel, routeMode, options) {
  const mode = routeMode || 'official';
  const resolved = _resolveOfficialListeningPack(mode, options);
  if (!resolved.ok) {
    const message = mode === 'official'
      ? 'Official Listening is unavailable because owner approval is still pending. Use the separate Teacher/Pilot Preview control for reviewed candidate content, or choose bounded Free Practice.'
      : 'No eligible Teacher/Pilot preview pack is available (' + resolved.reason + ').';
    showToast(message);
    const status = document.getElementById('d18-listening-status');
    if (status) status.textContent = message;
    return null;
  }
  const started = _d18StartResolvedSession(resolved, mode, options);
  if (!started || !started.ok) { showToast('Listening pack could not start (' + ((started && started.reason) || 'unknown') + ').'); return null; }
  return started;
}
function startListeningCandidatePreview(flow) {
  const mode = flow === 'manual' ? 'manual' : 'auto';
  if (mode === 'manual') startListeningManualPractice('candidate-preview');
  else startListeningAutoPractice('candidate-preview');
}
function _d18PracticeUnits(resolved) {
  const progress = resolved.progress || _d18ActiveProgress();
  const stageId = progress && progress.activeStageId;
  const tasks = (resolved.tasks || state.d18ActivePackTasks || []).filter(function(task){ return !stageId || task.stageId === stageId; });
  const itemById = {};
  (resolved.items || []).forEach(function(item){ itemById[item.contentId || item.canonicalListeningId] = item; });
  const units = [];
  tasks.forEach(function(task){
    const item = itemById[task.itemId]; if (!item) return;
    const sections = _d18Sections(item);
    const section = sections.find(function(s){ return s.sectionId === task.passageOrSectionIdentity; }) || sections[0];
    let target = section ? section.text : _d18CompleteText(item, false);
    if (task.correctAnswer && task.correctAnswer.expectedText) target = task.correctAnswer.expectedText;
    if (!target || task.scoringMode === 'teacher-rubric') return;
    units.push({ targetText:target, targetPashto:item.pashtoSupport || item.pashto || item.dari || '', lang:'en', _contentId:task.itemId, _sectionId:section && section.sectionId, _taskId:task.taskId, _stageId:task.stageId });
  });
  if (!units.length) {
    (resolved.items || []).forEach(function(item){
      _d18Sections(item).forEach(function(section){
        if (units.length < 20) units.push({ targetText:section.text, targetPashto:item.pashtoSupport || item.pashto || item.dari || '', lang:'en', _contentId:item.contentId || item.canonicalListeningId, _sectionId:section.sectionId, _taskId:null, _stageId:stageId });
      });
    });
  }
  return units.slice(0, 20);
}
function _d18CompletePractice(resolved, units, results, flow) {
  const cc = _d18CC(), ctx = _d18StudentContext();
  if (!cc || !ctx.ok || !resolved || !resolved.pack) return;
  const progress = cc.getListeningPackProgressD18(ctx.student.studentId, resolved.pack.packId);
  const avg = results.length ? Math.round(results.reduce(function(sum,row){ return sum + Number(row.score || 0); }, 0) / results.length) : 0;
  results.forEach(function(result, index){
    const unit = units[index]; if (!unit || !unit._contentId) return;
    const attemptId = [progress.sessionId, unit._stageId || progress.activeStageId, unit._contentId, unit._taskId || 'section', flow, index].join('::');
    if (unit._taskId) cc.completeListeningTaskD18({ studentId:ctx.student.studentId, packId:resolved.pack.packId, packVersion:resolved.pack.packVersion, routeMode:resolved.routeMode, stageId:unit._stageId, itemId:unit._contentId, taskId:unit._taskId, score:result.score, attemptId:attemptId, currentPosition:index });
    else cc.updateListeningItemProgressD18(ctx.student.studentId, resolved.pack.packId, unit._contentId, result.score, false, { packVersion:resolved.pack.packVersion, routeMode:resolved.routeMode, stageId:unit._stageId, attemptId:attemptId, currentPosition:index });
  });
  const refreshed = cc.getListeningPackProgressD18(ctx.student.studentId, resolved.pack.packId);
  const stageEventId = ['d18-stage', ctx.student.studentId, resolved.pack.packId, resolved.pack.packVersion, refreshed.activeStageId, refreshed.sessionId].join('::');
  if (window.ZirakLearningLedger && typeof window.ZirakLearningLedger.recordActivity === 'function') {
    window.ZirakLearningLedger.recordActivity({
      id:stageEventId, completionEventId:stageEventId, activityAttemptId:stageEventId,
      studentId:ctx.student.studentId, source:'listening-d18a', sectionTitle:'Listening ' + flow + ' — ' + (resolved.pack.themeLabel || resolved.pack.packId),
      activityType:resolved.routeMode === 'official' ? 'listening-official-stage' : 'listening-candidate-preview-stage',
      packId:resolved.pack.packId, packVersion:resolved.pack.packVersion, stageId:refreshed.activeStageId,
      itemIds:units.map(function(u){ return u._contentId; }).filter(Boolean), taskIds:units.map(function(u){ return u._taskId; }).filter(Boolean),
      routeMode:resolved.routeMode, governanceStatus:resolved.routeMode === 'official' ? 'owner-approved-official' : 'phase-reviewed-candidate-owner-approval-pending',
      sessionId:refreshed.sessionId, technicalFailureCount:refreshed.technicalFailureCount,
      good:results.filter(function(r){ return Number(r.score || 0) >= 70; }).length, total:results.length, pct:avg,
      weakItems:refreshed.weakItems.slice()
    });
  }
  cc.completeListeningStageD18({ studentId:ctx.student.studentId, packId:resolved.pack.packId, stageId:refreshed.activeStageId, completionEventId:stageEventId + '::completion' });
  saveToHistory({ type:'listen', topic:'Listening ' + flow + ' — ' + resolved.pack.packId + ' [' + resolved.routeMode + ']', score:avg, mode:state.mode, date:new Date().toISOString() });
  checkAndAwardBadges();
  showToast('✅ Listening ' + flow + ' stage complete. Average: ' + avg + '%. Route: ' + resolved.routeMode + '.');
  renderD18ActivePackPanel();
}
function startListeningAutoPractice(routeMode) {
  const resolved = _officialListeningItemsOrHonestMessage('auto', routeMode || 'official');
  if (!resolved) return;
  const units = _d18PracticeUnits(resolved);
  if (!units.length) { showToast('This stage has no playable unit. Use the active pack controller.'); return; }
  openPracticeEngine({
    title:'🔊 Listening Auto — ' + (resolved.pack.themeLabel || resolved.pack.packId) + ' — ' + (resolved.routeMode === 'official' ? 'Official' : 'Teacher/Pilot Preview — Owner Approval Pending'),
    items:units,
    onComplete:function(results){ _d18CompletePractice(resolved, units, results, 'auto'); }
  });
}

// I6H-D18A: startListeningFreePracticeFullBank is replaced with a bounded session design.
// The full 400-record legacy library remains accessible but in controlled sessions of 5/10/20 items.
// A 400-item session is NO LONGER the normal Free Practice action.
function startListeningFreePracticeFullBank(sessionSize) {
  const size = (sessionSize === 20) ? 20 : (sessionSize === 10) ? 10 : 5;
  const startIdx = (state.freePracticeOffset || 0) % LISTEN_SENTENCES.length;
  const rawItems = [];
  for (let i = 0; i < size; i++) {
    rawItems.push(LISTEN_SENTENCES[(startIdx + i) % LISTEN_SENTENCES.length]);
  }
  state.freePracticeOffset = (startIdx + size) % LISTEN_SENTENCES.length;
  const items = rawItems.map(s => ({
    targetText: s.en,
    targetPashto: s.dari || s.pashto || '',
    lang: 'en'
  }));
  openPracticeEngine({
    title: '🔊 Free Practice — Legacy Library (' + size + ' items, items ' + (startIdx+1) + '–' + (startIdx+size) + ' of ' + LISTEN_SENTENCES.length + ') — Not Official Curriculum',
    items,
    onComplete: (results) => {
      const avg = Math.round(results.reduce((s,r)=>s+r.score,0)/results.length);
      saveToHistory({ type:'listen', topic:'Listening Free Practice (Legacy, ' + size + ' items)', score:avg, mode:state.mode, date:new Date().toISOString() });
      checkAndAwardBadges();
      showToast('✅ Free Practice done! Avg: ' + avg + '%  — د تمرین ختم / د رسمي نصاب برخه نه ده');
    }
  });
}

// Expose bounded free practice sizes for UI
function startListeningFreePractice5() { startListeningFreePracticeFullBank(5); }
function startListeningFreePractice10() { startListeningFreePracticeFullBank(10); }
function startListeningFreePractice20() { startListeningFreePracticeFullBank(20); }

function startListeningManualPractice(routeMode) {
  const resolved = _officialListeningItemsOrHonestMessage('manual', routeMode || 'official');
  if (!resolved) return;
  const units = _d18PracticeUnits(resolved);
  if (!units.length) { showToast('This stage has no playable unit. Use the active pack controller.'); return; }
  openPracticeEngine({
    title:'🔊 Listening Manual — ' + (resolved.pack.themeLabel || resolved.pack.packId) + ' — ' + (resolved.routeMode === 'official' ? 'Official' : 'Teacher/Pilot Preview — Owner Approval Pending'),
    items:units, flow:'manual',
    onComplete:function(results){ _d18CompletePractice(resolved, units, results, 'manual'); }
  });
}

// ===== V1.5: WORD OF THE DAY PRACTICE =====// ===== V1.5: WORD OF THE DAY PRACTICE =====
function practiceWotd(mode) {
  const dayIdx = Math.floor(Date.now() / 86400000) % WORD_OF_DAY.length;
  const wotd = WORD_OF_DAY[dayIdx];
  let items;
  if (mode === 'word') {
    items = [{ targetText: wotd.en, targetPashto: wotd.dari, lang: 'en' }];
  } else {
    items = [{ targetText: wotd.ex_en, targetPashto: wotd.ex_dari, lang: 'en' }];
  }
  openPracticeEngine({
    title: mode === 'word' ? `🌟 Word: ${wotd.en}` : `📝 Example: ${wotd.en}`,
    items,
    onComplete: (results) => {
      const score = results[0]?.score || 0;
      if (score < 70) {
        if (!state.bookmarks.includes(wotd.en)) {
          state.bookmarks.push(wotd.en);
          save('word_bookmarks', state.bookmarks);
        }
        showToast(`💪 Saved "${wotd.en}" for review! Score: ${score}%`);
      } else {
        showToast(`✅ Great! ${wotd.en} — ${score}%`);
      }
    }
  });
}

// ===== V1.5: FLASHCARD SPEAK =====
function fcHear() {
  const words = state.currentFlashSet;
  if (!words || state.flashIndex >= words.length) return;
  const w = words[state.flashIndex];
  speak(w.en, 'en');
}

function fcSpeak() {
  const words = state.currentFlashSet;
  if (!words || state.flashIndex >= words.length) return;
  const w = words[state.flashIndex];
  openPracticeEngine({
    title: `🃏 Flashcard: ${w.en}`,
    items: [{ targetText: w.en, targetPashto: w.dari, lang: 'en' }],
    onComplete: (results) => {
      const score = results[0]?.score || 0;
      showToast(score >= 70 ? `✅ ${w.en} — ${score}%` : `💪 Keep practicing! ${score}%`);
    }
  });
}

// ===== V1.5: THEME CYCLE =====
function cycleTheme() {
  const themes = ['system', 'light', 'dark'];
  const curr = state.theme || 'system';
  const nextIdx = (themes.indexOf(curr) + 1) % themes.length;
  const next = themes[nextIdx];
  setTheme(next);
}

function updateThemeToggleBtn() {
  const icons  = { system: '🖥 Auto', light: '☀️ Light', dark: '🌙 Dark' };
  const btn = document.getElementById('theme-toggle-btn');
  const theme = state.theme || 'system';
  if (btn) btn.textContent = icons[theme] || '🖥 Auto';
}

// ===== V1.5: STORY PRACTICE (overrides setStoryMode to remove 'speak' confusion) =====
// The old setStoryMode('speak') is now handled by startStoryPractice (Universal Engine)

// ===== STORY PRACTICE (Phase 4) =====
function startStoryPractice() {
  const story = state.currentStory;
  if (!story) return;
  const items = story.paragraphs.map(p => ({
    targetText: p.en,
    targetPashto: getPashtoText(p, 'paragraph'),   // v1.17D1: central helper
    lang: 'en'
  }));
  openPracticeEngine({
    title: '📖 ' + story.titleEn,
    items,
    flow: load('pe_flow') || 'auto',
    onComplete: (results) => {
      const avg = Math.round(results.reduce((s,r)=>s+r.score,0)/results.length);
      showToast(`✅ Story practice done! Avg: ${avg}% / د کیسې تمرین بشپړ شو!`);
    }
  });
}

// ===== TOPIC STUDIO PRACTICE ENGINE (Phase 5) =====
function startTopicWizard(modeId) {
  state.currentWizardMode = modeId;
  const topic = state.currentTopic;
  const area = document.getElementById('topic-practice-area');

  if (modeId === 'repeat') {
    const items = topic.paragraphs.map(p => ({ targetText: p.en, targetPashto: getPashtoText(p, 'paragraph'), lang: 'en' }));
    closePracticeEngineTopicArea();
    openPracticeEngine({
      title: '🔁 Repeat Wizard — ' + topic.titleEn,
      items,
      onComplete: (results) => {
        const avg = Math.round(results.reduce((s,r)=>s+r.score,0)/results.length);
        showToast(`✅ Repeat Wizard done! Avg: ${avg}%`);
        completeTopic();
      }
    });
    return;
  }

  if (modeId === 'full-speech') {
    const fullText = topic.paragraphs.map(p=>p.en).join(' ');
    const items = [{ targetText: fullText, targetPashto: topic.paragraphs.map(p=>getPashtoText(p, 'paragraph')).join(' '), lang: 'en' }];
    closePracticeEngineTopicArea();
    openPracticeEngine({
      title: '🎤 Full Speech — ' + topic.titleEn,
      items,
      onComplete: (results) => {
        showToast(`✅ Full Speech done! Score: ${results[0]?.score||0}%`);
        completeTopic();
      }
    });
    return;
  }

  if (modeId === 'translation') {
    // v1.17D1 HOTFIX (Task 5 — Option C): Pashto speech recognition (ps-AF) is unreliable
    // across browsers. Converted to English listening + repeat practice with Pashto shown
    // as a visual reference only. No ps-AF speech scoring is triggered.
    const items = topic.paragraphs.map(p => ({
      targetText: p.en,       // score English speech against English text
      targetPashto: getPashtoText(p, 'paragraph'),     // PHASE: Teaching Display & Voice Professionalization Fix — was p.en (duplicated English); now the real Pashto translation
      lang: 'en'              // English speech recognition only — safe & reliable
    }));
    // Render translation reference UI
    area.innerHTML = `
      <div class="card">
        <div style="font-size:15px;font-weight:700;margin-bottom:8px;">Translation Reference — ${topic.titleEn}</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">Hear and repeat each English sentence. Pashto translation is shown below for reading reference. Pashto speech scoring is not active in this version.</div>
        ${topic.paragraphs.map((p,i) => `
          <div class="card-inner" style="margin-bottom:10px;">
            <div style="font-size:13px;font-weight:700;color:var(--text-muted);">Paragraph ${i+1}</div>
            <div style="font-size:16px;margin:4px 0;">${p.en}</div>
            <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" onclick="speak('${p.en.replace(/'/g,"\\'")}','en')">🔊 Hear English</button>
              <button class="btn btn-outline btn-sm" onclick="peTranslationItem(${i})">🎙️ Speak English</button>
            </div>
            <div id="pe-trans-result-${i}" style="margin-top:8px;font-size:13px;"></div>
            <details style="margin-top:6px;"><summary style="font-size:12px;color:var(--text-muted);cursor:pointer;">Show Pashto reference</summary>${renderPashtoLine(getPashtoText(p, 'paragraph'), 'dari pashto-support-line', { mode:'modal' })}</details>
          </div>
        `).join('')}
        <button class="btn btn-primary btn-full mt-8" onclick="completeTopic()">✅ Mark Complete</button>
      </div>
    `;
    area.style.display = 'block';
    return;
  }

  // Other modes — show "Coming in next version" or implement passively
  const modeLabel = WIZARD_MODES.find(m=>m.id===modeId)?.en || modeId;
  if (['listen-cover','dari-reading'].includes(modeId)) {
    // These modes are passive, implement existing behavior
    // PHASE: Teaching Display & Voice Professionalization Fix
    // Use renderPashtoLine so missing Pashto shows a visible "pending"
    // marker instead of silently hiding via the :empty CSS rule.
    let html = `<div class="card"><div style="font-size:15px;font-weight:700;margin-bottom:10px;">Mode: ${modeLabel}</div>`;
    topic.paragraphs.forEach((p, i) => {
      const psText = getPashtoText(p, 'paragraph');
      const psLine = renderPashtoLine(psText, 'dari-text', { mode:'topic' });
      if (modeId === 'listen-cover') {
        html += `<div style="margin-bottom:12px;">
          <div class="bilingual-block">
            <div class="en-text">${p.en}</div>
            ${psLine}
          </div>
          <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="speak('${p.en.replace(/'/g,"\\'")}','en')">🔊 Listen</button>
          </div>
        </div>`;
      } else {
        // PHASE: Teaching Display & Voice Professionalization Fix
        // Removed the Pashto-speaking button — English is the only
        // spoken/scored language; Pashto is a visual support line only
        // (locked teaching rule: no Pashto/Dari TTS).
        html += `<div style="margin-bottom:12px;" class="card-inner">
          <div class="bilingual-block">
            <div class="en-text">${p.en}</div>
            ${psLine}
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" onclick="speak('${p.en.replace(/'/g,"\\'")}','en')">🔊 En</button>
          </div>
        </div>`;
      }
    });
    html += `<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--divider);"><button class="btn btn-primary btn-full" onclick="completeTopic()">✅ Mark Complete</button></div></div>`;
    area.innerHTML = html;
    area.style.display = 'block';
  } else {
    area.innerHTML = `<div class="card" style="text-align:center;padding:24px 16px;">
      <div style="font-size:36px;margin-bottom:12px;">🚧</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:6px;">${modeLabel}</div>
      <div style="font-size:14px;color:var(--text-muted);margin-bottom:16px;">Coming in the next version! / په راتلونکې نسخه کې راځي!</div>
      <button class="btn btn-outline btn-sm" onclick="closeTopicWizard()">← Back to Topics</button>
    </div>`;
    area.style.display = 'block';
  }
}

function closePracticeEngineTopicArea() {
  const area = document.getElementById('topic-practice-area');
  if (area) { area.innerHTML = ''; area.style.display = 'none'; }
}

// Translation reference — individual item English speech practice
// v1.17D1: scores against English (p.en), not Pashto. ps-AF speech recognition is unreliable.
function peTranslationItem(idx) {
  const topic = state.currentTopic;
  if (!topic) return;
  const p = topic.paragraphs[idx];
  openPracticeEngine({
    title: `🔤 Speak Paragraph ${idx+1}`,
    items: [{ targetText: p.en, targetPashto: getPashtoText(p, 'paragraph'), lang: 'en' }],
    onComplete: (results) => {
      const resultEl = document.getElementById('pe-trans-result-'+idx);
      if (resultEl) {
        const r = results[0];
        resultEl.innerHTML = `<span style="color:${r.score>=70?'var(--emerald)':'var(--red)'};font-weight:700;">${r.score}%</span> — "${r.transcript}"`;
      }
    }
  });
}

// ===== WORD LAB PRACTICE (Phase 6) =====
function openWordSetWithPractice(key) {
  const ws = WORD_SETS[key];
  const modal = document.createElement('div');
  modal.id = 'wordset-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:300;display:flex;align-items:flex-end;';
  modal.innerHTML = `<div style="background:var(--bg-card);border-radius:20px 20px 0 0;width:100%;max-width:640px;margin:0 auto;padding:20px;max-height:85vh;overflow-y:auto;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <div><div style="font-size:18px;font-weight:800;">${ws.icon} ${ws.en}</div><div class="dari" style="font-size:16px;">${ws.dari}</div></div>
      <button onclick="this.closest('#wordset-modal').remove()" style="background:var(--border);border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:16px;">✕</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
      <button class="btn btn-gold btn-sm" onclick="startWordWizard('${key}')">🧙 Start Word Wizard</button>
      <button class="btn btn-primary btn-sm" onclick="startWordSetPractice('${key}','words')">🎙️ Practice Words</button>
      <button class="btn btn-outline btn-sm" onclick="startWordSetPractice('${key}','examples')">🎙️ Practice Examples</button>
    </div>
    ${ws.words.map(w=>`<div style="padding:10px 0;border-bottom:1px solid var(--divider);">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-size:17px;font-weight:700;">${w.en}</div>
        <div class="dari" style="font-size:17px;">${w.dari}</div>
      </div>
      <div style="font-size:13px;color:var(--text-muted);margin-top:4px;">${w.ex_en}</div>
      <div class="dari" style="font-size:13px;color:var(--text-muted);">${w.ex_dari}</div>
      <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" onclick="speak('${w.en.replace(/'/g,"\\'")}','en')">🔊 Word</button>
        <button class="btn btn-ghost btn-sm" onclick="speak('${(w.ex_en||'').replace(/'/g,"\\'")}','en')">🔊 Example</button>
      </div>
    </div>`).join('')}
  </div>`;
  modal.onclick = e => { if(e.target === modal) modal.remove(); };
  document.body.appendChild(modal);
}

function startWordSetPractice(key, mode) {
  const ws = WORD_SETS[key];
  let items;
  if (mode === 'words') {
    items = ws.words.map(w => ({ targetText: w.en, targetPashto: w.dari, lang: 'en' }));
  } else {
    items = ws.words.filter(w=>w.ex_en).map(w => ({ targetText: w.ex_en, targetPashto: w.ex_dari, lang: 'en' }));
  }
  // Close the modal first
  document.getElementById('wordset-modal')?.remove();
  openPracticeEngine({
    title: `${ws.icon} ${ws.en} — ${mode==='words'?'Words':'Examples'}`,
    items,
    onComplete: (results) => {
      const weak = results.filter(r=>r.score<70);
      if (weak.length) {
        showToast(`💪 ${weak.length} word(s) need more practice!`);
      } else {
        showToast(`✅ Word set complete! Great job!`);
      }
      // Save weak words to bookmarks
      weak.forEach(r => {
        const word = ws.words.find(w=>w.en===r.targetText||w.ex_en===r.targetText);
        if (word && !state.bookmarks.includes(word.en)) {
          state.bookmarks.push(word.en);
        }
      });
      save('word_bookmarks', state.bookmarks);
      renderSavedWords();
    }
  });
}

// ===== WORD WIZARD (v1.10B) — True Auto Flow =====
// Each word: TTS → listen → score × 2 → optional example → auto-next
// Student never needs to click Continue. Weak words get one extra attempt.

// ===== WORD WIZARD ENGINE v1.10F =====
// Flow per word: Word R1 → Word R2 → Sentence R1 → Sentence R2 → next word
// Phases: 'word' | 'sentence'
// wwState.round: 1 or 2 within current phase
// wwState.sentenceScores[]: sentence round scores (separate from word roundScores)

let wwState = {
  setKey: null,
  words: [],
  wordIndex: 0,
  round: 1,
  phase: 'word',
  roundScores: [],
  sentenceScores: [],
  results: [],
  recognition: null,
  _activeRec: null,
  isListening: false,
  ttsTimer: null,
  graceTimer: null,
  autoTimer: null,
  _silenceTimer: null,
  transcript: '',
  paused: false,
  mode: 'auto',
  _wordRetryCount: 0,
  _graceUsed: false,
  _pendingScore: null,
  _scored: false,
  mediaRecorder: null,
  recordingChunks: [],
  lastRecordingURL: null,
  // v1.15G state machine
  listenToken: 0,
  audioGuardActive: false,
  allowScoring: false
};

function renderWordWizardSetPicker() {
  const pills = document.getElementById('ww-set-pills');
  if (!pills) return;
  if (typeof WORD_SETS === 'undefined' || !WORD_SETS) {
    pills.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">Word sets loading...</div>';
    return;
  }
  pills.innerHTML = Object.entries(WORD_SETS).map(([k,ws]) =>
    `<button class="pill" onclick="startWordWizard('${k}')">${ws.icon} ${ws.en}</button>`
  ).join('');
}

// v1.10E — overlay set picker
function renderWordWizardOverlayPicker() {
  const pills = document.getElementById('ww-overlay-set-pills');
  if (!pills) return;
  if (typeof WORD_SETS === 'undefined' || !WORD_SETS) {
    pills.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">Word sets loading...</div>';
    return;
  }
  pills.innerHTML = Object.entries(WORD_SETS).map(([k,ws]) =>
    `<button class="pill" onclick="startWordWizard('${k}')" style="font-size:15px;padding:10px 18px;">${ws.icon} ${ws.en}</button>`
  ).join('');
}

// v1.10E — open the focused Word Wizard overlay
function openWordWizardScreen() {
  renderWordWizardOverlayPicker();
  const sel = document.getElementById('ww-overlay-selector');
  const act = document.getElementById('ww-overlay-active');
  if (sel) sel.style.display = 'block';
  if (act) { act.style.display = 'none'; act.innerHTML = ''; }
  const overlay = document.getElementById('ww-focused-overlay');
  if (overlay) { overlay.style.display = 'block'; overlay.scrollTop = 0; }
}

// v1.10E — close the focused Word Wizard overlay cleanly
function closeWordWizardScreen() {
  window.speechSynthesis.cancel();
  wwClearTimers();
  wwStopActiveRec();
  wwState.isListening    = false;
  wwState.paused         = false;
  wwState._scored        = false;
  wwState.audioGuardActive = false; // v1.15G
  wwState.allowScoring     = false; // v1.15G
  wwState.listenToken++;            // v1.15G: invalidate any stale callbacks
  const act = document.getElementById('ww-overlay-active');
  if (act) { act.style.display = 'none'; act.innerHTML = ''; }
  const overlay = document.getElementById('ww-focused-overlay');
  if (overlay) overlay.style.display = 'none';
}

function wwStopActiveRec() {
  if (wwState._activeRec) { try { wwState._activeRec.stop(); } catch(e) {} wwState._activeRec = null; }
  if (wwState.recognition) { try { wwState.recognition.stop(); } catch(e) {} wwState.recognition = null; }
}

function startWordWizard(key) {
  document.getElementById('wordset-modal')?.remove();
  const ws = WORD_SETS[key];
  if (!ws || !ws.words || !ws.words.length) { showToast('No words in this set!'); return; }
  wwState.setKey        = key;
  wwState.words         = ws.words;
  wwState.wordIndex     = 0;
  wwState.round         = 1;
  wwState.phase         = 'word';
  wwState.roundScores   = [];
  wwState.sentenceScores= [];
  wwState.results       = [];
  wwState.paused        = false;
  wwState._scored       = false;
  wwState.mode          = load('ww_mode') || 'auto';
  const overlay = document.getElementById('ww-focused-overlay');
  if (overlay) { overlay.style.display = 'block'; overlay.scrollTop = 0; }
  const sel = document.getElementById('ww-overlay-selector');
  if (sel) sel.style.display = 'none';
  const act = document.getElementById('ww-overlay-active');
  if (act) { act.style.display = 'block'; act.innerHTML = ''; }
  wwRenderStep();
}

function wwGetActiveArea() {
  return document.getElementById('ww-overlay-active') || document.getElementById('ww-wizard-area');
}

// --- Progress label helper ---
function wwProgressLabel() {
  const idx   = wwState.wordIndex;
  const total = wwState.words.length;
  const r     = wwState.round;
  if (wwState.phase === 'word') {
    return `Word ${idx+1} of ${total} — Word Round ${r} of 2`;
  } else {
    return `Word ${idx+1} of ${total} — Sentence Round ${r} of 2`;
  }
}

// --- Overall progress bar percentage ---
// 4 steps per word: word-r1, word-r2, sentence-r1, sentence-r2
function wwProgressPct() {
  const total     = wwState.words.length;
  const stepsTotal= total * 4;
  const idx       = wwState.wordIndex;
  const phaseStep = wwState.phase === 'word' ? (wwState.round - 1) : (2 + wwState.round - 1);
  const stepsDone = idx * 4 + phaseStep;
  return Math.round((stepsDone / stepsTotal) * 100);
}

function wwRenderStep() {
  const area = wwGetActiveArea();
  if (!area) return;
  wwClearTimers();
  wwStopActiveRec();
  window.speechSynthesis.cancel();
  wwState._scored = false;

  const total = wwState.words.length;
  const idx   = wwState.wordIndex;
  if (idx >= total) { wwShowFinalResult(); return; }

  const w       = wwState.words[idx];
  const pct     = wwProgressPct();
  const label   = wwProgressLabel();
  const isAuto  = wwState.mode === 'auto';
  const isSent  = wwState.phase === 'sentence';
  const ex      = w.ex_en || '';

  // If this is a sentence step but the word has no example, skip straight to next word
  if (isSent && !ex) {
    wwNextWord();
    return;
  }

  const badgeColor  = isSent ? 'badge-gold' : 'badge-lapis';
  const hearLabel   = isSent ? '🔊 Hear Sentence' : '🔊 Hear Word';
  const replayFn    = isSent ? 'wwReplayExample()' : 'wwReplayWord()';
  const promptText  = isSent
    ? `<div style="font-size:13px;color:var(--text-muted);text-align:center;margin-bottom:4px;">Practice the example sentence:</div>
       <div style="font-size:17px;font-weight:700;text-align:center;padding:6px 0;">${escHtml(ex)}</div>
       ${renderPashtoLine(getPashtoText(w, 'example'), 'dari', { mode:'sentence' })}`
    : `<div style="text-align:center;padding:10px 0 4px;">
         <div style="font-size:34px;font-weight:900;color: var(--lapis-text);">${escHtml(w.en)}</div>
         ${renderPashtoLine(getPashtoText(w, 'default'), 'dari', { mode:'wizard' })}
         ${ex ? `<div style="font-size:13px;color:var(--text-muted);margin-top:6px;font-style:italic;">${escHtml(ex)}</div>` : ''}
         ${buildMasteryDots(w.id)}
       </div>`;

  area.innerHTML = `
    <div class="card" style="margin:0 16px 12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div class="badge ${badgeColor}" style="font-size:11px;">${label}</div>
        <button class="btn btn-ghost btn-sm" id="ww-mode-btn" onclick="wwToggleMode()" style="font-size:11px;padding:2px 8px;">${isAuto ? '🤖 Auto' : '👆 Manual'}</button>
      </div>
      <div style="background:var(--border);height:4px;border-radius:4px;margin-bottom:10px;">
        <div style="background:${isSent?'var(--gold,#e6b800)':'var(--lapis)'};height:4px;border-radius:4px;width:${pct}%;transition:width 0.4s;"></div>
      </div>
      ${promptText}
      <div style="text-align:center;margin:8px 0 4px;">
        <button onclick="${replayFn}" class="btn btn-ghost btn-sm" style="font-size:12px;">${hearLabel}</button>
      </div>
      <div style="text-align:center;margin:6px 0;">
        <button class="pe-mic-btn" id="ww-mic-btn" onclick="wwToggleSpeech()" title="Tap to speak" style="font-size:30px;width:60px;height:60px;">🎙️</button>
        <div style="font-size:13px;color:var(--text-muted);margin-top:5px;" id="ww-status">Getting ready...</div>
      </div>
      <div style="background:var(--bg-card2);border-radius:8px;padding:10px;min-height:32px;font-size:14px;color:var(--text-muted);text-align:center;margin-bottom:6px;" id="ww-transcript">Your speech will appear here...</div>
      <div id="ww-result-area"></div>
      <div style="text-align:center;">
        <button class="btn btn-ghost btn-sm" id="ww-done-btn" onclick="wwStopSpeechNow()" style="display:none;margin-top:4px;font-size:12px;">⏹ Done Speaking</button>
      </div>
    </div>
  `;
  const ov = document.getElementById('ww-focused-overlay');
  if (ov) ov.scrollTop = 0;
  if (!wwState.paused) {
    wwAutoFlow();
  } else {
    const st = document.getElementById('ww-status');
    if (st) st.textContent = isSent ? 'Tap 🎙️ to say the sentence.' : 'Tap 🎙️ to speak the word.';
  }
}

// ===== v1.15G: WW STATE MACHINE — TTS + MIC =====
// Self-contained. Does NOT depend on global anti-cheat patches.
// Uses listenToken to invalidate stale recognition callbacks.
// Uses audioGuardActive to block scoring during TTS.
// Uses allowScoring to gate scoring during student speech only.

// Core WW TTS function: speak model audio, then call onAfterSafe
// Uses window.__zirakNativeSpeak (native speechSynthesis, pre-patch)
// so the global speak() patch does NOT interfere with WW auto mode.
function _wwPlayModel(text, onAfterSafe) {
  // 1. Invalidate any active listening session
  wwState.listenToken++;
  const myToken = wwState.listenToken;

  // 2. Guard state: block scoring during TTS
  wwState.audioGuardActive = true;
  wwState.allowScoring     = false;
  wwState._scored          = false;
  wwState.transcript       = '';
  wwState._pendingScore    = null;

  // 3. Stop active recognition (abort, not stop, to fire onerror='aborted')
  if (wwState._activeRec)  { try { wwState._activeRec.abort();  } catch(e){} wwState._activeRec  = null; }
  if (wwState.recognition) { try { wwState.recognition.abort(); } catch(e){} wwState.recognition = null; }
  wwState.isListening = false;

  // 4. Reset mic UI
  const micBtn  = document.getElementById('ww-mic-btn');
  const doneBtn = document.getElementById('ww-done-btn');
  if (micBtn)  { micBtn.classList.remove('listening'); micBtn.textContent = '🎙️'; }
  if (doneBtn) doneBtn.style.display = 'none';

  // 5. Cancel any pending TTS
  window.speechSynthesis.cancel();
  clearTimeout(wwState.ttsTimer);

  // 6. Build utterance
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  utter.rate = (window.state && state.speechRate) ? state.speechRate : 0.85;

  let settled = false;
  function afterSpeak() {
    if (settled) return; settled = true;
    clearTimeout(wwState.ttsTimer);
    // v1.15H: 1400ms matches Android audio hardware release time (Arabic ref v1.0D5)
    const safetyMs = 1400;
    wwState.ttsTimer = setTimeout(function() {
      if (wwState.listenToken !== myToken) return; // another session started
      wwState.audioGuardActive = false;
      if (typeof onAfterSafe === 'function') onAfterSafe();
    }, safetyMs);
  }

  // v1.15H: Generous fallback for Android where onend sometimes never fires.
  // Use a polling check: if speechSynthesis.speaking becomes false, fire afterSpeak.
  const fallbackMs = Math.max(4000, text.length * 85 + 1500);
  wwState.ttsTimer = setTimeout(afterSpeak, fallbackMs);

  // Also poll every 500ms — catches Android TTS that speaks but fires no onend
  let pollCount = 0;
  const pollTimer = setInterval(function() {
    pollCount++;
    if (pollCount > 20) { clearInterval(pollTimer); return; } // max 10s
    if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
      clearInterval(pollTimer);
      afterSpeak();
    }
  }, 500);

  utter.onend = function() {
    clearTimeout(wwState.ttsTimer);
    clearInterval(pollTimer);
    afterSpeak();
  };
  utter.onerror = function() {
    clearTimeout(wwState.ttsTimer);
    clearInterval(pollTimer);
    afterSpeak();
  };

  // 8. Use native speechSynthesis.speak (exposed by anti-cheat IIFE)
  // so the global patch does not wrap our onend and delay auto-restart.
  // Fallback to window.speechSynthesis.speak if native not exposed yet.
  var nativeSpeak = window.__zirakNativeSpeak;
  if (typeof nativeSpeak === 'function') {
    nativeSpeak(utter);
  } else {
    // IIFE hasn't run yet or didn't expose it — use window.speechSynthesis
    // In this case we accept the global patch overhead but it still works
    // because onAfterSafe fires after our own safety delay.
    window.speechSynthesis.speak(utter);
  }
}

// Auto flow: speak model then automatically start mic (in auto mode)
function wwAutoFlow() {
  const st = document.getElementById('ww-status');
  if (st) st.textContent = '🔊 Listen...';
  clearTimeout(wwState.ttsTimer);

  const w      = wwState.words[wwState.wordIndex];
  const text   = (wwState.phase === 'sentence' && w.ex_en) ? w.ex_en : w.en;
  const isManual = (wwState.mode === 'manual');

  _wwPlayModel(text, function() {
    if (wwState.paused) return;
    if (isManual) {
      const stEl = document.getElementById('ww-status');
      if (stEl) stEl.textContent = (wwState.phase === 'sentence')
        ? 'Tap 🎙️ to say the sentence.'
        : 'Tap 🎙️ to speak the word.';
      return;
    }
    // AUTO mode: start mic now — call wwStartSpeech directly (no bypass flag needed)
    if (!wwState.paused && !wwState._scored) {
      wwStartSpeech();
    }
  });
}

// Hear Word button handler
function wwReplayWord() {
  const w = wwState.words[wwState.wordIndex];
  if (!w) return;
  const wasAuto = (wwState.mode === 'auto');
  const wasListening = wwState.isListening;
  const stEl = document.getElementById('ww-status');

  if (wasListening) {
    if (stEl) stEl.textContent =
      '🔇 Mic paused while app voice plays. App voice will not be scored.\n' +
      'مایکروفون د اپ د غږ پر وخت درول کېږي. د اپ غږ نه شمېرل کېږي.';
  }

  _wwPlayModel(w.en, function() {
    if (wwState.paused || wwState._scored) return;
    if (stEl && stEl.textContent.indexOf('🔇') === 0) stEl.textContent = '';
    if (wasListening && wasAuto) {
      wwStartSpeech(); // auto mode: restart mic
    } else if (wasListening && !wasAuto) {
      if (stEl) stEl.textContent = 'Tap 🎙️ to speak the word.';
    }
  });
}

// Hear Sentence button handler
function wwReplayExample() {
  const w = wwState.words[wwState.wordIndex];
  if (!w || !w.ex_en) return;
  const wasAuto = (wwState.mode === 'auto');
  const wasListening = wwState.isListening;
  const stEl = document.getElementById('ww-status');

  if (wasListening) {
    if (stEl) stEl.textContent =
      '🔇 Mic paused while app voice plays. App voice will not be scored.\n' +
      'مایکروفون د اپ د غږ پر وخت درول کېږي. د اپ غږ نه شمېرل کېږي.';
  }

  _wwPlayModel(w.ex_en, function() {
    if (wwState.paused || wwState._scored) return;
    if (stEl && stEl.textContent.indexOf('🔇') === 0) stEl.textContent = '';
    if (wasListening && wasAuto) {
      wwStartSpeech(); // auto mode: restart mic
    } else if (wasListening && !wasAuto) {
      if (stEl) stEl.textContent = 'Tap 🎙️ to say the sentence.';
    }
  });
}
function wwToggleSpeech() {
  if (wwState.isListening) wwStopSpeechNow();
  else wwStartSpeech();
}

function wwToggleMode() {
  wwState.mode = wwState.mode === 'auto' ? 'manual' : 'auto';
  save('ww_mode', wwState.mode);
  const btn = document.getElementById('ww-mode-btn');
  if (btn) btn.textContent = wwState.mode === 'auto' ? '🤖 Auto' : '👆 Manual';
}

// ===== WORD WIZARD PATIENT MIC (v1.10F) =====
// Adapted from Practice Engine patient listening (peStartListening)
// Grace period: 3.5s of real silence before scoring; up to 3 mic restarts.
// No-speech immediately → 3s wait before "Nothing heard".

function wwStartSpeech() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition needs Chrome.'); return;
  }
  if (wwState._scored) return;
  // v1.15G: block manual mic tap if TTS guard is still active
  if (wwState.audioGuardActive) {
    const st = document.getElementById('ww-status');
    if (st) st.textContent = '🔇 Wait — app is still speaking. Try again in a moment.';
    setTimeout(function(){ var s=document.getElementById('ww-status'); if(s&&s.textContent.indexOf('🔇')===0)s.textContent=''; }, 2500);
    return;
  }
  // v1.15G: claim a new listen token — invalidates all stale callbacks
  wwState.listenToken++;
  const myToken = wwState.listenToken;
  wwState.allowScoring   = true;
  wwState.audioGuardActive = false;
  wwClearTimers();
  wwStopActiveRec();
  wwState.transcript    = '';
  wwState._pendingScore = null;
  wwState._scored       = false;
  wwState._graceUsed    = false;

  // v1.14B: MediaRecorder disabled — getUserMedia before SpeechRecognition
  // conflicts with mic access on Android Chrome. "Hear yourself" feature removed.
  // SpeechRecognition (startRec) now has exclusive mic access.
  wwState.recordingChunks = [];
  wwState.lastRecordingURL = null;
  wwState.mediaRecorder = null;

  const SR      = window.SpeechRecognition || window.webkitSpeechRecognition;
  const w       = wwState.words[wwState.wordIndex];
  const text    = (wwState.phase === 'sentence' && w.ex_en) ? w.ex_en : w.en;
  const isLong  = text.trim().split(/\s+/).length >= 5 || /[.!?]/.test(text.trim().slice(-1));
  const SILENCE = 3500;     // ms of real silence → stop rec
  const MAX_RESTART = 3;    // max restarts for long items
  let graceCount = 0;

  // Scored-once gate
  let localScored = false;
  function doScore() {
    if (localScored || wwState._scored) return;
    // v1.15G: do not score if token changed or TTS guard active
    if (wwState.listenToken !== myToken) return;
    if (wwState.audioGuardActive || !wwState.allowScoring) return;
    localScored = true;
    wwState._scored = true;
    wwState.allowScoring = false;
    clearTimeout(wwState._silenceTimer);
    clearTimeout(wwState.graceTimer);
    wwState._pendingScore = null;
    wwState.isListening = false;
    // v1.11A: Stop MediaRecorder so onstop fires and blob is created
    if (wwState.mediaRecorder && wwState.mediaRecorder.state !== 'inactive') {
      try { wwState.mediaRecorder.stop(); } catch(e) {}
    }
    wwState.mediaRecorder = null;
    const micBtn  = document.getElementById('ww-mic-btn');
    const doneBtn = document.getElementById('ww-done-btn');
    if (micBtn)  { micBtn.classList.remove('listening'); micBtn.textContent = '🎙️'; }
    if (doneBtn) doneBtn.style.display = 'none';
    if (wwState.transcript) {
      wwScoreAnswer();
    } else {
      // 3s grace before "nothing heard" in case of very fast no-speech
      wwState.graceTimer = setTimeout(() => {
        if (wwState._scored && !wwState.transcript) {
          const st = document.getElementById('ww-status');
          if (st) st.textContent = 'Nothing heard — tap 🎙️ to try again.';
          wwState._scored = false; // allow retry tap
        }
      }, 3000);
      const st = document.getElementById('ww-status');
      if (st) st.textContent = '⏳ Listening... speak when ready.';
    }
  }
  wwState._pendingScore = doScore;

  // Silence timer — resets on speech activity
  function resetSilenceTimer() {
    clearTimeout(wwState._silenceTimer);
    if (wwState._scored || localScored) return;
    wwState._silenceTimer = setTimeout(() => {
      wwStopActiveRec();
    }, SILENCE);
  }

  // Transcript merge helper
  function mergeT(prev, next) {
    const pw = prev.trim().split(/\s+/), nw = next.trim().split(/\s+/);
    let ov = 0;
    for (let n = Math.min(pw.length, nw.length, 6); n > 0; n--) {
      if (pw.slice(-n).join(' ').toLowerCase() === nw.slice(0,n).join(' ').toLowerCase()) { ov=n; break; }
    }
    return ov > 0 ? (prev.trim()+' '+nw.slice(ov).join(' ')).trim() : (prev.trim()+' '+next.trim()).trim();
  }

  function startRec() {
    if (localScored || wwState._scored) return;
    if (graceCount >= MAX_RESTART) { doScore(); return; }

    const rec = new SR();
    rec.lang           = 'en-US';
    rec.continuous     = false;
    rec.interimResults = true;
    wwState._activeRec  = rec;
    wwState.recognition = rec;

    // v1.15H: set red mic UI IMMEDIATELY before rec.start()
    // so it shows even if start() takes time or needs a retry on Android
    wwState.isListening = true;
    const micBtnEarly  = document.getElementById('ww-mic-btn');
    const doneBtnEarly = document.getElementById('ww-done-btn');
    if (micBtnEarly)  { micBtnEarly.classList.add('listening'); micBtnEarly.textContent = '🔴'; }
    if (doneBtnEarly) doneBtnEarly.style.display = '';
    const isSent = wwState.phase === 'sentence';
    const stEarly = document.getElementById('ww-status');
    if (stEarly) stEarly.textContent = isSent ? '🎙️ Say the sentence!' : '🎙️ Speak the word!';

    rec.onresult = (e) => {
      // v1.15G: reject result if this session is stale or TTS is playing
      if (wwState.listenToken !== myToken) return;
      if (wwState.audioGuardActive || !wwState.allowScoring) return;
      const interim = Array.from(e.results).map(r => r[0].transcript).join('');
      const box = document.getElementById('ww-transcript');

      if (isLong) {
        const combined = wwState.transcript ? mergeT(wwState.transcript, interim) : interim;
        if (box) box.textContent = combined + ' ▋';
        resetSilenceTimer();
      } else {
        if (box) box.textContent = interim || '...';
      }

      if (e.results[e.results.length-1].isFinal) {
        const finalText = interim;
        wwState.transcript = wwState.transcript ? mergeT(wwState.transcript, finalText) : finalText;
        if (box) box.textContent = isLong ? wwState.transcript + ' ▋' : wwState.transcript;
        if (isLong) resetSilenceTimer();
      }
    };

    rec.onend = () => {
      wwState._activeRec = null;
      // v1.15G: stale token means _wwPlayModel aborted this session
      if (wwState.listenToken !== myToken) return;
      if (!wwState.allowScoring || wwState.audioGuardActive) return;
      if (localScored || wwState._scored) return;

      if (isLong && wwState.transcript && graceCount < MAX_RESTART) {
        graceCount++;
        const st = document.getElementById('ww-status');
        if (st) st.textContent = '⏳ Keep speaking... still listening';
        const box = document.getElementById('ww-transcript');
        if (box) box.textContent = wwState.transcript + ' ▋';
        const micBtn  = document.getElementById('ww-mic-btn');
        const doneBtn = document.getElementById('ww-done-btn');
        if (micBtn)  { micBtn.classList.add('listening'); micBtn.textContent = '🔴'; }
        if (doneBtn) doneBtn.style.display = '';
        wwState.isListening = true;
        if (!wwState._silenceTimer) { doScore(); return; }
        try { startRec(); } catch(e2) { doScore(); }
      } else {
        doScore();
      }
    };

    rec.onerror = (e) => {
      wwState._activeRec = null;
      if (e.error === 'aborted') return;
      // v1.14B: network error = Google speech servers unreachable (no internet)
      if (e.error === 'network' || e.error === 'service-not-allowed') {
        wwState.isListening = false;
        const micBtn  = document.getElementById('ww-mic-btn');
        const doneBtn = document.getElementById('ww-done-btn');
        if (micBtn)  { micBtn.classList.remove('listening'); micBtn.textContent = '🎙️'; }
        if (doneBtn) doneBtn.style.display = 'none';
        const st = document.getElementById('ww-status');
        if (st) st.textContent = 'Speech needs internet. Connect Wi-Fi and try again.';
        return;
      }
      if (e.error === 'not-allowed' || e.error === 'permission-denied') {
        wwState.isListening = false;
        const micBtn  = document.getElementById('ww-mic-btn');
        if (micBtn)  { micBtn.classList.remove('listening'); micBtn.textContent = '🎙️'; }
        const st = document.getElementById('ww-status');
        if (st) st.textContent = 'Mic permission denied. Allow mic in browser settings.';
        return;
      }
      if (e.error === 'no-speech') {
        if (isLong && wwState.transcript && graceCount < MAX_RESTART) {
          doScore(); // real silence on long item → score what we have
        } else if (!wwState.transcript) {
          // Nothing at all — wait 3s before "nothing heard"
          wwState.isListening = false;
          const micBtn  = document.getElementById('ww-mic-btn');
          const doneBtn = document.getElementById('ww-done-btn');
          if (micBtn)  { micBtn.classList.remove('listening'); micBtn.textContent = '🎙️'; }
          if (doneBtn) doneBtn.style.display = 'none';
          const st = document.getElementById('ww-status');
          if (st) st.textContent = '⏳ Listening... speak when ready.';
          wwState.graceTimer = setTimeout(() => {
            if (!wwState._scored && !wwState.transcript) {
              const st2 = document.getElementById('ww-status');
              if (st2) st2.textContent = 'Nothing heard — tap 🎙️ to try again.';
              wwState._scored = false;
            }
          }, 3000);
        } else {
          doScore();
        }
      } else {
        wwState.isListening = false;
        const st = document.getElementById('ww-status');
        if (st) st.textContent = 'Mic error: ' + e.error + '. Tap to retry.';
      }
    };

    try {
      rec.start();
      // mic UI already set red above
    } catch(startErr) {
      // v1.15H: On Android, rec.start() can throw InvalidStateError if audio
      // hardware is still busy. Retry once after 600ms instead of failing.
      wwState._activeRec = null;
      wwState.recognition = null;
      if (startErr.name === 'InvalidStateError' && graceCount < MAX_RESTART) {
        graceCount++;
        const stRetry = document.getElementById('ww-status');
        if (stRetry) stRetry.textContent = '⏳ Starting mic...';
        wwState.ttsTimer = setTimeout(function() {
          if (localScored || wwState._scored) return;
          if (wwState.listenToken !== myToken) return;
          startRec(); // retry
        }, 700);
      } else {
        // Non-recoverable error
        wwState.isListening = false;
        const micBtnErr  = document.getElementById('ww-mic-btn');
        const doneBtnErr = document.getElementById('ww-done-btn');
        if (micBtnErr)  { micBtnErr.classList.remove('listening'); micBtnErr.textContent = '🎙️'; }
        if (doneBtnErr) doneBtnErr.style.display = 'none';
        doScore();
      }
    }
  }

  startRec();
}

function wwStopSpeechNow() {
  clearTimeout(wwState.graceTimer);
  clearTimeout(wwState.autoTimer);
  clearTimeout(wwState.ttsTimer);
  clearTimeout(wwState._silenceTimer);
  wwStopActiveRec();
  wwState.isListening = false;
  const doneBtn = document.getElementById('ww-done-btn');
  if (doneBtn) doneBtn.style.display = 'none';

  // v1.10G2 TASK 2: Use best available transcript — state → DOM interim → nothing
  if (!wwState.transcript) {
    const box = document.getElementById('ww-transcript');
    const domText = box ? box.textContent.replace(' ▋','').trim() : '';
    if (domText && domText.length > 2 && !domText.startsWith('Your speech') && domText !== '...') {
      wwState.transcript = domText;
    }
  }

  if (wwState._pendingScore) {
    const fn = wwState._pendingScore;
    wwState._pendingScore = null;
    fn();
  } else if (wwState.transcript && !wwState._scored) {
    wwState._scored = true;
    wwScoreAnswer();
  }
}

function wwClearTimers() {
  clearTimeout(wwState.ttsTimer);
  clearTimeout(wwState.graceTimer);
  clearTimeout(wwState.autoTimer);
  clearTimeout(wwState._silenceTimer);
  wwState._pendingScore = null;
}

function wwClose() {
  closeWordWizardScreen();
  const area = document.getElementById('ww-wizard-area');
  if (area) { area.style.display = 'none'; area.innerHTML = ''; }
  showWordTab('sets');
}

// v1.11A: Hint lookup for common Afghan English mismatch patterns
function wwGetHint(transcript, target) {
  const t = (transcript || '').toLowerCase().trim();
  const tgt = (target || '').toLowerCase().trim();
  if (t === tgt) return null;
  // Pattern matching
  if (/\bfeesh\b|\bfiesh\b/.test(t) && /\bfish\b/.test(tgt))
    return "The short 'i' in fish is different from the long ee sound. Put your tongue lower and say it quickly.";
  if (/\bwery\b|\bwary\b/.test(t) && /\bvery\b/.test(tgt))
    return "English V and W are different. For V, touch your top teeth to your lower lip and push air out.";
  if (/\bblay\b|\bblee\b/.test(t) && /\bplay\b/.test(tgt))
    return "English P and B are different. For P, press your lips together and push a small puff of air.";
  if (/\bsink\b|\btink\b/.test(t) && /\bthink\b/.test(tgt))
    return "Put your tongue between your teeth for the TH sound. It is not the same as S or T.";
  if (/\bship\b/.test(t) && /\bsheep\b/.test(tgt))
    return "The ee in sheep is a long sound, like the word feet. Hold the sound a little longer.";
  if (/\bdis\b|\bdat\b/.test(t) && /\bthis\b|\bthat\b/.test(tgt))
    return "For TH, place your tongue gently between your teeth.";
  return "Listen to the model carefully and try again.";
}

// v1.11A / v1.15G: Speak target word via TTS and animate bars
function wwHearModel(targetWord) {
  const wasListening = wwState.isListening;
  const wasAuto      = (wwState.mode === 'auto');
  const barsEl       = document.getElementById('ww-model-bars');
  const stEl         = document.getElementById('ww-status');

  if (wasListening && stEl) {
    stEl.textContent =
      '🔇 Mic paused while app voice plays. App voice will not be scored.\n' +
      'مایکروفون د اپ د غږ پر وخت درول کېږي. د اپ غږ نه شمېرل کېږي.';
  }
  if (barsEl) barsEl.style.visibility = 'visible';

  _wwPlayModel(targetWord, function() {
    if (barsEl) barsEl.style.visibility = 'hidden';
    if (wwState.paused || wwState._scored) return;
    if (stEl && stEl.textContent.indexOf('🔇') === 0) stEl.textContent = '';
    if (wasListening && wasAuto) {
      wwStartSpeech(); // restore auto mic
    } else if (wasListening && !wasAuto) {
      if (stEl) stEl.textContent = 'Tap 🎙️ to speak.';
    }
  });
}

// v1.11A: Play recorded audio
function wwHearYourself() {
  if (!wwState.lastRecordingURL) return;
  const barsEl = document.getElementById('ww-self-bars');
  if (barsEl) barsEl.style.visibility = 'visible';
  const a = new Audio(wwState.lastRecordingURL);
  a.onended = function() { if (barsEl) barsEl.style.visibility = 'hidden'; };
  a.onerror = function() { if (barsEl) barsEl.style.visibility = 'hidden'; };
  a.play().catch(function() { if (barsEl) barsEl.style.visibility = 'hidden'; });
}

function wwScoreAnswer() {
  const w    = wwState.words[wwState.wordIndex];
  const text = (wwState.phase === 'sentence' && w.ex_en) ? w.ex_en : w.en;
  const score = calculateScore(wwState.transcript, text);

  // Store score for this phase/round
  if (wwState.phase === 'word') {
    wwState.roundScores[wwState.round - 1] = score;
  } else {
    wwState.sentenceScores[wwState.round - 1] = score;
  }

  const resultArea = document.getElementById('ww-result-area');
  if (!resultArea) return;

  const emoji = score >= 80 ? '🌟' : score >= 60 ? '✅' : score >= 40 ? '🔁' : '❌';
  const color = score >= 70 ? 'var(--emerald)' : score >= 40 ? 'var(--gold)' : 'var(--danger,#e05555)';
  const barW  = score;

  // v1.11A: Hint box
  let hintHTML = '';
  if (score >= 90) {
    hintHTML = `<div style="background:var(--emerald,#2ecc71);color:#fff;border-radius:8px;padding:8px 12px;font-size:12px;text-align:center;margin:8px 0 4px;">Excellent pronunciation. Well done.</div>`;
  } else {
    const hint = wwGetHint(wwState.transcript, text);
    if (hint) {
      hintHTML = `<div style="background:var(--gold,#e6b800);color:#333;border-radius:8px;padding:8px 12px;font-size:12px;margin:8px 0 4px;">${escHtml(hint)}</div>`;
    }
  }

  // v1.17C: extract Pashto support meaning from current word item
  const wwWord = wwState.words ? wwState.words[wwState.wordIndex] : null;
  const wwMeaning = zirakExtractMeaning(wwWord || {});
  let wwMeaningHtml = '';
  if (wwMeaning.dari) {
    wwMeaningHtml += `<div class="dari" style="font-size:13px;color:var(--text-dari);margin-top:4px;padding:4px 8px;background:var(--bg-card2);border-radius:6px;">${wwMeaning.dari}</div>`;
  }
  if (wwMeaning.pashto) {
    wwMeaningHtml += `<div style="font-size:12px;color:var(--text-muted);margin-top:2px;padding:3px 8px;background:var(--bg-card2);border-radius:6px;">${wwMeaning.pashto}</div>`;
  }

  // v1.13B: teacher feedback for spoken message
  const wwTeacherMsg = zirakTeacherFeedback(score, normalizeForScore(wwState.transcript || ''), normalizeForScore(text));

  // v1.11A: Playback buttons (always show Hear model; Hear yourself only if recording available)
  const selfBtnDisabled = wwState.lastRecordingURL ? '' : 'disabled style="opacity:0.4;cursor:default;"';
  const barsStyle = 'visibility:hidden;display:inline-flex;gap:2px;align-items:flex-end;height:16px;vertical-align:middle;margin-left:4px;';
  const barSpans = '<span style="width:3px;background:currentColor;border-radius:2px;animation:ww-bar 0.6s ease-in-out infinite alternate;" class="ww-ab ab1"></span>' +
    '<span style="width:3px;background:currentColor;border-radius:2px;animation:ww-bar 0.6s ease-in-out 0.15s infinite alternate;" class="ww-ab ab2"></span>' +
    '<span style="width:3px;background:currentColor;border-radius:2px;animation:ww-bar 0.6s ease-in-out 0.3s infinite alternate;" class="ww-ab ab3"></span>';

  resultArea.innerHTML = `
    <style>
      @keyframes ww-bar { from { height: 4px; } to { height: 14px; } }
      .ww-ab { display: inline-block; }
    </style>
    <div style="text-align:center;padding:6px 0 2px;">
      <div style="font-size:28px;font-weight:900;color:${color};">${emoji} ${score}%</div>
      <div style="background:var(--border,#ddd);height:6px;border-radius:4px;margin:6px 12px 0;">
        <div style="background:${color};height:6px;border-radius:4px;width:${barW}%;transition:width 0.6s;"></div>
      </div>
    </div>
    <div style="font-size:13px;color: var(--lapis-text);font-weight:600;margin:6px 0 2px;">${escHtml(wwTeacherMsg)}</div>
    <div style="font-size:12px;color:var(--text-muted);padding:4px 0 2px;text-align:left;">
      <div>Target: <strong>${escHtml(text)}</strong></div>
      <div>You said: <em>${escHtml(wwState.transcript) || '(nothing heard)'}</em></div>
    </div>
    ${wwMeaningHtml}
    ${hintHTML}
    <div style="display:flex;gap:8px;justify-content:center;margin:8px 0 4px;">
      <button class="btn btn-outline btn-sm" onclick="wwHearModel(${JSON.stringify(text)})" style="font-size:12px;">
        ▶ Hear model<span id="ww-model-bars" style="${barsStyle}">${barSpans}</span>
      </button>
      <button class="btn btn-outline btn-sm" onclick="wwHearYourself()" ${selfBtnDisabled} style="font-size:12px;">
        ▶ Hear yourself<span id="ww-self-bars" style="${barsStyle}">${barSpans}</span>
      </button>
    </div>
    <div style="text-align:center;margin-top:6px;display:flex;gap:8px;justify-content:center;">
      <button class="btn btn-outline btn-sm" onclick="wwRetry()">🔄 Try Again</button>
      <button class="btn btn-primary btn-sm" onclick="wwNextWordWithCleanup()">Next word →</button>
    </div>
    <div style="font-size:12px;color:var(--text-muted);text-align:center;margin-top:4px;" id="ww-countdown"></div>
  `;

  // v1.13B: smooth scroll using central helper
  zirakScrollToResult('ww-result-area', 130);

  // v1.13B: speak teacher feedback
  zirakSpeakFeedback(wwTeacherMsg, FEEDBACK_SPEAK_DELAY_MS);

  wwStartCountdown(score);
}

// v1.11A: Next word with recording cleanup
function wwNextWordWithCleanup() {
  if (wwState.lastRecordingURL) {
    try { URL.revokeObjectURL(wwState.lastRecordingURL); } catch(e) {}
    wwState.lastRecordingURL = null;
  }
  wwState.mediaRecorder = null;
  wwState.recordingChunks = [];
  wwContinueNow();
}

function wwStartCountdown(score) {
  if (wwState.paused) return;
  const isWeak = score < 70;
  if (isWeak) wwState._wordRetryCount = (wwState._wordRetryCount || 0) + 1;
  const retryMaxed = isWeak && wwState._wordRetryCount > 1;

  let remaining, action, nextFn;

  if (isWeak && !retryMaxed) {
    remaining = 4; action = 'Retrying'; nextFn = wwRetry;
  } else {
    remaining = 3; nextFn = wwAdvanceNow;
    // Determine next step label
    if (wwState.phase === 'word') {
      if (wwState.round < 2) action = 'Word Round 2';
      else {
        const w = wwState.words[wwState.wordIndex];
        action = w && w.ex_en ? 'Sentence Round 1' : 'Next word';
      }
    } else {
      action = wwState.round < 2 ? 'Sentence Round 2' : 'Next word';
    }
  }

  const tick = () => {
    if (wwState.paused) return;
    const el = document.getElementById('ww-countdown');
    if (el) el.textContent = remaining > 0 ? `${action} in ${remaining}s…` : '';
    if (remaining <= 0) { nextFn(); return; }
    remaining--;
    wwState.autoTimer = setTimeout(tick, 1000);
  };
  wwState.autoTimer = setTimeout(tick, 800);
}

function wwRetry() {
  wwClearTimers();
  wwStopActiveRec();
  window.speechSynthesis.cancel();
  wwState.transcript = '';
  wwState._graceUsed = false;
  wwState._scored    = false;
  wwRenderStep();
}

function wwContinueNow() {
  wwClearTimers();
  wwAdvanceNow();
}

// Advance to the next step in the 4-step per-word flow:
// word-r1 → word-r2 → sentence-r1 → sentence-r2 → next word
function wwAdvanceNow() {
  wwClearTimers();
  const w = wwState.words[wwState.wordIndex];
  wwState.transcript     = '';
  wwState._graceUsed     = false;
  wwState._scored        = false;
  wwState._wordRetryCount = 0;

  if (wwState.phase === 'word') {
    if (wwState.round < 2) {
      // → Word Round 2
      wwState.round = 2;
      wwRenderStep();
    } else {
      // Word rounds done — check if there's an example sentence
      if (w && w.ex_en) {
        // → Sentence Round 1
        wwState.phase         = 'sentence';
        wwState.round         = 1;
        wwState.sentenceScores= [];
        wwRenderStep();
      } else {
        // No example — record result and go to next word
        wwRecordWordResult();
        wwNextWord();
      }
    }
  } else {
    // phase === 'sentence'
    if (wwState.round < 2) {
      // → Sentence Round 2
      wwState.round = 2;
      wwRenderStep();
    } else {
      // Sentence rounds done — record combined result and move to next word
      wwRecordWordResult();
      wwNextWord();
    }
  }
}

function wwRecordWordResult() {
  const w  = wwState.words[wwState.wordIndex];
  const r1 = wwState.roundScores[0]    || 0;
  const r2 = wwState.roundScores[1]    || r1;
  const s1 = wwState.sentenceScores[0] || 0;
  const s2 = wwState.sentenceScores[1] || s1;
  const hasSentence = !!(w && w.ex_en);
  const wordAvg = Math.round((r1 + r2) / 2);
  const sentAvg = hasSentence ? Math.round((s1 + s2) / 2) : null;
  const combined = hasSentence
    ? Math.round((wordAvg + sentAvg) / 2)
    : wordAvg;
  wwState.results[wwState.wordIndex] = {
    word: w.en, dari: w.dari,
    r1, r2, wordAvg,
    s1: hasSentence ? s1 : null,
    s2: hasSentence ? s2 : null,
    sentAvg,
    avgScore: combined,
    weak: combined < 70,
    weakSentence: hasSentence && sentAvg < 70
  };
  // v1.11B: Update word mastery level
  if (w && w.id) {
    updateWordMastery(w.id, combined >= 70, 'wizard');
  }
  // v1.11B: Update daily streak
  updateStreak();
}

function wwNextWord() {
  // v1.11A: Clean up recording URL
  if (wwState.lastRecordingURL) {
    try { URL.revokeObjectURL(wwState.lastRecordingURL); } catch(e) {}
    wwState.lastRecordingURL = null;
  }
  wwState.mediaRecorder = null;
  wwState.recordingChunks = [];
  wwState.wordIndex++;
  wwState.round          = 1;
  wwState.phase          = 'word';
  wwState.roundScores    = [];
  wwState.sentenceScores = [];
  wwState.transcript     = '';
  wwState._graceUsed     = false;
  wwState._scored        = false;
  wwState._wordRetryCount= 0;
  wwRenderStep();
}

function wwShowFinalResult() {
  const ws   = WORD_SETS[wwState.setKey];
  const area = wwGetActiveArea();
  if (!area) return;
  wwClearTimers();
  wwStopActiveRec();
  window.speechSynthesis.cancel();

  const results = wwState.results.filter(Boolean);
  const totalW  = results.length;
  if (!totalW) { wwClose(); return; }

  const avgScore   = Math.round(results.reduce((s,r) => s + r.avgScore, 0) / totalW);
  const weakWords  = results.filter(r => r.weak).map(r => r.word);
  const weakSents  = results.filter(r => r.weakSentence).map(r => r.word + ' (sentence)');
  const allMissed  = [...weakWords, ...weakSents];
  const sentCount  = results.filter(r => r.sentAvg !== null).length;
  // I6H-C: Learning Ledger record (Word Wizard final only)
  try {
    if (window.ZirakLearningLedger) {
      window.ZirakLearningLedger.recordActivity({
        source: 'wordlab', contentId: wwState.setKey, // I6H-D13B (Task 9)
        sectionTitle: 'Word Wizard: ' + (ws ? ws.en : ''),
        good: (totalW - weakWords.length), total: totalW, pct: avgScore,
        weakItems: allMissed,
        activityType: 'word-wizard'
      });
    }
  } catch (eLlg) {}

  // Save to history
  saveToHistory({ type:'wizard', topic:'Word Wizard: '+(ws?.en||''), score:avgScore, mode:'en', date:new Date().toISOString() });
  checkAndAwardBadges();
  // Bookmark weak words
  weakWords.forEach(word => {
    if (!state.bookmarks.includes(word)) state.bookmarks.push(word);
  });
  save('word_bookmarks', state.bookmarks);
  renderSavedWords();

  // Summary area
  area.innerHTML = `<div id="ww-final-container" style="padding:0 16px 12px;">
    <div style="text-align:center;padding:10px 0 4px;">
      <div style="font-size:34px;font-weight:900;color:${avgScore>=70?'var(--emerald)':avgScore>=40?'var(--gold)':'var(--danger,#e05555)'};">${avgScore}%</div>
      <div style="font-size:14px;margin-top:3px;">Word Wizard Complete! ${ws?.icon||'🧙'} ${ws?.en||''}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">${totalW} words · ${sentCount} sentences practiced</div>
      ${weakWords.length
        ? `<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Weak words: ${weakWords.join(', ')}</div>`
        : '<div style="font-size:12px;color: var(--emerald-text);margin-top:4px;">All words excellent! 🌟</div>'}
    </div>
    <div id="ww-pro-card-area"></div>
  </div>`;

  const ov = document.getElementById('ww-focused-overlay');
  if (ov) ov.scrollTop = 0;

  // v1.11D1: Varied final feedback using FEEDBACK_BANK + parent guidance
  const wwWho = window.zirakActiveStudentName ? window.zirakActiveStudentName() : null;
  const wwName = (wwWho && wwWho.hasStudent) ? wwWho.firstName : '';
  const feedbackText = buildFinalFeedbackMsg(avgScore, true, wwName);
  const fbUtter = new SpeechSynthesisUtterance(feedbackText);
  fbUtter.lang = 'en-US'; fbUtter.rate = (window.state && state.speechRate) ? state.speechRate : 0.85; fbUtter.volume = 1.0;
  window.speechSynthesis.speak(fbUtter);
  _zirakSpeakWeakItemsOnce(allMissed, Math.max(2200, feedbackText.length * 60));

  // Build result card after a tick
  setTimeout(() => {
    const proArea = document.getElementById('ww-pro-card-area');
    if (!proArea) return;
    // Extra details line for the card
    const detailLine = `${totalW} words × 2 rounds + ${sentCount} sentences × 2 rounds`;
    const proCard = buildProResultCard({
      score: avgScore,
      sessionTitle: 'Word Wizard: ' + (ws?.en || ''),
      sectionType: 'Word Wizard',
      missedWords: allMissed,
      extraWords: [],
      sessionDetails: detailLine,
      onPracticeAgain: function() { startWordWizard(wwState.setKey); },
      onContinue: function() { wwClose(); }
    });
    proArea.appendChild(proCard);
  }, 0);
}


document.addEventListener('DOMContentLoaded', () => {
  setTheme(state.theme);
  initHome();
  renderDialogue();
  updateOfflineStatus();
  updateSchoolHomeCard();
  // Apply saved dari font size
  const dfs = state.dariFontSize;
  document.querySelectorAll('.dari').forEach(el => {
    el.classList.toggle('dari-lg', dfs === 'large');
    el.classList.toggle('dari-sm', dfs === 'small');
  });
});

// ===== v1.11D: PHONICS DRILLS =====

let phonicsDrillState = null;

// Low-level TTS helper — fires callback when utterance ends (with safety timeout)
function _phonicsSpeak(text, rate, onDone) {
  if (!window.speechSynthesis) { if (onDone) setTimeout(onDone, 0); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang  = 'en-US';
  // Use global speed unless a specific rate override is passed that differs significantly from default
  u.rate  = (window.state && state.speechRate) ? state.speechRate : (rate || 0.85);
  let fired = false;
  const fire = () => { if (!fired) { fired = true; if (onDone) onDone(); } };
  u.onend   = fire;
  u.onerror = fire;
  window.speechSynthesis.speak(u);
  // Safety: fallback after generous time (100ms per char, min 1.5s)
  setTimeout(fire, Math.max(1500, text.length * 110));
}

function initPhonics() {
  if (phonicsDrillState) { phonicsDrillState = null; }
  const sel   = document.getElementById('phonics-selector');
  const drill = document.getElementById('phonics-drill-area');
  const res   = document.getElementById('phonics-result-area');
  if (sel)   sel.style.display   = 'block';
  if (drill) drill.style.display = 'none';
  if (res)   res.style.display   = 'none';
  renderPhonicsGroups();
}

function renderPhonicsGroups() {
  const el = document.getElementById('phonics-group-list');
  if (!el) return;
  el.innerHTML = PHONICS_PAIRS.map((g, i) =>
    '<div class="phonics-group-card" onclick="startPhoneticsDrill(' + i + ')">' +
      '<div>' +
        '<div class="phonics-group-name">' + escHtml(g.sound) + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:4px;">' +
          g.pairs.map(p => escHtml(p[0]) + ' / ' + escHtml(p[1])).join(' &nbsp;·&nbsp; ') +
        '</div>' +
      '</div>' +
      '<span style="font-size:20px;color:var(--text-muted);">▶</span>' +
    '</div>'
  ).join('');
}

function startPhoneticsDrill(gIdx) {
  const grp = PHONICS_PAIRS[gIdx];
  if (!grp) return;

  // Build 8 rounds: each of the 4 pairs used exactly twice, shuffled
  let rounds = grp.pairs.concat(grp.pairs);
  for (let i = rounds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = rounds[i]; rounds[i] = rounds[j]; rounds[j] = tmp;
  }
  phonicsDrillState = {
    groupIdx: gIdx,
    groupName: grp.sound,
    rounds: rounds,      // 8 pairs
    roundIdx: 0,
    spokenIdx: 0,        // which word (0 or 1) was spoken this round
    correct: 0,
    wrongWords: [],
    locked: true         // prevent tap while TTS is running
  };

  document.getElementById('phonics-selector').style.display   = 'none';
  document.getElementById('phonics-drill-area').style.display = 'block';
  document.getElementById('phonics-result-area').style.display = 'none';
  document.getElementById('phonics-feedback').textContent = '';

  // Speak instruction, then present the first pair
  _phonicsSpeak('Listen carefully and tap the word you hear.', 0.90, function() {
    setTimeout(function() { phonicsShowCurrentPair(); }, 500);
  });
}

function phonicsShowCurrentPair() {
  const ds = phonicsDrillState;
  if (!ds) return;
  const pair = ds.rounds[ds.roundIdx];

  // Randomly pick which word to speak
  ds.spokenIdx = Math.round(Math.random());
  ds.locked    = true;

  // Update round counter
  const info = document.getElementById('phonics-round-info');
  if (info) info.textContent = 'Round ' + (ds.roundIdx + 1) + ' of 8  ·  ' + ds.groupName;

  // Show word buttons
  const wa = document.getElementById('phonics-word-a');
  const wb = document.getElementById('phonics-word-b');
  if (wa) { wa.textContent = pair[0]; wa.className = 'phonics-word-btn'; wa.disabled = false; }
  if (wb) { wb.textContent = pair[1]; wb.className = 'phonics-word-btn'; wb.disabled = false; }
  document.getElementById('phonics-feedback').textContent = '';

  // Speak the chosen word — unlock buttons on end
  _phonicsSpeak(pair[ds.spokenIdx], 0.80, function() {
    if (phonicsDrillState && phonicsDrillState.roundIdx === ds.roundIdx) {
      ds.locked = false;
    }
  });
}

function phonicsTap(which) {
  const ds = phonicsDrillState;
  if (!ds || ds.locked) return;
  ds.locked = true;

  const pair       = ds.rounds[ds.roundIdx];
  const tappedIdx  = (which === 'a') ? 0 : 1;
  const isCorrect  = (tappedIdx === ds.spokenIdx);

  const wa = document.getElementById('phonics-word-a');
  const wb = document.getElementById('phonics-word-b');
  const fb = document.getElementById('phonics-feedback');

  // Disable both buttons to prevent double-tap
  if (wa) wa.disabled = true;
  if (wb) wb.disabled = true;

  if (isCorrect) {
    ds.correct++;
    const tapped = (which === 'a') ? wa : wb;
    if (tapped) tapped.className = 'phonics-word-btn correct';
    if (fb) { fb.textContent = '✓ Correct!'; fb.style.color = 'var(--emerald)'; }

    _phonicsSpeak(_fbPick(FEEDBACK_BANK.phonics.correct), 0.90, function() {
      setTimeout(function() { phonicsNextRound(); }, 400);
    });
  } else {
    ds.wrongWords.push(pair[ds.spokenIdx]);
    const tapped       = (which === 'a') ? wa : wb;
    const correctBtn   = (which === 'a') ? wb : wa;
    if (tapped)     tapped.className     = 'phonics-word-btn wrong';
    if (correctBtn) correctBtn.className = 'phonics-word-btn replay';
    if (fb) { fb.textContent = '✗ Not correct. Listen again.'; fb.style.color = 'var(--red-light)'; }

    // Speak feedback → replay both words slowly with 1 s gap → move on
    _phonicsSpeak(_fbPick(FEEDBACK_BANK.phonics.wrong), 0.90, function() {
      setTimeout(function() {
        _phonicsSpeak(pair[0], 0.70, function() {
          setTimeout(function() {
            _phonicsSpeak(pair[1], 0.70, function() {
              setTimeout(function() { phonicsNextRound(); }, 600);
            });
          }, 1000);
        });
      }, 300);
    });
  }
}

function phonicsNextRound() {
  const ds = phonicsDrillState;
  if (!ds) return;
  ds.roundIdx++;
  if (ds.roundIdx >= 8) {
    phonicsShowResult();
  } else {
    phonicsShowCurrentPair();
  }
}

function phonicsShowResult() {
  const ds = phonicsDrillState;
  if (!ds) return;

  document.getElementById('phonics-drill-area').style.display  = 'none';
  document.getElementById('phonics-result-area').style.display = 'block';

  const score = Math.round((ds.correct / 8) * 100);
  updateStreak();

  const area = document.getElementById('phonics-result-area');
  area.innerHTML = '';

  saveToHistory({ type:'phonics', topic:ds.groupName, score:score, mode:'en', date:new Date().toISOString() });
  checkAndAwardBadges();

  const savedGroupName = ds.groupName;
  const savedWrong     = ds.wrongWords.slice();

  const proCard = buildProResultCard({
    score:         score,
    sessionTitle:  savedGroupName,
    sectionType:   'Phonics Drill',
    missedWords:   savedWrong,
    extraWords:    [],
    onPracticeAgain: function() {
      phonicsDrillState = null;
      const gIdx = PHONICS_PAIRS.findIndex(function(g) { return g.sound === savedGroupName; });
      if (gIdx >= 0) startPhoneticsDrill(gIdx);
      else initPhonics();
    },
    onContinue: function() {
      phonicsDrillState = null;
      initPhonics();
    }
  });
  area.appendChild(proCard);

  // v1.11D1: Scroll result into view + spoken feedback
  setTimeout(function() {
    area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
  const phWho = window.zirakActiveStudentName ? window.zirakActiveStudentName() : null;
  const phName = (phWho && phWho.hasStudent) ? phWho.firstName : '';
  const finalMsg = buildFinalFeedbackMsg(score, true, phName);
  _phonicsSpeak(finalMsg, 0.90, function () {
    _zirakSpeakWeakItemsOnce(savedWrong, 300);
  });
}

function phonicsBackToGroups() {
  window.speechSynthesis.cancel();
  phonicsDrillState = null;
  initPhonics();
}

// ===== v1.11D: MINIMAL PAIRS =====

let minPairsDrillState = null;

function initMinPairs() {
  if (minPairsDrillState) { minPairsDrillState = null; }
  const sel   = document.getElementById('minpairs-selector');
  const drill = document.getElementById('minpairs-drill-area');
  const res   = document.getElementById('minpairs-result-area');
  if (sel)   sel.style.display   = 'block';
  if (drill) drill.style.display = 'none';
  if (res)   res.style.display   = 'none';

  // Render pairs preview
  const preview = document.getElementById('minpairs-preview');
  if (preview) {
    preview.innerHTML =
      '<div style="font-size:12px;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;">Pairs in this drill:</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
        MINIMAL_PAIRS.map(function(p) {
          return '<span class="badge badge-lapis">' + escHtml(p[0]) + ' / ' + escHtml(p[1]) + '</span>';
        }).join('') +
      '</div>';
  }
}

function startMinPairsDrill() {
  // Shuffle all 12 pairs and take first 10
  let shuffled = MINIMAL_PAIRS.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
  }
  const rounds = shuffled.slice(0, 10);

  minPairsDrillState = {
    rounds:     rounds,
    roundIdx:   0,
    spokenIdx:  0,
    correct:    0,
    wrongWords: [],
    locked:     true
  };

  document.getElementById('minpairs-selector').style.display   = 'none';
  document.getElementById('minpairs-drill-area').style.display = 'block';
  document.getElementById('minpairs-result-area').style.display = 'none';
  document.getElementById('minpairs-feedback').textContent = '';

  _phonicsSpeak('Listen carefully. Which word did you hear? Tap it.', 0.90, function() {
    setTimeout(function() { minPairsShowCurrentPair(); }, 500);
  });
}

function minPairsShowCurrentPair() {
  const ds = minPairsDrillState;
  if (!ds) return;
  const pair = ds.rounds[ds.roundIdx];

  ds.spokenIdx = Math.round(Math.random());
  ds.locked    = true;

  const info = document.getElementById('minpairs-round-info');
  if (info) info.textContent = 'Round ' + (ds.roundIdx + 1) + ' of 10  ·  Minimal Pairs';

  const wa = document.getElementById('minpairs-word-a');
  const wb = document.getElementById('minpairs-word-b');
  if (wa) { wa.textContent = pair[0]; wa.className = 'phonics-word-btn'; wa.disabled = false; }
  if (wb) { wb.textContent = pair[1]; wb.className = 'phonics-word-btn'; wb.disabled = false; }
  document.getElementById('minpairs-feedback').textContent = '';

  _phonicsSpeak(pair[ds.spokenIdx], 0.80, function() {
    if (minPairsDrillState && minPairsDrillState.roundIdx === ds.roundIdx) {
      ds.locked = false;
    }
  });
}

function minPairsTap(which) {
  const ds = minPairsDrillState;
  if (!ds || ds.locked) return;
  ds.locked = true;

  const pair      = ds.rounds[ds.roundIdx];
  const tappedIdx = (which === 'a') ? 0 : 1;
  const isCorrect = (tappedIdx === ds.spokenIdx);

  const wa = document.getElementById('minpairs-word-a');
  const wb = document.getElementById('minpairs-word-b');
  const fb = document.getElementById('minpairs-feedback');

  if (wa) wa.disabled = true;
  if (wb) wb.disabled = true;

  if (isCorrect) {
    ds.correct++;
    const tapped = (which === 'a') ? wa : wb;
    if (tapped) tapped.className = 'phonics-word-btn correct';
    if (fb) { fb.textContent = '✓ Correct!'; fb.style.color = 'var(--emerald)'; }

    _phonicsSpeak(_fbPick(FEEDBACK_BANK.phonics.correct), 0.90, function() {
      setTimeout(function() { minPairsNextRound(); }, 400);
    });
  } else {
    ds.wrongWords.push(pair[ds.spokenIdx]);
    const tapped     = (which === 'a') ? wa : wb;
    const correctBtn = (which === 'a') ? wb : wa;
    if (tapped)     tapped.className     = 'phonics-word-btn wrong';
    if (correctBtn) correctBtn.className = 'phonics-word-btn replay';
    if (fb) { fb.textContent = '✗ Not correct. Listen again.'; fb.style.color = 'var(--red-light)'; }

    _phonicsSpeak(_fbPick(FEEDBACK_BANK.phonics.wrong), 0.90, function() {
      setTimeout(function() {
        _phonicsSpeak(pair[0], 0.70, function() {
          setTimeout(function() {
            _phonicsSpeak(pair[1], 0.70, function() {
              setTimeout(function() { minPairsNextRound(); }, 600);
            });
          }, 1000);
        });
      }, 300);
    });
  }
}

function minPairsNextRound() {
  const ds = minPairsDrillState;
  if (!ds) return;
  ds.roundIdx++;
  if (ds.roundIdx >= 10) {
    minPairsShowResult();
  } else {
    minPairsShowCurrentPair();
  }
}

function minPairsShowResult() {
  const ds = minPairsDrillState;
  if (!ds) return;

  document.getElementById('minpairs-drill-area').style.display  = 'none';
  document.getElementById('minpairs-result-area').style.display = 'block';

  const score     = Math.round((ds.correct / 10) * 100);
  const savedWrong = ds.wrongWords.slice();
  updateStreak();

  const area = document.getElementById('minpairs-result-area');
  area.innerHTML = '';

  saveToHistory({ type:'phonics', topic:'Minimal Pairs', score:score, mode:'en', date:new Date().toISOString() });
  checkAndAwardBadges();

  const proCard = buildProResultCard({
    score:         score,
    sessionTitle:  'Minimal Pairs',
    sectionType:   'Minimal Pairs',
    missedWords:   savedWrong,
    extraWords:    [],
    onPracticeAgain: function() {
      minPairsDrillState = null;
      startMinPairsDrill();
    },
    onContinue: function() {
      minPairsDrillState = null;
      initMinPairs();
    }
  });
  area.appendChild(proCard);

  // v1.11D1: Scroll result into view + spoken feedback
  setTimeout(function() {
    area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
  const mpWho = window.zirakActiveStudentName ? window.zirakActiveStudentName() : null;
  const mpName = (mpWho && mpWho.hasStudent) ? mpWho.firstName : '';
  const finalMsg = buildFinalFeedbackMsg(score, true, mpName);
  _phonicsSpeak(finalMsg, 0.90, function () {
    _zirakSpeakWeakItemsOnce(savedWrong, 300);
  });
}

function minPairsBackToStart() {
  window.speechSynthesis.cancel();
  minPairsDrillState = null;
  initMinPairs();
}

// ===== PROGRESS DASHBOARD v1.11F =====

function initProgress() {
  pdRenderOverall();
  pdRenderStreak();
  pdRenderMastery();
  pdRenderHistory();
  pdRenderWords();
  pdRenderBadges();
}

function pdDaysAgo(dateStr) {
  if (!dateStr) return '';
  var today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) return 'Today';
  var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === yesterday) return 'Yesterday';
  var diff = Math.round((new Date(today) - new Date(dateStr)) / 86400000);
  if (isNaN(diff) || diff < 0) return '';
  return diff + ' days ago';
}

function pdRenderOverall() {
  var el = document.getElementById('pd-overall');
  if (!el) return;
  var allWords = Object.values(WORD_SETS).reduce(function(acc, ws) { return acc.concat(ws.words); }, []);
  var seen = 0, mastered = 0;
  allWords.forEach(function(w) {
    var m = loadMastery(w.id);
    if (m.level > 0) seen++;
    if (m.level >= 3) mastered++;
  });
  var streakCount = parseInt(load('streak_count') || '0');
  el.innerHTML =
    '<div style="display:flex;">' +
      '<div style="flex:1;padding:16px 8px;text-align:center;border-right:1px solid var(--border);">' +
        '<div style="font-size:32px;font-weight:800;color: var(--lapis-text);line-height:1;">' + seen + '</div>' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-top:4px;">Words Seen</div>' +
      '</div>' +
      '<div style="flex:1;padding:16px 8px;text-align:center;border-right:1px solid var(--border);">' +
        '<div style="font-size:32px;font-weight:800;color: var(--emerald-text);line-height:1;">' + mastered + '</div>' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-top:4px;">Mastered</div>' +
      '</div>' +
      '<div style="flex:1;padding:16px 8px;text-align:center;">' +
        '<div style="font-size:32px;font-weight:800;color:var(--gold);line-height:1;">' + streakCount + '</div>' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-top:4px;">Day Streak</div>' +
      '</div>' +
    '</div>';
}

function pdRenderStreak() {
  var el = document.getElementById('pd-streak');
  if (!el) return;
  var streakCount = parseInt(load('streak_count') || '0');
  var lastDate = load('streak_last_date') || '';
  var lastText = lastDate ? pdDaysAgo(lastDate) : '';
  el.innerHTML =
    '<div style="display:flex;align-items:center;gap:12px;">' +
      '<span style="font-size:32px;flex-shrink:0;">🔥</span>' +
      '<div>' +
        '<div style="font-size:17px;font-weight:700;">Current streak: ' + streakCount + ' day' + (streakCount === 1 ? '' : 's') + '</div>' +
        '<div style="font-size:13px;color:var(--text-muted);margin-top:3px;">' +
          (lastDate ? ('Last practiced: ' + lastText) : 'No practice recorded yet.') +
        '</div>' +
      '</div>' +
    '</div>';
}

function pdRenderMastery() {
  var container = document.getElementById('pd-mastery');
  if (!container) return;
  var html = '';
  Object.entries(WORD_SETS).forEach(function(entry) {
    var key = entry[0], ws = entry[1];
    var total = ws.words.length;
    var masteredCount = 0;
    var anySeen = false;
    ws.words.forEach(function(w) {
      var m = loadMastery(w.id);
      if (m.level > 0) anySeen = true;
      if (m.level >= 3) masteredCount++;
    });
    var pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
    var barColor = pct >= 70 ? '#059669' : pct >= 40 ? '#d97706' : '#94a3b8';
    var badge = (masteredCount === total && total > 0)
      ? '<span style="font-size:11px;font-weight:700;color: var(--emerald-text);background:rgba(26,107,74,0.12);border:1px solid rgba(26,107,74,0.2);padding:2px 8px;border-radius:10px;margin-left:6px;">✅ Complete</span>'
      : '';
    html += '<div class="card" style="margin-bottom:8px;">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:' + (anySeen ? '8' : '0') + 'px;">' +
        '<div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0;">' +
          '<span style="font-size:18px;flex-shrink:0;">' + (ws.icon || '📚') + '</span>' +
          '<span style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(ws.en) + '</span>' +
          badge +
        '</div>' +
        '<div style="flex-shrink:0;margin-left:8px;text-align:right;">' +
          (anySeen
            ? '<span style="font-size:12px;color:var(--text-muted);">' + masteredCount + '/' + total + '</span>' +
              ' <span style="font-size:12px;font-weight:700;color:' + barColor + ';">' + pct + '%</span>'
            : '<span style="font-size:12px;color:var(--text-muted);">Not started</span>') +
        '</div>' +
      '</div>' +
      (anySeen
        ? '<div style="background:var(--border);border-radius:4px;height:8px;overflow:hidden;">' +
            '<div style="width:' + pct + '%;background:' + barColor + ';height:8px;border-radius:4px;"></div>' +
          '</div>'
        : '') +
    '</div>';
  });
  container.innerHTML = html;
}

function pdRenderHistory() {
  var el = document.getElementById('pd-history');
  if (!el) return;
  var history = state.history || [];
  var last8 = history.slice().reverse().slice(0, 8);
  if (!last8.length) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:14px;text-align:center;padding:16px 0;">No quiz history yet.</div>';
    return;
  }
  var html = '';
  last8.forEach(function(h, idx) {
    var score = typeof h.score === 'number' ? h.score : 0;
    var passed = score >= 70;
    var color = passed ? 'var(--emerald)' : score >= 40 ? 'var(--gold)' : 'var(--red)';
    var resultLabel = passed ? 'Passed ✅' : 'Retry 🔁';
    var daysAgoText = h.date ? pdDaysAgo(h.date.slice(0, 10)) : '';
    var typeLabel = h.type === 'quiz' ? 'Quiz' : h.type === 'dialogue' ? 'Dialogue' : h.type === 'topic' ? 'Topic' : (h.type || 'Practice');
    var isLast = (idx === last8.length - 1);
    html += '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;' + (isLast ? '' : 'border-bottom:1px solid var(--divider);') + '">' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(h.topic || 'Practice') + '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + typeLabel + (daysAgoText ? ' · ' + daysAgoText : '') + '</div>' +
      '</div>' +
      '<div style="text-align:right;flex-shrink:0;">' +
        '<div style="font-size:15px;font-weight:700;color:' + color + ';">' + score + '%</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">' + resultLabel + '</div>' +
      '</div>' +
    '</div>';
  });
  el.innerHTML = html;
}

function pdRenderWords() {
  var el = document.getElementById('pd-words');
  if (!el) return;
  var allWords = Object.values(WORD_SETS).reduce(function(acc, ws) { return acc.concat(ws.words); }, []);
  var strongest = [], weakest = [];
  allWords.forEach(function(w) {
    var m = loadMastery(w.id);
    if (m.level >= 4) strongest.push(w.en);
    else if (m.level >= 1 && m.level <= 2) weakest.push(w.en);
  });
  if (!strongest.length && !weakest.length) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:14px;text-align:center;padding:12px 0;">Practice some words to see your strongest and weakest.</div>';
    return;
  }
  var html = '';
  if (strongest.length) {
    html += '<div' + (weakest.length ? ' style="margin-bottom:14px;"' : '') + '>' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px;">⭐ Strongest Words</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
        strongest.slice(0, 5).map(function(w) {
          return '<span style="padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;background:rgba(212,160,23,0.15);color:#a07010;border:1px solid rgba(212,160,23,0.3);">' + escHtml(w) + '</span>';
        }).join('') +
      '</div></div>';
  }
  if (weakest.length) {
    html += '<div>' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px;">💪 Needs More Practice</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
        weakest.slice(0, 5).map(function(w) {
          return '<span style="padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;background:rgba(192,57,43,0.12);color: var(--red-text);border:1px solid rgba(192,57,43,0.2);">' + escHtml(w) + '</span>';
        }).join('') +
      '</div></div>';
  }
  el.innerHTML = html;
}
// ===== ACHIEVEMENT BADGES v1.11H =====

const ACHIEVEMENT_BADGES = [
  {
    id: 'first_step',
    label: 'First Step',
    icon: '👣',
    desc: 'Completed your first Word Wizard session.',
    check: function() {
      const h = JSON.parse(load('practice_history') || '[]');
      return h.some(e => e.type === 'wizard');
    }
  },
  {
    id: 'word_collector',
    label: 'Word Collector',
    icon: '📚',
    desc: 'Mastered 10 or more words.',
    check: function() {
      let count = 0;
      Object.keys(WORD_SETS).forEach(k => {
        WORD_SETS[k].words.forEach(w => {
          const m = JSON.parse(load('wm_' + w.id) || '{"level":0}');
          if (m.level >= 3) count++;
        });
      });
      return count >= 10;
    }
  },
  {
    id: 'streak_starter',
    label: 'Streak Starter',
    icon: '🔥',
    desc: 'Practiced 3 days in a row.',
    check: function() { return parseInt(load('streak_count') || '0') >= 3; }
  },
  {
    id: 'week_warrior',
    label: 'Week Warrior',
    icon: '⚔️',
    desc: 'Practiced 7 days in a row.',
    check: function() { return parseInt(load('streak_count') || '0') >= 7; }
  },
  {
    id: 'quiz_passer',
    label: 'Quiz Passer',
    icon: '✅',
    desc: 'Passed a Word Quiz with 70% or more.',
    check: function() {
      const h = JSON.parse(load('practice_history') || '[]');
      return h.some(e => e.type === 'quiz' && e.score >= 70);
    }
  },
  {
    id: 'comeback_kid',
    label: 'Comeback Kid',
    icon: '💪',
    desc: 'Passed a Retry quiz after failing the main quiz.',
    check: function() {
      const h = JSON.parse(load('practice_history') || '[]');
      return h.some(e => e.type === 'quiz' && e.mode === 'retry' && e.score >= 70);
    }
  },
  {
    id: 'listener',
    label: 'Good Listener',
    icon: '👂',
    desc: 'Completed 5 Listening Room or Phonics sessions.',
    check: function() {
      const h = JSON.parse(load('practice_history') || '[]');
      return h.filter(e => e.type === 'listen' || e.type === 'phonics').length >= 5;
    }
  },
  {
    id: 'sentence_pro',
    label: 'Sentence Pro',
    icon: '📝',
    desc: 'Scored 80% or more in Sentence Practice.',
    check: function() {
      const h = JSON.parse(load('practice_history') || '[]');
      return h.some(e => e.type === 'sentence' && e.score >= 80);
    }
  }
];

function checkAndAwardBadges() {
  ACHIEVEMENT_BADGES.forEach(function(badge) {
    if (load('badge_' + badge.id)) return;
    try {
      if (badge.check()) {
        save('badge_' + badge.id, '1');
        save('badge_new_' + badge.id, '1');
      }
    } catch(e) {}
  });
}

function showNewBadgesOnResult(container) {
  ACHIEVEMENT_BADGES.forEach(function(badge) {
    if (load('badge_new_' + badge.id)) {
      save('badge_new_' + badge.id, '');
      const div = document.createElement('div');
      div.style.cssText =
        'margin:8px 16px;padding:10px 14px;background:#fef3c7;border-radius:10px;' +
        'border-left:3px solid #f59e0b;font-size:13px;font-weight:600;color:#92400e;';
      div.textContent = '🏅 New achievement: ' + badge.label + ' ' + badge.icon;
      container.appendChild(div);
    }
  });
}

function pdRenderBadges() {
  var el = document.getElementById('pd-badges');
  if (!el) return;
  var earned = ACHIEVEMENT_BADGES.filter(function(b) { return !!load('badge_' + b.id); });
  if (earned.length === 0 && ACHIEVEMENT_BADGES.every(function(b) { return !load('badge_' + b.id); })) {
    // Check if truly zero earned
    var anyEarned = ACHIEVEMENT_BADGES.some(function(b) { return !!load('badge_' + b.id); });
    if (!anyEarned) {
      el.innerHTML = '<div style="color:var(--text-muted);font-size:14px;text-align:center;padding:12px 0;">Complete activities to earn achievements.</div>';
      return;
    }
  }
  var html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:4px 0;" id="pd-badge-grid">';
  ACHIEVEMENT_BADGES.forEach(function(badge) {
    var isEarned = !!load('badge_' + badge.id);
    var badgeId = 'pd-badge-' + badge.id;
    // PHASE I6A5 — Part I: the OLD rule dimmed the WHOLE card (icon +
    // label text) to opacity:0.3 for unearned badges — at that opacity
    // the label became hard to read, per real-device screenshot
    // feedback ("if the fonts are dim, make them shiny"). Now only the
    // ICON is dimmed/desaturated to signal "locked"; the label stays at
    // a clearly readable color/weight either way, and a dashed border
    // gives a second, text-independent "not yet earned" cue.
    var cardStyle = 'cursor:pointer;text-align:center;padding:8px 4px;border-radius:8px;background:var(--bg-card2);'
      + (isEarned ? 'border:1px solid transparent;' : 'border:1px dashed var(--border,rgba(0,0,0,.18));');
    var iconStyle = isEarned ? '' : 'opacity:.45;filter:grayscale(60%);';
    // PHASE I6B1 — Part 4/9: the unearned-badge label previously
    // stacked opacity:.9 ON TOP OF the already-muted --text-muted
    // color — borderline WCAG contrast (~4.1:1) in dark mode that
    // real-device photos showed reading as essentially invisible.
    // --text-muted alone (no extra dampening) is the intended "readable
    // but clearly softer than earned" treatment — the dashed border +
    // dimmed icon already carry the "locked" signal, so the label text
    // itself doesn't need to ALSO be faded.
    var labelStyle = isEarned ? 'color:var(--text);' : 'color:var(--text-muted);';
    html += '<div id="' + badgeId + '" onclick="pdToggleBadgeDesc(\'' + badge.id + '\')" style="' + cardStyle + '">' +
      '<div style="font-size:24px;' + iconStyle + '">' + badge.icon + '</div>' +
      '<div style="font-size:10px;font-weight:700;margin-top:3px;line-height:1.2;' + labelStyle + '">' + escHtml(badge.label) + '</div>' +
      '</div>';
  });
  html += '</div>';
  // PHASE I6B1 — Part 4: this box was hardcoded light-yellow/dark-brown
  // regardless of theme — high-contrast internally so not "invisible",
  // but visually inconsistent against a dark page. Now theme-aware via
  // the gold/text variables, matching the rest of the dark-mode audit.
  html += '<div id="pd-badge-desc" class="pd-badge-desc-box" style="display:none;margin-top:8px;padding:8px 12px;border-radius:8px;font-size:12px;font-weight:600;"></div>';
  el.innerHTML = html;
}

function pdToggleBadgeDesc(badgeId) {
  var badge = ACHIEVEMENT_BADGES.find(function(b) { return b.id === badgeId; });
  if (!badge) return;
  var descEl = document.getElementById('pd-badge-desc');
  if (!descEl) return;
  var isEarned = !!load('badge_' + badge.id);
  var statusText = isEarned ? '✅ Earned!' : '🔒 Not yet earned';
  if (descEl.style.display === 'none' || descEl.dataset.current !== badgeId) {
    descEl.style.display = 'block';
    descEl.dataset.current = badgeId;
    descEl.textContent = badge.icon + ' ' + badge.label + ' — ' + badge.desc + ' (' + statusText + ')';
  } else {
    descEl.style.display = 'none';
    descEl.dataset.current = '';
  }
}

// ===== WEEKLY PARENT REPORT v1.11H =====

function getISOWeek() {
  const d = new Date();
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const dayOfYear = Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 86400000);
  const weekNum = Math.ceil((dayOfYear + jan4.getDay()) / 7);
  return d.getFullYear() + '-W' + String(weekNum).padStart(2, '0');
}

function showWeeklyReportBanner() {
  const banner = document.getElementById('weekly-report-banner');
  if (banner) banner.style.display = 'flex';
}

function dismissWeeklyBanner() {
  const thisWeek = getISOWeek();
  save('weekly_dismissed', thisWeek);
  const banner = document.getElementById('weekly-report-banner');
  if (banner) banner.style.display = 'none';
}

function getWeekDateRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmt = function(d) { return d.getDate() + ' ' + months[d.getMonth()]; };
  return fmt(monday) + ' – ' + fmt(sunday) + ' ' + sunday.getFullYear();
}

function sendWeeklyReport() {
  const thisWeek = getISOWeek();
  const p = loadParentProfile();
  const studentName = p.studentName || 'Student';
  const fatherName  = p.fatherName  || 'Parent';
  const rawWA = (p.fatherWA || '').replace(/[^0-9]/g, '');

  const streakCount = parseInt(load('streak_count') || '0');

  // Days practiced in last 7 days
  const history = JSON.parse(load('practice_history') || '[]');
  const sevenAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const recentEntries = history.filter(function(e) {
    return e.date && e.date.slice(0, 10) >= sevenAgo;
  });
  const practicedDays = new Set(recentEntries.map(function(e) { return e.date.slice(0, 10); })).size;

  // Total words mastered
  let masteredCount = 0;
  Object.keys(WORD_SETS).forEach(function(k) {
    WORD_SETS[k].words.forEach(function(w) {
      try {
        const m = JSON.parse(load('wm_' + w.id) || '{"level":0}');
        if (m.level >= 3) masteredCount++;
      } catch(e) {}
    });
  });

  // Quiz sessions and average score in last 7 days
  const quizEntries = recentEntries.filter(function(e) { return e.type === 'quiz'; });
  const quizCount = quizEntries.length;
  const avgScore = quizCount > 0
    ? Math.round(quizEntries.reduce(function(s, e) { return s + (e.score || 0); }, 0) / quizCount)
    : 0;

  // Week range
  const dateRange = getWeekDateRange();

  // Proof code: WK-YYYY-WNN-XXXX
  const wkNum = thisWeek.split('-W')[1] || '00';
  const year  = thisWeek.split('-W')[0];
  const rand  = Math.random().toString(16).substr(2, 4).toUpperCase();
  const proofCode = 'WK-' + year + 'W' + wkNum + '-' + rand;

  // Commentary line
  let commentary = 'Good effort this week. Keep it up.';
  if (streakCount >= 5) commentary = 'Excellent consistency this week.';
  else if (practicedDays < 3) commentary = 'Needs more practice days this week.';

  const msg =
    '\uD83D\uDCCA *Zirak Weekly Progress \u2014 Father Report*\n' +
    'Student: ' + studentName + '\n' +
    'Father: ' + fatherName + '\n' +
    'Week: ' + dateRange + '\n\n' +
    '\uD83D\uDCC5 Days practiced this week: ' + practicedDays + ' / 7\n' +
    '\uD83D\uDD25 Current streak: ' + streakCount + ' days\n' +
    '\uD83D\uDCDD Quiz sessions: ' + quizCount + ' | Average score: ' + (quizCount > 0 ? avgScore + '%' : 'N/A') + '\n' +
    '\u2B50 Total words mastered: ' + masteredCount + '\n\n' +
    commentary + '\n\n' +
    'Proof code: ' + proofCode + '\n' +
    '(Weekly reference \u2014 no action needed from father.)\n' +
    'Sent via Zirak English App \uD83C\uDF1F';

  const encoded = encodeURIComponent(msg);
  const url = rawWA
    ? 'https://wa.me/' + rawWA + '?text=' + encoded
    : 'https://wa.me/?text=' + encoded;

  window.open(url, '_blank');

  save('weekly_sent_week', thisWeek);
  const banner = document.getElementById('weekly-report-banner');
  if (banner) banner.style.display = 'none';
}

// ===== GRAMMAR MINI-CARDS v1.11G =====
var _grammarOpenId = null;

function renderGrammarCards() {
  var el = document.getElementById('grammar-cards-list');
  if (!el) return;
  _grammarOpenId = null;
  el.innerHTML = GRAMMAR_CARDS.map(function(card, i) {
    return '<div class="card" id="gram-card-' + card.id + '" style="cursor:pointer;" onclick="toggleGrammarCard(\'' + card.id + '\')">' +
      '<div id="gram-collapsed-' + card.id + '">' +
        '<div style="display:flex;align-items:flex-start;gap:10px;">' +
          '<span style="font-size:13px;font-weight:700;color:var(--text-muted);min-width:22px;padding-top:2px;">' + (i + 1) + '.</span>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:15px;font-weight:700;color:var(--text);line-height:1.4;">' + escHtml(card.pattern) + '</div>' +
            '<div class="dari" style="font-size:14px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(card.dari_note) + '</div>' +
            '<div style="font-size:12px;color:var(--text-muted);margin-top:6px;">▾ Tap to see example</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div id="gram-expanded-' + card.id + '" style="display:none;">' +
        '<div style="font-size:17px;font-weight:800;color:var(--text);line-height:1.4;margin-bottom:10px;">' + escHtml(card.pattern) + '</div>' +
        '<div class="dari" style="font-size:17px;margin-bottom:12px;">' + escHtml(card.dari_note) + '</div>' +
        '<div style="height:1px;background:var(--divider);margin-bottom:12px;"></div>' +
        '<div style="font-size:15px;color:var(--text);margin-bottom:6px;font-style:italic;">"' + escHtml(card.example_en) + '"</div>' +
        '<div class="dari" style="font-size:15px;margin-bottom:14px;">"' + escHtml(card.example_dari) + '"</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
          '<button onclick="event.stopPropagation();hearGrammarExample(\'' + card.id + '\')" style="background:var(--lapis);color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:14px;font-weight:600;cursor:pointer;">🔊 Hear example</button>' +
          '<button onclick="event.stopPropagation();toggleGrammarCard(\'' + card.id + '\')" style="background:var(--bg-card2);color:var(--text-muted);border:1px solid var(--border);border-radius:8px;padding:8px 16px;font-size:14px;cursor:pointer;">▴ Close</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleGrammarCard(id) {
  if (_grammarOpenId && _grammarOpenId !== id) {
    var prevCol = document.getElementById('gram-collapsed-' + _grammarOpenId);
    var prevExp = document.getElementById('gram-expanded-' + _grammarOpenId);
    if (prevCol) prevCol.style.display = '';
    if (prevExp) prevExp.style.display = 'none';
  }
  var col = document.getElementById('gram-collapsed-' + id);
  var exp = document.getElementById('gram-expanded-' + id);
  if (!col || !exp) return;
  var isOpen = exp.style.display !== 'none';
  if (isOpen) {
    col.style.display = '';
    exp.style.display = 'none';
    _grammarOpenId = null;
  } else {
    col.style.display = 'none';
    exp.style.display = '';
    _grammarOpenId = id;
  }
}

function hearGrammarExample(id) {
  var card = GRAMMAR_CARDS.find(function(c) { return c.id === id; });
  if (!card) return;
  // Track in localStorage (per-student)
  localStorage.setItem((window.ZirakStorageKey ? window.ZirakStorageKey('gram_seen_' + id) : ('gram_seen_' + id)), '1');
  // Speak English only — never speak Pashto support text automatically
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(card.example_en);
  u.lang = 'en-US';
  u.rate = (window.state && state.speechRate) ? state.speechRate : 0.85;
  u.volume = 1;
  window.speechSynthesis.speak(u);
}


// ===================================================================
// ===== CONTENT AUDIT TOOL (v1.15A) =================================
// zirakRunContentAudit()
//
// Developer/diagnostic helper. Scans WORD_SETS and reports content
// health. Call from the browser console: zirakRunContentAudit()
//
// Does NOT affect app logic, mic, or scoring.
// ===================================================================

window.zirakRunContentAudit = function () {
  var ws = (typeof WORD_SETS !== 'undefined') ? WORD_SETS : {};
  var setKeys = Object.keys(ws);
  var totalSets = setKeys.length;
  var totalWords = 0;
  var duplicateIds = [];
  var seenIds = {};
  var setsMissingWords = [];
  var wordsMissingId = [];
  var wordsMissingEn = [];
  var wordsMissingPashto = [];
  var wordsMissingPashto = [];
  var wordsMissingExEn = [];
  var wordsMissingExPashto = [];
  var wordsMissingExPashto = [];
  var pashtoPatched = 0;

  // Pack 1A expected keys
  var pack1aKeys = [
    'pack1a_greetings',
    'pack1a_classroom',
    'pack1a_family',
    'pack1a_home',
    'pack1a_food_drink',
    'pack1a_common_verbs'
  ];
  var pack1aFound = [];
  var pack1aMissing = [];

  setKeys.forEach(function (key) {
    var set = ws[key];
    var words = set.words;
    if (!Array.isArray(words) || words.length === 0) {
      setsMissingWords.push(key);
      return;
    }
    totalWords += words.length;
    words.forEach(function (w) {
      if (!w.id)        wordsMissingId.push({ set: key, word: w.en || '?' });
      if (!w.en)        wordsMissingEn.push({ set: key, id: w.id || '?' });
      if (!w.dari)      wordsMissingPashto.push({ set: key, id: w.id || '?' });
      if (!w.pashto)    wordsMissingPashto.push({ set: key, id: w.id || '?' });
      if (!w.ex_en)     wordsMissingExEn.push({ set: key, id: w.id || '?' });
      if (!w.ex_dari)   wordsMissingExPashto.push({ set: key, id: w.id || '?' });
      if (!w.ex_pashto) wordsMissingExPashto.push({ set: key, id: w.id || '?' });

      if (w.id) {
        if (seenIds[w.id]) {
          duplicateIds.push({ id: w.id, set: key });
        }
        seenIds[w.id] = true;
      }

      // Count words that have been Pashto-patched (pashto field but originally missing)
      // Heuristic: patched words typically come from legacy sets (no pack1a_ prefix)
      if (w.pashto && key.indexOf('pack1a_') === -1) {
        pashtoPatched++;
      }
    });
  });

  pack1aKeys.forEach(function (k) {
    if (ws[k]) { pack1aFound.push(k); }
    else        { pack1aMissing.push(k); }
  });

  // Registry summary
  var registrySummary = null;
  if (typeof zirakBuildPackSummaryFromWordSets === 'function') {
    registrySummary = zirakBuildPackSummaryFromWordSets();
  }

  // ---- Output ----
  var sep = '─────────────────────────────────────────';
  console.log('\n' + sep);
  console.log('  ZIRAK CONTENT AUDIT — v1.15A');
  console.log(sep);
  console.log('  Total sets  : ' + totalSets);
  console.log('  Total words : ' + totalWords);
  console.log(sep);
  console.log('  Duplicate IDs     : ' + (duplicateIds.length === 0 ? '✅ None' : '⚠️  ' + duplicateIds.length));
  if (duplicateIds.length) { console.warn('  Duplicates:', duplicateIds); }
  console.log('  Sets missing words: ' + (setsMissingWords.length === 0 ? '✅ None' : '⚠️  ' + setsMissingWords.length + ' — ' + setsMissingWords.join(', ')));
  console.log(sep);
  console.log('  Words missing id       : ' + (wordsMissingId.length      === 0 ? '✅ 0' : '⚠️  ' + wordsMissingId.length));
  console.log('  Words missing en       : ' + (wordsMissingEn.length      === 0 ? '✅ 0' : '⚠️  ' + wordsMissingEn.length));
  console.log('  Words missing dari     : ' + (wordsMissingPashto.length    === 0 ? '✅ 0' : '⚠️  ' + wordsMissingPashto.length));
  console.log('  Words missing pashto   : ' + (wordsMissingPashto.length  === 0 ? '✅ 0' : '⚠️  ' + wordsMissingPashto.length));
  console.log('  Words missing ex_en    : ' + (wordsMissingExEn.length    === 0 ? '✅ 0' : '⚠️  ' + wordsMissingExEn.length));
  console.log('  Words missing ex_dari  : ' + (wordsMissingExPashto.length  === 0 ? '✅ 0' : '⚠️  ' + wordsMissingExPashto.length));
  console.log('  Words missing ex_pashto: ' + (wordsMissingExPashto.length=== 0 ? '✅ 0' : '⚠️  ' + wordsMissingExPashto.length));
  console.log(sep);
  console.log('  Pack 1A sets found  : ' + pack1aFound.length + '/6');
  pack1aFound.forEach(function (k)   { console.log('    ✅ ' + k); });
  pack1aMissing.forEach(function (k) { console.log('    ❌ MISSING: ' + k); });
  console.log(sep);
  console.log('  Legacy sets with Pashto (patched): ~' + pashtoPatched + ' words');

  if (registrySummary) {
    console.log(sep);
    console.log('  REGISTERED PACKS (' + registrySummary.packs.length + ')');
    registrySummary.packs.forEach(function (p) {
      var status = p.missing.length === 0 ? '✅' : '⚠️ ';
      console.log('  ' + status + ' ' + p.id + ' — ' + p.titleEn);
      console.log('      Found  : ' + p.found.join(', '));
      if (p.missing.length) {
        console.log('      Missing: ' + p.missing.join(', '));
      }
    });
  }

  console.log(sep + '\n');

  // Optional: display a brief toast in the UI
  if (typeof showToast === 'function') {
    showToast('Content audit complete — see browser console for full report.');
  }

  // Return structured result for programmatic use
  return {
    totalSets:              totalSets,
    totalWords:             totalWords,
    duplicateIds:           duplicateIds,
    setsMissingWords:       setsMissingWords,
    wordsMissingId:         wordsMissingId,
    wordsMissingEn:         wordsMissingEn,
    wordsMissingPashto:       wordsMissingPashto,
    wordsMissingPashto:     wordsMissingPashto,
    wordsMissingExEn:       wordsMissingExEn,
    wordsMissingExPashto:     wordsMissingExPashto,
    wordsMissingExPashto:   wordsMissingExPashto,
    pack1aFound:            pack1aFound,
    pack1aMissing:          pack1aMissing,
    pashtoPatched:          pashtoPatched,
    registrySummary:        registrySummary
  };
};

// ===================================================================
// END v1.15A CONTENT AUDIT
// ===================================================================

// ===================================================================
// ===== v1.15B: LOCAL PROGRESS FEATURES ============================
// ===================================================================

// ---------------------------------------------------------------
// FEATURE 1 — SESSION TIME TRACKER + DAILY GOAL
// ---------------------------------------------------------------
(function initSessionTracker() {
  // local helper: resolve a per-student key if the namespace helper exists, else legacy key
  function zk(k){ return (window.ZirakStorageKey ? window.ZirakStorageKey(k) : k); }
  try {
    var today = new Date().toISOString().slice(0, 10);
    var savedDate = localStorage.getItem(zk('zirak_today_date'));
    var savedMins = parseInt(localStorage.getItem(zk('zirak_today_minutes')) || '0');
    if (savedDate !== today) {
      savedMins = 0;
      localStorage.setItem(zk('zirak_today_date'), today);
      localStorage.setItem(zk('zirak_today_minutes'), '0');
    }
    window._zirakTodayMinutes = savedMins;
  } catch(e) { window._zirakTodayMinutes = 0; }

  setInterval(function() {
    try {
      var screen = state.activeScreen;
      if (screen === 'home' || screen === 'progress') return;
      window._zirakTodayMinutes = (window._zirakTodayMinutes || 0) + 1;
      localStorage.setItem(zk('zirak_today_minutes'), String(window._zirakTodayMinutes));
      zirakRenderTodayGoalCard();
    } catch(e) {}
  }, 60000);
})();

function zirakRenderTodayGoalCard() {
  try {
    var mins = window._zirakTodayMinutes || 0;
    var goal = state.dailyGoal || 10;
    var card = document.getElementById('home-today-goal-card');
    if (!card) return;
    card.style.display = 'block';
    var enEl = document.getElementById('home-today-goal-en');
    var dariEl = document.getElementById('home-today-goal-dari');
    var checkEl = document.getElementById('home-today-goal-check');
    var barEl = document.getElementById('home-today-goal-bar');
    var done = mins >= goal;
    if (enEl) enEl.textContent = 'Today: ' + mins + ' min / goal ' + goal + ' min' + (done ? ' ✅' : '');
    if (dariEl) dariEl.textContent = 'نن: ' + mins + ' دقیقې / هدف ' + goal + ' دقیقه';
    if (checkEl) checkEl.style.display = done ? 'block' : 'none';
    if (barEl) {
      var pct = Math.min(100, Math.round((mins / goal) * 100));
      barEl.style.width = pct + '%';
    }
  } catch(e) {}
}

// ---------------------------------------------------------------
// FEATURE 2 — TODAY'S SUMMARY CARD
// ---------------------------------------------------------------
function zirakRenderTodaySummaryCard() {
  try {
    var card = document.getElementById('home-today-summary-card');
    if (!card) return;
    var today = new Date().toISOString().slice(0, 10);
    var todayEntries = (state.history || []).filter(function(h) {
      return h.date && h.date.slice(0, 10) === today;
    });
    if (!todayEntries.length) { card.style.display = 'none'; return; }
    card.style.display = 'block';

    var sessions = todayEntries.length;
    var scores = todayEntries.filter(function(h) { return typeof h.score === 'number'; });
    var avgScore = scores.length
      ? Math.round(scores.reduce(function(a, b) { return a + b.score; }, 0) / scores.length)
      : null;
    var modes = [];
    todayEntries.forEach(function(h) { if (h.type && modes.indexOf(h.type) === -1) modes.push(h.type); });

    var enText = '📅 Today: ' + sessions + ' session' + (sessions > 1 ? 's' : '') +
      (avgScore !== null ? ' · avg ' + avgScore + '%' : '') +
      (modes.length ? ' · ' + modes.join(', ') : '');
    var dariText = 'نن: ' + sessions + ' ناسته' + (avgScore !== null ? ' · منځنۍ ' + avgScore + '%' : '');
    var motivation = sessions >= 5 ? 'Excellent dedication! 🌟'
      : sessions >= 3 ? 'Great effort! 💪'
      : 'Good start! 👍';

    var enEl = document.getElementById('home-today-summary-en');
    var dariEl = document.getElementById('home-today-summary-dari');
    var motEl = document.getElementById('home-today-summary-motivation');
    if (enEl) enEl.textContent = enText;
    if (dariEl) dariEl.textContent = dariText;
    if (motEl) motEl.textContent = motivation;
  } catch(e) {}
}

// ---------------------------------------------------------------
// FEATURE 3 — ERROR BANK / MY WEAK WORDS
// ---------------------------------------------------------------
function saveToErrorBank(wordId) {
  if (!wordId) return;
  try {
    var k = (window.ZirakStorageKey ? window.ZirakStorageKey('zirak_error_bank') : 'zirak_error_bank');
    var raw = localStorage.getItem(k);
    var bank = raw ? JSON.parse(raw) : {};
    bank[wordId] = (bank[wordId] || 0) + 1;
    localStorage.setItem(k, JSON.stringify(bank));
  } catch(e) {}
}

function zirakRenderMistakesTab() {
  var el = document.getElementById('mistakes-list');
  if (!el) return;
  try {
    var k = (window.ZirakStorageKey ? window.ZirakStorageKey('zirak_error_bank') : 'zirak_error_bank');
    var raw = localStorage.getItem(k);
    var bank = raw ? JSON.parse(raw) : {};
    var ids = Object.keys(bank);
    if (!ids.length) {
      el.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;font-size:14px;">No saved mistakes yet.<br><span class="dari" style="font-size:13px;">تر اوسه هېڅ تېروتنه نه ده خوندي شوې.</span></div>';
      return;
    }
    // Collect all words from WORD_SETS
    var allWords = {};
    try {
      Object.values(WORD_SETS).forEach(function(ws) {
        (ws.words || []).forEach(function(w) { if (w.id) allWords[w.id] = w; });
      });
    } catch(e) {}

    // Sort by count descending, take top 20
    var sorted = ids
      .map(function(id) { return { id: id, count: bank[id], word: allWords[id] || null }; })
      .filter(function(x) { return x.word; })
      .sort(function(a, b) { return b.count - a.count; })
      .slice(0, 20);

    if (!sorted.length) {
      el.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;font-size:14px;">No saved mistakes yet.</div>';
      return;
    }

    var html = sorted.map(function(item) {
      var w = item.word;
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border);">' +
        '<div style="flex:1;">' +
          '<div style="font-size:15px;font-weight:700;color:var(--text);">' + escHtml(w.en || '') + '</div>' +
          '<div class="dari" style="font-size:14px;color:var(--text-muted);">' + escHtml(w.dari || '') + '</div>' +
          (w.pashto ? '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">' + escHtml(w.pashto) + '</div>' : '') +
        '</div>' +
        '<span style="background:var(--red);color:#fff;border-radius:20px;padding:2px 9px;font-size:12px;font-weight:800;flex-shrink:0;">✗ ' + item.count + '</span>' +
      '</div>';
    }).join('');
    el.innerHTML = '<div style="border-radius:12px;overflow:hidden;background:var(--bg-card);">' + html + '</div>';
  } catch(e) {
    el.innerHTML = '<div style="color:var(--text-muted);padding:16px;">Error loading mistakes.</div>';
  }
}

function clearErrorBank() {
  if (!confirm('Clear all saved mistakes? This cannot be undone.\n\nټولې تېروتنې پاکې شي؟')) return;
  try { localStorage.removeItem(window.ZirakStorageKey ? window.ZirakStorageKey('zirak_error_bank') : 'zirak_error_bank'); } catch(e) {}
  zirakRenderMistakesTab();
  if (typeof showToast === 'function') showToast('Error bank cleared. / د تېروتنو بانک پاک شو.');
}

// ---------------------------------------------------------------
// FEATURE 4 — SPEAKING CONFIDENCE SELF-RATING
// ---------------------------------------------------------------
function saveConfidence(level) {
  try {
    var ck = (window.ZirakStorageKey ? window.ZirakStorageKey('zirak_confidence') : 'zirak_confidence');
    var raw = localStorage.getItem(ck);
    var entries = raw ? JSON.parse(raw) : [];
    var d = state.currentDialogue;
    entries.push({
      dialogueId: d ? (d.id || d.titleEn || '') : '',
      stepIndex: state.currentStep || 0,
      score: state.lastScore || 0,
      confidence: level,
      date: new Date().toISOString()
    });
    if (entries.length > 100) entries = entries.slice(-100);
    localStorage.setItem(ck, JSON.stringify(entries));
  } catch(e) {}

  // Hide buttons, show thanks
  var btns = document.getElementById('confidence-buttons');
  var thanks = document.getElementById('confidence-thanks');
  if (btns) btns.style.display = 'none';
  if (thanks) thanks.style.display = 'block';
}

function zirakResetConfidenceButtons() {
  var btns = document.getElementById('confidence-buttons');
  var thanks = document.getElementById('confidence-thanks');
  if (btns) btns.style.display = 'flex';
  if (thanks) thanks.style.display = 'none';
}

function pdRenderConfidence() {
  var el = document.getElementById('pd-confidence');
  if (!el) return;
  try {
    var raw = localStorage.getItem(window.ZirakStorageKey ? window.ZirakStorageKey('zirak_confidence') : 'zirak_confidence');
    var entries = raw ? JSON.parse(raw) : [];
    if (!entries.length) {
      el.innerHTML = '<div style="color:var(--text-muted);font-size:14px;text-align:center;padding:14px 0;">No confidence ratings yet.<br><span class="dari" style="font-size:13px;">لا ارزونه نه ده شوې.</span></div>';
      return;
    }
    var total = entries.length;
    var easy  = entries.filter(function(e) { return e.confidence === 'easy'; }).length;
    var ok    = entries.filter(function(e) { return e.confidence === 'ok'; }).length;
    var hard  = entries.filter(function(e) { return e.confidence === 'hard'; }).length;
    var pEasy = Math.round((easy / total) * 100);
    var pOk   = Math.round((ok   / total) * 100);
    var pHard = Math.round((hard / total) * 100);

    function bar(pct, color, label, emoji) {
      return '<div style="margin-bottom:8px;">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:3px;">' +
          '<span>' + emoji + ' ' + label + '</span><span>' + pct + '%</span>' +
        '</div>' +
        '<div style="background:var(--border);border-radius:4px;height:8px;overflow:hidden;">' +
          '<div style="width:' + pct + '%;background:' + color + ';height:8px;border-radius:4px;transition:width 0.4s;"></div>' +
        '</div>' +
      '</div>';
    }
    el.innerHTML =
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">' + total + ' rating' + (total===1?'':'s') + ' total</div>' +
      bar(pEasy, 'var(--emerald)', 'Easy',  '😊') +
      bar(pOk,   'var(--gold)',    'OK',    '😐') +
      bar(pHard, 'var(--red)',     'Hard',  '😰');
  } catch(e) {
    el.innerHTML = '<div style="color:var(--text-muted);padding:12px;">Error loading confidence data.</div>';
  }
}

// ---------------------------------------------------------------
// FEATURE 5 — SCORE TREND CHART (pure SVG)
// ---------------------------------------------------------------
function pdRenderScoreChart() {
  var el = document.getElementById('pd-score-chart');
  if (!el) return;
  try {
    var entries = (state.history || [])
      .filter(function(h) { return typeof h.score === 'number' && !isNaN(h.score); })
      .slice(-14);

    if (entries.length < 2) {
      el.innerHTML =
        '<div style="text-align:center;padding:18px 0;">' +
          '<div style="font-size:14px;color:var(--text-muted);">Practice more to see your trend.</div>' +
          '<div class="dari" style="font-size:13px;color:var(--text-muted);margin-top:4px;">نور تمرین وکړئ تر څو د نمرو بهیر ووینئ.</div>' +
        '</div>';
      return;
    }

    var n = entries.length;
    var pts = entries.map(function(h, i) {
      var x = (i / (n - 1)) * 280 + 10;
      var y = 90 - (Math.min(100, Math.max(0, h.score)) / 100) * 80;
      return { x: x, y: y, score: h.score };
    });

    var polyline = pts.map(function(p) { return p.x + ',' + p.y; }).join(' ');
    var circles  = pts.map(function(p) {
      var col = p.score >= 70 ? 'var(--emerald)' : p.score >= 40 ? 'var(--gold)' : 'var(--red)';
      return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="' + col + '" stroke="var(--bg-card)" stroke-width="1.5">' +
        '<title>' + p.score + '%</title>' +
      '</circle>';
    }).join('');

    // guide lines y: 70% → y=90-(70/100)*80=34   40% → y=90-(40/100)*80=58
    var y70 = 90 - 0.7 * 80;  // 34
    var y40 = 90 - 0.4 * 80;  // 58

    var svg =
      '<svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block;">' +
        // baseline
        '<line x1="10" y1="90" x2="290" y2="90" stroke="var(--border)" stroke-width="1"/>' +
        // 70% guide (emerald)
        '<line x1="10" y1="' + y70 + '" x2="290" y2="' + y70 + '" stroke="var(--emerald)" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>' +
        '<text x="292" y="' + (y70 + 4) + '" font-size="7" fill="var(--emerald)" opacity="0.8">70%</text>' +
        // 40% guide (gold)
        '<line x1="10" y1="' + y40 + '" x2="290" y2="' + y40 + '" stroke="var(--gold)" stroke-width="1" stroke-dasharray="4,3" opacity="0.6"/>' +
        '<text x="292" y="' + (y40 + 4) + '" font-size="7" fill="var(--gold)" opacity="0.8">40%</text>' +
        // line
        '<polyline points="' + polyline + '" fill="none" stroke="var(--lapis)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>' +
        // dots
        circles +
      '</svg>';

    el.innerHTML =
      '<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Last ' + n + ' sessions</div>' +
      svg;
  } catch(e) {
    el.innerHTML = '<div style="color:var(--text-muted);padding:12px;">Error rendering chart.</div>';
  }
}

// ---------------------------------------------------------------
// HOOK: extend showWordTab to handle 'mistakes' tab
// ---------------------------------------------------------------
(function() {
  var _origShowWordTab = showWordTab;
  window.showWordTab = function(tab) {
    // Handle the new tab div
    var mistakesEl = document.getElementById('wordtab-mistakes');
    if (mistakesEl) mistakesEl.style.display = tab === 'mistakes' ? 'block' : 'none';
    var mistakesPill = document.getElementById('tab-mistakes');
    if (mistakesPill) mistakesPill.classList.toggle('active', tab === 'mistakes');
    if (tab !== 'mistakes') {
      _origShowWordTab(tab);
    } else {
      // Deactivate all other tabs
      ['sets','flashcard','quiz','wizard','saved'].forEach(function(t) {
        var el = document.getElementById('wordtab-' + t);
        if (el) el.style.display = 'none';
        var pill = document.getElementById('tab-' + t);
        if (pill) pill.classList.remove('active');
      });
      zirakRenderMistakesTab();
    }
  };
})();

// ---------------------------------------------------------------
// HOOK: extend initProgress to render new v1.15B cards
// ---------------------------------------------------------------
(function() {
  var _origInitProgress = initProgress;
  window.initProgress = function() {
    _origInitProgress();
    pdRenderConfidence();
    pdRenderScoreChart();
  };
})();

// ---------------------------------------------------------------
// HOOK: extend wqAnswer to save wrong words to error bank
// ---------------------------------------------------------------
(function() {
  var _origWqAnswer = wqAnswer;
  window.wqAnswer = function(btn) {
    try {
      var answeredId = btn.getAttribute('data-id');
      var correctId  = btn.getAttribute('data-correct');
      var isCorrect  = answeredId === correctId;
      if (!isCorrect) {
        // Get current question's word id before index advances
        var q = wqState.questions[wqState.index];
        var wordId = q && q.word && q.word.id ? q.word.id : null;
        if (wordId) saveToErrorBank(wordId);
      }
    } catch(e) {}
    _origWqAnswer(btn);
  };
})();

// ---------------------------------------------------------------
// HOOK: extend showScore to reset confidence buttons
// ---------------------------------------------------------------
(function() {
  var _origShowScore = showScore;
  window.showScore = function(score, spoken, expected, contentItem) {
    _origShowScore(score, spoken, expected, contentItem);
    zirakResetConfidenceButtons();
  };
})();

// ---------------------------------------------------------------
// HOOK: extend initHome to render v1.15B home cards
// ---------------------------------------------------------------
(function() {
  var _origInitHome = initHome;
  window.initHome = function() {
    _origInitHome();
    zirakRenderTodayGoalCard();
    zirakRenderTodaySummaryCard();
  };
})();

// ===================================================================
// END v1.15B LOCAL PROGRESS FEATURES
// ===================================================================

// ===================================================================
// ===== v1.15C: SPACED REPETITION SYSTEM (SRS) =====================
// ===================================================================

// ---------------------------------------------------------------
// STORAGE HELPERS
// ---------------------------------------------------------------
function loadWordSRS() {
  try {
    var raw = localStorage.getItem(window.ZirakStorageKey ? window.ZirakStorageKey('zirak_word_srs') : 'zirak_word_srs');
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}

function saveWordSRS(srs) {
  try {
    localStorage.setItem(window.ZirakStorageKey ? window.ZirakStorageKey('zirak_word_srs') : 'zirak_word_srs', JSON.stringify(srs));
  } catch(e) {}
}

function todayDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysToDate(days) {
  var d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------
// SRS UPDATE LOGIC
// Interval ladder:
//   streak 1 → 1 day
//   streak 2 → 3 days
//   streak 3 → 7 days
//   streak 4 → 14 days
//   streak 5+ → 30 days
// ---------------------------------------------------------------
function updateWordSRS(wordId, isCorrect) {
  if (!wordId) return;
  try {
    var srs = loadWordSRS();
    var today = todayDateKey();
    var entry = srs[wordId] || { interval: 1, streak: 0, nextReview: today, lastReviewed: null };

    if (isCorrect) {
      entry.streak = (entry.streak || 0) + 1;
      var ladder = [0, 1, 3, 7, 14, 30];
      var streakCapped = Math.min(entry.streak, 5);
      entry.interval = ladder[streakCapped] || 30;
      entry.nextReview = addDaysToDate(entry.interval);
    } else {
      entry.streak = 0;
      entry.interval = 1;
      entry.nextReview = today; // due immediately
    }

    entry.lastReviewed = today;
    srs[wordId] = entry;
    saveWordSRS(srs);
  } catch(e) {}
}

// ---------------------------------------------------------------
// HOOK: extend updateWordMastery to also call updateWordSRS
// ---------------------------------------------------------------
(function() {
  var _origUpdateWordMastery = updateWordMastery;
  window.updateWordMastery = function(wordId, isCorrect, mode) {
    var result = _origUpdateWordMastery(wordId, isCorrect, mode);
    try { if (wordId) updateWordSRS(wordId, isCorrect); } catch(e) {}
    return result;
  };
})();

// ---------------------------------------------------------------
// FEATURE 2 — DUE REVIEW HELPER + HOME CARD
// ---------------------------------------------------------------
function getDueReviewWords() {
  try {
    var srs = loadWordSRS();
    var today = todayDateKey();

    // Build a flat lookup of all words by id
    var allWords = {};
    try {
      Object.values(WORD_SETS).forEach(function(ws) {
        if (ws && ws.words) {
          ws.words.forEach(function(w) { if (w && w.id) allWords[w.id] = w; });
        }
      });
    } catch(e) {}

    // Find SRS entries where nextReview <= today AND word still exists
    var due = [];
    Object.keys(srs).forEach(function(wordId) {
      var entry = srs[wordId];
      if (!entry || !entry.nextReview) return;
      if (entry.nextReview > today) return; // not yet due
      var word = allWords[wordId];
      if (!word) return; // word deleted from content — skip safely
      due.push({ word: word, srs: entry });
    });

    // Sort: overdue first (oldest nextReview first), then alphabetical
    due.sort(function(a, b) {
      if (a.srs.nextReview < b.srs.nextReview) return -1;
      if (a.srs.nextReview > b.srs.nextReview) return 1;
      return (a.word.en || '').localeCompare(b.word.en || '');
    });

    return due;
  } catch(e) { return []; }
}

function zirakRenderDueReviewCard() {
  try {
    var card = document.getElementById('home-due-review-card');
    if (!card) return;

    var due = getDueReviewWords();
    var count = due.length;

    card.style.display = 'block';

    var enEl   = document.getElementById('home-due-review-en');
    var dariEl = document.getElementById('home-due-review-dari');
    var btn    = document.getElementById('home-due-review-btn');

    if (count === 0) {
      if (enEl)   enEl.textContent   = 'All reviews clear today ✅';
      if (dariEl) dariEl.textContent = 'نن ټولې بیاکتنې بشپړې شوې ✅';
      if (btn)    btn.style.display  = 'none';
    } else {
      if (enEl)   enEl.textContent   = 'Due for Review: ' + count + ' word' + (count === 1 ? '' : 's');
      if (dariEl) dariEl.textContent = 'نن د بیاکتنې لپاره: ' + count + ' کلیمې';
      if (btn)    btn.style.display  = 'inline-block';
    }
  } catch(e) {}
}

// Called by "Review Now" button on home and can be called programmatically
function zirakOpenDueReview() {
  try {
    // Navigate to Word Lab
    navigate('wordlab');
    // Show the due review tab
    setTimeout(function() {
      showWordTab('duereview');
    }, 80);
  } catch(e) {}
}

// ---------------------------------------------------------------
// FEATURE 3 — WORD LAB DUE REVIEW TAB
// ---------------------------------------------------------------
function zirakRenderDueReviewTab() {
  var el = document.getElementById('duereview-list');
  if (!el) return;

  try {
    var due = getDueReviewWords();

    if (!due.length) {
      el.innerHTML =
        '<div style="text-align:center;padding:28px 16px;">' +
          '<div style="font-size:32px;margin-bottom:10px;">✅</div>' +
          '<div style="font-size:15px;font-weight:700;color:var(--text);">No words due today.</div>' +
          '<div class="dari" style="font-size:14px;color:var(--text-muted);margin-top:4px;">نن د بیاکتنې لپاره کومه کلیمه نشته.</div>' +
        '</div>';
      return;
    }

    // Build a quiz from the due words using the existing Smart Review pattern
    var dueWords = due.map(function(d) { return d.word; });
    var allWords = [];
    try {
      allWords = Object.values(WORD_SETS).reduce(function(acc, ws) {
        return ws && ws.words ? acc.concat(ws.words) : acc;
      }, []);
    } catch(e) {}

    // Render list with a "Start Quiz" button at top
    var listHtml = due.slice(0, 30).map(function(d) {
      var w = d.word;
      var overdueDays = 0;
      try {
        var today = todayDateKey();
        var next  = d.srs.nextReview;
        if (next < today) {
          var diff = (new Date(today) - new Date(next)) / (1000 * 60 * 60 * 24);
          overdueDays = Math.round(diff);
        }
      } catch(e2) {}

      var overdueLabel = overdueDays > 0
        ? '<span style="font-size:10px;background:rgba(220,38,38,0.12);color: var(--red-text);border-radius:8px;padding:1px 6px;margin-left:6px;">' + overdueDays + 'd overdue</span>'
        : '<span style="font-size:10px;background:rgba(245,158,11,0.15);color:var(--gold);border-radius:8px;padding:1px 6px;margin-left:6px;">due today</span>';

      var speakBtn = (typeof speak === 'function')
        ? '<button onclick="speak(\'' + (w.en || '').replace(/'/g,"\\x27") + '\',\'en\')" style="background:none;border:1px solid var(--border);border-radius:8px;padding:3px 8px;font-size:12px;cursor:pointer;color:var(--text-muted);">🔊</button>'
        : '';

      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border);">' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:15px;font-weight:700;color:var(--text);display:flex;align-items:center;flex-wrap:wrap;gap:4px;">' +
            escHtml(w.en || '') + overdueLabel +
          '</div>' +
          '<div class="dari" style="font-size:13px;color:var(--text-muted);margin-top:2px;">' + escHtml(w.dari || '') + '</div>' +
          (w.pashto ? '<div style="font-size:12px;color:var(--text-muted);margin-top:1px;">' + escHtml(w.pashto) + '</div>' : '') +
        '</div>' +
        speakBtn +
      '</div>';
    }).join('');

    var countLabel = due.length + ' word' + (due.length === 1 ? '' : 's') + ' due';

    el.innerHTML =
      '<div style="padding:12px 14px 10px;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px;">' +
          '<div>' +
            '<div style="font-size:14px;font-weight:700;color:var(--text);">🔁 ' + countLabel + ' for review</div>' +
            '<div class="dari" style="font-size:13px;color:var(--text-muted);">' + due.length + ' کلیمې د بیاکتنې لپاره</div>' +
          '</div>' +
          '<button onclick="zirakStartDueReviewQuiz()" style="background:var(--gold);color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:13px;font-weight:700;cursor:pointer;">Start Quiz ▶</button>' +
        '</div>' +
        '<div style="border-radius:12px;overflow:hidden;background:var(--bg-card);">' + listHtml + '</div>' +
        (due.length > 30 ? '<div style="font-size:12px;color:var(--text-muted);text-align:center;margin-top:8px;">Showing first 30 of ' + due.length + '</div>' : '') +
      '</div>';
  } catch(e) {
    el.innerHTML = '<div style="color:var(--text-muted);padding:16px;">Error loading due words.</div>';
  }
}

function zirakStartDueReviewQuiz() {
  try {
    var due = getDueReviewWords();
    if (!due.length) return;

    var dueWords = due.map(function(d) { return d.word; });
    var allWords = [];
    try {
      allWords = Object.values(WORD_SETS).reduce(function(acc, ws) {
        return ws && ws.words ? acc.concat(ws.words) : acc;
      }, []);
    } catch(e) {}

    // Use up to 15 due words
    var pool = dueWords.slice(0, 15);

    var questions = [];
    pool.forEach(function(word, i) {
      var wrongs = allWords
        .filter(function(w) { return w.id !== word.id; })
        .sort(function() { return Math.random() - 0.5; })
        .slice(0, 3);
      var opts = wrongs.concat([word]).sort(function() { return Math.random() - 0.5; });
      var types = [1, 2, 3];
      if (word.ex_en) types.push(4);
      var t = types[i % types.length];
      questions.push({ word: word, type: t, opts: opts });
    });

    wqState.setKey        = '__srs_due__';
    wqState.questions     = questions;
    wqState.index         = 0;
    wqState.correct       = 0;
    wqState.wrong         = 0;
    wqState.weakItems     = [];
    wqState.isRetry       = false;
    wqState.prevWeakCount = 0;

    // Switch to Quiz tab and show quiz area
    showWordTab('quiz');
    document.getElementById('quiz-set-selector').style.display = 'none';
    var qa = document.getElementById('quiz-area');
    if (qa) { qa.style.display = 'block'; qa.innerHTML = ''; }
    wqRenderQuestion();
  } catch(e) {
    console.warn('[SRS] Error starting due review quiz:', e);
  }
}

// ---------------------------------------------------------------
// HOOK: extend showWordTab to handle 'duereview' tab
// ---------------------------------------------------------------
(function() {
  var _prevShowWordTab = showWordTab;
  window.showWordTab = function(tab) {
    var drEl   = document.getElementById('wordtab-duereview');
    var drPill = document.getElementById('tab-duereview');

    if (drEl)   drEl.style.display   = (tab === 'duereview') ? 'block' : 'none';
    if (drPill) drPill.classList.toggle('active', tab === 'duereview');

    if (tab === 'duereview') {
      // Deactivate all other tabs
      ['sets','flashcard','quiz','wizard','saved','mistakes'].forEach(function(t) {
        var el   = document.getElementById('wordtab-' + t);
        var pill = document.getElementById('tab-' + t);
        if (el)   el.style.display = 'none';
        if (pill) pill.classList.remove('active');
      });
      zirakRenderDueReviewTab();
    } else {
      _prevShowWordTab(tab);
    }
  };
})();

// ---------------------------------------------------------------
// HOOK: extend initHome to render the due review card
// ---------------------------------------------------------------
(function() {
  var _prevInitHome = initHome;
  window.initHome = function() {
    _prevInitHome();
    zirakRenderDueReviewCard();
  };
})();

// ===================================================================
// END v1.15C SRS
// ===================================================================

// ===================================================================
// ===== v1.15D FEATURE 1: HOME HERO SLIDESHOW ======================
// ===================================================================
(function() {
  'use strict';

  var SLIDES = [
    {
      img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
      title: 'Learn English Every Day',
      dari: 'هره ورځ انګلیسي زده کړئ',
      sub: 'Start your journey with Zirak'
    },
    {
      img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
      title: 'Children Learn Fast',
      dari: 'ماشومان ژر زده کوي',
      sub: 'Fun lessons made for every age'
    },
    {
      img: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&q=80',
      title: 'Listen & Understand',
      dari: 'واورئ او پوه شئ',
      sub: 'Train your ear with real English audio'
    },
    {
      img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
      title: 'Speak With Confidence',
      dari: 'په باور خبرې وکړئ',
      sub: 'Practice speaking with instant feedback'
    },
    {
      img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
      title: 'Study at Home',
      dari: 'په کور کې مطالعه وکړئ',
      sub: 'Learn anytime, anywhere — fully offline'
    },
    {
      img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
      title: 'Classroom English',
      dari: 'د ټولګي انګلیسي',
      sub: 'Master vocabulary for school and work'
    },
    {
      img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
      title: 'Read & Understand',
      dari: 'ولولئ او پوه شئ',
      sub: 'Improve reading with guided passages'
    },
    {
      img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      title: 'Perfect Your Pronunciation',
      dari: 'خپل تلفظ ښه کړئ',
      sub: 'Speak clearly with phonics practice'
    },
    {
      img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      title: 'Track Your Progress',
      dari: 'خپل پرمختګ وګورئ',
      sub: 'See your scores grow every day'
    },
    {
      img: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&q=80',
      title: 'Family Learning Together',
      dari: 'کورنۍ یوځای زده کړه کوي',
      sub: 'Support each other on the path to English'
    },
    {
      img: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&q=80',
      title: 'Tablet Learning for Children',
      dari: 'د ماشومانو لپاره ټابلیټ زده کړه',
      sub: 'Interactive English lessons on any device'
    },
    {
      img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
      title: 'Your Personal English Guide',
      dari: 'ستاسو شخصي انګلیسي لارښود',
      sub: 'Zirak guides you step by step like a patient teacher'
    },
    {
      img: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&q=80',
      title: 'Answer and Improve',
      dari: 'ځواب ورکړئ او ښه شئ',
      sub: 'Speaking practice with instant scoring and correction'
    },
    {
      img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      title: 'Learn on iPad or Phone',
      dari: 'په آیپډ یا ټیلیفون کې زده کړه وکړئ',
      sub: 'Zirak works offline — learn anywhere, no internet needed'
    },
    {
      img: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80',
      title: 'Classroom Success Starts Here',
      dari: 'د ټولګي بریا له دې ځایه پیلېږي',
      sub: 'Build English skills that help you in school and beyond'
    }
  ];

  var _current  = 0;
  var _total    = SLIDES.length;
  var _timer    = null;
  var _touching = false;
  var _touchStartX = 0;
  var _trackW   = 0;

  function buildSlideshow() {
    var outer = document.getElementById('hero-slideshow-outer');
    var track = document.getElementById('hero-slide-track');
    var dots  = document.getElementById('hero-slide-dots');
    if (!outer || !track || !dots) return;

    _trackW = outer.offsetWidth || 360;

    // Build slides
    track.innerHTML = '';
    SLIDES.forEach(function(s, i) {
      var slide = document.createElement('div');
      slide.style.cssText = 'position:relative;flex:0 0 ' + _trackW + 'px;width:' + _trackW + 'px;height:200px;overflow:hidden;';

      // Gradient fallback always behind image
      slide.innerHTML =
        '<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a3a6b 0%,#2e6b8a 100%);"></div>' +
        '<img src="' + s.img + '" alt="' + escHtml(s.title) + '" ' +
          'style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" ' +
          'onerror="this.style.display=\'none\'" loading="lazy">' +
        '<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.10) 55%,transparent 100%);"></div>' +
        '<div style="position:absolute;bottom:28px;left:14px;right:14px;">' +
          '<div style="font-size:17px;font-weight:800;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.7);line-height:1.2;">' + escHtml(s.title) + '</div>' +
          '<div style="font-size:13px;color:rgba(255,255,255,0.88);margin-top:2px;font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,0.6);" class="dari">' + escHtml(s.dari) + '</div>' +
          '<div style="font-size:12px;color:rgba(255,255,255,0.72);margin-top:3px;">' + escHtml(s.sub) + '</div>' +
        '</div>';

      track.appendChild(slide);
    });

    // Build dots
    dots.innerHTML = '';
    SLIDES.forEach(function(_, i) {
      var dot = document.createElement('div');
      dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,' + (i === 0 ? '1' : '0.45') + ');cursor:pointer;transition:background 0.25s;';
      dot.addEventListener('click', function() { goToSlide(i); restartTimer(); });
      dots.appendChild(dot);
    });

    goToSlide(0);
    addTouchListeners(track, outer);
    startTimer();
  }

  function goToSlide(idx) {
    _current = (idx + _total) % _total;
    var track = document.getElementById('hero-slide-track');
    if (track) track.style.transform = 'translateX(-' + (_current * _trackW) + 'px)';
    var dots = document.getElementById('hero-slide-dots');
    if (dots) {
      Array.from(dots.children).forEach(function(d, i) {
        d.style.background = i === _current ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.45)';
      });
    }
  }

  function startTimer() {
    clearInterval(_timer);
    _timer = setInterval(function() {
      if (!_touching) goToSlide(_current + 1);
    }, 4500);
  }

  function restartTimer() { startTimer(); }

  function addTouchListeners(track, outer) {
    outer.addEventListener('touchstart', function(e) {
      _touching = true;
      _touchStartX = e.touches[0].clientX;
    }, { passive: true });

    outer.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - _touchStartX;
      if (Math.abs(dx) > 40) {
        goToSlide(dx < 0 ? _current + 1 : _current - 1);
        restartTimer();
      }
      setTimeout(function() { _touching = false; }, 200);
    }, { passive: true });
  }

  // Init after DOM ready
  function initHeroSlideshow() {
    buildSlideshow();
    // Rebuild on resize so widths stay correct
    var _resizeTO;
    window.addEventListener('resize', function() {
      clearTimeout(_resizeTO);
      _resizeTO = setTimeout(buildSlideshow, 200);
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSlideshow);
  } else {
    // Small delay so layout has settled
    setTimeout(initHeroSlideshow, 60);
  }

  window.zirakRebuildSlideshow = buildSlideshow;
})();


// ===================================================================
// ===== v1.15D FEATURE 2: MIC / TTS ANTI-CHEAT GUARD ==============
// ===================================================================
// v1.15G: Expose native speechSynthesis.speak BEFORE global patch
// so _wwPlayModel bypasses the wrapper and auto-restart is not blocked.
if (!window.__zirakNativeSpeak) {
  window.__zirakNativeSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
}

(function() {
  'use strict';

  // ---------------------------------------------------------------
  // Global guard state
  // ---------------------------------------------------------------
  window.zirakIsTtsSpeaking          = false;
  window.zirakRecognitionBlockedUntil = 0;      // timestamp ms
  window.zirakTtsSafetyDelayMs       = 1200;

  // ---------------------------------------------------------------
  // Abort recognition safely before global TTS plays
  // v1.15G: WW manages its own mic via listenToken — do NOT abort WW here.
  // ---------------------------------------------------------------
  window.zirakAbortRecognitionForTTS = function() {
    try {
      // Main dialogue / listening recognition only
      if (state.recognition) {
        try { state.recognition.abort(); } catch(e) {}
        state.recognition = null;
      }
    } catch(e) {}
    try {
      // Phonics/PE recognition
      if (window.peState && peState.recognition) {
        try { peState.recognition.abort(); } catch(e) {}
        peState.recognition = null;
      }
    } catch(e) {}
    // Reset main UI mic button (not WW mic — WW resets its own)
    try { resetMicBtn(); } catch(e) {}
    try {
      if (state) { state.isListening = false; state.transcript = ''; }
    } catch(e) {}
  };

  // ---------------------------------------------------------------
  // Check if TTS or safety window is active — used by startSpeech
  // ---------------------------------------------------------------
  window.zirakIsTtsBlocking = function() {
    return window.zirakIsTtsSpeaking || (Date.now() < window.zirakRecognitionBlockedUntil);
  };

  // ---------------------------------------------------------------
  // Replace the central speak() with the guarded version
  // ---------------------------------------------------------------
  var _originalSpeak = window.speak;
  window.speak = function(text, lang) {
    if (!text || !window.speechSynthesis) return;
    lang = lang || 'en';

    // 1. Abort any active recognition
    zirakAbortRecognitionForTTS();

    // 2. Set TTS-speaking guard
    window.zirakIsTtsSpeaking = true;
    window.zirakRecognitionBlockedUntil = Date.now() + 60000; // will be corrected on onend

    // 3. Cancel any previous utterance
    window.speechSynthesis.cancel();
    document.querySelectorAll('.speak-btn.speaking').forEach(function(b) { b.classList.remove('speaking'); });

    var utter = new SpeechSynthesisUtterance(text);
    utter.lang  = lang === 'en' ? 'en-US' : 'ps-AF';
    utter.rate  = (window.state && state.speechRate) ? state.speechRate : 1;

    utter.onend = function() {
      document.querySelectorAll('.speak-btn.speaking').forEach(function(b) { b.classList.remove('speaking'); });
      window.zirakIsTtsSpeaking = false;
      window.zirakRecognitionBlockedUntil = Date.now() + window.zirakTtsSafetyDelayMs;
    };
    utter.onerror = function() {
      window.zirakIsTtsSpeaking = false;
      window.zirakRecognitionBlockedUntil = Date.now() + window.zirakTtsSafetyDelayMs;
    };

    window.speechSynthesis.speak(utter);
  };

  // ---------------------------------------------------------------
  // Wrap all bare speechSynthesis.speak() calls with guard
  // We patch the global speechSynthesis.speak to always set guard
  // ---------------------------------------------------------------
  var _nativeSSSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
  window.speechSynthesis.speak = function(utter) {
    // Set guard whenever TTS fires, even from internal calls
    zirakAbortRecognitionForTTS();
    window.zirakIsTtsSpeaking = true;
    window.zirakRecognitionBlockedUntil = Date.now() + 60000;

    var _origOnEnd   = utter.onend;
    var _origOnError = utter.onerror;

    utter.onend = function(e) {
      window.zirakIsTtsSpeaking = false;
      window.zirakRecognitionBlockedUntil = Date.now() + window.zirakTtsSafetyDelayMs;
      if (typeof _origOnEnd === 'function') _origOnEnd(e);
    };
    utter.onerror = function(e) {
      window.zirakIsTtsSpeaking = false;
      window.zirakRecognitionBlockedUntil = Date.now() + window.zirakTtsSafetyDelayMs;
      if (typeof _origOnError === 'function') _origOnError(e);
    };

    _nativeSSSpeak(utter);
  };

  // ---------------------------------------------------------------
  // Patch startSpeech() to refuse if TTS is blocking
  // ---------------------------------------------------------------
  var _origStartSpeech = window.startSpeech;
  window.startSpeech = function() {
    if (zirakIsTtsBlocking()) {
      var st  = document.getElementById('speech-status');
      var std = document.getElementById('speech-status-dari');
      if (st)  st.textContent  = 'Please wait until the app finishes speaking.';
      if (std) std.textContent = 'مهرباني وکړئ صبر وکړئ تر څو اپ خپله وینا پای ته ورسوي.';
      return; // block mic start
    }
    _origStartSpeech();
  };

  // ---------------------------------------------------------------
  // Patch recognition onresult handlers via state guard:
  // Inject a check inside the existing state.recognition logic by
  // monkey-patching the scoreAnswer and scoreListenRepeat functions.
  // ---------------------------------------------------------------
  var _origScoreAnswer = window.scoreAnswer;
  if (typeof _origScoreAnswer === 'function') {
    window.scoreAnswer = function() {
      if (zirakIsTtsBlocking()) return; // ignore — TTS may have caused this
      _origScoreAnswer();
    };
  }

  var _origScoreListenRepeat = window.scoreListenRepeat;
  if (typeof _origScoreListenRepeat === 'function') {
    window.scoreListenRepeat = function() {
      if (zirakIsTtsBlocking()) return;
      _origScoreListenRepeat();
    };
  }

  // v1.15G: wwStartSpeech patch REMOVED — WW now self-manages via
  // listenToken + audioGuardActive inside wwStartSpeech itself.

  var _origPeStartSpeech = window.peStartSpeech;
  if (typeof _origPeStartSpeech === 'function') {
    window.peStartSpeech = function() {
      if (zirakIsTtsBlocking()) {
        var st = document.getElementById('pe-status');
        if (st) st.textContent = '🔇 Please wait until the app finishes speaking.';
        setTimeout(function() { if (st) st.textContent = ''; }, 2500);
        return;
      }
      _origPeStartSpeech();
    };
  }

  // ---------------------------------------------------------------
  // v1.15E: Also patch dictationMicSpeak to block during TTS
  // ---------------------------------------------------------------
  var _origDictationMic = window.dictationMicSpeak;
  if (typeof _origDictationMic === 'function') {
    window.dictationMicSpeak = function() {
      if (zirakIsTtsBlocking()) {
        var statusEl = document.getElementById('dictation-mic-status');
        if (statusEl) statusEl.textContent = '🔇 Wait — the app is still speaking. Try again in a moment.';
        setTimeout(function() { if (statusEl) statusEl.textContent = ''; }, 2500);
        return;
      }
      _origDictationMic();
    };
  }

  // v1.15G: wwScoreCurrentItem guard removed — WW uses listenToken internally.

  // v1.15E: Guard peScore
  var _origPeScore = window.peScore;
  if (typeof _origPeScore === 'function') {
    window.peScore = function() {
      if (zirakIsTtsBlocking()) return;
      _origPeScore.apply(this, arguments);
    };
  }

  // ---------------------------------------------------------------
  // Increase safety delay from 800ms to 1200ms for better protection
  // on slow Android devices where TTS audio lingers
  // ---------------------------------------------------------------
  window.zirakTtsSafetyDelayMs = 1200;

  console.log('[v1.15E] MIC/TTS anti-cheat guard active — global speaking polish.');
})();


// ===================================================================
// ===== v1.15E VERSION UPDATE ======================================
// ===================================================================
// APP_CACHE and CACHE_NAME updated in their declarations above.
// ===================================================================
// END v1.15E
// ===================================================================

/* ============================================================================
   PHASE I6H-B — ZirakResultProof
   Central WhatsApp result proof helper shared by all practice/result screens.
   Any flow can call window.ZirakResultProof.openWA(sectionName, good, total)
   or insert the button via renderButtonHtml() without creating a second system.
   ============================================================================ */
window.ZirakResultProof = (function () {

  function getProfile() {
    // Try ZirakProfile first (newer namespace)
    try {
      var p = (typeof window.ZirakProfile !== 'undefined' && typeof window.ZirakProfile.getActive === 'function')
        ? window.ZirakProfile.getActive() : null;
      if (p && (p.fatherWhatsApp || p.fullName)) return { wa: (p.fatherWhatsApp||'').replace(/[^0-9]/g,''), name: p.fullName||'' };
    } catch (e) {}
    // Try loadParentProfile (app.js pattern)
    try {
      var lp = (typeof loadParentProfile === 'function') ? loadParentProfile() : null;
      if (lp) return { wa: (lp.fatherWA||'').replace(/[^0-9]/g,''), name: lp.studentName||'' };
    } catch (e) {}
    // Try zirakActiveStudentName
    try {
      var who = (typeof window.zirakActiveStudentName === 'function') ? window.zirakActiveStudentName() : null;
      if (who && who.hasStudent) return { wa: '', name: who.firstName||'' };
    } catch (e) {}
    return { wa: '', name: '' };
  }

  function buildMessage(sectionName, good, total) {
    var p = getProfile();
    var pct = total > 0 ? Math.round((good / total) * 100) : 0;
    var status = pct >= 80 ? 'Excellent ✅'
               : pct >= 60 ? 'Passed Strongly ✅'
               : pct >= 40 ? 'Passed, Needs Review 🔁'
               : 'Repeat Weak Parts ❌';
    var dateStr = new Date().toLocaleString();
    return '\uD83C\uDF93 *Zirak English Academy \u2014 Practice Report*\n' +
      (p.name ? 'Student: ' + p.name + '\n' : '') +
      'Section: ' + sectionName + '\n' +
      'Score: ' + good + ' / ' + total + ' (' + pct + '%) \u2014 ' + status + '\n' +
      'Date: ' + dateStr + '\n\n' +
      (pct >= 60
        ? 'Great effort! Keep practising daily.'
        : 'Please encourage the student to repeat this section.') + '\n\n' +
      'Sent via Zirak English App \uD83C\uDF1F';
  }

  function openWA(sectionName, good, total, noticeId, customText) {
    var p = getProfile();
    // I6H-D6: optional richer message override. Backward-compatible — every
    // existing caller omits the 5th argument and gets the exact same
    // auto-built message as before. Still ONE WhatsApp system either way.
    var msg = customText || buildMessage(sectionName, good, total);
    var encoded = encodeURIComponent(msg);
    var url = p.wa
      ? 'https://wa.me/' + p.wa + '?text=' + encoded
      : 'https://wa.me/?text=' + encoded;
    if (!p.wa && noticeId) {
      var el = document.getElementById(noticeId);
      if (el) { el.style.display = 'block'; setTimeout(function(){ el.style.display='none'; }, 4500); }
    }
    try { window.open(url, '_blank'); } catch (e) {}
  }

  /* I6H-B1 FIX — safe proof button. The old version injected
     JSON.stringify(section) (double quotes) inside a double-quoted inline
     onclick attribute, which truncated the attribute and broke the click.
     Now: report payloads live in _reports[id]; the button carries ONLY a
     safe generated data-proof-id; ONE delegated document click listener
     serves every proof button, including HTML injected later. */
  var _reports = {};
  var _seq = 0;
  function renderButtonHtml(sectionName, good, total, opts) {
    // opts.skipLedger = true → WhatsApp button only; no ledger record.
    // Used by Daily Academy Test which saves its own richer stable record.
    opts = opts || {};
    _seq++;
    var id = 'zrp-' + Date.now().toString(36) + '-' + _seq;
    _reports[id] = { section: String(sectionName || 'Practice'), good: good || 0, total: total || 0, customText: opts.customText || '' };
    // I6H-C: record the completed result into the ONE Learning Ledger.
    // I6H-D1: guarded by opts.skipLedger so Daily Academy Test (which saves
    // its own richer stable record via saveDailyTestToLedger) does not create
    // a second generic record here.
    if (!opts.skipLedger) {
      try {
        if (window.ZirakLearningLedger) {
          window.ZirakLearningLedger.recordActivity({
            sectionTitle: String(sectionName || 'Practice'),
            good: good || 0, total: total || 0,
            activityType: 'practice-result',
            // I6H-D13B: additive fields (Task 9) — enables the Personalized
            // Learning Plan's strict evidence matcher to verify BOTH the
            // exact source AND the exact content ID, never a generic
            // "any practice-result" match. Empty string when a caller
            // does not pass them, exactly as before this change.
            source: opts.source || '',
            contentId: opts.contentId || ''
          });
        }
      } catch (eLlg) {}
    }
    var noticeId = 'zrp-notice-' + id;
    return '<div class="zrp-wrap">' +
      '<button type="button" class="zrp-wa-btn" data-proof-id="' + id + '" data-notice-id="' + noticeId + '">' +
        '\uD83D\uDCF2 Send Result to Father (WhatsApp)' +
      '</button>' +
      '<div id="' + noticeId + '" class="zrp-wa-notice" style="display:none;">' +
        'Father WhatsApp number is not set in the student profile. You can still share manually.' +
      '</div>' +
    '</div>';
  }
  // ONE delegated listener for ALL proof buttons (safe for injected HTML).
  document.addEventListener('click', function (e) {
    var t = e.target;
    var btn = (t && t.closest) ? t.closest('.zrp-wa-btn') : null;
    if (!btn) return;
    var id = btn.getAttribute('data-proof-id');
    var r = id ? _reports[id] : null;
    if (!r) return;
    openWA(r.section, r.good, r.total, btn.getAttribute('data-notice-id'), r.customText);
  });

  return { getProfile: getProfile, buildMessage: buildMessage, openWA: openWA, renderButtonHtml: renderButtonHtml, _reports: _reports };
})();
