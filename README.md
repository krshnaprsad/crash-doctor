# Game Crash Doctor

Paste a game's crash report or error message and get the likely cause and the steps to try.

Made by Zero3.

## What it does

A tool that fixes any game on its own is not realistic, every game breaks in its own way. So I built the part that is: it reads what you paste, matches it against a list of crash causes that come up again and again, and gives you the fix steps in plain words. It also pulls out the useful facts for you, like the game file, the file it crashed in and what the error code means.

If it does not recognise the crash, it says so and gives you a general checklist instead of guessing.

## Use it

Open the app: https://krshnaprsad.github.io/game-crash-doctor/

Or download the repo and open `index.html`. Nothing to install and nothing leaves your computer.

On Windows, the easiest way to get crash info is the line shown under "Where do I find the crash info on Windows?" in the app. Paste it into PowerShell right after a crash, then paste the result into the app.

## What it knows right now

Missing Visual C++ files, error 0xc000007b, 0xc0000142 and 0xc0000135, missing DirectX files, graphics driver crashes, DirectX start up failures, out of memory, wrong Java version, Minecraft mod crashes, anti-cheat problems, missing dll files, Steam start up problems, .NET problems, Unity and Unreal crashes, memory damage errors, general access violations, mod file (.asi) crashes, unreadable game files, permission problems, and blue screen names, Adobe extension panel crashes (CEPHtmlEngine) and an ASUS display utility crash. Not everything it reads has to be a game, so it also works on other Windows programs that crash.

## Things to know

- It matches patterns in text. It cannot see your PC, so it gives likely causes, not certainties. The label on each result (strong match, likely, possible) shows how specific the match was.
- Steps start with the quickest and most likely fix. Tick them off as you go.
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
