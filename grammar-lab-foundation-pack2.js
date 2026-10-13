/* ============================================================================
   grammar-lab-foundation-pack2.js — PHASE I6E
   FOUNDATION GRAMMAR REAL CONTENT PACK 2 (L2–L3)
   ----------------------------------------------------------------------------
   CONTENT ONLY — exactly the I6D pack pattern. No renderers, no new TTS,
   no new guide system, no new weak store, no second Foundation Path.
   Registers 9 topics (path order 11–19), 18 sessions (27 wizard + 18 test
   items), and 4 reference entries through the ONE engine:
     ZirakGrammarLab.registerTopics / registerSessions / registerReferenceEntries

   CONTINUES Pack 1: the only touch to I6D data is one ADDITIVE link — the
   Pack 1 chain end (gl.topic.am-is-are, nextTopics:[]) is pointed at the
   first Pack 2 topic so the path flows 1→19. Pack 1 content is untouched.

   PASHTO: fresh professional support, once per item/section, owner-reviewable.
   English "you" is taught with both Pashto senses: ته / تاسو.
   No Urdu / Dari / Farsi / Persian anywhere.
   ============================================================================ */
(function () {
  'use strict';
  if (!window.ZirakGrammarLab) return;
  var GL = window.ZirakGrammarLab;

  /* ── Cross-pack chain link (additive; Pack 1 content untouched) ────────── */
  if (GL.topics['gl.topic.am-is-are'] &&
      (!GL.topics['gl.topic.am-is-are'].nextTopics || !GL.topics['gl.topic.am-is-are'].nextTopics.length)) {
    GL.topics['gl.topic.am-is-are'].nextTopics = ['gl.topic.subject-pronouns-deeper'];
  }

  /* ==========================================================================
     TOPICS (9) — gl.path.foundation-1, pathOrder 11 → 19, L2–L3
     ========================================================================== */
  GL.registerTopics([

    { id:'gl.topic.subject-pronouns-deeper', pathId:'gl.path.foundation-1', pathOrder:11,
      categoryId:'gl.cat.pronouns-wh', levelNumber:2, status:'active',
      titleEn:'Subject Pronouns — Deeper', titlePs:'فاعلي ضمیرونه — ژور',
      shortGuideEn:'Master all seven pronouns, and learn that English you means both one person and many.',
      shortGuidePs:'اوه واړه ضمیرونه زده کړه؛ انګلیسي you د یو کس او ډېرو کسانو دواړو لپاره دی.',
      reasonEn:'One English word, you, covers two Pashto words. Knowing this early prevents many mistakes.',
      reasonPs:'یوه انګلیسي کلمه you د دوو پښتو کلمو ځای نیسي؛ دا پوهه ډېرې تېروتنې مخنیوی کوي.',
      prerequisites:['gl.topic.subject-pronouns'], nextTopics:['gl.topic.be-positive-review'],
      weakTags:['weak:subject-pronouns-deeper','weak:you-singular-plural'],
      wizardSessionId:'gl.session.t11-wiz-001', testSessionId:'gl.session.t11-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'English has seven subject pronouns: I, you, he, she, it, we, they. The word you is special: it means one person or many people — the sentence stays the same.',
          ps:'انګلیسي اوه فاعلي ضمیرونه لري. کلمه you ځانګړې ده: هم یو کس او هم ډېر کسان — جمله نه بدلیږي.' },
        { type:'formula', titleEn:'you = two Pashto words', rows:[
          { en:'you (one person)', ps:'ته' },
          { en:'you (many people)', ps:'تاسو' },
          { en:'Both take: you are', ps:'دواړه are اخلي' }
        ]},
        { type:'examples', items:[
          { en:'You are my friend.', ps:'ته زما ملګری یې.', domain:'daily life' },
          { en:'You are my students.', ps:'تاسو زما زده کوونکي یاست.', domain:'school' },
          { en:'We are in class.', ps:'موږ په ټولګي کې یو.', domain:'class' },
          { en:'They are at the market.', ps:'هغوی په بازار کې دي.', domain:'market' }
        ]},
        { type:'commonMistake', wrongEn:'You is my friend.', rightEn:'You are my friend.',
          noteEn:'you always takes are — for one person or many.',
          notePs:'you تل are اخلي — که یو کس وي که ډېر.' }
      ]},

    { id:'gl.topic.be-positive-review', pathId:'gl.path.foundation-1', pathOrder:12,
      categoryId:'gl.cat.verbs-forms', levelNumber:2, status:'active',
      titleEn:'am, is, are — Full Table', titlePs:'am، is او are — بشپړ جدول',
      shortGuideEn:'One clear table: which be form goes with every pronoun.',
      shortGuidePs:'یو روښانه جدول: له هر ضمیر سره کوم فعل راځي.',
      reasonEn:'This deepens the first am/is/are lesson into the full seven-pronoun table you will use everywhere.',
      reasonPs:'دا د لومړي am/is/are لوست بشپړ جدول جوړوي چې هر ځای یې کاروې.',
      prerequisites:['gl.topic.am-is-are','gl.topic.subject-pronouns-deeper'], nextTopics:['gl.topic.be-negative'],
      weakTags:['weak:be-positive'],
      wizardSessionId:'gl.session.t12-wiz-001', testSessionId:'gl.session.t12-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'The full be table', rows:[
          { en:'I am', ps:'زه' },
          { en:'you are', ps:'ته / تاسو' },
          { en:'he is', ps:'هغه (نارینه)' },
          { en:'she is', ps:'هغه (ښځینه)' },
          { en:'it is', ps:'هغه (شی یا ژوی)' },
          { en:'we are', ps:'موږ' },
          { en:'they are', ps:'هغوی' }
        ]},
        { type:'examples', items:[
          { en:'I am a student.', ps:'زه زده کوونکی یم.', domain:'school' },
          { en:'You are ready.', ps:'ته چمتو یې.', domain:'class' },
          { en:'He is my brother.', ps:'هغه زما ورور دی.', domain:'family' },
          { en:'We are students.', ps:'موږ زده کوونکي یو.', domain:'school' },
          { en:'They are friends.', ps:'هغوی ملګري دي.', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'We is students.', rightEn:'We are students.',
          noteEn:'With we, you, and they, always use are.',
          notePs:'له we, you او they سره تل are راځي.' }
      ]},

    { id:'gl.topic.be-negative', pathId:'gl.path.foundation-1', pathOrder:13,
      categoryId:'gl.cat.verbs-forms', levelNumber:2, status:'active',
      titleEn:'am, is, are — Negative', titlePs:'منفي: am/is/are + not',
      shortGuideEn:'Say what is NOT true: put not after am, is, or are.',
      shortGuidePs:'د منفي لپاره not د am/is/are وروسته راځي.',
      reasonEn:'Negatives let you correct and deny politely: I am not a teacher.',
      reasonPs:'منفي جملې تا ته اجازه درکوي چې په نرمۍ رد یا سمون وکړې.',
      prerequisites:['gl.topic.be-positive-review'], nextTopics:['gl.topic.be-questions'],
      weakTags:['weak:be-negative'],
      wizardSessionId:'gl.session.t13-wiz-001', testSessionId:'gl.session.t13-test-001',
      referenceEntries:['gl.ref.be-negative'],
      lessonBlocks:[
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'Subject + am / is / are + not', ps:'فاعل + فعل + not' },
          { en:'He is not angry.' }
        ]},
        { type:'examples', items:[
          { en:'I am not a teacher.', ps:'زه ښوونکی نه یم.', domain:'school' },
          { en:'He is not angry.', ps:'هغه غوسه نه دی.', domain:'family' },
          { en:'She is not at home.', ps:'هغه په کور کې نه ده.', domain:'home' },
          { en:'We are not tired.', ps:'موږ ستړي نه یو.', domain:'daily life' },
          { en:'They are not students.', ps:'هغوی زده کوونکي نه دي.', domain:'school' }
        ]},
        { type:'note',
          en:'Short forms exist: is not → isn\'t, are not → aren\'t. We will practice them in a later lesson.',
          ps:'لنډې بڼې شته: isn\'t او aren\'t — وروسته یې تمرینوو.' },
        { type:'commonMistake', wrongEn:'He not is angry.', rightEn:'He is not angry.',
          noteEn:'not comes after is, never before it.',
          notePs:'not د is وروسته راځي، هېڅکله مخکې.' }
      ]},

    { id:'gl.topic.be-questions', pathId:'gl.path.foundation-1', pathOrder:14,
      categoryId:'gl.cat.questions-negatives', levelNumber:3, status:'active',
      titleEn:'am, is, are — Yes/No Questions', titlePs:'پوښتنې: Am / Is / Are',
      shortGuideEn:'To ask, move am, is, or are to the front of the sentence.',
      shortGuidePs:'د پوښتنې لپاره am/is/are جملې سر ته راوړه.',
      reasonEn:'Yes/no questions are your first real conversation tool: Are you a student?',
      reasonPs:'د هو/نه پوښتنې ستا لومړۍ ریښتینې د خبرو وسیله ده.',
      prerequisites:['gl.topic.be-positive-review'], nextTopics:['gl.topic.be-short-answers'],
      weakTags:['weak:be-question-order'],
      wizardSessionId:'gl.session.t14-wiz-001', testSessionId:'gl.session.t14-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'Am / Is / Are + subject + ... ?', ps:'فعل + فاعل + ... ؟' },
          { en:'You are a student. → Are you a student?' }
        ]},
        { type:'examples', items:[
          { en:'Am I ready?', ps:'ایا زه چمتو یم؟', domain:'class' },
          { en:'Are you a student?', ps:'ایا ته زده کوونکی یې؟', domain:'school' },
          { en:'Is he your brother?', ps:'ایا هغه ستا ورور دی؟', domain:'family' },
          { en:'Is it your book?', ps:'ایا دا ستا کتاب دی؟', domain:'school' },
          { en:'Are they friends?', ps:'ایا هغوی ملګري دي؟', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'You are a student?', rightEn:'Are you a student?',
          noteEn:'In English we move are to the front to make a question.',
          notePs:'په انګلیسي کې د پوښتنې لپاره are سر ته ځي.' }
      ]},

    { id:'gl.topic.be-short-answers', pathId:'gl.path.foundation-1', pathOrder:15,
      categoryId:'gl.cat.questions-negatives', levelNumber:3, status:'active',
      titleEn:'Short Answers with be', titlePs:'لنډ ځوابونه له be سره',
      shortGuideEn:'Answer naturally: Yes, I am. No, he is not.',
      shortGuidePs:'طبیعي ځواب: Yes, I am یا No, he is not.',
      reasonEn:'Real conversations use short answers, not full repeated sentences.',
      reasonPs:'ریښتینې خبرې لنډ ځوابونه کاروي، نه بشپړې تکراري جملې.',
      prerequisites:['gl.topic.be-questions'], nextTopics:['gl.topic.this-that-these-those'],
      weakTags:['weak:be-short-answer'],
      wizardSessionId:'gl.session.t15-wiz-001', testSessionId:'gl.session.t15-test-001',
      referenceEntries:['gl.ref.be-short-answers'],
      lessonBlocks:[
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'Yes, + pronoun + am / is / are', ps:'هو + ضمیر + فعل' },
          { en:'No, + pronoun + am / is / are + not', ps:'نه + ضمیر + فعل + not' },
          { en:'Are they friends? → Yes, they are. / No, they are not.' }
        ]},
        { type:'examples', items:[
          { en:'Are you a student? — Yes, I am.', ps:'ایا ته زده کوونکی یې؟ — هو، یم.', domain:'school' },
          { en:'Is she your teacher? — Yes, she is.', ps:'ایا هغه ستا ښوونکې ده؟ — هو، ده.', domain:'school' },
          { en:'Is it your pen? — No, it is not.', ps:'ایا دا ستا قلم دی؟ — نه، نه دی.', domain:'class' },
          { en:'Are they friends? — No, they are not.', ps:'ایا هغوی ملګري دي؟ — نه، نه دي.', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'Are you ready? — Yes, you are.', rightEn:'Are you ready? — Yes, I am.',
          noteEn:'The question asks about YOU, so you answer about yourself with I.',
          notePs:'پوښتنه ستا په اړه ده، نو ځواب له I سره ورکوې.' }
      ]},

    { id:'gl.topic.this-that-these-those', pathId:'gl.path.foundation-1', pathOrder:16,
      categoryId:'gl.cat.pronouns-wh', levelNumber:2, status:'active',
      titleEn:'this, that, these, those', titlePs:'دا او هغه — یو او ډېر',
      shortGuideEn:'Near or far, one or many: this, that, these, those.',
      shortGuidePs:'نږدې یا لرې، یو یا ډېر: this, that, these, those.',
      reasonEn:'Pointing words let you talk about things around you in class, home, and market.',
      reasonPs:'د اشارې کلمې تا ته اجازه درکوي چې شاوخوا شیانو په اړه وغږیږې.',
      prerequisites:['gl.topic.noun-basics','gl.topic.be-positive-review'], nextTopics:['gl.topic.possessive-adjectives-basic'],
      weakTags:['weak:this-that','weak:these-those'],
      wizardSessionId:'gl.session.t16-wiz-001', testSessionId:'gl.session.t16-test-001',
      referenceEntries:['gl.ref.this-that-these-those'],
      lessonBlocks:[
        { type:'formula', titleEn:'Near / far, one / many', rows:[
          { en:'this — near, one', ps:'دا (نږدې، یو)' },
          { en:'that — far, one', ps:'هغه (لرې، یو)' },
          { en:'these — near, many', ps:'دا (نږدې، ډېر)' },
          { en:'those — far, many', ps:'هغه (لرې، ډېر)' }
        ]},
        { type:'examples', items:[
          { en:'This is my book.', ps:'دا زما کتاب دی.', domain:'school' },
          { en:'That is your pen.', ps:'هغه ستا قلم دی.', domain:'class' },
          { en:'These are my books.', ps:'دا زما کتابونه دي.', domain:'school' },
          { en:'Those are your bags.', ps:'هغه ستا بکسونه دي.', domain:'market' }
        ]},
        { type:'commonMistake', wrongEn:'This are my books.', rightEn:'These are my books.',
          noteEn:'Many things near you: these, with are.',
          notePs:'ډېر شیان نږدې: these له are سره.' }
      ]},

    { id:'gl.topic.possessive-adjectives-basic', pathId:'gl.path.foundation-1', pathOrder:17,
      categoryId:'gl.cat.pronouns-wh', levelNumber:2, status:'active',
      titleEn:'Possessive Adjectives', titlePs:'ملکیتي صفتونه',
      shortGuideEn:'my, your, his, her, its, our, their — always before a noun.',
      shortGuidePs:'my, your, his... تل د نوم مخکې راځي.',
      reasonEn:'Ownership words connect people to things: my book, our class, their school.',
      reasonPs:'د ملکیت کلمې کسان له شیانو سره نښلوي.',
      prerequisites:['gl.topic.subject-pronouns-deeper'], nextTopics:['gl.topic.adjectives-with-be-basic'],
      weakTags:['weak:possessive-adjectives'],
      wizardSessionId:'gl.session.t17-wiz-001', testSessionId:'gl.session.t17-test-001',
      referenceEntries:['gl.ref.possessive-adjectives'],
      lessonBlocks:[
        { type:'formula', titleEn:'The seven possessive adjectives', rows:[
          { en:'I → my', ps:'زما' },
          { en:'you → your', ps:'ستا / ستاسو' },
          { en:'he → his', ps:'د هغه' },
          { en:'she → her', ps:'د هغې' },
          { en:'it → its', ps:'د هغه (شي)' },
          { en:'we → our', ps:'زموږ' },
          { en:'they → their', ps:'د هغوی' }
        ]},
        { type:'examples', items:[
          { en:'my book', ps:'زما کتاب', domain:'school' },
          { en:'her teacher', ps:'د هغې ښوونکې', domain:'school' },
          { en:'his bag', ps:'د هغه بکس', domain:'market' },
          { en:'our class', ps:'زموږ ټولګی', domain:'class' },
          { en:'their school', ps:'د هغوی ښوونځی', domain:'school' }
        ]},
        { type:'note',
          en:'Words like mine, yours, and hers come in a later lesson.',
          ps:'کلمې لکه mine او yours وروسته راځي.' },
        { type:'commonMistake', wrongEn:'This is he book.', rightEn:'This is his book.',
          noteEn:'Before a noun, use his — not he.',
          notePs:'د نوم مخکې his راځي، نه he.' }
      ]},

    { id:'gl.topic.adjectives-with-be-basic', pathId:'gl.path.foundation-1', pathOrder:18,
      categoryId:'gl.cat.adjectives-adverbs', levelNumber:2, status:'active',
      titleEn:'Adjectives with be', titlePs:'صفتونه له be سره',
      shortGuideEn:'Describe with be + adjective: I am happy. They are tired.',
      shortGuidePs:'توصیف: be + صفت. زه خوشحاله یم.',
      reasonEn:'One small pattern gives you hundreds of sentences: subject + be + adjective.',
      reasonPs:'یو کوچنی جوړښت سلګونه جملې درکوي: فاعل + be + صفت.',
      prerequisites:['gl.topic.be-positive-review'], nextTopics:['gl.topic.foundation-mixed-be-review'],
      weakTags:['weak:adjective-with-be'],
      wizardSessionId:'gl.session.t18-wiz-001', testSessionId:'gl.session.t18-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'An adjective describes: happy, ready, good, kind, small, big, tired, busy, new, old. In English the adjective never changes — no plural -s on adjectives.',
          ps:'صفت توصیف کوي. په انګلیسي کې صفت نه بدلیږي — صفت هېڅکله جمع s نه اخلي.' },
        { type:'examples', items:[
          { en:'I am happy.', ps:'زه خوشحاله یم.', domain:'daily life' },
          { en:'He is tall.', ps:'هغه لوړ دی.', domain:'family' },
          { en:'She is kind.', ps:'هغه مهربانه ده.', domain:'school' },
          { en:'It is small.', ps:'دا کوچنی دی.', domain:'home' },
          { en:'They are tired.', ps:'هغوی ستړي دي.', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'They are tireds.', rightEn:'They are tired.',
          noteEn:'Adjectives never take plural -s in English.',
          notePs:'صفتونه په انګلیسي کې هېڅکله جمع s نه اخلي.' }
      ]},

    { id:'gl.topic.foundation-mixed-be-review', pathId:'gl.path.foundation-1', pathOrder:19,
      categoryId:'gl.cat.foundation', levelNumber:3, status:'active',
      titleEn:'Mixed Review: be, this/these, my/his', titlePs:'ګډه بیاکتنه',
      shortGuideEn:'Mix everything: pointing words, ownership words, be forms, questions, and short answers.',
      shortGuidePs:'هرڅه ګډ: اشاره، ملکیت، be بڼې، پوښتنې او لنډ ځوابونه.',
      reasonEn:'Mixing the pieces makes them stick — this is your first full foundation checkpoint.',
      reasonPs:'ګډول زده کړه ټینګوي — دا ستا لومړۍ بشپړه بنسټیزه ازموینه ده.',
      prerequisites:['gl.topic.be-short-answers','gl.topic.this-that-these-those','gl.topic.possessive-adjectives-basic'],
      nextTopics:[],
      weakTags:['weak:foundation-be-review','weak:capital-full-stop-basic'],
      wizardSessionId:'gl.session.t19-wiz-001', testSessionId:'gl.session.t19-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'Now put it all together. Every sentence starts with a capital letter and ends with a full stop.',
          ps:'اوس هرڅه سره یوځای کړه. هره جمله په لوی توري پیلیږي او په ټکي پای ته رسیږي.' },
        { type:'examples', items:[
          { en:'This is my book.', ps:'دا زما کتاب دی.', domain:'school' },
          { en:'These are our books.', ps:'دا زموږ کتابونه دي.', domain:'class' },
          { en:'She is not tired.', ps:'هغه ستړې نه ده.', domain:'home' },
          { en:'Are they ready? — Yes, they are.', ps:'ایا هغوی چمتو دي؟ — هو، دي.', domain:'class' },
          { en:'That is his bag.', ps:'هغه د هغه بکس دی.', domain:'market' }
        ]},
        { type:'commonMistake', wrongEn:'these is our books.', rightEn:'These are our books.',
          noteEn:'Capital letter at the start, and these takes are.',
          notePs:'په سر کې لوی توری، او these له are سره راځي.' }
      ]}
  ]);

  /* ==========================================================================
     SESSIONS — per-topic wizard (3) + mini test (2). 45 items total.
     ========================================================================== */
  GL.registerSessions({

    /* ── T11 Subject Pronouns — Deeper ── */
    'gl.session.t11-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.subject-pronouns-deeper',
      titleEn:'Practice: Pronouns Deeper', titlePs:'تمرین: ضمیرونه ژور', items:[
      { id:'gl.drill.pronouns-deeper-001', mode:'choose', topicRef:'gl.topic.subject-pronouns-deeper',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:you-singular-plural'], domainTags:['daily-life'],
        promptEn:'You ___ my friend. (one person)', promptPs:'سم فعل وټاکه.',
        choices:['is','are','am'], answer:'are',
        feedbackEn:'you always takes are, even for one person.', feedbackPs:'you تل are اخلي، که یو کس هم وي.' },
      { id:'gl.drill.pronouns-deeper-002', mode:'choose', topicRef:'gl.topic.subject-pronouns-deeper',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:you-singular-plural'], domainTags:['school'],
        promptEn:'___ are my students. (many people)', promptPs:'سم ضمیر وټاکه.',
        choices:['You','He','I'], answer:'You',
        feedbackEn:'you also means many people: تاسو.', feedbackPs:'you د ډېرو کسانو لپاره هم دی: تاسو.' },
      { id:'gl.drill.pronouns-deeper-003', mode:'choose', topicRef:'gl.topic.subject-pronouns-deeper',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:subject-pronouns-deeper'], domainTags:['family'],
        promptEn:'my sister → ___', promptPs:'سم ضمیر وټاکه.',
        choices:['he','she','it'], answer:'she',
        feedbackEn:'Sister is a woman, so we say she.', feedbackPs:'خور ښځینه ده، نو she وايو.' }
    ]},
    'gl.session.t11-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.subject-pronouns-deeper',
      titleEn:'Mini Test: Pronouns Deeper', titlePs:'ازموینه: ضمیرونه ژور', items:[
      { id:'gl.test.pronouns-deeper-001', mode:'choose', topicRef:'gl.topic.subject-pronouns-deeper',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:you-singular-plural'], domainTags:['class'],
        promptEn:'You ___ late. (one person)', promptPs:'سم فعل وټاکه.',
        choices:['are','is'], answer:'are',
        feedbackEn:'One person or many, you takes are.', feedbackPs:'یو کس که ډېر — you له are سره.' },
      { id:'gl.test.pronouns-deeper-002', mode:'choose', topicRef:'gl.topic.subject-pronouns-deeper',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:subject-pronouns-deeper'], domainTags:['home'],
        promptEn:'the cats → ___', promptPs:'سم ضمیر وټاکه.',
        choices:['it','they','she'], answer:'they',
        feedbackEn:'Many cats: they.', feedbackPs:'ډېرې پیشوګانې: they.' }
    ]},

    /* ── T12 be Positive Review ── */
    'gl.session.t12-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.be-positive-review',
      titleEn:'Practice: Full be Table', titlePs:'تمرین: بشپړ جدول', items:[
      { id:'gl.drill.be-positive-001', mode:'fillBlank', topicRef:'gl.topic.be-positive-review',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-positive'], domainTags:['class'],
        promptEn:'You ___ ready.', promptPs:'تشه ډکه کړه.',
        acceptable:['are'],
        feedbackEn:'you → are: You are ready.', feedbackPs:'له you سره are راځي.' },
      { id:'gl.drill.be-positive-002', mode:'fillBlank', topicRef:'gl.topic.be-positive-review',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-positive'], domainTags:['school'],
        promptEn:'It ___ a book.', promptPs:'تشه ډکه کړه.',
        acceptable:['is'],
        feedbackEn:'it → is: It is a book.', feedbackPs:'له it سره is راځي.' },
      { id:'gl.drill.be-positive-003', mode:'repeat', topicRef:'gl.topic.be-positive-review',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-positive'], domainTags:['daily-life'],
        promptEn:'They are friends.', promptPs:'هغوی ملګري دي.',
        instructionEn:'Hear the sentence, then say it aloud clearly.',
        feedbackEn:'Good. they → are.', feedbackPs:'ښه. له they سره are.' }
    ]},
    'gl.session.t12-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.be-positive-review',
      titleEn:'Mini Test: Full be Table', titlePs:'ازموینه: بشپړ جدول', items:[
      { id:'gl.test.be-positive-001', mode:'choose', topicRef:'gl.topic.be-positive-review',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-positive'], domainTags:['family'],
        promptEn:'He ___ my brother.', promptPs:'سم فعل وټاکه.',
        choices:['am','is','are'], answer:'is',
        feedbackEn:'he → is: He is my brother.', feedbackPs:'له he سره is راځي.' },
      { id:'gl.test.be-positive-002', mode:'fillBlank', topicRef:'gl.topic.be-positive-review',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-positive'], domainTags:['class'],
        promptEn:'I ___ ready.', promptPs:'تشه ډکه کړه.',
        acceptable:['am'],
        feedbackEn:'I → am: I am ready.', feedbackPs:'له I سره تل am راځي.' }
    ]},

    /* ── T13 be Negative ── */
    'gl.session.t13-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.be-negative',
      titleEn:'Practice: be Negative', titlePs:'تمرین: منفي', items:[
      { id:'gl.drill.be-negative-001', mode:'transformation', topicRef:'gl.topic.be-negative',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-negative'], domainTags:['school'],
        promptEn:'Make it negative: I am a teacher.', promptPs:'منفي یې کړه.',
        acceptable:['i am not a teacher'], modelAnswer:'I am not a teacher.',
        feedbackEn:'Add not after am: I am not a teacher.', feedbackPs:'not د am وروسته راځي.' },
      { id:'gl.drill.be-negative-002', mode:'transformation', topicRef:'gl.topic.be-negative',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-negative'], domainTags:['school'],
        promptEn:'Make it negative: They are students.', promptPs:'منفي یې کړه.',
        acceptable:['they are not students'], modelAnswer:'They are not students.',
        feedbackEn:'Add not after are: They are not students.', feedbackPs:'not د are وروسته راځي.' },
      { id:'gl.drill.be-negative-003', mode:'choose', topicRef:'gl.topic.be-negative',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-negative'], domainTags:['class'],
        promptEn:'It ___ my pen.', promptPs:'منفي بڼه وټاکه.',
        choices:['is not','not is','are not'], answer:'is not',
        feedbackEn:'it → is not: It is not my pen.', feedbackPs:'له it سره is not راځي.' }
    ]},
    'gl.session.t13-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.be-negative',
      titleEn:'Mini Test: be Negative', titlePs:'ازموینه: منفي', items:[
      { id:'gl.test.be-negative-001', mode:'transformation', topicRef:'gl.topic.be-negative',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-negative'], domainTags:['class'],
        promptEn:'Make it negative: You are late.', promptPs:'منفي یې کړه.',
        acceptable:['you are not late'], modelAnswer:'You are not late.',
        feedbackEn:'Add not after are: You are not late.', feedbackPs:'not د are وروسته راځي.' },
      { id:'gl.test.be-negative-002', mode:'choose', topicRef:'gl.topic.be-negative',
        categoryId:'gl.cat.verbs-forms', levelNumber:2, weakTags:['weak:be-negative'], domainTags:['home'],
        promptEn:'She ___ at home.', promptPs:'منفي بڼه وټاکه.',
        choices:['are not','is not'], answer:'is not',
        feedbackEn:'she → is not: She is not at home.', feedbackPs:'له she سره is not راځي.' }
    ]},

    /* ── T14 be Questions ── */
    'gl.session.t14-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.be-questions',
      titleEn:'Practice: be Questions', titlePs:'تمرین: پوښتنې', items:[
      { id:'gl.drill.be-questions-001', mode:'transformation', topicRef:'gl.topic.be-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-question-order'], domainTags:['school'],
        promptEn:'Make a question: You are a student.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['are you a student'], modelAnswer:'Are you a student?',
        feedbackEn:'Move are to the front: Are you a student?', feedbackPs:'are سر ته یوسه.' },
      { id:'gl.drill.be-questions-002', mode:'transformation', topicRef:'gl.topic.be-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-question-order'], domainTags:['school'],
        promptEn:'Make a question: She is your teacher.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['is she your teacher'], modelAnswer:'Is she your teacher?',
        feedbackEn:'Move is to the front: Is she your teacher?', feedbackPs:'is سر ته یوسه.' },
      { id:'gl.drill.be-questions-003', mode:'choose', topicRef:'gl.topic.be-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-question-order'], domainTags:['class'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['Are we late?','We are late?','Late are we?'], answer:'Are we late?',
        feedbackEn:'Are comes first: Are we late?', feedbackPs:'Are لومړی راځي.' }
    ]},
    'gl.session.t14-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.be-questions',
      titleEn:'Mini Test: be Questions', titlePs:'ازموینه: پوښتنې', items:[
      { id:'gl.test.be-questions-001', mode:'transformation', topicRef:'gl.topic.be-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-question-order'], domainTags:['daily-life'],
        promptEn:'Make a question: They are friends.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['are they friends'], modelAnswer:'Are they friends?',
        feedbackEn:'Move are to the front: Are they friends?', feedbackPs:'are سر ته یوسه.' },
      { id:'gl.test.be-questions-002', mode:'choose', topicRef:'gl.topic.be-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-question-order'], domainTags:['school'],
        promptEn:'___ it your book?', promptPs:'سم فعل وټاکه.',
        choices:['Is','Are','Am'], answer:'Is',
        feedbackEn:'it → Is: Is it your book?', feedbackPs:'له it سره Is راځي.' }
    ]},

    /* ── T15 Short Answers ── */
    'gl.session.t15-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.be-short-answers',
      titleEn:'Practice: Short Answers', titlePs:'تمرین: لنډ ځوابونه', items:[
      { id:'gl.drill.short-answers-001', mode:'choose', topicRef:'gl.topic.be-short-answers',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-short-answer'], domainTags:['school'],
        promptEn:'Are you a student? — Yes, ___', promptPs:'سم لنډ ځواب وټاکه.',
        choices:['I am','you are','I is'], answer:'I am',
        feedbackEn:'The question is about you, so answer with I: Yes, I am.', feedbackPs:'پوښتنه ستا ده، نو له I سره ځواب ورکړه.' },
      { id:'gl.drill.short-answers-002', mode:'choose', topicRef:'gl.topic.be-short-answers',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-short-answer'], domainTags:['family'],
        promptEn:'Is he your brother? — No, ___', promptPs:'سم لنډ ځواب وټاکه.',
        choices:['he is not','he not','I am not'], answer:'he is not',
        feedbackEn:'No, he is not.', feedbackPs:'نه، هغه نه دی.' },
      { id:'gl.drill.short-answers-003', mode:'choose', topicRef:'gl.topic.be-short-answers',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-short-answer'], domainTags:['class'],
        promptEn:'Are they ready? — Yes, ___', promptPs:'سم لنډ ځواب وټاکه.',
        choices:['they are','they is','we are'], answer:'they are',
        feedbackEn:'Yes, they are.', feedbackPs:'هو، دي.' }
    ]},
    'gl.session.t15-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.be-short-answers',
      titleEn:'Mini Test: Short Answers', titlePs:'ازموینه: لنډ ځوابونه', items:[
      { id:'gl.test.short-answers-001', mode:'choose', topicRef:'gl.topic.be-short-answers',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-short-answer'], domainTags:['school'],
        promptEn:'Is it your book? — Yes, ___', promptPs:'سم لنډ ځواب وټاکه.',
        choices:['it is','I am','they are'], answer:'it is',
        feedbackEn:'Yes, it is.', feedbackPs:'هو، دی.' },
      { id:'gl.test.short-answers-002', mode:'choose', topicRef:'gl.topic.be-short-answers',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:be-short-answer'], domainTags:['class'],
        promptEn:'Are we late? — No, ___', promptPs:'سم لنډ ځواب وټاکه.',
        choices:['we are not','we not are','you is not'], answer:'we are not',
        feedbackEn:'No, we are not.', feedbackPs:'نه، نه یو.' }
    ]},

    /* ── T16 this / that / these / those ── */
    'gl.session.t16-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.this-that-these-those',
      titleEn:'Practice: this, that, these, those', titlePs:'تمرین: دا او هغه', items:[
      { id:'gl.drill.this-that-001', mode:'choose', topicRef:'gl.topic.this-that-these-those',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:this-that'], domainTags:['school'],
        promptEn:'One book near you: ___ is my book.', promptPs:'سمه کلمه وټاکه.',
        choices:['This','That','These'], answer:'This',
        feedbackEn:'Near and one: this.', feedbackPs:'نږدې او یو: this.' },
      { id:'gl.drill.this-that-002', mode:'choose', topicRef:'gl.topic.this-that-these-those',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:these-those'], domainTags:['market'],
        promptEn:'Many bags far away: ___ are your bags.', promptPs:'سمه کلمه وټاکه.',
        choices:['Those','These','That'], answer:'Those',
        feedbackEn:'Far and many: those.', feedbackPs:'لرې او ډېر: those.' },
      { id:'gl.drill.this-that-003', mode:'choose', topicRef:'gl.topic.this-that-these-those',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:these-those'], domainTags:['school'],
        promptEn:'Near and many: ___ are my books.', promptPs:'سمه کلمه وټاکه.',
        choices:['These','This','Those'], answer:'These',
        feedbackEn:'Near and many: these.', feedbackPs:'نږدې او ډېر: these.' }
    ]},
    'gl.session.t16-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.this-that-these-those',
      titleEn:'Mini Test: this, that, these, those', titlePs:'ازموینه: دا او هغه', items:[
      { id:'gl.test.this-that-001', mode:'choose', topicRef:'gl.topic.this-that-these-those',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:this-that'], domainTags:['class'],
        promptEn:'One pen far away: ___ is your pen.', promptPs:'سمه کلمه وټاکه.',
        choices:['That','This','Those'], answer:'That',
        feedbackEn:'Far and one: that.', feedbackPs:'لرې او یو: that.' },
      { id:'gl.test.this-that-002', mode:'choose', topicRef:'gl.topic.this-that-these-those',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:this-that'], domainTags:['school'],
        promptEn:'Near, one person: ___ is my teacher.', promptPs:'سمه کلمه وټاکه.',
        choices:['This','These'], answer:'This',
        feedbackEn:'Near and one: this.', feedbackPs:'نږدې او یو: this.' }
    ]},

    /* ── T17 Possessive Adjectives ── */
    'gl.session.t17-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.possessive-adjectives-basic',
      titleEn:'Practice: my, your, his, her', titlePs:'تمرین: ملکیتي صفتونه', items:[
      { id:'gl.drill.possessive-001', mode:'choose', topicRef:'gl.topic.possessive-adjectives-basic',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:possessive-adjectives'], domainTags:['market'],
        promptEn:'Ahmad → ___ bag', promptPs:'سمه کلمه وټاکه.',
        choices:['his','her','its'], answer:'his',
        feedbackEn:'Ahmad is a man: his bag.', feedbackPs:'احمد نارینه دی: his.' },
      { id:'gl.drill.possessive-002', mode:'choose', topicRef:'gl.topic.possessive-adjectives-basic',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:possessive-adjectives'], domainTags:['school'],
        promptEn:'I have a book. This is ___ book.', promptPs:'سمه کلمه وټاکه.',
        choices:['my','me','I'], answer:'my',
        feedbackEn:'Before a noun: my book.', feedbackPs:'د نوم مخکې my راځي.' },
      { id:'gl.drill.possessive-003', mode:'choose', topicRef:'gl.topic.possessive-adjectives-basic',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:possessive-adjectives'], domainTags:['class'],
        promptEn:'We love ___ class.', promptPs:'سمه کلمه وټاکه.',
        choices:['our','their','his'], answer:'our',
        feedbackEn:'we → our: our class.', feedbackPs:'له we سره our راځي.' }
    ]},
    'gl.session.t17-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.possessive-adjectives-basic',
      titleEn:'Mini Test: my, your, his, her', titlePs:'ازموینه: ملکیتي صفتونه', items:[
      { id:'gl.test.possessive-001', mode:'choose', topicRef:'gl.topic.possessive-adjectives-basic',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:possessive-adjectives'], domainTags:['home'],
        promptEn:'the cat → ___ color', promptPs:'سمه کلمه وټاکه.',
        choices:['its','his','her'], answer:'its',
        feedbackEn:'A cat is an animal or thing: its color.', feedbackPs:'له شي/ژوي سره its راځي.' },
      { id:'gl.test.possessive-002', mode:'choose', topicRef:'gl.topic.possessive-adjectives-basic',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:possessive-adjectives'], domainTags:['school'],
        promptEn:'They clean ___ school.', promptPs:'سمه کلمه وټاکه.',
        choices:['their','our','her'], answer:'their',
        feedbackEn:'they → their: their school.', feedbackPs:'له they سره their راځي.' }
    ]},

    /* ── T18 Adjectives with be ── */
    'gl.session.t18-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.adjectives-with-be-basic',
      titleEn:'Practice: Adjectives with be', titlePs:'تمرین: صفتونه له be سره', items:[
      { id:'gl.drill.adjective-be-001', mode:'choose', topicRef:'gl.topic.adjectives-with-be-basic',
        categoryId:'gl.cat.adjectives-adverbs', levelNumber:2, weakTags:['weak:adjective-with-be'], domainTags:['school'],
        promptEn:'She is ___.', promptPs:'سم صفت وټاکه.',
        choices:['kind','kinds'], answer:'kind',
        feedbackEn:'Adjectives never take -s: She is kind.', feedbackPs:'صفت هېڅکله s نه اخلي.' },
      { id:'gl.drill.adjective-be-002', mode:'fillBlank', topicRef:'gl.topic.adjectives-with-be-basic',
        categoryId:'gl.cat.adjectives-adverbs', levelNumber:2, weakTags:['weak:adjective-with-be'], domainTags:['daily-life'],
        promptEn:'We ___ busy.', promptPs:'تشه ډکه کړه.',
        acceptable:['are'],
        feedbackEn:'we → are: We are busy.', feedbackPs:'له we سره are راځي.' },
      { id:'gl.drill.adjective-be-003', mode:'choose', topicRef:'gl.topic.adjectives-with-be-basic',
        categoryId:'gl.cat.adjectives-adverbs', levelNumber:2, weakTags:['weak:adjective-with-be'], domainTags:['market'],
        promptEn:'The bag is ___.', promptPs:'سم صفت وټاکه.',
        choices:['new','news'], answer:'new',
        feedbackEn:'new is the adjective; news is a different word.', feedbackPs:'صفت new دی؛ news بله کلمه ده.' }
    ]},
    'gl.session.t18-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.adjectives-with-be-basic',
      titleEn:'Mini Test: Adjectives with be', titlePs:'ازموینه: صفتونه له be سره', items:[
      { id:'gl.test.adjective-be-001', mode:'choose', topicRef:'gl.topic.adjectives-with-be-basic',
        categoryId:'gl.cat.adjectives-adverbs', levelNumber:2, weakTags:['weak:adjective-with-be'], domainTags:['daily-life'],
        promptEn:'They are ___.', promptPs:'سم صفت وټاکه.',
        choices:['happys','happy'], answer:'happy',
        feedbackEn:'Adjectives never take plural -s.', feedbackPs:'صفت جمع s نه اخلي.' },
      { id:'gl.test.adjective-be-002', mode:'fillBlank', topicRef:'gl.topic.adjectives-with-be-basic',
        categoryId:'gl.cat.adjectives-adverbs', levelNumber:2, weakTags:['weak:adjective-with-be'], domainTags:['family'],
        promptEn:'He ___ tall.', promptPs:'تشه ډکه کړه.',
        acceptable:['is'],
        feedbackEn:'he → is: He is tall.', feedbackPs:'له he سره is راځي.' }
    ]},

    /* ── T19 Mixed Review ── */
    'gl.session.t19-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.foundation-mixed-be-review',
      titleEn:'Practice: Mixed Review', titlePs:'تمرین: ګډه بیاکتنه', items:[
      { id:'gl.drill.mixed-review-001', mode:'choose', topicRef:'gl.topic.foundation-mixed-be-review',
        categoryId:'gl.cat.foundation', levelNumber:3, weakTags:['weak:foundation-be-review'], domainTags:['class'],
        promptEn:'Choose the correct sentence.', promptPs:'سمه جمله وټاکه.',
        choices:['These are our books.','These is our books.','This are our books.'], answer:'These are our books.',
        feedbackEn:'these + are, with our before the noun.', feedbackPs:'these له are سره، او our د نوم مخکې.' },
      { id:'gl.drill.mixed-review-002', mode:'transformation', topicRef:'gl.topic.foundation-mixed-be-review',
        categoryId:'gl.cat.foundation', levelNumber:3, weakTags:['weak:foundation-be-review','weak:be-question-order'], domainTags:['market'],
        promptEn:'Make a question: That is his bag.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['is that his bag'], modelAnswer:'Is that his bag?',
        feedbackEn:'Move is to the front: Is that his bag?', feedbackPs:'is سر ته یوسه.' },
      { id:'gl.drill.mixed-review-003', mode:'correction', caseSensitive:true, topicRef:'gl.topic.foundation-mixed-be-review',
        categoryId:'gl.cat.foundation', levelNumber:3, weakTags:['weak:capital-full-stop-basic'], domainTags:['school'],
        wrongSentence:'she is my teacher',
        promptEn:'Correct this sentence (capital letter and full stop):', promptPs:'لوی توری او ټکی سم کړه.',
        acceptable:['She is my teacher'], modelAnswer:'She is my teacher.',
        feedbackEn:'Start with a capital letter and end with a full stop: She is my teacher.', feedbackPs:'په لوی توري پیل او په ټکي پای: She is my teacher.' }
    ]},
    'gl.session.t19-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.foundation-mixed-be-review',
      titleEn:'Mini Test: Mixed Review', titlePs:'ازموینه: ګډه بیاکتنه', items:[
      { id:'gl.test.mixed-review-001', mode:'choose', topicRef:'gl.topic.foundation-mixed-be-review',
        categoryId:'gl.cat.foundation', levelNumber:3, weakTags:['weak:be-short-answer','weak:foundation-be-review'], domainTags:['class'],
        promptEn:'Are they ready? — ___', promptPs:'سم لنډ ځواب وټاکه.',
        choices:['Yes, they are.','Yes, they is.','Yes, we am.'], answer:'Yes, they are.',
        feedbackEn:'they → are: Yes, they are.', feedbackPs:'له they سره are راځي.' },
      { id:'gl.test.mixed-review-002', mode:'choose', topicRef:'gl.topic.foundation-mixed-be-review',
        categoryId:'gl.cat.foundation', levelNumber:3, weakTags:['weak:foundation-be-review'], domainTags:['home'],
        promptEn:'___ is not tired.', promptPs:'سمه کلمه وټاکه.',
        choices:['She','These','Those'], answer:'She',
        feedbackEn:'One person with is: She is not tired.', feedbackPs:'یو کس له is سره: She.' }
    ]}
  });

  /* ==========================================================================
     REFERENCE ENTRIES (4 new — join the 11 from I6C/I6D)
     ========================================================================== */
  GL.registerReferenceEntries([
    { id:'gl.ref.be-negative', itemEn:'am / is / are + not', levelNumber:2,
      categoryId:'gl.cat.verbs-forms', meaningPs:'منفي: not د am/is/are وروسته راځي.',
      exampleEn:'He is not angry. We are not tired.',
      registerLabels:['spoken','written'], weakTags:['weak:be-negative'],
      relatedTopicRef:'gl.topic.be-negative' },
    { id:'gl.ref.be-short-answers', itemEn:'short answers with be', levelNumber:3,
      categoryId:'gl.cat.questions-negatives', meaningPs:'لنډ ځواب: Yes, I am. / No, he is not.',
      exampleEn:'Are you a student? — Yes, I am.',
      registerLabels:['spoken'], weakTags:['weak:be-short-answer'],
      relatedTopicRef:'gl.topic.be-short-answers' },
    { id:'gl.ref.this-that-these-those', itemEn:'this / that / these / those', levelNumber:2,
      categoryId:'gl.cat.pronouns-wh', meaningPs:'نږدې یو this؛ لرې یو that؛ نږدې ډېر these؛ لرې ډېر those.',
      exampleEn:'This is my book. Those are your bags.',
      registerLabels:['spoken','written'], weakTags:['weak:this-that','weak:these-those'],
      relatedTopicRef:'gl.topic.this-that-these-those' },
    { id:'gl.ref.possessive-adjectives', itemEn:'my / your / his / her / its / our / their', levelNumber:2,
      categoryId:'gl.cat.pronouns-wh', meaningPs:'ملکیتي صفتونه تل د نوم مخکې راځي: my book.',
      exampleEn:'her teacher, our class, their school',
      registerLabels:['spoken','written'], weakTags:['weak:possessive-adjectives'],
      relatedTopicRef:'gl.topic.possessive-adjectives-basic' }
  ]);
})();
