@api @address
Feature: Address validation API

  Scenario: Validate address successfully
    Given API client is initialized
    And address validation request payload is prepared
    When I call address validation API
    Then address validation should be successful

  Scenario: Validate address with URL encoded input
    Given API client is initialized
    And address validation payload with URL encoded address is prepared
    When I call address validation API
    Then address should be cleansed and decoded correctly

  Scenario: Validate address with blank address1
    Given API client is initialized
    And address validation payload with blank address1 is prepared
    When I call address validation API
    Then address validation should fail with address1 required error

  Scenario: Validate address with blank zipCode
    Given API client is initialized
    And address validation payload with blank zipCode is prepared
    When I call address validation API
    Then address validation should fail with zipCode required error

  Scenario: Validate address with blank country
    Given API client is initialized
    And address validation payload with blank country is prepared
    When I call address validation API
    Then address validation should fail with country required error


  Scenario: Validate address with invalid ZIP format
    Given API client is initialized
    And address validation payload with invalid zipCode is prepared
    When I call address validation API
    Then address validation should fail with invalid zipCode error
