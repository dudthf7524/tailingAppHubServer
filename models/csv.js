module.exports = (sequelize, DataTypes) => {
    const Csv = sequelize.define(
        "Csv",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            file_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            pet_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            device_address: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            charset: "utf8mb4",
            collate: "utf8mb4_bin",
        }
    );
    Hub.associate = (db) => {
        db.Hub.belongsTo(db.User, { foreignKey: "user_email" });
        db.Hub.hasMany(db.Device, { foreignKey: "hub_address" });
    };

    return Csv;
};
