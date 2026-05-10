import { useNavigate } from 'react-router-dom'
import LoginForm from '../../components/LoginForm'
import './Login.css'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <main className="login-page">
      <div className="login-bg" />
      <LoginForm onSuccess={() => navigate('/')} />
    </main>
  )
}
