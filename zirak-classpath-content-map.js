/* =====================================================================
   ZIRAK ENGLISH LANGUAGE ACADEMY — Class Path Content Slot Map
   ځيرک د انګليسي ژبي اکاډمي
   ---------------------------------------------------------------------
   PHASE H3: Class Path Content Slot Map  (ARCHITECTURE ONLY)
   ---------------------------------------------------------------------
   This module contains NO real curriculum. It only defines:
     - a human-readable SLOT ID system (e.g. "m1_w1_d1_wizard")
     - friendly labels for content types
     - 45 PLACEHOLDER slot records (Month 1, Week 1, Days 1–5 only —
       5 days x 9 blocks). Every other slot in the six-month skeleton
       is intentionally left unmapped for now; resolveSlot() falls back
       safely for anything outside this small mapped range.
     - resolveSlot(block, student) — the function zirak-classpath.js's
       resolveBlockContent() delegates to when this file is loaded.

   It loads AFTER zirak-classpath.js (which it reads defaultBlocks() from,
   so the slot vocabulary always matches the canonical block list — no
   duplicated/diverging block definitions) and is purely additive: if this
   file is ever missing, zirak-classpath.js's resolveBlockContent() falls
   back to its own original H2 stub, so nothing breaks either way.
   ===================================================================== */
(function () {
  'use strict';

  function CP(){ return window.ZirakClassPath || null; }

  /* ====================================================================
     SLOT ID SUFFIX MAP
     ---------------------------------------------------------------------
     The public/human-readable slot suffix differs slightly from the
     internal block.key used inside zirak-classpath.js (e.g. "warmup" ->
     "weak_warmup"). We do NOT rename the internal keys — zero risk to
     existing H1/H2 logic that already checks block.key. This map only
     affects the bookkeeping ID shown to teachers/content writers.
     ==================================================================== */
  var SLOT_SUFFIX = {
    attendance: 'attendance',
    warmup:     'weak_warmup',
    wizard:     'wizard',
    teacher:    'teacher_book',
    grammar:    'grammar',
    pair:       'pair_speaking',
    quiz:       'quiz_listening',
    arcade:     'arcade',
    homework:   'homework'
  };

  /* ====================================================================
     CONTENT TYPE LABELS (friendly names only — never real content)
     ==================================================================== */
  var CONTENT_TYPE_LABELS = {
    system:    'System (automatic)',
    weakparts: 'Weak Parts Review',
    dialogue:  'Dialogue / Speaking',
    teacher:   'Teacher Material',
    grammar:   'Grammar',
    pair:      'Pair Speaking',
    quiz:      'Quiz / Listening',
    arcade:    'Learning Arcade',
    homework:  'Homework / Report'
  };

  /* ====================================================================
     GENERIC NOTES FOR THE CONTENT WRITER (instructions, not content)
     ==================================================================== */
  var WRITER_NOTES = {
    attendance: 'No content needed — attendance is recorded automatically by the system.',
    warmup:     'Pull a few review items from the student\u2019s recent weak words/phrases (placeholder only — no items defined yet).',
    wizard:     'Add a short speaking/listening prompt or dialogue suited to this track and level.',
    teacher:    'Reference the classroom book/video/workbook page or section to use here.',
    grammar:    'Add one grammar point appropriate for this week, with a short Pashto explanation.',
    pair:       'Add a short pair-speaking task topic appropriate for this level.',
    quiz:       'Add a short quiz or listening-review tied to this day\u2019s material.',
    arcade:     'No content needed yet — arcade gameplay/content arrives in a later phase.',
    homework:   'Add a short homework task plus a one-line father-report note template.'
  };

  function suggestedDifficultyFor(month){
    month = parseInt(month,10) || 1;
    if (month <= 1) return 'introductory';
    if (month <= 2) return 'foundational';
    if (month <= 4) return 'developing';
    return 'consolidating';
  }

  /* ====================================================================
     SLOT ID BUILDER
     ==================================================================== */
  function buildSlotId(month, week, day, blockKey){
    var suffix = SLOT_SUFFIX[blockKey] || blockKey || 'block';
    return 'm'+month+'_w'+week+'_d'+day+'_'+suffix;
  }

  /* ====================================================================
     GENERATE PLACEHOLDER SLOT RECORDS — Month 1, Weeks 1–2, Days 1–5 ONLY
     ---------------------------------------------------------------------
     Phase H3:  Month 1 / Week 1 / Days 1–5  -> 45 placeholder records.
     Phase H5A: Month 1 / Week 2 / Days 1–5  -> 45 MORE placeholder records
                (this phase's addition; Week 1's 45 are untouched).
     Total after H5A = 90 placeholder records. Week 3+ and every other
     month intentionally have NO placeholder records — resolveSlot() falls
     back safely (mapped:false) for anything beyond this range. Block
     definitions are read from window.ZirakClassPath.defaultBlocks() — the
     single source of truth — so this map can never drift from the real
     block list.
     ==================================================================== */
  var SLOTS = {};
  var MAPPED_WEEKS = [
    { month: 1, week: 1 },  // Phase H3
    { month: 1, week: 2 }   // Phase H5A
  ];
  (function generatePlaceholders(){
    var cp = CP();
    var blockDefs = (cp && typeof cp.defaultBlocks === 'function') ? cp.defaultBlocks() : [];
    if (!blockDefs.length) return; // classpath module not loaded yet — SLOTS stays empty; resolveSlot() still falls back safely
    MAPPED_WEEKS.forEach(function(mw){
      for (var day = 1; day <= 5; day++){
        blockDefs.forEach(function(b){
          var slotId = buildSlotId(mw.month, mw.week, day, b.key);
          SLOTS[slotId] = {
            slotId: slotId,
            month: mw.month, week: mw.week, day: day,
            blockType: b.key,
            linkedPage: b.linkedPage || null,
            linkedContentType: b.linkedContentType || null,
            title: 'Content pending',
            status: 'pending',
            contentOwner: 'ChatGPT/content team',
            notesForContentWriter: WRITER_NOTES[b.key] || 'Content pending for this block.',
            suggestedDifficulty: suggestedDifficultyFor(mw.month),
            estimatedMinutes: b.estimatedMinutes || null
          };
        });
      }
    });
  })();

  /* ====================================================================
     PHASE H4A — REAL-CONTENT PROVIDER REGISTRY
     ---------------------------------------------------------------------
     Any future "real content" file (e.g. zirak-classpath-real-content-m1w1.js)
     self-registers here with a getRecord(slotId) function. resolveSlot()
     checks registered providers FIRST; if one has a real record for the
     slot, that record wins (status:'ready'). Otherwise resolveSlot() falls
     through to the H3 placeholder map, then the safe fallback — unchanged.
     This means later content batches (Day 3-5, Week 2, etc.) can register
     themselves WITHOUT any further edits to this file or to
     zirak-classpath.js's resolveBlockContent().
     ==================================================================== */
  var realContentProviders = [];
  function registerRealContentProvider(provider){
    if (provider && typeof provider.getRecord === 'function') realContentProviders.push(provider);
  }
  function getRealRecord(slotId){
    if (!slotId) return null;
    // last-registered wins, so a later/override file can safely supersede an earlier one
    for (var i = realContentProviders.length - 1; i >= 0; i--){
      try {
        var rec = realContentProviders[i].getRecord(slotId);
        if (rec) return rec;
      } catch(e){ /* never let one bad provider break resolution */ }
    }
    return null;
  }

  /* ====================================================================
     LOOKUP + RESOLVE
     ==================================================================== */
  function getSlot(slotId){
    return SLOTS[slotId] || null;
  }

  // resolveSlot(block, student) — called by zirak-classpath.js's
  // resolveBlockContent(). `block` must carry month/week/day (buildDay()
  // tags every block with these in Phase H3). Resolution order:
  //   1) a registered REAL content record (status:'ready') — Phase H4A+
  //   2) the H3 placeholder map (status:'pending', mapped:true)
  //   3) a safe fallback (status:'pending', mapped:false) — never throws
  function resolveSlot(block, student){
    block = block || {};
    var month = block.month, week = block.week, day = block.day;
    var slotId = (month && week && day) ? buildSlotId(month, week, day, block.key) : null;

    // 1) Real content, if any provider has it for this slot.
    var real = slotId ? getRealRecord(slotId) : null;
    if (real){
      var outReal = {};
      for (var rk in real) outReal[rk] = real[rk];
      outReal.slotId = outReal.slotId || slotId;
      outReal.track = (student && student.track) || outReal.track || '';
      outReal.mapped = true;
      outReal.real = true;
      return outReal;
    }

    // 2) H3 placeholder map (unchanged behaviour from Phase H3).
    var rec = slotId ? getSlot(slotId) : null;
    if (rec){
      var out = {};
      for (var k in rec) out[k] = rec[k];
      out.track = (student && student.track) || '';
      out.mapped = true;
      out.real = false;
      return out;
    }
    // 3) Unmapped slot (anything outside Month1/Week1/Days1-5 for now) —
    // safe fallback, never crashes, never invents content.
    return {
      slotId: slotId,
      month: month || null, week: week || null, day: day || null,
      blockType: block.key || null,
      linkedPage: block.linkedPage || null,
      linkedContentType: block.linkedContentType || null,
      title: 'Content pending',
      status: 'pending',
      contentOwner: 'ChatGPT/content team',
      notesForContentWriter: WRITER_NOTES[block.key] || 'Content pending for this block.',
      message: 'Slot not mapped yet',
      track: (student && student.track) || '',
      mapped: false,
      real: false
    };
  }

  // Convenience for the teacher "View Content Slots" panel: the 9 slot
  // entries (mapped or fallback) for a given month/week/day.
  function listSlotsForDay(month, week, day, student){
    var cp = CP();
    var blockDefs = (cp && typeof cp.defaultBlocks === 'function') ? cp.defaultBlocks() : [];
    return blockDefs.map(function(b){
      return resolveSlot({ key:b.key, month:month, week:week, day:day,
                            linkedPage:b.linkedPage, linkedContentType:b.linkedContentType }, student);
    });
  }

  /* ====================================================================
     PUBLIC API
     ==================================================================== */
  window.ZirakClassPathContentMap = {
    SLOT_SUFFIX: SLOT_SUFFIX,
    CONTENT_TYPE_LABELS: CONTENT_TYPE_LABELS,
    buildSlotId: buildSlotId,
    getSlot: getSlot,
    resolveSlot: resolveSlot,
    listSlotsForDay: listSlotsForDay,
    registerRealContentProvider: registerRealContentProvider,
    getRealRecord: getRealRecord,
    // exposed for diagnostics/tests only — treat as read-only
    _mappedSlotCount: function(){ return Object.keys(SLOTS).length; },
    _mappedSlotIds: function(){ return Object.keys(SLOTS); }
  };
})();
