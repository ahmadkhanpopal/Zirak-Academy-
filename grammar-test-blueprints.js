/* ============================================================================
   grammar-test-blueprints.js — PHASE I6H-D5
   GRAMMAR TEST BLUEPRINT MAP (data only — renders nothing).
   ----------------------------------------------------------------------------
   This file defines the full grammar-test architecture so Topic Tests, Daily
   Tests, and future Weekly/Two-Week/Monthly tests can share ONE taxonomy
   instead of each phase inventing its own categories.

   FOUR SECTIONS:
   1. BRANCHES     — the 11 top-level grammar branches (A–K) + subbranches.
   2. LEVELS       — Starter → Advanced School Grammar, each listing which
                     branches/subbranches belong there.
   3. QUESTION_TYPES — the 25 required question types, each declaring which
                     D2B grader it routes through (graderFor() in
                     zirak-academy-tests.js is the single source of truth for
                     grading logic — this map only DECLARES the intended
                     route per type, it does not implement grading).
   4. TOPIC_MAP    — every REAL topic that exists today (46 Foundation Grammar
                     Lab topics + 23 Grammar World topics), each tagged with
                     branch/subbranch/level/testBlueprintKey. Branches with no
                     built topics yet (Modals, Voice, Reported Speech,
                     Conditionals, most of Phrases/Clauses, Word Formation)
                     are declared in BRANCHES/LEVELS as the planned road, but
                     have no TOPIC_MAP entries — nothing here claims content
                     exists where it does not.

   NOT built here (per phase scope): Weekly/Monthly test screens, a second
   test engine, a second ledger, new TTS/mic systems. This file is read by
   zirak-academy-tests.js as an OPTIONAL data source; if absent, everything
   falls back to current behavior unchanged (checked with typeof guards).
   ============================================================================ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════
     1. BRANCHES — the full grammar road (A–K from the phase spec)
     ══════════════════════════════════════════════════════════════════════ */
  var BRANCHES = {
    foundations: {
      title: 'Foundations', order: 1,
      subbranches: ['word-vs-sentence', 'subject-verb-object', 'basic-sentence-order',
        'am-is-are', 'basic-positive-negative-question', 'simple-sentence-building']
    },
    'parts-of-speech': {
      title: 'Parts of Speech', order: 2,
      subbranches: ['noun', 'pronoun', 'verb', 'adjective', 'adverb',
        'preposition', 'conjunction', 'interjection', 'articles-determiners']
    },
    'sentence-system': {
      title: 'Sentence System', order: 3,
      subbranches: ['subject', 'predicate', 'object', 'complement', 'modifier',
        'phrase', 'clause', 'sentence-kinds', 'simple-sentence', 'compound-sentence',
        'complex-sentence', 'compound-complex-sentence', 'punctuation', 'capitalization']
    },
    tenses: {
      title: 'Tenses', order: 4,
      subbranches: ['present-simple', 'present-continuous', 'past-simple', 'future-simple',
        'present-perfect', 'past-continuous', 'future-going-to', 'perfect-tenses',
        'perfect-continuous-tenses', 'mixed-tense-comparison']
    },
    modals: {
      title: 'Modals', order: 5,
      subbranches: ['can-could', 'may-might', 'must', 'should', 'would',
        'have-to', 'need-to', 'modal-negatives', 'modal-questions']
    },
    voice: {
      title: 'Active / Passive Voice', order: 6,
      subbranches: ['active-passive-meaning', 'object-to-subject', 'by-doer',
        'present-simple-passive', 'past-simple-passive', 'future-passive',
        'modal-passive', 'passive-without-by']
    },
    'reported-speech': {
      title: 'Direct / Indirect Speech', order: 7,
      subbranches: ['direct-speech', 'indirect-speech', 'said-told', 'pronoun-change',
        'tense-backshift', 'time-word-change', 'statements', 'questions', 'commands', 'requests']
    },
    conditionals: {
      title: 'Conditionals', order: 8,
      subbranches: ['zero-conditional', 'first-conditional', 'second-conditional',
        'third-conditional', 'mixed-conditional', 'unless', 'if-vs-when']
    },
    'phrases-clauses': {
      title: 'Phrases / Clauses', order: 9,
      subbranches: ['noun-phrase', 'verb-phrase', 'adjective-phrase', 'adverb-phrase',
        'prepositional-phrase', 'independent-clause', 'dependent-clause', 'noun-clause',
        'adjective-clause', 'adverb-clause', 'relative-clause', 'conditional-clause']
    },
    'word-formation': {
      title: 'Word Formation', order: 10,
      subbranches: ['prefix', 'suffix', 'root-word', 'noun-form', 'verb-form',
        'adjective-form', 'adverb-form', 'synonym', 'antonym', 'opposite',
        'singular-plural', 'masculine-feminine', 'degrees', 'verb-forms']
    },
    'mixed-review': {
      title: 'Mixed Review', order: 11,
      subbranches: ['mixed-correction', 'transformation', 'pashto-to-english', 'section-wise-review']
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
     2. LEVELS — Starter → Advanced School Grammar
     Each level lists branch/subbranch keys expected at that stage. Levels
     reference subbranches that may not have TOPIC_MAP entries yet — that is
     the planned road, not a claim of built content.
     ══════════════════════════════════════════════════════════════════════ */
  var LEVELS = {
    starter: {
      title: 'Starter', order: 1,
      focus: ['foundations.word-vs-sentence', 'parts-of-speech.noun', 'parts-of-speech.pronoun',
        'foundations.am-is-are', 'parts-of-speech.articles-determiners', 'parts-of-speech.adjective',
        'foundations.subject-verb-object']
    },
    'beginner-1': {
      title: 'Beginner 1', order: 2,
      focus: ['parts-of-speech.noun', 'word-formation.singular-plural', 'parts-of-speech.pronoun',
        'parts-of-speech.articles-determiners', 'sentence-system.simple-sentence',
        'tenses.present-simple', 'tenses.present-continuous', 'parts-of-speech.preposition',
        'parts-of-speech.conjunction']
    },
    'beginner-2': {
      title: 'Beginner 2', order: 3,
      focus: ['parts-of-speech.pronoun', 'parts-of-speech.adverb', 'word-formation.degrees',
        'parts-of-speech.noun', 'tenses.past-simple', 'tenses.future-simple',
        'sentence-system.sentence-kinds', 'foundations.basic-positive-negative-question']
    },
    elementary: {
      title: 'Elementary', order: 4,
      focus: ['modals.can-could', 'modals.must', 'modals.should', 'tenses.past-continuous',
        'tenses.present-perfect', 'parts-of-speech.preposition', 'parts-of-speech.conjunction',
        'sentence-system.punctuation', 'phrases-clauses.noun-phrase']
    },
    'pre-intermediate': {
      title: 'Pre-Intermediate', order: 5,
      focus: ['tenses.mixed-tense-comparison', 'voice.active-passive-meaning',
        'reported-speech.direct-speech', 'phrases-clauses.relative-clause',
        'conditionals.zero-conditional', 'conditionals.first-conditional',
        'word-formation.prefix', 'word-formation.suffix']
    },
    intermediate: {
      title: 'Intermediate', order: 6,
      focus: ['tenses.perfect-tenses', 'voice.past-simple-passive', 'voice.present-simple-passive',
        'reported-speech.tense-backshift', 'conditionals.second-conditional',
        'conditionals.third-conditional', 'phrases-clauses.dependent-clause']
    },
    'upper-intermediate': {
      title: 'Upper-Intermediate', order: 7,
      focus: ['conditionals.mixed-conditional', 'voice.modal-passive', 'voice.passive-without-by',
        'reported-speech.commands', 'reported-speech.requests',
        'sentence-system.complex-sentence', 'parts-of-speech.conjunction']
    },
    'advanced-school-grammar': {
      title: 'Advanced School Grammar', order: 8,
      focus: ['mixed-review.mixed-correction', 'mixed-review.transformation',
        'word-formation.verb-forms', 'sentence-system.compound-complex-sentence',
        'mixed-review.section-wise-review']
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
     3. QUESTION_TYPES — grading route declarations (D2B graderFor() in
     zirak-academy-tests.js is the actual implementation; this only documents
     the intended mapping so future content authors pick the right type).
     ══════════════════════════════════════════════════════════════════════ */
  var QUESTION_TYPES = {
    choose:                 { guide: 'Multiple choice — one correct option.', grader: 'gradeExact', tts: true, pashtoVisual: true, mic: false },
    yesNo:                  { guide: 'Two-option yes/no check.', grader: 'gradeExact', tts: true, pashtoVisual: true, mic: false },
    fillBlank:               { guide: 'One missing word or short phrase.', grader: 'gradeNearExact', tts: true, pashtoVisual: true, mic: false },
    singleWord:               { guide: 'A single-word answer (synonym, plural, etc).', grader: 'gradeNearExact', tts: true, pashtoVisual: true, mic: false },
    correction:               { guide: 'Fix a wrong sentence into the correct one.', grader: 'gradeOverlap', tts: true, pashtoVisual: true, mic: false },
    transformation:           { guide: 'Rewrite a sentence in a new form (e.g. negative, question).', grader: 'gradeOverlap', tts: true, pashtoVisual: true, mic: false },
    translation:              { guide: 'Translate a Pashto sentence into English.', grader: 'gradeTranslation', preferAcceptableFirst: true, tts: false, pashtoVisual: true, mic: false, note: 'Hear Question never speaks the Pashto source — fixed English instruction only (D3A guard).' },
    speaking:                 { guide: 'Say the sentence aloud (future mic support).', grader: 'gradeOverlap', tts: true, pashtoVisual: true, mic: true, status: 'planned' },
    definition:               { guide: 'Match a term to its meaning.', grader: 'gradeExact', tts: true, pashtoVisual: true, mic: false },
    formula:                  { guide: 'Recognize the correct grammar structure/formula.', grader: 'gradeExact', mcOnly: true, tts: true, pashtoVisual: true, mic: false, note: 'Multiple-choice only — never free text (I6H-D2A fix).' },
    tenseChange:              { guide: 'Change a sentence from one tense to another.', grader: 'gradeOverlap', tts: true, pashtoVisual: true, mic: false },
    synonymAntonym:            { guide: 'Choose a synonym or antonym.', grader: 'gradeExact', tts: true, pashtoVisual: true, mic: false },
    wordForm:                  { guide: 'Choose the correct word form (noun/verb/adjective/adverb).', grader: 'gradeNearExact', tts: true, pashtoVisual: true, mic: false },
    singularPlural:            { guide: 'Give the singular or plural form.', grader: 'gradeNearExact', tts: true, pashtoVisual: true, mic: false },
    comparativeSuperlative:    { guide: 'Give the comparative or superlative form.', grader: 'gradeNearExact', tts: true, pashtoVisual: true, mic: false },
    subjectObjectPronoun:      { guide: 'Choose the correct subject or object pronoun.', grader: 'gradeExact', tts: true, pashtoVisual: true, mic: false },
    negativeQuestion:          { guide: 'Make a sentence negative or turn it into a question.', grader: 'gradeOverlap', tts: true, pashtoVisual: true, mic: false },
    punctuation:               { guide: 'Fix capitalization or punctuation.', grader: 'gradeNearExact', tts: false, pashtoVisual: true, mic: false, note: 'Punctuation/capitalization is not meaningfully spoken — TTS off by default.' },
    articleDeterminer:         { guide: 'Choose a/an/the or another determiner.', grader: 'gradeExact', tts: true, pashtoVisual: true, mic: false },
    prepositionChoice:         { guide: 'Choose the correct preposition.', grader: 'gradeExact', tts: true, pashtoVisual: true, mic: false },
    conjunctionJoin:           { guide: 'Join two sentences with the correct conjunction.', grader: 'gradeOverlap', tts: true, pashtoVisual: true, mic: false },
    passiveTransformation:     { guide: 'Change active voice to passive voice.', grader: 'gradeOverlap', tts: true, pashtoVisual: true, mic: false, status: 'planned' },
    reportedSpeech:            { guide: 'Change direct speech into reported speech.', grader: 'gradeOverlap', tts: true, pashtoVisual: true, mic: false, status: 'planned' },
    conditionalCompletion:     { guide: 'Complete an if-sentence correctly.', grader: 'gradeOverlap', tts: true, pashtoVisual: true, mic: false, status: 'planned' },
    clauseIdentify:            { guide: 'Identify a clause type inside a sentence.', grader: 'gradeExact', tts: true, pashtoVisual: true, mic: false, status: 'planned' }
  };

  /* ══════════════════════════════════════════════════════════════════════
     4. TOPIC_MAP — every REAL topic today, tagged to a branch/level.
     Keys match the actual ids used in the app: 'gl.topic.*' (Foundation
     Grammar Lab) and 'gw_*' (Grammar World, merged GW_TOPICS + curriculum).
     ══════════════════════════════════════════════════════════════════════ */
  var TOPIC_MAP = {
    /* ---- Foundation Grammar Lab (46 topics, path order 1–46) ---- */
    'gl.topic.word-vs-sentence':                 { branch:'foundations', sub:'word-vs-sentence', level:'starter', key:'foundations.word-vs-sentence' },
    'gl.topic.subject-verb':                     { branch:'foundations', sub:'subject-verb-object', level:'starter', key:'foundations.subject-verb-object' },
    'gl.topic.subject-verb-object':              { branch:'foundations', sub:'subject-verb-object', level:'starter', key:'foundations.subject-verb-object' },
    'gl.topic.noun-basics':                      { branch:'parts-of-speech', sub:'noun', level:'starter', key:'parts-of-speech.noun' },
    'gl.topic.common-proper-nouns':               { branch:'parts-of-speech', sub:'noun', level:'starter', key:'parts-of-speech.noun' },
    'gl.topic.plural-s-es':                       { branch:'word-formation', sub:'singular-plural', level:'beginner-1', key:'word-formation.singular-plural' },
    'gl.topic.article-a-an':                      { branch:'parts-of-speech', sub:'articles-determiners', level:'starter', key:'parts-of-speech.articles-determiners' },
    'gl.topic.article-the-basic':                 { branch:'parts-of-speech', sub:'articles-determiners', level:'starter', key:'parts-of-speech.articles-determiners' },
    'gl.topic.subject-pronouns':                  { branch:'parts-of-speech', sub:'pronoun', level:'starter', key:'parts-of-speech.pronoun' },
    'gl.topic.am-is-are':                         { branch:'foundations', sub:'am-is-are', level:'starter', key:'foundations.am-is-are' },
    'gl.topic.subject-pronouns-deeper':           { branch:'parts-of-speech', sub:'pronoun', level:'beginner-1', key:'parts-of-speech.pronoun' },
    'gl.topic.be-positive-review':                { branch:'foundations', sub:'am-is-are', level:'beginner-1', key:'foundations.am-is-are' },
    'gl.topic.be-negative':                       { branch:'foundations', sub:'basic-positive-negative-question', level:'beginner-1', key:'foundations.basic-positive-negative-question' },
    'gl.topic.be-questions':                      { branch:'foundations', sub:'basic-positive-negative-question', level:'beginner-1', key:'foundations.basic-positive-negative-question' },
    'gl.topic.be-short-answers':                  { branch:'foundations', sub:'basic-positive-negative-question', level:'beginner-1', key:'foundations.basic-positive-negative-question' },
    'gl.topic.this-that-these-those':             { branch:'parts-of-speech', sub:'articles-determiners', level:'beginner-1', key:'parts-of-speech.articles-determiners' },
    'gl.topic.possessive-adjectives-basic':       { branch:'parts-of-speech', sub:'pronoun', level:'beginner-1', key:'parts-of-speech.pronoun' },
    'gl.topic.adjectives-with-be-basic':          { branch:'parts-of-speech', sub:'adjective', level:'beginner-1', key:'parts-of-speech.adjective' },
    'gl.topic.foundation-mixed-be-review':        { branch:'mixed-review', sub:'section-wise-review', level:'beginner-1', key:'mixed-review.section-wise-review' },
    'gl.topic.noun-phrase-basics':                { branch:'phrases-clauses', sub:'noun-phrase', level:'beginner-1', key:'phrases-clauses.noun-phrase' },
    'gl.topic.articles-review-a-an-the':          { branch:'parts-of-speech', sub:'articles-determiners', level:'beginner-1', key:'parts-of-speech.articles-determiners' },
    'gl.topic.countable-uncountable-basic':       { branch:'parts-of-speech', sub:'noun', level:'beginner-2', key:'parts-of-speech.noun' },
    'gl.topic.regular-plurals-deeper':            { branch:'word-formation', sub:'singular-plural', level:'beginner-2', key:'word-formation.singular-plural' },
    'gl.topic.irregular-plurals-tiny-intro':      { branch:'word-formation', sub:'singular-plural', level:'beginner-2', key:'word-formation.singular-plural' },
    'gl.topic.some-any-basic':                    { branch:'parts-of-speech', sub:'articles-determiners', level:'beginner-2', key:'parts-of-speech.articles-determiners' },
    'gl.topic.many-much-basic':                   { branch:'parts-of-speech', sub:'articles-determiners', level:'beginner-2', key:'parts-of-speech.articles-determiners' },
    "gl.topic.possessive-s-basic":                { branch:'parts-of-speech', sub:'noun', level:'beginner-2', key:'parts-of-speech.noun' },
    'gl.topic.noun-phrase-building-checkpoint':   { branch:'phrases-clauses', sub:'noun-phrase', level:'beginner-2', key:'phrases-clauses.noun-phrase' },
    'gl.topic.simple-present-meaning':            { branch:'tenses', sub:'present-simple', level:'beginner-1', key:'tenses.present-simple' },
    'gl.topic.simple-present-base-verb':          { branch:'tenses', sub:'present-simple', level:'beginner-1', key:'tenses.present-simple' },
    'gl.topic.third-person-s-basic':              { branch:'tenses', sub:'present-simple', level:'beginner-1', key:'tenses.present-simple' },
    'gl.topic.third-person-spelling-s-es-ies':    { branch:'tenses', sub:'present-simple', level:'beginner-2', key:'tenses.present-simple' },
    'gl.topic.have-has-basic':                    { branch:'tenses', sub:'present-simple', level:'beginner-1', key:'tenses.present-simple' },
    'gl.topic.simple-present-negative':           { branch:'tenses', sub:'present-simple', level:'beginner-2', key:'tenses.present-simple' },
    'gl.topic.simple-present-yes-no-questions':   { branch:'tenses', sub:'present-simple', level:'beginner-2', key:'tenses.present-simple' },
    'gl.topic.simple-present-wh-light':           { branch:'tenses', sub:'present-simple', level:'beginner-2', key:'tenses.present-simple' },
    'gl.topic.daily-routine-checkpoint':          { branch:'mixed-review', sub:'section-wise-review', level:'beginner-2', key:'mixed-review.section-wise-review' },
    'gl.topic.present-continuous-meaning':        { branch:'tenses', sub:'present-continuous', level:'beginner-1', key:'tenses.present-continuous' },
    'gl.topic.am-is-are-verb-ing':                { branch:'tenses', sub:'present-continuous', level:'beginner-1', key:'tenses.present-continuous' },
    'gl.topic.ing-spelling':                      { branch:'tenses', sub:'present-continuous', level:'beginner-2', key:'tenses.present-continuous' },
    'gl.topic.pc-all-pronouns':                   { branch:'tenses', sub:'present-continuous', level:'beginner-1', key:'tenses.present-continuous' },
    'gl.topic.pc-negative':                       { branch:'tenses', sub:'present-continuous', level:'beginner-2', key:'tenses.present-continuous' },
    'gl.topic.pc-yes-no-questions':                { branch:'tenses', sub:'present-continuous', level:'beginner-2', key:'tenses.present-continuous' },
    'gl.topic.pc-wh-light':                        { branch:'tenses', sub:'present-continuous', level:'beginner-2', key:'tenses.present-continuous' },
    'gl.topic.sp-vs-pc-intro':                     { branch:'tenses', sub:'mixed-tense-comparison', level:'beginner-2', key:'tenses.mixed-tense-comparison' },
    'gl.topic.now-actions-checkpoint':             { branch:'mixed-review', sub:'section-wise-review', level:'beginner-2', key:'mixed-review.section-wise-review' },

    /* ---- Grammar World (23 topics: 5 original gw_00x + 18 gw_f0xx) ---- */
    gw_001: { branch:'foundations', sub:'am-is-are', level:'starter', key:'foundations.am-is-are' },
    gw_002: { branch:'tenses', sub:'present-simple', level:'beginner-1', key:'tenses.present-simple' },
    gw_003: { branch:'tenses', sub:'present-continuous', level:'beginner-1', key:'tenses.present-continuous' },
    gw_004: { branch:'modals', sub:'can-could', level:'elementary', key:'modals.can-could' },
    gw_005: { branch:'modals', sub:'should', level:'elementary', key:'modals.should' },
    gw_f001: { branch:'foundations', sub:'word-vs-sentence', level:'starter', key:'foundations.word-vs-sentence' },
    gw_f002: { branch:'foundations', sub:'subject-verb-object', level:'starter', key:'foundations.subject-verb-object' },
    gw_f003: { branch:'foundations', sub:'subject-verb-object', level:'starter', key:'foundations.subject-verb-object' },
    gw_f004: { branch:'parts-of-speech', sub:'noun', level:'starter', key:'parts-of-speech.noun' },
    gw_f005: { branch:'parts-of-speech', sub:'verb', level:'starter', key:'parts-of-speech.verb' },
    gw_f006: { branch:'parts-of-speech', sub:'adjective', level:'starter', key:'parts-of-speech.adjective' },
    gw_f007: { branch:'parts-of-speech', sub:'adverb', level:'starter', key:'parts-of-speech.adverb' },
    gw_f008: { branch:'parts-of-speech', sub:'pronoun', level:'starter', key:'parts-of-speech.pronoun' },
    gw_f009: { branch:'parts-of-speech', sub:'pronoun', level:'beginner-1', key:'parts-of-speech.pronoun' },
    gw_f010: { branch:'parts-of-speech', sub:'pronoun', level:'beginner-1', key:'parts-of-speech.pronoun' },
    gw_f011: { branch:'word-formation', sub:'root-word', level:'beginner-1', key:'word-formation.root-word' },
    gw_f012: { branch:'word-formation', sub:'root-word', level:'elementary', key:'word-formation.root-word' },
    gw_f013: { branch:'word-formation', sub:'synonym', level:'elementary', key:'word-formation.synonym' },
    gw_f014: { branch:'mixed-review', sub:'mixed-correction', level:'elementary', key:'mixed-review.mixed-correction' },
    gw_f015: { branch:'word-formation', sub:'synonym', level:'elementary', key:'word-formation.synonym' },
    gw_f016: { branch:'word-formation', sub:'synonym', level:'elementary', key:'word-formation.synonym' },
    gw_f017: { branch:'word-formation', sub:'synonym', level:'pre-intermediate', key:'word-formation.synonym' },
    gw_f018: { branch:'word-formation', sub:'synonym', level:'starter', key:'word-formation.synonym' }
  };

  window.ZirakGrammarBlueprints = {
    BRANCHES: BRANCHES,
    LEVELS: LEVELS,
    QUESTION_TYPES: QUESTION_TYPES,
    TOPIC_MAP: TOPIC_MAP,
    // Small lookup helper — safe even if a topic id isn't mapped yet.
    lookupTopic: function (topicId) { return TOPIC_MAP[topicId] || null; }
  };
})();
