/* =====================================================================
   ZIRAK ENGLISH LANGUAGE ACADEMY — Real Class Content (Month 1, Week 2)
   ځيرک د انګليسي ژبي اکاډمي
   ---------------------------------------------------------------------
   PHASE H5A: Month 1 / Week 2 / Day 1–2 — Real Class Content
   PHASE H5B: Month 1 / Week 2 / Day 3–5 — Real Class Content (added)
   ---------------------------------------------------------------------
   This file contains REAL, ready-to-use class content for exactly:
     - Month 1 / Week 2 / Day 1  ("My home and my room")
     - Month 1 / Week 2 / Day 2  ("My food and simple likes")
     - Month 1 / Week 2 / Day 3  ("My clothes and colors")
     - Month 1 / Week 2 / Day 4  ("My city and simple places")
     - Month 1 / Week 2 / Day 5  ("Week 2 review and speaking confidence")
   That is 5 days x 9 blocks = 45 records — a COMPLETE second week. Week 3,
   Month 2, and every other week/month intentionally have NO records
   here — they remain unmapped (no placeholder map either) until a
   future phase extends the slot map and adds content for them.

   Content notes:
     - English is the main learning language; Pashto lines are
       support translations only (never spoken by TTS by this module).
     - Content is simple, respectful, and institute-appropriate; no
       images, no flags, no political or sensitive topics are referenced.
     - This module does not call any speech/TTS function itself.

   This module is purely additive: it registers itself with
   zirak-classpath-content-map.js's real-content registry (the same
   registry zirak-classpath-real-content-m1w1.js already uses) so
   resolveBlockContent() picks it up automatically. If the content-map
   module isn't loaded yet, this file simply does nothing harmful —
   registration is skipped defensively.
   ===================================================================== */
(function () {
  'use strict';

  var RECORDS = {};
  function add(slotId, rec){ rec.slotId = slotId; RECORDS[slotId] = rec; }

  /* ===================================================================
     WEEK 2, DAY 1 — Theme: "My home and my room"
     =================================================================== */

  add('m1_w2_d1_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Week 2, Day 1',
    teacherInstructions:'Welcome students back for Week 2. Mark attendance. Briefly remind students that this week continues building on Week 1.',
    studentInstructions:'Greet your teacher. You are starting Week 2 of your English class.',
    englishContent:['Good morning, teacher.','I am ready for Week 2.'],
    pashtoSupport:['سهار مو پخیر، ښوونکیه.','زه د دوهمې اونۍ لپاره چمتو یم.'],
    dariSupport:['سهار مو پخیر، ښوونکیه.','زه د دوهمې اونۍ لپاره چمتو یم.'],
    practiceItems:['Greet the teacher in English.'],
    successCriteria:'Student greets the teacher and is ready to begin Week 2.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w2_d1_weak_warmup', {
    status:'ready',
    title:'Warmup — Review Week 1',
    teacherInstructions:'Ask 2–3 students to say one sentence each from Week 1 (name, family, classroom item, or action).',
    studentInstructions:'Try to remember one sentence you learned last week.',
    englishContent:['My name is ___.','This is my book.','I study English.'],
    pashtoSupport:['زما نوم ___ دی.','دا زما کتاب دی.','زه انګلیسي ښایم.'],
    dariSupport:['زما نوم ___ دی.','دا زما کتاب دی.','زه انګلیسي ښایم.'],
    practiceItems:['Say one sentence you remember from last week.'],
    successCriteria:'Student recalls at least one sentence from Week 1.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w2_d1_wizard', {
    status:'ready',
    title:'Speaking & Listening — My Home and My Room',
    teacherInstructions:'Say each line and have students repeat. Keep examples simple and general (no need for real photos).',
    studentInstructions:'Listen, then repeat each line about home and room.',
    englishContent:[
      'This is my home.',
      'This is my room.',
      'I have a bed.',
      'I have a table.',
      'I have a chair.'
    ],
    pashtoSupport:[
      'دا زما کور دی.',
      'دا زما کوټه ده.',
      'زه یو بستر لرم.',
      'زه یو میز لرم.',
      'زه یو څوکی لرم.'
    ],
    dariSupport:[
      'دا زما کور دی.',
      'دا زما کوټه ده.',
      'زه یو بستر لرم.',
      'زه یو میز لرم.',
      'زه یو څوکی لرم.'
    ],
    practiceItems:['Say one sentence about your home.','Repeat all five lines with a partner.'],
    successCriteria:'Student can say at least 3 home/room sentences correctly.',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w2_d1_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — Talking About Home',
    teacherInstructions:'Use the classroom book/workbook home-vocabulary page if available. Otherwise list home/room words on the board and drill pronunciation.',
    studentInstructions:'Follow your teacher\u2019s book or board activity about home and room words.',
    englishContent:['home','room','bed','table','chair'],
    pashtoSupport:['کور','کوټه','بستر','میز','څوکی'],
    dariSupport:['کور','کوټه','بستر','میز','څوکی'],
    practiceItems:['Repeat each home/room word after the teacher.'],
    successCriteria:'Student can pronounce the 5 home/room words clearly.',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w2_d1_grammar', {
    status:'ready',
    title:'Grammar — This is / I have / I read / I write / I study',
    teacherInstructions:'Review "This is" and "I have" from Week 1, then add "I read", "I write", and "I study" with one example each.',
    studentInstructions:'Review 2 patterns from last week and learn 3 new ones: I read, I write, I study.',
    englishContent:[
      'This is my room.',
      'I have a table.',
      'I read at home.',
      'I write in my notebook.',
      'I study English at home.'
    ],
    pashtoSupport:[
      'دا زما کوټه ده.',
      'زه یو میز لرم.',
      'زه په کور کې لولم.',
      'زه په خپل یادښت دفتر کې لیکم.',
      'زه په کور کې انګلیسي ښایم.'
    ],
    dariSupport:[
      'دا زما کوټه ده.',
      'زه یو میز لرم.',
      'زه په کور کې لولم.',
      'زه په خپل یادښت دفتر کې لیکم.',
      'زه په کور کې انګلیسي ښایم.'
    ],
    practiceItems:['Make a sentence with "I read" or "I write".','Make a sentence with "I study".'],
    successCriteria:'Student can correctly use "I read", "I write", and "I study" in a sentence.',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w2_d1_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Talking About Home',
    teacherInstructions:'Pair students. Each tells their partner one thing about their home or room using today\u2019s sentences.',
    studentInstructions:'Tell your partner about your home or room.',
    englishContent:['This is my home.','I have a bed.','I study English at home.'],
    pashtoSupport:['دا زما کور دی.','زه یو بستر لرم.','زه په کور کې انګلیسي ښایم.'],
    dariSupport:['دا زما کور دی.','زه یو بستر لرم.','زه په کور کې انګلیسي ښایم.'],
    practiceItems:['Tell your partner one thing about your room.'],
    successCriteria:'Each student shares at least one home/room sentence with a partner.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w2_d1_quiz_listening', {
    status:'ready',
    title:'Quick Review — Week 2, Day 1',
    teacherInstructions:'Ask students to name 2 home/room words and say one sentence with "I have" or "I study".',
    studentInstructions:'Be ready to name 2 home/room words and say one sentence from today.',
    englishContent:['room','bed','I have a chair.','I study English at home.'],
    pashtoSupport:['کوټه','بستر','زه یو څوکی لرم.','زه په کور کې انګلیسي ښایم.'],
    dariSupport:['کوټه','بستر','زه یو څوکی لرم.','زه په کور کې انګلیسي ښایم.'],
    practiceItems:['Say two home/room words.','Say one sentence with "I have" or "I study".'],
    successCriteria:'Student names 2 words and says 1 correct sentence.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w2_d1_arcade', {
    status:'ready',
    title:'Arcade Goal — Home Words (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot records the learning goal a future Arcade round (home/room word matching) will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing home and room words — a matching game will use them later.',
    englishContent:['home','room','bed','table','chair'],
    pashtoSupport:['کور','کوټه','بستر','میز','څوکی'],
    dariSupport:['کور','کوټه','بستر','میز','څوکی'],
    practiceItems:['Review the 5 home/room words once more.'],
    successCriteria:'Not applicable — placeholder tied to the Week2/Day1 goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w2_d1_homework', {
    status:'ready',
    title:'Homework & Report — Week 2, Day 1',
    teacherInstructions:'Ask the student to name 3 things in their room at home using "I have ___." Send a short WhatsApp update to the father.',
    studentInstructions:'At home, name 3 things in your room using "I have ___."',
    englishContent:['I have a ___.','This is my room.'],
    pashtoSupport:['زه یو ___ لرم.','دا زما کوټه ده.'],
    dariSupport:['زه یو ___ لرم.','دا زما کوټه ده.'],
    practiceItems:['Name 3 things in your room at home.'],
    successCriteria:'Student practiced naming room items at home (teacher/parent confirmation).',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ===================================================================
     WEEK 2, DAY 2 — Theme: "My food and simple likes"
     =================================================================== */

  add('m1_w2_d2_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Week 2, Day 2',
    teacherInstructions:'Greet students by name. Mark attendance.',
    studentInstructions:'Greet your teacher in English.',
    englishContent:['Good morning, teacher.','I am here.'],
    pashtoSupport:['سهار مو پخیر، ښوونکیه.','زه دلته یم.'],
    dariSupport:['سهار مو پخیر، ښوونکیه.','زه دلته یم.'],
    practiceItems:['Greet the teacher in English.'],
    successCriteria:'Student greets the teacher and confirms attendance in English.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w2_d2_weak_warmup', {
    status:'ready',
    title:'Warmup — Review Week 1 and Week 2 Day 1',
    teacherInstructions:'Ask 2–3 students to repeat one sentence from Week 1 and one from yesterday (home/room).',
    studentInstructions:'Try to remember one sentence from last week and one from yesterday.',
    englishContent:['I have a pen.','This is my room.','I study English at home.'],
    pashtoSupport:['زه یو کلک لرم.','دا زما کوټه ده.','زه په کور کې انګلیسي ښایم.'],
    dariSupport:['زه یو کلک لرم.','دا زما کوټه ده.','زه په کور کې انګلیسي ښایم.'],
    practiceItems:['Say one sentence from last week.','Say one sentence from yesterday.'],
    successCriteria:'Student recalls one sentence from Week 1 and one from yesterday.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w2_d2_wizard', {
    status:'ready',
    title:'Speaking & Listening — Food and Drink',
    teacherInstructions:'Say each line and have students repeat. Keep it light and simple — food is an easy, fun topic.',
    studentInstructions:'Listen, then repeat each line about food and drink.',
    englishContent:[
      'I eat bread.',
      'I drink water.',
      'I like rice.',
      'I like tea.',
      'I am hungry.'
    ],
    pashtoSupport:[
      'زه ډوډۍ خورم.',
      'زه اوبه څښم.',
      'زه وریجې خوښوم.',
      'زه چای خوښوم.',
      'زه وږی یم.'
    ],
    dariSupport:[
      'زه ډوډۍ خورم.',
      'زه اوبه څښم.',
      'زه وریجې خوښوم.',
      'زه چای خوښوم.',
      'زه وږی یم.'
    ],
    practiceItems:['Say one sentence about food you like.','Repeat all five lines with a partner.'],
    successCriteria:'Student can say at least 3 food/drink sentences correctly.',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w2_d2_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — Food and Drink Words',
    teacherInstructions:'Use the classroom book/workbook food-vocabulary page if available. Otherwise list food/drink words on the board and drill pronunciation.',
    studentInstructions:'Follow your teacher\u2019s book or board activity about food and drink words.',
    englishContent:['bread','water','rice','tea'],
    pashtoSupport:['ډوډۍ','اوبه','وریجې','چای'],
    dariSupport:['ډوډۍ','اوبه','وریجې','چای'],
    practiceItems:['Repeat each food/drink word after the teacher.'],
    successCriteria:'Student can pronounce the 4 food/drink words clearly.',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w2_d2_grammar', {
    status:'ready',
    title:'Grammar — I like / I do not like / I eat / I drink / I am',
    teacherInstructions:'Show the pattern "I like ___" and "I do not like ___" with one example each. Add "I eat", "I drink", and "I am hungry/thirsty".',
    studentInstructions:'Learn how to say what you like, what you don\u2019t like, and simple feelings like hungry/thirsty.',
    englishContent:[
      'I like rice.',
      'I do not like cold water.',
      'I eat breakfast.',
      'I drink tea at home.',
      'I am thirsty.'
    ],
    pashtoSupport:[
      'زه وریجې خوښوم.',
      'زه یخې اوبه نه خوښوم.',
      'زه ناری خورم.',
      'زه په کور کې چای څښم.',
      'زه تږی یم.'
    ],
    dariSupport:[
      'زه وریجې خوښوم.',
      'زه یخې اوبه نه خوښوم.',
      'زه ناری خورم.',
      'زه په کور کې چای څښم.',
      'زه تږی یم.'
    ],
    practiceItems:['Make a sentence with "I like ___."','Make a sentence with "I do not like ___."'],
    successCriteria:'Student can correctly use "I like" and "I do not like" with a food or drink word.',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w2_d2_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Food I Like',
    teacherInstructions:'Pair students. Each tells their partner one food they like and one they do not like.',
    studentInstructions:'Tell your partner one food or drink you like, and one you do not like.',
    englishContent:['I like tea.','I do not like cold water.','I am hungry.'],
    pashtoSupport:['زه چای خوښوم.','زه یخې اوبه نه خوښوم.','زه وږی یم.'],
    dariSupport:['زه چای خوښوم.','زه یخې اوبه نه خوښوم.','زه وږی یم.'],
    practiceItems:['Tell your partner one food you like.','Tell your partner one food you do not like.'],
    successCriteria:'Each student shares at least one "I like" and one "I do not like" sentence with a partner.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w2_d2_quiz_listening', {
    status:'ready',
    title:'Quick Review — Week 2, Day 2',
    teacherInstructions:'Ask students to name 2 food/drink words and say one sentence with "I like" or "I do not like".',
    studentInstructions:'Be ready to name 2 food/drink words and say one sentence from today.',
    englishContent:['rice','tea','I like rice.','I am thirsty.'],
    pashtoSupport:['وریجې','چای','زه وریجې خوښوم.','زه تږی یم.'],
    dariSupport:['وریجې','چای','زه وریجې خوښوم.','زه تږی یم.'],
    practiceItems:['Say two food/drink words.','Say one sentence with "I like" or "I do not like".'],
    successCriteria:'Student names 2 words and says 1 correct sentence.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w2_d2_arcade', {
    status:'ready',
    title:'Arcade Goal — Food Words (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot records the learning goal a future Arcade round (food/drink word matching) will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing food and drink words — a matching game will use them later.',
    englishContent:['bread','water','rice','tea'],
    pashtoSupport:['ډوډۍ','اوبه','وریجې','چای'],
    dariSupport:['ډوډۍ','اوبه','وریجې','چای'],
    practiceItems:['Review the 4 food/drink words once more.'],
    successCriteria:'Not applicable — placeholder tied to the Week2/Day2 goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w2_d2_homework', {
    status:'ready',
    title:'Homework & Report — Week 2, Day 2',
    teacherInstructions:'Ask the student to say one "I like ___" and one "I do not like ___" sentence at home about food. Send a short WhatsApp update to the father.',
    studentInstructions:'At home, say one food you like and one food you do not like, in English.',
    englishContent:['I like ___.','I do not like ___.'],
    pashtoSupport:['زه ___ خوښوم.','زه ___ نه خوښوم.'],
    dariSupport:['زه ___ خوښوم.','زه ___ نه خوښوم.'],
    practiceItems:['Say one food you like and one you do not like, at home.'],
    successCriteria:'Student practiced food-preference sentences at home (teacher/parent confirmation).',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ===================================================================
     WEEK 2, DAY 3 — Theme: "My clothes and colors"
     =================================================================== */

  add('m1_w2_d3_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Week 2, Day 3',
    teacherInstructions:'Greet students by name. Mark attendance.',
    studentInstructions:'Greet your teacher in English.',
    englishContent:['Good morning, teacher.','I am here.'],
    pashtoSupport:['سهار مو پخیر، ښوونکیه.','زه دلته یم.'],
    dariSupport:['سهار مو پخیر، ښوونکیه.','زه دلته یم.'],
    practiceItems:['Greet the teacher in English.'],
    successCriteria:'Student greets the teacher and confirms attendance in English.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w2_d3_weak_warmup', {
    status:'ready',
    title:'Warmup — Review Week 1 and Week 2 Day 1–2',
    teacherInstructions:'Ask 2–3 students to say one sentence each from Week 1 and from Week 2 Day 1–2 (home or food).',
    studentInstructions:'Try to remember one sentence from last week and one from this week.',
    englishContent:['I have a pen.','This is my room.','I like rice.'],
    pashtoSupport:['زه یو کلک لرم.','دا زما کوټه ده.','زه وریجې خوښوم.'],
    dariSupport:['زه یو کلک لرم.','دا زما کوټه ده.','زه وریجې خوښوم.'],
    practiceItems:['Say one sentence from Week 1.','Say one sentence from this week.'],
    successCriteria:'Student recalls one sentence from Week 1 and one from this week.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w2_d3_wizard', {
    status:'ready',
    title:'Speaking & Listening — My Clothes',
    teacherInstructions:'Say each line and have students repeat. Point to your own simple clothing items as examples (shirt, jacket).',
    studentInstructions:'Listen, then repeat each line about clothes.',
    englishContent:[
      'This is my shirt.',
      'This is my jacket.',
      'This is my hat.',
      'My shirt is white.',
      'My bag is black.'
    ],
    pashtoSupport:[
      'دا زما کمیس دی.',
      'دا زما جاکت دی.',
      'دا زما کلاه ده.',
      'زما کمیس سپین دی.',
      'زما کڅوړه توره ده.'
    ],
    dariSupport:[
      'دا زما کمیس دی.',
      'دا زما جاکت دی.',
      'دا زما کلاه ده.',
      'زما کمیس سپین دی.',
      'زما کڅوړه توره ده.'
    ],
    practiceItems:['Say one sentence about your shirt.','Repeat all five lines with a partner.'],
    successCriteria:'Student can say at least 3 clothes/color sentences correctly.',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w2_d3_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — Clothes and Colors',
    teacherInstructions:'Use the classroom book/workbook clothes/colors page if available. Otherwise list clothing words and basic colors on the board and drill pronunciation.',
    studentInstructions:'Follow your teacher\u2019s book or board activity about clothes and colors.',
    englishContent:['shirt','jacket','hat','white','black','blue'],
    pashtoSupport:['کمیس','جاکت','کلاه','سپین','تور','نیلی'],
    dariSupport:['کمیس','جاکت','کلاه','سپین','تور','نیلی'],
    practiceItems:['Repeat each clothing/color word after the teacher.'],
    successCriteria:'Student can pronounce at least 4 of the 6 clothes/color words clearly.',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w2_d3_grammar', {
    status:'ready',
    title:'Grammar — This is / My ___ is / I have / I wear / I like',
    teacherInstructions:'Review "This is" and "I have" briefly, then introduce "My ___ is ___" (for color), "I wear", and "I like" with one example each.',
    studentInstructions:'Learn how to describe color with "My ___ is ___" and use "I wear" and "I like".',
    englishContent:[
      'This is my hat.',
      'My shirt is white.',
      'I have blue shoes.',
      'I wear my jacket.',
      'I like this color.'
    ],
    pashtoSupport:[
      'دا زما کلاه ده.',
      'زما کمیس سپین دی.',
      'زه نیلي بوټان لرم.',
      'زه خپل جاکت اغوندم.',
      'زه دا رنګ خوښوم.'
    ],
    dariSupport:[
      'دا زما کلاه ده.',
      'زما کمیس سپین دی.',
      'زه نیلي بوټان لرم.',
      'زه خپل جاکت اغوندم.',
      'زه دا رنګ خوښوم.'
    ],
    practiceItems:['Make a sentence with "My ___ is ___" about color.','Make a sentence with "I wear ___" or "I like ___".'],
    successCriteria:'Student can correctly use "My ___ is ___" for color and one of "I wear"/"I like".',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w2_d3_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Describing Clothes',
    teacherInstructions:'Pair students. Each describes one item of clothing and its color to their partner.',
    studentInstructions:'Tell your partner about one piece of clothing and its color.',
    englishContent:['My shirt is white.','I have blue shoes.','I like this color.'],
    pashtoSupport:['زما کمیس سپین دی.','زه نیلي بوټان لرم.','زه دا رنګ خوښوم.'],
    dariSupport:['زما کمیس سپین دی.','زه نیلي بوټان لرم.','زه دا رنګ خوښوم.'],
    practiceItems:['Tell your partner the color of your shirt.','Tell your partner one thing you wear.'],
    successCriteria:'Each student shares at least one clothes/color sentence with a partner.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w2_d3_quiz_listening', {
    status:'ready',
    title:'Quick Review — Week 2, Day 3',
    teacherInstructions:'Ask students to name 2 clothing words and say one sentence with "My ___ is ___" or "I wear".',
    studentInstructions:'Be ready to name 2 clothing words and say one sentence from today.',
    englishContent:['shirt','jacket','My shirt is white.','I wear my jacket.'],
    pashtoSupport:['کمیس','جاکت','زما کمیس سپین دی.','زه خپل جاکت اغوندم.'],
    dariSupport:['کمیس','جاکت','زما کمیس سپین دی.','زه خپل جاکت اغوندم.'],
    practiceItems:['Say two clothing words.','Say one sentence about color or wearing something.'],
    successCriteria:'Student names 2 words and says 1 correct sentence.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w2_d3_arcade', {
    status:'ready',
    title:'Arcade Goal — Clothes & Colors (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot records the learning goal a future Arcade round (clothes/color matching) will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing clothes and color words — a matching game will use them later.',
    englishContent:['shirt','jacket','hat','white','black','blue'],
    pashtoSupport:['کمیس','جاکت','کلاه','سپین','تور','نیلی'],
    dariSupport:['کمیس','جاکت','کلاه','سپین','تور','نیلی'],
    practiceItems:['Review the clothes and color words once more.'],
    successCriteria:'Not applicable — placeholder tied to the Week2/Day3 goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w2_d3_homework', {
    status:'ready',
    title:'Homework & Report — Week 2, Day 3',
    teacherInstructions:'Ask the student to name the color of 2 clothing items at home using "My ___ is ___." Send a short WhatsApp update to the father.',
    studentInstructions:'At home, name the color of 2 things you wear, using "My ___ is ___."',
    englishContent:['My ___ is ___.'],
    pashtoSupport:['زما ___ ___ دی/ده.'],
    dariSupport:['زما ___ ___ دی/ده.'],
    practiceItems:['Name the color of 2 clothing items at home.'],
    successCriteria:'Student practiced naming clothing colors at home (teacher/parent confirmation).',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ===================================================================
     WEEK 2, DAY 4 — Theme: "My city and simple places"
     =================================================================== */

  add('m1_w2_d4_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Week 2, Day 4',
    teacherInstructions:'Greet students by name. Mark attendance.',
    studentInstructions:'Greet your teacher in English.',
    englishContent:['Good morning, teacher.','I am ready to study.'],
    pashtoSupport:['سهار مو پخیر، ښوونکیه.','زه د زده کړې لپاره چمتو یم.'],
    dariSupport:['سهار مو پخیر، ښوونکیه.','زه د زده کړې لپاره چمتو یم.'],
    practiceItems:['Greet the teacher in English.'],
    successCriteria:'Student greets the teacher and is ready to begin.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w2_d4_weak_warmup', {
    status:'ready',
    title:'Warmup — Review Week 1–2',
    teacherInstructions:'Ask 2–3 students to say one sentence each from earlier this week (home, food, or clothes).',
    studentInstructions:'Try to remember one sentence from earlier this week.',
    englishContent:['This is my room.','I like tea.','My shirt is white.'],
    pashtoSupport:['دا زما کوټه ده.','زه چای خوښوم.','زما کمیس سپین دی.'],
    dariSupport:['دا زما کوټه ده.','زه چای خوښوم.','زما کمیس سپین دی.'],
    practiceItems:['Say one sentence from earlier this week.'],
    successCriteria:'Student recalls at least one sentence from this week.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w2_d4_wizard', {
    status:'ready',
    title:'Speaking & Listening — My City and Places',
    teacherInstructions:'Say each line and have students repeat. Use the actual city/area name your students are from if helpful, keeping it simple and neutral.',
    studentInstructions:'Listen, then repeat each line about your city and simple places.',
    englishContent:[
      'I live in Kandahar.',
      'This is my street.',
      'This is a shop.',
      'This is a mosque.',
      'This is a school.'
    ],
    pashtoSupport:[
      'زه په کندهار کې اوسیږم.',
      'دا زما کوچنی دی.',
      'دا یوه دکان ده.',
      'دا یوه جومات دی.',
      'دا یو ښوونځی دی.'
    ],
    dariSupport:[
      'زه په کندهار کې اوسیږم.',
      'دا زما کوچنی دی.',
      'دا یوه دکان ده.',
      'دا یوه جومات دی.',
      'دا یو ښوونځی دی.'
    ],
    practiceItems:['Say where you live.','Repeat all five lines with a partner.'],
    successCriteria:'Student can say at least 3 city/place sentences correctly.',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w2_d4_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — Places in My City',
    teacherInstructions:'Use the classroom book/workbook places page if available. Otherwise list simple place words on the board and drill pronunciation.',
    studentInstructions:'Follow your teacher\u2019s book or board activity about places in the city.',
    englishContent:['street','shop','mosque','school'],
    pashtoSupport:['کوچنی','دکان','جومات','ښوونځی'],
    dariSupport:['کوچنی','دکان','جومات','ښوونځی'],
    practiceItems:['Repeat each place word after the teacher.'],
    successCriteria:'Student can pronounce the 4 place words clearly.',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w2_d4_grammar', {
    status:'ready',
    title:'Grammar — I live in / This is a / I go to / I come',
    teacherInstructions:'Write the 4 patterns on the board with one example each. Ask each student to make one sentence with "I go to ___."',
    studentInstructions:'Learn 4 simple patterns about your city and places.',
    englishContent:[
      'I live in Kandahar.',
      'This is a shop.',
      'I go to class.',
      'I go to the shop.',
      'I come home.'
    ],
    pashtoSupport:[
      'زه په کندهار کې اوسیږم.',
      'دا یوه دکان ده.',
      'زه ټولګي ته ځم.',
      'زه دکان ته ځم.',
      'زه کور ته راځم.'
    ],
    dariSupport:[
      'زه په کندهار کې اوسیږم.',
      'دا یوه دکان ده.',
      'زه ټولګي ته ځم.',
      'زه دکان ته ځم.',
      'زه کور ته راځم.'
    ],
    practiceItems:['Make a sentence with "I go to ___."','Make a sentence with "I live in ___" or "I come ___."'],
    successCriteria:'Student can correctly use "I go to" and one other pattern in a sentence.',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w2_d4_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Talking About Places',
    teacherInstructions:'Pair students. Each tells their partner where they live and one place they go to.',
    studentInstructions:'Tell your partner where you live and one place you go to.',
    englishContent:['I live in Kandahar.','I go to class.','I go to the shop.'],
    pashtoSupport:['زه په کندهار کې اوسیږم.','زه ټولګي ته ځم.','زه دکان ته ځم.'],
    dariSupport:['زه په کندهار کې اوسیږم.','زه ټولګي ته ځم.','زه دکان ته ځم.'],
    practiceItems:['Tell your partner where you live.','Tell your partner one place you go to.'],
    successCriteria:'Each student shares at least one city/place sentence with a partner.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w2_d4_quiz_listening', {
    status:'ready',
    title:'Quick Review — Week 2, Day 4',
    teacherInstructions:'Ask students to name 2 place words and say one sentence with "I go to" or "I live in".',
    studentInstructions:'Be ready to name 2 place words and say one sentence from today.',
    englishContent:['shop','school','I go to class.','I come home.'],
    pashtoSupport:['دکان','ښوونځی','زه ټولګي ته ځم.','زه کور ته راځم.'],
    dariSupport:['دکان','ښوونځی','زه ټولګي ته ځم.','زه کور ته راځم.'],
    practiceItems:['Say two place words.','Say one sentence with "I go to" or "I live in".'],
    successCriteria:'Student names 2 words and says 1 correct sentence.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w2_d4_arcade', {
    status:'ready',
    title:'Arcade Goal — City Places (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot records the learning goal a future Arcade round (place-word matching) will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing place words — a matching game will use them later.',
    englishContent:['street','shop','mosque','school'],
    pashtoSupport:['کوچنی','دکان','جومات','ښوونځی'],
    dariSupport:['کوچنی','دکان','جومات','ښوونځی'],
    practiceItems:['Review the 4 place words once more.'],
    successCriteria:'Not applicable — placeholder tied to the Week2/Day4 goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w2_d4_homework', {
    status:'ready',
    title:'Homework & Report — Week 2, Day 4',
    teacherInstructions:'Ask the student to say where they live and one place they go to, at home, using today\u2019s patterns. Send a short WhatsApp update to the father.',
    studentInstructions:'At home, say where you live and one place you go to, in English.',
    englishContent:['I live in ___.','I go to ___.'],
    pashtoSupport:['زه په ___ کې اوسیږم.','زه ___ ته ځم.'],
    dariSupport:['زه په ___ کې اوسیږم.','زه ___ ته ځم.'],
    practiceItems:['Say where you live and one place you go to, at home.'],
    successCriteria:'Student practiced city/place sentences at home (teacher/parent confirmation).',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ===================================================================
     WEEK 2, DAY 5 — Theme: "Week 2 review and speaking confidence"
     =================================================================== */

  add('m1_w2_d5_attendance', {
    status:'ready',
    title:'Welcome & Attendance — Week 2, Day 5 (Review Day)',
    teacherInstructions:'Greet students warmly. Mark attendance. Tell students today is a review day for everything learned this week.',
    studentInstructions:'Greet your teacher. Today you will review this week\u2019s lessons.',
    englishContent:['Good morning, teacher.','Today is review day.'],
    pashtoSupport:['سهار مو پخیر، ښوونکیه.','نن د بیاکتنې ورځ ده.'],
    dariSupport:['سهار مو پخیر، ښوونکیه.','نن د بیاکتنې ورځ ده.'],
    practiceItems:['Greet the teacher in English.'],
    successCriteria:'Student greets the teacher and understands today is a review day.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'system'
  });

  add('m1_w2_d5_weak_warmup', {
    status:'ready',
    title:'Warmup — Whole Week 2 Review',
    teacherInstructions:'Ask several students, one at a time, to say one sentence each from Day 1, 2, 3, and 4 of this week.',
    studentInstructions:'Try to remember one sentence from each day this week.',
    englishContent:['This is my room.','I eat bread.','My shirt is white.','I live in Kandahar.'],
    pashtoSupport:['دا زما کوټه ده.','زه ډوډۍ خورم.','زما کمیس سپین دی.','زه په کندهار کې اوسیږم.'],
    dariSupport:['دا زما کوټه ده.','زه ډوډۍ خورم.','زما کمیس سپین دی.','زه په کندهار کې اوسیږم.'],
    practiceItems:['Say one sentence from each day this week.'],
    successCriteria:'Student recalls at least one sentence from each of the 4 previous days.',
    estimatedMinutes:5, linkedPage:'review', linkedContentType:'weakparts'
  });

  add('m1_w2_d5_wizard', {
    status:'ready',
    title:'Speaking & Listening — Week 2 Review',
    teacherInstructions:'Mix sentences from the whole week (home, food, clothes, city). Say each line and have students repeat, building confidence.',
    studentInstructions:'Listen and repeat sentences from the whole week.',
    englishContent:[
      'This is my home.',
      'I study at home.',
      'I eat bread.',
      'I drink water.',
      'This is my shirt.',
      'I go to class.'
    ],
    pashtoSupport:[
      'دا زما کور دی.',
      'زه په کور کې زده کړه کوم.',
      'زه ډوډۍ خورم.',
      'زه اوبه څښم.',
      'دا زما کمیس دی.',
      'زه ټولګي ته ځم.'
    ],
    dariSupport:[
      'دا زما کور دی.',
      'زه په کور کې زده کړه کوم.',
      'زه ډوډۍ خورم.',
      'زه اوبه څښم.',
      'دا زما کمیس دی.',
      'زه ټولګي ته ځم.'
    ],
    practiceItems:['Repeat each review line clearly.','Say all six lines with a partner.'],
    successCriteria:'Student can say at least 5 of the 6 review sentences correctly.',
    estimatedMinutes:15, linkedPage:'dialogue', linkedContentType:'dialogue'
  });

  add('m1_w2_d5_teacher_book', {
    status:'ready',
    title:'Teacher-Led Activity — Week 2 Recap',
    teacherInstructions:'Use the classroom book/workbook review page if available. Otherwise lead a quick board recap of this week\u2019s key words: home, food, clothes, city.',
    studentInstructions:'Follow your teacher\u2019s recap of this week\u2019s words and sentences.',
    englishContent:['room','bread','shirt','shop'],
    pashtoSupport:['کوټه','ډوډۍ','کمیس','دکان'],
    dariSupport:['کوټه','ډوډۍ','کمیس','دکان'],
    practiceItems:['Repeat each key word after the teacher.'],
    successCriteria:'Student recognizes the week\u2019s 4 key topic words.',
    estimatedMinutes:20, linkedPage:null, linkedContentType:'teacher'
  });

  add('m1_w2_d5_grammar', {
    status:'ready',
    title:'Grammar Review — This is / I have / I like / I go to / I live in',
    teacherInstructions:'Quickly review all 5 patterns from the week with one example each. Ask each student to make one sentence using any pattern.',
    studentInstructions:'Review the patterns from this week and make one sentence with any of them.',
    englishContent:[
      'This is my room.',
      'I have a bed.',
      'I like rice.',
      'I go to class.',
      'I live in Kandahar.'
    ],
    pashtoSupport:[
      'دا زما کوټه ده.',
      'زه یو بستر لرم.',
      'زه وریجې خوښوم.',
      'زه ټولګي ته ځم.',
      'زه په کندهار کې اوسیږم.'
    ],
    dariSupport:[
      'دا زما کوټه ده.',
      'زه یو بستر لرم.',
      'زه وریجې خوښوم.',
      'زه ټولګي ته ځم.',
      'زه په کندهار کې اوسیږم.'
    ],
    practiceItems:['Make one sentence using any pattern from this week.','Say it clearly to the class or teacher.'],
    successCriteria:'Student can correctly use at least one of the week\u2019s 5 patterns in a new sentence.',
    estimatedMinutes:10, linkedPage:'grammar', linkedContentType:'grammar'
  });

  add('m1_w2_d5_pair_speaking', {
    status:'ready',
    title:'Pair Speaking — Mini Interview (Home, Food, Clothes, City)',
    teacherInstructions:'Pair students. Each partner asks the other about home, food, clothes, and city using simple questions. Walk around and listen.',
    studentInstructions:'Ask your partner simple questions and answer theirs: about your home, food you like, your clothes, and your city.',
    englishContent:['What is in your room?','What do you like to eat?','What color is your shirt?','Where do you live?'],
    pashtoSupport:['ستا په کوټه کې څه شی دی؟','تاسو څه خوراک خوښوئ؟','ستا کمیس کوم رنګ دی؟','تاسو چیرته اوسیږئ؟'],
    dariSupport:['ستا په کوټه کې څه شی دی؟','تاسو څه خوراک خوښوئ؟','ستا کمیس کوم رنګ دی؟','تاسو چیرته اوسیږئ؟'],
    practiceItems:['Ask your partner 2 questions.','Answer your partner\u2019s 2 questions.'],
    successCriteria:'Each student asks and answers at least 2 simple questions with a partner.',
    estimatedMinutes:15, linkedPage:null, linkedContentType:'pair'
  });

  add('m1_w2_d5_quiz_listening', {
    status:'ready',
    title:'Quiz/Listening Review — Week 2',
    teacherInstructions:'Ask each student to say 3 sentences from this week (any mix of home, food, clothes, city).',
    studentInstructions:'Be ready to say 3 sentences from anything you learned this week.',
    englishContent:['This is my room.','I like tea.','I go to class.'],
    pashtoSupport:['دا زما کوټه ده.','زه چای خوښوم.','زه ټولګي ته ځم.'],
    dariSupport:['دا زما کوټه ده.','زه چای خوښوم.','زه ټولګي ته ځم.'],
    practiceItems:['Say 3 sentences from this week.'],
    successCriteria:'Student says 3 correct sentences covering at least 2 different topics from this week.',
    estimatedMinutes:10, linkedPage:'listening', linkedContentType:'quiz'
  });

  add('m1_w2_d5_arcade', {
    status:'ready',
    title:'Arcade Goal — Week 2 Review (gameplay arrives later)',
    teacherInstructions:'No game yet — this slot records the learning goal a future Arcade round (mixed Week 2 review) will reinforce.',
    studentInstructions:'Arcade is locked for now. Keep practicing this week\u2019s sentences — a review game will use them later.',
    englishContent:['room','bread','shirt','shop'],
    pashtoSupport:['کوټه','ډوډۍ','کمیس','دکان'],
    dariSupport:['کوټه','ډوډۍ','کمیس','دکان'],
    practiceItems:['Review your favorite sentence from this week.'],
    successCriteria:'Not applicable — placeholder tied to the Week2 review goal; arcade gameplay arrives in a later phase.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'arcade'
  });

  add('m1_w2_d5_homework', {
    status:'ready',
    title:'Homework & Report — Day 5 (Week 2 Complete)',
    teacherInstructions:'Ask the student to give a short talk at home about their home, food, clothes, and city (4 short sentences). Send a Week 2 completion WhatsApp update to the father.',
    studentInstructions:'At home, say 4 short sentences: one about your home, one about food, one about your clothes, and one about your city.',
    englishContent:['This is my home.','I like ___.','My ___ is ___.','I live in ___.'],
    pashtoSupport:['دا زما کور دی.','زه ___ خوښوم.','زما ___ ___ دی/ده.','زه په ___ کې اوسیږم.'],
    dariSupport:['دا زما کور دی.','زه ___ خوښوم.','زما ___ ___ دی/ده.','زه په ___ کې اوسیږم.'],
    practiceItems:['Say 4 short sentences about home, food, clothes, and city to a family member.'],
    successCriteria:'Student completed a short 4-sentence talk at home (teacher/parent confirmation). Week 2 complete.',
    estimatedMinutes:5, linkedPage:null, linkedContentType:'homework'
  });

  /* ====================================================================
     PUBLIC API
     ==================================================================== */
  function getRecord(slotId){ return RECORDS[slotId] || null; }
  function allSlotIds(){ return Object.keys(RECORDS); }

  window.ZirakClassPathRealContentM1W2 = {
    getRecord: getRecord,
    allSlotIds: allSlotIds
  };

  // Self-register with the shared content-map registry (same one
  // zirak-classpath-real-content-m1w1.js already uses). Defensive: if the
  // content-map module isn't loaded, this does nothing harmful.
  if (window.ZirakClassPathContentMap && typeof window.ZirakClassPathContentMap.registerRealContentProvider === 'function'){
    window.ZirakClassPathContentMap.registerRealContentProvider({ getRecord: getRecord });
  }
})();
