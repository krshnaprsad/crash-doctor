const assert = require("assert"), D = require("../src/doctor.js"), F = require("../data/fixes.js");
const top = t => D.diagnose(t).matches.map(m => m.id);
// data sanity: every entry is complete and every pattern compiles
F.forEach(f => { assert.ok(f.id && f.title && f.cause && f.steps.length >= 2 && f.match.length, f.id); f.match.forEach(m => { new RegExp(m.re, "i"); assert.ok(m.w >= 1 && m.w <= 4, f.id); }); });
assert.strictEqual(new Set(F.map(f => f.id)).size, F.length, "ids must be unique");
assert.ok(!JSON.stringify(F).includes("\u2014"), "no em dashes");
// the real case: Windows crash entry inside a mod file
const gta = "Faulting application name: gta_sa.exe, version: 1.0.0.0\nFaulting module name: modloader.asi, version: 0.0.0.0\nException code: 0xc0000005";
assert.strictEqual(top(gta)[0], "modloader-asi"); assert.strictEqual(D.facts(gta).module, "modloader.asi"); assert.strictEqual(D.facts(gta).code, "0xc0000005");
assert.strictEqual(top("The code execution cannot proceed because VCRUNTIME140.dll was not found.")[0], "vcredist");
assert.ok(D.diagnose("The code execution cannot proceed because VCRUNTIME140.dll was not found.").matches[0].cause.includes("VCRUNTIME140.dll"));
assert.strictEqual(top("The application was unable to start correctly (0xc000007b). Click OK")[0], "c000007b");
assert.strictEqual(top("d3dx9_43.dll is missing from your computer")[0], "directx-files");
assert.strictEqual(top("Display driver nvlddmkm stopped responding and has successfully recovered")[0], "gpu-driver");
assert.strictEqual(top("DXGI_ERROR_DEVICE_REMOVED")[0], "gpu-driver");
assert.strictEqual(top("java.lang.UnsupportedClassVersionError: class file version 61.0")[0], "java-version");
assert.ok(D.diagnose("class file version 61.0 UnsupportedClassVersionError").matches[0].cause.includes("Java 17"));
assert.ok(top("---- Minecraft Crash Report ----\nDescription: Exception in server tick loop\nSuspected Mods: Create (create)").includes("minecraft-mod"));
assert.ok(D.diagnose("---- Minecraft Crash Report ----\nSuspected Mods: Create (create)").matches[0].cause.includes("Create (create)"));
assert.strictEqual(top("Exception code: 0xc0000374")[0], "heap");
assert.strictEqual(top("java.lang.OutOfMemoryError: Java heap space")[0], "out-of-memory");
assert.strictEqual(top("EasyAntiCheat launch failed")[0], "anticheat");
assert.ok(top("steam_api64.dll missing").includes("steam-api"));
// unknown and empty input must not invent a cause
assert.ok(D.diagnose("everything is fine, I just like logs").empty); assert.ok(D.diagnose("").empty);
// share-safe copy hides the Windows user name and IPs
assert.strictEqual(D.redact("C:\\Users\\krishna\\Games\\a.exe 192.168.1.5"), "C:\\Users\\<user>\\Games\\a.exe <ip>");
// a Windows file as the crashing module should not be blamed on its own
assert.strictEqual(D.facts("Faulting module name: ntdll.dll, version: 10.0\nException code: 0xc0000374").module, "ntdll.dll");
console.log("doctor tests passed");
