// ============================================================
// Zirak English v1.17A — Quick Practice Engine
// quick-practice.js
//
// SAFE RULES:
//  - Does NOT modify WordWizard, Interview Wizard, hero slideshow,
//    existing screens, service worker, or mic/TTS safety system.
//  - Always checks zirakIsTtsBlocking() before mic use.
//  - Always checks zirakIsTtsSpeaking before mic use.
//  - Wraps ALL mic code in try/catch.
//  - Calls zirakAbortRecognitionForTTS() before any TTS.
//  - Does NOT call Cohere or DeepSeek.
//  - Works 100% offline.
//  - Does NOT import or define any globals that clash with app.js.
//
// LOAD ORDER:
//  Must load AFTER interview-core.js and BEFORE closing </body>.
//  Script order in index.html:
//    content-core.js → content-wordlab.js → content-grammar.js →
//    content-dialogues.js → content-review.js → content.js →
//    content-pack-registry.js → content-pack1a.js →
//    content-pashto-patch.js → interview-content-pack1.js →
//    interview-core.js → app.js → quick-practice.js  ← LAST
//
// localStorage keys used:
//   zirak_quick_missed_items     — missed/skipped item store
//   zirak_quick_practice_sessions — session history (last 50)
//   zirak_quick_level_hint        — ending level for next start
// ============================================================

'use strict';

// ── CONSTANTS ──────────────────────────────────────────────────────
var QP_LS_MISSED    = 'zirak_quick_missed_items';
var QP_LS_SESSIONS  = 'zirak_quick_practice_sessions';
var QP_LS_LEVEL      = 'zirak_quick_level_hint';
var QP_LS_AUTO       = 'zirak_quick_auto_mode';
var QP_MAX_Q        = 10;
var QP_MAX_SESSIONS = 50;

// STABILIZATION PASS: resolve a per-student storage key when a student is
// logged in (reuses the same window.ZirakStorageKey helper app.js's direct
// keys use; falls back to the legacy unprefixed key if that helper or a
// session isn't present yet — no behaviour change when no student is active).
function qpKey(rawKey) {
  return (window.ZirakStorageKey ? window.ZirakStorageKey(rawKey) : rawKey);
}

// ─────────────────────────────────────────────────────────────────────
// PHASE I6A2 — Part 6 transcript cleanup (independent copy of the same
// proven algorithm hardened for Interview Wizard in this phase — kept
// as its own local copy here, NOT a shared import, per this project's
// "no duplicate/shared engines between independent surfaces" rule. Used
// by Quick Practice's burst-chained mic so a multi-burst answer folds
// together cleanly with no repeats, the same as Interview's fix.)
// ─────────────────────────────────────────────────────────────────────
function _qpNormForCompare(s) {
  return (s || '').toLowerCase().replace(/[.,!?;:"'\u2019\u201c\u201d]/g, '').replace(/\s+/g, ' ').trim();
}
function _qpOverlapWordCount(a, b) {
  var aw = _qpNormForCompare(a).split(' ').filter(Boolean);
  var bw = _qpNormForCompare(b).split(' ').filter(Boolean);
  var maxK = Math.min(aw.length, bw.length, 14);
  for (var k = maxK; k > 0; k--) {
    if (aw.slice(aw.length - k).join(' ') === bw.slice(0, k).join(' ')) return k;
  }
  return 0;
}
function _qpFoldTranscript(base, addition) {
  var a = (base || '').trim(), b = (addition || '').trim();
  if (!b) return a;
  if (!a) return b.length > 900 ? b.slice(0, 900) + '…' : b;
  var na = _qpNormForCompare(a), nb = _qpNormForCompare(b);
  var result;
  if (na === nb) { result = a; }
  else if (nb.indexOf(na) === 0) { result = b; }
  else if (na.indexOf(nb) === 0) { result = a; }
  else {
    var ow = _qpOverlapWordCount(a, b);
    if (ow > 0) {
      var bWords = b.split(/\s+/);
      var remainder = bWords.slice(ow).join(' ');
      result = remainder ? (a + ' ' + remainder).trim() : a;
    } else {
      result = (a + ' ' + b).trim();
    }
  }
  return (result && result.length > 900) ? result.slice(0, 900) + '…' : result;
}
function _qpCollapseRepeatedSentences(text) {
  var t = (text || '').trim();
  if (!t) return t;
  var parts = t.match(/[^.!?]+[.!?]*\s*/g);
  if (!parts || parts.length < 2) return t;
  var seen = {}, out = [];
  parts.forEach(function (raw) {
    var piece = raw.trim();
    if (!piece) return;
    var key = _qpNormForCompare(piece);
    if (!key || seen[key]) return;
    seen[key] = true;
    out.push(piece);
  });
  return out.join(' ').trim();
}
function _qpCollapseRepeatedPhrases(text) {
  var words = (text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length < 6) return (text || '').trim();
  var norm = words.map(_qpNormForCompare);
  var outWords = [], outNorm = [];
  var i = 0;
  while (i < words.length) {
    var maxK = Math.min(outWords.length, words.length - i, 40);
    var bestK = 0;
    for (var k = maxK; k >= 3; k--) {
      var tail = outNorm.slice(outNorm.length - k).join(' ');
      var next = norm.slice(i, i + k).join(' ');
      if (tail && tail === next) { bestK = k; break; }
    }
    if (bestK > 0) { i += bestK; }
    else { outWords.push(words[i]); outNorm.push(norm[i]); i++; }
  }
  return outWords.join(' ');
}
function _qpFinalCleanTranscript(text) {
  var t = (text || '').trim();
  if (!t) return t;
  t = _qpCollapseRepeatedSentences(t);
  t = _qpCollapseRepeatedPhrases(t);
  return t;
}

// PHASE I6A2 — Part 5: poll the standard speechSynthesis.speaking flag
// instead of guessing a fixed delay, so "wait until feedback TTS is
// actually done" (Part 10) is accurate rather than estimated — this
// only READS a standard browser property; it does not touch the shared
// window.speak() engine other pages depend on.
function _qpWaitForSpeechEnd(callback, maxWaitMs) {
  var start = Date.now();
  var cap = maxWaitMs || 8000;
  function poll() {
    var stillSpeaking = !!(window.speechSynthesis && window.speechSynthesis.speaking);
    if (!stillSpeaking || (Date.now() - start) > cap) { callback(); return; }
    setTimeout(poll, 200);
  }
  setTimeout(poll, 150); // small head start so speak() has actually begun
}

// ── STATE OBJECT ────────────────────────────────────────────────────
var qpState = {
  open:          false,
  pool:          [],
  usedIds:       null,   // Set — built on open
  currentItem:   null,
  currentLevel:  1,
  startingLevel: 1,
  highestLevel:  1,
  correctInRow:  0,
  wrongInRow:    0,
  answeredCount: 0,
  correctCount:  0,
  missedCount:   0,
  sessionItems:  [],
  recognition:   null,
  recognizing:   false,
  typeMode:      false,
  // PHASE I6A2 — Part 5: explicit state-machine label, purely for UI
  // status display and reasoning about the flow — does not gate logic
  // by itself (the real gating uses the existing timers/flags below).
  phase: 'idle', // idle|speakingPrompt|waitingAfterTTS|listening|waitingAfterSpeech|evaluating|speakingFeedback|waitingForSelfMark|advancing
  lastEval:      null,   // last _qpEvaluateSpoken() result, for Part 9 (missed-item missing words)
  // PHASE I6A2 — Part 6: burst-chain mic state (mirrors the same proven
  // pattern used to fix Interview's fast-speech bug) — gives Quick
  // Practice natural pause tolerance instead of cutting off after the
  // first short silence.
  micSession:             0,
  micShouldContinue:      false,
  micBurstStartTime:      0,
  micBurstNoSpeechStreak: 0,
  transcriptAccum:        '', // cross-burst combined+cleaned transcript for the CURRENT answer attempt
  // PHASE I6A-Stabilization — Part 5 (Auto Mode)
  autoMode:        false,  // teacher-guided auto flow: speak → mic → evaluate → feedback → next
  autoMicTimer:    null,   // pending "open mic after prompt" timer
  autoAdvanceTimer: null   // pending "auto-advance after feedback" timer
};

// PHASE I6A2 — Part 5/12: explicit state-machine label + visible status
// badge ("Listening…" / "Thinking…" / "Feedback…") so Auto Mode feels
// patient and teacher-like rather than silently jumping between steps.
var QP_PHASE_LABELS = {
  idle:               '',
  speakingPrompt:      '🔊 Speaking…',
  waitingAfterTTS:     '⏳ Get ready…',
  listening:           '🔴 Listening…',
  waitingAfterSpeech:  '⏳ Thinking…',
  evaluating:          '🤔 Thinking…',
  speakingFeedback:    '💬 Feedback…',
  waitingForSelfMark:  '✋ Your turn to mark',
  advancing:           '➡️ Next…'
};
function _qpSetPhase(p) {
  qpState.phase = p;
  _qpUpdateStatusBadge();
}
function _qpUpdateStatusBadge() {
  var el = document.getElementById('qp-status-badge');
  if (!el) return;
  var label = QP_PHASE_LABELS[qpState.phase] || '';
  if (!label) { el.style.display = 'none'; el.textContent = ''; return; }
  el.style.display = 'inline-block';
  el.textContent = label;
  el.className = 'qp-status-badge qp-status-' + qpState.phase;
}

// ── LEVEL MAPPER ────────────────────────────────────────────────────
// Maps string level names OR numeric levels to 1–10 scale.
function zirakMapLevelToDifficulty(levelVal) {
  if (levelVal === null || levelVal === undefined) return 1;
  // If already a small integer, just clamp
  if (typeof levelVal === 'number') return Math.max(1, Math.min(10, Math.round(levelVal)));
  var s = String(levelVal).toLowerCase().trim();
  if (s === 'nursery' || s === 'kids')          return 1;
  if (s === 'basic')                             return 1;
  if (s === 'beginner')                          return 2;
  if (s === 'elementary')                        return 3;
  if (s === 'pre-intermediate')                  return 4;
  if (s === 'intermediate')                      return 5;
  if (s === 'upper-intermediate')                return 6;
  if (s === 'advanced')                          return 7;
  if (s === 'upper-advanced')                    return 8;
  if (s === 'academic')                          return 9;
  if (s === 'ielts' || s === 'ielts prep')       return 9;
  if (s === 'a1' || s === 'cefr-a1')             return 1;
  if (s === 'a2' || s === 'cefr-a2')             return 2;
  if (s === 'b1' || s === 'cefr-b1')             return 4;
  if (s === 'b2' || s === 'cefr-b2')             return 6;
  if (s === 'c1' || s === 'cefr-c1')             return 8;
  if (s === 'c2' || s === 'cefr-c2')             return 10;
  // Try numeric
  var n = parseInt(s, 10);
  if (!isNaN(n)) return Math.max(1, Math.min(10, n));
  return 1; // fallback
}

// ── STARTING LEVEL ──────────────────────────────────────────────────
function zirakGetQuickStartingLevel() {
  // Priority 1: saved level hint from last session
  try {
    var hint = localStorage.getItem(qpKey(QP_LS_LEVEL));
    if (hint !== null && hint !== '') {
      var h = parseInt(hint, 10);
      if (!isNaN(h) && h >= 1 && h <= 10) return h;
    }
  } catch (e) { /* ignore storage errors */ }

  // Priority 2: existing app state level
  try {
    if (typeof state !== 'undefined' && state && state.level) {
      var lv = zirakMapLevelToDifficulty(state.level);
      if (lv >= 1) return lv;
    }
  } catch (e) { /* ignore */ }

  // Priority 3: school path class from localStorage
  try {
    var raw = localStorage.getItem(qpKey('zirak_school_current_class'));
    if (raw) {
      var cls = JSON.parse(raw);
      if (cls && cls.level) {
        var cl = zirakMapLevelToDifficulty(cls.level);
        if (cl >= 1) return cl;
      }
    }
  } catch (e) { /* ignore */ }

  // Default
  return 1;
}

// ── CONTENT POOL BUILDER ────────────────────────────────────────────
function zirakBuildQuickPracticePool() {
  var pool = [];

  // ── SOURCE 1: Interview Lessons ─────────────────────────────────
  try {
    var interviewLessons = [];
    if (Array.isArray(window.zirakInterviewLessons)) {
      interviewLessons = interviewLessons.concat(window.zirakInterviewLessons);
    }
    if (Array.isArray(window.zirakAllInterviewLessons)) {
      interviewLessons = interviewLessons.concat(window.zirakAllInterviewLessons);
    }
    interviewLessons.forEach(function (lesson) {
      if (!lesson) return;
      // Determine numeric level
      var lvl = lesson.level;
      if (!lvl && lesson.difficulty) lvl = lesson.difficulty;
      if (!lvl && lesson.cefr) lvl = lesson.cefr;
      lvl = zirakMapLevelToDifficulty(lvl || 1);

      var promptEn = lesson.question_en || lesson.questionEn || '';
      if (!promptEn) return; // skip items with no prompt

      pool.push({
        type:             'interview',
        source_id:        lesson.id || ('iw_' + pool.length),
        level:            lvl,
        prompt_en:        promptEn,
        prompt_ps:        lesson.question_ps  || lesson.questionPs  || '',
        prompt_dari:      '',
        expected_keywords: Array.isArray(lesson.keywords) ? lesson.keywords : [],
        sample_answer_en: lesson.sample_answer_en || lesson.sampleAnswerEn || '',
        // PHASE I6A3 — Part 5: the Pashto sample answer already exists in
        // the source interview content but was never copied through to
        // the Quick Practice item — pulling it through now so the sample
        // block can show English + Pashto, not English only.
        sample_answer_ps: lesson.sample_answer_ps || lesson.sampleAnswerPs || ''
      });
    });
  } catch (e) {
    console.warn('[QP] Interview source error:', e);
  }

  // ── SOURCE 2: WORD_SETS (from content.js) ───────────────────────
  try {
    if (typeof WORD_SETS !== 'undefined' && WORD_SETS && typeof WORD_SETS === 'object') {
      Object.keys(WORD_SETS).forEach(function (setKey) {
        var set = WORD_SETS[setKey];
        if (!set || !Array.isArray(set.words)) return;
        // Infer a numeric level for this set (sets don't always have level)
        var setLevel = zirakMapLevelToDifficulty(set.level || 'basic');

        set.words.forEach(function (word) {
          if (!word || !word.en) return;
          var wid = 'ws_' + setKey + '_' + (word.id || word.en);

          // Vocabulary item — prompt is the English word
          pool.push({
            type:        'vocabulary',
            source_id:   wid,
            level:       setLevel,
            prompt_en:   'What is the meaning of: "' + word.en + '"?',
            support_ps:  word.pashto || word.ps || '',
            support_dari: '',
            answer_en:   word.en,
            example_en:  word.ex_en || ''
          });

          // Sentence item if an example exists
          if (word.ex_en) {
            pool.push({
              type:         'sentence',
              source_id:    wid + '_s',
              level:        Math.min(10, setLevel + 1),
              prompt_en:    'Read this sentence aloud:',
              sentence_en:  word.ex_en,
              support_ps:   word.pashto || word.ps || '',
              support_dari: ''
            });
          }
        });
      });
    }
  } catch (e) {
    console.warn('[QP] WORD_SETS source error:', e);
  }

  // ── SOURCE 3: ZIRAK_WORDLAB_WORDS (from content-wordlab.js) ─────
  try {
    if (typeof ZIRAK_WORDLAB_WORDS !== 'undefined' && Array.isArray(ZIRAK_WORDLAB_WORDS)) {
      ZIRAK_WORDLAB_WORDS.forEach(function (word) {
        if (!word || !word.english) return;
        var wid  = 'wl_' + (word.id || word.english);
        var lvl  = zirakMapLevelToDifficulty(word.level || 'beginner');

        pool.push({
          type:         'vocabulary',
          source_id:    wid,
          level:        lvl,
          prompt_en:    'What is the meaning of: "' + word.english + '"?',
          support_ps:   word.meaningPashto || '',
          support_dari: '',
          answer_en:    word.english,
          example_en:   word.exampleEnglish || ''
        });

        if (word.exampleEnglish) {
          pool.push({
            type:         'sentence',
            source_id:    wid + '_s',
            level:        Math.min(10, lvl + 1),
            prompt_en:    'Read this sentence aloud:',
            sentence_en:  word.exampleEnglish,
            support_ps:   word.examplePashto  || word.meaningPashto || '',
            support_dari: ''
          });
        }
      });
    }
  } catch (e) {
    console.warn('[QP] ZIRAK_WORDLAB_WORDS source error:', e);
  }

  // Shuffle the full pool before returning
  pool = _qpShuffle(pool);
  console.log('[QP] Pool built: ' + pool.length + ' items from ' + [
    'interview(' + (window.zirakInterviewLessons || []).length + ')',
    'wordsets',
    'wordlab'
  ].join(', '));
  return pool;
}

// ── INTERNAL HELPERS ────────────────────────────────────────────────
function _qpShuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function _qpPickItem(pool, level, usedIds) {
  // 1. Prefer unused items at exact level
  var exact = pool.filter(function (it) {
    return it.level === level && !usedIds.has(it.source_id);
  });
  if (exact.length > 0) {
    return exact[Math.floor(Math.random() * exact.length)];
  }

  // 2. Any unused item at nearest level
  var unused = pool.filter(function (it) { return !usedIds.has(it.source_id); });
  if (unused.length === 0) {
    // All used — allow reuse but still prefer closest level
    unused = pool.slice();
  }

  // Sort ascending by distance from current level
  unused.sort(function (a, b) {
    return Math.abs(a.level - level) - Math.abs(b.level - level);
  });

  // Pick randomly from the closest cluster (same distance)
  var minDist = Math.abs(unused[0].level - level);
  var cluster = unused.filter(function (it) {
    return Math.abs(it.level - level) <= minDist;
  });
  return cluster[Math.floor(Math.random() * cluster.length)];
}

function _qpNorm(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function _qpCheckVocabAnswer(typed, item) {
  if (!item || !item.answer_en) return false;
  var t = _qpNorm(typed);
  var a = _qpNorm(item.answer_en);
  if (t === a) return true;
  // Allow near match: answer is substring of type or vice versa
  if (t.length > 2 && a.indexOf(t) >= 0) return true;
  if (a.length > 2 && t.indexOf(a) >= 0) return true;
  return false;
}

function _qpEsc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

// PHASE I6A5B — Part 5: wraps sample-answer text in individually-
// addressable per-sentence <span> elements so the chained reader can
// scroll+highlight exactly the sentence currently being spoken — same
// pattern as Interview Wizard, implemented independently here per this
// project's "no cross-file dependency for core rendering logic" rule.
// Uses the shared window.zirakSplitSentences() splitter (app.js) with a
// local fallback. Every piece is escaped via _qpEsc — safe against XSS.
function _qpSentenceSpans(text, idPrefix) {
  var raw = String(text || '');
  var sentences = (typeof window.zirakSplitSentences === 'function')
    ? window.zirakSplitSentences(raw)
    : (raw.match(/[^.!?]+[.!?]*(\s+|$)/g) || [raw]).map(function (s) { return s.trim(); }).filter(Boolean);
  if (!sentences.length) return '';
  return sentences.map(function (s, i) {
    return '<span id="' + idPrefix + '-' + i + '" class="' + idPrefix + '">' + _qpEsc(s) + '</span>';
  }).join(' ');
}

// ─────────────────────────────────────────────────────────────────────
// PHASE I6A-Stabilization — Part 6/7
// SPOKEN-ANSWER EVALUATION — lightweight, dependency-free overlap and
// keyword scoring so Quick Practice can give a real graded response
// instead of only "You said ... use ✅/❌ to mark yourself." This is a
// small, self-contained evaluator (NOT a second wizard engine) — it
// does not depend on interview-voice-wizard.js, keeping the two
// practice surfaces independent per the "no duplicate engines" rule.
// ─────────────────────────────────────────────────────────────────────
var QP_STOP = { a:1,an:1,the:1,is:1,am:1,are:1,was:1,were:1,be:1,been:1,to:1,of:1,for:1,and:1,or:1,
  in:1,on:1,at:1,it:1,its:1,i:1,you:1,he:1,she:1,we:1,they:1,me:1,my:1,your:1,his:1,her:1,our:1,their:1,
  this:1,that:1,these:1,those:1,with:1,do:1,does:1,did:1,can:1,will:1,would:1,please:1,so:1,as:1,but:1 };

function _qpTokens(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(function (w) { return w.length > 1 && !QP_STOP[w]; });
}
function _qpTopWords(text, n) {
  var t = _qpTokens(text), seen = {}, out = [];
  for (var i = 0; i < t.length && out.length < n; i++) { if (!seen[t[i]]) { seen[t[i]] = 1; out.push(t[i]); } }
  return out;
}
function _qpOverlapRatio(said, target) {
  var s = _qpTokens(said), tk = _qpTokens(target);
  if (!tk.length) return said ? 1 : 0;
  var sset = {}; s.forEach(function (w) { sset[w] = 1; });
  var hit = 0; tk.forEach(function (w) { if (sset[w]) hit++; });
  return hit / tk.length;
}

// Returns { confident, ok, ratio, matched, missing, empty }. `matched`/
// `missing` are now populated for EVERY item type (PHASE I6A2 — Part 7)
// so feedback can name specific words/ideas instead of staying generic.
// `confident` means we have enough signal to grade automatically; when
// false, the UI falls back to an honest "please compare and mark
// yourself" response rather than guessing.
function _qpEvaluateSpoken(item, said) {
  var text = (said || '').trim();
  if (!text) return { confident: true, ok: false, ratio: 0, matched: [], missing: [], empty: true };

  if (item.type === 'vocabulary') {
    var okV = _qpCheckVocabAnswer(text, item);
    return {
      confident: true, ok: okV, ratio: okV ? 1 : 0,
      matched:  okV ? [item.answer_en] : [],
      missing:  okV ? [] : [item.answer_en],
      empty: false
    };
  }
  if (item.type === 'sentence') {
    // Overall pass/fail uses the EXISTING proven overlap ratio (includes
    // function words) so the threshold behaviour is unchanged from I6A1.
    var overallRatio = _qpOverlapRatio(text, item.sentence_en || '');
    // matched/missing use CONTENT words only (stopwords filtered) so the
    // detailed feedback names the words that actually matter, e.g.
    // "community, participate, health programme" rather than "the, is, a".
    var targetToks = _qpTokens(item.sentence_en || '');
    var saidSet = {};
    _qpTokens(text).forEach(function (w) { saidSet[w] = 1; });
    var matchedS = [], missingS = [];
    targetToks.forEach(function (w) {
      if (saidSet[w]) { if (matchedS.indexOf(w) === -1) matchedS.push(w); }
      else { if (missingS.indexOf(w) === -1) missingS.push(w); }
    });
    return { confident: true, ok: overallRatio >= 0.55, ratio: overallRatio, matched: matchedS, missing: missingS, empty: false };
  }
  if (item.type === 'interview') {
    var kws = (item.expected_keywords && item.expected_keywords.length)
      ? item.expected_keywords.slice()
      : _qpTopWords(item.sample_answer_en || '', 5);
    var saidToks = _qpTokens(text);
    // Not enough reference data, or the utterance is too short to judge
    // confidently (could be a partial mic capture) — be honest, not harsh.
    if (!kws.length || saidToks.length < 2) {
      return { confident: false, ok: null, ratio: 0, matched: [], missing: [], empty: false };
    }
    var covered = [], missing = [];
    kws.forEach(function (k) {
      var parts = String(k).toLowerCase().split(/\s+/);
      var hit = parts.some(function (p) { return saidToks.indexOf(p) >= 0; });
      if (hit) covered.push(k); else missing.push(k);
    });
    var ratio = covered.length / kws.length;
    return { confident: true, ok: (ratio >= 0.4 || covered.length >= 2), ratio: ratio, matched: covered, missing: missing, empty: false };
  }
  return { confident: false, ok: null, ratio: 0, matched: [], missing: [], empty: false };
}

// Joins a word list the way a teacher would say it aloud: "X", "X and
// Y", or "X, Y, and Z" — used so multi-word feedback reads naturally
// instead of "X and Y and Z".
function _qpJoinNatural(arr) {
  var a = (arr || []).filter(Boolean);
  if (a.length === 0) return '';
  if (a.length === 1) return a[0];
  if (a.length === 2) return a[0] + ' and ' + a[1];
  return a.slice(0, -1).join(', ') + ', and ' + a[a.length - 1];
}

// PHASE I6A2 — Part 7: builds the visible + spoken feedback line, now
// detailed enough to name specific matched/missing words/ideas instead
// of only "use ✅/❌ to mark yourself." Wording follows the exact
// examples specified for this phase.
function _qpBuildSpokenFeedback(item, said, res) {
  var who  = (typeof window.zirakActiveStudentName === 'function') ? window.zirakActiveStudentName() : null;
  var name = (who && who.hasStudent) ? who.firstName : '';

  if (res.empty) {
    var preE = name ? name + ', ' : '';
    return {
      visible: '🔁 ' + preE + 'I didn\u2019t hear you. Tap 🎤 and speak in English.',
      spoken:  preE + 'I did not hear you. Tap the microphone and speak in English.',
      kind: 'empty', confident: true, ok: false, matched: [], missing: []
    };
  }
  if (!res.confident) {
    return {
      visible: '🎤 You said: "' + _qpEsc(said) + '" — I heard your answer. Please compare it with the sample and mark yourself.',
      spoken:  'I heard your answer. Please compare it with the sample and mark yourself.',
      kind: 'uncertain', confident: false, ok: null, matched: res.matched, missing: res.missing
    };
  }

  if (item.type === 'vocabulary') {
    if (res.ok) return {
      visible: '✅ Correct! You said: "' + _qpEsc(said) + '"',
      spoken:  'Good job' + (name ? ', ' + name : '') + '. That is correct.',
      kind: 'good', confident: true, ok: true, matched: res.matched, missing: res.missing
    };
    return {
      visible: '🔁 You said: "' + _qpEsc(said) + '" — expected: "' + _qpEsc(item.answer_en) + '".',
      spoken:  'Not quite' + (name ? ', ' + name : '') + '. The correct word is ' + item.answer_en + '.',
      kind: 'retry', confident: true, ok: false, matched: res.matched, missing: res.missing
    };
  }

  if (item.type === 'sentence') {
    if (res.ok) return {
      visible: '✅ Good job' + (name ? ', ' + name : '') + '. You said the main sentence clearly.',
      spoken:  'Good job' + (name ? ', ' + name : '') + '. You said the main sentence clearly.',
      kind: 'good', confident: true, ok: true, matched: res.matched, missing: res.missing
    };
    var missWordsS = (res.missing || []).slice(0, 6).join(', ');
    if (missWordsS) {
      return {
        visible: '🔁 Good effort' + (name ? ', ' + name : '') + '. You missed these words: ' + _qpEsc(missWordsS) + '. Listen and repeat slowly.',
        spoken:  'Good effort' + (name ? ', ' + name : '') + '. You missed these words: ' + missWordsS + '. Listen and repeat slowly.',
        kind: 'retry', confident: true, ok: false, matched: res.matched, missing: res.missing
      };
    }
    return {
      visible: '🔁 Try again' + (name ? ', ' + name : '') + '. Listen carefully and repeat the sentence slowly.',
      spoken:  'Try again' + (name ? ', ' + name : '') + '. Listen carefully and repeat the sentence slowly.',
      kind: 'retry', confident: true, ok: false, matched: res.matched, missing: res.missing
    };
  }

  // interview
  if (res.ok) {
    var inc = _qpJoinNatural((res.matched || []).slice(0, 4));
    if (inc) {
      return {
        visible: '✅ Good answer' + (name ? ', ' + name : '') + '. You included the main idea: ' + _qpEsc(inc) + '.',
        spoken:  'Good answer' + (name ? ', ' + name : '') + '. You included the main idea: ' + inc + '.',
        kind: 'good', confident: true, ok: true, matched: res.matched, missing: res.missing
      };
    }
    return {
      visible: '✅ Good job' + (name ? ', ' + name : '') + '. Your answer is understandable. You included the main idea.',
      spoken:  'Good job' + (name ? ', ' + name : '') + '. Your answer is understandable. You included the main idea.',
      kind: 'good', confident: true, ok: true, matched: res.matched, missing: res.missing
    };
  }
  var missI = (res.missing || []).slice(0, 4).join(', ');
  if (missI) {
    return {
      visible: '🔁 Try again' + (name ? ', ' + name : '') + '. Your answer should include: ' + _qpEsc(missI) + '.',
      spoken:  'Try again' + (name ? ', ' + name : '') + '. Your answer should include: ' + missI + '.',
      kind: 'retry', confident: true, ok: false, matched: res.matched, missing: res.missing
    };
  }
  return {
    visible: '🔁 Good effort' + (name ? ', ' + name : '') + '. Try again slowly. Your answer should include the main words from the question.',
    spoken:  'Good effort' + (name ? ', ' + name : '') + '. Try again slowly. Your answer should include the main words from the question.',
    kind: 'retry', confident: true, ok: false, matched: res.matched, missing: res.missing
  };
}

// ─────────────────────────────────────────────────────────────────────
// PHASE I6A2 — Part 8: visual comparison — what you said, what was
// expected, and matched (green) / missing (orange-red) word chips.
// Safe HTML throughout via _qpEsc; no raw text is ever injected.
// ─────────────────────────────────────────────────────────────────────
function _qpChipsHtml(words, cls) {
  return (words || []).map(function (w) {
    return '<span class="qp-chip ' + cls + '">' + _qpEsc(w) + '</span>';
  }).join('');
}
function _qpBuildComparisonHtml(item, said, res) {
  if (!res || res.empty || !res.confident) return '';
  var rows = [];
  rows.push(
    '<div class="qp-compare-row"><span class="qp-compare-lbl">You said</span>' +
    '<span class="qp-compare-said">' + _qpEsc(said) + '</span></div>'
  );
  var target = item.type === 'vocabulary' ? item.answer_en
             : item.type === 'sentence'   ? item.sentence_en
             : (item.sample_answer_en || '');
  if (target) {
    rows.push(
      '<div class="qp-compare-row"><span class="qp-compare-lbl">Expected</span>' +
      '<span class="qp-compare-target">' + _qpEsc(target) + '</span></div>'
    );
  }
  if ((res.matched || []).length) {
    rows.push(
      '<div class="qp-compare-row"><span class="qp-compare-lbl">Matched</span>' +
      '<span class="qp-chip-row">' + _qpChipsHtml(res.matched, 'qp-chip-good') + '</span></div>'
    );
  }
  if ((res.missing || []).length) {
    rows.push(
      '<div class="qp-compare-row"><span class="qp-compare-lbl">Missing</span>' +
      '<span class="qp-chip-row">' + _qpChipsHtml(res.missing, 'qp-chip-missing') + '</span></div>'
    );
  }
  return '<div class="qp-compare-box">' + rows.join('') + '</div>';
}

// ── STORAGE ─────────────────────────────────────────────────────────
// PHASE I6A2 — Part 9: optional `missingWords` (from the last spoken-
// answer evaluation) is stored alongside the missed item so a future
// review screen can show exactly what was missed, not just that the
// item was missed. Purely additive — existing single-arg call sites
// (qpSkip, manual taps with no prior evaluation) are unaffected, and no
// second "weak words" system is created; this reuses the EXISTING
// missed-item list/storage key.
function _qpSaveMissedItem(item, missingWords) {
  if (!item) return;
  try {
    var list = [];
    var raw = localStorage.getItem(qpKey(QP_LS_MISSED));
    if (raw) list = JSON.parse(raw);
    if (!Array.isArray(list)) list = [];

    var key = (item.type || '') + '::' + (item.source_id || '');
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (((list[i].type || '') + '::' + (list[i].source_id || '')) === key) {
        idx = i; break;
      }
    }

    var cleanMissing = (Array.isArray(missingWords) && missingWords.length)
      ? missingWords.slice(0, 12) : undefined;

    if (idx >= 0) {
      list[idx].missed_count = (list[idx].missed_count || 1) + 1;
      list[idx].date_missed  = new Date().toISOString();
      if (cleanMissing) list[idx].missing_words = cleanMissing;
    } else {
      var rec = {
        type:         item.type        || 'unknown',
        source_id:    item.source_id   || '',
        prompt_en:    item.prompt_en   || item.sentence_en || '',
        support_ps:   item.support_ps  || item.prompt_ps  || '',
        support_dari: item.support_dari || item.prompt_dari || '',
        level:        item.level       || 1,
        date_missed:  new Date().toISOString(),
        missed_count: 1
      };
      if (cleanMissing) rec.missing_words = cleanMissing;
      list.push(rec);
    }
    localStorage.setItem(qpKey(QP_LS_MISSED), JSON.stringify(list));
  } catch (e) {
    console.warn('[QP] Save missed item error:', e);
  }
}

function _qpSaveSession(rec) {
  try {
    var sessions = [];
    var raw = localStorage.getItem(qpKey(QP_LS_SESSIONS));
    if (raw) sessions = JSON.parse(raw);
    if (!Array.isArray(sessions)) sessions = [];
    sessions.unshift(rec);
    if (sessions.length > QP_MAX_SESSIONS) sessions = sessions.slice(0, QP_MAX_SESSIONS);
    localStorage.setItem(qpKey(QP_LS_SESSIONS), JSON.stringify(sessions));
  } catch (e) {
    console.warn('[QP] Save session error:', e);
  }
}

// ── OPEN / CLOSE ────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────
// PHASE I6A-Stabilization — Part 5/8 — AUTO MODE
// Mirrors the Interview Wizard's existing Auto Mode pattern (persisted,
// per-student toggle). Auto Mode drives: announce → read prompt → wait →
// mic → evaluate → speak feedback → auto-advance (when confident) or
// wait for self-mark (when not). It does NOT replace the global I6A
// Auto Read setting — it is gated BY it (Part 8): if Auto Read is OFF,
// nothing auto-speaks on open, so the Auto Mode chain (which starts
// from the prompt's onDone callback) simply never fires and the page
// behaves as Manual. Manual Speak/Type/self-mark controls always work
// regardless of either setting.
// ─────────────────────────────────────────────────────────────────────
function _qpAutoReadOk() {
  return (typeof window.ZirakAutoReadOn !== 'function') || window.ZirakAutoReadOn();
}

function _qpSyncAutoToggleUI() {
  var cb = document.getElementById('qp-auto-check');
  if (cb) cb.checked = !!qpState.autoMode;
}

function qpToggleAutoMode(checked) {
  qpState.autoMode = !!checked;
  try { localStorage.setItem(qpKey(QP_LS_AUTO), qpState.autoMode ? 'true' : 'false'); } catch (e) {}
  if (qpState.autoMode && !_qpAutoReadOk()) {
    _qpShowFeedback('ℹ️ Auto Mode is ready, but Auto Read is currently OFF, so pages will not auto-speak. Turn on Auto Read (Grammar World or Home) for the full guided flow — manual 🎤 Speak still works.', 'uncertain');
  }
}
window.qpToggleAutoMode = qpToggleAutoMode;

function openQuickPractice() {
  // Always clean up mic first — do not interrupt existing speech
  _qpCleanupMic();

  // PHASE I6A5 — Part A: Quick Practice is an overlay, not a navigate()
  // screen, so the chip-visibility hook in navigate() never fires for
  // it — hide it explicitly here (it was floating over the sample
  // answer / feedback area per real-device screenshots).
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.setChipVisible === 'function') {
    window.ZirakProfile.setChipVisible(false);
  }

  var overlay = document.getElementById('qp-overlay');
  if (!overlay) {
    console.error('[QP] #qp-overlay not found in DOM.');
    return;
  }

  // Build pool
  var pool = zirakBuildQuickPracticePool();
  if (pool.length === 0) {
    // Graceful degradation — show a message instead of crashing
    var msg = 'No practice content found yet.\n'
      + 'Make sure interview-content-pack1.js and content.js are loaded.';
    if (window.showToast) {
      window.showToast('⚠️ ' + msg);
    } else {
      alert(msg);
    }
    return;
  }

  // Reset state
  qpState.pool          = pool;
  qpState.usedIds       = new Set();
  qpState.currentLevel  = zirakGetQuickStartingLevel();
  qpState.startingLevel = qpState.currentLevel;
  qpState.highestLevel  = qpState.currentLevel;
  qpState.correctInRow  = 0;
  qpState.wrongInRow    = 0;
  qpState.answeredCount = 0;
  qpState.correctCount  = 0;
  qpState.missedCount   = 0;
  qpState.sessionItems  = [];
  qpState.currentItem   = null;
  qpState.typeMode      = false;
  qpState.open          = true;

  // PHASE I6A-Stabilization — Part 5: restore the per-student Auto Mode
  // preference every time Quick Practice opens (mirrors the existing
  // Interview Wizard auto-mode restore pattern) and sync the toggle UI.
  try {
    qpState.autoMode = (localStorage.getItem(qpKey(QP_LS_AUTO)) === 'true');
  } catch (e) { qpState.autoMode = false; }
  _qpSyncAutoToggleUI();

  // Show overlay
  overlay.style.display = 'flex';
  // Prevent background scroll on mobile
  document.body.style.overflow = 'hidden';

  _qpNextItem();
}

function closeQuickPractice() {
  _qpCleanupMic();
  clearTimeout(qpState.autoMicTimer);
  clearTimeout(qpState.autoAdvanceTimer);
  qpState.open = false;
  var overlay = document.getElementById('qp-overlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
  // PHASE I6A5 — Part A: restore the chip only if Home is the screen
  // underneath (DOM-checked directly — no dependency on app.js's
  // internal state variable scoping).
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.setChipVisible === 'function') {
    var homeEl = document.getElementById('screen-home');
    window.ZirakProfile.setChipVisible(!!(homeEl && homeEl.classList.contains('active')));
  }
}

// ── ITEM FLOW ────────────────────────────────────────────────────────
function _qpNextItem() {
  if (qpState.answeredCount >= QP_MAX_Q) {
    _qpShowSummary();
    return;
  }

  var item = _qpPickItem(qpState.pool, qpState.currentLevel, qpState.usedIds);
  if (!item) {
    _qpShowSummary();
    return;
  }

  qpState.currentItem = item;
  qpState.usedIds.add(item.source_id);
  qpState.typeMode = false;
  // PHASE I6A2 — Part 5: fresh state-machine + burst-chain bookkeeping
  // for every new item so nothing leaks from the previous one.
  qpState.phase = 'idle';
  qpState.lastEval = null;
  qpState.micShouldContinue = false;
  qpState.micBurstNoSpeechStreak = 0;

  _qpRenderItem(item);
}

// ── RENDER ITEM ──────────────────────────────────────────────────────
function _qpRenderItem(item) {
  var content = document.getElementById('qp-content');
  if (!content) return;

  var qNum        = qpState.answeredCount + 1;
  var progressPct = Math.round((qpState.answeredCount / QP_MAX_Q) * 100);

  // Type badge
  var typeBadges = {
    vocabulary: '📖 Vocabulary',
    sentence:   '📝 Sentence',
    interview:  '🎤 Interview'
  };
  var badge = typeBadges[item.type] || '📖 Practice';

  // Main prompt HTML
  var mainHtml = '';
  if (item.type === 'vocabulary') {
    mainHtml  = '<div class="qp-item-instruction">💬 Understand this word:</div>';
    mainHtml += '<div class="qp-item-prompt-word">' + _qpEsc(item.answer_en || item.prompt_en) + '</div>';
    if (item.example_en) {
      mainHtml += '<div class="qp-item-example">'
        + '📌 <em>' + _qpEsc(item.example_en) + '</em></div>';
    }
  } else if (item.type === 'sentence') {
    mainHtml  = '<div class="qp-item-instruction">' + _qpEsc(item.prompt_en) + '</div>';
    mainHtml += '<div class="qp-item-prompt-sentence">' + _qpEsc(item.sentence_en || '') + '</div>';
  } else {
    // interview
    mainHtml  = '<div class="qp-item-instruction">💬 Answer this question:</div>';
    mainHtml += '<div class="qp-item-prompt-question">' + _qpEsc(item.prompt_en) + '</div>';
  }

  // Support text (Pashto only)
  // PHASE: Teaching Display & Voice Professionalization Fix
  // Use the central getPashtoText() lookup + pending-marker fallback so
  // missing Pashto is never silently hidden (locked teaching rule).
  var ps = (typeof window.getPashtoText === 'function')
    ? window.getPashtoText(item, 'prompt')
    : (item.prompt_ps || item.support_ps || '');
  var supportHtml = (typeof window.renderPashtoLine === 'function')
    ? '<div class="qp-support-block">' + window.renderPashtoLine(ps, 'qp-support-ps pashto') + '</div>'
    : (ps ? '<div class="qp-support-block"><div class="qp-support-ps pashto">' + _qpEsc(ps) + '</div></div>' : '');

  // PHASE I6A3 — Part 5: for interview items, Quick Practice is a
  // TEACHING tool — the student needs to see the sample answer to learn
  // from it, so it is now visible by default (was hidden until tapped).
  // Shows English + Pashto (deduplicated, pending marker if missing) via
  // the shared Pashto helper — the sample previously showed English only.
  var sampleHtml = '';
  if (item.type === 'interview' && item.sample_answer_en) {
    var samplePs = (typeof window.getPashtoText === 'function')
      ? window.getPashtoText(item, 'sampleAnswer')
      : (item.sample_answer_ps || '');
    var samplePsHtml = (typeof window.renderPashtoLine === 'function')
      ? window.renderPashtoLine(samplePs, 'qp-sample-ps pashto')
      : '<div class="qp-sample-ps pashto" dir="rtl" lang="ps">'
          + (samplePs ? _qpEsc(samplePs) : '<span class="pashto-pending-marker">Pashto translation pending.</span>')
        + '</div>';
    sampleHtml = '<div id="qp-sample-block" class="qp-sample-block" style="display:block;">'
      + '<div class="qp-sample-label">💡 Sample Answer:</div>'
      + '<div class="qp-sample-text" id="qp-sample-text">' + _qpSentenceSpans(item.sample_answer_en, 'qp-sent') + '</div>'
      + samplePsHtml
      + '</div>';
  }

  // Typing area (hidden until ⌨️ Type is tapped)
  var typeAreaHtml = '<div id="qp-type-area" style="display:none;margin-top:12px;">'
    + '<input type="text" id="qp-type-input" class="qp-type-input"'
    + ' placeholder="Type your answer in English…"'
    + ' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"'
    + ' onkeydown="if(event.key===\'Enter\')qpCheckTyped()">'
    + '<button class="qp-btn qp-btn-check" onclick="qpCheckTyped()">✓ Check</button>'
    + '</div>';

  // PHASE I6A3 — Part 5: button now reflects the sample's default-visible
  // state ("Hide" since it's shown by default) and is a real toggle.
  var showSampleBtn = (item.type === 'interview' && item.sample_answer_en)
    ? '<button class="qp-btn qp-btn-hint" id="qp-sample-toggle-btn" onclick="qpToggleSample()">🙈 Hide Sample</button>'
    : '';

  // Full HTML
  content.innerHTML = ''
    + '<div class="qp-header">'
    +   '<div>'
    +     '<div class="qp-level-badge">Level ' + qpState.currentLevel + '</div>'
    +     '<div class="qp-progress-text">Question ' + qNum + ' of ' + QP_MAX_Q + '</div>'
    +   '</div>'
    +   '<button class="qp-end-btn" onclick="qpEndSession()" title="End session">🚪 End</button>'
    + '</div>'
    + '<div class="qp-progress-bar-wrap">'
    +   '<div class="qp-progress-bar-fill" style="width:' + progressPct + '%;"></div>'
    + '</div>'
    + '<div class="qp-type-badge">' + badge + '</div>'
    + '<div class="qp-item-card">'
    +   mainHtml
    +   supportHtml
    +   sampleHtml
    +   typeAreaHtml
    + '</div>'
    + '<div id="qp-status-badge" class="qp-status-badge" style="display:none;"></div>'
    + '<div id="qp-feedback-area" class="qp-feedback-area" aria-live="polite"></div>'
    + '<div class="qp-controls-row">'
    +   '<button class="qp-btn qp-btn-mic" id="qp-mic-btn" onclick="qpToggleMic()">🎤 Speak</button>'
    +   '<button class="qp-btn qp-btn-type" onclick="qpToggleType()">⌨️ Type</button>'
    + '</div>'
    + '<div class="qp-self-check-row">'
    +   showSampleBtn
    +   '<button class="qp-btn qp-btn-got"    onclick="qpGotIt()">✅ I got it</button>'
    +   '<button class="qp-btn qp-btn-missed" onclick="qpMissedIt()">❌ I missed it</button>'
    +   '<button class="qp-btn qp-btn-skip"   onclick="qpSkip()">⏭ Skip</button>'
    + '</div>';

  // PHASE I6A-Stabilization — Part 5/8, timing tightened I6A2 — Part 6
  // Auto-speak the prompt after a short delay — gated by the global I6A
  // Auto Read setting: when it is OFF, items stay silent until the
  // student taps a Hear/Speak button (manual controls are unaffected).
  // When Auto Mode is ALSO on, the prompt's completion callback chains
  // straight into opening the mic, giving the announce→read→listen flow
  // requested for Part 5 — without it, Auto Mode simply behaves like
  // Manual (the chain never starts) until Auto Read is turned back on.
  if (_qpAutoReadOk()) {
    _qpSetPhase('speakingPrompt');
    setTimeout(function () {
      _qpSpeakItemPrompt(item, function () {
        if (qpState.autoMode && qpState.open && qpState.currentItem === item) {
          _qpSetPhase('waitingAfterTTS');
          _qpAutoStartMic(item);
        } else {
          _qpSetPhase('idle');
        }
      });
    }, 350);
  }
}

// ── TTS PROMPT SPEAK ────────────────────────────────────────────────
// PHASE I6A-Stabilization — Part 5: accepts an optional onDone callback,
// fired once the utterance ends AND the post-TTS safety delay has
// passed, so anything chained from it (e.g. auto-opening the mic) never
// races the tail of the speech. Existing call sites that don't pass a
// callback are completely unaffected.
function _qpSpeakItemPrompt(item, onDone) {
  if (!window.speechSynthesis) { if (typeof onDone === 'function') onDone(); return; }
  var text = item.sentence_en || item.answer_en || item.prompt_en || '';
  if (!text || text === 'Read this sentence aloud:') { if (typeof onDone === 'function') onDone(); return; }

  try {
    // Signal TTS is starting (use existing safety vars if present)
    if (typeof window.zirakAbortRecognitionForTTS === 'function') {
      window.zirakAbortRecognitionForTTS();
    }
    window.speechSynthesis.cancel();

    var utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    // PHASE I6A5B — Part 6: use the SAME saved voice speed as the rest
    // of the app (now correctly working after the window.state fix)
    // instead of a hardcoded rate — one shared setting, everywhere.
    utter.rate = (window.state && window.state.speechRate) ? window.state.speechRate : 0.85;

    // Set blocking guard while speaking
    if (typeof window.zirakIsTtsSpeaking !== 'undefined') {
      window.zirakIsTtsSpeaking = true;
    }
    if (typeof window.zirakRecognitionBlockedUntil !== 'undefined') {
      window.zirakRecognitionBlockedUntil = Date.now() + 60000;
    }

    utter.onend = utter.onerror = function () {
      if (typeof window.zirakIsTtsSpeaking !== 'undefined') {
        window.zirakIsTtsSpeaking = false;
      }
      var safeDelay = (typeof window.zirakTtsSafetyDelayMs !== 'undefined')
        ? window.zirakTtsSafetyDelayMs : 1200;
      if (typeof window.zirakRecognitionBlockedUntil !== 'undefined') {
        window.zirakRecognitionBlockedUntil = Date.now() + safeDelay;
      }
      if (typeof onDone === 'function') setTimeout(onDone, safeDelay);
    };

    window.speechSynthesis.speak(utter);
  } catch (e) { if (typeof onDone === 'function') onDone(); }
}

// PHASE I6A-Stabilization — Part 5, timing tightened I6A2 — Part 6
// Opens the mic automatically once the prompt has finished (and the TTS
// safety delay has passed). The global safety delay (1200ms) plus this
// function's own 250ms gap lands the effective TTS-to-mic wait at
// ~1450ms — inside the requested 1200–1500ms range. Defensively
// re-checks the global TTS guard before actually calling qpToggleMic()
// — rather than letting it show a "please wait" message — and quietly
// retries a bounded number of times if audio is still finishing
// elsewhere, mirroring the same bounded-retry pattern used to harden
// the Interview Wizard's mic start.
function _qpAutoStartMic(item, retryCount) {
  retryCount = retryCount || 0;
  qpState.autoMicTimer = setTimeout(function () {
    if (!qpState.open || qpState.currentItem !== item) return;
    var blocked = (typeof window.zirakIsTtsBlocking === 'function' && window.zirakIsTtsBlocking());
    if (blocked) {
      if (retryCount >= 10) return; // ~5s — give up quietly; manual 🎤 Speak still works
      _qpAutoStartMic(item, retryCount + 1);
      return;
    }
    if (!qpState.recognizing) qpToggleMic();
  }, 250);
}

// ── SPOKEN FEEDBACK TTS (single shared engine) ───────────────────────
// PHASE I6A-Stabilization — Part 6: factored out so both the existing
// Got-It/Missed-It feedback AND the new evaluative mic feedback speak
// through ONE function (no duplicate TTS call sites).
function _qpSpeakLine(line) {
  try {
    if (typeof window.speak === 'function') {
      window.speak(line, 'en');
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(line);
      // PHASE I6A5B — Part 6: same saved speed everywhere — this is
      // only a fallback for the rare case window.speak() isn't
      // available; the normal path above already uses the shared rate.
      u.lang = 'en-US'; u.rate = (window.state && window.state.speechRate) ? window.state.speechRate : 0.85;
      window.speechSynthesis.speak(u);
    }
  } catch (e) { /* never let feedback speech break the practice flow */ }
}

// PHASE: Teaching Display & Voice Professionalization Fix — Part 8
// Short, teacher-like spoken feedback after the student self-marks an
// answer (Got It / Missed It). Uses the active student's first name
// when available. Reuses the app's central speak() so it gets the
// global "Stop Reading" button automatically; falls back to a local
// utterance if speak() isn't available for any reason. Never loops.
function _qpSpeakFeedback(correct) {
  try {
    var who = (typeof window.zirakActiveStudentName === 'function') ? window.zirakActiveStudentName() : null;
    var name = (who && who.hasStudent) ? who.firstName : '';
    var line;
    if (correct) {
      line = name ? ('Good job, ' + name + '. You said it clearly.') : 'Good job. You said it clearly.';
    } else {
      line = 'Try again. Listen carefully and repeat the sentence slowly.';
    }
    _qpSpeakLine(line);
  } catch (e) { /* never let feedback speech break the practice flow */ }
}

// ── MIC CONTROL ──────────────────────────────────────────────────────
// PHASE I6A-Stabilization — Part 5/6, detailed feedback I6A2 — Part 7/8,
// accurate auto-advance timing I6A2 — Part 10.
// Grades the spoken transcript, shows detailed visible feedback (with
// matched/missing word chips) and speaks it, then — only in Auto Mode
// and only when the grading is confident — auto-advances exactly like
// the student had tapped "I got it" / "I missed it" themselves (reusing
// those SAME functions, so level-adaptation, session tracking, and the
// missed-item list all stay in sync with manual self-marking). The
// advance waits for the feedback TTS to ACTUALLY finish (polls the
// standard speechSynthesis.speaking flag rather than guessing a fixed
// delay) before acting, so longer detailed feedback is never cut off.
// When the grading is uncertain, the flow always waits for the student.
function _qpEvaluateAndRespond(item, said) {
  if (!item) return;
  clearTimeout(qpState.autoAdvanceTimer);

  var res = _qpEvaluateSpoken(item, said);
  var fb  = _qpBuildSpokenFeedback(item, said, res);
  qpState.lastEval = res; // PHASE I6A2 — Part 9: available to qpMissedIt() for missing-words storage

  var compareHtml = _qpBuildComparisonHtml(item, said, res);
  _qpShowFeedback(fb.visible, fb.kind, compareHtml);
  // PHASE I6A5 — Part D: bring the feedback card into view — per
  // real-device screenshots it can land below the fold (especially
  // with a longer interview question/sample answer above it).
  var fbAreaEl = document.getElementById('qp-feedback-area');
  if (fbAreaEl) {
    if (typeof window.scrollLearningElementIntoView === 'function') {
      window.scrollLearningElementIntoView(fbAreaEl, { block: 'center' });
    } else {
      try { fbAreaEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    }
  }

  _qpSetPhase('speakingFeedback');
  // Feedback is always spoken — it is a direct response to the
  // student's own action, the same way Got-It/Missed-It feedback has
  // always spoken unconditionally in this file (Part 6).
  _qpSpeakLine(fb.spoken);

  if (qpState.autoMode && fb.confident && fb.ok !== null) {
    _qpWaitForSpeechEnd(function () {
      if (!qpState.open || qpState.currentItem !== item) return; // student already acted/moved on
      qpState.autoAdvanceTimer = setTimeout(function () {
        if (!qpState.open || qpState.currentItem !== item) return;
        _qpSetPhase('advancing');
        if (fb.ok) { qpGotIt(); } else { qpMissedIt(); }
      }, 1000); // PHASE I6A3 — Part 6: ~1 second patience after feedback finishes, before moving on
    }, 9000);
  } else {
    _qpWaitForSpeechEnd(function () {
      if (!qpState.open || qpState.currentItem !== item) return;
      _qpSetPhase('waitingForSelfMark');
    }, 9000);
  }
}

// PHASE I6A2 — Part 6: overall cap across all bursts of one Quick
// Practice answer attempt. Shorter than Interview's cap since QP items
// (vocabulary/sentence/short interview answers) are normally brief.
var QP_MAX_BURST_MS = 20000;

// PHASE I6A2 — Part 5/6 (Quick Practice Patience State Machine)
// Public toggle: tapping 🎤 Speak either starts or stops the WHOLE
// multi-burst listening session. Checking micShouldContinue (not just
// qpState.recognizing) means a tap during the brief ~220ms gap between
// chained bursts still correctly STOPS the session instead of
// accidentally starting a fresh one.
function qpToggleMic() {
  if (qpState.micShouldContinue || qpState.recognizing) {
    qpState.micShouldContinue = false;
    _qpCleanupMic();
    _qpSetPhase('idle');
    return;
  }

  // Check TTS safety guards (must never start mic while TTS is active)
  if (typeof window.zirakIsTtsBlocking === 'function' && window.zirakIsTtsBlocking()) {
    _qpShowFeedback('⏳ Please wait — audio is still playing. Tap Speak again in a moment.');
    return;
  }
  if (typeof window.zirakIsTtsSpeaking !== 'undefined' && window.zirakIsTtsSpeaking) {
    _qpShowFeedback('⏳ Please wait — audio is still playing.');
    return;
  }

  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    _qpShowFeedback('🎤 Speech recognition is not available on this browser. Please type your answer instead.');
    qpToggleType();
    return;
  }

  // Arm a fresh multi-burst attempt.
  qpState.micShouldContinue      = true;
  qpState.micBurstStartTime      = Date.now();
  qpState.micBurstNoSpeechStreak = 0;
  qpState.transcriptAccum        = '';
  _qpStartMicBurst(false);
}

// PHASE I6A2 — Part 5/6: one continuous:false "burst." Auto-restarts
// across a natural pause (instead of stopping after the first short
// silence) so the student gets genuine pause tolerance — the same
// proven pattern used to fix Interview's fast-speech bug, independently
// implemented here per this project's no-shared-engine rule. A burst
// chain stops once: the student/something else explicitly stopped it,
// the overall time cap is hit, or 2 CONSECUTIVE bursts capture nothing
// (one quiet pause never ends it early — only two in a row means the
// student is actually finished).
function _qpStartMicBurst(isBurstRestart) {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { qpState.micShouldContinue = false; return; }

  var rec;
  try { rec = new SR(); } catch (e) {
    qpState.micShouldContinue = false;
    qpState.recognizing = false;
    _qpResetMicBtn();
    _qpShowFeedback('🎤 Could not start microphone: ' + _qpEsc(e.message || 'unknown error') + '. Please type your answer.');
    qpToggleType();
    return;
  }

  // Session token — each burst gets its own id; a late callback from a
  // superseded burst is discarded rather than corrupting the current one.
  qpState.micSession = (qpState.micSession || 0) + 1;
  var mySession = qpState.micSession;

  qpState.recognition = rec;
  rec.lang = 'en-US';
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  if (!isBurstRestart) {
    _qpSetPhase('listening');
  }

  var micBtn = document.getElementById('qp-mic-btn');
  if (micBtn) {
    micBtn.textContent = '🔴 Listening…';
    micBtn.classList.add('qp-btn-listening');
  }

  var burstFinalClean = '';

  rec.onresult = function (e) {
    if (mySession !== qpState.micSession) return;
    var finalText = '', interimText = '';
    for (var i = 0; i < e.results.length; i++) {
      var piece = e.results[i][0].transcript;
      if (e.results[i].isFinal) finalText = _qpFoldTranscript(finalText, piece);
      else interimText = _qpFoldTranscript(interimText, piece);
    }
    burstFinalClean = _qpFinalCleanTranscript(finalText);
    var liveDisplay = _qpFinalCleanTranscript(
      _qpFoldTranscript(qpState.transcriptAccum, _qpFoldTranscript(burstFinalClean, interimText))
    );
    if (liveDisplay) {
      _qpShowFeedback('🎤 Hearing: "' + _qpEsc(liveDisplay) + '…"');
    }
  };

  rec.onend = function () {
    if (mySession !== qpState.micSession) return;
    qpState.recognizing = false;

    if (burstFinalClean) {
      qpState.transcriptAccum = _qpFinalCleanTranscript(_qpFoldTranscript(qpState.transcriptAccum, burstFinalClean));
      qpState.micBurstNoSpeechStreak = 0;
    } else {
      qpState.micBurstNoSpeechStreak++;
    }

    var elapsed = Date.now() - qpState.micBurstStartTime;
    var shouldContinue = qpState.micShouldContinue
                          && elapsed < QP_MAX_BURST_MS
                          && qpState.micBurstNoSpeechStreak < 2;

    if (shouldContinue) {
      qpState.autoMicTimer = setTimeout(function () {
        if (mySession !== qpState.micSession) return;
        if (!qpState.micShouldContinue) return;
        _qpStartMicBurst(true);
      }, 220);
      return;
    }

    // Truly done listening.
    qpState.micShouldContinue = false;
    _qpResetMicBtn();
    _qpSetPhase('waitingAfterSpeech');
    // PHASE I6A2 — Part 6: brief grace pause before evaluating, instead
    // of judging the instant the browser's onend fires — avoids
    // "instantly failing" a student who paused right at the end.
    setTimeout(function () {
      if (mySession !== qpState.micSession) return;
      _qpSetPhase('evaluating');
      _qpEvaluateAndRespond(qpState.currentItem, qpState.transcriptAccum);
    }, 400);
  };

  rec.onerror = function (e) {
    if (mySession !== qpState.micSession) return;
    qpState.recognizing = false;
    var errType = e && e.error;
    if (errType === 'no-speech') {
      // Expected during a natural pause — onend (fires right after)
      // decides continue-vs-stop based on the no-speech streak.
      return;
    }
    qpState.micShouldContinue = false;
    _qpResetMicBtn();
    if (errType === 'not-allowed' || errType === 'permission-denied') {
      _qpShowFeedback('🎤 Microphone permission denied. Please type your answer instead.');
      qpToggleType();
    } else if (errType === 'aborted') {
      // Silent — something else (TTS, self-mark, close) deliberately stopped us.
    } else {
      _qpShowFeedback('🎤 Could not hear clearly (' + errType + '). Please try again or type.');
    }
  };

  try {
    rec.start();
    qpState.recognizing = true;
  } catch (e) {
    qpState.recognizing = false;
    qpState.recognition = null;
    qpState.micShouldContinue = false;
    _qpResetMicBtn();
    if (!isBurstRestart) {
      _qpShowFeedback('🎤 Could not start microphone. Please try again.');
    }
  }
}

function _qpCleanupMic() {
  // PHASE I6A2 — Part 6: any reason for forcibly cleaning up the mic
  // must also stop the burst-chain, the same way Interview's
  // ivwAbortLocalMic does — otherwise a queued restart could reopen the
  // mic right after something else (TTS, self-mark, close) stopped it.
  qpState.micShouldContinue = false;
  if (qpState.recognition) {
    try { qpState.recognition.abort(); } catch (e) { /* ignore */ }
    qpState.recognition = null;
  }
  qpState.recognizing = false;
  // PHASE I6A-Stabilization — Part 5: cancel any pending auto-mic-open
  // timer so it can't fire into a torn-down/changed context (e.g. the
  // student self-marked before Auto Mode's mic-open delay elapsed).
  clearTimeout(qpState.autoMicTimer);
  _qpResetMicBtn();
}

function _qpResetMicBtn() {
  var btn = document.getElementById('qp-mic-btn');
  if (btn) {
    btn.textContent = '🎤 Speak';
    btn.classList.remove('qp-btn-listening');
  }
}

// ── TYPING ───────────────────────────────────────────────────────────
function qpToggleType() {
  var area = document.getElementById('qp-type-area');
  if (!area) return;
  qpState.typeMode = !qpState.typeMode;
  area.style.display = qpState.typeMode ? 'block' : 'none';
  if (qpState.typeMode) {
    var inp = document.getElementById('qp-type-input');
    if (inp) setTimeout(function () { inp.focus(); }, 50);
  }
}

function qpCheckTyped() {
  var inp = document.getElementById('qp-type-input');
  if (!inp) return;
  var val = inp.value.trim();
  if (!val) {
    _qpShowFeedback('⌨️ Please type something first.');
    return;
  }
  var item = qpState.currentItem;
  if (!item) return;

  if (item.type === 'vocabulary' && item.answer_en) {
    var ok = _qpCheckVocabAnswer(val, item);
    if (ok) {
      _qpShowFeedback('✅ Correct! "' + _qpEsc(val) + '" matches the expected answer.');
    } else {
      _qpShowFeedback('💬 You typed: "' + _qpEsc(val) + '" — '
        + 'Expected: "' + _qpEsc(item.answer_en) + '". Use ✅ or ❌ to log your result.');
    }
  } else {
    _qpShowFeedback('📝 You wrote: "' + _qpEsc(val) + '" — use ✅ or ❌ to self-mark.');
  }
}

// ── SHOW / HIDE SAMPLE ───────────────────────────────────────────────
// PHASE I6A3 — Part 5: the sample block is now visible by default for
// interview items (teaching mode), so this button's job flips to mainly
// HIDING it, with the ability to bring it back — a real toggle instead
// of a one-way reveal. qpShowSample() is kept as a thin alias so any
// other existing call site (e.g. a future "reveal sample" shortcut)
// keeps working unchanged.
// PHASE I6A5B — Part 5: sample answer is now read sentence-by-sentence
// with each sentence highlighted and scrolled into view — same shared
// engine (window.zirakSpeakChain) used by Interview Wizard and Grammar
// World, so Stop Reading and the Android-safe fallback work identically.
function _qpSpeakSampleChain(item) {
  if (!item || !item.sample_answer_en) return;
  var sentences = (typeof window.zirakSplitSentences === 'function')
    ? window.zirakSplitSentences(item.sample_answer_en)
    : [item.sample_answer_en];
  if (!sentences.length) return;

  var stale = document.querySelectorAll('.qp-sent-active');
  for (var k = 0; k < stale.length; k++) stale[k].classList.remove('qp-sent-active');

  if (typeof window.zirakSpeakChain !== 'function') {
    // Defensive fallback if the shared chain is ever unavailable.
    _qpSpeakItemPrompt({ prompt_en: item.sample_answer_en });
    return;
  }
  var segments = sentences.map(function (s, i) { return { text: s, spanId: 'qp-sent-' + i }; });
  window.zirakSpeakChain(segments, {
    pauseMs: 400, // Part 9: calm pacing, not rushed
    onSegmentStart: function (seg) {
      var el = document.getElementById(seg.spanId);
      if (!el) return;
      el.classList.add('qp-sent-active');
      if (typeof window.scrollLearningElementIntoView === 'function') {
        window.scrollLearningElementIntoView(el, { block: 'center' });
      } else {
        try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      }
    },
    onSegmentEnd: function (seg) {
      var el = document.getElementById(seg.spanId);
      if (el) el.classList.remove('qp-sent-active');
    }
  });
}

function qpToggleSample() {
  var el = document.getElementById('qp-sample-block');
  var btn = document.getElementById('qp-sample-toggle-btn');
  if (!el) return;
  var nowHidden = (el.style.display !== 'none');
  if (nowHidden) {
    el.style.display = 'none';
    if (btn) btn.textContent = '👁 Show Sample';
  } else {
    el.style.display = 'block';
    if (btn) btn.textContent = '🙈 Hide Sample';
    _qpSpeakSampleChain(qpState.currentItem);
  }
}
function qpShowSample() {
  var el = document.getElementById('qp-sample-block');
  var btn = document.getElementById('qp-sample-toggle-btn');
  if (el) el.style.display = 'block';
  if (btn) btn.textContent = '🙈 Hide Sample';
  _qpSpeakSampleChain(qpState.currentItem);
}

// ── FEEDBACK ─────────────────────────────────────────────────────────
// PHASE I6A-Stabilization — Part 6/10: optional `kind` adds a color-
// coded left accent (good/retry/uncertain/empty) so feedback reads as
// clearly graded rather than a flat neutral box. PHASE I6A2 — Part 8:
// optional `compareHtml` (pre-built via _qpBuildComparisonHtml, already
// escaped) renders the matched/missing word comparison underneath.
// Existing call sites that pass neither extra arg render exactly as
// before (no visual change).
function _qpShowFeedback(msg, kind, compareHtml) {
  var el = document.getElementById('qp-feedback-area');
  if (!el) return;
  var cls = 'qp-feedback-msg' + (kind ? ' qp-fb-' + kind : '');
  el.innerHTML = '<div class="' + cls + '">' + msg + '</div>' + (compareHtml || '');
}

// ── SELF-CHECK BUTTONS ────────────────────────────────────────────────
function qpGotIt() {
  if (!qpState.currentItem) return;
  clearTimeout(qpState.autoAdvanceTimer);
  _qpCleanupMic();
  _qpSetPhase('idle');
  qpState.lastEval = null;

  qpState.answeredCount++;
  qpState.correctCount++;
  qpState.correctInRow++;
  qpState.wrongInRow = 0;
  qpState.sessionItems.push({ item: qpState.currentItem, result: 'correct' });

  // Adaptive level: 3 consecutive correct → level up
  if (qpState.correctInRow >= 3) {
    qpState.currentLevel = Math.min(10, qpState.currentLevel + 1);
    qpState.correctInRow = 0;
    _qpShowFeedback('🎉 Great job! Level up → Now at Level ' + qpState.currentLevel);
  } else {
    _qpShowFeedback('✅ Logged as correct!');
  }

  // Track highest level reached
  if (qpState.currentLevel > qpState.highestLevel) {
    qpState.highestLevel = qpState.currentLevel;
  }

  // PHASE: Teaching Display & Voice Professionalization Fix — Part 8
  // Speak a short, teacher-like feedback line (not just a visual self-mark).
  _qpSpeakFeedback(true);

  // Slightly longer pause than before (was 700ms) so the spoken feedback
  // line has time to be heard before the next item's auto-speak begins.
  setTimeout(function () { _qpNextItem(); }, 1800);
}

function qpMissedIt() {
  if (!qpState.currentItem) return;
  clearTimeout(qpState.autoAdvanceTimer);
  _qpCleanupMic();
  _qpSetPhase('idle');

  // PHASE I6A2 — Part 9: if the student missed right after a mic/typed
  // evaluation, carry the specific missing words/ideas into the saved
  // missed item so a future review can show exactly what to practice —
  // reuses the existing missed-item list, no second weak-words system.
  var missingWords = (qpState.lastEval && Array.isArray(qpState.lastEval.missing))
    ? qpState.lastEval.missing : undefined;
  qpState.lastEval = null;
  _qpSaveMissedItem(qpState.currentItem, missingWords);

  qpState.answeredCount++;
  qpState.missedCount++;
  qpState.wrongInRow++;
  qpState.correctInRow = 0;
  qpState.sessionItems.push({ item: qpState.currentItem, result: 'missed' });

  // Adaptive: missed → level down
  qpState.currentLevel = Math.max(1, qpState.currentLevel - 1);
  _qpShowFeedback('❌ Saved to review list. Level → ' + qpState.currentLevel);

  // PHASE: Teaching Display & Voice Professionalization Fix — Part 8
  // Speak a short, teacher-like feedback line (not just a visual self-mark).
  _qpSpeakFeedback(false);

  // Slightly longer pause than before (was 700ms) so the spoken feedback
  // line has time to be heard before the next item's auto-speak begins.
  setTimeout(function () { _qpNextItem(); }, 1800);
}

function qpSkip() {
  if (!qpState.currentItem) return;
  clearTimeout(qpState.autoAdvanceTimer);
  _qpCleanupMic();
  _qpSetPhase('idle');
  qpState.lastEval = null;

  _qpSaveMissedItem(qpState.currentItem);

  qpState.answeredCount++;
  qpState.missedCount++;
  qpState.correctInRow = 0;
  qpState.sessionItems.push({ item: qpState.currentItem, result: 'skipped' });

  // Adaptive: skip → level down
  qpState.currentLevel = Math.max(1, qpState.currentLevel - 1);

  setTimeout(function () { _qpNextItem(); }, 300);
}

function qpEndSession() {
  _qpCleanupMic();
  _qpShowSummary();
}

// ── SESSION SUMMARY ───────────────────────────────────────────────────
function _qpShowSummary() {
  _qpCleanupMic();

  // Save ending level hint for next session
  try {
    localStorage.setItem(qpKey(QP_LS_LEVEL), String(qpState.currentLevel));
  } catch (e) { /* ignore */ }

  // Content types used this session
  var typesUsed = {};
  qpState.sessionItems.forEach(function (si) {
    if (si.item && si.item.type) typesUsed[si.item.type] = true;
  });

  // Save session record
  _qpSaveSession({
    date:          new Date().toISOString(),
    answered:      qpState.answeredCount,
    correct:       qpState.correctCount,
    missed:        qpState.missedCount,
    highest_level: qpState.highestLevel,
    ending_level:  qpState.currentLevel,
    content_types: Object.keys(typesUsed)
  });

  // PHASE: Teaching Display & Voice Professionalization Fix — Part 7/8
  // Speak a short personalized session summary once (not looped).
  try {
    var who = (typeof window.zirakActiveStudentName === 'function') ? window.zirakActiveStudentName() : null;
    var qpName = (who && who.hasStudent) ? who.firstName : '';
    var qpPct = qpState.answeredCount ? Math.round((qpState.correctCount / qpState.answeredCount) * 100) : 0;
    var qpMsg = (qpName ? qpName + ', ' : '') + 'session complete. You practiced ' + qpState.answeredCount +
      ' item' + (qpState.answeredCount===1?'':'s') + ' with ' + qpPct + ' percent correct. ' +
      (qpPct >= 80 ? 'Excellent work.' : qpPct >= 50 ? 'Good effort, keep practicing.' : 'Keep practicing — review the missed items.');
    if (typeof window.speak === 'function') window.speak(qpMsg, 'en');
  } catch (e) { /* never let summary speech break the flow */ }

  var content = document.getElementById('qp-content');
  if (!content) return;

  var answeredText = qpState.answeredCount === 1
    ? '1 item' : qpState.answeredCount + ' items';

  content.innerHTML = ''
    + '<div class="qp-summary">'
    +   '<div class="qp-summary-icon">🎯</div>'
    +   '<div class="qp-summary-title">Session Complete!</div>'
    +   '<div class="qp-summary-sub">ښه کار دې وکړ · Good work</div>'
    +   '<div class="qp-summary-stats">'
    +     '<div class="qp-stat-row">'
    +       '<span class="qp-stat-label">📋 Items practiced</span>'
    +       '<strong class="qp-stat-val">' + answeredText + '</strong>'
    +     '</div>'
    +     '<div class="qp-stat-row">'
    +       '<span class="qp-stat-label">✅ Correct / self-marked</span>'
    +       '<strong class="qp-stat-val">' + qpState.correctCount + '</strong>'
    +     '</div>'
    +     '<div class="qp-stat-row">'
    +       '<span class="qp-stat-label">❌ Missed / skipped</span>'
    +       '<strong class="qp-stat-val">' + qpState.missedCount + '</strong>'
    +     '</div>'
    +     '<div class="qp-stat-row">'
    +       '<span class="qp-stat-label">📈 Highest level reached</span>'
    +       '<strong class="qp-stat-val">Level ' + qpState.highestLevel + '</strong>'
    +     '</div>'
    +     '<div class="qp-stat-row">'
    +       '<span class="qp-stat-label">🏁 Ending level</span>'
    +       '<strong class="qp-stat-val">Level ' + qpState.currentLevel + '</strong>'
    +     '</div>'
    +   '</div>'
    +   '<div class="qp-summary-btns">'
    +     '<button class="qp-btn qp-btn-got" onclick="openQuickPractice()" style="font-size:15px;padding:14px 24px;">'
    +       '🔄 Practice 10 More'
    +     '</button>'
    +     '<button class="qp-btn qp-btn-type" onclick="closeQuickPractice()" style="font-size:15px;padding:14px 24px;">'
    +       '🏠 Back Home'
    +     '</button>'
    +   '</div>'
    +   // I6H-B: WhatsApp proof button (shared ZirakResultProof helper)
    +   (window.ZirakResultProof ? window.ZirakResultProof.renderButtonHtml('Quick Practice', qpState.correctCount, qpState.answeredCount) : '')
    +   // I6H-B: Real missed-items review (replaces Coming Soon)
    +   _qpBuildMissedReviewHtml()
    + '</div>';
}

// I6H-B: Build the missed-items review panel
function _qpBuildMissedReviewHtml() {
  var missed = (qpState.sessionItems || []).filter(function(si) {
    return si.result === 'missed' || si.result === 'skipped';
  });
  if (!missed.length) {
    return '<div style="text-align:center;margin-top:14px;padding:12px;background:rgba(16,185,129,0.1);border-radius:10px;">' +
      '<span style="color:var(--emerald-text,#059669);font-weight:700;">✅ No missed items. Well done!</span></div>';
  }
  var rows = missed.slice(0, 8).map(function(si, i) {
    var it = si.item || {};
    var q   = it.promptEn || it.en || it.word || '';
    var ans = it.answerEn || it.sampleEn || '';
    var ps  = it.ps || it.promptPs || '';
    return '<div class="qp-missed-item">' +
      '<div class="qp-missed-q">' + (i+1) + '. ' + q + '</div>' +
      (ans && ans !== q ? '<div class="qp-missed-ans">✓ ' + ans + '</div>' : '') +
      (ps ? '<div class="qp-missed-ps pashto" dir="rtl" lang="ps">' + ps + '</div>' : '') +
    '</div>';
  }).join('');
  return '<div class="qp-missed-review">' +
    '<div class="qp-missed-lbl">📋 Missed Items (' + missed.length + ') — Practice These Again</div>' +
    rows +
  '</div>';
}

// ── COMMAND ROUTER ────────────────────────────────────────────────────
// Registers a command handler that can be called by interview-core.js
// or by app.js navigate() if needed.
var _QP_COMMANDS = [
  'just practice', 'quick practice', 'start practice',
  'start now',     'random practice', 'just practise',
  'quick practise', 'practice now'
];

/**
 * Check if a user text command should open Quick Practice.
 * Returns true and opens the overlay if matched.
 * @param {string} text
 * @returns {boolean}
 */
window.zirakQuickPracticeCommand = function (text) {
  if (!text || typeof text !== 'string') return false;
  var t = text.toLowerCase().trim();
  for (var i = 0; i < _QP_COMMANDS.length; i++) {
    if (t.indexOf(_QP_COMMANDS[i]) >= 0) {
      openQuickPractice();
      return true;
    }
  }
  return false;
};

// ── COMMAND ROUTER HOOK ───────────────────────────────────────────────
// Patch zirakLocalCommandRouter after it is defined by interview-core.js
// so our quick-practice commands are handled first.
// We use DOMContentLoaded to ensure interview-core.js has already run.
document.addEventListener('DOMContentLoaded', function () {
  var origRouter = window.zirakLocalCommandRouter;
  if (typeof origRouter === 'function') {
    window.zirakLocalCommandRouter = function (text) {
      if (window.zirakQuickPracticeCommand(text)) return;
      origRouter(text);
    };
    console.log('[QP] Command router patched.');
  }
});
