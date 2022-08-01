const { Client } = require('pg')
const fs = require('fs')
const { create_alert_msg } = require('../context/_task/alert_msg')
const { bodyAppParser } = require('../context/_task/bodyApplicationParser')
const { NM_URL, NM, ND, ND_URL, CS_URL, CS } = require('../helpers/Types')
const Form74 = require('../model/CustomerData')
const Metering = require('../model/Meter_Data')
const { dateAndTime } = require('../utils/dateTime')
const { CreateReusables, isArray } = require('./tool')
const POST = require('../context/_task/C')

function BulkLoader(req) {
  const message = {
    error: 'Access denied',
    success: false,
    data: undefined,
    code: 500,
  }
  const { method, QUERIES, baseUrl: url, user, bulk_path, main } = req || {}
  // const connections = {
  //   connectionString: process.env.DATABASE_URL,
  //   ssl: {
  //     rejectUnauthorized: false,
  //     ca: process.env.CA,
  //   },
  // }

  this.req = req
  this.tool = {
    method,
    q: QUERIES,
    url,
    user,
    string: bulk_path,
    main,
    message,
    // connections,
  }
}

BulkLoader.prototype.readInChunk = function () {
  const { string } = this.tool
  const req = this.req
  const head = []
  fs.createReadStream(string, { encoding: 'utf-8' })
    .on('data', async (chunk) => {
      const sv = csv(chunk, head.length > 0 && head[0])
      head.length === 0 && head.push(sv.header)
      if (head.length > 0) {
        req.body = sv.data
        const bdy = bodyAppParser(req)
        await this.create(bdy)
      }
    })
    .on('end', () => console.log('Reading complete'))
}

BulkLoader.prototype.create = async function (data) {
  console.log(data.length)
  this.req.main = data
  this.req.baseUrl = this.tool.url
  const rs = await POST(this.req)
  // console.log(rs)
  // if (main && false) {
  //   if (url === NM_URL && user.role === NM()) return await this.add_nm()
  //   else if (url === ND_URL && user.role === ND()) return await this.disco()
  //   else if (url === CS_URL && (user.role === CS() || user.role === ND()))
  //     return await this.add_cs()
  //   else return message
  // } else return this.createMsg(400, 'Valid data object is required')
}

BulkLoader.prototype.disco = async function () {
  const { q, main, user, message, connections } = this.tool
  const pool = new Client(connections)
  const client = pool.connect()

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

    const pool = client.connect()
    const find = await pool.query(que)
    if (find.rows.length > 0) {
      const rr = find.rows[0]
      const rs = await pool.query(
        `update meter_activities 
        set disco_acknowledgement=true, disco_acknowledgement_by='${
          q.abbrv
        }', acknowledged_date='${dateAndTime().currentDate}' 
        where meter_id='${rr.meter_number}'`
      )
      if (rs.command === 'UPDATE') {
        response.push(`${mt.meter_number} moved to store successfully...`)
      }
      client.end()
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
  const { main, q, user, message, connections } = this.tool
  const pool = new Client(connections)
  const client = pool.connect()
  const response = []
  try {
    const rs = await Metering.registeredTables(main)
    if (rs.length > 0) {
      for (var i = 0; i < rs.length; i++) {
        const pool = client.connect()
        const v = rs[i]
        const { rs_, msg } = await CreateReusables(v.table, v.schema, pool)
        if (rs_ > 0) {
          response.push({ success: true, msg })
        } else response.push({ success: false, msg })
        client.end()
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
  const { main, q, user, message, connections } = this.tool
  const pool = new Client(connections)
  const client = pool.connect()
  const response = []
  try {
    const rs = await Form74.registeredTables(main)
    const pool = client.connect()
    if (rs.length > 0) {
      for (var i = 0; i < rs.length; i++) {
        const v = rs[i]
        const { rs: rs_, msg } = await CreateReusables(v.table, v.schema, pool)

        if (rs_ > 0) {
          response.push({ success: true, msg })
        } else response.push({ success: false, msg })
        client.end()
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
  const { message } = this.tool
  message.code = code || message.code
  message.error = error || message.error
  message.success = error ? false : true
  message.data = data || message.data

  return message
}

function csv(path, head) {
  const data = path.toString().replace(/\r\n/g, '\n').split('\n')

  const header = head ? head : data[0].split(',')

  const values = []
  const finalResult = []

  for (let i = 1; i <= data.length - 1; i++) {
    const escape = ('' + data[i]).replace(/"/g, '\\"')
    data[i].length !== undefined ? values.push(escape.split(',')) : ''
  }

  for (const row of values) {
    const vl = {}
    header.map((e, index) => {
      if (header.length === row.length) {
        return (vl[e] = row[index])
      }
    })

    const keyUp = Object.keys(vl)
    if (keyUp.length !== 0) finalResult.push(vl)
  }

  return { data: finalResult, header }
}

module.exports = BulkLoader
