/* ============================================================================
   zirak-institute-calendar.js — PHASE I6H-C
   ONE INSTITUTE CALENDAR ENGINE (local, no cloud, no Google Calendar).
   ----------------------------------------------------------------------------
   Academy schedule:
     Saturday  = study day 1        Thursday = weekend / off
     Sunday    = study day 2        Friday   = weekend / off
     Monday    = study day 3
     Tuesday   = study day 4
     Wednesday = study day 5

   Week/period math:
     • The academy week starts on SATURDAY.
     • An anchor Saturday (the Saturday of the week this module first runs)
       is persisted once in localStorage — institute-wide, NOT per student —
       so week numbers stay stable across visits and profiles.
     • Two-week block  = ceil(weekNumber / 2)
     • Academy "month" = 4 study weeks = 20 study days = ceil(weekNumber / 4)

   Holidays (foundation only, NO UI yet):
     • Manual date-key list in localStorage 'zirak_institute_holidays'.
     • addHoliday / removeHoliday / getHolidays / isHoliday are exposed so a
       later teacher screen can manage them. A holiday makes a study weekday
       a no-class day and changes the label.

   All functions accept an optional Date for testability; default = now.
   ============================================================================ */
(function () {
  'use strict';

  var DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  // jsDay (0=Sun..6=Sat) → study day number; Thu(4)/Fri(5) are off.
  var STUDY_MAP = { 6:1, 0:2, 1:3, 2:4, 3:5 };

  var LS_ANCHOR   = 'zirak_institute_anchor_saturday';
  var LS_HOLIDAYS = 'zirak_institute_holidays';

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function dateKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function dayName(d) { d = d || new Date(); return DAY_NAMES[d.getDay()]; }

  // Midnight-local copy of the most recent Saturday (start of academy week).
  function startOfAcademyWeek(d) {
    var base = d || new Date();
    var x = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    var diff = (x.getDay() - 6 + 7) % 7;   // days since Saturday
    x.setDate(x.getDate() - diff);
    return x;
  }

  // Institute epoch: persisted once; safe under storage failures.
  function getAnchorSaturday() {
    try {
      var raw = localStorage.getItem(LS_ANCHOR);
      if (raw) {
        var parts = String(raw).split('-');
        if (parts.length === 3) {
          return new Date(+parts[0], +parts[1] - 1, +parts[2]);
        }
      }
    } catch (e) {}
    var a = startOfAcademyWeek(new Date());
    try { localStorage.setItem(LS_ANCHOR, dateKey(a)); } catch (e) {}
    return a;
  }

  function weekNumber(d) {
    var a = getAnchorSaturday();
    var s = startOfAcademyWeek(d || new Date());
    return Math.floor((s.getTime() - a.getTime()) / (7 * 24 * 3600 * 1000)) + 1;
  }

  /* ── Holidays (functions only; teacher UI comes in a later phase) ───────── */
  function getHolidays() {
    try { return JSON.parse(localStorage.getItem(LS_HOLIDAYS) || '[]') || []; }
    catch (e) { return []; }
  }
  function saveHolidays(list) {
    try { localStorage.setItem(LS_HOLIDAYS, JSON.stringify(list || [])); } catch (e) {}
  }
  function addHoliday(key) {
    var l = getHolidays();
    if (l.indexOf(key) === -1) { l.push(key); saveHolidays(l); }
    return l;
  }
  function removeHoliday(key) {
    var l = getHolidays().filter(function (x) { return x !== key; });
    saveHolidays(l);
    return l;
  }
  function isHoliday(d) { return getHolidays().indexOf(dateKey(d)) !== -1; }

  /* ── The main info object ───────────────────────────────────────────────── */
  function todayInfo(d) {
    d = d || new Date();
    var jd  = d.getDay();
    var sd  = STUDY_MAP.hasOwnProperty(jd) ? STUDY_MAP[jd] : null;
    var hol = isHoliday(d);
    var study = (sd !== null) && !hol;
    var wk  = weekNumber(d);
    var two = Math.ceil(wk / 2);
    var mon = Math.ceil(wk / 4);   // 4 study weeks = 20 study days
    var label;
    if (hol)         label = 'Holiday / No class expected';
    else if (!study) label = 'Weekend / No class expected';
    else             label = 'Week ' + wk + ' \u2014 Day ' + sd + ', ' + DAY_NAMES[jd];
    return {
      dateKey: dateKey(d), dayName: DAY_NAMES[jd], jsDay: jd,
      isStudyDay: study, isWeekend: sd === null, isHoliday: hol,
      studyDayNumber: study ? sd : null,
      weekNumber: wk, twoWeekBlock: two, academyMonth: mon,
      label: label
    };
  }

  /* ── Date-key ranges for the ledger getters ─────────────────────────────── */
  function keysFrom(firstSat, days) {
    var out = [];
    for (var i = 0; i < days; i++) {
      var x = new Date(firstSat);
      x.setDate(firstSat.getDate() + i);
      out.push(dateKey(x));
    }
    return out;
  }
  function weekDateKeys(d) {
    return keysFrom(startOfAcademyWeek(d || new Date()), 7);
  }
  // I6H-D7: the STUDY week only — Saturday through Wednesday (5 days).
  // Thursday/Friday are weekend and deliberately excluded, unlike
  // weekDateKeys() above which returns all 7 calendar days. Reuses the same
  // startOfAcademyWeek()/keysFrom()/weekNumber()/todayInfo() this file
  // already has — no new date math, no second calendar system.
  function getAcademyWeekRange(d) {
    d = d || new Date();
    var start = startOfAcademyWeek(d);
    var studyKeys = keysFrom(start, 5); // Sat, Sun, Mon, Tue, Wed
    var end = new Date(start);
    end.setDate(start.getDate() + 4); // Wednesday
    var wk = weekNumber(d);
    var info = todayInfo(d);
    var startLabel = DAY_NAMES[start.getDay()] + ' ' + pad(start.getDate()) + ' ' +
      start.toLocaleString('en-US', { month: 'long' });
    var endLabel = DAY_NAMES[end.getDay()] + ' ' + pad(end.getDate()) + ' ' +
      end.toLocaleString('en-US', { month: 'long' });
    return {
      weekStartDateKey: dateKey(start),
      weekEndDateKey: dateKey(end),
      studyDateKeys: studyKeys,
      weekLabel: 'Week ' + wk + ': ' + startLabel + ' \u2014 ' + endLabel,
      academyMonth: info.academyMonth,
      academyWeekNumber: wk
    };
  }
  // I6H-D8: Two-Week Review range — reuses the SAME twoWeekBlock number
  // todayInfo() already computes (Math.ceil(weekNumber/2)), so this aligns
  // with existing calendar bookkeeping rather than inventing a rolling
  // "last 14 days" concept. Two consecutive academy study weeks, 10 study
  // days total, Thu/Fri excluded from both.
  function getAcademyTwoWeekRange(d) {
    d = d || new Date();
    var info = todayInfo(d);
    var block = info.twoWeekBlock;
    var a = getAnchorSaturday();
    var week1Start = new Date(a);
    week1Start.setDate(a.getDate() + (block - 1) * 2 * 7);
    var week1Keys = keysFrom(week1Start, 5);
    var week1End = new Date(week1Start); week1End.setDate(week1Start.getDate() + 4);
    var week2Start = new Date(week1Start); week2Start.setDate(week1Start.getDate() + 7);
    var week2Keys = keysFrom(week2Start, 5);
    var week2End = new Date(week2Start); week2End.setDate(week2Start.getDate() + 4);
    var startLabel = DAY_NAMES[week1Start.getDay()] + ' ' + pad(week1Start.getDate()) + ' ' +
      week1Start.toLocaleString('en-US', { month: 'long' });
    var endLabel = DAY_NAMES[week2End.getDay()] + ' ' + pad(week2End.getDate()) + ' ' +
      week2End.toLocaleString('en-US', { month: 'long' });
    return {
      rangeStartDateKey: dateKey(week1Start),
      rangeEndDateKey: dateKey(week2End),
      studyDateKeys: week1Keys.concat(week2Keys),
      weekRanges: [
        { weekStartDateKey: dateKey(week1Start), weekEndDateKey: dateKey(week1End), studyDateKeys: week1Keys },
        { weekStartDateKey: dateKey(week2Start), weekEndDateKey: dateKey(week2End), studyDateKeys: week2Keys }
      ],
      twoWeekLabel: 'Two-Week Review ' + block + ': ' + startLabel + ' \u2014 ' + endLabel,
      academyMonth: info.academyMonth,
      academyReviewNumber: block
    };
  }
  // I6H-D9: Monthly Academy Exam range — reuses the SAME academyMonth
  // number todayInfo() already computes (Math.ceil(weekNumber/4)), so this
  // aligns with existing calendar bookkeeping. Four consecutive academy
  // study weeks, 20 study days total, Thu/Fri excluded throughout.
  function getAcademyMonthlyRange(d) {
    d = d || new Date();
    var info = todayInfo(d);
    var monthNum = info.academyMonth;
    var a = getAnchorSaturday();
    var monthStart = new Date(a);
    monthStart.setDate(a.getDate() + (monthNum - 1) * 4 * 7);
    var weekRanges = [], twoWeekRanges = [], allStudyKeys = [];
    for (var w = 0; w < 4; w++) {
      var wStart = new Date(monthStart); wStart.setDate(monthStart.getDate() + w * 7);
      var wKeys = keysFrom(wStart, 5);
      var wEnd = new Date(wStart); wEnd.setDate(wStart.getDate() + 4);
      weekRanges.push({ weekStartDateKey: dateKey(wStart), weekEndDateKey: dateKey(wEnd), studyDateKeys: wKeys });
      allStudyKeys = allStudyKeys.concat(wKeys);
    }
    for (var tw = 0; tw < 2; tw++) {
      var twStart = new Date(monthStart); twStart.setDate(monthStart.getDate() + tw * 14);
      var twEnd = new Date(twStart); twEnd.setDate(twStart.getDate() + 11); // second week's Wednesday
      twoWeekRanges.push({
        rangeStartDateKey: dateKey(twStart), rangeEndDateKey: dateKey(twEnd),
        studyDateKeys: allStudyKeys.slice(tw * 10, tw * 10 + 10)
      });
    }
    var monthEnd = new Date(monthStart); monthEnd.setDate(monthStart.getDate() + 25); // 4th week's Wednesday
    var startLabel = DAY_NAMES[monthStart.getDay()] + ' ' + pad(monthStart.getDate()) + ' ' +
      monthStart.toLocaleString('en-US', { month: 'long' });
    var endLabel = DAY_NAMES[monthEnd.getDay()] + ' ' + pad(monthEnd.getDate()) + ' ' +
      monthEnd.toLocaleString('en-US', { month: 'long' });
    return {
      monthStartDateKey: dateKey(monthStart),
      monthEndDateKey: dateKey(monthEnd),
      studyDateKeys: allStudyKeys,
      weekRanges: weekRanges,
      twoWeekRanges: twoWeekRanges,
      monthlyLabel: 'Academy Month ' + monthNum + ': ' + startLabel + ' \u2014 ' + endLabel,
      academyMonth: monthNum,
      academyMonthNumber: monthNum,
      academyYear: monthStart.getFullYear()
    };
  }
  function twoWeekDateKeys(d) {
    var b = todayInfo(d).twoWeekBlock;
    var a = getAnchorSaturday();
    var first = new Date(a);
    first.setDate(a.getDate() + (b - 1) * 2 * 7);
    return keysFrom(first, 14);
  }
  function academyMonthDateKeys(d) {
    var m = todayInfo(d).academyMonth;
    var a = getAnchorSaturday();
    var first = new Date(a);
    first.setDate(a.getDate() + (m - 1) * 4 * 7);
    return keysFrom(first, 28);
  }

  window.ZirakInstituteCalendar = {
    DAY_NAMES: DAY_NAMES,
    dateKey: dateKey,
    dayName: dayName,
    startOfAcademyWeek: startOfAcademyWeek,
    getAnchorSaturday: getAnchorSaturday,
    weekNumber: weekNumber,
    todayInfo: todayInfo,
    weekDateKeys: weekDateKeys,
    getAcademyWeekRange: getAcademyWeekRange,
    getAcademyTwoWeekRange: getAcademyTwoWeekRange,
    getAcademyMonthlyRange: getAcademyMonthlyRange,
    twoWeekDateKeys: twoWeekDateKeys,
    academyMonthDateKeys: academyMonthDateKeys,
    getHolidays: getHolidays,
    addHoliday: addHoliday,
    removeHoliday: removeHoliday,
    isHoliday: isHoliday
  };
})();
