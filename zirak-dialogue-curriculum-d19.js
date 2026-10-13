// ===================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// zirak-dialogue-curriculum-d19.js — Phase I6H-D19
// One governed Dialogue payload registered into ZirakCurriculumContent.
// This file does not create a second speech engine, ledger, resolver authority,
// profile model, or storage system. Candidate content remains owner-unapproved.
// ===================================================================
(function () {
  'use strict';

  var D19_VERSION = 'I6H-D19';
  var RECORD_VERSION = 'D19-1';
  var PATHWAYS = ['child','teen','general-adult','job-professional','academic-preparation'];
  var LEVEL_ORDER = ['starter','basic','beginner','elementary','intermediate','advanced','academic'];
  var LEVEL_SPECS = {
    starter:{turnCount:3,supportMode:'full-model',expectedResponseDemand:'words-or-one-short-sentence',estimatedMinutes:5,scoringContractId:'d19-score-starter',speedProfile:'slow-clear'},
    basic:{turnCount:5,supportMode:'full-support',expectedResponseDemand:'one-short-complete-sentence',estimatedMinutes:7,scoringContractId:'d19-score-basic',speedProfile:'slow-natural'},
    beginner:{turnCount:7,supportMode:'partial-prompts',expectedResponseDemand:'one-to-two-sentences',estimatedMinutes:10,scoringContractId:'d19-score-beginner',speedProfile:'supported-natural'},
    elementary:{turnCount:9,supportMode:'reduced-prompts',expectedResponseDemand:'two-to-three-sentences-plus-followup',estimatedMinutes:13,scoringContractId:'d19-score-elementary',speedProfile:'natural-with-pauses'},
    intermediate:{turnCount:11,supportMode:'minimal-prompts',expectedResponseDemand:'natural-multi-sentence',estimatedMinutes:17,scoringContractId:'d19-score-intermediate',speedProfile:'natural'},
    advanced:{turnCount:13,supportMode:'scenario-only',expectedResponseDemand:'nuanced-response-register-control',estimatedMinutes:22,scoringContractId:'d19-score-advanced',speedProfile:'natural-varied'},
    academic:{turnCount:14,supportMode:'formal-task',expectedResponseDemand:'structured-evidence-based',estimatedMinutes:25,scoringContractId:'d19-score-academic',speedProfile:'formal-natural'}
  };

  var SCENARIOS = [
  {
    "level": "starter",
    "slug": "greetings-name",
    "themeId": "greetings",
    "titleEn": "Hello and My Name",
    "titlePashto": "سلام او زما نوم",
    "contextSummaryEn": "A first meeting in a safe learning space.",
    "contextSummaryPashto": "په خوندي زده کړه ځای کې لومړۍ پېژندنه.",
    "situation": "meeting a new class partner",
    "objective": "say hello and give a name",
    "issue": "the speakers have not met before",
    "choiceA": "say hello first",
    "choiceB": "ask the partner’s name",
    "reason": "a greeting begins the conversation",
    "evidence": "the partner answers warmly",
    "nextAction": "greet the partner and say a name",
    "simpleAnswer": "Hello. My name is Sam.",
    "detail": "both learners joined today",
    "vocabularyTargets": [
      "hello",
      "name",
      "nice",
      "meet"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "starter",
    "slug": "classroom-objects",
    "themeId": "classroom",
    "titleEn": "In the Classroom",
    "titlePashto": "په ټولګي کې",
    "contextSummaryEn": "The learner identifies simple classroom objects.",
    "contextSummaryPashto": "زده کوونکی د ټولګي ساده توکي پېژني.",
    "situation": "looking for a pencil in class",
    "objective": "name an object and ask for it",
    "issue": "the learner needs a pencil",
    "choiceA": "point to the pencil",
    "choiceB": "ask politely for the pencil",
    "reason": "the pencil is needed for writing",
    "evidence": "the pencil is on the desk",
    "nextAction": "ask for the pencil",
    "simpleAnswer": "This is a pencil.",
    "detail": "the book is beside it",
    "vocabularyTargets": [
      "pencil",
      "book",
      "desk",
      "please"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "starter",
    "slug": "family-members",
    "themeId": "family",
    "titleEn": "Meet My Family",
    "titlePashto": "زما له کورنۍ سره پېژندنه",
    "contextSummaryEn": "The learner names close family members.",
    "contextSummaryPashto": "زده کوونکی د کورنۍ نږدې غړي نوموي.",
    "situation": "showing a family picture",
    "objective": "say who one person is",
    "issue": "the partner points to a person",
    "choiceA": "name the mother",
    "choiceB": "name the brother",
    "reason": "one short sentence is enough",
    "evidence": "the family picture is clear",
    "nextAction": "name one family member",
    "simpleAnswer": "This is my mother.",
    "detail": "one brother is also in the picture",
    "vocabularyTargets": [
      "mother",
      "father",
      "brother",
      "family"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "starter",
    "slug": "food-likes",
    "themeId": "food",
    "titleEn": "Food I Like",
    "titlePashto": "زما خوښې خواړه",
    "contextSummaryEn": "The learner states a simple food preference.",
    "contextSummaryPashto": "زده کوونکی د خوښې خواړه په ساده ډول وایي.",
    "situation": "choosing between two foods",
    "objective": "say what food is liked",
    "issue": "the partner offers rice or soup",
    "choiceA": "choose rice",
    "choiceB": "choose soup",
    "reason": "a clear preference answers the question",
    "evidence": "rice is the learner’s favourite",
    "nextAction": "say the preferred food",
    "simpleAnswer": "I like rice.",
    "detail": "the learner also likes warm tea",
    "vocabularyTargets": [
      "like",
      "rice",
      "soup",
      "food"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "starter",
    "slug": "simple-needs",
    "themeId": "daily-life",
    "titleEn": "I Need Help",
    "titlePashto": "زه مرستې ته اړتیا لرم",
    "contextSummaryEn": "The learner asks for simple, safe help.",
    "contextSummaryPashto": "زده کوونکی په ساده او خوندي ډول مرسته غواړي.",
    "situation": "a bag is too heavy",
    "objective": "ask for help politely",
    "issue": "the learner cannot carry the bag alone",
    "choiceA": "ask a nearby adult for help",
    "choiceB": "leave the bag on the floor",
    "reason": "safe help is available nearby",
    "evidence": "the adult is ready to help",
    "nextAction": "ask for help",
    "simpleAnswer": "Please help me.",
    "detail": "the bag stays on the floor",
    "vocabularyTargets": [
      "help",
      "please",
      "bag",
      "heavy"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "starter",
    "slug": "home-location",
    "themeId": "community",
    "titleEn": "Where Is Home?",
    "titlePashto": "کور چېرته دی؟",
    "contextSummaryEn": "The learner gives a simple home location.",
    "contextSummaryPashto": "زده کوونکی د کور ساده ځای بیانوي.",
    "situation": "answering where home is",
    "objective": "say a familiar location",
    "issue": "the partner asks where the learner lives",
    "choiceA": "name the town",
    "choiceB": "name a nearby place",
    "reason": "a short location answer is sufficient",
    "evidence": "the home is near the school",
    "nextAction": "say the location",
    "simpleAnswer": "I live near the school.",
    "detail": "the walk is short",
    "vocabularyTargets": [
      "home",
      "live",
      "near",
      "school"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "starter",
    "slug": "feelings",
    "themeId": "health",
    "titleEn": "How I Feel",
    "titlePashto": "زه څنګه احساس کوم",
    "contextSummaryEn": "The learner names a basic feeling.",
    "contextSummaryPashto": "زده کوونکی یو بنسټیز احساس نوموي.",
    "situation": "answering a wellbeing question",
    "objective": "say how the learner feels",
    "issue": "the learner is a little tired",
    "choiceA": "say tired",
    "choiceB": "ask for water",
    "reason": "naming the feeling helps the partner respond",
    "evidence": "the learner walked a long way",
    "nextAction": "say the feeling clearly",
    "simpleAnswer": "I am tired.",
    "detail": "a short rest will help",
    "vocabularyTargets": [
      "happy",
      "tired",
      "fine",
      "feel"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "starter",
    "slug": "daily-routine",
    "themeId": "daily-life",
    "titleEn": "My Morning",
    "titlePashto": "زما سهار",
    "contextSummaryEn": "The learner names one morning action.",
    "contextSummaryPashto": "زده کوونکی د سهار یو کار نوموي.",
    "situation": "talking about a morning routine",
    "objective": "say what happens first",
    "issue": "the learner is getting ready",
    "choiceA": "wash the face",
    "choiceB": "eat breakfast",
    "reason": "one action shows the routine",
    "evidence": "breakfast follows washing",
    "nextAction": "say one morning action",
    "simpleAnswer": "I eat breakfast.",
    "detail": "the learner then goes to class",
    "vocabularyTargets": [
      "morning",
      "eat",
      "wash",
      "breakfast"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "basic",
    "slug": "polite-introduction",
    "themeId": "greetings",
    "titleEn": "A Polite Introduction",
    "titlePashto": "ادبناکه پېژندنه",
    "contextSummaryEn": "Two people introduce themselves and exchange one follow-up detail.",
    "contextSummaryPashto": "دوه کسان ځانونه معرفي کوي او یو لنډ معلومات شریکوي.",
    "situation": "joining a new learning group",
    "objective": "exchange names and one detail",
    "issue": "both speakers are new to the group",
    "choiceA": "ask where the partner is from",
    "choiceB": "ask what the partner studies",
    "reason": "a follow-up keeps the exchange natural",
    "evidence": "both attend the same class",
    "nextAction": "thank the partner and continue",
    "simpleAnswer": "My name is Amina, and I am from Kandahar.",
    "detail": "the first class begins soon",
    "vocabularyTargets": [
      "introduce",
      "from",
      "study",
      "welcome"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "basic",
    "slug": "buying-bread",
    "themeId": "shopping",
    "titleEn": "Buying Bread",
    "titlePashto": "ډوډۍ اخیستل",
    "contextSummaryEn": "The learner buys bread with a short polite exchange.",
    "contextSummaryPashto": "زده کوونکی په لنډه او ادبناکه خبرې ډوډۍ اخلي.",
    "situation": "buying bread for dinner",
    "objective": "ask for bread and confirm the amount",
    "issue": "the shop has two sizes",
    "choiceA": "buy two small loaves",
    "choiceB": "buy one large loaf",
    "reason": "the family needs enough bread for dinner",
    "evidence": "two small loaves are fresh",
    "nextAction": "pay and say thank you",
    "simpleAnswer": "I would like two loaves, please.",
    "detail": "the shopkeeper confirms the price",
    "vocabularyTargets": [
      "bread",
      "loaf",
      "please",
      "price"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "basic",
    "slug": "bus-time",
    "themeId": "transport",
    "titleEn": "Asking About the Bus",
    "titlePashto": "د بس په اړه پوښتنه",
    "contextSummaryEn": "The learner asks for a bus time and destination.",
    "contextSummaryPashto": "زده کوونکی د بس وخت او منزل پوښتي.",
    "situation": "checking a bus timetable",
    "objective": "ask when the bus leaves",
    "issue": "the printed timetable is unclear",
    "choiceA": "take the nine o’clock bus",
    "choiceB": "take the later bus",
    "reason": "the learner must arrive before class",
    "evidence": "the first bus reaches town on time",
    "nextAction": "confirm the stop and time",
    "simpleAnswer": "When does the bus leave for the city?",
    "detail": "the bus uses the main stop",
    "vocabularyTargets": [
      "bus",
      "leave",
      "stop",
      "time"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "basic",
    "slug": "school-timetable",
    "themeId": "classroom",
    "titleEn": "My Class Schedule",
    "titlePashto": "زما د ټولګي مهالویش",
    "contextSummaryEn": "The learner asks about a simple class schedule.",
    "contextSummaryPashto": "زده کوونکی د ټولګي ساده مهالویش پوښتي.",
    "situation": "checking the next class",
    "objective": "confirm the lesson and room",
    "issue": "two lessons appear on the board",
    "choiceA": "attend English first",
    "choiceB": "attend science first",
    "reason": "the learner wants the correct room",
    "evidence": "English starts at ten in room four",
    "nextAction": "write down the room number",
    "simpleAnswer": "What class do we have at ten?",
    "detail": "the next lesson lasts one hour",
    "vocabularyTargets": [
      "class",
      "schedule",
      "room",
      "start"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "basic",
    "slug": "family-weekend",
    "themeId": "family",
    "titleEn": "A Family Weekend Plan",
    "titlePashto": "د کورنۍ د رخصتۍ پلان",
    "contextSummaryEn": "Family members make a simple weekend plan.",
    "contextSummaryPashto": "د کورنۍ غړي د رخصتۍ یو ساده پلان جوړوي.",
    "situation": "choosing one family activity",
    "objective": "agree on an activity and time",
    "issue": "the weather may change later",
    "choiceA": "visit the park in the morning",
    "choiceB": "stay home and cook together",
    "reason": "the family wants time together",
    "evidence": "the morning forecast is clear",
    "nextAction": "confirm the time",
    "simpleAnswer": "Let us visit the park on Saturday morning.",
    "detail": "everyone is free before lunch",
    "vocabularyTargets": [
      "weekend",
      "park",
      "Saturday",
      "together"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "basic",
    "slug": "clinic-appointment",
    "themeId": "health",
    "titleEn": "Making a Clinic Appointment",
    "titlePashto": "د کلینیک وخت اخیستل",
    "contextSummaryEn": "The learner requests a simple clinic appointment.",
    "contextSummaryPashto": "زده کوونکی د کلینیک ساده وخت غواړي.",
    "situation": "calling a clinic for a check-up",
    "objective": "ask for an available time",
    "issue": "the morning schedule is full",
    "choiceA": "choose three in the afternoon",
    "choiceB": "choose the next morning",
    "reason": "the learner needs a routine check-up",
    "evidence": "there is an opening at three",
    "nextAction": "repeat the time and name",
    "simpleAnswer": "Can I have an appointment at three?",
    "detail": "the receptionist records the name",
    "vocabularyTargets": [
      "appointment",
      "clinic",
      "available",
      "afternoon"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "basic",
    "slug": "restaurant-order",
    "themeId": "food",
    "titleEn": "Ordering a Meal",
    "titlePashto": "خواړه فرمایش کول",
    "contextSummaryEn": "The learner orders a simple meal and drink.",
    "contextSummaryPashto": "زده کوونکی ساده خواړه او څښاک فرمایش کوي.",
    "situation": "ordering a light meal",
    "objective": "order food politely",
    "issue": "one dish is unavailable",
    "choiceA": "choose soup and tea",
    "choiceB": "choose rice and water",
    "reason": "the learner wants a light meal",
    "evidence": "soup is available today",
    "nextAction": "confirm the full order",
    "simpleAnswer": "I would like soup and tea, please.",
    "detail": "the server repeats the order",
    "vocabularyTargets": [
      "order",
      "soup",
      "tea",
      "available"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "basic",
    "slug": "neighbour-help",
    "themeId": "community",
    "titleEn": "Helping a Neighbour",
    "titlePashto": "له ګاونډي سره مرسته",
    "contextSummaryEn": "A neighbour asks for a small, safe favour.",
    "contextSummaryPashto": "ګاونډی د یوې کوچنۍ او خوندي مرستې غوښتنه کوي.",
    "situation": "moving a light box to the door",
    "objective": "offer simple help safely",
    "issue": "a second box is too heavy",
    "choiceA": "carry the light box together",
    "choiceB": "ask another adult about the heavy box",
    "reason": "the task should remain safe",
    "evidence": "the light box can be carried together",
    "nextAction": "agree on the safe action",
    "simpleAnswer": "I can help with the light box.",
    "detail": "the heavy box stays on the floor",
    "vocabularyTargets": [
      "neighbour",
      "box",
      "carry",
      "safe"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "travel-directions",
    "themeId": "transport",
    "titleEn": "Finding the Library",
    "titlePashto": "کتابتون پیدا کول",
    "contextSummaryEn": "The learner asks for directions and checks one landmark.",
    "contextSummaryPashto": "زده کوونکی د لارې پوښتنه کوي او یوه نښه تاییدوي.",
    "situation": "finding the public library",
    "objective": "ask for and repeat a route",
    "issue": "two streets have similar names",
    "choiceA": "turn left at the pharmacy",
    "choiceB": "continue to the mosque and turn right",
    "reason": "a landmark makes the route clearer",
    "evidence": "the library is beside the public garden",
    "nextAction": "repeat the route in order",
    "simpleAnswer": "First I go straight, then I turn left at the pharmacy.",
    "detail": "the walk takes about ten minutes",
    "vocabularyTargets": [
      "straight",
      "turn",
      "landmark",
      "beside"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "clothes-size-price",
    "themeId": "shopping",
    "titleEn": "Choosing a Jacket",
    "titlePashto": "کورتۍ غوره کول",
    "contextSummaryEn": "The learner asks about size, price, and another option.",
    "contextSummaryPashto": "زده کوونکی د اندازې، بیې او بل انتخاب په اړه پوښتي.",
    "situation": "choosing a suitable jacket",
    "objective": "compare fit and price",
    "issue": "the first jacket is too small",
    "choiceA": "try a larger blue jacket",
    "choiceB": "choose a cheaper grey jacket",
    "reason": "fit and price both matter",
    "evidence": "the blue jacket fits but costs more",
    "nextAction": "ask to try the second option",
    "simpleAnswer": "The blue jacket fits me, but I want to compare the price.",
    "detail": "the learner needs a medium size",
    "vocabularyTargets": [
      "size",
      "fit",
      "price",
      "compare"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "school-project-plan",
    "themeId": "classroom",
    "titleEn": "Planning a School Project",
    "titlePashto": "د ښوونځي پروژې پلان",
    "contextSummaryEn": "Students divide a small project into clear tasks.",
    "contextSummaryPashto": "زده کوونکي یوه کوچنۍ پروژه په روښانه دندو وېشي.",
    "situation": "organizing a group project",
    "objective": "agree who will do each task",
    "issue": "two students selected the same task",
    "choiceA": "one researches and one prepares pictures",
    "choiceB": "both research and delay the pictures",
    "reason": "clear roles prevent confusion",
    "evidence": "the project is due on Monday",
    "nextAction": "state one task and deadline",
    "simpleAnswer": "I can research the topic, and you can prepare the pictures.",
    "detail": "the group needs a short presentation",
    "vocabularyTargets": [
      "project",
      "research",
      "prepare",
      "deadline"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "health-symptoms",
    "themeId": "health",
    "titleEn": "Explaining Simple Symptoms",
    "titlePashto": "ساده نښې بیانول",
    "contextSummaryEn": "The learner describes symptoms and answers a follow-up question.",
    "contextSummaryPashto": "زده کوونکی نښې بیانوي او تعقیبي پوښتنې ته ځواب وایي.",
    "situation": "describing a mild health problem",
    "objective": "give enough information for an appointment",
    "issue": "the pain started yesterday",
    "choiceA": "describe the headache and tiredness",
    "choiceB": "only say that something hurts",
    "reason": "time and intensity help the listener",
    "evidence": "the learner slept poorly last night",
    "nextAction": "mention when the symptoms began",
    "simpleAnswer": "I have had a headache since yesterday, and I feel tired.",
    "detail": "the pain is mild but constant",
    "vocabularyTargets": [
      "headache",
      "since",
      "tired",
      "mild"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "family-responsibilities",
    "themeId": "family",
    "titleEn": "Sharing Family Responsibilities",
    "titlePashto": "د کورنۍ دندې وېشل",
    "contextSummaryEn": "Family members discuss two household responsibilities.",
    "contextSummaryPashto": "د کورنۍ غړي د کور دوه دندې سره وېشي.",
    "situation": "sharing household work",
    "objective": "make a fair simple plan",
    "issue": "everyone is busy after school or work",
    "choiceA": "one cooks and one cleans",
    "choiceB": "do everything at the weekend",
    "reason": "small daily tasks reduce pressure",
    "evidence": "dinner must be ready by seven",
    "nextAction": "offer one responsibility and ask for another",
    "simpleAnswer": "I can cook tonight because you cleaned yesterday.",
    "detail": "the plan changes on busy days",
    "vocabularyTargets": [
      "responsibility",
      "cook",
      "clean",
      "because"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "workplace-schedule",
    "themeId": "work",
    "titleEn": "A Simple Work Schedule",
    "titlePashto": "ساده کاري مهالویش",
    "contextSummaryEn": "Colleagues confirm a shift time and one responsibility.",
    "contextSummaryPashto": "همکاران د نوبت وخت او یوه دنده تاییدوي.",
    "situation": "checking a simple work shift",
    "objective": "confirm the start time and duty",
    "issue": "the printed time is unclear",
    "choiceA": "start at eight and prepare the room",
    "choiceB": "start at nine and answer calls",
    "reason": "the learner needs the correct start time",
    "evidence": "the supervisor wrote eight on the board",
    "nextAction": "repeat the shift and duty",
    "simpleAnswer": "I start at eight, and I prepare the meeting room.",
    "detail": "the duty takes twenty minutes",
    "vocabularyTargets": [
      "shift",
      "start",
      "duty",
      "prepare"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "hobby-club",
    "themeId": "community",
    "titleEn": "Joining a Hobby Club",
    "titlePashto": "د شوق کلب سره یوځای کېدل",
    "contextSummaryEn": "The learner asks about a hobby club and gives a reason for joining.",
    "contextSummaryPashto": "زده کوونکی د شوق کلب پوښتي او د ګډون دلیل وایي.",
    "situation": "joining a local club",
    "objective": "ask when and how to join",
    "issue": "two clubs meet on different days",
    "choiceA": "join the reading club on Thursday",
    "choiceB": "join the football club on Friday",
    "reason": "the learner enjoys quiet group discussion",
    "evidence": "the reading club welcomes beginners",
    "nextAction": "ask how to register",
    "simpleAnswer": "I want to join the reading club because I enjoy stories.",
    "detail": "the club meets after class",
    "vocabularyTargets": [
      "club",
      "join",
      "register",
      "enjoy"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "food-invitation",
    "themeId": "food",
    "titleEn": "Inviting a Friend for Tea",
    "titlePashto": "ملګري ته د چای بلنه",
    "contextSummaryEn": "The learner makes and responds to a simple invitation.",
    "contextSummaryPashto": "زده کوونکی ساده بلنه ورکوي او ځواب ورکوي.",
    "situation": "arranging tea with a friend",
    "objective": "agree on a suitable time",
    "issue": "the friend is busy in the afternoon",
    "choiceA": "meet in the morning",
    "choiceB": "meet after dinner",
    "reason": "the plan should respect both schedules",
    "evidence": "both are free at ten",
    "nextAction": "confirm the place and time",
    "simpleAnswer": "Would you like to have tea with us at ten tomorrow?",
    "detail": "the meeting is at home",
    "vocabularyTargets": [
      "invite",
      "tomorrow",
      "free",
      "tea"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "community-event",
    "themeId": "community",
    "titleEn": "Planning a Community Clean-up",
    "titlePashto": "د سیمې پاکوالي پلان",
    "contextSummaryEn": "Neighbours plan a safe local clean-up activity.",
    "contextSummaryPashto": "ګاونډیان د سیمې د پاکوالي خوندي فعالیت پلانوي.",
    "situation": "planning a neighbourhood clean-up",
    "objective": "choose a time and safe task",
    "issue": "rain is expected later",
    "choiceA": "work early and collect paper",
    "choiceB": "work late and paint walls",
    "reason": "the early task is safer and simpler",
    "evidence": "the morning forecast is dry",
    "nextAction": "invite another family and bring gloves",
    "simpleAnswer": "We can meet early and collect paper near the park.",
    "detail": "children work only with adults",
    "vocabularyTargets": [
      "community",
      "collect",
      "gloves",
      "early"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "beginner",
    "slug": "lost-item",
    "themeId": "services",
    "titleEn": "Reporting a Lost Bag",
    "titlePashto": "د ورک بکس راپور",
    "contextSummaryEn": "The learner describes a lost item and answers basic detail questions.",
    "contextSummaryPashto": "زده کوونکی ورک شوی شی بیانوي او ساده معلومات ورکوي.",
    "situation": "reporting a lost bag",
    "objective": "give clear identifying details",
    "issue": "several bags look similar",
    "choiceA": "describe the black bag with a red strap",
    "choiceB": "only say that a bag is missing",
    "reason": "colour and location help staff search",
    "evidence": "the bag was last seen near the ticket desk",
    "nextAction": "leave a contact method",
    "simpleAnswer": "My bag is black with a red strap, and I saw it near the ticket desk.",
    "detail": "a notebook is inside",
    "vocabularyTargets": [
      "lost",
      "strap",
      "ticket",
      "inside"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "health-advice",
    "themeId": "health",
    "titleEn": "Giving Practical Health Advice",
    "titlePashto": "عملي روغتیايي مشوره",
    "contextSummaryEn": "The learner explains a minor problem, asks follow-up questions, and gives safe advice.",
    "contextSummaryPashto": "زده کوونکی وړه ستونزه بیانوي، پوښتنه کوي او خوندي مشوره ورکوي.",
    "situation": "helping a friend with tiredness",
    "objective": "explain a cause and suggest a safe routine",
    "issue": "the friend sleeps very late",
    "choiceA": "set an earlier bedtime and drink water",
    "choiceB": "use strong medicine without advice",
    "reason": "rest and routine are appropriate first steps",
    "evidence": "the friend sleeps only five hours",
    "nextAction": "agree on one change for tonight",
    "simpleAnswer": "You may feel tired because you sleep late, so try an earlier bedtime tonight.",
    "detail": "persistent symptoms should be discussed with a clinician",
    "vocabularyTargets": [
      "advice",
      "routine",
      "because",
      "persistent"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "missed-bus",
    "themeId": "transport",
    "titleEn": "Solving a Missed Bus Problem",
    "titlePashto": "د تللي بس ستونزه حلول",
    "contextSummaryEn": "The learner explains what happened and compares two ways to continue.",
    "contextSummaryPashto": "زده کوونکی پېښه بیانوي او د دوام دوه لارې پرتله کوي.",
    "situation": "missing the last direct bus",
    "objective": "choose a practical alternative",
    "issue": "the next direct bus is in two hours",
    "choiceA": "take a local bus and walk ten minutes",
    "choiceB": "wait for the direct bus",
    "reason": "arrival time and safety both matter",
    "evidence": "the local route reaches the town before dark",
    "nextAction": "confirm the transfer point",
    "simpleAnswer": "We missed the direct bus, but the local route will get us there earlier.",
    "detail": "the transfer is at the market stop",
    "vocabularyTargets": [
      "missed",
      "transfer",
      "route",
      "earlier"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "returning-purchase",
    "themeId": "shopping",
    "titleEn": "Returning a Faulty Purchase",
    "titlePashto": "د خراب توکي بېرته ورکول",
    "contextSummaryEn": "The learner describes a fault, asks about options, and chooses a fair solution.",
    "contextSummaryPashto": "زده کوونکی عیب بیانوي، انتخابونه پوښتي او عادلانه حل غوره کوي.",
    "situation": "returning a lamp that does not work",
    "objective": "request a replacement or refund politely",
    "issue": "the receipt is available but the box is open",
    "choiceA": "replace the lamp",
    "choiceB": "request a refund",
    "reason": "the product failed on the first day",
    "evidence": "the receipt shows yesterday’s purchase",
    "nextAction": "agree to test the replacement",
    "simpleAnswer": "The lamp did not work when I tried it, so I would prefer a tested replacement.",
    "detail": "the shop can check the new lamp",
    "vocabularyTargets": [
      "faulty",
      "receipt",
      "replacement",
      "refund"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "assignment-extension",
    "themeId": "classroom",
    "titleEn": "Requesting a Short Extension",
    "titlePashto": "د دندې د وخت غځول",
    "contextSummaryEn": "The learner explains a genuine difficulty and proposes a responsible plan.",
    "contextSummaryPashto": "زده کوونکی رښتینې ستونزه بیانوي او مسؤل پلان وړاندې کوي.",
    "situation": "asking for one extra day on an assignment",
    "objective": "explain the reason without making excuses",
    "issue": "a family responsibility reduced study time",
    "choiceA": "submit a complete draft tomorrow",
    "choiceB": "submit an unfinished draft today",
    "reason": "quality and responsibility must be balanced",
    "evidence": "most of the research is already complete",
    "nextAction": "agree on a new deadline",
    "simpleAnswer": "I completed the research, but I need one extra day to organize the final draft.",
    "detail": "the teacher expects a progress note today",
    "vocabularyTargets": [
      "extension",
      "draft",
      "organize",
      "deadline"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "neighbour-noise",
    "themeId": "community",
    "titleEn": "Discussing Neighbourhood Noise",
    "titlePashto": "د ګاونډ شور په اړه خبرې",
    "contextSummaryEn": "Neighbours discuss a repeated noise problem and agree on a respectful solution.",
    "contextSummaryPashto": "ګاونډیان د تکراري شور ستونزه څېړي او درناوی لرونکی حل ټاکي.",
    "situation": "addressing loud music at night",
    "objective": "describe the effect and suggest a compromise",
    "issue": "the music continues after children sleep",
    "choiceA": "lower the volume after nine",
    "choiceB": "stop all music permanently",
    "reason": "a time limit respects both households",
    "evidence": "the noise has happened three nights this week",
    "nextAction": "agree on quiet hours",
    "simpleAnswer": "The music is disturbing our sleep, so could you lower it after nine?",
    "detail": "the neighbour did not realize the sound travelled",
    "vocabularyTargets": [
      "noise",
      "disturb",
      "compromise",
      "quiet"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "family-event-plan",
    "themeId": "family",
    "titleEn": "Organizing a Family Gathering",
    "titlePashto": "د کورنۍ غونډه تنظیمول",
    "contextSummaryEn": "Family members sequence tasks, compare locations, and confirm responsibilities.",
    "contextSummaryPashto": "د کورنۍ غړي دندې ترتیبوي، ځایونه پرتله کوي او مسؤلیتونه تاییدوي.",
    "situation": "planning a family gathering",
    "objective": "choose a location and divide tasks",
    "issue": "some relatives need easy transport",
    "choiceA": "use the community hall",
    "choiceB": "meet at a distant garden",
    "reason": "access and weather favour the hall",
    "evidence": "the hall is near the bus stop",
    "nextAction": "assign food and seating tasks",
    "simpleAnswer": "The community hall is easier to reach, and we can prepare it before noon.",
    "detail": "two relatives will arrive by bus",
    "vocabularyTargets": [
      "gathering",
      "location",
      "prepare",
      "responsibility"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "shift-change",
    "themeId": "work",
    "titleEn": "Requesting a Shift Change",
    "titlePashto": "د نوبت بدلون غوښتل",
    "contextSummaryEn": "Colleagues explain a scheduling conflict and negotiate a simple exchange.",
    "contextSummaryPashto": "همکاران د مهالویش ستونزه بیانوي او ساده بدلون هواروي.",
    "situation": "changing one work shift",
    "objective": "make a fair request and offer a return favour",
    "issue": "a medical appointment overlaps the shift",
    "choiceA": "swap Tuesday for Thursday",
    "choiceB": "arrive late without notice",
    "reason": "advance agreement protects the team schedule",
    "evidence": "the colleague is free on Tuesday",
    "nextAction": "confirm the swap with the supervisor",
    "simpleAnswer": "Could we exchange shifts? I can work for you on Thursday.",
    "detail": "the supervisor needs both names",
    "vocabularyTargets": [
      "shift",
      "exchange",
      "overlap",
      "confirm"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "study-habits",
    "themeId": "classroom",
    "titleEn": "Improving a Study Routine",
    "titlePashto": "د مطالعې عادت ښه کول",
    "contextSummaryEn": "The learner reflects on a weak routine and chooses two realistic changes.",
    "contextSummaryPashto": "زده کوونکی پر کمزوري عادت فکر کوي او دوه عملي بدلونونه غوره کوي.",
    "situation": "improving study habits",
    "objective": "explain what is not working and plan a sequence",
    "issue": "phone messages interrupt every session",
    "choiceA": "study for twenty minutes with notifications off",
    "choiceB": "study for three hours without a break",
    "reason": "short focused sessions are sustainable",
    "evidence": "the learner completes more work in quiet periods",
    "nextAction": "set a start time and review point",
    "simpleAnswer": "I will turn off notifications, study for twenty minutes, and then check my progress.",
    "detail": "the plan starts after dinner",
    "vocabularyTargets": [
      "routine",
      "interrupt",
      "focused",
      "progress"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "polite-food-complaint",
    "themeId": "food",
    "titleEn": "Handling a Food Order Problem",
    "titlePashto": "د خوړو د فرمایش ستونزه حل کول",
    "contextSummaryEn": "The learner explains an incorrect order and asks for a respectful correction.",
    "contextSummaryPashto": "زده کوونکی ناسم فرمایش بیانوي او په درناوي د سمون غوښتنه کوي.",
    "situation": "receiving the wrong meal",
    "objective": "identify the error and request a correction",
    "issue": "the served dish contains an ingredient not ordered",
    "choiceA": "replace it with the ordered soup",
    "choiceB": "accept the meal without speaking",
    "reason": "a clear polite request prevents confusion",
    "evidence": "the written order says vegetable soup",
    "nextAction": "confirm the replacement time",
    "simpleAnswer": "I ordered vegetable soup, but this dish is different. Could you replace it, please?",
    "detail": "the server apologizes and checks the ticket",
    "vocabularyTargets": [
      "incorrect",
      "ingredient",
      "replace",
      "apologize"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "elementary",
    "slug": "travel-delay-plan",
    "themeId": "transport",
    "titleEn": "Managing a Travel Delay",
    "titlePashto": "د سفر ځنډ اداره کول",
    "contextSummaryEn": "The learner explains a delay, updates another person, and makes a backup plan.",
    "contextSummaryPashto": "زده کوونکی ځنډ بیانوي، بل کس خبروي او بدیل پلان جوړوي.",
    "situation": "a bus is delayed by one hour",
    "objective": "communicate the change and protect the appointment",
    "issue": "the arrival will be after the original meeting time",
    "choiceA": "call and move the meeting",
    "choiceB": "travel without informing anyone",
    "reason": "early notice respects the other person’s time",
    "evidence": "the station display shows a sixty-minute delay",
    "nextAction": "confirm the new meeting time",
    "simpleAnswer": "The bus is delayed, so I will call and ask to meet one hour later.",
    "detail": "a later connection is still available",
    "vocabularyTargets": [
      "delay",
      "inform",
      "connection",
      "later"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "group-project-conflict",
    "themeId": "classroom",
    "titleEn": "Resolving a Group Project Conflict",
    "titlePashto": "د ډلې د پروژې شخړه حل کول",
    "contextSummaryEn": "Students clarify a disagreement, compare contributions, and agree on a workable division of labour.",
    "contextSummaryPashto": "زده کوونکي اختلاف روښانوي، ونډې پرتله کوي او د کار مناسب وېش ټاکي.",
    "situation": "two students disagree about unfinished work",
    "objective": "clarify expectations and negotiate responsibilities",
    "issue": "one member believes the task allocation was unclear",
    "choiceA": "reassign the research and editing tasks",
    "choiceB": "keep the same plan without discussion",
    "reason": "a written task list will prevent another misunderstanding",
    "evidence": "both members completed different parts but duplicated one section",
    "nextAction": "write roles and a check-in time",
    "simpleAnswer": "We both contributed, but the roles were unclear; let us divide the remaining work and check it tomorrow.",
    "detail": "the presentation is due in three days",
    "vocabularyTargets": [
      "clarify",
      "contribution",
      "allocate",
      "check-in"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "housing-options",
    "themeId": "community",
    "titleEn": "Comparing Two Housing Options",
    "titlePashto": "د اوسېدو دوه انتخابونه پرتله کول",
    "contextSummaryEn": "The learner compares location, cost, safety, and transport before making a reasoned choice.",
    "contextSummaryPashto": "زده کوونکی ځای، لګښت، خوندیتوب او ترانسپورت پرتله کوي او دلیل لرونکی انتخاب کوي.",
    "situation": "choosing between two rental homes",
    "objective": "weigh practical advantages and disadvantages",
    "issue": "one home is cheaper but far from transport",
    "choiceA": "choose the central smaller home",
    "choiceB": "choose the distant larger home",
    "reason": "daily travel cost may cancel the lower rent",
    "evidence": "the central home is near work and a clinic",
    "nextAction": "list total monthly costs before deciding",
    "simpleAnswer": "Although the distant home is larger, the central home may be more practical because transport is easier.",
    "detail": "both homes meet basic safety needs",
    "vocabularyTargets": [
      "rent",
      "transport",
      "practical",
      "although"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "community-service-plan",
    "themeId": "community",
    "titleEn": "Designing a Community Service Plan",
    "titlePashto": "د ټولنې د خدمت پلان جوړول",
    "contextSummaryEn": "The learner identifies a local need, asks for clarification, and proposes a measurable volunteer plan.",
    "contextSummaryPashto": "زده کوونکی سیمه ییزه اړتیا پېژني، وضاحت غواړي او د رضاکارۍ اندازه کېدونکی پلان وړاندې کوي.",
    "situation": "organizing help for an overcrowded reading room",
    "objective": "define a realistic volunteer task",
    "issue": "volunteers have only two hours each week",
    "choiceA": "run a weekly book-sorting session",
    "choiceB": "promise a full library renovation",
    "reason": "a limited repeatable task is more credible",
    "evidence": "staff report that unsorted donations block shelves",
    "nextAction": "pilot the session for one month",
    "simpleAnswer": "Instead of promising a major renovation, we can organize a two-hour sorting session every Saturday.",
    "detail": "the room has six regular volunteers",
    "vocabularyTargets": [
      "volunteer",
      "measurable",
      "pilot",
      "credible"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "medical-clarification",
    "themeId": "health",
    "titleEn": "Clarifying Medical Instructions",
    "titlePashto": "طبي لارښوونې روښانه کول",
    "contextSummaryEn": "The learner checks understanding, distinguishes advice from warning signs, and summarizes the next steps.",
    "contextSummaryPashto": "زده کوونکی پوهه تاییدوي، مشوره له خطر نښو جلا کوي او راتلونکي ګامونه لنډوي.",
    "situation": "receiving instructions after a routine consultation",
    "objective": "ask precise follow-up questions and restate the plan",
    "issue": "two instructions appear to conflict",
    "choiceA": "follow the written schedule and call if symptoms worsen",
    "choiceB": "guess the dosage from memory",
    "reason": "clarification prevents an unsafe misunderstanding",
    "evidence": "the clinician says the written plan is the final reference",
    "nextAction": "repeat the schedule and warning signs",
    "simpleAnswer": "To make sure I understand, I should follow the written schedule and call if the symptoms become worse.",
    "detail": "the learner has a printed instruction sheet",
    "vocabularyTargets": [
      "clarify",
      "schedule",
      "warning sign",
      "worsen"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "deadline-negotiation",
    "themeId": "work",
    "titleEn": "Negotiating a Project Deadline",
    "titlePashto": "د پروژې وروستۍ نېټه هوارول",
    "contextSummaryEn": "Colleagues discuss scope, constraints, and quality before agreeing on a revised deadline.",
    "contextSummaryPashto": "همکاران د کار کچه، محدودیتونه او کیفیت څېړي او نوې نېټه ټاکي.",
    "situation": "a project needs more verified data",
    "objective": "negotiate time without hiding the delay",
    "issue": "the current deadline would require skipping a quality check",
    "choiceA": "extend by two days and keep the full review",
    "choiceB": "meet the deadline with incomplete verification",
    "reason": "a brief extension reduces a documented quality risk",
    "evidence": "two source files arrived late",
    "nextAction": "send a revised timeline today",
    "simpleAnswer": "I can meet the original date only by omitting verification; I recommend a two-day extension with the full review.",
    "detail": "the client needs an update before noon",
    "vocabularyTargets": [
      "deadline",
      "constraint",
      "verification",
      "timeline"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "media-source-check",
    "themeId": "media",
    "titleEn": "Checking a News Source",
    "titlePashto": "د خبر سرچینه ارزول",
    "contextSummaryEn": "The learner asks how a claim was verified, compares sources, and explains a cautious conclusion.",
    "contextSummaryPashto": "زده کوونکی د ادعا د تایید لاره پوښتي، سرچینې پرتله کوي او محتاطه پایله بیانوي.",
    "situation": "evaluating a widely shared online claim",
    "objective": "separate evidence from repetition",
    "issue": "many posts repeat the claim without naming a source",
    "choiceA": "check the original report and a second independent source",
    "choiceB": "accept the most popular post",
    "reason": "repetition does not prove accuracy",
    "evidence": "the original image is from an older event",
    "nextAction": "explain what remains uncertain",
    "simpleAnswer": "The claim is repeated often, but the original image is old, so we should verify the date and source before sharing it.",
    "detail": "one independent report gives different numbers",
    "vocabularyTargets": [
      "source",
      "verify",
      "claim",
      "uncertain"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "itinerary-change",
    "themeId": "transport",
    "titleEn": "Revising a Travel Itinerary",
    "titlePashto": "د سفر پلان بدلول",
    "contextSummaryEn": "Travellers compare connections, explain priorities, and select a revised route after a cancellation.",
    "contextSummaryPashto": "مسافر د لارو اړیکې پرتله کوي، لومړیتوبونه بیانوي او د لغوه کېدو وروسته نوې لاره غوره کوي.",
    "situation": "changing a route after a cancelled connection",
    "objective": "balance arrival time, cost, and reliability",
    "issue": "the fastest route has a very short transfer",
    "choiceA": "take the slightly later direct route",
    "choiceB": "take the risky short connection",
    "reason": "a direct route reduces the chance of another missed transfer",
    "evidence": "weather is also affecting the connecting airport",
    "nextAction": "book the direct route and notify the host",
    "simpleAnswer": "The direct route arrives later, but it is more reliable because it avoids the affected connection.",
    "detail": "the fare difference is small",
    "vocabularyTargets": [
      "itinerary",
      "connection",
      "reliable",
      "notify"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "school-policy-discussion",
    "themeId": "classroom",
    "titleEn": "Discussing a School Phone Policy",
    "titlePashto": "د ښوونځي د موبایل تګلاره څېړل",
    "contextSummaryEn": "Students identify the purpose of a rule, raise a concern, and propose a balanced implementation.",
    "contextSummaryPashto": "زده کوونکي د قانون موخه پېژني، اندېښنه راپورته کوي او متوازن تطبیق وړاندیز کوي.",
    "situation": "reviewing a rule about phones during lessons",
    "objective": "express disagreement constructively",
    "issue": "students need phones for one supervised activity",
    "choiceA": "store phones except during teacher-approved tasks",
    "choiceB": "allow unrestricted phone use",
    "reason": "a clear exception supports learning without constant distraction",
    "evidence": "teachers report fewer interruptions in phone-free periods",
    "nextAction": "write the exception into the rule",
    "simpleAnswer": "I support limiting phones during lessons, but the policy should include a supervised learning exception.",
    "detail": "parents may still contact the office",
    "vocabularyTargets": [
      "policy",
      "exception",
      "distraction",
      "constructive"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "family-time-balance",
    "themeId": "family",
    "titleEn": "Balancing Family Responsibilities",
    "titlePashto": "د کورنۍ مسؤلیتونه متوازن کول",
    "contextSummaryEn": "Family members compare workloads, acknowledge constraints, and adjust a weekly responsibility plan.",
    "contextSummaryPashto": "د کورنۍ غړي د کار کچه پرتله کوي، محدودیتونه مني او اوونیز پلان سموي.",
    "situation": "one person is carrying too many evening tasks",
    "objective": "redistribute work fairly",
    "issue": "two family members have changing schedules",
    "choiceA": "use a weekly task board and rotate duties",
    "choiceB": "leave the plan informal",
    "reason": "visible rotation makes hidden work easier to share",
    "evidence": "the same person cooked and cleaned four nights",
    "nextAction": "test the rotation for one week",
    "simpleAnswer": "I did not realize the evening work was so uneven; let us rotate cooking and cleaning and review the plan next week.",
    "detail": "everyone can choose one fixed task",
    "vocabularyTargets": [
      "balance",
      "rotate",
      "workload",
      "acknowledge"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "intermediate",
    "slug": "local-environment-plan",
    "themeId": "environment",
    "titleEn": "Improving a Local Green Space",
    "titlePashto": "د سیمې شنه ځای ښه کول",
    "contextSummaryEn": "The learner compares environmental proposals, asks about feasibility, and recommends a staged plan.",
    "contextSummaryPashto": "زده کوونکی چاپېریالي وړاندیزونه پرتله کوي، د عملي کېدو پوښتنه کوي او پړاو لرونکی پلان سپاري.",
    "situation": "improving a neglected small park",
    "objective": "choose a feasible first intervention",
    "issue": "the budget cannot cover every proposal",
    "choiceA": "repair bins and add shade trees in stages",
    "choiceB": "build a large new facility immediately",
    "reason": "basic maintenance and shade address the most reported needs",
    "evidence": "resident feedback mentions litter and heat most often",
    "nextAction": "cost the first stage and seek volunteers",
    "simpleAnswer": "A staged plan is more realistic: first repair the bins, then plant shade trees with community support.",
    "detail": "the council can fund one stage this month",
    "vocabularyTargets": [
      "feasible",
      "staged",
      "maintenance",
      "feedback"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "workplace-negotiation",
    "themeId": "work",
    "titleEn": "Negotiating Responsibilities at Work",
    "titlePashto": "په کار کې مسؤلیتونه هوارول",
    "contextSummaryEn": "The learner negotiates scope, acknowledges constraints, reformulates a concern, and secures a documented agreement.",
    "contextSummaryPashto": "زده کوونکی د کار کچه هواروي، محدودیتونه مني، اندېښنه بیا بیانوي او لیکلی تړون ترلاسه کوي.",
    "situation": "a role has expanded without a clear priority change",
    "objective": "negotiate responsibilities and decision authority",
    "issue": "three urgent tasks now compete for the same time",
    "choiceA": "defer one task and clarify ownership",
    "choiceB": "accept every task without prioritization",
    "reason": "explicit priorities protect quality and accountability",
    "evidence": "the weekly workload has increased by roughly one third",
    "nextAction": "summarize the agreement in writing",
    "simpleAnswer": "I am willing to take the new responsibility, provided we agree which existing task will be deferred and who owns the final decision.",
    "detail": "the manager can approve a revised priority list",
    "vocabularyTargets": [
      "negotiate",
      "scope",
      "accountability",
      "provided"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "formal-service-complaint",
    "themeId": "services",
    "titleEn": "Resolving a Formal Service Complaint",
    "titlePashto": "د رسمي خدمت شکایت حل کول",
    "contextSummaryEn": "The learner distinguishes facts from frustration, requests a proportionate remedy, and responds to a partial offer.",
    "contextSummaryPashto": "زده کوونکی حقیقت له خپګان جلا کوي، مناسب حل غواړي او نیمګړي وړاندیز ته ځواب وایي.",
    "situation": "a paid service repeatedly failed to meet its stated schedule",
    "objective": "present a documented complaint and negotiate a remedy",
    "issue": "the provider offers only a generic apology",
    "choiceA": "request a specific correction and service credit",
    "choiceB": "demand an unrelated excessive payment",
    "reason": "the remedy should match the documented failure",
    "evidence": "three appointments were cancelled with less than one hour notice",
    "nextAction": "confirm the remedy and future contact point",
    "simpleAnswer": "I appreciate the apology, but the repeated cancellations caused a measurable loss of time; I am requesting a specific rescheduling guarantee and an appropriate service credit.",
    "detail": "the contract lists a complaint process",
    "vocabularyTargets": [
      "proportionate",
      "documented",
      "remedy",
      "guarantee"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "community-policy-disagreement",
    "themeId": "community",
    "titleEn": "Mediating a Community Policy Disagreement",
    "titlePashto": "د ټولنې د تګلارې اختلاف منځګړیتوب",
    "contextSummaryEn": "The learner identifies competing values, challenges an assumption respectfully, and proposes a reviewable compromise.",
    "contextSummaryPashto": "زده کوونکی سیال ارزښتونه پېژني، یوه انګېرنه په درناوي ننګوي او د بیاکتنې وړ جوړجاړی وړاندې کوي.",
    "situation": "residents disagree about evening use of a public space",
    "objective": "mediate between access and noise concerns",
    "issue": "each side assumes the other ignores its needs",
    "choiceA": "set trial hours with monitoring",
    "choiceB": "ban all evening use",
    "reason": "a time-limited trial creates evidence for review",
    "evidence": "complaints rise after ten, while earlier events are mostly quiet",
    "nextAction": "define trial measures and a review date",
    "simpleAnswer": "Rather than treating access and quiet as mutually exclusive, we could test earlier closing hours for six weeks and review the complaint data.",
    "detail": "both groups accept a public review meeting",
    "vocabularyTargets": [
      "mediate",
      "assumption",
      "trial",
      "mutually exclusive"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "medical-second-opinion",
    "themeId": "health",
    "titleEn": "Seeking a Medical Second Opinion",
    "titlePashto": "د طبي دویم نظر غوښتل",
    "contextSummaryEn": "The learner summarizes prior advice, asks about uncertainty, and compares options without rejecting professional care.",
    "contextSummaryPashto": "زده کوونکی پخوانۍ مشوره لنډوي، د ناڅرګندتیا پوښتنه کوي او انتخابونه د مسلکي پاملرنې له ردولو پرته پرتله کوي.",
    "situation": "a non-emergency treatment decision has two reasonable options",
    "objective": "ask for clarification about benefits, risks, and uncertainty",
    "issue": "the first explanation did not address long-term effects",
    "choiceA": "request a second specialist review",
    "choiceB": "stop all care without advice",
    "reason": "another opinion can clarify uncertainty while treatment continues safely",
    "evidence": "the written notes list benefits but little about alternatives",
    "nextAction": "prepare specific questions and share records",
    "simpleAnswer": "I am not rejecting the recommended treatment; I would like a second opinion so I can understand the alternatives and the long-term trade-offs.",
    "detail": "the clinician agrees to provide the records",
    "vocabularyTargets": [
      "second opinion",
      "uncertainty",
      "alternative",
      "trade-off"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "misinformation-response",
    "themeId": "media",
    "titleEn": "Responding to Misinformation",
    "titlePashto": "ناسمو معلوماتو ته ځواب",
    "contextSummaryEn": "The learner analyzes an emotionally framed claim, explains verification limits, and corrects it without humiliating the speaker.",
    "contextSummaryPashto": "زده کوونکی احساساتي ادعا څېړي، د تایید محدودیتونه بیانوي او ویونکی نه سپکوي.",
    "situation": "a friend shares an alarming but weakly sourced claim",
    "objective": "correct the information while preserving dialogue",
    "issue": "the friend interprets caution as personal criticism",
    "choiceA": "acknowledge the concern and examine the source together",
    "choiceB": "dismiss the friend as careless",
    "reason": "respectful verification reduces defensiveness",
    "evidence": "the cited page quotes no identifiable report and uses an old photograph",
    "nextAction": "offer a verified source and state remaining uncertainty",
    "simpleAnswer": "The concern is understandable, but this post does not identify a verifiable report; let us check a reliable source before drawing a conclusion.",
    "detail": "a reputable source confirms only part of the claim",
    "vocabularyTargets": [
      "misinformation",
      "verifiable",
      "framing",
      "defensiveness"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "leadership-feedback",
    "themeId": "work",
    "titleEn": "Giving Constructive Leadership Feedback",
    "titlePashto": "د رهبرۍ رغنده نظر ورکول",
    "contextSummaryEn": "The learner gives specific feedback, distinguishes intention from impact, and agrees on a follow-up measure.",
    "contextSummaryPashto": "زده کوونکی مشخص نظر ورکوي، نیت له اغېز جلا کوي او د تعقیب یوه اندازه ټاکي.",
    "situation": "a team leader makes decisions without enough consultation",
    "objective": "raise the concern with appropriate register",
    "issue": "the leader believes speed requires less discussion",
    "choiceA": "use brief consultation checkpoints",
    "choiceB": "criticize the leader’s personality",
    "reason": "specific process feedback is more actionable than a personal judgment",
    "evidence": "two recent decisions had to be revised after missing local information",
    "nextAction": "pilot a ten-minute consultation before major changes",
    "simpleAnswer": "I understand the need for speed; however, the last two decisions required revision because relevant information was not gathered. A brief consultation checkpoint may save time overall.",
    "detail": "the leader asks for a practical alternative",
    "vocabularyTargets": [
      "constructive",
      "impact",
      "consultation",
      "actionable"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "technology-ethics",
    "themeId": "society",
    "titleEn": "Discussing an Ethical Technology Choice",
    "titlePashto": "د ټکنالوژۍ اخلاقي انتخاب څېړل",
    "contextSummaryEn": "The learner defines the ethical tension, tests a principle against a counterexample, and proposes safeguards.",
    "contextSummaryPashto": "زده کوونکی اخلاقي ټکر تعریفوي، اصل د مخالف مثال پر وړاندې ازموي او خونديتوبونه وړاندیز کوي.",
    "situation": "a school or workplace wants an automated monitoring tool",
    "objective": "weigh convenience against privacy and fairness",
    "issue": "supporters assume efficiency alone justifies collection",
    "choiceA": "limit data collection and require human review",
    "choiceB": "collect all available data indefinitely",
    "reason": "proportional safeguards preserve useful functions without unchecked surveillance",
    "evidence": "the tool has produced several false alerts in a pilot",
    "nextAction": "define data limits, appeal rights, and review dates",
    "simpleAnswer": "Efficiency matters, but it does not remove the duty to limit data collection and provide a human appeal when the system is wrong.",
    "detail": "a smaller data set still supports the main function",
    "vocabularyTargets": [
      "ethical tension",
      "proportional",
      "appeal",
      "safeguard"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "travel-disruption-advocacy",
    "themeId": "transport",
    "titleEn": "Advocating During a Travel Disruption",
    "titlePashto": "د سفر ګډوډۍ پر مهال د حق غوښتنه",
    "contextSummaryEn": "The learner explains consequences, distinguishes entitlement from preference, and negotiates an alternative under pressure.",
    "contextSummaryPashto": "زده کوونکی پایلې بیانوي، حق له خوښې جلا کوي او تر فشار لاندې بدیل هواروي.",
    "situation": "a cancelled connection leaves a traveller without a safe overnight plan",
    "objective": "seek a feasible protected alternative",
    "issue": "staff initially offer a route that arrives too late for safe onward travel",
    "choiceA": "request accommodation and the first safe route",
    "choiceB": "demand an unavailable private service",
    "reason": "the request is tied to the disruption and safety need",
    "evidence": "the carrier’s notice promises assistance after qualifying cancellations",
    "nextAction": "confirm vouchers and the new route in writing",
    "simpleAnswer": "I understand the disruption affects many passengers, but the proposed route creates an unsafe overnight gap. Please confirm the available accommodation and the first safe connection.",
    "detail": "the service desk can issue a written voucher",
    "vocabularyTargets": [
      "entitlement",
      "feasible",
      "disruption",
      "confirm"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "cultural-event-mediation",
    "themeId": "culture",
    "titleEn": "Mediating a Cultural Event Disagreement",
    "titlePashto": "د فرهنګي غونډې اختلاف منځګړیتوب",
    "contextSummaryEn": "The learner interprets concerns about inclusion and tradition, reframes polarized positions, and proposes shared criteria.",
    "contextSummaryPashto": "زده کوونکی د ګډون او دود اندېښنې تشریح کوي، قطبي دریځونه بیا بیانوي او ګډ معیارونه وړاندیز کوي.",
    "situation": "a school event committee disagrees about programme balance",
    "objective": "protect tradition while widening participation",
    "issue": "each group describes the other as disrespectful",
    "choiceA": "use shared selection criteria and explain the programme",
    "choiceB": "give one group complete control",
    "reason": "transparent criteria reduce suspicion and preserve multiple aims",
    "evidence": "survey responses value both traditional performances and student participation",
    "nextAction": "agree on criteria before choosing acts",
    "simpleAnswer": "The disagreement is not simply tradition versus change; both sides want the event to be meaningful. We can use transparent criteria that protect key traditions and include student contributions.",
    "detail": "the committee can publish the criteria",
    "vocabularyTargets": [
      "reframe",
      "inclusion",
      "transparent",
      "criterion"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "advanced",
    "slug": "education-policy-negotiation",
    "themeId": "classroom",
    "titleEn": "Negotiating an Education Policy",
    "titlePashto": "د ښوونې تګلاره هوارول",
    "contextSummaryEn": "The learner critiques a policy mechanism, acknowledges its purpose, and proposes an evidence-based revision.",
    "contextSummaryPashto": "زده کوونکی د تګلارې میکانیزم نقدوي، موخه یې مني او د شواهدو پر بنسټ بدلون وړاندیز کوي.",
    "situation": "a school introduces one high-stakes test for all placement decisions",
    "objective": "distinguish the policy goal from the chosen method",
    "issue": "the single score may not represent sustained performance",
    "choiceA": "combine the test with coursework evidence",
    "choiceB": "remove all common assessment",
    "reason": "multiple measures can preserve standards while reducing one-test distortion",
    "evidence": "teachers report several students whose daily work conflicts with the test result",
    "nextAction": "pilot a two-measure decision rule",
    "simpleAnswer": "The goal of consistent placement is valid, but relying on one test may distort the decision; a common test plus documented coursework would be more defensible.",
    "detail": "the school can evaluate the pilot after one term",
    "vocabularyTargets": [
      "mechanism",
      "high-stakes",
      "distort",
      "defensible"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "evidence-discussion",
    "themeId": "academic-discussion",
    "titleEn": "Evaluating Evidence in a Seminar",
    "titlePashto": "په سیمینار کې د شواهدو ارزونه",
    "contextSummaryEn": "The learner states a claim, identifies the evidence standard, weighs limitations, and reaches a qualified conclusion.",
    "contextSummaryPashto": "زده کوونکی ادعا بیانوي، د شواهدو معیار ټاکي، محدودیتونه سنجوي او مشروطه پایله اخلي.",
    "situation": "a seminar discusses whether a small study supports a broad claim",
    "objective": "evaluate evidence without overstating certainty",
    "issue": "the study has a narrow sample and no comparison group",
    "choiceA": "treat the result as preliminary",
    "choiceB": "generalize immediately to the whole population",
    "reason": "scope and design limit the strength of inference",
    "evidence": "the reported effect is consistent but based on thirty participants",
    "nextAction": "state a qualified conclusion and research need",
    "simpleAnswer": "The result is suggestive rather than conclusive because the sample is narrow and there is no comparison group; a larger comparative study is needed.",
    "detail": "the authors acknowledge the sampling limitation",
    "vocabularyTargets": [
      "evidence",
      "inference",
      "preliminary",
      "conclusive"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "presentation-questions",
    "themeId": "presentation",
    "titleEn": "Responding to Presentation Questions",
    "titlePashto": "د پریزنټېشن پوښتنو ته ځواب",
    "contextSummaryEn": "The learner clarifies a question, answers with structured evidence, and distinguishes what the presentation did not establish.",
    "contextSummaryPashto": "زده کوونکی پوښتنه روښانوي، په منظم شواهدو ځواب ورکوي او نه ثابت شوي ټکي جلا کوي.",
    "situation": "answering a challenging question after a presentation",
    "objective": "respond precisely while acknowledging limits",
    "issue": "the question combines two different claims",
    "choiceA": "separate the claims and answer each",
    "choiceB": "defend every detail without qualification",
    "reason": "clarifying the question improves relevance and accuracy",
    "evidence": "the presentation directly tested one claim but only discussed the second",
    "nextAction": "summarize the supported result and remaining issue",
    "simpleAnswer": "If I understand correctly, you are asking about both effectiveness and cost. Our data address effectiveness; cost remains a limitation that requires separate analysis.",
    "detail": "one slide contains the relevant comparison",
    "vocabularyTargets": [
      "clarify",
      "relevance",
      "limitation",
      "separate"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "research-method-critique",
    "themeId": "research-methods",
    "titleEn": "Critiquing a Research Method",
    "titlePashto": "د څېړنې میتود نقدول",
    "contextSummaryEn": "The learner describes a method fairly, identifies a validity threat, considers an alternative explanation, and recommends a feasible improvement.",
    "contextSummaryPashto": "زده کوونکی میتود په انصاف بیانوي، د اعتبار ګواښ پېژني، بدیل تشریح سنجوي او عملي ښه والی وړاندیز کوي.",
    "situation": "reviewing a survey that measures study habits and grades",
    "objective": "critique design rather than attack the conclusion",
    "issue": "participants self-selected into the survey",
    "choiceA": "add stratified sampling and report nonresponse",
    "choiceB": "discard all survey research",
    "reason": "selection bias may affect who is represented",
    "evidence": "the response rate is twenty-eight percent and varies by class",
    "nextAction": "recommend one design and one reporting improvement",
    "simpleAnswer": "The survey is useful descriptively, but self-selection threatens representativeness; stratified sampling and a clear nonresponse analysis would strengthen the design.",
    "detail": "administrative records can support the sampling frame",
    "vocabularyTargets": [
      "validity",
      "selection bias",
      "representative",
      "nonresponse"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "seminar-disagreement",
    "themeId": "academic-discussion",
    "titleEn": "Disagreeing in an Academic Seminar",
    "titlePashto": "په علمي سیمینار کې اختلاف",
    "contextSummaryEn": "The learner represents another position accurately, identifies the point of disagreement, and advances a reasoned counterargument.",
    "contextSummaryPashto": "زده کوونکی بل دریځ په سمه توګه بیانوي، د اختلاف ټکی ټاکي او دلیل لرونکی مخالف نظر وړاندې کوي.",
    "situation": "two seminar participants interpret the same policy outcome differently",
    "objective": "disagree without misrepresenting the other view",
    "issue": "one explanation emphasizes intention while the other emphasizes effects",
    "choiceA": "compare explanatory power using the evidence",
    "choiceB": "dismiss the other view as naive",
    "reason": "accurate representation makes disagreement productive",
    "evidence": "the outcome changed after implementation despite unchanged stated goals",
    "nextAction": "state the shared ground and precise disagreement",
    "simpleAnswer": "I agree that the stated intention matters, but I disagree that it explains the outcome; the implementation evidence suggests the mechanism changed behaviour in an unintended way.",
    "detail": "both participants accept the same timeline",
    "vocabularyTargets": [
      "counterargument",
      "mechanism",
      "represent",
      "shared ground"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "source-synthesis",
    "themeId": "source-synthesis",
    "titleEn": "Synthesizing Conflicting Sources",
    "titlePashto": "د مخالفو سرچینو ترکیب",
    "contextSummaryEn": "The learner compares claims, methods, and contexts across sources before constructing a synthesis that preserves disagreement.",
    "contextSummaryPashto": "زده کوونکی د سرچینو ادعاوې، میتودونه او شرایط پرتله کوي او اختلاف ساتونکې ترکیب جوړوي.",
    "situation": "three sources reach different conclusions about one intervention",
    "objective": "synthesize rather than choose a source by authority alone",
    "issue": "the studies use different populations and outcome measures",
    "choiceA": "explain how context accounts for part of the disagreement",
    "choiceB": "average all conclusions into one claim",
    "reason": "method and context can produce legitimately different findings",
    "evidence": "positive effects appear in short-term measures but not in long-term follow-up",
    "nextAction": "write a synthesis with conditional claims",
    "simpleAnswer": "The sources are not simply contradictory: short-term outcomes improve in two contexts, whereas the long-term study finds no sustained effect, so duration and population may explain the difference.",
    "detail": "all three sources define the intervention similarly",
    "vocabularyTargets": [
      "synthesis",
      "context",
      "conditional",
      "sustained"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "hypothesis-limitations",
    "themeId": "science",
    "titleEn": "Defending a Hypothesis with Limitations",
    "titlePashto": "له محدودیتونو سره فرضیه دفاع کول",
    "contextSummaryEn": "The learner explains a hypothesis, links it to observations, considers a rival explanation, and defines what evidence would change the position.",
    "contextSummaryPashto": "زده کوونکی فرضیه بیانوي، له مشاهداتو سره یې تړي، سیاله تشریح سنجوي او د نظر د بدلون شواهد ټاکي.",
    "situation": "discussing why a local environmental change occurred",
    "objective": "defend a hypothesis without treating it as proven",
    "issue": "temperature and land-use changed at the same time",
    "choiceA": "test both variables with additional data",
    "choiceB": "attribute the change to one variable immediately",
    "reason": "a rival explanation remains plausible",
    "evidence": "the current observations fit both explanations in different ways",
    "nextAction": "specify a discriminating measurement",
    "simpleAnswer": "My hypothesis is consistent with the temperature trend, but land-use change is a plausible rival explanation; measurements across unaffected sites would help distinguish them.",
    "detail": "historical records exist for three nearby sites",
    "vocabularyTargets": [
      "hypothesis",
      "rival explanation",
      "distinguish",
      "observation"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "policy-briefing",
    "themeId": "policy",
    "titleEn": "Delivering a Policy Briefing",
    "titlePashto": "د تګلارې لنډه وینا وړاندې کول",
    "contextSummaryEn": "The learner defines a problem, ranks evidence, explains trade-offs, and gives a recommendation with implementation conditions.",
    "contextSummaryPashto": "زده کوونکی ستونزه تعریفوي، شواهد درجه بندي کوي، تبادلې بیانوي او له شرایطو سره سپارښتنه کوي.",
    "situation": "briefing a committee on reducing transport delays",
    "objective": "recommend a policy under limited resources",
    "issue": "the fastest intervention is costly and benefits only one route",
    "choiceA": "use targeted scheduling changes plus evaluation",
    "choiceB": "purchase a full new fleet immediately",
    "reason": "a staged lower-cost intervention can be tested before expansion",
    "evidence": "delay data show two bottlenecks account for most missed connections",
    "nextAction": "recommend a pilot, indicators, and review date",
    "simpleAnswer": "I recommend a targeted scheduling pilot at the two bottlenecks, with missed-connection rates and passenger waiting time reviewed after eight weeks.",
    "detail": "the committee can reallocate staff but not buy vehicles this year",
    "vocabularyTargets": [
      "briefing",
      "trade-off",
      "indicator",
      "implementation"
    ],
    "pathways": [
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "literature-interpretation",
    "themeId": "literature",
    "titleEn": "Defending a Literary Interpretation",
    "titlePashto": "د ادبي تفسیر دفاع کول",
    "contextSummaryEn": "The learner develops an interpretation, uses textual evidence, addresses an alternative reading, and avoids claiming authorial certainty.",
    "contextSummaryPashto": "زده کوونکی تفسیر جوړوي، متني شواهد کاروي، بدیل لوست ته ځواب وایي او د لیکوال د نیت قطعي ادعا نه کوي.",
    "situation": "discussing a narrator whose account changes over time",
    "objective": "support an interpretation with close reading",
    "issue": "the text allows both growth and unreliability readings",
    "choiceA": "argue for a qualified combined interpretation",
    "choiceB": "claim only one reading is possible",
    "reason": "the changing language supports development but also creates uncertainty",
    "evidence": "later passages revise details stated confidently earlier",
    "nextAction": "cite two passages and acknowledge ambiguity",
    "simpleAnswer": "The narrator appears to develop greater self-awareness, yet the revisions also make the account less stable; the interpretation is strongest when it preserves both features.",
    "detail": "the final paragraph echoes an earlier image with altered wording",
    "vocabularyTargets": [
      "interpretation",
      "textual evidence",
      "ambiguity",
      "narrator"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "data-trend-explanation",
    "themeId": "data-analysis",
    "titleEn": "Explaining a Data Trend",
    "titlePashto": "د معلوماتو بهیر تشریح کول",
    "contextSummaryEn": "The learner describes a trend accurately, separates observation from explanation, evaluates anomalies, and states uncertainty.",
    "contextSummaryPashto": "زده کوونکی بهیر په سمه توګه بیانوي، مشاهده له تشریح جلا کوي، استثناوې ارزوي او ناڅرګندتیا بیانوي.",
    "situation": "interpreting a chart with growth, a sudden dip, and recovery",
    "objective": "explain what the data show before proposing causes",
    "issue": "one year departs sharply from the pattern",
    "choiceA": "describe the anomaly and test contextual explanations",
    "choiceB": "ignore the anomalous year",
    "reason": "an anomaly may contain information rather than noise",
    "evidence": "the dip coincides with a documented service interruption",
    "nextAction": "state the trend, anomaly, and cautious explanation",
    "simpleAnswer": "The series rises overall, with a sharp temporary decline in the interruption year; the timing supports an association, although the chart alone cannot establish causation.",
    "detail": "the following year returns near the previous trajectory",
    "vocabularyTargets": [
      "trend",
      "anomaly",
      "association",
      "causation"
    ],
    "pathways": [
      "child",
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  },
  {
    "level": "academic",
    "slug": "academic-choice-ethics",
    "themeId": "research-ethics",
    "titleEn": "Explaining an Academic Choice Ethically",
    "titlePashto": "د علمي انتخاب اخلاقي بیان",
    "contextSummaryEn": "The learner justifies a research choice, addresses participant welfare, and explains how ethical limits shape the design.",
    "contextSummaryPashto": "زده کوونکی د څېړنې انتخاب توجیه کوي، د ګډونوالو هوساینه څېړي او د اخلاقي حدودو اغېز بیانوي.",
    "situation": "choosing how to study a sensitive educational experience",
    "objective": "balance research value with privacy and consent",
    "issue": "richer data would require collecting unnecessary identifiers",
    "choiceA": "use voluntary anonymous interviews with limited data",
    "choiceB": "collect full personal histories by default",
    "reason": "data minimization reduces avoidable risk",
    "evidence": "the research question can be answered without names or addresses",
    "nextAction": "document consent, withdrawal, and secure deletion",
    "simpleAnswer": "The design should collect only the information necessary for the research question, use voluntary consent, and make withdrawal possible without penalty.",
    "detail": "an ethics reviewer requests a retention schedule",
    "vocabularyTargets": [
      "consent",
      "privacy",
      "data minimization",
      "withdrawal"
    ],
    "pathways": [
      "teen",
      "general-adult",
      "job-professional",
      "academic-preparation"
    ],
    "studentRole": "Learner",
    "partnerRole": "Conversation partner"
  }
];

  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function norm(value) { return String(value == null ? '' : value).trim().replace(/\s+/g, ' '); }
  function safeSlug(value) { return norm(value).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
  function unique(values) { var seen={}; return (values||[]).map(String).filter(function(v){var k=v.toLowerCase();if(!v||seen[k])return false;seen[k]=true;return true;}); }
  function hashText(value) {
    var s=String(value==null?'':value), h1=0x811c9dc5, h2=0x9e3779b9;
    for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);h1^=c;h1=Math.imul(h1,0x01000193);h2^=(c+i);h2=Math.imul(h2,0x85ebca6b);}
    return ('00000000'+(h1>>>0).toString(16)).slice(-8)+('00000000'+(h2>>>0).toString(16)).slice(-8);
  }
  function containsUnsafeHtml(value) { return /<\/?[a-z][^>]*>/i.test(String(value||'')); }
  function hasPashtoScript(value) { return /[\u0600-\u06ff]/.test(String(value||'')); }
  function rightRotate(value,amount){return(value>>>amount)|(value<<(32-amount));}
  function sha256(ascii){
    ascii=unescape(encodeURIComponent(String(ascii||'')));
    var mathPow=Math.pow,maxWord=mathPow(2,32),lengthProperty='length',i,j,result='',words=[],asciiBitLength=ascii[lengthProperty]*8;
    var hash=[],k=[],primeCounter=0,isComposite={};
    for(var candidate=2;primeCounter<64;candidate++){if(!isComposite[candidate]){for(i=0;i<313;i+=candidate)isComposite[i]=candidate;hash[primeCounter]=(mathPow(candidate,0.5)*maxWord)|0;k[primeCounter++]=(mathPow(candidate,1/3)*maxWord)|0;}}
    ascii+='\x80';while(ascii[lengthProperty]%64-56)ascii+='\x00';
    for(i=0;i<ascii[lengthProperty];i++){j=ascii.charCodeAt(i);words[i>>2]|=j<<((3-i)%4)*8;}
    words[words[lengthProperty]]=(asciiBitLength/maxWord)|0;words[words[lengthProperty]]=asciiBitLength;
    for(j=0;j<words[lengthProperty];){var w=words.slice(j,j+=16),oldHash=hash.slice(0),workingHash=hash.slice(0);for(i=0;i<64;i++){var w15=w[i-15],w2=w[i-2],a=workingHash[0],e=workingHash[4];var temp1=workingHash[7]+(rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25))+((e&workingHash[5])^((~e)&workingHash[6]))+k[i]+(w[i]=(i<16)?w[i]:(w[i-16]+(rightRotate(w15,7)^rightRotate(w15,18)^(w15>>>3))+w[i-7]+(rightRotate(w2,17)^rightRotate(w2,19)^(w2>>>10)))|0);var temp2=(rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22))+((a&workingHash[1])^(a&workingHash[2])^(workingHash[1]&workingHash[2]));workingHash=[(temp1+temp2)|0].concat(workingHash);workingHash[4]=(workingHash[4]+temp1)|0;workingHash.pop();}for(i=0;i<8;i++)hash[i]=(workingHash[i]+oldHash[i])|0;}
    for(i=0;i<8;i++){for(j=3;j+1;j--){var b=(hash[i]>>(j*8))&255;result+=((b<16)?0:'')+b.toString(16);}}return result;
  }

  var GRAMMAR_BY_LEVEL = {
    starter:['be: I am / this is','present simple for identity and likes'],
    basic:['polite requests with can and would like','simple present questions and time expressions'],
    beginner:['because for simple reasons','sequencing and controlled comparison'],
    elementary:['cause and result linkers','advice, past experience, and future planning'],
    intermediate:['clarification, concession, and comparison','modals for recommendation and negotiation'],
    advanced:['hedging, concession, condition, and reformulation','register control in disagreement and negotiation'],
    academic:['claim-evidence-reasoning structures','qualification, synthesis, limitation, and formal stance']
  };
  var DISCOURSE_BY_LEVEL = {
    starter:['greeting-response','one-step exchange'],
    basic:['polite opening','simple follow-up'],
    beginner:['reason-and-follow-up','controlled sequence'],
    elementary:['problem-cause-solution','two-step follow-up'],
    intermediate:['clarification-and-repair','comparison-and-problem-solving'],
    advanced:['nuanced disagreement','reformulation-and-negotiated-outcome'],
    academic:['claim-evidence-limitation','synthesis-and-qualified-conclusion']
  };

  var EXPLICIT_EXCHANGES = {
    'greetings-name':[
      ['Hello! What is your name?','Hello. My name is Sam.','Say hello and give your name.','open'],
      ['Nice to meet you, Sam. How are you?','I am fine, thank you.','Answer the feeling question in one short sentence.','detail'],
      ['Are you ready for class?','Yes, I am ready.','Give a short yes answer and close the exchange.','close']
    ],
    'classroom-objects':[
      ['What is this on the desk?','This is a pencil.','Name the classroom object.','open'],
      ['Do you need the pencil or the book?','I need the pencil, please.','Choose the object and ask politely.','need'],
      ['Here is the pencil. What do you say?','Thank you.','Thank the partner.','close']
    ],
    'family-members':[
      ['Who is this in your family picture?','This is my mother.','Name one family member.','open'],
      ['And who is the boy beside her?','He is my brother.','Name the second person.','detail'],
      ['Is your family together today?','Yes, my family is together.','Give one short family detail.','close']
    ],
    'food-likes':[
      ['Do you like rice or soup?','I like rice.','State the food you like.','preference'],
      ['What do you drink with it?','I drink warm tea.','Name one drink.','detail'],
      ['Would you like rice now?','Yes, please.','Accept politely.','close']
    ],
    'simple-needs':[
      ['That bag looks heavy. Are you all right?','The bag is too heavy.','State the simple problem.','identify'],
      ['What do you need?','Please help me.','Ask for safe help.','need'],
      ['Shall we leave it here until an adult comes?','Yes, thank you.','Agree to the safe action.','close']
    ],
    'home-location':[
      ['Where do you live?','I live near the school.','Give a simple home location.','open'],
      ['Is it far from here?','No, it is near.','Answer with near or far.','detail'],
      ['Do you walk home?','Yes, I walk home.','Name the simple travel action.','close']
    ],
    'feelings':[
      ['How do you feel today?','I am tired.','Name the feeling.','open'],
      ['Do you need water or a short rest?','I need water, please.','State one simple need.','need'],
      ['Here is some water. Are you better?','Yes, I am better. Thank you.','Answer and thank the partner.','close']
    ],
    'daily-routine':[
      ['What do you do in the morning?','I eat breakfast.','Name one morning action.','open'],
      ['What do you do before breakfast?','I wash my face.','Name the earlier action.','sequence'],
      ['What do you do after breakfast?','I go to class.','Name the next action.','next']
    ],
    'polite-introduction':[
      ['Hello. I am Farid. What is your name?','My name is Amina.','Introduce yourself politely.','open'],
      ['Nice to meet you, Amina. Where are you from?','I am from Kandahar.','Give one place detail.','detail'],
      ['What do you study here?','I study English.','Name the subject in one complete sentence.','detail'],
      ['Is this your first class?','Yes, this is my first class.','Answer the follow-up question.','confirm'],
      ['Welcome to the group.','Thank you. It is nice to meet you.','Thank the partner and close.','close']
    ],
    'buying-bread':[
      ['Good evening. What would you like?','I would like two loaves, please.','Order the bread politely.','request'],
      ['Would you like small loaves or one large loaf?','I would like two small loaves.','Choose the size and amount.','preference'],
      ['These small loaves are fresh. Is that all?','Yes, that is all, thank you.','Confirm the order.','confirm'],
      ['The price is eighty afghanis.','Here is the money.','Respond to the price.','confirm'],
      ['Thank you. Here is your bread.','Thank you. Have a good evening.','Close the shop exchange politely.','close']
    ],
    'bus-time':[
      ['Hello. Which bus are you looking for?','I need the bus to the city.','State the destination.','open'],
      ['The city bus leaves at nine and eleven.','I would like the nine o’clock bus.','Choose the departure time.','preference'],
      ['Why do you need the earlier bus?','I have a class before noon.','Give one simple reason.','reason'],
      ['It leaves from the main stop.','Does it stop near the library?','Ask one useful follow-up question.','question'],
      ['Yes, it does.','Thank you. I will wait at the main stop.','Confirm the stop and close.','close']
    ],
    'school-timetable':[
      ['What class do we have at ten?','We have English at ten.','Name the lesson and time.','open'],
      ['Which room is it in?','It is in room four.','Give the room number.','detail'],
      ['Is science before or after English?','Science is after English.','Use before or after correctly.','sequence'],
      ['How long is the English lesson?','It is one hour.','State the duration.','detail'],
      ['Shall we write the room number down?','Yes. I will write room four.','Agree and confirm the action.','close']
    ],
    'family-weekend':[
      ['What should we do together on Saturday?','Let us visit the park.','Suggest one family activity.','preference'],
      ['Morning or afternoon?','Let us go in the morning.','Choose a time.','confirm'],
      ['Why is the morning better?','The weather is clear in the morning.','Give a short reason.','reason'],
      ['Is everyone free before lunch?','Yes, everyone is free.','Confirm availability.','confirm'],
      ['Good. We will leave at nine.','Great. I will be ready at nine.','Confirm the final time.','close']
    ],
    'clinic-appointment':[
      ['Good morning. How can I help you?','I need a check-up appointment.','State the purpose of the call.','request'],
      ['The morning is full. Is three in the afternoon possible?','Yes, three is possible for me.','Accept the available time.','preference'],
      ['May I have your name?','My name is Nadia.','Give the requested name.','detail'],
      ['So that is Nadia at three today. Is that correct?','Yes, that is correct.','Confirm the name and time.','confirm'],
      ['Please arrive ten minutes early.','Thank you. I will arrive early.','Acknowledge the instruction and close.','close']
    ],
    'restaurant-order':[
      ['Good evening. Are you ready to order?','Yes. I would like soup, please.','Order one dish politely.','request'],
      ['The rice dish is unavailable today. Would you like bread with the soup?','Yes, please bring bread.','Choose an available option.','preference'],
      ['What would you like to drink?','I would like tea.','Order a drink.','detail'],
      ['So you want soup, bread, and tea. Is that right?','Yes, that is right.','Confirm the full order.','confirm'],
      ['Thank you. I will bring it soon.','Thank you.','Close the exchange politely.','close']
    ],
    'neighbour-help':[
      ['Hello. Could you help me move this light box?','Yes, I can help with the light box.','Offer safe help.','open'],
      ['The second box is very heavy.','Let us ask another adult to help with it.','Choose the safer action.','advice'],
      ['Shall we carry the light box together?','Yes. We can carry it together.','Agree on the shared action.','confirm'],
      ['Where should we put it?','Let us put it by the door.','Name the place.','detail'],
      ['Thank you for helping.','You are welcome.','Close the neighbour exchange.','close']
    ]
  };

  var MOVE_TASKS = {
    open:'Open the exchange in a way that fits the situation and register.',
    identify:'State the central problem without adding unrelated information.',
    need:'Express the immediate need clearly and safely.',
    detail:'Give one relevant detail that helps the partner understand the situation.',
    clarify:'Ask for the specific information needed before deciding.',
    question:'Ask a natural follow-up question that moves the exchange forward.',
    request:'Make a clear and polite request.',
    preference:'Choose an option and state the preference clearly.',
    reason:'Give a reason that is directly connected to the choice.',
    cause:'Explain a likely cause without overstating it.',
    alternative:'Consider the other option and explain its limitation.',
    compare:'Compare the available options using a relevant criterion.',
    evidence:'Use the available information to support the response.',
    confirm:'Confirm the important time, place, amount, or action.',
    sequence:'Put the actions in a clear order.',
    advice:'Give practical and proportionate advice.',
    concern:'Acknowledge the partner’s concern before responding.',
    acknowledge:'Recognize the strongest reasonable point in the other view.',
    tradeoff:'Explain a real advantage and disadvantage.',
    challenge:'Respond to a challenge without becoming confrontational.',
    qualification:'Limit the claim so it says no more than the evidence supports.',
    reframe:'Restate the disagreement in neutral, constructive language.',
    compromise:'Propose a workable compromise with a review point.',
    counterproposal:'Offer a proportionate alternative to the current proposal.',
    criterion:'State how the group will judge whether the plan is working.',
    responsibility:'Assign the next responsibility clearly.',
    plan:'Present an ordered plan with a follow-up point.',
    next:'State the immediate next action.',
    review:'Explain when and how the result will be reviewed.',
    limitation:'Name a remaining limitation or uncertainty.',
    close:'Close politely and confirm the agreed action.',
    summary:'Summarize the agreement in concise language.',
    synthesis:'Combine the common ground, disagreement, and next step.',
    interest:'Distinguish the underlying need from a fixed position.',
    assumption:'Test an important assumption with a focused question.',
    qualifiedPosition:'State a position with a clear condition or boundary.',
    rebuttal:'Explain why the strongest opposing point is not decisive.',
    registerShift:'Reformulate the same message in a more constructive register.',
    authority:'Clarify responsibility, authority, and the decision boundary.',
    impliedConcern:'Respond to an implied concern rather than ignoring it.',
    changeMind:'State what evidence would justify changing the position.',
    risk:'Explain a material risk and a proportionate safeguard.',
    document:'Close with a precise record of the agreement.',
    scope:'Define the academic question and its limits.',
    defineTerms:'Clarify a key term before evaluating the claim.',
    provisionalClaim:'State a provisional, testable claim.',
    warrant:'Explain how the evidence supports the claim.',
    method:'Evaluate a method or design choice.',
    sourceQuality:'Evaluate the relevance and quality of a source.',
    alternativeInterpretation:'Present a plausible competing interpretation.',
    compareExplanations:'Compare the explanatory power of two accounts.',
    evidenceStandard:'State what additional evidence would discriminate between accounts.',
    counterclaim:'Present the strongest counterclaim fairly.',
    objection:'Answer a reasoned objection without dismissing it.',
    qualifiedConclusion:'State a conclusion whose scope matches the evidence.',
    implication:'Explain a practical or theoretical implication.',
    researchStep:'Recommend a research step that could reduce uncertainty.',
    implementation:'Recommend a bounded implementation step and evaluation plan.',
    uncertainty:'State what remains uncertain and why.',
    ethics:'Identify an ethical or practical constraint.',
    formalSummary:'Deliver a structured final synthesis.'
  };

  var FLOW_ORDERS = {
    starter:[
      ['open','detail','next'],
      ['open','identify','close'],
      ['open','preference','next'],
      ['open','need','close']
    ],
    basic:[
      ['open','clarify','preference','reason','close'],
      ['open','identify','detail','confirm','next'],
      ['open','request','compare','reason','close'],
      ['open','question','preference','confirm','summary']
    ],
    beginner:[
      ['open','identify','clarify','preference','reason','alternative','next'],
      ['open','detail','question','compare','evidence','confirm','summary'],
      ['open','need','sequence','preference','reason','question','close'],
      ['open','identify','request','alternative','reason','responsibility','summary']
    ],
    elementary:[
      ['open','identify','cause','clarify','preference','compare','evidence','plan','summary'],
      ['open','detail','identify','advice','alternative','acknowledge','sequence','next','review'],
      ['open','request','cause','evidence','preference','concern','compromise','responsibility','close'],
      ['open','identify','question','compare','reason','clarify','plan','criterion','summary']
    ],
    intermediate:[
      ['open','identify','clarify','evidence','compare','tradeoff','acknowledge','reframe','compromise','responsibility','summary'],
      ['open','detail','question','preference','reason','alternative','criterion','concern','plan','review','close'],
      ['open','identify','cause','evidence','challenge','acknowledge','qualification','compromise','criterion','next','synthesis'],
      ['open','request','clarify','compare','tradeoff','question','reframe','responsibility','review','limitation','summary']
    ],
    advanced:[
      ['open','interest','assumption','qualifiedPosition','evidence','acknowledge','rebuttal','reframe','compromise','authority','impliedConcern','changeMind','document'],
      ['open','identify','clarify','compare','tradeoff','challenge','qualification','counterproposal','criterion','responsibility','limitation','review','synthesis'],
      ['open','interest','evidence','alternativeInterpretation','acknowledge','rebuttal','registerShift','compromise','risk','authority','changeMind','next','document'],
      ['open','identify','assumption','qualifiedPosition','evidence','concern','reframe','counterproposal','criterion','risk','responsibility','limitation','synthesis']
    ],
    academic:[
      ['scope','provisionalClaim','evidence','warrant','limitation','alternativeInterpretation','compareExplanations','evidenceStandard','objection','synthesis','qualifiedConclusion','researchStep','ethics','formalSummary'],
      ['scope','defineTerms','evidence','method','limitation','counterclaim','compareExplanations','warrant','objection','qualification','implication','researchStep','ethics','formalSummary'],
      ['scope','provisionalClaim','evidence','sourceQuality','alternativeInterpretation','limitation','compareExplanations','evidenceStandard','counterclaim','synthesis','qualifiedConclusion','implementation','uncertainty','formalSummary'],
      ['scope','defineTerms','method','evidence','warrant','limitation','counterclaim','objection','qualification','synthesis','implication','researchStep','ethics','formalSummary']
    ]
  };

  function cleanClause(value) {
    return norm(value).replace(/[.!?]+$/g,'');
  }
  function asSentence(value) {
    var text=cleanClause(value);
    if(!text) return '';
    return text.charAt(0).toUpperCase()+text.slice(1)+'.';
  }
  function lowerLead(value) {
    var text=cleanClause(value);
    return text ? text.charAt(0).toLowerCase()+text.slice(1) : '';
  }
  function pickFor(s,key,values) {
    var token=parseInt(hashText(s.slug+':'+key).slice(0,8),16);
    return values[token%values.length];
  }
  function flowFamilyIndex(s) {
    var flows=FLOW_ORDERS[s.level]||FLOW_ORDERS.beginner;
    return parseInt(hashText('flow:'+s.slug).slice(0,8),16)%flows.length;
  }
  function flowFor(s) {
    var flows=FLOW_ORDERS[s.level]||FLOW_ORDERS.beginner;
    return flows[flowFamilyIndex(s)];
  }
  function englishOpening(s,level,key) {
    if(level==='starter'||level==='basic') return asSentence(s.simpleAnswer);
    if(level==='beginner') return asSentence(s.simpleAnswer)+' I want to '+lowerLead(s.objective)+'.';
    if(level==='elementary') return 'I would like to discuss '+s.titleEn+'. The immediate difficulty is that '+lowerLead(s.issue)+'.';
    if(level==='intermediate') return 'I would like us to address '+s.titleEn+' without blaming anyone. The practical issue is that '+lowerLead(s.issue)+'.';
    if(level==='advanced') return 'I would like to discuss '+s.titleEn+' in a constructive way. The current arrangement matters because '+lowerLead(s.issue)+'. I want us to keep the shared objective of being able to '+lowerLead(s.objective)+' separate from the proposed mechanism before we decide.';
    return 'The question raised by '+s.titleEn+' is how best to '+lowerLead(s.objective)+', while respecting the limits of the available evidence.';
  }
  function englishMove(s,level,move,index) {
    var title=s.titleEn, issue=cleanClause(s.issue), objective=cleanClause(s.objective), detail=cleanClause(s.detail);
    var reason=cleanClause(s.reason), evidence=cleanClause(s.evidence), choiceA=cleanClause(s.choiceA), choiceB=cleanClause(s.choiceB), nextAction=cleanClause(s.nextAction);
    var p='',a='';
    switch(move) {
      case 'open':
        p=pickFor(s,move,[
          'Hello. We need to discuss '+title+'. How would you begin?',
          'Let us talk about '+title+'. What would you say first?',
          'The topic is '+title+'. Please open the conversation.'
        ]);
        a=englishOpening(s,level,move);
        break;
      case 'identify':
        p=pickFor(s,move,[
          'Before we decide, what is the main problem in this situation?',
          'How would you describe the central difficulty in '+title+'?',
          'What needs to be clarified or solved first in '+title+'?'
        ]);
        a=(level==='starter'||level==='basic')?asSentence(issue):'The central difficulty is that '+lowerLead(issue)+'. Our response should stay focused on that problem.';
        break;
      case 'need':
        p='What do you need right now in this situation?';
        a=(level==='starter')?asSentence(s.simpleAnswer):'I need help to '+lowerLead(objective)+'.';
        break;
      case 'detail':
        p=pickFor(s,move,[
          'What detail would help me understand '+title+' better?',
          'Please add one fact that matters in this situation.',
          'What else should the listener know before responding?'
        ]);
        a=(level==='starter'||level==='basic')?asSentence(detail):'A relevant detail is that '+lowerLead(detail)+'. That affects what we should do next.';
        break;
      case 'clarify':
        p='What would you ask before making a decision in '+title+'?';
        a='Before we decide, could you clarify this point: '+lowerLead(detail)+'? I want to understand how that detail affects our shared objective.';
        break;
      case 'question':
        p='Ask me one follow-up question that will move '+title+' forward.';
        a=pickFor(s,move,[
          'Could you explain what we need to do next to '+lowerLead(objective)+'?',
          'What time or deadline should we set for this next step: '+lowerLead(nextAction)+'?',
          'Which detail should we confirm before we '+lowerLead(nextAction)+'?'
        ]);
        break;
      case 'request':
        p='Make a polite request that fits this situation in '+title+'.';
        a=(level==='basic')?'Could you please help me '+lowerLead(objective)+'?':'I would appreciate it if we could '+lowerLead(choiceA)+'.';
        break;
      case 'preference':
        p='We can '+lowerLead(choiceA)+' or '+lowerLead(choiceB)+'. Which option do you prefer?';
        a=(level==='basic'||level==='beginner')?'I would prefer to '+lowerLead(choiceA)+'.':'I recommend that we '+lowerLead(choiceA)+' because it addresses the immediate need more directly.';
        break;
      case 'reason':
        p='Why does that choice fit the situation?';
        a=(level==='basic')?'It fits because '+lowerLead(reason)+'.':'I prefer that option because '+lowerLead(reason)+'. It also supports the stated objective: to '+lowerLead(objective)+'.';
        break;
      case 'cause':
        p='What may have caused or contributed to the difficulty?';
        a='One factor to investigate is connected to the fact that '+lowerLead(issue)+'. '+asSentence(reason)+' I would still confirm the facts before treating either point as the only cause.';
        break;
      case 'alternative':
        p='Another option is to '+lowerLead(choiceB)+'. How would you respond to that suggestion?';
        a='That option may help in one respect, but it is less suitable here because the main issue is that '+lowerLead(issue)+'.';
        break;
      case 'compare':
        p='We could either '+lowerLead(choiceA)+' or '+lowerLead(choiceB)+'. Which option better meets the need, and why?';
        a=(level==='basic')?'I prefer to '+lowerLead(choiceA)+' because '+lowerLead(reason)+'.':'The first option responds more directly to the immediate need. The second may be useful later, but it does not deal as clearly with the fact that '+lowerLead(issue)+'.';
        break;
      case 'evidence':
        p='What information supports your response in '+title+', and how does that evidence matter?';
        a=(level==='academic')?'The most directly relevant evidence is that '+lowerLead(evidence)+'. Its value depends on whether that observation is sufficiently reliable and representative.':'The strongest available information is that '+lowerLead(evidence)+'. That supports the proposed action, although it does not answer every question. It also keeps the interpretation proportionate.';
        break;
      case 'confirm':
        p='Please confirm the important detail and the action you will take.';
        a='I understand that '+lowerLead(detail)+'. I will '+lowerLead(nextAction)+'.';
        break;
      case 'sequence':
        p='Put the next actions in a clear order.';
        a='First, I will '+lowerLead(choiceA)+'. Then I will '+lowerLead(nextAction)+', and finally I will confirm the result.';
        break;
      case 'advice':
        p='What practical advice would you give in '+title+'?';
        a='I would advise us to '+lowerLead(choiceA)+'. It is proportionate because '+lowerLead(reason)+', and we can review the result afterwards.';
        break;
      case 'concern':
        p='I am worried that your preferred option may create another problem. How would you respond?';
        a='I understand that concern. We can reduce the risk by confirming this detail before acting: '+asSentence(detail)+' After that, we can '+lowerLead(choiceA)+'.';
        break;
      case 'acknowledge':
        p='What is the strongest reasonable point in favour of '+lowerLead(choiceB)+'?';
        a='The alternative has a legitimate advantage, particularly because '+lowerLead(detail)+'. I accept that point even though I still favour the first option.';
        break;
      case 'tradeoff':
        p='What trade-off would we accept if we '+lowerLead(choiceA)+'?';
        a='That option may require more coordination, but it responds more directly to the fact that '+lowerLead(issue)+'. The trade-off is justified only if we monitor the result.';
        break;
      case 'challenge':
        p='I think the current plan is already good enough. Why should it change?';
        a='I understand the desire to avoid unnecessary change. However, the information that '+lowerLead(evidence)+' suggests that the present plan does not fully enable us to '+lowerLead(objective)+'.';
        break;
      case 'qualification':
        p='Can you state your position without making it sound absolute?';
        a='In '+title+', the available information makes the preferred option appear more suitable for the stated objective. That conclusion should be reviewed if new evidence about '+lowerLead(detail)+' changes the balance.';
        break;
      case 'reframe':
        p='Restate the disagreement so that it focuses on the problem rather than the people.';
        a='The disagreement is about how best to '+lowerLead(objective)+', not about anyone’s intention. We can compare the options against that shared purpose.';
        break;
      case 'compromise':
        p='Can you suggest a compromise between '+lowerLead(choiceA)+' and '+lowerLead(choiceB)+'?';
        a='We could begin by '+lowerLead(choiceA)+' for a defined period, then review the result before deciding whether to '+lowerLead(choiceB)+'.';
        break;
      case 'counterproposal':
        p='The current proposal is to '+lowerLead(choiceB)+'. What proportionate alternative would you put forward?';
        a='I propose that we '+lowerLead(choiceA)+' first, with a clear checkpoint and the option to revise the plan if the evidence does not improve.';
        break;
      case 'criterion':
        p='What result would show that the plan for '+title+' is working?';
        a='The plan should be judged by whether it enables us to '+lowerLead(objective)+'. It should also reduce the problem described here: '+asSentence(issue);
        break;
      case 'responsibility':
        p='Who will do what after this conversation?';
        a='I will '+lowerLead(nextAction)+'. The other person should confirm the remaining information, and we should record when the result will be reviewed.';
        break;
      case 'plan':
        p='Give us a short plan for resolving '+title+'.';
        a='First, we should '+lowerLead(choiceA)+'. Next, we should '+lowerLead(nextAction)+'. We will then check whether the action resolved the issue described here: '+asSentence(issue);
        break;
      case 'next':
        p='What will you do next?';
        a=(level==='starter')?'I will '+lowerLead(nextAction)+'.':'My next action is to '+lowerLead(nextAction)+'. I will also confirm that '+lowerLead(detail)+'.';
        break;
      case 'review':
        p='When should the decision be reviewed, and what should we check?';
        a='We should review it after the first action is complete. We will compare the result with this information: '+asSentence(evidence)+' We will also check whether any new problem has appeared.';
        break;
      case 'limitation':
        p='What remains uncertain after this discussion?';
        a='One uncertainty remains: '+lowerLead(issue)+'. We should not claim more than the evidence supports until that point is resolved.';
        break;
      case 'close':
        p='Please close the exchange politely and confirm the agreed action.';
        a=(level==='starter')?'Thank you. I will '+lowerLead(nextAction)+'.':(level==='basic'?'Thank you. I will '+lowerLead(nextAction)+'.':'Thank you. We have agreed to '+lowerLead(choiceA)+', and I will '+lowerLead(nextAction)+'.');
        break;
      case 'summary':
        p='How would you summarize the agreement in '+title+'?';
        a=(level==='basic')?'We agreed to '+lowerLead(nextAction)+'.':'We agreed on the purpose, the first action, and the follow-up. The immediate step is to '+lowerLead(nextAction)+'.';
        break;
      case 'synthesis':
        p='Bring together the common ground, the disagreement, and the next step.';
        a='Both sides want to '+lowerLead(objective)+'. They differ over whether to '+lowerLead(choiceA)+' or '+lowerLead(choiceB)+', so the next step is to '+lowerLead(nextAction)+' and review the result against a shared criterion.';
        break;
      case 'interest':
        p='What underlying need matters more than either fixed position?';
        a='The underlying interest is our ability to '+lowerLead(objective)+'. The discussion should therefore focus on that need rather than treating either option as an end in itself.';
        break;
      case 'assumption':
        p='What assumption behind the proposal to '+lowerLead(choiceB)+' should be tested?';
        a='We should test the assumption that the second option is necessary or lower-risk. What evidence shows that it would address the problem that '+lowerLead(issue)+' more effectively?';
        break;
      case 'qualifiedPosition':
        p='State your preferred position and the condition that limits it.';
        a='My current position is that we should '+lowerLead(choiceA)+'. I would support it only if '+lowerLead(detail)+' and the agreed review point is respected.';
        break;
      case 'rebuttal':
        p='The alternative seems simpler. Why is that not decisive?';
        a='Simplicity is a genuine benefit, but it is not decisive when '+lowerLead(issue)+'. A simpler action is only preferable if it still achieves the shared objective.';
        break;
      case 'registerShift':
        p='Say the same disagreement in language that protects the working relationship.';
        a='I see the practical reason for the proposal. My concern is with its effect on our ability to '+lowerLead(objective)+', so I would like us to examine a more proportionate option.';
        break;
      case 'authority':
        p='Clarify responsibility and the point at which authority changes hands.';
        a='I can '+lowerLead(nextAction)+', provided that the final decision, responsible person, and review date are recorded. Any change beyond that boundary should return to the group.';
        break;
      case 'impliedConcern':
        p='If the unspoken concern is delay or extra work, how would you address it?';
        a='We can address that concern by setting a deadline and limiting the first action to '+lowerLead(choiceA)+'. The review point prevents the arrangement from continuing without evidence.';
        break;
      case 'changeMind':
        p='What evidence would make you reconsider the preferred option?';
        a='I would reconsider if reliable evidence showed that '+lowerLead(choiceB)+' achieved the objective with lower risk and without worsening '+lowerLead(issue)+'.';
        break;
      case 'risk':
        p='What risk must be controlled before the proposal proceeds?';
        a='The material risk is that '+lowerLead(issue)+'. A proportionate safeguard is to limit the first step, record responsibility, and review the evidence before expansion.';
        break;
      case 'document':
        p='What should the written record of '+title+' contain?';
        a='It should record the decision to '+lowerLead(choiceA)+', the reason, the responsible person, the next action to '+lowerLead(nextAction)+', and the date for review.';
        break;
      case 'scope':
        p='Before taking a position, how would you define the question and its scope?';
        a='The question raised by '+title+' is how best to '+lowerLead(objective)+'. The discussion can evaluate the available evidence in this context, but it cannot establish broader claims without further study.';
        break;
      case 'defineTerms':
        p='Which term or distinction must be clarified before this claim can be evaluated?';
        a='We should distinguish the immediate outcome from the broader claim. In this discussion, the outcome concerns '+lowerLead(detail)+', whereas the broader claim would require evidence across additional contexts.';
        break;
      case 'provisionalClaim':
        p='State a provisional claim that could be revised if the evidence changes.';
        a='My provisional claim is that we should '+lowerLead(choiceA)+'. This remains conditional on the evidence that '+lowerLead(evidence)+' and on the limitations already identified.';
        break;
      case 'warrant':
        p='How does the evidence support the claim rather than merely repeat an observation?';
        a='The evidence matters because '+lowerLead(evidence)+'. That observation supports the proposed action by showing a direct connection to the stated objective: to '+lowerLead(objective)+'. The mechanism still requires examination.';
        break;
      case 'method':
        p='What methodological choice most affects the strength of the conclusion?';
        a='The conclusion depends on whether the method can separate the main explanation from the alternative of trying to '+lowerLead(choiceB)+'. A stronger design would make that comparison explicit and report the remaining bias.';
        break;
      case 'sourceQuality':
        p='How would you judge whether the evidence source is strong enough for this claim?';
        a='I would assess its relevance, independence, sample or coverage, and transparency. The statement that '+lowerLead(evidence)+' is useful, but its weight depends on how that information was produced.';
        break;
      case 'alternativeInterpretation':
        p='What plausible alternative interpretation should the discussion consider?';
        a='An alternative interpretation is that the need to '+lowerLead(choiceB)+' accounts for part of the result. That possibility should be compared with the preferred explanation rather than dismissed.';
        break;
      case 'compareExplanations':
        p='Compare the explanatory power of the preferred account and the alternative.';
        a='The preferred account explains the main pattern because '+lowerLead(reason)+'. The alternative may better explain this specific detail: '+lowerLead(detail)+'. The comparison therefore depends on which evidence each account predicts.';
        break;
      case 'evidenceStandard':
        p='What additional evidence would distinguish between these explanations?';
        a='We need independent evidence that tests whether '+lowerLead(choiceA)+' produces a different result from '+lowerLead(choiceB)+'. The measurement should be defined before the comparison is made.';
        break;
      case 'counterclaim':
        p='Present the strongest counterclaim fairly before responding to it.';
        a='The strongest counterclaim is that we should '+lowerLead(choiceB)+' because the current evidence may not justify the preferred intervention. That is a serious challenge, especially given that '+lowerLead(issue)+'.';
        break;
      case 'objection':
        p='How would you answer the objection without pretending it has no force?';
        a='The objection narrows the scope of the claim and should be reflected in the conclusion. It does not eliminate the evidence that '+lowerLead(evidence)+', but it prevents an unrestricted generalization.';
        break;
      case 'qualifiedConclusion':
        p='State a conclusion whose scope matches the evidence.';
        a='The most defensible conclusion is that '+lowerLead(choiceA)+' is supported for this context. Broader application remains uncertain because '+lowerLead(issue)+'.';
        break;
      case 'implication':
        p='What practical or theoretical implication follows from this analysis?';
        a='A practical implication is that decisions should remain conditional and reviewable. A theoretical implication is that the relationship between '+lowerLead(evidence)+' and the wider claim should not be treated as automatic.';
        break;
      case 'researchStep':
        p='What research step would most efficiently reduce the remaining uncertainty?';
        a='The next study should '+lowerLead(nextAction)+' and compare the predicted outcomes of both explanations. The criteria for confirmation and revision should be stated in advance.';
        break;
      case 'implementation':
        p='What bounded implementation step could test the proposal without treating it as settled policy?';
        a='A proportionate step is to '+lowerLead(choiceA)+' as a limited pilot. We should define indicators, document unintended effects, and review whether the evidence justifies continuation.';
        break;
      case 'uncertainty':
        p='What uncertainty should remain visible in the final account?';
        a='The unresolved uncertainty is linked to the fact that '+lowerLead(issue)+'. The final account should therefore separate what is observed, what is inferred, and what still requires evidence.';
        break;
      case 'ethics':
        p='What ethical or practical constraint should limit the next step?';
        a='For '+title+', the next step should be proportionate, transparent, and limited to the information needed to '+lowerLead(objective)+'. It should also protect consent, safety, and the right to review or withdraw where relevant.';
        break;
      case 'formalSummary':
        p='Give a formal synthesis of the claim, evidence, limitation, and next step.';
        a='In summary, the evidence that '+lowerLead(evidence)+' supports a cautious preference for trying to '+lowerLead(choiceA)+'. The conclusion is limited by the fact that '+lowerLead(issue)+', and the next step is to '+lowerLead(nextAction)+' so the remaining uncertainty can be tested.';
        break;
      default:
        p='How would you respond in '+title+'?';
        a=englishOpening(s,level,move);
    }
    return {promptEn:p,modelAnswerEn:a};
  }

  var PS_MOVE_PROMPTS = {
    open:'خبرې په مناسب او ادبناک ډول څنګه پیلوئ؟',identify:'په دې حالت کې اصلي ستونزه څه ده؟',need:'همدا اوس څه اړتیا لرئ؟',detail:'کوم مهم جزئیات باید شریک شي؟',clarify:'له پرېکړې مخکې کومه روښانوونکې پوښتنه کوئ؟',question:'کومه تعقیبي پوښتنه خبرې مخته وړي؟',request:'خپله غوښتنه په ادب او روښانه ډول بیان کړئ.',preference:'له دوو انتخابونو کوم یو غوره کوئ؟',reason:'د خپل انتخاب دلیل څه دی؟',cause:'د ستونزې احتمالي لامل څه دی؟',alternative:'بل انتخاب څنګه ارزوئ؟',compare:'دواړه انتخابونه د مهم معیار له مخې پرتله کړئ.',evidence:'کوم معلومات ستاسو ځواب پیاوړی کوي؟',confirm:'مهم معلومات او راتلونکی کار تایید کړئ.',sequence:'کارونه په روښانه ترتیب بیان کړئ.',advice:'عملي او مناسبه مشوره ورکړئ.',concern:'د مقابل لوري اندېښنه ومنئ او ځواب ورکړئ.',acknowledge:'د بل نظر تر ټولو قوي ټکی ومنئ.',tradeoff:'د انتخاب ګټه او زیان دواړه بیان کړئ.',challenge:'د یوې جدي نیوکې په وړاندې ارام ځواب ورکړئ.',qualification:'خپل نظر له مناسب شرط او محدودیت سره بیان کړئ.',reframe:'اختلاف په بې طرفه او رغنده ژبه بیا بیان کړئ.',compromise:'د بیاکتنې له وخت سره یو عملي جوړجاړی وړاندې کړئ.',counterproposal:'د اوسني وړاندیز پر ځای یو مناسب بدیل وړاندې کړئ.',criterion:'د بریا د ارزونې معیار روښانه کړئ.',responsibility:'مسؤلیت او راتلونکی کار وټاکئ.',plan:'منظم او لنډ پلان وړاندې کړئ.',next:'راتلونکی کار څه دی؟',review:'پرېکړه به کله او څنګه بیاکتل کېږي؟',limitation:'کوم محدودیت یا ناڅرګندتیا پاتې ده؟',close:'خبرې په ادب سره پای ته ورسوئ او هوکړه تایید کړئ.',summary:'هوکړه په لنډه توګه بیان کړئ.',synthesis:'ګډ نظر، اختلاف او راتلونکی ګام یوځای بیان کړئ.',interest:'د ثابت دریځ تر شا اصلي اړتیا څه ده؟',assumption:'کومه مهمه فرضیه باید وازمویل شي؟',qualifiedPosition:'خپل دریځ له واضح شرط سره بیان کړئ.',rebuttal:'ولې د بل لوري قوي ټکی وروستۍ پرېکړه نه ټاکي؟',registerShift:'هماغه اختلاف په نرم او مسلکي انداز بیان کړئ.',authority:'مسؤلیت، واک او د پرېکړې پوله روښانه کړئ.',impliedConcern:'پټه اندېښنه په مستقیم او مناسب ډول ځواب کړئ.',changeMind:'کوم شاهد به ستاسو نظر بدل کړي؟',risk:'مهم خطر او د هغه د کمولو لاره بیان کړئ.',document:'په لیکلې هوکړه کې باید څه شامل وي؟',scope:'علمي پوښتنه او د هغې حدود تعریف کړئ.',defineTerms:'کومه اصطلاح یا توپیر باید لومړی روښانه شي؟',provisionalClaim:'یو موقتي او د بدلون وړ ادعا بیان کړئ.',warrant:'وښایئ چې شاهد څنګه د ادعا ملاتړ کوي.',method:'د څېړنې مهمه میتودولوژیکه برخه وارزوئ.',sourceQuality:'د سرچینې کیفیت او تړاو وارزوئ.',alternativeInterpretation:'یو ممکن بدیل تفسیر وړاندې کړئ.',compareExplanations:'د دوو تفسیرونو تشریحي ځواک پرتله کړئ.',evidenceStandard:'کوم اضافي شاهد د تفسیرونو ترمنځ توپیر روښانه کوي؟',counterclaim:'تر ټولو قوي مخالفه ادعا په عادلانه ډول بیان کړئ.',objection:'یوه مستدله نیوکه بې له سپکاوي ځواب کړئ.',qualifiedConclusion:'له شاهد سره برابر محدود نتیجه بیان کړئ.',implication:'د تحلیل عملي یا نظري پایله بیان کړئ.',researchStep:'د ناڅرګندتیا د کمولو لپاره بل څېړنیز ګام وړاندیز کړئ.',implementation:'یو محدود ازمایښتي پلي کول او د ارزونې پلان وړاندیز کړئ.',uncertainty:'پاتې ناڅرګندتیا په څرګنده توګه بیان کړئ.',ethics:'اخلاقي یا عملي محدودیت روښانه کړئ.',formalSummary:'ادعا، شاهد، محدودیت او راتلونکی ګام په منظم ډول لنډ کړئ.'
  };
  var PS_MOVE_ANSWERS = {
    open:'زه خبرې په ادب او روښانه موخه پیلوم.',identify:'اصلي ستونزه باید له اضافي خبرو پرته روښانه شي.',need:'زه خپلې عاجلې او خوندي اړتیا په لنډ ډول بیانوم.',detail:'زه هغه مهم جزئیات شریکوم چې پرېکړه اسانه کوي.',clarify:'زه د پرېکړې مخکې اړین معلومات په روښانه پوښتنه کې غواړم.',question:'زه داسې تعقیبي پوښتنه کوم چې بل عملي ګام روښانه کړي.',request:'زه خپله غوښتنه په ادب، وضاحت او مناسب انداز وړاندې کوم.',preference:'زه لومړی انتخاب غوره کوم، ځکه چې له اصلي موخې سره ښه برابر دی.',reason:'زما دلیل دا دی چې دا انتخاب عملي، مناسب او د اړتیا سره تړلی دی.',cause:'یو احتمالي لامل شته، خو باید له نورو معلوماتو سره تایید شي.',alternative:'بل انتخاب ځینې ګټې لري، خو اصلي ستونزه په بشپړ ډول نه حل کوي.',compare:'لومړی انتخاب عاجلې اړتیا ته نږدې دی؛ دویم انتخاب کېدای شي وروسته ګټور وي.',evidence:'موجود معلومات د دې نظر ملاتړ کوي، خو هره ناڅرګندتیا نه ختموي.',confirm:'زه مهم معلومات او خپل راتلونکی کار په روښانه ډول تاییدوم.',sequence:'لومړی اصلي کار کوم، بیا معلومات تاییدوم او په پای کې پایله ګورم.',advice:'زه یوه عملي، خوندي او د بیاکتنې وړ مشوره وړاندې کوم.',concern:'زه د مقابل لوري اندېښنه منم او د خطر د کمولو لاره وړاندې کوم.',acknowledge:'زه د بل نظر قوي ټکی منم، که څه هم زما لومړنی انتخاب بل دی.',tradeoff:'غوره انتخاب هم ګټه لري او هم لګښت؛ نو پایله باید وڅارل شي.',challenge:'زه نیوکه جدي ګڼم، خو موجود معلومات ښيي چې بدلون ته اړتیا شته.',qualification:'زما نظر د اوسنیو معلوماتو پر بنسټ دی او د نوي شاهد په راتلو بدلېدای شي.',reframe:'اختلاف د اشخاصو په اړه نه دی؛ بحث د ګډې موخې او مناسبې لارې په اړه دی.',compromise:'لومړی یو محدود ګام اخلو، بیا پایله ارزوو او اړتیا وي نو پلان بدلوو.',counterproposal:'زه یو محدود او د بیاکتنې وړ بدیل وړاندیز کوم.',criterion:'بریا هغه وخت ده چې موخه پوره شي او اصلي ستونزه کمه شي.',responsibility:'زه خپل کار اخلم، بل کس پاتې معلومات تاییدوي او د بیاکتنې وخت لیکل کېږي.',plan:'لومړی انتخاب پلي کوو، وروسته پایله ګورو او بیا راتلونکی ګام ټاکو.',next:'زما راتلونکی کار روښانه دی او مهم جزئیات به هم تایید کړم.',review:'له لومړي کار وروسته به پایله د ټاکلي معیار له مخې بیاکتل کېږي.',limitation:'یوه ناڅرګندتیا لا پاتې ده، نو باید له شاهد څخه لویه ادعا ونه کړو.',close:'مننه؛ هوکړه روښانه ده او راتلونکی کار به په ټاکلي ډول ترسره شي.',summary:'موږ پر موخه، لومړي کار او د بیاکتنې پر وخت هوکړه وکړه.',synthesis:'دواړه خواوې ګډه موخه لري، خو د لارې په اړه اختلاف لري؛ راتلونکی ګام به پایله روښانه کړي.',interest:'اصلي اړتیا د ګډې موخې پوره کول دي، نه د یوه ثابت دریځ ساتل.',assumption:'مهمه فرضیه باید د باور وړ شاهد په وسیله وازمویل شي.',qualifiedPosition:'زه له شرط او د بیاکتنې له پولې سره خپل اوسنی دریځ بیانوم.',rebuttal:'سادګي ګټه ده، خو که اصلي خطر پاتې وي نو وروستۍ پرېکړه نه شي ټاکلی.',registerShift:'زه د بل لوري نیت ته درناوی لرم او خپله اندېښنه د اغېز له مخې بیانوم.',authority:'مسؤل کس، د پرېکړې واک او د بیاکتنې وخت باید په لیکلې بڼه روښانه وي.',impliedConcern:'زه پټه اندېښنه د وخت، کار او روښانه معیار په ټاکلو سره ځوابوم.',changeMind:'که باور وړ شاهد وښيي چې بل انتخاب لږ خطر او ښه پایله لري، خپل نظر بدلوم.',risk:'مهم خطر باید په محدود کار، روښانه مسؤلیت او منظمې بیاکتنې سره کم شي.',document:'لیکلې هوکړه باید پرېکړه، دلیل، مسؤل کس، راتلونکی کار او د بیاکتنې نېټه ولري.',scope:'زه علمي پوښتنه د موجود شاهد په حدودو کې تعریفوم او له بې ځایه عمومیت څخه ډډه کوم.',defineTerms:'زه د لنډمهاله پایلې او پراخې ادعا ترمنځ توپیر روښانه کوم.',provisionalClaim:'زما ادعا موقتي ده او د نوي شاهد په رڼا کې بدلېدای شي.',warrant:'شاهد د ادعا ملاتړ کوي ځکه چې د لیدل شوې پایلې او دلیل ترمنځ اړیکه ښيي.',method:'د پایلې ځواک د میتود، پرتله، نمونې او پاتې تعصب له کیفیت سره تړلی دی.',sourceQuality:'سرچینه باید اړونده، خپلواکه، روښانه او د ارزونې وړ وي.',alternativeInterpretation:'یو بدیل تفسیر هم ممکن دی او باید له اصلي تفسیر سره پرتله شي.',compareExplanations:'هر تفسیر باید د هغه شاهد له مخې وارزول شي چې وړاندوینه یې کوي.',evidenceStandard:'موږ خپلواک او له مخکې تعریف شوی شاهد غواړو چې د دوو تفسیرونو توپیر وښيي.',counterclaim:'قوي مخالفه ادعا د موجود شاهد د محدودیتونو له امله جدي ارزونه غواړي.',objection:'نیوکه د ادعا حدود تنګوي، خو موجود شاهد په بشپړ ډول نه له منځه وړي.',qualifiedConclusion:'نتیجه یوازې د همدې حالت لپاره ملاتړ لري؛ پراخ تطبیق لا ناڅرګند دی.',implication:'عملي پرېکړه باید مشروطه او د بیاکتنې وړ وي؛ نظري اړیکه باید اتومات ونه ګڼل شي.',researchStep:'بل څېړنیز ګام باید دواړه تفسیرونه وازمويي او د بدلون معیار له مخکې وټاکي.',implementation:'یو محدود ازمایښت، روښانه شاخصونه او د ناوړه اغېزو ثبت به د پرېکړې کیفیت ښه کړي.',uncertainty:'وروستی راپور باید مشاهده، استنباط او پاتې ناڅرګندتیا جلا وښيي.',ethics:'راتلونکی ګام باید متناسب، روښانه او د رضایت، خوندیتوب او محرمیت ساتونکی وي.',formalSummary:'شاهد د یوې محتاطې پایلې ملاتړ کوي، محدودیت د هغې حدود تنګوي او راتلونکی ګام به پاتې ناڅرګندتیا وازمويي.'
  };
  function pashtoMove(s,move) {
    var prompt='د «'+s.titlePashto+'» په حالت کې: '+(PS_MOVE_PROMPTS[move]||'خپل ځواب په روښانه ډول بیان کړئ.');
    var answer=(PS_MOVE_ANSWERS[move]||'زه خپل ځواب په روښانه او مناسب ډول بیانوم.')+' د موضوع لنډه زمینه: '+s.contextSummaryPashto;
    return {promptPashto:prompt,modelAnswerPashto:answer};
  }
  function englishExchange(s,level,index) {
    var explicit=EXPLICIT_EXCHANGES[s.slug];
    if(explicit&&explicit[index]) {
      var pair=explicit[index], explicitMove=pair[3]||'open', explicitPs=pashtoMove(s,explicitMove);
      return {moveId:explicitMove,interactionFamilyId:level+'-curated-explicit',promptEn:pair[0],modelAnswerEn:pair[1],studentTaskEn:pair[2],promptPashto:explicitPs.promptPashto,modelAnswerPashto:explicitPs.modelAnswerPashto,followUpType:explicitMove};
    }
    var flow=flowFor(s),move=flow[index],en=englishMove(s,level,move,index),ps=pashtoMove(s,move);
    return {
      moveId:move,
      interactionFamilyId:level+'-flow-'+String(flowFamilyIndex(s)+1).padStart(2,'0'),
      promptEn:en.promptEn,
      modelAnswerEn:en.modelAnswerEn,
      studentTaskEn:MOVE_TASKS[move]||'Respond naturally and complete the communicative move.',
      promptPashto:ps.promptPashto,
      modelAnswerPashto:ps.modelAnswerPashto,
      followUpType:move
    };
  }

  function scoringModeFor(level,index) {
    if(level==='starter') return 'model-repeat';
    if(level==='basic') return index<3?'guided-keyword':'intent-plus-keywords';
    if(level==='beginner') return 'intent-plus-keywords';
    if(level==='elementary') return index<6?'structured-response':'teacher-rubric';
    if(level==='intermediate') return index<7?'structured-response':'teacher-rubric';
    if(level==='advanced'||level==='academic') return index<4?'intent-plus-keywords':'teacher-rubric';
    return 'teacher-rubric';
  }
  function rubricFor(level) {
    if(level==='academic') return 'd19-rubric-academic-reasoning';
    if(level==='advanced') return 'd19-rubric-advanced-interaction';
    if(level==='intermediate') return 'd19-rubric-intermediate-response';
    if(level==='elementary') return 'd19-rubric-elementary-task';
    return null;
  }
  function alternatives(model,scenario,index) {
    var out=[], text=norm(model);
    if(/^I would like to /i.test(text)) out.push(text.replace(/^I would like to /i,'I want to '));
    else if(/^I would prefer to /i.test(text)) out.push(text.replace(/^I would prefer to /i,'I prefer to '));
    else if(/^I recommend that we /i.test(text)) out.push(text.replace(/^I recommend that we /i,'I think we should '));
    else if(/^We /i.test(text)) out.push(text.replace(/^We /i,'I think we '));
    else if(/^The /i.test(text)) out.push('In this situation, '+text.charAt(0).toLowerCase()+text.slice(1));
    else if(/^My /i.test(text)) out.push(text.replace(/^My /i,'In my view, my '));
    if(/because/i.test(text)) out.push(text.replace(/because/i,'since'));
    if(/should/i.test(text)) out.push(text.replace(/should/i,'could reasonably'));
    return unique(out.filter(function(x){return norm(x)!==text;})).slice(0,3);
  }
  function keywordGroups(s,index) {
    var words=unique((s.vocabularyTargets||[]).concat(norm(s.objective).toLowerCase().split(/[^a-z]+/).filter(function(w){return w.length>4;})));
    if(!words.length) words=['response'];
    var a=words[index%words.length], b=words[(index+1)%words.length];
    return [[a],[b]];
  }
  function makeTurn(s,dialogueId,index) {
    var level=s.level, ex=englishExchange(s,level,index), mode=scoringModeFor(level,index), rubric=mode==='teacher-rubric'?rubricFor(level):null;
    var required=keywordGroups(s,index);
    var optional=unique((s.vocabularyTargets||[]).filter(function(w){return required.every(function(g){return g.indexOf(w)===-1;});})).slice(0,4).map(function(w){return [w];});
    var focus=unique((s.vocabularyTargets||[]).slice(index%Math.max(1,(s.vocabularyTargets||[]).length)).concat(s.vocabularyTargets||[])).slice(0,2);
    return {
      turnId:dialogueId+'-turn-'+String(index+1).padStart(2,'0'), sequenceOrder:index+1,
      speakerRole:s.partnerRole, dialogueActId:ex.moveId, interactionFamilyId:ex.interactionFamilyId,
      promptEn:ex.promptEn, promptPashto:ex.promptPashto, promptPashtoStatus:'phase-reviewed-unverified-parallel-support',
      studentTaskEn:'Respond as '+s.studentRole+'. '+ex.studentTaskEn,
      modelAnswerEn:ex.modelAnswerEn, modelAnswerPashto:ex.modelAnswerPashto, answerPashtoStatus:'phase-reviewed-unverified-parallel-support',
      pashtoSupportNature:'parallel-meaning-support-pending-d25-human-review',
      acceptableAlternativeAnswers:alternatives(ex.modelAnswerEn,s,index),
      requiredIntentIds:[dialogueId+'-intent-'+String(index+1).padStart(2,'0')],
      requiredKeywordGroups:required, optionalKeywordGroups:optional,
      grammarTargets:clone(GRAMMAR_BY_LEVEL[level]), vocabularyTargets:clone(s.vocabularyTargets),
      pronunciationFocus:focus,
      supportPrompt:LEVEL_SPECS[level].supportMode==='scenario-only'||LEVEL_SPECS[level].supportMode==='formal-task'
        ? 'Review the scenario and task. A complete model is hidden until after the response.'
        : 'Use the visible support words and hear the TTS model when the support contract permits it.',
      followUpType:ex.followUpType,
      scoringMode:mode, scoringContractId:LEVEL_SPECS[level].scoringContractId,
      teacherRubricId:rubric, automatedScoreIsPartial:(mode==='teacher-rubric'||level==='advanced'||level==='academic'),
      retryGuidanceEn:mode==='teacher-rubric'?'Review the task, include the missing idea, and try again; a teacher may record the rubric later.':'Listen again, keep the same intent, and include the required information.',
      retryGuidancePashto:'پوښتنه بیا واورئ، اصلي موخه وساتئ او پاتې مهم معلومات په روښانه ډول ورزیات کړئ.',
      evidenceWeight:mode==='teacher-rubric'?2:1, retryPolicy:'two-guided-attempts-then-manual-or-teacher-fallback',
      technicalFailureBehavior:'academically-neutral-preserve-turn', governanceStatus:'phase-reviewed-candidate-owner-approval-pending'
    };
  }
  function legacyIdsForScenario(s) {
    var bank=(typeof DIALOGUES!=='undefined'&&Array.isArray(DIALOGUES))?DIALOGUES:[];
    var categoryMap={greetings:'daily-life',classroom:'school',academic:'school',science:'school',society:'culture',environment:'culture',media:'culture',services:'daily-life',work:'daily-life'};
    var cat=categoryMap[s.themeId]||s.themeId;
    var matches=bank.filter(function(d){return d&&d.category===cat;}).map(function(d){return d.id;});
    if(!matches.length) matches=bank.map(function(d){return d.id;});
    var offset=Math.abs(parseInt(hashText(s.slug).slice(0,6),16))%Math.max(1,matches.length);
    return matches.length?[matches[offset],matches[(offset+1)%matches.length]].filter(function(x,i,a){return a.indexOf(x)===i;}):[];
  }
  function buildDialogue(s,sequence) {
    var spec=LEVEL_SPECS[s.level], dialogueId='dlg-d19-'+s.level+'-'+safeSlug(s.slug)+'-'+String(sequence).padStart(2,'0');
    var turns=[]; for(var i=0;i<spec.turnCount;i++) turns.push(makeTurn(s,dialogueId,i));
    var base={
      dialogueId:dialogueId,recordVersion:RECORD_VERSION,acceptedLevelId:s.level,minimumLevelId:s.level,maximumLevelId:s.level,
      pathwayIds:clone(s.pathways),themeId:s.themeId,interactionFamilyId:s.level+'-flow-'+String(flowFamilyIndex(s)+1).padStart(2,'0'),titleEn:s.titleEn,titlePashto:s.titlePashto,titlePashtoStatus:'phase-reviewed-unverified',
      contextSummaryEn:s.contextSummaryEn,contextSummaryPashto:s.contextSummaryPashto,
      objectiveIds:[dialogueId+'-objective-01',dialogueId+'-objective-02'],
      objectivesEn:['Complete a level-appropriate spoken exchange about '+s.situation+'.','Use the target grammar, vocabulary, and discourse moves without relying on exact model wording.'],
      grammarTargets:clone(GRAMMAR_BY_LEVEL[s.level]),vocabularyTargets:clone(s.vocabularyTargets),discourseTargets:clone(DISCOURSE_BY_LEVEL[s.level]),
      roles:[s.studentRole,s.partnerRole],studentRole:s.studentRole,appOrPartnerRole:s.partnerRole,
      supportMode:spec.supportMode,expectedResponseDemand:spec.expectedResponseDemand,speedProfile:spec.speedProfile,
      estimatedMinutes:spec.estimatedMinutes,turnCount:turns.length,turns:turns,scoringContractId:spec.scoringContractId,
      pronunciationSupportMode:'tts-primary-real-english-word-focus',pronunciationReviewStatus:'phase-reviewed-pending-human-confirmation',
      translationStatus:'phase-reviewed-unverified',integrityStatus:'phase-verified',editorialStatus:'phase-reviewed',ownerApprovalStatus:'pending',
      officialCandidateEligible:true,officialCurriculumEligible:false,freePracticeEligible:true,
      provenance:{originType:'academy-original',phase:'I6H-D19',authoringMethod:'curated scenario records with four level-specific interaction families and deterministic identity assembly',licenseOrPermissionStatus:'academy-owned',humanLanguageReviewStatus:'pending'},
      sourceLegacyDialogueIds:legacyIdsForScenario(s),contentSignature:''
    };
    var signatureInput=clone(base); delete signatureInput.contentSignature;
    base.contentSignature='d19-'+hashText(JSON.stringify(signatureInput));
    return base;
  }
  function buildCandidates() {
    var seq={}; return SCENARIOS.map(function(s){seq[s.level]=(seq[s.level]||0)+1;return buildDialogue(s,seq[s.level]);});
  }
  function normalizedLegacyLevel(d) {
    var raw=String((d&&d.level)||'').toLowerCase();
    if(raw==='nursery') return 'starter';
    if(raw==='ielts') {
      var id=String(d.id||'');
      return id==='ielts-part1'?'intermediate':'advanced';
    }
    return LEVEL_ORDER.indexOf(raw)!==-1?raw:'beginner';
  }
  function legacyEnglishHash(d) {
    var text=[d.id,d.titleEn,d.level,d.category].concat((d.steps||[]).reduce(function(a,s){return a.concat([s.promptEn||'',s.answerEn||'']);},[])).join('\n');
    return sha256(text);
  }
  function legacyPronunciationStatus(d) {
    var has=(d.steps||[]).some(function(s){return norm(s.phonetic);});
    return has?'legacy-non-english-transliteration-preserved-hidden-from-pronunciation':'missing';
  }
  function buildLegacyDecisions() {
    var bank=(typeof DIALOGUES!=='undefined'&&Array.isArray(DIALOGUES))?DIALOGUES:[];
    var titleGroups={}; bank.forEach(function(d){var k=norm(d.titleEn).toLowerCase();(titleGroups[k]=titleGroups[k]||[]).push(d.id);});
    var duplicateTitleKeys=Object.keys(titleGroups).sort().filter(function(k){return titleGroups[k].length>1;});
    var candidates=buildCandidates();
    return bank.map(function(d){
      var normalized=normalizedLegacyLevel(d), titleKey=norm(d.titleEn).toLowerCase(), group=titleGroups[titleKey]||[];
      var sources=candidates.filter(function(c){return c.sourceLegacyDialogueIds.indexOf(d.id)!==-1;}).map(function(c){return c.dialogueId;});
      var defects=['legacy-three-turn-micro-dialogue','level-demand-contract-not-met','legacy-pronunciation-field-not-english-pronunciation','missing-pashto-title','owner-approval-pending'];
      if(group.length>1) defects.push('duplicate-title-reviewed-and-disambiguated');
      var unsuitable=/job|bank|landlord|complaint|rent|interview|pharmacy|doctor|workplace|salary/i.test((d.titleEn||'')+' '+(d.id||''));
      if(unsuitable) defects.push('unsuitable-for-child-default-routing');
      return {
        legacyDialogueId:d.id,originalTitleEn:d.titleEn||'',originalLegacyLevelId:d.level||'',normalizedAcceptedLevelId:normalized,
        categoryId:d.category||'',exactStepCount:Array.isArray(d.steps)?d.steps.length:0,englishContentHash:legacyEnglishHash(d),
        duplicateTitleGroupId:group.length>1?'dlg-title-group-'+hashText(titleKey).slice(0,8):null,
        contentRelationshipToLegacyTitleGroup:group.length>1?'distinct-progression-shared-legacy-title':'no-duplicate-title-group',
        relationshipToNewD19DialogueIds:sources.length?'partial-conceptual-overlap-source-reference':'no-direct-source-reference',
        exactDuplicateOfLegacyDialogueId:null,
        structuralStatus:'legacy-three-step-micro-dialogue-free-practice-only',pronunciationStatus:legacyPronunciationStatus(d),
        titlePashtoStatus:'missing-pending-d25-human-review',stepPashtoStatus:'present-unverified',
        pathwaySafetyStatus:unsuitable?'restricted-no-child-default':'reviewed-free-practice-context',
        disposition:group.length>1?'duplicate-title-disambiguated':(unsuitable?'retain-free-practice-special-topic':'retain-free-practice-micro-dialogue'),
        officialCandidateEligible:false,officialCurriculumEligible:false,freePracticeEligible:true,ownerApprovalStatus:'pending',sourceForNewDialogueIds:sources,
        defectCodes:defects,requiredActions:['Keep legacy ID accessible in bounded Free Practice.','Never display legacy phonetic/transliteration as English pronunciation.','Complete D25 human Pashto and owner review before any official use.'],
        reviewerRole:'D19 curriculum editor',reviewPhase:'I6H-D19',reviewDate:'2026-07-30T00:00:00.000Z',notes:'Legacy text preserved byte-identical in content.js; no legacy ID was overwritten.'
      };
    });
  }
  function displayTitleFor(d,group,index) {
    if(group.length<2) return d.titleEn||d.id;
    var level=normalizedLegacyLevel(d); var context=(d.category||'context').replace(/-/g,' ');
    return (d.titleEn||d.id)+' — '+level.charAt(0).toUpperCase()+level.slice(1)+' / '+context+' '+(index+1);
  }
  function buildTitleMap() {
    var bank=(typeof DIALOGUES!=='undefined'&&Array.isArray(DIALOGUES))?DIALOGUES:[];
    var groups={}; bank.forEach(function(d){var k=norm(d.titleEn).toLowerCase();(groups[k]=groups[k]||[]).push(d);});
    return Object.keys(groups).sort().filter(function(k){return groups[k].length>1;}).map(function(k,gidx){
      var members=groups[k]; var exactTextHashes={};
      members.forEach(function(d){var t=(d.steps||[]).map(function(s){return norm(s.promptEn)+'|'+norm(s.answerEn);}).join('||');exactTextHashes[d.id]=hashText(t);});
      return {groupId:'dlg-title-group-'+hashText(k).slice(0,8),rawTitleEn:members[0].titleEn,members:members.map(function(d,i){
        var relation=Object.values(exactTextHashes).filter(function(h){return h===exactTextHashes[d.id];}).length>1?'exact-duplicate':'distinct-or-partial-overlap';
        return {legacyDialogueId:d.id,rawTitleEn:d.titleEn,displayTitleEn:displayTitleFor(d,members,i),displayTitlePashto:'pending-human-title-translation',displayTitlePashtoStatus:'missing-pending-d25',normalizedAcceptedLevelId:normalizedLegacyLevel(d),contextLabel:(d.category||'general').replace(/-/g,' '),contentRelationship:relation,relationshipToNewD19DialogueIds:buildCandidates().filter(function(c){return c.sourceLegacyDialogueIds.indexOf(d.id)!==-1;}).map(function(c){return c.dialogueId;})};
      })};
    });
  }
  function buildScoringContracts() {
    return {
      'd19-score-starter':{levelId:'starter',modes:['model-repeat'],automatedScope:'core intent and short model similarity',technicalFailurePolicy:'neutral'},
      'd19-score-basic':{levelId:'basic',modes:['guided-keyword','intent-plus-keywords'],automatedScope:'one complete short sentence with harmless variation',technicalFailurePolicy:'neutral'},
      'd19-score-beginner':{levelId:'beginner',modes:['intent-plus-keywords'],automatedScope:'required intent and key information; exact model wording not required',technicalFailurePolicy:'neutral'},
      'd19-score-elementary':{levelId:'elementary',modes:['structured-response','teacher-rubric'],automatedScope:'task completion, follow-up, grammar target, and key vocabulary; open quality is teacher-reviewed',technicalFailurePolicy:'neutral'},
      'd19-score-intermediate':{levelId:'intermediate',modes:['structured-response','teacher-rubric'],automatedScope:'required intent and key information only; fluency and discourse quality use rubric',technicalFailurePolicy:'neutral'},
      'd19-score-advanced':{levelId:'advanced',modes:['intent-plus-keywords','teacher-rubric'],automatedScope:'partial deterministic checks only; nuance, register, negotiation, and reasoning use rubric',technicalFailurePolicy:'neutral'},
      'd19-score-academic':{levelId:'academic',modes:['intent-plus-keywords','teacher-rubric'],automatedScope:'partial deterministic checks only; evidence, organization, synthesis, and qualification use rubric',technicalFailurePolicy:'neutral'}
    };
  }
  function buildRubrics() {
    return {
      'd19-rubric-elementary-task':{dimensions:['task completion','clarity','grammar control','vocabulary appropriateness','follow-up depth']},
      'd19-rubric-intermediate-response':{dimensions:['task completion','relevance','clarity','organization','grammar control','vocabulary appropriateness','follow-up depth']},
      'd19-rubric-advanced-interaction':{dimensions:['task completion','relevance','clarity','organization','grammar control','vocabulary appropriateness','register','follow-up depth','negotiation and nuance']},
      'd19-rubric-academic-reasoning':{dimensions:['task completion','relevance','clarity','organization','grammar control','vocabulary appropriateness','register','evidence and reasoning','qualification and synthesis']}
    };
  }
  function validatePayload(payload) {
    var errors=[],ids={},turnIds={};
    if(!payload||payload.version!==D19_VERSION) errors.push('invalid-version');
    if(!Array.isArray(payload.legacyEditorialDecisions)||payload.legacyEditorialDecisions.length!==99) errors.push('editorial-decision-count');
    if(!Array.isArray(payload.candidateDialogues)||payload.candidateDialogues.length!==66) errors.push('candidate-count');
    (payload.candidateDialogues||[]).forEach(function(d){
      if(!d.dialogueId||ids[d.dialogueId]) errors.push('duplicate-or-missing-dialogue-id:'+d.dialogueId); ids[d.dialogueId]=true;
      var spec=LEVEL_SPECS[d.acceptedLevelId]; if(!spec||d.turnCount!==spec.turnCount||!Array.isArray(d.turns)||d.turns.length!==spec.turnCount) errors.push('turn-contract:'+d.dialogueId);
      if(!d.pathwayIds.length||d.pathwayIds.some(function(p){return PATHWAYS.indexOf(p)===-1;})) errors.push('pathway:'+d.dialogueId);
      if(!hasPashtoScript(d.titlePashto)||containsUnsafeHtml(d.titlePashto)||containsUnsafeHtml(d.titleEn)) errors.push('title-language:'+d.dialogueId);
      d.turns.forEach(function(t){
        if(!t.turnId||turnIds[t.turnId]) errors.push('duplicate-or-missing-turn:'+t.turnId); turnIds[t.turnId]=true;
        if(!norm(t.promptEn)||!norm(t.modelAnswerEn)||containsUnsafeHtml(t.promptEn)||containsUnsafeHtml(t.modelAnswerEn)) errors.push('unsafe-or-empty-english:'+t.turnId);
        if(!hasPashtoScript(t.promptPashto)||!hasPashtoScript(t.modelAnswerPashto)||containsUnsafeHtml(t.promptPashto)||containsUnsafeHtml(t.modelAnswerPashto)) errors.push('pashto:'+t.turnId);
        if(t.scoringMode==='teacher-rubric'&&!t.teacherRubricId) errors.push('rubric:'+t.turnId);
      });
    });
    var counts=(payload.candidateDialogues||[]).reduce(function(o,d){o[d.acceptedLevelId]=(o[d.acceptedLevelId]||0)+1;return o;},{});
    if(JSON.stringify(counts)!==JSON.stringify({starter:8,basic:8,beginner:10,elementary:10,intermediate:10,advanced:10,academic:10})) errors.push('level-distribution');
    return {valid:errors.length===0,errors:errors};
  }

  var candidates=buildCandidates();
  var payload={
    version:D19_VERSION,recordVersion:RECORD_VERSION,generatedAt:'2026-07-30T00:00:00.000Z',
    acceptedLevelIds:LEVEL_ORDER.slice(),pathwayIds:PATHWAYS.slice(),levelSpecs:clone(LEVEL_SPECS),
    legacyEditorialDecisions:buildLegacyDecisions(),titleDisambiguationGroups:buildTitleMap(),
    candidateDialogues:candidates,scoringContracts:buildScoringContracts(),teacherRubrics:buildRubrics(),
    taskGovernanceModel:'turns-nested-under-dialogue-governance-record',ownerApprovalStatus:'pending',officialCurriculumEligibleCount:0
  };
  var validation=validatePayload(payload);
  payload.validation=validation;
  window.ZirakDialogueCurriculumD19=payload;
  if(!validation.valid){console.error('[D19] payload validation failed:',validation.errors);return;}
  if(window.ZirakCurriculumContent&&typeof window.ZirakCurriculumContent.registerDialogueCurriculumD19==='function'){
    window.ZirakCurriculumContent.registerDialogueCurriculumD19(payload);
  } else {
    console.error('[D19] ZirakCurriculumContent registration authority is unavailable.');
  }
})();
