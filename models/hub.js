module.exports = (sequelize, DataTypes) => {
    const Hub = sequelize.define(
        "Hub",
        {
            address: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true, // PK 설정
            },
            hub_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            org_email: {
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
        db.Hub.belongsTo(db.Organization, { foreignKey: "org_email" });
    };

    return Hub;
};
