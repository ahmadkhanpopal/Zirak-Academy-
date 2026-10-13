// ============================================================
// Zirak English v1.17B — Interview Voice Wizard
// interview-voice-wizard.js
//
// PURPOSE:
//   Upgrades the Interview Wizard practice overlay into a full
//   voice-guided experience with:
//     - Wizard avatar + speech bubble guidance
//     - Hear Question / Repeat Question
//     - Speak Answer (mic) / Type Answer
//     - Countdown (3-2-1) before mic starts
//     - Show / Hear Sample Answer
//     - Optional Auto Wizard Mode
//     - Tips
//     - Simple answer feedback (Phase 7)
//     - Pashto/Pashto RTL text support
//     - Full mobile UI polish
//
// SAFE RULES:
//   - Does NOT touch zirakIsTtsSpeaking, zirakRecognitionBlockedUntil,
//     zirakTtsSafetyDelayMs, zirakAbortRecognitionForTTS, or
//     zirakIsTtsBlocking in app.js. Reads them only.
//   - Does NOT modify WordWizard, Quick Practice, or hero slideshow.
//   - Does NOT replace interview-core.js — only overrides iwRenderPractice
//     and iwClosePractice to upgrade the overlay UI.
//   - Wraps ALL mic/TTS code in try/catch.
//   - Never overlaps TTS or starts mic while TTS is speaking.
//   - Works 100% offline.
//
// LOAD ORDER:
//   Must load AFTER interview-core.js and AFTER app.js.
//   Script order in index.html (last two):
//     → interview-core.js → app.js → quick-practice.js
//     → interview-voice-wizard.js  ← APPENDED LAST
// ============================================================

'use strict';

// PHASE I6A2 — Part 4: extra post-TTS guard, ADDED ON TOP of the shared
// global zirakTtsSafetyDelayMs (1200ms, defined in app.js and used by
// every other mic engine in the app). This is Interview-only, landing
// the effective wait in the requested 1500–1800ms range for the engine
// that showed fast-speech mic/TTS overlap, without changing the shared
// constant other already-working engines depend on.
var IVW_EXTRA_TTS_GUARD_MS = 400;

// PHASE: Teaching Display & Voice Professionalization Fix — Part 10
// Student profile placeholders: replace common hardcoded sample names
// (Ahmad, Ahmed, Fatima) with the active student's own first name for
// DISPLAY and TTS only. Never mutates the underlying lesson data, and
// never used to penalize scoring — there is no strict name-matching
// scorer in this file (ivwShowAnswerHint only checks word count), so
// a student saying their own real name was never marked wrong here.
function ivwPersonalize(text) {
  if (!text) return text;
  try {
    var who = (typeof window.zirakActiveStudentName === 'function') ? window.zirakActiveStudentName() : null;
    if (!who || !who.hasStudent || !who.firstName) return text;
    // PHASE: Interview Emergency Repair — Part 5
    // Replace ALL sample placeholder names (added Omar — it appears in the
    // shipped Basic Phone Interview sample) with the active student's first
    // name, using the global flag so every occurrence is personalized, not
    // just the first. DISPLAY/TTS only — lesson data is never mutated, and
    // this is never used to score, so a student saying their own real name
    // is always accepted.
    return text.replace(/\b(Ahmad|Ahmed|Fatima|Omar)\b/g, who.firstName);
  } catch (e) { return text; }
}

// ─────────────────────────────────────────────────────────────
// PHASE: Interview Emergency Repair — Part 2
// foldTranscript() — the real cure for the repeated-phrase bug seen in
// the screenshots ("Hello Hello this Hello this is a phone interview…").
//
// On Android/Chrome with continuous SpeechRecognition, event.results is a
// CUMULATIVE list, and the engine frequently re-emits a NEW "final" result
// that re-transcribes the SAME utterance from the start, growing word by
// word each time. The old code did `ivwFinalTranscript += piece`, so each
// growing re-transcription got concatenated into one endless run-on string.
//
// foldTranscript merges two transcript chunks intelligently:
//   - identical (after whitespace normalization)  → keep one copy
//   - one is a growing prefix of the other         → keep the longer one
//   - genuinely different content                  → append once with a space
// Applied every time text is folded, growing-cumulative results collapse to
// a single clean phrase instead of duplicating endlessly.
// (Same proven approach already used by the Namaz Wizard mic engine.)
// ─────────────────────────────────────────────────────────────
function ivwNormForCompare(s) {
  // PHASE: I6A-Stabilization — Part 2 (stronger transcript hardening)
  // The original normalizer only collapsed whitespace, so two ASR
  // "final" chunks that were the SAME utterance but differed only in
  // capitalization or trailing punctuation (very common on Android when
  // the engine re-finalizes mid-session) were treated as DIFFERENT text
  // and appended — producing the repeated-answer bug seen in real phone
  // testing. Comparison is now case- and punctuation-insensitive. The
  // ORIGINAL text (not this normalized form) is always what gets kept
  // and displayed — this function is for comparison decisions only.
  return (s || '')
    .toLowerCase()
    .replace(/[.,!?;:"'\u2019\u201c\u201d]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Longest WORD-aligned overlap between the end of `a` and the start of
// `b` (word-capped for safety/perf). Lets fold() merge chunks that
// overlap mid-sentence rather than only exact prefix/superset matches.
function ivwOverlapWordCount(a, b) {
  var aw = ivwNormForCompare(a).split(' ').filter(Boolean);
  var bw = ivwNormForCompare(b).split(' ').filter(Boolean);
  var maxK = Math.min(aw.length, bw.length, 14);
  for (var k = maxK; k > 0; k--) {
    if (aw.slice(aw.length - k).join(' ') === bw.slice(0, k).join(' ')) return k;
  }
  return 0;
}

function ivwFoldTranscriptCore(base, addition) {
  var a = (base || '').trim();
  var b = (addition || '').trim();
  if (!b) return a;
  if (!a) return b;
  var na = ivwNormForCompare(a);
  var nb = ivwNormForCompare(b);
  if (na === nb) return a;                // exact duplicate (case/punct-insensitive) → no change
  if (nb.indexOf(na) === 0) return b;     // b = a + more → b supersedes a
  if (na.indexOf(nb) === 0) return a;     // a already contains b → keep a
  // PART 2 — partial overlap: b's start overlaps a's end without being a
  // clean prefix (common when Android re-transcribes the tail of what was
  // already said) — merge instead of duplicating the overlapping words.
  var ow = ivwOverlapWordCount(a, b);
  if (ow > 0) {
    var bWords = b.split(/\s+/);
    var remainder = bWords.slice(ow).join(' ');
    return remainder ? (a + ' ' + remainder).trim() : a;
  }
  return (a + ' ' + b).trim();
}
function ivwFoldTranscript(base, addition) {
  var result = ivwFoldTranscriptCore(base, addition);
  // PART 2 — growth cap applied to EVERY path (including a single huge
  // addition landing on an empty base, not just the append branch) —
  // guards against a pathological runaway session. A real interview
  // answer is far under this ceiling, so this never affects normal use.
  if (result && result.length > 900) result = result.slice(0, 900) + '…';
  return result;
}

// PHASE: I6A-Stabilization — Part 2
// Collapse a transcript where the SAME sentence appears 2, 3, or more
// times — the exact "My name is Zahid... My name is Zahid..." bug from
// real-device testing, where the recognizer re-finalizes the whole
// utterance again as a "new" final chunk that ivwFoldTranscript's
// overlap logic doesn't fully catch (e.g. the repeat is the FULL
// multi-sentence answer, not just a trailing fragment). Splits on
// sentence punctuation, drops any sentence whose normalized form was
// already seen, and rejoins in original order/casing. Safe no-op on
// normal, non-repeating text.
function ivwCollapseRepeatedSentences(text) {
  var t = (text || '').trim();
  if (!t) return t;
  var parts = t.match(/[^.!?]+[.!?]*\s*/g);
  if (!parts || parts.length < 2) return t;
  var seen = {}, out = [];
  parts.forEach(function (raw) {
    var piece = raw.trim();
    if (!piece) return;
    var key = ivwNormForCompare(piece);
    if (!key || seen[key]) return;
    seen[key] = true;
    out.push(piece);
  });
  return out.join(' ').trim();
}

// PHASE I6A2 — Part 3 (final-fix safety net)
// Word-window repeat collapser. ivwCollapseRepeatedSentences only sees
// repeats that have sentence punctuation between them; on fast speech,
// Android can hand back several GROWING-PREFIX final chunks concatenated
// with NO punctuation at all (e.g. "...a student My name is Zahid I am
// a student I live..."), which the sentence splitter can't see as
// multiple sentences. This walks the word stream and, at each position,
// checks whether the upcoming words re-state a block that is already
// the TAIL of what's been kept — generalizing the pairwise overlap-merge
// idea (ivwOverlapWordCount) across the WHOLE token stream instead of
// just two adjacent fold() calls. Requires a 3-word minimum match to
// count as a "repeat" so it never collapses short coincidental phrases.
function ivwCollapseRepeatedPhrases(text) {
  var words = (text || '').trim().split(/\s+/).filter(Boolean);
  if (words.length < 6) return (text || '').trim();
  var norm = words.map(ivwNormForCompare);
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
    if (bestK > 0) {
      i += bestK; // the upcoming block is already in outWords — skip it
    } else {
      outWords.push(words[i]);
      outNorm.push(norm[i]);
      i++;
    }
  }
  return outWords.join(' ');
}

// PHASE I6A2 — Part 3
// The single cleanup pipeline applied at EVERY integration point (live
// transcript display during a burst, and the committed cross-burst
// accumulator) — sentence-level collapse first (cheap, precise, keeps
// natural punctuation), then the word-window collapse as a final safety
// net for whatever punctuation-free repeats remain. One function, used
// everywhere, so there is exactly one place that defines "clean."
function ivwFinalCleanTranscript(text) {
  var t = (text || '').trim();
  if (!t) return t;
  t = ivwCollapseRepeatedSentences(t);
  t = ivwCollapseRepeatedPhrases(t);
  return t;
}

// ─────────────────────────────────────────────────────────────
// VOICE WIZARD STATE
// ─────────────────────────────────────────────────────────────
const IVW = {
  autoMode:        false,   // Auto Wizard Mode toggle
  isSpeaking:      false,   // local guard — interview TTS is active
  recognition:     null,
  recognizing:     false,
  micSession:      0,       // PHASE I6A-Stabilization Part 3 — bumped on every
                             // ivwStartMic() call; onresult/onend/onerror compare
                             // their captured session id and discard stale events
                             // from a previous (already-superseded) mic instance.
  // PHASE I6A2 — Part 2: burst-chain state. Interview now listens using
  // SHORT continuous:false bursts (matching every other working mic
  // engine in the app) instead of one long continuous:true session, and
  // auto-restarts across a natural pause to still capture long answers.
  micShouldContinue:    false, // true while a multi-burst answer attempt is live
  micBurstStartTime:    0,     // Date.now() when burst #1 of this attempt began
  micBurstNoSpeechStreak: 0,   // consecutive bursts that captured nothing
  countdownTimer:  null,
  autoFlowTimer:   null,
  currentLesson:   null,
  currentTrack:    null,
  sampleVisible:   true,
  tipsVisible:     false,
  typeVisible:     false,
  userTranscript:  '',
  typedAnswer:     '',
  // PHASE I3 — teaching stage machine
  stage:           1,       // 1=teach question, 2=teach answer, 3=real practice
  scored:          false,   // current stage answer has been scored
  busy:            false,   // a guided step (TTS/countdown/mic) is running
  results:         [],      // per-question summary {q, ok, weak, missing}
  weakItems:       []       // questions the student should review
};

// ─────────────────────────────────────────────────────────────
// TTS SAFETY HELPERS
// These read the global guards set by app.js but never modify them.
// ─────────────────────────────────────────────────────────────
function ivwCanUseMic() {
  // Check the global Zirak TTS safety system
  if (typeof window.zirakIsTtsBlocking === 'function' && window.zirakIsTtsBlocking()) return false;
  if (typeof window.zirakIsTtsSpeaking !== 'undefined' && window.zirakIsTtsSpeaking) return false;
  // Also block if our own interview TTS is speaking
  if (IVW.isSpeaking) return false;
  return true;
}

function ivwGlobalAbortMic() {
  // Abort the global recognition system (dialogue, PE etc.)
  if (typeof window.zirakAbortRecognitionForTTS === 'function') {
    try { window.zirakAbortRecognitionForTTS(); } catch (e) {}
  }
  // Also abort our own local recognition. Returns true if OUR mic was
  // actually live, so callers (TTS) know whether a hardware-release
  // grace delay is warranted (PHASE I6A-Stabilization — Part 3).
  return ivwAbortLocalMic();
}

function ivwAbortLocalMic() {
  var wasActive = !!(IVW.recognition || IVW.recognizing);
  // PHASE I6A2 — Part 2: any reason for forcibly aborting the mic (TTS
  // about to speak, stage change, Clear Answer, etc.) must also stop the
  // burst-chain — otherwise a queued restart could re-open the mic right
  // after something else deliberately closed it.
  IVW.micShouldContinue = false;
  if (IVW.recognition) {
    try { IVW.recognition.abort(); } catch (e) {}
    IVW.recognition = null;
  }
  IVW.recognizing = false;
  return wasActive;
}

// ─────────────────────────────────────────────────────────────
// PHASE 2 — TTS ENGINE
// All interview TTS goes through these functions.
// They honour the global Zirak safety system.
// ─────────────────────────────────────────────────────────────

/**
 * Stop any currently-speaking interview TTS utterance.
 * Safe to call at any time.
 */
window.zirakInterviewStopSpeaking = function () {
  try {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {}
  IVW.isSpeaking = false;
};

/**
 * Speak English text via browser TTS.
 * Aborts any running mic first; sets IVW.isSpeaking guard.
 * @param {string} text
 * @param {function} [onDone]  called when speech ends
 */
window.zirakInterviewSpeak = function (text, onDone) {
  if (!text) { if (typeof onDone === 'function') onDone(); return; }

  if (!window.speechSynthesis) {
    ivwShowTtsUnavailable();
    if (typeof onDone === 'function') onDone();
    return;
  }

  // Abort any mic — both global and local. Capture whether OUR mic was
  // actually live (vs. just a no-op call) so we know whether a brief
  // hardware-release grace delay is needed before audio plays.
  var micWasActive = ivwGlobalAbortMic();

  // Stop previous utterance
  window.zirakInterviewStopSpeaking();

  function fireUtterance() {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = 'en-US';
    utter.rate  = (window.state && window.state.speechRate) ? window.state.speechRate : 1.0;

    IVW.isSpeaking = true;

    utter.onend = function () {
      IVW.isSpeaking = false;
      // PHASE I6A2 — Part 4: wait the global safety delay PLUS a small
      // Interview-only extra buffer before allowing the mic. The shared
      // global zirakTtsSafetyDelayMs (1200ms) is used by every other
      // working mic engine in the app and is deliberately left
      // untouched; IVW_EXTRA_TTS_GUARD_MS is added on top here ONLY for
      // Interview, landing the effective delay in the requested
      // 1500–1800ms range for the engine that showed the fast-speech
      // issue, without slowing down (or risking) anything else.
      const baseDelay = (typeof window.zirakTtsSafetyDelayMs !== 'undefined')
        ? window.zirakTtsSafetyDelayMs : 1200;
      const delay = baseDelay + IVW_EXTRA_TTS_GUARD_MS;
      setTimeout(function () {
        if (typeof onDone === 'function') onDone();
      }, delay);
    };
    utter.onerror = function () {
      IVW.isSpeaking = false;
      if (typeof onDone === 'function') onDone();
    };

    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      IVW.isSpeaking = false;
      if (typeof onDone === 'function') onDone();
    }
  }

  // PHASE I6A-Stabilization — Part 3 (hard audio mutex, root-cause fix)
  // rec.abort() is not guaranteed synchronous on every Android/Chrome
  // build — there can be a short window where the microphone hardware is
  // still technically open after .abort() returns. Starting TTS audio
  // immediately in that window is the most likely real-world cause of
  // the mic "hearing" the app's own sample-answer playback and feeding
  // it back into the transcript. A short, inaudible delay here closes
  // that race. Only applied when a mic actually WAS active, so normal
  // (no-mic-running) TTS calls are not slowed down at all.
  if (micWasActive) {
    setTimeout(fireUtterance, 80);
  } else {
    fireUtterance();
  }
};

/**
 * Speak the English question of a lesson.
 */
window.zirakInterviewSpeakQuestion = function (lesson, onDone) {
  if (!lesson) return;
  window.zirakInterviewSpeak(lesson.question_en, onDone);
};

/**
 * Speak the English sample answer of a lesson.
 */
window.zirakInterviewSpeakSample = function (lesson, onDone) {
  if (!lesson) return;
  window.zirakInterviewSpeak(ivwPersonalize(lesson.sample_answer_en), onDone);
};

/**
 * Speak a wizard guide line (short phrase).
 */
window.zirakInterviewSpeakWizard = function (text, onDone) {
  window.zirakInterviewSpeak(text, onDone);
};

// ─────────────────────────────────────────────────────────────
// PHASE 3 — MANUAL FLOW
// ─────────────────────────────────────────────────────────────
window.zirakInterviewStartManualQuestionFlow = function (lesson) {
  IVW.currentLesson = lesson;
  // PHASE: Teaching Display & Voice Professionalization Fix — Part 9
  ivwSetWizardMessage('Tap 🔊 Hear Question to listen, then repeat the question first.');
  ivwUpdateHearBtn('ready');
};

// ─────────────────────────────────────────────────────────────
// PHASE 4 — AUTO WIZARD FLOW
// ─────────────────────────────────────────────────────────────
window.zirakInterviewStartAutoQuestionFlow = function (lesson) {
  IVW.currentLesson = lesson;
  if (!IVW.autoMode) return;

  ivwSetWizardMessage('Get ready. Listen to the question.');

  // Small delay so user reads the wizard message, then speak
  clearTimeout(IVW.autoFlowTimer);
  IVW.autoFlowTimer = setTimeout(function () {
    window.zirakInterviewSpeakQuestion(lesson, function () {
      // After question ends, start countdown
      ivwStartCountdown(function () {
        // Countdown done — start mic if safe
        if (!ivwCanUseMic()) {
          ivwSetMicStatus('⚠️ Could not start mic — TTS still active. Tap 🎤 Speak Answer when ready.', 'warn');
          return;
        }
        ivwStartMic();
      });
    });
  }, 600);
};

// ─────────────────────────────────────────────────────────────
// MAIN PRACTICE OVERLAY — override iwRenderPractice
// This replaces the plain overlay from interview-core.js
// ─────────────────────────────────────────────────────────────
window.iwRenderPractice = function (track, lesson) {
  IVW.currentLesson  = lesson;
  IVW.currentTrack   = track;
  // PHASE: Teaching Display & Voice Professionalization Fix — Part 9
  // The sample answer is part of TEACHING the answer, not a hidden test
  // reveal — it must be visible by default. Students can still tap
  // "Hide Sample Answer" if they want to self-test without it.
  IVW.sampleVisible  = true;
  IVW.tipsVisible    = false;
  IVW.typeVisible    = false;
  IVW.userTranscript = '';
  IVW.typedAnswer    = '';
  // PHASE I3: every question starts at Stage 1 (teach the question).
  IVW.stage  = 1;
  IVW.scored = false;
  IVW.busy   = false;
  // Reset the whole-practice summary only when starting at the first question.
  var _idxNow = (window.IW && typeof IW.currentLessonIndex !== 'undefined') ? IW.currentLessonIndex : 0;
  if (_idxNow === 0) { IVW.results = []; IVW.weakItems = []; }

  // Stop any ongoing speech or mic
  window.zirakInterviewStopSpeaking();
  ivwAbortLocalMic();
  clearTimeout(IVW.countdownTimer);
  clearTimeout(IVW.autoFlowTimer);

  // Create or reuse overlay
  let overlay = document.getElementById('iw-practice-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'iw-practice-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Interview Voice Wizard');
    const app = document.getElementById('app');
    if (app) app.appendChild(overlay);
    else document.body.appendChild(overlay);
  }

  const total = (window.IW && IW.currentLessons) ? IW.currentLessons.length : 1;
  const idx   = (window.IW && typeof IW.currentLessonIndex !== 'undefined') ? IW.currentLessonIndex : 0;
  const pct   = total > 1 ? Math.round((idx / total) * 100) : 0;

  // ── Wizard message initial text ─────────────────────────
  const wizardMsg = IVW.autoMode
    ? 'Get ready. Listen to the question.'
    : 'Tap 🔊 Hear Question to begin. Then answer in English.';

  overlay.innerHTML = `
    <div class="iw-vw-panel" id="iw-vw-panel">

      <!-- ── HEADER ──────────────────────────────────── -->
      <div class="iw-vw-header">
        <button class="iw-vw-back-btn" onclick="ivwHandleClose()" aria-label="Close practice">✕ Exit</button>
        <div class="iw-vw-header-center">
          <span class="iw-vw-header-icon">🎤</span>
          <span class="iw-vw-header-title">${escIvw(track.title_en)}</span>
        </div>
        <button class="iw-vw-guide-btn" onclick="ivwShowStageGuide()" aria-label="How this works" title="How this works">❓ Guide</button>
        <div class="iw-vw-auto-wrap">
          <span class="iw-vw-auto-label">Auto</span>
          <label class="iw-vw-toggle" title="Auto Wizard Mode">
            <input type="checkbox" id="iw-vw-auto-check" ${IVW.autoMode ? 'checked' : ''}
              onchange="ivwToggleAutoMode(this.checked)">
            <span class="iw-vw-toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- ── PROGRESS ─────────────────────────────────── -->
      <div class="iw-vw-progress-bar">
        <div class="iw-vw-progress-fill" id="iw-vw-pfill" style="width:${pct}%"></div>
      </div>
      <div class="iw-vw-counter" id="iw-vw-counter">
        Question ${idx + 1} of ${total} · Level ${lesson.level || '?'} · ${lesson.cefr || ''}
      </div>

      <!-- ── WIZARD GUIDE ─────────────────────────────── -->
      <div class="iw-vw-wizard-area" id="iw-vw-wizard-area">
        <div class="iw-vw-wizard-avatar" aria-hidden="true">🧑‍💼</div>
        <div class="iw-vw-speech-bubble" id="iw-vw-wizard-msg">
          ${escIvw(wizardMsg)}
        </div>
      </div>

      <!-- ── TEACHING STAGE INDICATOR (PHASE I3) ──────── -->
      <div class="iw-vw-stage-strip" id="iw-vw-stage-strip" aria-live="polite">
        <div class="iw-vw-stage-step" id="iw-vw-stage-step-1"><span class="iw-vw-stage-dot">1</span><span class="iw-vw-stage-name">Question</span></div>
        <div class="iw-vw-stage-sep"></div>
        <div class="iw-vw-stage-step" id="iw-vw-stage-step-2"><span class="iw-vw-stage-dot">2</span><span class="iw-vw-stage-name">Answer</span></div>
        <div class="iw-vw-stage-sep"></div>
        <div class="iw-vw-stage-step" id="iw-vw-stage-step-3"><span class="iw-vw-stage-dot">3</span><span class="iw-vw-stage-name">Practice</span></div>
      </div>

      <!-- ── QUESTION CARD ────────────────────────────── -->
      <div class="iw-vw-question-card" id="iw-vw-question-card">
        <div class="iw-vw-q-label">Interview Question</div>
        <div class="iw-vw-q-en" id="iw-vw-q-en" lang="en">${escIvw(lesson.question_en)}</div>
        <div class="iw-vw-q-ps pashto" id="iw-vw-q-ps" dir="rtl" lang="ps">${escIvw(window.getPashtoText ? window.getPashtoText(lesson, 'question') : (lesson.question_ps || '')) || 'Pashto translation pending.'}</div>
      </div>

      <!-- ── HEAR / REPEAT BUTTONS ────────────────────── -->
      <div class="iw-vw-hear-row">
        <button class="iw-vw-btn iw-vw-btn-hear" id="iw-vw-hear-btn"
          onclick="ivwStageHear()" aria-label="Hear">
          🔊 Hear Question
        </button>
        <button class="iw-vw-btn iw-vw-btn-repeat" id="iw-vw-repeat-btn"
          onclick="ivwStageRepeat()" aria-label="Repeat">
          🔁 Repeat
        </button>
      </div>

      <!-- ── SPEAK AREA ────────────────────────────────── -->
      <div class="iw-vw-speak-section">

        <!-- Countdown display -->
        <div class="iw-vw-countdown" id="iw-vw-countdown" style="display:none;" aria-live="polite"></div>

        <!-- Mic status -->
        <div class="iw-vw-mic-status" id="iw-vw-mic-status" style="display:none;"></div>

        <!-- Animated mic ring (shown while listening) -->
        <div class="iw-vw-mic-ring-wrap" id="iw-vw-mic-ring-wrap" style="display:none;" aria-hidden="true">
          <div class="iw-vw-mic-ring"></div>
          <div class="iw-vw-mic-ring-inner">🎤</div>
        </div>

        <!-- Transcript -->
        <div class="iw-vw-transcript" id="iw-vw-transcript" style="display:none;"></div>

        <!-- Answer feedback (Phase 7) -->
        <div class="iw-vw-answer-hint" id="iw-vw-answer-hint" style="display:none;"></div>

        <!-- Speak / Stop / Type controls -->
        <div class="iw-vw-mic-row">
          <button class="iw-vw-btn iw-vw-btn-speak" id="iw-vw-speak-btn"
            onclick="ivwSpeakAnswerBtn()" aria-label="Speak Answer">
            🎤 Speak Answer
          </button>
          <button class="iw-vw-btn iw-vw-btn-stop" id="iw-vw-stop-btn"
            onclick="ivwStopMic()" aria-label="Stop Listening" style="display:none;">
            ⏹ Stop Listening
          </button>
          <button class="iw-vw-btn iw-vw-btn-type" id="iw-vw-type-btn"
            onclick="ivwToggleType()" aria-label="Type Answer">
            ⌨ Type Answer
          </button>
          <button class="iw-vw-btn iw-vw-btn-clear" id="iw-vw-clear-btn"
            onclick="ivwClearAnswer()" aria-label="Clear Answer">
            ✖ Clear
          </button>
        </div>

        <!-- Guided stage action (PHASE I3) -->
        <button class="iw-vw-btn iw-vw-btn-nextstep" id="iw-vw-nextstep-btn"
          onclick="ivwNextStep()" style="display:none;" aria-label="Next step">
          ✓ Next Step
        </button>
      </div>

      <!-- ── TYPE AREA ─────────────────────────────────── -->
      <div id="iw-vw-type-area" style="display:none; padding: 0 16px;">
        <textarea id="iw-vw-type-input"
          class="iw-vw-type-input"
          rows="3"
          placeholder="Type your answer here in English…"
          aria-label="Type your answer"
          oninput="ivwOnTypeInput(this.value)"></textarea>
      </div>

      <!-- ── SAMPLE ANSWER ─────────────────────────────── -->
      <div class="iw-vw-secondary-row">
        <button class="iw-vw-btn iw-vw-btn-sample" id="iw-vw-sample-btn"
          onclick="ivwToggleSample()" aria-label="${IVW.sampleVisible ? 'Hide Sample Answer' : 'Show Sample Answer'}">
          👀 ${IVW.sampleVisible ? 'Hide Sample Answer' : 'Show Sample Answer'}
        </button>
        <button class="iw-vw-btn iw-vw-btn-tips" id="iw-vw-tips-btn"
          onclick="ivwToggleTips()" aria-label="Tips">
          💡 Tips
        </button>
      </div>

      <!-- Sample area (hidden until shown) -->
      <div id="iw-vw-sample-area" class="iw-vw-sample-area" style="display:${IVW.sampleVisible ? 'block' : 'none'};">
        <div class="iw-vw-sample-label">Sample Answer</div>
        <div class="iw-vw-sample-en" id="iw-vw-sample-en" lang="en">${ivwSentenceSpans(ivwPersonalize(lesson.sample_answer_en || ''), 'iw-vw-sent')}</div>
        <div class="iw-vw-sample-ps pashto" id="iw-vw-sample-ps" dir="rtl" lang="ps">${escIvw(window.getPashtoText ? window.getPashtoText(lesson, 'sampleAnswer') : (lesson.sample_answer_ps || '')) || 'Pashto translation pending.'}</div>
        <button class="iw-vw-btn iw-vw-btn-hear-sample" id="iw-vw-hear-sample-btn"
          onclick="ivwHearSample()" aria-label="Hear Sample Answer">
          🔊 Hear Sample Answer
        </button>
      </div>

      <!-- Tips area (hidden until shown) -->
      <div id="iw-vw-tips-area" class="iw-vw-tips-area" style="display:none;">
        <div class="iw-vw-tips-label">💡 Tips</div>
        <ul class="iw-vw-tips-list">
          ${(lesson.tips_en || []).map(function (tip, i) {
            // PHASE I6A4 — Part 5: tips_dari is a legacy compat array kept
            // in sync with tips_ps by pashto-only-migration.js (same
            // Pashto text, not real Dari) — rendering both unconditionally
            // showed every tip's Pashto twice. One deduplicated line now,
            // via the shared helper, with the standard pending marker
            // instead of silently showing no Pashto at all when missing.
            var tipPs = window.getPashtoText
              ? window.getPashtoText({ ps: (lesson.tips_ps || [])[i], dari: (lesson.tips_dari || [])[i] }, 'default')
              : ((lesson.tips_ps && lesson.tips_ps[i]) || (lesson.tips_dari && lesson.tips_dari[i]) || '');
            var tipPsHtml = tipPs
              ? `<span class="iw-vw-tip-ps pashto" dir="rtl">${escIvw(tipPs)}</span>`
              : `<span class="iw-vw-tip-ps pashto pashto-pending-marker" dir="rtl">Pashto translation pending.</span>`;
            return `<li>
              <span class="iw-vw-tip-en">${escIvw(tip)}</span>
              ${tipPsHtml}
            </li>`;
          }).join('')}
        </ul>
      </div>

      <!-- ── NAVIGATION ────────────────────────────────── -->
      <div class="iw-vw-nav-row">
        <button class="iw-vw-btn iw-vw-btn-nav" id="iw-vw-prev-btn"
          onclick="ivwNav('prev')" ${idx === 0 ? 'disabled' : ''}>
          ← Previous
        </button>
        <button class="iw-vw-btn iw-vw-btn-nav iw-vw-btn-next" id="iw-vw-next-btn"
          onclick="ivwNav('next')">
          ${idx < total - 1 ? 'Next →' : 'Finish ✓'}
        </button>
      </div>

      <!-- Back to track -->
      <div style="text-align:center; padding: 0 16px 8px;">
        <button class="iw-vw-btn iw-vw-btn-back-track" onclick="ivwHandleClose()">
          ← Back to Track
        </button>
      </div>

      <!-- Bottom safe-area spacer -->
      <div style="height: calc(16px + env(safe-area-inset-bottom));"></div>
    </div>
  `;

  overlay.style.display = 'flex';

  // PHASE I3: enter the guided teaching stage machine at Stage 1.
  // (Auto vs Manual behaviour is handled inside ivwEnterStage.)
  ivwEnterStage(1);
};

// ─────────────────────────────────────────────────────────────
// CLOSE — override iwClosePractice
// ─────────────────────────────────────────────────────────────
window.iwClosePractice = function () {
  if (window.IW) IW.practiceOpen = false;
  window.zirakInterviewStopSpeaking();
  ivwAbortLocalMic();
  clearTimeout(IVW.countdownTimer);
  clearTimeout(IVW.autoFlowTimer);
  const overlay = document.getElementById('iw-practice-overlay');
  if (overlay) overlay.style.display = 'none';
};

function ivwHandleClose() {
  window.iwClosePractice();
}

// PHASE I6B3 — Part 7/14: mic-safe practice-stage guide. Opens a readable
// panel explaining the CURRENT stage (Question / Answer / Practice) plus how
// Sample / Tips / Feedback work. It never auto-speaks (that would fight the
// question/sample/feedback TTS and the mic). Opening it FIRST aborts the mic
// and cancels any speech, so there is never overlap. "Hear" goes through the
// interview TTS (which also aborts the mic), and the guide never loops.
function ivwShowStageGuide() {
  try { ivwAbortLocalMic(); } catch (e) {}
  try { window.zirakInterviewStopSpeaking(); } catch (e) {}

  var stage = (window.IVW && IVW.stage) ? IVW.stage : 1;
  var guideId = stage === 3 ? 'interview-practice-final'
              : stage === 2 ? 'interview-practice-answer'
              : 'interview-practice-question';

  var G = window.ZirakPageGuides;
  var g = (G && G.get) ? G.get(guideId) : null;

  var stepsHtml = '';
  if (g && g.stepsEn) {
    stepsHtml = '<ol class="iw-vw-guide-steps">' +
      g.stepsEn.map(function (s, i) {
        var p = (g.stepsPs && g.stepsPs[i]) ? g.stepsPs[i] : '';
        return '<li class="zk-readable">' + escIvw(s) +
          (p ? '<span class="zk-pashto-readable pashto" dir="rtl" lang="ps"> ' + escIvw(p) + '</span>' : '') +
        '</li>';
      }).join('') + '</ol>';
  }
  // Sample / Tips / Feedback explainer — shown on the Answer & Practice stages.
  var extra = '';
  if (stage >= 2) {
    extra =
      '<div class="iw-vw-guide-extra">' +
        '<div class="zk-readable"><b>Sample Answer:</b> a model answer. Learn its structure and key ideas — do not copy blindly. It can be read sentence by sentence.</div>' +
        '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">نمونه ځواب: یو بېلګه ییز ځواب. جوړښت او مهم ټکي یې زده کړه — ړوند مه کاپي کوه.</div>' +
        '<div class="zk-readable" style="margin-top:6px;"><b>Tips:</b> ideas to make your answer better before you speak or retry.</div>' +
        '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">لارښوونې: نظرونه چې ستا ځواب ښه کړي.</div>' +
        '<div class="zk-readable" style="margin-top:6px;"><b>Feedback:</b> tells you what was good and what to improve. Use it before moving forward.</div>' +
        '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">نظر: درته وايي څه ښه وو او څه باید ښه شي. مخکې له مخکې تلو یې وکاروه.</div>' +
      '</div>';
  }

  var m = document.getElementById('iw-vw-guide-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'iw-vw-guide-modal';
    m.className = 'iw-vw-guide-modal';
    (document.getElementById('app') || document.body).appendChild(m);
  }
  window.__ivwGuideScript = (g && G && G.script) ? G.script(guideId) : '';
  m.innerHTML =
    '<div class="iw-vw-guide-card" role="dialog" aria-modal="true" aria-label="How this stage works">' +
      '<div class="iw-vw-guide-head">' +
        '<span class="iw-vw-guide-title zk-readable">' + escIvw(g ? g.titleEn : 'How this works') + '</span>' +
        '<button type="button" class="iw-vw-guide-close zk-choice-readable" onclick="ivwCloseStageGuide()" aria-label="Close guide">✕</button>' +
      '</div>' +
      '<div class="iw-vw-guide-purpose zk-readable">' + escIvw(g ? g.purposeEn : '') + '</div>' +
      '<div class="zk-pashto-readable pashto" dir="rtl" lang="ps">' + escIvw((G && g) ? G.ps(g.purposePs) : '') + '</div>' +
      stepsHtml + extra +
      '<div class="iw-vw-guide-actions">' +
        '<button type="button" class="iw-vw-guide-hear zk-choice-readable" onclick="ivwHearStageGuide()">🔊 Hear Guide</button>' +
        '<button type="button" class="iw-vw-guide-ok zk-choice-readable" onclick="ivwCloseStageGuide()">Got it</button>' +
      '</div>' +
    '</div>';
  m.style.display = 'flex';
}
window.ivwShowStageGuide = ivwShowStageGuide;
window.ivwCloseStageGuide = function () {
  var m = document.getElementById('iw-vw-guide-modal');
  if (m) m.style.display = 'none';
  try { window.zirakInterviewStopSpeaking(); } catch (e) {}
};
window.ivwHearStageGuide = function () {
  try {
    if (window.__ivwGuideScript) window.zirakInterviewSpeak(window.__ivwGuideScript);
  } catch (e) {}
};

// ─────────────────────────────────────────────────────────────
// AUTO MODE TOGGLE
// ─────────────────────────────────────────────────────────────
function ivwToggleAutoMode(checked) {
  IVW.autoMode = !!checked;
  ivwSetWizardMessage(IVW.autoMode
    ? 'Auto Wizard Mode ON. Tap 🔊 Hear Question — mic will start automatically.'
    : 'Manual Mode. Tap 🔊 Hear Question, then 🎤 Speak Answer when ready.');
}

// ─────────────────────────────────────────────────────────────
// HEAR QUESTION
// ─────────────────────────────────────────────────────────────
function ivwHearQuestion() {
  if (!IVW.currentLesson) return;
  // PHASE: Teaching Display & Voice Professionalization Fix — Part 9
  ivwSetWizardMessage('Listen to the interview question. Repeat the question first.');
  ivwUpdateHearBtn('speaking');
  ivwSetMicStatus('', '');

  window.zirakInterviewSpeakQuestion(IVW.currentLesson, function () {
    ivwUpdateHearBtn('done');
    if (IVW.autoMode) {
      ivwSetWizardMessage('Now get ready to answer. Countdown starting…');
      ivwStartCountdown(function () {
        if (!ivwCanUseMic()) {
          ivwSetMicStatus('⚠️ Mic blocked. Tap 🎤 Speak Answer when ready.', 'warn');
          ivwSetWizardMessage('Tap 🎤 Speak Answer when you are ready.');
          return;
        }
        ivwStartMic();
      });
    } else {
      ivwSetWizardMessage('Good. The Sample Answer below shows a good answer — tap 🔊 Hear Sample Answer to learn it, then tap 🎤 Speak Answer when you are ready.');
    }
  });
}

function ivwRepeatQuestion() {
  if (!IVW.currentLesson) return;
  // Stop any running mic before repeating
  ivwAbortLocalMic();
  ivwSetMicStatus('', '');
  ivwSetWizardMessage('Repeating the question for you…');
  ivwUpdateHearBtn('speaking');

  window.zirakInterviewSpeakQuestion(IVW.currentLesson, function () {
    ivwUpdateHearBtn('done');
    ivwSetWizardMessage('You can repeat again anytime, or tap 🎤 Speak Answer.');
  });
}

function ivwUpdateHearBtn(state) {
  const btn = document.getElementById('iw-vw-hear-btn');
  if (!btn) return;
  if (state === 'speaking') {
    btn.textContent = '🔊 Speaking…';
    btn.disabled = true;
  } else {
    btn.textContent = '🔊 Hear Question';
    btn.disabled = false;
  }
}

// ─────────────────────────────────────────────────────────────
// SPEAK ANSWER BUTTON (manual tap)
// ─────────────────────────────────────────────────────────────
function ivwSpeakAnswerBtn() {
  if (!ivwCanUseMic()) {
    ivwSetMicStatus('⚠️ Please wait — the app is still speaking. Try again in a moment.', 'warn');
    return;
  }
  // If already recognizing, stop
  if (IVW.recognizing) {
    ivwStopMic();
    return;
  }
  // Show countdown then start mic
  ivwSetWizardMessage('Get ready to speak in English!');
  ivwStartCountdown(function () {
    if (!ivwCanUseMic()) {
      ivwSetMicStatus('⚠️ Mic blocked. Wait a moment and try again.', 'warn');
      return;
    }
    ivwStartMic();
  });
}

// ─────────────────────────────────────────────────────────────
// COUNTDOWN (3 – 2 – 1 – Speak)
// ─────────────────────────────────────────────────────────────
function ivwStartCountdown(onDone) {
  const el = document.getElementById('iw-vw-countdown');
  if (!el) { if (typeof onDone === 'function') onDone(); return; }

  el.style.display = 'block';
  const steps = ['3', '2', '1', '🎤 Speak!'];
  let i = 0;

  function tick() {
    el.textContent = steps[i];
    i++;
    if (i < steps.length) {
      IVW.countdownTimer = setTimeout(tick, 700);
    } else {
      IVW.countdownTimer = setTimeout(function () {
        el.style.display = 'none';
        if (typeof onDone === 'function') onDone();
      }, 500);
    }
  }
  tick();
}

// ─────────────────────────────────────────────────────────────
// MIC — START
// PHASE I6A2 — Part 2 (Interview Fast-Speech Transcript Final Fix)
//
// ROOT CAUSE FOUND: every OTHER mic engine in this app (main dialogue,
// Phonics, Quick Practice — 6 instances total) uses continuous:false.
// Interview Wizard was the ONLY one using continuous:true. On Android
// Chrome, continuous:true sessions can internally restart and re-emit
// overlapping/duplicate "final" results — far more aggressively under
// FAST speech, where there's less silence for the engine to anchor
// chunk boundaries on. That is the real cause of the repeated-answer
// bug returning specifically on fast speech.
//
// FIX: Interview now listens the SAME way every other working mic in
// the app does — short continuous:false bursts — and chains bursts
// together across a natural pause (instead of stopping after the
// first one) so long, multi-sentence answers are still fully captured.
// Each burst's clean final text is folded onto the running answer via
// the existing fold + ivwFinalCleanTranscript pipeline, so even if a
// burst boundary lands mid-overlap, the result still collapses
// correctly. A burst auto-restarts only while ALL of these hold:
//   - the student hasn't manually stopped / been interrupted by TTS
//     (IVW.micShouldContinue, cleared by ivwAbortLocalMic/ivwStopMic)
//   - the total elapsed time across the whole answer is under the cap
//   - we haven't just had 2 consecutive bursts with no speech in them
//     (2 quiet bursts in a row = the student is actually finished)
// ─────────────────────────────────────────────────────────────
var IVW_MAX_BURST_MS = 45000; // overall cap across all bursts of one answer

function ivwStartMic(retryCount, isBurstRestart) {
  retryCount = retryCount || 0;

  // PHASE I6A-Stabilization — Part 3 (hard audio mutex)
  // Never open the mic while TTS is speaking or inside the post-TTS
  // safety window. Under the normal flow (Hear → countdown → mic) this
  // is already true by construction, but this guard defends against any
  // race or direct call that might otherwise open the mic over live
  // audio — which is the most likely real-world cause of the mic
  // "hearing" the app's own voice and corrupting the transcript.
  if (!ivwCanUseMic()) {
    if (retryCount >= 12) { // ~3.6s of retries — surface a message instead of looping forever
      ivwSetMicStatus('⚠️ Audio is still busy. Tap 🎤 again in a moment.', 'warn');
      return;
    }
    try { window.zirakInterviewStopSpeaking(); } catch (e) {}
    if (typeof window.zirakAbortRecognitionForTTS === 'function') {
      try { window.zirakAbortRecognitionForTTS(); } catch (e) {}
    }
    setTimeout(function () { ivwStartMic(retryCount + 1, isBurstRestart); }, 300);
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    ivwSetMicStatus('⚠️ Speech recognition is not supported in this browser. Please type your answer.', 'warn');
    ivwSetWizardMessage('No mic available. Use ⌨ Type Answer instead.');
    return;
  }

  if (IVW.recognizing || IVW.recognition) {
    ivwAbortLocalMic();
  }

  let rec;
  try { rec = new SpeechRecognition(); } catch (e) {
    ivwSetMicStatus('⚠️ Could not start the microphone. Please try again.', 'warn');
    return;
  }

  // PHASE I6A-Stabilization — Part 3 (session token / stale-callback guard)
  // Bump the session id for THIS burst and capture it in the closure.
  // Each burst of the chain gets its own session id, so a late callback
  // from a SUPERSEDED burst (or a previous answer attempt entirely) is
  // always discarded rather than corrupting the current one.
  IVW.micSession = (IVW.micSession || 0) + 1;
  const mySession = IVW.micSession;

  IVW.recognition = rec;
  rec.lang = 'en-US';
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  // PHASE I6A2 — Part 2: continuous:false — see the function header above
  // for why. (Was continuous:true; that was the bug.)
  rec.continuous = false;

  if (!isBurstRestart) {
    // A genuinely NEW answer attempt (not a chained restart) — reset
    // everything and arm the burst-chain.
    IVW.userTranscript          = '';
    IVW.micShouldContinue       = true;
    IVW.micBurstStartTime       = Date.now();
    IVW.micBurstNoSpeechStreak  = 0;
    // PHASE I6A5 — Part E: reset the "have we scrolled the transcript
    // into view yet for THIS attempt" guard. Scoped to a fresh attempt
    // (not each burst-restart) so a multi-burst answer only scrolls
    // once, the first time real text appears — never repeatedly while
    // the student is still speaking.
    IVW.micTranscriptScrolled   = false;
    var oldHint = document.getElementById('iw-vw-answer-hint');
    if (oldHint) { oldHint.textContent = ''; oldHint.style.display = 'none'; }
    const transcriptEl = document.getElementById('iw-vw-transcript');
    if (transcriptEl) { transcriptEl.style.display = 'block'; transcriptEl.textContent = '…'; }
  }

  // PHASE: Interview Emergency Repair — Part 2 (strengthened I6A-Stabilization,
  // finalized I6A2). event.results is cumulative WITHIN a burst: each onresult
  // carries the full result list so far for THIS burst. We rebuild the
  // burst's transcript FRESH from index 0 on every event and fold growing
  // duplicates, instead of appending with `+=`. burstFinalClean holds the
  // current burst's clean final text only — it is folded onto the
  // cross-burst accumulator (IVW.userTranscript) once in onend, not here.
  let burstFinalClean = '';

  rec.onresult = function (event) {
    if (mySession !== IVW.micSession) return; // stale burst — ignore
    if (!ivwCanUseMic() || IVW.isSpeaking) {
      ivwAbortLocalMic();
      ivwSetMicStatus('⚠️ TTS interrupted — mic stopped safely.', 'warn');
      ivwResetMicUI();
      return;
    }
    var finalText = '';
    var interimText = '';
    for (let i = 0; i < event.results.length; i++) {
      const piece = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText = ivwFoldTranscript(finalText, piece);
      } else {
        interimText = ivwFoldTranscript(interimText, piece);
      }
    }
    burstFinalClean = ivwFinalCleanTranscript(finalText);
    // Live display = everything already committed from PRIOR bursts +
    // this burst's current final/interim text, so the box shows the
    // full answer-so-far across the whole chain, not just this burst.
    var liveDisplay = ivwFoldTranscript(IVW.userTranscript, ivwFoldTranscript(burstFinalClean, interimText));
    liveDisplay = ivwFinalCleanTranscript(liveDisplay);
    const el = document.getElementById('iw-vw-transcript');
    if (el) {
      el.style.display = 'block';
      el.textContent = liveDisplay;
      // PHASE I6A5 — Part E: the transcript box can end up below the
      // fold (especially with the on-screen keyboard / mic UI taking
      // space) — scroll it into view the FIRST time real text appears
      // for this attempt, so the student can see what was captured.
      // Guarded so this fires once per attempt, not on every interim
      // update (which would jar/scroll repeatedly mid-sentence).
      if (liveDisplay && !IVW.micTranscriptScrolled) {
        IVW.micTranscriptScrolled = true;
        if (typeof window.scrollLearningElementIntoView === 'function') {
          window.scrollLearningElementIntoView(el, { block: 'center' });
        } else {
          try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
        }
      }
    }
  };

  rec.onend = function () {
    if (mySession !== IVW.micSession) return; // stale burst — ignore
    IVW.recognizing = false;
    IVW.recognition = null;

    // Commit this burst's content onto the cross-burst accumulator.
    if (burstFinalClean) {
      IVW.userTranscript = ivwFinalCleanTranscript(ivwFoldTranscript(IVW.userTranscript, burstFinalClean));
      IVW.micBurstNoSpeechStreak = 0;
    } else {
      IVW.micBurstNoSpeechStreak++;
    }

    var elapsed = Date.now() - IVW.micBurstStartTime;
    var shouldContinue = IVW.micShouldContinue
                          && elapsed < IVW_MAX_BURST_MS
                          && IVW.micBurstNoSpeechStreak < 2;

    if (shouldContinue) {
      // PHASE I6A2 — Part 2: chain the next burst after a brief gap —
      // long enough to avoid a jarring instant restart, short enough
      // that a natural mid-answer pause never feels like the mic gave
      // up. The mic-active UI is deliberately left untouched here (no
      // reset/flicker) so listening visually feels continuous.
      setTimeout(function () {
        if (mySession !== IVW.micSession) return;   // superseded while waiting
        if (!IVW.micShouldContinue) return;          // stopped/interrupted while waiting
        ivwStartMic(0, true);
      }, 220);
      return;
    }

    // Truly done — same grace-pause-then-score behavior as before.
    ivwResetMicUI();
    setTimeout(function () {
      if (mySession !== IVW.micSession) return; // a newer session started during the pause
      ivwSetMicStatus('✅ Done listening.', 'done');
      // PHASE I3: score the answer for the CURRENT teaching stage and give
      // visible + spoken feedback. Auto mode advances after feedback TTS.
      ivwScoreCurrentStage(IVW.userTranscript);
    }, 400);
  };

  rec.onerror = function (event) {
    if (mySession !== IVW.micSession) return; // stale burst — ignore
    var errType = event && event.error;
    IVW.recognizing = false;
    IVW.recognition = null;
    if (errType === 'no-speech') {
      // Expected during a natural pause in continuous:false bursts — the
      // onend handler that fires right after this decides continue-vs-
      // stop based on the no-speech streak. No warning, no UI reset
      // here, so a brief pause never feels like the mic gave up.
      return;
    }
    // Any other error is real — stop the burst-chain.
    IVW.micShouldContinue = false;
    ivwResetMicUI();
    if (errType === 'aborted') {
      ivwSetMicStatus('', '');
    } else {
      ivwSetMicStatus('⚠️ Mic error: ' + (errType || 'unknown'), 'warn');
    }
  };

  try {
    rec.start();
    IVW.recognizing = true;
    ivwSetActiveMicUI();
    ivwSetMicStatus('🔴 Listening… speak your answer in English', 'active');
    if (!isBurstRestart) {
      ivwSetWizardMessage('Listening now… speak clearly in English.');
    }
  } catch (e) {
    IVW.recognizing = false;
    IVW.recognition = null;
    ivwResetMicUI();
    if (e && e.name === 'InvalidStateError') {
      ivwSetMicStatus('⚠️ Mic was already active. Tap 🎤 Speak Answer again.', 'warn');
    } else {
      ivwSetMicStatus('⚠️ Could not start microphone. Please try again.', 'warn');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// MIC — STOP (user taps ⏹)
// ─────────────────────────────────────────────────────────────
function ivwStopMic() {
  // PHASE I6A2 — Part 2: a manual stop means "I'm done" — never chain
  // another burst after this. Uses .stop() (not .abort()) so the browser
  // still finalizes whatever was captured in the current burst before
  // onend fires, instead of discarding it.
  IVW.micShouldContinue = false;
  if (IVW.recognition) {
    try { IVW.recognition.stop(); } catch (e) {}
  }
  IVW.recognizing = false;
  ivwResetMicUI();
}

// PHASE: Interview Emergency Repair — Part 2
// Clear Answer — wipes the current transcript, hint and stored answer so a
// student can restart an answer cleanly. Safe to call any time; if the mic
// is live it is stopped first. Does not advance or score.
function ivwClearAnswer() {
  try { ivwAbortLocalMic(); } catch (e) {}
  IVW.userTranscript = '';
  IVW.typedAnswer = '';
  var t = document.getElementById('iw-vw-transcript');
  if (t) { t.textContent = ''; t.style.display = 'none'; }
  var hint = document.getElementById('iw-vw-answer-hint');
  if (hint) { hint.textContent = ''; hint.style.display = 'none'; }
  var typed = document.getElementById('iw-vw-type-input');
  if (typed) typed.value = '';
  ivwSetMicStatus('', '');
  ivwSetWizardMessage('Answer cleared. Tap 🎤 Speak Answer to try again.');
}
window.ivwClearAnswer = ivwClearAnswer;

// ─────────────────────────────────────────────────────────────
// MIC UI helpers
// ─────────────────────────────────────────────────────────────
function ivwSetActiveMicUI() {
  const speakBtn = document.getElementById('iw-vw-speak-btn');
  const stopBtn  = document.getElementById('iw-vw-stop-btn');
  const ring     = document.getElementById('iw-vw-mic-ring-wrap');

  if (speakBtn) speakBtn.style.display = 'none';
  if (stopBtn)  stopBtn.style.display  = 'inline-flex';
  if (ring)     ring.style.display     = 'flex';
}

function ivwResetMicUI() {
  const speakBtn = document.getElementById('iw-vw-speak-btn');
  const stopBtn  = document.getElementById('iw-vw-stop-btn');
  const ring     = document.getElementById('iw-vw-mic-ring-wrap');

  if (speakBtn) speakBtn.style.display = 'inline-flex';
  if (stopBtn)  stopBtn.style.display  = 'none';
  if (ring)     ring.style.display     = 'none';
}

// ─────────────────────────────────────────────────────────────
// PHASE 7 — SIMPLE ANSWER HELPER
// ─────────────────────────────────────────────────────────────
function ivwShowAnswerHint(answer) {
  const el = document.getElementById('iw-vw-answer-hint');
  if (!el) return;

  const text = (answer || IVW.typedAnswer || '').trim();
  const words = text.split(/\s+/).filter(function (w) { return w.length > 0; });

  let msg = '';
  if (!text) {
    msg = '💬 Try to say one complete sentence in English.';
  } else if (words.length < 5) {
    msg = '👍 Good start. Try to add more detail to your answer.';
  } else {
    msg = '✅ Good effort! Compare your answer with the sample below.';
  }

  el.textContent = msg;
  el.style.display = 'block';
}

function ivwOnTypeInput(value) {
  IVW.typedAnswer = value;
  ivwShowAnswerHint(value);
}

// ─────────────────────────────────────────────────────────────
// SAMPLE ANSWER
// ─────────────────────────────────────────────────────────────
function ivwToggleSample() {
  IVW.sampleVisible = !IVW.sampleVisible;
  const area = document.getElementById('iw-vw-sample-area');
  const btn  = document.getElementById('iw-vw-sample-btn');
  if (area) area.style.display = IVW.sampleVisible ? 'block' : 'none';
  if (btn)  btn.textContent    = IVW.sampleVisible ? '👀 Hide Sample Answer' : '👀 Show Sample Answer';
  if (IVW.sampleVisible) {
    ivwSetWizardMessage('Read the sample answer. Tap 🔊 Hear Sample Answer to listen.');
    // PHASE I6A5B — Part 3: bring the sample card into comfortable view
    // the moment it's revealed — this was the exact area the floating
    // chip was overlapping in the reported screenshot.
    if (area) {
      if (typeof window.scrollLearningElementIntoView === 'function') {
        window.scrollLearningElementIntoView(area, { block: 'center' });
      } else {
        try { area.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      }
    }
  }
}

// PHASE I6A5B — Part 5: sample answer is now read sentence-by-sentence
// with each sentence highlighted and scrolled into view as it's spoken
// (via the shared window.zirakSpeakChain — same engine as Grammar
// World's Read Full Lesson). The existing mic-safety mutex (abort any
// live mic first, wait a brief hardware-release grace, then the
// standard extended post-TTS delay before re-enabling controls) is
// fully preserved — only HOW the speech itself is delivered changed,
// not the surrounding safety behavior.
function ivwHearSample() {
  if (!IVW.currentLesson) return;
  var lesson = IVW.currentLesson;
  var sampleText = ivwPersonalize(lesson.sample_answer_en || '');
  var sentences = (typeof window.zirakSplitSentences === 'function')
    ? window.zirakSplitSentences(sampleText)
    : [sampleText];
  if (!sentences.length) return;

  // Clear any stale highlight from a previous, possibly-interrupted run.
  var stale = document.querySelectorAll('.iw-vw-sent-active');
  for (var k = 0; k < stale.length; k++) stale[k].classList.remove('iw-vw-sent-active');

  // Mic-safety pre-flight — identical pattern to zirakInterviewSpeak:
  // abort any live mic first; if one WAS active, wait the same brief
  // hardware-release grace before starting audio.
  window.zirakInterviewStopSpeaking();
  var micWasActive = ivwGlobalAbortMic();
  ivwResetMicUI();

  const btn = document.getElementById('iw-vw-hear-sample-btn');
  if (btn) { btn.textContent = '🔊 Speaking…'; btn.disabled = true; }
  ivwSetWizardMessage('This is a good answer. Listen and repeat the answer.');

  function finishUp() {
    // Same extended post-TTS safety delay zirakInterviewSpeak uses,
    // before restoring the button / signalling it's safe to speak again.
    var baseDelay = (typeof window.zirakTtsSafetyDelayMs !== 'undefined') ? window.zirakTtsSafetyDelayMs : 1200;
    setTimeout(function () {
      if (btn) { btn.textContent = '🔊 Hear Sample Answer'; btn.disabled = false; }
      ivwSetWizardMessage('Now you try. Tap 🎤 Speak Answer and repeat the answer in English.');
    }, baseDelay + IVW_EXTRA_TTS_GUARD_MS);
  }

  function startChain() {
    if (typeof window.zirakSpeakChain !== 'function') {
      // Defensive fallback if the shared chain is ever unavailable —
      // falls back to the previous single-utterance behavior rather
      // than the sample going silent.
      window.zirakInterviewSpeakSample(lesson, finishUp);
      return;
    }
    var segments = sentences.map(function (s, i) { return { text: s, spanId: 'iw-vw-sent-' + i }; });
    window.zirakSpeakChain(segments, {
      pauseMs: 400, // Part 9: calm pacing between sentences, not rushed
      onSegmentStart: function (seg) {
        var el = document.getElementById(seg.spanId);
        if (!el) return;
        el.classList.add('iw-vw-sent-active');
        if (typeof window.scrollLearningElementIntoView === 'function') {
          window.scrollLearningElementIntoView(el, { block: 'center' });
        } else {
          try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
        }
      },
      onSegmentEnd: function (seg) {
        var el = document.getElementById(seg.spanId);
        if (el) el.classList.remove('iw-vw-sent-active');
      },
      onAllDone: finishUp
    });
  }

  if (micWasActive) { setTimeout(startChain, 80); } else { startChain(); }
}

// ─────────────────────────────────────────────────────────────
// TIPS
// ─────────────────────────────────────────────────────────────
function ivwToggleTips() {
  IVW.tipsVisible = !IVW.tipsVisible;
  const area = document.getElementById('iw-vw-tips-area');
  const btn  = document.getElementById('iw-vw-tips-btn');
  if (area) area.style.display = IVW.tipsVisible ? 'block' : 'none';
  if (btn)  btn.textContent    = IVW.tipsVisible ? '💡 Hide Tips' : '💡 Tips';
}

// ─────────────────────────────────────────────────────────────
// TYPE ANSWER
// ─────────────────────────────────────────────────────────────
function ivwToggleType() {
  IVW.typeVisible = !IVW.typeVisible;
  const area = document.getElementById('iw-vw-type-area');
  const btn  = document.getElementById('iw-vw-type-btn');
  if (area) area.style.display = IVW.typeVisible ? 'block' : 'none';
  if (btn)  btn.textContent    = IVW.typeVisible ? '⌨ Hide Keyboard' : '⌨ Type Answer';
}

// ─────────────────────────────────────────────────────────────
// NAVIGATION (prev / next)
// ─────────────────────────────────────────────────────────────
function ivwNav(dir) {
  // Stop TTS and mic before navigating
  window.zirakInterviewStopSpeaking();
  ivwAbortLocalMic();
  clearTimeout(IVW.countdownTimer);
  clearTimeout(IVW.autoFlowTimer);

  var total = (window.IW && IW.currentLessons) ? IW.currentLessons.length : 1;
  var idx   = (window.IW && typeof IW.currentLessonIndex !== 'undefined') ? IW.currentLessonIndex : 0;

  if (dir === 'next') {
    // PHASE I3: on the LAST question, "Finish" shows our professional summary
    // (with weak items + a working next action) instead of the old core alert.
    if (idx >= total - 1) { ivwShowFinishSummary(); return; }
    if (typeof window.iwNextLesson === 'function') window.iwNextLesson();
  } else {
    if (typeof window.iwPrevLesson === 'function') window.iwPrevLesson();
  }
}

// ─────────────────────────────────────────────────────────────
// STATUS / MESSAGE HELPERS
// ─────────────────────────────────────────────────────────────
function ivwSetWizardMessage(msg) {
  const el = document.getElementById('iw-vw-wizard-msg');
  if (el) el.textContent = msg;
}

function ivwSetMicStatus(msg, type) {
  const el = document.getElementById('iw-vw-mic-status');
  if (!el) return;
  if (!msg) { el.style.display = 'none'; el.textContent = ''; return; }
  el.style.display = 'block';
  el.textContent   = msg;
  el.className     = 'iw-vw-mic-status iw-vw-mic-' + (type || 'info');
}

function ivwShowTtsUnavailable() {
  ivwSetWizardMessage('🔇 Text-to-speech is not available in this browser. You can still read the question and type your answer.');
  ivwSetMicStatus('TTS not available — text practice still works.', 'warn');
}

// ─────────────────────────────────────────────────────────────
// HTML ESCAPE (local copy — does not depend on interview-core.js
// escHtml being available at module evaluation time)
// ─────────────────────────────────────────────────────────────
function escIvw(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// PHASE I6A5B — Part 5: wraps text in individually-addressable,
// per-sentence <span> elements so the chained sample-answer reader can
// scroll+highlight exactly the sentence currently being spoken. Uses
// the shared window.zirakSplitSentences() splitter (app.js) with a
// local fallback if it's ever unavailable. Every piece is escaped via
// escIvw before insertion — safe against XSS, no raw HTML from content
// data ever reaches the page. idPrefix must be a simple id-safe string
// (only used with fixed literal prefixes from this file, never with
// user/content-controlled text).
function ivwSentenceSpans(text, idPrefix) {
  var raw = String(text || '');
  var sentences = (typeof window.zirakSplitSentences === 'function')
    ? window.zirakSplitSentences(raw)
    : (raw.match(/[^.!?]+[.!?]*(\s+|$)/g) || [raw]).map(function (s) { return s.trim(); }).filter(Boolean);
  if (!sentences.length) return '';
  return sentences.map(function (s, i) {
    return '<span id="' + idPrefix + '-' + i + '" class="' + idPrefix + '">' + escIvw(s) + '</span>';
  }).join(' ');
}

// ═════════════════════════════════════════════════════════════
// PHASE I3 — TEACHING STAGE MACHINE
// Stage 1: teach the question (hear → repeat → feedback)
// Stage 2: teach the answer  (hear sample → repeat → feedback)
// Stage 3: real practice     (question only → answer → feedback)
// Auto mode runs each stage automatically and advances after feedback.
// Manual mode shows a "Next Step" button and keeps every button working.
// The I2 transcript fold/dedup fix in ivwStartMic.onresult is untouched.
// ═════════════════════════════════════════════════════════════

function ivwName() {
  try {
    var w = (typeof window.zirakActiveStudentName === 'function') ? window.zirakActiveStudentName() : null;
    if (w && w.hasStudent && w.firstName) return w.firstName;
  } catch (e) {}
  return '';
}

// Speak an array of texts one after another, then call done().
function ivwSpeakSeq(parts, done) {
  var i = 0;
  function next() {
    if (i >= parts.length) { if (typeof done === 'function') done(); return; }
    var p = parts[i++];
    if (!p) { next(); return; }
    window.zirakInterviewSpeak(p, next);
  }
  next();
}

// ── Stage entry ──────────────────────────────────────────────
function ivwEnterStage(n) {
  IVW.stage  = n;
  IVW.scored = false;
  IVW.busy   = false;
  IVW.userTranscript = '';
  // Clear transcript + feedback so nothing leaks between stages.
  var t = document.getElementById('iw-vw-transcript'); if (t) { t.textContent = ''; t.style.display = 'none'; }
  var h = document.getElementById('iw-vw-answer-hint'); if (h) { h.textContent = ''; h.style.display = 'none'; h.className = 'iw-vw-answer-hint'; }
  ivwResetMicUI();
  ivwSetMicStatus('', '');
  var nb = document.getElementById('iw-vw-nextstep-btn'); if (nb) nb.style.display = 'none';
  ivwUpdateStageUI();

  var name = ivwName();
  if (n === 1)      ivwSetWizardMessage('Step 1: Listen to the interview question, then repeat it. Tap 🔊 Hear Question.');
  else if (n === 2) ivwSetWizardMessage('Step 2: This is a good answer. Listen, then repeat it. Tap 🔊 Hear Answer.');
  else              ivwSetWizardMessage((name ? 'Step 3, ' + name + ': ' : 'Step 3: ') + 'Answer the question from memory. Tap 🎤 Speak Your Answer.');

  if (IVW.autoMode) {
    clearTimeout(IVW.autoFlowTimer);
    IVW.autoFlowTimer = setTimeout(function () { ivwStageHear(); }, 700);
  }
}

// ── Stage UI (indicator dots, button labels, sample visibility) ──
function ivwUpdateStageUI() {
  var st = IVW.stage;
  for (var i = 1; i <= 3; i++) {
    var el = document.getElementById('iw-vw-stage-step-' + i);
    if (el) {
      el.classList.remove('active', 'done');
      if (i < st) el.classList.add('done');
      else if (i === st) el.classList.add('active');
    }
  }
  var hb = document.getElementById('iw-vw-hear-btn');
  if (hb) { hb.textContent = (st === 2) ? '🔊 Hear Answer' : '🔊 Hear Question'; hb.disabled = false; }
  var sb = document.getElementById('iw-vw-speak-btn');
  if (sb) sb.textContent = (st === 1) ? '🎤 Repeat Question' : (st === 2) ? '🎤 Repeat Answer' : '🎤 Speak Your Answer';
  // Teaching stages keep the sample visible (Stage 2); real practice (Stage 3)
  // hides it by default to test memory — the Show/Hide button still works.
  var showSample = (st === 2);
  IVW.sampleVisible = showSample;
  var area = document.getElementById('iw-vw-sample-area');
  if (area) area.style.display = showSample ? 'block' : 'none';
  var smb = document.getElementById('iw-vw-sample-btn');
  if (smb) smb.textContent = showSample ? '👀 Hide Sample Answer' : '👀 Show Sample Answer';
}

// ── Hear (teach) for the current stage ───────────────────────
function ivwStageHear() {
  if (!IVW.currentLesson || IVW.busy) return;
  ivwAbortLocalMic();
  ivwResetMicUI();
  var L = IVW.currentLesson, st = IVW.stage;
  IVW.busy = true;
  ivwUpdateHearBtn('speaking');

  var parts;
  if (st === 1)      parts = ['Listen to the interview question.', L.question_en];
  else if (st === 2) parts = ['This is a good answer. Listen carefully.', ivwPersonalize(L.sample_answer_en || '')];
  else               parts = [L.question_en];

  ivwSpeakSeq(parts, function () {
    IVW.busy = false;
    ivwUpdateHearBtn('done');
    if (st < 3) {
      var prompt = (st === 1) ? 'Now repeat the question.' : 'Now repeat the answer.';
      ivwSetWizardMessage(prompt + ' Tap 🎤 when you are ready.');
      if (IVW.autoMode) { window.zirakInterviewSpeak(prompt, function () { ivwStageStartMicAuto(); }); }
    } else {
      var nm = ivwName();
      ivwSetWizardMessage((nm ? nm + ', answer' : 'Answer') + ' in your own words. Tap 🎤 Speak Your Answer.');
      if (IVW.autoMode) { ivwStageStartMicAuto(); }
    }
  });
}

// ── Repeat the current stage's audio (no auto mic) ───────────
function ivwStageRepeat() {
  if (!IVW.currentLesson || IVW.busy) return;
  ivwAbortLocalMic();
  var L = IVW.currentLesson, st = IVW.stage;
  IVW.busy = true;
  ivwUpdateHearBtn('speaking');
  var content = (st === 2) ? ivwPersonalize(L.sample_answer_en || '') : L.question_en;
  window.zirakInterviewSpeak(content, function () { IVW.busy = false; ivwUpdateHearBtn('done'); });
}

// ── Auto: countdown then mic (mic patience guards apply) ─────
function ivwStageStartMicAuto() {
  ivwStartCountdown(function () {
    if (!ivwCanUseMic()) {
      ivwSetMicStatus('⚠️ Mic blocked — tap 🎤 when ready.', 'warn');
      return;
    }
    ivwStartMic();
  });
}

// ── Tokenizing + scoring (simple, safe — Part 6) ─────────────
var IVW_STOP = { a:1,an:1,the:1,is:1,am:1,are:1,was:1,were:1,be:1,been:1,to:1,of:1,for:1,and:1,or:1,
  in:1,on:1,at:1,it:1,its:1,i:1,you:1,he:1,she:1,we:1,they:1,me:1,my:1,your:1,his:1,her:1,our:1,their:1,
  this:1,that:1,these:1,those:1,with:1,do:1,does:1,did:1,can:1,will:1,would:1,please:1,so:1,as:1,but:1,
  hello:1,hi:1,thanks:1,thank:1 };

function ivwTokens(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/)
    .filter(function (w) { return w.length > 1 && !IVW_STOP[w]; });
}
function ivwTopWords(text, n) {
  var t = ivwTokens(text), seen = {}, out = [];
  for (var i = 0; i < t.length && out.length < n; i++) { if (!seen[t[i]]) { seen[t[i]] = 1; out.push(t[i]); } }
  return out;
}
function ivwOverlapRatio(said, target) {
  var s = ivwTokens(said), tk = ivwTokens(target);
  if (!tk.length) return said ? 1 : 0;
  var sset = {}; s.forEach(function (w) { sset[w] = 1; });
  var hit = 0; tk.forEach(function (w) { if (sset[w]) hit++; });
  return hit / tk.length;
}

function ivwEvaluateStage(st, said, L) {
  if (!said || !said.trim()) return { ok:false, ratio:0, missing:[], empty:true };
  if (st === 1) { var r1 = ivwOverlapRatio(said, L.question_en); return { ok: r1 >= 0.45, ratio:r1, missing:[], empty:false }; }
  if (st === 2) { var r2 = ivwOverlapRatio(said, ivwPersonalize(L.sample_answer_en || '')); return { ok: r2 >= 0.40, ratio:r2, missing:[], empty:false }; }
  // Stage 3 — meaning/keyword check.
  var kws = (L.keywords && L.keywords.length) ? L.keywords.slice() : ivwTopWords(L.sample_answer_en, 5);
  var saidToks = ivwTokens(said);
  var nameTok = ivwName() ? ivwName().toLowerCase() : '';
  var covered = [], missing = [];
  kws.forEach(function (k) {
    var kt = String(k).toLowerCase();
    var hit = false;
    if (kt === 'name') {
      // Accept the active student's profile name, the sample placeholder names,
      // or the word "name" — a student saying their own name is NEVER wrong.
      if (nameTok && saidToks.indexOf(nameTok) >= 0) hit = true;
      ['ahmad', 'ahmed', 'fatima', 'omar'].forEach(function (n) { if (saidToks.indexOf(n) >= 0) hit = true; });
      if (saidToks.indexOf('name') >= 0) hit = true;
    } else {
      var ps = kt.split(/\s+/);
      hit = ps.some(function (p) { return saidToks.indexOf(p) >= 0; });
    }
    if (hit) covered.push(kt); else missing.push(kt);
  });
  var ratio = kws.length ? covered.length / kws.length : 0;
  return { ok: (ratio >= 0.40 || covered.length >= 2), ratio:ratio, missing:missing, empty:false };
}

function ivwBuildFeedback(st, res, name) {
  var who = name ? ', ' + name : '';
  if (res.empty) {
    return { visible: '🔁 ' + (name ? name + ', ' : '') + 'I didn’t hear you. Tap 🎤 and speak in English.',
             spoken:  (name ? name + ', ' : '') + 'I did not hear you. Tap the microphone and speak in English.' };
  }
  if (st === 1) {
    if (res.ok) return { visible: '✅ Good job' + who + '. You repeated the question clearly.',
                         spoken:  'Good job' + who + '. You repeated the question clearly.' };
    return { visible: '🔁 Try again' + who + '. Listen to the question and repeat it slowly.',
             spoken:  'Try again' + who + '. Listen to the question and repeat it slowly.' };
  }
  if (st === 2) {
    if (res.ok) return { visible: '✅ Good effort' + who + '. Your answer is understandable.',
                         spoken:  'Good effort' + who + '. Your answer is understandable.' };
    return { visible: '🔁 Try again. Your answer should include your name and your reason.',
             spoken:  'Try again. Your answer should include your name and your reason.' };
  }
  // Stage 3
  if (res.ok) return { visible: '✅ Good' + who + '. You included the key points in your answer.',
                       spoken:  'Good' + who + '. You included the key points in your answer.' };
  var miss = (res.missing || []).filter(function (m) { return m; }).slice(0, 3).join(', ');
  var add = miss ? ' Your answer should also include: ' + miss + '.' : ' Add more detail to your answer.';
  return { visible: '🔁 Try again' + who + '.' + add,
           spoken:  'Try again' + who + '.' + add };
}

function ivwRecordStage3(res, L) {
  var ps = (window.getPashtoText ? window.getPashtoText(L, 'question') : (L.question_ps || '')) || 'Pashto translation pending.';
  var rec = { q: L.question_en, ps: ps, ok: !!res.ok };
  IVW.results.push(rec);
  if (!res.ok) {
    var exists = IVW.weakItems.some(function (w) { return w.q === rec.q; });
    if (!exists) IVW.weakItems.push(rec);
  }
}

// ── Score the current stage, give visible + spoken feedback ──
function ivwScoreCurrentStage(transcript) {
  if (!IVW.currentLesson) return;
  var said = (transcript || '').trim();
  var L = IVW.currentLesson, st = IVW.stage, name = ivwName();
  var res = ivwEvaluateStage(st, said, L);
  var fb  = ivwBuildFeedback(st, res, name);

  var hint = document.getElementById('iw-vw-answer-hint');
  if (hint) {
    hint.textContent = fb.visible;
    hint.style.display = 'block';
    hint.className = 'iw-vw-answer-hint ' + (res.ok ? 'iw-vw-ah-good' : 'iw-vw-ah-retry');
    // PHASE I6A5 — Part D: bring the feedback into view — it can land
    // below the fold after a multi-line transcript/question, leaving
    // the student looking at an empty area while feedback is spoken.
    if (typeof window.scrollLearningElementIntoView === 'function') {
      window.scrollLearningElementIntoView(hint, { block: 'center' });
    } else {
      try { hint.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    }
  }
  ivwSetWizardMessage(fb.visible);
  IVW.scored = true;
  if (st === 3) ivwRecordStage3(res, L);

  window.zirakInterviewSpeak(fb.spoken, function () {
    if (IVW.autoMode) {
      // Auto mode advances only AFTER feedback TTS has finished.
      clearTimeout(IVW.autoFlowTimer);
      IVW.autoFlowTimer = setTimeout(function () { ivwNextStep(); }, 350);
    } else {
      var b = document.getElementById('iw-vw-nextstep-btn');
      if (b) b.style.display = 'inline-flex';
      ivwUpdateNextStepLabel();
    }
  });
}

function ivwUpdateNextStepLabel() {
  var b = document.getElementById('iw-vw-nextstep-btn');
  if (!b) return;
  if (IVW.stage < 3) { b.textContent = (IVW.stage === 1) ? '✓ Next: Learn the Answer' : '✓ Next: Real Practice'; return; }
  var total = (window.IW && IW.currentLessons) ? IW.currentLessons.length : 1;
  var idx   = (window.IW && typeof IW.currentLessonIndex !== 'undefined') ? IW.currentLessonIndex : 0;
  b.textContent = (idx < total - 1) ? '✓ Next Question →' : '✓ Finish & See Summary';
}

// ── Advance: next stage, next question, or finish ────────────
function ivwNextStep() {
  window.zirakInterviewStopSpeaking();
  ivwAbortLocalMic();
  clearTimeout(IVW.countdownTimer);
  var b = document.getElementById('iw-vw-nextstep-btn'); if (b) b.style.display = 'none';

  if (IVW.stage < 3) { ivwEnterStage(IVW.stage + 1); return; }

  var total = (window.IW && IW.currentLessons) ? IW.currentLessons.length : 1;
  var idx   = (window.IW && typeof IW.currentLessonIndex !== 'undefined') ? IW.currentLessonIndex : 0;
  if (idx < total - 1) {
    if (typeof window.iwNextLesson === 'function') window.iwNextLesson(); // re-renders → stage resets to 1
  } else {
    ivwShowFinishSummary();
  }
}

// ── Finish summary + working next action (Part 8) ────────────
function ivwShowFinishSummary() {
  window.zirakInterviewStopSpeaking();
  ivwAbortLocalMic();
  clearTimeout(IVW.autoFlowTimer);
  clearTimeout(IVW.countdownTimer);
  var overlay = document.getElementById('iw-practice-overlay');
  if (!overlay) return;

  var name  = ivwName();
  var total = IVW.results.length;
  var good  = IVW.results.filter(function (r) { return r.ok; }).length;
  var weak  = IVW.weakItems;
  var pct   = total ? Math.round(good / total * 100) : 0;
  var perf  = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Passed Strongly' : pct >= 40 ? 'Passed, Needs Review' : 'Repeat Weak Parts';
  var hasWeak = weak.length > 0;
  var trackTitle = (IVW.currentTrack && (IVW.currentTrack.title_en || IVW.currentTrack.titleEn)) || 'Interview Practice';
  var dateStr = new Date().toLocaleString();

  // Hero gradient: green/gold/orange/red based on score
  var heroBg = pct >= 80 ? 'linear-gradient(135deg,#059669,#10b981)'
             : pct >= 60 ? 'linear-gradient(135deg,#d97706,#f59e0b)'
             : pct >= 40 ? 'linear-gradient(135deg,#ea580c,#f97316)'
             :              'linear-gradient(135deg,#dc2626,#ef4444)';

  var encourage = pct >= 80
    ? 'Outstanding effort! You are speaking with confidence. Keep it up!'
    : pct >= 60 ? 'Good work! You are making strong progress. Practice the weak items.'
    : pct >= 40 ? 'Good try! Listen once more to the weak questions and repeat them.'
    : 'Keep going! Every practice session makes you stronger. Try again.';

  // WhatsApp sender — reuses fatherWA / wa.me pattern from app.js
  window._ivwSendSummaryWA = function () {
    var rawWA = '', fatherLabel = 'Parent';
    try {
      var p = (typeof loadParentProfile === 'function') ? loadParentProfile() : null;
      if (p) { rawWA = (p.fatherWA || p.fatherWhatsApp || '').replace(/[^0-9]/g,''); fatherLabel = p.fatherName || 'Parent'; }
    } catch (e) {}
    if (!rawWA) {
      try {
        var st = (typeof window.ZirakProfile !== 'undefined' && typeof window.ZirakProfile.getActive === 'function')
          ? window.ZirakProfile.getActive() : null;
        if (st) rawWA = (st.fatherWhatsApp || '').replace(/[^0-9]/g,'');
      } catch (e) {}
    }
    var weakLine = hasWeak
      ? 'Needs review (' + weak.length + '): ' + weak.slice(0,3).map(function(w){return w.q;}).join(' | ')
      : 'No weak items — excellent!';
    var msg = '\uD83C\uDF93 *Zirak English Academy \u2014 Interview Report*\n' +
      (name ? 'Student: ' + name + '\n' : '') +
      'Topic: ' + trackTitle + '\n' +
      'Score: ' + good + ' / ' + total + ' (' + pct + '%) \u2014 ' + perf + '\n' +
      weakLine + '\n' +
      'Date: ' + dateStr + '\n\n' +
      encourage + '\n\n' +
      'Sent via Zirak English App \uD83C\uDF1F';
    var encoded = encodeURIComponent(msg);
    var url = rawWA ? ('https://wa.me/' + rawWA + '?text=' + encoded) : ('https://wa.me/?text=' + encoded);
    if (!rawWA) {
      var notice = document.getElementById('iw-sum-wa-notice');
      if (notice) { notice.style.display = 'block'; setTimeout(function(){ notice.style.display='none'; }, 4500); }
    }
    try { window.open(url, '_blank'); } catch (e) {}
  };

  // Questions review rows
  var reviewedHtml = IVW.results.map(function (r, i) {
    var dot = r.ok ? '\u2705' : '\u274C';
    return '<div class="iw-sum-detail-row ' + (r.ok ? 'iw-sum-ok' : 'iw-sum-bad') + '">' +
      '<div class="iw-sum-detail-q">' + dot + ' <b>' + (i+1) + '.</b> ' + escIvw(r.q || '') + '</div>' +
      (r.transcript ? '<div class="iw-sum-detail-said">You said: <em>' + escIvw(String(r.transcript).slice(0,120)) + '</em></div>' : '') +
      (r.sample ? '<div class="iw-sum-detail-sample">Model: <em>' + escIvw(String(r.sample).slice(0,120)) + '</em></div>' : '') +
    '</div>';
  }).join('');

  var weakHtml = hasWeak ? weak.map(function (w, i) {
    return '<div class="iw-vw-sum-weak">' +
      '<div class="iw-vw-sum-weak-en" lang="en">' + (i + 1) + '. ' + escIvw(w.q) + '</div>' +
      '<div class="iw-vw-sum-weak-ps pashto" dir="rtl" lang="ps">' + escIvw(w.ps || 'Pashto translation pending.') + '</div>' +
      '<button class="iw-vw-btn iw-vw-btn-hear-sample" onclick="ivwSpeakWeakOne(' + i + ')">\uD83D\uDD0A Hear</button>' +
    '</div>';
  }).join('') : '<div class="iw-vw-sum-none">\u2705 No weak items. Great work!</div>';

  var mainBtn = hasWeak
    ? '<button class="iw-vw-btn iw-vw-btn-nextstep" onclick="ivwReviewWeakItems()">\uD83D\uDD01 Review Weak Interview Items</button>'
    : '<button class="iw-vw-btn iw-vw-btn-nextstep" onclick="ivwGoNextClassBlock()">\u27A1\uFE0F Go to Next Class Block</button>';

  overlay.innerHTML =
    '<div class="iw-vw-panel" id="iw-vw-panel">' +
      '<div class="iw-vw-header">' +
        '<button class="iw-vw-back-btn" onclick="ivwHandleClose()" aria-label="Close">\u2715 Exit</button>' +
        '<div class="iw-vw-header-center"><span class="iw-vw-header-icon">\uD83C\uDFC1</span><span class="iw-vw-header-title">Interview Summary</span></div>' +
        '<div style="width:64px;"></div>' +
      '</div>' +
      '<div class="iw-vw-sum-body">' +

        // Hero score card
        '<div class="iw-vw-sum-hero" style="background:' + heroBg + ';">' +
          '<div class="iw-sum-perf-big">' + escIvw(perf) + '</div>' +
          '<div class="iw-sum-score-ring">' + pct + '<span class="iw-sum-pct-label">%</span></div>' +
          '<div class="iw-vw-sum-score">' + good + ' / ' + total + ' answered well</div>' +
          (name ? '<div class="iw-vw-sum-name">Well done, ' + escIvw(name) + '! \uD83C\uDF89</div>' : '<div class="iw-vw-sum-name">Well done! \uD83C\uDF89</div>') +
        '</div>' +

        // Meta info card
        '<div class="iw-sum-meta-card">' +
          (trackTitle !== 'Interview Practice' ? '<div class="iw-sum-meta-row"><span class="iw-sum-meta-lbl">\uD83D\uDCCB Topic</span><span class="iw-sum-meta-val">' + escIvw(trackTitle) + '</span></div>' : '') +
          '<div class="iw-sum-meta-row"><span class="iw-sum-meta-lbl">\uD83D\uDCC5 Date</span><span class="iw-sum-meta-val">' + escIvw(dateStr) + '</span></div>' +
          '<div class="iw-sum-meta-row"><span class="iw-sum-meta-lbl">\uD83D\uDCAC Message</span><span class="iw-sum-meta-val">' + escIvw(encourage) + '</span></div>' +
        '</div>' +

        // WhatsApp button
        '<div class="iw-sum-wa-wrap">' +
          '<button class="iw-sum-wa-btn" onclick="window._ivwSendSummaryWA()">\uD83D\uDCF2 Send Result to Father (WhatsApp)</button>' +
          '<div id="iw-sum-wa-notice" class="iw-sum-wa-notice" style="display:none;">Father WhatsApp number is not set in the student profile. You can still share manually.</div>' +
        '</div>' +

        // Questions review
        (IVW.results.length > 0 ?
          '<div class="iw-sum-section-lbl">\uD83D\uDCDD Questions Review</div>' +
          '<div class="iw-sum-detail-list">' + reviewedHtml + '</div>'
        : '') +

        // Weak items
        '<div class="iw-vw-sum-weak-label">' + (hasWeak ? '\uD83D\uDD01 Items to review (' + weak.length + ')' : '\uD83C\uDFAF Review') + '</div>' +
        '<div class="iw-vw-sum-weak-list">' + weakHtml + '</div>' +

        // Action buttons
        '<div class="iw-vw-sum-actions">' +
          mainBtn +
          '<button class="iw-vw-btn iw-vw-btn-back-track" onclick="ivwGoNextClassBlock()">\u2B05 Back to Today\'s Class</button>' +
        '</div>' +
        '<div style="height: calc(24px + env(safe-area-inset-bottom));"></div>' +
      '</div>' +
    '</div>';

  overlay.style.display = 'flex';

  // I6H-C: Learning Ledger record (interview summary, rich payload)
  try {
    if (window.ZirakLearningLedger) {
      window.ZirakLearningLedger.recordActivity({
        source: 'interview',
        contentId: (IVW.currentTrack && IVW.currentTrack.id) || '', // I6H-D13B (Task 9)
        sectionTitle: 'Interview: ' + trackTitle,
        topicTitle: trackTitle,
        good: good, total: total, pct: pct,
        weakItems: weak.map(function (w) { return w.q; }),
        reviewItems: IVW.results.map(function (r) {
          return { q: r.q, ok: !!r.ok, said: r.transcript || '', model: r.sample || '' };
        }),
        activityType: 'interview'
      });
    }
  } catch (eLlg) {}

  var spoken = (name ? 'Well done, ' + name + '. ' : 'Well done. ') +
    'You completed ' + total + ' interview question' + (total === 1 ? '' : 's') + '. ' +
    'Your score is ' + pct + ' percent. Your performance is ' + perf + '. ' +
    (hasWeak ? 'You have ' + weak.length + ' item' + (weak.length === 1 ? '' : 's') +
               ' to review. Tap Review Weak Interview Items.'
             : 'You have no weak items. Excellent! You can send your result to your father on WhatsApp.') +
    ' ' + encourage;
  window.zirakInterviewSpeak(spoken);
}

// Speak a single weak item's English (used by per-item Hear buttons).
function ivwSpeakWeakOne(i) {
  var w = IVW.weakItems[i];
  if (w) window.zirakInterviewSpeak(w.q);
}

// ── Weak review: speak each English item once, show Pashto ───
function ivwReviewWeakItems() {
  window.zirakInterviewStopSpeaking();
  ivwAbortLocalMic();
  var overlay = document.getElementById('iw-practice-overlay');
  if (!overlay) return;
  var weak = IVW.weakItems;
  if (!weak.length) { ivwGoNextClassBlock(); return; }

  var listHtml = weak.map(function (w, i) {
    return '<div class="iw-vw-sum-weak">' +
             '<div class="iw-vw-sum-weak-en" lang="en">' + (i + 1) + '. ' + escIvw(w.q) + '</div>' +
             '<div class="iw-vw-sum-weak-ps pashto" dir="rtl" lang="ps">' + escIvw(w.ps || 'Pashto translation pending.') + '</div>' +
             '<button class="iw-vw-btn iw-vw-btn-hear-sample" onclick="ivwSpeakWeakOne(' + i + ')">🔊 Hear &amp; Repeat</button>' +
           '</div>';
  }).join('');

  overlay.innerHTML =
    '<div class="iw-vw-panel" id="iw-vw-panel">' +
      '<div class="iw-vw-header">' +
        '<button class="iw-vw-back-btn" onclick="ivwHandleClose()" aria-label="Close">✕ Exit</button>' +
        '<div class="iw-vw-header-center"><span class="iw-vw-header-icon">🔁</span><span class="iw-vw-header-title">Review Weak Items</span></div>' +
        '<div style="width:64px;"></div>' +
      '</div>' +
      '<div class="iw-vw-sum-body">' +
        '<div class="iw-vw-sum-weak-label">Listen to each one and repeat it aloud.</div>' +
        '<div class="iw-vw-sum-weak-list">' + listHtml + '</div>' +
        '<div class="iw-vw-sum-actions">' +
          '<button class="iw-vw-btn iw-vw-btn-nextstep" onclick="ivwGoNextClassBlock()">✓ Done — Go to Next Class Block</button>' +
        '</div>' +
        '<div style="height: calc(16px + env(safe-area-inset-bottom));"></div>' +
      '</div>' +
    '</div>';
  overlay.style.display = 'flex';

  // Speak each weak English item once, in sequence, with a short intro.
  var parts = ['Let us review your weak interview items. Listen and repeat each one.'];
  weak.forEach(function (w) { parts.push(w.q); });
  ivwSpeakSeq(parts);
}

// ── Go to next class block (Part 9) — safe return ────────────
function ivwGoNextClassBlock() {
  window.zirakInterviewStopSpeaking();
  ivwAbortLocalMic();
  if (typeof window.iwClosePractice === 'function') window.iwClosePractice();
  try {
    if (window.ZirakClassPath && typeof window.ZirakClassPath.goToNextClassBlock === 'function') {
      window.ZirakClassPath.goToNextClassBlock();
      return;
    }
  } catch (e) {}
  if (typeof window.navigate === 'function') window.navigate('home');
}


// Allow interview-core.js buttons that may call these globals
window.ivwHearQuestion    = ivwHearQuestion;
window.ivwRepeatQuestion  = ivwRepeatQuestion;
window.ivwToggleSample    = ivwToggleSample;
window.ivwHearSample      = ivwHearSample;
window.ivwToggleTips      = ivwToggleTips;
window.ivwToggleType      = ivwToggleType;
window.ivwSpeakAnswerBtn  = ivwSpeakAnswerBtn;
window.ivwStopMic         = ivwStopMic;
window.ivwNav             = ivwNav;
window.ivwToggleAutoMode  = ivwToggleAutoMode;
window.ivwHandleClose     = ivwHandleClose;
window.ivwOnTypeInput     = ivwOnTypeInput;
// PHASE I3 — stage machine
window.ivwStageHear        = ivwStageHear;
window.ivwStageRepeat      = ivwStageRepeat;
window.ivwNextStep         = ivwNextStep;
window.ivwReviewWeakItems  = ivwReviewWeakItems;
window.ivwGoNextClassBlock = ivwGoNextClassBlock;
window.ivwSpeakWeakOne     = ivwSpeakWeakOne;
window.ivwShowFinishSummary = ivwShowFinishSummary;
window.ivwEnterStage       = ivwEnterStage;

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
(function ivwInit() {
  console.log('[IVW] Interview Voice Wizard v1.17B ready.');
  // Restore auto-mode preference from localStorage
  try {
    const saved = localStorage.getItem(window.ZirakStorageKey ? window.ZirakStorageKey('zirak_ivw_auto_mode') : 'zirak_ivw_auto_mode');
    if (saved === 'true') IVW.autoMode = true;
  } catch (e) {}
})();
