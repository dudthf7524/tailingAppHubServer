const { User, Hub } = require("../models");

const hubRegister = async (hubAddress, email) => {
    try {
        const result = await Hub.create({
            address: hubAddress,
            user_email: email,
            name: 'HUB',
            is_change: false,
        });
        return result;
    } catch (error) {
        console.error(error);
    }
};

const checkHub = async (hub_address) => {
    try {
        const result = await Hub.findOne({
            where: {
                address: hub_address
            },
        });
        return result;
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    hubRegister,
    checkHub
};