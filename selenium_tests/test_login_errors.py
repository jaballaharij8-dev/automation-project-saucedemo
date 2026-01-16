import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from test_functions import load_test_data, login_with_case

# ================= CONFIG =================
URL = "https://www.saucedemo.com"
JSON_FILE = "login_errors_data.json"

# ================= LOAD JSON =================
data = load_test_data(JSON_FILE)

# ================= DRIVER CREATION =================
def create_driver():
    """Crée un driver Chrome headless + incognito"""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--incognito")
    driver = webdriver.Chrome(options=options)
    return driver

# ================= TESTS =================
def test_invalid_login():
    driver = create_driver()
    login_with_case(driver, URL, data["invalid_login"])
    driver.quit()

def test_missing_username():
    driver = create_driver()
    login_with_case(driver, URL, data["missing_username"])
    driver.quit()

def test_missing_password():
    driver = create_driver()
    login_with_case(driver, URL, data["missing_password"])
    driver.quit()

# ================= TEST JSON =================
def test_load_json_data():
    """Vérifie que le JSON est bien chargé et contient les bonnes clés"""
    assert data is not None
    assert "invalid_login" in data
    assert "missing_username" in data
    assert "missing_password" in data
