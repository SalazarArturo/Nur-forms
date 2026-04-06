const { Router } = require('express')
const { getSummary, getByQuestion, getIndividual, exportCSV, getMatchingKey } = require('./reports.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

const router = Router()

router.use(authenticate, authorize('admin', 'creator'))

router.get('/:formId/summary',       getSummary)
router.get('/:formId/by-question',   getByQuestion)
router.get('/:formId/individual',    getIndividual)
router.get('/:formId/export/csv',    exportCSV)
router.get('/:formId/matching-key',  getMatchingKey)

module.exports = router
