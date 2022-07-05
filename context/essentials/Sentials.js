const bcript = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');
const {
  KeyValuePairsForMany,
  KeyValuePairs,
  ExtractUsables,
  isArray,
} = require('./usables');

const CreateReusables = async (data, schema, pool) => {
  if (!data) return { rs: 0, msg: '' };
  let rs, msg;

  if (isArray(data) && data.length > 0) {
    const mv = KeyValuePairsForMany(data);
    const { keys } = KeyValuePairs(data[0]);

    rs = await pool.query(`insert into ${schema} (${keys}) values${mv}`);

    msg = `SUCCESS - Only ${data.length} document was/were inserted of many`;
  }

  return { rs: rs ? rs.rowCount : 0, msg };
};

const GetSchemaData = (data, entries) => {
  if (!data && !entries) return { rs: [] };

  const fm = data.map((d) => {
    const main = {};
    entries.forEach((b) => (main[b] = d[b]));
    return { ...main };
  });

  return { rs: fm };
};

const GetErrorAndPass = (data, requires) => {
  if (!data && requires) return { errors: [], passed: [] };
  let errors = [];
  let passed = [];

  data.forEach((d) => {
    const er = ExtractUsables(requires, d);
    if (er.length > 0) {
      errors.push(er.toString());
    } else passed.push(d);
  });

  return { errors, passed };
};

const matchPassword = async function (main, sent) {
  return await bcript.compare(sent, main);
};

const userSignature = function ({ _id, email }) {
  return jwt.sign(
    {
      _id,
      email,
    },
    process.env.QQ,
    {
      expiresIn: 336000,
    }
  );
};

const aggregate = async (queries) => {
  const rs = await pool.query(queries);
  return rs.rows;
};

const FindWithoutPostgoose = async (where, table, select) => {
  const rs = await pool.query(
    `select ${select ? select : '*'} from ${table} ${where ? where : ''}`
  );
  return rs.rows;
};

module.exports = {
  CreateReusables,
  GetSchemaData,
  GetErrorAndPass,
  userSignature,
  matchPassword,
  aggregate,
  FindWithoutPostgoose,
};
