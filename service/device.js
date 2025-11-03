const { Device, Pet, Hub } = require("../models");

const deviceList = async (address) => {
    try {
        const result = await Device.findAll({
            where: { hub_address: address }
        })
        return result
    } catch (error) {
        console.error(error)
    }
}

const deviceRegister = async (body) => {
    const {
        name,
        address,
        hubAddress
    } = body;
    console.log(name, address, hubAddress)
    try {
        const result = await Device.create({
            name,
            address,
            hub_address: hubAddress
        });
        return result.id;
    } catch (error) {
        console.error(error);
    }
};

const deviceConnectPet = async (body) => {
    console.log(body);
    const {
        deviceAddress,
        petId,
    } = body;
    console.log(deviceAddress, petId)
    try {
        await Device.update(
            { pet_id: petId },
            { where: { address: deviceAddress } }
        );
    } catch (error) {
        console.error(error);
    }
}

const deviceConnectPetList = async (email) => {
    try {
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
        console.log("result : ", result)
        return result;
    } catch (error) {
        console.error(error);
    }
}

const deviceListName = async (email) => {
    try {
        const result = await Device.findAll({
            attributes: ['address', 'name'],
            include: [{
                model: Hub,
                attributes: [],
                where: { user_email: email },
                required: true,
            }],
            raw: true,   
        });
        console.log("result : ", result)
        return result;
    } catch (err) {
        console.error(err);
        throw err;
    }
};



const deviceEdit = async (body) => {
    const {
        address,
        name
    } = body;

    try {
        const result = await Device.update(
            {
                name
            },
            { where: { address } }
        );
        return result;
    } catch (error) {
        console.error(error);
    }
}



module.exports = {
    deviceList,
    deviceListName,
    deviceRegister,
    deviceConnectPet,
    deviceConnectPetList,
    deviceEdit
};