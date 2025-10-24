# Basics
## First step
After cloning the project run:

    # Install the node_modules
    npm i
    
    # Build the distribution
    npm run build

## Environment variables
Create a **.env** file in the root (project folder) and add this content:

    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=<user>
    DB_PASSWORD=<password>
    DB_DATABASE=bulletin_db
    JWT_SECRET=uqsdDXSgO4GiFNBao/ixIGc0yBuDTV2rvdedtizYkSIxHLFursodOLS1xeqQYBaCQNCHxv2a+RX31kLI/R7HGg==

For the last line (JWT_SECRET), generate a cryptographically secure random secret on the terminal:

    # base64, ~64 bytes of random -> long secret
    openssl rand -base64 64

## Run node
Use this command in your environment:

    # Development environment
    npm run dev
    
    # Production environment
    npm run start

