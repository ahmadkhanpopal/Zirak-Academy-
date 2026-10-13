/* ============================================================================
   grammar-lab-engine.js — PHASE I6C
   GRAMMAR LAB / GRAMMAR WIZARD ENGINE FOUNDATION
   ----------------------------------------------------------------------------
   PURPOSE
   Extends Grammar World IN-PLACE into the Grammar Lab. This file is the ONE
   home for: the Grammar Lab family/branch registry, the reusable wizard+test
   item runner, the Reference Index foundation, the word-building demo hooks,
   the planned-placeholder explainers, and the weak-record extension contract.

   ONE-SYSTEM GUARANTEES (locked):
   - Renders into the SAME container as Grammar World (#grammar-cards-list),
     navigated by the SAME window.renderGrammarCards()/gwRenderLanding().
     No second grammar mount, route, or nav entry.
   - Speaks through the SAME window.speak() chain (saved speed, Stop Reading).
     No mic anywhere in this engine, so TTS/mic overlap is impossible here.
   - Guides live in the SAME window.ZirakPageGuides registry — this file
     INJECTS its guide entries into that registry at load. One guide system.
   - Weak answers save through the SAME gw_weak_items store via the exposed
     window.gwAddWeakItem() — extended shape, same reader. One review system.
   - Uses window.ZirakStorageKey per-student namespace via that same path.

   LOAD ORDER: after zirak-page-guides.js and grammar-curriculum-map.js,
   before/independent of grammar-world.js (all cross-calls are runtime).
   ============================================================================

   ────────────────────────────────────────────────────────────────────────────
   I6C FUTURE CONTRACTS — read before adding Grammar Lab content in I6D+
   ────────────────────────────────────────────────────────────────────────────
   ID CONVENTION (stable, dot-namespaced, lowercase-kebab tail):
     gl.cat.<family>            e.g. gl.cat.tenses, gl.cat.prepositions
     gl.topic.<topic>           e.g. gl.topic.simple-present
     gl.drill.<topic>-NNN       e.g. gl.drill.simple-present-001
     gl.test.<name>-NNN         e.g. gl.test.foundation-001
     gl.ref.<entry>             e.g. gl.ref.connector-because
     gl.session.<name>-NNN      e.g. gl.session.demo-wizard-001
     gl.tt.<name>               tongue twisters
   Existing curriculum ids (gw_f###, level ids like 'nursery') remain valid;
   the crosswalk is legacyLevelId/topicRef fields — never rename old ids.

   TOPIC CONTRACT (full future shape; optional fields simply skip rendering):
     { id, titleEn, titlePs, categoryId, levelNumber, visibleLevelName,
       status: 'active'|'demo'|'planned'|'locked'|'placeholder-ready',
       order, prerequisites[], nextTopics[], relatedTopics[],
       reasonForPlacementEn/Ps, lessonBlocks[], examples[], tables[],
       wizardModes[], drillTypes[], testTypes[], weakTags[], domainTags[],
       scenarioTags[], registerLabels[], referenceEntries[],
       pashtoSupport-per-field (…Ps twins), teacherNotes, futureNotes,
       schemaVersion }

   LESSON BLOCK TYPES (reusable, numbered): explanation | formula | examples |
     table | pashtoLogic | commonMistake | pronunciationNote | practicePrompt |
     miniTestHook | relatedWizardHook — each block: { type, en, ps, items[] }.
     Hear/Read hooks reuse the existing gwRead / speak chain.

   WIZARD MODES (one engine, mode field — implemented now: repeat, choose,
     fillBlank, correction, translationToEnglish, sentenceAnalysis(choose),
     connector(fillBlank), transformation(typed). Prepared by contract only:
     sentencePattern, sentenceExpansion, connectorJoin, connectorSplit,
     listeningPronunciation, tablePractice, slowNormalFast, pronounSubstitute).

   DRILL/TEST ITEM CONTRACT:
     { id, mode, topicRef, categoryId, levelNumber, weakTags[], domainTags[],
       promptEn, promptPs, hearText?, choices[]?, acceptable[]?,
       wrongSentence?, feedbackEn, feedbackPs, registerLabels?, scenarioTags? }

   WEAK RECORD CONTRACT (extends the existing gw_weak_items shape — base
   fields unchanged so the existing Weak Grammar Review reader keeps working):
     base:  topicId, topicTitle, itemId, mistakeType, questionText,
            correctAnswer, studentAnswer, timestamp
     I6C+:  schemaVersion, weakTags[], domainTags[], categoryId, levelNumber,
            masteryStatus('weak'→future: learning/practiced/tested/mastered),
            reviewDue (ms epoch; future spaced review: same day/+1d/+3d/+7d),
            attempts, sourceMode('lesson'|'wizard'|'test'|'correction'|
            'translation'|'pronunciation')

   REFERENCE ENTRY CONTRACT:
     { id, itemEn, meaningPs, levelNumber, categoryId, exampleEn,
       registerLabels[], weakTags[], relatedTopicRef, hear=true }

   WORD/VOCAB HOOKS (contract proven by the demos in this file; full engine
   connects to Word Lab in a later phase — same shapes, no second word system):
     prefix/suffix: { id, affix, kind, meaningEn, meaningPs, groupMeaning,
       examples[{from,to}], spellingNote? }
     confusable:    { id, a, b, tipEn, tipPs, exampleA, exampleB }
     tongueTwister: { id, textEn, level, targetSounds[], meaningPs,
       mouthTipPs, steps:['slow','normal','fast'], weakTags[] }

   SAFE DEFAULT RENDERING: unknown future families/topics render with the
   default card + planned explainer path in this file — no rebuild needed.
   ──────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var SCHEMA_VERSION = 1;
  var PENDING = 'Pashto translation pending.';

  function ps(v) {
    if (window.ZirakPageGuides && window.ZirakPageGuides.ps) return window.ZirakPageGuides.ps(v);
    var s = (v === undefined || v === null) ? '' : String(v).trim();
    return s ? s : PENDING;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function speakText(t) {
    if (!t) return;
    try { if (typeof window.speak === 'function') { window.speak(String(t), 'en'); return; } } catch (e) {}
  }
  function cancelSpeech() {
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }
  function glEl() { return document.getElementById('grammar-cards-list'); }
  function guideCard(id) {
    try { return window.ZirakPageGuides ? window.ZirakPageGuides.cardHtml(id) : ''; } catch (e) { return ''; }
  }
  function guideAuto(id) {
    try { if (window.ZirakPageGuides) window.ZirakPageGuides.autoSpeak(id); } catch (e) {}
  }
  function norm(s) {
    return String(s || '').toLowerCase()
      .replace(/[.,!?;:'"“”‘’]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* ── L1–L10 mapping over EXISTING levels (no renaming) ─────────────────── */
  function levelInfo(levelId) {
    var levels = window.GW_LEVELS || [];
    for (var i = 0; i < levels.length; i++) {
      if (levels[i].id === levelId) {
        return { levelNumber: levels[i].order, visibleLevelName: levels[i].titleEn, l10Label: 'L' + levels[i].order };
      }
    }
    return { levelNumber: null, visibleLevelName: levelId || '', l10Label: '' };
  }
  function firstOpenLevelId() {
    var levels = (window.GW_LEVELS || []).slice().sort(function (a, b) { return a.order - b.order; });
    for (var i = 0; i < levels.length; i++) if (!levels[i].locked) return levels[i].id;
    return levels.length ? levels[0].id : null;
  }

  /* ==========================================================================
     GRAMMAR LAB FAMILY REGISTRY — all 33 locked branches.
     status: active (works now via existing systems) | demo (small working
     demo in this phase) | planned (structured explainer placeholder).
     demoAction for demo/active rows: path|wizard|test|reference|wordbuilding|review
     ========================================================================== */
  var FAMILIES = [
    { id:'gl.cat.foundation', order:1, status:'active', demoAction:'foundationPath', span:[1,3],
      titleEn:'Foundation Grammar', titlePs:'بنسټیز ګرامر',
      descEn:'Real beginner path (I6D): words, sentences, nouns, plurals, articles, pronouns, am/is/are.' },
    { id:'gl.cat.parts-of-speech', order:2, status:'planned', span:[1,3],
      titleEn:'Parts of Speech', titlePs:'د وینا برخې',
      whyEn:'It names every word type, so lessons can talk about words clearly.',
      whyPs:'د هرې کلمې ډول نوموي ترڅو لوستونه روښانه شي.',
      learnFirstEn:'Noun basics, verb basics, simple sentences',
      learnFirstPs:'لومړی: نومونه، فعلونه او ساده جملې.',
      helpsEn:'Helps every later grammar family.' },
    { id:'gl.cat.nouns-articles', order:3, status:'demo', demoAction:'wizard', span:[1,4],
      titleEn:'Nouns, Articles, Determiners', titlePs:'نومونه، ارتیکلونه او ټاکونکي',
      descEn:'Demo: choose a or an. Full noun and determiner depth comes later.' },
    { id:'gl.cat.pronouns-wh', order:4, status:'demo', demoAction:'wizard', span:[1,5],
      titleEn:'Pronouns and WH-Words', titlePs:'ضمیرونه او پوښتنیزې کلیمې',
      descEn:'Demo: choose the correct WH word. Full pronoun tables come later.' },
    { id:'gl.cat.adjectives-adverbs', order:5, status:'planned', span:[2,6],
      titleEn:'Adjectives, Adverbs, Comparison', titlePs:'صفتونه، قیدونه او پرتلنه',
      whyEn:'Describing and comparing needs nouns and verbs first.',
      whyPs:'توصیف او پرتلنه لومړی نومونو او فعلونو ته اړتیا لري.',
      learnFirstEn:'Noun basics, be verb, simple sentences',
      learnFirstPs:'لومړی: نومونه، be فعل او ساده جملې.',
      helpsEn:'Helps strengths/weaknesses answers and rich speaking.' },
    { id:'gl.cat.verbs-forms', order:6, status:'planned', span:[1,6],
      titleEn:'Verbs, Helping Verbs, Verb Forms', titlePs:'فعلونه، مرستندویه فعلونه او بڼې',
      whyEn:'Verb forms power every tense, question, and passive later.',
      whyPs:'د فعل بڼې وروسته هره زمانه، پوښتنه او مجهول چلوي.',
      learnFirstEn:'Subject and verb, be verb, simple present',
      learnFirstPs:'لومړی: فاعل او فعل، be فعل، ساده اوسمهال.',
      helpsEn:'Foundation for tenses, modals, and passive.' },
    { id:'gl.cat.tenses', order:7, status:'demo', demoAction:'wizard', span:[2,7],
      titleEn:'Tenses', titlePs:'زمانې',
      descEn:'Demo: simple present items. The full tense map comes later.' },
    { id:'gl.cat.questions-negatives', order:8, status:'demo', demoAction:'test', span:[2,6],
      titleEn:'Questions, Negatives, Short Answers', titlePs:'پوښتنې، منفي او لنډ ځوابونه',
      descEn:'Demo: question correction and transformation in Tests and Drills.' },
    { id:'gl.cat.prepositions', order:9, status:'demo', demoAction:'wizard', span:[2,7],
      titleEn:'Prepositions and Preposition Precision', titlePs:'سربلونه او دقیق کارول',
      descEn:'Demo: in / on / at. The precision layer (since/for, by/until) comes later.' },
    { id:'gl.cat.sentence-analysis', order:10, status:'demo', demoAction:'wizard', span:[3,8],
      titleEn:'Sentence Structure and Analysis', titlePs:'د جملې جوړښت او شننه',
      descEn:'Demo: find the object. Full breakdown cards and patterns come later.' },
    { id:'gl.cat.phrases-clauses', order:11, status:'planned', span:[4,9],
      titleEn:'Phrases and Clauses', titlePs:'عبارتونه او فقرې',
      whyEn:'Clauses need solid sentence foundation and conjunctions first.',
      whyPs:'فقرې لومړی ټینګ د جملې بنسټ او نښلوونکو ته اړتیا لري.',
      learnFirstEn:'Sentence parts, connectors, simple and compound sentences',
      learnFirstPs:'لومړی: د جملې برخې، نښلوونکي او ساده جملې.',
      helpsEn:'Unlocks relative clauses, writing, and long sentences.' },
    { id:'gl.cat.connectors', order:12, status:'demo', demoAction:'wizard', span:[3,8],
      titleEn:'Connectors and Sentence Relations', titlePs:'نښلوونکي او د جملو اړیکې',
      descEn:'Demo: because for reasons. Grouped relations (result, contrast) come later.' },
    { id:'gl.cat.modals', order:13, status:'demo', demoAction:'wizard', span:[2,8],
      titleEn:'Modals, Semi-Modals, Verb Patterns', titlePs:'موډل فعلونه او د فعل بڼې',
      descEn:'Demo: can + base verb. Full modal families come later.' },
    { id:'gl.cat.passive-causative', order:14, status:'planned', span:[5,9],
      titleEn:'Passive, Causative, Transformations', titlePs:'مجهول، سببي او بدلونونه',
      whyEn:'Passive becomes easy only after you know subject and object, active tenses, the be verb, and past participles.',
      whyPs:'مجهول هغه وخت اسانیږي چې فاعل او مفعول، فعلي زمانې، be فعل او تېره بڼه زده وي.',
      learnFirstEn:'Subject and object, active tenses, be verb, past participles',
      learnFirstPs:'لومړی: فاعل او مفعول، فعالې زمانې، be فعل او تېره بڼه.',
      helpsEn:'Helps formal writing, news English, and academic answers.' },
    { id:'gl.cat.corrections', order:15, status:'demo', demoAction:'test', span:[1,8],
      titleEn:'Common Mistakes and Corrections', titlePs:'عامې تېروتنې او سمونې',
      descEn:'Demo: wrong-to-correct drills in Tests and Drills. The full mistake map grows later.' },
    { id:'gl.cat.micro-usage', order:16, status:'planned', span:[4,9],
      titleEn:'Usage Differences / Precision Lab', titlePs:'د کارونې دقیق توپیرونه',
      whyEn:'Small differences (since/for, in the end/at the end) need the basics first.',
      whyPs:'کوچني توپیرونه لومړی بنسټیزو قواعدو ته اړتیا لري.',
      learnFirstEn:'Basic prepositions, basic tenses, common verbs',
      learnFirstPs:'لومړی: بنسټیز سربلونه، زمانې او عام فعلونه.',
      helpsEn:'Makes English precise and natural.' },
    { id:'gl.cat.functional-english', order:17, status:'planned', span:[2,8],
      titleEn:'Functional English / Communication', titlePs:'کارنده انګلیسي',
      whyEn:'Requesting, apologizing, and advising reuse grammar patterns you learn first.',
      whyPs:'غوښتنه، بخښنه او مشوره هغه ګرامر کاروي چې لومړی یې زده کوې.',
      learnFirstEn:'Questions, modals like can and should, polite forms',
      learnFirstPs:'لومړی: پوښتنې، can او should، مؤدبې بڼې.',
      helpsEn:'Feeds dialogues, interviews, and daily speaking.' },
    { id:'gl.cat.collocations', order:18, status:'planned', span:[3,9],
      titleEn:'Collocations and Natural English', titlePs:'د کلمو طبیعي جوړې',
      whyEn:'Natural pairs like make a decision come after core verbs and nouns.',
      whyPs:'طبیعي جوړې لومړی بنسټیزو فعلونو او نومونو ته اړتیا لري.',
      learnFirstEn:'Common verbs, common nouns, simple sentences',
      learnFirstPs:'لومړی: عام فعلونه، عام نومونه او ساده جملې.',
      helpsEn:'Makes speaking sound natural, not translated.' },
    { id:'gl.cat.phrasal-verbs', order:19, status:'planned', span:[4,9],
      titleEn:'Phrasal Verbs', titlePs:'ترکیبي فعلونه',
      whyEn:'Phrasal verbs need object and pronoun placement first: turn it on, not turn on it.',
      whyPs:'ترکیبي فعلونه لومړی د مفعول او ضمیر ځای ته اړتیا لري.',
      learnFirstEn:'Objects, object pronouns, common verbs',
      learnFirstPs:'لومړی: مفعولونه، مفعولي ضمیرونه او عام فعلونه.',
      helpsEn:'Essential for real spoken English.' },
    { id:'gl.cat.numbers-dates', order:20, status:'planned', span:[1,6],
      titleEn:'Numbers, Dates, Time, Money, Measurements', titlePs:'شمېرې، نېټې، وخت او پیسې',
      whyEn:'A practical branch for shopping, travel, school, and forms.',
      whyPs:'د پیرود، سفر، ښوونځي او فورمو لپاره عملي برخه.',
      learnFirstEn:'Basic numbers and simple questions',
      learnFirstPs:'لومړی: بنسټیزې شمېرې او ساده پوښتنې.',
      helpsEn:'Used in almost every real-life scenario.' },
    { id:'gl.cat.spelling-rules', order:21, status:'planned', span:[2,7],
      titleEn:'Spelling Rules', titlePs:'د املا قواعد',
      whyEn:'Spelling patterns (y to ies, drop e, doubling) connect to verb forms.',
      whyPs:'د املا قواعد د فعل له بڼو سره تړلي دي.',
      learnFirstEn:'Basic verb forms, plural nouns',
      learnFirstPs:'لومړی: د فعل بڼې او جمع نومونه.',
      helpsEn:'Feeds Word Lab, dictation, and writing.' },
    { id:'gl.cat.spoken-grammar', order:22, status:'planned', span:[3,9],
      titleEn:'Spoken Grammar, Stress, Rhythm', titlePs:'ویناییز ګرامر، فشار او رېتم',
      whyEn:'Natural speech patterns come after core sentences are automatic.',
      whyPs:'طبیعي وینا هغه وخت راځي چې بنسټیزې جملې اسانه شي.',
      learnFirstEn:'Core sentences, questions, Listening Room practice',
      learnFirstPs:'لومړی: بنسټیزې جملې، پوښتنې او د اورېدلو تمرین.',
      helpsEn:'Connects to Listening Room and shadowing.' },
    { id:'gl.cat.pronunciation-challenge', order:23, status:'demo', demoAction:'wordbuilding', span:[1,8],
      titleEn:'Tongue Twister / Pronunciation Challenge', titlePs:'ژبماتوونکي او د تلفظ ننګونه',
      descEn:'Demo: one professional tongue twister with target sounds and a Pashto mouth tip.' },
    { id:'gl.cat.punctuation', order:24, status:'planned', span:[2,8],
      titleEn:'Punctuation, Capitalization, Symbols', titlePs:'لیکنښې، لویتوري او سمبولونه',
      whyEn:'Punctuation rules support clauses and writing.',
      whyPs:'لیکنښې د فقرو او لیکنې ملاتړ کوي.',
      learnFirstEn:'Simple sentences and question forms',
      learnFirstPs:'لومړی: ساده جملې او پوښتنیزې بڼې.',
      helpsEn:'Required for writing and exams.' },
    { id:'gl.cat.writing-academic', order:25, status:'planned', span:[5,10],
      titleEn:'Writing, Paragraph, Essay, Academic', titlePs:'لیکنه، پراګراف او اکاډمیک',
      whyEn:'Essays need sentences, punctuation, connectors, and paragraphs first.',
      whyPs:'مقاله لومړی جملو، لیکنښو، نښلوونکو او پراګراف ته اړتیا لري.',
      learnFirstEn:'Sentence mastery, punctuation, connectors, paragraph flow',
      learnFirstPs:'لومړی: جملې، لیکنښې، نښلوونکي او د پراګراف بهیر.',
      helpsEn:'The academy-level writing target.' },
    { id:'gl.cat.reading-grammar', order:26, status:'planned', span:[3,9],
      titleEn:'Reading Grammar / Text Understanding', titlePs:'د لوستلو ګرامر',
      whyEn:'Reading long sentences needs reference words and connectors first.',
      whyPs:'اوږدې جملې لومړی اشاره ییزو کلمو او نښلوونکو ته اړتیا لري.',
      learnFirstEn:'Pronouns, connectors, sentence breakdown',
      learnFirstPs:'لومړی: ضمیرونه، نښلوونکي او د جملې شننه.',
      helpsEn:'Helps stories, news, and exam reading.' },
    { id:'gl.cat.register-politeness', order:27, status:'planned', span:[4,10],
      titleEn:'Register, Politeness, Formal/Informal', titlePs:'رسمي او غیر رسمي انګلیسي',
      whyEn:'Choosing formal or informal English needs wide grammar first.',
      whyPs:'رسمي یا غیر رسمي ټاکنه لومړی پراخ ګرامر غواړي.',
      learnFirstEn:'Modals, questions, functional English',
      learnFirstPs:'لومړی: موډلونه، پوښتنې او کارنده انګلیسي.',
      helpsEn:'Critical for interviews and offices.' },
    { id:'gl.cat.word-relations', order:28, status:'planned', span:[2,9],
      titleEn:'Word Relations (Synonyms, Confusables)', titlePs:'د کلمو اړیکې',
      whyEn:'Synonyms and confusables grow best on a base vocabulary.',
      whyPs:'مترادف او ورته کلمې لومړی بنسټیزو کلمو ته اړتیا لري.',
      learnFirstEn:'Word Lab basics and common words',
      learnFirstPs:'لومړی: د کلیمو لابراتوار بنسټونه.',
      helpsEn:'Connects Grammar Lab to Word Lab. Demo pair: quiet vs quite in Reference.' },
    { id:'gl.cat.word-building', order:29, status:'demo', demoAction:'wordbuilding', span:[3,9],
      titleEn:'Prefixes and Suffixes (Word Building)', titlePs:'مختاړي او وروستاړي',
      descEn:'Demo: un- prefix and -er suffix with spelling notes. Grouped families come later.' },
    { id:'gl.cat.domain-terminology', order:30, status:'planned', span:[4,10],
      titleEn:'Domain Terminology', titlePs:'مسلکي اصطلاحات',
      whyEn:'Medical, tech, and business terms need general vocabulary first.',
      whyPs:'مسلکي اصطلاحات لومړی عمومي کلمو ته اړتیا لري.',
      learnFirstEn:'Core vocabulary, word building, reading basics',
      learnFirstPs:'لومړی: بنسټیزې کلمې او د کلمو جوړونه.',
      helpsEn:'Feeds job, science, and health English.' },
    { id:'gl.cat.reference-index', order:31, status:'active', demoAction:'reference', span:[1,10],
      titleEn:'Reference Index and Tables', titlePs:'د حوالې لړلیک',
      descEn:'Searchable quick reference. Small demo entries now; grows with every phase.' },
    { id:'gl.cat.tests-review', order:32, status:'active', demoAction:'review', span:[1,10],
      titleEn:'Tests, Review, Weak Skills', titlePs:'ازموینې، بیاکتنه او ضعیف مهارتونه',
      descEn:'One review system: mistakes from lessons, wizard, and tests all land here.' },
    { id:'gl.cat.speaking-missions', order:33, status:'planned', span:[2,10],
      titleEn:'Domain/Scenario Speaking Missions', titlePs:'د خبرو ماموریتونه',
      whyEn:'Missions reuse grammar in real scenes: interview, doctor, taxi, market.',
      whyPs:'ماموریتونه ګرامر په ریښتینو حالتونو کې کاروي.',
      learnFirstEn:'Connectors, tenses, functional English',
      learnFirstPs:'لومړی: نښلوونکي، زمانې او کارنده انګلیسي.',
      helpsEn:'The bridge from grammar to confident speaking.' }
  ];

  /* ==========================================================================
     DEMO SESSIONS — ONE runner powers both kinds:
     kind 'wizard' = guided practice (calm, teach-as-you-go)
     kind 'test'   = scored mini-test (same items contract)
     ========================================================================== */
  var SESSIONS = {
    'gl.session.demo-wizard-001': {
      id: 'gl.session.demo-wizard-001', kind: 'wizard',
      titleEn: 'Grammar Wizard — Demo', titlePs: 'د ګرامر وزرډ — بېلګه',
      guideId: 'grammar-wizard',
      items: [
        { id:'gl.drill.can-basic-001', mode:'repeat', topicRef:'gl.topic.can-basic',
          categoryId:'gl.cat.modals', levelNumber:2, weakTags:['modal-can'], domainTags:['daily-life'],
          promptEn:'I can swim.', promptPs:'زه لامبو وهلی شم.',
          instructionEn:'Hear the sentence, then say it aloud clearly.',
          feedbackEn:'Good. can + base verb: I can swim.', feedbackPs:'ښه. can + اصلي فعل.' },
        { id:'gl.drill.article-a-an-001', mode:'choose', topicRef:'gl.topic.article-a-an',
          categoryId:'gl.cat.nouns-articles', levelNumber:1, weakTags:['article-a-an'], domainTags:['school'],
          promptEn:'Choose the correct article: ___ apple', promptPs:'سم ارتیکل وټاکه.',
          choices:['a','an','the'], answer:'an',
          feedbackEn:'Use an before a vowel sound: an apple.', feedbackPs:'له غږلرونکي غږ مخکې an راځي: an apple.' },
        { id:'gl.drill.prep-on-001', mode:'fillBlank', topicRef:'gl.topic.prep-in-on-at',
          categoryId:'gl.cat.prepositions', levelNumber:2, weakTags:['prep-in-on-at'], domainTags:['daily-life'],
          promptEn:'The book is ___ the table.', promptPs:'تشه ډکه کړه: کتاب پر مېز دی.',
          acceptable:['on'],
          feedbackEn:'We use on for a surface: on the table.', feedbackPs:'د سطحې لپاره on کاروو.' },
        { id:'gl.drill.simple-present-001', mode:'correction', topicRef:'gl.topic.simple-present',
          categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['third-person-s'], domainTags:['school'],
          wrongSentence:'She go to school.',
          promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
          acceptable:['she goes to school'],
          feedbackEn:'He / She / It takes verb + s: She goes.', feedbackPs:'له he/she/it سره فعل s اخلي: goes.' },
        { id:'gl.drill.translate-001', mode:'translationToEnglish', topicRef:'gl.topic.simple-present',
          categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['word-order'], domainTags:['school'],
          promptEn:'Write this Pashto sentence in English:', promptPs:'زه هره ورځ انګلیسي لولم.',
          acceptable:['i study english every day','i read english every day','every day i study english','every day i read english'],
          modelAnswer:'I study English every day.',
          feedbackEn:'Model answer: I study English every day.', feedbackPs:'انګلیسي ترتیب: فاعل + فعل + مفعول.' },
        { id:'gl.drill.svo-001', mode:'sentenceAnalysis', topicRef:'gl.topic.svo-breakdown',
          categoryId:'gl.cat.sentence-analysis', levelNumber:3, weakTags:['object-id'], domainTags:['school'],
          promptEn:'The teacher explains the lesson. Which part is the object?', promptPs:'مفعول کومه برخه ده؟',
          hearText:'The teacher explains the lesson.',
          choices:['The teacher','explains','the lesson'], answer:'the lesson',
          feedbackEn:'The object receives the action: the lesson.', feedbackPs:'مفعول هغه دی چې کار پرې کیږي: the lesson.' },
        { id:'gl.drill.connector-because-001', mode:'fillBlank', topicRef:'gl.topic.connector-because',
          categoryId:'gl.cat.connectors', levelNumber:3, weakTags:['connector-because'], domainTags:['daily-life'],
          promptEn:'I stay at home ___ it is raining.', promptPs:'د دلیل نښلوونکی ولیکه.',
          acceptable:['because'],
          feedbackEn:'because gives the reason.', feedbackPs:'because دلیل ښیي.' },
        { id:'gl.drill.wh-where-001', mode:'choose', topicRef:'gl.topic.wh-questions',
          categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['wh-where'], domainTags:['daily-life'],
          promptEn:'___ do you live?', promptPs:'د ځای پوښتنه وټاکه.',
          choices:['What','Where','Who'], answer:'Where',
          feedbackEn:'Where asks about place.', feedbackPs:'Where د ځای پوښتنه کوي.' }
      ]
    },
    'gl.session.demo-test-001': {
      id: 'gl.session.demo-test-001', kind: 'test',
      titleEn: 'Mini Test — Demo', titlePs: 'کوچنۍ ازموینه — بېلګه',
      guideId: 'grammar-tests',
      items: [
        { id:'gl.test.third-person-001', mode:'choose', topicRef:'gl.topic.simple-present',
          categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['third-person-s'], domainTags:['daily-life'],
          promptEn:'He ___ tea every morning.', promptPs:'سم فعل وټاکه.',
          choices:['drink','drinks','drinking'], answer:'drinks',
          feedbackEn:'He / She / It takes verb + s: drinks.', feedbackPs:'له he سره فعل s اخلي.' },
        { id:'gl.test.prep-at-001', mode:'fillBlank', topicRef:'gl.topic.prep-in-on-at',
          categoryId:'gl.cat.prepositions', levelNumber:2, weakTags:['prep-time-at'], domainTags:['school'],
          promptEn:'The class starts ___ eight.', promptPs:'د وخت سربل ولیکه.',
          acceptable:['at'],
          feedbackEn:'We use at for clock times: at eight.', feedbackPs:'د ساعت لپاره at کاروو.' },
        { id:'gl.test.question-helper-001', mode:'correction', topicRef:'gl.topic.wh-questions',
          categoryId:'gl.cat.questions-negatives', levelNumber:2, weakTags:['question-helper'], domainTags:['interview'],
          wrongSentence:'Where you live?',
          promptEn:'Correct this question:', promptPs:'دا پوښتنه سمه کړه.',
          acceptable:['where do you live'],
          feedbackEn:'Questions need do / does: Where do you live?', feedbackPs:'پوښتنې do/does ته اړتیا لري.' },
        { id:'gl.test.make-question-001', mode:'transformation', topicRef:'gl.topic.wh-questions',
          categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['question-order'], domainTags:['daily-life'],
          promptEn:'Make a question: You like tea.', promptPs:'پوښتنه ترې جوړه کړه.',
          acceptable:['do you like tea'],
          feedbackEn:'Start with Do: Do you like tea?', feedbackPs:'پوښتنه له Do سره پیل کړه.' }
      ]
    }
  };

  /* ── REFERENCE INDEX demo entries ──────────────────────────────────────── */
  var REFERENCE_ENTRIES = [
    { id:'gl.ref.connector-because', itemEn:'because', levelNumber:3, categoryId:'gl.cat.connectors',
      meaningPs:'ځکه چې — دلیل ښیي.', exampleEn:'I stay at home because it is raining.',
      registerLabels:['spoken','written'], weakTags:['connector-because'], relatedTopicRef:'gl.topic.connector-because' },
    { id:'gl.ref.article-a-an', itemEn:'a / an', levelNumber:1, categoryId:'gl.cat.nouns-articles',
      meaningPs:'له غږلرونکي غږ مخکې an، له نورو مخکې a.', exampleEn:'an apple, a book',
      registerLabels:['spoken','written'], weakTags:['article-a-an'], relatedTopicRef:'gl.topic.article-a-an' },
    { id:'gl.ref.prep-in-on-at-place', itemEn:'in / on / at (place)', levelNumber:2, categoryId:'gl.cat.prepositions',
      meaningPs:'ځای: in دننه، on پر سر، at په یوه ټکي.', exampleEn:'in the room, on the table, at the door',
      registerLabels:['spoken','written'], weakTags:['prep-in-on-at'], relatedTopicRef:'gl.topic.prep-in-on-at' },
    { id:'gl.ref.third-person-s', itemEn:'third-person -s', levelNumber:2, categoryId:'gl.cat.tenses',
      meaningPs:'له he/she/it سره فعل s اخلي.', exampleEn:'He works. She goes.',
      registerLabels:['written','exam'], weakTags:['third-person-s'], relatedTopicRef:'gl.topic.simple-present' },
    { id:'gl.ref.confusable-quiet-quite', itemEn:'quiet vs quite', levelNumber:4, categoryId:'gl.cat.word-relations',
      meaningPs:'quiet غلی؛ quite تر یوې کچې.', exampleEn:'a quiet room; quite good',
      registerLabels:['spoken','written'], weakTags:['confusable-quiet-quite'], relatedTopicRef:'gl.topic.confusables' },
    { id:'gl.ref.prefix-un', itemEn:'un- (prefix)', levelNumber:3, categoryId:'gl.cat.word-building',
      meaningPs:'un- منفي یا مخالف مانا ورکوي.', exampleEn:'happy → unhappy, safe → unsafe',
      registerLabels:['written'], weakTags:['prefix-un'], relatedTopicRef:'gl.topic.prefixes' }
  ];

  /* ── WORD-BUILDING / PRONUNCIATION demo hooks (Word Lab bridge contract) ── */
  var WORD_BUILDING = {
    schemaVersion: SCHEMA_VERSION,
    prefixes: [
      { id:'gl.wb.prefix-un', affix:'un-', kind:'prefix', groupMeaning:'negative',
        meaningEn:'not / the opposite', meaningPs:'منفي یا مخالف مانا ورکوي.',
        examples:[{from:'happy',to:'unhappy'},{from:'safe',to:'unsafe'}] }
    ],
    suffixes: [
      { id:'gl.wb.suffix-er', affix:'-er', kind:'suffix', groupMeaning:'noun-making (person who does)',
        meaningEn:'the person who does the action', meaningPs:'کوونکی جوړوي.',
        examples:[{from:'teach',to:'teacher'},{from:'play',to:'player'}],
        spellingNote:'Sometimes the spelling changes: run → runner.' }
    ],
    confusables: [
      { id:'gl.wb.confusable-quiet-quite', a:'quiet', b:'quite',
        tipEn:'quiet = no noise. quite = fairly / rather.',
        tipPs:'quiet غلی؛ quite تر یوې کچې.',
        exampleA:'Please be quiet.', exampleB:'The test was quite easy.' }
    ],
    tongueTwisters: [
      { id:'gl.tt.seashells', textEn:'She sells seashells by the seashore.',
        level:3, targetSounds:['s','sh'],
        meaningPs:'هغه د سمندر پر غاړه صدفونه پلوري.',
        mouthTipPs:'د sh لپاره شونډې لږې ګردې کړه او ژبه شاته بوځه.',
        steps:['slow','normal','fast'], weakTags:['sound-s-sh'] }
    ]
  };

  /* ── WEAK RECORD EXTENSION (one store; base fields untouched) ──────────── */
  function extendWeakRecord(rec, extra) {
    extra = extra || {};
    rec.schemaVersion = SCHEMA_VERSION;
    if (!rec.weakTags)   rec.weakTags   = extra.weakTags || (rec.mistakeType ? [rec.mistakeType] : []);
    if (!rec.domainTags) rec.domainTags = extra.domainTags || [];
    if (extra.categoryId  && !rec.categoryId)  rec.categoryId  = extra.categoryId;
    if (extra.levelNumber && !rec.levelNumber) rec.levelNumber = extra.levelNumber;
    if (!rec.masteryStatus) rec.masteryStatus = 'weak';
    if (!rec.reviewDue)     rec.reviewDue     = rec.timestamp || Date.now();
    if (rec.attempts === undefined) rec.attempts = 1;
    rec.sourceMode = extra.sourceMode || rec.sourceMode || 'lesson';
    return rec;
  }
  function saveWeakFromItem(item, studentAnswer, sessionTitle, kind) {
    try {
      var rec = {
        topicId: item.topicRef || item.categoryId || 'gl.session',
        topicTitle: sessionTitle || 'Grammar Lab',
        itemId: item.id,
        mistakeType: (item.weakTags && item.weakTags[0]) || item.mode,
        questionText: item.wrongSentence ? (item.promptEn + ' ' + item.wrongSentence) : item.promptEn,
        correctAnswer: correctAnswerText(item),
        studentAnswer: studentAnswer || '',
        timestamp: Date.now()
      };
      extendWeakRecord(rec, {
        weakTags: item.weakTags, domainTags: item.domainTags,
        categoryId: item.categoryId, levelNumber: item.levelNumber,
        sourceMode: kind === 'test' ? 'test'
                  : item.mode === 'correction' ? 'correction'
                  : item.mode === 'translationToEnglish' ? 'translation'
                  : 'wizard'
      });
      if (typeof window.gwAddWeakItem === 'function') window.gwAddWeakItem(rec);
    } catch (e) {}
  }
  function correctAnswerText(item) {
    if (item.answer) return item.answer;
    if (item.modelAnswer) return item.modelAnswer;
    if (item.acceptable && item.acceptable.length) return item.acceptable[0];
    return '';
  }

  /* ==========================================================================
     RUNNER — one engine for wizard + test kinds.
     ========================================================================== */
  var RUN = { sessionId:null, idx:0, correct:0, wrong:0, answered:false, selfChecked:0 };

  function openSession(sessionId) {
    var s = SESSIONS[sessionId];
    var el = glEl();
    if (!s || !el) return;
    cancelSpeech();
    RUN = { sessionId:sessionId, idx:0, correct:0, wrong:0, answered:false, selfChecked:0 };
    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="ZirakGrammarLab.exitSession()">' + (s.returnTopicId ? '← Back to Topic' : '← Grammar Lab') + '</button>' +
        guideCard(s.guideId) +
        '<div class="gl-run-head">' +
          '<div class="gl-run-title zk-readable">' + (s.kind === 'test' ? '📝 ' : '🪄 ') + esc(s.titleEn) + '</div>' +
          '<div class="gl-run-title-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(s.titlePs)) + '</div>' +
        '</div>' +
        '<div class="gl-run-body" id="gl-run-body"></div>' +
        '<div style="height:24px;"></div>' +
      '</div>';
    renderItem();
    guideAuto(s.guideId);
  }

  function currentSession() { return SESSIONS[RUN.sessionId]; }
  function currentItem() { var s = currentSession(); return s ? s.items[RUN.idx] : null; }

  function renderItem() {
    var s = currentSession(); if (!s) return;
    var body = document.getElementById('gl-run-body'); if (!body) return;
    if (RUN.idx >= s.items.length) { renderSummary(); return; }
    var item = s.items[RUN.idx];
    RUN.answered = false;

    var progress = '<div class="gl-run-progress zk-muted-readable">Item ' + (RUN.idx + 1) + ' of ' + s.items.length +
      (item.levelNumber ? ' · L' + item.levelNumber : '') + '</div>';

    var promptBlock =
      '<div class="gl-run-prompt zk-readable">' + esc(item.promptEn) + '</div>' +
      (item.wrongSentence ? '<div class="gl-run-wrong">✗ ' + esc(item.wrongSentence) + '</div>' : '') +
      '<div class="gl-run-prompt-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(item.promptPs)) + '</div>';

    var inputBlock = '';
    if (item.mode === 'repeat') {
      inputBlock =
        '<div class="gl-run-instruction zk-muted-readable">' + esc(item.instructionEn || 'Hear it, then say it aloud.') + '</div>' +
        '<div class="zk-action-row gl-run-actions">' +
          '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.hearItem()">🔊 Hear</button>' +
          '<button type="button" class="gl-btn gl-btn-primary" onclick="ZirakGrammarLab.repeatDone()">✔ I said it — Next</button>' +
        '</div>';
    } else if (item.choices) {
      inputBlock = '<div class="gl-run-choices">' +
        item.choices.map(function (c, i) {
          return '<button type="button" class="gl-choice zk-choice-readable" id="gl-choice-' + i + '" ' +
            'onclick="ZirakGrammarLab.choose(' + i + ')">' + esc(c) + '</button>';
        }).join('') + '</div>' +
        '<div class="zk-action-row gl-run-actions">' +
          '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.hearItem()">🔊 Hear</button>' +
        '</div>';
    } else {
      inputBlock =
        '<input type="text" class="gl-run-input" id="gl-run-input" autocomplete="off" autocapitalize="off" ' +
          'placeholder="Type your answer…" onkeydown="if(event.key===\'Enter\'){ZirakGrammarLab.checkText();}">' +
        '<div class="zk-action-row gl-run-actions">' +
          '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.hearItem()">🔊 Hear</button>' +
          '<button type="button" class="gl-btn gl-btn-primary" onclick="ZirakGrammarLab.checkText()">Check</button>' +
        '</div>';
    }

    body.innerHTML =
      progress + promptBlock + inputBlock +
      '<div class="gl-run-feedback" id="gl-run-feedback" style="display:none;"></div>';
  }

  function hearItem() {
    var item = currentItem(); if (!item) return;
    speakText(item.hearText || item.wrongSentence || item.promptEn);
  }

  function showFeedback(ok, item, studentAnswer) {
    var fb = document.getElementById('gl-run-feedback'); if (!fb) return;
    RUN.answered = true;
    if (ok) { RUN.correct++; } else {
      RUN.wrong++;
      saveWeakFromItem(item, studentAnswer, currentSession().titleEn, currentSession().kind);
    }
    fb.className = 'gl-run-feedback ' + (ok ? 'gl-fb-ok' : 'gl-fb-bad');
    fb.innerHTML =
      '<div class="gl-fb-line zk-readable">' + (ok ? '✅ Correct.' : '❌ Not yet. Correct answer: <b>' + esc(correctAnswerText(item)) + '</b>') + '</div>' +
      '<div class="gl-fb-line zk-readable">' + esc(item.feedbackEn || '') + '</div>' +
      '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(item.feedbackPs)) + '</div>' +
      '<div class="zk-action-row gl-run-actions">' +
        '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.hearCorrect()">🔊 Hear correct</button>' +
        '<button type="button" class="gl-btn gl-btn-primary" onclick="ZirakGrammarLab.next()">Next →</button>' +
      '</div>';
    fb.style.display = 'block';
    try { fb.scrollIntoView({ behavior:'smooth', block:'nearest' }); } catch (e) {}
  }

  // I6H-D20 FIX (Section 3.8 item 4): a self-confirmation ("I said it") must
  // never be recorded as a scored correct answer — it has no speech-
  // recognition evaluation of the actual linguistic target. This shows
  // encouraging feedback and lets the student continue, but tracks it as an
  // UNSCORED self-check (RUN.selfChecked), separate from RUN.correct/wrong,
  // and excludes it from the denominator used in the final score summary so
  // self-checked items neither inflate nor unfairly deflate mastery.
  function showSelfCheckFeedback(item) {
    var fb = document.getElementById('gl-run-feedback'); if (!fb) return;
    RUN.answered = true;
    RUN.selfChecked = (RUN.selfChecked || 0) + 1;
    fb.className = 'gl-run-feedback gl-fb-selfcheck';
    fb.innerHTML =
      '<div class="gl-fb-line zk-readable">🎙️ Recorded as spoken practice (self-check — not scored).</div>' +
      '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">د ویلو تمرین وشو (نه ارزول کیږي).</div>' +
      '<div class="gl-fb-line zk-readable">' + esc(item.feedbackEn || '') + '</div>' +
      '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(item.feedbackPs)) + '</div>' +
      '<div class="zk-action-row gl-run-actions">' +
        '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.hearCorrect()">🔊 Hear correct</button>' +
        '<button type="button" class="gl-btn gl-btn-primary" onclick="ZirakGrammarLab.next()">Next →</button>' +
      '</div>';
    fb.style.display = 'block';
    try { fb.scrollIntoView({ behavior:'smooth', block:'nearest' }); } catch (e) {}
  }

  function choose(i) {
    if (RUN.answered) return;
    var item = currentItem(); if (!item || !item.choices) return;
    var picked = item.choices[i];
    var ok = item.caseSensitive
      ? normCase(picked) === normCase(item.answer)
      : norm(picked) === norm(item.answer);
    var btn = document.getElementById('gl-choice-' + i);
    if (btn) btn.classList.add(ok ? 'gl-choice-ok' : 'gl-choice-bad');
    showFeedback(ok, item, picked);
  }
  function checkText() {
    if (RUN.answered) return;
    var item = currentItem(); if (!item) return;
    var inp = document.getElementById('gl-run-input');
    var val = inp ? inp.value : '';
    var acc = item.acceptable || [];
    var ok = false;
    for (var i = 0; i < acc.length; i++) {
      var hit = item.caseSensitive ? normCase(val) === normCase(acc[i]) : norm(val) === norm(acc[i]);
      if (hit) { ok = true; break; }
    }
    showFeedback(ok, item, val);
  }
  function repeatDone() {
    if (RUN.answered) return;
    var item = currentItem(); if (!item) return;
    // I6H-D20 FIX (Section 3.8 item 4): "I said it" is a self-confirmation,
    // not a speech-recognition-evaluated answer — record as unscored self-
    // check, never as an automatic scored correct answer.
    showSelfCheckFeedback(item);
  }
  function hearCorrect() {
    var item = currentItem(); if (!item) return;
    speakText(item.modelAnswer || (item.mode === 'fillBlank'
      ? item.promptEn.replace('___', correctAnswerText(item))
      : correctAnswerText(item)));
  }
  function next() {
    cancelSpeech();
    RUN.idx++;
    renderItem();
  }
  function renderSummary() {
    var s = currentSession(); var body = document.getElementById('gl-run-body');
    if (!s || !body) return;
    // I6H-D20 FIX (Section 3.8 item 4): self-checked ("I said it") items are
    // unscored and must not count in the score denominator, so a session
    // made mostly of self-check repeat items does not show a misleadingly
    // low "X / total" fraction, nor let self-checks inflate the numerator.
    var total = s.items.length - (RUN.selfChecked || 0);
    if (total < 0) total = 0;
    body.innerHTML =
      '<div class="gl-run-summary">' +
        '<div class="gl-run-summary-title zk-readable">' + (s.kind === 'test' ? '📝 Test finished' : '🪄 Practice finished') + '</div>' +
        '<div class="gl-run-summary-score zk-readable">Score: <b>' + RUN.correct + ' / ' + total + '</b></div>' +
        (RUN.selfChecked ? '<div class="zk-readable" style="opacity:0.75;font-size:12px;">(' + RUN.selfChecked + ' spoken self-check item(s) — not scored)</div>' : '') +
        (RUN.wrong > 0
          ? '<div class="zk-readable">Your mistakes were saved to Weak Grammar Review, so you can fix them.</div>' +
            '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">ستا تېروتنې د ضعیف ګرامر بیاکتنې ته خوندي شوې.</div>'
          : '<div class="zk-readable">Excellent — no mistakes this time.</div>' +
            '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">ډېر ښه — دا ځل هېڅ تېروتنه نه وه.</div>') +
        '<div class="zk-action-row gl-run-actions">' +
          (RUN.wrong > 0 && typeof window.gwReviewWeak === 'function'
            ? '<button type="button" class="gl-btn gl-btn-ghost" onclick="gwReviewWeak()">⭐ Review Weak Grammar</button>' : '') +
          '<button type="button" class="gl-btn gl-btn-primary" onclick="ZirakGrammarLab.exitSession()">' + (s.returnTopicId ? '← Back to Topic' : '← Back to Grammar Lab') + '</button>' +
        '</div>' +
      '</div>';
  }
  function exitToHome() {
    cancelSpeech();
    if (typeof window.renderGrammarCards === 'function') window.renderGrammarCards();
  }

  /* ==========================================================================
     REFERENCE INDEX — minimal foundation: contract + simple filter.
     ========================================================================== */
  function openReference() {
    var el = glEl(); if (!el) return;
    cancelSpeech();
    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="ZirakGrammarLab.exitToHome()">← Grammar Lab</button>' +
        guideCard('grammar-reference') +
        '<div class="gl-run-head">' +
          '<div class="gl-run-title zk-readable">🔎 Reference Index</div>' +
          '<div class="gl-run-title-ps zk-pashto-readable pashto" dir="rtl" lang="ps">د حوالې لړلیک</div>' +
        '</div>' +
        '<input type="search" class="gl-run-input" id="gl-ref-search" placeholder="Search reference…" ' +
          'oninput="ZirakGrammarLab.refFilter(this.value)">' +
        '<div id="gl-ref-list"></div>' +
        '<div style="height:24px;"></div>' +
      '</div>';
    refFilter('');
    guideAuto('grammar-reference');
  }
  function refFilter(q) {
    var list = document.getElementById('gl-ref-list'); if (!list) return;
    var n = norm(q);
    var entries = REFERENCE_ENTRIES.filter(function (e) {
      if (!n) return true;
      return norm(e.itemEn).indexOf(n) !== -1 ||
             norm(e.exampleEn).indexOf(n) !== -1 ||
             (e.meaningPs || '').indexOf(q.trim()) !== -1;
    });
    if (!entries.length) {
      list.innerHTML = '<div class="gl-ref-empty zk-muted-readable">No entries found. More reference entries arrive in future phases.</div>';
      return;
    }
    list.innerHTML = entries.map(function (e) {
      return '<div class="gl-ref-card">' +
        '<div class="gl-ref-top">' +
          '<span class="gl-ref-item zk-readable">' + esc(e.itemEn) + '</span>' +
          (e.levelNumber ? '<span class="gl-badge gl-badge-level">L' + e.levelNumber + '</span>' : '') +
        '</div>' +
        '<div class="gl-ref-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(e.meaningPs)) + '</div>' +
        '<div class="gl-ref-ex zk-muted-readable">' + esc(e.exampleEn) + '</div>' +
        '<div class="zk-action-row gl-run-actions">' +
          '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.hearRef(\'' + esc(e.id) + '\')">🔊 Hear</button>' +
          '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.openSession(\'gl.session.demo-wizard-001\')">🪄 Practice</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }
  function hearRef(id) {
    for (var i = 0; i < REFERENCE_ENTRIES.length; i++) {
      if (REFERENCE_ENTRIES[i].id === id) {
        speakText(REFERENCE_ENTRIES[i].itemEn + '. ' + REFERENCE_ENTRIES[i].exampleEn);
        return;
      }
    }
  }

  /* ==========================================================================
     FAMILIES BROWSER + PLANNED EXPLAINERS (placeholders are never dead).
     ========================================================================== */
  function statusBadge(f) {
    if (f.status === 'active') return '<span class="gl-badge gl-badge-active">Active</span>';
    if (f.status === 'demo')   return '<span class="gl-badge gl-badge-demo">Demo</span>';
    return '<span class="gl-badge gl-badge-planned">📌 Planned</span>';
  }
  function openFamilies() {
    var el = glEl(); if (!el) return;
    cancelSpeech();
    var rows = FAMILIES.slice().sort(function (a, b) { return a.order - b.order; }).map(function (f) {
      return '<button type="button" class="gl-fam-row" onclick="ZirakGrammarLab.openFamily(\'' + esc(f.id) + '\')">' +
        '<div class="gl-fam-main">' +
          '<div class="gl-fam-title zk-readable">' + esc(f.titleEn) + '</div>' +
          '<div class="gl-fam-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(f.titlePs)) + '</div>' +
        '</div>' +
        '<div class="gl-fam-side">' +
          (f.span ? '<span class="gl-badge gl-badge-level">L' + f.span[0] + '–L' + f.span[1] + '</span>' : '') +
          statusBadge(f) +
        '</div>' +
      '</button>';
    }).join('');
    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="ZirakGrammarLab.exitToHome()">← Grammar Lab</button>' +
        guideCard('grammar-families') +
        '<div class="gl-run-head">' +
          '<div class="gl-run-title zk-readable">🌳 Grammar Families (' + FAMILIES.length + ' branches)</div>' +
          '<div class="gl-run-title-ps zk-pashto-readable pashto" dir="rtl" lang="ps">د ګرامر څانګې</div>' +
        '</div>' +
        '<div class="gl-fam-list">' + rows + '</div>' +
        '<div style="height:24px;"></div>' +
      '</div>';
    guideAuto('grammar-families');
  }
  function findFamily(id) {
    for (var i = 0; i < FAMILIES.length; i++) if (FAMILIES[i].id === id) return FAMILIES[i];
    return null;
  }
  function openFamily(id) {
    var f = findFamily(id); if (!f) return;
    if (f.status === 'planned') { openPlannedFamily(id); return; }
    var a = f.demoAction;
    if (a === 'foundationPath') { openFoundationPath(); return; }
    if (a === 'path')         { startPath(); return; }
    if (a === 'reference')    { openReference(); return; }
    if (a === 'wordbuilding') { openWordBuilding(); return; }
    if (a === 'test')         { openSession('gl.session.demo-test-001'); return; }
    if (a === 'review' && typeof window.gwReviewWeak === 'function') { window.gwReviewWeak(); return; }
    openSession('gl.session.demo-wizard-001');
  }
  function openPlannedFamily(id) {
    var f = findFamily(id); if (!f) return;
    var el = glEl(); if (!el) return;
    cancelSpeech();
    var learnList = (f.learnFirstEn || '').split(',').map(function (t) {
      return '<li class="zk-readable">' + esc(t.trim()) + '</li>';
    }).join('');
    window.__glPlannedSpeech = f.titleEn + '. This topic is planned. ' + (f.whyEn || '') +
      ' Learn first: ' + (f.learnFirstEn || '') + '. ' + (f.helpsEn || '');
    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="ZirakGrammarLab.openFamilies()">← All Families</button>' +
        '<div class="gl-planned-box">' +
          '<div class="gl-planned-head">' +
            '<span class="gl-badge gl-badge-planned">📌 Planned</span>' +
            '<span class="gl-planned-title zk-readable">' + esc(f.titleEn) + '</span>' +
          '</div>' +
          '<div class="gl-fam-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(f.titlePs)) + '</div>' +
          '<div class="gl-planned-line zk-readable">This branch is prepared for a future phase. It is not open yet.</div>' +
          '<div class="gl-planned-why zk-readable"><b>Why it comes later:</b> ' + esc(f.whyEn || '') + '</div>' +
          '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(f.whyPs)) + '</div>' +
          '<div class="gl-planned-lf zk-readable"><b>Learn these first:</b></div>' +
          '<ul class="gl-planned-list">' + learnList + '</ul>' +
          '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(f.learnFirstPs)) + '</div>' +
          (f.helpsEn ? '<div class="gl-planned-helps zk-muted-readable">Later this helps: ' + esc(f.helpsEn) + '</div>' : '') +
          '<div class="zk-action-row gl-run-actions">' +
            '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.hearPlanned()">🔊 Hear</button>' +
            '<button type="button" class="gl-btn gl-btn-primary" onclick="ZirakGrammarLab.startPath()">▶ Practice open topics first</button>' +
          '</div>' +
        '</div>' +
        '<div style="height:24px;"></div>' +
      '</div>';
  }
  function hearPlanned() { speakText(window.__glPlannedSpeech || ''); }

  /* ── WORD-BUILDING / PRONUNCIATION demo view ───────────────────────────── */
  function openWordBuilding() {
    var el = glEl(); if (!el) return;
    cancelSpeech();
    var p = WORD_BUILDING.prefixes[0], s = WORD_BUILDING.suffixes[0];
    var c = WORD_BUILDING.confusables[0], t = WORD_BUILDING.tongueTwisters[0];
    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="ZirakGrammarLab.exitToHome()">← Grammar Lab</button>' +
        guideCard('grammar-wordbuilding') +
        '<div class="gl-run-head">' +
          '<div class="gl-run-title zk-readable">🧱 Word Building &amp; Pronunciation — Demo</div>' +
          '<div class="gl-run-title-ps zk-pashto-readable pashto" dir="rtl" lang="ps">د کلمو جوړونه او تلفظ — بېلګه</div>' +
        '</div>' +

        '<div class="gl-ref-card">' +
          '<div class="gl-ref-top"><span class="gl-ref-item zk-readable">Prefix ' + esc(p.affix) + '</span><span class="gl-badge gl-badge-level">negative</span></div>' +
          '<div class="gl-ref-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(p.meaningPs) + '</div>' +
          '<div class="gl-ref-ex zk-muted-readable">' + p.examples.map(function (x) { return esc(x.from) + ' → ' + esc(x.to); }).join(' · ') + '</div>' +
        '</div>' +

        '<div class="gl-ref-card">' +
          '<div class="gl-ref-top"><span class="gl-ref-item zk-readable">Suffix ' + esc(s.affix) + '</span><span class="gl-badge gl-badge-level">noun-making</span></div>' +
          '<div class="gl-ref-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(s.meaningPs) + '</div>' +
          '<div class="gl-ref-ex zk-muted-readable">' + s.examples.map(function (x) { return esc(x.from) + ' → ' + esc(x.to); }).join(' · ') +
            (s.spellingNote ? ' — ' + esc(s.spellingNote) : '') + '</div>' +
        '</div>' +

        '<div class="gl-ref-card">' +
          '<div class="gl-ref-top"><span class="gl-ref-item zk-readable">' + esc(c.a) + ' vs ' + esc(c.b) + '</span><span class="gl-badge gl-badge-level">confusable</span></div>' +
          '<div class="gl-ref-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(c.tipPs) + '</div>' +
          '<div class="gl-ref-ex zk-muted-readable">' + esc(c.exampleA) + ' · ' + esc(c.exampleB) + '</div>' +
        '</div>' +

        '<div class="gl-ref-card gl-tt-card">' +
          '<div class="gl-ref-top"><span class="gl-ref-item zk-readable">👅 Tongue Twister</span>' +
            t.targetSounds.map(function (x) { return '<span class="gl-badge gl-badge-level">' + esc(x) + '</span>'; }).join('') + '</div>' +
          '<div class="gl-tt-text zk-readable">' + esc(t.textEn) + '</div>' +
          '<div class="gl-ref-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(t.meaningPs) + '</div>' +
          '<div class="gl-ref-ex zk-muted-readable">Mouth tip: <span class="zk-pashto-readable pashto" dir="rtl" lang="ps" style="display:inline;">' + esc(t.mouthTipPs) + '</span></div>' +
          '<div class="gl-ref-ex zk-muted-readable">Say it slowly first, then at normal speed, then faster.</div>' +
          '<div class="zk-action-row gl-run-actions">' +
            '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.hearTwister()">🔊 Hear</button>' +
          '</div>' +
        '</div>' +
        '<div style="height:24px;"></div>' +
      '</div>';
    guideAuto('grammar-wordbuilding');
  }
  function hearTwister() { speakText(WORD_BUILDING.tongueTwisters[0].textEn); }

  /* ── GRAMMAR LAB HOME SECTIONS (injected into the existing landing) ────── */
  function startPath() {
    var first = firstOpenLevelId();
    if (first && typeof window.gwOpenLevel === 'function') { window.gwOpenLevel(first); return; }
    exitToHome();
  }
  function homeSectionsHtml() {
    function card(icon, en, psTxt, desc, onclick) {
      return '<button type="button" class="gl-home-card" onclick="' + onclick + '">' +
        '<div class="gl-home-icon" aria-hidden="true">' + icon + '</div>' +
        '<div class="gl-home-title zk-readable">' + esc(en) + '</div>' +
        '<div class="gl-home-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(psTxt) + '</div>' +
        '<div class="gl-home-desc zk-muted-readable">' + esc(desc) + '</div>' +
      '</button>';
    }
    return '' +
      '<div class="gw-section-lbl">🧪 Grammar Lab</div>' +
      '<div class="gl-home-grid">' +
        card('▶', 'Continue Grammar Path', 'د ګرامر لارې ته دوام', 'Start or continue level by level.', 'ZirakGrammarLab.startPath()') +
        card('📚', 'Foundation Path (L1–L3)', 'بنسټیزه لار', 'Real beginner grammar: words, sentences, nouns, articles.', 'ZirakGrammarLab.openFoundationPath()') +
        card('🪄', 'Grammar Wizard (Demo)', 'د ګرامر وزرډ', 'Guided practice with hear and feedback.', "ZirakGrammarLab.openSession('gl.session.demo-wizard-001')") +
        card('📝', 'Tests &amp; Drills (Demo)', 'ازموینې او تمرینونه', 'A short scored mini-test.', "ZirakGrammarLab.openSession('gl.session.demo-test-001')") +
        card('⭐', 'Review Mistakes', 'د تېروتنو بیاکتنه', 'Fix your saved weak grammar.', (typeof window !== 'undefined' ? 'gwReviewWeak()' : '')) +
        card('🔎', 'Reference Index', 'د حوالې لړلیک', 'Search quick grammar reference.', 'ZirakGrammarLab.openReference()') +
        card('🌳', 'Grammar Families', 'د ګرامر څانګې', 'All 33 branches: open, demo, and planned.', 'ZirakGrammarLab.openFamilies()') +
      '</div>';
  }

  /* ==========================================================================
     TOPICS REGISTRY + LESSON RENDERER (I6D — enables the I6C topic contract).
     STRUCTURE lives here; CONTENT lives in pack files (e.g.
     grammar-lab-foundation-pack1.js) which register through these APIs.
     Future packs (I6E/I6F, GPT-generated) use the same three calls:
       ZirakGrammarLab.registerTopics([...]);
       ZirakGrammarLab.registerSessions({...});
       ZirakGrammarLab.registerReferenceEntries([...]);
     ========================================================================== */
  var TOPICS = {};
  function registerTopics(list) {
    (list || []).forEach(function (t) {
      t.schemaVersion = t.schemaVersion || SCHEMA_VERSION;
      TOPICS[t.id] = t;
    });
  }
  function registerSessions(map) {
    for (var k in map) {
      if (Object.prototype.hasOwnProperty.call(map, k)) { map[k].id = k; SESSIONS[k] = map[k]; }
    }
  }
  function registerReferenceEntries(list) {
    (list || []).forEach(function (e) { REFERENCE_ENTRIES.push(e); });
  }
  function topicById(id) { return TOPICS[id] || null; }
  function say(t) { speakText(t); }

  // Case-preserving normalizer for capitalization drills (caseSensitive items):
  // strips punctuation and extra spaces but KEEPS letter case.
  function normCase(s) {
    return String(s || '')
      .replace(/[.,!?;:'"“”‘’]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function pathTopics(pathId) {
    var arr = [];
    for (var k in TOPICS) {
      if (Object.prototype.hasOwnProperty.call(TOPICS, k) && TOPICS[k].pathId === pathId) arr.push(TOPICS[k]);
    }
    arr.sort(function (a, b) { return (a.pathOrder || 0) - (b.pathOrder || 0); });
    return arr;
  }

  function openFoundationPath() {
    var el = glEl(); if (!el) return;
    cancelSpeech();
    var topics = pathTopics('gl.path.foundation-1');
    var rows = topics.map(function (t, i) {
      return '<button type="button" class="gl-fam-row" onclick="ZirakGrammarLab.openTopic(\'' + esc(t.id) + '\')">' +
        '<div class="gl-fam-main">' +
          '<div class="gl-fam-title zk-readable">' + (i + 1) + '. ' + esc(t.titleEn) + '</div>' +
          '<div class="gl-fam-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(t.titlePs)) + '</div>' +
        '</div>' +
        '<div class="gl-fam-side">' +
          '<span class="gl-badge gl-badge-level">L' + (t.levelNumber || '') + '</span>' +
          '<span class="gl-badge gl-badge-active">Open</span>' +
        '</div>' +
      '</button>';
    }).join('');
    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="ZirakGrammarLab.exitToHome()">← Grammar Lab</button>' +
        guideCard('grammar-foundation-path') +
        '<div class="gl-run-head">' +
          '<div class="gl-run-title zk-readable">📚 Foundation Path (L1–L3)</div>' +
          '<div class="gl-run-title-ps zk-pashto-readable pashto" dir="rtl" lang="ps">بنسټیزه لار</div>' +
        '</div>' +
        (topics.length
          ? '<div class="gl-fam-list">' + rows + '</div>'
          : '<div class="gl-ref-empty zk-muted-readable">Foundation topics arrive with the content pack.</div>') +
        '<div style="height:24px;"></div>' +
      '</div>';
    guideAuto('grammar-foundation-path');
  }

  function blockHtml(t, b, bi) {
    if (b.type === 'explanation' || b.type === 'note') {
      return '<div class="gl-block">' +
        (b.titleEn ? '<div class="gl-block-title zk-readable">' + esc(b.titleEn) + '</div>' : '') +
        '<div class="gl-block-en zk-readable">' + esc(b.en) + '</div>' +
        (b.ps ? '<div class="gl-block-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(b.ps) + '</div>' : '') +
      '</div>';
    }
    if (b.type === 'examples') {
      return '<div class="gl-block">' +
        '<div class="gl-block-title zk-readable">' + esc(b.titleEn || 'Examples') + '</div>' +
        (b.items || []).map(function (x, xi) {
          return '<div class="gl-ex-row">' +
            '<button type="button" class="gl-ex-hear" ' +
              'onclick="ZirakGrammarLab.hearExample(\'' + esc(t.id) + '\',' + bi + ',' + xi + ')" ' +
              'aria-label="Hear example">🔊</button>' +
            '<div class="gl-ex-main">' +
              '<div class="gl-ex-en zk-readable">' + esc(x.en) + '</div>' +
              (x.ps ? '<div class="gl-ex-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(x.ps) + '</div>' : '') +
            '</div>' +
            (x.domain ? '<span class="gl-badge gl-badge-level">' + esc(x.domain) + '</span>' : '') +
          '</div>';
        }).join('') +
      '</div>';
    }
    if (b.type === 'formula') {
      return '<div class="gl-block">' +
        '<div class="gl-block-title zk-readable">' + esc(b.titleEn || 'Formula') + '</div>' +
        '<div class="gl-formula">' +
        (b.rows || []).map(function (r) {
          return '<div class="gl-formula-row">' +
            '<span class="gl-formula-en zk-readable">' + esc(r.en) + '</span>' +
            (r.ps ? '<span class="gl-formula-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(r.ps) + '</span>' : '') +
          '</div>';
        }).join('') +
        '</div></div>';
    }
    if (b.type === 'commonMistake') {
      return '<div class="gl-block gl-block-mistake">' +
        '<div class="gl-block-title zk-readable">⚠ Common mistake</div>' +
        '<div class="gl-mistake-wrong">✗ ' + esc(b.wrongEn) + '</div>' +
        '<div class="gl-mistake-right zk-readable">✓ ' + esc(b.rightEn) + '</div>' +
        (b.noteEn ? '<div class="gl-block-en zk-readable">' + esc(b.noteEn) + '</div>' : '') +
        (b.notePs ? '<div class="gl-block-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(b.notePs) + '</div>' : '') +
      '</div>';
    }
    return '';
  }

  function openTopic(id) {
    var t = topicById(id); var el = glEl();
    if (!t || !el) return;
    cancelSpeech();
    var prereqHtml = '';
    if (t.prerequisites && t.prerequisites.length) {
      var links = t.prerequisites.map(function (pid) {
        var pt = topicById(pid);
        return pt
          ? '<a href="javascript:void(0)" class="gl-topic-link" onclick="ZirakGrammarLab.openTopic(\'' + esc(pid) + '\')">' + esc(pt.titleEn) + '</a>'
          : '';
      }).filter(Boolean).join(', ');
      if (links) prereqHtml = '<div class="gl-topic-prereq zk-muted-readable">Learn first: ' + links + '</div>';
    }
    var blocks = (t.lessonBlocks || []).map(function (b, bi) { return blockHtml(t, b, bi); }).join('');
    var nextT = (t.nextTopics && t.nextTopics[0]) ? topicById(t.nextTopics[0]) : null;
    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="ZirakGrammarLab.openFoundationPath()">← Foundation Path</button>' +
        guideCard('grammar-topic') +
        '<div class="gl-run-head">' +
          '<div class="gl-run-title zk-readable">' + esc(t.titleEn) +
            ' <span class="gl-badge gl-badge-level">L' + (t.levelNumber || '') + '</span>' +
            // PHASE I6G-A: per-topic Auto-Wizard Practice button beside the badges
            '<button type="button" class="glaw-auto-wizard-badge-btn" ' +
              'onclick="event.stopPropagation();if(window.GrammarAutoWizard)window.GrammarAutoWizard.open(\'' + esc(t.id) + '\')" ' +
              'title="Auto-Wizard Practice for this topic">🪄 Auto-Wizard Practice</button>' +
            // PHASE I6H-D2: Topic Test button beside Auto-Wizard on every Foundation Grammar Lab topic
            '<button type="button" class="glaw-topic-test-btn" ' +
              'onclick="event.stopPropagation();if(window.ZirakAcademyTests)window.ZirakAcademyTests.startTopicTest(\'gl\',\'' + esc(t.id) + '\')" ' +
              'title="Topic Quiz — graded check">🧪 Topic Quiz</button>' +
          '</div>' +
          '<div class="gl-run-title-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(t.titlePs)) + '</div>' +
        '</div>' +
        (t.reasonEn ? '<div class="gl-topic-reason zk-muted-readable">' + esc(t.reasonEn) + '</div>' : '') +
        prereqHtml +
        '<div class="zk-action-row gl-run-actions gl-topic-actions">' +
          '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.hearLesson(\'' + esc(t.id) + '\')">🔊 Hear Lesson</button>' +
        '</div>' +
        blocks +
        '<div class="zk-action-row gl-run-actions gl-topic-actions">' +
          (t.wizardSessionId ? '<button type="button" class="gl-btn gl-btn-primary" onclick="ZirakGrammarLab.openSession(\'' + esc(t.wizardSessionId) + '\')">🪄 Practice</button>' : '') +
          (t.testSessionId ? '<button type="button" class="gl-btn gl-btn-ghost" onclick="ZirakGrammarLab.openSession(\'' + esc(t.testSessionId) + '\')">📝 Mini Test</button>' : '') +
        '</div>' +
        (nextT
          ? '<button type="button" class="gl-fam-row gl-next-topic" onclick="ZirakGrammarLab.openTopic(\'' + esc(nextT.id) + '\')">' +
              '<div class="gl-fam-main">' +
                '<div class="gl-fam-title zk-readable">Next: ' + esc(nextT.titleEn) + ' →</div>' +
                '<div class="gl-fam-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(ps(nextT.titlePs)) + '</div>' +
              '</div>' +
              '<div class="gl-fam-side"><span class="gl-badge gl-badge-level">L' + (nextT.levelNumber || '') + '</span></div>' +
            '</button>'
          : '') +
        '<div style="height:24px;"></div>' +
      '</div>';
    guideAuto('grammar-topic');
  }

  function hearExample(topicId, bi, xi) {
    var t = topicById(topicId); if (!t) return;
    var b = (t.lessonBlocks || [])[bi]; if (!b || !b.items) return;
    var x = b.items[xi]; if (!x) return;
    speakText(x.en);
  }
  // Whole-lesson read: title + explanations + first examples + mistake note.
  // Uses the ONE speak chain, so Stop Reading cancels it like everything else.
  function hearLesson(id) {
    var t = topicById(id); if (!t) return;
    var parts = [t.titleEn + '.'];
    (t.lessonBlocks || []).forEach(function (b) {
      if ((b.type === 'explanation' || b.type === 'note') && b.en) parts.push(b.en);
      if (b.type === 'examples' && b.items && b.items.length) {
        parts.push('For example: ' + b.items.slice(0, 3).map(function (x) { return x.en; }).join(' '));
      }
      if (b.type === 'commonMistake') {
        parts.push('Common mistake: ' + b.wrongEn + ' Correct: ' + b.rightEn + (b.noteEn ? ' ' + b.noteEn : ''));
      }
    });
    speakText(parts.join(' '));
  }
  // Session exit that returns to the owning topic when the session came from
  // a lesson page (returnTopicId), else to the Grammar Lab home.
  function exitSession() {
    var s = currentSession();
    cancelSpeech();
    if (s && s.returnTopicId && TOPICS[s.returnTopicId]) { openTopic(s.returnTopicId); return; }
    exitToHome();
  }

  /* ── GUIDE ENTRIES — injected into the ONE ZirakPageGuides registry ────── */
  function injectGuides() {
    if (!window.ZirakPageGuides || !window.ZirakPageGuides.registry) return;
    var R = window.ZirakPageGuides.registry;
    R['grammar-families'] = R['grammar-families'] || {
      titleEn: 'Grammar Families', titlePs: 'د ګرامر څانګې',
      purposeEn: 'These are all the grammar branches of the academy — open ones, demos, and planned ones.',
      purposePs: 'دا د اکاډمۍ ټولې ګرامري څانګې دي — خلاصې، بېلګې او پلان شوې.',
      stepsEn: ['Open an Active or Demo branch to practice now.', 'Planned branches explain what to learn first.', 'New branches will appear here in future phases.'],
      stepsPs: ['فعاله یا بېلګه څانګه پرانیزه.', 'پلان شوې څانګې وايي لومړی څه زده کړې.', 'نوې څانګې به دلته راشي.'],
      nextActionEn: 'Your next step: open a Demo branch and try it.',
      nextActionPs: 'راتلونکی ګام: یوه بېلګه څانګه پرانیزه.'
    };
    R['grammar-wizard'] = R['grammar-wizard'] || {
      titleEn: 'Grammar Wizard', titlePs: 'د ګرامر وزرډ',
      purposeEn: 'Guided grammar practice. One question at a time, with hearing and calm feedback.',
      purposePs: 'لارښوول شوی د ګرامر تمرین، له اورېدو او ارام نظر سره.',
      stepsEn: ['Read or hear each question.', 'Choose or type your answer, then check it.', 'Mistakes are saved to Weak Grammar Review.'],
      stepsPs: ['هره پوښتنه ولوله یا واوره.', 'ځواب وټاکه یا ولیکه، بیا یې وګوره.', 'تېروتنې بیاکتنې ته خوندي کیږي.'],
      nextActionEn: 'Your next step: answer each item, then review any mistakes.',
      nextActionPs: 'راتلونکی ګام: ځواب ورکړه، بیا تېروتنې بیاکته.'
    };
    R['grammar-tests'] = R['grammar-tests'] || {
      titleEn: 'Tests and Drills', titlePs: 'ازموینې او تمرینونه',
      purposeEn: 'A short scored test. It shows what you know and saves weak points to review.',
      purposePs: 'لنډه ازموینه چې پوهه ښیي او ضعیف ټکي خوندي کوي.',
      stepsEn: ['Answer each item carefully.', 'See your score at the end.', 'Weak points go to Weak Grammar Review.'],
      stepsPs: ['هرې پوښتنې ته په دقت ځواب ورکړه.', 'په پای کې نمره وګوره.', 'ضعیف ټکي بیاکتنې ته ځي.'],
      nextActionEn: 'Your next step: finish the test, then review your weak points.',
      nextActionPs: 'راتلونکی ګام: ازموینه بشپړه کړه، بیا ضعیف ټکي بیاکته.'
    };
    R['grammar-reference'] = R['grammar-reference'] || {
      titleEn: 'Reference Index', titlePs: 'د حوالې لړلیک',
      purposeEn: 'Quick grammar reference you can search. Each entry has meaning, example, and Hear.',
      purposePs: 'ګړندۍ حواله چې لټولی یې شې، له مانا، بېلګې او اورېدو سره.',
      stepsEn: ['Type in the search box to filter.', 'Press Hear on any entry.', 'Press Practice to try it in the wizard.'],
      stepsPs: ['د لټون بکس کې ولیکه.', 'په هره برخه اورېدل کېکاږه.', 'د تمرین لپاره Practice کېکاږه.'],
      nextActionEn: 'Your next step: search a word and hear its example.',
      nextActionPs: 'راتلونکی ګام: یوه کلمه ولټوه او بېلګه یې واوره.'
    };
    R['grammar-wordbuilding'] = R['grammar-wordbuilding'] || {
      titleEn: 'Word Building', titlePs: 'د کلمو جوړونه',
      purposeEn: 'Prefixes, suffixes, confusable words, and a pronunciation challenge.',
      purposePs: 'مختاړي، وروستاړي، ورته کلمې او د تلفظ ننګونه.',
      stepsEn: ['Read each card and its Pashto tip.', 'Hear the tongue twister, then say it slowly.', 'Repeat it faster when it feels easy.'],
      stepsPs: ['هر کارت او پښتو لارښوونه یې ولوله.', 'ژبماتوونکی واوره او ورو یې ووایه.', 'بیا یې ګړندی تکرار کړه.'],
      nextActionEn: 'Your next step: try the tongue twister three times.',
      nextActionPs: 'راتلونکی ګام: ژبماتوونکی درې ځله ووایه.'
    };
  }
  injectGuides();

  /* ── EXPORT — one namespace ────────────────────────────────────────────── */
  window.ZirakGrammarLab = {
    SCHEMA_VERSION: SCHEMA_VERSION,
    families: FAMILIES,
    sessions: SESSIONS,
    referenceEntries: REFERENCE_ENTRIES,
    wordBuilding: WORD_BUILDING,
    levelInfo: levelInfo,
    norm: norm,
    extendWeakRecord: extendWeakRecord,
    homeSectionsHtml: homeSectionsHtml,
    startPath: startPath,
    openSession: openSession,
    openReference: openReference,
    refFilter: refFilter,
    hearRef: hearRef,
    openFamilies: openFamilies,
    openFamily: openFamily,
    openPlannedFamily: openPlannedFamily,
    hearPlanned: hearPlanned,
    openWordBuilding: openWordBuilding,
    hearTwister: hearTwister,
    // I6D — topics registry + content-pack registration + lesson renderer
    topics: TOPICS,
    registerTopics: registerTopics,
    registerSessions: registerSessions,
    registerReferenceEntries: registerReferenceEntries,
    pathTopics: pathTopics,
    openFoundationPath: openFoundationPath,
    openTopic: openTopic,
    hearLesson: hearLesson,
    hearExample: hearExample,
    say: say,
    exitSession: exitSession,
    hearItem: hearItem,
    hearCorrect: hearCorrect,
    choose: choose,
    checkText: checkText,
    repeatDone: repeatDone,
    next: next,
    exitToHome: exitToHome
  };
})();
