const { verifyToken } = require('../utils/jwt')

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Token requerido'})
  }

  try {
    const payload = verifyToken(token)
    req.user = payload;
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}
////////////////////////////////////////////////////////////////////////////////
const authorize = (...roles) => { //creo que esto deja parsar a cualquier usuario con un rol definido dentro de la app, no solo si es admin ..
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para esto.' })
    }
    next()
  }
}


module.exports = { authenticate, authorize }
