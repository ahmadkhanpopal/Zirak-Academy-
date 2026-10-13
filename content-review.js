// ===================================================================
// ZIRAK APP — content-review.js
// Version: v1.13A — Content Architecture Foundation
// ===================================================================
//
// PURPOSE:
//   Review-related data: weak-item review pools, mastery label text,
//   achievement text, phonics/minimal pair metadata, and report labels.
//
// LOAD ORDER:
//   Load AFTER content-core.js, BEFORE content.js and app.js.
//
// IMPORTANT:
//   This file does NOT replace the existing MILESTONES, SOUND_PAIRS,
//   or LISTEN_SENTENCES globals used by app.js. Those remain in
//   content.js unchanged.
//   This file provides the architecture schema and small foundation
//   samples for FUTURE review/mastery/achievement expansion.
//
// LANGUAGE RULE:
//   All label/text fields support Pashto variants.
//   Pashto is NOT a UI language — it is a content support field.
//
// ===================================================================

// -------------------------------------------------------------------
// ZIRAK_MASTERY_LABELS — mastery level label text
// These can be used in future UI improvements or achievement reports.
// Extended with Pashto for bilingual report cards.
// -------------------------------------------------------------------
var ZIRAK_MASTERY_LABELS = [
  {
    id:         'not-started',
    en:         'Not Started',
    dari:       '',
    pashto:     'پیل نه دی شوی',
    icon:       '⬜',
    threshold:  0
  },
  {
    id:         'learning',
    en:         'Learning',
    dari:       '',
    pashto:     'د زده کړو پر مهال',
    icon:       '📘',
    threshold:  1
  },
  {
    id:         'developing',
    en:         'Developing',
    dari:       '',
    pashto:     'وده کوي',
    icon:       '📗',
    threshold:  3
  },
  {
    id:         'confident',
    en:         'Confident',
    dari:       '',
    pashto:     'د باور سره',
    icon:       '⭐',
    threshold:  5
  },
  {
    id:         'mastered',
    en:         'Mastered',
    dari:       '',
    pashto:     'مهارت لري',
    icon:       '🏅',
    threshold:  8
  }
];

// -------------------------------------------------------------------
// ZIRAK_ACHIEVEMENT_TEXT — extended achievement/milestone text
// Supports bilingual labels in Pashto.
// These complement (do not replace) the existing MILESTONES in content.js.
// -------------------------------------------------------------------
var ZIRAK_ACHIEVEMENT_TEXT = [

  // --- Foundation samples ---
  {
    id:      'ach_first_word',
    en:      'First Word Learned!',
    dari:    '',
    pashto:  'لومړی کلیمه زده شوه!',
    icon:    '🌟',
    type:    'vocabulary'
  },
  {
    id:      'ach_streak_3',
    en:      '3-Day Practice Streak',
    dari:    '',
    pashto:  '۳ ورځې سلسله لرونکې تمرین',
    icon:    '🔥',
    type:    'streak'
  },
  {
    id:      'ach_dialogue_complete',
    en:      'First Dialogue Complete',
    dari:    '',
    pashto:  'لومړی خبرې اترې بشپړه شوه',
    icon:    '💬',
    type:    'dialogue'
  },
  {
    id:      'ach_quiz_pass',
    en:      'First Quiz Passed',
    dari:    '',
    pashto:  'لومړنی ازموینه پاس شوه',
    icon:    '✅',
    type:    'quiz'
  },
  {
    id:      'ach_grammar_card',
    en:      'First Grammar Card Studied',
    dari:    '',
    pashto:  'لومړی د ګرامر کارت وکتل شو',
    icon:    '📖',
    type:    'grammar'
  }

  // Add future achievements here.
  // Include dari and pashto fields for bilingual report/display.
];

// -------------------------------------------------------------------
// ZIRAK_PHONICS_SCHEMA — documentation of the phonics/minimal pair schema
// The existing SOUND_PAIRS in content.js use a slightly different shape.
// This schema shows how future phonics items can include Pashto tips.
// -------------------------------------------------------------------
var ZIRAK_PHONICS_SCHEMA = {
  pair:         'string — e.g. "v / w"',
  example_v:    'string — examples of first sound',
  example_w:    'string — examples of second sound',
  tip:          'string — English tip',
  dari_tip:     '',
  pashto_tip:   'string — Pashto tip (new support field)'
};

// -------------------------------------------------------------------
// ZIRAK_REPORT_LABELS — bilingual label text for parent/weekly reports
// Dari labels already exist in app logic; Pashto is new here.
// -------------------------------------------------------------------
var ZIRAK_REPORT_LABELS = {
  weeklyReport: {
    en:     'Weekly Progress Report',
    dari:   '',
    pashto: 'اونۍ پرمختګ راپور'
  },
  practiceMinutes: {
    en:     'Practice minutes this week',
    dari:   '',
    pashto: 'دا اونۍ د تمرین دقیقې'
  },
  wordsLearned: {
    en:     'Words learned',
    dari:   '',
    pashto: 'زده شوي کلیمې'
  },
  currentLevel: {
    en:     'Current level',
    dari:   '',
    pashto: 'اوسنی کچه'
  },
  masteryScore: {
    en:     'Mastery score',
    dari:   '',
    pashto: 'د مهارت نمره'
  }
};

// -------------------------------------------------------------------
// Register this module with the core registry
// -------------------------------------------------------------------
if (typeof zirakRegisterContent === 'function') {
  zirakRegisterContent('review', {
    masteryLabels:    ZIRAK_MASTERY_LABELS,
    achievementText:  ZIRAK_ACHIEVEMENT_TEXT,
    reportLabels:     ZIRAK_REPORT_LABELS
  });
}

// ===================================================================
// END content-review.js
// ===================================================================
