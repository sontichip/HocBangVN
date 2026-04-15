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
    
    let isConnected = false;
    
    // Try click continue
    const continueBtn = await page.$('.start-btn.pulse');
    if (continueBtn) {
      console.log('Clicking Continue...');
      await continueBtn.click();
    }
    
    await new Promise(r => setTimeout(r, 1000));
    console.log('Looking for unlocked node...');
    const node = await page.$('.map-node.unlocked');
    if (node) {
      await node.click();
      console.log('Clicked lesson node...');
      await new Promise(r => setTimeout(r, 1000));
      
      for(let i=0; i<6; i++) {
         const btnNext = await page.$('.btn-next');
         const btnChoices = await page.$$('.choice-pill');
         if (btnNext) {
             console.log(`[Step ${i}] Clicking Next. HTML snippet: ` + (await page.$eval('.dialog-message', el => el.innerText)).substring(0, 30));
             await btnNext.click();
             await new Promise(r => setTimeout(r, 500));
         } else if (btnChoices.length > 0) {
             console.log(`[Step ${i}] Clicking Choice. Options: ` + btnChoices.length);
             await btnChoices[0].click();
             await new Promise(r => setTimeout(r, 500));
         } else {
             console.log(`[Step ${i}] Nothing to click. HTML: ` + (await page.content()).substring(100, 300));
             break;
         }
      }
      
      console.log("FINAL HTML DUMP:", (await page.content()).match(/<body>(.*?)<\/body>/s)[1].substring(0, 2000));
    }
    
  } catch (err) {
    console.log('Test logic failed:', err.message);
  }

  await browser.close();
})();
