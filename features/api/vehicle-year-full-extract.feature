@api @latest
Feature: Full vehicle data extraction by year

  Scenario: Extract all RV vehicle data for a year
    Given vehicle type is "rvs"
    And vehicle year is "2024"
    When I extract complete vehicle hierarchy for the year
    Then vehicle CSV should be generated

  Scenario: Extract all AUTO vehicle data for a year
    Given vehicle type is "autos"
    And vehicle year is "2024"
    When I extract complete vehicle hierarchy for the year
    Then vehicle CSV should be generated


