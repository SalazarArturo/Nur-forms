const usersService = require('./admin.service')

const getAll = async (req, res) => {
  try {
    const users = await usersService.getAll()
    return res.status(200).json(users)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const user = await usersService.getById(req.params.id)
    return res.status(200).json(user)
  } catch (error) {
    return res.status(404).json({ message: error.message })
  }
}

const updateRole = async (req, res) => {
  try {
    const { role } = req.body
    const user = await usersService.updateRole(req.params.id, role)
    return res.status(200).json(user)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const toggleActive = async (req, res) => {
  try {
    const user = await usersService.toggleActive(req.params.id)
    return res.status(200).json(user)
  } catch (error) {
      return res.status(400).json({ message: error.message })
  }
}

const registerUser = async (req, res, next) =>{
  try {

    const {email, password, full_name, role} = req.body;
    const result = await usersService.processNewUser({email, password, full_name, role});
    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      user:{
        id: result.id,
        email: result.email,
        full_name: result.email,
        role: result.role
      }
    });

  } catch (error) {

    if(error.message === 'No puede dejar este campo vacio' || error.message === 'Formato de email invalido' || error.message === 'Rol inválido'){
      return res.status(400).json({message: error.message});
    }
    next(error)
  }
}

const deleteUser = async (req, res, next) =>{
  try {
    
    const {id} = req.params;
    await usersService.deleteUserService(id);
    return res.status(200).json({message: 'Usuario eliminado correctamente'});

  } catch (error) {
    if(error.message === 'El usuario tiene campañas pendientes, debe terminar el ciclo de esta para poder ejecutar la accion' ||
        error.message === 'Este usuario es respondiente de una campaña activa, debe terminar el ciclo de esta para poder ejecutar la accion' ||
        error.message === 'El usuario no existe'
    ){
      return res.status(400).json({message: error.message});
    }
    next(error);
  }
}
module.exports = { getAll, getById, updateRole, toggleActive, registerUser, deleteUser }
