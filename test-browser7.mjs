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
    
    await page.evaluate(() => {
        const p = JSON.parse(localStorage.getItem('hocbang_vn_profile') || '{}');
        p.unlockedLessons = [0, 1, 2, 3];
        localStorage.setItem('hocbang_vn_profile', JSON.stringify(p));
    });
    
    // Check continue
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
    console.log('Clicking lesson 1-2 (node index 1)...');
    
    // the nodes reverse order, let's just evaluate click on a specific text
    await page.evaluate(() => {
       const titles = [...document.querySelectorAll('.map-node-title')];
       const target = titles.find(t => t.innerText.includes('1-2'));
       if (target) {
           const btn = target.parentElement.querySelector('.map-node');
           btn.click();
       }
    });

    await new Promise(r => setTimeout(r, 1000));
    
    for(let i=0; i<10; i++) {
        // Find what to click 
        const nextBtn = await page.$('.btn-next');
        const choiceBtns = await page.$$('.choice-pill');
        const mcBtns = await page.$$('.mc-option');
        const builderWords = await page.$$('.builder-word:not(.used)');

        if (builderWords.length > 0) {
            console.log(`[Step ${i}] Clicking builder word: ` + (await page.evaluate(el => el.innerText, builderWords[0])));
            await builderWords[0].click();
            await new Promise(r => setTimeout(r, 500));
        } else if (mcBtns.length > 0) {
            console.log(`[Step ${i}] Clicking MC option`);
            await mcBtns[0].click();
            await new Promise(r => setTimeout(r, 500));
        } else if (nextBtn) {
            console.log(`[Step ${i}] Clicking Next`);
            await nextBtn.click();
            await new Promise(r => setTimeout(r, 500));
        } else if (choiceBtns.length > 0) {
            console.log(`[Step ${i}] Clicking Choice`);
            await choiceBtns[0].click();
            await new Promise(r => setTimeout(r, 500));
        } else {
            console.log(`[Step ${i}] No buttons found.`);
            break;
        }
    }
    
  } catch (err) {
    console.log('Test logic failed:', err.message);
  }

  await browser.close();
})();
