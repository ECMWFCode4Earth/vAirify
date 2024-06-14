#! /usr/bin/bash

if ! command -v wget
then 
    apt-get update
    apt-get -y install wget
fi

if ! command -v java
then 
    apt-get update
    apt-get -y install openjdk-17-jre
fi

wget -O- https://repo.liquibase.com/liquibase.asc | gpg --dearmor > liquibase-keyring.gpg && \
cat liquibase-keyring.gpg | sudo tee /usr/share/keyrings/liquibase-keyring.gpg > /dev/null && \
echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/liquibase-keyring.gpg] https://repo.liquibase.com stable main' | sudo tee /etc/apt/sources.list.d/liquibase.list

apt-get update
sudo apt-get install liquibase

LB_MONGO_VERSION=4.28.0
MDB_JAVA_DRIVER_VERSION=5.1.0

wget -O /usr/bin/lib/liquibase-mongodb-${LB_MONGO_VERSION}.jar https://github.com/liquibase/liquibase-mongodb/releases/download/v${LB_MONGO_VERSION}/liquibase-mongodb-${LB_MONGO_VERSION}.jar
wget -O /usr/bin/lib/bson-${MDB_JAVA_DRIVER_VERSION}.jar https://repo1.maven.org/maven2/org/mongodb/bson/${MDB_JAVA_DRIVER_VERSION}/bson-${MDB_JAVA_DRIVER_VERSION}.jar
wget -O /usr/bin/lib/mongodb-driver-core-${MDB_JAVA_DRIVER_VERSION}.jar https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-core/${MDB_JAVA_DRIVER_VERSION}/mongodb-driver-core-${MDB_JAVA_DRIVER_VERSION}.jar
wget -O /usr/bin/lib/mongodb-driver-sync-${MDB_JAVA_DRIVER_VERSION}.jar https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-sync/${MDB_JAVA_DRIVER_VERSION}/mongodb-driver-sync-${MDB_JAVA_DRIVER_VERSION}.jar

liquibase --version