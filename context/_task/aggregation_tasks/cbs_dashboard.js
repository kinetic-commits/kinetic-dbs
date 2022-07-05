const { ND, NM } = require('../../../helpers/Types');
const Form74 = require('../../../model/CustomerData');
const Metering = require('../../../model/Meter_Data');
const User = require('../../../model/UserData');
const { myFunc, GetUniques } = require('../../essentials/usables');
const { _gp, _cm } = require('./aggregation_tools');
const map_dashboard_config = require('./map_dashboard');

const CBS_Aggs = async (req) => {
  const user = await User.find(`where role in ('${ND()}', '${NM()}')`);
  const store_meters = await Metering.aggregate({
    group: _gp,
  });
  const applicant = await Form74.aggregate({
    group: _cm,
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
      const customers = applicant.filter((d) => d.disco === owner.abbrv);
      const mtr = store_meters.filter(
        (d) => d.map_allocation_to === owner.abbrv
      );
      const rs_ = await map_dashboard_config({
        req,
        rol_: ND(),
        meters: mtr,
        applicant: customers,
      });

      const rs = { ...rs_, role: ND(), doc_owner: owner.abbrv };

      tables.push(rs);
    }
  }

  if (tables.length > 0) {
    const mp = user.filter((d) => d.role === NM());
    const ds = user.filter((d) => d.role === ND());
    const applied = myFunc(tables.map((n) => n.customer_count));
    const total_meter = myFunc(tables.map((n) => n.total));
    const map_additions = tables.filter((n) => n.role === NM());
    const disco_receivables = tables.filter((n) => n.role === ND());
    const map_total_uploads = myFunc(map_additions.map((n) => n.total));
    const disco_total_uploads = myFunc(disco_receivables.map((n) => n.total));
    const metered_applicant = myFunc(
      disco_receivables.map((n) => n.customer_allocated_stats)
    );
    const unmetered_applicant = myFunc(
      disco_receivables.map((n) => n.customer_unallocated_stats)
    );
    const disco_allocations = myFunc(
      disco_receivables.map((n) => n.outOfStoreCount)
    );
    const map_allocation = myFunc(map_additions.map((n) => n.outOfStoreCount));
    const installation_count = myFunc(
      map_additions.map((n) => n.installation_count)
    );
    const installation_data = myFunc(
      map_additions.map((n) => n.installation_data)
    );

    const on_transit_count = myFunc(tables.map((b) => b.on_transit_count));
    const on_transit_data = [];
    const mp_only = map_additions.map((d) => d.allocations);
    const map_provision = [];
    const disco_provision = [];
    const assets_no_phase = [];
    const assets_with_phases = [];
    const assets_exchange = [];

    tables.forEach((b) => {
      if (b.on_transit_data.length > 0) {
        b.on_transit_data.forEach((c) => on_transit_data.push(c));
      }
    });

    map_additions.forEach((p) => {
      if (p.map_provision.length > 0) {
        p.map_provision.forEach((d) => map_provision.push(d));
      }
    });
    disco_receivables.forEach((p) => {
      if (p.disco_provision.length > 0) {
        p.disco_provision.forEach((d) => disco_provision.push(d));
      }
    });

    disco_receivables.forEach((b) => {
      b.create_assest_no_phases.forEach((c) => assets_no_phase.push(c));
      b.create_assest_with_phases.forEach((e) => assets_with_phases.push(e));
    });

    mp_only.forEach((u) => {
      if (u.length > 0) {
        u.forEach((b) => {
          const { receiver, provider, total_allocated } = b;
          const ds = assets_no_phase.find(
            (v) =>
              v.uploadedBy === provider &&
              v.mapAllocationTo === receiver &&
              v.isReceived === true
          );
          if (ds) {
            const {
              pop,
              mapAllocationTo,
              uploadedBy,
              isReceived,
              single,
              three,
              total,
            } = ds;
            assets_exchange.push({
              total_received: pop,
              total_sent: total_allocated,
              receiver: mapAllocationTo,
              provider: uploadedBy,
              single,
              three,
              total,
              isReceived,
            });
          } else {
            assets_exchange.push({
              total_received: 0,
              total_sent: total_allocated,
              receiver: receiver,
              provider,
              single: b.single,
              three: b.three,
              total: total_allocated,
              isReceived: false,
            });
          }
        });
      }
    });

    const allocation_unique_data = [];
    if (assets_exchange.length > 0) {
      const unq = GetUniques(assets_exchange.map((v) => v.provider));
      if (unq.length > 0) {
        unq.forEach((g) => {
          const ftl = assets_exchange.filter((s) => s.provider === g);
          if (ftl.length > 0) {
            const total = myFunc(ftl.map((d) => d.total));
            const single = myFunc(ftl.map((d) => d.single));
            const three = myFunc(ftl.map((d) => d.three));
            allocation_unique_data.push({
              total_received: myFunc(ftl.map((d) => d.total_received)),
              total_sent: myFunc(ftl.map((d) => d.total_sent)),
              receiver: ftl[0].receiver,
              provider: ftl[0].provider,
              single,
              three,
              total,
            });
          }
        });
      }
      // console.log(unq);
    }

    const map_provision_with_transit = [];

    const on_trax_calc = GetUniques(
      map_provision.length > 0 ? map_provision.map((f) => f.uploadedBy) : []
    );
    on_trax_calc.forEach((d) => {
      if (on_transit_data.length > 0) {
        const kc = on_transit_data.filter((v) => v.uploadedBy === d);
        const ck = map_provision.find((v) => v.uploadedBy === d);

        if (kc.length > 0) {
          const s = kc.filter((c) => c.phase === '1-Phase');
          const t = kc.filter((c) => c.phase === '3-Phase');

          const single = myFunc(s.length > 0 ? s.map((w) => w.pop) : []);
          const three = myFunc(t.length > 0 ? t.map((w) => w.pop) : []);
          const total = myFunc(kc.map((r) => r.pop));

          map_provision_with_transit.push({
            ...ck,
            single_phase_on_transit: single,
            three_phase_on_transit: three,
            total_on_transit: total,
          });
        } else if (ck) {
          map_provision_with_transit.push({
            ...ck,
            single_phase_on_transit: 0,
            three_phase_on_transit: 0,
            total_on_transit: 0,
          });
        }
      }
    });

    const rs = {
      map_: mp.length,
      disco: ds.length,
      disco_total_uploads,
      map_total_uploads,
      total_meter,
      metered_applicant,
      unmetered_applicant,
      disco_allocations,
      map_allocation,
      total_meter_applicant: applied,
      installation_count,
      installation_data,
      metersOnTransitCount: on_transit_count,
      on_transit_data,
      unAllocatedMeterCount:
        map_total_uploads - (disco_total_uploads + on_transit_count),
      assets_no_phase,
      assets_with_phases,
      assets_exchange,
      assets_exchange_match: allocation_unique_data,
      meters_transit: map_provision_with_transit,
      disco_provision,
    };
    return rs;
  } else return tables;
};

module.exports = CBS_Aggs;
