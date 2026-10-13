/* ============================================================================
   zirak-achievement-center.js — PHASE I6H-D10
   ACADEMIC ACHIEVEMENT CENTER — Monthly Report Card + Certificate + Transcript
   ----------------------------------------------------------------------------
   ONE module, ONE public API (window.ZirakAchievementCenter), ONE internal
   state object (AC). Reads from ZirakLearningLedger / ZirakInstituteCalendar
   / ZirakAcademyTests / ZirakProfile — does not duplicate any of them.
   Reuses the existing Academy Tests overlay visual language (same card/
   button classes where sensible) under a new "ac-" CSS prefix, and reuses
   the existing ZirakResultProof WhatsApp system via its customText param.
   No backend, no second ledger, no second TTS engine, no mic.
   ============================================================================ */
(function () {
  'use strict';

  /* ── safe accessors to other systems (never duplicated here) ─────────── */
  function ledger() { return window.ZirakLearningLedger || null; }
  function cal()     { return window.ZirakInstituteCalendar || null; }
  function AT()      { return window.ZirakAcademyTests || null; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function $id(id) { try { return document.getElementById(id); } catch (e) { return null; } }

  /* ── ONE internal state object — nothing achievement-related lives outside it ── */
  var AC = {
    view: 'home',          // 'home' | 'report' | 'certificate' | 'transcript' | 'history' | 'guide'
    monthlyRange: null,
    monthlyExamRecord: null,
    report: null,          // normalized report data for the CURRENT monthly cycle
    eligibility: null,
    certificate: null,     // existing issued certificate record for this cycle, if any
    speechActive: false,
    _prevHtml: null,       // for guide back-navigation inside the SAME overlay
    _pendingConfirm: null  // {kind, onConfirm} for the one shared confirm dialog
  };

  /* ══════════════════════════════════════════════════════════════════════
     SAFE PRIMITIVES (section 5 of the phase spec)
     ══════════════════════════════════════════════════════════════════════ */
  function safeArray(v) { return Array.isArray(v) ? v : []; }
  function safeNumber(v) { var n = Number(v); return isFinite(n) ? n : 0; }
  function safeText(v) { return (v === null || v === undefined || v === '') ? 'Not recorded' : String(v); }
  function safeTextRaw(v) { return (v === null || v === undefined) ? '' : String(v); }

  /* ══════════════════════════════════════════════════════════════════════
     RESULT / CERTIFICATE CATEGORY CONSTANTS — ONE source of truth, reused
     everywhere (report, certificate, transcript, WhatsApp, print).
     ══════════════════════════════════════════════════════════════════════ */
  var ACHIEVEMENT_RULES = {
    completionThreshold: 65,
    achievementThreshold: 80,
    excellenceThreshold: 90
  };

  function resultCategory(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) return 'Monthly Progress Exam Not Available';
    if (pct >= ACHIEVEMENT_RULES.excellenceThreshold) return 'Excellent Monthly Achievement';
    if (pct >= ACHIEVEMENT_RULES.achievementThreshold) return 'Strong Monthly Achievement';
    if (pct >= ACHIEVEMENT_RULES.completionThreshold) return 'Monthly Completion Achieved';
    return 'Needs Revision';
  }
  function certificateCategory(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) return null;
    if (pct >= ACHIEVEMENT_RULES.excellenceThreshold) return 'Certificate of Excellence';
    if (pct >= ACHIEVEMENT_RULES.achievementThreshold) return 'Certificate of Achievement';
    if (pct >= ACHIEVEMENT_RULES.completionThreshold) return 'Certificate of Monthly Completion';
    return null; // below threshold — not eligible
  }

  /* ══════════════════════════════════════════════════════════════════════
     STUDENT PROFILE — reuses the REAL existing API. ZirakProfile.getActive()
     does NOT exist in this codebase (verified against zirak-profile.js);
     the real method is ZirakProfile.currentStudent(). This resolver follows
     the same multi-fallback defensive pattern app.js's own getProfile()
     already uses, corrected to call real methods.
     ══════════════════════════════════════════════════════════════════════ */
  function resolveStudentProfile() {
    try {
      if (window.ZirakProfile && typeof window.ZirakProfile.currentStudent === 'function') {
        var s = window.ZirakProfile.currentStudent();
        if (s && s.fullName) {
          return { name: s.fullName, studentId: s.studentId || '', level: s.level || '', track: s.track || '' };
        }
      }
    } catch (e) {}
    try {
      if (typeof window.loadParentProfile === 'function') {
        var lp = window.loadParentProfile();
        if (lp && lp.studentName) return { name: lp.studentName, studentId: '', level: '', track: '' };
      }
    } catch (e) {}
    return { name: '', studentId: '', level: '', track: '' };
  }
  function academyIdentity() {
    var a = window.ZIRAK_ACADEMY || {};
    return { nameEn: a.nameEn || 'ZIRAK ENGLISH LANGUAGE ACADEMY', namePs: a.namePs || '' };
  }

  /* ══════════════════════════════════════════════════════════════════════
     NORMALIZATION LAYER (section 5) — supports old/new field-name aliases,
     never mutates the original ledger record, never invents scores.
     ══════════════════════════════════════════════════════════════════════ */
  function normalizeLedgerRecord(record) {
    if (!record || typeof record !== 'object') return null;
    // Shallow copy only — the phase explicitly forbids mutating originals.
    var r = {};
    for (var k in record) if (Object.prototype.hasOwnProperty.call(record, k)) r[k] = record[k];
    return r;
  }
  function normalizeMonthlyExamRecord(record) {
    var r = normalizeLedgerRecord(record);
    if (!r) return null;
    // I6H-D10: known compatibility aliasing — the monthly record may use
    // weeklyTestsCompletedMonthly/weeklyTestsTotalMonthly (D9's actual field
    // names) instead of weeklyTestsCompleted/weeklyTestsTotal. Normalize both
    // directions so callers can use either without knowing which shipped.
    r.weeklyTestsCompleted = safeNumber(
      r.weeklyTestsCompleted != null ? r.weeklyTestsCompleted : r.weeklyTestsCompletedMonthly);
    r.weeklyTestsTotal = safeNumber(
      r.weeklyTestsTotal != null ? r.weeklyTestsTotal : (r.weeklyTestsTotalMonthly != null ? r.weeklyTestsTotalMonthly : 4));
    r.twoWeekReviewsCompleted = safeNumber(r.twoWeekReviewsCompleted);
    r.twoWeekReviewsTotal = safeNumber(r.twoWeekReviewsTotal != null ? r.twoWeekReviewsTotal : 2);
    r.studyDaysCompleted = safeNumber(r.studyDaysCompleted);
    r.studyDaysTotal = safeNumber(r.studyDaysTotal != null ? r.studyDaysTotal : 20);
    r.sectionScores = safeArray(r.sectionScores);
    r.branchScores = safeArray(r.branchScores);
    r.levelScores = safeArray(r.levelScores);
    r.weakGroups = safeArray(r.weakGroups);
    r.repeatedWeakGroups = safeArray(r.repeatedWeakGroups);
    r.branchesTouched = safeArray(r.branchesTouched);
    r.levelsTouched = safeArray(r.levelsTouched);
    r.strongTags = safeArray(r.strongTags);
    r.weakTags = safeArray(r.weakTags);
    r.studyDateKeys = safeArray(r.studyDateKeys);
    r.weekRanges = safeArray(r.weekRanges);
    r.twoWeekRanges = safeArray(r.twoWeekRanges);
    r.readinessStatus = safeTextRaw(r.readinessStatus);
    r.nextAction = safeTextRaw(r.nextAction);
    r.certificateHint = safeTextRaw(r.certificateHint);
    r.good = safeNumber(r.good);
    r.total = safeNumber(r.total);
    r.pct = (r.pct != null && !isNaN(Number(r.pct))) ? Number(r.pct)
          : (r.total > 0 ? Math.round((r.good / r.total) * 100) : null);
    return r;
  }
  // I6H-D10: unique by stable id — last-write-wins is fine since ledger
  // upsert already guarantees only one live record per stable id; this is
  // a defensive de-dupe in case the same record is pulled from two range
  // queries that overlap (e.g. today's range + this week's range).
  function uniqueRecordsByStableId(records) {
    var seen = {}, out = [];
    safeArray(records).forEach(function (r) {
      var key = r && r.id ? r.id : JSON.stringify(r);
      if (!seen[key]) { seen[key] = true; out.push(r); }
    });
    return out;
  }
  function getTestRecordPercent(record) {
    if (!record) return null;
    if (record.pct != null && !isNaN(Number(record.pct))) return Number(record.pct);
    var total = safeNumber(record.total);
    return total > 0 ? Math.round((safeNumber(record.good) / total) * 100) : null;
  }

  /* ══════════════════════════════════════════════════════════════════════
     ALL-LEDGER-RECORDS ACCESS
     ══════════════════════════════════════════════════════════════════════ */
  function getAllLedgerRecords() {
    try { return ledger() && ledger().getAllRecords ? ledger().getAllRecords() : []; }
    catch (e) { return []; }
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D10A — DURABLE PER-STUDENT ACHIEVEMENT ARCHIVE
     One archive (reports + certificates together), per-student via
     ZirakStorageKey, NO retention pruning, NOT a second learning ledger:
     it stores only finalized/issued snapshots, never learning activities,
     and never feeds question pools or readiness.
     ══════════════════════════════════════════════════════════════════════ */
  var ARCHIVE_KEY = 'achievement_archive';
  var ARCHIVE_BACKUP_KEY = 'achievement_archive_corrupt_backup';
  function _archiveStorageKey(k) {
    return (typeof window.ZirakStorageKey === 'function') ? window.ZirakStorageKey(k) : ('zirak_' + k);
  }
  function _freshArchive() {
    return { schemaVersion: 1, reports: [], certificates: [], updatedAt: new Date().toISOString() };
  }
  function loadAchievementArchive() {
    var raw = null;
    try { raw = localStorage.getItem(_archiveStorageKey(ARCHIVE_KEY)); } catch (e) {}
    if (!raw) return _freshArchive();
    try {
      var model = JSON.parse(raw);
      if (!model || typeof model !== 'object' || !Array.isArray(model.reports) || !Array.isArray(model.certificates)) {
        throw new Error('shape');
      }
      return model;
    } catch (e) {
      // CORRUPTION RECOVERY: back up the raw corrupt value ONCE (don't
      // overwrite an earlier backup), then start a fresh archive. Nothing
      // else (ledger, profile, other students) is touched.
      try {
        var backupKey = _archiveStorageKey(ARCHIVE_BACKUP_KEY);
        if (localStorage.getItem(backupKey) === null) localStorage.setItem(backupKey, raw);
      } catch (e2) {}
      var fresh = _freshArchive();
      saveAchievementArchive(fresh);
      return fresh;
    }
  }
  function saveAchievementArchive(model) {
    try {
      model.updatedAt = new Date().toISOString();
      localStorage.setItem(_archiveStorageKey(ARCHIVE_KEY), JSON.stringify(model));
      return true;
    } catch (e) { return false; }
  }
  function upsertArchivedReport(snapshot) {
    if (!snapshot || !snapshot.reportId) return null;
    var model = loadAchievementArchive();
    var idx = -1;
    for (var i = 0; i < model.reports.length; i++) { if (model.reports[i].reportId === snapshot.reportId) { idx = i; break; } }
    if (idx > -1) model.reports[idx] = snapshot; else model.reports.push(snapshot);
    saveAchievementArchive(model);
    return snapshot;
  }
  function upsertArchivedCertificate(snapshot) {
    if (!snapshot || !snapshot.certificateId) return null;
    var model = loadAchievementArchive();
    var idx = -1;
    for (var i = 0; i < model.certificates.length; i++) { if (model.certificates[i].certificateId === snapshot.certificateId) { idx = i; break; } }
    if (idx > -1) model.certificates[idx] = snapshot; else model.certificates.push(snapshot);
    saveAchievementArchive(model);
    return snapshot;
  }
  function findArchivedReport(reportId) {
    var model = loadAchievementArchive();
    for (var i = 0; i < model.reports.length; i++) { if (model.reports[i].reportId === reportId) return model.reports[i]; }
    return null;
  }
  function findArchivedCertificate(certificateId) {
    var model = loadAchievementArchive();
    for (var i = 0; i < model.certificates.length; i++) { if (model.certificates[i].certificateId === certificateId) return model.certificates[i]; }
    return null;
  }
  function findArchivedReportByMonth(monthStartDateKey) {
    var model = loadAchievementArchive();
    for (var i = 0; i < model.reports.length; i++) { if (model.reports[i].monthStartDateKey === monthStartDateKey) return model.reports[i]; }
    return null;
  }
  function findArchivedCertificateByMonth(monthStartDateKey) {
    var model = loadAchievementArchive();
    for (var i = 0; i < model.certificates.length; i++) { if (model.certificates[i].monthStartDateKey === monthStartDateKey) return model.certificates[i]; }
    return null;
  }
  function getArchivedReports() { return loadAchievementArchive().reports.slice(); }
  function getArchivedCertificates() { return loadAchievementArchive().certificates.slice(); }

  /* ══════════════════════════════════════════════════════════════════
     I6H-D14B — explicit-student Achievement Archive readers.

     The Teacher Command Center must read the SELECTED student's real
     archived reports/certificates, not infer them from raw Learning
     Ledger records. These functions read that student's OWN
     'u_<studentId>_achievement_archive' key directly — never the
     active namespace, never activating the student. They reuse the
     exact same corruption-recovery contract as loadAchievementArchive
     (back up the raw corrupt value once, never overwrite an existing
     backup, then return a fresh empty archive so the rest of the
     dashboard keeps working).
     ══════════════════════════════════════════════════════════════════ */
  function _archiveStorageKeyFor(studentId, k) { return 'u_' + studentId + '_' + k; }
  function loadAchievementArchiveFor(studentId) {
    if (!studentId) return _freshArchive();
    var raw = null;
    try { raw = localStorage.getItem(_archiveStorageKeyFor(studentId, ARCHIVE_KEY)); } catch (e) {}
    if (!raw) return _freshArchive();
    try {
      var model = JSON.parse(raw);
      if (!model || typeof model !== 'object' || !Array.isArray(model.reports) || !Array.isArray(model.certificates)) {
        throw new Error('shape');
      }
      return model;
    } catch (e) {
      try {
        var backupKey = _archiveStorageKeyFor(studentId, ARCHIVE_BACKUP_KEY);
        if (localStorage.getItem(backupKey) === null) localStorage.setItem(backupKey, raw);
      } catch (e2) {}
      return _freshArchive(); // Deliberately NOT saved back — a read-only
      // explicit-student reader must never durably mutate another
      // student's storage as a side effect of being inspected.
    }
  }
  function getArchivedReportsFor(studentId) { return loadAchievementArchiveFor(studentId).reports.slice(); }
  function getArchivedCertificatesFor(studentId) { return loadAchievementArchiveFor(studentId).certificates.slice(); }
  function getArchivedReportFor(studentId, reportId) {
    var model = loadAchievementArchiveFor(studentId);
    for (var i = 0; i < model.reports.length; i++) { if (model.reports[i].reportId === reportId) return model.reports[i]; }
    return null;
  }
  function getArchivedCertificateFor(studentId, certificateId) {
    var model = loadAchievementArchiveFor(studentId);
    for (var i = 0; i < model.certificates.length; i++) { if (model.certificates[i].certificateId === certificateId) return model.certificates[i]; }
    return null;
  }

  /* ── ALIAS-SAFE NORMALIZERS for archived + legacy records ─────────── */
  // Read precedence per spec: score = record.score -> record.good;
  // percent = record.percent -> record.pct -> computed. Never overwrite a
  // valid score with zero merely because one alias is missing.
  function normalizeReportSnapshot(rec) {
    if (!rec) return null;
    var r = normalizeLedgerRecord(rec);
    var score = (typeof r.score === 'number' && r.score !== null) ? r.score
              : (typeof r.good === 'number' && r.good > 0) ? r.good
              : (typeof r.score === 'number' ? r.score : (typeof r.good === 'number' ? r.good : null));
    var total = safeNumber(r.total);
    var percent = (typeof r.percent === 'number' && r.percent !== null) ? r.percent
                : (typeof r.pct === 'number' && r.pct > 0) ? r.pct
                : (score != null && total > 0) ? Math.round((score / total) * 100)
                : (typeof r.pct === 'number' ? r.pct : null);
    r.score = score; r.total = total; r.percent = percent;
    r.reportId = r.reportId || r.id || '';
    r.resultCategory = r.resultCategory || (percent != null ? resultCategory(percent) : 'Monthly Progress Exam Not Available');
    r.sectionScores = safeArray(r.sectionScores); r.branchScores = safeArray(r.branchScores);
    r.levelScores = safeArray(r.levelScores); r.strongTags = safeArray(r.strongTags);
    r.weakTags = safeArray(r.weakTags); r.repeatedWeakGroups = safeArray(r.repeatedWeakGroups);
    return r;
  }
  function normalizeCertificateSnapshot(rec) {
    if (!rec) return null;
    var r = normalizeLedgerRecord(rec);
    r.examScore = (typeof r.examScore === 'number') ? r.examScore : null;
    r.examTotal = (typeof r.examTotal === 'number') ? r.examTotal : null;
    r.examPercent = (typeof r.examPercent === 'number') ? r.examPercent : null;
    r.certificateType = r.certificateType || (r.examPercent != null ? certificateCategory(r.examPercent) : '') || '';
    r.revisionNumber = (typeof r.revisionNumber === 'number') ? r.revisionNumber : 1;
    r.strongTags = safeArray(r.strongTags); r.weakTags = safeArray(r.weakTags);
    r.repeatedWeakGroups = safeArray(r.repeatedWeakGroups); r.branchesTouched = safeArray(r.branchesTouched);
    return r;
  }

  /* ── IDEMPOTENT MIGRATION of D10 ledger-only records into the archive ── */
  function migrateLegacyAchievementRecords() {
    var added = { reports: 0, certificates: 0 };
    var model = loadAchievementArchive();
    var all = getAllLedgerRecords();
    all.forEach(function (rec) {
      if (rec.source === 'academy-report-card') {
        var rid = rec.reportId || rec.id;
        var exists = model.reports.some(function (r) { return r.reportId === rid; });
        if (!exists) {
          var snap = normalizeReportSnapshot(rec);
          snap.reportId = rid;
          snap.stableRecordId = rec.id;
          snap.finalizedAt = rec.finalizedAt || rec.timestamp || null;
          snap.updatedAt = rec.timestamp || null;
          model.reports.push(snap); added.reports++;
        }
      }
      if (rec.source === 'academy-certificate' && rec.certificateId) {
        var exists2 = model.certificates.some(function (c) { return c.certificateId === rec.certificateId; });
        if (!exists2) {
          var snap2 = normalizeCertificateSnapshot(rec);
          snap2.stableRecordId = rec.id;
          model.certificates.push(snap2); added.certificates++;
        }
      }
    });
    if (added.reports || added.certificates) saveAchievementArchive(model);
    return added;
  }

  /* ── STATUS CONSTANTS (section 23) ─────────────────────────────────── */
  var REPORT_STATUS = { PREVIEW: 'preview', DRAFT: 'draft', FINALIZED: 'finalized' };
  var CERT_STATUS = { PREVIEW: 'preview', ELIGIBLE: 'eligible', ISSUED: 'issued', UPDATE_AVAILABLE: 'updateAvailable' };

  /* ── PRE-EXAM LOCK helper (section 5) — defensive, inside actions ──── */
  function _hasRealMonthlyExam(report) {
    report = report || AC.report || getCurrentAchievementData();
    return !!(report && report.examRecord && report.examTotal > 0 && report.examPercent !== null);
  }
  var PRE_EXAM_LOCK_MSG = 'Complete the Monthly Progress Exam to create and finalize the formal Monthly Academic Report Card.';

  /* ══════════════════════════════════════════════════════════════════════
     AUTHORITATIVE DATA RULES (section 6) — avoids double-counting.
     ══════════════════════════════════════════════════════════════════════ */
  function getCurrentMonthlyExamRecord() {
    // Reuses ZirakAcademyTests' own matching logic — does not duplicate it.
    try { return AT() && AT().findMonthlyExamRecord ? AT().findMonthlyExamRecord() : null; }
    catch (e) { return null; }
  }
  function findCertificateRecord(range) {
    range = range || (cal() ? cal().getAcademyMonthlyRange() : null);
    if (!range) return null;
    var all = getAllLedgerRecords().filter(function (r) { return r.source === 'academy-certificate'; });
    var byStart = all.filter(function (r) { return r.monthStartDateKey === range.monthStartDateKey; });
    if (byStart.length) return byStart[0];
    var inRange = all.filter(function (r) { return safeArray(range.studyDateKeys).indexOf(r.dateKey) > -1; });
    return inRange.length ? inRange[0] : null;
  }
  function findReportCardRecord(range) {
    range = range || (cal() ? cal().getAcademyMonthlyRange() : null);
    if (!range) return null;
    var all = getAllLedgerRecords().filter(function (r) { return r.source === 'academy-report-card'; });
    var byStart = all.filter(function (r) { return r.monthStartDateKey === range.monthStartDateKey; });
    if (byStart.length) return byStart[0];
    var inRange = all.filter(function (r) { return safeArray(range.studyDateKeys).indexOf(r.dateKey) > -1; });
    return inRange.length ? inRange[0] : null;
  }
  // Rule G/H: prefer the monthly exam record's own branchScores/sectionScores
  // (already computed once, correctly, by ZirakAcademyTests) — only fall
  // back to a defensive lower-level aggregate if that data is genuinely
  // missing (e.g. a very old record). Never re-derive from the SAME
  // stable records twice — that would double-count.
  function resolveBranchScores(examRecord, monthlyRecords) {
    if (examRecord && safeArray(examRecord.branchScores).length) return examRecord.branchScores;
    var tally = {};
    uniqueRecordsByStableId(monthlyRecords).forEach(function (r) {
      if (!r.branch) return;
      if (r.source === 'academy-monthly-exam') return; // avoid double count with examRecord itself
      tally[r.branch] = tally[r.branch] || { branch: r.branch, correct: 0, total: 0 };
      tally[r.branch].total += safeNumber(r.total);
      tally[r.branch].correct += safeNumber(r.good);
    });
    return Object.keys(tally).map(function (k) { return tally[k]; });
  }
  function resolveLevel(examRecord, profile) {
    if (examRecord && safeArray(examRecord.levelsTouched).length) return examRecord.levelsTouched[0];
    if (profile && profile.level) return profile.level;
    return '';
  }

  /* ══════════════════════════════════════════════════════════════════════
     CERTIFICATE ELIGIBILITY (section 9) — deterministic, local.
     ══════════════════════════════════════════════════════════════════════ */
  function evaluateCertificateEligibility(reportData) {
    if (!reportData || !reportData.examRecord) {
      return { eligible: false, category: null, reason: 'Complete the Monthly Progress Exam first.', locked: true };
    }
    var pct = reportData.examPercent;
    if (reportData.examTotal <= 0 || pct === null || isNaN(pct)) {
      return { eligible: false, category: null, reason: 'Complete the Monthly Progress Exam first.', locked: true };
    }
    if (!reportData.studentName) {
      return { eligible: false, category: null, reason: 'Add the student\u2019s name before issuing the certificate.', locked: true, missingIdentity: true };
    }
    if (pct < ACHIEVEMENT_RULES.completionThreshold) {
      return { eligible: false, category: null,
        reason: 'Monthly Progress Exam score is below the ' + ACHIEVEMENT_RULES.completionThreshold + '% certificate threshold.', locked: false };
    }
    var category = certificateCategory(pct);
    return { eligible: true, category: category,
      reason: 'Monthly Progress Exam completed with ' + pct + '%.', locked: false };
  }

  /* ══════════════════════════════════════════════════════════════════════
     STABLE CERTIFICATE ID (section 12) — deterministic, NOT cryptographic,
     never claimed as cryptographic. Stable for the same (student, month,
     exam-record) triple; only regenerated if the underlying exam record ID
     genuinely changes (a real retake), matching "stable unless the result
     it represents changes."
     ══════════════════════════════════════════════════════════════════════ */
  function _simpleCheckFragment(str) {
    var h = 0;
    str = String(str || '');
    for (var i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
    return Math.abs(h).toString(36).toUpperCase().slice(0, 4).padStart(4, '0');
  }
  function buildCertificateId(studentKey, monthStartDateKey, examRecordId) {
    var year = (monthStartDateKey || '').slice(0, 4) || String(new Date().getFullYear());
    var monthFrag = (monthStartDateKey || '').replace(/-/g, '').slice(0, 8) || '00000000';
    var studentFrag = String(studentKey || 'STU').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'STU';
    var checkFrag = _simpleCheckFragment(studentKey + '|' + monthStartDateKey + '|' + examRecordId);
    return 'ZIRAK-' + year + '-' + monthFrag + '-' + studentFrag + '-' + checkFrag;
  }

  /* ══════════════════════════════════════════════════════════════════════
     CURRENT ACHIEVEMENT DATA — builds the ONE normalized report object
     everything else (report card, certificate, WhatsApp, print, export)
     reads from. Never crashes on missing data; displays "Not recorded".
     ══════════════════════════════════════════════════════════════════════ */
  function getCurrentAchievementData() {
    var range = null;
    try { range = cal() ? cal().getAcademyMonthlyRange() : null; } catch (e) {}
    var examRaw = getCurrentMonthlyExamRecord();
    var exam = normalizeMonthlyExamRecord(examRaw);
    var profile = resolveStudentProfile();
    var academy = academyIdentity();

    var monthlyRecords = [];
    try { monthlyRecords = ledger() && ledger().getAcademyMonthlyStudyRecords ? ledger().getAcademyMonthlyStudyRecords() : []; } catch (e) {}

    var dailyTests = monthlyRecords.filter(function (r) { return r.source === 'academy-daily-test'; }).length;
    var topicTests = monthlyRecords.filter(function (r) { return r.source === 'grammar-lab-topic-test' || r.source === 'grammar-world-topic-test'; }).length;

    var examPercent = exam ? getTestRecordPercent(exam) : null;
    var examScore = exam ? exam.good : null;
    var examTotal = exam ? exam.total : 0;

    var branchScores = resolveBranchScores(exam, monthlyRecords);
    var level = resolveLevel(exam, profile);

    var certRecord = findCertificateRecord(range);
    var reportCardRecord = findReportCardRecord(range);

    var report = {
      range: range,
      examRecord: exam,
      studentName: profile.name || '',
      studentId: profile.studentId || '',
      level: level,
      academyNameEn: academy.nameEn,
      generatedDate: new Date().toISOString().slice(0, 10),
      examScore: examScore,
      examTotal: examTotal,
      examPercent: examPercent,
      resultCategory: resultCategory(examPercent),
      studyDaysCompleted: exam ? exam.studyDaysCompleted : 0,
      studyDaysTotal: exam ? exam.studyDaysTotal : 20,
      dailyTestsCompleted: dailyTests,
      topicTestsCompleted: topicTests,
      weeklyTestsCompleted: exam ? exam.weeklyTestsCompleted : 0,
      weeklyTestsTotal: exam ? exam.weeklyTestsTotal : 4,
      twoWeekReviewsCompleted: exam ? exam.twoWeekReviewsCompleted : 0,
      twoWeekReviewsTotal: exam ? exam.twoWeekReviewsTotal : 2,
      sectionScores: exam ? exam.sectionScores : [],
      branchScores: branchScores,
      levelScores: exam ? exam.levelScores : [],
      strongTags: exam ? exam.strongTags : [],
      weakTags: exam ? exam.weakTags : [],
      repeatedWeakGroups: exam ? exam.repeatedWeakGroups : [],
      readinessStatus: exam ? exam.readinessStatus : '',
      nextAction: exam ? exam.nextAction : '',
      certificateHint: exam ? exam.certificateHint : '',
      certificateRecord: certRecord,
      reportCardRecord: reportCardRecord,
      teacherComment: reportCardRecord ? reportCardRecord.teacherComment : '',
      teacherRecommendation: reportCardRecord ? reportCardRecord.teacherRecommendation : ''
    };
    report.eligibility = evaluateCertificateEligibility(report);
    return report;
  }

  /* ══════════════════════════════════════════════════════════════════════
     FOUR-WEEK TREND (section 17)
     ══════════════════════════════════════════════════════════════════════ */
  function buildFourWeekTrend(monthlyRange, ledgerRecords) {
    monthlyRange = monthlyRange || (cal() ? cal().getAcademyMonthlyRange() : null);
    if (!monthlyRange) return { weeks: [], status: 'Not Enough Data' };
    ledgerRecords = ledgerRecords || (ledger() ? ledger().getAcademyMonthlyStudyRecords() : []);
    var weeks = safeArray(monthlyRange.weekRanges).map(function (wr, idx) {
      var weekRecs = ledgerRecords.filter(function (r) { return safeArray(wr.studyDateKeys).indexOf(r.dateKey) > -1; });
      var weeklyTest = weekRecs.find(function (r) { return r.source === 'academy-weekly-test'; });
      var dailyRecs = weekRecs.filter(function (r) { return r.source === 'academy-daily-test'; });
      var dailyAvg = null;
      if (dailyRecs.length) {
        var sumPct = dailyRecs.reduce(function (s, r) { return s + (getTestRecordPercent(r) || 0); }, 0);
        dailyAvg = Math.round(sumPct / dailyRecs.length);
      }
      var days = {}; weekRecs.forEach(function (r) {
        if (r.source !== 'academy-certificate' && r.source !== 'academy-report-card') days[r.dateKey] = true;
      });
      var branchTally = {};
      weekRecs.forEach(function (r) { if (r.branch) { branchTally[r.branch] = (branchTally[r.branch] || 0) + safeNumber(r.good); } });
      var strongest = Object.keys(branchTally).sort(function (a, b) { return branchTally[b] - branchTally[a]; })[0] || '';
      var weakItem = (weekRecs.find(function (r) { return safeArray(r.weakItems).length; }) || {}).weakItems;
      return {
        label: 'Week ' + (idx + 1),
        weeklyTestPct: weeklyTest ? getTestRecordPercent(weeklyTest) : null,
        dailyAvgPct: dailyAvg,
        activeStudyDays: Object.keys(days).length,
        strongestBranch: strongest,
        weakestArea: (weakItem && weakItem[0]) || ''
      };
    });
    var comparablePts = weeks.map(function (w) { return w.weeklyTestPct != null ? w.weeklyTestPct : w.dailyAvgPct; })
      .filter(function (v) { return v != null; });
    var status;
    if (comparablePts.length < 2) status = 'Not Enough Data';
    else {
      var diffs = [];
      for (var i = 1; i < comparablePts.length; i++) diffs.push(comparablePts[i] - comparablePts[i - 1]);
      var allUp = diffs.every(function (d) { return d > 2; });
      var allDown = diffs.every(function (d) { return d < -2; });
      var allFlat = diffs.every(function (d) { return Math.abs(d) <= 2; });
      status = allUp ? 'Improving' : allDown ? 'Needs Attention' : allFlat ? 'Stable' : 'Mixed';
    }
    return { weeks: weeks, status: status };
  }

  /* ══════════════════════════════════════════════════════════════════════
     TWO-WEEK COMPARISON (report card section H)
     ══════════════════════════════════════════════════════════════════════ */
  function buildTwoWeekComparison(monthlyRange, ledgerRecords) {
    monthlyRange = monthlyRange || (cal() ? cal().getAcademyMonthlyRange() : null);
    if (!monthlyRange) return { first: null, second: null, change: null };
    ledgerRecords = ledgerRecords || (ledger() ? ledger().getAcademyMonthlyStudyRecords() : []);
    var twoWeekRecs = ledgerRecords.filter(function (r) { return r.source === 'academy-two-week-review'; });
    var ranges = safeArray(monthlyRange.twoWeekRanges);
    var first = null, second = null;
    if (ranges[0]) first = twoWeekRecs.find(function (r) { return r.rangeStartDateKey === ranges[0].rangeStartDateKey; }) || null;
    if (ranges[1]) second = twoWeekRecs.find(function (r) { return r.rangeStartDateKey === ranges[1].rangeStartDateKey; }) || null;
    var firstPct = first ? getTestRecordPercent(first) : null;
    var secondPct = second ? getTestRecordPercent(second) : null;
    var change = (firstPct != null && secondPct != null) ? (secondPct - firstPct) : null;
    return { first: firstPct, second: secondPct, change: change };
  }

  /* ══════════════════════════════════════════════════════════════════════
     CUMULATIVE PROGRESS TRANSCRIPT (section 18)
     ══════════════════════════════════════════════════════════════════════ */
  function buildTranscript() {
    // I6H-D10A (Defect 5 repair): archive-first. Archived finalized report
    // snapshots survive ledger pruning. Ledger monthly-exam records are a
    // FALLBACK only for months with no archived report yet (legacy/
    // unfinalized months), matched by monthStartDateKey to avoid duplicate
    // period rows.
    var archivedReports = getArchivedReports().map(normalizeReportSnapshot);
    var archivedCerts = getArchivedCertificates().map(normalizeCertificateSnapshot);
    var coveredMonths = {};
    archivedReports.forEach(function (r) { if (r.monthStartDateKey) coveredMonths[r.monthStartDateKey] = true; });

    var cycles = archivedReports.map(function (r) {
      var cert = archivedCerts.filter(function (c) { return c.monthStartDateKey === r.monthStartDateKey; })[0] || null;
      return {
        monthStartDateKey: r.monthStartDateKey || '',
        monthlyLabel: r.monthlyLabel || 'Academy Month',
        level: r.activeLevelSnapshot || '',
        score: r.score, total: r.total, percent: r.percent,
        resultCategory: r.resultCategory,
        studyDaysCompleted: safeNumber(r.studyDaysCompleted),
        weeklyTestsCompleted: safeNumber(r.weeklyTestsCompleted),
        twoWeekReviewsCompleted: safeNumber(r.twoWeekReviewsCompleted),
        strongestArea: safeArray(r.strongTags)[0] || '',
        repeatedWeakArea: safeArray(r.repeatedWeakGroups)[0] || '',
        certificateStatus: cert ? 'Issued' : (r.percent != null && r.percent >= ACHIEVEMENT_RULES.completionThreshold ? 'Eligible' : 'Not eligible'),
        certificateId: cert ? cert.certificateId : '',
        reportCardStatus: 'Finalized'
      };
    });
    // Ledger fallback for months not yet archived:
    var all = getAllLedgerRecords();
    var examRecords = all.filter(function (rec) {
      return rec.source === 'academy-monthly-exam' && !coveredMonths[rec.monthStartDateKey || rec.dateKey];
    });
    examRecords.forEach(function (raw) {
      var r = normalizeMonthlyExamRecord(raw);
      var pct = getTestRecordPercent(r);
      var cert = archivedCerts.filter(function (c) { return c.monthStartDateKey === r.monthStartDateKey; })[0] || null;
      cycles.push({
        monthStartDateKey: r.monthStartDateKey || r.dateKey || '',
        monthlyLabel: r.monthlyLabel || r.calendarLabel || 'Academy Month',
        level: safeArray(r.levelsTouched)[0] || '',
        score: r.good, total: r.total, percent: pct,
        resultCategory: resultCategory(pct),
        studyDaysCompleted: safeNumber(r.studyDaysCompleted),
        weeklyTestsCompleted: safeNumber(r.weeklyTestsCompleted),
        twoWeekReviewsCompleted: safeNumber(r.twoWeekReviewsCompleted),
        strongestArea: safeArray(r.strongTags)[0] || '',
        repeatedWeakArea: safeArray(r.repeatedWeakGroups)[0] || '',
        certificateStatus: cert ? 'Issued' : (pct != null && pct >= ACHIEVEMENT_RULES.completionThreshold ? 'Eligible' : 'Not eligible'),
        certificateId: cert ? cert.certificateId : '',
        reportCardStatus: 'Not finalized'
      });
    });
    // Newest first, deduped by period (archive rows already win because
    // fallback skipped covered months):
    cycles.sort(function (a, b) { return a.monthStartDateKey < b.monthStartDateKey ? 1 : a.monthStartDateKey > b.monthStartDateKey ? -1 : 0; });

    var pcts = cycles.map(function (c) { return c.percent; }).filter(function (v) { return v != null; });
    var summary = {
      totalMonthlyExams: cycles.length,
      averagePercent: pcts.length ? Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length) : null,
      highestPercent: pcts.length ? Math.max.apply(null, pcts) : null,
      certificatesIssued: cycles.filter(function (c) { return c.certificateStatus === 'Issued'; }).length,
      mostFrequentStrongBranch: _mostFrequent(cycles.map(function (c) { return c.strongestArea; })),
      mostFrequentWeakBranch: _mostFrequent(cycles.map(function (c) { return c.repeatedWeakArea; })),
      latestLevel: cycles.length ? cycles[0].level : '',
      overallTrend: pcts.length >= 2 ? (pcts[0] > pcts[pcts.length - 1] ? 'Improving' : pcts[0] < pcts[pcts.length - 1] ? 'Needs Attention' : 'Stable')
                    : null
    };
    return { cycles: cycles, summary: summary,
      needsMoreData: cycles.length < 2 ? 'More monthly records are needed for a long-term trend.' : '' };
  }
  function _mostFrequent(arr) {
    var tally = {};
    arr.forEach(function (v) { if (v) tally[v] = (tally[v] || 0) + 1; });
    var best = '', bestCount = 0;
    Object.keys(tally).forEach(function (k) { if (tally[k] > bestCount) { best = k; bestCount = tally[k]; } });
    return best;
  }

  /* ══════════════════════════════════════════════════════════════════════
     TEACHER REVIEW (section 16) — plain text, escaped, length-capped.
     ══════════════════════════════════════════════════════════════════════ */
  var TEACHER_COMMENT_MAX = 500;
  var RECOMMENDATION_OPTIONS = [
    'Continue current learning plan',
    'Continue with weak-point revision',
    'Repeat selected topics',
    'Teacher review recommended',
    'Ready for the next monthly learning cycle'
  ];
  function sanitizeTeacherComment(text) {
    // Strip any HTML tags outright (defense in depth beyond esc() at render
    // time) and hard-cap length — plain text only, no injection surface.
    var t = String(text || '').replace(/<[^>]*>/g, '').trim();
    return t.slice(0, TEACHER_COMMENT_MAX);
  }

  /* ══════════════════════════════════════════════════════════════════════
     REPORT CARD FINALIZATION (section 15) — stable upsert, no duplicates.
     ══════════════════════════════════════════════════════════════════════ */
  function buildReportSnapshotFromLive(report, teacherComment, teacherRecommendation, existingSnapshot) {
    var trend = buildFourWeekTrend(report.range);
    var academy = academyIdentity();
    var studentKey = report.studentId || report.studentName || 'student';
    var reportId = 'academy-report-card-' + report.range.monthStartDateKey + '-' + studentKey;
    var now = Date.now();
    return {
      reportId: reportId,
      stableRecordId: reportId,
      studentNameSnapshot: report.studentName,
      studentIdFragment: (report.studentId || '').slice(0, 6),
      activeLevelSnapshot: report.level,
      instituteNameSnapshot: academy.nameEn,
      teacherNameSnapshot: '',
      linkedMonthlyExamId: report.examRecord ? report.examRecord.id : '',
      monthStartDateKey: report.range.monthStartDateKey,
      monthEndDateKey: report.range.monthEndDateKey,
      monthlyLabel: report.range.monthlyLabel,
      score: report.examScore, total: report.examTotal, percent: report.examPercent,
      resultCategory: report.resultCategory,
      studyDaysCompleted: report.studyDaysCompleted,
      dailyTestsCompleted: report.dailyTestsCompleted,
      topicTestsCompleted: report.topicTestsCompleted,
      weeklyTestsCompleted: report.weeklyTestsCompleted,
      twoWeekReviewsCompleted: report.twoWeekReviewsCompleted,
      sectionScores: report.sectionScores, branchScores: report.branchScores, levelScores: report.levelScores,
      strongTags: report.strongTags, weakTags: report.weakTags, repeatedWeakGroups: report.repeatedWeakGroups,
      trendSummary: trend.status,
      readinessStatus: report.readinessStatus,
      nextAction: report.nextAction,
      teacherComment: sanitizeTeacherComment(teacherComment),
      teacherRecommendation: RECOMMENDATION_OPTIONS.indexOf(teacherRecommendation) > -1 ? teacherRecommendation : (teacherRecommendation || ''),
      // finalizedAt preserved across explicit refinalizations (documented
      // policy: the FIRST finalization date is the report's identity date);
      // updatedAt changes on every explicit refinalize.
      finalizedAt: existingSnapshot ? existingSnapshot.finalizedAt : now,
      updatedAt: now
    };
  }
  function finalizeReportCard(teacherComment, teacherRecommendation) {
    if (!ledger()) return null;
    var report = getCurrentAchievementData();
    if (!report.range) return null;
    // I6H-D10A PRE-EXAM LOCK (Defect 1 repair): a formal report requires a
    // real Monthly Progress Exam. Guard INSIDE the function, so direct calls are
    // blocked too, not just UI buttons.
    if (!_hasRealMonthlyExam(report)) return null;

    var existing = findArchivedReportByMonth(report.range.monthStartDateKey);
    var snapshot = buildReportSnapshotFromLive(report, teacherComment, teacherRecommendation, existing);
    upsertArchivedReport(snapshot);

    // Compatibility ledger summary (kept from D10 — ONE clean upsert now,
    // remove-then-save, no more double recordActivity):
    var stableId = snapshot.reportId;
    try {
      if (window.ZirakStorageKey) {
        var raw = localStorage.getItem(window.ZirakStorageKey('learning_ledger'));
        if (raw) {
          var model = JSON.parse(raw);
          var dk = report.range.monthEndDateKey;
          if (model.days && model.days[dk]) {
            model.days[dk] = model.days[dk].filter(function (r) { return r.id !== stableId; });
            localStorage.setItem(window.ZirakStorageKey('learning_ledger'), JSON.stringify(model));
          }
        }
      }
    } catch (e) {}
    ledger().recordActivity({
      id: stableId, source: 'academy-report-card', activityType: 'academy-report-card',
      sectionTitle: 'Monthly Academic Report Card', topicTitle: report.range.monthlyLabel,
      dateKey: report.range.monthEndDateKey, calendarLabel: report.range.monthlyLabel,
      // I6H-D10A (Defect 2 repair): good now carries the exam score (D10
      // passed good:0), and score/percent survive via the fixed whitelist.
      good: report.examScore || 0, total: report.examTotal || 0,
      pct: report.examPercent != null ? report.examPercent : 0,
      score: report.examScore, percent: report.examPercent,
      activeLevel: report.level,
      reportId: stableId, linkedMonthlyExamId: snapshot.linkedMonthlyExamId,
      monthStartDateKey: snapshot.monthStartDateKey, monthEndDateKey: snapshot.monthEndDateKey,
      monthlyLabel: snapshot.monthlyLabel, resultCategory: snapshot.resultCategory,
      studyDaysCompleted: snapshot.studyDaysCompleted, dailyTestsCompleted: snapshot.dailyTestsCompleted,
      topicTestsCompleted: snapshot.topicTestsCompleted, weeklyTestsCompleted: snapshot.weeklyTestsCompleted,
      twoWeekReviewsCompleted: snapshot.twoWeekReviewsCompleted,
      sectionScores: snapshot.sectionScores, branchScores: snapshot.branchScores, levelScores: snapshot.levelScores,
      strongTags: snapshot.strongTags, weakTags: snapshot.weakTags, repeatedWeakGroups: snapshot.repeatedWeakGroups,
      trendSummary: snapshot.trendSummary, teacherComment: snapshot.teacherComment,
      teacherRecommendation: snapshot.teacherRecommendation, nextActionSnapshot: snapshot.nextAction,
      finalizedAt: snapshot.finalizedAt
    });
    return snapshot;
  }

  /* ══════════════════════════════════════════════════════════════════════
     CERTIFICATE ISSUANCE (section 13/14) — stable upsert, immutable
     identity/result snapshot, revision tracking on reissue.
     ══════════════════════════════════════════════════════════════════════ */
  function buildCertificateSnapshotFromLive(report, existing) {
    var academy = academyIdentity();
    var studentKey = report.studentId || report.studentName;
    var certificateId = existing && existing.certificateId
      ? existing.certificateId
      : buildCertificateId(studentKey, report.range.monthStartDateKey, report.examRecord ? report.examRecord.id : '');
    return {
      certificateId: certificateId,
      stableRecordId: 'academy-certificate-' + report.range.monthStartDateKey + '-' + studentKey,
      certificateType: report.eligibility.category,
      certificateStatus: 'issued',
      studentNameSnapshot: report.studentName,
      studentIdFragment: (report.studentId || '').slice(0, 6),
      activeLevelSnapshot: report.level,
      instituteNameSnapshot: academy.nameEn,
      teacherNameSnapshot: '',
      monthStartDateKey: report.range.monthStartDateKey,
      monthEndDateKey: report.range.monthEndDateKey,
      monthlyLabel: report.range.monthlyLabel,
      linkedReportId: 'academy-report-card-' + report.range.monthStartDateKey + '-' + (report.studentId || report.studentName || 'student'),
      linkedMonthlyExamId: report.examRecord ? report.examRecord.id : '',
      examScore: report.examScore, examTotal: report.examTotal, examPercent: report.examPercent,
      reportCategory: report.resultCategory, readinessStatus: report.readinessStatus,
      studyDaysCompleted: report.studyDaysCompleted,
      weeklyTestsCompleted: report.weeklyTestsCompleted, twoWeekReviewsCompleted: report.twoWeekReviewsCompleted,
      branchesTouched: report.branchScores.map(function (b) { return b.branch; }),
      strongTags: report.strongTags, weakTags: report.weakTags, repeatedWeakGroups: report.repeatedWeakGroups,
      nextActionSnapshot: report.nextAction,
      teacherCommentSnapshot: sanitizeTeacherComment(report.teacherComment),
      issuedAt: existing ? existing.issuedAt : Date.now(),
      updatedAt: Date.now(),
      revisionNumber: existing ? safeNumber(existing.revisionNumber) : 1
    };
  }
  // I6H-D10A: fields that constitute "the stored snapshot actually
  // changed" for revision purposes — the result data, not timestamps.
  // I6H-D10C: shared exam-result-identity comparator. Both display-model
  // update-detectors previously compared percentage ONLY (live.examPercent
  // !== snapshot.percent), which missed same-percent-but-different-result
  // retakes (e.g. finalized 47/50=94%, retake 94/100=94%). This compares
  // exam ID + raw score + total + percent; any meaningful difference in
  // ANY available field counts as changed. A missing/absent ID on either
  // side is never treated as a meaningful difference by itself (spec
  // requirement F) — only a real ID mismatch when BOTH sides have one.
  function _normExamIdentity(id, score, total, percent) {
    var sid = (id === null || id === undefined || id === '') ? '' : String(id).trim();
    function n(v) { v = Number(v); return (v === null || v === undefined || isNaN(v)) ? null : v; }
    return { id: sid, score: n(score), total: n(total), percent: n(percent) };
  }
  function _examResultChanged(a, b) {
    if (a.id && b.id && a.id !== b.id) return true;
    if (a.score !== null && b.score !== null && a.score !== b.score) return true;
    if (a.total !== null && b.total !== null && a.total !== b.total) return true;
    if (a.percent !== null && b.percent !== null && a.percent !== b.percent) return true;
    return false;
  }
  function _certSnapshotChanged(a, b) {
    var fields = ['certificateType','studentNameSnapshot','activeLevelSnapshot','examScore','examTotal','examPercent',
      'reportCategory','monthlyLabel','linkedMonthlyExamId','studyDaysCompleted','weeklyTestsCompleted','twoWeekReviewsCompleted'];
    for (var i = 0; i < fields.length; i++) { if (JSON.stringify(a[fields[i]]) !== JSON.stringify(b[fields[i]])) return true; }
    if (JSON.stringify(a.strongTags) !== JSON.stringify(b.strongTags)) return true;
    if (JSON.stringify(a.repeatedWeakGroups) !== JSON.stringify(b.repeatedWeakGroups)) return true;
    return false;
  }
  function issueCertificate(report) {
    if (!ledger()) return null;
    report = report || getCurrentAchievementData();
    // Update path: an issued certificate exists but the CURRENT exam is not
    // eligible -> block the update, preserve the issued snapshot untouched.
    var existing = report.range ? findArchivedCertificateByMonth(report.range.monthStartDateKey) : null;
    if (!report.eligibility || !report.eligibility.eligible) {
      return existing || null; // never revoke/delete; simply refuse to replace
    }
    var studentKey = report.studentId || report.studentName;
    if (!studentKey) return null;

    var snapshot = buildCertificateSnapshotFromLive(report, existing);
    // I6H-D10A (spec 15): revisionNumber increases EXACTLY ONCE and only
    // when the stored snapshot actually changes. Repeat identical issue/
    // update calls change nothing.
    if (existing) {
      if (!_certSnapshotChanged(existing, snapshot)) {
        return existing; // identical — no revision bump, no updatedAt churn
      }
      snapshot.revisionNumber = safeNumber(existing.revisionNumber) + 1;
    }
    upsertArchivedCertificate(snapshot);

    // Compatibility ledger summary (single clean upsert):
    var stableId = snapshot.stableRecordId;
    try {
      if (window.ZirakStorageKey) {
        var raw = localStorage.getItem(window.ZirakStorageKey('learning_ledger'));
        if (raw) {
          var model = JSON.parse(raw);
          var dk = report.range.monthEndDateKey;
          if (model.days && model.days[dk]) {
            model.days[dk] = model.days[dk].filter(function (r) { return r.id !== stableId; });
            localStorage.setItem(window.ZirakStorageKey('learning_ledger'), JSON.stringify(model));
          }
        }
      }
    } catch (e) {}
    ledger().recordActivity({
      id: stableId, source: 'academy-certificate', activityType: 'academy-certificate',
      sectionTitle: snapshot.certificateType, topicTitle: snapshot.monthlyLabel,
      dateKey: report.range.monthEndDateKey, calendarLabel: snapshot.monthlyLabel,
      good: 0, total: 0,
      certificateId: snapshot.certificateId, certificateType: snapshot.certificateType, certificateStatus: 'issued',
      studentNameSnapshot: snapshot.studentNameSnapshot, studentIdFragment: snapshot.studentIdFragment,
      levelSnapshot: snapshot.activeLevelSnapshot, instituteNameSnapshot: snapshot.instituteNameSnapshot,
      monthStartDateKey: snapshot.monthStartDateKey, monthEndDateKey: snapshot.monthEndDateKey,
      monthlyLabel: snapshot.monthlyLabel, examRecordId: snapshot.linkedMonthlyExamId,
      examScore: snapshot.examScore, examTotal: snapshot.examTotal, examPercent: snapshot.examPercent,
      reportCategory: snapshot.reportCategory, readinessStatus: snapshot.readinessStatus,
      studyDaysCompleted: snapshot.studyDaysCompleted, weeklyTestsCompleted: snapshot.weeklyTestsCompleted,
      twoWeekReviewsCompleted: snapshot.twoWeekReviewsCompleted, branchesTouched: snapshot.branchesTouched,
      strongTags: snapshot.strongTags, weakTags: snapshot.weakTags, repeatedWeakGroups: snapshot.repeatedWeakGroups,
      teacherCommentSnapshot: snapshot.teacherCommentSnapshot, nextActionSnapshot: snapshot.nextActionSnapshot,
      issuedAt: snapshot.issuedAt, revisionNumber: snapshot.revisionNumber
    });
    return snapshot;
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D10A — CENTRAL CERTIFICATE DISPLAY MODEL (Defect 3 repair).
     Archive-first: once issued, the archived snapshot is authoritative for
     screen/print/export/copy/WhatsApp/History/Transcript. Only when no
     issued certificate exists may callers build a live unissued preview.
     ══════════════════════════════════════════════════════════════════════ */
  function getCertificateDisplayModel(monthStartOrCertId) {
    var snap = null;
    if (monthStartOrCertId) {
      snap = findArchivedCertificate(monthStartOrCertId) || findArchivedCertificateByMonth(monthStartOrCertId);
    } else {
      var range = null;
      try { range = cal() ? cal().getAcademyMonthlyRange() : null; } catch (e) {}
      if (range) snap = findArchivedCertificateByMonth(range.monthStartDateKey);
    }
    if (snap) {
      var norm = normalizeCertificateSnapshot(snap);
      // Update-available detection: newer live exam differs from snapshot?
      var live = getCurrentAchievementData();
      var updateAvailable = false, updateBlocked = false;
      if (live.range && live.range.monthStartDateKey === norm.monthStartDateKey && live.examPercent !== null) {
        // I6H-D10C: same full-identity comparison as the report path.
        var archivedIdC = _normExamIdentity(norm.linkedMonthlyExamId, norm.examScore, norm.examTotal, norm.examPercent);
        var liveIdC = _normExamIdentity(live.examRecord ? live.examRecord.id : '', live.examScore, live.examTotal, live.examPercent);
        if (_examResultChanged(archivedIdC, liveIdC)) {
          updateAvailable = true;
          updateBlocked = !(live.eligibility && live.eligibility.eligible);
        }
      }
      return { status: CERT_STATUS.ISSUED, snapshot: norm, updateAvailable: updateAvailable, updateBlocked: updateBlocked };
    }
    var report = getCurrentAchievementData();
    if (report.eligibility && report.eligibility.eligible) {
      return { status: CERT_STATUS.PREVIEW, snapshot: null, liveReport: report };
    }
    return { status: 'locked', snapshot: null, liveReport: report };
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D10B — CENTRAL REPORT DISPLAY MODEL (repairs the gap ChatGPT/Fable
     found in D10A: report screen/print/export/copy/WhatsApp/read-aloud all
     called getCurrentAchievementData() directly, so a Monthly Progress Exam retake
     AFTER finalization silently leaked the new live score everywhere except
     History/Transcript, which correctly stayed on the archived snapshot.
     This mirrors getCertificateDisplayModel()'s archive-first pattern:
     once finalized, the archived snapshot is authoritative for EVERY
     surface until an explicit, confirmed Update Finalized Report.
     ══════════════════════════════════════════════════════════════════════ */
  function getReportDisplayModel() {
    var range = null;
    try { range = cal() ? cal().getAcademyMonthlyRange() : null; } catch (e) {}
    var archived = range ? findArchivedReportByMonth(range.monthStartDateKey) : null;
    if (archived) {
      var norm = normalizeReportSnapshot(archived);
      var live = getCurrentAchievementData();
      var updateAvailable = false;
      if (live.range && live.range.monthStartDateKey === norm.monthStartDateKey && live.examPercent !== null) {
        // I6H-D10C: full exam-result-identity comparison (ID+score+total+
        // percent), not percentage alone.
        var archivedIdR = _normExamIdentity(norm.linkedMonthlyExamId, norm.score, norm.total, norm.percent);
        var liveIdR = _normExamIdentity(live.examRecord ? live.examRecord.id : '', live.examScore, live.examTotal, live.examPercent);
        updateAvailable = _examResultChanged(archivedIdR, liveIdR);
      }
      return { status: REPORT_STATUS.FINALIZED, snapshot: norm, updateAvailable: updateAvailable, liveReport: live };
    }
    var report = getCurrentAchievementData();
    if (_hasRealMonthlyExam(report)) return { status: REPORT_STATUS.DRAFT, snapshot: null, liveReport: report };
    return { status: REPORT_STATUS.PREVIEW, snapshot: null, liveReport: report };
  }

  /* ══════════════════════════════════════════════════════════════════════
     PRINT SUPPORT (section 20) — window.print() only, one safe print root.
     ══════════════════════════════════════════════════════════════════════ */
  function _ensurePrintRoot() {
    var root = $id('zirak-print-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'zirak-print-root';
      document.body.appendChild(root);
    }
    return root;
  }
  function _printHtml(innerHtml) {
    var root = _ensurePrintRoot();
    root.innerHTML = innerHtml;
    document.body.classList.add('zirak-printing');
    try { window.print(); } catch (e) {}
    // Restore normal view. Most browsers fire afterprint; poll-free
    // immediate restore is safest offline/older-WebView-safe fallback.
    setTimeout(function () {
      document.body.classList.remove('zirak-printing');
      root.innerHTML = '';
    }, 300);
  }
  // I6H-D10A: converts the live report to the SAME model shape archived
  // snapshots use, so every builder takes exactly ONE shape (spec 21).
  function _liveToReportModel(report) {
    return {
      reportId: '', studentNameSnapshot: report.studentName, activeLevelSnapshot: report.level,
      instituteNameSnapshot: report.academyNameEn, monthlyLabel: report.range ? report.range.monthlyLabel : '',
      monthStartDateKey: report.range ? report.range.monthStartDateKey : '',
      score: report.examScore, total: report.examTotal, percent: report.examPercent,
      resultCategory: report.resultCategory, studyDaysCompleted: report.studyDaysCompleted,
      dailyTestsCompleted: report.dailyTestsCompleted, topicTestsCompleted: report.topicTestsCompleted,
      weeklyTestsCompleted: report.weeklyTestsCompleted, twoWeekReviewsCompleted: report.twoWeekReviewsCompleted,
      sectionScores: report.sectionScores, branchScores: report.branchScores,
      strongTags: report.strongTags, weakTags: report.weakTags, repeatedWeakGroups: report.repeatedWeakGroups,
      teacherComment: report.teacherComment, teacherRecommendation: report.teacherRecommendation,
      nextAction: report.nextAction, eligibilityText: report.eligibility.eligible ? report.eligibility.category : report.eligibility.reason,
      generatedDate: report.generatedDate, finalizedAt: null
    };
  }
  function printReportCard() {
    // I6H-D10B: archive-first — once finalized, print ALWAYS uses the
    // archived snapshot, never a newer live retake, until an explicit update.
    var dm = getReportDisplayModel();
    if (dm.status === REPORT_STATUS.PREVIEW) { _showLockToast(); return; } // PRE-EXAM LOCK
    if (dm.status === REPORT_STATUS.FINALIZED) { _printHtml(buildReportPrintHtml(dm.snapshot)); return; }
    _printHtml(buildReportPrintHtml(_liveToReportModel(dm.liveReport))); // DRAFT: live is fine pre-finalization (rule B)
  }
  function printArchivedReport(reportId) {
    var snap = findArchivedReport(reportId);
    if (!snap) return;
    _printHtml(buildReportPrintHtml(normalizeReportSnapshot(snap)));
  }
  function printCertificate() {
    var dm = getCertificateDisplayModel();
    if (dm.status === CERT_STATUS.ISSUED) {
      _printHtml(buildCertificatePrintHtml(dm.snapshot, 'issued'));
    } else if (dm.status === CERT_STATUS.PREVIEW) {
      // Unissued: PREVIEW watermark, no issued date, no formal claim,
      // no archive record, no history entry (Defect 4 repair, option B).
      _printHtml(buildCertificatePrintHtml(_liveToCertModel(dm.liveReport), 'preview'));
    }
  }
  function printArchivedCertificate(certificateId) {
    var snap = findArchivedCertificate(certificateId);
    if (!snap) return;
    _printHtml(buildCertificatePrintHtml(normalizeCertificateSnapshot(snap), 'issued'));
  }
  function _liveToCertModel(report) {
    return {
      certificateId: '', certificateType: report.eligibility.category,
      studentNameSnapshot: report.studentName, activeLevelSnapshot: report.level,
      instituteNameSnapshot: report.academyNameEn, monthlyLabel: report.range ? report.range.monthlyLabel : '',
      examScore: report.examScore, examTotal: report.examTotal, examPercent: report.examPercent,
      issuedAt: null, revisionNumber: null
    };
  }
  function _showLockToast() {
    var body = $id('ac-body');
    if (body) {
      var note = document.createElement('div');
      note.className = 'ac-update-notice';
      note.innerHTML = esc(PRE_EXAM_LOCK_MSG);
      body.insertBefore ? body.insertBefore(note, body.firstChild) : body.appendChild(note);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
     EXPORT / DOWNLOAD / CLIPBOARD (section 21) — no external library.
     ══════════════════════════════════════════════════════════════════════ */
  function _sanitizeFilename(s) {
    return String(s || 'zirak').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/-+/g, '-').slice(0, 80);
  }
  function _download(filename, content, mime) {
    try {
      var blob = new Blob([content], { type: mime || 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
      return true;
    } catch (e) { return false; }
  }
  function _copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () { _copyFallback(text); });
        return true;
      }
    } catch (e) {}
    return _copyFallback(text);
  }
  function _copyFallback(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }
  function exportReportJson(reportId) {
    if (reportId) { // archived snapshot export — ONLY the selected snapshot
      var snap = findArchivedReport(reportId);
      if (!snap) return;
      _download('zirak-report-card-' + _sanitizeFilename(snap.studentIdFragment || snap.studentNameSnapshot || 'student') + '-' + (snap.monthStartDateKey || 'archived') + '.json',
        JSON.stringify(snap, null, 2), 'application/json');
      return;
    }
    // I6H-D10B: archive-first for the CURRENT month's export too.
    var dm = getReportDisplayModel();
    if (dm.status === REPORT_STATUS.PREVIEW) { _showLockToast(); return; } // PRE-EXAM LOCK
    if (dm.status === REPORT_STATUS.FINALIZED) {
      _download('zirak-report-card-' + _sanitizeFilename(dm.snapshot.studentIdFragment || dm.snapshot.studentNameSnapshot || 'student') + '-' + (dm.snapshot.monthStartDateKey || 'archived') + '.json',
        JSON.stringify(dm.snapshot, null, 2), 'application/json');
      return;
    }
    var report = dm.liveReport;
    var studentFrag = _sanitizeFilename(report.studentId || report.studentName || 'student');
    var monthStart = report.range ? report.range.monthStartDateKey : 'unknown';
    _download('zirak-report-card-' + studentFrag + '-' + monthStart + '.json',
      JSON.stringify(_liveToReportModel(report), null, 2), 'application/json');
  }
  function exportReportText(reportId) {
    if (reportId) {
      var snap = findArchivedReport(reportId);
      if (!snap) return;
      _download('zirak-report-card-' + _sanitizeFilename(snap.studentIdFragment || 'student') + '-' + (snap.monthStartDateKey || 'archived') + '.txt',
        buildReportText(normalizeReportSnapshot(snap)), 'text/plain');
      return;
    }
    var dm = getReportDisplayModel();
    if (dm.status === REPORT_STATUS.PREVIEW) { _showLockToast(); return; } // PRE-EXAM LOCK
    if (dm.status === REPORT_STATUS.FINALIZED) {
      _download('zirak-report-card-' + _sanitizeFilename(dm.snapshot.studentIdFragment || 'student') + '-' + (dm.snapshot.monthStartDateKey || 'archived') + '.txt',
        buildReportText(dm.snapshot), 'text/plain');
      return;
    }
    var report = dm.liveReport;
    var studentFrag = _sanitizeFilename(report.studentId || report.studentName || 'student');
    var monthStart = report.range ? report.range.monthStartDateKey : 'unknown';
    _download('zirak-report-card-' + studentFrag + '-' + monthStart + '.txt',
      buildReportText(_liveToReportModel(report)), 'text/plain');
  }
  function exportCertificateJson(certificateId) {
    // Archive-first (Defect 3): the issued snapshot IS the export.
    var snap = certificateId ? findArchivedCertificate(certificateId) : (getCertificateDisplayModel().snapshot);
    if (!snap) return;
    _download('zirak-certificate-' + _sanitizeFilename(snap.certificateId) + '.json',
      JSON.stringify(snap, null, 2), 'application/json');
  }
  function copyReportSummary(reportId) {
    if (reportId) {
      var snap = findArchivedReport(reportId);
      if (snap) _copyText(buildReportText(normalizeReportSnapshot(snap)));
      return;
    }
    var dm = getReportDisplayModel();
    if (dm.status === REPORT_STATUS.PREVIEW) { _showLockToast(); return; } // PRE-EXAM LOCK
    if (dm.status === REPORT_STATUS.FINALIZED) { _copyText(buildReportText(dm.snapshot)); return; }
    _copyText(buildReportText(_liveToReportModel(dm.liveReport)));
  }
  function copyCertificateDetails(certificateId) {
    var dm = certificateId ? { status: CERT_STATUS.ISSUED, snapshot: findArchivedCertificate(certificateId) } : getCertificateDisplayModel();
    if (dm.snapshot) { _copyText(buildCertificateText(normalizeCertificateSnapshot(dm.snapshot), 'issued')); return; }
    if (dm.liveReport && dm.status === CERT_STATUS.PREVIEW) _copyText(buildCertificateText(_liveToCertModel(dm.liveReport), 'preview'));
  }

  /* ══════════════════════════════════════════════════════════════════════
     PLAIN-TEXT SUMMARY BUILDERS — shared by WhatsApp, TXT export, and
     read-aloud. ONE source of text per artifact, not three.
     ══════════════════════════════════════════════════════════════════════ */
  // I6H-D10A (spec 21): explicit-model text builders. ONE model shape
  // (the snapshot shape) for both live-converted and archived data.
  function buildReportText(m) {
    var lines = [
      'ZIRAK Monthly Academic Report Card', '',
      'Student: ' + safeText(m.studentNameSnapshot),
      'Period: ' + safeText(m.monthlyLabel),
      'Monthly Progress Exam: ' + (m.total > 0 && m.score != null ? (m.score + ' / ' + m.total + ' (' + m.percent + '%)') : 'Not recorded'),
      'Level: ' + safeText(m.activeLevelSnapshot),
      'Active Study Days: ' + safeNumber(m.studyDaysCompleted) + ' / 20',
      'Weekly Progress Tests: ' + safeNumber(m.weeklyTestsCompleted) + ' / 4',
      'Two-Week Progress Reviews: ' + safeNumber(m.twoWeekReviewsCompleted) + ' / 2',
      safeArray(m.strongTags).length ? ('Strong Areas: ' + m.strongTags.join(', ')) : '',
      safeArray(m.weakTags).length ? ('Needs Review: ' + m.weakTags.join(', ')) : '',
      safeArray(m.repeatedWeakGroups).length ? ('Repeated Weak: ' + m.repeatedWeakGroups.slice(0, 3).join(', ')) : '',
      'Result: ' + safeText(m.resultCategory),
      m.teacherComment ? ('Teacher Comment: ' + m.teacherComment) : '',
      m.teacherRecommendation ? ('Recommendation: ' + m.teacherRecommendation) : '',
      m.eligibilityText ? ('Certificate: ' + m.eligibilityText) : '',
      m.nextAction ? ('Next: ' + m.nextAction) : '',
      m.finalizedAt ? ('Finalized: ' + new Date(m.finalizedAt).toISOString().slice(0, 10)) : ''
    ];
    return lines.filter(Boolean).join('\n');
  }
  function buildCertificateText(m, mode) {
    var academy = academyIdentity();
    var lines = [
      m.instituteNameSnapshot || academy.nameEn, '',
      (mode === 'preview' ? 'PREVIEW \u2014 NOT ISSUED' : ''),
      'Certificate: ' + safeText(m.certificateType),
      'Student: ' + safeText(m.studentNameSnapshot),
      'Period: ' + safeText(m.monthlyLabel),
      'Monthly Progress Exam: ' + (m.examTotal > 0 && m.examScore != null ? (m.examScore + ' / ' + m.examTotal + ' (' + m.examPercent + '%)') : 'Not recorded'),
      'Level: ' + safeText(m.activeLevelSnapshot),
      (mode !== 'preview' && m.certificateId) ? ('Certificate ID: ' + m.certificateId) : '',
      (mode !== 'preview' && m.issuedAt) ? ('Issued: ' + new Date(m.issuedAt).toISOString().slice(0, 10)) : '',
      (mode !== 'preview' && m.revisionNumber > 1) ? ('Revision: ' + m.revisionNumber) : '',
      '', 'Generated from locally stored ZIRAK Academy learning records.'
    ];
    return lines.filter(Boolean).join('\n');
  }
  function _guidePlainText() {
    var parts = ['Academic Achievement Center Guide.'];
    ACHIEVEMENT_GUIDE_SECTIONS.forEach(function (s) {
      parts.push(s.title + '.');
      s.lines.forEach(function (l) { parts.push(l); });
    });
    return parts.join(' ');
  }

  /* ══════════════════════════════════════════════════════════════════════
     WHATSAPP (section 22/23) — reuses the EXISTING ZirakResultProof system
     via its customText param (added in D6). No second WhatsApp system.
     skipLedger:true always — achievement ledger records are already saved
     explicitly by finalizeReportCard()/issueCertificate(), never by the
     WhatsApp button itself.
     ══════════════════════════════════════════════════════════════════════ */
  function shareReportWhatsApp(reportId) {
    if (!window.ZirakResultProof || !window.ZirakResultProof.renderButtonHtml) return '';
    if (reportId) { // archived snapshot share
      var snap = findArchivedReport(reportId);
      if (!snap) return '';
      var n = normalizeReportSnapshot(snap);
      return window.ZirakResultProof.renderButtonHtml('Monthly Report Card', n.score || 0, n.total || 0,
        { skipLedger: true, customText: buildReportText(n) });
    }
    // I6H-D10B: archive-first for the current month's WhatsApp share too.
    var dm = getReportDisplayModel();
    if (dm.status === REPORT_STATUS.PREVIEW) return ''; // PRE-EXAM LOCK
    if (dm.status === REPORT_STATUS.FINALIZED) {
      return window.ZirakResultProof.renderButtonHtml('Monthly Report Card', dm.snapshot.score || 0, dm.snapshot.total || 0,
        { skipLedger: true, customText: buildReportText(dm.snapshot) });
    }
    var report = dm.liveReport;
    return window.ZirakResultProof.renderButtonHtml('Monthly Report Card', report.examScore || 0, report.examTotal || 0,
      { skipLedger: true, customText: buildReportText(_liveToReportModel(report)) });
  }
  function shareCertificateWhatsApp(certificateId) {
    if (!window.ZirakResultProof || !window.ZirakResultProof.renderButtonHtml) return '';
    // Archive-first (Defect 3): issued snapshot is authoritative for WA text.
    var dm = certificateId ? { status: CERT_STATUS.ISSUED, snapshot: findArchivedCertificate(certificateId) } : getCertificateDisplayModel();
    if (dm.snapshot) {
      var n = normalizeCertificateSnapshot(dm.snapshot);
      return window.ZirakResultProof.renderButtonHtml('Certificate', n.examScore || 0, n.examTotal || 0,
        { skipLedger: true, customText: buildCertificateText(n, 'issued') });
    }
    if (dm.liveReport && dm.status === CERT_STATUS.PREVIEW) {
      return window.ZirakResultProof.renderButtonHtml('Certificate', dm.liveReport.examScore || 0, dm.liveReport.examTotal || 0,
        { skipLedger: true, customText: buildCertificateText(_liveToCertModel(dm.liveReport), 'preview') });
    }
    return '';
  }

  /* ══════════════════════════════════════════════════════════════════════
     READ-ALOUD (section 25) — separate, small, English-only speak/stop
     pair scoped ONLY to Achievement Center text. Never touches, calls, or
     is called by getQuestionSpeechText(q) or any Academy Test TTS path.
     ══════════════════════════════════════════════════════════════════════ */
  function _speak(text, onEnd) {
    var msgEl = $id('ac-tts-msg');
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      if (msgEl) msgEl.style.display = 'block';
      return;
    }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = (window.state && state.speechRate) ? state.speechRate : 0.95;
      AC.speechActive = true;
      u.onend = function () { AC.speechActive = false; if (onEnd) onEnd(); };
      u.onerror = function () { AC.speechActive = false; if (onEnd) onEnd(); };
      window.speechSynthesis.speak(u);
    } catch (e) { if (msgEl) msgEl.style.display = 'block'; }
  }
  function stopReading() {
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    AC.speechActive = false;
    var readBtns = document.querySelectorAll ? document.querySelectorAll('.ac-read-btn') : [];
    var stopBtns = document.querySelectorAll ? document.querySelectorAll('.ac-stop-btn') : [];
    for (var i = 0; i < readBtns.length; i++) readBtns[i].style.display = '';
    for (var j = 0; j < stopBtns.length; j++) stopBtns[j].style.display = 'none';
  }
  function readGuideAloud() { _speak(_guidePlainText()); _toggleReadButtons(true); }
  function readReportSummaryAloud() {
    // I6H-D10B: archive-first for read-aloud too — once finalized, reading
    // the summary must not speak a newer unconfirmed retake score.
    var dm = getReportDisplayModel();
    if (dm.status === REPORT_STATUS.FINALIZED) { _speak(buildReportText(dm.snapshot)); _toggleReadButtons(true); return; }
    _speak(buildReportText(_liveToReportModel(dm.liveReport))); _toggleReadButtons(true);
  }
  function _toggleReadButtons(active) {
    var readBtns = document.querySelectorAll ? document.querySelectorAll('.ac-read-btn') : [];
    var stopBtns = document.querySelectorAll ? document.querySelectorAll('.ac-stop-btn') : [];
    for (var i = 0; i < readBtns.length; i++) readBtns[i].style.display = active ? 'none' : '';
    for (var j = 0; j < stopBtns.length; j++) stopBtns[j].style.display = active ? 'inline-flex' : 'none';
  }

  /* ══════════════════════════════════════════════════════════════════════
     GUIDE CONTENT (section 24)
     ══════════════════════════════════════════════════════════════════════ */
  var ACHIEVEMENT_GUIDE_SECTIONS = [
    { icon: '\uD83C\uDFC6', title: 'What is the Achievement Center?', lines: [
      'A place to see your Monthly Report Card and certificate.',
      'It uses your real practice and test records only.'
    ]},
    { icon: '\uD83D\uDCC4', title: 'What is the Monthly Report Card?', lines: [
      'A summary of one academy month \u2014 20 study days.',
      'It shows your Monthly Progress Exam score, strengths, and weak points.'
    ]},
    { icon: '\uD83D\uDCCA', title: 'How are scores calculated?', lines: [
      'The Monthly Progress Exam score is the main score.',
      'Weekly and Two-Week results add detail, not extra points.'
    ]},
    { icon: '\uD83D\uDCC5', title: 'What does Study Participation mean?', lines: [
      'It counts the real academy days you practiced or tested.',
      'It is not an official school attendance record.'
    ]},
    { icon: '\uD83C\uDF96', title: 'How does certificate eligibility work?', lines: [
      'You need a completed Monthly Progress Exam with at least 65%.',
      'Your student name must also be set.'
    ]},
    { icon: '\uD83D\uDCDC', title: 'What certificate types exist?', lines: [
      '65\u201379%: Certificate of Monthly Completion.',
      '80\u201389%: Certificate of Achievement.',
      '90\u2013100%: Certificate of Excellence.'
    ]},
    { icon: '\uD83D\uDD12', title: 'Why might a certificate be locked?', lines: [
      'No Monthly Progress Exam yet, a score below 65%, or a missing student name.'
    ]},
    { icon: '\u2705', title: 'What does Finalize Report Card mean?', lines: [
      'It saves your teacher comment and recommendation with the report.',
      'You can view or print the report without finalizing it.'
    ]},
    { icon: '\uD83D\uDDA8', title: 'How does Print / Save as PDF work?', lines: [
      'Print uses your browser\u2019s own print dialog.',
      'Choose "Save as PDF" there if you want a PDF file.'
    ]},
    { icon: '\uD83D\uDCF1', title: 'What data stays on the device?', lines: [
      'Everything stays on this device unless you export or share it yourself.'
    ]},
    { icon: '\u2139\uFE0F', title: 'Does this change the student\u2019s level?', lines: [
      'No. Issuing a certificate never changes the level automatically.'
    ]},
    { icon: '\u26A0\uFE0F', title: 'Is this an accredited government certificate?', lines: [
      'No. This is a ZIRAK Academy record of one monthly learning cycle only.'
    ]}
  ];

  /* ══════════════════════════════════════════════════════════════════════
     PRINT HTML (plain, escaped, clean white layout regardless of theme)
     ══════════════════════════════════════════════════════════════════════ */
  function buildReportPrintHtml(m) {
    var academy = academyIdentity();
    return '<div class="ac-print-page">' +
      '<div class="ac-print-head">' + esc(m.instituteNameSnapshot || academy.nameEn) + '<br><span>Monthly Academic Report Card</span></div>' +
      '<table class="ac-print-table">' +
        '<tr><td>Student</td><td>' + esc(safeText(m.studentNameSnapshot)) + '</td></tr>' +
        '<tr><td>Level</td><td>' + esc(safeText(m.activeLevelSnapshot)) + '</td></tr>' +
        '<tr><td>Period</td><td>' + esc(safeText(m.monthlyLabel)) + '</td></tr>' +
        (m.finalizedAt ? '<tr><td>Finalized</td><td>' + esc(new Date(m.finalizedAt).toISOString().slice(0, 10)) + '</td></tr>' : '') +
        '<tr><td>Monthly Progress Exam</td><td>' + esc(m.total > 0 && m.score != null ? (m.score + ' / ' + m.total + ' (' + m.percent + '%)') : 'Not recorded') + '</td></tr>' +
        '<tr><td>Result</td><td>' + esc(safeText(m.resultCategory)) + '</td></tr>' +
        '<tr><td>Study Participation</td><td>' + safeNumber(m.studyDaysCompleted) + ' / 20</td></tr>' +
        '<tr><td>Weekly Progress Tests</td><td>' + safeNumber(m.weeklyTestsCompleted) + ' / 4</td></tr>' +
        '<tr><td>Two-Week Progress Reviews</td><td>' + safeNumber(m.twoWeekReviewsCompleted) + ' / 2</td></tr>' +
        '<tr><td>Strong Areas</td><td>' + esc(safeArray(m.strongTags).length ? m.strongTags.join(', ') : 'Not recorded') + '</td></tr>' +
        '<tr><td>Areas for Improvement</td><td>' + esc(safeArray(m.weakTags).length ? m.weakTags.join(', ') : 'Not recorded') + '</td></tr>' +
        '<tr><td>Repeated Weak Points</td><td>' + esc(safeArray(m.repeatedWeakGroups).length ? m.repeatedWeakGroups.join(', ') : 'Not recorded') + '</td></tr>' +
        '<tr><td>Teacher Comment</td><td>' + esc(m.teacherComment || 'Not recorded') + '</td></tr>' +
        '<tr><td>Recommendation</td><td>' + esc(m.teacherRecommendation || 'Not recorded') + '</td></tr>' +
        (m.nextAction ? '<tr><td>Next Learning Action</td><td>' + esc(m.nextAction) + '</td></tr>' : '') +
      '</table>' +
      '<div class="ac-print-foot">Generated from locally stored ZIRAK Academy learning records.</div>' +
    '</div>';
  }
  // I6H-D10A (Defect 4 repair): mode-aware certificate print. 'preview'
  // shows a PREVIEW — NOT ISSUED watermark, no issued date, no ID; only
  // 'issued' prints the formal archived certificate.
  function buildCertificatePrintHtml(m, mode) {
    var academy = academyIdentity();
    var isPreview = mode === 'preview';
    return '<div class="ac-print-page ac-cert-print' + (isPreview ? ' ac-cert-preview-mode' : '') + '">' +
      '<div class="ac-cert-border">' +
        (isPreview ? '<div class="ac-preview-watermark">PREVIEW \u2014 NOT ISSUED</div>' : '') +
        '<div class="ac-cert-academy">' + esc(m.instituteNameSnapshot || academy.nameEn) + '</div>' +
        '<div class="ac-cert-title">' + esc(safeText(m.certificateType)) + '</div>' +
        '<div class="ac-cert-line">This certifies that</div>' +
        '<div class="ac-cert-name">' + esc(safeText(m.studentNameSnapshot)) + '</div>' +
        '<div class="ac-cert-line">successfully completed the ZIRAK English Language Academy monthly learning cycle for</div>' +
        '<div class="ac-cert-period">' + esc(safeText(m.monthlyLabel)) + '</div>' +
        '<div class="ac-cert-line">and achieved</div>' +
        '<div class="ac-cert-score">' + m.examScore + ' / ' + m.examTotal + ' \u2014 ' + m.examPercent + '%</div>' +
        '<div class="ac-cert-line">in the Monthly Progress Exam.</div>' +
        '<div class="ac-cert-meta">Level: ' + esc(safeText(m.activeLevelSnapshot)) + '</div>' +
        (!isPreview && m.certificateId ? '<div class="ac-cert-meta">Certificate ID: ' + esc(m.certificateId) + '</div>' : '') +
        (!isPreview && m.issuedAt ? '<div class="ac-cert-meta">Issued: ' + esc(new Date(m.issuedAt).toISOString().slice(0, 10)) + '</div>' : '') +
        (!isPreview && m.revisionNumber > 1 ? '<div class="ac-cert-meta">Revision: ' + m.revisionNumber + '</div>' : '') +
        (isPreview ? '<div class="ac-cert-meta">This is a preview. No certificate has been issued yet.</div>' : '') +
        '<div class="ac-cert-foot">Generated from the student\u2019s locally stored ZIRAK Academy learning records.</div>' +
      '</div>' +
    '</div>';
  }

  /* ══════════════════════════════════════════════════════════════════════
     UI SHELL — ONE overlay, view-switched. Reuses at-panel's visual
     language (same look/feel) under the ac- prefix, per the phase's
     explicit instruction. Not a second overlay mechanism — same technique
     (position:fixed + panel), just its own class names.
     ══════════════════════════════════════════════════════════════════════ */
  function _renderShell(bodyHtml, title) {
    var old = $id('ac-overlay'); if (old) old.remove();
    var ov = document.createElement('div');
    ov.id = 'ac-overlay'; ov.className = 'ac-overlay';
    ov.innerHTML =
      '<div class="ac-panel">' +
        '<div class="ac-head">' +
          '<button type="button" class="ac-close" onclick="ZirakAchievementCenter.close()" aria-label="Close">\u2715 Exit</button>' +
          '<div class="ac-head-title">' + esc(title || 'Academic Achievement Center') + '</div>' +
          (AC.view !== 'home'
            ? '<button type="button" class="ac-close" onclick="ZirakAchievementCenter.renderHome()" aria-label="Back">\u2190 Back</button>'
            : '<button type="button" class="ac-close" onclick="ZirakAchievementCenter.renderGuide()" aria-label="Guide">\uD83D\uDCD8 Guide</button>') +
        '</div>' +
        '<div id="ac-body" class="ac-body">' + bodyHtml + '</div>' +
      '</div>';
    (document.getElementById('app') || document.body).appendChild(ov);
  }
  function open() {
    // I6H-D10A: idempotent migration of D10 ledger-only records into the
    // durable archive, once per open (second run adds zero duplicates).
    try { migrateLegacyAchievementRecords(); } catch (e) {}
    AC.view = 'home'; renderHome();
  }
  function close() {
    stopReading();
    var ov = $id('ac-overlay'); if (ov) ov.remove();
  }

  // ONE shared confirm dialog — used for Issue Certificate and
  // certificate-update-after-retake, per the "ask before overwriting"
  // safety requirement. Reuses the same overlay, no second dialog system.
  function _confirm(message, detailLines, onYes) {
    var body = $id('ac-body'); if (!body) return;
    AC._prevHtml = body.innerHTML;
    body.innerHTML =
      '<div class="ac-card">' +
        '<div class="ac-sec-lbl">Please Confirm</div>' +
        '<div class="ac-text">' + esc(message) + '</div>' +
        (detailLines && detailLines.length
          ? '<ul class="ac-confirm-list">' + detailLines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>'
          : '') +
        '<div class="ac-action-row">' +
          '<button type="button" class="ac-btn ac-btn-primary" id="ac-confirm-yes">Yes, Continue</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter._cancelConfirm()">Cancel</button>' +
        '</div>' +
      '</div>';
    var yesBtn = $id('ac-confirm-yes');
    if (yesBtn) yesBtn.onclick = function () { onYes(); };
  }
  function _cancelConfirm() {
    var body = $id('ac-body');
    if (body && AC._prevHtml) body.innerHTML = AC._prevHtml;
    AC._prevHtml = null;
  }

  /* ── HOME VIEW ─────────────────────────────────────────────────────── */
  function renderHome() {
    AC.view = 'home';
    var report = getCurrentAchievementData();
    AC.report = report;
    var hasExam = !!report.examRecord && report.examTotal > 0;
    // I6H-D10A: issued-state comes from the durable ARCHIVE, so the home
    // card stays correct even after ledger pruning removes the summary.
    var cert = (report.range ? findArchivedCertificateByMonth(report.range.monthStartDateKey) : null) || report.certificateRecord;

    var stateHtml;
    if (!hasExam) {
      stateHtml = '<div class="ac-state-line">Complete a Monthly Progress Exam to generate a full report card and check certificate eligibility.</div>' +
        '<div class="ac-action-row"><button type="button" class="ac-btn ac-btn-primary" onclick="ZirakAchievementCenter.renderCurrentReportCard()">View Progress Preview</button></div>';
    } else if (cert) {
      stateHtml = '<div class="ac-state-line ac-state-done">\u2705 Certificate issued for this academy month.</div>' +
        '<div class="ac-action-row">' +
          '<button type="button" class="ac-btn ac-btn-primary" onclick="ZirakAchievementCenter.renderCurrentReportCard()">Open Achievement Center</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.renderCertificatePreview()">View Certificate</button>' +
        '</div>';
    } else if (report.eligibility.eligible) {
      stateHtml = '<div class="ac-state-line ac-state-ready">\uD83C\uDF93 Report Card ready. Certificate eligible.</div>' +
        '<div class="ac-action-row">' +
          '<button type="button" class="ac-btn ac-btn-primary" onclick="ZirakAchievementCenter.renderCurrentReportCard()">Open Achievement Center</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.renderCertificatePreview()">Preview Certificate</button>' +
        '</div>';
    } else {
      stateHtml = '<div class="ac-state-line ac-state-wait">Monthly Report Card is ready.<br><span>Certificate needs more revision.</span></div>' +
        '<div class="ac-action-row"><button type="button" class="ac-btn ac-btn-primary" onclick="ZirakAchievementCenter.renderCurrentReportCard()">Open Report Card</button></div>';
    }

    var body =
      '<div class="ac-card">' +
        '<div class="ac-sec-lbl">\uD83C\uDFC6 Academic Achievement Center</div>' +
        stateHtml +
      '</div>' +
      '<div class="ac-home-links">' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.renderTranscript()">\uD83D\uDCD8 Academic Progress Transcript</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.renderHistory()">\uD83D\uDDC2 Achievement History</button>' +
      '</div>';
    _renderShell(body, 'Academic Achievement Center');
  }

  /* ── CURRENT MONTHLY REPORT CARD VIEW ─────────────────────────────── */
  function renderCurrentReportCard() {
    // I6H-D10B: archive-first. Three distinct states now, matching the
    // authoritative-source rules exactly:
    //  - PREVIEW: no exam yet -> Progress Preview (unchanged from D10A)
    //  - DRAFT: exam exists, not yet finalized -> live view is fine (rule B)
    //  - FINALIZED: archived snapshot is authoritative everywhere (rule C)
    //    until an explicit, confirmed Update Finalized Report (this was the
    //    gap: D10A gated PRINT/EXPORT/etc on "has an exam" but never checked
    //    "is there already a finalized snapshot for this month", so a
    //    retake after finalizing silently leaked the new score here).
    var dm = getReportDisplayModel();
    AC.view = 'report';

    if (dm.status === REPORT_STATUS.FINALIZED) { _renderFinalizedReportCard(dm); return; }

    var report = AC.report = dm.liveReport;
    var trend = buildFourWeekTrend(report.range);
    var twoWeekCmp = buildTwoWeekComparison(report.range);
    var hasExam = dm.status === REPORT_STATUS.DRAFT;
    var previewBanner = hasExam ? '' :
      '<div class="ac-update-notice"><b>Progress Preview</b><br>This is not a finalized Monthly Academic Report Card.<br>' + esc(PRE_EXAM_LOCK_MSG) + '</div>';

    var sectionHtml = report.sectionScores.length
      ? report.sectionScores.map(function (s) {
          var p = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
          return '<div class="ac-row"><span>' + esc(s.section) + '</span><span>' + s.correct + '/' + s.total + ' (' + p + '%)</span></div>';
        }).join('')
      : '<div class="ac-muted">Not recorded</div>';
    var branchHtml = report.branchScores.length
      ? report.branchScores.map(function (b) {
          var p = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
          return '<div class="ac-row"><span>' + esc(b.branch) + '</span><span>' + b.correct + '/' + b.total + ' (' + p + '%)</span></div>';
        }).join('')
      : '<div class="ac-muted">Not recorded</div>';
    var trendHtml = trend.weeks.length
      ? '<div class="ac-trend-row">' + trend.weeks.map(function (w) {
          var v = w.weeklyTestPct != null ? w.weeklyTestPct : w.dailyAvgPct;
          return '<div class="ac-trend-bar"><div class="ac-trend-fill" style="height:' + (v != null ? Math.max(6, v) : 4) + '%;"></div><span>' + esc(w.label) + '</span><b>' + (v != null ? v + '%' : '\u2014') + '</b></div>';
        }).join('') + '</div><div class="ac-muted">Trend: ' + esc(trend.status) + '</div>'
      : '<div class="ac-muted">Not enough data</div>';

    var body =
      previewBanner +
      '<div class="ac-card"><div class="ac-sec-lbl">Student Information</div>' +
        '<div class="ac-row"><span>Name</span><span>' + esc(safeText(report.studentName)) + '</span></div>' +
        '<div class="ac-row"><span>Level</span><span>' + esc(safeText(report.level)) + '</span></div>' +
        '<div class="ac-row"><span>Period</span><span>' + esc(report.range ? report.range.monthlyLabel : 'Not recorded') + '</span></div>' +
        '<div class="ac-row"><span>Generated</span><span>' + esc(report.generatedDate) + '</span></div>' +
      '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Monthly Progress Exam Result</div>' +
        (hasExam
          ? '<div class="ac-hero-mini">' + report.examScore + ' / ' + report.examTotal + ' <b>(' + report.examPercent + '%)</b></div><div class="ac-muted">' + esc(report.resultCategory) + '</div>'
          : '<div class="ac-muted">Not recorded \u2014 complete the Monthly Progress Exam first.</div>') +
      '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Study Participation</div>' +
        '<div class="ac-row"><span>Active Study Days</span><span>' + report.studyDaysCompleted + ' / ' + report.studyDaysTotal + '</span></div>' +
        '<div class="ac-row"><span>Daily Learning Reviews</span><span>' + report.dailyTestsCompleted + '</span></div>' +
        '<div class="ac-row"><span>Topic Quizzes</span><span>' + report.topicTestsCompleted + '</span></div>' +
        '<div class="ac-row"><span>Weekly Progress Tests</span><span>' + report.weeklyTestsCompleted + ' / ' + report.weeklyTestsTotal + '</span></div>' +
        '<div class="ac-row"><span>Two-Week Progress Reviews</span><span>' + report.twoWeekReviewsCompleted + ' / ' + report.twoWeekReviewsTotal + '</span></div>' +
      '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Performance by Section</div>' + sectionHtml + '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Performance by Branch</div>' + branchHtml + '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Strong Areas</div><div class="ac-muted">' + esc(report.strongTags.length ? report.strongTags.join(', ') : 'Not recorded') + '</div></div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Areas for Improvement</div><div class="ac-muted">' + esc(report.weakTags.length ? report.weakTags.join(', ') : 'Not recorded') + '</div>' +
        (report.repeatedWeakGroups.length ? '<div class="ac-sec-lbl" style="margin-top:6px;">Repeated Weak Points</div><div class="ac-muted">' + esc(report.repeatedWeakGroups.join(', ')) + '</div>' : '') +
      '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Four-Week Progress</div>' + trendHtml + '</div>' +
      (twoWeekCmp.first != null || twoWeekCmp.second != null
        ? '<div class="ac-card"><div class="ac-sec-lbl">Two-Week Progress</div>' +
            '<div class="ac-row"><span>First Two-Week Progress Review</span><span>' + (twoWeekCmp.first != null ? twoWeekCmp.first + '%' : 'Not recorded') + '</span></div>' +
            '<div class="ac-row"><span>Second Two-Week Progress Review</span><span>' + (twoWeekCmp.second != null ? twoWeekCmp.second + '%' : 'Not recorded') + '</span></div>' +
            (twoWeekCmp.change != null ? '<div class="ac-muted">Change: ' + (twoWeekCmp.change >= 0 ? '+' : '') + twoWeekCmp.change + '%</div>' : '') +
          '</div>'
        : '') +
      (hasExam ? '<div class="ac-card"><div class="ac-sec-lbl">Teacher Review</div>' +
        '<textarea id="ac-teacher-comment" class="ac-textarea" maxlength="500" placeholder="Teacher comment (optional)">' + esc(report.teacherComment || '') + '</textarea>' +
        '<select id="ac-teacher-recommendation" class="ac-select">' +
          '<option value="">Select a recommendation (optional)</option>' +
          RECOMMENDATION_OPTIONS.map(function (o) { return '<option value="' + esc(o) + '"' + (report.teacherRecommendation === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') +
        '</select>' +
        '<div class="ac-action-row"><button type="button" class="ac-btn ac-btn-primary" onclick="ZirakAchievementCenter._finalizeFromForm()">Finalize Report Card</button></div>' +
      '</div>' : '') +
      '<div class="ac-card"><div class="ac-sec-lbl">Next Learning Action</div><div class="ac-muted">' + esc(report.nextAction || 'Not recorded') + '</div></div>' +
      (hasExam ? '<div class="ac-card"><div class="ac-sec-lbl">Certificate Eligibility</div>' +
        '<div class="ac-muted">' + esc(report.eligibility.eligible ? (report.eligibility.category + ' \u2014 ' + report.eligibility.reason) : report.eligibility.reason) + '</div>' +
        (report.eligibility.eligible ? '<div class="ac-action-row"><button type="button" class="ac-btn ac-btn-primary" onclick="ZirakAchievementCenter.renderCertificatePreview()">Preview Certificate</button></div>' : '') +
      '</div>' : '') +
      '<div class="ac-action-row ac-sticky-actions">' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-read-btn" onclick="ZirakAchievementCenter.readReportSummaryAloud()">\uD83D\uDD0A Read Summary</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-stop-btn" style="display:none;" onclick="ZirakAchievementCenter.stopReading()">\u25A0 Stop</button>' +
        (hasExam
          ? '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.printReportCard()">\uD83D\uDDA8 Print Report Card</button>' +
            '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.exportReportJson()">\u2B07 JSON</button>' +
            '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.exportReportText()">\u2B07 TXT</button>' +
            '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.copyReportSummary()">\uD83D\uDCCB Copy</button>'
          : '<span class="ac-locked-action">Formal report actions unlock after the Monthly Progress Exam.</span>') +
      '</div>' +
      '<div id="ac-wa-report">' + (hasExam ? shareReportWhatsApp() : '') + '</div>' +
      '<div id="ac-tts-msg" style="display:none;font-size:12px;color:var(--text-muted);padding:6px 0;">Voice reading is not available on this device.</div>' +
      '<div style="height:20px;"></div>';
    _renderShell(body, hasExam ? 'Monthly Academic Report Card' : 'Progress Preview');
  }

  // I6H-D10B: the FINALIZED view — renders EXCLUSIVELY from the archived
  // snapshot (no live recomputation), matching how the issued-certificate
  // view already worked in D10A. An update-available notice plus an
  // explicit-confirm "Update Finalized Report" button is the ONLY path
  // that can ever change what's shown here.
  function _renderFinalizedReportCard(dm) {
    var m = dm.snapshot;
    AC.report = dm.liveReport; // kept for other views (certificate etc.) that still need live exam data
    var noticeHtml = dm.updateAvailable
      ? '<div class="ac-update-notice">A newer Monthly Progress Exam result is available.<br>The finalized report still shows the original approved result.' +
        '<div class="ac-action-row" style="margin-top:8px;"><button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter._updateFinalizedConfirm()">\uD83D\uDD01 Update Finalized Report</button></div>' +
        '</div>'
      : '';
    var sectionHtml = safeArray(m.sectionScores).length
      ? m.sectionScores.map(function (s) {
          var p = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
          return '<div class="ac-row"><span>' + esc(s.section) + '</span><span>' + s.correct + '/' + s.total + ' (' + p + '%)</span></div>';
        }).join('')
      : '<div class="ac-muted">Not recorded</div>';
    var branchHtml = safeArray(m.branchScores).length
      ? m.branchScores.map(function (b) {
          var p = b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0;
          return '<div class="ac-row"><span>' + esc(b.branch) + '</span><span>' + b.correct + '/' + b.total + ' (' + p + '%)</span></div>';
        }).join('')
      : '<div class="ac-muted">Not recorded</div>';

    var body =
      noticeHtml +
      '<div class="ac-card"><div class="ac-sec-lbl">Student Information</div>' +
        '<div class="ac-row"><span>Name</span><span>' + esc(safeText(m.studentNameSnapshot)) + '</span></div>' +
        '<div class="ac-row"><span>Level</span><span>' + esc(safeText(m.activeLevelSnapshot)) + '</span></div>' +
        '<div class="ac-row"><span>Period</span><span>' + esc(safeText(m.monthlyLabel)) + '</span></div>' +
        '<div class="ac-row"><span>Finalized</span><span>' + (m.finalizedAt ? esc(new Date(m.finalizedAt).toISOString().slice(0, 10)) : 'Not recorded') + '</span></div>' +
      '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Monthly Progress Exam Result</div>' +
        '<div class="ac-hero-mini">' + m.score + ' / ' + m.total + ' <b>(' + m.percent + '%)</b></div><div class="ac-muted">' + esc(m.resultCategory) + '</div>' +
      '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Study Participation</div>' +
        '<div class="ac-row"><span>Active Study Days</span><span>' + safeNumber(m.studyDaysCompleted) + ' / 20</span></div>' +
        '<div class="ac-row"><span>Daily Learning Reviews</span><span>' + safeNumber(m.dailyTestsCompleted) + '</span></div>' +
        '<div class="ac-row"><span>Topic Quizzes</span><span>' + safeNumber(m.topicTestsCompleted) + '</span></div>' +
        '<div class="ac-row"><span>Weekly Progress Tests</span><span>' + safeNumber(m.weeklyTestsCompleted) + ' / 4</span></div>' +
        '<div class="ac-row"><span>Two-Week Progress Reviews</span><span>' + safeNumber(m.twoWeekReviewsCompleted) + ' / 2</span></div>' +
      '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Performance by Section</div>' + sectionHtml + '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Performance by Branch</div>' + branchHtml + '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Strong Areas</div><div class="ac-muted">' + esc(safeArray(m.strongTags).length ? m.strongTags.join(', ') : 'Not recorded') + '</div></div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Areas for Improvement</div><div class="ac-muted">' + esc(safeArray(m.weakTags).length ? m.weakTags.join(', ') : 'Not recorded') + '</div>' +
        (safeArray(m.repeatedWeakGroups).length ? '<div class="ac-sec-lbl" style="margin-top:6px;">Repeated Weak Points</div><div class="ac-muted">' + esc(m.repeatedWeakGroups.join(', ')) + '</div>' : '') +
      '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Four-Week Progress</div><div class="ac-muted">Trend: ' + esc(safeText(m.trendSummary)) + '</div></div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Teacher Review</div>' +
        '<div class="ac-row"><span>Comment</span><span>' + esc(m.teacherComment || 'Not recorded') + '</span></div>' +
        '<div class="ac-row"><span>Recommendation</span><span>' + esc(m.teacherRecommendation || 'Not recorded') + '</span></div>' +
        '<div class="ac-sec-lbl" style="margin-top:8px;">Update comment / recommendation</div>' +
        '<textarea id="ac-teacher-comment" class="ac-textarea" maxlength="500" placeholder="New teacher comment (optional)"></textarea>' +
        '<select id="ac-teacher-recommendation" class="ac-select">' +
          '<option value="">Select a recommendation (optional)</option>' +
          RECOMMENDATION_OPTIONS.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('') +
        '</select>' +
        '<div class="ac-action-row"><button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter._updateFinalizedConfirm()">\uD83D\uDD01 Update Finalized Report</button></div>' +
      '</div>' +
      '<div class="ac-card"><div class="ac-sec-lbl">Next Learning Action</div><div class="ac-muted">' + esc(m.nextAction || 'Not recorded') + '</div></div>' +
      '<div class="ac-action-row ac-sticky-actions">' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-read-btn" onclick="ZirakAchievementCenter.readReportSummaryAloud()">\uD83D\uDD0A Read Summary</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-stop-btn" style="display:none;" onclick="ZirakAchievementCenter.stopReading()">\u25A0 Stop</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.printReportCard()">\uD83D\uDDA8 Print Report Card</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.exportReportJson()">\u2B07 JSON</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.exportReportText()">\u2B07 TXT</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.copyReportSummary()">\uD83D\uDCCB Copy</button>' +
      '</div>' +
      '<div id="ac-wa-report">' + shareReportWhatsApp() + '</div>' +
      '<div id="ac-tts-msg" style="display:none;font-size:12px;color:var(--text-muted);padding:6px 0;">Voice reading is not available on this device.</div>' +
      '<div style="height:20px;"></div>';
    _renderShell(body, 'Monthly Academic Report Card');
  }
  function _updateFinalizedConfirm() {
    var commentEl = $id('ac-teacher-comment'); var recEl = $id('ac-teacher-recommendation');
    var newComment = commentEl ? commentEl.value : '';
    var newRec = recEl ? recEl.value : '';
    _confirm('This will replace the stored finalized report with the current Monthly Progress Exam result. The report ID stays the same. Continue?', [
      'The report ID and original finalized date are preserved.',
      'Only the "last updated" time changes.',
      'This does not create a duplicate record.'
    ], function () {
      var dmBefore = getReportDisplayModel();
      var keepComment = newComment || (dmBefore.snapshot ? dmBefore.snapshot.teacherComment : '');
      var keepRec = newRec || (dmBefore.snapshot ? dmBefore.snapshot.teacherRecommendation : '');
      finalizeReportCard(keepComment, keepRec);
      renderCurrentReportCard();
    });
  }

  function _finalizeFromForm() {
    var comment = $id('ac-teacher-comment'); var rec = $id('ac-teacher-recommendation');
    finalizeReportCard(comment ? comment.value : '', rec ? rec.value : '');
    renderCurrentReportCard();
  }

  /* ── CERTIFICATE PREVIEW VIEW ─────────────────────────────────────── */
  function renderCertificatePreview() {
    AC.view = 'certificate';
    var dm = getCertificateDisplayModel();

    if (dm.status === 'locked') {
      var elig = dm.liveReport.eligibility;
      var body0 =
        '<div class="ac-card"><div class="ac-sec-lbl">Certificate Preview</div>' +
          '<div class="ac-muted">' + esc(elig.reason) + '</div>' +
          (elig.missingIdentity
            ? '<div class="ac-action-row"><button type="button" class="ac-btn ac-btn-ghost" onclick="if(window.ZirakProfile&&window.ZirakProfile.openAppSettings)window.ZirakProfile.openAppSettings();">Open Profile / Settings</button></div>'
            : '') +
        '</div>';
      _renderShell(body0, 'Certificate Preview');
      return;
    }

    // I6H-D10A (Defect 3 repair): ISSUED snapshot is authoritative for
    // everything shown here; live data only appears as an update NOTICE.
    if (dm.status === CERT_STATUS.ISSUED) {
      var m = dm.snapshot;
      var noticeHtml = '';
      if (dm.updateAvailable) {
        noticeHtml = '<div class="ac-update-notice">A newer Monthly Progress Exam result is available. The issued certificate still shows the original approved result.' +
          (dm.updateBlocked
            ? '<br><b>The newer result is below the certificate threshold, so it cannot replace this certificate.</b>'
            : '') +
          '</div>' +
          (dm.updateBlocked ? '' : '<div class="ac-action-row"><button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter._reissueConfirm()">\uD83D\uDD01 Update Certificate</button></div>');
      }
      var body1 =
        noticeHtml +
        '<div class="ac-cert-preview">' +
          '<div class="ac-cert-border">' +
            '<div class="ac-cert-academy">' + esc(m.instituteNameSnapshot) + '</div>' +
            '<div class="ac-cert-title">' + esc(m.certificateType) + '</div>' +
            '<div class="ac-cert-line">This certifies that</div>' +
            '<div class="ac-cert-name">' + esc(safeText(m.studentNameSnapshot)) + '</div>' +
            '<div class="ac-cert-line">successfully completed the ZIRAK English Language Academy monthly learning cycle for</div>' +
            '<div class="ac-cert-period">' + esc(m.monthlyLabel) + '</div>' +
            '<div class="ac-cert-line">and achieved</div>' +
            '<div class="ac-cert-score">' + m.examScore + ' / ' + m.examTotal + ' \u2014 ' + m.examPercent + '%</div>' +
            '<div class="ac-cert-line">in the Monthly Progress Exam.</div>' +
            '<div class="ac-cert-meta">Level: ' + esc(safeText(m.activeLevelSnapshot)) + '</div>' +
            '<div class="ac-cert-meta">Certificate ID: ' + esc(m.certificateId) + '</div>' +
            '<div class="ac-cert-meta">Issued: ' + esc(new Date(m.issuedAt).toISOString().slice(0, 10)) + '</div>' +
            (m.revisionNumber > 1 ? '<div class="ac-cert-meta">Revision: ' + m.revisionNumber + '</div>' : '') +
            '<div class="ac-cert-foot">Generated from the student\u2019s locally stored ZIRAK Academy learning records.</div>' +
          '</div>' +
        '</div>' +
        '<div class="ac-action-row ac-sticky-actions">' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.printCertificate()">\uD83D\uDDA8 Print Certificate</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.exportCertificateJson()">\u2B07 JSON</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.copyCertificateDetails()">\uD83D\uDCCB Copy</button>' +
        '</div>' +
        '<div id="ac-wa-cert">' + shareCertificateWhatsApp() + '</div>' +
        '<div style="height:20px;"></div>';
      _renderShell(body1, 'Certificate');
      return;
    }

    // UNISSUED PREVIEW (Defect 4 repair): visibly watermarked, no issued
    // date, no formal ID; issue button available.
    var report = dm.liveReport;
    var body =
      '<div class="ac-cert-preview">' +
        '<div class="ac-cert-border ac-cert-unissued">' +
          '<div class="ac-preview-watermark">PREVIEW \u2014 NOT ISSUED</div>' +
          '<div class="ac-cert-academy">' + esc(report.academyNameEn) + '</div>' +
          '<div class="ac-cert-title">' + esc(report.eligibility.category) + '</div>' +
          '<div class="ac-cert-line">This certifies that</div>' +
          '<div class="ac-cert-name">' + esc(safeText(report.studentName)) + '</div>' +
          '<div class="ac-cert-line">successfully completed the ZIRAK English Language Academy monthly learning cycle for</div>' +
          '<div class="ac-cert-period">' + esc(report.range.monthlyLabel) + '</div>' +
          '<div class="ac-cert-line">and achieved</div>' +
          '<div class="ac-cert-score">' + report.examScore + ' / ' + report.examTotal + ' \u2014 ' + report.examPercent + '%</div>' +
          '<div class="ac-cert-line">in the Monthly Progress Exam.</div>' +
          '<div class="ac-cert-meta">Level: ' + esc(safeText(report.level)) + '</div>' +
          '<div class="ac-cert-meta">This is a preview. No certificate has been issued yet.</div>' +
          '<div class="ac-cert-foot">Generated from the student\u2019s locally stored ZIRAK Academy learning records.</div>' +
        '</div>' +
      '</div>' +
      '<div class="ac-action-row ac-sticky-actions">' +
        '<button type="button" class="ac-btn ac-btn-primary" onclick="ZirakAchievementCenter._issueConfirm()">\uD83C\uDF93 Issue Certificate</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.printCertificate()">\uD83D\uDDA8 Print Preview</button>' +
      '</div>' +
      '<div style="height:20px;"></div>';
    _renderShell(body, 'Certificate Preview');
  }
  function _issueConfirm() {
    var report = AC.report || getCurrentAchievementData();
    _confirm('Issue this certificate using the current Monthly Progress Exam result?', [
      'It will be saved locally on this device.',
      'It will not create a backend account.',
      'It will not publish anything online.',
      'It will not change the student\u2019s level automatically.'
    ], function () { issueCertificate(report); renderCertificatePreview(); });
  }
  function _reissueConfirm() {
    var report = AC.report || getCurrentAchievementData();
    _confirm('Update the existing certificate with the current Monthly Progress Exam result?', [
      'The certificate ID stays the same.',
      'The original issue date is preserved.',
      'The revision number will increase.'
    ], function () { issueCertificate(report); renderCertificatePreview(); });
  }

  /* ── TRANSCRIPT VIEW ───────────────────────────────────────────────── */
  function renderTranscript() {
    AC.view = 'transcript';
    var t = buildTranscript();
    var cyclesHtml = t.cycles.length
      ? t.cycles.map(function (c) {
          return '<div class="ac-card">' +
            '<div class="ac-sec-lbl">' + esc(c.monthlyLabel) + '</div>' +
            '<div class="ac-row"><span>Level</span><span>' + esc(safeText(c.level)) + '</span></div>' +
            '<div class="ac-row"><span>Score</span><span>' + (c.percent != null ? c.score + '/' + c.total + ' (' + c.percent + '%)' : 'Not recorded') + '</span></div>' +
            '<div class="ac-row"><span>Result</span><span>' + esc(c.resultCategory) + '</span></div>' +
            '<div class="ac-row"><span>Study Days</span><span>' + c.studyDaysCompleted + ' / 20</span></div>' +
            '<div class="ac-row"><span>Weekly Progress Tests</span><span>' + c.weeklyTestsCompleted + ' / 4</span></div>' +
            '<div class="ac-row"><span>Two-Week Progress Reviews</span><span>' + c.twoWeekReviewsCompleted + ' / 2</span></div>' +
            (c.strongestArea ? '<div class="ac-row"><span>Strongest</span><span>' + esc(c.strongestArea) + '</span></div>' : '') +
            (c.repeatedWeakArea ? '<div class="ac-row"><span>Repeated Weak</span><span>' + esc(c.repeatedWeakArea) + '</span></div>' : '') +
            '<div class="ac-row"><span>Certificate</span><span>' + esc(c.certificateStatus) + (c.certificateId ? ' (' + esc(c.certificateId) + ')' : '') + '</span></div>' +
            '<div class="ac-row"><span>Report Card</span><span>' + esc(c.reportCardStatus) + '</span></div>' +
          '</div>';
        }).join('')
      : '<div class="ac-muted">No monthly records yet.</div>';

    var body =
      '<div class="ac-card"><div class="ac-sec-lbl">Transcript Summary</div>' +
        '<div class="ac-row"><span>Monthly Progress Exams</span><span>' + t.summary.totalMonthlyExams + '</span></div>' +
        '<div class="ac-row"><span>Average %</span><span>' + (t.summary.averagePercent != null ? t.summary.averagePercent + '%' : 'Not recorded') + '</span></div>' +
        '<div class="ac-row"><span>Highest %</span><span>' + (t.summary.highestPercent != null ? t.summary.highestPercent + '%' : 'Not recorded') + '</span></div>' +
        '<div class="ac-row"><span>Certificates Issued</span><span>' + t.summary.certificatesIssued + '</span></div>' +
        (t.summary.mostFrequentStrongBranch ? '<div class="ac-row"><span>Frequent Strong</span><span>' + esc(t.summary.mostFrequentStrongBranch) + '</span></div>' : '') +
        (t.summary.mostFrequentWeakBranch ? '<div class="ac-row"><span>Frequent Weak</span><span>' + esc(t.summary.mostFrequentWeakBranch) + '</span></div>' : '') +
        (t.summary.latestLevel ? '<div class="ac-row"><span>Latest Level</span><span>' + esc(t.summary.latestLevel) + '</span></div>' : '') +
        (t.summary.overallTrend ? '<div class="ac-row"><span>Overall Trend</span><span>' + esc(t.summary.overallTrend) + '</span></div>' : '') +
        (t.needsMoreData ? '<div class="ac-muted">' + esc(t.needsMoreData) + '</div>' : '') +
      '</div>' +
      cyclesHtml + '<div style="height:20px;"></div>';
    _renderShell(body, 'Academic Progress Transcript');
  }

  /* ── HISTORY VIEW ──────────────────────────────────────────────────── */
  function renderHistory() {
    AC.view = 'history';
    // I6H-D10A (Defects 5+6 repair): archive-first, ledger fallback only
    // for legacy records not yet migrated (migration runs on open()).
    var reports = getArchivedReports().map(normalizeReportSnapshot);
    var certs = getArchivedCertificates().map(normalizeCertificateSnapshot);
    reports.sort(function (a, b) { return (b.finalizedAt || 0) - (a.finalizedAt || 0); });
    certs.sort(function (a, b) { return (b.issuedAt || 0) - (a.issuedAt || 0); });

    var reportsHtml = reports.map(function (r) {
      return '<div class="ac-card">' +
        '<div class="ac-sec-lbl">\uD83D\uDCC4 ' + esc(r.monthlyLabel || 'Report Card') + '</div>' +
        '<div class="ac-muted">' + (r.percent != null ? (r.score + '/' + r.total + ' (' + r.percent + '%)') : 'Not recorded') +
          ' \u2014 ' + esc(r.resultCategory) +
          (r.finalizedAt ? ' \u2014 Finalized ' + esc(new Date(r.finalizedAt).toISOString().slice(0, 10)) : '') + '</div>' +
        '<div class="ac-action-row ac-history-actions">' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.openArchivedReport(\'' + esc(r.reportId) + '\')">View</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.printArchivedReport(\'' + esc(r.reportId) + '\')">Print</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.exportReportJson(\'' + esc(r.reportId) + '\')">JSON</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.exportReportText(\'' + esc(r.reportId) + '\')">TXT</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.copyReportSummary(\'' + esc(r.reportId) + '\')">Copy</button>' +
        '</div>' +
        '<div class="ac-wa-slot">' + shareReportWhatsApp(r.reportId) + '</div>' +
      '</div>';
    }).join('');
    var certsHtml = certs.map(function (c) {
      return '<div class="ac-card">' +
        '<div class="ac-sec-lbl">\uD83C\uDF96 ' + esc(c.certificateType || 'Certificate') + '</div>' +
        '<div class="ac-muted">' + esc(c.certificateId) + ' \u2014 ' + esc(c.monthlyLabel || '') +
          (c.examPercent != null ? ' \u2014 ' + c.examPercent + '%' : '') +
          (c.issuedAt ? ' \u2014 Issued ' + esc(new Date(c.issuedAt).toISOString().slice(0, 10)) : '') + '</div>' +
        '<div class="ac-action-row ac-history-actions">' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.openArchivedCertificate(\'' + esc(c.certificateId) + '\')">View</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.printArchivedCertificate(\'' + esc(c.certificateId) + '\')">Print</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.exportCertificateJson(\'' + esc(c.certificateId) + '\')">JSON</button>' +
          '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.copyCertificateDetails(\'' + esc(c.certificateId) + '\')">Copy</button>' +
        '</div>' +
        '<div class="ac-wa-slot">' + shareCertificateWhatsApp(c.certificateId) + '</div>' +
      '</div>';
    }).join('');

    var body = '<div class="ac-card"><div class="ac-sec-lbl">Achievement History</div>' +
      '<div class="ac-muted">' + reports.length + ' finalized report' + (reports.length === 1 ? '' : 's') + ', ' + certs.length + ' issued certificate' + (certs.length === 1 ? '' : 's') + '.</div>' +
      '<div class="ac-archive-status">Stored durably on this device \u2014 not affected by learning-record cleanup.</div></div>' +
      (reports.length ? '<div class="ac-sec-lbl" style="padding:4px 2px;">Finalized Reports</div>' + reportsHtml : '') +
      (certs.length ? '<div class="ac-sec-lbl" style="padding:4px 2px;">Issued Certificates</div>' + certsHtml : '') +
      (!reports.length && !certs.length ? '<div class="ac-muted">No achievement records yet.</div>' : '') +
      '<div style="height:20px;"></div>';
    _renderShell(body, 'Achievement History');
  }

  /* ── I6H-D10A: HISTORICAL SNAPSHOT VIEWS (spec 20) ─────────────────── */
  function openArchivedReport(reportId) {
    var snap = findArchivedReport(reportId);
    if (!snap) { renderHistory(); return; }
    AC.view = 'archivedReport';
    var m = normalizeReportSnapshot(snap);
    var body =
      '<div class="ac-card"><div class="ac-sec-lbl">Archived Monthly Report Card</div>' +
        '<div class="ac-row"><span>Student</span><span>' + esc(safeText(m.studentNameSnapshot)) + '</span></div>' +
        '<div class="ac-row"><span>Level</span><span>' + esc(safeText(m.activeLevelSnapshot)) + '</span></div>' +
        '<div class="ac-row"><span>Period</span><span>' + esc(safeText(m.monthlyLabel)) + '</span></div>' +
        '<div class="ac-row"><span>Score</span><span>' + (m.percent != null ? (m.score + '/' + m.total + ' (' + m.percent + '%)') : 'Not recorded') + '</span></div>' +
        '<div class="ac-row"><span>Result</span><span>' + esc(m.resultCategory) + '</span></div>' +
        '<div class="ac-row"><span>Study Days</span><span>' + safeNumber(m.studyDaysCompleted) + ' / 20</span></div>' +
        '<div class="ac-row"><span>Weekly Progress Tests</span><span>' + safeNumber(m.weeklyTestsCompleted) + ' / 4</span></div>' +
        '<div class="ac-row"><span>Two-Week Progress Reviews</span><span>' + safeNumber(m.twoWeekReviewsCompleted) + ' / 2</span></div>' +
        (m.teacherComment ? '<div class="ac-row"><span>Teacher Comment</span><span>' + esc(m.teacherComment) + '</span></div>' : '') +
        (m.teacherRecommendation ? '<div class="ac-row"><span>Recommendation</span><span>' + esc(m.teacherRecommendation) + '</span></div>' : '') +
        (m.finalizedAt ? '<div class="ac-row"><span>Finalized</span><span>' + esc(new Date(m.finalizedAt).toISOString().slice(0, 10)) + '</span></div>' : '') +
      '</div>' +
      '<div class="ac-action-row">' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.printArchivedReport(\'' + esc(m.reportId) + '\')">\uD83D\uDDA8 Print</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.renderHistory()">\u2190 Back to History</button>' +
      '</div><div style="height:20px;"></div>';
    _renderShell(body, 'Archived Report');
  }
  function openArchivedCertificate(certificateId) {
    var snap = findArchivedCertificate(certificateId);
    if (!snap) { renderHistory(); return; }
    AC.view = 'archivedCertificate';
    var m = normalizeCertificateSnapshot(snap);
    var body =
      '<div class="ac-cert-preview"><div class="ac-cert-border">' +
        '<div class="ac-cert-academy">' + esc(safeText(m.instituteNameSnapshot)) + '</div>' +
        '<div class="ac-cert-title">' + esc(safeText(m.certificateType)) + '</div>' +
        '<div class="ac-cert-line">This certifies that</div>' +
        '<div class="ac-cert-name">' + esc(safeText(m.studentNameSnapshot)) + '</div>' +
        '<div class="ac-cert-period">' + esc(safeText(m.monthlyLabel)) + '</div>' +
        '<div class="ac-cert-score">' + m.examScore + ' / ' + m.examTotal + ' \u2014 ' + m.examPercent + '%</div>' +
        '<div class="ac-cert-meta">Level: ' + esc(safeText(m.activeLevelSnapshot)) + '</div>' +
        '<div class="ac-cert-meta">Certificate ID: ' + esc(m.certificateId) + '</div>' +
        (m.issuedAt ? '<div class="ac-cert-meta">Issued: ' + esc(new Date(m.issuedAt).toISOString().slice(0, 10)) + '</div>' : '') +
        (m.revisionNumber > 1 ? '<div class="ac-cert-meta">Revision: ' + m.revisionNumber + '</div>' : '') +
      '</div></div>' +
      '<div class="ac-action-row">' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.printArchivedCertificate(\'' + esc(m.certificateId) + '\')">\uD83D\uDDA8 Print</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost" onclick="ZirakAchievementCenter.renderHistory()">\u2190 Back to History</button>' +
      '</div><div style="height:20px;"></div>';
    _renderShell(body, 'Archived Certificate');
  }

  /* ── GUIDE VIEW ────────────────────────────────────────────────────── */
  function renderGuide() {
    AC.view = 'guide';
    var body = '<div class="ac-action-row" style="padding-bottom:8px;">' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-read-btn" onclick="ZirakAchievementCenter.readGuideAloud()">\uD83D\uDD0A Read Guide Aloud</button>' +
        '<button type="button" class="ac-btn ac-btn-ghost ac-stop-btn" style="display:none;" onclick="ZirakAchievementCenter.stopReading()">\u25A0 Stop Reading</button>' +
      '</div>' +
      '<div id="ac-tts-msg" style="display:none;font-size:12px;color:var(--text-muted);padding:0 0 8px;">Voice reading is not available on this device. You can still read the guide below.</div>' +
      ACHIEVEMENT_GUIDE_SECTIONS.map(function (s) {
        return '<div class="ac-card"><div class="ac-sec-lbl">' + s.icon + ' ' + esc(s.title) + '</div>' +
          '<div class="ac-text">' + s.lines.map(function (l) { return esc(l); }).join('<br>') + '</div></div>';
      }).join('') + '<div style="height:20px;"></div>';
    _renderShell(body, 'Achievement Center Guide');
  }

  /* ══════════════════════════════════════════════════════════════════════
     PUBLIC API — window.ZirakAchievementCenter, ONE module.
     ══════════════════════════════════════════════════════════════════════ */
  window.ZirakAchievementCenter = {
    open: open,
    close: close,
    renderHome: renderHome,
    renderCurrentReportCard: renderCurrentReportCard,
    renderCertificatePreview: renderCertificatePreview,
    renderTranscript: renderTranscript,
    renderHistory: renderHistory,
    renderGuide: renderGuide,
    readGuideAloud: readGuideAloud,
    readReportSummaryAloud: readReportSummaryAloud,
    stopReading: stopReading,
    printReportCard: printReportCard,
    printCertificate: printCertificate,
    exportReportJson: exportReportJson,
    exportReportText: exportReportText,
    exportCertificateJson: exportCertificateJson,
    copyReportSummary: copyReportSummary,
    copyCertificateDetails: copyCertificateDetails,
    shareReportWhatsApp: shareReportWhatsApp,
    shareCertificateWhatsApp: shareCertificateWhatsApp,
    issueCertificate: issueCertificate,
    findCertificateRecord: findCertificateRecord,
    findReportCardRecord: findReportCardRecord,
    getCurrentAchievementData: getCurrentAchievementData,
    getReportDisplayModel: getReportDisplayModel,
    _updateFinalizedConfirm: _updateFinalizedConfirm,
    finalizeReportCard: finalizeReportCard,
    // I6H-D10A: archive + snapshot + historical-action API
    loadAchievementArchive: loadAchievementArchive,
    migrateLegacyAchievementRecords: migrateLegacyAchievementRecords,
    upsertArchivedReport: upsertArchivedReport,
    upsertArchivedCertificate: upsertArchivedCertificate,
    findArchivedReport: findArchivedReport,
    findArchivedCertificate: findArchivedCertificate,
    getArchivedReports: getArchivedReports,
    getArchivedCertificates: getArchivedCertificates,
    // I6H-D14B: explicit-student Achievement Archive readers.
    getArchivedReportsFor: getArchivedReportsFor,
    getArchivedCertificatesFor: getArchivedCertificatesFor,
    getArchivedReportFor: getArchivedReportFor,
    getArchivedCertificateFor: getArchivedCertificateFor,
    getCertificateDisplayModel: getCertificateDisplayModel,
    normalizeReportSnapshot: normalizeReportSnapshot,
    normalizeCertificateSnapshot: normalizeCertificateSnapshot,
    buildReportText: buildReportText,
    buildCertificateText: buildCertificateText,
    openArchivedReport: openArchivedReport,
    openArchivedCertificate: openArchivedCertificate,
    printArchivedReport: printArchivedReport,
    printArchivedCertificate: printArchivedCertificate,
    buildTranscript: buildTranscript,
    buildFourWeekTrend: buildFourWeekTrend,
    buildTwoWeekComparison: buildTwoWeekComparison,
    evaluateCertificateEligibility: evaluateCertificateEligibility,
    buildCertificateId: buildCertificateId,
    resultCategory: resultCategory,
    certificateCategory: certificateCategory,
    ACHIEVEMENT_RULES: ACHIEVEMENT_RULES,
    _finalizeFromForm: _finalizeFromForm,
    _issueConfirm: _issueConfirm,
    _reissueConfirm: _reissueConfirm,
    _cancelConfirm: _cancelConfirm
  };
})();
