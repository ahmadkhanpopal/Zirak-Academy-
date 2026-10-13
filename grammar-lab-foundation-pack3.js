/* ============================================================================
   grammar-lab-foundation-pack3.js — PHASE I6F
   NOUN PHRASE, ARTICLES, PLURALS AND DETERMINERS PACK (L2–L4)
   ----------------------------------------------------------------------------
   CONTENT ONLY — exact I6D/I6E pack pattern. No renderers, no new TTS,
   no new guide system, no new weak store, no second Foundation Path.
   Registers 9 topics (path order 20–28), 18 sessions (27 wizard + 18 test
   items = 45 total), and 5 reference entries through the ONE engine:
     ZirakGrammarLab.registerTopics / registerSessions / registerReferenceEntries

   CONTINUES Pack 2: one additive link — the Pack 2 chain end
   (gl.topic.foundation-mixed-be-review, nextTopics:[]) now points to
   topic 20. Pack 1 and Pack 2 content are untouched.

   PASHTO: fresh professional support, once per item/section, owner-reviewable.
   No Urdu / Dari / Farsi / Persian anywhere.
   ============================================================================ */
(function () {
  'use strict';
  if (!window.ZirakGrammarLab) return;
  var GL = window.ZirakGrammarLab;

  /* ── Cross-pack chain link (additive; Pack 2 content untouched) ────────── */
  if (GL.topics['gl.topic.foundation-mixed-be-review'] &&
      (!GL.topics['gl.topic.foundation-mixed-be-review'].nextTopics ||
       !GL.topics['gl.topic.foundation-mixed-be-review'].nextTopics.length)) {
    GL.topics['gl.topic.foundation-mixed-be-review'].nextTopics = ['gl.topic.noun-phrase-basics'];
  }

  /* ==========================================================================
     TOPICS (9) — gl.path.foundation-1, pathOrder 20–28, L2–L4
     ========================================================================== */
  GL.registerTopics([

    { id:'gl.topic.noun-phrase-basics', pathId:'gl.path.foundation-1', pathOrder:20,
      categoryId:'gl.cat.nouns-articles', levelNumber:2, status:'active',
      titleEn:'Noun Phrase Basics', titlePs:'د نوم عبارت بنسټونه',
      shortGuideEn:'A noun phrase is a noun with useful words around it: a good book.',
      shortGuidePs:'د نوم عبارت یو نوم دی چې مفید کلمې پرې شاوخوا وي: یو ښه کتاب.',
      reasonEn:'Before Simple Present, students need strong noun phrases to fill the object position.',
      reasonPs:'د ساده اوسمهال مخکې زده کوونکو ته پیاوړي د نوم عبارتونو ته اړتیا ده.',
      prerequisites:['gl.topic.noun-basics','gl.topic.article-a-an','gl.topic.possessive-adjectives-basic'],
      nextTopics:['gl.topic.articles-review-a-an-the'],
      weakTags:['weak:noun-phrase-basics'],
      wizardSessionId:'gl.session.t20-wiz-001', testSessionId:'gl.session.t20-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'A noun phrase is a group of words built around a noun. You can make it bigger by adding articles, adjectives, or possessives in front of the noun.',
          ps:'د نوم عبارت د نوم شاوخوا جوړ شوي کلمو ډله ده. له مخکې ارتیکل، صفت یا د ملکیت کلمه ورزیاتولی شې.' },
        { type:'formula', titleEn:'Build a noun phrase', rows:[
          { en:'book', ps:'(یوازې نوم)' },
          { en:'a book', ps:'(ارتیکل + نوم)' },
          { en:'a good book', ps:'(ارتیکل + صفت + نوم)' },
          { en:'my book', ps:'(ملکیت + نوم)' },
          { en:'my good book', ps:'(ملکیت + صفت + نوم)' }
        ]},
        { type:'examples', items:[
          { en:'I have a book.', ps:'زما یو کتاب دی.', domain:'school' },
          { en:'She has a good book.', ps:'هغې یو ښه کتاب دی.', domain:'school' },
          { en:'This is my good English book.', ps:'دا زما ښه انګلیسي کتاب دی.', domain:'class' }
        ]},
        { type:'commonMistake', wrongEn:'I have book.', rightEn:'I have a book.',
          noteEn:'Singular countable nouns need an article: a book.',
          notePs:'یو شمیرل کیدونکی نوم ارتیکل ته اړتیا لري: a book.' }
      ]},

    { id:'gl.topic.articles-review-a-an-the', pathId:'gl.path.foundation-1', pathOrder:21,
      categoryId:'gl.cat.nouns-articles', levelNumber:2, status:'active',
      titleEn:'Articles Deeper: a, an and the', titlePs:'ارتیکلونه ژور: a، an او the',
      shortGuideEn:'a/an for one unknown thing. the for a known or specific thing.',
      shortGuidePs:'a/an د یو نامعلوم شي لپاره. the د پېژندل شوي شي لپاره.',
      reasonEn:'Articles are used in nearly every English sentence; deeper practice before Simple Present is essential.',
      reasonPs:'ارتیکلونه نږدې هره انګلیسي جمله کې کارول کیږي.',
      prerequisites:['gl.topic.noun-phrase-basics'],
      nextTopics:['gl.topic.countable-uncountable-basic'],
      weakTags:['weak:article-review-a-an-the'],
      wizardSessionId:'gl.session.t21-wiz-001', testSessionId:'gl.session.t21-test-001',
      referenceEntries:['gl.ref.articles-a-an-the'],
      lessonBlocks:[
        { type:'formula', titleEn:'Three rules', rows:[
          { en:'a + consonant sound', ps:'a + بېغږه غږ: a book, a teacher' },
          { en:'an + vowel sound', ps:'an + غږلرونکی غږ: an apple, an hour' },
          { en:'the + known/specific', ps:'the + پېژندل شوی: the teacher in our class' }
        ]},
        { type:'explanation',
          en:'Use a or an the first time you mention something. Use the when you and your listener both know which one you mean.',
          ps:'لومړی ځل a یا an وکاروه. کله چې دواړه پوهیږئ کوم شی دی، the وکاروه.' },
        { type:'examples', items:[
          { en:'I saw a cat. The cat was black.', ps:'ما یوه پیشو ولیده. هغه پیشو تور وه.', domain:'home' },
          { en:'She is a teacher. The teacher is kind.', ps:'هغه ښوونکې ده. هغه ښوونکې مهربانه ده.', domain:'school' },
          { en:'the sun, the moon', ps:'لمر، سپوږمۍ (یوازې یو شته)', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'I saw the cat. (first mention)', rightEn:'I saw a cat.',
          noteEn:'First mention: a cat. Second mention or already known: the cat.',
          notePs:'لومړی ذکر: a cat. دویم ذکر یا پېژندل شوی: the cat.' }
      ]},

    { id:'gl.topic.countable-uncountable-basic', pathId:'gl.path.foundation-1', pathOrder:22,
      categoryId:'gl.cat.nouns-articles', levelNumber:3, status:'active',
      titleEn:'Countable and Uncountable Nouns', titlePs:'شمیرل کیدونکي او نه شمیرل کیدونکي نومونه',
      shortGuideEn:'Countable nouns can be counted one by one. Uncountable nouns are not counted in pieces.',
      shortGuidePs:'شمیرل کیدونکي نومونه یو یو شمیرل کیدای شي. نه شمیرل کیدونکي نومونه عموماً دانه دانه نه شمیرل کیږي.',
      reasonEn:'This unlocks many/much, some/any, and correct article use in Simple Present.',
      reasonPs:'دا many/much، some/any او سم ارتیکل کارونه خلاصوي.',
      prerequisites:['gl.topic.articles-review-a-an-the'],
      nextTopics:['gl.topic.regular-plurals-deeper'],
      weakTags:['weak:countable-noun','weak:uncountable-noun'],
      wizardSessionId:'gl.session.t22-wiz-001', testSessionId:'gl.session.t22-test-001',
      referenceEntries:['gl.ref.countable-uncountable'],
      lessonBlocks:[
        { type:'explanation',
          en:'Countable nouns have a singular and a plural: one book, two books. Uncountable nouns have no simple plural: water, milk, rice, sugar, homework, information.',
          ps:'شمیرل کیدونکي نومونه یو او جمع لري: یو کتاب، دوه کتابونه. نه شمیرل کیدونکي نومونه ساده جمع نه لري.' },
        { type:'examples', titleEn:'Countable vs uncountable', items:[
          { en:'one book / two books ✓', ps:'شمیرل کیدونکی', domain:'school' },
          { en:'one pen / two pens ✓', ps:'شمیرل کیدونکی', domain:'class' },
          { en:'water — not: one water / two waters', ps:'نه شمیرل کیدونکی', domain:'home' },
          { en:'rice — not: one rice / two rices', ps:'نه شمیرل کیدونکی', domain:'home' },
          { en:'information — not: one information', ps:'نه شمیرل کیدونکی', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'two informations', rightEn:'some information',
          noteEn:'information is uncountable — no plural -s.',
          notePs:'information نه شمیرل کیدونکی دی — جمع s نه اخلي.' }
      ]},

    { id:'gl.topic.regular-plurals-deeper', pathId:'gl.path.foundation-1', pathOrder:23,
      categoryId:'gl.cat.nouns-articles', levelNumber:2, status:'active',
      titleEn:'Regular Plurals — Deeper', titlePs:'منظم جمع — ژور',
      shortGuideEn:'More plural practice: -s, -es, and knowing which one to add.',
      shortGuidePs:'د جمع نور تمرین: کله s او کله es.',
      reasonEn:'Solid plural skills prepare students for subject-verb agreement in Simple Present.',
      reasonPs:'ټینګ د جمع مهارتونه زده کوونکي د ساده اوسمهال لپاره چمتو کوي.',
      prerequisites:['gl.topic.plural-s-es','gl.topic.countable-uncountable-basic'],
      nextTopics:['gl.topic.irregular-plurals-tiny-intro'],
      weakTags:['weak:plural-regular-deeper'],
      wizardSessionId:'gl.session.t23-wiz-001', testSessionId:'gl.session.t23-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'When to add -es', rows:[
          { en:'ends in s, ss, sh, ch, x → add -es', ps:'bus→buses, class→classes, watch→watches, dish→dishes, box→boxes' },
          { en:'most others → add -s', ps:'book→books, pen→pens, chair→chairs' }
        ]},
        { type:'examples', items:[
          { en:'book → books', ps:'یو کتاب ← دوه کتابونه', domain:'school' },
          { en:'chair → chairs', ps:'یوه چوکۍ ← دوه چوکۍ', domain:'class' },
          { en:'watch → watches', ps:'یوه ساعت ← دوه ساعتونه', domain:'daily life' },
          { en:'dish → dishes', ps:'یوه طشت ← دوه طشتونه', domain:'home' },
          { en:'bus → buses', ps:'یوه بس ← دوه بسونه', domain:'daily life' }
        ]},
        { type:'note',
          en:'Spelling changes like baby → babies and irregular plurals like man → men come in a later lesson.',
          ps:'د املا بدلونونه لکه baby→babies او بې قاعدې جمعونه وروسته راځي.' },
        { type:'commonMistake', wrongEn:'two watchs', rightEn:'two watches',
          noteEn:'watch ends in ch, so it takes -es: watches.',
          notePs:'watch پر ch پای ته رسیږي، نو es اخلي.' }
      ]},

    { id:'gl.topic.irregular-plurals-tiny-intro', pathId:'gl.path.foundation-1', pathOrder:24,
      categoryId:'gl.cat.nouns-articles', levelNumber:3, status:'active',
      titleEn:'Irregular Plurals — Short Intro', titlePs:'بې قاعدې جمعونه — لنډ پیل',
      shortGuideEn:'Five important ones: man/men, woman/women, child/children, person/people, foot/feet.',
      shortGuidePs:'پنځه مهم: man/men, woman/women, child/children, person/people, foot/feet.',
      reasonEn:'These five words appear constantly in everyday English.',
      reasonPs:'دا پنځه کلمې هر ورځ د انګلیسي ژبې کې ډیرې کارول کیږي.',
      prerequisites:['gl.topic.regular-plurals-deeper'],
      nextTopics:['gl.topic.some-any-basic'],
      weakTags:['weak:plural-irregular-basic'],
      wizardSessionId:'gl.session.t24-wiz-001', testSessionId:'gl.session.t24-test-001',
      referenceEntries:['gl.ref.irregular-plurals-basic'],
      lessonBlocks:[
        { type:'formula', titleEn:'Five irregular plurals to know now', rows:[
          { en:'man → men', ps:'سړی ← سړي' },
          { en:'woman → women', ps:'ښځه ← ښځې' },
          { en:'child → children', ps:'ماشوم ← ماشومان' },
          { en:'person → people', ps:'کس ← خلک' },
          { en:'foot → feet', ps:'پښه ← پښې' }
        ]},
        { type:'note',
          en:'These do not follow the -s or -es rule. Learn them as special words.',
          ps:'دا د s یا es قاعده نه تعقیبوي. لکه ځانګړې کلمې یادوه.' },
        { type:'examples', items:[
          { en:'Two men are in the room.', ps:'دوه سړي د خونې کې دي.', domain:'daily life' },
          { en:'The children are at school.', ps:'ماشومان ښوونځي ته تللي.', domain:'school' },
          { en:'Many people are at the market.', ps:'ډیر خلک بازار ته تللي.', domain:'market' }
        ]},
        { type:'commonMistake', wrongEn:'many childs', rightEn:'many children',
          noteEn:'child does not take -s. The plural is children.',
          notePs:'child جمع s نه اخلي. جمع یې children دی.' }
      ]},

    { id:'gl.topic.some-any-basic', pathId:'gl.path.foundation-1', pathOrder:25,
      categoryId:'gl.cat.nouns-articles', levelNumber:3, status:'active',
      titleEn:'some and any — Beginner', titlePs:'some او any — لومړنی',
      shortGuideEn:'some in positive sentences; any in questions and negatives.',
      shortGuidePs:'some د مثبت جملو لپاره؛ any د پوښتنو او منفي جملو لپاره.',
      reasonEn:'some and any are needed for offering, asking, and negating with both countable and uncountable nouns.',
      reasonPs:'some او any د وړاندیز، پوښتنې او منفي لپاره اړین دي.',
      prerequisites:['gl.topic.countable-uncountable-basic','gl.topic.be-negative'],
      nextTopics:['gl.topic.many-much-basic'],
      weakTags:['weak:some-any-basic'],
      wizardSessionId:'gl.session.t25-wiz-001', testSessionId:'gl.session.t25-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'some → positive sentences', ps:'مثبت جملې' },
          { en:'any → questions + negatives', ps:'پوښتنې + منفي' },
          { en:'with countable AND uncountable', ps:'د شمیرل کیدونکي او نه شمیرل کیدونکي دواړو سره' }
        ]},
        { type:'examples', items:[
          { en:'I have some books.', ps:'زما ځینې کتابونه دي.', domain:'school' },
          { en:'I have some water.', ps:'زما ځینې اوبه دي.', domain:'home' },
          { en:'Do you have any books?', ps:'ایا ستا کوم کتابونه دي؟', domain:'school' },
          { en:'Do you have any water?', ps:'ایا ستا کومې اوبه دي؟', domain:'home' },
          { en:'I do not have any books.', ps:'زما هیڅ کتابونه نه دي.', domain:'school' }
        ]},
        { type:'commonMistake', wrongEn:'I have any books.', rightEn:'I have some books.',
          noteEn:'Use some in a positive sentence, not any.',
          notePs:'مثبت جملو کې some راځي، نه any.' }
      ]},

    { id:'gl.topic.many-much-basic', pathId:'gl.path.foundation-1', pathOrder:26,
      categoryId:'gl.cat.nouns-articles', levelNumber:3, status:'active',
      titleEn:'many and much — Beginner', titlePs:'many او much — لومړنی',
      shortGuideEn:'many with countable plurals; much with uncountable nouns.',
      shortGuidePs:'many د شمیرل کیدونکي جمع سره؛ much د نه شمیرل کیدونکي سره.',
      reasonEn:'Confusing many/much is one of the most common Pashto-speaker errors in writing.',
      reasonPs:'د many/much ګډوډي د لیکنه کې د پښتو ویونکو تر ټولو عامه تېروتنه ده.',
      prerequisites:['gl.topic.countable-uncountable-basic'],
      nextTopics:['gl.topic.possessive-s-basic'],
      weakTags:['weak:many-much-basic','weak:determiner-choice-basic'],
      wizardSessionId:'gl.session.t26-wiz-001', testSessionId:'gl.session.t26-test-001',
      referenceEntries:['gl.ref.many-much'],
      lessonBlocks:[
        { type:'formula', titleEn:'Rule', rows:[
          { en:'many + countable plural noun', ps:'many + شمیرل کیدونکی جمع نوم' },
          { en:'much + uncountable noun', ps:'much + نه شمیرل کیدونکی نوم' },
          { en:'many books, many students', ps:'ډیر کتابونه، ډیر زده کوونکي' },
          { en:'much water, much rice', ps:'ډیرې اوبه، ډیر وریژې' }
        ]},
        { type:'examples', items:[
          { en:'many books', ps:'ډیر کتابونه', domain:'school' },
          { en:'many students', ps:'ډیر زده کوونکي', domain:'class' },
          { en:'much water', ps:'ډیرې اوبه', domain:'home' },
          { en:'much rice', ps:'ډیر وریژې', domain:'home' }
        ]},
        { type:'commonMistake', wrongEn:'much books', rightEn:'many books',
          noteEn:'books is countable — use many, not much.',
          notePs:'books شمیرل کیدونکی دی — many کاروو، نه much.' }
      ]},

    { id:'gl.topic.possessive-s-basic', pathId:'gl.path.foundation-1', pathOrder:27,
      categoryId:'gl.cat.nouns-articles', levelNumber:2, status:'active',
      titleEn:'Possessive \'s', titlePs:'د ملکیت s\'',
      shortGuideEn:'Ahmad\'s book, the teacher\'s pen — add \'s to a noun to show ownership.',
      shortGuidePs:'د احمد کتاب، د ښوونکي قلم — د ملکیت لپاره نوم ته \'s ورزیاتوو.',
      reasonEn:'\'s is the natural English possession marker and appears in every real conversation.',
      reasonPs:'\'s د انګلیسي طبیعي د ملکیت نښه ده او هر ریښتیني خبرو کې کارول کیږي.',
      prerequisites:['gl.topic.noun-phrase-basics'],
      nextTopics:['gl.topic.noun-phrase-building-checkpoint'],
      weakTags:['weak:possessive-s-basic'],
      wizardSessionId:'gl.session.t27-wiz-001', testSessionId:'gl.session.t27-test-001',
      referenceEntries:['gl.ref.possessive-s'],
      lessonBlocks:[
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'person/noun + \'s + noun owned', ps:'کس/نوم + \'s + ملکیت لرونکی نوم' },
          { en:'Ahmad\'s book', ps:'د احمد کتاب' },
          { en:'the teacher\'s pen', ps:'د ښوونکي قلم' }
        ]},
        { type:'examples', items:[
          { en:'Ahmad\'s book is on the table.', ps:'د احمد کتاب پر مېز دی.', domain:'school' },
          { en:'my brother\'s bag is blue.', ps:'د زما ورور بکس شین دی.', domain:'family' },
          { en:'Sara\'s school is big.', ps:'د سارا ښوونځی لوی دی.', domain:'school' },
          { en:'the student\'s notebook is new.', ps:'د زده کوونکي نوټ بوک نوی دی.', domain:'class' }
        ]},
        { type:'note',
          en:'Complex plural possessives like the students\' books come in a later lesson.',
          ps:'پیچلي جمع ملکیت لکه the students\' books وروسته راځي.' },
        { type:'commonMistake', wrongEn:'Ahmads book', rightEn:'Ahmad\'s book',
          noteEn:'Always add apostrophe + s: Ahmad\'s.',
          notePs:'تل apostrophe + s: Ahmad\'s.' }
      ]},

    { id:'gl.topic.noun-phrase-building-checkpoint', pathId:'gl.path.foundation-1', pathOrder:28,
      categoryId:'gl.cat.nouns-articles', levelNumber:4, status:'active',
      titleEn:'Noun Phrase Building Checkpoint', titlePs:'د نوم عبارت د جوړولو چیک پوسته',
      shortGuideEn:'Put it all together: build noun phrases from a single word to a full phrase.',
      shortGuidePs:'هرڅه یوځای کړه: یو کلمه نه تر بشپړ عبارت پورې.',
      reasonEn:'This checkpoint seals everything before Simple Present in I6G.',
      reasonPs:'دا چیک پوسته د I6G ساده اوسمهال مخکې هرڅه ټینګوي.',
      prerequisites:['gl.topic.articles-review-a-an-the','gl.topic.many-much-basic',
                     'gl.topic.possessive-s-basic','gl.topic.some-any-basic',
                     'gl.topic.irregular-plurals-tiny-intro'],
      nextTopics:[],
      weakTags:['weak:noun-phrase-building','weak:determiner-choice-basic'],
      wizardSessionId:'gl.session.t28-wiz-001', testSessionId:'gl.session.t28-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'A noun phrase can grow step by step. Each layer adds more meaning.',
          ps:'د نوم عبارت ګام پر ګام لوی کیدای شي. هره طبقه نوره مانا ورزیاتوي.' },
        { type:'formula', titleEn:'Building up a noun phrase', rows:[
          { en:'book', ps:'(یوازې نوم)' },
          { en:'a book', ps:'(ارتیکل + نوم)' },
          { en:'a good book', ps:'(ارتیکل + صفت + نوم)' },
          { en:'my good book', ps:'(ملکیت + صفت + نوم)' },
          { en:'my good English book', ps:'(ملکیت + صفت + صفت + نوم)' },
          { en:'my good English book in class', ps:'(بشپړ عبارت)' }
        ]},
        { type:'examples', items:[
          { en:'I need a pen.', ps:'ما یو قلم ته اړتیا ده.', domain:'school' },
          { en:'She has many new books.', ps:'هغې ډیر نوي کتابونه دي.', domain:'school' },
          { en:'Ahmad\'s old bag is in class.', ps:'د احمد زوړ بکس ټولګي کې دی.', domain:'class' },
          { en:'Do you have any water?', ps:'ایا ستا کومې اوبه دي؟', domain:'home' },
          { en:'The children\'s school is new.', ps:'د ماشومانو ښوونځی نوی دی.', domain:'school' }
        ]},
        { type:'commonMistake', wrongEn:'much books', rightEn:'many books',
          noteEn:'books is countable — many, not much.',
          notePs:'books شمیرل کیدونکی دی — many، نه much.' }
      ]}
  ]);

  /* ==========================================================================
     SESSIONS — per-topic wizard (3 items) + mini test (2 items) = 45 total
     ========================================================================== */
  GL.registerSessions({

    /* ── T20 Noun Phrase Basics ── */
    'gl.session.t20-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.noun-phrase-basics',
      titleEn:'Practice: Noun Phrase Basics', titlePs:'تمرین: د نوم عبارت بنسټونه', items:[
      { id:'gl.drill.np-basics-001', mode:'choose', topicRef:'gl.topic.noun-phrase-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:noun-phrase-basics'], domainTags:['school'],
        promptEn:'Choose the correct noun phrase.', promptPs:'سم د نوم عبارت وټاکه.',
        choices:['a good book','good a book','book good a'], answer:'a good book',
        feedbackEn:'Order: article + adjective + noun: a good book.', feedbackPs:'ترتیب: ارتیکل + صفت + نوم.' },
      { id:'gl.drill.np-basics-002', mode:'choose', topicRef:'gl.topic.noun-phrase-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:noun-phrase-basics'], domainTags:['class'],
        promptEn:'I have ___ book. (singular, unknown)', promptPs:'سم عبارت وټاکه.',
        choices:['a','the','some'], answer:'a',
        feedbackEn:'First mention, singular: a book.', feedbackPs:'لومړی ذکر، یو: a book.' },
      { id:'gl.drill.np-basics-003', mode:'repeat', topicRef:'gl.topic.noun-phrase-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:noun-phrase-basics'], domainTags:['class'],
        promptEn:'This is my good English book.', promptPs:'دا زما ښه انګلیسي کتاب دی.',
        instructionEn:'Hear the noun phrase, then say it aloud clearly.',
        feedbackEn:'Good. my + good + English + book.', feedbackPs:'ښه: ملکیت + صفت + صفت + نوم.' }
    ]},
    'gl.session.t20-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.noun-phrase-basics',
      titleEn:'Mini Test: Noun Phrase Basics', titlePs:'ازموینه: د نوم عبارت بنسټونه', items:[
      { id:'gl.test.np-basics-001', mode:'choose', topicRef:'gl.topic.noun-phrase-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:noun-phrase-basics'], domainTags:['school'],
        promptEn:'Choose the correct noun phrase.', promptPs:'سم د نوم عبارت وټاکه.',
        choices:['my good teacher','good my teacher','teacher my good'], answer:'my good teacher',
        feedbackEn:'Order: possessive + adjective + noun: my good teacher.', feedbackPs:'ترتیب: ملکیت + صفت + نوم.' },
      { id:'gl.test.np-basics-002', mode:'choose', topicRef:'gl.topic.noun-phrase-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:noun-phrase-basics'], domainTags:['home'],
        promptEn:'She has ___ small cat. (singular, unknown)', promptPs:'سم ارتیکل وټاکه.',
        choices:['a','the','many'], answer:'a',
        feedbackEn:'Singular unknown: a small cat.', feedbackPs:'یو نامعلوم: a.' }
    ]},

    /* ── T21 Articles Review a/an/the ── */
    'gl.session.t21-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.articles-review-a-an-the',
      titleEn:'Practice: a, an and the', titlePs:'تمرین: a، an او the', items:[
      { id:'gl.drill.articles-review-001', mode:'choose', topicRef:'gl.topic.articles-review-a-an-the',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-review-a-an-the'], domainTags:['school'],
        promptEn:'She is ___ teacher. (first mention)', promptPs:'سم ارتیکل وټاکه.',
        choices:['a','an','the'], answer:'a',
        feedbackEn:'First mention, consonant sound: a teacher.', feedbackPs:'لومړی ذکر، بېغږه غږ: a teacher.' },
      { id:'gl.drill.articles-review-002', mode:'fillBlank', topicRef:'gl.topic.articles-review-a-an-the',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-review-a-an-the'], domainTags:['home'],
        promptEn:'I saw a cat. ___ cat was black.',
        promptPs:'دویم ذکر: تشه ډکه کړه.',
        acceptable:['The','the'],
        feedbackEn:'Second mention — we know which cat: The cat.', feedbackPs:'دویم ذکر — پوهیږو کومه پیشو: The cat.' },
      { id:'gl.drill.articles-review-003', mode:'choose', topicRef:'gl.topic.articles-review-a-an-the',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-review-a-an-the'], domainTags:['daily-life'],
        promptEn:'___ sun rises in the east. (only one)', promptPs:'سم ارتیکل وټاکه.',
        choices:['The','A','An'], answer:'The',
        feedbackEn:'There is only one sun, so we say the sun.', feedbackPs:'یوازې یو لمر شته: the sun.' }
    ]},
    'gl.session.t21-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.articles-review-a-an-the',
      titleEn:'Mini Test: a, an and the', titlePs:'ازموینه: a، an او the', items:[
      { id:'gl.test.articles-review-001', mode:'choose', topicRef:'gl.topic.articles-review-a-an-the',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-review-a-an-the'], domainTags:['school'],
        promptEn:'He has ___ old bag. (first mention)', promptPs:'سم ارتیکل وټاکه.',
        choices:['an','a','the'], answer:'an',
        feedbackEn:'old starts with a vowel sound: an old bag.', feedbackPs:'old له غږلرونکي غږ سره پیلیږي: an old bag.' },
      { id:'gl.test.articles-review-002', mode:'fillBlank', topicRef:'gl.topic.articles-review-a-an-the',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-review-a-an-the'], domainTags:['class'],
        promptEn:'Open ___ book on the table. (specific, known)',
        promptPs:'تشه ډکه کړه.',
        acceptable:['the'],
        feedbackEn:'We know which book: the book.', feedbackPs:'پوهیږو کوم کتاب: the.' }
    ]},

    /* ── T22 Countable / Uncountable ── */
    'gl.session.t22-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.countable-uncountable-basic',
      titleEn:'Practice: Countable and Uncountable', titlePs:'تمرین: شمیرل کیدونکي او نه شمیرل کیدونکي', items:[
      { id:'gl.drill.count-uncount-001', mode:'choose', topicRef:'gl.topic.countable-uncountable-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:countable-noun'], domainTags:['school'],
        promptEn:'book — countable or uncountable?', promptPs:'کوم دی؟',
        choices:['countable','uncountable'], answer:'countable',
        feedbackEn:'book: one book, two books. It is countable.', feedbackPs:'book شمیرل کیدونکی دی.' },
      { id:'gl.drill.count-uncount-002', mode:'choose', topicRef:'gl.topic.countable-uncountable-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:uncountable-noun'], domainTags:['home'],
        promptEn:'water — countable or uncountable?', promptPs:'کوم دی؟',
        choices:['countable','uncountable'], answer:'uncountable',
        feedbackEn:'water has no simple plural: uncountable.', feedbackPs:'اوبه ساده جمع نه لري: نه شمیرل کیدونکی.' },
      { id:'gl.drill.count-uncount-003', mode:'choose', topicRef:'gl.topic.countable-uncountable-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:uncountable-noun'], domainTags:['school'],
        promptEn:'Choose the correct form.', promptPs:'سمه بڼه وټاکه.',
        choices:['two informations','some information'], answer:'some information',
        feedbackEn:'information is uncountable — no plural, use some.', feedbackPs:'information نه شمیرل کیدونکی دی.' }
    ]},
    'gl.session.t22-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.countable-uncountable-basic',
      titleEn:'Mini Test: Countable and Uncountable', titlePs:'ازموینه: شمیرل کیدونکي او نه شمیرل کیدونکي', items:[
      { id:'gl.test.count-uncount-001', mode:'choose', topicRef:'gl.topic.countable-uncountable-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:countable-noun'], domainTags:['daily-life'],
        promptEn:'milk — countable or uncountable?', promptPs:'کوم دی؟',
        choices:['countable','uncountable'], answer:'uncountable',
        feedbackEn:'milk has no simple plural: uncountable.', feedbackPs:'شودې ساده جمع نه لري.' },
      { id:'gl.test.count-uncount-002', mode:'choose', topicRef:'gl.topic.countable-uncountable-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:countable-noun'], domainTags:['class'],
        promptEn:'Choose the correct form.', promptPs:'سمه بڼه وټاکه.',
        choices:['two chairs','two chair'], answer:'two chairs',
        feedbackEn:'chair is countable: two chairs.', feedbackPs:'chair شمیرل کیدونکی دی: two chairs.' }
    ]},

    /* ── T23 Regular Plurals Deeper ── */
    'gl.session.t23-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.regular-plurals-deeper',
      titleEn:'Practice: Regular Plurals', titlePs:'تمرین: منظم جمع', items:[
      { id:'gl.drill.reg-plural-101', mode:'fillBlank', topicRef:'gl.topic.regular-plurals-deeper',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-regular-deeper'], domainTags:['home'],
        promptEn:'one dish, two ___', promptPs:'جمع یې ولیکه.',
        acceptable:['dishes'],
        feedbackEn:'dish ends in sh, so it takes -es: dishes.', feedbackPs:'dish پر sh پای ته رسیږي: dishes.' },
      { id:'gl.drill.reg-plural-102', mode:'fillBlank', topicRef:'gl.topic.regular-plurals-deeper',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-regular-deeper'], domainTags:['class'],
        promptEn:'one chair, two ___', promptPs:'جمع یې ولیکه.',
        acceptable:['chairs'],
        feedbackEn:'chair ends in r — add -s: chairs.', feedbackPs:'chair پر r پای ته رسیږي: chairs.' },
      { id:'gl.drill.reg-plural-103', mode:'choose', topicRef:'gl.topic.regular-plurals-deeper',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-regular-deeper'], domainTags:['daily-life'],
        promptEn:'watch → ?', promptPs:'سمه جمع وټاکه.',
        choices:['watchs','watches','waches'], answer:'watches',
        feedbackEn:'watch ends in ch, so -es: watches.', feedbackPs:'watch پر ch پای ته رسیږي: watches.' }
    ]},
    'gl.session.t23-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.regular-plurals-deeper',
      titleEn:'Mini Test: Regular Plurals', titlePs:'ازموینه: منظم جمع', items:[
      { id:'gl.test.reg-plural-101', mode:'fillBlank', topicRef:'gl.topic.regular-plurals-deeper',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-regular-deeper'], domainTags:['market'],
        promptEn:'one bus, two ___', promptPs:'جمع یې ولیکه.',
        acceptable:['buses'],
        feedbackEn:'bus ends in s: buses.', feedbackPs:'bus پر s پای ته رسیږي: buses.' },
      { id:'gl.test.reg-plural-102', mode:'correction', topicRef:'gl.topic.regular-plurals-deeper',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-regular-deeper'], domainTags:['home'],
        wrongSentence:'She washes two dishs.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['she washes two dishes'], modelAnswer:'She washes two dishes.',
        feedbackEn:'dish + es: dishes.', feedbackPs:'dish + es: dishes.' }
    ]},

    /* ── T24 Irregular Plurals Tiny Intro ── */
    'gl.session.t24-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.irregular-plurals-tiny-intro',
      titleEn:'Practice: Irregular Plurals', titlePs:'تمرین: بې قاعدې جمعونه', items:[
      { id:'gl.drill.irr-plural-001', mode:'choose', topicRef:'gl.topic.irregular-plurals-tiny-intro',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:plural-irregular-basic'], domainTags:['school'],
        promptEn:'child → ?', promptPs:'سمه جمع وټاکه.',
        choices:['childs','childen','children'], answer:'children',
        feedbackEn:'child is irregular: children.', feedbackPs:'child بې قاعده ده: children.' },
      { id:'gl.drill.irr-plural-002', mode:'choose', topicRef:'gl.topic.irregular-plurals-tiny-intro',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:plural-irregular-basic'], domainTags:['daily-life'],
        promptEn:'person → ?', promptPs:'سمه جمع وټاکه.',
        choices:['persons','peoples','people'], answer:'people',
        feedbackEn:'person → people (irregular).', feedbackPs:'person → people (بې قاعده).' },
      { id:'gl.drill.irr-plural-003', mode:'choose', topicRef:'gl.topic.irregular-plurals-tiny-intro',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:plural-irregular-basic'], domainTags:['market'],
        promptEn:'Many ___ are at the market.', promptPs:'سمه کلمه وټاکه.',
        choices:['mans','men','manes'], answer:'men',
        feedbackEn:'man → men (irregular).', feedbackPs:'man → men (بې قاعده).' }
    ]},
    'gl.session.t24-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.irregular-plurals-tiny-intro',
      titleEn:'Mini Test: Irregular Plurals', titlePs:'ازموینه: بې قاعدې جمعونه', items:[
      { id:'gl.test.irr-plural-001', mode:'choose', topicRef:'gl.topic.irregular-plurals-tiny-intro',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:plural-irregular-basic'], domainTags:['family'],
        promptEn:'two ___ (woman)', promptPs:'سمه جمع وټاکه.',
        choices:['womans','women','woman'], answer:'women',
        feedbackEn:'woman → women (irregular).', feedbackPs:'woman → women (بې قاعده).' },
      { id:'gl.test.irr-plural-002', mode:'choose', topicRef:'gl.topic.irregular-plurals-tiny-intro',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:plural-irregular-basic'], domainTags:['school'],
        promptEn:'The ___ are at school. (child, many)', promptPs:'سمه کلمه وټاکه.',
        choices:['childs','childrens','children'], answer:'children',
        feedbackEn:'child → children (irregular, no -s).', feedbackPs:'child → children (بې قاعده).' }
    ]},

    /* ── T25 some / any ── */
    'gl.session.t25-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.some-any-basic',
      titleEn:'Practice: some and any', titlePs:'تمرین: some او any', items:[
      { id:'gl.drill.some-any-001', mode:'choose', topicRef:'gl.topic.some-any-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:some-any-basic'], domainTags:['home'],
        promptEn:'I have ___ water. (positive)', promptPs:'سمه کلمه وټاکه.',
        choices:['some','any'], answer:'some',
        feedbackEn:'Positive sentence: some.', feedbackPs:'مثبت جمله: some.' },
      { id:'gl.drill.some-any-002', mode:'choose', topicRef:'gl.topic.some-any-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:some-any-basic'], domainTags:['school'],
        promptEn:'Do you have ___ books? (question)', promptPs:'سمه کلمه وټاکه.',
        choices:['any','some'], answer:'any',
        feedbackEn:'Question: any.', feedbackPs:'پوښتنه: any.' },
      { id:'gl.drill.some-any-003', mode:'choose', topicRef:'gl.topic.some-any-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:some-any-basic'], domainTags:['home'],
        promptEn:'I do not have ___ water. (negative)', promptPs:'سمه کلمه وټاکه.',
        choices:['any','some'], answer:'any',
        feedbackEn:'Negative: any.', feedbackPs:'منفي: any.' }
    ]},
    'gl.session.t25-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.some-any-basic',
      titleEn:'Mini Test: some and any', titlePs:'ازموینه: some او any', items:[
      { id:'gl.test.some-any-001', mode:'choose', topicRef:'gl.topic.some-any-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:some-any-basic'], domainTags:['market'],
        promptEn:'She has ___ rice. (positive)', promptPs:'سمه کلمه وټاکه.',
        choices:['some','any'], answer:'some',
        feedbackEn:'Positive: some rice.', feedbackPs:'مثبت: some rice.' },
      { id:'gl.test.some-any-002', mode:'choose', topicRef:'gl.topic.some-any-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:some-any-basic'], domainTags:['school'],
        promptEn:'Do you have ___ information? (question)', promptPs:'سمه کلمه وټاکه.',
        choices:['any','some'], answer:'any',
        feedbackEn:'Question: any.', feedbackPs:'پوښتنه: any.' }
    ]},

    /* ── T26 many / much ── */
    'gl.session.t26-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.many-much-basic',
      titleEn:'Practice: many and much', titlePs:'تمرین: many او much', items:[
      { id:'gl.drill.many-much-001', mode:'choose', topicRef:'gl.topic.many-much-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:many-much-basic'], domainTags:['school'],
        promptEn:'___ books (countable plural)', promptPs:'سمه کلمه وټاکه.',
        choices:['many','much'], answer:'many',
        feedbackEn:'books is countable plural: many books.', feedbackPs:'books شمیرل کیدونکی جمع دی: many.' },
      { id:'gl.drill.many-much-002', mode:'choose', topicRef:'gl.topic.many-much-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:many-much-basic'], domainTags:['home'],
        promptEn:'___ water (uncountable)', promptPs:'سمه کلمه وټاکه.',
        choices:['much','many'], answer:'much',
        feedbackEn:'water is uncountable: much water.', feedbackPs:'اوبه نه شمیرل کیدونکي دي: much.' },
      { id:'gl.drill.many-much-003', mode:'correction', topicRef:'gl.topic.many-much-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:many-much-basic','weak:determiner-choice-basic'], domainTags:['school'],
        wrongSentence:'She has much books.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['she has many books'], modelAnswer:'She has many books.',
        feedbackEn:'books is countable: many, not much.', feedbackPs:'books شمیرل کیدونکی دی: many، نه much.' }
    ]},
    'gl.session.t26-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.many-much-basic',
      titleEn:'Mini Test: many and much', titlePs:'ازموینه: many او much', items:[
      { id:'gl.test.many-much-001', mode:'choose', topicRef:'gl.topic.many-much-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:many-much-basic'], domainTags:['home'],
        promptEn:'___ rice (uncountable)', promptPs:'سمه کلمه وټاکه.',
        choices:['much','many'], answer:'much',
        feedbackEn:'rice is uncountable: much rice.', feedbackPs:'وریژې نه شمیرل کیدونکي دي: much.' },
      { id:'gl.test.many-much-002', mode:'choose', topicRef:'gl.topic.many-much-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:many-much-basic'], domainTags:['class'],
        promptEn:'___ students are in the class. (countable)', promptPs:'سمه کلمه وټاکه.',
        choices:['many','much'], answer:'many',
        feedbackEn:'students is countable: many students.', feedbackPs:'students شمیرل کیدونکي دي: many.' }
    ]},

    /* ── T27 Possessive 's ── */
    'gl.session.t27-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.possessive-s-basic',
      titleEn:'Practice: Possessive \'s', titlePs:'تمرین: د ملکیت s\'', items:[
      { id:'gl.drill.poss-s-001', mode:'fillBlank', topicRef:'gl.topic.possessive-s-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:possessive-s-basic'], domainTags:['school'],
        promptEn:'Ahmad ___ book is new. (apostrophe s)', promptPs:'تشه ډکه کړه.',
        acceptable:["Ahmad's"],
        feedbackEn:'Ahmad\'s: name + apostrophe + s.', feedbackPs:'د احمد: نوم + apostrophe + s.' },
      { id:'gl.drill.poss-s-002', mode:'choose', topicRef:'gl.topic.possessive-s-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:possessive-s-basic'], domainTags:['class'],
        promptEn:'the teacher ___ pen', promptPs:'سمه بڼه وټاکه.',
        choices:["teacher's pen","teachers pen","teachers's pen"], answer:"teacher's pen",
        feedbackEn:'teacher\'s: add apostrophe + s.', feedbackPs:'apostrophe + s.' },
      { id:'gl.drill.poss-s-003', mode:'repeat', topicRef:'gl.topic.possessive-s-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:possessive-s-basic'], domainTags:['family'],
        promptEn:"My brother's bag is blue.", promptPs:'د زما ورور بکس شین دی.',
        instructionEn:'Hear the sentence, then say it aloud clearly.',
        feedbackEn:"Good. brother + 's: my brother's bag.", feedbackPs:"ورور + 's: ملکیت." }
    ]},
    'gl.session.t27-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.possessive-s-basic',
      titleEn:'Mini Test: Possessive \'s', titlePs:'ازموینه: د ملکیت s\'', items:[
      { id:'gl.test.poss-s-001', mode:'choose', topicRef:'gl.topic.possessive-s-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:possessive-s-basic'], domainTags:['school'],
        promptEn:'Choose the correct form.', promptPs:'سمه بڼه وټاکه.',
        choices:["Sara's school","Saras school","Sara school's"], answer:"Sara's school",
        feedbackEn:'Sara\'s: name + apostrophe + s.', feedbackPs:'Sara + apostrophe + s.' },
      { id:'gl.test.poss-s-002', mode:'correction', topicRef:'gl.topic.possessive-s-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:possessive-s-basic'], domainTags:['class'],
        wrongSentence:'The students notebook is new.',
        promptEn:'Add the apostrophe correctly:', promptPs:'apostrophe سمه کړه.',
        acceptable:["the student's notebook is new"], modelAnswer:"The student's notebook is new.",
        feedbackEn:"student + 's: the student's notebook.", feedbackPs:"student + 's." }
    ]},

    /* ── T28 Noun Phrase Building Checkpoint ── */
    'gl.session.t28-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.noun-phrase-building-checkpoint',
      titleEn:'Practice: Noun Phrase Checkpoint', titlePs:'تمرین: د نوم عبارت چیک پوسته', items:[
      { id:'gl.drill.np-check-001', mode:'choose', topicRef:'gl.topic.noun-phrase-building-checkpoint',
        categoryId:'gl.cat.nouns-articles', levelNumber:4, weakTags:['weak:noun-phrase-building'], domainTags:['school'],
        promptEn:'Choose the correct phrase: ___ good English books (many, talking about her books)', promptPs:'سمه عبارت وټاکه.',
        choices:['her many good English books','many her good English books','many good her English books'], answer:'her many good English books',
        feedbackEn:'Possessive first: her many good English books.', feedbackPs:'لومړی ملکیت: her many good English books.' },
      { id:'gl.drill.np-check-002', mode:'choose', topicRef:'gl.topic.noun-phrase-building-checkpoint',
        categoryId:'gl.cat.nouns-articles', levelNumber:4, weakTags:['weak:determiner-choice-basic'], domainTags:['class'],
        promptEn:'We have ___ homework. (uncountable, some)', promptPs:'سمه بڼه وټاکه.',
        choices:['some homework','many homeworks','much homework'], answer:'some homework',
        feedbackEn:'homework is uncountable. Positive sentence: some homework.', feedbackPs:'homework نه شمیرل کیدونکی دی. مثبت: some.' },
      { id:'gl.drill.np-check-003', mode:'choose', topicRef:'gl.topic.noun-phrase-building-checkpoint',
        categoryId:'gl.cat.nouns-articles', levelNumber:4, weakTags:['weak:many-much-basic','weak:noun-phrase-building'], domainTags:['market'],
        promptEn:'___ people are at the market. (irregular plural)', promptPs:'سمه کلمه وټاکه.',
        choices:['many','much'], answer:'many',
        feedbackEn:'people is a countable plural: many people.', feedbackPs:'people شمیرل کیدونکی جمع دی: many.' }
    ]},
    'gl.session.t28-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.noun-phrase-building-checkpoint',
      titleEn:'Mini Test: Noun Phrase Checkpoint', titlePs:'ازموینه: د نوم عبارت چیک پوسته', items:[
      { id:'gl.test.np-check-001', mode:'choose', topicRef:'gl.topic.noun-phrase-building-checkpoint',
        categoryId:'gl.cat.nouns-articles', levelNumber:4, weakTags:['weak:noun-phrase-building'], domainTags:['school'],
        promptEn:'Do you have ___ information? (question, uncountable)', promptPs:'سمه کلمه وټاکه.',
        choices:['any','some','many'], answer:'any',
        feedbackEn:'Question + uncountable: any information.', feedbackPs:'پوښتنه + نه شمیرل کیدونکی: any.' },
      { id:'gl.test.np-check-002', mode:'choose', topicRef:'gl.topic.noun-phrase-building-checkpoint',
        categoryId:'gl.cat.nouns-articles', levelNumber:4, weakTags:['weak:noun-phrase-building','weak:possessive-s-basic'], domainTags:['class'],
        promptEn:'Choose the correct sentence.', promptPs:'سمه جمله وټاکه.',
        choices:["Ahmad's new bag is big.","Ahmads new bag is big.","new Ahmad's bag is big."], answer:"Ahmad's new bag is big.",
        feedbackEn:"Ahmad's first, then the adjective: Ahmad's new bag.", feedbackPs:"لومړی Ahmad's، بیا صفت." }
    ]}
  });

  /* ==========================================================================
     REFERENCE ENTRIES (5 new — join the 15 from I6C/I6D/I6E → 20 total)
     ========================================================================== */
  GL.registerReferenceEntries([
    { id:'gl.ref.articles-a-an-the', itemEn:'a / an / the — when to use each', levelNumber:2,
      categoryId:'gl.cat.nouns-articles', meaningPs:'a/an = لومړی ذکر یا نامعلوم؛ the = پېژندل شوی یا ځانګړی.',
      exampleEn:'I saw a cat. The cat was black. the sun.',
      registerLabels:['spoken','written'], weakTags:['weak:article-review-a-an-the'],
      relatedTopicRef:'gl.topic.articles-review-a-an-the' },
    { id:'gl.ref.countable-uncountable', itemEn:'countable vs uncountable nouns', levelNumber:3,
      categoryId:'gl.cat.nouns-articles', meaningPs:'شمیرل کیدونکي: book/books. نه شمیرل کیدونکي: water, rice, information.',
      exampleEn:'one book, two books — some water (not: two waters)',
      registerLabels:['written','exam'], weakTags:['weak:countable-noun','weak:uncountable-noun'],
      relatedTopicRef:'gl.topic.countable-uncountable-basic' },
    { id:'gl.ref.many-much', itemEn:'many vs much', levelNumber:3,
      categoryId:'gl.cat.nouns-articles', meaningPs:'many + شمیرل کیدونکی جمع؛ much + نه شمیرل کیدونکی.',
      exampleEn:'many books, many students / much water, much rice',
      registerLabels:['spoken','written','exam'], weakTags:['weak:many-much-basic'],
      relatedTopicRef:'gl.topic.many-much-basic' },
    { id:'gl.ref.irregular-plurals-basic', itemEn:'5 key irregular plurals', levelNumber:3,
      categoryId:'gl.cat.nouns-articles', meaningPs:'man→men, woman→women, child→children, person→people, foot→feet.',
      exampleEn:'two men, many children, three people',
      registerLabels:['written','spoken','exam'], weakTags:['weak:plural-irregular-basic'],
      relatedTopicRef:'gl.topic.irregular-plurals-tiny-intro' },
    { id:'gl.ref.possessive-s', itemEn:"possessive 's", levelNumber:2,
      categoryId:'gl.cat.nouns-articles', meaningPs:"د ملکیت لپاره نوم + apostrophe + s: Ahmad's book.",
      exampleEn:"Ahmad's book, the teacher's pen, Sara's school",
      registerLabels:['spoken','written'], weakTags:['weak:possessive-s-basic'],
      relatedTopicRef:'gl.topic.possessive-s-basic' }
  ]);
})();
