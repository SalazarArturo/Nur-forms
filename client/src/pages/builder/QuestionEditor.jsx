import { useState, useEffect } from 'react'

export default function QuestionEditor({ question, onSave, saving }) {
  const [q, setQ] = useState({ ...question })

  useEffect(() => { setQ({ ...question }) }, [question.id])

  const update = (field, value) => setQ(prev => ({ ...prev, [field]: value }))

  const handleOptionChange = (idx, field, value) => {
    const opts = [...(q.options || [])]
    opts[idx] = { ...opts[idx], [field]: value }
    setQ(prev => ({ ...prev, options: opts }))
  }

  const addOption = () => {
    setQ(prev => ({
      ...prev,
      options: [...(prev.options || []), { text: '', is_correct: false, position: (prev.options?.length || 0) }]
    }))
  }

  const removeOption = (idx) => {
    const opts = (q.options || []).filter((_, i) => i !== idx)
    setQ(prev => ({ ...prev, options: opts }))
  }

  const handlePairChange = (idx, field, value) => {
    const pairs = [...(q.config?.pairs || [])]
    pairs[idx] = { ...pairs[idx], [field]: value }
    setQ(prev => ({ ...prev, config: { ...prev.config, pairs } }))
  }

  const addPair = () => {
    const pairs = [...(q.config?.pairs || []), { concept: '', answer: '' }]
    setQ(prev => ({ ...prev, config: { ...prev.config, pairs } }))
  }

  const removePair = (idx) => {
    const pairs = (q.config?.pairs || []).filter((_, i) => i !== idx)
    setQ(prev => ({ ...prev, config: { ...prev.config, pairs } }))
  }

  const handleSave = () => onSave(q)

  const hasOptions = ['single_choice', 'multiple_choice', 'true_false', 'matching'].includes(q.type)

  return (
    <div className="q-editor">
      <div className="q-editor__header">
        <span className="q-editor__type-badge">{getTypeLabel(q.type)}</span>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? <span className="spinner" style={{ width: 12, height: 12 }} /> : null}
          Guardar
        </button>
      </div>

      <div className="q-editor__body">
        {/* Question text */}
        <div className="field">
          <label>Texto de la pregunta</label>
          <textarea
            value={q.text || ''}
            onChange={e => update('text', e.target.value)}
            placeholder="Escribe la pregunta aquí..."
            rows={2}
          />
        </div>

        {/* Help text */}
        <div className="field">
          <label>Texto de ayuda <span className="text-muted">(opcional)</span></label>
          <input
            type="text"
            value={q.help_text || ''}
            onChange={e => update('help_text', e.target.value)}
            placeholder="Indicación o aclaración para el respondente"
          />
        </div>

        {/* Required + shuffle */}
        <div style={{ display: 'flex', gap: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            <input type="checkbox" checked={!!q.is_required} onChange={e => update('is_required', e.target.checked)} />
            Obligatoria
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
            <input type="checkbox" checked={q.config?.shuffle_options || false} onChange={e => setQ(p => ({ ...p, config: { ...p.config, shuffle_options: e.target.checked } }))} />
            Barajar opciones
          </label>
        </div>

        {/* Options editor */}
        {q.type !== 'matching' && hasOptions && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)' }}>Opciones</label>
              {q.type !== 'true_false' && (
                <button className="btn btn-secondary btn-sm" onClick={addOption}>+ Opción</button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(q.options || []).map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type={q.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                    checked={!!opt.is_correct}
                    onChange={e => handleOptionChange(idx, 'is_correct', e.target.checked)}
                    title="Marcar como correcta"
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => handleOptionChange(idx, 'text', e.target.value)}
                    placeholder={`Opción ${idx + 1}`}
                    style={{ flex: 1 }}
                    disabled={q.type === 'true_false'}
                  />
                  {q.type !== 'true_false' && (
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeOption(idx)} disabled={q.options?.length <= 2}>
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {q.type === 'multiple_choice' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Mínimo de selecciones</label>
                  <input type="number" min={0} value={q.config?.min_selections || ''} onChange={e => setQ(p => ({ ...p, config: { ...p.config, min_selections: +e.target.value } }))} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Máximo de selecciones</label>
                  <input type="number" min={0} value={q.config?.max_selections || ''} onChange={e => setQ(p => ({ ...p, config: { ...p.config, max_selections: +e.target.value } }))} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Matching pairs */}
        {q.type === 'matching' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-h)' }}>Pares concepto ↔ respuesta</label>
              <button className="btn btn-secondary btn-sm" onClick={addPair}>+ Par</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Concepto</span>
              <span />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Respuesta</span>
              <span />
              {(q.config?.pairs || []).map((pair, idx) => (
                <>
                  <input key={`c${idx}`} type="text" value={pair.concept} onChange={e => handlePairChange(idx, 'concept', e.target.value)} placeholder={`Concepto ${idx + 1}`} />
                  <span key={`arr${idx}`} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>↔</span>
                  <input key={`a${idx}`} type="text" value={pair.answer} onChange={e => handlePairChange(idx, 'answer', e.target.value)} placeholder={`Respuesta ${idx + 1}`} />
                  <button key={`del${idx}`} className="btn btn-ghost btn-icon btn-sm" onClick={() => removePair(idx)} disabled={(q.config?.pairs?.length || 0) <= 1}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </>
              ))}
            </div>
          </div>
        )}

        {/* Text config */}
        {(q.type === 'short_text' || q.type === 'long_text') && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Placeholder</label>
              <input type="text" value={q.config?.placeholder || ''} onChange={e => setQ(p => ({ ...p, config: { ...p.config, placeholder: e.target.value } }))} />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Máximo de caracteres</label>
              <input type="number" min={0} value={q.config?.max_chars || ''} onChange={e => setQ(p => ({ ...p, config: { ...p.config, max_chars: +e.target.value } }))} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getTypeLabel(type) {
  const labels = {
    single_choice: '🔘 Selección única',
    multiple_choice: '☑️ Selección múltiple',
    true_false: '✅ Verdadero / Falso',
    matching: '🔗 Relacionar',
    short_text: '📝 Texto corto',
    long_text: '📄 Texto largo',
  }
  return labels[type] || type
}
