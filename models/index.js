const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.Device = require("./device")(sequelize, Sequelize);
db.User = require("./user")(sequelize, Sequelize);
db.Hub = require("./hub")(sequelize, Sequelize);
db.Pet = require("./pet")(sequelize, Sequelize);


Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
