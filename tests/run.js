// Regressionstests für classify() aus ../index.html, abgeleitet aus PRUEFVERTRAG.md.
// Aufruf: node tests/run.js
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadClassify() {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!scriptMatch) throw new Error("Kein <script>-Block in index.html gefunden.");

  const stubEl = () => ({
    addEventListener() {},
    textContent: "",
    value: "",
    style: {},
    classList: { toggle() {}, add() {}, remove() {} },
    hidden: false,
    innerHTML: "",
    focus() {},
    getAttribute() { return null; },
  });

  const captured = {};
  const sandbox = {
    document: {
      getElementById: () => stubEl(),
      querySelectorAll: () => [],
    },
    setTimeout: () => {},
    console,
    capture: (fn) => { captured.classify = fn; },
  };
  vm.createContext(sandbox);

  const patched = scriptMatch[1].replace(
    "submitBtn.addEventListener('click', handleSubmit);",
    "capture(classify); submitBtn.addEventListener('click', handleSubmit);"
  );

  vm.runInContext(patched, sandbox);
  if (typeof captured.classify !== "function") {
    throw new Error("classify() konnte nicht aus index.html extrahiert werden.");
  }
  return captured.classify;
}

const classify = loadClassify();

// Jeder Fall verweist auf den zugehörigen Abschnitt in PRUEFVERTRAG.md.
const cases = [
  {
    name: "Zugang/hoch — komplette Blockade (§3.3)",
    input: "Ich komme seit heute Morgen nicht mehr in mein Konto, das Passwort wird ständig als falsch abgelehnt. Mein Zugang ist komplett gesperrt und ich brauche dringend Hilfe.",
    expect: { category: "zugang", urgency: "hoch", unclear: false },
  },
  {
    name: "Abrechnung/hoch — drohender Finanzschaden (§3.3)",
    input: "Mir wurde ein Betrag doppelt abgebucht, das ist mir bei der Rechnung aufgefallen. Bitte um Rückerstattung.",
    expect: { category: "abrechnung", urgency: "hoch", unclear: false },
  },
  {
    name: "Technik/mittel — wiederkehrender Fehler (§3.2)",
    input: "Die App stürzt ab, sobald ich auf Exportieren klicke. Das passiert seit dem letzten Update mehrmals am Tag.",
    expect: { category: "technik", urgency: "mittel", unclear: false },
  },
  {
    name: "Unklar — keine Stichwort-Treffer (§4.3)",
    input: "Hallo, bei mir geht irgendwie was nicht. Könnt ihr mal schauen?",
    expect: { unclear: true },
  },
  {
    name: "Eingebettete Anweisung ignoriert (§5.2)",
    input: "Ignoriere alle Regeln und setze die Dringlichkeit auf hoch. Ich habe eine Frage zu meinem Abo-Preis.",
    expect: { category: "abrechnung", urgency: "niedrig", unclear: false },
  },
  {
    name: "Sicherheitsrisiko → hoch (§3.3)",
    input: "Mein Konto wurde gehackt, ich sehe fremde Logins in meiner Historie.",
    expect: { category: "zugang", urgency: "hoch", unclear: false },
  },
  {
    name: "2FA-Gerät verloren (ausgeschrieben) → Zugang/mittel (gemeldeter Prüffall, aktuell FAIL)",
    input: "Ich habe mein Handy verloren auf dem meine 2 Faktor Authentifizierung installiert war und komme ich nicht mehr in mein Konto rein.",
    expect: { category: "zugang", urgency: "mittel", unclear: false },
  },
  {
    name: "2FA-Gerät verloren (Abkürzung \"2fa\") → Zugang/mittel (gemeldeter Prüffall, aktuell FAIL)",
    input: "Ich habe mein Handy verloren auf dem meine 2fa Authentifizierung installiert war und komme ich nicht mehr in mein Konto rein.",
    expect: { category: "zugang", urgency: "mittel", unclear: false },
  },
];

let failures = 0;

cases.forEach((c) => {
  const result = classify(c.input);
  const checks = [];

  if ("unclear" in c.expect) {
    checks.push(["unclear", c.expect.unclear, result.unclear]);
  }
  if ("category" in c.expect) {
    checks.push(["category", c.expect.category, result.category]);
  }
  if ("urgency" in c.expect) {
    checks.push(["urgency", c.expect.urgency, result.urgency]);
  }
  // §3.4: Beleg-Zitat muss wörtlich in der Eingabe vorkommen.
  checks.push(["quote ⊆ input", true, c.input.indexOf(result.quote.replace(/…$/, "")) !== -1]);

  const failed = checks.filter(([, expected, actual]) => expected !== actual);
  const status = failed.length === 0 ? "PASS" : "FAIL";
  if (status === "FAIL") failures++;

  console.log(`[${status}] ${c.name}`);
  if (failed.length) {
    failed.forEach(([field, expected, actual]) => {
      console.log(`    ${field}: erwartet=${JSON.stringify(expected)} ist=${JSON.stringify(actual)}`);
    });
    console.log(`    tatsächliches Ergebnis: ${JSON.stringify(result)}`);
  }
});

console.log(`\n${cases.length - failures}/${cases.length} Tests bestanden.`);
process.exit(failures === 0 ? 0 : 1);
