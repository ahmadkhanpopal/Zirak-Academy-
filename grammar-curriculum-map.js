// ===================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// grammar-curriculum-map.js — Phase I6B — Grammar Curriculum Architecture
// ===================================================================
// PURPOSE:
//   Defines the LEVEL system (Nursery → Academic/Interview/Exam) and a
//   small STARTER set of foundation grammar topics, built against an
//   EXTENDED topic schema that supports tables, word families, spelling/
//   sound notes, silent letters, homophones, confusing pairs, and
//   practice items — all the fields future large GPT-generated grammar
//   content will need. This file is PURE DATA — no rendering, no DOM,
//   no state. grammar-world.js (loaded AFTER this file) reads
//   window.GW_LEVELS / window.GW_CURRICULUM_TOPICS / window.GW_LEGACY_
//   LEVEL_BRIDGE and merges them into its own existing topic system, so
//   every existing rendering/TTS/practice function keeps working
//   unchanged for BOTH the 5 original prototype topics AND these new
//   ones — no duplicate rendering paths, one curriculum.
//
// SCOPE FOR THIS PHASE (I6B):
//   Architecture + schema + a SMALL proof-of-concept starter set (14
//   foundation topics, embedding 4 starter word families). This is
//   intentionally NOT the full curriculum — later phases insert large
//   GPT-generated content level by level using the pattern documented
//   below. Do not add hundreds of topics here.
//
// LOAD ORDER: after app.js, BEFORE grammar-world.js (grammar-world.js
// reads window.GW_LEVELS / window.GW_CURRICULUM_TOPICS synchronously at
// its own top-level to merge them in, so this file must run first).
// ===================================================================

(function () {
  'use strict';

  // ===================================================================
  // ┌─────────────────────────────────────────────────────────────┐
  // │  HOW TO ADD CONTENT LATER (read this before adding anything)  │
  // └─────────────────────────────────────────────────────────────┘
  //
  // This file is the ONE place new grammar content should be added.
  // grammar-world.js (the renderer) does not need to change for any of
  // the additions described below — it already knows how to render
  // every field named here. If a field is left out of a topic, that
  // section of the lesson page is simply skipped — nothing breaks.
  //
  // ── 1. ADD A NEW LEVEL ─────────────────────────────────────────────
  //   Add one object to the GW_LEVELS array below. Required fields:
  //     id (unique, lowercase, no spaces — e.g. 'preintermediate')
  //     order (integer — controls display order, lower = earlier)
  //     titleEn, titlePs, descriptionEn, descriptionPs
  //     learnerGoalEn, learnerGoalPs (one sentence: "by the end of this
  //       level, the student can...")
  //     locked (true = shown as "coming later", false = open now)
  //   Levels with NO topics assigned yet should stay locked:true — this
  //   is how the structure documents the full 10-level roadmap without
  //   needing content in every level immediately.
  //
  // ── 2. ADD A NEW TOPIC ─────────────────────────────────────────────
  //   Add one object to GW_CURRICULUM_TOPICS below, keyed by a unique
  //   id (convention: 'gw_f###' for foundation-era ids added in this
  //   phase; later phases may use their own prefix, e.g. 'gw_l3_###',
  //   as long as the id is unique across the whole map).
  //   Minimum required fields (matches what the renderer already reads
  //   for the 5 original topics):
  //     id, levelId, category (must match an id in GW_CATEGORIES —
  //       see grammar-world.js — or one of the two new categories
  //       added in this phase: 'foundation', 'wordskills')
  //     level        — SHORT display string shown as a badge, e.g.
  //                    "Foundation" — this is separate from levelId;
  //                    levelId is the structural link used for
  //                    "Browse by Level", level is just the badge text.
  //     title, titlePs
  //     overviewEn, overviewPs   — the "Meaning & Use" section
  //     formula                 — short structure line (plain string;
  //                                can be "" if not applicable, e.g.
  //                                for a pure vocabulary/table topic)
  //     forms[]                 — array of { label, labelPs, items[] },
  //                                each item { en, ps, hl[] } — hl is
  //                                the list of words to highlight.
  //                                (Same shape the 5 original topics
  //                                already use — leave forms:[] if the
  //                                topic is table/family-driven instead.)
  //     mistake { wrong, correct, noteEn, notePs }
  //     summaryEn, summaryPs (optional)
  //
  // ── 3. ADD EXPLANATION SECTIONS (optional, beyond overviewEn) ──────
  //   explanationSections: [
  //     { id:'why-it-matters', titleEn:'...', titlePs:'...',
  //       textEn:'...', textPs:'...' }
  //   ]
  //   Useful when a topic needs more than one explanatory paragraph
  //   (e.g. a "what is a sentence" topic explaining both the definition
  //   AND why it matters). Each one gets its own id so Read Full Lesson
  //   can scroll+highlight it individually, same as every other section.
  //
  // ── 4. ADD TABLES ───────────────────────────────────────────────────
  //   tables: [
  //     {
  //       id: 'subject-pronouns',            // unique within the topic
  //       titleEn: 'Subject Pronouns', titlePs: '...',
  //       columns: [
  //         { key:'pronoun', labelEn:'Pronoun', labelPs:'...' },
  //         { key:'example', labelEn:'Example', labelPs:'...' }
  //       ],
  //       rows: [
  //         // A cell can be a plain string (escaped, shown as-is) OR
  //         // an object { en, ps } for bilingual cells (shown once,
  //         // English above / Pashto below — never duplicated).
  //         { pronoun:'I',  example:{ en:'I am happy.', ps:'زه خوشحاله یم.' } },
  //         { pronoun:'you', example:{ en:'You are kind.', ps:'ته مهربانه یې.' } }
  //       ]
  //     }
  //   ]
  //   Tables render with horizontal scroll on narrow phones automatically
  //   — no extra work needed for mobile.
  //
  // ── 5. ADD WORD FAMILIES ────────────────────────────────────────────
  //   wordFamilies: [
  //     {
  //       base: 'act',
  //       noun: 'action', verb: 'act', adjective: 'active', adverb: 'actively',
  //       relatedMeaningEn: 'to do something / the thing done',
  //       relatedMeaningPs: '...',
  //       exampleEn: 'She took quick action to help.',
  //       examplePs: '...',
  //       mistakeNoteEn: 'Do not say "She did an act to help" — use "action".',
  //       mistakeNotePs: '...'
  //     }
  //   ]
  //   This is the SAME shape used for every future word family — a
  //   family can be added with just base/noun/verb/adjective/adverb if
  //   the extra fields aren't ready yet; missing fields are simply
  //   skipped in the table.
  //
  // ── 6. ADD SPELLING / SOUND / SILENT-LETTER / HOMOPHONE NOTES ──────
  //   spellingSoundNotes / silentLetterNotes / homophoneNotes: [
  //     { en:'knife', ps:'...', noteEn:'The "k" is silent.', notePs:'...' }
  //   ]
  //   confusingPairs: [
  //     { wordA:'its', wordB:"it's", noteEn:'"its" = possession, "it\'s" = it is', notePs:'...' }
  //   ]
  //   All four render as small, clearly-labelled note cards.
  //
  // ── 7. ADD PRACTICE QUESTIONS ────────────────────────────────────────
  //   practiceItems: [
  //     {
  //       id:'q1', type:'choose',   // see the 9 supported types below
  //       promptEn:'Which one is a complete sentence?',
  //       promptPs:'...',
  //       options:[ {en:'Happy.'}, {en:'I am happy.'}, {en:'Running fast.'} ],
  //       correctIndex:1,
  //       explanationEn:'A sentence needs a subject and a verb — "I am happy" has both.',
  //       explanationPs:'...',
  //       weakTag:'sentence-basics'   // used to group weak items later
  //     }
  //   ]
  //   Supported `type` values (the practice engine in grammar-world.js
  //   already knows how to render every one of these):
  //     'choose'          — multiple choice
  //     'fillBlank'        — text input; needs `answerEn` (accepted
  //                          answer(s) — string or array of strings)
  //                          and `promptEn` containing "___" for the blank
  //     'correctMistake'   — same shape as 'choose', framed as "which
  //                          sentence is correct"
  //     'matchCategory'    — same shape as 'choose', framed as "which
  //                          category does this belong to"
  //     'tableChoice'      — same shape as 'choose', framed around a
  //                          table the student just studied
  //     'wordFamily'       — same shape as 'choose', for word-family
  //                          blank-filling
  //     'spellingSound'    — same shape as 'choose', for homophone /
  //                          sound-alike choices
  //     'silentLetter'     — same shape as 'choose', asking which
  //                          letter is silent
  //     'selfCheck'        — no options; shows promptEn (e.g. "say this
  //                          sentence aloud") + sampleEn, student self-
  //                          marks Got It / Missed It (matches the
  //                          rest of the app's self-mark pattern)
  //   quizItems / reviewItems may reuse the exact same item shape —
  //   left as empty arrays in the starter topics; a future phase can
  //   populate them without any renderer changes.
  //
  // ── 8. ADD PASHTO SUPPORT ─────────────────────────────────────────
  //   Every *Ps / titlePs / notePs / examplePs field above is shown
  //   ONCE, visually, under its English pair. If a Ps field is left
  //   empty or omitted, the renderer shows "Pashto translation
  //   pending." — it is NEVER silently hidden. Never fill a Ps field
  //   with Dari/Farsi/Urdu text.
  //
  // ── 9. ADD WEAK-SKILL TAGS ───────────────────────────────────────────
  //   weakSkillTags: ['sentence-basics','subject-verb']
  //   Optional, topic-level tags (separate from each practice item's
  //   own weakTag) — reserved for future teacher-report / AI Command
  //   Center phases that want to group weakness by skill area rather
  //   than by topic. Safe to leave empty for now.
  //
  // ── 10. ADD NEAR-SYNONYMS (added in Phase I6B1) ──────────────────────
  //   synonymPairs: [
  //     { wordA:'big', wordB:'large',
  //       noteEn:'...', notePs:'...',
  //       exampleAEn:'...', exampleAPs:'...',
  //       exampleBEn:'...', exampleBPs:'...' }
  //   ]
  //   For words with close-but-not-identical meaning (big/large,
  //   start/begin). Each pair gets one short usage note plus one
  //   example sentence per word.
  //
  // ── 11. ADD BRITISH VS AMERICAN DIFFERENCES (added in Phase I6B1) ───
  //   britishAmerican: [
  //     { british:'colour', american:'color', typeEn:'spelling',
  //       noteEn:'...', notePs:'...' }
  //   ]
  //   typeEn is a free-text label — 'spelling', 'pronunciation', or
  //   'terminology' are the three used so far, but any short label
  //   works; it is only used as-is for display, not matched against a
  //   fixed list. For pronunciation-only notes with no separate
  //   british/american word pair, use explanationSections instead (see
  //   §3 above) — gw_f017's "A Note on Pronunciation" section is an
  //   example of this.
  // ===================================================================


  // ===================================================================
  // GW_LEVELS — the 10-level roadmap. Levels with no topics yet stay
  // locked:true so the FULL structure is visible without needing
  // content in every level immediately (per this phase's scope).
  // ===================================================================
  var GW_LEVELS = [
    {
      id: 'nursery', order: 1, locked: false,
      titleEn: 'Starter', titlePs: 'پیل کچه',
      descriptionEn: 'The building blocks of English: what a sentence is, and the basic word types every sentence is made of.',
      descriptionPs: 'د انګلیسي بنسټیزې برخې: جمله څه ده، او هغه بنسټیز کلمې ډولونه چې هره جمله ترې جوړېږي.',
      learnerGoalEn: 'By the end of this level, the student can recognize a complete sentence and name its basic parts.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی بشپړه جمله پیژني او د هغې بنسټیزې برخې نومولی شي.'
    },
    {
      id: 'starter', order: 2, locked: false,
      titleEn: 'Basic', titlePs: 'اساسي کچه',
      descriptionEn: 'Describing words and simple pronoun tables — adjectives, adverbs, and how to talk about people without repeating their names.',
      descriptionPs: 'بیانوونکي کلمې او ساده ضمیري جدولونه — صفتونه، قیدونه، او څنګه د خلکو په اړه پرته له نوم تکرار خبرې وکړو.',
      learnerGoalEn: 'By the end of this level, the student can use basic adjectives, adverbs, and subject pronouns correctly.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی بنسټیز صفتونه، قیدونه، او فاعلي ضمیرونه سم کاروي.'
    },
    {
      id: 'beginner1', order: 3, locked: false,
      titleEn: 'Beginner (Stage 1)', titlePs: 'پیل\u200cکوونکی (پړاو ۱)',
      descriptionEn: 'Object pronouns, possessives, the verb "to be", and the first word families.',
      descriptionPs: 'مفعولي ضمیرونه، ملکیتي بڼې، د "to be" فعل، او لومړنۍ د کلمو کورنۍ.',
      learnerGoalEn: 'By the end of this level, the student can use am/is/are, do/does, and basic possessives with confidence.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی am/is/are، do/does، او بنسټیزې ملکیتي بڼې په ډاډ سره کاروي.'
    },
    {
      id: 'beginner2', order: 4, locked: false,
      titleEn: 'Beginner (Stage 2)', titlePs: 'پیل\u200cکوونکی (پړاو ۲)',
      descriptionEn: 'Present Continuous, simple modals (can/cannot, should/should not), and everyday conversation grammar.',
      descriptionPs: 'اوسنی جاري زمان، ساده مودالونه (can/cannot، should/should not)، او د ورځني خبرو ګرامر.',
      learnerGoalEn: 'By the end of this level, the student can describe actions happening now and give simple advice or talk about ability.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی د اوس روان کارونه بیانولی شي او ساده مشوره یا وړتیا بیانولی شي.'
    },
    {
      id: 'elementary', order: 5, locked: false,
      titleEn: 'Elementary', titlePs: 'ابتدايي',
      descriptionEn: 'Spelling and sound awareness — silent letters, homophones, and common Afghan-learner sentence-order mistakes.',
      descriptionPs: 'د لیکدود او غږ پوهاوی — چوپ توري، همغږي کلمې، او د افغان زده\u200cکوونکو عام د جملې ترتیب غلطي.',
      learnerGoalEn: 'By the end of this level, the student can recognize common spelling traps and avoid the most frequent word-order mistake.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی عام لیکدود ستونزې پیژني او د جملې ترتیب ترټولو عام غلطي مخنیوی کوي.'
    },
    { id: 'preintermediate', order: 6, locked: true,
      titleEn: 'Intermediate (Preparation)', titlePs: 'مینځنۍ (چمتووالی)',
      descriptionEn: 'Past tenses, comparatives, and connecting ideas with basic linking words.',
      descriptionPs: 'تیر زمانې، پرتله کول، او د اړیکو کلمو په مرسته د افکارو نښلول.',
      learnerGoalEn: 'By the end of this level, the student can talk about the past and compare people or things.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی د تیر په اړه خبرې کولی شي او خلک یا شیان پرتله کولی شي.'
    },
    { id: 'intermediate', order: 7, locked: true,
      titleEn: 'Intermediate', titlePs: 'مینځنۍ',
      descriptionEn: 'Perfect tenses, passive voice basics, and reported speech.',
      descriptionPs: 'کامل زمانې، د مجهول جملې بنسټونه، او غیر مستقیم وینا.',
      learnerGoalEn: 'By the end of this level, the student can connect past and present, and report what someone else said.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی تیر او اوس اړوندوي، او د بل چا وینا نقلوي.'
    },
    { id: 'upperintermediate', order: 8, locked: true,
      titleEn: 'Advanced (Preparation)', titlePs: 'پرمختللی (چمتووالی)',
      descriptionEn: 'Conditionals, relative clauses, and more natural phrasal verbs.',
      descriptionPs: 'شرطي جملې، اضافي جملې، او ډېرې طبیعي ترکیبي فعلونه.',
      learnerGoalEn: 'By the end of this level, the student can express hypothetical ideas and connect ideas with relative clauses.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی فرضي نظرونه بیانولی شي او افکار د اضافي جملو په مرسته نښلولی شي.'
    },
    { id: 'advanced', order: 9, locked: true,
      titleEn: 'Advanced', titlePs: 'پرمختللی',
      descriptionEn: 'Advanced structures for confident, natural conversation.',
      descriptionPs: 'د ډاډمنو، طبیعي خبرو لپاره پرمختللي جوړښتونه.',
      learnerGoalEn: 'By the end of this level, the student can speak with the range and accuracy of a confident advanced learner.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی د یو ډاډمن پرمختللي زده\u200cکوونکي په کچه خبرې کولی شي.'
    },
    { id: 'academic', order: 10, locked: true,
      titleEn: 'Academic / Interview / Exam Grammar', titlePs: 'اکاډمیک / مرکې / ازموینې ګرامر',
      descriptionEn: 'Precise, formal grammar for job interviews, exams, and academic or professional writing.',
      descriptionPs: 'د دندې مرکو، ازموینو، او اکاډمیک یا مسلکي لیکنې لپاره دقیق، رسمي ګرامر.',
      learnerGoalEn: 'By the end of this level, the student can use formal, precise grammar confidently in interviews, exams, and professional writing.',
      learnerGoalPs: 'د دې کچې په پای کې، زده\u200cکوونکی په مرکو، ازموینو، او مسلکي لیکنه کې رسمي، دقیق ګرامر په ډاډ سره کاروي.'
    }
  ];
  window.GW_LEVELS = GW_LEVELS;

  // ===================================================================
  // GW_LEGACY_LEVEL_BRIDGE — links the 5 EXISTING prototype topics
  // (defined in grammar-world.js, untouched) into the new level system
  // WITHOUT modifying their original object literals. grammar-world.js
  // applies this bridge once, after building its topic list.
  // ===================================================================
  var GW_LEGACY_LEVEL_BRIDGE = {
    gw_001: 'beginner1',  // am / is / are
    gw_002: 'beginner1',  // do / does
    gw_003: 'beginner2',  // Present Continuous
    gw_004: 'beginner2',  // can / cannot
    gw_005: 'beginner2'   // should / should not
  };
  window.GW_LEGACY_LEVEL_BRIDGE = GW_LEGACY_LEVEL_BRIDGE;

  // ===================================================================
  // GW_NEW_CATEGORIES — two additive categories this phase introduces,
  // for content GW_CATEGORIES (in grammar-world.js) doesn't already
  // have a home for. grammar-world.js EXTENDS its existing category
  // list with these (never removes/renames the original 22, per the
  // "Future Coverage Lock" rule already in place there).
  // ===================================================================
  var GW_NEW_CATEGORIES = [
    { id: 'foundation', icon: '🧱', name: 'Sentence Basics', namePs: 'د جملې بنسټونه', color: '#0f766e', count: 0 },
    { id: 'wordskills', icon: '🔤', name: 'Word Skills & Spelling', namePs: 'د کلمو مهارتونه', color: '#7c2d92', count: 0 }
    // count is filled in automatically by grammar-world.js once topics
    // are merged — do not hand-edit the count here.
  ];
  window.GW_NEW_CATEGORIES = GW_NEW_CATEGORIES;


  // ===================================================================
  // GW_CURRICULUM_TOPICS — starter foundation content (14 topics).
  // Small on purpose (see file header) — proves every schema field,
  // every table type, word families, and every practice exercise type
  // actually works end-to-end before large content is inserted later.
  // ===================================================================
  var GW_CURRICULUM_TOPICS = {

    // ── F1: What is a sentence? ───────────────────────────────────────
    'gw_f001': {
      id: 'gw_f001', levelId: 'nursery', level: 'Starter', category: 'foundation',
      title: 'What is a Sentence?', titlePs: 'جمله څه ده؟',
      overviewEn: 'A sentence is a group of words that expresses one complete idea. Every sentence needs at least a subject (who or what) and a verb (the action or state).',
      overviewPs: 'جمله د کلمو یوه ډله ده چې یو بشپړ مفکوره بیانوي. هره جمله لږترلږه یو فاعل (څوک یا څه) او یو فعل (کار یا حالت) ته اړتیا لري.',
      formula: 'Subject + Verb (+ more) = a complete sentence',
      explanationSections: [
        {
          id: 'gw-f001-why', titleEn: 'Why It Matters', titlePs: 'ولې مهمه ده',
          textEn: 'If a group of words is missing a subject or a verb, it is not a full sentence — it is only a fragment, and it can confuse the listener.',
          textPs: 'که د کلمو یوه ډله فاعل یا فعل ونلري، دا بشپړه جمله نه ده — یوازې یوه ټوټه ده، او اورېدونکی مغشوش کولی شي.'
        }
      ],
      forms: [
        { label: 'Complete Sentences', labelPs: 'بشپړې جملې', items: [
          { en: 'I am happy.', ps: 'زه خوشحاله یم.', hl: ['I', 'am'] },
          { en: 'The dog runs.', ps: 'سپی منډې وهي.', hl: ['dog', 'runs'] },
          { en: 'She reads a book.', ps: 'هغه یو کتاب لولي.', hl: ['She', 'reads'] }
        ]},
        { label: 'Not Complete Sentences (Fragments)', labelPs: 'ناقصې جملې', items: [
          { en: 'Happy.', ps: '(نیمګړی — نه فاعل شته نه فعل)', hl: [] },
          { en: 'Running fast.', ps: '(نیمګړی — فاعل نشته)', hl: [] },
          { en: 'The tall boy.', ps: '(نیمګړی — فعل نشته)', hl: [] }
        ]}
      ],
      mistake: {
        wrong: 'Happy. / Running fast.',
        correct: 'I am happy. / He is running fast.',
        noteEn: 'A single word or a description alone is not a sentence — add a subject and a verb to complete the idea.',
        notePs: 'یوازې یوه کلمه یا بیان جمله نه ده — د بشپړولو لپاره فاعل او فعل ورزیات کړئ.'
      },
      summaryEn: 'A complete sentence always has a subject and a verb. Without both, it is only a fragment.',
      summaryPs: 'بشپړه جمله تل فاعل او فعل لري. پرته له دواړو، دا یوازې یوه ټوټه ده.',
      practiceItems: [
        {
          id: 'q1', type: 'choose',
          promptEn: 'Which one is a complete sentence?',
          promptPs: 'کومه یوه بشپړه جمله ده؟',
          options: [ { en: 'Happy.' }, { en: 'I am happy.' }, { en: 'Very happy today.' } ],
          correctIndex: 1,
          explanationEn: 'Only "I am happy" has both a subject (I) and a verb (am).',
          explanationPs: 'یوازې "I am happy" فاعل (I) او فعل (am) دواړه لري.',
          weakTag: 'sentence-basics'
        },
        {
          id: 'q2', type: 'selfCheck',
          promptEn: 'Say this sentence aloud, clearly: "The dog runs fast."',
          promptPs: 'دا جمله په چټکۍ سره لوړ اواز سره ووایاست: "The dog runs fast."',
          sampleEn: 'The dog runs fast.',
          weakTag: 'sentence-basics'
        }
      ]
    },

    // ── F2: Subject and Verb ──────────────────────────────────────────
    'gw_f002': {
      id: 'gw_f002', levelId: 'nursery', level: 'Starter', category: 'foundation',
      title: 'Subject and Verb', titlePs: 'فاعل او فعل',
      overviewEn: 'The subject is who or what the sentence is about. The verb tells us the action or state of the subject.',
      overviewPs: 'فاعل هغه څوک یا څه دي چې جمله د هغوی په اړه ده. فعل موږ ته د فاعل کار یا حالت راښيي.',
      formula: 'Subject (who/what) + Verb (action/state)',
      forms: [
        { label: 'Examples', labelPs: 'بېلګې', items: [
          { en: 'Ali plays football.', ps: 'علي فوټبال لوبوي.', hl: ['Ali', 'plays'] },
          { en: 'Birds fly.', ps: 'مرغان الوځي.', hl: ['Birds', 'fly'] },
          { en: 'My mother cooks well.', ps: 'زما مور ښه پخلی کوي.', hl: ['mother', 'cooks'] }
        ]}
      ],
      tables: [
        {
          id: 'subject-verb-examples', titleEn: 'Subject + Verb', titlePs: 'فاعل + فعل',
          columns: [
            { key: 'subject', labelEn: 'Subject', labelPs: 'فاعل' },
            { key: 'verb', labelEn: 'Verb', labelPs: 'فعل' },
            { key: 'sentence', labelEn: 'Full Sentence', labelPs: 'بشپړه جمله' }
          ],
          rows: [
            { subject: 'Ali', verb: 'plays', sentence: { en: 'Ali plays football.', ps: 'علي فوټبال لوبوي.' } },
            { subject: 'Birds', verb: 'fly', sentence: { en: 'Birds fly.', ps: 'مرغان الوځي.' } },
            { subject: 'I', verb: 'study', sentence: { en: 'I study English.', ps: 'زه انګلیسي زده کوم.' } }
          ]
        }
      ],
      mistake: {
        wrong: 'Football Ali plays.',
        correct: 'Ali plays football.',
        noteEn: 'In English the subject comes first, then the verb — not the other way around.',
        notePs: 'په انګلیسي کې فاعل لومړی راځي، بیا فعل — نه برعکس.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'matchCategory',
          promptEn: 'In the sentence "Birds fly," which word is the SUBJECT?',
          promptPs: 'په جمله "Birds fly" کې، کومه کلمه فاعل ده؟',
          options: [ { en: 'Birds' }, { en: 'fly' } ],
          correctIndex: 0,
          explanationEn: '"Birds" is who the sentence is about — that makes it the subject.',
          explanationPs: '"Birds" هغه دي چې جمله د هغوی په اړه ده — دا یې فاعل ګرځوي.',
          weakTag: 'subject-verb'
        },
        {
          id: 'q2', type: 'fillBlank',
          promptEn: 'My mother ___ well. (cook)',
          promptPs: 'زما مور ___ ښه. (cook)',
          answerEn: ['cooks'],
          explanationEn: 'With he/she/it, add -s to the verb: cook → cooks.',
          explanationPs: 'د he/she/it سره، فعل ته -s ورزیات کړئ: cook → cooks.',
          weakTag: 'subject-verb'
        }
      ]
    },

    // ── F3: Subject and Object ────────────────────────────────────────
    'gw_f003': {
      id: 'gw_f003', levelId: 'nursery', level: 'Starter', category: 'foundation',
      title: 'Subject and Object', titlePs: 'فاعل او مفعول',
      overviewEn: 'The subject does the action. The object receives the action. Not every sentence has an object, but many do.',
      overviewPs: 'فاعل کار سرته رسوي. مفعول کار ترلاسه کوي. هره جمله مفعول نه لري، خو ډېرې یې لري.',
      formula: 'Subject + Verb + Object',
      forms: [
        { label: 'Examples', labelPs: 'بېلګې', items: [
          { en: 'She reads a book.', ps: 'هغه یو کتاب لولي.', hl: ['She', 'book'] },
          { en: 'I love my country.', ps: 'زه خپل هېواد سره مینه لرم.', hl: ['I', 'country'] },
          { en: 'He helps his friend.', ps: 'هغه خپل ملګري سره مرسته کوي.', hl: ['He', 'friend'] }
        ]}
      ],
      tables: [
        {
          id: 'subject-verb-object', titleEn: 'Subject + Verb + Object', titlePs: 'فاعل + فعل + مفعول',
          columns: [
            { key: 'subject', labelEn: 'Subject', labelPs: 'فاعل' },
            { key: 'verb', labelEn: 'Verb', labelPs: 'فعل' },
            { key: 'object', labelEn: 'Object', labelPs: 'مفعول' }
          ],
          rows: [
            { subject: 'She', verb: 'reads', object: 'a book' },
            { subject: 'I', verb: 'love', object: 'my country' },
            { subject: 'He', verb: 'helps', object: 'his friend' }
          ]
        }
      ],
      mistake: {
        wrong: 'Book a she reads.',
        correct: 'She reads a book.',
        noteEn: 'English word order is Subject → Verb → Object — keep this order even though Pashto orders words differently.',
        notePs: 'د انګلیسي د کلمو ترتیب دی: فاعل → فعل → مفعول — دا ترتیب وساتئ که څه هم پښتو د کلمو ترتیب توپیر لري.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'matchCategory',
          promptEn: 'In "He helps his friend," which word is the OBJECT?',
          promptPs: 'په "He helps his friend" کې، کومه کلمه مفعول ده؟',
          options: [ { en: 'He' }, { en: 'helps' }, { en: 'friend' } ],
          correctIndex: 2,
          explanationEn: '"his friend" receives the help — that makes it the object.',
          explanationPs: '"his friend" مرسته ترلاسه کوي — دا یې مفعول ګرځوي.',
          weakTag: 'subject-object'
        },
        {
          id: 'q2', type: 'correctMistake',
          promptEn: 'Which sentence has the correct word order?',
          promptPs: 'کومه جمله د کلمو سم ترتیب لري؟',
          options: [ { en: 'Book a she reads.' }, { en: 'She reads a book.' } ],
          correctIndex: 1,
          explanationEn: 'English always follows Subject + Verb + Object order.',
          explanationPs: 'انګلیسي تل د فاعل + فعل + مفعول ترتیب تعقیبوي.',
          weakTag: 'subject-object'
        }
      ]
    },

    // ── F4: Noun Basics ────────────────────────────────────────────────
    'gw_f004': {
      id: 'gw_f004', levelId: 'nursery', level: 'Starter', category: 'foundation',
      title: 'Noun Basics', titlePs: 'د اسم بنسټونه',
      overviewEn: 'A noun is the name of a person, place, thing, or idea. Nouns can be subjects or objects in a sentence.',
      overviewPs: 'اسم د یو شخص، ځای، شي، یا مفکورې نوم دی. اسمونه کولی شي په جمله کې فاعل یا مفعول وي.',
      formula: 'Noun = person / place / thing / idea',
      tables: [
        {
          id: 'noun-types', titleEn: 'Types of Nouns', titlePs: 'د اسم ډولونه',
          columns: [
            { key: 'type', labelEn: 'Type', labelPs: 'ډول' },
            { key: 'examples', labelEn: 'Examples', labelPs: 'بېلګې' }
          ],
          rows: [
            { type: { en: 'Person', ps: 'شخص' }, examples: 'teacher, student, mother' },
            { type: { en: 'Place', ps: 'ځای' }, examples: 'school, Kandahar, home' },
            { type: { en: 'Thing', ps: 'شی' }, examples: 'book, chair, phone' },
            { type: { en: 'Idea', ps: 'مفکوره' }, examples: 'freedom, love, honesty' }
          ]
        }
      ],
      mistake: {
        wrong: 'She is a good Teacher. (capitalized mid-sentence for no reason)',
        correct: 'She is a good teacher.',
        noteEn: 'Common nouns (teacher, book, school) are not capitalized in the middle of a sentence — only proper nouns (names) are.',
        notePs: 'عام اسمونه (teacher, book, school) د جملې په مینځ کې لوی توری نه اخلي — یوازې خاص اسمونه (نومونه) لوی توری اخلي.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'choose',
          promptEn: 'Which word is a noun?',
          promptPs: 'کومه کلمه اسم ده؟',
          options: [ { en: 'run' }, { en: 'quickly' }, { en: 'teacher' } ],
          correctIndex: 2,
          explanationEn: '"teacher" names a person — that makes it a noun.',
          explanationPs: '"teacher" د یو شخص نوم دی — دا یې اسم ګرځوي.',
          weakTag: 'noun-basics'
        }
      ]
    },

    // ── F5: Verb Basics ────────────────────────────────────────────────
    'gw_f005': {
      id: 'gw_f005', levelId: 'nursery', level: 'Starter', category: 'foundation',
      title: 'Verb Basics', titlePs: 'د فعل بنسټونه',
      overviewEn: 'A verb shows an action (run, eat, study) or a state (be, know, seem). Every complete sentence needs a verb.',
      overviewPs: 'فعل یو کار (run, eat, study) یا حالت (be, know, seem) ښيي. هره بشپړه جمله فعل ته اړتیا لري.',
      formula: 'Verb = action or state',
      tables: [
        {
          id: 'verb-types', titleEn: 'Action Verbs vs State Verbs', titlePs: 'د کار فعلونه او د حالت فعلونه',
          columns: [
            { key: 'type', labelEn: 'Type', labelPs: 'ډول' },
            { key: 'examples', labelEn: 'Examples', labelPs: 'بېلګې' }
          ],
          rows: [
            { type: { en: 'Action Verb', ps: 'د کار فعل' }, examples: 'run, eat, study, play' },
            { type: { en: 'State Verb', ps: 'د حالت فعل' }, examples: 'be, know, seem, want' }
          ]
        }
      ],
      mistake: {
        wrong: 'I studying English.',
        correct: 'I am studying English. / I study English.',
        noteEn: 'A verb almost always needs a helper (am/is/are, do/does) or the right ending — it cannot stand alone like "studying" with no "am/is/are" before it.',
        notePs: 'فعل نږدې تل یو مرستندوی (am/is/are، do/does) یا سمه پای ته اړتیا لري — یوازې "studying" پرته له "am/is/are" مخکې نشي راتلی.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'choose',
          promptEn: 'Which word is the VERB in "She studies English"?',
          promptPs: 'په "She studies English" کې کومه کلمه فعل ده؟',
          options: [ { en: 'She' }, { en: 'studies' }, { en: 'English' } ],
          correctIndex: 1,
          explanationEn: '"studies" is the action — that makes it the verb.',
          explanationPs: '"studies" کار دی — دا یې فعل ګرځوي.',
          weakTag: 'verb-basics'
        }
      ]
    },

    // ── F6: Adjective Basics ───────────────────────────────────────────
    'gw_f006': {
      id: 'gw_f006', levelId: 'starter', level: 'Starter', category: 'adjectives',
      title: 'Adjective Basics', titlePs: 'د صفت بنسټونه',
      overviewEn: 'An adjective describes a noun — it tells us more about a person, place, or thing (its size, color, feeling, or quality).',
      overviewPs: 'صفت اسم بیانوي — موږ ته د یو شخص، ځای، یا شي په اړه نور معلومات راکوي (اندازه، رنګ، احساس، یا ځانګړتیا).',
      formula: 'Adjective + Noun  (a big house, a happy student)',
      forms: [
        { label: 'Examples', labelPs: 'بېلګې', items: [
          { en: 'a big house', ps: 'یو لوی کور', hl: ['big'] },
          { en: 'a happy student', ps: 'یو خوشحاله زده\u200cکوونکی', hl: ['happy'] },
          { en: 'a difficult exam', ps: 'یوه ستونزمنه ازموینه', hl: ['difficult'] }
        ]}
      ],
      mistake: {
        wrong: 'a house big',
        correct: 'a big house',
        noteEn: 'In English, the adjective comes BEFORE the noun, not after.',
        notePs: 'په انګلیسي کې، صفت له اسم مخکې راځي، نه وروسته.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'choose',
          promptEn: 'Which word is the ADJECTIVE in "a difficult exam"?',
          promptPs: 'په "a difficult exam" کې کومه کلمه صفت ده؟',
          options: [ { en: 'a' }, { en: 'difficult' }, { en: 'exam' } ],
          correctIndex: 1,
          explanationEn: '"difficult" describes the exam — that makes it the adjective.',
          explanationPs: '"difficult" ازموینه بیانوي — دا یې صفت ګرځوي.',
          weakTag: 'adjective-basics'
        }
      ]
    },

    // ── F7: Adverb Basics ──────────────────────────────────────────────
    'gw_f007': {
      id: 'gw_f007', levelId: 'starter', level: 'Starter', category: 'adjectives',
      title: 'Adverb Basics', titlePs: 'د قید بنسټونه',
      overviewEn: 'An adverb describes a verb, an adjective, or another adverb — it often tells us HOW something happens. Many adverbs end in -ly.',
      overviewPs: 'قید فعل، صفت، یا بل قید بیانوي — ډېری وخت موږ ته وایي چې کار څنګه ترسره کیږي. ډېری قیدونه په -ly پای ته رسیږي.',
      formula: 'Verb + Adverb  (speaks slowly, runs quickly)',
      forms: [
        { label: 'Examples', labelPs: 'بېلګې', items: [
          { en: 'She speaks slowly.', ps: 'هغه ورو خبرې کوي.', hl: ['slowly'] },
          { en: 'He runs quickly.', ps: 'هغه چټک منډې وهي.', hl: ['quickly'] },
          { en: 'They work carefully.', ps: 'دوی په پاملرنه سره کار کوي.', hl: ['carefully'] }
        ]}
      ],
      mistake: {
        wrong: 'She speaks slow.',
        correct: 'She speaks slowly.',
        noteEn: 'To describe a verb, use the adverb form (slowly), not the adjective form (slow).',
        notePs: 'د فعل بیانولو لپاره، د قید بڼه وکاروئ (slowly)، نه د صفت بڼه (slow).'
      },
      practiceItems: [
        {
          id: 'q1', type: 'choose',
          promptEn: 'Which word is the ADVERB in "He runs quickly"?',
          promptPs: 'په "He runs quickly" کې کومه کلمه قید ده؟',
          options: [ { en: 'He' }, { en: 'runs' }, { en: 'quickly' } ],
          correctIndex: 2,
          explanationEn: '"quickly" tells us HOW he runs — that makes it the adverb.',
          explanationPs: '"quickly" موږ ته وایي چې هغه څنګه منډې وهي — دا یې قید ګرځوي.',
          weakTag: 'adverb-basics'
        }
      ]
    },

    // ── F8: Subject Pronouns Table ────────────────────────────────────
    'gw_f008': {
      id: 'gw_f008', levelId: 'starter', level: 'Starter', category: 'pronouns',
      title: 'Subject Pronouns', titlePs: 'فاعلي ضمیرونه',
      overviewEn: 'Subject pronouns (I, you, he, she, it, we, they) replace a noun that is DOING the action — they go before the verb.',
      overviewPs: 'فاعلي ضمیرونه (I, you, he, she, it, we, they) هغه اسم بدلوي چې کار سرته رسوي — دوی له فعل مخکې راځي.',
      formula: 'Subject Pronoun + Verb',
      tables: [
        {
          id: 'subject-pronoun-table', titleEn: 'Subject Pronouns', titlePs: 'فاعلي ضمیرونه',
          columns: [
            { key: 'pronoun', labelEn: 'Pronoun', labelPs: 'ضمیر' },
            { key: 'example', labelEn: 'Example', labelPs: 'بېلګه' }
          ],
          rows: [
            { pronoun: 'I', example: { en: 'I am a student.', ps: 'زه یو زده\u200cکوونکی یم.' } },
            { pronoun: 'you', example: { en: 'You are kind.', ps: 'ته مهربانه یې.' } },
            { pronoun: 'he', example: { en: 'He plays football.', ps: 'هغه فوټبال لوبوي.' } },
            { pronoun: 'she', example: { en: 'She reads books.', ps: 'هغه کتابونه لولي.' } },
            { pronoun: 'it', example: { en: 'It is a nice day.', ps: 'دا ښه ورځ ده.' } },
            { pronoun: 'we', example: { en: 'We study English.', ps: 'موږ انګلیسي زده کوو.' } },
            { pronoun: 'they', example: { en: 'They live in Kandahar.', ps: 'دوی په کندهار کې اوسیږي.' } }
          ]
        }
      ],
      mistake: {
        wrong: 'Her is a good teacher.',
        correct: 'She is a good teacher.',
        noteEn: '"her" is an object pronoun — use the subject pronoun "she" when it does the action.',
        notePs: '"her" مفعولي ضمیر دی — کله چې کار سرته رسوي، فاعلي ضمیر "she" وکاروئ.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'fillBlank',
          promptEn: '___ am a student. (I / me)',
          promptPs: '___ زده\u200cکوونکی یم. (I / me)',
          answerEn: ['I'],
          explanationEn: 'Use "I" (subject pronoun), not "me", before a verb.',
          explanationPs: 'له فعل مخکې "I" (فاعلي ضمیر) وکاروئ، نه "me".',
          weakTag: 'subject-pronouns'
        },
        {
          id: 'q2', type: 'tableChoice',
          promptEn: 'Which subject pronoun replaces "Ahmad and I"?',
          promptPs: 'کوم فاعلي ضمیر "Ahmad and I" بدلوي؟',
          options: [ { en: 'we' }, { en: 'they' }, { en: 'you' } ],
          correctIndex: 0,
          explanationEn: '"Ahmad and I" includes the speaker, so it becomes "we".',
          explanationPs: '"Ahmad and I" ویونکی هم شامل دی، نو دا "we" کیږي.',
          weakTag: 'subject-pronouns'
        }
      ]
    },

    // ── F9: Object Pronouns Table ─────────────────────────────────────
    'gw_f009': {
      id: 'gw_f009', levelId: 'beginner1', level: 'Beginner (Stage 1)', category: 'pronouns',
      title: 'Object Pronouns', titlePs: 'مفعولي ضمیرونه',
      overviewEn: 'Object pronouns (me, you, him, her, it, us, them) replace a noun that RECEIVES the action — they go after the verb.',
      overviewPs: 'مفعولي ضمیرونه (me, you, him, her, it, us, them) هغه اسم بدلوي چې کار ترلاسه کوي — دوی له فعل وروسته راځي.',
      formula: 'Verb + Object Pronoun',
      tables: [
        {
          id: 'object-pronoun-table', titleEn: 'Object Pronouns', titlePs: 'مفعولي ضمیرونه',
          columns: [
            { key: 'pronoun', labelEn: 'Pronoun', labelPs: 'ضمیر' },
            { key: 'example', labelEn: 'Example', labelPs: 'بېلګه' }
          ],
          rows: [
            { pronoun: 'me', example: { en: 'She helps me.', ps: 'هغه زما سره مرسته کوي.' } },
            { pronoun: 'you', example: { en: 'I see you.', ps: 'زه تا وینم.' } },
            { pronoun: 'him', example: { en: 'We know him.', ps: 'موږ هغه پیژنو.' } },
            { pronoun: 'her', example: { en: 'They like her.', ps: 'دوی هغه خوښوي.' } },
            { pronoun: 'it', example: { en: 'I want it.', ps: 'زه یې غواړم.' } },
            { pronoun: 'us', example: { en: 'He teaches us.', ps: 'هغه موږ ته ښوونه کوي.' } },
            { pronoun: 'them', example: { en: 'I called them.', ps: 'ما دوی ته زنګ ووهه.' } }
          ]
        }
      ],
      mistake: {
        wrong: 'She helps I.',
        correct: 'She helps me.',
        noteEn: 'After a verb, use the object pronoun ("me"), not the subject pronoun ("I").',
        notePs: 'له فعل وروسته، مفعولي ضمیر ("me") وکاروئ، نه فاعلي ضمیر ("I").'
      },
      practiceItems: [
        {
          id: 'q1', type: 'choose',
          promptEn: 'Which is correct: "We know ___" (he / him)?',
          promptPs: 'کوم سم دی: "We know ___" (he / him)؟',
          options: [ { en: 'he' }, { en: 'him' } ],
          correctIndex: 1,
          explanationEn: 'After the verb "know", use the object pronoun "him".',
          explanationPs: 'له فعل "know" وروسته، مفعولي ضمیر "him" وکاروئ.',
          weakTag: 'object-pronouns'
        }
      ]
    },

    // ── F10: Possessive Adjective vs Possessive Pronoun ──────────────
    'gw_f010': {
      id: 'gw_f010', levelId: 'beginner1', level: 'Beginner (Stage 1)', category: 'pronouns',
      title: 'Possessive Adjectives vs Possessive Pronouns', titlePs: 'ملکیتي صفتونه او ملکیتي ضمیرونه',
      overviewEn: 'A possessive adjective (my, your, his, her, its, our, their) always comes before a noun. A possessive pronoun (mine, yours, his, hers, its, ours, theirs) stands ALONE, without a noun after it.',
      overviewPs: 'ملکیتي صفت (my, your, his, her, its, our, their) تل له اسم مخکې راځي. ملکیتي ضمیر (mine, yours, his, hers, its, ours, theirs) یوازې راځي، پرته له اسم چې وروسته یې راشي.',
      formula: 'Possessive Adjective + Noun   |   Possessive Pronoun (alone)',
      tables: [
        {
          id: 'possessive-comparison', titleEn: 'Possessive Adjective vs Possessive Pronoun', titlePs: 'ملکیتي صفت او ملکیتي ضمیر',
          columns: [
            { key: 'adj', labelEn: 'Possessive Adjective + Noun', labelPs: 'ملکیتي صفت + اسم' },
            { key: 'pron', labelEn: 'Possessive Pronoun (alone)', labelPs: 'ملکیتي ضمیر (یوازې)' }
          ],
          rows: [
            { adj: { en: 'This is my book.', ps: 'دا زما کتاب دی.' }, pron: { en: 'This book is mine.', ps: 'دا کتاب زما دی.' } },
            { adj: { en: 'That is your pen.', ps: 'دا ستا قلم دی.' }, pron: { en: 'That pen is yours.', ps: 'دا قلم ستا دی.' } },
            { adj: { en: 'This is her bag.', ps: 'دا د هغې بکس دی.' }, pron: { en: 'This bag is hers.', ps: 'دا بکس د هغې دی.' } }
          ]
        }
      ],
      confusingPairs: [
        { wordA: 'its', wordB: "it's", noteEn: '"its" shows possession (its color); "it\'s" is short for "it is".', notePs: '"its" ملکیت ښیي (its color)؛ "it\'s" د "it is" لنډه بڼه ده.' }
      ],
      mistake: {
        wrong: 'This is mine book.',
        correct: 'This is my book. / This book is mine.',
        noteEn: 'Never put "mine" (or any possessive pronoun) directly before a noun — use the possessive adjective "my" instead.',
        notePs: 'هیڅکله "mine" (یا کوم بل ملکیتي ضمیر) مستقیم له اسم مخکې مه ږدئ — پرځای یې ملکیتي صفت "my" وکاروئ.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'tableChoice',
          promptEn: 'Which is correct: "This is ___ book" (mine / my)?',
          promptPs: 'کوم سم دی: "This is ___ book" (mine / my)؟',
          options: [ { en: 'mine' }, { en: 'my' } ],
          correctIndex: 1,
          explanationEn: 'Before a noun ("book"), use the possessive adjective "my", not "mine".',
          explanationPs: 'له اسم ("book") مخکې، ملکیتي صفت "my" وکاروئ، نه "mine".',
          weakTag: 'possessives'
        },
        {
          id: 'q2', type: 'tableChoice',
          promptEn: 'Which is correct: "This book is ___" (my / mine)?',
          promptPs: 'کوم سم دی: "This book is ___" (my / mine)؟',
          options: [ { en: 'my' }, { en: 'mine' } ],
          correctIndex: 1,
          explanationEn: 'Standing alone with no noun after it, use the possessive pronoun "mine".',
          explanationPs: 'کله چې یوازې راځي پرته له اسم چې وروسته یې راشي، ملکیتي ضمیر "mine" وکاروئ.',
          weakTag: 'possessives'
        }
      ]
    },

    // ── F11: Word Families Intro (embeds the 4 starter families) ────
    'gw_f011': {
      id: 'gw_f011', levelId: 'beginner1', level: 'Beginner (Stage 1)', category: 'wordskills',
      title: 'Word Families', titlePs: 'د کلمو کورنۍ',
      overviewEn: 'A word family is a group of related words built from the same base word — usually a noun form, a verb form, an adjective form, and an adverb form. Learning one family gives you several new words at once.',
      overviewPs: 'د کلمو کورنۍ د اړوندو کلمو یوه ډله ده چې د یوې ورته بنسټیزې کلمې نه جوړېږي — معمولا اسمي بڼه، فعلي بڼه، صفتي بڼه، او قیدي بڼه. یوه کورنۍ زده کول تاسو ته یوځل ډېرې نوې کلمې درکوي.',
      formula: 'base word → noun / verb / adjective / adverb forms',
      wordFamilies: [
        {
          base: 'act', noun: 'action', verb: 'act', adjective: 'active', adverb: 'actively',
          relatedMeaningEn: 'to do something / the thing done',
          relatedMeaningPs: 'یو څه ترسره کول / ترسره شوی کار',
          exampleEn: 'She took quick action to help her community.',
          examplePs: 'هغې د خپلې ټولنې د مرستې لپاره ژر عمل وکړ.',
          mistakeNoteEn: 'Do not say "she did an act to help" for this meaning — use "action".',
          mistakeNotePs: 'د دې مانا لپاره "she did an act to help" مه واياست — "action" وکاروئ.'
        },
        {
          base: 'help', noun: 'help / helper', verb: 'help', adjective: 'helpful', adverb: 'helpfully',
          relatedMeaningEn: 'giving support to someone',
          relatedMeaningPs: 'چا ته د ملاتړ ورکول',
          exampleEn: 'My neighbor is always very helpful.',
          examplePs: 'زما ګاونډی تل ډېر مرستندوی دی.',
          mistakeNoteEn: 'Do not say "he is very help" — use the adjective "helpful".',
          mistakeNotePs: '"he is very help" مه واياست — صفت "helpful" وکاروئ.'
        },
        {
          base: 'care', noun: 'care', verb: 'care', adjective: 'careful / careless', adverb: 'carefully',
          relatedMeaningEn: 'paying attention (or not) to avoid mistakes/harm',
          relatedMeaningPs: 'د غلطیو یا زیان مخنیوي لپاره پاملرنه (یا بې پاملرنې)',
          exampleEn: 'Please drive carefully on this road.',
          examplePs: 'مهرباني وکړئ، پدې سړک کې په پاملرنه سره موټر وچلوئ.',
          mistakeNoteEn: '"careful" describes a person or action; "carefully" describes HOW an action is done.',
          mistakeNotePs: '"careful" یو شخص یا کار بیانوي؛ "carefully" بیانوي چې کار څنګه ترسره کیږي.'
        },
        {
          base: 'teach', noun: 'teacher / teaching', verb: 'teach', adjective: 'teachable', adverb: '',
          relatedMeaningEn: 'helping someone learn',
          relatedMeaningPs: 'چا ته د زده کړې کولو مرسته',
          exampleEn: 'My English teacher explains grammar very clearly.',
          examplePs: 'زما د انګلیسي ښوونکی ګرامر ډېر روښانه بیانوي.',
          mistakeNoteEn: 'Do not say "she is my teach" — the person is a "teacher"; "teach" is the verb (to teach).',
          mistakeNotePs: '"she is my teach" مه واياست — شخص "teacher" دی؛ "teach" فعل دی (زده ورکول).'
        }
      ],
      mistake: {
        wrong: 'He is very help. / She did an act to help.',
        correct: 'He is very helpful. / She took action to help.',
        noteEn: 'Match the RIGHT form of the family to the job it does in the sentence — noun, verb, adjective, or adverb.',
        notePs: 'د کورنۍ سمه بڼه د جملې د دندې سره برابره کړئ — اسم، فعل، صفت، یا قید.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'wordFamily',
          promptEn: 'My neighbor is always very ___. (help)',
          promptPs: 'زما ګاونډی تل ډېر ___ دی. (help)',
          options: [ { en: 'help' }, { en: 'helpful' }, { en: 'helper' } ],
          correctIndex: 1,
          explanationEn: 'To describe a person\'s quality, use the adjective form: "helpful".',
          explanationPs: 'د یو شخص ځانګړتیا بیانولو لپاره، صفتي بڼه وکاروئ: "helpful".',
          weakTag: 'word-families'
        },
        {
          id: 'q2', type: 'wordFamily',
          promptEn: 'She took quick ___ to help. (act)',
          promptPs: 'هغې د مرستې لپاره ژر ___ وکړ. (act)',
          options: [ { en: 'act' }, { en: 'action' }, { en: 'active' } ],
          correctIndex: 1,
          explanationEn: 'The noun form of "act" meaning "the thing done" is "action".',
          explanationPs: 'د "act" اسمي بڼه چې د "ترسره شوي کار" مانا لري "action" ده.',
          weakTag: 'word-families'
        }
      ]
    },

    // ── F12: Silent Letters Intro ─────────────────────────────────────
    'gw_f012': {
      id: 'gw_f012', levelId: 'elementary', level: 'Elementary', category: 'wordskills',
      title: 'Silent Letters', titlePs: 'چوپ توري',
      overviewEn: 'Some English words have letters that are WRITTEN but not PRONOUNCED. Knowing which letters are silent helps you spell and pronounce words correctly.',
      overviewPs: 'ځینې انګلیسي کلمې داسې توري لري چې لیکل کیږي خو نه ویل کیږي. پوهیدل چې کوم توري چوپ دي، تاسو سره د کلمو د لیکلو او تلفظ کولو کې مرسته کوي.',
      formula: 'Written letter ≠ always pronounced',
      silentLetterNotes: [
        { en: 'knife', ps: 'چاړه', noteEn: 'The "k" is silent — say "nife".', notePs: '"k" چوپ دی — "nife" ووایاست.' },
        { en: 'listen', ps: 'اورېدل', noteEn: 'The "t" is silent — say "lissen".', notePs: '"t" چوپ دی — "lissen" ووایاست.' },
        { en: 'climb', ps: 'خیژل', noteEn: 'The "b" is silent — say "cly-m".', notePs: '"b" چوپ دی — "cly-m" ووایاست.' },
        { en: 'hour', ps: 'ساعت', noteEn: 'The "h" is silent — say "our".', notePs: '"h" چوپ دی — "our" ووایاست.' }
      ],
      mistake: {
        wrong: 'Pronouncing every letter in "knife" as "k-nife".',
        correct: '"knife" is pronounced "nife" — the k is silent.',
        noteEn: 'Do not try to pronounce every written letter — some English spelling keeps old letters that are no longer spoken.',
        notePs: 'هر لیکل شوی توری مه ولولئ — ځینې انګلیسي لیکدود زاړه توري ساتي چې نور نه ویل کیږي.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'silentLetter',
          promptEn: 'Which letter is SILENT in the word "knife"?',
          promptPs: 'په کلمه "knife" کې کوم توری چوپ دی؟',
          options: [ { en: 'n' }, { en: 'k' }, { en: 'f' } ],
          correctIndex: 1,
          explanationEn: 'The "k" at the start of "knife" is not pronounced.',
          explanationPs: 'د "knife" په پیل کې "k" نه ویل کیږي.',
          weakTag: 'silent-letters'
        },
        {
          id: 'q2', type: 'silentLetter',
          promptEn: 'Which letter is SILENT in the word "hour"?',
          promptPs: 'په کلمه "hour" کې کوم توری چوپ دی؟',
          options: [ { en: 'h' }, { en: 'o' }, { en: 'r' } ],
          correctIndex: 0,
          explanationEn: 'The "h" at the start of "hour" is not pronounced — it sounds like "our".',
          explanationPs: 'د "hour" په پیل کې "h" نه ویل کیږي — لکه "our" اوریدل کیږي.',
          weakTag: 'silent-letters'
        }
      ]
    },

    // ── F13: Same-Sound Words / Homophones Intro ─────────────────────
    'gw_f013': {
      id: 'gw_f013', levelId: 'elementary', level: 'Elementary', category: 'wordskills',
      title: 'Same-Sound Words (Homophones)', titlePs: 'همغږي کلمې',
      overviewEn: 'Homophones are words that SOUND the same but have different spelling and different meaning. Listening alone is not enough — you must know the sentence meaning to choose the right spelling.',
      overviewPs: 'همغږي کلمې هغه کلمې دي چې غږ یې ورته دی خو لیکدود او مانا یې توپیر لري. یوازې اوریدل کافي نه دي — د سمې لیکدود د غوره کولو لپاره باید د جملې مانا وپوهیږئ.',
      formula: 'Same sound, different spelling, different meaning',
      homophoneNotes: [
        { en: 'their / there / they\'re', ps: 'د دوی / هلته / دوی دي', noteEn: '"their" = possession, "there" = place, "they\'re" = they are.', notePs: '"their" = ملکیت، "there" = ځای، "they\'re" = دوی دي.' },
        { en: 'to / too / two', ps: 'ته / هم / دوه', noteEn: '"to" = direction, "too" = also/very, "two" = the number 2.', notePs: '"to" = لور، "too" = هم/ډېر، "two" = شمېره ۲.' },
        { en: 'write / right', ps: 'لیکل / سم', noteEn: '"write" = put words on paper, "right" = correct or a direction.', notePs: '"write" = پر کاغذ کلمې لیکل، "right" = سم یا لور.' }
      ],
      mistake: {
        wrong: 'I go too school. / Their coming to my house.',
        correct: 'I go to school. / They\'re coming to my house.',
        noteEn: 'Homophones are the #1 cause of spelling mistakes in English — always check the MEANING of the sentence, not just the sound.',
        notePs: 'همغږي کلمې په انګلیسي کې د لیکدود د غلطیو لومړنی لامل دي — تل د جملې مانا وګورئ، نه یوازې غږ.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'spellingSound',
          promptEn: 'Choose the correct word: "I go ___ school every day."',
          promptPs: 'سمه کلمه غوره کړئ: "I go ___ school every day."',
          options: [ { en: 'to' }, { en: 'too' }, { en: 'two' } ],
          correctIndex: 0,
          explanationEn: 'This sentence needs the direction word "to".',
          explanationPs: 'دې جملې ته د لور کلمه "to" ته اړتیا ده.',
          weakTag: 'homophones'
        },
        {
          id: 'q2', type: 'spellingSound',
          promptEn: 'Choose the correct word: "___ coming to my house tonight."',
          promptPs: 'سمه کلمه غوره کړئ: "___ coming to my house tonight."',
          options: [ { en: 'Their' }, { en: 'There' }, { en: "They're" } ],
          correctIndex: 2,
          explanationEn: '"They\'re" is short for "they are" — the sentence means "They are coming".',
          explanationPs: '"They\'re" د "they are" لنډه بڼه ده — جمله معنی لري "دوی راځي".',
          weakTag: 'homophones'
        }
      ]
    },

    // ── F14: Common Sentence Order Mistake ───────────────────────────
    'gw_f014': {
      id: 'gw_f014', levelId: 'elementary', level: 'Elementary', category: 'mistakes',
      title: 'Common Sentence-Order Mistake', titlePs: 'د جملې ترتیب عام غلطي',
      overviewEn: 'Pashto usually places the verb at the END of the sentence. English does not — the verb comes right after the subject, BEFORE the object. This is one of the most common mistakes for Pashto-speaking learners.',
      overviewPs: 'پښتو معمولا فعل د جملې په پای کې ږدي. انګلیسي داسې نه ده — فعل سمدلاسه له فاعل وروسته راځي، له مفعول مخکې. دا د پښتو ژبو زده\u200cکوونکو لپاره یو له ترټولو عامو غلطیو څخه دی.',
      formula: 'English: Subject + Verb + Object  (NOT Subject + Object + Verb)',
      forms: [
        { label: 'Correct English Order', labelPs: 'سم انګلیسي ترتیب', items: [
          { en: 'I speak English.', ps: 'زه انګلیسي خبرې کوم.', hl: ['speak'] },
          { en: 'She eats rice.', ps: 'هغه وریجې خوري.', hl: ['eats'] },
          { en: 'We study grammar.', ps: 'موږ ګرامر زده کوو.', hl: ['study'] }
        ]}
      ],
      confusingPairs: [
        { wordA: 'I English speak.', wordB: 'I speak English.', noteEn: 'The second is correct — the verb "speak" must come right after the subject "I", before the object "English".', notePs: 'دوهمه سمه ده — فعل "speak" باید سمدلاسه له فاعل "I" وروسته راشي، له مفعول "English" مخکې.' }
      ],
      mistake: {
        wrong: 'I English speak. / She rice eats.',
        correct: 'I speak English. / She eats rice.',
        noteEn: 'Never put the object before the verb in English — the order is always Subject + Verb + Object.',
        notePs: 'هیڅکله مفعول له فعل مخکې مه ږدئ — ترتیب تل دی: فاعل + فعل + مفعول.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'correctMistake',
          promptEn: 'Fix this sentence: "I English speak."',
          promptPs: 'دا جمله سمه کړئ: "I English speak."',
          options: [ { en: 'English I speak.' }, { en: 'I speak English.' }, { en: 'Speak I English.' } ],
          correctIndex: 1,
          explanationEn: 'The correct order is Subject + Verb + Object: "I speak English."',
          explanationPs: 'سم ترتیب دی فاعل + فعل + مفعول: "I speak English."',
          weakTag: 'word-order'
        },
        {
          id: 'q2', type: 'correctMistake',
          promptEn: 'Fix this sentence: "She rice eats."',
          promptPs: 'دا جمله سمه کړئ: "She rice eats."',
          options: [ { en: 'She eats rice.' }, { en: 'Rice she eats.' }, { en: 'Eats she rice.' } ],
          correctIndex: 0,
          explanationEn: 'The verb "eats" must come right after the subject "She", before the object "rice".',
          explanationPs: 'فعل "eats" باید سمدلاسه له فاعل "She" وروسته راشي، له مفعول "rice" مخکې.',
          weakTag: 'word-order'
        }
      ]
    },

    // ===================================================================
    // PHASE I6B1 — Part 10: sound/spelling/confusing-word category
    // foundation. Four small starter topics proving each of the 9
    // requested category types renders and practices correctly. This is
    // intentionally small — full content for each category comes in a
    // later phase. Two new lightweight schema fields are introduced here
    // (synonymPairs, britishAmerican) — see the "HOW TO ADD CONTENT
    // LATER" header comment at the top of this file for how to extend
    // them; both are additive/optional, exactly like every other I6B
    // field, so no existing topic or renderer path is affected.
    // ===================================================================

    // ── F15: Near-Synonyms (Same Meaning Words) ──────────────────────
    'gw_f015': {
      id: 'gw_f015', levelId: 'elementary', level: 'Elementary', category: 'wordskills',
      title: 'Near-Synonyms (Same Meaning Words)', titlePs: 'ورته مانا لرونکې کلمې',
      overviewEn: 'Some English words have a very close, similar meaning — but they are not always used in exactly the same way. Learning small differences helps you sound more natural.',
      overviewPs: 'ځینې انګلیسي کلمې ډېره نږدې، ورته مانا لري — خو تل په یو شان ډول نه کارول کیږي. کوچنی توپیرونه زده کول تاسو سره مرسته کوي چې نور طبیعي ښکاره شئ.',
      formula: 'Similar meaning ≠ always exactly interchangeable',
      synonymPairs: [
        {
          wordA: 'big', wordB: 'large',
          noteEn: 'Both describe size. "big" is more common in everyday speech; "large" sounds slightly more formal.',
          notePs: 'دواړه اندازه بیانوي. "big" په ورځني خبرو کې ډېر عام دی؛ "large" یو څه رسمي اوریدل کیږي.',
          exampleAEn: 'That is a big house.', exampleAPs: 'دا یو لوی کور دی.',
          exampleBEn: 'They need a large team.', exampleBPs: 'دوی یوې لویې ډلې ته اړتیا لري.'
        },
        {
          wordA: 'small', wordB: 'little',
          noteEn: '"small" is about size; "little" can also add a feeling of affection, not just size.',
          notePs: '"small" د اندازې په اړه دی؛ "little" کولی شي د مینې احساس هم ورزیات کړي، نه یوازې اندازه.',
          exampleAEn: 'I have a small room.', exampleAPs: 'زه یوه کوچنۍ خونه لرم.',
          exampleBEn: 'She has a little sister.', exampleBPs: 'هغه یوه کوچنۍ خور لري.'
        },
        {
          wordA: 'start', wordB: 'begin',
          noteEn: 'These mean almost the same thing. "start" is more common in casual speech; "begin" is common in writing.',
          notePs: 'دا نږدې ورته مانا لري. "start" په عادي خبرو کې ډېر عام دی؛ "begin" په لیکنه کې عام دی.',
          exampleAEn: 'Let’s start the class.', exampleAPs: 'راځئ ټولګی پیل کړو.',
          exampleBEn: 'The lesson will begin at 9.', exampleBPs: 'درس به د ۹ بجې پیل شي.'
        }
      ],
      mistake: {
        wrong: 'She has a big sister. (when you mean an older, beloved sister)',
        correct: 'She has a little sister. / She has an older sister.',
        noteEn: '"big sister" in English usually means a physically large sister, not an older one — use "older sister" for age.',
        notePs: '"big sister" په انګلیسي کې معمولا د جسمي پلوه لویه خور معنی لري، نه لویه عمره خور — د عمر لپاره "older sister" وکاروئ.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'choose',
          promptEn: 'Which word sounds more natural in writing: "The lesson will ___ at 9."',
          promptPs: 'کومه کلمه په لیکنه کې ډېره طبیعي اوریدل کیږي: "The lesson will ___ at 9."',
          options: [ { en: 'start' }, { en: 'begin' } ],
          correctIndex: 1,
          explanationEn: '"begin" is more common in written English for this kind of sentence.',
          explanationPs: '"begin" د دې ډول جملې لپاره په لیکل شوي انګلیسي کې ډېر عام دی.',
          weakTag: 'near-synonyms'
        }
      ]
    },

    // ── F16: Minimal Pairs & Confusing Words ──────────────────────────
    'gw_f016': {
      id: 'gw_f016', levelId: 'elementary', level: 'Elementary', category: 'wordskills',
      title: 'Minimal Pairs & Confusing Words', titlePs: 'نږدې غږونه او ګډوډونکې کلمې',
      overviewEn: 'A minimal pair is two words that differ by only one sound (like "bad" and "bat"). Confusing words are pairs that look or sound similar but have different meanings.',
      overviewPs: 'د غږ نږدې جوړه هغه دوه کلمې دي چې یوازې په یو غږ توپیر لري (لکه "bad" او "bat"). ګډوډونکې کلمې هغه جوړې دي چې ورته ښکاري یا اوریدل کیږي خو مانا یې توپیر لري.',
      formula: 'Minimal pair: one sound differs. Confusing pair: similar form, different meaning.',
      tables: [
        {
          id: 'minimal-pairs-table', titleEn: 'Minimal Pairs — One Sound Different', titlePs: 'د غږ نږدې جوړې — یو غږ توپیر',
          columns: [
            { key: 'a', labelEn: 'Word A', labelPs: 'لومړۍ کلمه' },
            { key: 'b', labelEn: 'Word B', labelPs: 'دویمه کلمه' }
          ],
          rows: [
            { a: 'bad', b: 'bat' },
            { a: 'ship', b: 'sheep' },
            { a: 'full', b: 'fool' },
            { a: 'pin', b: 'bin' }
          ]
        }
      ],
      confusingPairs: [
        { wordA: 'affect', wordB: 'effect', noteEn: '"affect" is usually a verb (to change something); "effect" is usually a noun (a result).', notePs: '"affect" معمولا فعل دی (یو څه بدلول)؛ "effect" معمولا اسم دی (پایله).' },
        { wordA: 'advice', wordB: 'advise', noteEn: '"advice" is a noun (a suggestion); "advise" is a verb (to suggest).', notePs: '"advice" اسم دی (وړاندیز)؛ "advise" فعل دی (وړاندیز کول).' },
        { wordA: 'borrow', wordB: 'lend', noteEn: 'You "borrow" something FROM someone; you "lend" something TO someone.', notePs: 'تاسو یو څه له چا "borrow" کوئ (پور اخلئ)؛ تاسو یو څه چا ته "lend" کوئ (پور ورکوئ).' }
      ],
      mistake: {
        wrong: 'Can you borrow me your pen? (when asking to receive)',
        correct: 'Can you lend me your pen?',
        noteEn: 'Use "lend" when someone gives something to you — "borrow" is for when YOU take something.',
        notePs: 'کله چې څوک تاسو ته یو څه درکوي "lend" وکاروئ — "borrow" د هغه وخت لپاره دی چې تاسو یو څه اخلئ.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'silentLetter',
          promptEn: 'Which word matches: a container you throw trash into — "pin" or "bin"?',
          promptPs: 'کومه کلمه سمون خوري: هغه لوښی چې کثافات پکې اچوئ — "pin" یا "bin"؟',
          options: [ { en: 'pin' }, { en: 'bin' } ],
          correctIndex: 1,
          explanationEn: '"bin" is a container for trash; "pin" is a small sharp object.',
          explanationPs: '"bin" د کثافاتو لوښی دی؛ "pin" یو کوچنی تیز شی دی.',
          weakTag: 'minimal-pairs'
        },
        {
          id: 'q2', type: 'choose',
          promptEn: 'Which is correct: "The rain will ___ our plans." (affect / effect)',
          promptPs: 'کوم سم دی: "The rain will ___ our plans." (affect / effect)',
          options: [ { en: 'affect' }, { en: 'effect' } ],
          correctIndex: 0,
          explanationEn: '"affect" is the verb here — the rain will change (affect) the plans.',
          explanationPs: 'دلته "affect" فعل دی — باران به پلانونه بدل (اغیزه) کړي.',
          weakTag: 'confusing-words'
        }
      ]
    },

    // ── F17: British vs American English ──────────────────────────────
    'gw_f017': {
      id: 'gw_f017', levelId: 'preintermediate', level: 'Intermediate (Preparation)', category: 'wordskills',
      title: 'British vs American English', titlePs: 'برتانوي او امریکايي انګلیسي',
      overviewEn: 'English is spoken differently in different countries. British and American English have small differences in spelling, pronunciation, and everyday words — both are correct English.',
      overviewPs: 'انګلیسي په بېلابېلو هېوادونو کې په بېل ډول ویل کیږي. برتانوي او امریکايي انګلیسي په لیکدود، تلفظ، او ورځنیو کلمو کې کوچني توپیرونه لري — دواړه سمه انګلیسي ده.',
      formula: 'British spelling/word ≠ wrong — just a different (also correct) English variety',
      britishAmerican: [
        { british: 'colour', american: 'color', typeEn: 'spelling', noteEn: 'British English often keeps the "u"; American English usually drops it.', notePs: 'برتانوي انګلیسي ډېری وخت "u" ساتي؛ امریکايي انګلیسي معمولا لرې کوي یې.' },
        { british: 'centre', american: 'center', typeEn: 'spelling', noteEn: 'British "-re" often becomes American "-er".', notePs: 'برتانوي "-re" ډېری وخت امریکايي "-er" کیږي.' },
        { british: 'organise', american: 'organize', typeEn: 'spelling', noteEn: 'British English often uses "-ise"; American English uses "-ize".', notePs: 'برتانوي انګلیسي ډېری وخت "-ise" کاروي؛ امریکايي انګلیسي "-ize" کاروي.' },
        { british: 'travelled', american: 'traveled', typeEn: 'spelling', noteEn: 'British English often doubles the final "l"; American English usually does not.', notePs: 'برتانوي انګلیسي ډېری وخت وروستی "l" دوه چنده کوي؛ امریکايي انګلیسي معمولا نه کوي.' },
        { british: 'lift', american: 'elevator', typeEn: 'terminology', noteEn: 'Same machine, different everyday word.', notePs: 'ورته ماشین، بېله ورځنۍ کلمه.' },
        { british: 'lorry', american: 'truck', typeEn: 'terminology', noteEn: 'Same vehicle, different everyday word.', notePs: 'ورته موټر، بېله ورځنۍ کلمه.' },
        { british: 'flat', american: 'apartment', typeEn: 'terminology', noteEn: 'Same type of home, different everyday word.', notePs: 'د کور ورته ډول، بېله ورځنۍ کلمه.' },
        { british: 'pavement', american: 'sidewalk', typeEn: 'terminology', noteEn: 'Same part of the street, different everyday word.', notePs: 'د سړک ورته برخه، بېله ورځنۍ کلمه.' }
      ],
      explanationSections: [
        {
          id: 'gw-f017-pron', titleEn: 'A Note on Pronunciation', titlePs: 'د تلفظ يادونه',
          textEn: 'British and American accents also sound different — for example, British speakers often do not pronounce the "r" at the end of a word ("car"), while American speakers usually do. Both are correct; the important thing is to be clear and consistent.',
          textPs: 'برتانوي او امریکايي تلفظ هم بېل اوریدل کیږي — د بېلګې په توګه، برتانوي ویونکي ډېری وخت د کلمې په پای کې "r" نه تلفظ کوي ("car")، خو امریکايي ویونکي یې معمولا تلفظ کوي. دواړه سم دي؛ مهمه خبره روښانه او ثابت ویل دي.'
        }
      ],
      mistake: {
        wrong: 'Marking "colour" as a spelling mistake because "color" is the only correct form.',
        correct: 'Both "colour" (British) and "color" (American) are correct — just pick one style and stay consistent.',
        noteEn: 'Neither British nor American spelling is "more correct" — the mistake is mixing both styles in the same piece of writing.',
        notePs: 'نه برتانوي او نه امریکايي لیکدود "ډېر سم" دی — غلطي داده چې دواړه ډولونه په یوه لیکنه کې ګډ کړئ.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'wordFamily',
          promptEn: 'Which word is the American spelling of "colour"?',
          promptPs: 'کومه کلمه د "colour" امریکايي لیکدود دی؟',
          options: [ { en: 'color' }, { en: 'colur' }, { en: 'coulour' } ],
          correctIndex: 0,
          explanationEn: 'American English drops the "u": "color".',
          explanationPs: 'امریکايي انګلیسي "u" لرې کوي: "color".',
          weakTag: 'british-american'
        },
        {
          id: 'q2', type: 'choose',
          promptEn: 'In British English, what do people usually call an "elevator"?',
          promptPs: 'په برتانوي انګلیسي کې، خلک معمولا "elevator" ته څه وایي؟',
          options: [ { en: 'lift' }, { en: 'lorry' }, { en: 'flat' } ],
          correctIndex: 0,
          explanationEn: 'British English calls it a "lift".',
          explanationPs: 'برتانوي انګلیسي ورته "lift" وايي.',
          weakTag: 'british-american'
        }
      ]
    },

    // ── F18: Pashto-Speaker Pronunciation Notes ───────────────────────
    // Deliberately very small — the FULL, detailed version of this
    // content already lives in the app's Listening Room → Sound Pairs
    // feature (v/w, p/b, th/t, with audio). This topic only introduces
    // the CONCEPT inside Grammar World and points the student to that
    // existing feature for full practice, rather than duplicating it.
    'gw_f018': {
      id: 'gw_f018', levelId: 'starter', level: 'Starter', category: 'wordskills',
      title: 'Pronunciation Trouble Spots for Pashto Speakers', titlePs: 'د پښتو ژبو لپاره د تلفظ ستونزمن ځایونه',
      overviewEn: 'A few English sounds are easy to mix up for Pashto speakers, because Pashto does not separate them the same way. Being aware of these helps you speak more clearly.',
      overviewPs: 'یو څو انګلیسي غږونه د پښتو ژبو لپاره په اسانۍ سره ګډوډېدی شي، ځکه چې پښتو دوی په ورته ډول نه بېلوي. د دوی پوهاوی تاسو سره مرسته کوي چې ډېر روښانه خبرې وکړئ.',
      formula: 'Two different English sounds → one Pashto "feel" → easy to mix up',
      confusingPairs: [
        { wordA: 'v (vine)', wordB: 'w (wine)', noteEn: 'For "v", upper teeth touch the lower lip. For "w", the lips round without touching the teeth.', notePs: 'د "v" لپاره، پورتنۍ غاښونه لاندنۍ شونډې ته لګیږي. د "w" لپاره، شونډې دوریږي پرته له غاښونو سره د لګېدو.' },
        { wordA: 'p (pat)', wordB: 'b (bat)', noteEn: '"p" is voiceless (no vibration in the throat); "b" is voiced (you feel vibration).', notePs: '"p" بې غږه دی (په ستوني کې کومپن نشته)؛ "b" غږناک دی (کومپن احساسیږي).' }
      ],
      mistake: {
        wrong: 'Saying "wery wine" instead of "very fine".',
        correct: '"very fine" — with a clear "v" sound (teeth touching lip).',
        noteEn: 'Practice the "v" sound separately from "w" until the difference feels natural.',
        notePs: 'د "v" غږ د "w" نه بېل تمرین کړئ تر څو توپیر طبیعي احساس شي.'
      },
      practiceItems: [
        {
          id: 'q1', type: 'spellingSound',
          promptEn: 'Which word starts with the "v" sound (teeth touching lip)?',
          promptPs: 'کومه کلمه د "v" غږ سره پیل کیږي (غاښونه شونډې ته لګیږي)؟',
          options: [ { en: 'vine' }, { en: 'wine' } ],
          correctIndex: 0,
          explanationEn: '"vine" starts with "v" — upper teeth touch the lower lip.',
          explanationPs: '"vine" د "v" سره پیل کیږي — پورتنۍ غاښونه لاندنۍ شونډې ته لګیږي.',
          weakTag: 'pronunciation-trouble-spots'
        }
      ]
    }

  }; // end GW_CURRICULUM_TOPICS
  window.GW_CURRICULUM_TOPICS = GW_CURRICULUM_TOPICS;

})();
// === END grammar-curriculum-map.js ===
