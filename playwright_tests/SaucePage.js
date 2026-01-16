export class SaucePage {
    constructor(page) {
        this.page = page;
    }

    async login(url, selectors, user) {
        await this.page.goto(url);
        await this.page.fill(selectors.userInput, user.username);
        await this.page.fill(selectors.passInput, user.password);
        await this.page.click(selectors.loginBtn);
        await this.page.waitForURL('**/inventory.html');
    }

    async selectFilter(selector, value) {
        await this.page.selectOption(selector, value);
    }

    // This captures everything from top to bottom
    async takeFullScreenshot(name) {
        await this.page.screenshot({ 
            path: `screenshots/${name}.png`, 
            fullPage: true 
        });
    }

    async getPrices(priceSelector) {
        const prices = await this.page.locator(priceSelector).allTextContents();
        return prices.map(price => parseFloat(price.replace('$', '')));
    }

    async verifyFirstProductHasHighestPrice(priceSelector) {
        const pricesNumeric = await this.getPrices(priceSelector);
        const firstPrice = pricesNumeric[0];
        const maxPrice = Math.max(...pricesNumeric);
        return firstPrice === maxPrice;
    }

    async verifyLastProductHasLowestPrice(priceSelector) {
        const pricesNumeric = await this.getPrices(priceSelector);
        const lastPrice = pricesNumeric[pricesNumeric.length - 1];
        const minPrice = Math.min(...pricesNumeric);
        return lastPrice === minPrice;
    }

    async verifyDefaultFilterIsNameAtoZ(activeFilterSelector, expectedText) {
        const filterText = await this.page.locator(activeFilterSelector).textContent();
        return filterText?.trim() === expectedText.trim();
    }

    async verifyProductsSortedByAscendingPrice(priceSelector) {
        const pricesNumeric = await this.getPrices(priceSelector);
        const sortedPrices = [...pricesNumeric].sort((a, b) => a - b);
        return JSON.stringify(pricesNumeric) === JSON.stringify(sortedPrices);
    }
}