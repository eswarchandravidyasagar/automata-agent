const { test, expect } = require('@playwright/test');

// Helper to send events back to the client
const sendEvent = async (data) => {
  try {
    // Use a unique console log prefix to identify agent events
    console.log('AGENT_EVENT::' + JSON.stringify(data));
  } catch (e) {
    console.log('AGENT_EVENT::{"type":"error","content":"Failed to serialize event data"}');
  }
};

// Helper to take a snapshot of the page with size optimization
const sendSnapshot = async (page, description) => {
  try {
    // Take a screenshot without quality option for PNG
    const screenshot = await page.screenshot({ 
      type: 'png',
      fullPage: false // Only visible area to reduce size
    });
    
    // Limit screenshot size to prevent JSON parsing issues
    const base64Screenshot = screenshot.toString('base64');
    if (base64Screenshot.length > 50000) { // ~37KB limit
      await sendEvent({
        type: 'snapshot',
        content: {
          description: description + ' (screenshot too large, showing text summary instead)',
          screenshot: null,
          summary: await page.textContent('body').catch(() => 'Unable to extract page text')
        },
      });
    } else {
      await sendEvent({
        type: 'snapshot',
        content: {
          description,
          screenshot: base64Screenshot,
        },
      });
    }
  } catch (e) {
    console.error('Failed to send snapshot:', e);
    await sendEvent({
      type: 'snapshot',
      content: {
        description: description + ' (snapshot failed)',
        screenshot: null,
        error: e.message
      },
    });
  }
};

// Helper to capture and log results
const logResult = (data) => {
  console.log('RESULT::' + JSON.stringify(data));
};

// Helper function to wait for elements
const waitForElement = async (page, selector, timeout = 5000) => {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
};

test('Automation Script', async ({ page }) => {
  try {
    // User's script is injected here
    await page.goto('https://www.chefbuddy.io/search');
await sendSnapshot(page, 'Initial page load');

// Wait for page to stabilize
await page.waitForTimeout(3000);

// Use multiple selector strategies for reliability
await waitForElement(page, 'h1, h2, h3, .chef-count, .total-chefs');

// Extract total number of chefs with error handling
try {
  const chefCountElement = page.locator('.chef-count, .total-chefs').first();
  const chefCountText = await chefCountElement.textContent();
  console.log('RESULT::', { totalChefs: chefCountText });
  await sendSnapshot(page, 'Extracted total number of chefs');
} catch (error) {
  console.log('RESULT::', { error: 'Failed to extract total number of chefs', details: error.message });
}
    
    // If no explicit result was logged, capture final page state
    const finalUrl = page.url();
    const title = await page.title().catch(() => 'Unknown');
    
    logResult({
      message: 'Script completed successfully',
      finalUrl,
      pageTitle: title,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Script execution failed:', error);
    logResult({
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
});