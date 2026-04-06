const userModel = require('./../models/User.js');

async function getUserByEmail(email) {
  return await User.findOne({ where: { email } })
}

async function createUser(userData){
    try {
        const user = await userModel.create(userData);
        return user; 
    } catch (error) {
        throw new Error(`Error al crear nuevo usuario: ${error.message}`);
    }
}

module.exports = {
    getUserByEmail,
    createUser
}