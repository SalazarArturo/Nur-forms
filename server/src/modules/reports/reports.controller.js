const reportsService = require('./reports.service')

const getSummary = async (req, res) => {
  try {
    const summary = await reportsService.getSummary(req.params.formId, req.user.id, req.user.role)
    res.status(200).json(summary)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getByQuestion = async (req, res) => {
  try {
    const stats = await reportsService.getByQuestion(req.params.formId, req.user.id, req.user.role)
    res.status(200).json(stats)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getIndividual = async (req, res) => {
  try {
    const submissions = await reportsService.getIndividual(req.params.formId, req.user.id, req.user.role)
    res.status(200).json(submissions)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const exportCSV = async (req, res) => {
  try {
    const csv = await reportsService.exportCSV(req.params.formId, req.user.id, req.user.role)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="resultados-${req.params.formId}.csv"`)
    res.status(200).send('\uFEFF' + csv)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getMatchingKey = async (req, res) => {
  try {
    const key = await reportsService.getMatchingKey(req.params.formId, req.user.id, req.user.role)
    res.status(200).json(key)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = { getSummary, getByQuestion, getIndividual, exportCSV, getMatchingKey }
