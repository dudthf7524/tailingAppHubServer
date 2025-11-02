module.exports = (sequelize, DataTypes) => {
    const Device = sequelize.define(
        "Device",
        {
            address: {
                type: DataTypes.STRING,
                allowNull: false,
               primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            hub_address: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            pet_id: {
                type: DataTypes.STRING,
                allowNull: true
            }
        },
        {
            charset: "utf8mb4",
            collate: "utf8mb4_bin",
        }
    );
    Device.associate = (db) => {
        db.Device.belongsTo(db.Hub, { foreignKey: "hub_address" });
        db.Device.belongsTo(db.Pet, { foreignKey: "pet_id" });
    };

    return Device;
};
