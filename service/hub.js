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

const hubEdit = async (body) => {
    console.log("body", body);

    const {
        address,
        name
    } = body;

    try {
        const result = await Hub.update(
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
    hubList,
    hubEdit
};