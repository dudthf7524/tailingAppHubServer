const { User, Hub } = require("../models");


const checkUser = async (email) => {
    try {
        const result = await User.findOne({
            where: { email }
        });
        return result.id;
    } catch (error) {
        console.error(error);
    }
};

const checkHub = async (user_id, hub_address) => {
    try {
        const result = await Hub.findOne({
            where: {
                user_id,
                address: hub_address
            },
        });
        return result;
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    checkUser,
    checkHub
};