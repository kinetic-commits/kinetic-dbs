const {
  ND_URL,
  NM_URL,
  CS_URL,
  CREATE_URL,
  NM,
  ND,
  CS,
  ISSUES,
  FIRSTCLASS,
} = require('../../helpers/Types')
const Form74 = require('../../model/CustomerData')
const IssueLoggerSchema = require('../../model/IssueLogger')
const User = require('../../model/UserData')
const { mmpgt, ndpgt } = require('../events/calls/g_tpp')
const Aggregation_Functional_Component = require('./aggregation_tasks/aggregation_func')
const { body_recognition } = require('./bodyApplicationParser')
const all_selection_queries = require('./selections/selection_returns')
const { TryAndCatch } = require('./_task_tools')

const GET = async (req) => {
  const message = {
    error: 'Access denied',
    success: false,
    data: undefined,
    code: 500,
  }

  const { QUERIES, baseUrl: url, user } = req
  const usr = user || {}
  const { role, abbrv, hasId, name, queries, search, limit } = QUERIES
  const aggregations = [
    'STORE',
    'ITEMS',
    'CBS',
    'DISK-MAP',
    'DISK',
    'FROM-INSTALLER',
    'VIEW',
    'DISK-MAP-WEB',
    'DISK-WEB',
  ]

  const parse_queries = body_recognition({ ...queries, abbrv, role, limit })

  if (aggregations.includes(search))
    return await Aggregation_Functional_Component({ req, message })
  if (search === 'selection') return await all_selection_queries(req, message)

  if (parse_queries.mean > parse_queries.limit) {
    if (parse_queries.limit >= parse_queries.mean) {
      // Run a function that reads and deduct
    } else {
      if (url === CREATE_URL) {
        const que =
          role === 'ADMIN'
            ? { ...(search === 'DECODE' ? { abbrv, role } : { ...queries }) }
            : {
                ...([ND(), NM()].includes(role) && search === 'OWNED'
                  ? { parent_user: user.email }
                  : { abbrv, role }),
                limit,
                ...queries,
              }

        const qy =
          role === 'ADMIN'
            ? Object.keys(que).length === 0
              ? `where email <> 'undefined'`
              : que
            : que

        if (hasId) {
          const data = {
            [name || 'email']: search === 'DECODE' ? usr.email : hasId,
            ...que,
          }
          const files = [ND(), NM(), ...FIRSTCLASS()].includes(role)
            ? await User.find(
                role === NM() ? { abbrv } : `where role in ('MAP', 'DISCO')`
              )
            : []

          const fl =
            files.length > 0
              ? files.filter((d) => d.role === 'MAP').map((d) => d && d.abbrv)
              : []
          const ds =
            files.length > 0
              ? files.filter((d) => d.role === 'DISCO').map((d) => d && d.abbrv)
              : []

          const user = await TryAndCatch(User, data, message, 'findOne')
          const daa = { ...user, data: { ...user.data, map: fl, disco: ds } }

          return daa
        } else {
          const user = await TryAndCatch(User, qy, message, 'find')
          return search === 'DECODE' ? { ...user, data: user.data[0] } : user
        }
      } else if (url === NM_URL && role === NM()) return mmpgt(req, message)
      else if (url === ND_URL && (role === ND() || FIRSTCLASS().includes(role)))
        return ndpgt(req, message)
      else if (url === CS_URL && (role === CS() || role === ND())) {
        if (hasId) {
          const data = {
            [name || '_id']: hasId,
            ...queries,
            disco: abbrv,
          }
          const user = await TryAndCatch(Form74, data, message, 'findOne')
          return user
        } else {
          const user = await TryAndCatch(
            Form74,
            { ...queries, disco: abbrv },
            message,
            'find'
          )
          return user
        }
      } else if (url === ISSUES) {
        if (hasId) {
          const data = {
            [name || 'logger_id']: hasId,
            ...queries,
            receiver: abbrv,
          }
          const user = await TryAndCatch(
            IssueLoggerSchema,
            data,
            message,
            'findOne'
          )
          return user
        } else {
          const dd =
            search === 'RECEIVER'
              ? `where sender <>'${abbrv}' and receiver='${abbrv}'`
              : queries
          const user = await TryAndCatch(IssueLoggerSchema, dd, message, 'find')
          return user
        }
      }
    }

    return message
  } else {
    message.error = `Request is above max of ${parse_queries.max}`
    return message
  }
}

module.exports = GET
