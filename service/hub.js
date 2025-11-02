const { Hub } = require("../models");

const hubList = async (email) => {
    try {
        const result = await Hub.findAll({
            where: { user_email: email }
        })
        return result;
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    hubList,
};