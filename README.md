# Crash Doctor

Games / Apps / System

Paste a crash report or error message from a game, an app or Windows and get the likely cause and the steps to try.

Made by Zero3.

## What it does

A tool that fixes any crash on its own is not realistic, every program breaks in its own way. So I built the part that is: it reads what you paste, matches it against a list of crash causes that come up again and again, and gives you the fix steps in plain words. It also pulls out the useful facts for you, like the program, the file it crashed in and what the error code means.

If it does not recognise the crash, it says so and gives you a general checklist instead of guessing.

## Upload a photo

You can also upload, drop or paste a photo or screenshot of a crash report. The text is read in your browser with Tesseract.js (open source, free), the picture is not uploaded anywhere, and the text lands in the box so you can fix mistakes before pressing Diagnose. The first time it downloads the text reader (about 10 MB) from a public CDN, so it needs an internet connection. Clean screenshots read well. Camera photos of a screen are much less reliable, so always check file names and error codes against the picture.

## Use it

Open the app: https://krshnaprsad.github.io/crash-doctor/

Or download the repo and open `index.html`. Nothing to install and nothing leaves your computer.

On Windows, the easiest way to get crash info is the line shown under "Where do I find the crash info on Windows?" in the app. Paste it into PowerShell right after a crash, then paste the result into the app.

## What it knows right now

Games and mods: mod file (.asi) crashes, Minecraft mod crashes and wrong Java versions, anti-cheat problems, Steam start up problems, Unity and Unreal crashes, DirectX start up failures.

Apps: Adobe apps and their extension panels (CEPHtmlEngine), Microsoft Office, web browsers, apps with a built in browser (Electron, CEF), .NET programs, Windows Explorer, an ASUS display utility, and security software hooked into a program.

Windows and general: missing Visual C++ or DirectX files, errors 0xc000007b, 0xc0000142, 0xc0000135, 0xc000041d, 0xe06d7363, 0xe0434352, graphics driver crashes, out of memory, memory damage errors, access violations, missing dll files, permission problems, damaged system files and disks, and blue screen names.

## Things to know

- It matches patterns in text. It cannot see your PC, so it gives likely causes, not certainties. The label on each result (strong match, likely, possible) shows how specific the match was.
- Steps start with the quickest and most likely fix. Tick them off as you go.
- It knows games and mods best, and it reads any Windows crash text, so for a program it does not know it falls back to the general checklist.
- It does not help get around anti-cheat, and it never tells you to download single dll files from random websites.
- The share button copies your log with your Windows user name and IP addresses hidden, in case you want to post it somewhere.
- The PowerShell line is meant for Windows 10 and 11. I tested the matching and the app, so if the line does not work on your PC, tell me.

## Add a fix

The list lives in `data/fixes.js`. Every entry is a few lines of plain text, so it is easy to add one. See CONTRIBUTING.md.

You can also open an issue with a crash log and what fixed it.

## Run it from the command line

```
node cli/doctor.js crash.txt
```

That needs Node 18 or newer and nothing to install.

MIT licence.
