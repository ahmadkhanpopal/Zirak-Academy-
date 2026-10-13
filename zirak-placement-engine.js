// ===================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// zirak-placement-engine.js — Phase I6H-D12A
// Placement Session Continuity + Retake Integrity + Decision Sync +
// Durable History — stabilizes the D12 Professional Adaptive Placement
// Test in place. ONE placement engine, ONE bank, ONE history schema.
// ===================================================================
(function () {
  'use strict';

  var ENGINE_VERSION = 'D12A-1';

  var PLACEMENT_RULES = {
    minimumCoreItems: 32,
    maximumCoreItems: 60,
    minimumItemsPerCoreDomain: 4,
    screeningItems: 20,
    adaptiveMinItems: 18,
    adaptiveMaxItems: 26,
    confirmationItems: 10,
    raiseAfterStrongRun: 2,
    lowerAfterWeakRun: 2,
    highConfidenceThreshold: 0.82,
    mediumConfidenceThreshold: 0.65,
    levelReadinessThreshold: 0.6,
    atLevelThreshold: 0.5,
    criticalDomainFloor: 0.35,
    listeningReplayLimit: 2,
    speakingPrompts: 4
  };
  var DOMAIN_WEIGHTS = { vocab: 0.18, grammar: 0.22, reading: 0.16, listening: 0.16, sentence: 0.16, functional: 0.12 };
  var CORE_DOMAINS = ['vocab', 'grammar', 'reading', 'listening', 'sentence', 'functional'];
  var DOMAIN_LABELS = {
    vocab: 'Vocabulary', grammar: 'Grammar', reading: 'Reading',
    listening: 'Listening', sentence: 'Sentence Construction',
    functional: 'Functional Communication', speaking: 'Speaking Profile'
  };
  var CRITICAL_DOMAINS = ['grammar', 'sentence'];

  var BANDS = ['nursery', 'starter', 'beginner1', 'beginner2', 'elementary', 'preintermediate', 'intermediate', 'advanced'];
  // I6H-D15A (Task 3): Teacher-facing band label disambiguated from the
  // new accepted-class name "Starter" (the diagnostic band literally
  // named "starter" is a SEPARATE concept that maps to accepted class
  // "Basic" — see BAND_TO_CLASS below).
  var BAND_NAMES = {
    nursery: 'Starter Entry Diagnostic Band', starter: 'Starter Diagnostic Band (\u2192 Basic)', beginner1: 'Beginner 1',
    beginner2: 'Beginner 2', elementary: 'Elementary', preintermediate: 'Pre-Intermediate',
    intermediate: 'Intermediate', advanced: 'Advanced'
  };
  // I6H-D15A (Task 3/12): the diagnostic band "nursery" now correctly
  // recommends the FINAL accepted class "starter" (was incorrectly
  // "nursery", an accepted-class ID that no longer exists in
  // production). The diagnostic band "starter" is UNCHANGED — it still
  // maps to accepted class "basic", exactly as before D15A. This is
  // the ONE real Placement Engine authority; ZirakAcademicProgram's own
  // diagnosticBandToAcceptedClass() reproduces this same map read-only
  // for Teacher-report disambiguation, never as a second decision path.
  var BAND_TO_CLASS = {
    nursery: 'starter', starter: 'basic', beginner1: 'beginner', beginner2: 'beginner',
    elementary: 'elementary', preintermediate: 'intermediate', intermediate: 'intermediate',
    advanced: 'advanced'
  };
  var CEILING_CLASS = 'academic';
  function bandName(id) { return BAND_NAMES[id] || id; }
  function classDisplayName(classId) {
    try { var c = (window.SCHOOL_PATH || []).find(function (x) { return x.id === classId; }); return c ? c.en : classId; }
    catch (e) { return classId; }
  }

  function sKey(k) { return (typeof window.ZirakStorageKey === 'function') ? window.ZirakStorageKey(k) : ('zirak_' + k); }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function nsLegacyKey(k) { var ns = (typeof window.__zirakNS === 'function') ? window.__zirakNS() : ''; return 'roshan_' + ns + k; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nowISO() { return new Date().toISOString(); }
  function studentId() { try { var s = window.ZirakProfile && window.ZirakProfile.currentStudent && window.ZirakProfile.currentStudent(); return s ? (s.studentId || '') : ''; } catch (e) { return ''; } }
  function studentName() { try { var s = window.ZirakProfile && window.ZirakProfile.currentStudent && window.ZirakProfile.currentStudent(); return s ? (s.fullName || '') : ''; } catch (e) { return ''; } }
  function getTeacherPinValue() { var v = lsGet('roshan_sys_teacher_pin'); return (v == null || v === '') ? '1234' : String(v); }

  function hashStr(s) { var h = 1779033703 ^ s.length; for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  var MAX_CORRUPT_BACKUPS = 8;
  function backupCorruptValue(backupStorageKey, sourceKey, raw, errorMessage) {
    try {
      var store;
      try { store = JSON.parse(lsGet(backupStorageKey) || 'null'); } catch (e) { store = null; }
      if (!store || !Array.isArray(store.backups)) store = { schemaVersion: 1, backups: [] };
      var already = store.backups.some(function (b) { return b.sourceKey === sourceKey && b.rawValue === raw; });
      if (!already) {
        store.backups.unshift({
          savedAt: nowISO(), sourceKey: sourceKey, rawValue: String(raw == null ? '' : raw).slice(0, 20000),
          errorMessage: String(errorMessage || '').slice(0, 200), appVersion: ENGINE_VERSION,
          bankVersion: (window.ZirakPlacementBank && window.ZirakPlacementBank.version) || ''
        });
        if (store.backups.length > MAX_CORRUPT_BACKUPS) store.backups.length = MAX_CORRUPT_BACKUPS;
        lsSet(backupStorageKey, JSON.stringify(store));
      }
    } catch (e) { }
  }
  function getHistoryCorruptBackups() { try { var s = JSON.parse(lsGet(sKey('placement_history_corrupt_backup')) || 'null'); return (s && s.backups) || []; } catch (e) { return []; } }
  function getSessionCorruptBackups() { try { var s = JSON.parse(lsGet(sKey('placement_session_corrupt_backup')) || 'null'); return (s && s.backups) || []; } catch (e) { return []; } }

  function bandIndex(id) { return BANDS.indexOf(id) + 1; }

  var PL = null;
  var SELECTED_RESULT_ID = null;

  function blankSession() {
    return {
      schemaVersion: 1,
      engineVersion: ENGINE_VERSION,
      bankVersion: (window.ZirakPlacementBank && window.ZirakPlacementBank.version) || '',
      sessionId: 'plses-' + Date.now() + '-' + Math.floor(Math.random() * 1e6),
      studentId: studentId(),
      status: 'active',
      phase: 'screening',
      isRetake: false,
      linkedPreviousResultId: '',
      excludeItemIds: [],
      currentItemId: '',
      currentItemStatus: '',
      currentItemPresentedAt: '',
      currentItemSubmittedAt: '',
      currentDomain: '',
      currentDifficulty: 3,
      administered: [],
      responses: [],
      routeHistory: [],
      domainEvidence: {},
      technicalEvents: [],
      listeningReplays: {},
      listeningUnavailable: false,
      speaking: { status: 'pending', responses: [] },
      strongRun: 0, weakRun: 0,
      screenAnchorQueue: [],
      startedAt: nowISO(), updatedAt: nowISO(), completedAt: '', pausedAt: '',
      elapsedMs: 0, lastResumeAt: nowISO(),
      resultId: '',
      speechSessionToken: 0
    };
  }

  function saveSession() { if (!PL) return; PL.updatedAt = nowISO(); lsSet(sKey('placement_session'), JSON.stringify(PL)); }
  function loadSession() {
    var storageKey = sKey('placement_session');
    var raw = lsGet(storageKey);
    if (!raw) return null;
    var s;
    try { s = JSON.parse(raw); }
    catch (e) { backupCorruptValue(sKey('placement_session_corrupt_backup'), storageKey, raw, e && e.message); return { corrupt: true, backedUp: true }; }
    if (!s || s.schemaVersion !== 1) return { incompatible: true, raw: raw };
    if (s.bankVersion !== ((window.ZirakPlacementBank && window.ZirakPlacementBank.version) || '')) return { incompatible: true, raw: raw, session: s };
    if (s.currentItemStatus === undefined) s.currentItemStatus = s.currentItemId ? 'presented' : '';
    if (s.currentItemPresentedAt === undefined) s.currentItemPresentedAt = '';
    if (s.currentItemSubmittedAt === undefined) s.currentItemSubmittedAt = '';
    if (s.isRetake === undefined) s.isRetake = false;
    if (s.linkedPreviousResultId === undefined) s.linkedPreviousResultId = '';
    if (s.resultId === undefined) s.resultId = '';
    return { session: s };
  }
  function clearSession() { lsDel(sKey('placement_session')); }

  function loadHistory() {
    var storageKey = sKey('placement_history');
    var raw = lsGet(storageKey);
    if (!raw) return { schemaVersion: 1, results: [] };
    try {
      var h = JSON.parse(raw);
      if (!h || !Array.isArray(h.results)) { backupCorruptValue(sKey('placement_history_corrupt_backup'), storageKey, raw, 'not a valid history object'); return { schemaVersion: 1, results: [] }; }
      return h;
    } catch (e) {
      backupCorruptValue(sKey('placement_history_corrupt_backup'), storageKey, raw, e && e.message);
      return { schemaVersion: 1, results: [] };
    }
  }
  function saveHistory(h) { lsSet(sKey('placement_history'), JSON.stringify(h)); }
  function getPlacementHistory() { return loadHistory().results.slice().sort(function (a, b) { return String(b.diagnostic.completedAt).localeCompare(String(a.diagnostic.completedAt)); }); }
  function latestResult() { var r = getPlacementHistory(); return r.length ? r[0] : null; }
  function getResultById(resultId) { if (!resultId) return null; var r = loadHistory().results; for (var i = 0; i < r.length; i++) if (r[i].resultId === resultId) return r[i]; return null; }
  function currentResult(resultId) {
    if (resultId) { var r = getResultById(resultId); if (r) return r; }
    if (SELECTED_RESULT_ID) { var r2 = getResultById(SELECTED_RESULT_ID); if (r2) return r2; }
    return latestResult();
  }
  function getLatestUnresolvedResult() {
    var list = getPlacementHistory();
    for (var i = 0; i < list.length; i++) { var r = list[i]; if (!r.decision || r.decision.decisionStatus === 'pending') return r; }
    return null;
  }

  function bank() { return window.ZirakPlacementBank || { items: [], speaking: [], levels: BANDS, validate: function () { return ['bank missing']; } }; }
  function bankItems() { return bank().items.filter(function (it) { return it.active !== false; }); }
  function itemById(id) { for (var i = 0, a = bank().items; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }

  function logTech(type, detail) { if (!PL) return; PL.technicalEvents.push({ type: type, detail: detail || '', at: nowISO() }); saveSession(); }

  function ensureDomain(d) { PL.domainEvidence[d] = PL.domainEvidence[d] || { byBand: {}, c: 0, t: 0 }; return PL.domainEvidence[d]; }
  function addEvidence(domain, band, correct, partial) {
    var e = ensureDomain(domain); e.byBand[band] = e.byBand[band] || { c: 0, t: 0 };
    var credit = correct ? 1 : (partial || 0);
    e.byBand[band].c += credit; e.byBand[band].t += 1; e.c += credit; e.t += 1;
  }
  function domainPct(d) { var e = PL.domainEvidence[d]; return (e && e.t) ? e.c / e.t : null; }
  function domainPctUpTo(d, bandIdx) {
    var e = PL.domainEvidence[d]; if (!e) return null;
    var c = 0, t = 0;
    for (var b = 1; b <= bandIdx; b++) { var cell = e.byBand[b]; if (cell) { c += cell.c; t += cell.t; } }
    return t > 0 ? c / t : null;
  }
  function bandReadiness(bandIdx) {
    var num = 0, den = 0;
    CORE_DOMAINS.forEach(function (d) {
      var e = PL.domainEvidence[d]; if (!e) return;
      for (var b = 1; b <= bandIdx; b++) { var cell = e.byBand[b]; if (!cell) continue; var w = 0.6 + 0.05 * b; num += cell.c * w; den += cell.t * w; }
    });
    return den > 0 ? num / den : null;
  }
  function atBandPct(bandIdx) {
    var num = 0, den = 0;
    CORE_DOMAINS.forEach(function (d) { var e = PL.domainEvidence[d]; if (!e) return; var cell = e.byBand[bandIdx]; if (cell) { num += cell.c; den += cell.t; } });
    return den > 0 ? num / den : null;
  }
  function currentAbilityEstimate() { var best = 1; for (var b = 1; b <= 8; b++) { var r = bandReadiness(b); if (r !== null && r >= PLACEMENT_RULES.levelReadinessThreshold) best = b; } return best; }

  var lastReusedItemId = '';
  function pickItem(domain, difficulty) {
    var used = {};
    PL.administered.forEach(function (id) { used[id] = 1; });
    (PL.excludeItemIds || []).forEach(function (id) { used[id] = 1; });
    var rng = mulberry32(hashStr(PL.sessionId + '|' + PL.administered.length + '|' + domain + '|' + difficulty));
    function candidates(diff) {
      return bankItems().filter(function (it) { return it.domain === domain && it.difficulty === diff && !used[it.id] && !(PL.listeningUnavailable && it.questionType === 'listenChoice'); });
    }
    var offsets = [0, -1, 1, -2, 2, -3, 3];
    for (var oi = 0; oi < offsets.length; oi++) {
      var diff = difficulty + offsets[oi]; if (diff < 1 || diff > 8) continue;
      var pool = candidates(diff);
      if (pool.length) { lastReusedItemId = ''; return pool[Math.floor(rng() * pool.length)]; }
    }
    for (var oi2 = 0; oi2 < offsets.length; oi2++) {
      var diff2 = difficulty + offsets[oi2]; if (diff2 < 1 || diff2 > 8) continue;
      var reusePool = bankItems().filter(function (it) { return it.domain === domain && it.difficulty === diff2 && PL.administered.indexOf(it.id) === -1 && !(PL.listeningUnavailable && it.questionType === 'listenChoice'); });
      if (reusePool.length) {
        var nonRepeat = reusePool.filter(function (it) { return it.id !== lastReusedItemId; });
        var chosen = (nonRepeat.length ? nonRepeat : reusePool)[Math.floor(rng() * (nonRepeat.length ? nonRepeat.length : reusePool.length))];
        lastReusedItemId = chosen.id;
        if (PL) PL.routeHistory.push({ fromDifficulty: difficulty, toDifficulty: diff2, reason: 'retake_reuse_no_unused_alternative', itemId: chosen.id, timestamp: nowISO() });
        return chosen;
      }
    }
    return null;
  }
  function domainsNeedingCoverage() { return CORE_DOMAINS.filter(function (d) { var e = PL.domainEvidence[d]; return !e || e.t < PLACEMENT_RULES.minimumItemsPerCoreDomain; }); }
  function nextDomainRoundRobin() {
    var need = domainsNeedingCoverage(); var pool = need.length ? need : CORE_DOMAINS;
    if (PL.listeningUnavailable) { pool = pool.filter(function (d) { return d !== 'listening'; }); if (!pool.length) pool = CORE_DOMAINS.filter(function (d) { return d !== 'listening'; }); }
    return pool[PL.administered.length % pool.length];
  }

  function buildScreeningQueue() {
    var q = []; var anchors = [2, 3, 4, 5];
    for (var a = 0; a < anchors.length; a++) for (var d = 0; d < CORE_DOMAINS.length; d++) { q.push({ domain: CORE_DOMAINS[d], difficulty: anchors[a] }); if (q.length >= PLACEMENT_RULES.screeningItems) return q; }
    return q;
  }
  function coreCount() { return PL.responses.length; }
  function adaptiveCount() { return PL.responses.filter(function (r) { return r.phase === 'adaptive'; }).length; }
  function confirmationCount() { return PL.responses.filter(function (r) { return r.phase === 'confirmation'; }).length; }

  function routeAfterAnswer(resp) {
    var from = PL.currentDifficulty, to = from, reason = 'hold';
    if (resp.correct) { PL.strongRun++; PL.weakRun = 0; } else { PL.weakRun++; PL.strongRun = 0; }
    if (PL.phase === 'adaptive') {
      if (PL.strongRun >= PLACEMENT_RULES.raiseAfterStrongRun) { to = Math.min(8, from + 1); reason = 'strong-run'; PL.strongRun = 0; }
      else if (PL.weakRun >= PLACEMENT_RULES.lowerAfterWeakRun) { to = Math.max(1, from - 1); reason = 'weak-run'; PL.weakRun = 0; }
    }
    if (to !== from || PL.phase === 'adaptive') PL.routeHistory.push({ fromDifficulty: from, toDifficulty: to, reason: reason, itemId: resp.itemId, timestamp: nowISO() });
    PL.currentDifficulty = to;
  }

  function advancePhaseIfNeeded() {
    if (PL.phase === 'screening' && PL.screenAnchorQueue.length === 0) {
      PL.phase = 'adaptive'; PL.currentDifficulty = Math.max(1, Math.min(8, currentAbilityEstimate()));
      PL.routeHistory.push({ fromDifficulty: 0, toDifficulty: PL.currentDifficulty, reason: 'screening-estimate', itemId: '', timestamp: nowISO() });
      PL.strongRun = 0; PL.weakRun = 0; return;
    }
    if (PL.phase === 'adaptive') {
      var n = adaptiveCount(); var est = currentAbilityEstimate(); var stable = Math.abs(PL.currentDifficulty - est) <= 1;
      if (n >= PLACEMENT_RULES.adaptiveMaxItems || (n >= PLACEMENT_RULES.adaptiveMinItems && stable && domainsNeedingCoverage().length === 0)) {
        PL.phase = 'confirmation'; PL.currentDifficulty = Math.max(1, Math.min(8, est));
        PL.routeHistory.push({ fromDifficulty: PL.currentDifficulty, toDifficulty: PL.currentDifficulty, reason: 'enter-confirmation', itemId: '', timestamp: nowISO() });
      }
      return;
    }
    if (PL.phase === 'confirmation') {
      var c = confirmationCount(); var total = coreCount();
      var enough = c >= PLACEMENT_RULES.confirmationItems || c >= 14; var minMet = total >= PLACEMENT_RULES.minimumCoreItems;
      var est2 = currentAbilityEstimate(); var r = bandReadiness(Math.min(8, est2 + 1));
      var borderline = r !== null && r >= 0.45 && r < PLACEMENT_RULES.levelReadinessThreshold;
      if (total >= PLACEMENT_RULES.maximumCoreItems || (enough && minMet && (!borderline || c >= 14))) PL.phase = 'speaking';
    }
  }

  function nextCoreStep() {
    advancePhaseIfNeeded();
    if (PL.phase === 'speaking' || PL.phase === 'done') return null;
    var domain, difficulty;
    if (PL.phase === 'screening') { var step = PL.screenAnchorQueue[0]; if (!step) { advancePhaseIfNeeded(); return nextCoreStep(); } domain = step.domain; difficulty = step.difficulty; }
    else { domain = nextDomainRoundRobin(); difficulty = PL.currentDifficulty; }
    var item = pickItem(domain, difficulty);
    if (!item) {
      if (PL.phase === 'screening') PL.screenAnchorQueue.shift();
      logTech('item-unavailable', domain + '@' + difficulty);
      if (coreCount() >= PLACEMENT_RULES.minimumCoreItems) { PL.phase = 'speaking'; return null; }
      var alt = CORE_DOMAINS.filter(function (d) { return d !== domain; });
      for (var i = 0; i < alt.length; i++) { var it2 = pickItem(alt[i], difficulty); if (it2) { item = it2; break; } }
      if (!item) { PL.phase = 'speaking'; return null; }
    }
    if (PL.phase === 'screening') PL.screenAnchorQueue.shift();
    PL.currentItemId = item.id;
    PL.currentDomain = item.domain;
    PL.currentItemStatus = 'presented';
    PL.currentItemPresentedAt = nowISO();
    PL.currentItemSubmittedAt = '';
    if (PL.administered.indexOf(item.id) === -1) PL.administered.push(item.id);
    lsSet(sKey('placement_administered_last'), JSON.stringify(PL.administered));
    saveSession();
    return item;
  }

  function normText(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9\s']/g, '').replace(/\s+/g, ' ').trim(); }
  function gradeItemAnswer(item, given) {
    if (item.questionType === 'choice' || item.questionType === 'listenChoice') return { correct: given === item.answer, partial: 0 };
    if (item.questionType === 'wordOrder') return { correct: normText(given) === normText(item.answer), partial: 0 };
    if (item.questionType === 'typed') { var g = normText(given); var ok = normText(item.answer) === g || (item.acceptable || []).some(function (a) { return normText(a) === g; }); return { correct: ok, partial: 0 }; }
    return { correct: false, partial: 0 };
  }

  function computeRecommendation() {
    var bestBand = 0;
    for (var b = 1; b <= 8; b++) {
      var readiness = bandReadiness(b); if (readiness === null) continue;
      var atPct = atBandPct(b);
      var criticalOk = CRITICAL_DOMAINS.every(function (d) { var p = domainPctUpTo(d, b); return p === null || p >= PLACEMENT_RULES.criticalDomainFloor; });
      var majorityOk = (function () { var meet = 0, have = 0; CORE_DOMAINS.forEach(function (d) { var p = domainPctUpTo(d, b); if (p === null) return; have++; if (p >= 0.45) meet++; }); return have === 0 || meet >= Math.ceil(have / 2); })();
      if (readiness >= PLACEMENT_RULES.levelReadinessThreshold && (atPct === null || atPct >= PLACEMENT_RULES.atLevelThreshold) && criticalOk && majorityOk) bestBand = b;
    }
    var floor = bestBand === 0; if (floor) bestBand = 1;
    var ceiling = false; if (bestBand === 8) { var top = atBandPct(8); if (top !== null && top >= 0.7) ceiling = true; }
    var classId = ceiling ? CEILING_CLASS : BAND_TO_CLASS[BANDS[bestBand - 1]];

    var domainScores = {}, domainLabels = {};
    CORE_DOMAINS.forEach(function (d) { var p = domainPct(d); domainScores[d] = p === null ? null : Math.round(p * 100); domainLabels[d] = p === null ? 'Not Fully Assessed' : p >= 0.75 ? 'Strong' : p >= 0.5 ? 'Developing' : 'Needs Support'; });
    if (PL.listeningUnavailable) domainLabels.listening = 'Not Fully Assessed';
    var strong = CORE_DOMAINS.filter(function (d) { return domainLabels[d] === 'Strong'; });
    var weak = CORE_DOMAINS.filter(function (d) { return domainLabels[d] === 'Needs Support'; });

    var conf = 1.0, reasons = [];
    var n = coreCount();
    if (n < PLACEMENT_RULES.minimumCoreItems) { conf -= 0.25; reasons.push('fewer core items than planned'); }
    var uncovered = CORE_DOMAINS.filter(function (d) { var e = PL.domainEvidence[d]; return !e || e.t < PLACEMENT_RULES.minimumItemsPerCoreDomain; });
    if (uncovered.length) { conf -= 0.12 * uncovered.length; reasons.push('limited evidence in ' + uncovered.map(function (d) { return DOMAIN_LABELS[d]; }).join(', ')); }
    var above = bandReadiness(Math.min(8, bestBand + 1));
    if (above !== null && Math.abs(above - PLACEMENT_RULES.levelReadinessThreshold) < 0.08) { conf -= 0.15; reasons.push('result close to the next level boundary'); }
    var easyWrong = 0, hardRight = 0;
    PL.responses.forEach(function (r) { if (!r.correct && r.difficulty <= Math.max(1, bestBand - 2)) easyWrong++; if (r.correct && r.difficulty >= Math.min(8, bestBand + 2)) hardRight++; });
    if (easyWrong >= 3 && hardRight >= 3) { conf -= 0.18; reasons.push('inconsistent answers between easy and difficult items'); }
    else if (easyWrong >= 5 || hardRight >= 5) { conf -= 0.1; reasons.push('some inconsistent responses'); }
    var techCount = PL.technicalEvents.length; if (techCount >= 4) { conf -= 0.12; reasons.push('several technical interruptions'); }
    if (PL.listeningUnavailable) { conf -= 0.15; reasons.push('listening was not fully assessed'); }
    if (PL.speaking.status === 'skipped' || PL.speaking.status === 'unavailable') conf -= 0.03;
    var replays = 0; Object.keys(PL.listeningReplays).forEach(function (k) { replays += PL.listeningReplays[k]; });
    if (replays > 6) { conf -= 0.05; reasons.push('frequent listening replays'); }
    if (PL.speaking.status === 'done' && PL.speaking.responses.length) { var okCount = PL.speaking.responses.filter(function (r) { return r.keywordHit; }).length; if (okCount >= Math.ceil(PL.speaking.responses.length / 2)) conf += 0.03; }
    conf = Math.max(0, Math.min(1, conf));
    var confidence = conf >= PLACEMENT_RULES.highConfidenceThreshold ? 'High' : conf >= PLACEMENT_RULES.mediumConfidenceThreshold ? 'Medium' : 'Low';
    var teacherReview = confidence === 'Low' || ceiling;

    var prevBandName = bestBand > 1 ? bandName(BANDS[bestBand - 2]) : '';
    var reasonText = floor ? 'The Placement Test recommends beginning with the academy foundation program, building every skill step by step.'
      : ceiling ? 'The student performed strongly at the highest available placement range. Teacher review is recommended for advanced study planning.'
      : 'ZIRAK recommends ' + bandName(BANDS[bestBand - 1]) + ' because the student showed stable ability in ' + (prevBandName || 'foundation') + ' skills and developing ability at ' + bandName(BANDS[bestBand - 1]) + ' level.';

    var reusedIds = PL.routeHistory.filter(function (rh) { return rh.reason === 'retake_reuse_no_unused_alternative'; }).map(function (rh) { return rh.itemId; });
    var uniqueAdministered = PL.administered.length - reusedIds.length;
    var previousItemsAvoided = (PL.excludeItemIds || []).filter(function (id) { return PL.administered.indexOf(id) === -1; }).length;

    return {
      band: BANDS[bestBand - 1], bandIndex: bestBand, bandName: bandName(BANDS[bestBand - 1]),
      classId: classId, className: classDisplayName(classId),
      floor: floor, ceiling: ceiling,
      confidence: confidence, confidenceScore: Math.round(conf * 100) / 100,
      confidenceReasons: reasons, teacherReviewRecommended: teacherReview,
      domainScores: domainScores, domainLabels: domainLabels,
      strongAreas: strong.map(function (d) { return DOMAIN_LABELS[d]; }),
      weakAreas: weak.map(function (d) { return DOMAIN_LABELS[d]; }),
      alternativeBand: bestBand < 8 && above !== null && above >= 0.45 ? bandName(BANDS[bestBand]) : '',
      firstFocus: weak.length ? (DOMAIN_LABELS[weak[0]] + ' practice at ' + bandName(BANDS[Math.max(0, bestBand - 1)]) + ' level') : ('Continue with ' + bandName(BANDS[bestBand - 1]) + ' lessons'),
      reasonText: reasonText,
      itemCount: n,
      retakeItemReuseCount: reusedIds.length,
      retakeUniqueItemCount: uniqueAdministered,
      previousItemsAvoidedCount: previousItemsAvoided
    };
  }

  function complete() {
    if (!PL) return null;
    if (PL.status === 'completed' && PL.resultId) { var existingComplete = getResultById(PL.resultId); if (existingComplete) return existingComplete; }
    var rec = computeRecommendation();
    PL.status = 'completed'; PL.phase = 'done'; PL.completedAt = nowISO();
    PL.currentItemStatus = 'finalized';
    PL.elapsedMs += (Date.now() - new Date(PL.lastResumeAt).getTime());

    var resultId = 'plres-' + PL.sessionId;
    PL.resultId = resultId;
    var hist = loadHistory();
    var exists = hist.results.some(function (r) { return r.resultId === resultId; });
    if (!exists) {
      var acceptedNow = getAcceptedInfo();
      var diagnostic = {
        completedAt: PL.completedAt, testVersion: ENGINE_VERSION, bankVersion: PL.bankVersion,
        recommendedBand: rec.band, recommendedBandName: rec.bandName,
        recommendedLevel: rec.classId, recommendedLevelName: rec.className,
        acceptedLevelAtThatTime: acceptedNow ? acceptedNow.level : '',
        confidence: rec.confidence, confidenceScore: rec.confidenceScore, confidenceReasons: rec.confidenceReasons.slice(),
        domainScores: rec.domainScores, domainLabels: rec.domainLabels,
        strongAreas: rec.strongAreas.slice(), weakAreas: rec.weakAreas.slice(),
        technicalLimitations: PL.technicalEvents.map(function (t) { return t.type; }),
        itemCount: rec.itemCount, isRetake: !!PL.isRetake,
        elapsedMinutes: Math.round(PL.elapsedMs / 60000),
        routeSummary: PL.routeHistory.slice(-40),
        speakingStatus: PL.speaking.status,
        reasonText: rec.reasonText, firstFocus: rec.firstFocus,
        teacherReviewRecommended: rec.teacherReviewRecommended,
        administeredIds: PL.administered.slice(),
        retakeItemReuseCount: rec.retakeItemReuseCount,
        retakeUniqueItemCount: rec.retakeUniqueItemCount,
        previousItemsAvoidedCount: rec.previousItemsAvoidedCount,
        linkedPreviousResultId: PL.linkedPreviousResultId || ''
      };
      var decision = {
        decisionStatus: 'pending', resolvedLevel: '', decisionSource: '', decisionAt: '',
        teacherDecision: '', teacherNote: '', linkedAcceptedLevelId: ''
      };
      hist.results.push({ resultId: resultId, sessionId: PL.sessionId, studentId: PL.studentId, diagnostic: diagnostic, decision: decision });
      saveHistory(hist);

      var overallPct = (function () { var c = 0, t = 0; PL.responses.forEach(function (r) { t++; if (r.correct) c++; }); return t ? Math.round((c / t) * 100) : 0; })();
      lsSet(nsLegacyKey('placement_result'), JSON.stringify({ classId: rec.classId, date: PL.completedAt, pct: overallPct }));

      try {
        if (window.ZirakLearningLedger && window.ZirakLearningLedger.recordActivity) {
          window.ZirakLearningLedger.recordActivity({
            id: resultId, source: 'academy-placement-test', activityType: 'placement-test',
            sessionTitle: 'Placement Test — Recommended: ' + rec.className,
            good: 0, total: 0, pct: overallPct, placement: true, recommendation: rec.classId, confidence: rec.confidence
          });
        }
      } catch (e) {}

      hist.results.forEach(function (r) {
        if (r.resultId !== resultId && r.decision && r.decision.decisionStatus === 'pending') {
          r.decision.decisionStatus = 'supersededByRetake'; r.decision.decisionAt = nowISO();
        }
      });
      saveHistory(hist);
    }
    lsSet(sKey('placement_last_result'), resultId);
    lsSet(sKey('placement_administered_last'), JSON.stringify(PL.administered));
    try { if (window.ZirakAcademyTests && window.ZirakAcademyTests.refreshPlacementOnboardingCard) window.ZirakAcademyTests.refreshPlacementOnboardingCard(); } catch (e) {}
    clearSession();
    return getResultById(resultId);
  }

  function getAcceptedInfo() { try { var raw = lsGet(nsLegacyKey('placement_accepted')); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }

  function resolveDecision(resultId, patch) {
    if (!resultId || !patch) return false;
    var h = loadHistory(); var found = false;
    h.results.forEach(function (r) {
      if (r.resultId !== resultId) return;
      found = true;
      if (!r.decision) r.decision = { decisionStatus: 'pending', resolvedLevel: '', decisionSource: '', decisionAt: '', teacherDecision: '', teacherNote: '', linkedAcceptedLevelId: '' };
      ['decisionStatus', 'resolvedLevel', 'decisionSource', 'decisionAt', 'linkedAcceptedLevelId'].forEach(function (k) { if (patch[k] !== undefined) r.decision[k] = patch[k]; });
      if (patch.teacherDecision !== undefined) r.decision.teacherDecision = patch.teacherDecision;
      if (patch.teacherNote !== undefined && patch.teacherNote) r.decision.teacherNote = String(patch.teacherNote).slice(0, 500);
    });
    if (found) saveHistory(h);
    return found;
  }

  function getPlacementDecisionState() {
    var loaded = loadSession();
    var sessionActive = !!(loaded && loaded.session && loaded.session.status !== 'completed');
    if (sessionActive) return 'inProgress';
    var latest = latestResult();
    if (!latest) return 'noResult';
    var status = (latest.decision && latest.decision.decisionStatus) || 'pending';
    if (status === 'pending') return 'recommendationPending';
    if (status === 'acceptedRecommendation') return 'recommendationAccepted';
    if (status === 'manualLevelSelected') return 'manuallyResolved';
    if (status === 'teacherConfirmedRecommendation' || status === 'teacherSelectedDifferentLevel') return 'teacherResolved';
    if (status === 'keptExistingLevel') return 'existingLevelKept';
    if (status === 'retestRequested') return 'retestRequested';
    if (status === 'supersededByRetake') return 'superseded';
    return 'recommendationPending';
  }

  function resolvePlacementStartMode() {
    var loaded = loadSession();
    if (loaded && loaded.session && loaded.session.status !== 'completed') {
      return loaded.session.isRetake ? 'continueRetake' : 'continueFirst';
    }
    var latest = latestResult();
    if (!latest) return 'first';
    var status = (latest.decision && latest.decision.decisionStatus) || 'pending';
    if (status === 'pending') return 'pendingDecision';
    if (status === 'retestRequested') return 'teacherRequestedRetest';
    if (latest.diagnostic.confidence === 'Low') return 'lowConfidenceRetest';
    return 'retake';
  }

  function acceptRecommendation() {
    var res = currentResult();
    if (!res) return false;
    if (typeof window.acceptPlacement !== 'function') return false;
    var nowStamp = nowISO();
    resolveDecision(res.resultId, {
      decisionStatus: 'acceptedRecommendation', resolvedLevel: res.diagnostic.recommendedLevel,
      decisionSource: 'student', decisionAt: nowStamp, teacherDecision: 'Recommendation accepted', linkedAcceptedLevelId: 'accepted_' + nowStamp
    });
    window.acceptPlacement(res.diagnostic.recommendedLevel);
    try { if (window.ZirakAcademyTests && window.ZirakAcademyTests.refreshPlacementOnboardingCard) window.ZirakAcademyTests.refreshPlacementOnboardingCard(); } catch (e) {}
    // I6H-D13: optional, typeof-guarded — tells the Personalized Learning
    // Plan engine the accepted level changed, so it can archive the old
    // cycle and generate a new one from the new level.
    try { if (window.ZirakLearningPlan && window.ZirakLearningPlan.onAcceptedLevelChanged) window.ZirakLearningPlan.onAcceptedLevelChanged(res.studentId); } catch (e) {}
    renderResultView();
    return true;
  }
  function openManualLevelSelection() {
    try {
      if (window.ZirakAcademyTests && window.ZirakAcademyTests.goManualLevel) { window.ZirakAcademyTests.goManualLevel(); return; }
      if (typeof window.navigate === 'function') window.navigate('path');
      if (typeof window.showSchoolTab === 'function') window.showSchoolTab('path');
    } catch (e) {}
  }

  function recordLevelDecision(opts) {
    opts = opts || {};
    var levelId = opts.levelId, source = opts.source || 'manual';
    var res = opts.resultId ? getResultById(opts.resultId) : getLatestUnresolvedResult();
    if (!res) return false;
    if (res.decision && res.decision.decisionStatus && res.decision.decisionStatus !== 'pending') return false;
    var decisionType = opts.decisionType || (source === 'teacher' ? 'teacherSelectedDifferentLevel' : 'manualLevelSelected');
    var nowStamp = opts.decidedAt || nowISO();
    resolveDecision(res.resultId, {
      decisionStatus: decisionType, resolvedLevel: levelId, decisionSource: source, decisionAt: nowStamp,
      teacherDecision: decisionType === 'manualLevelSelected' ? ('Selected ' + classDisplayName(levelId) + ' manually') : ('Teacher selected ' + classDisplayName(levelId)),
      teacherNote: opts.teacherNote, linkedAcceptedLevelId: 'accepted_' + nowStamp
    });
    try { if (window.ZirakAcademyTests && window.ZirakAcademyTests.refreshPlacementOnboardingCard) window.ZirakAcademyTests.refreshPlacementOnboardingCard(); } catch (e) {}
    try { if (window.ZirakLearningPlan && window.ZirakLearningPlan.onAcceptedLevelChanged) window.ZirakLearningPlan.onAcceptedLevelChanged(res.studentId); } catch (e) {}
    return true;
  }

  function pinGate(onOk) {
    var mount = getMount(); if (!mount) return;
    var overlay = document.createElement('div');
    overlay.className = 'pl-pin-overlay';
    overlay.innerHTML = '<div class="pl-pin-box"><div class="pl-pin-title">Teacher PIN required</div>' +
      '<input type="password" inputmode="numeric" class="pl-pin-input" id="pl-pin-input" autocomplete="off">' +
      '<div class="pl-pin-err" id="pl-pin-err" style="display:none;">Wrong PIN.</div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn" id="pl-pin-cancel">Cancel</button>' +
      '<button type="button" class="pl-btn pl-btn-primary" id="pl-pin-ok">Unlock</button></div></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#pl-pin-cancel').onclick = function () { overlay.remove(); };
    overlay.querySelector('#pl-pin-ok').onclick = function () {
      var v = overlay.querySelector('#pl-pin-input').value;
      if (v === getTeacherPinValue()) { overlay.remove(); onOk(); } else overlay.querySelector('#pl-pin-err').style.display = 'block';
    };
  }
  function requestTeacherReview() { pinGate(renderTeacherReview); }
  function confirmLevelAsTeacher(classId, note) { pinGate(function () { _teacherApply(classId, note, 'confirm'); }); }

  function _teacherApply(classId, note, decision) {
    var res = currentResult(); if (!res) return;
    if (decision === 'note') {
      // Pure note update — no level/decision-status change, so it is
      // NOT part of the shared Teacher decision authority's contract.
      resolveDecision(res.resultId, { teacherNote: note });
      renderResultView();
      return;
    }
    // I6H-D14C (Task 24): confirm/different/keep/retest all route
    // through the ONE shared final mutation authority — the same
    // function the Teacher Command Center's explicit-student actions
    // use. This is what "one final mutation authority" means in
    // practice: not merely identical formulas in two places, but a
    // single function call site.
    var sid = studentId();
    if (!sid) return;
    var result = applyTeacherPlacementDecisionFor(sid, res.resultId, classId, note, decision);
    if (!result || !result.ok) return;
    // Active-student-only UI side effects, AFTER the shared authority's
    // durable mutation has completed.
    if (decision === 'confirm' || decision === 'different') {
      if (typeof window.acceptPlacement === 'function') window.acceptPlacement(classId);
    }
    try { if (window.ZirakAcademyTests && window.ZirakAcademyTests.refreshPlacementOnboardingCard) window.ZirakAcademyTests.refreshPlacementOnboardingCard(); } catch (e) {}
    renderResultView();
  }

  function startRetake() {
    var prevIds = [];
    getPlacementHistory().forEach(function (r) { (r.diagnostic.administeredIds || []).forEach(function (id) { if (prevIds.indexOf(id) === -1) prevIds.push(id); }); });
    var lastR; try { lastR = JSON.parse(lsGet(sKey('placement_administered_last')) || 'null'); } catch (e) { lastR = null; }
    (Array.isArray(lastR) ? lastR : []).forEach(function (id) { if (prevIds.indexOf(id) === -1) prevIds.push(id); });
    var linkResult = latestResult();
    lastReusedItemId = '';
    PL = blankSession();
    PL.isRetake = true;
    PL.excludeItemIds = prevIds;
    PL.linkedPreviousResultId = linkResult ? linkResult.resultId : '';
    PL.screenAnchorQueue = buildScreeningQueue();
    saveSession();
    renderIntro();
  }

  var speakRec = null, speakTok = 0;
  function speakingPromptsForBand(bandIdx) {
    var all = bank().speaking.filter(function (s) { return s.active !== false; });
    var near = all.filter(function (s) { return Math.abs(s.difficulty - bandIdx) <= 1; });
    var pool = near.length >= PLACEMENT_RULES.speakingPrompts ? near : all;
    var rng = mulberry32(hashStr(PL.sessionId + '|speak'));
    var out = [], used = {};
    while (out.length < Math.min(PLACEMENT_RULES.speakingPrompts, pool.length)) { var s = pool[Math.floor(rng() * pool.length)]; if (!used[s.id]) { used[s.id] = 1; out.push(s); } }
    return out;
  }
  function cancelSpeech() { speakTok++; try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} if (speakRec) { try { speakRec.stop(); } catch (e) {} speakRec = null; } }
  function skipOptionalSpeaking() { cancelSpeech(); if (PL && PL.phase === 'speaking') { PL.speaking.status = PL.speaking.responses.length ? 'done' : 'skipped'; finishAndShowResult(); } }
  function startSpeaking(promptObj, onDone) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { PL.speaking.status = 'unavailable'; logTech('speech-unsupported'); onDone && onDone(null); return; }
    var tok = ++speakTok; var rec;
    try { rec = new SR(); } catch (e) { logTech('mic-create-failed'); onDone && onDone(null); return; }
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
    var transcript = '';
    rec.onresult = function (ev) { if (tok !== speakTok) return; try { transcript = ev.results[0][0].transcript || ''; } catch (e) {} };
    rec.onerror = function (ev) {
      if (tok !== speakTok) return; speakRec = null;
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') { PL.speaking.status = 'unavailable'; logTech('mic-permission-denied'); }
      else if (ev.error === 'audio-capture') { PL.speaking.status = 'unavailable'; logTech('mic-unavailable'); }
      else if (ev.error === 'no-speech') logTech('no-speech');
      else if (ev.error !== 'aborted') logTech('recognition-error', ev.error);
      onDone && onDone(null);
    };
    rec.onend = function () {
      if (tok !== speakTok) return; speakRec = null;
      if (transcript) {
        var words = normText(transcript).split(' ').filter(Boolean); var kw = promptObj.keywords || [];
        var hit = kw.length ? kw.some(function (k) { return words.indexOf(normText(k)) > -1; }) : words.length >= 2;
        PL.speaking.responses.push({ promptId: promptObj.id, wordCount: words.length, keywordHit: hit, at: nowISO() });
        saveSession(); onDone && onDone({ wordCount: words.length, keywordHit: hit });
      } else onDone && onDone(null);
    };
    try { rec.start(); speakRec = rec; } catch (e) { logTech('mic-start-failed'); onDone && onDone(null); }
  }

  function speakEnglish(text, onEnd) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) { logTech('tts-unavailable'); onEnd && onEnd(false); return; }
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = (window.state && window.state.speechRate) || 0.9;
      var done = false; var fin = function () { if (!done) { done = true; onEnd && onEnd(true); } };
      u.onend = fin; u.onerror = fin; window.speechSynthesis.speak(u);
      setTimeout(fin, Math.max(3000, text.length * 90));
    } catch (e) { logTech('tts-error'); onEnd && onEnd(false); }
  }

  function getMount() { return document.getElementById('placement-engine-mount'); }
  function h(html) { var m = getMount(); if (m) m.innerHTML = html; return m; }

  function open() {
    var m = getMount(); if (!m) return;
    cancelSpeech(); SELECTED_RESULT_ID = null;
    if (!studentId()) { h('<div class="pl-card"><div class="pl-title">Placement Test</div><div class="pl-sub">Please log in as a student to take the Placement Test.</div></div>'); return; }
    var found = loadSession();
    if (found && found.corrupt) {
      clearSession(); found = null; PL = null; // never leave a stale in-memory session referenced
      h('<div class="pl-card"><div class="pl-title">Placement Test</div>' +
        '<div class="pl-sub">A saved Placement Test record could not be read safely. ZIRAK preserved a recovery copy and started a clean session.</div>' +
        '<div class="pl-actions"><button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine.start()">Start Placement Test</button></div></div>');
      return;
    }
    if (found && found.incompatible) {
      lsSet(sKey('placement_session_backup'), found.raw || '');
      clearSession(); PL = null;
      h('<div class="pl-card"><div class="pl-title">Placement Test</div>' +
        '<div class="pl-sub">A previous unfinished test used an older question bank and cannot safely continue. It has been preserved for the teacher. You can start a fresh Placement Test.</div>' +
        '<div class="pl-actions"><button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine.start()">Start Placement Test</button></div></div>');
      return;
    }
    if (found && found.session && found.session.studentId === studentId() && found.session.status !== 'completed') { PL = found.session; renderResumePrompt(); return; }
    PL = null; renderIntro();
  }
  function close() { cancelSpeech(); if (PL && PL.status === 'active') { PL.status = 'paused'; PL.pausedAt = nowISO(); PL.elapsedMs += (Date.now() - new Date(PL.lastResumeAt).getTime()); saveSession(); } }
  function pause() { if (!PL) return; cancelSpeech(); PL.status = 'paused'; PL.pausedAt = nowISO(); PL.elapsedMs += (Date.now() - new Date(PL.lastResumeAt).getTime()); saveSession(); renderResumePrompt(); }
  function resume() { if (!PL) { open(); return; } PL.status = 'active'; PL.lastResumeAt = nowISO(); saveSession(); if (PL.phase === 'speaking') renderSpeakingStage(); else renderCurrentItem(); }
  function abandon() { cancelSpeech(); clearSession(); PL = null; renderIntro(); }

  function start() {
    var mode = resolvePlacementStartMode();
    if (mode !== 'first') { startRetake(); return; }
    lastReusedItemId = '';
    PL = blankSession();
    PL.screenAnchorQueue = buildScreeningQueue();
    saveSession();
    renderSoundCheck();
  }

  var START_LABELS = {
    first: { label: 'Start Placement Test', action: 'ZirakPlacementEngine.start()' },
    continueFirst: { label: 'Continue Placement Test', action: 'ZirakPlacementEngine.resume()' },
    pendingDecision: { label: '', action: '' },
    retake: { label: 'Start Placement Retake', action: 'ZirakPlacementEngine.startRetake()' },
    continueRetake: { label: 'Continue Placement Retake', action: 'ZirakPlacementEngine.resume()' },
    lowConfidenceRetest: { label: 'Start Placement Retake (retest suggested)', action: 'ZirakPlacementEngine.startRetake()' },
    teacherRequestedRetest: { label: 'Start Requested Retest', action: 'ZirakPlacementEngine.startRetake()' }
  };

  function renderIntro() {
    var mode = resolvePlacementStartMode();
    var last = latestResult();
    var acc = getAcceptedInfo();
    var startBtn = START_LABELS[mode] || START_LABELS.first;
    var decisionActionsHtml = '';
    if (mode === 'pendingDecision' && last) {
      decisionActionsHtml =
        '<div class="pl-actions">' +
        '<button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine._confirmAccept()">Accept Recommendation</button>' +
        '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.requestTeacherReview()">Ask Teacher</button>' +
        '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openManualLevelSelection()">Choose Another Level</button>' +
        '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openPlacementReport()">View Report</button>' +
        '</div>';
    }
    h('<div class="pl-card">' +
      '<div class="pl-title">Placement Test</div>' +
      '<div class="pl-sub">Diagnostic assessment for recommending your starting level.</div>' +
      '<div class="pl-ps dari">د پیل کچې د وړاندیز لپاره تشخیصي ارزونه</div>' +
      '<ul class="pl-guide">' +
      '<li>Usually 25-45 minutes, depending on your answers. You may pause and continue later.</li>' +
      '<li>There is no right/wrong feedback during the test - answers are simply recorded.</li>' +
      '<li>Listening questions need sound. Speaking at the end is optional.</li>' +
      '<li>The result is a recommendation. Your accepted level does not change until you or your teacher confirm it.</li>' +
      '</ul>' +
      ((mode === 'retake' || mode === 'lowConfidenceRetest' || mode === 'teacherRequestedRetest') && acc ? '<div class="pl-note">Retake: your current accepted level (<b>' + esc(classDisplayName(acc.level)) + '</b>) stays active until a new recommendation is accepted.</div>' : '') +
      (last ? '<div class="pl-note">Latest result: ' + esc(last.diagnostic.recommendedLevelName) + ' (' + esc(last.diagnostic.confidence) + ' confidence) - <button type="button" class="pl-link" onclick="ZirakPlacementEngine.openPlacementReport()">View Report</button> . <button type="button" class="pl-link" onclick="ZirakPlacementEngine.openPlacementHistory()">View History</button></div>' : '') +
      (mode === 'pendingDecision' ? decisionActionsHtml :
        '<div class="pl-actions"><button type="button" class="pl-btn pl-btn-primary" onclick="' + startBtn.action + '">' + startBtn.label + '</button>' +
        (last ? '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openPlacementReport()">Placement Report</button>' : '') + '</div>') +
      '</div>');
  }

  function renderResumePrompt() {
    var n = PL ? PL.responses.length : 0; var isRetakeSession = !!(PL && PL.isRetake);
    h('<div class="pl-card"><div class="pl-title">Placement ' + (isRetakeSession ? 'Retake' : 'Test') + ' in progress</div>' +
      '<div class="pl-sub">' + n + ' answers saved. You can continue where you stopped.</div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine.resume()">Continue Placement ' + (isRetakeSession ? 'Retake' : 'Test') + '</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine._confirmStartAgain()">Start ' + (isRetakeSession ? 'Retake ' : '') + 'Again</button></div></div>');
  }
  function _confirmStartAgain() {
    var isRetakeSession = !!(PL && PL.isRetake);
    h('<div class="pl-card"><div class="pl-title">Start ' + (isRetakeSession ? 'retake ' : '') + 'again?</div>' +
      '<div class="pl-sub">Your saved answers from the unfinished ' + (isRetakeSession ? 'retake' : 'test') + ' will be discarded. This cannot be undone.</div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine.open()">Cancel</button>' +
      '<button type="button" class="pl-btn pl-btn-danger" onclick="ZirakPlacementEngine._startAgainConfirmed(' + isRetakeSession + ')">Yes, Start Again</button></div></div>');
  }
  function _startAgainConfirmed(wasRetake) { clearSession(); PL = null; if (wasRetake) startRetake(); else start(); }

  function renderSoundCheck() {
    h('<div class="pl-card"><div class="pl-title">Test Your Sound</div>' +
      '<div class="pl-sub">Tap Play. You should hear a short English sentence.</div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine._playSoundCheck()">Play</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine._soundOk()">I Can Hear It</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine._soundSkip()">Continue Without Listening</button></div>' +
      '<div class="pl-note">If you continue without listening, listening questions are skipped and the report will note that listening was not fully assessed.</div></div>');
  }
  function _playSoundCheck() { speakEnglish('Welcome to the ZIRAK Placement Test. Good luck.'); }
  function _soundOk() { renderCurrentItem(true); }
  function _soundSkip() { PL.listeningUnavailable = true; logTech('listening-skipped-by-student'); renderCurrentItem(true); }

  var currentItemStartAt = 0;
  function stageLabel() { return PL.phase === 'screening' ? 'Stage 1 of 3 - Broad Screening' : PL.phase === 'adaptive' ? 'Stage 2 of 3 - Targeted Assessment' : PL.phase === 'confirmation' ? 'Stage 3 of 3 - Confirmation' : 'Optional - Speaking'; }
  function instructionsFor(item) {
    if (item.questionType === 'listenChoice') return 'Listen carefully, then choose the best answer.';
    if (item.questionType === 'wordOrder') return 'Arrange the words to make a correct sentence.';
    if (item.domain === 'functional') return 'Choose the most natural response.';
    if (item.questionType === 'typed') return 'Type the missing word.';
    return 'Choose the best answer.';
  }

  function renderCurrentItem(fresh) {
    cancelSpeech();
    var item, isNewPick;
    if (!fresh && PL.currentItemId && PL.currentItemStatus === 'presented') {
      item = itemById(PL.currentItemId); isNewPick = false;
      if (!item) { item = nextCoreStep(); isNewPick = true; }
    } else { item = nextCoreStep(); isNewPick = true; }
    if (!item) { if (PL.phase === 'speaking') { renderSpeakingStage(); return; } finishAndShowResult(); return; }
    currentItemStartAt = PL.currentItemPresentedAt ? new Date(PL.currentItemPresentedAt).getTime() : Date.now();

    var qNum = PL.responses.length + 1;
    var body = '';
    if (item.passage) body += '<div class="pl-passage">' + esc(item.passage).replace(/\n/g, '<br>') + '</div>';
    if (item.questionType === 'listenChoice') {
      var replays = PL.listeningReplays[item.id] || 0;
      body += '<div class="pl-listen-row"><button type="button" class="pl-btn" id="pl-play-btn" onclick="ZirakPlacementEngine.replayListeningPrompt()">Play</button>' +
        '<span class="pl-replay-note">Replays left: ' + Math.max(0, PLACEMENT_RULES.listeningReplayLimit - replays) + '</span></div>';
    }
    body += '<div class="pl-prompt">' + esc(item.prompt) + '</div>';
    if (item.questionType === 'choice' || item.questionType === 'listenChoice') {
      body += '<div class="pl-choices">' + item.choices.map(function (c, i) { return '<button type="button" class="pl-choice" data-i="' + i + '" onclick="ZirakPlacementEngine._pick(' + i + ')">' + esc(c) + '</button>'; }).join('') + '</div>';
    } else if (item.questionType === 'wordOrder') {
      body += '<div class="pl-order-built" id="pl-order-built"></div>' +
        '<div class="pl-order-pool" id="pl-order-pool">' + item.choices.map(function (w) { return '<button type="button" class="pl-word" data-w="' + esc(w) + '" onclick="ZirakPlacementEngine._word(this)">' + esc(w) + '</button>'; }).join('') + '</div>' +
        '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine._orderClear()">Clear</button>' +
        '<button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine._orderSubmit()">Submit Answer</button></div>';
    } else {
      body += '<input type="text" class="pl-typed" id="pl-typed-input" autocomplete="off" autocapitalize="off">' +
        '<div class="pl-actions"><button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine._typedSubmit()">Submit Answer</button></div>';
    }
    h('<div class="pl-card"><div class="pl-progress-row"><span class="pl-stage">' + stageLabel() + '</span>' +
      '<span class="pl-qnum">Question ' + qNum + ' . ' + esc(DOMAIN_LABELS[item.domain]) + '</span></div>' +
      '<div class="pl-instr">' + instructionsFor(item) + '</div>' + body +
      '<div class="pl-footer-row"><button type="button" class="pl-link" onclick="ZirakPlacementEngine.pause()">Pause &amp; Save</button></div></div>');
    if (item.questionType === 'listenChoice' && isNewPick) speakEnglish(item.listeningText);
  }

  function replayListeningPrompt() {
    var item = itemById(PL.currentItemId); if (!item || item.questionType !== 'listenChoice') return;
    var n = PL.listeningReplays[item.id] || 0; if (n >= PLACEMENT_RULES.listeningReplayLimit) return;
    PL.listeningReplays[item.id] = n + 1; logTech('listening-replay', item.id); saveSession();
    speakEnglish(item.listeningText);
    var el = document.querySelector('.pl-replay-note'); if (el) el.textContent = 'Replays left: ' + Math.max(0, PLACEMENT_RULES.listeningReplayLimit - (PL.listeningReplays[item.id] || 0));
  }

  var orderBuilt = [];
  function _word(btn) { var w = btn.getAttribute('data-w'); orderBuilt.push(w); btn.disabled = true; var el = document.getElementById('pl-order-built'); if (el) el.textContent = orderBuilt.join(' '); }
  function _orderClear() { orderBuilt = []; var el = document.getElementById('pl-order-built'); if (el) el.textContent = ''; document.querySelectorAll('.pl-word').forEach(function (b) { b.disabled = false; }); }
  function _orderSubmit() { if (orderBuilt.length) { var a = orderBuilt.join(' '); orderBuilt = []; answerCurrentItem(a); } }
  function _typedSubmit() { var inp = document.getElementById('pl-typed-input'); var v = inp ? inp.value.trim() : ''; if (v) answerCurrentItem(v); }
  function _pick(i) { var item = itemById(PL.currentItemId); if (!item) return; answerCurrentItem(item.choices[i]); }

  function answerCurrentItem(given) {
    if (!PL) return;
    if (PL.status !== 'active') PL.status = 'active';
    var item = itemById(PL.currentItemId); if (!item) return;
    if (PL.responses.some(function (r) { return r.itemId === item.id; })) return;
    cancelSpeech();
    var g = gradeItemAnswer(item, given);
    var resp = { itemId: item.id, domain: item.domain, difficulty: item.difficulty, phase: PL.phase, correct: g.correct, partial: g.partial, answerGiven: String(given).slice(0, 120), ms: Date.now() - currentItemStartAt, at: nowISO() };
    PL.responses.push(resp);
    addEvidence(item.domain, item.difficulty, g.correct, g.partial);
    routeAfterAnswer(resp);
    PL.currentItemStatus = 'answered'; PL.currentItemSubmittedAt = nowISO(); PL.currentItemId = '';
    saveSession();
    var m = getMount(); if (m) { var note = document.createElement('div'); note.className = 'pl-recorded'; note.textContent = 'Answer recorded'; m.appendChild(note); }
    setTimeout(function () { renderCurrentItem(true); }, 350);
  }

  var speakingQueue = [], speakingIdx = 0;
  function renderSpeakingStage() {
    if (PL.speaking.status === 'skipped' || PL.speaking.status === 'unavailable' || PL.speaking.status === 'done') { finishAndShowResult(); return; }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { PL.speaking.status = 'unavailable'; logTech('speech-unsupported'); finishAndShowResult(); return; }
    speakingQueue = speakingPromptsForBand(currentAbilityEstimate());
    var answeredIds = {}; (PL.speaking.responses || []).forEach(function (r) { answeredIds[r.promptId] = 1; });
    speakingIdx = 0; while (speakingIdx < speakingQueue.length && answeredIds[speakingQueue[speakingIdx].id]) speakingIdx++;
    renderSpeakingPrompt();
  }
  function renderSpeakingPrompt() {
    if (speakingIdx >= speakingQueue.length) { PL.speaking.status = 'done'; saveSession(); finishAndShowResult(); return; }
    var p = speakingQueue[speakingIdx];
    h('<div class="pl-card"><div class="pl-progress-row"><span class="pl-stage">Optional - Speaking Profile</span>' +
      '<span class="pl-qnum">Prompt ' + (speakingIdx + 1) + ' of ' + speakingQueue.length + '</span></div>' +
      '<div class="pl-instr">Tap Start Speaking and answer in English. This part is optional and only supports your result.</div>' +
      '<div class="pl-prompt">' + esc(p.prompt) + '</div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine._speakPlay()">Hear the prompt</button>' +
      '<button type="button" class="pl-btn pl-btn-primary" id="pl-speak-btn" onclick="ZirakPlacementEngine._speakStart()">Start Speaking</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine._speakNext()">Skip This Prompt</button></div>' +
      '<div class="pl-note" id="pl-speak-status"></div>' +
      '<div class="pl-footer-row"><button type="button" class="pl-link" onclick="ZirakPlacementEngine.skipOptionalSpeaking()">Skip Speaking Section</button></div></div>');
  }
  function _speakPlay() { var p = speakingQueue[speakingIdx]; if (p) speakEnglish(p.prompt); }
  function _speakStart() {
    var p = speakingQueue[speakingIdx]; if (!p) return;
    var st = document.getElementById('pl-speak-status'); if (st) st.textContent = 'Listening... speak now.';
    startSpeaking(p, function (r) { var st2 = document.getElementById('pl-speak-status'); if (st2) st2.textContent = r ? 'Recorded. Thank you.' : 'Could not record - this never affects your level. You can try again or skip.'; if (r) setTimeout(_speakNext, 700); });
  }
  function _speakNext() { cancelSpeech(); speakingIdx++; renderSpeakingPrompt(); }

  function finishAndShowResult() { complete(); renderResultView(); }

  function decisionLine(res) {
    var d = res.decision || {}; var status = d.decisionStatus || 'pending';
    if (status === 'pending') return 'Decision: <b>Pending</b>';
    if (status === 'acceptedRecommendation') return 'Decision: <b>Recommendation Accepted</b>';
    if (status === 'manualLevelSelected') return 'Decision: <b>Different Level Selected Manually</b> (' + esc(classDisplayName(d.resolvedLevel)) + ')';
    if (status === 'teacherConfirmedRecommendation') return 'Decision: <b>Teacher Confirmed the Recommendation</b>';
    if (status === 'teacherSelectedDifferentLevel') return 'Decision: <b>Teacher Confirmed a Different Level</b> (' + esc(classDisplayName(d.resolvedLevel)) + ')';
    if (status === 'keptExistingLevel') return 'Decision: <b>Teacher Kept Existing Level</b> (' + esc(classDisplayName(d.resolvedLevel)) + ')';
    if (status === 'retestRequested') return 'Decision: <b>Retest Requested</b>';
    if (status === 'supersededByRetake') return 'Decision: <b>Superseded by a Later Retake</b>';
    return 'Decision: <b>Pending</b>';
  }
  function statusLineForShare(res) {
    var status = (res.decision && res.decision.decisionStatus) || 'pending';
    if (status === 'acceptedRecommendation') return 'Recommendation accepted';
    if (status === 'manualLevelSelected') return 'Different level selected manually';
    if (status === 'teacherConfirmedRecommendation') return 'Teacher confirmed the recommendation';
    if (status === 'teacherSelectedDifferentLevel') return 'Teacher confirmed a different level';
    if (status === 'keptExistingLevel') return 'Teacher kept the existing level';
    if (status === 'retestRequested') return 'Retest requested';
    return 'Recommendation pending';
  }

  function renderResultView() {
    var res = latestResult(); if (!res) { renderIntro(); return; }
    SELECTED_RESULT_ID = null;
    var resolved = (res.decision && res.decision.decisionStatus && res.decision.decisionStatus !== 'pending');
    var d = res.diagnostic;
    var rows = CORE_DOMAINS.map(function (dm) {
      var label = d.domainLabels[dm] || 'Not Fully Assessed';
      var icon = label === 'Strong' ? 'S' : label === 'Developing' ? 'D' : label === 'Needs Support' ? 'N' : '-';
      return '<div class="pl-skill-row"><span>' + esc(DOMAIN_LABELS[dm]) + '</span><span>[' + icon + '] ' + esc(label) + '</span></div>';
    }).join('');
    var speakRow = d.speakingStatus === 'done' ? '<div class="pl-skill-row"><span>Speaking Profile</span><span>Completed</span></div>' : '<div class="pl-skill-row"><span>Speaking Profile</span><span>Not Assessed</span></div>';
    h('<div class="pl-card"><div class="pl-title">Placement Test Complete</div>' +
      '<div class="pl-rec-level">Recommended Starting Level:<br><b>' + esc(d.recommendedLevelName) + '</b></div>' +
      '<div class="pl-conf pl-conf-' + d.confidence.toLowerCase() + '">Recommendation Confidence: ' + esc(d.confidence) + '</div>' +
      (d.teacherReviewRecommended && !resolved ? '<div class="pl-note">Teacher review is recommended before confirming this starting level.</div>' : '') +
      '<div class="pl-reason">' + esc(d.reasonText) + '</div>' +
      '<div class="pl-skill-grid">' + rows + speakRow + '</div>' +
      '<div class="pl-note"><b>Strongest Areas:</b> ' + esc(d.strongAreas.join(', ') || '-') + '<br><b>Areas Needing Support:</b> ' + esc(d.weakAreas.join(', ') || '-') + '<br><b>Recommended First Focus:</b> ' + esc(d.firstFocus) + '</div>' +
      '<div class="pl-note">This is a starting-level recommendation. Teachers and later progress assessments may adjust the learning path.</div>' +
      (resolved ? '<div class="pl-note">' + decisionLine(res) + '</div>' :
        '<div class="pl-actions"><button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine._confirmAccept()">Accept Recommended Level</button>' +
        '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.requestTeacherReview()">Ask Teacher to Review</button>' +
        '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openManualLevelSelection()">Choose Another Level</button></div>') +
      '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openPlacementReport()">View Placement Report</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openPlacementHistory()">View Placement History</button>' +
      (getPlacementHistory().length >= 2 ? '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openPlacementComparison()">Compare Results</button>' : '') +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.startRetake()">Retake (level stays until accepted)</button></div></div>');
  }
  function _confirmAccept() {
    var res = currentResult(); if (!res) return;
    h('<div class="pl-card"><div class="pl-title">Accept recommended level?</div>' +
      '<div class="pl-sub">Your starting level will be set to <b>' + esc(res.diagnostic.recommendedLevelName) + '</b> and ZIRAK will begin with the most suitable lessons, continuing to adjust through your progress assessments.</div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine.renderResultView()">Cancel</button>' +
      '<button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine.acceptRecommendation()">Yes, Accept</button></div></div>');
  }

  function buildStudentSummaryText(res) {
    var d = res.diagnostic;
    return 'ZIRAK English Language Academy\nPlacement Test Result\n\nStudent:\n' + studentName() +
      '\n\nRecommended Starting Level:\n' + d.recommendedLevelName +
      '\n\nConfidence:\n' + d.confidence +
      '\n\nStrong Areas:\n' + (d.strongAreas.join(', ') || '-') +
      '\n\nNeeds Support:\n' + (d.weakAreas.join(', ') || '-') +
      '\n\nRecommended First Focus:\n' + d.firstFocus +
      '\n\nStatus:\n' + statusLineForShare(res) +
      '\n\nGenerated from the student locally stored ZIRAK Placement Test record.';
  }

  function renderPlacementReportFor(res) {
    if (!res) { renderIntro(); return; }
    var d = res.diagnostic;
    var domRows = CORE_DOMAINS.map(function (dm) { var sc = d.domainScores[dm]; return '<tr><td>' + esc(DOMAIN_LABELS[dm]) + '</td><td>' + esc(d.domainLabels[dm]) + '</td><td>' + (sc === null || sc === undefined ? '-' : sc + '%') + '</td></tr>'; }).join('');
    var techList = (d.technicalLimitations && d.technicalLimitations.length) ? Array.from(new Set(d.technicalLimitations)).join(', ') : 'None recorded';
    var reuseNote = d.retakeItemReuseCount > 0 ? ('Some questions were reused because no equivalent unused alternative remained (' + d.retakeItemReuseCount + ' of ' + d.itemCount + ' items; ' + d.previousItemsAvoidedCount + ' previous items were successfully avoided).') : (d.isRetake ? 'All retake questions were unused alternatives (' + d.previousItemsAvoidedCount + ' previous items avoided).' : '');
    h('<div class="pl-card" id="pl-report-print">' +
      '<div class="pl-title">Placement Diagnostic Report</div>' +
      '<div class="pl-sub"><b>' + esc(studentName()) + '</b> . ' + esc(res.studentId) + ' . ' + esc(String(d.completedAt).slice(0, 10)) + (d.isRetake ? ' . Retake' : ' . First Test') + '</div>' +
      '<div class="pl-rec-level">Recommended Level: <b>' + esc(d.recommendedLevelName) + '</b> - ' + esc(d.confidence) + ' confidence</div>' +
      (res.decision && res.decision.resolvedLevel && res.decision.resolvedLevel !== d.recommendedLevel ? '<div class="pl-note"><b>Final/Current Level:</b> ' + esc(classDisplayName(res.decision.resolvedLevel)) + '</div>' : '') +
      '<div class="pl-note">' + decisionLine(res) + (res.decision && res.decision.decisionSource ? ' . Decision Source: ' + esc(res.decision.decisionSource) : '') + (res.decision && res.decision.decisionAt ? ' . Decision Date: ' + esc(String(res.decision.decisionAt).slice(0, 10)) : '') + '</div>' +
      '<div class="pl-reason">' + esc(d.reasonText) + '</div>' +
      '<table class="pl-table"><tr><th>Domain</th><th>Result</th><th>Evidence</th></tr>' + domRows + '</table>' +
      '<div class="pl-note"><b>Core items:</b> ' + d.itemCount + ' . <b>Elapsed:</b> ~' + (d.elapsedMinutes || 0) + ' min . <b>Speaking:</b> ' + esc(d.speakingStatus) + '</div>' +
      '<div class="pl-note"><b>Technical limitations:</b> ' + esc(techList) + '</div>' +
      (reuseNote ? '<div class="pl-note">' + esc(reuseNote) + '</div>' : '') +
      (d.confidenceReasons && d.confidenceReasons.length ? '<div class="pl-note"><b>Confidence notes:</b> ' + esc(d.confidenceReasons.join('; ')) + '</div>' : '') +
      (res.decision && res.decision.teacherDecision ? '<div class="pl-note"><b>Teacher decision:</b> ' + esc(res.decision.teacherDecision) + (res.decision.teacherNote ? ' - "' + esc(res.decision.teacherNote) + '"' : '') + '</div>' : '') +
      '<div class="pl-actions">' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.printPlacementReport(\''
 + esc(res.resultId) + '\')">Print / Save as PDF</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.exportPlacementReportJSON(\'' + esc(res.resultId) + '\')">JSON</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.exportPlacementReportTXT(\'' + esc(res.resultId) + '\')">TXT</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.copyPlacementSummary(\'' + esc(res.resultId) + '\')">Copy</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.sharePlacementSummary(\'' + esc(res.resultId) + '\')">WhatsApp</button></div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openPlacementHistory()">Placement History</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.open()">Back</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine.requestTeacherReview()">Teacher Review</button></div></div>');
  }
  function openPlacementReport(resultId) { var res = currentResult(resultId); if (resultId) SELECTED_RESULT_ID = resultId; renderPlacementReportFor(res); }
  function printPlacementReport(resultId) { var res = currentResult(resultId); if (!res) return; SELECTED_RESULT_ID = res.resultId; try { window.print(); } catch (e) {} }
  function exportPlacementReportJSON(resultId) { _exportPlacement('json', resultId); }
  function exportPlacementReportTXT(resultId) { _exportPlacement('txt', resultId); }
  function _exportPlacement(kind, resultId) {
    var res = currentResult(resultId); if (!res) return;
    var name = 'zirak-placement-' + String(res.studentId).replace(/[^A-Za-z0-9_-]+/g, '-') + '-' + String(res.diagnostic.completedAt).slice(0, 10);
    var content, type;
    if (kind === 'json') { content = JSON.stringify(res, null, 2); type = 'application/json'; name += '.json'; }
    else { content = buildStudentSummaryText(res); type = 'text/plain'; name += '.txt'; }
    try {
      var blob = new Blob([content], { type: type }); var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500);
    } catch (e) {}
  }
  function copyPlacementSummary(resultId) {
    var res = currentResult(resultId); if (!res) return; var t = buildStudentSummaryText(res);
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t); else { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); } } catch (e) {}
  }
  function sharePlacementSummary(resultId) {
    var res = currentResult(resultId); if (!res) return; var msg = buildStudentSummaryText(res);
    try { window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank'); } catch (e) {}
  }

  function openPlacementHistory() {
    var list = getPlacementHistory();
    if (!list.length) { renderIntro(); return; }
    var rows = list.map(function (r) {
      var d = r.diagnostic; var badge = d.isRetake ? 'Placement Retake' : 'First Placement Test';
      var techBadge = (d.technicalLimitations && d.technicalLimitations.length) ? ' <span class="pl-tech-flag" title="Technical limitations recorded">!</span>' : '';
      return '<div class="pl-hist-card"><div class="pl-hist-top"><b>' + esc(badge) + '</b><span>' + esc(String(d.completedAt).slice(0, 10)) + '</span></div>' +
        '<div class="pl-hist-mid">Recommended: <b>' + esc(d.recommendedLevelName) + '</b> . Confidence: ' + esc(d.confidence) + techBadge + '</div>' +
        '<div class="pl-hist-mid" style="opacity:.85;">' + decisionLine(r) + '</div>' +
        '<div class="pl-hist-mid" style="opacity:.7;font-size:12px;">' + d.itemCount + ' core items' + (d.teacherReviewRecommended ? ' . Teacher review recommended' : '') + '</div>' +
        '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openPlacementReport(\'' + esc(r.resultId) + '\')">View Report</button></div></div>';
    }).join('');
    h('<div class="pl-card"><div class="pl-title">Placement History</div><div class="pl-sub">' + list.length + ' result' + (list.length === 1 ? '' : 's') + ' - newest first</div>' +
      '<div class="pl-hist-list">' + rows + '</div>' +
      (list.length >= 2 ? '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openPlacementComparison()">Compare Results</button></div>' : '') +
      '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine.open()">Back</button></div></div>');
  }

  function openPlacementComparison() {
    var list = getPlacementHistory();
    if (list.length < 2) { openPlacementHistory(); return; }
    var latest = list[0], prev = list[1];
    var ld = latest.diagnostic, pd = prev.diagnostic;
    var confRank = { Low: 0, Medium: 1, High: 2 };
    var confChange = confRank[ld.confidence] > confRank[pd.confidence] ? 'Improved' : confRank[ld.confidence] < confRank[pd.confidence] ? 'Decreased' : 'Unchanged';
    var strongAdded = ld.strongAreas.filter(function (a) { return pd.strongAreas.indexOf(a) === -1; });
    var strongLost = pd.strongAreas.filter(function (a) { return ld.strongAreas.indexOf(a) === -1; });
    var weakAdded = ld.weakAreas.filter(function (a) { return pd.weakAreas.indexOf(a) === -1; });
    var weakResolved = pd.weakAreas.filter(function (a) { return ld.weakAreas.indexOf(a) === -1; });
    h('<div class="pl-card"><div class="pl-title">Placement Comparison</div>' +
      '<div class="pl-sub">Using the stored results exactly as recorded - nothing is recalculated.</div>' +
      '<div class="pl-note"><b>Previous Recommendation:</b> ' + esc(pd.recommendedLevelName) + ' (' + esc(String(pd.completedAt).slice(0, 10)) + ')</div>' +
      '<div class="pl-note"><b>Latest Recommendation:</b> ' + esc(ld.recommendedLevelName) + ' (' + esc(String(ld.completedAt).slice(0, 10)) + ')</div>' +
      '<div class="pl-note"><b>Confidence Change:</b> ' + esc(pd.confidence) + ' -> ' + esc(ld.confidence) + ' (' + esc(confChange) + ')</div>' +
      '<div class="pl-note"><b>Strong Areas Changed:</b> ' + (strongAdded.length ? 'New: ' + esc(strongAdded.join(', ')) + '. ' : '') + (strongLost.length ? 'No longer listed: ' + esc(strongLost.join(', ')) + '.' : '') + (!strongAdded.length && !strongLost.length ? 'No change.' : '') + '</div>' +
      '<div class="pl-note"><b>Areas Needing Support Changed:</b> ' + (weakResolved.length ? 'Improved: ' + esc(weakResolved.join(', ')) + '. ' : '') + (weakAdded.length ? 'New focus: ' + esc(weakAdded.join(', ')) + '.' : '') + (!weakResolved.length && !weakAdded.length ? 'No change.' : '') + '</div>' +
      '<div class="pl-note"><b>Final Decision:</b> ' + decisionLine(latest) + '</div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine.openPlacementHistory()">Back to History</button></div></div>');
  }

  function renderTeacherReview() {
    var res = currentResult(); if (!res) { renderIntro(); return; }
    var acc = getAcceptedInfo(); var d = res.diagnostic;
    var domRows = CORE_DOMAINS.map(function (dm) { var sc = d.domainScores[dm]; return '<tr><td>' + esc(DOMAIN_LABELS[dm]) + '</td><td>' + esc(d.domainLabels[dm]) + '</td><td>' + (sc === null || sc === undefined ? '-' : sc + '%') + '</td></tr>'; }).join('');
    var routeTxt = (d.routeSummary || []).slice(-12).map(function (r) { return r.reason + (r.fromDifficulty !== r.toDifficulty ? (' ' + r.fromDifficulty + '->' + r.toDifficulty) : ''); }).join(', ') || '-';
    var classOpts = (window.SCHOOL_PATH || []).map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === d.recommendedLevel ? ' selected' : '') + '>' + esc(c.en) + '</option>'; }).join('');
    var hist = getPlacementHistory();
    h('<div class="pl-card"><div class="pl-title">Teacher Review - Placement</div>' +
      '<div class="pl-sub"><b>' + esc(studentName()) + '</b> . ' + esc(res.studentId) + ' . ' + esc(String(d.completedAt).slice(0, 10)) + '</div>' +
      '<div class="pl-note"><b>Recommended:</b> ' + esc(d.recommendedLevelName) + ' (' + esc(d.recommendedBandName) + ' band) . <b>Confidence:</b> ' + esc(d.confidence) + ' (' + d.confidenceScore + ')' + ldAlt(d) + '</div>' +
      (acc ? '<div class="pl-note"><b>Current accepted level:</b> ' + esc(classDisplayName(acc.level)) + ' (' + esc(acc.source || '') + ')</div>' : '') +
      '<div class="pl-note"><b>Core items:</b> ' + d.itemCount + ' . <b>Domains assessed:</b> ' + CORE_DOMAINS.filter(function (dm) { return d.domainScores[dm] !== null; }).length + '/6 . <b>Speaking:</b> ' + esc(d.speakingStatus) + '</div>' +
      '<table class="pl-table"><tr><th>Domain</th><th>Result</th><th>Evidence</th></tr>' + domRows + '</table>' +
      '<div class="pl-note"><b>Reason:</b> ' + esc(d.reasonText) + '</div>' +
      '<div class="pl-note"><b>Route summary:</b> ' + esc(routeTxt) + '</div>' +
      '<div class="pl-note"><b>Technical limitations:</b> ' + esc((d.technicalLimitations || []).join(', ') || 'None recorded') + '</div>' +
      '<div class="pl-note"><b>Retake item reuse:</b> ' + d.retakeItemReuseCount + ' reused . ' + d.retakeUniqueItemCount + ' unique . ' + d.previousItemsAvoidedCount + ' previous items avoided</div>' +
      (hist.length > 1 ? '<div class="pl-note"><b>Previous placements:</b> ' + hist.filter(function (r) { return r.resultId !== res.resultId; }).map(function (r) { return esc(String(r.diagnostic.completedAt).slice(0, 10)) + ' -> ' + esc(r.diagnostic.recommendedLevelName); }).join(' . ') + ' . <button type="button" class="pl-link" onclick="ZirakPlacementEngine.openPlacementHistory()">View Placement History</button></div>' : '') +
      '<div class="pl-field"><label>Teacher decision level:</label><select id="pl-teacher-level" class="pl-select">' + classOpts + '</select></div>' +
      '<div class="pl-field"><label>Teacher note:</label><input type="text" id="pl-teacher-note" class="pl-typed" maxlength="300" value="' + esc((res.decision && res.decision.teacherNote) || '') + '"></div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn pl-btn-primary" onclick="ZirakPlacementEngine._tConfirm()">Confirm Recommended Level</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine._tDifferent()">Select Different Level</button></div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine._tRetest()">Request Retest</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine._tKeep()">Keep Existing Level</button>' +
      '<button type="button" class="pl-btn" onclick="ZirakPlacementEngine._tNote()">Save Teacher Note</button></div>' +
      '<div class="pl-actions"><button type="button" class="pl-btn" onclick="ZirakPlacementEngine.renderResultView()">Back to Result</button></div></div>');
  }
  function ldAlt(d) { return d.alternativeBand ? (' . <b>Nearby alternative:</b> ' + esc(d.alternativeBand)) : ''; }
  function _noteVal() { var el = document.getElementById('pl-teacher-note'); return el ? el.value : ''; }
  function _tConfirm() { var res = currentResult(); if (!res) return; _teacherApply(res.diagnostic.recommendedLevel, _noteVal(), 'confirm'); }
  function _tDifferent() {
    var sel = document.getElementById('pl-teacher-level'); var v = sel ? sel.value : ''; if (!v) return;
    var res = currentResult(); if (!res) return;
    if (v !== res.diagnostic.recommendedLevel) _teacherApply(v, (_noteVal() || 'Level differs from Placement Test recommendation - teacher reviewed.'), 'different');
    else _teacherApply(v, _noteVal(), 'different');
  }
  function _tRetest() { _teacherApply('', _noteVal(), 'retest'); startRetake(); }
  function _tKeep() { _teacherApply('', _noteVal(), 'keep'); }
  function _tNote() { _teacherApply('', _noteVal(), 'note'); }

  function migrateLegacy() {
    try {
      if (!studentId()) return;
      var hist = loadHistory();
      var raw = lsGet(nsLegacyKey('placement_result'));
      if (!raw) return;
      var old = JSON.parse(raw); if (!old || !old.classId) return;
      var legacyId = 'plres-legacy-' + (old.date || 'unknown');
      if (hist.results.some(function (r) { return r.resultId === legacyId; })) return;
      if (hist.results.length) return;
      var acc = getAcceptedInfo();
      var decisionStatus = 'pending', resolvedLevel = '', decisionSource = '', decisionAt = '';
      if (acc && acc.level === old.classId) { decisionStatus = acc.source === 'teacher' ? 'teacherConfirmedRecommendation' : acc.source === 'manual' ? 'manualLevelSelected' : 'acceptedRecommendation'; resolvedLevel = old.classId; decisionSource = acc.source || 'placement'; decisionAt = acc.at || ''; }
      hist.results.push({
        resultId: legacyId, sessionId: legacyId, studentId: studentId(),
        diagnostic: {
          completedAt: old.date || '', testVersion: 'legacy', bankVersion: 'legacy',
          recommendedBand: '', recommendedBandName: 'Legacy Placement Result',
          recommendedLevel: old.classId, recommendedLevelName: classDisplayName(old.classId),
          confidence: 'Low', confidenceScore: 0.4, confidenceReasons: ['Legacy Placement Result - limited stored information; teacher review may be recommended.'],
          domainScores: {}, domainLabels: {}, strongAreas: [], weakAreas: [], technicalLimitations: [],
          itemCount: old.total || 0, isRetake: false, elapsedMinutes: 0, routeSummary: [], speakingStatus: 'unavailable',
          reasonText: 'Legacy Placement Result (' + (old.pct != null ? old.pct + '%' : 'score unavailable') + '). Teacher review may be recommended.',
          firstFocus: '', teacherReviewRecommended: true, administeredIds: [],
          retakeItemReuseCount: 0, retakeUniqueItemCount: 0, previousItemsAvoidedCount: 0, linkedPreviousResultId: ''
        },
        decision: { decisionStatus: decisionStatus, resolvedLevel: resolvedLevel, decisionSource: decisionSource, decisionAt: decisionAt, teacherDecision: '', teacherNote: '', linkedAcceptedLevelId: '' }
      });
      saveHistory(hist);
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════════
     I6H-D14B — explicit-student Teacher decision authority.

     The Teacher Command Center must not become a second Placement
     decision engine. These methods are the ONE place (besides the
     active-student _teacherApply(), which now delegates to the same
     core) that ever writes decisionStatus/resolvedLevel/accepted-level
     data. They read and write the TARGET student's own storage keys
     directly — never the active namespace — so Student A's data is
     never touched while deciding for Student B.

     Teacher-PIN gating for these calls is the Teacher Command Center's
     own authorization (already required to reach this code path) —
     this avoids creating a second PIN prompt/authority per Task 12's
     instruction to require "Teacher authorization/PIN according to
     existing policy" (the policy already in force at the call site).
     ══════════════════════════════════════════════════════════════════ */
  function _studentKey(studentId, key) { return 'u_' + studentId + '_' + key; }
  function _studentLegacyKey(studentId, key) { return 'roshan_u_' + studentId + '_' + key; }
  function _loadHistoryForStudent(studentId) {
    var storageKey = _studentKey(studentId, 'placement_history');
    var raw = lsGet(storageKey);
    if (!raw) return { schemaVersion: 1, results: [] };
    try {
      var h = JSON.parse(raw);
      if (!h || !Array.isArray(h.results)) { backupCorruptValue(_studentKey(studentId, 'placement_history_corrupt_backup'), storageKey, raw, 'not a valid history object'); return { schemaVersion: 1, results: [] }; }
      return h;
    } catch (e) {
      backupCorruptValue(_studentKey(studentId, 'placement_history_corrupt_backup'), storageKey, raw, e && e.message);
      return { schemaVersion: 1, results: [] };
    }
  }
  function _saveHistoryForStudent(studentId, h) { lsSet(_studentKey(studentId, 'placement_history'), JSON.stringify(h)); }
  function _getAcceptedForStudent(studentId) { try { var raw = lsGet(_studentLegacyKey(studentId, 'placement_accepted')); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function _setAcceptedForStudent(studentId, level, source, at) {
    lsSet(_studentLegacyKey(studentId, 'placement_accepted'), JSON.stringify({ level: level, source: source || 'teacher', at: at || nowISO() }));
  }
  function _resolveDecisionForStudent(studentId, resultId, patch) {
    if (!studentId || !resultId || !patch) return false;
    var h = _loadHistoryForStudent(studentId); var found = false;
    h.results.forEach(function (r) {
      if (r.resultId !== resultId) return;
      found = true;
      if (!r.decision) r.decision = { decisionStatus: 'pending', resolvedLevel: '', decisionSource: '', decisionAt: '', teacherDecision: '', teacherNote: '', linkedAcceptedLevelId: '' };
      ['decisionStatus', 'resolvedLevel', 'decisionSource', 'decisionAt', 'linkedAcceptedLevelId'].forEach(function (k) { if (patch[k] !== undefined) r.decision[k] = patch[k]; });
      if (patch.teacherDecision !== undefined) r.decision.teacherDecision = patch.teacherDecision;
      if (patch.teacherNote !== undefined && patch.teacherNote) r.decision.teacherNote = String(patch.teacherNote).slice(0, 500);
    });
    if (found) _saveHistoryForStudent(studentId, h);
    return found;
  }
  function _emitPlacementRefresh(studentId) {
    try {
      if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('zirak:tcc-refresh', { detail: { scope: 'placement', studentId: studentId } }));
      }
    } catch (e) {}
  }
  // ONE shared final-mutation core. Both the active-student _teacherApply()
  // (via a thin explicit-student-aware refactor below) and the new
  // explicit-student public methods route through this — so there is
  // exactly one place that ever writes a Placement decision.
  function applyTeacherPlacementDecisionFor(studentId, resultId, classId, note, decision) {
    if (!studentId || !resultId) return { ok: false, reason: 'missing-student-or-result' };
    var history = _loadHistoryForStudent(studentId);
    var res = history.results.find(function (r) { return r.resultId === resultId; });
    if (!res) return { ok: false, reason: 'result-not-found-for-student' };
    var acceptedBefore = _getAcceptedForStudent(studentId);
    var nowStamp = nowISO();
    if (decision === 'confirm' || decision === 'different') {
      _resolveDecisionForStudent(studentId, resultId, {
        decisionStatus: decision === 'confirm' ? 'teacherConfirmedRecommendation' : 'teacherSelectedDifferentLevel',
        resolvedLevel: classId, decisionSource: 'teacher', decisionAt: nowStamp,
        teacherDecision: decision === 'confirm' ? ('Confirmed ' + classDisplayName(classId)) : ('Selected ' + classDisplayName(classId)),
        teacherNote: note, linkedAcceptedLevelId: 'accepted_' + nowStamp
      });
      _setAcceptedForStudent(studentId, classId, 'teacher', nowStamp);
    } else if (decision === 'keep') {
      _resolveDecisionForStudent(studentId, resultId, {
        decisionStatus: 'keptExistingLevel', resolvedLevel: acceptedBefore ? acceptedBefore.level : '',
        decisionSource: 'teacher', decisionAt: nowStamp, teacherDecision: 'Kept existing level', teacherNote: note,
        linkedAcceptedLevelId: acceptedBefore ? ('accepted_' + (acceptedBefore.at || nowStamp)) : ''
      });
    } else if (decision === 'retest') {
      _resolveDecisionForStudent(studentId, resultId, { decisionStatus: 'retestRequested', decisionSource: 'teacher', decisionAt: nowStamp, teacherDecision: 'Requested retest', teacherNote: note });
    } else {
      return { ok: false, reason: 'unknown-decision' };
    }
    // Plan regeneration signal — only for decisions that change the
    // accepted level, matching the active-student behavior exactly.
    if (decision === 'confirm' || decision === 'different') {
      try { if (window.ZirakLearningPlan && window.ZirakLearningPlan.onAcceptedLevelChanged) window.ZirakLearningPlan.onAcceptedLevelChanged(studentId); } catch (e) {}
    }
    _emitPlacementRefresh(studentId);
    return { ok: true, resultId: resultId, decisionStatus: (decision === 'confirm' ? 'teacherConfirmedRecommendation' : decision === 'different' ? 'teacherSelectedDifferentLevel' : decision === 'keep' ? 'keptExistingLevel' : 'retestRequested') };
  }

  function teacherKeepExistingLevelFor(studentId, resultId, note) {
    return applyTeacherPlacementDecisionFor(studentId, resultId, '', note || '', 'keep');
  }
  function teacherConfirmRecommendationFor(studentId, resultId, note) {
    var history = _loadHistoryForStudent(studentId);
    var res = history.results.find(function (r) { return r.resultId === resultId; });
    if (!res) return { ok: false, reason: 'result-not-found-for-student' };
    return applyTeacherPlacementDecisionFor(studentId, resultId, res.diagnostic.recommendedLevel, note || '', 'confirm');
  }
  function teacherSelectLevelFor(studentId, resultId, classId, note) {
    if (!classId) return { ok: false, reason: 'missing-classId' };
    return applyTeacherPlacementDecisionFor(studentId, resultId, classId, note || '', 'different');
  }
  function authorizeRetakeFor(studentId, reason) {
    if (!studentId) return { ok: false, reason: 'missing-student' };
    var history = _loadHistoryForStudent(studentId);
    var latest = history.results.slice().sort(function (a, b) { return String(b.diagnostic.completedAt).localeCompare(String(a.diagnostic.completedAt)); })[0];
    if (!latest) return { ok: false, reason: 'no-placement-history' };
    var r = applyTeacherPlacementDecisionFor(studentId, latest.resultId, '', reason || '', 'retest');
    return r;
  }

  window.ZirakPlacementEngine = {
    version: ENGINE_VERSION, RULES: PLACEMENT_RULES, WEIGHTS: DOMAIN_WEIGHTS,
    open: open, close: close, start: start, pause: pause, resume: resume, abandon: abandon,
    getSession: function () { return PL; },
    answerCurrentItem: answerCurrentItem, replayListeningPrompt: replayListeningPrompt,
    startSpeaking: _speakStart, skipOptionalSpeaking: skipOptionalSpeaking,
    complete: complete, getResult: latestResult, getResultById: getResultById,
    acceptRecommendation: acceptRecommendation, openManualLevelSelection: openManualLevelSelection,
    recordLevelDecision: recordLevelDecision,
    requestTeacherReview: requestTeacherReview, confirmLevelAsTeacher: confirmLevelAsTeacher,
    // I6H-D14B: explicit-student Teacher decision authority (Task 12).
    // I6H-D14C (Task 24): the ONE final mutation authority — both
    // active-student _teacherApply() and the explicit-student methods
    // below route through this single function.
    applyTeacherPlacementDecisionFor: applyTeacherPlacementDecisionFor,
    teacherKeepExistingLevelFor: teacherKeepExistingLevelFor,
    teacherConfirmRecommendationFor: teacherConfirmRecommendationFor,
    teacherSelectLevelFor: teacherSelectLevelFor,
    authorizeRetakeFor: authorizeRetakeFor,
    getPlacementHistoryFor: function (studentId) { return _loadHistoryForStudent(studentId).results.slice().sort(function (a, b) { return String(b.diagnostic.completedAt).localeCompare(String(a.diagnostic.completedAt)); }); },
    getResultByIdFor: function (studentId, resultId) { var h = _loadHistoryForStudent(studentId); return h.results.find(function (r) { return r.resultId === resultId; }) || null; },
    startRetake: startRetake, getPlacementHistory: getPlacementHistory,
    resolvePlacementStartMode: resolvePlacementStartMode, getPlacementDecisionState: getPlacementDecisionState,
    openPlacementReport: openPlacementReport, printPlacementReport: printPlacementReport,
    exportPlacementReportJSON: exportPlacementReportJSON, exportPlacementReportTXT: exportPlacementReportTXT,
    copyPlacementSummary: copyPlacementSummary, sharePlacementSummary: sharePlacementSummary,
    openPlacementHistory: openPlacementHistory, openPlacementComparison: openPlacementComparison,
    getHistoryCorruptBackups: getHistoryCorruptBackups, getSessionCorruptBackups: getSessionCorruptBackups,
    migrateLegacy: migrateLegacy, renderResultView: renderResultView,
    _pick: _pick, _word: _word, _orderClear: _orderClear, _orderSubmit: _orderSubmit,
    _typedSubmit: _typedSubmit, _playSoundCheck: _playSoundCheck, _soundOk: _soundOk, _soundSkip: _soundSkip,
    _confirmStartAgain: _confirmStartAgain, _startAgainConfirmed: _startAgainConfirmed, _confirmAccept: _confirmAccept,
    _speakPlay: _speakPlay, _speakStart: _speakStart, _speakNext: _speakNext,
    _tConfirm: _tConfirm, _tDifferent: _tDifferent, _tRetest: _tRetest, _tKeep: _tKeep, _tNote: _tNote,
    _test: {
      blankSession: blankSession, buildScreeningQueue: buildScreeningQueue,
      setPL: function (s) { PL = s; }, getPL: function () { return PL; },
      nextCoreStep: nextCoreStep, gradeItemAnswer: gradeItemAnswer, addEvidence: addEvidence, routeAfterAnswer: routeAfterAnswer,
      advancePhaseIfNeeded: advancePhaseIfNeeded, computeRecommendation: computeRecommendation,
      bandReadiness: bandReadiness, currentAbilityEstimate: currentAbilityEstimate, itemById: itemById,
      saveSession: saveSession, loadSession: loadSession, loadHistory: loadHistory, saveHistory: saveHistory,
      BANDS: BANDS, BAND_TO_CLASS: BAND_TO_CLASS, resolveDecision: resolveDecision,
      getLatestUnresolvedResult: getLatestUnresolvedResult, teacherApply: _teacherApply,
      backupCorruptValue: backupCorruptValue, pickItem: pickItem, renderCurrentItem: renderCurrentItem,
      setSelectedResultId: function (id) { SELECTED_RESULT_ID = id; }, getSelectedResultId: function () { return SELECTED_RESULT_ID; }
    }
  };

  try { migrateLegacy(); } catch (e) {}
})();
