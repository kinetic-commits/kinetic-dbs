const { KeyValuePairs } = require('./tool');

const makeObject = (child) => {
  const bj = {};
  child.forEach((d) => {
    Object.keys(d).forEach((v) => (bj[v] = d[v]));
  });
  return bj;
};

const exx = (ob, operator) => {
  const r = ob.filter((d) => d[operator]);
  const OR = makeObject(r);
  const or_s = KeyValuePairs(OR, operator).parameter;
  const data = delete ob[operator];
  return { data, string: or_s };
};

const ObjectQueryParser = (data_) => {
  if (!data) return {};
  const data = data_;

  const string = '';
  const keys = Object.keys(data);

  for (let i = 0; i < keys.length; i++) {
    if (keys.includes('OR')) {
      const or = exx(data, 'OR');
      console.log(or);
    }
  }
};

module.exports = { ObjectQueryParser };
