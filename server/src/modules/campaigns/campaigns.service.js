const { Campaign, CampaignMember, User, Form } = require('../../models')

const {
  getAllCampaigns,
  getAllUserCampaigns,
  getAsMemberCampaigns,
  getCampaignDetails,
  getCampaignById,
  createCampaign,
  updateCampaignState
} = require('../../repositories/campaign-repository.js');

const {getMembership} = require('../../repositories/campaign-member.repository.js');

const getAllService = async (role, userId) => {

  if(role === 'admin'){
    try {
      const result = await getAllCampaigns();
      return result;

    } catch (error) {
      throw error;
    }
  }

  if(role === 'creator'){
    try { //aqui podriamos hacer la segunda llamada al respository para obtener las campañas en donde el usuario es colaborador
      const [ownCampaigns, memberCampaigns] = await Promise.all([
        getAllUserCampaigns(userId),
        getAsMemberCampaigns(userId)
      ]);
      return{
        ownCampaigns,
        memberCampaigns
      }

    } catch (error) {
      throw error
    }
  }
}

const getByIdService = async (campaignId, userId, userRole) => {
    try {
      const campaignExist = await getCampaignById(campaignId);

      if(!campaignExist) throw new Error('Campaña inexistente');

      if(userRole === 'creator'){

        const isOwner = campaignExist.created_by === userId;
        const membership = await getMembership(campaignId, userId);

        if(!isOwner && !membership) throw new Error('No tiene acceso a esta campaña');
      }

      const detailsResult = await getCampaignDetails(campaignId);
      return detailsResult;

    } catch (error) {
      throw error;
    }
}

const createService = async (campaignData, ownerId) => {

   // const { name, description, starts_at, ends_at } = req.body;

   if(campaignData.name.trim() == ''){
    throw new Error('Nombre de campaha es obligatorio');
   }

   if(campaignData.starts_at && campaignData.ends_at){

        const currentTime = new Date();
        currentTime.setHours(0,0,0,0);

        const startCampaign = new Date(campaignData.starts_at + 'T00:00:00')
        const endCampaign = new Date(campaignData.ends_at + 'T00:00:00')

        if(isNaN(startCampaign.getTime()) || isNaN(endCampaign.getTime())){
            throw new Error('Formato de fecha invalido');
        }

        if(startCampaign < currentTime) throw new Error('Fecha de inicio no puede ser pasada a fecha actual');
        if(endCampaign < currentTime) throw new Error('La fecha de finalizacion no puede ser pasada a la fecha actual');
        if(endCampaign < startCampaign) throw new Error('La fecha de finalizacion no puede ser pasada a la fecha de inicio');

    }else{
        campaignData.starts_at = null;
        campaignData.ends_at = null;
    }

    try {
        const result = await createCampaign({
            name: campaignData.name,
            description: campaignData.description?? 'Sin descripcion',
            starts_at: campaignData.starts_at,
            ends_at: campaignData.ends_at
        }, ownerId);

        return {
            message: 'Campaha creada exitosamente'
        }

    } catch (error) {
        throw error;
    }
}

const updateService = async (id, data, userId, userRole) => {
  try {
    //primero confirmamos que la campaña existe
    const result = await getCampaignById(id);
    if(!result) throw new Error('Campaña inexistente');
    

    const currentState = result.status; //estado actual
    const {newState} = data;

    const validValues = ['active', 'closed', 'archived', 'draft'];

    const validValue = validValues.includes(newState);

     const validTransitions = { //transiciones validas de un estado a otro
      draft:['active', 'closed'],
      active:['draft', 'closed'],
      closed:['archived'],
      archived: []
    }

    if(validValue){
        if(currentState === 'archived') throw new Error('Esta campaña no se puede editar');

        const isValidStatusTransition = validTransitions[currentState].includes(newState);

        if(isValidStatusTransition){

          const result = await updateCampaignState(id, newState);
          if(result === 0){
            throw new Error('No se pudo actualizar estado, intente nuevamente');
          }
          return {
            message: 'Estado actualizado con exito'
          };
        }else{
          throw new Error('Entrada invalida');
        }
    }

    throw new Error('Entrada invalida');

  } catch (error) {
    throw error;
  }
}

const remove = async (id, userId, userRole) => {
  const campaign = await Campaign.findByPk(id)
  if (!campaign) throw new Error('Campaña no encontrada')

  if (userRole !== 'admin') {
    const member = await CampaignMember.findOne({ where: { campaign_id: id, user_id: userId, role: 'owner' } })
    if (!member) throw new Error('Solo el dueño puede eliminar esta campaña')
  }

  await campaign.destroy()
}

const duplicate = async (id, userId) => {
  const original = await Campaign.findByPk(id, { include: [{ model: Form, as: 'forms' }] })
  if (!original) throw new Error('Campaña no encontrada')

  const copy = await Campaign.create({
    name: `${original.name} (copia)`,
    description: original.description,
    status: 'draft',
    created_by: userId
  })
  await CampaignMember.create({ campaign_id: copy.id, user_id: userId, role: 'owner' })
  return copy
}

const addMember = async (campaignId, { user_id, role }, requesterId, requesterRole) => {
  const campaign = await Campaign.findByPk(campaignId)
  if (!campaign) throw new Error('Campaña no encontrada')

  if (requesterRole !== 'admin') {
    const member = await CampaignMember.findOne({ where: { campaign_id: campaignId, user_id: requesterId, role: 'owner' } })
    if (!member) throw new Error('Solo el dueño puede agregar miembros')
  }

  const existing = await CampaignMember.findOne({ where: { campaign_id: campaignId, user_id } })
  if (existing) throw new Error('El usuario ya es miembro de esta campaña')

  return CampaignMember.create({ campaign_id: campaignId, user_id, role: role || 'viewer' })
}

const removeMember = async (campaignId, memberId, requesterId, requesterRole) => {
  if (requesterRole !== 'admin') {
    const member = await CampaignMember.findOne({ where: { campaign_id: campaignId, user_id: requesterId, role: 'owner' } })
    if (!member) throw new Error('Solo el dueño puede eliminar miembros')
  }
  await CampaignMember.destroy({ where: { id: memberId } })
}

module.exports = { getAllService, getByIdService, createService, updateService}