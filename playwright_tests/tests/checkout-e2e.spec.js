// tests/checkout-e2e.spec.js

const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ProductsPage = require('../pages/ProductsPage');
const CheckoutPage = require('../pages/CheckoutPage');
const testData = require('../config/checkout-e2e-data.json');

test.describe(testData.test_suite_name, () => {
  let context;
  let page;
  let loginPage;
  let productsPage;
  let checkoutPage;

  // Hook beforeAll pour se connecter une seule fois
  test.beforeAll(async ({ browser }) => {
    // Créer un nouveau context pour partager la session entre les tests
    context = await browser.newContext();
    page = await context.newPage();

    // Initialiser les pages
    loginPage = new LoginPage(page, testData.selectors);
    productsPage = new ProductsPage(page, testData.selectors);
    checkoutPage = new CheckoutPage(page, testData.selectors);

    // Naviguer vers la page de connexion
    await page.goto(testData.base_url);

    // Se connecter avec l'utilisateur standard
    await loginPage.login(testData.login.username, testData.login.password);

    // Vérifier que nous sommes bien sur la page des produits
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  // Hook afterAll pour nettoyer après tous les tests
  test.afterAll(async () => {
    await context.close();
  });

  // Tester le processus de paiement complet pour chaque produit
  testData.products.forEach((product, index) => {
    test(`Processus de paiement complet - Produit ${index + 1}: ${product.name}`, async () => {
      // ÉTAPE 2: Ajouter un produit au panier
      await test.step('Ajouter le produit au panier', async () => {
        await productsPage.addProductToCart(product.name);
        await productsPage.verifyCartBadgeCount(1);
      });

      // ÉTAPE 3: Aller dans le panier
      await test.step('Accéder au panier', async () => {
        await productsPage.goToCart();
        await expect(page).toHaveURL(/.*cart.html/);
      });

      // Vérifier que le produit est bien dans le panier
      await test.step('Vérifier le produit dans le panier', async () => {
        await checkoutPage.verifyProductInCart(product.name, product.expected_price);
      });

      // ÉTAPE 4: Cliquer sur "Checkout"
      await test.step('Cliquer sur Checkout', async () => {
        await checkoutPage.clickCheckout();
        await expect(page).toHaveURL(/.*checkout-step-one.html/);
      });

      // ÉTAPE 5: Remplir le formulaire
      await test.step('Remplir le formulaire d\'informations', async () => {
        await checkoutPage.fillCheckoutInformation(testData.checkout_user);
      });

      // ÉTAPE 6: Cliquer sur "Continue"
      await test.step('Cliquer sur Continue', async () => {
        await checkoutPage.clickContinue();
        await expect(page).toHaveURL(/.*checkout-step-two.html/);
      });

      // ÉTAPE 7: Vérifier la page de récapitulatif
      await test.step('Vérifier la page de récapitulatif', async () => {
        await checkoutPage.verifySummaryPage(product.name, product.expected_price);
      });

      // ÉTAPE 8: Cliquer sur "Finish"
      await test.step('Cliquer sur Finish', async () => {
        await checkoutPage.clickFinish();
        await expect(page).toHaveURL(/.*checkout-complete.html/);
      });

      // ÉTAPE 9: Vérifier le message de confirmation
      await test.step('Vérifier le message de confirmation', async () => {
        await checkoutPage.verifyConfirmationMessage(testData.expected_messages.order_complete);
      });

      // ÉTAPE 10: Vérifier que le badge du panier n'est plus visible
      await test.step('Vérifier que le badge du panier a disparu', async () => {
        await productsPage.verifyCartBadgeNotVisible();
      });

      // Retourner à la page des produits pour le prochain test
      await test.step('Retourner à la page des produits', async () => {
        await productsPage.goBackToProducts();
        await expect(page).toHaveURL(/.*inventory.html/);
      });
    });
  });
});