Feature: Summary table tests

Background:
    Given the user navigates to the summary page
    And the forecast window is set to "1"

Scenario: Default table data
    When they look at the entry in the table for "London"
    Then table data should be based on the data for "today", with forecast window "1"

Scenario: Changing the forecast base time
    When they change the forecast base time to "date" "time" for "London"
    Then table data should be based on the data for "date" "time", with forecast window "1"

Scenario: Changing the forecast window
    When they change the forecast window to "3"
    And they change the forecast base time to "date" "time" for "London"
    Then table data should be based on the data for "date" "time", with forecast window "3"

Scenario: Default table AQI colours
    When they look at the entry in the table for "London"
    Then table data should be coloured to represent the AQI levels of the values

Scenario: Toggle 'Highlight all AQI values' button to off position
    When they look at the entry in the table for "London"
    And they turn "off" highlighting all AQI values
    Then table data should be coloured to represent the AQI levels of the values