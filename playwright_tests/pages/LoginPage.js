// pages/LoginPage.js

class LoginPage {
  constructor(page, selectors) {
    this.page = page;
    this.selectors = selectors;
    
    // Locators
    this.usernameInput = page.locator(selectors.username);
    this.passwordInput = page.locator(selectors.password);
    this.loginButton = page.locator(selectors.login_button);
  }

  /**
   * Se connecte avec les identifiants fournis
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    // Attendre que la navigation soit complète
    await this.page.waitForURL(/.*inventory.html/);
  }

  /**
   * Vérifie que la page de connexion est chargée
   */
  async isLoaded() {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.loginButton.waitFor({ state: 'visible' });
  }
}

module.exports = LoginPage;