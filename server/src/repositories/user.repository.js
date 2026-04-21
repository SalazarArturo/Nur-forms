const userModel = require('./../models/User.js');
const campaignModel = require('./../models/Campaign.js');
const submissionModel = require('./../models/Submission.js');

async function getAllUsers(){ //esto facilmente podria entrar en un try catch por el hecho de ser asincrono y que algo pueda fallar pero retornamos lo que sea que retorne la llamada al modelo, eso igual implicaria que estemos retornando el error ? osea digamos que esto falla pero aun asi solo tenemos  return await userModel.findAll({
  //  attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'created_at']
 // }); digamos que esto fallo entonces lo que retornamos es el error ?  
   return await userModel.findAll({
    attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'created_at']
  });
}

async function getUserById(id){
    return await userModel.findByPk(id, {
    attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'created_at']
  });
}
async function getUserByEmail(email) {
  return await userModel.findOne({where: {email}});
}

async function updateUserById(id, newData){
   const result = await userModel.update(newData, {returning: true, where:{id}});
   return result[1][0]; //[ rowsUpdate, [updatedInstanceModel] ]
}
async function createUser(userData){  

  const user = await userModel.create(userData);
  return user; 
}

async function countUserCampaigns(userId){
  try {
    const result = await campaignModel.count({where:{created_by: userId}})
    return result;  
  } catch (error) {
    throw error
  }
}

async function countUserSubmissions(userId) {
  try {
    const result = await submissionModel.count({ where: { user_id: userId } });
    return result;
  } catch (error) {
    throw error;
  }
}

async function deleteUser(userId){
  try {
    const result = await userModel.destroy({where: {id: userId}});
    return result; //la cantidad de filas eliminadas en la base de datos: number/int
  } catch (error) {
    throw error
  }
}

async function getUserCampaigns(userId){
  
}
module.exports = {
    getUserByEmail,
    getAllUsers,
    getUserById,
    updateUserById,
    createUser,
    countUserCampaigns,
    countUserSubmissions,
    deleteUser
}