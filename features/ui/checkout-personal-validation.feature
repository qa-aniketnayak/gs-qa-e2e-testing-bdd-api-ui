@ui
Feature: Checkout Personal Information Required Field Validation

  Background:
    Given user launches checkout application
    Then checkout page UI should be displayed correctly

  @CHK_OUT_TC_22
  Scenario: Submit empty form
    When user clicks Start my quote without entering data
    Then all required field validation errors should be displayed

  @CHK_OUT_TC_23
  @CHK_OUT_TC_24
  @CHK_OUT_TC_25
  @CHK_OUT_TC_26
  @CHK_OUT_TC_27
  @CHK_OUT_TC_28
  Scenario Outline: Validate required field errors
    When user fills personal information except "<field>"
    And user clicks Start my quote
    Then "<error>" validation message should be displayed

    Examples:
      | field       | error                          |
      | firstName   | First name is required         |
      | lastName    | Last name is required          |
      | email       | Email is required              |
      | address     | Home street address is required|
      | phone       | Phone number is required       |
      | zip         | ZIP Code is required           |