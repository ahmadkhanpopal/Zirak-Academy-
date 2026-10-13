// ===================================================================
// ZIRAK APP — content-dialogues.js
// Version: v1.13A — Content Architecture Foundation
// ===================================================================
//
// PURPOSE:
//   Architecture for future dialogue practice, conversation topics,
//   speaking prompts, and topic studio content with bilingual support.
//
// LOAD ORDER:
//   Load AFTER content-core.js, BEFORE content.js and app.js.
//
// IMPORTANT:
//   This file does NOT replace the existing DIALOGUES, TOPIC_STUDIO_DATA,
//   or STORIES globals used by app.js. Those remain in content.js unchanged.
//   This file provides the schema and small foundation samples to show
//   how FUTURE dialogues can include Pashto meaning support.
//
// HOW app.js uses dialogue content:
//   app.js reads from the DIALOGUES array (defined in content.js).
//   Future dialogues can be added to DIALOGUES via content.js or pushed
//   here after DIALOGUES is defined. See the bridge section at the bottom.
//
// LANGUAGE RULE:
//   - English prompt/answer : main learning language
//   - Dari fields           : legacy support support (existing)
//   - Pashto fields         : Pashto support (new — content field only)
//   Pashto is NOT a UI language. It is a content meaning/support field.
//
// ===================================================================

// -------------------------------------------------------------------
// ZIRAK_DIALOGUE_SCHEMA — documentation of extended dialogue step fields
// The existing DIALOGUES steps use promptEn/promptDari/answerEn/answerDari.
// Future dialogues should also add promptPashto and answerPashto.
// -------------------------------------------------------------------
var ZIRAK_DIALOGUE_SCHEMA = {
  topicLevel: {
    id:           'string — unique dialogue ID',
    level:        'string — level ID from ZIRAK_LEVELS',
    category:     'string — category ID from ZIRAK_CATEGORIES',
    titleEn:      'string — title in English',
    titleDari:    '',
    titlePashto:  'string — title in Pashto (optional)',
    steps: [
      {
        promptEn:      'string — English prompt/line',
        promptDari:    '',
        promptPashto:  'string — Pashto prompt (new support field)',
        answerEn:      'string — English answer/response',
        answerDari:    '',
        answerPashto:  'string — Pashto answer (new support field)',
        phonetic:      'string — phonetic hint (optional)'
      }
    ]
  }
};

// -------------------------------------------------------------------
// ZIRAK_SPEAKING_PROMPTS — speaking prompt architecture for future use
// These are standalone speaking practice prompts with bilingual support.
// (Separate from TOPIC_STUDIO_DATA which app.js uses for Topic Studio.)
// -------------------------------------------------------------------
var ZIRAK_SPEAKING_PROMPTS = [

  // --- SAMPLE: self-introduction ---
  {
    id:           'sp_001',
    level:        'kids',
    category:     'daily-life',
    promptEn:     'Tell me your name.',
    promptDari:   '',
    promptPashto: 'خپل نوم راته ووایه.',
    hintEn:       'My name is ___.',
    hintDari:     '',
    hintPashto:   'زما نوم ___ دی.',
    tags:         ['speaking', 'greeting', 'daily-life']
  },
  {
    id:           'sp_002',
    level:        'beginner',
    category:     'daily-life',
    promptEn:     'Describe your daily routine.',
    promptDari:   '',
    promptPashto: 'د خپل ورځني معمول توضیح کړه.',
    hintEn:       'Every morning I ___. Then I ___.',
    hintDari:     '',
    hintPashto:   'هره سهار زه ___. بیا زه ___.',
    tags:         ['speaking', 'daily-life', 'practice']
  },
  {
    id:           'sp_003',
    level:        'elementary',
    category:     'family',
    promptEn:     'Talk about your family.',
    promptDari:   '',
    promptPashto: 'د خپلې کورنۍ په اړه خبرې وکړه.',
    hintEn:       'In my family there are ___ people. My ___ is/are ___.',
    hintDari:     '',
    hintPashto:   'زما کورنۍ کې ___ کسان دي. زما ___ ___.',
    tags:         ['speaking', 'family', 'practice']
  }

  // Add future speaking prompts here.
  // Include promptPashto and hintPashto fields for Pashto-speaking students.
];

// -------------------------------------------------------------------
// ZIRAK_CONVERSATION_TOPICS — future conversation topic ideas
// These are topic titles for speaking / discussion practice.
// -------------------------------------------------------------------
var ZIRAK_CONVERSATION_TOPICS = [
  {
    id:          'ct_001',
    level:       'beginner',
    titleEn:     'My favourite food',
    titleDari:   '',
    titlePashto: 'زما خوښه خواړه',
    category:    'food'
  },
  {
    id:          'ct_002',
    level:       'elementary',
    titleEn:     'My school day',
    titleDari:   '',
    titlePashto: 'زما د ښوونځي ورځ',
    category:    'school'
  },
  {
    id:          'ct_003',
    level:       'intermediate',
    titleEn:     'Life in my new country',
    titleDari:   '',
    titlePashto: 'زما د نوي هیواد ژوند',
    category:    'daily-life'
  },
  {
    id:          'ct_004',
    level:       'beginner',
    titleEn:     'Afghan traditions',
    titleDari:   '',
    titlePashto: 'افغاني دودونه',
    category:    'culture'
  }

  // Add future conversation topics here.
];

// -------------------------------------------------------------------
// Register this module with the core registry
// -------------------------------------------------------------------
if (typeof zirakRegisterContent === 'function') {
  zirakRegisterContent('dialogues', {
    speakingPrompts:       ZIRAK_SPEAKING_PROMPTS,
    conversationTopics:    ZIRAK_CONVERSATION_TOPICS
  });
}

// ===================================================================
// END content-dialogues.js
// ===================================================================
