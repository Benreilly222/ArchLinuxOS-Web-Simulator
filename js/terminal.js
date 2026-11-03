/* ==========================================================
   Terminal: a fake bash with a virtual file system and many tools
   ========================================================== */
const startTime = Date.now();                 // for uptime
const installedPkgs = new Set(["base", "linux", "bash", "pacman", "neovim", "fastfetch"]);

function openTerminal() {
  const box = document.createElement("div");
  box.className = "term";
  box.innerHTML = '<div class="out"></div><div class="row"><span class="prompt"></span><input spellcheck="false" autocomplete="off"></div>';
  const out = box.querySelector(".out");
  const input = box.querySelector("input");
  const promptEl = box.querySelector(".prompt");

  let cwd = homeDir();
  const history = [];
  let hi = 0;

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const scroll = () => { if (box.parentElement) box.parentElement.scrollTop = box.parentElement.scrollHeight; };
  const updatePrompt = () => { promptEl.textContent = USER + "@arch:" + (cwd.replace(homeDir(), "~") || "/") + "$"; };

  // Print one line (plain text by default, HTML when html=true)
  function print(s, html) {
    const d = document.createElement("div");
    d.className = "ln";
    if (html) d.innerHTML = s; else d.textContent = s;
    out.appendChild(d);
    scroll();
  }
  // Print lines one by one with a delay (used for pacman, ping)
  function steps(lines, done) {
    lines.forEach((l, i) => setTimeout(() => { print(l); if (i === lines.length - 1 && done) done(); }, 350 * (i + 1)));
  }

  // fastfetch / neofetch output with the Arch logo
  function fastfetch() {
    const logo = ["      /\\        ", "     /  \\       ", "    /    \\      ", "   /      \\     ", "  /   ,,   \\    ", " /   |  |   \\   ", "/_-''    ''-_\\  "];
    const up = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    const info = [
      ["", USER + "@arch"], ["OS", "Arch Linux x86_64"], ["Host", "Web Browser"], ["Kernel", "6.x-arch1"],
      ["Uptime", up + " min"], ["Packages", installedPkgs.size + " (pacman)"], ["Shell", "bash 5.2"],
      ["DE", "Web Desktop (glass)"], ["WM", "JS Window Manager"], ["Memory", "812MiB / 16GiB"]
    ];
    const rows = Math.max(logo.length, info.length);
    let html = "";
    for (let i = 0; i < rows; i++) {
      const l = '<span class="c1">' + esc(logo[i] || " ".repeat(18)) + "</span>";
      const r = info[i] ? (info[i][0] ? '<span class="c1"><b>' + info[i][0] + "</b></span>: " + esc(info[i][1]) : '<span class="c1"><b>' + esc(info[i][1]) + "</b></span>") : "";
      html += l + r + "\n";
    }
    const colors = ["#e5604f", "#5fd38d", "#f5c04f", "#1793d1", "#b07cf0", "#0db3a2", "#dbe3ee"];
    html += "\n" + " ".repeat(18) + colors.map((c) => '<span style="color:' + c + '">███</span>').join("");
    print(html, true);
  }

  // The package manager (simulated)
  function pacman(a) {
    const op = a[0] || "", pk = a.slice(1);
    if (op === "-Q") return [...installedPkgs].sort().join("\n");
    if (op === "-Syu" || op === "-Syyu") {
      steps([":: Synchronizing package databases...", " core   128.1 KiB  [##########] 100%", " extra    8.2 MiB  [##########] 100%", ":: Starting full system upgrade...", " there is nothing to do"]);
      return;
    }
    if (op === "-S" && pk.length) {
      steps(["resolving dependencies...", "Packages (" + pk.length + ") " + pk.join(" "), ":: Proceed with installation? [Y/n] y",
        "installing " + pk.join(", ") + "  [##########] 100%", ":: Running post-transaction hooks..."], () => pk.forEach((p) => installedPkgs.add(p)));
      return;
    }
    if (op === "-R" && pk.length) { pk.forEach((p) => installedPkgs.delete(p)); return "removing " + pk.join(", ") + "..."; }
    return "usage: pacman -Syu | -S <pkg> | -R <pkg> | -Q";
  }

  // Command table: name -> function(args, rawLine). Return text to print, or print inside.
  const cmds = {
    help: () => "Files:    ls cd pwd cat mkdir touch rm echo (echo hi > file)\n" +
      "Packages: pacman (-Syu -S -R -Q), yay\n" +
      "System:   fastfetch neofetch htop uname uptime free df ip ping whoami hostname date\n" +
      "Fun:      cowsay fortune calc open <app>\n" +
      "Shell:    history clear exit",
    clear: () => { out.innerHTML = ""; },
    fastfetch, neofetch: fastfetch,
    pacman, yay: pacman,
    whoami: () => USER,
    hostname: () => "arch",
    pwd: () => cwd,
    date: () => new Date().toString(),
    uname: (a) => (a[0] === "-a" ? "Linux arch 6.x-arch1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux" : "Linux"),
    uptime: () => " up " + Math.max(1, Math.round((Date.now() - startTime) / 60000)) + " min, 1 user, load average: 0.12, 0.08, 0.05",
    free: () => "               total        used        free\nMem:        16384000      831488    15552512\nSwap:        2097148           0     2097148",
    df: () => "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda2        98G   12G   81G  13% /\n/dev/sda1       512M   88M  424M  18% /boot",
    ip: () => "1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8\n2: wlan0: <BROADCAST,MULTICAST,UP> mtu 1500\n    inet 192.168.1.42/24",
    ping: (a) => { const h = a[0] || "archlinux.org"; steps(["PING " + h + " 56 bytes of data.", "64 bytes from " + h + ": time=12.1 ms", "64 bytes from " + h + ": time=11.8 ms", "--- " + h + " ping statistics: 2 packets, 0% loss"]); },
    htop: () => "  PID USER      CPU%  MEM%  COMMAND\n    1 root       0.0   0.1  systemd\n  412 " + USER + "     2.3   1.8  web-desktop\n  518 " + USER + "     0.7   0.9  bash\n  733 root       0.1   0.4  NetworkManager",
    history: () => history.map((h, i) => " " + (i + 1) + "  " + h).join("\n"),
    exit: () => { box.closest(".window").querySelector(".close").click(); },
    fortune: () => ["I use Arch, btw.", "Read the Arch Wiki first.", "sudo make me a sandwich.", "There is no place like 127.0.0.1."][Math.floor(Math.random() * 4)],
    cowsay: (a) => { const t = a.join(" ") || "Moo"; return " " + "_".repeat(t.length + 2) + "\n< " + t + " >\n " + "-".repeat(t.length + 2) + "\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||"; },
    calc: (a) => { const e = a.join(" "); if (!/^[0-9+\-*/().% ]+$/.test(e)) return "calc: numbers and + - * / ( ) only"; try { return String(Function('"use strict";return (' + e + ")")()); } catch (x) { return "calc: invalid expression"; } },
    open: (a) => { if (apps[a[0]]) apps[a[0]].open(); else return "open: apps are " + Object.keys(apps).join(", "); },
    ls: (a) => {
      const showAll = a.includes("-a");
      const target = a.find((x) => !x.startsWith("-"));
      const n = getNode(target ? normalize(target, cwd) : cwd);
      if (!n) return "ls: cannot access '" + target + "': No such file or directory";
      if (n.t === "f") return target;
      return Object.keys(n.ch).filter((k) => showAll || !k.startsWith(".")).sort().map((k) => k + (n.ch[k].t === "d" ? "/" : "")).join("  ");
    },
    cd: (a) => {
      const p = normalize(a[0] || "~", cwd), n = getNode(p);
      if (!n) return "cd: " + a[0] + ": No such file or directory";
      if (n.t !== "d") return "cd: " + a[0] + ": Not a directory";
      cwd = p; updatePrompt();
    },
    cat: (a) => { const n = getNode(normalize(a[0] || "", cwd)); return !n ? "cat: " + a[0] + ": No such file or directory" : n.t === "d" ? "cat: " + a[0] + ": Is a directory" : n.c; },
    mkdir: (a) => { const { dir, name } = parentOf(normalize(a[0] || "", cwd)); if (!dir || !name) return "mkdir: cannot create directory"; dir.ch[name] = { t: "d", ch: {} }; },
    touch: (a) => { const { dir, name } = parentOf(normalize(a[0] || "", cwd)); if (!dir || !name) return "touch: cannot touch file"; if (!dir.ch[name]) dir.ch[name] = { t: "f", c: "" }; },
    rm: (a) => { const { dir, name } = parentOf(normalize(a[a.length - 1] || "", cwd)); if (!dir || !dir.ch[name]) return "rm: cannot remove: No such file or directory"; delete dir.ch[name]; }
  };

  // Run one command line
  function run(line) {
    print(promptEl.textContent + " " + line);
    if (!line.trim()) return;
    history.push(line);
    hi = history.length;

    // echo text > file  (write into the virtual file system)
    const redir = line.match(/^echo\s+(.*?)\s*>\s*(\S+)$/);
    if (redir) {
      const { dir, name } = parentOf(normalize(redir[2], cwd));
      if (dir) dir.ch[name] = { t: "f", c: redir[1] + "\n" };
      return;
    }
    if (/^echo\b/.test(line)) { print(line.slice(5)); return; }

    const args = line.trim().split(/\s+/);
    let name = args.shift();
    if (name === "sudo") name = args.shift() || "";   // sudo is accepted and ignored
    if (!name) return;
    const fn = cmds[name];
    if (!fn) { print("bash: " + name + ": command not found"); return; }
    const r = fn(args, line);
    if (r !== undefined && r !== "") print(r);
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const l = input.value; input.value = ""; run(l); }
    else if (e.key === "ArrowUp" && hi > 0) { hi--; input.value = history[hi]; }
    else if (e.key === "ArrowDown" && hi < history.length) { hi++; input.value = history[hi] || ""; }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
  });
  box.onclick = () => input.focus();

  createWindow("Terminal", ">_", box);
  updatePrompt();
  print('Arch Linux web terminal. Type "help" for commands, try "fastfetch".');
  input.focus();
}
