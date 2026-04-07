const authService = require('./auth.service')

/*const register = async (req, res) => { //este no deberia estar aqui
  try {
    const { email, password, full_name } = req.body
    const result = await authService.register({email, password, full_name})
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message }) //aqui nos quedamos, veremos como recibe una nueva sesion el front, si con token pelado o cookie
  }
}
*/
const login = async (req, res, next) => { //login check
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password});

    return res.status(200).json(result);

  } catch (error) {
    if (error.message === 'Usuario o contraseña incorrectos') { //aqui entiendo que atrapamos los errores que lanza el service
      return res.status(401).json({ message: error.message })
    }
    next(error); //y esto pasaria si fuera un error externo a los que lanzamos .. como el de bcrypt o tal vez del repository
    //en donde ya actuaria nuestro middleware global que definimos en el app.js cierto ?
  }
}

const me = async (req, res) => {
  res.status(200).json({ user: req.user })
}

const logout = (req, res) =>{
  return res.status(200).json({message: 'Sesion cerrada correctamente'});
}
module.exports = {login, me, logout}
