import { useEffect } from 'react'

// Modal
export function Modal({ open, onClose, title, children, size = '' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size ? `modal--${size}` : ''}`}>
        <div className="modal__header">
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Confirm dialog
export function Confirm({ open, onClose, onConfirm, title, message, danger = false, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Confirmar'}>
      <p style={{ color: 'var(--text)', fontSize: 14 }}>{message}</p>
      <div className="modal__footer">
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
        <button
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
          Confirmar
        </button>
      </div>
    </Modal>
  )
}

// Status badge
export function StatusBadge({ status }) {
  const labels = {
    draft: 'Borrador', published: 'Publicado', active: 'Activo',
    closed: 'Cerrado', archived: 'Archivado',
  }
  return <span className={`badge badge--${status}`}>{labels[status] || status}</span>
}

// Alert
export function Alert({ type = 'info', children }) {
  const icons = {
    error: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>,
    success: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>,
    info: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>,
    warning: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>,
  }
  return (
    <div className={`alert alert--${type}`}>
      {icons[type]}
      <span>{children}</span>
    </div>
  )
}

// Empty state
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon || (
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h6"/>
        </svg>
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

// Loading
export function Loading({ full = false }) {
  if (full) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner--lg" />
      </div>
    )
  }
  return <div className="loading-center"><div className="spinner" /></div>
}
