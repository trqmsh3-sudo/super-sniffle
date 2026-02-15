import puppeteer from 'puppeteer';

(async () => {
    console.log("🚀 Starting site diagnostic test...");
    
    // Launch without sandbox for stability, but visible (headless: false) if you want to see it,
    // though here I will use headless 'new' to just run in background.
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // 1. Go to Search Page
    const searchUrl = 'https://www.clearpickai.com/search';
    console.log(`📡 Navigating to ${searchUrl}...`);
    
    try {
        await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 60000 });
        console.log("✅ Page loaded successfully.");
    } catch (e) {
        console.error("❌ Failed to load page:", e.message);
        await browser.close();
        return;
    }

    // 2. Look for input
    console.log("🔍 Looking for search input...");
    const inputSelector = 'input[type="text"]';
    
    try {
        await page.waitForSelector(inputSelector, { timeout: 5000 });
        await page.type(inputSelector, 'Sony WH-1000XM5');
        console.log("✍️ Typed search query.");
    } catch (e) {
        console.error("❌ Could not find search input. Is the frontend rendering correctly?");
        console.log("HTML Dump:", await page.content());
        await browser.close();
        return;
    }

    // 3. Find and click search button
    console.log("👆 Attempting to submit search...");
    
    // Try to find the button - usually it's a submit button or a button with specific text
    const buttonSelector = 'button[type="submit"], button';
    
    // Scan buttons to find the right one (Analyze/Search)
    const buttonClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(b => 
            b.innerText.toLowerCase().includes('analyze') || 
            b.innerText.toLowerCase().includes('search') ||
            b.type === 'submit'
        );
        if (target) {
            target.click();
            return true;
        }
        return false;
    });

    if (!buttonClicked) {
        console.error("❌ Could not find a suitable 'Analyze' or 'Search' button.");
        await browser.close();
        return;
    }
    
    console.log("⏳ Research in progress... (Waiting up to 30s)");

    // 4. Wait for redirection or result
    // We expect URL to change to /report/Something or specific content to appear
    try {
        // Wait for URL change
        await page.waitForFunction(
            () => window.location.href.includes('/report/'),
            { timeout: 35000 } 
        );
        console.log(`✅ Redirected to: ${page.url()}`);
        
        // Wait for actual content
        await page.waitForFunction(
            () => document.body.innerText.includes('Verdict') || document.body.innerText.includes('Pros'),
            { timeout: 15000 }
        );
        console.log("✅ Report content found (Verdict/Pros section detected).");
        console.log("🎉 SUCCESS: The site is working properly!");

    } catch (e) {
        console.error("❌ Timeout waiting for report.");
        console.log("Current URL:", page.url());
        
        // Check if we have an error message on screen
        const errorText = await page.evaluate(() => {
            const bodyText = document.body.innerText;
            if (bodyText.includes('Error')) return 'Error message found on screen.';
            if (bodyText.length < 50) return 'Page seems empty (White Screen?).';
            return 'Page has content but not the expected report.';
        });
        
        console.log("Diagnostic:", errorText);
    }

    await browser.close();
})();
