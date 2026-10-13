// ============================================================
// Zirak English v1.16I — Interview Content Pack 1
// interview-content-pack1.js
// 70 track metadata + 11 sample lessons (incl. 1 Level 10 sample)
// English is the main language. Pashto and Dari are support.
// ============================================================

'use strict';

window.zirakInterviewTracks = [

  // ── GROUP 1: BEGINNER PERSONAL ───────────────────────────
  {
    id: 'iw_personal_intro',
    group: 'beginner_personal',
    level_min: 1, level_max: 1,
    title_en: 'Personal Introduction',
    title_ps: 'شخصي معرفي',
    title_dari: '',
    description_en: 'Introduce yourself simply: name, age, family, country.',
    description_ps: 'خپل ځان د ساده ډول معرفي کړه: نوم، عمر، کورنۍ، هیواد.',
    description_dari: '',
    icon: '👤', difficulty: 1, sector: 'general',
    job_keywords: ['introduction', 'name', 'self'],
    status: 'sample'
  },
  {
    id: 'iw_personal_confidence',
    group: 'beginner_personal',
    level_min: 1, level_max: 2,
    title_en: 'Basic Confidence Questions',
    title_ps: 'بنسټیزې باور پوښتنې',
    title_dari: '',
    description_en: 'Answer simple questions with confidence: What do you like? What is your hobby?',
    description_ps: 'له اطمینان سره ساده پوښتنو ته ځواب ورکړه.',
    description_dari: '',
    icon: '😊', difficulty: 1, sector: 'general',
    job_keywords: ['hobby', 'like', 'interest'],
    status: 'sample'
  },
  {
    id: 'iw_personal_family',
    group: 'beginner_personal',
    level_min: 1, level_max: 1,
    title_en: 'Family and Home',
    title_ps: 'کورنۍ او کور',
    title_dari: '',
    description_en: 'Talk about your family, brothers, sisters, and home.',
    description_ps: 'د خپلې کورنۍ، وروڼو، خویندو او کور په اړه خبرې وکړه.',
    description_dari: '',
    icon: '🏠', difficulty: 1, sector: 'general',
    job_keywords: ['family', 'home', 'sister', 'brother'],
    status: 'planned'
  },

  // ── GROUP 2: SCHOOL AND STUDENT ─────────────────────────
  {
    id: 'iw_school_general',
    group: 'school_student',
    level_min: 2, level_max: 2,
    title_en: 'School and Student Interview',
    title_ps: 'د ښوونځي او زده کوونکي مرکه',
    title_dari: '',
    description_en: 'Talk about your school, class, subjects, teacher, and study routine.',
    description_ps: 'د خپل ښوونځي، ټولګي، مضامینو، ښوونکي او لوستل د معمول اړه خبرې وکړه.',
    description_dari: '',
    icon: '🎒', difficulty: 2, sector: 'education',
    job_keywords: ['school', 'student', 'class', 'teacher', 'study'],
    status: 'sample'
  },
  {
    id: 'iw_school_favourite_subject',
    group: 'school_student',
    level_min: 2, level_max: 2,
    title_en: 'Favourite Subject',
    title_ps: 'خوښه مضمون',
    title_dari: '',
    description_en: 'Explain which subject you like and why.',
    description_ps: 'توضیح کړه چې کوم مضمون خوښوې او ولې.',
    description_dari: '',
    icon: '📚', difficulty: 2, sector: 'education',
    job_keywords: ['subject', 'maths', 'english', 'favourite'],
    status: 'planned'
  },
  {
    id: 'iw_school_goals',
    group: 'school_student',
    level_min: 2, level_max: 3,
    title_en: 'Student Goals',
    title_ps: 'د زده کوونکي اهداف',
    title_dari: '',
    description_en: 'What are your goals as a student? What do you want to achieve?',
    description_ps: 'د زده کوونکي حیثیته ستا اهداف کوم دي؟',
    description_dari: '',
    icon: '🎯', difficulty: 2, sector: 'education',
    job_keywords: ['goal', 'achieve', 'future', 'plan'],
    status: 'planned'
  },

  // ── GROUP 3: DAILY LIFE AND PHONE ────────────────────────
  {
    id: 'iw_phone_basic',
    group: 'daily_phone',
    level_min: 3, level_max: 3,
    title_en: 'Basic Phone Interview',
    title_ps: 'بنسټیز تیلیفوني مرکه',
    title_dari: '',
    description_en: 'Practice a simple phone interview: greet, answer questions clearly, end politely.',
    description_ps: 'د ساده تیلیفوني مرکې تمرین وکړه.',
    description_dari: '',
    icon: '📞', difficulty: 3, sector: 'general',
    job_keywords: ['phone', 'call', 'interview', 'speak'],
    status: 'sample'
  },
  {
    id: 'iw_daily_routine',
    group: 'daily_phone',
    level_min: 3, level_max: 3,
    title_en: 'Daily Routine Interview',
    title_ps: 'د ورځنۍ معمول مرکه',
    title_dari: '',
    description_en: 'Describe your daily routine — morning, afternoon, evening activities.',
    description_ps: 'خپل ورځنی معمول توضیح کړه.',
    description_dari: '',
    icon: '🌅', difficulty: 3, sector: 'general',
    job_keywords: ['daily', 'routine', 'morning', 'evening'],
    status: 'planned'
  },
  {
    id: 'iw_hobbies',
    group: 'daily_phone',
    level_min: 3, level_max: 3,
    title_en: 'Hobbies and Interests',
    title_ps: 'لوبې او لیوالتیاوې',
    title_dari: '',
    description_en: 'Talk about your hobbies and free-time activities.',
    description_ps: 'د خپلو لوبو او وخت تیرولو فعالیتونو اړه خبرې وکړه.',
    description_dari: '',
    icon: '🎨', difficulty: 3, sector: 'general',
    job_keywords: ['hobby', 'sport', 'read', 'free time'],
    status: 'planned'
  },

  // ── GROUP 4: FIRST JOB AND WORKPLACE ─────────────────────
  {
    id: 'iw_firstjob_general',
    group: 'first_job',
    level_min: 4, level_max: 4,
    title_en: 'First Job Interview',
    title_ps: 'د لومړي دندې مرکه',
    title_dari: '',
    description_en: 'Practice basic job interview questions for your first job.',
    description_ps: 'د خپلې لومړۍ دندې لپاره بنسټیز د دندې د مرکې پوښتنو تمرین وکړه.',
    description_dari: '',
    icon: '💼', difficulty: 4, sector: 'general',
    job_keywords: ['first job', 'work', 'employee', 'interview'],
    status: 'sample'
  },
  {
    id: 'iw_workplace_vocab',
    group: 'first_job',
    level_min: 4, level_max: 4,
    title_en: 'Basic Workplace Vocabulary',
    title_ps: 'بنسټیز د کاری ځای الفاظ',
    title_dari: '',
    description_en: 'Learn and use basic workplace vocabulary in interview answers.',
    description_ps: 'د مرکې ځوابونو کې بنسټیز د کاری ځای الفاظ زده کړه او وکاروه.',
    description_dari: '',
    icon: '🗂️', difficulty: 4, sector: 'general',
    job_keywords: ['workplace', 'office', 'colleague', 'task'],
    status: 'planned'
  },
  {
    id: 'iw_why_hire',
    group: 'first_job',
    level_min: 4, level_max: 5,
    title_en: 'Why Should We Hire You?',
    title_ps: 'موږ ولې تاسو وکرئ؟',
    title_dari: '',
    description_en: 'Confidently explain why you are the right person for the job.',
    description_ps: 'له اطمینان سره توضیح کړه چې ولې ته د دندې لپاره سم شخص یې.',
    description_dari: '',
    icon: '⭐', difficulty: 4, sector: 'general',
    job_keywords: ['strength', 'skill', 'reason', 'hire'],
    status: 'planned'
  },

  // ── GROUP 5: KANDAHAR NGO / UN CAREER ────────────────────
  {
    id: 'iw_kandahar_ngo_general',
    group: 'kandahar_ngo_un',
    level_min: 5, level_max: 6,
    title_en: 'Kandahar NGO General Interview',
    title_ps: 'د کندهار د NGO عمومي مرکه',
    title_dari: '',
    description_en: 'General NGO interview practice for Kandahar-based humanitarian roles.',
    description_ps: 'د کندهار د بشردوستانه رولونو لپاره عمومي NGO د مرکې تمرین.',
    description_dari: '',
    icon: '🌍', difficulty: 5, sector: 'ngo',
    job_keywords: ['NGO', 'humanitarian', 'Kandahar', 'field'],
    status: 'sample'
  },
  {
    id: 'iw_un_agency',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'UN Agency Interview',
    title_ps: 'د ملګرو ملتونو آژانس مرکه',
    title_dari: '',
    description_en: 'Interview practice for United Nations agency positions.',
    description_ps: 'د ملګرو ملتونو آژانس موقعیتونو لپاره د مرکې تمرین.',
    description_dari: '',
    icon: '🏛️', difficulty: 7, sector: 'un',
    job_keywords: ['UN', 'United Nations', 'agency', 'international'],
    status: 'planned'
  },
  {
    id: 'iw_unicef',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'UNICEF-style Interview',
    title_ps: 'د UNICEF ډول مرکه',
    title_dari: '',
    description_en: 'Practice for child-protection and education roles in UNICEF-style organizations.',
    description_ps: 'د UNICEF ډول سازمانونو کې د ماشومانو د ساتنې او زده کړې رولونو لپاره تمرین.',
    description_dari: '',
    icon: '🧒', difficulty: 7, sector: 'un',
    job_keywords: ['UNICEF', 'child', 'education', 'protection'],
    status: 'planned'
  },
  {
    id: 'iw_wfp',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'WFP / Food Assistance Interview',
    title_ps: 'د WFP / خوراکي مرستې مرکه',
    title_dari: '',
    description_en: 'Interview practice for World Food Programme food assistance roles.',
    description_ps: 'د نړیوال خوراکي پروګرام د خوراکي مرستې رولونو لپاره د مرکې تمرین.',
    description_dari: '',
    icon: '🌾', difficulty: 7, sector: 'un',
    job_keywords: ['WFP', 'food', 'nutrition', 'assistance'],
    status: 'planned'
  },
  {
    id: 'iw_unfpa',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'UNFPA / Health Programme Interview',
    title_ps: 'د UNFPA / روغتیا پروګرام مرکه',
    title_dari: '',
    description_en: 'Interview practice for health and population programme roles.',
    description_ps: 'د روغتیا او نفوس د پروګرام رولونو لپاره د مرکې تمرین.',
    description_dari: '',
    icon: '🏥', difficulty: 7, sector: 'health',
    job_keywords: ['UNFPA', 'health', 'population', 'programme'],
    status: 'planned'
  },
  {
    id: 'iw_un_women',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'UN Women / Protection Interview',
    title_ps: 'د ملګرو ملتونو ښځو / ساتنې مرکه',
    title_dari: '',
    description_en: 'Interview for gender equality and protection sector roles.',
    description_ps: 'د جنسي مساوات او د ساتنې سکتور رولونو لپاره مرکه.',
    description_dari: '',
    icon: '♀️', difficulty: 7, sector: 'protection',
    job_keywords: ['women', 'gender', 'protection', 'equality'],
    status: 'planned'
  },
  {
    id: 'iw_ocha',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'OCHA / Humanitarian Affairs Interview',
    title_ps: 'د OCHA / بشردوستانه چارو مرکه',
    title_dari: '',
    description_en: 'Interview for humanitarian coordination and emergency response roles.',
    description_ps: 'د بشردوستانه همغږۍ او د بیړي غبرګون رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🚨', difficulty: 7, sector: 'humanitarian',
    job_keywords: ['OCHA', 'coordination', 'emergency', 'humanitarian'],
    status: 'planned'
  },
  {
    id: 'iw_monitoring_evaluation',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Monitoring and Evaluation Interview',
    title_ps: 'د څارنې او ارزیابۍ مرکه',
    title_dari: '',
    description_en: 'Interview for M&E officer and assistant roles.',
    description_ps: 'د M&E افسر او مرستیالو رولونو لپاره مرکه.',
    description_dari: '',
    icon: '📊', difficulty: 7, sector: 'ngo',
    job_keywords: ['M&E', 'monitoring', 'evaluation', 'data'],
    status: 'planned'
  },
  {
    id: 'iw_project_officer',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Project Officer Interview',
    title_ps: 'د پروژې افسر مرکه',
    title_dari: '',
    description_en: 'Interview for project officer positions in NGO/UN organizations.',
    description_ps: 'د NGO/UN سازمانونو کې د پروژې د افسر موقعیتونو لپاره مرکه.',
    description_dari: '',
    icon: '📋', difficulty: 7, sector: 'ngo',
    job_keywords: ['project officer', 'planning', 'coordination', 'reporting'],
    status: 'planned'
  },
  {
    id: 'iw_programme_assistant',
    group: 'kandahar_ngo_un',
    level_min: 6, level_max: 7,
    title_en: 'Programme Assistant Interview',
    title_ps: 'د پروګرام مرستیال مرکه',
    title_dari: '',
    description_en: 'Interview for programme assistant roles supporting project activities.',
    description_ps: 'د پروګرام مرستیالو رولونو لپاره مرکه چې د پروژې فعالیتونه ملاتړ کوي.',
    description_dari: '',
    icon: '🤝', difficulty: 6, sector: 'ngo',
    job_keywords: ['programme assistant', 'support', 'admin', 'project'],
    status: 'planned'
  },
  {
    id: 'iw_admin_assistant',
    group: 'kandahar_ngo_un',
    level_min: 5, level_max: 6,
    title_en: 'Admin Assistant Interview',
    title_ps: 'د اداري مرستیال مرکه',
    title_dari: '',
    description_en: 'Interview for administrative assistant positions in offices and organizations.',
    description_ps: 'د دفترونو او سازمانونو کې د اداري مرستیال موقعیتونو لپاره مرکه.',
    description_dari: '',
    icon: '🗂️', difficulty: 5, sector: 'admin',
    job_keywords: ['admin', 'assistant', 'office', 'filing'],
    status: 'planned'
  },
  {
    id: 'iw_finance_assistant',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Finance Assistant Interview',
    title_ps: 'د مالیې مرستیال مرکه',
    title_dari: '',
    description_en: 'Interview for finance assistant and accounting support roles.',
    description_ps: 'د مالي مرستیال او د محاسبې ملاتړ رولونو لپاره مرکه.',
    description_dari: '',
    icon: '💰', difficulty: 7, sector: 'finance',
    job_keywords: ['finance', 'accounting', 'budget', 'payments'],
    status: 'planned'
  },
  {
    id: 'iw_procurement',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Procurement Interview',
    title_ps: 'د تدارکاتو مرکه',
    title_dari: '',
    description_en: 'Interview for procurement officer and supply purchasing roles.',
    description_ps: 'د تدارکاتو افسر او د اورولو رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🛒', difficulty: 7, sector: 'logistics',
    job_keywords: ['procurement', 'purchasing', 'supply', 'vendor'],
    status: 'planned'
  },
  {
    id: 'iw_logistics',
    group: 'kandahar_ngo_un',
    level_min: 6, level_max: 7,
    title_en: 'Logistics Interview',
    title_ps: 'د لوژستیک مرکه',
    title_dari: '',
    description_en: 'Interview for logistics coordinator and warehouse management roles.',
    description_ps: 'د لوژستیک همغږي کوونکي او د ذخیره‌خانې مدیریت رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🚚', difficulty: 6, sector: 'logistics',
    job_keywords: ['logistics', 'warehouse', 'transport', 'delivery'],
    status: 'planned'
  },
  {
    id: 'iw_supply_chain',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Supply Chain Interview',
    title_ps: 'د سپلای چین مرکه',
    title_dari: '',
    description_en: 'Interview for supply chain management roles in humanitarian organizations.',
    description_ps: 'د بشردوستانه سازمانونو کې د سپلای چین مدیریت رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🔗', difficulty: 7, sector: 'logistics',
    job_keywords: ['supply chain', 'management', 'distribution', 'procurement'],
    status: 'planned'
  },
  {
    id: 'iw_hr_assistant',
    group: 'kandahar_ngo_un',
    level_min: 6, level_max: 7,
    title_en: 'HR Assistant Interview',
    title_ps: 'د بشري سرچینو مرستیال مرکه',
    title_dari: '',
    description_en: 'Interview for human resources assistant and recruitment support roles.',
    description_ps: 'د بشري سرچینو مرستیال او د کارمند موندلو ملاتړ رولونو لپاره مرکه.',
    description_dari: '',
    icon: '👥', difficulty: 6, sector: 'hr',
    job_keywords: ['HR', 'human resources', 'recruitment', 'staff'],
    status: 'planned'
  },
  {
    id: 'iw_data_reporting',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Data / Reporting Officer Interview',
    title_ps: 'د ډاټا / راپور افسر مرکه',
    title_dari: '',
    description_en: 'Interview for data collection, analysis, and reporting roles.',
    description_ps: 'د ډاټا راټولولو، تحلیل، او راپور ورکولو رولونو لپاره مرکه.',
    description_dari: '',
    icon: '📈', difficulty: 7, sector: 'data',
    job_keywords: ['data', 'reporting', 'analysis', 'database'],
    status: 'planned'
  },
  {
    id: 'iw_hmis',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'HMIS Officer Interview',
    title_ps: 'د HMIS افسر مرکه',
    title_dari: '',
    description_en: 'Interview for health management information system officer roles.',
    description_ps: 'د روغتیا د مدیریت د معلوماتو سیستم افسر رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🏥', difficulty: 7, sector: 'health',
    job_keywords: ['HMIS', 'health', 'information system', 'data'],
    status: 'planned'
  },
  {
    id: 'iw_epi_officer',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'EPI Officer Interview',
    title_ps: 'د EPI افسر مرکه',
    title_dari: '',
    description_en: 'Interview for Expanded Programme on Immunization officer roles.',
    description_ps: 'د پراخ د وکسین پروګرام افسر رولونو لپاره مرکه.',
    description_dari: '',
    icon: '💉', difficulty: 7, sector: 'health',
    job_keywords: ['EPI', 'immunization', 'vaccine', 'health'],
    status: 'planned'
  },
  {
    id: 'iw_nutrition',
    group: 'kandahar_ngo_un',
    level_min: 6, level_max: 7,
    title_en: 'Nutrition Officer Interview',
    title_ps: 'د تغذیې افسر مرکه',
    title_dari: '',
    description_en: 'Interview for nutrition programme and assessment roles.',
    description_ps: 'د تغذیې پروګرام او ارزیابۍ رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🥗', difficulty: 6, sector: 'health',
    job_keywords: ['nutrition', 'assessment', 'health', 'food'],
    status: 'planned'
  },
  {
    id: 'iw_hygiene_promoter',
    group: 'kandahar_ngo_un',
    level_min: 5, level_max: 6,
    title_en: 'Hygiene Promoter Interview',
    title_ps: 'د صحت ساتنې پروموتر مرکه',
    title_dari: '',
    description_en: 'Interview for hygiene promotion and community education roles.',
    description_ps: 'د صحت ساتنې پروموشن او د ټولنې د زده کړې رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🧼', difficulty: 5, sector: 'health',
    job_keywords: ['hygiene', 'promotion', 'community', 'WASH'],
    status: 'sample'
  },
  {
    id: 'iw_agriculture_trainer',
    group: 'kandahar_ngo_un',
    level_min: 6, level_max: 7,
    title_en: 'Agriculture Trainer Interview',
    title_ps: 'د کرنې روزنکي مرکه',
    title_dari: '',
    description_en: 'Interview for agriculture extension and training roles.',
    description_ps: 'د کرنې پراخولو او روزنې رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🌱', difficulty: 6, sector: 'agriculture',
    job_keywords: ['agriculture', 'farming', 'trainer', 'extension'],
    status: 'planned'
  },
  {
    id: 'iw_community_mobilizer',
    group: 'kandahar_ngo_un',
    level_min: 5, level_max: 6,
    title_en: 'Community Mobilizer Interview',
    title_ps: 'د ټولنې متحرک کوونکي مرکه',
    title_dari: '',
    description_en: 'Interview for community mobilizer and outreach roles in NGOs.',
    description_ps: 'د NGOsکې د ټولنې متحرک کوونکي او خارجي رولونو لپاره مرکه.',
    description_dari: '',
    icon: '📢', difficulty: 5, sector: 'community',
    job_keywords: ['community', 'mobilizer', 'outreach', 'engagement'],
    status: 'sample'
  },
  {
    id: 'iw_field_officer',
    group: 'kandahar_ngo_un',
    level_min: 6, level_max: 7,
    title_en: 'Field Officer Interview',
    title_ps: 'د ډګر افسر مرکه',
    title_dari: '',
    description_en: 'Interview for field officer and field monitoring roles.',
    description_ps: 'د ډګر افسر او د ډګر د نظارت رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🔭', difficulty: 6, sector: 'ngo',
    job_keywords: ['field officer', 'monitoring', 'survey', 'community'],
    status: 'planned'
  },
  {
    id: 'iw_driver',
    group: 'kandahar_ngo_un',
    level_min: 5, level_max: 5,
    title_en: 'Driver Interview',
    title_ps: 'د ډرایور مرکه',
    title_dari: '',
    description_en: 'Interview for driver positions in NGO, UN, or organizational vehicles.',
    description_ps: 'د NGO، UN، یا د سازمان موترو کې د ډرایور موقعیتونو لپاره مرکه.',
    description_dari: '',
    icon: '🚗', difficulty: 5, sector: 'transport',
    job_keywords: ['driver', 'vehicle', 'transport', 'license'],
    status: 'sample'
  },
  {
    id: 'iw_teacher_trainer',
    group: 'kandahar_ngo_un',
    level_min: 6, level_max: 7,
    title_en: 'Teacher / Trainer Interview',
    title_ps: 'د ښوونکي / روزونکي مرکه',
    title_dari: '',
    description_en: 'Interview for teaching and training roles in educational programmes.',
    description_ps: 'د تعلیمي پروګرامونو کې د ښوونې او روزنې رولونو لپاره مرکه.',
    description_dari: '',
    icon: '👩‍🏫', difficulty: 6, sector: 'education',
    job_keywords: ['teacher', 'trainer', 'education', 'curriculum'],
    status: 'planned'
  },
  {
    id: 'iw_interpreter',
    group: 'kandahar_ngo_un',
    level_min: 6, level_max: 7,
    title_en: 'Interpreter / Translator Interview',
    title_ps: 'د ترجمان / ژباړونکي مرکه',
    title_dari: '',
    description_en: 'Interview for interpreter and language support roles.',
    description_ps: 'د ترجمان او د ژبو د ملاتړ رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🗣️', difficulty: 6, sector: 'language',
    job_keywords: ['interpreter', 'translator', 'language', 'Pashto', 'Dari'],
    status: 'planned'
  },
  {
    id: 'iw_reception',
    group: 'kandahar_ngo_un',
    level_min: 5, level_max: 6,
    title_en: 'Reception / Office Assistant Interview',
    title_ps: 'د ریسپشن / دفتري مرستیال مرکه',
    title_dari: '',
    description_en: 'Interview for receptionist and office assistant roles.',
    description_ps: 'د ریسپشنیست او دفتري مرستیال رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🖥️', difficulty: 5, sector: 'admin',
    job_keywords: ['reception', 'front desk', 'office', 'assistant'],
    status: 'planned'
  },
  {
    id: 'iw_construction',
    group: 'kandahar_ngo_un',
    level_min: 6, level_max: 7,
    title_en: 'Construction Project Interview',
    title_ps: 'د جوړولو پروژه مرکه',
    title_dari: '',
    description_en: 'Interview for construction project coordination and field supervision roles.',
    description_ps: 'د جوړولو د پروژې همغږۍ او د ډګر نظارت رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🏗️', difficulty: 6, sector: 'construction',
    job_keywords: ['construction', 'project', 'supervision', 'civil'],
    status: 'planned'
  },
  {
    id: 'iw_road_engineer',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Road Engineer / Surveyor Interview',
    title_ps: 'د سړک انجنیر / سروی کوونکي مرکه',
    title_dari: '',
    description_en: 'Interview for civil engineering and road surveying roles.',
    description_ps: 'د عمراني انجنیرۍ او د سړک سروی رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🛣️', difficulty: 7, sector: 'engineering',
    job_keywords: ['engineer', 'road', 'survey', 'civil'],
    status: 'planned'
  },
  {
    id: 'iw_quality_control',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Quality Control Officer Interview',
    title_ps: 'د کیفیت کنترول افسر مرکه',
    title_dari: '',
    description_en: 'Interview for quality assurance and quality control roles.',
    description_ps: 'د کیفیت ډاډمنتیا او د کیفیت کنترول رولونو لپاره مرکه.',
    description_dari: '',
    icon: '✅', difficulty: 7, sector: 'quality',
    job_keywords: ['quality', 'control', 'assurance', 'inspection'],
    status: 'planned'
  },
  {
    id: 'iw_civil_service',
    group: 'officer_formal',
    level_min: 9, level_max: 9,
    title_en: 'Civil Service / Officer Interview',
    title_ps: 'د ملکي خدماتو / افسر مرکه',
    title_dari: '',
    description_en: 'Formal civil service and government officer interview preparation.',
    description_ps: 'د رسمي ملکي خدماتو او د حکومت افسر د مرکې چمتوالی.',
    description_dari: '',
    icon: '🏛️', difficulty: 9, sector: 'government',
    job_keywords: ['civil service', 'government', 'officer', 'formal'],
    status: 'planned'
  },
  {
    id: 'iw_banking_finance',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Banking / Finance Interview',
    title_ps: 'د بانکداري / مالیې مرکه',
    title_dari: '',
    description_en: 'Interview for banking, microfinance, and financial services roles.',
    description_ps: 'د بانکداري، مایکروفایننس، او د مالي خدماتو رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🏦', difficulty: 7, sector: 'finance',
    job_keywords: ['bank', 'finance', 'microfinance', 'loan'],
    status: 'planned'
  },
  {
    id: 'iw_customer_service',
    group: 'kandahar_ngo_un',
    level_min: 5, level_max: 6,
    title_en: 'Customer Service Interview',
    title_ps: 'د پیرودونکو خدمت مرکه',
    title_dari: '',
    description_en: 'Interview for customer service and client-facing roles.',
    description_ps: 'د پیرودونکو خدمت او د پیرودونکو د مخامخ رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🎧', difficulty: 5, sector: 'service',
    job_keywords: ['customer service', 'client', 'support', 'complaint'],
    status: 'planned'
  },
  {
    id: 'iw_business_supplier',
    group: 'kandahar_ngo_un',
    level_min: 7, level_max: 8,
    title_en: 'Business / Supplier Interview',
    title_ps: 'د سوداګرۍ / عرضه‌کوونکي مرکه',
    title_dari: '',
    description_en: 'Interview and negotiation for business supplier and commercial roles.',
    description_ps: 'د سوداګرۍ عرضه‌کوونکي او سوداګریزو رولونو لپاره مرکه او خبرې اترې.',
    description_dari: '',
    icon: '🤝', difficulty: 7, sector: 'business',
    job_keywords: ['business', 'supplier', 'negotiation', 'commercial'],
    status: 'planned'
  },
  {
    id: 'iw_security_guard',
    group: 'kandahar_ngo_un',
    level_min: 5, level_max: 5,
    title_en: 'Security Guard Interview',
    title_ps: 'د امنیتي محافظ مرکه',
    title_dari: '',
    description_en: 'Interview for security guard and compound protection roles.',
    description_ps: 'د امنیتي محافظ او د مرکز د ساتنې رولونو لپاره مرکه.',
    description_dari: '',
    icon: '🛡️', difficulty: 5, sector: 'security',
    job_keywords: ['security', 'guard', 'protection', 'access'],
    status: 'planned'
  },

  // ── GROUP 6: HSO / E-COMMERCE DELIVERY ───────────────────
  {
    id: 'iw_hso_delivery_rider',
    group: 'hso_delivery',
    level_min: 5, level_max: 5,
    title_en: 'HSO Delivery Rider Interview',
    title_ps: 'د HSO ډیلیوري سپور مرکه',
    title_dari: '',
    description_en: 'Interview for local e-commerce delivery rider positions.',
    description_ps: 'د ځایي ای-کامرس ډیلیوري سپور موقعیتونو لپاره مرکه.',
    description_dari: '',
    icon: '🛵', difficulty: 5, sector: 'ecommerce',
    job_keywords: ['delivery rider', 'HSO', 'e-commerce', 'motorbike'],
    status: 'planned'
  },
  {
    id: 'iw_hso_driver',
    group: 'hso_delivery',
    level_min: 5, level_max: 5,
    title_en: 'HSO Driver Interview',
    title_ps: 'د HSO ډرایور مرکه',
    title_dari: '',
    description_en: 'Interview for e-commerce platform vehicle driver positions.',
    description_ps: 'د ای-کامرس پلیټفارم د موتر ډرایور موقعیتونو لپاره مرکه.',
    description_dari: '',
    icon: '🚗', difficulty: 5, sector: 'ecommerce',
    job_keywords: ['driver', 'HSO', 'vehicle', 'delivery'],
    status: 'planned'
  },
  {
    id: 'iw_hso_customer_support',
    group: 'hso_delivery',
    level_min: 5, level_max: 6,
    title_en: 'HSO Customer Support Interview',
    title_ps: 'د HSO پیرودونکو ملاتړ مرکه',
    title_dari: '',
    description_en: 'Interview for customer support and complaint resolution in e-commerce.',
    description_ps: 'د ای-کامرس کې د پیرودونکو ملاتړ او د شکایتونو حل لپاره مرکه.',
    description_dari: '',
    icon: '📱', difficulty: 5, sector: 'ecommerce',
    job_keywords: ['customer support', 'HSO', 'complaint', 'service'],
    status: 'planned'
  },
  {
    id: 'iw_hso_dispatcher',
    group: 'hso_delivery',
    level_min: 5, level_max: 6,
    title_en: 'HSO Order Dispatcher Interview',
    title_ps: 'د HSO آرډر ډیسپیچر مرکه',
    title_dari: '',
    description_en: 'Interview for order dispatching and coordination roles in delivery platforms.',
    description_ps: 'د ډیلیوري پلیټفارمونو کې د آرډر ویشلو او همغږۍ رولونو لپاره مرکه.',
    description_dari: '',
    icon: '📋', difficulty: 5, sector: 'ecommerce',
    job_keywords: ['dispatcher', 'order', 'coordination', 'HSO'],
    status: 'planned'
  },
  {
    id: 'iw_hso_warehouse',
    group: 'hso_delivery',
    level_min: 5, level_max: 6,
    title_en: 'HSO Warehouse Assistant Interview',
    title_ps: 'د HSO ذخیره‌خانې مرستیال مرکه',
    title_dari: '',
    description_en: 'Interview for warehouse packing and stock management assistant roles.',
    description_ps: 'د ذخیره‌خانې د بسته‌بندۍ او د ذخیره‌ مدیریت مرستیال رولونو لپاره مرکه.',
    description_dari: '',
    icon: '📦', difficulty: 5, sector: 'ecommerce',
    job_keywords: ['warehouse', 'stock', 'packing', 'HSO'],
    status: 'planned'
  },
  {
    id: 'iw_hso_sales',
    group: 'hso_delivery',
    level_min: 6, level_max: 7,
    title_en: 'HSO Sales Representative Interview',
    title_ps: 'د HSO د پلور استازي مرکه',
    title_dari: '',
    description_en: 'Interview for e-commerce sales representative and merchant outreach roles.',
    description_ps: 'د ای-کامرس د پلور استازي او د سوداګرانو اتصال رولونو لپاره مرکه.',
    description_dari: '',
    icon: '💬', difficulty: 6, sector: 'ecommerce',
    job_keywords: ['sales', 'representative', 'merchant', 'HSO'],
    status: 'planned'
  },
  {
    id: 'iw_hso_cash_collection',
    group: 'hso_delivery',
    level_min: 6, level_max: 7,
    title_en: 'HSO Cash Collection Interview',
    title_ps: 'د HSO نغدو پیسو راټولولو مرکه',
    title_dari: '',
    description_en: 'Interview for cash-on-delivery collection and reconciliation roles.',
    description_ps: 'د ډیلیوري پر وخت د نغدو پیسو راټولولو او مطابقت رولونو لپاره مرکه.',
    description_dari: '',
    icon: '💵', difficulty: 6, sector: 'ecommerce',
    job_keywords: ['cash', 'collection', 'COD', 'reconciliation'],
    status: 'planned'
  },
  {
    id: 'iw_hso_complaint',
    group: 'hso_delivery',
    level_min: 6, level_max: 7,
    title_en: 'HSO Complaint Handling Interview',
    title_ps: 'د HSO شکایت اداره کولو مرکه',
    title_dari: '',
    description_en: 'Interview for complaint resolution and customer escalation roles.',
    description_ps: 'د شکایت حل او د پیرودونکو سکالیشن رولونو لپاره مرکه.',
    description_dari: '',
    icon: '⚠️', difficulty: 6, sector: 'ecommerce',
    job_keywords: ['complaint', 'resolution', 'customer', 'escalation'],
    status: 'planned'
  },
  {
    id: 'iw_hso_supervisor',
    group: 'hso_delivery',
    level_min: 7, level_max: 8,
    title_en: 'HSO Operations Supervisor Interview',
    title_ps: 'د HSO عملیاتي سرپرست مرکه',
    title_dari: '',
    description_en: 'Interview for operations supervisor and team lead roles in delivery platforms.',
    description_ps: 'د ډیلیوري پلیټفارمونو کې د عملیاتي سرپرست او د ټیم مشر رولونو لپاره مرکه.',
    description_dari: '',
    icon: '👔', difficulty: 7, sector: 'ecommerce',
    job_keywords: ['supervisor', 'operations', 'team lead', 'HSO'],
    status: 'planned'
  },
  {
    id: 'iw_hso_ecommerce_admin',
    group: 'hso_delivery',
    level_min: 7, level_max: 8,
    title_en: 'HSO E-commerce Admin Interview',
    title_ps: 'د HSO ای-کامرس اداري مرکه',
    title_dari: '',
    description_en: 'Interview for e-commerce platform administration and back-office roles.',
    description_ps: 'د ای-کامرس پلیټفارم اداره کولو او د شاتهي دفتر رولونو لپاره مرکه.',
    description_dari: '',
    icon: '💻', difficulty: 7, sector: 'ecommerce',
    job_keywords: ['admin', 'e-commerce', 'platform', 'back-office'],
    status: 'planned'
  },

  // ── GROUP 7: PROFESSIONAL SKILLS ─────────────────────────
  {
    id: 'iw_professional_skills',
    group: 'professional_skills',
    level_min: 7, level_max: 8,
    title_en: 'Professional Skills Interview',
    title_ps: 'مسلکي مهارتونو مرکه',
    title_dari: '',
    description_en: 'Demonstrate professional skills: teamwork, problem-solving, communication.',
    description_ps: 'مسلکي مهارتونه وښیه: ټیم کار، د ستونزو حل، اړیکې.',
    description_dari: '',
    icon: '🧠', difficulty: 7, sector: 'general',
    job_keywords: ['teamwork', 'problem solving', 'communication', 'professional'],
    status: 'planned'
  },
  {
    id: 'iw_star_method',
    group: 'professional_skills',
    level_min: 8, level_max: 10,
    title_en: 'STAR Method Answers',
    title_ps: 'د STAR میتود ځوابونه',
    title_dari: '',
    description_en: 'Use the STAR method: Situation, Task, Action, Result for advanced interviews.',
    description_ps: 'د پرمختللو مرکو لپاره STAR میتود وکاروه: حالت، دنده، عمل، پایله.',
    description_dari: '',
    icon: '⭐', difficulty: 8, sector: 'general',
    job_keywords: ['STAR', 'situation', 'task', 'action', 'result'],
    status: 'planned'
  },
  {
    id: 'iw_leadership',
    group: 'professional_skills',
    level_min: 8, level_max: 10,
    title_en: 'Leadership Questions',
    title_ps: 'د مشرتابه پوښتنې',
    title_dari: '',
    description_en: 'Practice leadership and management interview questions.',
    description_ps: 'د مشرتابه او مدیریت د مرکې پوښتنو تمرین وکړه.',
    description_dari: '',
    icon: '🎖️', difficulty: 8, sector: 'general',
    job_keywords: ['leadership', 'management', 'team', 'decision'],
    status: 'planned'
  },

  // ── GROUP 8: ACADEMIC AND SCHOLARSHIP ────────────────────
  {
    id: 'iw_university_admission',
    group: 'academic_scholarship',
    level_min: 8, level_max: 9,
    title_en: 'University Admission Interview',
    title_ps: 'د پوهنتون د ننه ورتګ مرکه',
    title_dari: '',
    description_en: 'Practice university admission and scholarship interviews.',
    description_ps: 'د پوهنتون د ننه ورتګ او د وظیفۍ مرکو تمرین وکړه.',
    description_dari: '',
    icon: '🎓', difficulty: 8, sector: 'education',
    job_keywords: ['university', 'admission', 'scholarship', 'academic'],
    status: 'sample'
  },
  {
    id: 'iw_scholarship',
    group: 'academic_scholarship',
    level_min: 8, level_max: 9,
    title_en: 'Scholarship Interview',
    title_ps: 'د وظیفۍ مرکه',
    title_dari: '',
    description_en: 'Practice scholarship committee interviews for overseas and local programmes.',
    description_ps: 'د بهرنیو او ځایي پروګرامونو لپاره د وظیفۍ کمیټې مرکو تمرین وکړه.',
    description_dari: '',
    icon: '🏆', difficulty: 8, sector: 'education',
    job_keywords: ['scholarship', 'committee', 'study abroad', 'academic'],
    status: 'planned'
  },
  {
    id: 'iw_oral_exam',
    group: 'academic_scholarship',
    level_min: 8, level_max: 9,
    title_en: 'Oral Exam Preparation',
    title_ps: 'د شفاهي ازموینې چمتوالی',
    title_dari: '',
    description_en: 'Practice oral examination for academic and professional certifications.',
    description_ps: 'د اکاډمیک او مسلکي تصدیقونو لپاره د شفاهي ازموینې تمرین وکړه.',
    description_dari: '',
    icon: '📝', difficulty: 8, sector: 'education',
    job_keywords: ['oral exam', 'viva', 'academic', 'certification'],
    status: 'planned'
  },

  // ── GROUP 9: OFFICER AND FORMAL ──────────────────────────
  {
    id: 'iw_panel_interview',
    group: 'officer_formal',
    level_min: 9, level_max: 9,
    title_en: 'Panel Interview',
    title_ps: 'د پینل مرکه',
    title_dari: '',
    description_en: 'Practice facing a panel of multiple interviewers confidently.',
    description_ps: 'له ډیرو مرکه اخیستونکو سره له اطمینان سره مخ کیدو تمرین وکړه.',
    description_dari: '',
    icon: '👔', difficulty: 9, sector: 'formal',
    job_keywords: ['panel', 'formal', 'multiple interviewers', 'confidence'],
    status: 'sample'
  },
  {
    id: 'iw_pressure_questions',
    group: 'officer_formal',
    level_min: 9, level_max: 9,
    title_en: 'Pressure Questions',
    title_ps: 'د فشار پوښتنې',
    title_dari: '',
    description_en: 'Stay calm and answer difficult, challenging questions under pressure.',
    description_ps: 'آرام پاتې شه او د فشار لاندې سختو پوښتنو ته ځواب ورکړه.',
    description_dari: '',
    icon: '🔥', difficulty: 9, sector: 'formal',
    job_keywords: ['pressure', 'difficult questions', 'stress', 'panel'],
    status: 'planned'
  },
  {
    id: 'iw_negotiation',
    group: 'officer_formal',
    level_min: 9, level_max: 10,
    title_en: 'Negotiation and Deal Interview',
    title_ps: 'د خبرو اترو او تړون مرکه',
    title_dari: '',
    description_en: 'Practice negotiation language for formal professional deals and agreements.',
    description_ps: 'د رسمي مسلکي تړونونو او موافقتنامو لپاره د خبرو اترو د ژبې تمرین وکړه.',
    description_dari: '',
    icon: '🤝', difficulty: 9, sector: 'formal',
    job_keywords: ['negotiation', 'deal', 'agreement', 'formal'],
    status: 'planned'
  },

  // ── GROUP 10: ADVANCED / ACADEMY ─────────────────────────
  {
    id: 'iw_expert_fluency',
    group: 'advanced_academy',
    level_min: 10, level_max: 10,
    title_en: 'Expert Fluency Interview',
    title_ps: 'د متخصص روانۍ مرکه',
    title_dari: '',
    description_en: 'Advanced professional answers with expert-level English fluency.',
    description_ps: 'د متخصص د کچې انګلیسي روانۍ سره پرمختللي مسلکي ځوابونه.',
    description_dari: '',
    icon: '🏅', difficulty: 10, sector: 'professional',
    job_keywords: ['expert', 'fluency', 'advanced', 'professional'],
    status: 'planned'
  },
  {
    id: 'iw_problem_solving',
    group: 'advanced_academy',
    level_min: 9, level_max: 10,
    title_en: 'Problem Solving Under Pressure',
    title_ps: 'د فشار لاندې د ستونزو حل',
    title_dari: '',
    description_en: 'Demonstrate complex problem-solving in high-pressure interview scenarios.',
    description_ps: 'د لوړ فشار د مرکې سناریوګانو کې پیچلي د ستونزو حل وښیه.',
    description_dari: '',
    icon: '🧩', difficulty: 10, sector: 'professional',
    job_keywords: ['problem solving', 'pressure', 'critical thinking', 'scenarios'],
    status: 'planned'
  },
  {
    id: 'iw_case_study',
    group: 'advanced_academy',
    level_min: 9, level_max: 10,
    title_en: 'Case Study Interview',
    title_ps: 'د کیس سټډي مرکه',
    title_dari: '',
    description_en: 'Practice case study and scenario-based interview questions.',
    description_ps: 'د کیس سټډي او د سناریو پر بنسټ مرکې پوښتنو تمرین وکړه.',
    description_dari: '',
    icon: '🔬', difficulty: 10, sector: 'professional',
    job_keywords: ['case study', 'scenario', 'analysis', 'solution'],
    status: 'coming_soon'
  }
];


// ============================================================
// SAMPLE LESSONS (11 total — includes 1 Level 10 sample)
// ============================================================
window.zirakInterviewLessons = [

  // ── SAMPLE 1: BEGINNER PERSONAL ──────────────────────────
  {
    id: 'iw_l1_001',
    track_id: 'iw_personal_intro',
    level: 1,
    mode: 'spoken_answer',
    question_en: 'Tell me about yourself.',
    question_ps: 'د ځان په اړه راته ووایه.',
    question_dari: '',
    sample_answer_en: 'My name is Ahmad. I am a student. I live in Kandahar. I like learning English because it helps me find a good job.',
    sample_answer_ps: 'زما نوم احمد دی. زه زده کوونکی یم. زه کندهار کې اوسیږم. زه انګلیسي زده کول خوښوم ځکه چې دا ما سره د ښې دندې موندلو کې مرسته کوي.',
    sample_answer_dari: '',
    tips_en: ['Say your name clearly.', 'Say your role (student, worker).', 'Say where you live.', 'Say one positive thing about yourself.'],
    tips_ps: ['خپل نوم د روښانتیا سره ووایه.', 'خپل رول ووایه (زده کوونکی، کارمند).', 'ووایه چیرې اوسیږی.', 'د ځان یوه مثبته خبره ووایه.'],
    tips_dari: [],
    keywords: ['name', 'student', 'live', 'English', 'job'],
    cefr: 'A1',
    difficulty: 1
  },

  // ── SAMPLE 2: BEGINNER PERSONAL ──────────────────────────
  {
    id: 'iw_l1_002',
    track_id: 'iw_personal_intro',
    level: 1,
    mode: 'spoken_answer',
    question_en: 'What is your name and how old are you?',
    question_ps: 'ستا نوم څه دی او تاسو څو کلن یاست؟',
    question_dari: '',
    sample_answer_en: 'My name is Fatima. I am twenty years old. I am from Kandahar, Afghanistan.',
    sample_answer_ps: 'زما نوم فاطمه دی. زه شل کلنه یم. زه د افغانستان کندهار ښار نه یم.',
    sample_answer_dari: '',
    tips_en: ['Speak slowly and clearly.', 'Say your full name.', 'Say your age as a full sentence.', 'Say your city and country.'],
    tips_ps: ['ورو او روښانه خبرې وکړه.', 'خپل بشپړ نوم ووایه.', 'خپل عمر د بشپړې جملې سره ووایه.', 'خپل ښار او هیواد ووایه.'],
    tips_dari: [],
    keywords: ['name', 'age', 'city', 'Afghanistan', 'Kandahar'],
    cefr: 'A1',
    difficulty: 1
  },

  // ── SAMPLE 3: SCHOOL / STUDENT ───────────────────────────
  {
    id: 'iw_l2_001',
    track_id: 'iw_school_general',
    level: 2,
    mode: 'spoken_answer',
    question_en: 'What school do you go to and what is your favourite subject?',
    question_ps: 'کوم ښوونځي ته ځې او ستا خوښه مضمون کوم دی؟',
    question_dari: '',
    sample_answer_en: 'I go to Ahmad Shah Baba High School. My favourite subject is English. I like English because I want to speak with people from other countries.',
    sample_answer_ps: 'زه احمدشاه بابا لیسې ته ځم. زما خوښه مضمون انګلیسي دی. زه انګلیسي خوښوم ځکه چې غواړم د نورو هیوادونو له خلکو سره خبرې وکړم.',
    sample_answer_dari: '',
    tips_en: ['Name your school clearly.', 'Name your favourite subject.', 'Explain WHY you like it.'],
    tips_ps: ['خپل ښوونځي روښانه نوم ووایه.', 'خپل خوښه مضمون نوم ووایه.', 'توضیح کړه چې ولې یې خوښوې.'],
    tips_dari: [],
    keywords: ['school', 'subject', 'English', 'favourite', 'learn'],
    cefr: 'A2',
    difficulty: 2
  },

  // ── SAMPLE 4: PHONE INTERVIEW ─────────────────────────────
  {
    id: 'iw_l3_001',
    track_id: 'iw_phone_basic',
    level: 3,
    mode: 'spoken_answer',
    question_en: 'Hello, this is a phone interview. Can you tell me your name and why you are applying?',
    question_ps: 'سلام، دا تیلیفوني مرکه ده. ایا تاسو راته خپل نوم او د غوښتنلیک لیږلو لامل ووایی؟',
    question_dari: '',
    sample_answer_en: 'Hello. Thank you for calling. My name is Omar. I am applying because I want to work hard and learn new skills. I am available to start immediately.',
    sample_answer_ps: 'سلام. د زنګ وهلو مننه. زما نوم عمر دی. زه د دې لپاره غوښتنلیک لیږم چې غواړم سخت کار وکړم او نوي مهارتونه زده کړم. زه سمدلاسه پیل کولو لپاره چمتو یم.',
    sample_answer_dari: '',
    tips_en: ['Greet politely on the phone.', 'Say your name clearly.', 'Say why you want the job.', 'Show enthusiasm and availability.'],
    tips_ps: ['په تیلیفون کې مودبانه سلام ووایه.', 'خپل نوم روښانه ووایه.', 'ووایه چې ولې دنده غواړی.', 'لیوالتیا او د شتون چمتوالی وښیه.'],
    tips_dari: [],
    keywords: ['phone', 'interview', 'applying', 'available', 'skills'],
    cefr: 'A2',
    difficulty: 3
  },

  // ── SAMPLE 5: FIRST JOB ───────────────────────────────────
  {
    id: 'iw_l4_001',
    track_id: 'iw_firstjob_general',
    level: 4,
    mode: 'spoken_answer',
    question_en: 'This is your first job interview. Why do you want to work for us?',
    question_ps: 'دا ستا لومړۍ د دندې مرکه ده. ولې غواړی زموږ لپاره کار وکړی؟',
    question_dari: '',
    sample_answer_en: 'I want to work for your organization because you have a good reputation. I am hardworking and punctual. This is my first job and I am ready to learn everything and give my best effort.',
    sample_answer_ps: 'زه غواړم د ستاسو د سازمان لپاره کار وکړم ځکه چې تاسو ښه شهرت لرئ. زه سخت کاري او وختي یم. دا زما لومړۍ دنده ده او زه هر څه زده کولو او خپل غوره هڅه ورکولو لپاره چمتو یم.',
    sample_answer_dari: '',
    tips_en: ['Say something positive about the organization.', 'Mention a personal strength.', 'Admit it is your first job — this is honest and respectful.', 'Show eagerness to learn.'],
    tips_ps: ['د سازمان اړه یوه مثبته خبره ووایه.', 'یو شخصي ځواک یاد کړه.', 'ومنه چې دا ستا لومړۍ دنده ده — دا صادقانه او درنه ده.', 'د زده کړې لیوالتیا وښیه.'],
    tips_dari: [],
    keywords: ['first job', 'organization', 'hardworking', 'learn', 'punctual'],
    cefr: 'B1',
    difficulty: 4
  },

  // ── SAMPLE 6: KANDAHAR NGO GENERAL ───────────────────────
  {
    id: 'iw_l5_001',
    track_id: 'iw_kandahar_ngo_general',
    level: 5,
    mode: 'spoken_answer',
    question_en: 'Why do you want to work for an NGO in Kandahar?',
    question_ps: 'ولې غواړی د کندهار کې د یوه NGO لپاره کار وکړی؟',
    question_dari: '',
    sample_answer_en: 'I want to work for an NGO because I want to help my community. Kandahar needs good workers who speak English and can communicate with international teams. I want to use my English skills to support projects that help Afghan families.',
    sample_answer_ps: 'زه غواړم د یوه NGO لپاره کار وکړم ځکه چې غواړم خپلې ټولنې ته مرسته وکړم. کندهار ښو کارکونکو ته اړتیا لري چې انګلیسي خبرې کولی شي او کولی شي له نړیوالو ټیمونو سره اړیکه ونیسي. زه غواړم خپلو انګلیسي مهارتونو سره د هغو پروژو ملاتړ وکړم چې د افغاني کورنیو سره مرسته کوي.',
    sample_answer_dari: '',
    tips_en: ['Connect your answer to your community.', 'Mention English as a key skill for the NGO.', 'Show you understand the mission of NGOs.', 'Be honest about your motivation.'],
    tips_ps: ['خپل ځواب خپلې ټولنې سره وتړه.', 'د NGO لپاره د کلیدي مهارت حیثیته انګلیسي یاد کړه.', 'وښیه چې د NGOsد ماموریت پوهیږی.', 'د خپل هدف اړه صادق اوسه.'],
    tips_dari: [],
    keywords: ['NGO', 'community', 'English', 'Kandahar', 'help', 'international'],
    cefr: 'B1',
    difficulty: 5
  },

  // ── SAMPLE 7: DRIVER / DELIVERY ──────────────────────────
  {
    id: 'iw_l5_002',
    track_id: 'iw_driver',
    level: 5,
    mode: 'spoken_answer',
    question_en: 'Do you have a valid driving license and how many years of experience do you have?',
    question_ps: 'ایا ستاسو سره معتبر د موترچلولو جواز شته او تاسو د تجربې څو کاله لرئ؟',
    question_dari: '',
    sample_answer_en: 'Yes, I have a valid driving license. I have been driving for five years. I have experience driving in Kandahar city and on highway roads. I always follow traffic rules and I keep the vehicle clean and safe.',
    sample_answer_ps: 'هو، زما سره معتبر د موترچلولو جواز شته. زه پنځه کاله پخوا راهیسې موتر چلوم. زه د کندهار ښار او د شاهراه سړکونو کې د موترچلولو تجربه لرم. زه تل د ترافیکو قوانینو پیروي کوم او موتر پاک او خوندي ساتم.',
    sample_answer_dari: '',
    tips_en: ['Confirm your license clearly.', 'Give a specific number of years.', 'Mention your local driving experience.', 'Emphasize safety and responsibility.'],
    tips_ps: ['خپل جواز روښانه تایید کړه.', 'د کلونو ټاکلی شمیر ووایه.', 'خپل ځایي د موترچلولو تجربه یاد کړه.', 'خوندیتوب او مسولیت وده کړه.'],
    tips_dari: [],
    keywords: ['driver', 'license', 'experience', 'safety', 'vehicle'],
    cefr: 'B1',
    difficulty: 5
  },

  // ── SAMPLE 8: COMMUNITY MOBILIZER ────────────────────────
  {
    id: 'iw_l6_001',
    track_id: 'iw_community_mobilizer',
    level: 6,
    mode: 'spoken_answer',
    question_en: 'How would you convince a community to participate in a health programme?',
    question_ps: 'تاسو به یوه ټولنه د روغتیا پروګرام کې برخه اخیستلو لپاره څنګه راضي کوئ؟',
    question_dari: '',
    sample_answer_en: 'I would first listen to the community and understand their concerns. Then I would explain the benefits of the health programme in simple Pashto and Dari. I would work with local leaders and respected community members to build trust. I would hold small group meetings at times that are convenient for families.',
    sample_answer_ps: 'زه به لومړی د ټولنې خبرو ته غوږ شم او د دوی اندیښنې وپوهیږم. بیا به زه د روغتیا د پروګرام ګټې د پښتو او دري ژبو کې ساده توضیح کړم. زه به د ټولنې د محلي مشرانو او د درناوي وړ غړو سره کار وکړم چې باور رامنځته کړم. زه به د کورنیو لپاره د اسانتیا وختونو کې کوچنۍ ډله‌ییزې غونډې جوړې کړم.',
    sample_answer_dari: '',
    tips_en: ['Show you understand community trust.', 'Mention listening BEFORE talking.', 'Say you use local languages (Pashto, Dari).', 'Show you involve local leaders.'],
    tips_ps: ['وښیه چې د ټولنې باور پوهیږی.', 'د خبرو کولو دمخه غوږ اچول یاد کړه.', 'ووایه چې ځایي ژبې (پښتو، دري) کاروی.', 'وښیه چې محلي مشران پکې شامل کوی.'],
    tips_dari: [],
    keywords: ['community', 'mobilizer', 'health', 'trust', 'local leaders', 'participation'],
    cefr: 'B2',
    difficulty: 6
  },

  // ── SAMPLE 9: ACADEMIC / UNIVERSITY ──────────────────────
  {
    id: 'iw_l8_001',
    track_id: 'iw_university_admission',
    level: 8,
    mode: 'spoken_answer',
    question_en: 'Why do you want to study at this university and what are your academic goals?',
    question_ps: 'ولې غواړی دې پوهنتون کې زده کړه وکړی او ستا اکاډمیک اهداف کوم دي؟',
    question_dari: '',
    sample_answer_en: 'I want to study at this university because it has strong programmes in public health and development. My goal is to complete a degree in public health and return to Kandahar to contribute to healthcare improvements. I believe education is the most powerful way to create lasting change in my community.',
    sample_answer_ps: 'زه غواړم دې پوهنتون کې زده کړه وکړم ځکه چې دلته د عامه روغتیا او پراختیا کې قوي پروګرامونه شته. زما هدف دا دی چې د عامه روغتیا کې سند واخلم او د روغتیایي پرمختیاوو کې د ونډې اخیستو لپاره کندهار ته راستون شم. زه باور لرم چې زده کړه زموږ ټولنې کې د دایمي بدلون رامنځته کولو ترټولو قوي لار ده.',
    sample_answer_dari: '',
    tips_en: ['Research the university programme before the interview.', 'Connect your goals to your community impact.', 'Use academic vocabulary: degree, programme, public health.', 'Show a clear vision of your future contribution.'],
    tips_ps: ['د مرکې دمخه د پوهنتون پروګرام خپل کړه.', 'خپل اهداف خپلې ټولنې اغیزې سره وتړه.', 'اکاډمیک الفاظ وکاروه: سند، پروګرام، عامه روغتیا.', 'د خپلې راتلونکې ونډې روښانه لید وښیه.'],
    tips_dari: [],
    keywords: ['university', 'degree', 'public health', 'goal', 'community', 'contribution'],
    cefr: 'B2',
    difficulty: 8
  },

  // ── SAMPLE 10: PANEL / PROFESSIONAL ──────────────────────
  {
    id: 'iw_l9_001',
    track_id: 'iw_panel_interview',
    level: 9,
    mode: 'spoken_answer',
    question_en: 'We have three panel members here today. Can you describe a situation where you faced a major challenge at work and how you resolved it?',
    question_ps: 'نن ورځ دلته زموږ درې د پینل غړي شته. ایا تاسو کولی شئ داسې حالت بیان کړئ چیرې چې تاسو د کار کې د لوی ننګونې سره مخ شوي یاست او تاسو دا د حل کولو لپاره بیا مطرح کړه؟',
    question_dari: '',
    sample_answer_en: 'Thank you to all panel members for your time. In my previous role as a field assistant, we faced a situation where our vehicle broke down during an emergency delivery of medical supplies to a remote village. I quickly contacted our logistics team and arranged alternative transport. I also communicated clearly with the village health worker to manage expectations. The supplies arrived three hours late, but we resolved the situation without any harm. I learned that clear communication under pressure is the most critical skill in field work.',
    sample_answer_ps: 'د ټولو د پینل غړو مننه د دوی د وخت لپاره. د ډګر مرستیال حیثیته زما په تیره رول کې، موږ داسې حالت سره مخ شو چیرې چې زموږ موتر د یوې لرې پرتې کلي ته د طبي اکمالاتو د بیړني ډیلیوري پرمهال خراب شو. ما ژر د لوژستیک ټیم سره اړیکه وکړه او بدیله ترانسپورت یې برابر کړ. ما د کلي د روغتیا کارکوونکي سره د توقعاتو اداره کولو لپاره هم روښانه اړیکه وکړه. اکمالات درې ساعته ناوخته رسیدل، مګر موږ له هیڅ زیانه پرته حالت حل کړ. ما زده کړه چې د فشار لاندې روښانه اړیکه د ډګر کار کې ترټولو مهم مهارت دی.',
    sample_answer_dari: '',
    tips_en: ['Address all panel members respectfully.', 'Use the STAR method: Situation, Task, Action, Result.', 'Stay calm — take a breath before answering.', 'End with a lesson you learned.'],
    tips_ps: ['د ټولو د پینل غړو سره د درناوي سره خبرې وکړه.', 'STAR میتود وکاروه: حالت، دنده، عمل، پایله.', 'آرام اوسه — د ځواب دمخه ساه واخله.', 'د هغه درس سره پای ته ورسوه چې ما زده کړه.'],
    tips_dari: [],
    keywords: ['panel', 'challenge', 'STAR', 'field', 'pressure', 'communication', 'resolution'],
    cefr: 'C1',
    difficulty: 9
  },

  // ── SAMPLE 11: ADVANCED ACADEMY / EXPERT (LEVEL 10) ──────
  {
    id: 'iw_l10_001',
    track_id: 'iw_expert_fluency',
    level: 10,
    mode: 'spoken_answer',
    question_en: 'Describe a time you had to influence a decision without having direct authority. How did you persuade the people involved?',
    question_ps: 'هغه وخت بیان کړه چې تاسو اړتیا درلوده یو پریکړه پرته له مستقیم واک نه اغیزمن کړئ. تاسو څنګه پکې شامل خلک قانع کړل؟',
    question_dari: '',
    sample_answer_en: 'In a previous coordination role, I noticed that two departments were duplicating efforts on the same beneficiary list, which risked wasting resources. I did not have authority over either team, so I requested a short meeting and presented clear data showing the overlap. Rather than assigning blame, I framed it as a shared opportunity to save time. I proposed a joint tracking sheet and offered to maintain it myself for the first month. Both team leads agreed, and within two weeks duplication dropped to nearly zero. The experience taught me that influence often comes from preparation and framing, not position.',
    sample_answer_ps: 'په پخواني تنظیمي رول کې، ما متوجه شوم چې دوه څانګې په یو ګټونکي لیست باندې هڅې تکرار کوي، چې د سرچینو ضایع کیدو خطر یې لري. ما د هیچ یوې ډلې باندې واک نه درلود، نو ما یو لنډ غونډه وغوښتله او روښانه ډاټا وښوده چې تکرار ښیي. د ملامتولو پر ځای، ما دا د وخت ساتلو یوه ګډه فرصت په توګه وښوده. ما د یوې ګډې تعقیب پاڼې وړاندیز وکړ او وړاندیز مې وکړ چې د لومړي میاشت لپاره به یې زه ځان ساتم. دواړو ډلو مشرانو موافقه وکړه، او په دوه اونیو کې تکرار نږدې صفر شو. تجربې ما ته زده کړه چې اغیزه اکثرا د چمتووالي او چوکاټ څخه راځي، نه د دندې له موقف.',
    sample_answer_dari: '',
    tips_en: ['Use a concrete, specific example, not a general statement.', 'Show that you led with data and preparation, not pressure.', 'Mention how you avoided blame and kept it collaborative.', 'End with a clear result and a lesson learned.'],
    tips_ps: ['یو ښکاره، ځانګړی مثال وکاروه، نه یوه عمومي بیان.', 'وښایه چې تاسو د ډاټا او چمتووالي سره مشري کړې، نه د فشار سره.', 'وښایه چې تاسو څنګه له ملامتولو ډډه کړې او دا یوځای کاري وساتله.', 'د روښانه پایلې او زده کړې درس سره پای ته ورسوه.'],
    tips_dari: [],
    keywords: ['influence', 'authority', 'persuade', 'collaboration', 'data', 'leadership'],
    cefr: 'C1',
    difficulty: 10
  }

];


// ============================================================
// CONTENT AUDIT FUNCTION
// zirakRunInterviewContentAudit()
// ============================================================
window.zirakRunInterviewContentAudit = function () {
  const tracks = window.zirakInterviewTracks || [];
  const lessons = window.zirakInterviewLessons || [];

  const groups = [...new Set(tracks.map(t => t.group))];
  const sampleTracks = tracks.filter(t => t.status === 'sample');
  const plannedTracks = tracks.filter(t => t.status === 'planned');
  const comingSoon = tracks.filter(t => t.status === 'coming_soon');

  const trackIds = tracks.map(t => t.id);
  const lessonIds = lessons.map(l => l.id);
  const dupTrackIds = trackIds.filter((id, i) => trackIds.indexOf(id) !== i);
  const dupLessonIds = lessonIds.filter((id, i) => lessonIds.indexOf(id) !== i);

  const missingEnTrack = tracks.filter(t => !t.title_en || !t.description_en);
  const missingPsTrack = tracks.filter(t => !t.title_ps || !t.description_ps);
  const missingDariTrack = tracks.filter(t => !t.title_dari || !t.description_dari);
  const invalidLevelTracks = tracks.filter(t => t.level_min > t.level_max || t.level_min < 1 || t.level_max > 10);

  const missingEnLesson = lessons.filter(l => !l.question_en || !l.sample_answer_en);
  const missingPsLesson = lessons.filter(l => !l.question_ps || !l.sample_answer_ps);
  const missingDariLesson = lessons.filter(l => !l.question_dari || !l.sample_answer_dari);

  // v1.16I-Fix1: Level 10 / Academy-Expert audit
  const level10Lessons = lessons.filter(l => l.level === 10 || l.difficulty === 10);
  const hasLevel10Sample = level10Lessons.length >= 1;

  const report = {
    total_tracks: tracks.length,
    total_groups: groups.length,
    groups: groups,
    total_sample_tracks: sampleTracks.length,
    total_planned_tracks: plannedTracks.length,
    total_coming_soon_tracks: comingSoon.length,
    total_lessons: lessons.length,
    total_level10_lessons: level10Lessons.length,
    has_level10_sample: hasLevel10Sample,
    duplicate_track_ids: dupTrackIds,
    duplicate_lesson_ids: dupLessonIds,
    tracks_missing_en: missingEnTrack.map(t => t.id),
    tracks_missing_ps: missingPsTrack.map(t => t.id),
    tracks_missing_dari: missingDariTrack.map(t => t.id),
    tracks_invalid_levels: invalidLevelTracks.map(t => t.id),
    lessons_missing_en: missingEnLesson.map(l => l.id),
    lessons_missing_ps: missingPsLesson.map(l => l.id),
    lessons_missing_dari: missingDariLesson.map(l => l.id),
    // Pass requires existing checks to hold true AND at least one Level 10
    // sample lesson to exist (Academy / Expert group check, added Fix1).
    pass: dupTrackIds.length === 0 && dupLessonIds.length === 0 &&
          invalidLevelTracks.length === 0 && hasLevel10Sample
  };

  console.log('=== ZIRAK INTERVIEW CONTENT AUDIT ===');
  console.table(report);
  return report;
};
