/* ==========================================================
   storage.js — LocalStorage helper for Live Dashboard
   ========================================================== */

const StorageHelper = (() => {
  const KEY_REPORT = "ld_report_number";
  const KEY_TARGET = "ld_target_number";
  const KEY_LOG    = "ld_log_history";

  function isAvailable() {
    try {
      const t = "__test__";
      localStorage.setItem(t, t);
      localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }

  function save(key, value) {
    if (!isAvailable()) return;
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function load(key) {
    if (!isAvailable()) return null;
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function remove(key) {
    if (!isAvailable()) return;
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  return {
    saveReport:   (v) => save(KEY_REPORT, v),
    loadReport:   ()  => load(KEY_REPORT),
    saveTarget:   (v) => save(KEY_TARGET, v),
    loadTarget:   ()  => load(KEY_TARGET),
    saveLog:      (arr) => save(KEY_LOG, JSON.stringify(arr)),
    loadLog:      () => {
      try { return JSON.parse(load(KEY_LOG) || "[]"); }
      catch (e) { return []; }
    },
    clearAll: () => {
      remove(KEY_REPORT);
      remove(KEY_TARGET);
      remove(KEY_LOG);
    }
  };
})();
