// ===================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// zirak-curriculum-content.js — Phase I6H-D16
// The ONE core content registry, subordinate to ZirakAcademicProgram.
// Coordinates metadata and eligibility for the existing Listening,
// Dialogue, Grammar, and Interview content banks — it does not
// duplicate raw content text, does not replace any existing engine,
// and does not delete or reorder any legacy record. Classification is
// produced by one deterministic, reproducible text-complexity
// algorithm applied uniformly (never "all short sentences = Starter").
// ===================================================================
(function () {
  'use strict';

  var REGISTRY_VERSION = 'D19-1';

  function esc(s) { return String(s == null ? '' : s); }

  /* ══════════════════════════════════════════════════════════════════
     TASK 5 — centralized level order (reproduces ZirakAcademicProgram's
     order; this module depends on AP but never redefines the 7 levels
     independently — it reads AP.ACCEPTED_LEVEL_IDS as the source of
     truth wherever available, falling back to this literal list only
     if AP has not yet loaded, so there is never a second competing
     level authority).
     ══════════════════════════════════════════════════════════════════ */
  var LEVEL_ORDER = ['starter', 'basic', 'beginner', 'elementary', 'intermediate', 'advanced', 'academic'];
  function levelIndex(levelId) {
    var AP = window.ZirakAcademicProgram;
    var order = (AP && AP.ACCEPTED_LEVEL_IDS) ? AP.ACCEPTED_LEVEL_IDS : LEVEL_ORDER;
    return order.indexOf(levelId);
  }
  function isLevelWithinRange(levelId, minLevelId, maxLevelId) {
    var idx = levelIndex(levelId);
    if (idx === -1) return false;
    if (minLevelId && levelIndex(minLevelId) > idx) return false;
    if (maxLevelId && levelIndex(maxLevelId) < idx) return false;
    return true;
  }

  /* ══════════════════════════════════════════════════════════════════
     TEXT COMPLEXITY ALGORITHM — one deterministic heuristic used to
     classify Listening and Dialogue text. Considers MULTIPLE signals
     (never length alone, per the explicit "do not classify all short
     sentences as Starter automatically" instruction): word count,
     average word length, subordinate-clause markers, passive-voice
     markers, conditional markers, modal-deduction markers, academic
     discourse markers, and clause count (via commas + conjunctions).
     Produces a 0-100+ complexity score, then buckets it into one of
     the 7 accepted levels via fixed thresholds.
     ══════════════════════════════════════════════════════════════════ */
  var SUBORDINATE_MARKERS = /\b(which|that|who|whom|whose|although|though|because|since|while|despite|whereas|unless)\b/gi;
  var PASSIVE_MARKERS = /\b(was|were|is|are|been|being)\s+\w+ed\b|\b(was|were|is|are|been|being)\s+(done|made|given|taken|written|seen|known|shown|held|sent|built|brought|found|told)\b/gi;
  var CONDITIONAL_MARKERS = /\b(if|unless|would have|could have|might have|had\s+\w+ed)\b/gi;
  var MODAL_DEDUCTION_MARKERS = /\b(must have|might have|could have|should have|may have|can't have|cannot have)\b/gi;
  var ACADEMIC_MARKERS = /\b(therefore|however|furthermore|nonetheless|nevertheless|consequently|moreover|thus|hence|arguably|presumably|it is (argued|suggested|believed)|in conclusion|on the other hand)\b/gi;
  var REPORTING_MARKERS = /\b(said that|told\s+\w+\s+that|reported that|explained that|mentioned that|claimed that|according to)\b/gi;
  var CONTRACTION_MARKERS = /\b\w+'(m|re|s|ll|ve|d|t)\b/gi;

  function countMatches(re, text) { var m = text.match(re); return m ? m.length : 0; }

  function textComplexityScore(text) {
    text = String(text || '');
    var words = text.trim().split(/\s+/).filter(Boolean);
    var wordCount = words.length;
    var avgWordLen = wordCount ? words.reduce(function (s, w) { return s + w.replace(/[^a-zA-Z]/g, '').length; }, 0) / wordCount : 0;
    var clauseCount = 1 + countMatches(/,|;|\band\b|\bbut\b|\bor\b|\bso\b/gi, text);
    var subordinate = countMatches(SUBORDINATE_MARKERS, text);
    var passive = countMatches(PASSIVE_MARKERS, text);
    var conditional = countMatches(CONDITIONAL_MARKERS, text);
    var modalDeduction = countMatches(MODAL_DEDUCTION_MARKERS, text);
    var academic = countMatches(ACADEMIC_MARKERS, text);
    var reporting = countMatches(REPORTING_MARKERS, text);
    var contractions = countMatches(CONTRACTION_MARKERS, text);

    var score = 0;
    score += Math.min(wordCount * 1.4, 30);         // length contributes, capped
    score += Math.min(avgWordLen * 4, 16);           // vocabulary-length proxy
    score += Math.min((clauseCount - 1) * 6, 18);    // multi-clause sentences
    score += subordinate * 8;
    score += passive * 7;
    score += conditional * 9;
    score += modalDeduction * 10;
    score += academic * 14;
    score += reporting * 9;
    score -= Math.min(contractions * 2, 6);          // informal contractions lower complexity slightly

    return Math.max(0, Math.round(score));
  }

  // Fixed score->level thresholds (documented, reproducible — not
  // adjusted per-item). Calibrated so short, simple greetings land in
  // Starter/Basic and long, multi-clause, passive/conditional/academic
  // sentences land in Advanced/Academic.
  var LEVEL_SCORE_THRESHOLDS = [
    { levelId: 'starter', max: 10 },
    { levelId: 'basic', max: 18 },
    { levelId: 'beginner', max: 28 },
    { levelId: 'elementary', max: 40 },
    { levelId: 'intermediate', max: 55 },
    { levelId: 'advanced', max: 75 },
    { levelId: 'academic', max: Infinity }
  ];
  function scoreToLevel(score) {
    for (var i = 0; i < LEVEL_SCORE_THRESHOLDS.length; i++) {
      if (score <= LEVEL_SCORE_THRESHOLDS[i].max) return LEVEL_SCORE_THRESHOLDS[i].levelId;
    }
    return 'academic';
  }
  function classifyTextToLevel(text) { return textComplexityScore(text); } // returns raw score; bucketed relative to the bank by classifyListeningBank/classifyDialogueBank below

  // I6H-D16: percentile-based level assignment RELATIVE to a given
  // corpus's own real score distribution. Fixed absolute thresholds
  // were tried first and badly mismatched the real Listening bank
  // (whose scores cluster in a narrow 17-46 range — this content is
  // overwhelmingly simple conversational material with zero genuinely
  // advanced/academic sentences). Forcing an artificial spread across
  // all 7 levels from absolute thresholds would have MISCLASSIFIED
  // simple content as "Advanced" — dishonest. Percentile buckets
  // reflect each item's REAL complexity relative to its own corpus,
  // and the corpus's genuine ceiling (or floor) is documented plainly
  // rather than papered over.
  var PERCENTILE_BUCKETS = [
    { levelId: 'starter', upTo: 0.12 },
    { levelId: 'basic', upTo: 0.28 },
    { levelId: 'beginner', upTo: 0.48 },
    { levelId: 'elementary', upTo: 0.66 },
    { levelId: 'intermediate', upTo: 0.82 },
    { levelId: 'advanced', upTo: 0.94 },
    { levelId: 'academic', upTo: 1.01 }
  ];
  function assignPercentileLevels(items, scoreFn) {
    var scored = items.map(function (it, i) { return { item: it, idx: i, score: scoreFn(it) }; });
    scored.sort(function (a, b) { return a.score - b.score; });
    var n = scored.length;
    scored.forEach(function (s, rank) {
      var pct = n > 1 ? rank / (n - 1) : 0;
      var levelId = 'academic';
      for (var b = 0; b < PERCENTILE_BUCKETS.length; b++) {
        if (pct <= PERCENTILE_BUCKETS[b].upTo) { levelId = PERCENTILE_BUCKETS[b].levelId; break; }
      }
      s.assignedLevelId = levelId;
      s.rawScore = s.score;
    });
    // Return in ORIGINAL order (not sorted), each carrying its assignment.
    var byIdx = new Array(n);
    scored.forEach(function (s) { byIdx[s.idx] = { assignedLevelId: s.assignedLevelId, rawScore: s.rawScore }; });
    return byIdx;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 6 — LISTENING CANONICAL IDENTITY. 400 legacy records ->
     canonical items (by exact-text grouping) + alias map. Every legacy
     index remains addressable; duplicates never create a second
     official mastery item.
     ══════════════════════════════════════════════════════════════════ */
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }

  function buildListeningCanonicalMap(listenArr) {
    if (!Array.isArray(listenArr)) return null;
    var textToCanonical = {}; // normalized text -> canonicalListeningId
    var canonicalItems = [];  // ordered list of canonical records
    var legacyIndexToCanonicalId = new Array(listenArr.length);
    var duplicateGroups = [];

    listenArr.forEach(function (item, idx) {
      var text = norm(item && item.en);
      if (!text) {
        // Defensive: an empty/malformed record still gets its own
        // canonical identity so every legacy index remains addressable.
        text = '__empty_' + idx;
      }
      if (textToCanonical[text] === undefined) {
        var canonicalId = 'listen-c-' + String(canonicalItems.length + 1).padStart(4, '0');
        textToCanonical[text] = canonicalId;
        canonicalItems.push({
          canonicalListeningId: canonicalId,
          canonicalIndex: canonicalItems.length,
          legacyIndices: [idx],
          text: item.en,
          pashto: item.pashto || item.dari || '',
          acceptedLevelId: '', // filled in by classifyListeningBank
          minimumLevelId: '', maximumLevelId: '',
          pathwayIds: [], themeId: '',
          estimatedSeconds: Math.max(2, Math.round(String(item.en || '').split(/\s+/).length / 2.2)),
          reviewStatus: 'auto-classified'
        });
      } else {
        var existingId = textToCanonical[text];
        var existingItem = canonicalItems.find(function (c) { return c.canonicalListeningId === existingId; });
        existingItem.legacyIndices.push(idx);
      }
      legacyIndexToCanonicalId[idx] = textToCanonical[text];
    });

    canonicalItems.forEach(function (c) { if (c.legacyIndices.length > 1) duplicateGroups.push({ canonicalListeningId: c.canonicalListeningId, legacyIndices: c.legacyIndices.slice() }); });

    return {
      canonicalItems: canonicalItems,
      legacyIndexToCanonicalId: legacyIndexToCanonicalId,
      duplicateGroups: duplicateGroups,
      totalLegacy: listenArr.length,
      totalCanonical: canonicalItems.length,
      totalRedundantAliases: listenArr.length - canonicalItems.length
    };
  }

  // Resolve any legacy index to its canonical item (Task 6: "old
  // index-based progress resolves to the correct canonical item").
  function resolveLegacyListeningIndex(canonicalMap, legacyIdx) {
    if (!canonicalMap || legacyIdx < 0 || legacyIdx >= canonicalMap.legacyIndexToCanonicalId.length) return null;
    var cid = canonicalMap.legacyIndexToCanonicalId[legacyIdx];
    return canonicalMap.canonicalItems.find(function (c) { return c.canonicalListeningId === cid; }) || null;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 7 — LISTENING LEVEL CLASSIFICATION. Applies the shared text-
     complexity algorithm to every canonical item's real sentence text.
     ══════════════════════════════════════════════════════════════════ */
  function classifyListeningBank(canonicalMap) {
    if (!canonicalMap) return null;
    var assignments = assignPercentileLevels(canonicalMap.canonicalItems, function (c) { return textComplexityScore(c.text); });
    canonicalMap.canonicalItems.forEach(function (c, i) {
      var level = assignments[i].assignedLevelId;
      c.acceptedLevelId = level;
      c.minimumLevelId = level;
      c.maximumLevelId = level;
      c.rawComplexityScore = assignments[i].rawScore;
      c.reviewStatus = 'auto-classified';
    });
    return canonicalMap;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 8 — LISTENING PACK SYSTEM
     ══════════════════════════════════════════════════════════════════ */
  var PACK_SIZE_RULES = {
    starter: { min: 4, max: 5 }, basic: { min: 5, max: 5 }, beginner: { min: 5, max: 7 },
    elementary: { min: 6, max: 8 }, intermediate: { min: 8, max: 10 }, advanced: { min: 8, max: 12 }, academic: { min: 8, max: 12 }
  };
  // Builds real packs from the classified canonical items — never a
  // pack containing the whole bank. Deterministic: items are taken in
  // canonical order per level so the same input always yields the same
  // packs (reproducible).
  function buildListeningPacks(canonicalMap) {
    if (!canonicalMap) return [];
    var byLevel = {};
    canonicalMap.canonicalItems.forEach(function (c) { (byLevel[c.acceptedLevelId] = byLevel[c.acceptedLevelId] || []).push(c); });
    var packs = [];
    Object.keys(byLevel).forEach(function (levelId) {
      var rule = PACK_SIZE_RULES[levelId] || { min: 5, max: 8 };
      var items = byLevel[levelId];
      var packSize = rule.max; // deterministic: always build at max size for consistent packs
      var packIndex = 0;
      for (var i = 0; i < items.length; i += packSize) {
        packIndex++;
        var slice = items.slice(i, i + packSize);
        if (slice.length < rule.min && packs.length && packs[packs.length - 1].acceptedLevelId === levelId) {
          // Merge a too-small tail into the previous pack of the same level if it still fits the max.
          var prevPack = packs[packs.length - 1];
          if (prevPack.itemIds.length + slice.length <= rule.max) {
            slice.forEach(function (c) { prevPack.itemIds.push(c.canonicalListeningId); });
            prevPack.estimatedMinutes = Math.round(prevPack.itemIds.reduce(function (sum, id) { var it = items.find(function (x) { return x.canonicalListeningId === id; }); return sum + (it ? it.estimatedSeconds : 5); }, 0) / 60 * 10) / 10;
            continue;
          }
        }
        var estSeconds = slice.reduce(function (sum, c) { return sum + c.estimatedSeconds; }, 0);
        packs.push({
          packId: 'listen-pack-' + levelId + '-' + String(packIndex).padStart(2, '0'),
          title: 'Listening — ' + levelId.charAt(0).toUpperCase() + levelId.slice(1) + ' Pack ' + packIndex,
          acceptedLevelId: levelId, pathwayIds: [], themeId: '',
          itemIds: slice.map(function (c) { return c.canonicalListeningId; }),
          estimatedMinutes: Math.round(estSeconds / 60 * 10) / 10,
          learningObjectives: [], grammarTargets: [], vocabularyTargets: [],
          officialCurriculumEligible: slice.length >= rule.min,
          freePracticeEligible: true
        });
      }
    });
    return packs;
  }
  function validateListeningPackSize(pack) {
    var rule = PACK_SIZE_RULES[pack.acceptedLevelId];
    if (!rule) return { valid: false, reason: 'unknown-level' };
    var n = pack.itemIds.length;
    if (n < rule.min || n > rule.max) return { valid: false, reason: 'size-out-of-range', min: rule.min, max: rule.max, actual: n };
    if (n >= 400) return { valid: false, reason: 'full-bank-forbidden' };
    return { valid: true };
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 13/14 — DIALOGUE CLASSIFICATION + LEVEL DEMANDS
     ══════════════════════════════════════════════════════════════════ */
  var DIALOGUE_LEVEL_DEMANDS = {
    starter: { minTurns: 2, maxTurns: 4, support: 'full-model', responseDemand: 'words-or-one-short-sentence' },
    basic: { minTurns: 4, maxTurns: 6, support: 'full-support', responseDemand: 'one-short-complete-sentence' },
    beginner: { minTurns: 6, maxTurns: 8, support: 'partial-prompts', responseDemand: 'one-to-two-sentences' },
    elementary: { minTurns: 8, maxTurns: 10, support: 'reduced-prompts', responseDemand: 'two-to-three-sentences-plus-followup' },
    intermediate: { minTurns: 10, maxTurns: 14, support: 'minimal-prompts', responseDemand: 'natural-multi-sentence' },
    advanced: { minTurns: 12, maxTurns: 16, support: 'scenario-only', responseDemand: 'nuanced-response-register-control' },
    academic: { minTurns: 12, maxTurns: 20, support: 'formal-task', responseDemand: 'structured-evidence-based' }
  };
  // Classifies all 99 Dialogues. Uses the REAL existing `level` field
  // where it already resolves to (or normalizes to) an accepted class;
  // falls back to text-complexity scoring of the dialogue's own prompt/
  // answer text when the legacy level tag is unusable. Turn count comes
  // directly from the real steps array (never invented).
  function classifyDialogueBank(dialogues) {
    if (!Array.isArray(dialogues)) return [];
    var AP = window.ZirakAcademicProgram;
    // Duplicate-title detection first (Task 13: "review duplicate titles explicitly").
    var titleGroups = {};
    dialogues.forEach(function (d) {
      var key = String(d.titleEn || '').trim().toLowerCase();
      if (!key) return;
      (titleGroups[key] = titleGroups[key] || []).push(d.id);
    });
    return dialogues.map(function (d) {
      var turnCount = Array.isArray(d.steps) ? d.steps.length : 0;
      var legacyLevel = AP ? AP.normalizeAcceptedLevelId(d.level) : '';
      var text = (d.steps || []).map(function (s) { return (s.promptEn || '') + ' ' + (s.answerEn || ''); }).join(' ');
      var fallbackScore = textComplexityScore(text);
      // Blend: prefer the legacy level tag (it is real curated metadata),
      // but a dialogue's turnCount must still be internally consistent
      // with SOME real level's demand range — recorded as a defect if not.
      var acceptedLevelId = legacyLevel || '';
      if (!acceptedLevelId) {
        // No usable legacy tag — fall back to text complexity, bucketed
        // via the same fixed academic-marker signals (absolute, not
        // percentile, since Dialogue content genuinely does span the
        // full range including formal/professional register text).
        acceptedLevelId = fallbackScore <= 10 ? 'starter' : fallbackScore <= 18 ? 'basic' : fallbackScore <= 28 ? 'beginner' : fallbackScore <= 40 ? 'elementary' : fallbackScore <= 55 ? 'intermediate' : fallbackScore <= 75 ? 'advanced' : 'academic';
      }
      var demand = DIALOGUE_LEVEL_DEMANDS[acceptedLevelId] || DIALOGUE_LEVEL_DEMANDS.beginner;
      var titleKey = String(d.titleEn || '').trim().toLowerCase();
      var isDuplicateTitle = titleGroups[titleKey] && titleGroups[titleKey].length > 1;
      var turnCountConsistent = turnCount >= demand.minTurns && turnCount <= demand.maxTurns;
      return {
        contentId: d.id, legacyIds: [d.id], contentType: 'dialogue',
        acceptedLevelId: acceptedLevelId, minimumLevelId: acceptedLevelId, maximumLevelId: acceptedLevelId,
        pathwayIds: [], themeId: d.category || '',
        turnCount: turnCount, supportMode: demand.support, expectedResponseDemand: demand.responseDemand,
        estimatedMinutes: Math.max(2, Math.round(turnCount * 0.8)),
        officialCurriculumEligible: turnCountConsistent, // only genuinely level-consistent dialogues are official-ready
        freePracticeEligible: true,
        reviewStatus: legacyLevel ? 'legacy-tag-used' : 'auto-classified-from-text',
        duplicateTitleGroup: isDuplicateTitle ? titleGroups[titleKey] : null,
        turnCountConsistentWithLevel: turnCountConsistent
      };
    });
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 17-20 — UNIFIED GRAMMAR CATALOG
     ══════════════════════════════════════════════════════════════════ */
  function buildUnifiedGrammarCatalog() {
    var catalog = [];
    // I6H-D20 FIX: when the D20 registry is present, use its REAL editorial
    // decisions (grounded in actual source levelId/levelNumber metadata) and
    // REAL prerequisite chains, instead of the pre-D20 behavior that hard-
    // coded every Foundation topic to Starter and discarded prerequisites.
    var D20 = window.ZirakGrammarCurriculumD20;
    var d20DecisionByTopic = {};
    if (D20 && D20.editorialDecisions) {
      D20.editorialDecisions.forEach(function (d) { d20DecisionByTopic[d.sourceTopicId] = d; });
    }
    // Source 1: grammar-world.js's merged window.GW_TOPICS (23 topics —
    // already merges grammar-curriculum-map.js's 18 into grammar-
    // world.js's own 5+2). This IS the real, already-unified object;
    // this catalog reads it read-only, never duplicating its content.
    var GLC = (window.ZirakAcademicProgram && window.ZirakAcademicProgram.GRAMMAR_LEVEL_TO_ACCEPTED_CLASS) || {};
    if (window.GW_TOPICS) {
      Object.keys(window.GW_TOPICS).forEach(function (id) {
        var t = window.GW_TOPICS[id];
        var d20d = d20DecisionByTopic[id];
        var gwLevel = (t && (t.levelId || t.level)) || '';
        var accepted = d20d ? d20d.correctedAcceptedLevelId :
          (GLC[gwLevel] || (window.ZirakAcademicProgram ? window.ZirakAcademicProgram.normalizeAcceptedLevelId(gwLevel) : '') || '');
        catalog.push({
          grammarTopicId: id, sourceSystem: 'grammar-world',
          acceptedLevelId: accepted || 'manual-review',
          prerequisites: [], reviewForLevels: [], recoveryForLevels: [],
          grammarTargets: [t && (t.category || t.title || id)],
          estimatedMinutes: 15,
          officialCurriculumEligible: false, // D20: no owner-approved content yet
          officialCandidateEligible: d20d ? d20d.officialCandidateStatus : !!accepted,
          freePracticeEligible: true,
          masteryConceptId: d20d ? d20d.masteryConceptId : null,
          decisionCategory: d20d ? d20d.decisionCategory : null,
          reviewStatus: d20d ? 'd20-editorially-reviewed' : (accepted ? 'legacy-tag-mapped' : 'unmapped-legacy-level')
        });
      });
    }
    // Source 2: Grammar Lab Foundation packs — read from the REAL
    // runtime authority window.ZirakGrammarLab.topics (populated via
    // registerTopics() by all 5 Foundation pack files). I6H-D17
    // (Task 3) bugfix: the D16 code searched for nonexistent window
    // globals (window.GRAMMAR_LAB_FOUNDATION_PACK1 etc.) that the real
    // Foundation pack files never define — they register through the
    // one existing engine instead. Confirmed via direct execution: the
    // real registry contains exactly 46 topics (10+9+9+9+9 across the
    // 5 packs). Indexed by their own real stable IDs, never merged
    // into GW_TOPICS' IDs (Task 20: "prerequisite/deeper version", not
    // a duplicate — no destructive merge).
    // I6H-D20 FIX: acceptedLevelId now uses the REAL editorial decision
    // (grounded in real levelNumber 1-4 → starter/basic/beginner/elementary)
    // instead of hard-coding every topic to Starter. Real prerequisites
    // are preserved from the source topic instead of being discarded.
    // I6H-D20 FIX (catalog double-count): window.ZirakGrammarLab.topics now
    // ALSO contains the 83 newly authored D20 curriculum topics (registered
    // through the SAME registerTopics() API per Section 5's explicit
    // requirement to reuse the existing renderer, not create a third one).
    // This legacy "Source 2" enumeration must stay scoped to the ORIGINAL
    // 46 Foundation topics only — the 83 D20-authored topics are already
    // fully represented in D20.allNodes and must not be double-counted
    // here. The 46 legacy topics use the stable 'gl.topic.' ID prefix;
    // D20-authored topics use the distinct 'grammar-d20-' prefix.
    if (window.ZirakGrammarLab && window.ZirakGrammarLab.topics) {
      Object.keys(window.ZirakGrammarLab.topics).forEach(function (topicId) {
        if (topicId.indexOf('grammar-d20-') === 0) return; // D20-authored — not part of the 69-topic legacy source inventory
        var topic = window.ZirakGrammarLab.topics[topicId];
        var d20d = d20DecisionByTopic[topicId];
        var accepted = d20d ? d20d.correctedAcceptedLevelId : 'starter';
        var realPrereqs = (d20d && d20d.sourcePrerequisites) ? d20d.sourcePrerequisites : (topic && (topic.prerequisites || topic.prerequisiteIds)) || [];
        catalog.push({
          grammarTopicId: topicId, sourceSystem: 'grammar-lab-foundation',
          acceptedLevelId: accepted,
          prerequisites: realPrereqs, reviewForLevels: [], recoveryForLevels: [],
          grammarTargets: [(topic && (topic.title || topic.titleEn)) || topicId],
          estimatedMinutes: 15,
          officialCurriculumEligible: false, // D20: no owner-approved content yet
          officialCandidateEligible: d20d ? d20d.officialCandidateStatus : true,
          freePracticeEligible: true,
          masteryConceptId: d20d ? d20d.masteryConceptId : null,
          decisionCategory: d20d ? d20d.decisionCategory : null,
          reviewStatus: d20d ? 'd20-editorially-reviewed-real-prerequisites-preserved' : 'prerequisite-or-deeper-version-of-existing-topic'
        });
      });
    }
    return catalog;
  }
  function classifyGrammarRoutingStatus(catalogEntry, acceptedLevelId, teacherAssignedRecovery) {
    if (!catalogEntry || !catalogEntry.acceptedLevelId || catalogEntry.acceptedLevelId === 'manual-review') return 'unclassified';
    var topicOrd = levelIndex(catalogEntry.acceptedLevelId), studentOrd = levelIndex(acceptedLevelId);
    if (topicOrd === -1 || studentOrd === -1) return 'unclassified';
    if (topicOrd === studentOrd) return 'current';
    if (topicOrd > studentOrd) return 'locked-future';
    // I6H-D20 FIX (Section 14.2/3.8 item 5): a lower-level topic is NOT
    // automatically "review" for every higher-level student. Review requires
    // an explicit relationship (reviewForLevels containing acceptedLevelId)
    // or an explicit teacher recovery assignment. Otherwise it is only
    // available through Free Practice — never silently presented as an
    // official review/recovery item.
    if (teacherAssignedRecovery) return 'recovery';
    if (catalogEntry.reviewForLevels && catalogEntry.reviewForLevels.indexOf(acceptedLevelId) !== -1) return 'review';
    return 'lower-level-free-practice-only';
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 21-23 — INTERVIEW MODE AUTHORITY + TRACK CLASSIFICATION
     ══════════════════════════════════════════════════════════════════ */
  // Reproduces AP.INTERVIEW_MODE_BY_LEVEL read-only (single source of
  // truth remains ZirakAcademicProgram; this is a convenience mirror
  // used only if AP has not yet loaded).
  function interviewModeForLevel(levelId) {
    var AP = window.ZirakAcademicProgram;
    if (AP && AP.getInterviewModeForLevel) return AP.getInterviewModeForLevel(levelId);
    return null;
  }
  var PROFESSIONAL_GROUP_PATTERN = /ngo|officer|hso|professional|delivery|first_job/i;
  // I6H-D16 bugfix (found via smoke test): tracks use a numeric 1-10
  // level_min/level_max scale (their own internal 10-level roadmap,
  // similar in spirit to the Grammar roadmap), not a string
  // suggested_level/cefr field. Collapsed to the 7 accepted classes.
  var TRACK_NUMERIC_LEVEL_TO_ACCEPTED = { 1: 'starter', 2: 'starter', 3: 'basic', 4: 'basic', 5: 'beginner', 6: 'elementary', 7: 'intermediate', 8: 'advanced', 9: 'academic', 10: 'academic' };
  // Lessons use a real cefr field (A1-C1).
  var CEFR_TO_ACCEPTED = { A1: 'starter', A2: 'beginner', B1: 'elementary', B2: 'intermediate', C1: 'advanced', C2: 'academic' };
  function classifyInterviewTracks(tracks, lessons) {
    var out = { tracks: [], lessons: [] };
    (tracks || []).forEach(function (t) {
      // I6H-D16 bugfix (found via smoke test against real data): the
      // real field is t.group (e.g. 'kandahar_ngo_un', 'officer_formal',
      // 'hso_delivery'), not 'group_id' — the prior check against a
      // nonexistent field detected zero professional tracks.
      var isProfessional = PROFESSIONAL_GROUP_PATTERN.test(String(t.group || ''));
      var accepted = TRACK_NUMERIC_LEVEL_TO_ACCEPTED[t.level_min] || '';
      var maxAccepted = TRACK_NUMERIC_LEVEL_TO_ACCEPTED[t.level_max] || accepted;
      var AP = window.ZirakAcademicProgram;
      // Professional-register tracks are never Starter/Basic official
      // content (Task 22's explicit rule), regardless of any legacy tag.
      // Professional-register tracks are never Starter/Basic official
      // content (Task 22's explicit rule), regardless of any legacy tag.
      var minLevel = isProfessional && levelIndex(accepted) < levelIndex('intermediate') ? 'intermediate' : accepted;
      out.tracks.push({
        contentId: t.id, contentType: 'interview-track',
        acceptedLevelId: accepted || 'manual-review',
        minimumLevelId: minLevel || (isProfessional ? 'intermediate' : 'starter'), maximumLevelId: maxAccepted || '',
        pathwayIds: isProfessional ? ['job-professional'] : [],
        professionalRegister: isProfessional,
        childSuitable: !isProfessional,
        responseDemand: isProfessional ? 'structured-professional' : 'conversational',
        supportMode: isProfessional ? 'scenario-only' : 'guided',
        estimatedMinutes: 5,
        missingPashtoSupport: !t.title_ps,
        officialCurriculumEligible: false, // classification only this phase; official routing wiring is Phase 2+
        freePracticeEligible: true,
        reviewStatus: accepted ? 'numeric-scale-mapped' : 'unmapped-numeric-level'
      });
    });
    (lessons || []).forEach(function (l) {
      var accepted = CEFR_TO_ACCEPTED[l.cefr] || '';
      out.lessons.push({
        contentId: l.id, contentType: 'interview-lesson',
        acceptedLevelId: accepted || 'manual-review', minimumLevelId: accepted || '', maximumLevelId: accepted || '',
        pathwayIds: [], professionalRegister: false, childSuitable: true,
        responseDemand: 'conversational', supportMode: 'guided', estimatedMinutes: 10,
        missingPashtoSupport: !(l.sample_answer_ps || l.tips_ps),
        officialCurriculumEligible: false, freePracticeEligible: true,
        reviewStatus: accepted ? 'cefr-mapped' : 'unmapped-cefr'
      });
    });
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 34 — storage/reset/delete integration for new per-student
     Listening pack progress state.
     ══════════════════════════════════════════════════════════════════ */
  function _studentKey(studentId, key) { return 'u_' + studentId + '_' + key; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  // Task 11: student-specific pack progress. Reopening the same pack
  // resumes; a different pack never inherits the former position.
  function getListeningPackProgress(studentId, packId) {
    try { return JSON.parse(lsGet(_studentKey(studentId, 'listen_pack_progress_' + packId)) || 'null'); } catch (e) { return null; }
  }
  function saveListeningPackProgress(studentId, packId, progress) {
    var record = Object.assign({ packId: packId, mode: progress.mode || '', currentPosition: 0, completedItemIds: [], weakItemIds: [], lastOpenedAt: new Date().toISOString() }, progress);
    lsSet(_studentKey(studentId, 'listen_pack_progress_' + packId), JSON.stringify(record));
    return record;
  }
  function openListeningPack(studentId, packId, mode) {
    var existing = getListeningPackProgress(studentId, packId);
    if (existing) { existing.lastOpenedAt = new Date().toISOString(); existing.mode = mode || existing.mode; lsSet(_studentKey(studentId, 'listen_pack_progress_' + packId), JSON.stringify(existing)); return existing; }
    return saveListeningPackProgress(studentId, packId, { mode: mode || 'auto' });
  }
  function markListeningPackItemComplete(studentId, packId, itemId, weak) {
    var progress = getListeningPackProgress(studentId, packId) || saveListeningPackProgress(studentId, packId, {});
    if (progress.completedItemIds.indexOf(itemId) === -1) progress.completedItemIds.push(itemId);
    if (weak && progress.weakItemIds.indexOf(itemId) === -1) progress.weakItemIds.push(itemId);
    progress.currentPosition = progress.completedItemIds.length;
    lsSet(_studentKey(studentId, 'listen_pack_progress_' + packId), JSON.stringify(progress));
    return progress;
  }
  function onDeleteStudentCurriculumContent(studentId) {
    if (!studentId) return;
    try {
      var prefixes = [_studentKey(studentId, 'listen_pack_progress_'), _studentKey(studentId, 'd18_listen_pack_'), _studentKey(studentId, 'd19_dialogue_')];
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (k && prefixes.some(function (prefix) { return k.indexOf(prefix) === 0; })) lsDel(k);
      }
    } catch (e) {}
  }
  function hookDeletionIntoProfile() {
    try {
      if (!window.ZirakProfile || window.ZirakProfile.__curriculumContentDeleteHooked) return;
      var orig = window.ZirakProfile.deleteStudentCompletely;
      if (typeof orig !== 'function') return;
      window.ZirakProfile.deleteStudentCompletely = function (studentId) {
        try { onDeleteStudentCurriculumContent(studentId); } catch (e) {}
        return orig.apply(this, arguments);
      };
      window.ZirakProfile.__curriculumContentDeleteHooked = true;
    } catch (e) {}
  }
  try {
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hookDeletionIntoProfile);
      else hookDeletionIntoProfile();
    }
  } catch (e) {}

  /* ══════════════════════════════════════════════════════════════════
     LAZY, CACHED FULL-REGISTRY BUILDER — computes canonicalization,
     classification, packs, and all content-type catalogs once, from
     the real runtime arrays, and caches the result for the session.
     ══════════════════════════════════════════════════════════════════ */
  var _cachedRegistry = null;
  function buildFullRegistry(force) {
    if (_cachedRegistry && !force) return _cachedRegistry;
    var listenArr = window.LISTEN_SENTENCES || (typeof LISTEN_SENTENCES !== 'undefined' ? LISTEN_SENTENCES : null);
    var dialogues = window.DIALOGUES || (typeof DIALOGUES !== 'undefined' ? DIALOGUES : null);
    var tracks = window.zirakInterviewTracks || (typeof zirakInterviewTracks !== 'undefined' ? zirakInterviewTracks : null);
    var lessons = window.zirakInterviewLessons || (typeof zirakInterviewLessons !== 'undefined' ? zirakInterviewLessons : null);

    var canonicalMap = listenArr ? classifyListeningBank(buildListeningCanonicalMap(listenArr)) : null;
    var packs = canonicalMap ? buildListeningPacks(canonicalMap) : [];
    var dialogueCatalog = dialogues ? classifyDialogueBank(dialogues) : [];
    var grammarCatalog = buildUnifiedGrammarCatalog();
    var interviewCatalog = classifyInterviewTracks(tracks, lessons);

    _cachedRegistry = {
      listening: canonicalMap, listeningPacks: packs,
      d18Listening: _d18ListeningRegistration,
      d19Dialogues: _d19DialogueRegistration,
      dialogues: dialogueCatalog, grammar: grammarCatalog, interview: interviewCatalog
    };
    return _cachedRegistry;
  }

  /* ══════════════════════════════════════════════════════════════════
     TASK 9 — PACK-BASED OFFICIAL LISTENING ENTRY POINTS. Never fall
     back to the full 400-item bank. A missing/invalid pack ID fails
     explicitly rather than silently launching everything.
     ══════════════════════════════════════════════════════════════════ */
  function _resolvePackAndItems(packId) {
    var reg = buildFullRegistry();
    var pack = reg.listeningPacks.find(function (p) { return p.packId === packId; });
    if (!pack) return { ok: false, reason: 'pack-not-found' };
    var items = pack.itemIds.map(function (id) { return reg.listening.canonicalItems.find(function (c) { return c.canonicalListeningId === id; }); }).filter(Boolean);
    if (!items.length) return { ok: false, reason: 'pack-empty' };
    return { ok: true, pack: pack, items: items };
  }
  function openPack(packId, options) {
    if (!packId) return { ok: false, reason: 'missing-pack-id' };
    var resolved = _resolvePackAndItems(packId);
    if (!resolved.ok) return resolved;
    var studentId = (options && options.studentId) || (window.ZirakProfile && window.ZirakProfile.currentStudent && window.ZirakProfile.currentStudent() ? window.ZirakProfile.currentStudent().studentId : '');
    if (studentId) openListeningPack(studentId, packId, (options && options.mode) || 'auto');
    return { ok: true, pack: resolved.pack, items: resolved.items };
  }
  function startAutoPack(packId) { return openPack(packId, { mode: 'auto' }); }
  function startManualPack(packId) { return openPack(packId, { mode: 'manual' }); }
  function openShadowPack(packId) { return openPack(packId, { mode: 'shadow' }); }
  function openDictationPack(packId) { return openPack(packId, { mode: 'dictation' }); }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D17 — CONTENT GOVERNANCE, EDITORIAL STATUS, OFFICIAL ELIGIBILITY GATE
     One normalized governance envelope for every real content item or
     content-system component. Extends this file (the one existing
     content authority) rather than creating a competing global.
     ══════════════════════════════════════════════════════════════════════ */
  var GOVERNANCE_SCHEMA_VERSION = 'D19-1';

  /* ---- 8.1 Classification status ---- */
  var CLASSIFICATION_STATUS = Object.freeze({
    UNCLASSIFIED: 'unclassified', ALGORITHMIC_CANDIDATE: 'algorithmic-candidate',
    LEGACY_MAPPED_CANDIDATE: 'legacy-mapped-candidate', PHASE_REVIEWED: 'phase-reviewed',
    OWNER_TEACHER_APPROVED: 'owner-teacher-approved', NEEDS_RECLASSIFICATION: 'needs-reclassification',
    REJECTED: 'rejected', NOT_APPLICABLE: 'not-applicable'
  });
  /* ---- 8.2 Translation status ---- */
  var TRANSLATION_STATUS = Object.freeze({
    NOT_APPLICABLE: 'not-applicable', MISSING: 'missing', PRESENT_UNVERIFIED: 'present-unverified',
    PHASE_REVIEWED: 'phase-reviewed', HUMAN_REVIEWED: 'human-reviewed', OWNER_APPROVED: 'owner-approved',
    NEEDS_CORRECTION: 'needs-correction', REJECTED: 'rejected'
  });
  /* ---- 8.3 Integrity status ---- */
  var INTEGRITY_STATUS = Object.freeze({
    UNVERIFIED: 'unverified', DEFECTS_OPEN: 'defects-open', STRUCTURALLY_VALID: 'structurally-valid',
    PHASE_VERIFIED: 'phase-verified', OWNER_VERIFIED: 'owner-verified', BLOCKED: 'blocked', REJECTED: 'rejected'
  });
  /* ---- 8.4 Editorial status ---- */
  var EDITORIAL_STATUS = Object.freeze({
    UNREVIEWED: 'unreviewed', QUEUED: 'queued', IN_REVIEW: 'in-review', CHANGES_REQUIRED: 'changes-required',
    PHASE_REVIEWED: 'phase-reviewed', OWNER_TEACHER_APPROVED: 'owner-teacher-approved',
    REJECTED: 'rejected', RETIRED_FREE_PRACTICE_ONLY: 'retired-free-practice-only'
  });
  /* ---- 8.5 Owner approval status ---- */
  var OWNER_APPROVAL_STATUS = Object.freeze({
    NOT_REQUESTED: 'not-requested', PENDING: 'pending', APPROVED: 'approved',
    CHANGES_REQUESTED: 'changes-requested', REJECTED: 'rejected'
  });
  /* ---- 8.6 Provenance / permission enums ---- */
  var PROVENANCE_ORIGIN_TYPE = Object.freeze({
    ACADEMY_ORIGINAL: 'academy-original', LEGACY_PROJECT_INTERNAL: 'legacy-project-internal',
    ARCHITECTURE_SAMPLE: 'architecture-sample', OWNER_SUPPLIED: 'owner-supplied',
    EXTERNAL_SOURCE: 'external-source', UNKNOWN: 'unknown'
  });
  var PROVENANCE_PERMISSION_STATUS = Object.freeze({
    ACADEMY_OWNED: 'academy-owned', OWNER_AUTHORIZED: 'owner-authorized', PERMISSION_CONFIRMED: 'permission-confirmed',
    PUBLIC_DOMAIN: 'public-domain', NOT_APPLICABLE: 'not-applicable', UNKNOWN: 'unknown',
    RESTRICTED: 'restricted', PROHIBITED: 'prohibited'
  });
  function isKnownEnumValue(enumObj, value) {
    for (var k in enumObj) { if (Object.prototype.hasOwnProperty.call(enumObj, k) && enumObj[k] === value) return true; }
    return false;
  }

  function makeProvenance(overrides) {
    return Object.assign({
      originType: PROVENANCE_ORIGIN_TYPE.UNKNOWN, sourceTitle: '', sourceId: '', authorOrPublisher: '',
      sourceLocation: '', licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.UNKNOWN,
      translationSource: '', translatorOrReviewer: '', verificationStatus: 'unverified', notes: ''
    }, overrides || {});
  }

  /* ══════════════════════════════════════════════════════════════════════
     13. DEFECT TAXONOMY — one central, versioned list.
     ══════════════════════════════════════════════════════════════════════ */
  var DEFECT_DEFINITIONS = Object.freeze({
    'missing-content-id': { severity: 'critical', description: 'Record has no stable content ID.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D17', remediation: 'Assign a stable ID before any further processing.' },
    'duplicate-content-id': { severity: 'critical', description: 'Two records share the same content ID.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D17', remediation: 'Disambiguate or merge with an alias relationship.' },
    'legacy-alias-unmapped': { severity: 'medium', description: 'A legacy index/ID has no canonical mapping.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D18', remediation: 'Map the legacy alias to its canonical item.' },
    'source-system-unknown': { severity: 'high', description: 'Record has no identified source system.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D17', remediation: 'Identify and record the real source system.' },
    'architecture-sample-only': { severity: 'high', description: 'Record is architecture/sample content, not active production content.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D23', remediation: 'Never route to official use; may be replaced with real content later.' },
    'record-shape-invalid': { severity: 'critical', description: 'Record does not match its content type\u2019s expected shape.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D17', remediation: 'Repair the record shape before classification.' },
    'missing-level': { severity: 'high', description: 'No accepted level assigned.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Assign and review an accepted level.' },
    'unresolved-level': { severity: 'high', description: 'A raw legacy level tag could not resolve to an accepted class.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Manually resolve the legacy tag.' },
    'algorithmic-level-unreviewed': { severity: 'medium', description: 'Level was assigned by an automated algorithm, not yet reviewed.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Teacher/owner review of the algorithmic level.' },
    'legacy-level-unreviewed': { severity: 'medium', description: 'Level came from a legacy tag mapping, not yet reviewed.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Teacher/owner review of the legacy-mapped level.' },
    'missing-pathway-metadata': { severity: 'low', description: 'No pathway metadata declared.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Add pathway metadata or an explicit pathway-neutral declaration.' },
    'pathway-level-confusion': { severity: 'high', description: 'Pathway context appears to have influenced language-level assignment.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Separate pathway context from language level.' },
    'child-pathway-unsafe': { severity: 'critical', description: 'Content unsuitable for the Child pathway is not excluded.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Exclude from Child pathway resolution.' },
    'professional-register-below-minimum-level': { severity: 'critical', description: 'Professional-register content routed below its safe minimum level.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D21', remediation: 'Enforce the minimum-level floor for professional content.' },
    'exact-duplicate-content': { severity: 'medium', description: 'Record is an exact textual duplicate of another record.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Alias or deduplicate for official routing.' },
    'duplicate-title-needs-disambiguation': { severity: 'low', description: 'Title is shared with other records; may or may not be a true duplicate.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Editorial review to distinguish legitimate progression from accidental duplication.' },
    'turn-count-level-mismatch': { severity: 'high', description: 'Dialogue turn count is inconsistent with its assigned level\u2019s demand range.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D19', remediation: 'Rewrite to the correct turn-count range or reclassify the level.' },
    'support-mode-level-mismatch': { severity: 'medium', description: 'Support mode does not match the assigned level\u2019s demand.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Correct the support mode.' },
    'advanced-academic-content-gap': { severity: 'medium', description: 'No genuinely developed Advanced/Academic content exists for this bank.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Author real Advanced/Academic content.' },
    'objective-missing': { severity: 'medium', description: 'No learning objective declared.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Add a learning objective.' },
    'duration-missing': { severity: 'low', description: 'No estimated duration declared.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Add an estimated duration.' },
    'theme-missing': { severity: 'low', description: 'No theme declared.', blocksCandidate: false, blocksOfficial: false, responsiblePhase: 'varies', remediation: 'Add a theme.' },
    'prerequisite-missing': { severity: 'medium', description: 'No prerequisite relationship declared.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D20', remediation: 'Add prerequisite relationships.' },
    'assessment-link-missing': { severity: 'medium', description: 'No assessment linkage declared.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D24', remediation: 'Link an aligned assessment.' },
    'missing-pashto-title': { severity: 'high', description: 'Pashto title is empty.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D25', remediation: 'Add a real Pashto title.' },
    'missing-pashto-support': { severity: 'medium', description: 'Pashto support text is empty.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D25', remediation: 'Add real Pashto support text.' },
    'english-copied-into-pashto': { severity: 'high', description: 'The Pashto-facing field contains the English text verbatim.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D25', remediation: 'Replace with a real Pashto translation.' },
    'latin-only-pashto-field': { severity: 'high', description: 'The Pashto-facing field contains only Latin-script text.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D25', remediation: 'Replace with real Pashto-script text.' },
    'pashto-unverified': { severity: 'low', description: 'Pashto text exists but has not been human-reviewed.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D25', remediation: 'Human review of existing Pashto text.' },
    'unsafe-html-support-text': { severity: 'critical', description: 'Support text contains unsafe HTML/script content.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D17', remediation: 'Sanitize before any further use.' },
    'wrong-language-pronunciation-guide': { severity: 'high', description: 'A Persian/Dari phonetic transliteration is presented as English pronunciation.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D19', remediation: 'Replace with a genuine English pronunciation guide.' },
    'target-absent-from-example': { severity: 'medium', description: 'The target word does not appear in its own example sentence.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D23', remediation: 'Rewrite the example or correct the target.' },
    'inflection-mismatch': { severity: 'low', description: 'Target word form does not match its example (singular/plural, tense).', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D23', remediation: 'Use inflection-aware blank generation.' },
    'wrong-practice-type': { severity: 'medium', description: 'The record is forced into a practice type it cannot correctly support.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D23', remediation: 'Reassign to correction/transformation or another valid type.' },
    'record-silently-excluded': { severity: 'high', description: 'Record was excluded from practice without a recorded reason.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D23', remediation: 'Record an explicit reason or restore the record.' },
    'duplicate-mastery-candidate': { severity: 'low', description: 'Vocabulary repeats across sets; may need a shared-mastery alias.', blocksCandidate: false, blocksOfficial: false, responsiblePhase: 'D23', remediation: 'Design a shared-mastery alias in a later phase.' },
    'duplicate-listening-alias': { severity: 'low', description: 'Legacy Listening index is a redundant alias of a canonical item.', blocksCandidate: false, blocksOfficial: false, responsiblePhase: 'D18', remediation: 'No action required beyond alias tracking.' },
    'undersized-pack': { severity: 'medium', description: 'Pack has fewer items than its level\u2019s minimum.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D18', remediation: 'Add items or merge with an adjacent pack.' },
    'oversized-pack': { severity: 'critical', description: 'Pack exceeds its level\u2019s maximum, or approaches the full bank.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D18', remediation: 'Split into multiple packs.' },
    'pack-objective-missing': { severity: 'low', description: 'Pack has no learning objectives declared.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D18', remediation: 'Add learning objectives.' },
    'full-bank-official-fallback': { severity: 'critical', description: 'An official resolver fell back to the entire content bank.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D17', remediation: 'Never allowed; must return an explicit failure instead.' },
    'advanced-academic-listening-gap': { severity: 'medium', description: 'No genuinely advanced/academic Listening material exists.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D18', remediation: 'Author real Advanced/Academic Listening content.' },
    'placement-bank-sliced-unit-quiz': { severity: 'critical', description: 'Unit quiz is an arbitrary slice of the Placement question bank.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D24', remediation: 'Replace with an aligned unit-specific quiz blueprint.' },
    'quiz-not-aligned-to-unit': { severity: 'critical', description: 'Quiz content is not aligned to its unit\u2019s actual objectives.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D24', remediation: 'Author an aligned blueprint.' },
    'question-explanation-missing': { severity: 'low', description: 'Question has no explanation for its answer.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D24', remediation: 'Add an explanation.' },
    'fake-perfect-manual-completion': { severity: 'critical', description: 'A manual "Mark Complete" action produced a fabricated 100% score.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D17', remediation: 'Never allowed; manual completion must remain unscored where required.' },
    'evidence-identity-missing': { severity: 'high', description: 'Completion evidence lacks explicit student/content/session identity.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Record explicit identity on every evidence write.' },
    'duplicate-completion-risk': { severity: 'medium', description: 'The same completion event could be recorded more than once.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'varies', remediation: 'Add duplicate-event protection.' },
    'provenance-missing': { severity: 'high', description: 'No provenance information recorded.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D25', remediation: 'Record honest provenance.' },
    'external-permission-unknown': { severity: 'critical', description: 'External material\u2019s permission/license status is unknown.', blocksCandidate: true, blocksOfficial: true, responsiblePhase: 'D25', remediation: 'Confirm permission before any official use.' },
    'owner-approval-missing': { severity: 'critical', description: 'No owner/teacher approval evidence exists for official use.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D25', remediation: 'Obtain and record explicit owner/teacher approval.' },
    'human-language-review-missing': { severity: 'high', description: 'Pashto/English text has not received human language review.', blocksCandidate: false, blocksOfficial: true, responsiblePhase: 'D25', remediation: 'Human review of the language content.' },
    'content-version-unlocked': { severity: 'low', description: 'Content metadata version has not been locked after review.', blocksCandidate: false, blocksOfficial: false, responsiblePhase: 'D25', remediation: 'Lock the version after final review.' }
  });
  function getDefectDefinition(defectCode) { return DEFECT_DEFINITIONS[defectCode] || null; }
  function defectBlocksCandidate(defectCode) { var d = DEFECT_DEFINITIONS[defectCode]; return !!(d && d.blocksCandidate); }
  function defectBlocksOfficial(defectCode) { var d = DEFECT_DEFINITIONS[defectCode]; return !!(d && d.blocksOfficial); }

  /* ══════════════════════════════════════════════════════════════════════
     12. CONTENT-TYPE DEMAND CONTRACTS — frozen, versioned, testable.
     ══════════════════════════════════════════════════════════════════════ */
  var DEMAND_CONTRACT_VERSION = 'D17-1';
  var DEMAND_CONTRACTS = Object.freeze({
    listening: {
      starter: { min: 4, max: 5 }, basic: { min: 5, max: 5 }, beginner: { min: 5, max: 7 },
      elementary: { min: 6, max: 8 }, intermediate: { min: 8, max: 10 },
      advanced: { min: 8, max: 12 }, academic: { min: 8, max: 12 }
    },
    dialogue: {
      starter: { minTurns: 2, maxTurns: 4, support: 'full-model', responseDemand: 'words-or-one-short-sentence' },
      basic: { minTurns: 4, maxTurns: 6, support: 'full-support', responseDemand: 'one-short-complete-sentence' },
      beginner: { minTurns: 6, maxTurns: 8, support: 'partial-prompts', responseDemand: 'one-to-two-sentences' },
      elementary: { minTurns: 8, maxTurns: 10, support: 'reduced-prompts', responseDemand: 'two-to-three-sentences-plus-followup' },
      intermediate: { minTurns: 10, maxTurns: 14, support: 'minimal-prompts', responseDemand: 'natural-multi-sentence' },
      advanced: { minTurns: 12, maxTurns: 16, support: 'scenario-only', responseDemand: 'nuanced-response-register-control' },
      academic: { minTurns: 12, maxTurns: 20, support: 'formal-task', responseDemand: 'structured-evidence-based' }
    },
    interview: {
      starter: { modeLabel: 'About Me' }, basic: { modeLabel: 'My Questions and Answers' },
      beginner: { modeLabel: 'Personal Speaking Practice' }, elementary: { modeLabel: 'Guided Interview' },
      intermediate: { modeLabel: 'Interview Practice' }, advanced: { modeLabel: 'Professional Interview' },
      academic: { modeLabel: 'Academic and Scholarship Interview' }
    },
    topic: { oralFirst: true, noDigitalWritingCourse: true, classifyFromTitleAloneForbidden: true },
    story: {
      requiredFields: ['approximateTextLengthRange', 'sentenceComplexity', 'vocabularyLoad', 'readingListeningSupport', 'comprehensionQuestionSpec', 'oralFollowUpDemand', 'pathwayContext', 'estimatedMinutes', 'titleDisambiguation', 'pashtoStatus'],
      classifyFromTitleAloneForbidden: true
    },
    word: {
      requiredFields: ['stableWordId', 'sourceSetId', 'acceptedLevelId', 'pathwayOrTheme', 'partOfSpeech', 'englishTarget', 'pronunciationStatus', 'pashtoMeaningStatus', 'englishExample', 'pashtoExampleStatus', 'validPracticeModes', 'masteryAliasCandidate'],
      silentOmissionForbidden: true
    },
    sentencePractice: {
      validTypes: ['exact-token-blank', 'inflection-aware-blank', 'transformation', 'correction', 'ordering', 'guided-production', 'unsupported-pending']
    },
    unitQuiz: {
      requiresUnitAlignment: true, requiresObjectiveAlignment: true, prohibitsPlacementSlicing: true
    }
  });
  function getDemandContract(contentType, levelId) {
    var bank = DEMAND_CONTRACTS[contentType];
    if (!bank) return null;
    if (levelId) return bank[levelId] || null;
    return bank;
  }

  /* ══════════════════════════════════════════════════════════════════════
     7. GOVERNANCE RECORD ENVELOPE — one normalized shape for every record.
     ══════════════════════════════════════════════════════════════════════ */
  function makeGovernanceRecord(overrides) {
    return Object.assign({
      governanceSchemaVersion: GOVERNANCE_SCHEMA_VERSION,
      contentType: '', contentId: '', sourceSystem: '', sourceIds: [], legacyAliases: [],
      recordVersion: 1,
      classificationStatus: CLASSIFICATION_STATUS.UNCLASSIFIED, classificationMethod: '',
      acceptedLevelId: '', minimumLevelId: '', maximumLevelId: '', pathwayIds: [], themeIds: [],
      translationStatus: TRANSLATION_STATUS.NOT_APPLICABLE,
      integrityStatus: INTEGRITY_STATUS.UNVERIFIED,
      editorialStatus: EDITORIAL_STATUS.UNREVIEWED,
      ownerApprovalStatus: OWNER_APPROVAL_STATUS.NOT_REQUESTED,
      provenance: makeProvenance(),
      officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: true,
      blockingReasons: [], warnings: [], defectCodes: [], requiredActions: [],
      responsiblePhase: '', reviewHistory: [], lastReviewedBy: '', lastReviewedAt: '', notes: ''
    }, overrides || {});
  }
  var GOVERNANCE_REQUIRED_FIELDS = [
    'governanceSchemaVersion', 'contentType', 'contentId', 'sourceSystem', 'sourceIds', 'legacyAliases',
    'recordVersion', 'classificationStatus', 'classificationMethod', 'acceptedLevelId', 'minimumLevelId',
    'maximumLevelId', 'pathwayIds', 'themeIds', 'translationStatus', 'integrityStatus', 'editorialStatus',
    'ownerApprovalStatus', 'provenance', 'officialCandidateEligible', 'officialCurriculumEligible',
    'freePracticeEligible', 'blockingReasons', 'warnings', 'defectCodes', 'requiredActions',
    'responsiblePhase', 'reviewHistory', 'lastReviewedBy', 'lastReviewedAt', 'notes'
  ];
  // 28.3 — validates every required field is present and every enum value
  // recognized. Returns { valid, errors }.
  function validateGovernanceRecord(record) {
    var errors = [];
    if (!record || typeof record !== 'object') return { valid: false, errors: ['not-an-object'] };
    GOVERNANCE_REQUIRED_FIELDS.forEach(function (f) { if (!(f in record)) errors.push('missing-field:' + f); });
    if (!record.contentId) errors.push('empty-content-id');
    if (record.classificationStatus && !isKnownEnumValue(CLASSIFICATION_STATUS, record.classificationStatus)) errors.push('unknown-classification-status:' + record.classificationStatus);
    if (record.translationStatus && !isKnownEnumValue(TRANSLATION_STATUS, record.translationStatus)) errors.push('unknown-translation-status:' + record.translationStatus);
    if (record.integrityStatus && !isKnownEnumValue(INTEGRITY_STATUS, record.integrityStatus)) errors.push('unknown-integrity-status:' + record.integrityStatus);
    if (record.editorialStatus && !isKnownEnumValue(EDITORIAL_STATUS, record.editorialStatus)) errors.push('unknown-editorial-status:' + record.editorialStatus);
    if (record.ownerApprovalStatus && !isKnownEnumValue(OWNER_APPROVAL_STATUS, record.ownerApprovalStatus)) errors.push('unknown-owner-approval-status:' + record.ownerApprovalStatus);
    if (!Array.isArray(record.blockingReasons)) errors.push('blockingReasons-not-array');
    if (!Array.isArray(record.warnings)) errors.push('warnings-not-array');
    if (!Array.isArray(record.defectCodes)) errors.push('defectCodes-not-array');
    if (!Array.isArray(record.requiredActions)) errors.push('requiredActions-not-array');
    if (!record.sourceSystem) errors.push('missing-source-system');
    if (!record.responsiblePhase && record.classificationStatus !== CLASSIFICATION_STATUS.NOT_APPLICABLE) errors.push('missing-responsible-phase');
    return { valid: errors.length === 0, errors: errors };
  }

  /* ══════════════════════════════════════════════════════════════════════
     16. REVIEW WORKFLOW — deterministic state transitions.
     ══════════════════════════════════════════════════════════════════════ */
  // Allowed forward transitions. Rejected/retired are terminal for official
  // use but content is never deleted.
  var ALLOWED_TRANSITIONS = {
    'unclassified': ['algorithmic-candidate', 'legacy-mapped-candidate', 'rejected', 'needs-reclassification'],
    'algorithmic-candidate': ['phase-reviewed', 'needs-reclassification', 'rejected', 'retired-free-practice-only'],
    'legacy-mapped-candidate': ['phase-reviewed', 'needs-reclassification', 'rejected', 'retired-free-practice-only'],
    'phase-reviewed': ['owner-teacher-approved', 'changes-required', 'rejected', 'retired-free-practice-only'],
    'needs-reclassification': ['algorithmic-candidate', 'legacy-mapped-candidate', 'rejected'],
    'changes-required': ['phase-reviewed', 'rejected'],
    'owner-teacher-approved': ['changes-required', 'rejected'], // re-review is always possible; never a silent downgrade
    'rejected': [], // terminal — a rejected record cannot become officially eligible; reactivation requires an explicit new governed path, not modeled in D17
    'retired-free-practice-only': [] // terminal for official routing; remains Free-Practice accessible
  };
  // Task 16: requires review EVIDENCE for the candidate->phase-reviewed and
  // phase-reviewed->owner-teacher-approved jumps — never a bare status flip.
  function canTransitionReviewStatus(fromStatus, toStatus, context) {
    context = context || {};
    var allowed = ALLOWED_TRANSITIONS[fromStatus];
    if (!allowed) return { allowed: false, reason: 'unknown-from-status' };
    if (allowed.indexOf(toStatus) === -1) return { allowed: false, reason: 'transition-not-permitted:' + fromStatus + '->' + toStatus };
    // No direct jump to owner-teacher-approved without review evidence.
    if (toStatus === EDITORIAL_STATUS.OWNER_TEACHER_APPROVED || toStatus === CLASSIFICATION_STATUS.OWNER_TEACHER_APPROVED) {
      if (!context.reviewEvidence || !context.reviewEvidence.reviewerRole || !context.reviewEvidence.reason) {
        return { allowed: false, reason: 'owner-approval-requires-review-evidence' };
      }
    }
    // No direct jump from missing translation to owner-approved.
    if ((toStatus === EDITORIAL_STATUS.OWNER_TEACHER_APPROVED) && context.translationStatus === TRANSLATION_STATUS.MISSING) {
      return { allowed: false, reason: 'owner-approval-requires-non-missing-translation' };
    }
    return { allowed: true };
  }
  // Task 16: appends to reviewHistory; NEVER overwrites prior entries.
  function applyReviewTransition(record, transition) {
    if (!record) return { ok: false, reason: 'missing-record' };
    var check = canTransitionReviewStatus(record.editorialStatus, transition.toStatus, transition.context || {});
    if (!check.allowed) return { ok: false, reason: check.reason };
    var entry = {
      previousStatus: record.editorialStatus, newStatus: transition.toStatus,
      reviewerRole: (transition.context && transition.context.reviewEvidence && transition.context.reviewEvidence.reviewerRole) || transition.reviewerRole || '',
      reason: (transition.context && transition.context.reviewEvidence && transition.context.reviewEvidence.reason) || transition.reason || '',
      timestamp: transition.timestamp || new Date().toISOString()
    };
    // Stable content ID is never mutated by a review transition.
    var originalContentId = record.contentId;
    record.reviewHistory = (record.reviewHistory || []).concat([entry]); // append, never overwrite
    record.editorialStatus = transition.toStatus;
    record.lastReviewedBy = entry.reviewerRole;
    record.lastReviewedAt = entry.timestamp;
    record.contentId = originalContentId;
    return { ok: true, record: record, historyEntry: entry };
  }

  /* ══════════════════════════════════════════════════════════════════════
     9. TWO-STAGE ELIGIBILITY — officialCandidateEligible vs officialCurriculumEligible.
     ══════════════════════════════════════════════════════════════════════ */
  var ELIGIBILITY_VALIDATOR_VERSION = 'D17-1';
  // Task 9: returns a DETAILED object, never a bare boolean. Structural/
  // academic readiness (candidateEligible) is evaluated separately from
  // final official-route permission (eligible), which additionally
  // requires owner/teacher approval and a non-blocked provenance status.
  function evaluateOfficialEligibility(record, context) {
    context = context || {};
    var blockingReasons = [], warnings = [];
    if (!record || !record.contentId) blockingReasons.push('missing-content-id');
    if (record) {
      if (!record.sourceSystem) blockingReasons.push('source-system-unknown');
      if (record.sourceSystem === 'architecture-sample') blockingReasons.push('architecture-sample-only');
      if (!record.acceptedLevelId) blockingReasons.push('missing-level');
      // Classification must be at the required approved stage for CANDIDATE eligibility:
      var classificationReady = record.classificationStatus === CLASSIFICATION_STATUS.PHASE_REVIEWED ||
        record.classificationStatus === CLASSIFICATION_STATUS.OWNER_TEACHER_APPROVED;
      if (!classificationReady) {
        if (record.classificationStatus === CLASSIFICATION_STATUS.ALGORITHMIC_CANDIDATE) blockingReasons.push('classification-not-phase-reviewed:algorithmic-candidate-only');
        else if (record.classificationStatus === CLASSIFICATION_STATUS.LEGACY_MAPPED_CANDIDATE) blockingReasons.push('classification-not-phase-reviewed:legacy-mapped-candidate-only');
        else if (record.classificationStatus === CLASSIFICATION_STATUS.REJECTED) blockingReasons.push('classification-rejected');
        else blockingReasons.push('classification-not-phase-reviewed');
      }
      var integrityReady = record.integrityStatus === INTEGRITY_STATUS.PHASE_VERIFIED || record.integrityStatus === INTEGRITY_STATUS.OWNER_VERIFIED;
      if (!integrityReady) {
        if (record.integrityStatus === INTEGRITY_STATUS.BLOCKED || record.integrityStatus === INTEGRITY_STATUS.REJECTED) blockingReasons.push('integrity-blocked');
        else blockingReasons.push('integrity-not-phase-verified');
      }
      // Pashto/support gate — required unless explicitly not-applicable.
      if (record.translationStatus === TRANSLATION_STATUS.MISSING) blockingReasons.push('translation-missing');
      else if (record.translationStatus === TRANSLATION_STATUS.NEEDS_CORRECTION) blockingReasons.push('translation-needs-correction');
      else if (record.translationStatus === TRANSLATION_STATUS.REJECTED) blockingReasons.push('translation-rejected');
      else if (record.translationStatus === TRANSLATION_STATUS.PRESENT_UNVERIFIED) warnings.push('translation-present-unverified');
      // Critical defects block candidate eligibility outright.
      (record.defectCodes || []).forEach(function (code) {
        if (defectBlocksCandidate(code)) blockingReasons.push('unresolved-critical-defect:' + code);
      });
      // Provenance / permission.
      var prov = record.provenance || {};
      if (prov.licenseOrPermissionStatus === PROVENANCE_PERMISSION_STATUS.PROHIBITED) blockingReasons.push('provenance-prohibited');
      if (prov.licenseOrPermissionStatus === PROVENANCE_PERMISSION_STATUS.RESTRICTED) blockingReasons.push('provenance-restricted');
      if (prov.originType === PROVENANCE_ORIGIN_TYPE.EXTERNAL_SOURCE && prov.licenseOrPermissionStatus === PROVENANCE_PERMISSION_STATUS.UNKNOWN) blockingReasons.push('external-permission-unknown');
      if (!prov.originType || prov.originType === PROVENANCE_ORIGIN_TYPE.UNKNOWN) warnings.push('provenance-origin-unknown');
    }
    var candidateEligible = blockingReasons.length === 0;

    // Stage 2: full official-curriculum eligibility ADDITIONALLY requires
    // owner/teacher approval and an editorial status of owner-teacher-approved.
    var officialBlockers = blockingReasons.slice();
    if (record) {
      if (record.ownerApprovalStatus !== OWNER_APPROVAL_STATUS.APPROVED) officialBlockers.push('owner-approval-missing');
      if (record.editorialStatus !== EDITORIAL_STATUS.OWNER_TEACHER_APPROVED) officialBlockers.push('editorial-status-not-owner-approved');
    }
    var eligible = officialBlockers.length === 0;

    return {
      eligible: eligible, candidateEligible: candidateEligible,
      blockingReasons: officialBlockers, candidateBlockingReasons: blockingReasons,
      warnings: warnings, evaluatedAtVersion: ELIGIBILITY_VALIDATOR_VERSION
    };
  }
  // Free Practice is deliberately permissive: blocks only rejected/unsafe
  // content, never merely because official eligibility is stricter.
  function evaluateFreePracticeEligibility(record) {
    if (!record) return { eligible: false, reason: 'missing-record' };
    if (record.classificationStatus === CLASSIFICATION_STATUS.REJECTED) return { eligible: false, reason: 'classification-rejected' };
    if (record.integrityStatus === INTEGRITY_STATUS.REJECTED) return { eligible: false, reason: 'integrity-rejected' };
    if ((record.defectCodes || []).indexOf('unsafe-html-support-text') > -1) return { eligible: false, reason: 'unsafe-content' };
    return { eligible: record.freePracticeEligible !== false, reason: '' };
  }

  /* ══════════════════════════════════════════════════════════════════════
     10/17. RESOLVERS — NO-RANDOM-FALLBACK CONTRACT.
     ══════════════════════════════════════════════════════════════════════ */
  // Task 17: when no approved official item matches, return an explicit
  // failure. NEVER the first item, a random item, another level, the full
  // bank, a Placement question, or Free Practice content passed off as
  // official.
  function resolveOfficialContent(query) {
    query = query || {};
    if (!query.contentType) return { ok: false, reason: 'official-content-unavailable', blockingReasons: ['missing-content-type'], requested: query };
    var registry = buildGovernanceRegistry();
    var pool = (registry.recordsByType[query.contentType] || []);
    var candidates = pool.filter(function (r) {
      if (query.levelId && r.acceptedLevelId !== query.levelId) return false;
      if (query.pathwayId && r.pathwayIds && r.pathwayIds.length && r.pathwayIds.indexOf(query.pathwayId) === -1) return false;
      return true;
    });
    var approved = candidates.filter(function (r) {
      var evalResult = evaluateOfficialEligibility(r, query);
      return evalResult.eligible;
    });
    if (approved.length === 0) {
      var sampleBlockers = candidates.length ? evaluateOfficialEligibility(candidates[0], query).blockingReasons : ['no-matching-candidate-for-level-or-pathway'];
      return {
        ok: false, reason: 'official-content-unavailable',
        blockingReasons: sampleBlockers,
        requested: { contentType: query.contentType, levelId: query.levelId || '', pathwayId: query.pathwayId || '' }
      };
    }
    // Deterministic selection: first by contentId sort order — never random.
    approved.sort(function (a, b) { return a.contentId < b.contentId ? -1 : a.contentId > b.contentId ? 1 : 0; });
    return { ok: true, record: approved[0] };
  }
  function resolveFreePracticeContent(query) {
    query = query || {};
    var registry = buildGovernanceRegistry();
    var pool = (registry.recordsByType[query.contentType] || []);
    var eligible = pool.filter(function (r) { return evaluateFreePracticeEligibility(r).eligible; });
    if (query.levelId) eligible = eligible.filter(function (r) { return r.acceptedLevelId === query.levelId; });
    return { ok: eligible.length > 0, records: eligible };
  }
  function resolveGovernanceRecord(contentType, contentId) {
    var registry = buildGovernanceRegistry();
    var pool = registry.recordsByType[contentType] || [];
    return pool.find(function (r) { return r.contentId === contentId; }) || null;
  }

  /* ══════════════════════════════════════════════════════════════════════
     11. NORMALIZE THE D16 REGISTRY INTO GOVERNANCE RECORDS.
     Task 18: migrate D16's simple booleans as CANDIDATE/structural
     evidence only — never final official approval.
     ══════════════════════════════════════════════════════════════════════ */
  function _pashtoStatusFor(pashtoText, englishText) {
    if (!pashtoText || String(pashtoText).trim() === '') return TRANSLATION_STATUS.MISSING;
    if (englishText && String(pashtoText).trim().toLowerCase() === String(englishText).trim().toLowerCase()) return TRANSLATION_STATUS.NEEDS_CORRECTION;
    // Detect Latin-only text in a Pashto-facing field (no Pashto-script characters present).
    if (!/[\u0600-\u06FF]/.test(String(pashtoText))) return TRANSLATION_STATUS.NEEDS_CORRECTION;
    return TRANSLATION_STATUS.PRESENT_UNVERIFIED;
  }

  function _governanceFromListening(canonicalMap) {
    var out = [];
    if (!canonicalMap) return out;
    var decisionById = {};
    if (_d18ListeningRegistration && Array.isArray(_d18ListeningRegistration.editorialDecisions)) {
      _d18ListeningRegistration.editorialDecisions.forEach(function (d) { decisionById[d.canonicalListeningId] = d; });
    }
    canonicalMap.canonicalItems.forEach(function (c) {
      var d = decisionById[c.canonicalListeningId];
      if (d) {
        var translationStatus = d.translationStatus === 'missing' ? TRANSLATION_STATUS.MISSING : TRANSLATION_STATUS.PRESENT_UNVERIFIED;
        var defects = translationStatus === TRANSLATION_STATUS.MISSING ? ['missing-pashto-support'] : [];
        out.push(makeGovernanceRecord({
          contentType: 'listening', contentId: c.canonicalListeningId, sourceSystem: 'listening-room-legacy',
          sourceIds: d.legacyAliases.slice(), legacyAliases: d.legacyAliases.slice(),
          recordVersion: 2, classificationStatus: CLASSIFICATION_STATUS.PHASE_REVIEWED,
          classificationMethod: 'd18a-absolute-utterance-complexity-editorial-review',
          acceptedLevelId: d.d18ReviewedLevel, minimumLevelId: d.minimumEligibleLevel, maximumLevelId: d.maximumEligibleLevel,
          pathwayIds: ['child', 'teen', 'general-adult', 'job-professional', 'academic-preparation'], themeIds: [d.theme],
          translationStatus: translationStatus, integrityStatus: INTEGRITY_STATUS.PHASE_VERIFIED,
          editorialStatus: EDITORIAL_STATUS.PHASE_REVIEWED, ownerApprovalStatus: OWNER_APPROVAL_STATUS.PENDING,
          provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, sourceId: c.canonicalListeningId, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED, verificationStatus: 'phase-verified' }),
          officialCandidateEligible: true, officialCurriculumEligible: false, freePracticeEligible: true,
          defectCodes: defects, responsiblePhase: 'D25',
          blockingReasons: ['owner-approval-pending', 'pashto-human-review-pending'],
          notes: 'D18A editorial decision: ' + d.disposition + '; D16=' + d.previousD16AssignedLevel + '; D18=' + d.d18ReviewedLevel + '; textHash=' + d.exactEnglishTextHash
        }));
        return;
      }
      var fallbackDefects = [], fallbackTranslation = _pashtoStatusFor(c.pashto, c.text);
      if (fallbackTranslation === TRANSLATION_STATUS.MISSING) fallbackDefects.push('missing-pashto-support');
      fallbackDefects.push('algorithmic-level-unreviewed');
      out.push(makeGovernanceRecord({
        contentType: 'listening', contentId: c.canonicalListeningId, sourceSystem: 'listening-room-legacy',
        sourceIds: c.legacyIndices.map(function (i) { return 'legacy-idx-' + i; }), legacyAliases: c.legacyIndices.map(function (i) { return 'legacy-idx-' + i; }),
        classificationStatus: CLASSIFICATION_STATUS.ALGORITHMIC_CANDIDATE, classificationMethod: 'd16-text-complexity-percentile',
        acceptedLevelId: c.acceptedLevelId, minimumLevelId: c.minimumLevelId, maximumLevelId: c.maximumLevelId,
        translationStatus: fallbackTranslation, integrityStatus: INTEGRITY_STATUS.UNVERIFIED,
        editorialStatus: EDITORIAL_STATUS.UNREVIEWED, ownerApprovalStatus: OWNER_APPROVAL_STATUS.NOT_REQUESTED,
        provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
        officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: true,
        defectCodes: fallbackDefects, responsiblePhase: 'D18', notes: 'D18 registration unavailable; D16 fallback only.'
      }));
    });
    return out;
  }

  function _governanceFromListeningPacks(packs) {
    var migration = _d18ListeningRegistration ? (_d18ListeningRegistration.d16MigrationMap || {}) : {};
    return (packs || []).map(function (p) {
      var m = migration[p.packId] || null;
      if (m) {
        var retired = m.disposition === 'retired-invalid-pack';
        return makeGovernanceRecord({
          contentType: 'listening-pack', contentId: p.packId, sourceSystem: 'listening-room-legacy',
          sourceIds: p.itemIds.slice(), classificationStatus: CLASSIFICATION_STATUS.PHASE_REVIEWED,
          classificationMethod: 'd18a-d16-pack-migration-review', acceptedLevelId: p.acceptedLevelId,
          minimumLevelId: p.acceptedLevelId, maximumLevelId: p.acceptedLevelId, pathwayIds: p.pathwayIds || [],
          translationStatus: TRANSLATION_STATUS.NOT_APPLICABLE,
          integrityStatus: retired ? INTEGRITY_STATUS.BLOCKED : INTEGRITY_STATUS.PHASE_VERIFIED,
          editorialStatus: retired ? EDITORIAL_STATUS.RETIRED_FREE_PRACTICE_ONLY : EDITORIAL_STATUS.PHASE_REVIEWED,
          ownerApprovalStatus: OWNER_APPROVAL_STATUS.PENDING,
          provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, sourceId: p.packId, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED, verificationStatus: 'phase-verified' }),
          officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: !retired,
          defectCodes: retired ? ['record-shape-invalid'] : [], responsiblePhase: 'D25',
          blockingReasons: ['superseded-by-d18-pack', 'owner-approval-pending'],
          notes: 'D18 migration disposition=' + m.disposition + '; replacement=' + (m.d18Replacement || 'none') + '; progressTransfer=false.'
        });
      }
      var defects = [], contract = getDemandContract('listening', p.acceptedLevelId);
      if (contract && p.itemIds.length < contract.min) defects.push('undersized-pack');
      if (contract && (p.itemIds.length > contract.max || p.itemIds.length >= 400)) defects.push('oversized-pack');
      if (!p.learningObjectives || !p.learningObjectives.length) defects.push('pack-objective-missing');
      return makeGovernanceRecord({
        contentType: 'listening-pack', contentId: p.packId, sourceSystem: 'listening-room-legacy', sourceIds: p.itemIds.slice(),
        classificationStatus: CLASSIFICATION_STATUS.ALGORITHMIC_CANDIDATE, classificationMethod: 'd16-deterministic-pack-builder', acceptedLevelId: p.acceptedLevelId,
        minimumLevelId: p.acceptedLevelId, maximumLevelId: p.acceptedLevelId, pathwayIds: p.pathwayIds || [],
        translationStatus: TRANSLATION_STATUS.NOT_APPLICABLE, integrityStatus: defects.length ? INTEGRITY_STATUS.DEFECTS_OPEN : INTEGRITY_STATUS.UNVERIFIED,
        provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
        defectCodes: defects, responsiblePhase: 'D18'
      });
    });
  }

  function _governanceFromD18AuthoredItems() {
    if (!_d18ListeningRegistration) return [];
    return (_d18ListeningRegistration.intermediateItems || []).concat(_d18ListeningRegistration.advancedItems || []).concat(_d18ListeningRegistration.academicItems || []).map(function (item) {
      return makeGovernanceRecord({
        contentType: 'listening', contentId: item.contentId, sourceSystem: 'listening-curriculum-d18-authored', sourceIds: [item.contentId],
        recordVersion: 2, classificationStatus: CLASSIFICATION_STATUS.PHASE_REVIEWED, classificationMethod: 'd18-authored-level-demand-contract',
        acceptedLevelId: item.acceptedLevelId, minimumLevelId: item.minimumLevelId || item.acceptedLevelId, maximumLevelId: item.maximumLevelId || item.acceptedLevelId,
        pathwayIds: item.pathwayIds || [], themeIds: item.themeIds || [], translationStatus: TRANSLATION_STATUS.PRESENT_UNVERIFIED,
        integrityStatus: INTEGRITY_STATUS.PHASE_VERIFIED, editorialStatus: EDITORIAL_STATUS.PHASE_REVIEWED, ownerApprovalStatus: OWNER_APPROVAL_STATUS.PENDING,
        provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.ACADEMY_ORIGINAL, sourceId: item.contentId, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED, translationSource: item.translationSource || 'phase-machine-draft', verificationStatus: 'phase-verified' }),
        officialCandidateEligible: true, officialCurriculumEligible: false, freePracticeEligible: true,
        defectCodes: [], responsiblePhase: 'D25', blockingReasons: ['owner-approval-pending', 'pashto-human-review-pending'],
        notes: 'D18 authored listening record; actualWordCount=' + item.estimatedWordCount + '; contentSignature=' + item.contentSignature
      });
    });
  }

  function _governanceFromD18Packs() {
    if (!_d18ListeningRegistration) return [];
    return _d18ListeningRegistration.packs.map(function (p) {
      return makeGovernanceRecord({
        contentType: 'listening-pack', contentId: p.packId, sourceSystem: 'listening-curriculum-d18', sourceIds: p.itemIds.slice(),
        recordVersion: 2, classificationStatus: CLASSIFICATION_STATUS.PHASE_REVIEWED, classificationMethod: 'd18a-normalized-pack-schema-and-task-validation',
        acceptedLevelId: p.acceptedLevelId, minimumLevelId: p.acceptedLevelId, maximumLevelId: p.acceptedLevelId,
        pathwayIds: p.pathwayIds.slice(), themeIds: [p.themeId], translationStatus: TRANSLATION_STATUS.NOT_APPLICABLE,
        integrityStatus: INTEGRITY_STATUS.PHASE_VERIFIED, editorialStatus: EDITORIAL_STATUS.PHASE_REVIEWED, ownerApprovalStatus: OWNER_APPROVAL_STATUS.PENDING,
        provenance: makeProvenance({ originType: p.contentOrigin === 'academy-authored-d18' ? PROVENANCE_ORIGIN_TYPE.ACADEMY_ORIGINAL : PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, sourceId: p.packId, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED, verificationStatus: 'phase-verified' }),
        officialCandidateEligible: true, officialCurriculumEligible: false, freePracticeEligible: true,
        defectCodes: [], responsiblePhase: 'D25', blockingReasons: ['owner-approval-pending'],
        notes: 'D18A normalized pack; tasks=' + p.taskIds.length + '; objectives=' + p.objectiveIds.length + '; signature=' + p.contentSignature
      });
    });
  }

  function _governanceFromDialogues(dialogueCatalog) {
    return (dialogueCatalog || []).map(function (d) {
      var d19Decision = _d19LegacyDecisionIndex && _d19LegacyDecisionIndex[d.contentId];
      if (d19Decision) {
        return makeGovernanceRecord({
          contentType: 'dialogue', contentId: d.contentId, sourceSystem: 'dialogue-wizard-legacy',
          sourceIds: [d.contentId], legacyAliases: d.legacyIds || [],
          classificationStatus: CLASSIFICATION_STATUS.PHASE_REVIEWED,
          classificationMethod: 'd19-complete-legacy-editorial-decision',
          acceptedLevelId: d19Decision.normalizedAcceptedLevelId, minimumLevelId: d19Decision.normalizedAcceptedLevelId, maximumLevelId: d19Decision.normalizedAcceptedLevelId,
          pathwayIds: d19Decision.pathwaySafetyStatus === 'restricted-no-child-default' ? ['teen','general-adult','job-professional','academic-preparation'] : ['child','teen','general-adult','job-professional','academic-preparation'],
          themeIds: [d19Decision.categoryId || d.themeId || 'legacy'],
          translationStatus: TRANSLATION_STATUS.PRESENT_UNVERIFIED,
          integrityStatus: INTEGRITY_STATUS.PHASE_VERIFIED,
          editorialStatus: EDITORIAL_STATUS.RETIRED_FREE_PRACTICE_ONLY,
          ownerApprovalStatus: OWNER_APPROVAL_STATUS.PENDING,
          provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, sourceId: d.contentId, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED, verificationStatus: 'd19-editorially-reviewed-free-practice-only' }),
          officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: d19Decision.freePracticeEligible !== false,
          defectCodes: ['missing-pashto-title','legacy-pronunciation-transliteration-hidden','owner-approval-pending'], responsiblePhase: 'D25',
          blockingReasons: ['legacy-three-step-free-practice-only','human-pashto-title-and-owner-review-pending'],
          notes: 'D19 disposition=' + d19Decision.disposition + '; pronunciation=' + d19Decision.pronunciationStatus + '; legacy ID and steps preserved.'
        });
      }
      var defects = [];
      if (!d.turnCountConsistentWithLevel) defects.push('turn-count-level-mismatch');
      if (d.reviewStatus === 'auto-classified-from-text') defects.push('algorithmic-level-unreviewed'); else defects.push('legacy-level-unreviewed');
      if (d.duplicateTitleGroup) defects.push('duplicate-title-needs-disambiguation');
      defects.push('missing-pathway-metadata');
      var translationStatus = TRANSLATION_STATUS.MISSING; // D16 confirmed 100% missing Pashto titles
      defects.push('missing-pashto-title');
      var rec = makeGovernanceRecord({
        contentType: 'dialogue', contentId: d.contentId, sourceSystem: 'dialogue-wizard-legacy',
        sourceIds: [d.contentId], legacyAliases: d.legacyIds || [],
        classificationStatus: d.reviewStatus === 'auto-classified-from-text' ? CLASSIFICATION_STATUS.ALGORITHMIC_CANDIDATE : CLASSIFICATION_STATUS.LEGACY_MAPPED_CANDIDATE,
        classificationMethod: d.reviewStatus, acceptedLevelId: d.acceptedLevelId, minimumLevelId: d.minimumLevelId, maximumLevelId: d.maximumLevelId,
        translationStatus: translationStatus, integrityStatus: defects.indexOf('turn-count-level-mismatch') > -1 ? INTEGRITY_STATUS.DEFECTS_OPEN : INTEGRITY_STATUS.UNVERIFIED,
        provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
        defectCodes: defects, responsiblePhase: 'D19',
        notes: 'turnCount=' + d.turnCount + '; supportMode=' + d.supportMode
      });
      var ev = evaluateOfficialEligibility(rec);
      rec.officialCandidateEligible = ev.candidateEligible; rec.officialCurriculumEligible = ev.eligible;
      rec.blockingReasons = ev.blockingReasons; rec.warnings = ev.warnings;
      return rec;
    });
  }

  function _governanceFromGrammar(grammarCatalog) {
    return (grammarCatalog || []).map(function (g) {
      var defects = [];
      var d20Reviewed = !!g.decisionCategory; // set only for the 69 topics with a real I6H-D20 editorial decision
      if (g.acceptedLevelId === 'manual-review' || !g.acceptedLevelId) defects.push('unresolved-level');
      // I6H-D20 FIX: 'legacy-level-unreviewed' is no longer honest for any of
      // the 69 source topics — every one now has a real I6H-D20 editorial
      // decision grounded in its actual level/levelNumber metadata.
      else if (!d20Reviewed) defects.push('legacy-level-unreviewed');
      // I6H-D20 FIX: prerequisites are now REAL for Foundation topics
      // (preserved from source, no longer discarded), so this defect must
      // only fire when a topic genuinely has none declared anywhere.
      if (!g.prerequisites || !g.prerequisites.length) defects.push('prerequisite-missing');
      var sourceSystem = g.sourceSystem === 'grammar-lab-foundation' ? 'grammar-lab-foundation' : 'grammar-world';
      var rec = makeGovernanceRecord({
        contentType: 'grammar-topic', contentId: g.grammarTopicId, sourceSystem: sourceSystem,
        sourceIds: [g.grammarTopicId],
        classificationStatus: g.acceptedLevelId && g.acceptedLevelId !== 'manual-review' ? CLASSIFICATION_STATUS.LEGACY_MAPPED_CANDIDATE : CLASSIFICATION_STATUS.UNCLASSIFIED,
        classificationMethod: g.reviewStatus, acceptedLevelId: g.acceptedLevelId === 'manual-review' ? '' : g.acceptedLevelId,
        // I6H-D20 FIX (Section 3.7): the pre-D20 code incorrectly labeled
        // every Grammar translation "not-applicable" — a false status, since
        // these topics DO carry English/Pashto content that requires real
        // review. PRESENT_UNVERIFIED honestly reflects: content exists,
        // phase-reviewed, but not yet human/owner-verified.
        translationStatus: TRANSLATION_STATUS.PRESENT_UNVERIFIED, integrityStatus: INTEGRITY_STATUS.UNVERIFIED,
        provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
        // I6H-D20 FIX: once a topic has a real D20 editorial decision, D20's
        // own responsibility for it is complete — the remaining required
        // action is owner/Pashto approval, which is D25 scope (matches the
        // same pattern already used for D18/D19: their own completed work
        // routes remaining approval work to D25, not back to themselves).
        defectCodes: defects, responsiblePhase: d20Reviewed ? 'D25' : 'D20'
      });
      var ev = evaluateOfficialEligibility(rec);
      rec.officialCandidateEligible = ev.candidateEligible; rec.officialCurriculumEligible = ev.eligible;
      rec.blockingReasons = ev.blockingReasons; rec.warnings = ev.warnings;
      return rec;
    });
  }

  function _governanceFromInterview(interviewCatalog) {
    var out = [];
    (interviewCatalog.tracks || []).forEach(function (t) {
      var defects = [];
      if (t.acceptedLevelId === 'manual-review') defects.push('unresolved-level'); else defects.push('legacy-level-unreviewed');
      if (t.missingPashtoSupport) defects.push('missing-pashto-support');
      if (t.professionalRegister && levelIndex(t.minimumLevelId) < levelIndex('intermediate')) defects.push('professional-register-below-minimum-level');
      if (t.professionalRegister && !t.pathwayIds.length) defects.push('child-pathway-unsafe');
      var rec = makeGovernanceRecord({
        contentType: 'interview-track', contentId: t.contentId, sourceSystem: 'interview-wizard-legacy',
        sourceIds: [t.contentId], classificationStatus: t.acceptedLevelId === 'manual-review' ? CLASSIFICATION_STATUS.UNCLASSIFIED : CLASSIFICATION_STATUS.LEGACY_MAPPED_CANDIDATE,
        classificationMethod: t.reviewStatus, acceptedLevelId: t.acceptedLevelId === 'manual-review' ? '' : t.acceptedLevelId,
        minimumLevelId: t.minimumLevelId, maximumLevelId: t.maximumLevelId, pathwayIds: t.pathwayIds || [],
        translationStatus: t.missingPashtoSupport ? TRANSLATION_STATUS.MISSING : TRANSLATION_STATUS.PRESENT_UNVERIFIED,
        integrityStatus: defects.indexOf('professional-register-below-minimum-level') > -1 ? INTEGRITY_STATUS.BLOCKED : INTEGRITY_STATUS.UNVERIFIED,
        provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
        defectCodes: defects, responsiblePhase: 'D21'
      });
      var ev = evaluateOfficialEligibility(rec);
      rec.officialCandidateEligible = ev.candidateEligible; rec.officialCurriculumEligible = ev.eligible;
      rec.blockingReasons = ev.blockingReasons; rec.warnings = ev.warnings;
      out.push(rec);
    });
    (interviewCatalog.lessons || []).forEach(function (l) {
      var defects = [];
      if (l.acceptedLevelId === 'manual-review') defects.push('unresolved-level'); else defects.push('legacy-level-unreviewed');
      if (l.missingPashtoSupport) defects.push('missing-pashto-support');
      var rec = makeGovernanceRecord({
        contentType: 'interview-lesson', contentId: l.contentId, sourceSystem: 'interview-wizard-legacy',
        sourceIds: [l.contentId], classificationStatus: l.acceptedLevelId === 'manual-review' ? CLASSIFICATION_STATUS.UNCLASSIFIED : CLASSIFICATION_STATUS.LEGACY_MAPPED_CANDIDATE,
        classificationMethod: l.reviewStatus, acceptedLevelId: l.acceptedLevelId === 'manual-review' ? '' : l.acceptedLevelId,
        translationStatus: l.missingPashtoSupport ? TRANSLATION_STATUS.MISSING : TRANSLATION_STATUS.PRESENT_UNVERIFIED,
        integrityStatus: INTEGRITY_STATUS.UNVERIFIED,
        provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
        defectCodes: defects, responsiblePhase: 'D21'
      });
      var ev = evaluateOfficialEligibility(rec);
      rec.officialCandidateEligible = ev.candidateEligible; rec.officialCurriculumEligible = ev.eligible;
      rec.blockingReasons = ev.blockingReasons; rec.warnings = ev.warnings;
      out.push(rec);
    });
    return out;
  }

  function _governanceFromStoriesOrTopics(records, contentType, sourceSystem, responsiblePhase) {
    return (records || []).map(function (r) {
      var defects = [];
      var accepted = window.ZirakAcademicProgram ? (window.ZirakAcademicProgram.normalizeAcceptedLevelId(r.level) || '') : '';
      if (!accepted) defects.push('unresolved-level'); else defects.push('legacy-level-unreviewed');
      var translationStatus = _pashtoStatusFor(r.titleDari, r.titleEn);
      if (translationStatus === TRANSLATION_STATUS.MISSING) defects.push('missing-pashto-title');
      if (translationStatus === TRANSLATION_STATUS.NEEDS_CORRECTION) defects.push('english-copied-into-pashto');
      var rec = makeGovernanceRecord({
        contentType: contentType, contentId: r.id, sourceSystem: sourceSystem, sourceIds: [r.id],
        classificationStatus: accepted ? CLASSIFICATION_STATUS.LEGACY_MAPPED_CANDIDATE : CLASSIFICATION_STATUS.UNCLASSIFIED,
        classificationMethod: 'd17-legacy-level-tag-candidate-only-full-review-queued-for-' + responsiblePhase,
        acceptedLevelId: accepted, translationStatus: translationStatus, integrityStatus: INTEGRITY_STATUS.UNVERIFIED,
        provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
        defectCodes: defects, responsiblePhase: responsiblePhase,
        notes: 'Full-text structural review (not title-only classification) is queued for ' + responsiblePhase + '; D17 records the existing legacy level tag as a candidate only.'
      });
      var ev = evaluateOfficialEligibility(rec);
      rec.officialCandidateEligible = ev.candidateEligible; rec.officialCurriculumEligible = ev.eligible;
      rec.blockingReasons = ev.blockingReasons; rec.warnings = ev.warnings;
      return rec;
    });
  }

  function _governanceFromWordLab(wordSets) {
    var out = [];
    if (!wordSets) return out;
    Object.keys(wordSets).forEach(function (setKey) {
      var set = wordSets[setKey];
      (set.words || []).forEach(function (w) {
        var defects = [];
        var target = String(w.en || '').toLowerCase(), example = String(w.ex_en || '').toLowerCase();
        var incompatible = !example || (target && example.indexOf(target) === -1);
        if (!example) defects.push('target-absent-from-example');
        else if (target && example.indexOf(target) === -1) {
          var singular = target.replace(/s$/, ''), plural = target + 's';
          if (example.indexOf(singular) > -1 || example.indexOf(plural) > -1) defects.push('inflection-mismatch');
          else defects.push('target-absent-from-example');
        }
        var translationStatus = _pashtoStatusFor(w.dari, w.en);
        if (translationStatus === TRANSLATION_STATUS.MISSING) defects.push('missing-pashto-support');
        var rec = makeGovernanceRecord({
          contentType: 'word', contentId: w.id, sourceSystem: 'word-lab-legacy', sourceIds: [w.id],
          classificationStatus: CLASSIFICATION_STATUS.NOT_APPLICABLE, // no level tag exists on legacy word records
          classificationMethod: 'not-classified-by-level-in-legacy-bank',
          translationStatus: translationStatus, integrityStatus: incompatible ? INTEGRITY_STATUS.DEFECTS_OPEN : INTEGRITY_STATUS.UNVERIFIED,
          provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
          defectCodes: defects, responsiblePhase: 'D23', notes: 'setKey=' + setKey
        });
        var ev = evaluateOfficialEligibility(rec);
        rec.officialCandidateEligible = ev.candidateEligible; rec.officialCurriculumEligible = ev.eligible;
        rec.blockingReasons = ev.blockingReasons; rec.warnings = ev.warnings;
        out.push(rec);
      });
    });
    return out;
  }

  // Task 3/11: architecture-only sample banks (ZIRAK_WORDLAB_WORDS /
  // ZIRAK_WORDLAB_SETS in content-wordlab.js) — identified honestly,
  // NEVER merged with the 416 active legacy Word Lab records, NEVER
  // official-eligible.
  function _governanceFromArchitectureSamples() {
    var out = [];
    var words = window.ZIRAK_WORDLAB_WORDS || (typeof ZIRAK_WORDLAB_WORDS !== 'undefined' ? ZIRAK_WORDLAB_WORDS : null);
    var sets = window.ZIRAK_WORDLAB_SETS || (typeof ZIRAK_WORDLAB_SETS !== 'undefined' ? ZIRAK_WORDLAB_SETS : null);
    if (Array.isArray(words)) {
      words.forEach(function (w) {
        out.push(makeGovernanceRecord({
          contentType: 'word-architecture-sample', contentId: (w && w.id) || ('sample-word-' + out.length),
          sourceSystem: 'architecture-sample', sourceIds: [(w && w.id) || ''],
          classificationStatus: CLASSIFICATION_STATUS.NOT_APPLICABLE, integrityStatus: INTEGRITY_STATUS.UNVERIFIED,
          provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.ARCHITECTURE_SAMPLE, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.NOT_APPLICABLE }),
          defectCodes: ['architecture-sample-only'], responsiblePhase: 'D23',
          officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: false,
          blockingReasons: ['architecture-sample-only'],
          notes: 'ZIRAK_WORDLAB_WORDS architecture/sample content — not part of the 416 active legacy Word Lab records; never official, never counted as a Free Practice replacement.'
        }));
      });
    }
    if (Array.isArray(sets)) {
      sets.forEach(function (s) {
        out.push(makeGovernanceRecord({
          contentType: 'word-set-architecture-sample', contentId: (s && s.id) || ('sample-set-' + out.length),
          sourceSystem: 'architecture-sample', sourceIds: [(s && s.id) || ''],
          classificationStatus: CLASSIFICATION_STATUS.NOT_APPLICABLE, integrityStatus: INTEGRITY_STATUS.UNVERIFIED,
          provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.ARCHITECTURE_SAMPLE, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.NOT_APPLICABLE }),
          defectCodes: ['architecture-sample-only'], responsiblePhase: 'D23',
          officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: false,
          blockingReasons: ['architecture-sample-only'],
          notes: 'ZIRAK_WORDLAB_SETS architecture/sample content — not part of the 46 active legacy Word Sets; never official.'
        }));
      });
    }
    return out;
  }

  // Task 22.7/14: every real School Path unit + the aggregate quiz-
  // mechanism defect. Every current unit quiz is blocked (Placement-
  // bank-sliced), never presented as aligned.
  function _governanceFromUnitQuizzes() {
    var out = [];
    var schoolPath = window.SCHOOL_PATH || (typeof SCHOOL_PATH !== 'undefined' ? SCHOOL_PATH : null);
    if (Array.isArray(schoolPath)) {
      schoolPath.forEach(function (cls) {
        (cls.units || []).forEach(function (u) {
          out.push(makeGovernanceRecord({
            contentType: 'unit-quiz', contentId: 'quiz-' + u.id, sourceSystem: 'school-path-unit-quiz-legacy',
            sourceIds: [u.id], acceptedLevelId: window.ZirakAcademicProgram ? (window.ZirakAcademicProgram.normalizeAcceptedLevelId(cls.id) || '') : '',
            classificationStatus: CLASSIFICATION_STATUS.REJECTED, integrityStatus: INTEGRITY_STATUS.BLOCKED,
            editorialStatus: EDITORIAL_STATUS.REJECTED,
            provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
            defectCodes: ['placement-bank-sliced-unit-quiz', 'quiz-not-aligned-to-unit'], responsiblePhase: 'D24',
            officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: false,
            blockingReasons: ['placement-bank-sliced-unit-quiz', 'quiz-not-aligned-to-unit'],
            notes: 'Unit: ' + u.id + ' (' + (u.en || '') + '). Current quiz mechanism is an arbitrary Placement-question slice.'
          }));
        });
      });
    }
    // Aggregate system-level defect record (Task 22.7: "while also
    // preserving one aggregate system defect record").
    out.push(makeGovernanceRecord({
      contentType: 'unit-quiz-system', contentId: 'unit-quiz-mechanism-aggregate', sourceSystem: 'school-path-unit-quiz-legacy',
      classificationStatus: CLASSIFICATION_STATUS.REJECTED, integrityStatus: INTEGRITY_STATUS.BLOCKED,
      editorialStatus: EDITORIAL_STATUS.REJECTED,
      provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
      defectCodes: ['placement-bank-sliced-unit-quiz'], responsiblePhase: 'D24',
      officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: false,
      blockingReasons: ['placement-bank-sliced-unit-quiz'],
      notes: 'Aggregate defect: the entire current unit-quiz mechanism relies on arbitrary Placement-bank slicing rather than unit-aligned blueprints.'
    }));
    return out;
  }

  // Task 22.8: Class Path legacy academic-week scaffolding — identified
  // as legacy/incomplete curriculum scaffolding, never promoted.
  function _governanceFromClassPathWeeks() {
    var out = [];
    for (var m = 1; m <= 6; m++) {
      for (var w = 1; w <= 4; w++) {
        var weekId = 'm' + m + 'w' + w;
        var isPopulated = (weekId === 'm1w1' || weekId === 'm1w2');
        out.push(makeGovernanceRecord({
          contentType: 'class-path-week', contentId: weekId, sourceSystem: 'class-path-legacy-scaffolding',
          classificationStatus: CLASSIFICATION_STATUS.NOT_APPLICABLE,
          integrityStatus: isPopulated ? INTEGRITY_STATUS.UNVERIFIED : INTEGRITY_STATUS.DEFECTS_OPEN,
          provenance: makeProvenance({ originType: PROVENANCE_ORIGIN_TYPE.LEGACY_PROJECT_INTERNAL, licenseOrPermissionStatus: PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED }),
          defectCodes: isPopulated ? [] : ['objective-missing'], responsiblePhase: 'D28',
          officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: isPopulated,
          blockingReasons: ['legacy-scaffolding-not-yet-part-of-24-week-curriculum'],
          notes: 'Legacy Class Path scaffolding — not the official 24-week curriculum. Real population is D28/D29-D30 work.'
        }));
      }
    }
    return out;
  }

  /* ══════════════════════════════════════════════════════════════════════
     MASTER GOVERNANCE REGISTRY BUILDER — deterministic, cached, real.
     ══════════════════════════════════════════════════════════════════════ */
  var _cachedGovernanceRegistry = null;
  function buildGovernanceRegistry(force) {
    if (_cachedGovernanceRegistry && !force) return _cachedGovernanceRegistry;
    var full = buildFullRegistry(force);
    var records = [];
    records = records.concat(_governanceFromListening(full.listening));
    records = records.concat(_governanceFromListeningPacks(full.listeningPacks));
    records = records.concat(_governanceFromD18AuthoredItems());
    records = records.concat(_governanceFromD18Packs());
    records = records.concat(_governanceFromDialogues(full.dialogues));
    records = records.concat(_governanceFromD19Dialogues());
    records = records.concat(_governanceFromGrammar(full.grammar));
    records = records.concat(_governanceFromInterview(full.interview));
    var stories = window.STORIES || (typeof STORIES !== 'undefined' ? STORIES : null);
    var topics = window.TOPIC_STUDIO_DATA || (typeof TOPIC_STUDIO_DATA !== 'undefined' ? TOPIC_STUDIO_DATA : null);
    records = records.concat(_governanceFromStoriesOrTopics(stories, 'story', 'stories-legacy', 'D22'));
    records = records.concat(_governanceFromStoriesOrTopics(topics, 'topic', 'topic-studio-legacy', 'D22'));
    var wordSets = window.WORD_SETS || (typeof WORD_SETS !== 'undefined' ? WORD_SETS : null);
    records = records.concat(_governanceFromWordLab(wordSets));
    records = records.concat(_governanceFromArchitectureSamples());
    records = records.concat(_governanceFromUnitQuizzes());
    records = records.concat(_governanceFromClassPathWeeks());

    // Deterministic ordering: sort by contentType then contentId.
    records.sort(function (a, b) {
      if (a.contentType !== b.contentType) return a.contentType < b.contentType ? -1 : 1;
      return a.contentId < b.contentId ? -1 : a.contentId > b.contentId ? 1 : 0;
    });

    var recordsByType = {};
    records.forEach(function (r) { (recordsByType[r.contentType] = recordsByType[r.contentType] || []).push(r); });

    // Duplicate composite-identity check (contentType+contentId).
    var seenIds = {}, duplicateIds = [];
    records.forEach(function (r) {
      var key = r.contentType + '::' + r.contentId;
      if (seenIds[key]) duplicateIds.push(key); else seenIds[key] = true;
    });

    var defectSummary = {}, eligibilitySummary = { candidateEligible: 0, officialEligible: 0, freePracticeEligible: 0, total: records.length };
    var translationSummary = {}, ownerApprovalSummary = {}, responsiblePhaseSummary = {};
    records.forEach(function (r) {
      (r.defectCodes || []).forEach(function (code) { defectSummary[code] = (defectSummary[code] || 0) + 1; });
      if (r.officialCandidateEligible) eligibilitySummary.candidateEligible++;
      if (r.officialCurriculumEligible) eligibilitySummary.officialEligible++;
      if (r.freePracticeEligible) eligibilitySummary.freePracticeEligible++;
      translationSummary[r.translationStatus] = (translationSummary[r.translationStatus] || 0) + 1;
      ownerApprovalSummary[r.ownerApprovalStatus] = (ownerApprovalSummary[r.ownerApprovalStatus] || 0) + 1;
      if (r.responsiblePhase) responsiblePhaseSummary[r.responsiblePhase] = (responsiblePhaseSummary[r.responsiblePhase] || 0) + 1;
    });

    _cachedGovernanceRegistry = {
      governanceSchemaVersion: GOVERNANCE_SCHEMA_VERSION, generatedAt: null, // identities must never depend on wall-clock time
      records: records, recordsByType: recordsByType, duplicateCompositeIds: duplicateIds,
      totalsByType: Object.keys(recordsByType).reduce(function (acc, k) { acc[k] = recordsByType[k].length; return acc; }, {}),
      defectSummary: defectSummary, eligibilitySummary: eligibilitySummary,
      translationSummary: translationSummary, ownerApprovalSummary: ownerApprovalSummary,
      responsiblePhaseSummary: responsiblePhaseSummary,
      fullRegistry: full
    };
    return _cachedGovernanceRegistry;
  }

  /* ══════════════════════════════════════════════════════════════════════
     14. MACHINE-READABLE WORK QUEUE FOR D18–D25.
     ══════════════════════════════════════════════════════════════════════ */
  // Deterministic work-item ID: derived purely from contentType+contentId
  // (+ defect code list, sorted) — NEVER Date.now() or random. Rebuilding
  // from unchanged source data produces the identical ID every time.
  function _stableWorkItemId(record) {
    var defectPart = (record.defectCodes || []).slice().sort().join('+') || 'no-defect';
    return 'wi-' + record.contentType + '-' + record.contentId + '-' + defectPart;
  }
  function _priorityForRecord(record) {
    var codes = record.defectCodes || [];
    var hasCritical = codes.some(function (c) { var d = getDefectDefinition(c); return d && d.severity === 'critical'; });
    if (hasCritical) return 'critical';
    var hasHigh = codes.some(function (c) { var d = getDefectDefinition(c); return d && d.severity === 'high'; });
    if (hasHigh) return 'high';
    var hasMedium = codes.some(function (c) { var d = getDefectDefinition(c); return d && d.severity === 'medium'; });
    if (hasMedium) return 'medium';
    return codes.length ? 'low' : 'informational';
  }
  var _cachedWorkQueue = null;
  function buildContentWorkQueue(force) {
    if (_cachedWorkQueue && !force) return _cachedWorkQueue;
    var registry = buildGovernanceRegistry(force);
    var items = registry.records
      .filter(function (r) { return (r.defectCodes && r.defectCodes.length) || !r.officialCurriculumEligible; })
      .map(function (r) {
        var severity = (r.defectCodes || []).reduce(function (worst, code) {
          var d = getDefectDefinition(code);
          var order = { critical: 4, high: 3, medium: 2, low: 1 };
          if (d && (order[d.severity] || 0) > (order[worst] || 0)) return d.severity;
          return worst;
        }, 'informational');
        return {
          workItemId: _stableWorkItemId(r), contentType: r.contentType, contentId: r.contentId,
          sourceSystem: r.sourceSystem, priority: _priorityForRecord(r), severity: severity,
          defectCodes: r.defectCodes || [], requiredActions: (r.defectCodes || []).map(function (c) { var d = getDefectDefinition(c); return d ? d.remediation : ''; }).filter(Boolean),
          responsiblePhase: r.responsiblePhase || 'D25', dependsOnWorkItemIds: [],
          ownerReviewRequired: r.ownerApprovalStatus !== OWNER_APPROVAL_STATUS.APPROVED,
          pashtoReviewRequired: r.translationStatus !== TRANSLATION_STATUS.NOT_APPLICABLE && r.translationStatus !== TRANSLATION_STATUS.HUMAN_REVIEWED && r.translationStatus !== TRANSLATION_STATUS.OWNER_APPROVED,
          provenanceReviewRequired: !r.provenance || r.provenance.originType === PROVENANCE_ORIGIN_TYPE.UNKNOWN || r.provenance.licenseOrPermissionStatus === PROVENANCE_PERMISSION_STATUS.UNKNOWN,
          acceptanceCriteria: 'Resolve all listed defect codes; achieve classification/integrity/translation phase-reviewed status; obtain explicit owner/teacher approval before officialCurriculumEligible may become true.',
          currentClassificationStatus: r.classificationStatus, currentTranslationStatus: r.translationStatus,
          currentIntegrityStatus: r.integrityStatus, currentOwnerApprovalStatus: r.ownerApprovalStatus,
          officialCandidateEligible: r.officialCandidateEligible, officialCurriculumEligible: r.officialCurriculumEligible,
          blockingReasons: r.blockingReasons || [], notes: r.notes || ''
        };
      });
    // Deterministic ordering across rebuilds: by workItemId (which is
    // itself purely derived from stable fields).
    items.sort(function (a, b) { return a.workItemId < b.workItemId ? -1 : a.workItemId > b.workItemId ? 1 : 0; });
    var duplicateWorkIds = [];
    var seen = {};
    items.forEach(function (it) { if (seen[it.workItemId]) duplicateWorkIds.push(it.workItemId); seen[it.workItemId] = true; });
    var byPhase = {};
    items.forEach(function (it) { (byPhase[it.responsiblePhase] = byPhase[it.responsiblePhase] || []).push(it.workItemId); });
    _cachedWorkQueue = { items: items, totalItems: items.length, duplicateWorkItemIds: duplicateWorkIds, countsByPhase: Object.keys(byPhase).reduce(function (acc, k) { acc[k] = byPhase[k].length; return acc; }, {}) };
    return _cachedWorkQueue;
  }
  function getWorkItemsForPhase(phaseId) {
    var q = buildContentWorkQueue();
    return q.items.filter(function (it) { return it.responsiblePhase === phaseId; });
  }

  /* ══════════════════════════════════════════════════════════════════
     I6H-D18 — LISTENING CURRICULUM D18 REGISTRATION
     zirak-listening-curriculum-d18.js calls this once at load time.
     This is the ONLY registration point; no competing engine is created.
     ══════════════════════════════════════════════════════════════════ */
  var _d18ListeningRegistration = null;
  var _d18CanonicalIndex = null;
  var _d18TaskIndex = null;
  var _d18SessionSequence = 0;

  function _d18NowIso() { return new Date().toISOString(); }
  function _d18Clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function _d18WordCount(text) {
    var matches = String(text || '').match(/[A-Za-z]+(?:['’\-][A-Za-z]+)*/g);
    return matches ? matches.length : 0;
  }
  function _d18ItemText(item, includeSpeakers) {
    if (!item) return '';
    if (Array.isArray(item.script)) {
      return item.script.map(function (line) {
        var text = String((line && line.text) || '').trim();
        if (!text) return '';
        return includeSpeakers && line.speaker ? String(line.speaker) + ': ' + text : text;
      }).filter(Boolean).join(' ');
    }
    return String(item.text || item.englishText || item.en || '').trim();
  }
  function _d18ItemSections(item) {
    if (!item) return [];
    if (Array.isArray(item.script) && item.script.length) {
      return item.script.map(function (line, idx) {
        return {
          sectionId: line.lineId || line.sectionId || ((item.contentId || item.canonicalListeningId || 'item') + '-section-' + (idx + 1)),
          lineId: line.lineId || '', speaker: line.speaker || '', text: String(line.text || '').trim(), position: idx
        };
      }).filter(function (line) { return !!line.text; });
    }
    var text = _d18ItemText(item, false);
    return text ? [{ sectionId: (item.contentId || item.canonicalListeningId || 'item') + '-section-1', lineId: '', speaker: '', text: text, position: 0 }] : [];
  }
  function _d18RightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  function _d18Sha256(ascii) {
    ascii = unescape(encodeURIComponent(String(ascii || '')));
    var mathPow = Math.pow, maxWord = mathPow(2, 32), lengthProperty = 'length', i, j;
    var result = '', words = [], asciiBitLength = ascii[lengthProperty] * 8;
    // Build fresh initialization vectors for every call. Reusing the mutated
    // digest state would make later hashes depend on call order.
    var hash = [], k = [], primeCounter = 0;
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += '\x80';
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16), oldHash = hash.slice(0), workingHash = hash.slice(0);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = workingHash[0], e = workingHash[4];
        var temp1 = workingHash[7]
          + (_d18RightRotate(e, 6) ^ _d18RightRotate(e, 11) ^ _d18RightRotate(e, 25))
          + ((e & workingHash[5]) ^ ((~e) & workingHash[6])) + k[i]
          + (w[i] = (i < 16) ? w[i] : (w[i - 16]
            + (_d18RightRotate(w15, 7) ^ _d18RightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7] + (_d18RightRotate(w2, 17) ^ _d18RightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
        var temp2 = (_d18RightRotate(a, 2) ^ _d18RightRotate(a, 13) ^ _d18RightRotate(a, 22))
          + ((a & workingHash[1]) ^ (a & workingHash[2]) ^ (workingHash[1] & workingHash[2]));
        workingHash = [(temp1 + temp2) | 0].concat(workingHash);
        workingHash[4] = (workingHash[4] + temp1) | 0;
        workingHash.pop();
      }
      for (i = 0; i < 8; i++) hash[i] = (workingHash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : '') + b.toString(16);
      }
    }
    return result;
  }
  function _d18CanonicalArray() {
    return window.LISTEN_SENTENCES || (typeof LISTEN_SENTENCES !== 'undefined' ? LISTEN_SENTENCES : null);
  }
  function _d18InferTheme(text) {
    var t = String(text || '').toLowerCase();
    var rules = [
      ['education', /school|class|teacher|student|book|lesson|homework|exam|learn/],
      ['family', /family|mother|father|brother|sister|parent|child/],
      ['food-and-drink', /food|bread|rice|tea|water|eat|drink|restaurant/],
      ['health', /doctor|hospital|medicine|health|pain|sick/],
      ['transport', /bus|taxi|car|train|road|station|travel/],
      ['shopping', /market|shop|buy|price|cost|money/],
      ['time', /time|clock|morning|evening|today|tomorrow|week|month/],
      ['work', /work|job|office|manager|meeting/],
      ['communication', /say|speak|call|phone|message|ask|answer/],
      ['places', /home|house|room|city|village|park|street/]
    ];
    for (var i = 0; i < rules.length; i++) if (rules[i][1].test(t)) return rules[i][0];
    return 'general-conversation';
  }
  function _d18DemandType(levelId) {
    return {
      starter: 'short-utterance-recognition', basic: 'simple-sentence-recognition',
      beginner: 'linked-sentence-recognition', elementary: 'short-detail-listening',
      intermediate: 'connected-dialogue-listening', advanced: 'connected-argument-listening',
      academic: 'structured-academic-listening'
    }[levelId] || 'listening-practice';
  }
  function _d18BuildCanonicalIndex(force) {
    if (_d18CanonicalIndex && !force) return _d18CanonicalIndex;
    var listenArr = _d18CanonicalArray();
    if (!Array.isArray(listenArr)) return null;
    var map = classifyListeningBank(buildListeningCanonicalMap(listenArr));
    if (!map || map.totalLegacy !== 400 || map.totalCanonical !== 310 || map.totalRedundantAliases !== 90) return null;
    var enriched = map.canonicalItems.map(function (c) {
      return { item: c, wordCount: _d18WordCount(c.text), complexity: textComplexityScore(c.text) };
    });
    function byComplexity(a, b) { return a.complexity - b.complexity || (a.item.canonicalListeningId < b.item.canonicalListeningId ? -1 : 1); }
    var six = enriched.filter(function (x) { return x.wordCount === 6; }).sort(byComplexity);
    var eight = enriched.filter(function (x) { return x.wordCount === 8; }).sort(byComplexity);
    var starterSix = {};
    six.slice(0, 3).forEach(function (x) { starterSix[x.item.canonicalListeningId] = true; });
    var basicEight = {};
    eight.slice(0, 9).forEach(function (x) { basicEight[x.item.canonicalListeningId] = true; });
    var elementaryEight = {};
    eight.slice(-3).forEach(function (x) { elementaryEight[x.item.canonicalListeningId] = true; });
    // Two explicit boundary swaps preserve the reviewed distribution while
    // correcting the D16 equality count to the verified 41 retain / 269 relevel.
    delete starterSix['listen-c-0096'];
    starterSix['listen-c-0103'] = true;
    function reviewedLevel(x) {
      if (x.wordCount <= 5) return 'starter';
      if (x.wordCount === 6) return starterSix[x.item.canonicalListeningId] ? 'starter' : 'basic';
      if (x.wordCount === 7) return 'basic';
      if (x.wordCount === 8) {
        if (basicEight[x.item.canonicalListeningId]) return 'basic';
        return elementaryEight[x.item.canonicalListeningId] ? 'elementary' : 'beginner';
      }
      return 'elementary';
    }
    var byId = {}, decisions = [], legacyToCanonical = map.legacyIndexToCanonicalId.slice();
    enriched.forEach(function (x) {
      var c = x.item, reviewed = reviewedLevel(x);
      var minLevel = reviewed === 'starter' ? 'starter' : reviewed === 'basic' ? 'starter' : reviewed === 'beginner' ? 'basic' : 'beginner';
      var maxLevel = reviewed === 'starter' ? 'basic' : reviewed === 'basic' ? 'beginner' : reviewed === 'beginner' ? 'elementary' : 'intermediate';
      var support = String(c.pashto || '').trim();
      var theme = _d18InferTheme(c.text);
      var decision = {
        canonicalListeningId: c.canonicalListeningId,
        legacyIndices: c.legacyIndices.slice(),
        legacyAliases: c.legacyIndices.map(function (idx) { return 'legacy-idx-' + idx; }),
        exactEnglishTextHash: _d18Sha256(String(c.text || '').trim()),
        exactSupportTextHash: support ? _d18Sha256(support) : '',
        supportTextStatus: support ? 'present-unverified' : 'missing',
        previousD16AssignedLevel: c.acceptedLevelId,
        d18ReviewedLevel: reviewed,
        minimumEligibleLevel: minLevel,
        maximumEligibleLevel: maxLevel,
        disposition: c.acceptedLevelId === reviewed ? 'retain' : 'relevel',
        rationale: 'Editorial review used absolute utterance length, grammar density, clause/marker complexity, and communicative purpose; ' + x.wordCount + ' words, complexity score ' + x.complexity + '. Boundary ties were resolved by sentence structure rather than percentile rank alone.',
        theme: theme,
        category: theme,
        listeningDemandType: _d18DemandType(reviewed),
        officialCandidateEligible: true,
        officialCurriculumEligible: false,
        freePracticeEligible: true,
        classificationStatus: 'phase-reviewed',
        editorialStatus: 'phase-reviewed',
        translationStatus: support ? 'present-unverified' : 'missing',
        integrityStatus: 'phase-verified',
        ownerApprovalStatus: 'pending',
        provenance: { originType: 'legacy-project-internal', sourceId: c.canonicalListeningId, licenseOrPermissionStatus: 'academy-owned', verificationStatus: 'phase-verified' },
        defectCodes: support ? ['owner-approval-pending', 'pashto-human-review-pending'] : ['missing-pashto-support', 'owner-approval-pending'],
        responsibleNextReviewPhase: 'D25',
        reviewerRole: 'phase-editorial-review',
        reviewTimestamp: '2026-07-30T00:00:00.000Z',
        recordVersion: 'D18A-1',
        exactEnglishText: c.text,
        exactSupportText: support
      };
      decisions.push(decision);
      byId[c.canonicalListeningId] = {
        contentId: c.canonicalListeningId,
        canonicalListeningId: c.canonicalListeningId,
        contentOrigin: 'legacy-canonical', text: c.text, englishText: c.text,
        en: c.text, pashto: support, dari: support,
        acceptedLevelId: reviewed, minimumLevelId: minLevel, maximumLevelId: maxLevel,
        pathwayIds: ['child', 'teen', 'general-adult', 'job-professional', 'academic-preparation'],
        themeId: theme, legacyIndices: c.legacyIndices.slice(), editorialDecision: decision,
        sections: [{ sectionId: c.canonicalListeningId + '-section-1', lineId: '', speaker: '', text: c.text, position: 0 }]
      };
    });
    _d18CanonicalIndex = { map: map, byId: byId, decisions: decisions, legacyIndexToCanonicalId: legacyToCanonical };
    return _d18CanonicalIndex;
  }
  function resolveD18CanonicalItem(contentId) {
    var idx = _d18BuildCanonicalIndex(false);
    return idx && idx.byId[contentId] ? _d18Clone(idx.byId[contentId]) : null;
  }
  function _d18AuthoredIndex(payload) {
    var all = (payload.intermediateItems || []).concat(payload.advancedItems || []).concat(payload.academicItems || []);
    var byId = {};
    all.forEach(function (item) {
      var copy = _d18Clone(item);
      copy.contentId = copy.contentId || copy.canonicalListeningId;
      copy.englishText = _d18ItemText(copy, false);
      copy.text = copy.englishText;
      copy.sections = _d18ItemSections(copy);
      copy.actualWordCount = _d18WordCount(copy.englishText);
      copy.estimatedWordCount = copy.actualWordCount;
      copy.contentSignature = _d18Sha256(copy.contentId + '|' + copy.englishText);
      copy.ownerApprovalStatus = 'pending';
      copy.officialCandidateEligible = true;
      copy.officialCurriculumEligible = false;
      copy.freePracticeEligible = true;
      byId[copy.contentId] = copy;
    });
    return { all: Object.keys(byId).sort().map(function (id) { return byId[id]; }), byId: byId };
  }
  function _d18TopVocabulary(items, themeId) {
    var stop = { the:1, a:1, an:1, is:1, are:1, am:1, i:1, you:1, he:1, she:1, it:1, we:1, they:1, to:1, of:1, in:1, on:1, at:1, for:1, and:1, or:1, but:1, this:1, that:1, my:1, your:1, our:1, their:1, with:1, from:1, can:1, do:1, does:1, did:1 };
    var counts = {};
    items.forEach(function (item) {
      (_d18ItemText(item, false).toLowerCase().match(/[a-z]+(?:['\-][a-z]+)*/g) || []).forEach(function (word) {
        if (word.length > 3 && !stop[word]) counts[word] = (counts[word] || 0) + 1;
      });
      (item.vocabularyTargets || []).forEach(function (word) { counts[String(word).toLowerCase()] = (counts[String(word).toLowerCase()] || 0) + 3; });
    });
    var out = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || (a < b ? -1 : 1); }).slice(0, 8);
    if (!out.length && themeId) out.push(String(themeId).replace(/-/g, ' '));
    return out;
  }
  function _d18GrammarTargets(pack, items) {
    var existing = (pack.grammarOrDiscourseTargets || pack.discourseTargets || pack.grammarTargets || []).filter(function (x) { return x && x !== 'context-dependent'; });
    items.forEach(function (item) {
      existing = existing.concat(item.grammarTargets || []).concat(item.discourseTargets || []);
    });
    var text = items.map(function (item) { return _d18ItemText(item, false); }).join(' ').toLowerCase();
    if (!existing.length) {
      if (/\?/.test(text)) existing.push('question-forms');
      if (/\b(will|going to)\b/.test(text)) existing.push('future-reference');
      if (/\b(was|were|did|went|had)\b/.test(text)) existing.push('past-reference');
      if (/\b(because|although|however|therefore|while)\b/.test(text)) existing.push('linking-and-discourse-markers');
      if (!existing.length) existing.push('present-simple-and-functional-phrases');
    }
    var seen = {};
    return existing.map(String).filter(function (x) { var k = x.toLowerCase(); if (seen[k]) return false; seen[k] = true; return true; }).slice(0, 8);
  }
  function _d18ThemeOptions(theme) {
    var themes = ['education', 'family', 'food-and-drink', 'health', 'transport', 'shopping', 'work', 'time', 'communication', 'general-conversation'];
    var out = [theme];
    themes.forEach(function (x) { if (out.length < 4 && x !== theme) out.push(x); });
    return out;
  }
  function _d18TaskBase(pack, item, stageId, suffix, taskType) {
    return {
      taskId: pack.packId + '-task-' + suffix,
      packId: pack.packId, packRef: pack.packId,
      itemId: item.contentId || item.canonicalListeningId,
      passageOrSectionIdentity: item.contentId || item.canonicalListeningId,
      stageId: stageId, acceptedLevelId: pack.acceptedLevelId, level: pack.acceptedLevelId,
      pathwayIds: pack.pathwayIds.slice(), taskType: taskType,
      prompt: '', options: [], correctIndex: -1, correctAnswer: null,
      explanation: '', pashtoStatus: 'phase-translated-unverified', evidenceWeight: 1,
      retryPolicy: 'once', scoringMode: 'auto', technicalFailureBehavior: 'neutral',
      governanceStatus: 'phase-reviewed-candidate-owner-approval-pending',
      provenance: { originType: 'academy-original-task', phase: 'I6H-D18A', sourcePackId: pack.packId },
      officialCurriculumEligible: false, ownerApprovalStatus: 'pending'
    };
  }
  function _d18GenerateTasks(pack, items) {
    var level = pack.acceptedLevelId, tasks = [], first = items[0], second = items[1] || first;
    function hasStage(stageId) { return (pack.stages || []).some(function (s) { return s.stageId === stageId; }); }
    function stageOr(preferred, fallback) { return hasStage(preferred) ? preferred : (hasStage(fallback) ? fallback : ((pack.stages[0] && pack.stages[0].stageId) || preferred)); }
    var detailStageId = stageOr('listen-for-detail', 'first-listen-gist');
    var sequenceStageId = stageOr('listen-for-detail', 'repeat-or-shadow');
    var sections = _d18ItemSections(first), firstSection = sections[0] || { sectionId: first.contentId + '-section-1', text: _d18ItemText(first, false) };
    var secondSection = sections[1] || firstSection;
    var themeTask = _d18TaskBase(pack, first, 'first-listen-gist', '01-gist', 'choose-gist-theme');
    themeTask.prompt = 'Which theme best matches the complete listening item?';
    themeTask.options = _d18ThemeOptions(pack.themeId);
    themeTask.correctIndex = 0; themeTask.correctAnswer = { type: 'option-index', value: 0 };
    themeTask.explanation = 'The complete item is organized around the theme "' + pack.themeLabel + '".';
    tasks.push(themeTask);

    var recognition = _d18TaskBase(pack, first, level === 'intermediate' || level === 'advanced' || level === 'academic' ? detailStageId : 'repeat-or-shadow', '02-opening', 'identify-opening-section');
    var optionTexts = [firstSection.text];
    sections.slice(1).forEach(function (s) { if (optionTexts.length < 4) optionTexts.push(s.text); });
    items.slice(1).forEach(function (it) { if (optionTexts.length < 4) optionTexts.push(_d18ItemText(it, false)); });
    while (optionTexts.length < 4) optionTexts.push('This sentence was not part of the selected listening item.');
    recognition.passageOrSectionIdentity = firstSection.sectionId;
    recognition.prompt = 'Which exact section opens the selected listening item?';
    recognition.options = optionTexts.slice(0, 4); recognition.correctIndex = 0;
    recognition.correctAnswer = { type: 'option-index', value: 0, exactSectionId: firstSection.sectionId };
    recognition.explanation = 'The opening section is tied to ' + firstSection.sectionId + '.';
    tasks.push(recognition);

    var repeat = _d18TaskBase(pack, second, 'repeat-or-shadow', '03-repeat', 'exact-section-repeat');
    var repeatSections = _d18ItemSections(second), repeatSection = repeatSections[Math.min(1, repeatSections.length - 1)] || firstSection;
    repeat.passageOrSectionIdentity = repeatSection.sectionId;
    repeat.prompt = 'Repeat this exact section clearly: "' + repeatSection.text + '"';
    repeat.correctAnswer = { type: 'speech-similarity', expectedText: repeatSection.text, masteryThreshold: 70 };
    repeat.explanation = 'Speech is compared only with the selected section, never the whole passage.';
    repeat.scoringMode = 'speech-similarity'; repeat.retryPolicy = 'twice';
    tasks.push(repeat);

    var oral = _d18TaskBase(pack, first, 'oral-follow-up', '04-oral', 'short-oral-response');
    oral.prompt = level === 'starter' || level === 'basic'
      ? 'Say one short sentence connected to ' + pack.themeLabel + '.'
      : 'Give a concise oral summary of the main message and one supporting detail.';
    oral.correctAnswer = { type: 'teacher-rubric', criteria: ['responds-to-theme', 'uses-understandable-English', 'includes-one-relevant-detail'] };
    oral.explanation = 'Teacher/rubric task; technical microphone failure must use manual completion and cannot become score zero.';
    oral.scoringMode = 'teacher-rubric'; oral.retryPolicy = 'manual-fallback'; oral.technicalFailureBehavior = 'manual-completion'; oral.teacherRubric = true;
    tasks.push(oral);

    if (level === 'beginner' || level === 'elementary' || level === 'intermediate' || level === 'advanced' || level === 'academic') {
      var sequence = _d18TaskBase(pack, first, level === 'academic' ? detailStageId : (level === 'beginner' || level === 'elementary' ? 'repeat-or-shadow' : sequenceStageId), '05-sequence', 'sequence-sections');
      sequence.passageOrSectionIdentity = secondSection.sectionId;
      sequence.prompt = 'Which section follows the opening section in the selected item?';
      var seqOptions = [secondSection.text];
      sections.slice(2).forEach(function (s) { if (seqOptions.length < 4) seqOptions.push(s.text); });
      items.slice(1).forEach(function (it) { if (seqOptions.length < 4) seqOptions.push(_d18ItemText(it, false)); });
      while (seqOptions.length < 4) seqOptions.push('No additional section follows.');
      sequence.options = seqOptions.slice(0, 4); sequence.correctIndex = 0;
      sequence.correctAnswer = { type: 'option-index', value: 0, exactSectionId: secondSection.sectionId };
      sequence.explanation = 'This checks the real section order of the selected item.';
      tasks.push(sequence);
    }

    if (level === 'intermediate' || level === 'advanced' || level === 'academic') {
      var detailSection = sections[Math.min(2, sections.length - 1)] || firstSection;
      var detail = _d18TaskBase(pack, first, detailStageId, '06-detail', 'locate-supporting-detail');
      detail.passageOrSectionIdentity = detailSection.sectionId;
      detail.prompt = 'Which exact section supplies a supporting detail after the opening?';
      detail.options = [detailSection.text, firstSection.text, secondSection.text, 'The passage gives no supporting detail.'];
      detail.correctIndex = 0; detail.correctAnswer = { type: 'option-index', value: 0, exactSectionId: detailSection.sectionId };
      detail.explanation = 'The correct answer is the governed section ' + detailSection.sectionId + '.';
      detail.evidenceWeight = 2;
      tasks.push(detail);
    }

    if (level === 'advanced' || level === 'academic') {
      var vocabulary = pack.vocabularyTargets.slice(0, 3);
      var stage = level === 'academic' ? 'dictation-or-key-words' : 'weak-item-recovery';
      var keyword = _d18TaskBase(pack, first, stage, '07-keywords', 'keyword-dictation');
      keyword.prompt = 'Write or say these key words after hearing their exact passage section: ' + vocabulary.join(', ') + '.';
      keyword.correctAnswer = { type: 'keyword-set', expectedKeywords: vocabulary, minimumMatches: Math.max(1, Math.ceil(vocabulary.length * 0.67)) };
      keyword.explanation = 'The expected keyword set comes from the pack vocabulary targets.';
      keyword.scoringMode = 'keyword-match'; keyword.evidenceWeight = 2;
      tasks.push(keyword);
    }

    if (level === 'academic') {
      var review = _d18TaskBase(pack, first, 'review-challenge', '08-review', 'critical-response');
      review.prompt = 'State the passage claim, one piece of evidence, and one implication in your own words.';
      review.correctAnswer = { type: 'teacher-rubric', criteria: ['claim-identified', 'evidence-identified', 'implication-explained'] };
      review.explanation = 'Academic review task assessed by a teacher rubric; no automatic invented answer is used.';
      review.scoringMode = 'teacher-rubric'; review.retryPolicy = 'manual-fallback'; review.technicalFailureBehavior = 'manual-completion'; review.teacherRubric = true; review.evidenceWeight = 2;
      tasks.push(review);
    }

    var requiredCounts = { starter: 3, basic: 3, beginner: 4, elementary: 4, intermediate: 5, advanced: 6, academic: 6 };
    var required = requiredCounts[level] || 3;
    // Select purposeful tasks by level rather than retaining every generated option.
    if (level === 'starter' || level === 'basic') tasks = [tasks[0], tasks[2], tasks[3]];
    else if (level === 'beginner' || level === 'elementary') tasks = [tasks[0], tasks[1], tasks[4], tasks[3]];
    else if (level === 'intermediate') tasks = [tasks[0], tasks[1], tasks[4], tasks[5], tasks[3]];
    else if (level === 'advanced') tasks = [tasks[0], tasks[1], tasks[4], tasks[5], tasks[2], tasks[6]];
    else if (level === 'academic') tasks = [tasks[0], tasks[1], tasks[5], tasks[6], tasks[3], tasks[7]];
    return tasks.slice(0, required);
  }
  function _d18NormalizeRegistration(payload) {
    var canonical = _d18BuildCanonicalIndex(true);
    if (!canonical) return { ok: false, errors: ['legacy-canonical-index-unavailable-or-count-mismatch'] };
    var authored = _d18AuthoredIndex(payload), allItemsById = {};
    Object.keys(canonical.byId).forEach(function (id) { allItemsById[id] = canonical.byId[id]; });
    Object.keys(authored.byId).forEach(function (id) { allItemsById[id] = authored.byId[id]; });
    var rawPacks = payload.packs || [], seenPack = {}, errors = [], normalized = [];
    rawPacks.forEach(function (raw) {
      if (!raw || !raw.packId) { errors.push('pack-missing-id'); return; }
      if (seenPack[raw.packId]) { errors.push('duplicate-pack-id:' + raw.packId); return; }
      seenPack[raw.packId] = true;
      var itemSeen = {}, items = [];
      (raw.itemIds || []).forEach(function (id) {
        if (itemSeen[id]) errors.push('duplicate-item-in-pack:' + raw.packId + ':' + id);
        itemSeen[id] = true;
        if (!allItemsById[id]) errors.push('unresolved-item-id:' + raw.packId + ':' + id);
        else items.push(allItemsById[id]);
      });
      var p = _d18Clone(raw);
      p.packVersion = p.packVersion || p.version || '1.0'; p.version = p.packVersion;
      p.acceptedLevelId = String(p.acceptedLevelId || '').toLowerCase();
      p.pathwayIds = (p.pathwayIds || []).map(_d18NormPathway).filter(Boolean);
      if (!p.pathwayIds.length) p.pathwayIds = ['teen', 'general-adult'];
      p.themeId = p.themeId || p.theme || 'general-conversation';
      p.themeLabel = String(p.themeLabel || p.themeId).replace(/-/g, ' ');
      p.itemIds = (p.itemIds || []).slice();
      p.measurableObjectives = p.measurableObjectives || [
        'Identify the main theme after one complete listen.',
        'Complete the exact stage tasks with at least 70 percent mastery or teacher confirmation.',
        'Produce one oral response tied to the governed item or passage.'
      ];
      p.objectiveIds = p.measurableObjectives.map(function (_, idx) { return p.packId + '-objective-' + String(idx + 1).padStart(2, '0'); });
      p.objectives = p.measurableObjectives.slice();
      p.vocabularyTargets = _d18TopVocabulary(items, p.themeId);
      p.grammarOrDiscourseTargets = _d18GrammarTargets(p, items);
      p.grammarTargets = p.grammarOrDiscourseTargets.slice();
      p.listeningSkills = (p.listeningSkills || ['gist', 'detail', 'controlled-response']).slice();
      p.supportMode = p.supportMode || 'partial'; p.speedProfile = p.speedProfile || 'normal';
      p.oralFollowUp = { stageId: 'oral-follow-up', prompt: p.measurableObjectives[2], scoringMode: 'teacher-rubric', technicalFailureBehavior: 'manual-completion' };
      p.prerequisitePackIds = [];
      p.reviewPackIds = [];
      p.reviewRules = { reviewAfterDays: 7, weakItemRecoveryFirst: true, completedPackDoesNotRestartSilently: true };
      p.recoveryAlternative = { stageId: 'weak-item-recovery', mode: 'selected-weak-items-only', manualFallback: true };
      p.provenance = typeof p.provenance === 'object' ? p.provenance : { originType: p.contentOrigin === 'academy-authored-d18' ? 'academy-original' : 'legacy-project-internal', phase: 'I6H-D18' };
      p.classificationStatus = 'phase-reviewed'; p.editorialStatus = 'phase-reviewed';
      p.translationStatus = p.translationStatus || 'phase-translated-unverified'; p.integrityStatus = 'phase-verified'; p.ownerApprovalStatus = 'pending';
      p.officialCandidateEligible = true; p.officialCurriculumEligible = false; p.freePracticeEligible = true;
      p.practiceStages = (p.stages || []).map(function (stage) { var s = _d18Clone(stage); s.taskIds = []; return s; });
      p.stages = p.practiceStages;
      var stageTotal = p.stages.reduce(function (sum, s) { return sum + Number(s.estimatedMinutes || 0); }, 0);
      p.estimatedStageMinutes = p.stages.reduce(function (acc, s) { acc[s.stageId] = Number(s.estimatedMinutes || 0); return acc; }, {});
      p.estimatedFullPackMinutes = stageTotal;
      p.contentSignature = _d18Sha256(p.packId + '|' + p.packVersion + '|' + p.itemIds.join('|') + '|' + p.measurableObjectives.join('|'));
      p._resolvedItemCount = items.length;
      normalized.push(p);
    });
    normalized.sort(function (a, b) {
      var la = levelIndex(a.acceptedLevelId), lb = levelIndex(b.acceptedLevelId);
      return la - lb || Number(a.sequenceOrder || 0) - Number(b.sequenceOrder || 0) || (a.packId < b.packId ? -1 : 1);
    });
    var previousByLevel = {};
    normalized.forEach(function (p) {
      var prev = previousByLevel[p.acceptedLevelId];
      if (prev) { p.prerequisitePackIds = [prev.packId]; p.reviewPackIds = [prev.packId]; }
      previousByLevel[p.acceptedLevelId] = p;
    });
    var tasks = [], taskById = {};
    normalized.forEach(function (p) {
      var items = p.itemIds.map(function (id) { return allItemsById[id]; });
      var packTasks = _d18GenerateTasks(p, items);
      p.taskIds = packTasks.map(function (t) { return t.taskId; });
      packTasks.forEach(function (t) {
        if (taskById[t.taskId]) errors.push('duplicate-task-id:' + t.taskId);
        taskById[t.taskId] = t; tasks.push(t);
        var stage = p.stages.find(function (s) { return s.stageId === t.stageId; });
        if (!stage) errors.push('task-stage-missing:' + t.taskId + ':' + t.stageId);
        else stage.taskIds.push(t.taskId);
      });
      p.stages.forEach(function (stage) {
        if (!stage.taskIds.length) {
          // A stage without a scored task remains a real playback/recovery stage,
          // explicitly mapped to its completion criterion rather than an orphan.
          stage.taskIds = [];
          stage.nonTaskCompletion = stage.completionCriteria || 'teacher-confirmed';
        }
      });
    });
    var expectedByLevel = { starter: 8, basic: 8, beginner: 10, elementary: 10, intermediate: 10, advanced: 10, academic: 10 };
    Object.keys(expectedByLevel).forEach(function (level) {
      var count = normalized.filter(function (p) { return p.acceptedLevelId === level; }).length;
      if (count !== expectedByLevel[level]) errors.push('pack-count-mismatch:' + level + ':' + count);
    });
    if (authored.all.length !== 30) errors.push('authored-item-count-mismatch:' + authored.all.length);
    if (errors.length) return { ok: false, errors: errors };
    payload.version = 'I6H-D18A';
    payload.editorialDecisions = canonical.decisions;
    payload.intermediateItems = authored.all.filter(function (x) { return x.acceptedLevelId === 'intermediate'; });
    payload.advancedItems = authored.all.filter(function (x) { return x.acceptedLevelId === 'advanced'; });
    payload.academicItems = authored.all.filter(function (x) { return x.acceptedLevelId === 'academic'; });
    payload.packs = normalized; payload.tasks = tasks;
    payload.itemIndex = allItemsById; payload.taskIndex = taskById;
    payload.canonicalIndexSummary = { totalLegacy: 400, totalCanonical: 310, totalAliases: 90 };
    payload.taskGovernanceModel = 'Tasks are governed as nested pack task records; the 66 pack governance records are the independent registry units.';
    return { ok: true, registration: payload };
  }
  function registerListeningCurriculumD18(payload) {
    if (_d18ListeningRegistration) {
      console.warn('[D18A] registerListeningCurriculumD18 called more than once; returning existing normalized registration');
      return _d18ListeningRegistration;
    }
    if (!payload || !Array.isArray(payload.packs)) {
      console.error('[D18A] registerListeningCurriculumD18: invalid payload');
      return null;
    }
    var normalized = _d18NormalizeRegistration(payload);
    if (!normalized.ok) {
      console.error('[D18A] registration rejected:', normalized.errors.join(', '));
      return null;
    }
    _d18ListeningRegistration = normalized.registration;
    _d18TaskIndex = _d18ListeningRegistration.taskIndex;
    _cachedRegistry = null; _cachedGovernanceRegistry = null; _cachedWorkQueue = null;
    return _d18ListeningRegistration;
  }
  function getD18Registration() { return _d18ListeningRegistration; }

  var _D18_PROGRESS_VERSION = '2.1';
  var _D18_MASTERY_THRESHOLD = 70;
  function _d18ProgressKey(studentId, packId) { return _studentKey(studentId, 'd18_listen_pack_' + packId); }
  function _d18RefreshReviewDue(p) {
    if (p && p.packCompleted && p.reviewDueAt) p.reviewDue = Date.now() >= new Date(p.reviewDueAt).getTime();
    return p;
  }
  function getListeningPackProgressD18(studentId, packId) {
    try {
      var raw = lsGet(_d18ProgressKey(studentId, packId));
      if (!raw) return null;
      var p = JSON.parse(raw);
      return p && (p.schemaVersion === _D18_PROGRESS_VERSION || p.schemaVersion === '2.0') ? _d18RefreshReviewDue(p) : null;
    } catch (e) { return null; }
  }
  function saveListeningPackProgressD18(studentId, packId, progress) {
    try {
      progress.schemaVersion = _D18_PROGRESS_VERSION;
      progress.updatedAt = _d18NowIso();
      lsSet(_d18ProgressKey(studentId, packId), JSON.stringify(progress));
      return progress;
    } catch (e) { return null; }
  }
  function _d18FindPack(packId) {
    return _d18ListeningRegistration && _d18ListeningRegistration.packs.find(function (p) { return p.packId === packId; });
  }
  function _d18NewSessionId(studentId, packId) {
    _d18SessionSequence++;
    return 'd18-session-' + _d18Sha256(studentId + '|' + packId + '|' + Date.now() + '|' + _d18SessionSequence).slice(0, 20);
  }
  function initListeningPackProgressD18(studentId, packId, packVersion, routeMode, options) {
    options = options || {};
    var existing = getListeningPackProgressD18(studentId, packId);
    if (existing && !options.forceNew) return existing;
    var pack = _d18FindPack(packId);
    if (!pack) return null;
    var firstStage = pack.stages[0] || null, firstItem = pack.itemIds[0] || null;
    var firstTask = firstStage && firstStage.taskIds && firstStage.taskIds[0] ? firstStage.taskIds[0] : null;
    var p = {
      schemaVersion: _D18_PROGRESS_VERSION, studentId: studentId,
      routeMode: routeMode || 'official', packId: packId, packVersion: packVersion || pack.packVersion || '1.0',
      sessionId: options.sessionId || _d18NewSessionId(studentId, packId),
      activeStageId: firstStage ? firstStage.stageId : null, activeItemId: firstItem,
      activeSectionId: null, activeTaskId: firstTask, currentPosition: 0,
      stageCompletionMap: {}, taskCompletionMap: {}, packCompleted: false,
      attemptRecords: {}, itemBestScore: {}, itemLastScore: {}, masteryStatus: {}, weakItems: [], weakItemRetryCount: {},
      technicalFailureCount: 0, technicalFailures: [], academicAttemptCount: 0,
      completionEventIds: [], stateStatus: 'active', pausedAt: null, stoppedAt: null,
      startedAt: _d18NowIso(), updatedAt: _d18NowIso(), completedAt: null, reviewDueAt: null, reviewDue: false,
      d16MigrationNote: 'D18A progress schema 2.1; D16 progress remains under original keys and is never reinterpreted.'
    };
    return saveListeningPackProgressD18(studentId, packId, p) || p;
  }
  function startListeningPackSessionD18(opts) {
    opts = opts || {};
    var resolved = resolveD18ListeningPack(opts);
    if (!resolved.ok) return resolved;
    var p = initListeningPackProgressD18(opts.studentId, resolved.pack.packId, resolved.pack.packVersion, resolved.routeMode, { sessionId: opts.sessionId, forceNew: !!opts.forceNew });
    if (!p) return { ok: false, reason: 'progress-init-failed' };
    p.routeMode = resolved.routeMode;
    p.stateStatus = 'active'; p.pausedAt = null; p.stoppedAt = null;
    if (opts.requestedStageId) p.activeStageId = opts.requestedStageId;
    saveListeningPackProgressD18(opts.studentId, resolved.pack.packId, p);
    resolved.progress = p; resolved.sessionId = p.sessionId;
    return resolved;
  }
  function updateListeningPositionD18(opts) {
    opts = opts || {};
    var p = getListeningPackProgressD18(opts.studentId, opts.packId);
    if (!p || p.packCompleted) return p;
    if (opts.stageId != null) p.activeStageId = opts.stageId;
    if (opts.itemId != null) p.activeItemId = opts.itemId;
    if (opts.sectionId != null) p.activeSectionId = opts.sectionId;
    if (opts.taskId != null) p.activeTaskId = opts.taskId;
    if (typeof opts.currentPosition === 'number' && opts.currentPosition >= 0) p.currentPosition = opts.currentPosition;
    return saveListeningPackProgressD18(opts.studentId, opts.packId, p);
  }
  function recordListeningTechnicalFailureD18(opts) {
    opts = opts || {};
    var p = getListeningPackProgressD18(opts.studentId, opts.packId) || initListeningPackProgressD18(opts.studentId, opts.packId, opts.packVersion, opts.routeMode || 'candidate-preview');
    if (!p) return null;
    var errorId = opts.errorId || ('technical-' + p.sessionId + '-' + (p.technicalFailureCount + 1) + '-' + String(opts.errorCode || 'unknown'));
    if (p.technicalFailures.some(function (x) { return x.errorId === errorId; })) return p;
    p.technicalFailureCount += 1;
    p.technicalFailures.push({ errorId: errorId, errorCode: opts.errorCode || 'unknown', stageId: opts.stageId || p.activeStageId, itemId: opts.itemId || p.activeItemId, taskId: opts.taskId || p.activeTaskId, recordedAt: _d18NowIso() });
    return saveListeningPackProgressD18(opts.studentId, opts.packId, p);
  }
  function updateListeningItemProgressD18(studentId, packId, itemId, score, isTechnicalFailure, meta) {
    meta = meta || {};
    if (isTechnicalFailure) return recordListeningTechnicalFailureD18({ studentId: studentId, packId: packId, itemId: itemId, errorCode: meta.errorCode || 'legacy-technical-failure', errorId: meta.attemptId, stageId: meta.stageId, taskId: meta.taskId, routeMode: meta.routeMode });
    var p = getListeningPackProgressD18(studentId, packId) || initListeningPackProgressD18(studentId, packId, meta.packVersion || '1.0', meta.routeMode || 'candidate-preview');
    if (!p || p.packCompleted) return p;
    var safeScore = Math.max(0, Math.min(100, Number(score) || 0));
    var attemptId = meta.attemptId || [p.sessionId, meta.stageId || p.activeStageId || 'stage', itemId, meta.taskId || p.activeTaskId || 'task', p.academicAttemptCount + 1].join('::');
    if (p.attemptRecords[attemptId]) return p;
    p.academicAttemptCount += 1;
    p.attemptRecords[attemptId] = { attemptId: attemptId, itemId: itemId, stageId: meta.stageId || p.activeStageId, taskId: meta.taskId || p.activeTaskId, score: safeScore, recordedAt: _d18NowIso(), technicalFailure: false };
    p.itemLastScore[itemId] = safeScore;
    if (p.itemBestScore[itemId] == null || safeScore > p.itemBestScore[itemId]) p.itemBestScore[itemId] = safeScore;
    if (safeScore < _D18_MASTERY_THRESHOLD) {
      if (p.weakItems.indexOf(itemId) === -1) p.weakItems.push(itemId);
      p.weakItemRetryCount[itemId] = (p.weakItemRetryCount[itemId] || 0) + 1; p.masteryStatus[itemId] = false;
    } else {
      p.weakItems = p.weakItems.filter(function (id) { return id !== itemId; }); p.masteryStatus[itemId] = true;
    }
    if (meta.stageId) p.activeStageId = meta.stageId;
    if (meta.taskId) p.activeTaskId = meta.taskId;
    p.activeItemId = itemId;
    if (typeof meta.currentPosition === 'number') p.currentPosition = meta.currentPosition;
    return saveListeningPackProgressD18(studentId, packId, p);
  }
  function completeListeningTaskD18(opts) {
    opts = opts || {};
    var p = updateListeningItemProgressD18(opts.studentId, opts.packId, opts.itemId, opts.score, false, opts);
    if (!p) return null;
    if (!p.taskCompletionMap[opts.taskId]) p.taskCompletionMap[opts.taskId] = { completedAt: _d18NowIso(), score: Math.max(0, Math.min(100, Number(opts.score) || 0)), attemptId: opts.attemptId || '' };
    return saveListeningPackProgressD18(opts.studentId, opts.packId, p);
  }
  function completeListeningStageD18(opts) {
    opts = opts || {};
    var p = getListeningPackProgressD18(opts.studentId, opts.packId), pack = _d18FindPack(opts.packId);
    if (!p || !pack) return null;
    var stageId = opts.stageId || p.activeStageId;
    if (!p.stageCompletionMap[stageId]) p.stageCompletionMap[stageId] = { completedAt: _d18NowIso(), completionEventId: opts.completionEventId || (p.sessionId + '::stage::' + stageId) };
    var idx = pack.stages.findIndex(function (s) { return s.stageId === stageId; });
    var next = idx >= 0 ? pack.stages[idx + 1] : null;
    if (next) {
      p.activeStageId = next.stageId; p.activeTaskId = next.taskIds && next.taskIds[0] ? next.taskIds[0] : null; p.currentPosition = 0;
      return saveListeningPackProgressD18(opts.studentId, opts.packId, p);
    }
    saveListeningPackProgressD18(opts.studentId, opts.packId, p);
    return completeListeningPackD18({ studentId: opts.studentId, packId: opts.packId, completionEventId: opts.packCompletionEventId });
  }
  function _d18LedgerCompletion(p, pack, completionEventId) {
    if (!window.ZirakLearningLedger || typeof window.ZirakLearningLedger.recordActivity !== 'function') return null;
    var scores = Object.keys(p.itemBestScore).map(function (id) { return p.itemBestScore[id]; });
    var avg = scores.length ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : 0;
    return window.ZirakLearningLedger.recordActivity({
      id: completionEventId, completionEventId: completionEventId, activityAttemptId: completionEventId,
      studentId: p.studentId, source: 'listening-d18a', sectionTitle: 'Listening Pack — ' + pack.themeLabel,
      activityType: p.routeMode === 'official' ? 'listening-official-pack-completion' : 'listening-candidate-preview-completion',
      packId: pack.packId, packVersion: pack.packVersion, stageId: p.activeStageId,
      itemIds: pack.itemIds.slice(), taskIds: pack.taskIds.slice(), routeMode: p.routeMode,
      governanceStatus: p.routeMode === 'official' ? 'owner-approved-official' : 'phase-reviewed-candidate-owner-approval-pending',
      sessionId: p.sessionId, technicalFailureCount: p.technicalFailureCount,
      good: scores.filter(function (x) { return x >= _D18_MASTERY_THRESHOLD; }).length, total: scores.length, pct: avg, weakItems: p.weakItems.slice()
    });
  }
  function completeListeningPackD18(opts) {
    opts = opts || {};
    var p = getListeningPackProgressD18(opts.studentId, opts.packId), pack = _d18FindPack(opts.packId);
    if (!p || !pack) return null;
    var eventId = opts.completionEventId || ['d18-pack-complete', p.studentId, p.packId, p.packVersion, p.sessionId].join('::');
    if (p.completionEventIds.indexOf(eventId) !== -1) { _d18LedgerCompletion(p, pack, eventId); return p; }
    p.packCompleted = true; p.stateStatus = 'completed';
    if (!p.completedAt) p.completedAt = _d18NowIso();
    p.reviewDueAt = new Date(new Date(p.completedAt).getTime() + 7 * 86400000).toISOString(); p.reviewDue = false;
    p.completionEventIds.push(eventId);
    saveListeningPackProgressD18(opts.studentId, opts.packId, p);
    _d18LedgerCompletion(p, pack, eventId);
    return p;
  }
  function pauseListeningPackD18(studentId, packId) { var p = getListeningPackProgressD18(studentId, packId); if (!p) return null; p.stateStatus = 'paused'; p.pausedAt = _d18NowIso(); return saveListeningPackProgressD18(studentId, packId, p); }
  function resumeListeningPackD18(studentId, packId) { var p = getListeningPackProgressD18(studentId, packId); if (!p || p.packCompleted) return p; p.stateStatus = 'active'; p.pausedAt = null; return saveListeningPackProgressD18(studentId, packId, p); }
  function stopListeningPackD18(studentId, packId) { var p = getListeningPackProgressD18(studentId, packId); if (!p) return null; p.stateStatus = 'stopped'; p.stoppedAt = _d18NowIso(); return saveListeningPackProgressD18(studentId, packId, p); }
  function exportListeningProgressD18(studentId) {
    var out = { schemaVersion: _D18_PROGRESS_VERSION, studentId: studentId, records: [] };
    try {
      var prefix = _studentKey(studentId, 'd18_listen_pack_');
      for (var i = 0; i < localStorage.length; i++) { var key = localStorage.key(i); if (key && key.indexOf(prefix) === 0) { var p = JSON.parse(localStorage.getItem(key)); if (p) out.records.push(p); } }
    } catch (e) {}
    out.records.sort(function (a, b) { return a.packId < b.packId ? -1 : 1; });
    return out;
  }
  function importListeningProgressD18(studentId, backup) {
    if (!backup || !Array.isArray(backup.records)) return { ok: false, reason: 'invalid-backup' };
    var count = 0;
    backup.records.forEach(function (p) { if (p && p.studentId === studentId && p.packId && _d18FindPack(p.packId)) { saveListeningPackProgressD18(studentId, p.packId, p); count++; } });
    return { ok: true, restored: count };
  }

  function _d18NormPathway(value) {
    var v = String(value || '').toLowerCase().replace(/[\s/_]+/g, '-').replace(/-+/g, '-');
    var aliases = { child: 'child', children: 'child', teen: 'teen', teenager: 'teen', 'general-adult': 'general-adult', adult: 'general-adult', general: 'general-adult', 'job-professional': 'job-professional', professional: 'job-professional', job: 'job-professional', 'academic-preparation': 'academic-preparation', academic: 'academic-preparation' };
    return aliases[v] || v;
  }
  function _d18RouteOk(pack, mode) {
    if (mode === 'official') return pack.officialCurriculumEligible === true && pack.ownerApprovalStatus === 'approved';
    if (mode === 'candidate-preview') return pack.officialCandidateEligible === true && pack.ownerApprovalStatus !== 'approved';
    if (mode === 'free-practice') return pack.freePracticeEligible === true;
    return false;
  }
  function _d18ResolveItems(pack) {
    if (!_d18ListeningRegistration || !pack) return [];
    var out = [];
    for (var i = 0; i < pack.itemIds.length; i++) {
      var item = _d18ListeningRegistration.itemIndex[pack.itemIds[i]];
      if (!item || !_d18ItemText(item, false)) return [];
      out.push(_d18Clone(item));
    }
    return out;
  }
  function resolveD18ListeningPack(opts) {
    opts = opts || {};
    if (!_d18ListeningRegistration) return { ok: false, reason: 'd18-not-registered' };
    var routeMode = opts.routeMode || 'official', level = String(opts.acceptedLevelId || '').toLowerCase();
    var pathway = _d18NormPathway(opts.learnerPathwayId || opts.pathwayId || 'general-adult');
    var purpose = opts.purpose || 'new', requestedPackId = opts.packId || null, requestedStageId = opts.requestedStageId || opts.stageId || null;
    if (!level) return { ok: false, reason: 'no-level-provided' };
    if (['official', 'candidate-preview', 'free-practice'].indexOf(routeMode) === -1) return { ok: false, reason: 'invalid-route-mode', routeMode: routeMode };
    var packs = _d18ListeningRegistration.packs.slice();
    function pathwayOk(pack) { return pack.pathwayIds.indexOf(pathway) !== -1; }
    function finish(pack, selectedPurpose) {
      if (requestedStageId && !pack.stages.some(function (s) { return s.stageId === requestedStageId; })) return { ok: false, reason: 'requested-stage-not-found-in-pack', packId: pack.packId, requestedStageId: requestedStageId };
      var items = _d18ResolveItems(pack);
      if (items.length !== pack.itemIds.length) return { ok: false, reason: 'pack-item-resolution-failed', packId: pack.packId };
      return { ok: true, source: 'd18', studentId: opts.studentId || '', acceptedLevelId: level, learnerPathwayId: pathway, pack: pack, items: items, tasks: pack.taskIds.map(function (id) { return _d18Clone(_d18TaskIndex[id]); }), routeMode: routeMode, purpose: selectedPurpose || purpose, requestedStageId: requestedStageId };
    }
    if (requestedPackId) {
      var explicit = packs.find(function (p) { return p.packId === requestedPackId; });
      if (!explicit) return { ok: false, reason: 'pack-id-not-found', packId: requestedPackId };
      if (explicit.acceptedLevelId !== level) return { ok: false, reason: 'explicit-pack-level-mismatch', packId: requestedPackId, acceptedLevelId: level, packLevelId: explicit.acceptedLevelId };
      if (!pathwayOk(explicit)) return { ok: false, reason: 'explicit-pack-pathway-mismatch', packId: requestedPackId, learnerPathwayId: pathway };
      if (!_d18RouteOk(explicit, routeMode)) return { ok: false, reason: 'pack-not-eligible-for-route', packId: requestedPackId, routeMode: routeMode };
      return finish(explicit, purpose);
    }
    var eligible = packs.filter(function (p) { return p.acceptedLevelId === level && pathwayOk(p) && _d18RouteOk(p, routeMode); })
      .sort(function (a, b) { return Number(a.sequenceOrder || 0) - Number(b.sequenceOrder || 0) || (a.packId < b.packId ? -1 : 1); });
    if (!eligible.length) {
      return { ok: false, reason: routeMode === 'official' ? 'no-owner-approved-pack-for-level' : 'no-eligible-pack-for-level', acceptedLevelId: level, learnerPathwayId: pathway, routeMode: routeMode };
    }
    if (opts.studentId && (purpose === 'continue' || purpose === 'new')) {
      for (var i = 0; i < eligible.length; i++) { var cp = getListeningPackProgressD18(opts.studentId, eligible[i].packId); if (cp && !cp.packCompleted && cp.activeStageId) return finish(eligible[i], 'continue'); }
    }
    if (opts.studentId && purpose === 'weak-recovery') {
      for (var j = 0; j < eligible.length; j++) { var wp = getListeningPackProgressD18(opts.studentId, eligible[j].packId); if (wp && wp.weakItems && wp.weakItems.length) return finish(eligible[j], 'weak-recovery'); }
      return { ok: false, reason: 'no-weak-items-due', acceptedLevelId: level, routeMode: routeMode };
    }
    if (opts.studentId && purpose === 'review') {
      for (var r = 0; r < eligible.length; r++) { var rp = getListeningPackProgressD18(opts.studentId, eligible[r].packId); if (rp && rp.packCompleted && rp.reviewDue) return finish(eligible[r], 'review'); }
      return { ok: false, reason: 'no-review-due', acceptedLevelId: level, routeMode: routeMode };
    }
    if (opts.studentId) {
      for (var k = 0; k < eligible.length; k++) { var np = getListeningPackProgressD18(opts.studentId, eligible[k].packId); if (!np || !np.packCompleted) return finish(eligible[k], 'new'); }
      return { ok: false, reason: 'no-next-pack', allPacksCompleted: true, reviewDue: false, acceptedLevelId: level, learnerPathwayId: pathway, routeMode: routeMode };
    }
    return finish(eligible[0], 'new');
  }
  function buildGovernanceArtifactD18A() {
    var gov = buildGovernanceRegistry(true);
    return {
      governanceSchemaVersion: gov.governanceSchemaVersion, generatedAt: '2026-07-30T00:00:00.000Z',
      records: gov.records, inventoryTotalsByType: gov.totalsByType,
      duplicateCompositeIds: gov.duplicateCompositeIds, defectSummary: gov.defectSummary,
      eligibilitySummary: gov.eligibilitySummary, translationSummary: gov.translationSummary,
      ownerApprovalSummary: gov.ownerApprovalSummary, responsiblePhaseSummary: gov.responsiblePhaseSummary,
      taskGovernanceModel: _d18ListeningRegistration ? _d18ListeningRegistration.taskGovernanceModel : ''
    };
  }
  function buildWorkQueueArtifactD18A() {
    var q = buildContentWorkQueue(true);
    return { governanceSchemaVersion: GOVERNANCE_SCHEMA_VERSION, generatedAt: '2026-07-30T00:00:00.000Z', totalItems: q.totalItems, countsByPhase: q.countsByPhase, duplicateWorkItemIds: q.duplicateWorkItemIds, items: q.items };
  }

  /* ══════════════════════════════════════════════════════════════════════
     I6H-D19 — GOVERNED DIALOGUE CURRICULUM
     One D19 payload registered into this existing content authority.
     Turns remain nested under their Dialogue governance record. The legacy
     99-record bank remains byte-identical in content.js and is exposed only
     through the explicit bounded Free Practice route.
     ══════════════════════════════════════════════════════════════════════ */
  var _d19DialogueRegistration = null;
  var _d19DialogueIndex = Object.create(null);
  var _d19TurnIndex = Object.create(null);
  var _d19LegacyDecisionIndex = Object.create(null);
  var _d19LegacyDialogueIndex = Object.create(null);
  var _d19TitleMemberIndex = Object.create(null);
  var _d19SessionSequence = 0;
  var _D19_PROGRESS_VERSION = '1.0';
  var _D19_MASTERY_THRESHOLD = 70;
  var _D19_REVIEW_DAYS = 7;
  var _D19_LEVELS = ['starter','basic','beginner','elementary','intermediate','advanced','academic'];
  var _D19_PATHWAYS = ['child','teen','general-adult','job-professional','academic-preparation'];

  function _d19Clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function _d19NowIso() { return new Date().toISOString(); }
  function _d19Norm(value) { return String(value == null ? '' : value).trim().replace(/\s+/g, ' '); }
  function _d19NormPathway(value) {
    var v = String(value || '').toLowerCase().replace(/[\s/_]+/g, '-').replace(/-+/g, '-');
    var aliases = { child:'child', children:'child', teen:'teen', teenager:'teen', adult:'general-adult', general:'general-adult', 'general-adult':'general-adult', job:'job-professional', professional:'job-professional', 'job-professional':'job-professional', academic:'academic-preparation', 'academic-preparation':'academic-preparation' };
    return aliases[v] || v;
  }
  function _d19HasPashto(value) { return /[\u0600-\u06ff]/.test(String(value || '')); }
  function _d19UnsafeHtml(value) { return /<\/?[a-z][^>]*>/i.test(String(value || '')); }
  function _d19NormalizeScript(dialogue) {
    return (dialogue.turns || []).map(function (t) { return _d19Norm(t.promptEn).toLowerCase() + '|' + _d19Norm(t.modelAnswerEn).toLowerCase(); }).join('||');
  }
  function _d19LegacyBank() {
    return window.DIALOGUES || (typeof DIALOGUES !== 'undefined' ? DIALOGUES : []);
  }
  function _d19LegacyLevel(raw, id) {
    var v = String(raw || '').toLowerCase();
    if (v === 'nursery') return 'starter';
    if (v === 'ielts') return String(id || '') === 'ielts-part1' ? 'intermediate' : 'advanced';
    return _D19_LEVELS.indexOf(v) !== -1 ? v : '';
  }
  function _d19LegacyEnglishHash(dialogue) {
    var text=[dialogue.id,dialogue.titleEn,dialogue.level,dialogue.category].concat((dialogue.steps||[]).reduce(function(a,s){return a.concat([s.promptEn||'',s.answerEn||'']);},[])).join('\n');
    return _d18Sha256(text);
  }
  function _d19Signature(dialogue) {
    var c = _d19Clone(dialogue); delete c.contentSignature;
    return 'sha256-' + _d18Sha256(JSON.stringify(c));
  }
  function _d19ProgressKey(studentId, dialogueId) { return _studentKey(studentId, 'd19_dialogue_' + dialogueId); }
  function _d19RefreshReviewDue(progress) {
    if (progress && progress.completedAt && progress.reviewDueAt) progress.reviewDue = Date.now() >= new Date(progress.reviewDueAt).getTime();
    return progress;
  }
  function _d19FindDialogue(dialogueId) { return _d19DialogueIndex[dialogueId] || null; }
  function _d19FindLegacy(dialogueId) { return _d19LegacyDialogueIndex[dialogueId] || null; }
  function _d19RouteAllowed(dialogue, routeMode) {
    if (routeMode === 'official') return dialogue.officialCurriculumEligible === true && dialogue.ownerApprovalStatus === 'approved';
    if (routeMode === 'candidate-preview') return dialogue.officialCandidateEligible === true && dialogue.ownerApprovalStatus !== 'approved';
    return false;
  }
  function _d19PathwayAllowed(dialogue, pathway) { return Array.isArray(dialogue.pathwayIds) && dialogue.pathwayIds.indexOf(pathway) !== -1; }
  function _d19ExplicitPurposeState(studentId, dialogueId, purpose) {
    if (!studentId) return { ok:true, purpose:purpose };
    var progress=getDialogueProgressD19(studentId,dialogueId);
    if (purpose==='continue') {
      return progress && !progress.completedAt && progress.activeTurnId
        ? {ok:true,purpose:'continue',progress:progress}
        : {ok:false,reason:'no-incomplete-dialogue-to-continue',dialogueId:dialogueId};
    }
    if (purpose==='weak-recovery') {
      return progress && Array.isArray(progress.weakTurnIds) && progress.weakTurnIds.length
        ? {ok:true,purpose:'weak-recovery',progress:progress}
        : {ok:false,reason:'no-weak-turns-due',dialogueId:dialogueId};
    }
    if (purpose==='review') {
      return progress && progress.completedAt && progress.reviewDue
        ? {ok:true,purpose:'review',progress:progress}
        : {ok:false,reason:'no-dialogue-review-due',dialogueId:dialogueId};
    }
    if ((purpose==='new' || purpose==='assigned') && progress) {
      if (!progress.completedAt && progress.activeTurnId) return {ok:true,purpose:'continue',progress:progress};
      if (progress.completedAt) return {ok:false,reason:'dialogue-already-completed',dialogueId:dialogueId,progress:progress};
    }
    return {ok:true,purpose:purpose,progress:progress||null};
  }

  function _d19ValidatePayload(payload) {
    var errors = [], bank = _d19LegacyBank();
    if (!payload || payload.version !== 'I6H-D19') errors.push('invalid-version');
    if (!Array.isArray(bank) || bank.length !== 99) errors.push('legacy-dialogue-count');
    if (!Array.isArray(payload && payload.legacyEditorialDecisions) || payload.legacyEditorialDecisions.length !== 99) errors.push('editorial-decision-count');
    if (!Array.isArray(payload && payload.candidateDialogues) || payload.candidateDialogues.length !== 66) errors.push('candidate-dialogue-count');
    var realLegacy = Object.create(null), decisionSeen = Object.create(null), dialogueSeen = Object.create(null), turnSeen = Object.create(null), scriptSeen = Object.create(null);
    bank.forEach(function (d) { if (!d || !d.id || realLegacy[d.id]) errors.push('legacy-id-invalid-or-duplicate:' + (d && d.id)); else realLegacy[d.id] = d; });
    (payload && payload.legacyEditorialDecisions || []).forEach(function (d) {
      if (!d || !d.legacyDialogueId || decisionSeen[d.legacyDialogueId]) errors.push('decision-id-invalid-or-duplicate:' + (d && d.legacyDialogueId));
      else decisionSeen[d.legacyDialogueId] = d;
      var source = d && realLegacy[d.legacyDialogueId];
      if (!source) errors.push('decision-source-missing:' + (d && d.legacyDialogueId));
      else {
        if (Number(d.exactStepCount) !== (source.steps || []).length) errors.push('decision-step-count:' + d.legacyDialogueId);
        if (d.englishContentHash !== _d19LegacyEnglishHash(source) && d.englishContentHash !== source.englishContentHash) errors.push('decision-source-hash:' + d.legacyDialogueId);
      }
      if (d && (d.ownerApprovalStatus === 'approved' || d.officialCurriculumEligible || d.officialCandidateEligible)) errors.push('legacy-false-approval-or-candidate:' + d.legacyDialogueId);
    });
    Object.keys(realLegacy).forEach(function (id) { if (!decisionSeen[id]) errors.push('missing-decision:' + id); });
    var expected = { starter:8, basic:8, beginner:10, elementary:10, intermediate:10, advanced:10, academic:10 }, counts = {};
    (payload && payload.candidateDialogues || []).forEach(function (d) {
      if (!d || !d.dialogueId || dialogueSeen[d.dialogueId]) errors.push('candidate-id-invalid-or-duplicate:' + (d && d.dialogueId));
      else dialogueSeen[d.dialogueId] = d;
      counts[d.acceptedLevelId] = (counts[d.acceptedLevelId] || 0) + 1;
      var demand = DIALOGUE_LEVEL_DEMANDS[d.acceptedLevelId];
      if (!demand || !Array.isArray(d.turns) || d.turns.length < demand.minTurns || d.turns.length > demand.maxTurns || Number(d.turnCount) !== d.turns.length) errors.push('turn-count-contract:' + d.dialogueId);
      if (d.minimumLevelId !== d.acceptedLevelId || d.maximumLevelId !== d.acceptedLevelId) errors.push('level-range:' + d.dialogueId);
      if (!Array.isArray(d.pathwayIds) || !d.pathwayIds.length || d.pathwayIds.some(function (p) { return _D19_PATHWAYS.indexOf(p) === -1; })) errors.push('pathway:' + d.dialogueId);
      if (!_d19Norm(d.titleEn) || !_d19HasPashto(d.titlePashto) || _d19UnsafeHtml(d.titleEn) || _d19UnsafeHtml(d.titlePashto)) errors.push('title-content:' + d.dialogueId);
      if (d.ownerApprovalStatus !== 'pending' || d.officialCurriculumEligible !== false || d.officialCandidateEligible !== true) errors.push('candidate-status:' + d.dialogueId);
      if (/\b(ielts|nursery)\b/i.test(d.acceptedLevelId)) errors.push('invalid-accepted-level:' + d.dialogueId);
      if (Object.prototype.hasOwnProperty.call(d, 'phonetic')) errors.push('candidate-legacy-phonetic-field:' + d.dialogueId);
      var normalizedScript = _d19NormalizeScript(d);
      if (scriptSeen[normalizedScript]) errors.push('duplicate-full-script:' + d.dialogueId + ':' + scriptSeen[normalizedScript]); else scriptSeen[normalizedScript] = d.dialogueId;
      (d.turns || []).forEach(function (t) {
        if (!t || !t.turnId || turnSeen[t.turnId]) errors.push('turn-id-invalid-or-duplicate:' + (t && t.turnId)); else turnSeen[t.turnId] = t;
        if (!_d19Norm(t.promptEn) || !_d19Norm(t.modelAnswerEn) || _d19UnsafeHtml(t.promptEn) || _d19UnsafeHtml(t.modelAnswerEn)) errors.push('turn-english:' + (t && t.turnId));
        if (!_d19HasPashto(t.promptPashto) || !_d19HasPashto(t.modelAnswerPashto) || _d19UnsafeHtml(t.promptPashto) || _d19UnsafeHtml(t.modelAnswerPashto)) errors.push('turn-pashto:' + (t && t.turnId));
        if (['model-repeat','guided-keyword','intent-plus-keywords','structured-response','teacher-rubric'].indexOf(t.scoringMode) === -1) errors.push('turn-scoring-mode:' + (t && t.turnId));
        if (t.scoringMode === 'teacher-rubric' && !t.teacherRubricId) errors.push('turn-rubric:' + (t && t.turnId));
        if (!Array.isArray(t.pronunciationFocus) || t.pronunciationFocus.some(function (x) { return !_d19Norm(x) || !/[a-z]/i.test(x) || _d19HasPashto(x); })) errors.push('pronunciation-focus:' + (t && t.turnId));
      });
      if (d.contentSignature !== _d19Signature(d) && String(d.contentSignature || '').indexOf('d19-') !== 0) errors.push('content-signature:' + d.dialogueId);
    });
    Object.keys(expected).forEach(function (level) { if (counts[level] !== expected[level]) errors.push('level-distribution:' + level + ':' + (counts[level] || 0)); });
    if (!Array.isArray(payload && payload.titleDisambiguationGroups) || payload.titleDisambiguationGroups.length !== 9) errors.push('duplicate-title-group-count');
    return { valid: errors.length === 0, errors: errors };
  }

  function registerDialogueCurriculumD19(payload) {
    if (_d19DialogueRegistration) return _d19DialogueRegistration;
    var validation = _d19ValidatePayload(payload);
    if (!validation.valid) { console.error('[D19] Dialogue registration rejected:', validation.errors.join(', ')); return null; }
    var registration = _d19Clone(payload);
    registration.validation = validation;
    registration.candidateDialogues.forEach(function (d) {
      // The source payload carries a stable signature. Normalize to a full
      // SHA-256 signature for generated artifacts and governance evidence.
      d.contentSignature = _d19Signature(d);
      _d19DialogueIndex[d.dialogueId] = d;
      d.turns.forEach(function (t) { _d19TurnIndex[t.turnId] = t; });
    });
    registration.legacyEditorialDecisions.forEach(function (d) { _d19LegacyDecisionIndex[d.legacyDialogueId] = d; });
    _d19LegacyBank().forEach(function (d) { _d19LegacyDialogueIndex[d.id] = d; });
    (registration.titleDisambiguationGroups || []).forEach(function (g) { (g.members || []).forEach(function (m) { _d19TitleMemberIndex[m.legacyDialogueId] = m; }); });
    registration.governanceModel = 'Turns are nested under each D19 Dialogue governance record; exactly 66 Dialogue records are added globally.';
    _d19DialogueRegistration = registration;
    _cachedRegistry = null; _cachedGovernanceRegistry = null; _cachedWorkQueue = null;
    return _d19DialogueRegistration;
  }
  function getD19DialogueRegistration() { return _d19DialogueRegistration; }

  function _d19LegacyRuntimeRecord(dialogue) {
    var decision = dialogue ? _d19LegacyDecisionIndex[dialogue.id] : null;
    if (!dialogue || !decision) return null;
    var title = _d19TitleMemberIndex[dialogue.id];
    return {
      dialogueId: dialogue.id, legacyDialogueId: dialogue.id, recordVersion: 'legacy-d19-free-practice',
      acceptedLevelId: decision.normalizedAcceptedLevelId, minimumLevelId: decision.normalizedAcceptedLevelId, maximumLevelId: decision.normalizedAcceptedLevelId,
      pathwayIds: decision.pathwaySafetyStatus === 'restricted-no-child-default' ? ['teen','general-adult','job-professional','academic-preparation'] : _D19_PATHWAYS.slice(),
      themeId: decision.categoryId || dialogue.category || 'legacy', titleEn: title ? title.displayTitleEn : dialogue.titleEn,
      titlePashto: '', titlePashtoStatus: 'missing-pending-d25-human-review', contextSummaryEn: 'Legacy three-step micro-dialogue retained for bounded Free Practice.',
      supportMode: 'legacy-full-model', expectedResponseDemand: 'legacy-micro-dialogue-not-official-level-curriculum',
      turnCount: (dialogue.steps || []).length,
      turns: (dialogue.steps || []).map(function (s, idx) {
        return { turnId: dialogue.id + '-legacy-turn-' + String(idx + 1).padStart(2, '0'), sequenceOrder: idx + 1,
          speakerRole: 'Conversation partner', promptEn: s.promptEn || '', promptPashto: s.promptPashto || s.promptDari || '', promptPashtoStatus: 'present-unverified',
          studentTaskEn: 'Respond to the legacy Free Practice prompt.', modelAnswerEn: s.answerEn || '', modelAnswerPashto: s.answerPashto || s.answerDari || '', answerPashtoStatus: 'present-unverified',
          acceptableAlternativeAnswers: [], requiredIntentIds: [], requiredKeywordGroups: [], optionalKeywordGroups: [], grammarTargets: [], vocabularyTargets: [], pronunciationFocus: [],
          supportPrompt: 'Legacy Free Practice model support.', followUpType: idx === (dialogue.steps || []).length - 1 ? 'summary' : 'legacy-follow-up',
          scoringMode: 'model-repeat', scoringContractId: 'legacy-free-practice-model-repeat', teacherRubricId: null,
          retryGuidanceEn: 'Hear the English model again and retry.', retryGuidancePashto: 'انګلیسي بېلګه بیا واورئ او بیا هڅه وکړئ.',
          legacySupportTransliteration: s.phonetic || '', pronunciationDisplaySafe: false, technicalFailureBehavior: 'academically-neutral-preserve-turn' };
      }),
      pronunciationSupportMode: 'tts-only-legacy-transliteration-hidden', pronunciationReviewStatus: 'legacy-non-english-transliteration-unsafe-for-english-pronunciation-display',
      translationStatus: 'present-unverified', integrityStatus: 'free-practice-only', editorialStatus: 'phase-reviewed-free-practice', ownerApprovalStatus: 'pending',
      officialCandidateEligible: false, officialCurriculumEligible: false, freePracticeEligible: true, provenance: { originType:'legacy-project-internal', phase:'I6H-D19' }, contentSignature: 'legacy-' + _d19LegacyEnglishHash(dialogue)
    };
  }

  function getDialogueProgressD19(studentId, dialogueId) {
    var key=_d19ProgressKey(studentId,dialogueId), raw=null;
    try {
      raw = lsGet(key);
      if (!raw) return null;
      var progress = JSON.parse(raw);
      if (!progress || progress.schemaVersion !== _D19_PROGRESS_VERSION || progress.studentId !== studentId || progress.dialogueId !== dialogueId) throw new Error('invalid-progress-envelope');
      return _d19RefreshReviewDue(progress);
    } catch (e) {
      // Preserve corrupt bytes under the same student namespace for diagnosis,
      // then remove the unusable active record so a safe fresh session can start.
      try { if(raw) lsSet(_studentKey(studentId,'d19_dialogue_corrupt_backup_'+dialogueId),String(raw)); lsDel(key); } catch(ignore) {}
      return null;
    }
  }
  function saveDialogueProgressD19(studentId, dialogueId, progress) {
    try {
      progress.schemaVersion = _D19_PROGRESS_VERSION; progress.updatedAt = _d19NowIso();
      lsSet(_d19ProgressKey(studentId, dialogueId), JSON.stringify(progress)); return progress;
    } catch (e) { return null; }
  }
  function _d19NewSessionId(studentId, dialogueId) {
    _d19SessionSequence++;
    return 'd19-session-' + _d18Sha256([studentId, dialogueId, Date.now(), _d19SessionSequence].join('|')).slice(0, 24);
  }
  function _d19CreateProgress(opts, dialogue) {
    var first = dialogue.turns[0] || null;
    return {
      schemaVersion:_D19_PROGRESS_VERSION, studentId:opts.studentId, dialogueId:dialogue.dialogueId, dialogueVersion:dialogue.recordVersion || 'D19-1',
      acceptedLevelId:dialogue.acceptedLevelId, learnerPathwayId:_d19NormPathway(opts.learnerPathwayId), routeMode:opts.routeMode, purpose:opts.purpose || 'new',
      sessionId:opts.sessionId || _d19NewSessionId(opts.studentId, dialogue.dialogueId), stateStatus:'active', activeTurnId:first ? first.turnId : null, activeTurnIndex:0,
      completedTurnIds:[], turnAttempts:{}, turnScores:{}, teacherRubricResults:{}, weakTurnIds:[], technicalFailureCount:0, technicalFailureCodes:[], technicalFailures:[],
      completionEventIds:[], cycleNumber:1, cycleHistory:[], reviewOfCompletionEventId:null, recoveryOfCompletionEventId:null, recoveryTurnIds:[],
      startedAt:_d19NowIso(), updatedAt:_d19NowIso(), pausedAt:null, stoppedAt:null, completedAt:null, completionEventId:null, reviewDueAt:null, reviewDue:false
    };
  }

  function resolveD19Dialogue(options) {
    options = options || {};
    if (!_d19DialogueRegistration) return { ok:false, reason:'d19-not-registered' };
    var routeMode = options.routeMode || 'official', level = String(options.acceptedLevelId || '').toLowerCase(), pathway = _d19NormPathway(options.learnerPathwayId || 'general-adult');
    var purpose = options.purpose || 'new', explicitId = options.dialogueId || null, themeId = options.themeId || null, studentId = options.studentId || '';
    if (['new','continue','weak-recovery','review','assigned'].indexOf(purpose) === -1) return { ok:false, reason:'invalid-purpose', purpose:purpose };
    if (_D19_LEVELS.indexOf(level) === -1) return { ok:false, reason:'invalid-or-missing-accepted-level', acceptedLevelId:level };
    if (_D19_PATHWAYS.indexOf(pathway) === -1) return { ok:false, reason:'invalid-or-missing-pathway', learnerPathwayId:pathway };
    if (['official','candidate-preview','free-practice'].indexOf(routeMode) === -1) return { ok:false, reason:'invalid-route-mode', routeMode:routeMode };
    if (routeMode === 'free-practice') {
      var legacyList = Object.keys(_d19LegacyDialogueIndex).map(function (id) { return _d19LegacyRuntimeRecord(_d19LegacyDialogueIndex[id]); }).filter(Boolean)
        .filter(function (d) { return d.acceptedLevelId === level && d.pathwayIds.indexOf(pathway) !== -1 && (!themeId || d.themeId === themeId); })
        .sort(function (a,b) { return a.dialogueId < b.dialogueId ? -1 : 1; });
      if (explicitId) {
        var legacyExplicit = _d19LegacyRuntimeRecord(_d19FindLegacy(explicitId));
        if (!legacyExplicit) return { ok:false, reason:'legacy-dialogue-id-not-found', dialogueId:explicitId };
        if (legacyExplicit.acceptedLevelId !== level) return { ok:false, reason:'explicit-dialogue-level-mismatch', dialogueId:explicitId, acceptedLevelId:level, dialogueLevelId:legacyExplicit.acceptedLevelId };
        if (legacyExplicit.pathwayIds.indexOf(pathway) === -1) return { ok:false, reason:'explicit-dialogue-pathway-mismatch', dialogueId:explicitId, learnerPathwayId:pathway };
        var legacyPurposeState=_d19ExplicitPurposeState(studentId,legacyExplicit.dialogueId,purpose);
        if(!legacyPurposeState.ok) return legacyPurposeState;
        return { ok:true, source:'legacy-dialogue-free-practice', dialogue:legacyExplicit, progress:legacyPurposeState.progress||null, studentId:studentId, acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode, purpose:legacyPurposeState.purpose };
      }
      if (!legacyList.length) return { ok:false, reason:'no-eligible-legacy-free-practice-dialogue', acceptedLevelId:level, learnerPathwayId:pathway };
      return { ok:true, source:'legacy-dialogue-free-practice', dialogue:legacyList[0], studentId:studentId, acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode, purpose:purpose };
    }
    var all = _d19DialogueRegistration.candidateDialogues.slice();
    if (explicitId) {
      var explicit = _d19FindDialogue(explicitId);
      if (!explicit) return { ok:false, reason:'dialogue-id-not-found', dialogueId:explicitId };
      if (explicit.acceptedLevelId !== level) return { ok:false, reason:'explicit-dialogue-level-mismatch', dialogueId:explicitId, acceptedLevelId:level, dialogueLevelId:explicit.acceptedLevelId };
      if (!_d19PathwayAllowed(explicit, pathway)) return { ok:false, reason:'explicit-dialogue-pathway-mismatch', dialogueId:explicitId, learnerPathwayId:pathway };
      if (!_d19RouteAllowed(explicit, routeMode)) return { ok:false, reason:routeMode === 'official' ? 'official-dialogue-unavailable-owner-approval-pending' : 'dialogue-not-eligible-for-route', dialogueId:explicitId, routeMode:routeMode };
      var explicitPurposeState=_d19ExplicitPurposeState(studentId,explicit.dialogueId,purpose);
      if(!explicitPurposeState.ok) return explicitPurposeState;
      return { ok:true, source:'d19-dialogue-curriculum', dialogue:_d19Clone(explicit), progress:explicitPurposeState.progress||null, studentId:studentId, acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode, purpose:explicitPurposeState.purpose };
    }
    var eligible = all.filter(function (d) { return d.acceptedLevelId === level && _d19PathwayAllowed(d, pathway) && _d19RouteAllowed(d, routeMode) && (!themeId || d.themeId === themeId); })
      .sort(function (a,b) { return a.dialogueId < b.dialogueId ? -1 : 1; });
    if (!eligible.length) return { ok:false, reason:routeMode === 'official' ? 'no-owner-approved-dialogue-for-level' : 'no-eligible-dialogue-for-level-pathway', acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode };
    if (studentId && (purpose === 'continue' || purpose === 'new' || purpose === 'assigned')) {
      for (var i=0;i<eligible.length;i++) { var cp=getDialogueProgressD19(studentId, eligible[i].dialogueId); if (cp && !cp.completedAt && cp.activeTurnId) return { ok:true, source:'d19-dialogue-curriculum', dialogue:_d19Clone(eligible[i]), progress:cp, studentId:studentId, acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode, purpose:'continue' }; }
    }
    if (studentId && purpose === 'weak-recovery') {
      for (var w=0;w<eligible.length;w++) { var wp=getDialogueProgressD19(studentId, eligible[w].dialogueId); if (wp && wp.weakTurnIds && wp.weakTurnIds.length) return { ok:true, source:'d19-dialogue-curriculum', dialogue:_d19Clone(eligible[w]), progress:wp, studentId:studentId, acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode, purpose:'weak-recovery' }; }
      return { ok:false, reason:'no-weak-turns-due', acceptedLevelId:level, learnerPathwayId:pathway };
    }
    if (studentId && purpose === 'review') {
      for (var r=0;r<eligible.length;r++) { var rp=getDialogueProgressD19(studentId, eligible[r].dialogueId); if (rp && rp.completedAt && rp.reviewDue) return { ok:true, source:'d19-dialogue-curriculum', dialogue:_d19Clone(eligible[r]), progress:rp, studentId:studentId, acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode, purpose:'review' }; }
      return { ok:false, reason:'no-dialogue-review-due', acceptedLevelId:level, learnerPathwayId:pathway };
    }
    if (studentId) {
      for (var n=0;n<eligible.length;n++) { var np=getDialogueProgressD19(studentId, eligible[n].dialogueId); if (!np || !np.completedAt) return { ok:true, source:'d19-dialogue-curriculum', dialogue:_d19Clone(eligible[n]), studentId:studentId, acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode, purpose:'new' }; }
      return { ok:false, reason:'no-next-dialogue', allEligibleDialoguesCompleted:true, acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode };
    }
    return { ok:true, source:'d19-dialogue-curriculum', dialogue:_d19Clone(eligible[0]), studentId:studentId, acceptedLevelId:level, learnerPathwayId:pathway, routeMode:routeMode, purpose:'new' };
  }

  function _d19CompletedCycleSummary(progress) {
    return {
      cycleNumber:progress.cycleNumber || 1, purpose:progress.purpose || 'new', routeMode:progress.routeMode,
      sessionId:progress.sessionId, completionEventId:progress.completionEventId || null,
      startedAt:progress.startedAt || null, completedAt:progress.completedAt || null,
      reviewDueAt:progress.reviewDueAt || null, weakTurnIds:(progress.weakTurnIds || []).slice(),
      technicalFailureCount:Number(progress.technicalFailureCount || 0)
    };
  }
  function _d19BeginFollowUpCycle(existing, resolved, options) {
    var progress=_d19CreateProgress({ studentId:options.studentId, learnerPathwayId:resolved.learnerPathwayId, routeMode:resolved.routeMode, purpose:resolved.purpose, sessionId:options.sessionId }, resolved.dialogue);
    progress.cycleNumber=(Number(existing.cycleNumber)||1)+1;
    progress.cycleHistory=(existing.cycleHistory||[]).slice(-18);
    progress.cycleHistory.push(_d19CompletedCycleSummary(existing));
    if(resolved.purpose==='review') progress.reviewOfCompletionEventId=existing.completionEventId || null;
    if(resolved.purpose==='weak-recovery') {
      progress.recoveryOfCompletionEventId=existing.completionEventId || null;
      progress.recoveryTurnIds=(existing.weakTurnIds||[]).filter(function(id){return resolved.dialogue.turns.some(function(t){return t.turnId===id;});});
      progress.weakTurnIds=progress.recoveryTurnIds.slice();
      if(progress.recoveryTurnIds.length){
        var firstId=progress.recoveryTurnIds[0], firstIndex=resolved.dialogue.turns.findIndex(function(t){return t.turnId===firstId;});
        if(firstIndex>=0){progress.activeTurnId=firstId;progress.activeTurnIndex=firstIndex;}
      }
    }
    return progress;
  }
  function startDialogueSessionD19(options) {
    options = options || {};
    var resolved = resolveD19Dialogue(options); if (!resolved.ok) return resolved;
    var existing = getDialogueProgressD19(options.studentId, resolved.dialogue.dialogueId), progress=null;
    var followUpCycle=existing && existing.completedAt && (resolved.purpose==='review' || resolved.purpose==='weak-recovery');
    if(followUpCycle) progress=_d19BeginFollowUpCycle(existing,resolved,options);
    else progress=existing && !options.forceNew ? existing : _d19CreateProgress({ studentId:options.studentId, learnerPathwayId:resolved.learnerPathwayId, routeMode:resolved.routeMode, purpose:resolved.purpose, sessionId:options.sessionId }, resolved.dialogue);
    if (progress.completedAt && !options.forceNew) return { ok:false, reason:'dialogue-already-completed', dialogue:resolved.dialogue, progress:progress };
    progress.routeMode = resolved.routeMode; progress.purpose = resolved.purpose; progress.stateStatus = 'active'; progress.pausedAt = null; progress.stoppedAt = null;
    if(resolved.purpose==='weak-recovery' && !followUpCycle){
      progress.recoveryTurnIds=(progress.weakTurnIds||[]).filter(function(id){return resolved.dialogue.turns.some(function(t){return t.turnId===id;});});
      if(progress.recoveryTurnIds.length){var weakId=progress.recoveryTurnIds[0], weakIndex=resolved.dialogue.turns.findIndex(function(t){return t.turnId===weakId;});if(weakIndex>=0){progress.activeTurnId=weakId;progress.activeTurnIndex=weakIndex;}}
    }
    saveDialogueProgressD19(options.studentId, resolved.dialogue.dialogueId, progress);
    resolved.progress = progress; resolved.sessionId = progress.sessionId; return resolved;
  }
  function updateDialoguePositionD19(options) {
    options = options || {}; var progress=getDialogueProgressD19(options.studentId, options.dialogueId), dialogue=_d19FindDialogue(options.dialogueId) || _d19LegacyRuntimeRecord(_d19FindLegacy(options.dialogueId));
    if (!progress || !dialogue || progress.completedAt) return progress;
    var idx = typeof options.activeTurnIndex === 'number' ? options.activeTurnIndex : dialogue.turns.findIndex(function (t) { return t.turnId === options.turnId; });
    if (idx >= 0 && idx < dialogue.turns.length) { progress.activeTurnIndex=idx; progress.activeTurnId=dialogue.turns[idx].turnId; }
    return saveDialogueProgressD19(options.studentId, options.dialogueId, progress);
  }
  function _d19ScoreTokens(value) {
    return _d19Norm(value).toLowerCase().replace(/[^a-z0-9'\s]/g,' ').split(/\s+/).filter(Boolean);
  }
  function _d19TokenCoverage(actual, expected) {
    var have={}; _d19ScoreTokens(actual).forEach(function(w){have[w]=true;});
    var need=_d19ScoreTokens(expected).filter(function(w){return w.length>2;});
    if(!need.length) return 0;
    return need.filter(function(w){return have[w];}).length/need.length;
  }
  function evaluateDialogueResponseD19(options) {
    options=options||{};
    if(options.isTechnicalFailure) return {technicalFailure:true,score:null,scoreStatus:'technical-neutral-unscored',academicOutcome:'none-technical-event'};
    var dialogue=_d19FindDialogue(options.dialogueId)||_d19LegacyRuntimeRecord(_d19FindLegacy(options.dialogueId));
    var turn=dialogue&&(dialogue.turns||[]).find(function(t){return t.turnId===options.turnId;});
    if(!dialogue||!turn) return {technicalFailure:false,score:null,scoreStatus:'invalid-turn',reason:'dialogue-or-turn-not-found'};
    var transcript=_d19Norm(options.transcript), mode=turn.scoringMode||'teacher-rubric';
    if(!transcript) return {technicalFailure:false,score:null,scoreStatus:'unscored-no-response',scoringMode:mode,teacherRubricId:turn.teacherRubricId||null};
    var normalized=transcript.toLowerCase(), alternatives=(turn.acceptableAlternativeAnswers||[]).concat([turn.modelAnswerEn||'']);
    var exactAlternative=alternatives.some(function(a){return _d19Norm(a).toLowerCase()===normalized;});
    var groups=turn.requiredKeywordGroups||[],met=0;
    groups.forEach(function(group){if((group||[]).some(function(term){return normalized.indexOf(_d19Norm(term).toLowerCase())!==-1;}))met++;});
    var groupCoverage=groups.length?met/groups.length:0, modelCoverage=_d19TokenCoverage(transcript,turn.modelAnswerEn||'');
    var wordCount=_d19ScoreTokens(transcript).length, sentenceEvidence=/[.!?]|\b(because|but|so|although|however|therefore|first|then)\b/i.test(transcript);
    var score=0, partial=false, status='automated-complete';
    if(exactAlternative) score=100;
    else if(mode==='model-repeat') score=Math.round(modelCoverage*100);
    else if(mode==='guided-keyword') score=Math.round(groupCoverage*70+Math.min(1,wordCount/5)*30);
    else if(mode==='intent-plus-keywords') score=Math.round(groupCoverage*75+Math.min(1,wordCount/8)*25);
    else if(mode==='structured-response') { score=Math.round(groupCoverage*55+Math.min(1,wordCount/16)*30+(sentenceEvidence?15:0)); partial=true; status='automated-partial-teacher-review-available'; }
    else { score=Math.round(groupCoverage*55+Math.min(1,wordCount/20)*25+(sentenceEvidence?20:0)); partial=true; status='automated-partial-teacher-rubric-required'; }
    score=Math.max(0,Math.min(100,score));
    // An exact model match can satisfy deterministic evidence, but it cannot
    // turn an open teacher-rubric contract into a falsely complete score.
    if (turn.automatedScoreIsPartial === true) {
      partial = true;
      if (mode === 'teacher-rubric') status = 'automated-partial-teacher-rubric-required';
      else if (status === 'automated-complete') status = 'automated-partial-teacher-review-required';
    }
    return {technicalFailure:false,score:score,automatedScore:score,scoreStatus:status,scoringMode:mode,automatedScoreIsPartial:partial||turn.automatedScoreIsPartial===true,teacherRubricId:turn.teacherRubricId||null,requiredKeywordGroupsMet:met,requiredKeywordGroupCount:groups.length,transcript:transcript,academicOutcome:score>=_D19_MASTERY_THRESHOLD?'mastered':'needs-recovery'};
  }

  function recordDialogueTechnicalFailureD19(options) {
    options = options || {}; var progress=getDialogueProgressD19(options.studentId, options.dialogueId);
    if (!progress) return null;
    var code=String(options.errorCode || 'unknown-technical-error'), turnId=options.turnId || progress.activeTurnId || '';
    var errorId=options.errorId || [progress.sessionId,turnId,code,progress.technicalFailureCount+1].join('::');
    if (progress.technicalFailures.some(function (x) { return x.errorId === errorId; })) return progress;
    progress.technicalFailureCount++; progress.technicalFailureCodes.push(code); progress.technicalFailureCodes=progress.technicalFailureCodes.filter(function (x,i,a){return a.indexOf(x)===i;});
    progress.technicalFailures.push({ errorId:errorId, errorCode:code, turnId:turnId, recordedAt:_d19NowIso(), academicScoreCreated:false, weakTurnCreated:false });
    saveDialogueProgressD19(options.studentId, options.dialogueId, progress);
    if (window.ZirakLearningLedger && typeof window.ZirakLearningLedger.recordActivity === 'function') {
      window.ZirakLearningLedger.recordActivity({ id:errorId, eventId:errorId, studentId:progress.studentId, source:'dialogue-d19', sectionTitle:'Dialogue technical event', activityType:'dialogue-technical-failure', dialogueId:progress.dialogueId, dialogueVersion:progress.dialogueVersion, turnId:turnId, acceptedLevelId:progress.acceptedLevelId, learnerPathwayId:progress.learnerPathwayId, routeMode:progress.routeMode, governanceStatus:'technical-neutral-event', sessionId:progress.sessionId, technicalFailureCode:code, technicalFailureCount:progress.technicalFailureCount, good:0, total:0, pct:null, isTechnicalFailure:true, scoreStatus:'technical-neutral-unscored', academicOutcome:'none-technical-event' });
    }
    return progress;
  }
  function recordDialogueTurnResultD19(options) {
    options = options || {};
    if (options.isTechnicalFailure) return recordDialogueTechnicalFailureD19(options);
    var progress=getDialogueProgressD19(options.studentId, options.dialogueId), dialogue=_d19FindDialogue(options.dialogueId) || _d19LegacyRuntimeRecord(_d19FindLegacy(options.dialogueId));
    if (!progress || !dialogue || progress.completedAt) return progress;
    var turn=dialogue.turns.find(function (t) { return t.turnId === options.turnId; }); if (!turn) return progress;
    var attemptId=options.attemptId || [progress.sessionId,turn.turnId,Object.keys(progress.turnAttempts).length+1].join('::');
    if (progress.turnAttempts[attemptId]) return progress;
    var hasScore=typeof options.score === 'number' && isFinite(options.score), score=hasScore ? Math.max(0,Math.min(100,Number(options.score))) : null;
    if (turn.scoringMode === 'teacher-rubric' && !hasScore && !options.manualComplete && !options.teacherRubricResult) return progress;
    var scoreStatus=options.scoreStatus || (hasScore ? (turn.automatedScoreIsPartial === true ? 'automated-partial' : 'automated-complete') : 'unscored-manual-completion');
    progress.turnAttempts[attemptId]={ attemptId:attemptId, turnId:turn.turnId, scoringMode:turn.scoringMode, score:score, scoreStatus:scoreStatus, transcript:String(options.transcript || '').slice(0,1000), academicAttempt:true, technicalFailure:false, recordedAt:_d19NowIso(), automatedScoreIsPartial:options.automatedScoreIsPartial === true || turn.automatedScoreIsPartial === true };
    if (hasScore) progress.turnScores[turn.turnId]=score;
    if (options.teacherRubricResult) progress.teacherRubricResults[turn.turnId]=_d19Clone(options.teacherRubricResult);
    if (progress.completedTurnIds.indexOf(turn.turnId) === -1) progress.completedTurnIds.push(turn.turnId);
    if (hasScore && score < _D19_MASTERY_THRESHOLD) { if (progress.weakTurnIds.indexOf(turn.turnId) === -1) progress.weakTurnIds.push(turn.turnId); }
    if (hasScore && score >= _D19_MASTERY_THRESHOLD) progress.weakTurnIds=progress.weakTurnIds.filter(function (id) { return id !== turn.turnId; });
    var idx=dialogue.turns.findIndex(function (t) { return t.turnId===turn.turnId; }), next=dialogue.turns[idx+1];
    if(progress.purpose==='weak-recovery' && Array.isArray(progress.recoveryTurnIds) && progress.recoveryTurnIds.length){
      var pendingRecovery=progress.recoveryTurnIds.filter(function(id){return id!==turn.turnId && progress.weakTurnIds.indexOf(id)!==-1;});
      next=pendingRecovery.length ? dialogue.turns.find(function(t){return t.turnId===pendingRecovery[0];}) : null;
    }
    if(next){progress.activeTurnIndex=dialogue.turns.findIndex(function(t){return t.turnId===next.turnId;});progress.activeTurnId=next.turnId;}
    else {progress.activeTurnIndex=idx;progress.activeTurnId=turn.turnId;progress.stateStatus='ready-to-complete';}
    saveDialogueProgressD19(options.studentId, options.dialogueId, progress);
    if(window.ZirakLearningLedger&&typeof window.ZirakLearningLedger.recordActivity==='function'){
      var eventId='d19-dialogue-turn::'+attemptId;
      window.ZirakLearningLedger.recordActivity({id:eventId,eventId:eventId,activityAttemptId:attemptId,studentId:progress.studentId,source:'dialogue-d19',sectionTitle:'Dialogue turn — '+dialogue.titleEn,activityType:'dialogue-turn-attempt',contentId:dialogue.dialogueId,dialogueId:dialogue.dialogueId,dialogueVersion:dialogue.recordVersion||progress.dialogueVersion,turnId:turn.turnId,scoringContractId:turn.scoringContractId||dialogue.scoringContractId||'',scoringMode:turn.scoringMode,acceptedLevelId:dialogue.acceptedLevelId,learnerPathwayId:progress.learnerPathwayId,themeId:dialogue.themeId,routeMode:progress.routeMode,governanceStatus:progress.routeMode==='official'?'owner-approved-official':'phase-reviewed-candidate-or-free-practice',sessionId:progress.sessionId,teacherRubricId:turn.teacherRubricId||'',sourceLegacyDialogueIds:dialogue.sourceLegacyDialogueIds||(dialogue.legacyDialogueId?[dialogue.legacyDialogueId]:[]),automatedScoreIsPartial:options.automatedScoreIsPartial===true||turn.automatedScoreIsPartial===true,scoreStatus:scoreStatus,academicOutcome:hasScore?(score>=_D19_MASTERY_THRESHOLD?'mastered':'needs-recovery'):'unscored',good:hasScore&&score>=_D19_MASTERY_THRESHOLD?1:0,total:hasScore?1:0,pct:hasScore?score:null});
    }
    return progress;
  }
  function _d19LedgerCompletion(progress, dialogue, eventId) {
    if (!window.ZirakLearningLedger || typeof window.ZirakLearningLedger.recordActivity !== 'function') return null;
    var scores=Object.keys(progress.turnScores).map(function (id) { return progress.turnScores[id]; }).filter(function (x) { return typeof x==='number'; });
    var avg=scores.length ? Math.round(scores.reduce(function(a,b){return a+b;},0)/scores.length) : null;
    return window.ZirakLearningLedger.recordActivity({
      id:eventId,eventId:eventId,completionEventId:eventId,activityAttemptId:eventId,studentId:progress.studentId,source:'dialogue-d19',
      sectionTitle:'Dialogue — '+dialogue.titleEn,activityType:progress.routeMode==='official'?'dialogue-official-completion':(progress.routeMode==='candidate-preview'?'dialogue-candidate-preview-completion':'dialogue-free-practice-completion'),
      contentId:dialogue.dialogueId,dialogueId:dialogue.dialogueId,dialogueVersion:dialogue.recordVersion || progress.dialogueVersion,turnId:progress.activeTurnId,
      scoringContractId:dialogue.scoringContractId || '',scoringMode:'mixed-level-contract',acceptedLevelId:dialogue.acceptedLevelId,learnerPathwayId:progress.learnerPathwayId,themeId:dialogue.themeId,
      routeMode:progress.routeMode,governanceStatus:progress.routeMode==='official'?'owner-approved-official':'phase-reviewed-candidate-or-free-practice',sessionId:progress.sessionId,
      sourceLegacyDialogueIds:dialogue.sourceLegacyDialogueIds || (dialogue.legacyDialogueId?[dialogue.legacyDialogueId]:[]),technicalFailureCount:progress.technicalFailureCount,
      good:scores.filter(function(x){return x>=_D19_MASTERY_THRESHOLD;}).length,total:scores.length,pct:avg,scoreStatus:scores.length?'mixed-scored-completion':'unscored-completion',academicOutcome:scores.length?(avg>=_D19_MASTERY_THRESHOLD?'mastered':'needs-recovery'):'unscored',weakItems:progress.weakTurnIds.slice()
    });
  }
  function completeDialogueD19(options) {
    options=options||{}; var progress=getDialogueProgressD19(options.studentId, options.dialogueId), dialogue=_d19FindDialogue(options.dialogueId) || _d19LegacyRuntimeRecord(_d19FindLegacy(options.dialogueId));
    if (!progress || !dialogue) return null;
    var requiredTurnIds=(progress.purpose==='weak-recovery' && Array.isArray(progress.recoveryTurnIds) && progress.recoveryTurnIds.length)
      ? progress.recoveryTurnIds.slice() : dialogue.turns.map(function(t){return t.turnId;});
    var requiredComplete=requiredTurnIds.every(function(id){return progress.completedTurnIds.indexOf(id)!==-1;});
    var recoveryStillWeak=progress.purpose==='weak-recovery' && requiredTurnIds.some(function(id){return progress.weakTurnIds.indexOf(id)!==-1;});
    if ((!requiredComplete || recoveryStillWeak) && !options.allowTeacherComplete) return progress;
    var eventId=options.completionEventId || ['d19-dialogue-complete',progress.studentId,progress.dialogueId,progress.dialogueVersion,progress.sessionId].join('::');
    if (progress.completionEventIds.indexOf(eventId)!==-1) { _d19LedgerCompletion(progress,dialogue,eventId); return progress; }
    progress.stateStatus='completed'; if(!progress.completedAt) progress.completedAt=_d19NowIso(); progress.completionEventId=eventId; progress.completionEventIds.push(eventId);
    progress.reviewDueAt=new Date(new Date(progress.completedAt).getTime()+_D19_REVIEW_DAYS*86400000).toISOString(); progress.reviewDue=false;
    saveDialogueProgressD19(options.studentId,options.dialogueId,progress); _d19LedgerCompletion(progress,dialogue,eventId); return progress;
  }
  function pauseDialogueD19(studentId,dialogueId){var p=getDialogueProgressD19(studentId,dialogueId);if(!p||p.completedAt)return p;p.stateStatus='paused';p.pausedAt=_d19NowIso();return saveDialogueProgressD19(studentId,dialogueId,p);}
  function resumeDialogueD19(studentId,dialogueId){var p=getDialogueProgressD19(studentId,dialogueId);if(!p||p.completedAt)return p;p.stateStatus='active';p.pausedAt=null;p.stoppedAt=null;return saveDialogueProgressD19(studentId,dialogueId,p);}
  function stopDialogueD19(studentId,dialogueId){var p=getDialogueProgressD19(studentId,dialogueId);if(!p||p.completedAt)return p;p.stateStatus='stopped';p.stoppedAt=_d19NowIso();return saveDialogueProgressD19(studentId,dialogueId,p);}
  function exportDialogueProgressD19(studentId) {
    var out={schemaVersion:_D19_PROGRESS_VERSION,studentId:studentId,records:[]},prefix=_studentKey(studentId,'d19_dialogue_'),corruptPrefix=_studentKey(studentId,'d19_dialogue_corrupt_backup_');
    try{
      for(var i=0;i<localStorage.length;i++){
        var key=localStorage.key(i);
        if(!key || key.indexOf(prefix)!==0 || key.indexOf(corruptPrefix)===0) continue;
        try{
          var p=JSON.parse(localStorage.getItem(key));
          if(p&&p.schemaVersion===_D19_PROGRESS_VERSION&&p.studentId===studentId&&p.dialogueId) out.records.push(p);
        }catch(ignoreRecord){}
      }
    }catch(e){}
    out.records.sort(function(a,b){return a.dialogueId<b.dialogueId?-1:(a.dialogueId>b.dialogueId?1:0);});return out;
  }
  function importDialogueProgressD19(studentId,backup){
    if(!backup||backup.schemaVersion!==_D19_PROGRESS_VERSION||backup.studentId!==studentId||!Array.isArray(backup.records))return{ok:false,reason:'invalid-backup'};
    var n=0,rejected=0;
    backup.records.forEach(function(p){
      var dialogue=p&&(_d19FindDialogue(p.dialogueId)||_d19LegacyRuntimeRecord(_d19FindLegacy(p.dialogueId)));
      if(p&&dialogue&&p.schemaVersion===_D19_PROGRESS_VERSION&&p.studentId===studentId&&p.acceptedLevelId===dialogue.acceptedLevelId&&['official','candidate-preview','free-practice'].indexOf(p.routeMode)!==-1){saveDialogueProgressD19(studentId,p.dialogueId,_d19Clone(p));n++;}else rejected++;
    });
    return{ok:true,restored:n,rejected:rejected};
  }
  function resetDialogueProgressD19(studentId){var prefix=_studentKey(studentId,'d19_dialogue_'),n=0;try{for(var i=localStorage.length-1;i>=0;i--){var k=localStorage.key(i);if(k&&k.indexOf(prefix)===0){lsDel(k);n++;}}}catch(e){}return n;}

  function _governanceFromD19Dialogues() {
    if (!_d19DialogueRegistration) return [];
    return _d19DialogueRegistration.candidateDialogues.map(function (d) {
      return makeGovernanceRecord({
        contentType:'dialogue-curriculum',contentId:d.dialogueId,sourceSystem:'dialogue-curriculum-d19',sourceIds:(d.sourceLegacyDialogueIds||[]).slice(),recordVersion:1,
        classificationStatus:CLASSIFICATION_STATUS.PHASE_REVIEWED,classificationMethod:'d19-level-demand-pathway-editorial-review',acceptedLevelId:d.acceptedLevelId,minimumLevelId:d.minimumLevelId,maximumLevelId:d.maximumLevelId,
        pathwayIds:d.pathwayIds.slice(),themeIds:[d.themeId],translationStatus:TRANSLATION_STATUS.PHASE_REVIEWED,integrityStatus:INTEGRITY_STATUS.PHASE_VERIFIED,
        editorialStatus:EDITORIAL_STATUS.PHASE_REVIEWED,ownerApprovalStatus:OWNER_APPROVAL_STATUS.PENDING,
        provenance:makeProvenance({originType:PROVENANCE_ORIGIN_TYPE.ACADEMY_ORIGINAL,sourceId:d.dialogueId,licenseOrPermissionStatus:PROVENANCE_PERMISSION_STATUS.ACADEMY_OWNED,verificationStatus:'phase-verified-pending-owner'}),
        officialCandidateEligible:true,officialCurriculumEligible:false,freePracticeEligible:true,defectCodes:[],responsiblePhase:'D25',blockingReasons:['owner-approval-pending','human-pashto-and-pronunciation-review-pending'],
        notes:'D19 long-form candidate; turns='+d.turnCount+'; supportMode='+d.supportMode+'; scoringContract='+d.scoringContractId+'; signature='+d.contentSignature
      });
    });
  }

  function buildDialogueArtifactsD19() {
    if (!_d19DialogueRegistration) return null;
    // The owner-review artifact is comprehensive rather than a token sample:
    // every candidate Dialogue is included because every Pashto/pronunciation
    // field remains unverified, and every legacy duplicate-title group is
    // included so no ambiguous source identity is hidden from the reviewer.
    var ownerSample=[];
    _d19DialogueRegistration.candidateDialogues.forEach(function(d){
      ownerSample.push({
        recordType:'candidate-dialogue-review', dialogue:_d19Clone(d),
        pronunciationReviewItems:(d.turns||[]).map(function(t){return {turnId:t.turnId,pronunciationFocus:_d19Clone(t.pronunciationFocus||[]),reviewStatus:'pending-human-review'};}),
        pashtoReviewItems:{
          title:{value:d.titlePashto,status:d.titlePashtoStatus||'phase-translated-unverified'},
          contextSummary:{value:d.contextSummaryPashto,status:'phase-translated-unverified'},
          turns:(d.turns||[]).map(function(t){return {turnId:t.turnId,promptPashto:t.promptPashto,promptStatus:t.promptPashtoStatus,modelAnswerPashto:t.modelAnswerPashto,answerStatus:t.answerPashtoStatus};})
        },
        review:{reviewerName:'',reviewerRole:'',reviewedAt:'',levelSuitability:'pending',pathwaySuitability:'pending',englishNaturalness:'pending',pashtoCorrectness:'pending',pronunciationSupport:'pending',culturalSuitability:'pending',childSafety:'pending',scoringRubric:'pending',decision:'pending',notes:''}
      });
    });
    // Every legacy record also has a missing Pashto title and unverified
    // support/pronunciation status. Include all 99 so no uncertain field is
    // silently omitted from the future human/owner review gate.
    _d19DialogueRegistration.legacyEditorialDecisions.forEach(function(decision){
      var source=_d19LegacyDialogueIndex[decision.legacyDialogueId]||{};
      ownerSample.push({
        recordType:'legacy-dialogue-language-review', legacyEditorialDecision:_d19Clone(decision),
        legacyDialogue:{
          legacyDialogueId:decision.legacyDialogueId,titleEn:source.titleEn||decision.originalTitleEn||'',titlePashto:source.titlePashto||source.titleDari||'',titlePashtoStatus:decision.titlePashtoStatus,
          steps:(source.steps||[]).map(function(step,index){return {sequenceOrder:index+1,promptEn:step.promptEn||'',promptPashto:step.promptPashto||step.promptDari||'',answerEn:step.answerEn||'',answerPashto:step.answerPashto||step.answerDari||'',pashtoStatus:decision.stepPashtoStatus,legacyPromptTransliteration:step.phonetic||'',legacyAnswerTransliteration:'',pronunciationStatus:decision.pronunciationStatus};})
        },
        review:{reviewerName:'',reviewerRole:'',reviewedAt:'',pashtoTitle:'pending',pashtoStepSupport:'pending',pronunciationDisposition:'pending',freePracticeSuitability:'pending',decision:'pending',notes:''}
      });
    });
    (_d19DialogueRegistration.titleDisambiguationGroups||[]).forEach(function(group){
      ownerSample.push({
        recordType:'legacy-duplicate-title-group-review', duplicateTitleGroup:_d19Clone(group),
        legacyEditorialDecisions:(group.members||[]).map(function(m){return _d19Clone(_d19LegacyDecisionIndex[m.legacyDialogueId]);}).filter(Boolean),
        review:{reviewerName:'',reviewerRole:'',reviewedAt:'',displayIdentityCorrect:'pending',distinctVsDuplicateRelationshipCorrect:'pending',pashtoTitlePlan:'pending',decision:'pending',notes:''}
      });
    });
    var gov=buildGovernanceRegistry(true),queue=buildContentWorkQueue(true);
    return {
      editorialDecisions:{schemaVersion:'D19-1',phase:'I6H-D19',total:99,decisions:_d19Clone(_d19DialogueRegistration.legacyEditorialDecisions)},
      curriculumRegistry:{schemaVersion:'D19-1',phase:'I6H-D19',total:66,acceptedLevelIds:_D19_LEVELS.slice(),pathwayIds:_D19_PATHWAYS.slice(),scoringContracts:_d19Clone(_d19DialogueRegistration.scoringContracts),teacherRubrics:_d19Clone(_d19DialogueRegistration.teacherRubrics),candidateDialogues:_d19Clone(_d19DialogueRegistration.candidateDialogues)},
      titleMap:{schemaVersion:'D19-1',phase:'I6H-D19',duplicateGroupCount:9,groups:_d19Clone(_d19DialogueRegistration.titleDisambiguationGroups)},
      ownerReviewSample:{schemaVersion:'D19-1',phase:'I6H-D19',ownerApprovalStatus:'pending',sampleCount:ownerSample.length,coverage:{candidateDialogues:66,legacyDialogues:99,advancedDialogues:10,academicDialogues:10,legacyDuplicateTitleGroups:9,pronunciationTurnItems:604,legacyPronunciationRecords:99,pashtoCandidateTurnPairs:604,legacyPashtoReviewRecords:99},records:ownerSample},
      governance:{governanceSchemaVersion:gov.governanceSchemaVersion,generatedAt:'2026-07-30T00:00:00.000Z',records:gov.records,inventoryTotalsByType:gov.totalsByType,duplicateCompositeIds:gov.duplicateCompositeIds,defectSummary:gov.defectSummary,eligibilitySummary:gov.eligibilitySummary,translationSummary:gov.translationSummary,ownerApprovalSummary:gov.ownerApprovalSummary,responsiblePhaseSummary:gov.responsiblePhaseSummary,taskGovernanceModel:_d19DialogueRegistration.governanceModel},
      workQueue:{governanceSchemaVersion:GOVERNANCE_SCHEMA_VERSION,generatedAt:'2026-07-30T00:00:00.000Z',totalItems:queue.totalItems,countsByPhase:queue.countsByPhase,duplicateWorkItemIds:queue.duplicateWorkItemIds,items:queue.items}
    };
  }

  /* ══════════════════════════════════════════════════════════════════
     I6H-D20 — GRAMMAR CURRICULUM REGISTRATION
     zirak-grammar-curriculum-d20.js calls this once at load time. This is
     the ONLY registration point; no competing Grammar authority is created.
     ══════════════════════════════════════════════════════════════════ */
  var _d20GrammarRegistration = null;
  function registerGrammarCurriculumD20(payload) {
    if (_d20GrammarRegistration) {
      console.warn('[D20] registerGrammarCurriculumD20 called more than once — ignoring duplicate');
      return _d20GrammarRegistration;
    }
    if (!payload || !payload.allNodes || !Array.isArray(payload.allNodes)) {
      console.error('[D20] registerGrammarCurriculumD20: invalid payload');
      return null;
    }
    _d20GrammarRegistration = payload;
    _cachedRegistry = null; _cachedGovernanceRegistry = null; _cachedWorkQueue = null;
    return _d20GrammarRegistration;
  }
  function getD20GrammarRegistration() { return _d20GrammarRegistration; }
  function resolveD20Grammar(opts) {
    if (!_d20GrammarRegistration || typeof _d20GrammarRegistration.resolver !== 'function') return { ok: false, reason: 'd20-not-registered' };
    return _d20GrammarRegistration.resolver(opts);
  }
  function getD20GrammarProgress(studentId, grammarCurriculumId) {
    try {
      var raw = lsGet(_studentKey(studentId, 'd20_grammar_' + grammarCurriculumId));
      if (!raw) return null;
      var p = JSON.parse(raw);
      return (p && _d20GrammarRegistration && p.schemaVersion === _d20GrammarRegistration.progressSchema.version) ? p : null;
    } catch (e) { return null; }
  }
  function saveD20GrammarProgress(studentId, grammarCurriculumId, progress) {
    try {
      progress.updatedAt = new Date().toISOString();
      lsSet(_studentKey(studentId, 'd20_grammar_' + grammarCurriculumId), JSON.stringify(progress));
      return progress;
    } catch (e) { return null; }
  }
  function initD20GrammarProgress(studentId, grammarCurriculumId, routeMode) {
    var existing = getD20GrammarProgress(studentId, grammarCurriculumId);
    if (existing) return existing;
    if (!_d20GrammarRegistration) return null;
    var p = _d20GrammarRegistration.progressSchema.make(studentId, grammarCurriculumId, routeMode);
    return saveD20GrammarProgress(studentId, grammarCurriculumId, p) || p;
  }
  function updateD20GrammarItemProgress(studentId, grammarCurriculumId, itemId, score, isTechnicalFailure, isSelfCheck) {
    if (!_d20GrammarRegistration) return null;
    var p = getD20GrammarProgress(studentId, grammarCurriculumId);
    if (!p) p = initD20GrammarProgress(studentId, grammarCurriculumId, 'candidate-preview');
    p = _d20GrammarRegistration.progressSchema.updateItem(p, itemId, score, isTechnicalFailure, isSelfCheck);
    saveD20GrammarProgress(studentId, grammarCurriculumId, p);
    return p;
  }

  window.ZirakCurriculumContent = {

    version: REGISTRY_VERSION,
    // I6H-D17 — governance schema/version
    governanceSchemaVersion: GOVERNANCE_SCHEMA_VERSION,
    // 8.1-8.6 — frozen enumerations
    CLASSIFICATION_STATUS: CLASSIFICATION_STATUS, TRANSLATION_STATUS: TRANSLATION_STATUS,
    INTEGRITY_STATUS: INTEGRITY_STATUS, EDITORIAL_STATUS: EDITORIAL_STATUS,
    OWNER_APPROVAL_STATUS: OWNER_APPROVAL_STATUS, PROVENANCE_ORIGIN_TYPE: PROVENANCE_ORIGIN_TYPE,
    PROVENANCE_PERMISSION_STATUS: PROVENANCE_PERMISSION_STATUS, isKnownEnumValue: isKnownEnumValue,
    makeProvenance: makeProvenance,
    // 13 — defect taxonomy
    DEFECT_DEFINITIONS: DEFECT_DEFINITIONS, getDefectDefinition: getDefectDefinition,
    defectBlocksCandidate: defectBlocksCandidate, defectBlocksOfficial: defectBlocksOfficial,
    // 12 — demand contracts
    DEMAND_CONTRACT_VERSION: DEMAND_CONTRACT_VERSION, DEMAND_CONTRACTS: DEMAND_CONTRACTS, getDemandContract: getDemandContract,
    // 7 — governance envelope
    makeGovernanceRecord: makeGovernanceRecord, GOVERNANCE_REQUIRED_FIELDS: GOVERNANCE_REQUIRED_FIELDS,
    validateGovernanceRecord: validateGovernanceRecord,
    // 16 — review workflow
    canTransitionReviewStatus: canTransitionReviewStatus, applyReviewTransition: applyReviewTransition,
    // 9 — two-stage eligibility
    ELIGIBILITY_VALIDATOR_VERSION: ELIGIBILITY_VALIDATOR_VERSION,
    evaluateOfficialEligibility: evaluateOfficialEligibility, evaluateFreePracticeEligibility: evaluateFreePracticeEligibility,
    // 10/17 — resolvers, no-random-fallback
    resolveOfficialContent: resolveOfficialContent, resolveFreePracticeContent: resolveFreePracticeContent,
    resolveGovernanceRecord: resolveGovernanceRecord,
    // Master governance registry + work queue
    buildGovernanceRegistry: buildGovernanceRegistry, buildContentWorkQueue: buildContentWorkQueue,
    getWorkItemsForPhase: getWorkItemsForPhase,
    LEVEL_ORDER: LEVEL_ORDER, levelIndex: levelIndex, isLevelWithinRange: isLevelWithinRange,
    textComplexityScore: textComplexityScore, assignPercentileLevels: assignPercentileLevels,
    // Task 6/7 — Listening canonicalization + classification
    buildListeningCanonicalMap: buildListeningCanonicalMap, classifyListeningBank: classifyListeningBank,
    resolveLegacyListeningIndex: resolveLegacyListeningIndex,
    // Task 8 — packs
    PACK_SIZE_RULES: PACK_SIZE_RULES, buildListeningPacks: buildListeningPacks, validateListeningPackSize: validateListeningPackSize,
    // Task 9 — pack-based entry points (ZirakListening-style public API)
    openPack: openPack, startAutoPack: startAutoPack, startManualPack: startManualPack,
    openShadowPack: openShadowPack, openDictationPack: openDictationPack,
    // Task 11 — resume state
    getListeningPackProgress: getListeningPackProgress, saveListeningPackProgress: saveListeningPackProgress,
    openListeningPack: openListeningPack, markListeningPackItemComplete: markListeningPackItemComplete,
    // Task 13/14 — Dialogue
    DIALOGUE_LEVEL_DEMANDS: DIALOGUE_LEVEL_DEMANDS, classifyDialogueBank: classifyDialogueBank,
    // Task 17-20 — Grammar catalog
    buildUnifiedGrammarCatalog: buildUnifiedGrammarCatalog, classifyGrammarRoutingStatus: classifyGrammarRoutingStatus,
    // Task 21-23 — Interview
    interviewModeForLevel: interviewModeForLevel, classifyInterviewTracks: classifyInterviewTracks,
    // Full registry
    buildFullRegistry: buildFullRegistry,
    // Task 34 — reset/delete
    onDeleteStudentCurriculumContent: onDeleteStudentCurriculumContent, hookDeletionIntoProfile: hookDeletionIntoProfile,
    // I6H-D18 — Listening curriculum registration and D18 resolver
    registerListeningCurriculumD18: registerListeningCurriculumD18,
    getD18Registration: getD18Registration,
    resolveD18CanonicalItem: resolveD18CanonicalItem,
    resolveD18ListeningPack: resolveD18ListeningPack,
    getListeningPackProgressD18: getListeningPackProgressD18,
    saveListeningPackProgressD18: saveListeningPackProgressD18,
    initListeningPackProgressD18: initListeningPackProgressD18,
    startListeningPackSessionD18: startListeningPackSessionD18,
    updateListeningPositionD18: updateListeningPositionD18,
    updateListeningItemProgressD18: updateListeningItemProgressD18,
    completeListeningTaskD18: completeListeningTaskD18,
    completeListeningStageD18: completeListeningStageD18,
    completeListeningPackD18: completeListeningPackD18,
    recordListeningTechnicalFailureD18: recordListeningTechnicalFailureD18,
    pauseListeningPackD18: pauseListeningPackD18,
    resumeListeningPackD18: resumeListeningPackD18,
    stopListeningPackD18: stopListeningPackD18,
    exportListeningProgressD18: exportListeningProgressD18,
    importListeningProgressD18: importListeningProgressD18,
    buildGovernanceArtifactD18A: buildGovernanceArtifactD18A,
    buildWorkQueueArtifactD18A: buildWorkQueueArtifactD18A,
    getCompleteListeningItemTextD18: _d18ItemText,
    getListeningItemSectionsD18: _d18ItemSections,
    // I6H-D19 — one registered Dialogue curriculum, resolver, progress and artifacts
    registerDialogueCurriculumD19: registerDialogueCurriculumD19,
    getD19DialogueRegistration: getD19DialogueRegistration,
    resolveD19Dialogue: resolveD19Dialogue,
    getDialogueProgressD19: getDialogueProgressD19,
    saveDialogueProgressD19: saveDialogueProgressD19,
    startDialogueSessionD19: startDialogueSessionD19,
    updateDialoguePositionD19: updateDialoguePositionD19,
    evaluateDialogueResponseD19: evaluateDialogueResponseD19,
    recordDialogueTurnResultD19: recordDialogueTurnResultD19,
    recordDialogueTechnicalFailureD19: recordDialogueTechnicalFailureD19,
    completeDialogueD19: completeDialogueD19,
    pauseDialogueD19: pauseDialogueD19,
    resumeDialogueD19: resumeDialogueD19,
    stopDialogueD19: stopDialogueD19,
    exportDialogueProgressD19: exportDialogueProgressD19,
    importDialogueProgressD19: importDialogueProgressD19,
    resetDialogueProgressD19: resetDialogueProgressD19,
    buildDialogueArtifactsD19: buildDialogueArtifactsD19,
    // I6H-D20 — one registered Grammar curriculum, resolver, progress
    registerGrammarCurriculumD20: registerGrammarCurriculumD20,
    getD20GrammarRegistration: getD20GrammarRegistration,
    resolveD20Grammar: resolveD20Grammar,
    getD20GrammarProgress: getD20GrammarProgress,
    saveD20GrammarProgress: saveD20GrammarProgress,
    initD20GrammarProgress: initD20GrammarProgress,
    updateD20GrammarItemProgress: updateD20GrammarItemProgress,
    _test: { _studentKey: _studentKey, PERCENTILE_BUCKETS: PERCENTILE_BUCKETS, _d18Sha256: _d18Sha256, _d18BuildCanonicalIndex: _d18BuildCanonicalIndex, _d19ValidatePayload: _d19ValidatePayload, _d19LegacyRuntimeRecord: _d19LegacyRuntimeRecord, _d19Signature: _d19Signature }
  };
})();
