const generateRandomString = require('./ID');

const isArray = (array) => Object.keys(array).toString().startsWith(0);
const isObject = (array) => Object.keys(array).length > 0;

const stringParser = (string, len) => {
  let value = '',
    schema;

  if (string === 'Date') {
    schema = 'timestamp';
  } else if (typeof string === 'boolean') {
    value = `${string}`;
    schema = 'bool';
  } else if (typeof string === 'number') {
    value = `${string}`;
    schema = 'int';
  } else if (typeof string === 'string') {
    value = `'${string}'`;
    schema = `varchar(${len || '100'})`;
  }

  return { value, schema };
};

const strip = (arr) => {
  if (!arr) return '';
  let in_ar = '';
  for (let y = 0; y < arr.length; y++) {
    if (y < arr.length - 1) {
      in_ar += `'${arr[y]}',`;
    } else in_ar += `'${arr[y]}'`;
  }

  return `(${in_ar})`;
};

const stripOff = ({ key, value }) => {
  if (!value) return undefined;

  let msg = {},
    main = '',
    structure = '',
    defaultValues = {};

  if (typeof value === 'object') {
    const { type, len, required, unique, pkey, rkey, empty } = value;
    const inf = typeof type === 'function' ? type() : '';

    if (value.default !== undefined) {
      defaultValues[key] = value.default;
    }

    const pr = stringParser(inf, len);
    main = pr.value;

    structure = `${key} ${pr.schema} ${
      unique ? 'not null unique' : empty ? 'not null' : ''
    }${pkey ? 'primary key' : ''}${rkey ? rkey : ''}`;

    if (required) {
      (msg.tag = key), (msg.error = required);
    }
  } else {
    const inf = typeof value === 'function' ? value() : '';
    const pr = stringParser(inf);
    main = pr.value;
    structure = `${key} ${pr.schema}`;
  }

  return { value: main, requiredMsg: msg, structure, key, defaultValues };
};

const KeyParser = (obj) => {
  if (!obj) return {};
  const main = Object.keys(obj);
  const child = Object.values(obj);

  let keys = '';
  let values = '';
  let schemaStructure = '';
  let requires = [];
  let dvalues = {};

  main.forEach((r, i) => {
    const { value, requiredMsg, key, structure, defaultValues } = stripOff({
      key: r,
      value: child[i],
    });

    if (isObject(defaultValues)) {
      Object.keys(defaultValues).forEach((d, i) => {
        if (d === r) {
          dvalues[r] = defaultValues[r];
        }
      });
    }

    if (i < main.length - 1) {
      keys += `${key},`;
      values += `${value},`;
      schemaStructure += `${structure},`;
      Object.keys(requiredMsg).length > 0 ? requires.push(requiredMsg) : 0;
    } else {
      keys += `${key}`;
      values += `${value}`;
      schemaStructure += `${structure}`;
      requires.push(requiredMsg);
    }
  });

  return {
    keys,
    values,
    schemaStructure,
    requires,
    entries: main,
    defaultValues: dvalues,
  };
};

const ExtractUsables = (requires, data) => {
  if (!requires) return [];
  if (typeof requires === 'object' && requires.length < 1) return [];

  const errors = [];

  requires.map((b) => {
    if (typeof b === 'string') {
      const findError = data[b];
      if (!findError) errors.push(`${b}`);
    } else if (isObject(b)) {
      const findError = data[b.tag];
      if (!findError) errors.push(`${b.tag}: ${b.error}`);
    }
  });

  return errors;
};

const KeyValuePairsForMany = (obj) => {
  if (!obj) return {};

  if (isArray(obj)) {
    let mv = '';
    obj.forEach((v, ie) => {
      let keys = '';
      let values = '';
      const key = Object.keys(v);
      const value = Object.values(v);

      for (let i = 0; i < key.length; i++) {
        if (i < key.length - 1) {
          keys += `${key[i]},`;
          values +=
            typeof value[i] === 'number' || typeof value[i] === 'boolean'
              ? `${value[i]},`
              : `'${value[i]}',`;
        } else {
          keys += `${key[i]}`;
          values +=
            typeof value[i] === 'number' || typeof value[i] === 'boolean'
              ? `${value[i]}`
              : `'${value[i]}'`;
        }
      }
      if (ie < obj.length - 1) {
        mv += `(${values}),`;
      } else mv += `(${values})`;
    });

    return mv;
  }
};

const KeyValuePairs = (obj, params) => {
  if (!obj) return {};
  let keys = '';
  let values = '';
  let string = '';
  let update = '';
  let objContructor = '';
  let parameter = '';
  const key = Object.keys(obj);
  const value = Object.values(obj);

  for (let i = 0; i < key.length; i++) {
    const id =
      typeof value[i] === 'number' ||
      typeof value[i] === 'boolean' ||
      typeof value[i] === 'object'
        ? `${value[i]}`
        : `'${value[i]}'`;
    const main = `${key[i]}`;
    if (i < key.length - 1) {
      string += ` ${key[i]} ${value[i]},`;
      keys += `${key[i]},`;
      values += `${value[i]},`;
      objContructor +=
        value[i] === 'number' ||
        typeof value[i] === 'boolean' ||
        typeof value[i] === 'object'
          ? `${value[i]},`
          : `'${value[i]}',`;
      update += params ? `${params}.${main}=${id},` : `${main}=${id},`;
      if (params === 'OR') {
        parameter += `${main}=${id} or `;
      } else if (params === 'NOT') {
        parameter += ` not ${main}=${id}`;
      } else parameter += `${main}=${id} and `;
    } else {
      string += ` ${key[i]} ${value[i]}`;
      keys += `${key[i]}`;
      values += `${value[i]}`;
      objContructor +=
        typeof value[i] === 'number' || typeof value[i] === 'boolean'
          ? `${value[i]}`
          : `'${value[i]}'`;
      update += params ? `${params}.${main}=${id}` : `${main}=${id}`;
      if (params === 'NOT') {
        parameter += ` not ${main}=${id}`;
      } else if (params === 'IN') {
        parameter += `${main} in (${strip(id)})`;
      } else if (params === 'NOT_IN') {
        parameter += `${main} not in (${strip(id)})`;
      } else if (params === 'BETWEEN') {
        parameter += `${main} between ${id[0]} and ${id[1]}`;
      } else parameter += `${main}=${id}`;
    }
  }

  return { keys, values, string, objContructor, update, parameter };
};

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

const GetUniques = (array) => {
  if (!array) return [];
  return [...new Set(array)];
};

const unique_string = (errorString) => {
  if (!errorString) return undefined;
  else if (!isArray(errorString)) return undefined;
  let errorOccurred;
  if (errorString.length > 0) {
    errorOccurred = GetUniques(errorString.join().split(','));
  } else errorOccurred = errorString;

  throw new Error(errorOccurred);
};

const update_record_parser = (data, entries) => {
  const { keys } = KeyValuePairs(data);
  const mkAr = keys.split(',');
  const main = {};
  const v = mkAr.map((d) => {
    const j = entries.includes(d);
    if (j) {
      main[d] = data[d];
      return true;
    }
    return false;
  });

  const isThere = v.some((m) => m === true);
  const pareseInfo = isThere ? main : undefined;

  return pareseInfo;
};

const makeObject = (child) => {
  const bj = {};
  child.forEach((d) => {
    Object.keys(d).forEach((v) => (d[v] !== undefined ? (bj[v] = d[v]) : ''));
  });
  return bj;
};

const group_agg_parser = (obj, params, symbol) => {
  if (!obj) return {};
  const sm = symbol || '=';
  const par = params || ',';
  let keys = '';
  let aggs = '';
  const key = Object.keys(obj);
  const value = Object.values(obj);

  for (let i = 0; i < key.length; i++) {
    if (i < key.length - 1) {
      aggs += ` ${key[i]} ${sm} ${value[i]}${par}`;
      keys += `${key[i]},`;
    } else {
      aggs += ` ${key[i]} ${sm} ${value[i]}`;
      keys += `${key[i]}`;
    }
  }
  return { keys, aggs };
};

module.exports = {
  KeyParser,
  KeyValuePairsForMany,
  KeyValuePairs,
  GetSchemaData,
  CreateReusables,
  GetErrorAndPass,
  isArray,
  isObject,
  unique_string,
  update_record_parser,
  makeObject,
  group_agg_parser,
};
