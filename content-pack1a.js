// ===================================================================
// ZIRAK APP — content-pack1a.js
// Version: v1.14B — Pack 1A Clean Integration
// ===================================================================
//
// PURPOSE:
//   Adds Pack 1A word sets to WORD_SETS.
//   MUST load AFTER content.js (which defines WORD_SETS).
//   MUST load BEFORE app.js.
//
// LOAD ORDER in index.html:
//   content-core.js
//   content-wordlab.js
//   content-grammar.js
//   content-dialogues.js
//   content-review.js
//   content.js           ← WORD_SETS is defined here
//   content-pack1a.js    ← this file extends WORD_SETS
//   app.js
//
// LANGUAGE FIELDS:
//   Each word has: id, en, dari, pashto, ex_en, ex_dari, ex_pashto
//   Pashto is content-meaning only. It is NOT a UI language.
//   The zirakExtractMeaning() function in app.js already handles
//   the `pashto` and `dari` fields — no app.js changes needed.
//
// ===================================================================

(function() {
  'use strict';

  // Guard: WORD_SETS must already exist (defined in content.js)
  if (typeof WORD_SETS === 'undefined') {
    console.error('[Pack1A] ERROR: WORD_SETS not found. content.js must load before content-pack1a.js.');
    return;
  }

  // ---------------------------------------------------------------
  // PACK 1A — GREETINGS
  // ---------------------------------------------------------------
  WORD_SETS['pack1a_greetings'] = {
    en:   'Pack 1A - Greetings',
    dari: '',
    icon: '👋',
    words: [
      {
        id: 'p1a_hello',
        en: 'hello',
        dari: '',
        pashto: 'سلام',
        ex_en: 'Hello! How are you?',
        ex_dari: '',
        ex_pashto: 'سلام! تاسو ښه یاست؟'
      },
      {
        id: 'p1a_goodbye',
        en: 'goodbye',
        dari: '',
        pashto: 'په امان',
        ex_en: 'Goodbye! See you tomorrow.',
        ex_dari: '',
        ex_pashto: 'په امان! سبا به مو وینو.'
      },
      {
        id: 'p1a_thankyou',
        en: 'thank you',
        dari: '',
        pashto: 'مننه',
        ex_en: 'Thank you for your help.',
        ex_dari: '',
        ex_pashto: 'ستاسو د مرستې مننه.'
      },
      {
        id: 'p1a_please',
        en: 'please',
        dari: '',
        pashto: 'مهرباني وکه',
        ex_en: 'Please sit down.',
        ex_dari: '',
        ex_pashto: 'مهرباني وکه کیناستئ.'
      },
      {
        id: 'p1a_sorry',
        en: 'sorry',
        dari: '',
        pashto: 'بخښنه غواړم',
        ex_en: 'I am sorry for being late.',
        ex_dari: '',
        ex_pashto: 'زه بخښنه غواړم چې ناوخته راغلم.'
      },
      {
        id: 'p1a_yes',
        en: 'yes',
        dari: '',
        pashto: 'هو',
        ex_en: 'Yes, I understand.',
        ex_dari: '',
        ex_pashto: 'هو، زه پوهیږم.'
      },
      {
        id: 'p1a_no',
        en: 'no',
        dari: '',
        pashto: 'نه',
        ex_en: 'No, I do not know.',
        ex_dari: '',
        ex_pashto: 'نه، زه نه پوهیږم.'
      },
      {
        id: 'p1a_good_morning',
        en: 'good morning',
        dari: '',
        pashto: 'سهار مو پخیر',
        ex_en: 'Good morning, teacher!',
        ex_dari: '',
        ex_pashto: 'سهار مو پخیر، ښوونکیه!'
      },
      {
        id: 'p1a_good_night',
        en: 'good night',
        dari: '',
        pashto: 'شپه مو پخیر',
        ex_en: 'Good night, everyone.',
        ex_dari: '',
        ex_pashto: 'شپه مو پخیر، ټولو.'
      },
      {
        id: 'p1a_how_are_you',
        en: 'how are you',
        dari: '',
        pashto: 'تاسو ښه یاست',
        ex_en: 'How are you today?',
        ex_dari: '',
        ex_pashto: 'نن تاسو ښه یاست؟'
      }
    ]
  };

  // ---------------------------------------------------------------
  // PACK 1A — CLASSROOM
  // ---------------------------------------------------------------
  WORD_SETS['pack1a_classroom'] = {
    en:   'Pack 1A - Classroom',
    dari: '',
    icon: '🏫',
    words: [
      {
        id: 'p1a_teacher',
        en: 'teacher',
        dari: '',
        pashto: 'ښوونکی',
        ex_en: 'The teacher explains the lesson.',
        ex_dari: '',
        ex_pashto: 'ښوونکی لوست تشریح کوي.'
      },
      {
        id: 'p1a_student',
        en: 'student',
        dari: '',
        pashto: 'زده‌کوونکی',
        ex_en: 'The student reads the book.',
        ex_dari: '',
        ex_pashto: 'زده‌کوونکی کتاب لولي.'
      },
      {
        id: 'p1a_book',
        en: 'book',
        dari: '',
        pashto: 'کتاب',
        ex_en: 'Please open your book.',
        ex_dari: '',
        ex_pashto: 'مهرباني خپل کتاب پرانیزه.'
      },
      {
        id: 'p1a_pen',
        en: 'pen',
        dari: '',
        pashto: 'قلم',
        ex_en: 'Write with your pen.',
        ex_dari: '',
        ex_pashto: 'د خپل قلم سره ولیکه.'
      },
      {
        id: 'p1a_board',
        en: 'board',
        dari: '',
        pashto: 'تخته',
        ex_en: 'Look at the board, please.',
        ex_dari: '',
        ex_pashto: 'مهرباني تخته ته وګوره.'
      },
      {
        id: 'p1a_class',
        en: 'class',
        dari: '',
        pashto: 'ټولګی',
        ex_en: 'Our class starts at eight.',
        ex_dari: '',
        ex_pashto: 'زموږ ټولګی د اتو بجو پیلیږي.'
      },
      {
        id: 'p1a_homework',
        en: 'homework',
        dari: '',
        pashto: 'کورنی کار',
        ex_en: 'Did you do your homework?',
        ex_dari: '',
        ex_pashto: 'ایا ته خپل کورنی کار کړی دی؟'
      },
      {
        id: 'p1a_question',
        en: 'question',
        dari: '',
        pashto: 'پوښتنه',
        ex_en: 'Ask a question if you do not understand.',
        ex_dari: '',
        ex_pashto: 'که نه پوهیدلې پوښتنه وکه.'
      },
      {
        id: 'p1a_answer',
        en: 'answer',
        dari: '',
        pashto: 'ځواب',
        ex_en: 'What is the answer?',
        ex_dari: '',
        ex_pashto: 'ځواب څه دی؟'
      },
      {
        id: 'p1a_lesson',
        en: 'lesson',
        dari: '',
        pashto: 'لوست',
        ex_en: 'Today\'s lesson is about numbers.',
        ex_dari: '',
        ex_pashto: 'د نن لوست د شمیرو په اړه دی.'
      }
    ]
  };

  // ---------------------------------------------------------------
  // PACK 1A — FAMILY
  // ---------------------------------------------------------------
  WORD_SETS['pack1a_family'] = {
    en:   'Pack 1A - Family',
    dari: '',
    icon: '👨‍👩‍👧‍👦',
    words: [
      {
        id: 'p1a_mother',
        en: 'mother',
        dari: '',
        pashto: 'مور',
        ex_en: 'My mother is kind.',
        ex_dari: '',
        ex_pashto: 'زما مور مهربانه ده.'
      },
      {
        id: 'p1a_father',
        en: 'father',
        dari: '',
        pashto: 'پلار',
        ex_en: 'My father works hard.',
        ex_dari: '',
        ex_pashto: 'زما پلار سخت کار کوي.'
      },
      {
        id: 'p1a_brother',
        en: 'brother',
        dari: '',
        pashto: 'ورور',
        ex_en: 'My brother is older than me.',
        ex_dari: '',
        ex_pashto: 'زما ورور له ما لوی دی.'
      },
      {
        id: 'p1a_sister',
        en: 'sister',
        dari: '',
        pashto: 'خور',
        ex_en: 'My sister goes to school.',
        ex_dari: '',
        ex_pashto: 'زما خور ښوونځي ته ځي.'
      },
      {
        id: 'p1a_grandfather',
        en: 'grandfather',
        dari: '',
        pashto: 'نیکه',
        ex_en: 'My grandfather tells stories.',
        ex_dari: '',
        ex_pashto: 'زما نیکه کیسې کوي.'
      },
      {
        id: 'p1a_grandmother',
        en: 'grandmother',
        dari: '',
        pashto: 'نیا',
        ex_en: 'My grandmother makes good food.',
        ex_dari: '',
        ex_pashto: 'زما نیا ښه خوراک جوړوي.'
      },
      {
        id: 'p1a_son',
        en: 'son',
        dari: '',
        pashto: 'زوی',
        ex_en: 'He is their youngest son.',
        ex_dari: '',
        ex_pashto: 'هغه د دوی کوچنی زوی دی.'
      },
      {
        id: 'p1a_daughter',
        en: 'daughter',
        dari: '',
        pashto: 'لور',
        ex_en: 'Their daughter is a good student.',
        ex_dari: '',
        ex_pashto: 'د دوی لور ښه زده‌کوونکې ده.'
      },
      {
        id: 'p1a_family',
        en: 'family',
        dari: '',
        pashto: 'کورنۍ',
        ex_en: 'My family lives together.',
        ex_dari: '',
        ex_pashto: 'زما کورنۍ سره یو ځای ژوند کوي.'
      },
      {
        id: 'p1a_uncle',
        en: 'uncle',
        dari: '',
        pashto: 'تره / کاکا',
        ex_en: 'My uncle visits us on Friday.',
        ex_dari: '',
        ex_pashto: 'زما تره جمعه موږ ته راځي.'
      }
    ]
  };

  // ---------------------------------------------------------------
  // PACK 1A — HOME
  // ---------------------------------------------------------------
  WORD_SETS['pack1a_home'] = {
    en:   'Pack 1A - Home',
    dari: '',
    icon: '🏠',
    words: [
      {
        id: 'p1a_house',
        en: 'house',
        dari: '',
        pashto: 'کور',
        ex_en: 'We live in a small house.',
        ex_dari: '',
        ex_pashto: 'موږ یو کوچني کور کې ژوند کوو.'
      },
      {
        id: 'p1a_room',
        en: 'room',
        dari: '',
        pashto: 'خونه',
        ex_en: 'My room is clean.',
        ex_dari: '',
        ex_pashto: 'زما خونه پاکه ده.'
      },
      {
        id: 'p1a_door',
        en: 'door',
        dari: '',
        pashto: 'دروازه',
        ex_en: 'Please close the door.',
        ex_dari: '',
        ex_pashto: 'مهرباني دروازه وتړه.'
      },
      {
        id: 'p1a_window',
        en: 'window',
        dari: '',
        pashto: 'کړکۍ',
        ex_en: 'Open the window for fresh air.',
        ex_dari: '',
        ex_pashto: 'د تازه هوا لپاره کړکۍ پرانیزه.'
      },
      {
        id: 'p1a_bed',
        en: 'bed',
        dari: '',
        pashto: 'کټ',
        ex_en: 'I sleep in my bed.',
        ex_dari: '',
        ex_pashto: 'زه پخپل کټ کې ویده کیږم.'
      },
      {
        id: 'p1a_kitchen',
        en: 'kitchen',
        dari: '',
        pashto: 'پخلنخانه',
        ex_en: 'My mother cooks in the kitchen.',
        ex_dari: '',
        ex_pashto: 'زما مور پخلنخانه کې پخوي.'
      },
      {
        id: 'p1a_table',
        en: 'table',
        dari: '',
        pashto: 'میز',
        ex_en: 'Put your book on the table.',
        ex_dari: '',
        ex_pashto: 'خپل کتاب میز باندې کیښوده.'
      },
      {
        id: 'p1a_chair',
        en: 'chair',
        dari: '',
        pashto: 'چوکۍ',
        ex_en: 'Please sit on the chair.',
        ex_dari: '',
        ex_pashto: 'مهرباني چوکۍ باندې کینه.'
      },
      {
        id: 'p1a_garden',
        en: 'garden',
        dari: '',
        pashto: 'باغچه',
        ex_en: 'We have flowers in the garden.',
        ex_dari: '',
        ex_pashto: 'موږ باغچه کې ګلونه لرو.'
      },
      {
        id: 'p1a_key',
        en: 'key',
        dari: '',
        pashto: 'کیلي',
        ex_en: 'Do you have the key?',
        ex_dari: '',
        ex_pashto: 'ایا تاسو کیلي لرئ؟'
      }
    ]
  };

  // ---------------------------------------------------------------
  // PACK 1A — FOOD & DRINK
  // ---------------------------------------------------------------
  WORD_SETS['pack1a_food_drink'] = {
    en:   'Pack 1A - Food & Drink',
    dari: '',
    icon: '🍽️',
    words: [
      {
        id: 'p1a_water',
        en: 'water',
        dari: '',
        pashto: 'اوبه',
        ex_en: 'I drink water every day.',
        ex_dari: '',
        ex_pashto: 'زه هره ورځ اوبه څښم.'
      },
      {
        id: 'p1a_bread',
        en: 'bread',
        dari: '',
        pashto: 'ډوډۍ',
        ex_en: 'We eat bread every morning.',
        ex_dari: '',
        ex_pashto: 'موږ هره سهار ډوډۍ خورو.'
      },
      {
        id: 'p1a_rice',
        en: 'rice',
        dari: '',
        pashto: 'وريژې',
        ex_en: 'We eat rice for lunch.',
        ex_dari: '',
        ex_pashto: 'موږ د غرمې لپاره وريژې خورو.'
      },
      {
        id: 'p1a_milk',
        en: 'milk',
        dari: '',
        pashto: 'شودې',
        ex_en: 'Children need milk to grow.',
        ex_dari: '',
        ex_pashto: 'ماشومان د وده لپاره شودو ته اړتیا لري.'
      },
      {
        id: 'p1a_tea',
        en: 'tea',
        dari: '',
        pashto: 'چای',
        ex_en: 'My father drinks green tea.',
        ex_dari: '',
        ex_pashto: 'زما پلار شین چای څښي.'
      },
      {
        id: 'p1a_fruit',
        en: 'fruit',
        dari: '',
        pashto: 'مېوه',
        ex_en: 'Eat fruit every day to stay healthy.',
        ex_dari: '',
        ex_pashto: 'د روغتیا لپاره هره ورځ مېوه وخوره.'
      },
      {
        id: 'p1a_meat',
        en: 'meat',
        dari: '',
        pashto: 'غوښه',
        ex_en: 'We cook meat on Friday.',
        ex_dari: '',
        ex_pashto: 'موږ جمعه غوښه پخوو.'
      },
      {
        id: 'p1a_egg',
        en: 'egg',
        dari: '',
        pashto: 'هګۍ',
        ex_en: 'I eat one egg for breakfast.',
        ex_dari: '',
        ex_pashto: 'زه سهار یوه هګۍ خورم.'
      },
      {
        id: 'p1a_vegetable',
        en: 'vegetable',
        dari: '',
        pashto: 'سبزي',
        ex_en: 'Vegetables are good for your health.',
        ex_dari: '',
        ex_pashto: 'سبزي ستاسو روغتیا ته ښه ده.'
      },
      {
        id: 'p1a_soup',
        en: 'soup',
        dari: '',
        pashto: 'شوربا',
        ex_en: 'Hot soup is good in winter.',
        ex_dari: '',
        ex_pashto: 'ګرمه شوربا د ژمي په موسم ښه ده.'
      }
    ]
  };

  // ---------------------------------------------------------------
  // PACK 1A — COMMON VERBS
  // ---------------------------------------------------------------
  WORD_SETS['pack1a_common_verbs'] = {
    en:   'Pack 1A - Common Verbs',
    dari: '',
    icon: '⚡',
    words: [
      {
        id: 'p1a_go',
        en: 'go',
        dari: '',
        pashto: 'تلل',
        ex_en: 'I go to class.',
        ex_dari: '',
        ex_pashto: 'زه ټولګي ته ځم.'
      },
      {
        id: 'p1a_come',
        en: 'come',
        dari: '',
        pashto: 'راتلل',
        ex_en: 'Please come to the board.',
        ex_dari: '',
        ex_pashto: 'مهرباني تخته ته راشه.'
      },
      {
        id: 'p1a_read',
        en: 'read',
        dari: '',
        pashto: 'لوستل',
        ex_en: 'I read every night.',
        ex_dari: '',
        ex_pashto: 'زه هره شپه لولم.'
      },
      {
        id: 'p1a_write',
        en: 'write',
        dari: '',
        pashto: 'لیکل',
        ex_en: 'Write your name here.',
        ex_dari: '',
        ex_pashto: 'دلته خپل نوم ولیکه.'
      },
      {
        id: 'p1a_speak',
        en: 'speak',
        dari: '',
        pashto: 'خبرې کول',
        ex_en: 'Speak slowly, please.',
        ex_dari: '',
        ex_pashto: 'مهرباني ورو خبرې وکه.'
      },
      {
        id: 'p1a_listen',
        en: 'listen',
        dari: '',
        pashto: 'اوریدل',
        ex_en: 'Listen carefully to the teacher.',
        ex_dari: '',
        ex_pashto: 'ښوونکي ته غوږ ونیسه.'
      },
      {
        id: 'p1a_open',
        en: 'open',
        dari: '',
        pashto: 'پرانیستل',
        ex_en: 'Open your book to page ten.',
        ex_dari: '',
        ex_pashto: 'خپل کتاب لسم مخ ته پرانیزه.'
      },
      {
        id: 'p1a_close',
        en: 'close',
        dari: '',
        pashto: 'تړل',
        ex_en: 'Close the door when you leave.',
        ex_dari: '',
        ex_pashto: 'کله چې ووځې دروازه وتړه.'
      },
      {
        id: 'p1a_eat',
        en: 'eat',
        dari: '',
        pashto: 'خوړل',
        ex_en: 'We eat together as a family.',
        ex_dari: '',
        ex_pashto: 'موږ د کورنۍ په توګه سره یو ځای خورو.'
      },
      {
        id: 'p1a_help',
        en: 'help',
        dari: '',
        pashto: 'مرسته کول',
        ex_en: 'Can you help me, please?',
        ex_dari: '',
        ex_pashto: 'ایا تاسو زما سره مرسته کولی شئ؟'
      }
    ]
  };

  // Confirmation log
  console.log('[Pack1A] Loaded 6 sets into WORD_SETS:',
    'pack1a_greetings,',
    'pack1a_classroom,',
    'pack1a_family,',
    'pack1a_home,',
    'pack1a_food_drink,',
    'pack1a_common_verbs'
  );

})();

// ===================================================================
// PACK REGISTRY — Register Pack 1A if the registry is available
// (content-pack-registry.js must be loaded before this file)
// ===================================================================
if (typeof zirakRegisterPack === 'function') {
  zirakRegisterPack({
    id:          'pack1a',
    titleEn:     'Pack 1A - Beginner Daily Survival English',
    titleDari:   '',
    titlePashto:  'پیکج ۱الف - د پیل کونکو لپاره ورځني انګلیسي',
    version:     'v1.14B',
    sourceFile:  'content-pack1a.js',
    wordSetKeys: [
      'pack1a_greetings',
      'pack1a_classroom',
      'pack1a_family',
      'pack1a_home',
      'pack1a_food_drink',
      'pack1a_common_verbs'
    ],
    type:   'wordlab',
    status: 'active'
  });
}

// ===================================================================
// END content-pack1a.js
// ===================================================================
