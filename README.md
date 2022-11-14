# Demo Credit

Demo credit app is a mobile lending app with wallet functionality.

# Description

Demo credit app is a mobile lending app with wallet functionality. This is needed as borrowers need a wallet to receive the loans they have been granted and also send the money for repayments.

This app is build for the Lendsqr Coding Assessment.

This app allows a user to:

- Create an account
- Fund their account
- Transfer funds to another user's account
- Withdraw funds from their account

## Architecture and Implementation

This an is built as a monolith with microservices code structure.
A nodejs server (written with Typescript) run the business logic and it connects to a MySQL database for data persistence and is run in a docker container.

This app uses the following technologies:

- NodeJS (LTS version)
- MySQL Database
- Docker

### <b>Database Schema</b>

The Database contains three(3) tables:

- Users (A list all the users that have access to the app)
- Wallets (Wallet and Account balance information for all users)
- Transactions (A record of all account transactions performed)

With the various relationships:

- One to one relationship between a User and a Wallet
- One to many relationship between a User and Transactions initiated by them
- Optional one to many between a source Wallet and a Transaction
- Optional one to many between a destination Wallet and a Transaction

![Entity Relation Diagram][er_diagram]

# How to run

The microservices is run in a docker container and can be started by building the image from the [Dockerfile](./Dockerfile) and running the container.

```
docker build -t demo-credit-app . && docker run -dp 3000:80 demo-credit-app
```

The database is run in another container from the official mysql image.

Use the Docker compose command below to start both containers at once

```
docker-compose up --build -d
```

[er_diagram]: ./data/demo%20credit%20er%20diagram.png "Entity Relation Diagram"
