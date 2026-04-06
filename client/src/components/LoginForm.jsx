import { useState } from 'react'
import axios from 'axios'
import './LoginForm.css'
import logo from '../assets/nur_logo.png'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await axios.post(
        API_URL + '/auth/login',
        { email, password },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (res.data?.success) {
        setSuccess(res.data.message || 'Login exitoso')
      } else {
        setError('No se pudo iniciar sesión')
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al conectar con el servidor'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src={logo} alt="FormsNur logo" className="login-logo" />
          <h1>FormsNur</h1>
        </div>

        <label htmlFor="email">Correo</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@admin.com"
          autoComplete="email"
          required
        />

        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </form>
    </main>
  )
}

export default LoginForm