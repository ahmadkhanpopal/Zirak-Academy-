/* ============================================================================
   grammar-lab-foundation-pack1.js — PHASE I6D
   FOUNDATION GRAMMAR REAL CONTENT PACK 1 (L1–L3)
   ----------------------------------------------------------------------------
   CONTENT ONLY. All structure lives in grammar-lab-engine.js (I6C/I6D).
   This pack registers 10 foundation topics, their wizard + mini-test
   sessions, and 5 reference entries through the ONE engine:
     ZirakGrammarLab.registerTopics / registerSessions / registerReferenceEntries
   No new renderers, no new TTS, no new weak store, no new guide system.

   OVERLAP NOTE: Topics 1–4 deepen the classic Nursery topics of the existing
   Grammar World curriculum (crosswalk kept in legacyNote); the classic path
   is untouched and still reachable via Continue Grammar Path.

   PASHTO: fresh professional support, appears once per line, owner-reviewable.
   No Urdu / Dari / Farsi / Persian anywhere.
   ============================================================================ */
(function () {
  'use strict';
  if (!window.ZirakGrammarLab) return;
  var GL = window.ZirakGrammarLab;

  /* ── GUIDE for the Foundation Path (into the ONE guide registry) ───────── */
  if (window.ZirakPageGuides && window.ZirakPageGuides.registry &&
      !window.ZirakPageGuides.registry['grammar-foundation-path']) {
    window.ZirakPageGuides.registry['grammar-foundation-path'] = {
      titleEn: 'Foundation Path', titlePs: 'بنسټیزه لار',
      purposeEn: 'This is your real beginner grammar path — from words and sentences to nouns, plurals, articles, pronouns, and am, is, are.',
      purposePs: 'دا ستا ریښتینې بنسټیزه ګرامري لار ده — له کلمو او جملو نه تر نومونو، جمع، ارتیکلونو، ضمیرونو او am, is, are پورې.',
      stepsEn: [
        'Open topic 1 first and go in order.',
        'Read the lesson, or press Hear Lesson to listen.',
        'Press Practice, then Mini Test.',
        'Your mistakes go to Weak Grammar Review so you can fix them.'
      ],
      stepsPs: [
        'لومړی موضوع ۱ پرانیزه او په ترتیب ورشه.',
        'لوست ولوله، یا «لوست واوره» کېکاږه.',
        'تمرین کېکاږه، بیا کوچنۍ ازموینه.',
        'ستا تېروتنې بیاکتنې ته ځي ترڅو سمې یې کړې.'
      ],
      nextActionEn: 'Your next step: open topic 1, Word vs Sentence.',
      nextActionPs: 'راتلونکی ګام: لومړۍ موضوع پرانیزه.'
    };
  }

  /* ==========================================================================
     TOPICS (10) — gl.path.foundation-1, ordered L1 → L3
     ========================================================================== */
  GL.registerTopics([

    { id:'gl.topic.word-vs-sentence', pathId:'gl.path.foundation-1', pathOrder:1,
      categoryId:'gl.cat.foundation', levelNumber:1, status:'active',
      titleEn:'Word vs Sentence', titlePs:'کلمه او جمله',
      reasonEn:'This is the first step: knowing the difference between one word and a complete sentence.',
      reasonPs:'لومړی ګام: د یوې کلمې او بشپړې جملې توپیر پېژندل.',
      legacyNote:'Deepens the classic Nursery topic: What is a Sentence?',
      prerequisites:[], nextTopics:['gl.topic.subject-verb'],
      weakTags:['weak:sentence-vs-fragment'],
      wizardSessionId:'gl.session.t01-wiz-001', testSessionId:'gl.session.t01-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'A word is one piece of language, like book or water. A sentence is a complete thought. It has a subject and a verb, starts with a capital letter, and ends with a full stop.',
          ps:'کلمه د ژبې یوه ټوټه ده، لکه کتاب یا اوبه. جمله بشپړ فکر دی: فاعل او فعل لري، په لوی توري پیلیږي او په ټکي پای ته رسیږي.' },
        { type:'examples', titleEn:'Words and sentences', items:[
          { en:'book', ps:'کتاب', domain:'school' },
          { en:'water', ps:'اوبه', domain:'home' },
          { en:'Birds fly.', ps:'مرغۍ الوزي.', domain:'daily life' },
          { en:'I study English.', ps:'زه انګلیسي لولم.', domain:'school' },
          { en:'My mother cooks rice.', ps:'زما مور وريژې پخوي.', domain:'family' }
        ]},
        { type:'commonMistake', wrongEn:'goes to school.', rightEn:'He goes to school.',
          noteEn:'A sentence needs a subject. Who goes? He goes.',
          notePs:'جمله فاعل ته اړتیا لري: څوک ځي؟ هغه ځي.' }
      ]},

    { id:'gl.topic.subject-verb', pathId:'gl.path.foundation-1', pathOrder:2,
      categoryId:'gl.cat.foundation', levelNumber:1, status:'active',
      titleEn:'Subject and Verb', titlePs:'فاعل او فعل',
      reasonEn:'Every sentence is built on a subject (who or what) and a verb (the action).',
      reasonPs:'هره جمله پر فاعل او فعل ولاړه ده.',
      legacyNote:'Deepens the classic Nursery topic: Subject and Verb.',
      prerequisites:['gl.topic.word-vs-sentence'], nextTopics:['gl.topic.subject-verb-object'],
      weakTags:['weak:find-subject','weak:find-verb'],
      wizardSessionId:'gl.session.t02-wiz-001', testSessionId:'gl.session.t02-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'The subject tells who or what does the action. The verb is the action word. In English the subject comes first, then the verb.',
          ps:'فاعل وايي چې څوک یا څه کار کوي. فعل د کار کلمه ده. په انګلیسي کې لومړی فاعل راځي، بیا فعل.' },
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'Subject + Verb', ps:'فاعل + فعل' },
          { en:'Birds + fly → Birds fly.' }
        ]},
        { type:'examples', items:[
          { en:'Birds fly.', ps:'مرغۍ الوزي.', domain:'daily life' },
          { en:'I study.', ps:'زه زده کړه کوم.', domain:'school' },
          { en:'She reads.', ps:'هغه لولي.', domain:'school' },
          { en:'We play.', ps:'موږ لوبې کوو.', domain:'daily life' },
          { en:'The baby sleeps.', ps:'ماشوم ویده کیږي.', domain:'home' }
        ]},
        { type:'commonMistake', wrongEn:'Fly birds.', rightEn:'Birds fly.',
          noteEn:'English order is subject first, then verb.',
          notePs:'په انګلیسي کې لومړی فاعل راځي، بیا فعل.' }
      ]},

    { id:'gl.topic.subject-verb-object', pathId:'gl.path.foundation-1', pathOrder:3,
      categoryId:'gl.cat.foundation', levelNumber:1, status:'active',
      titleEn:'Subject, Verb and Object', titlePs:'فاعل، فعل او مفعول',
      reasonEn:'Adding an object makes fuller sentences: I read a book.',
      reasonPs:'مفعول جمله بشپړوي: زه کتاب لولم.',
      legacyNote:'Deepens the classic Nursery topic: Subject and Object.',
      prerequisites:['gl.topic.subject-verb'], nextTopics:['gl.topic.noun-basics'],
      weakTags:['weak:find-object'],
      wizardSessionId:'gl.session.t03-wiz-001', testSessionId:'gl.session.t03-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'The object receives the action. The order is Subject + Verb + Object.',
          ps:'مفعول هغه دی چې کار پرې کیږي. ترتیب: فاعل + فعل + مفعول.' },
        { type:'formula', titleEn:'Pattern', rows:[
          { en:'Subject + Verb + Object', ps:'فاعل + فعل + مفعول' },
          { en:'I + read + a book → I read a book.' }
        ]},
        { type:'examples', items:[
          { en:'I read a book.', ps:'زه کتاب لولم.', domain:'school' },
          { en:'She drinks water.', ps:'هغه اوبه څښي.', domain:'home' },
          { en:'They play football.', ps:'هغوی فوټبال کوي.', domain:'daily life' },
          { en:'He buys bread.', ps:'هغه ډوډۍ اخلي.', domain:'market' }
        ]},
        { type:'commonMistake', wrongEn:'I a book read.', rightEn:'I read a book.',
          noteEn:'The verb comes before the object.',
          notePs:'فعل له مفعول نه مخکې راځي.' }
      ]},

    { id:'gl.topic.noun-basics', pathId:'gl.path.foundation-1', pathOrder:4,
      categoryId:'gl.cat.nouns-articles', levelNumber:1, status:'active',
      titleEn:'Noun Basics', titlePs:'د نوم بنسټونه',
      reasonEn:'Nouns name the world: people, places, things, animals, and ideas.',
      reasonPs:'نومونه نړۍ نوموي: کسان، ځایونه، شیان، ژوي او فکرونه.',
      legacyNote:'Deepens the classic Nursery topic: Noun Basics.',
      prerequisites:['gl.topic.word-vs-sentence'], nextTopics:['gl.topic.common-proper-nouns'],
      weakTags:['weak:noun-basics'],
      wizardSessionId:'gl.session.t04-wiz-001', testSessionId:'gl.session.t04-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'A noun is a naming word for a person, a place, a thing, an animal, or an idea.',
          ps:'نوم د کس، ځای، شي، ژوي یا فکر د نومولو کلمه ده.' },
        { type:'examples', titleEn:'Five kinds of nouns', items:[
          { en:'teacher (person)', ps:'ښوونکی (کس)', domain:'school' },
          { en:'school (place)', ps:'ښوونځی (ځای)', domain:'school' },
          { en:'book (thing)', ps:'کتاب (شی)', domain:'school' },
          { en:'cat (animal)', ps:'پیشو (ژوی)', domain:'home' },
          { en:'idea (idea)', ps:'نظر (فکر)', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'Run is a thing.', rightEn:'Run is an action word, a verb.',
          noteEn:'Action words are verbs, not nouns.',
          notePs:'د کار کلمې فعلونه دي، نه نومونه.' }
      ]},

    { id:'gl.topic.common-proper-nouns', pathId:'gl.path.foundation-1', pathOrder:5,
      categoryId:'gl.cat.nouns-articles', levelNumber:2, status:'active',
      titleEn:'Common and Proper Nouns', titlePs:'عام او خاص نومونه',
      reasonEn:'Special names need capital letters: Ahmad, Kandahar, Monday, English.',
      reasonPs:'خاص نومونه لوی توری غواړي: احمد، کندهار.',
      prerequisites:['gl.topic.noun-basics'], nextTopics:['gl.topic.plural-s-es'],
      weakTags:['weak:common-proper-noun','weak:capitalization-proper-noun'],
      wizardSessionId:'gl.session.t05-wiz-001', testSessionId:'gl.session.t05-test-001',
      referenceEntries:['gl.ref.proper-noun-capital'],
      lessonBlocks:[
        { type:'explanation',
          en:'A common noun is general: teacher, city, day, language. A proper noun is a special name and always starts with a capital letter: Ahmad, Kandahar, Monday, English.',
          ps:'عام نوم عمومي دی: ښوونکی، ښار. خاص نوم ځانګړی نوم دی او تل په لوی توري پیلیږي: احمد، کندهار.' },
        { type:'examples', titleEn:'Common → Proper', items:[
          { en:'teacher → Ahmad', ps:'ښوونکی ← احمد', domain:'school' },
          { en:'city → Kandahar', ps:'ښار ← کندهار', domain:'daily life' },
          { en:'day → Monday', ps:'ورځ ← دوشنبه', domain:'daily life' },
          { en:'language → English', ps:'ژبه ← انګلیسي', domain:'school' }
        ]},
        { type:'commonMistake', wrongEn:'i live in kandahar.', rightEn:'I live in Kandahar.',
          noteEn:'I and proper nouns always take capital letters.',
          notePs:'I او خاص نومونه تل لوی توری اخلي.' }
      ]},

    { id:'gl.topic.plural-s-es', pathId:'gl.path.foundation-1', pathOrder:6,
      categoryId:'gl.cat.nouns-articles', levelNumber:2, status:'active',
      titleEn:'Plural Nouns: -s and -es', titlePs:'جمع نومونه: ‑s او ‑es',
      reasonEn:'One book, two books: plurals show more than one.',
      reasonPs:'جمع له یو نه زیات ښیي: یو کتاب، دوه کتابونه.',
      prerequisites:['gl.topic.noun-basics'], nextTopics:['gl.topic.article-a-an'],
      weakTags:['weak:plural-s-es'],
      wizardSessionId:'gl.session.t06-wiz-001', testSessionId:'gl.session.t06-test-001',
      referenceEntries:['gl.ref.plural-s-es'],
      lessonBlocks:[
        { type:'explanation',
          en:'Most nouns add -s: book → books. Nouns ending in s, ss, sh, ch, or x add -es: box → boxes, class → classes.',
          ps:'ډېری نومونه s اخلي: کتاب ← کتابونه. هغه نومونه چې په s, ss, sh, ch یا x پای ته رسیږي es اخلي.' },
        { type:'examples', items:[
          { en:'book → books', ps:'یو کتاب ← دوه کتابونه', domain:'school' },
          { en:'box → boxes', ps:'یو بکس ← دوه بکسونه', domain:'market' },
          { en:'class → classes', ps:'یو ټولګی ← دوه ټولګي', domain:'school' },
          { en:'brush → brushes', ps:'یو برس ← دوه برسونه', domain:'home' }
        ]},
        { type:'note',
          en:'Irregular plurals like man → men and child → children come in a later lesson.',
          ps:'بې قاعدې جمعې لکه man ← men وروسته راځي.' },
        { type:'commonMistake', wrongEn:'two book', rightEn:'two books',
          noteEn:'After two, three, or many, the noun becomes plural.',
          notePs:'له دوه، درې یا ډېرو وروسته نوم جمع کیږي.' }
      ]},

    { id:'gl.topic.article-a-an', pathId:'gl.path.foundation-1', pathOrder:7,
      categoryId:'gl.cat.nouns-articles', levelNumber:2, status:'active',
      titleEn:'Articles: a and an', titlePs:'ارتیکلونه: a او an',
      reasonEn:'a and an mean one thing, and are chosen by sound, not spelling.',
      reasonPs:'a او an د یو شي مانا لري او د غږ له مخې ټاکل کیږي.',
      prerequisites:['gl.topic.noun-basics'], nextTopics:['gl.topic.article-the-basic'],
      weakTags:['weak:article-a-an'],
      wizardSessionId:'gl.session.t07-wiz-001', testSessionId:'gl.session.t07-test-001',
      lessonBlocks:[
        { type:'explanation',
          en:'Use an before a vowel sound: an apple, an egg. Use a before a consonant sound: a book, a teacher. Listen to the sound, not only the first letter: an hour, because the h is silent.',
          ps:'له غږلرونکي غږ مخکې an راځي: an apple. له بېغږه غږ مخکې a راځي: a book. غږ ته غوږ شه، نه یوازې لومړي توري ته: an hour، ځکه h نه ویل کیږي.' },
        { type:'examples', items:[
          { en:'a book', ps:'یو کتاب', domain:'school' },
          { en:'an apple', ps:'یوه مڼه', domain:'market' },
          { en:'a teacher', ps:'یو ښوونکی', domain:'school' },
          { en:'an egg', ps:'یوه هګۍ', domain:'home' },
          { en:'an hour', ps:'یو ساعت', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'a apple', rightEn:'an apple',
          noteEn:'apple starts with a vowel sound, so it takes an.',
          notePs:'apple په غږلرونکي غږ پیلیږي، نو an اخلي.' }
      ]},

    { id:'gl.topic.article-the-basic', pathId:'gl.path.foundation-1', pathOrder:8,
      categoryId:'gl.cat.nouns-articles', levelNumber:3, status:'active',
      titleEn:'The Article: the (Basic)', titlePs:'ارتیکل the — بنسټ',
      reasonEn:'the points to a known or specific thing.',
      reasonPs:'the پېژندل شوي یا ځانګړي شي ته اشاره کوي.',
      prerequisites:['gl.topic.article-a-an'], nextTopics:['gl.topic.subject-pronouns'],
      weakTags:['weak:article-the-basic'],
      wizardSessionId:'gl.session.t08-wiz-001', testSessionId:'gl.session.t08-test-001',
      referenceEntries:['gl.ref.article-the-basic'],
      lessonBlocks:[
        { type:'explanation',
          en:'Use the when both people know which one: the book on the table, the teacher in our class, the sun. Often the first time we say a or an, and the second time the: I have a pen. The pen is blue.',
          ps:'کله چې دواړه پوهیږي کوم یو دی، the کاروو. ډېری وخت لومړی ځل a/an وايو او دویم ځل the: I have a pen. The pen is blue.' },
        { type:'examples', items:[
          { en:'the book on the table', ps:'پر مېز هغه کتاب', domain:'school' },
          { en:'the teacher in our class', ps:'زموږ د ټولګي ښوونکی', domain:'school' },
          { en:'the sun', ps:'لمر', domain:'daily life' },
          { en:'I have a pen. The pen is blue.', ps:'یو قلم لرم. هغه قلم شین دی.', domain:'school' }
        ]},
        { type:'commonMistake', wrongEn:'Give me a book on the table.', rightEn:'Give me the book on the table.',
          noteEn:'We know which book it is, so we use the.',
          notePs:'پوهیږو کوم کتاب دی، نو the کاروو.' }
      ]},

    { id:'gl.topic.subject-pronouns', pathId:'gl.path.foundation-1', pathOrder:9,
      categoryId:'gl.cat.pronouns-wh', levelNumber:2, status:'active',
      titleEn:'Subject Pronouns', titlePs:'فاعلي ضمیرونه',
      reasonEn:'Pronouns replace names so we do not repeat them.',
      reasonPs:'ضمیرونه د نومونو پر ځای راځي ترڅو تکرار نه شي.',
      prerequisites:['gl.topic.subject-verb'], nextTopics:['gl.topic.am-is-are'],
      weakTags:['weak:subject-pronouns'],
      wizardSessionId:'gl.session.t09-wiz-001', testSessionId:'gl.session.t09-test-001',
      referenceEntries:['gl.ref.subject-pronouns'],
      lessonBlocks:[
        { type:'formula', titleEn:'The seven subject pronouns', rows:[
          { en:'I', ps:'زه' },
          { en:'you', ps:'ته / تاسو' },
          { en:'he', ps:'هغه (نارینه)' },
          { en:'she', ps:'هغه (ښځینه)' },
          { en:'it', ps:'هغه (شی یا ژوی)' },
          { en:'we', ps:'موږ' },
          { en:'they', ps:'هغوی' }
        ]},
        { type:'explanation',
          en:'A subject pronoun does the action: He reads. We study English.',
          ps:'فاعلي ضمیر کار کوي: هغه لولي. موږ انګلیسي لولو.' },
        { type:'examples', items:[
          { en:'He is my father.', ps:'هغه زما پلار دی.', domain:'family' },
          { en:'We study English.', ps:'موږ انګلیسي لولو.', domain:'school' },
          { en:'It is a cat.', ps:'دا پیشو ده.', domain:'home' },
          { en:'They play football.', ps:'هغوی فوټبال کوي.', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'Ahmad reads. Ahmad likes books.', rightEn:'Ahmad reads. He likes books.',
          noteEn:'The second time, use a pronoun instead of the name.',
          notePs:'دویم ځل د نوم پر ځای ضمیر وکاروه.' }
      ]},

    { id:'gl.topic.am-is-are', pathId:'gl.path.foundation-1', pathOrder:10,
      categoryId:'gl.cat.verbs-forms', levelNumber:3, status:'active',
      titleEn:'am, is and are', titlePs:'am، is او are',
      reasonEn:'am, is, are join the subject to a description: I am a student.',
      reasonPs:'دا فعلونه فاعل له توصیف سره نښلوي: زه زده کوونکی یم.',
      prerequisites:['gl.topic.subject-pronouns'], nextTopics:[],
      weakTags:['weak:am-is-are'],
      wizardSessionId:'gl.session.t10-wiz-001', testSessionId:'gl.session.t10-test-001',
      referenceEntries:['gl.ref.am-is-are'],
      lessonBlocks:[
        { type:'formula', titleEn:'Which one goes with which subject?', rows:[
          { en:'I → am', ps:'زه ← am' },
          { en:'he / she / it → is', ps:'هغه ← is' },
          { en:'you / we / they → are', ps:'ته، موږ، هغوی ← are' }
        ]},
        { type:'examples', items:[
          { en:'I am a student.', ps:'زه زده کوونکی یم.', domain:'school' },
          { en:'She is a teacher.', ps:'هغه ښوونکې ده.', domain:'school' },
          { en:'We are at home.', ps:'موږ په کور کې یو.', domain:'home' },
          { en:'They are happy.', ps:'هغوی خوشحاله دي.', domain:'daily life' }
        ]},
        { type:'commonMistake', wrongEn:'They is happy.', rightEn:'They are happy.',
          noteEn:'With they, we, and you, use are.',
          notePs:'له they, we او you سره are راځي.' }
      ]}
  ]);

  /* ==========================================================================
     SESSIONS — per-topic wizard (3 items) + mini test (2 items). 50 items.
     All items use the ONE runner; wrongs save through the ONE weak store.
     ========================================================================== */
  GL.registerSessions({

    /* ── T1 Word vs Sentence ── */
    'gl.session.t01-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.word-vs-sentence',
      titleEn:'Practice: Word vs Sentence', titlePs:'تمرین: کلمه او جمله', items:[
      { id:'gl.drill.word-vs-sentence-001', mode:'choose', topicRef:'gl.topic.word-vs-sentence',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:sentence-vs-fragment'], domainTags:['daily-life'],
        promptEn:'Which one is a complete sentence?', promptPs:'کومه یوه بشپړه جمله ده؟',
        choices:['book','Birds fly.','to school'], answer:'Birds fly.',
        feedbackEn:'A sentence has a subject and a verb: Birds fly.', feedbackPs:'جمله فاعل او فعل لري.' },
      { id:'gl.drill.word-vs-sentence-002', mode:'choose', topicRef:'gl.topic.word-vs-sentence',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:sentence-vs-fragment'], domainTags:['home'],
        promptEn:'Which one is only a word?', promptPs:'کومه یوه یوازې کلمه ده؟',
        choices:['She reads.','water','We play.'], answer:'water',
        feedbackEn:'water is one word. The others are complete sentences.', feedbackPs:'water یوازې یوه کلمه ده؛ نورې بشپړې جملې دي.' },
      { id:'gl.drill.word-vs-sentence-003', mode:'choose', topicRef:'gl.topic.word-vs-sentence',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:sentence-vs-fragment'], domainTags:['family'],
        promptEn:'Which one is a complete sentence?', promptPs:'کومه یوه بشپړه جمله ده؟',
        choices:['my father','works','My father works.'], answer:'My father works.',
        feedbackEn:'It has a subject, a verb, a capital letter, and a full stop.', feedbackPs:'فاعل، فعل، لوی توری او ټکی لري.' }
    ]},
    'gl.session.t01-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.word-vs-sentence',
      titleEn:'Mini Test: Word vs Sentence', titlePs:'ازموینه: کلمه او جمله', items:[
      { id:'gl.test.word-vs-sentence-001', mode:'choose', topicRef:'gl.topic.word-vs-sentence',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:sentence-vs-fragment'], domainTags:['home'],
        promptEn:'Choose the complete sentence.', promptPs:'بشپړه جمله وټاکه.',
        choices:['the market','She drinks water.','drinks'], answer:'She drinks water.',
        feedbackEn:'She drinks water has a subject and a verb.', feedbackPs:'دا جمله فاعل او فعل لري.' },
      { id:'gl.test.word-vs-sentence-002', mode:'choose', topicRef:'gl.topic.word-vs-sentence',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:sentence-vs-fragment'], domainTags:['school'],
        promptEn:'Choose the one that is NOT a sentence.', promptPs:'هغه وټاکه چې جمله نه ده.',
        choices:['I read a book.','to the school','They play.'], answer:'to the school',
        feedbackEn:'to the school has no subject and no full verb.', feedbackPs:'نه فاعل لري او نه بشپړ فعل.' }
    ]},

    /* ── T2 Subject and Verb ── */
    'gl.session.t02-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.subject-verb',
      titleEn:'Practice: Subject and Verb', titlePs:'تمرین: فاعل او فعل', items:[
      { id:'gl.drill.subject-verb-001', mode:'sentenceAnalysis', topicRef:'gl.topic.subject-verb',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-subject'], domainTags:['daily-life'],
        promptEn:'Birds fly. Which word is the subject?', promptPs:'فاعل کومه کلمه ده؟',
        hearText:'Birds fly.', choices:['Birds','fly'], answer:'Birds',
        feedbackEn:'Birds do the action, so Birds is the subject.', feedbackPs:'مرغۍ کار کوي، نو فاعل دی.' },
      { id:'gl.drill.subject-verb-002', mode:'sentenceAnalysis', topicRef:'gl.topic.subject-verb',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-verb'], domainTags:['school'],
        promptEn:'I study. Which word is the verb?', promptPs:'فعل کومه کلمه ده؟',
        hearText:'I study.', choices:['I','study'], answer:'study',
        feedbackEn:'study is the action word, so it is the verb.', feedbackPs:'study د کار کلمه ده، نو فعل دی.' },
      { id:'gl.drill.subject-verb-003', mode:'repeat', topicRef:'gl.topic.subject-verb',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-subject'], domainTags:['school'],
        promptEn:'She reads.', promptPs:'هغه لولي.',
        instructionEn:'Hear the sentence, then say it aloud clearly.',
        feedbackEn:'Good. Subject first, then verb: She reads.', feedbackPs:'ښه. لومړی فاعل، بیا فعل.' }
    ]},
    'gl.session.t02-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.subject-verb',
      titleEn:'Mini Test: Subject and Verb', titlePs:'ازموینه: فاعل او فعل', items:[
      { id:'gl.test.subject-verb-001', mode:'sentenceAnalysis', topicRef:'gl.topic.subject-verb',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-subject'], domainTags:['daily-life'],
        promptEn:'We play. Which word is the subject?', promptPs:'فاعل کوم دی؟',
        hearText:'We play.', choices:['We','play'], answer:'We',
        feedbackEn:'We do the action, so We is the subject.', feedbackPs:'موږ کار کوو، نو فاعل دی.' },
      { id:'gl.test.subject-verb-002', mode:'sentenceAnalysis', topicRef:'gl.topic.subject-verb',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-verb'], domainTags:['home'],
        promptEn:'The baby sleeps. Which word is the verb?', promptPs:'فعل کوم دی؟',
        hearText:'The baby sleeps.', choices:['baby','sleeps','The'], answer:'sleeps',
        feedbackEn:'sleeps is the action, so it is the verb.', feedbackPs:'sleeps کار دی، نو فعل دی.' }
    ]},

    /* ── T3 Subject, Verb, Object ── */
    'gl.session.t03-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.subject-verb-object',
      titleEn:'Practice: Subject, Verb and Object', titlePs:'تمرین: فاعل، فعل او مفعول', items:[
      { id:'gl.drill.svo-101', mode:'sentenceAnalysis', topicRef:'gl.topic.subject-verb-object',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-object'], domainTags:['school'],
        promptEn:'I read a book. Which part is the object?', promptPs:'مفعول کومه برخه ده؟',
        hearText:'I read a book.', choices:['I','read','a book'], answer:'a book',
        feedbackEn:'The book receives the action, so a book is the object.', feedbackPs:'کار پر کتاب کیږي، نو مفعول دی.' },
      { id:'gl.drill.svo-102', mode:'sentenceAnalysis', topicRef:'gl.topic.subject-verb-object',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-object'], domainTags:['home'],
        promptEn:'She drinks water. Which part is the object?', promptPs:'مفعول کومه برخه ده؟',
        hearText:'She drinks water.', choices:['She','drinks','water'], answer:'water',
        feedbackEn:'She drinks what? Water. So water is the object.', feedbackPs:'څه څښي؟ اوبه — نو مفعول دی.' },
      { id:'gl.drill.svo-103', mode:'choose', topicRef:'gl.topic.subject-verb-object',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-object'], domainTags:['school'],
        promptEn:'Choose the correct order.', promptPs:'سم ترتیب وټاکه.',
        choices:['I read a book.','I a book read.','Read I a book.'], answer:'I read a book.',
        feedbackEn:'Subject + Verb + Object: I read a book.', feedbackPs:'فاعل + فعل + مفعول.' }
    ]},
    'gl.session.t03-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.subject-verb-object',
      titleEn:'Mini Test: Subject, Verb and Object', titlePs:'ازموینه: فاعل، فعل او مفعول', items:[
      { id:'gl.test.svo-101', mode:'sentenceAnalysis', topicRef:'gl.topic.subject-verb-object',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-object'], domainTags:['market'],
        promptEn:'He buys bread. Which part is the object?', promptPs:'مفعول کومه برخه ده؟',
        hearText:'He buys bread.', choices:['He','buys','bread'], answer:'bread',
        feedbackEn:'He buys what? Bread. So bread is the object.', feedbackPs:'څه اخلي؟ ډوډۍ — نو مفعول دی.' },
      { id:'gl.test.svo-102', mode:'choose', topicRef:'gl.topic.subject-verb-object',
        categoryId:'gl.cat.foundation', levelNumber:1, weakTags:['weak:find-object'], domainTags:['daily-life'],
        promptEn:'Choose the correct order.', promptPs:'سم ترتیب وټاکه.',
        choices:['They football play.','They play football.','Play they football.'], answer:'They play football.',
        feedbackEn:'Subject + Verb + Object: They play football.', feedbackPs:'فاعل + فعل + مفعول.' }
    ]},

    /* ── T4 Noun Basics ── */
    'gl.session.t04-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.noun-basics',
      titleEn:'Practice: Noun Basics', titlePs:'تمرین: د نوم بنسټونه', items:[
      { id:'gl.drill.noun-basics-001', mode:'choose', topicRef:'gl.topic.noun-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:1, weakTags:['weak:noun-basics'], domainTags:['school'],
        promptEn:'Which word is a noun?', promptPs:'کومه کلمه نوم دی؟',
        choices:['teacher','run','quickly'], answer:'teacher',
        feedbackEn:'teacher names a person, so it is a noun.', feedbackPs:'teacher یو کس نوموي، نو نوم دی.' },
      { id:'gl.drill.noun-basics-002', mode:'choose', topicRef:'gl.topic.noun-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:1, weakTags:['weak:noun-basics'], domainTags:['home'],
        promptEn:'cat is a noun for a ...', promptPs:'cat د څه لپاره نوم دی؟',
        choices:['person','animal','place'], answer:'animal',
        feedbackEn:'A cat is an animal.', feedbackPs:'پیشو ژوی دی.' },
      { id:'gl.drill.noun-basics-003', mode:'choose', topicRef:'gl.topic.noun-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:1, weakTags:['weak:noun-basics'], domainTags:['school'],
        promptEn:'The teacher opens the book. Which word is NOT a noun?', promptPs:'کومه کلمه نوم نه دی؟',
        choices:['teacher','opens','book'], answer:'opens',
        feedbackEn:'opens is the action word, a verb.', feedbackPs:'opens د کار کلمه ده، فعل دی.' }
    ]},
    'gl.session.t04-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.noun-basics',
      titleEn:'Mini Test: Noun Basics', titlePs:'ازموینه: د نوم بنسټونه', items:[
      { id:'gl.test.noun-basics-001', mode:'choose', topicRef:'gl.topic.noun-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:1, weakTags:['weak:noun-basics'], domainTags:['market'],
        promptEn:'Which word is a noun?', promptPs:'کومه کلمه نوم دی؟',
        choices:['sleep','market','go'], answer:'market',
        feedbackEn:'market names a place, so it is a noun.', feedbackPs:'market ځای نوموي، نو نوم دی.' },
      { id:'gl.test.noun-basics-002', mode:'choose', topicRef:'gl.topic.noun-basics',
        categoryId:'gl.cat.nouns-articles', levelNumber:1, weakTags:['weak:noun-basics'], domainTags:['daily-life'],
        promptEn:'Which word is a noun?', promptPs:'کومه کلمه نوم دی؟',
        choices:['happy','city','write'], answer:'city',
        feedbackEn:'city names a place. happy describes, write is an action.', feedbackPs:'city ځای نوموي؛ نور نوم نه دي.' }
    ]},

    /* ── T5 Common and Proper Nouns ── */
    'gl.session.t05-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.common-proper-nouns',
      titleEn:'Practice: Common and Proper Nouns', titlePs:'تمرین: عام او خاص نومونه', items:[
      { id:'gl.drill.common-proper-001', mode:'choose', topicRef:'gl.topic.common-proper-nouns',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:common-proper-noun'], domainTags:['daily-life'],
        promptEn:'Which one is a proper noun?', promptPs:'کوم یو خاص نوم دی؟',
        choices:['school','Kandahar','book'], answer:'Kandahar',
        feedbackEn:'Kandahar is a special name, so it is a proper noun.', feedbackPs:'کندهار ځانګړی نوم دی، نو خاص نوم دی.' },
      { id:'gl.drill.common-proper-002', mode:'choose', topicRef:'gl.topic.common-proper-nouns',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:common-proper-noun'], domainTags:['school'],
        promptEn:'Which one is a common noun?', promptPs:'کوم یو عام نوم دی؟',
        choices:['Ahmad','Monday','teacher'], answer:'teacher',
        feedbackEn:'teacher is general; Ahmad and Monday are special names.', feedbackPs:'teacher عمومي دی؛ نور خاص نومونه دي.' },
      { id:'gl.drill.common-proper-003', mode:'correction', caseSensitive:true, topicRef:'gl.topic.common-proper-nouns',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:capitalization-proper-noun'], domainTags:['school'],
        wrongSentence:'ahmad reads english.',
        promptEn:'Correct the capital letters:', promptPs:'لوی توري سم کړه.',
        acceptable:['Ahmad reads English'], modelAnswer:'Ahmad reads English.',
        feedbackEn:'Ahmad and English are proper nouns, so they take capital letters.', feedbackPs:'احمد او انګلیسي خاص نومونه دي، نو لوی توری اخلي.' }
    ]},
    'gl.session.t05-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.common-proper-nouns',
      titleEn:'Mini Test: Common and Proper Nouns', titlePs:'ازموینه: عام او خاص نومونه', items:[
      { id:'gl.test.common-proper-001', mode:'choose', caseSensitive:true, topicRef:'gl.topic.common-proper-nouns',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:capitalization-proper-noun'], domainTags:['daily-life'],
        promptEn:'Choose the correct sentence.', promptPs:'سمه جمله وټاکه.',
        choices:['we visit kabul.','We visit Kabul.','we Visit kabul.'], answer:'We visit Kabul.',
        feedbackEn:'The first word and the proper noun Kabul take capital letters.', feedbackPs:'لومړۍ کلمه او خاص نوم لوی توری اخلي.' },
      { id:'gl.test.common-proper-002', mode:'choose', topicRef:'gl.topic.common-proper-nouns',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:common-proper-noun'], domainTags:['daily-life'],
        promptEn:'Which one is a proper noun?', promptPs:'کوم یو خاص نوم دی؟',
        choices:['day','Monday','week'], answer:'Monday',
        feedbackEn:'Monday is the special name of a day.', feedbackPs:'دوشنبه د ورځې ځانګړی نوم دی.' }
    ]},

    /* ── T6 Plural -s / -es ── */
    'gl.session.t06-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.plural-s-es',
      titleEn:'Practice: Plurals -s and -es', titlePs:'تمرین: جمع ‑s او ‑es', items:[
      { id:'gl.drill.plural-001', mode:'fillBlank', topicRef:'gl.topic.plural-s-es',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-s-es'], domainTags:['market'],
        promptEn:'one box, two ___', promptPs:'جمع یې ولیکه.',
        acceptable:['boxes'],
        feedbackEn:'box ends in x, so it takes -es: boxes.', feedbackPs:'box په x پای ته رسیږي، نو es اخلي.' },
      { id:'gl.drill.plural-002', mode:'fillBlank', topicRef:'gl.topic.plural-s-es',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-s-es'], domainTags:['school'],
        promptEn:'one book, two ___', promptPs:'جمع یې ولیکه.',
        acceptable:['books'],
        feedbackEn:'Most nouns simply add -s: books.', feedbackPs:'ډېری نومونه یوازې s اخلي.' },
      { id:'gl.drill.plural-003', mode:'choose', topicRef:'gl.topic.plural-s-es',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-s-es'], domainTags:['school'],
        promptEn:'class → ?', promptPs:'سمه جمع وټاکه.',
        choices:['classs','classes','clases'], answer:'classes',
        feedbackEn:'class ends in ss, so it takes -es: classes.', feedbackPs:'class په ss پای ته رسیږي، نو es اخلي.' }
    ]},
    'gl.session.t06-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.plural-s-es',
      titleEn:'Mini Test: Plurals -s and -es', titlePs:'ازموینه: جمع ‑s او ‑es', items:[
      { id:'gl.test.plural-001', mode:'fillBlank', topicRef:'gl.topic.plural-s-es',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-s-es'], domainTags:['daily-life'],
        promptEn:'one bus, two ___', promptPs:'جمع یې ولیکه.',
        acceptable:['buses'],
        feedbackEn:'bus ends in s, so it takes -es: buses.', feedbackPs:'bus په s پای ته رسیږي، نو es اخلي.' },
      { id:'gl.test.plural-002', mode:'correction', topicRef:'gl.topic.plural-s-es',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:plural-s-es'], domainTags:['home'],
        wrongSentence:'She has three cat.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['she has three cats'], modelAnswer:'She has three cats.',
        feedbackEn:'After three, the noun becomes plural: cats.', feedbackPs:'له درې وروسته نوم جمع کیږي.' }
    ]},

    /* ── T7 Articles a / an ── */
    'gl.session.t07-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.article-a-an',
      titleEn:'Practice: a and an', titlePs:'تمرین: a او an', items:[
      { id:'gl.drill.a-an-101', mode:'choose', topicRef:'gl.topic.article-a-an',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-a-an'], domainTags:['home'],
        promptEn:'___ egg', promptPs:'سم ارتیکل وټاکه.',
        choices:['a','an'], answer:'an',
        feedbackEn:'egg starts with a vowel sound: an egg.', feedbackPs:'egg په غږلرونکي غږ پیلیږي.' },
      { id:'gl.drill.a-an-102', mode:'choose', topicRef:'gl.topic.article-a-an',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-a-an'], domainTags:['market'],
        promptEn:'___ banana', promptPs:'سم ارتیکل وټاکه.',
        choices:['a','an'], answer:'a',
        feedbackEn:'banana starts with a consonant sound: a banana.', feedbackPs:'banana په بېغږه غږ پیلیږي.' },
      { id:'gl.drill.a-an-103', mode:'choose', topicRef:'gl.topic.article-a-an',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-a-an'], domainTags:['daily-life'],
        promptEn:'___ hour', promptPs:'سم ارتیکل وټاکه.',
        choices:['a','an'], answer:'an',
        feedbackEn:'The h in hour is silent, so it starts with a vowel sound: an hour.', feedbackPs:'په hour کې h نه ویل کیږي، نو an راځي.' }
    ]},
    'gl.session.t07-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.article-a-an',
      titleEn:'Mini Test: a and an', titlePs:'ازموینه: a او an', items:[
      { id:'gl.test.a-an-101', mode:'choose', topicRef:'gl.topic.article-a-an',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-a-an'], domainTags:['market'],
        promptEn:'___ orange', promptPs:'سم ارتیکل وټاکه.',
        choices:['a','an'], answer:'an',
        feedbackEn:'orange starts with a vowel sound: an orange.', feedbackPs:'orange په غږلرونکي غږ پیلیږي.' },
      { id:'gl.test.a-an-102', mode:'choose', topicRef:'gl.topic.article-a-an',
        categoryId:'gl.cat.nouns-articles', levelNumber:2, weakTags:['weak:article-a-an'], domainTags:['daily-life'],
        promptEn:'___ idea', promptPs:'سم ارتیکل وټاکه.',
        choices:['a','an'], answer:'an',
        feedbackEn:'idea starts with a vowel sound: an idea.', feedbackPs:'idea په غږلرونکي غږ پیلیږي.' }
    ]},

    /* ── T8 the (basic) ── */
    'gl.session.t08-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.article-the-basic',
      titleEn:'Practice: the', titlePs:'تمرین: the', items:[
      { id:'gl.drill.the-001', mode:'fillBlank', topicRef:'gl.topic.article-the-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:article-the-basic'], domainTags:['school'],
        promptEn:'I have a pen. ___ pen is blue.', promptPs:'تشه ډکه کړه.',
        acceptable:['the'],
        feedbackEn:'Second time we know which pen, so we use the.', feedbackPs:'دویم ځل پوهیږو کوم قلم دی، نو the کاروو.' },
      { id:'gl.drill.the-002', mode:'fillBlank', topicRef:'gl.topic.article-the-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:article-the-basic'], domainTags:['home'],
        promptEn:'Please close ___ door.', promptPs:'تشه ډکه کړه.',
        acceptable:['the'],
        feedbackEn:'Both people know which door: the door.', feedbackPs:'دواړه پوهیږي کومه دروازه ده.' },
      { id:'gl.drill.the-003', mode:'choose', topicRef:'gl.topic.article-the-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:article-the-basic'], domainTags:['daily-life'],
        promptEn:'We see ___ sun.', promptPs:'سم ارتیکل وټاکه.',
        choices:['a','an','the'], answer:'the',
        feedbackEn:'There is only one sun, so we say the sun.', feedbackPs:'یوازې یو لمر شته، نو the وايو.' }
    ]},
    'gl.session.t08-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.article-the-basic',
      titleEn:'Mini Test: the', titlePs:'ازموینه: the', items:[
      { id:'gl.test.the-001', mode:'fillBlank', topicRef:'gl.topic.article-the-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:article-the-basic'], domainTags:['school'],
        promptEn:'Open ___ book on the table.', promptPs:'تشه ډکه کړه.',
        acceptable:['the'],
        feedbackEn:'We know which book: the book on the table.', feedbackPs:'پوهیږو کوم کتاب دی.' },
      { id:'gl.test.the-002', mode:'choose', topicRef:'gl.topic.article-the-basic',
        categoryId:'gl.cat.nouns-articles', levelNumber:3, weakTags:['weak:article-the-basic'], domainTags:['home'],
        promptEn:'I have a cat. ___ cat is small.', promptPs:'سم ارتیکل وټاکه.',
        choices:['A','An','The'], answer:'The',
        feedbackEn:'Second time we use The: The cat is small.', feedbackPs:'دویم ځل the کاروو.' }
    ]},

    /* ── T9 Subject Pronouns ── */
    'gl.session.t09-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.subject-pronouns',
      titleEn:'Practice: Subject Pronouns', titlePs:'تمرین: فاعلي ضمیرونه', items:[
      { id:'gl.drill.pronoun-001', mode:'choose', topicRef:'gl.topic.subject-pronouns',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:subject-pronouns'], domainTags:['family'],
        promptEn:'Ahmad → ___', promptPs:'سم ضمیر وټاکه.',
        choices:['he','she','it'], answer:'he',
        feedbackEn:'Ahmad is a man, so we say he.', feedbackPs:'احمد نارینه دی، نو he وايو.' },
      { id:'gl.drill.pronoun-002', mode:'choose', topicRef:'gl.topic.subject-pronouns',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:subject-pronouns'], domainTags:['family'],
        promptEn:'my mother → ___', promptPs:'سم ضمیر وټاکه.',
        choices:['he','she','it'], answer:'she',
        feedbackEn:'Mother is a woman, so we say she.', feedbackPs:'مور ښځینه ده، نو she وايو.' },
      { id:'gl.drill.pronoun-003', mode:'choose', topicRef:'gl.topic.subject-pronouns',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:subject-pronouns'], domainTags:['school'],
        promptEn:'my friends and I → ___', promptPs:'سم ضمیر وټاکه.',
        choices:['they','we','you'], answer:'we',
        feedbackEn:'My friends and I means we.', feedbackPs:'زه او ملګري یعنې موږ.' }
    ]},
    'gl.session.t09-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.subject-pronouns',
      titleEn:'Mini Test: Subject Pronouns', titlePs:'ازموینه: فاعلي ضمیرونه', items:[
      { id:'gl.test.pronoun-001', mode:'choose', topicRef:'gl.topic.subject-pronouns',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:subject-pronouns'], domainTags:['school'],
        promptEn:'the book → ___', promptPs:'سم ضمیر وټاکه.',
        choices:['he','it','they'], answer:'it',
        feedbackEn:'A book is a thing, so we say it.', feedbackPs:'کتاب شی دی، نو it وايو.' },
      { id:'gl.test.pronoun-002', mode:'choose', topicRef:'gl.topic.subject-pronouns',
        categoryId:'gl.cat.pronouns-wh', levelNumber:2, weakTags:['weak:subject-pronouns'], domainTags:['family'],
        promptEn:'Ahmad and Karim → ___', promptPs:'سم ضمیر وټاکه.',
        choices:['we','they','he'], answer:'they',
        feedbackEn:'Two people we talk about: they.', feedbackPs:'دوه کسان چې خبرې پرې کوو: they.' }
    ]},

    /* ── T10 am / is / are ── */
    'gl.session.t10-wiz-001': { kind:'wizard', guideId:'grammar-wizard', returnTopicId:'gl.topic.am-is-are',
      titleEn:'Practice: am, is and are', titlePs:'تمرین: am، is او are', items:[
      { id:'gl.drill.am-is-are-001', mode:'fillBlank', topicRef:'gl.topic.am-is-are',
        categoryId:'gl.cat.verbs-forms', levelNumber:3, weakTags:['weak:am-is-are'], domainTags:['school'],
        promptEn:'I ___ a student.', promptPs:'تشه ډکه کړه.',
        acceptable:['am'],
        feedbackEn:'With I we always use am.', feedbackPs:'له I سره تل am راځي.' },
      { id:'gl.drill.am-is-are-002', mode:'fillBlank', topicRef:'gl.topic.am-is-are',
        categoryId:'gl.cat.verbs-forms', levelNumber:3, weakTags:['weak:am-is-are'], domainTags:['family'],
        promptEn:'She ___ my sister.', promptPs:'تشه ډکه کړه.',
        acceptable:['is'],
        feedbackEn:'With she we use is.', feedbackPs:'له she سره is راځي.' },
      { id:'gl.drill.am-is-are-003', mode:'fillBlank', topicRef:'gl.topic.am-is-are',
        categoryId:'gl.cat.verbs-forms', levelNumber:3, weakTags:['weak:am-is-are'], domainTags:['daily-life'],
        promptEn:'We ___ friends.', promptPs:'تشه ډکه کړه.',
        acceptable:['are'],
        feedbackEn:'With we we use are.', feedbackPs:'له we سره are راځي.' }
    ]},
    'gl.session.t10-test-001': { kind:'test', guideId:'grammar-tests', returnTopicId:'gl.topic.am-is-are',
      titleEn:'Mini Test: am, is and are', titlePs:'ازموینه: am، is او are', items:[
      { id:'gl.test.am-is-are-001', mode:'choose', topicRef:'gl.topic.am-is-are',
        categoryId:'gl.cat.verbs-forms', levelNumber:3, weakTags:['weak:am-is-are'], domainTags:['school'],
        promptEn:'They ___ at school.', promptPs:'سم فعل وټاکه.',
        choices:['is','am','are'], answer:'are',
        feedbackEn:'With they we use are.', feedbackPs:'له they سره are راځي.' },
      { id:'gl.test.am-is-are-002', mode:'correction', topicRef:'gl.topic.am-is-are',
        categoryId:'gl.cat.verbs-forms', levelNumber:3, weakTags:['weak:am-is-are'], domainTags:['family'],
        wrongSentence:'He are my brother.',
        promptEn:'Correct this sentence:', promptPs:'دا جمله سمه کړه.',
        acceptable:['he is my brother'], modelAnswer:'He is my brother.',
        feedbackEn:'With he we use is: He is my brother.', feedbackPs:'له he سره is راځي.' }
    ]}
  });

  /* ==========================================================================
     REFERENCE ENTRIES (5 new — join the 6 from I6C)
     ========================================================================== */
  GL.registerReferenceEntries([
    { id:'gl.ref.proper-noun-capital', itemEn:'proper nouns take capitals', levelNumber:2,
      categoryId:'gl.cat.nouns-articles', meaningPs:'خاص نومونه تل لوی توری اخلي.',
      exampleEn:'Ahmad, Kandahar, Monday, English',
      registerLabels:['written','exam'], weakTags:['weak:capitalization-proper-noun'],
      relatedTopicRef:'gl.topic.common-proper-nouns' },
    { id:'gl.ref.plural-s-es', itemEn:'plural -s / -es', levelNumber:2,
      categoryId:'gl.cat.nouns-articles', meaningPs:'ډېری نومونه s اخلي؛ په s, sh, ch, x پای شوي es اخلي.',
      exampleEn:'books, boxes, classes, brushes',
      registerLabels:['written','spoken'], weakTags:['weak:plural-s-es'],
      relatedTopicRef:'gl.topic.plural-s-es' },
    { id:'gl.ref.article-the-basic', itemEn:'the (known thing)', levelNumber:3,
      categoryId:'gl.cat.nouns-articles', meaningPs:'پېژندل شوي شي ته the کاروو.',
      exampleEn:'the book on the table; the sun',
      registerLabels:['spoken','written'], weakTags:['weak:article-the-basic'],
      relatedTopicRef:'gl.topic.article-the-basic' },
    { id:'gl.ref.subject-pronouns', itemEn:'subject pronouns', levelNumber:2,
      categoryId:'gl.cat.pronouns-wh', meaningPs:'زه I، ته you، هغه he/she/it، موږ we، هغوی they.',
      exampleEn:'He reads. We study English.',
      registerLabels:['spoken','written'], weakTags:['weak:subject-pronouns'],
      relatedTopicRef:'gl.topic.subject-pronouns' },
    { id:'gl.ref.am-is-are', itemEn:'am / is / are', levelNumber:3,
      categoryId:'gl.cat.verbs-forms', meaningPs:'I am؛ he/she/it is؛ you/we/they are.',
      exampleEn:'I am a student. They are happy.',
      registerLabels:['spoken','written','exam'], weakTags:['weak:am-is-are'],
      relatedTopicRef:'gl.topic.am-is-are' }
  ]);
})();
