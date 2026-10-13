// ===================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// grammar-world.js — Phase I5 — Grammar World Foundation
// ===================================================================
// PURPOSE:
//   Replaces the old flat Grammar card list with a full Grammar World:
//   landing page, 22 category cards, topic detail view, highlighted
//   grammar, TTS (Read Explanation / Read Examples), Pashto support,
//   practice/quiz placeholders, and per-student weak-grammar tracking.
//
// HOW IT HOOKS IN (no app.js edits required):
//   Overrides window.renderGrammarCards() so navigate('grammar') opens
//   Grammar World. Content target is the existing #grammar-cards-list
//   div. Old GRAMMAR_CARDS (app.js) and ZIRAK_GRAMMAR_CARDS (content-
//   grammar.js) are left untouched — they are simply not rendered here.
//
// LANGUAGE RULE:
//   Every English explanation/example shows Pashto or
//   "Pashto translation pending." — never silent missing Pashto.
//   Pashto is visual only; TTS always reads English.
//
// LOAD ORDER: after app.js, before zirak-profile.js
// ===================================================================

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────
  var GW_STATE = {
    view:      'landing',   // 'landing' | 'category' | 'level' | 'topic' | 'weak' | 'practice'
    catId:     null,
    levelId:   null,        // PHASE I6B — Part 7: current level being browsed
    topicId:   null,
    prevCatId: null,        // Back-from-topic returns to the right category
    prevLevelId: null       // Back-from-topic returns to the right level (if opened via level browsing)
  };

  // ── Future Coverage Lock (Part 4) ──────────────────────────────────
  // This map documents ALL grammar topics that must eventually be built.
  // Future phases MUST NOT remove this constant; extend it instead.
  var GW_FUTURE_MAP = {
    tenses: [
      'Present Simple', 'Present Continuous', 'Present Perfect',
      'Present Perfect Continuous', 'Past Simple', 'Past Continuous',
      'Past Perfect', 'Past Perfect Continuous',
      'Future will', 'Future going to', 'Future Continuous',
      'Future Perfect', 'Future Perfect Continuous'
    ],
    modals: [
      'can', 'could', 'may', 'might', 'must', 'have to',
      'should', 'ought to', 'would', 'used to',
      'must have + V3', 'could have + V3', 'should have + V3',
      'may have + V3', 'modal passive', 'modal continuous forms'
    ]
    // Add other category future maps here in later phases.
  };
  window.GW_FUTURE_MAP = GW_FUTURE_MAP; // expose for future phases / console

  // ── 22 Categories (all future-ready) ───────────────────────────────
  // count = number of prototype topics ready NOW; 0 = coming soon.
  var GW_CATEGORIES = [
    { id:'tenses',       icon:'⏰', name:'Tenses',                  namePs:'زمانې',                color:'#2563eb', count:1 },
    { id:'modals',       icon:'💪', name:'Modals',                  namePs:'مودال فعلونه',          color:'#7c3aed', count:2 },
    { id:'auxiliaries',  icon:'🔧', name:'Auxiliaries',             namePs:'مرستندوی فعلونه',       color:'#0891b2', count:2 },
    { id:'questions',    icon:'❓', name:'Questions',               namePs:'پوښتنې',                color:'#059669', count:0 },
    { id:'negatives',    icon:'🚫', name:'Negatives',               namePs:'نفي جملې',             color:'#dc2626', count:0 },
    { id:'articles',     icon:'📖', name:'Articles',                namePs:'مقالې (a / an / the)', color:'#d97706', count:0 },
    { id:'prepositions', icon:'📍', name:'Prepositions',            namePs:'حروف اضافه',           color:'#db2777', count:0 },
    { id:'pronouns',     icon:'👤', name:'Pronouns',                namePs:'ضمیرونه',              color:'#65a30d', count:0 },
    { id:'adjectives',   icon:'🌟', name:'Adjectives & Adverbs',    namePs:'صفتونه او قیدونه',      color:'#ea580c', count:0 },
    { id:'comparatives', icon:'📊', name:'Comparatives',            namePs:'پرتله کول',            color:'#0284c7', count:0 },
    { id:'active',       icon:'⚡', name:'Active Voice',            namePs:'فعلي جمله',            color:'#16a34a', count:0 },
    { id:'passive',      icon:'🔄', name:'Passive Voice',           namePs:'مجهولي جمله',          color:'#9333ea', count:0 },
    { id:'reported',     icon:'💬', name:'Direct & Indirect Speech', namePs:'مستقیم او غیر مستقیم', color:'#0d9488', count:0 },
    { id:'conditionals', icon:'🔀', name:'Conditionals',            namePs:'شرطي جملې',            color:'#b45309', count:0 },
    { id:'gerunds',      icon:'🔤', name:'Gerunds & Infinitives',   namePs:'مصدري فعلونه',         color:'#6d28d9', count:0 },
    { id:'clauses',      icon:'🧩', name:'Clauses',                 namePs:'جملوي برخې',           color:'#475569', count:0 },
    { id:'relative',     icon:'🔗', name:'Relative Clauses',        namePs:'اضافي جملې',           color:'#be185d', count:0 },
    { id:'phrasal',      icon:'💫', name:'Phrasal Verbs',           namePs:'ترکیبي فعلونه',        color:'#0369a1', count:0 },
    { id:'sentence',     icon:'📝', name:'Sentence Structure',      namePs:'د جملې جوړښت',         color:'#374151', count:0 },
    { id:'mistakes',     icon:'⚠️', name:'Common Afghan Mistakes',  namePs:'عام افغاني غلطۍ',      color:'#b91c1c', count:0 },
    { id:'conversation', icon:'🗣️', name:'Conversation Grammar',    namePs:'د خبرو ګرامر',         color:'#047857', count:0 },
    { id:'interview',    icon:'💼', name:'Interview Grammar',       namePs:'د مرکې ګرامر',         color:'#1d4ed8', count:0 }
  ];

  // ── Category → topic ID map ────────────────────────────────────────
  var GW_CAT_TOPICS = {
    tenses:      ['gw_003'],
    modals:      ['gw_004', 'gw_005'],
    auxiliaries: ['gw_001', 'gw_002']
    // Other categories: add topic IDs here in future phases.
  };

  // ── 5 Prototype Topics (foundation — add more per phase) ───────────
  var GW_TOPICS = {

    // -- TOPIC 1: am / is / are --------------------------------------
    'gw_001': {
      id: 'gw_001', category: 'auxiliaries', level: 'Beginner',
      title: 'am / is / are',
      titlePs: 'am / is / are',
      overviewEn: '"am", "is", and "are" are the present forms of the verb "to be". Use "am" with I, "is" with he / she / it, and "are" with you / we / they. They link a subject to a description, a job, a place, or a feeling.',
      overviewPs: "د \"to be\" فعل د حال بڼې دي: \"I\" سره \"am\"، \"he / she / it\" سره \"is\"، او \"you / we / they\" سره \"are\" کارېږي. دا فعلونه فاعل له صفت، دندې، ځای یا احساس سره نښلوي.",
      formula: 'I + am ... | He / She / It + is ... | You / We / They + are ...',
      forms: [
        { label: 'Affirmative', labelPs: 'مثبت', items: [
          { en: 'I am a student.',     ps: 'زه یو زده کوونکی یم.', hl: ['am'] },
          { en: 'He is my brother.',   ps: 'هغه زما ورور دی.',      hl: ['is'] },
          { en: 'They are teachers.',  ps: 'هغوی ښوونکي دي.',      hl: ['are'] }
        ]},
        { label: 'Negative', labelPs: 'منفي', items: [
          { en: 'I am not a teacher.', ps: 'زه ښوونکی نه یم.',      hl: ['am', 'not'] },
          { en: 'He is not late.',     ps: 'هغه ناوخته نه دی.',     hl: ['is', 'not'] },
          { en: 'They are not ready.', ps: 'هغوی چمتو نه دي.',      hl: ['are', 'not'] }
        ]},
        { label: 'Contractions', labelPs: 'لنډې بڼې', items: [
          { en: "I'm a student.",   ps: 'زه یو زده کوونکی یم.', hl: ["I'm"] },
          { en: "He's my brother.", ps: 'هغه زما ورور دی.',      hl: ["He's"] },
          { en: "She isn't here.",  ps: 'هغه دلته نشته.',        hl: ["isn't"] },
          { en: "We aren't ready.", ps: 'موږ چمتو نه یو.',       hl: ["aren't"] }
        ]},
        { label: 'Yes / No Questions', labelPs: 'هو / نه پوښتنې', items: [
          { en: 'Are you ready?',     ps: 'ایا ته چمتو یې؟',       hl: ['Are'] },
          { en: 'Is he your friend?', ps: 'ایا هغه ستا ملګری دی؟', hl: ['Is'] },
          { en: "Aren't you tired?",  ps: 'ایا ته ستړی نه یې؟',    hl: ["Aren't"] }
        ]},
        { label: 'WH Questions', labelPs: 'WH پوښتنې', items: [
          { en: 'Where are they?',   ps: 'هغوی چیرته دي؟',  hl: ['are'] },
          { en: 'Who is she?',       ps: 'هغه څوک ده؟',     hl: ['is'] },
          { en: 'Why are you late?', ps: 'ته ولې ناوخته یې؟', hl: ['are'] }
        ]},
        { label: 'Short Answers', labelPs: 'لنډ ځوابونه', items: [
          { en: 'Yes, I am.',     ps: 'هو، زه یم.',    hl: ['am'] },
          { en: "No, I'm not.",   ps: 'نه، زه نه یم.', hl: ["I'm", 'not'] },
          { en: "No, she isn't.", ps: 'نه، هغه نه ده.', hl: ["isn't"] }
        ]}
      ],
      mistake: {
        wrong:   'I is happy.  /  He am late.',
        correct: 'I am happy.  /  He is late.',
        noteEn:  'Never use "is" with I. Never use "am" with he / she / it.',
        notePs:  "\"I\" سره یوازې \"am\" کارېږي. \"he / she / it\" سره یوازې \"is\" کارېږي."
      },
      summaryEn: "Use \"am\" with I, \"is\" with he / she / it, and \"are\" with you / we / they. Add \"not\" for negatives, and use contractions like I'm, isn't, and aren't when you speak.",
      summaryPs: "لنډیز: \"am\" د I سره، \"is\" د he / she / it سره، \"are\" د you / we / they سره. د نفي لپاره \"not\"، او په خبرو کې I'm، isn't، aren't کاروه."
    },

    // -- TOPIC 2: do / does ------------------------------------------
    'gw_002': {
      id: 'gw_002', category: 'auxiliaries', level: 'Beginner',
      title: 'do / does',
      titlePs: 'do / does',
      overviewEn: 'Use "do" and "does" as helping verbs to make questions and negative sentences in the Present Simple. Use "does" with he / she / it; use "do" with I / you / we / they. After "do" or "does", the main verb keeps its base form (no -s).',
      overviewPs: "د حال ساده زمان پوښتنو او منفي جملو لپاره \"do\" او \"does\" د مرستندوی فعل په توګه کارېږي. \"does\" د he / she / it سره، \"do\" د I / you / we / they سره. د دوی وروسته اصلي فعل ساده بڼه لري (بې -s).",
      formula: 'Do + I / you / we / they + verb? | Does + he / she / it + verb?',
      forms: [
        { label: 'Affirmative', labelPs: 'مثبت', items: [
          { en: 'I do my homework every day.', ps: 'زه هره ورځ خپله کورنۍ دنده کوم.', hl: ['do'] },
          { en: 'She does the cooking.',       ps: 'هغه پخلی کوي.',                  hl: ['does'] }
        ]},
        { label: 'Negative', labelPs: 'منفي', items: [
          { en: 'I do not know the answer.', ps: 'زه ځواب نه پوهېږم.', hl: ['do', 'not'] },
          { en: 'He does not like coffee.',  ps: 'هغه قهوه نه خوښوي.', hl: ['does', 'not'] }
        ]},
        { label: 'Contractions', labelPs: 'لنډې بڼې', items: [
          { en: "I don't know.",         ps: 'زه نه پوهېږم.',     hl: ["don't"] },
          { en: "She doesn't like tea.", ps: 'هغه چای نه خوښوي.', hl: ["doesn't"] },
          { en: "They don't agree.",     ps: 'هغوی موافق نه دي.', hl: ["don't"] }
        ]},
        { label: 'Yes / No Questions', labelPs: 'هو / نه پوښتنې', items: [
          { en: 'Do you speak English?', ps: 'ایا ته انګلیسي خبرې کوې؟', hl: ['Do'] },
          { en: 'Does she live here?',   ps: 'ایا هغه دلته اوسیږي؟',     hl: ['Does'] }
        ]},
        { label: 'WH Questions', labelPs: 'WH پوښتنې', items: [
          { en: 'Where do you live?', ps: 'ته چیرته اوسیږې؟', hl: ['do'] },
          { en: 'What does he want?', ps: 'هغه څه غواړي؟',    hl: ['does'] }
        ]},
        { label: 'Short Answers', labelPs: 'لنډ ځوابونه', items: [
          { en: 'Yes, I do.',      ps: 'هو، زه کوم.',     hl: ['do'] },
          { en: "No, I don't.",    ps: 'نه، زه نه کوم.',  hl: ["don't"] },
          { en: "No, he doesn't.", ps: 'نه، هغه نه کوي.', hl: ["doesn't"] }
        ]}
      ],
      mistake: {
        wrong:   "Does he speaks English?  /  She don't have a book.",
        correct: "Does he speak English?  /  She doesn't have a book.",
        noteEn:  'After "does", use the base form of the verb (no -s). Use "doesn\'t" with she / he / it, not "don\'t".',
        notePs:  "\"does\" وروسته فعل ته -s مه ورزیاتوئ. د \"she\" سره \"doesn't\" کاروه، \"don't\" نه."
      },
      summaryEn: "Use \"do\" with I / you / we / they and \"does\" with he / she / it for questions and negatives. Keep the main verb in its base form, and use don't and doesn't when you speak.",
      summaryPs: "لنډیز: د پوښتنو او نفي لپاره \"do\" د I / you / we / they سره او \"does\" د he / she / it سره. اصلي فعل ساده بڼه ساتي، او په خبرو کې don't او doesn't کاروه."
    },

    // -- TOPIC 3: Present Continuous ---------------------------------
    'gw_003': {
      id: 'gw_003', category: 'tenses', level: 'Beginner',
      title: 'Present Continuous',
      titlePs: 'اوسنی جاري زمان',
      overviewEn: 'Use the Present Continuous for actions happening right now, or for temporary situations around now. Form it with am / is / are + the main verb + -ing.',
      overviewPs: "اوسنی جاري زمان هغه کار ښيي چې همدا اوس روان دی، یا د اوس شاوخوا لنډمهاله حالتونه. جوړول یې: am / is / are + فعل + ing.",
      formula: 'Subject + am / is / are + verb-ing',
      forms: [
        { label: 'Affirmative', labelPs: 'مثبت', items: [
          // I6H-D2A FIX: added "همدا اوس" (right now) to disambiguate from
          // Simple Present — a student translating back could honestly write
          // "I study English" from the old gloss and be marked wrong.
          { en: 'I am studying English.',     ps: 'زه همدا اوس انګلیسي لولم.',   hl: ['am', 'studying'] },
          { en: 'She is reading a book.',     ps: 'هغه همدا اوس یو کتاب لولي.',   hl: ['is', 'reading'] },
          { en: 'They are playing football.', ps: 'هغوی همدا اوس فوټبال لوبوي.',  hl: ['are', 'playing'] }
        ]},
        { label: 'Negative', labelPs: 'منفي', items: [
          { en: 'I am not studying now.', ps: 'زه اوس نه لولم.',  hl: ['am', 'not', 'studying'] },
          { en: 'She is not reading.',    ps: 'هغه نه لولي.',     hl: ['is', 'not', 'reading'] },
          { en: 'They are not playing.',  ps: 'هغوی نه لوبوي.',   hl: ['are', 'not', 'playing'] }
        ]},
        { label: 'Contractions', labelPs: 'لنډې بڼې', items: [
          { en: "I'm studying.",        ps: 'زه لولم.',       hl: ["I'm", 'studying'] },
          { en: "She isn't reading.",   ps: 'هغه نه لولي.',   hl: ["isn't", 'reading'] },
          { en: "They aren't playing.", ps: 'هغوی نه لوبوي.', hl: ["aren't", 'playing'] }
        ]},
        { label: 'Yes / No Questions', labelPs: 'هو / نه پوښتنې', items: [
          { en: 'Is she reading?',    ps: 'ایا هغه لولي؟',     hl: ['Is', 'reading'] },
          { en: 'Are they playing?',  ps: 'ایا هغوی لوبوي؟',   hl: ['Are', 'playing'] },
          { en: "Isn't she reading?", ps: 'ایا هغه نه لولي؟',  hl: ["Isn't", 'reading'] }
        ]},
        { label: 'WH Questions', labelPs: 'WH پوښتنې', items: [
          { en: 'What is she reading?',    ps: 'هغه څه لولي؟',      hl: ['is', 'reading'] },
          { en: "Why isn't she studying?", ps: 'هغه ولې نه لولي؟',  hl: ["isn't", 'studying'] },
          { en: 'Where are they playing?', ps: 'هغوی چیرته لوبوي؟', hl: ['are', 'playing'] }
        ]},
        { label: 'Short Answers', labelPs: 'لنډ ځوابونه', items: [
          { en: 'Yes, she is.',     ps: 'هو، هغه ده.',     hl: ['is'] },
          { en: "No, she isn't.",   ps: 'نه، هغه نه ده.',  hl: ["isn't"] },
          { en: "No, they aren't.", ps: 'نه، هغوی نه دي.', hl: ["aren't"] }
        ]}
      ],
      mistake: {
        wrong:   'I am study English.  /  She is reads a book.',
        correct: 'I am studying English.  /  She is reading a book.',
        noteEn:  'Always add -ing to the main verb. Never use the base form or -s form after am / is / are.',
        notePs:  "am / is / are وروسته فعل ته حتماً -ing ورزیاته. ساده بڼه (study) یا -s بڼه (reads) مه کاروه."
      },
      summaryEn: "Form the Present Continuous with am / is / are + verb-ing for actions happening now. Add \"not\" for negatives (isn't, aren't), and move am / is / are before the subject for questions.",
      summaryPs: "لنډیز: اوسنی جاري زمان = am / is / are + فعل-ing د اوس روان کار لپاره. د نفي لپاره \"not\" (isn't، aren't)، او د پوښتنې لپاره am / is / are مخکې راوړه."
    },

    // -- TOPIC 4: can / cannot ---------------------------------------
    'gw_004': {
      id: 'gw_004', category: 'modals', level: 'Beginner',
      title: 'can / cannot',
      titlePs: 'can / cannot',
      overviewEn: 'Use "can" to talk about ability, permission, or possibility. Use "cannot" or "can\'t" for the negative. After "can", always use the base form of the verb -- no "to", no -s, no -ing.',
      overviewPs: "\"can\" د وړتیا، اجازې یا احتمال لپاره کارېږي. \"cannot\" یا \"can't\" یې منفي بڼه ده. د \"can\" وروسته فعل تل ساده بڼه لري -- بې \"to\"، بې -s، بې -ing.",
      formula: "Subject + can + verb (base) | Subject + cannot / can't + verb",
      forms: [
        { label: 'Affirmative', labelPs: 'مثبت', items: [
          { en: 'I can swim.',                    ps: 'زه لامبو وهلی شم.',         hl: ['can'] },
          { en: 'She can speak three languages.', ps: 'هغه درې ژبې خبرې کولی شي.', hl: ['can'] }
        ]},
        { label: 'Negative', labelPs: 'منفي', items: [
          { en: 'He cannot drive a car.', ps: 'هغه موټر چلولی نشي.', hl: ['cannot'] },
          { en: 'I cannot come today.',   ps: 'زه نن راتلی نشم.',    hl: ['cannot'] }
        ]},
        { label: 'Contractions', labelPs: 'لنډې بڼې', items: [
          { en: "We can't come tomorrow.", ps: 'موږ سبا راتلی نشو.',   hl: ["can't"] },
          { en: "She can't swim.",         ps: 'هغه لامبو وهلی نشي.', hl: ["can't"] },
          { en: "I can't hear you.",       ps: 'زه ستا غږ نه اورم.',   hl: ["can't"] }
        ]},
        { label: 'Yes / No Questions', labelPs: 'هو / نه پوښتنې', items: [
          { en: 'Can you help me, please?', ps: 'ایا ته ما سره مرسته کولی شې؟', hl: ['Can'] },
          { en: 'Can she drive?',           ps: 'ایا هغه موټر چلولی شي؟',       hl: ['Can'] }
        ]},
        { label: 'WH Questions', labelPs: 'WH پوښتنې', items: [
          { en: 'What can you do?',    ps: 'ته څه کولی شې؟',    hl: ['can'] },
          { en: "Why can't you come?", ps: 'ته ولې راتلی نشې؟', hl: ["can't"] }
        ]},
        { label: 'Short Answers', labelPs: 'لنډ ځوابونه', items: [
          { en: 'Yes, I can.',  ps: 'هو، زه کولی شم.',  hl: ['can'] },
          { en: "No, I can't.", ps: 'نه، زه نشم کولی.', hl: ["can't"] }
        ]}
      ],
      mistake: {
        wrong:   'I can to swim.  /  She cans speak English.',
        correct: 'I can swim.  /  She can speak English.',
        noteEn:  'Never use "to" after "can". "Can" never takes -s (not "cans").',
        notePs:  "\"can\" وروسته \"to\" مه کاروه. \"can\" هیڅکله -s نه اخلي (cans -- غلط)."
      },
      summaryEn: "Use \"can\" for ability and \"cannot\" or \"can't\" for the negative, always with the base verb. In questions, put \"can\" before the subject: Can you help me?",
      summaryPs: "لنډیز: \"can\" د وړتیا لپاره او \"cannot\" یا \"can't\" یې منفي، تل د ساده فعل سره. په پوښتنه کې \"can\" د فاعل مخکې راوړه: Can you help me?"
    },

    // -- TOPIC 5: should / should not -------------------------------
    'gw_005': {
      id: 'gw_005', category: 'modals', level: 'Beginner',
      title: 'should / should not',
      titlePs: 'should / should not',
      overviewEn: 'Use "should" to give advice, make a recommendation, or say what is the right thing to do. Use "should not" or "shouldn\'t" for the negative. After "should", always use the base form of the verb.',
      overviewPs: "\"should\" د مشورې، سپارښتنې، یا د سمې کار ښودلو لپاره کارېږي. \"should not\" یا \"shouldn't\" یې منفي بڼه ده. د \"should\" وروسته فعل تل ساده بڼه لري.",
      formula: "Subject + should + verb (base) | Subject + should not / shouldn't + verb",
      forms: [
        { label: 'Affirmative', labelPs: 'مثبت', items: [
          { en: 'You should study every day.',  ps: 'ته باید هره ورځ مطالعه وکې.', hl: ['should'] },
          { en: 'She should drink more water.', ps: 'هغه باید نور اوبه وڅښي.',     hl: ['should'] }
        ]},
        { label: 'Negative', labelPs: 'منفي', items: [
          { en: 'You should not be late.', ps: 'ته باید ناوخته نه شې.',     hl: ['should', 'not'] },
          { en: 'He should not worry.',    ps: 'هغه باید اندیښنه ونه کړي.', hl: ['should', 'not'] }
        ]},
        { label: 'Contractions', labelPs: 'لنډې بڼې', items: [
          { en: "You shouldn't eat too much sugar.", ps: 'ته باید ډېره بوره ونه خورې.', hl: ["shouldn't"] },
          { en: "We shouldn't wait here.",           ps: 'موږ باید دلته انتظار ونه باسو.', hl: ["shouldn't"] }
        ]},
        { label: 'Yes / No Questions', labelPs: 'هو / نه پوښتنې', items: [
          { en: 'Should I call him?',   ps: 'ایا زه باید هغه ته زنګ ووهم؟', hl: ['Should'] },
          { en: 'Should we leave now?', ps: 'ایا موږ باید اوس لاړ شو؟',     hl: ['Should'] }
        ]},
        { label: 'WH Questions', labelPs: 'WH پوښتنې', items: [
          { en: 'What should I do?',   ps: 'زه باید څه وکړم؟',     hl: ['should'] },
          { en: "Why shouldn't I go?", ps: 'زه ولې باید لاړ نشم؟', hl: ["shouldn't"] }
        ]},
        { label: 'Short Answers', labelPs: 'لنډ ځوابونه', items: [
          { en: 'Yes, you should.',   ps: 'هو، ته باید وکې.',    hl: ['should'] },
          { en: "No, you shouldn't.", ps: 'نه، ته باید ونه کې.', hl: ["shouldn't"] }
        ]}
      ],
      mistake: {
        wrong:   'You should to study.  /  She shoulds go now.',
        correct: 'You should study.  /  She should go now.',
        noteEn:  'Never use "to" after "should". "Should" never changes form -- no -s, no -ed.',
        notePs:  "\"should\" وروسته \"to\" مه کاروه. \"should\" هیڅکله نه بدلېږي (shoulds -- غلط)."
      },
      summaryEn: "Use \"should\" to give advice and \"should not\" or \"shouldn't\" for the negative, always with the base verb. In questions, put \"should\" before the subject: Should I call him?",
      summaryPs: "لنډیز: \"should\" د مشورې لپاره او \"should not\" یا \"shouldn't\" یې منفي، تل د ساده فعل سره. په پوښتنه کې \"should\" د فاعل مخکې راوړه: Should I call him?"
    }

  }; // end GW_TOPICS

  // ===================================================================
  // PHASE I6B — Part 2/3: merge in the curriculum map (grammar-
  // curriculum-map.js, loaded just before this file). Purely additive —
  // the 5 original topic object literals above are never touched. If
  // the curriculum file is ever missing for any reason, everything
  // below is a no-op and the app behaves exactly as it did before this
  // phase (defensive `typeof` guards throughout, matching this
  // project's established pattern).
  // ===================================================================

  // 2a. Bridge the 5 original topics into the new level system without
  // modifying their object literals above.
  if (window.GW_LEGACY_LEVEL_BRIDGE) {
    Object.keys(window.GW_LEGACY_LEVEL_BRIDGE).forEach(function (tid) {
      if (GW_TOPICS[tid]) GW_TOPICS[tid].levelId = window.GW_LEGACY_LEVEL_BRIDGE[tid];
    });
  }

  // 2b. Merge in the new starter foundation topics (same GW_TOPICS
  // object every existing function already reads from — no second
  // topic store, no duplicate rendering path).
  if (window.GW_CURRICULUM_TOPICS) {
    Object.keys(window.GW_CURRICULUM_TOPICS).forEach(function (tid) {
      GW_TOPICS[tid] = window.GW_CURRICULUM_TOPICS[tid];
    });
  }

  // 2c. GW_LEVELS — the 10-level roadmap (from grammar-curriculum-map.js).
  // Empty array fallback keeps every level-aware function safe even if
  // the curriculum file didn't load.
  var GW_LEVELS = window.GW_LEVELS || [];

  // 2d. Extend the category list additively (never remove/replace the
  // original 22 — per the "Future Coverage Lock" rule already in place
  // for GW_CATEGORIES). Skips cleanly if a category with the same id
  // somehow already exists, so this is safe to run more than once.
  if (window.GW_NEW_CATEGORIES) {
    window.GW_NEW_CATEGORIES.forEach(function (nc) {
      var exists = GW_CATEGORIES.some(function (c) { return c.id === nc.id; });
      if (!exists) GW_CATEGORIES.push(nc);
    });
  }

  // 2e. Rebuild GW_CAT_TOPICS and each category's `count` from the FULL
  // merged topic set (original 5 + new starter topics) — this keeps
  // "Browse by Category" accurate without hand-maintaining topic-id
  // lists in two places.
  (function rebuildCategoryIndex() {
    var byCat = {};
    Object.keys(GW_TOPICS).forEach(function (tid) {
      var cat = GW_TOPICS[tid].category;
      if (!cat) return;
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(tid);
    });
    Object.keys(byCat).forEach(function (cat) { GW_CAT_TOPICS[cat] = byCat[cat]; });
    GW_CATEGORIES.forEach(function (c) { c.count = (GW_CAT_TOPICS[c.id] || []).length; });
  })();

  // 2f. Level → topic index, used by "Browse by Level".
  function gwTopicsForLevel(levelId) {
    var out = [];
    Object.keys(GW_TOPICS).forEach(function (tid) {
      if (GW_TOPICS[tid].levelId === levelId) out.push(tid);
    });
    return out;
  }
  function gwLevel(levelId) {
    var found = null;
    GW_LEVELS.forEach(function (l) { if (l.id === levelId) found = l; });
    return found;
  }

  // ── Helpers ────────────────────────────────────────────────────────

  // Safe HTML escape (always escape before inserting into innerHTML).
  function gwEsc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  // Highlight target grammar words — TOKEN-BASED so contractions and
  // negatives ("can't", "isn't", "I'm", "shouldn't") highlight correctly.
  // The old regex ran AFTER HTML-escaping, so the apostrophe had become
  // &#39; and "\bcan't\b" never matched (the bug in the screenshot).
  // Here we split into word tokens, compare the RAW core word to the
  // highlight set, then escape each piece — safe (no XSS) and apostrophe-aware.
  function gwHl(text, words) {
    if (!words || !words.length) return gwEsc(text);
    var hlset = {};
    words.forEach(function (w) {
      if (!w) return;
      var k = String(w).toLowerCase().trim();
      hlset[k] = 1;
      hlset[k.replace(/'/g, '\u2019')] = 1;  // accept curly apostrophe
      hlset[k.replace(/\u2019/g, "'")] = 1;   // accept straight apostrophe
    });
    return String(text).split(/(\s+)/).map(function (tok) {
      if (tok === '' || /^\s+$/.test(tok)) return gwEsc(tok);
      // Peel leading/trailing punctuation but keep internal apostrophes.
      var lead = '', core = tok, trail = '';
      var lm = core.match(/^(["(\u201c]+)([\s\S]*)$/);
      if (lm) { lead = lm[1]; core = lm[2]; }
      var tm = core.match(/^([\s\S]*?)([.,!?;:")\u201d]+)$/);
      if (tm) { core = tm[1]; trail = tm[2]; }
      var key = core.toLowerCase();
      if (core && hlset[key]) {
        return gwEsc(lead) + '<span class="gw-hl">' + gwEsc(core) + '</span>' + gwEsc(trail);
      }
      return gwEsc(tok);
    }).join('');
  }

  // Pashto visual display (never spoken) — show pending marker if missing.
  function gwPs(ps) {
    return (ps && ps.trim())
      ? gwEsc(ps)
      : '<span class="gw-pending">Pashto translation pending.</span>';
  }

  // TTS: use window.speak() so the global Stop Reading button appears.
  function gwSpeak(text) {
    if (typeof window.speak === 'function') {
      try { window.speak(String(text || ''), 'en'); return; } catch (e) {}
    }
    // Fallback: direct speechSynthesis (Stop Reading still works via the
    // patched speechSynthesis.cancel from app.js).
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text || ''));
      u.lang = 'en-US';
      u.rate = (window.state && window.state.speechRate) ? window.state.speechRate : 0.85;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ── GLOBAL AUTO READ / MANUAL setting (Part 3) ─────────────────────
  // Stored globally (not per-student) so the teacher device behaves the
  // same for every student. Default ON, so existing auto-read behaviour
  // (e.g. Home welcome) is preserved unless the user turns it OFF.
  var gwAutoReadTimer = null;
  function gwAutoReadKey() { return 'zirak_auto_read'; }
  function gwAutoReadOn() {
    try {
      var v = localStorage.getItem(gwAutoReadKey());
      return v === null ? true : (v === '1' || v === 'true');
    } catch (e) { return true; }
  }
  function gwAutoReadSet(on) {
    try { localStorage.setItem(gwAutoReadKey(), on ? '1' : '0'); } catch (e) {}
    // Expose a global the rest of the app can read (e.g. Home welcome).
    window.ZirakAutoReadOn = gwAutoReadOn;
  }
  function gwAutoReadToggle() {
    var now = !gwAutoReadOn();
    gwAutoReadSet(now);
    if (!now) gwStopReading();           // turning OFF should stop any speech
    // Refresh whatever Grammar World view is open so the pill updates.
    if (GW_STATE.view === 'topic' && GW_STATE.topicId) gwRenderTopic(GW_STATE.topicId);
    else if (GW_STATE.view === 'category' && GW_STATE.catId) gwOpenCategory(GW_STATE.catId);
    else gwRenderLanding();
  }
  // Reusable toggle pill (shown on Grammar World landing + topic pages).
  // Includes a theme button that REUSES the app's existing cycleTheme()
  // (Part 4 — no duplicate theme engine).
  function gwAutoReadBarHtml() {
    var on = gwAutoReadOn();
    return '<div class="gw-autoread-bar">' +
      '<span class="gw-autoread-lbl">🔊 Auto Read</span>' +
      '<div class="gw-bar-controls">' +
        '<button class="gw-autoread-toggle ' + (on ? 'on' : 'off') + '" ' +
          'onclick="gwAutoReadToggle()" aria-pressed="' + (on ? 'true' : 'false') + '">' +
          '<span class="gw-autoread-knob"></span>' +
          '<span class="gw-autoread-state">' + (on ? 'ON' : 'OFF') + '</span>' +
        '</button>' +
        '<button class="gw-theme-btn" onclick="gwCycleTheme()" title="Toggle light / dark theme" aria-label="Toggle theme">🌗</button>' +
      '</div>' +
    '</div>';
  }

  function gwCycleTheme() {
    if (typeof window.cycleTheme === 'function') { try { window.cycleTheme(); return; } catch (e) {} }
    // Fallback: simple light/dark flip on <html>.
    try {
      var cur = document.documentElement.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', cur === 'dark' ? 'light' : 'dark');
    } catch (e) {}
  }

  // Per-student weak-grammar storage (ZirakStorageKey pattern).
  function gwWeakKey() {
    return (window.ZirakStorageKey
      ? window.ZirakStorageKey('gw_weak_topics')
      : 'gw_weak_topics');
  }
  function gwWeakLoad() {
    try { return JSON.parse(localStorage.getItem(gwWeakKey()) || '[]'); } catch (e) { return []; }
  }
  function gwWeakSave(ids) {
    try { localStorage.setItem(gwWeakKey(), JSON.stringify(ids)); } catch (e) {}
  }
  function gwIsWeak(topicId) { return gwWeakLoad().indexOf(topicId) !== -1; }

  function gwAddWeak(topicId) {
    var list = gwWeakLoad();
    if (list.indexOf(topicId) === -1) list.push(topicId);
    gwWeakSave(list);
    gwRenderTopic(topicId); // refresh button state
  }
  function gwRemoveWeak(topicId) {
    gwWeakSave(gwWeakLoad().filter(function (id) { return id !== topicId; }));
    gwRenderTopic(topicId);
  }

  // ===================================================================
  // PHASE I6B — Part 9: practice-derived storage. Separate keys from
  // the existing "gw_weak_topics" manual-flag system above (untouched)
  // — this is per-QUESTION data from actual practice attempts, useful
  // for a much more specific review than "this whole topic needs work".
  // Same window.ZirakStorageKey per-student pattern; no existing keys
  // renamed or removed.
  // ===================================================================
  function gwPracticeHistoryKey() {
    return (window.ZirakStorageKey ? window.ZirakStorageKey('gw_practice_history') : 'gw_practice_history');
  }
  function gwWeakItemsKey() {
    return (window.ZirakStorageKey ? window.ZirakStorageKey('gw_weak_items') : 'gw_weak_items');
  }
  function gwLastTopicKey() {
    return (window.ZirakStorageKey ? window.ZirakStorageKey('gw_last_topic') : 'gw_last_topic');
  }

  function gwPracticeHistoryLoad() {
    try { return JSON.parse(localStorage.getItem(gwPracticeHistoryKey()) || '[]'); } catch (e) { return []; }
  }
  function gwPracticeHistorySave(list) {
    try { localStorage.setItem(gwPracticeHistoryKey(), JSON.stringify(list)); } catch (e) {}
  }
  function gwWeakItemsLoad() {
    try { return JSON.parse(localStorage.getItem(gwWeakItemsKey()) || '[]'); } catch (e) { return []; }
  }
  function gwWeakItemsSave(list) {
    try { localStorage.setItem(gwWeakItemsKey(), JSON.stringify(list)); } catch (e) {}
  }
  // Adding the same missed question again (e.g. missed twice across two
  // sessions) refreshes it in place rather than piling up duplicates.
  // Defensively capped so a heavily-used shared classroom tablet never
  // grows this list without bound.
  function gwAddWeakItem(record) {
    var list = gwWeakItemsLoad();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].topicId === record.topicId && list[i].itemId === record.itemId) { idx = i; break; }
    }
    if (idx >= 0) {
      // PHASE I6C — Part 7: carry the attempt count across refreshes of the
      // same missed item, so future mastery/spaced-review logic can use it.
      record.attempts = (list[idx].attempts || 1) + 1;
      list[idx] = record;
    } else {
      if (record.attempts === undefined) record.attempts = 1;
      list.push(record);
    }
    if (list.length > 200) list = list.slice(list.length - 200);
    gwWeakItemsSave(list);
  }
  // PHASE I6C — Part 7: expose the ONE weak-item save path so the Grammar Lab
  // engine (wizard/tests) writes into the SAME per-student store — no second
  // review database anywhere.
  window.gwAddWeakItem = gwAddWeakItem;
  function gwRemoveWeakItem(topicId, itemId) {
    gwWeakItemsSave(gwWeakItemsLoad().filter(function (w) { return !(w.topicId === topicId && w.itemId === itemId); }));
  }

  // Get the target container.
  function gwEl() { return document.getElementById('grammar-cards-list'); }

  // Placeholder modal — never leave a dead button.
  function gwShowPhModal(msg) {
    var old = document.getElementById('gw-ph-modal');
    if (old) old.remove();
    var m = document.createElement('div');
    m.id = 'gw-ph-modal';
    m.innerHTML =
      '<div class="gw-modal-backdrop" onclick="document.getElementById(\'gw-ph-modal\').remove()"></div>' +
      '<div class="gw-modal-box">' +
        '<div class="gw-modal-msg">' + gwEsc(msg) + '</div>' +
        '<button class="gw-btn gw-btn-read" style="margin-top:4px;" ' +
          'onclick="document.getElementById(\'gw-ph-modal\').remove()">OK</button>' +
      '</div>';
    document.body.appendChild(m);
  }

  // Lookup helpers.
  function gwCat(catId) {
    var found = null;
    GW_CATEGORIES.forEach(function (c) { if (c.id === catId) found = c; });
    return found;
  }

  // ===================================================================
  // PHASE I6B — Part 6: generic table renderer. One implementation
  // reused by pronoun tables, comparison tables, word-family tables,
  // and any future table content — no per-table-type special casing.
  //
  // Cell values may be a plain string (escaped as-is) OR an object
  // { en, ps } for bilingual cells — English shown, Pashto shown once
  // directly beneath it (pending marker if ps is missing/empty), never
  // duplicated. Horizontal scroll wrapper keeps wide tables usable on
  // narrow phones without breaking the page layout.
  // ===================================================================
  function gwRenderCell(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {
      var en = val.en || '';
      return '<div class="gw-tc-en">' + gwEsc(en) + '</div>' +
             '<div class="gw-tc-ps pashto" dir="rtl" lang="ps">' + gwPs(val.ps) + '</div>';
    }
    return gwEsc(String(val));
  }

  function gwRenderTable(tbl) {
    if (!tbl || !tbl.columns || !tbl.rows) return '';
    var headHtml = tbl.columns.map(function (col) {
      var psLbl = col.labelPs ? '<span class="gw-th-ps pashto" dir="rtl" lang="ps">' + gwEsc(col.labelPs) + '</span>' : '';
      return '<th>' + gwEsc(col.labelEn || col.key) + psLbl + '</th>';
    }).join('');
    var rowsHtml = tbl.rows.map(function (row) {
      var cells = tbl.columns.map(function (col) {
        return '<td>' + gwRenderCell(row[col.key]) + '</td>';
      }).join('');
      return '<tr>' + cells + '</tr>';
    }).join('');
    var titleHtml = tbl.titleEn
      ? '<div class="gw-table-title">' + gwEsc(tbl.titleEn) +
        (tbl.titlePs ? ' <span class="gw-table-title-ps pashto" dir="rtl" lang="ps">— ' + gwEsc(tbl.titlePs) + '</span>' : '') +
        '</div>'
      : '';
    return '<div class="gw-table-block" id="' + (tbl.id ? 'gw-table-' + gwEsc(tbl.id) : '') + '">' +
      titleHtml +
      '<div class="gw-table-wrap"><table class="gw-table"><thead><tr>' + headHtml + '</tr></thead>' +
      '<tbody>' + rowsHtml + '</tbody></table></div>' +
      '</div>';
  }

  function gwRenderTables(tables) {
    if (!tables || !tables.length) return '';
    return tables.map(gwRenderTable).join('');
  }

  // ===================================================================
  // PHASE I6B — Part 5: word-family renderer. Builds a table (reusing
  // gwRenderTable above — one rendering path, not a second engine) from
  // the generic word-family data shape documented in grammar-
  // curriculum-map.js. Missing forms (e.g. no adverb form) render as a
  // clean blank cell rather than breaking the table.
  // ===================================================================
  function gwRenderWordFamilies(families) {
    if (!families || !families.length) return '';
    var tableDef = {
      id: 'word-families',
      titleEn: 'Word Family Table', titlePs: 'د کلمو کورنۍ جدول',
      columns: [
        { key: 'base', labelEn: 'Base', labelPs: 'بنسټ' },
        { key: 'noun', labelEn: 'Noun', labelPs: 'اسم' },
        { key: 'verb', labelEn: 'Verb', labelPs: 'فعل' },
        { key: 'adjective', labelEn: 'Adjective', labelPs: 'صفت' },
        { key: 'adverb', labelEn: 'Adverb', labelPs: 'قید' }
      ],
      rows: families.map(function (f) {
        return { base: f.base || '', noun: f.noun || '', verb: f.verb || '', adjective: f.adjective || '', adverb: f.adverb || '' };
      })
    };
    var tableHtml = gwRenderTable(tableDef);
    var detailsHtml = families.map(function (f) {
      var mistakeHtml = f.mistakeNoteEn
        ? '<div class="gw-wf-mistake">⚠️ ' + gwEsc(f.mistakeNoteEn) +
          '<div class="pashto" dir="rtl" lang="ps">' + gwPs(f.mistakeNotePs) + '</div></div>'
        : '';
      return '<div class="gw-wf-detail">' +
        '<div class="gw-wf-base">' + gwEsc(f.base) + '</div>' +
        (f.exampleEn ? '<div class="gw-wf-ex">' + gwEsc(f.exampleEn) + '</div>' +
          '<div class="gw-wf-ex-ps pashto" dir="rtl" lang="ps">' + gwPs(f.examplePs) + '</div>' : '') +
        mistakeHtml +
        '</div>';
    }).join('');
    return tableHtml + '<div class="gw-wf-details">' + detailsHtml + '</div>';
  }

  // ===================================================================
  // PHASE I6B — Part 4: generic note-list renderer, shared by spelling/
  // sound notes, silent-letter notes, and homophone notes (same shape:
  // { en, ps, noteEn, notePs }) — one renderer, three uses.
  // ===================================================================
  function gwRenderNoteList(notes, iconChar) {
    if (!notes || !notes.length) return '';
    return '<div class="gw-note-list">' + notes.map(function (n) {
      return '<div class="gw-note-item">' +
        '<div class="gw-note-head">' + (iconChar || '🔎') + ' <span class="gw-note-word">' + gwEsc(n.en) + '</span></div>' +
        '<div class="gw-note-word-ps pashto" dir="rtl" lang="ps">' + gwPs(n.ps) + '</div>' +
        (n.noteEn ? '<div class="gw-note-text">' + gwEsc(n.noteEn) + '</div>' +
          '<div class="gw-note-text-ps pashto" dir="rtl" lang="ps">' + gwPs(n.notePs) + '</div>' : '') +
        '</div>';
    }).join('') + '</div>';
  }

  function gwRenderConfusingPairs(pairs) {
    if (!pairs || !pairs.length) return '';
    return '<div class="gw-note-list">' + pairs.map(function (p) {
      return '<div class="gw-note-item">' +
        '<div class="gw-note-head">🔀 <span class="gw-note-word">' + gwEsc(p.wordA) + '</span> vs <span class="gw-note-word">' + gwEsc(p.wordB) + '</span></div>' +
        (p.noteEn ? '<div class="gw-note-text">' + gwEsc(p.noteEn) + '</div>' +
          '<div class="gw-note-text-ps pashto" dir="rtl" lang="ps">' + gwPs(p.notePs) + '</div>' : '') +
        '</div>';
    }).join('') + '</div>';
  }

  // PHASE I6B1 — Part 10: near-synonym pairs — reuses the same
  // .gw-note-list card pattern as confusing pairs, with two short
  // example sentences (one per word) shown underneath the usage note.
  function gwRenderSynonymPairs(pairs) {
    if (!pairs || !pairs.length) return '';
    return '<div class="gw-note-list">' + pairs.map(function (p) {
      var exHtml = (p.exampleAEn || p.exampleBEn)
        ? '<div class="gw-syn-examples">' +
            (p.exampleAEn ? '<div class="gw-syn-ex"><b>' + gwEsc(p.wordA) + ':</b> ' + gwEsc(p.exampleAEn) + '<div class="pashto" dir="rtl" lang="ps">' + gwPs(p.exampleAPs) + '</div></div>' : '') +
            (p.exampleBEn ? '<div class="gw-syn-ex"><b>' + gwEsc(p.wordB) + ':</b> ' + gwEsc(p.exampleBEn) + '<div class="pashto" dir="rtl" lang="ps">' + gwPs(p.exampleBPs) + '</div></div>' : '') +
          '</div>'
        : '';
      return '<div class="gw-note-item">' +
        '<div class="gw-note-head">≈ <span class="gw-note-word">' + gwEsc(p.wordA) + '</span> / <span class="gw-note-word">' + gwEsc(p.wordB) + '</span></div>' +
        (p.noteEn ? '<div class="gw-note-text">' + gwEsc(p.noteEn) + '</div>' +
          '<div class="gw-note-text-ps pashto" dir="rtl" lang="ps">' + gwPs(p.notePs) + '</div>' : '') +
        exHtml +
        '</div>';
    }).join('') + '</div>';
  }

  // PHASE I6B1 — Part 10: British vs American differences — rendered as
  // a table (reusing gwRenderTable, one rendering path) with an extra
  // "Type" column (spelling/pronunciation/terminology) so the same
  // table can mix all three without needing separate sub-tables.
  function gwRenderBritishAmerican(items) {
    if (!items || !items.length) return '';
    var tableDef = {
      id: 'british-american',
      titleEn: 'British vs American', titlePs: 'برتانوي او امریکايي',
      columns: [
        { key: 'british', labelEn: 'British', labelPs: 'برتانوي' },
        { key: 'american', labelEn: 'American', labelPs: 'امریکايي' },
        { key: 'type', labelEn: 'Type', labelPs: 'ډول' }
      ],
      rows: items.map(function (it) {
        return { british: it.british || '', american: it.american || '', type: it.typeEn || '' };
      })
    };
    var tableHtml = gwRenderTable(tableDef);
    var notesHtml = items.filter(function (it) { return it.noteEn; }).map(function (it) {
      return '<div class="gw-note-item">' +
        '<div class="gw-note-head">🇬🇧 ' + gwEsc(it.british) + ' <span style="opacity:.6;">/</span> 🇺🇸 ' + gwEsc(it.american) + '</div>' +
        '<div class="gw-note-text">' + gwEsc(it.noteEn) + '</div>' +
        '<div class="gw-note-text-ps pashto" dir="rtl" lang="ps">' + gwPs(it.notePs) + '</div>' +
        '</div>';
    }).join('');
    return tableHtml + (notesHtml ? '<div class="gw-note-list" style="margin-top:10px;">' + notesHtml + '</div>' : '');
  }

  // ── LANDING PAGE ───────────────────────────────────────────────────
  function gwRenderLanding() {
    var el = gwEl(); if (!el) return;
    GW_STATE.view = 'landing'; GW_STATE.catId = null; GW_STATE.topicId = null; GW_STATE.levelId = null;

    var weak    = gwWeakLoad();
    var weakItemCount = gwWeakItemsLoad().length;
    var totalWeak = weak.length + weakItemCount;
    var weakCard = totalWeak
      ? '<div class="gw-weak-card" onclick="gwReviewWeak()" role="button" tabindex="0">' +
          '<div class="gw-weak-icon">⭐</div>' +
          '<div class="gw-weak-body">' +
            '<div class="gw-weak-title">Weak Grammar — ' + totalWeak + ' item' + (totalWeak === 1 ? '' : 's') + '</div>' +
            '<div class="gw-weak-sub">Review missed practice questions and topics marked Needs Practice.</div>' +
          '</div>' +
          '<div class="gw-weak-arr">▶</div>' +
        '</div>'
      : '<div class="gw-ph-card" onclick="gwReviewWeak()" role="button" tabindex="0">⭐ <b>Weak Grammar:</b> No weak grammar saved yet. Practice a topic first.</div>';

    // PHASE I6B — Part 7: Browse by Level — the PRIMARY organizing
    // structure for the curriculum (categories remain available below
    // as a secondary way to browse). Locked levels are shown but
    // clearly marked "Coming Later" rather than hidden, so the full
    // 10-level roadmap is always visible.
    var levelCards = GW_LEVELS.slice().sort(function (a, b) { return a.order - b.order; }).map(function (lv) {
      var count = gwTopicsForLevel(lv.id).length;
      var isLocked = !!lv.locked || count === 0;
      var badge = isLocked
        ? '<span class="gw-lvl-badge gw-lvl-badge-soon">coming later</span>'
        : '<span class="gw-lvl-badge">' + count + ' topic' + (count === 1 ? '' : 's') + '</span>';
      return '<div class="gw-lvl-card' + (isLocked ? ' gw-lvl-card-locked' : '') + '" ' +
        'onclick="gwOpenLevel(\'' + gwEsc(lv.id) + '\')" role="button" tabindex="0">' +
        '<div class="gw-lvl-num">' + lv.order + '</div>' +
        '<div class="gw-lvl-body">' +
          '<div class="gw-lvl-name">' + gwEsc(lv.titleEn) + '</div>' +
          '<div class="gw-lvl-ps pashto" dir="rtl" lang="ps">' + gwEsc(lv.titlePs) + '</div>' +
        '</div>' +
        badge +
      '</div>';
    }).join('');

    var catCards = GW_CATEGORIES.map(function (c) {
      var hasTopics = (GW_CAT_TOPICS[c.id] || []).length > 0;
      var badge = hasTopics
        ? '<span class="gw-cat-badge" style="background:' + gwEsc(c.color) + ';">' + gwEsc(String((GW_CAT_TOPICS[c.id] || []).length)) + '</span>'
        : '<span class="gw-cat-badge gw-cat-badge-soon">soon</span>';
      return '<div class="gw-cat-card" style="border-top-color:' + gwEsc(c.color) + ';" ' +
        'onclick="gwOpenCategory(\'' + gwEsc(c.id) + '\')" role="button" tabindex="0">' +
        '<div class="gw-cat-icon">' + c.icon + '</div>' +
        '<div class="gw-cat-name">' + gwEsc(c.name) + '</div>' +
        '<div class="gw-cat-ps pashto" dir="rtl" lang="ps">' + gwEsc(c.namePs) + '</div>' +
        badge +
      '</div>';
    }).join('');

    el.innerHTML =
      '<div class="gw-landing">' +
        // Hero banner
        '<div class="gw-hero">' +
          '<div class="gw-hero-title">🌍 Grammar World</div>' +
          '<div class="gw-hero-ps pashto" dir="rtl" lang="ps">د ګرامر نړۍ</div>' +
          '<div class="gw-hero-desc">Learn English grammar step by step — rules, examples, listening, practice, and quizzes.</div>' +
        '</div>' +
        // PHASE I6B2 — Part 2/4: single guide framework (loud, caring, teacher-like)
        (window.ZirakPageGuides ? window.ZirakPageGuides.cardHtml('grammar') : '') +
        // Auto Read control (Part 3)
        gwAutoReadBarHtml() +
        // Weak grammar card
        weakCard +
        // PHASE I6C — Grammar Lab sections (engine foundation). ONE grammar
        // system: these cards render further views into this SAME container
        // via window.ZirakGrammarLab (grammar-lab-engine.js); back buttons
        // return here through the same renderGrammarCards()/gwRenderLanding().
        (window.ZirakGrammarLab ? window.ZirakGrammarLab.homeSectionsHtml() : '') +
        // Browse by Level (PHASE I6B — Part 7, primary structure)
        (GW_LEVELS.length ? (
          '<div class="gw-section-lbl">🪜 Browse by Level</div>' +
          '<div class="gw-lvl-list">' + levelCards + '</div>'
        ) : '') +
        // Categories (secondary structure, unchanged)
        '<div class="gw-section-lbl">📂 Browse by Category</div>' +
        '<div class="gw-cat-grid">' + catCards + '</div>' +
        '<div style="height:28px;"></div>' +
      '</div>';
    // PHASE I6B2 — Part 5: speak the guide ONCE if Auto Read is ON.
    try { if (window.ZirakPageGuides) window.ZirakPageGuides.autoSpeak('grammar'); } catch (e) {}
  }

  // ── CATEGORY VIEW ──────────────────────────────────────────────────
  function gwOpenCategory(catId) {
    GW_STATE.view = 'category'; GW_STATE.catId = catId;
    GW_STATE.backContext = { type: 'category', id: catId };
    var el = gwEl(); if (!el) return;
    var cat = gwCat(catId);
    if (!cat) { gwRenderLanding(); return; }
    var topicIds = GW_CAT_TOPICS[catId] || [];

    var topicRows = topicIds.map(function (tid) {
      var t = GW_TOPICS[tid]; if (!t) return '';
      var weakBadge = gwIsWeak(tid)
        ? '<span class="gw-weak-badge">needs practice</span>' : '';
      return '<div class="gw-topic-card" onclick="gwOpenTopic(\'' + gwEsc(tid) + '\')" role="button" tabindex="0">' +
        '<div class="gw-topic-dot" style="background:' + gwEsc(cat.color) + ';">' + cat.icon + '</div>' +
        '<div class="gw-topic-body">' +
          '<div class="gw-topic-title">' + gwEsc(t.title) + weakBadge + '</div>' +
          '<div class="gw-topic-ps pashto" dir="rtl" lang="ps">' + gwEsc(t.titlePs) + '</div>' +
          '<div class="gw-topic-lvl">' + gwEsc(t.level) + '</div>' +
        '</div>' +
        '<div class="gw-topic-arr">▶</div>' +
      '</div>';
    }).join('');

    var empty = !topicIds.length
      ? '<div class="gw-ph-card">📚 Topics for this category will be added in the next phase. ' +
          '<span class="gw-pending">Content pending.</span></div>'
      : '';

    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="gwRenderLanding()">← All Categories</button>' +
        '<div class="gw-cat-hdr" style="background:' + gwEsc(cat.color) + ';">' +
          '<span class="gw-cat-hdr-icon">' + cat.icon + '</span>' +
          '<div>' +
            '<div class="gw-cat-hdr-name">' + gwEsc(cat.name) + '</div>' +
            '<div class="gw-cat-hdr-ps pashto" dir="rtl" lang="ps">' + gwEsc(cat.namePs) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="gw-topic-list">' + topicRows + empty + '</div>' +
        '<div style="height:28px;"></div>' +
      '</div>';
  }

  // ── LEVEL VIEW ───────────────────────────────────────────────────────
  // PHASE I6B — Part 7: browsing by level. Reuses the exact same
  // .gw-topic-card markup/CSS as category browsing — one topic-card
  // pattern, two entry points.
  function gwOpenLevel(levelId) {
    GW_STATE.view = 'level'; GW_STATE.levelId = levelId;
    GW_STATE.backContext = { type: 'level', id: levelId };
    var el = gwEl(); if (!el) return;
    var lv = gwLevel(levelId);
    if (!lv) { gwRenderLanding(); return; }
    var topicIds = gwTopicsForLevel(levelId);

    if (!topicIds.length) {
      gwShowPhModal((lv.locked ? '🔒 ' : '📚 ') + lv.titleEn + ' is not open yet. ' + (lv.learnerGoalEn || 'Content for this level will be added in a future phase.'));
      GW_STATE.view = 'landing';
      return;
    }

    var topicRows = topicIds.map(function (tid) {
      var t = GW_TOPICS[tid]; if (!t) return '';
      var cat = gwCat(t.category) || {};
      var weakBadge = gwIsWeak(tid) ? '<span class="gw-weak-badge">needs practice</span>' : '';
      return '<div class="gw-topic-card" onclick="gwOpenTopic(\'' + gwEsc(tid) + '\')" role="button" tabindex="0">' +
        '<div class="gw-topic-dot" style="background:' + gwEsc(cat.color || '#0f766e') + ';">' + (cat.icon || '📘') + '</div>' +
        '<div class="gw-topic-body">' +
          '<div class="gw-topic-title">' + gwEsc(t.title) + weakBadge + '</div>' +
          '<div class="gw-topic-ps pashto" dir="rtl" lang="ps">' + gwEsc(t.titlePs) + '</div>' +
          '<div class="gw-topic-lvl">' + gwEsc(cat.name || '') + '</div>' +
        '</div>' +
        '<div class="gw-topic-arr">▶</div>' +
      '</div>';
    }).join('');

    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="gwRenderLanding()">← All Levels</button>' +
        '<div class="gw-cat-hdr" style="background:#0f766e;">' +
          '<span class="gw-cat-hdr-icon">🪜</span>' +
          '<div>' +
            '<div class="gw-cat-hdr-name">' + gwEsc(lv.titleEn) + '</div>' +
            '<div class="gw-cat-hdr-ps pashto" dir="rtl" lang="ps">' + gwEsc(lv.titlePs) + '</div>' +
          '</div>' +
        '</div>' +
        // PHASE I6B2 — Part 4: level-view guide card (loud, detailed guidance)
        (window.ZirakPageGuides ? window.ZirakPageGuides.cardHtml('grammar-level') : '') +
        '<div class="gw-lvl-goal">' +
          '<div class="gw-lvl-goal-en">🎯 ' + gwEsc(lv.learnerGoalEn || '') + '</div>' +
          '<div class="gw-lvl-goal-ps pashto" dir="rtl" lang="ps">' + gwPs(lv.learnerGoalPs) + '</div>' +
        '</div>' +
        '<div class="gw-topic-list">' + topicRows + '</div>' +
        '<div style="height:28px;"></div>' +
      '</div>';
    // PHASE I6B2 — Part 5: speak the level guide ONCE if Auto Read is ON.
    try { if (window.ZirakPageGuides) window.ZirakPageGuides.autoSpeak('grammar-level'); } catch (e) {}
  }

  // ── TOPIC DETAIL VIEW ──────────────────────────────────────────────
  function gwOpenTopic(topicId) {
    // PHASE I6B — Part 7: remember whichever browsing context (level OR
    // category) the student actually came from, so the topic page's
    // back button returns them to the right place either way.
    GW_STATE.topicBackContext = GW_STATE.backContext || { type: 'category', id: GW_STATE.catId };
    GW_STATE.prevCatId = GW_STATE.catId;
    GW_STATE.view      = 'topic';
    GW_STATE.topicId   = topicId;
    gwRenderTopic(topicId);
  }

  function gwRenderTopic(topicId) {
    var el = gwEl(); if (!el) return;
    var t = GW_TOPICS[topicId];
    if (!t) { gwRenderLanding(); return; }
    var cat      = gwCat(t.category) || {};
    var backCatId = GW_STATE.prevCatId || t.category;
    var backCat   = gwCat(backCatId) || cat;
    var isWeak    = gwIsWeak(topicId);

    // PHASE I6B — Part 7: honor whichever context (level or category)
    // the student actually opened this topic from.
    var backCtx = GW_STATE.topicBackContext;
    var backBtnLabel, backBtnOnclick;
    if (backCtx && backCtx.type === 'level') {
      var backLv = gwLevel(backCtx.id);
      backBtnLabel = '← ' + gwEsc(backLv ? backLv.titleEn : 'Levels');
      backBtnOnclick = 'gwOpenLevel(\'' + gwEsc(backCtx.id) + '\')';
    } else {
      backBtnLabel = '← ' + gwEsc(backCat.name || 'Back');
      backBtnOnclick = 'gwOpenCategory(\'' + gwEsc(backCatId) + '\')';
    }

    // Backward-compat: support either new "forms" groups or old flat "examples".
    var groups = t.forms ? t.forms
                 : (t.examples ? [{ label: 'Examples', items: t.examples }] : []);

    var formsHtml = groups.map(function (g, gi) {
      var rows = (g.items || []).map(function (ex, i) {
        return '<div class="gw-example">' +
          '<div class="gw-ex-num">' + (i + 1) + '.</div>' +
          '<div class="gw-ex-body">' +
            '<div class="gw-ex-en" lang="en">' + gwHl(ex.en, ex.hl) + '</div>' +
            '<div class="gw-ex-ps pashto" dir="rtl" lang="ps">' + gwPs(ex.ps) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
      var labelPs = g.labelPs ? '<span class="gw-form-lbl-ps pashto" dir="rtl" lang="ps">' + gwEsc(g.labelPs) + '</span>' : '';
      // PHASE I6A5 — Part F: id'd per group (index-based, rebuilt fresh
      // every render) so the chained Read Full Lesson can scroll to and
      // highlight EACH form group individually as it's being read.
      return '<div class="gw-form-group" id="gw-form-group-' + gi + '">' +
        '<div class="gw-form-lbl">' + gwEsc(g.label) + labelPs + '</div>' +
        '<div class="gw-examples">' + rows + '</div>' +
      '</div>';
    }).join('');

    var overviewEn = t.overviewEn || t.explanationEn || '';
    var overviewPs = t.overviewPs || t.explanationPs || '';

    // PHASE I6B — Part 3/4: additional optional sections. Every one of
    // these is a no-op ('') when the topic doesn't supply that field —
    // the 5 original topics have none of these fields, so their
    // rendered output is completely unaffected by this addition.
    var explSectionsHtml = (t.explanationSections || []).map(function (s, si) {
      return '<div class="gw-tp-sec" id="gw-sec-expl-' + si + '">' +
        '<div class="gw-tp-sec-lbl">📎 ' + gwEsc(s.titleEn) + '</div>' +
        '<div class="gw-tp-en">' + gwEsc(s.textEn) + '</div>' +
        '<div class="gw-tp-ps2 pashto" dir="rtl" lang="ps">' + gwPs(s.textPs) + '</div>' +
      '</div>';
    }).join('');

    var tablesHtml = t.tables && t.tables.length
      ? '<div class="gw-tp-sec" id="gw-sec-tables">' +
          '<div class="gw-tp-sec-lbl">📊 Tables</div>' +
          gwRenderTables(t.tables) +
        '</div>' : '';

    var wordFamiliesHtml = t.wordFamilies && t.wordFamilies.length
      ? '<div class="gw-tp-sec" id="gw-sec-wordfamilies">' +
          '<div class="gw-tp-sec-lbl">🌱 Word Families</div>' +
          gwRenderWordFamilies(t.wordFamilies) +
        '</div>' : '';

    var spellingHtml = t.spellingSoundNotes && t.spellingSoundNotes.length
      ? '<div class="gw-tp-sec" id="gw-sec-spelling">' +
          '<div class="gw-tp-sec-lbl">🔤 Spelling &amp; Sound</div>' +
          gwRenderNoteList(t.spellingSoundNotes, '🔤') +
        '</div>' : '';

    var silentHtml = t.silentLetterNotes && t.silentLetterNotes.length
      ? '<div class="gw-tp-sec" id="gw-sec-silent">' +
          '<div class="gw-tp-sec-lbl">🤫 Silent Letters</div>' +
          gwRenderNoteList(t.silentLetterNotes, '🤫') +
        '</div>' : '';

    var homophoneHtml = t.homophoneNotes && t.homophoneNotes.length
      ? '<div class="gw-tp-sec" id="gw-sec-homophones">' +
          '<div class="gw-tp-sec-lbl">🔊 Same-Sound Words</div>' +
          gwRenderNoteList(t.homophoneNotes, '🔊') +
        '</div>' : '';

    var confusingHtml = t.confusingPairs && t.confusingPairs.length
      ? '<div class="gw-tp-sec" id="gw-sec-confusing">' +
          '<div class="gw-tp-sec-lbl">🔀 Easily Confused</div>' +
          gwRenderConfusingPairs(t.confusingPairs) +
        '</div>' : '';

    // PHASE I6B1 — Part 10: near-synonyms + British/American differences.
    var synonymHtml = t.synonymPairs && t.synonymPairs.length
      ? '<div class="gw-tp-sec" id="gw-sec-synonyms">' +
          '<div class="gw-tp-sec-lbl">≈ Near-Synonyms</div>' +
          gwRenderSynonymPairs(t.synonymPairs) +
        '</div>' : '';

    var britishAmericanHtml = t.britishAmerican && t.britishAmerican.length
      ? '<div class="gw-tp-sec" id="gw-sec-britishamerican">' +
          '<div class="gw-tp-sec-lbl">🇬🇧🇺🇸 British vs American</div>' +
          gwRenderBritishAmerican(t.britishAmerican) +
        '</div>' : '';

    // Summary section (optional)
    var summaryHtml = (t.summaryEn || t.summaryPs) ?
      ('<div class="gw-tp-sec" id="gw-sec-summary">' +
        '<div class="gw-tp-sec-lbl">🎯 Summary</div>' +
        (t.summaryEn ? '<div class="gw-tp-en">' + gwEsc(t.summaryEn) + '</div>' : '') +
        (t.summaryPs ? '<div class="gw-tp-ps2 pashto" dir="rtl" lang="ps">' + gwPs(t.summaryPs) + '</div>' : '') +
      '</div>') : '';

    var weakBtn = isWeak
      ? '<button class="gw-btn gw-btn-weak-done" onclick="gwRemoveWeak(\'' + gwEsc(topicId) + '\')">✅ Marked as Practised</button>'
      : '<button class="gw-btn gw-btn-weak" onclick="gwAddWeak(\'' + gwEsc(topicId) + '\')">⭐ Needs Practice</button>';

    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="' + backBtnOnclick + '">' +
          backBtnLabel +
        '</button>' +

        // Auto-read control (Part 3)
        gwAutoReadBarHtml() +

        // Header
        '<div class="gw-tp-hdr">' +
          '<div class="gw-tp-title">' + gwEsc(t.title) + '</div>' +
          '<div class="gw-tp-ps pashto" dir="rtl" lang="ps">' + gwPs(t.titlePs) + '</div>' +
          '<div class="gw-tp-badges">' +
            '<span class="gw-badge" style="background:' + gwEsc(cat.color || '#2563eb') + ';">' +
              (cat.icon || '') + ' ' + gwEsc(cat.name || '') +
            '</span>' +
            '<span class="gw-badge gw-badge-lvl">' + gwEsc(t.level) + '</span>' +
            // PHASE I6G-A FIX: Auto-Wizard Practice button on EVERY Grammar World topic
            '<button type="button" class="glaw-auto-wizard-badge-btn" ' +
              'onclick="event.stopPropagation();if(window.GrammarAutoWizard)window.GrammarAutoWizard.openGW(\'' + gwEsc(topicId) + '\')" ' +
              'title="Auto-Wizard Practice for this topic">🪄 Auto-Wizard Practice</button>' +
            // PHASE I6H-D2: Topic Test button beside Auto-Wizard on every Grammar World topic
            '<button type="button" class="glaw-topic-test-btn" ' +
              'onclick="event.stopPropagation();if(window.ZirakAcademyTests)window.ZirakAcademyTests.startTopicTest(\'gw\',\'' + gwEsc(topicId) + '\')" ' +
              'title="Topic Quiz — graded check">🧪 Topic Quiz</button>' +
          '</div>' +
        '</div>' +

        // Overview / Use
        '<div class="gw-tp-sec" id="gw-sec-meaning">' +
          '<div class="gw-tp-sec-lbl">📘 Meaning &amp; Use</div>' +
          '<div class="gw-tp-en">' + gwEsc(overviewEn) + '</div>' +
          '<div class="gw-tp-ps2 pashto" dir="rtl" lang="ps">' + gwPs(overviewPs) + '</div>' +
        '</div>' +

        // Formula
        '<div class="gw-tp-sec" id="gw-sec-formula">' +
          '<div class="gw-tp-sec-lbl">📐 Formula / Structure</div>' +
          '<div class="gw-formula">' + gwEsc(t.formula) + '</div>' +
        '</div>' +

        // Forms & Examples
        '<div class="gw-tp-sec" id="gw-sec-forms">' +
          '<div class="gw-tp-sec-lbl">💬 Forms &amp; Examples — <span class="gw-hl-legend">highlighted = grammar target</span></div>' +
          formsHtml +
        '</div>' +

        // PHASE I6B — Part 3/4/5/6: new optional sections (each is ''
        // when the topic doesn't supply that field — no-op for the 5
        // original topics).
        explSectionsHtml +
        tablesHtml +
        wordFamiliesHtml +
        synonymHtml +
        britishAmericanHtml +
        spellingHtml +
        silentHtml +
        homophoneHtml +
        confusingHtml +

        // Common mistake
        '<div class="gw-tp-sec gw-mistake-sec" id="gw-sec-mistake">' +
          '<div class="gw-tp-sec-lbl">⚠️ Common Mistake</div>' +
          '<div class="gw-mistake">' +
            '<div class="gw-mrow"><span class="gw-wrong">✗</span><span class="gw-mtxt">' + gwEsc(t.mistake.wrong) + '</span></div>' +
            '<div class="gw-mrow"><span class="gw-correct">✓</span><span class="gw-mtxt">' + gwEsc(t.mistake.correct) + '</span></div>' +
            '<div class="gw-mnote">' + gwEsc(t.mistake.noteEn) + '</div>' +
            '<div class="gw-mnote pashto" dir="rtl" lang="ps">' + gwPs(t.mistake.notePs) + '</div>' +
          '</div>' +
        '</div>' +

        summaryHtml +

        // TTS buttons
        '<div class="gw-tts-row">' +
          '<button class="gw-btn gw-btn-readfull" onclick="gwReadFullLesson(\'' + gwEsc(topicId) + '\')">🎧 Read Full Lesson</button>' +
          '<button class="gw-btn gw-btn-read" onclick="gwReadExplanation(\'' + gwEsc(topicId) + '\')">🔊 Read Explanation</button>' +
          '<button class="gw-btn gw-btn-read" onclick="gwReadExamples(\'' + gwEsc(topicId) + '\')">🔊 Read Examples</button>' +
          '<button class="gw-btn gw-btn-stop" onclick="gwStopReading()">⏹ Stop Reading</button>' +
        '</div>' +

        // Action buttons
        '<div class="gw-action-row">' +
          '<button class="gw-btn gw-btn-practice" onclick="gwPracticeClick(\'' + gwEsc(topicId) + '\')">▶ Start Practice</button>' +
          '<button class="gw-btn gw-btn-quiz" onclick="gwQuizClick(\'' + gwEsc(topicId) + '\')">📝 Take Quiz</button>' +
          weakBtn +
        '</div>' +

        '<div style="height:28px;"></div>' +
      '</div>';

    // PHASE I6A: Auto Read — read the FULL lesson once when the topic opens,
    // but only if global Auto Read is ON. Never loops; never while mic active.
    if (gwAutoReadOn()) {
      clearTimeout(gwAutoReadTimer);
      gwAutoReadTimer = setTimeout(function () {
        if (gwAutoReadOn() && GW_STATE.view === 'topic' && GW_STATE.topicId === topicId) {
          gwReadFullLesson(topicId);
        }
      }, 650);
    }
  }

  // ── TTS Actions ────────────────────────────────────────────────────

  function gwStopReading() {
    // PHASE I6A5B — Part 8/10: clear the highlight immediately for
    // instant visual feedback; the actual chain-halting now happens via
    // the shared engine's own cancel-registration (below), which also
    // correctly fires when the GLOBAL floating Stop Reading button is
    // tapped instead of this one — that button calls
    // speechSynthesis.cancel() directly and previously had no way to
    // know about Grammar World's local session token.
    gwClearReadingHighlight();
    if (typeof window.stopReadingTTS === 'function') { try { window.stopReadingTTS(); return; } catch (e) {} }
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  // PHASE I6A5B — Part 8: highlight-clearing kept local (DOM-only, no
  // TTS logic) so it can be called from multiple places (Stop Reading,
  // between segments) without depending on the chain engine itself.
  function gwClearReadingHighlight() {
    var prev = document.querySelector('.gw-reading-active');
    if (prev) prev.classList.remove('gw-reading-active');
  }

  function gwReadExplanation(topicId) {
    var t = GW_TOPICS[topicId]; if (!t) return;
    var text = t.title + '. ' +
      (t.overviewEn || t.explanationEn || '') + ' ' +
      'Formula: ' + t.formula + '.';
    gwSpeak(text);
  }

  function gwReadExamples(topicId) {
    var t = GW_TOPICS[topicId]; if (!t) return;
    var parts = ['Listen to the examples for ' + t.title + '.'];
    var groups = t.forms || (t.examples ? [{ label: 'Examples', items: t.examples }] : []);
    groups.forEach(function (g) {
      if (g.label) parts.push(g.label + '.');
      (g.items || []).forEach(function (ex) { parts.push(ex.en); });
    });
    gwSpeak(parts.join(' '));
  }

  // Full lesson — title, use, formula, every form, COMMON MISTAKE, summary.
  // PHASE I6A5B — Part 8: now delivered via the SHARED chain engine
  // (window.zirakSpeakChain — same one used by Interview Wizard's
  // sample reading) instead of a Grammar-World-only implementation —
  // this is what "not create a second TTS system" means in practice,
  // and it gives Grammar World the Android-safe timeout fallback and
  // global Stop-Reading-button registration for free. Exact same words,
  // exact same section order as before — only the delivery engine
  // changed. Works generically for ANY topic's forms/groups, not one
  // hard-coded topic.
  function gwReadFullLesson(topicId) {
    var t = GW_TOPICS[topicId]; if (!t) return;
    var segments = [];

    segments.push({
      sectionId: 'gw-sec-meaning',
      text: 'Grammar lesson: ' + t.title + '. ' + (t.overviewEn || t.explanationEn || '')
    });
    segments.push({
      sectionId: 'gw-sec-formula',
      text: 'The structure is: ' + gwSpeakableFormula(t.formula) + '.'
    });

    var groups = t.forms || (t.examples ? [{ label: 'Examples', items: t.examples }] : []);
    groups.forEach(function (g, gi) {
      var parts = [];
      if (g.label) parts.push(g.label + '.');
      (g.items || []).forEach(function (ex) { parts.push(ex.en); });
      segments.push({ sectionId: 'gw-form-group-' + gi, text: parts.join(' ') });
    });

    // PHASE I6B — Part 11: new section types join the SAME reading
    // chain, each with its own sectionId so Read Full Lesson continues
    // to scroll+highlight exactly what it's reading. Tables are
    // announced briefly rather than read cell-by-cell — narrating every
    // row of a table aloud is tedious, not calm (Part 9), and a table
    // is meant to be studied visually; the surrounding forms/examples
    // already carry the spoken content.
    (t.explanationSections || []).forEach(function (s, si) {
      segments.push({ sectionId: 'gw-sec-expl-' + si, text: (s.titleEn ? s.titleEn + '. ' : '') + (s.textEn || '') });
    });

    if (t.tables && t.tables.length) {
      var tableNames = t.tables.map(function (tb) { return tb.titleEn || 'table'; }).join(', ');
      segments.push({ sectionId: 'gw-sec-tables', text: 'There is a table on screen for ' + tableNames + '. Take a moment to look at it.' });
    }

    if (t.wordFamilies && t.wordFamilies.length) {
      var wfParts = ['Word families.'];
      t.wordFamilies.forEach(function (f) {
        wfParts.push(f.base + '.');
        if (f.exampleEn) wfParts.push(f.exampleEn);
      });
      segments.push({ sectionId: 'gw-sec-wordfamilies', text: wfParts.join(' ') });
    }

    // PHASE I6B1 — Part 10/11: near-synonyms + British/American joined
    // the same reading chain as every other section.
    if (t.synonymPairs && t.synonymPairs.length) {
      var synParts = ['Near synonyms.'];
      t.synonymPairs.forEach(function (p) {
        synParts.push(p.wordA + ' and ' + p.wordB + '. ' + (p.noteEn || ''));
      });
      segments.push({ sectionId: 'gw-sec-synonyms', text: synParts.join(' ') });
    }

    if (t.britishAmerican && t.britishAmerican.length) {
      var baParts = ['British versus American English.'];
      t.britishAmerican.forEach(function (it) {
        baParts.push('British: ' + it.british + '. American: ' + it.american + '.');
      });
      segments.push({ sectionId: 'gw-sec-britishamerican', text: baParts.join(' ') });
    }

    ['spellingSoundNotes', 'silentLetterNotes', 'homophoneNotes'].forEach(function (fieldName) {
      var notes = t[fieldName];
      if (!notes || !notes.length) return;
      var sectionId = fieldName === 'silentLetterNotes' ? 'gw-sec-silent'
        : fieldName === 'homophoneNotes' ? 'gw-sec-homophones' : 'gw-sec-spelling';
      var parts = notes.map(function (n) { return n.en + (n.noteEn ? '. ' + n.noteEn : ''); });
      segments.push({ sectionId: sectionId, text: parts.join(' ') });
    });

    if (t.confusingPairs && t.confusingPairs.length) {
      var cpParts = t.confusingPairs.map(function (p) { return p.wordA + ' versus ' + p.wordB + '. ' + (p.noteEn || ''); });
      segments.push({ sectionId: 'gw-sec-confusing', text: cpParts.join(' ') });
    }

    segments.push({
      sectionId: 'gw-sec-mistake',
      text: 'Common mistake. ' +
        'Wrong: ' + t.mistake.wrong.replace(/\s*\/\s*/g, '. ') + '. ' +
        'Correct: ' + t.mistake.correct.replace(/\s*\/\s*/g, '. ') + '. ' +
        t.mistake.noteEn
    });

    if (t.summaryEn) {
      segments.push({ sectionId: 'gw-sec-summary', text: 'Summary. ' + t.summaryEn });
    }

    var clean = segments.filter(function (s) { return s.text && s.text.trim(); });

    if (typeof window.zirakSpeakChain !== 'function') {
      // Defensive fallback if the shared engine is ever unavailable —
      // speak the whole lesson as one utterance rather than going silent.
      gwSpeak(clean.map(function (s) { return s.text; }).join(' '));
      return;
    }

    window.zirakSpeakChain(clean, {
      pauseMs: 350, // Part 9: calm pacing between sections
      onSegmentStart: function (seg) {
        if (!seg.sectionId) return;
        var el = document.getElementById(seg.sectionId);
        if (!el) return;
        gwClearReadingHighlight();
        el.classList.add('gw-reading-active');
        if (typeof window.scrollLearningElementIntoView === 'function') {
          window.scrollLearningElementIntoView(el, { block: 'center' });
        } else {
          try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
        }
      },
      onSegmentEnd: function () { gwClearReadingHighlight(); },
      onAllDone: function () { gwClearReadingHighlight(); }
    });
  }

  // Make a formula string read naturally (e.g. "verb-ing" -> "verb ing",
  // "/" -> "or", "+" -> "plus").
  function gwSpeakableFormula(f) {
    return String(f || '')
      .replace(/verb-ing/gi, 'verb plus i-n-g')
      .replace(/\+/g, ' plus ')
      .replace(/\//g, ' or ')
      .replace(/\|/g, '. Or, ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // ── Placeholder actions (never dead) ──────────────────────────────

  // ===================================================================
  // PHASE I6B — Part 8: Start Practice engine. ONE practice state
  // (GW_PRACTICE) and ONE set of render/scoring functions handle every
  // supported exercise type — no per-type engines. Falls back to the
  // existing "coming soon" placeholder for any topic that doesn't have
  // practiceItems yet (old topics AND any future topic added without
  // practice content), so Start Practice is never a dead button either
  // way.
  // ===================================================================
  var GW_PRACTICE = {
    topicId: null, items: [], index: 0,
    correctCount: 0, wrongCount: 0,
    answered: false, sessionMissed: [],
    advanceTimer: null
  };

  var GW_PRACTICE_TYPE_LABELS = {
    choose: 'Choose the Answer', fillBlank: 'Fill in the Blank', correctMistake: 'Correct the Mistake',
    matchCategory: 'Identify the Category', tableChoice: 'Table Choice', wordFamily: 'Word Family',
    spellingSound: 'Spelling &amp; Sound', silentLetter: 'Silent Letter', selfCheck: 'Say It Aloud'
  };

  function gwPracticeClick(topicId) {
    var t = GW_TOPICS[topicId];
    if (!t || !t.practiceItems || !t.practiceItems.length) {
      gwShowPhModal('Practice for "' + (t ? t.title : 'this topic') +
        '" will be added in a future phase. Keep studying the examples!');
      return;
    }
    gwStartPractice(topicId);
  }

  function gwStartPractice(topicId) {
    var t = GW_TOPICS[topicId];
    if (!t || !t.practiceItems || !t.practiceItems.length) { gwPracticeClick(topicId); return; }
    clearTimeout(GW_PRACTICE.advanceTimer);
    GW_PRACTICE.topicId = topicId;
    GW_PRACTICE.items = t.practiceItems.slice(); // copy — never mutate the source content data
    GW_PRACTICE.index = 0;
    GW_PRACTICE.correctCount = 0;
    GW_PRACTICE.wrongCount = 0;
    GW_PRACTICE.answered = false;
    GW_PRACTICE.sessionMissed = [];
    GW_STATE.view = 'practice';
    try { localStorage.setItem(gwLastTopicKey(), topicId); } catch (e) {}
    gwRenderPracticeQuestion();
  }

  function gwRenderPracticeQuestion() {
    var el = gwEl(); if (!el) return;
    var item = GW_PRACTICE.items[GW_PRACTICE.index];
    if (!item) { gwRenderPracticeSummary(); return; }
    var t = GW_TOPICS[GW_PRACTICE.topicId] || {};
    GW_PRACTICE.answered = false;

    var progressPct = Math.round((GW_PRACTICE.index / GW_PRACTICE.items.length) * 100);
    var typeLabel = GW_PRACTICE_TYPE_LABELS[item.type] || 'Practice';

    var bodyHtml;
    if (item.type === 'fillBlank') bodyHtml = gwRenderFillBlankBody(item);
    else if (item.type === 'selfCheck') bodyHtml = gwRenderSelfCheckBody(item);
    else bodyHtml = gwRenderChoiceBody(item); // choose / correctMistake / matchCategory / tableChoice / wordFamily / spellingSound / silentLetter

    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="gwExitPractice()">← Exit Practice</button>' +
        '<div class="gw-prac-hdr">' +
          '<div class="gw-prac-topic">' + gwEsc(t.title || '') + '</div>' +
          '<div class="gw-prac-progress">Question ' + (GW_PRACTICE.index + 1) + ' of ' + GW_PRACTICE.items.length + ' · ' + typeLabel + '</div>' +
          '<div class="gw-prac-bar"><div class="gw-prac-bar-fill" style="width:' + progressPct + '%;"></div></div>' +
        '</div>' +
        '<div id="gw-prac-feedback" class="gw-prac-feedback" style="display:none;"></div>' +
        bodyHtml +
      '</div>';
  }

  function gwRenderChoiceBody(item) {
    var optsHtml = (item.options || []).map(function (opt, i) {
      return '<button class="gw-prac-opt" id="gw-prac-opt-' + i + '" onclick="gwPracticeAnswerChoice(' + i + ')">' + gwEsc(opt.en) + '</button>';
    }).join('');
    return '<div class="gw-prac-card">' +
      '<div class="gw-prac-q">' + gwEsc(item.promptEn) + '</div>' +
      '<div class="gw-prac-q-ps pashto" dir="rtl" lang="ps">' + gwPs(item.promptPs) + '</div>' +
      '<div class="gw-prac-opts">' + optsHtml + '</div>' +
    '</div>';
  }

  function gwRenderFillBlankBody(item) {
    return '<div class="gw-prac-card">' +
      '<div class="gw-prac-q">' + gwEsc(item.promptEn) + '</div>' +
      '<div class="gw-prac-q-ps pashto" dir="rtl" lang="ps">' + gwPs(item.promptPs) + '</div>' +
      '<input type="text" id="gw-prac-fill-input" class="gw-prac-input" placeholder="Type your answer…" ' +
        'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
        'onkeydown="if(event.key===\'Enter\')gwPracticeAnswerFill()">' +
      '<button class="gw-btn gw-btn-practice" onclick="gwPracticeAnswerFill()">✓ Check</button>' +
    '</div>';
  }

  function gwRenderSelfCheckBody(item) {
    return '<div class="gw-prac-card">' +
      '<div class="gw-prac-q">' + gwEsc(item.promptEn) + '</div>' +
      '<div class="gw-prac-q-ps pashto" dir="rtl" lang="ps">' + gwPs(item.promptPs) + '</div>' +
      (item.sampleEn ? '<div class="gw-prac-sample">🔊 ' + gwEsc(item.sampleEn) + '</div>' : '') +
      '<div class="gw-prac-self-row">' +
        '<button class="gw-btn gw-btn-practice" onclick="gwPracticeSelfMark(true)">✅ I Said It</button>' +
        '<button class="gw-btn gw-btn-weak" onclick="gwPracticeSelfMark(false)">🔁 Need More Practice</button>' +
      '</div>' +
    '</div>';
  }

  function gwPracticeAnswerChoice(selectedIndex) {
    var item = GW_PRACTICE.items[GW_PRACTICE.index];
    if (!item || GW_PRACTICE.answered) return; // guard double-tap
    GW_PRACTICE.answered = true;
    var correct = selectedIndex === item.correctIndex;
    // Mark options visually: correct always shown green, the student's
    // wrong pick (if any) shown red; all further taps disabled.
    for (var i = 0; i < (item.options || []).length; i++) {
      var btn = document.getElementById('gw-prac-opt-' + i);
      if (!btn) continue;
      btn.onclick = null;
      if (i === item.correctIndex) btn.classList.add('gw-prac-opt-correct');
      else if (i === selectedIndex) btn.classList.add('gw-prac-opt-wrong');
    }
    var chosenText = (item.options && item.options[selectedIndex]) ? item.options[selectedIndex].en : '';
    gwPracticeRecordAnswer(item, correct, chosenText);
  }

  function gwPracticeAnswerFill() {
    var item = GW_PRACTICE.items[GW_PRACTICE.index];
    if (!item || GW_PRACTICE.answered) return;
    var inputEl = document.getElementById('gw-prac-fill-input');
    var studentAnswer = (inputEl ? inputEl.value : '').trim();
    var accepted = Array.isArray(item.answerEn) ? item.answerEn : [item.answerEn];
    function norm(s) { return String(s || '').toLowerCase().trim().replace(/[.,!?;:]+$/, ''); }
    var correct = accepted.some(function (a) { return norm(a) === norm(studentAnswer); });
    GW_PRACTICE.answered = true;
    if (inputEl) inputEl.disabled = true;
    gwPracticeRecordAnswer(item, correct, studentAnswer);
  }

  function gwPracticeSelfMark(gotIt) {
    var item = GW_PRACTICE.items[GW_PRACTICE.index];
    if (!item || GW_PRACTICE.answered) return;
    GW_PRACTICE.answered = true;
    gwPracticeRecordAnswer(item, gotIt, gotIt ? '(self-marked: said it correctly)' : '(self-marked: needs more practice)');
  }

  function gwCorrectAnswerText(item) {
    if (item.type === 'fillBlank') return Array.isArray(item.answerEn) ? item.answerEn[0] : (item.answerEn || '');
    if (item.options && typeof item.correctIndex === 'number' && item.options[item.correctIndex]) return item.options[item.correctIndex].en;
    return '';
  }

  // Central scoring + feedback + weak-item storage + calm advance —
  // every exercise type funnels through this ONE function.
  function gwPracticeRecordAnswer(item, correct, studentAnswerText) {
    if (correct) {
      GW_PRACTICE.correctCount++;
    } else {
      GW_PRACTICE.wrongCount++;
      var missedRecord = {
        topicId: GW_PRACTICE.topicId,
        topicTitle: (GW_TOPICS[GW_PRACTICE.topicId] || {}).title || '',
        itemId: item.id,
        mistakeType: item.weakTag || item.type,
        questionText: item.promptEn,
        correctAnswer: gwCorrectAnswerText(item),
        studentAnswer: studentAnswerText,
        timestamp: Date.now()
      };
      // PHASE I6C — Part 7: ONE weak-review store, richer records. The
      // Grammar Lab engine adds future-safe fields (schemaVersion, weakTags,
      // domainTags, levelNumber, masteryStatus, reviewDue, attempts,
      // sourceMode) onto the SAME record shape — same store, same reader.
      if (window.ZirakGrammarLab && window.ZirakGrammarLab.extendWeakRecord) {
        missedRecord = window.ZirakGrammarLab.extendWeakRecord(missedRecord, { sourceMode: 'lesson' });
      }
      GW_PRACTICE.sessionMissed.push(missedRecord);
      gwAddWeakItem(missedRecord);
    }

    var fb = document.getElementById('gw-prac-feedback');
    if (fb) {
      fb.style.display = 'block';
      fb.className = 'gw-prac-feedback ' + (correct ? 'gw-prac-fb-good' : 'gw-prac-fb-retry');
      var correctTxt = gwCorrectAnswerText(item);
      var msgEn = correct ? 'Correct!' : ('Not quite — correct answer: ' + correctTxt);
      var explHtml = item.explanationEn
        ? '<div class="gw-prac-fb-expl">' + gwEsc(item.explanationEn) + '</div>' +
          '<div class="gw-prac-fb-expl-ps pashto" dir="rtl" lang="ps">' + gwPs(item.explanationPs) + '</div>'
        : '';
      fb.innerHTML = '<div class="gw-prac-fb-msg">' + (correct ? '✅ ' : '🔁 ') + gwEsc(msgEn) + '</div>' + explHtml;
      if (typeof window.scrollLearningElementIntoView === 'function') {
        window.scrollLearningElementIntoView(fb, { block: 'center' });
      } else {
        try { fb.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      }
    }

    // PHASE I6B — Part 11: short spoken feedback, respects Auto Read,
    // uses the SAME gwSpeak() (and therefore the saved voice speed) as
    // everywhere else — no second TTS system.
    if (gwAutoReadOn()) {
      var speakMsg = (correct ? 'Correct. ' : 'Not quite. ') + (item.explanationEn || '');
      gwSpeak(speakMsg);
    }

    // Calm pause before advancing (Part 9) — not instant.
    clearTimeout(GW_PRACTICE.advanceTimer);
    GW_PRACTICE.advanceTimer = setTimeout(function () {
      GW_PRACTICE.index++;
      gwRenderPracticeQuestion();
    }, 1800);
  }

  function gwRenderPracticeSummary() {
    var el = gwEl(); if (!el) return;
    var t = GW_TOPICS[GW_PRACTICE.topicId] || {};
    var total = GW_PRACTICE.items.length;
    var pct = total ? Math.round((GW_PRACTICE.correctCount / total) * 100) : 0;
    // Respectful result language, matching this academy's locked
    // wording elsewhere in the app — never shames the student.
    var resultLabel = pct >= 90 ? 'Excellent' : pct >= 70 ? 'Passed Strongly' : pct >= 50 ? 'Passed, Needs Review' : 'Repeat Weak Parts';

    var history = gwPracticeHistoryLoad();
    history.push({ topicId: GW_PRACTICE.topicId, topicTitle: t.title || '', score: GW_PRACTICE.correctCount, total: total, percent: pct, timestamp: Date.now() });
    if (history.length > 100) history = history.slice(history.length - 100);
    gwPracticeHistorySave(history);

    var missedHtml = GW_PRACTICE.sessionMissed.length
      ? '<div class="gw-prac-summary-missed"><div class="gw-prac-summary-missed-lbl">Review these:</div>' +
          GW_PRACTICE.sessionMissed.map(function (m) {
            return '<div class="gw-prac-summary-missed-item">❌ ' + gwEsc(m.questionText) + ' — <b>' + gwEsc(m.correctAnswer) + '</b></div>';
          }).join('') +
        '</div>'
      : '';

    el.innerHTML =
      '<div class="gw-inner">' +
        '<div class="gw-prac-summary-card">' +
          '<div class="gw-prac-summary-title">' + gwEsc(resultLabel) + '</div>' +
          '<div class="gw-prac-summary-score">' + GW_PRACTICE.correctCount + ' / ' + total + ' correct (' + pct + '%)</div>' +
          missedHtml +
          '<div class="gw-prac-summary-actions">' +
            (GW_PRACTICE.sessionMissed.length ? '<button class="gw-btn gw-btn-weak" onclick="gwRetryWeakFromSession()">🔁 Retry Weak Items</button>' : '') +
            // I6H-B: WhatsApp proof button via shared helper
            (window.ZirakResultProof
              ? window.ZirakResultProof.renderButtonHtml(
                  'Grammar Practice: ' + (t.title || GW_PRACTICE.topicId),
                  GW_PRACTICE.correctCount, total, { source: 'grammar-world', contentId: GW_PRACTICE.topicId })
              : '') +
            '<button class="gw-btn gw-btn-practice" onclick="gwOpenTopic(\'' + gwEsc(GW_PRACTICE.topicId) + '\')">📘 Back to Topic</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    if (gwAutoReadOn()) {
      gwSpeak(resultLabel + '. You got ' + GW_PRACTICE.correctCount + ' out of ' + total + ' correct.');
    }
  }

  function gwRetryWeakFromSession() {
    if (!GW_PRACTICE.sessionMissed.length) return;
    var missedIds = GW_PRACTICE.sessionMissed.map(function (m) { return m.itemId; });
    var t = GW_TOPICS[GW_PRACTICE.topicId];
    if (!t) return;
    var retryItems = (t.practiceItems || []).filter(function (it) { return missedIds.indexOf(it.id) !== -1; });
    if (!retryItems.length) return;
    GW_PRACTICE.items = retryItems;
    GW_PRACTICE.index = 0;
    GW_PRACTICE.correctCount = 0;
    GW_PRACTICE.wrongCount = 0;
    GW_PRACTICE.sessionMissed = [];
    gwRenderPracticeQuestion();
  }

  function gwExitPractice() {
    clearTimeout(GW_PRACTICE.advanceTimer);
    if (typeof window.gwStopReading === 'function') window.gwStopReading();
    gwOpenTopic(GW_PRACTICE.topicId);
  }

  function gwQuizClick(topicId) {
    var t = GW_TOPICS[topicId];
    gwShowPhModal('Grammar quiz for "' + (t ? t.title : 'this topic') +
      '" will be added in the next phase.');
  }
  function gwPracticeAll() {
    gwShowPhModal('Grammar Practice Mode will be available in the next phase.');
  }
  function gwQuizAll() {
    gwShowPhModal('Grammar Quiz Mode will be available in the next phase.');
  }

  // ── Weak Grammar Review ────────────────────────────────────────────

  function gwReviewWeak() {
    var weakTopicIds = gwWeakLoad();
    var weakItems = gwWeakItemsLoad();
    var el = gwEl(); if (!el) return;

    // PHASE I6B — Part 10: friendly empty state, exact wording requested.
    if (!weakTopicIds.length && !weakItems.length) {
      GW_STATE.view = 'weak';
      el.innerHTML =
        '<div class="gw-inner">' +
          '<button class="gw-back-btn" onclick="gwRenderLanding()">← Grammar World</button>' +
          '<div class="gw-ph-card" style="text-align:center;padding:24px 16px;">' +
            '😊 You have no weak grammar saved yet. Practice a topic first.' +
          '</div>' +
          '<div style="height:28px;"></div>' +
        '</div>';
      return;
    }

    GW_STATE.view = 'weak';

    // Section 1: granular weak PRACTICE ITEMS from actual attempts —
    // the specific, actionable review requested for this phase.
    var itemRows = weakItems.slice().reverse().map(function (w) {
      return '<div class="gw-weak-item-card">' +
        '<div class="gw-weak-item-topic">' + gwEsc(w.topicTitle || '') + '</div>' +
        '<div class="gw-weak-item-type">' + gwEsc(w.mistakeType || '') + '</div>' +
        '<div class="gw-weak-item-q">' + gwEsc(w.questionText || '') + '</div>' +
        '<div class="gw-weak-item-ans"><b>Correct answer:</b> ' + gwEsc(w.correctAnswer || '') + '</div>' +
        '<button class="gw-btn gw-btn-practice gw-btn-sm" onclick="gwRetryTopicFromWeak(\'' + gwEsc(w.topicId) + '\')">🔁 Try Again</button>' +
      '</div>';
    }).join('');
    var itemsSection = weakItems.length
      ? '<div class="gw-section-lbl">📝 Missed Practice Questions</div><div class="gw-weak-item-list">' + itemRows + '</div>'
      : '';

    // Section 2: topics manually marked "Needs Practice" (existing
    // system, completely unchanged).
    var topicRows = weakTopicIds.map(function (tid) {
      var t = GW_TOPICS[tid]; if (!t) return '';
      var cat = gwCat(t.category) || {};
      return '<div class="gw-topic-card" onclick="gwOpenTopic(\'' + gwEsc(tid) + '\')" role="button" tabindex="0">' +
        '<div class="gw-topic-dot" style="background:' + gwEsc(cat.color || '#b45309') + ';">' + (cat.icon || '📖') + '</div>' +
        '<div class="gw-topic-body">' +
          '<div class="gw-topic-title">' + gwEsc(t.title) + '</div>' +
          '<div class="gw-topic-ps pashto" dir="rtl" lang="ps">' + gwEsc(t.titlePs) + '</div>' +
        '</div>' +
        '<div class="gw-topic-arr">▶</div>' +
      '</div>';
    }).join('');
    var topicsSection = weakTopicIds.length
      ? '<div class="gw-section-lbl">⭐ Topics Marked Needs Practice</div><div class="gw-topic-list">' + topicRows + '</div>'
      : '';

    el.innerHTML =
      '<div class="gw-inner">' +
        '<button class="gw-back-btn" onclick="gwRenderLanding()">← Grammar World</button>' +
        '<div class="gw-cat-hdr" style="background:#b45309;">' +
          '<span class="gw-cat-hdr-icon">⭐</span>' +
          '<div>' +
            '<div class="gw-cat-hdr-name">Weak Grammar Review</div>' +
            '<div class="gw-cat-hdr-ps pashto" dir="rtl" lang="ps">د ضعیف ګرامر بیاکتنه</div>' +
          '</div>' +
        '</div>' +
        itemsSection +
        topicsSection +
        '<div style="height:28px;"></div>' +
      '</div>';
  }

  // PHASE I6B — Part 10: "Try Again" on a missed practice question
  // re-opens that item's TOPIC and starts a fresh practice session for
  // it (simplest, safest — always works even if the specific item id
  // has since changed) rather than trying to isolate just that one
  // question.
  function gwRetryTopicFromWeak(topicId) {
    var t = GW_TOPICS[topicId];
    if (!t) { gwRenderLanding(); return; }
    gwStartPractice(topicId);
  }

  // ── CSS injection (self-contained — no edits to styles.css) ────────

  function gwInjectStyles() {
    if (document.getElementById('gw-styles')) return;
    var s = document.createElement('style');
    s.id = 'gw-styles';
    s.textContent =
      /* Layout wrappers */
      '.gw-landing,.gw-inner{padding:0 2px;}' +

      /* Hero */
      '.gw-hero{background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;border-radius:18px;padding:20px 18px;margin-bottom:14px;text-align:center;}' +
      '.gw-hero-title{font-size:22px;font-weight:900;letter-spacing:.3px;}' +
      '.gw-hero-ps{font-size:14px;margin-top:3px;opacity:.9;}' +
      '.gw-hero-desc{font-size:13px;margin-top:8px;opacity:.93;line-height:1.6;}' +

      /* Weak landing card */
      '.gw-weak-card{display:flex;align-items:center;gap:12px;background:linear-gradient(90deg,#b45309,#d97706);color:#fff;border-radius:14px;padding:14px 16px;margin-bottom:14px;cursor:pointer;}' +
      '.gw-weak-icon{font-size:22px;flex-shrink:0;}' +
      '.gw-weak-body{flex:1;}' +
      '.gw-weak-title{font-weight:800;font-size:15px;}' +
      '.gw-weak-sub{font-size:12px;opacity:.93;margin-top:2px;}' +
      '.gw-weak-arr{font-size:16px;opacity:.8;}' +

      /* Section label */
      '.gw-section-lbl{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted,#64748b);margin-bottom:10px;}' +

      /* Category grid */
      '.gw-cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(126px,1fr));gap:10px;margin-bottom:14px;}' +
      '.gw-cat-card{background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-top:3px solid transparent;border-radius:14px;padding:13px 10px;text-align:center;cursor:pointer;transition:transform .15s,box-shadow .15s;}' +
      '.gw-cat-card:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.10);}' +
      '[data-theme="dark"] .gw-cat-card{background:#1e293b;border-color:#334155;}' +
      '.gw-cat-icon{font-size:26px;margin-bottom:6px;}' +
      '.gw-cat-name{font-size:12.5px;font-weight:700;color:var(--text,#1e293b);line-height:1.35;}' +
      '[data-theme="dark"] .gw-cat-name{color:#e2e8f0;}' +
      '.gw-cat-ps{font-size:11px;margin-top:3px;color:var(--text-muted,#64748b);}' +
      '.gw-cat-badge{display:inline-block;color:#fff;font-size:10px;font-weight:700;padding:1px 8px;border-radius:99px;margin-top:6px;}' +
      '.gw-cat-badge-soon{background:#94a3b8;}' +

      /* Placeholder cards */
      '.gw-ph-card{background:var(--bg-card2,#f1f5f9);border:1.5px dashed var(--border,#e2e8f0);border-radius:12px;padding:14px 16px;font-size:13px;color:var(--text-muted,#64748b);margin-bottom:12px;cursor:pointer;}' +
      '[data-theme="dark"] .gw-ph-card{background:#1e293b;border-color:#334155;color:#94a3b8;}' +
      '.gw-ph-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}' +
      '.gw-ph-half{background:var(--bg-card2,#f1f5f9);border:1.5px dashed var(--border,#e2e8f0);border-radius:12px;padding:14px 12px;font-size:13px;color:var(--text-muted,#64748b);text-align:center;cursor:pointer;}' +
      '[data-theme="dark"] .gw-ph-half{background:#1e293b;border-color:#334155;color:#94a3b8;}' +

      /* Back button */
      '.gw-back-btn{background:var(--bg-card2,#f1f5f9);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:8px 16px;font-size:14px;font-weight:600;cursor:pointer;color:var(--text,#1e293b);margin-bottom:12px;display:inline-flex;align-items:center;gap:6px;}' +
      '[data-theme="dark"] .gw-back-btn{background:#334155;border-color:#475569;color:#e2e8f0;}' +

      /* Category header */
      '.gw-cat-hdr{display:flex;align-items:center;gap:14px;color:#fff;border-radius:14px;padding:16px;margin-bottom:12px;}' +
      '.gw-cat-hdr-icon{font-size:32px;flex-shrink:0;}' +
      '.gw-cat-hdr-name{font-size:19px;font-weight:900;}' +
      '.gw-cat-hdr-ps{font-size:13px;opacity:.9;margin-top:3px;}' +

      /* Topic list */
      '.gw-topic-list{display:flex;flex-direction:column;gap:10px;}' +
      '.gw-topic-card{display:flex;align-items:center;gap:12px;background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:14px 16px;cursor:pointer;transition:box-shadow .15s;}' +
      '.gw-topic-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.10);}' +
      '[data-theme="dark"] .gw-topic-card{background:#1e293b;border-color:#334155;}' +
      '.gw-topic-dot{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;color:#fff;}' +
      '.gw-topic-body{flex:1;min-width:0;}' +
      '.gw-topic-title{font-weight:700;font-size:15px;color:var(--text,#1e293b);}' +
      '[data-theme="dark"] .gw-topic-title{color:#e2e8f0;}' +
      '.gw-topic-ps{font-size:13px;color:var(--text-muted,#64748b);margin-top:2px;}' +
      '.gw-topic-lvl{font-size:11px;font-weight:600;color:#94a3b8;margin-top:3px;text-transform:uppercase;letter-spacing:.4px;}' +
      '.gw-topic-arr{color:#94a3b8;font-size:14px;flex-shrink:0;}' +
      '.gw-weak-badge{font-size:10px;font-weight:700;background:#f59e0b;color:#fff;padding:1px 7px;border-radius:99px;margin-left:7px;vertical-align:middle;}' +

      /* Topic page */
      '.gw-tp-hdr{margin:10px 0 14px;}' +
      '.gw-tp-title{font-size:22px;font-weight:900;color:var(--text,#1e293b);line-height:1.3;}' +
      '[data-theme="dark"] .gw-tp-title{color:#f1f5f9;}' +
      '.gw-tp-ps{font-size:14px;margin-top:4px;color:var(--text-muted,#64748b);}' +
      '.gw-tp-badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;}' +
      '.gw-badge{display:inline-block;color:#fff;font-size:12px;font-weight:700;padding:3px 11px;border-radius:99px;}' +
      '.gw-badge-lvl{background:#475569;}' +

      /* Section cards */
      '.gw-tp-sec{background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:14px 16px;margin-bottom:12px;}' +
      '[data-theme="dark"] .gw-tp-sec{background:#1e293b;border-color:#334155;}' +
      '.gw-tp-sec-lbl{font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted,#64748b);margin-bottom:8px;}' +
      '.gw-tp-en{font-size:15px;color:var(--text,#1e293b);line-height:1.65;}' +
      '[data-theme="dark"] .gw-tp-en{color:#e2e8f0;}' +
      '.gw-tp-ps2{font-size:14px;margin-top:8px;color:var(--text-muted,#475569);line-height:1.7;}' +
      '[data-theme="dark"] .gw-tp-ps2{color:#cbd5e1;}' +

      /* Formula */
      '.gw-formula{font-size:15px;font-weight:700;color:#1d4ed8;background:#eff6ff;border-left:4px solid #2563eb;padding:10px 14px;border-radius:0 10px 10px 0;font-family:var(--font-mono,monospace);line-height:1.6;}' +
      '[data-theme="dark"] .gw-formula{background:#1e3a8a33;color:#93c5fd;border-color:#3b82f6;}' +

      /* Examples */
      '.gw-examples{display:flex;flex-direction:column;gap:10px;}' +
      '.gw-example{display:flex;gap:10px;align-items:flex-start;}' +
      '.gw-ex-num{font-size:13px;font-weight:700;color:#94a3b8;flex-shrink:0;min-width:18px;padding-top:2px;}' +
      '.gw-ex-body{flex:1;}' +
      '.gw-ex-en{font-size:15px;font-weight:600;color:var(--text,#1e293b);line-height:1.55;}' +
      '[data-theme="dark"] .gw-ex-en{color:#f1f5f9;}' +
      '.gw-ex-ps{font-size:13px;color:var(--text-muted,#64748b);margin-top:3px;line-height:1.65;}' +
      '[data-theme="dark"] .gw-ex-ps{color:#94a3b8;}' +

      /* Grammar highlight (the KEY learning visual) */
      '.gw-hl{background:#fef08a;color:#854d0e;font-weight:900;border-radius:4px;padding:0 3px;}' +
      '[data-theme="dark"] .gw-hl{background:#713f12;color:#fef08a;}' +
      '.gw-hl-legend{font-size:11px;font-weight:400;color:var(--text-muted,#94a3b8);text-transform:none;letter-spacing:0;}' +

      /* Pending marker */
      '.gw-pending{color:#f59e0b;font-style:italic;font-size:12px;}' +

      /* Common mistake */
      '.gw-mistake{display:flex;flex-direction:column;gap:6px;}' +
      '.gw-mrow{display:flex;gap:10px;align-items:flex-start;}' +
      '.gw-wrong{color:#dc2626;font-weight:900;flex-shrink:0;font-size:17px;line-height:1.2;}' +
      '.gw-correct{color:#16a34a;font-weight:900;flex-shrink:0;font-size:17px;line-height:1.2;}' +
      '.gw-mtxt{font-size:14px;color:var(--text,#1e293b);line-height:1.55;}' +
      '[data-theme="dark"] .gw-mtxt{color:#e2e8f0;}' +
      '.gw-mnote{font-size:13px;color:var(--text-muted,#64748b);margin-top:4px;line-height:1.55;}' +
      '[data-theme="dark"] .gw-mnote{color:#94a3b8;}' +

      /* Buttons */
      '.gw-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:none;border-radius:10px;padding:10px 16px;font-size:14px;font-weight:700;cursor:pointer;transition:opacity .15s;}' +
      '.gw-btn:hover{opacity:.86;}' +
      '.gw-btn-read{background:#1d4ed8;color:#fff;}' +
      '.gw-btn-practice{background:#16a34a;color:#fff;}' +
      '.gw-btn-quiz{background:#7c3aed;color:#fff;}' +
      '.gw-btn-weak{background:#f59e0b;color:#fff;}' +
      '.gw-btn-weak-done{background:#64748b;color:#fff;}' +
      '.gw-btn-readfull{background:#0f766e;color:#fff;}' +
      '.gw-btn-stop{background:transparent;color:#dc2626;border:1.5px solid #dc2626;}' +
      '[data-theme="dark"] .gw-btn-stop{color:#fca5a5;border-color:#ef4444;}' +
      // PHASE I6A — form groups (Affirmative / Negative / Questions / ...)
      '.gw-form-group{margin-bottom:14px;}' +
      '.gw-form-group:last-child{margin-bottom:0;}' +
      '.gw-form-lbl{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12.5px;font-weight:800;color:#1d4ed8;text-transform:uppercase;letter-spacing:.5px;margin-bottom:7px;padding-bottom:4px;border-bottom:1.5px solid var(--border,#e2e8f0);}' +
      '[data-theme="dark"] .gw-form-lbl{color:#93c5fd;border-color:#334155;}' +
      '.gw-form-lbl-ps{font-size:12px;font-weight:600;color:var(--text-muted,#94a3b8);text-transform:none;letter-spacing:0;}' +
      // mistake section emphasis (Part 9 visibility)
      '.gw-mistake-sec{border:1.5px solid #f59e0b55;background:#fffbeb;}' +
      '[data-theme="dark"] .gw-mistake-sec{background:#78350f22;border-color:#b4530977;}' +
      // PHASE I6A5B — Part 8: "currently being read aloud" highlight —
      // applied to whichever section/form-group the shared chain engine
      // (window.zirakSpeakChain) is on right now, so Auto Read / Read
      // Full Lesson visibly follows along instead of the page sitting
      // static. Calm green (not blue) to match the same "currently
      // being read" cue used by Interview Wizard's sentence highlight.
      // Professional accent treatment (no flashing/animation), readable
      // in both themes, and layers cleanly on top of .gw-mistake-sec's
      // own border (box-shadow ring instead of competing border colors).
      '.gw-reading-active{position:relative;transition:box-shadow .25s ease,background-color .25s ease;box-shadow:0 0 0 2px #16a34a,0 4px 18px rgba(22,163,74,.18);background:#f0fdf4;border-radius:14px;}' +
      '[data-theme="dark"] .gw-reading-active{box-shadow:0 0 0 2px #4ade80,0 4px 18px rgba(74,222,128,.22);background:#14532d26;}' +
      '.gw-form-group.gw-reading-active{padding:10px;margin:-10px -10px 4px -10px;}' +
      // PHASE I6A — Auto Read toggle pill (Part 3)
      '.gw-autoread-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--bg-card2,#f1f5f9);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:9px 14px;margin-bottom:12px;}' +
      '[data-theme="dark"] .gw-autoread-bar{background:#1e293b;border-color:#334155;}' +
      '.gw-autoread-lbl{font-size:13.5px;font-weight:800;color:var(--text,#1e293b);}' +
      '[data-theme="dark"] .gw-autoread-lbl{color:#e2e8f0;}' +
      '.gw-autoread-toggle{display:inline-flex;align-items:center;gap:8px;border:none;cursor:pointer;border-radius:99px;padding:5px 12px 5px 6px;font-size:12px;font-weight:800;color:#fff;transition:background .15s;}' +
      '.gw-autoread-toggle.on{background:#16a34a;}' +
      '.gw-autoread-toggle.off{background:#94a3b8;}' +
      '.gw-autoread-knob{width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3);}' +
      '.gw-autoread-state{letter-spacing:.5px;}' +
      '.gw-bar-controls{display:flex;align-items:center;gap:8px;}' +
      '.gw-theme-btn{border:1px solid var(--border,#cbd5e1);background:var(--bg-card,#fff);cursor:pointer;border-radius:99px;width:34px;height:30px;font-size:15px;line-height:1;}' +
      '[data-theme="dark"] .gw-theme-btn{background:#334155;border-color:#475569;}' +
      '.gw-formula{font-size:15.5px;font-weight:800;color:#1d4ed8;background:#eff6ff;border-left:5px solid #2563eb;padding:11px 14px;border-radius:0 10px 10px 0;font-family:var(--font-mono,monospace);line-height:1.65;}' +
      '[data-theme="dark"] .gw-formula{background:#1e3a8a44;color:#bfdbfe;border-color:#3b82f6;}' +
      '.gw-tts-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;}' +
      '.gw-action-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +

      // ===============================================================
      // PHASE I6B — Part 6: table renderer CSS. Horizontal scroll
      // wrapper keeps wide tables (5+ columns) from breaking the page
      // layout on narrow phones — the table itself keeps its natural
      // width and simply scrolls, rather than being squeezed illegibly.
      // ===============================================================
      '.gw-table-block{margin-bottom:14px;}' +
      '.gw-table-block:last-child{margin-bottom:0;}' +
      '.gw-table-title{font-size:13px;font-weight:800;color:var(--text,#1e293b);margin-bottom:8px;}' +
      '[data-theme="dark"] .gw-table-title{color:#e2e8f0;}' +
      '.gw-table-title-ps{font-weight:600;color:var(--text-muted,#64748b);}' +
      '.gw-table-wrap{overflow-x:auto;border:1px solid var(--border,#e2e8f0);border-radius:10px;-webkit-overflow-scrolling:touch;}' +
      '[data-theme="dark"] .gw-table-wrap{border-color:#334155;}' +
      '.gw-table{border-collapse:collapse;width:100%;min-width:340px;font-size:13.5px;}' +
      '.gw-table th{background:#eff6ff;color:#1d4ed8;font-weight:800;text-align:left;padding:9px 12px;white-space:nowrap;border-bottom:2px solid #bfdbfe;}' +
      '[data-theme="dark"] .gw-table th{background:#1e3a8a33;color:#93c5fd;border-color:#3b82f6;}' +
      '.gw-th-ps{display:block;font-size:11px;font-weight:600;color:#60a5fa;margin-top:1px;}' +
      '.gw-table td{padding:9px 12px;border-bottom:1px solid var(--border,#e2e8f0);vertical-align:top;color:var(--text,#1e293b);}' +
      '[data-theme="dark"] .gw-table td{border-color:#334155;color:#e2e8f0;}' +
      '.gw-table tr:last-child td{border-bottom:none;}' +
      '.gw-table tr:nth-child(even){background:var(--bg-card2,#f8fafc);}' +
      '[data-theme="dark"] .gw-table tr:nth-child(even){background:#1e293b88;}' +
      '.gw-tc-en{font-weight:600;}' +
      '.gw-tc-ps{font-size:12px;color:var(--text-muted,#64748b);margin-top:2px;}' +
      '[data-theme="dark"] .gw-tc-ps{color:#94a3b8;}' +

      // Word families — reuses .gw-table above, adds detail cards below.
      '.gw-wf-details{display:flex;flex-direction:column;gap:10px;margin-top:12px;}' +
      '.gw-wf-detail{background:var(--bg-card2,#f8fafc);border-radius:10px;padding:10px 12px;border-left:3px solid #7c3aed;}' +
      '[data-theme="dark"] .gw-wf-detail{background:#1e293b;border-color:#a78bfa;}' +
      '.gw-wf-base{font-weight:800;color:#7c3aed;font-size:13px;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;}' +
      '[data-theme="dark"] .gw-wf-base{color:#c4b5fd;}' +
      '.gw-wf-ex{font-size:14px;color:var(--text,#1e293b);font-style:italic;}' +
      '[data-theme="dark"] .gw-wf-ex{color:#e2e8f0;}' +
      '.gw-wf-ex-ps{font-size:13px;color:var(--text-muted,#64748b);margin-top:2px;}' +
      '.gw-wf-mistake{font-size:12.5px;color:#b45309;margin-top:6px;line-height:1.5;}' +
      '[data-theme="dark"] .gw-wf-mistake{color:#fbbf24;}' +

      // Note lists (spelling/sound, silent letters, homophones, confusing pairs)
      '.gw-note-list{display:flex;flex-direction:column;gap:8px;}' +
      '.gw-note-item{background:var(--bg-card2,#f8fafc);border-radius:10px;padding:9px 12px;}' +
      '[data-theme="dark"] .gw-note-item{background:#1e293b;}' +
      '.gw-note-head{font-size:14px;font-weight:700;color:var(--text,#1e293b);}' +
      '[data-theme="dark"] .gw-note-head{color:#e2e8f0;}' +
      '.gw-note-word{color:#0f766e;}' +
      '[data-theme="dark"] .gw-note-word{color:#5eead4;}' +
      '.gw-note-word-ps{font-size:12.5px;color:var(--text-muted,#64748b);margin:2px 0 4px;}' +
      '.gw-note-text{font-size:13px;color:var(--text,#334155);line-height:1.5;}' +
      '[data-theme="dark"] .gw-note-text{color:#cbd5e1;}' +
      '.gw-note-text-ps{font-size:12.5px;color:var(--text-muted,#64748b);margin-top:2px;line-height:1.6;}' +
      // PHASE I6B1 — Part 10: near-synonym example sentences.
      '.gw-syn-examples{margin-top:8px;display:flex;flex-direction:column;gap:6px;}' +
      '.gw-syn-ex{font-size:13px;color:var(--text,#334155);line-height:1.5;padding:6px 8px;background:var(--bg-card,#fff);border-radius:8px;}' +
      '[data-theme="dark"] .gw-syn-ex{color:#e2e8f0;background:#0f172a;}' +
      '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .gw-syn-ex{color:#e2e8f0;background:#0f172a;} }' +

      // ===============================================================
      // PHASE I6B — Part 7: Browse by Level cards + level detail header.
      // ===============================================================
      '.gw-lvl-list{display:flex;flex-direction:column;gap:8px;margin-bottom:16px;}' +
      '.gw-lvl-card{display:flex;align-items:center;gap:12px;background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:12px;padding:11px 14px;cursor:pointer;transition:box-shadow .15s;}' +
      '.gw-lvl-card:hover{box-shadow:0 4px 14px rgba(0,0,0,.08);}' +
      '[data-theme="dark"] .gw-lvl-card{background:#1e293b;border-color:#334155;}' +
      '.gw-lvl-card-locked{opacity:.72;}' +
      '.gw-lvl-num{width:32px;height:32px;border-radius:50%;background:#0f766e;color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
      '.gw-lvl-card-locked .gw-lvl-num{background:#94a3b8;}' +
      '.gw-lvl-body{flex:1;min-width:0;}' +
      '.gw-lvl-name{font-weight:700;font-size:14px;color:var(--text,#1e293b);}' +
      '[data-theme="dark"] .gw-lvl-name{color:#e2e8f0;}' +
      '.gw-lvl-ps{font-size:12px;color:var(--text-muted,#64748b);margin-top:1px;}' +
      '.gw-lvl-badge{font-size:11px;font-weight:700;color:#0f766e;background:#ccfbf1;padding:2px 9px;border-radius:99px;flex-shrink:0;white-space:nowrap;}' +
      '[data-theme="dark"] .gw-lvl-badge{background:#134e4a;color:#5eead4;}' +
      '.gw-lvl-badge-soon{color:#64748b;background:#f1f5f9;}' +
      '[data-theme="dark"] .gw-lvl-badge-soon{background:#334155;color:#94a3b8;}' +
      '.gw-lvl-goal{background:var(--bg-card2,#f0fdfa);border:1px solid #99f6e4;border-radius:12px;padding:12px 14px;margin-bottom:14px;}' +
      '[data-theme="dark"] .gw-lvl-goal{background:#0f766e22;border-color:#0f766e77;}' +
      '.gw-lvl-goal-en{font-size:13.5px;font-weight:600;color:var(--text,#1e293b);line-height:1.55;}' +
      '[data-theme="dark"] .gw-lvl-goal-en{color:#e2e8f0;}' +
      '.gw-lvl-goal-ps{font-size:12.5px;color:var(--text-muted,#64748b);margin-top:5px;line-height:1.6;}' +

      // ===============================================================
      // PHASE I6B — Part 10: weak practice-item review cards.
      // ===============================================================
      '.gw-weak-item-list{display:flex;flex-direction:column;gap:10px;margin-bottom:16px;}' +
      '.gw-weak-item-card{background:var(--bg-card,#fff);border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:12px;padding:12px 14px;}' +
      '[data-theme="dark"] .gw-weak-item-card{background:#1e293b;border-color:#78350f;border-left-color:#f59e0b;}' +
      '.gw-weak-item-topic{font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#b45309;margin-bottom:3px;}' +
      '[data-theme="dark"] .gw-weak-item-topic{color:#fbbf24;}' +
      '.gw-weak-item-type{font-size:11px;color:var(--text-muted,#64748b);margin-bottom:6px;text-transform:capitalize;}' +
      '.gw-weak-item-q{font-size:14px;font-weight:600;color:var(--text,#1e293b);margin-bottom:4px;line-height:1.5;}' +
      '[data-theme="dark"] .gw-weak-item-q{color:#e2e8f0;}' +
      '.gw-weak-item-ans{font-size:13px;color:#16a34a;margin-bottom:8px;}' +
      '[data-theme="dark"] .gw-weak-item-ans{color:#4ade80;}' +
      '.gw-btn-sm{padding:7px 12px;font-size:12.5px;}' +

      // ===============================================================
      // PHASE I6B — Part 8: practice engine UI.
      // ===============================================================
      '.gw-prac-hdr{margin-bottom:14px;}' +
      '.gw-prac-topic{font-size:12px;font-weight:700;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:.4px;}' +
      '.gw-prac-progress{font-size:13px;font-weight:600;color:var(--text,#1e293b);margin-top:2px;}' +
      '[data-theme="dark"] .gw-prac-progress{color:#e2e8f0;}' +
      '.gw-prac-bar{height:6px;background:var(--border,#e2e8f0);border-radius:99px;margin-top:8px;overflow:hidden;}' +
      '[data-theme="dark"] .gw-prac-bar{background:#334155;}' +
      '.gw-prac-bar-fill{height:100%;background:#16a34a;border-radius:99px;transition:width .3s ease;}' +
      '.gw-prac-card{background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;padding:16px;margin-bottom:14px;}' +
      '[data-theme="dark"] .gw-prac-card{background:#1e293b;border-color:#334155;}' +
      '.gw-prac-q{font-size:16px;font-weight:700;color:var(--text,#1e293b);line-height:1.5;}' +
      '[data-theme="dark"] .gw-prac-q{color:#f1f5f9;}' +
      '.gw-prac-q-ps{font-size:14px;color:var(--text-muted,#64748b);margin-top:6px;line-height:1.7;}' +
      '.gw-prac-opts{display:flex;flex-direction:column;gap:9px;margin-top:14px;}' +
      '.gw-prac-opt{background:var(--bg-card2,#f8fafc);border:1.5px solid var(--border,#e2e8f0);border-radius:10px;padding:12px 14px;font-size:14.5px;font-weight:600;color:var(--text,#1e293b);text-align:left;cursor:pointer;transition:border-color .15s,background .15s;}' +
      '[data-theme="dark"] .gw-prac-opt{background:#0f172a;border-color:#334155;color:#e2e8f0;}' +
      '.gw-prac-opt:hover{border-color:#2563eb;}' +
      '.gw-prac-opt-correct{background:#dcfce7 !important;border-color:#16a34a !important;color:#14532d !important;}' +
      '[data-theme="dark"] .gw-prac-opt-correct{background:#14532d99 !important;color:#bbf7d0 !important;}' +
      '.gw-prac-opt-wrong{background:#fee2e2 !important;border-color:#dc2626 !important;color:#7f1d1d !important;}' +
      '[data-theme="dark"] .gw-prac-opt-wrong{background:#7f1d1d99 !important;color:#fecaca !important;}' +
      '.gw-prac-input{width:100%;box-sizing:border-box;padding:12px 14px;font-size:15px;border:1.5px solid var(--border,#e2e8f0);border-radius:10px;background:var(--bg-card2,#f8fafc);color:var(--text,#1e293b);margin-top:14px;}' +
      '[data-theme="dark"] .gw-prac-input{background:#0f172a;border-color:#334155;color:#e2e8f0;}' +
      '.gw-prac-input:focus{outline:none;border-color:#2563eb;}' +
      '.gw-prac-sample{font-size:15px;font-weight:600;color:#1d4ed8;background:#eff6ff;border-radius:10px;padding:10px 12px;margin-top:12px;}' +
      '[data-theme="dark"] .gw-prac-sample{background:#1e3a8a33;color:#93c5fd;}' +
      '.gw-prac-self-row{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}' +
      '.gw-prac-feedback{border-radius:12px;padding:12px 14px;margin-bottom:12px;}' +
      '.gw-prac-fb-good{background:#dcfce7;border:1px solid #86efac;}' +
      '[data-theme="dark"] .gw-prac-fb-good{background:#14532d55;border-color:#16a34a;}' +
      '.gw-prac-fb-retry{background:#fffbeb;border:1px solid #fde68a;}' +
      '[data-theme="dark"] .gw-prac-fb-retry{background:#78350f33;border-color:#f59e0b;}' +
      '.gw-prac-fb-msg{font-size:14.5px;font-weight:700;color:var(--text,#1e293b);}' +
      '[data-theme="dark"] .gw-prac-fb-msg{color:#f1f5f9;}' +
      '.gw-prac-fb-expl{font-size:13px;color:var(--text,#334155);margin-top:6px;line-height:1.5;}' +
      '[data-theme="dark"] .gw-prac-fb-expl{color:#cbd5e1;}' +
      '.gw-prac-fb-expl-ps{font-size:12.5px;color:var(--text-muted,#64748b);margin-top:4px;line-height:1.6;}' +

      // Practice summary card
      '.gw-prac-summary-card{background:var(--bg-card,#fff);border:1px solid var(--border,#e2e8f0);border-radius:16px;padding:22px 18px;text-align:center;}' +
      '[data-theme="dark"] .gw-prac-summary-card{background:#1e293b;border-color:#334155;}' +
      '.gw-prac-summary-title{font-size:22px;font-weight:900;color:#16a34a;}' +
      '[data-theme="dark"] .gw-prac-summary-title{color:#4ade80;}' +
      '.gw-prac-summary-score{font-size:15px;font-weight:600;color:var(--text-muted,#64748b);margin-top:6px;}' +
      '.gw-prac-summary-missed{text-align:left;margin-top:16px;background:var(--bg-card2,#f8fafc);border-radius:10px;padding:12px 14px;}' +
      '[data-theme="dark"] .gw-prac-summary-missed{background:#0f172a;}' +
      '.gw-prac-summary-missed-lbl{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:var(--text-muted,#64748b);margin-bottom:6px;}' +
      '.gw-prac-summary-missed-item{font-size:13px;color:var(--text,#1e293b);margin-bottom:5px;line-height:1.5;}' +
      '[data-theme="dark"] .gw-prac-summary-missed-item{color:#e2e8f0;}' +
      '.gw-prac-summary-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:18px;}' +

      /* Placeholder modal */
      '.gw-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9998;}' +
      '.gw-modal-box{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9999;background:var(--bg-card,#fff);border-radius:18px;padding:24px 22px;max-width:340px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,.25);text-align:center;}' +
      '[data-theme="dark"] .gw-modal-box{background:#1e293b;}' +
      '.gw-modal-msg{font-size:15px;color:var(--text,#1e293b);margin-bottom:18px;line-height:1.65;}' +
      '[data-theme="dark"] .gw-modal-msg{color:#e2e8f0;}' +

      // PHASE I6B1 -- Part 4: dark-mode coverage completeness fix for
      // Grammar World's OWN injected stylesheet (separate CSS system from
      // styles.css, same underlying gap: rules only had [data-theme="dark"]
      // coverage, so they silently never applied for students on "System"
      // theme with a dark-mode device -- the majority real-world case,
      // since data-theme is only SET when a student explicitly picks Dark
      // in Settings. Each rule below is IDENTICAL to its existing
      // [data-theme="dark"] counterpart -- only adds the missing 2nd path.
      '@media (prefers-color-scheme: dark) {' +
        ':root:not([data-theme="light"]) .gw-cat-card{background:#1e293b;border-color:#334155;}' +
        ':root:not([data-theme="light"]) .gw-cat-name{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-ph-card{background:#1e293b;border-color:#334155;color:#94a3b8;}' +
        ':root:not([data-theme="light"]) .gw-ph-half{background:#1e293b;border-color:#334155;color:#94a3b8;}' +
        ':root:not([data-theme="light"]) .gw-back-btn{background:#334155;border-color:#475569;color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-topic-card{background:#1e293b;border-color:#334155;}' +
        ':root:not([data-theme="light"]) .gw-topic-title{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-tp-title{color:#f1f5f9;}' +
        ':root:not([data-theme="light"]) .gw-tp-sec{background:#1e293b;border-color:#334155;}' +
        ':root:not([data-theme="light"]) .gw-tp-en{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-tp-ps2{color:#cbd5e1;}' +
        ':root:not([data-theme="light"]) .gw-formula{background:#1e3a8a33;color:#93c5fd;border-color:#3b82f6;}' +
        ':root:not([data-theme="light"]) .gw-ex-en{color:#f1f5f9;}' +
        ':root:not([data-theme="light"]) .gw-ex-ps{color:#94a3b8;}' +
        ':root:not([data-theme="light"]) .gw-hl{background:#713f12;color:#fef08a;}' +
        ':root:not([data-theme="light"]) .gw-mtxt{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-mnote{color:#94a3b8;}' +
        ':root:not([data-theme="light"]) .gw-btn-stop{color:#fca5a5;border-color:#ef4444;}' +
        ':root:not([data-theme="light"]) .gw-form-lbl{color:#93c5fd;border-color:#334155;}' +
        ':root:not([data-theme="light"]) .gw-mistake-sec{background:#78350f22;border-color:#b4530977;}' +
        ':root:not([data-theme="light"]) .gw-reading-active{box-shadow:0 0 0 2px #4ade80,0 4px 18px rgba(74,222,128,.22);background:#14532d26;}' +
        ':root:not([data-theme="light"]) .gw-autoread-bar{background:#1e293b;border-color:#334155;}' +
        ':root:not([data-theme="light"]) .gw-autoread-lbl{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-theme-btn{background:#334155;border-color:#475569;}' +
        ':root:not([data-theme="light"]) .gw-table-title{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-table-wrap{border-color:#334155;}' +
        ':root:not([data-theme="light"]) .gw-table th{background:#1e3a8a33;color:#93c5fd;border-color:#3b82f6;}' +
        ':root:not([data-theme="light"]) .gw-table td{border-color:#334155;color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-table tr:nth-child(even){background:#1e293b88;}' +
        ':root:not([data-theme="light"]) .gw-tc-ps{color:#94a3b8;}' +
        ':root:not([data-theme="light"]) .gw-wf-detail{background:#1e293b;border-color:#a78bfa;}' +
        ':root:not([data-theme="light"]) .gw-wf-base{color:#c4b5fd;}' +
        ':root:not([data-theme="light"]) .gw-wf-ex{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-wf-mistake{color:#fbbf24;}' +
        ':root:not([data-theme="light"]) .gw-note-item{background:#1e293b;}' +
        ':root:not([data-theme="light"]) .gw-note-head{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-note-word{color:#5eead4;}' +
        ':root:not([data-theme="light"]) .gw-note-text{color:#cbd5e1;}' +
        ':root:not([data-theme="light"]) .gw-lvl-card{background:#1e293b;border-color:#334155;}' +
        ':root:not([data-theme="light"]) .gw-lvl-name{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-lvl-badge{background:#134e4a;color:#5eead4;}' +
        ':root:not([data-theme="light"]) .gw-lvl-badge-soon{background:#334155;color:#94a3b8;}' +
        ':root:not([data-theme="light"]) .gw-lvl-goal{background:#0f766e22;border-color:#0f766e77;}' +
        ':root:not([data-theme="light"]) .gw-lvl-goal-en{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-weak-item-card{background:#1e293b;border-color:#78350f;border-left-color:#f59e0b;}' +
        ':root:not([data-theme="light"]) .gw-weak-item-topic{color:#fbbf24;}' +
        ':root:not([data-theme="light"]) .gw-weak-item-q{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-weak-item-ans{color:#4ade80;}' +
        ':root:not([data-theme="light"]) .gw-prac-progress{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-prac-bar{background:#334155;}' +
        ':root:not([data-theme="light"]) .gw-prac-card{background:#1e293b;border-color:#334155;}' +
        ':root:not([data-theme="light"]) .gw-prac-q{color:#f1f5f9;}' +
        ':root:not([data-theme="light"]) .gw-prac-opt{background:#0f172a;border-color:#334155;color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-prac-opt-correct{background:#14532d99 !important;color:#bbf7d0 !important;}' +
        ':root:not([data-theme="light"]) .gw-prac-opt-wrong{background:#7f1d1d99 !important;color:#fecaca !important;}' +
        ':root:not([data-theme="light"]) .gw-prac-input{background:#0f172a;border-color:#334155;color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-prac-sample{background:#1e3a8a33;color:#93c5fd;}' +
        ':root:not([data-theme="light"]) .gw-prac-fb-good{background:#14532d55;border-color:#16a34a;}' +
        ':root:not([data-theme="light"]) .gw-prac-fb-retry{background:#78350f33;border-color:#f59e0b;}' +
        ':root:not([data-theme="light"]) .gw-prac-fb-msg{color:#f1f5f9;}' +
        ':root:not([data-theme="light"]) .gw-prac-fb-expl{color:#cbd5e1;}' +
        ':root:not([data-theme="light"]) .gw-prac-summary-card{background:#1e293b;border-color:#334155;}' +
        ':root:not([data-theme="light"]) .gw-prac-summary-title{color:#4ade80;}' +
        ':root:not([data-theme="light"]) .gw-prac-summary-missed{background:#0f172a;}' +
        ':root:not([data-theme="light"]) .gw-prac-summary-missed-item{color:#e2e8f0;}' +
        ':root:not([data-theme="light"]) .gw-modal-box{background:#1e293b;}' +
        ':root:not([data-theme="light"]) .gw-modal-msg{color:#e2e8f0;}' +
      '}' +

      /* Responsive */
      '@media(max-width:400px){.gw-cat-grid{grid-template-columns:repeat(auto-fill,minmax(110px,1fr));}.gw-action-row{flex-direction:column;}.gw-btn{width:100%;}.gw-prac-summary-actions{flex-direction:column;}}';

    document.head.appendChild(s);
  }

  // ── Override renderGrammarCards (hook into navigate('grammar')) ────
  // The original function is in app.js. Since we load after app.js, our
  // assignment replaces it. navigate() at app.js:686 calls this function.
  window.renderGrammarCards = function () {
    GW_STATE.view    = 'landing';
    GW_STATE.catId   = null;
    GW_STATE.topicId = null;
    gwInjectStyles();
    gwRenderLanding();
  };

  // ── Expose all onclick handlers ────────────────────────────────────
  window.gwRenderLanding   = gwRenderLanding;
  window.gwOpenCategory    = gwOpenCategory;
  window.gwOpenLevel       = gwOpenLevel;
  window.gwOpenTopic       = gwOpenTopic;
  window.gwRenderTopic     = gwRenderTopic;
  window.gwReadExplanation = gwReadExplanation;
  window.gwReadExamples    = gwReadExamples;
  window.gwReadFullLesson  = gwReadFullLesson;
  window.gwStopReading     = gwStopReading;
  window.gwAutoReadToggle  = gwAutoReadToggle;
  window.gwCycleTheme      = gwCycleTheme;
  window.gwPracticeClick   = gwPracticeClick;
  window.gwQuizClick       = gwQuizClick;
  window.gwAddWeak         = gwAddWeak;
  window.gwRemoveWeak      = gwRemoveWeak;
  window.gwReviewWeak      = gwReviewWeak;
  window.gwPracticeAll     = gwPracticeAll;
  window.gwQuizAll         = gwQuizAll;
  // PHASE I6B — Part 8: practice engine
  window.gwStartPractice        = gwStartPractice;
  window.gwPracticeAnswerChoice = gwPracticeAnswerChoice;
  window.gwPracticeAnswerFill   = gwPracticeAnswerFill;
  window.gwPracticeSelfMark     = gwPracticeSelfMark;
  window.gwRetryWeakFromSession = gwRetryWeakFromSession;
  window.gwExitPractice         = gwExitPractice;
  // PHASE I6B — Part 10: weak-item review
  window.gwRemoveWeakItem       = gwRemoveWeakItem;
  window.gwRetryTopicFromWeak   = gwRetryTopicFromWeak;

  // Global Auto Read flag readable by the rest of the app (e.g. Home welcome).
  window.ZirakAutoReadOn = gwAutoReadOn;

  // Expose data for future phases and dev console.
  window.GW_STATE      = GW_STATE;
  window.GW_CATEGORIES = GW_CATEGORIES;
  window.GW_TOPICS     = GW_TOPICS;
  window.GW_CAT_TOPICS = GW_CAT_TOPICS;
  window.GW_PRACTICE   = GW_PRACTICE;

  // Boot: inject styles immediately (script runs at end of body).
  gwInjectStyles();

})();
// === END grammar-world.js ===
