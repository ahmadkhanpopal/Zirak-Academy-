// ==========================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// zirak-listening-curriculum-d18.js
// Phase I6H-D18 — Listening Curriculum: Editorial Decisions, New Authored
// Content, Curated Packs, and Registration into ZirakCurriculumContent
// ==========================================================================
// This file:
//   1. Registers through ZirakCurriculumContent.registerListeningCurriculumD18()
//   2. Does NOT compete with or replace ZirakCurriculumContent
//   3. Provides 310 editorial decisions for the legacy canonical bank
//   4. Provides new authored items for Intermediate, Advanced, and Academic
//   5. Provides curated packs (66 minimum) for all 7 accepted levels
//   6. All content is academy-authored original material
//   7. No copyrighted passages reproduced
// ==========================================================================

(function () {
  'use strict';

  var D18_VERSION = 'I6H-D18';
  var D18_DATE = '2026-07-30T00:00:00.000Z';
  var CONTENT_JS_SHA256 = 'f766b7cdb0e0c75ee67bf4692ce03eb92736e39129a9f0feb4063bb9ab39d375';

  // -----------------------------------------------------------------------
  // SECTION 1: EDITORIAL DECISION SUMMARY (310 canonical legacy items)
  // Full machine-readable decisions live in listening-editorial-decisions-i6h-d18.json
  // This runtime object stores the summary needed for governance integration.
  // -----------------------------------------------------------------------
  var EDITORIAL_SUMMARY = {
    total: 310,
    retainOfficialCandidate: 41,
    relevelOfficialCandidate: 269,
    levelDistribution: {
      starter: 142, basic: 148, beginner: 8, elementary: 12,
      intermediate: 0, advanced: 0, academic: 0
    },
    note: 'All 310 legacy items are micro-sentences capped at intermediate. Advanced/Academic demand requires authored connected discourse supplied by D18.',
    reviewerRole: 'phase-editorial-review',
    phase: 'I6H-D18',
    reviewDate: D18_DATE
  };

  // -----------------------------------------------------------------------
  // SECTION 2: STAGE TEMPLATES
  // -----------------------------------------------------------------------
  var STD_STAGES = [
    { stageId: 'first-listen-gist', stageType: 'first-listen-gist',
      instructions: 'Listen once. What is the topic?',
      estimatedMinutes: 4, completionCriteria: 'teacher-confirmed',
      evidenceType: 'attendance', retryPolicy: 'none', supportLevel: 'full' },
    { stageId: 'repeat-or-shadow', stageType: 'repeat-or-shadow',
      instructions: 'Listen and repeat each sentence clearly.',
      estimatedMinutes: 5, completionCriteria: 'auto-or-manual',
      evidenceType: 'attempt', retryPolicy: 'twice', supportLevel: 'full' },
    { stageId: 'oral-follow-up', stageType: 'oral-follow-up',
      instructions: 'Answer one simple question about the sentences.',
      estimatedMinutes: 3, completionCriteria: 'teacher-confirmed',
      evidenceType: 'oral-attempt', retryPolicy: 'once', supportLevel: 'strong' },
    { stageId: 'weak-item-recovery', stageType: 'weak-item-recovery',
      instructions: 'Review sentences marked for improvement.',
      estimatedMinutes: 3, completionCriteria: 'auto-or-manual',
      evidenceType: 'attempt', retryPolicy: 'twice', supportLevel: 'strong' }
  ];

  var INT_STAGES = [
    { stageId: 'first-listen-gist', stageType: 'first-listen-gist',
      instructions: 'Listen once. Identify the situation and speakers.',
      estimatedMinutes: 3, completionCriteria: 'teacher-confirmed',
      evidenceType: 'attendance', retryPolicy: 'none', supportLevel: 'partial' },
    { stageId: 'listen-for-detail', stageType: 'listen-for-detail',
      instructions: 'Listen again. Note key details.',
      estimatedMinutes: 4, completionCriteria: 'task-attempt',
      evidenceType: 'task-result', retryPolicy: 'once', supportLevel: 'partial' },
    { stageId: 'repeat-or-shadow', stageType: 'repeat-or-shadow',
      instructions: 'Shadow the dialogue at normal speed.',
      estimatedMinutes: 4, completionCriteria: 'auto-or-manual',
      evidenceType: 'attempt', retryPolicy: 'twice', supportLevel: 'partial' },
    { stageId: 'oral-follow-up', stageType: 'oral-follow-up',
      instructions: 'Discuss the main topic in two sentences.',
      estimatedMinutes: 4, completionCriteria: 'teacher-confirmed',
      evidenceType: 'oral-attempt', retryPolicy: 'once', supportLevel: 'minimal' },
    { stageId: 'weak-item-recovery', stageType: 'weak-item-recovery',
      instructions: 'Review items marked for improvement.',
      estimatedMinutes: 3, completionCriteria: 'auto-or-manual',
      evidenceType: 'attempt', retryPolicy: 'twice', supportLevel: 'partial' }
  ];

  var ADV_STAGES = [
    { stageId: 'first-listen-gist', stageType: 'first-listen-gist',
      instructions: 'Listen once. Identify the main claim.',
      estimatedMinutes: 3, completionCriteria: 'teacher-confirmed',
      evidenceType: 'attendance', retryPolicy: 'none', supportLevel: 'minimal' },
    { stageId: 'listen-for-detail', stageType: 'listen-for-detail',
      instructions: 'Listen again. Note supporting evidence and examples.',
      estimatedMinutes: 5, completionCriteria: 'task-attempt',
      evidenceType: 'task-result', retryPolicy: 'once', supportLevel: 'minimal' },
    { stageId: 'repeat-or-shadow', stageType: 'repeat-or-shadow',
      instructions: 'Shadow the passage at normal speed.',
      estimatedMinutes: 4, completionCriteria: 'auto-or-manual',
      evidenceType: 'attempt', retryPolicy: 'twice', supportLevel: 'minimal' },
    { stageId: 'oral-follow-up', stageType: 'oral-follow-up',
      instructions: 'Summarise the main argument in two or three sentences.',
      estimatedMinutes: 5, completionCriteria: 'teacher-confirmed',
      evidenceType: 'oral-attempt', retryPolicy: 'once', supportLevel: 'none' },
    { stageId: 'weak-item-recovery', stageType: 'weak-item-recovery',
      instructions: 'Review vocabulary and task items marked for improvement.',
      estimatedMinutes: 3, completionCriteria: 'auto-or-manual',
      evidenceType: 'attempt', retryPolicy: 'twice', supportLevel: 'minimal' }
  ];

  var ACA_STAGES = [
    { stageId: 'first-listen-gist', stageType: 'first-listen-gist',
      instructions: 'Listen and identify the main claim and organisation.',
      estimatedMinutes: 4, completionCriteria: 'teacher-confirmed',
      evidenceType: 'attendance', retryPolicy: 'none', supportLevel: 'none' },
    { stageId: 'listen-for-detail', stageType: 'listen-for-detail',
      instructions: 'Listen again. Take structured notes: claim, evidence, conclusion.',
      estimatedMinutes: 6, completionCriteria: 'task-attempt',
      evidenceType: 'task-result', retryPolicy: 'once', supportLevel: 'none' },
    { stageId: 'dictation-or-key-words', stageType: 'dictation-or-key-words',
      instructions: 'Write the key academic vocabulary you heard.',
      estimatedMinutes: 4, completionCriteria: 'auto-or-manual',
      evidenceType: 'attempt', retryPolicy: 'once', supportLevel: 'none' },
    { stageId: 'oral-follow-up', stageType: 'oral-follow-up',
      instructions: 'Summarise the lecture argument orally in three to five sentences.',
      estimatedMinutes: 6, completionCriteria: 'teacher-confirmed',
      evidenceType: 'oral-attempt', retryPolicy: 'once', supportLevel: 'none' },
    { stageId: 'review-challenge', stageType: 'review-challenge',
      instructions: 'Answer one critical thinking question about the content.',
      estimatedMinutes: 5, completionCriteria: 'task-attempt',
      evidenceType: 'task-result', retryPolicy: 'once', supportLevel: 'none' },
    { stageId: 'weak-item-recovery', stageType: 'weak-item-recovery',
      instructions: 'Review vocabulary and task items marked for improvement.',
      estimatedMinutes: 4, completionCriteria: 'auto-or-manual',
      evidenceType: 'attempt', retryPolicy: 'twice', supportLevel: 'minimal' }
  ];


  // -----------------------------------------------------------------------
  // SECTION 3: NEW AUTHORED INTERMEDIATE ITEMS
  // -----------------------------------------------------------------------
  var D18_INTERMEDIATE_ITEMS = [
    { contentId:'listen-d18-int-0001', itemType:'mini-dialogue', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Classroom Question and Answer', acceptedLevelId:'intermediate', minimumLevelId:'elementary', maximumLevelId:'advanced',
      pathwayIds:['child','teen','general-adult'], themeIds:['education','language-learning'],
      script:[
        {lineId:'int-0001-l1',speaker:'Teacher',text:'Can anyone explain what this word means?'},
        {lineId:'int-0001-l2',speaker:'Student',text:'I think it means the same as practise, but more formal.'},
        {lineId:'int-0001-l3',speaker:'Teacher',text:'That is a good observation. Can you give an example?'},
        {lineId:'int-0001-l4',speaker:'Student',text:'Sure. We should exercise our speaking skills every day.'}
      ],
      pashtoSupport:'د ټولګي سوالونه او ځوابونه', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['explain','observation','formal','example','exercise'],
      grammarTargets:['present-simple-questions','giving-examples'],
      listeningSkills:['identifying-speaker-intent','understanding-explanation'],
      speechProfile:'normal', estimatedAudioSeconds:28, estimatedPracticeMinutes:12,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-int-0002', itemType:'mini-dialogue', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Making a Polite Request', acceptedLevelId:'intermediate', minimumLevelId:'elementary', maximumLevelId:'advanced',
      pathwayIds:['teen','general-adult','job-professional'], themeIds:['communication','work'],
      script:[
        {lineId:'int-0002-l1',speaker:'A',text:'Excuse me, would it be possible to change our meeting time?'},
        {lineId:'int-0002-l2',speaker:'B',text:'Of course. What time works better for you?'},
        {lineId:'int-0002-l3',speaker:'A',text:'I was thinking about two o clock in the afternoon, if that is convenient.'},
        {lineId:'int-0002-l4',speaker:'B',text:'That works perfectly. I will update the invitation right away.'}
      ],
      pashtoSupport:'مودبانه غوښتنه کول', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['convenient','invitation','update','perfectly'],
      grammarTargets:['conditional-polite-request','future-simple'],
      listeningSkills:['identifying-politeness-register','understanding-arrangement'],
      speechProfile:'normal', estimatedAudioSeconds:24, estimatedPracticeMinutes:10,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-int-0003', itemType:'mini-dialogue', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'At the Doctor', acceptedLevelId:'intermediate', minimumLevelId:'beginner', maximumLevelId:'advanced',
      pathwayIds:['general-adult'], themeIds:['health'],
      script:[
        {lineId:'int-0003-l1',speaker:'Doctor',text:'Good afternoon. What seems to be the problem today?'},
        {lineId:'int-0003-l2',speaker:'Patient',text:'I have had a bad headache for three days, and I feel very tired.'},
        {lineId:'int-0003-l3',speaker:'Doctor',text:'Do you have any other symptoms, such as fever or difficulty sleeping?'},
        {lineId:'int-0003-l4',speaker:'Patient',text:'Yes, I have a slight fever, and I wake up very early in the morning.'},
        {lineId:'int-0003-l5',speaker:'Doctor',text:'I will prescribe something for the headache and fever. Please rest and drink plenty of water.'}
      ],
      pashtoSupport:'د ناروغتیا نښې بیانول', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['symptoms','fever','difficulty','prescribe','plenty'],
      grammarTargets:['present-perfect-duration','indirect-questions'],
      listeningSkills:['identifying-medical-information','understanding-sequence'],
      speechProfile:'normal', estimatedAudioSeconds:35, estimatedPracticeMinutes:15,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-int-0004', itemType:'mini-dialogue', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Planning a Weekend Trip', acceptedLevelId:'intermediate', minimumLevelId:'elementary', maximumLevelId:'advanced',
      pathwayIds:['teen','general-adult'], themeIds:['transport','general-conversation'],
      script:[
        {lineId:'int-0004-l1',speaker:'Karim',text:'Are you free this weekend? I am thinking about visiting my uncle in the next town.'},
        {lineId:'int-0004-l2',speaker:'Sara',text:'That sounds nice. How are you planning to travel?'},
        {lineId:'int-0004-l3',speaker:'Karim',text:'By bus. It only takes about two hours and the ticket is not expensive.'},
        {lineId:'int-0004-l4',speaker:'Sara',text:'I might join you. Let me check if I have any commitments first.'}
      ],
      pashtoSupport:'د آخیر اونۍ سفر پالن', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['planning','travel','expensive','commitments'],
      grammarTargets:['future-plans-present-continuous','might'],
      listeningSkills:['understanding-plans','gist-main-idea'],
      speechProfile:'normal', estimatedAudioSeconds:26, estimatedPracticeMinutes:12,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-int-0005', itemType:'sentence-sequence', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Giving Directions', acceptedLevelId:'intermediate', minimumLevelId:'elementary', maximumLevelId:'advanced',
      pathwayIds:['general-adult','job-professional'], themeIds:['places','communication'],
      script:[
        {lineId:'int-0005-l1',speaker:'Visitor',text:'Excuse me, can you tell me how to get to the central market from here?'},
        {lineId:'int-0005-l2',speaker:'Local',text:'Sure. Go straight down this road for about five minutes.'},
        {lineId:'int-0005-l3',speaker:'Local',text:'When you reach the traffic lights, turn left and you will see a large blue building.'},
        {lineId:'int-0005-l4',speaker:'Local',text:'The market is just behind that building. It takes about ten minutes on foot.'}
      ],
      pashtoSupport:'لار ښودنه', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['straight','traffic lights','turn left','on foot'],
      grammarTargets:['imperative-directions','when-clauses'],
      listeningSkills:['following-directions','understanding-sequence'],
      speechProfile:'normal', estimatedAudioSeconds:30, estimatedPracticeMinutes:12,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-int-0006', itemType:'mini-dialogue', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Job Interview Introduction', acceptedLevelId:'intermediate', minimumLevelId:'elementary', maximumLevelId:'advanced',
      pathwayIds:['general-adult','job-professional'], themeIds:['work'],
      script:[
        {lineId:'int-0006-l1',speaker:'Interviewer',text:'Thank you for coming in today. Please, take a seat.'},
        {lineId:'int-0006-l2',speaker:'Candidate',text:'Thank you. I am very pleased to be here.'},
        {lineId:'int-0006-l3',speaker:'Interviewer',text:'Can you start by telling me a little about yourself and your experience?'},
        {lineId:'int-0006-l4',speaker:'Candidate',text:'Certainly. I have been working in customer service for the past two years, and I enjoy helping people solve problems.'}
      ],
      pashtoSupport:'د کار مرکه پیل', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['interviewer','candidate','experience','customer service'],
      grammarTargets:['present-perfect-experience','gerund-enjoy'],
      listeningSkills:['understanding-formal-context','identifying-key-information'],
      speechProfile:'normal', estimatedAudioSeconds:28, estimatedPracticeMinutes:12,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-int-0007', itemType:'sentence-sequence', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Leaving a Phone Message', acceptedLevelId:'intermediate', minimumLevelId:'elementary', maximumLevelId:'advanced',
      pathwayIds:['general-adult','job-professional'], themeIds:['communication','work'],
      script:[
        {lineId:'int-0007-l1',speaker:'Receptionist',text:'Good afternoon, Zirak Academy. How can I help you?'},
        {lineId:'int-0007-l2',speaker:'Caller',text:'Hello, I would like to speak with the admissions office, please.'},
        {lineId:'int-0007-l3',speaker:'Receptionist',text:'I am afraid they are busy at the moment. Can I take a message?'},
        {lineId:'int-0007-l4',speaker:'Caller',text:'Yes, please. Could you tell them that Ahmad Rahimi called and ask them to call me back this afternoon?'}
      ],
      pashtoSupport:'تلیفون کول او پیغام پریښودل', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['receptionist','admissions','message','call back'],
      grammarTargets:['reported-speech-request','polite-modal-could'],
      listeningSkills:['telephone-conversation','understanding-request'],
      speechProfile:'normal', estimatedAudioSeconds:30, estimatedPracticeMinutes:12,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-int-0008', itemType:'mini-dialogue', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Reporting a Water Leak', acceptedLevelId:'intermediate', minimumLevelId:'elementary', maximumLevelId:'advanced',
      pathwayIds:['general-adult'], themeIds:['general-conversation','housing'],
      script:[
        {lineId:'int-0008-l1',speaker:'Noor',text:'I am sorry to bother you, but there is a problem with the water pipe in my kitchen.'},
        {lineId:'int-0008-l2',speaker:'Landlord',text:'Oh dear. When did you first notice it?'},
        {lineId:'int-0008-l3',speaker:'Noor',text:'Yesterday evening. There is a small leak under the sink, and it has been dripping since last night.'},
        {lineId:'int-0008-l4',speaker:'Landlord',text:'I will send a plumber tomorrow morning. Put a bucket under the pipe to avoid any damage.'}
      ],
      pashtoSupport:'د اوبو لیک راپور', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['notice','leak','dripping','plumber','damage'],
      grammarTargets:['present-perfect-continuous','imperative-advice'],
      listeningSkills:['identifying-problem','understanding-solution'],
      speechProfile:'normal', estimatedAudioSeconds:32, estimatedPracticeMinutes:13,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-int-0009', itemType:'announcement', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'School Timetable Announcement', acceptedLevelId:'intermediate', minimumLevelId:'beginner', maximumLevelId:'advanced',
      pathwayIds:['child','teen'], themeIds:['education','time'],
      script:[
        {lineId:'int-0009-l1',speaker:'Announcer',text:'Attention all students. Please listen carefully to this important announcement.'},
        {lineId:'int-0009-l2',speaker:'Announcer',text:'Due to the national holiday next Thursday, classes will be cancelled for that day only.'},
        {lineId:'int-0009-l3',speaker:'Announcer',text:'All missed lessons will be rescheduled on the following Saturday morning.'},
        {lineId:'int-0009-l4',speaker:'Announcer',text:'Please inform your parents and bring your books as normal. Thank you for your attention.'}
      ],
      pashtoSupport:'د ښوونځي اعلان', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['announcement','national','cancelled','rescheduled','inform'],
      grammarTargets:['passive-voice','future-arrangements'],
      listeningSkills:['listening-to-announcement','identifying-key-facts'],
      speechProfile:'clear', estimatedAudioSeconds:28, estimatedPracticeMinutes:12,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-int-0010', itemType:'mini-dialogue', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Ordering at a Restaurant', acceptedLevelId:'intermediate', minimumLevelId:'beginner', maximumLevelId:'advanced',
      pathwayIds:['general-adult','teen'], themeIds:['food-and-drink'],
      script:[
        {lineId:'int-0010-l1',speaker:'Waiter',text:'Welcome. Are you ready to order, or would you like a few more minutes?'},
        {lineId:'int-0010-l2',speaker:'Customer',text:'I think we are ready. I will have the grilled chicken with rice, please.'},
        {lineId:'int-0010-l3',speaker:'Waiter',text:'Excellent choice. And what would you like to drink?'},
        {lineId:'int-0010-l4',speaker:'Customer',text:'Water, please. Actually, could I also have a small salad on the side?'},
        {lineId:'int-0010-l5',speaker:'Waiter',text:'Of course. Your order will be ready in about fifteen minutes.'}
      ],
      pashtoSupport:'د خواړه ورکولو ځای کې آرډر', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['order','grilled','excellent','salad','side'],
      grammarTargets:['conditional-polite-would','future-will'],
      listeningSkills:['restaurant-interaction','identifying-order-details'],
      speechProfile:'normal', estimatedAudioSeconds:30, estimatedPracticeMinutes:13,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' }
  ];


  // -----------------------------------------------------------------------
  // SECTION 4: NEW AUTHORED ADVANCED ITEMS (~100-170 spoken words each)
  // -----------------------------------------------------------------------
  var D18_ADVANCED_ITEMS = [
    { contentId:'listen-d18-adv-0001', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Daily Practice and Language Fluency', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['teen','general-adult','job-professional'], themeIds:['education','language-learning'],
      script:[
        {lineId:'adv-0001-l1',speaker:'Narrator',text:'Many learners believe that attending class once or twice a week is enough to become fluent in English.'},
        {lineId:'adv-0001-l2',speaker:'Narrator',text:'However, research consistently shows that daily exposure to the language is far more effective than occasional intensive sessions.'},
        {lineId:'adv-0001-l3',speaker:'Narrator',text:'When you practise every day, even for just twenty minutes, your brain builds stronger connections with vocabulary and grammar patterns.'},
        {lineId:'adv-0001-l4',speaker:'Narrator',text:'The key is consistency rather than duration. A short daily session beats a long weekly one every time.'},
        {lineId:'adv-0001-l5',speaker:'Narrator',text:'This is why professional language teachers recommend activities outside the classroom: reading, listening to simple podcasts, and speaking with a partner.'},
        {lineId:'adv-0001-l6',speaker:'Narrator',text:'Even small habits, such as labelling objects around your home in English, can have a surprisingly strong impact on your fluency over time.'}
      ],
      estimatedWordCount:148,
      pashtoSupport:'د ورځني انګریزي تمرین اهمیت', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['fluent','consistently','exposure','intensive','consistency','duration','impact'],
      grammarTargets:['comparative-structures','gerunds-as-subject','when-clauses'],
      discourseTargets:['claim-support','contrast','exemplification'],
      listeningSkills:['identifying-main-claim','understanding-supporting-detail','inferring-conclusion','note-taking'],
      speechProfile:'normal-academic', estimatedAudioSeconds:80, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-adv-0002', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Comparing City and Village Life', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['general-adult','job-professional','academic-preparation'], themeIds:['culture','places'],
      script:[
        {lineId:'adv-0002-l1',speaker:'Narrator',text:'Life in the city and life in the village offer very different experiences for Afghan families.'},
        {lineId:'adv-0002-l2',speaker:'Narrator',text:'In cities like Kabul, people have easier access to hospitals, schools, and employment opportunities.'},
        {lineId:'adv-0002-l3',speaker:'Narrator',text:'However, city life also comes with its own challenges: higher costs, traffic congestion, and a faster pace that can feel overwhelming.'},
        {lineId:'adv-0002-l4',speaker:'Narrator',text:'Village life, on the other hand, often means stronger community bonds, cleaner air, and a slower rhythm that many people find more peaceful.'},
        {lineId:'adv-0002-l5',speaker:'Narrator',text:'Yet villagers frequently face limited access to healthcare, education, and economic opportunities, which is why many families move to urban areas.'},
        {lineId:'adv-0002-l6',speaker:'Narrator',text:'Neither lifestyle is perfect. The decision depends heavily on a family\'s priorities, resources, and long-term goals.'}
      ],
      estimatedWordCount:147,
      pashtoSupport:'د ښار او کلي ژوند پرتله', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['access','employment','congestion','overwhelming','community','bonds','priorities'],
      grammarTargets:['contrast-connectors','however-on-the-other-hand','comparative-adjectives'],
      discourseTargets:['comparison-contrast','concession','balanced-argument'],
      listeningSkills:['identifying-contrast','understanding-both-sides','inferring-conclusion','note-taking'],
      speechProfile:'normal-academic', estimatedAudioSeconds:82, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-adv-0003', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'The Role of Hospitality in Afghan Culture', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['general-adult','job-professional','academic-preparation'], themeIds:['culture'],
      script:[
        {lineId:'adv-0003-l1',speaker:'Narrator',text:'Hospitality is not merely a tradition in Afghanistan — it is a deeply held cultural value that shapes daily social life.'},
        {lineId:'adv-0003-l2',speaker:'Narrator',text:'When a guest arrives, the family is expected to offer food, drink, and a comfortable place to rest, regardless of their own financial situation.'},
        {lineId:'adv-0003-l3',speaker:'Narrator',text:'This practice reflects the Islamic principle of treating others with generosity and respect, and it creates bonds of trust within communities.'},
        {lineId:'adv-0003-l4',speaker:'Narrator',text:'In professional settings, this hospitality often extends to business relationships. Sharing a meal before a meeting is considered an important step in building trust.'},
        {lineId:'adv-0003-l5',speaker:'Narrator',text:'However, younger generations in urban areas are navigating a balance between maintaining this tradition and adapting to the faster pace of modern professional life.'},
        {lineId:'adv-0003-l6',speaker:'Narrator',text:'The core value of hospitality remains strong, even as the specific practices evolve with changing times.'}
      ],
      estimatedWordCount:150,
      pashtoSupport:'د افغان کلتور کې مهمان نوازي', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['hospitality','tradition','regardless','generosity','navigating','evolve'],
      grammarTargets:['passive-expectation','not-merely-but','while-balance'],
      discourseTargets:['definition-expansion','cultural-observation','concession-and-restatement'],
      listeningSkills:['understanding-cultural-context','identifying-main-idea','recognizing-nuance'],
      speechProfile:'normal-academic', estimatedAudioSeconds:84, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-adv-0004', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Preparing for a Job Interview', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['general-adult','job-professional'], themeIds:['work'],
      script:[
        {lineId:'adv-0004-l1',speaker:'Narrator',text:'Preparing well for a job interview can be the difference between receiving an offer and losing an opportunity.'},
        {lineId:'adv-0004-l2',speaker:'Narrator',text:'Before the interview, research the organisation thoroughly. Understand what they do, who they serve, and what values they promote.'},
        {lineId:'adv-0004-l3',speaker:'Narrator',text:'Prepare clear, honest answers to common questions such as: tell me about yourself, what are your strengths, and why do you want this position.'},
        {lineId:'adv-0004-l4',speaker:'Narrator',text:'Practise speaking at a steady pace. Nervous candidates often speak too quickly, which can make them difficult to understand.'},
        {lineId:'adv-0004-l5',speaker:'Narrator',text:'On the day itself, arrive a few minutes early, dress professionally, and greet everyone with confidence and respect.'},
        {lineId:'adv-0004-l6',speaker:'Narrator',text:'After the interview, send a brief thank-you message to confirm your interest. This small step often makes a positive impression.'}
      ],
      estimatedWordCount:151,
      pashtoSupport:'د کار مرکې لپاره چمتووالی', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['thoroughly','promote','steady','professionally','confidence','impression'],
      grammarTargets:['imperative-advice','gerund-subject','which-relative-clause'],
      discourseTargets:['sequential-advice','reason-and-result','cause-and-effect'],
      listeningSkills:['listening-for-advice','sequencing-steps','note-taking'],
      speechProfile:'normal-academic', estimatedAudioSeconds:83, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-adv-0005', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Understanding Different English Accents', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['teen','general-adult','academic-preparation'], themeIds:['language-learning'],
      script:[
        {lineId:'adv-0005-l1',speaker:'Narrator',text:'One challenge that advanced learners frequently face is understanding speakers with different accents.'},
        {lineId:'adv-0005-l2',speaker:'Narrator',text:'English is spoken as a first language in many countries, including the United Kingdom, the United States, Australia, and Canada, and each region has its own distinctive pronunciation patterns.'},
        {lineId:'adv-0005-l3',speaker:'Narrator',text:'In addition, millions of people speak English as a second or additional language, often bringing their native language sounds into their English.'},
        {lineId:'adv-0005-l4',speaker:'Narrator',text:'The key to understanding varied accents is exposure. The more you listen to different speakers, the more quickly your brain learns to adjust.'},
        {lineId:'adv-0005-l5',speaker:'Narrator',text:'Rather than focusing only on one model accent, experienced teachers recommend listening to a range of speakers and focusing on meaning and context.'},
        {lineId:'adv-0005-l6',speaker:'Narrator',text:'This approach builds flexible listening skills that serve you well in real-world conversations, both at work and in daily life.'}
      ],
      estimatedWordCount:153,
      pashtoSupport:'د انګریزي مختلف تلفظونه پوهیدل', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['distinctive','pronunciation','additional','varied','flexible','approach'],
      grammarTargets:['gerund-after-preposition','including-as-exemplifier','rather-than'],
      discourseTargets:['problem-identification','explanation','recommendation'],
      listeningSkills:['understanding-explanatory-text','identifying-recommendation','note-taking'],
      speechProfile:'normal-academic', estimatedAudioSeconds:84, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-adv-0006', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Technology and Education in Rural Areas', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['general-adult','academic-preparation'], themeIds:['education'],
      script:[
        {lineId:'adv-0006-l1',speaker:'Narrator',text:'Access to quality education has long been a challenge for communities in rural and remote areas.'},
        {lineId:'adv-0006-l2',speaker:'Narrator',text:'In many regions, the nearest secondary school or teacher-training centre may be several hours away, making regular attendance nearly impossible.'},
        {lineId:'adv-0006-l3',speaker:'Narrator',text:'In recent years, affordable smartphones and improved mobile networks have begun to change this picture.'},
        {lineId:'adv-0006-l4',speaker:'Narrator',text:'Educational apps, recorded lessons, and audio learning materials can now reach students in areas where no physical classroom exists.'},
        {lineId:'adv-0006-l5',speaker:'Narrator',text:'However, technology alone is not a complete solution. Students still need guidance, encouragement, and periodic contact with a qualified teacher.'},
        {lineId:'adv-0006-l6',speaker:'Narrator',text:'The most effective programmes combine digital tools with regular community teacher visits, creating a hybrid model that respects both modern innovation and local educational needs.'}
      ],
      estimatedWordCount:152,
      pashtoSupport:'د لیرو سیمو تعلیم او ټیکنالوژي', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['remote','attendance','affordable','guidance','hybrid','innovation'],
      grammarTargets:['passive-have-been','making-contrast-however','relative-clause-where'],
      discourseTargets:['problem-solution','contrast','combining-ideas'],
      listeningSkills:['understanding-complex-argument','identifying-solution','note-taking'],
      speechProfile:'normal-academic', estimatedAudioSeconds:85, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-adv-0007', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Building Confidence as a Speaker', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['teen','general-adult','job-professional'], themeIds:['language-learning','work'],
      script:[
        {lineId:'adv-0007-l1',speaker:'Narrator',text:'Speaking confidently in a second language is one of the most challenging — and most rewarding — skills a learner can develop.'},
        {lineId:'adv-0007-l2',speaker:'Narrator',text:'Many students understand English well when they read or listen, but freeze when asked to speak in front of others.'},
        {lineId:'adv-0007-l3',speaker:'Narrator',text:'This is a normal reaction. The fear of making mistakes is a psychological barrier, not a linguistic one.'},
        {lineId:'adv-0007-l4',speaker:'Narrator',text:'Experienced teachers use structured speaking activities — such as role plays, guided discussions, and recorded monologues — to gradually reduce this anxiety.'},
        {lineId:'adv-0007-l5',speaker:'Narrator',text:'Over time, students discover that communication matters more than perfection. Native speakers also make grammatical errors; what matters is being understood.'},
        {lineId:'adv-0007-l6',speaker:'Narrator',text:'Confidence grows through repetition, positive feedback, and the experience of successfully communicating a real idea to another person.'}
      ],
      estimatedWordCount:148,
      pashtoSupport:'د ویلو باور لرل', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['confidently','rewarding','psychological','barrier','anxiety','perfection'],
      grammarTargets:['ing-form-as-subject','passive-activities','such-as-exemplifier'],
      discourseTargets:['problem-explanation','solution-strategy','encouraging-conclusion'],
      listeningSkills:['identifying-main-argument','understanding-implied-message','note-taking'],
      speechProfile:'normal-academic', estimatedAudioSeconds:82, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-adv-0008', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Managing Time as a Working Student', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['general-adult','job-professional'], themeIds:['work','education'],
      script:[
        {lineId:'adv-0008-l1',speaker:'Narrator',text:'Many students in Afghanistan balance studying English with work, family responsibilities, and other daily demands.'},
        {lineId:'adv-0008-l2',speaker:'Narrator',text:'Managing time effectively under these conditions requires clear priorities and a realistic study schedule.'},
        {lineId:'adv-0008-l3',speaker:'Narrator',text:'Experienced learners recommend identifying your most productive time of day and protecting that time specifically for English practice.'},
        {lineId:'adv-0008-l4',speaker:'Narrator',text:'Even fifteen focused minutes is significantly more effective than two unfocused hours during which you are also answering messages and thinking about other tasks.'},
        {lineId:'adv-0008-l5',speaker:'Narrator',text:'Another useful strategy is to combine English practice with activities you already do — listening to English during your commute or while cooking.'},
        {lineId:'adv-0008-l6',speaker:'Narrator',text:'The goal is not to add stress but to make English a natural and manageable part of your daily routine.'}
      ],
      estimatedWordCount:148,
      pashtoSupport:'د کار او زده کړې وخت مدیریت', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['balance','demands','priorities','productive','significantly','strategy'],
      grammarTargets:['gerund-managing','comparative-more-than','for-example-exemplifier'],
      discourseTargets:['practical-advice','exemplification','conclusion'],
      listeningSkills:['listening-for-advice','note-taking','inferring-main-message'],
      speechProfile:'normal-academic', estimatedAudioSeconds:82, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-adv-0009', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'The Value of Asking Questions', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['teen','general-adult'], themeIds:['education','language-learning'],
      script:[
        {lineId:'adv-0009-l1',speaker:'Narrator',text:'In many traditional classroom settings, students feel reluctant to ask questions because they fear appearing ignorant in front of their peers.'},
        {lineId:'adv-0009-l2',speaker:'Narrator',text:'This is particularly common in language learning, where students worry that asking about a word or grammar point will reveal their weakness.'},
        {lineId:'adv-0009-l3',speaker:'Narrator',text:'However, research in educational psychology consistently demonstrates that students who ask questions learn significantly faster than those who remain silent and confused.'},
        {lineId:'adv-0009-l4',speaker:'Narrator',text:'Asking a question does not signal weakness — it signals curiosity, engagement, and a genuine desire to understand.'},
        {lineId:'adv-0009-l5',speaker:'Narrator',text:'Good teachers create a classroom environment where all questions are welcomed and no student feels judged for not knowing something.'},
        {lineId:'adv-0009-l6',speaker:'Narrator',text:'The question you have is almost certainly the question at least five other students also have.'}
      ],
      estimatedWordCount:149,
      pashtoSupport:'د پوښتنو پوښتلو ارزښت', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['reluctant','ignorant','peers','psychology','demonstrates','curiosity','engagement'],
      grammarTargets:['where-relative-clause','that-clause-research-shows','signalling-contrast-however'],
      discourseTargets:['problem-then-counter-argument','evidence-support','direct-address'],
      listeningSkills:['identifying-argument-structure','recognizing-evidence','inferring-speaker-stance'],
      speechProfile:'normal-academic', estimatedAudioSeconds:85, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-adv-0010', itemType:'short-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Communication in Professional Settings', acceptedLevelId:'advanced', minimumLevelId:'intermediate', maximumLevelId:'academic',
      pathwayIds:['general-adult','job-professional'], themeIds:['work','communication'],
      script:[
        {lineId:'adv-0010-l1',speaker:'Narrator',text:'Professional communication differs from casual conversation in several important ways.'},
        {lineId:'adv-0010-l2',speaker:'Narrator',text:'In a work environment, clarity and precision are essential. Vague instructions or unclear messages can lead to costly mistakes and misunderstandings.'},
        {lineId:'adv-0010-l3',speaker:'Narrator',text:'Professional speakers also pay careful attention to tone. Being direct is not the same as being rude. It is possible to communicate firmly and respectfully at the same time.'},
        {lineId:'adv-0010-l4',speaker:'Narrator',text:'Written communication — such as emails and reports — requires even more care, because the reader cannot see your body language or hear your tone of voice.'},
        {lineId:'adv-0010-l5',speaker:'Narrator',text:'Listening is also a professional skill. Active listening means giving full attention, asking clarifying questions, and confirming your understanding before responding.'},
        {lineId:'adv-0010-l6',speaker:'Narrator',text:'Professionals who communicate clearly and listen well are consistently rated as more competent and trustworthy than those who do not.'}
      ],
      estimatedWordCount:152,
      pashtoSupport:'د کار ځای کې اړیکه نیول', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['precision','essential','vague','tone','respectfully','clarifying','competent'],
      grammarTargets:['is-not-the-same-as','gerund-listening','passive-are-rated'],
      discourseTargets:['defining-by-contrast','listing-features','concluding-claim'],
      listeningSkills:['identifying-professional-advice','distinguishing-main-and-supporting-points'],
      speechProfile:'normal-academic', estimatedAudioSeconds:84, estimatedPracticeMinutes:18,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' }
  ];


  // -----------------------------------------------------------------------
  // SECTION 5: NEW AUTHORED ACADEMIC ITEMS (~140-220 spoken words each)
  // -----------------------------------------------------------------------
  var D18_ACADEMIC_ITEMS = [
    { contentId:'listen-d18-aca-0001', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Vocabulary Size and Reading Comprehension', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation','job-professional'], themeIds:['education','language-learning'],
      script:[
        {lineId:'aca-0001-l1',speaker:'Lecturer',text:'Today I want to discuss a central finding in applied linguistics research: the relationship between vocabulary size and reading comprehension.'},
        {lineId:'aca-0001-l2',speaker:'Lecturer',text:'Studies consistently show that knowing approximately ninety-five percent of the words in a text is the minimum threshold for comfortable independent reading.'},
        {lineId:'aca-0001-l3',speaker:'Lecturer',text:'Below this threshold, readers encounter too many unknown words to reconstruct meaning from context, and comprehension breaks down.'},
        {lineId:'aca-0001-l4',speaker:'Lecturer',text:'This has practical implications for teachers. It means that assigning texts far above a student\'s current vocabulary level does not build reading skills — it builds frustration.'},
        {lineId:'aca-0001-l5',speaker:'Lecturer',text:'The more effective approach is to select texts where approximately five percent of the vocabulary is new, allowing the reader to use context to infer meaning while still understanding the overall argument.'},
        {lineId:'aca-0001-l6',speaker:'Lecturer',text:'Over time, this gradual exposure builds both vocabulary size and the metacognitive strategies needed to handle increasingly complex academic texts.'},
        {lineId:'aca-0001-l7',speaker:'Lecturer',text:'To summarise: vocabulary development is not separate from comprehension development. They are deeply and mutually dependent.'}
      ],
      estimatedWordCount:178,
      pashtoSupport:'د لوستلو پوهاوي او د کلمو اړیکه', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['applied linguistics','threshold','reconstruct','implications','metacognitive','mutually'],
      grammarTargets:['it-is-that-extraposition','where-relative-clause','allowing-participial'],
      discourseTargets:['thesis-statement','evidence-from-research','implication','practical-application','summary-restatement'],
      listeningSkills:['identifying-main-claim','understanding-evidence','recognising-implication','note-taking-academic','summarising-orally'],
      speechProfile:'academic-measured', estimatedAudioSeconds:106, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-aca-0002', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Motivation and Language Learning: Two Theories', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation'], themeIds:['education','language-learning'],
      script:[
        {lineId:'aca-0002-l1',speaker:'Lecturer',text:'Researchers have proposed several theories to explain what motivates people to learn a second language. Today I will compare two of the most influential.'},
        {lineId:'aca-0002-l2',speaker:'Lecturer',text:'The first is instrumental motivation, where the learner\'s goal is practical: to get a job, pass an examination, or access educational resources in a new language.'},
        {lineId:'aca-0002-l3',speaker:'Lecturer',text:'The second is integrative motivation, where the learner has a deeper interest in the culture, society, or community that uses the target language.'},
        {lineId:'aca-0002-l4',speaker:'Lecturer',text:'For many years, researchers believed that integrative motivation produced stronger and more sustained learning outcomes than instrumental motivation.'},
        {lineId:'aca-0002-l5',speaker:'Lecturer',text:'However, more recent studies have challenged this conclusion. They suggest that both types of motivation can be equally powerful, and that motivation changes over time as learners\' circumstances and goals evolve.'},
        {lineId:'aca-0002-l6',speaker:'Lecturer',text:'What matters most, the current research suggests, is not which type of motivation a learner begins with, but whether that motivation remains active and is supported by the learning environment.'},
        {lineId:'aca-0002-l7',speaker:'Lecturer',text:'This has clear implications for classroom teachers: creating a positive, supportive environment can sustain motivation regardless of its original source.'}
      ],
      estimatedWordCount:196,
      pashtoSupport:'د ژبو زده کړې هڅونه', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['instrumental','integrative','sustained','outcomes','circumstances','implications','sustain'],
      grammarTargets:['where-relative-defining','passive-have-proposed','that-clause-reporting'],
      discourseTargets:['definition','comparison','contrast','challenge-to-previous-view','implication'],
      listeningSkills:['following-academic-lecture','comparing-two-theories','identifying-stance-shift','note-taking','oral-summary'],
      speechProfile:'academic-measured', estimatedAudioSeconds:116, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-aca-0003', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Teaching English in Multilingual Classrooms', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation','job-professional'], themeIds:['education'],
      script:[
        {lineId:'aca-0003-l1',speaker:'Speaker',text:'Teaching English in a classroom where students speak several different first languages presents challenges that are quite different from teaching in a monolingual setting.'},
        {lineId:'aca-0003-l2',speaker:'Speaker',text:'In a monolingual classroom, the teacher can use the shared first language to clarify difficult concepts, provide quick translations, and build on familiar grammar structures.'},
        {lineId:'aca-0003-l3',speaker:'Speaker',text:'In a multilingual classroom, none of these strategies is available in the same way. The teacher must rely almost entirely on English for instruction, demonstration, and support.'},
        {lineId:'aca-0003-l4',speaker:'Speaker',text:'This places a much higher demand on the teacher\'s ability to use visual aids, gestures, examples, and repeated explanations to ensure that all students understand.'},
        {lineId:'aca-0003-l5',speaker:'Speaker',text:'However, multilingual classrooms also have genuine advantages. Students are exposed to different pronunciation patterns, cultural perspectives, and communication styles, which can enrich the learning experience.'},
        {lineId:'aca-0003-l6',speaker:'Speaker',text:'Research suggests that students in multilingual settings often develop stronger metalinguistic awareness — a greater ability to think about how language works — than their monolingual peers.'},
        {lineId:'aca-0003-l7',speaker:'Speaker',text:'The key for the teacher is to view the linguistic diversity of the classroom not as a problem to manage, but as a resource to develop.'}
      ],
      estimatedWordCount:198,
      pashtoSupport:'د ډول ډول ژبو ټولګیو کې د انګریزي ښوونه', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['multilingual','monolingual','demonstration','metalinguistic','awareness','perspectives','diversity'],
      grammarTargets:['where-adverbial','that-is-appositive','passive-are-exposed'],
      discourseTargets:['contrast-structure','advantage-disadvantage','research-evidence','reframing-conclusion'],
      listeningSkills:['understanding-complex-argument','identifying-concession','recognising-reframing','note-taking','oral-discussion'],
      speechProfile:'academic-measured', estimatedAudioSeconds:118, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-aca-0004', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Critical Thinking as an Academic Skill', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation'], themeIds:['education'],
      script:[
        {lineId:'aca-0004-l1',speaker:'Tutor',text:'One of the most important skills you will need in academic study is the ability to think critically about information.'},
        {lineId:'aca-0004-l2',speaker:'Tutor',text:'Critical thinking does not mean criticising everything you read or hear. Rather, it means evaluating ideas carefully and systematically before accepting them.'},
        {lineId:'aca-0004-l3',speaker:'Tutor',text:'When you encounter a claim, ask yourself: what evidence does the author provide? Is the evidence reliable and relevant? Are there alternative explanations?'},
        {lineId:'aca-0004-l4',speaker:'Tutor',text:'It is also important to consider the source. Academic papers reviewed by other experts in the field are generally more reliable than opinion articles or social media posts.'},
        {lineId:'aca-0004-l5',speaker:'Tutor',text:'Bias is another factor to examine. Every source reflects the perspective of its author, and understanding that perspective helps you evaluate the information more accurately.'},
        {lineId:'aca-0004-l6',speaker:'Tutor',text:'Finally, good critical thinkers are also willing to revise their own views when new evidence requires it. Intellectual flexibility is a strength, not a weakness.'},
        {lineId:'aca-0004-l7',speaker:'Tutor',text:'As you progress through your academic studies, practise these habits of thought every time you read, listen, or discuss ideas with others.'}
      ],
      estimatedWordCount:192,
      pashtoSupport:'د تنقیدي فکر کولو اکادمیک مهارت', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['critically','systematically','reliable','relevant','bias','perspective','intellectual'],
      grammarTargets:['ask-yourself-questions','when-you-clauses','rather-it-means'],
      discourseTargets:['definition-by-contrast','evaluative-questions','listing-factors','concluding-encouragement'],
      listeningSkills:['following-academic-instruction','identifying-evaluative-criteria','note-taking-academic','oral-discussion'],
      speechProfile:'academic-measured', estimatedAudioSeconds:114, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-aca-0005', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'The Development of Formal Written English', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation'], themeIds:['language-learning','education'],
      script:[
        {lineId:'aca-0005-l1',speaker:'Lecturer',text:'The formal written register of English that we associate with academic and professional life did not develop suddenly. It evolved gradually over several centuries.'},
        {lineId:'aca-0005-l2',speaker:'Lecturer',text:'During the sixteenth and seventeenth centuries, English writers began borrowing heavily from Latin and Greek to describe new scientific and philosophical concepts.'},
        {lineId:'aca-0005-l3',speaker:'Lecturer',text:'This borrowing gave English its large academic vocabulary — words like hypothesis, analysis, synthesis, and phenomenon — which learners today often find challenging.'},
        {lineId:'aca-0005-l4',speaker:'Lecturer',text:'At the same time, certain grammatical conventions became associated with formality: the passive voice to present information without a personal subject, for example.'},
        {lineId:'aca-0005-l5',speaker:'Lecturer',text:'Today, academic English continues to evolve. There is a growing movement towards plainer, clearer writing — using shorter sentences and more direct language — while maintaining precision and accuracy.'},
        {lineId:'aca-0005-l6',speaker:'Lecturer',text:'For learners of academic English, this means developing two related competencies: understanding the traditional conventions and understanding when those conventions are changing.'},
        {lineId:'aca-0005-l7',speaker:'Lecturer',text:'The goal, ultimately, is not to sound impressive but to communicate ideas clearly to an educated reader.'}
      ],
      estimatedWordCount:190,
      pashtoSupport:'د رسمي لیکلي انګریزي پرمختیا', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['register','evolved','borrowing','conventions','formality','competencies','precision'],
      grammarTargets:['passive-formal-use','that-relative-which','towards-gerund'],
      discourseTargets:['historical-development','cause-and-effect','contrast-old-new','concluding-purpose'],
      listeningSkills:['following-historical-narrative','identifying-key-developments','recognising-contrast-over-time','note-taking','oral-summary'],
      speechProfile:'academic-measured', estimatedAudioSeconds:113, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-aca-0006', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Effective Listening in Academic Lectures', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation'], themeIds:['education','language-learning'],
      script:[
        {lineId:'aca-0006-l1',speaker:'Tutor',text:'Academic lectures are one of the primary ways that knowledge is transmitted in universities, yet many students struggle to listen effectively in this setting.'},
        {lineId:'aca-0006-l2',speaker:'Tutor',text:'The challenge is that effective academic listening requires more than passive reception of information. It requires active cognitive engagement.'},
        {lineId:'aca-0006-l3',speaker:'Tutor',text:'Before a lecture, read briefly about the topic so that key terms are not completely unfamiliar. This pre-activation of background knowledge significantly improves comprehension.'},
        {lineId:'aca-0006-l4',speaker:'Tutor',text:'During the lecture, do not try to write down every word. Instead, listen for the main claim, the supporting evidence, and the relationship between ideas.'},
        {lineId:'aca-0006-l5',speaker:'Tutor',text:'Note-taking should be selective and structured. Abbreviations, symbols, and visual organisers help you capture information efficiently without losing the thread of the argument.'},
        {lineId:'aca-0006-l6',speaker:'Tutor',text:'After the lecture, review your notes within twenty-four hours while the content is still relatively fresh. Clarify any gaps by consulting the course materials or a reliable academic source.'},
        {lineId:'aca-0006-l7',speaker:'Tutor',text:'With consistent practice, the combination of pre-reading, active listening, and timely review will transform your ability to learn from spoken academic discourse.'}
      ],
      estimatedWordCount:194,
      pashtoSupport:'د اکادمیک درسونو اورېدل', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['transmitted','passive','cognitive','engagement','pre-activation','abbreviations','discourse'],
      grammarTargets:['passive-are-transmitted','without-gerund','so-that-purpose'],
      discourseTargets:['before-during-after-structure','sequential-advice','concluding-encouragement'],
      listeningSkills:['meta-listening-skills','strategy-identification','note-taking','critical-engagement'],
      speechProfile:'academic-measured', estimatedAudioSeconds:116, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-aca-0007', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Globalisation and the Spread of English', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation','job-professional'], themeIds:['language-learning','general-conversation'],
      script:[
        {lineId:'aca-0007-l1',speaker:'Speaker',text:'The global spread of English is one of the most significant linguistic developments of the twentieth and twenty-first centuries.'},
        {lineId:'aca-0007-l2',speaker:'Speaker',text:'Today, English functions as the primary language of international trade, science, diplomacy, and digital communication, connecting speakers across more than a hundred and fifty countries.'},
        {lineId:'aca-0007-l3',speaker:'Speaker',text:'This expansion has brought obvious benefits: people across the world can now communicate directly without translators, and researchers can share findings with a global audience.'},
        {lineId:'aca-0007-l4',speaker:'Speaker',text:'However, critics argue that the dominance of English also creates inequalities. Speakers whose first language is English have an inherent advantage in international settings.'},
        {lineId:'aca-0007-l5',speaker:'Speaker',text:'There is also concern about language loss. As communities shift to English for education and commerce, smaller local languages sometimes decline or disappear.'},
        {lineId:'aca-0007-l6',speaker:'Speaker',text:'The challenge for the future is to maintain the communicative benefits of a shared global language while also protecting the cultural and intellectual wealth encoded in the world\'s diverse languages.'},
        {lineId:'aca-0007-l7',speaker:'Speaker',text:'This is not a simple problem with a simple answer, but it is one that linguists, educators, and policymakers will need to address together in the coming decades.'}
      ],
      estimatedWordCount:196,
      pashtoSupport:'د نړۍ کچه کې د انګریزي خپرېدل', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['globalisation','diplomacy','dominance','inequalities','inherent','encoded','policymakers'],
      grammarTargets:['passive-is-recognised','as-temporal-shift','that-argue-reporting'],
      discourseTargets:['benefits-drawbacks-structure','concession','future-challenge','call-to-action'],
      listeningSkills:['understanding-academic-argument','identifying-stance','comparing-perspectives','note-taking','oral-discussion'],
      speechProfile:'academic-measured', estimatedAudioSeconds:117, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-aca-0008', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'The Purpose of Academic Writing', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation'], themeIds:['education','language-learning'],
      script:[
        {lineId:'aca-0008-l1',speaker:'Tutor',text:'Students sometimes approach academic writing as a performance — an exercise designed to demonstrate knowledge to a teacher or examiner.'},
        {lineId:'aca-0008-l2',speaker:'Tutor',text:'While this view is understandable, it often leads to writing that is technically correct but intellectually hollow.'},
        {lineId:'aca-0008-l3',speaker:'Tutor',text:'The purpose of academic writing, at its best, is not to display what you know but to develop and communicate a reasoned position on a question that matters.'},
        {lineId:'aca-0008-l4',speaker:'Tutor',text:'This requires you to engage seriously with evidence, acknowledge the limits of your argument, and respond honestly to potential counterarguments.'},
        {lineId:'aca-0008-l5',speaker:'Tutor',text:'Good academic writing also has a reader in mind: an intelligent, sceptical reader who requires evidence for every significant claim and who will notice when reasoning is unclear or incomplete.'},
        {lineId:'aca-0008-l6',speaker:'Tutor',text:'When you write with this imagined reader in mind, your writing becomes more precise, more honest, and ultimately more persuasive.'},
        {lineId:'aca-0008-l7',speaker:'Tutor',text:'Think of every piece of academic writing as an act of intellectual contribution, however small, to an ongoing conversation in your field.'}
      ],
      estimatedWordCount:186,
      pashtoSupport:'د اکادمیک لیکلو موخه', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['performance','hollow','reasoned','counterarguments','sceptical','contribution','ongoing'],
      grammarTargets:['not-to-but-to','with-mind-phrase','when-you-clauses'],
      discourseTargets:['reframing-purpose','requirement-listing','reader-awareness','motivating-conclusion'],
      listeningSkills:['understanding-abstract-argument','identifying-reframing','note-taking','critical-reflection'],
      speechProfile:'academic-measured', estimatedAudioSeconds:112, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-aca-0009', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Qualitative and Quantitative Research Methods', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation'], themeIds:['education'],
      script:[
        {lineId:'aca-0009-l1',speaker:'Lecturer',text:'In academic research, two broad approaches are commonly used to investigate questions: qualitative and quantitative methods.'},
        {lineId:'aca-0009-l2',speaker:'Lecturer',text:'Quantitative research collects numerical data and uses statistical analysis to identify patterns, measure relationships, and test hypotheses across large groups.'},
        {lineId:'aca-0009-l3',speaker:'Lecturer',text:'Qualitative research, by contrast, explores meanings, experiences, and perspectives, typically through interviews, observation, or the analysis of texts.'},
        {lineId:'aca-0009-l4',speaker:'Lecturer',text:'Each approach has its strengths. Quantitative research can generalise findings across large populations. Qualitative research can reveal the depth and complexity of individual experience.'},
        {lineId:'aca-0009-l5',speaker:'Lecturer',text:'Historically, these two approaches were sometimes seen as incompatible, associated respectively with scientific and humanistic traditions.'},
        {lineId:'aca-0009-l6',speaker:'Lecturer',text:'However, many researchers today take a mixed-methods approach, combining both types of data to produce a more complete and nuanced understanding of complex questions.'},
        {lineId:'aca-0009-l7',speaker:'Lecturer',text:'When you encounter a research study, one of your first questions should be: which method was used, and is that method appropriate for the question being asked?'}
      ],
      estimatedWordCount:183,
      pashtoSupport:'د علمي څیړنې میتودونه', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['qualitative','quantitative','statistical','hypotheses','generalise','nuanced','incompatible'],
      grammarTargets:['by-contrast-connector','can-generalise-modal','when-you-clauses'],
      discourseTargets:['definition-and-example','comparison','historical-perspective','modern-synthesis','evaluative-question'],
      listeningSkills:['following-academic-comparison','defining-terms','identifying-key-distinctions','critical-question'],
      speechProfile:'academic-measured', estimatedAudioSeconds:110, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' },

    { contentId:'listen-d18-aca-0010', itemType:'extended-passage', contentOrigin:'academy-authored-d18', recordVersion:'1.0',
      title:'Professional Ethics and Responsibility', acceptedLevelId:'academic', minimumLevelId:'advanced', maximumLevelId:'academic',
      pathwayIds:['academic-preparation','job-professional'], themeIds:['work','education'],
      script:[
        {lineId:'aca-0010-l1',speaker:'Lecturer',text:'As you prepare to enter a professional field, one of the most important things to understand is the ethical framework that governs your work.'},
        {lineId:'aca-0010-l2',speaker:'Lecturer',text:'Ethics in professional life goes beyond simply obeying the law. It involves the active responsibility to act honestly, fairly, and in the interests of those you serve.'},
        {lineId:'aca-0010-l3',speaker:'Lecturer',text:'Conflicts of interest are one of the most common ethical challenges professionals face. These arise when personal or financial interests could influence professional judgement in a way that harms others.'},
        {lineId:'aca-0010-l4',speaker:'Lecturer',text:'The ethical response to a conflict of interest is full transparency: disclosing the conflict and, where necessary, withdrawing from the decision-making process.'},
        {lineId:'aca-0010-l5',speaker:'Lecturer',text:'Confidentiality is another core professional obligation. Information shared with you in a professional capacity must be protected and used only for its intended purpose.'},
        {lineId:'aca-0010-l6',speaker:'Lecturer',text:'Professional ethics also require ongoing development. Standards and expectations change over time, and professionals have a responsibility to stay informed and to reflect on their own practice.'},
        {lineId:'aca-0010-l7',speaker:'Lecturer',text:'Ultimately, ethical professional behaviour is not just about following rules — it is about building the trust that makes professional relationships and institutions function.'}
      ],
      estimatedWordCount:196,
      pashtoSupport:'د مسلکي اخلاقو ذمه واري', translationStatus:'phase-translated-unverified', translationSource:'phase-machine-draft',
      vocabularyTargets:['ethical','framework','transparency','confidentiality','obligation','ongoing','institutions'],
      grammarTargets:['goes-beyond-gerund','where-necessary-phrase','that-makes-clause'],
      discourseTargets:['definition','example-elaboration','ethical-response','obligation-listing','concluding-principle'],
      listeningSkills:['following-professional-ethics-lecture','identifying-ethical-principles','note-taking','oral-discussion'],
      speechProfile:'academic-measured', estimatedAudioSeconds:117, estimatedPracticeMinutes:25,
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending' }
  ];


  // -----------------------------------------------------------------------
  // SECTION 6: COMPREHENSION TASKS
  // -----------------------------------------------------------------------
  var D18_TASKS = [
    { taskId:'task-adv-0001-t1', packRef:'listen-d18-adv-pack-01', itemId:'listen-d18-adv-0001', stageId:'listen-for-detail',
      level:'advanced', taskType:'choose-main-idea',
      prompt:'What is the main claim of the passage?',
      options:['A) Attending class twice a week is enough to become fluent.',
               'B) Daily short practice is more effective than occasional long sessions.',
               'C) Reading English books is the best way to improve.',
               'D) Grammar is more important than vocabulary.'],
      correctIndex:1, explanation:'The passage argues that daily exposure builds stronger connections than occasional intensive sessions.',
      pashtoStatus:'phase-translated-unverified', evidenceWeight:1, retryPolicy:'once',
      scoringMode:'auto', technicalFailureBehavior:'neutral' },

    { taskId:'task-adv-0001-t2', packRef:'listen-d18-adv-pack-01', itemId:'listen-d18-adv-0001', stageId:'listen-for-detail',
      level:'advanced', taskType:'select-detail',
      prompt:'According to the passage, what is one recommended activity outside the classroom?',
      options:['A) Writing grammar exercises','B) Memorising vocabulary lists',
               'C) Listening to simple podcasts','D) Watching films for entertainment'],
      correctIndex:2, explanation:'The passage specifically mentions listening to simple podcasts.',
      pashtoStatus:'phase-translated-unverified', evidenceWeight:1, retryPolicy:'once',
      scoringMode:'auto', technicalFailureBehavior:'neutral' },

    { taskId:'task-aca-0001-t1', packRef:'listen-d18-aca-pack-01', itemId:'listen-d18-aca-0001', stageId:'listen-for-detail',
      level:'academic', taskType:'choose-main-idea',
      prompt:'What is the central finding discussed in this lecture excerpt?',
      options:['A) Students should read more textbooks.',
               'B) Knowing 95% of words is the minimum threshold for comfortable independent reading.',
               'C) Grammar is more important than vocabulary for comprehension.',
               'D) Long texts are always harder to understand than short texts.'],
      correctIndex:1, explanation:'The lecturer states that 95% word coverage is the minimum threshold for comfortable independent reading.',
      pashtoStatus:'phase-translated-unverified', evidenceWeight:2, retryPolicy:'once',
      scoringMode:'auto', technicalFailureBehavior:'neutral' },

    { taskId:'task-aca-0001-t2', packRef:'listen-d18-aca-pack-01', itemId:'listen-d18-aca-0001', stageId:'oral-follow-up',
      level:'academic', taskType:'short-oral-response',
      prompt:'In your own words, explain what happens when a student reads a text that is far above their vocabulary level.',
      options:[], correctIndex:-1,
      explanation:'Expected answer: comprehension breaks down; too many unknown words; frustration rather than skill improvement.',
      pashtoStatus:'phase-translated-unverified', evidenceWeight:2, retryPolicy:'manual-fallback',
      scoringMode:'teacher-rubric', technicalFailureBehavior:'manual-completion' },

    { taskId:'task-aca-0002-t1', packRef:'listen-d18-aca-pack-02', itemId:'listen-d18-aca-0002', stageId:'listen-for-detail',
      level:'academic', taskType:'choose-main-idea',
      prompt:'What does more recent research suggest about motivation?',
      options:['A) Integrative motivation is always stronger.',
               'B) Instrumental motivation does not work.',
               'C) Both types can be equally powerful and motivation changes over time.',
               'D) Teachers should not try to motivate students.'],
      correctIndex:2, explanation:'Recent studies challenge the earlier conclusion, suggesting both types are equally powerful and evolve over time.',
      pashtoStatus:'phase-translated-unverified', evidenceWeight:2, retryPolicy:'once',
      scoringMode:'auto', technicalFailureBehavior:'neutral' }
  ];

  // -----------------------------------------------------------------------
  // SECTION 7: CURATED PACK CATALOG (66 total: ST=8 BA=8 BG=10 EL=10 IN=10 AD=10 AC=10)
  // -----------------------------------------------------------------------
  var D18_PACKS = [];

  function _makeLegacyPack(id, level, theme, seq, itemIds) {
    return {
      packId:id, version:'1.0', phase:'I6H-D18', acceptedLevelId:level,
      pathwayIds:['child','teen','general-adult','job-professional','academic-preparation'],
      theme:theme, sequenceOrder:seq, itemIds:itemIds, contentOrigin:'legacy-canonical-reviewed',
      objectives:['Understand and repeat short English sentences at '+level+' level.',
                  'Practise listening for specific information.',
                  'Build confidence through repetition and shadowing.'],
      vocabularyTargets:['context-dependent'], grammarTargets:['context-dependent'],
      listeningSkills:['recognition','repetition','short-response'],
      supportMode:level==='starter'?'full':level==='basic'?'strong':'partial',
      speedProfile:level==='starter'?'slow':'normal',
      stages:STD_STAGES,
      estimatedAudioSeconds:itemIds.length*7,
      estimatedStageMinutes:{'first-listen-gist':4,'repeat-or-shadow':5,'oral-follow-up':3,'weak-item-recovery':3},
      estimatedFullPackMinutes:12,
      taskIds:[],
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'legacy-editorial-d18', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending',
      d16PackDisposition:'superseded-by-d18-pack'
    };
  }

  function _makeAuthoredPack(id, level, theme, seq, itemIds, stagesArr, extra) {
    extra = extra || {};
    return {
      packId:id, version:'1.0', phase:'I6H-D18', acceptedLevelId:level,
      pathwayIds:extra.pathwayIds||['teen','general-adult','job-professional'],
      theme:theme, sequenceOrder:seq, itemIds:itemIds, contentOrigin:'academy-authored-d18',
      objectives:extra.objectives||['Listen to connected English at '+level+' level.','Identify main ideas and details.'],
      vocabularyTargets:extra.vocabularyTargets||[],
      grammarTargets:extra.grammarTargets||[],
      discourseTargets:extra.discourseTargets||[],
      listeningSkills:extra.listeningSkills||['identify-main-idea','detail','note-taking'],
      supportMode:extra.supportMode||(level==='advanced'||level==='academic'?'minimal':'partial'),
      speedProfile:extra.speedProfile||(level==='advanced'||level==='academic'?'normal-academic':'normal'),
      stages:stagesArr,
      estimatedAudioSeconds:extra.estimatedAudioSeconds||80,
      estimatedStageMinutes:extra.estimatedStageMinutes||{'first-listen-gist':3,'listen-for-detail':5,'repeat-or-shadow':4,'oral-follow-up':5,'weak-item-recovery':3},
      estimatedFullPackMinutes:extra.estimatedFullPackMinutes||18,
      taskIds:extra.taskIds||[],
      officialCandidateEligible:true, officialCurriculumEligible:false, freePracticeEligible:true,
      provenance:'academy-authored', editorialStatus:'phase-reviewed', ownerApprovalStatus:'pending',
      d16PackDisposition:'superseded-by-d18-pack'
    };
  }

  // --- STARTER (8 packs, 5 items each) ---
  D18_PACKS.push(_makeLegacyPack('listen-d18-starter-greetings-01','starter','greetings',1,['listen-c-0001','listen-c-0002','listen-c-0003','listen-c-0004','listen-c-0005']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-starter-classroom-01','starter','education',2,['listen-c-0006','listen-c-0007','listen-c-0008','listen-c-0009','listen-c-0010']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-starter-numbers-time-01','starter','time',3,['listen-c-0011','listen-c-0012','listen-c-0013','listen-c-0014','listen-c-0015']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-starter-family-01','starter','family',4,['listen-c-0016','listen-c-0017','listen-c-0018','listen-c-0019','listen-c-0020']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-starter-daily-actions-01','starter','general-conversation',5,['listen-c-0021','listen-c-0022','listen-c-0023','listen-c-0024','listen-c-0025']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-starter-food-01','starter','food-and-drink',6,['listen-c-0026','listen-c-0027','listen-c-0028','listen-c-0029','listen-c-0030']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-starter-places-01','starter','places',7,['listen-c-0031','listen-c-0032','listen-c-0033','listen-c-0034','listen-c-0035']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-starter-requests-01','starter','communication',8,['listen-c-0036','listen-c-0037','listen-c-0038','listen-c-0039','listen-c-0040']));

  // --- BASIC (8 packs, 5 items each) ---
  D18_PACKS.push(_makeLegacyPack('listen-d18-basic-school-01','basic','education',1,['listen-c-0041','listen-c-0042','listen-c-0043','listen-c-0044','listen-c-0045']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-basic-family-01','basic','family',2,['listen-c-0046','listen-c-0047','listen-c-0048','listen-c-0049','listen-c-0050']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-basic-market-01','basic','shopping',3,['listen-c-0051','listen-c-0052','listen-c-0053','listen-c-0054','listen-c-0055']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-basic-health-01','basic','health',4,['listen-c-0056','listen-c-0057','listen-c-0058','listen-c-0059','listen-c-0060']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-basic-transport-01','basic','transport',5,['listen-c-0061','listen-c-0062','listen-c-0063','listen-c-0064','listen-c-0065']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-basic-time-01','basic','time',6,['listen-c-0066','listen-c-0067','listen-c-0068','listen-c-0069','listen-c-0070']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-basic-communication-01','basic','communication',7,['listen-c-0071','listen-c-0072','listen-c-0073','listen-c-0074','listen-c-0075']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-basic-work-01','basic','work',8,['listen-c-0076','listen-c-0077','listen-c-0078','listen-c-0079','listen-c-0080']));

  // --- BEGINNER (10 packs, 5 items each) ---
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-daily-01','beginner','general-conversation',1,['listen-c-0081','listen-c-0082','listen-c-0083','listen-c-0084','listen-c-0085']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-work-01','beginner','work',2,['listen-c-0086','listen-c-0087','listen-c-0088','listen-c-0089','listen-c-0090']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-health-01','beginner','health',3,['listen-c-0091','listen-c-0092','listen-c-0093','listen-c-0094','listen-c-0095']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-education-01','beginner','education',4,['listen-c-0096','listen-c-0097','listen-c-0098','listen-c-0099','listen-c-0100']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-shopping-01','beginner','shopping',5,['listen-c-0101','listen-c-0102','listen-c-0103','listen-c-0104','listen-c-0105']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-culture-01','beginner','culture',6,['listen-c-0106','listen-c-0107','listen-c-0108','listen-c-0109','listen-c-0110']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-communication-01','beginner','communication',7,['listen-c-0111','listen-c-0112','listen-c-0113','listen-c-0114','listen-c-0115']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-places-01','beginner','places',8,['listen-c-0116','listen-c-0117','listen-c-0118','listen-c-0119','listen-c-0120']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-language-01','beginner','language-learning',9,['listen-c-0121','listen-c-0122','listen-c-0123','listen-c-0124','listen-c-0125']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-beginner-social-01','beginner','general-conversation',10,['listen-c-0126','listen-c-0127','listen-c-0128','listen-c-0129','listen-c-0130']));

  // --- ELEMENTARY (10 packs, 6 items each) ---
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-daily-01','elementary','general-conversation',1,['listen-c-0131','listen-c-0132','listen-c-0133','listen-c-0134','listen-c-0135','listen-c-0136']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-work-01','elementary','work',2,['listen-c-0137','listen-c-0138','listen-c-0139','listen-c-0140','listen-c-0141','listen-c-0142']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-health-01','elementary','health',3,['listen-c-0143','listen-c-0144','listen-c-0145','listen-c-0146','listen-c-0147','listen-c-0148']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-education-01','elementary','education',4,['listen-c-0149','listen-c-0150','listen-c-0151','listen-c-0152','listen-c-0153','listen-c-0154']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-transport-01','elementary','transport',5,['listen-c-0155','listen-c-0156','listen-c-0157','listen-c-0158','listen-c-0159','listen-c-0160']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-culture-01','elementary','culture',6,['listen-c-0161','listen-c-0162','listen-c-0163','listen-c-0164','listen-c-0165','listen-c-0166']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-family-01','elementary','family',7,['listen-c-0167','listen-c-0168','listen-c-0169','listen-c-0170','listen-c-0171','listen-c-0172']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-language-01','elementary','language-learning',8,['listen-c-0173','listen-c-0174','listen-c-0175','listen-c-0176','listen-c-0177','listen-c-0178']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-social-01','elementary','general-conversation',9,['listen-c-0179','listen-c-0180','listen-c-0181','listen-c-0182','listen-c-0183','listen-c-0184']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-elementary-communication-01','elementary','communication',10,['listen-c-0185','listen-c-0186','listen-c-0187','listen-c-0188','listen-c-0189','listen-c-0190']));

  // --- INTERMEDIATE (10 packs, authored) ---
  D18_PACKS.push(_makeAuthoredPack('listen-d18-intermediate-classroom-01','intermediate','education',1,['listen-d18-int-0001','listen-d18-int-0002'],INT_STAGES,{estimatedFullPackMinutes:14,objectives:['Follow classroom dialogues.','Identify speaker intent.'],listeningSkills:['speaker-intent','formal-register']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-intermediate-health-01','intermediate','health',2,['listen-d18-int-0003'],INT_STAGES,{estimatedFullPackMinutes:15,objectives:['Understand a medical consultation.','Identify symptoms and advice.'],listeningSkills:['medical-listening','understanding-sequence']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-intermediate-plans-01','intermediate','general-conversation',3,['listen-d18-int-0004'],INT_STAGES,{estimatedFullPackMinutes:12,objectives:['Understand planning dialogues.','Identify future arrangements.'],listeningSkills:['understanding-plans','future-arrangements']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-intermediate-directions-01','intermediate','places',4,['listen-d18-int-0005'],INT_STAGES,{estimatedFullPackMinutes:12,objectives:['Follow spoken directions.','Understand sequential instructions.'],listeningSkills:['following-directions','sequencing']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-intermediate-work-01','intermediate','work',5,['listen-d18-int-0006','listen-d18-int-0007'],INT_STAGES,{estimatedFullPackMinutes:14,objectives:['Understand professional conversations.','Identify formal register.'],listeningSkills:['professional-listening','formal-language']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-intermediate-social-01','intermediate','general-conversation',6,['listen-d18-int-0008'],INT_STAGES,{estimatedFullPackMinutes:13,objectives:['Follow problem-solving dialogues.','Understand implicit suggestions.'],listeningSkills:['problem-solution','implicit-meaning']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-intermediate-announcement-01','intermediate','education',7,['listen-d18-int-0009'],INT_STAGES,{estimatedFullPackMinutes:12,objectives:['Understand spoken announcements.','Identify key facts.'],listeningSkills:['announcement-listening','key-facts']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-intermediate-restaurant-01','intermediate','food-and-drink',8,['listen-d18-int-0010'],INT_STAGES,{estimatedFullPackMinutes:13,objectives:['Follow a restaurant interaction.','Understand polite requests.'],listeningSkills:['situational-listening','politeness']}));
  D18_PACKS.push(_makeLegacyPack('listen-d18-intermediate-legacy-01','intermediate','general-conversation',9,['listen-c-0191','listen-c-0192','listen-c-0193','listen-c-0194','listen-c-0195','listen-c-0196','listen-c-0197','listen-c-0198']));
  D18_PACKS.push(_makeLegacyPack('listen-d18-intermediate-legacy-02','intermediate','work',10,['listen-c-0199','listen-c-0200','listen-c-0201','listen-c-0202','listen-c-0203','listen-c-0204','listen-c-0205','listen-c-0206']));

  // --- ADVANCED (10 packs, authored short-passages) ---
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-01','advanced','language-learning',1,['listen-d18-adv-0001'],ADV_STAGES,{estimatedFullPackMinutes:18,taskIds:['task-adv-0001-t1','task-adv-0001-t2'],objectives:['Understand a connected argument.','Identify main claim and evidence.','Take notes.'],listeningSkills:['main-claim','evidence-tracking','note-taking'],discourseTargets:['claim-support','contrast','exemplification']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-02','advanced','culture',2,['listen-d18-adv-0002'],ADV_STAGES,{estimatedFullPackMinutes:18,objectives:['Understand a comparison passage.','Identify both sides of argument.'],listeningSkills:['comparison','cause-effect','note-taking']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-03','advanced','culture',3,['listen-d18-adv-0003'],ADV_STAGES,{estimatedFullPackMinutes:18,objectives:['Understand cultural observation.','Recognise nuanced claim.'],listeningSkills:['cultural-nuance','main-idea']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-04','advanced','work',4,['listen-d18-adv-0004'],ADV_STAGES,{estimatedFullPackMinutes:18,objectives:['Follow advice-giving passage.','Identify sequential advice steps.'],listeningSkills:['advice-listening','note-taking']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-05','advanced','language-learning',5,['listen-d18-adv-0005'],ADV_STAGES,{estimatedFullPackMinutes:18,objectives:['Understand passage about accent variation.','Identify key recommendation.'],listeningSkills:['explanatory-text','recommendation']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-06','advanced','education',6,['listen-d18-adv-0006'],ADV_STAGES,{estimatedFullPackMinutes:18,objectives:['Follow technology-education passage.','Identify problem-solution structure.'],listeningSkills:['problem-solution','note-taking']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-07','advanced','language-learning',7,['listen-d18-adv-0007'],ADV_STAGES,{estimatedFullPackMinutes:18,objectives:['Understand speaking confidence passage.','Recognise implied message.'],listeningSkills:['implied-message','note-taking']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-08','advanced','work',8,['listen-d18-adv-0008'],ADV_STAGES,{estimatedFullPackMinutes:18,objectives:['Follow time-management passage.','Identify practical advice.'],listeningSkills:['advice-listening','note-taking']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-09','advanced','education',9,['listen-d18-adv-0009'],ADV_STAGES,{estimatedFullPackMinutes:18,objectives:['Understand passage about questioning.','Identify argument structure.'],listeningSkills:['argument-structure','recognising-evidence']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-adv-pack-10','advanced','work',10,['listen-d18-adv-0010'],ADV_STAGES,{estimatedFullPackMinutes:18,objectives:['Follow professional communication passage.','Distinguish main and supporting points.'],listeningSkills:['professional-listening','main-and-supporting']}));

  // --- ACADEMIC (10 packs, authored extended-passages) ---
  var ACA_STAGE_MINS = {'first-listen-gist':4,'listen-for-detail':6,'dictation-or-key-words':4,'oral-follow-up':6,'review-challenge':5,'weak-item-recovery':4};
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-01','academic','language-learning',1,['listen-d18-aca-0001'],ACA_STAGES,{estimatedFullPackMinutes:25,taskIds:['task-aca-0001-t1','task-aca-0001-t2'],estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Follow an academic lecture.','Take structured notes.','Summarise argument orally.'],listeningSkills:['academic-listening','note-taking','oral-summary'],discourseTargets:['thesis','evidence','implication','summary']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-02','academic','language-learning',2,['listen-d18-aca-0002'],ACA_STAGES,{estimatedFullPackMinutes:25,taskIds:['task-aca-0002-t1'],estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Compare two theories.','Identify stance shift.'],listeningSkills:['theory-comparison','stance-recognition']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-03','academic','education',3,['listen-d18-aca-0003'],ACA_STAGES,{estimatedFullPackMinutes:25,estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Follow lecture on multilingual teaching.','Identify concession and reframing.'],listeningSkills:['concession','reframing']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-04','academic','education',4,['listen-d18-aca-0004'],ACA_STAGES,{estimatedFullPackMinutes:25,estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Understand critical thinking lecture.','Identify evaluative criteria.'],listeningSkills:['critical-thinking','criteria-identification']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-05','academic','language-learning',5,['listen-d18-aca-0005'],ACA_STAGES,{estimatedFullPackMinutes:25,estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Follow historical lecture on academic English.','Identify key developments.'],listeningSkills:['historical-narrative','key-development']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-06','academic','language-learning',6,['listen-d18-aca-0006'],ACA_STAGES,{estimatedFullPackMinutes:25,estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Follow lecture on listening strategies.','Identify recommended strategies.'],listeningSkills:['meta-listening','strategy-identification']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-07','academic','language-learning',7,['listen-d18-aca-0007'],ACA_STAGES,{estimatedFullPackMinutes:25,estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Follow globalisation lecture.','Identify multiple perspectives.'],listeningSkills:['multiple-perspectives','note-taking']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-08','academic','education',8,['listen-d18-aca-0008'],ACA_STAGES,{estimatedFullPackMinutes:25,estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Follow lecture on academic writing purpose.','Identify reframing argument.'],listeningSkills:['reframing','critical-reflection']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-09','academic','education',9,['listen-d18-aca-0009'],ACA_STAGES,{estimatedFullPackMinutes:25,estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Compare research methods.','Identify key distinctions and synthesis.'],listeningSkills:['comparison','critical-question']}));
  D18_PACKS.push(_makeAuthoredPack('listen-d18-aca-pack-10','academic','work',10,['listen-d18-aca-0010'],ACA_STAGES,{estimatedFullPackMinutes:25,estimatedStageMinutes:ACA_STAGE_MINS,objectives:['Follow professional ethics lecture.','Identify ethical principles.'],listeningSkills:['ethical-reasoning','note-taking']}));


  // -----------------------------------------------------------------------
  // SECTION 8: D16 PACK MIGRATION MAP
  // -----------------------------------------------------------------------
  var D16_PACK_MIGRATION_MAP = {
    'listen-pack-starter-01':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-starter-greetings-01',equivalence:'partial',progressTransfer:false,note:'Different item selection; D18 pack editorially curated.'},
    'listen-pack-starter-02':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-starter-classroom-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-starter-03':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-starter-numbers-time-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-starter-04':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-starter-family-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-starter-05':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-starter-daily-actions-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-starter-06':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-starter-food-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-starter-07':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-starter-places-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-starter-08':{disposition:'retired-invalid-pack',d18Replacement:'listen-d18-starter-requests-01',equivalence:'none',progressTransfer:false,note:'D16 tail had 3 items (below 4-item minimum). Retired; D18 pack created.'},
    'listen-pack-basic-01':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-basic-school-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-basic-02':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-basic-family-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-basic-03':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-basic-market-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-basic-04':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-basic-health-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-basic-05':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-basic-transport-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-basic-06':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-basic-time-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-basic-07':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-basic-communication-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-basic-08':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-basic-work-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-basic-09':{disposition:'retained-as-free-practice-draft',d18Replacement:null,equivalence:'none',progressTransfer:false,note:'Retained as Free Practice draft only.'},
    'listen-pack-basic-10':{disposition:'retired-invalid-pack',d18Replacement:null,equivalence:'none',progressTransfer:false,note:'D16 tail had 4 items (below 5-item minimum). Retired.'},
    'listen-pack-beginner-01':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-beginner-daily-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-beginner-02':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-beginner-work-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-beginner-03':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-beginner-health-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-beginner-04':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-beginner-education-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-beginner-05':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-beginner-shopping-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-beginner-06':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-beginner-culture-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-beginner-07':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-beginner-communication-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-beginner-08':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-beginner-places-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-beginner-09':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-beginner-language-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-elementary-01':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-elementary-daily-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-elementary-02':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-elementary-work-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-elementary-03':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-elementary-health-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-elementary-04':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-elementary-education-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-elementary-05':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-elementary-transport-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-elementary-06':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-elementary-culture-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-elementary-07':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-elementary-family-01',equivalence:'partial',progressTransfer:false,note:'Different item selection.'},
    'listen-pack-intermediate-01':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-intermediate-classroom-01',equivalence:'none',progressTransfer:false,note:'D16 intermediate used misclassified simple sentences. D18 uses authored dialogues.'},
    'listen-pack-intermediate-02':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-intermediate-health-01',equivalence:'none',progressTransfer:false,note:'See above.'},
    'listen-pack-intermediate-03':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-intermediate-plans-01',equivalence:'none',progressTransfer:false,note:'See above.'},
    'listen-pack-intermediate-04':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-intermediate-directions-01',equivalence:'none',progressTransfer:false,note:'See above.'},
    'listen-pack-intermediate-05':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-intermediate-work-01',equivalence:'none',progressTransfer:false,note:'See above.'},
    'listen-pack-advanced-01':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-adv-pack-01',equivalence:'none',progressTransfer:false,note:'D16 advanced used misclassified simple sentences. D18 advanced uses authored 100-170 word passages.'},
    'listen-pack-advanced-02':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-adv-pack-02',equivalence:'none',progressTransfer:false,note:'See above.'},
    'listen-pack-advanced-03':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-adv-pack-03',equivalence:'none',progressTransfer:false,note:'See above.'},
    'listen-pack-advanced-04':{disposition:'retired-invalid-pack',d18Replacement:'listen-d18-adv-pack-04',equivalence:'none',progressTransfer:false,note:'D16 tail had 1 item (below 8-item minimum). Retired; D18 advanced pack created.'},
    'listen-pack-academic-01':{disposition:'superseded-by-d18-pack',d18Replacement:'listen-d18-aca-pack-01',equivalence:'none',progressTransfer:false,note:'D16 academic used misclassified simple sentences. D18 academic uses authored 140-220 word extended passages.'},
    'listen-pack-academic-02':{disposition:'retired-invalid-pack',d18Replacement:'listen-d18-aca-pack-02',equivalence:'none',progressTransfer:false,note:'D16 tail had 7 items (below 8-item minimum). Retired; D18 academic pack created.'}
  };

  // -----------------------------------------------------------------------
  // SECTION 9: D18 RESOLVER
  // -----------------------------------------------------------------------
  function resolveD18Pack(opts) {
    opts = opts || {};
    var routeMode = opts.routeMode || 'candidate-preview';
    var level = opts.acceptedLevelId;
    var purpose = opts.purpose || 'new';
    var reqPackId = opts.packId || null;
    var getProgress = opts.getProgress;
    var studentId = opts.studentId;

    // 1. Official route guard
    if (routeMode === 'official') {
      var official = D18_PACKS.filter(function(p){return p.acceptedLevelId===level && p.officialCurriculumEligible===true;});
      if (!official.length) return {ok:false,reason:'no-owner-approved-pack-for-level',acceptedLevelId:level,routeMode:'official'};
    }

    // 2. Explicit pack
    if (reqPackId) {
      var ep = D18_PACKS.find(function(p){return p.packId===reqPackId;});
      if (!ep) return {ok:false,reason:'pack-id-not-found',packId:reqPackId};
      if (!_routeOk(ep,routeMode)) return {ok:false,reason:'pack-not-eligible-for-route',packId:reqPackId,routeMode:routeMode};
      return {ok:true,pack:ep,routeMode:routeMode,items:_items(ep)};
    }

    // 3. Level-filtered packs sorted by sequenceOrder
    if (!level) return {ok:false,reason:'no-level-provided'};
    var eligible = D18_PACKS.filter(function(p){return p.acceptedLevelId===level && _routeOk(p,routeMode);})
                            .sort(function(a,b){return (a.sequenceOrder||0)-(b.sequenceOrder||0);});
    if (!eligible.length) return {ok:false,reason:'no-eligible-pack-for-level',acceptedLevelId:level,routeMode:routeMode};

    // 4. Continue incomplete
    if ((purpose==='continue'||purpose==='new') && getProgress && studentId) {
      for (var i=0;i<eligible.length;i++){
        var pr=getProgress(studentId,eligible[i].packId);
        if (pr && !pr.packCompleted && pr.activeStageId) return {ok:true,pack:eligible[i],routeMode:routeMode,purpose:'continue',items:_items(eligible[i])};
      }
    }

    // 5. Weak recovery
    if (purpose==='weak-recovery' && getProgress && studentId) {
      for (var j=0;j<eligible.length;j++){
        var wp=getProgress(studentId,eligible[j].packId);
        if (wp && wp.weakItems && wp.weakItems.length>0) return {ok:true,pack:eligible[j],routeMode:routeMode,purpose:'weak-recovery',items:_items(eligible[j])};
      }
    }

    // 6. First incomplete by sequence
    if (getProgress && studentId) {
      for (var k=0;k<eligible.length;k++){
        var kp=getProgress(studentId,eligible[k].packId);
        if (!kp||!kp.packCompleted) return {ok:true,pack:eligible[k],routeMode:routeMode,purpose:'new',items:_items(eligible[k])};
      }
    }

    // 7. First eligible
    return {ok:true,pack:eligible[0],routeMode:routeMode,purpose:'new',items:_items(eligible[0])};
  }

  function _routeOk(pack,mode){
    if (mode==='official') return pack.officialCurriculumEligible===true;
    if (mode==='candidate-preview') return pack.officialCandidateEligible===true;
    if (mode==='free-practice') return pack.freePracticeEligible===true;
    return false;
  }

  function _items(pack){
    var all = D18_INTERMEDIATE_ITEMS.concat(D18_ADVANCED_ITEMS).concat(D18_ACADEMIC_ITEMS);
    return pack.itemIds.map(function(id){
      var a=all.find(function(x){return x.contentId===id;});
      return a ? a : {contentId:id,contentOrigin:'legacy-canonical',_requiresLegacyResolution:true};
    });
  }

  // -----------------------------------------------------------------------
  // SECTION 10: PROGRESS SCHEMA V2
  // -----------------------------------------------------------------------
  var PROGRESS_VERSION = '2.0';
  var MASTERY_THRESHOLD = 70;

  function makeProgress(studentId,packId,packVersion,routeMode){
    return {
      schemaVersion:PROGRESS_VERSION, studentId:studentId, routeMode:routeMode||'candidate-preview',
      packId:packId, packVersion:packVersion||'1.0',
      activeStageId:null, activeItemId:null, currentPosition:0,
      stageCompletionMap:{}, packCompleted:false,
      attemptRecords:{}, itemBestScore:{}, itemLastScore:{},
      masteryStatus:{}, weakItems:[], weakItemRetryCount:{},
      technicalFailureCount:0, academicAttemptCount:0,
      startedAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
      completedAt:null, reviewDue:false,
      d16MigrationNote:'D18 progress schema v2; D16 progress preserved under original key'
    };
  }

  function updateWeak(progress,itemId,score,isTechnical){
    if (isTechnical){ progress.technicalFailureCount=(progress.technicalFailureCount||0)+1; return progress; }
    progress.academicAttemptCount=(progress.academicAttemptCount||0)+1;
    progress.itemLastScore[itemId]=score;
    if (!progress.itemBestScore[itemId]||score>progress.itemBestScore[itemId]) progress.itemBestScore[itemId]=score;
    if (score<MASTERY_THRESHOLD){
      if (progress.weakItems.indexOf(itemId)===-1) progress.weakItems.push(itemId);
      progress.masteryStatus[itemId]=false;
    } else {
      progress.weakItems=progress.weakItems.filter(function(id){return id!==itemId;});
      progress.masteryStatus[itemId]=true;
    }
    progress.updatedAt=new Date().toISOString();
    return progress;
  }

  // -----------------------------------------------------------------------
  // SECTION 11: REGISTRATION AND PUBLIC API
  // -----------------------------------------------------------------------
  function _register(){
    if (typeof window==='undefined'||!window.ZirakCurriculumContent) {
      if (typeof document!=='undefined') document.addEventListener('DOMContentLoaded',_register);
      return;
    }
    if (typeof window.ZirakCurriculumContent.registerListeningCurriculumD18==='function'){
      var normalizedRegistration = window.ZirakCurriculumContent.registerListeningCurriculumD18({
        version:D18_VERSION, repairVersion:'I6H-D18A', date:D18_DATE, legacyChecksumContentJs:CONTENT_JS_SHA256,
        editorialSummary:EDITORIAL_SUMMARY, packs:D18_PACKS,
        intermediateItems:D18_INTERMEDIATE_ITEMS, advancedItems:D18_ADVANCED_ITEMS,
        academicItems:D18_ACADEMIC_ITEMS, tasks:D18_TASKS,
        d16MigrationMap:D16_PACK_MIGRATION_MAP, resolver:resolveD18Pack,
        progressSchema:{version:PROGRESS_VERSION,make:makeProgress,updateWeak:updateWeak}
      });
      if (normalizedRegistration && window.ZirakListeningCurriculumD18) {
        window.ZirakListeningCurriculumD18.repairVersion = 'I6H-D18A';
        window.ZirakListeningCurriculumD18.packs = normalizedRegistration.packs;
        window.ZirakListeningCurriculumD18.intermediateItems = normalizedRegistration.intermediateItems;
        window.ZirakListeningCurriculumD18.advancedItems = normalizedRegistration.advancedItems;
        window.ZirakListeningCurriculumD18.academicItems = normalizedRegistration.academicItems;
        window.ZirakListeningCurriculumD18.tasks = normalizedRegistration.tasks;
        window.ZirakListeningCurriculumD18.editorialDecisions = normalizedRegistration.editorialDecisions;
        window.ZirakListeningCurriculumD18.taskGovernanceModel = normalizedRegistration.taskGovernanceModel;
      }
    } else {
      console.warn('[D18] registerListeningCurriculumD18 not found on ZirakCurriculumContent');
    }
  }

  // Public API (also used by test harness)
  window.ZirakListeningCurriculumD18 = {
    version:D18_VERSION, repairVersion:'I6H-D18A', date:D18_DATE, CONTENT_JS_SHA256:CONTENT_JS_SHA256,
    packs:D18_PACKS,
    intermediateItems:D18_INTERMEDIATE_ITEMS,
    advancedItems:D18_ADVANCED_ITEMS,
    academicItems:D18_ACADEMIC_ITEMS,
    tasks:D18_TASKS,
    d16MigrationMap:D16_PACK_MIGRATION_MAP,
    editorialSummary:EDITORIAL_SUMMARY,
    resolveD18Pack:resolveD18Pack,
    progressSchema:{version:PROGRESS_VERSION,make:makeProgress,updateWeak:updateWeak}
  };

  _register();

})();
