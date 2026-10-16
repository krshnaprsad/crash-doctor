/* node tools/check-links.js  Checks that every link in data/fixes.js loads. Needs internet, so it is not part of npm test.
   Some sites (Microsoft, Intel, Adobe) answer scripts with 403 even when the page is fine in a browser. Those are listed as "blocked", check them by hand. */
const F = require("../data/fixes.js"), D = require("../src/doctor.js");
const urls = new Set(); F.concat([{ steps: D.GENERAL }]).forEach(f => f.steps.forEach(s => (s.match(/https:\/\/[^\s)\]]+/g) || []).forEach(u => urls.add(u))));
(async () => { for (const u of urls) { try { const r = await fetch(u, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0" } }); console.log((r.ok ? "ok     " : r.status === 403 ? "blocked" : "FAIL " + r.status) + " " + u); } catch (e) { console.log("FAIL   " + u + " " + e.message); } } })();
