(function () {
  var D = window.Doctor, $ = function (s) { return document.querySelector(s); };
  var EX = {
    gta: "Faulting application name: gta_sa.exe, version: 1.0.0.0, time stamp: 0x4a8a6e0b\nFaulting module name: modloader.asi, version: 0.0.0.0, time stamp: 0x5f0b2d3a\nException code: 0xc0000005\nFault offset: 0x0000a1b2\nFaulting application path: C:\\Users\\you\\Games\\GTA San Andreas\\gta_sa.exe",
    dll: "The code execution cannot proceed because VCRUNTIME140.dll was not found. Reinstalling the program may fix this problem.",
    gpu: "Display driver nvlddmkm stopped responding and has successfully recovered.\nD3D11 ERROR: DXGI_ERROR_DEVICE_REMOVED",
    java: "java.lang.UnsupportedClassVersionError: net/fabricmc/loader/impl/launch/knot/KnotClient has been compiled by a more recent version of the Java Runtime (class file version 65.0), this version of the Java Runtime only recognizes class file versions up to 61.0"
  };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function link(s) { return esc(s).replace(/(https?:\/\/[^\s<)]+[^\s<).,])/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
  function msg(t) { var m = $("#msg"); m.hidden = !t; m.textContent = t || ""; }
  function copy(text, done) {
    var ok = function () { msg(done); setTimeout(function () { msg(""); }, 2500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, function () { msg("Could not copy. Select the text and press Ctrl+C."); });
    else { var t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); ok(); } catch (e) { msg("Could not copy. Select the text and press Ctrl+C."); } t.remove(); }
  }
  function run() {
    var text = $("#log").value.trim(), out = $("#out"); out.innerHTML = "";
    if (!text) { msg("Paste a crash report or error message first."); return; } msg("");
    var r = D.diagnose(text), f = r.facts, h = "";
    var rows = [["Game file", f.app], ["Crashed in", f.module && f.module + (/^(ntdll|kernelbase|kernel32|ucrtbase)\.dll$/i.test(f.module) ? " (a Windows file, so it says little by itself)" : "")], ["Error code", f.code && f.code + (f.codeMeaning ? ", " + f.codeMeaning : "")], ["Missing file", f.dlls && f.dlls.join(", ")], ["Java needed", f.java && "Java " + f.java], ["Suspected mod", f.suspected]].filter(function (x) { return x[1]; });
    if (r.events.length > 1) h += '<section class="card"><h3>' + r.events.length + ' crashes found in what you pasted</h3><dl class="facts">' + r.events.map(function (e) { return "<dt>" + esc(e.app || "program") + "</dt><dd>crashed in " + esc(e.module || "unknown") + (e.code ? ", " + esc(e.code) + (e.codeMeaning ? " (" + esc(e.codeMeaning) + ")" : "") : "") + "</dd>"; }).join("") + "</dl></section>";
    else if (rows.length) h += '<section class="card"><h3>What the log says</h3><dl class="facts">' + rows.map(function (x) { return "<dt>" + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd>"; }).join("") + "</dl></section>";
    if (r.empty) {
      h += '<section class="card"><h2>I did not recognise this one</h2><p>I would rather say that than guess. Here is the checklist that fixes most game crashes, in the order I would try it:</p>' + steps(D.GENERAL) + '<p class="note">If none of it works, <a href="https://github.com/krshnaprsad/game-crash-doctor/issues/new" target="_blank" rel="noopener">open an issue</a> and paste the log (use the button below to hide your Windows user name first). When the cause is found, it goes on the fixes list for everyone.</p></section>';
    }
    r.matches.forEach(function (m, i) {
      h += '<section class="card m"><h2>' + (i + 1) + ". " + esc(m.title) + '<span class="badge ' + m.strength + '">' + (m.strength === "strong" ? "strong match" : m.strength === "likely" ? "likely" : "possible") + "</span></h2>" + (m.games ? '<p class="games">' + esc(m.games) + "</p>" : "") + "<p>" + esc(m.cause) + "</p>" + (m.seen ? '<div class="seen">' + esc(m.seen) + "</div>" : "") + steps(m.steps) + "</section>";
    });
    if (r.matches.length) h += '<p class="note">Tick a step when you have tried it. Start at the top, the first steps are the quickest and the most likely to work.</p>';
    h += '<div class="row"><button class="btn" id="cpsafe">Copy my log without my Windows user name</button><a class="btn" target="_blank" rel="noopener" href="https://github.com/krshnaprsad/game-crash-doctor/issues/new">Know a fix? Tell me</a></div>';
    out.innerHTML = h;
    var cs = $("#cpsafe"); if (cs) cs.onclick = function () { copy(D.redact(text), "Copied. Your user name and IP addresses are hidden."); };
    out.querySelectorAll("ol.steps li span").forEach(function (s) { s.onclick = function () { s.parentNode.classList.toggle("done"); }; });
    out.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function steps(list) { return '<ol class="steps">' + list.map(function (s) { return "<li><span>" + link(s) + "</span></li>"; }).join("") + "</ol>"; }
  $("#ps").textContent = D.POWERSHELL;
  $("#cpps").onclick = function () { copy(D.POWERSHELL, "Copied. Paste it into PowerShell and press Enter."); };
  $("#go").onclick = run;
  $("#clear").onclick = function () { $("#log").value = ""; $("#out").innerHTML = ""; msg(""); $("#log").focus(); };
  document.querySelectorAll("[data-ex]").forEach(function (b) { b.onclick = function () { $("#log").value = EX[b.getAttribute("data-ex")]; run(); }; });
  $("#log").addEventListener("keydown", function (e) { if (e.ctrlKey && e.key === "Enter") run(); });
})();
