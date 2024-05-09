## Liquibase

The [liquibase directory](../liquibase) of this repo contains configuration files known as **changesets** to create the required collections for our application.

### Prerequisites

- Install liquibase and jars specified [here](https://contribute.liquibase.com/extensions-integrations/directory/database-tutorials/mongodb)
- Add liquibase to your PATH


### Command

From within liquibase directory:

`liquibase update --changelog-file master_changelog.xml --url mongodb+srv://<username:password>@cluster0.ch5gkk4.mongodb.net/<db_name>`

Alternatively, the url can be placed in a liquibase.properties file within the liquibase directory and omitted from the above command e.g:

`liquibase update --changelog-file master_changelog.xml`