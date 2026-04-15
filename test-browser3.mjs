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
    
    // Check if we can just continue
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
    
    await new Promise(r => setTimeout(r, 1000));
    console.log('Looking for unlocked node...');
    const node = await page.$('.map-node.unlocked');
    if (node) {
      await node.click();
      console.log('Clicked lesson node...');
      await new Promise(r => setTimeout(r, 1000));
      
      // We are theoretically in the Visual Novel Screen. 
      // Need to find and click the "Next" button repeatedly until mini game or crash
      for(let i=0; i<5; i++) {
         const nextBtn = await page.$('.btn-next');
         if (nextBtn) {
             console.log('Clicking next btn...', i);
             await nextBtn.click();
             await new Promise(r => setTimeout(r, 500));
         } else {
             const choiceBtn = await page.$('.choice-pill');
             if (choiceBtn) {
                 console.log('Clicking choice btn...', i);
                 await choiceBtn.click();
                 await new Promise(r => setTimeout(r, 500));
             } else {
                 console.log('No next or choice button found at step', i);
                 break;
             }
         }
      }
      
    }
    
  } catch (err) {
    console.log('Test logic failed:', err.message);
  }

  await browser.close();
})();
