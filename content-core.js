// ===================================================================
// ZIRAK APP — content-core.js
// Version: v1.13A — Content Architecture Foundation
// ===================================================================
//
// PURPOSE:
//   Shared content helpers, registry, schemas, level/category/tag
//   metadata, and safe utility functions for all content files.
//
// LOAD ORDER:
//   This file MUST be loaded BEFORE all other content-*.js files
//   and before content.js.
//
// LANGUAGE RULE:
//   - English  : main learning language
//   - Pashto   : the only support translation field
//   - Legacy Dari fields are not learner-facing in v1.17C
//
//   Pashto is the only learner-facing support translation language.
//   Buttons and app interface remain in English.
//
// ===================================================================

// -------------------------------------------------------------------
// SCHEMA DOCUMENTATION
// -------------------------------------------------------------------
// A future vocabulary item should support these fields:
//
//   {
//     id:             "word_001",           // unique string ID
//     level:          "beginner",           // level ID from ZIRAK_LEVELS
//     category:       "school",             // category ID from ZIRAK_CATEGORIES
//     english:        "book",               // main English word/phrase
//     pronunciation:  "bʊk",               // IPA or phonetic hint (optional)
//     meaningDari:    "",               // legacy support meaning (support field)
//     meaningPashto:  "کتاب",               // Pashto meaning (support field)
//     exampleEnglish: "This is my book.",   // example sentence in English
//     exampleDari:    "",   // example sentence in Dari
//     examplePashto:  "دا زما کتاب دی.",   // example sentence in Pashto
//     tags:           ["vocabulary","school","noun"]  // content tags
//   }
//
// A future grammar item should support:
//
//   {
//     id:              "gram_001",
//     level:           "beginner",
//     grammarTag:      "verb-to-be",
//     english:         "I am a student.",
//     explanationEn:   "Use 'am' with 'I'.",
//     explanationDari: "",
//     explanationPashto: "د 'I' سره 'am' وکاروئ.",
//     practiceItems:   []
//   }
//
// A future dialogue step should support:
//
//   {
//     promptEn:      "Good morning!",
//     promptDari:    "",
//     promptPashto:  "سهار مو پخیر!",
//     answerEn:      "Good morning! I am fine.",
//     answerDari:    "",
//     answerPashto:  "سهار مو پخیر! ما ښه یم.",
//     phonetic:      "sob-eh be-KHEYR"
//   }
//
// -------------------------------------------------------------------

// -------------------------------------------------------------------
// ZIRAK_LEVELS — extended level definitions for v1.13A+
// These extend the legacy LEVELS array kept in content.js.
// Future content can reference these level IDs.
// -------------------------------------------------------------------
var ZIRAK_LEVELS = [
  { id: 'kids',         en: 'Kids',         dari: '',       pashto: 'ماشومان' },
  { id: 'beginner',     en: 'Beginner',     dari: '',       pashto: 'پیل کوونکی' },
  { id: 'elementary',   en: 'Elementary',   dari: '',     pashto: 'ابتدایی' },
  { id: 'intermediate', en: 'Intermediate', dari: '',       pashto: 'منځنی' },
  { id: 'advanced',     en: 'Advanced',     dari: '',     pashto: 'پرمختللی' }
];

// -------------------------------------------------------------------
// ZIRAK_CATEGORIES — extended category definitions for v1.13A+
// Future content should use these category IDs.
// -------------------------------------------------------------------
var ZIRAK_CATEGORIES = [
  { id: 'daily-life',  en: 'Daily Life',      dari: '', pashto: 'ورځنی ژوند' },
  { id: 'family',      en: 'Family',           dari: '',      pashto: 'کورنۍ' },
  { id: 'school',      en: 'School',           dari: '',          pashto: 'ښوونځی' },
  { id: 'food',        en: 'Food',             dari: '',           pashto: 'خواړه' },
  { id: 'health',      en: 'Health',           dari: '',           pashto: 'روغتیا' },
  { id: 'travel',      en: 'Travel',           dari: '',           pashto: 'سفر' },
  { id: 'culture',     en: 'Afghan Culture',   dari: '',  pashto: 'افغاني فرهنګ' },
  { id: 'numbers',     en: 'Numbers',          dari: '',         pashto: 'شمیرې' },
  { id: 'colours',     en: 'Colours',          dari: '',        pashto: 'رنګونه' },
  { id: 'animals',     en: 'Animals',          dari: '',       pashto: 'ځناور' },
  { id: 'body',        en: 'Body',             dari: '',           pashto: 'بدن' },
  { id: 'work',        en: 'Work',             dari: '',           pashto: 'کار' }
];

// -------------------------------------------------------------------
// ZIRAK_CONTENT_TYPES — all supported content type identifiers
// -------------------------------------------------------------------
var ZIRAK_CONTENT_TYPES = [
  'vocabulary',
  'word-sets',
  'example-sentences',
  'grammar-cards',
  'sentence-patterns',
  'dialogues',
  'speaking-prompts',
  'listening-repeat',
  'phonics-minimal-pairs',
  'fill-in-the-blank',
  'quizzes',
  'common-mistakes',
  'review-items',
  'achievements',
  'report-text'
];

// -------------------------------------------------------------------
// ZIRAK_TAGS — common content tag identifiers
// -------------------------------------------------------------------
var ZIRAK_TAGS = [
  'noun', 'verb', 'adjective', 'adverb', 'preposition',
  'pronoun', 'conjunction', 'question', 'greeting',
  'formal', 'informal', 'academic', 'daily',
  'speaking', 'listening', 'reading', 'writing',
  'grammar', 'vocabulary', 'phonics', 'review'
];

// -------------------------------------------------------------------
// ZIRAK_CONTENT_REGISTRY
// A safe global registry: future content files register themselves here.
// app.js does NOT read this registry — it is for architecture only.
// -------------------------------------------------------------------
var ZIRAK_CONTENT_REGISTRY = {
  wordlab:   null,   // populated by content-wordlab.js
  grammar:   null,   // populated by content-grammar.js
  dialogues: null,   // populated by content-dialogues.js
  review:    null    // populated by content-review.js
};

// -------------------------------------------------------------------
// ZIRAK_CORE_VERSION — architecture version marker
// -------------------------------------------------------------------
var ZIRAK_CORE_VERSION = 'v1.13A-content-architecture-foundation';

// -------------------------------------------------------------------
// Safe utility: find a level object by ID from either legacy LEVELS
// (defined in content.js) or extended ZIRAK_LEVELS.
// Usage: zirakGetLevel('beginner')
// -------------------------------------------------------------------
function zirakGetLevel(id) {
  // Try ZIRAK_LEVELS first
  if (typeof ZIRAK_LEVELS !== 'undefined') {
    var found = ZIRAK_LEVELS.find(function(l) { return l.id === id; });
    if (found) return found;
  }
  // Fallback to legacy LEVELS if available
  if (typeof LEVELS !== 'undefined') {
    return LEVELS.find(function(l) { return l.id === id; }) || null;
  }
  return null;
}

// -------------------------------------------------------------------
// Safe utility: find a category object by ID.
// Usage: zirakGetCategory('school')
// -------------------------------------------------------------------
function zirakGetCategory(id) {
  if (typeof ZIRAK_CATEGORIES !== 'undefined') {
    var found = ZIRAK_CATEGORIES.find(function(c) { return c.id === id; });
    if (found) return found;
  }
  if (typeof CATEGORIES !== 'undefined') {
    return CATEGORIES.find(function(c) { return c.id === id; }) || null;
  }
  return null;
}

// -------------------------------------------------------------------
// Safe utility: get the meaning label for a language code.
// Supported: 'dari', 'pashto', 'both'
// Returns the Dari, Pashto, or combined meaning string from an item.
// Usage: zirakGetMeaning(wordItem, 'dari')
//        zirakGetMeaning(wordItem, 'pashto')
//        zirakGetMeaning(wordItem, 'both')
// -------------------------------------------------------------------
function zirakGetMeaning(item, lang) {
  if (!item) return '';
  // v1.17C: Pashto-only support. Legacy calls using 'dari' or 'both'
  // must not reveal old legacy support text.
  return item.meaningPashto || item.pashto || item.ps || '';
}

// -------------------------------------------------------------------
// Safe utility: validate that a content item has minimum required fields.
// Returns true/false.
// -------------------------------------------------------------------
function zirakValidateItem(item) {
  if (!item) return false;
  if (!item.id) return false;
  if (!item.english && !item.en) return false;
  return true;
}

// -------------------------------------------------------------------
// Safe utility: register a content module into the registry.
// Called by individual content-*.js files.
// -------------------------------------------------------------------
function zirakRegisterContent(moduleName, data) {
  if (typeof ZIRAK_CONTENT_REGISTRY === 'undefined') return;
  if (!ZIRAK_CONTENT_REGISTRY[moduleName]) {
    ZIRAK_CONTENT_REGISTRY[moduleName] = data;
  }
}

// ===================================================================
// END content-core.js
// ===================================================================
