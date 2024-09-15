# Northcoders News API

Hosted API link: https://ilters-news.onrender.com/api

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)

Northcoders News API is a backend service that provides endpoints for managing and retrieving news articles and related information.

------------ Featured Endpoints ------------

For featured endpoints, please refer to: endpoints.json

------------ Getting Started ------------

To get a local copy up and running follow these steps with their following commands:

- Ensure you have following software installed:
  Node.js: v22.5.0+
  PostgreSQL: v16.4+

- Clone the repository and cd into it:
  'git clone https://github.com/ilterr/ilters_be_project'
  'cd ilters_be_project'

- Install dependencies:
  'npm install'

- You will need to create two .env files to configure your local environment:

  '.env.development'
    This file should contain the following line:
    'PGDATABASE=nc_news'

  '.env.test'
    This file should contain the following line:
    'PGDATABASE=nc_news_test'

- To seed your local database:
  'npm run seed'

- To run tests use:
  'npm test'
