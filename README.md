# nc-news-backend
### This is a backend app developed using TDD, including a database and a hosted api server.

### This app is hosted by Render, and a description of available endpoints can be seen here: 
[Online app](https://nc-news-api-host.onrender.com/api) (this service may take ~1 min to spin up). 
---

### To run this on your local machine:
- You must have Node.js version 6.0.0 installed, and Postgres version 8.13.3 installed.
---
- Fork this repo, and clone it to your local machine.
- To install dependencies, from your CLI, run:<br>
   ```
  npm i
   ```
- To set up the test and development environments:<br>
- In the main directory, create a .env.test file containing the following: <br>
  ```
  PGDATABASE=nc_news_test
  ```
   and a .env.development file containing the following:<br>
  ```
  PGDATABASE=nc_news
  ``` 
- Seed the local test and development databases using:<br>
   ```
  npm run setup-dbs
   ```
   and
  ```
  npm run seed-dev
  ```
- To run tests on the test database, use:<br>
   ```
  npm t app
   ```
- To make requests to the development database, run:<br>
   ```
   npm start
   ```
   and then make requests using software such as Insomnia or Postman.


