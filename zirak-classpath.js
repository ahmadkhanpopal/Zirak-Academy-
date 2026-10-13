/* =====================================================================
   ZIRAK ENGLISH LANGUAGE ACADEMY — Class Path / Six-Month Skeleton
   ځيرک د انګليسي ژبي اکاډمي
   ---------------------------------------------------------------------
   PHASE 3: Class Path / Six-Month Curriculum Skeleton  (ARCHITECTURE ONLY)
   ---------------------------------------------------------------------
   This module is ADDITIVE and STRUCTURAL. It contains NO curriculum
   content — only the skeleton (6 months × 4 weeks × 5 days) and a default
   ~90-minute daily block template. Real lessons are filled later by the
   owner / ChatGPT.

   STORAGE MODEL (re-uses the existing single engine — no new engine):
     - The class-path DEFINITION (months/weeks/days/blocks template) is
       device-global and computed in memory here (window.ZirakClassPath).
     - PER-STUDENT progress (completed blocks, attendance, minutes, current
       position) lives inside the student record in the roster, saved via
       the existing ZirakProfile storage (upsertStudent / per-student
       namespace). This module never writes a competing storage engine.

   It loads AFTER zirak-profile.js so it can read/extend the roster API.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- safe handles to the profile module (already loaded) ---------- */
  function ZP(){ return window.ZirakProfile || null; }

  /* ====================================================================
     TRACKS / LEVELS (structural only — match the profile module)
     ==================================================================== */
  var TRACKS = ['Kids','Teen Beginner','Adult Conversation','Job / Interview','Advanced Conversation'];

  /* ====================================================================
     SIX-MONTH FRAMEWORK CONSTANTS
     ==================================================================== */
  var MONTHS          = 6;
  var WEEKS_PER_MONTH = 4;   // 6 × 4 = 24 weeks
  var DAYS_PER_WEEK   = 5;   // 5 class days / week
  var CLASS_MINUTES   = 90;  // ~1h30 per class

  /* ====================================================================
     ACTIVITY TYPES (structural vocabulary for blocks)
     ==================================================================== */
  var ACTIVITY = {
    ATTENDANCE: 'attendance',
    WARMUP:     'warmup',
    WIZARD:     'wizard',
    TEACHER:    'teacher',
    GRAMMAR:    'grammar',
    PAIR:       'pair',
    QUIZ:       'quiz',
    ARCADE:     'arcade',
    HOMEWORK:   'homework'
  };

  /* ====================================================================
     DEFAULT DAILY BLOCK TEMPLATE (~90 min)
     ---------------------------------------------------------------------
     Each block is structure only. `linkedPage` points at an EXISTING app
     screen (handled by navigate()) where it makes sense; teacher-only or
     placeholder blocks have linkedPage:null. `placeholderContentId` is a
     slot the owner/ChatGPT can wire real content IDs into later.
     ==================================================================== */
  function defaultBlocks(){
    return [
      { key:'attendance', order:1, name:'Login / Attendance / Resume',        namePs:'حاضري / دوام',            type:ACTIVITY.ATTENDANCE, estimatedMinutes:5,
        requiredTeacherActivity:false, requiredStudentActivity:true,  linkedPage:null,        linkedContentType:'system',   placeholderContentId:null },
      { key:'warmup',     order:2, name:'Weak Parts Warmup',                  namePs:'د کمزورو برخو تودوخه',     type:ACTIVITY.WARMUP,     estimatedMinutes:5,
        requiredTeacherActivity:false, requiredStudentActivity:true,  linkedPage:'review',    linkedContentType:'weakparts', placeholderContentId:null },
      { key:'wizard',     order:3, name:'Wizard Speaking / Listening',        namePs:'ویزارډ خبرې / اوریدل',    type:ACTIVITY.WIZARD,     estimatedMinutes:15,
        requiredTeacherActivity:false, requiredStudentActivity:true,  linkedPage:'dialogue',  linkedContentType:'dialogue',  placeholderContentId:null },
      { key:'teacher',    order:4, name:'Teacher Book / Video / Workbook',    namePs:'د ښوونکي کتاب / ویډیو',   type:ACTIVITY.TEACHER,    estimatedMinutes:20,
        requiredTeacherActivity:true,  requiredStudentActivity:false, linkedPage:null,        linkedContentType:'teacher',   placeholderContentId:null },
      { key:'grammar',    order:5, name:'Grammar Wizard (placeholder)',       namePs:'ګرامر ویزارډ',           type:ACTIVITY.GRAMMAR,    estimatedMinutes:10,
        requiredTeacherActivity:false, requiredStudentActivity:true,  linkedPage:'grammar',   linkedContentType:'grammar',   placeholderContentId:null },
      { key:'pair',       order:6, name:'Pair Speaking Task',                 namePs:'جوړه خبرې',              type:ACTIVITY.PAIR,       estimatedMinutes:15,
        requiredTeacherActivity:true,  requiredStudentActivity:true,  linkedPage:null,        linkedContentType:'pair',      placeholderContentId:null },
      { key:'quiz',       order:7, name:'Quiz / Listening Review',            namePs:'کوز / اوریدلو بیاکتنه',    type:ACTIVITY.QUIZ,       estimatedMinutes:10,
        requiredTeacherActivity:false, requiredStudentActivity:true,  linkedPage:'listening', linkedContentType:'quiz',      placeholderContentId:null },
      { key:'arcade',     order:8, name:'Learning Arcade (locked)',           namePs:'د زده‌کړې لوبغالی (تړل)', type:ACTIVITY.ARCADE,     estimatedMinutes:5,
        requiredTeacherActivity:false, requiredStudentActivity:false, linkedPage:null,        linkedContentType:'arcade',    placeholderContentId:null },
      { key:'homework',   order:9, name:'Homework / Father Report / Next',    namePs:'کور دنده / راپور',        type:ACTIVITY.HOMEWORK,   estimatedMinutes:5,
        requiredTeacherActivity:true,  requiredStudentActivity:false, linkedPage:null,        linkedContentType:'homework',  placeholderContentId:null }
    ];
  }

  /* ====================================================================
     CLASS-DAY IDENTITY + GENERATOR
     ---------------------------------------------------------------------
     We do NOT pre-write 120 lessons. We represent any day on demand:
        classDayId  = 'm{M}-w{W}-d{D}'   (W is 1..24 absolute week, or
                                          we expose month-relative too)
     ==================================================================== */
  function pad(n){ return String(n); }
  function clamp(n, lo, hi){ n = parseInt(n,10); if (isNaN(n)) n = lo; return Math.max(lo, Math.min(hi, n)); }

  // absolute week (1..24) from month(1..6)+weekInMonth(1..4)
  function absoluteWeek(month, weekInMonth){
    return (clamp(month,1,MONTHS)-1)*WEEKS_PER_MONTH + clamp(weekInMonth,1,WEEKS_PER_MONTH);
  }
  function classDayId(month, week, day){
    return 'm'+clamp(month,1,MONTHS)+'-w'+clamp(week,1,WEEKS_PER_MONTH)+'-d'+clamp(day,1,DAYS_PER_WEEK);
  }

  // Build the in-memory plan for one specific day (structure + placeholder title)
  function buildDay(track, month, week, day){
    month = clamp(month,1,MONTHS); week = clamp(week,1,WEEKS_PER_MONTH); day = clamp(day,1,DAYS_PER_WEEK);
    var absWk = absoluteWeek(month, week);
    var dayId = classDayId(month, week, day);
    var blocks = defaultBlocks();
    // Phase H3: tag each block with its day position so a content-slot map
    // (or any future consumer) can resolve a slot ID without extra params.
    blocks.forEach(function(b){ b.month = month; b.week = week; b.day = day; b.classDayId = dayId; });
    return {
      classDayId: dayId,
      track: track || '',
      month: month, week: week, day: day,
      absoluteWeek: absWk,
      // Placeholder title — owner/ChatGPT replaces later. NOT real curriculum.
      titleEn: 'Class — Month '+month+', Week '+week+', Day '+day,
      titlePs: 'ټولګی — میاشت '+month+'، اونۍ '+week+'، ورځ '+day,
      titlePending: true,                 // flag so UI can show "title pending"
      classMinutes: CLASS_MINUTES,
      blocks: blocks
    };
  }

  // Total counts (for progress bars / teacher overview)
  function totalDays(){ return MONTHS*WEEKS_PER_MONTH*DAYS_PER_WEEK; } // 120

  /* ====================================================================
     PER-STUDENT PROGRESS HELPERS
     ---------------------------------------------------------------------
     All read/write goes through ZirakProfile (per-student storage). We
     never touch localStorage directly here.
     ==================================================================== */
  function currentStudent(){ var p = ZP(); return p ? p.currentStudent() : null; }
  function saveStudent(s){ var p = ZP(); if (p && p._upsertStudent) p._upsertStudent(s); }

  // Resolve the student's current class day (defaults to m1-w1-d1)
  function getCurrentClassDay(student){
    var s = student || currentStudent();
    if (!s) return null;
    var month = clamp(s.currentMonth || 1, 1, MONTHS);
    var week  = clamp(s.currentWeek  || 1, 1, WEEKS_PER_MONTH);
    var day   = clamp(s.currentDay   || 1, 1, DAYS_PER_WEEK);
    return buildDay(s.track, month, week, day);
  }

  // Today's plan = the current class day's block list + per-student completion
  function getTodayClassPlan(student){
    var s = student || currentStudent();
    if (!s) return null;
    var plan = getCurrentClassDay(s);
    var done = (s.completedClassBlocks && s.completedClassBlocks[plan.classDayId]) || [];
    plan.blocks.forEach(function(b){
      b.complete = done.indexOf(b.key) !== -1;
    });
    // status: complete | current | locked
    var foundCurrent = false;
    plan.blocks.forEach(function(b){
      if (b.complete){ b.status = 'complete'; }
      else if (!foundCurrent){ b.status = 'current'; foundCurrent = true; }
      else { b.status = 'locked'; }
    });
    plan.completedCount = plan.blocks.filter(function(b){ return b.complete; }).length;
    plan.totalCount = plan.blocks.length;
    plan.allComplete = plan.completedCount === plan.totalCount;
    return plan;
  }

  function getNextClassBlock(student){
    var plan = getTodayClassPlan(student);
    if (!plan) return null;
    for (var i=0;i<plan.blocks.length;i++){ if (!plan.blocks[i].complete) return plan.blocks[i]; }
    return null; // all done
  }

  // Mark a block complete for the ACTIVE student only
  function markClassBlockComplete(blockKey){
    var s = currentStudent(); if (!s) return null;
    var plan = getCurrentClassDay(s); if (!plan) return null;
    if (!s.completedClassBlocks) s.completedClassBlocks = {};
    var arr = s.completedClassBlocks[plan.classDayId] || [];
    if (arr.indexOf(blockKey) === -1) arr.push(blockKey);
    s.completedClassBlocks[plan.classDayId] = arr;
    s.currentClassDayId = plan.classDayId;

    // accumulate class minutes (sum of the block's estimated minutes)
    var blk = plan.blocks.filter(function(b){ return b.key === blockKey; })[0];
    if (blk){ s.totalClassMinutes = (s.totalClassMinutes || 0) + (blk.estimatedMinutes || 0); }

    s.classPathUpdatedAt = new Date().toISOString();
    if (!s.classPathStartedAt) s.classPathStartedAt = s.classPathUpdatedAt;
    s.lastActivity = 'Class block: ' + (blk ? blk.name : blockKey);
    s.lastUpdated = s.classPathUpdatedAt;
    saveStudent(s);

    // ----- Phase H2: optional auto-advance (OFF by default) -----
    // If the student has autoAdvanceClassDay === true AND every block of the
    // current day is now complete, advance to the next class day automatically.
    var autoAdvanced = false;
    if (s.autoAdvanceClassDay === true){
      var planNow = getTodayClassPlan(s);
      if (planNow && planNow.allComplete){
        shiftClassDay(s.studentId, 1);   // bounded; saves the student
        autoAdvanced = true;
      }
    }
    var out = getTodayClassPlan(currentStudent() || s);
    if (out) out.autoAdvanced = autoAdvanced;
    return out;
  }

  // Open the linked page for a block (or return a placeholder reason)
  function openClassBlock(blockKey){
    var plan = getCurrentClassDay(currentStudent()); if (!plan) return;
    var blk = plan.blocks.filter(function(b){ return b.key === blockKey; })[0];
    if (!blk) return;
    if (blk.linkedPage && typeof window.navigate === 'function'){
      window.navigate(blk.linkedPage);
      return { opened:true, page:blk.linkedPage };
    }
    return { opened:false, placeholder:true, type:blk.type };
  }

  // Resume = open the next incomplete block's page, else stay on Home
  function resumeTodayClass(){
    var blk = getNextClassBlock();
    if (!blk){ if (typeof window.navigate === 'function') window.navigate('home'); return { done:true }; }
    if (blk.linkedPage && typeof window.navigate === 'function'){ window.navigate(blk.linkedPage); return { opened:true, page:blk.linkedPage, block:blk.key }; }
    return { opened:false, placeholder:true, block:blk.key };
  }

  function goToNextClassBlock(){ return resumeTodayClass(); }

  /* ====================================================================
     PHASE H2 — PLACEHOLDER CONTENT RESOLVER HOOK
     ---------------------------------------------------------------------
     This is a STUB for the content team / ChatGPT to fill later. It does
     NOT create or return any real lesson content. It only reports that the
     block's content is pending, echoing the structural fields so a future
     implementation can swap in real content keyed by placeholderContentId.

     PHASE H3 UPDATE: if window.ZirakClassPathContentMap is loaded, delegate
     to its resolveSlot(block, student) so callers get the mapped slot
     record (still placeholder-only — no real content). If the content-map
     module isn't loaded, or it returns nothing, fall back to the exact
     original H2 behaviour below — so this function never breaks even if
     the new file is missing.
     ==================================================================== */
  function resolveBlockContent(block, student){
    block = block || {};
    if (window.ZirakClassPathContentMap && typeof window.ZirakClassPathContentMap.resolveSlot === 'function'){
      try {
        var mapped = window.ZirakClassPathContentMap.resolveSlot(block, student);
        if (mapped) return mapped;
      } catch(e){ /* fall through to the stub below — never crash */ }
    }
    return {
      status: 'pending',
      blockKey: block.key || null,
      placeholderContentId: block.placeholderContentId || null,
      linkedContentType: block.linkedContentType || null,
      linkedPage: block.linkedPage || null,
      track: (student && student.track) || (block.track) || '',
      message: 'Content pending'
    };
  }

  /* ====================================================================
     PHASE H2 — AUTO-ADVANCE TOGGLE (per-student; default OFF)
     ==================================================================== */
  function getAutoAdvance(student){
    var s = student || currentStudent();
    return !!(s && s.autoAdvanceClassDay === true);
  }
  function setAutoAdvance(studentId, on){
    var p = ZP(); if (!p) return null;
    var roster = p.getRoster();
    var s = roster.filter(function(x){ return x.studentId === studentId; })[0];
    if (!s) return null;
    s.autoAdvanceClassDay = !!on;
    s.classPathUpdatedAt = new Date().toISOString();
    saveStudent(s);
    return s;
  }

  /* ====================================================================
     TEACHER CONTROLS (called from teacher-gated UI in zirak-profile.js)
     ---------------------------------------------------------------------
     These only mutate the per-student record. The caller is responsible
     for teacher-PIN gating (the profile module wraps these behind it).
     ==================================================================== */
  function setStudentField(studentId, field, value){
    var p = ZP(); if (!p) return null;
    var roster = p.getRoster();
    var s = roster.filter(function(x){ return x.studentId === studentId; })[0];
    if (!s) return null;
    if (field === 'track')  s.track = value;
    if (field === 'level')  s.level = value;
    if (field === 'month')  s.currentMonth = clamp(value,1,MONTHS);
    if (field === 'week')   s.currentWeek  = clamp(value,1,WEEKS_PER_MONTH);
    if (field === 'day')    s.currentDay   = clamp(value,1,DAYS_PER_WEEK);
    s.currentClassDayId = classDayId(s.currentMonth, s.currentWeek, s.currentDay);
    s.classPathUpdatedAt = new Date().toISOString();
    saveStudent(s);
    return s;
  }

  function resetTodayBlocks(studentId){
    var p = ZP(); if (!p) return null;
    var roster = p.getRoster();
    var s = roster.filter(function(x){ return x.studentId === studentId; })[0];
    if (!s) return null;
    var id = classDayId(s.currentMonth||1, s.currentWeek||1, s.currentDay||1);
    if (s.completedClassBlocks && s.completedClassBlocks[id]) delete s.completedClassBlocks[id];
    s.classPathUpdatedAt = new Date().toISOString();
    saveStudent(s);
    return s;
  }

  // Advance / go back by ONE class day (simple, bounded; no auto-advance logic)
  function shiftClassDay(studentId, dir){
    var p = ZP(); if (!p) return null;
    var roster = p.getRoster();
    var s = roster.filter(function(x){ return x.studentId === studentId; })[0];
    if (!s) return null;
    var month = clamp(s.currentMonth||1,1,MONTHS),
        week  = clamp(s.currentWeek||1,1,WEEKS_PER_MONTH),
        day   = clamp(s.currentDay||1,1,DAYS_PER_WEEK);
    // linear index 0..(120-1)
    var idx = (((month-1)*WEEKS_PER_MONTH)+(week-1))*DAYS_PER_WEEK + (day-1);
    idx += (dir > 0 ? 1 : -1);
    idx = Math.max(0, Math.min(totalDays()-1, idx));
    day   = (idx % DAYS_PER_WEEK) + 1;
    var wAbs = Math.floor(idx / DAYS_PER_WEEK);          // 0..23
    month = Math.floor(wAbs / WEEKS_PER_MONTH) + 1;      // 1..6
    week  = (wAbs % WEEKS_PER_MONTH) + 1;                // 1..4
    s.currentMonth = month; s.currentWeek = week; s.currentDay = day;
    s.currentClassDayId = classDayId(month, week, day);
    s.classPathUpdatedAt = new Date().toISOString();
    saveStudent(s);
    return s;
  }

  /* ====================================================================
     ARCADE GATE PLACEHOLDER (structure only — no game integration)
     ==================================================================== */
  function arcadeState(student){
    var s = student || currentStudent();
    var ag = (s && s.arcadeGate) || {};
    return {
      requiredLearningMinutes: 20,
      unlockedArcadeMinutes:   5,
      remainingArcadeSeconds:  ag.remainingArcadeSeconds || 0,
      arcadeLocked:            ag.arcadeLocked === false ? false : true,  // default locked
      teacherOverride:         ag.teacherOverride === true
    };
  }

  /* ====================================================================
     PUBLIC API
     ==================================================================== */
  window.ZirakClassPath = {
    // constants / definition (device-global)
    TRACKS: TRACKS,
    MONTHS: MONTHS, WEEKS_PER_MONTH: WEEKS_PER_MONTH, DAYS_PER_WEEK: DAYS_PER_WEEK,
    CLASS_MINUTES: CLASS_MINUTES, ACTIVITY: ACTIVITY,
    totalDays: totalDays,
    classDayId: classDayId,
    absoluteWeek: absoluteWeek,
    buildDay: buildDay,
    defaultBlocks: defaultBlocks,

    // per-student plan / resume
    getCurrentClassDay: getCurrentClassDay,
    getTodayClassPlan: getTodayClassPlan,
    getNextClassBlock: getNextClassBlock,
    markClassBlockComplete: markClassBlockComplete,
    openClassBlock: openClassBlock,
    resumeTodayClass: resumeTodayClass,
    goToNextClassBlock: goToNextClassBlock,
    resolveBlockContent: resolveBlockContent,
    getAutoAdvance: getAutoAdvance,
    setAutoAdvance: setAutoAdvance,

    // teacher controls (gating done by caller)
    setStudentField: setStudentField,
    resetTodayBlocks: resetTodayBlocks,
    shiftClassDay: shiftClassDay,

    // arcade placeholder
    arcadeState: arcadeState
  };
})();
