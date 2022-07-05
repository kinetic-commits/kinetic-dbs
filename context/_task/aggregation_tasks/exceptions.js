const { ND, NM } = require('../../../helpers/Types');
const Metering = require('../../../model/Meter_Data');
const User = require('../../../model/UserData');
const { GetUniques } = require('../../essentials/usables');
const { _gp } = require('./aggregation_tools');
const map_dashboard_config = require('./map_dashboard');

const exception_anomally = async (req) => {
  const user = await User.find(`where role in ('${ND()}', '${NM()}')`);
  const store_meters = await Metering.aggregate({
    group: _gp,
  });

  const tables = [];

  for (let i = 0; i < user.length; i++) {
    const owner = user[i];
    if (owner.role === NM()) {
      const mtr = store_meters.filter((d) => d.uploaded_by === owner.abbrv);

      const rs_ = await map_dashboard_config({ req, rol_: NM(), meters: mtr });
      const rs = { ...rs_, role: NM(), doc_owner: owner.abbrv };
      tables.push(rs);
    } else if (owner.role === ND()) {
      const mtr = store_meters.filter(
        (d) => d.map_allocation_to === owner.abbrv
      );
      const rs_ = await map_dashboard_config({
        req,
        rol_: ND(),
        meters: mtr,
        applicant: [],
      });

      const rs = { ...rs_, role: ND(), doc_owner: owner.abbrv };

      tables.push(rs);
    }
  }

  if (tables.length > 0) {
    const on_transit_data = [];
    tables.forEach((b) => {
      if (b.on_transit_data.length > 0) {
        b.on_transit_data.forEach((c) => on_transit_data.push(c));
      }
    });
    

    if (on_transit_data.length > 0) {
      const utie = on_transit_data;
      const uniq = GetUniques(
        utie.map((v) => `${v.uploadedBy}:${v.mapAllocationTo}`)
      );
      console.log(utie);
      if (uniq.length > 0) {
        uniq.forEach((s) => {
          const [q, w] = s.split(':');
          const sbn = utie.filter(
            (a) => a.uploadedBy === q && a.mapAllocationTo === w
          );
          // if(sbn.length>0){
          //     const

          //    return {
          //         phase: '1-Phase',
          //         pop: 1708,
          //         meterOwner: 'MOMAS',
          //         allocationStatus: 'In store',
          //         allocatedTo: 'undefined',
          //         mapAllocationTo: 'IBEDC',
          //         uploadedBy: 'MOMAS',
          //         isReceived: false
          //       }
          // }
        });
      }
    }
  }

  return {};
};

module.exports = exception_anomally;
