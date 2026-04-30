import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formsApi, questionsApi } from '../../api/services'
import { Loading, Alert } from '../../components/ui'
import QuestionEditor from './QuestionEditor'
import './FormBuilder.css'

const QUESTION_TYPES = [
  { value: 'single_choice', label: 'Selección única', icon: '◯' },
  { value: 'multiple_choice', label: 'Selección múltiple', icon: '☐' },
  { value: 'true_false', label: 'Verdadero / Falso', icon: '✓' },
  { value: 'matching', label: 'Relacionar conceptos', icon: '↔' },
  { value: 'short_text', label: 'Texto corto', icon: '⎯' },
  { value: 'long_text', label: 'Texto largo', icon: '≡' },
]

function SortableQuestion({ question, selected, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const typeInfo = QUESTION_TYPES.find(t => t.value === question.type)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`qlist-item${selected ? ' qlist-item--active' : ''}`}
      onClick={onSelect}
    >
      <span className="qlist-item__drag" {...attributes} {...listeners}>
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01"/>
        </svg>
      </span>
      <span className="qlist-item__icon">{typeInfo?.icon}</span>
      <span className="qlist-item__text">{question.text || <em style={{ color: 'var(--text-muted)' }}>Sin texto</em>}</span>
      {question.is_required && <span style={{ color: 'var(--danger)', fontSize: 12, marginLeft: 'auto' }}>*</span>}
      <button
        className="btn btn-ghost btn-icon btn-sm qlist-item__del"
        onClick={e => { e.stopPropagation(); onDelete() }}
        title="Eliminar"
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}

export default function FormBuilderPage() {
  const { campaignId, formId } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await formsApi.getById(formId)
      setForm(res.data)
      setQuestions(res.data.questions || [])
    } catch { navigate(`/campaigns/${campaignId}`) }
    finally { setLoading(false) }
  }, [formId, campaignId, navigate])

  useEffect(() => { load() }, [load])

  const handleAddQuestion = async (type) => {
    const defaults = {
      single_choice: { text: '', options: [{ text: 'Opción A', is_correct: true }, { text: 'Opción B', is_correct: false }] },
      multiple_choice: { text: '', options: [{ text: 'Opción A', is_correct: false }, { text: 'Opción B', is_correct: false }] },
      true_false: { text: '', options: [{ text: 'Verdadero', is_correct: true }, { text: 'Falso', is_correct: false }] },
      matching: { text: '', config: { pairs: [{ concept: '', answer: '' }] } },
      short_text: { text: '', config: {} },
      long_text: { text: '', config: {} },
    }
    try {
      const res = await questionsApi.create(formId, { type, is_required: false, ...defaults[type] })
      const q = res.data
      setQuestions(prev => [...prev, q])
      setSelected(q.id)
    } catch {}
  }

  const handleUpdateQuestion = async (q) => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await questionsApi.update(q.id, q)
      setQuestions(prev => prev.map(x => x.id === q.id ? res.data : x))
      setSuccess('Guardado')
      setTimeout(() => setSuccess(''), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  const handleDeleteQuestion = async (id) => {
    try {
      await questionsApi.remove(id)
      setQuestions(prev => prev.filter(q => q.id !== id))
      if (selected === id) setSelected(null)
    } catch {}
  }

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIndex = questions.findIndex(q => q.id === active.id)
    const newIndex = questions.findIndex(q => q.id === over.id)
    const reordered = arrayMove(questions, oldIndex, newIndex)
    setQuestions(reordered)
    await questionsApi.reorder(formId, reordered.map(q => q.id))
  }

  const selectedQuestion = questions.find(q => q.id === selected)

  if (loading) return <Loading full />
  if (!form) return null

  return (
    <div className="builder">
      {/* Header */}
      <div className="builder__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to={`/campaigns/${campaignId}`} className="btn btn-ghost btn-sm">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </Link>
          <div>
            <h2 style={{ fontSize: 16 }}>{form.title}</h2>
            <p className="text-muted text-sm">{questions.length} pregunta{questions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {success && <span style={{ color: 'var(--success)', fontSize: 13 }}>✓ {success}</span>}
          <button className="btn btn-secondary btn-sm" onClick={() => setPreview(p => !p)}>
            {preview ? 'Editor' : 'Vista previa'}
          </button>
          {form.status === 'draft' && (
            <button className="btn btn-primary btn-sm" onClick={async () => {
              await formsApi.publish(formId)
              navigate(`/campaigns/${campaignId}`)
            }}>
              Publicar
            </button>
          )}
        </div>
      </div>

      {error && <div style={{ padding: '0 16px' }}><Alert type="error">{error}</Alert></div>}

      <div className="builder__body">
        {/* Left: question list */}
        <div className="builder__sidebar">
          <div className="builder__sidebar-header">
            <span className="text-sm" style={{ fontWeight: 600, color: 'var(--text-h)' }}>Preguntas</span>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
              {questions.map(q => (
                <SortableQuestion
                  key={q.id}
                  question={q}
                  selected={selected === q.id}
                  onSelect={() => setSelected(q.id)}
                  onDelete={() => handleDeleteQuestion(q.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {questions.length === 0 && (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Agrega una pregunta para comenzar
            </div>
          )}

          {/* Add question */}
          <div className="builder__add-section">
            <p className="text-sm" style={{ fontWeight: 600, color: 'var(--text-h)', marginBottom: 8 }}>Agregar pregunta</p>
            <div className="builder__types-grid">
              {QUESTION_TYPES.map(t => (
                <button key={t.value} className="builder__type-btn" onClick={() => handleAddQuestion(t.value)}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: question editor or preview */}
        <div className="builder__editor">
          {preview ? (
            <FormPreview form={form} questions={questions} />
          ) : selectedQuestion ? (
            <QuestionEditor
              key={selectedQuestion.id}
              question={selectedQuestion}
              onSave={handleUpdateQuestion}
              saving={saving}
            />
          ) : (
            <div className="builder__placeholder">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              <p>Selecciona una pregunta para editarla<br />o agrega una nueva</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FormPreview({ form, questions }) {
  return (
    <div className="preview-wrap">
      <div className="preview-form" style={{ '--primary': form.primary_color }}>
        <div className="preview-form__header">
          <h2>{form.title}</h2>
          {form.description && <p>{form.description}</p>}
          {form.welcome_message && <div className="preview-form__welcome">{form.welcome_message}</div>}
        </div>
        {questions.map((q, i) => (
          <div key={q.id} className="preview-question">
            <div className="preview-question__label">
              <span>{i + 1}. {q.text || <em>Sin texto</em>}</span>
              {q.is_required && <span style={{ color: 'var(--danger)' }}>*</span>}
            </div>
            {q.help_text && <p className="text-sm text-muted">{q.help_text}</p>}
            {(q.type === 'single_choice' || q.type === 'true_false') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {q.options?.map(o => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="radio" name={q.id} disabled /> {o.text}
                  </label>
                ))}
              </div>
            )}
            {q.type === 'multiple_choice' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {q.options?.map(o => (
                  <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                    <input type="checkbox" disabled /> {o.text}
                  </label>
                ))}
              </div>
            )}
            {q.type === 'short_text' && <input type="text" disabled placeholder="Respuesta corta..." style={{ marginTop: 8 }} />}
            {q.type === 'long_text' && <textarea disabled placeholder="Respuesta larga..." rows={3} style={{ marginTop: 8 }} />}
            {q.type === 'matching' && (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.config?.pairs?.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <span style={{ flex: 1, padding: '6px 10px', background: 'var(--bg-subtle)', borderRadius: 6 }}>{p.concept || 'Concepto'}</span>
                    <span>↔</span>
                    <select disabled style={{ flex: 1 }}><option>Seleccionar respuesta...</option></select>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <button className="btn btn-primary w-full" style={{ marginTop: 16, background: form.primary_color, borderColor: form.primary_color }} disabled>
          Enviar respuestas
        </button>
      </div>
    </div>
  )
}
