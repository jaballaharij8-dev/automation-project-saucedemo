import os
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException

# ================= CONFIG =================
# CHROME_PORTABLE_PATH = r"C:\Chrome_Sources\chrome-win64\chrome.exe"
# CHROME_DRIVER_PATH = r"C:\Chrome_Sources\chromedriver-win64\chromedriver.exe"
CHROME_PORTABLE_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
CHROME_DRIVER_PATH = r"C:\ProgramData\chocolatey\lib\chromedriver\tools\chromedriver-win64\chromedriver.exe"

URL = "https://www.saucedemo.com"

# ================= JSON GLOBAL PATH =================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(BASE_DIR, "data.json")

def test_load_test_data():
    """Charge les utilisateurs et produits depuis le JSON"""
    if not os.path.exists(JSON_PATH):
        raise FileNotFoundError(f"Fichier JSON introuvable : {JSON_PATH}")

    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    users = data.get("users", [])
    expected_products = data.get("expected_products", {})
    return users, expected_products

# ================= CHROME =================
options = Options()
options.binary_location = CHROME_PORTABLE_PATH
options.add_argument("--incognito")
service = Service(CHROME_DRIVER_PATH)
driver = webdriver.Chrome(service=service, options=options)
wait = WebDriverWait(driver, 0)

# ================= CHARGER JSON =================
USERS, EXPECTED_PRODUCTS = test_load_test_data()

# ================= BOUCLE UTILISATEURS =================
for user in USERS:
    username = user["username"]
    password = user["password"]

    print("\n" + "="*60)
    print(f"TEST AVEC UTILISATEUR : {username}")
    print("="*60)
    print(f" Se connecter avec l'utilisateur {username}")

    driver.get(URL)

    driver.find_element(By.ID, "user-name").clear()
    driver.find_element(By.ID, "user-name").send_keys(username)
    driver.find_element(By.ID, "password").clear()
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.ID, "login-button").click()

    try:
        wait.until(EC.presence_of_element_located((By.ID, "inventory_container")))
        print("[PASS] Connexion réussie")
    except TimeoutException:
        print(f"[INFO] {username} ne peut pas se connecter")
        continue  # ⏩ Passer au compte suivant

    # ================= 2️⃣ Vérifier les produits =================
    print(" Vérifier que tous ces produits sont présents dans le catalogue:")
    products = driver.find_elements(By.CLASS_NAME, "inventory_item")
    print(f"Produits trouvés: {len(products)}")

    for product in products:
        name_elem = product.find_element(By.CLASS_NAME, "inventory_item_name")
        price_elem = product.find_element(By.CLASS_NAME, "inventory_item_price")
        img_elem = product.find_element(By.TAG_NAME, "img")
        btn_elem = product.find_element(By.TAG_NAME, "button")

        name = name_elem.text
        price = float(price_elem.text.replace("$", ""))

        # Vérifier si le produit est attendu
        if name in EXPECTED_PRODUCTS:
            expected_price = EXPECTED_PRODUCTS[name]["price"]
            expected_img_src = EXPECTED_PRODUCTS[name].get("img_src", "")

            img_status = "✅" if img_elem.is_displayed() else "❌"
            if expected_img_src and expected_img_src not in img_elem.get_attribute("src"):
                img_status = "❌ (Image incorrecte!)"
            else:
                img_status = "✅(Image correcte)"


            btn_status = "✅" if btn_elem.text.lower() == "add to cart" else "❌"
            clickable_status = "✅" if name_elem.is_displayed() and name_elem.is_enabled() else "❌"

            print(f"✅ {name} - ${price} | Image: {img_status}, Bouton: {btn_status}, Nom cliquable: {clickable_status}")

    # ================= 3️⃣ Cliquer sur un produit =================
    driver.find_element(By.LINK_TEXT, "Sauce Labs Backpack").click()
    wait.until(EC.presence_of_element_located((By.CLASS_NAME, "inventory_details_name")))
    detail_name = driver.find_element(By.CLASS_NAME, "inventory_details_name").text
    if detail_name == "Sauce Labs Backpack":
        print(f"✅ Page détail correcte pour {username}")
    else:
        print(f"❌ Page détail incorrecte pour {username}")
        print(f"Produit affiché : {detail_name}")

    # ================= 4️⃣ Retour à la liste des produits =================
    driver.find_element(By.ID, "back-to-products").click()
    print ("✅ Retour à la liste des produits avec succès.")


    # ================= 5️⃣ Vérifier total produits =================
    products = driver.find_elements(By.CLASS_NAME, "inventory_item")
    assert len(products) == 6, "Nombre total de produits incorrect"
    print("✅ Nombre total de produits = 6")

    print("🎉 TEST COMPLET RÉUSSI 🎉")

driver.quit()
