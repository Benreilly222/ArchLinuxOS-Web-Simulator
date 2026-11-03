/* ==========================================================
   Applications: each function builds content and opens a window
   ========================================================== */

/* ---------- Terminal ---------- */
function openTerminal() {
  const box = document.createElement("div");
  box.className = "term";
  box.innerHTML =
    '<pre class="out">Arch Linux demo terminal. Type "help" to see commands.</pre>' +
    '<div class="row"><span class="prompt">user@arch:~$</span>' +
    '<input type="text" spellcheck="false" autocomplete="off"></div>';
  const out = box.querySelector(".out");
  const input = box.querySelector("input");
  const started = Date.now();

  // Command table: name -> function that returns the output text
  const commands = {
    help: () => "Available: help, ls, clear, neofetch, whoami, pwd, date, echo, pacman",
    ls: () => "Desktop  Documents  Downloads  Music  Pictures",
    whoami: () => "user",
    pwd: () => "/home/user",
    date: () => new Date().toString(),
    pacman: () => "error: no operation specified (use -h for help)",
    neofetch: () => String.raw`      /\        user@arch
     /  \       ---------
    /    \      OS: Arch Linux x86_64
   /      \     Kernel: 6.x-arch1
  /   ,,   \    Shell: bash 5.2
 /   |  |   \   WM: Web Desktop
/_-''    ''-_\  Uptime: ` + Math.max(1, Math.round((Date.now() - started) / 60000)) + " min"
  };

  const history = [];
  let hi = 0;

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && hi > 0) { hi--; input.value = history[hi]; }
    else if (e.key === "ArrowDown" && hi < history.length) { hi++; input.value = history[hi] || ""; }
    else if (e.key === "Enter") {
      const line = input.value.trim();
      const name = line.split(" ")[0];
      input.value = "";
      if (line) { history.push(line); hi = history.length; }
      out.textContent += "\nuser@arch:~$ " + line;
      if (name === "clear") out.textContent = "";
      else if (name === "echo") out.textContent += "\n" + line.slice(5);
      else if (commands[name]) out.textContent += "\n" + commands[name]();
      else if (line) out.textContent += "\nbash: " + name + ": command not found";
      box.parentElement.scrollTop = box.parentElement.scrollHeight;
    }
  });
  box.onclick = () => input.focus();

  createWindow("Terminal", box);
  input.focus();
}

/* ---------- Text Editor ---------- */
function openEditor() {
  const area = document.createElement("textarea");
  area.className = "editor";
  area.placeholder = "Start typing...";
  createWindow("Text Editor", area);
  area.focus();
}

/* ---------- File Manager ---------- */
function openFiles() {
  // Demo data only: folder name -> file names
  const data = {
    Home: ["Desktop", "Documents", "Downloads", ".bashrc", ".config"],
    Documents: ["notes.txt", "report.pdf", "todo.md"],
    Downloads: ["archlinux.iso", "photo.png", "setup.sh"]
  };
  const box = document.createElement("div");
  box.className = "fm";
  box.innerHTML = '<div class="tree"></div><div class="files"></div>';
  const tree = box.querySelector(".tree");
  const files = box.querySelector(".files");

  function show(name, item) {
    tree.querySelectorAll("div").forEach((d) => d.classList.remove("active"));
    item.classList.add("active");
    files.innerHTML = "";
    data[name].forEach((f) => {
      const row = document.createElement("div");
      row.textContent = f;
      files.appendChild(row);
    });
  }
  Object.keys(data).forEach((name) => {
    const item = document.createElement("div");
    item.textContent = name;
    item.onclick = () => show(name, item);
    tree.appendChild(item);
  });

  createWindow("File Manager", box);
  show("Home", tree.firstChild);
}

/* ---------- Settings ---------- */
function openSettings() {
  const box = document.createElement("div");
  box.className = "settings";
  box.innerHTML =
    '<h3 style="margin:0">Settings</h3>' +
    "<label>Accent color</label>" +
    '<input type="color" value="#1793d1">';
  box.querySelector("input").oninput = (e) =>
    document.documentElement.style.setProperty("--arch", e.target.value);
  createWindow("Settings", box);
}

// Map app names (used in data-app attributes) to their open functions
const apps = { terminal: openTerminal, files: openFiles, editor: openEditor, settings: openSettings };
