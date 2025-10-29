module.exports = (sequelize, DataTypes) => {
    const Pet = sequelize.define(
        "Pet",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true, // PK 설정
            },
            species: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            breed: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            weight: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            gender: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            neutering: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            birthDate: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            admissionDate: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            veterinarian: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            diagnosis: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            medicalHistory: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            charset: "utf8mb4",
            collate: "utf8mb4_bin",
        }
    );
    Pet.associate = (db) => {
        db.Pet.belongsTo(db.User, { foreignKey: "id" });
        db.Pet.hasOne(db.Device, { foreignKey: "pet_id" });
    };

    return Pet;
};
