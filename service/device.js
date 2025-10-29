const { Device, Pet } = require("../models");

const deviceRegister = async (body) => {
    const {
        name,
        address,
        hubId
    } = body;
    try {
        const result = await Device.create({
            name,
            address,
            hub_id: hubId
        });
        return result.id;
    } catch (error) {
        console.error(error);
    }
};

const deviceConnectPet = async (body) => {
    console.log(body);
    const {
        deviceId,
        petId,
    } = body;
    try {
        await Device.update(
            { pet_id: petId },
            { where: { id: deviceId } }
        );
    } catch (error) {
        console.error(error);
    }
}

const deviceConnectPetList = async (user_id) => {
    try {
        const result = await Device.findAll({
            attributes: [
                ['id', 'device_id'],
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
                    user_id  // Pet 테이블의 user_id로 필터링
                }
            }],

        });
        console.log("result : ", result)
        return result;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    deviceRegister,
    deviceConnectPet,
    deviceConnectPetList
};