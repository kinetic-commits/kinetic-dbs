const { aggregate } = require('../../../context/essentials/Sentials');
const { GetUniques } = require('../../essential');

const {
  meter_aggregate_without_group_by,
  customer_aggregate_string,
} = require('./ForAggregates');

const getDiscoInfoAndForm74Info = async ({ req }) => {
  const { abbrv, skip } = req.QUERIES;

  const ar = await aggregate(customer_aggregate_string);

  const v_0 = await aggregate(
    meter_aggregate_without_group_by(
      `where map_allocation_to = '${
        skip || abbrv
      }' and disco_acknowledgement_by ='${skip || abbrv}'`
    )
  );

  const aggregateFinding0 =
    ar.length > 0
      ? ar.map((v) => {
          return {
            pop: +v.pop,
            hasAllocation: v.hasallocation,
            installed: v.installed,
            isCertified: v.iscertified,
            name: v.name,
            phase: v.phase,
            provider: v.provider ? v.provider.toUpperCase() : null,
          };
        })
      : [];

  const a0a = aggregateFinding0;
  const AA =
    v_0.length > 0
      ? v_0.map((v) => {
          return {
            providerName: v.providername,
            provider: v.provider ? v.provider.toUpperCase() : null,
            phase: v.phase,
            name: v.disconame,
            installed: v.installed,
            status: v.status,
            allocatedTo:
              v.installername !== 'null' ? v.installername : undefined,
            pop: +v.pop,
          };
        })
      : [];

  const hasAllocatedTo = AA.filter((a) => a.allocatedTo);
  const ha1 = GetUniques(hasAllocatedTo.map((a) => a.allocatedTo)).map((ae) => {
    const al = hasAllocatedTo.find(
      (f) => f.allocatedTo === ae && f.installed === true && ae
    );

    const al0 = hasAllocatedTo.find(
      (f) => f.allocatedTo === ae && f.installed === false && ae
    );
    return {
      name: ae,
      view: al ? al.pop : 0 + al0 ? al0.pop : 0,
      value: al ? al.pop : 0,
      provider: al0 || al ? (al0 || al).provider : '',
      parent: al0 || al ? (al0 || al).name : '',
    };
  });

  const ha2 = GetUniques(hasAllocatedTo.map((a) => a.office)).map((ae) => {
    const al = hasAllocatedTo.find(
      (f) => f.office === ae && f.installed === true && ae
    );
    const al0 = hasAllocatedTo.find(
      (f) => f.office === ae && f.installed === false && ae
    );

    return {
      name: ae || '',
      view: al ? al.pop : 0 + al0 ? al0.pop : 0,
      value: al ? al.pop : 0,
      provider: al0 || al ? (al0 || al).provider : '',
      parent: al0 || al ? (al0 || al).name : '',
    };
  });

  return { AA, a0a, ha1, ha2 };
};

module.exports = { getDiscoInfoAndForm74Info };
