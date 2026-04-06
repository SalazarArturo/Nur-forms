import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { reportsApi, formsApi } from '../../api/services'
import { Loading, Alert, StatusBadge } from '../../components/ui'
import './Reports.css'

const COLORS = ['#1d4ed8', '#0284c7', '#059669', '#d97706', '#dc2626', '#9333ea', '#db2777', '#0891b2']

export default function ReportsPage() {
  const { formId } = useParams()
  const [form, setForm] = useState(null)
  const [summary, setSummary] = useState(null)
  const [byQuestion, setByQuestion] = useState([])
  const [individual, setIndividual] = useState([])
  const [matchingKey, setMatchingKey] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [formRes, summaryRes, byQRes, indRes, matchRes] = await Promise.all([
          formsApi.getById(formId),
          reportsApi.getSummary(formId),
          reportsApi.getByQuestion(formId),
          reportsApi.getIndividual(formId),
          reportsApi.getMatchingKey(formId),
        ])
        setForm(formRes.data)
        setSummary(summaryRes.data)
        setByQuestion(byQRes.data)
        setIndividual(indRes.data)
        setMatchingKey(matchRes.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar reportes')
      } finally { setLoading(false) }
    }
    load()
  }, [formId])

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const res = await reportsApi.exportCSV(formId)
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `reporte-${formId}.csv`; a.click()
      URL.revokeObjectURL(url)
    } catch {} finally { setExporting(false) }
  }

  if (loading) return <Loading full />
  if (error) return <div style={{ padding: 32 }}><Alert type="error">{error}</Alert></div>
  if (!form || !summary) return null

  const campaignId = form.campaign_id

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        <Link to="/campaigns" style={{ color: 'var(--text-muted)' }}>Campañas</Link>
        <span>/</span>
        <Link to={`/campaigns/${campaignId}`} style={{ color: 'var(--text-muted)' }}>{form.campaign?.name || 'Campaña'}</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>{form.title} — Reportes</span>
      </div>

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1>{form.title}</h1>
            <StatusBadge status={form.status} />
          </div>
          <p className="text-muted" style={{ marginTop: 4 }}>Panel de resultados y análisis</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV} disabled={exporting}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="reports-summary">
        <SummaryCard label="Total respuestas" value={summary.total_submissions} color="brand" />
        <SummaryCard label="Completadas" value={summary.completed_submissions} color="success" />
        <SummaryCard label="En borrador" value={summary.draft_submissions} color="warning" />
        <SummaryCard label="Tasa de finalización" value={`${summary.completion_rate}%`} color="info" />
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'overview' ? 'tab--active' : ''}`} onClick={() => setTab('overview')}>Resumen por pregunta</button>
        <button className={`tab ${tab === 'individual' ? 'tab--active' : ''}`} onClick={() => setTab('individual')}>Respuestas individuales</button>
        {matchingKey.length > 0 && (
          <button className={`tab ${tab === 'matching' ? 'tab--active' : ''}`} onClick={() => setTab('matching')}>Clave de relacionar</button>
        )}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="reports-questions">
          {byQuestion.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              No hay respuestas aún.
            </div>
          ) : byQuestion.map((q, i) => (
            <QuestionReport key={q.question_id} q={q} index={i + 1} />
          ))}
        </div>
      )}

      {/* Individual tab */}
      {tab === 'individual' && (
        <div className="card">
          {individual.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No hay respuestas completadas.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Respuestas</th>
                  </tr>
                </thead>
                <tbody>
                  {individual.map((sub, idx) => (
                    <IndividualRow key={sub.id} sub={sub} index={idx + 1} questions={byQuestion} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Matching key tab */}
      {tab === 'matching' && (
        <div className="reports-questions">
          {matchingKey.map(mk => (
            <div key={mk.question_id} className="card">
              <h3 style={{ fontSize: 15, marginBottom: 16 }}>{mk.question_text}</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Concepto</th><th>Respuesta correcta</th></tr></thead>
                  <tbody>
                    {(mk.pairs || []).map((pair, i) => (
                      <tr key={i}>
                        <td>{pair.concept}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 500 }}>{pair.answer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  )
}

function QuestionReport({ q, index }) {
  const hasChart = ['single_choice', 'multiple_choice', 'true_false'].includes(q.type)
  const chartData = hasChart
    ? (q.options || []).map(o => ({ name: o.text, count: o.count }))
    : []

  const usePie = chartData.length <= 5

  return (
    <div className="card report-q-card">
      <div className="report-q-card__header">
        <div>
          <span className="report-q-card__num">P{index}</span>
          <span className="report-q-card__title">{q.question_text}</span>
        </div>
        <span className="text-muted text-sm">{q.total_answers} respuesta{q.total_answers !== 1 ? 's' : ''}</span>
      </div>

      {hasChart && chartData.length > 0 && (
        <div className="report-q-card__charts">
          <div className="report-chart">
            <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Distribución</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Respuestas" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {usePie && (
            <div className="report-chart">
              <p className="text-sm text-muted" style={{ marginBottom: 8 }}>Proporción</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Option breakdown table */}
      {hasChart && chartData.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table>
            <thead><tr><th>Opción</th><th>Respuestas</th><th>%</th></tr></thead>
            <tbody>
              {chartData.map((row, i) => (
                <tr key={i}>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                  <td>{q.total_answers > 0 ? `${Math.round((row.count / q.total_answers) * 100)}%` : '0%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Text responses */}
      {q.type === 'short_text' || q.type === 'long_text' ? (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(q.responses || []).slice(0, 10).map((r, i) => (
            <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', fontSize: 13 }}>
              {r}
            </div>
          ))}
          {(q.responses || []).length > 10 && (
            <p className="text-muted text-sm">…y {q.responses.length - 10} respuestas más</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

function IndividualRow({ sub, index, questions }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <td>{index}</td>
        <td>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('es-BO') : '—'}</td>
        <td>
          <button className="btn btn-ghost btn-sm">{expanded ? '▲ Ocultar' : '▼ Ver'}</button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={3} style={{ background: 'var(--bg-subtle)', padding: 0 }}>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(sub.answers || []).map(ans => (
                <div key={ans.id} style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>{ans.question?.text}: </span>
                  <span style={{ color: 'var(--text)' }}>
                    {ans.text_value || (ans.boolean_value !== null ? (ans.boolean_value ? 'Verdadero' : 'Falso') : null)
                      || (ans.selected_option_ids?.join(', '))
                      || (ans.matching_pairs?.map(p => `${p.concept} → ${p.answer}`).join(', '))
                      || '—'}
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
