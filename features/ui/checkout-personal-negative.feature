@ui @checkout @negative
Feature: Checkout Personal Information Negative Validation

  Background:
    Given user launches checkout application
    Then checkout page UI should be displayed correctly


  Scenario: Validate invalid email format
    When user fills personal information except "none"
    And user enters invalid email "testemail"
    And user clicks Start my quote
    Then "Enter Valid Email Address" validation message should be displayed


  Scenario: Validate email without domain
    When user fills personal information except "none"
    And user enters invalid email "test@"
    And user clicks Start my quote
    Then "Enter Valid Email Address" validation message should be displayed


  Scenario: Validate phone with alphabets
    When user fills personal information except "none"
    And user enters phone "abcd12345"
    Then phone should accept only digits


  Scenario: Validate ZIP with alphabets
    When user fills personal information except "none"
    And user enters zip "42AB4"
    Then zip should accept only digits


  Scenario: Validate first name with special characters
    When user fills personal information except "none"
    And user enters first name "@@##"
    And user clicks Start my quote
    Then "First name is required" validation message should be displayed


  Scenario: Validate last name with numbers
    When user fills personal information except "none"
    And user enters last name "User123"
    Then last name should not accept numbers