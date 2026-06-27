import { useEffect, useState, useRef } from 'react'
import { usersApi } from '../../api/services'
import { Modal, Confirm, Loading, Alert } from '../../components/ui'
import './Users.css'

const ROLES = ['admin', 'creator', 'respondent']
const ROLE_LABELS = { admin: 'Administrador', creator: 'Creador', respondent: 'Respondente' }
const ROLE_FILTER_OPTIONS = [{ value: '', label: 'Todos los roles' }, ...ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] }))]

export default function UsersPage() {
  // ── Lista principal ──────────────────────────────────────────
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // ── Filtros locales ──────────────────────────────────────────
  const [filterText, setFilterText]   = useState('')
  const [filterRole, setFilterRole]   = useState('')
  const [filterState, setFilterState] = useState('')  // '' | 'active' | 'inactive'

  // ── Búsqueda por email ───────────────────────────────────────
  const [searchEmail, setSearchEmail]       = useState('')
  const [searchResults, setSearchResults]   = useState(null)  // null = sin búsqueda aún
  const [searching, setSearching]           = useState(false)
  const searchRef = useRef(null)

  // ── Acciones ─────────────────────────────────────────────────
  const [roleModal, setRoleModal]     = useState(null)   // user object
  const [newRole, setNewRole]         = useState('')
  const [savingRole, setSavingRole]   = useState(false)

  const [confirmToggle, setConfirmToggle] = useState(null)  // user object
  const [toggling, setToggling]           = useState(false)

  // ── Carga ────────────────────────────────────────────────────
  const load = () => {
    setLoading(true)
    usersApi.getAll()
      .then(r => setUsers(r.data))
      .catch(() => setError('No se pudieron cargar los usuarios'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // ── Búsqueda ─────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchEmail.trim()) return
    setSearching(true)
    setSearchResults(null)
    try {
      const r = await usersApi.searchByEmail(searchEmail.trim())
      setSearchResults(r.data)
    } catch {
      setError('Error al buscar usuario')
    } finally { setSearching(false) }
  }

  const clearSearch = () => {
    setSearchEmail('')
    setSearchResults(null)
  }

  // ── Cambio de rol ─────────────────────────────────────────────
  const openRoleModal = (u) => { setRoleModal(u); setNewRole(u.role) }

  const handleSaveRole = async () => {
    setSavingRole(true)
    try {
      const updated = await usersApi.updateRole(roleModal.id, newRole)
      // Actualiza en lista principal y en resultados de búsqueda si aplica
      const patch = (list) => list.map(u => u.id === updated.data.id ? { ...u, role: updated.data.role } : u)
      setUsers(patch)
      if (searchResults) setSearchResults(patch)
      setRoleModal(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar rol')
    } finally { setSavingRole(false) }
  }

  // ── Toggle activo ─────────────────────────────────────────────
  const handleToggleActive = async () => {
    setToggling(true)
    try {
      const updated = await usersApi.toggleActive(confirmToggle.id)
      const patch = (list) => list.map(u => u.id === updated.data.id ? { ...u, is_active: updated.data.is_active } : u)
      setUsers(patch)
      if (searchResults) setSearchResults(patch)
      setConfirmToggle(null)
    } catch {
      setError('Error al cambiar estado del usuario')
    } finally { setToggling(false) }
  }

  // ── Filtrado local ────────────────────────────────────────────
  const filtered = users.filter(u => {
    const matchText  = !filterText  || u.full_name.toLowerCase().includes(filterText.toLowerCase()) || u.email.toLowerCase().includes(filterText.toLowerCase())
    const matchRole  = !filterRole  || u.role === filterRole
    const matchState = !filterState || (filterState === 'active' ? u.is_active : !u.is_active)
    return matchText && matchRole && matchState
  })

  const hasActiveFilters = filterText || filterRole || filterState

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Usuarios</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Gestión de roles y acceso al sistema</p>
        </div>
      </div>

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {/* ── Panel búsqueda por email ── */}
      <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Buscar usuario por correo</h3>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 14 }}>
          Útil para encontrar una cuenta específica y asignarle un rol.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            id="searchUserEmail"
            ref={searchRef}
            type="email"
            placeholder="764590@nur.edu.bo"
            value={searchEmail}
            onChange={e => { setSearchEmail(e.target.value); if (!e.target.value) clearSearch() }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ maxWidth: 300, flex: '1 1 200px' }}
          />
          <button id="searchUserBtn" className="btn btn-primary btn-sm" onClick={handleSearch} disabled={searching || !searchEmail.trim()}>
            {searching ? 'Buscando…' : 'Buscar'}
          </button>
          {searchResults !== null && (
            <button className="btn btn-secondary btn-sm" onClick={clearSearch}>Limpiar</button>
          )}
        </div>

        {searchResults !== null && (
          <div style={{ marginTop: 16 }}>
            {searchResults.length === 0
              ? <p className="text-muted" style={{ fontSize: 13 }}>No se encontró ninguna cuenta con ese correo.</p>
              : <UserTable users={searchResults} onRole={openRoleModal} onToggle={setConfirmToggle} compact />
            }
          </div>
        )}
      </div>

      {/* ── Filtros de la tabla principal ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Filtrar por nombre o email…"
          value={filterText}
          onChange={e => setFilterText(e.target.value)}
          style={{ flex: '1 1 200px', maxWidth: 300 }}
        />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ minWidth: 160 }}>
          {ROLE_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterState} onChange={e => setFilterState(e.target.value)} style={{ minWidth: 140 }}>
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        {hasActiveFilters && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilterText(''); setFilterRole(''); setFilterState('') }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Tabla principal ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading
          ? <Loading />
          : <UserTable users={filtered} onRole={openRoleModal} onToggle={setConfirmToggle} />
        }
      </div>

      {/* ── Modal cambio de rol ── */}
      <Modal open={!!roleModal} onClose={() => setRoleModal(null)} title="Cambiar rol">
        {roleModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--text)' }}>
              Usuario: <strong>{roleModal.full_name}</strong><br />
              <span className="text-muted" style={{ fontSize: 13 }}>{roleModal.email}</span>
            </p>
            <div className="field">
              <label>Nuevo rol</label>
              <select id="roleSelect" value={newRole} onChange={e => setNewRole(e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="modal__footer">
              <button id="cancelRoleBtn" className="btn btn-secondary" onClick={() => setRoleModal(null)}>Cancelar</button>
              <button id="saveRoleBtn" className="btn btn-primary" onClick={handleSaveRole} disabled={savingRole || newRole === roleModal.role}>
                {savingRole ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Confirm toggle ── */}
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

// ── Componente tabla reutilizable ─────────────────────────────────
function UserTable({ users, onRole, onToggle, compact = false }) {
  if (users.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32, fontSize: 14 }}>
        No se encontraron usuarios
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            {!compact && <th>Email</th>}
            {compact && <th>Email</th>}
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--brand-bg)', color: 'var(--brand)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, flexShrink: 0
                  }}>
                    {u.full_name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 500, color: 'var(--text-h)' }}>{u.full_name}</span>
                </div>
              </td>
              <td className="text-muted" style={{ fontSize: 13 }}>{u.email}</td>
              <td>
                <span className={`badge badge--${u.role}`}>
                  {{ admin: 'Administrador', creator: 'Creador', respondent: 'Respondente' }[u.role]}
                </span>
              </td>
              <td>
                <span className={`badge badge--${u.is_active ? 'published' : 'closed'}`}>
                  {u.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button id={`roleBtn-${u.id}`} className="btn btn-secondary btn-sm" onClick={() => onRole(u)}>
                    Rol
                  </button>
                  <button
                    id={`toggleBtn-${u.id}`}
                    className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => onToggle(u)}
                  >
                    {u.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}