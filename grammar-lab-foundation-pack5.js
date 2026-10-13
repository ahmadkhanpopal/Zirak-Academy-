/* ============================================================================
   grammar-lab-foundation-pack5.js — PHASE I6H
   PRESENT CONTINUOUS / NOW ACTIONS PACK (L3–L4)
   ----------------------------------------------------------------------------
   CONTENT ONLY — exact I6D–I6G pack pattern. No renderers, no new TTS,
   no new guide system, no new weak store, no second Foundation Path.
   Registers 9 topics (path order 38–46), 18 sessions (27 wizard + 18 test
   items = 45 total), and 5 reference entries through the ONE engine.

   CONTINUES Pack 4 (I6G): one additive link — gl.topic.daily-routine-
   checkpoint (pathOrder 37, nextTopics:[]) now points to topic 38.
   Packs 1–4 are untouched.

   The I6G-B Auto-Wizard automatically builds steps from these topics'
   lessonBlocks + wizardSessionId — no wizard code changes needed.

   PASHTO: fresh professional support, once per item/section, owner-reviewable.
   No Urdu / Dari / Farsi / Persian anywhere.
   ============================================================================ */
(function () {
  'use strict';
  if (!window.ZirakGrammarLab) return;
  var GL = window.ZirakGrammarLab;

  /* ── Cross-pack chain link (additive; Packs 1–4 untouched) ─────────────── */
  if (GL.topics['gl.topic.daily-routine-checkpoint'] &&
      (!GL.topics['gl.topic.daily-routine-checkpoint'].nextTopics ||
       !GL.topics['gl.topic.daily-routine-checkpoint'].nextTopics.length)) {
    GL.topics['gl.topic.daily-routine-checkpoint'].nextTopics = ['gl.topic.present-continuous-meaning'];
  }

  /* ==========================================================================
     TOPICS (9) — gl.path.foundation-1, pathOrder 38–46, L3–L4
     ========================================================================== */
  GL.registerTopics([

    { id:'gl.topic.present-continuous-meaning', pathId:'gl.path.foundation-1', pathOrder:38,
      categoryId:'gl.cat.tenses', levelNumber:3, status:'active',
      titleEn:'Present Continuous — What It Means', titlePs:'روان اوسمهال — مانا',
      shortGuideEn:'Present Continuous describes an action happening RIGHT NOW, at this moment.',
      shortGuidePs:'روان اوسمهال هغه کار بیانوي چې همدا اوس، دې وخت کې روان دی.',
      reasonEn:'Before the form, students must understand that Present Continuous is for now — not habits.',
      reasonPs:'مخکې له بڼې، زده کوونکو ته باید روښانه شي چې روان اوسمهال د همدا اوس لپاره دی — نه د عادت.',
      prerequisites:['gl.topic.simple-present-meaning','gl.topic.am-is-are'],
      nextTopics:['gl.topic.am-is-are-verb-ing'],
      weakTags:['weak:pc-meaning'],
      wizardSessionId:'gl.session.t38-wiz-001', testSessionId:'gl.session.t38-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'Present Continuous describes an action happening right now, at this very moment. It is not a habit — it is happening as we speak.',
          ps:'روان اوسمهال هغه کار بیانوي چې همدا اوس، دې شیبه کې روان دی. دا عادت نه دی — همدا اوس روان دی.' },
        { type:'examples', titleEn:'Now — Right now', items:[
          { en:'I am reading now.', ps:'زه همدا اوس لولم.', domain:'school' },
          { en:'She is writing now.', ps:'هغه همدا اوس لیکي.', domain:'school' },
          { en:'They are playing now.', ps:'هغوی همدا اوس لوبې کوي.', domain:'daily life' },
          { en:'It is raining now.', ps:'همدا اوس باران اوري.', domain:'daily life' }
        ]},
        { type:'note',
          en:'Signal words for Present Continuous: now, right now, at the moment, at this time, look!, listen!',
          ps:'د روان اوسمهال د پیژندلو کلمې: now, right now, at the moment, look!, listen!' },
        { type:'commonMistake', wrongEn:'I study English now.', rightEn:'I am studying English now.',
          noteEn:'When something is happening right now, use Present Continuous, not Simple Present.',
          notePs:'کله چې کار همدا اوس روان وي، روان اوسمهال وکاروه، نه ساده اوسمهال.' }
      ]},

    { id:'gl.topic.am-is-are-verb-ing', pathId:'gl.path.foundation-1', pathOrder:39,
      categoryId:'gl.cat.tenses', levelNumber:3, status:'active',
      titleEn:'am / is / are + verb-ing', titlePs:'am / is / are + د فعل -ing بڼه',
      shortGuideEn:'The form of Present Continuous: Subject + am/is/are + verb + ing.',
      shortGuidePs:'د روان اوسمهال بڼه: فاعل + am/is/are + فعل + ing.',
      reasonEn:'This is the core form students must master before spelling and negative rules.',
      reasonPs:'دا هغه بنسټیزه بڼه ده چې زده کوونکي باید مخکې له ld spelling او منفي قاعدې مستر کړي.',
      prerequisites:['gl.topic.present-continuous-meaning'],
      nextTopics:['gl.topic.ing-spelling'],
      weakTags:['weak:pc-form-am-is-are-ing'],
      wizardSessionId:'gl.session.t39-wiz-001', testSessionId:'gl.session.t39-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'Present Continuous pattern', rows:[
          { en:'Subject + am / is / are + verb + ing', ps:'فاعل + am/is/are + فعل + ing' },
          { en:'I am reading.', ps:'زه لولم (همدا اوس).' },
          { en:'She is writing.', ps:'هغه لیکي (همدا اوس).' },
          { en:'They are playing.', ps:'هغوی لوبې کوي (همدا اوس).' }
        ]},
        { type:'examples', items:[
          { en:'I am reading a book.', ps:'زه یو کتاب لولم.', domain:'school' },
          { en:'She is writing a letter.', ps:'هغه یوه لیک لیکي.', domain:'home' },
          { en:'We are learning English.', ps:'موږ انګلیسي زده کوو.', domain:'class' },
          { en:'He is sleeping.', ps:'هغه ویده دی.', domain:'home' }
        ]},
        { type:'commonMistake', wrongEn:'She are reading.', rightEn:'She is reading.',
          noteEn:'he/she/it → is (never are).',
          notePs:'له he/she/it سره is راځي، نه are.' }
      ]},

    { id:'gl.topic.ing-spelling', pathId:'gl.path.foundation-1', pathOrder:40,
      categoryId:'gl.cat.tenses', levelNumber:3, status:'active',
      titleEn:'Spelling: Making -ing', titlePs:'د -ing جوړولو املا',
      shortGuideEn:'Most verbs add -ing. Verbs ending in e drop the e. Short vowel + consonant: double the last letter.',
      shortGuidePs:'ډیری فعلونه -ing اخلي. د e پر پای فعلونه e لرې کوي. لنډ مصوت + مصمت: وروستی توری دوه ګرځوه.',
      reasonEn:'Spelling mistakes in -ing forms are very common for Pashto-speaking learners.',
      reasonPs:'د -ing بڼه کې د املا تېروتنې د پښتو ویونکو لپاره ډیرې عامې دي.',
      prerequisites:['gl.topic.am-is-are-verb-ing'],
      nextTopics:['gl.topic.pc-all-pronouns'],
      weakTags:['weak:pc-ing-spelling'],
      wizardSessionId:'gl.session.t40-wiz-001', testSessionId:'gl.session.t40-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'Three -ing spelling rules', rows:[
          { en:'most verbs → + ing', ps:'read→reading, play→playing, study→studying' },
          { en:'ends in e → drop e + ing', ps:'write→writing, make→making, come→coming' },
          { en:'short vowel + consonant → double + ing', ps:'run→running, sit→sitting, swim→swimming' }
        ]},
        { type:'examples', items:[
          { en:'read → reading', ps:'لوستل ← لوستنه', domain:'school' },
          { en:'write → writing', ps:'لیکل ← لیکنه', domain:'school' },
          { en:'run → running', ps:'منډه وهل ← منډه وهنه', domain:'daily life' },
          { en:'sit → sitting', ps:'ناستل ← ناستنه', domain:'class' }
        ]},
        { type:'commonMistake', wrongEn:'She is makeing a cake.', rightEn:'She is making a cake.',
          noteEn:'make ends in e — drop e before adding -ing: making.',
          notePs:'make پر e پای ته رسیږي — د -ing مخکې e لرې کوو: making.' },
        { type:'commonMistake', wrongEn:'He is runing.', rightEn:'He is running.',
          noteEn:'run is short vowel + n — double the n: running.',
          notePs:'run لنډ مصوت + n لري — n دوه ګرځوو: running.' }
      ]},

    { id:'gl.topic.pc-all-pronouns', pathId:'gl.path.foundation-1', pathOrder:41,
      categoryId:'gl.cat.tenses', levelNumber:3, status:'active',
      titleEn:'Present Continuous — All Pronouns', titlePs:'روان اوسمهال — ټول ضمیرونه',
      shortGuideEn:'The full Present Continuous table: I am, you are, he/she/it is, we are, they are + verb-ing.',
      shortGuidePs:'د روان اوسمهال بشپړ جدول: I am, you are, he/she/it is, we are, they are + verb-ing.',
      reasonEn:'Students need to control the full Present Continuous table before negatives and questions.',
      reasonPs:'زده کوونکو ته د منفي او پوښتنو مخکې بشپړ جدول باید راتلل اسانه وي.',
      prerequisites:['gl.topic.am-is-are-verb-ing','gl.topic.ing-spelling'],
      nextTopics:['gl.topic.pc-negative'],
      weakTags:['weak:pc-affirmative-all'],
      wizardSessionId:'gl.session.t41-wiz-001', testSessionId:'gl.session.t41-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'Full Present Continuous table', rows:[
          { en:'I am reading.', ps:'زه لولم.' },
          { en:'You are studying.', ps:'ته لولې.' },
          { en:'He is working.', ps:'هغه کار کوي.' },
          { en:'She is cooking.', ps:'هغه پخوي.' },
          { en:'It is raining.', ps:'باران اوري.' },
          { en:'We are playing.', ps:'موږ لوبې کوو.' },
          { en:'They are learning.', ps:'هغوی زده کوي.' }
        ]},
        { type:'examples', items:[
          { en:'My father is resting.', ps:'زما پلار آرام کوي.', domain:'home' },
          { en:'My sister is cooking.', ps:'زما خور پخوي.', domain:'home' },
          { en:'The students are writing.', ps:'زده کوونکي لیکي.', domain:'class' },
          { en:'The baby is sleeping.', ps:'ماشوم ویده دی.', domain:'home' }
        ]},
        { type:'commonMistake', wrongEn:'They is playing.', rightEn:'They are playing.',
          noteEn:'they → are, always.',
          notePs:'له they سره تل are راځي.' }
      ]},

    { id:'gl.topic.pc-negative', pathId:'gl.path.foundation-1', pathOrder:42,
      categoryId:'gl.cat.tenses', levelNumber:3, status:'active',
      titleEn:'Present Continuous Negative', titlePs:'د روان اوسمهال منفي',
      shortGuideEn:'Add not after am / is / are: I am not sleeping. She is not reading.',
      shortGuidePs:'د am/is/are وروسته not ورزیاتوه: I am not sleeping. She is not reading.',
      reasonEn:'Negatives let students say what is NOT happening right now.',
      reasonPs:'منفي جملې زده کوونکو ته اجازه ورکوي ووایي چې همدا اوس څه نه کیږي.',
      prerequisites:['gl.topic.pc-all-pronouns'],
      nextTopics:['gl.topic.pc-yes-no-questions'],
      weakTags:['weak:pc-negative'],
      wizardSessionId:'gl.session.t42-wiz-001', testSessionId:'gl.session.t42-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'Negative pattern', rows:[
          { en:'Subject + am / is / are + not + verb-ing', ps:'فاعل + am/is/are + not + verb-ing' },
          { en:'I am not sleeping.', ps:'زه ویده نه یم.' },
          { en:'She is not reading.', ps:'هغه نه لولي.' },
          { en:'They are not working.', ps:'هغوی کار نه کوي.' }
        ]},
        { type:'examples', items:[
          { en:'He is not eating.', ps:'هغه نه خوري.', domain:'home' },
          { en:'I am not watching TV.', ps:'زه ټلویزیون نه ګورم.', domain:'home' },
          { en:'We are not playing.', ps:'موږ لوبې نه کوو.', domain:'daily life' },
          { en:'She is not crying.', ps:'هغه نه ژاړي.', domain:'home' }
        ]},
        { type:'note',
          en:'Short forms is not → isn\'t, are not → aren\'t are common in spoken English. Come in a later lesson.',
          ps:'لنډې بڼې isn\'t او aren\'t ویناییز انګلیسي کې عام دي. وروسته راځي.' },
        { type:'commonMistake', wrongEn:'She is not plays.', rightEn:'She is not playing.',
          noteEn:'After is not, the verb takes -ing, not the Simple Present form.',
          notePs:'د is not وروسته فعل -ing اخلي، نه ساده اوسمهال بڼه.' }
      ]},

    { id:'gl.topic.pc-yes-no-questions', pathId:'gl.path.foundation-1', pathOrder:43,
      categoryId:'gl.cat.questions-negatives', levelNumber:4, status:'active',
      titleEn:'Present Continuous Yes/No Questions', titlePs:'د روان اوسمهال هو/نه پوښتنې',
      shortGuideEn:'Move am/is/are to the front: Is she reading? Are they playing?',
      shortGuidePs:'am/is/are جملې سر ته راوړه: Is she reading? Are they playing?',
      reasonEn:'Yes/no questions are essential for checking what someone is doing right now.',
      reasonPs:'د هو/نه پوښتنې د دې لپاره اړین دي چې وپوښتو چا همدا اوس څه کوي.',
      prerequisites:['gl.topic.pc-negative','gl.topic.be-questions'],
      nextTopics:['gl.topic.pc-wh-light'],
      weakTags:['weak:pc-question'],
      wizardSessionId:'gl.session.t43-wiz-001', testSessionId:'gl.session.t43-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'Question pattern', rows:[
          { en:'Am / Is / Are + subject + verb-ing?', ps:'Am/Is/Are + فاعل + verb-ing؟' },
          { en:'Is she reading? — Yes, she is. / No, she is not.' },
          { en:'Are they playing? — Yes, they are. / No, they are not.' }
        ]},
        { type:'examples', items:[
          { en:'Am I speaking too fast?', ps:'ایا زه ډیر ګړندی خبرې کوم؟', domain:'class' },
          { en:'Are you listening?', ps:'ایا ته اورې؟', domain:'class' },
          { en:'Is he sleeping?', ps:'ایا هغه ویده دی؟', domain:'home' },
          { en:'Are they working?', ps:'ایا هغوی کار کوي؟', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'She is reading?', rightEn:'Is she reading?',
          noteEn:'In English, move is to the front to make a question.',
          notePs:'پوښتنې لپاره is سر ته ځي.' }
      ]},

    { id:'gl.topic.pc-wh-light', pathId:'gl.path.foundation-1', pathOrder:44,
      categoryId:'gl.cat.questions-negatives', levelNumber:4, status:'active',
      titleEn:'Present Continuous WH Questions', titlePs:'د روان اوسمهال WH پوښتنې',
      shortGuideEn:'What are you doing? Where is he going? WH + am/is/are + subject + verb-ing.',
      shortGuidePs:'WH + am/is/are + فاعل + verb-ing: What are you doing? Where is he going?',
      reasonEn:'WH questions complete the Present Continuous system for real daily conversation.',
      reasonPs:'WH پوښتنې د ریښتیني ورځني خبرو لپاره روان اوسمهال سیستم بشپړوي.',
      prerequisites:['gl.topic.pc-yes-no-questions'],
      nextTopics:['gl.topic.sp-vs-pc-intro'],
      weakTags:['weak:pc-wh-question'],
      wizardSessionId:'gl.session.t44-wiz-001', testSessionId:'gl.session.t44-test-001',
      lessonBlocks:[
        { type:'formula', titleEn:'WH question pattern', rows:[
          { en:'WH word + am/is/are + subject + verb-ing?', ps:'WH کلمه + am/is/are + فاعل + verb-ing؟' },
          { en:'What are you doing?', ps:'ته څه کوې؟' },
          { en:'Where is he going?', ps:'هغه چیرته ځي؟' },
          { en:'What is she reading?', ps:'هغه څه لولي؟' }
        ]},
        { type:'examples', items:[
          { en:'What are you doing?', ps:'ته همدا اوس څه کوې؟', domain:'daily life' },
          { en:'Where are they going?', ps:'هغوی چیرته ځي؟', domain:'daily life' },
          { en:'What is she cooking?', ps:'هغه څه پخوي؟', domain:'home' },
          { en:'Why is he crying?', ps:'هغه ولې ژاړي؟', domain:'home' }
        ]},
        { type:'commonMistake', wrongEn:'What you are doing?', rightEn:'What are you doing?',
          noteEn:'WH word + are + you. Never: WH + you + are.',
          notePs:'WH + are + you. هېڅکله WH + you + are نه.' }
      ]},

    { id:'gl.topic.sp-vs-pc-intro', pathId:'gl.path.foundation-1', pathOrder:45,
      categoryId:'gl.cat.tenses', levelNumber:4, status:'active',
      titleEn:'Simple Present vs Present Continuous', titlePs:'ساده اوسمهال له روان اوسمهال سره',
      shortGuideEn:'Simple Present = habit/routine. Present Continuous = happening right now.',
      shortGuidePs:'ساده اوسمهال = عادت/معمول. روان اوسمهال = همدا اوس روان دی.',
      reasonEn:'This is the single most important distinction for Afghan learners before I6I.',
      reasonPs:'دا د I6I مخکې د افغان زده کوونکو لپاره تر ټولو مهم توپیر دی.',
      prerequisites:['gl.topic.simple-present-meaning','gl.topic.pc-all-pronouns'],
      nextTopics:['gl.topic.now-actions-checkpoint'],
      weakTags:['weak:sp-vs-pc'],
      wizardSessionId:'gl.session.t45-wiz-001', testSessionId:'gl.session.t45-test-001',
      referenceEntries:['gl.ref.sp-vs-pc'],
      lessonBlocks:[
        { type:'formula', titleEn:'The key difference', rows:[
          { en:'Simple Present → habit / routine / fact', ps:'ساده اوسمهال → عادت / معمول / حقیقت' },
          { en:'Present Continuous → happening right now', ps:'روان اوسمهال → همدا اوس روان' },
          { en:'Signal words: always, usually, every day, never → Simple Present' },
          { en:'Signal words: now, right now, at the moment, look! → Present Continuous' }
        ]},
        { type:'examples', items:[
          { en:'I pray every day. (habit)', ps:'زه هره ورځ لمونځ کوم. (عادت)', domain:'daily life' },
          { en:'I am praying now. (right now)', ps:'زه همدا اوس لمونځ کوم. (همدا اوس)', domain:'daily life' },
          { en:'She reads books every week. (habit)', ps:'هغه هره اونۍ کتابونه لولي. (عادت)', domain:'school' },
          { en:'She is reading a book now. (right now)', ps:'هغه همدا اوس یو کتاب لولي. (همدا اوس)', domain:'school' }
        ]},
        { type:'commonMistake', wrongEn:'I am going to school every day.', rightEn:'I go to school every day.',
          noteEn:'A daily habit uses Simple Present, not Present Continuous.',
          notePs:'ورځني عادت ساده اوسمهال کاروي، نه روان اوسمهال.' }
      ]},

    { id:'gl.topic.now-actions-checkpoint', pathId:'gl.path.foundation-1', pathOrder:46,
      categoryId:'gl.cat.tenses', levelNumber:4, status:'active',
      titleEn:'Now Actions Checkpoint', titlePs:'د همدا اوس کارونو چیک پوسته',
      shortGuideEn:'Mix it all: form, spelling, negative, questions, and habit vs now.',
      shortGuidePs:'هرڅه ګډ کړه: بڼه، املا، منفي، پوښتنې، عادت او همدا اوس.',
      reasonEn:'This checkpoint seals Present Continuous before I6I adds prepositions and place.',
      reasonPs:'دا چیک پوسته روان اوسمهال بشپړوي مخکې له I6I سربلونو او ځای.',
      prerequisites:['gl.topic.sp-vs-pc-intro','gl.topic.pc-wh-light'],
      nextTopics:[],
      weakTags:['weak:pc-checkpoint','weak:sp-vs-pc'],
      wizardSessionId:'gl.session.t46-wiz-001', testSessionId:'gl.session.t46-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'Now put Present Continuous together. Use the signal words: now = continuous. Every day = simple present.',
          ps:'اوس روان اوسمهال یوځای کړه. د نښلوونکو کلمو ته ځیر شه: now = روان. every day = ساده.' },
        { type:'examples', items:[
          { en:'She is not listening.', ps:'هغه نه اوري.', domain:'class' },
          { en:'Are they playing football?', ps:'ایا هغوی فوټبال کوي؟', domain:'daily life' },
          { en:'What is he reading?', ps:'هغه څه لولي؟', domain:'school' },
          { en:'I study every day. I am studying now.', ps:'زه هره ورځ لولم. زه همدا اوس لولم.', domain:'school' },
          { en:'Where are they going?', ps:'هغوی چیرته ځي؟', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'Are he reading?', rightEn:'Is he reading?',
          noteEn:'he → is. Questions: Is he reading?',
          notePs:'له he سره Is راځي: Is he reading?' }
      ]}
  ]);

  /* ==========================================================================
     SESSIONS — 3 wizard + 2 test per topic = 27 wizard + 18 test = 45 total
     ========================================================================== */
  GL.registerSessions({

    /* ── T38 Present Continuous Meaning ── */
    'gl.session.t38-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.present-continuous-meaning',
      titleEn:'Practice: What is Present Continuous?', titlePs:'تمرین: روان اوسمهال مانا', items:[
      { id:'gl.drill.pc-meaning-001', mode:'choose', topicRef:'gl.topic.present-continuous-meaning',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-meaning'], domainTags:['school'],
        promptEn:'Choose the Present Continuous sentence.', promptPs:'روان اوسمهال جمله وټاکه.',
        choices:['I study every day.','I am studying now.','I studied yesterday.'],
        answer:'I am studying now.',
        feedbackEn:'Right now + am studying = Present Continuous.', feedbackPs:'همدا اوس + am studying = روان اوسمهال.' },
      { id:'gl.drill.pc-meaning-002', mode:'choose', topicRef:'gl.topic.present-continuous-meaning',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-meaning'], domainTags:['daily-life'],
        promptEn:'I am praying now. This describes a...', promptPs:'دا د کوم ډول عمل توصیف کوي؟',
        choices:['habit','action right now','past action'],
        answer:'action right now',
        feedbackEn:'Present Continuous = action happening right now.', feedbackPs:'روان اوسمهال = همدا اوس روان کار.' },
      { id:'gl.drill.pc-meaning-003', mode:'repeat', topicRef:'gl.topic.present-continuous-meaning',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-meaning'], domainTags:['school'],
        promptEn:'She is writing a letter now.', promptPs:'هغه همدا اوس یوه لیک لیکي.',
        instructionEn:'Hear the sentence, then say it aloud clearly.',
        feedbackEn:'Good. is writing = happening right now.', feedbackPs:'ښه. is writing = همدا اوس روان دی.' }
    ]},
    'gl.session.t38-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.present-continuous-meaning',
      titleEn:'Mini Test: PC Meaning', titlePs:'ازموینه: روان اوسمهال مانا', items:[
      { id:'gl.test.pc-meaning-001', mode:'choose', topicRef:'gl.topic.present-continuous-meaning',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-meaning'], domainTags:['home'],
        promptEn:'Which sentence means something is happening right now?', promptPs:'کومه جمله همدا اوس روان کار ښیي؟',
        choices:['She cooks every day.','She is cooking now.','She cooked yesterday.'],
        answer:'She is cooking now.',
        feedbackEn:'She is cooking now = happening at this moment.', feedbackPs:'همدا اوس روان: She is cooking now.' },
      { id:'gl.test.pc-meaning-002', mode:'choose', topicRef:'gl.topic.present-continuous-meaning',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-meaning'], domainTags:['daily-life'],
        promptEn:'Choose the correct signal word for Present Continuous.', promptPs:'د روان اوسمهال سم نښلوونکی وټاکه.',
        choices:['every day','now','yesterday'],
        answer:'now',
        feedbackEn:'now = Present Continuous.', feedbackPs:'now = روان اوسمهال.' }
    ]},

    /* ── T39 am/is/are + verb-ing ── */
    'gl.session.t39-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.am-is-are-verb-ing',
      titleEn:'Practice: am/is/are + ing', titlePs:'تمرین: am/is/are + ing', items:[
      { id:'gl.drill.pc-form-001', mode:'fillBlank', topicRef:'gl.topic.am-is-are-verb-ing',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-form-am-is-are-ing'], domainTags:['school'],
        promptEn:'She ___ writing a letter.', promptPs:'تشه ډکه کړه.',
        acceptable:['is'],
        feedbackEn:'she → is: She is writing.', feedbackPs:'له she سره is راځي.' },
      { id:'gl.drill.pc-form-002', mode:'choose', topicRef:'gl.topic.am-is-are-verb-ing',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-form-am-is-are-ing'], domainTags:['class'],
        promptEn:'Choose the correct sentence.', promptPs:'سمه جمله وټاکه.',
        choices:['He is reading.','He are reading.','He am reading.'],
        answer:'He is reading.',
        feedbackEn:'he → is: He is reading.', feedbackPs:'له he سره is راځي.' },
      { id:'gl.drill.pc-form-003', mode:'correction', topicRef:'gl.topic.am-is-are-verb-ing',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-form-am-is-are-ing'], domainTags:['home'],
        wrongSentence:'They is sleeping.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['they are sleeping'], modelAnswer:'They are sleeping.',
        feedbackEn:'they → are: They are sleeping.', feedbackPs:'له they سره are راځي.' }
    ]},
    'gl.session.t39-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.am-is-are-verb-ing',
      titleEn:'Mini Test: am/is/are + ing', titlePs:'ازموینه: am/is/are + ing', items:[
      { id:'gl.test.pc-form-001', mode:'fillBlank', topicRef:'gl.topic.am-is-are-verb-ing',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-form-am-is-are-ing'], domainTags:['daily-life'],
        promptEn:'They ___ playing football.', promptPs:'تشه ډکه کړه.',
        acceptable:['are'],
        feedbackEn:'they → are: They are playing.', feedbackPs:'له they سره are.' },
      { id:'gl.test.pc-form-002', mode:'choose', topicRef:'gl.topic.am-is-are-verb-ing',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-form-am-is-are-ing'], domainTags:['class'],
        promptEn:'Choose the correct sentence.', promptPs:'سمه جمله وټاکه.',
        choices:['I am studying.','I is studying.','I are studying.'],
        answer:'I am studying.',
        feedbackEn:'I → am: I am studying.', feedbackPs:'له I سره تل am راځي.' }
    ]},

    /* ── T40 -ing Spelling ── */
    'gl.session.t40-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.ing-spelling',
      titleEn:'Practice: -ing Spelling', titlePs:'تمرین: د -ing املا', items:[
      { id:'gl.drill.ing-spell-001', mode:'fillBlank', topicRef:'gl.topic.ing-spelling',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-ing-spelling'], domainTags:['school'],
        promptEn:'She is ___ a letter. (write)', promptPs:'تشه ډکه کړه.',
        acceptable:['writing'],
        feedbackEn:'write → drop e + ing: writing.', feedbackPs:'write → e لرې کوو + ing: writing.' },
      { id:'gl.drill.ing-spell-002', mode:'choose', topicRef:'gl.topic.ing-spelling',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-ing-spelling'], domainTags:['daily-life'],
        promptEn:'run → ?', promptPs:'سمه -ing بڼه وټاکه.',
        choices:['runing','running','runeing'],
        answer:'running',
        feedbackEn:'run: short vowel + n → double n: running.', feedbackPs:'run: لنډ مصوت + n → n دوه ګرځوو: running.' },
      { id:'gl.drill.ing-spell-003', mode:'correction', topicRef:'gl.topic.ing-spelling',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-ing-spelling'], domainTags:['school'],
        wrongSentence:'He is makeing a cake.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['he is making a cake'], modelAnswer:'He is making a cake.',
        feedbackEn:'make → drop e + ing: making.', feedbackPs:'make → e لرې کوو + ing: making.' }
    ]},
    'gl.session.t40-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.ing-spelling',
      titleEn:'Mini Test: -ing Spelling', titlePs:'ازموینه: د -ing املا', items:[
      { id:'gl.test.ing-spell-001', mode:'choose', topicRef:'gl.topic.ing-spelling',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-ing-spelling'], domainTags:['class'],
        promptEn:'sit → ?', promptPs:'سمه -ing بڼه وټاکه.',
        choices:['siting','sitting','siteing'],
        answer:'sitting',
        feedbackEn:'sit: short vowel + t → double t: sitting.', feedbackPs:'sit → t دوه ګرځوو: sitting.' },
      { id:'gl.test.ing-spell-002', mode:'fillBlank', topicRef:'gl.topic.ing-spelling',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-ing-spelling'], domainTags:['school'],
        promptEn:'They are ___ English. (study)', promptPs:'تشه ډکه کړه.',
        acceptable:['studying'],
        feedbackEn:'study → studying (y stays: no drop-e rule).', feedbackPs:'study → studying.' }
    ]},

    /* ── T41 PC All Pronouns ── */
    'gl.session.t41-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.pc-all-pronouns',
      titleEn:'Practice: Full PC Table', titlePs:'تمرین: بشپړ جدول', items:[
      { id:'gl.drill.pc-all-001', mode:'fillBlank', topicRef:'gl.topic.pc-all-pronouns',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-affirmative-all'], domainTags:['home'],
        promptEn:'He ___ resting.', promptPs:'تشه ډکه کړه.',
        acceptable:['is'],
        feedbackEn:'he → is: He is resting.', feedbackPs:'له he سره is.' },
      { id:'gl.drill.pc-all-002', mode:'fillBlank', topicRef:'gl.topic.pc-all-pronouns',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-affirmative-all'], domainTags:['class'],
        promptEn:'We ___ learning English.', promptPs:'تشه ډکه کړه.',
        acceptable:['are'],
        feedbackEn:'we → are: We are learning.', feedbackPs:'له we سره are.' },
      { id:'gl.drill.pc-all-003', mode:'repeat', topicRef:'gl.topic.pc-all-pronouns',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-affirmative-all'], domainTags:['home'],
        promptEn:'The baby is sleeping.', promptPs:'ماشوم ویده دی.',
        instructionEn:'Hear the sentence, then say it clearly.',
        feedbackEn:'Good. baby = he/she/it → is sleeping.', feedbackPs:'ښه. ماشوم → is sleeping.' }
    ]},
    'gl.session.t41-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.pc-all-pronouns',
      titleEn:'Mini Test: Full PC Table', titlePs:'ازموینه: بشپړ جدول', items:[
      { id:'gl.test.pc-all-001', mode:'choose', topicRef:'gl.topic.pc-all-pronouns',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-affirmative-all'], domainTags:['daily-life'],
        promptEn:'It ___ raining.', promptPs:'سم فعل وټاکه.',
        choices:['is','are','am'],
        answer:'is',
        feedbackEn:'it → is: It is raining.', feedbackPs:'له it سره is.' },
      { id:'gl.test.pc-all-002', mode:'fillBlank', topicRef:'gl.topic.pc-all-pronouns',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-affirmative-all'], domainTags:['class'],
        promptEn:'I ___ listening to the teacher.', promptPs:'تشه ډکه کړه.',
        acceptable:['am'],
        feedbackEn:'I → am: I am listening.', feedbackPs:'له I سره am.' }
    ]},

    /* ── T42 PC Negative ── */
    'gl.session.t42-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.pc-negative',
      titleEn:'Practice: PC Negative', titlePs:'تمرین: روان اوسمهال منفي', items:[
      { id:'gl.drill.pc-neg-001', mode:'transformation', topicRef:'gl.topic.pc-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-negative'], domainTags:['home'],
        promptEn:'Make it negative: He is eating.', promptPs:'منفي یې کړه.',
        acceptable:['he is not eating'], modelAnswer:'He is not eating.',
        feedbackEn:'is → is not: He is not eating.', feedbackPs:'is → is not راځي.' },
      { id:'gl.drill.pc-neg-002', mode:'choose', topicRef:'gl.topic.pc-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-negative'], domainTags:['daily-life'],
        promptEn:'She ___ crying.', promptPs:'منفي بڼه وټاکه.',
        choices:['is not','not is','are not'],
        answer:'is not',
        feedbackEn:'she → is not: She is not crying.', feedbackPs:'له she سره is not.' },
      { id:'gl.drill.pc-neg-003', mode:'correction', topicRef:'gl.topic.pc-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-negative'], domainTags:['school'],
        wrongSentence:'They are not plays.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['they are not playing'], modelAnswer:'They are not playing.',
        feedbackEn:'After are not, use verb + ing: playing.', feedbackPs:'د are not وروسته verb + ing.' }
    ]},
    'gl.session.t42-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.pc-negative',
      titleEn:'Mini Test: PC Negative', titlePs:'ازموینه: روان اوسمهال منفي', items:[
      { id:'gl.test.pc-neg-001', mode:'transformation', topicRef:'gl.topic.pc-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-negative'], domainTags:['home'],
        promptEn:'Make it negative: I am watching TV.', promptPs:'منفي یې کړه.',
        acceptable:['i am not watching tv'], modelAnswer:'I am not watching TV.',
        feedbackEn:'am → am not: I am not watching TV.', feedbackPs:'am → am not.' },
      { id:'gl.test.pc-neg-002', mode:'choose', topicRef:'gl.topic.pc-negative',
        categoryId:'gl.cat.tenses', levelNumber:3, weakTags:['weak:pc-negative'], domainTags:['class'],
        promptEn:'Choose the correct negative.', promptPs:'سمه منفي بڼه وټاکه.',
        choices:['He is not sleeping.','He not is sleeping.','He are not sleeping.'],
        answer:'He is not sleeping.',
        feedbackEn:'he → is not: He is not sleeping.', feedbackPs:'له he سره is not.' }
    ]},

    /* ── T43 PC Yes/No Questions ── */
    'gl.session.t43-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.pc-yes-no-questions',
      titleEn:'Practice: PC Yes/No Questions', titlePs:'تمرین: روان اوسمهال پوښتنې', items:[
      { id:'gl.drill.pc-yn-001', mode:'transformation', topicRef:'gl.topic.pc-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-question'], domainTags:['class'],
        promptEn:'Make a question: She is listening.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['is she listening'], modelAnswer:'Is she listening?',
        feedbackEn:'Move is to the front: Is she listening?', feedbackPs:'is سر ته یوسه: Is she listening?' },
      { id:'gl.drill.pc-yn-002', mode:'choose', topicRef:'gl.topic.pc-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-question'], domainTags:['daily-life'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['Are they playing?','They are playing?','Do they playing?'],
        answer:'Are they playing?',
        feedbackEn:'Move are to the front: Are they playing?', feedbackPs:'are سر ته یوسه.' },
      { id:'gl.drill.pc-yn-003', mode:'choose', topicRef:'gl.topic.pc-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-question'], domainTags:['home'],
        promptEn:'Is he sleeping? — Yes, ___', promptPs:'سم لنډ ځواب وټاکه.',
        choices:['he is','he are','he am'],
        answer:'he is',
        feedbackEn:'Yes, he is.', feedbackPs:'هو، دی.' }
    ]},
    'gl.session.t43-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.pc-yes-no-questions',
      titleEn:'Mini Test: PC Yes/No Questions', titlePs:'ازموینه: روان اوسمهال پوښتنې', items:[
      { id:'gl.test.pc-yn-001', mode:'transformation', topicRef:'gl.topic.pc-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-question'], domainTags:['daily-life'],
        promptEn:'Make a question: They are working.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['are they working'], modelAnswer:'Are they working?',
        feedbackEn:'Move are to the front: Are they working?', feedbackPs:'are سر ته.' },
      { id:'gl.test.pc-yn-002', mode:'choose', topicRef:'gl.topic.pc-yes-no-questions',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-question'], domainTags:['class'],
        promptEn:'___ you listening?', promptPs:'سم فعل وټاکه.',
        choices:['Are','Is','Am'],
        answer:'Are',
        feedbackEn:'you → Are: Are you listening?', feedbackPs:'له you سره Are.' }
    ]},

    /* ── T44 PC WH Questions ── */
    'gl.session.t44-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.pc-wh-light',
      titleEn:'Practice: PC WH Questions', titlePs:'تمرین: د روان اوسمهال WH پوښتنې', items:[
      { id:'gl.drill.pc-wh-001', mode:'choose', topicRef:'gl.topic.pc-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-wh-question'], domainTags:['daily-life'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['What are you doing?','What you are doing?','What do you doing?'],
        answer:'What are you doing?',
        feedbackEn:'WH + are + you + doing: What are you doing?', feedbackPs:'WH + are + you + doing.' },
      { id:'gl.drill.pc-wh-002', mode:'transformation', topicRef:'gl.topic.pc-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-wh-question'], domainTags:['school'],
        promptEn:'Make a WH question: She is doing something.', promptPs:'WH پوښتنه جوړه کړه.',
        acceptable:['what is she doing'], modelAnswer:'What is she doing?',
        feedbackEn:'What + is + she + doing: What is she doing?', feedbackPs:'What + is + she + doing.' },
      { id:'gl.drill.pc-wh-003', mode:'choose', topicRef:'gl.topic.pc-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-wh-question'], domainTags:['home'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['Where are they going?','Where they are going?','Where do they going?'],
        answer:'Where are they going?',
        feedbackEn:'WH + are + they + going: Where are they going?', feedbackPs:'WH + are + they + going.' }
    ]},
    'gl.session.t44-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.pc-wh-light',
      titleEn:'Mini Test: PC WH Questions', titlePs:'ازموینه: WH پوښتنې', items:[
      { id:'gl.test.pc-wh-001', mode:'choose', topicRef:'gl.topic.pc-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-wh-question'], domainTags:['school'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['What is he reading?','What he is reading?','What does he reading?'],
        answer:'What is he reading?',
        feedbackEn:'What + is + he + reading.', feedbackPs:'What + is + he + reading.' },
      { id:'gl.test.pc-wh-002', mode:'transformation', topicRef:'gl.topic.pc-wh-light',
        categoryId:'gl.cat.questions-negatives', levelNumber:4, weakTags:['weak:pc-wh-question'], domainTags:['home'],
        promptEn:'Make a WH question: She is cooking something.', promptPs:'WH پوښتنه جوړه کړه.',
        acceptable:['what is she cooking'], modelAnswer:'What is she cooking?',
        feedbackEn:'What + is + she + cooking.', feedbackPs:'What + is + she + cooking.' }
    ]},

    /* ── T45 SP vs PC Intro ── */
    'gl.session.t45-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.sp-vs-pc-intro',
      titleEn:'Practice: Simple Present vs Present Continuous', titlePs:'تمرین: ساده له روان سره', items:[
      { id:'gl.drill.sp-pc-001', mode:'choose', topicRef:'gl.topic.sp-vs-pc-intro',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:sp-vs-pc'], domainTags:['daily-life'],
        promptEn:'Which is Simple Present (habit)?', promptPs:'کومه ساده اوسمهال (عادت) ده؟',
        choices:['I am praying now.','I pray every day.','I prayed yesterday.'],
        answer:'I pray every day.',
        feedbackEn:'Every day = habit = Simple Present.', feedbackPs:'هره ورځ = عادت = ساده اوسمهال.' },
      { id:'gl.drill.sp-pc-002', mode:'choose', topicRef:'gl.topic.sp-vs-pc-intro',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:sp-vs-pc'], domainTags:['school'],
        promptEn:'Which is Present Continuous (right now)?', promptPs:'کومه روان اوسمهال (همدا اوس) ده؟',
        choices:['She reads books every week.','She is reading a book now.','She read a book yesterday.'],
        answer:'She is reading a book now.',
        feedbackEn:'Right now = Present Continuous.', feedbackPs:'همدا اوس = روان اوسمهال.' },
      { id:'gl.drill.sp-pc-003', mode:'choose', topicRef:'gl.topic.sp-vs-pc-intro',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:sp-vs-pc'], domainTags:['daily-life'],
        promptEn:'I ___ to school every day.', promptPs:'سم فعل وټاکه (عادت).',
        choices:['go','am going'],
        answer:'go',
        feedbackEn:'Every day = habit = Simple Present: I go.', feedbackPs:'هره ورځ = عادت = ساده اوسمهال: I go.' }
    ]},
    'gl.session.t45-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.sp-vs-pc-intro',
      titleEn:'Mini Test: SP vs PC', titlePs:'ازموینه: ساده له روان سره', items:[
      { id:'gl.test.sp-pc-001', mode:'choose', topicRef:'gl.topic.sp-vs-pc-intro',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:sp-vs-pc'], domainTags:['school'],
        promptEn:'I ___ English every day. (habit)', promptPs:'سم فعل وټاکه.',
        choices:['study','am studying'],
        answer:'study',
        feedbackEn:'Every day = habit = study (Simple Present).', feedbackPs:'هره ورځ = عادت = study.' },
      { id:'gl.test.sp-pc-002', mode:'choose', topicRef:'gl.topic.sp-vs-pc-intro',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:sp-vs-pc'], domainTags:['home'],
        promptEn:'She ___ right now. (happening now)', promptPs:'سم فعل وټاکه.',
        choices:['is sleeping','sleeps'],
        answer:'is sleeping',
        feedbackEn:'Right now = Present Continuous: is sleeping.', feedbackPs:'همدا اوس = روان اوسمهال: is sleeping.' }
    ]},

    /* ── T46 Now Actions Checkpoint ── */
    'gl.session.t46-wiz-001':{ kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.now-actions-checkpoint',
      titleEn:'Practice: Now Actions Checkpoint', titlePs:'تمرین: د همدا اوس کارونو چیک پوسته', items:[
      { id:'gl.drill.pc-check-001', mode:'correction', topicRef:'gl.topic.now-actions-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:pc-checkpoint','weak:pc-affirmative-all'], domainTags:['class'],
        wrongSentence:'She are not listening.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['she is not listening'], modelAnswer:'She is not listening.',
        feedbackEn:'she → is: She is not listening.', feedbackPs:'she → is: She is not listening.' },
      { id:'gl.drill.pc-check-002', mode:'transformation', topicRef:'gl.topic.now-actions-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:pc-checkpoint','weak:pc-question'], domainTags:['daily-life'],
        promptEn:'Make a question: He is working.', promptPs:'پوښتنه ترې جوړه کړه.',
        acceptable:['is he working'], modelAnswer:'Is he working?',
        feedbackEn:'Is + he + working: Is he working?', feedbackPs:'is سر ته: Is he working?' },
      { id:'gl.drill.pc-check-003', mode:'choose', topicRef:'gl.topic.now-actions-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:sp-vs-pc','weak:pc-checkpoint'], domainTags:['school'],
        promptEn:'Choose the correct sentence for a habit.', promptPs:'د عادت سمه جمله وټاکه.',
        choices:['I study every day.','I am studying every day.'],
        answer:'I study every day.',
        feedbackEn:'habit → Simple Present: I study every day.', feedbackPs:'عادت → ساده اوسمهال.' }
    ]},
    'gl.session.t46-test-001':{ kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.now-actions-checkpoint',
      titleEn:'Mini Test: Now Actions Checkpoint', titlePs:'ازموینه: چیک پوسته', items:[
      { id:'gl.test.pc-check-001', mode:'choose', topicRef:'gl.topic.now-actions-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:pc-checkpoint'], domainTags:['school'],
        promptEn:'Choose the correct question.', promptPs:'سمه پوښتنه وټاکه.',
        choices:['Is he reading?','Are he reading?','Does he reading?'],
        answer:'Is he reading?',
        feedbackEn:'he → Is: Is he reading?', feedbackPs:'he → Is: Is he reading?' },
      { id:'gl.test.pc-check-002', mode:'correction', topicRef:'gl.topic.now-actions-checkpoint',
        categoryId:'gl.cat.tenses', levelNumber:4, weakTags:['weak:pc-checkpoint','weak:pc-wh-question'], domainTags:['daily-life'],
        wrongSentence:'What you are doing?',
        promptEn:'Correct this question:', promptPs:'دا پوښتنه سمه کړه.',
        acceptable:['what are you doing'], modelAnswer:'What are you doing?',
        feedbackEn:'WH + are + you: What are you doing?', feedbackPs:'WH + are + you.' }
    ]}
  });

  /* ==========================================================================
     REFERENCE ENTRIES (5 new → 30 total)
     ========================================================================== */
  GL.registerReferenceEntries([
    { id:'gl.ref.pc-form', itemEn:'Present Continuous: am/is/are + verb-ing', levelNumber:3,
      categoryId:'gl.cat.tenses', meaningPs:'روان اوسمهال: فاعل + am/is/are + فعل + ing.',
      exampleEn:'I am reading. She is writing. They are playing.',
      registerLabels:['spoken','written'], weakTags:['weak:pc-form-am-is-are-ing'],
      relatedTopicRef:'gl.topic.am-is-are-verb-ing' },
    { id:'gl.ref.pc-ing-spelling', itemEn:'-ing spelling rules', levelNumber:3,
      categoryId:'gl.cat.tenses', meaningPs:'read→reading | write→writing | run→running | sit→sitting.',
      exampleEn:'write→writing (drop e). run→running (double n).',
      registerLabels:['written','exam'], weakTags:['weak:pc-ing-spelling'],
      relatedTopicRef:'gl.topic.ing-spelling' },
    { id:'gl.ref.pc-negative', itemEn:'Present Continuous negative', levelNumber:3,
      categoryId:'gl.cat.tenses', meaningPs:'am not / is not / are not + verb-ing.',
      exampleEn:'I am not sleeping. She is not reading. They are not working.',
      registerLabels:['spoken','written'], weakTags:['weak:pc-negative'],
      relatedTopicRef:'gl.topic.pc-negative' },
    { id:'gl.ref.pc-question', itemEn:'Present Continuous questions', levelNumber:4,
      categoryId:'gl.cat.questions-negatives', meaningPs:'Am/Is/Are + فاعل + verb-ing? | WH + am/is/are + فاعل + verb-ing?',
      exampleEn:'Is she reading? Are they playing? What are you doing?',
      registerLabels:['spoken','written','exam'], weakTags:['weak:pc-question','weak:pc-wh-question'],
      relatedTopicRef:'gl.topic.pc-yes-no-questions' },
    { id:'gl.ref.sp-vs-pc', itemEn:'Simple Present vs Present Continuous', levelNumber:4,
      categoryId:'gl.cat.tenses', meaningPs:'ساده = عادت (هره ورځ). روان = همدا اوس.',
      exampleEn:'I study every day. (habit) — I am studying now. (right now)',
      registerLabels:['spoken','written','exam'], weakTags:['weak:sp-vs-pc'],
      relatedTopicRef:'gl.topic.sp-vs-pc-intro' }
  ]);
})();
