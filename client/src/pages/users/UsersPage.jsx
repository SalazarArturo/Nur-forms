import { useEffect, useState } from 'react'
import { usersApi } from '../../api/services'
import { Modal, Confirm, Loading, Alert } from '../../components/ui'
import './Users.css'

const ROLES = ['admin', 'creator', 'respondent']
const ROLE_LABELS = { admin: 'Administrador', creator: 'Creador', respondent: 'Respondente' }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [roleModal, setRoleModal] = useState(null)
  const [newRole, setNewRole] = useState('')
  const [savingRole, setSavingRole] = useState(false)
  const [confirmToggle, setConfirmToggle] = useState(null)
  const [toggling, setToggling] = useState(false)
  const [filter, setFilter] = useState('')

  const load = () => {
    usersApi.getAll()
      .then(r => setUsers(r.data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openRoleModal = (u) => {
    setRoleModal(u)
    setNewRole(u.role)
  }

  const handleSaveRole = async () => {
    setSavingRole(true)
    try {
      await usersApi.updateRole(roleModal.id, newRole)
      setRoleModal(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar rol')
    } finally { setSavingRole(false) }
  }

  const handleToggleActive = async () => {
    setToggling(true)
    try {
      await usersApi.toggleActive(confirmToggle.id)
      setConfirmToggle(null)
      load()
    } catch {} finally { setToggling(false) }
  }

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(filter.toLowerCase()) ||
    u.email.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Gestión de usuarios y roles del sistema</p>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ maxWidth: 340 }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <Loading /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-bg)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {u.full_name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--text-h)' }}>{u.full_name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <span className={`badge badge--${u.role}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td>
                      <span className={`badge badge--${u.is_active ? 'published' : 'closed'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openRoleModal(u)}>
                          Cambiar rol
                        </button>
                        <button
                          className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                          onClick={() => setConfirmToggle(u)}
                        >
                          {u.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role modal */}
      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title="Cambiar rol">
        {roleModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--text)' }}>
              Cambiando rol de <strong>{roleModal.full_name}</strong>
            </p>
            <div className="field">
              <label>Nuevo rol</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="modal__footer">
              <button className="btn btn-secondary" onClick={() => setRoleModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSaveRole} disabled={savingRole}>
                Guardar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Confirm
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={handleToggleActive}
        loading={toggling}
        danger={confirmToggle?.is_active}
        title={confirmToggle?.is_active ? 'Desactivar usuario' : 'Activar usuario'}
        message={`¿${confirmToggle?.is_active ? 'Desactivar' : 'Activar'} a ${confirmToggle?.full_name}?`}
      />
    </div>
  )
}
