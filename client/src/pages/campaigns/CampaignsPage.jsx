import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { campaignsApi } from '../../api/services'
import { Modal, Confirm, StatusBadge, EmptyState, Loading, Alert } from '../../components/ui'
import './Campaigns.css'

const EMPTY_FORM = { name: '', description: '', starts_at: '', ends_at: '', status: 'draft' }

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    campaignsApi.getAll()
      .then(r => setCampaigns(r.data.campaigns || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setModalOpen(true) }
  const openEdit = (c, e) => {
    e.stopPropagation()
    setEditing(c)
    setForm({
      name: c.name, description: c.description || '',
      starts_at: c.starts_at ? c.starts_at.slice(0, 10) : '',
      ends_at: c.ends_at ? c.ends_at.slice(0, 10) : '',
      status: c.status
    })
    setError('')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    setSaving(true); setError('')
    try {
      if (editing) {
        await campaignsApi.update(editing.id, form)
      } else {
        await campaignsApi.create(form)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDuplicate = async (c, e) => {
    e.stopPropagation()
    try {
      await campaignsApi.duplicate(c.id)
      load()
    } catch {}
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await campaignsApi.remove(confirmDelete.id)
      setConfirmDelete(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar')
    } finally { setDeleting(false) }
  }

  const STATUS_OPTS = [
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activo' },
    { value: 'closed', label: 'Cerrado' },
    { value: 'archived', label: 'Archivado' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Campañas</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Organiza tus encuestas por proyectos y campañas</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            Nueva campaña
          </button>
        </div>
      </div>

      {loading ? <Loading /> : campaigns.length === 0 ? (
        <EmptyState
          title="Sin campañas"
          description="Crea tu primera campaña para comenzar a organizar tus formularios."
          action={<button className="btn btn-primary" onClick={openCreate}>Crear campaña</button>}
        />
      ) : (
        <div className="campaigns-grid">
          {campaigns.map(c => (
            <div key={c.id} className="campaign-card" onClick={() => navigate(`/campaigns/${c.id}`)}>
              <div className="campaign-card__header">
                <h3>{c.name}</h3>
                <StatusBadge status={c.status} />
              </div>

              {c.description && (
                <p className="campaign-card__desc text-muted text-sm">{c.description}</p>
              )}

              <div className="campaign-card__meta">
                {c.starts_at && (
                  <span className="text-sm text-muted">
                    Inicio: {new Date(c.starts_at).toLocaleDateString('es-BO')}
                  </span>
                )}
                {c.ends_at && (
                  <span className="text-sm text-muted">
                    Fin: {new Date(c.ends_at).toLocaleDateString('es-BO')}
                  </span>
                )}
              </div>

              <div className="campaign-card__footer">
                <span className="text-sm text-muted">
                  Creado por {c.creator?.full_name || '—'}
                </span>
                <div className="campaign-card__actions" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-icon btn-sm" title="Duplicar" onClick={e => handleDuplicate(c, e)}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" title="Editar" onClick={e => openEdit(c, e)}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" title="Eliminar" onClick={e => { e.stopPropagation(); setConfirmDelete(c) }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar campaña' : 'Nueva campaña'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <Alert type="error">{error}</Alert>}
          <div className="field">
            <label>Nombre *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Satisfacción Docente 2025-1" required />
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descripción opcional de la campaña" rows={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Fecha de inicio</label>
              <input type="date" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} />
            </div>
            <div className="field">
              <label>Fecha de fin</label>
              <input type="date" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} />
            </div>
          </div>
          {editing && (
            <div className="field">
              <label>Estado</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          <div className="modal__footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {editing ? 'Guardar cambios' : 'Crear campaña'}
            </button>
          </div>
        </form>
      </Modal>

      <Confirm
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        danger
        title="Eliminar campaña"
        message={`¿Eliminar "${confirmDelete?.name}"? Se eliminarán todos sus formularios.`}
      />
    </div>
  )
}
