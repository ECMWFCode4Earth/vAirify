Feature: Summary table
    A user should be able to set the data in the summary table according to the parameters 'forecast base time' and 'forecast window'

    # Background:
    #   Given the user navigates to the summary page

    Scenario: Changing the forecast base time on the summary page sets the correct data
      Given the user navigates to the summary page
      When they change the forecast base time to "date" "time"
      And they look at the entry in the table for "London"
      Then the table data should be based on the data for "date" "time", with forecast window "1
 
    # Scenario: Changing the forecast window on the summary page sets the correct data
    #     Given they change the forecast base time to "date" "time"
    #     When they change the forecast window to "3"
    #     Then the table data should be based on the data for "date" "time", with forecast window "3"
 
    # Scenario: Changing the forecast base time and window on the city page is reflected in the summary table data when navigating back to the summary page
    #     Given the user navigates to the "London" page
    #     And they change the forecast base time to "date" "time"
    #     And they change the forecast window to "3"
    #     When the user navigates back to the "summary" page
    #     Then the table data should be based on the data for "date" "time", with forecast window "3"npm help