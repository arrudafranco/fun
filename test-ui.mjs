import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

// Clear saved game and mark tutorial as seen for clean state
await page.goto('http://localhost:5173/fun/');
await page.evaluate(() => {
  localStorage.removeItem('miranda-save');
  localStorage.setItem('miranda-tutorial-seen', '1');
});
await page.reload();
await page.waitForTimeout(2000);

// Select Standard difficulty
const standardBtn = page.locator('button:has-text("Standard")');
if (await standardBtn.isVisible()) {
  await standardBtn.click();
  await page.waitForTimeout(1000);
}

// Dismiss tutorial overlay if it appears (click Skip or Got it)
const tutorialSkip = page.locator('[role="dialog"][aria-label="Tutorial"] button:has-text("Skip")');
if (await tutorialSkip.isVisible({ timeout: 1000 }).catch(() => false)) {
  await tutorialSkip.click();
  await page.waitForTimeout(500);
}

// Screenshot 1: Initial state with event modal
await page.screenshot({ path: 'screenshots/01-event-modal.png' });

// Click the first choice in the event modal to dismiss it
const choiceBtn = page.locator('[role="dialog"] button').first();
if (await choiceBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await choiceBtn.click();
  await page.waitForTimeout(500);
}

// Screenshot 2: Action phase (turn 1)
await page.screenshot({ path: 'screenshots/02-action-phase.png' });

// Play a few turns to get rival action text and power delta visible
// Each turn: pick first available policy, end turn, dismiss any event
for (let turn = 0; turn < 3; turn++) {
  // Select first policy card (they use role="checkbox")
  const policyCard = page.locator('[role="checkbox"]').first();
  if (await policyCard.isVisible({ timeout: 2000 }).catch(() => false)) {
    await policyCard.click();
    await page.waitForTimeout(300);
  }

  // Click End Turn button
  const endTurnBtn = page.locator('button:has-text("End Turn")');
  if (await endTurnBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await endTurnBtn.click();
    await page.waitForTimeout(1500);
  }

  // Dismiss any event modal (click first choice or Continue)
  const eventChoice = page.locator('[role="dialog"] button').first();
  if (await eventChoice.isVisible({ timeout: 2000 }).catch(() => false)) {
    await eventChoice.click();
    await page.waitForTimeout(500);
  }
}

// Hero screenshot: tall viewport, scrolled to show blocs + rival panel + policies
await page.setViewportSize({ width: 1280, height: 1024 });
await page.waitForTimeout(300);
await page.evaluate(() => window.scrollTo(0, 500));
await page.waitForTimeout(500);
await page.screenshot({ path: 'screenshot.png' });
await page.setViewportSize({ width: 1280, height: 800 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);

// Full page screenshot
await page.screenshot({ path: 'screenshots/02b-action-fullpage.png', fullPage: true });

// Hover over "Turn" span for tooltip
const turnSpan = page.locator('span.cursor-help').first();
if (await turnSpan.isVisible({ timeout: 1000 }).catch(() => false)) {
  await turnSpan.hover();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/03-tooltip.png' });
}

// Hover over Colossus Alignment label
const colossusLabel = page.locator('#colossus-alignment-label');
if (await colossusLabel.isVisible({ timeout: 1000 }).catch(() => false)) {
  await colossusLabel.hover();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/04-colossus-tooltip.png' });
}

// Click Save button
const saveBtn = page.locator('button:has-text("Save")');
if (await saveBtn.isVisible()) {
  await saveBtn.click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'screenshots/05-save-flash.png' });
}

// Wait for Load button to appear
await page.waitForTimeout(2000);
await page.screenshot({ path: 'screenshots/06-after-save.png' });

// Click New Game to see confirmation state
const newGameBtn = page.locator('button:has-text("New Game")');
if (await newGameBtn.isVisible()) {
  await newGameBtn.click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'screenshots/07-newgame-confirm.png' });
}

await browser.close();
console.log('Done! Screenshots in screenshots/');
