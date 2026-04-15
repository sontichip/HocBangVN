import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 5000 });
    
    console.log('Clicking New Game...');
    
    // Auto accept dialogs BEFORE clicking
    page.on('dialog', async dialog => {
      console.log('Dialog:', dialog.message());
      await dialog.accept();
    });
    
    await page.click('.new-game-btn');
    
    await new Promise(r => setTimeout(r, 1000));
    
    const nameInput = await page.$('.name-input');
    if (nameInput) {
      console.log('In Character Creation screen.');
      await nameInput.type('Hero');
      
      const confirmBtn = await page.$('.confirm-btn');
      await confirmBtn.click();
      console.log('Submitted Character Creation...');
      
      await new Promise(r => setTimeout(r, 1000));
      
      const mapStartStr = await page.$('.map-start-point');
      if (mapStartStr) {
        console.log('In Map Screen.');
      } else {
        console.log('Map Screen not found.');
      }
    } else {
      console.log('Character Creation screen not found.');
      const html = await page.content();
      console.log('HTML Dump Body:', html.match(/<body>(.*?)<\/body>/s)[1].substring(0, 500));
    }
  } catch (err) {
    console.log('Test logic failed:', err.message);
  }

  await browser.close();
})();
