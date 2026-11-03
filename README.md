# Arch Linux Web Simulator

A small Arch Linux desktop simulator that runs entirely in the browser, built with plain HTML, CSS and JavaScript. No frameworks, no build step, no dependencies.

**Live demo:** https://YOUR-USERNAME.github.io/Arch-Linux-Web-Simulator/

## Features

- Boot sequence and login screen (any password works)
- Desktop with top panel (menu button and clock), icons and a dock
- Draggable, resizable windows with correct stacking order; double-click a title bar to maximize
- Terminal with `help`, `ls`, `clear`, `neofetch`, `whoami`, `pwd`, `date`, `echo`
- File Manager with a directory tree (Home, Documents, Downloads)
- Text Editor and a Settings app (accent color)

## Run locally

Download or clone the repository and open `index.html` in any modern browser.

## Project structure

```
index.html      page layout
css/style.css   theme and styling
js/windows.js   window manager (drag, resize, close, z-index)
js/apps.js      Terminal, File Manager, Text Editor, Settings
js/main.js      boot, login, clock, menu and dock
preview/        screenshots
```

## Deploy on GitHub Pages

Settings -> Pages -> Source: "Deploy from a branch" -> Branch: `main`, folder `/ (root)` -> Save.

## License

MIT
