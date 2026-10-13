// ============================================================
// Zirak English v1.16I — Interview Core
// interview-core.js
// Handles: Interview Wizard screen, search, group/level filters,
//          practice overlay, command router, AI settings placeholders.
// SAFE: does not break zirakIsTtsSpeaking, zirakRecognitionBlockedUntil,
//       zirakTtsSafetyDelayMs, zirakAbortRecognitionForTTS, zirakIsTtsBlocking,
//       red mic state, Hear button, or stale recognition prevention.
// ============================================================

'use strict';

// ── SAFE GUARDS ───────────────────────────────────────────────
// These must always be checked before doing any mic/speech action.
// If the parent app functions exist we defer to them.

function zirakIwCanUseMic() {
  if (typeof window.zirakIsTtsBlocking === 'function' && window.zirakIsTtsBlocking()) return false;
  if (typeof window.zirakIsTtsSpeaking !== 'undefined' && window.zirakIsTtsSpeaking) return false;
  return true;
}

function zirakIwSafeAbortRecognition() {
  if (typeof window.zirakAbortRecognitionForTTS === 'function') {
    window.zirakAbortRecognitionForTTS();
  }
}

// ── STATE ─────────────────────────────────────────────────────
const IW = {
  activeGroup: 'all',
  activeLevel: 0,         // 0 = all levels
  searchQuery: '',
  currentTrackId: null,
  currentLessonIndex: 0,
  currentLessons: [],
  practiceOpen: false,
  recognition: null,
  recognizing: false
};

/* ============================================================================
   INTERVIEW FUTURE EXPANSION CONTRACT  (I6B3 — read before adding content)
   ----------------------------------------------------------------------------
   No future interview track/question may be added without guidance + Pashto +
   dark/light-safe rendering. Every future interview TRACK should provide:

     id, group (one IW_GROUPS id), status ('sample'|'planned'|'coming_soon'),
     level_min, level_max,
     title_en, title_ps,                 // Pashto only (never Farsi/Dari/Urdu)
     description_en, description_ps,
     scenario_en, scenario_ps,           // the situation being practiced
     learner_goal_en, learner_goal_ps,   // what the student can do after
     guide_script_en,                    // spoken guide for this track
     required_skills[], suggested_level,
     sample_availability,                 // true if a model answer exists
     teacher_note,                        // optional, teacher-only
     next_action                          // recommended next step

   Every future QUESTION (lesson) should provide:
     id, track_id, level, cefr,
     question_en, question_ps,
     sample_answer_en, sample_answer_ps,  // read sentence-by-sentence (I6A5B)
     tips_en[], tips_ps[],
     expected_keywords[], weak_skill_tags[], feedback_hints,
     next_action, teacher_only_note (optional)

   CATEGORY guidance lives in ZirakPageGuides.interviewCategories[groupId]
   (labelEn/Ps, purposeEn/Ps, bestForEn/Ps). Add an entry there when you add a
   new IW_GROUPS category, and the list page + Hear Guide pick it up with no
   code change. LEVEL guidance is data-driven from
   ZirakPageGuides.interviewLevelGuide(n).

   PASHTO RULE: Pashto appears once only; a missing Pashto value must render
   "Pashto translation pending." — never blank, never Persian/Farsi/Dari/Urdu.
   ============================================================================ */
// ── GROUP META ────────────────────────────────────────────────
const IW_GROUPS = [
  { id: 'all',                  label_en: 'All',                   icon: '🔍' },
  { id: 'beginner_personal',    label_en: 'Beginner',              icon: '👤' },
  { id: 'school_student',       label_en: 'School',                icon: '🎒' },
  { id: 'daily_phone',          label_en: 'Phone',                 icon: '📞' },
  { id: 'first_job',            label_en: 'First Job',             icon: '💼' },
  { id: 'kandahar_ngo_un',      label_en: 'Kandahar NGO / UN',     icon: '🌍' },
  { id: 'hso_delivery',         label_en: 'HSO / Delivery',        icon: '🛵' },
  { id: 'professional_skills',  label_en: 'Professional',          icon: '🧠' },
  { id: 'academic_scholarship', label_en: 'Academic',              icon: '🎓' },
  { id: 'officer_formal',       label_en: 'Officer / Formal',      icon: '🏛️' },
  { id: 'advanced_academy',     label_en: 'Academy',               icon: '🏅' }
];

// ============================================================
// SCREEN OPEN / CLOSE
// ============================================================
window.openInterviewWizard = function (groupFilter) {
  const screen = document.getElementById('screen-interview-wizard');
  if (!screen) { console.warn('IW: screen element not found'); return; }

  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');

  // Update bottom nav
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const navBtn = document.querySelector('.nav-item[data-screen="interview-wizard"]');
  if (navBtn) navBtn.classList.add('active');

  // Apply filter if provided
  if (groupFilter) { IW.activeGroup = groupFilter; }
  else { IW.activeGroup = 'all'; }

  IW.activeLevel = 0;
  IW.searchQuery = '';

  iwRenderScreen();
};

window.closeInterviewWizard = function () {
  const screen = document.getElementById('screen-interview-wizard');
  if (screen) screen.classList.remove('active');
  iwClosePractice();
  if (typeof window.navigate === 'function') { window.navigate('home'); }
};

// ============================================================
// RENDER SCREEN
// ============================================================
function iwRenderScreen() {
  const root = document.getElementById('iw-screen-root');
  if (!root) return;

  root.innerHTML = '';

  // ── Header ─────────────────────────────────────────────
  const hdr = document.createElement('div');
  hdr.className = 'iw-header';
  hdr.innerHTML = `
    <button class="iw-back-btn" onclick="closeInterviewWizard()">← Home</button>
    <div class="iw-header-title">
      <span class="iw-header-icon">🎤</span>
      <span class="iw-header-text">Interview Wizard</span>
    </div>
    <button class="iw-settings-btn" onclick="iwOpenAISettings()" title="AI Settings">⚙️</button>
  `;
  root.appendChild(hdr);

  // ── Subtitle ────────────────────────────────────────────
  const sub = document.createElement('div');
  sub.className = 'iw-subtitle';
  sub.textContent = 'Practice real interview speaking from beginner to academy level.';
  root.appendChild(sub);

  // ── PHASE I6B3 — Part 2/11: list-page guide card (ONE guide framework) ──
  if (window.ZirakPageGuides) {
    const gwrap = document.createElement('div');
    gwrap.innerHTML = window.ZirakPageGuides.cardHtml('interview-home');
    if (gwrap.firstChild) root.appendChild(gwrap.firstChild);
  }

  // ── Search ──────────────────────────────────────────────
  const searchWrap = document.createElement('div');
  searchWrap.className = 'iw-search-wrap';
  searchWrap.innerHTML = `<input type="search" class="iw-search" id="iw-search-input"
    placeholder="Search interview type…" value="${escHtml(IW.searchQuery)}"
    oninput="iwOnSearch(this.value)" />`;
  root.appendChild(searchWrap);

  // ── Group Filters ───────────────────────────────────────
  const gf = document.createElement('div');
  gf.className = 'iw-group-filters';
  IW_GROUPS.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'iw-group-btn' + (IW.activeGroup === g.id ? ' active' : '');
    btn.innerHTML = `${g.icon} ${g.label_en}`;
    btn.onclick = () => { IW.activeGroup = g.id; iwRenderTrackList(); iwHighlightGroupFilter(); iwUpdateCategoryHint(); };
    gf.appendChild(btn);
  });
  root.appendChild(gf);

  // ── Level Filter ────────────────────────────────────────
  const lf = document.createElement('div');
  lf.className = 'iw-level-filters';
  const allLvlBtn = document.createElement('button');
  allLvlBtn.className = 'iw-level-btn' + (IW.activeLevel === 0 ? ' active' : '');
  allLvlBtn.textContent = 'All Levels';
  allLvlBtn.onclick = () => { IW.activeLevel = 0; iwRenderTrackList(); iwHighlightLevelFilter(); iwUpdateLevelHint(); };
  lf.appendChild(allLvlBtn);
  for (let lv = 1; lv <= 10; lv++) {
    const lb = document.createElement('button');
    lb.className = 'iw-level-btn' + (IW.activeLevel === lv ? ' active' : '');
    lb.textContent = `L${lv}`;
    lb.onclick = (lvl => () => { IW.activeLevel = lvl; iwRenderTrackList(); iwHighlightLevelFilter(); iwUpdateLevelHint(); })(lv);
    lf.appendChild(lb);
  }
  root.appendChild(lf);

  // ── PHASE I6B3 — Part 3/4: inline category + level hint (updates on tap) ──
  const hint = document.createElement('div');
  hint.className = 'iw-filter-hint';
  hint.id = 'iw-filter-hint';
  root.appendChild(hint);

  // ── Track List ──────────────────────────────────────────
  const tl = document.createElement('div');
  tl.className = 'iw-track-list';
  tl.id = 'iw-track-list';
  root.appendChild(tl);

  iwRenderTrackList();
  iwUpdateFilterHint();

  // PHASE I6B3 — Part 2/14: speak the list guide ONCE if Auto Read is ON.
  // The list page has no mic, so auto-read is safe here (unlike practice).
  try { if (window.ZirakPageGuides) window.ZirakPageGuides.autoSpeak('interview-home'); } catch (e) {}
}

// PHASE I6B3 — Part 3/4: build the inline category+level hint line. Data-driven
// from ZirakPageGuides so future categories/levels need no code change here.
function iwUpdateFilterHint() {
  const box = document.getElementById('iw-filter-hint');
  if (!box || !window.ZirakPageGuides) return;
  const c = window.ZirakPageGuides.interviewCategoryGuide(IW.activeGroup);
  const l = window.ZirakPageGuides.interviewLevelGuide(IW.activeLevel);
  box.innerHTML =
    '<div class="iw-filter-hint-row">' +
      '<span class="iw-filter-hint-en zk-readable">' +
        '<b>' + escHtml(c.labelEn) + ':</b> ' + escHtml(c.purposeEn || '') +
        ' <b>' + escHtml(l.titleEn) + '.</b> ' + escHtml(l.descEn || '') +
      '</span>' +
      '<button type="button" class="iw-filter-hint-hear zk-choice-readable" ' +
        'onclick="iwHearFilterHint()" aria-label="Hear category and level explanation">🔊 Hear</button>' +
    '</div>' +
    '<div class="iw-filter-hint-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' +
      escHtml(window.ZirakPageGuides.ps(c.purposePs)) + ' — ' + escHtml(window.ZirakPageGuides.ps(l.descPs)) +
    '</div>';
}
function iwUpdateCategoryHint() { iwUpdateFilterHint(); }
function iwUpdateLevelHint()    { iwUpdateFilterHint(); }

// Manual: speak the current category + level explanation (mic-safe, direct tap).
window.iwHearFilterHint = function () {
  try {
    if (!window.ZirakPageGuides) return;
    var txt = window.ZirakPageGuides.interviewCategoryScript(IW.activeGroup) + ' ' +
              window.ZirakPageGuides.interviewLevelScript(IW.activeLevel);
    if (typeof window.speak === 'function') window.speak(txt, 'en');
  } catch (e) {}
};

// PHASE I6B3 — Part 6: explain a Planned / Coming-Soon interview when tapped,
// instead of a dead button or ugly alert. Small, readable, Pashto once.
window.iwExplainPlanned = function (status) {
  var enMsg = (status === 'coming_soon')
    ? 'This interview is coming soon. It is being prepared for a future lesson. Practice the open interviews first.'
    : 'This interview is planned for a future phase. It is not open yet. Practice the open interviews (the ones with a Start button) first.';
  var psMsg = (status === 'coming_soon')
    ? 'دا مرکه ډېر ژر راځي. د راتلونکي لوست لپاره چمتو کیږي. لومړی خلاصې مرکې تمرین کړه.'
    : 'دا مرکه د راتلونکي پړاو لپاره پلان شوې ده. لا خلاصه نه ده. لومړی هغه خلاصې مرکې تمرین کړه چې د «پیل» تڼۍ لري.';

  var m = document.getElementById('iw-planned-modal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'iw-planned-modal';
    m.className = 'iw-planned-modal';
    (document.getElementById('app') || document.body).appendChild(m);
  }
  m.innerHTML =
    '<div class="iw-planned-card" role="dialog" aria-modal="true" aria-label="Planned interview">' +
      '<div class="iw-planned-icon" aria-hidden="true">📌</div>' +
      '<div class="iw-planned-en zk-readable">' + escHtml(enMsg) + '</div>' +
      '<div class="iw-planned-ps zk-pashto-readable pashto" dir="rtl" lang="ps">' + escHtml(psMsg) + '</div>' +
      '<div class="iw-planned-actions">' +
        '<button type="button" class="iw-planned-hear zk-choice-readable" onclick="iwHearPlanned()">🔊 Hear</button>' +
        '<button type="button" class="iw-planned-ok zk-choice-readable" onclick="iwClosePlanned()">Got it</button>' +
      '</div>' +
    '</div>';
  window.__iwPlannedEn = enMsg;
  m.style.display = 'flex';
};
window.iwClosePlanned = function () {
  var m = document.getElementById('iw-planned-modal');
  if (m) m.style.display = 'none';
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
};
window.iwHearPlanned = function () {
  try { if (window.__iwPlannedEn && typeof window.speak === 'function') window.speak(window.__iwPlannedEn, 'en'); } catch (e) {}
};

function iwHighlightGroupFilter() {
  const btns = document.querySelectorAll('.iw-group-btn');
  btns.forEach((b, i) => {
    b.classList.toggle('active', IW_GROUPS[i] && IW_GROUPS[i].id === IW.activeGroup);
  });
}

function iwHighlightLevelFilter() {
  const btns = document.querySelectorAll('.iw-level-btn');
  btns.forEach((b, i) => {
    b.classList.toggle('active', i === IW.activeLevel);
  });
}

function iwOnSearch(val) {
  IW.searchQuery = val.trim().toLowerCase();
  iwRenderTrackList();
}

// ============================================================
// RENDER TRACK LIST
// ============================================================
function iwRenderTrackList() {
  const tl = document.getElementById('iw-track-list');
  if (!tl) return;
  tl.innerHTML = '';

  const tracks = window.zirakInterviewTracks || [];
  const lessons = window.zirakInterviewLessons || [];

  let filtered = tracks;

  // Group filter
  if (IW.activeGroup !== 'all') {
    filtered = filtered.filter(t => t.group === IW.activeGroup);
  }
  // Level filter
  if (IW.activeLevel > 0) {
    filtered = filtered.filter(t => t.level_min <= IW.activeLevel && t.level_max >= IW.activeLevel);
  }
  // Search
  if (IW.searchQuery) {
    const q = IW.searchQuery;
    filtered = filtered.filter(t =>
      (t.title_en || '').toLowerCase().includes(q) ||
      (t.title_ps || '').toLowerCase().includes(q) ||
      (t.title_dari || '').toLowerCase().includes(q) ||
      (t.description_en || '').toLowerCase().includes(q) ||
      (t.job_keywords || []).some(kw => kw.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    tl.innerHTML = '<div class="iw-empty">No interview tracks found. Try a different search or filter.</div>';
    return;
  }

  filtered.forEach(track => {
    const trackLessons = lessons.filter(l => l.track_id === track.id);
    const hasSample = track.status === 'sample' && trackLessons.length > 0;
    const groupMeta = IW_GROUPS.find(g => g.id === track.group);
    const groupLabel = groupMeta ? groupMeta.label_en : track.group;

    const card = document.createElement('div');
    card.className = 'iw-track-card';
    card.innerHTML = `
      <div class="iw-track-icon">${track.icon || '🎤'}</div>
      <div class="iw-track-body">
        <div class="iw-track-title-en">${escHtml(track.title_en)}</div>
        ${(window.renderPashtoLine
            ? window.renderPashtoLine(
                (window.getPashtoText ? window.getPashtoText(track, 'title') : (track.title_ps || track.title_dari || '')),
                'iw-track-title-ps pashto')
            : '<div class="iw-track-title-ps pashto">' + escHtml(track.title_ps || track.title_dari || '') + '</div>')}
        <div class="iw-track-desc-en">${escHtml(track.description_en)}</div>
        <div class="iw-track-meta">
          <span class="iw-badge iw-badge-group">${escHtml(groupLabel)}</span>
          <span class="iw-badge iw-badge-level">Level ${track.level_min}${track.level_min !== track.level_max ? '–' + track.level_max : ''}</span>
          <span class="iw-badge iw-badge-status iw-badge-${track.status}">${iwStatusLabel(track.status)}</span>
        </div>
      </div>
      <div class="iw-track-action">
        ${hasSample
          ? `<button class="iw-start-btn" onclick="iwStartPractice('${escAttr(track.id)}')">▶ Start</button>`
          : `<button type="button" class="iw-coming-soon-btn" onclick="iwExplainPlanned('${escAttr(track.status)}')" aria-label="Why is this planned?">${track.status === 'coming_soon' ? '🔜 Coming Soon' : '📌 Planned'}</button>`
        }
      </div>
    `;
    tl.appendChild(card);
  });
}

function iwStatusLabel(status) {
  if (status === 'sample') return '✅ Sample';
  if (status === 'coming_soon') return '🔜 Soon';
  return '📌 Planned';
}

// ============================================================
// PRACTICE OVERLAY
// ============================================================
window.iwStartPractice = function (trackId) {
  const track = (window.zirakInterviewTracks || []).find(t => t.id === trackId);
  if (!track) return;

  const lessons = (window.zirakInterviewLessons || []).filter(l => l.track_id === trackId);
  if (lessons.length === 0) {
    alert('No sample lessons available yet for this track.');
    return;
  }

  IW.currentTrackId = trackId;
  IW.currentLessons = lessons;
  IW.currentLessonIndex = 0;
  IW.practiceOpen = true;

  iwRenderPractice(track, lessons[0]);
};

// PHASE I6A4 — Part 7 (confirmed-dead code, documented not removed):
// This function is completely overridden by interview-voice-wizard.js's
// own `window.iwRenderPractice = function(track, lesson) {...}`, which
// loads AFTER this file. iwStartPractice() (above) calls the bare
// identifier `iwRenderPractice(...)`, which always resolves to whichever
// definition was assigned LAST in script-load order — so this version
// never actually runs for any user, on any page load. It is left in
// place rather than removed/edited (including its own internal
// duplicate-Pashto pattern below, which never reaches a screen) per the
// "do not change wizard engines" caution for this cleanup phase — fully
// confirmed unreachable via full-text search across every JS/HTML file,
// reported in the phase summary rather than deleted.
function iwRenderPractice(track, lesson) {
  let overlay = document.getElementById('iw-practice-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'iw-practice-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Interview Practice');
    document.getElementById('app').appendChild(overlay);
  }

  const total = IW.currentLessons.length;
  const idx = IW.currentLessonIndex;

  overlay.innerHTML = `
    <div class="iw-practice-panel">
      <div class="iw-practice-header">
        <div class="iw-practice-title">🎤 ${escHtml(track.title_en)}</div>
        <button class="iw-practice-close" onclick="iwClosePractice()">✕</button>
      </div>
      <div class="iw-practice-progress-bar">
        <div class="iw-practice-progress-fill" style="width:${Math.round(((idx) / total) * 100)}%"></div>
      </div>
      <div class="iw-practice-counter">Question ${idx + 1} of ${total} · Level ${lesson.level} · ${lesson.cefr}</div>

      <div class="iw-practice-question-block">
        <div class="iw-practice-q-en">${escHtml(lesson.question_en)}</div>
        <div class="iw-practice-q-ps pashto">${escHtml(lesson.question_ps)}</div>
        <div class="iw-practice-q-dari dari">${escHtml(lesson.question_dari)}</div>
      </div>

      <div class="iw-practice-controls">
        <button class="iw-btn iw-btn-primary" id="iw-speak-btn" onclick="iwStartSpeaking()">🎤 Speak Answer</button>
        <button class="iw-btn iw-btn-secondary" onclick="iwToggleTypeAnswer()">⌨️ Type Answer</button>
        <button class="iw-btn iw-btn-secondary" onclick="iwToggleSampleAnswer()">👁 Show Sample</button>
        <button class="iw-btn iw-btn-secondary" onclick="iwToggleTips()">💡 Tips</button>
      </div>

      <div id="iw-type-area" style="display:none;margin-top:10px;">
        <textarea id="iw-type-input" class="iw-type-input" placeholder="Type your answer here in English…" rows="4"></textarea>
      </div>

      <div id="iw-mic-status" class="iw-mic-status" style="display:none;"></div>
      <div id="iw-transcript-area" class="iw-transcript-area" style="display:none;"></div>

      <div id="iw-sample-area" class="iw-sample-area" style="display:none;">
        <div class="iw-sample-label">Sample Answer</div>
        <div class="iw-sample-en">${escHtml(lesson.sample_answer_en)}</div>
        <div class="iw-sample-ps pashto">${escHtml(lesson.sample_answer_ps)}</div>
        <div class="iw-sample-dari dari">${escHtml(lesson.sample_answer_dari)}</div>
      </div>

      <div id="iw-tips-area" class="iw-tips-area" style="display:none;">
        <div class="iw-tips-label">Tips</div>
        <ul class="iw-tips-list">
          ${(lesson.tips_en || []).map((tip, i) => `
            <li>
              <span class="iw-tip-en">${escHtml(tip)}</span>
              <span class="iw-tip-ps pashto">${escHtml((lesson.tips_ps || [])[i] || '')}</span>
              <span class="iw-tip-dari dari">${escHtml((lesson.tips_dari || [])[i] || '')}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="iw-practice-nav">
        <button class="iw-btn iw-btn-secondary" onclick="iwPrevLesson()" ${idx === 0 ? 'disabled' : ''}>← Previous</button>
        <button class="iw-btn iw-btn-primary" onclick="iwNextLesson()">${idx < total - 1 ? 'Next →' : 'Finish ✓'}</button>
      </div>
    </div>
  `;

  overlay.style.display = 'flex';
}

window.iwClosePractice = function () {
  IW.practiceOpen = false;
  iwStopSpeaking(true); // v1.16I-Fix1: abort (not just stop) when closing overlay
  const overlay = document.getElementById('iw-practice-overlay');
  if (overlay) overlay.style.display = 'none';
};

window.iwNextLesson = function () {
  iwStopSpeaking();
  if (IW.currentLessonIndex < IW.currentLessons.length - 1) {
    IW.currentLessonIndex++;
    const track = (window.zirakInterviewTracks || []).find(t => t.id === IW.currentTrackId);
    iwRenderPractice(track, IW.currentLessons[IW.currentLessonIndex]);
  } else {
    iwClosePractice();
    alert('Practice complete! Great work! 🎉');
  }
};

window.iwPrevLesson = function () {
  iwStopSpeaking();
  if (IW.currentLessonIndex > 0) {
    IW.currentLessonIndex--;
    const track = (window.zirakInterviewTracks || []).find(t => t.id === IW.currentTrackId);
    iwRenderPractice(track, IW.currentLessons[IW.currentLessonIndex]);
  }
};

window.iwToggleSampleAnswer = function () {
  const el = document.getElementById('iw-sample-area');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.iwToggleTips = function () {
  const el = document.getElementById('iw-tips-area');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.iwToggleTypeAnswer = function () {
  const el = document.getElementById('iw-type-area');
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

// ── Speech Recognition (mic) ──────────────────────────────────
// v1.16I-Fix1: hardened against InvalidStateError, double-start,
// and stuck button state. Does NOT touch WordWizard mic/TTS code.
window.iwStartSpeaking = function () {
  if (!zirakIwCanUseMic()) {
    iwSetMicStatus('⚠️ Please wait — TTS is speaking. Try again in a moment.', 'warn');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    iwSetMicStatus('⚠️ Speech recognition not supported in this browser.', 'warn');
    return;
  }

  // If a recognition session is already active (or the button thinks it is),
  // stop it safely first instead of starting a second overlapping session.
  if (IW.recognizing || IW.recognition) {
    iwStopSpeaking(true);
  }

  const btn = document.getElementById('iw-speak-btn');

  let recognition;
  try {
    recognition = new SpeechRecognition();
  } catch (e) {
    iwSetMicStatus('⚠️ Could not start the microphone. Please try again.', 'warn');
    iwResetSpeakButton();
    return;
  }

  IW.recognition = recognition;
  IW.recognition.lang = 'en-US'; // English recognition language — unchanged
  IW.recognition.interimResults = true;
  IW.recognition.maxAlternatives = 1;

  IW.recognition.onresult = function (event) {
    // Stale recognition guard: abort if TTS started
    if (!zirakIwCanUseMic()) {
      iwSafeAbortIwRecognition();
      iwSetMicStatus('⚠️ TTS interrupted — mic stopped safely.', 'warn');
      iwResetSpeakButton();
      return;
    }
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    const transcriptArea = document.getElementById('iw-transcript-area');
    if (transcriptArea) transcriptArea.textContent = transcript;
  };

  IW.recognition.onend = function () {
    IW.recognizing = false;
    iwResetSpeakButton();
    iwSetMicStatus('✅ Done listening.', 'done');
  };

  IW.recognition.onerror = function (event) {
    IW.recognizing = false;
    iwResetSpeakButton();
    if (event && event.error === 'no-speech') {
      iwSetMicStatus('⚠️ No speech detected. Try again.', 'warn');
    } else if (event && event.error === 'aborted') {
      iwSetMicStatus('✅ Done listening.', 'done');
    } else {
      iwSetMicStatus('⚠️ Mic error: ' + (event && event.error ? event.error : 'unknown'), 'warn');
    }
  };

  try {
    IW.recognition.start();
    IW.recognizing = true;
    if (btn) btn.textContent = '⏹ Stop Listening';
    iwSetMicStatus('🔴 Listening… speak in English', 'active');
    const transcriptArea = document.getElementById('iw-transcript-area');
    if (transcriptArea) { transcriptArea.style.display = 'block'; transcriptArea.textContent = '…'; }
  } catch (e) {
    IW.recognizing = false;
    iwResetSpeakButton();
    if (e && e.name === 'InvalidStateError') {
      // Recognition was already running/starting — stop it safely and
      // show a friendly message instead of letting it crash.
      iwSafeAbortIwRecognition();
      iwSetMicStatus('⚠️ Mic was already active. Please tap Speak Answer again.', 'warn');
    } else {
      iwSetMicStatus('⚠️ Could not start the microphone. Please try again.', 'warn');
    }
  }
};

// Safely stop (or abort) the current IW recognition session, if any.
// force=true uses abort() (used when closing the overlay / restarting),
// otherwise a normal stop() is used so any final result still fires.
function iwStopSpeaking(force) {
  if (IW.recognition) {
    try {
      if (force) {
        IW.recognition.abort();
      } else {
        IW.recognition.stop();
      }
    } catch (e) {
      // Swallow InvalidStateError / DOMException — recognition may already
      // be stopped or never started; nothing else to do here safely.
    }
  }
  IW.recognizing = false;
  iwResetSpeakButton();
}

// Internal helper used inside callbacks where we want abort() specifically
// without re-triggering the public iwStopSpeaking flow.
function iwSafeAbortIwRecognition() {
  if (IW.recognition) {
    try { IW.recognition.abort(); } catch (e) {}
  }
  IW.recognizing = false;
}

// Always restores the Speak button to its default label.
// Called from every stop/error/end path so the button never gets stuck.
function iwResetSpeakButton() {
  const btn = document.getElementById('iw-speak-btn');
  if (btn) btn.textContent = '🎤 Speak Answer';
}

function iwSetMicStatus(msg, type) {
  const el = document.getElementById('iw-mic-status');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = msg;
  el.className = 'iw-mic-status iw-mic-' + (type || 'info');
}


// ============================================================
// LOCAL COMMAND ROUTER
// zirakLocalCommandRouter(text)
// zirakExecuteZirakSafeAction(action)
// ============================================================
window.zirakLocalCommandRouter = function (text) {
  if (!text) return null;
  const t = text.toLowerCase().trim();

  // Interview Wizard open
  if (t.includes('interview wizard') || t.includes('take me to interview') || t.match(/^interview\s*wizard?$/)) {
    return { action: 'open_interview_wizard', group: null };
  }
  // HSO / Delivery
  if (t.includes('hso interview') || t.includes('hso delivery') || t.includes('delivery interview') || t.includes('delivery rider')) {
    return { action: 'open_interview_wizard', group: 'hso_delivery' };
  }
  // NGO / UN / Kandahar
  if (t.includes('ngo interview') || t.includes('kandahar interview') || t.includes('kandahar ngo') ||
      t.includes('unicef') || t.includes('wfp interview') || t.includes('un interview') ||
      t.includes('unfpa') || t.includes('ocha') || t.includes('humanitarian interview')) {
    return { action: 'open_interview_wizard', group: 'kandahar_ngo_un' };
  }
  // Phone
  if (t.includes('phone interview') || t.includes('phone call interview')) {
    return { action: 'open_interview_wizard', group: 'daily_phone' };
  }
  // Driver
  if (t.includes('driver interview') || t.includes('driving interview')) {
    return { action: 'open_interview_wizard', group: 'kandahar_ngo_un' };
  }
  // Academic
  if (t.includes('academic interview') || t.includes('university interview') || t.includes('scholarship interview')) {
    return { action: 'open_interview_wizard', group: 'academic_scholarship' };
  }
  // Officer / Formal / Panel
  if (t.includes('officer interview') || t.includes('panel interview') || t.includes('formal interview') || t.includes('civil service')) {
    return { action: 'open_interview_wizard', group: 'officer_formal' };
  }
  // Academy / Expert
  if (t.includes('academy interview') || t.includes('expert interview') || t.includes('advanced interview')) {
    return { action: 'open_interview_wizard', group: 'advanced_academy' };
  }
  // First job
  if (t.includes('first job') || t.includes('job interview')) {
    return { action: 'open_interview_wizard', group: 'first_job' };
  }
  // Beginner
  if (t.includes('beginner interview') || t.includes('personal interview') || t.includes('introduction interview')) {
    return { action: 'open_interview_wizard', group: 'beginner_personal' };
  }
  // School
  if (t.includes('school interview') || t.includes('student interview')) {
    return { action: 'open_interview_wizard', group: 'school_student' };
  }

  return null; // No match — caller should handle normally
};

window.zirakExecuteZirakSafeAction = function (actionObj) {
  if (!actionObj || !actionObj.action) return;
  // Only whitelisted safe actions — no arbitrary eval
  if (actionObj.action === 'open_interview_wizard') {
    window.openInterviewWizard(actionObj.group || null);
  }
};


// ============================================================
// AI SETTINGS PLACEHOLDER
// ============================================================
// PHASE I6A5 — Part B: this panel exposes raw API key fields (Cohere /
// DeepSeek) and was reachable by ANY user with zero protection — a
// direct gap against this project's own foundational rule that the
// teacher PIN protects "settings, API key area, danger zone..." Gated
// here using the SAME requireTeacher() gate/prompt the rest of the app
// already uses (exposed via window.ZirakProfile.requireTeacher in this
// phase) — no second PIN system created. The actual panel-building
// logic is unchanged, just moved into a private function that only the
// gated entry point calls.
window.iwOpenAISettings = function () {
  if (typeof window.ZirakProfile === 'object' && typeof window.ZirakProfile.requireTeacher === 'function') {
    window.ZirakProfile.requireTeacher(_iwOpenAISettingsPanel);
    return;
  }
  // Fallback (should not normally happen — zirak-profile.js always
  // loads before interview-core.js): open without a gate rather than
  // silently doing nothing, so the feature never becomes unreachable.
  _iwOpenAISettingsPanel();
};

function _iwOpenAISettingsPanel() {
  let panel = document.getElementById('iw-ai-settings-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'iw-ai-settings-panel';
    panel.className = 'iw-ai-settings-panel';
    document.getElementById('app').appendChild(panel);
  }

  // Load from localStorage
  const s = iwAISettingsLoad();

  panel.innerHTML = `
    <div class="iw-ai-settings-inner">
      <div class="iw-ai-settings-header">
        <div class="iw-ai-settings-title">⚙️ AI Settings</div>
        <button class="iw-ai-settings-close" onclick="iwCloseAISettings()">✕</button>
      </div>
      ${window.ZirakPageGuides ? window.ZirakPageGuides.cardHtml('interview-settings') : ''}
      <div class="iw-ai-warn">⚠️ Prototype only: API keys stored in this browser are not secure. Production must use a backend/proxy.</div>

      <div class="iw-ai-row">
        <label>AI Enabled</label>
        <input type="checkbox" id="iw-ai-enabled" ${s.ai_enabled ? 'checked' : ''} onchange="iwAISave()">
      </div>
      <div class="iw-ai-row">
        <label>AI Navigation Helper</label>
        <input type="checkbox" id="iw-ai-nav" ${s.ai_nav ? 'checked' : ''} onchange="iwAISave()">
      </div>
      <div class="iw-ai-row">
        <label>AI Interview Coach</label>
        <input type="checkbox" id="iw-ai-coach" ${s.ai_coach ? 'checked' : ''} onchange="iwAISave()">
      </div>

      <div class="iw-ai-section-label">Primary Provider: Cohere</div>
      <div class="iw-ai-row">
        <label>Cohere API Key</label>
        <input type="password" id="iw-ai-cohere-key" class="iw-ai-input" placeholder="co-…" value="${escHtml(s.cohere_key || '')}" onchange="iwAISave()">
      </div>
      <div class="iw-ai-row">
        <label>Cohere Model</label>
        <input type="text" id="iw-ai-cohere-model" class="iw-ai-input" placeholder="command-r-plus" value="${escHtml(s.cohere_model || '')}" onchange="iwAISave()">
      </div>
      <button class="iw-ai-test-btn" onclick="iwAITestCohere()">🔌 Test Cohere (placeholder)</button>

      <div class="iw-ai-section-label">Fallback Provider: DeepSeek</div>
      <div class="iw-ai-row">
        <label>DeepSeek API Key</label>
        <input type="password" id="iw-ai-deepseek-key" class="iw-ai-input" placeholder="sk-…" value="${escHtml(s.deepseek_key || '')}" onchange="iwAISave()">
      </div>
      <div class="iw-ai-row">
        <label>DeepSeek Model</label>
        <input type="text" id="iw-ai-deepseek-model" class="iw-ai-input" placeholder="deepseek-chat" value="${escHtml(s.deepseek_model || '')}" onchange="iwAISave()">
      </div>
      <button class="iw-ai-test-btn" onclick="iwAITestDeepSeek()">🔌 Test DeepSeek (placeholder)</button>

      <div class="iw-ai-note">
        AI can later help with: improving student answers, explaining mistakes, generating follow-up questions,
        drafting Pashto/Pashto support, summarizing performance, creating homework, role-playing interviewer,
        and helping navigation. Phase 2 feature.
      </div>
      <button class="iw-ai-save-btn" onclick="iwAISave(); iwCloseAISettings();">💾 Save Settings</button>
    </div>
  `;

  panel.style.display = 'flex';
};

window.iwCloseAISettings = function () {
  const panel = document.getElementById('iw-ai-settings-panel');
  if (panel) panel.style.display = 'none';
};

function iwAISettingsLoad() {
  try {
    return JSON.parse(localStorage.getItem('zirak_iw_ai_settings') || '{}');
  } catch (e) { return {}; }
}

window.iwAISave = function () {
  const s = {
    ai_enabled:     !!(document.getElementById('iw-ai-enabled') || {}).checked,
    ai_nav:         !!(document.getElementById('iw-ai-nav') || {}).checked,
    ai_coach:       !!(document.getElementById('iw-ai-coach') || {}).checked,
    cohere_key:     (document.getElementById('iw-ai-cohere-key') || {}).value || '',
    cohere_model:   (document.getElementById('iw-ai-cohere-model') || {}).value || '',
    deepseek_key:   (document.getElementById('iw-ai-deepseek-key') || {}).value || '',
    deepseek_model: (document.getElementById('iw-ai-deepseek-model') || {}).value || ''
  };
  try { localStorage.setItem('zirak_iw_ai_settings', JSON.stringify(s)); } catch (e) {}
};

window.iwAITestCohere = function () {
  alert('Cohere test connection — placeholder. Phase 2 will implement real API fetch.');
};
window.iwAITestDeepSeek = function () {
  alert('DeepSeek test connection — placeholder. Phase 2 will implement real API fetch.');
};


// ============================================================
// HELPER: HTML ESCAPE
// ============================================================
function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function escAttr(str) { return escHtml(str); }


// ============================================================
// INIT: register navigate hook if app.js navigate() exists
// Called by app.js after DOMContentLoaded or inline in html
// ============================================================
window.zirakInitInterviewWizard = function () {
  console.log('[IW] Interview Wizard v1.16I ready. Tracks:', (window.zirakInterviewTracks || []).length);
  // Run audit in dev console if needed
  // window.zirakRunInterviewContentAudit();
};

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.zirakInitInterviewWizard);
} else {
  window.zirakInitInterviewWizard();
}
