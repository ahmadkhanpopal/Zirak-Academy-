/* ============================================================================
   zirak-learning-ledger.js — PHASE I6H-C
   ONE CENTRAL LEARNING LEDGER (per-student, local, foundation phase).
   ----------------------------------------------------------------------------
   STORAGE (per student — never mixes profiles):
     key   = window.ZirakStorageKey('learning_ledger')   ← the app's ONE
             per-student namespace helper (zirak-profile.js). Fallback when
             no profile system is present: 'zirak_learning_ledger_guest'.
     value = { v:1, days: { 'YYYY-MM-DD': [record, ...] } }
     caps  = last 60 day-keys kept, max 100 records per day.
     Corrupt JSON is NEVER silently erased: the raw value is copied once to
     key + '_corrupt_backup' before starting a fresh model.

   RECORD SCHEMA (fields filled where available):
     { id, student:{id,name}, dateKey, timestamp, dayName, calendarLabel,
       source, sectionTitle, topicTitle, activityType,
       good, total, pct, weakItems:[], reviewItems:[],
       feedback, timeSpentMs, waAvailable }

   DEDUP / IDEMPOTENCE:
     • recordActivity({id:...}) with a stable id records once — a second call
       with the same id on the same day returns the existing record.
     • Auto ids are unique per call; every hook in this phase fires exactly
       once per COMPLETED result render, never on screen reopen.

   HOOKED FLOWS (this phase):
     ZirakResultProof.renderButtonHtml → Quick Practice, Grammar World
     Practice, Basic Dialogue (render happens once per completion in all
     three). Interview Wizard summary, Grammar Auto-Wizard summary, Word
     Quiz / Sentence Practice / Word Wizard finals record directly.

   ONE-SYSTEM RULES: reuses ZirakInstituteCalendar for all date math and
   ZirakResultProof.getProfile() for the ONE father-number/name lookup.
   ============================================================================ */
(function () {
  'use strict';

  var DAY_CAP  = 100;   // records per day
  var DAYS_CAP = 60;    // day-keys kept
  var _seq = 0;

  /* ── storage ────────────────────────────────────────────────────────────── */
  function storageKey() {
    try {
      if (typeof window.ZirakStorageKey === 'function') {
        return window.ZirakStorageKey('learning_ledger');
      }
    } catch (e) {}
    return 'zirak_learning_ledger_guest';
  }
  function freshModel() { return { v: 1, days: {} }; }
  function load() {
    var key = storageKey();
    var raw = null;
    try { raw = localStorage.getItem(key); } catch (e) {}
    if (!raw) return freshModel();
    try {
      var m = JSON.parse(raw);
      if (m && m.days) return m;
      return freshModel();
    } catch (e) {
      // NEVER silently erase: keep the corrupt raw once, then start fresh.
      try {
        var bk = key + '_corrupt_backup';
        if (!localStorage.getItem(bk)) localStorage.setItem(bk, raw);
      } catch (e2) {}
      return freshModel();
    }
  }
  function save(model) {
    // Enforce caps (oldest out first) before writing.
    try {
      var keys = Object.keys(model.days).sort();
      while (keys.length > DAYS_CAP) { delete model.days[keys.shift()]; }
      keys.forEach(function (k) {
        var arr = model.days[k];
        if (arr && arr.length > DAY_CAP) model.days[k] = arr.slice(arr.length - DAY_CAP);
      });
      localStorage.setItem(storageKey(), JSON.stringify(model));
    } catch (e) {}
  }

  /* ── helpers ────────────────────────────────────────────────────────────── */
  function cal() { return window.ZirakInstituteCalendar || null; }
  function localDateKey() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function getStudent() {
    var id = '', name = '';
    try {
      // I6H-D13B fix: window.ZirakProfile.getActive() was never defined
      // anywhere in this codebase (only currentStudent() is) — this
      // silently left rec.student.id empty on every single record ever
      // written. Fixed to the real function name, so the Learning
      // Ledger now captures explicit student identity at the exact
      // moment each record is written (Task 7).
      var p = (window.ZirakProfile && window.ZirakProfile.currentStudent) ? window.ZirakProfile.currentStudent() : null;
      if (p) { id = p.studentId || p.id || ''; name = p.fullName || ''; }
    } catch (e) {}
    if (!name) {
      try {
        var g = (window.ZirakResultProof && window.ZirakResultProof.getProfile) ? window.ZirakResultProof.getProfile() : null;
        if (g && g.name) name = g.name;
      } catch (e) {}
    }
    return { id: id, name: name };
  }
  function inferSource(title) {
    var t = String(title || '');
    if (t.indexOf('Quick Practice') === 0)   return 'quick-practice';
    if (t.indexOf('Grammar Practice:') === 0) return 'grammar-world-practice';
    if (t.indexOf('Basic Dialogue:') === 0)  return 'dialogue';
    if (t.indexOf('Interview') === 0)        return 'interview';
    if (t.indexOf('Auto-Wizard') === 0)      return 'grammar-auto-wizard';
    if (t.indexOf('Word Wizard') === 0)      return 'wordlab';
    if (t.indexOf('Sentence') === 0)         return 'wordlab';
    if (t.indexOf('Word Quiz') === 0 || t.indexOf('Smart Review') === 0) return 'quiz';
    if (t.indexOf('Weak') === 0)             return 'weak-review';
    return 'other';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function srcIcon(src) {
    return src === 'quick-practice' ? '\u26A1'
      : src === 'grammar-world-practice' ? '\uD83D\uDCD8'
      : src === 'grammar-auto-wizard' ? '\uD83E\uDE84'
      : src === 'dialogue' ? '\uD83D\uDCAC'
      : src === 'interview' ? '\uD83C\uDF99'
      : src === 'quiz' ? '\u2753'
      : src === 'wordlab' ? '\uD83D\uDD24'
      : src === 'weak-review' ? '\uD83D\uDD01'
      : '\uD83D\uDCDD';
  }

  // I6H-D6: tiny local renderer for the readiness snapshot inside Today's
  // Learning Record — uses this file's own llg-* classes (no cross-file CSS
  // dependency on zirak-academy-tests.js's at-* classes). Data comes from
  // ZirakAcademyTests.buildReadinessSnapshot(); this function only displays it.
  function _readinessSnapshotHtmlLite(snap) {
    if (!snap) return '';
    return '<div class="llg-snapshot">' +
      '<div class="llg-weak-lbl">\uD83C\uDFAF Level Readiness Snapshot</div>' +
      '<div style="font-size:13px;line-height:1.7;color:var(--text,#1e293b);">' +
        '<b>Level:</b> ' + esc(snap.level) +
        (snap.branchesToday.length ? '<br><b>Branches today:</b> ' + esc(snap.branchesToday.join(', ')) : '') +
        (snap.weakBranches.length ? '<br><b>Needs review:</b> ' + esc(snap.weakBranches.join(', ')) : '') +
        '<br><b>Next:</b> ' + esc(snap.nextAction) +
      '</div>' +
    '</div>';
  }

  // I6H-D7: compact weekly card for Today's Learning Record. Fully guarded —
  // if ZirakAcademyTests or ZirakInstituteCalendar aren't loaded, or the
  // week has no data yet, this renders an empty string and nothing appears
  // (matches "do not create fake sections" — no data, no card).
  function _thisWeekSectionHtml() {
    try {
      if (typeof window.ZirakAcademyTests !== 'object') return '';
      if (typeof window.ZirakAcademyTests.buildWeeklyLearningSummary !== 'function') return '';
      var summary = window.ZirakAcademyTests.buildWeeklyLearningSummary();
      if (!summary || summary.studyDaysCompleted === 0) return '';
      var ready = typeof window.ZirakAcademyTests.isWeeklyTestReady === 'function' ? window.ZirakAcademyTests.isWeeklyTestReady() : false;
      // I6H-D7A FIX: this card used to only check `ready`, so it kept
      // showing "Start Weekly Progress Test" even after the weekly test was
      // already completed — because the record IS in the (unfiltered)
      // week's records, but nothing here ever looked for it. Now uses the
      // same shared findWeeklyTestRecord() helper renderHome() uses, so
      // both places agree on completion status.
      var doneRec = (typeof window.ZirakAcademyTests.findWeeklyTestRecord === 'function')
        ? window.ZirakAcademyTests.findWeeklyTestRecord() : null;
      var statusLine, btnLabel, btnEnabled;
      if (doneRec) {
        statusLine = '<b>Status:</b> \u2705 Completed \u2014 score ' + doneRec.pct + '%';
        btnLabel = (window.ZirakAcademyTests&&window.ZirakAcademyTests.getAssessmentActionLabel)?window.ZirakAcademyTests.getAssessmentActionLabel('weekly','retake'):'\uD83D\uDD01 Retake Weekly Progress Test';
        btnEnabled = true;
      } else if (ready) {
        statusLine = '<b>Status:</b> ' + esc(summary.status);
        btnLabel = '\uD83D\uDCC5 Start Weekly Progress Test';
        btnEnabled = true;
      } else {
        statusLine = '<b>Status:</b> ' + esc(summary.status);
        btnLabel = 'Not ready yet';
        btnEnabled = false;
      }
      return '<div class="llg-snapshot" style="border-left-color:#0891b2;">' +
        '<div class="llg-weak-lbl" style="color:#0891b2;">\uD83D\uDCC5 Weekly Progress Test</div>' +
        '<div style="font-size:13px;line-height:1.7;color:var(--text,#1e293b);">' +
          '<b>Study Days:</b> ' + summary.studyDaysCompleted + ' / 5<br>' +
          statusLine +
          (summary.weakBranches.length ? '<br><b>Needs Review:</b> ' + esc(summary.weakBranches.join(', ')) : '') +
        '</div>' +
        '<button type="button" class="llg-btn" style="background:#0891b2;color:#fff;margin-top:8px;padding:9px 14px;font-size:12.5px;" ' +
          (btnEnabled ? 'onclick="ZirakLearningLedger.openWeeklyTest()"' : 'disabled style="opacity:.5;"') + '>' +
          btnLabel +
        '</button>' +
      '</div>';
    } catch (e) { return ''; }
  }

  // I6H-D8: Two-Week Progress Review card — same guarded pattern, same
  // shared-helper-not-duplicated-logic approach as the D7A fix above.
  function _twoWeekSectionHtml() {
    try {
      if (typeof window.ZirakAcademyTests !== 'object') return '';
      if (typeof window.ZirakAcademyTests.buildTwoWeekLearningSummary !== 'function') return '';
      var summary = window.ZirakAcademyTests.buildTwoWeekLearningSummary();
      if (!summary || summary.studyDaysCompleted === 0) return '';
      var ready = typeof window.ZirakAcademyTests.isTwoWeekReviewReady === 'function' ? window.ZirakAcademyTests.isTwoWeekReviewReady() : false;
      var doneRec = (typeof window.ZirakAcademyTests.findTwoWeekReviewRecord === 'function')
        ? window.ZirakAcademyTests.findTwoWeekReviewRecord() : null;
      var statusLine, btnLabel, btnEnabled;
      if (doneRec) {
        statusLine = '<b>Status:</b> \u2705 Completed \u2014 score ' + doneRec.pct + '%';
        btnLabel = '\uD83D\uDD01 Retake Two-Week Progress Review';
        btnEnabled = true;
      } else if (ready) {
        statusLine = '<b>Status:</b> ' + esc(summary.status);
        btnLabel = '\uD83E\uDDED Start Two-Week Progress Review';
        btnEnabled = true;
      } else {
        statusLine = '<b>Status:</b> ' + esc(summary.status);
        btnLabel = 'Not ready yet';
        btnEnabled = false;
      }
      return '<div class="llg-snapshot" style="border-left-color:#7c3aed;">' +
        '<div class="llg-weak-lbl" style="color:#7c3aed;">\uD83E\uDDED Two-Week Progress Review</div>' +
        '<div style="font-size:13px;line-height:1.7;color:var(--text,#1e293b);">' +
          '<b>Study Days:</b> ' + summary.studyDaysCompleted + ' / 10<br>' +
          '<b>Weekly Progress Tests:</b> ' + summary.weeklyTestsCompleted + ' / 2<br>' +
          statusLine +
          (summary.repeatedWeakGroups.length ? '<br><b>Repeated Weak:</b> ' + esc(summary.repeatedWeakGroups.slice(0,3).join(', ')) : '') +
        '</div>' +
        '<button type="button" class="llg-btn" style="background:#7c3aed;color:#fff;margin-top:8px;padding:9px 14px;font-size:12.5px;" ' +
          (btnEnabled ? 'onclick="ZirakLearningLedger.openTwoWeekReview()"' : 'disabled style="opacity:.5;"') + '>' +
          btnLabel +
        '</button>' +
      '</div>';
    } catch (e) { return ''; }
  }

  // I6H-D9: Monthly Progress Exam card — same guarded, shared-helper pattern.
  function _monthlySectionHtml() {
    try {
      if (typeof window.ZirakAcademyTests !== 'object') return '';
      if (typeof window.ZirakAcademyTests.buildMonthlyLearningSummary !== 'function') return '';
      var summary = window.ZirakAcademyTests.buildMonthlyLearningSummary();
      if (!summary || summary.studyDaysCompleted === 0) return '';
      var ready = typeof window.ZirakAcademyTests.isMonthlyExamReady === 'function' ? window.ZirakAcademyTests.isMonthlyExamReady() : false;
      var doneRec = (typeof window.ZirakAcademyTests.findMonthlyExamRecord === 'function')
        ? window.ZirakAcademyTests.findMonthlyExamRecord() : null;
      var statusLine, btnLabel, btnEnabled;
      if (doneRec) {
        statusLine = '<b>Status:</b> \u2705 Completed \u2014 score ' + doneRec.pct + '%';
        btnLabel = (window.ZirakAcademyTests&&window.ZirakAcademyTests.getAssessmentActionLabel)?window.ZirakAcademyTests.getAssessmentActionLabel('monthly','retake'):'\uD83D\uDD01 Retake Monthly Progress Exam';
        btnEnabled = true;
      } else if (ready) {
        statusLine = '<b>Status:</b> ' + esc(summary.status);
        btnLabel = (window.ZirakAcademyTests&&window.ZirakAcademyTests.getAssessmentActionLabel)?window.ZirakAcademyTests.getAssessmentActionLabel('monthly','start'):'\uD83C\uDFC6 Start Monthly Progress Exam';
        btnEnabled = true;
      } else {
        statusLine = '<b>Status:</b> ' + esc(summary.status);
        btnLabel = 'Not ready yet';
        btnEnabled = false;
      }
      return '<div class="llg-snapshot" style="border-left-color:#d97706;">' +
        '<div class="llg-weak-lbl" style="color:#d97706;">\uD83C\uDFC6 Monthly Progress Exam</div>' +
        '<div style="font-size:13px;line-height:1.7;color:var(--text,#1e293b);">' +
          '<b>Study Days:</b> ' + summary.studyDaysCompleted + ' / 20<br>' +
          '<b>Weekly Progress Tests:</b> ' + summary.weeklyTestsCompleted + ' / 4<br>' +
          '<b>Two-Week Progress Reviews:</b> ' + summary.twoWeekReviewsCompleted + ' / 2<br>' +
          statusLine +
          (summary.repeatedWeakGroups.length ? '<br><b>Repeated Weak:</b> ' + esc(summary.repeatedWeakGroups.slice(0,3).join(', ')) : '') +
        '</div>' +
        '<button type="button" class="llg-btn" style="background:#d97706;color:#fff;margin-top:8px;padding:9px 14px;font-size:12.5px;" ' +
          (btnEnabled ? 'onclick="ZirakLearningLedger.openMonthlyExam()"' : 'disabled style="opacity:.5;"') + '>' +
          btnLabel +
        '</button>' +
      '</div>';
    } catch (e) { return ''; }
  }

  /* ── core API ───────────────────────────────────────────────────────────── */
  /* ══════════════════════════════════════════════════════════════════
     I6H-D13B Task 13 — ONE clean, additive subscribe/unsubscribe API.
     Preferred over monkey-patching recordActivity: no function is
     reassigned, the original return value/exception behavior is
     completely untouched, and there is exactly one notification point
     (right after a record is saved OR matched as an idempotent duplicate)
     rather than a wrapper needing to guess when to fire. A subscriber
     that throws is caught individually so one bad listener can never
     break recordActivity() itself or block other subscribers.
     ══════════════════════════════════════════════════════════════════ */
  var _subscribers = [];
  function subscribe(listener) {
    if (typeof listener !== 'function') return false;
    if (_subscribers.indexOf(listener) > -1) return false; // no duplicate installation
    _subscribers.push(listener);
    return true;
  }
  function unsubscribe(listener) {
    var i = _subscribers.indexOf(listener);
    if (i === -1) return false;
    _subscribers.splice(i, 1);
    return true;
  }
  function notifySubscribers(rec) {
    for (var i = 0; i < _subscribers.length; i++) {
      try { _subscribers[i](rec); } catch (e) {}
    }
  }

  function recordActivity(data) {
    data = data || {};
    var info = null;
    try { info = cal() ? cal().todayInfo() : null; } catch (e) {}
    var dk = data.dateKey || (info ? info.dateKey : localDateKey());
    var model = load();
    var day = model.days[dk] = model.days[dk] || [];

    // Idempotent on a caller-provided stable id.
    if (data.id) {
      for (var i = 0; i < day.length; i++) {
        if (day[i].id === data.id) { notifySubscribers(day[i]); return day[i]; }
      }
    }
    _seq++;
    var good  = Number(data.good)  || 0;
    var total = Number(data.total) || 0;
    // I6H-D19: a speech/TTS hardware or service failure is an unscored
    // technical event. It must never be normalized into an academic 0%.
    var isTechnicalFailure = data.isTechnicalFailure === true || /technical-failure/.test(String(data.activityType || ''));
    var isExplicitlyUnscored = /^unscored(?:-|$)/.test(String(data.scoreStatus || '')) || data.academicOutcome === 'unscored';
    var pct   = (isTechnicalFailure || isExplicitlyUnscored) ? null
              : ((data.pct != null) ? Number(data.pct)
              : (total > 0 ? Math.round((good / total) * 100) : 0));
    var waAvail = false;
    try {
      var g = (window.ZirakResultProof && window.ZirakResultProof.getProfile) ? window.ZirakResultProof.getProfile() : null;
      waAvail = !!(g && g.wa);
    } catch (e) {}
    // I6H-D13B Task 7: resolve once, reuse for both the existing nested
    // `student` object and the new flat `studentId` passthrough below.
    var resolvedStudent = data.student || getStudent();

    var rec = {
      id: data.id || ('llg-' + Date.now().toString(36) + '-' + _seq),
      student: resolvedStudent,
      dateKey: dk,
      timestamp: data.timestamp || Date.now(),
      dayName: data.dayName || (info ? info.dayName : ''),
      calendarLabel: data.calendarLabel || (info ? info.label : ''),
      source: data.source || inferSource(data.sectionTitle),
      sectionTitle: String(data.sectionTitle || 'Practice'),
      topicTitle: data.topicTitle || '',
      activityType: data.activityType || 'practice-result',
      good: good, total: total, pct: pct,
      weakItems: Array.isArray(data.weakItems) ? data.weakItems.slice(0, 12) : [],
      reviewItems: Array.isArray(data.reviewItems) ? data.reviewItems.slice(0, 20) : [],
      feedback: data.feedback || '',
      timeSpentMs: data.timeSpentMs || null,
      waAvailable: waAvail,
      // I6H-D6: optional blueprint metadata pass-through — additive fields,
      // always default to '' so nothing downstream needs to null-check.
      // Callers that don't have this data (most existing callers) simply
      // don't pass it, and these fields stay ''. This activates the
      // "forward-compatible" fields D5A already started sending from Topic
      // Test but which were previously dropped by this exact whitelist.
      branch: data.branch || '',
      subbranch: data.subbranch || '',
      level: data.level || '',
      testBlueprintKey: data.testBlueprintKey || '',
      topicId: data.topicId || '',
      // I6H-D7A: rich weekly metadata — additive, all default to safe empty
      // values so OLD records (daily, topic-test, or weekly records saved
      // before this phase) read back exactly as before; nothing here is
      // required, nothing here breaks a record that doesn't have it.
      weekStartDateKey: data.weekStartDateKey || '',
      weekEndDateKey: data.weekEndDateKey || '',
      // I6H-D8 FIX: cap raised 7->10 — this field is shared by both weekly
      // records (5 keys) and two-week records (10 keys); 7 silently
      // truncated two-week data. 10 is the real maximum across both uses.
      // I6H-D9: cap raised 10->20 — this field is shared by weekly (5),
      // two-week (10), and now monthly (20) records. Learned from the
      // identical D8 bug (cap was 7, silently truncated two-week's 10);
      // fixing it proactively this time for monthly's 20.
      studyDateKeys: Array.isArray(data.studyDateKeys) ? data.studyDateKeys.slice(0, 20) : [],
      academyWeekLabel: data.academyWeekLabel || '',
      academyMonth: data.academyMonth || null,
      academyWeekNumber: data.academyWeekNumber || null,
      studyDaysCompleted: (typeof data.studyDaysCompleted === 'number') ? data.studyDaysCompleted : null,
      studyDaysTotal: (typeof data.studyDaysTotal === 'number') ? data.studyDaysTotal : null,
      sectionScores: Array.isArray(data.sectionScores) ? data.sectionScores.slice(0, 10) : [],
      branchScores: Array.isArray(data.branchScores) ? data.branchScores.slice(0, 15) : [],
      levelScores: Array.isArray(data.levelScores) ? data.levelScores.slice(0, 10) : [],
      weakGroups: Array.isArray(data.weakGroups) ? data.weakGroups.slice(0, 15) : [],
      repeatedWeakGroups: Array.isArray(data.repeatedWeakGroups) ? data.repeatedWeakGroups.slice(0, 15) : [],
      readinessStatus: data.readinessStatus || '',
      nextAction: data.nextAction || '',
      branchesTouched: Array.isArray(data.branchesTouched) ? data.branchesTouched.slice(0, 15) : [],
      levelsTouched: Array.isArray(data.levelsTouched) ? data.levelsTouched.slice(0, 10) : [],
      strongTags: Array.isArray(data.strongTags) ? data.strongTags.slice(0, 15) : [],
      weakTags: Array.isArray(data.weakTags) ? data.weakTags.slice(0, 15) : [],
      questionCount: (typeof data.questionCount === 'number') ? data.questionCount : null,
      createdAt: data.createdAt || Date.now(),
      updatedAt: Date.now(),
      // I6H-D8: two-week-specific fields — same additive/backward-compatible
      // pattern as the D7A weekly fields above. Old records (daily, topic,
      // weekly) simply don't have these; nothing here breaks them.
      rangeStartDateKey: data.rangeStartDateKey || '',
      rangeEndDateKey: data.rangeEndDateKey || '',
      // I6H-D9 FIX: cap raised 2->4 — same field shared by two-week records
      // (2 week-ranges) and monthly records (4 week-ranges). Caught this
      // BEFORE shipping instead of after, having already hit the identical
      // pattern twice (studyDateKeys in D8, again above in D9).
      weekRanges: Array.isArray(data.weekRanges) ? data.weekRanges.slice(0, 4) : [],
      twoWeekLabel: data.twoWeekLabel || '',
      academyReviewNumber: data.academyReviewNumber || null,
      weeklyTestsCompleted: (typeof data.weeklyTestsCompleted === 'number') ? data.weeklyTestsCompleted : null,
      weeklyTestsTotal: (typeof data.weeklyTestsTotal === 'number') ? data.weeklyTestsTotal : null,
      monthlyReadinessHint: data.monthlyReadinessHint || '',
      // I6H-D9: monthly-specific fields — same additive/backward-compatible
      // pattern as D7A/D8. Old records simply don't have these.
      monthStartDateKey: data.monthStartDateKey || '',
      monthEndDateKey: data.monthEndDateKey || '',
      twoWeekRanges: Array.isArray(data.twoWeekRanges) ? data.twoWeekRanges.slice(0, 2) : [],
      monthlyLabel: data.monthlyLabel || '',
      academyMonthNumber: data.academyMonthNumber || null,
      academyYear: data.academyYear || null,
      weeklyTestsCompletedMonthly: (typeof data.weeklyTestsCompletedMonthly === 'number') ? data.weeklyTestsCompletedMonthly : null,
      weeklyTestsTotalMonthly: (typeof data.weeklyTestsTotalMonthly === 'number') ? data.weeklyTestsTotalMonthly : null,
      twoWeekReviewsCompleted: (typeof data.twoWeekReviewsCompleted === 'number') ? data.twoWeekReviewsCompleted : null,
      twoWeekReviewsTotal: (typeof data.twoWeekReviewsTotal === 'number') ? data.twoWeekReviewsTotal : null,
      certificateHint: data.certificateHint || '',
      // I6H-D10: certificate + report-card fields — additive, safe defaults,
      // same backward-compatible pattern as every prior phase's schema
      // extension. Old records (daily/weekly/two-week/monthly/topic) simply
      // don't have these.
      certificateId: data.certificateId || '',
      certificateType: data.certificateType || '',
      certificateStatus: data.certificateStatus || '',
      studentNameSnapshot: data.studentNameSnapshot || '',
      studentIdFragment: data.studentIdFragment || '',
      levelSnapshot: data.levelSnapshot || '',
      instituteNameSnapshot: data.instituteNameSnapshot || '',
      teacherNameSnapshot: data.teacherNameSnapshot || '',
      examRecordId: data.examRecordId || '',
      examScore: (typeof data.examScore === 'number') ? data.examScore : null,
      examTotal: (typeof data.examTotal === 'number') ? data.examTotal : null,
      examPercent: (typeof data.examPercent === 'number') ? data.examPercent : null,
      reportCategory: data.reportCategory || '',
      teacherCommentSnapshot: data.teacherCommentSnapshot || '',
      nextActionSnapshot: data.nextActionSnapshot || '',
      issuedAt: data.issuedAt || null,
      revisionNumber: (typeof data.revisionNumber === 'number') ? data.revisionNumber : null,
      // Report-card-specific (some names deliberately mirror certificate
      // fields above but stay independent per-record, not shared state):
      reportId: data.reportId || '',
      linkedMonthlyExamId: data.linkedMonthlyExamId || '',
      resultCategory: data.resultCategory || '',
      trendSummary: data.trendSummary || '',
      teacherComment: data.teacherComment || '',
      teacherRecommendation: data.teacherRecommendation || '',
      finalizedAt: data.finalizedAt || null,
      // I6H-D10A ROOT-CAUSE FIX: D10's finalizeReportCard passed
      // score/percent, but this whitelist silently dropped both (only
      // good/total/pct survived) — and since D10 also passed good:0, the
      // saved report showed 0/total (0%). These aliases now persist.
      score: (typeof data.score === 'number') ? data.score : null,
      percent: (typeof data.percent === 'number') ? data.percent : null,
      activeLevel: data.activeLevel || '',
      // I6H-D13B: additive content-identity field (Task 9) — enables the
      // Personalized Learning Plan's strict evidence matcher to verify
      // the EXACT content ID (word-set key, dialogue ID, Grammar World
      // topic ID, etc.), never just a broad source/domain match. Old
      // records simply don't have this; nothing downstream requires it.
      // I6H-D13B Task 7: additive flat studentId passthrough — the
      // normalized event schema Task 7 specifies uses a plain studentId
      // string (distinct from the nested `student:{id,name}` object
      // above). A caller that explicitly knows which student owned an
      // activity (e.g. a delayed/queued result) can pass data.studentId
      // directly; when absent, this falls back to the same resolved
      // value already captured in `student` above — never a second,
      // independently-resolved identity.
      studentId: data.studentId || (resolvedStudent && resolvedStudent.id) || '',
      contentId: data.contentId || '',
      // I6H-D18A: additive Listening pack evidence. These fields extend
      // the one existing Ledger whitelist; no separate D18 ledger exists.
      packId: data.packId || '',
      packVersion: data.packVersion || '',
      stageId: data.stageId || '',
      itemIds: Array.isArray(data.itemIds) ? data.itemIds.slice(0, 20) : [],
      taskIds: Array.isArray(data.taskIds) ? data.taskIds.slice(0, 12) : [],
      routeMode: data.routeMode || '',
      governanceStatus: data.governanceStatus || '',
      sessionId: data.sessionId || '',
      activityAttemptId: data.activityAttemptId || '',
      completionEventId: data.completionEventId || '',
      technicalFailureCount: (typeof data.technicalFailureCount === 'number') ? data.technicalFailureCount : 0,
      // I6H-D19: additive governed Dialogue identity. These fields use the
      // same Ledger and the same idempotent `id` contract as every other
      // academy activity; no second Dialogue ledger exists.
      eventId: data.eventId || data.completionEventId || '',
      dialogueId: data.dialogueId || '',
      dialogueVersion: data.dialogueVersion || '',
      turnId: data.turnId || '',
      scoringContractId: data.scoringContractId || '',
      scoringMode: data.scoringMode || '',
      acceptedLevelId: data.acceptedLevelId || '',
      learnerPathwayId: data.learnerPathwayId || '',
      themeId: data.themeId || '',
      technicalFailureCode: data.technicalFailureCode || '',
      teacherRubricId: data.teacherRubricId || '',
      sourceLegacyDialogueIds: Array.isArray(data.sourceLegacyDialogueIds) ? data.sourceLegacyDialogueIds.slice(0, 10) : [],
      automatedScoreIsPartial: data.automatedScoreIsPartial === true,
      scoreStatus: data.scoreStatus || (isTechnicalFailure ? 'technical-neutral-unscored' : ''),
      isTechnicalFailure: isTechnicalFailure,
      academicOutcome: data.academicOutcome || (isTechnicalFailure ? 'none-technical-event' : '')
    };
    day.push(rec);
    save(model);
    notifySubscribers(rec);
    return rec;
  }

  function getRecordsByDate(dateKey) {
    var model = load();
    return (model.days[dateKey] || []).slice();
  }
  function getTodayRecords() {
    var info = null;
    try { info = cal() ? cal().todayInfo() : null; } catch (e) {}
    return getRecordsByDate(info ? info.dateKey : localDateKey());
  }
  function getRecordsForKeys(keys) {
    var model = load(), out = [];
    (keys || []).forEach(function (k) {
      var arr = model.days[k];
      if (arr && arr.length) out = out.concat(arr);
    });
    return out;
  }
  // I6H-D10: full-history getter (bounded by the existing 60-day retention
  // cap — no new storage, no new retention policy). Needed by the
  // Achievement Center's Transcript, which must find every past
  // academy-monthly-exam/academy-certificate/academy-report-card record,
  // not just the current range.
  function getAllRecords() {
    var model = load(), out = [];
    Object.keys(model.days || {}).forEach(function (k) {
      var arr = model.days[k];
      if (arr && arr.length) out = out.concat(arr);
    });
    return out;
  }
  function getCurrentWeekRecords() {
    return cal() ? getRecordsForKeys(cal().weekDateKeys()) : getTodayRecords();
  }
  // I6H-D7: study-days-only variant (Sat-Wed, 5 days) — reuses the same
  // getRecordsForKeys() as every other range getter here; no new storage,
  // no new query logic, just a different key list from the calendar.
  function getAcademyWeekStudyRecords() {
    try {
      if (cal() && cal().getAcademyWeekRange) return getRecordsForKeys(cal().getAcademyWeekRange().studyDateKeys);
    } catch (e) {}
    return getTodayRecords();
  }
  // I6H-D8: 10-study-day variant — same getRecordsForKeys() as every other
  // range getter, just fed the two-week helper's 10 keys.
  function getAcademyTwoWeekStudyRecords() {
    try {
      if (cal() && cal().getAcademyTwoWeekRange) return getRecordsForKeys(cal().getAcademyTwoWeekRange().studyDateKeys);
    } catch (e) {}
    return getTodayRecords();
  }
  // I6H-D9: 20-study-day variant — same getRecordsForKeys() pattern.
  function getAcademyMonthlyStudyRecords() {
    try {
      if (cal() && cal().getAcademyMonthlyRange) return getRecordsForKeys(cal().getAcademyMonthlyRange().studyDateKeys);
    } catch (e) {}
    return getTodayRecords();
  }
  function getCurrentTwoWeekRecords() {
    return cal() ? getRecordsForKeys(cal().twoWeekDateKeys()) : getTodayRecords();
  }
  function getCurrentAcademyMonthRecords() {
    return cal() ? getRecordsForKeys(cal().academyMonthDateKeys()) : getTodayRecords();
  }

  function summarizeRecords(records) {
    records = records || [];
    var totalItems = 0, totalGood = 0, bySource = {}, weakSeen = {}, weakItems = [];
    records.forEach(function (r) {
      totalItems += (r.total || 0);
      totalGood  += (r.good  || 0);
      bySource[r.source] = (bySource[r.source] || 0) + 1;
      (r.weakItems || []).forEach(function (w) {
        var t = (typeof w === 'string') ? w : (w && (w.q || w.target || w.en)) || '';
        if (t && !weakSeen[t] && weakItems.length < 20) { weakSeen[t] = 1; weakItems.push(t); }
      });
    });
    return {
      activities: records.length,
      totalItems: totalItems,
      totalGood: totalGood,
      pct: totalItems > 0 ? Math.round((totalGood / totalItems) * 100) : 0,
      bySource: bySource,
      weakItems: weakItems
    };
  }

  function buildDailySummary(records) {
    records = records || getTodayRecords();
    var info = null;
    try { info = cal() ? cal().todayInfo() : null; } catch (e) {}
    return {
      dateKey: info ? info.dateKey : localDateKey(),
      dayName: info ? info.dayName : '',
      calendarLabel: info ? info.label : '',
      isStudyDay: info ? info.isStudyDay : true,
      student: getStudent(),
      summary: summarizeRecords(records),
      records: records
    };
  }

  function buildDailySummaryText(records) {
    var d = buildDailySummary(records);
    var s = d.summary;
    var lines = [];
    lines.push('\uD83C\uDF93 ZIRAK ENGLISH ACADEMY \u2014 Daily Learning Record');
    if (d.student.name) lines.push('Student: ' + d.student.name);
    lines.push('Date: ' + d.dateKey + ' (' + d.dayName + ')');
    lines.push('Class day: ' + d.calendarLabel);
    lines.push('');
    lines.push('Activities completed: ' + s.activities);
    lines.push('Items attempted: ' + s.totalItems + ' \u2014 Correct: ' + s.totalGood + ' (' + s.pct + '%)');
    lines.push('');
    d.records.forEach(function (r, i) {
      var t = new Date(r.timestamp);
      var hh = (t.getHours() < 10 ? '0' : '') + t.getHours();
      var mm = (t.getMinutes() < 10 ? '0' : '') + t.getMinutes();
      lines.push((i + 1) + '. [' + hh + ':' + mm + '] ' + r.sectionTitle +
        ' \u2014 ' + r.good + '/' + r.total + ' (' + r.pct + '%)');
    });
    if (s.weakItems.length) {
      lines.push('');
      lines.push('Needs practice: ' + s.weakItems.slice(0, 6).join(' | '));
    } else if (d.records.length) {
      lines.push('');
      lines.push('No weak items today \u2014 excellent!');
    }
    lines.push('');
    lines.push('Sent via Zirak English App \uD83C\uDF1F');
    return lines.join('\n');
  }

  function exportTodayJson() {
    return JSON.stringify(buildDailySummary(), null, 2);
  }

  function copyText(text, onDone) {
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        if (onDone) onDone(true);
      } catch (e) { if (onDone) onDone(false); }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { if (onDone) onDone(true); }, fallback);
      } else fallback();
    } catch (e) { fallback(); }
  }

  /* ── Today's Learning Record overlay (verification UI, foundation) ─────── */
  function openTodayScreen() {
    var d = buildDailySummary();
    var s = d.summary;
    var old = document.getElementById('llg-overlay');
    if (old) old.remove();

    var chip = d.isStudyDay
      ? '<span class="llg-chip llg-chip-study">Study Day</span>'
      : '<span class="llg-chip llg-chip-off">' + (d.calendarLabel.indexOf('Holiday') === 0 ? 'Holiday' : 'Weekend') + '</span>';

    var listHtml = d.records.length ? d.records.map(function (r) {
      var t = new Date(r.timestamp);
      var hh = (t.getHours() < 10 ? '0' : '') + t.getHours();
      var mm = (t.getMinutes() < 10 ? '0' : '') + t.getMinutes();
      return '<div class="llg-row">' +
        '<span class="llg-row-icon">' + srcIcon(r.source) + '</span>' +
        '<div class="llg-row-main">' +
          '<div class="llg-row-title">' + esc(r.sectionTitle) + '</div>' +
          '<div class="llg-row-sub">' + hh + ':' + mm +
            (r.weakItems && r.weakItems.length ? ' \u00b7 ' + r.weakItems.length + ' weak' : '') + '</div>' +
        '</div>' +
        '<div class="llg-row-score ' + (r.pct >= 60 ? 'llg-ok' : 'llg-bad') + '">' +
          r.good + '/' + r.total + '<span class="llg-row-pct">' + r.pct + '%</span></div>' +
      '</div>';
    }).join('') : '<div class="llg-empty">No activities recorded yet today. Complete any practice and it will appear here.</div>';

    var weakHtml = s.weakItems.length
      ? '<div class="llg-weak-lbl">\uD83D\uDD01 Needs practice (' + s.weakItems.length + ')</div>' +
        s.weakItems.slice(0, 10).map(function (w) { return '<div class="llg-weak-item">\u2022 ' + esc(w) + '</div>'; }).join('')
      : (d.records.length ? '<div class="llg-noweak">\u2705 No weak items today. Great work!</div>' : '');

    var ov = document.createElement('div');
    ov.id = 'llg-overlay';
    ov.className = 'llg-overlay';
    ov.innerHTML =
      '<div class="llg-panel">' +
        '<div class="llg-head">' +
          '<div class="llg-head-title">\uD83D\uDCD8 Today\u2019s Learning Record</div>' +
          '<button type="button" class="llg-close" aria-label="Close">\u2715</button>' +
        '</div>' +
        '<div class="llg-body">' +
          '<div class="llg-meta">' +
            (d.student.name ? '<div class="llg-student">\uD83D\uDC64 ' + esc(d.student.name) + '</div>' : '') +
            '<div class="llg-cal">' + esc(d.calendarLabel) + ' ' + chip + '</div>' +
          '</div>' +
          '<div class="llg-stats">' +
            '<div class="llg-stat"><div class="llg-stat-num">' + s.activities + '</div><div class="llg-stat-lbl">Activities</div></div>' +
            '<div class="llg-stat"><div class="llg-stat-num">' + s.totalItems + '</div><div class="llg-stat-lbl">Items</div></div>' +
            '<div class="llg-stat"><div class="llg-stat-num">' + s.totalGood + '</div><div class="llg-stat-lbl">Correct</div></div>' +
            '<div class="llg-stat"><div class="llg-stat-num">' + s.pct + '%</div><div class="llg-stat-lbl">Score</div></div>' +
          '</div>' +
          '<div class="llg-list">' + listHtml + '</div>' +
          // I6H-D6: Level Readiness Snapshot, reusing ZirakAcademyTests'
          // helper if it's loaded — fully guarded, renders nothing if the
          // module or function is absent (e.g. load-order edge case),
          // and never touches the ledger overlay's own render logic.
          (typeof window.ZirakAcademyTests === 'object' && typeof window.ZirakAcademyTests.buildReadinessSnapshot === 'function'
            ? _readinessSnapshotHtmlLite(window.ZirakAcademyTests.buildReadinessSnapshot())
            : '') +
          // I6H-D7: compact "This Week" section — separate from Today's
          // record, does not replace it. Same guarded pattern as above:
          // renders nothing if ZirakAcademyTests/ZirakInstituteCalendar
          // aren't loaded or the helper functions are absent.
          _thisWeekSectionHtml() +
          // I6H-D8: separate compact Two-Week section — does not replace
          // Today's record or the Weekly section, same guarded pattern.
          _twoWeekSectionHtml() +
          // I6H-D9: separate compact Monthly section — does not replace
          // Today's record, Weekly, or Two-Week sections.
          _monthlySectionHtml() +
          '<div class="llg-weak">' + weakHtml + '</div>' +
          '<div class="llg-actions">' +
            '<button type="button" class="llg-btn llg-btn-copy" id="llg-copy-btn">\uD83D\uDCCB Copy Summary</button>' +
            '<button type="button" class="llg-btn llg-btn-wa" id="llg-wa-btn">\uD83D\uDCF2 WhatsApp</button>' +
          '</div>' +
          '<div id="llg-wa-notice" class="llg-wa-notice" style="display:none;">Father WhatsApp number is not set in the student profile. You can still share manually.</div>' +
        '</div>' +
      '</div>';
    (document.getElementById('app') || document.body).appendChild(ov);

    ov.querySelector('.llg-close').addEventListener('click', function () { ov.remove(); });
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    var copyBtn = document.getElementById('llg-copy-btn');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      copyText(buildDailySummaryText(), function (ok) {
        copyBtn.textContent = ok ? '\u2705 Copied!' : '\u26A0 Copy failed';
        setTimeout(function () { copyBtn.textContent = '\uD83D\uDCCB Copy Summary'; }, 2200);
      });
    });
    var waBtn = document.getElementById('llg-wa-btn');
    if (waBtn) waBtn.addEventListener('click', function () {
      var wa = '';
      try {
        var g = (window.ZirakResultProof && window.ZirakResultProof.getProfile) ? window.ZirakResultProof.getProfile() : null;
        wa = (g && g.wa) || '';
      } catch (e) {}
      var url = (wa ? 'https://wa.me/' + wa : 'https://wa.me/') + '?text=' +
        encodeURIComponent(buildDailySummaryText());
      if (!wa) {
        var n = document.getElementById('llg-wa-notice');
        if (n) { n.style.display = 'block'; setTimeout(function () { n.style.display = 'none'; }, 4500); }
      }
      try { window.open(url, '_blank'); } catch (e) {}
    });
  }

  /* ── Launcher card on the Review screen (guarded, injected once) ────────── */
  function injectLauncher() {
    try {
      var host = document.getElementById('screen-review');
      if (!host || document.getElementById('llg-launcher-card')) return;
      var card = document.createElement('div');
      card.id = 'llg-launcher-card';
      card.className = 'card llg-launcher';
      card.innerHTML =
        '<div class="llg-launch-txt">' +
          '<div class="llg-launch-title">\uD83D\uDCD8 Today\u2019s Learning Record</div>' +
          '<div class="llg-launch-sub">Everything completed today, in one place.</div>' +
        '</div>' +
        '<button type="button" class="llg-btn llg-btn-open" id="llg-open-btn">Open \u2192</button>';
      host.insertBefore(card, host.children[1] || null);
      var b = document.getElementById('llg-open-btn');
      if (b) b.addEventListener('click', openTodayScreen);
    } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLauncher);
  } else {
    injectLauncher();
  }

  /* ── expose ─────────────────────────────────────────────────────────────── */
  window.ZirakLearningLedger = {
    recordActivity: recordActivity,
    subscribe: subscribe, unsubscribe: unsubscribe, // I6H-D13B Task 13
    getTodayRecords: getTodayRecords,
    getRecordsByDate: getRecordsByDate,
    getCurrentWeekRecords: getCurrentWeekRecords,
    getAcademyWeekStudyRecords: getAcademyWeekStudyRecords,
    getAcademyTwoWeekStudyRecords: getAcademyTwoWeekStudyRecords,
    getAcademyMonthlyStudyRecords: getAcademyMonthlyStudyRecords,
    getAllRecords: getAllRecords,
    getCurrentTwoWeekRecords: getCurrentTwoWeekRecords,
    getCurrentAcademyMonthRecords: getCurrentAcademyMonthRecords,
    summarizeRecords: summarizeRecords,
    buildDailySummary: buildDailySummary,
    buildDailySummaryText: buildDailySummaryText,
    exportTodayJson: exportTodayJson,
    openTodayScreen: openTodayScreen,
    // I6H-D7: bridge button from the "This Week" card — closes this overlay,
    // then hands off to ZirakAcademyTests (the ONE test engine). No second
    // test flow lives here.
    openWeeklyTest: function () {
      try {
        var ov = document.getElementById('llg-overlay');
        if (ov) ov.remove();
        if (window.ZirakAcademyTests && window.ZirakAcademyTests.startWeekly) window.ZirakAcademyTests.startWeekly();
      } catch (e) {}
    },
    // I6H-D8: same bridge pattern as openWeeklyTest — closes this overlay,
    // hands off to ZirakAcademyTests (the ONE test engine).
    openTwoWeekReview: function () {
      try {
        var ov = document.getElementById('llg-overlay');
        if (ov) ov.remove();
        if (window.ZirakAcademyTests && window.ZirakAcademyTests.startTwoWeek) window.ZirakAcademyTests.startTwoWeek();
      } catch (e) {}
    },
    // I6H-D9: same bridge pattern as openWeeklyTest/openTwoWeekReview.
    openMonthlyExam: function () {
      try {
        var ov = document.getElementById('llg-overlay');
        if (ov) ov.remove();
        if (window.ZirakAcademyTests && window.ZirakAcademyTests.startMonthly) window.ZirakAcademyTests.startMonthly();
      } catch (e) {}
    }
  };
})();
