// ===================================================================
// ZIRAK APP — content.js
// Version: v1.13A — Content Architecture Foundation (merged through v1.17F3-dialogue-pashto-complete)
// ===================================================================
//
// ROLE IN v1.13A:
//   This file is the COMPATIBILITY BRIDGE and FINAL CONTENT ASSEMBLER.
//   It defines all global variables that app.js depends on:
//     LEVELS, CATEGORIES, DIALOGUES, TOPIC_STUDIO_DATA, WIZARD_MODES,
//     STORIES, WORD_SETS, WORD_OF_DAY, LISTEN_SENTENCES, SOUND_PAIRS,
//     PLACEMENT_QUESTIONS, MILESTONES
//   These global names are preserved exactly. app.js is not changed.
//
// LOAD ORDER:
//   content-core.js → content-wordlab.js → content-grammar.js →
//   content-dialogues.js → content-review.js → content.js → app.js
//
//   content.js must be loaded LAST among content files, BEFORE app.js.
//
// ARCHITECTURE RULE (v1.13A+):
//   - New vocabulary content → content-wordlab.js (ZIRAK_WORDLAB_*)
//   - New grammar content    → content-grammar.js (ZIRAK_GRAMMAR_*)
//   - New dialogue/speaking  → content-dialogues.js (ZIRAK_SPEAKING_*)
//   - New review/mastery     → content-review.js (ZIRAK_REVIEW_*)
//   - This file: existing content only — do NOT add large new content here
//
// LANGUAGE RULE:
//   - English   : main learning language (all content)
//   - Pashto   : the only support translation language. Legacy `dari` fields are compatibility slots only after runtime migration.
//   legacy support is not used as a learner-facing support language in v1.17C.
//   App interface remains primarily English with Pashto support labels.
//
// ===================================================================

const LEVELS = [
  { id:'nursery', en:'Starter', dari:'' },
  { id:'basic', en:'Basic', dari:'' },
  { id:'beginner', en:'Beginner', dari:'' },
  { id:'intermediate', en:'Intermediate', dari:'' },
  { id:'advanced', en:'Advanced', dari:'' },
  { id:'academic', en:'Academic', dari:'' },
  { id:'ielts', en:'IELTS Prep', dari:'' }
];
const CATEGORIES = [
  { id:'daily-life', en:'Daily Life', dari:'' },
  { id:'family', en:'Family', dari:'' },
  { id:'school', en:'School', dari:'' },
  { id:'food', en:'Food', dari:'' },
  { id:'health', en:'Health', dari:'' },
  { id:'travel', en:'Travel', dari:'' },
  { id:'culture', en:'Afghan Culture', dari:'' }
];
const DIALOGUES = [
  {
    "id": "greet-01",
    "level": "nursery",
    "category": "daily-life",
    "titleEn": "Morning Greetings",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Good morning! How are you?",
        "promptPashto": "سهار مو پخیر! څنګه یاست؟",
        "promptDari": "سهار مو پخیر! څنګه یاست؟",
        "answerEn": "Good morning! I am fine, thank you.",
        "answerPashto": "سهار مو پخیر! زه ښه یم، مننه.",
        "answerDari": "سهار مو پخیر! زه ښه یم، مننه.",
        "phonetic": "sob-eh be-KHEYR | ha-le sha-MA chet-or ast"
      },
      {
        "promptEn": "What is your name?",
        "promptPashto": "ستاسو نوم څه دی؟",
        "promptDari": "ستاسو نوم څه دی؟",
        "answerEn": "My name is Ali. What is your name?",
        "answerPashto": "زما نوم علي دی. ستاسو نوم څه دی؟",
        "answerDari": "زما نوم علي دی. ستاسو نوم څه دی؟",
        "phonetic": "es-me sha-MA CHIST"
      },
      {
        "promptEn": "Nice to meet you!",
        "promptPashto": "ستاسو په لیدو خوشحاله شوم!",
        "promptDari": "ستاسو په لیدو خوشحاله شوم!",
        "answerEn": "Nice to meet you too!",
        "answerPashto": "زه هم ستاسو په لیدو خوشحاله شوم!",
        "answerDari": "زه هم ستاسو په لیدو خوشحاله شوم!",
        "phonetic": "khosh-HAL sha-DAM az ash-NA-ee"
      }
    ]
  },
  {
    "id": "intro-02",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "Introductions",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Where are you from?",
        "promptPashto": "تاسو د کوم ځای یاست؟",
        "promptDari": "تاسو د کوم ځای یاست؟",
        "answerEn": "I am from Afghanistan.",
        "answerPashto": "زه د افغانستان یم.",
        "answerDari": "زه د افغانستان یم.",
        "phonetic": "sha-MA az ko-JA has-TID"
      },
      {
        "promptEn": "How old are you?",
        "promptPashto": "تاسو څو کلن یاست؟",
        "promptDari": "تاسو څو کلن یاست؟",
        "answerEn": "I am twenty years old.",
        "answerPashto": "زه شل کلن یم.",
        "answerDari": "زه شل کلن یم.",
        "phonetic": "chan SAL da-RID"
      },
      {
        "promptEn": "Do you speak English?",
        "promptPashto": "ایا تاسو انګلیسي خبرې کوئ؟",
        "promptDari": "ایا تاسو انګلیسي خبرې کوئ؟",
        "answerEn": "Yes, I speak a little English.",
        "answerPashto": "هو، زه لږه انګلیسي خبرې کوم.",
        "answerDari": "هو، زه لږه انګلیسي خبرې کوم.",
        "phonetic": "an-ge-LEE-see soh-bat me-KO-nid"
      }
    ]
  },
  {
    "id": "family-03",
    "level": "beginner",
    "category": "family",
    "titleEn": "My Family",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Tell me about your family.",
        "promptPashto": "د خپلې کورنۍ په اړه راته ووایاست.",
        "promptDari": "د خپلې کورنۍ په اړه راته ووایاست.",
        "answerEn": "I have a mother, father, and two brothers.",
        "answerPashto": "زه مور، پلار او دوه وروڼه لرم.",
        "answerDari": "زه مور، پلار او دوه وروڼه لرم.",
        "phonetic": "kha-no-VA-de"
      },
      {
        "promptEn": "Where does your family live?",
        "promptPashto": "ستاسو کورنۍ چېرته ژوند کوي؟",
        "promptDari": "ستاسو کورنۍ چېرته ژوند کوي؟",
        "answerEn": "My family lives in Kabul.",
        "answerPashto": "زما کورنۍ په کابل کې ژوند کوي.",
        "answerDari": "زما کورنۍ په کابل کې ژوند کوي.",
        "phonetic": "zan-de-GEE me-KO-nand"
      },
      {
        "promptEn": "Do you miss your family?",
        "promptPashto": "ایا تاسو خپلې کورنۍ ته خفه کېږئ؟",
        "promptDari": "ایا تاسو خپلې کورنۍ ته خفه کېږئ؟",
        "answerEn": "Yes, I miss them very much.",
        "answerPashto": "هو، زه هغوی ډېر یادوم.",
        "answerDari": "هو، زه هغوی ډېر یادوم.",
        "phonetic": "del-at tang me-SHE"
      }
    ]
  },
  {
    "id": "school-04",
    "level": "intermediate",
    "category": "school",
    "titleEn": "At School",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What subjects do you study?",
        "promptPashto": "تاسو کوم مضمونونه لولئ؟",
        "promptDari": "تاسو کوم مضمونونه لولئ؟",
        "answerEn": "I study mathematics, science, and English.",
        "answerPashto": "زه ریاضي، ساینس او انګلیسي لولم.",
        "answerDari": "زه ریاضي، ساینس او انګلیسي لولم.",
        "phonetic": "maz-MON | me-KHA-nam"
      },
      {
        "promptEn": "Who is your favourite teacher?",
        "promptPashto": "ستاسو د خوښې ښوونکی څوک دی؟",
        "promptDari": "ستاسو د خوښې ښوونکی څوک دی؟",
        "answerEn": "My favourite teacher is Miss Johnson. She is very kind.",
        "answerPashto": "زما د خوښې ښوونکې مس جانسن ده. هغه ډېره مهربانه ده.",
        "answerDari": "زما د خوښې ښوونکې مس جانسن ده. هغه ډېره مهربانه ده.",
        "phonetic": "mo-al-LEM | mo-RA-ka-la-qe"
      },
      {
        "promptEn": "How do you get to school?",
        "promptPashto": "تاسو ښوونځي ته څنګه ځئ؟",
        "promptDari": "تاسو ښوونځي ته څنګه ځئ؟",
        "answerEn": "I walk to school with my friends.",
        "answerPashto": "زه له خپلو ملګرو سره ښوونځي ته په پښو ځم.",
        "answerDari": "زه له خپلو ملګرو سره ښوونځي ته په پښو ځم.",
        "phonetic": "me-RA-wam | pee-YA-de"
      }
    ]
  },
  {
    "id": "health-05",
    "level": "advanced",
    "category": "health",
    "titleEn": "At the Doctor",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What seems to be the problem?",
        "promptPashto": "ستونزه څه ښکاري؟",
        "promptDari": "ستونزه څه ښکاري؟",
        "answerEn": "I have a headache and feel tired.",
        "answerPashto": "زما سر درد کوي او ستړی احساسوم.",
        "answerDari": "زما سر درد کوي او ستړی احساسوم.",
        "phonetic": "mosh-KE-lat | sar-DARD | khast-a-GEE"
      },
      {
        "promptEn": "How long have you had these symptoms?",
        "promptPashto": "دا نښې مو له کله راهیسې دي؟",
        "promptDari": "دا نښې مو له کله راهیسې دي؟",
        "answerEn": "Since yesterday morning.",
        "answerPashto": "له پرون سهار راهیسې.",
        "answerDari": "له پرون سهار راهیسې.",
        "phonetic": "a-LA-em | dee-ROZ"
      },
      {
        "promptEn": "I will prescribe some medicine for you.",
        "promptPashto": "زه به تاسو ته ځینې درمل ولیکم.",
        "promptDari": "زه به تاسو ته ځینې درمل ولیکم.",
        "answerEn": "Thank you, doctor. How many times a day?",
        "answerPashto": "مننه، ډاکټر صاحب. په ورځ کې څو ځله؟",
        "answerDari": "مننه، ډاکټر صاحب. په ورځ کې څو ځله؟",
        "phonetic": "toj-WIZ | dA-wa | chan BAR"
      }
    ]
  },
  {
    "id": "food-06",
    "level": "beginner",
    "category": "food",
    "titleEn": "Afghan Foods",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you like kabuli palau?",
        "promptPashto": "ایا کابلي پلو مو خوښېږي؟",
        "promptDari": "ایا کابلي پلو مو خوښېږي؟",
        "answerEn": "Yes, I love kabuli palau! It is my favourite food.",
        "answerPashto": "هو، کابلي پلو مې ډېر خوښېږي! دا زما د خوښې خواړه دي.",
        "answerDari": "هو، کابلي پلو مې ډېر خوښېږي! دا زما د خوښې خواړه دي.",
        "phonetic": "qA-bo-lee PA-law | doost DA-ram"
      },
      {
        "promptEn": "Can you cook Afghan food?",
        "promptPashto": "ایا تاسو افغان خواړه پخولی شئ؟",
        "promptDari": "ایا تاسو افغان خواړه پخولی شئ؟",
        "answerEn": "I can make mantu and bolani.",
        "answerPashto": "زه منتو او بولاني جوړولی شم.",
        "answerDari": "زه منتو او بولاني جوړولی شم.",
        "phonetic": "man-TOO | bo-LA-nee"
      },
      {
        "promptEn": "What do you drink with food?",
        "promptPashto": "تاسو له خوړو سره څه څښئ؟",
        "promptDari": "تاسو له خوړو سره څه څښئ؟",
        "answerEn": "I usually drink green tea or water.",
        "answerPashto": "زه عموماً شین چای یا اوبه څښم.",
        "answerDari": "زه عموماً شین چای یا اوبه څښم.",
        "phonetic": "chA-ye sabz | Ab"
      }
    ]
  },
  {
    "id": "airport-basic",
    "level": "basic",
    "category": "travel",
    "titleEn": "At the Airport",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "May I see your passport, please?",
        "promptPashto": "مهرباني وکړئ، ستاسو پاسپورټ کتلای شم؟",
        "promptDari": "مهرباني وکړئ، ستاسو پاسپورټ کتلای شم؟",
        "answerEn": "Yes, here is my passport.",
        "answerPashto": "هو، دا زما پاسپورټ دی.",
        "answerDari": "هو، دا زما پاسپورټ دی.",
        "phonetic": "pas-port | ne-shan be-deh-id"
      },
      {
        "promptEn": "Where are you travelling today?",
        "promptPashto": "نن کوم ځای ته سفر کوئ؟",
        "promptDari": "نن کوم ځای ته سفر کوئ؟",
        "answerEn": "I am travelling to London.",
        "answerPashto": "زه لندن ته سفر کوم.",
        "answerDari": "زه لندن ته سفر کوم.",
        "phonetic": "safar me-ko-nid"
      },
      {
        "promptEn": "Do you have any luggage?",
        "promptPashto": "ایا کوم سامان لرئ؟",
        "promptDari": "ایا کوم سامان لرئ؟",
        "answerEn": "Yes, I have one suitcase and one small bag.",
        "answerPashto": "هو، یو بکس او یوه کوچنۍ کڅوړه لرم.",
        "answerDari": "هو، یو بکس او یوه کوچنۍ کڅوړه لرم.",
        "phonetic": "baks-e sa-far | ko-chak"
      }
    ]
  },
  {
    "id": "bus-basic",
    "level": "basic",
    "category": "travel",
    "titleEn": "On the Bus",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Is this seat free?",
        "promptPashto": "ایا دا څوکۍ خالي ده؟",
        "promptDari": "ایا دا څوکۍ خالي ده؟",
        "answerEn": "Yes, you can sit here.",
        "answerPashto": "هو، دلته کېنستلی شئ.",
        "answerDari": "هو، دلته کېنستلی شئ.",
        "phonetic": "cho-kee kha-lee"
      },
      {
        "promptEn": "Where should I get off?",
        "promptPashto": "زه چېرته ښکته شم؟",
        "promptDari": "زه چېرته ښکته شم؟",
        "answerEn": "You should get off at the next stop.",
        "answerPashto": "تاسو باید په راتلونکي تمځای کې ښکته شئ.",
        "answerDari": "تاسو باید په راتلونکي تمځای کې ښکته شئ.",
        "phonetic": "pa-yeen sha-wam"
      },
      {
        "promptEn": "How much is the ticket?",
        "promptPashto": "ټکټ په څو دی؟",
        "promptDari": "ټکټ په څو دی؟",
        "answerEn": "The ticket is two dollars.",
        "answerPashto": "ټکټ دوه ډالره دی.",
        "answerDari": "ټکټ دوه ډالره دی.",
        "phonetic": "qe-mat-e te-ket"
      }
    ]
  },
  {
    "id": "supermarket-beginner",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "At the Supermarket",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Can I help you find something?",
        "promptPashto": "ایا د کوم شي په پیدا کولو کې مرسته درسره وکړم؟",
        "promptDari": "ایا د کوم شي په پیدا کولو کې مرسته درسره وکړم؟",
        "answerEn": "Yes, I need rice and milk.",
        "answerPashto": "هو، وریجې او شیدې پکار لرم.",
        "answerDari": "هو، وریجې او شیدې پکار لرم.",
        "phonetic": "be-ranj | sheer"
      },
      {
        "promptEn": "Do you want a bag?",
        "promptPashto": "ایا کڅوړه غواړئ؟",
        "promptDari": "ایا کڅوړه غواړئ؟",
        "answerEn": "Yes, one bag please.",
        "answerPashto": "هو، مهرباني وکړئ یوه کڅوړه.",
        "answerDari": "هو، مهرباني وکړئ یوه کڅوړه.",
        "phonetic": "kha-ree-ta"
      },
      {
        "promptEn": "How would you like to pay?",
        "promptPashto": "تاسو څنګه پیسې ورکوئ؟",
        "promptDari": "تاسو څنګه پیسې ورکوئ؟",
        "answerEn": "I will pay by card.",
        "answerPashto": "زه به په کارت پیسې ورکړم.",
        "answerDari": "زه به په کارت پیسې ورکړم.",
        "phonetic": "pardakht me-ko-nam"
      }
    ]
  },
  {
    "id": "hospital-basic",
    "level": "basic",
    "category": "health",
    "titleEn": "At the Hospital",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Why did you come to the hospital?",
        "promptPashto": "تاسو ولې روغتون ته راغلي یاست؟",
        "promptDari": "تاسو ولې روغتون ته راغلي یاست؟",
        "answerEn": "I have a fever and cough.",
        "answerPashto": "زه تبه او ټوخی لرم.",
        "answerDari": "زه تبه او ټوخی لرم.",
        "phonetic": "tab | sorfa"
      },
      {
        "promptEn": "Do you have an appointment?",
        "promptPashto": "ایا تاسو ملاقات لرئ؟",
        "promptDari": "ایا تاسو ملاقات لرئ؟",
        "answerEn": "No, this is urgent.",
        "answerPashto": "نه، دا بیړنۍ موضوع ده.",
        "answerDari": "نه، دا بیړنۍ موضوع ده.",
        "phonetic": "waqt-e mo-la-qat"
      },
      {
        "promptEn": "Please wait in the waiting room.",
        "promptPashto": "مهرباني وکړئ د انتظار په خونه کې انتظار وکړئ.",
        "promptDari": "مهرباني وکړئ د انتظار په خونه کې انتظار وکړئ.",
        "answerEn": "Thank you, I will wait here.",
        "answerPashto": "مننه، زه به دلته انتظار وکړم.",
        "answerDari": "مننه، زه به دلته انتظار وکړم.",
        "phonetic": "en-te-zar"
      }
    ]
  },
  {
    "id": "bank-intermediate",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "At the Bank",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "How can I help you today?",
        "promptPashto": "نن څنګه ستاسو مرسته کولی شم؟",
        "promptDari": "نن څنګه ستاسو مرسته کولی شم؟",
        "answerEn": "I would like to open an account.",
        "answerPashto": "زه غواړم یو حساب پرانیزم.",
        "answerDari": "زه غواړم یو حساب پرانیزم.",
        "phonetic": "he-sab baz ko-nam"
      },
      {
        "promptEn": "Do you have identification?",
        "promptPashto": "ایا تاسو پېژندپاڼه لرئ؟",
        "promptDari": "ایا تاسو پېژندپاڼه لرئ؟",
        "answerEn": "Yes, I have my ID card.",
        "answerPashto": "هو، زه خپله پېژندپاڼه لرم.",
        "answerDari": "هو، زه خپله پېژندپاڼه لرم.",
        "phonetic": "sanad-e ho-wee-yat"
      },
      {
        "promptEn": "Please sign this form.",
        "promptPashto": "مهرباني وکړئ دا فورمه لاسلیک کړئ.",
        "promptDari": "مهرباني وکړئ دا فورمه لاسلیک کړئ.",
        "answerEn": "Of course, where should I sign?",
        "answerPashto": "البته، چېرته یې لاسلیک کړم؟",
        "answerDari": "البته، چېرته یې لاسلیک کړم؟",
        "phonetic": "em-za ko-nid"
      }
    ]
  },
  {
    "id": "job-interview-advanced",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Job Interview",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Tell me about your experience.",
        "promptPashto": "د خپلې تجربې په اړه راته ووایاست.",
        "promptDari": "د خپلې تجربې په اړه راته ووایاست.",
        "answerEn": "I have three years of experience in customer service.",
        "answerPashto": "زه د پېرودونکو د خدمت په برخه کې درې کاله تجربه لرم.",
        "answerDari": "زه د پېرودونکو د خدمت په برخه کې درې کاله تجربه لرم.",
        "phonetic": "taj-ro-ba | khadamat-e mosh-ta-ree-yan"
      },
      {
        "promptEn": "Why do you want this job?",
        "promptPashto": "تاسو ولې دا دنده غواړئ؟",
        "promptDari": "تاسو ولې دا دنده غواړئ؟",
        "answerEn": "I want to learn, work hard, and support the team.",
        "answerPashto": "زه غواړم زده کړه وکړم، سخت کار وکړم او له ټیم سره مرسته وکړم.",
        "answerDari": "زه غواړم زده کړه وکړم، سخت کار وکړم او له ټیم سره مرسته وکړم.",
        "phonetic": "wa-zee-fa"
      },
      {
        "promptEn": "When can you start?",
        "promptPashto": "تاسو کله کار پیلولی شئ؟",
        "promptDari": "تاسو کله کار پیلولی شئ؟",
        "answerEn": "I can start next Monday.",
        "answerPashto": "زه راتلونکې دوشنبه کار پیلولی شم.",
        "answerDari": "زه راتلونکې دوشنبه کار پیلولی شم.",
        "phonetic": "shoroo ko-nam"
      }
    ]
  },
  {
    "id": "university-application-academic",
    "level": "academic",
    "category": "school",
    "titleEn": "University Application",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Which programme are you applying for?",
        "promptPashto": "تاسو د کوم پروګرام لپاره غوښتنلیک ورکوئ؟",
        "promptDari": "تاسو د کوم پروګرام لپاره غوښتنلیک ورکوئ؟",
        "answerEn": "I am applying for computer science.",
        "answerPashto": "زه د کمپیوټر ساینس لپاره غوښتنلیک ورکوم.",
        "answerDari": "زه د کمپیوټر ساینس لپاره غوښتنلیک ورکوم.",
        "phonetic": "darkhwast me-de-ham"
      },
      {
        "promptEn": "Have you prepared your documents?",
        "promptPashto": "ایا خپل اسناد مو تیار کړي دي؟",
        "promptDari": "ایا خپل اسناد مو تیار کړي دي؟",
        "answerEn": "Yes, my transcript and passport are ready.",
        "answerPashto": "هو، زما تعلیمي سند او پاسپورټ تیار دي.",
        "answerDari": "هو، زما تعلیمي سند او پاسپورټ تیار دي.",
        "phonetic": "asnad | a-ma-da"
      },
      {
        "promptEn": "Why did you choose this university?",
        "promptPashto": "تاسو ولې دا پوهنتون انتخاب کړ؟",
        "promptDari": "تاسو ولې دا پوهنتون انتخاب کړ؟",
        "answerEn": "It has strong teachers and good research facilities.",
        "answerPashto": "دا پوهنتون پیاوړي استادان او د څېړنې ښې اسانتیاوې لري.",
        "answerDari": "دا پوهنتون پیاوړي استادان او د څېړنې ښې اسانتیاوې لري.",
        "phonetic": "en-te-khab kardid"
      }
    ]
  },
  {
    "id": "calling-friend-basic",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "Calling a Friend",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Hello, can you hear me?",
        "promptPashto": "سلام، ایا زما غږ اورئ؟",
        "promptDari": "سلام، ایا زما غږ اورئ؟",
        "answerEn": "Yes, I can hear you clearly.",
        "answerPashto": "هو، ستاسو غږ روښانه اورم.",
        "answerDari": "هو، ستاسو غږ روښانه اورم.",
        "phonetic": "se-da-yam"
      },
      {
        "promptEn": "Are you free this evening?",
        "promptPashto": "ایا نن ماښام وزګار یاست؟",
        "promptDari": "ایا نن ماښام وزګار یاست؟",
        "answerEn": "Yes, I am free after dinner.",
        "answerPashto": "هو، له ماښامنۍ وروسته وزګار یم.",
        "answerDari": "هو، له ماښامنۍ وروسته وزګار یم.",
        "phonetic": "em-shab"
      },
      {
        "promptEn": "Let us meet at the park.",
        "promptPashto": "راځئ په پارک کې سره ووینو.",
        "promptDari": "راځئ په پارک کې سره ووینو.",
        "answerEn": "Good idea, see you there.",
        "answerPashto": "ښه نظر دی، هلته به سره ووینو.",
        "answerDari": "ښه نظر دی، هلته به سره ووینو.",
        "phonetic": "par-k"
      }
    ]
  },
  {
    "id": "weather-basic",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "Talking About the Weather",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "How is the weather today?",
        "promptPashto": "نن هوا څنګه ده؟",
        "promptDari": "نن هوا څنګه ده؟",
        "answerEn": "It is cold and windy.",
        "answerPashto": "هوا سړه او باد لرونکې ده.",
        "answerDari": "هوا سړه او باد لرونکې ده.",
        "phonetic": "sard | bad-dar"
      },
      {
        "promptEn": "Do you think it will rain?",
        "promptPashto": "ایا فکر کوئ باران به وشي؟",
        "promptDari": "ایا فکر کوئ باران به وشي؟",
        "answerEn": "Maybe, the sky is cloudy.",
        "answerPashto": "شاید، اسمان ورېځ دی.",
        "answerDari": "شاید، اسمان ورېځ دی.",
        "phonetic": "ba-ran | abree"
      },
      {
        "promptEn": "Take your jacket with you.",
        "promptPashto": "خپل جاکټ له ځان سره واخلئ.",
        "promptDari": "خپل جاکټ له ځان سره واخلئ.",
        "answerEn": "Thank you, I will take it.",
        "answerPashto": "مننه، زه به یې واخلم.",
        "answerDari": "مننه، زه به یې واخلم.",
        "phonetic": "jam-par"
      }
    ]
  },
  {
    "id": "directions-beginner",
    "level": "beginner",
    "category": "travel",
    "titleEn": "Asking for Directions",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Excuse me, where is the pharmacy?",
        "promptPashto": "وبښئ، درملتون چېرته دی؟",
        "promptDari": "وبښئ، درملتون چېرته دی؟",
        "answerEn": "It is next to the bakery.",
        "answerPashto": "دا د نانوایۍ تر څنګ دی.",
        "answerDari": "دا د نانوایۍ تر څنګ دی.",
        "phonetic": "da-wa-kha-na"
      },
      {
        "promptEn": "Is it far from here?",
        "promptPashto": "ایا دا له دې ځایه لرې دی؟",
        "promptDari": "ایا دا له دې ځایه لرې دی؟",
        "answerEn": "No, it is five minutes on foot.",
        "answerPashto": "نه، په پښو پنځه دقیقې لار ده.",
        "answerDari": "نه، په پښو پنځه دقیقې لار ده.",
        "phonetic": "door ast"
      },
      {
        "promptEn": "Should I turn left or right?",
        "promptPashto": "کیڼ لوري ته واوړم که ښي لوري ته؟",
        "promptDari": "کیڼ لوري ته واوړم که ښي لوري ته؟",
        "answerEn": "Turn left at the corner.",
        "answerPashto": "په کونج کې کیڼ لوري ته واوړئ.",
        "answerDari": "په کونج کې کیڼ لوري ته واوړئ.",
        "phonetic": "chap | rast"
      }
    ]
  },
  {
    "id": "nowruz-intermediate",
    "level": "intermediate",
    "category": "culture",
    "titleEn": "Afghan New Year — Nowruz",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "How do you celebrate Nowruz?",
        "promptPashto": "تاسو نوروز څنګه لمانځئ؟",
        "promptDari": "تاسو نوروز څنګه لمانځئ؟",
        "answerEn": "We clean the house and visit family.",
        "answerPashto": "موږ کور پاکوو او له کورنۍ سره لیدنه کوو.",
        "answerDari": "موږ کور پاکوو او له کورنۍ سره لیدنه کوو.",
        "phonetic": "now-rooz"
      },
      {
        "promptEn": "What food do you prepare?",
        "promptPashto": "تاسو کوم خواړه تیاروئ؟",
        "promptDari": "تاسو کوم خواړه تیاروئ؟",
        "answerEn": "We prepare haft mewa and special rice.",
        "answerPashto": "موږ هفت مېوه او ځانګړې وریجې تیاروو.",
        "answerDari": "موږ هفت مېوه او ځانګړې وریجې تیاروو.",
        "phonetic": "haft me-wa"
      },
      {
        "promptEn": "What does Nowruz mean to you?",
        "promptPashto": "نوروز ستاسو لپاره څه معنا لري؟",
        "promptDari": "نوروز ستاسو لپاره څه معنا لري؟",
        "answerEn": "It means a new beginning and hope.",
        "answerPashto": "دا د نوي پیل او هیلې معنا لري.",
        "answerDari": "دا د نوي پیل او هیلې معنا لري.",
        "phonetic": "aghaz-e ta-za"
      }
    ]
  },
  {
    "id": "eid-greetings-basic",
    "level": "basic",
    "category": "culture",
    "titleEn": "Eid Greetings",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Eid Mubarak!",
        "promptPashto": "اختر مو مبارک شه!",
        "promptDari": "اختر مو مبارک شه!",
        "answerEn": "Eid Mubarak to you and your family.",
        "answerPashto": "تاسو او ستاسو کورنۍ ته دې اختر مبارک وي.",
        "answerDari": "تاسو او ستاسو کورنۍ ته دې اختر مبارک وي.",
        "phonetic": "eid mo-ba-rak"
      },
      {
        "promptEn": "Did you visit your relatives?",
        "promptPashto": "ایا خپلو خپلوانو ته ورغلي وئ؟",
        "promptDari": "ایا خپلو خپلوانو ته ورغلي وئ؟",
        "answerEn": "Yes, we visited my uncle in the morning.",
        "answerPashto": "هو، موږ سهار د خپل کاکا کور ته ورغلو.",
        "answerDari": "هو، موږ سهار د خپل کاکا کور ته ورغلو.",
        "phonetic": "khwe-sha-wan-dan"
      },
      {
        "promptEn": "What did the children receive?",
        "promptPashto": "ماشومانو څه ترلاسه کړل؟",
        "promptDari": "ماشومانو څه ترلاسه کړل؟",
        "answerEn": "They received sweets and small gifts.",
        "answerPashto": "هغوی خواږه او وړې ډالۍ ترلاسه کړې.",
        "answerDari": "هغوی خواږه او وړې ډالۍ ترلاسه کړې.",
        "phonetic": "at-fal | sheer-e-nee"
      }
    ]
  },
  {
    "id": "neighbours-beginner",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "Meeting Neighbours",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Hello, I am your new neighbour.",
        "promptPashto": "سلام، زه ستاسو نوی ګاونډی یم.",
        "promptDari": "سلام، زه ستاسو نوی ګاونډی یم.",
        "answerEn": "Welcome to the building.",
        "answerPashto": "دې ودانۍ ته ښه راغلاست.",
        "answerDari": "دې ودانۍ ته ښه راغلاست.",
        "phonetic": "ham-sa-ya"
      },
      {
        "promptEn": "Which apartment do you live in?",
        "promptPashto": "تاسو په کوم اپارتمان کې اوسېږئ؟",
        "promptDari": "تاسو په کوم اپارتمان کې اوسېږئ؟",
        "answerEn": "I live in apartment number twelve.",
        "answerPashto": "زه په دولسم نمبر اپارتمان کې اوسېږم.",
        "answerDari": "زه په دولسم نمبر اپارتمان کې اوسېږم.",
        "phonetic": "a-part-man"
      },
      {
        "promptEn": "Please let us know if you need help.",
        "promptPashto": "که مرستې ته اړتیا لرئ، مهرباني وکړئ موږ خبر کړئ.",
        "promptDari": "که مرستې ته اړتیا لرئ، مهرباني وکړئ موږ خبر کړئ.",
        "answerEn": "Thank you, that is very kind.",
        "answerPashto": "مننه، دا ستاسو ډېره مهرباني ده.",
        "answerDari": "مننه، دا ستاسو ډېره مهرباني ده.",
        "phonetic": "mehr-ba-nee"
      }
    ]
  },
  {
    "id": "hobbies-beginner",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "Talking About Hobbies",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What do you like to do in your free time?",
        "promptPashto": "په خپل وزګار وخت کې څه کول خوښوئ؟",
        "promptDari": "په خپل وزګار وخت کې څه کول خوښوئ؟",
        "answerEn": "I like reading and playing football.",
        "answerPashto": "زه لوستل او فوټبال کول خوښوم.",
        "answerDari": "زه لوستل او فوټبال کول خوښوم.",
        "phonetic": "sargarmi"
      },
      {
        "promptEn": "How often do you play football?",
        "promptPashto": "تاسو څو ځله فوټبال کوئ؟",
        "promptDari": "تاسو څو ځله فوټبال کوئ؟",
        "answerEn": "I play every weekend.",
        "answerPashto": "زه هره اونۍ په رخصتۍ کې لوبه کوم.",
        "answerDari": "زه هره اونۍ په رخصتۍ کې لوبه کوم.",
        "phonetic": "akher-e hafta"
      },
      {
        "promptEn": "Do you want to join our team?",
        "promptPashto": "ایا غواړئ زموږ ټیم سره یو ځای شئ؟",
        "promptDari": "ایا غواړئ زموږ ټیم سره یو ځای شئ؟",
        "answerEn": "Yes, I would love to join.",
        "answerPashto": "هو، ډېر خوښ به شم چې یو ځای شم.",
        "answerDari": "هو، ډېر خوښ به شم چې یو ځای شم.",
        "phonetic": "team"
      }
    ]
  },
  {
    "id": "morning-routine-basic",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "Daily Morning Routine",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What time do you wake up?",
        "promptPashto": "تاسو څو بجې راپاڅېږئ؟",
        "promptDari": "تاسو څو بجې راپاڅېږئ؟",
        "answerEn": "I wake up at six o'clock.",
        "answerPashto": "زه په شپږو بجو راپاڅېږم.",
        "answerDari": "زه په شپږو بجو راپاڅېږم.",
        "phonetic": "be-dar me-sha-wam"
      },
      {
        "promptEn": "What do you do first?",
        "promptPashto": "لومړی څه کوئ؟",
        "promptDari": "لومړی څه کوئ؟",
        "answerEn": "I wash my face and brush my teeth.",
        "answerPashto": "زه خپل مخ وینځم او غاښونه برش کوم.",
        "answerDari": "زه خپل مخ وینځم او غاښونه برش کوم.",
        "phonetic": "ro-yam | dan-dan"
      },
      {
        "promptEn": "Do you eat breakfast?",
        "promptPashto": "ایا سباناری خورئ؟",
        "promptDari": "ایا سباناری خورئ؟",
        "answerEn": "Yes, I eat bread, eggs, and tea.",
        "answerPashto": "هو، زه ډوډۍ، هګۍ او چای خورم.",
        "answerDari": "هو، زه ډوډۍ، هګۍ او چای خورم.",
        "phonetic": "sob-ha-na"
      }
    ]
  },
  {
    "id": "cooking-afghan-food-intermediate",
    "level": "intermediate",
    "category": "food",
    "titleEn": "Cooking Afghan Food",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What are you cooking today?",
        "promptPashto": "نن څه پخوئ؟",
        "promptDari": "نن څه پخوئ؟",
        "answerEn": "I am cooking mantu for my family.",
        "answerPashto": "زه د خپلې کورنۍ لپاره منتو پخوم.",
        "answerDari": "زه د خپلې کورنۍ لپاره منتو پخوم.",
        "phonetic": "mantu me-pazam"
      },
      {
        "promptEn": "What ingredients do you need?",
        "promptPashto": "کوم موادو ته اړتیا لرئ؟",
        "promptDari": "کوم موادو ته اړتیا لرئ؟",
        "answerEn": "I need flour, meat, onions, and yogurt.",
        "answerPashto": "زه اوړو، غوښې، پیازو او مستو ته اړتیا لرم.",
        "answerDari": "زه اوړو، غوښې، پیازو او مستو ته اړتیا لرم.",
        "phonetic": "mawad | ar-d"
      },
      {
        "promptEn": "Can I help you?",
        "promptPashto": "ایا زه ستاسو مرسته کولی شم؟",
        "promptDari": "ایا زه ستاسو مرسته کولی شم؟",
        "answerEn": "Yes, please cut the onions.",
        "answerPashto": "هو، مهرباني وکړئ پیاز پرې کړئ.",
        "answerDari": "هو، مهرباني وکړئ پیاز پرې کړئ.",
        "phonetic": "piaz | khord"
      }
    ]
  },
  {
    "id": "sports-games-beginner",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "Sports and Games",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Which sport do you like?",
        "promptPashto": "کومه لوبه مو خوښېږي؟",
        "promptDari": "کومه لوبه مو خوښېږي؟",
        "answerEn": "I like cricket and football.",
        "answerPashto": "ما ته کرکټ او فوټبال خوښېږي.",
        "answerDari": "ما ته کرکټ او فوټبال خوښېږي.",
        "phonetic": "war-zesh"
      },
      {
        "promptEn": "Who is winning the game?",
        "promptPashto": "لوبه څوک ګټي؟",
        "promptDari": "لوبه څوک ګټي؟",
        "answerEn": "Our team is winning by two points.",
        "answerPashto": "زموږ ټیم په دوو نمرو مخکې دی.",
        "answerDari": "زموږ ټیم په دوو نمرو مخکې دی.",
        "phonetic": "em-ti-yaz"
      },
      {
        "promptEn": "Do you want to play with us?",
        "promptPashto": "ایا غواړئ له موږ سره لوبه وکړئ؟",
        "promptDari": "ایا غواړئ له موږ سره لوبه وکړئ؟",
        "answerEn": "Yes, but I need to warm up first.",
        "answerPashto": "هو، خو لومړی باید ځان ګرم کړم.",
        "answerDari": "هو، خو لومړی باید ځان ګرم کړم.",
        "phonetic": "garm shawm"
      }
    ]
  },
  {
    "id": "social-media-intermediate",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Social Media",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Which app do you use most?",
        "promptPashto": "تاسو کوم اپ ډېر کاروئ؟",
        "promptDari": "تاسو کوم اپ ډېر کاروئ؟",
        "answerEn": "I mostly use WhatsApp to talk with family.",
        "answerPashto": "زه زیاتره له کورنۍ سره د خبرو لپاره واټس‌اپ کاروم.",
        "answerDari": "زه زیاتره له کورنۍ سره د خبرو لپاره واټس‌اپ کاروم.",
        "phonetic": "resana-ha"
      },
      {
        "promptEn": "Do you share photos online?",
        "promptPashto": "ایا انلاین عکسونه شریکوئ؟",
        "promptDari": "ایا انلاین عکسونه شریکوئ؟",
        "answerEn": "Sometimes, but I keep private things safe.",
        "answerPashto": "کله ناکله، خو شخصي شیان خوندي ساتم.",
        "answerDari": "کله ناکله، خو شخصي شیان خوندي ساتم.",
        "phonetic": "mahfooz"
      },
      {
        "promptEn": "How do you avoid false news?",
        "promptPashto": "تاسو له ناسمو خبرونو څنګه ځان ساتئ؟",
        "promptDari": "تاسو له ناسمو خبرونو څنګه ځان ساتئ؟",
        "answerEn": "I check the source before sharing.",
        "answerPashto": "زه له شریکولو مخکې سرچینه ګورم.",
        "answerDari": "زه له شریکولو مخکې سرچینه ګورم.",
        "phonetic": "manba | bar-ras-ee"
      }
    ]
  },
  {
    "id": "climate-change-advanced",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Climate Change",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Why is climate change important?",
        "promptPashto": "ولې اقلیمي بدلون مهم دی؟",
        "promptDari": "ولې اقلیمي بدلون مهم دی؟",
        "answerEn": "It affects water, farming, and people's homes.",
        "answerPashto": "دا په اوبو، کرنه او د خلکو په کورونو اغېز کوي.",
        "answerDari": "دا په اوبو، کرنه او د خلکو په کورونو اغېز کوي.",
        "phonetic": "tagh-yeer-e ab-o-hawa"
      },
      {
        "promptEn": "What can families do?",
        "promptPashto": "کورنۍ څه کولی شي؟",
        "promptDari": "کورنۍ څه کولی شي؟",
        "answerEn": "They can save water and reduce waste.",
        "answerPashto": "هغوی کولی شي اوبه وسپموي او کثافات کم کړي.",
        "answerDari": "هغوی کولی شي اوبه وسپموي او کثافات کم کړي.",
        "phonetic": "sarfa | zubala"
      },
      {
        "promptEn": "What should governments do?",
        "promptPashto": "حکومتونه باید څه وکړي؟",
        "promptDari": "حکومتونه باید څه وکړي؟",
        "answerEn": "They should protect forests and support clean energy.",
        "answerPashto": "هغوی باید ځنګلونه وساتي او د پاکې انرژۍ ملاتړ وکړي.",
        "answerDari": "هغوی باید ځنګلونه وساتي او د پاکې انرژۍ ملاتړ وکړي.",
        "phonetic": "hokomat-ha"
      }
    ]
  },
  {
    "id": "afghan-history-advanced",
    "level": "advanced",
    "category": "culture",
    "titleEn": "Afghan History",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What do you know about Afghan history?",
        "promptPashto": "تاسو د افغان تاریخ په اړه څه پوهېږئ؟",
        "promptDari": "تاسو د افغان تاریخ په اړه څه پوهېږئ؟",
        "answerEn": "Afghanistan has been a crossroads of cultures for centuries.",
        "answerPashto": "افغانستان د پېړیو راهیسې د بېلابېلو کلتورونو د تګ راتګ ځای پاتې شوی دی.",
        "answerDari": "افغانستان د پېړیو راهیسې د بېلابېلو کلتورونو د تګ راتګ ځای پاتې شوی دی.",
        "phonetic": "tarikh-e afghanistan"
      },
      {
        "promptEn": "Why was the Silk Road important?",
        "promptPashto": "ولې د ورېښمو لار مهمه وه؟",
        "promptDari": "ولې د ورېښمو لار مهمه وه؟",
        "answerEn": "It connected traders, languages, and ideas.",
        "answerPashto": "دې لارې سوداګر، ژبې او فکرونه سره نښلول.",
        "answerDari": "دې لارې سوداګر، ژبې او فکرونه سره نښلول.",
        "phonetic": "jada-ye abrisham"
      },
      {
        "promptEn": "How can young people learn history?",
        "promptPashto": "ځوانان څنګه تاریخ زده کولی شي؟",
        "promptDari": "ځوانان څنګه تاریخ زده کولی شي؟",
        "answerEn": "They can read books and listen to elders.",
        "answerPashto": "هغوی کولی شي کتابونه ولولي او د مشرانو خبرې واوري.",
        "answerDari": "هغوی کولی شي کتابونه ولولي او د مشرانو خبرې واوري.",
        "phonetic": "jawan-an"
      }
    ]
  },
  {
    "id": "ielts-part1",
    "level": "ielts",
    "category": "daily-life",
    "titleEn": "IELTS Speaking Part 1",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you work or study?",
        "promptPashto": "ایا تاسو کار کوئ که زده کړه کوئ؟",
        "promptDari": "ایا تاسو کار کوئ که زده کړه کوئ؟",
        "answerEn": "I study English and I also help my family.",
        "answerPashto": "زه انګلیسي زده کوم او له خپلې کورنۍ سره هم مرسته کوم.",
        "answerDari": "زه انګلیسي زده کوم او له خپلې کورنۍ سره هم مرسته کوم.",
        "phonetic": "ielts speaking"
      },
      {
        "promptEn": "What do you like about your hometown?",
        "promptPashto": "د خپل اصلي ښار/کلي کوم شی مو خوښېږي؟",
        "promptDari": "د خپل اصلي ښار/کلي کوم شی مو خوښېږي؟",
        "answerEn": "I like the friendly people and the local food.",
        "answerPashto": "ما ته دوستانه خلک او سیمه‌ییز خواړه خوښېږي.",
        "answerDari": "ما ته دوستانه خلک او سیمه‌ییز خواړه خوښېږي.",
        "phonetic": "shahr-e khod"
      },
      {
        "promptEn": "Do you prefer mornings or evenings?",
        "promptPashto": "سهارونه مو ډېر خوښېږي که ماښامونه؟",
        "promptDari": "سهارونه مو ډېر خوښېږي که ماښامونه؟",
        "answerEn": "I prefer mornings because I feel fresh.",
        "answerPashto": "سهارونه مې ډېر خوښېږي، ځکه ځان تازه احساسوم.",
        "answerDari": "سهارونه مې ډېر خوښېږي، ځکه ځان تازه احساسوم.",
        "phonetic": "tarjeeh"
      }
    ]
  },
  {
    "id": "ielts-part2",
    "level": "ielts",
    "category": "school",
    "titleEn": "IELTS Speaking Part 2 Topic Card",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Describe a person who helped you.",
        "promptPashto": "هغه کس تشریح کړئ چې ستاسو مرسته یې کړې ده.",
        "promptDari": "هغه کس تشریح کړئ چې ستاسو مرسته یې کړې ده.",
        "answerEn": "I would like to describe my teacher, who helped me learn English.",
        "answerPashto": "زه غواړم خپل استاد تشریح کړم، چې د انګلیسي په زده کړه کې یې راسره مرسته کړې ده.",
        "answerDari": "زه غواړم خپل استاد تشریح کړم، چې د انګلیسي په زده کړه کې یې راسره مرسته کړې ده.",
        "phonetic": "describe"
      },
      {
        "promptEn": "What did this person do?",
        "promptPashto": "دې کس څه وکړل؟",
        "promptDari": "دې کس څه وکړل؟",
        "answerEn": "She explained difficult words and encouraged me every week.",
        "answerPashto": "هغې سختې کلمې تشریح کولې او هره اونۍ یې زه هڅولم.",
        "answerDari": "هغې سختې کلمې تشریح کولې او هره اونۍ یې زه هڅولم.",
        "phonetic": "tashweeq"
      },
      {
        "promptEn": "Why was this help important?",
        "promptPashto": "دا مرسته ولې مهمه وه؟",
        "promptDari": "دا مرسته ولې مهمه وه؟",
        "answerEn": "It gave me confidence to speak without fear.",
        "answerPashto": "دې مرستې ماته جرئت راکړ چې له وېرې پرته خبرې وکړم.",
        "answerDari": "دې مرستې ماته جرئت راکړ چې له وېرې پرته خبرې وکړم.",
        "phonetic": "etemad"
      }
    ]
  },
  {
    "id": "academic-presentation",
    "level": "academic",
    "category": "school",
    "titleEn": "Academic Presentation",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What is your presentation about?",
        "promptPashto": "ستاسو پریزنټېشن د څه په اړه دی؟",
        "promptDari": "ستاسو پریزنټېشن د څه په اړه دی؟",
        "answerEn": "My presentation is about clean water in communities.",
        "answerPashto": "زما پریزنټېشن په ټولنو کې د پاکو اوبو په اړه دی.",
        "answerDari": "زما پریزنټېشن په ټولنو کې د پاکو اوبو په اړه دی.",
        "phonetic": "era-ya"
      },
      {
        "promptEn": "What is your main argument?",
        "promptPashto": "ستاسو اصلي دلیل څه دی؟",
        "promptDari": "ستاسو اصلي دلیل څه دی؟",
        "answerEn": "My main argument is that water access improves health.",
        "answerPashto": "زما اصلي دلیل دا دی چې اوبو ته لاسرسی روغتیا ښه کوي.",
        "answerDari": "زما اصلي دلیل دا دی چې اوبو ته لاسرسی روغتیا ښه کوي.",
        "phonetic": "estedlal"
      },
      {
        "promptEn": "How will you conclude?",
        "promptPashto": "تاسو به څنګه پایله وړاندې کړئ؟",
        "promptDari": "تاسو به څنګه پایله وړاندې کړئ؟",
        "answerEn": "I will conclude with practical recommendations.",
        "answerPashto": "زه به د عملي سپارښتنو سره پایله وړاندې کړم.",
        "answerDari": "زه به د عملي سپارښتنو سره پایله وړاندې کړم.",
        "phonetic": "natija-geeree"
      }
    ]
  },
  {
    "id": "describe-photo-intermediate",
    "level": "intermediate",
    "category": "school",
    "titleEn": "Describing a Photograph",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What can you see in the photo?",
        "promptPashto": "په عکس کې څه لیدلی شئ؟",
        "promptDari": "په عکس کې څه لیدلی شئ؟",
        "answerEn": "I can see a family sitting in a park.",
        "answerPashto": "زه یوه کورنۍ وینم چې په پارک کې ناسته ده.",
        "answerDari": "زه یوه کورنۍ وینم چې په پارک کې ناسته ده.",
        "phonetic": "aks"
      },
      {
        "promptEn": "What are they doing?",
        "promptPashto": "هغوی څه کوي؟",
        "promptDari": "هغوی څه کوي؟",
        "answerEn": "They are eating lunch and talking together.",
        "answerPashto": "هغوی غرمنۍ خوري او یو له بل سره خبرې کوي.",
        "answerDari": "هغوی غرمنۍ خوري او یو له بل سره خبرې کوي.",
        "phonetic": "nan-e chasht"
      },
      {
        "promptEn": "How do they feel?",
        "promptPashto": "هغوی څنګه احساس کوي؟",
        "promptDari": "هغوی څنګه احساس کوي؟",
        "answerEn": "They look happy and relaxed.",
        "answerPashto": "هغوی خوشحاله او ارام ښکاري.",
        "answerDari": "هغوی خوشحاله او ارام ښکاري.",
        "phonetic": "aram"
      }
    ]
  },
  {
    "id": "opinions-advanced",
    "level": "advanced",
    "category": "school",
    "titleEn": "Expressing Opinions",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What is your opinion about online learning?",
        "promptPashto": "د انلاین زده کړې په اړه ستاسو نظر څه دی؟",
        "promptDari": "د انلاین زده کړې په اړه ستاسو نظر څه دی؟",
        "answerEn": "I think online learning is useful, but it needs discipline.",
        "answerPashto": "زما په نظر انلاین زده کړه ګټوره ده، خو نظم ته اړتیا لري.",
        "answerDari": "زما په نظر انلاین زده کړه ګټوره ده، خو نظم ته اړتیا لري.",
        "phonetic": "nazar"
      },
      {
        "promptEn": "Do you agree with school uniforms?",
        "promptPashto": "ایا تاسو د ښوونځي له یونیفورم سره موافق یاست؟",
        "promptDari": "ایا تاسو د ښوونځي له یونیفورم سره موافق یاست؟",
        "answerEn": "I partly agree because it can reduce pressure on students.",
        "answerPashto": "زه تر یوې اندازې موافق یم، ځکه دا پر زده کوونکو فشار کمولی شي.",
        "answerDari": "زه تر یوې اندازې موافق یم، ځکه دا پر زده کوونکو فشار کمولی شي.",
        "phonetic": "mowafeq"
      },
      {
        "promptEn": "How do you disagree politely?",
        "promptPashto": "تاسو څنګه په ادب سره مخالفت کوئ؟",
        "promptDari": "تاسو څنګه په ادب سره مخالفت کوئ؟",
        "answerEn": "I say, I understand your point, but I see it differently.",
        "answerPashto": "زه وایم: ستاسو خبره درک کوم، خو زه یې په بل ډول وینم.",
        "answerDari": "زه وایم: ستاسو خبره درک کوم، خو زه یې په بل ډول وینم.",
        "phonetic": "mokhalefat"
      }
    ]
  },
  {
    "id": "post-office-basic",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "At the Post Office",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "I want to send this letter.",
        "promptPashto": "زه غواړم دا لیک ولېږم.",
        "promptDari": "زه غواړم دا لیک ولېږم.",
        "answerEn": "Where do you want to send it?",
        "answerPashto": "تاسو غواړئ دا چېرته ولېږئ؟",
        "answerDari": "تاسو غواړئ دا چېرته ولېږئ؟",
        "phonetic": "post-khana"
      },
      {
        "promptEn": "How much does it cost?",
        "promptPashto": "دا څو پیسې کېږي؟",
        "promptDari": "دا څو پیسې کېږي؟",
        "answerEn": "It costs three dollars.",
        "answerPashto": "دا درې ډالره کېږي.",
        "answerDari": "دا درې ډالره کېږي.",
        "phonetic": "qeemat"
      },
      {
        "promptEn": "Do you need a tracking number?",
        "promptPashto": "ایا د تعقیب شمېرې ته اړتیا لرئ؟",
        "promptDari": "ایا د تعقیب شمېرې ته اړتیا لرئ؟",
        "answerEn": "Yes, please give me one.",
        "answerPashto": "هو، مهرباني وکړئ یوه راکړئ.",
        "answerDari": "هو، مهرباني وکړئ یوه راکړئ.",
        "phonetic": "taqib"
      }
    ]
  },
  {
    "id": "clothes-shopping-beginner",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "Shopping for Clothes",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What size do you need?",
        "promptPashto": "تاسو د کومې اندازې ضرورت لرئ؟",
        "promptDari": "تاسو د کومې اندازې ضرورت لرئ؟",
        "answerEn": "I need a medium size.",
        "answerPashto": "زه د منځنۍ اندازې ضرورت لرم.",
        "answerDari": "زه د منځنۍ اندازې ضرورت لرم.",
        "phonetic": "size motawaset"
      },
      {
        "promptEn": "Can I try this on?",
        "promptPashto": "ایا زه دا اغوستلی شم؟",
        "promptDari": "ایا زه دا اغوستلی شم؟",
        "answerEn": "Yes, the fitting room is over there.",
        "answerPashto": "هو، د اغوستلو خونه هلته ده.",
        "answerDari": "هو، د اغوستلو خونه هلته ده.",
        "phonetic": "emtehan"
      },
      {
        "promptEn": "Do you have this in blue?",
        "promptPashto": "ایا دا تاسو د نیلي رنګ کې لرئ؟",
        "promptDari": "ایا دا تاسو د نیلي رنګ کې لرئ؟",
        "answerEn": "Yes, we have blue and black.",
        "answerPashto": "هو، موږ نیلي او تور لرو.",
        "answerDari": "هو، موږ نیلي او تور لرو.",
        "phonetic": "abi | seeyah"
      }
    ]
  },
  {
    "id": "restaurant-beginner",
    "level": "beginner",
    "category": "food",
    "titleEn": "At a Restaurant",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Are you ready to order?",
        "promptPashto": "ایا تاسو د امر کولو لپاره چمتو یاست؟",
        "promptDari": "ایا تاسو د امر کولو لپاره چمتو یاست؟",
        "answerEn": "Yes, I would like chicken and rice.",
        "answerPashto": "هو، زه د چرګ او وريژو غوښتنه کوم.",
        "answerDari": "هو، زه د چرګ او وريژو غوښتنه کوم.",
        "phonetic": "sefaresh"
      },
      {
        "promptEn": "Would you like something to drink?",
        "promptPashto": "ایا تاسو د څښلو لپاره څه غواړئ؟",
        "promptDari": "ایا تاسو د څښلو لپاره څه غواړئ؟",
        "answerEn": "A glass of water, please.",
        "answerPashto": "یوه پیاله اوبه، مهرباني وکړئ.",
        "answerDari": "یوه پیاله اوبه، مهرباني وکړئ.",
        "phonetic": "no-she-dan"
      },
      {
        "promptEn": "How was the food?",
        "promptPashto": "خواړه د خوند وو؟",
        "promptDari": "خواړه د خوند وو؟",
        "answerEn": "It was delicious, thank you.",
        "answerPashto": "هو، خوندور وو، مننه.",
        "answerDari": "هو، خوندور وو، مننه.",
        "phonetic": "khosh-maza"
      }
    ]
  },
  {
    "id": "family-traditions-intermediate",
    "level": "intermediate",
    "category": "family",
    "titleEn": "Family Traditions",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What traditions does your family keep?",
        "promptPashto": "ستاسو کورنۍ کومې دودونه ساتي؟",
        "promptDari": "ستاسو کورنۍ کومې دودونه ساتي؟",
        "answerEn": "We visit elders on Eid and respect guests.",
        "answerPashto": "موږ د اختر پر مهال مشرانو ته ورځو او مهمانانو ته درناوی کوو.",
        "answerDari": "موږ د اختر پر مهال مشرانو ته ورځو او مهمانانو ته درناوی کوو.",
        "phonetic": "sonat-ha"
      },
      {
        "promptEn": "Who teaches children these traditions?",
        "promptPashto": "کوم کس ماشومانو ته دا دودونه ورښیي؟",
        "promptDari": "کوم کس ماشومانو ته دا دودونه ورښیي؟",
        "answerEn": "Parents and grandparents teach them by example.",
        "answerPashto": "مور او پلار او نیکونه د مثال له لارې ورته ښیي.",
        "answerDari": "مور او پلار او نیکونه د مثال له لارې ورته ښیي.",
        "phonetic": "waledeen"
      },
      {
        "promptEn": "Why are traditions important?",
        "promptPashto": "ولې دودونه مهم دي؟",
        "promptDari": "ولې دودونه مهم دي؟",
        "answerEn": "They connect us to family, language, and history.",
        "answerPashto": "دوی موږ کورنۍ، ژبې او تاریخ سره وصلوي.",
        "answerDari": "دوی موږ کورنۍ، ژبې او تاریخ سره وصلوي.",
        "phonetic": "wasl"
      }
    ]
  },
  {
    "id": "hometown-intermediate",
    "level": "intermediate",
    "category": "culture",
    "titleEn": "Describing Your Hometown",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Where is your hometown?",
        "promptPashto": "ستاسو ښار چیرې دی؟",
        "promptDari": "ستاسو ښار چیرې دی؟",
        "answerEn": "My hometown is Kandahar in southern Afghanistan.",
        "answerPashto": "زما ښار د افغانستان د سویل کندهار دی.",
        "answerDari": "زما ښار د افغانستان د سویل کندهار دی.",
        "phonetic": "shahr-e man"
      },
      {
        "promptEn": "What is it famous for?",
        "promptPashto": "هغه ولې مشهور دی؟",
        "promptDari": "هغه ولې مشهور دی؟",
        "answerEn": "It is famous for pomegranates and history.",
        "answerPashto": "هغه د انارونو او تاریخ لپاره مشهور دی.",
        "answerDari": "هغه د انارونو او تاریخ لپاره مشهور دی.",
        "phonetic": "maroof"
      },
      {
        "promptEn": "What do you miss about it?",
        "promptPashto": "تاسو د هغه کومه خبره مشتاقه یاست؟",
        "promptDari": "تاسو د هغه کومه خبره مشتاقه یاست؟",
        "answerEn": "I miss the warm people and family gatherings.",
        "answerPashto": "زه د ګرمو خلکو او د کورنۍ غونډو مشتاق یم.",
        "answerDari": "زه د ګرمو خلکو او د کورنۍ غونډو مشتاق یم.",
        "phonetic": "mahfel"
      }
    ]
  },
  {
    "id": "books-intermediate",
    "level": "intermediate",
    "category": "school",
    "titleEn": "Talking About Books",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What kind of books do you read?",
        "promptPashto": "تاسو د کوم ډول کتابونو لوستل کوئ؟",
        "promptDari": "تاسو د کوم ډول کتابونو لوستل کوئ؟",
        "answerEn": "I read stories, history, and English books.",
        "answerPashto": "زه کیسې، تاریخ او انګلیسي کتابونه لولم.",
        "answerDari": "زه کیسې، تاریخ او انګلیسي کتابونه لولم.",
        "phonetic": "no-e ketab"
      },
      {
        "promptEn": "Who is your favourite writer?",
        "promptPashto": "ستاسو خوند لیکوال چا دی؟",
        "promptDari": "ستاسو خوند لیکوال چا دی؟",
        "answerEn": "I like writers who explain simple ideas clearly.",
        "answerPashto": "زه هغه لیکوالانو خوښوم چې ساده نظرونه روښانه ډول تشریح کوي.",
        "answerDari": "زه هغه لیکوالانو خوښوم چې ساده نظرونه روښانه ډول تشریح کوي.",
        "phonetic": "nawisanda"
      },
      {
        "promptEn": "Do you prefer paper books or e-books?",
        "promptPashto": "تاسو د کاغذي کتابونو یا بریښنایي کتابونو خوښه لرئ؟",
        "promptDari": "تاسو د کاغذي کتابونو یا بریښنایي کتابونو خوښه لرئ؟",
        "answerEn": "I prefer paper books, but e-books are useful.",
        "answerPashto": "زه د کاغذي کتابونو خوښه لرم، خو بریښنایي کتابونه ګټور دي.",
        "answerDari": "زه د کاغذي کتابونو خوښه لرم، خو بریښنایي کتابونه ګټور دي.",
        "phonetic": "tarjeeh"
      }
    ]
  },
  {
    "id": "complaint-polite-advanced",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Making a Complaint Politely",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What is the problem with your order?",
        "promptPashto": "ستاسو د امر سره ستونزه څه ده؟",
        "promptDari": "ستاسو د امر سره ستونزه څه ده؟",
        "answerEn": "I ordered rice, but I received bread.",
        "answerPashto": "ما وريژو امر کړل، خو ماته ډوډۍ راوړل.",
        "answerDari": "ما وريژو امر کړل، خو ماته ډوډۍ راوړل.",
        "phonetic": "shekayat"
      },
      {
        "promptEn": "I am sorry about that.",
        "promptPashto": "زه بخښنه غواړم. مهرباني وکړئ دننه راشئ.",
        "promptDari": "زه بخښنه غواړم. مهرباني وکړئ دننه راشئ.",
        "answerEn": "Thank you. Could you please correct it?",
        "answerPashto": "مننه. ایا تاسو مهرباني کوئ هغه سم کړئ؟",
        "answerDari": "مننه. ایا تاسو مهرباني کوئ هغه سم کړئ؟",
        "phonetic": "eslah"
      },
      {
        "promptEn": "Would you like a refund or replacement?",
        "promptPashto": "ایا تاسو د بیرته ورکولو یا بدیل غواړئ؟",
        "promptDari": "ایا تاسو د بیرته ورکولو یا بدیل غواړئ؟",
        "answerEn": "A replacement would be fine, thank you.",
        "answerPashto": "بدیل به ښه وي، مننه.",
        "answerDari": "بدیل به ښه وي، مننه.",
        "phonetic": "taweez"
      }
    ]
  },
  {
    "id": "apologising-basic",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "Apologising",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "I am sorry I am late.",
        "promptPashto": "زه بخښنه غواړم چې ناوخته یم.",
        "promptDari": "زه بخښنه غواړم چې ناوخته یم.",
        "answerEn": "That is okay. Please come in.",
        "answerPashto": "هیڅ ستونزه نه ده. مهرباني وکړئ دننه راشئ.",
        "answerDari": "هیڅ ستونزه نه ده. مهرباني وکړئ دننه راشئ.",
        "phonetic": "uzr-kha-hee"
      },
      {
        "promptEn": "I forgot your book.",
        "promptPashto": "ما ستاسو کتاب هیر کړ.",
        "promptDari": "ما ستاسو کتاب هیر کړ.",
        "answerEn": "No problem. Bring it tomorrow.",
        "answerPashto": "ستونزه نشته. سبا یې راوړه.",
        "answerDari": "ستونزه نشته. سبا یې راوړه.",
        "phonetic": "faramosh"
      },
      {
        "promptEn": "I made a mistake.",
        "promptPashto": "ما غلطي وکړه.",
        "promptDari": "ما غلطي وکړه.",
        "answerEn": "Thank you for saying sorry.",
        "answerPashto": "مننه چې بخښنه وغوښتله.",
        "answerDari": "مننه چې بخښنه وغوښتله.",
        "phonetic": "eshtebah"
      }
    ]
  },
  {
    "id": "making-plans-beginner",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "Making Plans with Friends",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What shall we do tomorrow?",
        "promptPashto": "موږ سبا څه وکړو؟",
        "promptDari": "موږ سبا څه وکړو؟",
        "answerEn": "Let us go to the library after lunch.",
        "answerPashto": "راځئ د غرمې وروسته کتابتون ته لاړ شو.",
        "answerDari": "راځئ د غرمې وروسته کتابتون ته لاړ شو.",
        "phonetic": "barna-ma"
      },
      {
        "promptEn": "What time should we meet?",
        "promptPashto": "موږ باید کله وګورو؟",
        "promptDari": "موږ باید کله وګورو؟",
        "answerEn": "Let us meet at three o'clock.",
        "answerPashto": "راځئ د درو بجو وخت ووینو.",
        "answerDari": "راځئ د درو بجو وخت ووینو.",
        "phonetic": "bebeenem"
      },
      {
        "promptEn": "Should I bring anything?",
        "promptPashto": "ایا زه باید کوم شی راوړم؟",
        "promptDari": "ایا زه باید کوم شی راوړم؟",
        "answerEn": "Bring your notebook and a pen.",
        "answerPashto": "خپل کاپي او قلم راوړه.",
        "answerDari": "خپل کاپي او قلم راوړه.",
        "phonetic": "ketabcha"
      }
    ]
  },
  {
    "id": "library-basic",
    "level": "basic",
    "category": "school",
    "titleEn": "At the Library",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do I need a library card?",
        "promptPashto": "ایا ماته د کتابتون کارت ضرور دی؟",
        "promptDari": "ایا ماته د کتابتون کارت ضرور دی؟",
        "answerEn": "Yes, please fill this form.",
        "answerPashto": "هو، مهرباني وکړئ دا فورم ډک کړئ.",
        "answerDari": "هو، مهرباني وکړئ دا فورم ډک کړئ.",
        "phonetic": "ketab-khana"
      },
      {
        "promptEn": "Can I borrow this book?",
        "promptPashto": "ایا زه دا کتاب پور اخیستلی شم؟",
        "promptDari": "ایا زه دا کتاب پور اخیستلی شم؟",
        "answerEn": "Yes, you can keep it for two weeks.",
        "answerPashto": "هو، تاسو یې دوه اونۍ ساتلی شئ.",
        "answerDari": "هو، تاسو یې دوه اونۍ ساتلی شئ.",
        "phonetic": "amanat"
      },
      {
        "promptEn": "Where are the English books?",
        "promptPashto": "انګلیسي کتابونه چیرې دي؟",
        "promptDari": "انګلیسي کتابونه چیرې دي؟",
        "answerEn": "They are on the second shelf.",
        "answerPashto": "دوی د دویمې شیلف پرمخ دي.",
        "answerDari": "دوی د دویمې شیلف پرمخ دي.",
        "phonetic": "qafasa"
      }
    ]
  },
  {
    "id": "work-talk-intermediate",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Talking About Work",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What do you do for work?",
        "promptPashto": "تاسو د کار لپاره څه کوئ؟",
        "promptDari": "تاسو د کار لپاره څه کوئ؟",
        "answerEn": "I work in a small shop near my home.",
        "answerPashto": "زه د خپل کور سره یوه کوچنۍ دکان کې کار کوم.",
        "answerDari": "زه د خپل کور سره یوه کوچنۍ دکان کې کار کوم.",
        "phonetic": "kar"
      },
      {
        "promptEn": "What are your main duties?",
        "promptPashto": "ستاسو اصلي دندې کومې دي؟",
        "promptDari": "ستاسو اصلي دندې کومې دي؟",
        "answerEn": "I help customers and organize products.",
        "answerPashto": "زه پیرودونکو سره مرسته کوم او توکي تنظیموم.",
        "answerDari": "زه پیرودونکو سره مرسته کوم او توکي تنظیموم.",
        "phonetic": "wazaif"
      },
      {
        "promptEn": "Do you like your job?",
        "promptPashto": "تاسو خپل کار خوښوئ؟",
        "promptDari": "تاسو خپل کار خوښوئ؟",
        "answerEn": "Yes, but I want to learn more skills.",
        "answerPashto": "هو، خو زه نور مهارتونه زده کول غواړم.",
        "answerDari": "هو، خو زه نور مهارتونه زده کول غواړم.",
        "phonetic": "maharat"
      }
    ]
  },
  {
    "id": "doctor-detailed-advanced",
    "level": "advanced",
    "category": "health",
    "titleEn": "Visiting a Doctor — Detailed",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Can you describe your pain?",
        "promptPashto": "ایا تاسو خپل درد تشریح کولی شئ؟",
        "promptDari": "ایا تاسو خپل درد تشریح کولی شئ؟",
        "answerEn": "It is a sharp pain on the right side.",
        "answerPashto": "دا د ښي خوا تیز درد دی.",
        "answerDari": "دا د ښي خوا تیز درد دی.",
        "phonetic": "dard-e teez"
      },
      {
        "promptEn": "Do you take any medicine?",
        "promptPashto": "ایا تاسو کومه درمل اخلئ؟",
        "promptDari": "ایا تاسو کومه درمل اخلئ؟",
        "answerEn": "Yes, I take medicine for blood pressure.",
        "answerPashto": "هو، زه د وینې فشار لپاره درمل اخلم.",
        "answerDari": "هو، زه د وینې فشار لپاره درمل اخلم.",
        "phonetic": "feshar-e khoon"
      },
      {
        "promptEn": "We need to do a blood test.",
        "promptPashto": "موږ د وینې ازموینه کولو ضرورت لرو.",
        "promptDari": "موږ د وینې ازموینه کولو ضرورت لرو.",
        "answerEn": "Okay, when will the result be ready?",
        "answerPashto": "سمه ده، پایله به کله چمتو وي؟",
        "answerDari": "سمه ده، پایله به کله چمتو وي؟",
        "phonetic": "azmayesh"
      }
    ]
  },
  {
    "id": "news-advanced",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Discussing the News",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Did you hear the news today?",
        "promptPashto": "ایا تاسو نن اخبار واورئ؟",
        "promptDari": "ایا تاسو نن اخبار واورئ؟",
        "answerEn": "Yes, I heard about the heavy rain.",
        "answerPashto": "هو، ما د سختې بارانولو خبر واورید.",
        "answerDari": "هو، ما د سختې بارانولو خبر واورید.",
        "phonetic": "akhbar"
      },
      {
        "promptEn": "Do you trust this source?",
        "promptPashto": "ایا تاسو دې سرچینې باور کوئ؟",
        "promptDari": "ایا تاسو دې سرچینې باور کوئ؟",
        "answerEn": "I am not sure. I want to check another source.",
        "answerPashto": "زه ډاډه نه یم. غواړم بله سرچینه وګورم.",
        "answerDari": "زه ډاډه نه یم. غواړم بله سرچینه وګورم.",
        "phonetic": "etemaad"
      },
      {
        "promptEn": "How should we talk about sensitive news?",
        "promptPashto": "موږ باید د حساسو اخبارونو د خبرو کولو لپاره څنګه وي؟",
        "promptDari": "موږ باید د حساسو اخبارونو د خبرو کولو لپاره څنګه وي؟",
        "answerEn": "We should be respectful and avoid rumours.",
        "answerPashto": "موږ باید درناوی وکړو او له شایعاتو ډډه وکړو.",
        "answerDari": "موږ باید درناوی وکړو او له شایعاتو ډډه وکړو.",
        "phonetic": "shayaat"
      }
    ]
  },
  {
    "id": "business-phone-call-intermediate",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "A Phone Call to a Business",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Good afternoon, how may I help you?",
        "promptPashto": "غرماء مو پخیر، زه تاسو سره د کومې مرستې کولی شم؟",
        "promptDari": "غرماء مو پخیر، زه تاسو سره د کومې مرستې کولی شم؟",
        "answerEn": "I am calling to ask about your opening hours.",
        "answerPashto": "زه ستاسو د خلاصیدو ساعتونو پوښتنه لپاره زنګ وهم.",
        "answerDari": "زه ستاسو د خلاصیدو ساعتونو پوښتنه لپاره زنګ وهم.",
        "phonetic": "kasb-o-kar"
      },
      {
        "promptEn": "We are open from nine to six.",
        "promptPashto": "موږ له نهو نه تر شپږو پورې خلاص یو.",
        "promptDari": "موږ له نهو نه تر شپږو پورې خلاص یو.",
        "answerEn": "Are you open on Friday?",
        "answerPashto": "ایا تاسو د جمعې پر ورځ خلاص یاست؟",
        "answerDari": "ایا تاسو د جمعې پر ورځ خلاص یاست؟",
        "phonetic": "juma"
      },
      {
        "promptEn": "Please send us your address.",
        "promptPashto": "مهرباني وکړئ خپل پته راواستوئ.",
        "promptDari": "مهرباني وکړئ خپل پته راواستوئ.",
        "answerEn": "Sure, I will send it by message.",
        "answerPashto": "سمه ده، زه به یې د پیغام لپاره واستوم.",
        "answerDari": "سمه ده، زه به یې د پیغام لپاره واستوم.",
        "phonetic": "payam"
      }
    ]
  },
  {
    "id": "parent-teacher-intermediate",
    "level": "intermediate",
    "category": "school",
    "titleEn": "Parent-Teacher Meeting",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "How is my child doing in class?",
        "promptPashto": "زما ماشوم ټولګي کې څنګه کار کوي؟",
        "promptDari": "زما ماشوم ټولګي کې څنګه کار کوي؟",
        "answerEn": "Your child is improving in reading.",
        "answerPashto": "ستاسو ماشوم د لوستلو کې پرمختګ کوي.",
        "answerDari": "ستاسو ماشوم د لوستلو کې پرمختګ کوي.",
        "phonetic": "waledeen"
      },
      {
        "promptEn": "What should we practise at home?",
        "promptPashto": "موږ باید کور کې د کومې مشق وکړو؟",
        "promptDari": "موږ باید کور کې د کومې مشق وکړو؟",
        "answerEn": "Please practise reading for ten minutes daily.",
        "answerPashto": "مهرباني وکړئ هره ورځ لس دقیقې لوستل مشق وکړئ.",
        "answerDari": "مهرباني وکړئ هره ورځ لس دقیقې لوستل مشق وکړئ.",
        "phonetic": "tamreen"
      },
      {
        "promptEn": "Does my child participate?",
        "promptPashto": "ایا زما ماشوم برخه اخلي؟",
        "promptDari": "ایا زما ماشوم برخه اخلي؟",
        "answerEn": "Yes, but he needs more confidence in speaking.",
        "answerPashto": "هو، خو د خبرو کولو کې ورته نور ډاډ ته اړتیا ده.",
        "answerDari": "هو، خو د خبرو کولو کې ورته نور ډاډ ته اړتیا ده.",
        "phonetic": "sahm"
      }
    ]
  },
  {
    "id": "taxi-ride-basic",
    "level": "basic",
    "category": "travel",
    "titleEn": "Taking a Taxi",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Where do you want to go?",
        "promptPashto": "تاسو چیرې لاړ شئ؟",
        "promptDari": "تاسو چیرې لاړ شئ؟",
        "answerEn": "Please take me to the city centre.",
        "answerPashto": "مهرباني وکړئ ما د ښار مرکز ته یوسئ.",
        "answerDari": "مهرباني وکړئ ما د ښار مرکز ته یوسئ.",
        "phonetic": "taxi"
      },
      {
        "promptEn": "Do you know the address?",
        "promptPashto": "ایا تاسو پته پیژنئ؟",
        "promptDari": "ایا تاسو پته پیژنئ؟",
        "answerEn": "Yes, I have it on my phone.",
        "answerPashto": "هو، ما یې زما تلیفون کې ده.",
        "answerDari": "هو، ما یې زما تلیفون کې ده.",
        "phonetic": "adres"
      },
      {
        "promptEn": "Can you stop here, please?",
        "promptPashto": "ایا تاسو دلته ودرولی شئ؟",
        "promptDari": "ایا تاسو دلته ودرولی شئ؟",
        "answerEn": "Of course. Here is fine.",
        "answerPashto": "البته. دلته ښه دی.",
        "answerDari": "البته. دلته ښه دی.",
        "phonetic": "tawaquf"
      }
    ]
  },
  {
    "id": "pharmacy-basic",
    "level": "basic",
    "category": "health",
    "titleEn": "At the Pharmacy",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you have this medicine?",
        "promptPashto": "ایا تاسو دا درمل لرئ؟",
        "promptDari": "ایا تاسو دا درمل لرئ؟",
        "answerEn": "Yes, we have it in tablets.",
        "answerPashto": "هو، موږ یې د ګولیو پرته لرو.",
        "answerDari": "هو، موږ یې د ګولیو پرته لرو.",
        "phonetic": "dawakhaana"
      },
      {
        "promptEn": "How should I take it?",
        "promptPashto": "زه باید دا څنګه واخلم؟",
        "promptDari": "زه باید دا څنګه واخلم؟",
        "answerEn": "Take one tablet after food.",
        "answerPashto": "د خواړو وروسته یوه ګولۍ واخله.",
        "answerDari": "د خواړو وروسته یوه ګولۍ واخله.",
        "phonetic": "tablet"
      },
      {
        "promptEn": "Does it have side effects?",
        "promptPashto": "ایا دا اغیزې لري؟",
        "promptDari": "ایا دا اغیزې لري؟",
        "answerEn": "It may make you sleepy.",
        "answerPashto": "ممکن تاسو خوبیدلی شئ.",
        "answerDari": "ممکن تاسو خوبیدلی شئ.",
        "phonetic": "awariz"
      }
    ]
  },
  {
    "id": "homework-help-basic",
    "level": "basic",
    "category": "school",
    "titleEn": "Asking for Homework Help",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Can you help me with homework?",
        "promptPashto": "ایا تاسو ماته د کور دندې کې مرسته کولی شئ؟",
        "promptDari": "ایا تاسو ماته د کور دندې کې مرسته کولی شئ؟",
        "answerEn": "Yes, which question is difficult?",
        "answerPashto": "هو، کومه پوښتنه ستونزمنه ده؟",
        "answerDari": "هو، کومه پوښتنه ستونزمنه ده؟",
        "phonetic": "kar-e khanagee"
      },
      {
        "promptEn": "I do not understand this word.",
        "promptPashto": "زه دا کلمه نه پوهیږم.",
        "promptDari": "زه دا کلمه نه پوهیږم.",
        "answerEn": "Let us read the sentence together.",
        "answerPashto": "راځئ یوځای جمله ولولو.",
        "answerDari": "راځئ یوځای جمله ولولو.",
        "phonetic": "kalema"
      },
      {
        "promptEn": "Thank you for explaining.",
        "promptPashto": "د تشریح کولو مننه.",
        "promptDari": "د تشریح کولو مننه.",
        "answerEn": "You are welcome. Practise it again.",
        "answerPashto": "ښه راغلاست. بیا یې مشق وکړه.",
        "answerDari": "ښه راغلاست. بیا یې مشق وکړه.",
        "phonetic": "tozeeh"
      }
    ]
  },
  {
    "id": "house-rent-intermediate",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Renting a House",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Is this house available?",
        "promptPashto": "ایا دا کور موجود دی؟",
        "promptDari": "ایا دا کور موجود دی؟",
        "answerEn": "Yes, it is available from next month.",
        "answerPashto": "هو، دا د راتلونکي میاشتې راهیسې موجود دی.",
        "answerDari": "هو، دا د راتلونکي میاشتې راهیسې موجود دی.",
        "phonetic": "keraya"
      },
      {
        "promptEn": "How much is the rent?",
        "promptPashto": "کرایه څومره ده؟",
        "promptDari": "کرایه څومره ده؟",
        "answerEn": "The rent is eight hundred dollars per month.",
        "answerPashto": "کرایه هره میاشت اتو سوه ډالره ده.",
        "answerDari": "کرایه هره میاشت اتو سوه ډالره ده.",
        "phonetic": "mah-ana"
      },
      {
        "promptEn": "Are bills included?",
        "promptPashto": "ایا بیلونه شامل دي؟",
        "promptDari": "ایا بیلونه شامل دي؟",
        "answerEn": "No, bills are separate.",
        "answerPashto": "نه، بیلونه جلا دي.",
        "answerDari": "نه، بیلونه جلا دي.",
        "phonetic": "masraf"
      }
    ]
  },
  {
    "id": "community-centre-beginner",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "At the Community Centre",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you have English classes here?",
        "promptPashto": "ایا تاسو دلته انګلیسي ټولګي لرئ؟",
        "promptDari": "ایا تاسو دلته انګلیسي ټولګي لرئ؟",
        "answerEn": "Yes, we have classes every Tuesday.",
        "answerPashto": "هو، موږ هره درۍ ورځ ټولګي لرو.",
        "answerDari": "هو، موږ هره درۍ ورځ ټولګي لرو.",
        "phonetic": "markaz-e ejtemai"
      },
      {
        "promptEn": "How can I register?",
        "promptPashto": "زه د ثبت نام کولو لپاره څنګه کولی شم؟",
        "promptDari": "زه د ثبت نام کولو لپاره څنګه کولی شم؟",
        "answerEn": "Please write your name and phone number.",
        "answerPashto": "مهرباني وکړئ خپل نوم او تلیفون شمیره ولیکئ.",
        "answerDari": "مهرباني وکړئ خپل نوم او تلیفون شمیره ولیکئ.",
        "phonetic": "sabt-e nam"
      },
      {
        "promptEn": "Is the class free?",
        "promptPashto": "ایا ټولګی وړیا ده؟",
        "promptDari": "ایا ټولګی وړیا ده؟",
        "answerEn": "Yes, it is free for families.",
        "answerPashto": "هو، دا د کورنیو لپاره وړیا ده.",
        "answerDari": "هو، دا د کورنیو لپاره وړیا ده.",
        "phonetic": "raygan"
      }
    ]
  },
  {
    "id": "emergency-call-intermediate",
    "level": "intermediate",
    "category": "health",
    "titleEn": "Emergency Call",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What is your emergency?",
        "promptPashto": "ستاسو بیړي ستونزه څه ده؟",
        "promptDari": "ستاسو بیړي ستونزه څه ده؟",
        "answerEn": "My brother is very sick and needs help.",
        "answerPashto": "زما ورور ډیر ناروغ دی او مرستې ته اړتیا لري.",
        "answerDari": "زما ورور ډیر ناروغ دی او مرستې ته اړتیا لري.",
        "phonetic": "ezterari"
      },
      {
        "promptEn": "What is your address?",
        "promptPashto": "ستاسو پته څه ده؟",
        "promptDari": "ستاسو پته څه ده؟",
        "answerEn": "We are near the main mosque on Flower Street.",
        "answerPashto": "موږ د اصلي جومات سره د ګل کوڅه کې یو.",
        "answerDari": "موږ د اصلي جومات سره د ګل کوڅه کې یو.",
        "phonetic": "masjed"
      },
      {
        "promptEn": "Stay calm. Help is on the way.",
        "promptPashto": "آرامه اوسه. مرسته راروانه ده.",
        "promptDari": "آرامه اوسه. مرسته راروانه ده.",
        "answerEn": "Thank you. We are waiting.",
        "answerPashto": "مننه. موږ انتظار کوو.",
        "answerDari": "مننه. موږ انتظار کوو.",
        "phonetic": "aram"
      }
    ]
  },
  {
    "id": "market-bargaining-intermediate",
    "level": "intermediate",
    "category": "food",
    "titleEn": "Polite Bargaining",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "How much are these apples?",
        "promptPashto": "دا سیبونه د کومې نرخ دي؟",
        "promptDari": "دا سیبونه د کومې نرخ دي؟",
        "answerEn": "They are four dollars per kilo.",
        "answerPashto": "دوی د هر کیلوګرام لپاره څلور ډالره دي.",
        "answerDari": "دوی د هر کیلوګرام لپاره څلور ډالره دي.",
        "phonetic": "chana-zani"
      },
      {
        "promptEn": "Can you make it a little cheaper?",
        "promptPashto": "ایا تاسو یو لږ ارزانه کولی شئ؟",
        "promptDari": "ایا تاسو یو لږ ارزانه کولی شئ؟",
        "answerEn": "I can reduce the price if you buy two kilos.",
        "answerPashto": "که چیرې تاسو دوه کیلوګرامه واخلئ نو زه نرخ کمولی شم.",
        "answerDari": "که چیرې تاسو دوه کیلوګرامه واخلئ نو زه نرخ کمولی شم.",
        "phonetic": "arzan"
      },
      {
        "promptEn": "Thank you, I will take two kilos.",
        "promptPashto": "مننه، زه به دوه کیلوګرامه واخلم.",
        "promptDari": "مننه، زه به دوه کیلوګرامه واخلم.",
        "answerEn": "You are welcome.",
        "answerPashto": "ښه راغلاست.",
        "answerDari": "ښه راغلاست.",
        "phonetic": "kilo"
      }
    ]
  },
  {
    "id": "school-absence-basic",
    "level": "basic",
    "category": "school",
    "titleEn": "Explaining an Absence",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Why were you absent yesterday?",
        "promptPashto": "تاسو ولې پرون غیر حاضر وئ؟",
        "promptDari": "تاسو ولې پرون غیر حاضر وئ؟",
        "answerEn": "I was sick and stayed at home.",
        "answerPashto": "زه ناروغ وم او کور کې پاتې شوم.",
        "answerDari": "زه ناروغ وم او کور کې پاتې شوم.",
        "phonetic": "ghair-hazir"
      },
      {
        "promptEn": "Did you bring a note?",
        "promptPashto": "ایا تاسو یوه یادداشت راوړلې؟",
        "promptDari": "ایا تاسو یوه یادداشت راوړلې؟",
        "answerEn": "Yes, my father wrote this note.",
        "answerPashto": "هو، پلار مې دا یادداشت ولیکه.",
        "answerDari": "هو، پلار مې دا یادداشت ولیکه.",
        "phonetic": "maktoob"
      },
      {
        "promptEn": "Please copy the missing lesson.",
        "promptPashto": "مهرباني وکړئ د لاسه ورکړل شوی سبق کاپي کړئ.",
        "promptDari": "مهرباني وکړئ د لاسه ورکړل شوی سبق کاپي کړئ.",
        "answerEn": "I will copy it after class.",
        "answerPashto": "زه به یې د ټولګي وروسته کاپي کوم.",
        "answerDari": "زه به یې د ټولګي وروسته کاپي کوم.",
        "phonetic": "dars-e manda"
      }
    ]
  },
  {
    "id": "future-plans-intermediate",
    "level": "intermediate",
    "category": "school",
    "titleEn": "Future Plans",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What do you want to become?",
        "promptPashto": "تاسو څه کیدل غواړئ؟",
        "promptDari": "تاسو څه کیدل غواړئ؟",
        "answerEn": "I want to become a teacher.",
        "answerPashto": "زه استاذ کیدل غواړم.",
        "answerDari": "زه استاذ کیدل غواړم.",
        "phonetic": "ayanda"
      },
      {
        "promptEn": "Why did you choose that job?",
        "promptPashto": "ولې تاسو هغه کار غوره کړ؟",
        "promptDari": "ولې تاسو هغه کار غوره کړ؟",
        "answerEn": "Because I like helping children learn.",
        "answerPashto": "ځکه ما خوښیږي ماشومانو ته زده کوم.",
        "answerDari": "ځکه ما خوښیږي ماشومانو ته زده کوم.",
        "phonetic": "entekhab"
      },
      {
        "promptEn": "What will you do this year?",
        "promptPashto": "تاسو سږکال به څه وکړئ؟",
        "promptDari": "تاسو سږکال به څه وکړئ؟",
        "answerEn": "I will study hard and improve my English.",
        "answerPashto": "زه به سخت مطالعه وکړم او انګلیسي ښه کوم.",
        "answerDari": "زه به سخت مطالعه وکړم او انګلیسي ښه کوم.",
        "phonetic": "emsaal"
      }
    ]
  },
  {
    "id": "internet-problem-basic",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "Internet Problem",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "The internet is not working.",
        "promptPashto": "انټرنیټ کار نه کوي.",
        "promptDari": "انټرنیټ کار نه کوي.",
        "answerEn": "Did you restart the router?",
        "answerPashto": "ایا تاسو راوټر بیا پیل کړ؟",
        "answerDari": "ایا تاسو راوټر بیا پیل کړ؟",
        "phonetic": "internet"
      },
      {
        "promptEn": "Yes, but it is still slow.",
        "promptPashto": "هو، خو لاهم ورو ورو دی.",
        "promptDari": "هو، خو لاهم ورو ورو دی.",
        "answerEn": "Let us call the company.",
        "answerPashto": "راځئ شرکت ته زنګ وهو.",
        "answerDari": "راځئ شرکت ته زنګ وهو.",
        "phonetic": "ahista"
      },
      {
        "promptEn": "What is the account number?",
        "promptPashto": "د حساب شمیره کومه ده؟",
        "promptDari": "د حساب شمیره کومه ده؟",
        "answerEn": "I will find it on the bill.",
        "answerPashto": "زه به یې د بیل پرمخ ومومم.",
        "answerDari": "زه به یې د بیل پرمخ ومومم.",
        "phonetic": "hesab"
      }
    ]
  },
  {
    "id": "formal-email-academic",
    "level": "academic",
    "category": "school",
    "titleEn": "Writing a Formal Email",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Who are you writing to?",
        "promptPashto": "تاسو چا ته لیکئ؟",
        "promptDari": "تاسو چا ته لیکئ؟",
        "answerEn": "I am writing to the admissions office.",
        "answerPashto": "زه د ننوتلو دفتر ته لیکم.",
        "answerDari": "زه د ننوتلو دفتر ته لیکم.",
        "phonetic": "rasmi"
      },
      {
        "promptEn": "What is the purpose of the email?",
        "promptPashto": "د برقي لیک موخه څه ده؟",
        "promptDari": "د برقي لیک موخه څه ده؟",
        "answerEn": "I want to ask about my application status.",
        "answerPashto": "زه د خپل غوښتنلیک وضعیت پوښتنه کول غواړم.",
        "answerDari": "زه د خپل غوښتنلیک وضعیت پوښتنه کول غواړم.",
        "phonetic": "hadaf"
      },
      {
        "promptEn": "How should you close the email?",
        "promptPashto": "تاسو باید برقي لیک د کومه لارې بند کړئ؟",
        "promptDari": "تاسو باید برقي لیک د کومه لارې بند کړئ؟",
        "answerEn": "I can write, Yours sincerely, and my full name.",
        "answerPashto": "زه لیکلی شم: ستاسو مخلص، او بیا خپل بشپړ نوم.",
        "answerDari": "زه لیکلی شم: ستاسو مخلص، او بیا خپل بشپړ نوم.",
        "phonetic": "ba ehteram"
      }
    ]
  },
  {
    "id": "ielts-agree-disagree",
    "level": "ielts",
    "category": "school",
    "titleEn": "IELTS Agree or Disagree",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Some people think children should use phones at school.",
        "promptPashto": "ځینې خلک فکر کوي چې ماشومان باید ښوونځي کې تلیفونونه وکاروي.",
        "promptDari": "ځینې خلک فکر کوي چې ماشومان باید ښوونځي کې تلیفونونه وکاروي.",
        "answerEn": "I partly agree because phones can support learning.",
        "answerPashto": "زه یو بریده موافق یم ځکه تلیفونونه د زده کړې ملاتړ کولی شي.",
        "answerDari": "زه یو بریده موافق یم ځکه تلیفونونه د زده کړې ملاتړ کولی شي.",
        "phonetic": "partly agree"
      },
      {
        "promptEn": "What is one disadvantage?",
        "promptPashto": "یوه ستونزه کومه ده؟",
        "promptDari": "یوه ستونزه کومه ده؟",
        "answerEn": "Phones can distract students from lessons.",
        "answerPashto": "تلیفونونه کولی شي زده کوونکي له سبقونو وبیايي.",
        "answerDari": "تلیفونونه کولی شي زده کوونکي له سبقونو وبیايي.",
        "phonetic": "distract"
      },
      {
        "promptEn": "What is your final opinion?",
        "promptPashto": "ستاسو وروستی نظر کومه دی؟",
        "promptDari": "ستاسو وروستی نظر کومه دی؟",
        "answerEn": "Phones should be allowed only for learning tasks.",
        "answerPashto": "تلیفونونه باید یوازې د زده کړې دندو لپاره اجازه ورکول شي.",
        "answerDari": "تلیفونونه باید یوازې د زده کړې دندو لپاره اجازه ورکول شي.",
        "phonetic": "nazar-e nahayee"
      }
    ]
  },
  {
    "id": "storytelling-family-basic",
    "level": "basic",
    "category": "family",
    "titleEn": "Telling a Family Story",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Can you tell me a family story?",
        "promptPashto": "ایا تاسو ماته د کورنۍ کیسه ویلی شئ؟",
        "promptDari": "ایا تاسو ماته د کورنۍ کیسه ویلی شئ؟",
        "answerEn": "Yes, my grandfather told me a story about his village.",
        "answerPashto": "هو، زما نیکه ماته د خپل کلي کیسه وویله.",
        "answerDari": "هو، زما نیکه ماته د خپل کلي کیسه وویله.",
        "phonetic": "dastan"
      },
      {
        "promptEn": "What happened in the story?",
        "promptPashto": "کیسه کې څه وشول؟",
        "promptDari": "کیسه کې څه وشول؟",
        "answerEn": "People helped each other during a hard winter.",
        "answerPashto": "خلکو د سختو ژمي پر مهال یو بل سره مرسته وکړه.",
        "answerDari": "خلکو د سختو ژمي پر مهال یو بل سره مرسته وکړه.",
        "phonetic": "zemestan"
      },
      {
        "promptEn": "What did you learn from it?",
        "promptPashto": "تاسو له هغه څه زده کړل؟",
        "promptDari": "تاسو له هغه څه زده کړل؟",
        "answerEn": "I learned that kindness is stronger than fear.",
        "answerPashto": "ما زده کړل چې مهرباني له وېرې قوي ده.",
        "answerDari": "ما زده کړل چې مهرباني له وېرې قوي ده.",
        "phonetic": "mehrbani"
      }
    ]
  }
];

const TOPIC_STUDIO_DATA = [
  {
    "id": "my-community",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "My Community",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "I live in a big city with many different people. My neighbours come from many countries.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Our community centre has English classes, sports, and events for everyone.",
        "dari": ""
      }
    ]
  },
  {
    "id": "afghan-heritage",
    "level": "intermediate",
    "category": "culture",
    "titleEn": "Afghan Heritage",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Afghanistan has a rich history spanning thousands of years. The Silk Road passed through ancient Afghan cities.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Afghan people are famous for their hospitality, poetry, and music. Many learners use Pashto support while building English confidence.",
        "dari": ""
      }
    ]
  },
  {
    "id": "environment",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Protecting the Environment",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Climate change is one of the greatest challenges facing our planet. We must take action now to protect our environment.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Small changes in daily life can make a big difference. Recycling, saving water, and using public transport all help.",
        "dari": ""
      }
    ]
  },
  {
    "id": "daily-morning",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "My Morning Routine",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "I wake up early because the morning is quiet. I wash my face, brush my teeth, and prepare for the day.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "After breakfast, I check my school bag or work bag. A good morning routine helps me feel calm and ready.",
        "dari": ""
      }
    ]
  },
  {
    "id": "my-family-support",
    "level": "beginner",
    "category": "family",
    "titleEn": "My Family Supports Me",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "My family is very important to me. They help me when I have a problem and encourage me when I study.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "At home we speak Pashto and sometimes practise English together. Learning becomes easier when the family supports each other.",
        "dari": ""
      }
    ]
  },
  {
    "id": "my-school-day",
    "level": "basic",
    "category": "school",
    "titleEn": "My School Day",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "I go to school in the morning and meet my classmates. We study reading, writing, mathematics, and English.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "My teacher explains the lesson slowly. I ask questions when I do not understand.",
        "dari": ""
      }
    ]
  },
  {
    "id": "first-library",
    "level": "beginner",
    "category": "school",
    "titleEn": "My First Visit to the Library",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "The library was quiet and full of books. I felt happy because I could choose any book and read it.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "A kind librarian helped me find a beginner English story. I borrowed the book and promised to return it on time.",
        "dari": ""
      }
    ]
  },
  {
    "id": "helping-at-home",
    "level": "basic",
    "category": "family",
    "titleEn": "Helping at Home",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Every family member can help at home. Children can clean their room, wash dishes, or help younger brothers and sisters.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Helping at home teaches responsibility. It also makes parents feel respected and supported.",
        "dari": ""
      }
    ]
  },
  {
    "id": "healthy-food",
    "level": "beginner",
    "category": "food",
    "titleEn": "Healthy Food",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Healthy food gives us energy. We should eat vegetables, fruit, bread, rice, meat, and drink clean water.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Too much sugar and oil can make us tired. A balanced meal helps children study and adults work better.",
        "dari": ""
      }
    ]
  },
  {
    "id": "visiting-doctor",
    "level": "beginner",
    "category": "health",
    "titleEn": "Visiting the Doctor",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "When I feel sick, I tell my family. We go to the doctor and explain the symptoms clearly.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "The doctor asks questions and may give medicine. It is important to follow the instructions carefully.",
        "dari": ""
      }
    ]
  },
  {
    "id": "safe-travel",
    "level": "intermediate",
    "category": "travel",
    "titleEn": "Travelling Safely",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Before travelling, I check my documents, ticket, phone, and address. I also tell my family where I am going.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Safe travel means being prepared, asking for help politely, and keeping important items close.",
        "dari": ""
      }
    ]
  },
  {
    "id": "afghan-hospitality",
    "level": "intermediate",
    "category": "culture",
    "titleEn": "Afghan Hospitality",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Hospitality is a strong part of Afghan culture. Guests are welcomed with tea, food, respect, and kind words.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Hospitality is not only about food. It is also about making people feel safe, honoured, and included.",
        "dari": ""
      }
    ]
  },
  {
    "id": "learning-english",
    "level": "beginner",
    "category": "school",
    "titleEn": "Why I Learn English",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "I learn English because it helps me at school, online, and in daily life. English also helps me talk to more people.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I do not need to speak perfectly from the first day. I need to practise a little every day and not be afraid of mistakes.",
        "dari": ""
      }
    ]
  },
  {
    "id": "respecting-elders",
    "level": "basic",
    "category": "culture",
    "titleEn": "Respecting Elders",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "In many Afghan families, respecting elders is very important. We listen carefully when they speak and greet them politely.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Respect does not mean we cannot ask questions. It means we speak with good manners and a kind heart.",
        "dari": ""
      }
    ]
  },
  {
    "id": "neighbour-help",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "Helping a Neighbour",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "One day my neighbour carried heavy bags. I asked if she needed help, and she smiled.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Small help can make a big difference. Good neighbours make a community stronger.",
        "dari": ""
      }
    ]
  },
  {
    "id": "phone-manners",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Phone Manners",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "When we call someone, we should greet them first and ask if they have time to talk.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Good phone manners are important at work, school, and with family. Clear and respectful speech prevents confusion.",
        "dari": ""
      }
    ]
  },
  {
    "id": "saving-money",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Saving Money",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Saving money is a useful habit. Even a small amount saved every week can help during emergencies.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Before buying something, I ask myself if I really need it. This helps me control spending.",
        "dari": ""
      }
    ]
  },
  {
    "id": "clean-water",
    "level": "intermediate",
    "category": "health",
    "titleEn": "Clean Water",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Clean water protects families from disease. Children especially need safe water for drinking and washing.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Communities can keep water clean by covering containers, washing hands, and keeping rubbish away from wells.",
        "dari": ""
      }
    ]
  },
  {
    "id": "time-management",
    "level": "advanced",
    "category": "school",
    "titleEn": "Time Management",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Good time management helps students reduce stress. A simple plan can show when to study, rest, and help at home.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "The most important rule is to start early. When we delay every task, small duties become heavy problems.",
        "dari": ""
      }
    ]
  },
  {
    "id": "community-service",
    "level": "advanced",
    "category": "culture",
    "titleEn": "Community Service",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Community service means helping people without expecting personal profit. It can include cleaning a street, teaching children, or supporting elders.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "A strong community is built when people share responsibility. Young people can learn leadership by serving others.",
        "dari": ""
      }
    ]
  },
  {
    "id": "small-business",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Starting a Small Business",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "A small business starts with a simple idea and careful planning. The owner must understand customers, costs, and quality.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Trust is very important. If customers receive good service, they come back and tell others.",
        "dari": ""
      }
    ]
  },
  {
    "id": "ielts-hometown",
    "level": "ielts",
    "category": "daily-life",
    "titleEn": "IELTS Topic: Hometown",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "My hometown is a place with strong traditions and warm people. It has busy markets, family gatherings, and local food.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "If I could improve one thing, I would improve public transport. Better transport would help students, workers, and older people.",
        "dari": ""
      }
    ]
  },
  {
    "id": "academic-study-skills",
    "level": "academic",
    "category": "school",
    "titleEn": "Study Skills for University",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "University study requires independent reading and clear note-taking. Students must learn how to summarise ideas in their own words.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Group discussion is also useful, but every student should prepare before the meeting. Preparation makes discussion more serious and respectful.",
        "dari": ""
      }
    ]
  }
];

const WIZARD_MODES = [
  { id:'repeat', en:'Repeat Wizard', dari:'', icon:'🔁' },
  { id:'chunk', en:'Chunk Builder', dari:'', icon:'🧩' },
  { id:'confidence', en:'Confidence Score', dari:'', icon:'💪' },
  { id:'listen-cover', en:'Listen–Cover–Speak', dari:'', icon:'👂' },
  { id:'meaning-first', en:'Meaning-First', dari:'', icon:'💡' },
  { id:'step-confidence', en:'Step Confidence', dari:'', icon:'📈' },
  { id:'full-speech', en:'Full Speech', dari:'', icon:'🎤' },
  { id:'audience', en:'Audience Mode', dari:'', icon:'👥' },
  { id:'exam', en:'Exam Practice', dari:'', icon:'📋' },
  { id:'mastery', en:'Mastery Test', dari:'', icon:'🏅' },
  { id:'dari-reading', en:'Pashto Reading', dari:'', icon:'📖' },
  { id:'translation', en:'Translation Challenge', dari:'', icon:'🔄' }
];

const STORIES = [
  {
    "id": "first-day",
    "level": "beginner",
    "titleEn": "First Day at School",
    "titleDari": "",
    "icon": "🏫",
    "color": "#e8f4fd",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Sara walked into her new school. She felt nervous but excited.",
        "dari": ""
      },
      {
        "en": "A friendly girl named Maria smiled at her. Hello! Is this your first day? she asked.",
        "dari": ""
      },
      {
        "en": "Yes, said Sara. I am from Afghanistan. My name is Sara.",
        "dari": ""
      },
      {
        "en": "Welcome, Sara! Come sit with me, said Maria. Sara smiled. School was not so scary after all.",
        "dari": ""
      }
    ]
  },
  {
    "id": "calling-grandma",
    "level": "intermediate",
    "titleEn": "Calling Grandma",
    "titleDari": "",
    "icon": "📞",
    "color": "#fdf0e8",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "Every Sunday, Ahmad called his grandmother in Kabul. She always asked the same questions.",
        "dari": ""
      },
      {
        "en": "Are you eating well? Are you studying hard? Do you miss Afghanistan?",
        "dari": ""
      },
      {
        "en": "Ahmad laughed softly. Yes, Bibi jan. I miss your cooking the most.",
        "dari": ""
      },
      {
        "en": "His grandmother laughed too. I will make bolani when you come home.",
        "dari": ""
      }
    ]
  },
  {
    "id": "kabul-market",
    "level": "advanced",
    "titleEn": "A Day at the Market",
    "titleDari": "",
    "icon": "🛍️",
    "color": "#f0f8ee",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "The old bazaar of Kabul was famous throughout Central Asia. Merchants sold spices, fabrics, and dried fruits.",
        "dari": ""
      },
      {
        "en": "Young Yusuf helped his father every Friday. He learned to count money and talk to customers.",
        "dari": ""
      },
      {
        "en": "Good prices! Best pomegranates in all Kabul! Yusuf called out to the passing people.",
        "dari": ""
      }
    ]
  },
  {
    "id": "learning-to-pray",
    "level": "nursery",
    "titleEn": "Learning to Pray",
    "titleDari": "",
    "icon": "🕌",
    "color": "#eef7ff",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Little Hamza watched his father pray every day. He stood beside him quietly and tried to copy the movements.",
        "dari": ""
      },
      {
        "en": "His father smiled and said, Prayer is learned slowly, with love and patience.",
        "dari": ""
      },
      {
        "en": "Hamza learned one short dua first. He felt proud because he had started a good habit.",
        "dari": ""
      }
    ]
  },
  {
    "id": "nowruz-morning",
    "level": "basic",
    "titleEn": "Nowruz Morning",
    "titleDari": "",
    "icon": "🌱",
    "color": "#f0fff0",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "On Nowruz morning, the house smelled clean and fresh. Mother placed haft mewa on the table.",
        "dari": ""
      },
      {
        "en": "The children wore clean clothes and greeted their grandparents. Everyone said kind words and made dua for a peaceful year.",
        "dari": ""
      },
      {
        "en": "In the afternoon, the family visited relatives. The day felt like a new beginning.",
        "dari": ""
      }
    ]
  },
  {
    "id": "bolani-grandmother",
    "level": "basic",
    "titleEn": "Making Bolani with Grandmother",
    "titleDari": "",
    "icon": "🥟",
    "color": "#fff5e8",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Mina loved visiting her grandmother on Friday. The kitchen was always warm and full of stories.",
        "dari": ""
      },
      {
        "en": "Grandmother showed Mina how to roll the dough and fill it with potatoes and green onions.",
        "dari": ""
      },
      {
        "en": "When the bolani was ready, the family ate together. Mina said, Food tastes better when we make it with love.",
        "dari": ""
      }
    ]
  },
  {
    "id": "library-trip",
    "level": "beginner",
    "titleEn": "First Trip to the Library",
    "titleDari": "",
    "icon": "📚",
    "color": "#edf5ff",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Farid entered the library for the first time. He spoke softly because everyone was reading.",
        "dari": ""
      },
      {
        "en": "A librarian helped him find a simple English story. Farid read the first page and understood many words.",
        "dari": ""
      },
      {
        "en": "He borrowed the book and took it home carefully. That night, he read it to his younger sister.",
        "dari": ""
      }
    ]
  },
  {
    "id": "shepherd-mountains",
    "level": "beginner",
    "titleEn": "A Shepherd in the Mountains",
    "titleDari": "",
    "icon": "🐑",
    "color": "#eef9f0",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "In a mountain village, a young shepherd named Omar took his sheep to the hills each morning.",
        "dari": ""
      },
      {
        "en": "He carried bread, water, and a small notebook. While the sheep ate grass, Omar practised English words.",
        "dari": ""
      },
      {
        "en": "One day a traveller asked for directions. Omar answered politely in English and felt very proud.",
        "dari": ""
      }
    ]
  },
  {
    "id": "new-city",
    "level": "intermediate",
    "titleEn": "Moving to a New City",
    "titleDari": "",
    "icon": "🏙️",
    "color": "#f1f1ff",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "When Laila's family moved to a new city, everything felt unfamiliar. The streets, school, and neighbours were all new.",
        "dari": ""
      },
      {
        "en": "At first, Laila missed her old friends. Her mother told her, A new city becomes home when you learn its people.",
        "dari": ""
      },
      {
        "en": "Slowly, Laila joined a reading club and made friends. The city no longer felt strange.",
        "dari": ""
      }
    ]
  },
  {
    "id": "mosque-friends",
    "level": "beginner",
    "titleEn": "Making Friends at the Mosque",
    "titleDari": "",
    "icon": "🕌",
    "color": "#f3fff7",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "After prayer, Sami saw a boy sitting alone near the door. Sami smiled and said salam.",
        "dari": ""
      },
      {
        "en": "The boy's name was Idris. He was new in the neighbourhood and did not know many children.",
        "dari": ""
      },
      {
        "en": "Sami invited him to play football after class. A simple salam became a new friendship.",
        "dari": ""
      }
    ]
  },
  {
    "id": "bike-learning",
    "level": "nursery",
    "titleEn": "Learning to Ride a Bike",
    "titleDari": "",
    "icon": "🚲",
    "color": "#fff8e8",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Amina wanted to ride her small bike. Her brother held the seat and walked beside her.",
        "dari": ""
      },
      {
        "en": "She fell once, but she did not cry. Her brother said, Try again. I am here.",
        "dari": ""
      },
      {
        "en": "After many tries, Amina rode alone for a few seconds. She laughed loudly and said, I can do it!",
        "dari": ""
      }
    ]
  },
  {
    "id": "letter-afghanistan",
    "level": "intermediate",
    "titleEn": "A Letter to Afghanistan",
    "titleDari": "",
    "icon": "✉️",
    "color": "#fff0f5",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Nadia wrote a letter to her cousin in Afghanistan. She described her school, her city, and the cold winter.",
        "dari": ""
      },
      {
        "en": "She also asked about the pomegranate tree in their old courtyard. That tree reminded her of family gatherings.",
        "dari": ""
      },
      {
        "en": "When she finished the letter, she felt closer to home. Words can cross long distances.",
        "dari": ""
      }
    ]
  },
  {
    "id": "pomegranate-tree",
    "level": "basic",
    "titleEn": "The Pomegranate Tree",
    "titleDari": "",
    "icon": "🌳",
    "color": "#fff1f1",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "In the corner of the yard stood an old pomegranate tree. Every autumn it gave bright red fruit.",
        "dari": ""
      },
      {
        "en": "Grandfather said the tree was planted when he was young. It had seen weddings, Eid visits, and children's games.",
        "dari": ""
      },
      {
        "en": "The children watered it every week. They wanted the tree to stay strong for many more years.",
        "dari": ""
      }
    ]
  },
  {
    "id": "eid-morning",
    "level": "nursery",
    "titleEn": "Eid Morning",
    "titleDari": "",
    "icon": "🎉",
    "color": "#fffbe8",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "On Eid morning, Yusuf woke up before everyone. His new clothes were ready beside his bed.",
        "dari": ""
      },
      {
        "en": "He hugged his parents and said Eid Mubarak. Then the family went to visit grandparents.",
        "dari": ""
      },
      {
        "en": "Yusuf received sweets and shared them with his little sister. Sharing made Eid even happier.",
        "dari": ""
      }
    ]
  },
  {
    "id": "lost-bazaar",
    "level": "beginner",
    "titleEn": "Lost in the Bazaar",
    "titleDari": "",
    "icon": "🧭",
    "color": "#fff4e8",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Zainab went to the bazaar with her aunt. The market was crowded and full of colours.",
        "dari": ""
      },
      {
        "en": "For a moment, Zainab could not see her aunt. She remembered the rule: stay calm and ask a shopkeeper for help.",
        "dari": ""
      },
      {
        "en": "The shopkeeper called her aunt. Zainab learned that staying calm is very important.",
        "dari": ""
      }
    ]
  },
  {
    "id": "kind-neighbour",
    "level": "basic",
    "titleEn": "The Kind Neighbour",
    "titleDari": "",
    "icon": "🏡",
    "color": "#f0fff8",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "An old neighbour lived alone next door. Every afternoon, Bilal's mother sent him a bowl of soup.",
        "dari": ""
      },
      {
        "en": "One winter day, the neighbour's heater stopped working. Bilal and his father helped call a repairman.",
        "dari": ""
      },
      {
        "en": "The neighbour thanked them and said, A kind neighbour is like family.",
        "dari": ""
      }
    ]
  },
  {
    "id": "grandpa-stories",
    "level": "intermediate",
    "titleEn": "Grandpa's Stories",
    "titleDari": "",
    "icon": "👴",
    "color": "#f8f0ff",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Every Friday evening, the children sat around their grandfather. He told stories about villages, rivers, and long journeys.",
        "dari": ""
      },
      {
        "en": "His stories were not only for fun. Each story carried a lesson about patience, honesty, or courage.",
        "dari": ""
      },
      {
        "en": "The children wrote new words from the stories in their notebooks. In this way, family stories became language lessons.",
        "dari": ""
      }
    ]
  },
  {
    "id": "snowy-kabul",
    "level": "beginner",
    "titleEn": "A Snowy Day in Kabul",
    "titleDari": "",
    "icon": "❄️",
    "color": "#eefaff",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Snow covered the streets of Kabul. The roofs were white and the air was very cold.",
        "dari": ""
      },
      {
        "en": "Children made a small snowman in the yard. Their grandmother watched from the window and laughed.",
        "dari": ""
      },
      {
        "en": "After playing, everyone came inside for hot tea. The cold day became warm with family.",
        "dari": ""
      }
    ]
  },
  {
    "id": "small-business-story",
    "level": "advanced",
    "titleEn": "Starting a Small Business",
    "titleDari": "",
    "icon": "🛒",
    "color": "#f0fff2",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Rahim wanted to help his family, so he started selling fresh bread near his school. He wrote down every cost in a notebook.",
        "dari": ""
      },
      {
        "en": "At first he made mistakes. Sometimes he bought too much bread, and some pieces remained unsold.",
        "dari": ""
      },
      {
        "en": "After one month, he learned to listen to customers and buy the right amount. His small business became steady because he planned carefully.",
        "dari": ""
      }
    ]
  },
  {
    "id": "school-play",
    "level": "intermediate",
    "titleEn": "The School Play",
    "titleDari": "",
    "icon": "🎭",
    "color": "#fff0fa",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "The class prepared a play about kindness. Each student had a small role and one English line to say.",
        "dari": ""
      },
      {
        "en": "Mariam was nervous because she had to speak in front of parents. Her teacher helped her practise slowly.",
        "dari": ""
      },
      {
        "en": "On the day of the play, Mariam spoke clearly. Her parents clapped and she felt brave.",
        "dari": ""
      }
    ]
  },
  {
    "id": "museum-visit",
    "level": "intermediate",
    "titleEn": "Visiting a Museum",
    "titleDari": "",
    "icon": "🏛️",
    "color": "#f7f2e8",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "The students visited a museum to learn about history. They saw old coins, pottery, carpets, and photographs.",
        "dari": ""
      },
      {
        "en": "Their teacher asked them to choose one object and describe it in English. Sami chose an old carpet with red and blue patterns.",
        "dari": ""
      },
      {
        "en": "At the end, the students understood that history is not only in books. It is also in objects, places, and memories.",
        "dari": ""
      }
    ]
  },
  {
    "id": "first-day-work",
    "level": "intermediate",
    "titleEn": "First Day at Work",
    "titleDari": "",
    "icon": "💼",
    "color": "#eef1ff",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Naveed started his first job in a small grocery shop. He arrived early and greeted everyone politely.",
        "dari": ""
      },
      {
        "en": "The manager showed him how to arrange products and speak kindly to customers.",
        "dari": ""
      },
      {
        "en": "By the end of the day, Naveed was tired but proud. He had learned that good service begins with respect.",
        "dari": ""
      }
    ]
  },
  {
    "id": "clean-park",
    "level": "basic",
    "titleEn": "Cleaning the Park",
    "titleDari": "",
    "icon": "🌿",
    "color": "#edfff0",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "The children saw rubbish in the park. Their teacher gave them gloves and bags.",
        "dari": ""
      },
      {
        "en": "They collected bottles, papers, and plastic. Soon the park looked clean again.",
        "dari": ""
      },
      {
        "en": "People passing by thanked them. The children learned that a clean place is everyone's responsibility.",
        "dari": ""
      }
    ]
  }
];

const WORD_SETS = {
  "animals": {
    "en": "Animals",
    "dari": "",
    "icon": "🦁",
    "words": [
      {
        "id": "a1",
        "en": "lion",
        "dari": "",
        "ex_en": "The lion is the king of the jungle.",
        "ex_dari": ""
      },
      {
        "id": "a2",
        "en": "horse",
        "dari": "",
        "ex_en": "The horse runs fast.",
        "ex_dari": ""
      },
      {
        "id": "a3",
        "en": "bird",
        "dari": "",
        "ex_en": "The bird sings in the morning.",
        "ex_dari": ""
      },
      {
        "id": "a4",
        "en": "fish",
        "dari": "",
        "ex_en": "I like to watch fish swim.",
        "ex_dari": ""
      },
      {
        "id": "a5",
        "en": "cat",
        "dari": "",
        "ex_en": "The cat sleeps all day.",
        "ex_dari": ""
      },
      {
        "id": "a6",
        "en": "dog",
        "dari": "",
        "ex_en": "The dog is a loyal friend.",
        "ex_dari": ""
      },
      {
        "id": "a7",
        "en": "sheep",
        "dari": "",
        "ex_en": "The shepherd watches the sheep.",
        "ex_dari": ""
      },
      {
        "id": "a8",
        "en": "goat",
        "dari": "",
        "ex_en": "The goat climbs the hill.",
        "ex_dari": ""
      }
    ]
  },
  "food": {
    "en": "Food",
    "dari": "",
    "icon": "🍚",
    "words": [
      {
        "id": "f1",
        "en": "rice",
        "dari": "",
        "ex_en": "We eat rice every day.",
        "ex_dari": ""
      },
      {
        "id": "f2",
        "en": "bread",
        "dari": "",
        "ex_en": "Afghan bread is delicious.",
        "ex_dari": ""
      },
      {
        "id": "f3",
        "en": "pomegranate",
        "dari": "",
        "ex_en": "The pomegranate is sweet and red.",
        "ex_dari": ""
      },
      {
        "id": "f4",
        "en": "tea",
        "dari": "",
        "ex_en": "Afghans drink green tea.",
        "ex_dari": ""
      },
      {
        "id": "f5",
        "en": "lamb",
        "dari": "",
        "ex_en": "Lamb is used in many Afghan dishes.",
        "ex_dari": ""
      },
      {
        "id": "f6",
        "en": "potato",
        "dari": "",
        "ex_en": "We put potatoes in bolani.",
        "ex_dari": ""
      },
      {
        "id": "f7",
        "en": "yogurt",
        "dari": "",
        "ex_en": "Yogurt is served with mantu.",
        "ex_dari": ""
      },
      {
        "id": "f8",
        "en": "onion",
        "dari": "",
        "ex_en": "Please cut the onion.",
        "ex_dari": ""
      }
    ]
  },
  "family": {
    "en": "Family",
    "dari": "",
    "icon": "👨‍👩‍👧",
    "words": [
      {
        "id": "fam1",
        "en": "father",
        "dari": "",
        "ex_en": "My father works hard.",
        "ex_dari": ""
      },
      {
        "id": "fam2",
        "en": "mother",
        "dari": "",
        "ex_en": "My mother is kind.",
        "ex_dari": ""
      },
      {
        "id": "fam3",
        "en": "brother",
        "dari": "",
        "ex_en": "My brother plays football.",
        "ex_dari": ""
      },
      {
        "id": "fam4",
        "en": "sister",
        "dari": "",
        "ex_en": "My sister reads a book.",
        "ex_dari": ""
      },
      {
        "id": "fam5",
        "en": "grandmother",
        "dari": "",
        "ex_en": "My grandmother tells stories.",
        "ex_dari": ""
      },
      {
        "id": "fam6",
        "en": "grandfather",
        "dari": "",
        "ex_en": "My grandfather gives advice.",
        "ex_dari": ""
      },
      {
        "id": "fam7",
        "en": "uncle",
        "dari": "",
        "ex_en": "My uncle visited us today.",
        "ex_dari": ""
      },
      {
        "id": "fam8",
        "en": "aunt",
        "dari": "",
        "ex_en": "My aunt cooks well.",
        "ex_dari": ""
      }
    ]
  },
  "school": {
    "en": "School",
    "dari": "",
    "icon": "🏫",
    "words": [
      {
        "id": "sch1",
        "en": "book",
        "dari": "",
        "ex_en": "I read a book every night.",
        "ex_dari": ""
      },
      {
        "id": "sch2",
        "en": "teacher",
        "dari": "",
        "ex_en": "The teacher explains clearly.",
        "ex_dari": ""
      },
      {
        "id": "sch3",
        "en": "student",
        "dari": "",
        "ex_en": "The student asks a question.",
        "ex_dari": ""
      },
      {
        "id": "sch4",
        "en": "classroom",
        "dari": "",
        "ex_en": "Our classroom is clean.",
        "ex_dari": ""
      },
      {
        "id": "sch5",
        "en": "homework",
        "dari": "",
        "ex_en": "I finished my homework.",
        "ex_dari": ""
      },
      {
        "id": "sch6",
        "en": "lesson",
        "dari": "",
        "ex_en": "Today's lesson is easy.",
        "ex_dari": ""
      },
      {
        "id": "sch7",
        "en": "exam",
        "dari": "",
        "ex_en": "We have an exam tomorrow.",
        "ex_dari": ""
      },
      {
        "id": "sch8",
        "en": "notebook",
        "dari": "",
        "ex_en": "Write it in your notebook.",
        "ex_dari": ""
      }
    ]
  },
  "home": {
    "en": "Home",
    "dari": "",
    "icon": "🏡",
    "words": [
      {
        "id": "hom1",
        "en": "room",
        "dari": "",
        "ex_en": "My room is small.",
        "ex_dari": ""
      },
      {
        "id": "hom2",
        "en": "kitchen",
        "dari": "",
        "ex_en": "Mother is in the kitchen.",
        "ex_dari": ""
      },
      {
        "id": "hom3",
        "en": "door",
        "dari": "",
        "ex_en": "Please close the door.",
        "ex_dari": ""
      },
      {
        "id": "hom4",
        "en": "window",
        "dari": "",
        "ex_en": "Open the window.",
        "ex_dari": ""
      },
      {
        "id": "hom5",
        "en": "yard",
        "dari": "",
        "ex_en": "Children play in the yard.",
        "ex_dari": ""
      },
      {
        "id": "hom6",
        "en": "roof",
        "dari": "",
        "ex_en": "Snow is on the roof.",
        "ex_dari": ""
      },
      {
        "id": "hom7",
        "en": "chair",
        "dari": "",
        "ex_en": "Sit on this chair.",
        "ex_dari": ""
      },
      {
        "id": "hom8",
        "en": "table",
        "dari": "",
        "ex_en": "The book is on the table.",
        "ex_dari": ""
      }
    ]
  },
  "daily_actions": {
    "en": "Daily Actions",
    "dari": "",
    "icon": "🔁",
    "words": [
      {
        "id": "dai1",
        "en": "wake up",
        "dari": "",
        "ex_en": "I wake up early.",
        "ex_dari": ""
      },
      {
        "id": "dai2",
        "en": "wash",
        "dari": "",
        "ex_en": "Wash your hands.",
        "ex_dari": ""
      },
      {
        "id": "dai3",
        "en": "eat",
        "dari": "",
        "ex_en": "We eat breakfast.",
        "ex_dari": ""
      },
      {
        "id": "dai4",
        "en": "drink",
        "dari": "",
        "ex_en": "Drink clean water.",
        "ex_dari": ""
      },
      {
        "id": "dai5",
        "en": "go",
        "dari": "",
        "ex_en": "I go to school.",
        "ex_dari": ""
      },
      {
        "id": "dai6",
        "en": "come",
        "dari": "",
        "ex_en": "Please come here.",
        "ex_dari": ""
      },
      {
        "id": "dai7",
        "en": "read",
        "dari": "",
        "ex_en": "Read this sentence.",
        "ex_dari": ""
      },
      {
        "id": "dai8",
        "en": "write",
        "dari": "",
        "ex_en": "Write your name.",
        "ex_dari": ""
      }
    ]
  },
  "health_body": {
    "en": "Body and Health",
    "dari": "",
    "icon": "🩺",
    "words": [
      {
        "id": "hea1",
        "en": "head",
        "dari": "",
        "ex_en": "My head hurts.",
        "ex_dari": ""
      },
      {
        "id": "hea2",
        "en": "eye",
        "dari": "",
        "ex_en": "My eye is red.",
        "ex_dari": ""
      },
      {
        "id": "hea3",
        "en": "hand",
        "dari": "",
        "ex_en": "Wash your hands.",
        "ex_dari": ""
      },
      {
        "id": "hea4",
        "en": "foot",
        "dari": "",
        "ex_en": "My foot hurts.",
        "ex_dari": ""
      },
      {
        "id": "hea5",
        "en": "fever",
        "dari": "",
        "ex_en": "I have a fever.",
        "ex_dari": ""
      },
      {
        "id": "hea6",
        "en": "cough",
        "dari": "",
        "ex_en": "The cough is strong.",
        "ex_dari": ""
      },
      {
        "id": "hea7",
        "en": "medicine",
        "dari": "",
        "ex_en": "Take the medicine after food.",
        "ex_dari": ""
      },
      {
        "id": "hea8",
        "en": "doctor",
        "dari": "",
        "ex_en": "The doctor is kind.",
        "ex_dari": ""
      }
    ]
  },
  "clothes": {
    "en": "Clothes",
    "dari": "",
    "icon": "👕",
    "words": [
      {
        "id": "clo1",
        "en": "shirt",
        "dari": "",
        "ex_en": "This shirt is clean.",
        "ex_dari": ""
      },
      {
        "id": "clo2",
        "en": "trousers",
        "dari": "",
        "ex_en": "My trousers are black.",
        "ex_dari": ""
      },
      {
        "id": "clo3",
        "en": "shoes",
        "dari": "",
        "ex_en": "These shoes are comfortable.",
        "ex_dari": ""
      },
      {
        "id": "clo4",
        "en": "jacket",
        "dari": "",
        "ex_en": "Wear your jacket.",
        "ex_dari": ""
      },
      {
        "id": "clo5",
        "en": "scarf",
        "dari": "",
        "ex_en": "The scarf is warm.",
        "ex_dari": ""
      },
      {
        "id": "clo6",
        "en": "hat",
        "dari": "",
        "ex_en": "He wears a hat.",
        "ex_dari": ""
      },
      {
        "id": "clo7",
        "en": "dress",
        "dari": "",
        "ex_en": "The dress is blue.",
        "ex_dari": ""
      },
      {
        "id": "clo8",
        "en": "uniform",
        "dari": "",
        "ex_en": "Students wear uniforms.",
        "ex_dari": ""
      }
    ]
  },
  "transport": {
    "en": "Transport",
    "dari": "",
    "icon": "🚌",
    "words": [
      {
        "id": "tra1",
        "en": "bus",
        "dari": "",
        "ex_en": "The bus is full.",
        "ex_dari": ""
      },
      {
        "id": "tra2",
        "en": "taxi",
        "dari": "",
        "ex_en": "Call a taxi.",
        "ex_dari": ""
      },
      {
        "id": "tra3",
        "en": "car",
        "dari": "",
        "ex_en": "The car is new.",
        "ex_dari": ""
      },
      {
        "id": "tra4",
        "en": "bicycle",
        "dari": "",
        "ex_en": "She rides a bicycle.",
        "ex_dari": ""
      },
      {
        "id": "tra5",
        "en": "airport",
        "dari": "",
        "ex_en": "The airport is busy.",
        "ex_dari": ""
      },
      {
        "id": "tra6",
        "en": "ticket",
        "dari": "",
        "ex_en": "I bought a ticket.",
        "ex_dari": ""
      },
      {
        "id": "tra7",
        "en": "station",
        "dari": "",
        "ex_en": "Wait at the station.",
        "ex_dari": ""
      },
      {
        "id": "tra8",
        "en": "road",
        "dari": "",
        "ex_en": "The road is long.",
        "ex_dari": ""
      }
    ]
  },
  "weather": {
    "en": "Weather",
    "dari": "",
    "icon": "☁️",
    "words": [
      {
        "id": "wea1",
        "en": "sunny",
        "dari": "",
        "ex_en": "Today is sunny.",
        "ex_dari": ""
      },
      {
        "id": "wea2",
        "en": "cloudy",
        "dari": "",
        "ex_en": "The sky is cloudy.",
        "ex_dari": ""
      },
      {
        "id": "wea3",
        "en": "rain",
        "dari": "",
        "ex_en": "Rain is falling.",
        "ex_dari": ""
      },
      {
        "id": "wea4",
        "en": "snow",
        "dari": "",
        "ex_en": "Snow covers the street.",
        "ex_dari": ""
      },
      {
        "id": "wea5",
        "en": "wind",
        "dari": "",
        "ex_en": "The wind is strong.",
        "ex_dari": ""
      },
      {
        "id": "wea6",
        "en": "cold",
        "dari": "",
        "ex_en": "The room is cold.",
        "ex_dari": ""
      },
      {
        "id": "wea7",
        "en": "hot",
        "dari": "",
        "ex_en": "The tea is hot.",
        "ex_dari": ""
      },
      {
        "id": "wea8",
        "en": "storm",
        "dari": "",
        "ex_en": "A storm is coming.",
        "ex_dari": ""
      }
    ]
  },
  "emotions": {
    "en": "Emotions",
    "dari": "",
    "icon": "😊",
    "words": [
      {
        "id": "emo1",
        "en": "happy",
        "dari": "",
        "ex_en": "I am happy today.",
        "ex_dari": ""
      },
      {
        "id": "emo2",
        "en": "sad",
        "dari": "",
        "ex_en": "She feels sad.",
        "ex_dari": ""
      },
      {
        "id": "emo3",
        "en": "angry",
        "dari": "",
        "ex_en": "Do not speak when angry.",
        "ex_dari": ""
      },
      {
        "id": "emo4",
        "en": "afraid",
        "dari": "",
        "ex_en": "The child is afraid.",
        "ex_dari": ""
      },
      {
        "id": "emo5",
        "en": "proud",
        "dari": "",
        "ex_en": "I am proud of you.",
        "ex_dari": ""
      },
      {
        "id": "emo6",
        "en": "tired",
        "dari": "",
        "ex_en": "I am very tired.",
        "ex_dari": ""
      },
      {
        "id": "emo7",
        "en": "calm",
        "dari": "",
        "ex_en": "Stay calm.",
        "ex_dari": ""
      },
      {
        "id": "emo8",
        "en": "excited",
        "dari": "",
        "ex_en": "The children are excited.",
        "ex_dari": ""
      }
    ]
  },
  "polite_phrases": {
    "en": "Polite Phrases",
    "dari": "",
    "icon": "🤝",
    "words": [
      {
        "id": "pol1",
        "en": "please",
        "dari": "",
        "ex_en": "Please sit here.",
        "ex_dari": ""
      },
      {
        "id": "pol2",
        "en": "thank you",
        "dari": "",
        "ex_en": "Thank you for your help.",
        "ex_dari": ""
      },
      {
        "id": "pol3",
        "en": "sorry",
        "dari": "",
        "ex_en": "Sorry, I am late.",
        "ex_dari": ""
      },
      {
        "id": "pol4",
        "en": "excuse me",
        "dari": "",
        "ex_en": "Excuse me, where is the bank?",
        "ex_dari": ""
      },
      {
        "id": "pol5",
        "en": "you are welcome",
        "dari": "",
        "ex_en": "You are welcome, my friend.",
        "ex_dari": ""
      },
      {
        "id": "pol6",
        "en": "may I",
        "dari": "",
        "ex_en": "May I ask a question?",
        "ex_dari": ""
      },
      {
        "id": "pol7",
        "en": "of course",
        "dari": "",
        "ex_en": "Of course, I can help.",
        "ex_dari": ""
      },
      {
        "id": "pol8",
        "en": "no problem",
        "dari": "",
        "ex_en": "No problem, try again.",
        "ex_dari": ""
      }
    ]
  },
  "places": {
    "en": "Places",
    "dari": "",
    "icon": "📍",
    "words": [
      {
        "id": "pla1",
        "en": "market",
        "dari": "",
        "ex_en": "The market is busy.",
        "ex_dari": ""
      },
      {
        "id": "pla2",
        "en": "mosque",
        "dari": "",
        "ex_en": "The mosque is near our house.",
        "ex_dari": ""
      },
      {
        "id": "pla3",
        "en": "school",
        "dari": "",
        "ex_en": "The school is open.",
        "ex_dari": ""
      },
      {
        "id": "pla4",
        "en": "hospital",
        "dari": "",
        "ex_en": "The hospital is far.",
        "ex_dari": ""
      },
      {
        "id": "pla5",
        "en": "library",
        "dari": "",
        "ex_en": "The library is quiet.",
        "ex_dari": ""
      },
      {
        "id": "pla6",
        "en": "park",
        "dari": "",
        "ex_en": "Children play in the park.",
        "ex_dari": ""
      },
      {
        "id": "pla7",
        "en": "bank",
        "dari": "",
        "ex_en": "I went to the bank.",
        "ex_dari": ""
      },
      {
        "id": "pla8",
        "en": "pharmacy",
        "dari": "",
        "ex_en": "The pharmacy is open.",
        "ex_dari": ""
      }
    ]
  },
  "time_days": {
    "en": "Time and Days",
    "dari": "",
    "icon": "⏰",
    "words": [
      {
        "id": "tim1",
        "en": "today",
        "dari": "",
        "ex_en": "Today is Monday.",
        "ex_dari": ""
      },
      {
        "id": "tim2",
        "en": "tomorrow",
        "dari": "",
        "ex_en": "Tomorrow we have class.",
        "ex_dari": ""
      },
      {
        "id": "tim3",
        "en": "yesterday",
        "dari": "",
        "ex_en": "Yesterday I was sick.",
        "ex_dari": ""
      },
      {
        "id": "tim4",
        "en": "morning",
        "dari": "",
        "ex_en": "I study in the morning.",
        "ex_dari": ""
      },
      {
        "id": "tim5",
        "en": "evening",
        "dari": "",
        "ex_en": "We visit family in the evening.",
        "ex_dari": ""
      },
      {
        "id": "tim6",
        "en": "week",
        "dari": "",
        "ex_en": "This week is busy.",
        "ex_dari": ""
      },
      {
        "id": "tim7",
        "en": "month",
        "dari": "",
        "ex_en": "Next month we travel.",
        "ex_dari": ""
      },
      {
        "id": "tim8",
        "en": "year",
        "dari": "",
        "ex_en": "A year has twelve months.",
        "ex_dari": ""
      }
    ]
  },
  "numbers_extended": {
    "en": "Numbers Extended",
    "dari": "",
    "icon": "🔢",
    "words": [
      {
        "id": "num1",
        "en": "eleven",
        "dari": "",
        "ex_en": "There are eleven students.",
        "ex_dari": ""
      },
      {
        "id": "num2",
        "en": "twelve",
        "dari": "",
        "ex_en": "I am twelve years old.",
        "ex_dari": ""
      },
      {
        "id": "num3",
        "en": "twenty",
        "dari": "",
        "ex_en": "Twenty people came.",
        "ex_dari": ""
      },
      {
        "id": "num4",
        "en": "thirty",
        "dari": "",
        "ex_en": "The class starts at thirty minutes past eight.",
        "ex_dari": ""
      },
      {
        "id": "num5",
        "en": "fifty",
        "dari": "",
        "ex_en": "The book has fifty pages.",
        "ex_dari": ""
      },
      {
        "id": "num6",
        "en": "hundred",
        "dari": "",
        "ex_en": "A hundred families live here.",
        "ex_dari": ""
      },
      {
        "id": "num7",
        "en": "thousand",
        "dari": "",
        "ex_en": "The village has one thousand people.",
        "ex_dari": ""
      },
      {
        "id": "num8",
        "en": "first",
        "dari": "",
        "ex_en": "This is my first lesson.",
        "ex_dari": ""
      }
    ]
  },
  "internet_tech": {
    "en": "Internet and Tech",
    "dari": "",
    "icon": "💻",
    "words": [
      {
        "id": "int1",
        "en": "phone",
        "dari": "",
        "ex_en": "My phone is charging.",
        "ex_dari": ""
      },
      {
        "id": "int2",
        "en": "internet",
        "dari": "",
        "ex_en": "The internet is slow.",
        "ex_dari": ""
      },
      {
        "id": "int3",
        "en": "message",
        "dari": "",
        "ex_en": "Send me a message.",
        "ex_dari": ""
      },
      {
        "id": "int4",
        "en": "password",
        "dari": "",
        "ex_en": "Keep your password safe.",
        "ex_dari": ""
      },
      {
        "id": "int5",
        "en": "screen",
        "dari": "",
        "ex_en": "The screen is bright.",
        "ex_dari": ""
      },
      {
        "id": "int6",
        "en": "keyboard",
        "dari": "",
        "ex_en": "Use the keyboard.",
        "ex_dari": ""
      },
      {
        "id": "int7",
        "en": "download",
        "dari": "",
        "ex_en": "Download the file.",
        "ex_dari": ""
      },
      {
        "id": "int8",
        "en": "online",
        "dari": "",
        "ex_en": "The class is online.",
        "ex_dari": ""
      }
    ]
  },
  "business": {
    "en": "Business",
    "dari": "",
    "icon": "🧾",
    "words": [
      {
        "id": "bus1",
        "en": "customer",
        "dari": "",
        "ex_en": "The customer is waiting.",
        "ex_dari": ""
      },
      {
        "id": "bus2",
        "en": "price",
        "dari": "",
        "ex_en": "The price is fair.",
        "ex_dari": ""
      },
      {
        "id": "bus3",
        "en": "profit",
        "dari": "",
        "ex_en": "The shop made a small profit.",
        "ex_dari": ""
      },
      {
        "id": "bus4",
        "en": "cost",
        "dari": "",
        "ex_en": "Write every cost.",
        "ex_dari": ""
      },
      {
        "id": "bus5",
        "en": "order",
        "dari": "",
        "ex_en": "The order is ready.",
        "ex_dari": ""
      },
      {
        "id": "bus6",
        "en": "delivery",
        "dari": "",
        "ex_en": "Delivery is fast.",
        "ex_dari": ""
      },
      {
        "id": "bus7",
        "en": "quality",
        "dari": "",
        "ex_en": "Quality is important.",
        "ex_dari": ""
      },
      {
        "id": "bus8",
        "en": "trust",
        "dari": "",
        "ex_en": "Trust brings customers back.",
        "ex_dari": ""
      }
    ]
  },
  "culture_words": {
    "en": "Culture Words",
    "dari": "",
    "icon": "🌟",
    "words": [
      {
        "id": "cul1",
        "en": "hospitality",
        "dari": "",
        "ex_en": "Hospitality is important.",
        "ex_dari": ""
      },
      {
        "id": "cul2",
        "en": "elder",
        "dari": "",
        "ex_en": "Respect elders.",
        "ex_dari": ""
      },
      {
        "id": "cul3",
        "en": "tradition",
        "dari": "",
        "ex_en": "Tradition connects families.",
        "ex_dari": ""
      },
      {
        "id": "cul4",
        "en": "poetry",
        "dari": "",
        "ex_en": "Poetry is loved in Afghanistan.",
        "ex_dari": ""
      },
      {
        "id": "cul5",
        "en": "wedding",
        "dari": "",
        "ex_en": "The wedding was joyful.",
        "ex_dari": ""
      },
      {
        "id": "cul6",
        "en": "Eid",
        "dari": "",
        "ex_en": "Eid is a happy day.",
        "ex_dari": ""
      },
      {
        "id": "cul7",
        "en": "Nowruz",
        "dari": "",
        "ex_en": "Nowruz brings spring.",
        "ex_dari": ""
      },
      {
        "id": "cul8",
        "en": "heritage",
        "dari": "",
        "ex_en": "Protect your heritage.",
        "ex_dari": ""
      }
    ]
  },
  "nature": {
    "en": "Nature",
    "dari": "",
    "icon": "🌄",
    "words": [
      {
        "id": "nat1",
        "en": "mountain",
        "dari": "",
        "ex_en": "The mountain is high.",
        "ex_dari": ""
      },
      {
        "id": "nat2",
        "en": "river",
        "dari": "",
        "ex_en": "The river is clean.",
        "ex_dari": ""
      },
      {
        "id": "nat3",
        "en": "tree",
        "dari": "",
        "ex_en": "The tree gives shade.",
        "ex_dari": ""
      },
      {
        "id": "nat4",
        "en": "flower",
        "dari": "",
        "ex_en": "The flower smells nice.",
        "ex_dari": ""
      },
      {
        "id": "nat5",
        "en": "field",
        "dari": "",
        "ex_en": "Farmers work in the field.",
        "ex_dari": ""
      },
      {
        "id": "nat6",
        "en": "sky",
        "dari": "",
        "ex_en": "The sky is blue.",
        "ex_dari": ""
      },
      {
        "id": "nat7",
        "en": "sun",
        "dari": "",
        "ex_en": "The sun is warm.",
        "ex_dari": ""
      },
      {
        "id": "nat8",
        "en": "moon",
        "dari": "",
        "ex_en": "The moon is bright.",
        "ex_dari": ""
      }
    ]
  },
  "grammar_basic": {
    "en": "Grammar Words",
    "dari": "",
    "icon": "🧠",
    "words": [
      {
        "id": "gra1",
        "en": "noun",
        "dari": "",
        "ex_en": "A noun names a person or thing.",
        "ex_dari": ""
      },
      {
        "id": "gra2",
        "en": "verb",
        "dari": "",
        "ex_en": "A verb shows an action.",
        "ex_dari": ""
      },
      {
        "id": "gra3",
        "en": "adjective",
        "dari": "",
        "ex_en": "An adjective describes a noun.",
        "ex_dari": ""
      },
      {
        "id": "gra4",
        "en": "sentence",
        "dari": "",
        "ex_en": "Write a full sentence.",
        "ex_dari": ""
      },
      {
        "id": "gra5",
        "en": "question",
        "dari": "",
        "ex_en": "Ask a clear question.",
        "ex_dari": ""
      },
      {
        "id": "gra6",
        "en": "answer",
        "dari": "",
        "ex_en": "Give a short answer.",
        "ex_dari": ""
      },
      {
        "id": "gra7",
        "en": "past",
        "dari": "",
        "ex_en": "This sentence is in the past.",
        "ex_dari": ""
      },
      {
        "id": "gra8",
        "en": "future",
        "dari": "",
        "ex_en": "Talk about the future.",
        "ex_dari": ""
      }
    ]
  },
  "ielts_academic": {
    "en": "IELTS and Academic",
    "dari": "",
    "icon": "🎓",
    "words": [
      {
        "id": "iel1",
        "en": "opinion",
        "dari": "",
        "ex_en": "Give your opinion clearly.",
        "ex_dari": ""
      },
      {
        "id": "iel2",
        "en": "example",
        "dari": "",
        "ex_en": "Give one example.",
        "ex_dari": ""
      },
      {
        "id": "iel3",
        "en": "reason",
        "dari": "",
        "ex_en": "Explain your reason.",
        "ex_dari": ""
      },
      {
        "id": "iel4",
        "en": "compare",
        "dari": "",
        "ex_en": "Compare the two ideas.",
        "ex_dari": ""
      },
      {
        "id": "iel5",
        "en": "advantage",
        "dari": "",
        "ex_en": "One advantage is flexibility.",
        "ex_dari": ""
      },
      {
        "id": "iel6",
        "en": "disadvantage",
        "dari": "",
        "ex_en": "One disadvantage is distraction.",
        "ex_dari": ""
      },
      {
        "id": "iel7",
        "en": "conclusion",
        "dari": "",
        "ex_en": "End with a conclusion.",
        "ex_dari": ""
      },
      {
        "id": "iel8",
        "en": "evidence",
        "dari": "",
        "ex_en": "Use evidence in your answer.",
        "ex_dari": ""
      }
    ]
  },
  "islamic_terms": {
    "en": "Islamic Terms",
    "dari": "",
    "icon": "☪️",
    "words": [
      {
        "id": "isl1",
        "en": "Bismillah",
        "dari": "",
        "ex_en": "We say Bismillah before eating.",
        "ex_dari": ""
      },
      {
        "id": "isl2",
        "en": "Alhamdulillah",
        "dari": "",
        "ex_en": "Alhamdulillah, we are thankful.",
        "ex_dari": ""
      },
      {
        "id": "isl3",
        "en": "Inshallah",
        "dari": "",
        "ex_en": "We will meet tomorrow, Inshallah.",
        "ex_dari": ""
      },
      {
        "id": "isl4",
        "en": "Ramadan",
        "dari": "",
        "ex_en": "Muslims fast during Ramadan.",
        "ex_dari": ""
      },
      {
        "id": "isl5",
        "en": "prayer",
        "dari": "",
        "ex_en": "Prayer teaches discipline.",
        "ex_dari": ""
      },
      {
        "id": "isl6",
        "en": "dua",
        "dari": "",
        "ex_en": "Make dua for your family.",
        "ex_dari": ""
      },
      {
        "id": "isl7",
        "en": "mosque",
        "dari": "",
        "ex_en": "We went to the mosque.",
        "ex_dari": ""
      },
      {
        "id": "isl8",
        "en": "charity",
        "dari": "",
        "ex_en": "Charity helps people.",
        "ex_dari": ""
      }
    ]
  },
  "common_mistakes": {
    "en": "Common Mistake Words",
    "dari": "",
    "icon": "⚠️",
    "words": [
      {
        "id": "com1",
        "en": "borrow",
        "dari": "",
        "ex_en": "I borrow a book from the library.",
        "ex_dari": ""
      },
      {
        "id": "com2",
        "en": "lend",
        "dari": "",
        "ex_en": "Please lend me your pen.",
        "ex_dari": ""
      },
      {
        "id": "com3",
        "en": "learn",
        "dari": "",
        "ex_en": "I learn English.",
        "ex_dari": ""
      },
      {
        "id": "com4",
        "en": "teach",
        "dari": "",
        "ex_en": "My teacher teaches English.",
        "ex_dari": ""
      },
      {
        "id": "com5",
        "en": "bring",
        "dari": "",
        "ex_en": "Bring your notebook.",
        "ex_dari": ""
      },
      {
        "id": "com6",
        "en": "take",
        "dari": "",
        "ex_en": "Take this bag home.",
        "ex_dari": ""
      },
      {
        "id": "com7",
        "en": "listen",
        "dari": "",
        "ex_en": "Listen to the teacher.",
        "ex_dari": ""
      },
      {
        "id": "com8",
        "en": "hear",
        "dari": "",
        "ex_en": "I can hear you.",
        "ex_dari": ""
      }
    ]
  }
};

const WORD_OF_DAY = [
  {
    "en": "resilience",
    "dari": "",
    "pos": "noun",
    "ex_en": "The Afghan people have great resilience.",
    "ex_dari": ""
  },
  {
    "en": "hospitality",
    "dari": "",
    "pos": "noun",
    "ex_en": "Hospitality is very important in Afghan culture.",
    "ex_dari": ""
  },
  {
    "en": "heritage",
    "dari": "",
    "pos": "noun",
    "ex_en": "We must protect our cultural heritage.",
    "ex_dari": ""
  },
  {
    "en": "perseverance",
    "dari": "",
    "pos": "noun",
    "ex_en": "With perseverance, you can achieve anything.",
    "ex_dari": ""
  },
  {
    "en": "wisdom",
    "dari": "",
    "pos": "noun",
    "ex_en": "Seek wisdom from elders.",
    "ex_dari": ""
  },
  {
    "en": "community",
    "dari": "",
    "pos": "noun",
    "ex_en": "Our community supports each other.",
    "ex_dari": ""
  },
  {
    "en": "journey",
    "dari": "",
    "pos": "noun",
    "ex_en": "Life is a long journey.",
    "ex_dari": ""
  },
  {
    "en": "confidence",
    "dari": "",
    "pos": "noun",
    "ex_en": "Practice builds confidence.",
    "ex_dari": ""
  },
  {
    "en": "discipline",
    "dari": "",
    "pos": "noun",
    "ex_en": "Discipline helps students succeed.",
    "ex_dari": ""
  },
  {
    "en": "respect",
    "dari": "",
    "pos": "noun/verb",
    "ex_en": "Respect your parents and teachers.",
    "ex_dari": ""
  }
];

const LISTEN_SENTENCES = [
  {
    "en": "Good morning! How are you today?",
    "pashto": "سهار مو پخیر! نن څنګه یاست؟",
    "dari": "سهار مو پخیر! نن څنګه یاست؟"
  },
  {
    "en": "I am fine, thank you.",
    "pashto": "زه ښه یم، مننه.",
    "dari": "زه ښه یم، مننه."
  },
  {
    "en": "What is your name?",
    "pashto": "ستاسو نوم څه دی؟",
    "dari": "ستاسو نوم څه دی؟"
  },
  {
    "en": "My name is Ahmad.",
    "pashto": "زما نوم احمد دی.",
    "dari": "زما نوم احمد دی."
  },
  {
    "en": "Nice to meet you.",
    "pashto": "ستاسو په لیدو خوشحاله شوم.",
    "dari": "ستاسو په لیدو خوشحاله شوم."
  },
  {
    "en": "Where are you from?",
    "pashto": "تاسو د کوم ځای یاست؟",
    "dari": "تاسو د کوم ځای یاست؟"
  },
  {
    "en": "I am from Afghanistan.",
    "pashto": "زه د افغانستان یم.",
    "dari": "زه د افغانستان یم."
  },
  {
    "en": "I live with my family.",
    "pashto": "زه له خپلې کورنۍ سره ژوند کوم.",
    "dari": "زه له خپلې کورنۍ سره ژوند کوم."
  },
  {
    "en": "Please speak slowly.",
    "pashto": "مهرباني وکړئ ورو خبرې وکړئ.",
    "dari": "مهرباني وکړئ ورو خبرې وکړئ."
  },
  {
    "en": "I do not understand this word.",
    "pashto": "زه د دې کلمې معنا نه پوهېږم.",
    "dari": "زه د دې کلمې معنا نه پوهېږم."
  },
  {
    "en": "Can you repeat that, please?",
    "pashto": "مهرباني وکړئ، دا بیا تکرارولی شئ؟",
    "dari": "مهرباني وکړئ، دا بیا تکرارولی شئ؟"
  },
  {
    "en": "Thank you for your help.",
    "pashto": "ستاسو له مرستې څخه مننه.",
    "dari": "ستاسو له مرستې څخه مننه."
  },
  {
    "en": "You are welcome.",
    "pashto": "هیڅ خبره نه ده.",
    "dari": "هیڅ خبره نه ده."
  },
  {
    "en": "Excuse me, where is the school?",
    "pashto": "وبښئ، ښوونځی چېرته دی؟",
    "dari": "وبښئ، ښوونځی چېرته دی؟"
  },
  {
    "en": "The school is near the mosque.",
    "pashto": "ښوونځی جومات ته نږدې دی.",
    "dari": "ښوونځی جومات ته نږدې دی."
  },
  {
    "en": "I am learning English every day.",
    "pashto": "زه هره ورځ انګلیسي زده کوم.",
    "dari": "زه هره ورځ انګلیسي زده کوم."
  },
  {
    "en": "This sentence is easy.",
    "pashto": "دا جمله اسانه ده.",
    "dari": "دا جمله اسانه ده."
  },
  {
    "en": "This lesson is difficult.",
    "pashto": "دا درس ستونزمن دی.",
    "dari": "دا درس ستونزمن دی."
  },
  {
    "en": "I will try again.",
    "pashto": "زه به بیا هڅه وکړم.",
    "dari": "زه به بیا هڅه وکړم."
  },
  {
    "en": "Mistakes help me learn.",
    "pashto": "تېروتنې زما په زده کړه کې مرسته کوي.",
    "dari": "تېروتنې زما په زده کړه کې مرسته کوي."
  },
  {
    "en": "I wake up at six o'clock.",
    "pashto": "زه په شپږو بجو راپاڅېږم.",
    "dari": "زه په شپږو بجو راپاڅېږم."
  },
  {
    "en": "I wash my face in the morning.",
    "pashto": "زه سهار خپل مخ وینځم.",
    "dari": "زه سهار خپل مخ وینځم."
  },
  {
    "en": "I brush my teeth every day.",
    "pashto": "زه هره ورځ خپل غاښونه برش کوم.",
    "dari": "زه هره ورځ خپل غاښونه برش کوم."
  },
  {
    "en": "I eat bread and eggs for breakfast.",
    "pashto": "زه په سباناري کې ډوډۍ او هګۍ خورم.",
    "dari": "زه په سباناري کې ډوډۍ او هګۍ خورم."
  },
  {
    "en": "I drink tea with my family.",
    "pashto": "زه له خپلې کورنۍ سره چای څښم.",
    "dari": "زه له خپلې کورنۍ سره چای څښم."
  },
  {
    "en": "I go to school by bus.",
    "pashto": "زه په بس کې ښوونځي ته ځم.",
    "dari": "زه په بس کې ښوونځي ته ځم."
  },
  {
    "en": "I walk to the market.",
    "pashto": "زه بازار ته په پښو ځم.",
    "dari": "زه بازار ته په پښو ځم."
  },
  {
    "en": "I study after dinner.",
    "pashto": "زه له ماښامنۍ وروسته درس وایم.",
    "dari": "زه له ماښامنۍ وروسته درس وایم."
  },
  {
    "en": "I help my mother at home.",
    "pashto": "زه په کور کې له خپلې مور سره مرسته کوم.",
    "dari": "زه په کور کې له خپلې مور سره مرسته کوم."
  },
  {
    "en": "I clean my room on Friday.",
    "pashto": "زه د جمعې په ورځ خپله کوټه پاکوم.",
    "dari": "زه د جمعې په ورځ خپله کوټه پاکوم."
  },
  {
    "en": "My father works hard.",
    "pashto": "زما پلار سخت کار کوي.",
    "dari": "زما پلار سخت کار کوي."
  },
  {
    "en": "My mother is very kind.",
    "pashto": "زما مور ډېره مهربانه ده.",
    "dari": "زما مور ډېره مهربانه ده."
  },
  {
    "en": "My brother likes football.",
    "pashto": "زما ورور فوټبال خوښوي.",
    "dari": "زما ورور فوټبال خوښوي."
  },
  {
    "en": "My sister reads stories.",
    "pashto": "زما خور کیسې لولي.",
    "dari": "زما خور کیسې لولي."
  },
  {
    "en": "My grandmother tells good stories.",
    "pashto": "زما انا ښې کیسې کوي.",
    "dari": "زما انا ښې کیسې کوي."
  },
  {
    "en": "My grandfather gives useful advice.",
    "pashto": "زما نیکه ګټورې مشورې راکوي.",
    "dari": "زما نیکه ګټورې مشورې راکوي."
  },
  {
    "en": "We visit relatives on Eid.",
    "pashto": "موږ په اختر کې خپلوانو ته ورځو.",
    "dari": "موږ په اختر کې خپلوانو ته ورځو."
  },
  {
    "en": "Family is important to me.",
    "pashto": "کورنۍ زما لپاره مهمه ده.",
    "dari": "کورنۍ زما لپاره مهمه ده."
  },
  {
    "en": "We eat together at night.",
    "pashto": "موږ د شپې یو ځای ډوډۍ خورو.",
    "dari": "موږ د شپې یو ځای ډوډۍ خورو."
  },
  {
    "en": "We respect our elders.",
    "pashto": "موږ د خپلو مشرانو درناوی کوو.",
    "dari": "موږ د خپلو مشرانو درناوی کوو."
  },
  {
    "en": "Where is the nearest pharmacy?",
    "pashto": "تر ټولو نږدې درملتون چېرته دی؟",
    "dari": "تر ټولو نږدې درملتون چېرته دی؟"
  },
  {
    "en": "I need medicine for a headache.",
    "pashto": "د سر درد لپاره درملو ته اړتیا لرم.",
    "dari": "د سر درد لپاره درملو ته اړتیا لرم."
  },
  {
    "en": "I have a fever and cough.",
    "pashto": "زه تبه او ټوخی لرم.",
    "dari": "زه تبه او ټوخی لرم."
  },
  {
    "en": "Please call the doctor.",
    "pashto": "مهرباني وکړئ ډاکټر ته زنګ ووهئ.",
    "dari": "مهرباني وکړئ ډاکټر ته زنګ ووهئ."
  },
  {
    "en": "Take this medicine after food.",
    "pashto": "دا درمل له خوړو وروسته وخورئ.",
    "dari": "دا درمل له خوړو وروسته وخورئ."
  },
  {
    "en": "Drink clean water.",
    "pashto": "پاکې اوبه وڅښئ.",
    "dari": "پاکې اوبه وڅښئ."
  },
  {
    "en": "Wash your hands before eating.",
    "pashto": "له خوړو مخکې خپل لاسونه ومینځئ.",
    "dari": "له خوړو مخکې خپل لاسونه ومینځئ."
  },
  {
    "en": "I feel much better today.",
    "pashto": "نن ځان ډېر ښه احساسوم.",
    "dari": "نن ځان ډېر ښه احساسوم."
  },
  {
    "en": "The clinic is open in the morning.",
    "pashto": "کلینیک سهار پرانیستی وي.",
    "dari": "کلینیک سهار پرانیستی وي."
  },
  {
    "en": "We need an appointment.",
    "pashto": "موږ ملاقات ته اړتیا لرو.",
    "dari": "موږ ملاقات ته اړتیا لرو."
  },
  {
    "en": "How much is this bread?",
    "pashto": "دا ډوډۍ په څو ده؟",
    "dari": "دا ډوډۍ په څو ده؟"
  },
  {
    "en": "I need two kilos of rice.",
    "pashto": "زه دوه کیلو وریجې غواړم.",
    "dari": "زه دوه کیلو وریجې غواړم."
  },
  {
    "en": "Do you have fresh milk?",
    "pashto": "تاسو تازه شیدې لرئ؟",
    "dari": "تاسو تازه شیدې لرئ؟"
  },
  {
    "en": "This fruit is very sweet.",
    "pashto": "دا مېوه ډېره خوږه ده.",
    "dari": "دا مېوه ډېره خوږه ده."
  },
  {
    "en": "Please give me one bag.",
    "pashto": "مهرباني وکړئ، یوه کڅوړه راکړئ.",
    "dari": "مهرباني وکړئ، یوه کڅوړه راکړئ."
  },
  {
    "en": "I will pay by cash.",
    "pashto": "زه به نغدې پیسې ورکړم.",
    "dari": "زه به نغدې پیسې ورکړم."
  },
  {
    "en": "Can you make it cheaper?",
    "pashto": "کولی شئ دا لږ ارزانه کړئ؟",
    "dari": "کولی شئ دا لږ ارزانه کړئ؟"
  },
  {
    "en": "The price is fair.",
    "pashto": "بیه مناسبه ده.",
    "dari": "بیه مناسبه ده."
  },
  {
    "en": "I would like chicken and rice.",
    "pashto": "زه چرګ او وریجې غواړم.",
    "dari": "زه چرګ او وریجې غواړم."
  },
  {
    "en": "The food is delicious.",
    "pashto": "خواړه ډېر خوندور دي.",
    "dari": "خواړه ډېر خوندور دي."
  },
  {
    "en": "Is this seat free?",
    "pashto": "آیا دا څوکۍ خالي ده؟",
    "dari": "آیا دا څوکۍ خالي ده؟"
  },
  {
    "en": "Where should I get off?",
    "pashto": "زه چېرته ښکته شم؟",
    "dari": "زه چېرته ښکته شم؟"
  },
  {
    "en": "The bus stop is over there.",
    "pashto": "د بس تمځای هلته دی.",
    "dari": "د بس تمځای هلته دی."
  },
  {
    "en": "Please take me to the city centre.",
    "pashto": "مهرباني وکړئ، ما د ښار مرکز ته یوسئ.",
    "dari": "مهرباني وکړئ، ما د ښار مرکز ته یوسئ."
  },
  {
    "en": "How much is the taxi fare?",
    "pashto": "د ټکسي کرایه څو ده؟",
    "dari": "د ټکسي کرایه څو ده؟"
  },
  {
    "en": "I have one suitcase.",
    "pashto": "زه یو بکس لرم.",
    "dari": "زه یو بکس لرم."
  },
  {
    "en": "May I see your passport?",
    "pashto": "آیا زه ستاسو پاسپورټ لیدلی شم؟",
    "dari": "آیا زه ستاسو پاسپورټ لیدلی شم؟"
  },
  {
    "en": "My flight is delayed.",
    "pashto": "زما الوتنه ځنډېدلې ده.",
    "dari": "زما الوتنه ځنډېدلې ده."
  },
  {
    "en": "The airport is very busy.",
    "pashto": "هوايي ډګر ډېر بوخت دی.",
    "dari": "هوايي ډګر ډېر بوخت دی."
  },
  {
    "en": "I am travelling tomorrow morning.",
    "pashto": "زه سبا سهار سفر کوم.",
    "dari": "زه سبا سهار سفر کوم."
  },
  {
    "en": "Today is sunny.",
    "pashto": "نن هوا لمرینه ده.",
    "dari": "نن هوا لمرینه ده."
  },
  {
    "en": "The sky is cloudy.",
    "pashto": "اسمان ورېځ دی.",
    "dari": "اسمان ورېځ دی."
  },
  {
    "en": "It may rain this evening.",
    "pashto": "ښايي نن ماښام باران وشي.",
    "dari": "ښايي نن ماښام باران وشي."
  },
  {
    "en": "The wind is very strong.",
    "pashto": "باد ډېر تېز دی.",
    "dari": "باد ډېر تېز دی."
  },
  {
    "en": "It is cold outside.",
    "pashto": "بهر یخ دی.",
    "dari": "بهر یخ دی."
  },
  {
    "en": "Wear your jacket.",
    "pashto": "خپل جاکټ واغوندئ.",
    "dari": "خپل جاکټ واغوندئ."
  },
  {
    "en": "The snow is beautiful.",
    "pashto": "واوره ښکلې ده.",
    "dari": "واوره ښکلې ده."
  },
  {
    "en": "Spring is coming.",
    "pashto": "پسرلی راروان دی.",
    "dari": "پسرلی راروان دی."
  },
  {
    "en": "The weather changed quickly.",
    "pashto": "هوا ژر بدله شوه.",
    "dari": "هوا ژر بدله شوه."
  },
  {
    "en": "Take an umbrella with you.",
    "pashto": "چترۍ درسره واخلئ.",
    "dari": "چترۍ درسره واخلئ."
  },
  {
    "en": "I want to borrow this book.",
    "pashto": "زه غواړم دا کتاب په امانت واخلم.",
    "dari": "زه غواړم دا کتاب په امانت واخلم."
  },
  {
    "en": "The library is quiet.",
    "pashto": "کتابتون ارام دی.",
    "dari": "کتابتون ارام دی."
  },
  {
    "en": "Please return the book on time.",
    "pashto": "مهرباني وکړئ، کتاب پر وخت بېرته وسپارئ.",
    "dari": "مهرباني وکړئ، کتاب پر وخت بېرته وسپارئ."
  },
  {
    "en": "My teacher explains clearly.",
    "pashto": "زما ښوونکی په روښانه ډول تشریح کوي.",
    "dari": "زما ښوونکی په روښانه ډول تشریح کوي."
  },
  {
    "en": "I have homework tonight.",
    "pashto": "نن شپه کورنی کار لرم.",
    "dari": "نن شپه کورنی کار لرم."
  },
  {
    "en": "The exam is next week.",
    "pashto": "ازموینه راتلونکې اوونۍ ده.",
    "dari": "ازموینه راتلونکې اوونۍ ده."
  },
  {
    "en": "I need a blue pen.",
    "pashto": "زه یو آبي قلم ته اړتیا لرم.",
    "dari": "زه یو آبي قلم ته اړتیا لرم."
  },
  {
    "en": "Write your name at the top.",
    "pashto": "خپل نوم په سر کې ولیکئ.",
    "dari": "خپل نوم په سر کې ولیکئ."
  },
  {
    "en": "Read the paragraph aloud.",
    "pashto": "پاراګراف په لوړ غږ ولولئ.",
    "dari": "پاراګراف په لوړ غږ ولولئ."
  },
  {
    "en": "Ask a question if you need help.",
    "pashto": "که مرستې ته اړتیا لرئ، پوښتنه وکړئ.",
    "dari": "که مرستې ته اړتیا لرئ، پوښتنه وکړئ."
  },
  {
    "en": "I like playing cricket.",
    "pashto": "زه کرکټ لوبول خوښوم.",
    "dari": "زه کرکټ لوبول خوښوم."
  },
  {
    "en": "My friend plays football.",
    "pashto": "زما ملګری فوټبال کوي.",
    "dari": "زما ملګری فوټبال کوي."
  },
  {
    "en": "We will meet at the park.",
    "pashto": "موږ به په پارک کې سره ووینو.",
    "dari": "موږ به په پارک کې سره ووینو."
  },
  {
    "en": "Are you free this evening?",
    "pashto": "آیا نن ماښام وزګار یاست؟",
    "dari": "آیا نن ماښام وزګار یاست؟"
  },
  {
    "en": "Let us study together.",
    "pashto": "راځئ یو ځای درس ووایو.",
    "dari": "راځئ یو ځای درس ووایو."
  },
  {
    "en": "I am sorry I am late.",
    "pashto": "بخښنه غواړم، ناوخته شوم.",
    "dari": "بخښنه غواړم، ناوخته شوم."
  },
  {
    "en": "No problem, please come in.",
    "pashto": "هېڅ خبره نه ده، مهرباني وکړئ دننه راشئ.",
    "dari": "هېڅ خبره نه ده، مهرباني وکړئ دننه راشئ."
  },
  {
    "en": "Can you help me with this?",
    "pashto": "په دې کې راسره مرسته کولی شئ؟",
    "dari": "په دې کې راسره مرسته کولی شئ؟"
  },
  {
    "en": "I will call you tomorrow.",
    "pashto": "زه به سبا تاسو ته زنګ ووهم.",
    "dari": "زه به سبا تاسو ته زنګ ووهم."
  },
  {
    "en": "Send me a message.",
    "pashto": "ماته پیغام راولېږئ.",
    "dari": "ماته پیغام راولېږئ."
  },
  {
    "en": "I want to open a bank account.",
    "pashto": "زه غواړم بانکي حساب پرانیزم.",
    "dari": "زه غواړم بانکي حساب پرانیزم."
  },
  {
    "en": "Please sign this form.",
    "pashto": "مهرباني وکړئ دا فورمه لاسلیک کړئ.",
    "dari": "مهرباني وکړئ دا فورمه لاسلیک کړئ."
  },
  {
    "en": "Do you have your ID card?",
    "pashto": "ایا ستاسو د پېژندپاڼې کارت درسره شته؟",
    "dari": "ایا ستاسو د پېژندپاڼې کارت درسره شته؟"
  },
  {
    "en": "I am looking for a job.",
    "pashto": "زه د کار په لټه کې یم.",
    "dari": "زه د کار په لټه کې یم."
  },
  {
    "en": "I have three years of experience.",
    "pashto": "زه درې کاله تجربه لرم.",
    "dari": "زه درې کاله تجربه لرم."
  },
  {
    "en": "I can start next week.",
    "pashto": "زه راتلونکې اوونۍ کار پیلولی شم.",
    "dari": "زه راتلونکې اوونۍ کار پیلولی شم."
  },
  {
    "en": "The customer is waiting.",
    "pashto": "پېرودونکی انتظار کوي.",
    "dari": "پېرودونکی انتظار کوي."
  },
  {
    "en": "Good service builds trust.",
    "pashto": "ښه خدمت باور رامنځته کوي.",
    "dari": "ښه خدمت باور رامنځته کوي."
  },
  {
    "en": "Write down every cost.",
    "pashto": "هر لګښت ولیکئ.",
    "dari": "هر لګښت ولیکئ."
  },
  {
    "en": "Quality is very important.",
    "pashto": "کیفیت ډېر مهم دی.",
    "dari": "کیفیت ډېر مهم دی."
  },
  {
    "en": "Afghan hospitality is famous.",
    "pashto": "د افغانانو مېلمه پالنه مشهوره ده.",
    "dari": "د افغانانو مېلمه پالنه مشهوره ده."
  },
  {
    "en": "Guests are welcomed with tea.",
    "pashto": "مېلمانه په چای هرکلی کېږي.",
    "dari": "مېلمانه په چای هرکلی کېږي."
  },
  {
    "en": "Nowruz is a new beginning.",
    "pashto": "نوروز یو نوی پیل دی.",
    "dari": "نوروز یو نوی پیل دی."
  },
  {
    "en": "Eid Mubarak to your family.",
    "pashto": "ستاسو کورنۍ ته اختر مبارک.",
    "dari": "ستاسو کورنۍ ته اختر مبارک."
  },
  {
    "en": "We visit elders on Eid.",
    "pashto": "موږ په اختر کې د مشرانو پوښتنې ته ورځو.",
    "dari": "موږ په اختر کې د مشرانو پوښتنې ته ورځو."
  },
  {
    "en": "Poetry is loved in our culture.",
    "pashto": "زموږ په کلتور کې شعر ډېر خوښېږي.",
    "dari": "زموږ په کلتور کې شعر ډېر خوښېږي."
  },
  {
    "en": "History teaches us lessons.",
    "pashto": "تاریخ موږ ته درسونه راکوي.",
    "dari": "تاریخ موږ ته درسونه راکوي."
  },
  {
    "en": "The pomegranate tree is old.",
    "pashto": "د انارو ونه پخوانۍ ده.",
    "dari": "د انارو ونه پخوانۍ ده."
  },
  {
    "en": "Respect is part of good manners.",
    "pashto": "درناوی د ښو اخلاقو برخه ده.",
    "dari": "درناوی د ښو اخلاقو برخه ده."
  },
  {
    "en": "Kind words make people happy.",
    "pashto": "مهربانې خبرې خلک خوشحالوي.",
    "dari": "مهربانې خبرې خلک خوشحالوي."
  },
  {
    "en": "I think online learning is useful.",
    "pashto": "زما په اند آنلاین زده کړه ګټوره ده.",
    "dari": "زما په اند آنلاین زده کړه ګټوره ده."
  },
  {
    "en": "In my opinion, practice is important.",
    "pashto": "زما په نظر تمرین مهم دی.",
    "dari": "زما په نظر تمرین مهم دی."
  },
  {
    "en": "I agree with you.",
    "pashto": "زه له تاسو سره موافق یم.",
    "dari": "زه له تاسو سره موافق یم."
  },
  {
    "en": "I understand your point.",
    "pashto": "زه ستاسو خبره پوهېږم.",
    "dari": "زه ستاسو خبره پوهېږم."
  },
  {
    "en": "I see it differently.",
    "pashto": "زه دا خبره په بل ډول وینم.",
    "dari": "زه دا خبره په بل ډول وینم."
  },
  {
    "en": "One advantage is flexibility.",
    "pashto": "یوه ګټه یې انعطاف دی.",
    "dari": "یوه ګټه یې انعطاف دی."
  },
  {
    "en": "One disadvantage is distraction.",
    "pashto": "یوه نیمګړتیا یې د پام ګډوډېدل دي.",
    "dari": "یوه نیمګړتیا یې د پام ګډوډېدل دي."
  },
  {
    "en": "For example, students can study at home.",
    "pashto": "د بېلګې په توګه، زده کوونکي په کور کې زده کړه کولی شي.",
    "dari": "د بېلګې په توګه، زده کوونکي په کور کې زده کړه کولی شي."
  },
  {
    "en": "In conclusion, balance is important.",
    "pashto": "په پایله کې، توازن مهم دی.",
    "dari": "په پایله کې، توازن مهم دی."
  },
  {
    "en": "Please explain your reason.",
    "pashto": "مهرباني وکړئ خپل دلیل تشریح کړئ.",
    "dari": "مهرباني وکړئ خپل دلیل تشریح کړئ."
  },
  {
    "en": "Can you describe this photo?",
    "pashto": "ایا تاسو دا عکس تشریح کولی شئ؟",
    "dari": "ایا تاسو دا عکس تشریح کولی شئ؟"
  },
  {
    "en": "I can see a family in a park.",
    "pashto": "زه په پارک کې یوه کورنۍ وینم.",
    "dari": "زه په پارک کې یوه کورنۍ وینم."
  },
  {
    "en": "They are sitting under a tree.",
    "pashto": "هغوی د یوې ونې لاندې ناست دي.",
    "dari": "هغوی د یوې ونې لاندې ناست دي."
  },
  {
    "en": "The children look happy.",
    "pashto": "ماشومان خوشحاله ښکاري.",
    "dari": "ماشومان خوشحاله ښکاري."
  },
  {
    "en": "The weather looks warm.",
    "pashto": "هوا توده ښکاري.",
    "dari": "هوا توده ښکاري."
  },
  {
    "en": "This picture reminds me of home.",
    "pashto": "دا انځور ماته کور را یادوي.",
    "dari": "دا انځور ماته کور را یادوي."
  },
  {
    "en": "The main idea is clear.",
    "pashto": "اصلي مفکوره روښانه ده.",
    "dari": "اصلي مفکوره روښانه ده."
  },
  {
    "en": "Please speak for one minute.",
    "pashto": "مهرباني وکړئ د یوې دقیقې لپاره خبرې وکړئ.",
    "dari": "مهرباني وکړئ د یوې دقیقې لپاره خبرې وکړئ."
  },
  {
    "en": "Give one example from your life.",
    "pashto": "له خپل ژوند څخه یوه بېلګه ورکړئ.",
    "dari": "له خپل ژوند څخه یوه بېلګه ورکړئ."
  },
  {
    "en": "Finish your answer clearly.",
    "pashto": "خپل ځواب په روښانه ډول پای ته ورسوئ.",
    "dari": "خپل ځواب په روښانه ډول پای ته ورسوئ."
  },
  {
    "en": "I forgot my notebook.",
    "pashto": "ما خپله کتابچه هېره کړې ده.",
    "dari": "ما خپله کتابچه هېره کړې ده."
  },
  {
    "en": "Please bring it tomorrow.",
    "pashto": "مهرباني وکړئ سبا یې راوړئ.",
    "dari": "مهرباني وکړئ سبا یې راوړئ."
  },
  {
    "en": "I made a small mistake.",
    "pashto": "ما یوه کوچنۍ تېروتنه وکړه.",
    "dari": "ما یوه کوچنۍ تېروتنه وکړه."
  },
  {
    "en": "Thank you for telling me.",
    "pashto": "له دې چې راته مو وویل، مننه.",
    "dari": "له دې چې راته مو وویل، مننه."
  },
  {
    "en": "Do not worry, try again.",
    "pashto": "اندېښنه مه کوئ، بیا هڅه وکړئ.",
    "dari": "اندېښنه مه کوئ، بیا هڅه وکړئ."
  },
  {
    "en": "This is my first time.",
    "pashto": "دا زما لومړی ځل دی.",
    "dari": "دا زما لومړی ځل دی."
  },
  {
    "en": "I need more practice.",
    "pashto": "زه لا ډېر تمرین ته اړتیا لرم.",
    "dari": "زه لا ډېر تمرین ته اړتیا لرم."
  },
  {
    "en": "I feel more confident now.",
    "pashto": "اوس ځان ډېر باوري احساسوم.",
    "dari": "اوس ځان ډېر باوري احساسوم."
  },
  {
    "en": "I learned five new words today.",
    "pashto": "ما نن پنځه نوې کلمې زده کړې.",
    "dari": "ما نن پنځه نوې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will practise again.",
    "pashto": "سبا به بیا تمرین وکړم.",
    "dari": "سبا به بیا تمرین وکړم."
  },
  {
    "en": "Where is the nearest hospital?",
    "pashto": "تر ټولو نږدې روغتون چېرته دی؟",
    "dari": "تر ټولو نږدې روغتون چېرته دی؟"
  },
  {
    "en": "Please wait in the waiting room.",
    "pashto": "مهرباني وکړئ د انتظار په خونه کې انتظار وکړئ.",
    "dari": "مهرباني وکړئ د انتظار په خونه کې انتظار وکړئ."
  },
  {
    "en": "How long have you felt sick?",
    "pashto": "له کله راهیسې ځان ناروغ احساسوئ؟",
    "dari": "له کله راهیسې ځان ناروغ احساسوئ؟"
  },
  {
    "en": "Since yesterday morning.",
    "pashto": "له پرون سهار راهیسې.",
    "dari": "له پرون سهار راهیسې."
  },
  {
    "en": "Do you take any medicine?",
    "pashto": "ایا کوم درمل کاروئ؟",
    "dari": "ایا کوم درمل کاروئ؟"
  },
  {
    "en": "I need to check your temperature.",
    "pashto": "زه باید ستاسو د بدن تودوخه وګورم.",
    "dari": "زه باید ستاسو د بدن تودوخه وګورم."
  },
  {
    "en": "The result will be ready tomorrow.",
    "pashto": "پایله به سبا تیاره وي.",
    "dari": "پایله به سبا تیاره وي."
  },
  {
    "en": "Follow the doctor's advice.",
    "pashto": "د ډاکټر مشوره عملي کړئ.",
    "dari": "د ډاکټر مشوره عملي کړئ."
  },
  {
    "en": "Rest and drink water.",
    "pashto": "ارام وکړئ او اوبه وڅښئ.",
    "dari": "ارام وکړئ او اوبه وڅښئ."
  },
  {
    "en": "Call us if it gets worse.",
    "pashto": "که حالت خراب شي، موږ ته زنګ ووهئ.",
    "dari": "که حالت خراب شي، موږ ته زنګ ووهئ."
  },
  {
    "en": "This house is available next month.",
    "pashto": "دا کور راتلونکې میاشت شته.",
    "dari": "دا کور راتلونکې میاشت شته."
  },
  {
    "en": "How much is the rent?",
    "pashto": "کرایه یې څومره ده؟",
    "dari": "کرایه یې څومره ده؟"
  },
  {
    "en": "Are bills included?",
    "pashto": "ایا لګښتونه پکې شامل دي؟",
    "dari": "ایا لګښتونه پکې شامل دي؟"
  },
  {
    "en": "The rooms are clean and bright.",
    "pashto": "خونې پاکې او روښانه دي.",
    "dari": "خونې پاکې او روښانه دي."
  },
  {
    "en": "The kitchen is small but useful.",
    "pashto": "پخلنځی کوچنی دی، خو ګټور دی.",
    "dari": "پخلنځی کوچنی دی، خو ګټور دی."
  },
  {
    "en": "The market is close to the house.",
    "pashto": "بازار کور ته نږدې دی.",
    "dari": "بازار کور ته نږدې دی."
  },
  {
    "en": "We need a quiet neighbourhood.",
    "pashto": "موږ ارام ګاونډ ته اړتیا لرو.",
    "dari": "موږ ارام ګاونډ ته اړتیا لرو."
  },
  {
    "en": "The neighbours are friendly.",
    "pashto": "ګاونډیان دوستانه دي.",
    "dari": "ګاونډیان دوستانه دي."
  },
  {
    "en": "Please call before you visit.",
    "pashto": "مهرباني وکړئ له راتګ مخکې زنګ ووهئ.",
    "dari": "مهرباني وکړئ له راتګ مخکې زنګ ووهئ."
  },
  {
    "en": "We will decide tomorrow.",
    "pashto": "موږ به سبا پرېکړه وکړو.",
    "dari": "موږ به سبا پرېکړه وکړو."
  },
  {
    "en": "The internet is not working.",
    "pashto": "انټرنېټ کار نه کوي.",
    "dari": "انټرنېټ کار نه کوي."
  },
  {
    "en": "Restart the router, please.",
    "pashto": "مهرباني وکړئ روټر بیا چالان کړئ.",
    "dari": "مهرباني وکړئ روټر بیا چالان کړئ."
  },
  {
    "en": "The connection is slow.",
    "pashto": "اړیکه ورو ده.",
    "dari": "اړیکه ورو ده."
  },
  {
    "en": "I forgot my password.",
    "pashto": "ما خپل پټ نوم هېر کړی دی.",
    "dari": "ما خپل پټ نوم هېر کړی دی."
  },
  {
    "en": "Keep your password safe.",
    "pashto": "خپل پټ نوم خوندي وساتئ.",
    "dari": "خپل پټ نوم خوندي وساتئ."
  },
  {
    "en": "Please charge your phone.",
    "pashto": "مهرباني وکړئ خپل ټیلیفون چارج کړئ.",
    "dari": "مهرباني وکړئ خپل ټیلیفون چارج کړئ."
  },
  {
    "en": "The screen is too bright.",
    "pashto": "پرده ډېره روښانه ده.",
    "dari": "پرده ډېره روښانه ده."
  },
  {
    "en": "Open the learning app.",
    "pashto": "د زده کړې اپ پرانیزئ.",
    "dari": "د زده کړې اپ پرانیزئ."
  },
  {
    "en": "Download the lesson at home.",
    "pashto": "درس په کور کې ډاونلوډ کړئ.",
    "dari": "درس په کور کې ډاونلوډ کړئ."
  },
  {
    "en": "Do not share private information.",
    "pashto": "شخصي معلومات مه شریکوئ.",
    "dari": "شخصي معلومات مه شریکوئ."
  },
  {
    "en": "What do you want to become?",
    "pashto": "تاسو غواړئ څه جوړ شئ؟",
    "dari": "تاسو غواړئ څه جوړ شئ؟"
  },
  {
    "en": "I want to become a teacher.",
    "pashto": "زه غواړم ښوونکی شم.",
    "dari": "زه غواړم ښوونکی شم."
  },
  {
    "en": "I want to help children learn.",
    "pashto": "زه غواړم له ماشومانو سره په زده کړه کې مرسته وکړم.",
    "dari": "زه غواړم له ماشومانو سره په زده کړه کې مرسته وکړم."
  },
  {
    "en": "My goal is to speak clearly.",
    "pashto": "زما موخه دا ده چې روښانه خبرې وکړم.",
    "dari": "زما موخه دا ده چې روښانه خبرې وکړم."
  },
  {
    "en": "I will study hard this year.",
    "pashto": "زه به سږ کال ډېر زیار وباسم.",
    "dari": "زه به سږ کال ډېر زیار وباسم."
  },
  {
    "en": "I need a simple plan.",
    "pashto": "زه یو ساده پلان ته اړتیا لرم.",
    "dari": "زه یو ساده پلان ته اړتیا لرم."
  },
  {
    "en": "Start with small steps.",
    "pashto": "له کوچنیو ګامونو پیل وکړئ.",
    "dari": "له کوچنیو ګامونو پیل وکړئ."
  },
  {
    "en": "Keep your notebook with you.",
    "pashto": "خپله کتابچه له ځان سره وساتئ.",
    "dari": "خپله کتابچه له ځان سره وساتئ."
  },
  {
    "en": "Review old words every week.",
    "pashto": "زړې کلمې هره اونۍ بیا تکرار کړئ.",
    "dari": "زړې کلمې هره اونۍ بیا تکرار کړئ."
  },
  {
    "en": "Learning takes time and patience.",
    "pashto": "زده کړه وخت او صبر غواړي.",
    "dari": "زده کړه وخت او صبر غواړي."
  },
  {
    "en": "I practise English with my son.",
    "pashto": "زه له خپل زوی سره انګلیسي تمرینوم.",
    "dari": "زه له خپل زوی سره انګلیسي تمرینوم."
  },
  {
    "en": "My friend also uses this app.",
    "pashto": "زما ملګری هم دا اپ کاروي.",
    "dari": "زما ملګری هم دا اپ کاروي."
  },
  {
    "en": "We learn better when we practise together.",
    "pashto": "کله چې یو ځای تمرین کوو، ښه زده کړه کوو.",
    "dari": "کله چې یو ځای تمرین کوو، ښه زده کړه کوو."
  },
  {
    "en": "Please listen first and then repeat.",
    "pashto": "مهرباني وکړئ لومړی واورئ، بیا تکرار کړئ.",
    "dari": "مهرباني وکړئ لومړی واورئ، بیا تکرار کړئ."
  },
  {
    "en": "Speak clearly and slowly.",
    "pashto": "روښانه او ورو خبرې وکړئ.",
    "dari": "روښانه او ورو خبرې وکړئ."
  },
  {
    "en": "This story is about family and respect.",
    "pashto": "دا کیسه د کورنۍ او درناوي په اړه ده.",
    "dari": "دا کیسه د کورنۍ او درناوي په اړه ده."
  },
  {
    "en": "The new word is useful in daily life.",
    "pashto": "نوې کلمه په ورځني ژوند کې ګټوره ده.",
    "dari": "نوې کلمه په ورځني ژوند کې ګټوره ده."
  },
  {
    "en": "I will review this lesson tomorrow.",
    "pashto": "زه به دا درس سبا بیا تکرار کړم.",
    "dari": "زه به دا درس سبا بیا تکرار کړم."
  },
  {
    "en": "Do not be afraid of difficult words.",
    "pashto": "له سختو کلمو مه وېرېږئ.",
    "dari": "له سختو کلمو مه وېرېږئ."
  },
  {
    "en": "Small daily practice creates strong progress.",
    "pashto": "لږ ورځنی تمرین قوي پرمختګ رامنځته کوي.",
    "dari": "لږ ورځنی تمرین قوي پرمختګ رامنځته کوي."
  }
];

const SOUND_PAIRS = [
  { pair:'v / w', example_v:'vine, very, voice', example_w:'wine, very, well', tip:'Upper teeth touch lower lip for "v". Lips round for "w".', dari_tip:'' },
  { pair:'p / b', example_v:'pin, pat, park', example_w:'bin, bat, bark', tip:'"p" is voiceless (no vibration). "b" is voiced (feel vibration).', dari_tip:'' },
  { pair:'th (think) / t', example_v:'think, three, then', example_w:'tink, tree, den', tip:'Tongue tip touches back of upper teeth for "th".', dari_tip:'' },
  { pair:'short vowels', example_v:'cat / cut / cot', example_w:'A / U / O sounds', tip:'Short English vowels are very close — practice each carefully.', dari_tip:'' }
];

const PLACEMENT_QUESTIONS = [
  {
    "q": "What is the English word for کتاب?",
    "qd": "د «کتاب» انګلیسي کلیمه څه ده؟",
    "options": [
      "book",
      "pen",
      "school",
      "read"
    ],
    "correct": 0
  },
  {
    "q": "Choose the correct sentence:",
    "qd": "سمه جمله وټاکئ:",
    "options": [
      "She go to school.",
      "She goes to school.",
      "She going school.",
      "She goed to school."
    ],
    "correct": 1
  },
  {
    "q": "What does مېلمه پالنه mean?",
    "qd": "«مېلمه پالنه» په انګلیسي څه معنا لري؟",
    "options": [
      "friendship",
      "hospitality",
      "respect",
      "kindness"
    ],
    "correct": 1
  },
  {
    "q": "Complete: I have been studying English ___ two years.",
    "qd": "تش ځای ډک کړئ:",
    "options": [
      "since",
      "for",
      "from",
      "during"
    ],
    "correct": 1
  },
  {
    "q": "Which sentence is the most formal English?",
    "qd": "کومه انګلیسي جمله تر ټولو رسمي ده؟",
    "options": [
      "I gotta go.",
      "I have to go.",
      "I am required to leave.",
      "Going now."
    ],
    "correct": 2
  },
  {
    "q": "What is the opposite of cold?",
    "qd": "د «cold» مخالف څه دی؟",
    "options": [
      "hot",
      "small",
      "slow",
      "dark"
    ],
    "correct": 0
  },
  {
    "q": "Choose the polite request:",
    "qd": "ادبي غوښتنه وټاکئ:",
    "options": [
      "Give water.",
      "Water now.",
      "Could I have some water, please?",
      "I want water."
    ],
    "correct": 2
  },
  {
    "q": "What does دوا mean?",
    "qd": "«دوا» په انګلیسي څه معنا لري؟",
    "options": [
      "medicine",
      "market",
      "teacher",
      "family"
    ],
    "correct": 0
  },
  {
    "q": "Complete: Yesterday, I ___ to school.",
    "qd": "تش ځای ډک کړئ:",
    "options": [
      "go",
      "went",
      "goes",
      "going"
    ],
    "correct": 1
  },
  {
    "q": "Which sentence is future tense?",
    "qd": "کومه جمله د راتلونکي زمان ده؟",
    "options": [
      "I study.",
      "I studied.",
      "I will study.",
      "I am studying."
    ],
    "correct": 2
  },
  {
    "q": "What does کتابتون mean?",
    "qd": "«کتابتون» په انګلیسي څه دی؟",
    "options": [
      "library",
      "hospital",
      "airport",
      "bank"
    ],
    "correct": 0
  },
  {
    "q": "Choose the correct article: I saw ___ apple.",
    "qd": "سم article وټاکئ:",
    "options": [
      "a",
      "an",
      "thee",
      "no"
    ],
    "correct": 1
  },
  {
    "q": "What is a noun?",
    "qd": "noun څه شی دی؟",
    "options": [
      "an action",
      "a person, place, or thing",
      "a describing word",
      "a question"
    ],
    "correct": 1
  },
  {
    "q": "What does باور mean?",
    "qd": "«باور» په انګلیسي څه دی؟",
    "options": [
      "trust",
      "weather",
      "bread",
      "mistake"
    ],
    "correct": 0
  },
  {
    "q": "Choose the natural sentence:",
    "qd": "طبیعي جمله وټاکئ:",
    "options": [
      "I very like tea.",
      "I like tea very much.",
      "Tea I like much.",
      "I liking tea."
    ],
    "correct": 1
  },
  {
    "q": "Complete: She is interested ___ books.",
    "qd": "تش ځای ډک کړئ:",
    "options": [
      "on",
      "at",
      "in",
      "to"
    ],
    "correct": 2
  },
  {
    "q": "What is the English word for سرک?",
    "qd": "د «سرک» انګلیسي کلیمه څه ده؟",
    "options": [
      "road",
      "roof",
      "room",
      "river"
    ],
    "correct": 0
  },
  {
    "q": "Choose the correct question:",
    "qd": "سمه پوښتنه وټاکئ:",
    "options": [
      "Where you live?",
      "Where do you live?",
      "Where are live?",
      "Where living you?"
    ],
    "correct": 1
  },
  {
    "q": "What does بښنه mean?",
    "qd": "«بښنه» په انګلیسي څه ده؟",
    "options": [
      "apology",
      "advice",
      "arrival",
      "answer"
    ],
    "correct": 0
  },
  {
    "q": "Which phrase is best for an IELTS conclusion?",
    "qd": "د IELTS پایلې لپاره کومه جمله ښه ده؟",
    "options": [
      "So yeah.",
      "In conclusion, balance is important.",
      "I don't know.",
      "Finished."
    ],
    "correct": 1
  }
];

const MILESTONES = [
  {
    "id": "first-practice",
    "en": "First Practice!",
    "dari": "",
    "icon": "🌟"
  },
  {
    "id": "streak-5",
    "en": "5-Day Streak",
    "dari": "",
    "icon": "🔥"
  },
  {
    "id": "first-dari",
    "en": "First Pashto Support Reading",
    "dari": "",
    "icon": "📖"
  },
  {
    "id": "mastery-pass",
    "en": "Passed Mastery Test",
    "dari": "",
    "icon": "🏅"
  },
  {
    "id": "words-10",
    "en": "Learned 10 Words",
    "dari": "",
    "icon": "✨"
  },
  {
    "id": "streak-30",
    "en": "30-Day Streak",
    "dari": "",
    "icon": "🏆"
  }
];



// ============================================================
// ZIRAK APP — v1.4 Major Content Expansion
// Added by ChatGPT after v1.3 was accepted as the practice-engine base.
// Content-only expansion: app logic and practice engine are untouched.
// ============================================================

DIALOGUES.push(...[
  {
    "id": "airport-arrival-01",
    "level": "basic",
    "category": "travel",
    "titleEn": "Arriving at the Airport",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "May I see your passport, please?",
        "promptPashto": "مهرباني وکړئ خپل پاسپورټ راکړئ.",
        "promptDari": "مهرباني وکړئ خپل پاسپورټ راکړئ.",
        "answerEn": "Yes, here is my passport.",
        "answerPashto": "هو، دلته زما پاسپورټ دی.",
        "answerDari": "هو، دلته زما پاسپورټ دی.",
        "phonetic": "pass-port"
      },
      {
        "promptEn": "What is the purpose of your visit?",
        "promptPashto": "ستاسو د لیدنې موخه څه ده؟",
        "promptDari": "ستاسو د لیدنې موخه څه ده؟",
        "answerEn": "I am visiting my family.",
        "answerPashto": "زه خپلې کورنۍ سره لیدنه کوم.",
        "answerDari": "زه خپلې کورنۍ سره لیدنه کوم.",
        "phonetic": "khAA-ne-wAA-de"
      },
      {
        "promptEn": "How long will you stay?",
        "promptPashto": "تاسو به څومره وخت پاتې شئ؟",
        "promptDari": "تاسو به څومره وخت پاتې شئ؟",
        "answerEn": "I will stay for two weeks.",
        "answerPashto": "زه به دوه اونۍ پاتې شم.",
        "answerDari": "زه به دوه اونۍ پاتې شم.",
        "phonetic": "do haf-ta"
      }
    ]
  },
  {
    "id": "airport-baggage-02",
    "level": "basic",
    "category": "travel",
    "titleEn": "Baggage Problem",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Did your bag arrive?",
        "promptPashto": "ایا ستاسو بکس راورسید؟",
        "promptDari": "ایا ستاسو بکس راورسید؟",
        "answerEn": "No, my bag did not arrive.",
        "answerPashto": "نه، زما بکس رانه ورسید.",
        "answerDari": "نه، زما بکس رانه ورسید.",
        "phonetic": "baks na-ra-seed"
      },
      {
        "promptEn": "What color is your bag?",
        "promptPashto": "ستاسو بکس د کومې رنګ دی؟",
        "promptDari": "ستاسو بکس د کومې رنګ دی؟",
        "answerEn": "It is black with a red ribbon.",
        "answerPashto": "دا تور دی او سره پټۍ لري.",
        "answerDari": "دا تور دی او سره پټۍ لري.",
        "phonetic": "see-yAAh | sor-kh"
      },
      {
        "promptEn": "Please fill out this form.",
        "promptPashto": "مهرباني وکړئ دا فورم ډک کړئ.",
        "promptDari": "مهرباني وکړئ دا فورم ډک کړئ.",
        "answerEn": "Can you help me with this form?",
        "answerPashto": "ایا تاسو ماته د دې فورم کې مرسته کولی شئ؟",
        "answerDari": "ایا تاسو ماته د دې فورم کې مرسته کولی شئ؟",
        "phonetic": "foorm | ko-mak"
      }
    ]
  },
  {
    "id": "bus-card-03",
    "level": "basic",
    "category": "travel",
    "titleEn": "Using a Bus Card",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you have a bus card?",
        "promptPashto": "ایا تاسو د بس کارت لرئ؟",
        "promptDari": "ایا تاسو د بس کارت لرئ؟",
        "answerEn": "No, where can I buy one?",
        "answerPashto": "نه، چیرې یې اخیستلی شم؟",
        "answerDari": "نه، چیرې یې اخیستلی شم؟",
        "phonetic": "kaart bas"
      },
      {
        "promptEn": "You can buy it at the station.",
        "promptPashto": "تاسو یې د سټیشن کې اخیستلی شئ.",
        "promptDari": "تاسو یې د سټیشن کې اخیستلی شئ.",
        "answerEn": "How much money should I add?",
        "answerPashto": "زه باید پیسې ورزیاتوم؟",
        "answerDari": "زه باید پیسې ورزیاتوم؟",
        "phonetic": "pol ez-AA-fa"
      },
      {
        "promptEn": "Add ten dollars first.",
        "promptPashto": "لومړی لس ډالره ورزیاته کړئ.",
        "promptDari": "لومړی لس ډالره ورزیاته کړئ.",
        "answerEn": "Thank you, I understand.",
        "answerPashto": "مننه، زه پوهیږم.",
        "answerDari": "مننه، زه پوهیږم.",
        "phonetic": "fah-mee-dam"
      }
    ]
  },
  {
    "id": "taxi-route-04",
    "level": "beginner",
    "category": "travel",
    "titleEn": "Taking a Taxi",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Where would you like to go?",
        "promptPashto": "تاسو چیرې لاړ شئ؟",
        "promptDari": "تاسو چیرې لاړ شئ؟",
        "answerEn": "Please take me to the clinic.",
        "answerPashto": "مهرباني وکړئ ما کلینیک ته یوسئ.",
        "answerDari": "مهرباني وکړئ ما کلینیک ته یوسئ.",
        "phonetic": "klee-neek"
      },
      {
        "promptEn": "Do you know the address?",
        "promptPashto": "ایا تاسو پته پیژنئ؟",
        "promptDari": "ایا تاسو پته پیژنئ؟",
        "answerEn": "Yes, I have it on my phone.",
        "answerPashto": "هو، ما یې زما تلیفون کې ده.",
        "answerDari": "هو، ما یې زما تلیفون کې ده.",
        "phonetic": "te-le-fon"
      },
      {
        "promptEn": "It will take about fifteen minutes.",
        "promptPashto": "دا د شاوخوا پنځلس دقیقو وقت اخلي.",
        "promptDari": "دا د شاوخوا پنځلس دقیقو وقت اخلي.",
        "answerEn": "That is fine. Thank you.",
        "answerPashto": "سمه ده. مننه.",
        "answerDari": "سمه ده. مننه.",
        "phonetic": "paanz-da da-qee-qa"
      }
    ]
  },
  {
    "id": "school-office-05",
    "level": "beginner",
    "category": "school",
    "titleEn": "At the School Office",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "How can I help you?",
        "promptPashto": "زه تاسو سره د کومې مرستې کولی شم؟",
        "promptDari": "زه تاسو سره د کومې مرستې کولی شم؟",
        "answerEn": "I want to speak with my son's teacher.",
        "answerPashto": "غواړم د خپل زوی ښوونکي سره خبرې وکړم.",
        "answerDari": "غواړم د خپل زوی ښوونکي سره خبرې وکړم.",
        "phonetic": "mo-al-lem"
      },
      {
        "promptEn": "What is your son's name?",
        "promptPashto": "ستاسو د زوی نوم چا دی؟",
        "promptDari": "ستاسو د زوی نوم چا دی؟",
        "answerEn": "His name is Bilal Ahmad.",
        "answerPashto": "هغه نوم بلال احمد دی.",
        "answerDari": "هغه نوم بلال احمد دی.",
        "phonetic": "es-mash"
      },
      {
        "promptEn": "Please wait here for five minutes.",
        "promptPashto": "مهرباني وکړئ دلته پنځه دقیقې انتظار وکړئ.",
        "promptDari": "مهرباني وکړئ دلته پنځه دقیقې انتظار وکړئ.",
        "answerEn": "Of course, thank you.",
        "answerPashto": "البته، مننه.",
        "answerDari": "البته، مننه.",
        "phonetic": "mon-ta-zer"
      }
    ]
  },
  {
    "id": "parent-teacher-06",
    "level": "intermediate",
    "category": "school",
    "titleEn": "Parent Teacher Meeting",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Your daughter is doing well in class.",
        "promptPashto": "ستاسو لور ټولګي کې ښه کار کوي.",
        "promptDari": "ستاسو لور ټولګي کې ښه کار کوي.",
        "answerEn": "Thank you. Does she need help with reading?",
        "answerPashto": "مننه. ایا هغې د لوستلو کې مرستې ته اړتیا ده؟",
        "answerDari": "مننه. ایا هغې د لوستلو کې مرستې ته اړتیا ده؟",
        "phonetic": "khaan-dan"
      },
      {
        "promptEn": "She should read for fifteen minutes every day.",
        "promptPashto": "هغه باید هره ورځ پنځلس دقیقې لوستل وکړي.",
        "promptDari": "هغه باید هره ورځ پنځلس دقیقې لوستل وکړي.",
        "answerEn": "I will help her at home.",
        "answerPashto": "زه به ورسره کور کې مرسته وکړم.",
        "answerDari": "زه به ورسره کور کې مرسته وکړم.",
        "phonetic": "khaa-na"
      },
      {
        "promptEn": "Please contact me if you have concerns.",
        "promptPashto": "که چیرې تاسو اندیښنې لرئ نو ماسره اړیکه ونیسئ.",
        "promptDari": "که چیرې تاسو اندیښنې لرئ نو ماسره اړیکه ونیسئ.",
        "answerEn": "Thank you for your support.",
        "answerPashto": "د ملاتړ مننه.",
        "answerDari": "د ملاتړ مننه.",
        "phonetic": "he-maa-yat"
      }
    ]
  },
  {
    "id": "homework-help-07",
    "level": "basic",
    "category": "school",
    "titleEn": "Asking About Homework",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you have homework today?",
        "promptPashto": "ایا تاسو نن د کور دنده لرئ؟",
        "promptDari": "ایا تاسو نن د کور دنده لرئ؟",
        "answerEn": "Yes, I have English homework.",
        "answerPashto": "هو، ما د انګلیسي کور دنده ده.",
        "answerDari": "هو، ما د انګلیسي کور دنده ده.",
        "phonetic": "kaar khaa-na-gee"
      },
      {
        "promptEn": "What do you need to do?",
        "promptPashto": "تاسو باید کوم کار وکړئ؟",
        "promptDari": "تاسو باید کوم کار وکړئ؟",
        "answerEn": "I need to write five sentences.",
        "answerPashto": "ما باید پنځه جملې ولیکم.",
        "answerDari": "ما باید پنځه جملې ولیکم.",
        "phonetic": "jom-la"
      },
      {
        "promptEn": "Let's do it together.",
        "promptPashto": "راځئ یوځای یې وکړو.",
        "promptDari": "راځئ یوځای یې وکړو.",
        "answerEn": "Thank you for helping me.",
        "answerPashto": "د مرستې مننه.",
        "answerDari": "د مرستې مننه.",
        "phonetic": "ko-mak"
      }
    ]
  },
  {
    "id": "library-card-08",
    "level": "beginner",
    "category": "school",
    "titleEn": "Getting a Library Card",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you want a library card?",
        "promptPashto": "ایا تاسو د کتابتون کارت غواړئ؟",
        "promptDari": "ایا تاسو د کتابتون کارت غواړئ؟",
        "answerEn": "Yes, I want to borrow books.",
        "answerPashto": "هو، زه کتابونه پور اخیستل غواړم.",
        "answerDari": "هو، زه کتابونه پور اخیستل غواړم.",
        "phonetic": "ke-taab"
      },
      {
        "promptEn": "Do you have proof of address?",
        "promptPashto": "ایا تاسو د پته ثبوت لرئ؟",
        "promptDari": "ایا تاسو د پته ثبوت لرئ؟",
        "answerEn": "Yes, I have a utility bill.",
        "answerPashto": "هو، ما یوه د اوبو بیل لرم.",
        "answerDari": "هو، ما یوه د اوبو بیل لرم.",
        "phonetic": "barq"
      },
      {
        "promptEn": "You can borrow five books today.",
        "promptPashto": "تاسو نن پنځه کتابونه پور اخیستلی شئ.",
        "promptDari": "تاسو نن پنځه کتابونه پور اخیستلی شئ.",
        "answerEn": "That is very helpful.",
        "answerPashto": "دا ډیره مرستنده ده.",
        "answerDari": "دا ډیره مرستنده ده.",
        "phonetic": "qarz"
      }
    ]
  },
  {
    "id": "clinic-registration-09",
    "level": "beginner",
    "category": "health",
    "titleEn": "Registering at a Clinic",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Are you a new patient?",
        "promptPashto": "ایا تاسو نوی ناروغ یاست؟",
        "promptDari": "ایا تاسو نوی ناروغ یاست؟",
        "answerEn": "Yes, this is my first visit.",
        "answerPashto": "هو، دا زما لومړنۍ مراجعه ده.",
        "answerDari": "هو، دا زما لومړنۍ مراجعه ده.",
        "phonetic": "ma-raa-je-a"
      },
      {
        "promptEn": "Please write your name and date of birth.",
        "promptPashto": "مهرباني وکړئ خپل نوم او د زیږون نیټه ولیکئ.",
        "promptDari": "مهرباني وکړئ خپل نوم او د زیږون نیټه ولیکئ.",
        "answerEn": "Can I write it in English?",
        "answerPashto": "ایا زه انګلیسي کې لیکلی شم؟",
        "answerDari": "ایا زه انګلیسي کې لیکلی شم؟",
        "phonetic": "taareekh ta-wa-lod"
      },
      {
        "promptEn": "Yes, English is fine.",
        "promptPashto": "هو، انګلیسي سمه ده.",
        "promptDari": "هو، انګلیسي سمه ده.",
        "answerEn": "Thank you. I will fill it now.",
        "answerPashto": "مننه. زه به یې اوس ډکوم.",
        "answerDari": "مننه. زه به یې اوس ډکوم.",
        "phonetic": "khaa-na pa-ree"
      }
    ]
  },
  {
    "id": "pharmacy-10",
    "level": "beginner",
    "category": "health",
    "titleEn": "At the Pharmacy",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you have a prescription?",
        "promptPashto": "ایا تاسو د ډاکتر نسخه لرئ؟",
        "promptDari": "ایا تاسو د ډاکتر نسخه لرئ؟",
        "answerEn": "Yes, the doctor gave me this.",
        "answerPashto": "هو، ډاکتر ماته دا ورکړه.",
        "answerDari": "هو، ډاکتر ماته دا ورکړه.",
        "phonetic": "nos-kha"
      },
      {
        "promptEn": "Take one tablet twice a day.",
        "promptPashto": "هره ورځ دوه ځله یوه ګولۍ واخله.",
        "promptDari": "هره ورځ دوه ځله یوه ګولۍ واخله.",
        "answerEn": "Should I take it with food?",
        "answerPashto": "ایا زه باید د خواړو سره واخلم؟",
        "answerDari": "ایا زه باید د خواړو سره واخلم؟",
        "phonetic": "taa-blet"
      },
      {
        "promptEn": "Yes, take it after meals.",
        "promptPashto": "هو، د خواړو وروسته یې واخله.",
        "promptDari": "هو، د خواړو وروسته یې واخله.",
        "answerEn": "Thank you for explaining.",
        "answerPashto": "د تشریح مننه.",
        "answerDari": "د تشریح مننه.",
        "phonetic": "toz-eeh"
      }
    ]
  },
  {
    "id": "emergency-call-11",
    "level": "intermediate",
    "category": "health",
    "titleEn": "Emergency Phone Call",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What is your emergency?",
        "promptPashto": "ستاسو بیړي ستونزه څه ده؟",
        "promptDari": "ستاسو بیړي ستونزه څه ده؟",
        "answerEn": "My father has chest pain.",
        "answerPashto": "زما پلار سینه دردوي.",
        "answerDari": "زما پلار سینه دردوي.",
        "phonetic": "dard seena"
      },
      {
        "promptEn": "Is he breathing normally?",
        "promptPashto": "ایا هغه عادي سوچیدل کوي؟",
        "promptDari": "ایا هغه عادي سوچیدل کوي؟",
        "answerEn": "No, he is breathing with difficulty.",
        "answerPashto": "نه، هغه ستونزمن سوچیدل کوي.",
        "answerDari": "نه، هغه ستونزمن سوچیدل کوي.",
        "phonetic": "nafas"
      },
      {
        "promptEn": "An ambulance is on the way.",
        "promptPashto": "یوه امبولانس راروانه ده.",
        "promptDari": "یوه امبولانس راروانه ده.",
        "answerEn": "Please come quickly.",
        "answerPashto": "مهرباني وکړئ ژر راشئ.",
        "answerDari": "مهرباني وکړئ ژر راشئ.",
        "phonetic": "am-bo-laans"
      }
    ]
  },
  {
    "id": "bank-account-12",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Opening a Bank Account",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What type of account do you need?",
        "promptPashto": "تاسو د کوم ډول حساب ضرورت لرئ؟",
        "promptDari": "تاسو د کوم ډول حساب ضرورت لرئ؟",
        "answerEn": "I need a checking account.",
        "answerPashto": "ماته د چک حساب ضرور دی.",
        "answerDari": "ماته د چک حساب ضرور دی.",
        "phonetic": "he-saab"
      },
      {
        "promptEn": "Do you have identification?",
        "promptPashto": "ایا تاسو پیژندنه لرئ؟",
        "promptDari": "ایا تاسو پیژندنه لرئ؟",
        "answerEn": "Yes, I have my ID and address.",
        "answerPashto": "هو، زما هویت کارت او پته لرم.",
        "answerDari": "هو، زما هویت کارت او پته لرم.",
        "phonetic": "ho-vee-yat"
      },
      {
        "promptEn": "Your card will arrive in seven days.",
        "promptPashto": "ستاسو کارت به اوه ورځو کې راشي.",
        "promptDari": "ستاسو کارت به اوه ورځو کې راشي.",
        "answerEn": "Thank you for your help.",
        "answerPashto": "د مرستې مننه.",
        "answerDari": "د مرستې مننه.",
        "phonetic": "haft roz"
      }
    ]
  },
  {
    "id": "money-transfer-13",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Sending Money Home",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Where do you want to send money?",
        "promptPashto": "تاسو چیرې پیسې لیږل غواړئ؟",
        "promptDari": "تاسو چیرې پیسې لیږل غواړئ؟",
        "answerEn": "I want to send money to Afghanistan.",
        "answerPashto": "زه افغانستان ته پیسې لیږل غواړم.",
        "answerDari": "زه افغانستان ته پیسې لیږل غواړم.",
        "phonetic": "Af-ghan-es-taan"
      },
      {
        "promptEn": "How much do you want to send?",
        "promptPashto": "تاسو د کومې مقدار لیږل غواړئ؟",
        "promptDari": "تاسو د کومې مقدار لیږل غواړئ؟",
        "answerEn": "I want to send two hundred dollars.",
        "answerPashto": "زه دوه سوه ډالره لیږل غواړم.",
        "answerDari": "زه دوه سوه ډالره لیږل غواړم.",
        "phonetic": "do sad"
      },
      {
        "promptEn": "Please check the recipient name carefully.",
        "promptPashto": "مهرباني وکړئ د ترلاسه کوونکي نوم سم وګورئ.",
        "promptDari": "مهرباني وکړئ د ترلاسه کوونکي نوم سم وګورئ.",
        "answerEn": "Yes, the name is correct.",
        "answerPashto": "هو، نوم سم دی.",
        "answerDari": "هو، نوم سم دی.",
        "phonetic": "gee-ran-da"
      }
    ]
  },
  {
    "id": "rent-office-14",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Talking to the Landlord",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What is the problem in the apartment?",
        "promptPashto": "اپارتمان کې ستونزه کومه ده؟",
        "promptDari": "اپارتمان کې ستونزه کومه ده؟",
        "answerEn": "The heater is not working.",
        "answerPashto": "د تودولو وسیله کار نه کوي.",
        "answerDari": "د تودولو وسیله کار نه کوي.",
        "phonetic": "bo-khaa-ree"
      },
      {
        "promptEn": "When did it stop working?",
        "promptPashto": "هغه کله کار پریښود؟",
        "promptDari": "هغه کله کار پریښود؟",
        "answerEn": "It stopped working last night.",
        "answerPashto": "هغه تیره شپه کار پریښود.",
        "answerDari": "هغه تیره شپه کار پریښود.",
        "phonetic": "dee-shab"
      },
      {
        "promptEn": "I will send maintenance today.",
        "promptPashto": "زه نن تخنیکي کارمند لیږم.",
        "promptDari": "زه نن تخنیکي کارمند لیږم.",
        "answerEn": "Thank you, it is very cold.",
        "answerPashto": "مننه، ډیر سوچ دی.",
        "answerDari": "مننه، ډیر سوچ دی.",
        "phonetic": "sard"
      }
    ]
  },
  {
    "id": "grocery-budget-15",
    "level": "basic",
    "category": "food",
    "titleEn": "Shopping with a Budget",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you need help finding anything?",
        "promptPashto": "ایا تاسو د لټولو کې مرستې ته اړتیا لرئ؟",
        "promptDari": "ایا تاسو د لټولو کې مرستې ته اړتیا لرئ؟",
        "answerEn": "Yes, I need rice and oil.",
        "answerPashto": "هو، ماته وريژه او غوړي ضرور دي.",
        "answerDari": "هو، ماته وريژه او غوړي ضرور دي.",
        "phonetic": "be-renj | ro-ghan"
      },
      {
        "promptEn": "The rice is in aisle three.",
        "promptPashto": "وريژه د دریمې قطار کې ده.",
        "promptDari": "وريژه د دریمې قطار کې ده.",
        "answerEn": "Which oil is cheaper?",
        "answerPashto": "کوم غوړي ارزانه دی؟",
        "answerDari": "کوم غوړي ارزانه دی؟",
        "phonetic": "ar-zaan"
      },
      {
        "promptEn": "This one is on sale today.",
        "promptPashto": "دا یو نن پلور کې دی.",
        "promptDari": "دا یو نن پلور کې دی.",
        "answerEn": "Good, I will take it.",
        "answerPashto": "ښه، زه به یې واخلم.",
        "answerDari": "ښه، زه به یې واخلم.",
        "phonetic": "takh-feef"
      }
    ]
  },
  {
    "id": "restaurant-order-16",
    "level": "basic",
    "category": "food",
    "titleEn": "Ordering at a Restaurant",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Are you ready to order?",
        "promptPashto": "ایا تاسو د امر کولو لپاره چمتو یاست؟",
        "promptDari": "ایا تاسو د امر کولو لپاره چمتو یاست؟",
        "answerEn": "Yes, I would like chicken and rice.",
        "answerPashto": "هو، زه د چرګ او وريژو غوښتنه کوم.",
        "answerDari": "هو، زه د چرګ او وريژو غوښتنه کوم.",
        "phonetic": "morgh"
      },
      {
        "promptEn": "Would you like tea or water?",
        "promptPashto": "ایا تاسو چای یا اوبه غواړئ؟",
        "promptDari": "ایا تاسو چای یا اوبه غواړئ؟",
        "answerEn": "Water, please.",
        "answerPashto": "اوبه، مهرباني وکړئ.",
        "answerDari": "اوبه، مهرباني وکړئ.",
        "phonetic": "aab"
      },
      {
        "promptEn": "Anything else?",
        "promptPashto": "نور کوم شی؟",
        "promptDari": "نور کوم شی؟",
        "answerEn": "No, thank you. That is all.",
        "answerPashto": "نه، مننه. دومره بس دی.",
        "answerDari": "نه، مننه. دومره بس دی.",
        "phonetic": "hameen ast"
      }
    ]
  },
  {
    "id": "cooking-bolani-17",
    "level": "beginner",
    "category": "food",
    "titleEn": "Cooking Bolani",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What are you cooking today?",
        "promptPashto": "تاسو نن د کومې خواړه پخوئ؟",
        "promptDari": "تاسو نن د کومې خواړه پخوئ؟",
        "answerEn": "I am cooking bolani with potatoes.",
        "answerPashto": "زه د کچالو بولاني پخوم.",
        "answerDari": "زه د کچالو بولاني پخوم.",
        "phonetic": "bo-laa-nee | ka-cha-loo"
      },
      {
        "promptEn": "Do you need onions?",
        "promptPashto": "ایا تاسو پیازونو ته اړتیا لرئ؟",
        "promptDari": "ایا تاسو پیازونو ته اړتیا لرئ؟",
        "answerEn": "Yes, onions make it tasty.",
        "answerPashto": "هو، پیاز یې خوندور کوي.",
        "answerDari": "هو، پیاز یې خوندور کوي.",
        "phonetic": "pe-yaaz"
      },
      {
        "promptEn": "Can I help you?",
        "promptPashto": "ایا زه مرسته کولی شم؟",
        "promptDari": "ایا زه مرسته کولی شم؟",
        "answerEn": "Yes, please cut the vegetables.",
        "answerPashto": "هو، مهرباني وکړئ سبزي پرې کړئ.",
        "answerDari": "هو، مهرباني وکړئ سبزي پرې کړئ.",
        "phonetic": "sab-zee"
      }
    ]
  },
  {
    "id": "eid-visit-18",
    "level": "beginner",
    "category": "culture",
    "titleEn": "Eid Visit",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Eid Mubarak!",
        "promptPashto": "اختر مو مبارک!",
        "promptDari": "اختر مو مبارک!",
        "answerEn": "Eid Mubarak to you and your family.",
        "answerPashto": "اختر دې مبارک وي تاسو او ستاسو کورنۍ ته.",
        "answerDari": "اختر دې مبارک وي تاسو او ستاسو کورنۍ ته.",
        "phonetic": "Eid mo-baa-rak"
      },
      {
        "promptEn": "Please come inside for tea.",
        "promptPashto": "مهرباني وکړئ د چای لپاره دننه راشئ.",
        "promptDari": "مهرباني وکړئ د چای لپاره دننه راشئ.",
        "answerEn": "Thank you, I am happy to visit.",
        "answerPashto": "مننه، زه د لیدنې خوشحاله یم.",
        "answerDari": "مننه، زه د لیدنې خوشحاله یم.",
        "phonetic": "dee-daar"
      },
      {
        "promptEn": "May your year be full of blessings.",
        "promptPashto": "ستاسو کال مبارکیو ډک وي.",
        "promptDari": "ستاسو کال مبارکیو ډک وي.",
        "answerEn": "Ameen, thank you very much.",
        "answerPashto": "آمین، ستاسو ډیر مننه.",
        "answerDari": "آمین، ستاسو ډیر مننه.",
        "phonetic": "ba-ra-kat"
      }
    ]
  },
  {
    "id": "nowruz-family-19",
    "level": "intermediate",
    "category": "culture",
    "titleEn": "Nowruz with Family",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "How do you celebrate Nowruz?",
        "promptPashto": "تاسو د نوروز ورځ څنګه لمانځئ؟",
        "promptDari": "تاسو د نوروز ورځ څنګه لمانځئ؟",
        "answerEn": "We clean the house and visit relatives.",
        "answerPashto": "موږ کور پاکوو او خپلوانو ته ورځو.",
        "answerDari": "موږ کور پاکوو او خپلوانو ته ورځو.",
        "phonetic": "khwe-shaa-wand"
      },
      {
        "promptEn": "Do you prepare special food?",
        "promptPashto": "ایا تاسو ځانګړي خواړه چمتو کوئ؟",
        "promptDari": "ایا تاسو ځانګړي خواړه چمتو کوئ؟",
        "answerEn": "Yes, we prepare haft mewa and rice.",
        "answerPashto": "هو، موږ هفت میوه او وريژه چمتو کوو.",
        "answerDari": "هو، موږ هفت میوه او وريژه چمتو کوو.",
        "phonetic": "haft me-wa"
      },
      {
        "promptEn": "What does Nowruz mean to you?",
        "promptPashto": "نوروز ستاسو لپاره د کومو معنا ده؟",
        "promptDari": "نوروز ستاسو لپاره د کومو معنا ده؟",
        "answerEn": "It means hope and a new beginning.",
        "answerPashto": "دا د هیلو او نوي پیلامو معنا لري.",
        "answerDari": "دا د هیلو او نوي پیلامو معنا لري.",
        "phonetic": "o-meed"
      }
    ]
  },
  {
    "id": "mosque-friends-20",
    "level": "beginner",
    "category": "culture",
    "titleEn": "Making Friends at the Mosque",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Is this your first time here?",
        "promptPashto": "ایا دا ستاسو لومړنۍ ورتګ ده؟",
        "promptDari": "ایا دا ستاسو لومړنۍ ورتګ ده؟",
        "answerEn": "Yes, I am new in this area.",
        "answerPashto": "هو، زه دلته نوی یم.",
        "answerDari": "هو، زه دلته نوی یم.",
        "phonetic": "man-ta-qa"
      },
      {
        "promptEn": "Welcome. We have classes on weekends.",
        "promptPashto": "ښه راغلاست. موږ د اونۍ پای ته ټولګي لرو.",
        "promptDari": "ښه راغلاست. موږ د اونۍ پای ته ټولګي لرو.",
        "answerEn": "That sounds helpful.",
        "answerPashto": "دا ډیره ګټوره ده.",
        "answerDari": "دا ډیره ګټوره ده.",
        "phonetic": "sanf"
      },
      {
        "promptEn": "Would you like to join us for tea?",
        "promptPashto": "ایا تاسو د چای لپاره زمونږ سره یوځای شئ؟",
        "promptDari": "ایا تاسو د چای لپاره زمونږ سره یوځای شئ؟",
        "answerEn": "Yes, thank you for inviting me.",
        "answerPashto": "هو، د بلنې مننه.",
        "answerDari": "هو، د بلنې مننه.",
        "phonetic": "da-wat"
      }
    ]
  },
  {
    "id": "phone-business-21",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Calling a Business",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Good afternoon, how may I help you?",
        "promptPashto": "غرماء مو پخیر، زه تاسو سره د کومې مرستې کولی شم؟",
        "promptDari": "غرماء مو پخیر، زه تاسو سره د کومې مرستې کولی شم؟",
        "answerEn": "I am calling about my order.",
        "answerPashto": "زه د خپل امر پوښتنه لپاره زنګ وهم.",
        "answerDari": "زه د خپل امر پوښتنه لپاره زنګ وهم.",
        "phonetic": "far-maa-yesh"
      },
      {
        "promptEn": "Can you give me the order number?",
        "promptPashto": "ایا تاسو ماته د امر شمیره ورکولی شئ؟",
        "promptDari": "ایا تاسو ماته د امر شمیره ورکولی شئ؟",
        "answerEn": "Yes, it is 2451.",
        "answerPashto": "هو، دا 2451 ده.",
        "answerDari": "هو، دا 2451 ده.",
        "phonetic": "sho-maa-ra"
      },
      {
        "promptEn": "Your order will arrive tomorrow.",
        "promptPashto": "ستاسو امر سبا راورسیږي.",
        "promptDari": "ستاسو امر سبا راورسیږي.",
        "answerEn": "Thank you for checking.",
        "answerPashto": "د کتلو مننه.",
        "answerDari": "د کتلو مننه.",
        "phonetic": "far-daa"
      }
    ]
  },
  {
    "id": "complaint-polite-22",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Making a Polite Complaint",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "How can I help you today?",
        "promptPashto": "زه نن ستاسو سره د کومې مرستې کولی شم؟",
        "promptDari": "زه نن ستاسو سره د کومې مرستې کولی شم؟",
        "answerEn": "I am sorry, but there is a problem with my bill.",
        "answerPashto": "بخښنه غواړم، د زما بیل کې ستونزه شته.",
        "answerDari": "بخښنه غواړم، د زما بیل کې ستونزه شته.",
        "phonetic": "moa-ze-rat"
      },
      {
        "promptEn": "What seems to be wrong?",
        "promptPashto": "ستونزه کومه ده؟",
        "promptDari": "ستونزه کومه ده؟",
        "answerEn": "I was charged twice for the same service.",
        "answerPashto": "ما د یوه خدمت لپاره دوه ځله غوښتنه وشوه.",
        "answerDari": "ما د یوه خدمت لپاره دوه ځله غوښتنه وشوه.",
        "phonetic": "do baar"
      },
      {
        "promptEn": "I will review it and correct the mistake.",
        "promptPashto": "زه به یې وګورم او غلطي سمه کوم.",
        "promptDari": "زه به یې وګورم او غلطي سمه کوم.",
        "answerEn": "Thank you, I appreciate your help.",
        "answerPashto": "مننه، ستاسو د مرستې جوته شوم.",
        "answerDari": "مننه، ستاسو د مرستې جوته شوم.",
        "phonetic": "qa-dar-daa-nee"
      }
    ]
  },
  {
    "id": "weather-talk-23",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "Talking About Weather",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "It is very cold today.",
        "promptPashto": "نن ډیر سوچ دی.",
        "promptDari": "نن ډیر سوچ دی.",
        "answerEn": "Yes, I need a warmer jacket.",
        "answerPashto": "هو، ماته ګرم کوټ ته اړتیا ده.",
        "answerDari": "هو، ماته ګرم کوټ ته اړتیا ده.",
        "phonetic": "jaa-ket"
      },
      {
        "promptEn": "Will it snow tonight?",
        "promptPashto": "ایا شپه کې واوره اورسیږي؟",
        "promptDari": "ایا شپه کې واوره اورسیږي؟",
        "answerEn": "Maybe, the forecast says snow.",
        "answerPashto": "ممکن، هوا اخبار کې واوره وایي.",
        "answerDari": "ممکن، هوا اخبار کې واوره وایي.",
        "phonetic": "barf"
      },
      {
        "promptEn": "Drive carefully on the road.",
        "promptPashto": "د سړک پر مخ احتیاط وکړئ.",
        "promptDari": "د سړک پر مخ احتیاط وکړئ.",
        "answerEn": "I will, thank you.",
        "answerPashto": "زه به کوم، مننه.",
        "answerDari": "زه به کوم، مننه.",
        "phonetic": "eh-tee-yaat"
      }
    ]
  },
  {
    "id": "neighbour-intro-24",
    "level": "beginner",
    "category": "family",
    "titleEn": "Meeting a New Neighbor",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Hello, I live next door.",
        "promptPashto": "سلام، زه د راتلونکي دروازې اوسیدونکی یم.",
        "promptDari": "سلام، زه د راتلونکي دروازې اوسیدونکی یم.",
        "answerEn": "Nice to meet you. My name is Omar.",
        "answerPashto": "ستاسو سره د لیدنې خوشحالیږم. زما نوم عمر دی.",
        "answerDari": "ستاسو سره د لیدنې خوشحالیږم. زما نوم عمر دی.",
        "phonetic": "om-ar"
      },
      {
        "promptEn": "Welcome to the building.",
        "promptPashto": "ودانۍ ته ښه راغلاست.",
        "promptDari": "ودانۍ ته ښه راغلاست.",
        "answerEn": "Thank you. Everyone seems kind.",
        "answerPashto": "مننه. ټول خلک مهرباني ښکاري.",
        "answerDari": "مننه. ټول خلک مهرباني ښکاري.",
        "phonetic": "mehr-baan"
      },
      {
        "promptEn": "Let me know if you need anything.",
        "promptPashto": "که کومه اړتیا لرئ نو ماسره خبره وکړئ.",
        "promptDari": "که کومه اړتیا لرئ نو ماسره خبره وکړئ.",
        "answerEn": "That is very kind of you.",
        "answerPashto": "دا ډیره مهربانۍ ده.",
        "answerDari": "دا ډیره مهربانۍ ده.",
        "phonetic": "lotf"
      }
    ]
  },
  {
    "id": "child-sick-school-25",
    "level": "intermediate",
    "category": "school",
    "titleEn": "Calling School About a Sick Child",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "School office, how can I help?",
        "promptPashto": "ښوونځي دفتر، د کومې مرستې کولی شم؟",
        "promptDari": "ښوونځي دفتر، د کومې مرستې کولی شم؟",
        "answerEn": "My son is sick and cannot come today.",
        "answerPashto": "زما زوی ناروغ دی او نن نشي راتلی.",
        "answerDari": "زما زوی ناروغ دی او نن نشي راتلی.",
        "phonetic": "mareez"
      },
      {
        "promptEn": "What is his name and class?",
        "promptPashto": "هغه نوم او ټولګی کومه ده؟",
        "promptDari": "هغه نوم او ټولګی کومه ده؟",
        "answerEn": "His name is Haris, class two.",
        "answerPashto": "هغه نوم حارث دی، دویمه ټولګي.",
        "answerDari": "هغه نوم حارث دی، دویمه ټولګي.",
        "phonetic": "sanf do-wom"
      },
      {
        "promptEn": "Thank you for informing us.",
        "promptPashto": "د خبرولو مننه.",
        "promptDari": "د خبرولو مننه.",
        "answerEn": "Should I send a doctor's note tomorrow?",
        "answerPashto": "ایا زه باید سبا د ډاکتر یادداشت راوستل کوم؟",
        "answerDari": "ایا زه باید سبا د ډاکتر یادداشت راوستل کوم؟",
        "phonetic": "yaad-daasht"
      }
    ]
  },
  {
    "id": "post-office-26",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "At the Post Office",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Where do you want to send this package?",
        "promptPashto": "تاسو دا پاکټ چیرې لیږل غواړئ؟",
        "promptDari": "تاسو دا پاکټ چیرې لیږل غواړئ؟",
        "answerEn": "I want to send it to Canada.",
        "answerPashto": "غواړم یې کاناډا ته ولیږم.",
        "answerDari": "غواړم یې کاناډا ته ولیږم.",
        "phonetic": "kaa-naa-daa"
      },
      {
        "promptEn": "Do you want regular or express mail?",
        "promptPashto": "تاسو عادي یا ژر ډاکه غواړئ؟",
        "promptDari": "تاسو عادي یا ژر ډاکه غواړئ؟",
        "answerEn": "How much is express mail?",
        "answerPashto": "ژر ډاکه څومره ده؟",
        "answerDari": "ژر ډاکه څومره ده؟",
        "phonetic": "sa-ree"
      },
      {
        "promptEn": "It is twenty dollars.",
        "promptPashto": "دا شل ډالره دي.",
        "promptDari": "دا شل ډالره دي.",
        "answerEn": "I will choose regular mail.",
        "answerPashto": "زه به عادي ډاکه غوره کوم.",
        "answerDari": "زه به عادي ډاکه غوره کوم.",
        "phonetic": "aa-dee"
      }
    ]
  },
  {
    "id": "clothes-store-27",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "Shopping for Clothes",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What size do you need?",
        "promptPashto": "تاسو د کومې اندازې ضرورت لرئ؟",
        "promptDari": "تاسو د کومې اندازې ضرورت لرئ؟",
        "answerEn": "I need a medium shirt.",
        "answerPashto": "ماته د منځنۍ اندازې کمیس ضرور دی.",
        "answerDari": "ماته د منځنۍ اندازې کمیس ضرور دی.",
        "phonetic": "pe-raa-han"
      },
      {
        "promptEn": "Would you like to try it on?",
        "promptPashto": "ایا تاسو اغوستل غواړئ؟",
        "promptDari": "ایا تاسو اغوستل غواړئ؟",
        "answerEn": "Yes, where is the fitting room?",
        "answerPashto": "هو، د اغوستلو خونه چیرې ده؟",
        "answerDari": "هو، د اغوستلو خونه چیرې ده؟",
        "phonetic": "em-te-haan"
      },
      {
        "promptEn": "It is on your right.",
        "promptPashto": "ستاسو ښي لور ته ده.",
        "promptDari": "ستاسو ښي لور ته ده.",
        "answerEn": "Thank you, I will try it.",
        "answerPashto": "مننه، زه به یې اغوندم.",
        "answerDari": "مننه، زه به یې اغوندم.",
        "phonetic": "raast"
      }
    ]
  },
  {
    "id": "car-mechanic-28",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "At the Mechanic",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What problem does your car have?",
        "promptPashto": "ستاسو موټر کومه ستونزه لري؟",
        "promptDari": "ستاسو موټر کومه ستونزه لري؟",
        "answerEn": "It makes a strange noise when I brake.",
        "answerPashto": "کله چې زه بریک ورکوم نو بهرنی آواز راځي.",
        "answerDari": "کله چې زه بریک ورکوم نو بهرنی آواز راځي.",
        "phonetic": "birek"
      },
      {
        "promptEn": "When did the noise start?",
        "promptPashto": "آواز کله پیل شو؟",
        "promptDari": "آواز کله پیل شو؟",
        "answerEn": "It started yesterday evening.",
        "answerPashto": "دا پرون ماښام پیل شو.",
        "answerDari": "دا پرون ماښام پیل شو.",
        "phonetic": "sadaa"
      },
      {
        "promptEn": "We need to check the brakes.",
        "promptPashto": "موږ باید بریک وګورو.",
        "promptDari": "موږ باید بریک وګورو.",
        "answerEn": "Please tell me the cost before repair.",
        "answerPashto": "مهرباني وکړئ د ترمیم نه مخکې نرخ راکړئ.",
        "answerDari": "مهرباني وکړئ د ترمیم نه مخکې نرخ راکړئ.",
        "phonetic": "tar-meem"
      }
    ]
  },
  {
    "id": "work-safety-29",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Workplace Safety",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you have safety gloves?",
        "promptPashto": "ایا تاسو د خوندیتوب لاسکیشونه لرئ؟",
        "promptDari": "ایا تاسو د خوندیتوب لاسکیشونه لرئ؟",
        "answerEn": "Yes, I wear them every day.",
        "answerPashto": "هو، زه یې هره ورځ اغوندم.",
        "answerDari": "هو، زه یې هره ورځ اغوندم.",
        "phonetic": "dast-kash"
      },
      {
        "promptEn": "Please report any injury immediately.",
        "promptPashto": "مهرباني وکړئ هره ټپ سمدلاسه راپور کړئ.",
        "promptDari": "مهرباني وکړئ هره ټپ سمدلاسه راپور کړئ.",
        "answerEn": "I understand. Safety is important.",
        "answerPashto": "پوهیږم. خوندیتوب مهم دی.",
        "answerDari": "پوهیږم. خوندیتوب مهم دی.",
        "phonetic": "ma-soo-ni-yat"
      },
      {
        "promptEn": "Do not lift heavy boxes alone.",
        "promptPashto": "یوازې درنه بکسونه مه پورته کوئ.",
        "promptDari": "یوازې درنه بکسونه مه پورته کوئ.",
        "answerEn": "I will ask for help.",
        "answerPashto": "زه به د مرستې غوښتنه وکړم.",
        "answerDari": "زه به د مرستې غوښتنه وکړم.",
        "phonetic": "sang-een"
      }
    ]
  },
  {
    "id": "child-doctor-30",
    "level": "intermediate",
    "category": "health",
    "titleEn": "Child Doctor Visit",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What is your child's main problem?",
        "promptPashto": "ستاسو ماشوم اصلي ستونزه کومه ده؟",
        "promptDari": "ستاسو ماشوم اصلي ستونزه کومه ده؟",
        "answerEn": "She has a cough and fever.",
        "answerPashto": "هغې ټوخی او تبه ده.",
        "answerDari": "هغې ټوخی او تبه ده.",
        "phonetic": "sor-fa"
      },
      {
        "promptEn": "Is she eating and drinking?",
        "promptPashto": "ایا هغه خوراک او چای کوي؟",
        "promptDari": "ایا هغه خوراک او چای کوي؟",
        "answerEn": "She drinks water but eats very little.",
        "answerPashto": "هغه اوبه پیوي خو ډیر لږ خوراک کوي.",
        "answerDari": "هغه اوبه پیوي خو ډیر لږ خوراک کوي.",
        "phonetic": "kam"
      },
      {
        "promptEn": "Bring her back if the fever continues.",
        "promptPashto": "که تبه دوام وکړي نو بیا یې راوړئ.",
        "promptDari": "که تبه دوام وکړي نو بیا یې راوړئ.",
        "answerEn": "Thank you, doctor.",
        "answerPashto": "مننه، ډاکتر صاحب.",
        "answerDari": "مننه، ډاکتر صاحب.",
        "phonetic": "edaama"
      }
    ]
  },
  {
    "id": "university-application-31",
    "level": "advanced",
    "category": "school",
    "titleEn": "University Application",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Which program are you applying for?",
        "promptPashto": "تاسو د کوم پروګرام لپاره غوښتنلیک ورکوئ؟",
        "promptDari": "تاسو د کوم پروګرام لپاره غوښتنلیک ورکوئ؟",
        "answerEn": "I am applying for business administration.",
        "answerPashto": "زه د سوداګرۍ ادارې لپاره غوښتنلیک ورکوم.",
        "answerDari": "زه د سوداګرۍ ادارې لپاره غوښتنلیک ورکوم.",
        "phonetic": "te-jaa-rat"
      },
      {
        "promptEn": "Do you have your transcripts?",
        "promptPashto": "ایا تاسو خپل نمرنامې لرئ؟",
        "promptDari": "ایا تاسو خپل نمرنامې لرئ؟",
        "answerEn": "Yes, I uploaded them online.",
        "answerPashto": "هو، ما یې انلاین پورته کړل.",
        "answerDari": "هو، ما یې انلاین پورته کړل.",
        "phonetic": "namaraat"
      },
      {
        "promptEn": "You also need a personal statement.",
        "promptPashto": "تاسو یوه شخصي بیان ته هم اړتیا لرئ.",
        "promptDari": "تاسو یوه شخصي بیان ته هم اړتیا لرئ.",
        "answerEn": "I will prepare it this week.",
        "answerPashto": "زه به یې دا اونۍ چمتو کوم.",
        "answerDari": "زه به یې دا اونۍ چمتو کوم.",
        "phonetic": "ba-yaa-ni-ya"
      }
    ]
  },
  {
    "id": "ielts-part1-32",
    "level": "ielts",
    "category": "school",
    "titleEn": "IELTS Speaking Part One",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you work or study?",
        "promptPashto": "ایا تاسو کار کوئ یا زده کوئ؟",
        "promptDari": "ایا تاسو کار کوئ یا زده کوئ؟",
        "answerEn": "I work full time and study English in the evening.",
        "answerPashto": "زه بشپړ وخت کار کوم او ماښام انګلیسي زده کوم.",
        "answerDari": "زه بشپړ وخت کار کوم او ماښام انګلیسي زده کوم.",
        "phonetic": "full time"
      },
      {
        "promptEn": "What do you like about your hometown?",
        "promptPashto": "تاسو د خپل ښار کومه خبره خوښوئ؟",
        "promptDari": "تاسو د خپل ښار کومه خبره خوښوئ؟",
        "answerEn": "I like the people, the food, and the mountains.",
        "answerPashto": "زه خلک، خواړه او غرونه خوښوم.",
        "answerDari": "زه خلک، خواړه او غرونه خوښوم.",
        "phonetic": "mountains"
      },
      {
        "promptEn": "How often do you use the internet?",
        "promptPashto": "تاسو د انټرنیټ کارونو ډیر استعمال کوئ؟",
        "promptDari": "تاسو د انټرنیټ کارونو ډیر استعمال کوئ؟",
        "answerEn": "I use it every day for study and communication.",
        "answerPashto": "زه یې هره ورځ د زده کړې او اړیکو لپاره کاروم.",
        "answerDari": "زه یې هره ورځ د زده کړې او اړیکو لپاره کاروم.",
        "phonetic": "communication"
      }
    ]
  },
  {
    "id": "ielts-part2-33",
    "level": "ielts",
    "category": "school",
    "titleEn": "IELTS Topic Card",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Describe a person who helped you.",
        "promptPashto": "یو هغه کس تشریح کړئ چا چې تاسو سره مرسته وکړه.",
        "promptDari": "یو هغه کس تشریح کړئ چا چې تاسو سره مرسته وکړه.",
        "answerEn": "I would like to describe my English teacher.",
        "answerPashto": "زه خپل د انګلیسي ښوونکی تشریح کول غواړم.",
        "answerDari": "زه خپل د انګلیسي ښوونکی تشریح کول غواړم.",
        "phonetic": "describe"
      },
      {
        "promptEn": "How did this person help you?",
        "promptPashto": "دې کس ستاسو سره د کومې مرستې وکړه؟",
        "promptDari": "دې کس ستاسو سره د کومې مرستې وکړه؟",
        "answerEn": "She helped me speak with confidence.",
        "answerPashto": "هغې ماسره د ډاډ سره خبرو کولو کې مرسته وکړه.",
        "answerDari": "هغې ماسره د ډاډ سره خبرو کولو کې مرسته وکړه.",
        "phonetic": "confidence"
      },
      {
        "promptEn": "Why was this help important?",
        "promptPashto": "ولې دا مرسته مهمه وه؟",
        "promptDari": "ولې دا مرسته مهمه وه؟",
        "answerEn": "It changed my future and gave me hope.",
        "answerPashto": "دا زما راتلونکی بدل کړ او ماته هیله راکړه.",
        "answerDari": "دا زما راتلونکی بدل کړ او ماته هیله راکړه.",
        "phonetic": "future"
      }
    ]
  },
  {
    "id": "academic-presentation-34",
    "level": "academic",
    "category": "school",
    "titleEn": "Academic Presentation",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Today I will present my research topic.",
        "promptPashto": "نن زه خپل د څیړنې موضوع وړاندې کوم.",
        "promptDari": "نن زه خپل د څیړنې موضوع وړاندې کوم.",
        "answerEn": "My topic is community health education.",
        "answerPashto": "زما موضوع د ټولنیزو روغتیا تعلیم ده.",
        "answerDari": "زما موضوع د ټولنیزو روغتیا تعلیم ده.",
        "phonetic": "research"
      },
      {
        "promptEn": "What is your main argument?",
        "promptPashto": "ستاسو اصلي دلیل کومه دی؟",
        "promptDari": "ستاسو اصلي دلیل کومه دی؟",
        "answerEn": "Health education can prevent many common diseases.",
        "answerPashto": "د روغتیا تعلیم کولی شي ډیری عام ناروغۍ مخه ونیسي.",
        "answerDari": "د روغتیا تعلیم کولی شي ډیری عام ناروغۍ مخه ونیسي.",
        "phonetic": "argument"
      },
      {
        "promptEn": "Do you have evidence for this?",
        "promptPashto": "ایا ستاسو سره دلیل شته؟",
        "promptDari": "ایا ستاسو سره دلیل شته؟",
        "answerEn": "Yes, I will show data from three studies.",
        "answerPashto": "هو، زه به د درو مطالعاتو ډاټا وښیم.",
        "answerDari": "هو، زه به د درو مطالعاتو ډاټا وښیم.",
        "phonetic": "evidence"
      }
    ]
  },
  {
    "id": "photo-description-35",
    "level": "intermediate",
    "category": "school",
    "titleEn": "Describing a Photograph",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What can you see in the picture?",
        "promptPashto": "تاسو انځور کې څه وینئ؟",
        "promptDari": "تاسو انځور کې څه وینئ؟",
        "answerEn": "I can see a family eating dinner together.",
        "answerPashto": "زه یوه کورنۍ وینم چې یوځای ډوډۍ خوري.",
        "answerDari": "زه یوه کورنۍ وینم چې یوځای ډوډۍ خوري.",
        "phonetic": "picture"
      },
      {
        "promptEn": "Where do you think they are?",
        "promptPashto": "تاسو فکر کوئ چې دوی چیرې دي؟",
        "promptDari": "تاسو فکر کوئ چې دوی چیرې دي؟",
        "answerEn": "They are probably at home in the kitchen.",
        "answerPashto": "دوی احتمالاً د کور پخلنځي کې دي.",
        "answerDari": "دوی احتمالاً د کور پخلنځي کې دي.",
        "phonetic": "probably"
      },
      {
        "promptEn": "How do they feel?",
        "promptPashto": "دوی د کومه احساس کوي؟",
        "promptDari": "دوی د کومه احساس کوي؟",
        "answerEn": "They look happy and relaxed.",
        "answerPashto": "دوی خوشحاله او آرام ښکاري.",
        "answerDari": "دوی خوشحاله او آرام ښکاري.",
        "phonetic": "relaxed"
      }
    ]
  },
  {
    "id": "express-opinion-36",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Expressing an Opinion",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What do you think about online learning?",
        "promptPashto": "تاسو د انلاین زده کړې پر اړه څه فکر کوئ؟",
        "promptDari": "تاسو د انلاین زده کړې پر اړه څه فکر کوئ؟",
        "answerEn": "I think it is useful, but students need discipline.",
        "answerPashto": "زما فکر دا ده چې ګټوره ده، خو زده کوونکو ته نظم ته اړتیا ده.",
        "answerDari": "زما فکر دا ده چې ګټوره ده، خو زده کوونکو ته نظم ته اړتیا ده.",
        "phonetic": "discipline"
      },
      {
        "promptEn": "Can you explain your reason?",
        "promptPashto": "ایا تاسو خپل دلیل تشریح کولی شئ؟",
        "promptDari": "ایا تاسو خپل دلیل تشریح کولی شئ؟",
        "answerEn": "Online learning saves time and gives access to many lessons.",
        "answerPashto": "انلاین زده کړه وخت سپموي او ډیری سبقونو ته لاسرسی ورکوي.",
        "answerDari": "انلاین زده کړه وخت سپموي او ډیری سبقونو ته لاسرسی ورکوي.",
        "phonetic": "access"
      },
      {
        "promptEn": "Do you prefer online or classroom learning?",
        "promptPashto": "تاسو انلاین یا ټولګي زده کړه خوښوئ؟",
        "promptDari": "تاسو انلاین یا ټولګي زده کړه خوښوئ؟",
        "answerEn": "I prefer a mix of both.",
        "answerPashto": "زه د دواړو ترکیب خوښوم.",
        "answerDari": "زه د دواړو ترکیب خوښوم.",
        "phonetic": "prefer"
      }
    ]
  },
  {
    "id": "news-discussion-37",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Discussing the News",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Did you hear the news today?",
        "promptPashto": "ایا تاسو نن اخبار واورئ؟",
        "promptDari": "ایا تاسو نن اخبار واورئ؟",
        "answerEn": "Yes, I read about the storm.",
        "answerPashto": "هو، ما د توپانه لوستل.",
        "answerDari": "هو، ما د توپانه لوستل.",
        "phonetic": "storm"
      },
      {
        "promptEn": "How does it affect people?",
        "promptPashto": "دا خلکو ته څنګه اغیزه کوي؟",
        "promptDari": "دا خلکو ته څنګه اغیزه کوي؟",
        "answerEn": "It may close schools and delay transport.",
        "answerPashto": "ممکن ښوونځیونه بند کړي او ترانسپورت ځنډ شي.",
        "answerDari": "ممکن ښوونځیونه بند کړي او ترانسپورت ځنډ شي.",
        "phonetic": "delay"
      },
      {
        "promptEn": "What should families do?",
        "promptPashto": "کورنیو باید څه وکړي؟",
        "promptDari": "کورنیو باید څه وکړي؟",
        "answerEn": "They should stay informed and prepare basic supplies.",
        "answerPashto": "دوی باید خبر وي او اساسي ضروریات چمتو کوي.",
        "answerDari": "دوی باید خبر وي او اساسي ضروریات چمتو کوي.",
        "phonetic": "supplies"
      }
    ]
  },
  {
    "id": "social-media-38",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Talking About Social Media",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "Do you use social media?",
        "promptPashto": "ایا تاسو ټولنیزه رسنۍ کاروئ؟",
        "promptDari": "ایا تاسو ټولنیزه رسنۍ کاروئ؟",
        "answerEn": "Yes, I use it to talk with family.",
        "answerPashto": "هو، زه یې د کورنۍ سره خبرو لپاره کاروم.",
        "answerDari": "هو، زه یې د کورنۍ سره خبرو لپاره کاروم.",
        "phonetic": "social media"
      },
      {
        "promptEn": "How much time do you spend on it?",
        "promptPashto": "تاسو د دې لپاره څومره وخت مصرفوئ؟",
        "promptDari": "تاسو د دې لپاره څومره وخت مصرفوئ؟",
        "answerEn": "About thirty minutes a day.",
        "answerPashto": "شاوخوا د ورځې دیرش دقیقې.",
        "answerDari": "شاوخوا د ورځې دیرش دقیقې.",
        "phonetic": "thirty"
      },
      {
        "promptEn": "Is it always useful?",
        "promptPashto": "ایا دا تل ګټوره ده؟",
        "promptDari": "ایا دا تل ګټوره ده؟",
        "answerEn": "No, we should use it carefully.",
        "answerPashto": "نه، موږ باید دا احتیاط سره وکاروو.",
        "answerDari": "نه، موږ باید دا احتیاط سره وکاروو.",
        "phonetic": "carefully"
      }
    ]
  },
  {
    "id": "hobbies-39",
    "level": "beginner",
    "category": "family",
    "titleEn": "Talking About Hobbies",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "What do you like to do in your free time?",
        "promptPashto": "تاسو د خپلو خالي وخت کې د کومو خوشحالیږئ؟",
        "promptDari": "تاسو د خپلو خالي وخت کې د کومو خوشحالیږئ؟",
        "answerEn": "I like reading and walking.",
        "answerPashto": "زه د لوستلو او سیر کولو خوشحالیږم.",
        "answerDari": "زه د لوستلو او سیر کولو خوشحالیږم.",
        "phonetic": "walking"
      },
      {
        "promptEn": "Do you play any sports?",
        "promptPashto": "ایا تاسو کوم سپورټ کوئ؟",
        "promptDari": "ایا تاسو کوم سپورټ کوئ؟",
        "answerEn": "Sometimes I play football with friends.",
        "answerPashto": "کله کله زه د ملګرو سره فوتبال لوبوم.",
        "answerDari": "کله کله زه د ملګرو سره فوتبال لوبوم.",
        "phonetic": "football"
      },
      {
        "promptEn": "Why do you enjoy it?",
        "promptPashto": "ولې تاسو هغه خوشحالیږئ؟",
        "promptDari": "ولې تاسو هغه خوشحالیږئ؟",
        "answerEn": "It helps me relax after work.",
        "answerPashto": "دا ماسره د کار وروسته آرامیدو کې مرسته کوي.",
        "answerDari": "دا ماسره د کار وروسته آرامیدو کې مرسته کوي.",
        "phonetic": "relax"
      }
    ]
  },
  {
    "id": "apology-40",
    "level": "basic",
    "category": "daily-life",
    "titleEn": "Apologising Politely",
    "titleDari": "",
    "steps": [
      {
        "promptEn": "You are late for the meeting.",
        "promptPashto": "تاسو د غونډو لپاره ناوخته یاست.",
        "promptDari": "تاسو د غونډو لپاره ناوخته یاست.",
        "answerEn": "I am sorry. The bus was delayed.",
        "answerPashto": "بخښنه غواړم. بس ځنډ شو.",
        "answerDari": "بخښنه غواړم. بس ځنډ شو.",
        "phonetic": "delay"
      },
      {
        "promptEn": "Please try to come on time next time.",
        "promptPashto": "مهرباني وکړئ راتلونکي ځل وخت ته راشئ.",
        "promptDari": "مهرباني وکړئ راتلونکي ځل وخت ته راشئ.",
        "answerEn": "Of course, it will not happen again.",
        "answerPashto": "البته، دا به بیا ونشي.",
        "answerDari": "البته، دا به بیا ونشي.",
        "phonetic": "again"
      },
      {
        "promptEn": "Thank you for understanding.",
        "promptPashto": "د پوهیدو مننه.",
        "promptDari": "د پوهیدو مننه.",
        "answerEn": "Thank you for your patience.",
        "answerPashto": "ستاسو د صبر مننه.",
        "answerDari": "ستاسو د صبر مننه.",
        "phonetic": "patience"
      }
    ]
  }
]);

TOPIC_STUDIO_DATA.push(...[
  {
    "id": "workplace-safety-topic",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Workplace Safety",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Workplace safety protects every worker from injury.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Before starting a task, I check the tools and the area around me.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "If I do not understand an instruction, I ask my supervisor to explain it again.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Safety is not only a rule; it is a responsibility.",
        "dari": ""
      }
    ]
  },
  {
    "id": "my-first-job-topic",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "My First Job",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "My first job was difficult, but I learned many useful skills.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I learned to come on time and listen carefully.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "I also learned how to speak politely with customers.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Every job can teach us something important.",
        "dari": ""
      }
    ]
  },
  {
    "id": "school-parent-topic",
    "level": "intermediate",
    "category": "school",
    "titleEn": "Helping Children at School",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Parents can support children by asking about school every day.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "A quiet place at home helps children do homework.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Reading together for a few minutes can improve language skills.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "When parents and teachers communicate, children learn better.",
        "dari": ""
      }
    ]
  },
  {
    "id": "clinic-appointment-topic",
    "level": "beginner",
    "category": "health",
    "titleEn": "Preparing for a Clinic Appointment",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Before a clinic appointment, I write down my symptoms.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I bring my medicine list and insurance card.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "If I do not understand the doctor, I ask for simple words.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Clear communication helps the doctor help me.",
        "dari": ""
      }
    ]
  },
  {
    "id": "healthy-food-topic",
    "level": "beginner",
    "category": "food",
    "titleEn": "Healthy Food Choices",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Healthy food gives the body energy.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I try to eat vegetables, fruit, rice, and protein.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Too much sugar and oil can make us unhealthy.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Small changes in food can improve family health.",
        "dari": ""
      }
    ]
  },
  {
    "id": "public-transport-topic",
    "level": "beginner",
    "category": "travel",
    "titleEn": "Using Public Transport",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Public transport helps people travel without a car.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Before I go out, I check the bus time on my phone.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "I keep my ticket or card ready before I get on.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "If I am confused, I ask the driver politely.",
        "dari": ""
      }
    ]
  },
  {
    "id": "afghan-hospitality-topic",
    "level": "intermediate",
    "category": "culture",
    "titleEn": "Afghan Hospitality",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Hospitality is an important part of Afghan culture.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "When a guest comes, families often offer tea, food, and respect.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "This tradition teaches children kindness and generosity.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Even in difficult times, Afghans try to honor their guests.",
        "dari": ""
      }
    ]
  },
  {
    "id": "describing-hometown-topic",
    "level": "intermediate",
    "category": "culture",
    "titleEn": "Describing My Hometown",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "My hometown is a place full of memories.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "It has busy streets, friendly people, and traditional food.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Some parts are old, and some parts are changing quickly.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "When I describe my hometown, I feel proud of my roots.",
        "dari": ""
      }
    ]
  },
  {
    "id": "learning-english-topic",
    "level": "beginner",
    "category": "school",
    "titleEn": "Why I Learn English",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "I am learning English because it helps me in daily life.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I can speak with teachers, doctors, and neighbors.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Every new word gives me more confidence.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "I know progress takes time, so I practice every day.",
        "dari": ""
      }
    ]
  },
  {
    "id": "family-traditions-topic",
    "level": "intermediate",
    "category": "family",
    "titleEn": "Family Traditions",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Every family has traditions that make it special.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "In my family, we eat together and respect our elders.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "On Eid, we visit relatives and share food.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "These traditions keep our family close even when life changes.",
        "dari": ""
      }
    ]
  },
  {
    "id": "phone-etiquette-topic",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Polite Phone Calls",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "A polite phone call starts with a greeting and a clear reason.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I say my name and explain why I am calling.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "If I do not understand, I ask the person to repeat slowly.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "At the end, I thank the person for their time.",
        "dari": ""
      }
    ]
  },
  {
    "id": "saving-money-topic",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Saving Money",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Saving money is important for family stability.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I try to separate needs from wants before shopping.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Even a small amount saved every week can help later.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "A simple budget gives the family more control.",
        "dari": ""
      }
    ]
  },
  {
    "id": "internet-safety-topic",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Internet Safety",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "The internet is useful, but it also has risks.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "We should not share passwords or private documents with strangers.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Children need guidance when they use social media.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Safe internet habits protect our money, identity, and family.",
        "dari": ""
      }
    ]
  },
  {
    "id": "climate-family-topic",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Climate and Family Life",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Climate change affects families in many ways.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Hot weather can affect health, water, and work.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Families can save water and reduce waste at home.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Small actions become powerful when many people do them together.",
        "dari": ""
      }
    ]
  },
  {
    "id": "afghan-history-topic",
    "level": "advanced",
    "category": "culture",
    "titleEn": "Afghan History in Simple Words",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Afghanistan has a long and rich history.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Many cultures, languages, and trade routes met in this land.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Learning history helps young people understand their identity.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "History should teach us wisdom, respect, and responsibility.",
        "dari": ""
      }
    ]
  },
  {
    "id": "formal-email-topic",
    "level": "academic",
    "category": "school",
    "titleEn": "Writing a Formal Email",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "A formal email should be clear and respectful.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "The subject line should tell the reader the purpose.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "The message should be short, polite, and organized.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "At the end, I thank the person and write my name.",
        "dari": ""
      }
    ]
  },
  {
    "id": "academic-opinion-topic",
    "level": "academic",
    "category": "school",
    "titleEn": "Giving an Academic Opinion",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "An academic opinion needs a clear claim and evidence.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I should not only say what I believe; I should explain why.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Examples and data make an argument stronger.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "A respectful tone is important in academic discussion.",
        "dari": ""
      }
    ]
  },
  {
    "id": "ielts-fluency-topic",
    "level": "ielts",
    "category": "school",
    "titleEn": "IELTS Fluency Practice",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "In IELTS speaking, fluency means speaking without too many long pauses.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "It is better to use simple correct sentences than complicated wrong sentences.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "I can improve fluency by practicing common topics every day.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Confidence grows when practice becomes a habit.",
        "dari": ""
      }
    ]
  },
  {
    "id": "ielts-part2-method-topic",
    "level": "ielts",
    "category": "school",
    "titleEn": "IELTS Part Two Method",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "For IELTS Part Two, I prepare a short structure before I speak.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I describe the topic, give details, and explain my feelings.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "I do not need perfect grammar in every sentence, but I need clear meaning.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "A strong ending makes the answer sound complete.",
        "dari": ""
      }
    ]
  },
  {
    "id": "community-service-topic",
    "level": "intermediate",
    "category": "culture",
    "titleEn": "Helping the Community",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Helping the community can start with small actions.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "We can help neighbors, share information, or volunteer.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "When people support each other, the whole community becomes stronger.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Kindness is a language everyone can understand.",
        "dari": ""
      }
    ]
  },
  {
    "id": "doctor-instructions-topic",
    "level": "intermediate",
    "category": "health",
    "titleEn": "Understanding Doctor Instructions",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Doctor instructions can be difficult when the language is new.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I ask the doctor to write the medicine schedule clearly.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "I repeat the instruction to make sure I understood.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Understanding medicine instructions protects health.",
        "dari": ""
      }
    ]
  },
  {
    "id": "customer-service-topic",
    "level": "intermediate",
    "category": "daily-life",
    "titleEn": "Good Customer Service",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Good customer service means listening carefully and speaking respectfully.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "If a customer is upset, I stay calm and try to understand the problem.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Clear information helps avoid confusion.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "A polite worker can make a difficult situation easier.",
        "dari": ""
      }
    ]
  },
  {
    "id": "small-business-topic",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Starting a Small Business",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "A small business starts with a clear problem and a useful solution.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Before investing money, I should understand customers and costs.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Good service builds trust and brings repeat customers.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "A business grows when the owner learns from mistakes.",
        "dari": ""
      }
    ]
  },
  {
    "id": "respecting-elders-topic",
    "level": "beginner",
    "category": "culture",
    "titleEn": "Respecting Elders",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Respecting elders is important in Afghan families.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "We listen when elders give advice.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Respect does not mean fear; it means kindness and good manners.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Children learn respect by watching adults.",
        "dari": ""
      }
    ]
  },
  {
    "id": "household-chores-topic",
    "level": "beginner",
    "category": "family",
    "titleEn": "Household Chores",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Every family member can help with housework.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "Children can clean their room and put away toys.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "Adults can cook, wash dishes, and plan shopping.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "When everyone helps, the home feels peaceful.",
        "dari": ""
      }
    ]
  },
  {
    "id": "time-management-topic",
    "level": "advanced",
    "category": "school",
    "titleEn": "Time Management",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Time management helps students and workers succeed.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I make a short list of important tasks each morning.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "I try to finish the hardest task before I get tired.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Good planning reduces stress and improves results.",
        "dari": ""
      }
    ]
  },
  {
    "id": "asking-help-topic",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "Asking for Help",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "Asking for help is a useful skill.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I can say: Excuse me, can you help me please?",
        "dari": ""
      },
      {
        "number": 3,
        "en": "If I do not understand, I can ask for slower speech.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "People are often willing to help when we ask politely.",
        "dari": ""
      }
    ]
  },
  {
    "id": "community-center-topic",
    "level": "beginner",
    "category": "daily-life",
    "titleEn": "At the Community Center",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "A community center can help new families.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "There may be English classes, sports, and advice services.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "I can ask about programs for children and adults.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Community centers help people feel less alone.",
        "dari": ""
      }
    ]
  },
  {
    "id": "court-police-topic",
    "level": "advanced",
    "category": "daily-life",
    "titleEn": "Speaking Clearly in Official Places",
    "titleDari": "",
    "paragraphs": [
      {
        "number": 1,
        "en": "In official places, clear language is very important.",
        "dari": ""
      },
      {
        "number": 2,
        "en": "I should answer only what I understand and ask for clarification when needed.",
        "dari": ""
      },
      {
        "number": 3,
        "en": "It is okay to ask for an interpreter if the matter is serious.",
        "dari": ""
      },
      {
        "number": 4,
        "en": "Careful communication protects rights and prevents mistakes.",
        "dari": ""
      }
    ]
  }
]);

STORIES.push(...[
  {
    "id": "library-first-01",
    "level": "basic",
    "titleEn": "First Trip to the Library",
    "titleDari": "",
    "icon": "📚",
    "color": "#eef2ff",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "Nadia entered the library with her little brother. The building was quiet and warm.",
        "dari": ""
      },
      {
        "en": "A librarian smiled and showed them the children's section.",
        "dari": ""
      },
      {
        "en": "Nadia borrowed two English books and one book with pictures.",
        "dari": ""
      },
      {
        "en": "At home, she read slowly and wrote new words in her notebook.",
        "dari": ""
      },
      {
        "en": "That day, the library became one of her favorite places.",
        "dari": ""
      }
    ]
  },
  {
    "id": "pomegranate-tree-02",
    "level": "basic",
    "titleEn": "The Pomegranate Tree",
    "titleDari": "",
    "icon": "🌳",
    "color": "#fff1f2",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "In the yard of an old house, there was a strong pomegranate tree.",
        "dari": ""
      },
      {
        "en": "Every autumn, the family gathered under the tree.",
        "dari": ""
      },
      {
        "en": "Grandfather said the tree was planted when he was a young man.",
        "dari": ""
      },
      {
        "en": "The children learned that roots are important, even when branches grow far.",
        "dari": ""
      },
      {
        "en": "The red fruit reminded them of home, patience, and family.",
        "dari": ""
      }
    ]
  },
  {
    "id": "snowy-kabul-03",
    "level": "beginner",
    "titleEn": "A Snowy Day in Kabul",
    "titleDari": "",
    "icon": "❄️",
    "color": "#eff6ff",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "Snow covered the streets of Kabul before sunrise.",
        "dari": ""
      },
      {
        "en": "Zahra looked out the window and saw white roofs everywhere.",
        "dari": ""
      },
      {
        "en": "Her father made tea while her mother warmed bread on the stove.",
        "dari": ""
      },
      {
        "en": "The children played outside, but they came back quickly because it was very cold.",
        "dari": ""
      },
      {
        "en": "That evening, the family sat together and listened to grandfather's stories.",
        "dari": ""
      }
    ]
  },
  {
    "id": "bike-learning-04",
    "level": "nursery",
    "titleEn": "Learning to Ride a Bike",
    "titleDari": "",
    "icon": "🚲",
    "color": "#ecfdf5",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "Sami wanted to ride his blue bike by himself.",
        "dari": ""
      },
      {
        "en": "At first, he fell down and felt afraid.",
        "dari": ""
      },
      {
        "en": "His sister said, Try again slowly. I will hold the seat.",
        "dari": ""
      },
      {
        "en": "After many tries, Sami rode across the yard.",
        "dari": ""
      },
      {
        "en": "He smiled and shouted, I can do it!",
        "dari": ""
      }
    ]
  },
  {
    "id": "eid-morning-05",
    "level": "nursery",
    "titleEn": "Eid Morning",
    "titleDari": "",
    "icon": "🌙",
    "color": "#fffbeb",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "The children woke up early on Eid morning.",
        "dari": ""
      },
      {
        "en": "Their clothes were clean, and the house smelled like sweet tea.",
        "dari": ""
      },
      {
        "en": "They hugged their parents and said, Eid Mubarak.",
        "dari": ""
      },
      {
        "en": "After prayer, the family visited relatives.",
        "dari": ""
      },
      {
        "en": "Everyone shared smiles, food, and kind words.",
        "dari": ""
      }
    ]
  },
  {
    "id": "lost-bazaar-06",
    "level": "beginner",
    "titleEn": "Lost in the Bazaar",
    "titleDari": "",
    "icon": "🛍️",
    "color": "#fff7ed",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "Yusuf went to the bazaar with his uncle to buy shoes.",
        "dari": ""
      },
      {
        "en": "The bazaar was crowded, and Yusuf stopped to look at colorful kites.",
        "dari": ""
      },
      {
        "en": "When he looked back, his uncle was not there.",
        "dari": ""
      },
      {
        "en": "Yusuf remembered his uncle's advice: stay calm and ask a shopkeeper for help.",
        "dari": ""
      },
      {
        "en": "Soon his uncle found him, and Yusuf promised to stay close next time.",
        "dari": ""
      }
    ]
  },
  {
    "id": "kind-neighbor-07",
    "level": "basic",
    "titleEn": "The Kind Neighbor",
    "titleDari": "",
    "icon": "🏠",
    "color": "#f0fdf4",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "When the new family moved in, they did not know anyone.",
        "dari": ""
      },
      {
        "en": "An old neighbor brought bread and tea to welcome them.",
        "dari": ""
      },
      {
        "en": "She spoke slowly because the family was still learning English.",
        "dari": ""
      },
      {
        "en": "Later, the family helped her carry groceries upstairs.",
        "dari": ""
      },
      {
        "en": "Kindness made the building feel like a home.",
        "dari": ""
      }
    ]
  },
  {
    "id": "small-business-08",
    "level": "advanced",
    "titleEn": "Starting a Small Business",
    "titleDari": "",
    "icon": "🏪",
    "color": "#fdf4ff",
    "time": "8 min",
    "paragraphs": [
      {
        "en": "Rafiq wanted to start a small delivery service in his neighborhood.",
        "dari": ""
      },
      {
        "en": "Before spending money, he asked families what they needed most.",
        "dari": ""
      },
      {
        "en": "He learned that speed, trust, and clear prices were more important than many products.",
        "dari": ""
      },
      {
        "en": "At first, he delivered only groceries and bread.",
        "dari": ""
      },
      {
        "en": "His business grew because he listened to customers and corrected mistakes quickly.",
        "dari": ""
      }
    ]
  },
  {
    "id": "museum-visit-09",
    "level": "intermediate",
    "titleEn": "Visiting a Museum",
    "titleDari": "",
    "icon": "🏛️",
    "color": "#f8fafc",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "The class visited a museum on Friday morning.",
        "dari": ""
      },
      {
        "en": "The guide showed old coins, carpets, and photographs.",
        "dari": ""
      },
      {
        "en": "Mina saw a map of the Silk Road and felt proud of Afghan history.",
        "dari": ""
      },
      {
        "en": "She wrote notes because she wanted to tell her parents everything.",
        "dari": ""
      },
      {
        "en": "That visit made history feel alive.",
        "dari": ""
      }
    ]
  },
  {
    "id": "letter-afghanistan-10",
    "level": "intermediate",
    "titleEn": "A Letter to Afghanistan",
    "titleDari": "",
    "icon": "✉️",
    "color": "#eef2ff",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "Every month, Laila wrote a letter to her grandmother in Afghanistan.",
        "dari": ""
      },
      {
        "en": "She wrote about school, English class, and the cold weather.",
        "dari": ""
      },
      {
        "en": "Sometimes she included a drawing from her little brother.",
        "dari": ""
      },
      {
        "en": "Her grandmother could not reply quickly, but she kept every letter carefully.",
        "dari": ""
      },
      {
        "en": "The letters helped the family feel close across the distance.",
        "dari": ""
      }
    ]
  },
  {
    "id": "school-play-11",
    "level": "intermediate",
    "titleEn": "The School Play",
    "titleDari": "",
    "icon": "🎭",
    "color": "#fef2f2",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "The teacher chose Ahmad to speak in the school play.",
        "dari": ""
      },
      {
        "en": "Ahmad was afraid because English words sometimes felt heavy in his mouth.",
        "dari": ""
      },
      {
        "en": "His friends practiced with him every day after class.",
        "dari": ""
      },
      {
        "en": "On the stage, he spoke slowly and clearly.",
        "dari": ""
      },
      {
        "en": "When the audience clapped, Ahmad knew practice had made him brave.",
        "dari": ""
      }
    ]
  },
  {
    "id": "mountain-shepherd-12",
    "level": "beginner",
    "titleEn": "A Shepherd in the Mountains",
    "titleDari": "",
    "icon": "🐑",
    "color": "#f0fdf4",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "A young shepherd took his sheep to the green hills.",
        "dari": ""
      },
      {
        "en": "He carried bread, cheese, and a small bottle of water.",
        "dari": ""
      },
      {
        "en": "The wind was cold, but the sun was bright.",
        "dari": ""
      },
      {
        "en": "He watched the sheep carefully and sang a quiet song.",
        "dari": ""
      },
      {
        "en": "In the evening, he returned home tired but happy.",
        "dari": ""
      }
    ]
  },
  {
    "id": "new-city-13",
    "level": "intermediate",
    "titleEn": "Moving to a New City",
    "titleDari": "",
    "icon": "🏙️",
    "color": "#eff6ff",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "When Haroon moved to a new city, he felt lost for many days.",
        "dari": ""
      },
      {
        "en": "The streets, buses, and shops were all unfamiliar.",
        "dari": ""
      },
      {
        "en": "He used a map on his phone and asked people for directions.",
        "dari": ""
      },
      {
        "en": "Slowly, he learned the names of streets and made new friends.",
        "dari": ""
      },
      {
        "en": "After one month, the new city did not feel strange anymore.",
        "dari": ""
      }
    ]
  },
  {
    "id": "grandpa-stories-14",
    "level": "intermediate",
    "titleEn": "Grandpa's Stories",
    "titleDari": "",
    "icon": "👴",
    "color": "#fffbeb",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "Every winter night, the grandchildren sat near their grandfather.",
        "dari": ""
      },
      {
        "en": "He told stories about old villages, long journeys, and brave people.",
        "dari": ""
      },
      {
        "en": "The children asked many questions, and grandfather answered patiently.",
        "dari": ""
      },
      {
        "en": "His stories carried history, humor, and lessons for life.",
        "dari": ""
      },
      {
        "en": "The children did not know it then, but they were receiving a treasure.",
        "dari": ""
      }
    ]
  },
  {
    "id": "clinic-bravery-15",
    "level": "basic",
    "titleEn": "Brave at the Clinic",
    "titleDari": "",
    "icon": "🩺",
    "color": "#ecfeff",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "Little Sana did not want to go to the clinic.",
        "dari": ""
      },
      {
        "en": "She was afraid of the nurse and the small needle.",
        "dari": ""
      },
      {
        "en": "Her mother held her hand and said, I am here with you.",
        "dari": ""
      },
      {
        "en": "The nurse smiled and spoke gently.",
        "dari": ""
      },
      {
        "en": "After the visit, Sana said, I was brave today.",
        "dari": ""
      }
    ]
  },
  {
    "id": "english-class-16",
    "level": "beginner",
    "titleEn": "The Evening English Class",
    "titleDari": "",
    "icon": "📝",
    "color": "#f5f3ff",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "After work, Jawad went to English class at the community center.",
        "dari": ""
      },
      {
        "en": "He was tired, but he wanted to learn.",
        "dari": ""
      },
      {
        "en": "The teacher asked everyone to say three sentences about family.",
        "dari": ""
      },
      {
        "en": "Jawad spoke slowly, and his classmates listened with respect.",
        "dari": ""
      },
      {
        "en": "He walked home proud of his small progress.",
        "dari": ""
      }
    ]
  },
  {
    "id": "job-interview-story-17",
    "level": "intermediate",
    "titleEn": "The Job Interview",
    "titleDari": "",
    "icon": "💼",
    "color": "#f8fafc",
    "time": "8 min",
    "paragraphs": [
      {
        "en": "Farida ironed her clothes carefully before the interview.",
        "dari": ""
      },
      {
        "en": "She practiced answers in front of the mirror.",
        "dari": ""
      },
      {
        "en": "At the office, her hands were cold, but her voice was clear.",
        "dari": ""
      },
      {
        "en": "She spoke about her experience, punctuality, and love for learning.",
        "dari": ""
      },
      {
        "en": "Two days later, she received a call: she got the job.",
        "dari": ""
      }
    ]
  },
  {
    "id": "bus-mistake-18",
    "level": "beginner",
    "titleEn": "The Wrong Bus",
    "titleDari": "",
    "icon": "🚌",
    "color": "#eff6ff",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "Omid got on the bus without checking the number.",
        "dari": ""
      },
      {
        "en": "After ten minutes, he saw unfamiliar streets.",
        "dari": ""
      },
      {
        "en": "He asked the driver politely if the bus went downtown.",
        "dari": ""
      },
      {
        "en": "The driver smiled and told him where to change buses.",
        "dari": ""
      },
      {
        "en": "Omid learned to check the number before getting on.",
        "dari": ""
      }
    ]
  },
  {
    "id": "family-dinner-19",
    "level": "nursery",
    "titleEn": "Family Dinner",
    "titleDari": "",
    "icon": "🍽️",
    "color": "#fff7ed",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "The family sat together on Friday night.",
        "dari": ""
      },
      {
        "en": "Mother cooked rice, beans, and salad.",
        "dari": ""
      },
      {
        "en": "Father asked each child about school.",
        "dari": ""
      },
      {
        "en": "Everyone listened and laughed together.",
        "dari": ""
      },
      {
        "en": "A simple dinner became a happy memory.",
        "dari": ""
      }
    ]
  },
  {
    "id": "helping-forms-20",
    "level": "intermediate",
    "titleEn": "Helping with Forms",
    "titleDari": "",
    "icon": "📄",
    "color": "#eef2ff",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "Nasir received a long form from the school office.",
        "dari": ""
      },
      {
        "en": "Some questions were easy, but some words were new.",
        "dari": ""
      },
      {
        "en": "He asked his English teacher to explain the difficult parts.",
        "dari": ""
      },
      {
        "en": "After filling the form, he made a copy and kept it safely.",
        "dari": ""
      },
      {
        "en": "Nasir learned that asking for help can prevent mistakes.",
        "dari": ""
      }
    ]
  },
  {
    "id": "rainy-delivery-21",
    "level": "basic",
    "titleEn": "A Rainy Delivery",
    "titleDari": "",
    "icon": "🌧️",
    "color": "#ecfeff",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "It rained heavily when Hamid was delivering groceries.",
        "dari": ""
      },
      {
        "en": "He covered the bags with a plastic sheet.",
        "dari": ""
      },
      {
        "en": "The customer thanked him because the bread stayed dry.",
        "dari": ""
      },
      {
        "en": "Hamid learned that small care builds trust.",
        "dari": ""
      },
      {
        "en": "He returned home wet, but proud of his work.",
        "dari": ""
      }
    ]
  },
  {
    "id": "first-paycheck-22",
    "level": "intermediate",
    "titleEn": "The First Paycheck",
    "titleDari": "",
    "icon": "💵",
    "color": "#f0fdf4",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "When Shabnam received her first paycheck, she looked at it for a long time.",
        "dari": ""
      },
      {
        "en": "She remembered the days she studied English after work.",
        "dari": ""
      },
      {
        "en": "She bought school supplies for her children and saved a little money.",
        "dari": ""
      },
      {
        "en": "That small paycheck felt like a big step forward.",
        "dari": ""
      },
      {
        "en": "She promised herself to keep learning and growing.",
        "dari": ""
      }
    ]
  },
  {
    "id": "doctor-note-23",
    "level": "beginner",
    "titleEn": "The Doctor's Note",
    "titleDari": "",
    "icon": "📝",
    "color": "#fef2f2",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "Ali was sick and missed school for two days.",
        "dari": ""
      },
      {
        "en": "The school asked for a note from the doctor.",
        "dari": ""
      },
      {
        "en": "His mother called the clinic and asked politely.",
        "dari": ""
      },
      {
        "en": "The clinic sent the note by email.",
        "dari": ""
      },
      {
        "en": "Ali returned to school with confidence.",
        "dari": ""
      }
    ]
  },
  {
    "id": "football-friends-24",
    "level": "nursery",
    "titleEn": "Football with Friends",
    "titleDari": "",
    "icon": "⚽",
    "color": "#f0fdf4",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "The boys played football after school.",
        "dari": ""
      },
      {
        "en": "One boy fell down, and everyone stopped.",
        "dari": ""
      },
      {
        "en": "His friend helped him stand up.",
        "dari": ""
      },
      {
        "en": "They played again, but more carefully.",
        "dari": ""
      },
      {
        "en": "Good friends care more about people than winning.",
        "dari": ""
      }
    ]
  },
  {
    "id": "market-change-25",
    "level": "basic",
    "titleEn": "Counting Change",
    "titleDari": "",
    "icon": "🔢",
    "color": "#fffbeb",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "Roya bought apples and bread from the market.",
        "dari": ""
      },
      {
        "en": "The shopkeeper gave her change.",
        "dari": ""
      },
      {
        "en": "Roya counted the money slowly before leaving.",
        "dari": ""
      },
      {
        "en": "She found a small mistake and politely explained it.",
        "dari": ""
      },
      {
        "en": "The shopkeeper smiled and corrected the change.",
        "dari": ""
      }
    ]
  },
  {
    "id": "online-class-26",
    "level": "intermediate",
    "titleEn": "The Online Class",
    "titleDari": "",
    "icon": "💻",
    "color": "7 min",
    "time": "#eef2ff",
    "paragraphs": [
      {
        "en": "Samira joined her English class on the phone.",
        "dari": ""
      },
      {
        "en": "The internet was weak, and the teacher's voice stopped sometimes.",
        "dari": ""
      },
      {
        "en": "Samira wrote questions in the chat when she could not speak.",
        "dari": ""
      },
      {
        "en": "After class, she replayed the lesson and practiced again.",
        "dari": ""
      },
      {
        "en": "She learned that online learning needs patience and planning.",
        "dari": ""
      }
    ]
  },
  {
    "id": "clean-park-27",
    "level": "beginner",
    "titleEn": "Cleaning the Park",
    "titleDari": "",
    "icon": "🌿",
    "color": "#ecfdf5",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "The community center organized a park cleaning day.",
        "dari": ""
      },
      {
        "en": "Families brought gloves, bags, and water.",
        "dari": ""
      },
      {
        "en": "Children collected paper and plastic from the grass.",
        "dari": ""
      },
      {
        "en": "After two hours, the park looked fresh and beautiful.",
        "dari": ""
      },
      {
        "en": "Everyone felt proud because they helped together.",
        "dari": ""
      }
    ]
  },
  {
    "id": "new-baby-28",
    "level": "basic",
    "titleEn": "The New Baby",
    "titleDari": "",
    "icon": "👶",
    "color": "#fdf2f8",
    "time": "5 min",
    "paragraphs": [
      {
        "en": "A new baby came to the family in the morning.",
        "dari": ""
      },
      {
        "en": "The children spoke quietly because the baby was sleeping.",
        "dari": ""
      },
      {
        "en": "Grandmother made soup for the mother.",
        "dari": ""
      },
      {
        "en": "Everyone thanked Allah and prayed for health.",
        "dari": ""
      },
      {
        "en": "The house felt full of love.",
        "dari": ""
      }
    ]
  },
  {
    "id": "strong-girl-29",
    "level": "intermediate",
    "titleEn": "The Strong Girl",
    "titleDari": "",
    "icon": "🌟",
    "color": "#f5f3ff",
    "time": "7 min",
    "paragraphs": [
      {
        "en": "Meena was the quietest student in class.",
        "dari": ""
      },
      {
        "en": "She knew the answers, but she was afraid to speak English.",
        "dari": ""
      },
      {
        "en": "Her teacher asked her to read one sentence every day.",
        "dari": ""
      },
      {
        "en": "After a month, Meena gave a short speech about her family.",
        "dari": ""
      },
      {
        "en": "Her voice was still soft, but her confidence was strong.",
        "dari": ""
      }
    ]
  },
  {
    "id": "father-daughter-shop-30",
    "level": "basic",
    "titleEn": "Father and Daughter at the Shop",
    "titleDari": "",
    "icon": "🛒",
    "color": "#fff7ed",
    "time": "6 min",
    "paragraphs": [
      {
        "en": "Father took his daughter to the shop to buy milk.",
        "dari": ""
      },
      {
        "en": "He asked her to read the price labels.",
        "dari": ""
      },
      {
        "en": "She found the cheapest milk and smiled.",
        "dari": ""
      },
      {
        "en": "At the counter, she said thank you in English.",
        "dari": ""
      },
      {
        "en": "Her father was proud of her small brave action.",
        "dari": ""
      }
    ]
  }
]);

Object.assign(WORD_SETS, {
  "workplace_safety_expanded": {
    "en": "Workplace Safety",
    "dari": "",
    "icon": "🦺",
    "words": [
      {
        "id": "workplace_safety_expanded_1",
        "en": "helmet",
        "dari": "",
        "ex_en": "Wear a helmet at the construction site.",
        "ex_dari": ""
      },
      {
        "id": "workplace_safety_expanded_2",
        "en": "gloves",
        "dari": "",
        "ex_en": "Use gloves when you carry sharp materials.",
        "ex_dari": ""
      },
      {
        "id": "workplace_safety_expanded_3",
        "en": "injury",
        "dari": "",
        "ex_en": "Report any injury to your supervisor.",
        "ex_dari": ""
      },
      {
        "id": "workplace_safety_expanded_4",
        "en": "warning",
        "dari": "",
        "ex_en": "Read the warning sign before entering.",
        "ex_dari": ""
      },
      {
        "id": "workplace_safety_expanded_5",
        "en": "ladder",
        "dari": "",
        "ex_en": "Hold the ladder carefully.",
        "ex_dari": ""
      },
      {
        "id": "workplace_safety_expanded_6",
        "en": "heavy",
        "dari": "",
        "ex_en": "Do not lift heavy boxes alone.",
        "ex_dari": ""
      },
      {
        "id": "workplace_safety_expanded_7",
        "en": "spill",
        "dari": "",
        "ex_en": "Clean the spill before someone slips.",
        "ex_dari": ""
      },
      {
        "id": "workplace_safety_expanded_8",
        "en": "safe",
        "dari": "",
        "ex_en": "Keep your workplace safe and clean.",
        "ex_dari": ""
      },
      {
        "id": "workplace_safety_expanded_9",
        "en": "protect",
        "dari": "",
        "ex_en": "Safety rules protect everyone.",
        "ex_dari": ""
      },
      {
        "id": "workplace_safety_expanded_10",
        "en": "equipment",
        "dari": "",
        "ex_en": "Check your equipment before work.",
        "ex_dari": ""
      }
    ]
  },
  "banking_money": {
    "en": "Banking & Money",
    "dari": "",
    "icon": "🏦",
    "words": [
      {
        "id": "banking_money_1",
        "en": "account",
        "dari": "",
        "ex_en": "I opened a bank account.",
        "ex_dari": ""
      },
      {
        "id": "banking_money_2",
        "en": "deposit",
        "dari": "",
        "ex_en": "I made a deposit this morning.",
        "ex_dari": ""
      },
      {
        "id": "banking_money_3",
        "en": "withdraw",
        "dari": "",
        "ex_en": "I need to withdraw cash.",
        "ex_dari": ""
      },
      {
        "id": "banking_money_4",
        "en": "balance",
        "dari": "",
        "ex_en": "Check your balance before shopping.",
        "ex_dari": ""
      },
      {
        "id": "banking_money_5",
        "en": "receipt",
        "dari": "",
        "ex_en": "Please keep your receipt.",
        "ex_dari": ""
      },
      {
        "id": "banking_money_6",
        "en": "fee",
        "dari": "",
        "ex_en": "The bank charged a small fee.",
        "ex_dari": ""
      },
      {
        "id": "banking_money_7",
        "en": "transfer",
        "dari": "",
        "ex_en": "I sent a money transfer to my family.",
        "ex_dari": ""
      },
      {
        "id": "banking_money_8",
        "en": "budget",
        "dari": "",
        "ex_en": "A budget helps families save money.",
        "ex_dari": ""
      },
      {
        "id": "banking_money_9",
        "en": "cash",
        "dari": "",
        "ex_en": "I need some cash for the bus.",
        "ex_dari": ""
      },
      {
        "id": "banking_money_10",
        "en": "card",
        "dari": "",
        "ex_en": "My bank card arrived today.",
        "ex_dari": ""
      }
    ]
  },
  "official_documents": {
    "en": "Documents & Forms",
    "dari": "",
    "icon": "📄",
    "words": [
      {
        "id": "official_documents_1",
        "en": "form",
        "dari": "",
        "ex_en": "Please fill out this form.",
        "ex_dari": ""
      },
      {
        "id": "official_documents_2",
        "en": "signature",
        "dari": "",
        "ex_en": "Write your signature at the bottom.",
        "ex_dari": ""
      },
      {
        "id": "official_documents_3",
        "en": "address",
        "dari": "",
        "ex_en": "Write your full address here.",
        "ex_dari": ""
      },
      {
        "id": "official_documents_4",
        "en": "birthdate",
        "dari": "",
        "ex_en": "What is your birthdate?",
        "ex_dari": ""
      },
      {
        "id": "official_documents_5",
        "en": "identification",
        "dari": "",
        "ex_en": "Bring your identification card.",
        "ex_dari": ""
      },
      {
        "id": "official_documents_6",
        "en": "copy",
        "dari": "",
        "ex_en": "Please make a copy of this document.",
        "ex_dari": ""
      },
      {
        "id": "official_documents_7",
        "en": "submit",
        "dari": "",
        "ex_en": "Submit the form by Friday.",
        "ex_dari": ""
      },
      {
        "id": "official_documents_8",
        "en": "deadline",
        "dari": "",
        "ex_en": "The deadline is tomorrow.",
        "ex_dari": ""
      },
      {
        "id": "official_documents_9",
        "en": "approve",
        "dari": "",
        "ex_en": "They approved my application.",
        "ex_dari": ""
      },
      {
        "id": "official_documents_10",
        "en": "application",
        "dari": "",
        "ex_en": "I completed the application.",
        "ex_dari": ""
      }
    ]
  },
  "school_parent_words": {
    "en": "School & Parents",
    "dari": "",
    "icon": "🏫",
    "words": [
      {
        "id": "school_parent_words_1",
        "en": "principal",
        "dari": "",
        "ex_en": "The principal spoke with the parents.",
        "ex_dari": ""
      },
      {
        "id": "school_parent_words_2",
        "en": "attendance",
        "dari": "",
        "ex_en": "Good attendance is important.",
        "ex_dari": ""
      },
      {
        "id": "school_parent_words_3",
        "en": "absence",
        "dari": "",
        "ex_en": "Call the school about an absence.",
        "ex_dari": ""
      },
      {
        "id": "school_parent_words_4",
        "en": "grade",
        "dari": "",
        "ex_en": "My son's grade improved.",
        "ex_dari": ""
      },
      {
        "id": "school_parent_words_5",
        "en": "reading",
        "dari": "",
        "ex_en": "Reading every day helps children.",
        "ex_dari": ""
      },
      {
        "id": "school_parent_words_6",
        "en": "permission",
        "dari": "",
        "ex_en": "The trip needs parent permission.",
        "ex_dari": ""
      },
      {
        "id": "school_parent_words_7",
        "en": "meeting",
        "dari": "",
        "ex_en": "The teacher meeting is tomorrow.",
        "ex_dari": ""
      },
      {
        "id": "school_parent_words_8",
        "en": "progress",
        "dari": "",
        "ex_en": "The teacher discussed my child's progress.",
        "ex_dari": ""
      },
      {
        "id": "school_parent_words_9",
        "en": "classmate",
        "dari": "",
        "ex_en": "Her classmate helped her.",
        "ex_dari": ""
      },
      {
        "id": "school_parent_words_10",
        "en": "subject",
        "dari": "",
        "ex_en": "Math is my favorite subject.",
        "ex_dari": ""
      }
    ]
  },
  "doctor_pharmacy_words": {
    "en": "Doctor & Pharmacy",
    "dari": "",
    "icon": "💊",
    "words": [
      {
        "id": "doctor_pharmacy_words_1",
        "en": "tablet",
        "dari": "",
        "ex_en": "Take one tablet after breakfast.",
        "ex_dari": ""
      },
      {
        "id": "doctor_pharmacy_words_2",
        "en": "dose",
        "dari": "",
        "ex_en": "Do not take more than the correct dose.",
        "ex_dari": ""
      },
      {
        "id": "doctor_pharmacy_words_3",
        "en": "fever",
        "dari": "",
        "ex_en": "The child has a fever.",
        "ex_dari": ""
      },
      {
        "id": "doctor_pharmacy_words_4",
        "en": "cough",
        "dari": "",
        "ex_en": "I have a dry cough.",
        "ex_dari": ""
      },
      {
        "id": "doctor_pharmacy_words_5",
        "en": "pain",
        "dari": "",
        "ex_en": "Where is the pain?",
        "ex_dari": ""
      },
      {
        "id": "doctor_pharmacy_words_6",
        "en": "blood pressure",
        "dari": "",
        "ex_en": "The nurse checked my blood pressure.",
        "ex_dari": ""
      },
      {
        "id": "doctor_pharmacy_words_7",
        "en": "appointment",
        "dari": "",
        "ex_en": "My appointment is at three o'clock.",
        "ex_dari": ""
      },
      {
        "id": "doctor_pharmacy_words_8",
        "en": "clinic",
        "dari": "",
        "ex_en": "The clinic is near my house.",
        "ex_dari": ""
      },
      {
        "id": "doctor_pharmacy_words_9",
        "en": "medicine",
        "dari": "",
        "ex_en": "This medicine helps with pain.",
        "ex_dari": ""
      },
      {
        "id": "doctor_pharmacy_words_10",
        "en": "allergic",
        "dari": "",
        "ex_en": "I am allergic to this medicine.",
        "ex_dari": ""
      }
    ]
  },
  "transport_city_words": {
    "en": "Transport & City",
    "dari": "",
    "icon": "🚌",
    "words": [
      {
        "id": "transport_city_words_1",
        "en": "bus stop",
        "dari": "",
        "ex_en": "The bus stop is near the school.",
        "ex_dari": ""
      },
      {
        "id": "transport_city_words_2",
        "en": "ticket",
        "dari": "",
        "ex_en": "I bought a bus ticket.",
        "ex_dari": ""
      },
      {
        "id": "transport_city_words_3",
        "en": "route",
        "dari": "",
        "ex_en": "Which route goes downtown?",
        "ex_dari": ""
      },
      {
        "id": "transport_city_words_4",
        "en": "station",
        "dari": "",
        "ex_en": "Meet me at the train station.",
        "ex_dari": ""
      },
      {
        "id": "transport_city_words_5",
        "en": "traffic",
        "dari": "",
        "ex_en": "Traffic is heavy today.",
        "ex_dari": ""
      },
      {
        "id": "transport_city_words_6",
        "en": "crosswalk",
        "dari": "",
        "ex_en": "Use the crosswalk to cross the street.",
        "ex_dari": ""
      },
      {
        "id": "transport_city_words_7",
        "en": "left",
        "dari": "",
        "ex_en": "Turn left after the bridge.",
        "ex_dari": ""
      },
      {
        "id": "transport_city_words_8",
        "en": "right",
        "dari": "",
        "ex_en": "The office is on the right.",
        "ex_dari": ""
      },
      {
        "id": "transport_city_words_9",
        "en": "near",
        "dari": "",
        "ex_en": "The shop is near my house.",
        "ex_dari": ""
      },
      {
        "id": "transport_city_words_10",
        "en": "far",
        "dari": "",
        "ex_en": "The hospital is far from here.",
        "ex_dari": ""
      }
    ]
  },
  "housing_repair_words": {
    "en": "Housing & Repairs",
    "dari": "",
    "icon": "🔧",
    "words": [
      {
        "id": "housing_repair_words_1",
        "en": "heater",
        "dari": "",
        "ex_en": "The heater is not working.",
        "ex_dari": ""
      },
      {
        "id": "housing_repair_words_2",
        "en": "leak",
        "dari": "",
        "ex_en": "There is a leak under the sink.",
        "ex_dari": ""
      },
      {
        "id": "housing_repair_words_3",
        "en": "rent",
        "dari": "",
        "ex_en": "Rent is due on the first day.",
        "ex_dari": ""
      },
      {
        "id": "housing_repair_words_4",
        "en": "landlord",
        "dari": "",
        "ex_en": "Call the landlord about the repair.",
        "ex_dari": ""
      },
      {
        "id": "housing_repair_words_5",
        "en": "repair",
        "dari": "",
        "ex_en": "The repair will take one hour.",
        "ex_dari": ""
      },
      {
        "id": "housing_repair_words_6",
        "en": "electricity",
        "dari": "",
        "ex_en": "The electricity went off.",
        "ex_dari": ""
      },
      {
        "id": "housing_repair_words_7",
        "en": "water bill",
        "dari": "",
        "ex_en": "The water bill arrived today.",
        "ex_dari": ""
      },
      {
        "id": "housing_repair_words_8",
        "en": "noise",
        "dari": "",
        "ex_en": "There is too much noise upstairs.",
        "ex_dari": ""
      },
      {
        "id": "housing_repair_words_9",
        "en": "key",
        "dari": "",
        "ex_en": "I lost my apartment key.",
        "ex_dari": ""
      },
      {
        "id": "housing_repair_words_10",
        "en": "move",
        "dari": "",
        "ex_en": "We will move next month.",
        "ex_dari": ""
      }
    ]
  },
  "emotions_feelings": {
    "en": "Emotions & Feelings",
    "dari": "",
    "icon": "😊",
    "words": [
      {
        "id": "emotions_feelings_1",
        "en": "happy",
        "dari": "",
        "ex_en": "I feel happy today.",
        "ex_dari": ""
      },
      {
        "id": "emotions_feelings_2",
        "en": "worried",
        "dari": "",
        "ex_en": "I am worried about the test.",
        "ex_dari": ""
      },
      {
        "id": "emotions_feelings_3",
        "en": "proud",
        "dari": "",
        "ex_en": "I am proud of my progress.",
        "ex_dari": ""
      },
      {
        "id": "emotions_feelings_4",
        "en": "tired",
        "dari": "",
        "ex_en": "I am tired after work.",
        "ex_dari": ""
      },
      {
        "id": "emotions_feelings_5",
        "en": "calm",
        "dari": "",
        "ex_en": "Please stay calm.",
        "ex_dari": ""
      },
      {
        "id": "emotions_feelings_6",
        "en": "confident",
        "dari": "",
        "ex_en": "Speak in a confident voice.",
        "ex_dari": ""
      },
      {
        "id": "emotions_feelings_7",
        "en": "afraid",
        "dari": "",
        "ex_en": "The child is afraid of the dark.",
        "ex_dari": ""
      },
      {
        "id": "emotions_feelings_8",
        "en": "grateful",
        "dari": "",
        "ex_en": "I am grateful for your help.",
        "ex_dari": ""
      },
      {
        "id": "emotions_feelings_9",
        "en": "lonely",
        "dari": "",
        "ex_en": "Sometimes I feel lonely in a new city.",
        "ex_dari": ""
      },
      {
        "id": "emotions_feelings_10",
        "en": "hopeful",
        "dari": "",
        "ex_en": "I feel hopeful about the future.",
        "ex_dari": ""
      }
    ]
  },
  "family_relations_expanded": {
    "en": "Family Relations",
    "dari": "",
    "icon": "👨‍👩‍👧‍👦",
    "words": [
      {
        "id": "family_relations_expanded_1",
        "en": "parents",
        "dari": "",
        "ex_en": "Parents support their children.",
        "ex_dari": ""
      },
      {
        "id": "family_relations_expanded_2",
        "en": "children",
        "dari": "",
        "ex_en": "Children learn by watching adults.",
        "ex_dari": ""
      },
      {
        "id": "family_relations_expanded_3",
        "en": "uncle",
        "dari": "",
        "ex_en": "My uncle lives nearby.",
        "ex_dari": ""
      },
      {
        "id": "family_relations_expanded_4",
        "en": "aunt",
        "dari": "",
        "ex_en": "My aunt called us today.",
        "ex_dari": ""
      },
      {
        "id": "family_relations_expanded_5",
        "en": "cousin",
        "dari": "",
        "ex_en": "My cousin is in my class.",
        "ex_dari": ""
      },
      {
        "id": "family_relations_expanded_6",
        "en": "relative",
        "dari": "",
        "ex_en": "We visited relatives on Eid.",
        "ex_dari": ""
      },
      {
        "id": "family_relations_expanded_7",
        "en": "elder",
        "dari": "",
        "ex_en": "Respect elders in the family.",
        "ex_dari": ""
      },
      {
        "id": "family_relations_expanded_8",
        "en": "guest",
        "dari": "",
        "ex_en": "A guest came to our house.",
        "ex_dari": ""
      },
      {
        "id": "family_relations_expanded_9",
        "en": "neighbor",
        "dari": "",
        "ex_en": "Our neighbor is very kind.",
        "ex_dari": ""
      },
      {
        "id": "family_relations_expanded_10",
        "en": "support",
        "dari": "",
        "ex_en": "Family support gives courage.",
        "ex_dari": ""
      }
    ]
  },
  "technology_daily": {
    "en": "Technology Daily Use",
    "dari": "",
    "icon": "📱",
    "words": [
      {
        "id": "technology_daily_1",
        "en": "password",
        "dari": "",
        "ex_en": "Do not share your password.",
        "ex_dari": ""
      },
      {
        "id": "technology_daily_2",
        "en": "message",
        "dari": "",
        "ex_en": "I sent a message to my teacher.",
        "ex_dari": ""
      },
      {
        "id": "technology_daily_3",
        "en": "internet",
        "dari": "",
        "ex_en": "The internet is slow today.",
        "ex_dari": ""
      },
      {
        "id": "technology_daily_4",
        "en": "screen",
        "dari": "",
        "ex_en": "Look at the screen.",
        "ex_dari": ""
      },
      {
        "id": "technology_daily_5",
        "en": "upload",
        "dari": "",
        "ex_en": "Upload the file here.",
        "ex_dari": ""
      },
      {
        "id": "technology_daily_6",
        "en": "download",
        "dari": "",
        "ex_en": "Download the lesson before class.",
        "ex_dari": ""
      },
      {
        "id": "technology_daily_7",
        "en": "link",
        "dari": "",
        "ex_en": "Click the meeting link.",
        "ex_dari": ""
      },
      {
        "id": "technology_daily_8",
        "en": "settings",
        "dari": "",
        "ex_en": "Open the settings page.",
        "ex_dari": ""
      },
      {
        "id": "technology_daily_9",
        "en": "charge",
        "dari": "",
        "ex_en": "Charge your phone before you leave.",
        "ex_dari": ""
      },
      {
        "id": "technology_daily_10",
        "en": "camera",
        "dari": "",
        "ex_en": "Turn on the camera for class.",
        "ex_dari": ""
      }
    ]
  },
  "polite_requests": {
    "en": "Polite Requests",
    "dari": "",
    "icon": "🙏",
    "words": [
      {
        "id": "polite_requests_1",
        "en": "please",
        "dari": "",
        "ex_en": "Please speak slowly.",
        "ex_dari": ""
      },
      {
        "id": "polite_requests_2",
        "en": "excuse me",
        "dari": "",
        "ex_en": "Excuse me, can you help me?",
        "ex_dari": ""
      },
      {
        "id": "polite_requests_3",
        "en": "could you",
        "dari": "",
        "ex_en": "Could you repeat that?",
        "ex_dari": ""
      },
      {
        "id": "polite_requests_4",
        "en": "thank you",
        "dari": "",
        "ex_en": "Thank you for your time.",
        "ex_dari": ""
      },
      {
        "id": "polite_requests_5",
        "en": "sorry",
        "dari": "",
        "ex_en": "Sorry, I did not understand.",
        "ex_dari": ""
      },
      {
        "id": "polite_requests_6",
        "en": "may I",
        "dari": "",
        "ex_en": "May I ask a question?",
        "ex_dari": ""
      },
      {
        "id": "polite_requests_7",
        "en": "help",
        "dari": "",
        "ex_en": "I need help with this form.",
        "ex_dari": ""
      },
      {
        "id": "polite_requests_8",
        "en": "slowly",
        "dari": "",
        "ex_en": "Please say it slowly.",
        "ex_dari": ""
      },
      {
        "id": "polite_requests_9",
        "en": "again",
        "dari": "",
        "ex_en": "Please say it again.",
        "ex_dari": ""
      },
      {
        "id": "polite_requests_10",
        "en": "kindly",
        "dari": "",
        "ex_en": "Kindly write it down.",
        "ex_dari": ""
      }
    ]
  },
  "shopping_items": {
    "en": "Shopping Items",
    "dari": "",
    "icon": "🛒",
    "words": [
      {
        "id": "shopping_items_1",
        "en": "rice",
        "dari": "",
        "ex_en": "We need a bag of rice.",
        "ex_dari": ""
      },
      {
        "id": "shopping_items_2",
        "en": "flour",
        "dari": "",
        "ex_en": "Buy flour for bread.",
        "ex_dari": ""
      },
      {
        "id": "shopping_items_3",
        "en": "oil",
        "dari": "",
        "ex_en": "Cooking oil is on sale.",
        "ex_dari": ""
      },
      {
        "id": "shopping_items_4",
        "en": "sugar",
        "dari": "",
        "ex_en": "We need sugar for tea.",
        "ex_dari": ""
      },
      {
        "id": "shopping_items_5",
        "en": "tea",
        "dari": "",
        "ex_en": "Afghan families often drink tea.",
        "ex_dari": ""
      },
      {
        "id": "shopping_items_6",
        "en": "milk",
        "dari": "",
        "ex_en": "The children drink milk.",
        "ex_dari": ""
      },
      {
        "id": "shopping_items_7",
        "en": "eggs",
        "dari": "",
        "ex_en": "Buy twelve eggs.",
        "ex_dari": ""
      },
      {
        "id": "shopping_items_8",
        "en": "potatoes",
        "dari": "",
        "ex_en": "Potatoes are used for bolani.",
        "ex_dari": ""
      },
      {
        "id": "shopping_items_9",
        "en": "onions",
        "dari": "",
        "ex_en": "Cut the onions carefully.",
        "ex_dari": ""
      },
      {
        "id": "shopping_items_10",
        "en": "soap",
        "dari": "",
        "ex_en": "We need soap and shampoo.",
        "ex_dari": ""
      }
    ]
  },
  "time_calendar": {
    "en": "Time & Calendar",
    "dari": "",
    "icon": "📅",
    "words": [
      {
        "id": "time_calendar_1",
        "en": "today",
        "dari": "",
        "ex_en": "Today is Monday.",
        "ex_dari": ""
      },
      {
        "id": "time_calendar_2",
        "en": "tomorrow",
        "dari": "",
        "ex_en": "Tomorrow I have class.",
        "ex_dari": ""
      },
      {
        "id": "time_calendar_3",
        "en": "yesterday",
        "dari": "",
        "ex_en": "Yesterday I went to the clinic.",
        "ex_dari": ""
      },
      {
        "id": "time_calendar_4",
        "en": "morning",
        "dari": "",
        "ex_en": "I study in the morning.",
        "ex_dari": ""
      },
      {
        "id": "time_calendar_5",
        "en": "evening",
        "dari": "",
        "ex_en": "We eat dinner in the evening.",
        "ex_dari": ""
      },
      {
        "id": "time_calendar_6",
        "en": "week",
        "dari": "",
        "ex_en": "I work five days a week.",
        "ex_dari": ""
      },
      {
        "id": "time_calendar_7",
        "en": "month",
        "dari": "",
        "ex_en": "Rent is paid every month.",
        "ex_dari": ""
      },
      {
        "id": "time_calendar_8",
        "en": "early",
        "dari": "",
        "ex_en": "Please come early.",
        "ex_dari": ""
      },
      {
        "id": "time_calendar_9",
        "en": "late",
        "dari": "",
        "ex_en": "I was late for the bus.",
        "ex_dari": ""
      },
      {
        "id": "time_calendar_10",
        "en": "schedule",
        "dari": "",
        "ex_en": "Check your schedule.",
        "ex_dari": ""
      }
    ]
  },
  "kids_classroom": {
    "en": "Kids Classroom",
    "dari": "",
    "icon": "🧒",
    "words": [
      {
        "id": "kids_classroom_1",
        "en": "teacher",
        "dari": "",
        "ex_en": "The teacher is reading a story.",
        "ex_dari": ""
      },
      {
        "id": "kids_classroom_2",
        "en": "student",
        "dari": "",
        "ex_en": "The student writes his name.",
        "ex_dari": ""
      },
      {
        "id": "kids_classroom_3",
        "en": "pencil",
        "dari": "",
        "ex_en": "Use a pencil for homework.",
        "ex_dari": ""
      },
      {
        "id": "kids_classroom_4",
        "en": "paper",
        "dari": "",
        "ex_en": "Write on the paper.",
        "ex_dari": ""
      },
      {
        "id": "kids_classroom_5",
        "en": "listen",
        "dari": "",
        "ex_en": "Listen to the teacher.",
        "ex_dari": ""
      },
      {
        "id": "kids_classroom_6",
        "en": "repeat",
        "dari": "",
        "ex_en": "Repeat the word after me.",
        "ex_dari": ""
      },
      {
        "id": "kids_classroom_7",
        "en": "circle",
        "dari": "",
        "ex_en": "Draw a circle.",
        "ex_dari": ""
      },
      {
        "id": "kids_classroom_8",
        "en": "color",
        "dari": "",
        "ex_en": "What color is this?",
        "ex_dari": ""
      },
      {
        "id": "kids_classroom_9",
        "en": "share",
        "dari": "",
        "ex_en": "Share the toys with your friend.",
        "ex_dari": ""
      },
      {
        "id": "kids_classroom_10",
        "en": "clean",
        "dari": "",
        "ex_en": "Clean your desk.",
        "ex_dari": ""
      }
    ]
  },
  "business_startup": {
    "en": "Small Business",
    "dari": "",
    "icon": "🏪",
    "words": [
      {
        "id": "business_startup_1",
        "en": "customer",
        "dari": "",
        "ex_en": "Good service brings customers back.",
        "ex_dari": ""
      },
      {
        "id": "business_startup_2",
        "en": "profit",
        "dari": "",
        "ex_en": "Profit must be higher than costs.",
        "ex_dari": ""
      },
      {
        "id": "business_startup_3",
        "en": "cost",
        "dari": "",
        "ex_en": "Calculate the cost before selling.",
        "ex_dari": ""
      },
      {
        "id": "business_startup_4",
        "en": "supplier",
        "dari": "",
        "ex_en": "Find a reliable supplier.",
        "ex_dari": ""
      },
      {
        "id": "business_startup_5",
        "en": "stock",
        "dari": "",
        "ex_en": "Keep enough stock for busy days.",
        "ex_dari": ""
      },
      {
        "id": "business_startup_6",
        "en": "delivery",
        "dari": "",
        "ex_en": "Fast delivery makes customers happy.",
        "ex_dari": ""
      },
      {
        "id": "business_startup_7",
        "en": "quality",
        "dari": "",
        "ex_en": "Quality is more important than speed alone.",
        "ex_dari": ""
      },
      {
        "id": "business_startup_8",
        "en": "trust",
        "dari": "",
        "ex_en": "Trust is built slowly.",
        "ex_dari": ""
      },
      {
        "id": "business_startup_9",
        "en": "price",
        "dari": "",
        "ex_en": "The price must be clear.",
        "ex_dari": ""
      },
      {
        "id": "business_startup_10",
        "en": "service",
        "dari": "",
        "ex_en": "Respectful service is powerful.",
        "ex_dari": ""
      }
    ]
  },
  "community_services": {
    "en": "Community Services",
    "dari": "",
    "icon": "🏘️",
    "words": [
      {
        "id": "community_services_1",
        "en": "community center",
        "dari": "",
        "ex_en": "The community center has English classes.",
        "ex_dari": ""
      },
      {
        "id": "community_services_2",
        "en": "program",
        "dari": "",
        "ex_en": "This program helps new families.",
        "ex_dari": ""
      },
      {
        "id": "community_services_3",
        "en": "volunteer",
        "dari": "",
        "ex_en": "A volunteer helped us with forms.",
        "ex_dari": ""
      },
      {
        "id": "community_services_4",
        "en": "support",
        "dari": "",
        "ex_en": "Support is available for families.",
        "ex_dari": ""
      },
      {
        "id": "community_services_5",
        "en": "advice",
        "dari": "",
        "ex_en": "I need advice about housing.",
        "ex_dari": ""
      },
      {
        "id": "community_services_6",
        "en": "translation",
        "dari": "",
        "ex_en": "Do you offer translation help?",
        "ex_dari": ""
      },
      {
        "id": "community_services_7",
        "en": "class",
        "dari": "",
        "ex_en": "The class starts at six.",
        "ex_dari": ""
      },
      {
        "id": "community_services_8",
        "en": "registration",
        "dari": "",
        "ex_en": "Registration is free.",
        "ex_dari": ""
      },
      {
        "id": "community_services_9",
        "en": "appointment",
        "dari": "",
        "ex_en": "Make an appointment first.",
        "ex_dari": ""
      },
      {
        "id": "community_services_10",
        "en": "information",
        "dari": "",
        "ex_en": "Please give me more information.",
        "ex_dari": ""
      }
    ]
  },
  "weather_seasons": {
    "en": "Weather & Seasons",
    "dari": "",
    "icon": "🌦️",
    "words": [
      {
        "id": "weather_seasons_1",
        "en": "sunny",
        "dari": "",
        "ex_en": "It is sunny today.",
        "ex_dari": ""
      },
      {
        "id": "weather_seasons_2",
        "en": "cloudy",
        "dari": "",
        "ex_en": "The sky is cloudy.",
        "ex_dari": ""
      },
      {
        "id": "weather_seasons_3",
        "en": "rainy",
        "dari": "",
        "ex_en": "It is rainy this morning.",
        "ex_dari": ""
      },
      {
        "id": "weather_seasons_4",
        "en": "snowy",
        "dari": "",
        "ex_en": "The road is snowy.",
        "ex_dari": ""
      },
      {
        "id": "weather_seasons_5",
        "en": "windy",
        "dari": "",
        "ex_en": "It is windy outside.",
        "ex_dari": ""
      },
      {
        "id": "weather_seasons_6",
        "en": "hot",
        "dari": "",
        "ex_en": "Summer is very hot.",
        "ex_dari": ""
      },
      {
        "id": "weather_seasons_7",
        "en": "cold",
        "dari": "",
        "ex_en": "Winter is cold.",
        "ex_dari": ""
      },
      {
        "id": "weather_seasons_8",
        "en": "spring",
        "dari": "",
        "ex_en": "Flowers grow in spring.",
        "ex_dari": ""
      },
      {
        "id": "weather_seasons_9",
        "en": "autumn",
        "dari": "",
        "ex_en": "Leaves fall in autumn.",
        "ex_dari": ""
      },
      {
        "id": "weather_seasons_10",
        "en": "forecast",
        "dari": "",
        "ex_en": "Check the weather forecast.",
        "ex_dari": ""
      }
    ]
  },
  "food_cooking_verbs": {
    "en": "Cooking Verbs",
    "dari": "",
    "icon": "🍳",
    "words": [
      {
        "id": "food_cooking_verbs_1",
        "en": "cook",
        "dari": "",
        "ex_en": "I cook rice for dinner.",
        "ex_dari": ""
      },
      {
        "id": "food_cooking_verbs_2",
        "en": "boil",
        "dari": "",
        "ex_en": "Boil the water first.",
        "ex_dari": ""
      },
      {
        "id": "food_cooking_verbs_3",
        "en": "fry",
        "dari": "",
        "ex_en": "Fry the onions in oil.",
        "ex_dari": ""
      },
      {
        "id": "food_cooking_verbs_4",
        "en": "cut",
        "dari": "",
        "ex_en": "Cut the potatoes slowly.",
        "ex_dari": ""
      },
      {
        "id": "food_cooking_verbs_5",
        "en": "mix",
        "dari": "",
        "ex_en": "Mix the flour and water.",
        "ex_dari": ""
      },
      {
        "id": "food_cooking_verbs_6",
        "en": "taste",
        "dari": "",
        "ex_en": "Taste the soup before serving.",
        "ex_dari": ""
      },
      {
        "id": "food_cooking_verbs_7",
        "en": "serve",
        "dari": "",
        "ex_en": "Serve tea to the guests.",
        "ex_dari": ""
      },
      {
        "id": "food_cooking_verbs_8",
        "en": "wash",
        "dari": "",
        "ex_en": "Wash the vegetables first.",
        "ex_dari": ""
      },
      {
        "id": "food_cooking_verbs_9",
        "en": "bake",
        "dari": "",
        "ex_en": "Bake the bread until it is brown.",
        "ex_dari": ""
      },
      {
        "id": "food_cooking_verbs_10",
        "en": "add",
        "dari": "",
        "ex_en": "Add salt carefully.",
        "ex_dari": ""
      }
    ]
  },
  "ielts_speaking_words": {
    "en": "IELTS Speaking Words",
    "dari": "",
    "icon": "🎓",
    "words": [
      {
        "id": "ielts_speaking_words_1",
        "en": "describe",
        "dari": "",
        "ex_en": "Describe a place you like.",
        "ex_dari": ""
      },
      {
        "id": "ielts_speaking_words_2",
        "en": "opinion",
        "dari": "",
        "ex_en": "Give your opinion clearly.",
        "ex_dari": ""
      },
      {
        "id": "ielts_speaking_words_3",
        "en": "reason",
        "dari": "",
        "ex_en": "Explain your reason.",
        "ex_dari": ""
      },
      {
        "id": "ielts_speaking_words_4",
        "en": "example",
        "dari": "",
        "ex_en": "Give one example.",
        "ex_dari": ""
      },
      {
        "id": "ielts_speaking_words_5",
        "en": "compare",
        "dari": "",
        "ex_en": "Compare city life and village life.",
        "ex_dari": ""
      },
      {
        "id": "ielts_speaking_words_6",
        "en": "advantage",
        "dari": "",
        "ex_en": "One advantage is convenience.",
        "ex_dari": ""
      },
      {
        "id": "ielts_speaking_words_7",
        "en": "disadvantage",
        "dari": "",
        "ex_en": "A disadvantage is the high cost.",
        "ex_dari": ""
      },
      {
        "id": "ielts_speaking_words_8",
        "en": "experience",
        "dari": "",
        "ex_en": "Talk about your experience.",
        "ex_dari": ""
      },
      {
        "id": "ielts_speaking_words_9",
        "en": "memory",
        "dari": "",
        "ex_en": "This is a happy memory.",
        "ex_dari": ""
      },
      {
        "id": "ielts_speaking_words_10",
        "en": "future",
        "dari": "",
        "ex_en": "I want a better future.",
        "ex_dari": ""
      }
    ]
  },
  "academic_writing_words": {
    "en": "Academic Writing",
    "dari": "",
    "icon": "✍️",
    "words": [
      {
        "id": "academic_writing_words_1",
        "en": "research",
        "dari": "",
        "ex_en": "Research helps us understand problems.",
        "ex_dari": ""
      },
      {
        "id": "academic_writing_words_2",
        "en": "evidence",
        "dari": "",
        "ex_en": "Use evidence to support your idea.",
        "ex_dari": ""
      },
      {
        "id": "academic_writing_words_3",
        "en": "argument",
        "dari": "",
        "ex_en": "The argument is clear.",
        "ex_dari": ""
      },
      {
        "id": "academic_writing_words_4",
        "en": "source",
        "dari": "",
        "ex_en": "Use a reliable source.",
        "ex_dari": ""
      },
      {
        "id": "academic_writing_words_5",
        "en": "summary",
        "dari": "",
        "ex_en": "Write a short summary.",
        "ex_dari": ""
      },
      {
        "id": "academic_writing_words_6",
        "en": "conclusion",
        "dari": "",
        "ex_en": "The conclusion should be strong.",
        "ex_dari": ""
      },
      {
        "id": "academic_writing_words_7",
        "en": "paragraph",
        "dari": "",
        "ex_en": "Each paragraph has one main idea.",
        "ex_dari": ""
      },
      {
        "id": "academic_writing_words_8",
        "en": "topic sentence",
        "dari": "",
        "ex_en": "Start with a topic sentence.",
        "ex_dari": ""
      },
      {
        "id": "academic_writing_words_9",
        "en": "support",
        "dari": "",
        "ex_en": "Support your answer with examples.",
        "ex_dari": ""
      },
      {
        "id": "academic_writing_words_10",
        "en": "analyze",
        "dari": "",
        "ex_en": "Analyze the information carefully.",
        "ex_dari": ""
      }
    ]
  },
  "common_mistakes": {
    "en": "Common Mistake Fixes",
    "dari": "",
    "icon": "✅",
    "words": [
      {
        "id": "common_mistakes_1",
        "en": "I am agree",
        "dari": "",
        "ex_en": "Say: I agree.",
        "ex_dari": ""
      },
      {
        "id": "common_mistakes_2",
        "en": "discuss about",
        "dari": "",
        "ex_en": "Say: discuss the issue.",
        "ex_dari": ""
      },
      {
        "id": "common_mistakes_3",
        "en": "more better",
        "dari": "",
        "ex_en": "Say: better.",
        "ex_dari": ""
      },
      {
        "id": "common_mistakes_4",
        "en": "people is",
        "dari": "",
        "ex_en": "Say: people are.",
        "ex_dari": ""
      },
      {
        "id": "common_mistakes_5",
        "en": "he go",
        "dari": "",
        "ex_en": "Say: he goes.",
        "ex_dari": ""
      },
      {
        "id": "common_mistakes_6",
        "en": "yesterday I go",
        "dari": "",
        "ex_en": "Say: yesterday I went.",
        "ex_dari": ""
      },
      {
        "id": "common_mistakes_7",
        "en": "I have 20 years",
        "dari": "",
        "ex_en": "Say: I am 20 years old.",
        "ex_dari": ""
      },
      {
        "id": "common_mistakes_8",
        "en": "depends of",
        "dari": "",
        "ex_en": "Say: depends on.",
        "ex_dari": ""
      },
      {
        "id": "common_mistakes_9",
        "en": "married with",
        "dari": "",
        "ex_en": "Say: married to.",
        "ex_dari": ""
      },
      {
        "id": "common_mistakes_10",
        "en": "make a party",
        "dari": "",
        "ex_en": "Say: have a party.",
        "ex_dari": ""
      }
    ]
  },
  "islamic_daily_terms": {
    "en": "Daily Islamic Phrases",
    "dari": "",
    "icon": "☪️",
    "words": [
      {
        "id": "islamic_daily_terms_1",
        "en": "Bismillah",
        "dari": "",
        "ex_en": "Say Bismillah before starting.",
        "ex_dari": ""
      },
      {
        "id": "islamic_daily_terms_2",
        "en": "Alhamdulillah",
        "dari": "",
        "ex_en": "Alhamdulillah, we are thankful.",
        "ex_dari": ""
      },
      {
        "id": "islamic_daily_terms_3",
        "en": "Inshallah",
        "dari": "",
        "ex_en": "I will come tomorrow, Inshallah.",
        "ex_dari": ""
      },
      {
        "id": "islamic_daily_terms_4",
        "en": "Mashallah",
        "dari": "",
        "ex_en": "Mashallah, the child reads well.",
        "ex_dari": ""
      },
      {
        "id": "islamic_daily_terms_5",
        "en": "Assalamu alaikum",
        "dari": "",
        "ex_en": "Assalamu alaikum is a greeting.",
        "ex_dari": ""
      },
      {
        "id": "islamic_daily_terms_6",
        "en": "Wa alaikum salam",
        "dari": "",
        "ex_en": "Reply with wa alaikum salam.",
        "ex_dari": ""
      },
      {
        "id": "islamic_daily_terms_7",
        "en": "prayer",
        "dari": "",
        "ex_en": "Prayer is important in daily life.",
        "ex_dari": ""
      },
      {
        "id": "islamic_daily_terms_8",
        "en": "dua",
        "dari": "",
        "ex_en": "Make dua for your family.",
        "ex_dari": ""
      },
      {
        "id": "islamic_daily_terms_9",
        "en": "fasting",
        "dari": "",
        "ex_en": "Fasting teaches patience.",
        "ex_dari": ""
      },
      {
        "id": "islamic_daily_terms_10",
        "en": "charity",
        "dari": "",
        "ex_en": "Charity helps people in need.",
        "ex_dari": ""
      }
    ]
  },
  "natural_phrases": {
    "en": "Natural Daily Phrases",
    "dari": "",
    "icon": "💬",
    "words": [
      {
        "id": "natural_phrases_1",
        "en": "No problem",
        "dari": "",
        "ex_en": "No problem, I can help you.",
        "ex_dari": ""
      },
      {
        "id": "natural_phrases_2",
        "en": "That makes sense",
        "dari": "",
        "ex_en": "That makes sense to me.",
        "ex_dari": ""
      },
      {
        "id": "natural_phrases_3",
        "en": "I am not sure",
        "dari": "",
        "ex_en": "I am not sure about the answer.",
        "ex_dari": ""
      },
      {
        "id": "natural_phrases_4",
        "en": "Let me check",
        "dari": "",
        "ex_en": "Let me check my schedule.",
        "ex_dari": ""
      },
      {
        "id": "natural_phrases_5",
        "en": "I appreciate it",
        "dari": "",
        "ex_en": "I appreciate your help.",
        "ex_dari": ""
      },
      {
        "id": "natural_phrases_6",
        "en": "Take your time",
        "dari": "",
        "ex_en": "Take your time and speak slowly.",
        "ex_dari": ""
      },
      {
        "id": "natural_phrases_7",
        "en": "I understand",
        "dari": "",
        "ex_en": "I understand the instruction.",
        "ex_dari": ""
      },
      {
        "id": "natural_phrases_8",
        "en": "Can you clarify?",
        "dari": "",
        "ex_en": "Can you clarify this sentence?",
        "ex_dari": ""
      },
      {
        "id": "natural_phrases_9",
        "en": "Exactly",
        "dari": "",
        "ex_en": "Exactly, that is correct.",
        "ex_dari": ""
      },
      {
        "id": "natural_phrases_10",
        "en": "Not yet",
        "dari": "",
        "ex_en": "I am not ready yet.",
        "ex_dari": ""
      }
    ]
  },
  "pronunciation_minimal_pairs": {
    "en": "Pronunciation Pairs",
    "dari": "",
    "icon": "🔊",
    "words": [
      {
        "id": "pronunciation_minimal_pairs_1",
        "en": "ship / sheep",
        "dari": "",
        "ex_en": "Ship has a short sound; sheep has a long sound.",
        "ex_dari": ""
      },
      {
        "id": "pronunciation_minimal_pairs_2",
        "en": "sit / seat",
        "dari": "",
        "ex_en": "Sit is short; seat is long.",
        "ex_dari": ""
      },
      {
        "id": "pronunciation_minimal_pairs_3",
        "en": "full / fool",
        "dari": "",
        "ex_en": "Practice the vowel difference.",
        "ex_dari": ""
      },
      {
        "id": "pronunciation_minimal_pairs_4",
        "en": "live / leave",
        "dari": "",
        "ex_en": "Live is short; leave is long.",
        "ex_dari": ""
      },
      {
        "id": "pronunciation_minimal_pairs_5",
        "en": "walk / work",
        "dari": "",
        "ex_en": "Do not mix walk and work.",
        "ex_dari": ""
      },
      {
        "id": "pronunciation_minimal_pairs_6",
        "en": "very / wary",
        "dari": "",
        "ex_en": "Practice v and w carefully.",
        "ex_dari": ""
      },
      {
        "id": "pronunciation_minimal_pairs_7",
        "en": "three / tree",
        "dari": "",
        "ex_en": "Put your tongue between teeth for th.",
        "ex_dari": ""
      },
      {
        "id": "pronunciation_minimal_pairs_8",
        "en": "thin / tin",
        "dari": "",
        "ex_en": "Thin starts with th.",
        "ex_dari": ""
      },
      {
        "id": "pronunciation_minimal_pairs_9",
        "en": "rice / rise",
        "dari": "",
        "ex_en": "Rice ends with s sound; rise ends with z sound.",
        "ex_dari": ""
      },
      {
        "id": "pronunciation_minimal_pairs_10",
        "en": "cap / cup",
        "dari": "",
        "ex_en": "Listen to the vowel sound.",
        "ex_dari": ""
      }
    ]
  }
});

WORD_OF_DAY.push(...[
  {
    "en": "consistent",
    "dari": "",
    "pos": "adjective",
    "ex_en": "Consistent practice brings progress.",
    "ex_dari": ""
  },
  {
    "en": "responsibility",
    "dari": "",
    "pos": "noun",
    "ex_en": "Responsibility makes a person stronger.",
    "ex_dari": ""
  },
  {
    "en": "respectful",
    "dari": "",
    "pos": "adjective",
    "ex_en": "Speak in a respectful way.",
    "ex_dari": ""
  },
  {
    "en": "independent",
    "dari": "",
    "pos": "adjective",
    "ex_en": "Learning English helps me become more independent.",
    "ex_dari": ""
  },
  {
    "en": "reliable",
    "dari": "",
    "pos": "adjective",
    "ex_en": "A reliable worker comes on time.",
    "ex_dari": ""
  },
  {
    "en": "adjust",
    "dari": "",
    "pos": "verb",
    "ex_en": "I need to adjust my schedule.",
    "ex_dari": ""
  },
  {
    "en": "improve",
    "dari": "",
    "pos": "verb",
    "ex_en": "I want to improve my pronunciation.",
    "ex_dari": ""
  },
  {
    "en": "communicate",
    "dari": "",
    "pos": "verb",
    "ex_en": "Clear words help us communicate.",
    "ex_dari": ""
  },
  {
    "en": "prepare",
    "dari": "",
    "pos": "verb",
    "ex_en": "Prepare your answer before speaking.",
    "ex_dari": ""
  },
  {
    "en": "support",
    "dari": "",
    "pos": "noun",
    "ex_en": "Family support gives courage.",
    "ex_dari": ""
  },
  {
    "en": "patient",
    "dari": "",
    "pos": "adjective",
    "ex_en": "Be patient with yourself while learning.",
    "ex_dari": ""
  },
  {
    "en": "available",
    "dari": "",
    "pos": "adjective",
    "ex_en": "The teacher is available after class.",
    "ex_dari": ""
  },
  {
    "en": "accurate",
    "dari": "",
    "pos": "adjective",
    "ex_en": "Try to give an accurate answer.",
    "ex_dari": ""
  },
  {
    "en": "confusion",
    "dari": "",
    "pos": "noun",
    "ex_en": "Ask questions to reduce confusion.",
    "ex_dari": ""
  },
  {
    "en": "solution",
    "dari": "",
    "pos": "noun",
    "ex_en": "Every problem needs a clear solution.",
    "ex_dari": ""
  },
  {
    "en": "generous",
    "dari": "",
    "pos": "adjective",
    "ex_en": "Generous people help others.",
    "ex_dari": ""
  },
  {
    "en": "discipline",
    "dari": "",
    "pos": "noun",
    "ex_en": "Discipline helps students succeed.",
    "ex_dari": ""
  },
  {
    "en": "priority",
    "dari": "",
    "pos": "noun",
    "ex_en": "Safety is our first priority.",
    "ex_dari": ""
  },
  {
    "en": "evidence",
    "dari": "",
    "pos": "noun",
    "ex_en": "Use evidence in academic writing.",
    "ex_dari": ""
  },
  {
    "en": "confidence",
    "dari": "",
    "pos": "noun",
    "ex_en": "Practice builds confidence.",
    "ex_dari": ""
  }
]);

LISTEN_SENTENCES.push(...[
  {
    "en": "I need help filling out this form.",
    "pashto": "زه د دې فورمې په ډکولو کې مرستې ته اړتیا لرم.",
    "dari": "زه د دې فورمې په ډکولو کې مرستې ته اړتیا لرم."
  },
  {
    "en": "Please speak slowly so I can understand.",
    "pashto": "مهرباني وکړئ ورو خبرې وکړئ، څو زه پوه شم.",
    "dari": "مهرباني وکړئ ورو خبرې وکړئ، څو زه پوه شم."
  },
  {
    "en": "I have an appointment tomorrow morning.",
    "pashto": "زه سبا سهار ملاقات لرم.",
    "dari": "زه سبا سهار ملاقات لرم."
  },
  {
    "en": "My child was absent because he was sick.",
    "pashto": "زما ماشوم غیر حاضر و، ځکه ناروغ و.",
    "dari": "زما ماشوم غیر حاضر و، ځکه ناروغ و."
  },
  {
    "en": "Can you show me where to sign?",
    "pashto": "ایا راته ښودلی شئ چې چېرته لاسلیک وکړم؟",
    "dari": "ایا راته ښودلی شئ چې چېرته لاسلیک وکړم؟"
  },
  {
    "en": "I am looking for a full-time job.",
    "pashto": "زه د پوره وخت کار په لټه کې یم.",
    "dari": "زه د پوره وخت کار په لټه کې یم."
  },
  {
    "en": "The bus is late because of traffic.",
    "pashto": "بس د ټرافیک له امله ناوخته دی.",
    "dari": "بس د ټرافیک له امله ناوخته دی."
  },
  {
    "en": "I would like to open a bank account.",
    "pashto": "زه غواړم بانکي حساب پرانیزم.",
    "dari": "زه غواړم بانکي حساب پرانیزم."
  },
  {
    "en": "This medicine should be taken after food.",
    "pashto": "دا درمل باید له خوړو وروسته وخوړل شي.",
    "dari": "دا درمل باید له خوړو وروسته وخوړل شي."
  },
  {
    "en": "Please send the document by email.",
    "pashto": "مهرباني وکړئ سند د ایمیل له لارې ولېږئ.",
    "dari": "مهرباني وکړئ سند د ایمیل له لارې ولېږئ."
  },
  {
    "en": "I want to improve my English speaking.",
    "pashto": "زه غواړم خپلې انګلیسي خبرې کول ښه کړم.",
    "dari": "زه غواړم خپلې انګلیسي خبرې کول ښه کړم."
  },
  {
    "en": "The teacher gave my son homework.",
    "pashto": "ښوونکي زما زوی ته کورنی کار ورکړ.",
    "dari": "ښوونکي زما زوی ته کورنی کار ورکړ."
  },
  {
    "en": "We need rice, oil, tea, and sugar.",
    "pashto": "موږ وریجو، غوړو، چای او بورې ته اړتیا لرو.",
    "dari": "موږ وریجو، غوړو، چای او بورې ته اړتیا لرو."
  },
  {
    "en": "The rent is due on the first of the month.",
    "pashto": "کرایه د میاشتې په لومړۍ نېټه ورکول کېږي.",
    "dari": "کرایه د میاشتې په لومړۍ نېټه ورکول کېږي."
  },
  {
    "en": "I am sorry, I did not understand the question.",
    "pashto": "بښنه غواړم، زه په پوښتنه پوه نه شوم.",
    "dari": "بښنه غواړم، زه په پوښتنه پوه نه شوم."
  },
  {
    "en": "Could you repeat the address one more time?",
    "pashto": "ایا پته یو ځل بیا تکرارولی شئ؟",
    "dari": "ایا پته یو ځل بیا تکرارولی شئ؟"
  },
  {
    "en": "My phone battery is almost empty.",
    "pashto": "زما د ټیلیفون بیټرۍ نږدې خلاصه ده.",
    "dari": "زما د ټیلیفون بیټرۍ نږدې خلاصه ده."
  },
  {
    "en": "The clinic is closed on Sunday.",
    "pashto": "کلینیک د یکشنبې په ورځ تړلی وي.",
    "dari": "کلینیک د یکشنبې په ورځ تړلی وي."
  },
  {
    "en": "I need a warmer jacket for winter.",
    "pashto": "زه د ژمي لپاره تود جاکټ ته اړتیا لرم.",
    "dari": "زه د ژمي لپاره تود جاکټ ته اړتیا لرم."
  },
  {
    "en": "The children are learning new words every day.",
    "pashto": "ماشومان هره ورځ نوې کلمې زده کوي.",
    "dari": "ماشومان هره ورځ نوې کلمې زده کوي."
  },
  {
    "en": "I will call you after work.",
    "pashto": "زه به له کار وروسته تاسو ته زنګ ووهم.",
    "dari": "زه به له کار وروسته تاسو ته زنګ ووهم."
  },
  {
    "en": "Please write the instructions clearly.",
    "pashto": "مهرباني وکړئ لارښوونې په روښانه ډول ولیکئ.",
    "dari": "مهرباني وکړئ لارښوونې په روښانه ډول ولیکئ."
  },
  {
    "en": "We visited our relatives on Eid.",
    "pashto": "موږ په اختر کې خپلو خپلوانو ته ورغلو.",
    "dari": "موږ په اختر کې خپلو خپلوانو ته ورغلو."
  },
  {
    "en": "The shop is near the bus stop.",
    "pashto": "دوکان د بس تمځای ته نږدې دی.",
    "dari": "دوکان د بس تمځای ته نږدې دی."
  },
  {
    "en": "I need to speak with the manager.",
    "pashto": "زه اړتیا لرم له مدیر سره خبرې وکړم.",
    "dari": "زه اړتیا لرم له مدیر سره خبرې وکړم."
  },
  {
    "en": "This price is too high for my budget.",
    "pashto": "دا بیه زما د بودجې لپاره ډېره لوړه ده.",
    "dari": "دا بیه زما د بودجې لپاره ډېره لوړه ده."
  },
  {
    "en": "My daughter likes reading story books.",
    "pashto": "زما لور د کیسو کتابونه لوستل خوښوي.",
    "dari": "زما لور د کیسو کتابونه لوستل خوښوي."
  },
  {
    "en": "We should save water and electricity.",
    "pashto": "موږ باید اوبه او برېښنا وساتو.",
    "dari": "موږ باید اوبه او برېښنا وساتو."
  },
  {
    "en": "The road is slippery because of snow.",
    "pashto": "سړک د واورې له امله ښوی دی.",
    "dari": "سړک د واورې له امله ښوی دی."
  },
  {
    "en": "I practice pronunciation for ten minutes.",
    "pashto": "زه لس دقیقې تلفظ تمرینوم.",
    "dari": "زه لس دقیقې تلفظ تمرینوم."
  },
  {
    "en": "Please check my application status.",
    "pashto": "مهرباني وکړئ زما د غوښتنلیک حالت وګورئ.",
    "dari": "مهرباني وکړئ زما د غوښتنلیک حالت وګورئ."
  },
  {
    "en": "The meeting starts at nine o'clock.",
    "pashto": "غونډه په نهو بجو پیلېږي.",
    "dari": "غونډه په نهو بجو پیلېږي."
  },
  {
    "en": "I can work on weekends if needed.",
    "pashto": "که اړتیا وي، زه د اونۍ په پای کې کار کولی شم.",
    "dari": "که اړتیا وي، زه د اونۍ په پای کې کار کولی شم."
  },
  {
    "en": "The child has a fever and cough.",
    "pashto": "ماشوم تبه او ټوخی لري.",
    "dari": "ماشوم تبه او ټوخی لري."
  },
  {
    "en": "Do I need to bring any documents?",
    "pashto": "ایا زه باید کوم اسناد راوړم؟",
    "dari": "ایا زه باید کوم اسناد راوړم؟"
  },
  {
    "en": "My family is grateful for your help.",
    "pashto": "زما کورنۍ ستاسو د مرستې منندویه ده.",
    "dari": "زما کورنۍ ستاسو د مرستې منندویه ده."
  },
  {
    "en": "I want to learn English for my future.",
    "pashto": "زه غواړم د خپل راتلونکي لپاره انګلیسي زده کړم.",
    "dari": "زه غواړم د خپل راتلونکي لپاره انګلیسي زده کړم."
  },
  {
    "en": "This lesson is difficult but useful.",
    "pashto": "دا درس ستونزمن دی، خو ګټور دی.",
    "dari": "دا درس ستونزمن دی، خو ګټور دی."
  },
  {
    "en": "Please give me a receipt.",
    "pashto": "مهرباني وکړئ ماته رسید راکړئ.",
    "dari": "مهرباني وکړئ ماته رسید راکړئ."
  },
  {
    "en": "I need to change my appointment time.",
    "pashto": "زه اړتیا لرم د خپل ملاقات وخت بدل کړم.",
    "dari": "زه اړتیا لرم د خپل ملاقات وخت بدل کړم."
  },
  {
    "en": "The office is on the second floor.",
    "pashto": "دفتر په دویم پوړ کې دی.",
    "dari": "دفتر په دویم پوړ کې دی."
  },
  {
    "en": "My neighbor helped me with the letter.",
    "pashto": "زما ګاونډي له ما سره په لیک کې مرسته وکړه.",
    "dari": "زما ګاونډي له ما سره په لیک کې مرسته وکړه."
  },
  {
    "en": "We are planning a small family dinner.",
    "pashto": "موږ د کورنۍ یوه کوچنۍ ماښامنۍ پلان کوو.",
    "dari": "موږ د کورنۍ یوه کوچنۍ ماښامنۍ پلان کوو."
  },
  {
    "en": "Can you explain this word in simple English?",
    "pashto": "ایا دا کلمه په ساده انګلیسي تشریح کولی شئ؟",
    "dari": "ایا دا کلمه په ساده انګلیسي تشریح کولی شئ؟"
  },
  {
    "en": "I sent the form yesterday afternoon.",
    "pashto": "ما فورمه پرون ماسپښین ولېږله.",
    "dari": "ما فورمه پرون ماسپښین ولېږله."
  },
  {
    "en": "The pharmacy opens at eight in the morning.",
    "pashto": "درملتون سهار په اتو بجو پرانیستل کېږي.",
    "dari": "درملتون سهار په اتو بجو پرانیستل کېږي."
  },
  {
    "en": "Do not share your password with anyone.",
    "pashto": "خپل پټ نوم له هیچا سره مه شریکوئ.",
    "dari": "خپل پټ نوم له هیچا سره مه شریکوئ."
  },
  {
    "en": "I am proud of my son's progress.",
    "pashto": "زه د خپل زوی په پرمختګ ویاړم.",
    "dari": "زه د خپل زوی په پرمختګ ویاړم."
  },
  {
    "en": "The weather forecast says it will rain.",
    "pashto": "د هوا وړاندوینه وايي چې باران به وشي.",
    "dari": "د هوا وړاندوینه وايي چې باران به وشي."
  },
  {
    "en": "Let's practice this sentence one more time.",
    "pashto": "راځئ دا جمله یو ځل بیا تمرین کړو.",
    "dari": "راځئ دا جمله یو ځل بیا تمرین کړو."
  },
  {
    "en": "Can you help me with transportation?",
    "pashto": "ایا له ما سره د ترانسپورت په برخه کې مرسته کولی شئ؟",
    "dari": "ایا له ما سره د ترانسپورت په برخه کې مرسته کولی شئ؟"
  },
  {
    "en": "I need directions to the nearest hospital.",
    "pashto": "زه تر ټولو نږدې روغتون ته د لارې لارښوونې ته اړتیا لرم.",
    "dari": "زه تر ټولو نږدې روغتون ته د لارې لارښوونې ته اړتیا لرم."
  },
  {
    "en": "The teacher asked us to read aloud.",
    "pashto": "ښوونکي له موږ وغوښتل چې په لوړ غږ ولولو.",
    "dari": "ښوونکي له موږ وغوښتل چې په لوړ غږ ولولو."
  },
  {
    "en": "Please tell me the total cost.",
    "pashto": "مهرباني وکړئ ټول لګښت راته ووایئ.",
    "dari": "مهرباني وکړئ ټول لګښت راته ووایئ."
  },
  {
    "en": "I have experience working with customers.",
    "pashto": "زه له پېرېدونکو سره د کار تجربه لرم.",
    "dari": "زه له پېرېدونکو سره د کار تجربه لرم."
  },
  {
    "en": "I am available to start next week.",
    "pashto": "زه راتلونکې اونۍ د پیل لپاره چمتو یم.",
    "dari": "زه راتلونکې اونۍ د پیل لپاره چمتو یم."
  },
  {
    "en": "My child needs extra help with reading.",
    "pashto": "زما ماشوم په لوستلو کې اضافي مرستې ته اړتیا لري.",
    "dari": "زما ماشوم په لوستلو کې اضافي مرستې ته اړتیا لري."
  },
  {
    "en": "I forgot my appointment card at home.",
    "pashto": "ما خپل د ملاقات کارت په کور کې هېر کړی دی.",
    "dari": "ما خپل د ملاقات کارت په کور کې هېر کړی دی."
  },
  {
    "en": "Could you print this document for me?",
    "pashto": "ایا دا سند راته چاپولی شئ؟",
    "dari": "ایا دا سند راته چاپولی شئ؟"
  },
  {
    "en": "I prefer morning classes because I work at night.",
    "pashto": "زه د سهار ټولګي غوره ګڼم، ځکه چې د شپې کار کوم.",
    "dari": "زه د سهار ټولګي غوره ګڼم، ځکه چې د شپې کار کوم."
  },
  {
    "en": "The landlord will send someone for repairs.",
    "pashto": "د کور مالک به د ترمیم لپاره یو څوک راولېږي.",
    "dari": "د کور مالک به د ترمیم لپاره یو څوک راولېږي."
  },
  {
    "en": "We should arrive fifteen minutes early.",
    "pashto": "موږ باید پنځلس دقیقې مخکې ورسېږو.",
    "dari": "موږ باید پنځلس دقیقې مخکې ورسېږو."
  },
  {
    "en": "My English is not perfect, but I am improving.",
    "pashto": "زما انګلیسي پوره نه ده، خو ښه کېږم.",
    "dari": "زما انګلیسي پوره نه ده، خو ښه کېږم."
  },
  {
    "en": "Please use simple words when you speak.",
    "pashto": "مهرباني وکړئ د خبرو پر وخت ساده کلمې وکاروئ.",
    "dari": "مهرباني وکړئ د خبرو پر وخت ساده کلمې وکاروئ."
  },
  {
    "en": "I need to buy school supplies for my children.",
    "pashto": "زه باید د خپلو ماشومانو لپاره د ښوونځي سامان واخلم.",
    "dari": "زه باید د خپلو ماشومانو لپاره د ښوونځي سامان واخلم."
  },
  {
    "en": "The community center has free English classes.",
    "pashto": "د ټولنې مرکز وړیا د انګلیسي ټولګي لري.",
    "dari": "د ټولنې مرکز وړیا د انګلیسي ټولګي لري."
  },
  {
    "en": "I want to volunteer in my neighborhood.",
    "pashto": "زه غواړم په خپل ګاونډ کې رضاکارانه کار وکړم.",
    "dari": "زه غواړم په خپل ګاونډ کې رضاکارانه کار وکړم."
  },
  {
    "en": "Safety rules are important for everyone.",
    "pashto": "د خوندیتوب اصول د هر چا لپاره مهم دي.",
    "dari": "د خوندیتوب اصول د هر چا لپاره مهم دي."
  },
  {
    "en": "The medicine label is difficult to read.",
    "pashto": "د درملو لیبل لوستل ستونزمن دي.",
    "dari": "د درملو لیبل لوستل ستونزمن دي."
  },
  {
    "en": "I need more practice with long sentences.",
    "pashto": "زه د اوږدو جملو لپاره لا ډېر تمرین ته اړتیا لرم.",
    "dari": "زه د اوږدو جملو لپاره لا ډېر تمرین ته اړتیا لرم."
  },
  {
    "en": "My goal is to speak clearly and confidently.",
    "pashto": "زما موخه دا ده چې روښانه او په ډاډ سره خبرې وکړم.",
    "dari": "زما موخه دا ده چې روښانه او په ډاډ سره خبرې وکړم."
  },
  {
    "en": "The children cleaned their room before dinner.",
    "pashto": "ماشومانو له ماښامنۍ مخکې خپله کوټه پاکه کړه.",
    "dari": "ماشومانو له ماښامنۍ مخکې خپله کوټه پاکه کړه."
  },
  {
    "en": "We made bolani for our guests.",
    "pashto": "موږ د خپلو مېلمنو لپاره بولاني پخه کړه.",
    "dari": "موږ د خپلو مېلمنو لپاره بولاني پخه کړه."
  },
  {
    "en": "The phone call was difficult, but I understood most of it.",
    "pashto": "ټیلیفوني خبرې ستونزمنې وې، خو ما یې ډېره برخه درک کړه.",
    "dari": "ټیلیفوني خبرې ستونزمنې وې، خو ما یې ډېره برخه درک کړه."
  },
  {
    "en": "Please check if my name is spelled correctly.",
    "pashto": "مهرباني وکړئ وګورئ چې زما نوم سم لیکل شوی که نه.",
    "dari": "مهرباني وکړئ وګورئ چې زما نوم سم لیکل شوی که نه."
  },
  {
    "en": "I need a copy of my medical record.",
    "pashto": "زه د خپلې طبي دوسیې یوې کاپي ته اړتیا لرم.",
    "dari": "زه د خپلې طبي دوسیې یوې کاپي ته اړتیا لرم."
  },
  {
    "en": "This bus route goes to the train station.",
    "pashto": "دا د بس لاره د ریل تمځای ته ځي.",
    "dari": "دا د بس لاره د ریل تمځای ته ځي."
  },
  {
    "en": "A polite question can solve many problems.",
    "pashto": "یوه مؤدبانه پوښتنه ډېرې ستونزې حلولی شي.",
    "dari": "یوه مؤدبانه پوښتنه ډېرې ستونزې حلولی شي."
  },
  {
    "en": "The new word of the day is useful.",
    "pashto": "د نن ورځې نوې کلمه ګټوره ده.",
    "dari": "د نن ورځې نوې کلمه ګټوره ده."
  },
  {
    "en": "I will practice again until my score improves.",
    "pashto": "زه به بیا تمرین وکړم، تر څو زما نمره ښه شي.",
    "dari": "زه به بیا تمرین وکړم، تر څو زما نمره ښه شي."
  },
  {
    "en": "Can I pay with cash or card?",
    "pashto": "ایا زه په نغدو پیسو یا کارت پیسې ورکولی شم؟",
    "dari": "ایا زه په نغدو پیسو یا کارت پیسې ورکولی شم؟"
  },
  {
    "en": "The doctor asked me to drink more water.",
    "pashto": "ډاکټر له ما وغوښتل چې ډېرې اوبه وڅښم.",
    "dari": "ډاکټر له ما وغوښتل چې ډېرې اوبه وڅښم."
  },
  {
    "en": "The school sent a message to parents.",
    "pashto": "ښوونځي والدینو ته پیغام واستاوه.",
    "dari": "ښوونځي والدینو ته پیغام واستاوه."
  },
  {
    "en": "We should respect people from different cultures.",
    "pashto": "موږ باید د بېلابېلو کلتورونو د خلکو درناوی وکړو.",
    "dari": "موږ باید د بېلابېلو کلتورونو د خلکو درناوی وکړو."
  },
  {
    "en": "I need to practice listening before speaking.",
    "pashto": "زه باید له خبرو مخکې د اورېدلو تمرین وکړم.",
    "dari": "زه باید له خبرو مخکې د اورېدلو تمرین وکړم."
  },
  {
    "en": "The app helps me study at home.",
    "pashto": "دا اپ له ما سره په کور کې د زده کړې مرسته کوي.",
    "dari": "دا اپ له ما سره په کور کې د زده کړې مرسته کوي."
  },
  {
    "en": "I made a mistake, but I learned from it.",
    "pashto": "ما تېروتنه وکړه، خو له هغې مې زده کړه وکړه.",
    "dari": "ما تېروتنه وکړه، خو له هغې مې زده کړه وکړه."
  },
  {
    "en": "Good pronunciation takes time and patience.",
    "pashto": "ښه تلفظ وخت او صبر غواړي.",
    "dari": "ښه تلفظ وخت او صبر غواړي."
  },
  {
    "en": "Please show me the correct answer.",
    "pashto": "مهرباني وکړئ سم ځواب راته وښایئ.",
    "dari": "مهرباني وکړئ سم ځواب راته وښایئ."
  },
  {
    "en": "I can understand better when I hear it twice.",
    "pashto": "کله چې یې دوه ځله واورم، ښه پرې پوهېږم.",
    "dari": "کله چې یې دوه ځله واورم، ښه پرې پوهېږم."
  },
  {
    "en": "The customer asked for a refund politely.",
    "pashto": "پېرېدونکي په ادب سره د پیسو بېرته ورکولو غوښتنه وکړه.",
    "dari": "پېرېدونکي په ادب سره د پیسو بېرته ورکولو غوښتنه وکړه."
  },
  {
    "en": "I want to describe my hometown in English.",
    "pashto": "زه غواړم خپل اصلي ښار په انګلیسي کې تشریح کړم.",
    "dari": "زه غواړم خپل اصلي ښار په انګلیسي کې تشریح کړم."
  },
  {
    "en": "The library card is free for residents.",
    "pashto": "د کتابتون کارت د اوسېدونکو لپاره وړیا دی.",
    "dari": "د کتابتون کارت د اوسېدونکو لپاره وړیا دی."
  },
  {
    "en": "I should not be afraid of small mistakes.",
    "pashto": "زه باید له کوچنیو تېروتنو و نه وېرېږم.",
    "dari": "زه باید له کوچنیو تېروتنو و نه وېرېږم."
  },
  {
    "en": "My teacher corrected my sentence kindly.",
    "pashto": "زما ښوونکي زما جمله په مهربانۍ سره سمه کړه.",
    "dari": "زما ښوونکي زما جمله په مهربانۍ سره سمه کړه."
  },
  {
    "en": "The traffic light is red, so we must stop.",
    "pashto": "د ترافیک څراغ سور دی، نو موږ باید ودرېږو.",
    "dari": "د ترافیک څراغ سور دی، نو موږ باید ودرېږو."
  },
  {
    "en": "This exercise improves speaking fluency.",
    "pashto": "دا تمرین د خبرو روانوالی ښه کوي.",
    "dari": "دا تمرین د خبرو روانوالی ښه کوي."
  },
  {
    "en": "My family eats dinner together every Friday.",
    "pashto": "زما کورنۍ هره جمعه یو ځای ماښامنۍ خوري.",
    "dari": "زما کورنۍ هره جمعه یو ځای ماښامنۍ خوري."
  },
  {
    "en": "The neighbor invited us for tea.",
    "pashto": "ګاونډي موږ چای ته راوبللو.",
    "dari": "ګاونډي موږ چای ته راوبللو."
  },
  {
    "en": "I need to learn common workplace phrases.",
    "pashto": "زه باید د کار ځای عامې جملې زده کړم.",
    "dari": "زه باید د کار ځای عامې جملې زده کړم."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله په روښانه ډول ویلی شم.",
    "dari": "زه دا جمله په روښانه ډول ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم.",
    "dari": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله په روښانه ډول ویلی شم.",
    "dari": "زه دا جمله په روښانه ډول ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم.",
    "dari": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله په روښانه ډول ویلی شم.",
    "dari": "زه دا جمله په روښانه ډول ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم.",
    "dari": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله په روښانه ډول ویلی شم.",
    "dari": "زه دا جمله په روښانه ډول ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم.",
    "dari": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله په روښانه ډول ویلی شم.",
    "dari": "زه دا جمله په روښانه ډول ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي له ویلو وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم.",
    "dari": "زه د انګلیسي ویلو پر مهال باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې له ما سره د نوو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین له ما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله په روښانه ډول ویلی شم.",
    "dari": "زه دا جمله په روښانه ډول ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم.",
    "dari": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله روښانه ویلی شم.",
    "dari": "زه دا جمله روښانه ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم.",
    "dari": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله روښانه ویلی شم.",
    "dari": "زه دا جمله روښانه ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم.",
    "dari": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله روښانه ویلی شم.",
    "dari": "زه دا جمله روښانه ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم.",
    "dari": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  },
  {
    "en": "I can say this sentence clearly.",
    "pashto": "زه دا جمله روښانه ویلی شم.",
    "dari": "زه دا جمله روښانه ویلی شم."
  },
  {
    "en": "I will repeat the sentence after the teacher.",
    "pashto": "زه به جمله د ښوونکي وروسته تکرار کړم.",
    "dari": "زه به جمله د ښوونکي وروسته تکرار کړم."
  },
  {
    "en": "The answer should be short and clear.",
    "pashto": "ځواب باید لنډ او روښانه وي.",
    "dari": "ځواب باید لنډ او روښانه وي."
  },
  {
    "en": "I need confidence when I speak English.",
    "pashto": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم.",
    "dari": "کله چې انګلیسي خبرې کوم، پر ځان باور ته اړتیا لرم."
  },
  {
    "en": "Today I learned five useful words.",
    "pashto": "نن مې پنځه ګټورې کلمې زده کړې.",
    "dari": "نن مې پنځه ګټورې کلمې زده کړې."
  },
  {
    "en": "Tomorrow I will review my weak words.",
    "pashto": "سبا به خپلې کمزورې کلمې بیا تکرار کړم.",
    "dari": "سبا به خپلې کمزورې کلمې بیا تکرار کړم."
  },
  {
    "en": "The story helped me understand new vocabulary.",
    "pashto": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه.",
    "dari": "کیسې زما سره د نويو لغتونو په پوهېدو کې مرسته وکړه."
  },
  {
    "en": "The topic practice helped me speak longer.",
    "pashto": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم.",
    "dari": "د موضوع تمرین زما سره مرسته وکړه چې اوږدې خبرې وکړم."
  },
  {
    "en": "I should listen first and then repeat.",
    "pashto": "زه باید لومړی واورم او بیا تکرار کړم.",
    "dari": "زه باید لومړی واورم او بیا تکرار کړم."
  },
  {
    "en": "My pronunciation is getting better every week.",
    "pashto": "زما تلفظ هره اونۍ ښه کېږي.",
    "dari": "زما تلفظ هره اونۍ ښه کېږي."
  }
]);

PLACEMENT_QUESTIONS.push(...[
  {
    "q": "What is the opposite of hot?",
    "qd": "",
    "options": [
      "cold",
      "warm",
      "big",
      "fast"
    ],
    "correct": 0
  },
  {
    "q": "Choose the correct sentence.",
    "qd": "",
    "options": [
      "He go to school.",
      "He goes to school.",
      "He going school.",
      "He gone school."
    ],
    "correct": 1
  },
  {
    "q": "What do you say when you need help?",
    "qd": "",
    "options": [
      "Go away",
      "Help me please",
      "I no like",
      "Tomorrow yesterday"
    ],
    "correct": 1
  },
  {
    "q": "Which word means دوا?",
    "qd": "",
    "options": [
      "medicine",
      "market",
      "teacher",
      "weather"
    ],
    "correct": 0
  },
  {
    "q": "Complete: I ___ from Afghanistan.",
    "qd": "",
    "options": [
      "am",
      "is",
      "are",
      "be"
    ],
    "correct": 0
  },
  {
    "q": "Which sentence is polite?",
    "qd": "",
    "options": [
      "Give me now",
      "Can you help me, please?",
      "You must help",
      "I want fast"
    ],
    "correct": 1
  },
  {
    "q": "What is a library?",
    "qd": "",
    "options": [
      "A place for books",
      "A kind of food",
      "A bus route",
      "A doctor"
    ],
    "correct": 0
  },
  {
    "q": "Choose the past tense of go.",
    "qd": "",
    "options": [
      "goed",
      "goes",
      "went",
      "going"
    ],
    "correct": 2
  },
  {
    "q": "Which word is about family?",
    "qd": "",
    "options": [
      "uncle",
      "receipt",
      "traffic",
      "tablet"
    ],
    "correct": 0
  },
  {
    "q": "Complete: She ___ English every day.",
    "qd": "",
    "options": [
      "study",
      "studies",
      "studying",
      "studied yesterday"
    ],
    "correct": 1
  },
  {
    "q": "What should you do before signing a form?",
    "qd": "",
    "options": [
      "Read it carefully",
      "Throw it away",
      "Hide it",
      "Sleep"
    ],
    "correct": 0
  },
  {
    "q": "Choose the best response: Thank you.",
    "qd": "",
    "options": [
      "You're welcome",
      "No English",
      "Why",
      "Late"
    ],
    "correct": 0
  },
  {
    "q": "Which word means مصئونیت?",
    "qd": "",
    "options": [
      "safety",
      "salary",
      "sugar",
      "story"
    ],
    "correct": 0
  },
  {
    "q": "Complete: I have lived here ___ two years.",
    "qd": "",
    "options": [
      "since",
      "for",
      "at",
      "on"
    ],
    "correct": 1
  },
  {
    "q": "Which sentence is correct?",
    "qd": "",
    "options": [
      "I am agree.",
      "I agree.",
      "I am agreeing opinion.",
      "I agree to him idea."
    ],
    "correct": 1
  },
  {
    "q": "What is a prescription?",
    "qd": "",
    "options": [
      "A doctor's medicine instruction",
      "A school bag",
      "A bus card",
      "A food item"
    ],
    "correct": 0
  },
  {
    "q": "Choose a word for پیشرفت.",
    "qd": "",
    "options": [
      "progress",
      "problem",
      "promise",
      "price"
    ],
    "correct": 0
  },
  {
    "q": "Complete: Could you speak more ___?",
    "qd": "",
    "options": [
      "slowly",
      "slow",
      "slowness",
      "slowed"
    ],
    "correct": 0
  },
  {
    "q": "Which phrase is formal?",
    "qd": "",
    "options": [
      "Hey you",
      "I would like to ask",
      "Give me",
      "What up"
    ],
    "correct": 1
  },
  {
    "q": "What is the main idea of a paragraph?",
    "qd": "",
    "options": [
      "The most important point",
      "A random word",
      "Only the last letter",
      "A number"
    ],
    "correct": 0
  },
  {
    "q": "Choose the correct question.",
    "qd": "",
    "options": [
      "Where you live?",
      "Where do you live?",
      "Where living you?",
      "Where are live?"
    ],
    "correct": 1
  },
  {
    "q": "What is evidence?",
    "qd": "",
    "options": [
      "Information that supports an idea",
      "A kind of fruit",
      "A bus ticket",
      "A greeting"
    ],
    "correct": 0
  },
  {
    "q": "Complete: The children ___ playing outside.",
    "qd": "",
    "options": [
      "is",
      "am",
      "are",
      "be"
    ],
    "correct": 2
  },
  {
    "q": "Which answer is best for IELTS speaking?",
    "qd": "",
    "options": [
      "Yes.",
      "Yes, because it saves time and helps people learn.",
      "No idea.",
      "Maybe."
    ],
    "correct": 1
  },
  {
    "q": "What does reliable mean?",
    "qd": "",
    "options": [
      "Can be trusted",
      "Very expensive",
      "Difficult to read",
      "Full of water"
    ],
    "correct": 0
  },
  {
    "q": "Choose the correct past sentence.",
    "qd": "",
    "options": [
      "Yesterday I went to class.",
      "Yesterday I go to class.",
      "Yesterday I goes class.",
      "Yesterday going class."
    ],
    "correct": 0
  },
  {
    "q": "Which word is about health?",
    "qd": "",
    "options": [
      "fever",
      "invoice",
      "keyboard",
      "mountain"
    ],
    "correct": 0
  },
  {
    "q": "Complete: I am interested ___ learning English.",
    "qd": "",
    "options": [
      "in",
      "on",
      "at",
      "for"
    ],
    "correct": 0
  },
  {
    "q": "What should you say if you do not understand?",
    "qd": "",
    "options": [
      "Please repeat that slowly.",
      "Nothing.",
      "You are wrong.",
      "I sleep."
    ],
    "correct": 0
  },
  {
    "q": "Which sentence sounds natural?",
    "qd": "",
    "options": [
      "I have 25 years.",
      "I am 25 years old.",
      "I am 25 years age.",
      "I make 25 years."
    ],
    "correct": 1
  },
  {
    "q": "What is a deadline?",
    "qd": "",
    "options": [
      "The final time to finish something",
      "A kind of medicine",
      "A family member",
      "A road sign"
    ],
    "correct": 0
  },
  {
    "q": "Choose the correct future sentence.",
    "qd": "",
    "options": [
      "I will call you tomorrow.",
      "I call you yesterday.",
      "I calling tomorrow.",
      "I called tomorrow."
    ],
    "correct": 0
  },
  {
    "q": "Which word means بودجه?",
    "qd": "",
    "options": [
      "budget",
      "bridge",
      "bottle",
      "borrow"
    ],
    "correct": 0
  },
  {
    "q": "Complete: She is good ___ speaking English.",
    "qd": "",
    "options": [
      "at",
      "in",
      "on",
      "to"
    ],
    "correct": 0
  },
  {
    "q": "What is a supervisor?",
    "qd": "",
    "options": [
      "A person who manages workers",
      "A kind of food",
      "A bus driver only",
      "A child"
    ],
    "correct": 0
  },
  {
    "q": "Choose the sentence with clear meaning.",
    "qd": "",
    "options": [
      "I need help with this form.",
      "Help form need I.",
      "This need help me form.",
      "Form help with I."
    ],
    "correct": 0
  },
  {
    "q": "What does grateful mean?",
    "qd": "",
    "options": [
      "Thankful",
      "Angry",
      "Lost",
      "Late"
    ],
    "correct": 0
  },
  {
    "q": "Which is a complete sentence?",
    "qd": "",
    "options": [
      "Because I was tired.",
      "I went home because I was tired.",
      "When the bus.",
      "After class and."
    ],
    "correct": 1
  },
  {
    "q": "Complete: If I have a question, I ___ ask the teacher.",
    "qd": "",
    "options": [
      "will",
      "was",
      "been",
      "doing"
    ],
    "correct": 0
  },
  {
    "q": "What is the best way to improve speaking?",
    "qd": "",
    "options": [
      "Practice regularly",
      "Never speak",
      "Only read once",
      "Avoid mistakes always"
    ],
    "correct": 0
  }
]);
