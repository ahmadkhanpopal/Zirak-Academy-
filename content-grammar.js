// ===================================================================
// ZIRAK APP — content-grammar.js
// Version: v1.13A — Content Architecture Foundation
// ===================================================================
//
// PURPOSE:
//   Grammar cards, sentence patterns, fill-in-the-blank items,
//   common mistakes, and grammar-related bilingual content.
//
// LOAD ORDER:
//   Load AFTER content-core.js, BEFORE content.js and app.js.
//
// IMPORTANT:
//   This file does NOT replace the existing PLACEMENT_QUESTIONS global
//   used by app.js. Those remain in content.js unchanged.
//   This file defines the architecture for FUTURE grammar content
//   using the richer schema supporting Pashto explanations.
//
// LANGUAGE RULE:
//   - english/explanationEn    : main English explanation/example
//   - explanationDari          : legacy support explanation (support field)
//   - explanationPashto        : Pashto explanation (support field)
//   Pashto is NOT a UI language. It is a content meaning/support field.
//
// HOW TO ADD FUTURE CONTENT:
//   Add grammar cards to ZIRAK_GRAMMAR_CARDS.
//   Add sentence patterns to ZIRAK_SENTENCE_PATTERNS.
//   Add common mistakes to ZIRAK_COMMON_MISTAKES.
//   Do NOT modify the existing PLACEMENT_QUESTIONS in content.js.
//
// ===================================================================

// -------------------------------------------------------------------
// ZIRAK_GRAMMAR_SCHEMA — documentation of supported grammar card fields
// -------------------------------------------------------------------
var ZIRAK_GRAMMAR_SCHEMA = {
  id:                 'string  — unique grammar card ID e.g. "gram_001"',
  level:              'string  — level ID from ZIRAK_LEVELS',
  grammarTag:         'string  — e.g. "verb-to-be", "articles", "past-tense"',
  english:            'string  — main English example or rule',
  explanationEn:      'string  — English explanation of the grammar rule',
  explanationDari:    '',
  explanationPashto:  'string  — Pashto explanation (support field)',
  examples: [
    {
      en:      'string — example sentence in English',
      dari:    '',
      pashto:  'string — example in Pashto'
    }
  ],
  practiceItems: [
    {
      q:       'string — question or fill-in-blank',
      qDari:   '',
      options: 'array  — answer choices',
      correct: 'number — index of correct answer'
    }
  ],
  tags: 'array — content tags from ZIRAK_TAGS'
};

// -------------------------------------------------------------------
// ZIRAK_GRAMMAR_CARDS — foundation sample grammar cards
// Small sample set to prove the architecture.
// Future expansion should add items here.
// -------------------------------------------------------------------
var ZIRAK_GRAMMAR_CARDS = [

  // --- SAMPLE: verb to be (kids/beginner) ---
  {
    id:                'gram_001',
    level:             'kids',
    grammarTag:        'verb-to-be',
    english:           'I am a student.',
    explanationEn:     'Use "am" with "I". Use "is" with he/she/it. Use "are" with you/we/they.',
    explanationDari:   '',
    explanationPashto: 'د "I" سره "am" وکاروئ. د he/she/it سره "is". د you/we/they سره "are".',
    examples: [
      {
        en:     'I am happy.',
        dari:   '',
        pashto: 'زه خوشاله یم.'
      },
      {
        en:     'She is my teacher.',
        dari:   '',
        pashto: 'هغه زما ښوونکې ده.'
      }
    ],
    practiceItems: [
      {
        q:       'I ___ a student.',
        qDari:   '',
        options: ['am', 'is', 'are', 'be'],
        correct: 0
      }
    ],
    tags: ['grammar', 'verb-to-be', 'beginner']
  },

  // --- SAMPLE: articles (beginner/elementary) ---
  {
    id:                'gram_002',
    level:             'elementary',
    grammarTag:        'articles',
    english:           'a / an / the',
    explanationEn:     'Use "a" before consonant sounds. Use "an" before vowel sounds. Use "the" for specific things.',
    explanationDari:   '',
    explanationPashto: 'د جزم غږونو دمخه "a" وکاروئ. د مصوتونو دمخه "an". د ځانګړو شیانو لپاره "the".',
    examples: [
      {
        en:     'I have a book.',
        dari:   '',
        pashto: 'زما یو کتاب دی.'
      },
      {
        en:     'She is an artist.',
        dari:   '',
        pashto: 'هغه یو هنرمند ده.'
      },
      {
        en:     'The book is on the table.',
        dari:   '',
        pashto: 'کتاب د میز پر مخ دی.'
      }
    ],
    practiceItems: [
      {
        q:       'She is ___ engineer.',
        qDari:   '',
        options: ['a', 'an', 'the', 'some'],
        correct: 1
      }
    ],
    tags: ['grammar', 'articles', 'elementary']
  },

  // --- SAMPLE: simple present (beginner) ---
  {
    id:                'gram_003',
    level:             'beginner',
    grammarTag:        'simple-present',
    english:           'He works every day.',
    explanationEn:     'In simple present, add -s or -es to the verb with he/she/it.',
    explanationDari:   '',
    explanationPashto: 'د ساده اوسني زمان کې د he/she/it سره کړ ته -s یا -es ور زیاتوئ.',
    examples: [
      {
        en:     'She reads every morning.',
        dari:   '',
        pashto: 'هغه هره سهار لولي.'
      },
      {
        en:     'He walks to school.',
        dari:   '',
        pashto: 'هغه د ښوونځي لور ته پلي ځي.'
      }
    ],
    practiceItems: [
      {
        q:       'She ___ to school every day.',
        qDari:   '',
        options: ['go', 'goes', 'going', 'gone'],
        correct: 1
      }
    ],
    tags: ['grammar', 'simple-present', 'beginner']
  }

  // Future grammar cards should be added here, following the same schema.
  // Include explanationDari and explanationPashto in every new card.
];

// -------------------------------------------------------------------
// ZIRAK_SENTENCE_PATTERNS — sentence pattern templates for speaking practice
// -------------------------------------------------------------------
var ZIRAK_SENTENCE_PATTERNS = [

  // --- SAMPLE ---
  {
    id:         'pat_001',
    level:      'kids',
    patternEn:  'I am a ___.',
    patternDari:'',
    exampleEn:  'I am a student.',
    exampleDari:'',
    examplePashto: 'زه یو محصل یم.',
    tags:       ['grammar', 'verb-to-be', 'speaking']
  },
  {
    id:         'pat_002',
    level:      'beginner',
    patternEn:  'I like ___.',
    patternDari:'',
    exampleEn:  'I like learning English.',
    exampleDari:'',
    examplePashto: 'زه د انګریزي زده کول خوښوم.',
    tags:       ['vocabulary', 'speaking', 'daily-life']
  }

  // Add future sentence patterns here.
];

// -------------------------------------------------------------------
// ZIRAK_COMMON_MISTAKES — common mistakes Afghan learners make
// -------------------------------------------------------------------
var ZIRAK_COMMON_MISTAKES = [

  // --- SAMPLE ---
  {
    id:            'mistake_001',
    level:         'beginner',
    wrongEn:       'I am agree.',
    correctEn:     'I agree.',
    explanationEn: '"Agree" is a verb. Do not use "am" before a verb in this way.',
    explanationDari: '',
    explanationPashto: '"Agree" کړ دی. د هغه دمخه "am" مه کاروئ.',
    tags:          ['grammar', 'common-mistakes']
  },
  {
    id:            'mistake_002',
    level:         'beginner',
    wrongEn:       'I have 25 years.',
    correctEn:     'I am 25 years old.',
    explanationEn: 'To say your age in English, use "I am X years old."',
    explanationDari: '',
    explanationPashto: 'د عمر د ویلو لپاره "I am X years old" وکاروئ.',
    tags:          ['grammar', 'common-mistakes']
  }

  // Add future common mistakes here.
];

// -------------------------------------------------------------------
// Register this module with the core registry
// -------------------------------------------------------------------
if (typeof zirakRegisterContent === 'function') {
  zirakRegisterContent('grammar', {
    cards:            ZIRAK_GRAMMAR_CARDS,
    sentencePatterns: ZIRAK_SENTENCE_PATTERNS,
    commonMistakes:   ZIRAK_COMMON_MISTAKES
  });
}

// ===================================================================
// END content-grammar.js
// ===================================================================
