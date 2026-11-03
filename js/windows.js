/* ==========================================================
   Window manager: create, drag, resize, maximize, close, z-order
   ========================================================== */
let topZ = 10;      // z-index of the front-most window
let openCount = 0;  // used to cascade new windows

// Put a window in front of all the others
function bringToFront(win) {
  topZ++;
  win.style.zIndex = topZ;
}

// Build a window around a content element and add it to the desktop
function createWindow(title, contentEl) {
  const win = document.createElement("div");
  win.className = "window";

  // Cascade: every new window is offset a little
  win.style.left = 130 + (openCount % 8) * 28 + "px";
  win.style.top = 20 + (openCount % 8) * 28 + "px";
  openCount++;

  win.innerHTML =
    '<div class="titlebar"><span></span><button class="close">&#10005;</button></div>' +
    '<div class="content"></div><div class="resize"></div>';
  win.querySelector(".titlebar span").textContent = title;
  win.querySelector(".content").appendChild(contentEl);

  win.querySelector(".close").onclick = () => win.remove();
  win.addEventListener("mousedown", () => bringToFront(win));

  setupDrag(win, win.querySelector(".titlebar"));
  setupResize(win, win.querySelector(".resize"));
  setupMaximize(win, win.querySelector(".titlebar"));

  document.getElementById("desktop").appendChild(win);
  bringToFront(win);
  return win;
}

// Drag the window by its title bar
function setupDrag(win, handle) {
  handle.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON") return;
    const dx = e.clientX - win.offsetLeft;
    const dy = e.clientY - win.offsetTop - 32; // 32 = top panel height
    function move(ev) {
      win.style.left = ev.clientX - dx + "px";
      win.style.top = Math.max(0, ev.clientY - dy - 32) + "px"; // keep below the panel
    }
    function stop() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  });
}

// Resize from the bottom-right corner
function setupResize(win, handle) {
  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startW = win.offsetWidth, startH = win.offsetHeight;
    function move(ev) {
      win.style.width = Math.max(260, startW + ev.clientX - startX) + "px";
      win.style.height = Math.max(160, startH + ev.clientY - startY) + "px";
    }
    function stop() {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", stop);
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", stop);
  });
}

// Double-click the title bar to maximize / restore
function setupMaximize(win, handle) {
  let saved = null;
  handle.addEventListener("dblclick", (e) => {
    if (e.target.tagName === "BUTTON") return;
    if (saved) {
      Object.assign(win.style, saved);
      saved = null;
    } else {
      saved = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
      Object.assign(win.style, { left: "0px", top: "0px", width: "100%", height: "100%" });
    }
  });
}
