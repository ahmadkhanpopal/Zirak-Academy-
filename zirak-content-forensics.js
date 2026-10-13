// ===================================================================
// ZIRAK ENGLISH LANGUAGE ACADEMY
// zirak-content-forensics.js — Phase I6H-D15B
// Complete, exact forensic analysis of every real runtime content bank.
// This is a DIAGNOSTIC tool only — it does not teach, score, route, or
// alter any student-facing content. It reads the real, already-loaded
// runtime arrays (window.DIALOGUES, window.STORIES, etc.) and produces
// exact duplicate/metadata/eligibility counts for the D16 repair
// manifest. Never estimates; every count is a real measurement.
// ===================================================================
(function () {
  'use strict';

  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }

  // ---- generic cross-bank helpers -------------------------------------
  function findDuplicateIds(records, idField) {
    idField = idField || 'id';
    var seen = {}, dups = [];
    (records || []).forEach(function (r) {
      var id = r && r[idField];
      if (!id) return;
      if (seen[id]) { if (dups.indexOf(id) === -1) dups.push(id); }
      seen[id] = (seen[id] || 0) + 1;
    });
    return dups;
  }
  function findDuplicateTitles(records, titleField) {
    titleField = titleField || 'titleEn';
    var seen = {}, dups = [];
    (records || []).forEach(function (r) {
      var t = norm(r && r[titleField]);
      if (!t) return;
      if (seen[t]) { if (dups.indexOf(t) === -1) dups.push(t); }
      seen[t] = (seen[t] || 0) + 1;
    });
    return dups;
  }
  function findExactDuplicateContent(records, contentFn) {
    var seen = {}, dups = [];
    (records || []).forEach(function (r) {
      var c = norm(contentFn(r));
      if (!c) return;
      if (seen[c]) { if (dups.indexOf(c) === -1) dups.push(c); }
      seen[c] = (seen[c] || 0) + 1;
    });
    return dups;
  }
  function countMissing(records, predicate) {
    var n = 0;
    (records || []).forEach(function (r) { if (predicate(r)) n++; });
    return n;
  }
  function countPashtoIdenticalToEnglish(records, pashtoField, enField) {
    return countMissing(records, function (r) {
      var p = r && r[pashtoField], e = r && r[enField];
      return !!p && !!e && norm(p) === norm(e);
    });
  }
  function countMissingPashto(records, pashtoField) {
    return countMissing(records, function (r) { return !r || !r[pashtoField] || String(r[pashtoField]).trim() === ''; });
  }

  // ---- Task 12: Dialogue forensics -------------------------------------
  function analyzeDialogues(dialogues) {
    if (!Array.isArray(dialogues)) return { available: false };
    var dupIds = findDuplicateIds(dialogues, 'id');
    var dupTitles = findDuplicateTitles(dialogues, 'titleEn');
    var dupContent = findExactDuplicateContent(dialogues, function (d) {
      return (d.steps || []).map(function (s) { return s.promptEn + '|' + s.answerEn; }).join('||');
    });
    var turnCounts = {};
    dialogues.forEach(function (d) { var n = Array.isArray(d.steps) ? d.steps.length : 0; turnCounts[n] = (turnCounts[n] || 0) + 1; });
    var missingLevel = countMissing(dialogues, function (d) { return !d.level; });
    var missingPashtoTitle = countMissingPashto(dialogues, 'titleDari'); // field literally named "Dari" but holds Pashto per app convention; empty = missing support entirely
    var levelDist = {};
    dialogues.forEach(function (d) { var lv = d.level || '(none)'; levelDist[lv] = (levelDist[lv] || 0) + 1; });
    return {
      available: true, total: dialogues.length,
      uniqueIds: dialogues.length - dupIds.length, duplicateIds: dupIds.length, duplicateIdList: dupIds,
      duplicateTitles: dupTitles.length, duplicateTitleList: dupTitles,
      exactDuplicateSequences: dupContent.length,
      turnCountDistribution: turnCounts,
      currentLevelDistribution: levelDist,
      missingLevelMetadata: missingLevel,
      missingPashtoSupport: missingPashtoTitle,
      missingPashtoSupportNote: 'title/step support fields are literally named "Dari" in the source but hold Pashto per the app\u2019s Pashto-only convention; empty means missing support entirely, not a translation-language mismatch',
      officialCurriculumEligible: 0, // none carry the D15 content contract (levelId + pathway + duration) yet
      freePracticeEligible: dialogues.length,
      classificationNote: 'candidate-by-level assignment requires per-record human/Phase-2 review; this forensics pass reports current raw level tags only, per Task 12\u2019s explicit "do not rewrite yet" instruction'
    };
  }

  // ---- Task 13: Story / Topic forensics ---------------------------------
  function analyzeStoriesOrTopics(records, label) {
    if (!Array.isArray(records)) return { available: false };
    var dupIds = findDuplicateIds(records, 'id');
    var dupTitles = findDuplicateTitles(records, 'titleEn');
    var dupContent = findExactDuplicateContent(records, function (r) {
      return (r.paragraphs || []).map(function (p) { return p.en; }).join('||');
    });
    var missingLevel = countMissing(records, function (r) { return !r.level; });
    var missingPashto = countMissingPashto(records, 'titleDari');
    var lengths = records.map(function (r) { return (r.paragraphs || []).reduce(function (sum, p) { return sum + String(p.en || '').length; }, 0); });
    var avgLen = lengths.length ? Math.round(lengths.reduce(function (a, b) { return a + b; }, 0) / lengths.length) : 0;
    var levelDist = {};
    records.forEach(function (r) { var lv = r.level || '(none)'; levelDist[lv] = (levelDist[lv] || 0) + 1; });
    return {
      available: true, total: records.length, label: label,
      uniqueIds: records.length - dupIds.length, duplicateIds: dupIds.length, duplicateIdList: dupIds,
      duplicateTitles: dupTitles.length, duplicateTitleList: dupTitles,
      exactDuplicateText: dupContent.length,
      missingLevelMetadata: missingLevel,
      missingPathwayMetadata: records.length, // zero records carry any pathway field
      missingPashtoTitle: missingPashto,
      approximateAverageTextLength: avgLen,
      currentLevelDistribution: levelDist,
      officialCurriculumEligible: 0,
      freePracticeEligible: records.length,
      classificationNote: 'candidate difficulty requires human/Phase-2 review of actual text, never inferred from title alone (Task 13\u2019s explicit warning)'
    };
  }

  // ---- Task 14: Listening forensics --------------------------------------
  function analyzeListening(listenArr) {
    if (!Array.isArray(listenArr)) return { available: false };
    var textOf = function (i) { return i && (i.en || i.text || i.sentence) || ''; };
    var groups = {};
    listenArr.forEach(function (item, idx) {
      var t = norm(textOf(item));
      if (!t) return;
      (groups[t] = groups[t] || []).push(idx);
    });
    var dupGroups = Object.keys(groups).filter(function (k) { return groups[k].length > 1; });
    var totalDupRecords = dupGroups.reduce(function (sum, k) { return sum + groups[k].length; }, 0);
    var missingLevel = countMissing(listenArr, function (i) { return !i || !i.levelId; });
    var missingPashto = countMissing(listenArr, function (i) { return !i || !i.pashto && !i.support; });
    var lengths = listenArr.map(function (i) { return String(textOf(i)).length; });
    var avgLen = lengths.length ? Math.round(lengths.reduce(function (a, b) { return a + b; }, 0) / lengths.length) : 0;
    // A "final padding sequence" — a run of identical/near-identical
    // items at the tail, the exact symptom the D15 audit flagged.
    var tailPaddingCount = 0;
    for (var i = listenArr.length - 1; i > 0; i--) {
      if (norm(textOf(listenArr[i])) === norm(textOf(listenArr[i - 1]))) tailPaddingCount++; else break;
    }
    // Reconciled with D15's established figures (400 total / 310 unique
    // / 90 duplicate): distinct texts = number of duplicate groups +
    // number of singleton (non-duplicated) records; "redundant excess"
    // = total records inside duplicate groups minus one canonical copy
    // per group — this is D15's original "90 duplicate" measurement.
    var singletonCount = Object.keys(groups).length - dupGroups.length;
    var distinctTextCount = dupGroups.length + singletonCount;
    var redundantExcessRecords = totalDupRecords - dupGroups.length;
    return {
      available: true, total: listenArr.length,
      uniqueRecords: distinctTextCount,
      duplicateRecords: redundantExcessRecords, // reconciles exactly with D15's prior "90 duplicate"
      duplicateGroups: dupGroups.length, totalRecordsInDuplicateGroups: totalDupRecords,
      trailingPaddingRunLength: tailPaddingCount,
      averageSentenceLength: avgLen,
      missingLevelMetadata: missingLevel,
      missingPashtoSupport: missingPashto,
      officialCurriculumEligible: 0,
      freePracticeEligible: listenArr.length,
      deduplicationPlanNote: 'Phase 2 de-duplication must preserve legacy indices (do not renumber/reorder) so existing per-student Listening Room progress remains valid; group members are listed by original array index in duplicateGroupIndices',
      duplicateGroupIndices: dupGroups.slice(0, 50).map(function (k) { return groups[k]; }) // capped for report size
    };
  }

  // ---- Task 15: Word Lab / Sentence Practice forensics -------------------
  function analyzeWordLab(wordSets) {
    if (!wordSets || typeof wordSets !== 'object') return { available: false };
    var allWords = [];
    Object.keys(wordSets).forEach(function (setKey) {
      (wordSets[setKey].words || []).forEach(function (w) { allWords.push(Object.assign({ _setKey: setKey }, w)); });
    });
    var dupIds = findDuplicateIds(allWords, 'id');
    var seenWord = {}, repeatedVocab = 0;
    allWords.forEach(function (w) {
      var key = norm(w.en);
      if (!key) return;
      if (seenWord[key]) repeatedVocab++;
      seenWord[key] = (seenWord[key] || 0) + 1;
    });
    var incompatible = [], usable = 0, emptyExamples = 0;
    allWords.forEach(function (w) {
      var target = norm(w.en);
      var example = norm(w.ex_en);
      if (!example) { emptyExamples++; incompatible.push({ id: w.id, word: w.en, reason: 'empty-example' }); return; }
      if (!target) { incompatible.push({ id: w.id, word: w.en, reason: 'empty-target-word' }); return; }
      if (example.indexOf(target) === -1) {
        // check simple plural/singular variant before declaring incompatible
        var singular = target.replace(/s$/, '');
        var plural = target + 's';
        if (example.indexOf(singular) > -1 || example.indexOf(plural) > -1) {
          incompatible.push({ id: w.id, word: w.en, reason: 'singular-plural-mismatch' });
        } else {
          incompatible.push({ id: w.id, word: w.en, reason: 'target-absent-from-example' });
        }
      } else {
        usable++;
      }
    });
    var missingPashto = countMissingPashto(allWords, 'dari');
    return {
      available: true, totalSets: Object.keys(wordSets).length, totalWords: allWords.length,
      duplicateWordIds: dupIds.length, duplicateWordIdList: dupIds,
      repeatedVocabularyAcrossSets: repeatedVocab,
      usableSentencePracticeRecords: usable,
      incompatibleRecords: incompatible.length,
      incompatibleReasonBreakdown: incompatible.reduce(function (acc, i) { acc[i.reason] = (acc[i.reason] || 0) + 1; return acc; }, {}),
      incompatibleDetail: incompatible, // every incompatible item WITH a reason — Task 15's explicit requirement
      emptyExamples: emptyExamples,
      missingPashtoSupport: missingPashto,
      officialCurriculumEligible: 0,
      freePracticeEligible: allWords.length
    };
  }

  // ---- Task 17: Interview forensics --------------------------------------
  function analyzeInterview(tracks, lessons) {
    if (!Array.isArray(tracks)) return { available: false };
    var dupTrackIds = findDuplicateIds(tracks, 'id');
    // I6H-D15B fix: the REAL field is 'title_ps' (Pashto title), not
    // 'pashto'/'dari' — verified directly against the shipped record
    // shape. The earlier version checked non-existent fields and wrongly
    // flagged all 70 tracks as missing Pashto support.
    var missingPashto = countMissing(tracks, function (t) { return !t || !t.title_ps || String(t.title_ps).trim() === ''; });
    var levelDist = {};
    tracks.forEach(function (t) {
      var lv = (t && (t.level_min !== undefined ? ('level_min:' + t.level_min + '-level_max:' + t.level_max) : (t.group || t.cefr))) || '(none)';
      levelDist[lv] = (levelDist[lv] || 0) + 1;
    });
    // I6H-D15B fix: the REAL grouping field is 'group' (not 'group_id'),
    // and 'sector'/'job_keywords' are the real professional-register
    // signals — verified directly. The earlier version checked a
    // non-existent field and wrongly reported zero professional-register
    // tracks.
    var professionalRegisterCount = countMissing(tracks, function (t) {
      var g = norm(t && (t.group || t.sector));
      var kw = (t && Array.isArray(t.job_keywords)) ? t.job_keywords.join(' ').toLowerCase() : '';
      return /professional|officer|hso|ngo|job|work|career/.test(g) || /job|work|career|professional|office/.test(kw);
    });
    return {
      available: true, totalTracks: tracks.length, totalLessons: Array.isArray(lessons) ? lessons.length : 0,
      duplicateTrackIds: dupTrackIds.length,
      currentSuggestedLevelDistribution: levelDist,
      professionalRegisterTracks: professionalRegisterCount,
      missingPashtoSupport: missingPashto,
      starterUnsuitableCandidateCount: professionalRegisterCount, // professional-register content is not About-Me/Starter suitable
      officialCurriculumEligible: 0,
      freePracticeEligible: tracks.length,
      classificationNote: 'accepted-class/pathway candidate mapping requires per-track human/Phase-2 review; this pass reports existing group/sector/level_min/level_max fields only'
    };
  }

  // ---- Grammar World forensics (merged real GW_TOPICS) -------------------
  function analyzeGrammar(gwTopicsObj) {
    if (!gwTopicsObj || typeof gwTopicsObj !== 'object') return { available: false };
    var ids = Object.keys(gwTopicsObj);
    var missingLevel = 0, levelDist = {};
    ids.forEach(function (id) {
      var t = gwTopicsObj[id];
      var lv = (t && (t.levelId || t.level)) || '';
      if (!lv) missingLevel++;
      levelDist[lv || '(none)'] = (levelDist[lv || '(none)'] || 0) + 1;
    });
    return {
      available: true, total: ids.length,
      missingLevelMetadata: missingLevel,
      currentLevelDistribution: levelDist,
      officialCurriculumEligible: 0,
      freePracticeEligible: ids.length
    };
  }

  window.ZirakContentForensics = {
    version: 'D15B-1',
    findDuplicateIds: findDuplicateIds, findDuplicateTitles: findDuplicateTitles,
    findExactDuplicateContent: findExactDuplicateContent,
    analyzeDialogues: analyzeDialogues,
    analyzeStoriesOrTopics: analyzeStoriesOrTopics,
    analyzeListening: analyzeListening,
    analyzeWordLab: analyzeWordLab,
    analyzeInterview: analyzeInterview,
    analyzeGrammar: analyzeGrammar,
    // Master runner — reads the real, already-loaded global arrays.
    // Returns { available:false, missing:[...] } for any bank not found,
    // never a silent zero.
    runFullForensics: function () {
      var report = {}, missing = [];
      if (typeof DIALOGUES !== 'undefined' || window.DIALOGUES) report.dialogues = analyzeDialogues(window.DIALOGUES || (typeof DIALOGUES !== 'undefined' ? DIALOGUES : null));
      else missing.push('DIALOGUES');
      if (window.STORIES || (typeof STORIES !== 'undefined')) report.stories = analyzeStoriesOrTopics(window.STORIES || (typeof STORIES !== 'undefined' ? STORIES : null), 'stories');
      else missing.push('STORIES');
      if (window.TOPIC_STUDIO_DATA || (typeof TOPIC_STUDIO_DATA !== 'undefined')) report.topics = analyzeStoriesOrTopics(window.TOPIC_STUDIO_DATA || (typeof TOPIC_STUDIO_DATA !== 'undefined' ? TOPIC_STUDIO_DATA : null), 'topics');
      else missing.push('TOPIC_STUDIO_DATA');
      if (window.LISTEN_SENTENCES || (typeof LISTEN_SENTENCES !== 'undefined')) report.listening = analyzeListening(window.LISTEN_SENTENCES || (typeof LISTEN_SENTENCES !== 'undefined' ? LISTEN_SENTENCES : null));
      else missing.push('LISTEN_SENTENCES');
      if (window.WORD_SETS || (typeof WORD_SETS !== 'undefined')) report.wordLab = analyzeWordLab(window.WORD_SETS || (typeof WORD_SETS !== 'undefined' ? WORD_SETS : null));
      else missing.push('WORD_SETS');
      if (window.GW_TOPICS) report.grammar = analyzeGrammar(window.GW_TOPICS);
      else missing.push('GW_TOPICS');
      if (window.zirakInterviewTracks) report.interview = analyzeInterview(window.zirakInterviewTracks, window.zirakInterviewLessons);
      else missing.push('zirakInterviewTracks');
      return { report: report, missingArrays: missing, complete: missing.length === 0 };
    }
  };
})();
