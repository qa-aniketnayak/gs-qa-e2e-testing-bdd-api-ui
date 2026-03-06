@ui
Feature: Checkout Personal Information Functional Validation

  Background:
    Given user launches checkout application
    Then checkout page UI should be displayed correctly

  @CHK_OUT_TC_01
  Scenario: Submit form with valid personal information
    When user completes personal information
    Then user should be navigated to vehicle page

  @CHK_OUT_TC_02
  Scenario: Submit form with Good Sam Member Yes
    When user fills personal information with member "Yes"
    Then user should be navigated to vehicle page

  @CHK_OUT_TC_03
  Scenario: Submit form with Good Sam Member No
    When user fills personal information with member "No"
    Then user should be navigated to vehicle page

  @CHK_OUT_TC_06
  Scenario: Verify default member selection
    Then Good Sam member default selection should be "No"

  @CHK_OUT_TC_07
  Scenario: Verify Good Sam logo navigation
    When user clicks Good Sam logo
    Then user should be navigated to home page

  @CHK_OUT_TC_08
  Scenario: Verify phone number link
    Then phone number link should be correct

  @CHK_OUT_TC_09
  Scenario: Verify retrieve quote button visibility
    When user clicks retrieve quote button
    Then retrieve quote button should be visible