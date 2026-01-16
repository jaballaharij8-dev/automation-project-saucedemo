// pages/ProductsPage.js

class ProductsPage {
  constructor(page, selectors) {
    this.page = page;
    this.selectors = selectors;
    
    // Locators
    this.shoppingCart = page.locator(selectors.shopping_cart);
    this.shoppingCartBadge = page.locator(selectors.shopping_cart_badge);
    this.inventoryItems = page.locator('.inventory_item');
  }

  /**
   * Ajoute un produit au panier par son nom
   * @param {string} productName - Nom du produit à ajouter
   * @returns {Promise<string>} Le nom du produit ajouté
   */
  async addProductToCart(productName) {
    // Trouver l'item qui contient le nom du produit
    const productItem = this.inventoryItems.filter({
      has: this.page.locator('.inventory_item_name', { hasText: productName })
    });

    // Cliquer sur le bouton "Add to cart" de ce produit
    await productItem.locator('[data-test^="add-to-cart-"]').click();
    
    // Attendre que le badge du panier soit visible
    await this.shoppingCartBadge.waitFor({ state: 'visible' });
    
    return productName;
  }

  /**
   * Va dans le panier
   */
  async goToCart() {
    await this.shoppingCart.click();
    await this.page.waitForURL(/.*cart.html/);
  }

  /**
   * Vérifie que le badge du panier affiche le nombre correct d'articles
   * @param {number} expectedCount - Nombre attendu d'articles
   */
  async verifyCartBadgeCount(expectedCount) {
    const badgeText = await this.shoppingCartBadge.textContent();
    if (badgeText !== expectedCount.toString()) {
      throw new Error(`Badge count mismatch. Expected: ${expectedCount}, Got: ${badgeText}`);
    }
  }

  /**
   * Vérifie que le badge du panier n'est plus visible
   */
  async verifyCartBadgeNotVisible() {
    await this.shoppingCartBadge.waitFor({ state: 'hidden' });
  }

  /**
   * Retourne à la page des produits
   */
  async goBackToProducts() {
    await this.page.locator(this.selectors.back_home).click();
    await this.page.waitForURL(/.*inventory.html/);
  }
}

module.exports = ProductsPage;