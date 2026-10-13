// ===================================================================
// ZIRAK APP — content-wordlab.js
// Version: v1.13A — Content Architecture Foundation
// ===================================================================
//
// PURPOSE:
//   Word Lab vocabulary data: words, word sets, example sentences,
//   pronunciation hints, and bilingual meaning support.
//
// LOAD ORDER:
//   Load AFTER content-core.js, BEFORE content.js and app.js.
//
// IMPORTANT:
//   This file does NOT replace the existing WORD_SETS or WORD_OF_DAY
//   globals used by app.js. Those remain in content.js unchanged.
//   This file defines the architecture for FUTURE vocabulary expansion
//   using the richer schema that supports Pashto meanings.
//
// LANGUAGE RULE:
//   - english       : main learning word/phrase
//   - meaningDari   : legacy support meaning (support field)
//   - meaningPashto : Pashto meaning (support field)
//   Pashto is NOT a UI language. It is a content meaning/support field.
//
// HOW TO ADD FUTURE CONTENT:
//   Add new word items to ZIRAK_WORDLAB_WORDS following the schema.
//   Add new sets to ZIRAK_WORDLAB_SETS.
//   Do NOT rename or remove existing WORD_SETS in content.js — app.js
//   still depends on those. New content goes here, in ZIRAK_WORDLAB_*.
//
// ===================================================================

// -------------------------------------------------------------------
// ZIRAK_WORDLAB_SCHEMA — documentation of the supported word fields
// (This is reference only — not used by app.js directly.)
// -------------------------------------------------------------------
var ZIRAK_WORDLAB_SCHEMA = {
  id:              'string  — unique word ID e.g. "word_001"',
  level:           'string  — level ID from ZIRAK_LEVELS',
  category:        'string  — category ID from ZIRAK_CATEGORIES',
  english:         'string  — main English word or phrase',
  pronunciation:   'string  — IPA or phonetic hint (optional)',
  pos:             'string  — part of speech: noun, verb, adj, adv ...',
  meaningDari:     '',
  meaningPashto:   'string  — Pashto meaning or translation',
  exampleEnglish:  'string  — example sentence in English',
  exampleDari:     '',
  examplePashto:   'string  — example sentence in Pashto',
  tags:            'array   — content tags from ZIRAK_TAGS'
};

// -------------------------------------------------------------------
// ZIRAK_WORDLAB_WORDS — foundation sample words
// A small set of sample items to prove the architecture works.
// Future content expansion should add items here.
// These use the full schema with Pashto meaning fields.
//
// NOTE: These are SAMPLE items — clearly marked.
// Do NOT add hundreds of words here yet. This version is architecture only.
// -------------------------------------------------------------------
var ZIRAK_WORDLAB_WORDS = [

  // --- SAMPLE: Kids / School category ---
  {
    id:             'wl_001',
    level:          'kids',
    category:       'school',
    english:        'book',
    pronunciation:  'bʊk',
    pos:            'noun',
    meaningDari:    '',
    meaningPashto:  'کتاب',
    exampleEnglish: 'This is my book.',
    exampleDari:    '',
    examplePashto:  'دا زما کتاب دی.',
    tags:           ['vocabulary', 'school', 'noun']
  },
  {
    id:             'wl_002',
    level:          'kids',
    category:       'school',
    english:        'pen',
    pronunciation:  'pɛn',
    pos:            'noun',
    meaningDari:    '',
    meaningPashto:  'قلم',
    exampleEnglish: 'I write with my pen.',
    exampleDari:    '',
    examplePashto:  'زه د خپل قلم سره لیکم.',
    tags:           ['vocabulary', 'school', 'noun']
  },

  // --- SAMPLE: Kids / Daily Life ---
  {
    id:             'wl_003',
    level:          'kids',
    category:       'daily-life',
    english:        'water',
    pronunciation:  'ˈwɔːtər',
    pos:            'noun',
    meaningDari:    '',
    meaningPashto:  'اوبه',
    exampleEnglish: 'I drink water every day.',
    exampleDari:    '',
    examplePashto:  'زه هره ورځ اوبه څښم.',
    tags:           ['vocabulary', 'daily-life', 'noun']
  },

  // --- SAMPLE: Beginner / Family ---
  {
    id:             'wl_004',
    level:          'beginner',
    category:       'family',
    english:        'mother',
    pronunciation:  'ˈmʌðər',
    pos:            'noun',
    meaningDari:    '',
    meaningPashto:  'مور',
    exampleEnglish: 'My mother is kind.',
    exampleDari:    '',
    examplePashto:  'زما مور مهربانه ده.',
    tags:           ['vocabulary', 'family', 'noun']
  },
  {
    id:             'wl_005',
    level:          'beginner',
    category:       'family',
    english:        'father',
    pronunciation:  'ˈfɑːðər',
    pos:            'noun',
    meaningDari:    '',
    meaningPashto:  'پلار',
    exampleEnglish: 'My father works hard.',
    exampleDari:    '',
    examplePashto:  'زما پلار سخت کار کوي.',
    tags:           ['vocabulary', 'family', 'noun']
  },

  // --- SAMPLE: Elementary / Health ---
  {
    id:             'wl_006',
    level:          'elementary',
    category:       'health',
    english:        'doctor',
    pronunciation:  'ˈdɒktər',
    pos:            'noun',
    meaningDari:    '',
    meaningPashto:  'ډاکټر',
    exampleEnglish: 'The doctor helps sick people.',
    exampleDari:    '',
    examplePashto:  'ډاکټر ناروغو خلکو سره مرسته کوي.',
    tags:           ['vocabulary', 'health', 'noun']
  }

  // Future words should be added here, following the same schema.
  // Add Dari (meaningDari) and Pashto (meaningPashto) meaning fields.
  // Keep exampleEnglish, exampleDari, and examplePashto for each item.
];

// -------------------------------------------------------------------
// ZIRAK_WORDLAB_SETS — architecture for future named word sets
// These are separate from the existing WORD_SETS used by app.js.
// Future expansion packs go here.
// -------------------------------------------------------------------
var ZIRAK_WORDLAB_SETS = [
  // --- SAMPLE SET: placeholder ---
  {
    id:          'wl_set_school_kids',
    en:          'School — Kids',
    dari:        '',
    pashto:      'ښوونځی — ماشومان',
    level:       'kids',
    category:    'school',
    icon:        '📚',
    description: 'Basic school vocabulary for young learners.',
    wordIds:     ['wl_001', 'wl_002']
    // Future: add more word IDs as ZIRAK_WORDLAB_WORDS grows
  },
  {
    id:          'wl_set_family_beginner',
    en:          'Family — Beginner',
    dari:        '',
    pashto:      'کورنۍ — پیل کوونکی',
    level:       'beginner',
    category:    'family',
    icon:        '👨‍👩‍👧‍👦',
    description: 'Family member vocabulary for beginners.',
    wordIds:     ['wl_004', 'wl_005']
  }
];

// -------------------------------------------------------------------
// Register this module with the core registry
// -------------------------------------------------------------------
if (typeof zirakRegisterContent === 'function') {
  zirakRegisterContent('wordlab', {
    words: ZIRAK_WORDLAB_WORDS,
    sets:  ZIRAK_WORDLAB_SETS
  });
}

// ===================================================================
// END content-wordlab.js
// ===================================================================
