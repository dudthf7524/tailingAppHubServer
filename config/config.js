// const dotenv = require("dotenv");

// dotenv.config();

module.exports = {
  development: {
    username: "root",
    password: "zmfladhvm",
    database: "tailingHubDB",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+09:00",
  },
  test: {
    username: "root",
    password: "zmfladhvm",
    database: "tailingDB",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+09:00",
  },
  production: {
    username: "root",
    password: "zmfladhvm",
    database: "tailingDB",
    host: "127.0.0.1",
    dialect: "mysql",
    timezone: "+09:00",
  },
};
