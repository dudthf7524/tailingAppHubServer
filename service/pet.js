const { Pet, Device } = require("../models");


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
            user_email: email

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
        return result;
    } catch (error) {
        console.error(error);
    }
}

const petEdit = async (body) => {
    const {
        id,
        name,
        species,
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
        const result = await Pet.update(
            {
                name,
                species,
                breed,
                weight,
                gender,
                neutering,
                birthDate,
                admissionDate,
                veterinarian,
                diagnosis,
                medicalHistory
            },
            { where: { id } }
        );
        return result;
    } catch (error) {
        console.error(error);
    }
}

const petDelete = async (petId) => {
    try {
        await Pet.destroy({ where: { id: petId } });
    } catch (error) {
        console.error(error);
    }
}

const petConnectDevice = async (email) => {
    const result = await Device.findAll({
        attributes: [
            'address',
            ['name', 'device_name']
        ],
        include: [{
            model: Pet,
            attributes: [
                ['id', 'pet_id'],
                ['name', 'pet_name'],
                'breed'
            ],
            required: true,
            where: {
                user_email: email  // Pet 테이블의 user_id로 필터링
            }
        }],
    });
    return result;
}

const petConnectDeviceList = async (email) => {
    try {
        const result = await Pet.findAll({
            where: {
                user_email: email,
                device_address: null,
            },
        })
        return result
    } catch (error) {
        console.error(error);
    }
}


const petEditDeviceAddress = async (id, address) => {
    try {
        const result = await Pet.update(
            {
                device_address : address
            },
            { where: { id } }
        );
        return result;
    } catch (error) {
        console.error(error)
    }
}

const petWithDeviceFindOne = async (address) => {

    try {
        const result = await Pet.findOne({ where: { device_address: address } });
        return result.id;
        return result;
    } catch (error) {
        console.error(error);
    }
}


const petEditNullDeviceAddress = async (id) => {
   
    try {
        const result = await Pet.update(
            {
                device_address : null
            },
            { where: { id } }
        );
        return result;
    } catch (error) {
        console.error(error)
    }
}
module.exports = {
    petList,
    petRegister,
    petDetail,
    petEdit,
    petDelete,
    petConnectDevice,
    petConnectDeviceList,
    petEditDeviceAddress,
    petWithDeviceFindOne,
    petEditNullDeviceAddress
};