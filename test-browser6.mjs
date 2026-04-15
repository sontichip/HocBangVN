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
    
    // Click New Game always to reset state
    console.log('Clicking New Game...');
    await page.click('.new-game-btn');
    await new Promise(r => setTimeout(r, 1000));
      
    const nameInput = await page.$('.name-input');
    if (nameInput) {
      await nameInput.type('Hero');
      await page.click('.confirm-btn');
      await new Promise(r => setTimeout(r, 1000));
    }
    
    await new Promise(r => setTimeout(r, 1000));
    console.log('Looking for unlocked node...');
    const node = await page.$('.map-node.unlocked');
    if (node) {
      await node.click();
      console.log('Clicked lesson node...');
      await new Promise(r => setTimeout(r, 1000));
      
      for(let i=0; i<6; i++) {
         const nextBtn = await page.$('.btn-next');
         if (nextBtn) {
             console.log(`[Step ${i}] Clicking next btn...`);
             await nextBtn.click();
             await new Promise(r => setTimeout(r, 1000));
             continue;
         } 
         const choiceBtns = await page.$$('.choice-pill');
         if (choiceBtns.length > 0) {
             console.log(`[Step ${i}] Clicking choice 1 of ${choiceBtns.length}...`);
             await choiceBtns[0].click();
             await new Promise(r => setTimeout(r, 1000));
             continue;
         }
         
         const mcBtns = await page.$$('.mc-option');
         if (mcBtns.length > 0) {
             console.log(`[Step ${i}] Clicking MC option...`);
             await mcBtns[1].click(); // 'go' is correct, try 1 which is index 1
             await new Promise(r => setTimeout(r, 1000));
             continue;
         }
         
         console.log(`[Step ${i}] No buttons found.`);
         break;
      }
      
      const html = await page.content();
      console.log('HTML Dump Body:', html.match(/<body>(.*?)<\/body>/s)[1].substring(0, 2000));
    }
    
  } catch (err) {
    console.log('Test logic failed:', err.message);
  }

  await browser.close();
})();
