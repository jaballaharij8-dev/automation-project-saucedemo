import { test, expect } from '@playwright/test';
import * as data from '../data/testData.json';
import { SaucePage } from '../SaucePage';


test.describe('SauceDemo - Product Filter Project', () => {
    let page;
    let sauce;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        sauce = new SaucePage(page);
        
        // Pass the whole data objects to keep the call clean
        await sauce.login(data.url, data.selectors, data.user);
    });

    test('Step 1-8: Filtering Logic', async () => {
        // Step 2: Verify that the default filter is "Name (A to Z)"
        const isDefaultFilterCorrect = await sauce.verifyDefaultFilterIsNameAtoZ(data.selectors.activeFilter, 'Name (A to Z)');
        await expect(isDefaultFilterCorrect).toBe(true);

        // Step 3: Change filter to "Price (low to high)"
        await sauce.selectFilter(data.selectors.filterLogo, data.values.lowToHigh);
        
        // Step 4: Verify that products are sorted by ascending price
        const isSortedAscending = await sauce.verifyProductsSortedByAscendingPrice(data.selectors.itemPrice);
        await expect(isSortedAscending).toBe(true);
        
        // Step 5: Take screenshot after sorting
        await sauce.takeFullScreenshot('filter-low-to-high');
        await expect(page.locator(data.selectors.activeFilter)).toHaveText('Price (low to high)');

        // Step 6: Change filter to "Price (high to low)"
        await sauce.selectFilter(data.selectors.filterLogo, data.values.highToLow);
        await sauce.takeFullScreenshot('filter-high-to-low');
        
        // Step 7: Verify that the first product has the highest price
        const hasHighestFirst = await sauce.verifyFirstProductHasHighestPrice(data.selectors.itemPrice);
        await expect(hasHighestFirst).toBe(true);

        // Step 8: Verify that the last product has the lowest price
        const hasLowestLast = await sauce.verifyLastProductHasLowestPrice(data.selectors.itemPrice);
        await expect(hasLowestLast).toBe(true);
    });

    test.afterAll(async () => { await page.close(); });
});