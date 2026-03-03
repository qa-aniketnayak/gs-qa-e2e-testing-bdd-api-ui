@ui
Feature: ESP Checkout E2E

  Scenario Outline: Guest user completes ESP checkout till order completion for <VehicleType>
    Given user launches checkout application
    Then checkout page UI should be displayed correctly
    When user completes personal information
    And user completes vehicle information for "<VehicleType>"
    And user customizes plan
    And user reviews and secures quote
    Then payment page should be displayed
    And user completes payment
    Then order should be completed

    Examples:
      | VehicleType |
      | Auto        |
      | RV          |