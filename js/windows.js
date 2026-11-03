/* ==========================================================
   Window manager: drag, resize, minimize, maximize, close, z-order
   Every window also gets a button in the top panel (task list)
   ========================================================== */
let topZ = 10;      // z-index of the front-most window
let openCount = 0;  // used to cascade new windows

// Bring a window to the front and mark it (and its task button) as active
function focusWin(win) {
  topZ++;
  win.style.zIndex = topZ;
  document.querySelectorAll(".window").forEach((w) => w.classList.toggle("focused", w === win));
  document.querySelectorAll(".task").forEach((t) => t.classList.toggle("active", t._win === win));
}

function createWindow(title, icon, contentEl) {
  const win = document.createElement("div");
  win.className = "window";
  win.style.left = 130 + (openCount % 8) * 28 + "px";
  win.style.top = 20 + (openCount % 8) * 28 + "px";
  openCount++;

  win.innerHTML =
    '<div class="titlebar"><span class="ttl"></span><span class="btns">' +
    '<button class="min" title="Minimize">&#8211;</button>' +
    '<button class="max" title="Maximize">&#9633;</button>' +
    '<button class="close" title="Close">&#10005;</button></span></div>' +
    '<div class="content"></div><div class="resize"></div>';
  win.querySelector(".ttl").textContent = icon + "  " + title;
  win.querySelector(".content").appendChild(contentEl);

  // Task button in the top panel
  const task = document.createElement("button");
  task.className = "task";
  task.textContent = icon + " " + title;
  task._win = win;
  document.getElementById("tasks").appendChild(task);

  // --- minimize / restore ---
  const minimize = () => { win.style.display = "none"; task.classList.add("min"); task.classList.remove("active"); };
  const restore = () => { win.style.display = "flex"; task.classList.remove("min"); focusWin(win); };
  task.onclick = () => {
    if (win.style.display === "none") restore();
    else if (win.classList.contains("focused")) minimize();
    else focusWin(win);
  };
  win.querySelector(".min").onclick = minimize;

  // --- maximize / restore size ---
  let saved = null;
  const toggleMax = () => {
    if (saved) {
      Object.assign(win.style, saved);
      saved = null;
      win.classList.remove("maxed");
    } else {
      saved = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
      Object.assign(win.style, { left: "0px", top: "0px", width: "100%", height: "calc(100% - 78px)" }); // leave room for the dock
      win.classList.add("maxed");
    }
  };
  win.querySelector(".max").onclick = toggleMax;
  win.querySelector(".titlebar").ondblclick = (e) => { if (e.target.tagName !== "BUTTON") toggleMax(); };

  // --- close ---
  win.querySelector(".close").onclick = () => { win.remove(); task.remove(); };

  win.addEventListener("mousedown", () => focusWin(win));
  setupDrag(win);
  setupResize(win);

  document.getElementById("desktop").appendChild(win);
  focusWin(win);
  return win;
}

// Drag by the title bar (disabled while maximized)
function setupDrag(win) {
  win.querySelector(".titlebar").addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON" || win.classList.contains("maxed")) return;
    const dx = e.clientX - win.offsetLeft;
    const dy = e.clientY - 34 - win.offsetTop;   // 34 = panel height
    const move = (ev) => {
      win.style.left = ev.clientX - dx + "px";
      win.style.top = Math.max(0, ev.clientY - 34 - dy) + "px";
    };
    const stop = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", stop); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  });
}

// Resize from the bottom-right corner
function setupResize(win) {
  win.querySelector(".resize").addEventListener("mousedown", (e) => {
    e.preventDefault();
    const x = e.clientX, y = e.clientY, w = win.offsetWidth, h = win.offsetHeight;
    const move = (ev) => {
      win.style.width = Math.max(280, w + ev.clientX - x) + "px";
      win.style.height = Math.max(170, h + ev.clientY - y) + "px";
    };
    const stop = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", stop); };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  });
}
