module.exports = (sequelize, DataTypes) => {
    const Device = sequelize.define(
        "Device",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            address: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true, // 유니크 설정
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            hub_id: {
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
        db.Device.belongsTo(db.Hub, { foreignKey: "hub_id" });
        db.Device.belongsTo(db.Pet, { foreignKey: "pet_id" });
    };

    return Device;
};
