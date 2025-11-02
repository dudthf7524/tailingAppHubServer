const { Pet } = require("../models");


const petRegister = async (email, body) => {
    const {
        name,
        species,
        phone,
        breed,
        weight,
        gender,
        neutering,
        birthDate,
        admissionDate,
        veterinarian,
        diagnosis,
        medicalHistory
    } = body;
    try {
        const result = await Pet.create({
            name,
            species,
            phone,
            breed,
            weight,
            gender,
            neutering,
            birthDate,
            admissionDate,
            veterinarian,
            diagnosis,
            medicalHistory,
            user_email : email
        });
        return result.id;
    } catch (error) {
        console.error(error);
    }
};

const petList = async (email) => {
    try {
        const result = await Pet.findAll({
            where: { user_email: email }
        })
        return result
    } catch (error) {
        console.error(error);
    }
}

const petDetail = async (petId) => {

    try {
        const result = await Pet.findOne({ where: { id: petId } });
        console.log("result", result);
        return result;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    petList,
    petRegister,
    petDetail
};