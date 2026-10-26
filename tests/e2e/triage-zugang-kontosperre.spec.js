// Kernpfad: Zugangs-Anfrage ("Konto komplett gesperrt trotz Passwort-Reset")
// wird eingeordnet.
//
// Erwartung: Kategorie "Zugang", Dringlichkeit "hoch", konkreter nächster
// Schritt, wörtliches Beleg-Zitat.
//
// FIX gegenüber der ursprünglichen Fassung: Der Testtext enthielt zunächst
// nur "gesperrt" (ohne Verstärkung) + "dringend". Laut PRUEFVERTRAG.md §3.3
// ist "hoch" aber bewusst eng gefasst und erfordert ein konkretes Muster
// (z. B. "komplett gesperrt", "gehackt", "doppelt abgebucht") - rein
// subjektive Dringlichkeit wie "dringend" reicht nicht. Die App stufte den
// alten Text deshalb korrekt als "mittel" ein, nicht als "hoch" - der Test
// war also gegen eine falsche Erwartung geschrieben, nicht die App fehlerhaft.
// Fix: Der Text enthält jetzt "komplett gesperrt" (eines der in §3.3 selbst
// genannten Beispielmuster), wodurch "hoch" tatsächlich korrekt ausgelöst
// wird. Damit prüft der Test wieder ein reales, spezifikationskonformes
// Verhalten statt eine Diskrepanz zu dokumentieren.

const { test, expect } = require('@playwright/test');

const SUPPORT_REQUEST =
  'Mein Konto ist seit heute komplett gesperrt. Ich kann mich trotz ' +
  'Passwort-Reset nicht anmelden und muss dringend auf meine Rechnungen zugreifen.';

test('Zugangsanfrage mit kompletter Kontosperre wird als Zugang/hoch mit Beleg-Zitat eingeordnet', async ({ page }) => {
  await page.goto('/');

  const input = page.getByLabel('Supportanfrage');
  const submitButton = page.getByRole('button', { name: 'Anfrage einordnen' });
  const resultCard = page.locator('.result-card');
  const errorBanner = page.locator('.banner.error');

  // --- Start: leeres Textfeld, keine Ergebnis-Karte, kein Fehlerzustand ---
  await expect(input).toHaveValue('');
  await expect(resultCard).toHaveCount(0);
  await expect(errorBanner).toHaveCount(0);

  // --- Aktion: Text eingeben, einordnen lassen ---
  await input.fill(SUPPORT_REQUEST);
  await submitButton.click();

  // --- Auf Ergebnis warten (web-first, kein sleep/waitForTimeout) ---
  await expect(resultCard).toBeVisible();

  // Kein sichtbarer Fehlerzustand und kein "unklar"-Hinweis (der hier nicht
  // erwartet ist, da klare Stichworte für Zugang vorliegen).
  await expect(errorBanner).toHaveCount(0);
  await expect(page.locator('.banner.unclear')).toHaveCount(0);

  // --- Kategorie "Zugang" sichtbar ---
  await expect(resultCard.getByText('Zugang', { exact: true })).toBeVisible();

  // --- Dringlichkeit "hoch" sichtbar (siehe Hinweis oben zu §3.3) ---
  await expect(resultCard.getByText(/Dringlichkeit:\s*hoch/i)).toBeVisible();

  // --- Konkreter nächster Schritt sichtbar (kein leerer/Platzhalter-Text) ---
  const nextStepField = resultCard.locator('.field').filter({ hasText: 'Nächster Schritt' });
  await expect(nextStepField).toBeVisible();
  const nextStepText = (await nextStepField.locator('.v').innerText()).trim();
  expect(nextStepText.length).toBeGreaterThan(0);
  // Im Unklar-Fall wäre der "nächste Schritt" eine Rückfrage statt einer
  // konkreten Handlung - das darf hier nicht der Fall sein.
  expect(nextStepText).not.toMatch(/Rückfrage/i);
  // Heuristik gegen erfundene Konto-/Vertragsdaten: die Eingabe enthält keine
  // einzige Ziffer, also darf auch der nächste Schritt keine enthalten.
  expect(nextStepText).not.toMatch(/[0-9]/);

  // --- Wörtliches Beleg-Zitat aus der Eingabe sichtbar ---
  const quoteLocator = resultCard.locator('blockquote.evidence');
  await expect(quoteLocator).toBeVisible();
  const rawQuote = (await quoteLocator.innerText()).trim();
  const quoteWithoutMarks = rawQuote.replace(/^[„"]/, '').replace(/[“"]$/, '').replace(/…$/, '').trim();
  expect(quoteWithoutMarks.length).toBeGreaterThan(0);
  expect(SUPPORT_REQUEST).toContain(quoteWithoutMarks);

  // --- Cleanup: Eingabe leeren; die App hält keinen persistenten Zustand ---
  await input.fill('');
  await expect(input).toHaveValue('');
});
