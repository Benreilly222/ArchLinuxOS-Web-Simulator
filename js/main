/* ==========================================================
   Startup flow: boot -> login -> desktop. Also clock and menu.
   ========================================================== */
const bootEl = document.getElementById("boot");
const loginEl = document.getElementById("login");
const sessionEl = document.getElementById("session");

// ----- 1. Boot log (typed line by line) -----
const bootLines = [
  "Arch Linux 6.x-arch1 (tty1)",
  "",
  "[  OK  ] Reached target Local File Systems.",
  "[  OK  ] Started Journal Service.",
  "[  OK  ] Started Network Manager.",
  "[  OK  ] Started D-Bus System Message Bus.",
  "[  OK  ] Started Login Service.",
  "[  OK  ] Reached target Graphical Interface.",
  "",
  "Starting display manager..."
];

function runBoot() {
  let i = 0;
  const timer = setInterval(() => {
    if (i < bootLines.length) {
      bootEl.innerHTML += bootLines[i].replace("OK", '<span class="ok">OK</span>') + "\n";
      i++;
    } else {
      clearInterval(timer);
      setTimeout(showLogin, 500);
    }
  }, 160);
}

// ----- 2. Login -----
function showLogin() {
  bootEl.style.display = "none";
  sessionEl.hidden = true;
  loginEl.style.display = "flex";
  document.getElementById("pass").value = "";
  document.getElementById("pass").focus();
}
function login() {
  loginEl.style.display = "none";
  sessionEl.hidden = false;
  if (!document.querySelector(".window")) openTerminal();
}
document.getElementById("loginBtn").onclick = login;
document.getElementById("pass").addEventListener("keydown", (e) => { if (e.key === "Enter") login(); });
document.getElementById("logoutBtn").onclick = () => {
  document.querySelectorAll(".window").forEach((w) => w.remove());
  showLogin();
};

// ----- 3. Clock -----
function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleString([], {
    weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
}
updateClock();
setInterval(updateClock, 1000);

// ----- 4. Menu, icons and dock -----
const menu = document.getElementById("menu");
document.getElementById("menuBtn").onclick = (e) => {
  e.stopPropagation();
  menu.style.display = menu.style.display === "block" ? "none" : "block";
};
document.addEventListener("click", () => (menu.style.display = "none"));

document.querySelectorAll("#menu div, #dock button").forEach((el) => {
  el.onclick = () => apps[el.dataset.app]();          // single click
});
document.querySelectorAll(".icon").forEach((el) => {
  el.ondblclick = () => apps[el.dataset.app]();       // double click
});

runBoot();
