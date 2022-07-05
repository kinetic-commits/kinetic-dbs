const { bodyAppParser } = require('../context/_task/bodyApplicationParser');

const QUERIES = async (req) => {
  const queries = { ...req.query };

  const limit = queries.limit || 1000;
  const search = queries.search;
  const user = req.user;
  const hasId = req.params.id;
  const name = queries.name;
  const sql = queries.sql;
  const method = req.method;
  const select = req.select;
  const pipe = queries.pipe;
  const from = queries.from;
  const to = queries.to;
  const who = queries.who;
  const skip = queries.skip;
  const offset = queries.offset ? +queries.offset : undefined;
  const jump = queries.jump ? +queries.jump : undefined;

  // Delete Queries
  delete queries['search'];
  delete queries['select'];
  delete queries['limit'];
  delete queries['name'];
  delete queries['sort'];
  delete queries['pipe'];
  delete queries['sql'];

  const ro = user ? user.role : undefined;
  const av = user ? user.abbrv : undefined;

  const bdy = bodyAppParser(req);
  bdy ? (req.body = bdy) : '';

  req.QUERIES = {
    limit,
    search,
    hasId,
    name,
    select,
    sql_queries: sql,
    jump: sql,
    offset: sql,
    data: {},
    queries,
    role: ro,
    abbrv: av,
    method,
    who,
    from,
    to,
    pipe,
    skip,
    jump,
    offset,
  };
};

module.exports = QUERIES;
