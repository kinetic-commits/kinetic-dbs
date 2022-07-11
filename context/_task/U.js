const {
  ND_URL,
  NM_URL,
  CS_URL,
  CREATE_URL,
  LOGIN_URL,
  NM,
  ND,
  CS,
  ISSUES,
} = require('../../helpers/Types')
const Form74 = require('../../model/CustomerData')
const IssueLoggerSchema = require('../../model/IssueLogger')
const Metering = require('../../model/Meter_Data')
const User = require('../../model/UserData')
const { isArray } = require('../essentials/usables')
const { ndpp, mmpp } = require('../events/calls/u_tpp')
const Aggregation_Functional_Component = require('./aggregation_tasks/aggregation_func')
const { create_alert_msg } = require('./alert_msg')
const { body_recognition } = require('./bodyApplicationParser')
const { TryAndCatch, TryAndCatchUpdates } = require('./_task_tools')

const PUT = async (req) => {
  const message = {
    error: 'Access denied',
    success: false,
    data: undefined,
    code: 500,
  }

  const { QUERIES, baseUrl: url, body } = req
  const { role, abbrv, name, queries, hasId, search } = QUERIES
  const parse_queries = body_recognition({ ...queries, abbrv, role })

  const aggregations = [
    'METER-INSTALLATION',
    'VERIFY-PROPERTY',
    'FAULT',
    'REPLACEMENT',
    'FAULT-ACKNOWLEDGE',
  ]

  if (aggregations.includes(search))
    return Aggregation_Functional_Component({ req, message })

  if (url === CREATE_URL) {
    const parsed = { ...parse_queries, [name || 'email']: hasId }
    return TryAndCatchUpdates(User, body, message, 'email', parsed)
  } else if (url === NM_URL && role === NM()) return mmpp(req, message)
  else if (url === ND_URL && role === ND()) return ndpp(req, message)
  else if (url === CS_URL && (role === CS() || role === ND())) {
    const parsed = { ...parse_queries, [name || '_id']: hasId }
    return TryAndCatchUpdates(Form74, body, message, '_id', parsed)
  } else if (url === ISSUES) {
    const parsed = { ...parse_queries, [name || '_id']: hasId }
    return TryAndCatchUpdates(IssueLoggerSchema, body, message, '_id', parsed)
  }

  return message
}

module.exports = PUT
