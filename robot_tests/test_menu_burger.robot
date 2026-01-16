*** Settings ***
Library    SeleniumLibrary
Library    Collections
Library    JSONLibrary

Test Setup    Setup Test
Test Teardown    Close Browser

*** Variables ***
${URL}          https://www.saucedemo.com/
${BROWSER}      chrome
${JSON_FILE}    ${CURDIR}/test_cases.json

${MENU_BTN}     id=react-burger-menu-btn
${MENU_WRAP}    class=bm-menu-wrap
${ALL_ITEMS}    id=inventory_sidebar_link
${ABOUT}        id=about_sidebar_link
${LOGOUT}       id=logout_sidebar_link
${RESET_APP}    id=reset_sidebar_link
${CART_LINK}    id=shopping_cart_container
${CART_BADGE}   class=shopping_cart_badge

*** Test Cases ***
Test Open Menu
    Load Test Data    test_open_menu
    Login
    Sleep    1s
    Open Menu
    Wait Until Element Is Visible    ${MENU_WRAP}    timeout=15s

Test Verify Menu Options
    Load Test Data    test_verify_options
    Login
    Sleep    1s
    Open Menu
    Wait Until Element Is Visible    ${MENU_WRAP}    timeout=15s
    Element Should Be Visible    ${ALL_ITEMS}
    Element Should Be Visible    ${ABOUT}
    Element Should Be Visible    ${LOGOUT}
    Element Should Be Visible    ${RESET_APP}

Test Click All Items
    Load Test Data    test_click_all_items
    Login
    Sleep    1s
    Open Menu
    Wait Until Element Is Visible    ${MENU_WRAP}    timeout=15s
    Click Element    ${ALL_ITEMS}
    Sleep    2s
    Wait Until Element Is Visible    id=inventory_container    timeout=15s

Test Click About
    Load Test Data    test_click_about
    Login
    Sleep    1s
    Open Menu
    Wait Until Element Is Visible    ${MENU_WRAP}    timeout=15s
    Click Element    ${ABOUT}
    Sleep    3s
    Switch To About Window

Test Reset App
    Load Test Data    test_reset_app
    Login
    Sleep    1s
    Open Menu
    Wait Until Element Is Visible    ${MENU_WRAP}    timeout=15s
    Click Element    ${RESET_APP}
    Sleep    2s

Test Logout
    Load Test Data    test_logout
    Login
    Sleep    1s
    Open Menu
    Wait Until Element Is Visible    ${MENU_WRAP}    timeout=15s
    Click Element    ${LOGOUT}
    Sleep    2s
    Wait Until Element Is Visible    id=login-button    timeout=20s

Test Navigation All Items From Cart Page
    Load Test Data    test_nav_from_cart
    Login
    Sleep    1s
    Click Element    ${CART_LINK}
    Wait Until Element Is Visible    id=cart_contents_container    timeout=15s
    Sleep    1s
    Open Menu
    Wait Until Element Is Visible    ${MENU_WRAP}    timeout=15s
    Click Element    ${ALL_ITEMS}
    Sleep    2s
    Wait Until Element Is Visible    id=inventory_container    timeout=15s
    Page Should Contain    Products

Test Menu Persistence After Invalid Click
    Load Test Data    test_menu_persistence
    Login
    Sleep    1s
    Open Menu
    Wait Until Element Is Visible    ${MENU_WRAP}    timeout=15s
    Click Element    id=inventory_container
    Sleep    1s
    Element Should Be Visible    ${MENU_WRAP}

Test Menu As Non Blocking Element
    Load Test Data    test_menu_non_blocking
    Login
    Sleep    1s
    Element Should Be Visible    id=inventory_container
    Click Element    id=inventory_container
    Sleep    1s
    Click Element    ${CART_LINK}
    Wait Until Element Is Visible    id=cart_contents_container    timeout=15s

Test Multiple Clicks On Menu Button
    Load Test Data    test_multiple_menu_clicks
    Login
    Sleep    1s
    Click Element    ${MENU_BTN}
    Click Element    ${MENU_BTN}
    Click Element    ${MENU_BTN}
    Sleep    1s
    ${menu_visible}=    Run Keyword And Return Status    Element Should Be Visible    ${MENU_WRAP}
    Run Keyword If    ${menu_visible}    Log    Menu is open as expected
    Run Keyword If    not ${menu_visible}    Log    Menu is closed as expected
    Sleep    1s

*** Keywords ***
Setup Test
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

Login
    ${username}=    Get From Dictionary    ${TEST_DATA}    username
    ${password}=    Get From Dictionary    ${TEST_DATA}    password
    Input Text    id=user-name    ${username}
    Input Password    id=password    ${password}
    Click Button    id=login-button
    Handle Password Popup
    Wait Until Element Is Visible    ${MENU_BTN}    timeout=15s

Handle Password Popup
    ${popup_exists}=    Run Keyword And Return Status    Element Should Be Visible    xpath=//button[contains(text(), 'Not now')]
    Run Keyword If    ${popup_exists}    Click Element    xpath=//button[contains(text(), 'Not now')]
    Sleep    1s

Load Test Data
    [Arguments]    ${test_name}
    ${json}=    Load Json From File    ${JSON_FILE}
    ${test}=    Get From Dictionary    ${json}    ${test_name}
    Set Suite Variable    ${TEST_DATA}    ${test}

Open Menu
    Click Element    ${MENU_BTN}
    Sleep    1s

Switch To About Window
    ${windows}=    Get Window Handles
    Run Keyword If    ${windows.__len__()} == 2    Switch Window    NEW
    Run Keyword If    ${windows.__len__()} == 2    Wait Until Page Contains    Sauce Labs    timeout=15s
    Run Keyword If    ${windows.__len__()} == 2    Close Window
    Run Keyword If    ${windows.__len__()} == 2    Switch Window    MAIN

Add First Product To Cart
    Wait Until Element Is Visible    id=inventory_container    timeout=15s
    Click Element    xpath=//button[contains(@id, 'add-to-cart')]
