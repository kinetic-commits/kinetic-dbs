const { aggregate } = require('../../../context/essentials/Sentials');
const {
  FirstClassArgs,
  customer_aggregate_string,
  pickReceiver,
  pickProvider,
  pickProperties,
} = require('./ForAggregates');

const getApplicationsAndActiveUsers = async (users) => {
  // Get all Request Information
  const discos = users.filter((a) => a.role === 'DISCO');
  const map_ = users.filter((a) => a.role === 'MAP');

  const ag = await aggregate(customer_aggregate_string);

  // Refactor Code
  const aggregateFinding = pickProperties(ag);

  // Total Applications
  const applicant = aggregateFinding;
  const applied = applicant.filter((a) => a.hasAllocation === true);
  const andInstalled = applicant.filter((a) => a.installed === true);
  const totalApplicant = applicant;

  const ze = {
    ds: discos,
    mp: map_,
    cs_al: applied,
    cs_ap: totalApplicant,
    cs_in: andInstalled,
  };

  return ze;
};

const getDiscoMapAndTransitItems = async () => {
  const aggregateFinding = await aggregate(FirstClassArgs);

  const data_ = pickReceiver(aggregateFinding);
  const data_0 = pickProvider(aggregateFinding);

  const v_00 = aggregateFinding.filter((d) => d.disconame && !d.isreceived);

  const data_00 =
    v_00.length > 0
      ? v_00.map((v) => {
          return {
            providerName: v.providername,
            provider: v.provider ? v.provider.toUpperCase() : undefined,
            phase: v.phase,
            status: v.status,
            discoName: v.disconame !== 'undefined' ? v.disconame : undefined,
            pop: +v.pop,
          };
        })
      : [];

  const data = data_;
  const data0 = data_0;
  const data00 = data_00;

  const disco = data
    .filter((d) => d.discoName)
    .map((a) => {
      return {
        name: a.discoName,
        provider: a.provider,
        uploaderRole: 'DISCO',
        phase: a.phase,
        installed: a.installed,
        status: a.installername ? a.status : 'In store',
        allocatedTo: a.installername,
        pop: +a.pop,
      };
    });

  const map =
    data0.length > 0
      ? data0
          .filter((d) => d.providerName)
          .map((a) => {
            return {
              name: a.providerName,
              provider: a.provider,
              uploaderRole: 'MAP',
              phase: a.phase,
              installed: a.installed,
              status: a.status === 'Installed' ? 'Allocated' : a.status,
              allocatedTo: a.discoName,
              pop: +a.pop,
            };
          })
      : [];

  const transit =
    data00.length > 0
      ? data00
          .filter((d) => d.providerName && d.status === 'Allocated')
          .map((a) => {
            return {
              name: a.providerName,
              provider: a.provider,
              uploaderRole: 'MAP',
              phase: a.phase,
              status: a.status,
              allocatedTo: a.discoName,
              pop: +a.pop,
            };
          })
      : [];

  // Create a fake table for the Meter Providers
  const dg = {
    map_alo: map,
    transit,
    disco_alo: disco,
  };

  return dg;
};

module.exports = { getDiscoMapAndTransitItems, getApplicationsAndActiveUsers };
