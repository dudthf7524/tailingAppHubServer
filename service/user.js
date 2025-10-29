const { User } = require("../models");


const userLogin = async (email) => {
    try {
        const exUser = await User.findOne({ where: { email: email } });
        return exUser;
    } catch (error) {
        console.error(error);
    }
};
const userInformation = async (user_id) => {
    try {
        const userInfo = await User.findOne({ where: { id: user_id } });
        console.log("userInfo", userInfo);
        return userInfo;
    } catch (error) {
        console.error(error);
    }
};

const userChangePassword = async (user_id, password) => {
    try {
       
        return userInfo;
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    userLogin,
    userInformation,
    userChangePassword
};