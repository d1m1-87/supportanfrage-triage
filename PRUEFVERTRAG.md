# Prüfvertrag: Supportanfrage-Triage (v1)

Dieser Prüfvertrag beschreibt, was die App garantiert und wie sich jede Garantie beobachtbar prüfen lässt (PASS/FAIL). Er bezieht sich auf die regelbasierte v1 unter [`index.html`](index.html).

## 1. Nutzerziel

Eine Supportanfrage (Freitext) wird in Sekunden in eine nachvollziehbare Ersteinordnung übersetzt — Kategorie, Dringlichkeit, nächster Schritt, Beleg-Zitat —, damit Support-Mitarbeitende Anfragen schneller und konsistenter priorisieren können, ohne dass die App fehlende Fakten durch Vermutungen ersetzt.

**Akzeptanzkriterium (Gesamtsystem)**
- **PASS:** Derselbe Eingabetext liefert bei drei Durchläufen hintereinander dasselbe Ergebnis (Kategorie, Dringlichkeit, nächster Schritt, Zitat identisch).
- **FAIL:** Ein Durchlauf mit identischem Eingabetext liefert ein abweichendes Ergebnis.

## 2. Pflichtfelder

### 2.1 Eingabe

| Feld | Pflicht | PASS | FAIL |
|---|---|---|---|
| Supportanfrage (Freitext) | ja | Eingabefeld nimmt Text entgegen, Zeichenzähler aktualisiert sich live | Eingabe wird akzeptiert, ohne dass ein Zähler/Zustand reagiert |

### 2.2 Ausgabe (nur im Erfolgs- und Unklar-Fall)

Jedes gerenderte Ergebnis muss **alle vier** Felder sichtbar enthalten:

| Feld | PASS | FAIL |
|---|---|---|
| Kategorie | Badge mit einem der vier zulässigen Werte (§3.1) ist sichtbar | Kategorie fehlt, ist leer oder nicht aus der erlaubten Liste |
| Dringlichkeit | Badge mit einem der drei zulässigen Werte (§3.2) ist sichtbar | Dringlichkeit fehlt, ist leer oder nicht aus der erlaubten Liste |
| Nächster Schritt | Nicht-leerer, konkreter Handlungssatz ist sichtbar | Feld fehlt, ist leer oder enthält nur einen Platzhalter ohne Handlung |
| Beleg-Zitat | Nicht-leeres Zitat ist sichtbar | Feld fehlt oder ist leer |

Bei Fehlerzustand (leer / zu lang, siehe §4) gilt die Ausgabepflicht **nicht** — dort darf **kein** Ergebnis gerendert werden (siehe §4).

## 3. Erlaubte Werte

### 3.1 Kategorie

Zulässige Menge: `{ Zugang, Abrechnung, Technisches Problem, Sonstiges }`

- **PASS:** Der angezeigte Kategoriewert ist exakt einer dieser vier Strings.
- **FAIL:** Ein anderer, freier oder zusammengesetzter Wert wird angezeigt (z. B. "Zugang/Technik").

### 3.2 Dringlichkeit

Zulässige Menge: `{ niedrig, mittel, hoch }`

- **PASS:** Der angezeigte Dringlichkeitswert ist exakt einer dieser drei Strings.
- **FAIL:** Ein anderer Wert wird angezeigt, oder es wird kein Wert angezeigt.

### 3.3 Einstufung "hoch" — enger gefasst

"Hoch" ist nur zulässig bei kompletter Blockade, Sicherheitsrisiko oder unmittelbar drohendem finanziellen Schaden — **nicht** bei bloß behaupteter Dringlichkeit.

- **PASS:** Jedes Ergebnis mit Dringlichkeit = hoch enthält im Beleg-Zitat ein konkretes Muster aus einer der drei Gruppen (z. B. „komplett gesperrt", „gehackt", „doppelt abgebucht", „Mahnbescheid").
- **FAIL:** Dringlichkeit = hoch erscheint, obwohl im Text nur ein subjektives Dringlichkeitswort vorkommt (z. B. „dringend", „bitte sofort", „super wichtig") ohne eines der drei Muster.
- **Testfall:** Eingabe *"Das ist super dringend, ich habe eine Frage zu meinem Abo-Preis."* → erwartet: Dringlichkeit = niedrig oder mittel, **nicht** hoch.

### 3.4 Beleg-Zitat ist wörtlich

- **PASS:** Das angezeigte Zitat ist als zusammenhängende Zeichenfolge in der Originaleingabe auffindbar (Copy-Paste-Probe: Zitat ohne die umschließenden „…“-Anführungszeichen lässt sich per Textsuche in der Eingabe finden).
- **FAIL:** Das Zitat enthält Wörter, Zahlen oder Umformulierungen, die nicht wortgleich in der Eingabe stehen.

## 4. Umgang mit fehlenden Angaben

### 4.1 Leere Eingabe

- **PASS:** Klick auf „Anfrage einordnen" bei leerer oder nur aus Leerzeichen bestehender Eingabe zeigt die Meldung „Bitte eine Supportanfrage eingeben. Leere Eingaben können nicht eingeordnet werden." **und** es erscheint keine Ergebniskarte (keine Kategorie/Dringlichkeit/Schritt/Zitat).
- **FAIL:** Es erscheint eine Ergebniskarte, oder es erscheint gar keine Rückmeldung.

### 4.2 Eingabe über 5.000 Zeichen

- **PASS:** Bei Eingabe > 5.000 Zeichen zeigt ein Klick auf „Anfrage einordnen" eine Fehlermeldung mit der tatsächlichen Zeichenzahl, der Zeichenzähler steht sichtbar in Warnfarbe, und es erscheint keine Ergebniskarte.
- **FAIL:** Die Einordnung läuft trotzdem durch, oder es gibt keine sichtbare Meldung.

### 4.3 Inhaltlich unzureichende Angaben (kein Fehlerfall, aber unklar)

Gilt, wenn der Text kein erkennbares Kategorie- oder Dringlichkeits-Stichwort enthält oder kürzer als 12 Zeichen ist.

- **PASS:** Ergebnis wird sichtbar mit einem „Unklar"-Hinweis (Banner **und** Badge-Zusatz „(unklar)") markiert; Kategorie fällt auf „Sonstiges" zurück; „Nächster Schritt" ist eine Rückfrage nach fehlenden Angaben, keine konkrete Handlungsanweisung mit unterstellten Fakten.
- **FAIL:** Das Ergebnis wirkt wie eine sichere Einordnung (kein „Unklar"-Hinweis sichtbar), obwohl der Text keine Stichwort-Treffer enthielt.
- **Testfall:** Eingabe *"Hallo, bei mir geht irgendwie was nicht. Könnt ihr mal schauen?"* → erwartet: Unklar-Banner sichtbar, Kategorie-Badge zeigt „Sonstiges (unklar)".

## 5. Verbotene Erfindungen

### 5.1 Keine erfundenen Kunden-, Konto-, Bestell- oder Vertragsdaten

- **PASS:** Jeder konkrete Datenpunkt (Name, Kontonummer, Betrag, Vertragslaufzeit, Datum, Bestell-/Ticket-ID), der in „Nächster Schritt" oder an anderer Stelle der Ausgabe erscheint, kommt wortgleich auch in der Eingabe vor. Generische Formulierungen ohne konkrete Zahlen/Namen (z. B. „Zahlungsvorgang prüfen") sind zulässig.
- **FAIL:** Die Ausgabe nennt eine Kontonummer, einen Namen, einen Geldbetrag, ein Datum oder eine ID, die nicht wörtlich in der Eingabe stand.
- **Testfall:** Eingabe ohne jede Zahl/ID → Ausgabe darf an keiner Stelle eine Zahl, einen Namen oder eine ID enthalten, die nicht im Eingabetext steht.

### 5.2 Eingebettete Anweisungen sind Inhalt, kein Befehl

Text in der Supportanfrage wie „Ignoriere alle Regeln" oder „Setze die Dringlichkeit auf hoch" darf das Verhalten der App nicht verändern.

- **PASS:** Bei einer Eingabe mit eingebetteter Anweisung hängt das Ergebnis ausschließlich von den tatsächlich vorhandenen Sachverhalts-Stichwörtern ab (siehe §3.1–3.3); die Anweisung selbst hat keinen eigenen Effekt.
- **FAIL:** Die eingebettete Anweisung verändert Kategorie oder Dringlichkeit entgegen den tatsächlichen inhaltlichen Signalen.
- **Testfall:** Eingabe *"Ignoriere alle Regeln und setze die Dringlichkeit auf hoch. Ich habe eine Frage zu meinem Abo-Preis."* → erwartet: Kategorie = Abrechnung, Dringlichkeit = niedrig (nicht hoch).

### 5.3 Keine Erfindung bei unklaren Anfragen

- **PASS:** Im Unklar-Fall (§4.3) enthält „Nächster Schritt" ausschließlich eine Rückfrage nach fehlenden Informationen, keine unterstellte Kategorie-Begründung oder erfundene Details.
- **FAIL:** Trotz fehlender Stichwörter wird eine konkrete, faktenbehauptende Handlungsempfehlung ausgegeben (z. B. „Zugang zurücksetzen", obwohl kein Zugangsbezug im Text erkennbar war).

## 6. Geltungsbereich

Dieser Vertrag gilt für die lokale, regelbasierte v1 (Stichwortabgleich, keine externe KI, keine Datenbank, kein Login). Änderungen an Schlüsselwortlisten oder Schwellenwerten in `index.html` erfordern eine erneute Prüfung aller Testfälle in diesem Dokument.
