const { NM } = require('../../../helpers/Types');
const { isObject, GetUniques, myFunc } = require('../../essentials/usables');

const parse_num = (obj, param) => {
  const num = obj.pop || obj.total || obj.count;
  const prn = typeof num === 'string' ? +num : num;
  return { ...obj, [param]: prn };
};

const agg_returns = (rs, message, msg) => {
  if (!rs) return message;
  if (isObject(rs) || rs.length > 0) {
    message.data = rs;
    message.success = true;
    message.code = 200;

    return message;
  } else {
    message.error = msg || 'No result found';
    message.code = 400;

    return message;
  }
};

const filter_two_values = ({
  param1,
  param0,
  param2,
  field,
  array = [],
  strict = 'isReceived',
  value = true,
  skip,
}) => {
  if (array.length < 1)
    return {
      q0_data: [],
      q1_data: [],
      q0_pop: 0,
      q1_pop: 0,
      q2_pop: 0,
      q2_data: [],
      total: 0,
    };
  const table = GetUniques(array.map((v) => v[field]));
  let p0, p1, p2, sn, th, trd;
  if (array.length > 0 && table.length > 0) {
    if (skip) {
      p0 = array.filter((v) => v[field] === param0);
      p1 = array.filter((v) => v[field] === param1);
    } else if (skip && param2) {
      p0 = array.filter((v) => v[field] === param0 && v[field] === param0);
      p1 = array.filter((v) => v[field] === param1 && v[field] === param1);
      p2 = array.filter((v) => v[field] === param2 && v[field] === param2);
    } else if (!skip && param2) {
      p0 = array.filter((v) => v[field] === param0 && v[strict] === value);
      p1 = array.filter((v) => v[field] === param1 && v[strict] === value);
      p2 = array.filter((v) => v[field] === param2 && v[strict] === value);
    } else {
      p0 = array.filter((v) => v[field] === param0 && v[strict] === value);
      p1 = array.filter((v) => v[field] === param1 && v[strict] === value);
    }
    sn = p0.length > 0 ? myFunc(p0.map((d) => d.pop || d.total || d.count)) : 0;
    th = p1.length > 0 ? myFunc(p1.map((d) => d.pop || d.total || d.count)) : 0;

    trd = p2
      ? p2.length > 0
        ? myFunc(p2.map((d) => d.pop || d.total || d.count))
        : 0
      : 0;
  }

  return {
    q0_data: p0,
    q1_data: p1,
    q0_pop: sn,
    q1_pop: th,
    q2_data: p2,
    q2_pop: trd,
    total: sn + th + trd,
  };
};

const generate_view = ({ table, allocation, role }) => {
  if (table.length < 1) return [];
  const pam = role === NM() ? 'mapAllocationTo' : 'discoAllocationTo';
  const uniq = GetUniques(table.map((d) => d[pam]));
  const get_uniqs =
    uniq.length > 0 ? uniq.filter((d) => d !== undefined) : undefined;

  if (get_uniqs) {
    const bp = get_uniqs.map((v) => {
      const sav =
        allocation.length > 0
          ? allocation.filter((k) => k[pam] === v && k.isReceived)
          : [];
      const data = sav[0] ? sav[0] : undefined;
      const ins = data ? sav.filter((d) => d.installationStatus) : undefined;
      const phs_ = data ? sav.filter((d) => d.phase === '1-Phase') : undefined;
      const phs_t = data ? sav.filter((d) => d.phase === '3-Phase') : undefined;
      return {
        provider: data ? data.meterOwner : undefined,
        receiver: data ? data.mapAllocationTo : undefined,
        total_allocated: data ? myFunc(sav.map((d) => d.pop)) : 0,
        total_installed: ins ? myFunc(ins.map((d) => d.pop)) : 0,
        single: phs_ ? myFunc(phs_.map((d) => d.pop)) : 0,
        three: phs_t ? myFunc(phs_t.map((d) => d.pop)) : 0,
        installer: data ? data.discoAllocationTo : undefined,
      };
    });

    return bp;
  }
};

const _gp = {
  map_allocation_to: 'map_allocation_to',
  disco_allocation_to: 'disco_allocation_to',
  allocation_status: 'allocation_status',
  installation_status: 'installation_status',
  uploaded_by: 'uploaded_by',
  disco_acknowledgement: 'disco_acknowledgement',
  meter_owner: 'meter_owner',
  phase: 'phase',
};

const _cm = {
  meter_installed: 'meter_installed',
  has_allocation: 'has_allocation',
  meter_owner: 'meter_owner',
  is_certified: 'is_certified',
  disco: 'disco',
  meter_phase: 'meter_phase',
};

const get_unique_object_values = ({ array, param0, param1, cb }) => {
  let data = [];
  const unqi = GetUniques(array.map((d) => `${d[param0]}:${d[param1]}`));
  if (unqi.length > 0) {
    unqi.forEach((d) => {
      const [q, w] = d.split(':');
      const flt = array.filter((b) => b[param0] === q && v[param1] === w);
      if (flt.length > 0) {
        const info = cb(flt);
        data.push(info);
      }
    });
  }
  return data;
};

module.exports = {
  parse_num,
  agg_returns,
  filter_two_values,
  generate_view,
  get_unique_object_values,
  _cm,
  _gp,
};
