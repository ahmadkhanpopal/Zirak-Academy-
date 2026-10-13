/* =====================================================================
   ZIRAK ENGLISH LANGUAGE ACADEMY — Real Class Content (Month 1, Week 1)
   ځيرک د انګليسي ژبي اکاډمي
   ---------------------------------------------------------------------
   PHASE H4A: Month 1 / Week 1 / Day 1–2 — Real Class Content
   PHASE H4B: Month 1 / Week 1 / Day 3–5 — Real Class Content (added)
   ---------------------------------------------------------------------
   This file contains REAL, ready-to-use class content for exactly:
     - Month 1 / Week 1 / Day 1  ("Introducing myself and my class")
     - Month 1 / Week 1 / Day 2  ("My family and my daily study")
     - Month 1 / Week 1 / Day 3  ("My classroom and my things")
     - Month 1 / Week 1 / Day 4  ("My day and simple actions")
     - Month 1 / Week 1 / Day 5  ("Week 1 review and confidence speaking")
   That is 5 days x 9 blocks = 45 records — a COMPLETE first week. Week 2,
   Month 2, and every other week/month intentionally have NO records
   here — they remain placeholder/pending via the H3 content-slot map,
   exactly as before.

   Content notes:
     - English is the main learning language; Pashto lines are
       support translations only (never spoken by TTS by this module).
     - Content is simple, respectful, and institute-appropriate; no
       images, no flags, no political or sensitive topics are referenced.
     - This module does not call any speech/TTS function itself.

   This module is purely additive: it registers itself with
   zirak-classpath-content-map.js's real-content registry (Phase H4A
   addition) so resolveBlockContent() picks it up automatically. If the
   content-map module isn't loaded yet, this file simply does nothing
   harmful — registration is skipped defensively.
   ===================================================================== */
(function () {
  'use strict';

  var RECORDS = {};
  function add(slotId, rec){ rec.slotId = slotId; RECORDS[slotId] = rec; }

  /* ===================================================================
     DAY 1 — Theme: "Introducing myself and my class"
     =================================================================== */

  add('m1_w1_d1_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Day 1',
    teacherInstructions:'Welcome each student by name as they arrive. Mark attendance. Keep it warm, calm, and short.',
    studentInstructions:'Say hello to your teacher and classmates, then sit in your place.',
    englishContent:['Good morning!','Hello, teacher.','Hello, everyone.'],
    pashtoSupport:['سهار مو پخیر!','سلام، ښوونکیه.','سلام، ګرانو ملګرو.'],
    dariSupport:['سهار مو پخیر!','سلام، ښوونکیه.','سلام، ګرانو ملګرو.'],
    practiceItems:['Say: Good morning, teacher.','Say your name out loud.'],
    successCriteria:'Student greets the teacher and is seated and ready to start.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w1_d1_weak_warmup', {
    status:'ready',
    title:'Warmup — My Name Is…',
    teacherInstructions:'Model "My name is ___." on the board. Invite 3–4 students to repeat it with their own name.',
    studentInstructions:'Listen first, then say your own name using the sentence pattern.',
    englishContent:['My name is ___.','What is your name?','My name is ___. Nice to meet you.'],
    pashtoSupport:['زما نوم ___ دی.','ستا نوم څه دی؟','زما نوم ___ دی. د لیدنې خوشحالي.'],
    dariSupport:['زما نوم ___ دی.','ستا نوم څه دی؟','زما نوم ___ دی. د لیدنې خوشحالي.'],
    practiceItems:['Say: My name is ___.','Ask a classmate: What is your name?'],
    successCriteria:'Student can say their own name in a full sentence.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w1_d1_wizard', {
    status:'ready',
    title:'Speaking & Listening — Meeting Someone New',
    teacherInstructions:'Say the short dialogue twice. Have students repeat each line after you, then in pairs.',
    studentInstructions:'Listen first, then repeat each line clearly.',
    englishContent:[
      'A: Hello! My name is Ahmad.',
      'B: Hello, Ahmad. My name is Zahra.',
      'A: Nice to meet you, Zahra.',
      'B: Nice to meet you too.'
    ],
    pashtoSupport:[
      'A: سلام! زما نوم احمد دی.',
      'B: سلام، احمده. زما نوم زهرا دی.',
      'A: زهرا، ستا لیدل خوشحالي وه.',
      'B: زما هم ستا لیدل خوشحالي وه.'
    ],
    dariSupport:[
      'A: سلام! زما نوم احمد دی.',
      'B: سلام، احمده. زما نوم زهرا دی.',
      'A: زهرا، ستا لیدل خوشحالي وه.',
      'B: زما هم ستا لیدل خوشحالي وه.'
    ],
    practiceItems:['Repeat each line after the teacher.','Practice the 4-line dialogue with a partner.'],
    successCriteria:'Student can say the 4-line dialogue with a partner.',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w1_d1_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — Class Introductions',
    teacherInstructions:'Use the classroom book/workbook "Introducing Yourself" page if available. Otherwise lead a simple round of introductions on the board (name + one fact).',
    studentInstructions:'Follow your teacher\u2019s book or board activity for this part of class.',
    englishContent:['This is my book.','This is my class.','This is my teacher.'],
    pashtoSupport:['دا زما کتاب دی.','دا زما ټولګی دی.','دا زما ښوونکی دی.'],
    dariSupport:['دا زما کتاب دی.','دا زما ټولګی دی.','دا زما ښوونکی دی.'],
    practiceItems:['Point to your book and say: This is my book.'],
    successCriteria:'Student can name 3 classroom items using "This is my ___."',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w1_d1_grammar', {
    status:'ready',
    title:'Grammar — I am / You are / This is',
    teacherInstructions:'Write the 3 patterns on the board with 2 examples each. Ask each student to make one new sentence per pattern.',
    studentInstructions:'Learn 3 simple sentence patterns and try making your own sentence with each.',
    englishContent:[
      'I am a student.','I am from Afghanistan.',
      'You are my classmate.',
      'This is my book.','This is my class.'
    ],
    pashtoSupport:[
      'زه یو زده‌کوونکی یم.','زه له افغانستانه یم.',
      'تاسو زما ملګری یاست.',
      'دا زما کتاب دی.','دا زما ټولګی دی.'
    ],
    dariSupport:[
      'زه یو زده‌کوونکی یم.','زه له افغانستانه یم.',
      'تاسو زما ملګری یاست.',
      'دا زما کتاب دی.','دا زما ټولګی دی.'
    ],
    practiceItems:['Make a sentence with "I am ___."','Make a sentence with "This is ___."'],
    successCriteria:'Student can correctly use "I am", "You are", and "This is" in a sentence.',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w1_d1_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Introduce Yourself',
    teacherInstructions:'Pair students up. Each pair introduces themselves using Day 1 sentences. Walk around and listen.',
    studentInstructions:'Work with a partner. Say your name and one fact about yourself, then listen to your partner.',
    englishContent:['My name is ___.','I am from ___.','Nice to meet you.'],
    pashtoSupport:['زما نوم ___ دی.','زه له ___ نه یم.','ستا لیدل خوشحالي وه.'],
    dariSupport:['زما نوم ___ دی.','زه له ___ نه یم.','ستا لیدل خوشحالي وه.'],
    practiceItems:['Tell your partner your name.','Tell your partner where you are from.'],
    successCriteria:'Each student introduces themselves to at least one classmate.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w1_d1_quiz_listening', {
    status:'ready',
    title:'Quick Review — Day 1',
    teacherInstructions:'Ask 3–4 students to say their name and one Day 1 sentence aloud as a quick check.',
    studentInstructions:'Be ready to say your name and one sentence from today\u2019s class.',
    englishContent:['My name is ___.','I am a student.','This is my book.'],
    pashtoSupport:['زما نوم ___ دی.','زه یو زده‌کوونکی یم.','دا زما کتاب دی.'],
    dariSupport:['زما نوم ___ دی.','زه یو زده‌کوونکی یم.','دا زما کتاب دی.'],
    practiceItems:['Say your name clearly.','Say one sentence you learned today.'],
    successCriteria:'Student says their name and one full sentence without help.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w1_d1_arcade', {
    status:'ready',
    title:'Arcade Goal — Names (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot simply records the learning goal a future Arcade round will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing your name sentence — a fun game will use it later.',
    englishContent:['My name is ___.'],
    pashtoSupport:['زما نوم ___ دی.'],
    dariSupport:['زما نوم ___ دی.'],
    practiceItems:['Practice saying your name sentence once more.'],
    successCriteria:'Not applicable — placeholder tied to the Day 1 goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w1_d1_homework', {
    status:'ready',
    title:'Homework & Report — Day 1',
    teacherInstructions:'Ask the student to repeat their name sentence at home to a family member. Send a short WhatsApp update to the father using the app\u2019s report button.',
    studentInstructions:'At home, say: "My name is ___. I am a student." to your family.',
    englishContent:['My name is ___.','I am a student.'],
    pashtoSupport:['زما نوم ___ دی.','زه یو زده‌کوونکی یم.'],
    dariSupport:['زما نوم ___ دی.','زه یو زده‌کوونکی یم.'],
    practiceItems:['Say your name sentence to a family member tonight.'],
    successCriteria:'Student practiced the sentence at home (teacher/parent confirmation).',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ===================================================================
     DAY 2 — Theme: "My family and my daily study"
     =================================================================== */

  add('m1_w1_d2_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Day 2',
    teacherInstructions:'Greet students by name (practice from Day 1). Mark attendance.',
    studentInstructions:'Greet your teacher by saying "Good morning" and your name if asked.',
    englishContent:['Good morning, teacher.','I am here.'],
    pashtoSupport:['سهار مو پخیر، ښوونکیه.','زه دلته یم.'],
    dariSupport:['سهار مو پخیر، ښوونکیه.','زه دلته یم.'],
    practiceItems:['Greet the teacher in English.'],
    successCriteria:'Student greets the teacher and confirms attendance in English.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w1_d2_weak_warmup', {
    status:'ready',
    title:'Warmup — Review Day 1',
    teacherInstructions:'Ask 2–3 students to repeat their Day 1 self-introduction sentence from memory.',
    studentInstructions:'Try to say your name sentence from yesterday without looking.',
    englishContent:['My name is ___.','I am a student.','Nice to meet you.'],
    pashtoSupport:['زما نوم ___ دی.','زه یو زده‌کوونکی یم.','ستا لیدل خوشحالي وه.'],
    dariSupport:['زما نوم ___ دی.','زه یو زده‌کوونکی یم.','ستا لیدل خوشحالي وه.'],
    practiceItems:['Say your Day 1 sentence from memory.'],
    successCriteria:'Student recalls at least one Day 1 sentence.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w1_d2_wizard', {
    status:'ready',
    title:'Speaking & Listening — My Family',
    teacherInstructions:'Say each line and have students repeat. Keep examples simple; avoid using real photos of people — use the printed/board word only.',
    studentInstructions:'Listen, then repeat each line about family members.',
    englishContent:[
      'This is my father.',
      'This is my mother.',
      'This is my brother.',
      'This is my sister.'
    ],
    pashtoSupport:[
      'دا زما پلار دی.',
      'دا زما مور ده.',
      'دا زما ورور دی.',
      'دا زما خور ده.'
    ],
    dariSupport:[
      'دا زما پلار دی.',
      'دا زما مور ده.',
      'دا زما ورور دی.',
      'دا زما خور ده.'
    ],
    practiceItems:['Say one sentence about a family member.','Repeat all four lines with a partner.'],
    successCriteria:'Student can say at least 2 family-member sentences correctly.',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w1_d2_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — Talking About Family',
    teacherInstructions:'Use the classroom book/workbook family-vocabulary page if available. Otherwise list the family words on the board and drill pronunciation.',
    studentInstructions:'Follow your teacher\u2019s book or board activity about family words.',
    englishContent:['father','mother','brother','sister'],
    pashtoSupport:['پلار','مور','ورور','خور'],
    dariSupport:['پلار','مور','ورور','خور'],
    practiceItems:['Repeat each family word after the teacher.'],
    successCriteria:'Student can pronounce the 4 family words clearly.',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w1_d2_grammar', {
    status:'ready',
    title:'Grammar — This is / These are + simple present',
    teacherInstructions:'Introduce "This is" (one) vs "These are" (more than one). Add 2 simple present examples: "I study English. I come to class."',
    studentInstructions:'Learn the difference between "This is" and "These are", and practice 2 simple action sentences.',
    englishContent:[
      'This is my brother.',
      'These are my books.',
      'I study English.',
      'I come to class.'
    ],
    pashtoSupport:[
      'دا زما ورور دی.',
      'دا زما کتابونه دي.',
      'زه انګلیسي ښایم.',
      'زه ټولګي ته راځم.'
    ],
    dariSupport:[
      'دا زما ورور دی.',
      'دا زما کتابونه دي.',
      'زه انګلیسي ښایم.',
      'زه ټولګي ته راځم.'
    ],
    practiceItems:['Make one sentence with "This is".','Make one sentence with "These are".'],
    successCriteria:'Student can use "This is" for one item and "These are" for more than one.',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w1_d2_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Talking About Family',
    teacherInstructions:'Pair students. Each tells their partner about one family member using "This is my ___."',
    studentInstructions:'Tell your partner about one person in your family.',
    englishContent:['This is my father.','This is my sister.','I study English every day.'],
    pashtoSupport:['دا زما پلار دی.','دا زما خور ده.','زه هره ورځ انګلیسي ښایم.'],
    dariSupport:['دا زما پلار دی.','دا زما خور ده.','زه هره ورځ انګلیسي ښایم.'],
    practiceItems:['Tell your partner about one family member.'],
    successCriteria:'Each student shares at least one family sentence with a partner.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w1_d2_quiz_listening', {
    status:'ready',
    title:'Quick Review — Day 2',
    teacherInstructions:'Ask students to name 2 family words and say one sentence with "This is" or "These are".',
    studentInstructions:'Be ready to say 2 family words and one sentence from today.',
    englishContent:['father','mother','This is my book.','These are my books.'],
    pashtoSupport:['پلار','مور','دا زما کتاب دی.','دا زما کتابونه دي.'],
    dariSupport:['پلار','مور','دا زما کتاب دی.','دا زما کتابونه دي.'],
    practiceItems:['Say two family words.','Say one sentence with "This is" or "These are".'],
    successCriteria:'Student says 2 family words and 1 correct sentence.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w1_d2_arcade', {
    status:'ready',
    title:'Arcade Goal — Family Words (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot records the learning goal a future Arcade round (family word matching) will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing family words — a matching game will use them later.',
    englishContent:['father','mother','brother','sister'],
    pashtoSupport:['پلار','مور','ورور','خور'],
    dariSupport:['پلار','مور','ورور','خور'],
    practiceItems:['Review the 4 family words once more.'],
    successCriteria:'Not applicable — placeholder tied to the Day 2 goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w1_d2_homework', {
    status:'ready',
    title:'Homework & Report — Day 2',
    teacherInstructions:'Ask the student to introduce one family member at home using "This is my ___." Send a short WhatsApp update to the father.',
    studentInstructions:'At home, say "This is my father / mother / brother / sister" about one family member.',
    englishContent:['This is my ___.'],
    pashtoSupport:['دا زما ___ دی/ده.'],
    dariSupport:['دا زما ___ دی/ده.'],
    practiceItems:['Introduce one family member at home using "This is my ___."'],
    successCriteria:'Student practiced a family sentence at home (teacher/parent confirmation).',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ===================================================================
     DAY 3 — Theme: "My classroom and my things"
     =================================================================== */

  add('m1_w1_d3_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Day 3',
    teacherInstructions:'Greet students by name. Mark attendance. Ask one student to greet the class in English.',
    studentInstructions:'Greet your teacher and classmates in English.',
    englishContent:['Good morning, teacher.','Good morning, everyone.'],
    pashtoSupport:['سهار مو پخیر، ښوونکیه.','سهار مو پخیر، ګرانو ملګرو.'],
    dariSupport:['سهار مو پخیر، ښوونکیه.','سهار مو پخیر، ګرانو ملګرو.'],
    practiceItems:['Greet the class in English.'],
    successCriteria:'Student greets the teacher and class in English.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w1_d3_weak_warmup', {
    status:'ready',
    title:'Warmup — Review Day 1–2',
    teacherInstructions:'Ask 2–3 students to say their name sentence and one family sentence from memory.',
    studentInstructions:'Try to remember one sentence from Day 1 and one from Day 2.',
    englishContent:['My name is ___.','This is my father.','This is my mother.'],
    pashtoSupport:['زما نوم ___ دی.','دا زما پلار دی.','دا زما مور ده.'],
    dariSupport:['زما نوم ___ دی.','دا زما پلار دی.','دا زما مور ده.'],
    practiceItems:['Say your name sentence.','Say one family sentence.'],
    successCriteria:'Student recalls at least one sentence from each previous day.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w1_d3_wizard', {
    status:'ready',
    title:'Speaking & Listening — My Classroom Things',
    teacherInstructions:'Hold up or point to each classroom item (pen, book, notebook, chair, table) and say the sentence. Have students repeat.',
    studentInstructions:'Listen, then repeat each sentence about classroom items.',
    englishContent:[
      'This is my pen.',
      'This is my book.',
      'This is my notebook.',
      'This is my chair.',
      'This is my table.'
    ],
    pashtoSupport:[
      'دا زما کلک دی.',
      'دا زما کتاب دی.',
      'دا زما یادښت دفتر دی.',
      'دا زما څوکی ده.',
      'دا زما میز دی.'
    ],
    dariSupport:[
      'دا زما کلک دی.',
      'دا زما کتاب دی.',
      'دا زما یادښت دفتر دی.',
      'دا زما څوکی ده.',
      'دا زما میز دی.'
    ],
    practiceItems:['Point to an item and say its sentence.','Repeat all five lines with a partner.'],
    successCriteria:'Student can name at least 3 classroom items using "This is my ___."',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w1_d3_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — Classroom Objects',
    teacherInstructions:'Use the classroom book/workbook objects page if available. Otherwise place real classroom items on the table and name each one together.',
    studentInstructions:'Follow your teacher\u2019s book or table activity about classroom objects.',
    englishContent:['pen','book','notebook','chair','table'],
    pashtoSupport:['کلک','کتاب','یادښت دفتر','څوکی','میز'],
    dariSupport:['کلک','کتاب','یادښت دفتر','څوکی','میز'],
    practiceItems:['Repeat each object word after the teacher.'],
    successCriteria:'Student can pronounce the 5 classroom object words clearly.',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w1_d3_grammar', {
    status:'ready',
    title:'Grammar — This is / I have / I open / I write',
    teacherInstructions:'Write the 4 patterns on the board with one example each. Ask each student to make one new sentence with "I have".',
    studentInstructions:'Learn 4 simple patterns: This is, I have, I open, I write.',
    englishContent:[
      'This is my book.',
      'I have a pen.',
      'I have a book.',
      'I open my book.',
      'I write in my notebook.'
    ],
    pashtoSupport:[
      'دا زما کتاب دی.',
      'زه یو کلک لرم.',
      'زه یو کتاب لرم.',
      'زه خپل کتاب پرانیزم.',
      'زه په خپل یادښت دفتر کې لیکم.'
    ],
    dariSupport:[
      'دا زما کتاب دی.',
      'زه یو کلک لرم.',
      'زه یو کتاب لرم.',
      'زه خپل کتاب پرانیزم.',
      'زه په خپل یادښت دفتر کې لیکم.'
    ],
    practiceItems:['Make a sentence with "I have ___."','Make a sentence with "I open ___." or "I write ___."'],
    successCriteria:'Student can correctly use "I have", "I open", and "I write" in a sentence.',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w1_d3_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Show and Tell Classroom Items',
    teacherInstructions:'Pair students. Each shows one item (pen, book, notebook) to their partner and says a sentence about it.',
    studentInstructions:'Show your partner one classroom item and say a sentence about it.',
    englishContent:['This is my pen.','I have a notebook.','I open my book.'],
    pashtoSupport:['دا زما کلک دی.','زه یو یادښت دفتر لرم.','زه خپل کتاب پرانیزم.'],
    dariSupport:['دا زما کلک دی.','زه یو یادښت دفتر لرم.','زه خپل کتاب پرانیزم.'],
    practiceItems:['Show one item to your partner and name it.','Say one "I have ___" sentence to your partner.'],
    successCriteria:'Each student shows and names at least one item to a partner.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w1_d3_quiz_listening', {
    status:'ready',
    title:'Quick Review — Day 3',
    teacherInstructions:'Ask students to name 2 classroom items and say one sentence with "I have" or "This is".',
    studentInstructions:'Be ready to name 2 classroom items and say one sentence from today.',
    englishContent:['pen','notebook','I have a pen.','This is my chair.'],
    pashtoSupport:['کلک','یادښت دفتر','زه یو کلک لرم.','دا زما څوکی ده.'],
    dariSupport:['کلک','یادښت دفتر','زه یو کلک لرم.','دا زما څوکی ده.'],
    practiceItems:['Say two classroom item words.','Say one sentence with "I have" or "This is".'],
    successCriteria:'Student names 2 items and says 1 correct sentence.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w1_d3_arcade', {
    status:'ready',
    title:'Arcade Goal — Classroom Words (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot records the learning goal a future Arcade round (classroom word matching) will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing classroom words — a matching game will use them later.',
    englishContent:['pen','book','notebook','chair','table'],
    pashtoSupport:['کلک','کتاب','یادښت دفتر','څوکی','میز'],
    dariSupport:['کلک','کتاب','یادښت دفتر','څوکی','میز'],
    practiceItems:['Review the 5 classroom words once more.'],
    successCriteria:'Not applicable — placeholder tied to the Day 3 goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w1_d3_homework', {
    status:'ready',
    title:'Homework & Report — Day 3',
    teacherInstructions:'Ask the student to name 3 classroom items at home using "This is my ___" or "I have ___." Send a short WhatsApp update to the father.',
    studentInstructions:'At home, point to 3 things and say a sentence about each using today\u2019s patterns.',
    englishContent:['This is my ___.','I have a ___.'],
    pashtoSupport:['دا زما ___ دی.','زه یو ___ لرم.'],
    dariSupport:['دا زما ___ دی.','زه یو ___ لرم.'],
    practiceItems:['Name 3 things at home using today\u2019s sentence patterns.'],
    successCriteria:'Student practiced naming items at home (teacher/parent confirmation).',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ===================================================================
     DAY 4 — Theme: "My day and simple actions"
     =================================================================== */

  add('m1_w1_d4_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Day 4',
    teacherInstructions:'Greet students by name. Mark attendance. Ask one student what time they woke up today (simple, low-pressure).',
    studentInstructions:'Greet your teacher and answer a simple question if asked.',
    englishContent:['Good morning, teacher.','I am ready to study.'],
    pashtoSupport:['سهار مو پخیر، ښوونکیه.','زه د زده کړې لپاره چمتو یم.'],
    dariSupport:['سهار مو پخیر، ښوونکیه.','زه د زده کړې لپاره چمتو یم.'],
    practiceItems:['Greet the teacher in English.'],
    successCriteria:'Student greets the teacher and is ready to begin.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w1_d4_weak_warmup', {
    status:'ready',
    title:'Warmup — Review Day 1–3',
    teacherInstructions:'Ask 2–3 students to say one sentence each from Day 1, Day 2, and Day 3 (name, family, classroom item).',
    studentInstructions:'Try to remember one sentence from each of the last three days.',
    englishContent:['My name is ___.','This is my brother.','I have a pen.'],
    pashtoSupport:['زما نوم ___ دی.','دا زما ورور دی.','زه یو کلک لرم.'],
    dariSupport:['زما نوم ___ دی.','دا زما ورور دی.','زه یو کلک لرم.'],
    practiceItems:['Say one sentence from each previous day.'],
    successCriteria:'Student recalls at least one sentence from Days 1–3.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w1_d4_wizard', {
    status:'ready',
    title:'Speaking & Listening — My Daily Actions',
    teacherInstructions:'Say each action sentence and act it out simply (mime washing face, eating, walking) if helpful. Have students repeat.',
    studentInstructions:'Listen, then repeat each action sentence.',
    englishContent:[
      'I wake up.',
      'I wash my face.',
      'I eat breakfast.',
      'I go to class.',
      'I study English.'
    ],
    pashtoSupport:[
      'زه پاڅیږم.',
      'زه خپله مخ مینځم.',
      'زه ناری خورم.',
      'زه ټولګي ته ځم.',
      'زه انګلیسي ښایم.'
    ],
    dariSupport:[
      'زه پاڅیږم.',
      'زه خپله مخ مینځم.',
      'زه ناری خورم.',
      'زه ټولګي ته ځم.',
      'زه انګلیسي ښایم.'
    ],
    practiceItems:['Repeat each action sentence after the teacher.','Practice the 5 lines with a partner.'],
    successCriteria:'Student can say at least 3 daily-action sentences correctly.',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w1_d4_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — My Daily Routine',
    teacherInstructions:'Use the classroom book/workbook daily-routine page if available. Otherwise draw simple stick-figure actions on the board and label them in English.',
    studentInstructions:'Follow your teacher\u2019s book or board activity about daily actions.',
    englishContent:['wake up','wash my face','eat breakfast','go to class'],
    pashtoSupport:['پاڅیدل','مخ مینځل','ناری خوړل','ټولګي ته تلل'],
    dariSupport:['پاڅیدل','مخ مینځل','ناری خوړل','ټولګي ته تلل'],
    practiceItems:['Repeat each action phrase after the teacher.'],
    successCriteria:'Student can say 3–4 daily action phrases clearly.',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w1_d4_grammar', {
    status:'ready',
    title:'Grammar — Simple present action verbs with "I"',
    teacherInstructions:'Show the pattern "I + verb" with 3–4 examples. Ask each student to make one new action sentence about their own day.',
    studentInstructions:'Learn the pattern "I + verb" and make one sentence about your own day.',
    englishContent:[
      'I listen to my teacher.',
      'I speak English.',
      'I go home.',
      'I study every day.'
    ],
    pashtoSupport:[
      'زه خپل ښوونکي ته غوږ نیسم.',
      'زه انګلیسي خبرې کوم.',
      'زه کور ته ځم.',
      'زه هره ورځ زده کړه کوم.'
    ],
    dariSupport:[
      'زه خپل ښوونکي ته غوږ نیسم.',
      'زه انګلیسي خبرې کوم.',
      'زه کور ته ځم.',
      'زه هره ورځ زده کړه کوم.'
    ],
    practiceItems:['Make a sentence with "I + verb" about your day.','Say one action sentence from today\u2019s class.'],
    successCriteria:'Student can make a correct "I + verb" sentence about their own day.',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w1_d4_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Talking About My Day',
    teacherInstructions:'Pair students. Each tells their partner 2–3 things they do in a day using "I + verb."',
    studentInstructions:'Tell your partner 2–3 things you do every day.',
    englishContent:['I wake up.','I go to class.','I study English.'],
    pashtoSupport:['زه پاڅیږم.','زه ټولګي ته ځم.','زه انګلیسي ښایم.'],
    dariSupport:['زه پاڅیږم.','زه ټولګي ته ځم.','زه انګلیسي ښایم.'],
    practiceItems:['Tell your partner 2 things you do every day.'],
    successCriteria:'Each student shares at least 2 daily-action sentences with a partner.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w1_d4_quiz_listening', {
    status:'ready',
    title:'Quick Review — Day 4',
    teacherInstructions:'Ask students to say 2 action sentences about their own day.',
    studentInstructions:'Be ready to say 2 action sentences from today.',
    englishContent:['I wake up.','I eat breakfast.','I study English.'],
    pashtoSupport:['زه پاڅیږم.','زه ناری خورم.','زه انګلیسي ښایم.'],
    dariSupport:['زه پاڅیږم.','زه ناری خورم.','زه انګلیسي ښایم.'],
    practiceItems:['Say two action sentences about your day.'],
    successCriteria:'Student says 2 correct action sentences without help.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w1_d4_arcade', {
    status:'ready',
    title:'Arcade Goal — Action Verbs (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot records the learning goal a future Arcade round (action verb matching) will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing action sentences — a matching game will use them later.',
    englishContent:['wake up','eat breakfast','go to class','study English'],
    pashtoSupport:['پاڅیدل','ناری خوړل','ټولګي ته تلل','انګلیسي ښوول'],
    dariSupport:['پاڅیدل','ناری خوړل','ټولګي ته تلل','انګلیسي ښوول'],
    practiceItems:['Review the 4 action phrases once more.'],
    successCriteria:'Not applicable — placeholder tied to the Day 4 goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w1_d4_homework', {
    status:'ready',
    title:'Homework & Report — Day 4',
    teacherInstructions:'Ask the student to say 2–3 daily-action sentences at home about their own routine. Send a short WhatsApp update to the father.',
    studentInstructions:'At home, say 2–3 sentences about your day using "I + verb."',
    englishContent:['I wake up.','I study English.','I go home.'],
    pashtoSupport:['زه پاڅیږم.','زه انګلیسي ښایم.','زه کور ته ځم.'],
    dariSupport:['زه پاڅیږم.','زه انګلیسي ښایم.','زه کور ته ځم.'],
    practiceItems:['Say 2–3 sentences about your day to a family member.'],
    successCriteria:'Student practiced daily-action sentences at home (teacher/parent confirmation).',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ===================================================================
     DAY 5 — Theme: "Week 1 review and confidence speaking"
     =================================================================== */

  add('m1_w1_d5_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Day 5 (Review Day)',
    teacherInstructions:'Greet students warmly. Mark attendance. Tell students today is a review day — they will show what they learned this week.',
    studentInstructions:'Greet your teacher. Today you will review everything from this week.',
    englishContent:['Good morning, teacher.','Today is review day.'],
    pashtoSupport:['سهار مو پخیر، ښوونکیه.','نن د بیاکتنې ورځ ده.'],
    dariSupport:['سهار مو پخیر، ښوونکیه.','نن د بیاکتنې ورځ ده.'],
    practiceItems:['Greet the teacher in English.'],
    successCriteria:'Student greets the teacher and understands today is a review day.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w1_d5_weak_warmup', {
    status:'ready',
    title:'Warmup — Whole Week Review',
    teacherInstructions:'Ask several students, one at a time, to say one sentence each from Day 1, 2, 3, and 4.',
    studentInstructions:'Try to remember one sentence from each day this week.',
    englishContent:['My name is ___.','This is my family.','I have a pen.','I study English.'],
    pashtoSupport:['زما نوم ___ دی.','دا زما کورنۍ ده.','زه یو کلک لرم.','زه انګلیسي ښایم.'],
    dariSupport:['زما نوم ___ دی.','دا زما کورنۍ ده.','زه یو کلک لرم.','زه انګلیسي ښایم.'],
    practiceItems:['Say one sentence from each day this week.'],
    successCriteria:'Student recalls at least one sentence from each of the 4 previous days.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w1_d5_wizard', {
    status:'ready',
    title:'Speaking & Listening — Week 1 Review',
    teacherInstructions:'Mix sentences from the whole week. Say each line and have students repeat, building confidence.',
    studentInstructions:'Listen and repeat sentences from the whole week.',
    englishContent:[
      'My name is ___.',
      'This is my family.',
      'This is my book.',
      'I have a pen.',
      'I study English every day.'
    ],
    pashtoSupport:[
      'زما نوم ___ دی.',
      'دا زما کورنۍ ده.',
      'دا زما کتاب دی.',
      'زه یو کلک لرم.',
      'زه هره ورځ انګلیسي ښایم.'
    ],
    dariSupport:[
      'زما نوم ___ دی.',
      'دا زما کورنۍ ده.',
      'دا زما کتاب دی.',
      'زه یو کلک لرم.',
      'زه هره ورځ انګلیسي ښایم.'
    ],
    practiceItems:['Repeat each review line clearly.','Say all five lines with a partner.'],
    successCriteria:'Student can say at least 4 of the 5 review sentences correctly.',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w1_d5_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — Week 1 Recap',
    teacherInstructions:'Use the classroom book/workbook review page if available. Otherwise lead a quick board recap of this week\u2019s key words and sentences.',
    studentInstructions:'Follow your teacher\u2019s recap of this week\u2019s words and sentences.',
    englishContent:['name','family','book','pen','study'],
    pashtoSupport:['نوم','کورنۍ','کتاب','کلک','زده کړه'],
    dariSupport:['نوم','کورنۍ','کتاب','کلک','زده کړه'],
    practiceItems:['Repeat each key word after the teacher.'],
    successCriteria:'Student recognizes the week\u2019s 5 key words.',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w1_d5_grammar', {
    status:'ready',
    title:'Grammar Review — I am / This is / I have / I + verb',
    teacherInstructions:'Quickly review all 4 patterns from the week with one example each. Ask each student to make one sentence using any pattern.',
    studentInstructions:'Review the 4 grammar patterns from this week and make one sentence with any of them.',
    englishContent:[
      'I am a student.',
      'This is my book.',
      'I have a pen.',
      'I study English.'
    ],
    pashtoSupport:[
      'زه یو زده‌کوونکی یم.',
      'دا زما کتاب دی.',
      'زه یو کلک لرم.',
      'زه انګلیسي ښایم.'
    ],
    dariSupport:[
      'زه یو زده‌کوونکی یم.',
      'دا زما کتاب دی.',
      'زه یو کلک لرم.',
      'زه انګلیسي ښایم.'
    ],
    practiceItems:['Make one sentence using any pattern from this week.','Say it clearly to the class or teacher.'],
    successCriteria:'Student can correctly use at least one of the 4 patterns in a new sentence.',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w1_d5_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Mini Self-Introduction Interview',
    teacherInstructions:'Pair students. Each partner asks the other: name, where from, one family member, one thing they have. Walk around and listen.',
    studentInstructions:'Ask your partner simple questions and answer theirs: your name, where you are from, your family, and something you have.',
    englishContent:['What is your name?','Where are you from?','Who is in your family?','What do you have?'],
    pashtoSupport:['ستا نوم څه دی؟','ته له کوم ځایه یې؟','ستا په کورنۍ کې څوک شامل دي؟','ته څه لرې؟'],
    dariSupport:['ستا نوم څه دی؟','ته له کوم ځایه یې؟','ستا په کورنۍ کې څوک شامل دي؟','ته څه لرې؟'],
    practiceItems:['Ask your partner 2 questions.','Answer your partner\u2019s 2 questions.'],
    successCriteria:'Each student asks and answers at least 2 simple questions with a partner.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w1_d5_quiz_listening', {
    status:'ready',
    title:'Quiz/Listening Review — Week 1',
    teacherInstructions:'Ask each student to say 3 sentences from this week (any mix of name, family, classroom items, actions).',
    studentInstructions:'Be ready to say 3 sentences from anything you learned this week.',
    englishContent:['My name is ___.','This is my book.','I study English.'],
    pashtoSupport:['زما نوم ___ دی.','دا زما کتاب دی.','زه انګلیسي ښایم.'],
    dariSupport:['زما نوم ___ دی.','دا زما کتاب دی.','زه انګلیسي ښایم.'],
    practiceItems:['Say 3 sentences from this week.'],
    successCriteria:'Student says 3 correct sentences covering at least 2 different days\u2019 topics.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w1_d5_arcade', {
    status:'ready',
    title:'Arcade Goal — Week 1 Review (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot records the learning goal a future Arcade round (mixed Week 1 review) will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing this week\u2019s sentences — a review game will use them later.',
    englishContent:['name','family','book','pen','study'],
    pashtoSupport:['نوم','کورنۍ','کتاب','کلک','زده کړه'],
    dariSupport:['نوم','کورنۍ','کتاب','کلک','زده کړه'],
    practiceItems:['Review your favorite sentence from this week.'],
    successCriteria:'Not applicable — placeholder tied to the Week 1 review goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w1_d5_homework', {
    status:'ready',
    title:'Homework & Report — Day 5 (Week 1 Complete)',
    teacherInstructions:'Ask the student to say a short self-introduction (name, where from, family, one thing they have) to a family member at home. Send a Week 1 completion WhatsApp update to the father.',
    studentInstructions:'At home, say a short self-introduction: your name, where you are from, your family, and one thing you have.',
    englishContent:['My name is ___.','I am from ___.','This is my family.','I have a ___.'],
    pashtoSupport:['زما نوم ___ دی.','زه له ___ نه یم.','دا زما کورنۍ ده.','زه یو ___ لرم.'],
    dariSupport:['زما نوم ___ دی.','زه له ___ نه یم.','دا زما کورنۍ ده.','زه یو ___ لرم.'],
    practiceItems:['Say your short self-introduction to a family member.'],
    successCriteria:'Student completed a short self-introduction at home (teacher/parent confirmation). Week 1 complete.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ====================================================================
     PUBLIC API
     ==================================================================== */
  function getRecord(slotId){ return RECORDS[slotId] || null; }
  function allSlotIds(){ return Object.keys(RECORDS); }

  window.ZirakClassPathRealContentM1W1 = {
    getRecord: getRecord,
    allSlotIds: allSlotIds
  };

  // Self-register with the H3/H4A content-map registry. If the content-map
  // module isn't loaded (or doesn't support registration), this simply does
  // nothing — resolveBlockContent() still falls back to its normal H3/H2
  // behaviour, so nothing ever breaks.
  if (window.ZirakClassPathContentMap && typeof window.ZirakClassPathContentMap.registerRealContentProvider === 'function'){
    window.ZirakClassPathContentMap.registerRealContentProvider({ getRecord: getRecord });
  }
})();
