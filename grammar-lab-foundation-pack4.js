/* ============================================================================
   grammar-lab-foundation-pack4.js — PHASE I6G
   SIMPLE PRESENT AND DAILY ROUTINE PACK (L2–L4)
   ----------------------------------------------------------------------------
   CONTENT ONLY — exact I6D/I6E/I6F pack pattern. No renderers, no new TTS,
   no new guide system, no new weak store, no second Foundation Path.
   Registers 9 topics (path order 29–37), 18 sessions (27 wizard + 18 test
   items = 45 total), and 5 reference entries through the ONE engine.

   CONTINUES Pack 3: one additive link — the I6F chain end
   (gl.topic.noun-phrase-building-checkpoint, nextTopics:[]) is pointed to
   topic 29. Packs 1/2/3 content are untouched.

   PASHTO: fresh professional support, once per item/section, owner-reviewable.
   No Urdu / Dari / Farsi / Persian anywhere.

   KEY PASHTO TEACHING NOTES (in lesson blocks and feedback):
   - English uses do/does as helping verbs in negatives and questions.
     Pashto does not do this the same way.
   - He/she/it takes verb+s in Simple Present.
     Pashto does not mark this, so Afghan learners often forget it.
   - After does / does not, the main verb returns to its base form.
   ============================================================================ */
(function () {
  'use strict';
  if (!window.ZirakGrammarLab) return;
  var GL = window.ZirakGrammarLab;

  /* ── Cross-pack chain link (additive; Packs 1/2/3 untouched) ───────────── */
  if (GL.topics['gl.topic.noun-phrase-building-checkpoint'] &&
      (!GL.topics['gl.topic.noun-phrase-building-checkpoint'].nextTopics ||
       !GL.topics['gl.topic.noun-phrase-building-checkpoint'].nextTopics.length)) {
    GL.topics['gl.topic.noun-phrase-building-checkpoint'].nextTopics = ['gl.topic.simple-present-meaning'];
  }

  /* ==========================================================================
     TOPICS (9) — gl.path.foundation-1, pathOrder 29–37, L2–L4
     ========================================================================== */
  GL.registerTopics([

    { id:'gl.topic.simple-present-meaning', pathId:'gl.path.foundation-1', pathOrder:29,
      categoryId:'gl.cat.tenses', levelNumber:2, status:'active',
      titleEn:'Simple Present — What It Means', titlePs:'ساده اوسمهال — مانا',
      shortGuideEn:'Simple Present describes habits, facts, routines, and repeated actions.',
      shortGuidePs:'ساده اوسمهال عادتونه، حقیقتونه، معمولونه او تکراري کارونه بیانوي.',
      reasonEn:'Students must know when to use Simple Present before they learn the verb forms.',
      reasonPs:'زده کوونکي باید مخکې له مخکې پوه شي چې ساده اوسمهال کله کارول کیږي.',
      prerequisites:['gl.topic.subject-verb','gl.topic.noun-phrase-building-checkpoint'],
      nextTopics:['gl.topic.simple-present-base-verb'],
      weakTags:['weak:simple-present-meaning'],
      wizardSessionId:'gl.session.t29-wiz-001', testSessionId:'gl.session.t29-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'Simple Present is used for: habits (things you do often), facts (things always true), routines (what you do every day), and repeated actions.',
          ps:'ساده اوسمهال کارول کیږي کله چې: عادت، حقیقت، معمول یا تکراري کار وي.' },
        { type:'examples', titleEn:'When do we use Simple Present?', items:[
          { en:'I study English every day. (habit)', ps:'زه هره ورځ انګلیسي لولم. (عادت)', domain:'school' },
          { en:'The sun rises in the morning. (fact)', ps:'لمر سهار راخیژي. (حقیقت)', domain:'daily life' },
          { en:'We go to class on Monday. (routine)', ps:'موږ دوشنبه ورځ ټولګي ته ځو. (معمول)', domain:'class' },
          { en:'She reads books. (repeated action)', ps:'هغه کتابونه لولي. (تکراري کار)', domain:'school' }
        ]},
        { type:'note',
          en:'Simple Present is NOT used for actions happening right now. Present Continuous handles that — and comes in a later lesson.',
          ps:'ساده اوسمهال د هغه کار لپاره نه کارول کیږي چې همدا اوس روان دی. هغه وروسته راځي.' }
      ]},

    { id:'gl.topic.simple-present-base-verb', pathId:'gl.path.foundation-1', pathOrder:30,
      categoryId:'gl.cat.tenses', levelNumber:2, status:'active',
      titleEn:'Simple Present: I/You/We/They + Verb', titlePs:'ساده اوسمهال: I/You/We/They',
      shortGuideEn:'With I, you, we, and they: use the base verb — no -s ending.',
      shortGuidePs:'له I, you, we, they سره: اصلي فعل — پرته له s نه.',
      reasonEn:'This is the simplest form of Simple Present and the foundation for everything that follows.',
      reasonPs:'دا د ساده اوسمهال تر ټولو ساده بڼه ده.',
      prerequisites:['gl.topic.simple-present-meaning'],
      nextTopics:['gl.topic.third-person-s-basic'],
      weakTags:['weak:base-verb-routine'],
      wizardSessionId:'gl.session.t30-wiz-001', testSessionId:'gl.session.t30-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'I / you / we / they + base verb', ps:'I / you / we / they + اصلي فعل' },
          { en:'I study. You read. We play. They work.' }
        ]},
        { type:'examples', items:[
          { en:'I study English.', ps:'زه انګلیسي لولم.', domain:'school' },
          { en:'You read books.', ps:'ته کتابونه لولې.', domain:'school' },
          { en:'We play football.', ps:'موږ فوټبال کوو.', domain:'daily life' },
          { en:'They drink tea.', ps:'هغوی چای څښي.', domain:'home' },
          { en:'I wake up early.', ps:'زه سهار ژر پاڅیږم.', domain:'home' }
        ]},
        { type:'commonMistake', wrongEn:'We plays football.', rightEn:'We play football.',
          noteEn:'With we, use the base verb — no -s.',
          notePs:'له we سره اصلي فعل — بې s.' }
      ]},

    { id:'gl.topic.third-person-s-basic', pathId:'gl.path.foundation-1', pathOrder:31,
      categoryId:'gl.cat.tenses', levelNumber:2, status:'active',
      titleEn:'Simple Present: He/She/It + Verb-s', titlePs:'ساده اوسمهال: He/She/It + فعل‑s',
      shortGuideEn:'He, she, and it take verb + s in Simple Present. This is the most important rule for Afghan learners.',
      shortGuidePs:'له he, she, it سره فعل s اخلي. دا د پښتو ویونکو لپاره تر ټولو مهم قاعده ده.',
      reasonEn:'Third-person -s is the single most common Pashto-speaker error in Simple Present. It needs clear, focused teaching.',
      reasonPs:'د دریمې کسانې s د پښتو ویونکو د ساده اوسمهال تر ټولو عامه تېروتنه ده.',
      prerequisites:['gl.topic.simple-present-base-verb'],
      nextTopics:['gl.topic.third-person-spelling-s-es-ies'],
      weakTags:['weak:third-person-s','weak:pashto-speaker-third-person-s'],
      wizardSessionId:'gl.session.t31-wiz-001', testSessionId:'gl.session.t31-test-001',
      referenceEntries:['gl.ref.third-person-s-simple-present'],
      lessonBlocks:[
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'he / she / it + verb + s', ps:'he / she / it + فعل + s' },
          { en:'He reads. She works. It helps.' }
        ]},
        { type:'explanation',
          en:'Pashto does not use this small -s marker the same way. This is why many Afghan learners say "She play" instead of "She plays". Notice the -s every time.',
          ps:'پښتو همدا کوچنی s نه کاروي. له همدې کبله ډیر افغان زده کوونکي غلطي کوي. هره ځل s یادوه.' },
        { type:'examples', items:[
          { en:'He reads English.', ps:'هغه انګلیسي لولي.', domain:'school' },
          { en:'She works in the market.', ps:'هغه بازار کې کار کوي.', domain:'market' },
          { en:'It helps a lot.', ps:'دا ډیر مرسته کوي.', domain:'daily life' },
          { en:'My brother studies at night.', ps:'زما ورور شپه کې لولي.', domain:'home' }
        ]},
        { type:'commonMistake', wrongEn:'She play football.', rightEn:'She plays football.',
          noteEn:'She → verb + s: She plays.',
          notePs:'She → فعل + s: She plays.' },
        { type:'commonMistake', wrongEn:'He go to school.', rightEn:'He goes to school.',
          noteEn:'He → verb + s (or -es): He goes.',
          notePs:'He → فعل + s (یا -es): He goes.' }
      ]},

    { id:'gl.topic.third-person-spelling-s-es-ies', pathId:'gl.path.foundation-1', pathOrder:32,
      categoryId:'gl.cat.tenses', levelNumber:3, status:'active',
      titleEn:'Third-Person Spelling: -s, -es, -ies', titlePs:'د دریمې کسانې املا: ‑s، ‑es، ‑ies',
      shortGuideEn:'read→reads, go→goes, study→studies. A small spelling system for he/she/it verbs.',
      shortGuidePs:'read→reads, go→goes, study→studies. د he/she/it فعلونو لپاره کوچنی د املا سیستم.',
      reasonEn:'Beginner students need to spell he/she/it verb forms correctly in writing and tests.',
      reasonPs:'پیل کوونکو زده کوونکو ته د لیکنې او ازموینو لپاره سمه املا ده.',
      prerequisites:['gl.topic.third-person-s-basic','gl.topic.plural-s-es'],
      nextTopics:['gl.topic.have-has-basic'],
      weakTags:['weak:third-person-spelling'],
      wizardSessionId:'gl.session.t32-wiz-001', testSessionId:'gl.session.t32-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'When to add -es or change to -ies', rows:[
          { en:'most verbs → + s', ps:'read→reads, work→works, play→plays' },
          { en:'ends in s/ss/sh/ch/x → + es', ps:'go→goes, watch→watches, wash→washes' },
          { en:'ends in consonant + y → y→ies', ps:'study→studies, fly→flies' }
        ]},
        { type:'examples', items:[
          { en:'read → reads', ps:'لولم ← لولي', domain:'school' },
          { en:'go → goes', ps:'ځم ← ځي', domain:'daily life' },
          { en:'watch → watches', ps:'ګورم ← ګوري', domain:'home' },
          { en:'study → studies', ps:'لولم ← لولي (خپل)', domain:'school' },
          { en:'fly → flies', ps:'الوزم ← الوزي', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'He studys.', rightEn:'He studies.',
          noteEn:'study ends in consonant + y: change y to ies.',
          notePs:'study پر y پای ته رسیږي (د مصوت پرته): y→ies.' }
      ]},

    { id:'gl.topic.have-has-basic', pathId:'gl.path.foundation-1', pathOrder:33,
      categoryId:'gl.cat.tenses', levelNumber:2, status:'active',
      titleEn:'have and has', titlePs:'have او has',
      shortGuideEn:'I/you/we/they have. He/she/it has. Only possession — not perfect tense.',
      shortGuidePs:'I/you/we/they → have. He/she/it → has. یوازې ملکیت — نه بشپړ زمانه.',
      reasonEn:'have/has is one of the most frequent verbs in English and follows the same third-person rule.',
      reasonPs:'have/has د انګلیسي یو تر ټولو ډیر کارول شوی فعل دی.',
      prerequisites:['gl.topic.simple-present-base-verb','gl.topic.third-person-s-basic'],
      nextTopics:['gl.topic.simple-present-negative'],
      weakTags:['weak:have-has-basic'],
      wizardSessionId:'gl.session.t33-wiz-001', testSessionId:'gl.session.t33-test-001',
      referenceEntries:['gl.ref.have-has-basic'],
      lessonBlocks:[
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'I / you / we / they → have', ps:'I / you / we / they → have' },
          { en:'he / she / it → has', ps:'he / she / it → has' }
        ]},
        { type:'examples', items:[
          { en:'I have a book.', ps:'زما یو کتاب دی.', domain:'school' },
          { en:'You have a pen.', ps:'ستا یو قلم دی.', domain:'class' },
          { en:'He has a book.', ps:'د هغه یو کتاب دی.', domain:'school' },
          { en:'She has a pen.', ps:'د هغې یو قلم دی.', domain:'class' },
          { en:'We have class today.', ps:'موږ نن ټولګی لرو.', domain:'class' }
        ]},
        { type:'note',
          en:'This is have/has for possession and simple facts only. The Perfect tense (I have studied) comes in a later lesson.',
          ps:'دا have/has یوازې د ملکیت لپاره دی. بشپړه زمانه (I have studied) وروسته راځي.' },
        { type:'commonMistake', wrongEn:'He have a book.', rightEn:'He has a book.',
          noteEn:'he → has, not have.',
          notePs:'له he سره has راځي، نه have.' }
      ]},

    { id:'gl.topic.simple-present-negative', pathId:'gl.path.foundation-1', pathOrder:34,
      categoryId:'gl.cat.tenses', levelNumber:3, status:'active',
      titleEn:'Simple Present Negative: do not / does not', titlePs:'منفي ساده اوسمهال',
      shortGuideEn:'I/you/we/they do not + base verb. He/she/it does not + base verb.',
      shortGuidePs:'I/you/we/they → do not + اصلي فعل. He/she/it → does not + اصلي فعل.',
      reasonEn:'Negatives are essential for daily conversation. The does not + base verb rule prevents a very common error.',
      reasonPs:'منفي جملې ضروري دي. د does not + اصلي فعل قاعده یوه ډیره عامه تېروتنه مخنیوی کوي.',
      prerequisites:['gl.topic.third-person-s-basic'],
      nextTopics:['gl.topic.simple-present-yes-no-questions'],
      weakTags:['weak:do-not-negative','weak:does-not-base-verb'],
      wizardSessionId:'gl.session.t34-wiz-001', testSessionId:'gl.session.t34-test-001',
      referenceEntries:['gl.ref.do-not-does-not'],
      lessonBlocks:[
        { type:'formula', titleEn:'Negative pattern', rows:[
          { en:'I / you / we / they + do not + base verb', ps:'I / you / we / they + do not + اصلي فعل' },
          { en:'he / she / it + does not + base verb', ps:'he / she / it + does not + اصلي فعل' }
        ]},
        { type:'explanation',
          en:'After does not, the verb goes back to its base form. We do NOT add -s again.',
          ps:'د does not وروسته فعل خپل اصلي بڼه ته ستنیږي. بیا s نه زیاتیږي.' },
        { type:'examples', items:[
          { en:'I do not play football.', ps:'زه فوټبال نه کوم.', domain:'daily life' },
          { en:'We do not go to school on Friday.', ps:'موږ جمعه ښوونځي ته نه ځو.', domain:'class' },
          { en:'He does not play football.', ps:'هغه فوټبال نه کوي.', domain:'daily life' },
          { en:'She does not drink tea.', ps:'هغه چای نه څښي.', domain:'home' },
          { en:'They do not work at night.', ps:'هغوی شپه کې کار نه کوي.', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'She does not plays.', rightEn:'She does not play.',
          noteEn:'After does not, use the base verb — no -s.',
          notePs:'د does not وروسته اصلي فعل — بې s.' },
        { type:'note',
          en:'Spoken short forms don\'t and doesn\'t mean the same thing and come in a later lesson.',
          ps:'لنډې بڼې don\'t او doesn\'t وروسته راځي.' }
      ]},

    { id:'gl.topic.simple-present-yes-no-questions', pathId:'gl.path.foundation-1', pathOrder:35,
      categoryId:'gl.cat.questions-negatives', levelNumber:3, status:'active',
      titleEn:'Simple Present Yes/No Questions: do / does', titlePs:'د هو/نه پوښتنې: do / does',
      shortGuideEn:'Do you…? Does she…? After does, always use the base verb.',
      shortGuidePs:'Do you…? Does she…? د does وروسته تل اصلي فعل.',
      reasonEn:'Yes/no questions are the entry point to real conversation in Simple Present.',
      reasonPs:'د هو/نه پوښتنې د ساده اوسمهال کې ریښتیني خبرو لومړی ورته دروازه ده.',
      prerequisites:['gl.topic.simple-present-negative'],
      nextTopics:['gl.topic.simple-present-wh-light'],
      weakTags:['weak:do-does-question','weak:does-question-base-verb'],
      wizardSessionId:'gl.session.t35-wiz-001', testSessionId:'gl.session.t35-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'Question pattern', rows:[
          { en:'Do + I / you / we / they + base verb?', ps:'Do + I / you / we / they + اصلي فعل؟' },
          { en:'Does + he / she / it + base verb?', ps:'Does + he / she / it + اصلي فعل؟' }
        ]},
        { type:'explanation',
          en:'Do and does take all the "third-person job" in the question. So the main verb stays in base form.',
          ps:'Do او does د پوښتنې کې د دریمې کسانې ټول کار کوي. نو اصلي فعل خپل اصلي بڼه ساتي.' },
        { type:'examples', items:[
          { en:'Do you speak English?', ps:'ایا ته انګلیسي خبرې کوې؟', domain:'class' },
          { en:'Do they play football?', ps:'ایا هغوی فوټبال کوي؟', domain:'daily life' },
          { en:'Does he live in Kandahar?', ps:'ایا هغه کندهار کې اوسیږي؟', domain:'daily life' },
          { en:'Does she study English?', ps:'ایا هغه انګلیسي لولي؟', domain:'school' }
        ]},
        { type:'commonMistake', wrongEn:'Does he lives here?', rightEn:'Does he live here?',
          noteEn:'Does already shows third person. The main verb stays as base form.',
          notePs:'Does دمخه دریمه کسانه ښیي. اصلي فعل اصلي بڼه ساتي.' },
        { type:'commonMistake', wrongEn:'Does she studies English?', rightEn:'Does she study English?',
          noteEn:'After does, no -s or -es on the main verb.',
          notePs:'د does وروسته اصلي فعل ته s یا es نه ورزیاتیږي.' }
      ]},

    { id:'gl.topic.simple-present-wh-light', pathId:'gl.path.foundation-1', pathOrder:36,
      categoryId:'gl.cat.questions-negatives', levelNumber:4, status:'active',
      titleEn:'Simple Present WH Questions (Light)', titlePs:'د ساده اوسمهال WH پوښتنې (لومړنی)',
      shortGuideEn:'Where do you live? What does she study? WH word + do/does + subject + base verb.',
      shortGuidePs:'WH کلمه + do/does + فاعل + اصلي فعل.',
      reasonEn:'A small but real set of WH questions makes Simple Present fully useful for daily life.',
      reasonPs:'د WH پوښتنو یو کوچنی ټولګه ساده اوسمهال د ورځني ژوند لپاره بشپړ مفید کوي.',
      prerequisites:['gl.topic.simple-present-yes-no-questions'],
      nextTopics:['gl.topic.daily-routine-checkpoint'],
      weakTags:['weak:simple-present-wh-order'],
      wizardSessionId:'gl.session.t36-wiz-001', testSessionId:'gl.session.t36-test-001',
      referenceEntries:['gl.ref.wh-do-does'],
      lessonBlocks:[
        { type:'formula', titleEn:'WH question pattern', rows:[
          { en:'WH word + do + I/you/we/they + base verb?', ps:'WH کلمه + do + فاعل + اصلي فعل؟' },
          { en:'WH word + does + he/she/it + base verb?', ps:'WH کلمه + does + he/she/it + اصلي فعل؟' },
          { en:'Where do you live? → I live in Kandahar.' },
          { en:'What does she study? → She studies English.' }
        ]},
        { type:'examples', items:[
          { en:'Where do you live?', ps:'ته چیرې اوسیږې؟', domain:'daily life' },
          { en:'What do you study?', ps:'ته څه لولې؟', domain:'school' },
          { en:'When do they play?', ps:'هغوی کله لوبې کوي؟', domain:'daily life' },
          { en:'Where does he work?', ps:'هغه چیرې کار کوي؟', domain:'market' },
          { en:'What does she read?', ps:'هغه څه لولي؟', domain:'school' }
        ]},
        { type:'commonMistake', wrongEn:'Where you live?', rightEn:'Where do you live?',
          noteEn:'English needs do or does in the question — it cannot be skipped.',
          notePs:'انګلیسي کې پوښتنه کې do یا does اړین دی — نه پریږدل کیدای شي.' },
        { type:'commonMistake', wrongEn:'What she studies?', rightEn:'What does she study?',
          noteEn:'she → does + base verb: What does she study?',
          notePs:'she → does + اصلي فعل: What does she study?' },
        { type:'note',
          en:'A full WH question system (who, which, how, why, how many, how much) comes in a later lesson, I6H.',
          ps:'بشپړ د WH پوښتنو سیستم (who, which, how, why) وروسته راځي.' }
      ]},

    { id:'gl.topic.daily-routine-checkpoint', pathId:'gl.path.foundation-1', pathOrder:37,
      categoryId:'gl.cat.tenses', levelNumber:4, status:'active',
      titleEn:'Daily Routine Checkpoint', titlePs:'د ورځني معمول چیک پوسته',
      shortGuideEn:'Mix everything: base verb, -s form, negatives, questions, WH questions — all in daily routine sentences.',
      shortGuidePs:'هرڅه یوځای کړه: اصلي فعل، s بڼه، منفي، پوښتنه — د ورځني ژوند جملو کې.',
      reasonEn:'This checkpoint seals Simple Present before WH questions deepen in I6H.',
      reasonPs:'دا چیک پوسته ساده اوسمهال بشپړوي مخکې له دې چې I6H کې WH پوښتنې ژور شي.',
      prerequisites:['gl.topic.simple-present-wh-light','gl.topic.have-has-basic'],
      nextTopics:[],
      weakTags:['weak:daily-routine-simple-present','weak:third-person-s'],
      wizardSessionId:'gl.session.t37-wiz-001', testSessionId:'gl.session.t37-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'Now put Simple Present together for your daily routine. Add frequency words to make sentences richer.',
          ps:'اوس ساده اوسمهال د خپل ورځني معمول لپاره یوځای کړه. د تکرار کلمې ورزیاتوه.' },
        { type:'formula', titleEn:'Light frequency words', rows:[
          { en:'always / usually / sometimes / never', ps:'تل / معمولاً / ځینې وخت / هېڅکله' },
          { en:'I always study at home.', ps:'زه تل کور کې لولم.' },
          { en:'She sometimes reads books.', ps:'هغه ځینې وخت کتابونه لولي.' }
        ]},
        { type:'examples', items:[
          { en:'I wake up early.', ps:'زه سهار ژر پاڅیږم.', domain:'home' },
          { en:'I go to school.', ps:'زه ښوونځي ته ځم.', domain:'class' },
          { en:'My brother works in the market.', ps:'زما ورور بازار کې کار کوي.', domain:'market' },
          { en:'She does not watch TV at night.', ps:'هغه شپه کې ټلویزیون نه ګوري.', domain:'home' },
          { en:'Do you read every day?', ps:'ایا ته هره ورځ لولې؟', domain:'school' },
          { en:'Where does your father work?', ps:'ستا پلار چیرې کار کوي؟', domain:'family' }
        ]},
        { type:'commonMistake', wrongEn:'Where your father work?', rightEn:'Where does your father work?',
          noteEn:'your father = he → does + base verb.',
          notePs:'ستا پلار = he → does + اصلي فعل.' }
      ]}
  ]);

  /* ==========================================================================
     SESSIONS — 3 wizard + 2 test per topic = 27 wizard + 18 test = 45 total
     ========================================================================== */
  GL.registerSessions({

    /* ── T29 Simple Present Meaning ── */
    'gl.session.t29-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.simple-present-meaning',
      titleEn:'Practice: What is Simple Present?', titlePs:'تمرین: ساده اوسمهال مانا', items:[
      { id:'gl.drill.sp-meaning-001', mode:'choose', topicRef:'gl.topic.simple-present-meaning',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:simple-present-meaning'], domainTags:['school'],
        promptEn:'Choose the sentence that uses Simple Present correctly.', promptPs:'سمه جمله وټاکه.',
        choices:['I study English every day.','I am studying right now.','I studied yesterday.'],
        answer:'I study English every day.',
        feedbackEn:'A habit or routine uses Simple Present.', feedbackPs:'عادت یا معمول ساده اوسمهال کاروي.' },
      { id:'gl.drill.sp-meaning-002', mode:'choose', topicRef:'gl.topic.simple-present-meaning',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:simple-present-meaning'], domainTags:['daily-life'],
        promptEn:'The sun rises in the morning. This is a...', promptPs:'دا کوم ډول دی؟',
        choices:['fact','action right now','past event'], answer:'fact',
        feedbackEn:'Simple Present is used for facts: The sun rises.', feedbackPs:'ساده اوسمهال حقیقتونو لپاره دی.' },
      { id:'gl.drill.sp-meaning-003', mode:'repeat', topicRef:'gl.topic.simple-present-meaning',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:simple-present-meaning'], domainTags:['class'],
        promptEn:'We go to class on Monday.', promptPs:'موږ دوشنبه ورځ ټولګي ته ځو.',
        instructionEn:'Hear this routine sentence, then say it clearly.',
        feedbackEn:'Good. A routine: We go to class on Monday.', feedbackPs:'ښه. معمول: موږ دوشنبه ورځ ورځو.' }
    ]},
    'gl.session.t29-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.simple-present-meaning',
      titleEn:'Mini Test: Simple Present Meaning', titlePs:'ازموینه: ساده اوسمهال مانا', items:[
      { id:'gl.test.sp-meaning-001', mode:'choose', topicRef:'gl.topic.simple-present-meaning',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:simple-present-meaning'], domainTags:['daily-life'],
        promptEn:'Which sentence shows a habit?', promptPs:'کومه جمله عادت ښیي؟',
        choices:['She reads books every day.','She is reading now.','She read yesterday.'],
        answer:'She reads books every day.',
        feedbackEn:'Every day = habit → Simple Present.', feedbackPs:'هره ورځ = عادت → ساده اوسمهال.' },
      { id:'gl.test.sp-meaning-002', mode:'choose', topicRef:'gl.topic.simple-present-meaning',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:simple-present-meaning'], domainTags:['school'],
        promptEn:'Choose the Simple Present sentence.', promptPs:'ساده اوسمهال جمله وټاکه.',
        choices:['They play football every day.','They played yesterday.','They are playing now.'],
        answer:'They play football every day.',
        feedbackEn:'Every day + base verb = Simple Present.', feedbackPs:'هره ورځ + اصلي فعل = ساده اوسمهال.' }
    ]},

    /* ── T30 I/You/We/They + base verb ── */
    'gl.session.t30-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.simple-present-base-verb',
      titleEn:'Practice: I/You/We/They + Verb', titlePs:'تمرین: I/You/We/They', items:[
      { id:'gl.drill.sp-base-001', mode:'choose', topicRef:'gl.topic.simple-present-base-verb',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:base-verb-routine'], domainTags:['school'],
        promptEn:'We ___ English every day.', promptPs:'سم فعل وټاکه.',
        choices:['study','studies','studying'], answer:'study',
        feedbackEn:'we → base verb: We study.', feedbackPs:'له we سره اصلي فعل: We study.' },
      { id:'gl.drill.sp-base-002', mode:'fillBlank', topicRef:'gl.topic.simple-present-base-verb',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:base-verb-routine'], domainTags:['daily-life'],
        promptEn:'They ___ tea every morning.', promptPs:'تشه ډکه کړه.',
        acceptable:['drink'],
        feedbackEn:'they → base verb: They drink.', feedbackPs:'له they سره اصلي فعل.' },
      { id:'gl.drill.sp-base-003', mode:'correction', topicRef:'gl.topic.simple-present-base-verb',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:base-verb-routine'], domainTags:['class'],
        wrongSentence:'You goes to school every day.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['you go to school every day'], modelAnswer:'You go to school every day.',
        feedbackEn:'you → base verb: You go.', feedbackPs:'له you سره اصلي فعل: You go.' }
    ]},
    'gl.session.t30-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.simple-present-base-verb',
      titleEn:'Mini Test: I/You/We/They', titlePs:'ازموینه: I/You/We/They', items:[
      { id:'gl.test.sp-base-001', mode:'choose', topicRef:'gl.topic.simple-present-base-verb',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:base-verb-routine'], domainTags:['daily-life'],
        promptEn:'I ___ football after school.', promptPs:'سم فعل وټاکه.',
        choices:['play','plays','playing'], answer:'play',
        feedbackEn:'I → base verb: I play.', feedbackPs:'له I سره اصلي فعل.' },
      { id:'gl.test.sp-base-002', mode:'correction', topicRef:'gl.topic.simple-present-base-verb',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:base-verb-routine'], domainTags:['home'],
        wrongSentence:'We drinks tea every morning.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['we drink tea every morning'], modelAnswer:'We drink tea every morning.',
        feedbackEn:'we → base verb: We drink.', feedbackPs:'له we سره اصلي فعل: drink.' }
    ]},

    /* ── T31 Third-Person -s ── */
    'gl.session.t31-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.third-person-s-basic',
      titleEn:'Practice: He/She/It + verb-s', titlePs:'تمرین: He/She/It + فعل‑s', items:[
      { id:'gl.drill.t3s-001', mode:'choose', topicRef:'gl.topic.third-person-s-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:third-person-s','weak:pashto-speaker-third-person-s'], domainTags:['market'],
        promptEn:'She ___ in the market.', promptPs:'سم فعل وټاکه.',
        choices:['work','works','working'], answer:'works',
        feedbackEn:'she → verb + s: She works.', feedbackPs:'له she سره فعل + s: She works.' },
      { id:'gl.drill.t3s-002', mode:'correction', topicRef:'gl.topic.third-person-s-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:third-person-s','weak:pashto-speaker-third-person-s'], domainTags:['school'],
        wrongSentence:'He go to school every day.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['he goes to school every day'], modelAnswer:'He goes to school every day.',
        feedbackEn:'he → goes (verb + es).', feedbackPs:'له he سره goes (فعل + es).' },
      { id:'gl.drill.t3s-003', mode:'choose', topicRef:'gl.topic.third-person-s-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:third-person-s'], domainTags:['school'],
        promptEn:'My brother ___ English every night.', promptPs:'سم فعل وټاکه.',
        choices:['study','studies','studys'], answer:'studies',
        feedbackEn:'my brother = he → studies.', feedbackPs:'زما ورور = he → studies.' }
    ]},
    'gl.session.t31-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.third-person-s-basic',
      titleEn:'Mini Test: He/She/It + verb-s', titlePs:'ازموینه: He/She/It + فعل‑s', items:[
      { id:'gl.test.t3s-001', mode:'choose', topicRef:'gl.topic.third-person-s-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:third-person-s'], domainTags:['daily-life'],
        promptEn:'It ___ a lot in Kandahar in winter.', promptPs:'سم فعل وټاکه.',
        choices:['rain','rains','raining'], answer:'rains',
        feedbackEn:'it → rains.', feedbackPs:'له it سره rains.' },
      { id:'gl.test.t3s-002', mode:'correction', topicRef:'gl.topic.third-person-s-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:pashto-speaker-third-person-s'], domainTags:['family'],
        wrongSentence:'She play football every day.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['she plays football every day'], modelAnswer:'She plays football every day.',
        feedbackEn:'she → plays (verb + s).', feedbackPs:'له she سره plays.' }
    ]},

    /* ── T32 Third-Person Spelling ── */
    'gl.session.t32-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.third-person-spelling-s-es-ies',
      titleEn:'Practice: -s, -es, -ies Spelling', titlePs:'تمرین: ‑s، ‑es، ‑ies', items:[
      { id:'gl.drill.t3spell-001', mode:'fillBlank', topicRef:'gl.topic.third-person-spelling-s-es-ies',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:third-person-spelling'], domainTags:['school'],
        promptEn:'He ___ English. (study)', promptPs:'تشه ډکه کړه.',
        acceptable:['studies'],
        feedbackEn:'study ends in consonant+y: study → studies.', feedbackPs:'study → ies: studies.' },
      { id:'gl.drill.t3spell-002', mode:'choose', topicRef:'gl.topic.third-person-spelling-s-es-ies',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:third-person-spelling'], domainTags:['daily-life'],
        promptEn:'She ___ TV every evening. (watch)', promptPs:'سمه بڼه وټاکه.',
        choices:['watchs','watches','watch'], answer:'watches',
        feedbackEn:'watch ends in ch: watch → watches.', feedbackPs:'watch پر ch پای ته رسیږي: watches.' },
      { id:'gl.drill.t3spell-003', mode:'choose', topicRef:'gl.topic.third-person-spelling-s-es-ies',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:third-person-spelling'], domainTags:['school'],
        promptEn:'He ___ to school every day. (go)', promptPs:'سمه بڼه وټاکه.',
        choices:['gos','goes','go'], answer:'goes',
        feedbackEn:'go → goes.', feedbackPs:'go → goes.' }
    ]},
    'gl.session.t32-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.third-person-spelling-s-es-ies',
      titleEn:'Mini Test: -s, -es, -ies', titlePs:'ازموینه: ‑s، ‑es، ‑ies', items:[
      { id:'gl.test.t3spell-001', mode:'choose', topicRef:'gl.topic.third-person-spelling-s-es-ies',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:third-person-spelling'], domainTags:['daily-life'],
        promptEn:'The bird ___ every morning. (fly)', promptPs:'سمه بڼه وټاکه.',
        choices:['flys','flyes','flies'], answer:'flies',
        feedbackEn:'fly ends in consonant+y: fly → flies.', feedbackPs:'fly → flies.' },
      { id:'gl.test.t3spell-002', mode:'correction', topicRef:'gl.topic.third-person-spelling-s-es-ies',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:third-person-spelling'], domainTags:['school'],
        wrongSentence:'He studys hard every day.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['he studies hard every day'], modelAnswer:'He studies hard every day.',
        feedbackEn:'study → studies (y → ies).', feedbackPs:'study → studies.' }
    ]},

    /* ── T33 have / has ── */
    'gl.session.t33-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.have-has-basic',
      titleEn:'Practice: have and has', titlePs:'تمرین: have او has', items:[
      { id:'gl.drill.have-has-001', mode:'choose', topicRef:'gl.topic.have-has-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:have-has-basic'], domainTags:['class'],
        promptEn:'She ___ a new bag.', promptPs:'سم فعل وټاکه.',
        choices:['have','has','haves'], answer:'has',
        feedbackEn:'she → has.', feedbackPs:'له she سره has.' },
      { id:'gl.drill.have-has-002', mode:'fillBlank', topicRef:'gl.topic.have-has-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:have-has-basic'], domainTags:['class'],
        promptEn:'We ___ class today.', promptPs:'تشه ډکه کړه.',
        acceptable:['have'],
        feedbackEn:'we → have.', feedbackPs:'له we سره have.' },
      { id:'gl.drill.have-has-003', mode:'correction', topicRef:'gl.topic.have-has-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:have-has-basic'], domainTags:['school'],
        wrongSentence:'He have a good book.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['he has a good book'], modelAnswer:'He has a good book.',
        feedbackEn:'he → has, not have.', feedbackPs:'له he سره has، نه have.' }
    ]},
    'gl.session.t33-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.have-has-basic',
      titleEn:'Mini Test: have and has', titlePs:'ازموینه: have او has', items:[
      { id:'gl.test.have-has-001', mode:'choose', topicRef:'gl.topic.have-has-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:have-has-basic'], domainTags:['family'],
        promptEn:'My father ___ a big bag.', promptPs:'سم فعل وټاکه.',
        choices:['have','has'], answer:'has',
        feedbackEn:'my father = he → has.', feedbackPs:'زما پلار = he → has.' },
      { id:'gl.test.have-has-002', mode:'fillBlank', topicRef:'gl.topic.have-has-basic',
        categoryId:'gl.cat.tenses', levelNumber:2, weakTags:['weak:have-has-basic'], domainTags:['school'],
        promptEn:'I ___ two pens in my bag.', promptPs:'تشه ډکه کړه.',
        acceptable:['have'],
        feedbackEn:'I → have.', feedbackPs:'له I سره have.' }
    ]},

    /* ── T34 Simple Present Negative ── */
    'gl.session.t34-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.simple-present-negative',
      titleEn:'Practice: do not / does not', titlePs:'تمرین: منفي ساده اوسمهال', items:[
      { id:'gl.drill.sp-neg-001', mode:'transformation', topicRef:'gl.topic.simple-present-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:do-not-negative'], domainTags:['daily-life'],
        promptEn:'Make it negative: I play football.', promptPs:'منفي یې کړه.',
        acceptable:['i do not play football','i don\'t play football'],
        modelAnswer:'I do not play football.',
        feedbackEn:'I → do not + base verb: I do not play.', feedbackPs:'I → do not + اصلي فعل.' },
      { id:'gl.drill.sp-neg-002', mode:'choose', topicRef:'gl.topic.simple-present-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:does-not-base-verb'], domainTags:['home'],
        promptEn:'She ___ tea.', promptPs:'سمه منفي بڼه وټاکه.',
        choices:['does not drink','does not drinks','do not drinks'], answer:'does not drink',
        feedbackEn:'she → does not + base verb: does not drink.', feedbackPs:'له she سره does not + اصلي فعل.' },
      { id:'gl.drill.sp-neg-003', mode:'correction', topicRef:'gl.topic.simple-present-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:does-not-base-verb'], domainTags:['school'],
        wrongSentence:'He does not plays football.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['he does not play football'], modelAnswer:'He does not play football.',
        feedbackEn:'After does not, base verb — no -s.', feedbackPs:'د does not وروسته اصلي فعل — بې s.' }
    ]},
    'gl.session.t34-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.simple-present-negative',
      titleEn:'Mini Test: do not / does not', titlePs:'ازموینه: منفي', items:[
      { id:'gl.test.sp-neg-001', mode:'transformation', topicRef:'gl.topic.simple-present-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:do-not-negative'], domainTags:['class'],
        promptEn:'Make it negative: They go to school on Friday.', promptPs:'منفي یې کړه.',
        acceptable:['they do not go to school on friday'],
        modelAnswer:'They do not go to school on Friday.',
        feedbackEn:'they → do not + base verb.', feedbackPs:'they → do not + اصلي فعل.' },
      { id:'gl.test.sp-neg-002', mode:'choose', topicRef:'gl.topic.simple-present-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:does-not-base-verb'], domainTags:['daily-life'],
        promptEn:'My brother ___ coffee.', promptPs:'سمه منفي بڼه وټاکه.',
        choices:['does not drink','does not drinks','do not drink'], answer:'does not drink',
        feedbackEn:'my brother = he → does not + base verb.', feedbackPs:'زما ورور = he → does not + اصلي فعل.' }
    ]},

    /* ── T35 Yes/No Questions ── */
    'gl.session.t35-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.simple-present-yes-no-questions',
      titleEn:'Practice: Do you...? Does she...?', titlePs:'تمرین: Do/Does پوښتنې', items:[
      { id:'gl.drill.sp-yn-001', mode:'transformation', topicRef:'gl.topic.simple-present-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:do-does-question'], domainTags:['school'],
        promptEn:'Make a question: You speak English.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['do you speak english'], modelAnswer:'Do you speak English?',
        feedbackEn:'you → Do you + base verb: Do you speak?', feedbackPs:'له you سره Do + base verb.' },
      { id:'gl.drill.sp-yn-002', mode:'transformation', topicRef:'gl.topic.simple-present-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:does-question-base-verb'], domainTags:['daily-life'],
        promptEn:'Make a question: He lives in Kandahar.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['does he live in kandahar'], modelAnswer:'Does he live in Kandahar?',
        feedbackEn:'he → Does he + base verb: Does he live?', feedbackPs:'له he سره Does + base verb: live (نه lives).' },
      { id:'gl.drill.sp-yn-003', mode:'choose', topicRef:'gl.topic.simple-present-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:does-question-base-verb'], domainTags:['school'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['Does she study English?','Does she studies English?','Do she study English?'],
        answer:'Does she study English?',
        feedbackEn:'she → Does + base verb: Does she study?', feedbackPs:'she → Does + اصلي فعل.' }
    ]},
    'gl.session.t35-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.simple-present-yes-no-questions',
      titleEn:'Mini Test: Do/Does Questions', titlePs:'ازموینه: Do/Does پوښتنې', items:[
      { id:'gl.test.sp-yn-001', mode:'choose', topicRef:'gl.topic.simple-present-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:do-does-question'], domainTags:['market'],
        promptEn:'___ they sell books?', promptPs:'سم مرستیال فعل وټاکه.',
        choices:['Do','Does','Is'], answer:'Do',
        feedbackEn:'they → Do they + base verb.', feedbackPs:'they → Do + اصلي فعل.' },
      { id:'gl.test.sp-yn-002', mode:'transformation', topicRef:'gl.topic.simple-present-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:3, weakTags:['weak:does-question-base-verb'], domainTags:['family'],
        promptEn:'Make a question: She works at night.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['does she work at night'], modelAnswer:'Does she work at night?',
        feedbackEn:'she → Does she + base verb: work (no -s).', feedbackPs:'she → Does she + اصلي فعل.' }
    ]},

    /* ── T36 WH Light ── */
    'gl.session.t36-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.simple-present-wh-light',
      titleEn:'Practice: WH Questions', titlePs:'تمرین: WH پوښتنې', items:[
      { id:'gl.drill.sp-wh-001', mode:'choose', topicRef:'gl.topic.simple-present-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:simple-present-wh-order'], domainTags:['daily-life'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['Where do you live?','Where you live?','Where you do live?'],
        answer:'Where do you live?',
        feedbackEn:'WH word + do + subject + base verb: Where do you live?', feedbackPs:'WH + do + فاعل + اصلي فعل.' },
      { id:'gl.drill.sp-wh-002', mode:'transformation', topicRef:'gl.topic.simple-present-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:simple-present-wh-order'], domainTags:['school'],
        promptEn:'Make a WH question: She reads something.', promptPs:'WH پوښتنه جوړه کړه.',
        acceptable:['what does she read'], modelAnswer:'What does she read?',
        feedbackEn:'she → What does she + base verb: read.', feedbackPs:'she → What does she + اصلي فعل.' },
      { id:'gl.drill.sp-wh-003', mode:'choose', topicRef:'gl.topic.simple-present-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:simple-present-wh-order'], domainTags:['market'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['Where does he work?','Where he works?','Where does he works?'],
        answer:'Where does he work?',
        feedbackEn:'he → Where does he + base verb: work.', feedbackPs:'he → Where does he + اصلي فعل.' }
    ]},
    'gl.session.t36-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.simple-present-wh-light',
      titleEn:'Mini Test: WH Questions', titlePs:'ازموینه: WH پوښتنې', items:[
      { id:'gl.test.sp-wh-001', mode:'choose', topicRef:'gl.topic.simple-present-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:simple-present-wh-order'], domainTags:['school'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['What does she study?','What she studies?','What does she studies?'],
        answer:'What does she study?',
        feedbackEn:'she → What does she + base verb.', feedbackPs:'she → What does she + اصلي فعل.' },
      { id:'gl.test.sp-wh-002', mode:'transformation', topicRef:'gl.topic.simple-present-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:simple-present-wh-order'], domainTags:['daily-life'],
        promptEn:'Make a WH question: They play somewhere.', promptPs:'WH پوښتنه جوړه کړه.',
        acceptable:['where do they play'], modelAnswer:'Where do they play?',
        feedbackEn:'they → Where do they + base verb: play.', feedbackPs:'they → Where do they + اصلي فعل.' }
    ]},

    /* ── T37 Daily Routine Checkpoint ── */
    'gl.session.t37-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.daily-routine-checkpoint',
      titleEn:'Practice: Daily Routine', titlePs:'تمرین: ورځنی معمول', items:[
      { id:'gl.drill.routine-001', mode:'choose', topicRef:'gl.topic.daily-routine-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:daily-routine-simple-present','weak:third-person-s'], domainTags:['family'],
        promptEn:'My brother ___ in the market every day.', promptPs:'سم فعل وټاکه.',
        choices:['work','works','working'], answer:'works',
        feedbackEn:'my brother = he → works.', feedbackPs:'زما ورور = he → works.' },
      { id:'gl.drill.routine-002', mode:'transformation', topicRef:'gl.topic.daily-routine-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:daily-routine-simple-present','weak:does-not-base-verb'], domainTags:['home'],
        promptEn:'Make it negative: She watches TV at night.', promptPs:'منفي یې کړه.',
        acceptable:['she does not watch tv at night'],
        modelAnswer:'She does not watch TV at night.',
        feedbackEn:'she → does not + base verb: watch (no -s).', feedbackPs:'she → does not + اصلي فعل: watch.' },
      { id:'gl.drill.routine-003', mode:'choose', topicRef:'gl.topic.daily-routine-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:daily-routine-simple-present'], domainTags:['daily-life'],
        promptEn:'I ___ study at home. (frequency: always)', promptPs:'سمه جمله وټاکه.',
        choices:['I always study at home.','I study always at home.','Always I study at home.'],
        answer:'I always study at home.',
        feedbackEn:'Frequency word before the main verb: I always study.', feedbackPs:'د تکرار کلمه د اصلي فعل مخکې: I always study.' }
    ]},
    'gl.session.t37-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.daily-routine-checkpoint',
      titleEn:'Mini Test: Daily Routine', titlePs:'ازموینه: ورځنی معمول', items:[
      { id:'gl.test.routine-001', mode:'choose', topicRef:'gl.topic.daily-routine-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:daily-routine-simple-present'], domainTags:['family'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['Where does your father work?','Where your father works?','Where do your father work?'],
        answer:'Where does your father work?',
        feedbackEn:'your father = he → Where does he + base verb.', feedbackPs:'ستا پلار = he → Where does he + اصلي فعل.' },
      { id:'gl.test.routine-002', mode:'choose', topicRef:'gl.topic.daily-routine-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:daily-routine-simple-present','weak:third-person-s'], domainTags:['school'],
        promptEn:'Choose the correct sentence.', promptPs:'سمه جمله وټاکه.',
        choices:['She reads books every day.','She read books every day.','She reading books every day.'],
        answer:'She reads books every day.',
        feedbackEn:'she + habit → reads.', feedbackPs:'she + عادت → reads.' }
    ]}
  });

  /* ==========================================================================
     REFERENCE ENTRIES (5 new → 25 total)
     ========================================================================== */
  GL.registerReferenceEntries([
    { id:'gl.ref.third-person-s-simple-present', itemEn:'he/she/it + verb-s in Simple Present', levelNumber:2,
      categoryId:'gl.cat.tenses', meaningPs:'ساده اوسمهال کې له he/she/it سره فعل s اخلي. پښتو دا نه کاروي — تل یادوه.',
      exampleEn:'He reads. She works. It helps. My brother studies.',
      registerLabels:['spoken','written','exam'], weakTags:['weak:third-person-s'],
      relatedTopicRef:'gl.topic.third-person-s-basic' },
    { id:'gl.ref.have-has-basic', itemEn:'have vs has', levelNumber:2,
      categoryId:'gl.cat.tenses', meaningPs:'I/you/we/they → have. He/she/it → has.',
      exampleEn:'I have a book. She has a pen.',
      registerLabels:['spoken','written'], weakTags:['weak:have-has-basic'],
      relatedTopicRef:'gl.topic.have-has-basic' },
    { id:'gl.ref.do-not-does-not', itemEn:'do not / does not (Simple Present negative)', levelNumber:3,
      categoryId:'gl.cat.tenses', meaningPs:'I/you/we/they → do not + اصلي فعل. He/she/it → does not + اصلي فعل.',
      exampleEn:'I do not play. She does not drink. (NOT: does not drinks)',
      registerLabels:['spoken','written','exam'], weakTags:['weak:do-not-negative','weak:does-not-base-verb'],
      relatedTopicRef:'gl.topic.simple-present-negative' },
    { id:'gl.ref.do-does-questions', itemEn:'Do/Does questions (Simple Present)', levelNumber:3,
      categoryId:'gl.cat.questions-negatives', meaningPs:'Do + I/you/we/they + اصلي فعل؟ Does + he/she/it + اصلي فعل؟',
      exampleEn:'Do you speak English? Does she study? (NOT: Does she studies?)',
      registerLabels:['spoken','written','exam'], weakTags:['weak:do-does-question','weak:does-question-base-verb'],
      relatedTopicRef:'gl.topic.simple-present-yes-no-questions' },
    { id:'gl.ref.wh-do-does', itemEn:'WH + do/does questions', levelNumber:4,
      categoryId:'gl.cat.questions-negatives', meaningPs:'WH کلمه + do/does + فاعل + اصلي فعل.',
      exampleEn:'Where do you live? What does she study? Where does he work?',
      registerLabels:['spoken','written'], weakTags:['weak:simple-present-wh-order'],
      relatedTopicRef:'gl.topic.simple-present-wh-light' }
  ]);
})();
