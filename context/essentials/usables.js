const fs = require('fs');

const isArray = (array) => Object.keys(array).toString().startsWith(0);
const isObject = (array) => Object.keys(array).length > 0;

const GetUniques = (array) => {
  if (!array) return [];
  return [...new Set(array)];
};

const csvGetter = (path) => {
  const data = fs
    .readFileSync(path, { encoding: 'utf-8', flag: 'r' })
    .toString()
    .replace(/\r\n/g, '\n')
    .split('\n');

  const header = data[0].split(',');

  const values = [];
  const finalResult = [];

  for (let i = 1; i <= data.length - 1; i++) {
    const escape = ('' + data[i]).replace(/"/g, '\\"');
    data[i].length !== undefined ? values.push(escape.split(',')) : '';
  }

  for (const row of values) {
    const vl = {};
    header.map((e, index) => {
      if (header.length === row.length) {
        return (vl[e] = row[index]);
      }
    });

    const keyUp = Object.keys(vl);
    if (keyUp.length !== 0) finalResult.push(vl);
  }

  return finalResult;
};

function filterMap({ array, field, value, otherField, otherValue, operator }) {
  if (field && value && !otherField && !otherValue) {
    return array.filter((e) => e[field] === value);
  } else if (field && value && otherField && otherValue) {
    if (operator === 'OR') {
      const v = array.filter(
        (e) => e[field] === value || e[otherField] === otherValue
      );
      return v;
    } else if (operator === 'AND') {
      const v = array.filter(
        (e) => e[field] === value && e[otherField] === otherValue
      );
      return v;
    } else return [];
  }
}

function untie(ar) {
  const us = ar.map((e) => {
    const d = { ...e._id, ...e };
    delete d['_id'];
    return d;
  });

  return us;
}

function gUnq({ array, field, three, single, main, sub }) {
  const up = GetUniques(array.map((f) => f.provider));
  const ud = GetUniques(array.map((f) => f.name));

  const f = filterMap({ array, field, value: three });
  const s = filterMap({ array, field, value: single });

  const sing = up.map((g) => {
    const sn = s
      ? s.filter((n) => n.provider === g && ud.includes(n.name))
      : [];
    const th = f
      ? f.filter((n) => n.provider === g && ud.includes(n.name))
      : [];

    return {
      provider: g,
      name: sn[0] || th[0] ? (sn[0] || th[0]).name : '',
      allocatedTo: sn[0] || th[0] ? (sn[0] || th[0]).allocatedTo : '',
      [main || 'single']: myFunc(sn.map((v) => v.pop)),
      [sub || 'three']: myFunc(th.map((v) => v.pop)),
      total: myFunc(th.map((v) => v.pop)) + myFunc(sn.map((v) => v.pop)),
    };
  });

  return { single: s, three: f, summary: sing };
}

function sum({ field, array }) {
  if (!array) return 0;
  return myFunc(array.map((e) => e[field]));
}

Array.prototype.sum = function () {
  let all = 0;
  for (let i = 0; i < this.length; i++) {
    all += this[i];
  }

  return all;
};

const myFunc = (total) => {
  if (!total) return 0;

  if (total.length === 0) return 0;
  return total.sum();
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

const makeArrayFromSpacedString = (str, method, addQuotes) => {
  if (!str) return '';
  const s = str.split(method || ' ');
  let string = '';
  if (s.length > 1) {
    for (let r = 0; r < s.length; r++) {
      if (r < s.length - 1) {
        string += addQuotes ? `'${s[r]},'` : `${s[r]},`;
      } else string += addQuotes ? `'${s[r]}'` : `${s[r]}`;
    }
  } else string = str;
  return string;
};

module.exports = {
  isArray,
  isObject,
  GetUniques,
  untie,
  filterMap,
  gUnq,
  sum,
  csvGetter,
  isArray,
  myFunc,
  strip,
  makeArrayFromSpacedString,
};
