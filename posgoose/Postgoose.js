const { Pool, Client } = require('pg')
const { dateAndTime } = require('../utils/dateTime')

const {
  GetSchemaData,
  GetErrorAndPass,
  CreateReusables,
  KeyParser,
  isArray,
  isObject,
  unique_string,
  update_record_parser,
  KeyValuePairs,
  group_agg_parser,
} = require('./tool')

function Postgoose() {
  ;(this.schemaName = null),
    (this.schema = null),
    (this.requires = null),
    (this.virtual = []),
    (this.schemaEntries = null),
    (this.tableSchema = null),
    (this.all_entries = []),
    (this.data = null),
    (this.cb = null),
    (this.beforeSave = null),
    (this.global_now = [])
}

Postgoose.prototype.Schema = function (item) {
  const { schemaStructure, requires, entries, defaultValues } = KeyParser(item)
  this.schema = schemaStructure
  this.schemaEntries = entries
  this.requires = requires.length > 0 ? requires : null
  this.all_entries = [...entries]
  this.global_now.push(defaultValues)
}

Postgoose.prototype.createConnection = async () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 94,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0,
    ssl: {
      rejectUnauthorized: false,
      ca: process.env.CA,
    },
  })

  // const pool = new Pool({
  //   user: 'postgres',
  //   password: '2022',
  //   database: 'template1',
  //   host: 'localhost',
  //   port: 5432,
  // })
  return pool
}

Postgoose.prototype.model = async function (name) {
  this.schemaName = name
}

Postgoose.prototype.create = async function (record) {
  await this.isExist()
  const pool = this.pool

  if (!record || record.length < 1)
    throw new Error('Valid data object is required')
  // ADD default values
  const data = await this.createDefaults(record)
  this.data = data

  const { errors: err, passed: success } = GetErrorAndPass(data, this.requires)
  // Check and throws error if occured;
  unique_string(err)

  const { rs: response } = GetSchemaData(success, this.schemaEntries)
  const { rs: created, msg } = await CreateReusables(
    response,
    this.schemaName,
    pool
  )

  // Create Child Tables;
  if (this.virtual.length > 0) {
    for (let i = 0; i < this.virtual.length; i++) {
      const v = this.virtual[i]
      const { rs: extract } = GetSchemaData(success, v.table_entries)
      const rs = await CreateReusables(extract, v.table, this.pool)
    }
  }

  const { rs: overall } = GetSchemaData(success, this.all_entries)
  return {
    msg: created === 1 ? 'SUCCESS - One (1) document was inserted' : msg,
    success: true,
    documentCount: created,
    documentEntries: created === 1 ? overall[0] : overall,
  }
}

Postgoose.prototype.join = function () {
  let tabl = ''
  this.virtual.forEach((d) => {
    const { ref, table, parentID } = d || {}
    tabl += `left join ${table} on ${this.schemaName}.${parentID} = ${table}.${ref} \n`
  })
  return tabl
}

Postgoose.prototype.search = function (where, select, strict) {
  let tabl = this.join()
  const where_at = where ? this.mapThrough(where) : ''
  if (!where_at) throw new Error(`Expected valid string but got: ${where_at}`)

  const que = `select ${select ? select : '*'} from ${
    this.schemaName
  } ${tabl} ${where || strict ? where_at : ''}`
  return que
}

Postgoose.prototype.find = async function (where, select, strict) {
  await this.isExist()
  const pool = this.pool
  const que = this.search(where, select, strict)

  const rs = await pool.query(que)
  const vr = this.virtual.length > 0 ? this.virtual[0].parentID : undefined
  const outgo = this.cb ? this.outGoings(rs.rows, this.cb, vr) : rs.rows

  return outgo
}

Postgoose.prototype.findOne = async function (where, select) {
  const rs = await this.find(where, select, true)
  this.data = rs
  return rs[0] || null
}

Postgoose.prototype.raw = async function ({ name, where, method, body }) {
  if (!name || !where) return {}
  !this.pool && (await this.isExist())
  if (method === 'UPDATE') {
    if (!body || !where) throw new Error('Please provide modification document')
    const rs = await this.pool.query(`update ${name} set ${body} ${where}`)
    return rs && `Document ${rs.command} successfully`
  } else {
    const que = `select * from ${name} ${where}`
    const rs = await this.pool(que)
    const vr = this.virtual.length > 0 ? this.virtual[0].parentID : undefined
    const outgo = this.cb ? this.outGoings(rs.rows, this.cb, vr) : rs.rows
    return outgo
  }
}

Postgoose.prototype.UpdateDocument = async function (ID, data) {
  await this.isExist()
  const pool = this.pool
  const ed = this.virtual.length ? this.virtual[0] : undefined
  if (!ID) throw new Error('Document ID is required')
  else if (!data) throw new Error('Please provide modification document')
  else if (!ed)
    throw new Error(
      "Document expects 'document_id' value for modification instead gets " + ID
    )

  let rs

  const main = update_record_parser(data, this.schemaEntries)

  if (main) {
    const { update } = KeyValuePairs(main)
    const rs0 = await pool.query(
      `update ${this.schemaName} set ${update} where ${ed.parentID} = '${ID}'`
    )
    rs = `Document ${rs0.command} with keyID ${ID}`
  }

  if (this.virtual.length > 0) {
    let rs0
    for (let i = 0; i < this.virtual.length; i++) {
      const { table, table_entries, ref } = this.virtual[i]
      const isAmong = update_record_parser(data, table_entries)
      if (isAmong) {
        const { update } = KeyValuePairs(isAmong)

        rs0 = await pool.query(
          `update ${table} set ${update} where ${ref} = '${ID}'`
        )
      }
    }

    rs = rs0 && `Document ${rs0.command} with keyID ${ID}`
  }

  return rs
}

Postgoose.prototype.getChildEntries = function (table) {
  if (!table) return (this.virtual = [])

  table.forEach((u) => {
    const { parentID, ref, table, item } = u || {}
    const { schemaStructure, entries, requires, defaultValues } =
      KeyParser(item)
    this.virtual.push({
      tableStructure: schemaStructure,
      table_entries: entries,
      parentID,
      ref,
      table,
    })
    if (requires.length > 0) {
      requires.forEach((g) => this.requires.push(g))
    }
    if (entries.length > 0) {
      entries.forEach((m) => this.all_entries.push(m))
    }
    if (isObject(defaultValues)) {
      this.global_now.push(defaultValues)
    }
  })
}

Postgoose.prototype.clearDB = async function () {
  const pool = this.pool || (await this.createConnection())
  const dbs = process.env.REGISTERED_DB.split(',')
  let resp = []

  if (dbs.length > 1) {
    for (var i = 0; i < dbs.length; i++) {
      const { rows } = await pool.query(`SELECT EXISTS(
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '${dbs[i]}'
    )`)

      if (rows[0].exists) {
        const rs = await pool.query(`drop table ${dbs[i]} cascade`)
        resp.push(rs.command)
      }
    }
  }
  return resp
}

Postgoose.prototype.isExist = async function () {
  const pool = this.pool || (await this.createConnection())
  const { rows } = await pool.query(`SELECT EXISTS(
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = '${this.schemaName}'
      )`)

  const row = rows[0].exists
  if (!row) {
    await pool.query(`create table ${this.schemaName} (${this.schema})`)
    if (this.virtual.length > 0) {
      for (let l = 0; l < this.virtual.length; l++) {
        const { table, tableStructure } = this.virtual[l]
        await pool.query(`create table ${table} (${tableStructure})`)
      }
    }
  }

  this.pool = pool
}

Postgoose.prototype.createDefaults = async function (table_data) {
  const p = 'PM',
    a = 'AM',
    spa = '202'
  const glob =
    this.global_now.length > 0
      ? this.global_now
          .map((d) => {
            if (isObject(d)) return { ...d }
          })
          .filter((m) => m)[0]
      : undefined
  const cbs = isArray(table_data) ? table_data : [table_data]
  const result = cbs.map((v) => {
    if (isObject(glob)) {
      Object.keys(glob).forEach((x) => {
        const lob = glob[x].toString()
        v[x] =
          v[x] ||
          (lob.endsWith(p) || lob.endsWith(a)
            ? dateAndTime().currentDate_time
            : lob.startsWith(spa) && lob.length === 10
            ? dateAndTime().currentDate
            : glob[x])
      })
    }
    return v
  })
  const rs = this.beforeSave ? await this.pre(result, this.beforeSave) : result
  return rs
}

Postgoose.prototype.outGoings = function (data, cb, option) {
  if (cb && !data) return (this.cb = cb)
  else if (data && !cb) return data
  else if (data && typeof cb === 'function') {
    const outgo = cb(data, option)
    return outgo
  } else return undefined
}

Postgoose.prototype.pre = async function (data, cb) {
  if (!data && cb) return (this.beforeSave = cb)
  else if (data && cb) {
    const ref = await cb(data)
    return ref
  } else if (data) return data
  else return undefined
}

Postgoose.prototype.method = function (method) {
  if (typeof method === 'function') {
    this[method.name] = (option) => method(this.data, option)
  }
}

Postgoose.prototype.mapThrough = function (obj, skip) {
  if (!obj || Object.keys(obj).length < 1) return undefined
  else if (typeof obj === 'string') return obj.length > 0 && obj
  else {
    const ofset = obj.offset ? `offset ${obj.offset}` : `offset ${0}`
    const limit = obj.limit ? `limit ${obj.limit}` : `limit ${1000}`

    const virtual = this.virtual.length > 0 ? this.virtual : undefined
    const main = update_record_parser(obj, this.schemaEntries)
    const child = []
    if (virtual) {
      virtual.forEach((d) => {
        const isAmong = update_record_parser(obj, d.table_entries)
        if (isAmong) {
          const ab = {}
          Object.keys(isAmong).forEach((s) => {
            ab[`${d.table}.${s}`] = isAmong[s]
          })
          child.push(ab)
        }
      })
    }
    if (child.length > 0) {
      const bj = {}

      child.forEach((d) => {
        Object.keys(d).forEach((v) => (bj[v] = d[v]))
      })

      const rs_ = { ...(main ? { ...main } : ''), ...bj }
      const rs = KeyValuePairs(rs_).parameter
      const where = `where ${rs} ${!skip ? ofset : ''} ${!skip ? limit : ''}`

      return where
    } else {
      const rs = KeyValuePairs(main).parameter
      const where = `where ${rs} ${!skip ? ofset : ''} ${!skip ? limit : ''}`
      return where
    }
  }
}

Postgoose.prototype.aggregate = async function ({
  where,
  group,
  _id,
  id_name,
}) {
  await this.isExist()
  const pool = this.pool
  const tabl = this.join()
  const match = this.mapThrough(where, true)
  const { aggs, keys } = group_agg_parser(group, ',', 'as')
  const queries = ` select count(${_id || '*'})${id_name ? id_name : 'pop'}, ${
    aggs ? aggs : ''
  }
  from ${this.schemaName}
  ${tabl}
  ${match ? match : ''}
  group by ${keys || ''}
  `
  const rs = await pool.query(queries)

  return rs.rows
}

Postgoose.prototype.registeredTables = async function (record) {
  if (!record || record.length < 1)
    throw new Error('Valid data object is required')
  const result = []

  const data = await this.createDefaults(record)
  this.data = data

  const { errors: err, passed: success } = GetErrorAndPass(data, this.requires)
  unique_string(err)

  const { rs: response } = GetSchemaData(success, this.schemaEntries)
  result.push({ table: response, schema: this.schemaName })

  // Create Child Tables;
  if (this.virtual.length > 0) {
    for (let i = 0; i < this.virtual.length; i++) {
      const v = this.virtual[i]
      const { rs: extract } = GetSchemaData(success, v.table_entries)
      result.push({ table: extract, schema: v.table })
    }
  }

  return result
}

module.exports = Postgoose
