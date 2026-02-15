const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Starting diagnostics V2...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'] // less security to avoid cors issues in headless check
  });
  
  const page = await browser.newPage();
  
  // Create a log of browser console messages to debug React errors
  page.on('console', msg => {
      if (msg.type() === 'error') console.log(`👉 Browser Error: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
      console.log(`🔥 Start-up Crash: ${err.toString()}`);
  });

  try {
    console.log('📡 Navigating...');
    await page.goto('https://www.clearpickai.com/search', { waitUntil: 'networkidle0', timeout: 60000 });
    
    // Wait for the app to hydrate
    await new Promise(r => setTimeout(r, 5000));
    
    // Check if #root has children (React mounted)
    const isMounted = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root && root.innerHTML.length > 50;
    });

    if (!isMounted) {
        console.error('❌ React App did not mount! The screen is likely white.');
        const html = await page.content();
        console.log('Snapshot:', html.substring(0, 500));
        await browser.close();
        return;
    }
    
    console.log('✅ App mounted successfully.');

    // Look for input again with longer timeout
    console.log('🔍 Waiting for input...');
    try {
        await page.waitForSelector('input', { timeout: 10000 });
        console.log('✅ Input found.');
        await page.type('input', 'Sony WH-1000XM5');
    } catch {
        console.error('❌ Input field missing (UI Error).');
        await browser.close();
        return;
    }

    // Click button
    console.log('👆 Clicking Analyze...');
    const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText.includes('Analyze') || b.innerText.includes('Search'));
        if (btn) { btn.click(); return true; }
        return false;
    });
    
    if (!clicked) {
        console.error('❌ Button not found.');
    } else {
        console.log('⏳ Waiting for report redirection (30s)...');
        try {
            await page.waitForFunction(() => location.href.includes('/report/'), { timeout: 30000 });
            console.log('✅ Redirected to Report Page!');
            
            await new Promise(r => setTimeout(r, 5000)); // wait for report render
            
            const hasContent = await page.evaluate(() => {
                return document.body.innerText.includes('Verdict') || document.body.innerText.includes('Good');
            });
            
            if (hasContent) {
                console.log('🎉 SUCCESS: Report Loaded with Content!');
            } else {
                console.log('⚠️ Warning: Report page empty?');
            }
        } catch (e) {
            console.error('❌ Failed to reach report page.');
        }
    }

  } catch (err) {
    console.error('🚨 Test failed:', err);
  } finally {
    await browser.close();
  }
})();
