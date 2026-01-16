// pages/CheckoutPage.js

class CheckoutPage {
  constructor(page, selectors) {
    this.page = page;
    this.selectors = selectors;
    
    // Locators pour la page panier
    this.checkoutButton = page.locator(selectors.checkout_button);
    this.cartItemName = page.locator(selectors.cart_item_name);
    this.cartItemPrice = page.locator(selectors.cart_item_price);
    
    // Locators pour le formulaire
    this.firstNameInput = page.locator(selectors.first_name);
    this.lastNameInput = page.locator(selectors.last_name);
    this.postalCodeInput = page.locator(selectors.postal_code);
    this.continueButton = page.locator(selectors.continue_button);
    
    // Locators pour la page de récapitulatif
    this.finishButton = page.locator(selectors.finish_button);
    this.summaryItemName = page.locator('.inventory_item_name');
    this.summaryItemPrice = page.locator('.inventory_item_price');
    this.summarySubtotal = page.locator('.summary_subtotal_label');
    this.summaryTax = page.locator('.summary_tax_label');
    this.summaryTotal = page.locator('.summary_total_label');
    
    // Locators pour la page de confirmation
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
  }

  /**
   * Vérifie que le produit est présent dans le panier
   * @param {string} productName - Nom du produit
   * @param {string} expectedPrice - Prix attendu du produit
   */
  async verifyProductInCart(productName, expectedPrice) {
    const name = await this.cartItemName.textContent();
    const price = await this.cartItemPrice.textContent();
    
    if (name !== productName) {
      throw new Error(`Product name mismatch. Expected: ${productName}, Got: ${name}`);
    }
    
    if (price !== expectedPrice) {
      throw new Error(`Product price mismatch. Expected: ${expectedPrice}, Got: ${price}`);
    }
  }

  /**
   * Clique sur le bouton Checkout
   */
  async clickCheckout() {
    await this.checkoutButton.click();
    await this.page.waitForURL(/.*checkout-step-one.html/);
  }

  /**
   * Remplit le formulaire d'informations utilisateur
   * @param {Object} userInfo - Informations utilisateur
   * @param {string} userInfo.first_name - Prénom
   * @param {string} userInfo.last_name - Nom
   * @param {string} userInfo.postal_code - Code postal
   */
  async fillCheckoutInformation(userInfo) {
    await this.firstNameInput.fill(userInfo.first_name);
    await this.lastNameInput.fill(userInfo.last_name);
    await this.postalCodeInput.fill(userInfo.postal_code);
  }

  /**
   * Clique sur le bouton Continue
   */
  async clickContinue() {
    await this.continueButton.click();
    await this.page.waitForURL(/.*checkout-step-two.html/);
  }

  /**
   * Vérifie la page de récapitulatif
   * @param {string} productName - Nom du produit
   * @param {string} expectedPrice - Prix attendu du produit
   */
  async verifySummaryPage(productName, expectedPrice) {
    // Vérifier le nom du produit
    const summaryName = await this.summaryItemName.textContent();
    if (summaryName !== productName) {
      throw new Error(`Summary product name mismatch. Expected: ${productName}, Got: ${summaryName}`);
    }
    
    // Vérifier le prix du produit
    const summaryPrice = await this.summaryItemPrice.textContent();
    if (summaryPrice !== expectedPrice) {
      throw new Error(`Summary product price mismatch. Expected: ${expectedPrice}, Got: ${summaryPrice}`);
    }
    
    // Vérifier que les éléments de récapitulatif sont visibles
    await this.summarySubtotal.waitFor({ state: 'visible' });
    await this.summaryTax.waitFor({ state: 'visible' });
    await this.summaryTotal.waitFor({ state: 'visible' });
    
    // Vérifier que le bouton Finish est visible
    await this.finishButton.waitFor({ state: 'visible' });
  }

  /**
   * Clique sur le bouton Finish
   */
  async clickFinish() {
    await this.finishButton.click();
    await this.page.waitForURL(/.*checkout-complete.html/);
  }

  /**
   * Vérifie le message de confirmation
   * @param {string} expectedMessage - Message attendu
   */
  async verifyConfirmationMessage(expectedMessage) {
    await this.completeHeader.waitFor({ state: 'visible' });
    
    const actualMessage = await this.completeHeader.textContent();
    if (actualMessage.trim() !== expectedMessage) {
      throw new Error(`Confirmation message mismatch. Expected: "${expectedMessage}", Got: "${actualMessage}"`);
    }
    
    // Vérifier également que le texte complémentaire est présent
    await this.completeText.waitFor({ state: 'visible' });
  }
}

module.exports = CheckoutPage;