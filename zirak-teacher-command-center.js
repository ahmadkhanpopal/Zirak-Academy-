// ===================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// zirak-teacher-command-center.js — Phase I6H-D14
// Teacher Command Center + Multi-Student Academic Dashboard +
// Intervention Queue + Local Institute Analytics.
//
// This is ONE dashboard shell that reads existing academic authorities
// (ZirakProfile, ZirakPlacementEngine, ZirakLearningPlan,
// ZirakLearningLedger, ZirakAcademyTests). It never rebuilds academic
// records, never inflates counts, never invents scores. Task 7's
// "explicit student-scoped reads" is enforced structurally: every
// snapshot read uses the target studentId to construct the exact
// per-student storage key directly (u_<studentId>_<key>), never
// window.ZirakStorageKey() or the active-namespace shortcut.
// ===================================================================
(function () {
  'use strict';

  var TCC_VERSION = 'D14C-1';
  var TCC_SCHEMA_VERSION = 1;

  /* ── tiny local helpers (kept LOCAL to this module — do not compete
     with app.js's own esc/nowISO). ──────────────────────────────────── */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nowISO() { return new Date().toISOString(); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function daysBetween(aISO, bISO) { try { return Math.floor((new Date(bISO) - new Date(aISO)) / 86400000); } catch (e) { return null; } }

  /* ══════════════════════════════════════════════════════════════════
     TASK 13 (D14A) — date-only helpers using local calendar dates.
     HTML date inputs produce 'YYYY-MM-DD' (no time). D14 compared those
     against a full ISO timestamp using Math.floor(diff/86400000), which
     truncates any partial day and shifts across UTC midnight — so
     "today" could be classified as "overdue" late in the day, or
     "tomorrow" as "today" just after midnight, depending on timezone.
     The three helpers below work in the browser's LOCAL calendar day,
     which is what the teacher actually sees.
     ══════════════════════════════════════════════════════════════════ */
  function todayLocalDateKey() {
    var d = new Date();
    var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function normalizeLocalDateKey(value) {
    if (!value) return '';
    // Already YYYY-MM-DD? Pass through unchanged.
    var s = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // A full ISO or Date string: parse and re-emit in LOCAL date components.
    var d = new Date(s);
    if (isNaN(d.getTime())) return '';
    var y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function compareLocalDateKeys(a, b) {
    var na = normalizeLocalDateKey(a), nb = normalizeLocalDateKey(b);
    if (!na || !nb) return null; // invalid: caller must handle
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 15 (D14A) — durable corruption backup. Before returning the
     safe fallback, the FULL raw string is preserved under a
     student-specific backup key (Task 15). We never overwrite an
     existing backup with the same key (idempotent) and never expose
     full corrupt contents in normal UI (only a truncated sample).
     ══════════════════════════════════════════════════════════════════ */
  function corruptBackupKey(studentId, sourceKey, detectedAtISO) {
    // Task 15 schema: u_<studentId>_corrupt_backup_<sourceKey>_<timestamp>
    var ts = detectedAtISO || nowISO();
    var safeTs = ts.replace(/[:.]/g, '-');
    return 'u_' + studentId + '_corrupt_backup_' + sourceKey + '_' + safeTs;
  }
  function preserveCorruptBackup(studentId, sourceKey, rawValue) {
    if (!studentId || !sourceKey) return null;
    var detectedAt = nowISO();
    // Task 15: idempotence — if a backup for this exact source/timestamp
    // already exists (should never in practice, but be safe), do not
    // overwrite it. Increment a small counter until we find a free key.
    var key = corruptBackupKey(studentId, sourceKey, detectedAt);
    var i = 1;
    while (lsGet(key) !== null) { key = corruptBackupKey(studentId, sourceKey, detectedAt) + '_' + (i++); if (i > 20) break; }
    var payload = { sourceKey: sourceKey, studentId: studentId, detectedAt: detectedAt, appVersion: TCC_VERSION, rawValue: String(rawValue == null ? '' : rawValue) };
    lsSet(key, JSON.stringify(payload));
    return key;
  }
  function listCorruptBackupsFor(studentId) {
    var out = []; var prefix = 'u_' + studentId + '_corrupt_backup_';
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(prefix) === 0) out.push({ key: k });
      }
    } catch (e) {}
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 7 — explicit student-scoped storage. Every read below uses the
     target studentId to build the exact per-student key, NEVER
     window.ZirakStorageKey() or window.__zirakNS() (which resolve to
     "whichever student is currently active in the UI"). This is what
     lets the teacher inspect Student B while Student A remains active.
     ══════════════════════════════════════════════════════════════════ */
  function studentKey(studentId, key) { return 'u_' + studentId + '_' + key; }
  function legacyStudentKey(studentId, key) { return 'roshan_u_' + studentId + '_' + key; }
  function readStudentJSON(studentId, key, fallback) {
    var rawFromDisk = lsGet(studentKey(studentId, key));
    if (rawFromDisk === null || rawFromDisk === '') return (fallback === undefined ? null : fallback);
    try {
      return JSON.parse(rawFromDisk);
    } catch (e) {
      // Task 15: DURABLE backup — the full raw string is preserved
      // before returning the safe fallback, so it can be recovered
      // later. The __rawSample (first 200 chars) is kept for UI
      // display; the full value lives at the backup key.
      var backupKey = preserveCorruptBackup(studentId, key, rawFromDisk);
      return { __corrupt: true, __rawSample: String(rawFromDisk).slice(0, 200), __backupKey: backupKey };
    }
  }
  function readLegacyStudentJSON(studentId, key) {
    try { var raw = lsGet(legacyStudentKey(studentId, key)); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }

  /* ── centralized configuration (Task 12/21/26) ──────────────────── */
  var INACTIVITY_FOLLOWUP_DAYS = 7;
  var INACTIVITY_IMPORTANT_DAYS = 14;
  var MIN_SCORED_RESULTS_FOR_WEAK = 3; // Task 21: 3 valid scored records minimum
  var MIN_SCORED_RESULTS_FOR_TREND = 3;
  var SUPPORT_DOMAIN_THRESHOLD_PCT = 55; // below this, if evidence sufficient, is "Needs Support"
  var DEVELOPING_DOMAIN_THRESHOLD_PCT = 70;
  var STRONG_DOMAIN_THRESHOLD_PCT = 80;
  var TEACHER_SESSION_MS = 15 * 60 * 1000; // Task 5: 15 minutes of inactivity
  var CORE_DOMAINS = ['vocab', 'grammar', 'reading', 'listening', 'sentence', 'functional'];
  var DOMAIN_LABELS = { vocab: 'Vocabulary', grammar: 'Grammar', reading: 'Reading', listening: 'Listening', sentence: 'Sentence Construction', functional: 'Functional Communication', speaking: 'Speaking' };
  // Seven accepted School Path classes (Task 10). NEVER the 8-band diagnostic list.
  var SCHOOL_PATH_CLASSES = ['starter', 'basic', 'beginner', 'elementary', 'intermediate', 'advanced', 'academic'];
  // I6H-D15A (Task 11): user-facing display label for a School Path
  // class ID. SCHOOL_PATH_CLASSES itself now uses the REAL accepted
  // class id 'starter' — this helper's job is only to gracefully
  // display any legacy stored 'nursery' value a not-yet-migrated
  // record might still carry, never to relabel the canonical class list.
  function schoolPathClassLabel(classId) {
    try {
      if (window.ZirakAcademicProgram) {
        var norm = window.ZirakAcademicProgram.normalizeAcceptedLevelId(classId);
        var info = window.ZirakAcademicProgram.levelInfo(norm);
        if (info) return info.en;
      }
    } catch (e) {}
    return classId === 'nursery' ? 'Starter' : classId;
  }
  // Eight Placement diagnostic bands, kept separately for Task 10/26-B.
  var PLACEMENT_BANDS = ['nursery', 'starter', 'beginner1', 'beginner2', 'elementary', 'preintermediate', 'intermediate', 'advanced'];

  /* ══════════════════════════════════════════════════════════════════
     TASK 5 (D14) + TASK 11/12 (D14A) — Teacher authorization lifecycle.
     Reuses the existing Teacher PIN authority (ZirakProfile.requireTeacher),
     never creates a second PIN. The plain PIN is NEVER stored, logged,
     or exposed anywhere by this module.

     D14A change: the timestamp now reflects the last teacher ACTIVITY,
     not merely the initial PIN entry. touchTeacherActivity() is called
     from every valid teacher interaction (tab switch, student select,
     search input, filter/sort, export, note action, plan action). A
     passive dashboard render, an unrelated Ledger event, or a
     background timer does NOT renew authorization.
     ══════════════════════════════════════════════════════════════════ */
  var teacherAuthAt = 0;
  function isTeacherAuthorized() { return (Date.now() - teacherAuthAt) < TEACHER_SESSION_MS; }
  function touchTeacherAuth() { teacherAuthAt = Date.now(); }
  function touchTeacherActivity() { if (isTeacherAuthorized()) teacherAuthAt = Date.now(); }
  function invalidateTeacherAuth() { teacherAuthAt = 0; }
  function requireTeacher(onOk) {
    if (isTeacherAuthorized()) { touchTeacherActivity(); onOk(); return; }
    try {
      if (window.ZirakProfile && typeof window.ZirakProfile.requireTeacher === 'function') {
        window.ZirakProfile.requireTeacher(function () { touchTeacherAuth(); onOk(); });
        return;
      }
    } catch (e) {}
    // No PIN authority available — do NOT silently proceed with private data.
    console.warn('[TCC] Teacher PIN authority unavailable; refusing to open Command Center');
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 6 — data-authority map. Every reader below either uses the
     official API (when it accepts an explicit studentId) or reads the
     RAW student-scoped storage key directly (when the official API
     silently uses the active namespace). No academic record is
     independently recalculated.
     ══════════════════════════════════════════════════════════════════ */

  // Roster is truly global (system-scope), not per-student — safe to use ZirakProfile directly.
  function readRoster() {
    try { return (window.ZirakProfile && window.ZirakProfile.getRoster) ? window.ZirakProfile.getRoster() : []; } catch (e) { return []; }
  }
  function readStudentProfile(studentId) {
    var roster = readRoster();
    for (var i = 0; i < roster.length; i++) if (roster[i].studentId === studentId) return roster[i];
    return null;
  }
  function activeStudentId() {
    try { var s = window.ZirakProfile && window.ZirakProfile.currentStudent && window.ZirakProfile.currentStudent(); return s ? s.studentId : ''; } catch (e) { return ''; }
  }

  // Accepted level — read from the exact per-student legacy namespace.
  function readAcceptedLevel(studentId) { return readLegacyStudentJSON(studentId, 'placement_accepted'); }

  // Placement history — read from the exact per-student storage key.
  function readPlacementHistory(studentId) {
    var h = readStudentJSON(studentId, 'placement_history', null);
    if (!h || h.__corrupt) return h;
    return h.results || [];
  }
  function readActivePlacementSession(studentId) { return readStudentJSON(studentId, 'placement_active_session', null); }

  // Learning plan — official API when a studentId argument is honored.
  function readPlanFor(studentId) {
    try { return (window.ZirakLearningPlan && window.ZirakLearningPlan.getPlan) ? window.ZirakLearningPlan.getPlan(studentId) : null; } catch (e) { return null; }
  }
  function readPlanHistoryFor(studentId) {
    try { return (window.ZirakLearningPlan && window.ZirakLearningPlan.getPlanHistory) ? window.ZirakLearningPlan.getPlanHistory(studentId) : []; } catch (e) { return []; }
  }

  // Learning Ledger — the shipped Ledger's own load() uses the active
  // namespace, so we read the raw student-scoped key directly for
  // non-active students, and use the Ledger's own reader for the active
  // student (both paths land on the same storage — this is a read-only
  // Task 7 requirement, not a competing writer).
  function readLedgerRecordsFor(studentId) {
    var raw = readStudentJSON(studentId, 'learning_ledger', null);
    if (!raw || raw.__corrupt) return { records: [], corrupt: !!(raw && raw.__corrupt) };
    var days = raw.days || {};
    var records = [];
    Object.keys(days).forEach(function (dateKey) {
      (days[dateKey] || []).forEach(function (rec) { records.push(rec); });
    });
    // newest first
    records.sort(function (a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
    return { records: records, corrupt: false };
  }

  // Teacher-note store (new, Task 23) — student-scoped storage key.
  function readTeacherNotes(studentId) {
    var n = readStudentJSON(studentId, 'teacher_followups', null);
    if (!n || n.__corrupt) return { corrupt: !!(n && n.__corrupt), notes: [] };
    return { corrupt: false, notes: n.notes || [] };
  }
  function writeTeacherNotes(studentId, notes) {
    lsSet(studentKey(studentId, 'teacher_followups'), JSON.stringify({ schemaVersion: 1, notes: notes }));
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 8 — one derived academic snapshot. Read-only, no side effects.
     Never mutates any academic record, never writes any storage key.
     Task 34: results are cached only for the duration of a dashboard
     session and invalidated by refresh coordinator events.
     ══════════════════════════════════════════════════════════════════ */
  var snapshotCache = {}; // { [studentId]: snapshot }

  // Only real learning evidence contributes to "recent activity" and
  // "study day" (Task 18). Administrative/certificate/report/placement
  // records are explicitly excluded — this mirrors the exact exclusion
  // list D13A/D13B established in zirak-academy-tests.js.
  var ADMINISTRATIVE_SOURCES = ['personal-learning-plan', 'academy-certificate', 'academy-report-card', 'academy-placement-test'];
  function isGenuineLearningRecord(rec) {
    if (!rec) return false;
    if (ADMINISTRATIVE_SOURCES.indexOf(rec.source) > -1) return false;
    return true;
  }
  function isScoredRecord(rec) {
    return isGenuineLearningRecord(rec) && rec.total > 0 && typeof rec.pct === 'number';
  }

  function readStudentAcademicSnapshotInternal(studentId) {
    if (!studentId) return null;
    if (snapshotCache[studentId]) return snapshotCache[studentId];

    var dataWarnings = [];
    var profile = readStudentProfile(studentId) || {};

    // Level
    var accepted = readAcceptedLevel(studentId);
    var levelSource = accepted ? (accepted.source === 'teacher' ? 'teacher' : accepted.source === 'manual' ? 'manual' : 'placement') : (profile.level && profile.level !== '\u2014' ? 'existing' : 'default');
    var currentLevel = accepted ? accepted.level : (profile.level && profile.level !== '\u2014' ? profile.level : '');
    // I6H-D15A (Task 11): normalize any legacy stored value (e.g. a
    // not-yet-migrated student's 'nursery') to its real accepted class
    // at the source, so every downstream consumer of this snapshot
    // (filters, exports, reports, panels) sees the true accepted-class
    // id — never a duplicate legacy category.
    try { if (currentLevel && window.ZirakAcademicProgram) currentLevel = window.ZirakAcademicProgram.normalizeAcceptedLevelId(currentLevel) || currentLevel; } catch (e) {}

    // Placement
    var placementHistory = readPlacementHistory(studentId);
    if (placementHistory && placementHistory.__corrupt) { dataWarnings.push({ area: 'placement_history', sample: placementHistory.__rawSample }); placementHistory = []; }
    var activePlacementSession = readActivePlacementSession(studentId);
    if (activePlacementSession && activePlacementSession.__corrupt) { dataWarnings.push({ area: 'placement_active_session' }); activePlacementSession = null; }
    var latestPlacement = (placementHistory && placementHistory.length) ? placementHistory[0] : null;
    var placementStatus = 'not-started';
    if (activePlacementSession && !activePlacementSession.completed) placementStatus = 'in-progress';
    else if (latestPlacement) {
      var dec = (latestPlacement.decision && latestPlacement.decision.decisionStatus) || 'pending';
      if (dec === 'pending') placementStatus = accepted ? 'pending-retake' : 'completed-not-accepted';
      else placementStatus = 'accepted';
    }
    var pendingRetake = latestPlacement && latestPlacement.decision && latestPlacement.decision.decisionStatus === 'pending' && !!accepted;
    var teacherReviewRequired = false;
    var confidence = latestPlacement ? (latestPlacement.diagnostic && latestPlacement.diagnostic.confidence) : '';
    if (latestPlacement && confidence && String(confidence).toLowerCase().indexOf('low') > -1) teacherReviewRequired = true;

    // Personalized plan
    var plan = null;
    try { plan = readPlanFor(studentId); } catch (e) { dataWarnings.push({ area: 'learning_plan' }); }
    var planStatus = 'none';
    var planId = '', currentDay = 0, totalDays = 0, progressPercentage = 0, completedItems = 0, plannedItems = 0, paused = false;
    if (plan) {
      planStatus = plan.status || 'active';
      paused = planStatus === 'paused';
      planId = plan.planId || '';
      currentDay = plan.currentDay || 1;
      totalDays = (plan.dailyPlans || []).length;
      completedItems = Object.keys(plan.completedPlanItems || {}).filter(function (id) {
        var rec = plan.completedPlanItems[id];
        return rec && (rec.status === 'completed' || rec.status === 'skipped' || rec.status === 'replaced');
      }).length;
      plannedItems = (plan.dailyPlans || []).reduce(function (n, dp) { return n + ((dp && dp.activities) ? dp.activities.length : 0); }, 0);
      progressPercentage = plannedItems ? Math.round((completedItems / plannedItems) * 100) : 0;
    }

    // Learning activity
    var ledgerRead = readLedgerRecordsFor(studentId);
    if (ledgerRead.corrupt) dataWarnings.push({ area: 'learning_ledger' });
    var records = ledgerRead.records || [];
    var genuineRecords = records.filter(isGenuineLearningRecord);
    var scoredRecords = records.filter(isScoredRecord);
    var lastRealActivityAt = genuineRecords.length ? new Date(genuineRecords[0].timestamp || 0).toISOString() : '';
    var lastPlanEvidenceAt = plan && plan.activityResults ? (function () {
      var latest = 0; Object.keys(plan.activityResults).forEach(function (id) { var e = plan.activityResults[id]; var t = e.completedAt ? +new Date(e.completedAt) : 0; if (t > latest) latest = t; });
      return latest ? new Date(latest).toISOString() : '';
    })() : '';
    var recentStudyDays = (function () {
      var byDay = {};
      genuineRecords.forEach(function (r) { if (r.dateKey) byDay[r.dateKey] = true; });
      return Object.keys(byDay).length;
    })();
    var recentScoredActivities = scoredRecords.length;

    // Skill profile (Task 20/21) — computed strictly from scored, genuine records.
    var skills = computeSkillProfile(scoredRecords, plan);

    // Achievements — read the roster's own achievements list without mutating it.
    var archivedReports = [], archivedCertificates = [];
    try {
      if (window.ZirakAchievementCenter && typeof window.ZirakAchievementCenter.getArchivedReportsFor === 'function') archivedReports = window.ZirakAchievementCenter.getArchivedReportsFor(studentId) || [];
      if (window.ZirakAchievementCenter && typeof window.ZirakAchievementCenter.getArchivedCertificatesFor === 'function') archivedCertificates = window.ZirakAchievementCenter.getArchivedCertificatesFor(studentId) || [];
    } catch (e) {}
    var achievements = {
      issuedCount: archivedReports.length + archivedCertificates.length,
      latestAchievement: (archivedCertificates[0] || archivedReports[0] || null),
      latestCertificate: archivedCertificates[0] || null,
      finalizedReportCount: archivedReports.length,
      archivedReports: archivedReports,
      archivedCertificates: archivedCertificates
    };

    // Teacher notes
    var teacherNotes = readTeacherNotes(studentId);
    if (teacherNotes.corrupt) dataWarnings.push({ area: 'teacher_followups' });

    // Task 3 (D14A): real assessment readiness via readStudentAssessmentState
    // instead of D14's presence-only 'completed-recent'/'not-recent' pair.
    var assessmentState = readStudentAssessmentStateInternal(studentId);
    var assessments = {
      daily: assessmentState.daily,
      weekly: assessmentState.weekly,
      twoWeek: assessmentState.twoWeek,
      monthly: assessmentState.monthly,
      readyCount: assessmentState.readyCount,
      latestCompletedAssessmentAt: assessmentState.latestCompletedAssessmentAt,
      // Back-compat aliases (kept for the D14 audit/matrix's UI paths):
      dailyReviewStatus: assessmentState.daily.status,
      weeklyStatus: assessmentState.weekly.status,
      twoWeekStatus: assessmentState.twoWeek.status,
      monthlyStatus: assessmentState.monthly.status
    };

    var snapshot = {
      schemaVersion: TCC_SCHEMA_VERSION,
      studentId: studentId,
      studentName: profile.fullName || '',
      profileCreatedAt: profile.createdAt || '',
      currentLevel: currentLevel,
      levelSource: levelSource,
      levelAcceptedAt: accepted ? accepted.at : '',
      placement: {
        status: placementStatus,
        latestResultId: latestPlacement ? latestPlacement.resultId : '',
        recommendedLevel: latestPlacement ? latestPlacement.diagnostic.recommendedLevel : '',
        confidence: confidence || '',
        accepted: !!accepted,
        pendingRetake: pendingRetake,
        teacherReviewRequired: teacherReviewRequired,
        historyCount: (placementHistory || []).length
      },
      learningPlan: {
        status: planStatus,
        planId: planId,
        currentDay: currentDay,
        totalDays: totalDays,
        progressPercentage: progressPercentage,
        completedItems: completedItems,
        plannedItems: plannedItems,
        paused: paused,
        lastEvidenceAt: lastPlanEvidenceAt,
        historyCount: readPlanHistoryFor(studentId).length
      },
      activity: {
        lastRealActivityAt: lastRealActivityAt,
        recentStudyDays: recentStudyDays,
        recentScoredActivities: recentScoredActivities,
        recentRecords: genuineRecords.slice(0, 20)
      },
      assessments: assessments,
      skills: skills,
      achievements: achievements,
      teacherNotes: teacherNotes.notes,
      attention: [],
      dataWarnings: dataWarnings,
      generatedAt: nowISO()
    };
    snapshot.attention = computeAttentionItems(snapshot);
    snapshotCache[studentId] = snapshot;
    return snapshot;
  }

  function recordsHaveSource(records, source) { return records.some(function (r) { return r.source === source; }); }
  // Task 10 (D14A): public authorized wrapper. Callers from the browser
  // console get an empty result unless the teacher has authenticated
  // and the session has not expired. Legitimate teacher interactions
  // renew the session via touchTeacherActivity().
  function readStudentAcademicSnapshot(studentId) {
    if (!isTeacherAuthorized()) return null;
    touchTeacherActivity();
    return readStudentAcademicSnapshotInternal(studentId);
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 20/21 — cautious skill profile. Requires 3+ valid scored
     records for a support-domain label, 3+ across at least two dates
     for a trend. Manual completion, technical failure, 0/0 metadata,
     administrative records, and duplicate evidence are all excluded.
     Placement evidence is labeled separately as "Placement Diagnostic".
     ══════════════════════════════════════════════════════════════════ */
  function computeSkillProfile(scoredRecords, plan) {
    var byDomain = {};
    CORE_DOMAINS.forEach(function (d) { byDomain[d] = []; });
    // From plan's activityResults (structured domain field is available)
    if (plan && plan.activityResults) {
      Object.keys(plan.activityResults).forEach(function (id) {
        var e = plan.activityResults[id];
        if (!e || e.technicalFailure) return;
        if (!e.scored && e.scored !== undefined && !e.scored) return; // strict: only real scored evidence
        if (typeof e.percentage !== 'number') return;
        if (e.domain && byDomain[e.domain]) byDomain[e.domain].push({ pct: e.percentage, at: e.completedAt, source: e.source, evidenceId: e.evidenceId });
      });
    }
    // From Ledger records — map source→domain conservatively.
    scoredRecords.forEach(function (r) {
      var dom = ledgerRecordDomain(r);
      if (!dom || !byDomain[dom]) return;
      var eid = r.id || (r.source + '-' + (r.timestamp || ''));
      if (byDomain[dom].some(function (e) { return e.evidenceId === eid; })) return; // dedupe
      byDomain[dom].push({ pct: r.pct, at: (r.timestamp ? new Date(r.timestamp).toISOString() : ''), source: r.source, evidenceId: eid });
    });

    var strongestDomains = [], supportDomains = [];
    var byDomainSummary = {};
    CORE_DOMAINS.forEach(function (d) {
      var evid = byDomain[d];
      var summary = { domain: d, label: DOMAIN_LABELS[d], evidenceCount: evid.length, latestPct: null, avgPct: null, trend: '', confidence: 'Limited Evidence', category: 'Limited Evidence' };
      if (evid.length) {
        evid.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
        summary.latestPct = evid[0].pct;
        summary.avgPct = Math.round(evid.reduce(function (s, e) { return s + e.pct; }, 0) / evid.length);
      }
      if (evid.length >= MIN_SCORED_RESULTS_FOR_WEAK) {
        summary.confidence = 'Adequate';
        if (summary.avgPct >= STRONG_DOMAIN_THRESHOLD_PCT) { summary.category = 'Strong Evidence'; strongestDomains.push(d); }
        else if (summary.avgPct >= DEVELOPING_DOMAIN_THRESHOLD_PCT) { summary.category = 'Developing'; }
        else if (summary.avgPct < SUPPORT_DOMAIN_THRESHOLD_PCT) { summary.category = 'Needs Support'; supportDomains.push(d); }
        else { summary.category = 'Developing'; }
        // Trend: 3+ across at least two distinct dates.
        var dates = {}; evid.forEach(function (e) { if (e.at) dates[String(e.at).slice(0, 10)] = true; });
        if (Object.keys(dates).length >= 2 && evid.length >= MIN_SCORED_RESULTS_FOR_TREND) {
          var half = Math.max(1, Math.floor(evid.length / 2));
          var recent = evid.slice(0, half).reduce(function (s, e) { return s + e.pct; }, 0) / half;
          var older = evid.slice(-half).reduce(function (s, e) { return s + e.pct; }, 0) / half;
          if (recent - older >= 5) summary.trend = 'improving';
          else if (older - recent >= 5) summary.trend = 'declining';
          else summary.trend = 'steady';
        }
      }
      byDomainSummary[d] = summary;
    });
    return { byDomain: byDomainSummary, strongestDomains: strongestDomains, supportDomains: supportDomains, evidenceCount: Object.keys(byDomain).reduce(function (s, d) { return s + byDomain[d].length; }, 0) };
  }

  // Map a Ledger record's source to a domain, conservatively. Where
  // ambiguous, return null (don't guess).
  function ledgerRecordDomain(r) {
    if (!r) return null;
    switch (r.source) {
      case 'grammar-world': case 'grammar-lab-topic-test': case 'unit-quiz': return 'grammar';
      case 'quiz': case 'wordlab': return 'vocab';
      case 'dialogue': case 'interview': return 'functional';
      default: return null;
    }
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 11/12 — deterministic attention-rule engine. Every rule is
     evidence-based. Task 13: no unexplained "risk score", only a simple
     deterministic severity ranking Urgent=4, Important=3, Follow Up=2,
     Information=1.
     ══════════════════════════════════════════════════════════════════ */
  var SEVERITY_RANK = { 'Urgent': 4, 'Important': 3, 'Follow Up': 2, 'Information': 1 };
  function severityWeight(s) { return SEVERITY_RANK[s] || 0; }

  function getStudentAttentionItems(snapshot) {
    var items = [];
    var s = snapshot;
    var idPrefix = 'att-' + s.studentId + '-';

    // A. No accepted starting level
    if (!s.currentLevel) items.push({ id: idPrefix + 'no-level', type: 'no-accepted-level', severity: 'Important', title: 'No accepted starting level', explanation: 'This student has not accepted a Placement recommendation, has no teacher-confirmed level, and no manual level.', evidence: { hasAccepted: false }, recommendedAction: 'Open Placement and set the level.', createdFrom: 'level-authority', targetAction: 'openPlacement' });

    // B. Placement Test in progress
    if (s.placement.status === 'in-progress') items.push({ id: idPrefix + 'placement-in-progress', type: 'placement-in-progress', severity: 'Follow Up', title: 'Placement Test in progress', explanation: 'An adaptive Placement session is currently in progress and can be resumed exactly where the student stopped.', evidence: { status: s.placement.status }, recommendedAction: 'Continue Placement Test.', createdFrom: 'placement-active-session', targetAction: 'openPlacement' });

    // C. Placement completed but not accepted
    if (s.placement.status === 'completed-not-accepted') items.push({ id: idPrefix + 'placement-not-accepted', type: 'placement-not-accepted', severity: 'Important', title: 'Placement completed but not accepted', explanation: 'A Placement recommendation exists but has not been accepted, manually chosen, or teacher-confirmed.', evidence: { latestResultId: s.placement.latestResultId }, recommendedAction: 'Review recommendation.', createdFrom: 'placement-history', targetAction: 'openPlacementReport' });

    // D. Low-confidence Placement
    if (s.placement.teacherReviewRequired) items.push({ id: idPrefix + 'placement-low-confidence', type: 'placement-low-confidence', severity: 'Follow Up', title: 'Low-confidence Placement', explanation: 'The latest Placement recommendation reports low confidence; a teacher review is recommended.', evidence: { confidence: s.placement.confidence }, recommendedAction: 'Teacher Review.', createdFrom: 'placement-diagnostic', targetAction: 'openPlacementReport' });

    // E. Pending Placement retake
    if (s.placement.pendingRetake) items.push({ id: idPrefix + 'placement-pending-retake', type: 'placement-pending-retake', severity: 'Follow Up', title: 'Pending Placement retake recommendation', explanation: 'A new Placement result is waiting. The current accepted class remains unchanged until accepted or confirmed.', evidence: { latestResultId: s.placement.latestResultId, currentAcceptedLevel: s.currentLevel }, recommendedAction: 'Compare current and new recommendation.', createdFrom: 'placement-history', targetAction: 'openPlacementHistory' });

    // F. No Personalized Learning Plan (only relevant once a level is accepted)
    if (s.currentLevel && s.learningPlan.status === 'none') items.push({ id: idPrefix + 'no-plan', type: 'no-plan', severity: 'Follow Up', title: 'No Personalized Learning Plan', explanation: 'This student has an accepted level but no active learning plan yet.', evidence: { level: s.currentLevel }, recommendedAction: 'Generate plan.', createdFrom: 'plan-authority', targetAction: 'openPlan' });

    // G. Plan paused
    if (s.learningPlan.paused) items.push({ id: idPrefix + 'plan-paused', type: 'plan-paused', severity: 'Follow Up', title: 'Personalized Plan paused', explanation: 'The plan is paused. Learning activities cannot launch until resumed.', evidence: { planId: s.learningPlan.planId }, recommendedAction: 'Review or Resume Plan.', createdFrom: 'plan-authority', targetAction: 'openPlan' });

    // H. Plan has not progressed — only if the plan exists AND we have real evidence AGE (Task 12: no absence-claims without date evidence).
    if (s.learningPlan.status !== 'none' && !s.learningPlan.paused && s.learningPlan.lastEvidenceAt) {
      var d = daysBetween(s.learningPlan.lastEvidenceAt, nowISO());
      if (d !== null && d >= INACTIVITY_IMPORTANT_DAYS) items.push({ id: idPrefix + 'plan-inactive', type: 'plan-inactive', severity: 'Important', title: 'Personalized Plan has not progressed', explanation: 'The last real plan-activity evidence is ' + d + ' days old.', evidence: { daysSinceLastEvidence: d }, recommendedAction: 'Check in with the student.', createdFrom: 'plan-evidence', targetAction: 'openPlan' });
    }

    // I. Learning inactivity — only from GENUINE (non-administrative) records.
    if (s.activity.lastRealActivityAt) {
      var da = daysBetween(s.activity.lastRealActivityAt, nowISO());
      if (da !== null && da >= INACTIVITY_IMPORTANT_DAYS) items.push({ id: idPrefix + 'inactive-14', type: 'learning-inactive', severity: 'Important', title: 'No real learning activity in ' + da + ' days', explanation: 'The Learning Ledger contains no genuine (non-administrative) learning record for ' + da + ' days.', evidence: { daysSinceLastRealActivity: da }, recommendedAction: 'Check in with the student.', createdFrom: 'ledger', targetAction: 'openLearningRecord' });
      else if (da !== null && da >= INACTIVITY_FOLLOWUP_DAYS) items.push({ id: idPrefix + 'inactive-7', type: 'learning-inactive-soft', severity: 'Follow Up', title: da + ' days since last real activity', explanation: 'A gentle follow-up may be appropriate.', evidence: { daysSinceLastRealActivity: da }, recommendedAction: 'Consider a check-in.', createdFrom: 'ledger', targetAction: 'openLearningRecord' });
    }

    // J. Weak-skill evidence — STRICT: only when >=3 valid scored records exist AND avg < support threshold.
    Object.keys(s.skills.byDomain).forEach(function (d) {
      var dom = s.skills.byDomain[d];
      if (dom.category === 'Needs Support' && dom.evidenceCount >= MIN_SCORED_RESULTS_FOR_WEAK) items.push({ id: idPrefix + 'weak-' + d, type: 'weak-skill', severity: 'Follow Up', title: dom.label + ' needs support', explanation: dom.label + ' shows an average of ' + dom.avgPct + '% across ' + dom.evidenceCount + ' recent scored activities.', evidence: { domain: d, evidenceCount: dom.evidenceCount, avgPct: dom.avgPct }, recommendedAction: 'Focus a session on ' + dom.label + '.', createdFrom: 'skill-evidence', targetAction: 'openSkills' });
    });

    // M. Teacher follow-up due
    (s.teacherNotes || []).forEach(function (note) {
      if (!note || note.status === 'Resolved') return;
      if (!note.followUpAt) return;
      // Task 13/14 (D14A): date-only comparison using local calendar dates.
      var todayKey = todayLocalDateKey();
      var followKey = normalizeLocalDateKey(note.followUpAt);
      if (!followKey) return; // invalid — caller handles via data warnings
      var cmp = compareLocalDateKeys(followKey, todayKey);
      if (cmp === null) return;
      if (cmp < 0) items.push({ id: idPrefix + 'followup-overdue-' + note.noteId, type: 'followup-overdue', severity: 'Important', title: 'Teacher follow-up overdue', explanation: 'A teacher follow-up scheduled for ' + followKey + ' is overdue.', evidence: { noteId: note.noteId, category: note.category }, recommendedAction: 'Open the note and resolve or reschedule.', createdFrom: 'teacher-notes', targetAction: 'openNotes' });
      else if (cmp === 0) items.push({ id: idPrefix + 'followup-today-' + note.noteId, type: 'followup-today', severity: 'Follow Up', title: 'Teacher follow-up due today', explanation: 'A teacher follow-up is due today.', evidence: { noteId: note.noteId, category: note.category }, recommendedAction: 'Open the note.', createdFrom: 'teacher-notes', targetAction: 'openNotes' });
    });

    // N. Corrupt or incomplete student data
    if (s.dataWarnings && s.dataWarnings.length) items.push({ id: idPrefix + 'data-warning', type: 'data-warning', severity: 'Follow Up', title: 'Student data warning', explanation: 'Some stored records for this student could not be read cleanly (' + s.dataWarnings.map(function (w) { return w.area; }).join(', ') + '). No academic judgment is being made from these records.', evidence: { areas: s.dataWarnings.map(function (w) { return w.area; }) }, recommendedAction: 'Open Privacy / Danger Zone if a recovery step is needed.', createdFrom: 'data-quality', targetAction: 'openPrivacy' });

    // Ranking (Task 13): Urgent -> Important -> Follow Up -> Information
    items.sort(function (a, b) { return severityWeight(b.severity) - severityWeight(a.severity); });
    // De-dupe on id defensively.
    var seen = {}; return items.filter(function (it) { if (seen[it.id]) return false; seen[it.id] = true; return true; });
  }
  function computeAttentionItems(snapshot) { return getStudentAttentionItems(snapshot); }

  /* ══════════════════════════════════════════════════════════════════
     TASK 25/26 — institute overview + analytics. Every count is
     computed live from real snapshots; no duplicate totals stored.
     Uses the 7 accepted School Path classes (never 8 diagnostic bands)
     for the class-distribution chart.
     ══════════════════════════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════════════════════════
     TASK 4/5 (D14B) — real Calendar-authoritative assessment readiness.
     D14A calculated readiness with a DUPLICATE rolling-last-N-day
     implementation inside this file. D14B removes that duplicate
     entirely and delegates to the ONE real academic authority:
     ZirakAcademyTests.getStudentAssessmentState(studentId), which uses
     the real Academy Calendar windows (getAcademyWeekRange /
     getAcademyTwoWeekRange / getAcademyMonthlyRange — Saturday through
     Wednesday study weeks, Thu/Fri excluded) and the real readiness
     rules (isWeeklyTestReady / isTwoWeekReviewReady / isMonthlyExamReady
     / the 3-testable-item Daily rule), all defined once in
     zirak-academy-tests.js. This module does not recompute any of
     those rules — see readStudentAssessmentStateInternal() below.
     ══════════════════════════════════════════════════════════════════ */
  function readStudentAssessmentStateInternal(studentId) {
    if (!studentId) return null;
    try {
      if (window.ZirakAcademyTests && typeof window.ZirakAcademyTests.getStudentAssessmentState === 'function') {
        var real = window.ZirakAcademyTests.getStudentAssessmentState(studentId);
        if (real) return real;
      }
    } catch (e) {}
    // Authority unavailable — return an honest "Data Limited" shell
    // rather than fabricating readiness. This should not happen in the
    // shipped app (the module is always loaded before the TCC), but a
    // defensive fallback avoids a hard crash if load order ever changes.
    var unavailable = { status: 'Data Limited', ready: false, completed: false, retakeAvailable: false, reason: 'Assessment authority unavailable.', recordId: '' };
    return { studentId: studentId, daily: Object.assign({ testableItemCount: 0, minimumRequired: 3 }, unavailable), weekly: Object.assign({ range: null, finalizedReportId: '' }, unavailable), twoWeek: Object.assign({ range: null, finalizedReportId: '' }, unavailable), monthly: Object.assign({ range: null, finalizedReportId: '' }, unavailable), readyCount: 0, latestCompletedAssessmentAt: '' };
  }
  // Task 8 (D14B): public authorized wrapper. The Academy Tests
  // explicit-student API itself is a low-level academic authority (not
  // guarded — other academic modules may need it), but the Teacher
  // Command Center must not expose it as an easy unguarded
  // private-data method. This wrapper is the ONLY path the dashboard
  // UI or an external caller should use.
  function readStudentAssessmentState(studentId) {
    if (!isTeacherAuthorized()) return null;
    touchTeacherActivity();
    return readStudentAssessmentStateInternal(studentId);
  }


  function readInstituteOverview() {
    if (!isTeacherAuthorized()) return null;
    touchTeacherActivity();
    return readInstituteOverviewInternal();
  }
  function readInstituteOverviewInternal() {
    var roster = readRoster();
    var snapshots = roster.map(function (s) { try { return readStudentAcademicSnapshotInternal(s.studentId); } catch (e) { return null; } }).filter(Boolean);

    // Class distribution (7 School Path classes + Unknown/none)
    var classDist = { none: 0 };
    SCHOOL_PATH_CLASSES.forEach(function (c) { classDist[c] = 0; });
    snapshots.forEach(function (snap) {
      var c = snap.currentLevel;
      // I6H-D15A (Task 11): normalize any legacy value (e.g. a
      // not-yet-migrated student's stored 'nursery') to its real
      // accepted class BEFORE bucketing — never a duplicate category.
      try { if (c && window.ZirakAcademicProgram) c = window.ZirakAcademicProgram.normalizeAcceptedLevelId(c) || c; } catch (e) {}
      if (!c) classDist.none++;
      else if (classDist[c] !== undefined) classDist[c]++;
      else classDist[c] = 1;
    });

    // Placement distribution
    var placementDist = { 'not-started': 0, 'in-progress': 0, 'completed-not-accepted': 0, 'accepted': 0, 'pending-retake': 0 };
    snapshots.forEach(function (snap) { placementDist[snap.placement.status] = (placementDist[snap.placement.status] || 0) + 1; });

    // Plan distribution
    var planDist = { 'none': 0, 'active': 0, 'paused': 0, 'provisional': 0, 'teacherAdjusted': 0 };
    snapshots.forEach(function (snap) { planDist[snap.learningPlan.status] = (planDist[snap.learningPlan.status] || 0) + 1; });

    var recent7 = 0, recent14 = 0, recent30 = 0;
    var now = nowISO();
    snapshots.forEach(function (snap) {
      if (!snap.activity.lastRealActivityAt) return;
      var d = daysBetween(snap.activity.lastRealActivityAt, now);
      if (d === null) return;
      if (d <= 7) recent7++;
      if (d <= 14) recent14++;
      if (d <= 30) recent30++;
    });

    var supportDist = {}; CORE_DOMAINS.forEach(function (d) { supportDist[d] = 0; });
    snapshots.forEach(function (snap) { (snap.skills.supportDomains || []).forEach(function (d) { supportDist[d] = (supportDist[d] || 0) + 1; }); });

    var followups = { open: 0, dueToday: 0, overdue: 0, resolved: 0 };
    var overviewTodayKey = todayLocalDateKey();
    snapshots.forEach(function (snap) {
      (snap.teacherNotes || []).forEach(function (n) {
        if (n.status === 'Resolved') { followups.resolved++; return; }
        followups.open++;
        if (n.followUpAt) {
          var fkey = normalizeLocalDateKey(n.followUpAt);
          if (!fkey) return;
          var cmp = compareLocalDateKeys(fkey, overviewTodayKey);
          if (cmp === null) return;
          if (cmp < 0) followups.overdue++;
          else if (cmp === 0) followups.dueToday++;
        }
      });
    });

    var needAttention = snapshots.filter(function (snap) { return snap.attention.length > 0; }).length;
    var achievements = 0;
    snapshots.forEach(function (snap) { achievements += snap.achievements.issuedCount; });

    return {
      totalStudents: roster.length,
      snapshots: snapshots.length,
      studentsWithAcceptedLevel: snapshots.filter(function (snap) { return !!snap.currentLevel; }).length,
      studentsAwaitingPlacementDecision: snapshots.filter(function (snap) { return snap.placement.status === 'completed-not-accepted' || snap.placement.pendingRetake; }).length,
      activePlans: planDist.active + (planDist.teacherAdjusted || 0),
      pausedPlans: planDist.paused,
      noPlan: planDist.none,
      recentActivity7d: recent7, recentActivity14d: recent14, recentActivity30d: recent30,
      needAttention: needAttention,
      openFollowUps: followups.open,
      overdueFollowUps: followups.overdue,
      dueTodayFollowUps: followups.dueToday,
      resolvedFollowUps: followups.resolved,
      issuedAchievements: achievements,
      // Task 24 (D14A): institute-level total of Ready assessments across all students,
      // plus a breakdown by assessment type. Real, not hard-coded.
      assessmentsReady: snapshots.reduce(function (n, snap) { return n + (snap.assessments && snap.assessments.readyCount || 0); }, 0),
      assessmentsReadyByType: {
        daily: snapshots.filter(function (snap) { return snap.assessments && snap.assessments.daily && snap.assessments.daily.ready; }).length,
        weekly: snapshots.filter(function (snap) { return snap.assessments && snap.assessments.weekly && snap.assessments.weekly.ready; }).length,
        twoWeek: snapshots.filter(function (snap) { return snap.assessments && snap.assessments.twoWeek && snap.assessments.twoWeek.ready; }).length,
        monthly: snapshots.filter(function (snap) { return snap.assessments && snap.assessments.monthly && snap.assessments.monthly.ready; }).length
      },
      classDistribution: classDist,
      placementDistribution: placementDist,
      planDistribution: planDist,
      supportDomainDistribution: supportDist,
      generatedAt: now
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 23 — teacher notes. PIN-guarded, per-student, HTML-escaped.
     Not a Learning Ledger record.
     ══════════════════════════════════════════════════════════════════ */
  var NOTE_CATEGORIES = ['General', 'Placement', 'Learning Plan', 'Skill Support', 'Assessment', 'Parent Discussion', 'Technical', 'Other'];
  var NOTE_STATUSES = ['Open', 'Follow Up', 'Resolved'];

  function addTeacherNote(studentId, opts) {
    if (!studentId || !opts) return null;
    if (!isTeacherAuthorized()) return null;
    touchTeacherActivity();
    var store = readTeacherNotes(studentId);
    // Task 17 (D14A): if the underlying note store is corrupt, we must
    // NOT silently overwrite it. The durable raw backup has already
    // been preserved by readStudentJSON (Task 15). Require explicit
    // Teacher confirmation before starting a clean note store.
    if (store.corrupt) {
      var proceed = false;
      try { proceed = confirm('This student\'s teacher-note store could not be read cleanly. A durable backup of the original data has been preserved. Start a fresh note store now?'); } catch (e) { proceed = false; }
      if (!proceed) return null;
      // Explicit confirmation received → start with an empty notes array.
      store = { corrupt: false, notes: [] };
    }
    var noteId = 'note-' + studentId + '-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
    var note = {
      noteId: noteId, studentId: studentId,
      category: NOTE_CATEGORIES.indexOf(opts.category) > -1 ? opts.category : 'General',
      text: String(opts.text || '').slice(0, 4000),
      createdAt: nowISO(), updatedAt: nowISO(),
      followUpAt: opts.followUpAt || '',
      status: NOTE_STATUSES.indexOf(opts.status) > -1 ? opts.status : 'Open',
      resolvedAt: ''
    };
    store.notes.push(note);
    writeTeacherNotes(studentId, store.notes);
    invalidateSnapshot(studentId);
    emitRefreshEvent('teacher-note', studentId);
    return note;
  }
  function updateTeacherNote(studentId, noteId, opts) {
    if (!isTeacherAuthorized()) return false;
    touchTeacherActivity();
    var store = readTeacherNotes(studentId);
    if (store.corrupt) return false; // Task 17: never write over a corrupt store silently
    var idx = store.notes.findIndex(function (n) { return n.noteId === noteId; });
    if (idx === -1) return false;
    var n = store.notes[idx];
    if (opts.text !== undefined) n.text = String(opts.text).slice(0, 4000);
    if (opts.category && NOTE_CATEGORIES.indexOf(opts.category) > -1) n.category = opts.category;
    if (opts.followUpAt !== undefined) n.followUpAt = opts.followUpAt;
    if (opts.status && NOTE_STATUSES.indexOf(opts.status) > -1) {
      n.status = opts.status;
      n.resolvedAt = opts.status === 'Resolved' ? nowISO() : '';
    }
    n.updatedAt = nowISO();
    store.notes[idx] = n;
    writeTeacherNotes(studentId, store.notes);
    invalidateSnapshot(studentId);
    emitRefreshEvent('teacher-note', studentId);
    return true;
  }
  function deleteTeacherNote(studentId, noteId) {
    if (!isTeacherAuthorized()) return false;
    touchTeacherActivity();
    var store = readTeacherNotes(studentId);
    if (store.corrupt) return false; // Task 17
    var next = store.notes.filter(function (n) { return n.noteId !== noteId; });
    if (next.length === store.notes.length) return false;
    writeTeacherNotes(studentId, next);
    invalidateSnapshot(studentId);
    emitRefreshEvent('teacher-note', studentId);
    return true;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 24 — follow-up queue across all students.
     ══════════════════════════════════════════════════════════════════ */
  function getFollowUpQueue() {
    if (!isTeacherAuthorized()) return null;
    touchTeacherActivity();
    return getFollowUpQueueInternal();
  }
  function getFollowUpQueueInternal() {
    var roster = readRoster();
    var todayKey = todayLocalDateKey();
    var queue = { overdue: [], dueToday: [], upcoming: [], noDate: [], resolved: [] };
    roster.forEach(function (s) {
      var store = readTeacherNotes(s.studentId);
      (store.notes || []).forEach(function (n) {
        var wrapped = { studentId: s.studentId, studentName: s.fullName, note: n };
        if (n.status === 'Resolved') { queue.resolved.push(wrapped); return; }
        if (!n.followUpAt) { queue.noDate.push(wrapped); return; }
        // Task 13/14 (D14A): date-only comparison, no UTC-midnight shifts.
        var followKey = normalizeLocalDateKey(n.followUpAt);
        if (!followKey) { queue.noDate.push(wrapped); return; }
        var cmp = compareLocalDateKeys(followKey, todayKey);
        if (cmp === null) queue.noDate.push(wrapped);
        else if (cmp < 0) queue.overdue.push(wrapped);
        else if (cmp === 0) queue.dueToday.push(wrapped);
        else queue.upcoming.push(wrapped);
      });
    });
    return queue;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 29/30 — student academic summary + summary actions.
     ══════════════════════════════════════════════════════════════════ */
  // Internal, unauthorized. Called only from authorized public wrappers
  // below. Also reused as the source for the print view (Task 23).
  function buildStudentSummaryTextInternal(studentId) {
    var snap = readStudentAcademicSnapshotInternal(studentId); if (!snap) return '';
    var L = [];
    L.push('ZIRAK English Language Academy');
    L.push('Student Academic Summary');
    L.push('');
    L.push('Student: ' + snap.studentName);
    L.push('Student ID: ' + snap.studentId);
    L.push('Current class: ' + (snap.currentLevel || '(not set)'));
    L.push('Level source: ' + snap.levelSource);
    L.push('');
    L.push('Placement status: ' + snap.placement.status);
    if (snap.placement.confidence) L.push('Placement confidence: ' + snap.placement.confidence);
    if (snap.placement.pendingRetake) L.push('Pending retake recommendation on record.');
    L.push('');
    L.push('Personalized Learning Plan: ' + snap.learningPlan.status);
    if (snap.learningPlan.status !== 'none') L.push('Progress: ' + snap.learningPlan.completedItems + ' of ' + snap.learningPlan.plannedItems + ' planned activities (' + snap.learningPlan.progressPercentage + '%)');
    L.push('');
    L.push('Recent learning activity:');
    L.push('  Study days recorded: ' + snap.activity.recentStudyDays);
    L.push('  Scored activities: ' + snap.activity.recentScoredActivities);
    if (snap.activity.lastRealActivityAt) L.push('  Last real activity: ' + String(snap.activity.lastRealActivityAt).slice(0, 10));
    L.push('');
    L.push('Assessment readiness:');
    L.push('  Daily Learning Review: ' + snap.assessments.daily.status);
    L.push('  Weekly Progress Test: ' + snap.assessments.weekly.status);
    L.push('  Two-Week Progress Review: ' + snap.assessments.twoWeek.status);
    L.push('  Monthly Progress Exam: ' + snap.assessments.monthly.status);
    L.push('  Ready now: ' + snap.assessments.readyCount);
    L.push('');
    L.push('Skill strengths: ' + (snap.skills.strongestDomains.map(function (d) { return DOMAIN_LABELS[d]; }).join(', ') || '(insufficient evidence)'));
    L.push('Support areas: ' + (snap.skills.supportDomains.map(function (d) { return DOMAIN_LABELS[d]; }).join(', ') || '(none identified)'));
    L.push('');
    L.push('Achievements issued: ' + snap.achievements.issuedCount);
    L.push('Open teacher follow-ups: ' + (snap.teacherNotes || []).filter(function (n) { return n.status !== 'Resolved'; }).length);
    L.push('');
    L.push('Generated: ' + String(snap.generatedAt).slice(0, 19).replace('T', ' '));
    L.push('');
    L.push('This summary is generated from locally stored ZIRAK academic records.');
    return L.join('\n');
  }
  // Public authorized wrapper (Task 10).
  function buildStudentSummaryText(studentId) {
    if (!isTeacherAuthorized()) return '';
    touchTeacherActivity();
    return buildStudentSummaryTextInternal(studentId);
  }
  // Task 17 (D14C): the dedicated plan-export authority. Exports the
  // CURRENT plan (planId omitted) or a HISTORICAL cycle (planId given),
  // using a plan-specific schema — never the student-summary root, and
  // never routed through exportStudentSummary/_exportStudentJSON.
  function buildPlanExportPayload(studentId, planId) {
    var plan = null, archived = false;
    if (!planId) {
      try { plan = window.ZirakLearningPlan && window.ZirakLearningPlan.getPlan ? window.ZirakLearningPlan.getPlan(studentId) : null; } catch (e) {}
    } else {
      try { plan = window.ZirakLearningPlan && window.ZirakLearningPlan.getPlan ? window.ZirakLearningPlan.getPlan(studentId) : null; } catch (e) {}
      if (!plan || plan.planId !== planId) {
        var history = [];
        try { history = window.ZirakLearningPlan && window.ZirakLearningPlan.getPlanHistory ? window.ZirakLearningPlan.getPlanHistory(studentId) : []; } catch (e) {}
        plan = (history || []).find(function (p) { return p && p.planId === planId; }) || null;
        archived = !!plan;
      }
    }
    if (!plan) return null;
    var completedItems = plan.completedPlanItems ? Object.keys(plan.completedPlanItems).filter(function (id) { var r = plan.completedPlanItems[id]; return r && (r.status === 'completed' || r.status === 'skipped' || r.status === 'replaced'); }).length : 0;
    var plannedItems = (plan.dailyPlans || []).reduce(function (n, dp) { return n + ((dp && dp.activities) ? dp.activities.length : 0); }, 0);
    return {
      // Task 17: a PLAN-specific root, never the student-summary schema.
      exportType: 'zirak-personalized-plan-export',
      studentId: studentId,
      planId: plan.planId || '',
      previousPlanId: plan.previousPlanId || '',
      status: plan.status || '',
      level: plan.level || '',
      planSource: plan.source || plan.planSource || '',
      cycleReason: plan.cycleReason || plan.reason || '',
      archived: archived,
      currentDay: plan.currentDay || 1,
      totalDays: (plan.dailyPlans || []).length,
      completedItems: completedItems,
      plannedItems: plannedItems,
      progressPercentage: plannedItems ? Math.round((completedItems / plannedItems) * 100) : 0,
      dailyPlans: plan.dailyPlans || [],
      domainDistribution: plan.domainDistribution || null,
      teacherAdjustments: plan.teacherAdjustments || [],
      automaticAdjustments: plan.automaticAdjustments || [],
      createdAt: plan.createdAt || '',
      archivedAt: plan.archivedAt || '',
      updatedAt: plan.updatedAt || '',
      generatedAt: nowISO()
    };
  }
  function buildPlanExportText(payload) {
    if (!payload) return '';
    var L = [];
    L.push('ZIRAK English Language Academy'); L.push('Personalized Learning Plan Export'); L.push('');
    L.push('Student ID: ' + payload.studentId);
    L.push('Plan ID: ' + payload.planId);
    if (payload.previousPlanId) L.push('Previous Plan ID: ' + payload.previousPlanId);
    L.push('Status: ' + payload.status + (payload.archived ? ' (archived / historical cycle)' : ' (current)'));
    L.push('Level: ' + payload.level);
    L.push('Source: ' + payload.planSource);
    L.push('Cycle reason: ' + payload.cycleReason);
    L.push('');
    L.push('Progress: ' + payload.completedItems + ' of ' + payload.plannedItems + ' (' + payload.progressPercentage + '%)');
    L.push('Day ' + payload.currentDay + ' of ' + payload.totalDays);
    L.push('');
    L.push('Created: ' + fmtDate(payload.createdAt));
    if (payload.archivedAt) L.push('Archived: ' + fmtDate(payload.archivedAt));
    L.push('');
    L.push('This export is generated from locally stored ZIRAK plan records.');
    return L.join('\n');
  }
  function exportSelectedPlan(studentId, planId, format) {
    if (!isTeacherAuthorized()) return { ok: false, reason: 'not-authorized' };
    touchTeacherActivity();
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    var payload = buildPlanExportPayload(studentId, planId || '');
    if (!payload) return { ok: false, reason: planId ? 'plan-not-found' : 'no-plan' };
    if (format === 'print') return { ok: true, payload: payload };
    var content, mime, name;
    if (format === 'txt') { content = buildPlanExportText(payload); mime = 'text/plain'; name = 'zirak-plan-' + studentId + '-' + (payload.planId || 'plan') + '.txt'; }
    else { content = JSON.stringify(payload, null, 2); mime = 'application/json'; name = 'zirak-plan-' + studentId + '-' + (payload.planId || 'plan') + '.json'; }
    try {
      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    } catch (e) {}
    return { ok: true, payload: payload };
  }
  function exportStudentSummary(studentId, kind) {
    if (!isTeacherAuthorized()) return;
    touchTeacherActivity();
    var snap = readStudentAcademicSnapshotInternal(studentId); if (!snap) return;
    var content, mime, name;
    if (kind === 'json') { content = JSON.stringify(snap, null, 2); mime = 'application/json'; name = 'zirak-student-summary-' + studentId + '.json'; }
    else { content = buildStudentSummaryTextInternal(studentId); mime = 'text/plain'; name = 'zirak-student-summary-' + studentId + '.txt'; }
    try {
      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    } catch (e) {}
  }
  function copyStudentSummary(studentId) {
    if (!isTeacherAuthorized()) return; // Task 9 (D14A): independent auth check
    touchTeacherActivity();
    var t = buildStudentSummaryTextInternal(studentId);
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t); else { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } } catch (e) {}
  }
  function shareStudentSummaryWA(studentId) {
    if (!isTeacherAuthorized()) return; // Task 9 (D14A): independent auth check
    touchTeacherActivity();
    var t = buildStudentSummaryTextInternal(studentId);
    try { window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank'); } catch (e) {}
    // Deliberately does NOT touch the Learning Ledger.
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 31 — institute exports. PIN-protected. CSV uses proper
     escaping. Never includes Teacher PIN or raw storage keys.
     ══════════════════════════════════════════════════════════════════ */
  function csvEscape(v) {
    var s = String(v == null ? '' : v);
    if (/[",\r\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function buildInstituteCSVInternal() {
    var roster = readRoster();
    var lines = [];
    lines.push(['studentId', 'studentName', 'acceptedClass', 'levelSource', 'placementStatus', 'planStatus', 'planProgress', 'lastRealActivityAt', 'attentionCount', 'assessmentReadyCount', 'openFollowUpCount'].map(csvEscape).join(','));
    roster.forEach(function (s) {
      var snap = readStudentAcademicSnapshotInternal(s.studentId);
      if (!snap) return;
      // Task 24 (D14A): real assessment-ready count from the actual
      // per-student assessment reader, not hard-coded to 0.
      var readyCount = (snap.assessments && typeof snap.assessments.readyCount === 'number') ? snap.assessments.readyCount : 0;
      var openFU = (snap.teacherNotes || []).filter(function (n) { return n.status !== 'Resolved'; }).length;
      lines.push([snap.studentId, snap.studentName, snap.currentLevel, snap.levelSource, snap.placement.status, snap.learningPlan.status, snap.learningPlan.progressPercentage + '%', snap.activity.lastRealActivityAt ? String(snap.activity.lastRealActivityAt).slice(0, 10) : '', snap.attention.length, readyCount, openFU].map(csvEscape).join(','));
    });
    return lines.join('\r\n') + '\r\n';
  }
  function buildInstituteCSV() {
    if (!isTeacherAuthorized()) return '';
    touchTeacherActivity();
    return buildInstituteCSVInternal();
  }
  function exportInstitute(kind) {
    if (!isTeacherAuthorized()) return;
    var content, mime, name;
    if (kind === 'json') {
      var overview = readInstituteOverviewInternal();
      content = JSON.stringify(overview, null, 2); mime = 'application/json'; name = 'zirak-institute-overview.json';
    } else if (kind === 'csv') {
      content = buildInstituteCSV(); mime = 'text/csv'; name = 'zirak-institute-overview.csv';
    } else {
      var overview2 = readInstituteOverviewInternal();
      var L = [];
      L.push('ZIRAK English Language Academy \u2014 Institute Overview');
      L.push('');
      L.push('Total students: ' + overview2.totalStudents);
      L.push('Students with accepted level: ' + overview2.studentsWithAcceptedLevel);
      L.push('Awaiting Placement decision: ' + overview2.studentsAwaitingPlacementDecision);
      L.push('Active plans: ' + overview2.activePlans);
      L.push('Paused plans: ' + overview2.pausedPlans);
      L.push('Students with no plan: ' + overview2.noPlan);
      L.push('Active in last 7 days: ' + overview2.recentActivity7d);
      L.push('Needing attention: ' + overview2.needAttention);
      L.push('Open follow-ups: ' + overview2.openFollowUps);
      L.push('Overdue follow-ups: ' + overview2.overdueFollowUps);
      L.push('Achievements issued: ' + overview2.issuedAchievements);
      L.push('');
      L.push('Generated: ' + String(overview2.generatedAt).slice(0, 19).replace('T', ' '));
      L.push('This overview is generated from locally stored ZIRAK academic records.');
      content = L.join('\n'); mime = 'text/plain'; name = 'zirak-institute-overview.txt';
    }
    try {
      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 33 — refresh coordinator. Subscribes ONCE to the Learning
     Ledger; invalidates the affected student's cached snapshot rather
     than trusting the event payload as final academic truth.
     ══════════════════════════════════════════════════════════════════ */
  function invalidateSnapshot(studentId) { if (studentId) delete snapshotCache[studentId]; else snapshotCache = {}; }
  function installRefreshCoordinator() {
    try {
      if (window.ZirakLearningLedger && typeof window.ZirakLearningLedger.subscribe === 'function' && !window.ZirakLearningLedger.__tccBridged) {
        window.ZirakLearningLedger.subscribe(function (rec) {
          try {
            var sid = (rec && rec.studentId) || (rec && rec.student && rec.student.id) || activeStudentId();
            invalidateSnapshot(sid);
            if (typeof window.ZirakTeacherCommandCenter._onRefresh === 'function') window.ZirakTeacherCommandCenter._onRefresh(sid);
          } catch (e) {}
        });
        window.ZirakLearningLedger.__tccBridged = true;
      }
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 36 — student deletion cleanup: teacher notes/follow-ups and
     cached snapshot. Called by hookDeletion() which wraps the profile
     module's own delete function once.
     ══════════════════════════════════════════════════════════════════ */
  function onDeleteStudent(studentId) {
    if (!studentId) return;
    // Phase 1: PRE-delete storage cleanup. Runs BEFORE origDelete so
    // teacher notes are removed alongside the profile's own cleanup.
    lsDel(studentKey(studentId, 'teacher_followups'));
  }
  function onAfterDeleteStudent(studentId) {
    if (!studentId) return;
    // Phase 2: POST-delete cache + UI cleanup. Runs AFTER origDelete
    // has removed the student from the roster and storage, so a
    // subsequent renderShell() cannot repopulate the cache with the
    // deleted student's data.
    invalidateSnapshot(studentId);
    // Task 37 (D14B): clear any viewer/comparison state that belonged
    // to the deleted student — never leave stale archived content
    // visible after deletion.
    if (ui && ui.viewer && ui.viewer.studentId === studentId) ui.viewer = null;
    if (ui && ui.selectedStudentId === studentId) {
      ui.selectedStudentId = '';
      ui.selectedTabSection = 'overview';
      if (ui.activeTab === 'selected') ui.activeTab = 'students';
    }
    // Task 24: a deletion is a roster-level event — request a full refresh.
    queueRefresh(null);
  }
  function hookDeletion() {
    try {
      if (!window.ZirakProfile || window.ZirakProfile.__tccDeleteHooked) return;
      var origDelete = window.ZirakProfile.deleteStudentCompletely;
      if (typeof origDelete !== 'function') return;
      window.ZirakProfile.deleteStudentCompletely = function (studentId) {
        try { onDeleteStudent(studentId); } catch (e) {}         // pre-delete
        var r = origDelete.apply(this, arguments);
        try { onAfterDeleteStudent(studentId); } catch (e) {}    // post-delete
        return r;
      };
      window.ZirakProfile.__tccDeleteHooked = true;
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 18/19 (D14A) — extended live-refresh coordinator. D14 only
     listened to Learning Ledger writes. D14A adds a normalized app
     event 'zirak:tcc-refresh' that any authority may emit (or that we
     emit here after a TCC-initiated action). We never MONKEY-PATCH
     every authority — the plan/placement/profile modules can dispatch
     this same event on their own timeline, and this coordinator will
     also invalidate on Ledger writes exactly as before.

     Task 19: events are refresh SIGNALS. We invalidate only the
     affected student's cache and re-read academic truth from the
     authority. We never trust event payload scores or statuses as
     final. Student A events never invalidate Student B's cache.

     Task 23/24 (D14B) — refresh coalescing. Browser-dispatched
     CustomEvents fire synchronously, inside the same call stack as the
     authority's write. Rendering synchronously there would render in
     the middle of a write (or, worse, recursively if the render
     itself triggers another event). So: cache invalidation happens
     IMMEDIATELY and synchronously (cheap, safe, idempotent), but the
     actual re-render is queued via queueMicrotask and coalesced — many
     events in one synchronous operation produce exactly one render,
     scheduled to run after the current stack unwinds.
     ══════════════════════════════════════════════════════════════════ */
  var refreshQueue = { pendingStudentIds: {}, fullRefreshRequested: false, scheduled: false };
  function _scheduleCoalescedRefresh() {
    if (refreshQueue.scheduled) return; // already queued — coalesce
    refreshQueue.scheduled = true;
    var runner = function () {
      refreshQueue.scheduled = false;
      var studentIds = Object.keys(refreshQueue.pendingStudentIds);
      var full = refreshQueue.fullRefreshRequested;
      refreshQueue.pendingStudentIds = {}; refreshQueue.fullRefreshRequested = false;
      // Task 12/32 (D14A): an expired session must discard pending
      // private refreshes rather than rendering stale private data.
      if (!isTeacherAuthorized()) return;
      // Only re-render if something visible could actually change:
      // the selected student was affected, or a full/roster-level
      // refresh was requested (deletion, institute-wide event).
      if (full || (ui.selectedStudentId && studentIds.indexOf(ui.selectedStudentId) > -1) || studentIds.length === 0) {
        try { renderShell(); } catch (e) {}
      }
    };
    try {
      if (typeof queueMicrotask === 'function') queueMicrotask(runner);
      else if (typeof Promise !== 'undefined') Promise.resolve().then(runner);
      else setTimeout(runner, 0);
    } catch (e) { try { setTimeout(runner, 0); } catch (e2) {} }
  }
  function queueRefresh(studentId) {
    if (studentId) refreshQueue.pendingStudentIds[studentId] = true;
    else refreshQueue.fullRefreshRequested = true;
    _scheduleCoalescedRefresh();
  }
  function emitRefreshEvent(scope, studentId) {
    try {
      if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('zirak:tcc-refresh', { detail: { scope: scope || '', studentId: studentId || '' } }));
      }
    } catch (e) {}
    // Invalidate synchronously (cheap + safe); queue the RENDER.
    try { if (studentId) invalidateSnapshot(studentId); else invalidateSnapshot(); } catch (e) {}
    queueRefresh(studentId || null);
  }
  function installExtendedRefresh() {
    try {
      if (window.__tccExtRefreshInstalled) return;
      if (typeof window.addEventListener === 'function') {
        window.addEventListener('zirak:tcc-refresh', function (ev) {
          try {
            var d = ev && ev.detail;
            var sid = d && d.studentId;
            invalidateSnapshot(sid || null);
            queueRefresh(sid || null);
          } catch (e) {}
        });
      }
      window.__tccExtRefreshInstalled = true;
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 5/7 (D14A) — centralized selected-student action adapters.
     Every adapter validates: (1) Teacher authorization; (2) the
     selected student exists; (3) the record actually belongs to the
     selected student; (4) the action calls an EXISTING authorized
     academic authority — this module never rewrites plan/placement
     rules. On success, the affected student's snapshot is invalidated
     and a refresh event fires (Task 18/19).
     ══════════════════════════════════════════════════════════════════ */
  function validateSelectedStudent(studentId) {
    if (!isTeacherAuthorized()) return { ok: false, reason: 'not-authorized' };
    if (!studentId) return { ok: false, reason: 'no-student' };
    var profile = readStudentProfile(studentId);
    if (!profile) return { ok: false, reason: 'student-not-found' };
    return { ok: true, profile: profile };
  }

  // Placement / Level
  function openSelectedPlacementReport(studentId, resultId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    var history = readPlacementHistory(studentId) || [];
    if (Array.isArray(history) && resultId) {
      var owned = history.some(function (r) { return r && r.resultId === resultId; });
      if (!owned) return { ok: false, reason: 'result-not-owned-by-student' };
    }
    // Read-only teacher inspection: we RETURN the record for the caller to render.
    // We do NOT invoke a screen that would silently activate the student (Task 8).
    var record = resultId ? history.find(function (r) { return r && r.resultId === resultId; }) : (history[0] || null);
    return { ok: true, record: record };
  }
  function openSelectedPlacementHistory(studentId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    return { ok: true, history: readPlacementHistory(studentId) || [] };
  }
  // Finding J (D14B) fix: this function (and its three siblings below)
  // no longer read/edit/save placement_history directly. They validate
  // the selection here, then delegate the actual decision to
  // ZirakPlacementEngine's explicit-student Teacher decision authority
  // — the ONE place a Placement decision is ever written.
  function reviewSelectedPlacementDecision(studentId, resultId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    return keepExistingLevelForSelected(studentId, resultId, '');
  }
  function keepExistingLevelForSelected(studentId, resultId, note) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    if (!window.ZirakPlacementEngine || typeof window.ZirakPlacementEngine.teacherKeepExistingLevelFor !== 'function') return { ok: false, reason: 'authority-unavailable' };
    var r = window.ZirakPlacementEngine.teacherKeepExistingLevelFor(studentId, resultId, note || '');
    if (r && r.ok) { invalidateSnapshot(studentId); queueRefresh(studentId); }
    return r;
  }
  function confirmRecommendationForSelected(studentId, resultId, note) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    if (!window.ZirakPlacementEngine || typeof window.ZirakPlacementEngine.teacherConfirmRecommendationFor !== 'function') return { ok: false, reason: 'authority-unavailable' };
    var r = window.ZirakPlacementEngine.teacherConfirmRecommendationFor(studentId, resultId, note || '');
    if (r && r.ok) { invalidateSnapshot(studentId); queueRefresh(studentId); }
    return r;
  }
  function selectDifferentLevelForSelected(studentId, resultId, classId, note) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    if (!window.ZirakPlacementEngine || typeof window.ZirakPlacementEngine.teacherSelectLevelFor !== 'function') return { ok: false, reason: 'authority-unavailable' };
    var r = window.ZirakPlacementEngine.teacherSelectLevelFor(studentId, resultId, classId, note || '');
    if (r && r.ok) { invalidateSnapshot(studentId); queueRefresh(studentId); }
    return r;
  }
  function authorizeRetakeForSelected(studentId, reason) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    if (!window.ZirakPlacementEngine || typeof window.ZirakPlacementEngine.authorizeRetakeFor !== 'function') return { ok: false, reason: 'authority-unavailable' };
    var r = window.ZirakPlacementEngine.authorizeRetakeFor(studentId, reason || '');
    if (r && r.ok) { invalidateSnapshot(studentId); queueRefresh(studentId); }
    return r;
  }

  // Plan
  function openSelectedPlan(studentId, planId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    var plan = readPlanFor(studentId);
    if (!plan) return { ok: false, reason: 'no-plan' };
    if (planId && plan.planId !== planId) {
      // Not the currently active plan — look in history.
      var history = readPlanHistoryFor(studentId) || [];
      var archived = history.find(function (c) { return c && c.planId === planId; });
      if (!archived) return { ok: false, reason: 'plan-not-found' };
      return { ok: true, plan: archived, archived: true };
    }
    return { ok: true, plan: plan };
  }
  function pauseSelectedPlan(studentId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    try {
      if (window.ZirakLearningPlan && typeof window.ZirakLearningPlan.pausePlan === 'function') {
        var ok = window.ZirakLearningPlan.pausePlan(studentId);
        if (ok) { invalidateSnapshot(studentId); emitRefreshEvent('plan', studentId); }
        return { ok: !!ok };
      }
    } catch (e) {}
    return { ok: false, reason: 'authority-unavailable' };
  }
  function resumeSelectedPlan(studentId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    try {
      if (window.ZirakLearningPlan && typeof window.ZirakLearningPlan.resumePlan === 'function') {
        var ok = window.ZirakLearningPlan.resumePlan(studentId);
        if (ok) { invalidateSnapshot(studentId); emitRefreshEvent('plan', studentId); }
        return { ok: !!ok };
      }
    } catch (e) {}
    return { ok: false, reason: 'authority-unavailable' };
  }
  function regenerateSelectedPlan(studentId, opts) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    try {
      if (window.ZirakLearningPlan && typeof window.ZirakLearningPlan.regeneratePlan === 'function') {
        var plan = window.ZirakLearningPlan.regeneratePlan(studentId, opts || {});
        invalidateSnapshot(studentId);
        emitRefreshEvent('plan', studentId);
        return { ok: !!plan, planId: plan && plan.planId };
      }
    } catch (e) {}
    return { ok: false, reason: 'authority-unavailable' };
  }

  // Assessments — read-only. Opening an ASSESSMENT to actually TAKE it
  // requires the student to be active; Task 8 says we must not silently
  // switch. So this returns a "requires activation" marker for the UI.
  // I6H-D14C (Task 15): the real UI-connected adapter for
  // "Open Assessment" / "View Assessment Result". Validates that the
  // requested action is actually valid for the CURRENT readiness state
  // (a Not Ready assessment cannot be "opened"), then returns a
  // requires-activation payload — activation itself only happens after
  // explicit Teacher confirmation in the UI layer (Task 16).
  function openSelectedAssessment(studentId, assessmentType) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    var validTypes = ['daily', 'weekly', 'twoWeek', 'monthly'];
    if (validTypes.indexOf(assessmentType) === -1) return { ok: false, reason: 'invalid-assessment-type' };
    var state = readStudentAssessmentStateInternal(studentId);
    if (!state) return { ok: false, reason: 'authority-unavailable' };
    var assessState = state[assessmentType];
    if (!assessState.ready && !assessState.completed) return { ok: false, reason: 'assessment-not-ready' };
    var ASSESSMENT_TITLES = { daily: 'Daily Learning Review', weekly: 'Weekly Progress Test', twoWeek: 'Two-Week Progress Review', monthly: 'Monthly Progress Exam' };
    return { ok: true, state: assessState, requiresActivation: true, assessmentType: assessmentType, assessmentTitle: ASSESSMENT_TITLES[assessmentType] };
  }
  // I6H-D14C (Task 12/13): reads the REAL completed Ledger record for
  // an assessment type — this is a COMPLETED ASSESSMENT RESULT, never
  // a finalized archived report. The viewer kind 'assessment-result'
  // renders it with different terminology and never claims D10C
  // archive status.
  function openSelectedAssessmentResult(studentId, assessmentType) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    var validTypes = ['daily', 'weekly', 'twoWeek', 'monthly'];
    if (validTypes.indexOf(assessmentType) === -1) return { ok: false, reason: 'invalid-assessment-type' };
    var state = readStudentAssessmentStateInternal(studentId);
    if (!state) return { ok: false, reason: 'authority-unavailable' };
    var assessState = state[assessmentType];
    if (!assessState.completed || !assessState.recordId) return { ok: false, reason: 'assessment-not-completed' };
    var ledger = readLedgerRecordsFor(studentId);
    var record = (ledger.records || []).find(function (r) { return r && r.id === assessState.recordId; });
    if (!record) return { ok: false, reason: 'result-record-not-found' };
    return { ok: true, kind: 'assessment-result', record: record, assessmentType: assessmentType };
  }
  function openSelectedFinalizedReport(studentId, reportId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    if (!window.ZirakAchievementCenter || typeof window.ZirakAchievementCenter.getArchivedReportFor !== 'function') return { ok: false, reason: 'authority-unavailable' };
    var report = window.ZirakAchievementCenter.getArchivedReportFor(studentId, reportId);
    if (!report) return { ok: false, reason: 'report-not-found-for-student' };
    return { ok: true, kind: 'report', record: report };
  }
  function openSelectedAchievement(studentId, achievementId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    if (!window.ZirakAchievementCenter || typeof window.ZirakAchievementCenter.getArchivedCertificateFor !== 'function') return { ok: false, reason: 'authority-unavailable' };
    var cert = window.ZirakAchievementCenter.getArchivedCertificateFor(studentId, achievementId);
    if (cert) return { ok: true, kind: 'certificate', record: cert };
    // Fall back to an archived report if the achievementId refers to a report, not a certificate.
    var report = window.ZirakAchievementCenter.getArchivedReportFor ? window.ZirakAchievementCenter.getArchivedReportFor(studentId, achievementId) : null;
    if (report) return { ok: true, kind: 'report', record: report };
    return { ok: false, reason: 'achievement-not-found-for-student' };
  }
  function listSelectedArchivedReports(studentId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    if (!window.ZirakAchievementCenter || typeof window.ZirakAchievementCenter.getArchivedReportsFor !== 'function') return { ok: false, reason: 'authority-unavailable' };
    return { ok: true, reports: window.ZirakAchievementCenter.getArchivedReportsFor(studentId) || [] };
  }
  function listSelectedArchivedCertificates(studentId) {
    var v = validateSelectedStudent(studentId); if (!v.ok) return v;
    touchTeacherActivity();
    if (!window.ZirakAchievementCenter || typeof window.ZirakAchievementCenter.getArchivedCertificatesFor !== 'function') return { ok: false, reason: 'authority-unavailable' };
    return { ok: true, certificates: window.ZirakAchievementCenter.getArchivedCertificatesFor(studentId) || [] };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 4/32 — dashboard UI. ONE shell, six tabs, in-memory ephemeral
     state (search/filter/sort/selectedStudent/activeTab) — cleared when
     teacher auth expires (Task 32).
     ══════════════════════════════════════════════════════════════════ */
  var ui = {
    activeTab: 'overview', // overview | attention | students | selected | analytics | followups | reports
    selectedStudentId: '',
    search: '',
    filter: { class: '', placementStatus: '', planStatus: '', attention: '', recent: '' },
    sort: 'name',
    selectedTabSection: 'overview',
    // Task 9 (D14B): ONE reusable Teacher Detail Viewer. Not a separate
    // overlay per feature. { kind, title, studentId, data } or null.
    viewer: null,
    // Task 21 (D14B): ONE non-blocking status/toast message. Cleared
    // automatically after render or replaced by the next action.
    status: null // { kind: 'info'|'success'|'error', text }
  };

  function mount() { return document.getElementById('teacher-command-center-mount') || document.body; }
  function tccPrivacyNote() { return '<div class="tcc-privacy">\ud83d\udd12 Student information in this dashboard is stored locally on this device.</div>'; }

  // Task 21: set a status message, shown once at the top of the shell on
  // the next render. Does not use repeated browser alerts.
  function showActionStatus(kind, text) { ui.status = { kind: kind, text: text }; }
  function renderStatusBanner() {
    if (!ui.status) return '';
    var s = ui.status; ui.status = null; // consume — shown once
    return '<div class="tcc-toast tcc-toast-' + esc(s.kind) + '" role="status">' + esc(s.text) + '</div>';
  }
  var STATUS_TEXT = {
    'not-authorized': 'Teacher authorization required.',
    'no-student': 'No student selected.',
    'student-not-found': 'Student not found.',
    'result-not-found-for-student': 'That record does not belong to the selected student.',
    'result-not-owned-by-student': 'That record does not belong to the selected student.',
    'report-not-found-for-student': 'That report was not found for the selected student.',
    'achievement-not-found-for-student': 'That achievement was not found for the selected student.',
    'plan-not-found': 'No plan found for that cycle.',
    'no-plan': 'This student has no Personalized Learning Plan yet.',
    'no-placement-history': 'This student has no Placement history yet.',
    'authority-unavailable': 'That feature is not available right now.',
    'missing-student-or-result': 'Missing student or result reference.',
    'missing-classId': 'No class was selected.',
    'missing-student': 'No student selected.',
    'unknown-decision': 'Unrecognized decision type.'
  };
  function statusTextFor(reason) { return STATUS_TEXT[reason] || ('Action could not be completed (' + reason + ').'); }

  // Task 9/22 (D14B/D14C): open the ONE reusable viewer with a specific
  // payload. Stores the currently-focused element so focus can be
  // restored to it when the viewer closes (Task 22).
  function openViewer(kind, title, studentId, data) {
    var previouslyFocused = null;
    try { previouslyFocused = document.activeElement || null; } catch (e) {}
    ui.viewer = { kind: kind, title: title, studentId: studentId, data: data, previouslyFocusedRef: previouslyFocused };
    ui.status = null;
  }
  function closeViewer() {
    var toRestore = ui.viewer && ui.viewer.previouslyFocusedRef;
    ui.viewer = null;
    renderShell();
    // Task 22: restore focus to the control that opened the viewer,
    // where that element still exists in the DOM.
    try { if (toRestore && typeof toRestore.focus === 'function') toRestore.focus(); } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 9-19 (D14B) — the Teacher Detail Viewer. ONE reusable modal,
     not a separate overlay per feature. Renders real returned data
     from the safe adapters — never a placeholder, never a discarded
     object turned into an unchanged rerender.
     ══════════════════════════════════════════════════════════════════ */
  function detailRow(label, value) { return '<div class="tcc-viewer-row"><div class="tcc-viewer-label">' + esc(label) + '</div><div class="tcc-viewer-value">' + value + '</div></div>'; }
  function fmtPct(n) { return (typeof n === 'number') ? (n + '%') : '\u2014'; }
  function fmtDate(s) { return s ? String(s).slice(0, 10) : '\u2014'; }
  function fmtList(arr, label) { return (arr && arr.length) ? esc(arr.join(', ')) : ('<span class="tcc-tag">' + esc(label || 'none identified') + '</span>'); }

  function renderPlacementReportViewer(sid, rec) {
    if (!rec) return '<div class="tcc-empty">No Placement result to display.</div>';
    var d = rec.diagnostic || {}; var dec = rec.decision || {};
    var domainRows = '';
    if (d.domainScores) {
      domainRows = '<table class="tcc-table"><thead><tr><th>Domain</th><th>Score</th></tr></thead><tbody>' +
        Object.keys(d.domainScores).map(function (k) { return '<tr><td>' + esc(k) + '</td><td>' + fmtPct(d.domainScores[k]) + '</td></tr>'; }).join('') +
      '</tbody></table>';
    }
    return detailRow('Result ID', '<code>' + esc(rec.resultId || '') + '</code>') +
      detailRow('Completed', fmtDate(d.completedAt)) +
      detailRow('Recommended band / class', esc(d.recommendedLevelName || d.recommendedLevel || '\u2014')) +
      detailRow('Confidence', esc(d.confidence || '\u2014')) +
      (d.technicalLimitations && d.technicalLimitations.length ? detailRow('Technical limitations', fmtList(d.technicalLimitations)) : '') +
      detailRow('Domain evidence', domainRows || '<span class="tcc-tag">no domain scores recorded</span>') +
      detailRow('Decision state', esc(dec.decisionStatus || 'pending')) +
      detailRow('Resolved level', esc(dec.resolvedLevel || '\u2014')) +
      detailRow('Decision at', fmtDate(dec.decisionAt)) +
      (dec.teacherNote ? detailRow('Teacher note', esc(dec.teacherNote)) : '');
  }
  function renderPlacementHistoryViewer(sid, history) {
    if (!history || !history.length) return '<div class="tcc-empty">No Placement history for this student.</div>';
    var sorted = history.slice().sort(function (a, b) { return String(b.diagnostic.completedAt).localeCompare(String(a.diagnostic.completedAt)); });
    return '<table class="tcc-table"><thead><tr><th>Date</th><th>Recommendation</th><th>Confidence</th><th>Decision</th><th></th></tr></thead><tbody>' +
      sorted.map(function (r) {
        var d = r.diagnostic || {}; var dec = r.decision || {};
        return '<tr><td>' + fmtDate(d.completedAt) + '</td><td>' + esc(d.recommendedLevelName || d.recommendedLevel || '\u2014') + '</td><td>' + esc(d.confidence || '\u2014') + '</td><td>' + esc(dec.decisionStatus || 'pending') + '</td>' +
          '<td><button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openPlacementReport(\'' + esc(sid) + '\',\'' + esc(r.resultId) + '\')">View Report</button></td></tr>';
      }).join('') +
    '</tbody></table>';
  }
  function renderPlacementComparisonViewer(sid, pair) {
    if (!pair || pair.length < 2) return '<div class="tcc-empty">Not enough results to compare.</div>';
    var a = pair[0], b = pair[1];
    function col(r) { var d = r.diagnostic || {}; var dec = r.decision || {}; return '<td>' + fmtDate(d.completedAt) + '<br>' + esc(d.recommendedLevelName || d.recommendedLevel || '\u2014') + '<br>Confidence: ' + esc(d.confidence || '\u2014') + '<br>Decision: ' + esc(dec.decisionStatus || 'pending') + '</td>'; }
    return '<table class="tcc-table"><thead><tr><th></th><th>Most recent</th><th>Previous</th></tr></thead><tbody><tr><td><b>Result</b></td>' + col(a) + col(b) + '</tr></tbody></table>';
  }
  function renderPlanDetailViewer(sid, plan) {
    if (!plan) return '<div class="tcc-empty">No plan to display.</div>';
    var completedItems = plan.completedPlanItems ? Object.keys(plan.completedPlanItems).filter(function (id) { var r = plan.completedPlanItems[id]; return r && (r.status === 'completed' || r.status === 'skipped' || r.status === 'replaced'); }).length : 0;
    var plannedItems = (plan.dailyPlans || []).reduce(function (n, dp) { return n + ((dp && dp.activities) ? dp.activities.length : 0); }, 0);
    var teacherAdj = plan.teacherAdjustments || []; var autoAdj = plan.automaticAdjustments || [];
    return detailRow('Plan ID', '<code>' + esc(plan.planId || '') + '</code>') +
      (plan.previousPlanId ? detailRow('Previous Plan ID', '<code>' + esc(plan.previousPlanId) + '</code>') : '') +
      detailRow('Level', esc(plan.level || '\u2014')) +
      detailRow('Status', esc(plan.status || '\u2014')) +
      detailRow('Source', esc(plan.source || plan.planSource || '\u2014')) +
      detailRow('Cycle reason', esc(plan.cycleReason || plan.reason || '\u2014')) +
      detailRow('Current day', String(plan.currentDay || 1) + ' of ' + (plan.dailyPlans || []).length) +
      detailRow('Completed activities', completedItems + ' of ' + plannedItems) +
      (plan.domainDistribution ? detailRow('Domain distribution', esc(JSON.stringify(plan.domainDistribution))) : '') +
      detailRow('Teacher adjustments', teacherAdj.length ? String(teacherAdj.length) : 'None') +
      detailRow('Automatic adjustments', autoAdj.length ? String(autoAdj.length) : 'None') +
      detailRow('Created', fmtDate(plan.createdAt)) +
      (plan.archivedAt ? detailRow('Archived', fmtDate(plan.archivedAt)) : '');
  }
  function renderPlanHistoryViewer(sid, history) {
    if (!history || !history.length) return '<div class="tcc-empty">No previous plan cycles for this student.</div>';
    return '<table class="tcc-table"><thead><tr><th>Plan ID</th><th>Level</th><th>Started</th><th>Archived</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
      history.map(function (p) {
        var pid = esc(p.planId || '');
        return '<tr><td><code>' + pid + '</code></td><td>' + esc(p.level || '\u2014') + '</td><td>' + fmtDate(p.createdAt) + '</td><td>' + fmtDate(p.archivedAt) + '</td><td>' + esc(p.cycleReason || p.reason || '\u2014') + '</td><td>' + esc(p.status || '\u2014') + '</td>' +
          '<td>' +
            '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openPlanCycleDetail(\'' + esc(sid) + '\',\'' + pid + '\')">View Details</button> ' +
            '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._exportSelectedPlan(\'' + esc(sid) + '\',\'' + pid + '\',\'json\')">Export JSON</button> ' +
            '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._exportSelectedPlan(\'' + esc(sid) + '\',\'' + pid + '\',\'txt\')">Export TXT</button> ' +
            '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._printSelectedPlan(\'' + esc(sid) + '\',\'' + pid + '\')">Print</button>' +
          '</td></tr>';
      }).join('') +
    '</tbody></table>';
  }
  function renderFinalizedReportViewer(sid, rec) {
    if (!rec) return '<div class="tcc-empty">No finalized report to display.</div>';
    return detailRow('Assessment', esc(rec.sectionTitle || rec.source || '\u2014')) +
      detailRow('Score', (typeof rec.score === 'number' ? rec.score : (typeof rec.good === 'number' ? rec.good : '\u2014')) + ' / ' + (rec.total || '\u2014') + ' (' + fmtPct(rec.percent != null ? rec.percent : rec.pct) + ')') +
      detailRow('Status', esc(rec.resultCategory || '\u2014')) +
      detailRow('Strong areas', fmtList(rec.strongTags)) +
      detailRow('Weak / recovery areas', fmtList(rec.weakTags)) +
      detailRow('Report ID', '<code>' + esc(rec.reportId || rec.id || '') + '</code>') +
      detailRow('Finalized', fmtDate(rec.finalizedAt || rec.timestamp));
  }
  function renderCertificateViewer(sid, rec) {
    if (!rec) return '<div class="tcc-empty">No certificate to display.</div>';
    return detailRow('Certificate type', esc(rec.certificateType || '\u2014')) +
      detailRow('Issuing assessment', esc(rec.sectionTitle || rec.source || '\u2014')) +
      detailRow('Score', (typeof rec.examScore === 'number' ? rec.examScore : '\u2014') + ' / ' + (rec.examTotal || '\u2014') + ' (' + fmtPct(rec.examPercent) + ')') +
      detailRow('Certificate ID', '<code>' + esc(rec.certificateId || rec.reportId || rec.id || '') + '</code>') +
      detailRow('Issued', fmtDate(rec.issuedAt || rec.timestamp));
  }
  // I6H-D14C (Task 12): a COMPLETED ASSESSMENT RESULT — deliberately
  // distinct terminology and fields from the finalized-report viewer.
  // Never claims D10C archive status; explicitly notes when no
  // finalized report exists for this assessment type.
  var ASSESSMENT_RESULT_LABELS = { daily: 'Daily Learning Review', weekly: 'Weekly Progress Test', twoWeek: 'Two-Week Progress Review', monthly: 'Monthly Progress Exam' };
  function renderAssessmentResultViewer(sid, payload) {
    if (!payload || !payload.record) return '<div class="tcc-empty">No assessment result to display.</div>';
    var rec = payload.record; var type = payload.assessmentType;
    return detailRow('Assessment', esc(ASSESSMENT_RESULT_LABELS[type] || rec.sectionTitle || rec.source || '\u2014')) +
      detailRow('Completed', fmtDate(rec.timestamp ? new Date(rec.timestamp).toISOString() : '')) +
      detailRow('Score', (typeof rec.good === 'number' ? rec.good : '\u2014') + ' / ' + (rec.total || '\u2014') + ' (' + fmtPct(rec.pct) + ')') +
      detailRow('Record ID', '<code>' + esc(rec.id || '') + '</code>') +
      detailRow('Note', type === 'monthly'
        ? 'This is the completed assessment result from the Learning Ledger. If a finalized Monthly Report Card has been archived for this month, use Open Finalized Report to view it.'
        : 'This assessment type does not produce a finalized archived report \u2014 this is the completed result itself, from the Learning Ledger.');
  }
  // Task 13: a completed Daily Learning Review is shown even more
  // simply than Weekly/Two-Week/Monthly — it is never archived or
  // certified as a formal report at all.
  function renderDailyResultViewer(sid, payload) {
    if (!payload || !payload.record) return '<div class="tcc-empty">No Daily Learning Review result to display.</div>';
    var rec = payload.record;
    return detailRow('Completed', fmtDate(rec.timestamp ? new Date(rec.timestamp).toISOString() : '')) +
      detailRow('Score', (typeof rec.good === 'number' ? rec.good : '\u2014') + ' / ' + (rec.total || '\u2014') + ' (' + fmtPct(rec.pct) + ')') +
      detailRow('Question count', String(rec.total || '\u2014')) +
      detailRow('Weak / recovery areas', fmtList(rec.weakTags)) +
      detailRow('Retake', 'Available today');
  }
  var VIEWER_RENDERERS = {
    'placement-report': renderPlacementReportViewer,
    'placement-history': renderPlacementHistoryViewer,
    'placement-comparison': renderPlacementComparisonViewer,
    'plan-detail': renderPlanDetailViewer,
    'plan-history': renderPlanHistoryViewer,
    'finalized-report': renderFinalizedReportViewer,
    'certificate': renderCertificateViewer,
    'assessment-result': renderAssessmentResultViewer,
    'daily-result': renderDailyResultViewer
  };
  function renderTeacherDetailViewer(v) {
    var fn = VIEWER_RENDERERS[v.kind];
    var body = fn ? fn(v.studentId, v.data) : '<div class="tcc-empty">Unknown viewer.</div>';
    var profile = readStudentProfile(v.studentId);
    // Task 23: role="dialog", aria-modal="true", aria-labelledby pointing
    // to a stable heading id — not just aria-label, since a visible
    // heading exists.
    return '<div class="tcc-viewer-backdrop" onclick="if(event.target===this)ZirakTeacherCommandCenter._closeViewer()">' +
      '<div class="tcc-viewer" role="dialog" aria-modal="true" aria-labelledby="tcc-viewer-heading" tabindex="-1" id="tcc-viewer-panel" data-tcc-viewer="1">' +
        '<div class="tcc-viewer-head">' +
          '<div><div class="tcc-viewer-title" id="tcc-viewer-heading">' + esc(v.title) + '</div><div class="tcc-viewer-sub">' + esc(profile ? (profile.fullName || v.studentId) : v.studentId) + ' \u00b7 <span class="tcc-tag">' + esc(v.studentId) + '</span></div></div>' +
          '<button type="button" class="tcc-close" onclick="ZirakTeacherCommandCenter._closeViewer()" aria-label="Close" id="tcc-viewer-close-btn">\u2715</button>' +
        '</div>' +
        '<div class="tcc-viewer-body">' + body + '</div>' +
        '<div class="tcc-viewer-footer">' +
          '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._closeViewer()">Close</button>' +
          '<button type="button" class="tcc-btn" onclick="window.print()">Print</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }
  // Task 22: on open, focus the Close button (a stable, always-present
  // actionable control). Called right after the shell (including the
  // viewer) has been written to the DOM.
  function focusViewerOnOpen() {
    try {
      var btn = document.getElementById('tcc-viewer-close-btn');
      if (btn && typeof btn.focus === 'function') btn.focus();
    } catch (e) {}
  }
  // Task 22: Tab / Shift+Tab focus trap — keeps focus cycling only
  // among the viewer's own focusable elements while it is open.
  // Installed ONCE (idempotent), reads the current viewer from `ui`
  // each time it fires so it always traps the CURRENTLY open viewer.
  function focusableElementsIn(container) {
    if (!container || typeof container.querySelectorAll !== 'function') return [];
    var sel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    try { return Array.prototype.slice.call(container.querySelectorAll(sel)).filter(function (el) { return !el.disabled; }); } catch (e) { return []; }
  }
  function trapViewerTabKey(ev) {
    if (!ui.viewer) return;
    if (ev.key !== 'Tab') return;
    var panel = null;
    try { panel = document.getElementById('tcc-viewer-panel'); } catch (e) {}
    if (!panel) return;
    var focusable = focusableElementsIn(panel);
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    var active = null;
    try { active = document.activeElement; } catch (e) {}
    if (ev.shiftKey) {
      if (active === first || focusable.indexOf(active) === -1) { ev.preventDefault(); last.focus(); }
    } else {
      if (active === last) { ev.preventDefault(); first.focus(); }
    }
  }
  // Task 9 (D14B) / Task 22 (D14C): ONE keydown listener, installed
  // once, handling both Escape-to-close and the Tab/Shift+Tab focus
  // trap — never a second global listener.
  function installViewerKeyboard() {
    try {
      if (window.__tccViewerKeyboardInstalled) return;
      if (typeof document.addEventListener === 'function') {
        document.addEventListener('keydown', function (ev) {
          if (!ui.viewer) return;
          if (ev && ev.key === 'Escape') { closeViewer(); return; }
          if (ev && ev.key === 'Tab') { trapViewerTabKey(ev); }
        });
      }
      window.__tccViewerKeyboardInstalled = true;
    } catch (e) {}
  }



  function open(entryTab) {
    requireTeacher(function () {
      installRefreshCoordinator();
      installExtendedRefresh(); // Task 18/19 (D14A)
      installViewerKeyboard(); // Task 9 (D14B): Escape closes the viewer
      hookDeletion();
      snapshotCache = {}; // fresh reads on entry (Task 34)
      ui.activeTab = entryTab || 'overview';
      renderShell();
    });
  }
  function close() {
    // Task 12 (D14A) / Task 37 (D14B): clear all sensitive UI state,
    // the viewer, any status message, AND the cached snapshots before
    // clearing the DOM, so nothing private lingers even in memory
    // between sessions.
    ui.selectedStudentId = ''; ui.search = ''; ui.filter = { class: '', placementStatus: '', planStatus: '', attention: '', recent: '' };
    ui.activeTab = 'overview'; ui.selectedTabSection = 'overview'; ui.sort = 'name';
    ui.viewer = null; ui.status = null;
    snapshotCache = {};
    invalidateTeacherAuth();
    refreshQueue.pendingStudentIds = {}; refreshQueue.fullRefreshRequested = false; refreshQueue.scheduled = false;
    try { var el = mount(); if (el) el.innerHTML = ''; } catch (e) {}
  }
  function expireAndClose() {
    // Task 12 (D14A): full expiry path. Called by the inactivity check
    // when TEACHER_SESSION_MS has elapsed since the last valid teacher
    // interaction. Clears the same private state as close(), then
    // renders a PIN prompt so the teacher can re-authenticate.
    close();
    try { var el = mount(); if (el) el.innerHTML = '<div class="tcc-empty">Teacher session ended (inactivity). Reopen the Command Center to continue.</div>'; } catch (e) {}
  }
  // Task 12 (D14A): inactivity check. Runs cheaply and only while a
  // session actually exists — no continuous expensive work.
  function checkInactivity() {
    if (teacherAuthAt === 0) return; // no active session
    if ((Date.now() - teacherAuthAt) >= TEACHER_SESSION_MS) expireAndClose();
  }
  var _inactivityIntervalHandle = null;
  try { if (typeof setInterval === 'function') _inactivityIntervalHandle = setInterval(checkInactivity, 30 * 1000); } catch (e) {}
  // I6H-D15B (Task 19): explicit, genuine cleanup handle — test
  // harnesses call this before exiting so the process can terminate
  // naturally instead of relying only on process.exit()'s forceful
  // termination of a still-open interval.
  function _stopInactivityInterval() { try { if (_inactivityIntervalHandle !== null) clearInterval(_inactivityIntervalHandle); } catch (e) {} }

  function renderShell() {
    if (!isTeacherAuthorized()) { open(); return; }
    var overview = readInstituteOverviewInternal();
    var el = mount();
    var tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'attention', label: 'Needs Attention' + (overview.needAttention ? ' \u00b7 ' + overview.needAttention : '') },
      { id: 'students', label: 'Students \u00b7 ' + overview.totalStudents },
      { id: 'selected', label: 'Selected Student' + (ui.selectedStudentId ? '' : ' (none)') },
      { id: 'analytics', label: 'Institute Analytics' },
      { id: 'followups', label: 'Teacher Follow-Ups' + (overview.overdueFollowUps ? ' \u00b7 ' + overview.overdueFollowUps + ' overdue' : '') },
      { id: 'reports', label: 'Reports & Exports' }
    ];
    var tabHtml = tabs.map(function (t) { return '<button type="button" class="tcc-tab' + (ui.activeTab === t.id ? ' tcc-tab-active' : '') + '" onclick="ZirakTeacherCommandCenter._setTab(\'' + t.id + '\')">' + esc(t.label) + '</button>'; }).join('');
    var body = '';
    switch (ui.activeTab) {
      case 'overview': body = renderOverviewTab(overview); break;
      case 'attention': body = renderAttentionTab(overview); break;
      case 'students': body = renderStudentsTab(); break;
      case 'selected': body = renderSelectedTab(); break;
      case 'analytics': body = renderAnalyticsTab(overview); break;
      case 'followups': body = renderFollowUpsTab(); break;
      case 'reports': body = renderReportsTab(); break;
    }
    el.innerHTML = '<div class="tcc-shell">' +
      renderStatusBanner() +
      '<div class="tcc-header">' +
        '<div>' +
          '<div class="tcc-title">Teacher Command Center</div>' +
          '<div class="tcc-sub">Student progress, academic guidance and institute overview.</div>' +
        '</div>' +
        '<button type="button" class="tcc-close" onclick="ZirakTeacherCommandCenter.close()" aria-label="Close">\u2715</button>' +
      '</div>' +
      '<div class="tcc-tabs">' + tabHtml + '</div>' +
      '<div class="tcc-body">' + body + '</div>' +
      tccPrivacyNote() +
      (ui.viewer ? renderTeacherDetailViewer(ui.viewer) : '') +
    '</div>';
    if (ui.viewer) focusViewerOnOpen();
  }
  function _setTab(id) { touchTeacherActivity(); ui.activeTab = id; renderShell(); }

  /* ── Overview tab ─────────────────────────────────────────────────── */
  function renderOverviewTab(o) {
    var cards = [
      { label: 'Total students', value: o.totalStudents, key: 'total' },
      { label: 'Accepted level set', value: o.studentsWithAcceptedLevel, key: 'accepted' },
      { label: 'Active plans', value: o.activePlans, key: 'active-plans' },
      { label: 'Paused plans', value: o.pausedPlans, key: 'paused-plans' },
      { label: 'No plan yet', value: o.noPlan, key: 'no-plan' },
      { label: 'Active in last 7 days', value: o.recentActivity7d, key: 'recent-7' },
      { label: 'Needing attention', value: o.needAttention, key: 'attention', highlight: o.needAttention > 0 },
      { label: 'Open follow-ups', value: o.openFollowUps, key: 'followups' },
      { label: 'Overdue follow-ups', value: o.overdueFollowUps, key: 'overdue', highlight: o.overdueFollowUps > 0 },
      { label: 'Achievements issued', value: o.issuedAchievements, key: 'ach' }
    ];
    return '<div class="tcc-card-grid">' +
      cards.map(function (c) { return '<div class="tcc-stat-card' + (c.highlight ? ' tcc-stat-card-highlight' : '') + '"><div class="tcc-stat-value">' + esc(c.value) + '</div><div class="tcc-stat-label">' + esc(c.label) + '</div></div>'; }).join('') +
    '</div>' +
    '<div class="tcc-actions">' +
      '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._setTab(\'students\')">See all students</button>' +
      '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._setTab(\'attention\')">Review needs attention</button>' +
      '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._setTab(\'analytics\')">View analytics</button>' +
    '</div>';
  }

  /* ── Needs Attention tab ─────────────────────────────────────────── */
  function renderAttentionTab(o) {
    var roster = readRoster();
    var rows = [];
    roster.forEach(function (s) {
      var snap = readStudentAcademicSnapshotInternal(s.studentId); if (!snap) return;
      snap.attention.forEach(function (a) { rows.push({ studentId: s.studentId, studentName: s.fullName, item: a }); });
    });
    rows.sort(function (a, b) { return severityWeight(b.item.severity) - severityWeight(a.item.severity); });
    if (!rows.length) return '<div class="tcc-empty">No attention items right now. \ud83c\udf1f</div>';
    return '<div class="tcc-attention-list">' + rows.map(function (r) {
      return '<div class="tcc-att-row tcc-sev-' + r.item.severity.replace(/\s+/g, '').toLowerCase() + '">' +
        '<div class="tcc-att-sev" aria-label="Severity ' + esc(r.item.severity) + '">' + esc(r.item.severity) + '</div>' +
        '<div class="tcc-att-body">' +
          '<div class="tcc-att-title"><b>' + esc(r.studentName) + '</b> \u00b7 ' + esc(r.item.title) + '</div>' +
          '<div class="tcc-att-explain">' + esc(r.item.explanation) + '</div>' +
          '<div class="tcc-att-action"><i>Recommended:</i> ' + esc(r.item.recommendedAction) + '</div>' +
        '</div>' +
        '<div class="tcc-att-buttons">' +
          '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._selectStudent(\'' + esc(r.studentId) + '\')">Open student</button>' +
        '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  /* ── Students tab ────────────────────────────────────────────────── */
  function renderStudentsTab() {
    var roster = readRoster();
    var snapshots = roster.map(function (s) { return readStudentAcademicSnapshotInternal(s.studentId); }).filter(Boolean);
    var q = String(ui.search || '').toLowerCase();
    var f = ui.filter;
    var filtered = snapshots.filter(function (snap) {
      if (q && String(snap.studentName + ' ' + snap.studentId).toLowerCase().indexOf(q) === -1) return false;
      if (f.class && snap.currentLevel !== f.class) return false;
      if (f.placementStatus && snap.placement.status !== f.placementStatus) return false;
      if (f.planStatus && snap.learningPlan.status !== f.planStatus) return false;
      if (f.attention === 'has' && snap.attention.length === 0) return false;
      if (f.attention === 'none' && snap.attention.length > 0) return false;
      if (f.recent === '7' && (snap.activity.lastRealActivityAt ? daysBetween(snap.activity.lastRealActivityAt, nowISO()) > 7 : true)) return false;
      if (f.recent === '30' && (snap.activity.lastRealActivityAt ? daysBetween(snap.activity.lastRealActivityAt, nowISO()) > 30 : true)) return false;
      if (f.recent === 'inactive' && snap.activity.lastRealActivityAt && daysBetween(snap.activity.lastRealActivityAt, nowISO()) <= 30) return false;
      return true;
    });
    var sortFns = {
      'name': function (a, b) { return String(a.studentName).localeCompare(String(b.studentName)); },
      'newest-profile': function (a, b) { return String(b.profileCreatedAt).localeCompare(String(a.profileCreatedAt)); },
      'last-activity': function (a, b) { return String(b.activity.lastRealActivityAt).localeCompare(String(a.activity.lastRealActivityAt)); },
      'attention': function (a, b) { return b.attention.length - a.attention.length; },
      'plan-progress': function (a, b) { return b.learningPlan.progressPercentage - a.learningPlan.progressPercentage; }
    };
    filtered.sort(sortFns[ui.sort] || sortFns.name);

    var filterBar = '<div class="tcc-filter-bar">' +
      '<input type="search" class="tcc-input" placeholder="Search name or ID..." value="' + esc(ui.search) + '" oninput="ZirakTeacherCommandCenter._setSearch(this.value)" />' +
      '<select class="tcc-input" onchange="ZirakTeacherCommandCenter._setFilter(\'class\', this.value)">' +
        '<option value="">Any class</option>' +
        SCHOOL_PATH_CLASSES.map(function (c) { return '<option value="' + c + '"' + (f.class === c ? ' selected' : '') + '>' + esc(schoolPathClassLabel(c)) + '</option>'; }).join('') +
      '</select>' +
      '<select class="tcc-input" onchange="ZirakTeacherCommandCenter._setFilter(\'placementStatus\', this.value)">' +
        '<option value="">Any Placement</option>' +
        '<option value="not-started"' + (f.placementStatus === 'not-started' ? ' selected' : '') + '>Not started</option>' +
        '<option value="in-progress"' + (f.placementStatus === 'in-progress' ? ' selected' : '') + '>In progress</option>' +
        '<option value="completed-not-accepted"' + (f.placementStatus === 'completed-not-accepted' ? ' selected' : '') + '>Completed, not accepted</option>' +
        '<option value="accepted"' + (f.placementStatus === 'accepted' ? ' selected' : '') + '>Accepted</option>' +
        '<option value="pending-retake"' + (f.placementStatus === 'pending-retake' ? ' selected' : '') + '>Pending retake</option>' +
      '</select>' +
      '<select class="tcc-input" onchange="ZirakTeacherCommandCenter._setFilter(\'planStatus\', this.value)">' +
        '<option value="">Any plan status</option>' +
        '<option value="none"' + (f.planStatus === 'none' ? ' selected' : '') + '>No plan</option>' +
        '<option value="active"' + (f.planStatus === 'active' ? ' selected' : '') + '>Active</option>' +
        '<option value="paused"' + (f.planStatus === 'paused' ? ' selected' : '') + '>Paused</option>' +
      '</select>' +
      '<select class="tcc-input" onchange="ZirakTeacherCommandCenter._setFilter(\'attention\', this.value)">' +
        '<option value="">Attention: any</option>' +
        '<option value="has"' + (f.attention === 'has' ? ' selected' : '') + '>Needs attention</option>' +
        '<option value="none"' + (f.attention === 'none' ? ' selected' : '') + '>No attention items</option>' +
      '</select>' +
      '<select class="tcc-input" onchange="ZirakTeacherCommandCenter._setFilter(\'recent\', this.value)">' +
        '<option value="">Recent activity: any</option>' +
        '<option value="7"' + (f.recent === '7' ? ' selected' : '') + '>Active last 7 days</option>' +
        '<option value="30"' + (f.recent === '30' ? ' selected' : '') + '>Active last 30 days</option>' +
        '<option value="inactive"' + (f.recent === 'inactive' ? ' selected' : '') + '>Inactive 30+ days</option>' +
      '</select>' +
      '<select class="tcc-input" onchange="ZirakTeacherCommandCenter._setSort(this.value)">' +
        '<option value="name"' + (ui.sort === 'name' ? ' selected' : '') + '>Sort: Name</option>' +
        '<option value="newest-profile"' + (ui.sort === 'newest-profile' ? ' selected' : '') + '>Newest profile</option>' +
        '<option value="last-activity"' + (ui.sort === 'last-activity' ? ' selected' : '') + '>Last activity</option>' +
        '<option value="attention"' + (ui.sort === 'attention' ? ' selected' : '') + '>Highest attention</option>' +
        '<option value="plan-progress"' + (ui.sort === 'plan-progress' ? ' selected' : '') + '>Plan progress</option>' +
      '</select>' +
    '</div>';

    if (!filtered.length) return filterBar + '<div class="tcc-empty">No students match the current filters.</div>';
    var rows = filtered.map(function (snap) {
      var attInd = snap.attention.length ? '<span class="tcc-att-badge tcc-sev-' + snap.attention[0].severity.replace(/\s+/g, '').toLowerCase() + '">' + snap.attention.length + '</span>' : '';
      return '<div class="tcc-stu-row">' +
        '<div class="tcc-stu-main">' +
          '<div class="tcc-stu-name">' + esc(snap.studentName || snap.studentId) + ' ' + attInd + '</div>' +
          '<div class="tcc-stu-id">' + esc(snap.studentId) + '</div>' +
        '</div>' +
        '<div class="tcc-stu-meta">' +
          '<div><b>Class:</b> ' + esc(snap.currentLevel || '\u2014') + ' <span class="tcc-tag">' + esc(snap.levelSource) + '</span></div>' +
          '<div><b>Placement:</b> ' + esc(snap.placement.status) + '</div>' +
          '<div><b>Plan:</b> ' + esc(snap.learningPlan.status) + (snap.learningPlan.status !== 'none' ? ' \u00b7 Day ' + snap.learningPlan.currentDay + ' \u00b7 ' + snap.learningPlan.progressPercentage + '%' : '') + '</div>' +
          '<div><b>Last activity:</b> ' + esc(snap.activity.lastRealActivityAt ? String(snap.activity.lastRealActivityAt).slice(0, 10) : '\u2014') + '</div>' +
        '</div>' +
        '<div class="tcc-stu-buttons">' +
          '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._selectStudent(\'' + esc(snap.studentId) + '\')">Open</button>' +
        '</div>' +
      '</div>';
    }).join('');
    return filterBar + '<div class="tcc-count-note">' + filtered.length + ' of ' + snapshots.length + ' students</div>' + rows;
  }
  function _setSearch(v) { touchTeacherActivity(); ui.search = v; renderShell(); }
  function _setFilter(k, v) { touchTeacherActivity(); ui.filter[k] = v; renderShell(); }
  function _setSort(v) { touchTeacherActivity(); ui.sort = v; renderShell(); }
  function _selectStudent(sid) { touchTeacherActivity(); ui.selectedStudentId = sid; ui.activeTab = 'selected'; ui.selectedTabSection = 'overview'; renderShell(); }

  /* ── Selected Student tab (Task 14/15) ───────────────────────────── */
  function renderSelectedTab() {
    if (!ui.selectedStudentId) return '<div class="tcc-empty">No student selected. Choose one from the Students tab.</div>';
    var snap = readStudentAcademicSnapshotInternal(ui.selectedStudentId);
    if (!snap) return '<div class="tcc-empty">Student not found.</div>';
    var isActive = activeStudentId() === snap.studentId;
    var subTabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'placement', label: 'Placement & Level' },
      { id: 'plan', label: 'Personalized Plan' },
      { id: 'activity', label: 'Learning Activity' },
      { id: 'assessments', label: 'Assessments' },
      { id: 'skills', label: 'Skills' },
      { id: 'achievements', label: 'Achievements' },
      { id: 'notes', label: 'Teacher Notes' + (snap.teacherNotes.length ? ' \u00b7 ' + snap.teacherNotes.length : '') }
    ];
    var subTabHtml = subTabs.map(function (t) { return '<button type="button" class="tcc-subtab' + (ui.selectedTabSection === t.id ? ' tcc-subtab-active' : '') + '" onclick="ZirakTeacherCommandCenter._setSubTab(\'' + t.id + '\')">' + esc(t.label) + '</button>'; }).join('');
    var section = '';
    switch (ui.selectedTabSection) {
      case 'overview': section = renderSelectedOverview(snap); break;
      case 'placement': section = renderSelectedPlacement(snap); break;
      case 'plan': section = renderSelectedPlan(snap); break;
      case 'activity': section = renderSelectedActivity(snap); break;
      case 'assessments': section = renderSelectedAssessments(snap); break;
      case 'skills': section = renderSelectedSkills(snap); break;
      case 'achievements': section = renderSelectedAchievements(snap); break;
      case 'notes': section = renderSelectedNotes(snap); break;
    }
    return '<div class="tcc-selected">' +
      '<div class="tcc-selected-head">' +
        '<div><b>' + esc(snap.studentName || snap.studentId) + '</b> <span class="tcc-tag">' + esc(snap.studentId) + '</span></div>' +
        (isActive ? '<div class="tcc-tag tcc-tag-active">Currently active student</div>' : '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openAsActive(\'' + esc(snap.studentId) + '\')">Open as Active Student</button>') +
      '</div>' +
      '<div class="tcc-subtabs">' + subTabHtml + '</div>' +
      '<div class="tcc-subsection">' + section + '</div>' +
    '</div>';
  }
  function _setSubTab(id) { touchTeacherActivity(); ui.selectedTabSection = id; renderShell(); }
  function _openAsActive(sid) {
    // I6H-D14D — Task 12: explicit confirmation naming the student,
    // explaining the current session will end, THEN calling the ONE
    // real Teacher activation API with the whitelisted open-home
    // action. Never calls selectStudent/setActive (neither exists).
    var profile = readStudentProfile(sid);
    var studentName = profile ? (profile.fullName || sid) : sid;
    if (!confirm('Open ' + studentName + ' (' + sid + ') as the active student?\n\nThe current student session will end.\n\nContinue?')) return;
    if (!window.ZirakProfile || typeof window.ZirakProfile.activateStudentForTeacher !== 'function') { showActionStatus('error', 'Student activation is not available.'); renderShell(); return; }
    var result = window.ZirakProfile.activateStudentForTeacher(sid, { action: 'open-home' });
    if (!result || !result.ok) { showActionStatus('error', statusTextFor((result && result.reason) || 'activation-failed')); renderShell(); }
    // On success, activateStudentForTeacher triggers a reload itself —
    // there is nothing further to render in this session.
  }

  function renderSelectedOverview(snap) {
    var attHtml = snap.attention.length ? '<div class="tcc-section-title">Attention</div><div class="tcc-attention-list">' + snap.attention.map(function (a) {
      return '<div class="tcc-att-row tcc-sev-' + a.severity.replace(/\s+/g, '').toLowerCase() + '">' +
        '<div class="tcc-att-sev">' + esc(a.severity) + '</div>' +
        '<div class="tcc-att-body"><b>' + esc(a.title) + '</b><div class="tcc-att-explain">' + esc(a.explanation) + '</div></div>' +
      '</div>';
    }).join('') + '</div>' : '';
    var warnHtml = snap.dataWarnings.length ? '<div class="tcc-warning">\u26a0 Data warning \u2014 some records could not be read cleanly: ' + snap.dataWarnings.map(function (w) { return esc(w.area); }).join(', ') + '</div>' : '';
    return warnHtml +
      '<div class="tcc-detail-grid">' +
        '<div><b>Current class:</b> ' + esc(snap.currentLevel || '(not set)') + ' <span class="tcc-tag">' + esc(snap.levelSource) + '</span></div>' +
        '<div><b>Placement:</b> ' + esc(snap.placement.status) + '</div>' +
        '<div><b>Plan:</b> ' + esc(snap.learningPlan.status) + (snap.learningPlan.status !== 'none' ? ' \u00b7 Day ' + snap.learningPlan.currentDay + ' of ' + snap.learningPlan.totalDays : '') + '</div>' +
        '<div><b>Recent learning:</b> ' + snap.activity.recentStudyDays + ' study days, ' + snap.activity.recentScoredActivities + ' scored activities</div>' +
        '<div><b>Strengths:</b> ' + esc(snap.skills.strongestDomains.map(function (d) { return DOMAIN_LABELS[d]; }).join(', ') || '(insufficient evidence)') + '</div>' +
        '<div><b>Support areas:</b> ' + esc(snap.skills.supportDomains.map(function (d) { return DOMAIN_LABELS[d]; }).join(', ') || '(none identified)') + '</div>' +
        '<div><b>Achievements:</b> ' + snap.achievements.issuedCount + '</div>' +
        '<div><b>Open teacher follow-ups:</b> ' + snap.teacherNotes.filter(function (n) { return n.status !== 'Resolved'; }).length + '</div>' +
      '</div>' +
      attHtml +
      renderStudentActionCenter(snap);
  }

  /* ── Task 28 — student action center ─────────────────────────────── */
  function renderStudentActionCenter(snap) {
    return '<div class="tcc-section-title">Actions</div><div class="tcc-actions">' +
      '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._exportStudentTXT(\'' + esc(snap.studentId) + '\')">Export TXT</button>' +
      '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._exportStudentJSON(\'' + esc(snap.studentId) + '\')">Export JSON</button>' +
      '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._copyStudent(\'' + esc(snap.studentId) + '\')">Copy summary</button>' +
      '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._shareStudentWA(\'' + esc(snap.studentId) + '\')">WhatsApp summary</button>' +
      '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._setSubTab(\'notes\')">Add teacher note</button>' +
    '</div>';
  }

  function renderSelectedPlacement(snap) {
    var pending = snap.placement.pendingRetake;
    var latestResultId = snap.placement.latestResultId;
    var hasHistory = snap.placement.historyCount > 0;
    var hasTwoResults = snap.placement.historyCount >= 2;
    return '<div class="tcc-detail-grid">' +
      '<div><b>Accepted class:</b> ' + esc(snap.currentLevel || '(not set)') + '</div>' +
      '<div><b>Level source:</b> ' + esc(snap.levelSource) + '</div>' +
      '<div><b>Accepted date:</b> ' + esc(snap.levelAcceptedAt ? String(snap.levelAcceptedAt).slice(0, 10) : '\u2014') + '</div>' +
      '<div><b>Latest Placement:</b> ' + esc(snap.placement.recommendedLevel || '\u2014') + '</div>' +
      '<div><b>Confidence:</b> ' + esc(snap.placement.confidence || '\u2014') + '</div>' +
      '<div><b>Status:</b> ' + esc(snap.placement.status) + '</div>' +
      '<div><b>Pending retake:</b> ' + (pending ? 'Yes' : 'No') + '</div>' +
      '<div><b>History count:</b> ' + snap.placement.historyCount + '</div>' +
    '</div>' +
    '<div class="tcc-section-title">Actions</div>' +
    '<div class="tcc-actions">' +
      (latestResultId ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openPlacementReport(\'' + esc(snap.studentId) + '\',\'' + esc(latestResultId) + '\')">Open Placement Report</button>' : '') +
      (hasHistory ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openPlacementHistory(\'' + esc(snap.studentId) + '\')">Open Placement History</button>' : '') +
      (pending && latestResultId ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._reviewPending(\'' + esc(snap.studentId) + '\',\'' + esc(latestResultId) + '\')">Review Pending Recommendation</button>' : '') +
      (pending && latestResultId ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._keepExistingLevel(\'' + esc(snap.studentId) + '\',\'' + esc(latestResultId) + '\')">Keep Existing Level</button>' : '') +
      (pending && latestResultId ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._confirmRecommendedLevel(\'' + esc(snap.studentId) + '\',\'' + esc(latestResultId) + '\')">Confirm Recommended Level</button>' : '') +
      (pending && latestResultId ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._selectDifferentLevel(\'' + esc(snap.studentId) + '\',\'' + esc(latestResultId) + '\')">Select Different Level</button>' : '') +
      (hasHistory ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._authorizeRetake(\'' + esc(snap.studentId) + '\')">Authorize Placement Retake</button>' : '') +
      (hasTwoResults ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._viewComparison(\'' + esc(snap.studentId) + '\')">View Comparison</button>' : '') +
    '</div>' +
    '<div class="tcc-note-tag">Interactive Placement Test retakes require the student to be signed in (Open as Active Student).</div>';
  }
  function renderSelectedPlan(snap) {
    if (snap.learningPlan.status === 'none') {
      return '<div class="tcc-empty">No plan yet for this student.</div>' +
        '<div class="tcc-note-tag">Plan generation is triggered from the plan screen once the student is signed in.</div>';
    }
    var paused = snap.learningPlan.paused;
    var hasHistory = snap.learningPlan.historyCount > 0;
    return '<div class="tcc-detail-grid">' +
      '<div><b>Plan ID:</b> <code>' + esc(snap.learningPlan.planId) + '</code></div>' +
      '<div><b>Status:</b> ' + esc(snap.learningPlan.status) + '</div>' +
      '<div><b>Current day:</b> ' + snap.learningPlan.currentDay + ' of ' + snap.learningPlan.totalDays + '</div>' +
      '<div><b>Progress:</b> ' + snap.learningPlan.completedItems + ' of ' + snap.learningPlan.plannedItems + ' (' + snap.learningPlan.progressPercentage + '%)</div>' +
      '<div><b>Last real evidence:</b> ' + esc(snap.learningPlan.lastEvidenceAt ? String(snap.learningPlan.lastEvidenceAt).slice(0, 10) : '\u2014') + '</div>' +
      '<div><b>Plan history:</b> ' + snap.learningPlan.historyCount + ' previous cycles</div>' +
    '</div>' +
    '<div class="tcc-section-title">Actions</div>' +
    '<div class="tcc-actions">' +
      '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openCurrentPlan(\'' + esc(snap.studentId) + '\')">Open Current Plan</button>' +
      (hasHistory ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openPlanHistory(\'' + esc(snap.studentId) + '\')">Open Plan History</button>' : '') +
      (paused
        ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._resumePlan(\'' + esc(snap.studentId) + '\')">Resume Plan</button>'
        : '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._pausePlan(\'' + esc(snap.studentId) + '\')">Pause Plan</button>') +
      '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._regeneratePlan(\'' + esc(snap.studentId) + '\')">Regenerate Plan</button>' +
      '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._exportSelectedPlan(\'' + esc(snap.studentId) + '\',\'\',\'json\')">Export Current Plan (JSON)</button>' +
      '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._exportSelectedPlan(\'' + esc(snap.studentId) + '\',\'\',\'txt\')">Export Current Plan (TXT)</button>' +
      '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._printSelectedPlan(\'' + esc(snap.studentId) + '\',\'\')">Print Current Plan</button>' +
    '</div>' +
    '<div class="tcc-note-tag">Opening Today\u2019s Plan interactively requires Open as Active Student.</div>';
  }
  function renderSelectedActivity(snap) {
    if (!snap.activity.recentRecords.length) return '<div class="tcc-empty">No genuine learning activity recorded yet.</div>';
    return '<div class="tcc-activity-list">' + snap.activity.recentRecords.slice(0, 20).map(function (r) {
      return '<div class="tcc-activity-row">' +
        '<div><b>' + esc(r.sectionTitle || r.source || '(activity)') + '</b> <span class="tcc-tag">' + esc(r.source || '') + '</span></div>' +
        '<div class="tcc-activity-meta">' + esc(r.dateKey || '') + (typeof r.pct === 'number' ? ' \u00b7 ' + r.pct + '% \u00b7 ' + (r.good || 0) + '/' + (r.total || 0) : '') + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }
  function renderSelectedAssessments(snap) {
    var a = snap.assessments;
    var sid = snap.studentId;
    function actionsFor(type, state) {
      var btns = [];
      if (state.ready) {
        btns.push('<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openAssessmentForSelected(\'' + esc(sid) + '\',\'' + type + '\')">Open Assessment</button>');
      }
      if (state.completed) {
        if (state.finalizedReportId) {
          btns.push('<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openFinalizedReport(\'' + esc(sid) + '\',\'' + esc(state.finalizedReportId) + '\')">Open Finalized Report</button>');
        }
        if (state.recordId) {
          btns.push('<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._viewAssessmentResult(\'' + esc(sid) + '\',\'' + type + '\')">View Assessment Result</button>');
        }
        if (state.retakeAvailable) {
          btns.push('<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openAssessmentForSelected(\'' + esc(sid) + '\',\'' + type + '\')">Retake</button>');
        }
      }
      return btns.join('');
    }
    function row(type, label, state) {
      var rangeLabel = state.range ? state.range.label : '';
      return '<tr><td><b>' + esc(label) + '</b>' + (rangeLabel ? '<div class="tcc-activity-meta">' + esc(rangeLabel) + '</div>' : '') + '</td><td>' + esc(state.status) + '</td><td>' + esc(state.reason) + '</td><td>' + actionsFor(type, state) + '</td></tr>';
    }
    return '<table class="tcc-table"><thead><tr><th>Assessment</th><th>Status</th><th>Reason</th><th>Actions</th></tr></thead><tbody>' +
      row('daily', 'Daily Learning Review', a.daily) +
      row('weekly', 'Weekly Progress Test', a.weekly) +
      row('twoWeek', 'Two-Week Progress Review', a.twoWeek) +
      row('monthly', 'Monthly Progress Exam', a.monthly) +
    '</tbody></table>' +
    '<div class="tcc-detail-grid">' +
      '<div><b>Ready now:</b> ' + a.readyCount + ' assessment' + (a.readyCount === 1 ? '' : 's') + '</div>' +
      '<div><b>Latest completed assessment:</b> ' + esc(a.latestCompletedAssessmentAt ? String(a.latestCompletedAssessmentAt).slice(0, 10) : '\u2014') + '</div>' +
    '</div>' +
    '<div class="tcc-note-tag">Readiness uses the real Academy Calendar windows (Saturday\u2013Wednesday study weeks). Only the Monthly Progress Exam produces a finalized archived report; Weekly and Two-Week results are shown as completed assessment results, never as finalized reports. Opening an assessment interactively requires Open as Active Student.</div>';
  }
  function renderSelectedSkills(snap) {
    var rows = Object.keys(snap.skills.byDomain).map(function (d) {
      var s = snap.skills.byDomain[d];
      return '<tr><td>' + esc(s.label) + '</td><td>' + esc(s.category) + '</td><td>' + (s.avgPct === null ? '\u2014' : s.avgPct + '%') + '</td><td>' + s.evidenceCount + '</td><td>' + esc(s.trend || '\u2014') + '</td><td>' + esc(s.confidence) + '</td></tr>';
    }).join('');
    return '<table class="tcc-table"><thead><tr><th>Domain</th><th>Category</th><th>Avg %</th><th>Evidence</th><th>Trend</th><th>Confidence</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }
  function renderSelectedAchievements(snap) {
    var reports = snap.achievements.archivedReports || [];
    var certs = snap.achievements.archivedCertificates || [];
    if (!reports.length && !certs.length) return '<div class="tcc-empty">No finalized reports or issued certificates yet.</div>';
    function reportRow(rep) {
      var id = rep.reportId || rep.stableRecordId || '';
      return '<tr><td>' + esc(rep.monthlyLabel || rep.sectionTitle || 'Monthly Report Card') + '</td>' +
        '<td>' + esc(rep.monthStartDateKey ? (fmtDate(rep.monthStartDateKey) + ' \u2013 ' + fmtDate(rep.monthEndDateKey)) : '\u2014') + '</td>' +
        '<td>' + fmtDate(rep.finalizedAt) + '</td>' +
        '<td><code>' + esc(id) + '</code></td>' +
        '<td>' + (typeof rep.score === 'number' ? (rep.score + '/' + rep.total + ' (' + fmtPct(rep.percent) + ')') : esc(rep.resultCategory || '\u2014')) + '</td>' +
        '<td>' +
          '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openFinalizedReport(\'' + esc(snap.studentId) + '\',\'' + esc(id) + '\')">Open</button> ' +
          '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._printArchivedItem(\'' + esc(snap.studentId) + '\',\'report\',\'' + esc(id) + '\')">Print</button> ' +
          '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._exportArchivedItem(\'' + esc(snap.studentId) + '\',\'report\',\'' + esc(id) + '\')">Export JSON</button>' +
        '</td></tr>';
    }
    function certRow(cert) {
      var id = cert.certificateId || cert.reportId || '';
      return '<tr><td>' + esc(cert.certificateType || cert.sectionTitle || 'Certificate') + '</td>' +
        '<td>' + esc(cert.monthStartDateKey ? (fmtDate(cert.monthStartDateKey) + ' \u2013 ' + fmtDate(cert.monthEndDateKey)) : '\u2014') + '</td>' +
        '<td>' + fmtDate(cert.issuedAt || cert.timestamp) + '</td>' +
        '<td><code>' + esc(id) + '</code></td>' +
        '<td>' + (typeof cert.examScore === 'number' ? (cert.examScore + '/' + cert.examTotal + ' (' + fmtPct(cert.examPercent) + ')') : '\u2014') + '</td>' +
        '<td>' +
          '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._openAchievement(\'' + esc(snap.studentId) + '\',\'' + esc(id) + '\')">Open</button> ' +
          '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._printArchivedItem(\'' + esc(snap.studentId) + '\',\'certificate\',\'' + esc(id) + '\')">Print</button> ' +
          '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._exportArchivedItem(\'' + esc(snap.studentId) + '\',\'certificate\',\'' + esc(id) + '\')">Export JSON</button>' +
        '</td></tr>';
    }
    return '<div class="tcc-detail-grid">' +
      '<div><b>Archived report count:</b> ' + reports.length + '</div>' +
      '<div><b>Certificate count:</b> ' + certs.length + '</div>' +
      '<div><b>Total archive items:</b> ' + (reports.length + certs.length) + '</div>' +
    '</div>' +
    '<div class="tcc-section-title">Finalized Academic Reports</div>' +
    (reports.length
      ? '<table class="tcc-table"><thead><tr><th>Title</th><th>Academic period</th><th>Finalized</th><th>Report ID</th><th>Score / Status</th><th>Actions</th></tr></thead><tbody>' + reports.map(reportRow).join('') + '</tbody></table>'
      : '<div class="tcc-empty">No finalized reports yet.</div>') +
    '<div class="tcc-section-title">Issued Certificates and Awards</div>' +
    (certs.length
      ? '<table class="tcc-table"><thead><tr><th>Title</th><th>Academic period</th><th>Issued</th><th>Certificate ID</th><th>Score</th><th>Actions</th></tr></thead><tbody>' + certs.map(certRow).join('') + '</tbody></table>'
      : '<div class="tcc-empty">No certificates issued yet.</div>');
  }
  function renderSelectedNotes(snap) {
    var notesHtml = snap.teacherNotes.length ? snap.teacherNotes.map(function (n) {
      return '<div class="tcc-note-row tcc-note-' + esc(n.status).toLowerCase().replace(/\s+/g, '') + '">' +
        '<div><b>' + esc(n.category) + '</b> \u00b7 ' + esc(n.status) + (n.followUpAt ? ' \u00b7 due ' + esc(String(n.followUpAt).slice(0, 10)) : '') + '</div>' +
        '<div class="tcc-note-text">' + esc(n.text) + '</div>' +
        '<div class="tcc-actions">' +
          (n.status !== 'Resolved' ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._resolveNote(\'' + esc(snap.studentId) + '\',\'' + esc(n.noteId) + '\')">Resolve</button>' : '') +
          '<button type="button" class="tcc-btn tcc-btn-mini tcc-btn-danger" onclick="ZirakTeacherCommandCenter._deleteNote(\'' + esc(snap.studentId) + '\',\'' + esc(n.noteId) + '\')">Delete</button>' +
        '</div>' +
      '</div>';
    }).join('') : '<div class="tcc-empty">No teacher notes yet.</div>';
    var form = '<div class="tcc-note-form">' +
      '<div class="tcc-section-title">Add note</div>' +
      '<select class="tcc-input" id="tcc-note-cat">' + NOTE_CATEGORIES.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') + '</select>' +
      '<textarea class="tcc-input" id="tcc-note-text" rows="3" placeholder="Note text..."></textarea>' +
      '<input type="date" class="tcc-input" id="tcc-note-date" />' +
      '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._addNote(\'' + esc(snap.studentId) + '\')">Save note</button>' +
    '</div>';
    return notesHtml + form;
  }
  function _addNote(sid) {
    var cat = (document.getElementById('tcc-note-cat') || {}).value || 'General';
    var text = (document.getElementById('tcc-note-text') || {}).value || '';
    var date = (document.getElementById('tcc-note-date') || {}).value || '';
    if (!text.trim()) return;
    addTeacherNote(sid, { category: cat, text: text, followUpAt: date, status: date ? 'Follow Up' : 'Open' });
    renderShell();
  }
  function _resolveNote(sid, nid) { updateTeacherNote(sid, nid, { status: 'Resolved' }); renderShell(); }
  function _deleteNote(sid, nid) {
    if (!confirm('Delete this teacher note? This cannot be undone.')) return;
    deleteTeacherNote(sid, nid); renderShell();
  }
  function _exportStudentTXT(sid) { exportStudentSummary(sid, 'txt'); }
  function _exportStudentJSON(sid) { exportStudentSummary(sid, 'json'); }
  function _copyStudent(sid) { copyStudentSummary(sid); }
  function _shareStudentWA(sid) { shareStudentSummaryWA(sid); }

  /* ══════════════════════════════════════════════════════════════════
     Task 22 (D14B) — every selected-student action wrapper below USES
     its returned result. On success: opens the Teacher Detail Viewer
     (Task 9) with the real returned record. On failure: shows a status
     message naming the exact reason (Task 21) — never a silent
     unchanged rerender.
     ══════════════════════════════════════════════════════════════════ */
  function _openPlacementReport(sid, resultId) {
    var r = openSelectedPlacementReport(sid, resultId);
    if (r && r.ok) { openViewer('placement-report', 'Placement Report', sid, r.record); }
    else { showActionStatus('error', statusTextFor(r && r.reason)); }
    renderShell();
  }
  function _openPlacementHistory(sid) {
    var r = openSelectedPlacementHistory(sid);
    if (r && r.ok) { openViewer('placement-history', 'Placement History', sid, r.history); }
    else { showActionStatus('error', statusTextFor(r && r.reason)); }
    renderShell();
  }
  function _reviewPending(sid, resultId) {
    var r = openSelectedPlacementReport(sid, resultId);
    if (r && r.ok) { openViewer('placement-report', 'Review Pending Recommendation', sid, r.record); }
    else { showActionStatus('error', statusTextFor(r && r.reason)); }
    renderShell();
  }
  function _keepExistingLevel(sid, resultId) {
    if (!confirm('Resolve the pending Placement recommendation by keeping the current accepted level?')) { showActionStatus('info', 'Action cancelled.'); renderShell(); return; }
    var r = keepExistingLevelForSelected(sid, resultId, '');
    if (r && r.ok) showActionStatus('success', 'Kept the existing level. The pending recommendation is now resolved.');
    else showActionStatus('error', statusTextFor(r && r.reason));
    renderShell();
  }
  function _confirmRecommendedLevel(sid, resultId) {
    if (!confirm('Confirm the Placement recommendation as the student\u2019s new accepted class?')) { showActionStatus('info', 'Action cancelled.'); renderShell(); return; }
    var r = confirmRecommendationForSelected(sid, resultId, '');
    if (r && r.ok) showActionStatus('success', 'Recommendation confirmed. The accepted class has been updated.');
    else showActionStatus('error', statusTextFor(r && r.reason));
    renderShell();
  }
  function _selectDifferentLevel(sid, resultId) {
    var classId = '';
    try { classId = prompt('Enter the class ID to select for this student (e.g. beginner, elementary, intermediate):', '') || ''; } catch (e) {}
    if (!classId) { showActionStatus('info', 'Action cancelled.'); renderShell(); return; }
    if (!confirm('Select "' + classId + '" as this student\u2019s new accepted class?')) { showActionStatus('info', 'Action cancelled.'); renderShell(); return; }
    var r = selectDifferentLevelForSelected(sid, resultId, classId, '');
    if (r && r.ok) showActionStatus('success', 'Selected a different level. The accepted class has been updated.');
    else showActionStatus('error', statusTextFor(r && r.reason));
    renderShell();
  }
  function _authorizeRetake(sid) {
    if (!confirm('Authorize a Placement retake for this student?')) { showActionStatus('info', 'Action cancelled.'); renderShell(); return; }
    var r = authorizeRetakeForSelected(sid, 'Teacher-authorized retake');
    if (r && r.ok) showActionStatus('success', 'Placement retake authorized. The student can retake the Placement Test when next active.');
    else showActionStatus('error', statusTextFor(r && r.reason));
    renderShell();
  }
  function _viewComparison(sid) {
    var r = openSelectedPlacementHistory(sid);
    if (r && r.ok && r.history && r.history.length >= 2) { openViewer('placement-comparison', 'Compare Placement Results', sid, r.history.slice(0, 2)); }
    else if (r && r.ok) { showActionStatus('info', 'Not enough Placement results to compare yet.'); }
    else { showActionStatus('error', statusTextFor(r && r.reason)); }
    renderShell();
  }
  // I6H-D14C (Task 15/16): the real UI dispatcher for "Open Assessment".
  // Never silently activates the selected student — shows a real
  // confirmation naming the student and the assessment, and only
  // activates + opens the assessment after explicit confirmation.
  // I6H-D14D — Task 14: the ONE assessment-type → whitelisted handoff
  // action map. No other file duplicates this mapping.
  var ASSESSMENT_HANDOFF_ACTIONS = { daily: 'open-daily-review', weekly: 'open-weekly-test', twoWeek: 'open-two-week-review', monthly: 'open-monthly-exam' };
  function _openAssessmentForSelected(sid, assessmentType) {
    var r = openSelectedAssessment(sid, assessmentType);
    if (!r || !r.ok) { showActionStatus('error', statusTextFor(r && r.reason)); renderShell(); return; }
    var profile = readStudentProfile(sid);
    var studentName = profile ? (profile.fullName || sid) : sid;
    var handoffAction = ASSESSMENT_HANDOFF_ACTIONS[assessmentType];
    if (!handoffAction) { showActionStatus('error', 'Unrecognized assessment type.'); renderShell(); return; }
    var activeId = activeStudentId();
    if (activeId === sid) {
      // I6H-D14D — Task 13: even when the selected student IS already
      // active, the assessment is opened through the SAME whitelisted
      // handoff+reload path (no direct start*() call from the Teacher
      // dashboard) — this guarantees there is exactly one launch path,
      // and that readiness is always re-checked post-reload against
      // the real current session.
      _beginAssessmentHandoff(sid, handoffAction);
      return;
    }
    // Task 16: real confirmation workflow naming the student and the
    // exact assessment. Cancel changes nothing.
    var confirmed = confirm(
      'This assessment must be opened as the active student.\n\n' +
      'Student: ' + studentName + '\n' +
      'Assessment: ' + r.assessmentTitle + '\n\n' +
      'Open Student as Active and Continue?'
    );
    if (!confirmed) { showActionStatus('info', 'Action cancelled. ' + studentName + ' was not activated.'); renderShell(); return; }
    _beginAssessmentHandoff(sid, handoffAction);
  }
  // I6H-D14D — Task 4/5/13: the ONE call site that ever hands control
  // to a student session for an assessment. Clears Teacher private
  // state, then calls the real Profile activation API — which itself
  // writes the handoff, activates the real session, and reloads. The
  // assessment function is NEVER called directly from this module.
  function _beginAssessmentHandoff(sid, handoffAction) {
    ui.viewer = null; ui.status = null;
    invalidateSnapshot(sid);
    if (!window.ZirakProfile || typeof window.ZirakProfile.activateStudentForTeacher !== 'function') { showActionStatus('error', 'Student activation is not available.'); renderShell(); return; }
    var result = window.ZirakProfile.activateStudentForTeacher(sid, { action: handoffAction });
    if (!result || !result.ok) { showActionStatus('error', statusTextFor((result && result.reason) || 'activation-failed')); renderShell(); }
    // On success, a reload is already underway — nothing further to render.
  }

  function _openCurrentPlan(sid) {
    var r = openSelectedPlan(sid, '');
    if (r && r.ok) { openViewer('plan-detail', 'Current Plan', sid, r.plan); }
    else { showActionStatus('error', statusTextFor(r && r.reason)); }
    renderShell();
  }
  function _openPlanHistory(sid) {
    var history = null;
    try { history = window.ZirakLearningPlan && window.ZirakLearningPlan.getPlanHistory ? window.ZirakLearningPlan.getPlanHistory(sid) : []; } catch (e) { history = []; }
    openViewer('plan-history', 'Plan History', sid, history || []);
    showActionStatus('success', (history && history.length ? history.length : 0) + ' previous plan cycle(s) found.');
    renderShell();
  }
  // Task 18 (D14C): View Details for a SPECIFIC historical cycle — does
  // NOT automatically open the active plan; uses the exact planId the
  // teacher selected from the Plan History table.
  function _openPlanCycleDetail(sid, planId) {
    var r = openSelectedPlan(sid, planId);
    if (r && r.ok) { openViewer('plan-detail', 'Plan Cycle Detail', sid, r.plan); }
    else { showActionStatus('error', statusTextFor(r && r.reason)); }
    renderShell();
  }
  function _exportSelectedPlan(sid, planId, format) {
    var r = exportSelectedPlan(sid, planId || '', format);
    if (r && r.ok) showActionStatus('success', (planId ? 'Historical plan cycle' : 'Current plan') + ' exported.');
    else showActionStatus('error', statusTextFor(r && r.reason));
    renderShell();
  }
  function _printSelectedPlan(sid, planId) {
    var r = exportSelectedPlan(sid, planId || '', 'print');
    if (!r || !r.ok) { showActionStatus('error', statusTextFor(r && r.reason)); renderShell(); return; }
    var html = buildPlanPrintHTML(r.payload);
    openPrintWindow('ZIRAK — Plan Export', html);
    renderShell();
  }
  function _pausePlan(sid) {
    var r = pauseSelectedPlan(sid);
    if (r && r.ok) showActionStatus('success', 'Plan paused.');
    else showActionStatus('error', statusTextFor(r && r.reason));
    renderShell();
  }
  function _resumePlan(sid) {
    var r = resumeSelectedPlan(sid);
    if (r && r.ok) showActionStatus('success', 'Plan resumed.');
    else showActionStatus('error', statusTextFor(r && r.reason));
    renderShell();
  }
  function _regeneratePlan(sid) {
    if (!confirm('Regenerate this student\u2019s Personalized Learning Plan? The current plan will be archived to plan history.')) { showActionStatus('info', 'Action cancelled.'); renderShell(); return; }
    var r = regenerateSelectedPlan(sid);
    if (r && r.ok) showActionStatus('success', 'Plan regenerated. A new cycle has started; the previous plan is in Plan History.');
    else showActionStatus('error', statusTextFor(r && r.reason));
    renderShell();
  }
  function _openFinalizedReport(sid, reportId) {
    var r = openSelectedFinalizedReport(sid, reportId);
    if (r && r.ok) { openViewer('finalized-report', 'Finalized Report', sid, r.record); }
    else { showActionStatus('error', statusTextFor(r && r.reason)); }
    renderShell();
  }
  // Task 12 (D14C): "View Assessment Result" — a completed Ledger
  // record, explicitly NOT presented as a finalized archived report.
  function _viewAssessmentResult(sid, assessmentType) {
    var r = openSelectedAssessmentResult(sid, assessmentType);
    if (r && r.ok) {
      var kind = assessmentType === 'daily' ? 'daily-result' : 'assessment-result';
      var title = assessmentType === 'daily' ? 'Daily Learning Review Result' : (ASSESSMENT_RESULT_LABELS[assessmentType] || 'Assessment') + ' Result';
      openViewer(kind, title, sid, r);
    } else { showActionStatus('error', statusTextFor(r && r.reason)); }
    renderShell();
  }
  function _openAchievement(sid, achId) {
    var r = openSelectedAchievement(sid, achId);
    if (r && r.ok) { openViewer(r.kind === 'certificate' ? 'certificate' : 'finalized-report', r.kind === 'certificate' ? 'Certificate' : 'Finalized Report', sid, r.record); }
    else { showActionStatus('error', statusTextFor(r && r.reason)); }
    renderShell();
  }
  // Task 20/21 (D14C): Print and Export JSON for an archived item —
  // works for both 'report' and 'certificate' kinds, reading only from
  // the real Achievement Archive.
  function _fetchArchivedItem(sid, kind, itemId) {
    var v = validateSelectedStudent(sid); if (!v.ok) return null;
    if (kind === 'report') {
      return (window.ZirakAchievementCenter && window.ZirakAchievementCenter.getArchivedReportFor) ? window.ZirakAchievementCenter.getArchivedReportFor(sid, itemId) : null;
    }
    return (window.ZirakAchievementCenter && window.ZirakAchievementCenter.getArchivedCertificateFor) ? window.ZirakAchievementCenter.getArchivedCertificateFor(sid, itemId) : null;
  }
  function _printArchivedItem(sid, kind, itemId) {
    if (!isTeacherAuthorized()) { showActionStatus('error', statusTextFor('not-authorized')); renderShell(); return; }
    touchTeacherActivity();
    var item = _fetchArchivedItem(sid, kind, itemId);
    if (!item) { showActionStatus('error', statusTextFor(kind === 'report' ? 'report-not-found-for-student' : 'achievement-not-found-for-student')); renderShell(); return; }
    var html = kind === 'report' ? buildArchivedReportPrintHTML(item) : buildArchivedCertificatePrintHTML(item);
    openPrintWindow('ZIRAK — ' + (kind === 'report' ? 'Finalized Report' : 'Certificate'), html);
    renderShell();
  }
  function _exportArchivedItem(sid, kind, itemId) {
    if (!isTeacherAuthorized()) { showActionStatus('error', statusTextFor('not-authorized')); renderShell(); return; }
    touchTeacherActivity();
    var item = _fetchArchivedItem(sid, kind, itemId);
    if (!item) { showActionStatus('error', statusTextFor(kind === 'report' ? 'report-not-found-for-student' : 'achievement-not-found-for-student')); renderShell(); return; }
    try {
      var content = JSON.stringify(item, null, 2);
      var blob = new Blob([content], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = 'zirak-' + kind + '-' + sid + '-' + (itemId || 'item') + '.json';
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
      showActionStatus('success', (kind === 'report' ? 'Report' : 'Certificate') + ' exported.');
    } catch (e) { showActionStatus('error', 'Export failed.'); }
    renderShell();
  }


  /* ── Analytics tab ────────────────────────────────────────────────── */
  function bar(label, value, max) {
    var pct = max ? Math.round((value / max) * 100) : 0;
    return '<div class="tcc-bar-row"><div class="tcc-bar-label">' + esc(label) + '</div><div class="tcc-bar-track"><div class="tcc-bar-fill" style="width:' + pct + '%"></div></div><div class="tcc-bar-value">' + esc(value) + '</div></div>';
  }
  function renderAnalyticsTab(o) {
    function maxOf(obj) { return Math.max(1, Math.max.apply(null, Object.keys(obj).map(function (k) { return obj[k]; }))); }
    return '<div class="tcc-section-title">Accepted class distribution (7 School Path classes)</div>' +
      SCHOOL_PATH_CLASSES.concat(['none']).map(function (c) { return bar(c === 'none' ? 'None' : schoolPathClassLabel(c), o.classDistribution[c] || 0, maxOf(o.classDistribution)); }).join('') +
      '<div class="tcc-section-title">Placement status distribution (uses 8 diagnostic bands\u2019 outcomes but shown by decision status)</div>' +
      Object.keys(o.placementDistribution).map(function (k) { return bar(k, o.placementDistribution[k], maxOf(o.placementDistribution)); }).join('') +
      '<div class="tcc-section-title">Plan status distribution</div>' +
      Object.keys(o.planDistribution).map(function (k) { return bar(k, o.planDistribution[k], maxOf(o.planDistribution)); }).join('') +
      '<div class="tcc-section-title">Recent activity windows</div>' +
      bar('Last 7 days', o.recentActivity7d, o.totalStudents) +
      bar('Last 14 days', o.recentActivity14d, o.totalStudents) +
      bar('Last 30 days', o.recentActivity30d, o.totalStudents) +
      '<div class="tcc-section-title">Support-domain distribution</div>' +
      Object.keys(o.supportDomainDistribution).map(function (k) { return bar(DOMAIN_LABELS[k] || k, o.supportDomainDistribution[k], Math.max(1, o.totalStudents)); }).join('') +
      '<div class="tcc-section-title">Teacher follow-ups</div>' +
      '<div class="tcc-card-grid">' +
        '<div class="tcc-stat-card"><div class="tcc-stat-value">' + o.openFollowUps + '</div><div class="tcc-stat-label">Open</div></div>' +
        '<div class="tcc-stat-card"><div class="tcc-stat-value">' + o.dueTodayFollowUps + '</div><div class="tcc-stat-label">Due today</div></div>' +
        '<div class="tcc-stat-card' + (o.overdueFollowUps ? ' tcc-stat-card-highlight' : '') + '"><div class="tcc-stat-value">' + o.overdueFollowUps + '</div><div class="tcc-stat-label">Overdue</div></div>' +
        '<div class="tcc-stat-card"><div class="tcc-stat-value">' + o.resolvedFollowUps + '</div><div class="tcc-stat-label">Resolved</div></div>' +
      '</div>' +
      '<div class="tcc-note-tag">These charts are computed live from real records; the seven accepted School Path classes are used for the class chart; the eight Placement diagnostic bands remain a separate concern (see Placement report per-student).</div>';
  }

  /* ── Follow-Ups tab ──────────────────────────────────────────────── */
  function renderFollowUpsTab() {
    var q = getFollowUpQueueInternal();
    function section(title, rows) {
      if (!rows.length) return '<div class="tcc-section-title">' + esc(title) + '</div><div class="tcc-empty">None</div>';
      return '<div class="tcc-section-title">' + esc(title) + ' (' + rows.length + ')</div>' +
        rows.map(function (r) {
          return '<div class="tcc-note-row">' +
            '<div><b>' + esc(r.studentName) + '</b> \u00b7 ' + esc(r.note.category) + (r.note.followUpAt ? ' \u00b7 ' + esc(String(r.note.followUpAt).slice(0, 10)) : '') + '</div>' +
            '<div class="tcc-note-text">' + esc(r.note.text) + '</div>' +
            '<div class="tcc-actions">' +
              '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._selectStudent(\'' + esc(r.studentId) + '\')">Open student</button>' +
              (r.note.status !== 'Resolved' ? '<button type="button" class="tcc-btn tcc-btn-mini" onclick="ZirakTeacherCommandCenter._resolveNote(\'' + esc(r.studentId) + '\',\'' + esc(r.note.noteId) + '\')">Mark resolved</button>' : '') +
            '</div>' +
          '</div>';
        }).join('');
    }
    return section('Overdue', q.overdue) + section('Due today', q.dueToday) + section('Upcoming', q.upcoming) + section('No date', q.noDate) + section('Resolved', q.resolved);
  }

  /* ── Reports & Exports tab ───────────────────────────────────────── */
  function renderReportsTab() {
    return '<div class="tcc-section-title">Institute overview export</div>' +
      '<div class="tcc-actions">' +
        '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._exportInst(\'json\')">Export JSON</button>' +
        '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._exportInst(\'csv\')">Export CSV</button>' +
        '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._exportInst(\'txt\')">Export TXT</button>' +
        '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._printInstitute()">Print / Save as PDF</button>' +
      '</div>' +
      '<div class="tcc-section-title">Selected student export</div>' +
      // Task 22 (D14A): the duplicate "Selected Student JSON" button that
      // D14 shipped here was removed — the full 5-action set (Print, JSON,
      // TXT, Copy, WhatsApp) lives on the selected-student action center.
      // This tab only offers a convenience Print entry for the selected
      // student, not a duplicate of the same 5 buttons.
      (ui.selectedStudentId
        ? '<div class="tcc-actions">' +
          '<button type="button" class="tcc-btn" onclick="ZirakTeacherCommandCenter._printStudent(\'' + esc(ui.selectedStudentId) + '\')">Print / Save Selected Student as PDF</button>' +
        '</div>'
        : '<div class="tcc-empty">Select a student first from the Students tab.</div>');
  }
  function _exportInst(kind) { exportInstitute(kind); }
  function _printInstitute() {
    if (!isTeacherAuthorized()) return;
    touchTeacherActivity();
    var overview = readInstituteOverviewInternal();
    var html = buildInstitutePrintHTML(overview);
    openPrintWindow('ZIRAK — Institute Overview', html);
  }
  function _printStudent(sid) {
    if (!isTeacherAuthorized()) return;
    touchTeacherActivity();
    var v = validateSelectedStudent(sid); if (!v.ok) return;
    var snap = readStudentAcademicSnapshotInternal(sid); if (!snap) return;
    var html = buildStudentPrintHTML(snap);
    openPrintWindow('ZIRAK — Student Academic Summary', html);
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 23 (D14A) — Print / Save as PDF. Opens a small print window
     with the student's academic summary or the institute overview.
     Selected student only for the student version. Includes: clear
     institute heading, generated date, current accepted class,
     Placement status, plan status, REAL readiness, skill evidence,
     achievements, teacher follow-ups. Includes NO buttons, NO PIN, NO
     raw storage keys, NO other student data. Uses the browser's native
     print dialog — no second report archive.
     ══════════════════════════════════════════════════════════════════ */
  function printCSS() {
    return '<style>' +
      'body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1a2030;padding:32px;line-height:1.5;max-width:840px;margin:0 auto;}' +
      'h1{font-size:20px;margin:0 0 4px;}' +
      'h2{font-size:14px;margin:18px 0 6px;text-transform:uppercase;letter-spacing:.5px;color:#6b7280;border-bottom:1px solid #d8d2c4;padding-bottom:2px;}' +
      '.sub{font-size:12px;color:#6b7280;margin-bottom:16px;}' +
      'table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px;}' +
      'th,td{padding:4px 6px;border-bottom:1px solid #eee;text-align:left;vertical-align:top;}' +
      'th{background:#faf6ec;font-weight:700;}' +
      '.footer{margin-top:24px;font-size:11px;color:#6b7280;text-align:center;border-top:1px dashed #d8d2c4;padding-top:8px;}' +
      '@media print{body{padding:24px;} @page{margin:16mm;}}' +
    '</style>';
  }
  function buildStudentPrintHTML(snap) {
    var rows = [];
    rows.push(['Current class', esc(snap.currentLevel || '(not set)') + ' <span style="color:#6b7280">(source: ' + esc(snap.levelSource) + ')</span>']);
    if (snap.placement && snap.placement.status) rows.push(['Placement status', esc(snap.placement.status) + (snap.placement.confidence ? ' \u00b7 confidence: ' + esc(snap.placement.confidence) : '')]);
    rows.push(['Personalized Learning Plan', esc(snap.learningPlan.status) + (snap.learningPlan.status !== 'none' ? ' \u00b7 Day ' + snap.learningPlan.currentDay + ' of ' + snap.learningPlan.totalDays + ' \u00b7 ' + snap.learningPlan.progressPercentage + '%' : '')]);
    rows.push(['Recent learning', snap.activity.recentStudyDays + ' study days, ' + snap.activity.recentScoredActivities + ' scored activities']);
    if (snap.activity.lastRealActivityAt) rows.push(['Last real activity', esc(String(snap.activity.lastRealActivityAt).slice(0, 10))]);
    var a = snap.assessments;
    rows.push(['Assessment readiness', 'Daily: <b>' + esc(a.daily.status) + '</b> \u00b7 Weekly: <b>' + esc(a.weekly.status) + '</b> \u00b7 Two-Week: <b>' + esc(a.twoWeek.status) + '</b> \u00b7 Monthly: <b>' + esc(a.monthly.status) + '</b> \u00b7 Ready now: <b>' + a.readyCount + '</b>']);
    rows.push(['Skill strengths', esc(snap.skills.strongestDomains.map(function (d) { return DOMAIN_LABELS[d]; }).join(', ') || '(insufficient evidence)')]);
    rows.push(['Support areas', esc(snap.skills.supportDomains.map(function (d) { return DOMAIN_LABELS[d]; }).join(', ') || '(none identified)')]);
    rows.push(['Achievements issued', String(snap.achievements.issuedCount)]);
    var openFU = (snap.teacherNotes || []).filter(function (n) { return n.status !== 'Resolved'; }).length;
    rows.push(['Open teacher follow-ups', String(openFU)]);
    return '<!doctype html><html><head><title>ZIRAK Student Summary</title>' + printCSS() + '</head><body>' +
      '<h1>ZIRAK English Language Academy</h1>' +
      '<div class="sub">Student Academic Summary \u00b7 generated ' + esc(String(snap.generatedAt).slice(0, 19).replace('T', ' ')) + '</div>' +
      '<h2>' + esc(snap.studentName || snap.studentId) + ' <span style="color:#6b7280;font-weight:normal;font-size:13px;"> \u00b7 ' + esc(snap.studentId) + '</span></h2>' +
      '<table>' + rows.map(function (r) { return '<tr><th style="width:30%">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>' +
      '<div class="footer">This summary is generated from locally stored ZIRAK academic records on this device.</div>' +
    '</body></html>';
  }
  function buildPlanPrintHTML(payload) {
    if (!payload) return '<!doctype html><html><body>No plan to print.</body></html>';
    var rows = [
      ['Student ID', esc(payload.studentId)],
      ['Plan ID', esc(payload.planId)],
      ['Status', esc(payload.status) + (payload.archived ? ' (archived / historical cycle)' : ' (current)')],
      ['Level', esc(payload.level)],
      ['Source', esc(payload.planSource)],
      ['Cycle reason', esc(payload.cycleReason)],
      ['Progress', payload.completedItems + ' of ' + payload.plannedItems + ' (' + payload.progressPercentage + '%)'],
      ['Day', payload.currentDay + ' of ' + payload.totalDays],
      ['Created', fmtDate(payload.createdAt)]
    ];
    if (payload.archivedAt) rows.push(['Archived', fmtDate(payload.archivedAt)]);
    return '<!doctype html><html><head><title>ZIRAK Plan Export</title>' + printCSS() + '</head><body>' +
      '<h1>ZIRAK English Language Academy</h1>' +
      '<div class="sub">Personalized Learning Plan Export \u00b7 generated ' + esc(String(payload.generatedAt).slice(0, 19).replace('T', ' ')) + '</div>' +
      '<table>' + rows.map(function (r) { return '<tr><th style="width:30%">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>' +
      '<div class="footer">This export is generated from locally stored ZIRAK plan records on this device.</div>' +
    '</body></html>';
  }
  function buildArchivedReportPrintHTML(rep) {
    var rows = [
      ['Title', esc(rep.monthlyLabel || rep.sectionTitle || 'Monthly Report Card')],
      ['Academic period', esc(rep.monthStartDateKey ? (fmtDate(rep.monthStartDateKey) + ' \u2013 ' + fmtDate(rep.monthEndDateKey)) : '\u2014')],
      ['Score', typeof rep.score === 'number' ? (rep.score + ' / ' + rep.total + ' (' + fmtPct(rep.percent) + ')') : '\u2014'],
      ['Status', esc(rep.resultCategory || '\u2014')],
      ['Report ID', '<code>' + esc(rep.reportId || rep.stableRecordId || '') + '</code>'],
      ['Finalized', fmtDate(rep.finalizedAt)]
    ];
    return '<!doctype html><html><head><title>ZIRAK Finalized Report</title>' + printCSS() + '</head><body>' +
      '<h1>ZIRAK English Language Academy</h1>' +
      '<div class="sub">Finalized Academic Report</div>' +
      '<table>' + rows.map(function (r) { return '<tr><th style="width:30%">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>' +
      '<div class="footer">This report is generated from the locally stored ZIRAK Achievement Archive on this device.</div>' +
    '</body></html>';
  }
  function buildArchivedCertificatePrintHTML(cert) {
    var rows = [
      ['Certificate type', esc(cert.certificateType || '\u2014')],
      ['Issuing assessment', esc(cert.sectionTitle || cert.source || '\u2014')],
      ['Score', typeof cert.examScore === 'number' ? (cert.examScore + ' / ' + cert.examTotal + ' (' + fmtPct(cert.examPercent) + ')') : '\u2014'],
      ['Certificate ID', '<code>' + esc(cert.certificateId || cert.reportId || '') + '</code>'],
      ['Issued', fmtDate(cert.issuedAt || cert.timestamp)]
    ];
    return '<!doctype html><html><head><title>ZIRAK Certificate</title>' + printCSS() + '</head><body>' +
      '<h1>ZIRAK English Language Academy</h1>' +
      '<div class="sub">Issued Certificate</div>' +
      '<table>' + rows.map(function (r) { return '<tr><th style="width:30%">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table>' +
      '<div class="footer">This certificate is generated from the locally stored ZIRAK Achievement Archive on this device.</div>' +
    '</body></html>';
  }
  function buildInstitutePrintHTML(o) {
    var classRows = SCHOOL_PATH_CLASSES.concat(['none']).map(function (c) { return '<tr><td>' + esc(c === 'none' ? 'None' : schoolPathClassLabel(c)) + '</td><td>' + (o.classDistribution[c] || 0) + '</td></tr>'; }).join('');
    return '<!doctype html><html><head><title>ZIRAK Institute Overview</title>' + printCSS() + '</head><body>' +
      '<h1>ZIRAK English Language Academy</h1>' +
      '<div class="sub">Institute Overview \u00b7 generated ' + esc(String(o.generatedAt).slice(0, 19).replace('T', ' ')) + '</div>' +
      '<h2>Summary</h2>' +
      '<table><tr><th>Total students</th><td>' + o.totalStudents + '</td></tr>' +
      '<tr><th>Accepted level set</th><td>' + o.studentsWithAcceptedLevel + '</td></tr>' +
      '<tr><th>Awaiting Placement decision</th><td>' + o.studentsAwaitingPlacementDecision + '</td></tr>' +
      '<tr><th>Active plans</th><td>' + o.activePlans + '</td></tr>' +
      '<tr><th>Paused plans</th><td>' + o.pausedPlans + '</td></tr>' +
      '<tr><th>Students with no plan</th><td>' + o.noPlan + '</td></tr>' +
      '<tr><th>Active in last 7 days</th><td>' + o.recentActivity7d + '</td></tr>' +
      '<tr><th>Needing attention</th><td>' + o.needAttention + '</td></tr>' +
      '<tr><th>Assessments Ready (institute total)</th><td>' + (o.assessmentsReady || 0) + '</td></tr>' +
      '<tr><th>Open follow-ups</th><td>' + o.openFollowUps + '</td></tr>' +
      '<tr><th>Overdue follow-ups</th><td>' + o.overdueFollowUps + '</td></tr>' +
      '<tr><th>Achievements issued</th><td>' + o.issuedAchievements + '</td></tr></table>' +
      '<h2>Class distribution (7 School Path classes)</h2>' +
      '<table><tr><th>Class</th><th>Count</th></tr>' + classRows + '</table>' +
      '<div class="footer">This overview is generated from locally stored ZIRAK academic records on this device.</div>' +
    '</body></html>';
  }
  function openPrintWindow(title, html) {
    try {
      var w = window.open('', '_blank', 'width=920,height=700');
      if (!w) return; // popup blocked
      w.document.write(html);
      w.document.close();
      setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 200);
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     PUBLIC API (Task 41 — selecting != activating; Open as Active is
     the ONLY function that may change the active student, and requires
     confirmation).
     ══════════════════════════════════════════════════════════════════ */
  window.ZirakTeacherCommandCenter = {
    version: TCC_VERSION, schemaVersion: TCC_SCHEMA_VERSION,
    open: open, close: close,
    readStudentAcademicSnapshot: readStudentAcademicSnapshot,
    readInstituteOverview: readInstituteOverview,
    readStudentAssessmentState: readStudentAssessmentState, // Task 8 (D14B): authorized wrapper
    getStudentAttentionItems: getStudentAttentionItems,
    getFollowUpQueue: getFollowUpQueue,
    addTeacherNote: addTeacherNote, updateTeacherNote: updateTeacherNote, deleteTeacherNote: deleteTeacherNote,
    exportStudentSummary: exportStudentSummary, copyStudentSummary: copyStudentSummary, shareStudentSummaryWA: shareStudentSummaryWA,
    exportInstitute: exportInstitute, buildInstituteCSV: buildInstituteCSV, buildStudentSummaryText: buildStudentSummaryText,
    // Task 5 (D14A) / Task 12 (D14B): safe selected-student adapters.
    // Each validates Teacher authorization, selected-student existence,
    // and record ownership; each uses the SELECTED student's explicit
    // ID. Placement decisions now delegate to ZirakPlacementEngine.
    openSelectedPlacementReport: openSelectedPlacementReport,
    openSelectedPlacementHistory: openSelectedPlacementHistory,
    reviewSelectedPlacementDecision: reviewSelectedPlacementDecision,
    keepExistingLevelForSelected: keepExistingLevelForSelected,
    confirmRecommendationForSelected: confirmRecommendationForSelected,
    selectDifferentLevelForSelected: selectDifferentLevelForSelected,
    authorizeRetakeForSelected: authorizeRetakeForSelected,
    openSelectedPlan: openSelectedPlan,
    pauseSelectedPlan: pauseSelectedPlan,
    resumeSelectedPlan: resumeSelectedPlan,
    regenerateSelectedPlan: regenerateSelectedPlan,
    openSelectedAssessment: openSelectedAssessment,
    openSelectedAssessmentResult: openSelectedAssessmentResult, // Task 12/13 (D14C)
    openSelectedFinalizedReport: openSelectedFinalizedReport, // Task 17/18 (D14B)
    openSelectedAchievement: openSelectedAchievement, // Task 19 (D14B)
    listSelectedArchivedReports: listSelectedArchivedReports,
    listSelectedArchivedCertificates: listSelectedArchivedCertificates,
    exportSelectedPlan: exportSelectedPlan, // Task 17 (D14C)
    // Task 15/16 (D14A):
    listCorruptBackupsFor: listCorruptBackupsFor,
    invalidateSnapshot: invalidateSnapshot, isTeacherAuthorized: isTeacherAuthorized,
    installRefreshCoordinator: installRefreshCoordinator, hookDeletion: hookDeletion,
    onDeleteStudent: onDeleteStudent,
    _onRefresh: function (studentId) { queueRefresh(studentId || null); },
    _setTab: _setTab, _setSubTab: _setSubTab, _setSearch: _setSearch, _setFilter: _setFilter, _setSort: _setSort,
    _selectStudent: _selectStudent, _openAsActive: _openAsActive,
    _addNote: _addNote, _resolveNote: _resolveNote, _deleteNote: _deleteNote,
    _exportStudentTXT: _exportStudentTXT, _exportStudentJSON: _exportStudentJSON, _copyStudent: _copyStudent, _shareStudentWA: _shareStudentWA,
    _exportInst: _exportInst,
    // Task 22 (D14B): every dead wrapper now uses its returned result —
    // see the function bodies for the viewer-open / status-message path.
    _openPlacementReport: _openPlacementReport, _openPlacementHistory: _openPlacementHistory,
    _reviewPending: _reviewPending, _keepExistingLevel: _keepExistingLevel,
    _confirmRecommendedLevel: _confirmRecommendedLevel, _selectDifferentLevel: _selectDifferentLevel,
    _authorizeRetake: _authorizeRetake, _viewComparison: _viewComparison,
    _openCurrentPlan: _openCurrentPlan, _openPlanHistory: _openPlanHistory,
    _openPlanCycleDetail: _openPlanCycleDetail, // Task 18 (D14C)
    _exportSelectedPlan: _exportSelectedPlan, _printSelectedPlan: _printSelectedPlan, // Task 17 (D14C)
    _pausePlan: _pausePlan, _resumePlan: _resumePlan, _regeneratePlan: _regeneratePlan,
    _openFinalizedReport: _openFinalizedReport, _openAchievement: _openAchievement,
    _viewAssessmentResult: _viewAssessmentResult, // Task 12 (D14C)
    _openAssessmentForSelected: _openAssessmentForSelected, // Task 15/16 (D14C)
    _printArchivedItem: _printArchivedItem, _exportArchivedItem: _exportArchivedItem, // Task 20/21 (D14C)
    _printStudent: _printStudent, _printInstitute: _printInstitute,
    // Task 9 (D14B): Teacher Detail Viewer dispatchers.
    _closeViewer: closeViewer,
    _test: {
      SCHOOL_PATH_CLASSES: SCHOOL_PATH_CLASSES, PLACEMENT_BANDS: PLACEMENT_BANDS,
      CORE_DOMAINS: CORE_DOMAINS, MIN_SCORED_RESULTS_FOR_WEAK: MIN_SCORED_RESULTS_FOR_WEAK,
      INACTIVITY_FOLLOWUP_DAYS: INACTIVITY_FOLLOWUP_DAYS, INACTIVITY_IMPORTANT_DAYS: INACTIVITY_IMPORTANT_DAYS,
      TEACHER_SESSION_MS: TEACHER_SESSION_MS,
      // I6H-D15B (Task 19): genuine interval cleanup for test harnesses.
      stopInactivityInterval: _stopInactivityInterval,
      studentKey: studentKey, legacyStudentKey: legacyStudentKey,
      readStudentJSON: readStudentJSON, readLedgerRecordsFor: readLedgerRecordsFor, readTeacherNotes: readTeacherNotes, writeTeacherNotes: writeTeacherNotes,
      readAcceptedLevel: readAcceptedLevel, readPlacementHistory: readPlacementHistory,
      isGenuineLearningRecord: isGenuineLearningRecord, isScoredRecord: isScoredRecord,
      computeSkillProfile: computeSkillProfile, computeAttentionItems: computeAttentionItems,
      ledgerRecordDomain: ledgerRecordDomain, csvEscape: csvEscape,
      touchTeacherAuth: touchTeacherAuth, touchTeacherActivity: touchTeacherActivity, invalidateTeacherAuth: invalidateTeacherAuth,
      // Task 13 (D14A):
      todayLocalDateKey: todayLocalDateKey, normalizeLocalDateKey: normalizeLocalDateKey, compareLocalDateKeys: compareLocalDateKeys,
      // Task 15 (D14A):
      preserveCorruptBackup: preserveCorruptBackup, corruptBackupKey: corruptBackupKey,
      // Task 8 (D14B):
      readStudentAssessmentStateInternal: readStudentAssessmentStateInternal,
      // Task 10 (D14A) — internal readers for harness assertions:
      readStudentAcademicSnapshotInternal: readStudentAcademicSnapshotInternal,
      readInstituteOverviewInternal: readInstituteOverviewInternal,
      getFollowUpQueueInternal: getFollowUpQueueInternal,
      buildStudentSummaryTextInternal: buildStudentSummaryTextInternal,
      buildInstituteCSVInternal: buildInstituteCSVInternal,
      // Task 18/19 (D14A) / Task 23/24 (D14B):
      emitRefreshEvent: emitRefreshEvent, installExtendedRefresh: installExtendedRefresh,
      queueRefresh: queueRefresh, refreshQueue: function () { return refreshQueue; },
      flushRefreshQueueSync: function () {
        // Test-only: force the coalesced runner to execute NOW rather
        // than waiting for the microtask tick, so synchronous test
        // assertions can observe the post-refresh state deterministically.
        if (!refreshQueue.scheduled) return;
        refreshQueue.scheduled = false;
        var studentIds = Object.keys(refreshQueue.pendingStudentIds);
        var full = refreshQueue.fullRefreshRequested;
        refreshQueue.pendingStudentIds = {}; refreshQueue.fullRefreshRequested = false;
        if (!isTeacherAuthorized()) return;
        if (full || (ui.selectedStudentId && studentIds.indexOf(ui.selectedStudentId) > -1) || studentIds.length === 0) { try { renderShell(); } catch (e) {} }
      },
      // For inactivity tests:
      _forceAuthAt: function (ts) { teacherAuthAt = ts; },
      _checkInactivity: checkInactivity,
      snapshotCache: function () { return snapshotCache; },
      // Task 9 (D14B) / Task 22 (D14C): viewer/status/focus test helpers.
      getViewerState: function () { return ui.viewer; },
      getStatusState: function () { return ui.status; },
      renderTeacherDetailViewer: renderTeacherDetailViewer,
      focusableElementsIn: focusableElementsIn,
      trapViewerTabKey: trapViewerTabKey,
      focusViewerOnOpen: focusViewerOnOpen,
      buildPlanExportPayload: buildPlanExportPayload
    }
  };
  // Install the refresh coordinator and deletion hook lazily. Both are
  // idempotent, so it's safe to call again from open().
  try { installRefreshCoordinator(); } catch (e) {}
  try { installExtendedRefresh(); } catch (e) {}
  try { hookDeletion(); } catch (e) {}
  // I6H-D14D — Task 19: register close() as the Teacher-dashboard
  // cleaner the Profile module calls before every handoff activation.
  try { if (window.ZirakProfile && typeof window.ZirakProfile.registerTeacherDashboardCleaner === 'function') window.ZirakProfile.registerTeacherDashboardCleaner(close); } catch (e) {}
})();
