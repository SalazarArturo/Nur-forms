require('dotenv').config()

const express        = require('express')
const cors           = require('cors')
const helmet         = require('helmet')
const rateLimit      = require('express-rate-limit')
const { sequelize, connectDB } = require('./config/db')

require('./models')

const authRoutes        = require('./modules/auth/auth.routes')
const usersRoutes       = require('./modules/users/users.routes')
const campaignsRoutes   = require('./modules/campaigns/campaigns.routes')
const formsRoutes       = require('./modules/forms/forms.routes')
const questionsRoutes   = require('./modules/questions/questions.routes')
const submissionsRoutes = require('./modules/submissions/submissions.routes')
const reportsRoutes     = require('./modules/reports/reports.routes')
const invitationsRoutes = require('./modules/invitations/invitations.routes')

const app  = express()
const PORT = process.env.PORT || 5000

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Demasiadas solicitudes, intenta mas tarde' }
})

app.use(helmet())
app.use(cors({origin: process.env.CLIENT_URL || 'http://localhost:5173'}))
app.use(express.json())
app.use(limiter)

app.use('/api/auth',        authRoutes)
app.use('/api/users',       usersRoutes)
app.use('/api/campaigns',   campaignsRoutes)
app.use('/api/forms',       formsRoutes)
app.use('/api/questions',   questionsRoutes)
app.use('/api/submissions', submissionsRoutes)
app.use('/api/reports',     reportsRoutes)
app.use('/api/invitations', invitationsRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Error interno del servidor' })
})

const start = async () => {
  await connectDB()
  await sequelize.sync({ alter: true })
  console.log('Tablas sincronizadas con la base de datos')
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
  })
}

start()

module.exports = app
