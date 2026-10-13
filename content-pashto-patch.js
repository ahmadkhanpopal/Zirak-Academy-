// ===================================================================
// ZIRAK APP — content-pashto-patch.js
// Version: v1.14B — Pashto meaning patch for legacy WORD_SETS
// ===================================================================
//
// Adds Pashto meaning fields to legacy words in content.js WORD_SETS.
// Loads AFTER content.js and content-pack1a.js, BEFORE app.js.
// Uses word IDs to safely patch each word object.
// Does not modify or replace content.js.
//
// ===================================================================
(function() {
  'use strict';
  if (typeof WORD_SETS === 'undefined') return;

  // Map of word ID → pashto meaning
  var PASHTO_MAP = {
    // Animals
    'a1': 'زمری', 'a2': 'اسپه', 'a3': 'مرغه', 'a4': 'کب', 'a5': 'پیشو',
    'a6': 'سپی', 'a7': 'پسه', 'a8': 'وزه',
    // Food
    'f1': 'وريژې', 'f2': 'ډوډۍ', 'f3': 'انار', 'f4': 'چای', 'f5': 'کوچنی وزه غوښه',
    'f6': 'کچالو', 'f7': 'ماست', 'f8': 'پیاز',
    // Family
    'fam1': 'پلار', 'fam2': 'مور', 'fam3': 'ورور', 'fam4': 'خور',
    'fam5': 'نیا', 'fam6': 'نیکه', 'fam7': 'تره', 'fam8': 'تنه',
    // School
    'sch1': 'کتاب', 'sch2': 'ښوونکی', 'sch3': 'زده‌کوونکی', 'sch4': 'ټولګی',
    'sch5': 'کورنی کار', 'sch6': 'لوست', 'sch7': 'ازموینه', 'sch8': 'کاپي',
    // Home
    'hom1': 'خونه', 'hom2': 'پخلنخانه', 'hom3': 'دروازه', 'hom4': 'کړکۍ',
    'hom5': 'حویلي', 'hom6': 'چت', 'hom7': 'چوکۍ', 'hom8': 'میز',
    // Daily actions
    'dai1': 'پاڅیدل', 'dai2': 'مینځل', 'dai3': 'خوړل', 'dai4': 'څښل',
    'dai5': 'تلل', 'dai6': 'راتلل', 'dai7': 'لوستل', 'dai8': 'لیکل',
    // Health/body
    'hea1': 'سر', 'hea2': 'سترګه', 'hea3': 'لاس', 'hea4': 'پښه',
    'hea5': 'تبه', 'hea6': 'کاشه', 'hea7': 'دوا', 'hea8': 'ډاکټر',
    // Clothes
    'clo1': 'کميس', 'clo2': 'پتلون', 'clo3': 'بوټان', 'clo4': 'واسکټ',
    'clo5': 'پټکۍ', 'clo6': 'خولۍ', 'clo7': 'جامه', 'clo8': 'یونیفورم',
    // Transport
    'tra1': 'بس', 'tra2': 'ټکسي', 'tra3': 'موټر', 'tra4': 'بايسکل',
    'tra5': 'هوایي ډګر', 'tra6': 'ټکټ', 'tra7': 'سټیشن', 'tra8': 'سړک',
    // Weather
    'wea1': 'لمریزه', 'wea2': 'وریځنۍ', 'wea3': 'باران', 'wea4': 'واوره',
    'wea5': 'باد', 'wea6': 'سوړ', 'wea7': 'ګرم', 'wea8': 'توفان',
    // Emotions
    'emo1': 'خوشحاله', 'emo2': 'خفه', 'emo3': 'قهرجن', 'emo4': 'وروېده',
    'emo5': 'ویاړمن', 'emo6': 'ستړی', 'emo7': 'آرام', 'emo8': 'لیواله',
    // Polite phrases
    'pol1': 'مهرباني وکه', 'pol2': 'مننه', 'pol3': 'بخښنه غواړم',
    'pol4': 'بخښنه غواړم', 'pol5': 'ستا د راتلو مننه', 'pol6': 'ایا کولی شم',
    'pol7': 'البته', 'pol8': 'ستونزه نشته',
    // Places
    'pla1': 'بازار', 'pla2': 'جومات', 'pla3': 'ښوونځی', 'pla4': 'روغتیا‌توب',
    'pla5': 'کتابتون', 'pla6': 'پارک', 'pla7': 'بانک', 'pla8': 'دواخانه',
    // Time/days
    'tim1': 'نن', 'tim2': 'سبا', 'tim3': 'پرون', 'tim4': 'سهار',
    'tim5': 'ماښام', 'tim6': 'اونۍ', 'tim7': 'میاشت', 'tim8': 'کال',
    // Numbers
    'num1': 'یولس', 'num2': 'دولس', 'num3': 'شل', 'num4': 'دیرش',
    'num5': 'پنځوس', 'num6': 'سل', 'num7': 'زر', 'num8': 'لومړی',
    // Internet/tech
    'int1': 'تلیفون', 'int2': 'انټرنیټ', 'int3': 'پیغام', 'int4': 'پاسورډ',
    'int5': 'سکرین', 'int6': 'کیبورډ', 'int7': 'ډاونلوډ', 'int8': 'آنلاین',
    // Business
    'bus1': 'پیرودونکی', 'bus2': 'بیه', 'bus3': 'ګټه', 'bus4': 'لګښت',
    'bus5': 'آرډر', 'bus6': 'رسولو', 'bus7': 'کیفیت', 'bus8': 'باور',
    // Culture
    'cul1': 'مېلمستیا', 'cul2': 'مشر', 'cul3': 'دود', 'cul4': 'شاعري',
    'cul5': 'واده', 'cul8': 'میراث',
    // Nature
    'nat1': 'غر', 'nat2': 'سیند', 'nat3': 'ونه', 'nat4': 'ګل',
    'nat5': 'ځمکه', 'nat6': 'اسمان', 'nat7': 'لمر', 'nat8': 'سپوږمۍ',
    // Grammar
    'gra1': 'اسم', 'gra2': 'فعل', 'gra3': 'صفت', 'gra4': 'جمله',
    'gra5': 'پوښتنه', 'gra6': 'ځواب', 'gra7': 'تیر', 'gra8': 'راتلونکی',
    // Workplace safety
    'workplace_safety_expanded_1': 'کاسک', 'workplace_safety_expanded_2': 'لاسکۍ',
    'workplace_safety_expanded_3': 'ژوبله', 'workplace_safety_expanded_4': 'خبرداری',
    'workplace_safety_expanded_5': 'زینه', 'workplace_safety_expanded_6': 'درند',
    'workplace_safety_expanded_7': 'توییدل', 'workplace_safety_expanded_8': 'خوندي',
    'workplace_safety_expanded_9': 'ساتل', 'workplace_safety_expanded_10': 'وسایل',
    // Banking
    'banking_money_1': 'حساب', 'banking_money_2': 'جمع کول', 'banking_money_3': 'وتل',
    'banking_money_4': 'بیلانس', 'banking_money_5': 'رسید', 'banking_money_6': 'فیس',
    'banking_money_7': 'لیږدول', 'banking_money_8': 'بودجه', 'banking_money_9': 'نغدي',
    'banking_money_10': 'کارت',
    // Official documents
    'official_documents_1': 'فورمه', 'official_documents_2': 'لاسلیک',
    'official_documents_3': 'پته', 'official_documents_4': 'د زیږیدو نیټه',
    'official_documents_5': 'پیژندنه', 'official_documents_6': 'کاپي',
    'official_documents_7': 'سپارل', 'official_documents_8': 'وروستۍ نیټه',
    'official_documents_9': 'تایید', 'official_documents_10': 'غوښتنه',
    // School parent words
    'school_parent_words_1': 'مدیر', 'school_parent_words_2': 'حاضري',
    'school_parent_words_3': 'غیاب', 'school_parent_words_4': 'نمره',
    'school_parent_words_5': 'لوستل', 'school_parent_words_6': 'اجازه',
    'school_parent_words_7': 'غونډه', 'school_parent_words_8': 'پرمختګ',
    'school_parent_words_9': 'ملګری', 'school_parent_words_10': 'مضمون',
    // Doctor/pharmacy
    'doctor_pharmacy_words_1': 'ټبلیټ', 'doctor_pharmacy_words_2': 'خوراک',
    'doctor_pharmacy_words_3': 'تبه', 'doctor_pharmacy_words_4': 'کاشه',
    'doctor_pharmacy_words_5': 'دردمن', 'doctor_pharmacy_words_6': 'وینه فشار',
    'doctor_pharmacy_words_7': 'وخت', 'doctor_pharmacy_words_8': 'کلینیک',
    'doctor_pharmacy_words_9': 'دوا', 'doctor_pharmacy_words_10': 'حساسیت',
    // Transport city
    'transport_city_words_1': 'د بس ودریدل', 'transport_city_words_2': 'ټکټ',
    'transport_city_words_3': 'لار', 'transport_city_words_4': 'سټیشن',
    'transport_city_words_5': 'ترافیک', 'transport_city_words_6': 'تیریدو ځای',
    'transport_city_words_7': 'کیڼ', 'transport_city_words_8': 'ښی',
    'transport_city_words_9': 'نږدې', 'transport_city_words_10': 'لیرې',
    // Housing
    'housing_repair_words_1': 'ګرموونکی', 'housing_repair_words_2': 'اوبه توییدل',
    'housing_repair_words_3': 'کرایه', 'housing_repair_words_4': 'مالک',
    'housing_repair_words_5': 'سمول', 'housing_repair_words_6': 'برښنا',
    'housing_repair_words_7': 'د اوبو بل', 'housing_repair_words_8': 'شور',
    'housing_repair_words_9': 'کیلي', 'housing_repair_words_10': 'لیږدیدل',
    // Emotions feelings
    'emotions_feelings_1': 'خوشحاله', 'emotions_feelings_2': 'اندیښمن',
    'emotions_feelings_3': 'ویاړمن', 'emotions_feelings_4': 'ستړی',
    'emotions_feelings_5': 'آرام', 'emotions_feelings_6': 'باور لرونکی',
    'emotions_feelings_7': 'وروېده', 'emotions_feelings_8': 'مننه کوونکی',
    'emotions_feelings_9': 'یوازې', 'emotions_feelings_10': 'هیلمن',
    // Family expanded
    'family_relations_expanded_1': 'مور پلار', 'family_relations_expanded_2': 'ماشومان',
    'family_relations_expanded_3': 'تره', 'family_relations_expanded_4': 'تنه',
    'family_relations_expanded_5': 'تربور', 'family_relations_expanded_6': 'خپلوان',
    'family_relations_expanded_7': 'مشر', 'family_relations_expanded_8': 'مېلمه',
    'family_relations_expanded_9': 'ګاونډی', 'family_relations_expanded_10': 'ملاتړ',
    // Technology
    'technology_daily_1': 'پاسورډ', 'technology_daily_2': 'پیغام',
    'technology_daily_3': 'انټرنیټ', 'technology_daily_4': 'سکرین',
    'technology_daily_5': 'اپلوډ', 'technology_daily_6': 'ډاونلوډ',
    'technology_daily_7': 'لینک', 'technology_daily_8': 'تنظیمات',
    'technology_daily_9': 'چارج', 'technology_daily_10': 'کیمرا',
    // Polite requests
    'polite_requests_1': 'مهرباني وکه', 'polite_requests_2': 'بخښنه غواړم',
    'polite_requests_3': 'ایا کولی شئ', 'polite_requests_4': 'مننه',
    'polite_requests_5': 'بخښنه', 'polite_requests_6': 'ایا کولی شم',
    'polite_requests_7': 'مرسته', 'polite_requests_8': 'ورو',
    'polite_requests_9': 'بیا', 'polite_requests_10': 'مهرباني',
    // Shopping
    'shopping_items_1': 'وريژې', 'shopping_items_2': 'اوړه',
    'shopping_items_3': 'غوړي', 'shopping_items_4': 'شکر',
    'shopping_items_5': 'چای', 'shopping_items_6': 'شودې',
    'shopping_items_7': 'هګۍ', 'shopping_items_8': 'کچالو',
    'shopping_items_9': 'پیاز', 'shopping_items_10': 'صابون',
    // Time calendar
    'time_calendar_1': 'نن', 'time_calendar_2': 'سبا',
    'time_calendar_3': 'پرون', 'time_calendar_4': 'سهار',
    'time_calendar_5': 'ماښام', 'time_calendar_6': 'اونۍ',
    'time_calendar_7': 'میاشت', 'time_calendar_8': 'وختي',
    'time_calendar_9': 'ناوخته', 'time_calendar_10': 'مهالویش',
    // Kids classroom
    'kids_classroom_1': 'ښوونکی', 'kids_classroom_2': 'زده‌کوونکی',
    'kids_classroom_3': 'قلم', 'kids_classroom_4': 'کاغذ',
    'kids_classroom_5': 'اوریدل', 'kids_classroom_6': 'تکرارول',
    'kids_classroom_7': 'دایره', 'kids_classroom_8': 'رنګ',
    'kids_classroom_9': 'شریکول', 'kids_classroom_10': 'پاکول',
    // Business startup
    'business_startup_1': 'پیرودونکی', 'business_startup_2': 'ګټه',
    'business_startup_3': 'لګښت', 'business_startup_4': 'عرضه کوونکی',
    'business_startup_5': 'مال', 'business_startup_6': 'رسولو',
    'business_startup_7': 'کیفیت', 'business_startup_8': 'باور',
    'business_startup_9': 'بیه', 'business_startup_10': 'خدمت',
    // Community services
    'community_services_1': 'ټولنیز مرکز', 'community_services_2': 'پروګرام',
    'community_services_3': 'رضاکار', 'community_services_4': 'ملاتړ',
    'community_services_5': 'مشوره', 'community_services_6': 'ژباړه',
    'community_services_7': 'ټولګی', 'community_services_8': 'نوم ثبتول',
    'community_services_9': 'وخت', 'community_services_10': 'معلومات',
    // Weather seasons
    'weather_seasons_1': 'لمریزه', 'weather_seasons_2': 'وریځنۍ',
    'weather_seasons_3': 'باراني', 'weather_seasons_4': 'واوره‌ییزه',
    'weather_seasons_5': 'باداري', 'weather_seasons_6': 'ګرم',
    'weather_seasons_7': 'سوړ', 'weather_seasons_8': 'پسرلی',
    'weather_seasons_9': 'منی', 'weather_seasons_10': 'اقلیم وړاندوینه',
    // Food cooking verbs
    'food_cooking_verbs_1': 'پخول', 'food_cooking_verbs_2': 'اوبو ته ایښودل',
    'food_cooking_verbs_3': 'سرول', 'food_cooking_verbs_4': 'پرې کول',
    'food_cooking_verbs_5': 'یوځای کول', 'food_cooking_verbs_6': 'خوند کول',
    'food_cooking_verbs_7': 'وړاندې کول', 'food_cooking_verbs_8': 'مینځل',
    'food_cooking_verbs_9': 'پخول', 'food_cooking_verbs_10': 'زیاتول',
    // IELTS speaking
    'ielts_speaking_words_1': 'توضیح کول', 'ielts_speaking_words_2': 'نظر',
    'ielts_speaking_words_3': 'دلیل', 'ielts_speaking_words_4': 'مثال',
    'ielts_speaking_words_5': 'پرتله کول', 'ielts_speaking_words_6': 'ګټه',
    'ielts_speaking_words_7': 'زیان', 'ielts_speaking_words_8': 'تجربه',
    'ielts_speaking_words_9': 'یادونه', 'ielts_speaking_words_10': 'راتلونکی',
    // Academic writing
    'academic_writing_words_1': 'څیړنه', 'academic_writing_words_2': 'ثبوت',
    'academic_writing_words_3': 'دلیل', 'academic_writing_words_4': 'سرچینه',
    'academic_writing_words_5': 'لنډیز', 'academic_writing_words_6': 'پایله',
    'academic_writing_words_7': 'پراګراف', 'academic_writing_words_8': 'د موضوع جمله',
    'academic_writing_words_9': 'ملاتړ', 'academic_writing_words_10': 'تحلیل'
  };

  // Walk all WORD_SETS and inject pashto field into matching words
  var patched = 0;
  Object.values(WORD_SETS).forEach(function(set) {
    if (!set || !Array.isArray(set.words)) return;
    set.words.forEach(function(word) {
      if (word && word.id && PASHTO_MAP[word.id] && !word.pashto) {
        word.pashto = PASHTO_MAP[word.id];
        patched++;
      }
    });
  });

  console.log('[PashtoPatch] Patched ' + patched + ' legacy words with Pashto meanings.');
})();
// ===================================================================
// END content-pashto-patch.js
// ===================================================================
