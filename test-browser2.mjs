import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 5000 });
    
    // Auto accept any dialogs
    page.on('dialog', async dialog => await dialog.accept());
    
    // We already have a profile if we don't clear localStorage, so let's check
    const continueBtn = await page.$('.start-btn.pulse');
    if (continueBtn) {
      console.log('Clicking Continue...');
      await continueBtn.click();
    } else {
      console.log('Clicking New Game...');
      await page.click('.new-game-btn');
      await new Promise(r => setTimeout(r, 1000));
      
      const nameInput = await page.$('.name-input');
      if (nameInput) {
        await nameInput.type('Hero');
        await page.click('.confirm-btn');
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    // Now we should be on Map Screen
    await new Promise(r => setTimeout(r, 1000));
    console.log('Looking for unlocked node...');
    const node = await page.$('.map-node.unlocked');
    if (node) {
      await node.click();
      console.log('Clicked lesson node...');
      await new Promise(r => setTimeout(r, 1000));
      
      const html = await page.content();
      console.log('HTML Dump Body:', html.match(/<body>(.*?)<\/body>/s)[1].substring(0, 1000));
    }
    
  } catch (err) {
    console.log('Test logic failed:', err.message);
  }

  await browser.close();
})();
