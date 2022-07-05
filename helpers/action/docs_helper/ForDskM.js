const { aggregate } = require('../../../context/essentials/Sentials');
const { NM } = require('../../Types');
const { meter_aggregate_without_group_by } = require('./ForAggregates');

const getAllMetersForMapUser = async (req) => {
  const { abbrv, skip } = req.QUERIES;

  const aggregateFinding = await aggregate(
    meter_aggregate_without_group_by(`where uploaded_by = '${skip || abbrv}'`)
  );

  const v_0 = aggregateFinding.filter((d) => d.providername);

  const AA =
    v_0.length > 0
      ? v_0.map((v) => {
          return {
            providerName: v.providername,
            provider: v.provider,
            phase: v.phase,
            uploaderRole: 'MAP',
            installed: v.installed,
            status: v.status,
            installerName: v.installername,
            allocatedTo: v.disconame !== 'undefined' ? v.disconame : undefined,
            pop: +v.pop,
          };
        })
      : [];

  return { AA };
};

module.exports = getAllMetersForMapUser;
