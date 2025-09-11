const findByEmail = async (user_id) => {
    try {
        const result = await user.findOne({ where: { user_id: user_id }, raw: true });
        return result
    } catch (error) {
        console.error(error);
    }
};

module.exports = {
    findByEmail,
};