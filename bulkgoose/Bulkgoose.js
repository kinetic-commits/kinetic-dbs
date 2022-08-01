const { Client } = require('pg')
const { create_alert_msg } = require('../context/_task/alert_msg')
const { bodyAppParser } = require('../context/_task/bodyApplicationParser')
const { NM_URL, NM, ND, ND_URL, CS_URL, CS } = require('../helpers/Types')
const Form74 = require('../model/CustomerData')
const Metering = require('../model/Meter_Data')
const { dateAndTime } = require('../utils/dateTime')
const { CreateReusables, isArray } = require('./tool')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.CA,
  },
})

function BulkLoader(req, message) {
  // const message = {
  //   error: 'Access denied',
  //   success: false,
  //   data: undefined,
  //   code: 500,
  // }
  const body_parser = bodyAppParser(req)
  req.main = body_parser
  req.body = {}

  this.pool = client.connect()

  const {
    originalUrl: baseUrl,
    method,
    QUERIES,
    baseUrl: url,
    main,
    user,
  } = req || {}

  this.tools = { baseUrl, method, q: QUERIES, url, main, user, message }
}

BulkLoader.prototype.create = async function () {
  const { main, url, user } = this.tools
  if (main) {
    if (url === NM_URL && user.role === NM()) return await this.add_nm()
    else if (url === ND_URL && user.role === ND()) return await this.disco()
    else if (url === CS_URL && (user.role === CS() || user.role === ND()))
      return await this.add_cs()
    else return message
  } else return this.createMsg(400, 'Valid data object is required')
}

BulkLoader.prototype.disco = async function () {
  const { q, main, user, message } = this.tools
  let response = []
  const info = isArray(main) ? main : [main]
  for (let i = 0; i < info.length; i++) {
    const mt = info[i]
    const que = Metering.search({
      map_allocation_to: q.abbrv,
      meter_number: mt.meter_number,
      disco_acknowledgement: false,
      carton_id: mt.carton_id,
      phase: mt.phase,
    })

    const find = await this.pool.query(que)
    if (find.rows.length > 0) {
      const rr = find.rows[0]
      const rs = await this.pool.query(
        `update meter_activities 
        set disco_acknowledgement=true, disco_acknowledgement_by='${
          q.abbrv
        }', acknowledged_date='${dateAndTime().currentDate}' 
        where meter_id='${rr.meter_number}'`
      )
      if (rs.command === 'UPDATE') {
        response.push(`${mt.meter_number} moved to store successfully...`)
      }
    }
  }
  const rsf =
    response.length > 0
      ? `${response.length} saved to store successfully...`
      : 'Error: Perharp the meters were not allocated to you'

  this.createMsg(
    response.length > 0 && 200,
    rsf.startsWith('Error: Perharp') && rsf,
    !rsf.startsWith('Error: Perharp') && rsf
  )

  if (message.success) {
    await create_alert_msg({
      sender: q.abbrv,
      receiver: q.abbrv,
      logger_type: 'Meter Uploaded to Virtual Store',
      message: `Metering upload of ${
        isArray(main) ? main.length : 1
      } was successful`,
      email: user.email,
    })
  }

  await this.pool.end()
  return message
}

BulkLoader.prototype.add_nm = async function () {
  const { main, q, user, message } = this.tools
  const response = []
  try {
    const rs = await Metering.registeredTables(main)
    if (rs.length > 0) {
      for (var i = 0; i < rs.length; i++) {
        const v = rs[i]
        const { rs_, msg } = await CreateReusables(v.table, v.schema, this.pool)
        if (rs_ > 0) {
          response.push({ success: true, msg })
        } else response.push({ success: false, msg })
      }
      const fail = response.filter((d) => d.success === false)
      message.data = fail < 1 && 'All document processed successfully...'
      message.success = fail < 1 ? true : false
      if (fail < 1) {
        await create_alert_msg({
          sender: q.abbrv,
          receiver: q.abbrv,
          logger_type: 'Meter Uploaded to Virtual Store',
          refID: isArray(main) ? main[0].store_id : main.store_id,
          message: `Metering upload of ${
            isArray(main) ? main.length : 1
          } was successful`,
          email: user.email,
        })
      }
    }
  } catch (error) {
    const pass = response.filter((d) => d.success === true)
    const fail = response.filter((d) => d.success === false)
    message.error =
      fail > 0 && pass > 0
        ? `Some document failed with error: ${error.message}`
        : error.message
  }

  await this.pool.end()
  return message
}

BulkLoader.prototype.add_cs = async function () {
  const { main, q, user, message } = this.tools
  const response = []
  try {
    const rs = await Form74.registeredTables(main)
    if (rs.length > 0) {
      for (var i = 0; i < rs.length; i++) {
        const v = rs[i]
        const { rs: rs_, msg } = await CreateReusables(
          v.table,
          v.schema,
          this.pool
        )

        if (rs_ > 0) {
          response.push({ success: true, msg })
        } else response.push({ success: false, msg })
      }
      const fail = response.filter((d) => d.success === false)
      message.data = fail < 1 && 'All document processed successfully...'
      message.success = fail < 1 ? true : false
      if (fail < 1) {
        await create_alert_msg({
          sender: q.abbrv,
          receiver: q.abbrv,
          logger_type: 'Customer Record Upload',
          refID: isArray(main) ? main[0].store_id : main.store_id,
          message: `Customer record upload of ${
            isArray(main) ? main.length : 1
          } was successful`,
          email: user.email,
        })
      }
    }
  } catch (error) {
    const pass = response.filter((d) => d.success === true)
    const fail = response.filter((d) => d.success === false)
    message.error =
      fail > 0 && pass > 0
        ? `Some document failed with error: ${error.message}`
        : error.message
  }

  await this.pool.end()
  return message
}

BulkLoader.prototype.createMsg = function (code, error, data) {
  const { message } = this.tools
  message.code = code || message.code
  message.error = error || message.error
  message.success = error ? false : true
  message.data = data || message.data

  return message
}

module.exports = BulkLoader
