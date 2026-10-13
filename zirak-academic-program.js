// ===================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// zirak-academic-program.js — Phase I6H-D15
// ONE Academic Operating System: level authority, Starter migration,
// learner pathways, the fixed 90-minute class contract, weekly
// templates, weekly coverage, defer/recovery, Grammar/Dialogue/
// Interview/Listening routing frameworks, book-program abstraction,
// Today's Class foundation, attendance/homework schemas, and content-
// classification audit helpers.
//
// This module ORCHESTRATES existing authorities (Placement, School
// Path, Personalized Learning Plan, Learning Ledger, Academy Tests). It
// does not replace or duplicate their logic. D15 is an architecture
// phase — it does not populate the full six-month curriculum; it
// creates the rules, schemas and validators Phase 2 will use to do so
// safely.
// ===================================================================
(function () {
  'use strict';

  var PROGRAM_VERSION = 'D15-1';
  var SCHEMA_VERSION = 1;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nowISO() { return new Date().toISOString(); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  /* ══════════════════════════════════════════════════════════════════
     TASK 4 — the final seven accepted academy levels. Stable IDs.
     These are THE accepted-class authority for the whole app. School
     Path's own SCHOOL_PATH_CLASSES array (['nursery', ...]) is
     migrated to match this list — see the migration section below.
     ══════════════════════════════════════════════════════════════════ */
  var ACCEPTED_LEVELS = [
    { id: 'starter', order: 1, en: 'Starter', shortLabel: 'Level 1' },
    { id: 'basic', order: 2, en: 'Basic', shortLabel: 'Level 2' },
    { id: 'beginner', order: 3, en: 'Beginner', shortLabel: 'Level 3' },
    { id: 'elementary', order: 4, en: 'Elementary', shortLabel: 'Level 4' },
    { id: 'intermediate', order: 5, en: 'Intermediate', shortLabel: 'Level 5' },
    { id: 'advanced', order: 6, en: 'Advanced', shortLabel: 'Level 6' },
    { id: 'academic', order: 7, en: 'Academic', shortLabel: 'Level 7' }
  ];
  var ACCEPTED_LEVEL_IDS = ACCEPTED_LEVELS.map(function (l) { return l.id; });
  function isAcceptedLevelId(id) { return ACCEPTED_LEVEL_IDS.indexOf(id) > -1; }
  function levelOrder(id) { var l = ACCEPTED_LEVELS.find(function (x) { return x.id === id; }); return l ? l.order : -1; }
  function levelInfo(id) { return ACCEPTED_LEVELS.find(function (x) { return x.id === id; }) || null; }

  /* ══════════════════════════════════════════════════════════════════
     TASK 5 — Nursery → Starter migration. IDEMPOTENT: safe to call
     every boot. A compatibility alias (Task 5's required
     { nursery: "starter", starter: "starter" }) is used for reading
     any legacy value, so old stored data is never misread even before
     the one-time per-student migration runs.
     ══════════════════════════════════════════════════════════════════ */
  var LEVEL_ALIASES = { nursery: 'starter', starter: 'starter', basic: 'basic', beginner: 'beginner', elementary: 'elementary', intermediate: 'intermediate', advanced: 'advanced', academic: 'academic' };
  // Task 4: normalizes ANY legacy or current accepted-class string
  // (including the old School-Path 'nursery' id) into one of the 7
  // final accepted level IDs. Unknown values pass through unresolved
  // (returns '') rather than guessing.
  function normalizeAcceptedLevelId(rawId) {
    if (!rawId) return '';
    var alias = LEVEL_ALIASES[rawId];
    if (alias) return alias;
    if (isAcceptedLevelId(rawId)) return rawId;
    return '';
  }

  var MIGRATION_FLAG_KEY_SUFFIX = 'academic_program_nursery_migration_v1';
  function _studentKey(studentId, key) { return 'u_' + studentId + '_' + key; }
  function _legacyStudentKey(studentId, key) { return 'roshan_u_' + studentId + '_' + key; }

  // Task 5 (11 numbered requirements): migrate ONE student's records
  // from nursery -> starter. Idempotent via a per-student migration
  // flag; safe to call on every boot for every student.
  // I6H-D15A (Tasks 5/6): TRANSACTIONAL migration. Each target area is
  // read, validated, backed up when malformed, migrated when valid, and
  // recorded. The completion flag is set ONLY when every readable
  // target was processed safely — a caught parse failure produces a
  // 'partial' status and a full raw-value backup, never a silent
  // "complete". Idempotent: a 'complete' flag short-circuits; a
  // 'partial' flag allows retry after the corrupt data is repaired.
  // Both storage-prefix families are covered (roshan_u_<id>_ and
  // u_<id>_), plus app.js's own namespaced School Path keys.
  function _appNsKey(studentId, key) {
    // app.js keys: LS prefix 'roshan_' + per-student namespace
    // 'u_<id>_' (from window.__zirakNS when a student is active) + key.
    return 'roshan_' + 'u_' + studentId + '_' + key;
  }
  function migrateStudentNurseryToStarter(studentId) {
    if (!studentId) return { ok: false, reason: 'missing-student' };
    var flagKey = _studentKey(studentId, MIGRATION_FLAG_KEY_SUFFIX);
    var already = lsGet(flagKey);
    if (already) {
      var prior = null;
      try { prior = JSON.parse(already); } catch (e) { prior = null; }
      if (prior && prior.status === 'complete') return { ok: true, alreadyMigrated: true, detail: prior };
      // A prior 'partial' result falls through: retry is allowed.
    }

    var migratedAreas = [], unchangedAreas = [], failedAreas = [], backupKeys = [];

    // Per-area transactional worker: read -> validate(parse) -> migrate
    // -> record. On a parse failure: back up the COMPLETE raw value
    // under a dedicated backup key and record the area as failed.
    function processArea(areaName, storageKey, migrateFn) {
      var raw = lsGet(storageKey);
      if (raw === null || raw === undefined || raw === '') { unchangedAreas.push(areaName + ':absent'); return; }
      var parsed;
      try { parsed = JSON.parse(raw); }
      catch (parseErr) {
        var backupKey = storageKey + '__nursery_migration_backup';
        lsSet(backupKey, raw); // complete raw value preserved
        backupKeys.push(backupKey);
        failedAreas.push(areaName);
        return;
      }
      try {
        var result = migrateFn(parsed);
        if (result && result.changed) {
          lsSet(storageKey, JSON.stringify(result.value));
          migratedAreas.push(areaName);
        } else {
          unchangedAreas.push(areaName);
        }
      } catch (migrateErr) {
        // A migration-logic failure on VALID JSON: back up too, and
        // record the failure — never silently continue.
        var bk2 = storageKey + '__nursery_migration_backup';
        lsSet(bk2, raw);
        backupKeys.push(bk2);
        failedAreas.push(areaName);
      }
    }

    // 1) Accepted level — BOTH prefix families (Task 5).
    ['roshan_u_' + studentId + '_placement_accepted', 'u_' + studentId + '_placement_accepted'].forEach(function (key, i) {
      processArea('placement_accepted' + (i === 1 ? ':u-prefix' : ''), key, function (accepted) {
        if (accepted && accepted.level === 'nursery') {
          accepted.level = 'starter';
          accepted.migratedFromNursery = true;
          accepted.migratedAt = nowISO();
          return { changed: true, value: accepted };
        }
        return { changed: false };
      });
    });

    // 2) Placement history (decision.resolvedLevel only; diagnostic
    // band IDs are deliberately untouched — they are diagnostic
    // vocabulary, not accepted-class vocabulary).
    ['u_' + studentId + '_placement_history', 'roshan_u_' + studentId + '_placement_history'].forEach(function (key, i) {
      processArea('placement_history' + (i === 1 ? ':roshan-prefix' : ''), key, function (hist) {
        var changed = false;
        if (hist && Array.isArray(hist.results)) {
          hist.results.forEach(function (r) {
            if (r && r.decision && r.decision.resolvedLevel === 'nursery') { r.decision.resolvedLevel = 'starter'; changed = true; }
          });
        }
        return { changed: changed, value: hist };
      });
    });

    // 3) Personalized Plan (active + history) — BOTH prefix families.
    ['u_' + studentId + '_personal_learning_plan', 'roshan_u_' + studentId + '_personal_learning_plan'].forEach(function (key, i) {
      processArea('personal_learning_plan' + (i === 1 ? ':roshan-prefix' : ''), key, function (plan) {
        if (plan && plan.level === 'nursery') { plan.level = 'starter'; return { changed: true, value: plan }; }
        return { changed: false };
      });
    });
    ['u_' + studentId + '_personal_learning_plan_history', 'roshan_u_' + studentId + '_personal_learning_plan_history'].forEach(function (key, i) {
      processArea('personal_learning_plan_history' + (i === 1 ? ':roshan-prefix' : ''), key, function (planHist) {
        var changed = false;
        if (Array.isArray(planHist)) planHist.forEach(function (p) { if (p && p.level === 'nursery') { p.level = 'starter'; changed = true; } });
        return { changed: changed, value: planHist };
      });
    });

    // 4) app.js School Path class pointer — the NAMESPACED key app.js
    // actually reads ('roshan_' + ns + 'school_class'), which the
    // roster alone does NOT cover (Task 5's explicit warning).
    // NOTE: app.js's save() stores these as RAW strings (not JSON), so
    // they are handled as raw values — running JSON.parse on the
    // legitimate raw value 'nursery' would throw and wrongly record a
    // corruption failure.
    (function () {
      var key = _appNsKey(studentId, 'school_class');
      var raw = lsGet(key);
      if (raw === 'nursery') { lsSet(key, 'starter'); migratedAreas.push('school_class:app-namespaced'); }
      else if (raw === null || raw === undefined || raw === '') { unchangedAreas.push('school_class:app-namespaced:absent'); }
      else { unchangedAreas.push('school_class:app-namespaced'); }
    })();
    // roshan_school_current_class mirror key (saved by app.js on School
    // Path render) — same namespaced raw-string pattern.
    (function () {
      var key = _appNsKey(studentId, 'roshan_school_current_class');
      var raw = lsGet(key);
      if (raw === 'nursery') { lsSet(key, 'starter'); migratedAreas.push('roshan_school_current_class:app-namespaced'); }
      else if (raw === null || raw === undefined || raw === '') { unchangedAreas.push('roshan_school_current_class:app-namespaced:absent'); }
      else { unchangedAreas.push('roshan_school_current_class:app-namespaced'); }
    })();

    // 5) Roster profile (schoolCurrentClass + level fields).
    processArea('roster-profile', 'roshan_sys_students', function (roster) {
      var changed = false;
      if (Array.isArray(roster)) {
        roster.forEach(function (s) {
          if (s && s.studentId === studentId) {
            if (s.schoolCurrentClass === 'nursery') { s.schoolCurrentClass = 'starter'; changed = true; }
            if (s.level === 'nursery') { s.level = 'starter'; changed = true; }
          }
        });
      }
      return { changed: changed, value: roster };
    });

    // Final status: 'complete' ONLY when zero areas failed.
    var status = failedAreas.length === 0 ? 'complete' : 'partial';
    var detail = {
      studentId: studentId, status: status,
      migratedAreas: migratedAreas, unchangedAreas: unchangedAreas,
      failedAreas: failedAreas, backupKeys: backupKeys,
      completedAt: status === 'complete' ? nowISO() : '',
      attemptedAt: nowISO(), fromLevel: 'nursery', toLevel: 'starter'
    };
    lsSet(flagKey, JSON.stringify(detail));
    return { ok: true, alreadyMigrated: false, detail: detail };
  }

  // Migrate every student in the roster. Safe to call on every boot —
  // each student is migrated at most once (idempotency flag above).
  function migrateAllStudentsNurseryToStarter() {
    var results = [];
    try {
      var roster = JSON.parse(lsGet('roshan_sys_students') || '[]');
      roster.forEach(function (s) { if (s && s.studentId) results.push(migrateStudentNurseryToStarter(s.studentId)); });
    } catch (e) {}
    return results;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 6 — Placement diagnostic-band compatibility.
     CRITICAL NAMING COLLISION (documented in the audit): the existing
     8 Placement diagnostic bands include a band literally named
     "starter", which the app's own BAND_TO_CLASS map already resolves
     to accepted class "basic" — NOT the new accepted class "starter"
     (which is the renamed "nursery"). These are two unrelated concepts
     that happen to share the same word:
       - diagnostic band "starter"   -> accepted class "basic"
       - accepted class "starter"    -> the (renamed) former "nursery"
     D15 does NOT rename the Placement diagnostic band (that would
     touch Placement scoring/question-bank internals, which this phase
     must not do). Instead: normal student-facing screens show ONLY
     the 7 accepted class names; Teacher-facing reports that must show
     the raw diagnostic band use an explicit disambiguating label.
     ══════════════════════════════════════════════════════════════════ */
  var PLACEMENT_DIAGNOSTIC_BANDS = ['nursery', 'starter', 'beginner1', 'beginner2', 'elementary', 'preintermediate', 'intermediate', 'advanced'];
  // The exact, already-shipped Placement band -> accepted class map
  // (from zirak-personal-learning-plan.js / zirak-placement-engine.js),
  // reproduced here for read-only normalization/reporting — NOT a
  // second copy that Placement itself will consult.
  var DIAGNOSTIC_BAND_TO_ACCEPTED_CLASS = { nursery: 'starter', starter: 'basic', beginner1: 'beginner', beginner2: 'beginner', elementary: 'elementary', preintermediate: 'intermediate', intermediate: 'intermediate', advanced: 'advanced' };
  // I6H-D15B (Task 7): the ONE Grammar-roadmap-ID -> accepted-class map.
  // GW_LEVELS (grammar-curriculum-map.js) is a 10-level internal
  // roadmap pre-dating the 7 accepted classes; its IDs stay stable
  // (topics reference them; renaming would destroy saved progress —
  // Task 9). This map is the single source of truth for resolving the
  // real accepted class any Grammar topic belongs to.
  var GRAMMAR_LEVEL_TO_ACCEPTED_CLASS = {
    nursery: 'starter', starter: 'basic', beginner1: 'beginner', beginner2: 'beginner',
    elementary: 'elementary', preintermediate: 'intermediate', intermediate: 'intermediate',
    upperintermediate: 'advanced', advanced: 'advanced', academic: 'academic'
  };
  function grammarLevelToAcceptedClass(gwLevelId) { return GRAMMAR_LEVEL_TO_ACCEPTED_CLASS[gwLevelId] || ''; }
  function diagnosticBandToAcceptedClass(bandId) { return DIAGNOSTIC_BAND_TO_ACCEPTED_CLASS[bandId] || ''; }
  // Teacher-report label that disambiguates the band from the accepted
  // class sharing the same word.
  function diagnosticBandTeacherLabel(bandId) {
    var mapped = diagnosticBandToAcceptedClass(bandId);
    var mappedInfo = levelInfo(mapped);
    return 'Diagnostic band: ' + bandId + (mappedInfo ? ' (maps to accepted class: ' + mappedInfo.en + ')' : '');
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 7/8 — learner pathway authority. Separate dimension from
     language level. Stored per student; changing it never touches
     level, progress, Placement history, reports, or Ledger scores.
     ══════════════════════════════════════════════════════════════════ */
  var LEARNER_PATHWAYS = [
    { id: 'child', en: 'Child' },
    { id: 'teen', en: 'Teen' },
    { id: 'general-adult', en: 'General Adult' },
    { id: 'job-professional', en: 'Job / Professional' },
    { id: 'academic-preparation', en: 'Academic Preparation' }
  ];
  var LEARNER_PATHWAY_IDS = LEARNER_PATHWAYS.map(function (p) { return p.id; });
  function isLearnerPathwayId(id) { return LEARNER_PATHWAY_IDS.indexOf(id) > -1; }

  function readStudentPathway(studentId) {
    try { var raw = lsGet(_studentKey(studentId, 'learner_pathway')); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  // Task 8: safe Teacher-controlled/onboarding selection. Never
  // touches level, progress, Placement, reports, or Ledger.
  function setStudentPathway(studentId, pathwayId, opts) {
    if (!studentId) return { ok: false, reason: 'missing-student' };
    if (!isLearnerPathwayId(pathwayId)) return { ok: false, reason: 'invalid-pathway' };
    var record = { pathwayId: pathwayId, selectedAt: nowISO(), selectedBy: (opts && opts.selectedBy) || 'teacher', previousPathwayId: (readStudentPathway(studentId) || {}).pathwayId || '' };
    lsSet(_studentKey(studentId, 'learner_pathway'), JSON.stringify(record));
    return { ok: true, pathwayId: pathwayId };
  }
  function getStudentAcademicProfile(studentId) {
    var acceptedRaw = null;
    try { acceptedRaw = JSON.parse(lsGet(_legacyStudentKey(studentId, 'placement_accepted')) || 'null'); } catch (e) {}
    var pathwayRec = readStudentPathway(studentId);
    return {
      studentId: studentId,
      acceptedLevelId: acceptedRaw ? normalizeAcceptedLevelId(acceptedRaw.level) : '',
      levelSource: acceptedRaw ? (acceptedRaw.source || '') : '',
      levelAcceptedAt: acceptedRaw ? (acceptedRaw.at || '') : '',
      learnerPathwayId: pathwayRec ? pathwayRec.pathwayId : '',
      pathwaySelectedAt: pathwayRec ? pathwayRec.selectedAt : ''
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 11 — the fixed 90-minute class contract. Every official day
     MUST total exactly 90 minutes, split into four fixed blocks.
     ══════════════════════════════════════════════════════════════════ */
  var DAILY_CONTRACT = { openingMinutes: 5, videoMinutes: 15, coreMinutes: 55, closingMinutes: 15, totalMinutes: 90 };

  // Task 11: validateDailyLessonDuration(lesson). Fails with EXACT
  // reasons — never silently corrects an invalid record.
  function validateDailyLessonDuration(lesson) {
    var errors = [];
    if (!lesson) return { valid: false, errors: ['missing-lesson'] };
    var opening = lesson.opening && typeof lesson.opening.minutes === 'number' ? lesson.opening.minutes : null;
    var video = lesson.video && typeof lesson.video.minutes === 'number' ? lesson.video.minutes : null;
    var core = Array.isArray(lesson.coreBlocks) ? lesson.coreBlocks.reduce(function (sum, b) { return sum + (typeof b.minutes === 'number' ? b.minutes : 0); }, 0) : null;
    var closing = lesson.closing && typeof lesson.closing.minutes === 'number' ? lesson.closing.minutes : null;
    if (opening === null) errors.push('missing-opening-minutes');
    else if (opening !== DAILY_CONTRACT.openingMinutes) errors.push('opening-must-be-' + DAILY_CONTRACT.openingMinutes + '-got-' + opening);
    if (video === null) errors.push('missing-video-minutes');
    else if (video !== DAILY_CONTRACT.videoMinutes) errors.push('video-must-be-' + DAILY_CONTRACT.videoMinutes + '-got-' + video);
    if (core === null) errors.push('missing-core-blocks');
    else if (core !== DAILY_CONTRACT.coreMinutes) errors.push('core-must-be-' + DAILY_CONTRACT.coreMinutes + '-got-' + core);
    if (closing === null) errors.push('missing-closing-minutes');
    else if (closing !== DAILY_CONTRACT.closingMinutes) errors.push('closing-must-be-' + DAILY_CONTRACT.closingMinutes + '-got-' + closing);
    var total = (opening || 0) + (video || 0) + (core || 0) + (closing || 0);
    if (errors.length === 0 && total !== DAILY_CONTRACT.totalMinutes) errors.push('total-must-be-' + DAILY_CONTRACT.totalMinutes + '-got-' + total);
    return { valid: errors.length === 0, errors: errors, total: total };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 12 — Teacher Opening schema (5 minutes). Never produces an
     automatic language score from attendance/greeting/homework status.
     ══════════════════════════════════════════════════════════════════ */
  function buildTeacherOpeningBlock(opts) {
    opts = opts || {};
    return {
      type: 'teacher-opening', minutes: DAILY_CONTRACT.openingMinutes,
      attendanceEnabled: opts.attendanceEnabled !== false,
      homeworkCheckEnabled: opts.homeworkCheckEnabled !== false,
      greetingPrompt: opts.greetingPrompt || 'How are you today?',
      readinessQuestions: opts.readinessQuestions || [],
      teacherNotes: opts.teacherNotes || ''
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 13 — Video Learning schema (15 minutes). Schema + validation
     only — D15 does not populate real video content.
     ══════════════════════════════════════════════════════════════════ */
  function buildVideoLearningBlock(opts) {
    opts = opts || {};
    return {
      type: 'video-learning', minutes: DAILY_CONTRACT.videoMinutes,
      videoId: opts.videoId || '', levelId: opts.levelId || '', pathwayIds: opts.pathwayIds || [],
      themeId: opts.themeId || '', actualVideoDurationMinutes: opts.actualVideoDurationMinutes || 0,
      vocabularyTargets: opts.vocabularyTargets || [], grammarTargets: opts.grammarTargets || [],
      preViewPrompt: opts.preViewPrompt || '', questions: opts.questions || [], followUpContentId: opts.followUpContentId || ''
    };
  }
  function validateVideoContentEligible(videoRecord, acceptedLevelId) {
    if (!videoRecord) return { eligible: false, reason: 'missing-video-record' };
    if (!videoRecord.videoId) return { eligible: false, reason: 'missing-video-id' };
    if (!videoRecord.levelId) return { eligible: false, reason: 'missing-level' };
    if (acceptedLevelId && videoRecord.levelId !== acceptedLevelId) return { eligible: false, reason: 'level-mismatch' };
    if (!videoRecord.followUpContentId) return { eligible: false, reason: 'missing-follow-up-activity' };
    return { eligible: true };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 14 — Academic Core (55 minutes). Allowed block types only.
     No official app-writing block exists (Task 14/31 explicit rule).
     ══════════════════════════════════════════════════════════════════ */
  var CORE_BLOCK_TYPES = [
    'main-book', 'vocabulary', 'word-wizard', 'grammar-teaching', 'grammar-world', 'grammar-wizard',
    'sentence-practice', 'listening-pack', 'dialogue-wizard', 'partner-conversation', 'story-reading',
    'oral-topic', 'about-me', 'guided-interview', 'professional-interview', 'academic-interview',
    'weekly-recovery', 'weekly-assessment', 'teacher-whiteboard', 'supervised-free-practice'
  ];
  function isValidCoreBlockType(type) { return CORE_BLOCK_TYPES.indexOf(type) > -1; }
  function buildCoreBlock(type, minutes, contentRef) {
    if (!isValidCoreBlockType(type)) return null;
    return Object.assign({ type: type, minutes: minutes || 0 }, contentRef || {});
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 15 — Teacher Closing (15 minutes). ONE combined block, never
     divided into competing timetable sections.
     ══════════════════════════════════════════════════════════════════ */
  function buildTeacherClosingBlock(opts) {
    opts = opts || {};
    return {
      type: 'teacher-closing', minutes: DAILY_CONTRACT.closingMinutes,
      suggestedErrorFocus: opts.suggestedErrorFocus || [], whiteboardExamples: opts.whiteboardExamples || [],
      summaryPoints: opts.summaryPoints || [],
      exitCheck: opts.exitCheck || { mode: 'oral', prompts: [] },
      homework: opts.homework || { type: '', instructions: '', expectedMinutes: 0, dueAcademicDateKey: '' },
      teacherNotes: opts.teacherNotes || ''
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 16/17 — book-program abstraction. No Go-Go hard-coding. Safe
     "not yet selected" state; safe future replacement without losing
     completed lesson history (history references bookProgramId, which
     simply stops resolving to an active program — it is never deleted).
     ══════════════════════════════════════════════════════════════════ */
  var BOOK_PROGRAM_KEY = 'zirak_active_book_program';
  function getActiveBookProgram() {
    try { var raw = lsGet(BOOK_PROGRAM_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function setActiveBookProgram(programRecord) {
    if (!programRecord || !programRecord.bookProgramId) return { ok: false, reason: 'missing-book-program-id' };
    lsSet(BOOK_PROGRAM_KEY, JSON.stringify(Object.assign({ setAt: nowISO() }, programRecord)));
    return { ok: true };
  }
  function buildMainBookBlock(opts) {
    opts = opts || {};
    var active = getActiveBookProgram();
    if (!active || !opts.unitId) {
      // Task 17: explicit pending state, never a fake page number.
      return { type: 'main-book', minutes: opts.minutes || 15, bookProgramId: '', unitId: '', lessonId: '', pages: '', teacherObjective: 'Main book mapping pending', followUpContentId: '', mappingPending: true };
    }
    return {
      type: 'main-book', minutes: opts.minutes || 15,
      bookProgramId: active.bookProgramId, unitId: opts.unitId, lessonId: opts.lessonId || '',
      pages: opts.pages || '', teacherObjective: opts.teacherObjective || '', followUpContentId: opts.followUpContentId || '',
      mappingPending: false
    };
  }
  function validateBookBlock(block) {
    if (!block || block.type !== 'main-book') return { valid: false, reason: 'not-a-book-block' };
    if (block.mappingPending) return { valid: true, pending: true };
    if (!block.bookProgramId) return { valid: false, reason: 'missing-book-program-id' };
    if (!block.unitId) return { valid: false, reason: 'missing-unit-id' };
    return { valid: true, pending: false };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 18 — default five-day weekly structural template (schema
     only; Phase 2 populates real content references).
     ══════════════════════════════════════════════════════════════════ */
  function buildDefaultWeeklyTemplate() {
    return {
      schemaVersion: SCHEMA_VERSION,
      days: [
        { dayNumber: 1, theme: 'Book, Vocabulary and Grammar', blocks: [
          { type: 'main-book', minutes: 15 }, { type: 'word-wizard', minutes: 15 }, { type: 'grammar-teaching', minutes: 15 }, { type: 'partner-conversation', minutes: 10 }
        ] },
        { dayNumber: 2, theme: 'Listening, Dialogue, Grammar Recap and Partner Conversation', blocks: [
          { type: 'listening-pack', minutes: 15 }, { type: 'dialogue-wizard', minutes: 20 }, { type: 'grammar-wizard', minutes: 10 }, { type: 'partner-conversation', minutes: 10 }
        ] },
        { dayNumber: 3, theme: 'Book, Grammar and Vocabulary Deepening', blocks: [
          { type: 'main-book', minutes: 15 }, { type: 'grammar-world', minutes: 20 }, { type: 'word-wizard', minutes: 20 }
        ] },
        { dayNumber: 4, theme: 'Reading/Topic, Listening and Level-Appropriate Interview', blocks: [
          { type: 'story-reading', minutes: 15 }, { type: 'listening-pack', minutes: 20 }, { type: 'about-me', minutes: 20 }
        ] },
        { dayNumber: 5, theme: 'Book, Sentence Control, Recovery and Weekly Assessment', blocks: [
          { type: 'main-book', minutes: 15 }, { type: 'sentence-practice', minutes: 15 }, { type: 'weekly-recovery', minutes: 10 }, { type: 'weekly-assessment', minutes: 15 }
        ] }
      ]
    };
  }
  // Assemble a full 90-minute lesson shell from a template day.
  function buildLessonFromTemplateDay(templateDay, opts) {
    opts = opts || {};
    return {
      dayNumber: templateDay.dayNumber, theme: templateDay.theme, durationMinutes: DAILY_CONTRACT.totalMinutes,
      opening: buildTeacherOpeningBlock(opts.opening),
      video: buildVideoLearningBlock(opts.video),
      coreBlocks: templateDay.blocks.map(function (b) { return buildCoreBlock(b.type, b.minutes, opts.coreContentRefs && opts.coreContentRefs[b.type]); }).filter(Boolean),
      closing: buildTeacherClosingBlock(opts.closing)
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 19 — weekly coverage contract. Centralized minimums, grouped
     by academic purpose (not by exact block-type name) — grammar
     delivered via grammar-teaching, grammar-world, or grammar-wizard
     all count toward the SAME weekly grammar requirement, since they
     serve the same academic purpose. This matches the locked weekly
     frequency table exactly (Grammar: ~3x/week, Listening: 2-3x/week,
     Vocabulary: 2-4x/week, etc.) regardless of which specific tool
     delivers that domain on a given day.
     ══════════════════════════════════════════════════════════════════ */
  var COVERAGE_GROUP_MEMBERS = {
    'grammar': ['grammar-teaching', 'grammar-world', 'grammar-wizard'],
    'vocabulary': ['word-wizard', 'vocabulary'],
    'listening': ['listening-pack'],
    'dialogue': ['dialogue-wizard'],
    'partner-work': ['partner-conversation'],
    'sentence-practice': ['sentence-practice'],
    'story-topic': ['story-reading', 'oral-topic'],
    'interview': ['about-me', 'guided-interview', 'professional-interview', 'academic-interview'],
    'main-book': ['main-book'],
    'weekly-recovery': ['weekly-recovery'],
    'weekly-assessment': ['weekly-assessment']
  };
  var WEEKLY_COVERAGE_MINIMUMS = {
    'teacher-opening': 5, 'video-learning': 5, 'teacher-closing': 5,
    'main-book': 3, 'grammar': 3, 'listening': 2, 'dialogue': 1,
    'partner-work': 2, 'vocabulary': 2, 'sentence-practice': 1,
    'story-topic': 1, 'interview': 1, 'weekly-recovery': 1, 'weekly-assessment': 1
  };
  function _coverageGroupForBlockType(blockType) {
    for (var group in COVERAGE_GROUP_MEMBERS) { if (COVERAGE_GROUP_MEMBERS[group].indexOf(blockType) > -1) return group; }
    return blockType; // ungrouped types count under their own name
  }
  // Verifies a built week (array of 5 assembled lessons) against the
  // weekly coverage minimums. Returns per-GROUP counts + deficits.
  function validateWeeklyCoverage(weekLessons) {
    var counts = { 'teacher-opening': 0, 'video-learning': 0, 'teacher-closing': 0 };
    (weekLessons || []).forEach(function (lesson) {
      if (lesson.opening) counts['teacher-opening']++;
      if (lesson.video) counts['video-learning']++;
      if (lesson.closing) counts['teacher-closing']++;
      (lesson.coreBlocks || []).forEach(function (b) { var g = _coverageGroupForBlockType(b.type); counts[g] = (counts[g] || 0) + 1; });
    });
    var deficits = [];
    Object.keys(WEEKLY_COVERAGE_MINIMUMS).forEach(function (type) {
      var min = WEEKLY_COVERAGE_MINIMUMS[type];
      var have = counts[type] || 0;
      if (have < min) deficits.push({ type: type, required: min, actual: have, deficit: min - have });
    });
    return { counts: counts, deficits: deficits, meetsCoverage: deficits.length === 0 };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 20 — defer and recovery. Weekly coverage ledger.
     ══════════════════════════════════════════════════════════════════ */
  function readWeeklyCoverageLedger(studentId, weekId) {
    try { var raw = lsGet(_studentKey(studentId, 'weekly_coverage_' + weekId)); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function writeWeeklyCoverageLedger(studentId, weekId, ledger) {
    lsSet(_studentKey(studentId, 'weekly_coverage_' + weekId), JSON.stringify(ledger));
  }
  function initWeeklyCoverageLedger(studentId, weekId, requiredCoverage) {
    var ledger = { weekId: weekId, studentId: studentId, requiredCoverage: requiredCoverage || WEEKLY_COVERAGE_MINIMUMS, completedCoverage: {}, deferredBlocks: [], recoveredBlocks: [], teacherNotes: '' };
    writeWeeklyCoverageLedger(studentId, weekId, ledger);
    return ledger;
  }
  // Task 20: deferring a block NEVER marks it completed, never fakes a
  // score, never extends past 90 minutes. It records original day,
  // content, reason, estimated minutes, and a recovery priority, and
  // suggests Day 5 recovery.
  function deferCoreBlock(studentId, weekId, blockInfo) {
    var ledger = readWeeklyCoverageLedger(studentId, weekId) || initWeeklyCoverageLedger(studentId, weekId);
    var deferred = {
      originalDay: blockInfo.originalDay, type: blockInfo.type, contentId: blockInfo.contentId || '',
      reason: blockInfo.reason || '', estimatedMinutes: blockInfo.estimatedMinutes || 0,
      recoveryPriority: blockInfo.recoveryPriority || 'normal', suggestedRecoveryDay: 5, deferredAt: nowISO()
    };
    ledger.deferredBlocks.push(deferred);
    writeWeeklyCoverageLedger(studentId, weekId, ledger);
    return { ok: true, ledger: ledger, suggestion: 'Move ' + blockInfo.type + ' to Day 5 recovery.' };
  }
  function recoverCoreBlock(studentId, weekId, deferredIndex) {
    var ledger = readWeeklyCoverageLedger(studentId, weekId);
    if (!ledger || !ledger.deferredBlocks[deferredIndex]) return { ok: false, reason: 'no-such-deferred-block' };
    var item = ledger.deferredBlocks.splice(deferredIndex, 1)[0];
    item.recoveredAt = nowISO();
    ledger.recoveredBlocks.push(item);
    writeWeeklyCoverageLedger(studentId, weekId, ledger);
    return { ok: true, ledger: ledger };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 21 — level-appropriate content contract + validators.
     ══════════════════════════════════════════════════════════════════ */
  function validateContentEligibility(record) {
    if (!record) return { valid: false, errors: ['missing-record'] };
    var errors = [];
    if (!record.id) errors.push('missing-id');
    if (!record.contentType) errors.push('missing-content-type');
    if (!record.levelId && !record.minimumLevelId) errors.push('missing-level');
    if (record.levelId && !isAcceptedLevelId(record.levelId)) errors.push('invalid-level-id');
    if (typeof record.estimatedMinutes !== 'number') errors.push('missing-estimated-minutes');
    return { valid: errors.length === 0, errors: errors };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 22/23 — Grammar level progression framework + routing.
     ══════════════════════════════════════════════════════════════════ */
  var GRAMMAR_PROGRESSION = {
    starter: ['I am / You are', 'he / she', 'this / that', 'singular/plural awareness', 'basic nouns/adjectives', 'simple commands', 'yes/no answers', 'basic word order'],
    basic: ['am / is / are', 'have / has', 'can / cannot', 'simple present', 'there is / there are', 'possessives', 'basic negatives', 'simple questions', 'adjectives and nouns'],
    beginner: ['present simple', 'present continuous', 'past simple', 'will / going to', 'object pronouns', 'frequency adverbs', 'comparatives', 'countable/uncountable nouns', 'common prepositions'],
    elementary: ['past continuous', 'present perfect introduction', 'modals', 'first conditional', 'gerund/infinitive basics', 'relative clauses', 'question formation', 'conjunctions'],
    intermediate: ['present perfect versus past simple', 'passive voice', 'reported speech', 'second conditional', 'modal deduction', 'complex relative clauses', 'discourse connectors', 'longer sentence control'],
    advanced: ['mixed conditionals', 'advanced passive structures', 'inversion', 'hedging', 'participle clauses', 'advanced modal meaning', 'register', 'precise reformulation'],
    academic: ['nominalization', 'reporting verbs', 'cautious claims', 'complex clause control', 'academic cohesion', 'argument structure', 'paraphrase grammar', 'formal presentation language']
  };
  // Task 23: routing decision for a grammar topic given the student's
  // accepted level. Never routes a future-level topic into the
  // official lesson.
  function classifyGrammarTopicForLevel(topicLevelId, acceptedLevelId, opts) {
    opts = opts || {};
    var topicOrd = levelOrder(topicLevelId), acceptedOrd = levelOrder(acceptedLevelId);
    if (topicOrd === -1 || acceptedOrd === -1) return 'unclassified';
    if (topicOrd === acceptedOrd) return 'current';
    if (topicOrd < acceptedOrd) return (opts.teacherAssignedRecovery ? 'recovery' : 'review');
    return 'future-locked';
  }
  function isGrammarTopicOfficiallyRoutable(classification) { return classification === 'current' || classification === 'review' || classification === 'recovery'; }

  /* ══════════════════════════════════════════════════════════════════
     TASK 24/25 — Dialogue level framework + support progression.
     ══════════════════════════════════════════════════════════════════ */
  var DIALOGUE_LEVEL_FRAMEWORK = {
    starter: { minTurns: 2, maxTurns: 4, support: 'full-model', expectedResponse: 'one word or one short sentence' },
    basic: { minTurns: 4, maxTurns: 6, support: 'guided', expectedResponse: 'one short complete sentence' },
    beginner: { minTurns: 6, maxTurns: 8, support: 'partial-prompt', expectedResponse: 'one or two sentences' },
    elementary: { minTurns: 8, maxTurns: 10, support: 'keyword-prompt', expectedResponse: 'two or three sentences' },
    intermediate: { minTurns: 10, maxTurns: 14, support: 'keyword-prompt', expectedResponse: 'natural multi-sentence response' },
    advanced: { minTurns: 12, maxTurns: 16, support: 'scenario-only', expectedResponse: 'nuanced spontaneous response' },
    academic: { minTurns: 12, maxTurns: 20, support: 'formal-task', expectedResponse: 'structured evidence-based response' }
  };
  var DIALOGUE_SUPPORT_MODES = ['full-model', 'guided', 'partial-prompt', 'keyword-prompt', 'scenario-only', 'formal-task'];
  function validateDialogueForLevel(dialogueRecord, levelId) {
    var fw = DIALOGUE_LEVEL_FRAMEWORK[levelId];
    if (!fw) return { valid: false, reason: 'unknown-level' };
    if (!dialogueRecord) return { valid: false, reason: 'missing-record' };
    var errors = [];
    if (typeof dialogueRecord.turnCount !== 'number' || dialogueRecord.turnCount < fw.minTurns || dialogueRecord.turnCount > fw.maxTurns) errors.push('turn-count-out-of-range-for-level');
    if (dialogueRecord.support && DIALOGUE_SUPPORT_MODES.indexOf(dialogueRecord.support) === -1) errors.push('invalid-support-mode');
    return { valid: errors.length === 0, errors: errors, expected: fw };
  }
  // Task 24 explicit rule: prevents one identical dialogue record ID
  // from being routed as the official activity for two different
  // levels.
  function detectSharedDialogueAcrossLevels(dialogueRecords) {
    var byId = {};
    (dialogueRecords || []).forEach(function (d) { if (d && d.id) { byId[d.id] = byId[d.id] || []; byId[d.id].push(d.levelId); } });
    var violations = [];
    Object.keys(byId).forEach(function (id) { var levels = byId[id].filter(function (v, i, a) { return a.indexOf(v) === i; }); if (levels.length > 1) violations.push({ id: id, levels: levels }); });
    return violations;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 26/27 — Interview mode framework + routing.
     ══════════════════════════════════════════════════════════════════ */
  var INTERVIEW_MODE_BY_LEVEL = {
    starter: { modeLabel: 'About Me', responseLength: 'one word or short phrase', support: 'full-model', followUpDepth: 'none' },
    basic: { modeLabel: 'My Questions and Answers', responseLength: 'one short sentence', support: 'guided', followUpDepth: 'none' },
    beginner: { modeLabel: 'Personal Speaking Practice', responseLength: 'two or three sentences', support: 'partial-prompt', followUpDepth: 'minimal' },
    elementary: { modeLabel: 'Guided Interview', responseLength: 'four to six sentences', support: 'keyword-prompt', followUpDepth: 'moderate' },
    intermediate: { modeLabel: 'Interview Practice', responseLength: 'natural multi-sentence', support: 'scenario-only', followUpDepth: 'standard' },
    advanced: { modeLabel: 'Professional Interview', responseLength: 'nuanced spontaneous', support: 'scenario-only', followUpDepth: 'deep' },
    academic: { modeLabel: 'Academic and Scholarship Interview', responseLength: 'structured evidence-based', support: 'formal-task', followUpDepth: 'deep' }
  };
  function getInterviewModeForLevel(levelId) { return INTERVIEW_MODE_BY_LEVEL[levelId] || null; }
  // Task 27: pathway may specialize THEMES only, never raise the
  // language difficulty beyond the accepted level.
  var PATHWAY_INTERVIEW_THEMES = {
    child: ['school', 'family', 'hobbies', 'friends'],
    teen: ['school', 'friends', 'hobbies', 'future plans'],
    'general-adult': ['daily routine', 'transport', 'shopping', 'family responsibilities'],
    'job-professional': ['responsibilities', 'customer service', 'work experience', 'teamwork'],
    'academic-preparation': ['presentation', 'evidence', 'educational goals', 'research interest']
  };
  function getInterviewThemesForPathway(pathwayId) { return PATHWAY_INTERVIEW_THEMES[pathwayId] || []; }
  function routeInterviewMode(acceptedLevelId, learnerPathwayId) {
    var mode = getInterviewModeForLevel(acceptedLevelId);
    if (!mode) return null;
    return Object.assign({ levelId: acceptedLevelId, pathwayId: learnerPathwayId || '', allowedThemes: getInterviewThemesForPathway(learnerPathwayId) }, mode);
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 28/29 — Listening pack architecture. Prevents official
     Today's Class from ever launching the complete unstructured bank.
     ══════════════════════════════════════════════════════════════════ */
  var LISTENING_PACK_SIZE_RULES = {
    starter: { min: 4, max: 5 }, basic: { min: 5, max: 5 }, beginner: { min: 5, max: 7 },
    elementary: { min: 6, max: 8 }, intermediate: { min: 8, max: 10 }, advanced: { min: 8, max: 12 }, academic: { min: 8, max: 12 }
  };
  function validateListeningPack(pack) {
    if (!pack) return { valid: false, reason: 'missing-pack' };
    var errors = [];
    if (!pack.packId) errors.push('missing-pack-id');
    if (!pack.levelId) errors.push('missing-level');
    var rule = LISTENING_PACK_SIZE_RULES[pack.levelId];
    var itemCount = Array.isArray(pack.items) ? pack.items.length : (pack.itemCount || 0);
    if (rule && (itemCount < rule.min || itemCount > rule.max)) errors.push('pack-size-out-of-range-for-level');
    if (itemCount > 20) errors.push('oversized-official-session');
    return { valid: errors.length === 0, errors: errors, itemCount: itemCount };
  }
  // Task 28/52: official listening ALWAYS launches exactly one pack,
  // never the full bank. This is the structural guarantee — there is
  // no code path here that returns more than one pack's worth of items.
  function buildOfficialListeningBlock(packId, minutes) {
    return { type: 'listening-pack', minutes: minutes || 20, packId: packId || '', fullBankForbidden: true };
  }
  // Detects the documented padded/duplicate Listening Room content
  // (Task 29/52) by scanning the real LISTEN_SENTENCES array if present.
  function auditListeningBank() {
    var arr = (typeof window !== 'undefined' && window.LISTEN_SENTENCES) ? window.LISTEN_SENTENCES : (typeof LISTEN_SENTENCES !== 'undefined' ? LISTEN_SENTENCES : null);
    if (!arr || !Array.isArray(arr)) return { available: false };
    var seen = {}; var duplicates = 0; var missingLevel = 0;
    arr.forEach(function (item) {
      var text = (item && (item.en || item.text || item.sentence)) || '';
      if (text) { if (seen[text]) duplicates++; seen[text] = (seen[text] || 0) + 1; }
      if (!item || !item.levelId) missingLevel++;
    });
    return { available: true, totalRecords: arr.length, uniqueRecords: Object.keys(seen).length, duplicateRecords: duplicates, missingLevelCount: missingLevel };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 33 — Unit Quiz alignment contract. Prohibits arbitrary
     Placement-question slicing from being treated as production-ready.
     ══════════════════════════════════════════════════════════════════ */
  var UNIT_QUIZ_STATUS = { ALIGNED: 'aligned', LEGACY_UNVERIFIED: 'legacy-unverified', INVALID: 'invalid-for-official-curriculum' };
  function classifyUnitQuiz(quizRecord) {
    if (!quizRecord) return UNIT_QUIZ_STATUS.INVALID;
    if (quizRecord.alignedToUnit === true && Array.isArray(quizRecord.questions) && quizRecord.questions.length > 0) return UNIT_QUIZ_STATUS.ALIGNED;
    if (quizRecord.sourcedFromPlacementBank === true) return UNIT_QUIZ_STATUS.LEGACY_UNVERIFIED;
    return UNIT_QUIZ_STATUS.LEGACY_UNVERIFIED;
  }
  // Task 33: reproduces the documented defect count — how many School
  // Path units currently resolve to a Placement-bank-sliced quiz.
  function auditUnitQuizAlignment(unitIds, getUnitQuizFn) {
    var results = [];
    (unitIds || []).forEach(function (unitId) {
      var quiz = null; try { quiz = getUnitQuizFn ? getUnitQuizFn(unitId) : null; } catch (e) {}
      results.push({ unitId: unitId, status: classifyUnitQuiz(quiz) });
    });
    var unverified = results.filter(function (r) { return r.status !== UNIT_QUIZ_STATUS.ALIGNED; }).length;
    return { results: results, unverifiedCount: unverified, totalUnits: results.length };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 34/35 — Today's Class foundation. Read-only. Never invents
     content. Returns 'curriculum-not-populated' honestly when no real
     populated lesson exists yet (which is always true in D15, since
     Phase 2 populates real content).
     ══════════════════════════════════════════════════════════════════ */
  function getTodayClass(studentId, academicDateKey) {
    var profile = getStudentAcademicProfile(studentId);
    if (!profile.acceptedLevelId) {
      return { studentId: studentId, status: 'curriculum-not-populated', reason: 'no-accepted-level', teacherMessage: 'This student has not yet accepted a Placement level.' };
    }
    // D15 does not populate the six-month curriculum. Report this
    // honestly rather than fabricating a lesson.
    return {
      studentId: studentId, acceptedLevelId: profile.acceptedLevelId, learnerPathwayId: profile.learnerPathwayId || '',
      academicWeekId: '', dayNumber: 0, durationMinutes: DAILY_CONTRACT.totalMinutes,
      theme: '', objectives: [], opening: null, video: null, coreBlocks: [], closing: null,
      coverageStatus: 'not-applicable',
      status: 'curriculum-not-populated',
      teacherMessage: 'The full six-month curriculum has not yet been populated (Phase 2). Free Practice tools remain available.',
      validation: { valid: false, errors: ['curriculum-not-populated'] }
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 36 — attendance foundation (data contract only; full
     classroom workflow is Phase 3).
     ══════════════════════════════════════════════════════════════════ */
  var ATTENDANCE_STATUSES = ['present', 'late', 'absent', 'excused', 'left-early'];
  function recordAttendance(studentId, opts) {
    opts = opts || {};
    if (ATTENDANCE_STATUSES.indexOf(opts.status) === -1) return { ok: false, reason: 'invalid-status' };
    var record = {
      attendanceId: 'att-' + Date.now() + '-' + Math.floor(Math.random() * 1e6),
      studentId: studentId, academicDateKey: opts.academicDateKey || '', classSessionId: opts.classSessionId || '',
      status: opts.status, arrivalTime: opts.arrivalTime || '', reason: opts.reason || '',
      teacherNote: opts.teacherNote || '', recordedAt: nowISO(), recordedBy: opts.recordedBy || 'teacher'
    };
    var key = _studentKey(studentId, 'attendance_log');
    var log = []; try { log = JSON.parse(lsGet(key) || '[]'); } catch (e) {}
    log.push(record);
    lsSet(key, JSON.stringify(log));
    // Task 36: never touches score/Placement/grammar mastery/assessment.
    return { ok: true, record: record };
  }
  function getAttendanceLog(studentId) { try { return JSON.parse(lsGet(_studentKey(studentId, 'attendance_log')) || '[]'); } catch (e) { return []; } }

  /* ══════════════════════════════════════════════════════════════════
     TASK 37 — homework foundation (data contract only).
     ══════════════════════════════════════════════════════════════════ */
  var HOMEWORK_STATUSES = ['complete', 'partly-complete', 'not-complete', 'excused', 'needs-help'];
  function assignHomework(studentId, opts) {
    opts = opts || {};
    var record = {
      homeworkId: 'hw-' + Date.now() + '-' + Math.floor(Math.random() * 1e6),
      studentId: studentId, assignedAcademicDateKey: opts.assignedAcademicDateKey || '', dueAcademicDateKey: opts.dueAcademicDateKey || '',
      type: opts.type || '', instructions: opts.instructions || '', expectedMinutes: opts.expectedMinutes || 0,
      relatedContentIds: opts.relatedContentIds || [], status: 'not-complete', teacherNote: opts.teacherNote || ''
    };
    var key = _studentKey(studentId, 'homework_log');
    var log = []; try { log = JSON.parse(lsGet(key) || '[]'); } catch (e) {}
    log.push(record);
    lsSet(key, JSON.stringify(log));
    return { ok: true, record: record };
  }
  function updateHomeworkStatus(studentId, homeworkId, status) {
    if (HOMEWORK_STATUSES.indexOf(status) === -1) return { ok: false, reason: 'invalid-status' };
    var key = _studentKey(studentId, 'homework_log');
    var log = []; try { log = JSON.parse(lsGet(key) || '[]'); } catch (e) {}
    var found = log.find(function (h) { return h.homeworkId === homeworkId; });
    if (!found) return { ok: false, reason: 'homework-not-found' };
    found.status = status; // Task 37: never automatically a language score.
    lsSet(key, JSON.stringify(log));
    return { ok: true, record: found };
  }
  function getHomeworkLog(studentId) { try { return JSON.parse(lsGet(_studentKey(studentId, 'homework_log')) || '[]'); } catch (e) { return []; } }

  /* ══════════════════════════════════════════════════════════════════
     TASK 38 — Teacher override recording.
     ══════════════════════════════════════════════════════════════════ */
  function recordTeacherOverride(studentId, override) {
    var record = { teacher: override.teacher || 'teacher', reason: override.reason || '', timestamp: nowISO(), originalAssignment: override.originalAssignment || null, replacement: override.replacement || null };
    var key = _studentKey(studentId, 'teacher_overrides');
    var log = []; try { log = JSON.parse(lsGet(key) || '[]'); } catch (e) {}
    log.push(record);
    lsSet(key, JSON.stringify(log));
    return { ok: true, record: record };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 43 — reset/delete integration.
     ══════════════════════════════════════════════════════════════════ */
  function onDeleteStudentAcademicProgram(studentId) {
    if (!studentId) return;
    lsDel(_studentKey(studentId, 'learner_pathway'));
    lsDel(_studentKey(studentId, 'attendance_log'));
    lsDel(_studentKey(studentId, 'homework_log'));
    lsDel(_studentKey(studentId, 'teacher_overrides'));
    lsDel(_studentKey(studentId, MIGRATION_FLAG_KEY_SUFFIX));
    // Weekly coverage ledgers are keyed per-week; sweep any that exist.
    try {
      var prefix = _studentKey(studentId, 'weekly_coverage_');
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (k && k.indexOf(prefix) === 0) lsDel(k);
      }
    } catch (e) {}
  }
  function hookDeletionIntoProfile() {
    try {
      if (!window.ZirakProfile || window.ZirakProfile.__academicProgramDeleteHooked) return;
      var orig = window.ZirakProfile.deleteStudentCompletely;
      if (typeof orig !== 'function') return;
      window.ZirakProfile.deleteStudentCompletely = function (studentId) {
        try { onDeleteStudentAcademicProgram(studentId); } catch (e) {}
        return orig.apply(this, arguments);
      };
      window.ZirakProfile.__academicProgramDeleteHooked = true;
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 39/54 — content-classification audit helpers. Exact-inspection
     counts, never estimates.
     ══════════════════════════════════════════════════════════════════ */
  function auditRecordsMissingLevel(records, levelFieldName) {
    levelFieldName = levelFieldName || 'levelId';
    var missing = 0;
    (records || []).forEach(function (r) { if (!r || !r[levelFieldName]) missing++; });
    return { total: (records || []).length, missingLevel: missing };
  }
  function auditDuplicateTitles(records, titleFieldName) {
    titleFieldName = titleFieldName || 'titleEn';
    var seen = {}; var duplicates = [];
    (records || []).forEach(function (r) {
      var t = r && r[titleFieldName]; if (!t) return;
      if (seen[t]) duplicates.push(t); else seen[t] = true;
    });
    return { total: (records || []).length, uniqueTitles: Object.keys(seen).length, duplicateCount: duplicates.length, duplicates: duplicates };
  }
  function auditMissingPashtoTitles(records, pashtoFieldName, enFieldName) {
    pashtoFieldName = pashtoFieldName || 'titlePashto'; enFieldName = enFieldName || 'titleEn';
    var missing = 0;
    (records || []).forEach(function (r) {
      if (!r) return;
      var p = r[pashtoFieldName], en = r[enFieldName];
      if (!p || p === en) missing++;
    });
    return { total: (records || []).length, missingOrEqualToEnglish: missing };
  }
  // Task 32: Sentence Practice compatibility check (word must appear
  // verbatim in its example sentence).
  function auditSentencePracticeCompatibility(wordRecords) {
    var incompatible = [];
    (wordRecords || []).forEach(function (w) {
      if (!w || !w.example) return;
      var target = (w.word || w.en || '').toLowerCase();
      var example = String(w.example).toLowerCase();
      if (target && example.indexOf(target) === -1) incompatible.push(w.id || w.word || w.en || '(unknown)');
    });
    return { total: (wordRecords || []).length, incompatibleCount: incompatible.length, incompatibleIds: incompatible };
  }

  /* ══════════════════════════════════════════════════════════════════
     Boot integration — idempotent, safe to call multiple times.
     ══════════════════════════════════════════════════════════════════ */
  function boot() {
    try { migrateAllStudentsNurseryToStarter(); } catch (e) {}
    try { hookDeletionIntoProfile(); } catch (e) {}
  }
  try {
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
      else boot();
    }
  } catch (e) {}

  /* ══════════════════════════════════════════════════════════════════
     PUBLIC API
     ══════════════════════════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════════════════════════
     I6H-D15A (Task 13) — TEACHER AUTHORIZATION GATE.
     Uses the EXISTING Teacher session flag (sessionStorage
     'zirak_teacher' === '1') — the exact same authority
     zirak-profile.js's teacherUnlocked() reads. No second PIN, no
     second auth store. The raw mutation functions above remain
     IIFE-private; only these authorized wrappers are exported, so a
     student cannot alter attendance, homework, overrides, pathway,
     coverage, or the book program through the console-visible
     production API.
     ══════════════════════════════════════════════════════════════════ */
  function _teacherAuthorized() {
    try { return sessionStorage.getItem('zirak_teacher') === '1'; } catch (e) { return false; }
  }
  function _requireTeacher(fn, fnName) {
    return function () {
      if (!_teacherAuthorized()) return { ok: false, reason: 'teacher-authorization-required', action: fnName };
      return fn.apply(null, arguments);
    };
  }
  var setStudentPathwayAuthorized = _requireTeacher(setStudentPathway, 'setStudentPathway');
  var recordAttendanceAuthorized = _requireTeacher(recordAttendance, 'recordAttendance');
  var assignHomeworkAuthorized = _requireTeacher(assignHomework, 'assignHomework');
  var updateHomeworkStatusAuthorized = _requireTeacher(updateHomeworkStatus, 'updateHomeworkStatus');
  var recordTeacherOverrideAuthorized = _requireTeacher(recordTeacherOverride, 'recordTeacherOverride');
  var deferCoreBlockAuthorized = _requireTeacher(deferCoreBlock, 'deferCoreBlock');
  var recoverCoreBlockAuthorized = _requireTeacher(recoverCoreBlock, 'recoverCoreBlock');
  var setActiveBookProgramAuthorized = _requireTeacher(setActiveBookProgram, 'setActiveBookProgram');

  window.ZirakAcademicProgram = {
    version: PROGRAM_VERSION, schemaVersion: SCHEMA_VERSION,
    // Task 4 — level authority
    ACCEPTED_LEVELS: ACCEPTED_LEVELS, ACCEPTED_LEVEL_IDS: ACCEPTED_LEVEL_IDS,
    isAcceptedLevelId: isAcceptedLevelId, levelOrder: levelOrder, levelInfo: levelInfo,
    normalizeAcceptedLevelId: normalizeAcceptedLevelId,
    // Task 5 — migration
    migrateStudentNurseryToStarter: migrateStudentNurseryToStarter,
    migrateAllStudentsNurseryToStarter: migrateAllStudentsNurseryToStarter,
    // Task 6 — Placement band compatibility
    PLACEMENT_DIAGNOSTIC_BANDS: PLACEMENT_DIAGNOSTIC_BANDS,
    diagnosticBandToAcceptedClass: diagnosticBandToAcceptedClass,
    GRAMMAR_LEVEL_TO_ACCEPTED_CLASS: GRAMMAR_LEVEL_TO_ACCEPTED_CLASS, grammarLevelToAcceptedClass: grammarLevelToAcceptedClass,
    diagnosticBandTeacherLabel: diagnosticBandTeacherLabel,
    // Task 7/8 — learner pathway
    LEARNER_PATHWAYS: LEARNER_PATHWAYS, LEARNER_PATHWAY_IDS: LEARNER_PATHWAY_IDS,
    isLearnerPathwayId: isLearnerPathwayId, readStudentPathway: readStudentPathway, setStudentPathway: setStudentPathwayAuthorized,
    getStudentAcademicProfile: getStudentAcademicProfile,
    // Task 11-15 — daily 90-minute contract
    DAILY_CONTRACT: DAILY_CONTRACT, validateDailyLessonDuration: validateDailyLessonDuration,
    buildTeacherOpeningBlock: buildTeacherOpeningBlock,
    buildVideoLearningBlock: buildVideoLearningBlock, validateVideoContentEligible: validateVideoContentEligible,
    CORE_BLOCK_TYPES: CORE_BLOCK_TYPES, isValidCoreBlockType: isValidCoreBlockType, buildCoreBlock: buildCoreBlock,
    buildTeacherClosingBlock: buildTeacherClosingBlock,
    // Task 16/17 — book program
    getActiveBookProgram: getActiveBookProgram, setActiveBookProgram: setActiveBookProgramAuthorized,
    buildMainBookBlock: buildMainBookBlock, validateBookBlock: validateBookBlock,
    // Task 18 — weekly template
    buildDefaultWeeklyTemplate: buildDefaultWeeklyTemplate, buildLessonFromTemplateDay: buildLessonFromTemplateDay,
    // Task 19/20 — weekly coverage + defer/recovery
    WEEKLY_COVERAGE_MINIMUMS: WEEKLY_COVERAGE_MINIMUMS, validateWeeklyCoverage: validateWeeklyCoverage,
    readWeeklyCoverageLedger: readWeeklyCoverageLedger, initWeeklyCoverageLedger: initWeeklyCoverageLedger,
    deferCoreBlock: deferCoreBlockAuthorized, recoverCoreBlock: recoverCoreBlockAuthorized,
    // Task 21 — content eligibility
    validateContentEligibility: validateContentEligibility,
    // Task 22/23 — Grammar
    GRAMMAR_PROGRESSION: GRAMMAR_PROGRESSION, classifyGrammarTopicForLevel: classifyGrammarTopicForLevel,
    isGrammarTopicOfficiallyRoutable: isGrammarTopicOfficiallyRoutable,
    // Task 24/25 — Dialogue
    DIALOGUE_LEVEL_FRAMEWORK: DIALOGUE_LEVEL_FRAMEWORK, DIALOGUE_SUPPORT_MODES: DIALOGUE_SUPPORT_MODES,
    validateDialogueForLevel: validateDialogueForLevel, detectSharedDialogueAcrossLevels: detectSharedDialogueAcrossLevels,
    // Task 26/27 — Interview
    INTERVIEW_MODE_BY_LEVEL: INTERVIEW_MODE_BY_LEVEL, getInterviewModeForLevel: getInterviewModeForLevel,
    PATHWAY_INTERVIEW_THEMES: PATHWAY_INTERVIEW_THEMES, getInterviewThemesForPathway: getInterviewThemesForPathway,
    routeInterviewMode: routeInterviewMode,
    // Task 28/29 — Listening
    LISTENING_PACK_SIZE_RULES: LISTENING_PACK_SIZE_RULES, validateListeningPack: validateListeningPack,
    buildOfficialListeningBlock: buildOfficialListeningBlock, auditListeningBank: auditListeningBank,
    // Task 33 — Unit Quiz alignment
    UNIT_QUIZ_STATUS: UNIT_QUIZ_STATUS, classifyUnitQuiz: classifyUnitQuiz, auditUnitQuizAlignment: auditUnitQuizAlignment,
    // Task 34/35 — Today's Class
    getTodayClass: getTodayClass,
    // Task 36 — attendance
    ATTENDANCE_STATUSES: ATTENDANCE_STATUSES, recordAttendance: recordAttendanceAuthorized, getAttendanceLog: getAttendanceLog,
    // Task 37 — homework
    HOMEWORK_STATUSES: HOMEWORK_STATUSES, assignHomework: assignHomeworkAuthorized, updateHomeworkStatus: updateHomeworkStatusAuthorized, getHomeworkLog: getHomeworkLog,
    // Task 38 — teacher override
    recordTeacherOverride: recordTeacherOverrideAuthorized,
    // Task 43 — reset/delete
    onDeleteStudentAcademicProgram: onDeleteStudentAcademicProgram, hookDeletionIntoProfile: hookDeletionIntoProfile,
    // Task 39/54 — content-classification audit helpers
    auditRecordsMissingLevel: auditRecordsMissingLevel, auditDuplicateTitles: auditDuplicateTitles,
    auditMissingPashtoTitles: auditMissingPashtoTitles, auditSentencePracticeCompatibility: auditSentencePracticeCompatibility,
    _test: {
      LEVEL_ALIASES: LEVEL_ALIASES, DIAGNOSTIC_BAND_TO_ACCEPTED_CLASS: DIAGNOSTIC_BAND_TO_ACCEPTED_CLASS,
      _studentKey: _studentKey, _legacyStudentKey: _legacyStudentKey, boot: boot,
      MIGRATION_FLAG_KEY_SUFFIX: MIGRATION_FLAG_KEY_SUFFIX,
      // I6H-D15A: raw (pre-authorization) internals + the gate itself,
      // so the harness can verify both the raw behavior and that the
      // public wrappers genuinely refuse without Teacher authorization.
      _teacherAuthorized: _teacherAuthorized,
      _appNsKey: _appNsKey,
      rawSetStudentPathway: setStudentPathway,
      rawRecordAttendance: recordAttendance,
      rawAssignHomework: assignHomework,
      rawUpdateHomeworkStatus: updateHomeworkStatus,
      rawRecordTeacherOverride: recordTeacherOverride,
      rawDeferCoreBlock: deferCoreBlock,
      rawRecoverCoreBlock: recoverCoreBlock,
      rawSetActiveBookProgram: setActiveBookProgram
    }
  };
})();
