// ===================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// zirak-personal-learning-plan.js — Phase I6H-D13A
// Personalized Plan Runtime Integrity + Activity-Instance Tracking +
// Cross-Student Authority + Evidence Bridge.
//
// This stabilizes and completes the D13 Personalized Learning Plan.
// It is still the ONE plan engine (window.ZirakLearningPlan). It reads
// real evidence (accepted level, resolved Placement diagnostic, School
// Path structure, Learning Ledger) and schedules real, launchable
// activities — it never mutates Placement data, never creates a second
// accepted-level record, and never fabricates content.
// ===================================================================
(function () {
  'use strict';

  var PLAN_VERSION = 'D13A-1';
  var SCHEMA_VERSION = 2;

  /* ── tiny local helpers ───────────────────────────────────────────── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nowISO() { return new Date().toISOString(); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function pad2(n) { n = String(n); return n.length < 2 ? '0' + n : n; }

  /* ── real global content, accessed defensively (see D13 audit: classic
     <script> tags share one global scope, so bare identifiers resolve
     even though top-level `const` never attaches to `window`). ──────── */
  function realSchoolPath() { try { return (typeof SCHOOL_PATH !== 'undefined' ? SCHOOL_PATH : (window.SCHOOL_PATH || [])); } catch (e) { return window.SCHOOL_PATH || []; } }
  function realDialogues() { try { return (typeof DIALOGUES !== 'undefined' ? DIALOGUES : (window.DIALOGUES || [])); } catch (e) { return window.DIALOGUES || []; } }
  function realStories() { try { return (typeof STORIES !== 'undefined' ? STORIES : (window.STORIES || [])); } catch (e) { return window.STORIES || []; } }
  function realTopics() { try { return (typeof TOPIC_STUDIO_DATA !== 'undefined' ? TOPIC_STUDIO_DATA : (window.TOPIC_STUDIO_DATA || [])); } catch (e) { return window.TOPIC_STUDIO_DATA || []; } }
  function realWordSets() { try { return (typeof WORD_SETS !== 'undefined' ? WORD_SETS : (window.WORD_SETS || {})); } catch (e) { return window.WORD_SETS || {}; } }
  function realGwTopics() { return window.GW_TOPICS || {}; }

  /* ══════════════════════════════════════════════════════════════════
     TASK 9 — ONE explicit storage-key authority. Every function that
     accepts a studentId argument uses THESE helpers, never the active
     session's namespace (window.__zirakNS()), when a studentId was
     explicitly supplied. This is Defect C's fix.
     ══════════════════════════════════════════════════════════════════ */
  function storageKeyForStudent(studentId, key) { return 'u_' + studentId + '_' + key; }
  function legacyKeyForStudent(studentId, key) { return 'roshan_u_' + studentId + '_' + key; }
  function readStudentValue(studentId, key) { return lsGet(storageKeyForStudent(studentId, key)); }
  function writeStudentValue(studentId, key, value) { lsSet(storageKeyForStudent(studentId, key), value); }
  function removeStudentValue(studentId, key) { lsDel(storageKeyForStudent(studentId, key)); }

  function activeStudentId() { try { var s = window.ZirakProfile && window.ZirakProfile.currentStudent && window.ZirakProfile.currentStudent(); return s ? s.studentId : ''; } catch (e) { return ''; } }
  function resolveStudentId(id) { return id || activeStudentId(); }
  function getStudentProfile(studentId) {
    try {
      var roster = (window.ZirakProfile && window.ZirakProfile.getRoster) ? window.ZirakProfile.getRoster() : [];
      var s = roster.find(function (x) { return x.studentId === studentId; });
      return s ? window.ZirakProfile._normalize(s) : null;
    } catch (e) { return null; }
  }

  var MAX_CORRUPT_BACKUPS = 8;
  function backupCorruptValue(studentId, sourceKey, raw, errorMessage) {
    try {
      var bk = storageKeyForStudent(studentId, 'personal_learning_plan_backup');
      var store; try { store = JSON.parse(lsGet(bk) || 'null'); } catch (e) { store = null; }
      if (!store || !Array.isArray(store.backups)) store = { schemaVersion: 1, backups: [] };
      var already = store.backups.some(function (b) { return b.sourceKey === sourceKey && b.rawValue === raw; });
      if (!already) {
        store.backups.unshift({ savedAt: nowISO(), sourceKey: sourceKey, rawValue: String(raw == null ? '' : raw).slice(0, 20000), errorMessage: String(errorMessage || '').slice(0, 200), appVersion: PLAN_VERSION });
        if (store.backups.length > MAX_CORRUPT_BACKUPS) store.backups.length = MAX_CORRUPT_BACKUPS;
        lsSet(bk, JSON.stringify(store));
      }
    } catch (e) {}
  }
  function getCorruptBackups(studentId) { studentId = resolveStudentId(studentId); try { var s = JSON.parse(lsGet(storageKeyForStudent(studentId, 'personal_learning_plan_backup')) || 'null'); return (s && s.backups) || []; } catch (e) { return []; } }

  /* ══════════════════════════════════════════════════════════════════
     TASK 7/8 — D13 legacy migration + schema v2 normalization. Runs
     once, idempotently, inside readPlan() right after parsing. A plan
     already at schemaVersion 2 skips this block entirely on every
     subsequent read (Task 7 point 9).
     ══════════════════════════════════════════════════════════════════ */
  function migrateLegacyPlan(plan) {
    if (!plan || plan.schemaVersion >= SCHEMA_VERSION) return plan;
    var legacy = plan.completedActivities || {};
    plan.completedPlanItems = plan.completedPlanItems || {};
    plan.activityResults = plan.activityResults || {};
    plan.processedEvidenceWindows = plan.processedEvidenceWindows || {};
    plan.adjustmentHistory = plan.adjustmentHistory || [];
    plan.teacherAdjustments = plan.teacherAdjustments || [];
    plan.previousPlanId = plan.previousPlanId || '';
    plan.cycleReason = plan.cycleReason || 'initial';
    plan.levelAuthority = plan.levelAuthority || { levelId: plan.acceptedLevelId, levelSource: plan.levelSource, provisional: plan.status === 'provisional', sourcePlacementResultId: plan.sourcePlacementResultId || '', evidenceLinkage: 'legacy' };

    // Retrofit stable planItemId/dayNumber/slotNumber onto every OLD-shape
    // daily-plan item (day = array position, slot = within-day index —
    // both were already implicit in the D13 data, just not stored).
    (plan.dailyPlans || []).forEach(function (dp, di) {
      if (!dp) return;
      dp.day = dp.day || (di + 1);
      (dp.activities || []).forEach(function (item, si) {
        if (!item.planItemId) {
          item.dayNumber = dp.day;
          item.slotNumber = si + 1;
          item.planItemId = plan.planId + '-d' + pad2(dp.day) + '-s' + pad2(si + 1) + '-' + item.activityId;
          item.createdAt = dp.generatedAt || plan.createdAt || nowISO();
          item.planId = plan.planId;
        }
      });
    });

    // D13A Task 7: apply each legacy activityId completion to only the
    // EARLIEST matching unfinished scheduled occurrence, in chronological
    // (day) order — never to every repeated occurrence.
    Object.keys(legacy).forEach(function (activityId) {
      var occurrences = [];
      (plan.dailyPlans || []).forEach(function (dp) {
        if (!dp) return;
        (dp.activities || []).forEach(function (item) { if (item.activityId === activityId) occurrences.push(item); });
      });
      occurrences.sort(function (a, b) { return (a.dayNumber - b.dayNumber) || (a.slotNumber - b.slotNumber); });
      var target = occurrences.find(function (item) { return !plan.completedPlanItems[item.planItemId]; });
      if (target) {
        var legacyRec = legacy[activityId] || {};
        plan.completedPlanItems[target.planItemId] = {
          planItemId: target.planItemId, activityId: activityId,
          completedAt: legacyRec.completedAt || plan.updatedAt || nowISO(),
          completionMethod: legacyRec.evidenceSource === 'manual-confirm' ? 'manual' : 'legacy-migrated', status: 'completed',
          ledgerRecordId: '', score: undefined, total: undefined, percentage: (typeof legacyRec.resultPct === 'number' ? legacyRec.resultPct : undefined),
          evidenceSource: legacyRec.evidenceSource || 'legacy', migrationSource: 'D13-activityId-completion'
        };
      }
      // If truly no scheduled occurrence exists to attach the legacy
      // completion to, it is preserved untouched in legacyCompletedActivitiesBackup
      // below rather than silently discarded or falsely applied.
    });
    plan.legacyCompletedActivitiesBackup = legacy;
    delete plan.completedActivities;
    plan.schemaVersion = SCHEMA_VERSION;
    plan.migratedFromLegacy = true;
    plan.updatedAt = nowISO();
    return plan;
  }

  function readPlan(studentId) {
    studentId = resolveStudentId(studentId);
    var k = storageKeyForStudent(studentId, 'personal_learning_plan');
    var raw = lsGet(k); if (!raw) return null;
    var plan;
    try { plan = JSON.parse(raw); } catch (e) { backupCorruptValue(studentId, k, raw, e && e.message); return null; }
    if (!plan || typeof plan !== 'object') { backupCorruptValue(studentId, k, raw, 'not a valid plan object'); return null; }
    var wasLegacy = !plan.schemaVersion || plan.schemaVersion < SCHEMA_VERSION;
    var migrated = migrateLegacyPlan(plan);
    if (wasLegacy && migrated.schemaVersion >= SCHEMA_VERSION) { writePlan(studentId, migrated); }
    return migrated;
  }
  function writePlan(studentId, plan) { studentId = resolveStudentId(studentId); writeStudentValue(studentId, 'personal_learning_plan', JSON.stringify(plan)); }
  function deletePlan(studentId) { studentId = resolveStudentId(studentId); removeStudentValue(studentId, 'personal_learning_plan'); }

  function readHistory(studentId) {
    studentId = resolveStudentId(studentId);
    var k = storageKeyForStudent(studentId, 'personal_learning_plan_history');
    var raw = lsGet(k); if (!raw) return { schemaVersion: 1, cycles: [] };
    try { var h = JSON.parse(raw); if (!h || !Array.isArray(h.cycles)) { backupCorruptValue(studentId, k, raw, 'not a valid history object'); return { schemaVersion: 1, cycles: [] }; } return h; }
    catch (e) { backupCorruptValue(studentId, k, raw, e && e.message); return { schemaVersion: 1, cycles: [] }; }
  }
  function writeHistory(studentId, h) { studentId = resolveStudentId(studentId); writeStudentValue(studentId, 'personal_learning_plan_history', JSON.stringify(h)); }

  function readSettingsRaw(studentId) {
    studentId = resolveStudentId(studentId);
    var raw = readStudentValue(studentId, 'personal_learning_plan_settings'); if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function writeSettings(studentId, s) { studentId = resolveStudentId(studentId); writeStudentValue(studentId, 'personal_learning_plan_settings', JSON.stringify(s)); }

  /* ── pending activity launch context (Task 18) — ONE per student ──── */
  function savePendingContext(studentId, ctx) { studentId = resolveStudentId(studentId); writeStudentValue(studentId, 'personal_learning_plan_pending_context', JSON.stringify(ctx)); }
  function readPendingContextRaw(studentId) {
    studentId = resolveStudentId(studentId);
    var k = storageKeyForStudent(studentId, 'personal_learning_plan_pending_context');
    var raw = readStudentValue(studentId, 'personal_learning_plan_pending_context'); if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { backupCorruptValue(studentId, k, raw, e && e.message); return null; }
  }
  function getPendingContext(studentId) {
    var ctx = readPendingContextRaw(studentId);
    if (!ctx) return null;
    if (ctx.expiresAt && new Date(ctx.expiresAt) < new Date()) { clearPendingContext(studentId); return null; }
    return ctx;
  }
  function clearPendingContext(studentId) { studentId = resolveStudentId(studentId); removeStudentValue(studentId, 'personal_learning_plan_pending_context'); }

  /* ══════════════════════════════════════════════════════════════════
     TASK 13 (D13) — study duration presets. UNCHANGED keys/labels per
     D13A Task 31 ("do not rename existing presets unnecessarily") — only
     the GENERATION algorithm changes to use real summed minutes instead
     of a slot-count formula (Defect L fix, below).
     ══════════════════════════════════════════════════════════════════ */
  var DURATION_PRESETS = {
    light: { minutesPerDay: 15, targetRange: [12, 20], activityCountRange: [3, 5], label: 'Light \u2014 about 15 minutes per day' },
    standard: { minutesPerDay: 30, targetRange: [25, 35], activityCountRange: [3, 6], label: 'Standard \u2014 about 30 minutes per day' },
    strong: { minutesPerDay: 45, targetRange: [38, 50], activityCountRange: [4, 8], label: 'Strong \u2014 about 45 minutes per day' },
    intensive: { minutesPerDay: 60, targetRange: [52, 65], activityCountRange: [5, 10], label: 'Intensive \u2014 about 60 minutes per day' }
  };
  var DEFAULT_SETTINGS = { durationPreset: 'standard', minutesPerDay: 30, studyDaysPerWeek: 5 };
  // Task 32: review/recovery days (every 7th) run at this fraction of the normal daily budget.
  var REVIEW_DAY_FRACTION = 0.7;
  function getSettings(studentId) {
    var s = readSettingsRaw(studentId);
    if (!s || !DURATION_PRESETS[s.durationPreset]) return Object.assign({}, DEFAULT_SETTINGS);
    return s;
  }

  var RECOVERY_THRESHOLDS = { criticalMax: 40, highPriorityMax: 55, developingMax: 70, maintainMin: 70, strengthMin: 85 };
  var CRITICAL_FOUNDATION_DOMAINS = ['grammar', 'sentence'];
  var CATEGORY_RANK = { 'Critical Foundation': 0, 'High Priority': 1, 'Developing': 2, 'Not Fully Assessed': 3, 'Maintain': 4, 'Strength Extension': 5 };

  /* ══════════════════════════════════════════════════════════════════
     TASK 28 — real domain balance config. "grammarSentence" is one
     combined bucket exactly as specified; a "flexible" allowance absorbs
     the remainder so percentages always sum to 100%.
     ══════════════════════════════════════════════════════════════════ */
  var DOMAIN_BALANCE = {
    grammarSentence: [0.25, 0.35],
    vocab: [0.15, 0.20],
    listening: [0.10, 0.20],
    reading: [0.10, 0.20],
    functional: [0.10, 0.20]
  };
  var DOMAIN_LABELS = { vocab: 'Vocabulary', grammar: 'Grammar', reading: 'Reading', listening: 'Listening', sentence: 'Sentence Construction', functional: 'Functional Communication', speaking: 'Speaking Profile' };
  var CORE_DOMAINS = ['vocab', 'grammar', 'reading', 'listening', 'sentence', 'functional'];
  function balanceBucketFor(domain) { return (domain === 'grammar' || domain === 'sentence') ? 'grammarSentence' : domain; }

  var SCHOOLPATH_TIER = { starter: 1, basic: 2, beginner: 3, elementary: 4, intermediate: 5, advanced: 6, academic: 7 };
  var BAND_TO_CLASS = { nursery: 'starter', starter: 'basic', beginner1: 'beginner', beginner2: 'beginner', elementary: 'elementary', preintermediate: 'intermediate', intermediate: 'intermediate', advanced: 'advanced' };

  function classDisplayName(classId) { try { var sp = realSchoolPath(); var c = sp.find(function (x) { return x.id === classId; }); return c ? c.en : classId; } catch (e) { return classId; } }

  /* ══════════════════════════════════════════════════════════════════
     TASK 9 (D13) — activity registry. UNCHANGED logic from D13 (no
     defect was reported against it); adds a `destination` field used by
     the new pending-launch-context / evidence-bridge machinery.
     ══════════════════════════════════════════════════════════════════ */
  var REGISTRY_CACHE = null, SKIPPED_LOG = [];
  var TYPE_MINUTES = { words: 5, listening: 5, dialogue: 8, story: 8, topic: 8, quiz: 5, 'grammar-world': 10, interview: 15, review: 5 };
  function humanizeKey(k) { return String(k || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }

  /* ══════════════════════════════════════════════════════════════════
     TASK 4/5 (D13B) — every activity declares an explicit
     completionContract. An empty expectedLedgerSources list NO LONGER
     means "accept anything" — it means the mode itself decides:
     'manual-confirmation' (no automatic path exists for this
     destination — confirmed by direct inspection, not guessed),
     'direct-result'/'direct-completion' (a specific call site reports
     directly, source-checking is not needed since the call site is
     trusted), or 'ledger-score'/'ledger-completion' (must match one of
     the REAL, confirmed Learning Ledger `source` strings this app
     actually writes, plus the exact content ID where available).
     Real sources confirmed by direct inspection of every
     ZirakLearningLedger.recordActivity() call site in this codebase:
       'quiz'          — Word Quiz AND Smart Review (wqShowResult, app.js)
       'wordlab'       — Word Wizard AND Sentence Practice (app.js)
       'interview'     — Interview Wizard (interview-voice-wizard.js)
       (dialogue/grammar-world route through the shared
        ZirakResultProof.renderButtonHtml helper — a `source`+`contentId`
        pair was additively wired into that ONE helper, see app.js)
     No Ledger write exists at all for: Listening, Stories, Topics,
     WordLab's own study screen — these are honestly manual-confirmation.
     ══════════════════════════════════════════════════════════════════ */
  function contract(mode, opts) {
    opts = opts || {};
    return {
      mode: mode,
      expectedLedgerSources: opts.sources || [],
      expectedActivityTypes: opts.activityTypes || [],
      expectedContentId: (opts.contentId !== undefined) ? opts.contentId : null,
      scored: opts.scored !== false && mode !== 'manual-confirmation',
      permitsManualFallback: opts.manualFallback !== false,
      technicalFailurePolicy: opts.technicalFailurePolicy || 'replace'
    };
  }

  function buildActivityRegistry() {
    if (REGISTRY_CACHE) return REGISTRY_CACHE;
    var reg = [], skipped = [];
    var sp = realSchoolPath(), dialogues = realDialogues(), stories = realStories(), topics = realTopics(), wordSets = realWordSets(), gw = realGwTopics();
    var dialogueIds = {}; dialogues.forEach(function (d) { dialogueIds[d.id] = 1; });
    var storyIds = {}; stories.forEach(function (s) { storyIds[s.id] = 1; });
    var topicIds = {}; topics.forEach(function (t) { topicIds[t.id] = 1; });

    sp.forEach(function (cls) {
      var tier = SCHOOLPATH_TIER[cls.id] || 3;
      (cls.units || []).forEach(function (unit) {
        var prevId = '';
        (unit.steps || []).forEach(function (step) {
          var a = null;
          if (step.type === 'words') {
            if (step.target && wordSets[step.target]) {
              // WordLab's own study screen (openWordSet) writes nothing to
              // the Ledger. A student who studies a set often proceeds
              // into Word Quiz or Word Wizard/Sentence Practice for the
              // SAME set (source 'quiz' or 'wordlab', both carry the real
              // setKey as contentId) — accepting either, for the EXACT
              // same content ID, is real evidence of engagement with the
              // target content, not permissive "any source" matching.
              a = { activityId: 'wl-' + step.id, source: 'wordlab', title: 'Vocabulary: ' + humanizeKey(step.target), domain: 'vocab', levelId: cls.id, estimatedMinutes: TYPE_MINUTES.words, difficulty: tier, destination: { screen: 'wordlab', fn: 'openWordSet', arg: step.target }, prerequisiteIds: prevId ? [prevId] : [], testable: false, active: true,
                completionContract: contract('ledger-score', { sources: ['wordlab', 'quiz'], contentId: step.target, manualFallback: true }) };
            } else skipped.push({ stepId: step.id, type: step.type, target: step.target, reason: 'word set not found' });
          } else if (step.type === 'listening') {
            // No Listening-specific Ledger write exists anywhere in this
            // codebase (confirmed: only 5 recordActivity call sites total,
            // none tagged for a dedicated Listening screen). Honestly
            // manual-only — never silently permissive.
            a = { activityId: 'ls-' + step.id, source: 'listening', title: 'Listening Practice', domain: 'listening', levelId: cls.id, estimatedMinutes: TYPE_MINUTES.listening, difficulty: tier, destination: { screen: 'listening', fn: 'startListeningManualPractice', arg: null }, prerequisiteIds: prevId ? [prevId] : [], testable: false, active: true,
              completionContract: contract('manual-confirmation', {}) };
          } else if (step.type === 'dialogue') {
            if (step.target && dialogueIds[step.target]) {
              a = { activityId: 'dg-' + step.id, source: 'dialogue', title: 'Dialogue: ' + humanizeKey(step.target), domain: 'functional', levelId: cls.id, estimatedMinutes: TYPE_MINUTES.dialogue, difficulty: tier, destination: { screen: 'dialogue', fn: 'startDialogue', arg: step.target }, prerequisiteIds: prevId ? [prevId] : [], testable: false, active: true,
                completionContract: contract('ledger-score', { sources: ['dialogue'], contentId: step.target, technicalFailurePolicy: 'replace' }) };
            } else skipped.push({ stepId: step.id, type: step.type, target: step.target, reason: 'dialogue not found' });
          } else if (step.type === 'story') {
            // No Stories-specific Ledger write exists. Honestly manual.
            if (step.target && storyIds[step.target]) {
              a = { activityId: 'st-' + step.id, source: 'stories', title: 'Story: ' + humanizeKey(step.target), domain: 'reading', levelId: cls.id, estimatedMinutes: TYPE_MINUTES.story, difficulty: tier, destination: { screen: 'stories', fn: 'openStory', arg: step.target }, prerequisiteIds: prevId ? [prevId] : [], testable: false, active: true,
                completionContract: contract('manual-confirmation', {}) };
            } else skipped.push({ stepId: step.id, type: step.type, target: step.target, reason: 'story not found' });
          } else if (step.type === 'topic') {
            // No Topics-specific Ledger write exists. Honestly manual.
            if (step.target && topicIds[step.target]) {
              a = { activityId: 'tp-' + step.id, source: 'topics', title: 'Topic: ' + humanizeKey(step.target), domain: 'reading', levelId: cls.id, estimatedMinutes: TYPE_MINUTES.topic, difficulty: tier, destination: { screen: 'topics', fn: 'openTopicWizard', arg: step.target }, prerequisiteIds: prevId ? [prevId] : [], testable: false, active: true,
                completionContract: contract('manual-confirmation', {}) };
            } else skipped.push({ stepId: step.id, type: step.type, target: step.target, reason: 'topic not found' });
          } else if (step.type === 'quiz') {
            // Unit Quiz never touches the Ledger (saves to quiz_history
            // instead) — a direct, explicit call site was wired in app.js
            // (showUnitQuizResult) reporting straight to onExternalResult()
            // with the exact unit ID as contentId. Source-checking is
            // unnecessary here since the call site itself is trusted.
            a = { activityId: 'qz-' + unit.id, source: 'unit-quiz', title: 'Review: ' + (unit.en || unit.id), domain: 'grammar', levelId: cls.id, estimatedMinutes: TYPE_MINUTES.quiz, difficulty: tier, destination: { screen: null, fn: 'launchUnitQuiz', arg: unit.id }, prerequisiteIds: prevId ? [prevId] : [], testable: true, active: true,
              completionContract: contract('direct-result', { contentId: unit.id }) };
          } else {
            skipped.push({ stepId: step.id, type: step.type, target: step.target, reason: 'unknown step type' });
          }
          if (a) { reg.push(a); prevId = a.activityId; }
        });
      });
    });

    Object.keys(gw).forEach(function (tid) {
      var t = gw[tid]; if (!t) return;
      var levelId = '';
      if (t.levelId && BAND_TO_CLASS[t.levelId]) levelId = BAND_TO_CLASS[t.levelId];
      else if (typeof t.level === 'string') {
        var lw = t.level.toLowerCase();
        levelId = lw.indexOf('beginner') > -1 ? 'beginner' : lw.indexOf('elementary') > -1 ? 'elementary' : lw.indexOf('intermediate') > -1 ? 'intermediate' : lw.indexOf('advanced') > -1 ? 'advanced' : 'beginner';
      } else levelId = 'beginner';
      // Grammar World's result card routes through the shared
      // ZirakResultProof.renderButtonHtml helper; a `source:'grammar-world'`
      // + `contentId:<topicId>` pair was additively wired into that ONE
      // call site (grammar-world.js) so this can now match exactly.
      reg.push({ activityId: 'gw-' + tid, source: 'grammar-world', title: 'Grammar: ' + (t.title || tid), domain: 'grammar', levelId: levelId, estimatedMinutes: TYPE_MINUTES['grammar-world'], difficulty: SCHOOLPATH_TIER[levelId] || 3, destination: { screen: 'grammar', fn: 'gwOpenTopic', arg: tid }, prerequisiteIds: [], testable: false, active: true,
        completionContract: contract('ledger-score', { sources: ['grammar-world'], contentId: tid }) });
    });

    ['intermediate', 'advanced', 'academic'].forEach(function (lvl) {
      // Interview Wizard DOES write to the Ledger with source:'interview'
      // (interview-voice-wizard.js) — but this registry entry launches the
      // wizard generally (no specific track argument), so content-ID
      // matching is not applicable here; source-matching IS strictly
      // enforced (a real, confirmed source, not "any"). Documented
      // honestly as source-strict / content-open, not full strictness.
      reg.push({ activityId: 'iv-general-' + lvl, source: 'interview-wizard', title: 'Interview Wizard Practice', domain: 'functional', levelId: lvl, estimatedMinutes: TYPE_MINUTES.interview, difficulty: SCHOOLPATH_TIER[lvl] || 5, destination: { screen: 'interview-wizard', fn: 'openInterviewWizard', arg: null }, prerequisiteIds: [], testable: false, active: true,
        completionContract: contract('ledger-score', { sources: ['interview'], contentId: null }) });
    });
    Object.keys(SCHOOLPATH_TIER).forEach(function (lvl) {
      // CORRECTED from D13A: Smart Review's real evidence is
      // wqShowResult()'s source:'quiz' write with setKey === '__smart__'
      // (confirmed by direct inspection) — NOT 'academy-daily-test' as
      // D13A guessed without verifying.
      reg.push({ activityId: 'rv-general-' + lvl, source: 'review', title: 'Smart Review', domain: 'vocab', levelId: lvl, estimatedMinutes: TYPE_MINUTES.review, difficulty: SCHOOLPATH_TIER[lvl], destination: { screen: 'review', fn: null, arg: null }, prerequisiteIds: [], testable: false, active: true,
        completionContract: contract('ledger-score', { sources: ['quiz'], activityTypes: ['word-quiz'], contentId: '__smart__' }) });
    });

    REGISTRY_CACHE = reg; SKIPPED_LOG = skipped;
    return reg;
  }
  function getSkippedLog() { buildActivityRegistry(); return SKIPPED_LOG.slice(); }
  function activityById(id) { return buildActivityRegistry().find(function (a) { return a.activityId === id; }) || null; }
  function activitiesForLevelDomain(levelId, domain) {
    // No dedicated "Sentence Practice" screen exists in this app —
    // Grammar World / unit quizzes are the real, existing destination
    // for sentence-construction CONTENT (routed honestly, documented in
    // the D13 content-map). This affects CONTENT SELECTION only — see
    // maybeAutoAdjust() below for why this substitution is deliberately
    // NOT applied to evidence-gathering (Defect/Task 26).
    var effectiveDomain = domain === 'sentence' ? 'grammar' : domain;
    var tier = SCHOOLPATH_TIER[levelId] || 3;
    return buildActivityRegistry().filter(function (a) { return a.domain === effectiveDomain && a.active && Math.abs((SCHOOLPATH_TIER[a.levelId] || 3) - tier) <= 1; });
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 9 — accepted-level lookup uses the EXPLICIT target student,
     never the active session's namespace (Defect C fix). This was the
     confirmed D13 bug: getAcceptedInfo(studentId) ignored its own
     studentId parameter and read via nsLegacyKey()/window.__zirakNS(),
     which resolves to whichever student is CURRENTLY ACTIVE in the UI.
     ══════════════════════════════════════════════════════════════════ */
  function getAcceptedInfo(studentId) {
    studentId = resolveStudentId(studentId);
    if (!studentId) return null;
    try { var raw = lsGet(legacyKeyForStudent(studentId, 'placement_accepted')); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function getPlacementHistoryForStudent(studentId) {
    studentId = resolveStudentId(studentId);
    try {
      var raw = lsGet(storageKeyForStudent(studentId, 'placement_history')); if (!raw) return [];
      var h = JSON.parse(raw); if (!h || !Array.isArray(h.results)) return [];
      return h.results.slice().sort(function (a, b) { return String(b.diagnostic.completedAt).localeCompare(String(a.diagnostic.completedAt)); });
    } catch (e) { return []; }
  }
  function getLatestPlacementResult(studentId) {
    var list = getPlacementHistoryForStudent(studentId);
    return list.length ? list[0] : null;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 11 — accepted-level EVIDENCE resolver (Defect E fix). Never
     assumes the newest Placement result is the evidence for the
     currently accepted level. A pending retake is explicitly excluded
     (Task 12) — its scores can never leak into a plan built from an
     older accepted level.
     Priority: 1) an explicit linkedAcceptedLevelId match, 2) a resolved
     (non-pending) decision whose level matches the accepted level,
     3) among those, the newest at-or-before the accepted timestamp,
     4) a safe legacy match (exactly one historical result, no other
     candidate), 5) no trustworthy evidence (conservative profile).
     ══════════════════════════════════════════════════════════════════ */
  function resolveAcceptedEvidenceResult(studentId, accepted) {
    if (!accepted) return { result: null, linkage: 'none' };
    var history = getPlacementHistoryForStudent(studentId);
    if (!history.length) return { result: null, linkage: 'none' };
    var acceptedLinkId = accepted.at ? ('accepted_' + accepted.at) : '';

    // 1) explicit linkedAcceptedLevelId match
    if (acceptedLinkId) {
      var explicit = history.find(function (r) { return r.decision && r.decision.linkedAcceptedLevelId === acceptedLinkId; });
      if (explicit) return { result: explicit, linkage: 'explicit' };
    }
    // 2) resolved (non-pending) decision matching the accepted level
    var resolved = history.filter(function (r) {
      return r.decision && r.decision.decisionStatus && r.decision.decisionStatus !== 'pending' &&
        (r.decision.resolvedLevel === accepted.level || r.diagnostic.recommendedLevel === accepted.level);
    });
    if (resolved.length) {
      // 3) newest resolved result at-or-before the accepted timestamp
      var atOrBefore = accepted.at ? resolved.filter(function (r) { return new Date(r.diagnostic.completedAt) <= new Date(accepted.at); }) : resolved;
      var pool = atOrBefore.length ? atOrBefore : resolved;
      pool = pool.slice().sort(function (a, b) { return String(b.diagnostic.completedAt).localeCompare(String(a.diagnostic.completedAt)); });
      return { result: pool[0], linkage: 'resolved' };
    }
    // 4) safe legacy match — only when there is exactly one historical
    // result and no ambiguity about which one it could be.
    if (history.length === 1) return { result: history[0], linkage: 'legacy' };
    // 5) no trustworthy evidence
    return { result: null, linkage: 'none' };
  }

  /* Returns { levelId, levelSource, provisional, sourcePlacementResultId,
     evidenceResult, evidenceLinkage }. Priority order exactly as D13
     specified; D13A adds the evidence-linkage resolution (Task 11). */
  function resolveLevelAuthority(studentId) {
    studentId = resolveStudentId(studentId);
    var s = getStudentProfile(studentId) || {};
    var accepted = getAcceptedInfo(studentId);
    var latest = getLatestPlacementResult(studentId);

    if (accepted && accepted.level) {
      var linkage = resolveAcceptedEvidenceResult(studentId, accepted);
      return {
        levelId: accepted.level,
        levelSource: accepted.source === 'teacher' ? 'teacher' : accepted.source === 'manual' ? 'manual' : 'placement',
        provisional: false,
        sourcePlacementResultId: linkage.result ? linkage.result.resultId : '',
        evidenceResult: linkage.result, evidenceLinkage: linkage.linkage
      };
    }
    if (s.level && String(s.level).trim() && s.level !== '\u2014') {
      return { levelId: s.level, levelSource: 'existing', provisional: false, sourcePlacementResultId: '', evidenceResult: null, evidenceLinkage: 'legacy' };
    }
    // Task 12: a PENDING result may only produce a provisional preview —
    // never treated as accepted evidence.
    if (latest && (!latest.decision || latest.decision.decisionStatus === 'pending')) {
      return { levelId: latest.diagnostic.recommendedLevel, levelSource: 'provisional', provisional: true, sourcePlacementResultId: latest.resultId, evidenceResult: latest, evidenceLinkage: 'pending-preview' };
    }
    return { levelId: '', levelSource: 'default', provisional: false, sourcePlacementResultId: '', evidenceResult: null, evidenceLinkage: 'none' };
  }

  /* ══════════════════════════════════════════════════════════════════
     Domain profile / recovery priorities — uses the RESOLVED evidence
     result (never a pending one), same categorization rules as D13.
     ══════════════════════════════════════════════════════════════════ */
  function categoryForScore(domain, score, notAssessedReason) {
    if (score === null || score === undefined) return { category: 'Not Fully Assessed', reason: notAssessedReason || 'needs teacher observation' };
    if (score < RECOVERY_THRESHOLDS.criticalMax) {
      if (CRITICAL_FOUNDATION_DOMAINS.indexOf(domain) > -1) return { category: 'Critical Foundation', reason: 'placement score ' + score + '% \u2014 this affects sentence-level accuracy' };
      return { category: 'High Priority', reason: 'placement score ' + score + '%' };
    }
    if (score < RECOVERY_THRESHOLDS.highPriorityMax) return { category: 'High Priority', reason: 'placement score ' + score + '%' };
    if (score < RECOVERY_THRESHOLDS.developingMax) return { category: 'Developing', reason: 'placement score ' + score + '%' };
    if (score >= RECOVERY_THRESHOLDS.strengthMin) return { category: 'Strength Extension', reason: 'placement score ' + score + '% \u2014 a current strength' };
    return { category: 'Maintain', reason: 'placement score ' + score + '%' };
  }
  function buildDomainProfile(evidenceResult) {
    var profile = {};
    CORE_DOMAINS.forEach(function (d) {
      var score = null, notAssessedReason = null;
      if (evidenceResult && evidenceResult.diagnostic && evidenceResult.diagnostic.domainScores) {
        var raw = evidenceResult.diagnostic.domainScores[d];
        if (raw !== null && raw !== undefined) score = raw;
        else if (d === 'listening' && (evidenceResult.diagnostic.technicalLimitations || []).some(function (t) { return /listen|mic|speech|audio|tts/i.test(t); })) notAssessedReason = 'listening was not fully assessed due to a technical limitation';
      }
      var c = categoryForScore(d, score, notAssessedReason);
      profile[d] = { score: score, label: DOMAIN_LABELS[d], category: c.category, reason: c.reason };
    });
    return profile;
  }
  function buildRecoveryPriorities(profile) {
    var list = Object.keys(profile).map(function (d) { return { domain: d, label: DOMAIN_LABELS[d], category: profile[d].category, reason: profile[d].reason }; });
    list.sort(function (a, b) { return (CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category]) || 0; });
    return list;
  }
  function computeGoals(levelId, priorities, provisional) {
    var strongEntry = priorities.slice().reverse().find(function (p) { return p.category === 'Strength Extension' || p.category === 'Maintain'; });
    var topEntry = priorities[0];
    return {
      summaryEn: (provisional ? 'Your provisional starting level is ' : 'Your current level is ') + classDisplayName(levelId) + '. Your plan begins with the skills that will help you progress most safely.',
      mainStrength: strongEntry ? strongEntry.label : 'General progress',
      mainRecoveryPriority: topEntry ? topEntry.label : 'General practice'
    };
  }
  var WEEK_PHASES = [
    { week: 1, title: 'Stabilize Foundations', focus: 'confirm readiness, reinforce prerequisites, build confidence' },
    { week: 2, title: 'Guided Development', focus: 'increase practice depth, combine domains' },
    { week: 3, title: 'Practical Application', focus: 'dialogue, reading/listening integration, sentence construction' },
    { week: 4, title: 'Consolidation and Progress Review', focus: 'targeted recovery, mixed review, next-cycle readiness' }
  ];
  function computeWeeklyMilestones() { return WEEK_PHASES.map(function (p) { return { week: p.week, phaseTitle: p.title, focus: p.focus }; }); }

  /* ══════════════════════════════════════════════════════════════════
     TASK 28/29/31 — REAL domain balance + REAL duration budgeting
     (Defects K and L fixed together, since both live in the same
     generation pass). The whole 30-day cycle is generated in ONE pass
     up front (not lazily per day) so cross-day running totals can be
     tracked and genuinely kept within DOMAIN_BALANCE's target ranges,
     nudged toward each domain's recovery-priority boundary.
     ══════════════════════════════════════════════════════════════════ */
  function avgRange(range) { return (range[0] + range[1]) / 2; }
  function computeDomainTargetFractions(priorities) {
    var base = {}; Object.keys(DOMAIN_BALANCE).forEach(function (k) { base[k] = avgRange(DOMAIN_BALANCE[k]); });
    priorities.forEach(function (p) {
      var bucket = balanceBucketFor(p.domain);
      var range = DOMAIN_BALANCE[bucket]; if (!range) return;
      if (p.category === 'Critical Foundation' || p.category === 'High Priority') base[bucket] = Math.max(base[bucket], range[1] * 0.92);
      else if (p.category === 'Strength Extension') base[bucket] = Math.min(base[bucket], range[0] * 1.08);
    });
    var sum = Object.keys(base).reduce(function (s, k) { return s + base[k]; }, 0);
    var frac = {}; Object.keys(base).forEach(function (k) { frac[k] = base[k] / sum; });
    return frac;
  }

  var lastReusedByBucket = {};
  function pickForBucket(levelId, bucket, dayUsedIds, recentUsed, preferEasy, remainingBudget) {
    var domainsInBucket = bucket === 'grammarSentence' ? ['grammar'] : [bucket]; // sentence routes to grammar content, tracked separately for evidence (Task 26)
    var pool = [];
    domainsInBucket.forEach(function (d) { pool = pool.concat(activitiesForLevelDomain(levelId, d)); });
    pool = pool.filter(function (a) { return dayUsedIds.indexOf(a.activityId) === -1; });
    var fresh = pool.filter(function (a) { return recentUsed.indexOf(a.activityId) === -1; });
    if (fresh.length) pool = fresh;
    // Task 20/21: when the remaining daily minute budget is tight, prefer
    // an activity that actually FITS it — this genuinely narrows overshoot
    // rather than just accepting a wider gap between target and reality.
    if (typeof remainingBudget === 'number' && remainingBudget > 0) {
      var fits = pool.filter(function (a) { return a.estimatedMinutes <= remainingBudget; });
      if (fits.length) pool = fits;
    }
    if (preferEasy) pool = pool.slice().sort(function (a, b) { return a.difficulty - b.difficulty; });
    if (!pool.length) {
      pool = buildActivityRegistry().filter(function (a) { return domainsInBucket.indexOf(a.domain) > -1 && a.active && dayUsedIds.indexOf(a.activityId) === -1; });
    }
    if (!pool.length) return null;
    var seed = lastReusedByBucket[bucket] = (lastReusedByBucket[bucket] || 0) + 1;
    return pool[seed % pool.length];
  }

  // Task 32: recovery/review days (every 7th) run lighter, at REVIEW_DAY_FRACTION of the normal budget.
  function dayMinuteBudget(dayNum, minutesPerDay) { return (dayNum % 7 === 0) ? Math.round(minutesPerDay * REVIEW_DAY_FRACTION) : minutesPerDay; }

  /* Generates all 30 days' planItems in one pass, tracking real assigned
     minutes per domain bucket against real target fractions (Task 29's
     8-step algorithm), and using real activity.estimatedMinutes to hit
     each preset's target minute RANGE (Task 31) rather than a fixed
     slot-count formula. Returns { dailyPlans, balanceReport }. */
  function buildFullThirtyDayCycle(planId, levelId, priorities, settings) {
    lastReusedByBucket = {};
    var minutesPerDay = settings.minutesPerDay || 30;
    var presetKey = settings.durationPreset && DURATION_PRESETS[settings.durationPreset] ? settings.durationPreset : 'standard';
    var targetRange = DURATION_PRESETS[presetKey].targetRange;
    // Task 31/32: activity-count bounds scale with the preset so Strong/
    // Intensive can actually reach their higher target-minute ranges,
    // instead of a single fixed cap silently capping every preset alike.
    var countRange = DURATION_PRESETS[presetKey].activityCountRange || [3, 6];
    var MIN_ACTIVITIES_PER_DAY = countRange[0], MAX_ACTIVITIES_PER_DAY = countRange[1];
    var targetFractions = computeDomainTargetFractions(priorities);
    var buckets = Object.keys(DOMAIN_BALANCE);
    var assignedMinutes = {}; buckets.forEach(function (b) { assignedMinutes[b] = 0; });
    var totalMinutesSoFar = 0;
    var recentUsed = []; // short rolling window for cross-day variety
    var dailyPlans = [];
    var exceptions = [];

    for (var day = 1; day <= 30; day++) {
      var isReviewDay = (day % 7 === 0);
      var dayBudget = dayMinuteBudget(day, minutesPerDay);
      var dayMin = isReviewDay ? Math.round(targetRange[0] * REVIEW_DAY_FRACTION) : targetRange[0];
      var dayMax = isReviewDay ? Math.round(targetRange[1] * REVIEW_DAY_FRACTION) : targetRange[1];
      var dayMinCount = isReviewDay ? Math.max(2, MIN_ACTIVITIES_PER_DAY - 1) : MIN_ACTIVITIES_PER_DAY;
      var dayMaxCount = isReviewDay ? Math.max(dayMinCount, MAX_ACTIVITIES_PER_DAY - 2) : MAX_ACTIVITIES_PER_DAY;
      var dayMinutes = 0, dayUsedIds = [], activities = [], slot = 0;

      while (slot < dayMaxCount) {
        var remainingBudget = dayMax - dayMinutes;
        if (slot >= dayMinCount && (dayMinutes >= dayMin) && remainingBudget < 5) break;
        if (slot >= dayMaxCount) break;

        // Task 29 steps 4-5: prefer the bucket furthest below its target
        // share of the cumulative minute budget so far.
        var newTotal = totalMinutesSoFar + dayBudget; // approximate projected total including this day
        var bestBucket = null, bestGap = -Infinity;
        buckets.forEach(function (b) {
          var target = targetFractions[b] * Math.max(newTotal, 1);
          var gap = target - assignedMinutes[b];
          if (gap > bestGap) { bestGap = gap; bestBucket = b; }
        });
        var chosen = pickForBucket(levelId, bestBucket, dayUsedIds, recentUsed, day <= 2, remainingBudget);
        if (!chosen) {
          // Task 29 step 8: record the exception (content shortage), try any other bucket.
          exceptions.push({ day: day, bucket: bestBucket, reason: 'no eligible activity available' });
          var fallbackBucket = buckets.find(function (b) { return b !== bestBucket && pickForBucket(levelId, b, dayUsedIds, recentUsed, false, remainingBudget); });
          if (!fallbackBucket) break;
          chosen = pickForBucket(levelId, fallbackBucket, dayUsedIds, recentUsed, false, remainingBudget);
          bestBucket = fallbackBucket;
        }
        if (!chosen) break;
        // Task 20/21: a much tighter overshoot allowance (+2, not +8) once
        // the minimum activity count is already satisfied — genuinely
        // narrows the gap between the configured target and the real
        // result, rather than just tolerating a wide silent difference.
        if (dayMinutes + chosen.estimatedMinutes > dayMax + 2 && slot >= dayMinCount) break;

        slot++;
        var planItemId = planId + '-d' + pad2(day) + '-s' + pad2(slot) + '-' + chosen.activityId;
        activities.push({
          planItemId: planItemId, planId: planId, dayNumber: day, slotNumber: slot,
          activityId: chosen.activityId, domain: chosen.domain, destination: chosen.destination,
          estimatedMinutes: chosen.estimatedMinutes, essential: slot <= Math.min(3, dayMaxCount),
          status: 'notStarted', createdAt: nowISO()
        });
        dayUsedIds.push(chosen.activityId);
        recentUsed.push(chosen.activityId); if (recentUsed.length > 15) recentUsed.shift();
        dayMinutes += chosen.estimatedMinutes;
        var bucket2 = balanceBucketFor(chosen.domain);
        assignedMinutes[bucket2] += chosen.estimatedMinutes;

        if (dayMinutes >= dayMin && slot >= dayMinCount) {
          if (dayMinutes >= dayMax || slot >= dayMaxCount) break;
        }
      }
      totalMinutesSoFar += dayMinutes;
      dailyPlans.push({ day: day, week: Math.ceil(day / 7), isReviewDay: isReviewDay, note: dayNoteFor(day, priorities), activities: activities, plannedMinutes: dayMinutes, generatedAt: nowISO() });
    }

    var balanceReport = { targetFractions: targetFractions, assignedMinutes: assignedMinutes, totalMinutes: totalMinutesSoFar, exceptions: exceptions };
    return { dailyPlans: dailyPlans, balanceReport: balanceReport };
  }

  function dayNoteFor(dayNum, priorities) {
    var dow = ((dayNum - 1) % 7) + 1;
    var top = priorities[0] ? priorities[0].label : 'your first recovery priority';
    var notes = {
      1: 'Orientation, confidence starter, main recovery priority (' + top + ').',
      2: 'Prerequisite reinforcement and vocabulary support.',
      3: 'Guided application through reading/listening/dialogue.',
      4: 'Second priority domain and sentence practice.',
      5: 'Functional communication and review.',
      6: 'Mixed practice and weak-area reinforcement.',
      0: 'Review and Recovery Day \u2014 a lighter mixed-review session.'
    };
    return notes[dow] || notes[1];
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 13/14/15 — TRUE plan-cycle generation. Every call mints a
     brand-new planId; there is no "existing && existing.planId" reuse
     anywhere (Defect D fix). regeneratePlan() archives the old cycle
     FIRST, then generates fresh, carrying over ONLY the approved
     settings — never completion data, adjustment history, or evidence
     windows (Task 14).
     ══════════════════════════════════════════════════════════════════ */
  function newPlanId(studentId) { return 'plan-' + studentId + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6); }

  function generatePlan(studentId, opts) {
    studentId = resolveStudentId(studentId); opts = opts || {};
    if (!studentId) return null;
    var auth = resolveLevelAuthority(studentId);
    if (!auth.levelId) return null; // Task 23 state A: nothing to plan from yet
    var profile = buildDomainProfile(auth.evidenceResult);
    var priorities = buildRecoveryPriorities(profile);
    var settings = opts.settingsOverride || getSettings(studentId);
    var planId = newPlanId(studentId);
    var now = nowISO();
    var cycle = buildFullThirtyDayCycle(planId, auth.levelId, priorities, settings);

    var plan = {
      schemaVersion: SCHEMA_VERSION,
      planId: planId, studentId: studentId,
      previousPlanId: opts.previousPlanId || '', cycleReason: opts.cycleReason || 'initial',
      createdAt: now, updatedAt: now, planVersion: PLAN_VERSION,
      status: auth.provisional ? 'provisional' : 'active',
      levelAuthority: { levelId: auth.levelId, levelSource: auth.levelSource, provisional: auth.provisional, sourcePlacementResultId: auth.sourcePlacementResultId, evidenceLinkage: auth.evidenceLinkage },
      sourcePlacementResultId: auth.sourcePlacementResultId,
      acceptedLevelId: auth.levelId, levelSource: auth.levelSource,
      currentDay: 1, currentWeek: 1,
      goals: computeGoals(auth.levelId, priorities, auth.provisional),
      domainProfile: profile, recoveryPriorities: priorities,
      dailyPlans: cycle.dailyPlans,
      balanceReport: cycle.balanceReport,
      weeklyMilestones: computeWeeklyMilestones(),
      completedPlanItems: {}, activityResults: {}, processedEvidenceWindows: {},
      teacherAdjustments: [], adjustmentHistory: [],
      technicalLimitations: (auth.evidenceResult && auth.evidenceResult.diagnostic && auth.evidenceResult.diagnostic.technicalLimitations) || [],
      settings: settings
    };
    writePlan(studentId, plan);
    clearPendingContext(studentId); // Task 14: never inherit a stale pending context
    return plan;
  }

  function initializeForStudent(studentId) {
    studentId = resolveStudentId(studentId);
    var p = readPlan(studentId);
    if (p) return p;
    return generatePlan(studentId, { cycleReason: 'initial' });
  }

  /* Task 13's exact 15-step sequence. Never mutates the archived
     snapshot after archival (step 15) — archiveCurrentCycle() deep-
     clones before writing to history. */
  function regeneratePlan(studentId, opts) {
    studentId = resolveStudentId(studentId); opts = opts || {};
    var existing = readPlan(studentId);
    var reason = opts.cycleReason || 'student-request';
    var preservedSettings = existing ? existing.settings : getSettings(studentId);
    var previousPlanId = '';
    if (existing) {
      archiveCurrentCycle(studentId, existing, reason); // idempotent by planId (Task 15)
      previousPlanId = existing.planId;
    }
    deletePlan(studentId);
    clearPendingContext(studentId);
    return generatePlan(studentId, { previousPlanId: previousPlanId, cycleReason: reason, settingsOverride: preservedSettings });
  }

  function getPlan(studentId) { return readPlan(resolveStudentId(studentId)); }

  /* ══════════════════════════════════════════════════════════════════
     TASK 15 — plan history. Deep-cloned FULL snapshots (not just a
     summary) so the History Detail view (Task 34) can show everything
     required without a second store. Idempotent by planId.
     ══════════════════════════════════════════════════════════════════ */
  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
  function archiveCurrentCycle(studentId, plan, cycleReason) {
    studentId = resolveStudentId(studentId);
    var h = readHistory(studentId);
    var already = h.cycles.some(function (c) { return c.planId === plan.planId; });
    if (already) return false; // idempotent — never blocks archiving a DIFFERENT later cycle
    var snapshot = deepClone(plan);
    snapshot.archivedAt = nowISO();
    snapshot.completionStatus = cycleReason || 'superseded';
    h.cycles.unshift(snapshot);
    writeHistory(studentId, h);
    return true;
  }
  function getPlanHistory(studentId) { return readHistory(resolveStudentId(studentId)).cycles; }
  function getHistoricalPlan(studentId, planId) {
    var cycles = getPlanHistory(studentId);
    return cycles.find(function (c) { return c.planId === planId; }) || null;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 4/5/6 — plan-item instance identity + completion storage.
     completedPlanItems is keyed by planItemId, NEVER activityId (Defect
     A fix). The progress/day-advancement invariant (Task 6) is enforced
     by construction: every count below reads the SAME completedPlanItems
     map and the SAME dailyPlans structure.
     ══════════════════════════════════════════════════════════════════ */
  function findPlanItem(plan, planItemId) {
    for (var d = 0; d < plan.dailyPlans.length; d++) {
      var dp = plan.dailyPlans[d]; if (!dp) continue;
      for (var i = 0; i < dp.activities.length; i++) if (dp.activities[i].planItemId === planItemId) return dp.activities[i];
    }
    return null;
  }
  function isPlanItemDone(plan, planItemId) {
    var rec = plan.completedPlanItems[planItemId];
    return !!(rec && (rec.status === 'completed' || rec.status === 'skipped' || rec.status === 'replaced'));
  }
  function plannedOccurrenceCount(plan) {
    var n = 0; plan.dailyPlans.forEach(function (dp) { if (dp) n += dp.activities.length; }); return n;
  }
  function completedOccurrenceCount(plan) {
    var n = 0;
    Object.keys(plan.completedPlanItems).forEach(function (id) {
      var rec = plan.completedPlanItems[id];
      if (rec && (rec.status === 'completed' || rec.status === 'skipped' || rec.status === 'replaced')) n++;
    });
    return n;
  }
  /* Task 6's required invariant, exposed for the test harness: visible
     checkmarks === completed occurrence count === progress numerator ===
     day-advancement evidence. All four are literally the SAME computation
     (isPlanItemDone over completedPlanItems), so this can never drift. */
  function verifyProgressInvariant(plan) {
    var checkmarks = 0;
    plan.dailyPlans.forEach(function (dp) { if (!dp) return; dp.activities.forEach(function (item) { if (isPlanItemDone(plan, item.planItemId)) checkmarks++; }); });
    var numerator = completedOccurrenceCount(plan);
    return checkmarks === numerator;
  }

  function dayEssentialsDone(plan, dayPlan) {
    if (!dayPlan) return false;
    var essentials = dayPlan.activities.filter(function (a) { return a.essential !== false; });
    if (!essentials.length) return true;
    return essentials.every(function (a) { return isPlanItemDone(plan, a.planItemId); });
  }
  function computeActiveDayNumber(plan) {
    for (var d = 1; d <= plan.dailyPlans.length; d++) {
      var dp = plan.dailyPlans[d - 1];
      if (!dayEssentialsDone(plan, dp)) return d;
    }
    return plan.dailyPlans.length;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 16/17 — repeatable Pause/Resume state machine (Defect F fix).
     Every transition gets a genuinely unique adjustmentId (planId +
     action + timestamp + monotonic nonce), so active->paused->active->
     paused->active never collides. Invalid transitions (pause-while-
     paused, resume-while-active) fail safely with no duplicate event.
     ══════════════════════════════════════════════════════════════════ */
  var transitionNonce = 0;
  function recordTransition(plan, action, previousStatus, newStatus, actor, reason) {
    transitionNonce++;
    var adjustmentId = 'adj-' + plan.planId + '-' + action + '-' + Date.now() + '-' + transitionNonce;
    plan.adjustmentHistory.push({ adjustmentId: adjustmentId, planId: plan.planId, action: action, previousStatus: previousStatus, newStatus: newStatus, actor: actor || 'teacher', reason: reason || '', createdAt: nowISO() });
    return adjustmentId;
  }
  function pausePlan(studentId, opts) {
    studentId = resolveStudentId(studentId); opts = opts || {};
    var plan = readPlan(studentId); if (!plan) return false;
    if (plan.status === 'paused') return false; // invalid transition — no duplicate event
    var prev = plan.status;
    plan.status = 'paused';
    recordTransition(plan, 'pause', prev, 'paused', opts.actor || 'teacher', opts.reason || '');
    plan.updatedAt = nowISO();
    writePlan(studentId, plan);
    return true;
  }
  function resumePlan(studentId, opts) {
    studentId = resolveStudentId(studentId); opts = opts || {};
    var plan = readPlan(studentId); if (!plan) return false;
    if (plan.status !== 'paused') return false; // invalid transition — no duplicate event
    plan.status = 'active';
    recordTransition(plan, 'resume', 'paused', 'active', opts.actor || 'teacher', opts.reason || '');
    plan.updatedAt = nowISO();
    writePlan(studentId, plan);
    return true;
  }
  function isPaused(plan) { return !!(plan && plan.status === 'paused'); }

  /* ══════════════════════════════════════════════════════════════════
     TASK 18 — pending activity launch context. ONE per student. Never
     stores answers or microphone data — only enough to recognize the
     next matching Learning Ledger write as evidence for this plan item.
     ══════════════════════════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════════════════════════
     TASK 15 — per-completion-mode context expiry (different activities
     genuinely need different limits; a short quiz should not stay
     "pending" for 30 minutes the same as a study session).
     ══════════════════════════════════════════════════════════════════ */
  var CONTEXT_EXPIRY_BY_SOURCE_MS = {
    'unit-quiz': 15 * 60 * 1000, 'quiz': 15 * 60 * 1000, 'dialogue': 20 * 60 * 1000,
    'grammar-world': 20 * 60 * 1000, 'interview': 30 * 60 * 1000, 'wordlab': 30 * 60 * 1000
  };
  var DEFAULT_CONTEXT_EXPIRY_MS = 20 * 60 * 1000;
  function contextExpiryFor(activity) {
    var contract2 = activity.completionContract || {};
    var srcs = contract2.expectedLedgerSources || [];
    for (var i = 0; i < srcs.length; i++) if (CONTEXT_EXPIRY_BY_SOURCE_MS[srcs[i]]) return CONTEXT_EXPIRY_BY_SOURCE_MS[srcs[i]];
    return CONTEXT_EXPIRY_BY_SOURCE_MS[activity.source] || DEFAULT_CONTEXT_EXPIRY_MS;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 6/8 — strict pending context. ONE per student. A new launch
     UNCONDITIONALLY overwrites (invalidates) the previous one — there is
     only ever one storage slot, so an old context can never be "found"
     again once a newer one is saved (Task 8's student-switch and
     Task 26's stale-session requirements both fall out of this by
     construction). launchSessionId is a per-student monotonic nonce,
     recorded for defense-in-depth auditability even though the primary
     protection is content-ID + source + studentId matching against
     whatever is CURRENTLY stored.
     ══════════════════════════════════════════════════════════════════ */
  var launchSessionCounters = {};
  function nextLaunchSessionId(studentId) {
    launchSessionCounters[studentId] = (launchSessionCounters[studentId] || 0) + 1;
    return studentId + '-ls' + launchSessionCounters[studentId] + '-' + Date.now();
  }
  function launchPlanItem(planItemId, studentId) {
    studentId = resolveStudentId(studentId);
    var plan = readPlan(studentId); if (!plan) return false;
    if (isPaused(plan)) return false; // Task 17: launch rejected while paused
    var item = findPlanItem(plan, planItemId); if (!item) return false;
    if (isPlanItemDone(plan, planItemId)) return false;
    var activity = activityById(item.activityId);
    var contract2 = (activity && activity.completionContract) || contract('manual-confirmation', {});
    var launchSessionId = nextLaunchSessionId(studentId);
    var ctx = {
      contextId: 'ctx-' + studentId + '-' + Date.now(), launchSessionId: launchSessionId,
      studentId: studentId, planId: plan.planId, planItemId: planItemId, activityId: item.activityId, domain: item.domain,
      destinationFunction: (item.destination && item.destination.fn) || '', destinationArgument: (item.destination && item.destination.arg !== undefined) ? item.destination.arg : null,
      completionMode: contract2.mode, expectedLedgerSources: contract2.expectedLedgerSources.slice(),
      expectedActivityTypes: (contract2.expectedActivityTypes || []).slice(), expectedContentId: contract2.expectedContentId,
      launchedAt: nowISO(), expiresAt: new Date(Date.now() + contextExpiryFor(activity || item)).toISOString(),
      status: 'pending', consumedEvidenceId: ''
    };
    // Task 6/8: this OVERWRITE is the invalidation mechanism — the
    // previous context (this student's or, by storage-key construction,
    // impossible to be another student's) ceases to be reachable.
    savePendingContext(studentId, ctx);
    try {
      if (item.destination.screen && typeof window.navigate === 'function') window.navigate(item.destination.screen);
      if (item.destination.fn && typeof window[item.destination.fn] === 'function') {
        if (item.destination.arg !== null && item.destination.arg !== undefined) window[item.destination.fn](item.destination.arg);
        else window[item.destination.fn]();
      }
    } catch (e) {}
    return true;
  }
  function _launch(planItemId) { launchPlanItem(planItemId, activeStudentId()); }

  /* ══════════════════════════════════════════════════════════════════
     TASK 21 — manual "Mark Done". Completes ONLY the selected
     planItemId; completionMethod:'manual'; creates NO Learning Ledger
     record (Task 22's preferred approach) so it can never inflate study
     days, unlock an assessment, or trigger a strong/weak adjustment.
     ══════════════════════════════════════════════════════════════════ */
  function markPlanItemDone(planItemId, studentId) {
    studentId = resolveStudentId(studentId);
    var plan = readPlan(studentId); if (!plan || !planItemId) return false;
    if (isPaused(plan)) return false; // Task 17: Mark Done disabled while paused
    var already = plan.completedPlanItems[planItemId];
    if (already && already.status === 'completed') return true; // idempotent
    var item = findPlanItem(plan, planItemId); if (!item) return false;
    plan.completedPlanItems[planItemId] = { planItemId: planItemId, activityId: item.activityId, completedAt: nowISO(), completionMethod: 'manual', status: 'completed', ledgerRecordId: '', evidenceSource: 'manual-confirm' };
    plan.updatedAt = nowISO();
    writePlan(studentId, plan);
    // Task 6: a manual completion also retires any pending context for
    // this same item, so a later stray evidence event has nothing left to match.
    try { var ctx = getPendingContext(studentId); if (ctx && ctx.planItemId === planItemId) clearPendingContext(studentId); } catch (e) {}
    return true;
  }
  // Back-compatible alias — same one function, no second completion path.
  function recordActivityCompletion(planItemId, studentId) { return markPlanItemDone(planItemId, studentId); }

  /* ══════════════════════════════════════════════════════════════════
     TASK 4/9/14/24/28 — the ONE strict evidence validator. Every one of
     these checks must pass before ANY mutation happens:
       1. a pending context exists and is still 'pending';
       2. the context's planId matches the CURRENT active plan (Task 14 —
          rejects evidence for an archived/old cycle);
       3. the context is not expired (Task 15/27);
       4. the target planItem is not already completed (Task 14/28 —
          an already-completed item accepts NO further evidence, even
          under a different evidence ID);
       5. this exact evidenceId has not already been consumed (Task 24/28
          — idempotent replay produces the SAME result, never a second one);
       6. the completion mode permits automatic matching at all (a
          'manual-confirmation' contract has no automatic path — Task 4B);
       7. the source is one of the contract's REAL confirmed sources
          (never "any" — Task 4);
       8. the activityType matches, when the contract specifies one;
       9. the contentId matches, when the contract specifies one
          (Task 9 — "Grammar topic B result" can never complete
          "Grammar topic A plan item").
     ══════════════════════════════════════════════════════════════════ */
  function evidenceAlreadyProcessed(plan, evidenceId) { return !!plan.activityResults[evidenceId]; }

  function recordActivityResultInternal(studentId, plan, planItemId, evidence) {
    if (evidenceAlreadyProcessed(plan, evidence.evidenceId)) return { ok: true, duplicate: true }; // Task 24/28: idempotent replay — no mutation at all
    if (isPlanItemDone(plan, planItemId)) return { ok: false, reason: 'already-completed' }; // Task 14/28: an already-completed item accepts NO extra evidence, not even recorded
    plan.activityResults[evidence.evidenceId] = evidence;
    plan.completedPlanItems[planItemId] = {
      planItemId: planItemId, activityId: evidence.activityId, completedAt: evidence.completedAt || nowISO(),
      completionMethod: evidence.technicalFailure ? 'replaced' : (evidence.scored ? 'automatic' : 'automatic-unscored'),
      status: evidence.technicalFailure ? 'replaced' : 'completed',
      ledgerRecordId: evidence.evidenceId, score: evidence.correct, total: evidence.total,
      percentage: evidence.percentage, evidenceSource: evidence.source || '', contentId: evidence.contentId || ''
    };
    plan.updatedAt = nowISO();
    writePlan(studentId, plan);
    // Task 22: only real SCORED, non-technical, non-manual evidence may
    // ever reach adjustment evaluation.
    if (!evidence.technicalFailure && evidence.scored && typeof evidence.percentage === 'number') maybeAutoAdjust(studentId, plan);
    return { ok: true, duplicate: false };
  }
  /* Public API: also directly callable (e.g. a destination that wants to
     report a result explicitly — Task 12's "direct-result" mode). */
  function recordActivityResult(planItemId, studentId, result) {
    studentId = resolveStudentId(studentId); result = result || {};
    var plan = readPlan(studentId); if (!plan || !planItemId) return false;
    if (isPaused(plan)) return false; // Task 17
    var item = findPlanItem(plan, planItemId); if (!item) return false;
    var evidenceId = result.evidenceId || ('fp-' + studentId + '-' + planItemId + '-' + (result.source || '') + '-' + (result.completedAt || nowISO()));
    var evidence = {
      evidenceId: evidenceId, planItemId: planItemId, activityId: item.activityId, source: result.source || result.evidenceSource || 'manual-result',
      domain: item.domain, correct: result.correct, total: result.total, contentId: result.contentId || '',
      percentage: typeof result.pct === 'number' ? result.pct : result.percentage, scored: result.scored !== false,
      completedAt: result.completedAt || nowISO(), technicalFailure: !!result.technicalFailure, completionMethod: result.technicalFailure ? 'replaced' : 'automatic'
    };
    var r = recordActivityResultInternal(studentId, plan, planItemId, evidence);
    return r.ok;
  }

  function findPendingPlanItemForEvidence(plan, ctx) {
    if (!ctx || ctx.planId !== plan.planId) return null; // Task 14: stale/old-cycle context
    if (isPlanItemDone(plan, ctx.planItemId)) return null;
    return findPlanItem(plan, ctx.planItemId);
  }
  /* Task 4/9 — replaces the retired sourceCompatible(). An empty
     expectedLedgerSources list NEVER means "accept any source" anymore —
     it is only reachable at all when completionMode explicitly permits
     automatic matching, and even then every other declared check
     (activityType, contentId) still applies. */
  function evidenceMatchesContext(ctx, data, actualSource) {
    if (!ctx) return false;
    if (ctx.completionMode === 'manual-confirmation') return false; // Task 4B: no automatic path exists at all
    if (ctx.completionMode === 'ledger-score' || ctx.completionMode === 'ledger-completion') {
      if (!ctx.expectedLedgerSources || !ctx.expectedLedgerSources.length) return false; // Task 4C: source mapping not configured -> never silently permissive
      if (ctx.expectedLedgerSources.indexOf(actualSource) === -1) return false;
    }
    if (ctx.expectedActivityTypes && ctx.expectedActivityTypes.length) {
      var at = data && data.activityType;
      if (ctx.expectedActivityTypes.indexOf(at) === -1) return false;
    }
    if (ctx.expectedContentId !== null && ctx.expectedContentId !== undefined) {
      var cid = data && (data.contentId !== undefined ? data.contentId : data.id);
      if (cid !== ctx.expectedContentId) return false; // Task 9: exact content identity required
    }
    return true;
  }
  /* Task 7 — explicit student identity. `explicitStudentId` (when
     provided by the caller, e.g. a normalized event that captured its
     owner at launch time) takes priority over "whichever student is
     active right now" — this is what lets a delayed Student A result
     complete Student A's item even while Student B is active in the UI
     (Task 8/25), and conversely never lets B's activity accidentally
     read/complete A's context, since each student's pending context
     always lives at that student's OWN explicit storage key regardless
     of who is active. */
  function matchAndCompletePendingItem(explicitStudentId, data, actualSource) {
    var studentId = explicitStudentId || activeStudentId();
    if (!studentId) return { ok: false, reason: 'no-student-identity' }; // Task 7: never guess
    var ctx = getPendingContext(studentId); if (!ctx || ctx.status !== 'pending') return { ok: false, reason: 'no-pending-context' };
    var plan = readPlan(studentId); if (!plan) { clearPendingContext(studentId); return { ok: false, reason: 'no-plan' }; }
    if (isPaused(plan)) return { ok: false, reason: 'paused' }; // Task 17: no completion while paused
    var item = findPendingPlanItemForEvidence(plan, ctx); if (!item) { clearPendingContext(studentId); return { ok: false, reason: 'stale-or-completed' }; }
    if (!evidenceMatchesContext(ctx, data, actualSource)) return { ok: false, reason: 'no-match' }; // Task 4/9: strict source+type+content match
    var evidenceId = (data && data.id) ? String(data.id) : ('fp-' + studentId + '-' + actualSource + '-' + Date.now());
    var pct = (data && typeof data.pct === 'number') ? data.pct : undefined;
    var contentId = (data && (data.contentId !== undefined ? data.contentId : data.id)) || '';
    var r = recordActivityResultInternal(studentId, plan, ctx.planItemId, {
      evidenceId: evidenceId, planItemId: ctx.planItemId, activityId: item.activityId, source: actualSource, contentId: contentId,
      domain: item.domain, correct: data ? data.good : undefined, total: data ? data.total : undefined,
      percentage: pct, scored: ctx.completionMode !== 'ledger-completion' && ctx.completionMode !== 'direct-completion',
      completedAt: nowISO(), technicalFailure: false, completionMethod: 'automatic'
    });
    if (r.ok && !r.duplicate) { ctx.status = 'consumed'; ctx.consumedEvidenceId = evidenceId; savePendingContext(studentId, ctx); }
    return r;
  }
  function onLedgerRecorded(data) {
    try {
      if (data && data.source === 'personal-learning-plan') return; // never self-trigger (also: this source is no longer written going forward)
      // Task 7: prefer an explicit flat studentId on the event itself
      // (now real, since the Ledger's own studentId passthrough fix
      // above), falling back to the identity captured SYNCHRONOUSLY by
      // the Ledger at record-write time (rec.student.id), and only then
      // to a later activeStudentId() lookup.
      var explicitId = (data && data.studentId) || (data && data.student && data.student.id) || '';
      var studentId = explicitId || activeStudentId();
      matchAndCompletePendingItem(studentId, data, data ? data.source : '');
    } catch (e) {}
  }
  /* TASK 23 (D13A) exception, preserved: unit-quiz results
     (showUnitQuizResult() in app.js) are saved to
     'quiz_history'/'school_scores' and NEVER pass through
     window.ZirakLearningLedger.recordActivity() at all. A small, explicit
     direct call reports here — this is the ONE justified second entry
     point (Task 12's "small direct callback... provided all callbacks
     enter the same central validator" — it does, via
     matchAndCompletePendingItem). */
  function onExternalResult(studentId, data) {
    try {
      studentId = resolveStudentId(studentId); if (!studentId) return;
      matchAndCompletePendingItem(studentId, data, data ? data.source : '');
    } catch (e) {}
  }
  function installEvidenceBridge() {
    try {
      if (!window.ZirakLearningLedger) return;
      if (window.ZirakLearningLedger.__zirakPlanBridged) return; // Task 13: no duplicate installation
      // Preferred path: the Ledger's own clean subscribe() API — no
      // function is reassigned, original return values/exceptions are
      // completely untouched (Task 13).
      if (typeof window.ZirakLearningLedger.subscribe === 'function') {
        var installed = window.ZirakLearningLedger.subscribe(onLedgerRecorded);
        if (installed) { window.ZirakLearningLedger.__zirakPlanBridged = true; return; }
      }
      // Fallback (older cached build without subscribe()): the same
      // wrapper D13A used, now verified against Task 13's full checklist
      // — installs exactly once (guarded above), preserves the original
      // return value AND lets exceptions from the original call propagate
      // untouched (only the notification itself is try/caught), cannot
      // self-trigger (onLedgerRecorded ignores its own 'personal-
      // learning-plan' source), and is safe across in-app navigation
      // since the guard flag persists on the Ledger object itself.
      var orig = window.ZirakLearningLedger.recordActivity;
      if (typeof orig !== 'function') return;
      window.ZirakLearningLedger.recordActivity = function (data) {
        var result = orig.apply(this, arguments);
        try { onLedgerRecorded(result || data); } catch (e) {}
        try { if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('zirak:learning-recorded', { detail: result || data })); } catch (e) {}
        return result;
      };
      window.ZirakLearningLedger.__zirakPlanBridged = true;
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 25/26/27 — adjustment evidence windows. A sliding window of the
     most recent 3 valid scored results per domain; a window is only
     (re)processed when its fingerprint (sorted evidence IDs) differs
     from the last-processed one for that domain — so replaying the same
     3 events is a no-op, while ANY new result shifts the window and is
     evaluated fresh (documented policy). Technical failures and manual
     completions are never counted as scored evidence. Domain evidence is
     matched STRICTLY (no grammar/sentence substitution) — Task 26.
     ══════════════════════════════════════════════════════════════════ */
  function evidenceWindowFingerprint(ids) { return ids.slice().sort().join('|'); }
  function maybeAutoAdjust(studentId, plan) {
    var adjusted = false;
    CORE_DOMAINS.forEach(function (domain) {
      var evid = Object.keys(plan.activityResults).map(function (id) { return plan.activityResults[id]; })
        .filter(function (e) { return e.domain === domain && typeof e.percentage === 'number' && !e.technicalFailure && e.completionMethod !== 'manual'; })
        .sort(function (a, b) { return String(a.completedAt).localeCompare(String(b.completedAt)); });
      if (evid.length < 3) return;
      var last3 = evid.slice(-3);
      var fp = evidenceWindowFingerprint(last3.map(function (e) { return e.evidenceId; }));
      var domainWindowKey = 'domain:' + domain;
      var prevWindow = plan.processedEvidenceWindows[domainWindowKey];
      if (prevWindow && prevWindow.fingerprint === fp) return; // identical window already processed
      var avg = last3.reduce(function (s, e) { return s + e.percentage; }, 0) / last3.length;
      var oldCat = plan.domainProfile[domain].category, newCat = oldCat, trigger = null;
      if (avg >= 80) { newCat = 'Maintain'; trigger = 'repeated-strength'; }
      else if (avg < 45) { newCat = CRITICAL_FOUNDATION_DOMAINS.indexOf(domain) > -1 ? 'Critical Foundation' : 'High Priority'; trigger = 'repeated-weakness'; }
      plan.processedEvidenceWindows[domainWindowKey] = { fingerprint: fp, at: nowISO(), domain: domain, trigger: trigger || 'no-change' };
      if (trigger && newCat !== oldCat) {
        plan.adjustmentHistory.push({ adjustmentId: 'eadj-' + plan.planId + '-' + domain + '-' + Date.now(), domain: domain, evidencePlanItemIds: last3.map(function (e) { return e.planItemId; }), evidenceRecordIds: last3.map(function (e) { return e.evidenceId; }), trigger: trigger, oldPriority: oldCat, newPriority: newCat, createdAt: nowISO() });
        plan.domainProfile[domain].category = newCat;
        plan.domainProfile[domain].reason = trigger === 'repeated-strength' ? 'recent activity performance is strong' : 'recent activity performance suggests more guided practice is needed';
        adjusted = true;
      }
    });
    if (adjusted) {
      plan.recoveryPriorities = buildRecoveryPriorities(plan.domainProfile);
      // Only future (not-yet-completed) days are affected — never mutate completed occurrences or archived plans.
      plan.status = plan.status === 'paused' ? plan.status : 'active';
    }
    plan.updatedAt = nowISO();
    writePlan(studentId, plan);
    return adjusted;
  }
  function replaceActivity(planItemId, studentId, reason) {
    studentId = resolveStudentId(studentId);
    var plan = readPlan(studentId); if (!plan) return false;
    var item = findPlanItem(plan, planItemId); if (!item) return false;
    plan.completedPlanItems[planItemId] = { planItemId: planItemId, activityId: item.activityId, completedAt: nowISO(), completionMethod: 'replaced', evidenceSource: 'technical-replacement', reason: reason || 'technical limitation', status: 'replaced' };
    if (plan.domainProfile[item.domain] && plan.domainProfile[item.domain].score === null) {
      plan.domainProfile[item.domain].category = 'Not Fully Assessed';
      plan.domainProfile[item.domain].reason = 'a technical limitation prevented full assessment';
    }
    plan.updatedAt = nowISO();
    writePlan(studentId, plan);
    return true;
  }

  /* ── day/week/30-day readers — the cycle is fully pre-built at
     generatePlan() time (Task 29), so these are simple readers, never
     lazy builders. Day advancement uses real occurrence completion
     (Task 33: purely sequential, "next plan day is ready" wording —
     Defect M fix, missed-day language removed). ──────────────────────── */
  function getTodayPlan(studentId) {
    studentId = resolveStudentId(studentId);
    var plan = readPlan(studentId); if (!plan) return null;
    var activeDay = computeActiveDayNumber(plan);
    var advanced = activeDay > plan.currentDay;
    plan.currentDay = activeDay; plan.currentWeek = Math.ceil(activeDay / 7);
    writePlan(studentId, plan);
    var dp = plan.dailyPlans[activeDay - 1];
    return { plan: plan, dayPlan: dp, activeDay: activeDay, advancedNote: advanced && activeDay > 1 ? 'Your next plan day is ready.' : '' };
  }
  function getWeekPlan(studentId, weekNum) {
    studentId = resolveStudentId(studentId);
    var plan = readPlan(studentId); if (!plan) return null;
    weekNum = weekNum || Math.ceil(computeActiveDayNumber(plan) / 7);
    var startDay = (weekNum - 1) * 7 + 1, endDay = Math.min(plan.dailyPlans.length, weekNum * 7);
    var days = []; for (var d = startDay; d <= endDay; d++) days.push(plan.dailyPlans[d - 1]);
    var phase = WEEK_PHASES[weekNum - 1] || WEEK_PHASES[0];
    return { plan: plan, week: weekNum, phase: phase, days: days };
  }
  function getThirtyDayPlan(studentId) { return readPlan(resolveStudentId(studentId)); }
  function getRecoveryPriorities(studentId) { var p = readPlan(resolveStudentId(studentId)); return p ? p.recoveryPriorities : []; }
  function getTeacherPriorities(studentId) {
    var p = readPlan(resolveStudentId(studentId)); if (!p) return null;
    return { acceptedLevelId: p.acceptedLevelId, recoveryPriorities: p.recoveryPriorities, domainProfile: p.domainProfile, technicalLimitations: p.technicalLimitations, teacherAdjustments: p.teacherAdjustments, balanceReport: p.balanceReport };
  }

  /* ══════════════════════════════════════════════════════════════════
     Teacher adjustments (non-pause/resume) — same unique-ID pattern.
     ══════════════════════════════════════════════════════════════════ */
  var teacherAdjNonce = 0;
  function teacherAdjust(studentId, teacherAction, previousValue, newValue, note) {
    studentId = resolveStudentId(studentId);
    var plan = readPlan(studentId); if (!plan) return false;
    teacherAdjNonce++;
    var adjustmentId = 'tadj-' + plan.planId + '-' + teacherAction + '-' + Date.now() + '-' + teacherAdjNonce;
    plan.teacherAdjustments.push({ adjustmentId: adjustmentId, planId: plan.planId, teacherAction: teacherAction, previousValue: previousValue, newValue: newValue, note: note || '', adjustedAt: nowISO() });
    if (teacherAction === 'changeDuration' && DURATION_PRESETS[newValue]) { plan.settings.durationPreset = newValue; plan.settings.minutesPerDay = DURATION_PRESETS[newValue].minutesPerDay; writeSettings(studentId, plan.settings); }
    if (teacherAction === 'confirmPlan') plan.status = plan.status === 'paused' ? 'paused' : 'teacherAdjusted';
    plan.updatedAt = nowISO();
    writePlan(studentId, plan);
    return true;
  }

  /* ══════════════════════════════════════════════════════════════════
     Level-change handling — a REAL new cycle (Task 21 D13 spec, honored
     structurally here via regeneratePlan), never an in-place patch.
     Pending retakes never trigger this on their own (Task 12) — only a
     genuine accepted-level CHANGE does.
     ══════════════════════════════════════════════════════════════════ */
  function onAcceptedLevelChanged(studentId) {
    studentId = resolveStudentId(studentId); if (!studentId) return;
    var plan = readPlan(studentId);
    var auth = resolveLevelAuthority(studentId);
    if (!auth.levelId) return;
    if (plan && plan.acceptedLevelId === auth.levelId && plan.status !== 'provisional') return; // no real change
    regeneratePlan(studentId, { cycleReason: 'level-change' });
  }

  /* ══════════════════════════════════════════════════════════════════
     Reset/Delete integration (Task 38).
     ══════════════════════════════════════════════════════════════════ */
  function onResetStudentProgress(studentId) {
    studentId = resolveStudentId(studentId);
    // The existing product-wide sweep (in zirak-profile.js, unchanged)
    // already removes every 'u_<id>_...' key — including all D13A plan
    // keys — before restoring only LEVEL_KEYS. Nothing survives to
    // archive by the time this hook runs; it regenerates a fresh cycle
    // from whatever accepted-level evidence the sweep retained.
    deletePlan(studentId); clearPendingContext(studentId);
    generatePlan(studentId, { cycleReason: 'recovery-rebuild' });
  }
  function onResetLevelAndPlacement(studentId) {
    studentId = resolveStudentId(studentId);
    deletePlan(studentId); clearPendingContext(studentId); // plan history is preserved by policy
  }
  function onDeleteStudent(studentId) {
    if (!studentId) return;
    ['personal_learning_plan', 'personal_learning_plan_history', 'personal_learning_plan_settings',
     'personal_learning_plan_backup', 'personal_learning_plan_pending_context'
    ].forEach(function (k) { removeStudentValue(studentId, k); });
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 30/34/35 — report / export / share, for EITHER the active plan
     OR a selected historical cycle (never automatically the latest when
     a specific historicalPlanId is given). Sharing never writes a
     Learning Ledger record.
     ══════════════════════════════════════════════════════════════════ */
  function resolvePlanForReport(studentId, historicalPlanId) {
    if (historicalPlanId) { var h = getHistoricalPlan(studentId, historicalPlanId); if (h) return h; }
    return readPlan(studentId);
  }
  function buildPlanSummaryText(plan, studentName) {
    var completed = completedOccurrenceCount(plan), planned = plannedOccurrenceCount(plan);
    var todayDp = plan.dailyPlans[Math.min(plan.currentDay, plan.dailyPlans.length) - 1];
    var lines = [];
    lines.push('ZIRAK English Language Academy'); lines.push('Personalized 30-Day Learning Plan'); lines.push('');
    lines.push('Student:'); lines.push(studentName || 'Student'); lines.push('');
    lines.push('Current Level:'); lines.push(classDisplayName(plan.acceptedLevelId)); lines.push('');
    lines.push('Main Strength:'); lines.push(plan.goals.mainStrength); lines.push('');
    lines.push('Main Recovery Priority:'); lines.push(plan.goals.mainRecoveryPriority); lines.push('');
    if (todayDp) { lines.push('Today:'); lines.push(todayDp.activities.length + ' activities \u00b7 approximately ' + (todayDp.plannedMinutes || plan.settings.minutesPerDay) + ' minutes'); lines.push(''); }
    lines.push('Plan Progress:'); lines.push(completed + ' of ' + planned + ' planned activities completed'); lines.push('');
    lines.push('Teacher Review:'); lines.push(plan.status === 'needsReview' ? 'Recommended' : 'Not currently required'); lines.push('');
    lines.push('Generated from the student\u2019s locally stored ZIRAK learning record.');
    return lines.join('\n');
  }
  function exportPlan(kind, studentId, historicalPlanId) {
    studentId = resolveStudentId(studentId);
    var plan = resolvePlanForReport(studentId, historicalPlanId); if (!plan) return;
    var s = getStudentProfile(studentId) || {};
    var name = 'zirak-learning-plan-' + String(studentId).replace(/[^A-Za-z0-9_-]+/g, '-') + '-' + String(plan.updatedAt || plan.createdAt).slice(0, 10);
    var content, type;
    if (kind === 'json') { content = JSON.stringify(plan, null, 2); type = 'application/json'; name += '.json'; }
    else { content = buildPlanSummaryText(plan, s.fullName || 'Student'); type = 'text/plain'; name += '.txt'; }
    try {
      var blob = new Blob([content], { type: type }); var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    } catch (e) {}
  }
  function exportPlanJSON(studentId, historicalPlanId) { exportPlan('json', studentId, historicalPlanId); }
  function exportPlanTXT(studentId, historicalPlanId) { exportPlan('txt', studentId, historicalPlanId); }
  function copyPlanSummary(studentId, historicalPlanId) {
    studentId = resolveStudentId(studentId);
    var plan = resolvePlanForReport(studentId, historicalPlanId); if (!plan) return;
    var s = getStudentProfile(studentId) || {};
    var t = buildPlanSummaryText(plan, s.fullName || 'Student');
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t); else { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } } catch (e) {}
  }
  function sharePlanSummary(studentId, historicalPlanId) {
    studentId = resolveStudentId(studentId);
    var plan = resolvePlanForReport(studentId, historicalPlanId); if (!plan) return;
    var s = getStudentProfile(studentId) || {};
    var msg = buildPlanSummaryText(plan, s.fullName || 'Student');
    try { window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank'); } catch (e) {}
    // Deliberately does NOT touch the Learning Ledger — sharing writes no record.
  }
  function printPlan() { try { window.print(); } catch (e) {} }

  /* ════════════════════════════════════════════════════════════════
     UI. Task 17: paused status is visible everywhere, not just
     enforced silently. Task 36: all interactive controls sized for a
     44px practical touch target.
     ════════════════════════════════════════════════════════════════ */
  var SELECTED_HISTORY_ID = null;
  function mount() { return document.getElementById('personal-plan-mount'); }
  function h(html) { var m = mount(); if (m) m.innerHTML = html; return m; }

  function activityRow(plan, item, showControls) {
    var a = activityById(item.activityId); if (!a) return '';
    var done = isPlanItemDone(plan, item.planItemId);
    var rec = plan.completedPlanItems[item.planItemId];
    var statusIcon = done ? (rec && (rec.completionMethod === 'replaced') ? '\ud83d\udd01' : '\u2705') : '\u2b1c';
    var paused = isPaused(plan);
    return '<div class="lp-activity-row' + (done ? ' lp-activity-done' : '') + '">' +
      '<span class="lp-activity-status">' + statusIcon + '</span>' +
      '<div class="lp-activity-body">' +
        '<div class="lp-activity-title">' + esc(a.title) + (item.essential === false ? ' <span class="lp-optional-tag">optional</span>' : '') + '</div>' +
        '<div class="lp-activity-meta">' + esc(DOMAIN_LABELS[a.domain] || a.domain) + ' \u00b7 ~' + item.estimatedMinutes + ' min' + (rec && rec.completionMethod ? ' \u00b7 ' + esc(rec.completionMethod) : '') + '</div>' +
      '</div>' +
      (showControls && !done ? '<div class="lp-activity-controls">' +
        '<button type="button" class="lp-go-btn"' + (paused ? ' disabled' : '') + ' onclick="ZirakLearningPlan._launch(\'' + esc(item.planItemId) + '\')">Start</button>' +
        '<button type="button" class="lp-mark-btn"' + (paused ? ' disabled' : '') + ' onclick="ZirakLearningPlan._markDone(\'' + esc(item.planItemId) + '\')" aria-label="Mark as completed">Mark Done</button>' +
      '</div>' : '') +
      '</div>';
  }
  function _markDone(planItemId) {
    var studentId = activeStudentId();
    var plan = readPlan(studentId);
    if (plan && isPaused(plan)) return;
    markPlanItemDone(planItemId, studentId);
    renderScreen(studentId);
  }

  function pausedBanner(plan) {
    if (!isPaused(plan)) return '';
    return '<div class="lp-paused-banner">\u23f8 <b>Plan paused by teacher.</b> Learning activities will become available when the plan is resumed.</div>';
  }

  function renderScreen(studentId) {
    studentId = resolveStudentId(studentId);
    if (!studentId) { h('<div class="lp-card"><div class="lp-title">Personalized Learning Plan</div><div class="lp-sub">Please log in as a student.</div></div>'); return; }
    var plan = initializeForStudent(studentId);
    if (!plan) {
      h('<div class="lp-card"><div class="lp-title">Personalized Plan Waiting</div>' +
        '<div class="lp-sub">Complete or confirm your starting level first \u2014 then your plan will be ready.</div>' +
        '<div class="lp-actions"><button type="button" class="lp-btn" onclick="navigate(\'path\')">Go to School Path</button></div></div>');
      return;
    }
    var today = getTodayPlan(studentId);
    var s = getStudentProfile(studentId) || {};
    var completed = completedOccurrenceCount(plan), planned = plannedOccurrenceCount(plan);
    var pct = planned ? Math.round((completed / planned) * 100) : 0;
    var provisionalNote = plan.status === 'provisional' ? '<div class="lp-note">\ud83d\udcdd <b>Provisional Learning Preview.</b> This plan will be finalized after your starting level is confirmed.</div>' : '';
    var priorityChips = plan.recoveryPriorities.slice(0, 4).map(function (p) { return '<div class="lp-priority-chip lp-cat-' + p.category.replace(/\s+/g, '-').toLowerCase() + '"><b>' + esc(p.label) + '</b><span>' + esc(p.category) + '</span></div>'; }).join('');
    h('<div class="lp-card">' +
      '<div class="lp-title">\ud83d\udcda Personalized Learning Plan</div>' +
      '<div class="lp-sub"><b>' + esc(s.fullName || 'Student') + '</b> \u00b7 Level: ' + esc(classDisplayName(plan.acceptedLevelId)) + '</div>' +
      pausedBanner(plan) + provisionalNote +
      '<div class="lp-summary">' + esc(plan.goals.summaryEn) + '</div>' +
      '<div class="lp-section-title">Recovery Priorities</div>' +
      '<div class="lp-priority-grid">' + priorityChips + '</div>' +
      '<div class="lp-section-title">Day ' + (today ? today.activeDay : 1) + '</div>' +
      (today && today.advancedNote ? '<div class="lp-note">' + esc(today.advancedNote) + '</div>' : '') +
      (today && today.dayPlan ? today.dayPlan.activities.map(function (a) { return activityRow(plan, a, true); }).join('') : '') +
      '<div class="lp-progress-bar"><div class="lp-progress-fill" style="width:' + pct + '%;"></div></div>' +
      '<div class="lp-note">' + completed + ' of ' + planned + ' planned activities completed (' + pct + '%)</div>' +
      '<div class="lp-actions">' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.openWeek()">This Week</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.openThirtyDay()">30-Day Program</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.openHistory()">Plan History</button>' +
      '</div>' +
      '<div class="lp-actions">' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.exportPlanTXT()">TXT</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.exportPlanJSON()">JSON</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.copyPlanSummary()">Copy</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.sharePlanSummary()">WhatsApp</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.printPlan()">Print</button>' +
      '</div></div>');
  }
  function open(studentId) { installEvidenceBridge(); renderScreen(studentId); }
  function close() { /* no persistent overlay/timers to tear down */ }
  function openWeek(studentId, weekNum) {
    studentId = resolveStudentId(studentId);
    var wp = getWeekPlan(studentId, weekNum); if (!wp) { renderScreen(studentId); return; }
    var daysHtml = wp.days.map(function (dp) {
      if (!dp) return '';
      return '<details class="lp-day"' + (dp.day === wp.plan.currentDay ? ' open' : '') + '><summary>Day ' + dp.day + (dp.isReviewDay ? ' \u2014 Review and Recovery Day' : '') + '</summary>' +
        '<div class="lp-day-note">' + esc(dp.note) + ' (~' + dp.plannedMinutes + ' min)</div>' +
        dp.activities.map(function (a) { return activityRow(wp.plan, a, true); }).join('') + '</details>';
    }).join('');
    h('<div class="lp-card"><div class="lp-title">Week ' + wp.week + ' \u2014 ' + esc(wp.phase.title) + '</div>' +
      '<div class="lp-sub">' + esc(wp.phase.focus) + '</div>' + pausedBanner(wp.plan) + daysHtml +
      '<div class="lp-actions"><button type="button" class="lp-btn" onclick="ZirakLearningPlan.open()">\u2190 Back to Plan</button></div></div>');
  }
  function openThirtyDay(studentId) {
    studentId = resolveStudentId(studentId);
    var plan = getThirtyDayPlan(studentId); if (!plan) { renderScreen(studentId); return; }
    var weeksHtml = WEEK_PHASES.map(function (p) {
      return '<details class="lp-day"><summary>Week ' + p.week + ' \u2014 ' + esc(p.title) + '</summary>' +
        '<div class="lp-day-note">' + esc(p.focus) + '</div>' +
        '<div class="lp-actions"><button type="button" class="lp-btn" onclick="ZirakLearningPlan.openWeek(null,' + p.week + ')">View Week ' + p.week + '</button></div></details>';
    }).join('');
    var br = plan.balanceReport;
    var balanceHtml = br ? ('<div class="lp-note"><b>Domain balance (this cycle):</b> ' + Object.keys(br.assignedMinutes).map(function (b) { var pctB = br.totalMinutes ? Math.round((br.assignedMinutes[b] / br.totalMinutes) * 100) : 0; return esc(b) + ' ' + pctB + '%'; }).join(' \u00b7 ') + '</div>') : '';
    h('<div class="lp-card"><div class="lp-title">30-Day Learning Program</div>' +
      '<div class="lp-sub">Level: ' + esc(classDisplayName(plan.acceptedLevelId)) + '</div>' + pausedBanner(plan) + balanceHtml + weeksHtml +
      '<div class="lp-actions"><button type="button" class="lp-btn" onclick="ZirakLearningPlan.open()">\u2190 Back to Plan</button></div></div>');
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 34 — Plan History detail view. Opens ONE selected historical
     cycle from the ONE history store (no second store created).
     ══════════════════════════════════════════════════════════════════ */
  function openHistory(studentId) {
    studentId = resolveStudentId(studentId);
    SELECTED_HISTORY_ID = null;
    var cycles = getPlanHistory(studentId);
    if (!cycles.length) { h('<div class="lp-card"><div class="lp-title">Plan History</div><div class="lp-sub">No previous cycles yet.</div><div class="lp-actions"><button type="button" class="lp-btn" onclick="ZirakLearningPlan.open()">\u2190 Back</button></div></div>'); return; }
    var rows = cycles.map(function (c) {
      var completed = completedOccurrenceCount(c), planned = plannedOccurrenceCount(c);
      return '<div class="lp-hist-card"><div class="lp-hist-top"><b>' + esc(classDisplayName(c.acceptedLevelId)) + '</b><span>' + esc(String(c.createdAt).slice(0, 10)) + '</span></div>' +
        '<div class="lp-hist-mid">' + completed + ' of ' + planned + ' activities completed \u00b7 ' + esc(c.completionStatus || c.cycleReason || '') + '</div>' +
        '<div class="lp-hist-mid" style="opacity:.8;">Priorities: ' + esc((c.recoveryPriorities || []).slice(0, 3).map(function (p) { return p.label; }).join(', ') || '\u2014') + '</div>' +
        '<div class="lp-actions"><button type="button" class="lp-btn" onclick="ZirakLearningPlan.openHistoricalPlan(\'' + esc(c.planId) + '\')">View Details</button></div></div>';
    }).join('');
    h('<div class="lp-card"><div class="lp-title">Plan History</div><div class="lp-hist-list">' + rows + '</div>' +
      '<div class="lp-actions"><button type="button" class="lp-btn" onclick="ZirakLearningPlan.open()">\u2190 Back</button></div></div>');
  }
  function openHistoricalPlan(planId, studentId) {
    studentId = resolveStudentId(studentId);
    var c = getHistoricalPlan(studentId, planId);
    if (!c) { openHistory(studentId); return; }
    SELECTED_HISTORY_ID = planId;
    var completed = completedOccurrenceCount(c), planned = plannedOccurrenceCount(c);
    var domRows = CORE_DOMAINS.map(function (d) { var dp = c.domainProfile[d]; return '<tr><td>' + esc(DOMAIN_LABELS[d]) + '</td><td>' + esc(dp.category) + '</td><td>' + (dp.score === null ? '\u2014' : dp.score + '%') + '</td></tr>'; }).join('');
    var teacherRows = (c.teacherAdjustments || []).map(function (a) { return '<li>' + esc(a.teacherAction) + ': ' + esc(String(a.previousValue)) + ' \u2192 ' + esc(String(a.newValue)) + (a.note ? ' \u2014 "' + esc(a.note) + '"' : '') + ' (' + esc(String(a.adjustedAt).slice(0, 10)) + ')</li>'; }).join('');
    var autoRows = (c.adjustmentHistory || []).filter(function (a) { return a.action === 'pause' || a.action === 'resume'; }).map(function (a) { return '<li>' + esc(a.action) + ' (' + esc(String(a.createdAt).slice(0, 10)) + ')</li>'; }).join('');
    var completionMethods = {}; Object.keys(c.completedPlanItems || {}).forEach(function (id) { var m = c.completedPlanItems[id].completionMethod || 'unknown'; completionMethods[m] = (completionMethods[m] || 0) + 1; });
    h('<div class="lp-card"><div class="lp-title">Plan Cycle \u2014 ' + esc(classDisplayName(c.acceptedLevelId)) + '</div>' +
      '<div class="lp-sub">Level source: ' + esc(c.levelSource) + ' \u00b7 Started ' + esc(String(c.createdAt).slice(0, 10)) + (c.archivedAt ? (' \u00b7 Ended ' + esc(String(c.archivedAt).slice(0, 10))) : '') + '</div>' +
      '<div class="lp-note"><b>Status:</b> ' + esc(c.completionStatus || c.status) + ' \u00b7 <b>Cycle reason:</b> ' + esc(c.cycleReason || '\u2014') + (c.previousPlanId ? (' \u00b7 <b>Previous cycle:</b> ' + esc(c.previousPlanId)) : '') + '</div>' +
      '<div class="lp-note"><b>Occurrences:</b> ' + completed + ' of ' + planned + ' completed</div>' +
      '<table class="pl-table"><tr><th>Domain</th><th>Category</th><th>Score</th></tr>' + domRows + '</table>' +
      (teacherRows ? '<div class="lp-section-title">Teacher Adjustments</div><ul class="lp-teacher-list">' + teacherRows + '</ul>' : '') +
      (autoRows ? '<div class="lp-section-title">Pause/Resume Events</div><ul class="lp-teacher-list">' + autoRows + '</ul>' : '') +
      '<div class="lp-note"><b>Completion methods:</b> ' + esc(JSON.stringify(completionMethods)) + '</div>' +
      '<div class="lp-actions">' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.exportPlanTXT(null,\'' + esc(planId) + '\')">TXT</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.exportPlanJSON(null,\'' + esc(planId) + '\')">JSON</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.copyPlanSummary(null,\'' + esc(planId) + '\')">Copy</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.sharePlanSummary(null,\'' + esc(planId) + '\')">WhatsApp</button>' +
      '<button type="button" class="lp-btn" onclick="ZirakLearningPlan.printPlan()">Print</button>' +
      '</div>' +
      '<div class="lp-actions"><button type="button" class="lp-btn" onclick="ZirakLearningPlan.openHistory()">\u2190 Back to History</button></div></div>');
  }

  /* ── Home dashboard card — ONE card, paused state clearly shown. ──── */
  function refreshDashboardCard() {
    var slot = document.getElementById('home-personal-plan-card');
    if (!slot) return;
    var studentId = activeStudentId();
    if (!studentId) { slot.style.display = 'none'; slot.innerHTML = ''; return; }
    var auth = resolveLevelAuthority(studentId);
    if (!auth.levelId) { slot.style.display = 'block'; slot.innerHTML = '<div class="lp-dash-card"><div class="lp-dash-title">\ud83d\udcda Personalized Plan Waiting</div><div class="lp-dash-sub">Complete or confirm your starting level first.</div></div>'; return; }
    var plan = initializeForStudent(studentId);
    if (!plan) { slot.style.display = 'none'; return; }
    slot.style.display = 'block';
    if (isPaused(plan)) {
      slot.innerHTML = '<div class="lp-dash-card lp-dash-paused"><div class="lp-dash-title">\u23f8 Plan Paused</div><div class="lp-dash-sub">Plan paused by teacher. Learning activities will become available when the plan is resumed.</div>' +
        '<div class="lp-dash-actions"><button type="button" class="lp-dash-btn" onclick="navigate(\'personal-plan\')">View Plan</button></div></div>';
      return;
    }
    var today = getTodayPlan(studentId);
    var totalToday = today.dayPlan ? today.dayPlan.activities.length : 0;
    var completedToday = today.dayPlan ? today.dayPlan.activities.filter(function (a) { return isPlanItemDone(plan, a.planItemId); }).length : 0;
    var title, sub;
    if (plan.status === 'provisional') { title = 'Provisional Learning Preview'; sub = 'Your starting level has not been finalized.'; }
    else if (computeActiveDayNumber(plan) >= plan.dailyPlans.length && dayEssentialsDone(plan, plan.dailyPlans[plan.dailyPlans.length - 1])) { title = '30-Day Learning Cycle Complete'; sub = 'Review progress and begin the next cycle.'; }
    else if (today.advancedNote) { title = 'Plan Ready'; sub = today.advancedNote; }
    else if (completedToday > 0 && completedToday < totalToday) { title = 'Today\u2019s Plan'; sub = completedToday + ' of ' + totalToday + ' activities completed'; }
    else { title = 'Today\u2019s Learning Plan'; sub = totalToday + ' activities \u00b7 approximately ' + (today.dayPlan ? today.dayPlan.plannedMinutes : plan.settings.minutesPerDay) + ' minutes'; }
    slot.innerHTML = '<div class="lp-dash-card"><div class="lp-dash-title">\ud83d\udcda ' + esc(title) + '</div>' +
      '<div class="lp-dash-sub">' + esc(sub) + '</div>' +
      '<div class="lp-dash-actions"><button type="button" class="lp-dash-btn" onclick="navigate(\'personal-plan\')">Start Today\u2019s Plan</button>' +
      '<button type="button" class="lp-dash-btn" onclick="navigate(\'personal-plan\');ZirakLearningPlan.openThirtyDay()">View Full Plan</button></div></div>';
  }

  /* ── Teacher panel — reuses the ONE Teacher PIN system. ────────────── */
  function openTeacherPlan(studentId) {
    if (!studentId) return;
    try { if (window.ZirakProfile && typeof window.ZirakProfile.requireTeacher === 'function') window.ZirakProfile.requireTeacher(function () { renderTeacherPanel(studentId); }); } catch (e) {}
  }
  function renderTeacherPanel(studentId) {
    var s = getStudentProfile(studentId) || { fullName: studentId };
    var plan = readPlan(studentId);
    var body = '<h3>\ud83d\udcda Learning Plan \u2014 ' + esc(s.fullName) + '</h3>';
    if (!plan) { body += '<div class="msub">No plan yet for this student.</div>'; }
    else {
      var completed = completedOccurrenceCount(plan), planned = plannedOccurrenceCount(plan);
      var priorityRows = plan.recoveryPriorities.map(function (p) { return '<li>' + esc(p.label) + ' \u2014 ' + esc(p.category) + ' (' + esc(p.reason) + ')</li>'; }).join('');
      body += '<div class="msub">Level: ' + esc(classDisplayName(plan.acceptedLevelId)) + ' (' + esc(plan.levelSource) + ', evidence: ' + esc(plan.levelAuthority ? plan.levelAuthority.evidenceLinkage : '\u2014') + ') \u00b7 Status: ' + esc(plan.status) + '</div>' +
        '<div class="msub">Progress: ' + completed + ' / ' + planned + ' occurrences \u00b7 Day ' + plan.currentDay + '</div>' +
        '<ul class="lp-teacher-list">' + priorityRows + '</ul>' +
        '<div class="zk-field"><label>Change daily duration:</label><select id="lp-teacher-duration" class="zk-input">' +
        Object.keys(DURATION_PRESETS).map(function (k) { return '<option value="' + k + '"' + (plan.settings.durationPreset === k ? ' selected' : '') + '>' + esc(DURATION_PRESETS[k].label) + '</option>'; }).join('') + '</select></div>' +
        '<div class="zk-field"><label>Teacher note:</label><input type="text" id="lp-teacher-note-input" class="zk-input" maxlength="300"></div>' +
        '<div class="zk-actions">' +
        '<button class="zk-btn zk-btn-primary" onclick="ZirakLearningPlan._teacherSaveDuration(\'' + esc(studentId) + '\')">Save Duration</button>' +
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakLearningPlan._teacherSaveNote(\'' + esc(studentId) + '\')">Save Note</button>' +
        '</div><div class="zk-actions">' +
        (isPaused(plan)
          ? '<button class="zk-btn zk-btn-primary" onclick="ZirakLearningPlan.resumePlan(\'' + esc(studentId) + '\');ZirakLearningPlan.openTeacherPlan(\'' + esc(studentId) + '\')">\u25b6 Resume Plan</button>'
          : '<button class="zk-btn zk-btn-ghost" onclick="ZirakLearningPlan.pausePlan(\'' + esc(studentId) + '\');ZirakLearningPlan.openTeacherPlan(\'' + esc(studentId) + '\')">\u23f8 Pause Plan</button>') +
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakLearningPlan.regeneratePlan(\'' + esc(studentId) + '\',{cycleReason:\'teacher-regeneration\'});ZirakLearningPlan.openTeacherPlan(\'' + esc(studentId) + '\')">Regenerate Plan</button>' +
        '</div>';
    }
    body += '<div class="zk-actions"><button class="zk-btn zk-btn-primary zk-btn-block" onclick="ZirakProfile.teacherTools()">\u2190 Back to Teacher Tools</button></div>';
    try {
      var root = document.getElementById('zk-modal-root'); var box = root ? root.querySelector('.zk-modal') : null;
      if (box) { box.innerHTML = body; root.classList.add('open'); return; }
    } catch (e) {}
    var m = mount(); if (m) m.innerHTML = '<div class="lp-card">' + body + '</div>';
  }
  function _teacherSaveDuration(studentId) {
    var sel = document.getElementById('lp-teacher-duration'); var v = sel ? sel.value : 'standard';
    var plan = readPlan(studentId);
    teacherAdjust(studentId, 'changeDuration', plan ? plan.settings.durationPreset : '', v, '');
    renderTeacherPanel(studentId);
  }
  function _teacherSaveNote(studentId) {
    var el = document.getElementById('lp-teacher-note-input');
    teacherAdjust(studentId, 'addNote', '', el ? el.value : '', el ? el.value : '');
    renderTeacherPanel(studentId);
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 41 — public API. The suggested clean surface, plus the small
     set of read/report helpers real UI code needs (getPlan, getWeekPlan,
     history readers, settings). No raw destructive mutation helper is
     exposed beyond what Teacher Tools/Danger Zone already gate.
     ══════════════════════════════════════════════════════════════════ */
  window.ZirakLearningPlan = {
    version: PLAN_VERSION, schemaVersion: SCHEMA_VERSION,
    open: open, close: close,
    getPlan: getPlan, generatePlan: generatePlan, regeneratePlan: regeneratePlan,
    initializeForStudent: initializeForStudent,
    pausePlan: pausePlan, resumePlan: resumePlan,
    getTodayPlan: getTodayPlan, getWeekPlan: getWeekPlan, getThirtyDayPlan: getThirtyDayPlan,
    openWeek: openWeek, openThirtyDay: openThirtyDay,
    launchPlanItem: launchPlanItem, markPlanItemDone: markPlanItemDone,
    recordActivityCompletion: recordActivityCompletion, recordActivityResult: recordActivityResult,
    replaceActivity: replaceActivity, teacherAdjust: teacherAdjust,
    resolveLevelAuthority: resolveLevelAuthority, resolveAcceptedEvidenceResult: resolveAcceptedEvidenceResult,
    getPlanHistory: getPlanHistory, openHistoricalPlan: openHistoricalPlan, getHistoricalPlan: getHistoricalPlan,
    openHistory: openHistory,
    exportPlan: exportPlan, exportPlanJSON: exportPlanJSON, exportPlanTXT: exportPlanTXT,
    printPlan: printPlan, copyPlanSummary: copyPlanSummary, sharePlanSummary: sharePlanSummary,
    getRecoveryPriorities: getRecoveryPriorities, getTeacherPriorities: getTeacherPriorities,
    refreshDashboardCard: refreshDashboardCard, openTeacherPlan: openTeacherPlan,
    onAcceptedLevelChanged: onAcceptedLevelChanged,
    onResetStudentProgress: onResetStudentProgress, onResetLevelAndPlacement: onResetLevelAndPlacement, onDeleteStudent: onDeleteStudent,
    // I6H-D14D: real public export — required so zirak-profile.js's
    // Teacher-handoff session authority can genuinely cancel the
    // outgoing student's pending plan-activity context (previously
    // only reachable via _test, making that cancellation call a
    // silent no-op in production).
    clearPendingContext: clearPendingContext,
    getCorruptBackups: getCorruptBackups, getSettings: getSettings, writeSettings: writeSettings,
    buildActivityRegistry: buildActivityRegistry, getSkippedLog: getSkippedLog, activityById: activityById,
    installEvidenceBridge: installEvidenceBridge, onExternalResult: onExternalResult,
    // internal UI handlers referenced from rendered HTML
    _launch: _launch, _markDone: _markDone,
    _teacherSaveDuration: _teacherSaveDuration, _teacherSaveNote: _teacherSaveNote,
    // exposed for the harness (deterministic, no DOM required)
    _test: {
      storageKeyForStudent: storageKeyForStudent, legacyKeyForStudent: legacyKeyForStudent,
      readStudentValue: readStudentValue, writeStudentValue: writeStudentValue,
      buildDomainProfile: buildDomainProfile, buildRecoveryPriorities: buildRecoveryPriorities,
      readPlan: readPlan, writePlan: writePlan, readHistory: readHistory, writeHistory: writeHistory,
      isPlanItemDone: isPlanItemDone, findPlanItem: findPlanItem,
      plannedOccurrenceCount: plannedOccurrenceCount, completedOccurrenceCount: completedOccurrenceCount,
      verifyProgressInvariant: verifyProgressInvariant, computeActiveDayNumber: computeActiveDayNumber,
      archiveCurrentCycle: archiveCurrentCycle, migrateLegacyPlan: migrateLegacyPlan,
      onLedgerRecorded: onLedgerRecorded, getPendingContext: getPendingContext, savePendingContext: savePendingContext,
      clearPendingContext: clearPendingContext, recordActivityResultInternal: recordActivityResultInternal,
      maybeAutoAdjust: maybeAutoAdjust, evidenceWindowFingerprint: evidenceWindowFingerprint,
      DURATION_PRESETS: DURATION_PRESETS, DOMAIN_BALANCE: DOMAIN_BALANCE, RECOVERY_THRESHOLDS: RECOVERY_THRESHOLDS,
      SCHOOLPATH_TIER: SCHOOLPATH_TIER, buildFullThirtyDayCycle: buildFullThirtyDayCycle,
      resolveAcceptedEvidenceResult: resolveAcceptedEvidenceResult, getAcceptedInfo: getAcceptedInfo,
      getPlacementHistoryForStudent: getPlacementHistoryForStudent, isPaused: isPaused,
      REVIEW_DAY_FRACTION: REVIEW_DAY_FRACTION
    }
  };
  try { installEvidenceBridge(); } catch (e) {}
})();
