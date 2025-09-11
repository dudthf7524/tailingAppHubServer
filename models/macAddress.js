module.exports = (sequelize, DataTypes) => {
    const MacAddress = sequelize.define(
        "MacAddress",
        {
            mac_address: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true, // PK 설정
            },
            device_name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true, // 유니크 설정
            },
        },
        {
            charset: "utf8mb4",
            collate: "utf8mb4_bin",
        }
    );
    MacAddress.associate = (db) => { };

    return MacAddress;
};
