// ===================================================================
// content-pack-registry.js
// Zirak PWA — Content Pack Registry
// Version: v1.15A-content-expansion-framework
//
// PURPOSE:
//   - Describes content pack metadata for all registered packs.
//   - Provides safe helper functions for future content expansion.
//   - Does NOT replace WORD_SETS.
//   - Does NOT contain vocabulary content.
//   - Loaded AFTER content.js (which defines WORD_SETS),
//     BEFORE content-pack1a.js (which registers itself here).
//
// SCRIPT ORDER:
//   content-core.js → content-wordlab.js → content-grammar.js →
//   content-dialogues.js → content-review.js → content.js →
//   content-pack-registry.js → content-pack1a.js →
//   content-pashto-patch.js → app.js
// ===================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------
  // Internal registry store
  // ---------------------------------------------------------------
  var _registeredPacks = [];

  // ---------------------------------------------------------------
  // ZIRAK_PACK_REGISTRY
  // Public array of registered pack metadata objects.
  // Each entry is added by zirakRegisterPack() at pack load time.
  // ---------------------------------------------------------------
  window.ZIRAK_PACK_REGISTRY = _registeredPacks;

  // ---------------------------------------------------------------
  // zirakRegisterPack(packMeta)
  //
  // Called at the bottom of each content pack file to register
  // its metadata. Safe to call multiple times — duplicate pack IDs
  // are ignored (logs a warning instead of throwing).
  //
  // Pack metadata schema:
  // {
  //   id:           string   — unique pack identifier e.g. "pack1a"
  //   titleEn:      string   — English display title
  //   titleDari:    string   — Dari display title
  //   titlePashto:  string   — Pashto display title
  //   version:      string   — version tag e.g. "v1.14B"
  //   sourceFile:   string   — filename e.g. "content-pack1a.js"
  //   wordSetKeys:  string[] — WORD_SETS keys provided by this pack
  //   type:         string   — "wordlab" | "grammar" | "dialogue" etc.
  //   status:       string   — "active" | "draft" | "disabled"
  // }
  // ---------------------------------------------------------------
  window.zirakRegisterPack = function (packMeta) {
    if (!packMeta || typeof packMeta.id !== 'string') {
      console.warn('[ZirakRegistry] zirakRegisterPack called with invalid metadata:', packMeta);
      return;
    }
    var existing = _registeredPacks.find(function (p) { return p.id === packMeta.id; });
    if (existing) {
      console.warn('[ZirakRegistry] Pack already registered, skipping duplicate: ' + packMeta.id);
      return;
    }
    _registeredPacks.push(packMeta);
    console.log('[ZirakRegistry] Registered pack: ' + packMeta.id + ' (' + (packMeta.titleEn || '') + ')');
  };

  // ---------------------------------------------------------------
  // zirakGetRegisteredPacks()
  //
  // Returns a copy of all registered pack metadata objects.
  // Safe to call at any time after this file is loaded.
  // ---------------------------------------------------------------
  window.zirakGetRegisteredPacks = function () {
    return _registeredPacks.slice();
  };

  // ---------------------------------------------------------------
  // zirakBuildPackSummaryFromWordSets()
  //
  // Inspects the global WORD_SETS object and returns a summary
  // of which registered pack keys are present and which are missing.
  // Useful for diagnostics and the content audit.
  //
  // Returns:
  // {
  //   packs: [
  //     {
  //       id:           string,
  //       titleEn:      string,
  //       wordSetKeys:  string[],
  //       found:        string[],   — keys present in WORD_SETS
  //       missing:      string[]    — keys absent from WORD_SETS
  //     },
  //     ...
  //   ]
  // }
  // ---------------------------------------------------------------
  window.zirakBuildPackSummaryFromWordSets = function () {
    var ws = (typeof WORD_SETS !== 'undefined') ? WORD_SETS : {};
    var result = {
      packs: _registeredPacks.map(function (pack) {
        var found = [];
        var missing = [];
        var keys = Array.isArray(pack.wordSetKeys) ? pack.wordSetKeys : [];
        keys.forEach(function (key) {
          if (ws[key]) {
            found.push(key);
          } else {
            missing.push(key);
          }
        });
        return {
          id:          pack.id,
          titleEn:     pack.titleEn || pack.id,
          wordSetKeys: keys,
          found:       found,
          missing:     missing
        };
      })
    };
    return result;
  };

  console.log('[ZirakRegistry] content-pack-registry.js loaded. Ready for pack registration.');

})();

// ===================================================================
// END content-pack-registry.js
// ===================================================================
