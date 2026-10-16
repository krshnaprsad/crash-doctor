#!/usr/bin/env node
/* node cli/doctor.js crash.txt   (or pipe the log in). Prints the likely cause and the steps. */
const fs = require("fs"), D = require("../src/doctor.js");
function show(text) {
  const r = D.diagnose(text), f = r.facts, out = [];
  const facts = [f.app && "Program: " + f.app, f.module && "Crashed in: " + f.module + (/^(ntdll|kernelbase|kernel32|ucrtbase)\.dll$/i.test(f.module) ? " (a Windows file, so it says little by itself)" : ""), f.code && "Error code: " + f.code + (f.codeMeaning ? " - " + f.codeMeaning : "")].filter(Boolean);
  if (facts.length) out.push("What the log says", ...facts.map(x => "  " + x), "");
  if (r.empty) out.push("I did not recognise this one. Try the general checklist:", ...D.GENERAL.map((x, i) => "  " + (i + 1) + ". " + x));
  r.matches.forEach((m, i) => { out.push((i + 1) + ". " + m.title + " (" + m.strength + ")", "   " + m.cause); if (m.seen) out.push("   Seen in the log: " + m.seen); m.steps.forEach((s, j) => out.push("   " + (j + 1) + ") " + s.replace(/\[([^\]]+)\]\((https:[^)]+)\)/g, "$1 ($2)"))); if (m.limit) out.push("   Honest limit: " + m.limit); out.push(""); });
  console.log(out.join("\n"));
}
const file = process.argv[2];
if (file) show(fs.readFileSync(file, "utf8")); else if (!process.stdin.isTTY) { let d = ""; process.stdin.on("data", c => d += c).on("end", () => show(d)); } else console.log("Usage: node cli/doctor.js crash.txt");
