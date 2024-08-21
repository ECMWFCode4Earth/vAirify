Feature: Summary table tests

Scenario: Changing the forecast base time on the summary page
    Given the user navigates to the "summary page"
    When they change the forecast base time to "date" "time"
    And they look at the entry in the table for "London"
    Then the table data should be based on the data for "date" "time", with forecast window "1"

Scenario: Changing the forecast window on the summary page
    Given the user navigates to the "summary page"
    And they change the forecast base time to "date" "time"
    When they change the forecast window to "3"
    Then the table data should be based on the data for "date" "time", with forecast window "3"

Scenario: Changing the forecast base time and window on the summary page is reflected in the city page
    Given the user navigates to the "summary page"
    And they change the forecast base time to "date" "time"
    And they change the forecast window to "3"
    When the user navigates to the city page for "London"
    Then the AQI graph data should be based on the data for "London" on "date" "time", with forecast window "3"