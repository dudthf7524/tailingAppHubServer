module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    "Organization",
    {
      org_email: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      org_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      org_address: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      org_pw: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      org_phone: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      agree_marketing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      agree_sms: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      agree_email: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      agree_push: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      max_device_cnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 5
      },
      current_device_cnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 0
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      charset: "utf8mb4",
      collate: "utf8mb4_bin",
    }
  );
  Organization.associate = (db) => {
    db.Organization.hasOne(db.Hub, { foreignKey: "org_email" });
  };
  return Organization;
}


