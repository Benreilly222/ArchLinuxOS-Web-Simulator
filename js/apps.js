/* ==========================================================
   Apps: Editor, File Manager, Settings, plus the app registry
   ========================================================== */

/* ---------- Text Editor (opens and saves files in the virtual FS) ---------- */
function openEditor(path) {
  const box = document.createElement("div");
  box.className = "ed";
  box.innerHTML = '<div class="bar"><span>File:</span><input class="fname" placeholder="untitled.txt"><button>Save</button><span class="msg"></span></div><textarea placeholder="Start typing..."></textarea>';
  const name = box.querySelector(".fname"), area = box.querySelector("textarea"), msg = box.querySelector(".msg");

  // Load an existing file when a path is given
  if (path) {
    const n = getNode(path);
    if (n && n.t === "f") { area.value = n.c; name.value = path.split("/").pop(); }
  }
  // Save into ~/Documents (or back to the original path)
  box.querySelector("button").onclick = () => {
    const file = name.value.trim() || "untitled.txt";
    const target = path && file === path.split("/").pop() ? path : homeDir() + "/Documents/" + file;
    const { dir, name: n } = parentOf(target);
    dir.ch[n] = { t: "f", c: area.value };
    msg.textContent = "Saved to " + target.replace(homeDir(), "~");
  };
  createWindow("Text Editor", "\u{1F4DD}", box);
  area.focus();
}

/* ---------- File Manager (reads the same virtual FS as the terminal) ---------- */
function openFiles() {
  const box = document.createElement("div");
  box.className = "fm";
  box.innerHTML = '<div class="tree"></div><div><div class="path"></div><div class="files"></div></div>';
  box.lastChild.style.flex = "1";
  const tree = box.querySelector(".tree"), files = box.querySelector(".files"), pathEl = box.querySelector(".path");

  function show(abs) {
    const n = getNode(abs);
    pathEl.textContent = abs.replace(homeDir(), "~");
    tree.querySelectorAll("div").forEach((d) => d.classList.toggle("active", d._abs === abs));
    files.innerHTML = "";
    const add = (label, action) => { const r = document.createElement("div"); r.textContent = label; r.ondblclick = action; r.onclick = action; files.appendChild(r); };
    if (abs !== homeDir()) add("\u2B06  ..", () => show(normalize("..", abs)));
    Object.keys(n.ch).sort().forEach((k) => {
      const child = n.ch[k], p = abs + "/" + k;
      if (child.t === "d") add("\u{1F4C1}  " + k, () => show(p));
      else add("\u{1F4C4}  " + k, () => openEditor(p));
    });
  }
  // Left tree: Home plus its folders
  const home = getNode(homeDir());
  [["Home", homeDir()]].concat(Object.keys(home.ch).filter((k) => home.ch[k].t === "d").map((k) => [k, homeDir() + "/" + k])).forEach(([label, abs]) => {
    const item = document.createElement("div");
    item.textContent = "\u{1F4C2} " + label; item._abs = abs; item.onclick = () => show(abs);
    tree.appendChild(item);
  });
  createWindow("File Manager", "\u{1F4C1}", box);
  show(homeDir());
}

/* ---------- Settings ---------- */
function openSettings() {
  const box = document.createElement("div");
  box.className = "settings";
  box.innerHTML = '<h3 style="margin:0">Settings</h3>' +
    '<label>Accent color</label><input type="color" id="sAccent" value="#1793d1">' +
    '<label>Glass blur</label><input type="range" id="sBlur" min="0" max="30" value="16">' +
    '<label><input type="checkbox" id="sAnim" checked> Animated wallpaper</label>' +
    '<label>First boot</label><button id="sReset">Reset account and restart</button>';
  const root = document.documentElement;
  box.querySelector("#sAccent").oninput = (e) => root.style.setProperty("--arch", e.target.value);
  box.querySelector("#sBlur").oninput = (e) => root.style.setProperty("--blur", e.target.value + "px");
  box.querySelector("#sAnim").onchange = (e) => document.body.classList.toggle("noanim", !e.target.checked);
  box.querySelector("#sReset").onclick = resetAccount;
  createWindow("Settings", "\u2699", box);
}

// App registry: used by the menu, dock, desktop icons and the terminal "open" command
const apps = {
  terminal: { label: "Terminal", icon: ">_", open: openTerminal },
  files: { label: "File Manager", icon: "\u{1F4C1}", open: () => openFiles() },
  editor: { label: "Text Editor", icon: "\u{1F4DD}", open: () => openEditor() },
  settings: { label: "Settings", icon: "\u2699", open: openSettings }
};
