@ui
Feature: Checkout Personal Information Boundary Validation

  Background:
    Given user launches checkout application
    Then checkout page UI should be displayed correctly

  @CHK_OUT_TC_11
  @CHK_OUT_TC_12
  @CHK_OUT_TC_13
  @CHK_OUT_TC_14
  @CHK_OUT_TC_15
  @CHK_OUT_TC_16
  @CHK_OUT_TC_17
  @CHK_OUT_TC_18
  @CHK_OUT_TC_19
  @CHK_OUT_TC_20
  @CHK_OUT_TC_21
  Scenario Outline: Validate personal information boundary values
    When user enters boundary data
      | firstName | lastName | email | address | phone | zip |
      | <first>   | <last>   | <email> | <address> | <phone> | <zip> |
    And user selects Good Sam member "Yes"
    And user clicks Start my quote
    Then "<result>" should happen

    Examples:
      | first | last | email | address | phone | zip | result |
      | A | Doe | a@b.co | 123 Main Street | 11234567890 | 42104 | success |
      | <100_char_string> | Doe | a@b.co | 123 Main Street | 12345697890 | 42104 | success |
      | <101_char_string> | Doe | a@b.co | 123 Main Street | 11234567890 | 42104 | error |
      | John | A | a@b.co | 123 Main Street | 12134567890 | 42104 | success |
      | John | <100_char_string> | a@b.co | 123 Main Street | 12345657890 | 42104 | success |
      | John | Doe | a@b.co | 123 Main Street | 12345678190 | 42104 | success |
      | John | Doe | verylongemailaddress123456789@exampledomain.com | 123 Main Street | 12334567890 | 42104 | success |
      | John | Doe | a@b.co | 123 Main Street | 12345617890 | 42104 | success |
      | John | Doe | a@b.co | 123 Main Street | 123456789012345 | 42104 | success |
      | John | Doe | a@b.co | 123 Main Street | 12345167890 | 42104 | success |
      | John | Doe | a@b.co | 123 Main Street | 12341567890 | 42104-1234 | success |