// ===================================================================
// ZIRAK ENGLISH v1.17D1 — Pashto Display Shell (Hotfix)
// pashto-display-shell.js
// ===================================================================
//
// PURPOSE:
//   Central Pashto support infrastructure for display and reporting.
//   Provides shared helpers for every section of the app so that when
//   real Pashto batch translations arrive, they flow correctly into
//   every render function automatically.
//
// LOAD ORDER:
//   Loads AFTER pashto-only-migration.js, BEFORE interview-core.js and app.js.
//
// WHAT THIS FILE DOES:
//   1. Exports window.getPashtoText(item, type) — central field lookup
//   2. Exports window.renderPashtoLine(text)   — shared HTML renderer
//   3. Exports window.collectMissingPashto()   — missing-content reporter
//   4. Fixes the known interview variable-name mismatch from v1.17C
//   5. Adds a small number of TEST Pashto strings to prove the
//      display pipeline works end-to-end (first dialogue step,
//      first story paragraph, first topic paragraph, first listen sentence)
//   6. Stores the live missing-Pashto report on window.zirakMissingPashtoReport
//
// WHAT THIS FILE DOES NOT DO:
//   - Does NOT bulk-translate any content
//   - Does NOT add Dari/Farsi back
//   - Does NOT break any existing render function
//   - Does NOT use fa-IR
//
// LANGUAGE POLICY:
//   English = teaching/scored language.
//   Afghan Pashto = visual support line only. Never spoken/scored.
//   No Dari/Farsi.
//
// ===================================================================

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // SECTION 1 — getPashtoText
  // Central field lookup across all possible Pashto field names.
  // Returns the first non-empty Pashto string found, or '' if none.
  // Never returns old Dari/Farsi values (they are empty in 1.17C+).
  // ------------------------------------------------------------------

  /**
   * @param {Object}  item  — a data object (dialogue step, word, paragraph …)
   * @param {string}  type  — hint for which fields to prefer
   * @returns {string}       — Pashto text or ''
   */
  function getPashtoText(item, type) {
    item = item || {};
    type = type || 'default';

    // PHASE I6A4 — Part 3/4: legacy-field safety net.
    // Some older content records only ever had a "_dari"-suffixed (or
    // bare "dari") field populated, never the newer "_ps"/"Pashto" one.
    // pashto-only-migration.js already keeps those legacy fields filled
    // with PASHTO text (never real Dari/Farsi) at load time, so reading
    // them here is safe — they are a Pashto fallback slot, not a second
    // support language. Every list below keeps its ORIGINAL fields in
    // their original priority order; the legacy fallbacks are appended
    // at the END of each list so nothing that already resolves correctly
    // can change — they only fill in gaps that previously fell through
    // to "Pashto translation pending."
    var FIELD_LISTS = {
      title:        ['titlePashto', 'title_ps', 'pashto', 'ps', 'title_dari', 'targetPashto'],
      prompt:       ['promptPashto', 'prompt_ps', 'pashto', 'ps', 'prompt_dari', 'targetPashto'],
      answer:       ['answerPashto', 'answer_ps', 'pashto', 'ps', 'answer_dari', 'targetPashto'],
      example:      ['examplePashto', 'ex_pashto', 'ex_ps', 'pashto', 'ps', 'ex_dari'],
      meaning:      ['meaningPashto', 'pashto', 'ps', 'translation_ps', 'targetPashto'],
      description:  ['descriptionPashto', 'description_ps', 'pashto', 'ps', 'description_dari', 'targetPashto'],
      question:     ['questionPashto', 'question_ps', 'pashto', 'ps', 'question_dari', 'targetPashto'],
      sampleAnswer: ['sampleAnswerPashto', 'sample_answer_ps', 'pashto', 'ps', 'sample_answer_dari'],
      tips:         ['tipsPashto', 'tips_ps', 'tips_dari'],
      paragraph:    ['pashto', 'ps', 'textPashto', 'dari', 'translation_ps'],
      listening:    ['pashto', 'ps', 'sentencePashto', 'dari'],
      'default':    ['pashto', 'ps', 'meaningPashto', 'titlePashto',
                     'promptPashto', 'answerPashto', 'textPashto', 'dari',
                     'translation_ps', 'targetPashto']
    };

    var fields = FIELD_LISTS[type] || FIELD_LISTS['default'];

    for (var i = 0; i < fields.length; i++) {
      var val = item[fields[i]];
      if (typeof val === 'string' && val.trim().length > 0) {
        return val.trim();
      }
    }
    return '';
  }

  // ------------------------------------------------------------------
  // SECTION 2 — renderPashtoLine
  // Returns a ready-to-insert HTML string for one Pashto support line.
  // PHASE: Teaching Display & Voice Professionalization Fix
  //   - If text is empty, shows a clearly visible "Pashto translation
  //     pending." marker instead of silently rendering nothing (LOCKED
  //     TEACHING RULE: never silently hide missing Pashto).
  //   - opts.dark        : true  -> use a light-on-dark contrast class
  //                         for Pashto text shown on dark/blue cards
  //                         (fixes the low-contrast Listening Room bug).
  //   - opts.mode         : 'sentence'|'paragraph'|'wizard'|'story'|'modal'
  //                         -> adds 'pashto-mode-<mode>' class for any
  //                         future mode-specific styling; purely additive.
  //   - opts.pending      : false -> suppress the pending marker (rare;
  //                         default true so missing Pashto is never hidden).
  // ------------------------------------------------------------------

  /**
   * @param {string} text       — Pashto string to render
   * @param {string} [cssClass] — CSS class to apply (default: pashto-support-line)
   * @param {Object} [opts]     — { dark, mode, pending }
   * @returns {string}            — HTML string (never '' unless opts.pending===false and text is empty)
   */
  function renderPashtoLine(text, cssClass, opts) {
    opts = opts || {};
    var cls = cssClass || 'pashto-support-line';
    if (opts.dark) cls += ' pashto-on-dark';
    if (opts.mode) cls += ' pashto-mode-' + opts.mode;

    var hasText = !!(text && String(text).trim());
    if (!hasText) {
      if (opts.pending === false) return '';
      return '<div class="' + cls + ' pashto-pending-marker" dir="rtl" lang="ps">Pashto translation pending.</div>';
    }
    // Minimal HTML entity escaping — no external lib needed
    var safe = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    return '<div class="' + cls + '" dir="rtl" lang="ps">' + safe + '</div>';
  }

  // ------------------------------------------------------------------
  // SECTION 2B — zirakActiveStudentInfo
  // Shared lookup for the active logged-in student's display name, used
  // by Home welcome, Review summary, wizard summaries, and Quick
  // Practice spoken feedback. Returns a safe default object when no
  // student is logged in (preview/teacher session) so callers never see
  // "undefined". Never throws even if ZirakProfile isn't loaded yet.
  // ------------------------------------------------------------------
  function zirakActiveStudentInfo() {
    var s = null;
    try {
      if (window.ZirakProfile && typeof window.ZirakProfile.currentStudent === 'function') {
        s = window.ZirakProfile.currentStudent();
      }
    } catch (e) { s = null; }

    if (!s || !s.fullName) {
      return { hasStudent: false, fullName: '', firstName: 'Student', title: '', greetName: 'Student' };
    }
    var full = String(s.fullName).trim();
    var first = full.split(/\s+/)[0] || full;
    var title = '';
    if (s.gender === 'Male') title = 'Mr. ';
    else if (s.gender === 'Female') title = 'Ms. ';
    return {
      hasStudent: true,
      fullName: full,
      firstName: first,
      title: title,
      greetName: title + first   // "Mr. Zahid" or just "Zahid" if no gender on file
    };
  }

  // ------------------------------------------------------------------
  // SECTION 3 — collectMissingPashto
  // Walks all major data arrays and records every place where Pashto
  // support text is absent.  Returns a structured report object.
  // Safe: runs only after DOMContentLoaded, catches all errors.
  // ------------------------------------------------------------------

  function collectMissingPashto() {
    var report = {
      generated:    new Date().toISOString(),
      version:      'v1.17D1',
      dialogues: {
        total:               0,
        totalSteps:          0,
        missingPromptPashto: [],
        missingAnswerPashto: []
      },
      topics: {
        total:          0,
        totalParagraphs: 0,
        missingPashto:  []
      },
      stories: {
        total:          0,
        totalParagraphs: 0,
        missingPashto:  []
      },
      listening: {
        total:         0,
        missingPashto: []
      },
      interview: {
        totalTracks:         0,
        totalLessons:        0,
        tracksWithTitlePs:   0,
        missingTitlePs:      [],
        lessonsWithQPs:      0,
        missingQuestionPs:   [],
        missingSampleAnswerPs: [],
        missingTipsPs:       []
      }
    };

    // — Dialogues —
    try {
      if (typeof DIALOGUES !== 'undefined') {
        report.dialogues.total = DIALOGUES.length;
        DIALOGUES.forEach(function (d) {
          (d.steps || []).forEach(function (s, si) {
            report.dialogues.totalSteps++;
            if (!getPashtoText(s, 'prompt')) {
              report.dialogues.missingPromptPashto.push(
                { dialogueId: d.id, stepIndex: si + 1 }
              );
            }
            if (!getPashtoText(s, 'answer')) {
              report.dialogues.missingAnswerPashto.push(
                { dialogueId: d.id, stepIndex: si + 1 }
              );
            }
          });
        });
      }
    } catch (e) { report.dialogues._error = String(e); }

    // — Topics —
    try {
      if (typeof TOPIC_STUDIO_DATA !== 'undefined') {
        report.topics.total = TOPIC_STUDIO_DATA.length;
        TOPIC_STUDIO_DATA.forEach(function (t) {
          (t.paragraphs || []).forEach(function (p, pi) {
            report.topics.totalParagraphs++;
            if (!getPashtoText(p, 'paragraph')) {
              report.topics.missingPashto.push(
                { topicId: t.id, paragraphIndex: pi + 1 }
              );
            }
          });
        });
      }
    } catch (e) { report.topics._error = String(e); }

    // — Stories —
    try {
      if (typeof STORIES !== 'undefined') {
        report.stories.total = STORIES.length;
        STORIES.forEach(function (s) {
          (s.paragraphs || []).forEach(function (p, pi) {
            report.stories.totalParagraphs++;
            if (!getPashtoText(p, 'paragraph')) {
              report.stories.missingPashto.push(
                { storyId: s.id, paragraphIndex: pi + 1 }
              );
            }
          });
        });
      }
    } catch (e) { report.stories._error = String(e); }

    // — Listen Sentences —
    try {
      if (typeof LISTEN_SENTENCES !== 'undefined') {
        report.listening.total = LISTEN_SENTENCES.length;
        LISTEN_SENTENCES.forEach(function (s, si) {
          if (!getPashtoText(s, 'listening')) {
            report.listening.missingPashto.push(
              { index: si, en: (s.en || '').slice(0, 60) }
            );
          }
        });
      }
    } catch (e) { report.listening._error = String(e); }

    // — Interview —
    try {
      var iw_tracks  = window.zirakInterviewTracks  || window.ZIRAK_INTERVIEW_TRACKS  || [];
      var iw_lessons = window.zirakInterviewLessons || window.ZIRAK_INTERVIEW_LESSONS || [];

      report.interview.totalTracks  = iw_tracks.length;
      report.interview.totalLessons = iw_lessons.length;

      iw_tracks.forEach(function (t) {
        if (t.title_ps && t.title_ps.trim()) {
          report.interview.tracksWithTitlePs++;
        } else {
          report.interview.missingTitlePs.push({ trackId: t.id, title_en: t.title_en || '' });
        }
      });

      iw_lessons.forEach(function (l) {
        if (l.question_ps && l.question_ps.trim()) {
          report.interview.lessonsWithQPs++;
        } else {
          report.interview.missingQuestionPs.push({ lessonId: l.id, track_id: l.track_id || '' });
        }
        if (!l.sample_answer_ps || !l.sample_answer_ps.trim()) {
          report.interview.missingSampleAnswerPs.push({ lessonId: l.id });
        }
        if (!Array.isArray(l.tips_ps) || l.tips_ps.length === 0) {
          report.interview.missingTipsPs.push({ lessonId: l.id });
        }
      });
    } catch (e) { report.interview._error = String(e); }

    return report;
  }

  // ------------------------------------------------------------------
  // SECTION 4 — normalizePashtoFields
  // Utility for ensuring a target Pashto field is filled from any
  // available source. Used by render patches and future content loaders.
  // ------------------------------------------------------------------

  /**
   * @param {Object} item   — data item to normalize in place
   * @param {Array}  rules  — array of { target, sources[] } objects
   * @returns {Object}       — the same item, mutated
   */
  function normalizePashtoFields(item, rules) {
    item  = item  || {};
    rules = rules || [];
    rules.forEach(function (rule) {
      if (item[rule.target]) return; // already set
      for (var i = 0; i < (rule.sources || []).length; i++) {
        var v = item[rule.sources[i]];
        if (typeof v === 'string' && v.trim()) {
          item[rule.target] = v.trim();
          return;
        }
      }
    });
    return item;
  }

  // ------------------------------------------------------------------
  // SECTION 5 — fixInterviewNormalization
  // v1.17C had a bug: normalizeInterview() looked for
  //   window.ZIRAK_INTERVIEW_TRACKS  and  window.ZIRAK_INTERVIEW_LESSONS
  // but the actual globals are (lowercase first letter):
  //   window.zirakInterviewTracks    and  window.zirakInterviewLessons
  // This function corrects that by directly filling the _dari compat
  // fields from the _ps fields that are already present in the data.
  // It is safe to call multiple times (idempotent).
  // ------------------------------------------------------------------

  function fixInterviewNormalization() {
    var tracks  = window.zirakInterviewTracks  || window.ZIRAK_INTERVIEW_TRACKS  || [];
    var lessons = window.zirakInterviewLessons || window.ZIRAK_INTERVIEW_LESSONS || [];

    tracks.forEach(function (t) {
      // Fill _dari compat fields from _ps so legacy code that reads _dari still works
      if (!t.title_dari)       t.title_dari       = t.title_ps       || '';
      if (!t.description_dari) t.description_dari = t.description_ps || '';
    });

    lessons.forEach(function (l) {
      if (!l.question_dari)     l.question_dari     = l.question_ps     || '';
      if (!l.sample_answer_dari) l.sample_answer_dari = l.sample_answer_ps || '';
      // tips_dari was initialised as [] in source; fill from tips_ps array
      if (!Array.isArray(l.tips_dari) || l.tips_dari.length === 0) {
        l.tips_dari = Array.isArray(l.tips_ps) ? l.tips_ps.slice() : [];
      }
    });
  }

  // ------------------------------------------------------------------
  // SECTION 6 — TEST PASHTO STRINGS
  // A minimal set injected at DOMContentLoaded to prove the entire
  // display pipeline works end-to-end WITHOUT bulk translation.
  // Every string is clearly labelled as a proof-of-concept test.
  // Real content will replace these in a later batch phase.
  // ------------------------------------------------------------------

  function injectTestPashtoStrings() {
    try {
      // TEST 1: First dialogue step of greet-01 — proves dialogue render
      if (typeof DIALOGUES !== 'undefined' && DIALOGUES.length > 0) {
        var d0 = DIALOGUES[0];
        if (d0 && d0.steps && d0.steps.length > 0) {
          var s0 = d0.steps[0];
          if (!s0.promptPashto) s0.promptPashto = 'سهار مو پخیر! نن تاسو سته یاست؟';
          if (!s0.answerPashto) s0.answerPashto = 'سهار مو پخیر! ښه یم، مننه.';
        }
      }

      // TEST 2: First paragraph of first story — proves story render
      if (typeof STORIES !== 'undefined' && STORIES.length > 0) {
        var st0 = STORIES[0];
        if (st0 && st0.paragraphs && st0.paragraphs.length > 0) {
          var sp0 = st0.paragraphs[0];
          if (!sp0.pashto) {
            sp0.pashto = 'سارې خپل نوي ښوونځي ته ننوته. هغه وویریدله خو خوشحاله وه.';
            sp0.dari   = sp0.pashto; // keep compat slot in sync
          }
        }
      }

      // TEST 3: First paragraph of first topic — proves topic studio render
      if (typeof TOPIC_STUDIO_DATA !== 'undefined' && TOPIC_STUDIO_DATA.length > 0) {
        var t0 = TOPIC_STUDIO_DATA[0];
        if (t0 && t0.paragraphs && t0.paragraphs.length > 0) {
          var tp0 = t0.paragraphs[0];
          if (!tp0.pashto) {
            tp0.pashto = 'زه یوه لویه ښار کې اوسیږم چیرې چې ډیر بیلابیل خلک ژوند کوي.';
            tp0.dari   = tp0.pashto; // keep compat slot in sync
          }
        }
      }

      // TEST 4: First listen sentence — proves listen-repeat render
      if (typeof LISTEN_SENTENCES !== 'undefined' && LISTEN_SENTENCES.length > 0) {
        var ls0 = LISTEN_SENTENCES[0];
        if (!ls0.pashto) {
          ls0.pashto = 'سهار مو پخیر! نن تاسو سته یاست؟';
          ls0.dari   = ls0.pashto; // keep compat slot in sync
        }
      }
    } catch (e) {
      console.warn('[PashtoDisplayShell] Test string injection error:', e);
    }
  }

  // ------------------------------------------------------------------
  // SECTION 7 — EXPORT
  // Export under both convenience and namespaced names so any future
  // render code or content-loading code can reference them safely.
  // ------------------------------------------------------------------

  window.getPashtoText         = getPashtoText;
  window.getPashtoSupportText  = getPashtoText;    // alias used by pashto-only-migration.js
  window.renderPashtoLine      = renderPashtoLine;
  window.normalizePashtoFields = normalizePashtoFields;
  window.collectMissingPashto  = collectMissingPashto;
  window.zirakActiveStudentInfo = zirakActiveStudentInfo;

  window.zirakPashtoShell = {
    getPashtoText:          getPashtoText,
    getPashtoSupportText:   getPashtoText,
    renderPashtoLine:       renderPashtoLine,
    normalizePashtoFields:  normalizePashtoFields,
    collectMissingPashto:   collectMissingPashto,
    fixInterviewNormalization: fixInterviewNormalization,
    zirakActiveStudentInfo: zirakActiveStudentInfo,
    version:                'v1.17D1'
  };

  // ------------------------------------------------------------------
  // SECTION 8 — INIT
  // Wait for DOMContentLoaded so all content arrays are fully populated
  // before injecting test strings or building the report.
  // ------------------------------------------------------------------

  document.addEventListener('DOMContentLoaded', function () {
    // Fix the interview variable-name mismatch from v1.17C
    fixInterviewNormalization();

    // Inject proof-of-concept test strings
    injectTestPashtoStrings();

    // Build and store missing-Pashto report
    try {
      var report = collectMissingPashto();
      window.zirakMissingPashtoReport = report;

      var dlgMissing   = report.dialogues.missingPromptPashto.length;
      var topicMissing = report.topics.missingPashto.length;
      var storyMissing = report.stories.missingPashto.length;
      var listenMissing = report.listening.missingPashto.length;
      var totalMissing = dlgMissing + topicMissing + storyMissing + listenMissing;

      console.log(
        '[PashtoDisplayShell v1.17D1] Report ready.' +
        ' Dialogues missing: ' + dlgMissing +
        ' | Topics: ' + topicMissing +
        ' | Stories: ' + storyMissing +
        ' | Listen: ' + listenMissing +
        ' | TOTAL: ' + totalMissing
      );
    } catch (e) {
      console.warn('[PashtoDisplayShell v1.17D1] Report error:', e);
    }
  });

  console.log('[PashtoDisplayShell v1.17D1] Helpers registered.');

})();
// ===================================================================
// END pashto-display-shell.js  (v1.17D1)
// ===================================================================
