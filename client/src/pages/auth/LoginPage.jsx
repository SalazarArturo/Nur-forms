import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import logo from '../../assets/nur_logo.png'
import './Login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    try {
      const user = await login(email, password)
      navigate('/')
    } catch {
      // error is set in store
    }
  }

  return (
    <main className="login-page">
      <div className="login-bg" />
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src={logo} alt="NUR logo" className="login-logo" />
          <h1>FormsNUR</h1>
          <p className="login-sub">Sistema de Encuestas Online</p>
        </div>

        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@nur.edu.bo"
            autoComplete="email"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p className="login-error">{error}</p>
        )}

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  )
}
