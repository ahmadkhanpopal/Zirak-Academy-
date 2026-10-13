/* ============================================================================
   zirak-academy-tests.js — PHASE I6H-D
   ONE ACADEMY TESTS MODULE (foundation: Daily Learning Review)
   ----------------------------------------------------------------------------
   Architecture:
   • ONE module — window.ZirakAcademyTests
   • Questions built DETERMINISTICALLY from today's ZirakLearningLedger records.
   • Result saved once to the ledger (stable id → upsert on retry).
   • WhatsApp proof via the ONE shared ZirakResultProof helper.
   • UI rendered into a full-page overlay (same sheet pattern as the ledger).
   • An entry card is injected into #screen-review, after the LLG launcher card,
     guarded against double-inject.

   QUESTION TYPES SUPPORTED:
   choose       — 4-option MC with one correct answer
   fillBlank    — short typed answer
   correction   — spot and fix the error in a sentence
   yesNo        — special choose for "Is this correct?"

   CONTENT SOURCES (all from today's ledger, not invented):
   1. weakItems from any record        → correction / choose items
   2. reviewItems[].model              → fillBlank / choose items
   3. sectionTitle/topicTitle names    → yesNo / topic-recall items
   4. Grammar formula rows (if stored) → choose items (future-safe hook)
   Target 8–12 questions; minimum 3; caps at 15.

   WEEKLY/MONTHLY: placeholder cards shown, NO functionality yet.
   ============================================================================ */
(function () {
  'use strict';

  /* ── tiny helpers ─────────────────────────────────────────────────────── */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  // I6H-D2A FIX: expand common contractions BEFORE punctuation stripping,
  // so "they're" and "they are" normalize to the same token stream.
  // Same false-negative class caught in real phone testing (I6H-D2 review).
  var CONTRACTIONS = [
    [/\bi'm\b/g,"i am"],[/\byou're\b/g,"you are"],[/\bwe're\b/g,"we are"],
    [/\bthey're\b/g,"they are"],[/\bhe's\b/g,"he is"],[/\bshe's\b/g,"she is"],
    [/\bit's\b/g,"it is"],[/\bthat's\b/g,"that is"],[/\bwhat's\b/g,"what is"],
    [/\bisn't\b/g,"is not"],[/\baren't\b/g,"are not"],[/\bwasn't\b/g,"was not"],
    [/\bweren't\b/g,"were not"],[/\bdon't\b/g,"do not"],[/\bdoesn't\b/g,"does not"],
    [/\bdidn't\b/g,"did not"],[/\bcan't\b/g,"can not"],[/\bcannot\b/g,"can not"],
    [/\bwon't\b/g,"will not"],[/\bi've\b/g,"i have"],[/\byou've\b/g,"you have"],
    [/\bwe've\b/g,"we have"],[/\bthey've\b/g,"they have"],[/\bi'll\b/g,"i will"],
    [/\byou'll\b/g,"you will"],[/\bhe'll\b/g,"he will"],[/\bshe'll\b/g,"she will"],
    [/\bwe'll\b/g,"we will"],[/\bthey'll\b/g,"they will"]
  ];
  function expandContractions(s){
    var t = String(s||'').toLowerCase();
    CONTRACTIONS.forEach(function(pair){ t = t.replace(pair[0], pair[1]); });
    return t;
  }
  function norm(s){ return expandContractions(s).replace(/[.,!?;:'\"()]/g,' ').replace(/\s+/g,' ').trim(); }
  // I6H-D2A: word-overlap scorer (same trusted grader as grammar-lab-auto-wizard.js
  // scoreOverlap — ONE grading philosophy across every wizard/test in the app).
  function overlapPct(said, target){
    var tw = norm(target).split(' ').filter(Boolean);
    var sw = norm(said).split(' ').filter(Boolean);
    if(!tw.length) return 100;
    if(!sw.length) return 0;
    var bag = {}; sw.forEach(function(w){ bag[w] = (bag[w]||0)+1; });
    var hit = 0;
    tw.forEach(function(w){ if(bag[w] > 0){ hit++; bag[w]--; } });
    return Math.round((hit/tw.length)*100);
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D2B — QUESTION-TYPE-SPECIFIC GRADING DISPATCH
     ------------------------------------------------------------------------
     ChatGPT's D2A review correctly flagged: one universal grader is wrong
     long-term. Different question shapes need different tolerance:
       choose / yesNo     → exact match (already unambiguous — a click)
       fillBlank          → NEAR-EXACT (Levenshtein). A single word/short
                             phrase has no real "70% of the words" middle
                             ground — either it's the right word (or a typo
                             away) or it's a different word.
       correction /
       transformation      → OVERLAP. Whole-sentence rewrites can reorder or
                             lightly rephrase while staying correct.
       translation         → OVERLAP but more forgiving threshold + full
                             acceptable[] equivalence set (not just [0]),
                             because a correct translation can legitimately
                             use different words.
       typed (fallback)    → OVERLAP, same as before I6H-D2A.
     Every grader returns {ok, pct} so the UI/ledger keep reporting a %.
     ═══════════════════════════════════════════════════════════════════════ */

  // Small Levenshtein distance (edit distance) — safe O(n*m), inputs are
  // short (words/short phrases), never full paragraphs.
  function levenshtein(a, b) {
    a = String(a || ''); b = String(b || '');
    var m = a.length, n = b.length;
    if (!m) return n; if (!n) return m;
    var prev = new Array(n + 1), cur = new Array(n + 1);
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      cur[0] = i;
      for (var k = 1; k <= n; k++) {
        var cost = a[i - 1] === b[k - 1] ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
      }
      var tmp = prev; prev = cur; cur = tmp;
    }
    return prev[n];
  }

  // Collect every acceptable spelling of the correct answer for a question:
  // q.correct, plus q.acceptable[] if the source data carried one (GL test
  // sessions already author these; earlier code only used acceptable[0]).
  function acceptableList(q) {
    var list = [];
    if (q.correct) list.push(q.correct);
    if (Array.isArray(q.acceptable)) list = list.concat(q.acceptable);
    return list.length ? list : [''];
  }

  function gradeExact(given, q) {
    var ok = acceptableList(q).some(function(a) { return norm(given) === norm(a); });
    return { ok: ok, pct: ok ? 100 : 0 };
  }

  function gradeNearExact(given, q) {
    var g = norm(given);
    var best = 0;
    acceptableList(q).forEach(function(a) {
      var target = norm(a);
      if (!target) return;
      if (g === target) { best = Math.max(best, 100); return; }
      var dist = levenshtein(g, target);
      var longer = Math.max(g.length, target.length) || 1;
      // Allow 1 typo for short words, up to ~20% edit distance for longer ones.
      var maxDist = longer <= 4 ? 1 : Math.max(1, Math.round(longer * 0.2));
      if (dist <= maxDist) best = Math.max(best, Math.round((1 - dist / longer) * 100));
    });
    return { ok: best >= 75, pct: best };
  }

  function gradeOverlap(given, q, threshold) {
    var best = 0;
    acceptableList(q).forEach(function(a) {
      best = Math.max(best, overlapPct(given, a));
    });
    return { ok: best >= (threshold || 70), pct: best };
  }

  function gradeTranslation(given, q) {
    // Exact/near match against ANY acceptable phrasing first (fast path for
    // a student who nails the exact wording), then fall back to a more
    // forgiving overlap threshold — translations legitimately vary in word
    // choice more than corrections/transformations do.
    var exact = gradeExact(given, q);
    if (exact.ok) return exact;
    return gradeOverlap(given, q, 55);
  }

  // ONE dispatch point used by every typed-answer check in this module.
  function graderFor(qType) {
    switch (qType) {
      case 'choose':
      case 'yesNo':        return gradeExact;
      case 'fillBlank':     return gradeNearExact;
      case 'correction':
      case 'transformation': return gradeOverlap;
      case 'translation':    return gradeTranslation;
      default:                return gradeOverlap; // safe default (old behavior)
    }
  }
  function gradeAnswer(given, q) {
    return graderFor(q.type)(given, q);
  }
  function shuffle(a){ var b=a.slice(); for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t;} return b; }
  function $id(id){ return document.getElementById(id); }
  function cal(){ return window.ZirakInstituteCalendar||null; }
  function ledger(){ return window.ZirakLearningLedger||null; }

  /* ── state ────────────────────────────────────────────────────────────── */
  var AT = {
    questions: [],     // generated question objects
    idx: 0,
    results: [],       // {q, answer, correct, ok}
    scored: false,     // per-question guard
    dateKey: '',
    calLabel: ''
  };

  /* ── STUDENT ID for stable ledger record id ───────────────────────────── */
  function studentId(){
    try{
      var p=(window.ZirakProfile&&window.ZirakProfile.getActive)?window.ZirakProfile.getActive():null;
      return (p&&(p.studentId||p.id))||'guest';
    }catch(e){ return 'guest'; }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     PART A — QUESTION GENERATION
     ═══════════════════════════════════════════════════════════════════════ */
  function getTodayRecords(){
    // I6H-D12: placement records are diagnostic — they never enter the
    // Daily Learning Review pool, never unlock Weekly/Two-Week/Monthly
    // assessments, and never generate Topic Quiz questions.
    try{
      return ((ledger()&&ledger().getTodayRecords())||[]).filter(function(r){
        return r && r.source !== 'academy-placement-test' && r.source !== 'personal-learning-plan';
      });
    }catch(e){ return []; }
  }

  /* Build a pool of raw items from ledger records, then convert to questions. */
  /* ══════════════════════════════════════════════════════════════════════
     I6H-D6 — DAILY TEST SECTION INTELLIGENCE
     Groups today's ledger records into meaningful categories BEFORE
     generating questions, instead of one flat shuffled pool. A category
     only produces a section if it actually has data — nothing is invented.
     ══════════════════════════════════════════════════════════════════════ */
  // I6H-D8: ONE dispatch point for "which finish function applies" —
  // used by renderQuestion() and advance() so a third test type (twoWeek)
  // doesn't need two more inline ternaries scattered through the file.
  function _finishFnForTestType(){
    if (AT.testType === 'weekly') return finishWeeklyTest;
    if (AT.testType === 'twoWeek') return finishTwoWeekReview;
    if (AT.testType === 'monthly') return finishMonthlyExam;
    return finishDailyTest;
  }
  var SECTION_LABELS = {
    grammar: 'Grammar', vocabulary: 'Vocabulary', sentence: 'Sentence Practice',
    dialogueInterview: 'Dialogue & Interview', general: 'General Practice'
  };
  function _sectionCategoryOf(record){
    var src = record.source, at = record.activityType;
    if (src === 'grammar-world-practice' || src === 'grammar-auto-wizard' ||
        src === 'grammar-lab-topic-test' || src === 'grammar-world-topic-test') return 'grammar';
    if (src === 'quiz' || (src === 'wordlab' && at === 'word-wizard')) return 'vocabulary';
    if (src === 'wordlab' && at === 'sentence-practice') return 'sentence';
    if (src === 'dialogue' || src === 'interview') return 'dialogueInterview';
    return 'general'; // quick-practice, weak-review, other, or anything future/unknown
  }
  function groupRecordsBySection(records){
    var groups = { grammar:[], vocabulary:[], sentence:[], dialogueInterview:[], general:[] };
    records.forEach(function(r){ groups[_sectionCategoryOf(r)].push(r); });
    return groups;
  }
  // Same 3-source extraction buildDailyTest always used (weakItems /
  // reviewItems / sectionTitle-recall), scoped to one category's records,
  // carrying branch/level through when a record has them (Topic Quiz
  // records do, as of this phase; older/other records safely default to '').
  function _buildPoolFromRecords(records){
    var pool = [];
    records.forEach(function(r){
      (r.weakItems||[]).forEach(function(w){
        var t = (typeof w==='string') ? w : (w&&(w.q||w.target||w.en))||'';
        if(t.length>3 && t.length<200) pool.push({text:t, correct:t, source:r.source, rawType:'weak', branch:r.branch||'', level:r.level||''});
      });
    });
    records.forEach(function(r){
      (r.reviewItems||[]).forEach(function(ri){
        var model = (typeof ri==='object') ? (ri.model||ri.correct||ri.target||'') : '';
        var q     = (typeof ri==='object') ? (ri.q||ri.target||ri.prompt||'') : String(ri||'');
        if(model && model.length>2 && model.length<200 && q.length>2)
          pool.push({text:q, correct:model, source:r.source, rawType:'review', branch:r.branch||'', level:r.level||''});
      });
    });
    records.forEach(function(r){
      if(r.sectionTitle && r.total>0 && r.good!=null){
        pool.push({text:'Did you practice: "'+r.sectionTitle+'" today?',
                   correct:'Yes', source:r.source, rawType:'topic-recall', display:true, branch:r.branch||'', level:r.level||''});
      }
    });
    return pool;
  }
  function _poolToQuestions(pool, sectionLabel, maxCount){
    if(!pool.length) return [];
    var seen={}, deduped=[];
    pool.forEach(function(p){ var k=norm(p.text).slice(0,80); if(!seen[k]){seen[k]=1; deduped.push(p);} });
    var qs=[], src=shuffle(deduped);
    src.forEach(function(item){
      if(qs.length>=maxCount) return;
      var q;
      if(item.rawType==='topic-recall') q = makeYesNo(item);
      else if(item.rawType==='weak') q = Math.random()>0.5 ? makeCorrection(item) : makeChoose(item, src);
      else q = qs.length%2===0 ? makeFillBlank(item) : makeChoose(item, src);
      q.sectionLabel = sectionLabel;
      q.branch = item.branch || '';
      q.level = item.level || '';
      q.isWeak = (item.rawType==='weak');
      qs.push(q);
    });
    return qs;
  }
  // I6H-D6: fair daily-test sizing — 6-12 questions, Weak Recovery and at
  // least a couple of Grammar questions protected when trimming, everything
  // else sampled. Order preserved (sectioned), not reshuffled at the end.
  function selectBalancedDailyQuestions(qs){
    if (qs.length <= 12) return qs;
    var weakOnes    = qs.filter(function(q){ return q.sectionLabel === 'Weak Recovery'; });
    var grammarOnes = qs.filter(function(q){ return q.sectionLabel === 'Grammar'; });
    var rest        = qs.filter(function(q){ return q.sectionLabel !== 'Weak Recovery' && q.sectionLabel !== 'Grammar'; });
    var kept = weakOnes.slice(0,4).concat(grammarOnes.slice(0,4));
    var remaining = 12 - kept.length;
    if (remaining > 0) kept = kept.concat(rest.slice(0, remaining));
    return kept.slice(0,12);
  }

  function buildDailyTest(records){
    records = records || getTodayRecords();
    // Exclude the daily-test record itself to avoid circular reference.
    records = records.filter(function(r){ return r.source !== 'academy-daily-test' && r.source !== 'academy-certificate' && r.source !== 'academy-report-card' && r.source !== 'personal-learning-plan'; }); // I6H-D10: achievement records never become question material; I6H-D13A: plan-administrative records never become question material either
    if (!records.length) return [];

    var groups = groupRecordsBySection(records);
    var qs = [];
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.grammar), SECTION_LABELS.grammar, 4));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.vocabulary), SECTION_LABELS.vocabulary, 3));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.sentence), SECTION_LABELS.sentence, 3));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.dialogueInterview), SECTION_LABELS.dialogueInterview, 3));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.general), SECTION_LABELS.general, 3));

    // Weak Recovery: pooled from ALL of today's records (any category),
    // shown as its own final section — only appears if weak data exists.
    var weakPool = [];
    records.forEach(function(r){
      (r.weakItems||[]).forEach(function(w){
        var t = (typeof w==='string') ? w : (w&&(w.q||w.target||w.en))||'';
        if(t.length>3 && t.length<200) weakPool.push({text:t, correct:t, source:r.source, rawType:'weak', branch:r.branch||'', level:r.level||''});
      });
    });
    if (weakPool.length) qs = qs.concat(_poolToQuestions(weakPool, 'Weak Recovery', 3));

    if (!qs.length) return [];

    // Global dedupe (a weak item can also surface as a review item elsewhere).
    var seenGlobal={}, finalQs=[];
    qs.forEach(function(q){
      var k=norm(q.prompt||'').slice(0,80);
      if(!seenGlobal[k]){ seenGlobal[k]=1; finalQs.push(q); }
    });

    return selectBalancedDailyQuestions(finalQs);
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D7 — WEEKLY ACADEMY TEST: QUESTION POOL + READINESS + SUMMARY
     Reuses the EXACT SAME primitives as Daily Test (groupRecordsBySection,
     _buildPoolFromRecords, _poolToQuestions, makeChoose/makeFillBlank/
     makeCorrection/makeYesNo) — only the record source (a week of days
     instead of today) and the per-category/overall caps differ. This is
     deliberately NOT a second test engine; it's the same engine fed a
     wider date range with weekly-sized limits.
     ══════════════════════════════════════════════════════════════════════ */
  function _weekRange(){
    try { return cal() ? cal().getAcademyWeekRange() : null; } catch(e) { return null; }
  }
  function _weekStudyRecords(){
    try { return ledger() ? ledger().getAcademyWeekStudyRecords() : []; } catch(e) { return []; }
  }
  // I6H-D14C — pure record-matching helper. Depends ONLY on its
  // arguments (records, weekRange). Never calls the active Learning
  // Ledger, never calls studentId(), never calls ZirakStorageKey()
  // without an explicit student. This is the ONE place the "does a
  // Weekly Test record satisfy this week range" rule lives.
  function findWeeklyTestRecordInRecords(records, weekRange) {
    if (!weekRange) return null;
    var candidates = (records || []).filter(function (r) { return r && r.source === 'academy-weekly-test'; });
    var byStart = candidates.filter(function (r) { return r.weekStartDateKey === weekRange.weekStartDateKey; });
    if (byStart.length) return byStart[0];
    var inRange = candidates.filter(function (r) { return weekRange.studyDateKeys && weekRange.studyDateKeys.indexOf(r.dateKey) > -1; });
    return inRange.length ? inRange[0] : null;
  }
  // I6H-D7A: ONE shared completion-detection helper. Both renderHome() and
  // the Learning Ledger's "This Week" card call this — no more ad-hoc
  // .some()/.filter() duplicated in two places that could drift apart.
  // Matches by weekStartDateKey first (the reliable primary key, saved on
  // every weekly record from D7A onward), falling back to dateKey-within-
  // studyDateKeys for any older record that predates that field.
  //
  // I6H-D14C: this is now a thin ACTIVE-STUDENT wrapper — it reads the
  // active student's week records, then calls the pure helper above.
  // The matching RULE lives in exactly one place.
  function findWeeklyTestRecord(weekRange){
    weekRange = weekRange || _weekRange();
    return findWeeklyTestRecordInRecords(_weekStudyRecords(), weekRange);
  }
  // I6H-D7: readiness rule exactly as specified — ready if ANY of:
  // 3+ study days have activity, OR 2+ Daily Learning Reviews completed, OR 5+ records.
  // I6H-D14C: the PURE rule. Depends only on its records argument —
  // no default fallback to the active student's Ledger.
  function isWeeklyTestReadyFromRecords(weekRecords){
    weekRecords = weekRecords || [];
    // I6H-D10: achievement records (certificate/report-card) must never
    // count toward readiness thresholds — they don't represent learning.
    weekRecords = weekRecords.filter(function(r){ return r.source!=='academy-certificate' && r.source!=='academy-report-card' && r.source!=='personal-learning-plan'; });
    if (!weekRecords.length) return false;
    var daysWithActivity = {};
    var dailyTestCount = 0;
    weekRecords.forEach(function(r){
      // I6H-D12: placement is diagnostic — it never inflates study days.
      if(r.source!=='academy-certificate'&&r.source!=='academy-report-card'&&r.source!=='academy-placement-test'&&r.source!=='personal-learning-plan') daysWithActivity[r.dateKey] = true;
      if (r.source === 'academy-daily-test') dailyTestCount++;
    });
    var studyDayCount = Object.keys(daysWithActivity).length;
    return studyDayCount >= 3 || dailyTestCount >= 2 || weekRecords.length >= 5;
  }
  // I6H-D14C: thin ACTIVE-STUDENT wrapper over the pure rule above.
  function isWeeklyTestReady(weekRecords){
    weekRecords = weekRecords || _weekStudyRecords();
    return isWeeklyTestReadyFromRecords(weekRecords);
  }
  // I6H-D7: the weekly pool. Unlike buildDailyTest (which excludes
  // 'academy-daily-test' to avoid a same-day circular reference), the
  // weekly pool DELIBERATELY includes Daily Test records as source material
  // — the phase explicitly asks for "Daily Learning Review questions/results"
  // as a weekly source. Only the weekly test's own prior record is excluded.
  function buildWeeklyQuestionPool(weekRecords){
    weekRecords = weekRecords || _weekStudyRecords();
    weekRecords = weekRecords.filter(function(r){ return r.source !== 'academy-weekly-test' && r.source !== 'academy-certificate' && r.source !== 'academy-report-card' && r.source !== 'personal-learning-plan'; }); // I6H-D10: achievement records never become question material; I6H-D13A: plan-administrative records excluded too
    if (!weekRecords.length) return [];

    var groups = groupRecordsBySection(weekRecords);
    var qs = [];
    // Weekly caps are larger than daily's (4/3/3/3/3) to reach the 12-20
    // target size the phase specifies for a normal week.
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.grammar), SECTION_LABELS.grammar, 6));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.vocabulary), SECTION_LABELS.vocabulary, 4));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.sentence), SECTION_LABELS.sentence, 4));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.dialogueInterview), SECTION_LABELS.dialogueInterview, 4));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.general), SECTION_LABELS.general, 4));

    // Weak Recovery, with REPEATED marking — a weak text seen in more than
    // one record this week is tagged isRepeated:true (I6H-D7 section 11).
    var weakCount = {}, weakPool = [];
    weekRecords.forEach(function(r){
      (r.weakItems||[]).forEach(function(w){
        var t = (typeof w==='string') ? w : (w&&(w.q||w.target||w.en))||'';
        if(t.length>3 && t.length<200){
          var k = norm(t).slice(0,80);
          weakCount[k] = (weakCount[k]||0)+1;
          weakPool.push({text:t, correct:t, source:r.source, rawType:'weak', branch:r.branch||'', level:r.level||'', _k:k});
        }
      });
    });
    if (weakPool.length){
      var weakQs = _poolToQuestions(weakPool, 'Weak Recovery', 5);
      weakQs.forEach(function(q){
        var k = norm(q.correct||'').slice(0,80);
        q.isRepeated = (weakCount[k]||0) > 1;
      });
      qs = qs.concat(weakQs);
    }

    if (!qs.length) return [];
    var seenGlobal={}, finalQs=[];
    qs.forEach(function(q){
      var k=norm(q.prompt||'').slice(0,80);
      if(!seenGlobal[k]){ seenGlobal[k]=1; finalQs.push(q); }
    });
    return selectBalancedWeeklyQuestions(finalQs);
  }
  // I6H-D7: weekly sizing — 12-20 questions (8-12 on a small-data week),
  // same trim-protection pattern as the daily version.
  function selectBalancedWeeklyQuestions(qs){
    var cap = qs.length >= 16 ? 20 : 12;
    if (qs.length <= cap) return qs;
    var weakOnes    = qs.filter(function(q){ return q.sectionLabel === 'Weak Recovery'; });
    var grammarOnes = qs.filter(function(q){ return q.sectionLabel === 'Grammar'; });
    var rest        = qs.filter(function(q){ return q.sectionLabel !== 'Weak Recovery' && q.sectionLabel !== 'Grammar'; });
    var kept = weakOnes.slice(0,6).concat(grammarOnes.slice(0,6));
    var remaining = cap - kept.length;
    if (remaining > 0) kept = kept.concat(rest.slice(0, remaining));
    return kept.slice(0, cap);
  }
  // I6H-D7: Weekly Learning Summary — study days completed, tests
  // completed, branches/levels touched, strong/weak areas, and a
  // deterministic readiness label. Reused by both the entry-point card and
  // the weekly result screen.
  function buildWeeklyLearningSummary(weekRecords, weekRange){
    weekRecords = weekRecords || _weekStudyRecords();
    weekRange = weekRange || _weekRange();
    var daysWithActivity = {};
    var topicTests = 0, dailyTests = 0;
    var branchTally = {}, levelSeen = {};
    var totalItems = 0, totalGood = 0;
    weekRecords.forEach(function(r){
      // I6H-D12: placement is diagnostic — it never inflates study days.
      if(r.source!=='academy-certificate'&&r.source!=='academy-report-card'&&r.source!=='academy-placement-test'&&r.source!=='personal-learning-plan') daysWithActivity[r.dateKey] = true;
      if (r.source === 'grammar-lab-topic-test' || r.source === 'grammar-world-topic-test') topicTests++;
      if (r.source === 'academy-daily-test') dailyTests++;
      totalItems += (r.total||0);
      totalGood  += (r.good||0);
      if (r.branch) {
        branchTally[r.branch] = branchTally[r.branch] || { correct:0, total:0 };
        branchTally[r.branch].total += (r.total||0);
        branchTally[r.branch].correct += (r.good||0);
      }
      if (r.level) levelSeen[r.level] = (levelSeen[r.level]||0)+1;
    });
    var studyDaysCompleted = Object.keys(daysWithActivity).length;
    var branches = Object.keys(branchTally);
    var weakBranches   = branches.filter(function(b){ return branchTally[b].total>0 && (branchTally[b].correct/branchTally[b].total) < 0.6; });
    var strongBranches = branches.filter(function(b){ return branchTally[b].total>0 && (branchTally[b].correct/branchTally[b].total) >= 0.8; });
    var avgPct = totalItems>0 ? Math.round((totalGood/totalItems)*100) : null;

    var status;
    if (weekRecords.length < 3) status = 'Not Enough Study Data';
    else if (weakBranches.length > 0 && avgPct !== null && avgPct < 60) status = 'Weak Areas Repeated';
    else if (avgPct !== null && avgPct >= 80) status = 'Excellent Week';
    else if (avgPct !== null && avgPct >= 60) status = 'Good Week';
    else status = 'Needs Revision';

    // I6H-D7A: deterministic next action, same style as buildReadinessSnapshot's.
    var nextAction;
    if (status === 'Not Enough Study Data') nextAction = 'Practice more this week';
    else if (status === 'Weak Areas Repeated') nextAction = 'Teacher review recommended';
    else if (weakBranches.length > 0) nextAction = 'Needs weak-point revision';
    else if (status === 'Excellent Week') nextAction = 'Ready for next week';
    else nextAction = 'Good progress';

    return {
      weekLabel: weekRange ? weekRange.weekLabel : 'This Week',
      studyDaysCompleted: studyDaysCompleted,
      studyDaysTotal: 5,
      topicTestsCompleted: topicTests,
      dailyTestsCompleted: dailyTests,
      branchesTouched: branches,
      levelsTouched: Object.keys(levelSeen),
      strongBranches: strongBranches,
      weakBranches: weakBranches,
      totalItems: totalItems,
      totalGood: totalGood,
      averagePct: avgPct,
      status: status,
      nextAction: nextAction
    };
  }

  /* ── Weekly test flow: start / finish (reuses render/score/advance) ───── */
  function startWeeklyTest(){
    _activeEngine = 'daily'; // weekly questions share the same typed/MC UI, no mic either
    var weekRange = _weekRange();
    var weekRecords = _weekStudyRecords();
    if (!isWeeklyTestReady(weekRecords)){
      _showWeeklyNotEnough();
      return;
    }
    AT.testType = 'weekly';
    AT.weekRange = weekRange;
    AT.dateKey = weekRange ? weekRange.weekEndDateKey : _localDateKey();
    AT.calLabel = weekRange ? weekRange.weekLabel : 'This Week';
    AT.questions = buildWeeklyQuestionPool(weekRecords);
    AT.idx = 0; AT.results = []; AT.scored = false;
    if (AT.questions.length < 3){ _showWeeklyNotEnough(); return; }
    renderShell();
    renderQuestion();
  }
  function _showWeeklyNotEnough(){
    var old=$id('at-overlay'); if(old) old.remove();
    var ov=document.createElement('div'); ov.id='at-overlay'; ov.className='at-overlay';
    ov.innerHTML=
      '<div class="at-panel"><div class="at-head">'+
        '<button type="button" class="at-close" onclick="ZirakAcademyTests.close()">\u2715 Exit</button>'+
        '<div class="at-head-center"><span>\uD83D\uDCC5</span><span>Weekly Progress Test</span></div>'+
        '<div style="width:64px;"></div></div>'+
      '<div class="at-body" style="padding:24px;text-align:center;">'+
        '<div style="font-size:44px;margin-bottom:12px;">\uD83D\uDCDA</div>'+
        '<div style="font-size:16px;font-weight:800;margin-bottom:8px;">Not enough weekly learning data yet.</div>'+
        '<div style="font-size:13.5px;color:var(--text-muted);">Complete more lessons, practice, or Daily Learning Reviews first.</div>'+
        '<button type="button" class="at-btn at-btn-ghost" style="margin-top:20px;" onclick="ZirakAcademyTests.close()">\u2190 Back</button>'+
      '</div></div>';
    (document.getElementById('app')||document.body).appendChild(ov);
  }
  function finishWeeklyTest(){
    try{ window.speechSynthesis&&window.speechSynthesis.cancel(); }catch(e){}
    var total=AT.results.length||1;
    var good=AT.results.filter(function(r){return r.ok;}).length;
    var pct=Math.round((good/total)*100);
    var weak=AT.results.filter(function(r){return !r.ok;});
    var status=pct>=80?'Excellent \u2705':pct>=60?'Passed Strongly \u2705':pct>=40?'Needs Review \uD83D\uDD01':'Repeat Weak Parts \u274C';
    var heroBg=pct>=80?'linear-gradient(135deg,#059669,#10b981)':pct>=60?'linear-gradient(135deg,#d97706,#f59e0b)':pct>=40?'linear-gradient(135deg,#ea580c,#f97316)':'linear-gradient(135deg,#dc2626,#ef4444)';
    var encourage=pct>=80?'Outstanding week! You are ready to move ahead.':pct>=60?'Good week! Review the weak items before next week.':pct>=40?'Fair week. Revise the missed points.':'Keep going — repeat the weak points before next week.';

    var sectionScores = summarizeSectionScores(AT.results);
    var branchScores   = groupResultsByLevelBranch(AT.results);
    var weakGroups      = buildWeakRecoveryGroups(AT.results);
    var weekRecords = _weekStudyRecords();
    var summary = buildWeeklyLearningSummary(weekRecords, AT.weekRange);

    var stableId = 'academy-weekly-test-' + (AT.weekRange?AT.weekRange.weekStartDateKey:_localDateKey()) + '-' + studentId();
    saveWeeklyTestToLedger(stableId, good, total, pct, weak, status, summary, sectionScores, branchScores, weakGroups);

    var reviewHtml=AT.results.map(function(r,i){
      return '<div class="at-rev-row '+(r.ok?'at-rev-ok':'at-rev-bad')+'">'+
        '<div class="at-rev-q">'+(r.ok?'\u2705':'\u274C')+' <b>'+(i+1)+'.</b> '+
          (r.sectionLabel?'<span class="at-src-badge">'+esc(r.sectionLabel)+'</span> ':'')+
          esc((r.q||'').slice(0,120))+'</div>'+
        (r.ok?'':('<div class="at-rev-ans">Correct: '+esc(r.correct)+'</div>'))+
        (r.answer&&r.answer!=='(skipped)'?('<div class="at-rev-said">You: '+esc(String(r.answer).slice(0,80))+'</div>'):'')
      +'</div>';
    }).join('');

    var sectionHtml = sectionScores.length>1
      ? '<div class="at-sec-lbl">\uD83D\uDCCA Section Scores</div>'+
        '<div class="at-rev-list">'+sectionScores.map(function(s){
          var sp = s.total>0 ? Math.round((s.correct/s.total)*100) : 0;
          return '<div class="at-rev-row '+(sp>=60?'at-rev-ok':'at-rev-bad')+'">'+
            '<div class="at-rev-q">'+esc(s.section)+': '+s.correct+'/'+s.total+' ('+sp+'%)</div></div>';
        }).join('')+'</div>'
      : '';
    var branchHtml = branchScores.length
      ? '<div class="at-sec-lbl">\uD83C\uDF9F Branch Scores</div>'+
        '<div class="at-rev-list">'+branchScores.map(function(b){
          var bp = b.total>0 ? Math.round((b.correct/b.total)*100) : 0;
          return '<div class="at-rev-row '+(bp>=60?'at-rev-ok':'at-rev-bad')+'">'+
            '<div class="at-rev-q">'+esc(b.branch)+': '+b.correct+'/'+b.total+' ('+bp+'%)</div></div>';
        }).join('')+'</div>'
      : '';
    var weakHtml;
    if (!weak.length) weakHtml = '<div class="at-noweak">\u2705 No weak items. Excellent week!</div>';
    else weakHtml = weakGroups.map(function(g){
      return '<div class="at-weak-group-lbl">'+esc(g.group)+'</div>'+
        g.items.map(function(it){ return '<div class="at-weak-item">\u2022 '+esc(it)+'</div>'; }).join('');
    }).join('');

    var waHtml='';
    if(window.ZirakResultProof && window.ZirakResultProof.renderButtonHtml){
      var waLines=[
        '\uD83C\uDF93 *ZIRAK Weekly Progress Test*',
        'Week: ' + (AT.weekRange?AT.weekRange.weekLabel:'This Week'),
        'Study Days: ' + summary.studyDaysCompleted + '/5',
        'Score: ' + good + '/' + total + ' (' + pct + '%)',
        summary.levelsTouched.length ? ('Level: ' + summary.levelsTouched.join(', ')) : '',
        summary.branchesTouched.length ? ('Branches: ' + summary.branchesTouched.join(', ')) : '',
        summary.weakBranches.length ? ('Needs Review: ' + summary.weakBranches.join(', ')) : '',
        'Status: ' + summary.status,
        '',
        'Sent via Zirak English App \uD83C\uDF1F'
      ].filter(Boolean).join('\n');
      waHtml=window.ZirakResultProof.renderButtonHtml('Weekly Progress Test', good, total, {skipLedger:true, customText:waLines});
    }

    var body=$id('at-body'); if(!body) return;
    body.innerHTML=
      '<div class="at-result">'+
        '<div class="at-hero" style="background:'+heroBg+';">'+
          '<div class="at-hero-status">'+esc(status)+'</div>'+
          '<div class="at-hero-ring">'+pct+'<span class="at-hero-pct">%</span></div>'+
          '<div class="at-hero-score">'+good+' / '+total+' correct</div>'+
          '<div class="at-hero-label">'+esc(AT.weekRange?AT.weekRange.weekLabel:'This Week')+'</div>'+
        '</div>'+
        '<div class="at-encourage">'+esc(encourage)+'</div>'+
        waHtml+
        '<div class="at-card" style="border-left:4px solid #7c3aed;">'+
          '<div class="at-sec-lbl" style="padding-top:0;">\uD83D\uDCC5 Weekly Learning Summary</div>'+
          '<div class="at-q-text" style="font-size:14px;">'+
            '<b>Study Days:</b> '+summary.studyDaysCompleted+' / 5<br>'+
            '<b>Tests Completed:</b> '+(summary.topicTestsCompleted+summary.dailyTestsCompleted)+'<br>'+
            (summary.branchesTouched.length?('<b>Branches:</b> '+esc(summary.branchesTouched.join(', '))+'<br>'):'')+
            (summary.strongBranches.length?('<b>Strong:</b> '+esc(summary.strongBranches.join(', '))+'<br>'):'')+
            (summary.weakBranches.length?('<b>Needs Review:</b> '+esc(summary.weakBranches.join(', '))+'<br>'):'')+
            '<b>Status:</b> '+esc(summary.status)+
          '</div>'+
        '</div>'+
        sectionHtml+branchHtml+
        '<div class="at-sec-lbl">\uD83D\uDCDD Questions Review</div>'+
        '<div class="at-rev-list">'+reviewHtml+'</div>'+
        '<div class="at-sec-lbl">'+(weak.length?'\uD83D\uDD01 Weak Items ('+weak.length+')':'\uD83C\uDFAF Weak Items')+'</div>'+
        '<div class="at-weak-list">'+weakHtml+'</div>'+
        '<div class="at-result-btns">'+
          '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.retryWeekly()">Retry \uD83D\uDD01</button>'+
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.openLedger()">\uD83D\uDCD8 Today\'s Record</button>'+
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.close()">\u2190 Exit</button>'+
        '</div>'+
        '<div style="height:24px;"></div>'+
      '</div>';

    try{
      var spoken='Weekly Progress Test complete. Your score is '+pct+' percent. '+good+' out of '+total+'. '+status+'. '+encourage;
      if(window.speechSynthesis){
        window.speechSynthesis.cancel();
        var u=new SpeechSynthesisUtterance(spoken); u.lang='en-US';
        window.speechSynthesis.speak(u);
      }
    }catch(e){}
  }
  function saveWeeklyTestToLedger(stableId, good, total, pct, weak, status, summary, sectionScores, branchScores, weakGroups){
    if(!ledger()) return;
    try{
      var model=_ledgerLoad();
      var dk = AT.weekRange ? AT.weekRange.weekEndDateKey : AT.dateKey;
      if(model&&model.days&&model.days[dk]){
        model.days[dk]=model.days[dk].filter(function(r){return r.id!==stableId;});
        _ledgerSave(model);
      }
    }catch(e){}
    // I6H-D7A: repeated weak items (seen in >1 record this week) grouped
    // the same way as the regular weak groups, using the isRepeated flag
    // now carried through from question -> AT.results by score().
    var repeatedWeak = (AT.results||[]).filter(function(r){ return !r.ok && r.isRepeated; });
    var repeatedGroups = {};
    repeatedWeak.forEach(function(r){
      var key = r.branch ? ('Grammar — ' + r.branch) : (r.sectionLabel || 'General');
      repeatedGroups[key] = repeatedGroups[key] || { group: key, items: [] };
      repeatedGroups[key].items.push(r.correct || r.q || '');
    });
    var repeatedWeakGroups = Object.keys(repeatedGroups).map(function(k){ return repeatedGroups[k]; });

    ledger().recordActivity({
      id: stableId,
      source: 'academy-weekly-test',
      sectionTitle: 'Weekly Progress Test',
      topicTitle: AT.weekRange ? AT.weekRange.weekLabel : 'This Week',
      activityType: 'academy-weekly-test',
      good: good, total: total, pct: pct,
      weakItems: weak.slice(0,12).map(function(r){return r.correct;}),
      reviewItems: AT.results.slice(0,24).map(function(r){
        return {q:r.q,ok:r.ok,said:r.answer,model:r.correct};
      }),
      feedback: status + ' — ' + summary.status,
      calendarLabel: AT.weekRange ? AT.weekRange.weekLabel : AT.calLabel,
      dateKey: AT.weekRange ? AT.weekRange.weekEndDateKey : AT.dateKey,
      branch: summary.branchesTouched.join(', '),
      level: summary.levelsTouched.join(', '),
      // I6H-D7A rich weekly metadata:
      weekStartDateKey: AT.weekRange ? AT.weekRange.weekStartDateKey : '',
      weekEndDateKey: AT.weekRange ? AT.weekRange.weekEndDateKey : '',
      studyDateKeys: AT.weekRange ? AT.weekRange.studyDateKeys : [],
      academyWeekLabel: AT.weekRange ? AT.weekRange.weekLabel : '',
      academyMonth: AT.weekRange ? AT.weekRange.academyMonth : null,
      academyWeekNumber: AT.weekRange ? AT.weekRange.academyWeekNumber : null,
      studyDaysCompleted: summary.studyDaysCompleted,
      studyDaysTotal: summary.studyDaysTotal,
      sectionScores: sectionScores || [],
      branchScores: branchScores || [],
      levelScores: [], // no separate per-level scoring beyond branch in this phase
      weakGroups: weakGroups || [],
      repeatedWeakGroups: repeatedWeakGroups,
      readinessStatus: summary.status,
      nextAction: summary.nextAction,
      branchesTouched: summary.branchesTouched,
      levelsTouched: summary.levelsTouched,
      strongTags: summary.strongBranches,
      weakTags: summary.weakBranches,
      questionCount: total
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D8 — TWO-WEEK REVIEW: QUESTION POOL + READINESS + SUMMARY + FLOW
     Same architecture as the Weekly block above, scaled to 10 study days
     (two academy weeks). Reuses the SAME primitives (groupRecordsBySection,
     _buildPoolFromRecords, _poolToQuestions, makeChoose/makeFillBlank/
     makeCorrection/makeYesNo) and the SAME shared shell/render/score/
     advance functions via AT.testType — no second engine.
     ═══════════════════════════════════════════════════════════════════════ */
  function _twoWeekRange(){
    try { return cal() ? cal().getAcademyTwoWeekRange() : null; } catch(e) { return null; }
  }
  function _twoWeekStudyRecords(){
    try { return ledger() ? ledger().getAcademyTwoWeekStudyRecords() : []; } catch(e) { return []; }
  }
  // I6H-D14C — pure record-matching helper (see findWeeklyTestRecordInRecords above).
  function findTwoWeekReviewRecordInRecords(records, range) {
    if (!range) return null;
    var candidates = (records || []).filter(function (r) { return r && r.source === 'academy-two-week-review'; });
    var byStart = candidates.filter(function (r) { return r.rangeStartDateKey === range.rangeStartDateKey; });
    if (byStart.length) return byStart[0];
    var inRange = candidates.filter(function (r) { return range.studyDateKeys && range.studyDateKeys.indexOf(r.dateKey) > -1; });
    return inRange.length ? inRange[0] : null;
  }
  // I6H-D8: same shared-helper pattern as findWeeklyTestRecord() (D7A) —
  // matches by rangeStartDateKey first, falls back to dateKey-within-range.
  // I6H-D14C: thin ACTIVE-STUDENT wrapper over the pure helper above.
  function findTwoWeekReviewRecord(range){
    range = range || _twoWeekRange();
    return findTwoWeekReviewRecordInRecords(_twoWeekStudyRecords(), range);
  }
  // I6H-D8: readiness exactly as specified — ready if ANY of:
  // 6+ study days active, OR (1+ weekly test AND 5+ study days),
  // OR 2 weekly tests completed, OR 12+ total records.
  //
  // I6H-D14C — student-isolation fix: weeklyTestsDone is now counted by
  // searching the SAME `records` array this function was given (via the
  // pure findWeeklyTestRecordInRecords helper), never the active
  // student's Ledger. This is what makes isTwoWeekReviewReadyFromRecords
  // usable for an explicit (possibly non-active) student without any
  // risk of counting another student's Weekly Test.
  function isTwoWeekReviewReadyFromRecords(records, range){
    records = records || [];
    // I6H-D10: same achievement-record exclusion as isWeeklyTestReady.
    records = records.filter(function(r){ return r.source!=='academy-certificate' && r.source!=='academy-report-card' && r.source!=='personal-learning-plan'; });
    if (!records.length) return false;
    var daysWithActivity = {};
    records.forEach(function(r){ if(r.source!=='academy-certificate'&&r.source!=='academy-report-card'&&r.source!=='personal-learning-plan') daysWithActivity[r.dateKey] = true; });
    var studyDayCount = Object.keys(daysWithActivity).length;
    var weeklyTestsDone = 0;
    if (range && range.weekRanges) {
      range.weekRanges.forEach(function(wr){
        // I6H-D14C: pure lookup against THIS function's own records —
        // never the active student's Ledger.
        if (findWeeklyTestRecordInRecords(records, wr)) weeklyTestsDone++;
      });
    }
    return studyDayCount >= 6 || (weeklyTestsDone >= 1 && studyDayCount >= 5) ||
           weeklyTestsDone >= 2 || records.length >= 12;
  }
  // I6H-D14C: thin ACTIVE-STUDENT wrapper — reads the active student's
  // two-week records, then calls the pure rule above. Exactly one copy
  // of the readiness formula exists; this just supplies its data source.
  function isTwoWeekReviewReady(records, range){
    records = records || _twoWeekStudyRecords();
    range = range || _twoWeekRange();
    return isTwoWeekReviewReadyFromRecords(records, range);
  }
  // I6H-D8: the two-week pool. Excludes only its own prior
  // 'academy-two-week-review' record; Daily/Weekly test records remain
  // valid source material (same reasoning as the weekly pool in D7).
  function buildTwoWeekQuestionPool(twoWeekRecords){
    twoWeekRecords = twoWeekRecords || _twoWeekStudyRecords();
    twoWeekRecords = twoWeekRecords.filter(function(r){ return r.source !== 'academy-two-week-review' && r.source !== 'academy-certificate' && r.source !== 'academy-report-card' && r.source !== 'personal-learning-plan'; }); // I6H-D10: achievement records never become question material; I6H-D13A: plan-administrative records excluded too
    if (!twoWeekRecords.length) return [];

    var groups = groupRecordsBySection(twoWeekRecords);
    var qs = [];
    // Two-week caps are larger than weekly's (6/4/4/4/4) to comfortably
    // reach the 18-30 target the phase specifies for a normal range.
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.grammar), SECTION_LABELS.grammar, 9));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.vocabulary), SECTION_LABELS.vocabulary, 6));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.sentence), SECTION_LABELS.sentence, 6));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.dialogueInterview), SECTION_LABELS.dialogueInterview, 6));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.general), SECTION_LABELS.general, 6));

    // I6H-D8: split weak items into "Weekly Weak Recovery" (seen once) vs
    // "Repeated Weak Points" (seen 2+ times across the 10 study days) —
    // two distinct sections per the phase spec (E and F), not just a flag.
    var weakCount = {}, weakPool = [];
    twoWeekRecords.forEach(function(r){
      (r.weakItems||[]).forEach(function(w){
        var t = (typeof w==='string') ? w : (w&&(w.q||w.target||w.en))||'';
        if(t.length>3 && t.length<200){
          var k = norm(t).slice(0,80);
          weakCount[k] = (weakCount[k]||0)+1;
          weakPool.push({text:t, correct:t, source:r.source, rawType:'weak', branch:r.branch||'', level:r.level||''});
        }
      });
    });
    if (weakPool.length){
      var onceOnly = weakPool.filter(function(p){ return weakCount[norm(p.text).slice(0,80)] <= 1; });
      var repeated = weakPool.filter(function(p){ return weakCount[norm(p.text).slice(0,80)] > 1; });
      if (onceOnly.length) qs = qs.concat(_poolToQuestions(onceOnly, 'Weekly Weak Recovery', 4));
      if (repeated.length) {
        var repeatedQs = _poolToQuestions(repeated, 'Repeated Weak Points', 5);
        repeatedQs.forEach(function(q){ q.isRepeated = true; });
        qs = qs.concat(repeatedQs);
      }
    }

    if (!qs.length) return [];
    var seenGlobal={}, finalQs=[];
    qs.forEach(function(q){
      var k=norm(q.prompt||'').slice(0,80);
      if(!seenGlobal[k]){ seenGlobal[k]=1; finalQs.push(q); }
    });
    return selectBalancedTwoWeekQuestions(finalQs);
  }
  // I6H-D8: two-week sizing — 18-30 (12-18 on a small-data range), same
  // trim-protection pattern as daily/weekly.
  function selectBalancedTwoWeekQuestions(qs){
    var cap = qs.length >= 24 ? 30 : 18;
    if (qs.length <= cap) return qs;
    var repeated = qs.filter(function(q){ return q.sectionLabel === 'Repeated Weak Points'; });
    var weakOnes = qs.filter(function(q){ return q.sectionLabel === 'Weekly Weak Recovery'; });
    var grammarOnes = qs.filter(function(q){ return q.sectionLabel === 'Grammar'; });
    var rest = qs.filter(function(q){
      return q.sectionLabel !== 'Repeated Weak Points' && q.sectionLabel !== 'Weekly Weak Recovery' && q.sectionLabel !== 'Grammar';
    });
    var kept = repeated.slice(0,8).concat(weakOnes.slice(0,6)).concat(grammarOnes.slice(0,8));
    var remaining = cap - kept.length;
    if (remaining > 0) kept = kept.concat(rest.slice(0, remaining));
    return kept.slice(0, cap);
  }
  // I6H-D8: Two-Week Learning Summary — study days/10, weekly tests/2
  // (via findWeeklyTestRecord on each of the range's two weekRanges),
  // daily/topic tests, branches/levels, strong/weak, repeated weak GROUPS,
  // status, nextAction, and a monthly-readiness hint (text only — no
  // Monthly Exam is built by this phase).
  function buildTwoWeekLearningSummary(twoWeekRecords, range){
    twoWeekRecords = twoWeekRecords || _twoWeekStudyRecords();
    range = range || _twoWeekRange();
    var daysWithActivity = {};
    var topicTests = 0, dailyTests = 0;
    var branchTally = {}, levelSeen = {};
    var totalItems = 0, totalGood = 0;
    var weakCount = {}, weakTextByKey = {};
    twoWeekRecords.forEach(function(r){
      // I6H-D12: placement is diagnostic — it never inflates study days.
      if(r.source!=='academy-certificate'&&r.source!=='academy-report-card'&&r.source!=='academy-placement-test'&&r.source!=='personal-learning-plan') daysWithActivity[r.dateKey] = true;
      if (r.source === 'grammar-lab-topic-test' || r.source === 'grammar-world-topic-test') topicTests++;
      if (r.source === 'academy-daily-test') dailyTests++;
      totalItems += (r.total||0);
      totalGood  += (r.good||0);
      if (r.branch) {
        branchTally[r.branch] = branchTally[r.branch] || { correct:0, total:0 };
        branchTally[r.branch].total += (r.total||0);
        branchTally[r.branch].correct += (r.good||0);
      }
      if (r.level) levelSeen[r.level] = (levelSeen[r.level]||0)+1;
      (r.weakItems||[]).forEach(function(w){
        var t = (typeof w==='string') ? w : (w&&(w.q||w.target||w.en))||'';
        if (t) { var k=norm(t).slice(0,80); weakCount[k]=(weakCount[k]||0)+1; weakTextByKey[k]=t; }
      });
    });
    var studyDaysCompleted = Object.keys(daysWithActivity).length;
    var branches = Object.keys(branchTally);
    var weakBranches   = branches.filter(function(b){ return branchTally[b].total>0 && (branchTally[b].correct/branchTally[b].total) < 0.6; });
    var strongBranches = branches.filter(function(b){ return branchTally[b].total>0 && (branchTally[b].correct/branchTally[b].total) >= 0.8; });
    var avgPct = totalItems>0 ? Math.round((totalGood/totalItems)*100) : null;

    var weeklyTestsCompleted = 0;
    if (range && range.weekRanges) {
      range.weekRanges.forEach(function(wr){ if (findWeeklyTestRecord(wr)) weeklyTestsCompleted++; });
    }
    var repeatedWeakGroups = Object.keys(weakCount).filter(function(k){ return weakCount[k] > 1; })
      .map(function(k){ return weakTextByKey[k]; });

    var status;
    if (twoWeekRecords.length < 6) status = 'Not Enough Study Data';
    else if (weakBranches.length > 0 && avgPct !== null && avgPct < 50) status = 'Teacher Review Recommended';
    else if (repeatedWeakGroups.length > 0) status = 'Weak Areas Repeated';
    else if (avgPct !== null && avgPct >= 80) status = 'Excellent Two-Week Progress';
    else if (avgPct !== null && avgPct >= 60) status = 'Good Progress';
    else status = 'Needs Weak-Point Revision';

    var nextAction;
    if (status === 'Not Enough Study Data') nextAction = 'Complete more lessons, Daily Learning Reviews, or Weekly Progress Tests';
    else if (status === 'Teacher Review Recommended') nextAction = 'Teacher review recommended';
    else if (status === 'Weak Areas Repeated') nextAction = 'Retry repeated weak groups';
    else if (status === 'Excellent Two-Week Progress') nextAction = 'Ready for more learning';
    else if (weakBranches.length > 0) nextAction = 'Needs weak-point revision';
    else nextAction = 'Good progress';

    var monthlyReadinessHint = studyDaysCompleted >= 8 && weeklyTestsCompleted >= 2
      ? 'On track for a future Monthly Progress Exam once that phase is built.'
      : 'Not a monthly exam yet. This is a 10-study-day review.';

    return {
      twoWeekLabel: range ? range.twoWeekLabel : 'Two-Week Progress Review',
      studyDaysCompleted: studyDaysCompleted,
      studyDaysTotal: 10,
      weeklyTestsCompleted: weeklyTestsCompleted,
      weeklyTestsTotal: 2,
      topicTestsCompleted: topicTests,
      dailyTestsCompleted: dailyTests,
      branchesTouched: branches,
      levelsTouched: Object.keys(levelSeen),
      strongBranches: strongBranches,
      weakBranches: weakBranches,
      repeatedWeakGroups: repeatedWeakGroups,
      totalItems: totalItems,
      totalGood: totalGood,
      averagePct: avgPct,
      status: status,
      nextAction: nextAction,
      monthlyReadinessHint: monthlyReadinessHint
    };
  }

  /* ── Two-Week test flow: start / finish (reuses render/score/advance) ── */
  function startTwoWeekReview(){
    _activeEngine = 'daily'; // typed/MC UI only, same as daily/weekly
    var range = _twoWeekRange();
    var records = _twoWeekStudyRecords();
    if (!isTwoWeekReviewReady(records, range)){
      _showTwoWeekNotEnough();
      return;
    }
    AT.testType = 'twoWeek';
    AT.twoWeekRange = range;
    AT.dateKey = range ? range.rangeEndDateKey : _localDateKey();
    AT.calLabel = range ? range.twoWeekLabel : 'Two-Week Progress Review';
    AT.questions = buildTwoWeekQuestionPool(records);
    AT.idx = 0; AT.results = []; AT.scored = false;
    if (AT.questions.length < 3){ _showTwoWeekNotEnough(); return; }
    renderShell();
    renderQuestion();
  }
  function _showTwoWeekNotEnough(){
    var old=$id('at-overlay'); if(old) old.remove();
    var ov=document.createElement('div'); ov.id='at-overlay'; ov.className='at-overlay';
    ov.innerHTML=
      '<div class="at-panel"><div class="at-head">'+
        '<button type="button" class="at-close" onclick="ZirakAcademyTests.close()">\u2715 Exit</button>'+
        '<div class="at-head-center"><span>\uD83E\uDDED</span><span>Two-Week Progress Review</span></div>'+
        '<div style="width:64px;"></div></div>'+
      '<div class="at-body" style="padding:24px;text-align:center;">'+
        '<div style="font-size:44px;margin-bottom:12px;">\uD83D\uDCDA</div>'+
        '<div style="font-size:16px;font-weight:800;margin-bottom:8px;">Not enough two-week learning data yet.</div>'+
        '<div style="font-size:13.5px;color:var(--text-muted);">Complete more lessons, Daily Learning Reviews, or Weekly Progress Tests first.</div>'+
        '<button type="button" class="at-btn at-btn-ghost" style="margin-top:20px;" onclick="ZirakAcademyTests.close()">\u2190 Back</button>'+
      '</div></div>';
    (document.getElementById('app')||document.body).appendChild(ov);
  }
  function finishTwoWeekReview(){
    try{ window.speechSynthesis&&window.speechSynthesis.cancel(); }catch(e){}
    var total=AT.results.length||1;
    var good=AT.results.filter(function(r){return r.ok;}).length;
    var pct=Math.round((good/total)*100);
    var weak=AT.results.filter(function(r){return !r.ok;});
    var status=pct>=80?'Excellent \u2705':pct>=60?'Passed Strongly \u2705':pct>=40?'Needs Review \uD83D\uDD01':'Repeat Weak Parts \u274C';
    var heroBg=pct>=80?'linear-gradient(135deg,#059669,#10b981)':pct>=60?'linear-gradient(135deg,#d97706,#f59e0b)':pct>=40?'linear-gradient(135deg,#ea580c,#f97316)':'linear-gradient(135deg,#dc2626,#ef4444)';
    var encourage=pct>=80?'Outstanding two weeks! You are ready for more.':pct>=60?'Good progress! Review the repeated weak points.':pct>=40?'Fair progress. Revise the missed points.':'Keep going — repeat the weak points before moving on.';

    var sectionScores = summarizeSectionScores(AT.results);
    var branchScores   = groupResultsByLevelBranch(AT.results);
    var weakGroups      = buildWeakRecoveryGroups(AT.results);
    var twoWeekRecords = _twoWeekStudyRecords();
    var summary = buildTwoWeekLearningSummary(twoWeekRecords, AT.twoWeekRange);

    var stableId = 'academy-two-week-review-' + (AT.twoWeekRange?AT.twoWeekRange.rangeStartDateKey:_localDateKey()) + '-' + studentId();
    saveTwoWeekReviewToLedger(stableId, good, total, pct, weak, status, summary, sectionScores, branchScores, weakGroups);

    var reviewHtml=AT.results.map(function(r,i){
      return '<div class="at-rev-row '+(r.ok?'at-rev-ok':'at-rev-bad')+'">'+
        '<div class="at-rev-q">'+(r.ok?'\u2705':'\u274C')+' <b>'+(i+1)+'.</b> '+
          (r.sectionLabel?'<span class="at-src-badge">'+esc(r.sectionLabel)+'</span> ':'')+
          esc((r.q||'').slice(0,120))+'</div>'+
        (r.ok?'':('<div class="at-rev-ans">Correct: '+esc(r.correct)+'</div>'))+
        (r.answer&&r.answer!=='(skipped)'?('<div class="at-rev-said">You: '+esc(String(r.answer).slice(0,80))+'</div>'):'')
      +'</div>';
    }).join('');

    var sectionHtml = sectionScores.length>1
      ? '<div class="at-sec-lbl">\uD83D\uDCCA Section Scores</div>'+
        '<div class="at-rev-list">'+sectionScores.map(function(s){
          var sp = s.total>0 ? Math.round((s.correct/s.total)*100) : 0;
          return '<div class="at-rev-row '+(sp>=60?'at-rev-ok':'at-rev-bad')+'">'+
            '<div class="at-rev-q">'+esc(s.section)+': '+s.correct+'/'+s.total+' ('+sp+'%)</div></div>';
        }).join('')+'</div>'
      : '';
    var branchHtml = branchScores.length
      ? '<div class="at-sec-lbl">\uD83C\uDF9F Branch Scores</div>'+
        '<div class="at-rev-list">'+branchScores.map(function(b){
          var bp = b.total>0 ? Math.round((b.correct/b.total)*100) : 0;
          return '<div class="at-rev-row '+(bp>=60?'at-rev-ok':'at-rev-bad')+'">'+
            '<div class="at-rev-q">'+esc(b.branch)+': '+b.correct+'/'+b.total+' ('+bp+'%)</div></div>';
        }).join('')+'</div>'
      : '';
    var weakHtml;
    if (!weak.length) weakHtml = '<div class="at-noweak">\u2705 No weak items. Excellent two weeks!</div>';
    else weakHtml = weakGroups.map(function(g){
      return '<div class="at-weak-group-lbl">'+esc(g.group)+'</div>'+
        g.items.map(function(it){ return '<div class="at-weak-item">\u2022 '+esc(it)+'</div>'; }).join('');
    }).join('');
    var repeatedHtml = summary.repeatedWeakGroups.length
      ? '<div class="at-sec-lbl">\uD83D\uDD01 Repeated Weak Points</div>'+
        '<div class="at-weak-list">'+summary.repeatedWeakGroups.map(function(t){ return '<div class="at-weak-item">\u2022 '+esc(t)+'</div>'; }).join('')+'</div>'
      : '';

    var waHtml='';
    if(window.ZirakResultProof && window.ZirakResultProof.renderButtonHtml){
      var waLines=[
        '\uD83C\uDF93 *ZIRAK Two-Week Progress Review*',
        'Range: ' + (AT.twoWeekRange?AT.twoWeekRange.twoWeekLabel:'Two-Week Progress Review'),
        'Study Days: ' + summary.studyDaysCompleted + '/10',
        'Weekly Progress Tests: ' + summary.weeklyTestsCompleted + '/2',
        'Score: ' + good + '/' + total + ' (' + pct + '%)',
        summary.levelsTouched.length ? ('Level: ' + summary.levelsTouched.join(', ')) : '',
        summary.branchesTouched.length ? ('Branches: ' + summary.branchesTouched.join(', ')) : '',
        summary.strongBranches.length ? ('Strong: ' + summary.strongBranches.join(', ')) : '',
        summary.repeatedWeakGroups.length ? ('Repeated Weak: ' + summary.repeatedWeakGroups.slice(0,3).join(', ')) : '',
        'Status: ' + summary.status,
        '',
        'Sent via Zirak English App \uD83C\uDF1F'
      ].filter(Boolean).join('\n');
      waHtml=window.ZirakResultProof.renderButtonHtml('Two-Week Progress Review', good, total, {skipLedger:true, customText:waLines});
    }

    var body=$id('at-body'); if(!body) return;
    body.innerHTML=
      '<div class="at-result">'+
        '<div class="at-hero" style="background:'+heroBg+';">'+
          '<div class="at-hero-status">'+esc(status)+'</div>'+
          '<div class="at-hero-ring">'+pct+'<span class="at-hero-pct">%</span></div>'+
          '<div class="at-hero-score">'+good+' / '+total+' correct</div>'+
          '<div class="at-hero-label">'+esc(AT.twoWeekRange?AT.twoWeekRange.twoWeekLabel:'Two-Week Progress Review')+'</div>'+
        '</div>'+
        '<div class="at-encourage">'+esc(encourage)+'</div>'+
        waHtml+
        '<div class="at-card" style="border-left:4px solid #7c3aed;">'+
          '<div class="at-sec-lbl" style="padding-top:0;">\uD83E\uDDED Two-Week Progress Summary</div>'+
          '<div class="at-q-text" style="font-size:14px;">'+
            '<b>Study Days:</b> '+summary.studyDaysCompleted+' / 10<br>'+
            '<b>Weekly Progress Tests:</b> '+summary.weeklyTestsCompleted+' / 2<br>'+
            (summary.branchesTouched.length?('<b>Branches:</b> '+esc(summary.branchesTouched.join(', '))+'<br>'):'')+
            (summary.strongBranches.length?('<b>Strong:</b> '+esc(summary.strongBranches.join(', '))+'<br>'):'')+
            (summary.weakBranches.length?('<b>Needs Review:</b> '+esc(summary.weakBranches.join(', '))+'<br>'):'')+
            '<b>Status:</b> '+esc(summary.status)+'<br>'+
            '<b>Next:</b> '+esc(summary.nextAction)+'<br>'+
            '<b>Monthly Readiness:</b> '+esc(summary.monthlyReadinessHint)+
          '</div>'+
        '</div>'+
        sectionHtml+branchHtml+repeatedHtml+
        '<div class="at-sec-lbl">\uD83D\uDCDD Questions Review</div>'+
        '<div class="at-rev-list">'+reviewHtml+'</div>'+
        '<div class="at-sec-lbl">'+(weak.length?'\uD83D\uDD01 Weak Items ('+weak.length+')':'\uD83C\uDFAF Weak Items')+'</div>'+
        '<div class="at-weak-list">'+weakHtml+'</div>'+
        '<div class="at-result-btns">'+
          '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.retryTwoWeek()">Retry \uD83D\uDD01</button>'+
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.openLedger()">\uD83D\uDCD8 Today\'s Record</button>'+
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.close()">\u2190 Exit</button>'+
        '</div>'+
        '<div style="height:24px;"></div>'+
      '</div>';

    try{
      var spoken='Two-Week Progress Review complete. Your score is '+pct+' percent. '+good+' out of '+total+'. '+status+'. '+encourage;
      if(window.speechSynthesis){
        window.speechSynthesis.cancel();
        var u=new SpeechSynthesisUtterance(spoken); u.lang='en-US';
        window.speechSynthesis.speak(u);
      }
    }catch(e){}
  }
  function saveTwoWeekReviewToLedger(stableId, good, total, pct, weak, status, summary, sectionScores, branchScores, weakGroups){
    if(!ledger()) return;
    try{
      var model=_ledgerLoad();
      var dk = AT.twoWeekRange ? AT.twoWeekRange.rangeEndDateKey : AT.dateKey;
      if(model&&model.days&&model.days[dk]){
        model.days[dk]=model.days[dk].filter(function(r){return r.id!==stableId;});
        _ledgerSave(model);
      }
    }catch(e){}
    var repeatedWeakGroupsForLedger = weakGroups && weakGroups.length
      ? weakGroups.filter(function(g){ return summary.repeatedWeakGroups.some(function(t){ return g.items.indexOf(t) > -1; }); })
      : [];
    ledger().recordActivity({
      id: stableId,
      source: 'academy-two-week-review',
      sectionTitle: 'Two-Week Progress Review',
      topicTitle: AT.twoWeekRange ? AT.twoWeekRange.twoWeekLabel : 'Two-Week Progress Review',
      activityType: 'academy-two-week-review',
      good: good, total: total, pct: pct,
      weakItems: weak.slice(0,15).map(function(r){return r.correct;}),
      reviewItems: AT.results.slice(0,30).map(function(r){
        return {q:r.q,ok:r.ok,said:r.answer,model:r.correct};
      }),
      feedback: status + ' — ' + summary.status,
      calendarLabel: AT.twoWeekRange ? AT.twoWeekRange.twoWeekLabel : AT.calLabel,
      dateKey: AT.twoWeekRange ? AT.twoWeekRange.rangeEndDateKey : AT.dateKey,
      branch: summary.branchesTouched.join(', '),
      level: summary.levelsTouched.join(', '),
      // I6H-D8 rich two-week metadata:
      rangeStartDateKey: AT.twoWeekRange ? AT.twoWeekRange.rangeStartDateKey : '',
      rangeEndDateKey: AT.twoWeekRange ? AT.twoWeekRange.rangeEndDateKey : '',
      studyDateKeys: AT.twoWeekRange ? AT.twoWeekRange.studyDateKeys : [],
      weekRanges: AT.twoWeekRange ? AT.twoWeekRange.weekRanges : [],
      twoWeekLabel: AT.twoWeekRange ? AT.twoWeekRange.twoWeekLabel : '',
      academyMonth: AT.twoWeekRange ? AT.twoWeekRange.academyMonth : null,
      academyReviewNumber: AT.twoWeekRange ? AT.twoWeekRange.academyReviewNumber : null,
      studyDaysCompleted: summary.studyDaysCompleted,
      studyDaysTotal: summary.studyDaysTotal,
      weeklyTestsCompleted: summary.weeklyTestsCompleted,
      weeklyTestsTotal: summary.weeklyTestsTotal,
      sectionScores: sectionScores || [],
      branchScores: branchScores || [],
      levelScores: [],
      weakGroups: weakGroups || [],
      repeatedWeakGroups: repeatedWeakGroupsForLedger,
      readinessStatus: summary.status,
      nextAction: summary.nextAction,
      monthlyReadinessHint: summary.monthlyReadinessHint,
      branchesTouched: summary.branchesTouched,
      levelsTouched: summary.levelsTouched,
      strongTags: summary.strongBranches,
      weakTags: summary.weakBranches,
      questionCount: total
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D9 — MONTHLY ACADEMY EXAM: QUESTION POOL + READINESS + SUMMARY + FLOW
     Same architecture as Weekly/Two-Week above, scaled to 20 study days
     (four academy weeks / two two-week blocks). Reuses the SAME primitives
     and the SAME shared shell/render/score/advance via AT.testType — no
     second engine, no certificate/report building (foundation only).
     ═══════════════════════════════════════════════════════════════════════ */
  function _monthlyRange(){
    try { return cal() ? cal().getAcademyMonthlyRange() : null; } catch(e) { return null; }
  }
  function _monthlyStudyRecords(){
    try { return ledger() ? ledger().getAcademyMonthlyStudyRecords() : []; } catch(e) { return []; }
  }
  // I6H-D14C — pure record-matching helper (see findWeeklyTestRecordInRecords above).
  function findMonthlyExamRecordInRecords(records, range) {
    if (!range) return null;
    var candidates = (records || []).filter(function (r) { return r && r.source === 'academy-monthly-exam'; });
    var byStart = candidates.filter(function (r) { return r.monthStartDateKey === range.monthStartDateKey; });
    if (byStart.length) return byStart[0];
    var inRange = candidates.filter(function (r) { return range.studyDateKeys && range.studyDateKeys.indexOf(r.dateKey) > -1; });
    return inRange.length ? inRange[0] : null;
  }
  // I6H-D9: same shared-helper completion-detection pattern as D7A/D8.
  // I6H-D14C: thin ACTIVE-STUDENT wrapper over the pure helper above.
  function findMonthlyExamRecord(range){
    range = range || _monthlyRange();
    return findMonthlyExamRecordInRecords(_monthlyStudyRecords(), range);
  }
  // I6H-D9: readiness exactly as specified — ready if ANY of:
  // 14+ study days, OR (2+ weekly tests AND 10+ days), OR (1+ two-week
  // review AND 10+ days), OR 2 two-week reviews, OR 25+ total records.
  function isMonthlyExamReadyFromRecords(records, range){
    records = records || [];
    // I6H-D10: same achievement-record exclusion as isWeeklyTestReady.
    records = records.filter(function(r){ return r.source!=='academy-certificate' && r.source!=='academy-report-card' && r.source!=='personal-learning-plan'; });
    if (!records.length) return false;
    var daysWithActivity = {};
    records.forEach(function(r){ if(r.source!=='academy-certificate'&&r.source!=='academy-report-card'&&r.source!=='personal-learning-plan') daysWithActivity[r.dateKey] = true; });
    var studyDayCount = Object.keys(daysWithActivity).length;
    var weeklyTestsDone = 0, twoWeekReviewsDone = 0;
    if (range) {
      // I6H-D14C: pure lookups against THIS function's own records —
      // never the active student's Ledger. This is the fix for the
      // documented Monthly cross-student contamination (Finding H).
      (range.weekRanges||[]).forEach(function(wr){ if (findWeeklyTestRecordInRecords(records, wr)) weeklyTestsDone++; });
      (range.twoWeekRanges||[]).forEach(function(twr){ if (findTwoWeekReviewRecordInRecords(records, twr)) twoWeekReviewsDone++; });
    }
    return studyDayCount >= 14 || (weeklyTestsDone >= 2 && studyDayCount >= 10) ||
           (twoWeekReviewsDone >= 1 && studyDayCount >= 10) || twoWeekReviewsDone >= 2 ||
           records.length >= 25;
  }
  // I6H-D14C: thin ACTIVE-STUDENT wrapper — reads the active student's
  // monthly records, then calls the pure rule above.
  function isMonthlyExamReady(records, range){
    records = records || _monthlyStudyRecords();
    range = range || _monthlyRange();
    return isMonthlyExamReadyFromRecords(records, range);
  }
  // I6H-D9: the monthly pool. Excludes only its own prior
  // 'academy-monthly-exam' record; Daily/Weekly/Two-Week test records
  // remain valid source material.
  function buildMonthlyQuestionPool(monthlyRecords){
    monthlyRecords = monthlyRecords || _monthlyStudyRecords();
    monthlyRecords = monthlyRecords.filter(function(r){ return r.source !== 'academy-monthly-exam' && r.source !== 'academy-certificate' && r.source !== 'academy-report-card' && r.source !== 'personal-learning-plan'; }); // I6H-D10: achievement records never become question material; I6H-D13A: plan-administrative records excluded too
    if (!monthlyRecords.length) return [];

    var groups = groupRecordsBySection(monthlyRecords);
    var qs = [];
    // Monthly caps are the largest tier — reaches the 30-50 target.
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.grammar), SECTION_LABELS.grammar, 15));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.vocabulary), SECTION_LABELS.vocabulary, 10));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.sentence), SECTION_LABELS.sentence, 10));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.dialogueInterview), SECTION_LABELS.dialogueInterview, 10));
    qs = qs.concat(_poolToQuestions(_buildPoolFromRecords(groups.general), SECTION_LABELS.general, 10));

    // I6H-D9: three targeted weak sections per the phase spec —
    // "Weekly Weak Recovery" (from academy-weekly-test records' own
    // weakItems), "Two-Week Weak Recovery" (from academy-two-week-review
    // records' own weakItems), and "Repeated Monthly Weak Points" (any
    // weak text seen 2+ times across the whole month, regardless of
    // source — can overlap with the two source-based sections above,
    // which is expected: repetition is a separate, cross-cutting signal).
    var weeklyWeakPool = [], twoWeekWeakPool = [];
    monthlyRecords.forEach(function(r){
      if (r.source === 'academy-weekly-test') {
        (r.weakItems||[]).forEach(function(w){
          var t=(typeof w==='string')?w:(w&&(w.q||w.target||w.en))||'';
          if(t.length>3 && t.length<200) weeklyWeakPool.push({text:t, correct:t, source:r.source, rawType:'weak', branch:r.branch||'', level:r.level||''});
        });
      }
      if (r.source === 'academy-two-week-review') {
        (r.weakItems||[]).forEach(function(w){
          var t=(typeof w==='string')?w:(w&&(w.q||w.target||w.en))||'';
          if(t.length>3 && t.length<200) twoWeekWeakPool.push({text:t, correct:t, source:r.source, rawType:'weak', branch:r.branch||'', level:r.level||''});
        });
      }
    });
    if (weeklyWeakPool.length) qs = qs.concat(_poolToQuestions(weeklyWeakPool, 'Weekly Weak Recovery', 5));
    if (twoWeekWeakPool.length) qs = qs.concat(_poolToQuestions(twoWeekWeakPool, 'Two-Week Weak Recovery', 5));

    var weakCount = {}, allWeakPool = [];
    monthlyRecords.forEach(function(r){
      (r.weakItems||[]).forEach(function(w){
        var t = (typeof w==='string') ? w : (w&&(w.q||w.target||w.en))||'';
        if(t.length>3 && t.length<200){
          var k = norm(t).slice(0,80);
          weakCount[k] = (weakCount[k]||0)+1;
          allWeakPool.push({text:t, correct:t, source:r.source, rawType:'weak', branch:r.branch||'', level:r.level||''});
        }
      });
    });
    var repeated = allWeakPool.filter(function(p){ return weakCount[norm(p.text).slice(0,80)] > 1; });
    if (repeated.length) {
      var repeatedQs = _poolToQuestions(repeated, 'Repeated Monthly Weak Points', 8);
      repeatedQs.forEach(function(q){ q.isRepeated = true; });
      qs = qs.concat(repeatedQs);
    }

    if (!qs.length) return [];
    var seenGlobal={}, finalQs=[];
    qs.forEach(function(q){
      var k=norm(q.prompt||'').slice(0,80);
      if(!seenGlobal[k]){ seenGlobal[k]=1; finalQs.push(q); }
    });
    return selectBalancedMonthlyQuestions(finalQs);
  }
  // I6H-D9: monthly sizing — 30-50 (20-30 on a small-data month), same
  // trim-protection pattern as the other tiers.
  function selectBalancedMonthlyQuestions(qs){
    var cap = qs.length >= 40 ? 50 : 30;
    if (qs.length <= cap) return qs;
    var repeated = qs.filter(function(q){ return q.sectionLabel === 'Repeated Monthly Weak Points'; });
    var weeklyWeak = qs.filter(function(q){ return q.sectionLabel === 'Weekly Weak Recovery'; });
    var twoWeekWeak = qs.filter(function(q){ return q.sectionLabel === 'Two-Week Weak Recovery'; });
    var grammarOnes = qs.filter(function(q){ return q.sectionLabel === 'Grammar'; });
    var rest = qs.filter(function(q){
      return ['Repeated Monthly Weak Points','Weekly Weak Recovery','Two-Week Weak Recovery','Grammar'].indexOf(q.sectionLabel) === -1;
    });
    var kept = repeated.slice(0,10).concat(weeklyWeak.slice(0,5)).concat(twoWeekWeak.slice(0,5)).concat(grammarOnes.slice(0,12));
    var remaining = cap - kept.length;
    if (remaining > 0) kept = kept.concat(rest.slice(0, remaining));
    return kept.slice(0, cap);
  }
  // I6H-D9: Monthly Learning Summary — study days/20, weekly tests/4
  // (via findWeeklyTestRecord on each of range.weekRanges), two-week
  // reviews/2 (via findTwoWeekReviewRecord on range.twoWeekRanges),
  // branches/levels, strong/weak, repeated monthly weak points, status,
  // nextAction, and a certificate/report readiness hint (text only — no
  // certificate system is built by this phase).
  function buildMonthlyLearningSummary(monthlyRecords, range){
    monthlyRecords = monthlyRecords || _monthlyStudyRecords();
    range = range || _monthlyRange();
    var daysWithActivity = {};
    var topicTests = 0, dailyTests = 0;
    var branchTally = {}, levelSeen = {};
    var totalItems = 0, totalGood = 0;
    var weakCount = {}, weakTextByKey = {};
    monthlyRecords.forEach(function(r){
      // I6H-D12: placement is diagnostic — it never inflates study days.
      if(r.source!=='academy-certificate'&&r.source!=='academy-report-card'&&r.source!=='academy-placement-test'&&r.source!=='personal-learning-plan') daysWithActivity[r.dateKey] = true;
      if (r.source === 'grammar-lab-topic-test' || r.source === 'grammar-world-topic-test') topicTests++;
      if (r.source === 'academy-daily-test') dailyTests++;
      totalItems += (r.total||0);
      totalGood  += (r.good||0);
      if (r.branch) {
        branchTally[r.branch] = branchTally[r.branch] || { correct:0, total:0 };
        branchTally[r.branch].total += (r.total||0);
        branchTally[r.branch].correct += (r.good||0);
      }
      if (r.level) levelSeen[r.level] = (levelSeen[r.level]||0)+1;
      (r.weakItems||[]).forEach(function(w){
        var t = (typeof w==='string') ? w : (w&&(w.q||w.target||w.en))||'';
        if (t) { var k=norm(t).slice(0,80); weakCount[k]=(weakCount[k]||0)+1; weakTextByKey[k]=t; }
      });
    });
    var studyDaysCompleted = Object.keys(daysWithActivity).length;
    var branches = Object.keys(branchTally);
    var weakBranches   = branches.filter(function(b){ return branchTally[b].total>0 && (branchTally[b].correct/branchTally[b].total) < 0.6; });
    var strongBranches = branches.filter(function(b){ return branchTally[b].total>0 && (branchTally[b].correct/branchTally[b].total) >= 0.8; });
    var avgPct = totalItems>0 ? Math.round((totalGood/totalItems)*100) : null;

    var weeklyTestsCompleted = 0, twoWeekReviewsCompleted = 0;
    if (range) {
      (range.weekRanges||[]).forEach(function(wr){ if (findWeeklyTestRecord(wr)) weeklyTestsCompleted++; });
      (range.twoWeekRanges||[]).forEach(function(twr){ if (findTwoWeekReviewRecord(twr)) twoWeekReviewsCompleted++; });
    }
    var repeatedWeakGroups = Object.keys(weakCount).filter(function(k){ return weakCount[k] > 1; })
      .map(function(k){ return weakTextByKey[k]; });

    var status;
    if (monthlyRecords.length < 10) status = 'Not Enough Monthly Data';
    else if (weakBranches.length > 0 && avgPct !== null && avgPct < 45) status = 'Teacher Review Recommended';
    else if (repeatedWeakGroups.length > 2) status = 'Repeated Weak Areas';
    else if (avgPct !== null && avgPct >= 85) status = 'Excellent Monthly Progress';
    else if (avgPct !== null && avgPct >= 70) status = 'Strong Monthly Progress';
    else if (avgPct !== null && avgPct >= 55) status = 'Good Monthly Progress';
    else status = 'Needs Weak-Point Revision';

    var nextAction;
    if (status === 'Not Enough Monthly Data') nextAction = 'Complete more lessons, Daily Learning Reviews, Weekly Progress Tests, or Two-Week Progress Reviews';
    else if (status === 'Teacher Review Recommended') nextAction = 'Teacher review recommended';
    else if (status === 'Repeated Weak Areas') nextAction = 'Retry repeated weak groups before report/certificate phase';
    else if (status === 'Excellent Monthly Progress') nextAction = 'Ready for report/certificate phase once built';
    else if (weakBranches.length > 0) nextAction = 'Needs weak-point revision';
    else nextAction = 'Good progress — keep practising';

    // I6H-D9: text-only hint. No certificate/report is generated by this phase.
    var certificateHint = studyDaysCompleted >= 16 && weeklyTestsCompleted >= 3 && twoWeekReviewsCompleted >= 1
      ? 'Certificate/report system is not built yet, but this month looks report-ready once that phase exists.'
      : 'Certificate/report system is not built in this phase.';

    return {
      monthlyLabel: range ? range.monthlyLabel : 'Monthly Progress Exam',
      studyDaysCompleted: studyDaysCompleted,
      studyDaysTotal: 20,
      weeklyTestsCompleted: weeklyTestsCompleted,
      weeklyTestsTotal: 4,
      twoWeekReviewsCompleted: twoWeekReviewsCompleted,
      twoWeekReviewsTotal: 2,
      topicTestsCompleted: topicTests,
      dailyTestsCompleted: dailyTests,
      branchesTouched: branches,
      levelsTouched: Object.keys(levelSeen),
      strongBranches: strongBranches,
      weakBranches: weakBranches,
      repeatedWeakGroups: repeatedWeakGroups,
      totalItems: totalItems,
      totalGood: totalGood,
      averagePct: avgPct,
      status: status,
      nextAction: nextAction,
      certificateHint: certificateHint
    };
  }

  /* ── Monthly test flow: start / finish (reuses render/score/advance) ── */
  function startMonthlyExam(){
    _activeEngine = 'daily';
    var range = _monthlyRange();
    var records = _monthlyStudyRecords();
    if (!isMonthlyExamReady(records, range)){
      _showMonthlyNotEnough();
      return;
    }
    AT.testType = 'monthly';
    AT.monthlyRange = range;
    AT.dateKey = range ? range.monthEndDateKey : _localDateKey();
    AT.calLabel = range ? range.monthlyLabel : 'Monthly Progress Exam';
    AT.questions = buildMonthlyQuestionPool(records);
    AT.idx = 0; AT.results = []; AT.scored = false;
    if (AT.questions.length < 3){ _showMonthlyNotEnough(); return; }
    renderShell();
    renderQuestion();
  }
  function _showMonthlyNotEnough(){
    var old=$id('at-overlay'); if(old) old.remove();
    var ov=document.createElement('div'); ov.id='at-overlay'; ov.className='at-overlay';
    ov.innerHTML=
      '<div class="at-panel"><div class="at-head">'+
        '<button type="button" class="at-close" onclick="ZirakAcademyTests.close()">\u2715 Exit</button>'+
        '<div class="at-head-center"><span>\uD83C\uDFC6</span><span>Monthly Progress Exam</span></div>'+
        '<div style="width:64px;"></div></div>'+
      '<div class="at-body" style="padding:24px;text-align:center;">'+
        '<div style="font-size:44px;margin-bottom:12px;">\uD83D\uDCDA</div>'+
        '<div style="font-size:16px;font-weight:800;margin-bottom:8px;">Not enough monthly learning data yet.</div>'+
        '<div style="font-size:13.5px;color:var(--text-muted);">Complete more lessons, Daily Learning Reviews, Weekly Progress Tests, or Two-Week Progress Reviews first.</div>'+
        '<button type="button" class="at-btn at-btn-ghost" style="margin-top:20px;" onclick="ZirakAcademyTests.close()">\u2190 Back</button>'+
      '</div></div>';
    (document.getElementById('app')||document.body).appendChild(ov);
  }
  function finishMonthlyExam(){
    try{ window.speechSynthesis&&window.speechSynthesis.cancel(); }catch(e){}
    var total=AT.results.length||1;
    var good=AT.results.filter(function(r){return r.ok;}).length;
    var pct=Math.round((good/total)*100);
    var weak=AT.results.filter(function(r){return !r.ok;});
    var status=pct>=80?'Excellent \u2705':pct>=60?'Passed Strongly \u2705':pct>=40?'Needs Review \uD83D\uDD01':'Repeat Weak Parts \u274C';
    var heroBg=pct>=80?'linear-gradient(135deg,#059669,#10b981)':pct>=60?'linear-gradient(135deg,#d97706,#f59e0b)':pct>=40?'linear-gradient(135deg,#ea580c,#f97316)':'linear-gradient(135deg,#dc2626,#ef4444)';
    var encourage=pct>=80?'Outstanding month! You are ready for the next stage.':pct>=60?'Good month! Review the repeated weak points.':pct>=40?'Fair month. Revise the missed points.':'Keep going — repeat the weak points and build up gradually.';

    var sectionScores = summarizeSectionScores(AT.results);
    var branchScores   = groupResultsByLevelBranch(AT.results);
    var weakGroups      = buildWeakRecoveryGroups(AT.results);
    var monthlyRecords = _monthlyStudyRecords();
    var summary = buildMonthlyLearningSummary(monthlyRecords, AT.monthlyRange);

    var stableId = 'academy-monthly-exam-' + (AT.monthlyRange?AT.monthlyRange.monthStartDateKey:_localDateKey()) + '-' + studentId();
    saveMonthlyExamToLedger(stableId, good, total, pct, weak, status, summary, sectionScores, branchScores, weakGroups);

    var reviewHtml=AT.results.map(function(r,i){
      return '<div class="at-rev-row '+(r.ok?'at-rev-ok':'at-rev-bad')+'">'+
        '<div class="at-rev-q">'+(r.ok?'\u2705':'\u274C')+' <b>'+(i+1)+'.</b> '+
          (r.sectionLabel?'<span class="at-src-badge">'+esc(r.sectionLabel)+'</span> ':'')+
          esc((r.q||'').slice(0,120))+'</div>'+
        (r.ok?'':('<div class="at-rev-ans">Correct: '+esc(r.correct)+'</div>'))+
        (r.answer&&r.answer!=='(skipped)'?('<div class="at-rev-said">You: '+esc(String(r.answer).slice(0,80))+'</div>'):'')
      +'</div>';
    }).join('');

    var sectionHtml = sectionScores.length>1
      ? '<div class="at-sec-lbl">\uD83D\uDCCA Section Scores</div>'+
        '<div class="at-rev-list">'+sectionScores.map(function(s){
          var sp = s.total>0 ? Math.round((s.correct/s.total)*100) : 0;
          return '<div class="at-rev-row '+(sp>=60?'at-rev-ok':'at-rev-bad')+'">'+
            '<div class="at-rev-q">'+esc(s.section)+': '+s.correct+'/'+s.total+' ('+sp+'%)</div></div>';
        }).join('')+'</div>'
      : '';
    var branchHtml = branchScores.length
      ? '<div class="at-sec-lbl">\uD83C\uDF9F Branch Scores</div>'+
        '<div class="at-rev-list">'+branchScores.map(function(b){
          var bp = b.total>0 ? Math.round((b.correct/b.total)*100) : 0;
          return '<div class="at-rev-row '+(bp>=60?'at-rev-ok':'at-rev-bad')+'">'+
            '<div class="at-rev-q">'+esc(b.branch)+': '+b.correct+'/'+b.total+' ('+bp+'%)</div></div>';
        }).join('')+'</div>'
      : '';
    var weakHtml;
    if (!weak.length) weakHtml = '<div class="at-noweak">\u2705 No weak items. Excellent month!</div>';
    else weakHtml = weakGroups.map(function(g){
      return '<div class="at-weak-group-lbl">'+esc(g.group)+'</div>'+
        g.items.map(function(it){ return '<div class="at-weak-item">\u2022 '+esc(it)+'</div>'; }).join('');
    }).join('');
    var repeatedHtml = summary.repeatedWeakGroups.length
      ? '<div class="at-sec-lbl">\uD83D\uDD01 Repeated Weak Points</div>'+
        '<div class="at-weak-list">'+summary.repeatedWeakGroups.map(function(t){ return '<div class="at-weak-item">\u2022 '+esc(t)+'</div>'; }).join('')+'</div>'
      : '';

    var waHtml='';
    if(window.ZirakResultProof && window.ZirakResultProof.renderButtonHtml){
      var waLines=[
        '\uD83C\uDF93 *ZIRAK Monthly Progress Exam*',
        'Range: ' + (AT.monthlyRange?AT.monthlyRange.monthlyLabel:'Monthly Progress Exam'),
        'Study Days: ' + summary.studyDaysCompleted + '/20',
        'Weekly Progress Tests: ' + summary.weeklyTestsCompleted + '/4',
        'Two-Week Progress Reviews: ' + summary.twoWeekReviewsCompleted + '/2',
        'Score: ' + good + '/' + total + ' (' + pct + '%)',
        summary.levelsTouched.length ? ('Level: ' + summary.levelsTouched.join(', ')) : '',
        summary.branchesTouched.length ? ('Branches: ' + summary.branchesTouched.join(', ')) : '',
        summary.strongBranches.length ? ('Strong: ' + summary.strongBranches.join(', ')) : '',
        summary.repeatedWeakGroups.length ? ('Repeated Weak: ' + summary.repeatedWeakGroups.slice(0,3).join(', ')) : '',
        'Status: ' + summary.status,
        'Certificate Hint: ' + summary.certificateHint,
        '',
        'Sent via Zirak English App \uD83C\uDF1F'
      ].filter(Boolean).join('\n');
      waHtml=window.ZirakResultProof.renderButtonHtml('Monthly Progress Exam', good, total, {skipLedger:true, customText:waLines});
    }

    var body=$id('at-body'); if(!body) return;
    body.innerHTML=
      '<div class="at-result">'+
        '<div class="at-hero" style="background:'+heroBg+';">'+
          '<div class="at-hero-status">'+esc(status)+'</div>'+
          '<div class="at-hero-ring">'+pct+'<span class="at-hero-pct">%</span></div>'+
          '<div class="at-hero-score">'+good+' / '+total+' correct</div>'+
          '<div class="at-hero-label">'+esc(AT.monthlyRange?AT.monthlyRange.monthlyLabel:'Monthly Progress Exam')+'</div>'+
        '</div>'+
        '<div class="at-encourage">'+esc(encourage)+'</div>'+
        waHtml+
        '<div class="at-card" style="border-left:4px solid #d97706;">'+
          '<div class="at-sec-lbl" style="padding-top:0;">\uD83C\uDFC6 Monthly Learning Summary</div>'+
          '<div class="at-q-text" style="font-size:14px;">'+
            '<b>Study Days:</b> '+summary.studyDaysCompleted+' / 20<br>'+
            '<b>Weekly Progress Tests:</b> '+summary.weeklyTestsCompleted+' / 4<br>'+
            '<b>Two-Week Progress Reviews:</b> '+summary.twoWeekReviewsCompleted+' / 2<br>'+
            (summary.branchesTouched.length?('<b>Branches:</b> '+esc(summary.branchesTouched.join(', '))+'<br>'):'')+
            (summary.strongBranches.length?('<b>Strong:</b> '+esc(summary.strongBranches.join(', '))+'<br>'):'')+
            (summary.weakBranches.length?('<b>Needs Review:</b> '+esc(summary.weakBranches.join(', '))+'<br>'):'')+
            '<b>Status:</b> '+esc(summary.status)+'<br>'+
            '<b>Next:</b> '+esc(summary.nextAction)+'<br>'+
            '<b>Certificate Hint:</b> '+esc(summary.certificateHint)+
          '</div>'+
        '</div>'+
        sectionHtml+branchHtml+repeatedHtml+
        '<div class="at-sec-lbl">\uD83D\uDCDD Questions Review</div>'+
        '<div class="at-rev-list">'+reviewHtml+'</div>'+
        '<div class="at-sec-lbl">'+(weak.length?'\uD83D\uDD01 Weak Items ('+weak.length+')':'\uD83C\uDFAF Weak Items')+'</div>'+
        '<div class="at-weak-list">'+weakHtml+'</div>'+
        '<div class="at-result-btns">'+
          '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.retryMonthly()">Retry \uD83D\uDD01</button>'+
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.openLedger()">\uD83D\uDCD8 Today\'s Record</button>'+
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.close()">\u2190 Exit</button>'+
        '</div>'+
        '<div style="height:24px;"></div>'+
      '</div>';

    try{
      var spoken='Monthly Progress Exam complete. Your score is '+pct+' percent. '+good+' out of '+total+'. '+status+'. '+encourage;
      if(window.speechSynthesis){
        window.speechSynthesis.cancel();
        var u=new SpeechSynthesisUtterance(spoken); u.lang='en-US';
        window.speechSynthesis.speak(u);
      }
    }catch(e){}
  }
  function saveMonthlyExamToLedger(stableId, good, total, pct, weak, status, summary, sectionScores, branchScores, weakGroups){
    if(!ledger()) return;
    try{
      var model=_ledgerLoad();
      var dk = AT.monthlyRange ? AT.monthlyRange.monthEndDateKey : AT.dateKey;
      if(model&&model.days&&model.days[dk]){
        model.days[dk]=model.days[dk].filter(function(r){return r.id!==stableId;});
        _ledgerSave(model);
      }
    }catch(e){}
    var repeatedWeakGroupsForLedger = weakGroups && weakGroups.length
      ? weakGroups.filter(function(g){ return summary.repeatedWeakGroups.some(function(t){ return g.items.indexOf(t) > -1; }); })
      : [];
    ledger().recordActivity({
      id: stableId,
      source: 'academy-monthly-exam',
      sectionTitle: 'Monthly Progress Exam',
      topicTitle: AT.monthlyRange ? AT.monthlyRange.monthlyLabel : 'Monthly Progress Exam',
      activityType: 'academy-monthly-exam',
      good: good, total: total, pct: pct,
      weakItems: weak.slice(0,20).map(function(r){return r.correct;}),
      reviewItems: AT.results.slice(0,40).map(function(r){
        return {q:r.q,ok:r.ok,said:r.answer,model:r.correct};
      }),
      feedback: status + ' — ' + summary.status,
      calendarLabel: AT.monthlyRange ? AT.monthlyRange.monthlyLabel : AT.calLabel,
      dateKey: AT.monthlyRange ? AT.monthlyRange.monthEndDateKey : AT.dateKey,
      branch: summary.branchesTouched.join(', '),
      level: summary.levelsTouched.join(', '),
      // I6H-D9 rich monthly metadata:
      monthStartDateKey: AT.monthlyRange ? AT.monthlyRange.monthStartDateKey : '',
      monthEndDateKey: AT.monthlyRange ? AT.monthlyRange.monthEndDateKey : '',
      studyDateKeys: AT.monthlyRange ? AT.monthlyRange.studyDateKeys : [],
      weekRanges: AT.monthlyRange ? AT.monthlyRange.weekRanges : [],
      twoWeekRanges: AT.monthlyRange ? AT.monthlyRange.twoWeekRanges : [],
      monthlyLabel: AT.monthlyRange ? AT.monthlyRange.monthlyLabel : '',
      academyMonth: AT.monthlyRange ? AT.monthlyRange.academyMonth : null,
      academyMonthNumber: AT.monthlyRange ? AT.monthlyRange.academyMonthNumber : null,
      academyYear: AT.monthlyRange ? AT.monthlyRange.academyYear : null,
      studyDaysCompleted: summary.studyDaysCompleted,
      studyDaysTotal: summary.studyDaysTotal,
      weeklyTestsCompletedMonthly: summary.weeklyTestsCompleted,
      weeklyTestsTotalMonthly: summary.weeklyTestsTotal,
      twoWeekReviewsCompleted: summary.twoWeekReviewsCompleted,
      twoWeekReviewsTotal: summary.twoWeekReviewsTotal,
      sectionScores: sectionScores || [],
      branchScores: branchScores || [],
      levelScores: [],
      weakGroups: weakGroups || [],
      repeatedWeakGroups: repeatedWeakGroupsForLedger,
      readinessStatus: summary.status,
      nextAction: summary.nextAction,
      certificateHint: summary.certificateHint,
      branchesTouched: summary.branchesTouched,
      levelsTouched: summary.levelsTouched,
      strongTags: summary.strongBranches,
      weakTags: summary.weakBranches,
      questionCount: total
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D6 — SCORE / GROUPING / READINESS HELPERS
     Local, deterministic, offline. Reused by the Daily Test result screen
     and (lightly) by Today's Learning Record. No AI, no network.
     ══════════════════════════════════════════════════════════════════════ */
  function summarizeSectionScores(results){
    var bySection = {};
    (results||[]).forEach(function(r){
      var label = r.sectionLabel || 'General Practice';
      bySection[label] = bySection[label] || { section: label, correct: 0, total: 0 };
      bySection[label].total++;
      if (r.ok) bySection[label].correct++;
    });
    return Object.keys(bySection).map(function(k){ return bySection[k]; });
  }
  function groupResultsByLevelBranch(results){
    var byBranch = {};
    (results||[]).forEach(function(r){
      if (!r.branch) return; // only counted where real blueprint data exists
      byBranch[r.branch] = byBranch[r.branch] || { branch: r.branch, correct: 0, total: 0 };
      byBranch[r.branch].total++;
      if (r.ok) byBranch[r.branch].correct++;
    });
    return Object.keys(byBranch).map(function(k){ return byBranch[k]; });
  }
  // Weak items grouped for clarity: prefer branch, else sectionLabel, else
  // "General" — deterministic, no complicated analysis.
  function buildWeakRecoveryGroups(results){
    var groups = {};
    (results||[]).filter(function(r){ return !r.ok; }).forEach(function(r){
      var key = r.branch ? (SECTION_LABELS.grammar + ' — ' + r.branch)
              : (r.sectionLabel || 'General');
      groups[key] = groups[key] || { group: key, items: [] };
      groups[key].items.push(r.correct || r.q || '');
    });
    return Object.keys(groups).map(function(k){ return groups[k]; });
  }
  // Local, deterministic readiness read — NOT a certificate, NOT a
  // promotion decision. Reads today's ledger + the just-finished AT.results
  // when available. Always returns something safe, even with zero data.
  function buildReadinessSnapshot(){
    var records = getTodayRecords();
    var branchTally = {}; // branch -> {correct,total}
    var levelSeen = {};
    var topicTestCount = 0;
    var dailyRec = null;

    records.forEach(function(r){
      if (r.source === 'grammar-lab-topic-test' || r.source === 'grammar-world-topic-test') topicTestCount++;
      if (r.source === 'academy-daily-test') dailyRec = r;
      if (r.branch) {
        branchTally[r.branch] = branchTally[r.branch] || { correct:0, total:0 };
        branchTally[r.branch].total += (r.total||0);
        branchTally[r.branch].correct += (r.good||0);
      }
      if (r.level) levelSeen[r.level] = (levelSeen[r.level]||0) + 1;
    });
    // Fold in the just-taken Daily Test's own branch scores, if any (richer
    // than ledger-level data since it has per-question branch tags).
    if (AT.results && AT.results.length) {
      groupResultsByLevelBranch(AT.results).forEach(function(b){
        branchTally[b.branch] = branchTally[b.branch] || { correct:0, total:0 };
        branchTally[b.branch].correct += b.correct;
        branchTally[b.branch].total += b.total;
      });
    }

    var branches = Object.keys(branchTally);
    var weakBranches = branches.filter(function(b){ return branchTally[b].total>0 && (branchTally[b].correct/branchTally[b].total) < 0.6; });
    var strongBranches = branches.filter(function(b){ return branchTally[b].total>0 && (branchTally[b].correct/branchTally[b].total) >= 0.8; });

    var level = 'Not yet determined';
    var bestLevelCount = 0;
    Object.keys(levelSeen).forEach(function(l){ if (levelSeen[l] > bestLevelCount) { bestLevelCount = levelSeen[l]; level = l; } });

    var dailyPct = dailyRec ? dailyRec.pct : null;
    var totalWeakToday = records.reduce(function(s,r){ return s + (r.weakItems||[]).length; }, 0);

    var nextAction;
    if (!records.length) nextAction = 'Practice more';
    else if (dailyPct !== null && dailyPct < 40) nextAction = 'Needs teacher review';
    else if (totalWeakToday > 0) nextAction = 'Retry weak points';
    else if (dailyPct !== null && dailyPct >= 80) nextAction = 'Ready for more topics';
    else nextAction = 'Practice more';

    return {
      level: level,
      branchesToday: branches,
      topicTestsToday: topicTestCount,
      dailyTestScore: dailyPct,
      weakBranches: weakBranches,
      strongBranches: strongBranches,
      nextAction: nextAction
    };
  }
  function _readinessSnapshotHtml(snap){
    return '<div class="at-card" style="border-left:4px solid #7c3aed;">' +
      '<div class="at-sec-lbl" style="padding-top:0;">\uD83C\uDFAF Level Readiness Snapshot</div>' +
      '<div class="at-q-text" style="font-size:14px;">' +
        '<b>Level:</b> ' + esc(snap.level) + '<br>' +
        (snap.branchesToday.length ? '<b>Today\u2019s branches:</b> ' + esc(snap.branchesToday.join(', ')) + '<br>' : '') +
        (snap.strongBranches.length ? '<b>Strong:</b> ' + esc(snap.strongBranches.join(', ')) + '<br>' : '') +
        (snap.weakBranches.length ? '<b>Needs review:</b> ' + esc(snap.weakBranches.join(', ')) + '<br>' : '') +
        '<b>Next:</b> ' + esc(snap.nextAction) +
      '</div>' +
    '</div>';
  }

  function makeChoose(item, allItems){
    /* Generate 3 distractors from other items' correct values */
    var distractors=[];
    allItems.forEach(function(a){
      if(norm(a.correct)!==norm(item.correct) && distractors.length<3)
        distractors.push(a.correct.slice(0,60));
    });
    while(distractors.length<3) distractors.push(['—','(none)','not applicable'][distractors.length]);
    var options=shuffle([item.correct.slice(0,60)].concat(distractors.slice(0,3)));
    return {type:'choose', prompt:item.text, correct:item.correct, options:options, source:item.source};
  }
  function makeFillBlank(item){
    /* Hide last word as blank */
    var words=item.correct.trim().split(/\s+/);
    var blank = words.length>1 ? words[words.length-1] : item.correct;
    var stem  = words.length>1 ? words.slice(0,-1).join(' ')+' ___' : '___';
    // I6H-D2B: grade against the blanked WORD (near-exact), not the full
    // sentence — the student is only asked to supply the missing word.
    return {type:'fillBlank', prompt:'Complete: '+stem+'\n(Context: '+item.text+')',
            correct:blank, fullSentence:item.correct, source:item.source};
  }
  function makeCorrection(item){
    return {type:'correction', prompt:'Is this correct? Say or type what is right:\n"'+item.text+'"',
            correct:item.correct, source:item.source, isCorrect:true};
  }
  function makeYesNo(item){
    return {type:'yesNo', prompt:item.text, correct:'Yes',
            options:['Yes','No'], source:item.source};
  }

  /* ═══════════════════════════════════════════════════════════════════════
     PART B — TEST FLOW
     ═══════════════════════════════════════════════════════════════════════ */
  // I6H-D3: responsive side rail — visible tablet+ (CSS-hidden on phone).
  // Same info restated compactly: calendar context + a rotating short tip.
  // Pure presentation, reads from state that already exists; no new logic.
  var _tips = [
    'Read the question twice before answering.',
    'For fill-in-the-blank, one word is usually enough.',
    'Contractions like "they\u2019re" are accepted the same as "they are".',
    'Skip a question if unsure — it will count as a weak item to review later.',
    'Use the Hear button to listen again at any time.'
  ];
  function _sideRailHtml(q, idx, total){
    var info=null; try{ info = cal() ? cal().todayInfo() : null; }catch(e){}
    var label = info ? info.label : '';
    var tip = _tips[idx % _tips.length];
    return '<div class="at-q-side">'+
      (label ? '<div class="at-side-block"><div class="at-side-lbl">\uD83D\uDCC5 Today</div><div class="at-side-val">'+esc(label)+'</div></div>' : '')+
      '<div class="at-side-block"><div class="at-side-lbl">\uD83D\uDCCA Progress</div><div class="at-side-val">'+(idx+1)+' of '+total+'</div></div>'+
      (q.source ? '<div class="at-side-block"><div class="at-side-lbl">\uD83D\uDCDA Source</div><div class="at-side-val">'+esc(q.source)+'</div></div>' : '')+
      '<div class="at-side-block at-side-tip"><div class="at-side-lbl">\uD83D\uDCA1 Tip</div><div class="at-side-val">'+esc(tip)+'</div></div>'+
    '</div>';
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D3A — HEAR QUESTION PASHTO TTS GUARD
     ------------------------------------------------------------------------
     Locked rule: English TTS only. Pashto is display-only, never spoken.
     Two 'translation' question builders embed the source Pashto directly in
     q.prompt (e.g. "Translate / complete: (زه ...)" or bare Pashto text) —
     hearQuestion() must never pass that straight to SpeechSynthesisUtterance.
     This is the ONE place every Hear Question tap routes through.
     ═══════════════════════════════════════════════════════════════════════ */
  // Arabic-script Unicode block — covers Pashto (and Dari/Urdu/Arabic, all of
  // which must equally never be spoken per the locked language rule).
  var ARABIC_SCRIPT_RE = /[\u0600-\u06FF]/;

  function getQuestionSpeechText(q) {
    if (!q) return '';

    // Rule: translation questions never speak the Pashto source line —
    // a fixed English instruction instead. (q.options never exist on
    // 'translation' type in this codebase — it's always typed input —
    // but the options branch below still covers it defensively.)
    if (q.type === 'translation') {
      if (q.options && q.options.length) return 'Choose the best English sentence.';
      return 'Translate this into English.';
    }

    // Rule: choose-type questions with options — speak the prompt plus only
    // the English options (all options in this codebase are already English,
    // but strip defensively in case content ever changes).
    var text = String(q.prompt || '');
    if (q.options && q.options.length) {
      var englishOptions = q.options.filter(function (o) { return !ARABIC_SCRIPT_RE.test(o); });
      if (englishOptions.length) text += '. Options: ' + englishOptions.join(', ');
    }

    // Rule: for every question type — strip any parenthetical segment that
    // contains Pashto/Arabic-script text (e.g. "(زه ...)" context notes).
    text = text.replace(/\([^)]*[\u0600-\u06FF][^)]*\)/g, ' ');
    // Also strip the old "(Context: ...)" pattern even when it's plain English.
    text = text.replace(/\(Context:[^)]*\)/i, ' ');
    // Defensive net: remove any remaining Arabic-script characters outright —
    // Pashto must never reach SpeechSynthesisUtterance under any code path.
    text = text.replace(/[\u0600-\u06FF]+/g, ' ');
    // Clean up artifacts left by stripping (empty parens, doubled spaces/punct).
    text = text.replace(/\(\s*\)/g, ' ')
                .replace(/\s{2,}/g, ' ')
                .replace(/^[\s:\-–,]+|[\s:\-–,]+$/g, '')
                .trim();

    if (!text) text = 'Listen and type your answer.';
    return text;
  }

  function startDailyTest(){
    _activeEngine = 'daily';  // I6H-D3: disambiguate hearQuestion() source
    AT.testType = 'daily';    // I6H-D7: explicit reset — prevents a stale
                               // 'weekly' flag from a prior session leaking in.
    var info=null; try{ info=cal()?cal().todayInfo():null; }catch(e){}
    AT.dateKey = info?info.dateKey:_localDateKey();
    AT.calLabel = info?info.label:'Today';
    AT.questions = buildDailyTest();
    AT.idx=0; AT.results=[]; AT.scored=false;
    if(AT.questions.length<3){
      showNotEnough(); return;
    }
    renderShell();
    renderQuestion();
  }

  function renderShell(){
    var old=$id('at-overlay'); if(old) old.remove();
    var ov=document.createElement('div');
    ov.id='at-overlay'; ov.className='at-overlay';
    // I6H-D7: same shell reused for Daily and Weekly — only the title and
    // calendar bar text change based on AT.testType. No second engine.
    var title = AT.testType === 'weekly' ? 'Weekly Progress Test'
              : AT.testType === 'twoWeek' ? 'Two-Week Progress Review'
              : AT.testType === 'monthly' ? 'Monthly Progress Exam'
              : 'Daily Learning Review';
    var calBarText = AT.testType === 'weekly' && AT.weekRange ? AT.weekRange.weekLabel
                    : AT.testType === 'twoWeek' && AT.twoWeekRange ? AT.twoWeekRange.twoWeekLabel
                    : AT.testType === 'monthly' && AT.monthlyRange ? AT.monthlyRange.monthlyLabel
                    : AT.calLabel;
    ov.innerHTML=
      '<div class="at-panel">'+
        '<div class="at-head">'+
          '<button type="button" class="at-close" onclick="ZirakAcademyTests.close()" aria-label="Close">\u2715 Exit</button>'+
          '<div class="at-head-center"><span class="at-head-icon">\uD83C\uDF93</span><span class="at-head-title">'+esc(title)+'</span></div>'+
          '<div style="width:64px;"></div>'+
        '</div>'+
        '<div class="at-calbar">'+esc(calBarText)+'</div>'+
        '<div id="at-body" class="at-body"></div>'+
      '</div>';
    (document.getElementById('app')||document.body).appendChild(ov);
  }

  function renderQuestion(){
    var body=$id('at-body'); if(!body) return;
    var q=AT.questions[AT.idx];
    if(!q){ _finishFnForTestType()(); return; }
    AT.scored=false;
    var idx=AT.idx, total=AT.questions.length;
    var pct=Math.round(((idx+1)/total)*100);
    var srcBadge='<span class="at-src-badge">'+esc(q.source||'practice')+'</span>';

    var inputHtml='';
    if(q.type==='choose'||q.type==='yesNo'){
      inputHtml='<div class="at-options">'+
        (q.options||[]).map(function(o,i){
          return '<button type="button" class="at-opt" data-at-opt="'+i+'" onclick="ZirakAcademyTests.pick('+i+')">'+esc(o)+'</button>';
        }).join('')+
      '</div>';
    } else {
      inputHtml=
        '<input type="text" id="at-input" class="at-input" autocomplete="off" autocapitalize="off" '+
          'placeholder="Type your answer…" onkeydown="if(event.key===\'Enter\'){ZirakAcademyTests.submit();}">'+
        '<div class="at-action-row">'+
          '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.submit()">Check \u2713</button>'+
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.skipQ()">\u23ED Skip</button>'+
        '</div>';
    }

    // I6H-D3: .at-q-layout wraps main content + a side rail (visible tablet+,
    // hidden on phone via CSS) — one responsive shell, no separate mobile/desktop code.
    body.innerHTML=
      '<div class="at-q-layout">'+
        '<div class="at-q-main">'+
          '<div class="at-progress">'+
            '<div class="at-prog-lbl">Question '+(idx+1)+' of '+total+' '+srcBadge+'</div>'+
            '<div class="at-prog-bar"><div class="at-prog-fill" style="width:'+pct+'%"></div></div>'+
          '</div>'+
          '<div class="at-card">'+
            '<div class="at-q-text">'+esc((q.prompt||'').replace(/\n/g,'\n'))+'</div>'+
            '<button type="button" class="at-hear-btn" onclick="ZirakAcademyTests.hearQuestion()">\uD83D\uDD0A Hear Question</button>'+
          '</div>'+
          inputHtml+
          '<div id="at-feedback" class="at-feedback" style="display:none;"></div>'+
          '<div class="at-nav">'+
            (idx>0?'<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.prev()">\u2190 Prev</button>':'<span></span>')+
            '<button type="button" id="at-skip-btn" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.skipQ()">\u23ED Skip</button>'+
          '</div>'+
        '</div>'+
        _sideRailHtml(q, idx, total)+
      '</div>';
  }

  function pick(optIdx){
    if(AT.scored) return;
    var q=AT.questions[AT.idx]; if(!q) return;
    var chosen=(q.options||[])[optIdx]||'';
    var ok = norm(chosen)===norm(q.correct);
    score(chosen, ok, q);
    // Mark buttons
    document.querySelectorAll('.at-opt').forEach(function(b,i){
      b.onclick=null; b.style.pointerEvents='none';
      if(norm((q.options||[])[i])===norm(q.correct)) b.classList.add('at-opt-ok');
      else if(i===optIdx && !ok) b.classList.add('at-opt-bad');
    });
  }
  function submit(){
    if(AT.scored) return;
    var q=AT.questions[AT.idx]; if(!q) return;
    var inp=$id('at-input'), val=inp?inp.value.trim():'';
    // I6H-D2B: route through the type-specific grader (fillBlank gets
    // near-exact matching instead of word-overlap, which was too loose for
    // single-word answers). q.correct/q.acceptable are used inside the grader.
    var graded = gradeAnswer(val, q);
    var ok = graded.ok;
    score(val, ok, q);
  }
  function skipQ(){
    if(AT.scored){ advance(); return; }
    var q=AT.questions[AT.idx]; if(!q) return;
    score('(skipped)', false, q);
  }
  function score(given, ok, q){
    AT.scored=true;
    // I6H-D6 FIX: sectionLabel/branch/level live on the generated question
    // (q) but were never copied onto the scored result — summarizeSectionScores()
    // and groupResultsByLevelBranch() need them here, on AT.results, not on q.
    AT.results.push({q:q.prompt||'', answer:given, correct:q.correct, ok:ok, source:q.source,
                      sectionLabel:q.sectionLabel||'', branch:q.branch||'', level:q.level||'',
                      isRepeated:q.isRepeated||false}); // I6H-D7A: needed for weekly repeatedWeakGroups
    var fb=$id('at-feedback'); if(!fb) return;
    fb.className='at-feedback '+(ok?'at-fb-ok':'at-fb-bad');
    fb.innerHTML=
      '<div class="at-fb-line">'+(ok?'\u2705 Correct!':'\u274C Correct: <b>'+esc(q.correct)+'</b>')+'</div>'+
      '<div class="at-action-row" style="margin-top:8px;">'+
        (AT.idx<AT.questions.length-1
          ? '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.advance()">Next \u2192</button>'
          : '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.advance()">Finish \u2713</button>')+
      '</div>';
    fb.style.display='block';
    try{ fb.scrollIntoView({behavior:'smooth',block:'nearest'}); }catch(e){}
    // Patient TTS feedback
    var spoken=(ok?'Correct! ':('Not quite. The correct answer is: '+q.correct+'. '));
    try{
      if(window.speechSynthesis){
        window.speechSynthesis.cancel();
        var u=new SpeechSynthesisUtterance(spoken);
        u.lang='en-US'; u.rate=(window.state&&state.speechRate)?state.speechRate:0.9;
        window.speechSynthesis.speak(u);
      }
    }catch(e){}
  }
  function advance(){
    try{ window.speechSynthesis&&window.speechSynthesis.cancel(); }catch(e){}
    if(AT.idx<AT.questions.length-1){ AT.idx++; renderQuestion(); }
    else _finishFnForTestType()();
  }
  function prev(){
    if(AT.idx>0){ AT.idx--; AT.results.pop(); renderQuestion(); }
  }

  /* ═══════════════════════════════════════════════════════════════════════
     PART C — RESULT + LEDGER
     ═══════════════════════════════════════════════════════════════════════ */
  function finishDailyTest(){
    try{ window.speechSynthesis&&window.speechSynthesis.cancel(); }catch(e){}
    var total=AT.results.length||1;
    var good=AT.results.filter(function(r){return r.ok;}).length;
    var pct=Math.round((good/total)*100);
    var weak=AT.results.filter(function(r){return !r.ok;});
    var status=pct>=80?'Excellent \u2705':pct>=60?'Passed Strongly \u2705':pct>=40?'Needs Review \uD83D\uDD01':'Repeat Weak Parts \u274C';
    var heroBg=pct>=80?'linear-gradient(135deg,#059669,#10b981)':pct>=60?'linear-gradient(135deg,#d97706,#f59e0b)':pct>=40?'linear-gradient(135deg,#ea580c,#f97316)':'linear-gradient(135deg,#dc2626,#ef4444)';
    var encourage=pct>=80?'Outstanding! You are ready for the next level.':pct>=60?'Good performance! Review the weak items.':pct>=40?'Fair effort. Practise the missed items.':'Keep going — every test makes you stronger.';

    // I6H-D6: section/branch intelligence + readiness snapshot — computed
    // from AT.results, which already carry sectionLabel/branch/level from
    // the section-aware generator above. Defensive: works fine at zero
    // sections/branches (falls back to plain totals, same as before D6).
    var sectionScores = summarizeSectionScores(AT.results);
    var branchScores   = groupResultsByLevelBranch(AT.results);
    var weakGroups      = buildWeakRecoveryGroups(AT.results);

    // Save to ledger (upsert by stable id: replace today's daily-test record)
    var stableId='academy-daily-test-'+AT.dateKey+'-'+studentId();
    saveDailyTestToLedger(stableId, good, total, pct, weak, status, encourage, sectionScores, branchScores);

    // Readiness snapshot reads the ledger record we just saved, so compute
    // it AFTER saving.
    var snap = buildReadinessSnapshot();

    var reviewHtml=AT.results.map(function(r,i){
      return '<div class="at-rev-row '+(r.ok?'at-rev-ok':'at-rev-bad')+'">'+
        '<div class="at-rev-q">'+(r.ok?'\u2705':'\u274C')+' <b>'+(i+1)+'.</b> '+
          (r.sectionLabel?'<span class="at-src-badge">'+esc(r.sectionLabel)+'</span> ':'')+
          esc((r.q||'').slice(0,120))+'</div>'+
        (r.ok?'':('<div class="at-rev-ans">Correct: '+esc(r.correct)+'</div>'))+
        (r.answer&&r.answer!=='(skipped)'?('<div class="at-rev-said">You: '+esc(String(r.answer).slice(0,80))+'</div>'):'')
      +'</div>';
    }).join('');

    // I6H-D6: section scores strip — only shown when more than one section
    // actually exists (a single-section day is just "the test", no need to
    // repeat the same total twice).
    var sectionHtml = sectionScores.length>1
      ? '<div class="at-sec-lbl">\uD83D\uDCCA Section Scores</div>' +
        '<div class="at-rev-list">' + sectionScores.map(function(s){
          var sp = s.total>0 ? Math.round((s.correct/s.total)*100) : 0;
          return '<div class="at-rev-row '+(sp>=60?'at-rev-ok':'at-rev-bad')+'">'+
            '<div class="at-rev-q">'+esc(s.section)+': '+s.correct+'/'+s.total+' ('+sp+'%)</div></div>';
        }).join('') + '</div>'
      : '';

    // I6H-D6: weak items grouped clearly (branch/section) instead of one
    // flat list, only when there is more than one group to distinguish.
    var weakHtml;
    if (!weak.length) {
      weakHtml = '<div class="at-noweak">\u2705 No weak items. Excellent!</div>';
    } else if (weakGroups.length > 1) {
      weakHtml = weakGroups.map(function(g){
        return '<div class="at-weak-group-lbl">'+esc(g.group)+'</div>' +
          g.items.map(function(it){ return '<div class="at-weak-item">\u2022 '+esc(it)+'</div>'; }).join('');
      }).join('');
    } else {
      weakHtml = weak.map(function(r){return '<div class="at-weak-item">\u2022 '+esc(r.correct)+'</div>';}).join('');
    }

    // I6H-D6: richer WhatsApp text for Daily Learning Review specifically —
    // uses the shared ZirakResultProof helper's optional customText, so
    // there is still only ONE WhatsApp system, just better wording for
    // this one caller.
    var waHtml='';
    if(window.ZirakResultProof && window.ZirakResultProof.renderButtonHtml){
      var waLines = [
        '\uD83C\uDF93 *ZIRAK Daily Learning Review*',
        'Score: ' + good + '/' + total + ' (' + pct + '%)',
        snap.level !== 'Not yet determined' ? ('Level: ' + snap.level) : '',
        snap.branchesToday.length ? ('Branches: ' + snap.branchesToday.join(', ')) : '',
        snap.weakBranches.length ? ('Weak: ' + snap.weakBranches.join(', ')) : '',
        'Status: ' + status.replace(/[\u2705\u274C\uD83D\uDD01]/g,'').trim(),
        'Date: ' + esc(AT.calLabel),
        '',
        'Sent via Zirak English App \uD83C\uDF1F'
      ].filter(Boolean).join('\n');
      // I6H-D1 FIX preserved: {skipLedger:true} — Daily Learning Review already
      // saved a richer stable record via saveDailyTestToLedger() above.
      waHtml=window.ZirakResultProof.renderButtonHtml('Daily Learning Review', good, total, {skipLedger:true, customText:waLines});
    }

    var body=$id('at-body'); if(!body) return;
    body.innerHTML=
      '<div class="at-result">'+
        '<div class="at-hero" style="background:'+heroBg+';">'+
          '<div class="at-hero-status">'+esc(status)+'</div>'+
          '<div class="at-hero-ring">'+pct+'<span class="at-hero-pct">%</span></div>'+
          '<div class="at-hero-score">'+good+' / '+total+' correct</div>'+
          '<div class="at-hero-label">'+esc(AT.calLabel)+'</div>'+
        '</div>'+
        '<div class="at-encourage">'+esc(encourage)+'</div>'+
        waHtml+
        _readinessSnapshotHtml(snap)+
        sectionHtml+
        '<div class="at-sec-lbl">\uD83D\uDCDD Questions Review</div>'+
        '<div class="at-rev-list">'+reviewHtml+'</div>'+
        '<div class="at-sec-lbl">'+(weak.length?'\uD83D\uDD01 Weak Items ('+weak.length+')':'\uD83C\uDFAF Weak Items')+'</div>'+
        '<div class="at-weak-list">'+weakHtml+'</div>'+
        '<div class="at-result-btns">'+
          '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.retry()">Retry \uD83D\uDD01</button>'+
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.openLedger()">\uD83D\uDCD8 Today\'s Record</button>'+
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.close()">\u2190 Exit</button>'+
        '</div>'+
        '<div style="height:24px;"></div>'+
      '</div>';

    // Loud spoken summary
    try{
      var spoken='Daily Learning Review complete. Your score is '+pct+' percent. '+good+' out of '+total+'. '+status+'. '+encourage;
      if(window.speechSynthesis){
        window.speechSynthesis.cancel();
        var u=new SpeechSynthesisUtterance(spoken); u.lang='en-US';
        window.speechSynthesis.speak(u);
      }
    }catch(e){}
  }

  function saveDailyTestToLedger(stableId, good, total, pct, weak, status, encourage, sectionScores, branchScores){
    if(!ledger()) return;
    // Upsert: remove old record with same stable id, then re-record.
    try{
      var model=_ledgerLoad();
      if(model&&model.days&&model.days[AT.dateKey]){
        model.days[AT.dateKey]=model.days[AT.dateKey].filter(function(r){return r.id!==stableId;});
        _ledgerSave(model);
      }
    }catch(e){}
    ledger().recordActivity({
      id: stableId,
      source: 'academy-daily-test',
      sectionTitle: 'Daily Learning Review',
      topicTitle: AT.calLabel,
      activityType: 'test',
      good: good, total: total, pct: pct,
      weakItems: weak.slice(0,10).map(function(r){return r.correct;}),
      reviewItems: AT.results.slice(0,20).map(function(r){
        return {q:r.q,ok:r.ok,said:r.answer,model:r.correct};
      }),
      feedback: status+' — '+encourage,
      calendarLabel: AT.calLabel,
      dateKey: AT.dateKey
      // NOTE: sectionScores/branchScores are intentionally NOT persisted to
      // the ledger record itself in this phase — they are per-question
      // aggregates recomputed on demand from AT.results/reviewItems, which
      // avoids growing the ledger schema further than the D6 requirements
      // (branch/subbranch/level/testBlueprintKey/topicId, added above) need.
    });
  }
  function _ledgerLoad(){
    try{
      if(typeof window.ZirakStorageKey!=='function') return null;
      var raw=localStorage.getItem(window.ZirakStorageKey('learning_ledger'));
      return raw?JSON.parse(raw):null;
    }catch(e){return null;}
  }
  function _ledgerSave(model){
    try{
      if(typeof window.ZirakStorageKey==='function')
        localStorage.setItem(window.ZirakStorageKey('learning_ledger'),JSON.stringify(model));
    }catch(e){}
  }

  /* ═══════════════════════════════════════════════════════════════════════
     PART D — HOME SCREEN (entry point)
     ═══════════════════════════════════════════════════════════════════════ */
  /* ══════════════════════════════════════════════════════════════════════
     I6H-D9A — ACADEMY TESTS GUIDE + READ-ALOUD HELP
     One plain-English guide covering Daily/Weekly/Two-Week/Monthly, study
     days, disabled buttons, and next steps. Renders inside the SAME
     at-overlay (no second overlay system). Read-aloud is a small, separate
     speak/stop pair scoped ONLY to guide text — does not touch, share, or
     modify getQuestionSpeechText(q) or any question-TTS code path. No mic,
     no speech recognition, English only, cancels itself safely.
     ═══════════════════════════════════════════════════════════════════════ */
  var GUIDE_SECTIONS = [
    // I6H-D11: rewritten around the locked terminology + the two questions
    // students actually ask ("why so many?" and "what do statuses mean?").
    { icon:'\uD83C\uDFAF', title:'Your Assessment Path', lines:[
      'Practice \u2192 Topic Quiz \u2192 Daily Learning Review \u2192 Weekly Progress Test \u2192 Two-Week Progress Review \u2192 Monthly Progress Exam.',
      'Each one has a different job \u2014 they are not the same test repeated.'
    ]},
    { icon:'\uD83E\uDDEA', title:'Topic Quiz', lines:[
      'A short quiz on ONE topic, right after you learn it.',
      'You start it from the topic\u2019s own page. You can repeat it.'
    ]},
    { icon:'\uD83D\uDCD8', title:'Daily Learning Review', lines:[
      'A short review of today\u2019s real practice.',
      'It becomes Ready after at least 3 testable learning items today.'
    ]},
    { icon:'\uD83D\uDCC5', title:'Weekly Progress Test', lines:[
      'Tests your five academy study days together.',
      'Study days are Saturday, Sunday, Monday, Tuesday, Wednesday.',
      'Thursday and Friday are weekend rest days.'
    ]},
    { icon:'\uD83E\uDDED', title:'Two-Week Progress Review', lines:[
      'Looks across 10 academy study days (two weeks).',
      'Its special job is finding your REPEATED weak points.',
      'It prepares you for the Monthly Progress Exam.'
    ]},
    { icon:'\uD83C\uDFC6', title:'Monthly Progress Exam', lines:[
      'The formal exam for the full 20-study-day monthly cycle.',
      'Your Progress Report and Certificate come from this result.'
    ]},
    { icon:'\uD83D\uDD01', title:'Why do some questions repeat?', lines:[
      'Seeing material again after days or weeks checks real memory, not just today\u2019s memory.',
      'That is how the academy makes sure learning truly stays with you.'
    ]},
    { icon:'\uD83D\uDEA6', title:'What the statuses mean', lines:[
      'Not Yet Available \u2014 you have not met the requirement yet; the card always tells you what is missing.',
      'Ready \u2014 you can start now.',
      'Completed \u2014 finished, with your score shown; retake is allowed.',
      'Revision Recommended \u2014 completed, but weak points remain; review them before moving on.',
      'A grey button is never broken \u2014 it is simply waiting for you.',
      'An assessment can become Ready once enough learning evidence exists \u2014 the card always shows how many of the full period\u2019s study days (5, 10, or 20) are recorded.'
    ]},
    { icon:'\u2B50', title:'Recommended Next Step', lines:[
      'The star card at the top always shows the ONE best thing to do next.',
      'Follow it and the app will carry you through the whole path.'
    ]}
  ];
  function _guidePlainText(){
    var parts = ['How Your Assessments Work.'];
    GUIDE_SECTIONS.forEach(function(s){
      parts.push(s.title + '.');
      s.lines.forEach(function(l){ parts.push(l); });
    });
    return parts.join(' ');
  }
  function openGuide(){
    var body = $id('at-body');
    if (!body) return;
    // Guard: remember what was showing so Close Guide can restore it.
    if (typeof AT._guidePrevHtml !== 'string') AT._guidePrevHtml = body.innerHTML;
    var html = '<div class="at-guide">' +
      '<div class="at-guide-head">' +
        '<div class="at-guide-title">\uD83D\uDCD8 How Your Assessments Work</div>' +
        '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.closeGuide()">Close Guide</button>' +
      '</div>' +
      '<div class="zk-action-row at-action-row" style="padding:4px 0 8px;">' +
        '<button type="button" class="at-hear-btn" id="at-guide-read-btn" onclick="ZirakAcademyTests.readGuideAloud()">\uD83D\uDD0A Read Guide Aloud</button>' +
        '<button type="button" class="at-hear-btn" id="at-guide-stop-btn" style="display:none;" onclick="ZirakAcademyTests.stopGuideReading()">\u25A0 Stop Reading</button>' +
      '</div>' +
      '<div id="at-guide-msg" style="display:none;font-size:12.5px;color:var(--text-muted);padding:0 0 8px;">Voice reading is not available on this device. You can still read the guide below.</div>' +
      GUIDE_SECTIONS.map(function(s){
        return '<div class="at-card" style="margin-left:0;margin-right:0;">' +
          '<div class="at-sec-lbl" style="padding-top:0;">' + s.icon + ' ' + esc(s.title) + '</div>' +
          '<div class="at-q-text" style="font-size:13.5px;">' +
            s.lines.map(function(l){ return esc(l); }).join('<br>') +
          '</div>' +
        '</div>';
      }).join('') +
      '<div style="height:12px;"></div>' +
    '</div>';
    body.innerHTML = html;
    try { body.scrollTop = 0; } catch(e) {}
  }
  function closeGuide(){
    stopGuideReading();
    var body = $id('at-body');
    // I6H-D9A: explicit typeof check, not a truthy check — a truthy check
    // would skip restoration if the previous content ever happened to be
    // an empty string (edge case; doesn't occur via renderHome() today,
    // but this is the correct/defensive way to guard "was it ever set").
    if (body && typeof AT._guidePrevHtml === 'string') { body.innerHTML = AT._guidePrevHtml; }
    AT._guidePrevHtml = null;
  }
  // I6H-D9A: guide-only speech. Separate from getQuestionSpeechText(q) and
  // every question/feedback TTS path — this function is never called by
  // any of them, and they are never called by this.
  function readGuideAloud(){
    var msgEl = $id('at-guide-msg');
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === 'undefined') {
      if (msgEl) msgEl.style.display = 'block';
      return;
    }
    try {
      window.speechSynthesis.cancel(); // cancel any previous guide (or other) speech first
      var text = _guidePlainText();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = (window.state && state.speechRate) ? state.speechRate : 0.95;
      var readBtn = $id('at-guide-read-btn'), stopBtn = $id('at-guide-stop-btn');
      if (readBtn) readBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = 'inline-flex';
      u.onend = function(){ if (readBtn) readBtn.style.display=''; if (stopBtn) stopBtn.style.display='none'; };
      u.onerror = function(){ if (readBtn) readBtn.style.display=''; if (stopBtn) stopBtn.style.display='none'; };
      window.speechSynthesis.speak(u);
    } catch(e) {
      if (msgEl) msgEl.style.display = 'block';
    }
  }
  function stopGuideReading(){
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch(e) {}
    var readBtn = $id('at-guide-read-btn'), stopBtn = $id('at-guide-stop-btn');
    if (readBtn) readBtn.style.display = '';
    if (stopBtn) stopBtn.style.display = 'none';
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D11 — ASSESSMENT TERMINOLOGY (single source of truth) + the
     RECOMMENDED NEXT STEP engine.
     Locked student-facing names (display layer ONLY — every ledger source
     key, stable-ID pattern, schema field, and public function name is
     FROZEN; renaming those would corrupt existing student data):
       Topic Quiz · Daily Learning Review · Weekly Progress Test ·
       Two-Week Progress Review · Monthly Progress Exam ·
       Progress Report · Certificate · Placement Test (future system)
     Pashto glosses are display-only and flagged for owner native review.
     ═══════════════════════════════════════════════════════════════════════ */
  var ASSESSMENT_NAMES = {
    daily:   { en: 'Daily Learning Review',    ps: '\u062f \u0646\u0646 \u0648\u0631\u0685\u06d0 \u062f \u0632\u062f\u0647 \u06a9\u0693\u06d0 \u0628\u06cc\u0627\u06a9\u062a\u0646\u0647', icon: '\uD83D\uDCD8' },
    weekly:  { en: 'Weekly Progress Test',     ps: '\u0627\u0648\u0646\u06cc\u0632\u0647 \u062f \u067e\u0631\u0645\u062e\u062a\u06ab \u0627\u0632\u0645\u0648\u06cc\u0646\u0647', icon: '\uD83D\uDCC5' },
    twoWeek: { en: 'Two-Week Progress Review', ps: '\u062f\u0648\u0647 \u0627\u0648\u0646\u06cc\u0632\u0647 \u062f \u067e\u0631\u0645\u062e\u062a\u06ab \u0628\u06cc\u0627\u06a9\u062a\u0646\u0647', icon: '\uD83E\uDDED' },
    monthly: { en: 'Monthly Progress Exam',    ps: '\u0645\u06cc\u0627\u0634\u062a\u0646\u06cc \u062f \u067e\u0631\u0645\u062e\u062a\u06ab \u0627\u0645\u062a\u062d\u0627\u0646', icon: '\uD83C\uDFC6' },
    topic:   { en: 'Topic Quiz',               ps: '\u062f \u0645\u0648\u0636\u0648\u0639 \u06a9\u0648\u0686\u0646\u06cd \u0627\u0632\u0645\u0648\u06cc\u0646\u0647', icon: '\uD83E\uDDEA' }
  };
  function _psGloss(key){
    var n = ASSESSMENT_NAMES[key];
    return n ? '<span class="at-ps-gloss" dir="rtl">' + n.ps + '</span>' : '';
  }
  // ONE decision-maker for "what should the student do next?" — walks the
  // ladder smallest-due-first (daily -> weekly -> two-week -> monthly),
  // exactly the natural academy rhythm. Uses ONLY the existing readiness/
  // completion helpers; adds no second detection system.
  // I6H-D11A (review claims 2+3 — CONFIRMED): "Go Learn" only closed the
  // overlay. These use app.js's global navigate()/showSchoolTab() when
  // present (guarded — degrade to plain close, never crash).
  function _distinctDays(records){
    var d={}; (records||[]).forEach(function(r){ if(r.source!=='academy-certificate'&&r.source!=='academy-report-card'&&r.source!=='personal-learning-plan') d[r.dateKey]=true; });
    return Object.keys(d).length;
  }
  function _closeOverlay(){ var o=$id('at-overlay'); if(o) o.remove(); try{window.speechSynthesis&&window.speechSynthesis.cancel();}catch(e){} }
  function goLearn(){
    _closeOverlay();
    try { if (typeof window.navigate === 'function') window.navigate('path'); } catch(e){}
  }
  function goPlacement(){
    _closeOverlay();
    try {
      if (typeof window.navigate === 'function') window.navigate('path');
      if (typeof window.showSchoolTab === 'function') window.showSchoolTab('placement');
    } catch(e){}
  }
  /* I6H-D11B (Workstream A, repaired): a stored placement_result is only a
     RECOMMENDATION — it does NOT mean placement is complete. Placement is
     complete only when one of these is true:
       - teacher set a level on the profile        (levelSource: teacher)
       - placement recommendation was accepted     (levelSource: placement)
       - a class was chosen through the approved
         School Path manual flow                   (levelSource: manual)
     Old profiles (pre-D11B) that already started the School Path are
     treated as placed via school_started+school_class, so nothing breaks. */
  function _nsGet(key){
    try {
      var ns = (typeof window.__zirakNS === 'function') ? window.__zirakNS() : '';
      return localStorage.getItem('roshan_' + ns + key);
    } catch(e){ return null; }
  }
  function getPlacementState(){
    var s = {};
    try { s = (window.ZirakProfile && window.ZirakProfile.currentStudent) ? (window.ZirakProfile.currentStudent()||{}) : {}; } catch(e){}
    var teacherLevel = (s.level && String(s.level).trim() && s.level !== '\u2014') ? String(s.level).trim() : '';
    var result = null, accepted = null;
    try { result = JSON.parse(_nsGet('placement_result') || 'null'); } catch(e){}
    try { accepted = JSON.parse(_nsGet('placement_accepted') || 'null'); } catch(e){}
    // Legacy pre-D11B profiles: School Path already started = level was chosen.
    var legacyChosen = !accepted && _nsGet('school_started') === '1' && !!_nsGet('school_class');
    var placed = !!(teacherLevel || accepted || legacyChosen);
    var levelSource = teacherLevel ? 'teacher'
      : accepted ? (accepted.source || 'placement')
      : legacyChosen ? 'manual' : '';
    var currentLevel = teacherLevel || (accepted && accepted.level) || (legacyChosen ? _nsGet('school_class') : '') || '';

    /* I6H-D12A \u00a713: pending-recommendation detection is centralized in
       the engine's getPlacementDecisionState()/resolvePlacementStartMode()
       \u2014 NOT a raw date comparison. A new recommendation counts as
       "pending" only while its actual decision status is unresolved. */
    var decisionState = 'noResult', startMode = 'first', latestPlEngineResult = null;
    try {
      if (window.ZirakPlacementEngine) {
        if (typeof window.ZirakPlacementEngine.getPlacementDecisionState === 'function') decisionState = window.ZirakPlacementEngine.getPlacementDecisionState();
        if (typeof window.ZirakPlacementEngine.resolvePlacementStartMode === 'function') startMode = window.ZirakPlacementEngine.resolvePlacementStartMode();
        if (typeof window.ZirakPlacementEngine.getResult === 'function') latestPlEngineResult = window.ZirakPlacementEngine.getResult();
      }
    } catch(e){}

    var retakePending = false, retakeDecisionState = '';
    if (latestPlEngineResult && placed) {
      var isRetakeResult = !!latestPlEngineResult.diagnostic.isRetake;
      if (decisionState === 'recommendationPending' && isRetakeResult) { retakePending = true; retakeDecisionState = 'pending'; }
      else if (decisionState === 'existingLevelKept') retakeDecisionState = 'existingLevelKept';
      else if (decisionState === 'retestRequested') retakeDecisionState = 'retestRequested';
      else if (decisionState !== 'recommendationPending' && decisionState !== 'noResult' && decisionState !== 'inProgress') retakeDecisionState = 'resolved';
    } else if (!placed) {
      // Fallback for legacy/no-engine builds (defensive only).
      retakePending = !!(result && accepted && result.date && accepted.at &&
        new Date(result.date) > new Date(accepted.at) && result.classId && result.classId !== accepted.level);
      if (retakePending) retakeDecisionState = 'pending';
    }

    return {
      placed: placed,
      placementTestCompleted: !!result,
      recommendedLevel: result ? (result.classId || '') : '',
      placementAccepted: !!accepted,
      currentLevel: currentLevel,
      levelSource: levelSource,
      retakePending: retakePending,
      retakeDecisionState: retakeDecisionState,
      decisionState: decisionState,
      startMode: startMode
    };
  }
  function _isUnplaced(){
    try { return !getPlacementState().placed; } catch(e){ return false; }
  }
  function getRecommendedNextStep(){
    // I6H-D11A: a new/unplaced student's first step is choosing a starting
    // level — before any assessment recommendation.
    if (_isUnplaced() && typeof window.navigate === 'function') {
      var _ps11b = getPlacementState();
      if (_ps11b.placementTestCompleted && !_ps11b.placementAccepted) {
        return { key:'placement', title:'Placement Test Completed', ps:'\u062f \u06a9\u0686\u06d0 \u0627\u0632\u0645\u0648\u06cc\u0646\u0647 \u0628\u0634\u067e\u0693\u0647 \u0634\u0648\u0647',
          reason:'Recommended Level: ' + _ps11b.recommendedLevel + ' \u2014 accept the recommendation or choose another level to finish placement.',
          actionLabel:'\u2705 Accept Recommended Level', action:'ZirakAcademyTests.acceptRecommendedLevel()' };
      }
      return { key:'placement', title:'Choose Your Starting Level', ps:'\u062f \u06a9\u0686\u06d0 \u067c\u0627\u06a9\u0644\u0648 \u0627\u0632\u0645\u0648\u06cc\u0646\u0647',
        reason:'Take the Placement Test for a recommended level, or choose a level manually with teacher guidance.',
        actionLabel:'\uD83D\uDCCB Take Placement Test', action:'ZirakAcademyTests.goPlacement()' };
    }
    // I6H-D13A Task 22 (carried from D13): priority 2/3 — continue an
    // unfinished high-priority plan activity, or start today's main plan
    // activity. Uses the D13A planItemId-based completion model
    // (completedPlanItems), never the retired activityId-keyed model.
    try {
      if (window.ZirakLearningPlan && typeof window.ZirakLearningPlan.getTodayPlan === 'function') {
        var _lpToday = window.ZirakLearningPlan.getTodayPlan();
        if (_lpToday && _lpToday.dayPlan) {
          var _lpPlan = window.ZirakLearningPlan.getPlan();
          var _lpNext = _lpToday.dayPlan.activities.find(function(a){
            var rec = _lpPlan && _lpPlan.completedPlanItems[a.planItemId];
            return !(rec && (rec.status==='completed'||rec.status==='skipped'||rec.status==='replaced'||rec.completionMethod));
          });
          if (_lpNext) {
            var _lpAct = window.ZirakLearningPlan.activityById(_lpNext.activityId);
            if (_lpAct) {
              return { key:'plan', title: _lpAct.title, ps:'',
                reason: (_lpNext.essential !== false ? 'This activity strengthens your highest current recovery priority.' : 'A short complementary activity from today\u2019s plan.'),
                actionLabel:'\u25B6 Start (~'+_lpNext.estimatedMinutes+' min)', action:'navigate(\'personal-plan\')' };
            }
          }
        }
      }
    } catch(e){}
    var recs = getTodayRecords().filter(function(r){ return r.source !== 'academy-daily-test'; });
    var testableCount = buildDailyTest(recs).length;
    var dailyDone = !!getTodayRecords().filter(function(r){ return r.source === 'academy-daily-test'; })[0];
    var dailyReady = recs.length > 0 && testableCount >= 3;
    var weekRange = _weekRange();
    var weeklyDoneRec = findWeeklyTestRecord(weekRange);
    var weeklyReady = isWeeklyTestReady(_weekStudyRecords());
    var twoWeekRange = _twoWeekRange();
    var twoWeekDoneRec = findTwoWeekReviewRecord(twoWeekRange);
    var twoWeekReady = isTwoWeekReviewReady(_twoWeekStudyRecords(), twoWeekRange);
    var monthlyRange = _monthlyRange();
    var monthlyDoneRec = findMonthlyExamRecord(monthlyRange);
    var monthlyReady = isMonthlyExamReady(_monthlyStudyRecords(), monthlyRange);

    function revisionNote(rec){
      if (!rec) return '';
      var weakCount = (rec.repeatedWeakGroups && rec.repeatedWeakGroups.length) || 0;
      if ((typeof rec.pct === 'number' && rec.pct < 60) || weakCount > 1)
        return 'Revision recommended \u2014 review your weak items first.';
      return '';
    }
    if (dailyReady && !dailyDone) return { key:'daily', title:ASSESSMENT_NAMES.daily.en, ps:ASSESSMENT_NAMES.daily.ps,
      reason:'Review today\u2019s learning while it is fresh \u2014 ' + testableCount + ' items ready.',
      actionLabel:'\uD83D\uDCD8 Start Daily Learning Review', action:'ZirakAcademyTests.start()' };
    if (weeklyReady && !weeklyDoneRec) return { key:'weekly', title:ASSESSMENT_NAMES.weekly.en, ps:ASSESSMENT_NAMES.weekly.ps,
      reason:'Enough learning evidence is ready ('+_distinctDays(_weekStudyRecords())+' of 5 study days recorded).',
      actionLabel:'\uD83D\uDCC5 Start Weekly Progress Test', action:'ZirakAcademyTests.startWeekly()' };
    if (twoWeekReady && !twoWeekDoneRec) return { key:'twoWeek', title:ASSESSMENT_NAMES.twoWeek.en, ps:ASSESSMENT_NAMES.twoWeek.ps,
      reason:'Enough evidence to find repeated weak points ('+_distinctDays(_twoWeekStudyRecords())+' of 10 study days recorded).',
      actionLabel:'\uD83E\uDDED Start Two-Week Progress Review', action:'ZirakAcademyTests.startTwoWeek()' };
    if (monthlyReady && !monthlyDoneRec) return { key:'monthly', title:ASSESSMENT_NAMES.monthly.en, ps:ASSESSMENT_NAMES.monthly.ps,
      reason:'Sufficient learning evidence for the formal exam ('+_distinctDays(_monthlyStudyRecords())+' of 20 study days recorded).',
      actionLabel:'\uD83C\uDFC6 Start Monthly Progress Exam', action:'ZirakAcademyTests.startMonthly()' };
    if (!dailyReady && !dailyDone) return { key:'learn', title:'Keep Learning', ps:'\u0632\u062f\u0647 \u06a9\u0693\u0647 \u062a\u0647 \u062f\u0648\u0627\u0645 \u0648\u0631\u06a9\u0693\u0647',
      reason:'Keep learning first \u2014 ' + testableCount + ' of 3 review items ready today.',
      actionLabel:'\uD83D\uDCDA Go Learn', action:'ZirakAcademyTests.goLearn()' };
    // Everything currently due is done.
    var latestDone = monthlyDoneRec || twoWeekDoneRec || weeklyDoneRec || null;
    var rn = revisionNote(latestDone);
    if (monthlyDoneRec && typeof window.ZirakAchievementCenter === 'object' && window.ZirakAchievementCenter.open)
      return { key:'report', title:'View Your Progress Report', ps:'\u062f \u067e\u0631\u0645\u062e\u062a\u06ab \u0631\u0627\u067e\u0648\u0631 \u0648\u06ab\u0648\u0631\u0626',
        reason: rn || 'Your monthly cycle is assessed \u2014 see your report and certificate status.',
        actionLabel:'\uD83C\uDFC6 Open Achievement Center', action:'ZirakAchievementCenter.open()' };
    return { key:'caughtUp', title:'All Caught Up', ps:'\u0647\u0631 \u0685\u0647 \u0628\u0634\u067e\u0693 \u062f\u064a',
      reason: rn || 'Every due assessment is completed \u2014 keep practising!',
      actionLabel:'\uD83D\uDCDA Keep Practising', action:'ZirakAcademyTests.goLearn()' };
  }

  function renderHome(){
    var info=null; try{info=cal()?cal().todayInfo():null;}catch(e){}
    var label=info?info.label:'Today';
    var isStudy=info?info.isStudyDay:true;
    var recs=getTodayRecords().filter(function(r){return r.source!=='academy-daily-test';});
    var testRec=getTodayRecords().filter(function(r){return r.source==='academy-daily-test';})[0]||null;
    var testableCount=buildDailyTest(recs).length;
    var canTest=recs.length>0&&testableCount>=3;
    var alreadyDone=!!testRec;
    // I6H-D11: ONE universal status vocabulary everywhere — Not Yet
    // Available (with reason + progress count) / Ready / Completed
    // (+ Revision Recommended chip). Never a bare grey button.
    function _revChip(rec){
      var weak=(rec&&rec.repeatedWeakGroups&&rec.repeatedWeakGroups.length)||0;
      return (rec&&((typeof rec.pct==='number'&&rec.pct<60)||weak>1))
        ? '<div class="at-home-status at-chip-revision">\uD83D\uDD01 Revision Recommended \u2014 review your weak items</div>' : '';
    }
    var statusHtml='';
    if(alreadyDone){
      statusHtml='<div class="at-home-status at-status-done">\u2705 Completed today \u2014 score '+testRec.pct+'%</div>'+_revChip(testRec);
    } else if(!canTest){
      statusHtml='<div class="at-home-status at-status-wait">Not Yet Available \u2014 complete some learning first.<br><span style="font-weight:600;opacity:.85;">'+testableCount+' of 3 testable items ready today.</span></div>';
    } else {
      statusHtml='<div class="at-home-status at-status-ready">\uD83D\uDFE2 Ready \u2014 '+testableCount+' items from today\u2019s learning.</div>';
    }
    var nextStep = getRecommendedNextStep();
    var nextStepHtml =
      '<div class="at-next-step">'+
        '<div class="at-next-step-lbl">\u2B50 Recommended Next Step <span class="at-ps-gloss" dir="rtl">\u0648\u0693\u0627\u0646\u062f\u06cc\u0632 \u0634\u0648\u06cc \u0631\u0627\u062a\u0644\u0648\u0646\u06a9\u06cc \u06ab\u0627\u0645</span></div>'+
        '<div class="at-next-step-title">'+esc(nextStep.title)+' <span class="at-ps-gloss" dir="rtl">'+nextStep.ps+'</span></div>'+
        '<div class="at-next-step-reason">'+esc(nextStep.reason)+'</div>'+
        '<button type="button" class="at-btn at-btn-primary" onclick="'+nextStep.action+'">'+nextStep.actionLabel+'</button>'+
      '</div>';

    /* I6H-D12: Placement & Level — a SEPARATE diagnostic section, never
       mixed with Daily/Weekly/Two-Week/Monthly progress assessments. */
    var placementHtml = '';
    try {
      var ps12 = getPlacementState();
      var latest = (window.ZirakPlacementEngine && window.ZirakPlacementEngine.getResult) ? window.ZirakPlacementEngine.getResult() : null;
      var sess12 = null;
      try { sess12 = (window.ZirakPlacementEngine && window.ZirakPlacementEngine.getSession) ? window.ZirakPlacementEngine.getSession() : null; } catch(e){ sess12 = null; }
      var lvlLine = ps12.placed
        ? ('Current Level: <b>' + esc(ps12.currentLevel) + '</b> \u00b7 source: ' + esc(ps12.levelSource || '\u2014'))
        : 'No accepted level yet.';
      var decisionLabel = !latest ? ''
        : !latest.decision || latest.decision.decisionStatus === 'pending' ? 'Decision Required'
        : latest.decision.decisionStatus === 'acceptedRecommendation' ? 'Accepted'
        : latest.decision.decisionStatus === 'manualLevelSelected' ? 'Selected Manually'
        : latest.decision.decisionStatus === 'teacherConfirmedRecommendation' ? 'Teacher Confirmed'
        : latest.decision.decisionStatus === 'teacherSelectedDifferentLevel' ? 'Teacher Selected Different Level'
        : latest.decision.decisionStatus === 'keptExistingLevel' ? 'Existing Level Kept'
        : latest.decision.decisionStatus === 'retestRequested' ? 'Retest Requested'
        : latest.decision.decisionStatus === 'supersededByRetake' ? 'Superseded' : '';
      var testLine = latest
        ? ('Latest Placement Test: ' + esc(String(latest.diagnostic.completedAt).slice(0,10)) + (latest.diagnostic.isRetake ? ' (retake)' : '') + ' \u2014 recommended <b>' + esc(latest.diagnostic.recommendedLevelName) + '</b> (' + esc(latest.diagnostic.confidence) + ' confidence) \u00b7 ' + esc(decisionLabel))
        : (ps12.placementTestCompleted ? 'A placement result exists.' : 'No Placement Test taken yet.');
      var actions12 = '<button type="button" class="at-btn" onclick="ZirakAcademyTests.goPlacement()">' + (sess12 ? '\u25B6 Continue Placement' : '\uD83D\uDCCB Placement Test') + '</button>';
      if (latest) actions12 += ' <button type="button" class="at-btn" onclick="(navigate(\'path\'),showSchoolTab(\'placement\'),window.ZirakPlacementEngine&&window.ZirakPlacementEngine.openPlacementHistory&&window.ZirakPlacementEngine.openPlacementHistory())">\uD83D\uDDC2 Placement History</button>';
      placementHtml =
        '<div class="at-home-card" style="margin-top:10px;">' +
          '<div class="at-home-title">\uD83C\uDF93 Placement &amp; Level <span class="at-ps-gloss" dir="rtl">\u062f \u06a9\u0686\u06d0 \u067c\u0627\u06a9\u0646\u0647</span></div>' +
          '<div class="at-home-sub">' + lvlLine + '</div>' +
          '<div class="at-home-sub" style="opacity:.85;">' + testLine + '</div>' +
          (ps12.retakeDecisionState === 'pending' ? '<div class="at-home-status at-chip-revision">\uD83D\uDD04 New recommendation pending review</div>' : '') +
          (latest && latest.diagnostic.teacherReviewRecommended && (!latest.decision || latest.decision.decisionStatus === 'pending') ? '<div class="at-home-status at-chip-revision">\uD83D\uDC69\u200D\uD83C\uDFEB Teacher review recommended</div>' : '') +
          '<div style="margin-top:8px;">' + actions12 + '</div>' +
        '</div>';
    } catch(e){ placementHtml = ''; }


    // I6H-D7A: real Weekly Progress Test entry point, now using the ONE
    // shared completion-detection helper (was ad-hoc .some()/.filter() —
    // still correct on its own, but duplicated logic the ledger's "This
    // Week" card didn't share, which is what caused ITS stale-status bug).
    var weekRange = _weekRange();
    var weekRecords = _weekStudyRecords();
    var weekReady = isWeeklyTestReady(weekRecords);
    var weekDoneRec = findWeeklyTestRecord(weekRange);
    var weekDone = !!weekDoneRec;
    var studyDaysSet = {}; weekRecords.forEach(function(r){ studyDaysSet[r.dateKey]=true; });
    var studyDaysCount = Object.keys(studyDaysSet).length;
    var weekStatusHtml;
    if (weekDone) {
      weekStatusHtml = '<div class="at-home-status at-status-done">\u2705 Completed this week \u2014 score '+weekDoneRec.pct+'%</div>'+_revChip(weekDoneRec);
    } else if (!weekReady) {
      weekStatusHtml = '<div class="at-home-status at-status-wait">Not Yet Available \u2014 not enough weekly learning records.<br><span style="font-weight:600;opacity:.85;">Study/practice on more academy days ('+studyDaysCount+' of 5 so far).</span></div>';
    } else {
      weekStatusHtml = '<div class="at-home-status at-status-ready">\uD83D\uDFE2 Ready \u2014 Study Days: '+studyDaysCount+' / 5</div>';
    }

    // I6H-D8: real Two-Week Progress Review status (was a disabled "coming later" card).
    var twoWeekRange = _twoWeekRange();
    var twoWeekRecordsForHome = _twoWeekStudyRecords();
    var twoWeekReady = isTwoWeekReviewReady(twoWeekRecordsForHome, twoWeekRange);
    var twoWeekDoneRec = findTwoWeekReviewRecord(twoWeekRange);
    var twoWeekDone = !!twoWeekDoneRec;
    var twoWeekStudyDaysSet = {}; twoWeekRecordsForHome.forEach(function(r){ twoWeekStudyDaysSet[r.dateKey]=true; });
    var twoWeekStudyDaysCount = Object.keys(twoWeekStudyDaysSet).length;
    var twoWeekStatusHtml;
    if (twoWeekDone) {
      twoWeekStatusHtml = '<div class="at-home-status at-status-done">\u2705 Completed \u2014 score '+twoWeekDoneRec.pct+'%</div>'+_revChip(twoWeekDoneRec);
    } else if (!twoWeekReady) {
      twoWeekStatusHtml = '<div class="at-home-status at-status-wait">Not Yet Available \u2014 not enough two-week learning data.<br><span style="font-weight:600;opacity:.85;">Need more study days or Weekly Progress Test results ('+twoWeekStudyDaysCount+' of 10 so far).</span></div>';
    } else {
      twoWeekStatusHtml = '<div class="at-home-status at-status-ready">\uD83D\uDFE2 Ready \u2014 Study Days: '+twoWeekStudyDaysCount+' / 10</div>';
    }

    // I6H-D9: real Monthly Progress Exam status (was a disabled "coming later" card).
    var monthlyRange = _monthlyRange();
    var monthlyRecordsForHome = _monthlyStudyRecords();
    var monthlyReady = isMonthlyExamReady(monthlyRecordsForHome, monthlyRange);
    var monthlyDoneRec = findMonthlyExamRecord(monthlyRange);
    var monthlyDone = !!monthlyDoneRec;
    var monthlyStudyDaysSet = {}; monthlyRecordsForHome.forEach(function(r){ monthlyStudyDaysSet[r.dateKey]=true; });
    var monthlyStudyDaysCount = Object.keys(monthlyStudyDaysSet).length;
    var monthlyStatusHtml;
    if (monthlyDone) {
      monthlyStatusHtml = '<div class="at-home-status at-status-done">\u2705 Completed \u2014 score '+monthlyDoneRec.pct+'%</div>'+_revChip(monthlyDoneRec);
    } else if (!monthlyReady) {
      monthlyStatusHtml = '<div class="at-home-status at-status-wait">Not Yet Available \u2014 not enough monthly learning data.<br><span style="font-weight:600;opacity:.85;">Complete more Daily Learning Reviews, Weekly Progress Tests, or the Two-Week Progress Review ('+monthlyStudyDaysCount+' of 20 study days so far).</span></div>';
    } else {
      monthlyStatusHtml = '<div class="at-home-status at-status-ready">\uD83D\uDFE2 Ready \u2014 Study Days: '+monthlyStudyDaysCount+' / 20</div>';
    }

    var old=$id('at-overlay'); if(old) old.remove();
    var ov=document.createElement('div');
    ov.id='at-overlay'; ov.className='at-overlay';
    ov.innerHTML=
      '<div class="at-panel">'+
        '<div class="at-head">'+
          '<button type="button" class="at-close" onclick="ZirakAcademyTests.close()" aria-label="Close">\u2715 Exit</button>'+
          '<div class="at-head-center"><span class="at-head-icon">\uD83C\uDF93</span><span class="at-head-title">Assessments &amp; Progress</span></div>'+
          '<button type="button" class="at-close" onclick="ZirakAcademyTests.openGuide()" aria-label="Guide">\uD83D\uDCD8 Guide</button>'+
        '</div>'+
        '<div id="at-body" class="at-body" style="padding:14px;">'+
          '<div class="at-home-cal '+(isStudy?'at-cal-study':'at-cal-off')+'">'+esc(label)+'</div>'+
          nextStepHtml+
          placementHtml+
          '<div class="at-home-section-title">\uD83D\uDCD8 Daily Learning Review '+_psGloss('daily')+'</div>'+
          statusHtml+
          '<div class="at-home-actions">'+
            '<button type="button" class="at-btn at-btn-primary" '+(canTest?'onclick="ZirakAcademyTests.start()"':'disabled style="opacity:.45;cursor:not-allowed;"')+'>'+
              (alreadyDone?'\uD83D\uDD01 Retake Daily Learning Review':'\uD83C\uDF93 Start Daily Learning Review')+'</button>'+
            '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.openLedger()">\uD83D\uDCD8 Today\'s Learning Record</button>'+
          '</div>'+
          '<div class="at-home-section-title">\uD83D\uDCC5 Weekly Progress Test '+_psGloss('weekly')+'</div>'+
          '<div class="at-home-status at-status-ready" style="margin-bottom:4px;opacity:.85;">'+esc(weekRange?weekRange.weekLabel:'This Week')+'</div>'+
          weekStatusHtml+
          '<div class="at-home-actions">'+
            '<button type="button" class="at-btn at-btn-primary" '+(weekReady?'onclick="ZirakAcademyTests.startWeekly()"':'disabled style="opacity:.45;cursor:not-allowed;"')+'>'+
              (weekDone?'\uD83D\uDD01 Retake Weekly Progress Test':'\uD83D\uDCC5 Start Weekly Progress Test')+'</button>'+
          '</div>'+
          // I6H-D8: real Two-Week Progress Review entry point (was a disabled
          // "coming later" card through D7A).
          '<div class="at-home-section-title">\uD83E\uDDED Two-Week Progress Review '+_psGloss('twoWeek')+'</div>'+
          '<div class="at-home-status at-status-ready" style="margin-bottom:4px;opacity:.85;">'+esc(twoWeekRange?twoWeekRange.twoWeekLabel:'Two-Week Progress Review')+'</div>'+
          twoWeekStatusHtml+
          '<div class="at-home-actions">'+
            '<button type="button" class="at-btn at-btn-primary" '+(twoWeekReady?'onclick="ZirakAcademyTests.startTwoWeek()"':'disabled style="opacity:.45;cursor:not-allowed;"')+'>'+
              (twoWeekDone?'\uD83D\uDD01 Retake Two-Week Progress Review':'\uD83E\uDDED Start Two-Week Progress Review')+'</button>'+
          '</div>'+
          // I6H-D9: real Monthly Progress Exam entry point (was a disabled
          // "coming later" card through D8).
          '<div class="at-home-section-title">\uD83C\uDFC6 Monthly Progress Exam '+_psGloss('monthly')+'</div>'+
          '<div class="at-home-status at-status-ready" style="margin-bottom:4px;opacity:.85;">'+esc(monthlyRange?monthlyRange.monthlyLabel:'Monthly Progress Exam')+'</div>'+
          monthlyStatusHtml+
          '<div class="at-home-actions">'+
            '<button type="button" class="at-btn at-btn-primary" '+(monthlyReady?'onclick="ZirakAcademyTests.startMonthly()"':'disabled style="opacity:.45;cursor:not-allowed;"')+'>'+
              (monthlyDone?'\uD83D\uDD01 Retake Monthly Progress Exam':'\uD83C\uDFC6 Start Monthly Progress Exam')+'</button>'+
          '</div>'+
          // I6H-D10: Academic Achievement Center entry point — guarded, so
          // this renders nothing if the module fails to load for any reason.
          (typeof window.ZirakAchievementCenter === 'object' && typeof window.ZirakAchievementCenter.open === 'function'
            ? '<div class="at-home-section-title">\uD83C\uDFC6 Academic Achievement Center</div>'+
              '<div class="at-home-actions">'+
                '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAchievementCenter.open()">\uD83C\uDFC6 Open Achievement Center</button>'+
              '</div>'
            : '')+
        '</div>'+
      '</div>';
    (document.getElementById('app')||document.body).appendChild(ov);
  }

  /* show overlay when not enough data */
  function showNotEnough(){
    var old=$id('at-overlay'); if(old) old.remove();
    var ov=document.createElement('div');
    ov.id='at-overlay'; ov.className='at-overlay';
    ov.innerHTML=
      '<div class="at-panel">'+
        '<div class="at-head">'+
          '<button type="button" class="at-close" onclick="ZirakAcademyTests.close()">\u2715 Exit</button>'+
          '<div class="at-head-center"><span>\uD83C\uDF93</span><span>Daily Learning Review</span></div>'+
          '<div style="width:64px;"></div>'+
        '</div>'+
        '<div class="at-body" style="padding:24px;text-align:center;">'+
          '<div style="font-size:44px;margin-bottom:12px;">\uD83D\uDCDA</div>'+
          '<div style="font-size:16px;font-weight:800;margin-bottom:8px;">Not enough learning today yet.</div>'+
          '<div style="font-size:13.5px;color:var(--text-muted);">Complete at least 3 practice items first, then the Daily Learning Review will be ready.</div>'+
          '<button type="button" class="at-btn at-btn-ghost" style="margin-top:20px;" onclick="ZirakAcademyTests.close()">\u2190 Back</button>'+
        '</div>'+
      '</div>';
    (document.getElementById('app')||document.body).appendChild(ov);
  }

  /* ── date key helper (fallback if no calendar) ───────────────────────── */
  function _localDateKey(){
    var d=new Date(), p=function(n){return (n<10?'0':'')+n;};
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
  }

  /* ── Launcher card in Review screen ─────────────────────────────────── */
  function injectLauncher(){
    try{
      var host=document.getElementById('screen-review');
      if(!host||document.getElementById('at-launcher-card')) return;
      var card=document.createElement('div');
      card.id='at-launcher-card';
      card.className='card at-launcher';
      card.innerHTML=
        '<div class="at-launch-txt">'+
          '<div class="at-launch-title">\uD83C\uDF93 Assessments &amp; Progress</div>'+
          '<div class="at-launch-sub">Review today\u2019s learning and manage your progress assessments.</div>'+
        '</div>'+
        '<button type="button" class="at-btn-open" id="at-open-btn">Open \u2192</button>';
      // Insert after llg-launcher-card if it exists, otherwise at children[2]
      var llg=document.getElementById('llg-launcher-card');
      if(llg&&llg.nextSibling) host.insertBefore(card, llg.nextSibling);
      else host.insertBefore(card, host.children[2]||null);
      var b=document.getElementById('at-open-btn');
      if(b) b.addEventListener('click', function(){ ZirakAcademyTests.home(); });
    }catch(e){}
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', injectLauncher);
  } else { injectLauncher(); }

  /* ── PUBLIC API ──────────────────────────────────────────────────────── */

  /* ═══════════════════════════════════════════════════════════════════════
     GRAMMAR TOPIC TEST ENGINE (PHASE I6H-D2)
     Invoked by the 🧪 Topic Quiz button on every grammar topic page.
     source = 'gw'  → Grammar World topic (GW_TOPICS[topicId])
     source = 'gl'  → Foundation Grammar Lab topic (ZirakGrammarLab.topics[topicId])
     The test renders inside the same at-overlay; no second engine.
     ═══════════════════════════════════════════════════════════════════════ */

  var TT = {};   // topic-test mini state, separate from AT
  var _activeEngine = 'daily'; // I6H-D3: 'daily' | 'topic' — which engine hearQuestion() reads from

  function startTopicTest(source, topicId) {
    _activeEngine = 'topic';  // I6H-D3: disambiguate hearQuestion() source
    // Resolve topic data
    var t = null;
    if (source === 'gw') {
      try { t = (window.GW_TOPICS || {})[topicId]; } catch(e) {}
    } else {
      try { t = (window.ZirakGrammarLab && window.ZirakGrammarLab.topics) ? window.ZirakGrammarLab.topics[topicId] : null; } catch(e) {}
    }
    TT.source    = source;
    TT.topicId   = topicId;
    TT.topicName = t ? (t.titleEn || t.title || topicId) : topicId;
    // I6H-D5A: safe blueprint metadata hook — future-readiness only, never
    // blocks or changes the test if missing/absent. Does not touch question
    // generation, grading, or the minimum gate below.
    var blueprintMeta = (window.ZirakGrammarBlueprints && window.ZirakGrammarBlueprints.lookupTopic)
      ? window.ZirakGrammarBlueprints.lookupTopic(topicId) : null;
    TT.blueprintMeta = blueprintMeta || null;
    TT.questions = buildTopicTest(source, topicId, t);
    TT.idx = 0; TT.results = []; TT.scored = false;

    // I6H-D4 FIX: a 1-question "test" isn't a real test. Audit of the full
    // merged Grammar World topic set (GW_TOPICS + GW_CURRICULUM_TOPICS, 23
    // topics total) found 12/23 have zero example sentences and would only
    // ever generate the single formula-MC question. Route those to the
    // existing "not enough content" screen instead, which already points
    // the student to Auto-Wizard Practice — no new UI, safer minimum.
    if (TT.questions.length < 2) { _showTopicNotEnough(TT.topicName); return; }
    renderTopicTestShell();
    renderTopicQuestion();
  }

  function buildTopicTest(source, topicId, t) {
    var qs = [];
    if (source === 'gl' && t) {
      qs = _buildTopicTestGL(t);
    } else if (source === 'gw' && t) {
      qs = _buildTopicTestGW(t);
    }
    return qs.slice(0, 10);
  }

  /* ── GL: use testSession items first, fallback to lessonBlock examples ── */
  function _buildTopicTestGL(t) {
    var qs = [];
    // 1. testSessionId items (already graded MC/fillBlank/correction/transformation)
    var sess = (window.ZirakGrammarLab && t.testSessionId) ? (window.ZirakGrammarLab.sessions||{})[t.testSessionId] : null;
    if (sess && sess.items) {
      sess.items.forEach(function(it) {
        var tgt = it.answer || it.modelAnswer || (it.acceptable && it.acceptable[0]) || '';
        var q = { type: 'choose', prompt: it.promptEn || '', correct: tgt, source: 'gl', topicRef: t.id,
                  acceptable: Array.isArray(it.acceptable) ? it.acceptable.slice() : undefined };
        if (it.mode === 'choose' && it.choices) {
          q.type = 'choose'; q.options = it.choices.slice(); q.correct = it.answer || '';
        } else if (it.mode === 'fillBlank') {
          // I6H-D2B: single word/short answer → near-exact grading, not overlap.
          q.type = 'fillBlank'; q.correct = tgt;
        } else if (it.mode === 'transformation' || it.mode === 'correction') {
          // I6H-D2B: whole-sentence rewrite → overlap grading (word order can vary).
          q.type = 'correction'; q.correct = tgt;
          if (it.wrongSentence) q.prompt = 'Correct this sentence: "' + it.wrongSentence + '" — ' + (it.promptEn||'');
        } else {
          q.type = 'typed';
        }
        if (q.correct) qs.push(q);
      });
    }
    // 2. Fallback: lessonBlock examples → typed repeat questions
    if (qs.length < 3 && t.lessonBlocks) {
      t.lessonBlocks.forEach(function(b) {
        if (b.type === 'examples' && b.items) {
          b.items.forEach(function(x) {
            if (qs.length >= 8 || !x.en) return;
            // I6H-D2B: Pashto→English is a translation, not a generic 'typed' —
            // gets the more forgiving translation grader.
            qs.push({ type: 'translation', prompt: 'Translate / complete: ('+esc(x.ps||'')+')', correct: x.en, source: 'gl', topicRef: t.id });
          });
        }
        if (b.type === 'commonMistake' && b.rightEn && qs.length < 8) {
          qs.push({ type: 'correction', prompt: 'Correct the mistake: "'+esc(b.wrongEn||'')+'"', correct: b.rightEn, source: 'gl', topicRef: t.id });
        }
      });
    }
    return qs;
  }

  /* ── GW: build from overview/formula/forms/mistakes ─────────────────── */
  function _buildTopicTestGW(t) {
    var qs = [];
    // 1. formula → choose the correct form (I6H-D2A FIX: was 'typed', which
    // graded free-text paraphrases as wrong even when semantically correct —
    // e.g. "subject +is/are/am+verb with ing" vs "Subject + am/is/are + verb-ing".
    // A formula recognition question belongs in multiple-choice, not free text.)
    if (t.formula) {
      var correctFormula = t.formula.split('|')[0].trim();
      var distractors = [
        'Subject + have / has + verb-ed',
        'Subject + did + verb (base form)',
        'Subject + will + verb (base form)'
      ].filter(function(d){ return norm(d) !== norm(correctFormula); }).slice(0,3);
      qs.push({ type: 'choose', prompt: 'What is the formula / structure for this grammar?',
        options: shuffle([correctFormula].concat(distractors)), correct: correctFormula, source: 'gw' });
    }
    // 2. forms/examples → typed answers
    var groups = t.forms ? t.forms : (t.examples ? [{ label:'Examples', items: t.examples }] : []);
    var count = 0;
    groups.forEach(function(g) {
      (g.items || []).forEach(function(ex) {
        if (count >= 5 || !ex.en) return;
        count++;
        // I6H-D2B: Pashto→English translation gets the forgiving translation grader.
        qs.push({ type: 'translation', prompt: esc(ex.ps || '(Say in English)'), correct: ex.en, source: 'gw' });
      });
    });
    // 3. commonMistakes (array, if a topic ever has one) → spot-the-error
    (t.commonMistakes || []).slice(0, 2).forEach(function(m) {
      var right = m.right || m.rightEn || '';
      var wrong = m.wrong || m.wrongEn || '';
      if (right && wrong) {
        qs.push({ type: 'choose', prompt: 'Which is correct?',
          options: shuffle([right.slice(0,70), wrong.slice(0,70)]),
          correct: right, source: 'gw' });
      }
    });
    // I6H-D5 FIX: the real Grammar World data schema uses a SINGULAR
    // "mistake" object, not the "commonMistakes" array checked above — every
    // one of the 23 merged GW topics already has one, previously never read.
    // Some wrong/correct pairs are "/"-joined ("Happy. / Running fast."),
    // meaning multiple example pairs — split and use each pair.
    if (t.mistake && t.mistake.wrong && t.mistake.correct) {
      var wrongParts = String(t.mistake.wrong).split(' / ');
      var rightParts = String(t.mistake.correct).split(' / ');
      var pairCount = Math.min(wrongParts.length, rightParts.length, 2); // cap 2 per topic
      for (var mi = 0; mi < pairCount; mi++) {
        var w = wrongParts[mi].trim(), r = rightParts[mi].trim();
        if (w && r) {
          qs.push({ type: 'choose', prompt: 'Which is correct?',
            options: shuffle([r.slice(0,70), w.slice(0,70)]),
            correct: r, source: 'gw' });
        }
      }
    }
    // I6H-D5 FIX: the real Grammar World data schema also carries a
    // "practiceItems" array of already-authored, ready-made questions —
    // never read before. Converts three shapes safely:
    //   options + correctIndex  (types: choose / tableChoice / correctMistake)
    //   answerEn[]               (type: fillBlank) — carries the FULL array
    //                             through as acceptable[] so D2B's fillBlank
    //                             grader can match any authored variant.
    //   selfCheck (speak-aloud, no mic here) → intentionally skipped, not a
    //   safe typed-answer question.
    (t.practiceItems || []).forEach(function(pi) {
      if (qs.length >= 10) return;
      if (pi.type === 'selfCheck') return;
      if (pi.options && pi.options.length && typeof pi.correctIndex === 'number') {
        var opts = pi.options.map(function(o) { return (o && o.en) || ''; }).filter(Boolean);
        var correctOpt = (pi.options[pi.correctIndex] || {}).en || '';
        if (opts.length >= 2 && correctOpt) {
          qs.push({ type: 'choose', prompt: pi.promptEn || 'Choose the correct answer.',
            options: opts, correct: correctOpt, source: 'gw' });
        }
      } else if (pi.answerEn && pi.answerEn.length) {
        qs.push({ type: 'fillBlank', prompt: pi.promptEn || 'Complete the sentence.',
          correct: pi.answerEn[0], acceptable: pi.answerEn.slice(), source: 'gw' });
      }
    });
    // 4. Guarantee choose options deduplicated (choose needs ≥2 distinct options)
    qs = qs.filter(function(q) {
      return q.correct && (q.type !== 'choose' || (q.options && q.options.length >= 2 && new Set(q.options.map(norm)).size >= 2));
    });
    return qs;
  }

  /* ── Topic test shell + renderer ─────────────────────────────────────── */
  function renderTopicTestShell() {
    var old = $id('at-overlay'); if (old) old.remove();
    var ov = document.createElement('div');
    ov.id = 'at-overlay'; ov.className = 'at-overlay';
    ov.innerHTML =
      '<div class="at-panel">' +
        '<div class="at-head">' +
          '<button type="button" class="at-close" onclick="ZirakAcademyTests.close()">\u2715 Exit</button>' +
          '<div class="at-head-center"><span class="at-head-icon">\uD83E\uDDEA</span>' +
            '<span class="at-head-title">' + esc(TT.topicName) + ' \u2014 Topic Quiz</span></div>' +
          '<div style="width:64px;"></div>' +
        '</div>' +
        '<div class="at-calbar">Grammar ' + (TT.source === 'gl' ? 'Foundation Lab' : 'World') + ' Test</div>' +
        '<div id="at-body" class="at-body"></div>' +
      '</div>';
    (document.getElementById('app') || document.body).appendChild(ov);
  }
  function renderTopicQuestion() {
    var body = $id('at-body'); if (!body) return;
    var q = TT.questions[TT.idx]; if (!q) { finishTopicTest(); return; }
    TT.scored = false;
    var idx = TT.idx, total = TT.questions.length;
    var pct = Math.round(((idx + 1) / total) * 100);

    var inputHtml = '';
    if (q.type === 'choose' && q.options && q.options.length) {
      inputHtml = '<div class="at-options">' +
        q.options.map(function(o, i) {
          return '<button type="button" class="at-opt" data-tt-opt="' + i + '" onclick="ZirakAcademyTests.ttPick(' + i + ')">' + esc(o) + '</button>';
        }).join('') + '</div>';
    } else {
      inputHtml =
        '<input type="text" id="at-input" class="at-input" autocomplete="off" autocapitalize="off" ' +
          'placeholder="Type your answer…" onkeydown="if(event.key===\'Enter\'){ZirakAcademyTests.ttSubmit();}">' +
        '<div class="at-action-row">' +
          '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.ttSubmit()">Check \u2713</button>' +
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.ttSkip()">\u23ED Skip</button>' +
        '</div>';
    }

    body.innerHTML =
      '<div class="at-q-layout">' +
        '<div class="at-q-main">' +
          '<div class="at-progress">' +
            '<div class="at-prog-lbl">Q ' + (idx+1) + ' / ' + total + ' <span class="at-src-badge">' + esc(q.source||'') + '</span>' +
              // I6H-D5A: optional level chip — reuses the existing at-src-badge
              // class (zero new CSS), only shown when blueprint metadata was found.
              (TT.blueprintMeta && TT.blueprintMeta.level ? ' <span class="at-src-badge">' + esc(TT.blueprintMeta.level) + '</span>' : '') +
            '</div>' +
            '<div class="at-prog-bar"><div class="at-prog-fill" style="width:' + pct + '%"></div></div>' +
          '</div>' +
          '<div class="at-card"><div class="at-q-text">' + esc(q.prompt) + '</div>' +
            '<button type="button" class="at-hear-btn" onclick="ZirakAcademyTests.hearQuestion()">\uD83D\uDD0A Hear Question</button>' +
          '</div>' +
          inputHtml +
          '<div id="at-feedback" class="at-feedback" style="display:none;"></div>' +
          '<div class="at-nav">' +
            (idx > 0 ? '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.ttPrev()">\u2190 Prev</button>' : '<span></span>') +
            '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.ttSkip()">\u23ED Skip</button>' +
          '</div>' +
        '</div>' +
        _sideRailHtml(q, idx, total) +
      '</div>';
  }
  function _ttScore(given, ok) {
    TT.scored = true;
    var q = TT.questions[TT.idx];
    TT.results.push({ q: q.prompt, answer: given, correct: q.correct, ok: ok, source: q.source });
    var fb = $id('at-feedback');
    if (fb) {
      fb.className = 'at-feedback ' + (ok ? 'at-fb-ok' : 'at-fb-bad');
      fb.innerHTML =
        '<div class="at-fb-line">' + (ok ? '\u2705 Correct!' : '\u274C Correct: <b>' + esc(q.correct) + '</b>') + '</div>' +
        '<div class="at-action-row" style="margin-top:8px;">' +
          '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.ttAdvance()">' +
            (TT.idx >= TT.questions.length - 1 ? 'Finish \u2713' : 'Next \u2192') +
          '</button>' +
        '</div>';
      fb.style.display = 'block';
      try { fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch(e) {}
    }
    // light TTS feedback
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(ok ? 'Correct!' : 'Not quite. The correct answer is: ' + q.correct);
        u.lang = 'en-US';
        window.speechSynthesis.speak(u);
      }
    } catch(e) {}
  }
  function ttAdvance() {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch(e) {}
    if (TT.idx < TT.questions.length - 1) { TT.idx++; renderTopicQuestion(); }
    else finishTopicTest();
  }
  function ttPrev() { if (TT.idx > 0) { TT.idx--; TT.results.pop(); renderTopicQuestion(); } }

  /* ── Topic test finish + ledger save ─────────────────────────────────── */
  function finishTopicTest() {
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch(e) {}
    var total = TT.results.length || 1;
    var good  = TT.results.filter(function(r) { return r.ok; }).length;
    var pct   = Math.round((good / total) * 100);
    var weak  = TT.results.filter(function(r) { return !r.ok; });
    var status = pct >= 80 ? 'Excellent \u2705' : pct >= 60 ? 'Passed \u2705' : pct >= 40 ? 'Needs Review \uD83D\uDD01' : 'Repeat \u274C';
    var heroBg = pct >= 80 ? 'linear-gradient(135deg,#059669,#10b981)' : pct >= 60 ? 'linear-gradient(135deg,#d97706,#f59e0b)' : pct >= 40 ? 'linear-gradient(135deg,#ea580c,#f97316)' : 'linear-gradient(135deg,#dc2626,#ef4444)';
    var srcLabel = TT.source === 'gl' ? 'grammar-lab-topic-test' : 'grammar-world-topic-test';
    var stableId = srcLabel + '-' + _localDateKey() + '-' + TT.topicId.slice(-20) + '-' + studentId();

    // Upsert in ledger: remove old same-stable, then record fresh
    if (ledger()) {
      try {
        var key = typeof window.ZirakStorageKey === 'function' ? window.ZirakStorageKey('learning_ledger') : null;
        if (key) {
          var raw = localStorage.getItem(key);
          if (raw) {
            var m = JSON.parse(raw);
            var dk = _localDateKey();
            if (m.days && m.days[dk]) m.days[dk] = m.days[dk].filter(function(r) { return r.id !== stableId; });
            localStorage.setItem(key, JSON.stringify(m));
          }
        }
      } catch(e) {}
      ledger().recordActivity({
        id: stableId, source: srcLabel,
        sectionTitle: TT.topicName + ' — Topic Quiz',
        topicTitle: TT.topicName, activityType: 'grammar-topic-test',
        good: good, total: total, pct: pct,
        weakItems: weak.map(function(r) { return r.correct; }),
        reviewItems: TT.results.map(function(r) { return { q: r.q, ok: r.ok, said: r.answer, model: r.correct }; }),
        // I6H-D5A: forward-compatible metadata pass-through. NOTE: the current
        // Learning Ledger recordActivity() builds its record from a fixed
        // field whitelist, so these are not yet persisted — this is future
        // readiness only, harmless today, and needs no ledger schema change
        // to start working once a later phase adds these fields to the ledger.
        branch: (TT.blueprintMeta && TT.blueprintMeta.branch) || '',
        subbranch: (TT.blueprintMeta && TT.blueprintMeta.sub) || '',
        level: (TT.blueprintMeta && TT.blueprintMeta.level) || '',
        testBlueprintKey: (TT.blueprintMeta && TT.blueprintMeta.key) || '',
        // I6H-D6: topicId now also persists — the ledger schema was extended
        // to actually store these fields (previously silently dropped).
        topicId: TT.topicId || ''
      });
    }

    // WhatsApp button — skipLedger because we just saved manually
    var waHtml = '';
    if (window.ZirakResultProof && window.ZirakResultProof.renderButtonHtml) {
      waHtml = window.ZirakResultProof.renderButtonHtml(TT.topicName + ' Topic Quiz', good, total, { skipLedger: true });
    }

    var reviewHtml = TT.results.map(function(r, i) {
      return '<div class="at-rev-row ' + (r.ok ? 'at-rev-ok' : 'at-rev-bad') + '">' +
        '<div class="at-rev-q">' + (r.ok ? '\u2705' : '\u274C') + ' <b>' + (i+1) + '.</b> ' + esc((r.q||'').slice(0,120)) + '</div>' +
        (r.ok ? '' : '<div class="at-rev-ans">Correct: ' + esc(r.correct) + '</div>') +
        (r.answer && r.answer !== '(skipped)' ? '<div class="at-rev-said">You: ' + esc(String(r.answer).slice(0,80)) + '</div>' : '') +
      '</div>';
    }).join('');

    var body = $id('at-body'); if (!body) return;
    body.innerHTML =
      '<div class="at-result">' +
        '<div class="at-hero" style="background:' + heroBg + ';">' +
          '<div class="at-hero-status">' + esc(status) + '</div>' +
          '<div class="at-hero-ring">' + pct + '<span class="at-hero-pct">%</span></div>' +
          '<div class="at-hero-score">' + good + ' / ' + total + ' correct</div>' +
          '<div class="at-hero-label">' + esc(TT.topicName) + '</div>' +
        '</div>' +
        waHtml +
        '<div class="at-sec-lbl">\uD83D\uDCDD Review</div>' +
        '<div class="at-rev-list">' + reviewHtml + '</div>' +
        (weak.length ? '<div class="at-sec-lbl">\uD83D\uDD01 Weak Items</div><div class="at-weak-list">' +
          weak.map(function(r) { return '<div class="at-weak-item">\u2022 ' + esc(r.correct) + '</div>'; }).join('') + '</div>' :
          '<div class="at-noweak" style="padding:8px 0;">\u2705 No weak items!</div>') +
        '<div class="at-result-btns">' +
          '<button type="button" class="at-btn at-btn-primary" onclick="ZirakAcademyTests.ttRetry()">\uD83D\uDD01 Retry</button>' +
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.openLedger()">\uD83D\uDCD8 Today\'s Record</button>' +
          '<button type="button" class="at-btn at-btn-ghost" onclick="ZirakAcademyTests.close()">\u2190 Exit</button>' +
        '</div>' +
        '<div style="height:24px;"></div>' +
      '</div>';

    try {
      var spoken = TT.topicName + ' Topic Quiz complete. Score: ' + pct + ' percent. ' + (weak.length ? weak.length + ' weak item' + (weak.length===1?'':'s') + '.' : 'No weak items. Excellent!');
      if (window.speechSynthesis) { window.speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(spoken); u.lang='en-US'; window.speechSynthesis.speak(u); }
    } catch(e) {}
  }
  function _showTopicNotEnough(name) {
    var old = $id('at-overlay'); if (old) old.remove();
    var ov = document.createElement('div'); ov.id = 'at-overlay'; ov.className = 'at-overlay';
    ov.innerHTML =
      '<div class="at-panel"><div class="at-head"><button type="button" class="at-close" onclick="ZirakAcademyTests.close()">\u2715</button>' +
      '<div class="at-head-center"><span>\uD83E\uDDEA</span><span>' + esc(name) + '</span></div><div style="width:64px;"></div></div>' +
      '<div class="at-body" style="padding:24px;text-align:center;"><div style="font-size:36px;margin-bottom:12px;">\uD83D\uDCDA</div>' +
      '<div style="font-size:15px;font-weight:800;margin-bottom:8px;">Not enough content for a test.</div>' +
      '<div style="font-size:13px;color:var(--text-muted);">This topic may have limited test items. Try the Auto-Wizard Practice first.</div>' +
      '<button type="button" class="at-btn at-btn-ghost" style="margin-top:20px;" onclick="ZirakAcademyTests.close()">\u2190 Back</button>' +
      '</div></div>';
    (document.getElementById('app')||document.body).appendChild(ov);
  }

  /* ── I6H-D11B: Home placement onboarding card ─────────────────────────
     A real Home-screen card (not only inside Assessments & Progress) for
     new or unplaced students. States:
       A  no test, no level           -> Take Placement Test / Choose Manually
       B  result exists, not accepted -> show recommendation + Accept
       C  accepted from placement     -> card hidden (level line shown)
       D  teacher/manual level        -> card hidden (level line shown)
       E  retake pending              -> new recommendation, keep current until accepted
     The card disappears ONLY after a level is accepted / chosen / confirmed. */
  /* I6H-D12A Task 10/23: Accept routes through the ONE Placement Engine
     acceptance path (acceptRecommendation), which resolves the correct
     result by stable resultId — never window.acceptPlacement() called
     blind from Home (that bypassed decision resolution entirely). */
  function acceptRecommendedLevel(){
    _closeOverlay();
    try {
      if (window.ZirakPlacementEngine && typeof window.ZirakPlacementEngine.acceptRecommendation === 'function') {
        var ok = window.ZirakPlacementEngine.acceptRecommendation();
        if (!ok) goPlacement();
      } else {
        goPlacement();
      }
      refreshPlacementOnboardingCard();
      refreshHomeCard();
    } catch(e){}
  }
  function goManualLevel(){
    _closeOverlay();
    // The existing approved manual flow IS the School Path class list —
    // no second level picker is created.
    try {
      if (typeof window.navigate === 'function') window.navigate('path');
      if (typeof window.showSchoolTab === 'function') window.showSchoolTab('path');
    } catch(e){}
  }
  /* I6H-D12A Task 23: ONE coherent Home card per render, states A-J. */
  function refreshPlacementOnboardingCard(){
    var slot = document.getElementById('home-placement-onboarding-card');
    if (!slot) return;
    var ps;
    try { ps = getPlacementState(); } catch(e){ slot.style.display='none'; return; }
    var hasStudent = false;
    try { hasStudent = !!(window.ZirakProfile && window.ZirakProfile.currentStudent && window.ZirakProfile.currentStudent()); } catch(e){}
    if (!hasStudent) { slot.style.display='none'; slot.innerHTML=''; return; }

    function lvlLabel(id){
      try {
        var cls = (window.SCHOOL_PATH||[]).find(function(c){ return c.id===id; });
        return cls ? cls.en : id;
      } catch(e){ return id; }
    }
    var srcLabel = ps.levelSource === 'placement' ? 'Recommended by Placement Test'
      : ps.levelSource === 'teacher' ? 'Confirmed by Teacher'
      : ps.levelSource === 'manual' ? 'Selected Manually' : '';

    var startMode = ps.startMode || 'first';
    var latest = null;
    try { if (window.ZirakPlacementEngine && window.ZirakPlacementEngine.getResult) latest = window.ZirakPlacementEngine.getResult(); } catch(e){}
    slot.style.display = 'block';

    if (startMode === 'continueFirst' || startMode === 'continueRetake') {
      // States B / H: a session (first test or retake) is in progress.
      var n = 0, isRetakeSession = startMode === 'continueRetake';
      try { n = (window.ZirakPlacementEngine.getSession() && window.ZirakPlacementEngine.getSession().responses || []).length; } catch(e){}
      slot.innerHTML = isRetakeSession
        ? ('<div class="zk-onboard-card">' +
            '<div class="zk-onboard-title">\uD83D\uDD01 Placement Retake in Progress</div>' +
            '<div class="zk-onboard-sub">Current accepted level remains <b>' + esc(lvlLabel(ps.currentLevel)) + '</b>. ' + n + ' answers saved.</div>' +
            '<div class="zk-onboard-actions"><button type="button" class="zk-onboard-btn zk-onboard-primary" onclick="ZirakAcademyTests.goPlacement()">\u25B6 Continue Placement Retake</button></div>' +
          '</div>')
        : ('<div class="zk-onboard-card">' +
            '<div class="zk-onboard-title">\u23F3 Placement Test in Progress</div>' +
            '<div class="zk-onboard-sub">' + n + ' answers saved \u2014 continue where you stopped.</div>' +
            '<div class="zk-onboard-actions"><button type="button" class="zk-onboard-btn zk-onboard-primary" onclick="ZirakAcademyTests.goPlacement()">\u25B6 Continue Placement Test</button></div>' +
          '</div>');
      return;
    }
    if (startMode === 'pendingDecision' && !ps.placed) {
      // State C: first result completed, unresolved, never placed.
      slot.innerHTML =
        '<div class="zk-onboard-card">' +
          '<div class="zk-onboard-title">\uD83D\uDCCB Placement Test Complete</div>' +
          '<div class="zk-onboard-sub">Recommended Level: <b>' + esc(lvlLabel(latest ? latest.diagnostic.recommendedLevel : ps.recommendedLevel)) + '</b></div>' +
          '<div class="zk-onboard-actions">' +
            '<button type="button" class="zk-onboard-btn zk-onboard-primary" onclick="ZirakAcademyTests.acceptRecommendedLevel()">\u2705 Accept Recommendation</button>' +
            '<button type="button" class="zk-onboard-btn" onclick="(navigate(\'path\'),showSchoolTab(\'placement\'),window.ZirakPlacementEngine&&window.ZirakPlacementEngine.requestTeacherReview&&window.ZirakPlacementEngine.requestTeacherReview())">\uD83D\uDC69\u200D\uD83C\uDFEB Ask Teacher</button>' +
            '<button type="button" class="zk-onboard-btn" onclick="ZirakAcademyTests.goManualLevel()">Choose Another Level</button>' +
          '</div>' +
        '</div>';
      return;
    }
    if (ps.retakeDecisionState === 'pending') {
      // State I: a NEW retake recommendation is pending — current level untouched.
      slot.innerHTML =
        '<div class="zk-onboard-card">' +
          '<div class="zk-onboard-title">\uD83D\uDD04 New Placement Recommendation Available</div>' +
          '<div class="zk-onboard-sub">Current level remains unchanged (<b>' + esc(lvlLabel(ps.currentLevel)) + '</b>) until approved. New recommendation: <b>' + esc(lvlLabel(latest ? latest.diagnostic.recommendedLevel : ps.recommendedLevel)) + '</b>.</div>' +
          '<div class="zk-onboard-actions">' +
            '<button type="button" class="zk-onboard-btn zk-onboard-primary" onclick="ZirakAcademyTests.acceptRecommendedLevel()">\u2705 Accept New Level</button>' +
            '<button type="button" class="zk-onboard-btn" onclick="(navigate(\'path\'),showSchoolTab(\'placement\'),window.ZirakPlacementEngine&&window.ZirakPlacementEngine.requestTeacherReview&&window.ZirakPlacementEngine.requestTeacherReview())">\uD83D\uDC69\u200D\uD83C\uDFEB Ask Teacher to Review</button>' +
          '</div>' +
        '</div>';
      return;
    }
    if (ps.retakeDecisionState === 'existingLevelKept') {
      // State J: teacher reviewed the retake and kept the existing level.
      slot.innerHTML =
        '<div class="zk-level-line">\uD83C\uDF93 Current Level: <b>' + esc(lvlLabel(ps.currentLevel)) + '</b>' +
        '<div class="zk-onboard-sub" style="margin-top:6px;">Teacher reviewed the latest Placement result and kept the existing level.</div></div>';
      return;
    }
    if (ps.retakeDecisionState === 'retestRequested') {
      slot.innerHTML =
        '<div class="zk-onboard-card">' +
          '<div class="zk-onboard-title">\uD83D\uDD01 Placement Retest Requested</div>' +
          '<div class="zk-onboard-sub">Current level remains <b>' + esc(lvlLabel(ps.currentLevel)) + '</b>.</div>' +
          '<div class="zk-onboard-actions"><button type="button" class="zk-onboard-btn zk-onboard-primary" onclick="ZirakAcademyTests.goPlacement()">\u25B6 Start Retest</button></div>' +
        '</div>';
      return;
    }
    if (ps.placed) {
      // States D / E / F: onboarding is done — slim current-level line.
      slot.innerHTML =
        '<div class="zk-level-line">\uD83C\uDF93 Current Level: <b>' + esc(lvlLabel(ps.currentLevel)) + '</b>' +
        (srcLabel ? ' <span class="zk-level-src">\u00b7 ' + esc(srcLabel) + '</span>' : '') + '</div>';
      return;
    }
    if (ps.placementTestCompleted && !ps.placementAccepted) {
      // Legacy fallback (pre-engine result without the new decision state).
      slot.innerHTML =
        '<div class="zk-onboard-card">' +
          '<div class="zk-onboard-title">\uD83D\uDCCB Placement Test Completed</div>' +
          '<div class="zk-onboard-sub">Recommended Level: <b>' + esc(lvlLabel(ps.recommendedLevel)) + '</b></div>' +
          '<div class="zk-onboard-actions">' +
            '<button type="button" class="zk-onboard-btn zk-onboard-primary" onclick="ZirakAcademyTests.acceptRecommendedLevel()">\u2705 Accept Recommended Level</button>' +
            '<button type="button" class="zk-onboard-btn" onclick="ZirakAcademyTests.goManualLevel()">Choose Another Level</button>' +
          '</div>' +
        '</div>';
      return;
    }
    // State A: brand new — no test, no level.
    slot.innerHTML =
      '<div class="zk-onboard-card">' +
        '<div class="zk-onboard-title">\uD83C\uDF93 Choose Your Starting Level</div>' +
        '<div class="zk-onboard-sub">Take the Placement Test to receive a recommended level, or choose a level manually with teacher guidance.</div>' +
        '<div class="zk-onboard-ps dari">\u062f \u067e\u06cc\u0644 \u06a9\u067c\u0647 \u0648\u067c\u0627\u06a9\u0626 \u2014 \u062f \u06a9\u0686\u06d0 \u0627\u0632\u0645\u0648\u06cc\u0646\u0647 \u0648\u06a9\u0693\u0626 \u06cc\u0627 \u062f \u069a\u0648\u0648\u0646\u06a9\u064a \u067e\u0647 \u0645\u0631\u0633\u062a\u0647 \u06a9\u0686\u0647 \u0648\u067c\u0627\u06a9\u0626.</div>' +
        '<div class="zk-onboard-actions">' +
          '<button type="button" class="zk-onboard-btn zk-onboard-primary" onclick="ZirakAcademyTests.goPlacement()">\uD83D\uDCCB Take Placement Test</button>' +
          '<button type="button" class="zk-onboard-btn" onclick="ZirakAcademyTests.goManualLevel()">Choose Level Manually</button>' +
        '</div>' +
      '</div>';
  }

  /* ── Home card for Daily Learning Review ───────────────────────────────── */
  function initHomeCard() {
    var slot = document.getElementById('home-daily-test-card');
    if (slot) refreshHomeCard();
    // I6H-D11B: placement onboarding renders with the same lifecycle.
    refreshPlacementOnboardingCard();
  }
  function refreshHomeCard() {
    var slot = document.getElementById('home-daily-test-card');
    if (!slot) return;
    var info = null; try { info = cal() ? cal().todayInfo() : null; } catch(e) {}
    var label = info ? info.label : 'Today';
    var isStudy = info ? info.isStudyDay : true;
    var recs = getTodayRecords().filter(function(r) { return r.source !== 'academy-daily-test'; });
    var testRec = getTodayRecords().find(function(r) { return r.source === 'academy-daily-test'; }) || null;
    var hdtTestable = buildDailyTest(recs).length;
    var canTest = recs.length > 0 && hdtTestable >= 3;
    var done = !!testRec;

    // I6H-D11A (review claim 1 — CONFIRMED): this card was the exact
    // screenshot problem — "Practice first" + dead grey button, no count,
    // no way forward. Now: real progress count and a WORKING Learn action.
    // I6H-D11B: the counter counts TESTABLE REVIEW ITEMS (questions built
    // from today's learning), NOT separate learning activities — the wording
    // now says exactly that.
    var statusHtml = done
      ? '<span class="hdt-chip hdt-chip-done">\u2705 Done \u2014 ' + testRec.pct + '%</span>'
      : canTest
        ? '<span class="hdt-chip hdt-chip-ready">\uD83D\uDFE2 Ready \u2014 ' + hdtTestable + ' review items available</span>'
        : '<span class="hdt-chip hdt-chip-wait">\u23F3 Not yet available \u2014 ' + hdtTestable + ' of 3 review items ready</span>';
    var hdtCanNav = typeof window.navigate === 'function';

    slot.style.display = 'block';
    slot.innerHTML =
      '<div class="hdt-card">' +
        '<div class="hdt-row">' +
          '<div class="hdt-left">' +
            '<div class="hdt-title">\uD83C\uDF93 Daily Learning Review</div>' +
            '<div class="hdt-label">' + esc(label) + '</div>' +
            '<div class="hdt-info">' + statusHtml + '</div>' +
            (canTest || done ? '' : '<div class="hdt-info" style="opacity:.8;">Complete enough learning to create at least 3 testable review items.</div>') +
          '</div>' +
          '<div class="hdt-right">' +
            (canTest
              ? '<button type="button" class="hdt-btn" onclick="ZirakAcademyTests.home()">' + (done ? '\uD83D\uDD01 Retake' : '\uD83C\uDF93 Start') + '</button>'
              : hdtCanNav
                ? '<button type="button" class="hdt-btn" onclick="ZirakAcademyTests.goLearn()">\uD83D\uDCDA Learn</button>'
                : '<button type="button" class="hdt-btn" disabled style="opacity:.45;cursor:not-allowed;">\uD83C\uDF93 Start</button>') +
          '</div>' +
        '</div>' +
      '</div>';
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(initHomeCard, 800); });
  } else {
    setTimeout(initHomeCard, 800);
  }


    var ZirakAcademyTests = {
    home:        renderHome,
    // I6H-D11B: placement onboarding
    acceptRecommendedLevel: acceptRecommendedLevel,
    goManualLevel: goManualLevel,
    refreshPlacementOnboardingCard: refreshPlacementOnboardingCard,
    getPlacementState: getPlacementState,
    // I6H-D11A: central display-terminology helpers (review claim 6).
    // Other modules use these for student-facing names — storage keys stay
    // frozen and are NEVER derived from these.
    getAssessmentName: function(key, lang){
      var n = ASSESSMENT_NAMES[key]; if (!n) return '';
      return lang === 'ps' ? n.ps : n.en;
    },
    getAssessmentActionLabel: function(key, kind){
      var n = ASSESSMENT_NAMES[key]; if (!n) return '';
      return (kind === 'retake' ? '\uD83D\uDD01 Retake ' : n.icon + ' Start ') + n.en;
    },
    goLearn: goLearn,
    goPlacement: goPlacement,
    start:       startDailyTest,
    pick:        pick,
    submit:      submit,
    skipQ:       skipQ,
    advance:     advance,
    prev:        prev,
    retry:       startDailyTest,
    close:       function(){ var o=$id('at-overlay'); if(o) o.remove(); try{window.speechSynthesis&&window.speechSynthesis.cancel();}catch(e){} },
    // I6H-D9A: Guide + read-aloud help — guide-text-only TTS, never touches
    // question TTS (getQuestionSpeechText) or any grading/mic path.
    openGuide: openGuide,
    closeGuide: closeGuide,
    readGuideAloud: readGuideAloud,
    stopGuideReading: stopGuideReading,
    // I6H-D3: manual replay for cross-device audio reliability — some mobile
    // browsers (notably iPad Safari) block SpeechSynthesis until a user
    // gesture has explicitly triggered audio at least once. Works for both
    // Daily Test (AT.questions) and Topic Quiz (TT.questions).
    // I6H-D3A FIX: routed through getQuestionSpeechText() — never speaks
    // raw q.prompt directly, so Pashto can never reach SpeechSynthesisUtterance.
    hearQuestion: function(){
      var q = _activeEngine === 'topic'
        ? (TT.questions && TT.questions[TT.idx])
        : (AT.questions && AT.questions[AT.idx]);
      if(!q) return;
      try{
        if(window.speechSynthesis){
          window.speechSynthesis.cancel();
          var text = getQuestionSpeechText(q);
          if(!text) return;
          var u = new SpeechSynthesisUtterance(text);
          u.lang='en-US'; u.rate=(window.state&&state.speechRate)?state.speechRate:0.9;
          window.speechSynthesis.speak(u);
        }
      }catch(e){}
    },
    // Topic Quiz public methods (I6H-D2)
    startTopicTest: startTopicTest,
    ttPick:    function(i){ if(!TT.scored){var q=TT.questions[TT.idx];if(!q)return;var ch=(q.options||[])[i]||'';var ok=norm(ch)===norm(q.correct);_ttScore(ch,ok);document.querySelectorAll('.at-opt').forEach(function(b,bi){b.onclick=null;b.style.pointerEvents='none';if(norm((q.options||[])[bi])===norm(q.correct))b.classList.add('at-opt-ok');else if(bi===i&&!ok)b.classList.add('at-opt-bad');});}},
    ttSubmit:  function(){ if(TT.scored)return;var q=TT.questions[TT.idx];if(!q)return;var inp=$id('at-input'),v=inp?inp.value.trim():'';var ok=gradeAnswer(v,q).ok;_ttScore(v,ok);},
    ttSkip:    function(){ if(TT.scored){ttAdvance();}else{_ttScore('(skipped)',false);}},
    ttAdvance: ttAdvance,
    ttPrev:    ttPrev,
    ttRetry:   function(){ startTopicTest(TT.source, TT.topicId); },
    buildTopicTest: buildTopicTest,
    // I6H-D6: exposed for future Weekly/Two-Week/Monthly phases to reuse —
    // all local/offline/deterministic, no new engine, no AI dependency.
    groupRecordsBySection: groupRecordsBySection,
    summarizeSectionScores: summarizeSectionScores,
    groupResultsByLevelBranch: groupResultsByLevelBranch,
    buildWeakRecoveryGroups: buildWeakRecoveryGroups,
    buildReadinessSnapshot: buildReadinessSnapshot,
    selectBalancedDailyQuestions: selectBalancedDailyQuestions,
    // I6H-D7: Weekly Progress Test — same shell/render/score/advance as
    // Daily (testType dispatch), plus its own generation/finish/save.
    startWeekly: startWeeklyTest,
    retryWeekly: startWeeklyTest,
    isWeeklyTestReady: isWeeklyTestReady,
    // I6H-D14C: pure, student-agnostic rule helpers — depend only on
    // their arguments, never the active Learning Ledger.
    findWeeklyTestRecordInRecords: findWeeklyTestRecordInRecords,
    findTwoWeekReviewRecordInRecords: findTwoWeekReviewRecordInRecords,
    findMonthlyExamRecordInRecords: findMonthlyExamRecordInRecords,
    isWeeklyTestReadyFromRecords: isWeeklyTestReadyFromRecords,
    isTwoWeekReviewReadyFromRecords: isTwoWeekReviewReadyFromRecords,
    isMonthlyExamReadyFromRecords: isMonthlyExamReadyFromRecords,
    findWeeklyTestRecord: findWeeklyTestRecord,
    buildWeeklyQuestionPool: buildWeeklyQuestionPool,
    buildWeeklyLearningSummary: buildWeeklyLearningSummary,
    selectBalancedWeeklyQuestions: selectBalancedWeeklyQuestions,
    // I6H-D8: Two-Week Progress Review — same shell/render/score/advance dispatch
    // (testType:'twoWeek'), plus its own generation/finish/save/detection.
    startTwoWeek: startTwoWeekReview,
    retryTwoWeek: startTwoWeekReview,
    isTwoWeekReviewReady: isTwoWeekReviewReady,
    findTwoWeekReviewRecord: findTwoWeekReviewRecord,
    buildTwoWeekQuestionPool: buildTwoWeekQuestionPool,
    buildTwoWeekLearningSummary: buildTwoWeekLearningSummary,
    selectBalancedTwoWeekQuestions: selectBalancedTwoWeekQuestions,
    // I6H-D9: Monthly Progress Exam — same shell/render/score/advance
    // dispatch (testType:'monthly'), plus its own generation/finish/save/detection.
    startMonthly: startMonthlyExam,
    retryMonthly: startMonthlyExam,
    isMonthlyExamReady: isMonthlyExamReady,
    findMonthlyExamRecord: findMonthlyExamRecord,
    buildMonthlyQuestionPool: buildMonthlyQuestionPool,
    buildMonthlyLearningSummary: buildMonthlyLearningSummary,
    selectBalancedMonthlyQuestions: selectBalancedMonthlyQuestions,
    refreshHomeCard: refreshHomeCard,
    openLedger:  function(){ var o=$id('at-overlay'); if(o) o.remove(); if(window.ZirakLearningLedger) window.ZirakLearningLedger.openTodayScreen(); },
    buildDailyTest: buildDailyTest,
    getTodayRecords: getTodayRecords,
    // ═══════════════════════════════════════════════════════════════
    // I6H-D14B — explicit-student assessment authority.
    //
    // The Teacher Command Center calls this to get the SELECTED
    // student's real assessment readiness without activating that
    // student. It reuses the same Calendar windows and readiness rules
    // that the active-student Home card uses (isWeeklyTestReady,
    // isTwoWeekReviewReady, isMonthlyExamReady, and the Daily rule
    // "recs.length > 0 && buildDailyTest(recs).length >= 3") — read
    // directly from this file. D14B does not maintain any duplicate
    // rules in the Teacher Command Center.
    // ═══════════════════════════════════════════════════════════════
    getStudentAssessmentState: getStudentAssessmentState
  };

  function _readStudentLedgerRaw(studentId) {
    // Read that student's Learning Ledger directly by their storage
    // key. Never activates the student. Returns a plain records array.
    try {
      var raw = localStorage.getItem('u_' + studentId + '_learning_ledger');
      if (!raw) return [];
      var model = JSON.parse(raw);
      if (!model || !model.days) return [];
      var out = [];
      Object.keys(model.days).forEach(function (k) {
        var arr = model.days[k]; if (arr && arr.length) out = out.concat(arr);
      });
      return out;
    } catch (e) { return []; }
  }
  function _filterByKeys(records, keys) {
    if (!keys || !keys.length) return [];
    var set = {}; keys.forEach(function (k) { set[k] = true; });
    return records.filter(function (r) { return r && set[r.dateKey]; });
  }
  function _filterOutAdministrative(records) {
    return records.filter(function (r) {
      return r && r.source !== 'academy-certificate' && r.source !== 'academy-report-card' && r.source !== 'personal-learning-plan' && r.source !== 'academy-placement-test';
    });
  }
  // I6H-D14C — real finalized-report linkage. Matches the ACTUAL schema
  // written by ZirakAchievementCenter's buildReportSnapshotFromLive():
  // { reportId, stableRecordId, linkedMonthlyExamId, monthStartDateKey,
  //   monthEndDateKey, monthlyLabel, score, total, percent, ... }.
  // There is only ONE report-snapshot builder in the whole app and it is
  // Monthly-only — Weekly and Two-Week assessments have NO genuine
  // archived report, so this function is intentionally Monthly-only.
  // Matching priority (strongest identity first):
  //   1. linkedMonthlyExamId === the completed Monthly Exam record's id
  //   2. exact monthStartDateKey match
  //   3. the stable reportId convention itself: 'academy-report-card-'+monthStartDateKey+'-'+studentId
  //   4. legacy fallback: any archived report for this student with no
  //      monthStartDateKey recorded (pre-Calendar-era snapshot) — best
  //      effort only, never fabricated.
  function _findArchivedMonthlyReportId(studentId, monthlyExamRecordId, monthStartDateKey) {
    try {
      if (!window.ZirakAchievementCenter || typeof window.ZirakAchievementCenter.getArchivedReportsFor !== 'function') return '';
      var reports = window.ZirakAchievementCenter.getArchivedReportsFor(studentId) || [];
      if (!reports.length) return '';
      if (monthlyExamRecordId) {
        var byExamId = reports.find(function (rep) { return rep && rep.linkedMonthlyExamId === monthlyExamRecordId; });
        if (byExamId) return byExamId.reportId || byExamId.stableRecordId || '';
      }
      if (monthStartDateKey) {
        var byMonth = reports.find(function (rep) { return rep && rep.monthStartDateKey === monthStartDateKey; });
        if (byMonth) return byMonth.reportId || byMonth.stableRecordId || '';
        var expectedId = 'academy-report-card-' + monthStartDateKey + '-' + studentId;
        var byStableId = reports.find(function (rep) { return rep && (rep.reportId === expectedId || rep.stableRecordId === expectedId); });
        if (byStableId) return byStableId.reportId || byStableId.stableRecordId || '';
      }
      return '';
    } catch (e) { return ''; }
  }

  function getStudentAssessmentState(studentId) {
    if (!studentId) return null;
    var allRecords = _readStudentLedgerRaw(studentId);
    var todayKey = (typeof window.ZirakInstituteCalendar !== 'undefined' && window.ZirakInstituteCalendar.todayInfo) ? window.ZirakInstituteCalendar.todayInfo().dateKey : (new Date()).toISOString().slice(0, 10);
    var cal = window.ZirakInstituteCalendar;

    // ── Daily Review (uses buildDailyTest testable-item rule) ────────
    var todayRecords = allRecords.filter(function (r) { return r.dateKey === todayKey && r.source !== 'academy-placement-test' && r.source !== 'personal-learning-plan'; });
    var todayNonDaily = todayRecords.filter(function (r) { return r.source !== 'academy-daily-test'; });
    var testableItemCount = 0;
    try { testableItemCount = buildDailyTest(todayNonDaily).length; } catch (e) { testableItemCount = 0; }
    var todayDaily = todayRecords.filter(function (r) { return r.source === 'academy-daily-test'; })[0] || null;
    var dailyReady = todayNonDaily.length > 0 && testableItemCount >= 3;
    var daily = {
      testableItemCount: testableItemCount,
      minimumRequired: 3,
      ready: !todayDaily && dailyReady,
      completed: !!todayDaily,
      retakeAvailable: !!todayDaily, // Academy allows retake once completed today
      status: todayDaily ? 'Completed' : (testableItemCount === 0 ? 'No Learning Yet' : (dailyReady ? 'Ready' : 'Not Yet Available')),
      reason: todayDaily ? 'Today\u2019s Daily Learning Review is completed. Retake Available.' : (testableItemCount === 0 ? 'No learning yet today (0 of 3 testable items).' : (dailyReady ? ('Ready \u2014 ' + testableItemCount + ' testable review items today.') : ('Not Yet Available \u2014 ' + testableItemCount + ' of 3 testable review items needed.'))),
      recordId: todayDaily ? (todayDaily.id || '') : ''
    };

    // ── Weekly Progress Test (uses real Academy Week range) ─────────
    var weekRange = null;
    try { if (cal && cal.getAcademyWeekRange) weekRange = cal.getAcademyWeekRange(); } catch (e) {}
    var weekRecs = weekRange ? _filterByKeys(allRecords, weekRange.studyDateKeys) : [];
    var weekRecsForReadiness = _filterOutAdministrative(weekRecs);
    var weeklyDone = findWeeklyTestRecordInRecords(weekRecs, weekRange);
    var weeklyReady = false;
    try { weeklyReady = isWeeklyTestReadyFromRecords(weekRecsForReadiness); } catch (e) {}
    // I6H-D14C (Task 12): Weekly Progress Test has NO genuine archived
    // report — there is only ONE report-snapshot builder in the app and
    // it is Monthly-only. Never invent a finalizedReportId here; the
    // completed record itself is shown via "View Assessment Result".
    var weeklyFinalizedReportId = '';
    var weekly = {
      range: weekRange ? { start: weekRange.weekStartDateKey, end: weekRange.weekEndDateKey, label: weekRange.weekLabel, studyDateKeys: weekRange.studyDateKeys } : null,
      ready: !weeklyDone && weeklyReady,
      completed: !!weeklyDone,
      retakeAvailable: !!weeklyDone,
      status: weeklyDone ? 'Completed' : (weeklyReady ? 'Ready' : (weekRecsForReadiness.length ? 'Not Ready Yet' : 'Data Limited')),
      reason: weeklyDone ? 'Weekly Progress Test completed in the current Academy Week.' : (weeklyReady ? 'Ready \u2014 sufficient learning evidence in the current Academy Week.' : (weekRecsForReadiness.length ? ('Not Ready Yet \u2014 need study days\u2265\u00a03 OR daily tests\u2265\u00a02 OR records\u2265\u00a05 in the current Academy Week. Current: records=' + weekRecsForReadiness.length + '.') : 'Data Limited \u2014 no learning records in the current Academy Week yet.')),
      recordId: weeklyDone ? (weeklyDone.id || '') : '',
      finalizedReportId: weeklyFinalizedReportId
    };

    // ── Two-Week Progress Review (real Academy Two-Week range) ─────
    var twoWeekRange = null;
    try { if (cal && cal.getAcademyTwoWeekRange) twoWeekRange = cal.getAcademyTwoWeekRange(); } catch (e) {}
    var twoWkRecs = twoWeekRange ? _filterByKeys(allRecords, twoWeekRange.studyDateKeys) : [];
    var twoWkRecsForReadiness = _filterOutAdministrative(twoWkRecs);
    var twoWkDone = findTwoWeekReviewRecordInRecords(twoWkRecs, twoWeekRange);
    var twoWkReady = false;
    try { twoWkReady = isTwoWeekReviewReadyFromRecords(twoWkRecsForReadiness, twoWeekRange); } catch (e) {}
    // I6H-D14C (Task 12): Two-Week Progress Review also has NO genuine
    // archived report — see the Weekly comment above.
    var twoWkFinalizedReportId = '';
    var twoWeek = {
      range: twoWeekRange ? { start: twoWeekRange.rangeStartDateKey, end: twoWeekRange.rangeEndDateKey, label: twoWeekRange.twoWeekLabel, studyDateKeys: twoWeekRange.studyDateKeys } : null,
      ready: !twoWkDone && twoWkReady,
      completed: !!twoWkDone,
      retakeAvailable: !!twoWkDone,
      status: twoWkDone ? 'Completed' : (twoWkReady ? 'Ready' : (twoWkRecsForReadiness.length ? 'Not Ready Yet' : 'Data Limited')),
      reason: twoWkDone ? 'Two-Week Progress Review completed in the current two-week block.' : (twoWkReady ? 'Ready \u2014 sufficient learning evidence in the current two-week block.' : (twoWkRecsForReadiness.length ? ('Not Ready Yet \u2014 need study days\u2265\u00a06 OR (weekly\u22651 AND study\u22655) OR weekly\u22652 OR records\u226512 in the current block. Current: records=' + twoWkRecsForReadiness.length + '.') : 'Data Limited \u2014 no learning records in the current two-week block yet.')),
      recordId: twoWkDone ? (twoWkDone.id || '') : '',
      finalizedReportId: twoWkFinalizedReportId
    };

    // ── Monthly Progress Exam (real Academy Month range) ────────────
    var monthlyRange = null;
    try { if (cal && cal.getAcademyMonthlyRange) monthlyRange = cal.getAcademyMonthlyRange(); } catch (e) {}
    var monRecs = monthlyRange ? _filterByKeys(allRecords, monthlyRange.studyDateKeys) : [];
    var monRecsForReadiness = _filterOutAdministrative(monRecs);
    var monthlyDone = findMonthlyExamRecordInRecords(monRecs, monthlyRange);
    var monReady = false;
    try { monReady = isMonthlyExamReadyFromRecords(monRecsForReadiness, monthlyRange); } catch (e) {}
    var monFinalizedReportId = monthlyDone ? _findArchivedMonthlyReportId(studentId, monthlyDone.id, monthlyRange && monthlyRange.monthStartDateKey) : '';
    var monthly = {
      range: monthlyRange ? { start: monthlyRange.monthStartDateKey, end: monthlyRange.monthEndDateKey, label: monthlyRange.monthlyLabel, studyDateKeys: monthlyRange.studyDateKeys } : null,
      ready: !monthlyDone && monReady,
      completed: !!monthlyDone,
      retakeAvailable: !!monthlyDone,
      status: monthlyDone ? 'Completed' : (monReady ? 'Ready' : (monRecsForReadiness.length ? 'Not Ready Yet' : 'Data Limited')),
      reason: monthlyDone ? 'Monthly Progress Exam completed in the current Academy Month.' : (monReady ? 'Ready \u2014 sufficient learning evidence in the current Academy Month.' : (monRecsForReadiness.length ? ('Not Ready Yet \u2014 need study\u226514 OR (weekly\u22652 AND study\u226510) OR (twoWk\u22651 AND study\u226510) OR twoWk\u22652 OR records\u226525 in the current Month. Current: records=' + monRecsForReadiness.length + '.') : 'Data Limited \u2014 no learning records in the current Academy Month yet.')),
      recordId: monthlyDone ? (monthlyDone.id || '') : '',
      finalizedReportId: monFinalizedReportId
    };

    // ── Totals ──────────────────────────────────────────────────────
    var readyCount = (daily.ready ? 1 : 0) + (weekly.ready ? 1 : 0) + (twoWeek.ready ? 1 : 0) + (monthly.ready ? 1 : 0);
    var latestCompletedAssessmentAt = '';
    [daily, weekly, twoWeek, monthly].forEach(function (s) {
      if (s.completed && s.recordId) {
        var rec = allRecords.find(function (r) { return r.id === s.recordId; });
        var at = rec && rec.timestamp ? new Date(rec.timestamp).toISOString() : '';
        if (at && (!latestCompletedAssessmentAt || at > latestCompletedAssessmentAt)) latestCompletedAssessmentAt = at;
      }
    });

    return { studentId: studentId, daily: daily, weekly: weekly, twoWeek: twoWeek, monthly: monthly, readyCount: readyCount, latestCompletedAssessmentAt: latestCompletedAssessmentAt };
  }
  window.ZirakAcademyTests = ZirakAcademyTests;
})();
