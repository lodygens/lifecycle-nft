
let hiddens = {
    "home": "false",
    "mint": "true",
    "use": "true",
    "history": "true",
    "about": "true"
  }

let currentPage = "home";

function toggle(what) {
    if (what == currentPage) return;

    const element = document.getElementById(what);

    if (!element)
        throw new Error ("element not found " + what)

    document.getElementById(currentPage).style.visibility = 'hidden';
    hiddens[currentPage] = true;
    hiddens[what] = false;

    if (hiddens[what] == false) {
        document.getElementById(what).style.visibility = 'visible';
    }

    currentPage = what;
}

function toggleHome() {
    toggle("home");
}
function toggleMint() {
    toggle("mint");
}
function toggleUse() {
    toggle("use");
}
function toggleHistory() {
    toggle("history");
}
function toggleAbout() {
    toggle("about");
}
