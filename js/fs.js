/* ==========================================================
   Tiny virtual file system shared by Terminal, File Manager and Editor
   Node types: {t:"d", ch:{...}} = directory, {t:"f", c:"text"} = file
   ========================================================== */
let USER = "user";     // lowercase login name, used in prompt and paths
let fsRoot = null;

function makeFs(user) {
  const f = (c) => ({ t: "f", c });
  const d = (ch) => ({ t: "d", ch });
  USER = user;
  fsRoot = d({
    etc: d({ hostname: f("arch\n"), "os-release": f('NAME="Arch Linux"\nID=arch\n') }),
    home: d({ [user]: d({
      Desktop: d({}),
      Documents: d({ "notes.txt": f("Welcome to Arch Linux!\n"), "todo.md": f("- learn pacman\n- install arch (btw)\n") }),
      Downloads: d({ "archlinux.iso": f("(binary data)"), "setup.sh": f("#!/bin/bash\necho hello\n") }),
      Music: d({}), Pictures: d({}),
      ".bashrc": f("alias ll='ls -l'\n")
    }) })
  });
}

const homeDir = () => "/home/" + USER;

// Turn "~", "..", relative or absolute input into a clean absolute path
function normalize(path, cwd) {
  if (path === "~" || path.startsWith("~/")) path = homeDir() + path.slice(1);
  const parts = (path.startsWith("/") ? path : cwd + "/" + path).split("/");
  const out = [];
  for (const p of parts) {
    if (!p || p === ".") continue;
    if (p === "..") out.pop(); else out.push(p);
  }
  return "/" + out.join("/");
}

// Find a node by absolute path (null if missing)
function getNode(abs) {
  let n = fsRoot;
  for (const p of abs.split("/").filter(Boolean)) {
    if (!n || n.t !== "d" || !n.ch[p]) return null;
    n = n.ch[p];
  }
  return n;
}

// Split an absolute path into its parent directory node and the last name
function parentOf(abs) {
  const i = abs.lastIndexOf("/");
  return { dir: getNode(abs.slice(0, i) || "/"), name: abs.slice(i + 1) };
}
