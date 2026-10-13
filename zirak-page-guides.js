/* ============================================================================
   zirak-page-guides.js — PHASE I6B2
   Global Student Guidance Framework (ONE guide system for the whole app)
   ----------------------------------------------------------------------------
   PURPOSE
   Zirak must behave like a calm digital teacher. Every major page should be
   able to answer, quietly and clearly:
     1. What is this page?      2. Why am I here?
     3. What do I click first?  4. What happens when I click it?
     5. What do I do after?     6. How does this help my school path?
     7. What is my next step?

   This file is the SINGLE source of truth for that guidance. It does NOT
   create a second TTS engine, a second Auto-Read system, a second navigation
   system, or a second Pashto helper. It reuses what already exists:
     - window.speak(text,'en')      → global TTS (respects saved voice speed
                                       via state.speechRate, and is caught by
                                       the floating Stop Reading button, which
                                       wraps speechSynthesis.cancel()).
     - window.ZirakAutoReadOn()     → the ONE Auto Read setting (grammar-world.js).
     - existing navigate()          → page changes cancel guide speech.

   NON-GOALS (do NOT add here): frameworks, backend, a floating toast that
   covers content, per-page competing guide engines, big content.
   ============================================================================

   ────────────────────────────────────────────────────────────────────────────
   FUTURE PAGE / CATEGORY STRUCTURE CONTRACT  (read before adding new pages)
   ────────────────────────────────────────────────────────────────────────────
   When a NEW page or category is added later, give it a guide entry in the
   registry below using this exact shape so it inherits guidance, TTS, Pashto
   fallback and dark/light safety for free — no per-page reinvention:

     'pageId': {
        titleEn:      'Short page name',
        titlePs:      'پښتو نوم',                  // Pashto only. If unknown,
                                                    // use PENDING (see helper).
        purposeEn:    'One caring sentence: what this page is / why you are here.',
        purposePs:    'یوه روښانه پښتو جمله.',       // Pashto only, or PENDING.
        stepsEn:      ['Step 1 ...','Step 2 ...','Step 3 ...'],  // 2–5 short steps
        stepsPs:      ['۱ ...','۲ ...','۳ ...'],                 // same count, or []
        nextActionEn: 'Your next step is ...',      // one clear next move
        nextActionPs: 'ستا راتلونکی ګام ...',        // Pashto only, or PENDING
        pathContextEn:'How this fits the academy route.', // optional
        pathContextPs:'د اکاډمۍ په لار کې ځای.',          // optional
        // OPTIONAL future smart-guidance hooks (safe to omit):
        recommendedNextAction: 'grammar' | 'path' | ... ,  // a screen id
        recommendedButtonSelector: '#some-btn',            // if safe
        // The spoken script is built automatically from the fields above via
        // ZirakPageGuides.script(id); override only if you must:
        ttsScriptEn:  'Optional custom spoken script.'
     }

   RULES every future page/category must also follow (enforced by convention):
     • Visible support language = Pashto ONLY. Missing Pashto shows
       "Pashto translation pending." (never blank, never Farsi/Dari/Urdu).
     • Use the dark/light-safe utility classes (styles.css → I6B2 block):
       .zk-guide-card .zk-page-guide .zk-readable .zk-muted-readable
       .zk-on-dark .zk-pashto-readable .zk-choice-readable .zk-action-row
     • Every sub-view that opens must offer a clear Back / Close / Exit path.
     • Auto Read ON  → the guide may speak ONCE when the page opens.
       Auto Read OFF → the guide never auto-speaks, but "Hear Guide" works.
     • Stop Reading and page change must cancel guide speech (automatic here).
   ──────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var PENDING = 'Pashto translation pending.';

  // Pashto fallback: never render blank, never render Farsi/Dari.
  function ps(v) {
    if (v === undefined || v === null) return PENDING;
    var s = String(v).trim();
    return s ? s : PENDING;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function autoReadOn() {
    try {
      if (typeof window.ZirakAutoReadOn === 'function') return !!window.ZirakAutoReadOn();
    } catch (e) {}
    return true; // default ON, matching the rest of the app
  }

  // Reuse the ONE global TTS. Never build a second engine.
  function speakText(text) {
    if (!text) return;
    try {
      if (typeof window.speak === 'function') { window.speak(String(text), 'en'); return; }
    } catch (e) {}
    // ultra-safe fallback only if window.speak is somehow unavailable
    try {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'en-US';
      u.rate = (window.state && window.state.speechRate) ? window.state.speechRate : 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function stopSpeech() {
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }

  /* ==========================================================================
     THE REGISTRY — one caring entry per major page.
     Tone: simple, warm, modern, teacher-like. Not childish. Not long.
     ========================================================================== */
  var REGISTRY = {

    home: {
      titleEn: 'Home', titlePs: 'کور',
      purposeEn: 'This is your home. It shows where you are in your learning and helps you start.',
      purposePs: 'دا ستا کور دی. دلته ګورې چې چیرته یې او له کومه پیل وکړې.',
      stepsEn: [
        'Look at "Continue Today\'s Class" to keep going where you stopped.',
        'Use the bottom menu to open Grammar, Words, Listening, Stories, or Topics.',
        'Come back here any time to see your progress.'
      ],
      stepsPs: [
        'د «نننۍ ټولګي ته دوام» وګوره ترڅو له همغه ځایه دوام ورکړې چې ودرېدې.',
        'د لاندې مینو څخه ګرامر، کلیمې، اورېدل، کیسې یا موضوعات پرانیزه.',
        'هر وخت دلته راشه ترڅو خپله پرمختیا وګورې.'
      ],
      nextActionEn: 'Your next step: continue today\'s class, or open your School Path.',
      nextActionPs: 'راتلونکی ګام: نننۍ ټولګي ته دوام ورکړه، یا خپله د ښوونځي لاره پرانیزه.',
      recommendedNextAction: 'path'
    },

    path: {
      titleEn: 'School Path', titlePs: 'د ښوونځي لاره',
      purposeEn: 'This is your main academy route. It guides you class by class, from beginner to advanced.',
      purposePs: 'دا ستا د اکاډمۍ اصلي لار ده. ټولګی په ټولګی له پیل نه تر پرمختللي پورې مو لارښوونه کوي.',
      stepsEn: [
        'My Path is your main route — start here if your teacher has set your class.',
        'Placement is a short level test that finds the right starting level for you.',
        'Free Practice is extra practice outside your route.'
      ],
      stepsPs: [
        'زما لاره ستا اصلي لار ده — که ښوونکي ستا ټولګی ټاکلی وي، له دې پیل وکړه.',
        'ټاکنه یوه لنډه ازموینه ده چې ستا لپاره سم پیلني کچه پیدا کوي.',
        'ازاد تمرین ستا له لارې بهر اضافي تمرین دی.'
      ],
      nextActionEn: 'Your next step: open My Path and tap the next class block.',
      nextActionPs: 'راتلونکی ګام: زما لاره پرانیزه او راتلونکی ټولګی ټک کړه.',
      pathContextEn: 'Finishing each block moves you forward on the six-month path.',
      pathContextPs: 'د هرې برخې بشپړول تا د شپږ میاشتني لارې په اوږدو کې مخته بیایي.'
    },

    grammar: {
      titleEn: 'Grammar World', titlePs: 'د ګرامر نړۍ',
      purposeEn: 'Here you learn English grammar step by step — rules, examples, listening, and practice.',
      purposePs: 'دلته انګلیسي ګرامر ګام په ګام زده کوې — قواعد، بېلګې، اورېدل او تمرین.',
      stepsEn: [
        'Start with "Browse by Level" if you are following the academy path.',
        'Choose your level, then open the first topic.',
        'Press "Read Full Lesson", then press "Start Practice".',
        'Mistakes appear later in "Weak Grammar Review" so you can fix them.'
      ],
      stepsPs: [
        'که د اکاډمۍ لار تعقیبوې، له «د کچې له مخې لټون» پیل وکړه.',
        'خپله کچه غوره کړه، بیا لومړی موضوع پرانیزه.',
        '«بشپړ لوست ولوله» کېکاږه، بیا «تمرین پیل کړه» کېکاږه.',
        'تېروتنې وروسته په «د ضعیف ګرامر بیاکتنه» کې ښکاري ترڅو سمې یې کړې.'
      ],
      nextActionEn: 'Your next step: open Starter / Foundation and start the first topic.',
      nextActionPs: 'راتلونکی ګام: بنسټیز ژبپوهنه پرانیزه او لومړی موضوع پیل کړه.',
      pathContextEn: 'Grammar builds the sentences you will use in speaking and interviews.',
      pathContextPs: 'ګرامر هغه جملې جوړوي چې په خبرو او مرکو کې یې کاروې.',
      recommendedNextAction: 'grammar'
    },

    // Grammar sub-views (spoken via ZirakPageGuides.speak on view change)
    'grammar-level': {
      titleEn: 'Grammar Level', titlePs: 'د ګرامر کچه',
      purposeEn: 'This level lists the topics to learn in order. The goal at the top says what you will be able to do by the end.',
      purposePs: 'دا کچه هغه موضوعات په ترتیب سره ښیي چې زده کوې. پورتنی موخه وايي چې په پای کې به څه کولی شې.',
      stepsEn: [
        'Read the level goal at the top.',
        'Open the first topic in the list.',
        'Read the full lesson, then start practice.'
      ],
      stepsPs: [
        'پورته د کچې موخه ولوله.',
        'په لست کې لومړی موضوع پرانیزه.',
        'بشپړ لوست ولوله، بیا تمرین پیل کړه.'
      ],
      nextActionEn: 'Your next step: open the first topic in this level.',
      nextActionPs: 'راتلونکی ګام: په دې کچه کې لومړی موضوع پرانیزه.'
    },

    'grammar-topic': {
      titleEn: 'Grammar Topic', titlePs: 'د ګرامر موضوع',
      purposeEn: 'This page teaches one grammar topic with a rule, examples, and Pashto support.',
      purposePs: 'دا مخ یو ګرامري موضوع د قاعدې، بېلګو او پښتو ملاتړ سره ښیي.',
      stepsEn: [
        'Press "Read Full Lesson" to hear and follow the lesson.',
        'Look at the examples and the Pashto meaning.',
        'Press "Start Practice" when you are ready.'
      ],
      stepsPs: [
        '«بشپړ لوست ولوله» کېکاږه ترڅو لوست واورې او تعقیب یې کړې.',
        'بېلګې او د دې پښتو مانا وګوره.',
        'کله چې چمتو شوې، «تمرین پیل کړه» کېکاږه.'
      ],
      nextActionEn: 'Your next step: read the full lesson, then start practice.',
      nextActionPs: 'راتلونکی ګام: بشپړ لوست ولوله، بیا تمرین پیل کړه.'
    },

    'grammar-practice': {
      titleEn: 'Grammar Practice', titlePs: 'د ګرامر تمرین',
      purposeEn: 'Here you practice the topic and get feedback. Wrong answers are saved to Weak Grammar Review.',
      purposePs: 'دلته موضوع تمرینوې او نظر ترلاسه کوې. غلط ځوابونه د ضعیف ګرامر بیاکتنې ته خوندي کیږي.',
      stepsEn: [
        'Read each question carefully.',
        'Choose or type your answer, then check it.',
        'Use Back or Exit any time to leave.'
      ],
      stepsPs: [
        'هره پوښتنه په دقت ولوله.',
        'خپل ځواب وټاکه یا ولیکه، بیا یې وګوره.',
        'د وتلو لپاره هر وخت شاته یا وتون وکاروه.'
      ],
      nextActionEn: 'Your next step: answer each question, then review your weak points.',
      nextActionPs: 'راتلونکی ګام: هرې پوښتنې ته ځواب ورکړه، بیا خپل ضعیف ټکي بیاکته.'
    },

    'grammar-weak': {
      titleEn: 'Weak Grammar Review', titlePs: 'د ضعیف ګرامر بیاکتنه',
      purposeEn: 'These are the grammar points you missed. Practicing them again makes them strong.',
      purposePs: 'دا هغه ګرامري ټکي دي چې تېروتلې. بیا تمرین یې پیاوړي کوي.',
      stepsEn: [
        'Open a weak item to practice it again.',
        'Answer until it feels easy.',
        'It leaves this list once you get it right.'
      ],
      stepsPs: [
        'یو ضعیف توکی پرانیزه ترڅو بیا یې تمرین کړې.',
        'ځواب ورکړه ترڅو اسانه شي.',
        'کله چې سم یې کړې له دې لست نه لرې کیږي.'
      ],
      nextActionEn: 'Your next step: pick one weak item and practice it now.',
      nextActionPs: 'راتلونکی ګام: یو ضعیف توکی وټاکه او همدا اوس یې تمرین کړه.'
    },

    listening: {
      titleEn: 'Listening Room', titlePs: 'د اورېدلو خونه',
      purposeEn: 'Here you train your ears and your speaking with English audio.',
      purposePs: 'دلته د انګلیسي غږ سره خپل غوږونه او خبرې روزنه کوې.',
      stepsEn: [
        'For guided practice, press "Recommended: Start Auto Practice".',
        'To only listen, choose "Listen Only".',
        'Listen first, then repeat clearly. Use Stop if the audio is too fast.'
      ],
      stepsPs: [
        'د لارښوول شوي تمرین لپاره «سپارښتنه: اتومات تمرین» کېکاږه.',
        'یوازې د اورېدلو لپاره «یوازې واوره» غوره کړه.',
        'لومړی واوره، بیا په روښانه توګه تکرار کړه. که غږ ډېر ګړندی وي، ودروه وکاروه.'
      ],
      nextActionEn: 'Your next step: press Start Auto Practice, or pick a mode below.',
      nextActionPs: 'راتلونکی ګام: اتومات تمرین پیل کړه، یا لاندې یو حالت وټاکه.',
      pathContextEn: 'Listen & Repeat trains pronunciation. Shadowing trains speed. Dictation trains spelling. Sound Pairs and Minimal Pairs train difficult English sounds.',
      pathContextPs: 'اورېدل او تکرار تلفظ روزي. سیوری چټکتیا روزي. املا لیکنه املا روزي. غږ جوړې او لږترلږه جوړې سخت انګلیسي غږونه روزي.'
    },

    wordlab: {
      titleEn: 'Word Lab', titlePs: 'د کلیمو لابراتوار',
      purposeEn: 'Here you learn new words, take quizzes, and review the ones you find hard.',
      purposePs: 'دلته نوې کلیمې زده کوې، ازموینه ورکوې او هغه بیاکتنه کوې چې درته سختې دي.',
      stepsEn: [
        'Start a Quiz to test the words you know.',
        'Save words you want to keep, and mark ones you got wrong.',
        'Come back to "Review Due" to strengthen weak words.'
      ],
      stepsPs: [
        'د پوهیدلو کلیمو ازمویلو لپاره ازموینه پیل کړه.',
        'هغه کلیمې خوندي کړه چې غواړې، او هغه چې غلطې دې نښه کړه.',
        '«د بیاکتنې وخت» ته راشه ترڅو ضعیف کلیمې پیاوړې کړې.'
      ],
      nextActionEn: 'Your next step: start a Quiz, then review any words you miss.',
      nextActionPs: 'راتلونکی ګام: ازموینه پیل کړه، بیا هغه کلیمې بیاکته چې تېرې شوې.'
    },

    stories: {
      titleEn: 'Story Mode', titlePs: 'د کیسې حالت',
      purposeEn: 'Short English stories with Pashto support, so you can read and listen together.',
      purposePs: 'لنډې انګلیسي کیسې د پښتو ملاتړ سره، ترڅو یوځای یې ولولې او واورې.',
      stepsEn: [
        'Open any story from the list.',
        'Tap "Start Auto Practice" to listen and read along.',
        'Go at your own pace — you can stop any time.'
      ],
      stepsPs: [
        'له لست نه هره کیسه پرانیزه.',
        '«اتومات تمرین پیل کړه» ټک کړه ترڅو واورې او ورسره ولولې.',
        'په خپل سرعت ورشه — هر وخت ودرېدلی شې.'
      ],
      nextActionEn: 'Your next step: open a story and start auto practice.',
      nextActionPs: 'راتلونکی ګام: یوه کیسه پرانیزه او اتومات تمرین پیل کړه.'
    },

    topics: {
      titleEn: 'Topic Studio', titlePs: 'د موضوعاتو سټوډیو',
      purposeEn: 'Guided speaking and writing practice, one topic at a time.',
      purposePs: 'لارښوول شوی د خبرو او لیکلو تمرین، یو یو موضوع.',
      stepsEn: [
        'Open any topic from the list.',
        'Tap "Repeat Wizard" to start guided auto practice.',
        'Read the paragraphs aloud and practice writing.'
      ],
      stepsPs: [
        'له لست نه هر موضوع پرانیزه.',
        '«تکرار وزرډ» ټک کړه ترڅو لارښوول شوی اتومات تمرین پیل شي.',
        'پراګرافونه په لوړ غږ ولوله او لیکل تمرین کړه.'
      ],
      nextActionEn: 'Your next step: open a topic and tap Repeat Wizard.',
      nextActionPs: 'راتلونکی ګام: یو موضوع پرانیزه او تکرار وزرډ ټک کړه.'
    },

    dialogue: {
      titleEn: 'Dialogue Wizard', titlePs: 'د خبرو اترو وزرډ',
      purposeEn: 'Practice real conversations. You hear a line, then you say it back.',
      purposePs: 'ریښتیني خبرې اترې تمرین کړه. یوه کرښه اورې، بیا یې بیرته وایې.',
      stepsEn: [
        'Choose a dialogue topic.',
        'Listen to each line, then repeat it clearly.',
        'Speak into the microphone when asked.'
      ],
      stepsPs: [
        'د خبرو اترو یو موضوع غوره کړه.',
        'هره کرښه واوره، بیا یې په روښانه توګه تکرار کړه.',
        'کله چې وغوښتل شي، مایکروفون ته وایه.'
      ],
      nextActionEn: 'Your next step: choose a dialogue and listen to the first line.',
      nextActionPs: 'راتلونکی ګام: یوه خبره اتره غوره کړه او لومړۍ کرښه واوره.'
    },

    review: {
      titleEn: 'Review & Results', titlePs: 'بیاکتنه او پایلې',
      purposeEn: 'See how you are doing — your sessions, scores, badges, and weak areas.',
      purposePs: 'وګوره چې څنګه پرمختګ کوې — ناستې، نمرې، نښانونه او ضعیف برخې.',
      stepsEn: [
        'Look at today\'s summary at the top.',
        'Open "Weak Areas" to see what needs more practice.',
        'Practice the weak areas, then check back here.'
      ],
      stepsPs: [
        'پورته د نن لنډیز وګوره.',
        '«ضعیف برخې» پرانیزه ترڅو وګورې چې څه ته نور تمرین پکار دی.',
        'ضعیف برخې تمرین کړه، بیا دلته بیرته وګوره.'
      ],
      nextActionEn: 'Your next step: open Weak Areas and practice one of them.',
      nextActionPs: 'راتلونکی ګام: ضعیف برخې پرانیزه او یوه یې تمرین کړه.'
    },

    progress: {
      titleEn: 'Progress', titlePs: 'پرمختیا',
      purposeEn: 'This shows your streak and progress rings so you can see your effort over time.',
      purposePs: 'دا ستا لړۍ او د پرمختیا کړۍ ښیي ترڅو د وخت په تیریدو خپله هڅه وګورې.',
      stepsEn: [
        'Check your streak — try to practice every day.',
        'Watch the rings fill as you learn.',
        'Return to Home to continue your class.'
      ],
      stepsPs: [
        'خپله لړۍ وګوره — هڅه وکړه هره ورځ تمرین وکړې.',
        'وګوره چې د زده کړې سره کړۍ ډکیږي.',
        'کور ته ورشه ترڅو خپل ټولګي ته دوام ورکړې.'
      ],
      nextActionEn: 'Your next step: go to Home and continue today\'s class.',
      nextActionPs: 'راتلونکی ګام: کور ته ورشه او نننۍ ټولګي ته دوام ورکړه.'
    },

    // ── INTERVIEW WIZARD (I6B3) ───────────────────────────────────────────
    'interview-home': {
      titleEn: 'Interview Wizard', titlePs: 'د مرکې وزرډ',
      purposeEn: 'Here you practice real interview speaking, from beginner to academy level.',
      purposePs: 'دلته د ریښتیني مرکې خبرې تمرینوې، له پیل نه تر اکاډمۍ کچې پورې.',
      stepsEn: [
        'Choose an interview type from the row of categories (like School, First Job, or HSO / Delivery).',
        'Choose a level: All Levels shows everything; L1 is easiest, L10 is hardest.',
        'Or type in the search box to find an interview.',
        'Press Start on an available interview. "Planned" means it opens in a future lesson.'
      ],
      stepsPs: [
        'د کټګوریو له کتار نه د مرکې یو ډول غوره کړه (لکه ښوونځی، لومړۍ دنده، یا HSO / ډیلیوري).',
        'یوه کچه غوره کړه: ټولې کچې هرڅه ښیي؛ L1 تر ټولو اسانه ده، L10 تر ټولو ستونزمنه ده.',
        'یا د لټون په بکس کې ولیکه ترڅو یوه مرکه پیدا کړې.',
        'په یوه چمتو مرکه «پیل» کېکاږه. «پلان شوی» یعنې په راتلونکي لوست کې پرانیستل کیږي.'
      ],
      nextActionEn: 'Your next step: pick a category, choose your level, then press Start on an open interview.',
      nextActionPs: 'راتلونکی ګام: یوه کټګوري وټاکه، خپله کچه غوره کړه، بیا په یوه خلاصه مرکه «پیل» کېکاږه.',
      pathContextEn: 'Interview practice trains the real speaking you will use for jobs and study.',
      pathContextPs: 'د مرکې تمرین هغه ریښتیني خبرې روزي چې د دندې او زده کړې لپاره یې کاروې.'
    },

    'interview-practice-question': {
      titleEn: 'Interview Practice — Question', titlePs: 'د مرکې تمرین — پوښتنه',
      purposeEn: 'Stage 1 of 3. First you learn the interview question.',
      purposePs: 'له ۳ نه ۱ پړاو. لومړی د مرکې پوښتنه زده کوې.',
      stepsEn: [
        'Press "Hear Question" to listen to the question.',
        'Read the Pashto support below it if you need help.',
        'Press "Hear Question" again to repeat it as many times as you like.'
      ],
      stepsPs: [
        '«پوښتنه واوره» کېکاږه ترڅو پوښتنه واورې.',
        'که مرستې ته اړتیا لرې، لاندې پښتو ملاتړ ولوله.',
        'بیا «پوښتنه واوره» کېکاږه ترڅو څو ځله یې تکرار کړې.'
      ],
      nextActionEn: 'Your next step: hear the question, then move to the Answer stage.',
      nextActionPs: 'راتلونکی ګام: پوښتنه واوره، بیا د ځواب پړاو ته ورشه.'
    },

    'interview-practice-answer': {
      titleEn: 'Interview Practice — Answer', titlePs: 'د مرکې تمرین — ځواب',
      purposeEn: 'Stage 2 of 3. Now you answer in English.',
      purposePs: 'له ۳ نه ۲ پړاو. اوس په انګلیسي ځواب ورکوې.',
      stepsEn: [
        'Press "Speak Answer" and speak clearly. The app listens and writes your answer.',
        'You can Type your answer instead, or Clear it and try again.',
        'Open "Sample Answer" to compare, and "Tips" for ideas — learn the structure, do not copy blindly.'
      ],
      stepsPs: [
        '«ځواب ووایه» کېکاږه او په روښانه توګه وغږیږه. اپلیکیشن اوري او ستا ځواب لیکي.',
        'کولی شې ځواب ولیکې، یا یې پاک کړې او بیا هڅه وکړې.',
        'د پرتلې لپاره «نمونه ځواب» او د نظر لپاره «لارښوونې» پرانیزه — جوړښت زده کړه، ړوند مه کاپي کوه.'
      ],
      nextActionEn: 'Your next step: speak your answer, compare with the sample, then go to Practice.',
      nextActionPs: 'راتلونکی ګام: خپل ځواب ووایه، له نمونې سره یې پرتله کړه، بیا تمرین ته ورشه.'
    },

    'interview-practice-final': {
      titleEn: 'Interview Practice — Practice', titlePs: 'د مرکې تمرین — تمرین',
      purposeEn: 'Stage 3 of 3. Now you practice your final answer and improve it.',
      purposePs: 'له ۳ نه ۳ پړاو. اوس خپل وروستی ځواب تمرینوې او ښه یې کوې.',
      stepsEn: [
        'Say your answer again, more naturally this time.',
        'Read the feedback to see what was good and what to improve.',
        'Use the feedback, then move to the next question.'
      ],
      stepsPs: [
        'خپل ځواب بیا ووایه، دا ځل نور طبیعي.',
        'نظر ولوله ترڅو وګورې څه ښه وو او څه باید ښه شي.',
        'له نظر نه ګټه واخله، بیا بلې پوښتنې ته ورشه.'
      ],
      nextActionEn: 'Your next step: use the feedback, then continue to the next question.',
      nextActionPs: 'راتلونکی ګام: له نظر نه ګټه واخله، بیا بلې پوښتنې ته دوام ورکړه.'
    },

    'interview-settings': {
      titleEn: 'Interview Settings (Teacher)', titlePs: 'د مرکې تنظیمات (ښوونکی)',
      purposeEn: 'This area is for the teacher. It controls optional AI helper settings for Interview Wizard.',
      purposePs: 'دا برخه د ښوونکي لپاره ده. د مرکې وزرډ لپاره اختیاري د AI مرستندوی تنظیمات کنټرولوي.',
      stepsEn: [
        'Turn AI helpers on or off with the switches at the top.',
        'API keys are optional and used later for the AI coach.',
        'Press "Save Settings", then close with the ✕ button.'
      ],
      stepsPs: [
        'د پورته سویچونو سره د AI مرستندویان پرانیزه یا وتړه.',
        'د API کیلي اختیاري دي او وروسته د AI روزونکي لپاره کارول کیږي.',
        '«تنظیمات خوندي کړه» کېکاږه، بیا د ✕ تڼۍ سره یې وتړه.'
      ],
      nextActionEn: 'Your next step: save any changes, then close this panel.',
      nextActionPs: 'راتلونکی ګام: هر بدلون خوندي کړه، بیا دا پینل وتړه.'
    }
  };

  /* ==========================================================================
     Per-mode short guides for the Listening Room tabs (spoken on tab change).
     Kept as one-liners so they are calm and never long.
     ========================================================================== */
  var LISTEN_MODE_GUIDES = {
    repeat:   { en: 'Listen and Repeat. Press Listen, hear the sentence, then press Repeat and say it clearly.', ps: 'واوره او تکرار کړه. اورېدل کېکاږه، جمله واوره، بیا تکرار کېکاږه او په روښانه توګه یې ووایه.' },
    shadow:   { en: 'Shadowing. Speak at the same time as the audio to train your speed and rhythm. Slow it down first if you need to.', ps: 'سیوری کول. د غږ سره سم په یوه وخت خبرې وکړه ترڅو خپله چټکتیا او رېتم روزنه کړې. که اړتیا وه، لومړی یې ورو کړه.' },
    dictation:{ en: 'Dictation. Listen, then speak or type exactly what you heard. This trains your spelling.', ps: 'املا لیکنه. واوره، بیا هماغه څه چې واورېدل ووایه یا ولیکه. دا ستا املا روزي.' },
    pairs:    { en: 'Sound Pairs. These are two words with close sounds. Listen carefully to hear the difference.', ps: 'غږ جوړې. دا هغه دوه کلیمې دي چې غږونه یې نږدې دي. په دقت واوره ترڅو توپیر یې واورې.' },
    phonics:  { en: 'Phonics. Learn the sounds that letters make, so you can read new words on your own.', ps: 'فونیکس. هغه غږونه زده کړه چې توري یې جوړوي، ترڅو نوې کلیمې پخپله ولوستلی شې.' },
    minpairs: { en: 'Minimal Pairs. Two words that differ by only one sound. Train your ears to hear the small difference.', ps: 'لږترلږه جوړې. دوه کلیمې چې یوازې په یو غږ کې توپیر لري. خپل غوږونه وروزه ترڅو کوچنی توپیر واورې.' }
  };

  /* ==========================================================================
     INTERVIEW category guides (I6B3) — keyed by IW_GROUPS id. Future
     categories just add an entry here; the list page and Hear Guide pick it
     up automatically (data-driven, no fragile one-off code).
     Shape: { labelEn, labelPs, purposeEn, purposePs, bestForEn, bestForPs,
              nextActionEn, nextActionPs }
     ========================================================================== */
  var INTERVIEW_CATEGORIES = {
    all: {
      labelEn: 'All', labelPs: 'ټول',
      purposeEn: 'Shows every interview type in one list.', purposePs: 'د مرکې هر ډول په یو لست کې ښیي.',
      bestForEn: 'Browsing everything, or when you are not sure yet.', bestForPs: 'د هرڅه لیدو لپاره، یا کله چې لا ډاډه نه یې.'
    },
    beginner_personal: {
      labelEn: 'Beginner', labelPs: 'پیل کوونکی',
      purposeEn: 'Simple personal interviews to get you speaking with confidence.', purposePs: 'ساده شخصي مرکې چې تا په ډاډ سره خبرو ته راولي.',
      bestForEn: 'New students and first-time speakers.', bestForPs: 'نوي زده کوونکي او لومړی ځل ویناوال.'
    },
    school_student: {
      labelEn: 'School', labelPs: 'ښوونځی',
      purposeEn: 'Interviews about school, study, and student life.', purposePs: 'د ښوونځي، زده کړې او د زده کوونکي د ژوند په اړه مرکې.',
      bestForEn: 'School and university students.', bestForPs: 'د ښوونځي او پوهنتون زده کوونکي.'
    },
    daily_phone: {
      labelEn: 'Phone', labelPs: 'تلیفون',
      purposeEn: 'Phone-call style interviews and short spoken exchanges.', purposePs: 'د تلیفوني اړیکو په بڼه مرکې او لنډې خبرې.',
      bestForEn: 'Practicing quick, clear speaking on a call.', bestForPs: 'د تلیفون پر مهال د ګړندۍ او روښانه خبرې تمرین.'
    },
    first_job: {
      labelEn: 'First Job', labelPs: 'لومړۍ دنده',
      purposeEn: 'Interviews for your first job — how to introduce yourself and answer basic work questions.', purposePs: 'د لومړۍ دندې لپاره مرکې — څنګه ځان معرفي کړې او بنسټیزو کاري پوښتنو ته ځواب ورکړې.',
      bestForEn: 'Students looking for their first job.', bestForPs: 'هغه زده کوونکي چې خپله لومړۍ دنده لټوي.'
    },
    kandahar_ngo_un: {
      labelEn: 'Kandahar NGO / UN', labelPs: 'کندهار موسسه / ملل متحد',
      purposeEn: 'Interviews for NGO and UN-style roles common in the region.', purposePs: 'د سیمې لپاره د موسسو او ملګرو ملتونو د دندو په بڼه مرکې.',
      bestForEn: 'Students applying to organizations and NGOs.', bestForPs: 'هغه زده کوونکي چې موسسو او سازمانونو ته غوښتنلیک ورکوي.'
    },
    hso_delivery: {
      labelEn: 'HSO / Delivery', labelPs: 'HSO / ډیلیوري',
      purposeEn: 'Practice delivery rider, driver, and customer-support interviews for local platforms.', purposePs: 'د سیمه ییزو پلیټ فارمونو لپاره د ډیلیوري چلوونکي، ډرایور او پیرودونکو ملاتړ مرکې تمرین کړه.',
      bestForEn: 'Students applying for delivery and platform jobs.', bestForPs: 'هغه زده کوونکي چې د ډیلیوري او پلیټ فارم دندو لپاره غوښتنه کوي.'
    },
    professional_skills: {
      labelEn: 'Professional', labelPs: 'مسلکي',
      purposeEn: 'Workplace and skill-based interviews for professional roles.', purposePs: 'د مسلکي دندو لپاره د کار ځای او مهارت پر بنسټ مرکې.',
      bestForEn: 'Students with some work experience.', bestForPs: 'هغه زده کوونکي چې یو څه کاري تجربه لري.'
    },
    academic_scholarship: {
      labelEn: 'Academic', labelPs: 'علمي',
      purposeEn: 'University and scholarship interviews.', purposePs: 'د پوهنتون او بورس مرکې.',
      bestForEn: 'Students applying for study or scholarships.', bestForPs: 'هغه زده کوونکي چې د زده کړې یا بورس لپاره غوښتنه کوي.'
    },
    officer_formal: {
      labelEn: 'Officer / Formal', labelPs: 'رسمي',
      purposeEn: 'Formal and official interviews that need careful, polite English.', purposePs: 'رسمي مرکې چې پام او مؤدبه انګلیسي غواړي.',
      bestForEn: 'Advanced students preparing for formal roles.', bestForPs: 'پرمختللي زده کوونکي چې د رسمي دندو لپاره چمتووالی کوي.'
    },
    advanced_academy: {
      labelEn: 'Academy', labelPs: 'اکاډمي',
      purposeEn: 'The hardest interviews, at full academy level.', purposePs: 'تر ټولو ستونزمنې مرکې، په بشپړه اکاډمۍ کچه.',
      bestForEn: 'Advanced students at the top of the path.', bestForPs: 'پرمختللي زده کوونکي د لارې په سر کې.'
    }
  };

  /* ==========================================================================
     INTERVIEW level guides (I6B3A) — 0 = All Levels, then L1–L10 to match the
     ACTUAL level chips in interview-core.js (L1 easiest → L10 hardest).
     Every level is fully authored (En + Ps) — no templated middle, no gaps —
     so selecting L9/L10 never falls back to All Levels.
     ========================================================================== */
  var INTERVIEW_LEVELS = {
    0: { label: 'All Levels', titleEn: 'All Levels', titlePs: 'ټولې کچې',
         descEn: 'Shows interviews from every level.', descPs: 'له هرې کچې مرکې ښیي.',
         forEn: 'Browsing, or when you are not sure of your level.', forPs: 'د لټون لپاره، یا کله چې د خپلې کچې ډاډه نه یې.' },
    1: { label: 'L1', titleEn: 'Level 1 — Easiest', titlePs: 'کچه ۱ — تر ټولو اسانه',
         descEn: 'Very easy beginner interview answers — short and simple.', descPs: 'ډېر اسانه د پیل کوونکي د مرکې ځوابونه — لنډ او ساده.',
         forEn: 'Brand-new beginners.', forPs: 'بشپړ نوي پیل کوونکي.' },
    2: { label: 'L2', titleEn: 'Level 2', titlePs: 'کچه ۲',
         descEn: 'Simple beginner answers with short reasons.', descPs: 'ساده د پیل کوونکي ځوابونه له لنډو دلایلو سره.',
         forEn: 'Beginners who can say a few sentences.', forPs: 'هغه پیل کوونکي چې څو جملې ویلی شي.' },
    3: { label: 'L3', titleEn: 'Level 3', titlePs: 'کچه ۳',
         descEn: 'Beginner-plus answers with more detail.', descPs: 'له پیل نه یو ګام پورته ځوابونه له نورو جزئیاتو سره.',
         forEn: 'Students moving past the basics.', forPs: 'هغه زده کوونکي چې له بنسټونو تېرېږي.' },
    4: { label: 'L4', titleEn: 'Level 4', titlePs: 'کچه ۴',
         descEn: 'Lower-intermediate interview answers.', descPs: 'د ټیټې منځنۍ کچې د مرکې ځوابونه.',
         forEn: 'Students building longer answers.', forPs: 'هغه زده کوونکي چې اوږده ځوابونه جوړوي.' },
    5: { label: 'L5', titleEn: 'Level 5', titlePs: 'کچه ۵',
         descEn: 'Practical job and service interview answers.', descPs: 'د دندې او خدماتو د مرکو عملي ځوابونه.',
         forEn: 'Students preparing for real job interviews.', forPs: 'هغه زده کوونکي چې ریښتینو د دندې مرکو ته چمتووالی کوي.' },
    6: { label: 'L6', titleEn: 'Level 6', titlePs: 'کچه ۶',
         descEn: 'Stronger workplace and responsibility answers.', descPs: 'د کار ځای او مسؤولیت پیاوړي ځوابونه.',
         forEn: 'Students with some work-interview practice.', forPs: 'هغه زده کوونکي چې د دندې مرکو یو څه تمرین لري.' },
    7: { label: 'L7', titleEn: 'Level 7', titlePs: 'کچه ۷',
         descEn: 'Advanced professional answers.', descPs: 'پرمختللي مسلکي ځوابونه.',
         forEn: 'Advanced students in professional settings.', forPs: 'پرمختللي زده کوونکي په مسلکي چاپیریال کې.' },
    8: { label: 'L8', titleEn: 'Level 8', titlePs: 'کچه ۸',
         descEn: 'High-level professional and academic answers.', descPs: 'لوړې کچې مسلکي او علمي ځوابونه.',
         forEn: 'Strong students near the top of the path.', forPs: 'پیاوړي زده کوونکي د لارې سر ته نږدې.' },
    9: { label: 'L9', titleEn: 'Level 9', titlePs: 'کچه ۹',
         descEn: 'Expert interview answers with strategy and evidence.', descPs: 'د متخصص د مرکې ځوابونه له ستراتیژۍ او شواهدو سره.',
         forEn: 'Expert-level students.', forPs: 'د متخصص کچې زده کوونکي.' },
    10:{ label: 'L10', titleEn: 'Level 10 — Hardest', titlePs: 'کچه ۱۰ — تر ټولو ستونزمنه',
         descEn: 'The hardest academy interviews — mature, confident, detailed responses.', descPs: 'تر ټولو ستونزمنې د اکاډمۍ مرکې — پاخه، ډاډمن او مفصل ځوابونه.',
         forEn: 'Top academy-level students only.', forPs: 'یوازې د اکاډمۍ د لوړې کچې زده کوونکي.' }
  };
  // L0–L10 are all authored above; anything outside that range safely shows
  // the All Levels guidance (never blank, never Farsi).
  function interviewLevelGuide(n) {
    if (INTERVIEW_LEVELS[n]) return INTERVIEW_LEVELS[n];
    return INTERVIEW_LEVELS[0];
  }

  function interviewCategoryGuide(id) {
    return INTERVIEW_CATEGORIES[id] || INTERVIEW_CATEGORIES.all;
  }

  // Short spoken line for a category (used by manual Hear Guide on chip change).
  function interviewCategoryScript(id) {
    var c = interviewCategoryGuide(id);
    var parts = [c.labelEn + '.'];
    if (c.purposeEn) parts.push(c.purposeEn);
    if (c.bestForEn) parts.push('Best for: ' + c.bestForEn);
    return parts.join(' ');
  }
  function interviewLevelScript(n) {
    var l = interviewLevelGuide(n);
    var parts = [l.titleEn + '.'];
    if (l.descEn) parts.push(l.descEn);
    if (l.forEn) parts.push('Recommended for: ' + l.forEn);
    return parts.join(' ');
  }

  /* ========================================================================== */

  function get(id) { return REGISTRY[id] || null; }

  // Build the spoken script from the guide fields (one system, no per-page TTS).
  function script(id) {
    var g = get(id);
    if (!g) return '';
    if (g.ttsScriptEn) return g.ttsScriptEn;
    var parts = [];
    parts.push('Welcome to ' + g.titleEn + '.');
    if (g.purposeEn) parts.push(g.purposeEn);
    if (g.stepsEn && g.stepsEn.length) parts.push(g.stepsEn.join(' '));
    if (g.pathContextEn) parts.push(g.pathContextEn);
    if (g.nextActionEn) parts.push(g.nextActionEn);
    return parts.join(' ');
  }

  // MANUAL "Hear Guide": always speaks (direct response to the student's tap),
  // exactly like every other manual Read/Hear button in the app.
  function speak(id) {
    var text = script(id);
    if (text) speakText(text);
  }

  // AUTO guide on page open: only if Auto Read is ON, and only once per open.
  var _lastAuto = { id: null, at: 0 };
  function autoSpeak(id) {
    if (!autoReadOn()) return;
    var now = Date.now();
    // guard against double-fire within the same open (e.g. re-render)
    if (_lastAuto.id === id && (now - _lastAuto.at) < 1200) return;
    _lastAuto = { id: id, at: now };
    // small delay lets the DOM settle and avoids clipping the first word
    setTimeout(function () { if (autoReadOn()) speak(id); }, 450);
  }

  // Compact, collapsible guide card. Uses only dark/light-safe classes.
  // Not a floating toast — it sits inline at the top of the page content.
  function cardHtml(id, opts) {
    var g = get(id);
    if (!g) return '';
    opts = opts || {};
    var stepsHtml = '';
    if (g.stepsEn && g.stepsEn.length) {
      stepsHtml = '<ol class="zk-guide-steps">' +
        g.stepsEn.map(function (s, i) {
          var p = (g.stepsPs && g.stepsPs[i]) ? g.stepsPs[i] : '';
          return '<li class="zk-readable">' + esc(s) +
            (p ? '<span class="zk-pashto-readable pashto" dir="rtl" lang="ps"> ' + esc(p) + '</span>' : '') +
            '</li>';
        }).join('') +
      '</ol>';
    }
    var nextHtml = g.nextActionEn
      ? '<div class="zk-guide-next"><span class="zk-guide-next-lbl">Next:</span> ' +
          '<span class="zk-readable">' + esc(g.nextActionEn) + '</span>' +
          (g.nextActionPs ? '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">' + esc(g.nextActionPs) + '</div>' : '') +
        '</div>'
      : '';

    // Details/summary = native, accessible collapse. No JS, no toast.
    return '' +
      '<details class="zk-guide-card zk-page-guide" data-guide-id="' + esc(id) + '"' + (opts.open ? ' open' : '') + '>' +
        '<summary class="zk-guide-summary">' +
          '<span class="zk-guide-badge">📖 Guide</span>' +
          '<span class="zk-guide-purpose zk-readable">' + esc(g.purposeEn) + '</span>' +
          '<button type="button" class="zk-guide-hear zk-choice-readable" ' +
            'onclick="event.preventDefault();event.stopPropagation();ZirakPageGuides.speak(\'' + esc(id) + '\')" ' +
            'aria-label="Hear guide aloud">🔊 Hear Guide</button>' +
        '</summary>' +
        '<div class="zk-guide-body">' +
          '<div class="zk-pashto-readable pashto zk-guide-purpose-ps" dir="rtl" lang="ps">' + esc(ps(g.purposePs)) + '</div>' +
          stepsHtml +
          nextHtml +
        '</div>' +
      '</details>';
  }

  // Idempotent mount: insert the guide card once at the top of a container.
  // Returns true if a card is present (mounted now or already there).
  function mount(id, container, opts) {
    if (!container) return false;
    var existing = container.querySelector(':scope > .zk-page-guide[data-guide-id="' + id + '"]');
    if (existing) return true;
    var html = cardHtml(id, opts);
    if (!html) return false;
    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var node = wrap.firstChild;
    if (container.firstChild) container.insertBefore(node, container.firstChild);
    else container.appendChild(node);
    return true;
  }

  // Map a top-level screen id → { guideId, containerId }. Only pages that are
  // rendered as static HTML sections mount here; dynamically-rendered pages
  // (Grammar World, Listening tabs) mount from inside their own render code.
  var SCREEN_MAP = {
    home:      { guide: 'home',     container: 'screen-home',      after: '.page-header' },
    path:      { guide: 'path',     container: 'screen-path',      after: '.page-header' },
    listening: { guide: 'listening',container: 'screen-listening', after: '.page-header' },
    wordlab:   { guide: 'wordlab',  container: 'screen-wordlab',   after: '.page-header' },
    stories:   { guide: 'stories',  container: 'screen-stories',   after: '.page-header' },
    topics:    { guide: 'topics',   container: 'screen-topics',    after: '.page-header' },
    dialogue:  { guide: 'dialogue', container: 'screen-dialogue',  after: '.page-header' },
    review:    { guide: 'review',   container: 'screen-review',    after: '.page-header' },
    progress:  { guide: 'progress', container: 'screen-progress',  after: '.page-header' }
  };

  // Insert the guide card right AFTER the page header (so the header stays on
  // top), idempotently. Called by navigate() for static screens.
  function mountForScreen(screenId) {
    var m = SCREEN_MAP[screenId];
    if (!m) return;
    var screen = document.getElementById(m.container);
    if (!screen) return;
    var already = screen.querySelector('.zk-page-guide[data-guide-id="' + m.guide + '"]');
    if (!already) {
      var html = cardHtml(m.guide);
      if (html) {
        var wrap = document.createElement('div');
        wrap.innerHTML = html;
        var node = wrap.firstChild;
        var anchor = m.after ? screen.querySelector(m.after) : null;
        if (anchor && anchor.parentNode === screen) {
          if (anchor.nextSibling) screen.insertBefore(node, anchor.nextSibling);
          else screen.appendChild(node);
        } else if (screen.firstChild) {
          screen.insertBefore(node, screen.firstChild);
        } else {
          screen.appendChild(node);
        }
      }
    }
    autoSpeak(m.guide);
  }

  // Speak a Listening Room mode guide (short, one-liner). Manual-safe.
  function speakListenMode(mode, auto) {
    var g = LISTEN_MODE_GUIDES[mode];
    if (!g) return;
    if (auto && !autoReadOn()) return;
    speakText(g.en);
  }
  function listenModeText(mode) {
    var g = LISTEN_MODE_GUIDES[mode];
    return g ? g : null;
  }

  window.ZirakPageGuides = {
    PENDING: PENDING,
    registry: REGISTRY,
    listenModeGuides: LISTEN_MODE_GUIDES,
    get: get,
    script: script,
    speak: speak,           // manual "Hear Guide"
    autoSpeak: autoSpeak,   // auto on page open (respects Auto Read)
    cardHtml: cardHtml,
    mount: mount,
    mountForScreen: mountForScreen,
    speakListenMode: speakListenMode,
    listenModeText: listenModeText,
    stopSpeech: stopSpeech,
    ps: ps,
    // Interview guidance (I6B3)
    interviewCategories: INTERVIEW_CATEGORIES,
    interviewLevels: INTERVIEW_LEVELS,
    interviewCategoryGuide: interviewCategoryGuide,
    interviewLevelGuide: interviewLevelGuide,
    interviewCategoryScript: interviewCategoryScript,
    interviewLevelScript: interviewLevelScript
  };
})();
