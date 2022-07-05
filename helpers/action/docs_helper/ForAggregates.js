const FirstClassArgs = `
        select count(*) as pop, 
            main.map_allocation_to as discoName, 
            main.disco_allocation_to as installerName, 
            main.allocation_status as status, 
            main.installation_status as installed, 
            main.uploaded_by as providerName, 
            main.disco_acknowledgement as isReceived, 
            child.meter_owner as provider, 
            child.phase as phase
        from meter_activities as main
        left join meter_data as child on main.meter_id = child.meter_number
        where main.map_allocation_to is not null or main.uploaded_by is not null
        group by discoName, installerName, status, installed, providerName, isReceived, provider, phase
`;

const customer_aggregate_string = `
    select count(*) as pop, 
        has_allocation as hasAllocation, 
        meter_installed as installed,
        is_certified as isCertified, 
        disco as name, 
        meter_phase as phase, 
        meter_owner as provider
    from other_customer_info
    group by hasAllocation, installed, isCertified, name, phase, provider
`;

const meter_aggregate_without_group_by = (where) => `select count(*) as pop,
        main.map_allocation_to as discoName, 
        main.disco_allocation_to as installerName, 
        main.allocation_status as status, 
        main.installation_status as installed, 
        main.uploaded_by as providerName, 
        main.disco_acknowledgement as isReceived, 
        child.meter_owner as provider, 
        child.phase as phase
    from meter_activities as main
    left join meter_data as child on main.meter_id = child.meter_number
    ${where ? where : ''}
    group by discoName, installerName, status, installed, providerName, isReceived, provider, phase
`;

const exceptions = `select count(*) as pop, 
main.map_allocation_to as discoName,  
main.allocation_status as status,  
main.disco_acknowledgement as isReceived, 
child.meter_owner as provider, 
child.phase as phase
from meter_activities as main
left join meter_data as child on main.meter_id = child.meter_number
where main.map_allocation_to is not null or main.uploaded_by is not null
group by discoName, status, isReceived, provider, phase`;

const pickProvider = (aggregateFinding) => {
  const v_0 = aggregateFinding.filter((d) => d.providername);

  const data_0 =
    v_0.length > 0
      ? v_0.map((v) => {
          return {
            providerName: v.providername,
            provider: v.provider ? v.provider.toUpperCase() : undefined,
            phase: v.phase,
            uploaderRole: 'MAP',
            installed: v.installed,
            status: v.status,
            installerName:
              v.installername !== 'null' ? v.installername : undefined,
            discoName: v.disconame !== 'undefined' ? v.disconame : undefined,
            pop: +v.pop,
            allocation: v.disconame ? true : false,
          };
        })
      : [];

  return data_0;
};

const pickReceiver = (aggregateFinding) => {
  const v_ = aggregateFinding.filter((d) => d.disconame && d.isreceived);
  const data_ =
    v_.length > 0
      ? v_.map((v) => {
          return {
            providerName: v.providername,
            provider: v.provider ? v.provider.toUpperCase() : undefined,
            phase: v.phase,
            uploaderRole: 'DISCO',
            installed: v.installed,
            status: v.status,
            installerName:
              v.installername !== 'null' ? v.installername : undefined,
            discoName: v.disconame !== 'undefined' ? v.disconame : undefined,
            pop: +v.pop,
            allocation: v.installername ? true : false,
          };
        })
      : [];

  return data_;
};

const pickProperties = (ag) => {
  return ag.length > 0
    ? ag.map((d) => {
        return {
          _id: d.name,
          pop: +d.pop,
          hasAllocation: d.hasallocation,
          installed: d.installed,
          name: d.name,
          isCertified: d.iscertified,
          phase: d.phase,
          provider: d.provider ? d.provider.toUpperCase() : undefined,
        };
      })
    : [];
};

module.exports = {
  FirstClassArgs,
  customer_aggregate_string,
  exceptions,
  meter_aggregate_without_group_by,
  pickProvider,
  pickReceiver,
  pickProperties,
};
