/* ============================================================================
   grammar-lab-auto-wizard.js — PHASE I6G-B (repair of I6G-A)
   REAL PER-TOPIC GRAMMAR AUTO-WIZARD — Interview-Wizard logic, copied.
   ----------------------------------------------------------------------------
   This is a faithful port of the interview-voice-wizard.js flow onto every
   grammar topic (Grammar World topics AND Foundation Path topics):

     speak content → safety delay → mic on AUTOMATICALLY (auto mode)
     → PATIENT burst-chained mic (I6A2 pattern: no-speech streak < 2,
       220ms burst gap, max-burst cap — a pause never kills the mic)
     → grace pause → JUDGE transcript vs target (word-overlap scoring)
     → spoken + visual feedback → advance ONLY after feedback TTS ends
     → final LOUD spoken review + WhatsApp report to father (wa.me pattern
       copied from the existing app.js report senders).

   ONE-SYSTEM GUARANTEES:
   • Renders into #grammar-cards-list — no second grammar mount.
   • TTS: SpeechSynthesis with state.speechRate + the SAME
     zirakTtsSafetyDelayMs (+ extra guard) used by every working mic engine.
   • Mic: same SpeechRecognition burst pattern as interview-voice-wizard.
   • Weak saves: window.gwAddWeakItem + ZirakGrammarLab.extendWeakRecord.
   • Auto Read initial state: window.ZirakAutoReadOn. Guides: ZirakPageGuides.
   ============================================================================ */
(function () {
  'use strict';

  var GL = null;
  var EXTRA_TTS_GUARD_MS = 400;   // on top of global zirakTtsSafetyDelayMs
  var MAX_BURST_MS = 45000;       // safety cap per answer attempt
  var PASS_PCT = 60;              // >= 60% word overlap = correct
  var OK_PCT   = 40;              // 40–59% = good try (counts as pass, softer praise)

  var W = {
    topicId: null, topicTitle: '', steps: [], idx: 0,
    autoMode: true, results: [],           // {label, target, said, pct, ok}
    isSpeaking: false, scored: false,
    // mic burst state (I6A2 pattern)
    rec: null, recognizing: false, micShouldContinue: false,
    micSession: 0, burstNoSpeechStreak: 0, burstStart: 0,
    transcript: '', autoTimer: null
  };

  /* ── helpers ────────────────────────────────────────────────────────────── */
  function glEl(){ return document.getElementById('grammar-cards-list'); }
  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function norm(s){ return String(s||'').toLowerCase().replace(/[.,!?;:'"“”‘’()\-]/g,' ').replace(/\s+/g,' ').trim(); }
  function words(s){ var n=norm(s); return n?n.split(' '):[]; }
  function clearAuto(){ if(W.autoTimer){ clearTimeout(W.autoTimer); W.autoTimer=null; } }

  /* ── TTS — SpeechSynthesis + saved rate + global safety delay ───────────── */
  function speak(text, onDone){
    if(!text){ if(onDone) onDone(); return; }
    abortMic();                                       // never overlap mic
    try{ window.speechSynthesis.cancel(); }catch(e){}
    if(!window.speechSynthesis){ if(onDone) onDone(); return; }
    var u = new SpeechSynthesisUtterance(String(text));
    u.lang='en-US';
    u.rate=(window.state && window.state.speechRate)? window.state.speechRate : 1.0;
    W.isSpeaking=true;
    u.onend=function(){
      W.isSpeaking=false;
      var base=(typeof window.zirakTtsSafetyDelayMs!=='undefined')? window.zirakTtsSafetyDelayMs : 1200;
      if(onDone){ clearAuto(); W.autoTimer=setTimeout(onDone, base+EXTRA_TTS_GUARD_MS); }
    };
    u.onerror=function(){ W.isSpeaking=false; if(onDone) setTimeout(onDone,300); };
    // small settle delay if mic was just live (hardware release)
    setTimeout(function(){ try{ window.speechSynthesis.speak(u); }catch(e){ if(onDone) onDone(); } }, 120);
  }
  function stopSpeak(){
    W.isSpeaking=false; clearAuto();
    try{ window.speechSynthesis.cancel(); }catch(e){}
  }

  /* ── MIC — burst-chained patient recognition (interview I6A2 port) ──────── */
  function startMic(){
    if(W.isSpeaking) return;                          // never over TTS
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ setMicStatus('⚠️ Mic not available on this device. You can type instead.','warn'); showTypeFallback(); return; }
    W.micSession++; W.micShouldContinue=true;
    W.transcript=''; W.burstNoSpeechStreak=0; W.burstStart=Date.now();
    setMicUI(true);
    startBurst(W.micSession);
  }
  function startBurst(mySession){
    if(mySession!==W.micSession || !W.micShouldContinue) return;
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    var rec; try{ rec=new SR(); }catch(e){ endListening(mySession); return; }
    rec.lang='en-US'; rec.continuous=false; rec.interimResults=true; rec.maxAlternatives=1;
    W.rec=rec; W.recognizing=true;
    var burstFinal='';
    rec.onresult=function(e){
      var interim='';
      for(var i=0;i<e.results.length;i++){
        var t=e.results[i][0].transcript;
        if(e.results[i].isFinal) burstFinal+=' '+t; else interim+=' '+t;
      }
      var live=(W.transcript+' '+burstFinal+' '+interim).replace(/\s+/g,' ').trim();
      var box=$('glaw-transcript'); if(box) box.textContent=live||'…';
    };
    rec.onend=function(){
      if(mySession!==W.micSession) return;            // stale burst
      W.recognizing=false; W.rec=null;
      var clean=burstFinal.replace(/\s+/g,' ').trim();
      if(clean){ W.transcript=(W.transcript+' '+clean).replace(/\s+/g,' ').trim(); W.burstNoSpeechStreak=0; }
      else W.burstNoSpeechStreak++;
      var elapsed=Date.now()-W.burstStart;
      var cont=W.micShouldContinue && elapsed<MAX_BURST_MS && W.burstNoSpeechStreak<2;
      if(cont){
        // 220ms gap — pause never feels like the mic gave up (I6A2)
        setTimeout(function(){
          if(mySession!==W.micSession || !W.micShouldContinue) return;
          startBurst(mySession);
        },220);
        return;
      }
      endListening(mySession);
    };
    rec.onerror=function(ev){
      if(mySession!==W.micSession) return;
      W.recognizing=false; W.rec=null;
      if(ev && ev.error==='no-speech') return;        // natural pause; onend decides
      W.micShouldContinue=false;
      setMicUI(false);
      if(ev && ev.error!=='aborted') setMicStatus('⚠️ Mic error: '+(ev.error||'unknown'),'warn');
      endListening(mySession, true);
    };
    try{ rec.start(); }catch(e){ endListening(mySession); }
  }
  function endListening(mySession, silent){
    if(mySession!==W.micSession) return;
    W.micShouldContinue=false;
    setMicUI(false);
    // grace pause, then score — same rhythm as interview wizard
    setTimeout(function(){
      if(mySession!==W.micSession) return;
      if(!silent) setMicStatus('✅ Done listening.','done');
      scoreCurrentStep(W.transcript);
    },400);
  }
  function stopMicManual(){
    W.micShouldContinue=false;
    if(W.rec){ try{ W.rec.stop(); }catch(e){} }
    else endListening(W.micSession);
  }
  function abortMic(){
    W.micShouldContinue=false; W.micSession++;
    if(W.rec){ try{ W.rec.abort(); }catch(e){} W.rec=null; }
    W.recognizing=false; setMicUI(false);
  }
  function setMicUI(active){
    var p=$('glaw-listen-panel'); if(p) p.style.display=active?'block':'none';
    var s=$('glaw-stop-listen'); if(s) s.style.display=active?'inline-flex':'none';
  }
  function setMicStatus(msg, cls){
    var el=$('glaw-mic-status'); if(!el) return;
    el.textContent=msg||''; el.style.display=msg?'block':'none';
    el.className='glaw-mic-status '+(cls||'');
  }
  function showTypeFallback(){ var t=$('glaw-type-area'); if(t) t.style.display='block'; }

  /* ── JUDGING — word-overlap scoring ─────────────────────────────────────── */
  function scoreOverlap(said, target){
    var tw=words(target), sw=words(said);
    if(!tw.length) return 100;
    if(!sw.length) return 0;
    var bag={}; sw.forEach(function(w){ bag[w]=(bag[w]||0)+1; });
    var hit=0;
    tw.forEach(function(w){ if(bag[w]>0){ hit++; bag[w]--; } });
    return Math.round((hit/tw.length)*100);
  }
  function scoreCurrentStep(transcript){
    var step=W.steps[W.idx]; if(!step || W.scored) return;
    var said=(transcript||'').trim();
    var target=step.target||'';
    var pct=scoreOverlap(said,target);
    var ok=pct>=OK_PCT;
    W.scored=true;
    W.results.push({label:step.label, target:target, said:said, pct:pct, ok:ok});
    if(!ok) saveWeak(step, said);

    var visible, spoken;
    if(!said){
      visible='🔇 I did not hear you. The sentence is: "'+target+'"';
      spoken='I did not hear you. The sentence is: '+target+'. We will continue.';
    } else if(pct>=PASS_PCT){
      visible='✅ Excellent! ('+pct+'% match)';
      spoken='Excellent! Very good.';
    } else if(ok){
      visible='👍 Good try ('+pct+'%). Correct: "'+target+'"';
      spoken='Good try. Listen once more: '+target;
    } else {
      visible='❌ Not yet ('+pct+'%). Correct: "'+target+'"';
      spoken='Not quite. The correct sentence is: '+target+'. Saved for your review.';
    }
    var fb=$('glaw-feedback');
    if(fb){
      fb.className='glaw-feedback '+(ok?'glaw-fb-ok':'glaw-fb-bad');
      fb.innerHTML='<div class="glaw-fb-line">'+esc(visible)+'</div>'+
        (step.ps?'<div class="glaw-fb-ps pashto" dir="rtl" lang="ps">'+esc(step.ps)+'</div>':'')+
        '<div class="zk-action-row glaw-action-row" style="margin-top:8px;gap:8px;">'+
          '<button type="button" class="glaw-btn glaw-btn-ghost" onclick="GrammarAutoWizard.hear()">🔊 Hear Again</button>'+
          '<button type="button" class="glaw-btn glaw-btn-primary" id="glaw-next-after-fb" onclick="GrammarAutoWizard.next()">'+
            (W.idx>=W.steps.length-1?'Finish ✓':'Next →')+'</button>'+
        '</div>';
      fb.style.display='block';
      try{ fb.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){}
    }
    // Spoken feedback; auto-advance ONLY after feedback TTS ends (+ pause)
    speak(spoken, function(){
      if(W.autoMode){ clearAuto(); W.autoTimer=setTimeout(advance,1200); }
    });
  }
  function saveWeak(step, said){
    try{
      if(typeof window.gwAddWeakItem!=='function') return;
      var rec={
        topicId: step.topicRef||W.topicId, topicTitle: W.topicTitle,
        itemId: step.itemId||('glaw.'+W.topicId+'.step'+W.idx),
        mistakeType: (step.weakTags&&step.weakTags[0])||'weak:speaking-repeat',
        questionText: step.target, correctAnswer: step.target,
        studentAnswer: said||'', timestamp: Date.now()
      };
      if(GL&&GL.extendWeakRecord) GL.extendWeakRecord(rec,{
        sourceMode:'wizard', categoryId:step.categoryId,
        levelNumber:step.levelNumber, weakTags:step.weakTags, domainTags:step.domainTags
      });
      window.gwAddWeakItem(rec);
    }catch(e){}
  }

  /* ── STEP BUILDER — everything becomes hear→speak→judged ────────────────── */
  // GL (Foundation Path) topics: lessonBlocks + wizard session items.
  function buildStepsGL(t){
    var steps=[];
    (t.lessonBlocks||[]).forEach(function(b){
      if(b.type==='explanation'||b.type==='note'){
        var first=(b.en||'').split(/(?<=\.)\s+/)[0]||b.en||'';
        steps.push({kind:'rule',label:b.titleEn||'Rule & Meaning',
          intro:b.en, ps:b.ps, target:first, weakTags:t.weakTags});
      } else if(b.type==='formula'){
        var rows=b.rows||[];
        var tgt=''; for(var i=rows.length-1;i>=0;i--){ if(/[a-z]/i.test(rows[i].en)&&!/\+/.test(rows[i].en)){ tgt=rows[i].en; break; } }
        if(!tgt&&rows.length) tgt=rows[0].en;
        steps.push({kind:'formula',label:b.titleEn||'Formula',rows:rows,
          intro:(b.titleEn||'Formula')+'. '+rows.map(function(r){return r.en;}).join('. '),
          target:tgt, weakTags:t.weakTags});
      } else if(b.type==='examples'){
        (b.items||[]).slice(0,4).forEach(function(x){
          steps.push({kind:'example',label:b.titleEn||'Example',
            intro:x.en, ps:x.ps, target:x.en, domain:x.domain, weakTags:t.weakTags});
        });
      } else if(b.type==='commonMistake'){
        steps.push({kind:'mistake',label:'Common Mistake',
          wrongEn:b.wrongEn,rightEn:b.rightEn,noteEn:b.noteEn,ps:b.notePs,
          intro:'Common mistake. Wrong: '+(b.wrongEn||'')+'. Correct: '+(b.rightEn||'')+'. '+(b.noteEn||'')+' Now you say the correct sentence.',
          target:b.rightEn||'', weakTags:t.weakTags});
      }
    });
    var wiz=t.wizardSessionId?(GL.sessions||{})[t.wizardSessionId]:null;
    if(wiz&&wiz.items){
      wiz.items.slice(0,3).forEach(function(it){
        var tgt=it.modelAnswer||it.answer||(it.acceptable&&it.acceptable[0])||it.promptEn;
        var intro=(it.wrongSentence?('Correct this sentence: '+it.wrongSentence)
                  :it.promptEn)+'. Say your answer after the beep of the microphone.';
        steps.push({kind:'practice',label:'Practice',intro:intro,
          promptEn:it.promptEn,wrongSentence:it.wrongSentence,ps:it.feedbackPs,
          target:tgt,itemId:it.id,topicRef:it.topicRef,categoryId:it.categoryId,
          levelNumber:it.levelNumber,weakTags:it.weakTags,domainTags:it.domainTags});
      });
    }
    return steps;
  }
  // Grammar World topics (GW_TOPICS): overview, formula, forms/examples.
  function buildStepsGW(t){
    var steps=[];
    var ov=t.overviewEn||t.explanationEn||'';
    if(ov){
      steps.push({kind:'rule',label:'Meaning & Use',intro:ov,
        ps:t.overviewPs||t.explanationPs,
        target:ov.split(/(?<=\.)\s+/)[0]||ov});
    }
    if(t.formula){
      steps.push({kind:'formula',label:'Formula / Structure',
        rows:[{en:t.formula}],intro:'The formula is: '+t.formula,target:t.formula});
    }
    var groups=t.forms?t.forms:(t.examples?[{label:'Examples',items:t.examples}]:[]);
    var count=0;
    groups.forEach(function(g){
      (g.items||[]).forEach(function(ex){
        if(count>=6) return;
        count++;
        steps.push({kind:'example',label:g.label||'Example',
          intro:ex.en, ps:ex.ps, target:ex.en});
      });
    });
    (t.commonMistakes||[]).slice(0,2).forEach(function(m){
      var wrong=m.wrong||m.wrongEn||'', right=m.right||m.rightEn||'';
      if(!right) return;
      steps.push({kind:'mistake',label:'Common Mistake',wrongEn:wrong,rightEn:right,
        noteEn:m.note||m.noteEn,ps:m.notePs,
        intro:'Common mistake. Wrong: '+wrong+'. Correct: '+right+'. Now you say the correct sentence.',
        target:right});
    });
    return steps;
  }

  /* ── RENDER ─────────────────────────────────────────────────────────────── */
  function open(topicId, source){
    stopSpeak(); abortMic();
    var t=null, steps=[];
    if(source==='gw'){
      t=(window.GW_TOPICS||{})[topicId];
      if(!t) return;
      W.topicTitle=t.title||topicId; steps=buildStepsGW(t);
      W.backFn=function(){ if(typeof window.gwOpenTopic==='function') window.gwOpenTopic(topicId); };
    } else {
      if(!GL||!GL.topics[topicId]) return;
      t=GL.topics[topicId];
      W.topicTitle=t.titleEn||topicId; steps=buildStepsGL(t);
      W.backFn=function(){ if(GL.openTopic) GL.openTopic(topicId); };
    }
    if(!steps.length) return;
    W.topicId=topicId; W.steps=steps; W.idx=0; W.results=[]; W.scored=false;
    W.autoMode=(typeof window.ZirakAutoReadOn==='function')?!!window.ZirakAutoReadOn():true;
    renderShell();
    renderStep();
  }
  function renderShell(){
    var el=glEl(); if(!el) return;
    el.innerHTML=
      '<div class="gw-inner glaw-overlay">'+
        '<div class="glaw-header">'+
          '<button type="button" class="glaw-exit-btn" onclick="GrammarAutoWizard.exit()">✕ Exit</button>'+
          '<div class="glaw-header-center">'+
            '<span class="glaw-header-icon">🪄</span>'+
            '<span class="glaw-header-title">'+esc(W.topicTitle)+'</span>'+
          '</div>'+
          '<button type="button" class="glaw-guide-btn" onclick="GrammarAutoWizard.guide()">❓ Guide</button>'+
          '<div class="glaw-auto-wrap">'+
            '<span class="glaw-auto-lbl">AUTO</span>'+
            '<button type="button" class="glaw-auto-toggle '+(W.autoMode?'glaw-auto-on':'')+'" id="glaw-auto-toggle" onclick="GrammarAutoWizard.toggleAuto()"></button>'+
          '</div>'+
        '</div>'+
        '<div id="glaw-step-area"></div>'+
        '<div style="height:28px;"></div>'+
      '</div>';
  }
  function renderStep(){
    var area=$('glaw-step-area'); if(!area) return;
    stopSpeak(); abortMic();
    var step=W.steps[W.idx];
    if(!step){ renderSummary(); return; }
    W.scored=false; W.transcript='';
    var idx=W.idx, total=W.steps.length;
    var pct=Math.round(((idx+1)/total)*100);

    var contentHtml='';
    if(step.kind==='formula'&&step.rows){
      contentHtml=(step.rows||[]).map(function(r){
        return '<div class="glaw-formula-row"><span class="glaw-formula-en">'+esc(r.en)+'</span>'+
          (r.ps?'<span class="glaw-formula-ps pashto" dir="rtl" lang="ps">'+esc(r.ps)+'</span>':'')+'</div>';
      }).join('');
    } else if(step.kind==='mistake'){
      contentHtml='<div class="glaw-mistake-wrong">✗ '+esc(step.wrongEn||'')+'</div>'+
        '<div class="glaw-mistake-right">✓ '+esc(step.rightEn||'')+'</div>'+
        (step.noteEn?'<div class="glaw-card-en" style="font-size:13px;margin-top:4px;">'+esc(step.noteEn)+'</div>':'');
    } else if(step.kind==='practice'){
      contentHtml=(step.wrongSentence?'<div class="glaw-mistake-wrong">✗ '+esc(step.wrongSentence)+'</div>':'')+
        '<div class="glaw-card-en">'+esc(step.promptEn||step.intro||'')+'</div>';
    } else {
      contentHtml='<div class="glaw-card-en">'+esc(step.intro||'')+'</div>';
    }

    area.innerHTML=
      '<div class="glaw-progress">'+
        '<div class="glaw-progress-label">Step '+(idx+1)+' of '+total+
          ' <span class="glaw-progress-step-type">· '+esc(step.label)+'</span></div>'+
        '<div class="glaw-progress-bar"><div class="glaw-progress-fill" style="width:'+pct+'%"></div></div>'+
      '</div>'+
      '<div class="glaw-card'+(step.kind==='mistake'?' glaw-card-mistake':'')+'">'+
        '<div class="glaw-card-label">'+iconFor(step.kind)+' '+esc(step.label)+'</div>'+
        contentHtml+
        (step.ps?'<div class="glaw-card-ps pashto" dir="rtl" lang="ps">'+esc(step.ps)+'</div>':'')+
      '</div>'+
      // Hear / Repeat row (interview style)
      '<div class="zk-action-row glaw-action-row">'+
        '<button type="button" class="glaw-btn glaw-btn-primary glaw-btn-wide" onclick="GrammarAutoWizard.hear()">🔊 Hear</button>'+
        '<button type="button" class="glaw-btn glaw-btn-ghost" onclick="GrammarAutoWizard.repeatMic()">🎤 Repeat</button>'+
      '</div>'+
      // Red listening panel (interview style)
      '<div class="glaw-listen-panel" id="glaw-listen-panel" style="display:none;">'+
        '<div class="glaw-listen-line"><span class="glaw-mic-dot"></span> Listening… speak your answer in English</div>'+
        '<div class="glaw-mic-emoji">🎤</div>'+
      '</div>'+
      '<div class="glaw-mic-status" id="glaw-mic-status" style="display:none;"></div>'+
      '<div class="glaw-transcript" id="glaw-transcript">…</div>'+
      // Controls row
      '<div class="zk-action-row glaw-action-row" style="gap:8px;">'+
        '<button type="button" class="glaw-btn glaw-btn-danger" id="glaw-stop-listen" style="display:none;" onclick="GrammarAutoWizard.stopMic()">■ Stop Listening</button>'+
        '<button type="button" class="glaw-btn glaw-btn-ghost" onclick="GrammarAutoWizard.typeAnswer()">⌨ Type Answer</button>'+
        '<button type="button" class="glaw-btn glaw-btn-ghost" onclick="GrammarAutoWizard.clearAnswer()">✕ Clear</button>'+
      '</div>'+
      '<div id="glaw-type-area" style="display:none;padding:0 14px;">'+
        '<input type="text" class="glaw-input" id="glaw-input" style="width:100%;margin:8px 0 0;" placeholder="Type what you would say…" '+
          'onkeydown="if(event.key===\'Enter\'){GrammarAutoWizard.submitTyped();}">'+
        '<div class="zk-action-row glaw-action-row" style="padding:8px 0 0;">'+
          '<button type="button" class="glaw-btn glaw-btn-primary" onclick="GrammarAutoWizard.submitTyped()">Check ✓</button>'+
        '</div>'+
      '</div>'+
      // Sample + Tips (interview style)
      '<div id="glaw-sample" class="glaw-sample" style="display:none;">'+
        '<div class="glaw-sample-label">👀 Sample Answer</div>'+
        '<div class="glaw-sample-en">'+esc(step.target||'')+'</div>'+
      '</div>'+
      '<div class="zk-action-row glaw-action-row" style="gap:8px;">'+
        '<button type="button" class="glaw-btn glaw-btn-sample" onclick="GrammarAutoWizard.toggleSample()">👀 Show Sample Answer</button>'+
        '<button type="button" class="glaw-btn glaw-btn-tips" onclick="GrammarAutoWizard.showTips()">💡 Tips</button>'+
      '</div>'+
      '<div class="glaw-feedback" id="glaw-feedback" style="display:none;"></div>'+
      '<div class="glaw-nav-row">'+
        (idx>0?'<button type="button" class="glaw-btn glaw-btn-ghost" onclick="GrammarAutoWizard.prev()">← Previous</button>':'<span></span>')+
        '<button type="button" class="glaw-btn glaw-btn-primary" onclick="GrammarAutoWizard.next()">'+
          (idx>=total-1?'Finish ✓':'Next →')+'</button>'+
      '</div>'+
      '<div class="glaw-back-row">'+
        '<button type="button" class="glaw-btn glaw-btn-outline" onclick="GrammarAutoWizard.exit()">← Back to Topic</button>'+
      '</div>';

    // AUTO: speak intro; when TTS truly ends (+safety delay) → mic on automatically
    var spokenIntro=step.intro||step.target||'';
    if(step.kind!=='practice' && step.kind!=='mistake'){
      spokenIntro+= '. Now repeat after me: '+(step.target||'');
    }
    speak(spokenIntro, function(){
      if(W.autoMode && !W.scored){ startMic(); }
    });
  }
  function iconFor(k){
    return k==='rule'?'📘':k==='formula'?'📐':k==='example'?'💬':k==='mistake'?'⚠':'✏';
  }
  function advance(){
    stopSpeak(); abortMic();
    if(W.idx<W.steps.length-1){ W.idx++; renderStep(); }
    else renderSummary();
  }

  /* ── FINAL LOUD REVIEW + WHATSAPP (app.js report pattern) ───────────────── */
  function renderSummary(){
    var area=$('glaw-step-area'); if(!area) return;
    stopSpeak(); abortMic();
    var total=W.results.length||1;
    var okCount=W.results.filter(function(r){return r.ok;}).length;
    var pct=Math.round((okCount/total)*100);
    var weakOnes=W.results.filter(function(r){return !r.ok;});
    var status=pct>=80?'Excellent':pct>=60?'Passed Strongly':pct>=40?'Passed, Needs Review':'Repeat Weak Parts';

    area.innerHTML=
      '<div class="glaw-result">'+
        '<div class="glaw-result-icon">'+(pct>=60?'🎉':'💪')+'</div>'+
        '<div class="glaw-result-title">Wizard Complete!</div>'+
        '<div class="glaw-result-topic">'+esc(W.topicTitle)+'</div>'+
        '<div class="glaw-result-score">Score: <b>'+okCount+' / '+total+'</b> ('+pct+'%) — '+esc(status)+'</div>'+
        (weakOnes.length?
          '<div class="glaw-result-note">Sentences to practice again:</div>'+
          '<div class="glaw-weak-list">'+weakOnes.slice(0,5).map(function(r){
            return '<div class="glaw-weak-item">• '+esc(r.target)+'</div>';}).join('')+'</div>'+
          '<div class="glaw-result-note-ps pashto" dir="rtl" lang="ps">دا جملې بیا تمرین کړه — بیاکتنې ته خوندي شوې.</div>'
          :'<div class="glaw-result-ok">Excellent — every sentence was strong!</div>')+
        '<div class="zk-action-row glaw-action-row" style="gap:10px;justify-content:center;">'+
          '<button type="button" class="glaw-btn glaw-btn-wa" onclick="GrammarAutoWizard.sendWhatsApp()">📲 Send Result to Father (WhatsApp)</button>'+
        '</div>'+
        '<div class="zk-action-row glaw-action-row" style="gap:10px;justify-content:center;">'+
          (weakOnes.length&&typeof window.gwReviewWeak==='function'?
            '<button type="button" class="glaw-btn glaw-btn-ghost" onclick="gwReviewWeak()">⭐ Review Weak</button>':'')+
          '<button type="button" class="glaw-btn glaw-btn-ghost" onclick="GrammarAutoWizard.retry()">🔁 Practice Again</button>'+
          '<button type="button" class="glaw-btn glaw-btn-primary" onclick="GrammarAutoWizard.exit()">← Back to Topic</button>'+
        '</div>'+
      '</div>';

    // LOUD spoken review (interview-summary style), mentioning the WhatsApp send.
    var spoken='Well done! You finished the '+W.topicTitle+' wizard. Your score is '+
      okCount+' out of '+total+'. '+
      (weakOnes.length
        ? 'You have '+weakOnes.length+' sentence'+(weakOnes.length>1?'s':'')+
          ' to practice again. They are saved in your weak grammar review. '
        : 'Every sentence was strong. Excellent work. ')+
      'You can send this result to your father on WhatsApp with the green button.';
    // I6H-C: Learning Ledger record (auto-wizard summary, rich payload)
    try {
      if (window.ZirakLearningLedger) {
        window.ZirakLearningLedger.recordActivity({
          source: 'grammar-auto-wizard',
          sectionTitle: 'Auto-Wizard: ' + W.topicTitle,
          topicTitle: W.topicTitle,
          good: okCount, total: total, pct: pct,
          weakItems: weakOnes.map(function (r) { return r.target; }),
          reviewItems: W.results.map(function (r) {
            return { q: r.target, ok: !!r.ok, said: r.said || '', pct: r.pct };
          }),
          activityType: 'auto-wizard'
        });
      }
    } catch (eLlg) {}
    speak(spoken,null);
  }
  function sendWhatsApp(){
    var total=W.results.length||1;
    var okCount=W.results.filter(function(r){return r.ok;}).length;
    var pct=Math.round((okCount/total)*100);
    var status=pct>=80?'Excellent':pct>=60?'Passed Strongly':pct>=40?'Passed, Needs Review':'Repeat Weak Parts';
    var weakOnes=W.results.filter(function(r){return !r.ok;});
    var student='', rawWA='';
    try{
      var p=(window.ZirakProfile&&window.ZirakProfile.getActive)?window.ZirakProfile.getActive():null;
      if(p){ student=p.fullName||''; rawWA=String(p.fatherWhatsApp||'').replace(/[^0-9]/g,''); }
    }catch(e){}
    var msg='🎓 ZIRAK ENGLISH ACADEMY — Grammar Wizard Report\n\n'+
      (student?('Student: '+student+'\n'):'')+
      'Topic: '+W.topicTitle+'\n'+
      'Score: '+okCount+' / '+total+' ('+pct+'%)\n'+
      'Status: '+status+'\n'+
      (weakOnes.length?('Needs practice: '+weakOnes.slice(0,3).map(function(r){return r.target;}).join(' | ')+'\n'):'')+
      'Date: '+new Date().toLocaleDateString()+'\n\n'+
      '(No action needed — the student continues automatically.)\n\n'+
      'Sent via Zirak English App 🌟';
    var encoded=encodeURIComponent(msg);
    var url=rawWA?('https://wa.me/'+rawWA+'?text='+encoded):('https://wa.me/?text='+encoded);
    try{ window.open(url,'_blank'); }catch(e){}
  }

  /* ── PUBLIC API ─────────────────────────────────────────────────────────── */
  var GrammarAutoWizard={
    open:function(topicId){ open(topicId,'gl'); },
    openGW:function(topicId){ open(topicId,'gw'); },
    exit:function(){ stopSpeak(); abortMic(); if(W.backFn) W.backFn(); else if(GL&&GL.exitToHome) GL.exitToHome(); },
    guide:function(){ stopSpeak(); abortMic();
      speak('This is the grammar wizard. Listen to each sentence, then repeat it clearly when the microphone turns on. I will check your answer and help you. Your mistakes go to weak review, and at the end you can send your result to your father on WhatsApp.',null); },
    toggleAuto:function(){
      W.autoMode=!W.autoMode;
      var b=$('glaw-auto-toggle'); if(b) b.classList.toggle('glaw-auto-on',W.autoMode);
      if(!W.autoMode){ stopSpeak(); abortMic(); }
      else if(!W.scored){ var s=W.steps[W.idx]; if(s) speak(s.intro||s.target||'',function(){ if(W.autoMode&&!W.scored) startMic(); }); }
    },
    hear:function(){ var s=W.steps[W.idx]; if(!s) return;
      speak(s.target||s.intro||'', function(){ if(W.autoMode&&!W.scored) startMic(); }); },
    repeatMic:function(){ if(!W.isSpeaking) startMic(); },
    stopMic:stopMicManual,
    typeAnswer:function(){ abortMic(); showTypeFallback(); var i=$('glaw-input'); if(i) i.focus(); },
    submitTyped:function(){ var i=$('glaw-input'); var v=i?i.value:''; abortMic();
      var box=$('glaw-transcript'); if(box) box.textContent=v||'…';
      W.transcript=v; scoreCurrentStep(v); },
    clearAnswer:function(){ W.transcript=''; var b=$('glaw-transcript'); if(b) b.textContent='…';
      var i=$('glaw-input'); if(i) i.value=''; var f=$('glaw-feedback'); if(f) f.style.display='none'; W.scored=false; },
    toggleSample:function(){ var s=$('glaw-sample'); if(s) s.style.display=(s.style.display==='none'?'block':'none'); },
    showTips:function(){ var s=W.steps[W.idx];
      speak('Tip: listen first, then say the whole sentence slowly and clearly. The sentence is: '+((s&&s.target)||''),null); },
    next:function(){ advance(); },
    prev:function(){ stopSpeak(); abortMic(); if(W.idx>0){ W.idx--; W.results.pop(); renderStep(); } },
    retry:function(){ var id=W.topicId, gw=!!(window.GW_TOPICS&&window.GW_TOPICS[id]&&!(GL&&GL.topics[id])); open(id, gw?'gw':'gl'); },
    sendWhatsApp:sendWhatsApp
  };
  window.GrammarAutoWizard=GrammarAutoWizard;

  function init(){
    if(!window.ZirakGrammarLab){ setTimeout(init,250); return; }
    GL=window.ZirakGrammarLab;
    GL.openAutoWizard=GrammarAutoWizard.open;
  }
  init();
})();
