const { Hub } = require("../models");

const hubRegister = async (hubAddress, userId) => {
    try {
        const result = await Hub.create({
            address: hubAddress,
            user_id : userId,
            name: 'HUB'
        });
        return result;
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    hubRegister,
};