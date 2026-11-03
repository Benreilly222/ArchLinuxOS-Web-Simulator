/* ==========================================================
   Startup flow: boot -> (first boot: choose name) -> login -> desktop
   ========================================================== */
const $ = (id) => document.getElementById(id);
let displayName = "";

// The chosen name is kept in localStorage (wrapped in try/catch in case it is blocked)
const loadName = () => { try { return localStorage.getItem("arch_name"); } catch (e) { return null; } };
const saveName = (n) => { try { localStorage.setItem("arch_name", n); } catch (e) {} };
function resetAccount() { try { localStorage.removeItem("arch_name"); } catch (e) {} location.reload(); }

// Apply a chosen name: build the file system and fill name labels
function setUser(name) {
  displayName = name;
  makeFs(name.toLowerCase().replace(/[^a-z0-9_]/g, "") || "user");
  $("loginName").textContent = name;
  $("loginAvatar").textContent = name[0].toUpperCase();
  $("userBtn").textContent = name;
}

/* ----- 1. Boot log ----- */
const bootLines = [
  "Arch Linux 6.x-arch1 (tty1)", "",
  "[  OK  ] Reached target Local File Systems.", "[  OK  ] Started Journal Service.",
  "[  OK  ] Started Network Manager.", "[  OK  ] Started D-Bus System Message Bus.",
  "[  OK  ] Started Login Service.", "[  OK  ] Reached target Graphical Interface.", "",
  "Starting display manager..."
];
function runBoot() {
  let i = 0;
  const timer = setInterval(() => {
    if (i < bootLines.length) { $("boot").innerHTML += bootLines[i].replace("OK", '<span class="ok">OK</span>') + "\n"; i++; }
    else { clearInterval(timer); setTimeout(afterBoot, 500); }
  }, 150);
}
function afterBoot() {
  $("boot").style.display = "none";
  const saved = loadName();
  if (saved) { setUser(saved); showLogin(); }
  else { $("setup").style.display = "flex"; $("nameIn").focus(); }   // first boot
}

/* ----- 2. First-boot name setup ----- */
function finishSetup() {
  const name = $("nameIn").value.trim();
  if (!name) { $("nameIn").focus(); return; }
  saveName(name); setUser(name);
  $("setup").style.display = "none";
  showLogin();
}
$("nameBtn").onclick = finishSetup;
$("nameIn").addEventListener("keydown", (e) => { if (e.key === "Enter") finishSetup(); });

/* ----- 3. Login / logout ----- */
function showLogin() {
  $("session").hidden = true;
  $("login").style.display = "flex";
  $("pass").value = ""; $("pass").focus();
}
function login() {
  $("login").style.display = "none";
  $("session").hidden = false;
  if (!document.querySelector(".window")) apps.terminal.open();
}
$("loginBtn").onclick = login;
$("pass").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });

/* ----- 4. Build icons, dock, and app menu from the app registry ----- */
Object.keys(apps).forEach((key, i) => {
  const a = apps[key];
  const icon = document.createElement("div");          // desktop icon (double-click)
  icon.className = "icon"; icon.style.top = 16 + i * 90 + "px";
  icon.innerHTML = "<b>" + a.icon + "</b>" + a.label;
  icon.ondblclick = a.open; $("desktop").appendChild(icon);

  const btn = document.createElement("button");        // dock button
  btn.textContent = a.icon; btn.title = a.label; btn.onclick = a.open; $("dock").appendChild(btn);
});
function renderMenu(filter) {
  $("appList").innerHTML = "";
  Object.keys(apps).filter((k) => apps[k].label.toLowerCase().includes(filter.toLowerCase())).forEach((k) => {
    const row = document.createElement("div");
    row.textContent = apps[k].icon + "  " + apps[k].label;
    row.onclick = apps[k].open;
    $("appList").appendChild(row);
  });
}
renderMenu("");
$("search").oninput = (e) => renderMenu(e.target.value);

/* ----- 5. Menus, power actions and clock ----- */
const closePopups = () => { $("menu").style.display = "none"; $("userMenu").style.display = "none"; };
function togglePopup(id, e) {
  e.stopPropagation();
  const open = $(id).style.display === "block";
  closePopups();
  $(id).style.display = open ? "none" : "block";
  if (id === "menu" && !open) { $("search").value = ""; renderMenu(""); $("search").focus(); }
}
$("menuBtn").onclick = (e) => togglePopup("menu", e);
$("userBtn").onclick = (e) => togglePopup("userMenu", e);
document.addEventListener("click", (e) => { if (!e.target.closest("#search")) closePopups(); });

$("doLogout").onclick = () => {
  document.querySelectorAll(".window, .task").forEach((el) => el.remove());
  showLogin();
};
$("doRestart").onclick = () => location.reload();
$("doReset").onclick = resetAccount;

function updateClock() {
  $("clock").textContent = new Date().toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
updateClock();
setInterval(updateClock, 15000);

runBoot();
