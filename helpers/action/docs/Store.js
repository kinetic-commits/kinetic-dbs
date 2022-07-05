const { aggregate } = require('../../../context/essentials/Sentials');
const { myFunc } = require('../../essential');
const QUERIES = require('../../Queries');
const { ND } = require('../../Types');

async function StoreDetails({ req, schema }) {
  const { user } = await QUERIES(req);

  const who_s_visting =
    user.role === ND() ? 'ma.map_allocation_to' : 'ma.uploaded_by';
  const sto = user.role === ND() ? 'Allocated' : 'In store';
  const sn =
    user.role === ND()
      ? `and ma.disco_acknowledgement = true and disco_allocation_to = 'null'`
      : '';

  const st = await aggregate(`
            select count(om.destination_store) as total, om.destination_store as _id
            from meter_activities as ma
            left join other_meter_info as om on ma.meter_id = om.meter_id 
            where ${who_s_visting}='${user.abbrv}' and ma.allocation_status='${sto}' ${sn}
            group by destination_store;
        `);

  const org =
    st[0] == null
      ? st
      : st.map((el) => {
          return { ...el, map: user.abbrv };
        });

  return org;
}

const GetStoreItems = async ({ req }) => {
  const { user, queries } = await QUERIES(req);
  const who_s_visting =
    user.role === ND() ? 'ma.map_allocation_to' : 'ma.uploaded_by';
  const sto = user.role === ND() ? 'Allocated' : 'In store';
  const sn =
    user.role === ND()
      ? `and ma.disco_acknowledgement = true and disco_allocation_to = 'null'`
      : '';

  const st = await aggregate(`
        select count(om.destination_store) as pop, om.destination_store as _id,md.phase, md.meter_owner, md.default_unit, md.carton_id
        from meter_activities as ma
        
        left join meter_data as md on ma.meter_id = md.meter_number
        left join other_meter_info as om on ma.meter_id = om.meter_id and  destination_store = '${queries.destinationStore}'
        
        where ${who_s_visting}='${user.abbrv}' and ma.allocation_status='${sto}' ${sn}

        group by destination_store, phase, meter_owner, default_unit, carton_id
    `);

  const utie = st.map((e) => {
    return {
      meterOwner: e.meter_owner,
      manufacturerName: e.meter_owner,
      defaultUnit: +e.default_unit,
      cartonID: e.carton_id,
      destinationStore: e._id,
      storeID: e.carton_id,
      pop: +e.pop,
      phase: e.phase,
    };
  });

  const ut = {
    each: utie.length > 0 ? utie.filter((v) => v.pop > 0) : [],
    all: {
      singlePhase: myFunc(
        utie.filter((d) => d.phase === '1-Phase').map((e) => e.pop)
      ),
      threePhase: myFunc(
        utie.filter((d) => d.phase === '3-Phase').map((e) => e.pop)
      ),
      md: 0,
      total: myFunc(utie.map((d) => +d.pop)),
    },
  };

  return ut;
};

const getStoreDetails = async ({ req }) => {
  const { search } = await QUERIES(req);

  if (search === 'STORE') return StoreDetails({ req });
  else if (search === 'ITEMS') return GetStoreItems({ req });
};

module.exports = { getStoreDetails };
