/* ==========================================================
   script.js — Live Dashboard main logic
   ========================================================== */

(function () {
  "use strict";

  // ========== Element refs ==========
  const reportInput = document.getElementById("reportNumber");
  const targetInput = document.getElementById("targetNumber");
  const statusEl    = document.getElementById("status");
  const showReport  = document.getElementById("showReport");
  const showTarget  = document.getElementById("showTarget");
  const startTimeEl = document.getElementById("startTime");
  const liveTimeEl  = document.getElementById("liveTime");
  const durationEl  = document.getElementById("duration");
  const counterEl   = document.getElementById("counter");
  const logBox      = document.getElementById("logBox");

  const btnPaste  = document.getElementById("pasteBtn");
  const btnClear  = document.getElementById("clearBtn");
  const btnStart  = document.getElementById("startBtn");
  const btnStop   = document.getElementById("stopBtn");
  const btnReset  = document.getElementById("resetBtn");
  const btnExport = document.getElementById("exportBtn");

  // ========== State ==========
  let timer = null;
  let count = 0;
  let startTimestamp = null;
  let running = false;

  // ========== Log ==========
  function addLog(msg) {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement("div");
    div.textContent = `[${time}] ${msg}`;
    logBox.prepend(div);
    if (logBox.children.length > 100) logBox.removeChild(logBox.lastChild);
  }

  // ========== Restore from storage ==========
  function restoreFromStorage() {
    const r = StorageHelper.loadReport();
    const t = StorageHelper.loadTarget();
    if (r) { reportInput.value = r; showReport.textContent = r; }
    if (t) { targetInput.value = t; showTarget.textContent = t; }
    addLog("Session loaded.");
  }

  // ========== Disable/Enable buttons ==========
  function setButtonsRunning(isRunning) {
    btnStart.disabled = isRunning;
    btnStop.disabled  = !isRunning;
    reportInput.disabled = isRunning;
    targetInput.disabled = isRunning;
  }
  setButtonsRunning(false);

  // ========== Paste ==========
  btnPaste.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) { alert("Clipboard empty hai."); return; }
      reportInput.value = text.trim();
      showReport.textContent = text.trim();
      StorageHelper.saveReport(text.trim());
      addLog("Report number pasted.");
    } catch (err) {
      alert("Clipboard read nahi ho paya. Manually paste karo.");
    }
  });

  // ========== Clear ==========
  btnClear.addEventListener("click", () => {
    reportInput.value = "";
    targetInput.value = "";
    StorageHelper.clearAll();
    addLog("Inputs cleared.");
  });

  // ========== Start ==========
  btnStart.addEventListener("click", () => {
    if (running) { addLog("Already running..."); return; }

    const report = reportInput.value.trim();
    const target = targetInput.value.trim();

    if (!report || !target) {
      alert("Report Number aur Target Number dono bharo.");
      return;
    }
    if (!/^\d+$/.test(target)) {
      alert("Target Number sirf digits me hona chahiye.");
      return;
    }

    StorageHelper.saveReport(report);
    StorageHelper.saveTarget(target);

    count = 0;
    counterEl.textContent = "0";
    startTimestamp = Date.now();
    running = true;

    showReport.textContent = report;
    showTarget.textContent = target;
    startTimeEl.textContent = new Date().toLocaleTimeString();
    statusEl.textContent = "LIVE";
    statusEl.className = "live";

    setButtonsRunning(true);
    addLog(`▶ Started | Report: ${report} | Target: ${target}`);

    timer = setInterval(() => {
      count++;
      counterEl.textContent = count;
      liveTimeEl.textContent = new Date().toLocaleTimeString();

      const diff = Math.floor((Date.now() - startTimestamp) / 1000);
      const hh = String(Math.floor(diff / 3600)).padStart(2, "0");
      const mm = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const ss = String(diff % 60).padStart(2, "0");
      durationEl.textContent = `${hh}:${mm}:${ss}`;
    }, 1000);
  });

  // ========== Stop ==========
  btnStop.addEventListener("click", () => {
    if (!running) { addLog("Not running."); return; }
    clearInterval(timer);
    timer = null;
    running = false;
    statusEl.textContent = "STOPPED";
    statusEl.className = "stopped";
    setButtonsRunning(false);
    addLog(`🛑 Stopped | Counter: ${count}`);
  });

  // ========== Reset ==========
  btnReset.addEventListener("click", () => {
    clearInterval(timer);
    timer = null;
    running = false;
    count = 0;
    startTimestamp = null;

    statusEl.textContent = "Stopped";
    statusEl.className = "stopped";
    showReport.textContent = "-";
    showTarget.textContent = "-";
    startTimeEl.textContent = "-";
    liveTimeEl.textContent = "-";
    durationEl.textContent = "00:00:00";
    counterEl.textContent = "0";
    reportInput.value = "";
    targetInput.value = "";
    logBox.innerHTML = "";

    StorageHelper.clearAll();
    setButtonsRunning(false);
    addLog("🔄 Reset done.");
  });

  // ========== Export ==========
  btnExport.addEventListener("click", () => {
    const logs = Array.from(logBox.children)
      .map(d => d.textContent)
      .reverse()
      .join("\n");
    if (!logs) { alert("Log empty hai."); return; }
    const blob = new Blob([logs], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "live_dashboard_log_" + Date.now() + ".txt";
    a.click();
    URL.revokeObjectURL(a.href);
    addLog("💾 Log exported.");
  });

  // ========== Shortcuts ==========
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !running) btnStart.click();
    if (e.key === "Escape" && running) btnStop.click();
  });

  // ========== Init ==========
  restoreFromStorage();
  addLog("App ready.");
})();
