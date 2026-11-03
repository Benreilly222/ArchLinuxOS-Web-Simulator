# Arch Linux Web Simulator

A small Arch Linux desktop simulator that runs entirely in the browser, built with plain HTML, CSS and JavaScript. No frameworks, no build step, no dependencies.

**Live demo:** https://benreilly222.github.io/ArchLinuxOS-Web-Simulator/

## Features

- Boot sequence, first-boot name setup (saved in the browser) and login screen (any password works)
- Animated, blurred wallpaper with frosted-glass panel, dock, menus and windows
- Top panel with app menu (search), task list, tray, clock and user menu
- Windows: drag, resize, minimize, maximize, close, correct stacking order
- Terminal with a virtual file system: `fastfetch`, `neofetch`, `ls`, `cd`, `cat`, `mkdir`, `touch`, `rm`, `echo > file`, `pacman`, `htop`, `ping`, `ip`, `free`, `df`, `cowsay`, `calc`, `open <app>` and more
- File Manager and Text Editor share the same virtual file system (double-click a file to edit it)
- Settings: accent color, glass blur, wallpaper animation, reset account

## Run locally

Download or clone the repository and open `index.html` in any modern browser.

## Project structure

```
index.html      page layout
css/style.css   theme and styling
js/fs.js        virtual file system
js/windows.js   window manager (drag, resize, minimize, maximize)
js/terminal.js  terminal and its commands
js/apps.js      File Manager, Text Editor, Settings
js/main.js      boot, login, clock, menu and dock
preview/        screenshots
```

## Deploy on GitHub Pages

Settings -> Pages -> Source: "Deploy from a branch" -> Branch: `main`, folder `/ (root)` -> Save.

## License

MIT
