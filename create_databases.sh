#!/bin/bash

# Load the environment variables from .env file
source /docker-entrypoint-initdb.d/.env

# Create the users database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB_USERS" <<-EOSQL
    CREATE DATABASE "$POSTGRES_DB_USERS";
    GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_DB_USERS" TO "$POSTGRES_USER";
EOSQL

# Create the products database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB_PRODUCTS" <<-EOSQL
    CREATE DATABASE "$POSTGRES_DB_PRODUCTS";
    GRANT ALL PRIVILEGES ON DATABASE "$POSTGRES_DB_PRODUCTS" TO "$POSTGRES_USER";
EOSQL
