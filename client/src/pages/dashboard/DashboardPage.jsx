import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { campaignsApi } from '../../api/services'
import { StatusBadge, Loading } from '../../components/ui'
import './Dashboard.css'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    campaignsApi.getAll().then(r => setCampaigns(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    closed: campaigns.filter(c => c.status === 'closed').length,
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Bienvenido, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Panel de control del sistema de encuestas</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/campaigns')}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nueva campaña
        </button>
      </div>

      <div className="dashboard-stats">
        <StatCard label="Total campañas" value={stats.total} color="brand" />
        <StatCard label="Activas" value={stats.active} color="success" />
        <StatCard label="Borradores" value={stats.draft} color="muted" />
        <StatCard label="Cerradas" value={stats.closed} color="danger" />
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section__title">Campañas recientes</h2>
        {loading ? <Loading /> : (
          campaigns.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
              <p>No hay campañas aún.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/campaigns')}>
                Crear primera campaña
              </button>
            </div>
          ) : (
            <div className="dashboard-campaigns">
              {campaigns.slice(0, 6).map(c => (
                <div key={c.id} className="dash-campaign-card" onClick={() => navigate(`/campaigns/${c.id}`)}>
                  <div className="dash-campaign-card__header">
                    <h3>{c.name}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  {c.description && <p className="text-muted text-sm" style={{ marginTop: 4 }}>{c.description}</p>}
                  <div className="dash-campaign-card__meta">
                    <span className="text-sm text-muted">
                      {c.forms?.length || 0} formulario{c.forms?.length !== 1 ? 's' : ''}
                    </span>
                    {c.ends_at && (
                      <span className="text-sm text-muted">
                        Cierra {new Date(c.ends_at).toLocaleDateString('es-BO')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  )
}
