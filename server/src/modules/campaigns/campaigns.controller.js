const {getAllService, getByIdService, createService, updateService} = require('./campaigns.service')

const getAll = async (req, res, next) => {
  
  try {
    const campaigns = await getAllService(req.user.role, req.user.id);
    res.status(200).json({campaigns: campaigns});
  } catch (error) {
    return next(error);
  }
}


const getById = async (req, res, next) => {
  try {
    const campaignDetails = await getByIdService(req.params.id, req.user.id, req.user.role)
    res.status(200).json({campaignDetails});
  } catch (error) {

    if(error.message === 'No tiene acceso a esta campaña'){
      return res.status(403).json({message: error.message});
    }
    if(error.message === 'Campaña inexistente'){
      return res.status(400).json({message: error.message});
    }
    return next(error);
  }
}

const create = async (req, res) => {
  try {
    const result = await createService(req.body, req.user.id)
    return res.status(201).json(result);
  } catch (error) { //aqui manejamos errores de mala entrada peeero no estamos manejando el caso de un error interno en el server
    return res.status(400).json({ message: error.message });
  }
}

const update = async (req, res, next) => {
  try {
    const campaign = await updateService(req.params.id, req.body, req.user.id, req.user.role)
    return res.status(200).json(campaign)
  } catch (error) {
    if(error.message === 'No se pudo actualizar estado, intente nuevamente') return res.status(500).json({message: error.message}); 
    res.status(400).json({message: error.message});
  }
}

const remove = async (req, res) => {
  try {
    await campaignsService.remove(req.params.id, req.user.id, req.user.role)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const duplicate = async (req, res) => {
  try {
    const campaign = await campaignsService.duplicate(req.params.id, req.user.id)
    res.status(201).json(campaign)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const addMember = async (req, res) => {
  try {
    const member = await campaignsService.addMember(req.params.id, req.body, req.user.id, req.user.role)
    res.status(201).json(member)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const removeMember = async (req, res) => {
  try {
    await campaignsService.removeMember(req.params.id, req.params.memberId, req.user.id, req.user.role)
    res.status(204).send()
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {getAll, getById, create, update, remove, duplicate, addMember, removeMember }
