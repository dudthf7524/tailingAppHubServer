const { Pet } = require("../models");


const petRegister = async (user_id, body) => {
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
            user_id
        });
        return result.id;
    } catch (error) {
        console.error(error);
    }
};

const petList = async () => {

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
    petRegister,
    petDetail
};