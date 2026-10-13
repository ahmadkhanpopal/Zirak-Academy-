// ===================================================================
// ZIRAK v1.17D1 — Pashto-only support migration (hotfix from v1.17D)
// ===================================================================
// Purpose:
//   Keep English as the teaching/speaking language.
//   Remove Dari/Farsi as a visible support language at runtime.
//   Use Afghan Pashto fields wherever available, and never fall back to
//   Dari/Farsi text for learner-facing support fields.
//
// Safety design:
//   This file intentionally preserves old legacy property names such as
//   `dari`, `titleDari`, and `answerDari` as compatibility slots because
//   older renderers still read those fields. Their runtime VALUES are now
//   Pashto or blank/English fallback, not Dari/Farsi.
// ===================================================================
(function() {
  'use strict';

  var SUPPORT_LANG = 'pashto';
  window.ZIRAK_SUPPORT_LANGUAGE = SUPPORT_LANG;

  function firstText() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return '';
  }

  function noDariFallback(item, pashtoKeys, englishKeys) {
    item = item || {};
    for (var i = 0; i < pashtoKeys.length; i++) {
      var v = item[pashtoKeys[i]];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    // Pashto is translation/support only. If Pashto is not available,
    // use English or blank, never old Dari/Farsi fields.
    for (var j = 0; j < (englishKeys || []).length; j++) {
      var e = item[englishKeys[j]];
      if (typeof e === 'string' && e.trim()) return e.trim();
    }
    return '';
  }

  var levelPs = {
    nursery:'پیل کچه', basic:'بنسټیز', beginner:'پیل کوونکی',
    intermediate:'منځنی', advanced:'پرمختللی', academic:'اکاډمیک', ielts:'د IELTS تیاری',
    kids:'ماشومان', elementary:'ابتدایي'
  };
  var categoryPs = {
    'daily-life':'ورځنی ژوند', family:'کورنۍ', school:'ښوونځی', food:'خواړه',
    health:'روغتیا', travel:'سفر', culture:'افغاني فرهنګ', numbers:'شمېرې',
    colours:'رنګونه', animals:'ژوي', body:'بدن', work:'کار'
  };
  var commonSetPs = {
    animals:'ژوي', food:'خواړه', family:'کورنۍ', school:'ښوونځی', home:'کور',
    daily_actions:'ورځني کارونه', health_body:'روغتیا او بدن', clothes:'جامې',
    transport:'ترانسپورت', weather:'هوا', emotions:'احساسات', polite:'ادبي خبرې',
    places:'ځایونه', time_days:'وخت او ورځې', numbers:'شمېرې', internet_tech:'انټرنیټ او ټکنالوژي',
    business:'سوداګري', culture:'فرهنګ', nature:'طبیعت', grammar:'ګرامر',
    workplace_safety_expanded:'د کار ځای خوندیتوب', banking_money:'بانک او پیسې',
    official_documents:'رسمي سندونه', school_parent_words:'ښوونځی او والدین',
    doctor_pharmacy_words:'ډاکټر او درملتون', transport_city_words:'ښاري ترانسپورت',
    housing_repair_words:'کور او ترمیم', emotions_feelings:'احساسات',
    family_relations_expanded:'کورنۍ اړیکې', technology_daily:'ورځنۍ ټکنالوژي',
    polite_requests:'ادبي غوښتنې', shopping_items:'د پیرود شیان', time_calendar:'وخت او جنتري',
    kids_classroom:'ماشومان او ټولګی', business_startup:'د سوداګرۍ پیل',
    community_services:'ټولنیز خدمتونه', weather_seasons:'هوا او موسمونه',
    food_cooking_verbs:'خواړه او پخلی', ielts_speaking_words:'د IELTS خبرې',
    academic_writing_words:'اکاډمیک لیکل'
  };

  function normalizeLevelsAndCategories() {
    try {
      if (typeof LEVELS !== 'undefined') LEVELS.forEach(function(l) {
        l.pashto = firstText(l.pashto, levelPs[l.id]);
        l.dari = l.pashto || l.en || '';
      });
      if (typeof CATEGORIES !== 'undefined') CATEGORIES.forEach(function(c) {
        c.pashto = firstText(c.pashto, categoryPs[c.id]);
        c.dari = c.pashto || c.en || '';
      });
    } catch(e) {}
  }

  function normalizeWordSets() {
    try {
      if (typeof WORD_SETS === 'undefined') return;
      Object.keys(WORD_SETS).forEach(function(key) {
        var set = WORD_SETS[key];
        if (!set) return;
        set.pashto = firstText(set.pashto, set.titlePashto, commonSetPs[key], set.en);
        set.dari = set.pashto;
        (set.words || []).forEach(function(w) {
          if (!w) return;
          var ps = noDariFallback(w, ['pashto','meaningPashto','translationPashto'], []);
          var exPs = noDariFallback(w, ['ex_pashto','examplePashto'], []);
          w.pashto = ps;
          w.meaningPashto = firstText(w.meaningPashto, ps);
          w.examplePashto = firstText(w.examplePashto, exPs);
          w.dari = ps || '';
          w.ex_dari = exPs || '';
        });
      });
    } catch(e) {}
  }

  function normalizeDialogueLike() {
    try {
      if (typeof DIALOGUES !== 'undefined') DIALOGUES.forEach(function(d) {
        d.titlePashto = noDariFallback(d, ['titlePashto','title_ps'], ['titleEn']);
        d.titleDari = d.titlePashto;
        (d.steps || []).forEach(function(s) {
          s.promptPashto = noDariFallback(s, ['promptPashto','prompt_ps'], []);
          s.answerPashto = noDariFallback(s, ['answerPashto','answer_ps'], []);
          s.promptDari = s.promptPashto || '';
          s.answerDari = s.answerPashto || '';
        });
      });
    } catch(e) {}
  }

  function normalizeTopicsStoriesListening() {
    try {
      if (typeof TOPIC_STUDIO_DATA !== 'undefined') TOPIC_STUDIO_DATA.forEach(function(t) {
        t.titlePashto = noDariFallback(t, ['titlePashto','title_ps'], ['titleEn']);
        t.titleDari = t.titlePashto;
        (t.paragraphs || []).forEach(function(p) {
          p.pashto = noDariFallback(p, ['pashto','ps','textPashto'], []);
          p.dari = p.pashto || '';
        });
      });
      if (typeof STORIES !== 'undefined') STORIES.forEach(function(s) {
        s.titlePashto = noDariFallback(s, ['titlePashto','title_ps'], ['titleEn']);
        s.titleDari = s.titlePashto;
        (s.paragraphs || []).forEach(function(p) {
          p.pashto = noDariFallback(p, ['pashto','ps','textPashto'], []);
          p.dari = p.pashto || '';
        });
      });
      if (typeof LISTEN_SENTENCES !== 'undefined') LISTEN_SENTENCES.forEach(function(s) {
        s.pashto = noDariFallback(s, ['pashto','ps','sentencePashto'], []);
        s.dari = s.pashto || '';
      });
    } catch(e) {}
  }

  function normalizeWordOfDayAndSounds() {
    try {
      var wotdPs = {
        resilience:'زغم', hospitality:'مېلمه پالنه', heritage:'میراث', perseverance:'پرله‌پسې هڅه',
        wisdom:'حکمت', community:'ټولنه', journey:'سفر', opportunity:'فرصت', confidence:'باور',
        gratitude:'مننه'
      };
      if (typeof WORD_OF_DAY !== 'undefined') WORD_OF_DAY.forEach(function(w) {
        var ps = noDariFallback(w, ['pashto','meaningPashto'], []);
        w.pashto = ps || wotdPs[w.en] || '';
        w.dari = w.pashto;
        w.ex_dari = noDariFallback(w, ['ex_pashto','examplePashto'], []);
      });
      if (typeof SOUND_PAIRS !== 'undefined') SOUND_PAIRS.forEach(function(p) {
        p.pashto_tip = noDariFallback(p, ['pashto_tip','tipPashto'], []);
        p.dari_tip = p.pashto_tip || '';
      });
      if (typeof WIZARD_MODES !== 'undefined') WIZARD_MODES.forEach(function(m) {
        var psMap = {
          repeat:'د تکرار جادوګر', chunk:'د برخو جوړوونکی', confidence:'د باور نمره',
          'listen-cover':'واوره–پټ کړه–ووایه', 'meaning-first':'لومړی معنا',
          'step-confidence':'ګام په ګام باور', 'full-speech':'بشپړې خبرې', audience:'د اورېدونکو حالت',
          exam:'د امتحان تمرین', mastery:'د مهارت ازموینه', 'dari-reading':'د پښتو لوستل', translation:'د پښتو ژباړې ننګونه'
        };
        m.dari = psMap[m.id] || m.en || '';
        if (m.id === 'dari-reading') m.en = 'Pashto Reading';
        if (m.id === 'translation') m.en = 'Pashto Translation Challenge';
      });
    } catch(e) {}
  }

  function normalizeInterview() {
    // v1.17D FIX: v1.17C incorrectly looked for window.ZIRAK_INTERVIEW_TRACKS (uppercase).
    // The actual runtime globals are window.zirakInterviewTracks and window.zirakInterviewLessons
    // (camelCase, set by interview-content-pack1.js). This function now checks both names
    // so it is robust regardless of which form exists.
    try {
      var tracks = window.zirakInterviewTracks || window.ZIRAK_INTERVIEW_TRACKS;
      if (tracks && typeof tracks.forEach === 'function') {
        tracks.forEach(function(t) {
          t.title_dari = firstText(t.title_ps, t.title_pashto, t.title_en, t.title);
          t.description_dari = firstText(t.description_ps, t.description_pashto, t.description_en, t.description);
        });
      }
      var lessons = window.zirakInterviewLessons || window.ZIRAK_INTERVIEW_LESSONS;
      if (lessons && typeof lessons.forEach === 'function') {
        lessons.forEach(function(l) {
          l.question_dari = firstText(l.question_ps, l.question_pashto, '');
          l.sample_answer_dari = firstText(l.sample_answer_ps, l.sample_answer_pashto, '');
          l.tips_dari = Array.isArray(l.tips_ps) ? l.tips_ps : [];
        });
      }
    } catch(e) {}
  }


  function normalizeExtendedContentModules() {
    try {
      if (typeof ZIRAK_LEVELS !== 'undefined') ZIRAK_LEVELS.forEach(function(l) {
        l.dari = firstText(l.pashto, levelPs[l.id], l.en);
      });
      if (typeof ZIRAK_CATEGORIES !== 'undefined') ZIRAK_CATEGORIES.forEach(function(c) {
        c.dari = firstText(c.pashto, categoryPs[c.id], c.en);
      });
      if (typeof ZIRAK_WORDLAB_WORDS !== 'undefined') ZIRAK_WORDLAB_WORDS.forEach(function(w) {
        w.meaningDari = firstText(w.meaningPashto, w.pashto, '');
        w.exampleDari = firstText(w.examplePashto, '');
      });
      if (typeof ZIRAK_WORDLAB_SETS !== 'undefined') ZIRAK_WORDLAB_SETS.forEach(function(set) {
        set.dari = firstText(set.pashto, set.en);
      });
      if (typeof ZIRAK_GRAMMAR_CARDS !== 'undefined') ZIRAK_GRAMMAR_CARDS.forEach(function(g) {
        g.explanationDari = firstText(g.explanationPashto, '');
        (g.practiceItems || []).forEach(function(pi) {
          pi.qDari = firstText(pi.qPashto, '');
        });
      });
      if (typeof ZIRAK_SENTENCE_PATTERNS !== 'undefined') ZIRAK_SENTENCE_PATTERNS.forEach(function(pat) {
        pat.patternDari = firstText(pat.patternPashto, '');
        pat.exampleDari = firstText(pat.examplePashto, '');
      });
      if (typeof ZIRAK_COMMON_MISTAKES !== 'undefined') ZIRAK_COMMON_MISTAKES.forEach(function(m) {
        m.explanationDari = firstText(m.explanationPashto, '');
      });
      if (typeof ZIRAK_SPEAKING_PROMPTS !== 'undefined') ZIRAK_SPEAKING_PROMPTS.forEach(function(sp) {
        sp.promptDari = firstText(sp.promptPashto, '');
        sp.hintDari = firstText(sp.hintPashto, '');
      });
      if (typeof ZIRAK_CONVERSATION_TOPICS !== 'undefined') ZIRAK_CONVERSATION_TOPICS.forEach(function(t) {
        t.titleDari = firstText(t.titlePashto, t.titleEn);
      });
      if (typeof ZIRAK_MASTERY_LABELS !== 'undefined') ZIRAK_MASTERY_LABELS.forEach(function(m) {
        m.dari = firstText(m.pashto, m.en);
      });
      if (typeof ZIRAK_ACHIEVEMENT_TEXT !== 'undefined') ZIRAK_ACHIEVEMENT_TEXT.forEach(function(a) {
        a.dari = firstText(a.pashto, a.en);
      });
      if (typeof ZIRAK_REPORT_LABELS !== 'undefined') Object.keys(ZIRAK_REPORT_LABELS).forEach(function(k) {
        var item = ZIRAK_REPORT_LABELS[k];
        if (item) item.dari = firstText(item.pashto, item.en);
      });
      if (typeof PLACEMENT_QUESTIONS !== 'undefined') PLACEMENT_QUESTIONS.forEach(function(q) {
        // qd is the learner support prompt. Keep it Pashto-only.
        q.qd = q.qd || '';
      });
      if (typeof MILESTONES !== 'undefined') MILESTONES.forEach(function(m) {
        m.dari = firstText(m.pashto, m.dari, m.en);
      });
    } catch(e) {}
  }

  function migrateStoredMode() {
    try {
      if (localStorage.getItem('active_mode') === 'dari') {
        localStorage.setItem('active_mode', 'parallel');
      }
    } catch(e) {}
  }

  migrateStoredMode();
  normalizeLevelsAndCategories();
  normalizeWordSets();
  normalizeDialogueLike();
  normalizeTopicsStoriesListening();
  normalizeWordOfDayAndSounds();
  normalizeInterview();
  normalizeExtendedContentModules();

  window.zirakGetPashtoSupportText = function(item, type) {
    item = item || {};
    if (type === 'title') return noDariFallback(item, ['titlePashto','title_ps','pashto'], ['titleEn','en']);
    if (type === 'answer') return noDariFallback(item, ['answerPashto','answer_ps','pashto'], []);
    if (type === 'prompt') return noDariFallback(item, ['promptPashto','prompt_ps','pashto'], []);
    if (type === 'example') return noDariFallback(item, ['examplePashto','ex_pashto','pashto'], []);
    return noDariFallback(item, ['meaningPashto','pashto','ps'], []);
  };

  console.log('[PashtoOnlyMigration v1.17D1] English core + Pashto-only support normalization applied.');
})();
// ===================================================================
// END ZIRAK v1.17D1 Pashto-only support migration
// ===================================================================
