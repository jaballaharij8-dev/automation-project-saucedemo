import json
import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ================= DATA =================
def load_test_data(filename):
    """Charge les données JSON"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(base_dir, filename)

    if not os.path.exists(json_path):
        raise FileNotFoundError(f"JSON introuvable : {json_path}")

    with open(json_path, "r", encoding="utf-8") as file:
        return json.load(file)

# ================= NAVIGATION =================
def open_application(driver, url):
    driver.get(url)

# ================= LOGIN =================
def login(driver, username, password):
    """Login standard pour Saucedemo"""
    driver.find_element(By.ID, "user-name").clear()
    driver.find_element(By.ID, "user-name").send_keys(username)
    driver.find_element(By.ID, "password").clear()
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.ID, "login-button").click()

# ================= ERROR HANDLING =================
def get_error_message(driver):
    """Récupère le texte d'erreur affiché sur la page"""
    return WebDriverWait(driver, 5).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "h3[data-test='error']"))
    ).text

# ================= GENERIC TEST FUNCTION =================
def login_with_case(driver, url, case):
    """
    Fonction générique pour tester un cas de login.
    case = dict avec keys: username, password, expected_error
    """
    open_application(driver, url)
    username = case.get("username", "")
    password = case.get("password", "")
    login(driver, username, password)
    error_text = get_error_message(driver)
    assert error_text == case["expected_error"], f"Erreur attendue: '{case['expected_error']}', trouvé: '{error_text}'"
