/* =====================================================================
   ZIRAK ENGLISH LANGUAGE ACADEMY — Profile Foundation
   ځيرک د انګليسي ژبي اکاډمي
   ---------------------------------------------------------------------
   PHASE 1: Student Profile Login + Teacher Lock + Resume Foundation
   ---------------------------------------------------------------------
   This module is ADDITIVE. It does not rewrite any existing engine.
   It adds, on top of the existing app:
     - Academy identity constants
     - A device-local multi-student roster (localStorage, system namespace)
     - A local login screen (Student ID + PIN, or tap-a-card)
     - A Teacher PIN lock (default 1234, changeable) protecting sensitive areas
     - An admission form (add/edit student), teacher-gated
     - A student dashboard / resume card on Home
     - A small Resume engine (lastPage / currentMonth-week-day / etc.)
     - A minimal teacher-only roster export/import (for moving devices)

   STORAGE MODEL (single engine = localStorage; no duplicate engine):
     - SYSTEM / device-global keys use a fixed prefix  'roshan_sys_'
       (roster, teacher PIN, ID sequence). These are NOT per-student.
     - PER-STUDENT learning data flows through the app's existing
       load()/save() helpers, which the index.html bootstrap now
       namespaces as  'roshan_' + 'u_<studentId>_' + key  while a
       student is logged in. So the whole existing app automatically
       becomes per-student WITHOUT editing any call site.

   IMPORTANT: This module is loaded LAST (after app.js), so it can
   safely wrap navigate() and openSettings(). The tiny bootstrap that
   sets the storage namespace lives in index.html and runs BEFORE app.js.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- Academy identity ---------- */
  var ACAD = window.ZIRAK_ACADEMY = {
    nameEn: 'ZIRAK ENGLISH LANGUAGE ACADEMY',
    namePs: 'ځيرک د انګليسي ژبي اکاډمي',
    idPrefix: 'ZELA',            // ZELA-YYYY-0001
    version: 'v1.17I6H-D12 · Adaptive Placement'
  };

  var LS_BASE = 'roshan_';       // must match `const LS` in app.js
  var SYS     = 'roshan_sys_';   // device-global system namespace

  // PHASE: Teaching Display & Voice Professionalization Fix — Part 5
  // Ensures the personalized Home welcome is spoken only ONCE per page
  // load/login (renderDashboard() itself is called many times during a
  // session — after block-complete, auto-advance, chip updates, etc.).
  var _zkWelcomeSpoken = false;
  // PHASE I4: fire the scroll-to-current-block guide once per page load
  // (the welcome flag controls TTS; this controls the one-time auto-scroll).
  var _zkHomeGuided = false;

  /* ====================================================================
     STABILIZATION PASS — STORAGE NAMESPACE HELPER
     ---------------------------------------------------------------------
     window.ZirakStorageKey(key, opts)
       Returns the FULL localStorage key a direct-storage call site should
       use, applying the SAME namespace rule as app.js's load()/save():
         - if a student is logged in AND opts.global is not true
             -> 'u_<studentId>_' + key          (per-student, isolated)
         - otherwise (no student logged in, or opts.global === true)
             -> key, unchanged                  (global / legacy behaviour)

     NOTE: these direct-storage keys (e.g. 'zirak_error_bank') were never
     prefixed with 'roshan_' to begin with, so we do not add it here —
     we only add the 'u_<studentId>_' segment, keeping each key inside
     its own existing key family while still making it unique per student.

     This is NOT a second storage engine. It reuses window.__zirakNS()
     (the exact same function app.js's load()/save() already call) so
     there is one single source of truth for "what namespace are we in
     right now". Call sites that used to do:
         localStorage.getItem('zirak_error_bank')
     become:
         localStorage.getItem(window.ZirakStorageKey('zirak_error_bank'))
     and nothing else about them changes — same JSON shape, same engine,
     same localStorage. Device-global keys (teacher PIN, roster, API
     keys, app config) simply pass {global:true} and are left exactly
     as before.
     ==================================================================== */
  window.ZirakStorageKey = function (key, opts) {
    opts = opts || {};
    if (opts.global) return key;
    var ns = (typeof window.__zirakNS === 'function') ? window.__zirakNS() : '';
    return ns ? (ns + key) : key;
  };

  /* ====================================================================
     SYSTEM STORAGE HELPERS (device-global; bypass per-student namespace)
     ==================================================================== */
  function sysGet(k){ try { return localStorage.getItem(SYS + k); } catch(e){ return null; } }
  function sysSet(k,v){ try { localStorage.setItem(SYS + k, v); } catch(e){} }

  function getRoster(){ try { return JSON.parse(sysGet('students') || '[]'); } catch(e){ return []; } }
  function saveRoster(arr){ sysSet('students', JSON.stringify(arr || [])); }
  function upsertStudent(s){
    var r = getRoster();
    var i = r.findIndex(function(x){ return x.studentId === s.studentId; });
    if (i >= 0) r[i] = s; else r.push(s);
    saveRoster(r);
  }
  /* ==================================================================
     I6H-D11B WORKSTREAM B — SAFE STUDENT-DATA ENUMERATION + RESET/DELETE
     ONE controlled implementation used by every caller (Teacher Tools,
     Danger Zone, legacy removeStudent). Never blindly clears localStorage.
     ================================================================== */
  // Both real per-student prefixes in this app:
  //   'roshan_u_<id>_...'  — app.js load()/save() namespaced keys
  //   'u_<id>_...'         — ZirakStorageKey-namespaced direct keys
  //                          (zirak_error_bank, zirak_confidence, word SRS,
  //                          learning ledger, achievement archive, etc.)
  // Device-global families that must NEVER be touched here:
  //   'roshan_sys_*' (roster, Teacher PIN, ID sequence) and any key not
  //   carrying this student's id segment.
  function getStudentStorageKeys(studentId){
    var out = [];
    if (!studentId) return out;
    var p1 = LS_BASE + 'u_' + studentId + '_';   // roshan_u_<id>_
    var p2 = 'u_' + studentId + '_';             // u_<id>_
    try {
      for (var i=0; i<localStorage.length; i++){
        var k = localStorage.key(i);
        if (!k) continue;
        if (k.indexOf(SYS) === 0) continue;                 // device-global — excluded
        if (k.indexOf(p1) === 0 || k.indexOf(p2) === 0) out.push(k);
      }
    } catch(e){}
    // Deduplicate (defensive; localStorage keys are unique anyway).
    return out.filter(function(k, idx){ return out.indexOf(k) === idx; });
  }

  function exportStudentData(studentId){
    var s = getRoster().map(normalize).find(function(x){ return x.studentId === studentId; });
    if (!s) { toast('Student not found.'); return null; }
    var keys = getStudentStorageKeys(studentId);
    var data = {};
    keys.forEach(function(k){ try { data[k] = localStorage.getItem(k); } catch(e){} });
    var backup = {
      app: 'ZIRAK-ELA',
      kind: 'student-backup',
      backupSchemaVersion: 1,
      appVersion: (window.ZIRAK_ACADEMY && window.ZIRAK_ACADEMY.version) || '',
      exportedAt: new Date().toISOString(),
      studentId: s.studentId,
      studentName: s.fullName || '',
      profile: s,                 // roster snapshot (identity + contact + progress fields)
      storage: data               // ONLY this student's keys — never Teacher PIN / other students
    };
    var safeId = String(studentId).replace(/[^A-Za-z0-9_-]+/g, '-');
    var blob = new Blob([JSON.stringify(backup, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'zirak-student-backup-' + safeId + '-' + todayISO() + '.json';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 1500);
    toast('Backup downloaded (' + keys.length + ' records).');
    return backup;
  }


  function importStudentData(studentId, backup, options){
    options = options || {};
    var roster = getRoster();
    var idx = roster.findIndex(function(x){ return x.studentId === studentId; });
    if (idx < 0) return {ok:false, reason:'student-not-found'};
    if (!backup || backup.app !== 'ZIRAK-ELA' || backup.kind !== 'student-backup' || backup.backupSchemaVersion !== 1) return {ok:false, reason:'invalid-backup-envelope'};
    if (backup.studentId !== studentId || !backup.storage || typeof backup.storage !== 'object' || Array.isArray(backup.storage)) return {ok:false, reason:'student-or-storage-mismatch'};

    var p1 = LS_BASE + 'u_' + studentId + '_';
    var p2 = 'u_' + studentId + '_';
    var accepted = {}, rejected = 0, corruptDialogue = 0;
    Object.keys(backup.storage).sort().forEach(function(k){
      var safe = k.indexOf(SYS) !== 0 && (k.indexOf(p1) === 0 || k.indexOf(p2) === 0);
      if (!safe) { rejected++; return; }
      var value = backup.storage[k];
      if (value === null || typeof value === 'undefined') return;
      // D19 active progress must be parseable before it is restored. Historical
      // corruption backups remain diagnostic strings and are not promoted into
      // active progress by this check.
      if (k.indexOf('_d19_dialogue_') !== -1 && k.indexOf('_d19_dialogue_corrupt_backup_') === -1) {
        try {
          var parsed = JSON.parse(String(value));
          if (!parsed || parsed.schemaVersion !== 'dialogue-progress-d19-v1' || parsed.studentId !== studentId || !parsed.dialogueId) throw new Error('invalid-dialogue-progress');
        } catch(e) { corruptDialogue++; rejected++; return; }
      }
      accepted[k] = String(value);
    });

    if (options.replaceExisting !== false) getStudentStorageKeys(studentId).forEach(function(k){ try { localStorage.removeItem(k); } catch(e){} });
    var restored = 0;
    Object.keys(accepted).forEach(function(k){ try { localStorage.setItem(k, accepted[k]); restored++; } catch(e){} });

    if (backup.profile && backup.profile.studentId === studentId) {
      var restoredProfile = normalize(backup.profile);
      restoredProfile.studentId = studentId;
      roster[idx] = restoredProfile;
      saveRoster(roster);
    }
    try { if (window.ZirakLearningPlan && window.ZirakLearningPlan.onRestoreStudent) window.ZirakLearningPlan.onRestoreStudent(studentId); } catch(e){}
    if (currentStudentId() === studentId) { try { renderDashboard(); } catch(e){} }
    return {ok:true, restored:restored, rejected:rejected, corruptDialogueRecordsRejected:corruptDialogue};
  }

  function importStudentDataPrompt(studentId){
    requireTeacher(function(){
      var input = document.createElement('input');
      input.type = 'file'; input.accept = '.json,application/json'; input.style.display = 'none';
      input.onchange = function(){
        var file = input.files && input.files[0];
        if (!file) { input.remove(); return; }
        var reader = new FileReader();
        reader.onload = function(){
          try {
            var backup = JSON.parse(String(reader.result || ''));
            if (!window.confirm('Restore this student backup? Current progress for this student will be replaced.')) { input.remove(); return; }
            var result = importStudentData(studentId, backup, {replaceExisting:true});
            if (!result.ok) toast('Restore blocked: ' + result.reason);
            else toast('Backup restored (' + result.restored + ' records; ' + result.rejected + ' rejected).');
          } catch(e) { toast('The selected backup is not valid JSON.'); }
          input.remove();
        };
        reader.onerror = function(){ toast('The backup file could not be read.'); input.remove(); };
        reader.readAsText(file);
      };
      document.body.appendChild(input); input.click();
    });
  }

  // Level-related namespaced keys preserved when "Keep current accepted level".
  var LEVEL_KEYS = ['placement_accepted','placement_result','placement_date',
    'placement_suggested_class','school_placement_level','school_class',
    'school_unit','school_started','lp_start_level'];

  function resetStudentProgress(studentId, options){
    options = options || {};
    var roster = getRoster();
    var idx = roster.findIndex(function(x){ return x.studentId === studentId; });
    if (idx < 0) return { removed: 0 };
    var s = normalize(roster[idx]);

    // 1) Optionally capture level keys before the wipe.
    var kept = {};
    if (options.keepLevel !== false) {
      LEVEL_KEYS.forEach(function(base){
        [LS_BASE + 'u_' + studentId + '_' + base, 'u_' + studentId + '_' + base].forEach(function(full){
          try { var v = localStorage.getItem(full); if (v !== null) kept[full] = v; } catch(e){}
        });
      });
    }

    // 2) Remove every student-specific key (both prefixes).
    var keys = getStudentStorageKeys(studentId);
    keys.forEach(function(k){ try { localStorage.removeItem(k); } catch(e){} });

    // 3) Restore preserved level keys.
    Object.keys(kept).forEach(function(k){ try { localStorage.setItem(k, kept[k]); } catch(e){} });

    // 4) Reset the profile's PROGRESS fields — identity, contact, enrollment
    //    metadata, roster position, notes and status all stay.
    var b = blankStudent();
    ['currentMonth','currentWeek','currentDay','lastPage','lastActivity',
     'lastItemIndex','lastUpdated','progressSummary','certificateStatus',
     'resultStatus','currentClassDayId','completedClassBlocks',
     'classPathStartedAt','classPathUpdatedAt','attendanceCount',
     'lastAttendanceDate','totalClassMinutes','arcadeGate'
    ].forEach(function(f){ s[f] = b[f]; });
    if (options.keepLevel === false) s.level = '';
    roster[idx] = s; saveRoster(roster);

    // I6H-D13: regenerate a fresh Personalized Learning Plan from
    // whatever accepted-level evidence this reset retained (typeof-
    // guarded, optional — never required by the reset itself).
    try { if (window.ZirakLearningPlan && window.ZirakLearningPlan.onResetStudentProgress) window.ZirakLearningPlan.onResetStudentProgress(studentId); } catch(e){}

    if (currentStudentId() === studentId) { try { renderDashboard(); } catch(e){} }
    return { removed: keys.length, keptLevel: options.keepLevel !== false };
  }

  function deleteStudentCompletely(studentId){
    var keys = getStudentStorageKeys(studentId);
    keys.forEach(function(k){ try { localStorage.removeItem(k); } catch(e){} });
    // I6H-D13: explicit, defensive cleanup of every plan key (the sweep
    // above already covers the 'u_<id>_personal_learning_plan*' prefix,
    // since getStudentStorageKeys() matches by student id; this call is
    // a documented no-op safety net, not a second deletion path).
    try { if (window.ZirakLearningPlan && window.ZirakLearningPlan.onDeleteStudent) window.ZirakLearningPlan.onDeleteStudent(studentId); } catch(e){}
    saveRoster(getRoster().filter(function(x){ return x.studentId !== studentId; }));
    // Task 21: invalidate a pending handoff ONLY if it targets the
    // student being deleted — never remove a handoff for another
    // valid student.
    try {
      var pendingHo = _readTeacherHandoffRaw();
      if (pendingHo && pendingHo.targetStudentId === studentId) _removeTeacherHandoff();
    } catch (e) {}
    var wasActive = currentStudentId() === studentId;
    if (wasActive){
      // Log out safely and return to profile selection.
      try { sessionStorage.removeItem('zirak_session'); } catch(e){}
      setTimeout(function(){ location.reload(); }, 400);
    }
    return { removed: keys.length, wasActive: wasActive };
  }

  // Legacy alias — kept so nothing else breaks; SAME single implementation.
  function removeStudent(id){ deleteStudentCompletely(id); }

  /* ====================================================================
     TEACHER LOCK (session-scoped; auto-relocks on logout / page close)
     ==================================================================== */
  function getTeacherPin(){ return (sysGet('teacher_pin') || '1234'); }
  function setTeacherPin(p){ sysSet('teacher_pin', String(p)); }
  function teacherUnlocked(){ try { return sessionStorage.getItem('zirak_teacher') === '1'; } catch(e){ return false; } }
  function setTeacherUnlocked(v){
    try { if (v) sessionStorage.setItem('zirak_teacher','1'); else sessionStorage.removeItem('zirak_teacher'); } catch(e){}
    updateChip();
  }
  // Gate any sensitive action behind the teacher PIN.
  function requireTeacher(onOk){
    if (teacherUnlocked()) { if (onOk) onOk(); return; }
    promptPin({
      title: 'Teacher PIN required',
      sub: 'یوازې ښوونکی — Teacher access',
      verify: function(v){ return v === getTeacherPin(); },
      onOk: function(){ setTeacherUnlocked(true); if (onOk) onOk(); }
    });
  }

  /* ====================================================================
     SESSION (who is using the device right now)
     ==================================================================== */
  function sessionRaw(){ try { return sessionStorage.getItem('zirak_session') || ''; } catch(e){ return ''; } }
  function currentStudentId(){ var s = sessionRaw(); return s.indexOf('student:') === 0 ? s.slice(8) : ''; }
  function currentStudent(){
    var id = currentStudentId(); if (!id) return null;
    return getRoster().find(function(x){ return x.studentId === id; }) || null;
  }
  function isPreview(){ return sessionRaw() === 'preview'; }

  function loginStudent(id){ activateStudentSession(id, { source: 'student-login' }); }
  function loginPreview(){ try { sessionStorage.setItem('zirak_session','preview'); } catch(e){} location.reload(); }
  function logout(){ try { sessionStorage.removeItem('zirak_session'); sessionStorage.removeItem('zirak_teacher'); } catch(e){} location.reload(); }

  /* ══════════════════════════════════════════════════════════════════
     I6H-D14D — Task 7/8/9: one-time Teacher-to-student handoff record.
     Centralized schema, whitelist, and expiry. Never stores function
     source, arbitrary callback names, PINs, answers, mic data, or
     private academic snapshots — only a whitelisted action keyword and
     small serializable args.
     ══════════════════════════════════════════════════════════════════ */
  var TEACHER_HANDOFF_KEY = 'zirak_teacher_handoff';
  var TEACHER_HANDOFF_TTL_MS = 2 * 60 * 1000; // Task 9: 2 minutes
  var TEACHER_HANDOFF_ACTIONS = [
    'open-home', 'open-daily-review', 'open-weekly-test', 'open-two-week-review',
    'open-monthly-exam', 'open-placement', 'open-placement-retake',
    'open-todays-plan', 'open-school-path', 'open-assessments-progress'
  ];
  function _handoffId() { return 'ho-' + Date.now() + '-' + Math.floor(Math.random() * 1e6); }
  function _writeTeacherHandoff(spec) {
    if (!spec || !spec.targetStudentId || !spec.action) return { ok: false, reason: 'invalid-handoff-spec' };
    if (TEACHER_HANDOFF_ACTIONS.indexOf(spec.action) === -1) return { ok: false, reason: 'action-not-whitelisted' };
    var now = Date.now();
    var record = {
      schemaVersion: 1,
      handoffId: _handoffId(),
      targetStudentId: spec.targetStudentId,
      action: spec.action,
      args: (spec.args && typeof spec.args === 'object') ? spec.args : {},
      createdAt: now,
      expiresAt: now + TEACHER_HANDOFF_TTL_MS,
      source: 'teacher-command-center',
      consumed: false
    };
    // Task 23: only one pending handoff may exist — a new valid handoff
    // always replaces (never merges with) an older one.
    try { sessionStorage.setItem(TEACHER_HANDOFF_KEY, JSON.stringify(record)); } catch (e) { return { ok: false, reason: 'storage-unavailable' }; }
    return { ok: true, handoffId: record.handoffId };
  }
  function _readTeacherHandoffRaw() {
    try { var raw = sessionStorage.getItem(TEACHER_HANDOFF_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function _removeTeacherHandoff() { try { sessionStorage.removeItem(TEACHER_HANDOFF_KEY); } catch (e) {} }
  // Task 24: read-only, Teacher-authorized accessor.
  function getPendingTeacherHandoff() {
    if (!teacherUnlocked()) return null;
    return _readTeacherHandoffRaw();
  }

  /* ══════════════════════════════════════════════════════════════════
     I6H-D14D — Task 4: the ONE real Profile session-mutation core.
     Both normal student-PIN login (loginStudent above) and the
     Teacher-authorized handoff (activateStudentForTeacher below) share
     this exact function — there is no second session-writing formula
     anywhere in the app.
     ══════════════════════════════════════════════════════════════════ */
  function activateStudentSession(studentId, options) {
    options = options || {};
    // Verify the student exists in the real roster before writing anything.
    var s = getRoster().find(function (x) { return x.studentId === studentId; });
    if (!s) return { ok: false, reason: 'student-not-found' };
    // Safely end the former session's transient state (Task 17/18):
    // cancel stray speech, close any open Placement/Interview Wizard
    // session, and clear the FORMER student's pending plan-activity
    // context — all via existing, already-safe authorities. This must
    // run BEFORE the session key changes, since these authorities are
    // active-namespace-scoped (they act on "whoever is currently
    // signed in", which is still the outgoing student at this point).
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
    try { if (window.SpeechRecognition || window.webkitSpeechRecognition) { /* no global mic handle here; per-engine cancels below */ } } catch (e) {}
    try { if (window.ZirakPlacementEngine && typeof window.ZirakPlacementEngine.close === 'function') window.ZirakPlacementEngine.close(); } catch (e) {}
    try { if (typeof window.iwClosePractice === 'function') window.iwClosePractice(); } catch (e) {}
    try { if (typeof window.zirakInterviewStopSpeaking === 'function') window.zirakInterviewStopSpeaking(); } catch (e) {}
    try {
      var outgoing = currentStudent();
      if (outgoing && outgoing.studentId && outgoing.studentId !== studentId && window.ZirakLearningPlan && typeof window.ZirakLearningPlan.clearPendingContext === 'function') {
        window.ZirakLearningPlan.clearPendingContext(outgoing.studentId);
      }
    } catch (e) {}
    // Prepare an optional continuation BEFORE writing the new session,
    // so it is present the instant the reload lands.
    if (options.handoff) { try { _writeTeacherHandoff(options.handoff); } catch (e) {} }
    // Write the real session key — the single source of truth for
    // "who is signed in," exactly as normal student login always has.
    try { sessionStorage.setItem('zirak_session', 'student:' + studentId); } catch (e) {}
    if (options.reload !== false) { try { location.reload(); } catch (e) {} }
    return { ok: true, studentId: studentId };
  }

  /* ══════════════════════════════════════════════════════════════════
     I6H-D14D — Task 5: the ONE safe public Teacher activation API.
     Never exposes selectStudent/setActive/raw session setters/arbitrary
     callbacks. Requires a valid whitelisted action; rejects anything
     else before any session mutation happens.
     ══════════════════════════════════════════════════════════════════ */
  // Task 19: registered by the Teacher Command Center so this module
  // can clear Teacher-only UI state without either module reaching
  // into the other's internals. Optional — activation still proceeds
  // safely if no cleaner is registered.
  var _teacherDashboardCleaner = null;
  function registerTeacherDashboardCleaner(fn) { _teacherDashboardCleaner = (typeof fn === 'function') ? fn : null; }

  function activateStudentForTeacher(studentId, handoffSpec) {
    if (!studentId) return { ok: false, studentId: studentId, handoffId: '', reloadRequired: false, reason: 'missing-student' };
    var s = getRoster().find(function (x) { return x.studentId === studentId; });
    if (!s) return { ok: false, studentId: studentId, handoffId: '', reloadRequired: false, reason: 'student-not-found' };
    var action = (handoffSpec && handoffSpec.action) || 'open-home';
    if (TEACHER_HANDOFF_ACTIONS.indexOf(action) === -1) return { ok: false, studentId: studentId, handoffId: '', reloadRequired: false, reason: 'action-not-whitelisted' };

    var result = { ok: false, studentId: studentId, handoffId: '', reloadRequired: true, reason: '' };
    function proceed() {
      // Task 19: clear Teacher-only dashboard state BEFORE activating,
      // so nothing Teacher-scoped survives into the student session.
      try { if (_teacherDashboardCleaner) _teacherDashboardCleaner(); } catch (e) {}
      var handoff = { targetStudentId: studentId, action: action, args: (handoffSpec && handoffSpec.args) || {} };
      var written = _writeTeacherHandoff(handoff);
      if (!written.ok) { result.reason = written.reason; return; }
      result.handoffId = written.handoffId;
      var activated = activateStudentSession(studentId, { source: 'teacher-handoff', reload: true });
      result.ok = activated.ok;
      if (!activated.ok) result.reason = activated.reason;
    }
    // Task 6: use the existing Teacher authorization authority — never
    // a second PIN. A still-valid Teacher session may proceed without
    // re-prompting; an absent/expired one uses the existing PIN prompt.
    if (teacherUnlocked()) { proceed(); }
    else { requireTeacher(proceed); result.reloadRequired = true; if (!result.handoffId && !result.reason) result.reason = 'pending-teacher-pin'; }
    return result;
  }

  /* ====================================================================
     STUDENT MODEL
     ==================================================================== */
  var TRACKS = ['Kids','Teen Beginner','Adult Conversation','Job / Interview','Advanced Conversation'];
  var LEVELS = ['Beginner','Elementary','Intermediate','Upper-Intermediate','Advanced'];

  function blankStudent(){
    return {
      studentId:'', pin:'',
      fullName:'', fatherName:'', fatherWhatsApp:'',
      studentPhone:'', guardianPhone:'',
      age:'', gender:'',
      photoDataUrl:'', avatarColor:'', avatarInitials:'',
      track:'', level:'', batch:'',
      admissionDate:'', status:'active', teacherNotes:'',
      currentMonth:1, currentWeek:1, currentDay:1,
      lastPage:'', lastActivity:'', lastItemIndex:0, lastUpdated:'',
      progressSummary:'', certificateStatus:'none', resultStatus:'none',
      createdAt:'',
      // ----- Phase 3: Class Path / Six-Month skeleton (per-student progress) -----
      currentClassDayId:'',        // e.g. 'm1-w1-d1'
      completedClassBlocks:{},     // { 'm1-w1-d1': ['attendance','warmup', ...] }
      classPathStartedAt:'',
      classPathUpdatedAt:'',
      attendanceCount:0,
      lastAttendanceDate:'',       // 'YYYY-MM-DD' — marks attendance once/day
      totalClassMinutes:0,
      autoAdvanceClassDay:false,   // Phase H2: teacher-toggled; default OFF
      arcadeGate:{ arcadeLocked:true, teacherOverride:false, remainingArcadeSeconds:0 }
    };
  }
  // Forward-compatible: fill any missing fields on older records.
  function normalize(s){
    var b = blankStudent();
    for (var k in b){ if (!(k in s)) s[k] = b[k]; }
    return s;
  }

  function nextStudentId(){
    var year = new Date().getFullYear();
    var seqKey = 'seq_' + year;
    var seq = parseInt(sysGet(seqKey) || '0', 10);
    var roster = getRoster();
    var id, used = seq;
    do {
      used += 1;
      id = ACAD.idPrefix + '-' + year + '-' + String(used).padStart(4,'0');
    } while (roster.some(function(s){ return s.studentId === id; }));
    sysSet(seqKey, String(used));
    return id;
  }

  /* ---------- avatar ---------- */
  var AV_COLORS = ['#1a3a5c','#1a6b4a','#7a3b8f','#b5651d','#2a5080','#9c2b2b','#0f6b6b','#8a6d1a'];
  function initialsFor(name){
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '👤';
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  }
  function colorFor(seed){
    var h = 0; seed = String(seed || '');
    for (var i=0; i<seed.length; i++) h = (h*31 + seed.charCodeAt(i)) >>> 0;
    return AV_COLORS[h % AV_COLORS.length];
  }
  function avatarHTML(s, size){
    size = size || 56;
    if (s.photoDataUrl){
      return '<span class="zk-av" style="width:'+size+'px;height:'+size+'px;">'+
             '<img src="'+s.photoDataUrl+'" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></span>';
    }
    var col = s.avatarColor || colorFor(s.studentId || s.fullName);
    var ini = s.avatarInitials || initialsFor(s.fullName);
    var fs  = Math.max(12, Math.round(size*0.38));
    return '<span class="zk-av" style="width:'+size+'px;height:'+size+'px;background:'+col+';color:#fff;font-size:'+fs+'px;">'+esc(ini)+'</span>';
  }

  /* ---------- misc helpers ---------- */
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function digits(s){ return String(s || '').replace(/[^0-9]/g,''); }
  function todayISO(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function $(id){ return document.getElementById(id); }

  /* ====================================================================
     RESUME ENGINE (per-student; stored inside the student record)
     ==================================================================== */
  window.ZirakResume = {
    get: function(){
      var s = currentStudent(); if (!s) return null;
      return { lastPage:s.lastPage, lastActivity:s.lastActivity, lastItemIndex:s.lastItemIndex,
               currentMonth:s.currentMonth, currentWeek:s.currentWeek, currentDay:s.currentDay,
               lastUpdated:s.lastUpdated };
    },
    set: function(patch){
      var s = currentStudent(); if (!s) return;
      Object.assign(s, patch || {});
      s.lastUpdated = new Date().toISOString();
      upsertStudent(s);
      renderDashboard();
    },
    // Lightweight: called whenever the student navigates to a screen.
    note: function(screen){
      if (!screen) return;
      var s = currentStudent(); if (!s) return;
      s.lastPage = screen;
      s.lastActivity = 'Opened: ' + screen;
      s.lastUpdated = new Date().toISOString();
      upsertStudent(s);
    }
  };

  // Keep the existing WhatsApp result-card working: mirror identity into
  // the app's own per-student parent_profile slot.
  function ensureParentSync(s){
    try {
      var existing = {};
      try { existing = JSON.parse((typeof window.load === 'function' ? window.load('parent_profile') : null) || '{}'); } catch(e){}
      var merged = {
        studentName: s.fullName || existing.studentName || '',
        fatherName:  s.fatherName || existing.fatherName || '',
        fatherWA:    s.fatherWhatsApp || existing.fatherWA || '',
        parentPin:   existing.parentPin || ''
      };
      if (typeof window.save === 'function') window.save('parent_profile', JSON.stringify(merged));
    } catch(e){}
  }

  /* ====================================================================
     STYLES (injected; uses existing CSS variables so it matches themes)
     ==================================================================== */
  function injectStyles(){
    if ($('zirak-profile-styles')) return;
    var css =
    '.zk-av{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;font-weight:700;flex:0 0 auto;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.18);}'+
    '#zk-overlay{position:fixed;inset:0;z-index:99990;overflow:auto;-webkit-overflow-scrolling:touch;'+
      'background:linear-gradient(160deg,var(--lapis-dark,#0f2340),var(--lapis,#1a3a5c) 60%,var(--emerald,#1a6b4a));}'+
    '#zk-overlay .zk-wrap{max-width:560px;margin:0 auto;padding:26px 16px 40px;}'+
    '.zk-crest{width:74px;height:74px;border-radius:20px;margin:6px auto 12px;display:flex;align-items:center;justify-content:center;'+
      'font-size:38px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.22);}'+
    '.zk-aca-en{color:#fff;text-align:center;font-weight:800;letter-spacing:.5px;font-size:20px;line-height:1.25;}'+
    '.zk-aca-ps{color:var(--gold-light,#f0c040);text-align:center;font-family:var(--font-dari,"Vazirmatn",serif);font-size:19px;margin-top:4px;direction:rtl;}'+
    '.zk-sub{color:rgba(255,255,255,.78);text-align:center;font-size:12.5px;margin-top:10px;}'+
    '.zk-card{background:var(--bg-card,#fdf8ee);color:var(--text,#1a2030);border-radius:var(--radius-lg,16px);'+
      'padding:16px;margin-top:18px;box-shadow:0 10px 34px rgba(0,0,0,.28);}'+
    '.zk-card h3{margin:0 0 10px;font-size:16px;}'+
    '.zk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;}'+
    '.zk-pcard{display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;cursor:pointer;'+
      'padding:14px 8px;border:1.5px solid var(--border,rgba(26,58,92,.14));border-radius:var(--radius-md,12px);'+
      'background:var(--bg-card2,#fff);transition:transform .12s,border-color .12s,box-shadow .12s;}'+
    '.zk-pcard:hover{transform:translateY(-2px);border-color:var(--gold,#d4a017);box-shadow:var(--shadow-hover,0 4px 20px rgba(26,58,92,.16));}'+
    '.zk-pcard .nm{font-weight:700;font-size:13.5px;line-height:1.2;}'+
    '.zk-pcard .id{font-size:11px;color:var(--text-muted,#5a6a7a);}'+
    '.zk-pcard .tk{font-size:10.5px;color:var(--text-muted,#5a6a7a);}'+
    '.zk-field{margin-top:10px;}'+
    '.zk-field label{display:block;font-size:12px;font-weight:600;color:var(--text-muted,#5a6a7a);margin-bottom:4px;}'+
    '.zk-input,.zk-select,.zk-area{width:100%;box-sizing:border-box;padding:11px 12px;border:1.5px solid var(--border-strong,rgba(26,58,92,.25));'+
      'border-radius:var(--radius-sm,8px);background:var(--input-bg,#fff);color:var(--text,#1a2030);font-size:15px;font-family:inherit;}'+
    '.zk-input:focus,.zk-select:focus,.zk-area:focus{outline:none;border-color:var(--gold,#d4a017);}'+
    '.zk-area{min-height:64px;resize:vertical;}'+
    '.zk-row{display:flex;gap:10px;flex-wrap:wrap;}'+
    '.zk-row>*{flex:1 1 140px;}'+
    '.zk-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 16px;border-radius:var(--radius-md,12px);'+
      'border:none;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;min-height:46px;}'+
    '.zk-btn-primary{background:var(--lapis,#1a3a5c);color:#fff;}'+
    '.zk-btn-gold{background:var(--gold,#d4a017);color:#1a2030;}'+
    // PHASE I6B1 — Part 4/8: this was the root cause of the Teacher PIN
    // modal's "Cancel" button being nearly invisible in dark mode —
    // color was hard-pinned to the STATIC brand color --lapis
    // (#1a3a5c, a dark navy that is NEVER redefined for dark mode),
    // so on a dark-mode modal (background: var(--bg-card), which IS
    // dark) the button text was dark-navy-on-dark-navy. --text is the
    // theme-aware semantic color (light in dark mode, dark in light
    // mode) — using it here makes this ghost/secondary button style
    // correctly readable in both themes wherever it's used, not just
    // this modal, without needing per-instance overrides.
    '.zk-btn-ghost{background:transparent;color:var(--text,#1a3a5c);border:1.5px solid var(--border-strong,rgba(26,58,92,.25));}'+
    '.zk-btn-danger{background:var(--red,#c0392b);color:#fff;}'+
    '.zk-btn-block{width:100%;}'+
    '.zk-btn[disabled]{opacity:.5;cursor:not-allowed;}'+
    '.zk-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;}'+
    '.zk-actions>.zk-btn{flex:1 1 auto;}'+
    '.zk-note{font-size:12px;color:var(--text-muted,#5a6a7a);margin-top:8px;}'+
    '.zk-empty{text-align:center;padding:8px 4px;}'+
    '.zk-empty .em{font-size:34px;}'+
    /* modal */
    '#zk-modal-root{position:fixed;inset:0;z-index:99995;display:none;align-items:flex-start;justify-content:center;'+
      'overflow:auto;background:rgba(8,18,32,.62);padding:24px 12px;}'+
    '#zk-modal-root.open{display:flex;}'+
    '.zk-modal{background:var(--bg-card,#fdf8ee);color:var(--text,#1a2030);width:100%;max-width:540px;border-radius:var(--radius-lg,16px);'+
      'padding:18px;box-shadow:0 18px 48px rgba(0,0,0,.4);margin:auto 0;}'+
    '.zk-modal h3{margin:0 0 2px;font-size:17px;}'+
    '.zk-modal .msub{font-size:12.5px;color:var(--text-muted,#5a6a7a);margin-bottom:8px;}'+
    /* dashboard card */
    '#zk-dashboard{background:linear-gradient(160deg,var(--lapis,#1a3a5c),var(--lapis-light,#2a5080));color:#fff;'+
      'border-radius:var(--radius-xl,20px);padding:16px;margin:0 0 14px;box-shadow:var(--shadow,0 2px 12px rgba(26,58,92,.1));}'+
    '#zk-dashboard .top{display:flex;gap:12px;align-items:center;}'+
    '#zk-dashboard .hi{font-size:13px;color:rgba(255,255,255,.8);}'+
    '#zk-dashboard .nm{font-size:20px;font-weight:800;line-height:1.15;}'+
    '#zk-dashboard .meta{font-size:12px;color:rgba(255,255,255,.85);margin-top:2px;}'+
    '#zk-dashboard .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;}'+
    '#zk-dashboard .chip{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.18);border-radius:999px;'+
      'padding:6px 11px;font-size:12px;}'+
    '#zk-dashboard .chip b{color:var(--gold-light,#f0c040);}'+
    '#zk-dashboard .resume{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.16);border-radius:var(--radius-md,12px);'+
      'padding:11px 12px;margin-top:12px;font-size:13px;}'+
    '#zk-dashboard .dactions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px;}'+
    '#zk-dashboard .dactions .zk-btn{flex:1 1 150px;}'+
    '#zk-dashboard .tnote{background:rgba(212,160,23,.18);border:1px solid rgba(212,160,23,.4);border-radius:var(--radius-sm,8px);'+
      'padding:9px 11px;margin-top:10px;font-size:12.5px;}'+
    /* floating chip */
    '#zk-chip{position:fixed;right:14px;bottom:calc(var(--nav-h,56px) + 14px);z-index:9000;display:flex;align-items:center;gap:8px;'+
      'background:var(--bg-card,#fdf8ee);color:var(--text,#1a2030);border:1.5px solid var(--border-strong,rgba(26,58,92,.25));'+
      'border-radius:999px;padding:5px 12px 5px 5px;box-shadow:var(--shadow-hover,0 4px 20px rgba(26,58,92,.16));cursor:pointer;}'+
    '#zk-chip .lab{font-size:12.5px;font-weight:700;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'+
    '#zk-chip .lk{font-size:13px;}'+
    '#zk-menu{position:fixed;right:14px;bottom:calc(var(--nav-h,56px) + 64px);z-index:9001;display:none;'+
      'background:var(--bg-card,#fdf8ee);color:var(--text,#1a2030);border:1px solid var(--border,rgba(26,58,92,.14));'+
      'border-radius:var(--radius-md,12px);box-shadow:0 12px 36px rgba(0,0,0,.28);min-width:210px;overflow:hidden;}'+
    '#zk-menu.open{display:block;}'+
    '#zk-menu button{display:flex;width:100%;align-items:center;gap:9px;padding:12px 14px;background:none;border:none;'+
      'text-align:left;font-size:14px;color:inherit;cursor:pointer;font-family:inherit;}'+
    '#zk-menu button:hover{background:var(--divider,rgba(26,58,92,.08));}'+
    '#zk-menu .sep{height:1px;background:var(--border,rgba(26,58,92,.14));}'+
    '.zk-locked-msg{display:flex;align-items:center;gap:8px;background:var(--divider,rgba(26,58,92,.08));'+
      'border:1px dashed var(--border-strong,rgba(26,58,92,.25));border-radius:var(--radius-md,12px);padding:12px;font-size:13px;}'+
    '.zk-list{margin-top:8px;}'+
    '.zk-li{display:flex;align-items:center;gap:10px;padding:9px;border:1px solid var(--border,rgba(26,58,92,.14));'+
      'border-radius:var(--radius-sm,8px);margin-bottom:8px;}'+
    '.zk-li .grow{flex:1 1 auto;min-width:0;}'+
    '.zk-li .nm{font-weight:700;font-size:13.5px;}'+
    '.zk-li .id{font-size:11px;color:var(--text-muted,#5a6a7a);}'+
    '.zk-mini{padding:7px 10px;font-size:12.5px;min-height:0;border-radius:var(--radius-xs,6px);}'+
    '.zk-photo-prev{display:flex;align-items:center;gap:10px;margin-top:6px;}'+
    '@media(max-width:380px){ .zk-aca-en{font-size:17px;} }'+
    /* ----- Phase 3: Today's Class card ----- */
    '.zk-cp-card{background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.16);border-radius:var(--radius-md,12px);padding:12px;margin-top:12px;}'+
    '.zk-cp-head{font-size:13px;font-weight:800;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:8px;}'+
    '.zk-cp-sub{font-size:11px;font-weight:700;color:var(--gold-light,#f0c040);background:rgba(0,0,0,.18);border-radius:999px;padding:3px 9px;}'+
    '.zk-cp-title{font-size:13.5px;color:rgba(255,255,255,.92);margin-top:6px;}'+
    '.zk-cp-pending{font-size:10.5px;background:rgba(212,160,23,.25);border:1px solid rgba(212,160,23,.5);color:var(--gold-light,#f0c040);border-radius:6px;padding:1px 6px;margin-left:4px;}'+
    '.zk-cp-progress{height:7px;background:rgba(0,0,0,.22);border-radius:999px;margin-top:9px;overflow:hidden;}'+
    '.zk-cp-bar{height:100%;background:linear-gradient(90deg,var(--gold,#d4a017),var(--gold-light,#f0c040));border-radius:999px;transition:width .3s;}'+
    '.zk-cp-meta{font-size:11.5px;color:rgba(255,255,255,.85);margin-top:6px;}'+
    '.zk-cp-meta b{color:var(--gold-light,#f0c040);}'+
    '.zk-cp-list{margin-top:9px;display:flex;flex-direction:column;gap:6px;}'+
    '.zk-cp-row{display:flex;align-items:center;gap:8px;background:rgba(0,0,0,.14);border-radius:var(--radius-sm,8px);padding:7px 9px;flex-wrap:wrap;}'+
    '.zk-cp-row.current{background:rgba(212,160,23,.20);border:1px solid rgba(212,160,23,.4);}'+
    /* PHASE I6A3 — Part 4: the OLD rule here was a blanket
       "opacity:.62" on the whole row, which also dragged down button
       LABEL text ("Open Grammar", "Pair Info", "Locked", etc.) to the
       point of being unreadable per real-device screenshot feedback.
       Replaced with TARGETED softening: the row background recedes a
       touch more and the lock icon dims, but the name/minutes text and
       button stay at an explicit, readable opacity — visibly softer
       than the current/active row, never fully dim, and never styled
       to look clickable/active (no gold highlight, no pulse). */
    '.zk-cp-row.locked{background:rgba(0,0,0,.20);opacity:1;}'+
    '.zk-cp-row.locked .zk-cp-ic{opacity:.55;}'+
    '.zk-cp-row.locked .zk-cp-nm{color:rgba(255,255,255,.82);}'+
    '.zk-cp-row.locked .zk-cp-min{color:rgba(255,255,255,.58);}'+
    /* Row buttons sit on this dark translucent card — the shared
       .zk-btn-ghost is a navy-on-light style meant for light cards
       elsewhere in the app, so it is nearly invisible here. Give every
       row's button a light/on-dark treatment, with the locked variant
       a touch more muted than the current row's gold-tinted one — kept
       clearly readable either way, never styled as if it were active. */
    '.zk-cp-row .zk-btn-ghost{color:#fff;border-color:rgba(255,255,255,.42);background:rgba(255,255,255,.10);}'+
    '.zk-cp-row.current .zk-btn-ghost{border-color:rgba(212,160,23,.55);background:rgba(212,160,23,.14);}'+
    '.zk-cp-row.locked .zk-btn-ghost{color:rgba(255,255,255,.88);border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.06);}'+
    /* PHASE I4: one-time attention pulse on the next/current task */
    '.zk-cp-row.zk-cp-guide{animation:zkCpPulse 1.1s ease 2;}'+
    '@keyframes zkCpPulse{0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,0);}50%{box-shadow:0 0 0 4px rgba(212,160,23,.5);}}'+
    '.zk-cp-row .zk-mini{white-space:nowrap;}'+
    /* PHASE I4: Today-complete card */
    '.zk-cp-complete{margin-top:10px;padding:12px;border-radius:var(--radius-sm,10px);background:linear-gradient(135deg,#1a6b4a,#22aa6f);color:#fff;}'+
    '.zk-cp-complete-t{font-weight:800;font-size:14.5px;}'+
    '.zk-cp-complete-s{font-size:12.5px;opacity:.95;margin-top:3px;}'+
    '.zk-cp-complete-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px;}'+
    '.zk-cp-ic{font-size:14px;flex:0 0 auto;}'+
    '.zk-cp-nm{flex:1 1 auto;font-size:12.5px;color:#fff;display:flex;flex-wrap:wrap;align-items:center;gap:6px;}'+
    '.zk-cp-min{font-size:10.5px;color:rgba(255,255,255,.65);}'+
    '.zk-cp-teacher{font-size:9.5px;text-transform:uppercase;letter-spacing:.4px;background:rgba(255,255,255,.18);border-radius:5px;padding:1px 5px;color:#fff;}'+
    '.zk-cp-arcade{margin-top:10px;font-size:11.5px;color:rgba(255,255,255,.78);background:rgba(0,0,0,.16);border:1px dashed rgba(255,255,255,.22);border-radius:var(--radius-sm,8px);padding:8px 10px;}'+
    '.zk-cp-arcade b{color:var(--gold-light,#f0c040);}'+
    /* ----- Phase H2: teacher panel polish ----- */
    '.zk-cp-warn{background:rgba(212,160,23,.16);border:1px solid rgba(212,160,23,.45);color:var(--text,#1a2030);border-radius:var(--radius-sm,8px);padding:8px 10px;font-size:12px;margin:6px 0 4px;}'+
    '.zk-cp-sec{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted,#5a6a7a);font-weight:700;margin:12px 0 2px;}'+
    '.zk-cp-toggle{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--bg-card2,#fff);border:1px solid var(--border,rgba(26,58,92,.14));border-radius:var(--radius-sm,8px);padding:9px 11px;}'+
    /* ----- Phase H2: full-screen Today's Class ----- */
    '#screen-classpath{padding-bottom:calc(var(--nav-h,56px) + 24px);}'+
    '.zk-cps-wrap{max-width:var(--max-w,640px);margin:0 auto;padding:0 12px;}'+
    '.zk-cps-empty{max-width:var(--max-w,640px);margin:18px auto;padding:18px;text-align:center;color:var(--text-muted,#5a6a7a);background:var(--bg-card,#fdf8ee);border-radius:var(--radius-md,12px);}'+
    '.zk-cps-card{background:linear-gradient(160deg,var(--lapis,#1a3a5c),var(--lapis-light,#2a5080));color:#fff;border-radius:var(--radius-xl,20px);padding:15px;margin:12px 0;box-shadow:var(--shadow,0 2px 12px rgba(26,58,92,.1));}'+
    '.zk-cps-stud{display:flex;align-items:center;gap:11px;}'+
    '.zk-cps-stud .zk-cps-nm{font-size:17px;font-weight:800;line-height:1.15;}'+
    '.zk-cps-stud .zk-cps-sub{font-size:11.5px;color:rgba(255,255,255,.8);}'+
    '.zk-cps-back{margin-left:auto;color:#fff !important;border-color:rgba(255,255,255,.4) !important;}'+
    '.zk-cps-chips{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px;}'+
    '.chip2{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:5px 10px;font-size:11.5px;}'+
    '.chip2 b{color:var(--gold-light,#f0c040);}'+
    '.zk-cps-title{font-size:13.5px;color:rgba(255,255,255,.92);margin-top:11px;}'+
    '.zk-cps-progress{height:8px;background:rgba(0,0,0,.22);border-radius:999px;margin-top:10px;overflow:hidden;}'+
    '.zk-cps-bar{height:100%;background:linear-gradient(90deg,var(--gold,#d4a017),var(--gold-light,#f0c040));border-radius:999px;transition:width .3s;}'+
    '.zk-cps-meta{font-size:12px;color:rgba(255,255,255,.85);margin-top:7px;}'+
    '.zk-cps-meta b{color:var(--gold-light,#f0c040);}'+
    '.zk-cps-actions{margin-top:12px;}'+
    '.zk-cps-actions .zk-btn{width:100%;}'+
    '.zk-cps-list{display:flex;flex-direction:column;gap:9px;margin-top:4px;}'+
    '.zk-cps-block{background:var(--bg-card,#fdf8ee);border:1px solid var(--border,rgba(26,58,92,.12));border-radius:var(--radius-md,12px);padding:11px 12px;}'+
    '.zk-cps-block.current{border-color:var(--gold,#d4a017);box-shadow:0 0 0 2px rgba(212,160,23,.18);}'+
    '.zk-cps-block.locked{opacity:.7;}'+
    '.zk-cps-b-top{display:flex;align-items:center;gap:8px;}'+
    '.zk-cps-b-ic{font-size:15px;}'+
    '.zk-cps-b-nm{flex:1 1 auto;font-size:14px;font-weight:700;color:var(--text,#1a2030);}'+
    '.zk-cps-b-st{font-size:10px;text-transform:uppercase;letter-spacing:.4px;font-weight:800;border-radius:6px;padding:2px 7px;}'+
    '.zk-cps-b-st.complete{background:rgba(26,107,74,.15);color: var(--emerald-text,#1a6b4a);}'+
    '.zk-cps-b-st.current{background:rgba(212,160,23,.2);color:#9a7400;}'+
    '.zk-cps-b-st.locked{background:var(--divider,rgba(26,58,92,.08));color:var(--text-muted,#5a6a7a);}'+
    '.zk-cps-b-ps{font-family:var(--font-dari,"Vazirmatn",serif);direction:rtl;font-size:12.5px;color:var(--text-muted,#5a6a7a);margin-top:2px;}'+
    '.zk-cps-b-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:7px;font-size:11.5px;color:var(--text-muted,#5a6a7a);}'+
    '.zk-cps-tag{font-size:9.5px;text-transform:uppercase;letter-spacing:.4px;border-radius:5px;padding:1px 6px;font-weight:700;}'+
    '.zk-cps-tag.teacher{background:rgba(26,58,92,.12);color: var(--lapis-text,#1a3a5c);}'+
    '.zk-cps-tag.student{background:rgba(26,107,74,.14);color: var(--emerald-text,#1a6b4a);}'+
    '.zk-cps-b-link{flex-basis:100%;}'+
    '.zk-cps-b-actions{display:flex;gap:8px;margin-top:9px;}'+
    '.zk-cps-doneflag{font-size:12px;color: var(--emerald-text,#1a6b4a);font-weight:700;align-self:center;}'+
    '.zk-cps-arcade{max-width:var(--max-w,640px);margin:12px auto 0;font-size:12px;color:var(--text-muted,#5a6a7a);background:var(--bg-card,#fdf8ee);border:1px dashed var(--border-strong,rgba(26,58,92,.25));border-radius:var(--radius-md,12px);padding:11px 12px;}'+
    '.zk-cps-arcade b{color:var(--gold,#d4a017);}'+
    /* ----- Phase H3: content-slot status on the full screen ----- */
    '.zk-cps-slot{margin-top:7px;font-size:11px;color:var(--text-muted,#5a6a7a);}'+
    '.zk-cps-slot code{background:var(--divider,rgba(26,58,92,.08));border-radius:5px;padding:1px 6px;font-size:10.5px;color: var(--lapis-text,#1a3a5c);}'+
    '.zk-cps-pending2{font-size:10.5px;background:rgba(212,160,23,.18);border:1px solid rgba(212,160,23,.4);color:#9a7400;border-radius:6px;padding:1px 7px;}'+
    '.zk-cps-ready2{font-size:10.5px;background:rgba(26,107,74,.16);border:1px solid rgba(26,107,74,.4);color: var(--emerald-text,#1a6b4a);border-radius:6px;padding:1px 7px;font-weight:700;}'+
    '.zk-cps-writer{margin-top:6px;font-size:11.5px;color:var(--text,#1a2030);background:var(--divider,rgba(26,58,92,.06));border-radius:var(--radius-sm,8px);padding:7px 9px;}'+
    /* ----- Phase H3: teacher "View Content Slots" list ----- */
    '.zk-vcs-list{margin-top:8px;display:flex;flex-direction:column;gap:6px;}'+
    '.zk-vcs-row{display:flex;align-items:center;gap:8px;background:var(--bg-card2,#fff);border:1px solid var(--border,rgba(26,58,92,.14));border-radius:var(--radius-sm,8px);padding:7px 9px;}'+
    '.zk-vcs-id code{background:var(--divider,rgba(26,58,92,.08));border-radius:5px;padding:2px 6px;font-size:10.5px;color: var(--lapis-text,#1a3a5c);white-space:nowrap;}'+
    '.zk-vcs-meta{flex:1 1 auto;font-size:12px;color:var(--text,#1a2030);}'+
    '.zk-vcs-status{font-size:10px;text-transform:uppercase;letter-spacing:.4px;font-weight:800;border-radius:6px;padding:2px 7px;}'+
    '.zk-vcs-status.zk-vcs-pending{background:rgba(212,160,23,.18);color:#9a7400;}'+
    '.zk-vcs-status.zk-vcs-ready{background:rgba(26,107,74,.16);color: var(--emerald-text,#1a6b4a);}'+
    /* ----- Phase H4A: ready-content details box on the full screen ----- */
    '.zk-cps-ready-box{margin-top:7px;background:rgba(26,107,74,.06);border:1px solid rgba(26,107,74,.22);border-radius:var(--radius-sm,8px);padding:7px 10px;}'+
    '.zk-cps-ready-box summary{font-size:12.5px;font-weight:700;color: var(--emerald-text,#1a6b4a);cursor:pointer;list-style:none;}'+
    '.zk-cps-ready-box summary::-webkit-details-marker{display:none;}'+
    '.zk-cps-ready-box summary::before{content:"▸ ";}'+
    '.zk-cps-ready-box[open] summary::before{content:"▾ ";}'+
    '.zk-cps-ri{font-size:11.5px;color:var(--text,#1a2030);margin-top:6px;line-height:1.4;}'+
    '.zk-cps-ri-items{margin:6px 0 0;padding-left:18px;font-size:11.5px;color:var(--text,#1a2030);}'+
    '.zk-cps-ri-items li{margin-bottom:2px;}';
    var st = document.createElement('style');
    st.id = 'zirak-profile-styles';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ====================================================================
     GENERIC PIN PROMPT MODAL
     ==================================================================== */
  function modalRoot(){
    var r = $('zk-modal-root');
    if (!r){ r = document.createElement('div'); r.id = 'zk-modal-root';
      r.addEventListener('click', function(e){ if (e.target === r) closeModal(); });
      document.body.appendChild(r); }
    return r;
  }
  function openModal(html){ var r = modalRoot(); r.innerHTML = '<div class="zk-modal">'+html+'</div>'; r.classList.add('open'); }
  function closeModal(){ var r = $('zk-modal-root'); if (r){ r.classList.remove('open'); r.innerHTML=''; } }
  // I6H-D15A: inline onclick handlers (both pre-existing and the new
  // Today's Class modals) call the bare global closeModal() — expose it
  // so those handlers genuinely work (it was IIFE-private before).
  try { window.closeModal = closeModal; } catch(e){}

  function promptPin(opts){
    openModal(
      '<h3>'+esc(opts.title||'Enter PIN')+'</h3>'+
      (opts.sub ? '<div class="msub">'+esc(opts.sub)+'</div>' : '')+
      '<div class="zk-field"><input id="zk-pin-in" class="zk-input" type="password" inputmode="numeric" '+
        'autocomplete="off" placeholder="••••" style="letter-spacing:6px;font-size:20px;text-align:center;"></div>'+
      '<div id="zk-pin-err" class="zk-note" style="color: var(--red-text,#c0392b);display:none;">Wrong PIN. Try again.</div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile._closeModal()">Cancel</button>'+
        '<button class="zk-btn zk-btn-primary" id="zk-pin-ok">Unlock</button>'+
      '</div>'
    );
    var input = $('zk-pin-in'); if (input) input.focus();
    function attempt(){
      var v = (input.value || '').trim();
      if (opts.verify(v)){ closeModal(); if (opts.onOk) opts.onOk(); }
      else { var er = $('zk-pin-err'); if (er) er.style.display='block'; input.value=''; input.focus(); }
    }
    $('zk-pin-ok').addEventListener('click', attempt);
    if (input) input.addEventListener('keydown', function(e){ if (e.key === 'Enter') attempt(); });
  }

  /* ====================================================================
     LOGIN SCREEN
     ==================================================================== */
  function buildLogin(){
    injectStyles();
    var ov = $('zk-overlay');
    if (!ov){ ov = document.createElement('div'); ov.id='zk-overlay'; document.body.appendChild(ov); }
    var roster = getRoster().map(normalize);

    var head =
      '<div class="zk-crest">🦅</div>'+
      '<div class="zk-aca-en">'+esc(ACAD.nameEn)+'</div>'+
      '<div class="zk-aca-ps">'+esc(ACAD.namePs)+'</div>'+
      '<div class="zk-sub">Local academy sign-in · ﺩ ﺯﺩﻩ ﮐﻮﻭﻧﮑﻲ ننوتل · This device only</div>';

    var body;
    if (!roster.length){
      body =
        '<div class="zk-card">'+
          '<div class="zk-empty">'+
            '<div class="em">🎓</div>'+
            '<h3 style="margin:8px 0 4px;">No student profiles yet</h3>'+
            '<p class="zk-note">Teacher unlock is required to add the first student.<br>'+
            '<span style="direction:rtl;display:inline-block;">د لومړي زده کوونکي لپاره د ښوونکي اجازه اړینه ده.</span></p>'+
          '</div>'+
          '<div class="zk-actions">'+
            '<button class="zk-btn zk-btn-gold zk-btn-block" onclick="ZirakProfile.teacherUnlockThenAdd()">🔑 Teacher Unlock &amp; Add Student</button>'+
          '</div>'+
        '</div>';
    } else {
      var cards = roster.map(function(s){
        return '<div class="zk-pcard" onclick="ZirakProfile.pickStudent(\''+esc(s.studentId)+'\')">'+
          avatarHTML(s,56)+
          '<div class="nm">'+esc(s.fullName||'Student')+'</div>'+
          '<div class="id">'+esc(s.studentId)+'</div>'+
          '<div class="tk">'+esc(s.track||'')+(s.level?(' · '+esc(s.level)):'')+'</div>'+
        '</div>';
      }).join('');
      body =
        '<div class="zk-card">'+
          '<h3>Choose your profile · خپل پروفایل وټاکئ</h3>'+
          '<div class="zk-grid">'+cards+'</div>'+
        '</div>'+
        '<div class="zk-card">'+
          '<h3>Or sign in with ID · یا د پیژندنې شمیرې سره</h3>'+
          '<div class="zk-field"><label>Student ID</label>'+
            '<input id="zk-login-id" class="zk-input" placeholder="'+esc(ACAD.idPrefix)+'-'+new Date().getFullYear()+'-0001"></div>'+
          '<div class="zk-field"><label>PIN</label>'+
            '<input id="zk-login-pin" class="zk-input" type="password" inputmode="numeric" placeholder="••••" '+
            'style="letter-spacing:5px;text-align:center;"></div>'+
          '<div id="zk-login-err" class="zk-note" style="color: var(--red-text,#c0392b);display:none;">ID or PIN is incorrect.</div>'+
          '<div class="zk-actions">'+
            '<button class="zk-btn zk-btn-primary zk-btn-block" onclick="ZirakProfile.loginById()">▶ Continue Learning</button>'+
          '</div>'+
        '</div>'+
        '<div class="zk-actions">'+
          '<button class="zk-btn zk-btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.4);" onclick="ZirakProfile.teacherTools()">🔑 Teacher</button>'+
          '<button class="zk-btn zk-btn-gold" onclick="ZirakProfile.teacherUnlockThenAdd()">＋ Add Student</button>'+
        '</div>';
    }

    ov.innerHTML = '<div class="zk-wrap">'+head+body+
      '<div class="zk-sub" style="margin-top:22px;">All profiles &amp; progress are stored only on this device. · '+esc(ACAD.version)+'</div>'+
      '</div>';
    revealApp(false); // keep app hidden behind overlay
  }

  function pickStudent(id){
    var s = getRoster().map(normalize).find(function(x){ return x.studentId === id; });
    if (!s) return;
    promptPin({
      title: 'Welcome, ' + (s.fullName || 'Student'),
      sub: s.studentId + ' · Enter your PIN to continue',
      verify: function(v){ return v === String(s.pin); },
      onOk: function(){ loginStudent(id); }
    });
  }
  function loginById(){
    var id  = ($('zk-login-id')  ? $('zk-login-id').value  : '').trim();
    var pin = ($('zk-login-pin') ? $('zk-login-pin').value : '').trim();
    var s = getRoster().find(function(x){ return x.studentId.toUpperCase() === id.toUpperCase(); });
    if (s && String(s.pin) === pin){ loginStudent(s.studentId); }
    else { var er = $('zk-login-err'); if (er) er.style.display='block'; }
  }
  function teacherUnlockThenAdd(){ requireTeacher(function(){ openAdmissionForm(null); }); }

  /* ====================================================================
     ADMISSION FORM (add / edit) — teacher gated by caller
     ==================================================================== */
  function openAdmissionForm(existingId){
    injectStyles();
    var editing = !!existingId;
    var s = editing ? normalize(JSON.parse(JSON.stringify(
              getRoster().find(function(x){ return x.studentId === existingId; }) || blankStudent())))
            : blankStudent();

    function opt(list, val){ return list.map(function(o){
      return '<option value="'+esc(o)+'"'+(o===val?' selected':'')+'>'+esc(o)+'</option>'; }).join(''); }

    openModal(
      '<h3>'+(editing ? 'Edit Student' : 'New Student Admission')+'</h3>'+
      '<div class="msub">'+(editing ? esc(s.studentId) : 'A Student ID will be generated automatically (e.g. '+ACAD.idPrefix+'-'+new Date().getFullYear()+'-0001).')+'</div>'+
      '<div class="zk-field"><label>Full name *</label><input id="f-name" class="zk-input" value="'+esc(s.fullName)+'" placeholder="e.g. Ahmad Khan"></div>'+
      '<div class="zk-row">'+
        '<div class="zk-field"><label>Father name *</label><input id="f-father" class="zk-input" value="'+esc(s.fatherName)+'"></div>'+
        '<div class="zk-field"><label>Father WhatsApp *</label><input id="f-fwa" class="zk-input" type="tel" value="'+esc(s.fatherWhatsApp)+'" placeholder="9370..."></div>'+
      '</div>'+
      '<div class="zk-row">'+
        '<div class="zk-field"><label>Student phone</label><input id="f-sphone" class="zk-input" type="tel" value="'+esc(s.studentPhone)+'"></div>'+
        '<div class="zk-field"><label>Guardian phone</label><input id="f-gphone" class="zk-input" type="tel" value="'+esc(s.guardianPhone)+'"></div>'+
      '</div>'+
      '<div class="zk-row">'+
        '<div class="zk-field"><label>Age</label><input id="f-age" class="zk-input" type="number" min="3" max="99" value="'+esc(s.age)+'"></div>'+
        '<div class="zk-field"><label>Gender</label><select id="f-gender" class="zk-select">'+
          opt(['','Male','Female'], s.gender)+'</select></div>'+
      '</div>'+
      '<div class="zk-row">'+
        '<div class="zk-field"><label>Track</label><select id="f-track" class="zk-select">'+
          '<option value="">—</option>'+opt(TRACKS, s.track)+'</select></div>'+
        '<div class="zk-field"><label>Level</label><select id="f-level" class="zk-select">'+
          '<option value="">—</option>'+opt(LEVELS, s.level)+'</select></div>'+
      '</div>'+
      '<div class="zk-row">'+
        '<div class="zk-field"><label>Batch / Class</label><input id="f-batch" class="zk-input" value="'+esc(s.batch)+'" placeholder="e.g. Morning A"></div>'+
        '<div class="zk-field"><label>PIN * (4 digits)</label><input id="f-pin" class="zk-input" type="text" inputmode="numeric" maxlength="8" value="'+esc(s.pin)+'" placeholder="e.g. 1234"></div>'+
      '</div>'+
      (editing ? '<div class="zk-field"><label>Status</label><select id="f-status" class="zk-select">'+
          opt(['active','paused','completed'], s.status)+'</select></div>' : '')+
      '<div class="zk-field"><label>Photo (optional)</label>'+
        '<input id="f-photo" class="zk-input" type="file" accept="image/*" capture="environment">'+
        '<div class="zk-photo-prev" id="f-photo-prev">'+
          (s.photoDataUrl ? avatarHTML(s,48)+'<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile._clearPhoto()">Remove photo</button>'
                          : '<span class="zk-note">No photo — initials avatar will be used.</span>')+
        '</div></div>'+
      '<div class="zk-field"><label>Teacher notes</label><textarea id="f-notes" class="zk-area" placeholder="Notes about this student...">'+esc(s.teacherNotes)+'</textarea></div>'+
      '<div id="f-err" class="zk-note" style="color: var(--red-text,#c0392b);display:none;"></div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile._closeModal()">Cancel</button>'+
        (editing ? '<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile.resetPin(\''+esc(existingId)+'\')">Reset PIN</button>' : '')+
        '<button class="zk-btn zk-btn-primary" onclick="ZirakProfile.saveAdmission('+(editing?'\''+esc(existingId)+'\'':'null')+')">💾 Save</button>'+
      '</div>'
    );

    // hold pending photo in closure-backed module field
    _pendingPhoto = s.photoDataUrl || '';
    var fileInput = $('f-photo');
    if (fileInput) fileInput.addEventListener('change', onPhotoPick);
  }

  var _pendingPhoto = '';
  function _clearPhoto(){
    _pendingPhoto = '';
    var p = $('f-photo-prev');
    if (p) p.innerHTML = '<span class="zk-note">No photo — initials avatar will be used.</span>';
    var fi = $('f-photo'); if (fi) fi.value = '';
  }
  function onPhotoPick(e){
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      var img = new Image();
      img.onload = function(){
        var max = 256, w = img.width, h = img.height;
        var scale = Math.min(1, max/Math.max(w,h));
        var cw = Math.round(w*scale), ch = Math.round(h*scale);
        var cv = document.createElement('canvas'); cv.width=cw; cv.height=ch;
        cv.getContext('2d').drawImage(img,0,0,cw,ch);
        try { _pendingPhoto = cv.toDataURL('image/jpeg', 0.82); } catch(err){ _pendingPhoto = ev.target.result; }
        var p = $('f-photo-prev');
        if (p) p.innerHTML = '<span class="zk-av" style="width:48px;height:48px;"><img src="'+_pendingPhoto+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"></span>'+
                             '<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile._clearPhoto()">Remove photo</button>';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function saveAdmission(existingId){
    var get = function(id){ var el=$(id); return el ? el.value.trim() : ''; };
    var fullName = get('f-name'), fatherName = get('f-father'), fwa = get('f-fwa'), pin = get('f-pin');
    var err = $('f-err');
    function fail(m){ if (err){ err.textContent = m; err.style.display='block'; } }
    if (!fullName)   return fail('Full name is required.');
    if (!fatherName) return fail('Father name is required.');
    if (!digits(fwa))return fail('Father WhatsApp number is required.');
    if (!/^[0-9]{4,8}$/.test(pin)) return fail('PIN must be 4–8 digits.');

    var roster = getRoster().map(normalize);
    var s;
    if (existingId){
      s = roster.find(function(x){ return x.studentId === existingId; }) || blankStudent();
    } else {
      s = blankStudent();
      s.studentId    = nextStudentId();
      s.admissionDate= todayISO();
      s.createdAt    = new Date().toISOString();
    }
    s.fullName = fullName; s.fatherName = fatherName; s.fatherWhatsApp = digits(fwa);
    s.studentPhone = digits(get('f-sphone')); s.guardianPhone = digits(get('f-gphone'));
    s.age = get('f-age'); s.gender = get('f-gender');
    s.track = get('f-track'); s.level = get('f-level'); s.batch = get('f-batch');
    s.pin = pin; s.teacherNotes = get('f-notes');
    if (existingId && $('f-status')) s.status = $('f-status').value;
    s.photoDataUrl = _pendingPhoto || '';
    s.avatarInitials = initialsFor(fullName);
    s.avatarColor = s.avatarColor || colorFor(s.studentId || fullName);

    upsertStudent(s);
    _pendingPhoto = '';
    closeModal();

    // Refresh whatever surface is showing.
    if ($('zk-overlay')) buildLogin();
    if (typeof window.__zirakAfterRosterChange === 'function') window.__zirakAfterRosterChange();
    toast(existingId ? 'Student updated.' : 'Student added: ' + s.studentId);
  }

  function resetPin(id){
    openModal(
      '<h3>Reset PIN</h3><div class="msub">Enter a new PIN (4–8 digits) for this student.</div>'+
      '<div class="zk-field"><input id="zk-newpin" class="zk-input" type="text" inputmode="numeric" maxlength="8" '+
        'placeholder="e.g. 1234" style="letter-spacing:5px;text-align:center;font-size:20px;" autocomplete="off"></div>'+
      '<div id="zk-newpin-err" class="zk-note" style="color: var(--red-text,#c0392b);display:none;">PIN must be 4–8 digits.</div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile._closeModal()">Cancel</button>'+
        '<button class="zk-btn zk-btn-primary" id="zk-newpin-ok">Save PIN</button>'+
      '</div>'
    );
    var input = $('zk-newpin'); if (input) input.focus();
    function attempt(){
      var v = (input.value||'').trim();
      if (!/^[0-9]{4,8}$/.test(v)){ $('zk-newpin-err').style.display='block'; input.focus(); return; }
      var roster = getRoster();
      var s = roster.find(function(x){ return x.studentId === id; });
      if (s){ s.pin = v; saveRoster(roster); }
      closeModal();
      toast('PIN updated.');
    }
    $('zk-newpin-ok').addEventListener('click', attempt);
    if (input) input.addEventListener('keydown', function(e){ if (e.key === 'Enter') attempt(); });
  }

  /* ====================================================================
     TEACHER TOOLS (simple — not a full admin panel)
     ==================================================================== */
  // I6H-D11B: destructive finals ALWAYS re-request the PIN — the cached
  // session unlock is not enough for Reset / Delete.
  function requireTeacherPinFresh(onOk){
    promptPin({
      title: 'Teacher PIN required',
      sub: 'Confirm this action \u00b7 \u062f \u069a\u0648\u0648\u0646\u06a9\u064a \u067e\u0646 \u062f \u062a\u0623\u06cc\u06cc\u062f \u0644\u067e\u0627\u0631\u0647',
      verify: function(v){ return v === getTeacherPin(); },
      onOk: function(){ if (onOk) onOk(); }
    });
  }

  function teacherTools(){ requireTeacher(_teacherTools); }
  function _teacherTools(){
    var roster = getRoster().map(normalize);
    var list = roster.length ? roster.map(function(s){
      return '<div class="zk-li">'+avatarHTML(s,40)+
        '<div class="grow"><div class="nm">'+esc(s.fullName)+'</div>'+
        '<div class="id">'+esc(s.studentId)+' · '+esc(s.track||'—')+' · '+esc(s.status)+'</div></div>'+
        '<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile.editStudent(\''+esc(s.studentId)+'\')">Edit</button>'+
        '<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile.openClassControls(\''+esc(s.studentId)+'\')">Class</button>'+
        '<button class="zk-btn zk-btn-ghost zk-mini" onclick="window.ZirakLearningPlan&&window.ZirakLearningPlan.openTeacherPlan(\''+esc(s.studentId)+'\')">\uD83D\uDCDA Plan</button>'+
        '<button class="zk-btn zk-btn-danger zk-mini" onclick="ZirakProfile.openDangerZone(\''+esc(s.studentId)+'\')">\u26A0 Manage</button>'+
      '</div>';
    }).join('') : '<div class="zk-note">No students yet.</div>';

    openModal(
      '<h3>Teacher Tools</h3><div class="msub">Roster, settings &amp; backup · ﺩ ښوونکي وسایل</div>'+
      '<div class="zk-actions" style="margin-top:6px;">'+
        '<button class="zk-btn zk-btn-gold" onclick="ZirakProfile.addStudent()">＋ Add Student</button>'+
        '<button class="zk-btn zk-btn-primary" onclick="closeModal();navigate(\'teacher-command-center\');window.ZirakTeacherCommandCenter&&ZirakTeacherCommandCenter.open()">📊 Teacher Command Center</button>'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.openAppSettings()">⚙️ App Settings</button>'+
      '</div>'+
      '<div class="zk-list">'+list+'</div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.exportRoster()">⬇ Export students</button>'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.importRosterPrompt()">⬆ Import students</button>'+
      '</div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.changeTeacherPin()">🔑 Change Teacher PIN</button>'+
        (sessionRaw() ? '' : '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.previewApp()">👁 Open app (preview)</button>')+
      '</div>'+
      '<div class="zk-danger-section">'+
        '<div class="zk-danger-title">\uD83D\uDEE1 Privacy / Danger Zone</div>'+
        '<div class="zk-note" style="margin:4px 0 0;">Reset Student Progress and Delete Student Profile live behind each student\u2019s <b>\u26A0 Manage</b> button above. Both require the Teacher PIN again and a clear confirmation \u2014 nothing destructive runs on one tap.</div>'+
      '</div>'+
      '<div class="zk-note">Default Teacher PIN is <b>1234</b> \u2014 change it from \u201cChange Teacher PIN\u201d.</div>'+
      '<div class="zk-actions"><button class="zk-btn zk-btn-primary zk-btn-block" onclick="ZirakProfile._closeModal()">Done</button></div>'
    );
  }
  function addStudent(){ requireTeacher(function(){ openAdmissionForm(null); }); }
  function editStudent(id){ requireTeacher(function(){ openAdmissionForm(id); }); }
  /* ── I6H-D11B: Privacy / Danger Zone (per student) ─────────────────── */
  function openDangerZone(id){
    requireTeacher(function(){
      var s = getRoster().map(normalize).find(function(x){ return x.studentId === id; });
      if (!s) return;
      var keyCount = getStudentStorageKeys(id).length;
      openModal(
        '<h3>\uD83D\uDEE1 Privacy / Danger Zone</h3>'+
        '<div class="msub"><b>'+esc(s.fullName)+'</b> \u00b7 '+esc(id)+' \u00b7 '+keyCount+' stored records on this device</div>'+
        '<div class="zk-actions" style="margin-top:10px;">'+
          '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.exportStudentData(\''+esc(id)+'\')">\uD83D\uDCE6 Export Student Backup</button>'+
          '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.importStudentDataPrompt(\''+esc(id)+'\')">\u21A9 Restore Student Backup</button>'+
        '</div>'+
        '<div class="zk-danger-section">'+
          '<div class="zk-danger-title">Destructive actions</div>'+
          '<div class="zk-actions">'+
            '<button class="zk-btn zk-btn-danger" onclick="ZirakProfile.confirmResetProgress(\''+esc(id)+'\')">\uD83D\uDD04 Reset Student Progress</button>'+
            '<button class="zk-btn zk-btn-danger" onclick="ZirakProfile.confirmResetPlacement(\''+esc(id)+'\')">\uD83C\uDF93 Reset Level and Placement Data</button>'+
            '<button class="zk-btn zk-btn-danger" onclick="ZirakProfile.confirmDeleteProfile(\''+esc(id)+'\')">\uD83D\uDDD1 Delete Student Profile</button>'+
          '</div>'+
          '<div class="zk-note">Both actions ask for the Teacher PIN again. Delete also requires typing the student ID.</div>'+
        '</div>'+
        '<div class="zk-actions"><button class="zk-btn zk-btn-primary zk-btn-block" onclick="ZirakProfile.teacherTools()">\u2190 Back to Teacher Tools</button></div>'
      );
    });
  }

  function confirmResetProgress(id){
    var s = getRoster().map(normalize).find(function(x){ return x.studentId === id; });
    if (!s) return;
    openModal(
      '<h3>Reset '+esc(s.fullName)+'\u2019s progress?</h3>'+
      '<div class="msub">This will remove learning progress, quizzes, assessments, reports, certificates, and practice history for this student on this device.<br><br><b>The student profile and identity will remain.</b></div>'+
      '<label class="zk-check-row"><input type="checkbox" id="zk-keep-level" checked> Keep current accepted level (uncheck to require the Placement Test again)</label>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.openDangerZone(\''+esc(id)+'\')">Cancel</button>'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.exportStudentData(\''+esc(id)+'\')">\uD83D\uDCE6 Export Backup First</button>'+
        '<button class="zk-btn zk-btn-danger" onclick="ZirakProfile._resetStage2(\''+esc(id)+'\')">Reset Progress</button>'+
      '</div>'
    );
  }
  function _resetStage2(id){
    var keep = true;
    try { var cb = $('zk-keep-level'); if (cb) keep = !!cb.checked; } catch(e){}
    requireTeacherPinFresh(function(){
      // Second, final confirmation — never one accidental tap.
      var s = getRoster().map(normalize).find(function(x){ return x.studentId === id; });
      if (!s) return;
      openModal(
        '<h3>Final confirmation</h3>'+
        '<div class="msub">Reset ALL progress for <b>'+esc(s.fullName)+'</b> ('+esc(id)+')? '+(keep?'The current accepted level will be kept.':'The level will be cleared \u2014 the Placement Test will be required again.')+'</div>'+
        '<div class="zk-actions">'+
          '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.openDangerZone(\''+esc(id)+'\')">Cancel</button>'+
          '<button class="zk-btn zk-btn-danger" onclick="ZirakProfile._resetFinal(\''+esc(id)+'\','+(keep?'true':'false')+')">Yes, Reset Progress</button>'+
        '</div>'
      );
    });
  }
  function _resetFinal(id, keepLevel){
    var r = resetStudentProgress(id, { keepLevel: keepLevel !== false && keepLevel !== 'false' });
    closeModal();
    toast('Progress reset \u2014 ' + r.removed + ' records removed. Profile kept.');
    try { if (window.ZirakAcademyTests && window.ZirakAcademyTests.refreshPlacementOnboardingCard) window.ZirakAcademyTests.refreshPlacementOnboardingCard(); } catch(e){}
    _teacherTools();
  }

  /* ── I6H-D12: Reset Level and Placement Data ─────────────────────
     Removes accepted placement status, the active placement session, and
     placement history for ONE student, returning them to new/unplaced
     onboarding. Ordinary learning/progress data is NOT touched.
     I6H-D12A Task 28: also removes the new corruption-recovery backup
     keys, stated explicitly in the confirmation dialog below. */
  var PLACEMENT_KEYS = ['placement_accepted','placement_result','placement_date',
    'placement_suggested_class','school_placement_level','school_class',
    'school_unit','school_started','lp_start_level',
    'placement_session','placement_history','placement_last_result',
    'placement_administered_last','placement_session_backup',
    'placement_history_corrupt_backup','placement_session_corrupt_backup'];
  function confirmResetPlacement(id){
    var s = getRoster().map(normalize).find(function(x){ return x.studentId === id; });
    if (!s) return;
    openModal(
      '<h3>\uD83C\uDF93 Reset Level and Placement Data</h3>'+
      '<div class="msub">This removes <b>'+esc(s.fullName)+'</b>\u2019s accepted level, active placement session, placement history, any placement data-recovery backups, and the active Personalized Learning Plan on this device (past plan-cycle history is kept). The student returns to \u201cChoose Your Starting Level\u201d. Learning progress is NOT touched.</div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.openDangerZone(\''+esc(id)+'\')">Cancel</button>'+
        '<button class="zk-btn zk-btn-danger" onclick="ZirakProfile._resetPlacementFinal(\''+esc(id)+'\')">Reset Level &amp; Placement</button>'+
      '</div>'
    );
  }
  function _resetPlacementFinal(id){
    requireTeacherPinFresh(function(){
      var removed = 0;
      PLACEMENT_KEYS.forEach(function(base){
        [LS_BASE + 'u_' + id + '_' + base, 'u_' + id + '_' + base].forEach(function(full){
          try { if (localStorage.getItem(full) !== null) { localStorage.removeItem(full); removed++; } } catch(e){}
        });
      });
      var roster = getRoster();
      var idx = roster.findIndex(function(x){ return x.studentId === id; });
      if (idx > -1) { roster[idx].level = ''; saveRoster(roster); }
      // I6H-D13: the active plan is invalidated together with the level
      // it was built from (plan-CYCLE HISTORY is a separate key, not in
      // PLACEMENT_KEYS above, and is intentionally preserved).
      try { if (window.ZirakLearningPlan && window.ZirakLearningPlan.onResetLevelAndPlacement) window.ZirakLearningPlan.onResetLevelAndPlacement(id); } catch(e){}
      closeModal();
      toast('Level and placement data reset (' + removed + ' records removed).');
      try { if (window.ZirakAcademyTests && window.ZirakAcademyTests.refreshPlacementOnboardingCard) window.ZirakAcademyTests.refreshPlacementOnboardingCard(); } catch(e){}
      try { if (window.ZirakLearningPlan && window.ZirakLearningPlan.refreshDashboardCard) window.ZirakLearningPlan.refreshDashboardCard(); } catch(e){}
      _teacherTools();
    });
  }

  function confirmDeleteProfile(id){
    var s = getRoster().map(normalize).find(function(x){ return x.studentId === id; });
    if (!s) return;
    openModal(
      '<h3>\uD83D\uDDD1 Delete Student Profile</h3>'+
      '<div class="msub"><b>This permanently removes '+esc(s.fullName)+' ('+esc(id)+')</b> and ALL of that student\u2019s learning data from this device \u2014 profile, progress, assessments, reports, certificates, archive and practice history. This cannot be undone.</div>'+
      '<div class="zk-field"><div class="zk-note">Type the student ID to confirm deletion:</div>'+
        '<input id="zk-del-typed" class="zk-input" type="text" autocomplete="off" placeholder="'+esc(id)+'" style="text-align:center;letter-spacing:1px;"></div>'+
      '<div id="zk-del-err" class="zk-note" style="color:var(--red-text,#c0392b);display:none;">Typed ID does not match.</div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.openDangerZone(\''+esc(id)+'\')">Cancel</button>'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.exportStudentData(\''+esc(id)+'\')">\uD83D\uDCE6 Export Backup First</button>'+
        '<button class="zk-btn zk-btn-danger" onclick="ZirakProfile._deleteStage2(\''+esc(id)+'\')">Delete Student Profile</button>'+
      '</div>'
    );
    // Deliberately NO Enter-key shortcut here — deletion must be an explicit tap.
  }
  function _deleteStage2(id){
    var typed = '';
    try { var inp = $('zk-del-typed'); typed = inp ? (inp.value||'').trim() : ''; } catch(e){}
    if (typed !== id){
      var err = $('zk-del-err'); if (err) err.style.display = 'block';
      return; // exact match required — wrong ID changes nothing
    }
    requireTeacherPinFresh(function(){
      var r = deleteStudentCompletely(id);
      closeModal();
      toast('Student profile deleted from this device (' + r.removed + ' records removed).');
      if (!r.wasActive){ if ($('zk-overlay')) buildLogin(); _teacherTools(); }
      // If the deleted student was active, deleteStudentCompletely logs out
      // and reloads to the profile-selection screen.
    });
  }
  // Legacy entry kept as an alias to the safe flow (no second implementation).
  function deleteStudent(id){ openDangerZone(id); }
  function _confirmDelete(id){ openDangerZone(id); }
  function changeTeacherPin(){
    requireTeacher(function(){
      openModal(
        '<h3>Change Teacher PIN</h3><div class="msub">Enter a new Teacher PIN (4–8 digits).</div>'+
        '<div class="zk-field"><input id="zk-tpin" class="zk-input" type="text" inputmode="numeric" maxlength="8" '+
          'style="letter-spacing:5px;text-align:center;font-size:20px;" placeholder="e.g. 4321"></div>'+
        '<div id="zk-tpin-err" class="zk-note" style="color: var(--red-text,#c0392b);display:none;">PIN must be 4–8 digits.</div>'+
        '<div class="zk-actions">'+
          '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.teacherTools()">Cancel</button>'+
          '<button class="zk-btn zk-btn-primary" id="zk-tpin-ok">Save</button>'+
        '</div>'
      );
      $('zk-tpin-ok').addEventListener('click', function(){
        var v = ($('zk-tpin').value||'').trim();
        if (!/^[0-9]{4,8}$/.test(v)){ $('zk-tpin-err').style.display='block'; return; }
        setTeacherPin(v); closeModal(); toast('Teacher PIN changed.');
      });
    });
  }
  function openAppSettings(){
    requireTeacher(function(){
      closeModal();
      if (typeof window.__origOpenSettings === 'function') window.__origOpenSettings();
      else if (typeof window.openSettings === 'function') window.openSettings();
    });
  }
  function previewApp(){ requireTeacher(function(){ loginPreview(); }); }

  /* ---------- roster export / import (minimal; for moving devices) ---------- */
  function exportRoster(){
    var data = { app:'ZIRAK-ELA', kind:'roster', exportedAt:new Date().toISOString(), students:getRoster() };
    var blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'zirak-students-'+todayISO()+'.json';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 1500);
  }
  function importRosterPrompt(){
    openModal(
      '<h3>Import students</h3><div class="msub">Choose a Zirak students export (.json). Existing students with the same ID are updated; new ones are added.</div>'+
      '<div class="zk-field"><input id="zk-imp" class="zk-input" type="file" accept="application/json,.json"></div>'+
      '<div id="zk-imp-msg" class="zk-note"></div>'+
      '<div class="zk-actions"><button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.teacherTools()">Back</button></div>'
    );
    $('zk-imp').addEventListener('change', function(e){
      var f = e.target.files && e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function(ev){
        try {
          var d = JSON.parse(ev.target.result);
          var incoming = Array.isArray(d) ? d : (d.students || []);
          if (!Array.isArray(incoming)) throw new Error('bad');
          var roster = getRoster();
          var added=0, updated=0;
          incoming.forEach(function(raw){
            var s = normalize(raw);
            if (!s.studentId) return;
            var i = roster.findIndex(function(x){ return x.studentId === s.studentId; });
            if (i>=0){ roster[i] = s; updated++; } else { roster.push(s); added++; }
          });
          saveRoster(roster);
          $('zk-imp-msg').innerHTML = '<b style="color: var(--emerald-text,#1a6b4a)">Imported.</b> Added '+added+', updated '+updated+'.';
        } catch(err){ $('zk-imp-msg').innerHTML = '<b style="color: var(--red-text,#c0392b)">Could not read this file.</b>'; }
      };
      rd.readAsText(f);
    });
  }

  /* ====================================================================
     STUDENT DASHBOARD (prepended to Home) + FLOATING CHIP
     ==================================================================== */
  // Count of the active student's saved weak words (error bank).
  // NOTE: defined here to back the dashboard's "Weak parts" chip. Reads the
  // per-student-namespaced 'zirak_error_bank' written by app.js (G2). Safe if
  // empty/missing. (Fixes a previously-undefined reference in renderDashboard.)
  function weakCount(){
    try {
      var key = (window.ZirakStorageKey ? window.ZirakStorageKey('zirak_error_bank') : 'zirak_error_bank');
      var raw = localStorage.getItem(key);
      if (!raw) return 0;
      var bank = JSON.parse(raw);
      return bank && typeof bank === 'object' ? Object.keys(bank).length : 0;
    } catch(e){ return 0; }
  }

  /* I6H-D12A Task 24: Profile shows Current Level, Level Source, Latest
     Recommendation, Confidence, Decision Status, Decision Date, Teacher
     Review status, and links to View Latest Report / View Placement
     History — all sourced from the ONE Placement Engine, read-only. */
  function placementProfileLine(s){
    try {
      if (!window.ZirakPlacementEngine || typeof window.ZirakPlacementEngine.getResult !== 'function') return '';
      var latest = window.ZirakPlacementEngine.getResult();
      if (!latest) return '';
      var d = latest.diagnostic, dec = latest.decision || {};
      var status = dec.decisionStatus || 'pending';
      var decisionTxt = status === 'pending' ? 'Decision required'
        : status === 'acceptedRecommendation' ? 'Accepted'
        : status === 'manualLevelSelected' ? 'Selected manually'
        : status === 'teacherConfirmedRecommendation' ? 'Teacher confirmed'
        : status === 'teacherSelectedDifferentLevel' ? 'Teacher selected a different level'
        : status === 'keptExistingLevel' ? 'Teacher kept existing level'
        : status === 'retestRequested' ? 'Retest requested'
        : status === 'supersededByRetake' ? 'Superseded by a later retake' : '';
      return '<div class="zk-placement-line">' +
        '🎓 Recommended: <b>' + esc(d.recommendedLevelName) + '</b>' +
        ' (' + esc(d.confidence) + ' confidence)' +
        ' · Current Level: <b>' + esc(s.level || '\u2014') + '</b>' +
        ' · ' + esc(decisionTxt) +
        (dec.decisionAt ? ' (' + esc(String(dec.decisionAt).slice(0,10)) + ')' : '') +
        (d.teacherReviewRecommended && status === 'pending' ? ' · Teacher review recommended' : '') +
        ' · <a href="javascript:void(0)" onclick="navigate(\'path\');showSchoolTab(\'placement\');window.ZirakPlacementEngine.openPlacementReport();">View Latest Report</a>' +
        ' · <a href="javascript:void(0)" onclick="navigate(\'path\');showSchoolTab(\'placement\');window.ZirakPlacementEngine.openPlacementHistory();">View Placement History</a>' +
        '</div>';
    } catch(e){ return ''; }
  }

  function renderDashboard(){
    var home = $('screen-home'); if (!home) return;
    var holder = $('zk-dashboard');
    var s = currentStudent();
    if (!s){ if (holder) holder.remove(); return; }   // preview / not logged in
    s = normalize(s);

    if (!holder){
      holder = document.createElement('div');
      holder.id = 'zk-dashboard';
      home.insertBefore(holder, home.firstChild);
    }

    var hasResume = !!(s.lastPage || s.lastActivity || s.lastUpdated);
    var resumeBlock = hasResume
      ? '<div class="resume">↩ <b>Resume:</b> '+esc(s.lastActivity || ('screen "'+s.lastPage+'"'))+
        (s.lastPage ? '' : '') +
        '<div style="opacity:.8;margin-top:3px;">Last page: '+esc(s.lastPage || '—')+
        (s.lastUpdated ? ' · '+esc(new Date(s.lastUpdated).toLocaleString()) : '')+'</div></div>'
      : '<div class="resume">🌱 Start your first class. · خپل لومړی درس پیل کړئ.</div>';

    var weak = weakCount();
    var tnote = s.teacherNotes ? '<div class="tnote">📝 Teacher note: '+esc(s.teacherNotes)+'</div>' : '';

    // ----- I6H-D15A (Task 7): the official Today's Class block reads
    // from ZirakAcademicProgram (inside renderTodayClassBlock). The
    // legacy ZirakClassPath timetable is no longer computed here and is
    // never presented as the official class. -----
    var plan = null;

    // ----- Phase 3: Today's Class block -----
    var todayHtml = renderTodayClassBlock(s, plan);

    // PHASE: Teaching Display & Voice Professionalization Fix — Part 5
    // Personalized welcome (never the bare generic "Welcome" the brief
    // explicitly disallows) — uses the active student's profile name.
    var title = (s.gender === 'Male') ? 'Mr. ' : (s.gender === 'Female') ? 'Ms. ' : '';
    var firstName = (s.fullName||'Student').trim().split(/\s+/)[0] || 'Student';
    var greetName = title + firstName;
    var welcomeMsg = 'Welcome back, ' + greetName + '. Today you will continue your English class path at ' +
      ACAD.nameEn + '. Stay focused, speak clearly, complete your lesson blocks step by step, and review your weak parts.';
    // PHASE I4: the SPOKEN welcome is guided — it names the Month/Week/Day,
    // the completed-block count, and the next task (with a safe fallback).
    var spokenWelcome = buildGuidedWelcome(greetName, plan);

    holder.innerHTML =
      '<div class="top">'+avatarHTML(s,58)+
        '<div><div class="hi">Welcome back · هرکلی</div>'+
          '<div class="nm">'+esc(s.fullName||'Student')+'</div>'+
          '<div class="meta">'+esc(s.studentId)+'</div>'+
        '</div></div>'+
      '<div class="zirak-home-welcome">'+esc(welcomeMsg)+'</div>'+
      '<div class="chips">'+
        '<span class="chip">Batch: <b>'+esc(s.batch||'—')+'</b></span>'+
        homeAcademicIdentityChips(s) +
        '<span class="chip">Weak parts: <b>'+weak+'</b></span>'+
        '<span class="chip">📅 Attended: <b>'+esc(s.attendanceCount||0)+'</b></span>'+
      '</div>'+
      placementProfileLine(s) +
      resumeBlock + tnote + todayHtml +
      '<div class="dactions">'+
        (digits(s.fatherWhatsApp) ? '<button class="zk-btn zk-btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.4);" onclick="ZirakProfile.waReport()">🟢 WhatsApp Father</button>'
          : '<button class="zk-btn zk-btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.4);opacity:.6;" disabled>🟢 WhatsApp (no number)</button>')+
      '</div>';

    // PHASE: Teaching Display & Voice Professionalization Fix — Part 5
    // Speak the welcome ONCE per page load/login. renderDashboard() is
    // called repeatedly during a session (block-complete, auto-advance,
    // etc.) — the module-level _zkWelcomeSpoken flag (reset only on a
    // fresh page load / new login) prevents it from repeating.
    // PHASE I6A: also respect the global Auto Read setting — Manual mode
    // means Home does not auto-speak. Defaults ON, so behaviour is unchanged
    // unless the student turns Auto Read OFF.
    var _autoReadOn = (typeof window.ZirakAutoReadOn === 'function') ? window.ZirakAutoReadOn() : true;
    if (_autoReadOn && !_zkWelcomeSpoken && typeof window.speak === 'function') {
      _zkWelcomeSpoken = true;
      try { window.speak(spokenWelcome, 'en'); } catch(e){}
    }
    // PHASE I4: gently scroll the next task into view + pulse it ONCE, after
    // a short delay, on the first Home load. It never repeats here, so it
    // will not fight the student if they later scroll away.
    if (!_zkHomeGuided){
      _zkHomeGuided = true;
      setTimeout(scrollToCurrentClassBlock, 900);
    }
  }

  // PHASE I4 — guided spoken welcome (Month/Week/Day + progress + next task).
  /* ----- I6H-D15B (Task 4): the ONE function producing Home's academic-
     identity chips. Accepted Class and Learner Pathway come exclusively
     from ZirakAcademicProgram (the real accepted-level + pathway
     authority) — never from the raw, unvalidated legacy roster fields
     (s.level, s.track, s.currentMonth/Week/Day), which cannot override
     this real identity even when they hold conflicting values. ----- */
  function homeAcademicIdentityChips(s){
    if (!s || !s.studentId) return '';
    var prof = null;
    try { if (window.ZirakAcademicProgram) prof = window.ZirakAcademicProgram.getStudentAcademicProfile(s.studentId); } catch(e){ prof = null; }
    var acceptedLabel = 'Not yet placed';
    try {
      if (prof && prof.acceptedLevelId && window.ZirakAcademicProgram) {
        var info = window.ZirakAcademicProgram.levelInfo(prof.acceptedLevelId);
        if (info) acceptedLabel = info.en;
      }
    } catch(e){}
    var pathwayLabel = 'Not yet set';
    try {
      if (prof && prof.learnerPathwayId && window.ZirakAcademicProgram) {
        var pw = window.ZirakAcademicProgram.LEARNER_PATHWAYS.find(function(p){ return p.id === prof.learnerPathwayId; });
        if (pw) pathwayLabel = pw.en;
      }
    } catch(e){}
    var statusLabel = 'Curriculum content pending';
    try {
      var today = window.ZirakAcademicProgram ? window.ZirakAcademicProgram.getTodayClass(s.studentId) : null;
      if (today && today.status && today.status !== 'curriculum-not-populated') statusLabel = today.status;
    } catch(e){}
    return '<span class="chip">Accepted Class: <b>'+esc(acceptedLabel)+'</b></span>'+
      '<span class="chip">Learner Pathway: <b>'+esc(pathwayLabel)+'</b></span>'+
      '<span class="chip">Official Curriculum: <b>'+esc(statusLabel)+'</b></span>';
  }

  /* ----- Phase 3 (superseded I6H-D15A): render the "Today's Class"
     block inside the dashboard. This now reads from the ONE official
     academic authority (ZirakAcademicProgram.getTodayClass), never the
     legacy ZirakClassPath nine-block timetable. The legacy system
     remains available only under Teacher Tools -> Legacy Class Path
     (historical compatibility), never as the student's official route. ----- */
  function renderTodayClassBlock(s, planIn){
    if (!s || !s.studentId) return '';
    var today = null;
    try { if (window.ZirakAcademicProgram) today = window.ZirakAcademicProgram.getTodayClass(s.studentId); } catch(e){ today = null; }
    if (!today) return '';

    if (today.status === 'curriculum-not-populated'){
      var reasonLine = (today.reason === 'no-accepted-level')
        ? '<div class="zk-cp-meta">This student has not yet accepted a Placement level.</div>'
        : '';
      return '<div class="zk-cp-card">'+
        '<div class="zk-cp-head">📚 Today\u2019s Class · نننی ټولګی</div>'+
        '<div class="zk-cp-title">Today\u2019s official curriculum has not yet been populated for this level and week.</div>'+
        reasonLine +
        '<div class="zk-cp-meta" style="opacity:.85;">'+esc(today.teacherMessage || '')+'</div>'+
        '<div class="zk-cp-arcade-removed-note" style="display:none;"></div>'+
        '<div class="dactions" style="margin-top:10px;">'+
          '<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile.previewWeeklyStructure()">📅 Preview Weekly Structure</button>'+
          '<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile.openFreePracticeFromHome()">🧩 Open Free Practice</button>'+
          '<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile.openExistingLearningPlanFromHome()">📖 Open Existing Learning Plan</button>'+
          '<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile.reviewCurriculumStatus()">ℹ️ Review Curriculum Status</button>'+
        '</div>'+
      '</div>';
    }

    // Reserved for Phase 2, once getTodayClass() can return a genuinely
    // populated lesson (status something other than 'curriculum-not-populated').
    // No fabricated content is ever rendered here in the meantime.
    return '<div class="zk-cp-card"><div class="zk-cp-head">📚 Today\u2019s Class · نننی ټولګی</div>'+
      '<div class="zk-cp-title">'+esc(today.theme || '')+'</div>'+
    '</div>';
  }

  // I6H-D15A (Task 9): Teacher-facing weekly-structure preview using the
  // real D15 90-minute template — never claims real lesson content exists.
  function previewWeeklyStructure(){
    try {
      if (!window.ZirakAcademicProgram) { toast('Academic Program is not available.'); return; }
      var tmpl = window.ZirakAcademicProgram.buildDefaultWeeklyTemplate();
      var c = window.ZirakAcademicProgram.DAILY_CONTRACT;
      var rows = tmpl.days.map(function(d){
        var blockNames = d.blocks.map(function(b){ return b.type + ' (' + b.minutes + 'm)'; }).join(', ');
        return '<div class="zk-cp-row"><b>Day '+d.dayNumber+'</b> — '+esc(d.theme)+'<div style="opacity:.75;font-size:.85em;">'+esc(blockNames)+'</div></div>';
      }).join('');
      openModal(
        '<h3>Weekly Structure Preview</h3>'+
        '<div class="msub">Every day: Class Readiness &amp; Homework Check ('+c.openingMinutes+'m) \u2192 Video Learning ('+c.videoMinutes+'m) \u2192 Academic Core ('+c.coreMinutes+'m) \u2192 Teacher Closing ('+c.closingMinutes+'m) = '+c.totalMinutes+' minutes.</div>'+
        '<div style="margin-top:10px;">'+rows+'</div>'+
        '<div class="msub" style="margin-top:10px;">This is the structural template only. Real lesson content is populated in Phase 2.</div>'+
        '<div class="zk-actions" style="margin-top:10px;"><button class="zk-btn zk-btn-ghost" onclick="closeModal()">Close</button></div>'
      );
    } catch(e){ toast('Could not load the weekly structure preview.'); }
  }
  function openFreePracticeFromHome(){
    buildFreePracticeHubScreen();
    renderFreePracticeHubScreen();
    if (typeof window.navigate === 'function') window.navigate('free-practice-hub');
  }
  /* ----- I6H-D15B (Task 5): the ONE Free Practice entry point. Links to
     every existing feature via the exact real navigate() screen names —
     no new learning engine, no relabeling of School Path alone as Free
     Practice. Browsing this hub never marks any official curriculum
     item complete. ----- */
  function buildFreePracticeHubScreen(){
    if ($('screen-free-practice-hub')) return;
    var app = $('app') || document.body;
    var sec = document.createElement('section');
    sec.className = 'screen';
    sec.id = 'screen-free-practice-hub';
    sec.setAttribute('role','main');
    sec.innerHTML = '<div id="zk-fp-hub"></div>';
    app.appendChild(sec);
  }
  function renderFreePracticeHubScreen(){
    var host = $('zk-fp-hub'); if (!host) return;
    var items = [
      { screen:'path', icon:'🎓', en:'School Path Library', note:'Guided units and steps (one option among many, not the whole of Free Practice)' },
      { screen:'grammar', icon:'📘', en:'Grammar', note:'Grammar World topics and Grammar Lab' },
      { screen:'wordlab', icon:'🔤', en:'Word Lab', note:'Vocabulary sets and word practice' },
      { screen:'listening', icon:'🎧', en:'Listening', note:'Listening bank practice' },
      { screen:'dialogue', icon:'💬', en:'Dialogues', note:'Dialogue Wizard practice' },
      { screen:'stories', icon:'📖', en:'Stories', note:'Story reading practice' },
      { screen:'topics', icon:'🗣️', en:'Topics', note:'Topic Studio speaking practice' },
      { screen:'interview-wizard', icon:'🎤', en:'Interview Practice', note:'Interview Wizard practice' },
      { screen:'review', icon:'⚡', en:'Quick Practice', note:'Fast review and weak-parts practice' }
    ];
    var cards = items.map(function(it){
      return '<button class="zk-fp-card" onclick="ZirakProfile.openFreePracticeArea(\''+it.screen+'\')" '+
        'style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:14px;margin-bottom:8px;'+
        'border-radius:12px;border:1px solid var(--border,rgba(26,58,92,.14));background:var(--card,#fff);cursor:pointer;">'+
        '<span style="font-size:22px;">'+it.icon+'</span>'+
        '<span><div style="font-weight:700;">'+esc(it.en)+'</div>'+
        '<div style="font-size:.85em;opacity:.75;">'+esc(it.note)+'</div></span>'+
      '</button>';
    }).join('');
    host.innerHTML = '<div class="page-header"><h1>Free Practice</h1>'+
      '<div class="dari" style="font-size:15px;color:rgba(255,255,255,.85);">آزاده تمرین \u2014 explore any area; this does not complete the official curriculum</div></div>'+
      '<div style="padding:12px;">'+cards+
      '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.gotoHomeFromHub()" style="margin-top:8px;">\u2190 Back to Home</button>'+
      '</div>';
  }
  function openFreePracticeArea(screen){
    if (typeof window.navigate === 'function') window.navigate(screen);
  }
  function gotoHomeFromHub(){ if (typeof window.navigate === 'function') window.navigate('home'); }
  function openExistingLearningPlanFromHome(){
    try {
      if (typeof window.navigate === 'function') window.navigate('personal-plan');
    } catch(e){}
  }
  function reviewCurriculumStatus(){
    openModal(
      '<h3>Curriculum Status</h3>'+
      '<div class="msub">The full six-month official curriculum has not yet been populated. '+
      'The Academic Operating System (level authority, 90-minute class contract, weekly coverage rules) is complete and active. '+
      'Real daily lesson content is scheduled for Phase 2.</div>'+
      '<div class="zk-actions" style="margin-top:10px;"><button class="zk-btn zk-btn-ghost" onclick="closeModal()">Close</button></div>'
    );
  }

  function buildGuidedWelcome(greetName, plan){
    return 'Welcome back, ' + greetName + '. Let us continue your English class. ' +
           'Complete your lesson blocks step by step and review your weak parts.';
  }

  // PHASE I4 — scroll the current/next block into view and pulse it briefly.
  // Called once on first Home load and again after a block is completed.
  function scrollToCurrentClassBlock(){
    try {
      var row = document.querySelector('#zk-dashboard .zk-cp-row.current');
      if (!row) return;
      row.classList.add('zk-cp-guide');
      setTimeout(function(){ try { row.scrollIntoView({ behavior:'smooth', block:'center' }); } catch(e){} }, 120);
      setTimeout(function(){ try { row.classList.remove('zk-cp-guide'); } catch(e){} }, 2800);
    } catch(e){}
  }

  // PHASE I4 — clear, professional action label for a class block button.
  function blockOpenLabel(b){
    if (b && b.linkedPage){
      var pageMap = {
        dialogue:'Open Dialogue', review:'Review Weak Parts', grammar:'Open Grammar',
        listening:'Listening Review', wordlab:'Word Wizard', topics:'Open Topics',
        stories:'Open Stories', 'interview-wizard':'Interview Wizard'
      };
      return pageMap[b.linkedPage] || ('Open ' + b.linkedPage);
    }
    var typeMap = {
      teacher:'Teacher Info', pair:'Pair Info', homework:'Homework Info',
      arcade:'Locked', attendance:'Info'
    };
    return (b && typeMap[b.type]) || 'Pending';
  }

  // PHASE I4 — completion-card buttons.
  function goReviewWeak(){ if (typeof window.navigate==='function') window.navigate('review'); }
  function goReviewResults(){ if (typeof window.navigate==='function') window.navigate('progress'); }

  function continueClass(){
    var s = currentStudent();
    var target = (s && s.lastPage) ? s.lastPage : 'path';
    if (typeof window.navigate === 'function') window.navigate(target);
  }

  /* ====================================================================
     PHASE 3 — CLASS PATH UI GLUE (student side)
     ==================================================================== */
  function classBlockOpen(blockKey){
    if (!window.ZirakClassPath) return;
    var r = window.ZirakClassPath.openClassBlock(blockKey);
    if (r && r.placeholder){
      // teacher-only / placeholder blocks: show + SPEAK a clear instruction
      // instead of navigating (the app cannot run these automatically).
      var labels = {
        teacher:  'Teacher activity. The teacher will use a classroom book, video, or workbook here. When finished, press Mark Done.',
        pair:     'Pair speaking. Practice with a partner as the teacher instructs. When finished, press Mark Done.',
        arcade:   'Learning Arcade is locked. Finish your learning blocks first.',
        homework: 'Homework and father report. The teacher will guide this. When finished, press Mark Done.',
        attendance:'Attendance is recorded automatically when you log in.'
      };
      var note = labels[r.type] || 'This block has no page yet. Content is pending.';
      toast(note);
      if (typeof window.speak === 'function'){ try { window.speak(note, 'en'); } catch(e){} }
    }
  }
  function classBlockComplete(blockKey){
    if (!window.ZirakClassPath) return;
    window.ZirakClassPath.markClassBlockComplete(blockKey);
    renderDashboard();
    // PHASE I4: success + spoken next-step + re-guide to the new next block.
    var s = currentStudent();
    var plan = null;
    try { plan = window.ZirakClassPath.getTodayClassPlan(s); } catch(e){}
    var next = null;
    if (plan){ for (var i=0;i<plan.blocks.length;i++){ if (!plan.blocks[i].complete){ next = plan.blocks[i]; break; } } }
    if (next){
      toast('Block complete ✅ · Next: ' + next.name);
      if (typeof window.speak === 'function'){ try { window.speak('Well done. Your next task is ' + next.name + '. Press Open to begin.', 'en'); } catch(e){} }
    } else {
      var nm = (s && s.fullName) ? (s.fullName.trim().split(/\s+/)[0] || '') : '';
      toast('Today’s class is complete 🎉');
      if (typeof window.speak === 'function'){ try { window.speak('Excellent work' + (nm?', '+nm:'') + '. Today’s class is complete. Review your weak parts before leaving.', 'en'); } catch(e){} }
    }
    setTimeout(scrollToCurrentClassBlock, 250);
  }
  function resumeClass(){
    // I6H-D15A (Task 7/8): the legacy ZirakClassPath.resumeTodayClass()
    // route is retired from the official student flow. Until Phase 2
    // populates the real curriculum, "Continue Today's Class" resumes
    // the student's existing continuation point (their last page, or
    // Free Practice) — never the legacy nine-block timetable.
    continueClass();
  }

  /* ====================================================================
     PHASE 3 — TEACHER CLASS-PATH CONTROLS (teacher-gated by caller)
     ==================================================================== */
  function openClassControls(studentId){
    requireTeacher(function(){ _classControls(studentId); });
  }
  function _classControls(studentId){
    var s = getRoster().map(normalize).filter(function(x){ return x.studentId===studentId; })[0];
    if (!s) return;
    function optList(list, val){ return list.map(function(o){
      return '<option value="'+esc(o)+'"'+(o===val?' selected':'')+'>'+esc(o)+'</option>'; }).join(''); }
    function numOpts(n, val){ var o=''; for (var i=1;i<=n;i++){ o+='<option value="'+i+'"'+(i===(val||1)?' selected':'')+'>'+i+'</option>'; } return o; }
    var cp = window.ZirakClassPath || { MONTHS:6, WEEKS_PER_MONTH:4, DAYS_PER_WEEK:5 };
    var autoOn = !!s.autoAdvanceClassDay;

    openModal(
      '<h3>Legacy Class Path · '+esc(s.fullName)+'</h3>'+
      '<div class="msub">'+esc(s.studentId)+' · historical compatibility only — not the official Today\u2019s Class</div>'+
      '<div class="zk-cp-warn">⚠ This changes <b>only this student</b> — no other student is affected.</div>'+

      '<div class="zk-cp-sec">Track &amp; Level</div>'+
      '<div class="zk-row">'+
        '<div class="zk-field"><label>Track</label><select id="cp-track" class="zk-select"><option value="">—</option>'+optList(TRACKS, s.track)+'</select></div>'+
        '<div class="zk-field"><label>Level</label><select id="cp-level" class="zk-select"><option value="">—</option>'+optList(LEVELS, s.level)+'</select></div>'+
      '</div>'+

      '<div class="zk-cp-sec">Current Class Day</div>'+
      '<div class="zk-row">'+
        '<div class="zk-field"><label>Month (1–'+cp.MONTHS+')</label><select id="cp-month" class="zk-select">'+numOpts(cp.MONTHS, s.currentMonth)+'</select></div>'+
        '<div class="zk-field"><label>Week (1–'+cp.WEEKS_PER_MONTH+')</label><select id="cp-week" class="zk-select">'+numOpts(cp.WEEKS_PER_MONTH, s.currentWeek)+'</select></div>'+
        '<div class="zk-field"><label>Day (1–'+cp.DAYS_PER_WEEK+')</label><select id="cp-day" class="zk-select">'+numOpts(cp.DAYS_PER_WEEK, s.currentDay)+'</select></div>'+
      '</div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.cpShiftDay(\''+esc(studentId)+'\',-1)">⟵ Previous Day</button>'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.cpShiftDay(\''+esc(studentId)+'\',1)">Next Day ⟶</button>'+
      '</div>'+

      '<div class="zk-cp-sec">Today’s Blocks</div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.cpResetBlocks(\''+esc(studentId)+'\')">♻ Reset Today Blocks</button>'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.viewContentSlots(\''+esc(studentId)+'\')">🗂 View Content Slots</button>'+
      '</div>'+

      '<div class="zk-cp-sec">Auto-advance</div>'+
      '<div class="zk-cp-toggle">'+
        '<div><b>Auto-advance class day</b><div class="zk-note" style="margin-top:2px;">When ON, finishing all 9 blocks moves this student to the next day automatically. Default: OFF.</div></div>'+
        '<button class="zk-btn '+(autoOn?'zk-btn-gold':'zk-btn-ghost')+' zk-mini" onclick="ZirakProfile.cpToggleAutoAdvance(\''+esc(studentId)+'\')">'+(autoOn?'ON':'OFF')+'</button>'+
      '</div>'+

      '<div id="cp-msg" class="zk-note"></div>'+
      '<div class="zk-actions">'+
        '<button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.teacherTools()">Back</button>'+
        '<button class="zk-btn zk-btn-primary" onclick="ZirakProfile.cpSetField(\''+esc(studentId)+'\')">💾 Save</button>'+
      '</div>'
    );
  }
  function cpToggleAutoAdvance(studentId){
    if (!window.ZirakClassPath) return;
    var cur = window.ZirakClassPath.getAutoAdvance(
      getRoster().filter(function(x){ return x.studentId===studentId; })[0]
    );
    window.ZirakClassPath.setAutoAdvance(studentId, !cur);
    _classControls(studentId);
    var m = $('cp-msg'); if (m) m.innerHTML = 'Auto-advance is now <b>'+(!cur?'ON':'OFF')+'</b> for this student.';
  }

  /* ====================================================================
     PHASE H3 — "VIEW CONTENT SLOTS" (teacher/content-team helper view)
     ---------------------------------------------------------------------
     Shows the 9 slot IDs for the SELECTED student's current class day, so
     a content writer knows exactly what to fill. Reachable only from the
     already teacher-gated Class panel — no separate PIN prompt needed
     (same pattern as the other buttons inside _classControls). Read-only;
     changes nothing. Never shown to a normal student session.
     ==================================================================== */
  function viewContentSlots(studentId){
    var s = getRoster().map(normalize).filter(function(x){ return x.studentId===studentId; })[0];
    if (!s) return;
    var cp = window.ZirakClassPath;
    var plan = cp ? cp.getCurrentClassDay(s) : null;
    if (!plan){ toast('Class path not available.'); return; }
    var labels = (window.ZirakClassPathContentMap && window.ZirakClassPathContentMap.CONTENT_TYPE_LABELS) || {};
    var anyReady = false;
    var rows = plan.blocks.map(function(b){
      var resolved = (cp && typeof cp.resolveBlockContent === 'function') ? cp.resolveBlockContent(b, s) : null;
      var slotId = (resolved && resolved.slotId) || (b.key);
      var statusWord = (resolved && resolved.status) || 'pending';
      if (statusWord === 'ready') anyReady = true;
      var typeLabel = labels[b.linkedContentType] || b.linkedContentType || '—';
      // Phase H4A: show the real title next to the block name when content is ready.
      var titleBit = (statusWord === 'ready' && resolved.title) ? (' — <b>'+esc(resolved.title)+'</b>') : '';
      return '<div class="zk-vcs-row">'+
        '<div class="zk-vcs-id"><code>'+esc(slotId)+'</code></div>'+
        '<div class="zk-vcs-meta">'+esc(b.name)+titleBit+' · '+esc(typeLabel)+'</div>'+
        '<div class="zk-vcs-status zk-vcs-'+esc(statusWord)+'">'+esc(statusWord)+'</div>'+
      '</div>';
    }).join('');
    var noteText = anyReady
      ? 'For the content team: slots marked “ready” already have real class content; “pending” slots still need material.'
      : 'For the content team: fill these 9 slot IDs with real material when ready.';
    openModal(
      '<h3>Content Slots · '+esc(s.fullName)+'</h3>'+
      '<div class="msub">'+esc(s.studentId)+' · Month '+esc(plan.month)+' · Week '+esc(plan.week)+' · Day '+esc(plan.day)+'</div>'+
      '<div class="zk-cp-warn">⚠ Reference only for this student.</div>'+
      '<div class="zk-vcs-list">'+rows+'</div>'+
      '<div class="zk-note">'+esc(noteText)+'</div>'+
      '<div class="zk-actions"><button class="zk-btn zk-btn-ghost" onclick="ZirakProfile.openClassControls(\''+esc(studentId)+'\')">Back</button></div>'
    );
  }
  function cpSetField(studentId){
    if (!window.ZirakClassPath) return;
    var get = function(id){ var el=$(id); return el?el.value:''; };
    window.ZirakClassPath.setStudentField(studentId, 'track', get('cp-track'));
    window.ZirakClassPath.setStudentField(studentId, 'level', get('cp-level'));
    window.ZirakClassPath.setStudentField(studentId, 'month', get('cp-month'));
    window.ZirakClassPath.setStudentField(studentId, 'week',  get('cp-week'));
    window.ZirakClassPath.setStudentField(studentId, 'day',   get('cp-day'));
    closeModal();
    if (currentStudent() && currentStudent().studentId === studentId) renderDashboard();
    toast('Class path updated.');
  }
  function cpResetBlocks(studentId){
    if (!window.ZirakClassPath) return;
    window.ZirakClassPath.resetTodayBlocks(studentId);
    var m = $('cp-msg'); if (m) m.innerHTML = '<b style="color: var(--emerald-text,#1a6b4a)">Today’s blocks reset.</b>';
    if (currentStudent() && currentStudent().studentId === studentId) renderDashboard();
  }
  function cpShiftDay(studentId, dir){
    if (!window.ZirakClassPath) return;
    var s = window.ZirakClassPath.shiftClassDay(studentId, dir);
    var m = $('cp-msg');
    if (s && m) m.innerHTML = 'Now at <b>Month '+s.currentMonth+' · Week '+s.currentWeek+' · Day '+s.currentDay+'</b>. Press Save or close.';
    // refresh the controls modal selects to reflect new position
    _classControls(studentId);
    var m2 = $('cp-msg'); if (s && m2) m2.innerHTML = 'Now at <b>Month '+s.currentMonth+' · Week '+s.currentWeek+' · Day '+s.currentDay+'</b>.';
    if (currentStudent() && currentStudent().studentId === studentId) renderDashboard();
  }

  function waReport(){
    var s = currentStudent(); if (!s) return;
    var num = digits(s.fatherWhatsApp); if (!num) return;
    var msg = 'Assalam o Alaikum'+(s.fatherName?(' '+s.fatherName):'')+'. '+ACAD.nameEn+
      ' — progress update for '+(s.fullName||'your child')+'. '+(s.progressSummary || 'Attending classes and making progress.');
    window.open('https://wa.me/'+num+'?text='+encodeURIComponent(msg), '_blank');
  }

  /* ====================================================================
     PHASE H2 — FULL-SCREEN "TODAY'S CLASS" SCREEN (screen-classpath)
     ---------------------------------------------------------------------
     A dedicated .screen section that navigate('classpath') can show. It is
     created once at boot and rendered fresh each time it is opened. It
     REUSES window.ZirakClassPath — no duplicate engine.
     ==================================================================== */
  function buildClassPathScreen(){
    if ($('screen-classpath')) return;
    var app = $('app') || document.body;
    var sec = document.createElement('section');
    sec.className = 'screen';
    sec.id = 'screen-classpath';
    sec.setAttribute('role','main');
    sec.innerHTML = '<div id="zk-cp-screen"></div>';
    app.appendChild(sec);
  }

  function renderClassPathScreen(){
    buildClassPathScreen();
    var host = $('zk-cp-screen'); if (!host) return;
    // I6H-D15B (Task 3): genuine Teacher-authorization gate. A normal
    // student must never be able to view the legacy Class Path timetable,
    // however they arrive at this screen.
    if (!teacherUnlocked()){
      host.innerHTML = '<div class="page-header"><h1>Legacy Class Path</h1>'+
        '<div class="dari" style="font-size:15px;color:rgba(255,255,255,.85);">Historical compatibility only \u2014 not the official Today\u2019s Class</div></div>'+
        '<div class="zk-cps-empty">Teacher authorization is required to view the legacy Class Path.</div>';
      return;
    }
    var s = currentStudent();
    if (!s){
      host.innerHTML = '<div class="page-header"><h1>Legacy Class Path</h1>'+
        '<div class="dari" style="font-size:15px;color:rgba(255,255,255,.85);">نننی ټولګی</div></div>'+
        '<div class="zk-cps-empty">Please log in as a student to see the class plan.</div>';
      return;
    }
    s = normalize(s);
    var cp = window.ZirakClassPath;
    var plan = cp ? cp.getTodayClassPlan(s) : null;
    if (!plan){
      host.innerHTML = '<div class="page-header"><h1>Legacy Class Path</h1></div>'+
        '<div class="zk-cps-empty">Class plan is not available.</div>';
      return;
    }
    var next = null;
    for (var i=0;i<plan.blocks.length;i++){ if (!plan.blocks[i].complete){ next = plan.blocks[i]; break; } }
    var pct = plan.totalCount ? Math.round((plan.completedCount/plan.totalCount)*100) : 0;

    var rows = plan.blocks.map(function(b){
      var statusLabel = b.status==='complete' ? 'done' : (b.status==='current' ? 'next' : 'locked');
      var icon = b.status==='complete' ? '✅' : (b.status==='current' ? '▶️' : '🔒');
      var who = [];
      if (b.requiredTeacherActivity) who.push('<span class="zk-cps-tag teacher">Teacher</span>');
      if (b.requiredStudentActivity) who.push('<span class="zk-cps-tag student">Student</span>');
      var link = b.linkedPage ? ('Opens: <b>'+esc(b.linkedPage)+'</b>') : 'No page (in-class / placeholder)';
      var openBtn = '<button class="zk-btn zk-btn-ghost zk-mini" onclick="ZirakProfile.classBlockOpen(\''+b.key+'\')">'+(b.linkedPage?'Open':'Info')+'</button>';
      var doneBtn = (b.status==='current')
        ? '<button class="zk-btn zk-btn-gold zk-mini" onclick="ZirakProfile.cpScreenComplete(\''+b.key+'\')">Done</button>'
        : (b.status==='complete' ? '<span class="zk-cps-doneflag">✓ done</span>' : '');

      // ----- Phase H3/H4A: content-slot status (placeholder map OR real ready content) -----
      var resolved = (cp && typeof cp.resolveBlockContent === 'function') ? cp.resolveBlockContent(b, s) : null;
      var slotLine = '';
      var readyBlock = '';
      if (resolved && resolved.slotId){
        var isReady = resolved.status === 'ready';
        slotLine = '<div class="zk-cps-slot">Slot: <code>'+esc(resolved.slotId)+'</code> · '+
          '<span class="'+(isReady?'zk-cps-ready2':'zk-cps-pending2')+'">'+
            esc(isReady ? 'Ready' : (resolved.status==='pending' ? 'Content pending' : resolved.status))+
          '</span></div>';

        // ----- Phase H4A: show real content compactly via <details> (mobile-friendly, not crowded) -----
        if (isReady){
          var items = (resolved.practiceItems || []).slice(0,4).map(function(p){ return '<li>'+esc(p)+'</li>'; }).join('');
          readyBlock = '<details class="zk-cps-ready-box">'+
            '<summary>'+esc(resolved.title || b.name)+'</summary>'+
            (resolved.teacherInstructions ? '<div class="zk-cps-ri"><b>Teacher:</b> '+esc(resolved.teacherInstructions)+'</div>' : '')+
            (resolved.studentInstructions ? '<div class="zk-cps-ri"><b>Student:</b> '+esc(resolved.studentInstructions)+'</div>' : '')+
            (items ? '<ul class="zk-cps-ri-items">'+items+'</ul>' : '')+
          '</details>';
        }
      }
      // Content-writer note only shown to an unlocked teacher — keeps the student UI simple.
      var writerNote = (resolved && teacherUnlocked() && !((resolved.status==='ready')) && resolved.notesForContentWriter)
        ? '<div class="zk-cps-writer">📝 For content writer: '+esc(resolved.notesForContentWriter)+'</div>'
        : '';

      return '<div class="zk-cps-block '+b.status+'">'+
        '<div class="zk-cps-b-top">'+
          '<span class="zk-cps-b-ic">'+icon+'</span>'+
          '<span class="zk-cps-b-nm">'+esc(b.name)+'</span>'+
          '<span class="zk-cps-b-st '+b.status+'">'+statusLabel+'</span>'+
        '</div>'+
        '<div class="zk-cps-b-ps">'+esc(b.namePs||'')+'</div>'+
        '<div class="zk-cps-b-meta">'+
          '<span>⏱ '+b.estimatedMinutes+' min</span>'+
          who.join('')+
          '<span class="zk-cps-b-link">'+link+'</span>'+
        '</div>'+
        slotLine + readyBlock + writerNote +
        '<div class="zk-cps-b-actions">'+openBtn+doneBtn+'</div>'+
      '</div>';
    }).join('');

    host.innerHTML =
      '<div class="page-header">'+
        '<h1>Legacy Class Path</h1>'+
        '<div class="dari" style="font-size:15px;color:rgba(255,255,255,.85);">Historical compatibility only \u2014 not the official Today\u2019s Class</div>'+
      '</div>'+
      '<div class="zk-cps-wrap">'+
        '<div class="zk-cps-card">'+
          '<div class="zk-cps-stud">'+avatarHTML(s,46)+
            '<div><div class="zk-cps-nm">'+esc(s.fullName||'Student')+'</div>'+
            '<div class="zk-cps-sub">'+esc(s.studentId)+'</div></div>'+
            '<button class="zk-btn zk-btn-ghost zk-mini zk-cps-back" onclick="ZirakProfile.gotoHome()">← Home</button>'+
          '</div>'+
          '<div class="zk-cps-chips">'+
            '<span class="chip2">Track: <b>'+esc(s.track||'—')+'</b></span>'+
            '<span class="chip2">Level: <b>'+esc(s.level||'—')+'</b></span>'+
            '<span class="chip2">Month <b>'+esc(plan.month)+'</b> · Week <b>'+esc(plan.week)+'</b> · Day <b>'+esc(plan.day)+'</b></span>'+
          '</div>'+
          '<div class="zk-cps-title">'+esc(plan.titleEn)+(plan.titlePending?' <span class="zk-cp-pending">title pending</span>':'')+'</div>'+
          '<div class="zk-cps-progress"><div class="zk-cps-bar" style="width:'+pct+'%;"></div></div>'+
          '<div class="zk-cps-meta">'+plan.completedCount+' / '+plan.totalCount+' blocks · '+pct+'% · '+
            (next? 'Next: <b>'+esc(next.name)+'</b>' : '<b>All blocks complete 🎉</b>')+'</div>'+
          '<div class="zk-cps-actions">'+
            '<button class="zk-btn zk-btn-gold" onclick="ZirakProfile.resumeClass()">▶ Continue Today’s Class</button>'+
          '</div>'+
        '</div>'+
        '<div class="zk-cps-list">'+rows+'</div>'+
        '<div class="zk-cps-arcade">🎮 Learning Arcade: <b>locked</b>. Complete the learning blocks first. <span style="opacity:.7;">(Arcade arrives in a later phase.)</span></div>'+
      '</div>';
  }

  // Mark complete from the full screen, then re-render the screen (and Home card)
  function cpScreenComplete(blockKey){
    if (!window.ZirakClassPath) return;
    var res = window.ZirakClassPath.markClassBlockComplete(blockKey);
    renderClassPathScreen();
    renderDashboard();
    if (res && res.autoAdvanced) toast('Block done ✅ — auto-advanced to the next class day.');
    else toast('Block marked complete ✅');
  }

  function openFullClassPlan(){
    // I6H-D15B (Task 2/3): this function is called by BOTH the Home
    // "Open Full Class Plan" button and the floating menu's "Today's
    // Class" action. Neither may open the legacy ZirakClassPath
    // timetable for a normal student — the ONE official Today's Class
    // authority is ZirakAcademicProgram, already rendered on Home.
    var m=$('zk-menu'); if(m) m.classList.remove('open');
    if (typeof window.navigate === 'function') window.navigate('home');
    renderDashboard();
    setTimeout(function(){
      try { var el = document.querySelector('.zk-cp-card'); if (el) el.scrollIntoView({ behavior:'smooth', block:'center' }); } catch(e){}
    }, 150);
  }

  /* ---------- floating chip + menu (works on every screen) ---------- */
  // PHASE I6A5B — Part 2: single central truth for chip visibility, read
  // directly from the DOM rather than trusted from any passed-in flag or
  // remembered state. This is what actually closes the "chip resurrects
  // later" bug: previously, setChipVisible(false) was the ONLY code path
  // that ever hid the chip, but several OTHER code paths (the navigate()
  // hook-wrapper's unconditional post-call updateChip(), toggleMenu(),
  // buildChip()'s re-use branch) touched the chip WITHOUT re-checking
  // visibility — so a chip element left visible (or freshly created,
  // defaulting to its CSS display:flex) by any one of those paths could
  // stay/become visible on a non-Home page. Every chip render/update now
  // re-derives the answer from here instead of trusting prior state.
  function isHomeView(){
    var el = $('screen-home');
    return !!(el && el.classList.contains('active'));
  }
  function shouldShowProfileChip(){
    if (!isHomeView()) return false;
    // No blocking overlay may be open on top of Home — each checked via
    // its OWN actual show/hide mechanism (not assumed), so this stays
    // correct even if a specific overlay's setChipVisible(false) call
    // was ever skipped or arrives out of order.
    var qp = document.getElementById('qp-overlay');
    if (qp && qp.style.display === 'flex') return false;
    var settingsDrawer = document.getElementById('settings-drawer');
    if (settingsDrawer && settingsDrawer.classList.contains('open')) return false;
    var aiConv = document.getElementById('ai-conv-modal');
    if (aiConv && aiConv.style.display === 'flex') return false;
    var writing = document.getElementById('writing-modal');
    if (writing && writing.style.display === 'flex') return false;
    var zkModal = $('zk-modal-root');
    if (zkModal && zkModal.classList.contains('open')) return false;
    return true;
  }

  function buildChip(){
    if ($('zk-chip')) { updateChip(); return; }
    injectStyles();
    var chip = document.createElement('div');
    chip.id = 'zk-chip';
    chip.addEventListener('click', toggleMenu);
    document.body.appendChild(chip);

    var menu = document.createElement('div');
    menu.id = 'zk-menu';
    document.body.appendChild(menu);

    document.addEventListener('click', function(e){
      if (!chip.contains(e.target) && !menu.contains(e.target)) menu.classList.remove('open');
    });
    updateChip();
  }
  function updateChip(){
    var chip = $('zk-chip'), menu = $('zk-menu');
    if (!chip || !menu) return;
    // PHASE I6A5B — Part 2: the defensive guard — re-checked on EVERY
    // update, regardless of who called it or why. If we are not
    // genuinely looking at Home with nothing covering it, force-hide
    // and stop; do not waste work rebuilding content nobody should see.
    if (!shouldShowProfileChip()) { setChipVisible(false); return; }
    var s = currentStudent();
    var lk = teacherUnlocked() ? '🔓' : '🔒';
    if (s){
      chip.innerHTML = avatarHTML(s,30) + '<span class="lab">'+esc(s.fullName||'Student')+'</span><span class="lk">'+lk+'</span>';
    } else if (isPreview()){
      chip.innerHTML = '<span class="zk-av" style="width:30px;height:30px;background:var(--gold,#d4a017);color:#1a2030;font-size:13px;">P</span><span class="lab">Preview</span><span class="lk">'+lk+'</span>';
    }
    menu.innerHTML =
      (s ? '<button onclick="ZirakProfile.gotoHome()">🏠 My Dashboard</button>' : '')+
      (s ? '<button onclick="ZirakProfile.openFullClassPlan()">📋 Today’s Class</button><div class="sep"></div>' : '')+
      '<button onclick="ZirakProfile.teacherTools()">🔑 Teacher Tools</button>'+
      (teacherUnlocked() ? '<button onclick="ZirakProfile.lockTeacher()">🔒 Lock Teacher</button>' : '')+
      '<div class="sep"></div>'+
      '<button onclick="ZirakProfile.logout()">🚪 '+(isPreview()?'Exit preview':'Switch / Log out')+'</button>';
    setChipVisible(true);
  }
  function toggleMenu(e){
    e && e.stopPropagation();
    // PHASE I6A5B — defensive guard: refuse to open the menu on a
    // non-Home page even if something programmatically calls this — the
    // chip should already be unclickable (display:none) at that point,
    // this is belt-and-suspenders only.
    if (!shouldShowProfileChip()) return;
    var m=$('zk-menu'); if (m){ updateChip(); m.classList.toggle('open'); }
  }
  function gotoHome(){ var m=$('zk-menu'); if(m) m.classList.remove('open'); if (typeof window.navigate==='function') window.navigate('home'); renderDashboard(); }
  function lockTeacher(){ setTeacherUnlocked(false); var m=$('zk-menu'); if(m) m.classList.remove('open'); toast('Teacher locked.'); }

  // PHASE I6A5 — Part A: scope the floating chip+menu to the Home screen
  // only. The chip is fixed-position and was overlapping page content
  // on every screen (interview cards, sample answers, badges, Stop
  // Reading button, etc. — see real-device screenshots). Teacher Tools
  // remains reachable from Home's own 🔑 Teacher header button even
  // while the chip is hidden elsewhere, so no functionality is lost —
  // only its footprint on content pages. Any open menu is also closed
  // when hiding, so it can never be left open-but-invisible.
  function setChipVisible(show){
    var chip = $('zk-chip'), menu = $('zk-menu');
    if (!show && menu) menu.classList.remove('open');
    if (chip) chip.style.display = show ? '' : 'none';
    if (menu) menu.style.display = show ? '' : 'none';
  }

  /* ====================================================================
     APP REVEAL / ANTI-FLASH
     ==================================================================== */
  function revealApp(show){
    var pre = $('zk-prelock');
    if (show){ if (pre) pre.remove(); document.documentElement.removeAttribute('data-zk-locked'); }
    // when show=false we keep #app hidden (login overlay is on top) but
    // still remove the prelock style so the OVERLAY itself is visible.
    if (!show){ if (pre) pre.remove(); }
  }

  /* ---------- toast (own; falls back if app toast exists) ---------- */
  function toast(msg){
    if (typeof window.showToast === 'function'){ try { window.showToast(msg); return; } catch(e){} }
    var t = $('zk-toast');
    if (!t){ t=document.createElement('div'); t.id='zk-toast';
      t.style.cssText='position:fixed;left:50%;bottom:calc(var(--nav-h,56px) + 80px);transform:translateX(-50%);'+
        'background:#1a2030;color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;z-index:99999;'+
        'box-shadow:0 6px 20px rgba(0,0,0,.3);max-width:90%;text-align:center;';
      document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity='1';
    clearTimeout(t._h); t._h = setTimeout(function(){ t.style.transition='opacity .4s'; t.style.opacity='0'; }, 2200);
  }

  /* ====================================================================
     HOOKS — wrap navigate() and openSettings() (defined in app.js)
     ==================================================================== */
  function installHooks(){
    // Resume tracking on navigation
    if (typeof window.navigate === 'function' && !window.navigate.__zkWrapped){
      var _nav = window.navigate;
      window.navigate = function(screen){
        var r = _nav.apply(this, arguments);
        try { if (window.ZirakResume) window.ZirakResume.note(screen); } catch(e){}
        try { if (screen === 'classpath') renderClassPathScreen(); } catch(e){}
        // PHASE I4: returning Home after practice refreshes Today's Class so
        // the current/next block is always up to date (welcome won't repeat).
        try { if (screen === 'home') renderDashboard(); } catch(e){}
        // I6H-D11B: returning Home also refreshes the placement onboarding
        // card and the Daily Learning Review card through the ONE existing
        // academy-tests renderer (no duplicate render system).
        try {
          if (screen === 'home' && window.ZirakAcademyTests) {
            if (window.ZirakAcademyTests.refreshPlacementOnboardingCard) window.ZirakAcademyTests.refreshPlacementOnboardingCard();
          }
        } catch(e){}
        // I6H-D13: ONE navigation system — the Personalized Learning Plan
        // screen opens through this same existing navigate() wrapper, and
        // its Home dashboard card refreshes alongside the other Home cards.
        try {
          if (screen === 'home' && window.ZirakLearningPlan && window.ZirakLearningPlan.refreshDashboardCard) window.ZirakLearningPlan.refreshDashboardCard();
          if (screen === 'personal-plan' && window.ZirakLearningPlan && window.ZirakLearningPlan.open) window.ZirakLearningPlan.open();
        } catch(e){}
        try { updateChip(); } catch(e){}
        return r;
      };
      window.navigate.__zkWrapped = true;
    }
    // Gate Settings (API key + danger zone + parent fields) behind Teacher PIN
    if (typeof window.openSettings === 'function' && !window.openSettings.__zkWrapped){
      window.__origOpenSettings = window.openSettings;
      window.openSettings = function(){
        var self=this, args=arguments;
        requireTeacher(function(){ window.__origOpenSettings.apply(self, args); });
      };
      window.openSettings.__zkWrapped = true;
    }
  }

  /* ====================================================================
     BOOT
     ==================================================================== */
  function boot(){
    injectStyles();
    installHooks();
    window.__zirakAfterRosterChange = function(){ /* hook for future surfaces */ };

    var ses = sessionRaw();
    if (!ses){
      // No one signed in → show login, keep app hidden behind it.
      buildLogin();
      return;
    }
    if (isPreview()){
      revealApp(true);
      buildClassPathScreen();
      buildChip();
      return;
    }
    // Student session
    var s = currentStudent();
    if (!s){
      // Stale session (student deleted) → back to login.
      try { sessionStorage.removeItem('zirak_session'); } catch(e){}
      buildLogin();
      return;
    }
    ensureParentSync(s);
    markAttendance(s);
    revealApp(true);
    buildClassPathScreen();
    renderDashboard();
    buildChip();
    // I6H-D14D — Task 11: the app is now genuinely ready (dashboard +
    // chip rendered). Fire the normalized ready event, then attempt the
    // handoff consumer. A bounded retry (not endless polling) covers
    // the rare case where a dependent module hasn't finished its own
    // <script> execution yet.
    try { if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') window.dispatchEvent(new CustomEvent('zirak:student-app-ready', { detail: { studentId: s.studentId } })); } catch (e) {}
    _tryConsumeTeacherHandoffWithRetry(0);
  }

  /* ══════════════════════════════════════════════════════════════════
     I6H-D14D — Task 10: the ONE post-reload handoff consumer. Runs only
     after the student session is established and the app shell is
     ready (called from boot() above, right after dashboard + chip
     render). Validates everything before removing the handoff and
     dispatching — an invalid handoff is removed and produces zero
     action, per Task 20's safe-failure-fallback requirement.
     ══════════════════════════════════════════════════════════════════ */
  function _tryConsumeTeacherHandoffWithRetry(attempt) {
    var raw = _readTeacherHandoffRaw();
    if (!raw) return; // nothing pending — ordinary boot, nothing to do
    // Bounded retry only when the reason is "module not yet available"
    // — never an endless poll, never retried for any other rejection.
    var result = consumeTeacherHandoff();
    if (result && result.reason === 'module-unavailable' && attempt < 10) {
      setTimeout(function () { _tryConsumeTeacherHandoffWithRetry(attempt + 1); }, 150);
    }
  }
  function consumeTeacherHandoff() {
    var raw = _readTeacherHandoffRaw();
    if (!raw) return { ok: false, reason: 'no-pending-handoff' };
    // Task 22: remove the handoff BEFORE launching the continuation —
    // this is what makes replay structurally impossible, not merely a
    // "consumed" flag we might forget to check.
    function rejectAndClear(reason) { _removeTeacherHandoff(); return { ok: false, reason: reason }; }

    if (raw.schemaVersion !== 1 || !raw.targetStudentId || !raw.action || !raw.handoffId) return rejectAndClear('malformed-handoff');
    if (raw.consumed) return rejectAndClear('already-consumed');
    if (typeof raw.expiresAt !== 'number' || Date.now() > raw.expiresAt) return rejectAndClear('expired');
    if (TEACHER_HANDOFF_ACTIONS.indexOf(raw.action) === -1) return rejectAndClear('action-not-whitelisted');
    var active = currentStudent();
    if (!active || active.studentId !== raw.targetStudentId) return rejectAndClear('student-mismatch');

    // Module-availability check per action, BEFORE removing the handoff
    // — if the dependency genuinely isn't ready yet, the bounded retry
    // above will try again shortly rather than silently dropping it.
    var moduleCheck = _teacherHandoffModuleReady(raw.action);
    if (!moduleCheck.ready) return { ok: false, reason: 'module-unavailable' };

    _removeTeacherHandoff(); // Task 22: gone before dispatch — no replay possible.
    try { _dispatchTeacherHandoffAction(raw); } catch (e) {}
    return { ok: true, handoffId: raw.handoffId, action: raw.action, studentId: raw.targetStudentId };
  }
  function _teacherHandoffModuleReady(action) {
    if (action === 'open-daily-review' || action === 'open-weekly-test' || action === 'open-two-week-review' || action === 'open-monthly-exam') {
      return { ready: !!(window.ZirakAcademyTests) };
    }
    if (action === 'open-placement' || action === 'open-placement-retake') {
      return { ready: !!(window.ZirakPlacementEngine) };
    }
    if (action === 'open-todays-plan') {
      return { ready: !!(window.ZirakLearningPlan) };
    }
    return { ready: true }; // open-home, open-school-path, open-assessments-progress use only this module + navigate()
  }
  // Task 14/15/16: the ONE whitelisted action→function dispatch table.
  function _dispatchTeacherHandoffAction(handoff) {
    var studentId = handoff.targetStudentId;
    switch (handoff.action) {
      case 'open-home':
        try { if (typeof window.navigate === 'function') window.navigate('home'); } catch (e) {}
        return;
      case 'open-school-path':
        try { if (typeof window.navigate === 'function') window.navigate('path'); } catch (e) {}
        return;
      case 'open-assessments-progress':
        try { if (typeof window.navigate === 'function') window.navigate('review'); } catch (e) {}
        return;
      case 'open-daily-review':
        _dispatchAssessment(studentId, 'daily', function () { window.ZirakAcademyTests.start(); });
        return;
      case 'open-weekly-test':
        _dispatchAssessment(studentId, 'weekly', function () { window.ZirakAcademyTests.startWeekly(); });
        return;
      case 'open-two-week-review':
        _dispatchAssessment(studentId, 'twoWeek', function () { window.ZirakAcademyTests.startTwoWeek(); });
        return;
      case 'open-monthly-exam':
        _dispatchAssessment(studentId, 'monthly', function () { window.ZirakAcademyTests.startMonthly(); });
        return;
      case 'open-placement':
        try { if (typeof window.navigate === 'function') window.navigate('placement'); } catch (e) {}
        return;
      case 'open-placement-retake':
        _dispatchPlacementRetake(studentId);
        return;
      case 'open-todays-plan':
        _dispatchTodaysPlan(studentId);
        return;
    }
  }
  // Task 14: re-validate readiness AFTER reload, since records may have
  // changed between handoff creation and the reload actually landing.
  function _dispatchAssessment(studentId, assessmentType, launcher) {
    try {
      if (!window.ZirakAcademyTests || typeof window.ZirakAcademyTests.getStudentAssessmentState !== 'function') { try { window.navigate('review'); } catch (e) {} return; }
      var state = window.ZirakAcademyTests.getStudentAssessmentState(studentId);
      var s = state && state[assessmentType];
      if (!s || (!s.ready && !s.retakeAvailable)) { try { window.navigate('review'); } catch (e) {} return; } // Task 14: not Ready/Retake anymore → show real status, don't open
      launcher();
    } catch (e) { try { window.navigate('review'); } catch (e2) {} }
  }
  function _dispatchPlacementRetake(studentId) {
    try {
      if (!window.ZirakPlacementEngine) { try { window.navigate('placement'); } catch (e) {} return; }
      // Task 15: preserve the accepted level until the new recommendation
      // resolves — activateStudentSession never touches placement_accepted,
      // and the retake path itself (startRetake) is the SAME existing
      // authority the active-student UI already uses — no second session.
      try { window.navigate('placement'); } catch (e) {}
      if (typeof window.ZirakPlacementEngine.startRetake === 'function') window.ZirakPlacementEngine.startRetake();
    } catch (e) {}
  }
  function _dispatchTodaysPlan(studentId) {
    try {
      if (!window.ZirakLearningPlan || typeof window.ZirakLearningPlan.getPlan !== 'function') { try { window.navigate('home'); } catch (e) {} return; }
      var plan = window.ZirakLearningPlan.getPlan(studentId);
      // Task 16: verify an active, unpaused plan exists; never silently
      // generate or resume one.
      if (!plan || plan.status === 'paused') { try { window.navigate('home'); } catch (e) {} return; }
      try { window.navigate('path'); } catch (e) {}
    } catch (e) { try { window.navigate('home'); } catch (e2) {} }
  }

  /* ----- Phase 3: attendance — count once per calendar date per student ----- */
  function markAttendance(s){
    try {
      var today = todayISO();
      if (s.lastAttendanceDate !== today){
        s.lastAttendanceDate = today;
        s.attendanceCount = (s.attendanceCount || 0) + 1;
        s.lastUpdated = new Date().toISOString();
        upsertStudent(s);
      }
    } catch(e){}
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ====================================================================
     PUBLIC API (for inline onclick handlers)
     ==================================================================== */
  window.ZirakProfile = {
    // login
    pickStudent: pickStudent,
    loginById: loginById,
    teacherUnlockThenAdd: teacherUnlockThenAdd,
    // I6H-D14D — Task 5/24: the ONE safe Teacher-authorized student
    // activation API. Never selectStudent/setActive/raw session setters.
    activateStudentForTeacher: activateStudentForTeacher,
    consumeTeacherHandoff: consumeTeacherHandoff,
    getPendingTeacherHandoff: getPendingTeacherHandoff,
    registerTeacherDashboardCleaner: registerTeacherDashboardCleaner,
    // teacher tools
    teacherTools: teacherTools,
    addStudent: addStudent,
    editStudent: editStudent,
    deleteStudent: deleteStudent,
    _confirmDelete: _confirmDelete,
    // I6H-D11B: Privacy / Danger Zone (single safe implementation)
    openDangerZone: openDangerZone,
    confirmResetProgress: confirmResetProgress,
    _resetStage2: _resetStage2,
    _resetFinal: _resetFinal,
    confirmDeleteProfile: confirmDeleteProfile,
    _deleteStage2: _deleteStage2,
    exportStudentData: exportStudentData,
    importStudentData: importStudentData,
    importStudentDataPrompt: importStudentDataPrompt,
    confirmResetPlacement: confirmResetPlacement,
    _resetPlacementFinal: _resetPlacementFinal,
    getStudentStorageKeys: getStudentStorageKeys,
    resetStudentProgress: resetStudentProgress,
    deleteStudentCompletely: deleteStudentCompletely,
    resetPin: resetPin,
    changeTeacherPin: changeTeacherPin,
    openAppSettings: openAppSettings,
    previewApp: previewApp,
    exportRoster: exportRoster,
    importRosterPrompt: importRosterPrompt,
    // admission form internals
    saveAdmission: saveAdmission,
    _clearPhoto: _clearPhoto,
    _closeModal: closeModal,
    // dashboard
    continueClass: continueClass,
    waReport: waReport,
    gotoHome: gotoHome,
    lockTeacher: lockTeacher,
    logout: logout,
    // utility for future phases
    getRoster: getRoster,
    currentStudent: currentStudent,
    renderDashboard: renderDashboard,
    TRACKS: TRACKS,
    LEVELS: LEVELS,
    // ----- Phase 3: shared so the class-path module/UI can persist + refresh -----
    _upsertStudent: upsertStudent,
    _normalize: normalize,
    classBlockOpen: classBlockOpen,
    // I6H-D15A (Task 7): official Today's Class options.
    previewWeeklyStructure: previewWeeklyStructure,
    openFreePracticeFromHome: openFreePracticeFromHome,
    openFreePracticeArea: openFreePracticeArea,
    gotoHomeFromHub: gotoHomeFromHub,
    openExistingLearningPlanFromHome: openExistingLearningPlanFromHome,
    reviewCurriculumStatus: reviewCurriculumStatus,
    classBlockComplete: classBlockComplete,
    resumeClass: resumeClass,
    goReviewWeak: goReviewWeak,
    goReviewResults: goReviewResults,
    openClassControls: openClassControls,
    cpSetField: cpSetField,
    cpResetBlocks: cpResetBlocks,
    cpShiftDay: cpShiftDay,
    viewContentSlots: viewContentSlots,
    openFullClassPlan: openFullClassPlan,
    cpScreenComplete: cpScreenComplete,
    cpToggleAutoAdvance: cpToggleAutoAdvance,
    // PHASE I6A5 — Part A: chip visibility control (Home-only scoping)
    setChipVisible: setChipVisible,
    // PHASE I6A5B — Part 2: the central truth, exposed so other files
    // can ask "should the chip be visible right now" instead of
    // guessing or duplicating this logic.
    isHomeView: isHomeView,
    shouldShowProfileChip: shouldShowProfileChip,
    // updateChip is the actual self-healing entry point (re-derives
    // visibility from shouldShowProfileChip on every call) — exposed as
    // a safe, idempotent utility other code can call if it ever needs
    // to force a re-sync, and so this exact behavior is testable.
    refreshChip: updateChip,
    // PHASE I6A5 — Part B: expose the existing teacher-PIN gate so other
    // files (e.g. interview-core.js) can protect sensitive panels using
    // the SAME gate/prompt the rest of the app already uses — no second
    // PIN system.
    requireTeacher: requireTeacher
  };
})();
