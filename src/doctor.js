/* Reads a pasted crash log or error from a game, app or Windows and matches it against the fixes list. Works in Node and in the browser. */
(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(typeof require === "function" ? require("../data/fixes.js") : root.CRASH_FIXES); else root.Doctor = factory(root.CRASH_FIXES); })(this, function (FIXES) {
  var CODES = {
    "0xc0000005": "Access violation (the program touched memory it should not)",
    "0xc000007b": "Bad image format (32 and 64 bit files mixed up)",
    "0xc0000142": "A file failed to start",
    "0xc0000135": "A needed component was not found",
    "0xc0000374": "Heap corruption (memory damage)",
    "0xc0000409": "Stack buffer overrun",
    "0xe06d7363": "The program threw a C++ error",
    "0xc0000094": "Divide by zero",
    "0xc00000fd": "Stack overflow",
    "0x80000003": "A breakpoint was hit",
    "0xc0000006": "In page error (could not read from disk)",
    "0xc000001d": "Illegal instruction (the CPU cannot run this code)",
    "0xc0000096": "Privileged instruction",
    "0xc000041d": "An unhandled error inside a Windows callback",
    "0xe0434352": "An unhandled .NET error"
  };
  var SYSTEM_MODULES = /^(ntdll|kernelbase|kernel32|ucrtbase|user32|win32u|combase|msvcrt)\.dll$/i;
  var JAVA = { 52: 8, 53: 9, 54: 10, 55: 11, 56: 12, 57: 13, 58: 14, 59: 15, 60: 16, 61: 17, 62: 18, 63: 19, 64: 20, 65: 21, 66: 22, 67: 23 };
  function uniq(a) { var s = {}; return a.filter(function (x) { var k = x.toLowerCase(); if (s[k]) return false; s[k] = 1; return true; }); }
  function first(t, re) { var m = t.match(re); return m ? m[1].trim() : ""; }

  function facts(t) {
    var f = {};
    f.app = first(t, /faulting application name:\s*([^\s,]+)/i) || first(t, /application:\s*([\w.-]+\.exe)/i);
    f.module = first(t, /faulting module name:\s*([^\s,]+)/i);
    f.code = (first(t, /exception code:\s*(0x[0-9a-f]+)/i) || first(t, /\b(0x(?:c000[0-9a-f]{4}|e06d7363|e0434352|80000003|40000015))\b/i) || "").toLowerCase();
    f.codeMeaning = f.code && CODES[f.code] ? CODES[f.code] : "";
    f.exes = uniq(t.match(/\b[\w-]+\.exe\b/gi) || []).slice(0, 4);
    f.dlls = uniq((t.match(/[\w.-]+\.dll(?=[^\n]{0,40}(was not found|is missing|not found|could not be found|cannot be found))/gi) || []).map(function (x) { return x.replace(/\s.*$/, ""); })).slice(0, 5);
    if (!f.dlls.length) f.dlls = uniq((t.match(/(?:can'?t|cannot|could not) find[^\n]{0,40}?([\w.-]+\.dll)/gi) || []).map(function (x) { return x.match(/[\w.-]+\.dll/i)[0]; })).slice(0, 5);
    var jv = t.match(/class file version (\d+)/i); if (jv && JAVA[+jv[1]]) f.java = JAVA[+jv[1]];
    var sm = t.match(/suspected mods?:\s*([^\n]+)/i); if (sm) f.suspected = sm[1].trim().slice(0, 200);
    var desc = t.match(/^description:\s*([^\n]+)/im); if (desc) f.description = desc[1].trim().slice(0, 160);
    return f;
  }
  // a pasted Windows event list can hold several crashes; list each one
  function events(t) {
    var parts = t.split(/(?=Faulting application name:)/i).filter(function (x) { return /Faulting application name:/i.test(x); });
    return parts.map(function (x) { var f = facts(x); return { app: f.app, module: f.module, code: f.code, codeMeaning: f.codeMeaning }; });
  }
  function fill(text, f) {
    return text
      .replace("{module}", f.module ? " (" + f.module + ")" : "")
      .replace("{dll}", f.dlls && f.dlls.length ? " (" + f.dlls.join(", ") + ")" : "")
      .replace("{java}", f.java ? ". It needs Java " + f.java : "")
      .replace("{mc}", f.suspected ? ". This one says: " + f.suspected : "")
      .replace("{code}", f.code || "");
  }
  function evidence(t, re) { var lines = t.split(/\n/); for (var i = 0; i < lines.length; i++) if (re.test(lines[i])) return lines[i].trim().slice(0, 200); return ""; }

  function diagnose(text) {
    text = String(text || "");
    var f = facts(text), hits = [];
    FIXES.forEach(function (fx) {
      var score = 0, why = "";
      fx.match.forEach(function (m) { var re = new RegExp(m.re, "i"); if (re.test(text)) { score += m.w; if (!why || m.w >= 3) why = why && m.w < 3 ? why : (evidence(text, re) || why); } });
      if (score > 0) hits.push({ id: fx.id, title: fx.title, games: fx.games, score: score, strength: score >= 4 ? "strong" : score >= 3 ? "likely" : "possible", cause: fill(fx.cause, f), steps: fx.steps.slice(), limit: fx.limit || "", seen: why });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    // a generic "file missing" hit should not outrank the specific runtime it points to
    var specific = hits.some(function (h) { return h.id === "vcredist" || h.id === "directx-files" || h.id === "steam-api"; });
    if (specific) hits.forEach(function (h) { if (h.id === "missing-dll") { h.score -= 4; h.strength = h.score >= 4 ? "strong" : h.score >= 3 ? "likely" : "possible"; } });
    hits = hits.filter(function (h) { return h.score > 0; }).sort(function (a, b) { return b.score - a.score; });
    // the Adobe panel entry already covers its own browser and the Adobe app advice
    if (hits.some(function (h) { return h.id === "adobe-cep"; })) hits = hits.filter(function (h) { return h.id !== "adobe-app" && h.id !== "chromium-embedded"; });
    var spec = hits;
    return { facts: f, events: events(text), matches: spec.slice(0, 5), empty: !spec.length, length: text.length };
  }
  function redact(t) { return String(t || "").replace(/([A-Za-z]:\\Users\\)[^\\\/\s"']+/gi, "$1<user>").replace(/(\/Users\/|\/home\/)[^\/\s"']+/g, "$1<user>").replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "<ip>"); }
  var GENERAL = [
    "Restart the PC, then open the program again.",
    "Update the program that crashed. For a game, verify or repair its files in the launcher (Steam: right click the game, Properties, Installed Files, Verify integrity; [Steam help](https://help.steampowered.com/en/faqs/view/0C48-FCBD-DA71-93EB)).",
    "Update the graphics driver from the maker directly: [NVIDIA](https://www.nvidia.com/en-us/drivers/), [AMD](https://www.amd.com/en/support/download/drivers.html) or [Intel](https://www.intel.com/content/www/us/en/support/detect.html).",
    "Remove mods, plugins and add-ons and add them back one at a time.",
    "Close overlays, recorders and anything that hooks into other programs (Discord, GeForce overlay, MSI Afterburner, RTSS, OBS).",
    "Run the program as administrator once (right click, Properties, Compatibility).",
    "Install the latest Visual C++ Redistributable, [x64](https://aka.ms/vs/17/release/vc_redist.x64.exe) and [x86](https://aka.ms/vs/17/release/vc_redist.x86.exe), and run [Windows Update](https://support.microsoft.com/en-us/windows/windows-update-faq-8a903416-6f45-0718-f5c7-375e92dddeb2).",
    "Open Command Prompt as administrator and run sfc /scannow, then DISM /Online /Cleanup-Image /RestoreHealth, to repair Windows files."
  ];
  var PS = "Get-WinEvent -FilterHashtable @{LogName='Application'; ProviderName='Application Error'} -MaxEvents 3 | Format-List TimeCreated, Message | Out-String | Set-Clipboard";
  return { diagnose: diagnose, facts: facts, redact: redact, GENERAL: GENERAL, POWERSHELL: PS, CODES: CODES, fixes: FIXES };
});
