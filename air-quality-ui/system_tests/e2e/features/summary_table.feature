Feature: Summary table
    A user should be able to set the data in the summary table according to the parameters 'forecast base time' and 'forecast window'

    Scenario: Changing the forecast base time on the summary page sets the correct data
      Given the user navigates to the summary page
      When they change the forecast base time to "date" "time"
      And they look at the entry in the table for "London"
      Then the table data should be based on the data for "date" "time", with forecast window 1
 