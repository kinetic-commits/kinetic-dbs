const { aggregate } = require('../../../context/essentials/Sentials');
const { gUnq, sum, GetUniques, myFunc } = require('../../essential');
const { FIRSTCLASS } = require('../../Types');
const {
  getApplicationsAndActiveUsers,
  getDiscoMapAndTransitItems,
} = require('../docs_helper/ForAnalysis');

const ANALYSIS = async ({ req }) => {
  const { user } = req.QUERIES;

  if (!FIRSTCLASS().includes(user.role))
    return { error: 'Unrecognize user', code: 401 };

  // Users Declarations
  const us = await aggregate(`
        select count(*) as pop, role, abbrv 
        from other_user_info
        where role = 'DISCO' OR role = 'MAP'
        group by role, abbrv
     `);
  const users =
    us.length > 0
      ? us.map((d) => {
          return { role: d.role, abbrv: d.abbrv, pop: +d.pop };
        })
      : [];

  const { ds, mp, cs_al, cs_ap, cs_in } = await getApplicationsAndActiveUsers(
    users
  );

  //  ************************ALLOCATIONS*************************************
  const { disco_alo, map_alo, transit } = await getDiscoMapAndTransitItems();

  // Triming DISCO
  const mps = gUnq({
    array: map_alo,
    field: 'phase',
    three: '3-Phase',
    single: '1-Phase',
  });

  const dses = gUnq({
    array: disco_alo,
    field: 'phase',
    three: '3-Phase',
    single: '1-Phase',
  });

  const dalo = gUnq({
    array: disco_alo,
    field: 'status',
    single: 'In store',
    three: 'Allocated',
    main: 'store',
    sub: 'allocated',
  });

  const instl = gUnq({
    array: disco_alo,
    field: 'status',
    single: 'Allocated',
    three: 'Installed',
    main: 'allocated',
    sub: 'installed',
  });

  //Untie
  const tie = gUnq({
    array: [...dalo.three],
    field: 'phase',
    three: '3-Phase',
    single: '1-Phase',
  }).summary;

  const tie0 = gUnq({
    array: [...instl.three],
    field: 'phase',
    three: '3-Phase',
    single: '1-Phase',
  }).summary;

  const aler = gUnq({
    array: transit,
    field: 'phase',
    three: '3-Phase',
    single: '1-Phase',
  }).summary;

  // TABLE CREATION DISCO
  let ds_table = [{}];

  if (dses.summary.length > 0) {
    const dse = [...dses.single, ...dses.three];
    const names = GetUniques(dse.map((f) => f.name));
    const providers = GetUniques(dse.map((f) => f.provider));

    const t = names.map((b) => {
      const alo = tie.filter(
        (s) => s.name === b && providers.includes(s.provider)
      );
      const isl = tie0.filter(
        (s) => s.name === b && providers.includes(s.provider)
      );

      const tt = dse.filter(
        (s) => s.name === b && providers.includes(s.provider)
      );
      const alero = aler.filter(
        (s) => s.allocatedTo === b && providers.includes(s.provider)
      );

      return tt.map((x) => {
        const inlS = isl.find(
          (ep) => ep.name === x.name && ep.provider === x.provider
        );

        const aloS = alo.find(
          (ep) => ep.name === x.name && ep.provider === x.provider
        );

        const eroS = alero.find(
          (ep) => ep.allocatedTo === x.name && ep.provider === x.provider
        );

        return {
          storeThree: x
            ? sum({
                array: tt.filter(
                  (vb) =>
                    vb.name === x.name &&
                    vb.provider === x.provider &&
                    vb.phase === '3-Phase'
                ),
                field: 'pop',
              })
            : 0,
          storeSingle: x
            ? sum({
                array: tt.filter(
                  (vb) =>
                    vb.name === x.name &&
                    vb.provider === x.provider &&
                    vb.phase === '1-Phase'
                ),
                field: 'pop',
              })
            : 0,

          name: x ? x.name : '',

          provider: x ? x.provider : '',

          storeTotal: x
            ? sum({
                array: tt.filter(
                  (vb) => vb.name === x.name && vb.provider === x.provider
                ),
                field: 'pop',
              })
            : 0,

          allocationSingle: aloS ? aloS.single : 0,
          allocationThree: aloS ? aloS.three : 0,
          allocationTotal: aloS ? aloS.total : 0,

          installationSingle: inlS ? inlS.single : 0,
          installationThree: inlS ? inlS.three : 0,
          installationTotal: inlS ? inlS.total : 0,

          transitSingle: eroS ? eroS.single : 0,
          transitThree: eroS ? eroS.three : 0,
          transitTotal: eroS ? eroS.total : 0,
        };
      });
    });

    const tx = [];
    if (t.length > 0) {
      for (let n = 0; n < t.length; n++) {
        if (t[n].length > 0) {
          t[n].map((d) => tx.push(d));
        } else tx.push(t[n]);
      }
    }

    ds_table = tx.length === 0 ? [{}] : tx;
  }

  // METER PROVIDERS
  // Triming
  const mpes = gUnq({
    array: map_alo,
    field: 'phase',
    three: '3-Phase',
    single: '1-Phase',
  });

  const malo = gUnq({
    array: map_alo,
    field: 'status',
    single: 'In store',
    three: 'Allocated',
    main: 'store',
    sub: 'allocated',
  });

  //Untie
  const mtie = gUnq({
    array: [...malo.three],
    field: 'phase',
    three: '3-Phase',
    single: '1-Phase',
  }).summary;

  const maler = gUnq({
    array: transit,
    field: 'phase',
    three: '3-Phase',
    single: '1-Phase',
  }).summary;

  // TABLE CREATION DISCO
  let mp_table = [{}];

  if (mpes.summary.length > 0) {
    const dse = mpes.summary;

    const names = GetUniques(dse.map((f) => f.name));
    const providers = GetUniques(dse.map((f) => f.provider));

    const t = names.map((b) => {
      const alo = mtie.filter(
        (s) => s.name === b && providers.includes(s.provider)
      );

      const tt = dse.filter(
        (s) => s.name === b && providers.includes(s.provider)
      );
      const alero = maler.filter(
        (s) => s.name === b && providers.includes(s.provider)
      );

      return tt.map((x) => {
        const aloS = alo.find(
          (ep) => ep.name === x.name && ep.provider === x.provider
        );

        const eroS = alero.find(
          (ep) => ep.name === x.name && ep.provider === x.provider
        );

        return {
          storeThree: x ? x.three : 0,
          storeSingle: x ? x.single : 0,
          name: x ? x.name : '',
          provider: x ? x.provider : '',
          storeTotal: x ? x.total : 0,

          allocationSingle: aloS ? aloS.single : 0,
          allocationThree: aloS ? aloS.three : 0,
          allocationTotal: aloS ? aloS.total : 0,

          transitSingle: eroS ? eroS.single : 0,
          transitThree: eroS ? eroS.three : 0,
          transitTotal: eroS ? eroS.total : 0,
        };
      });
    });

    mp_table = t.length > 0 ? t.map((d) => d[0]) : [{}];
  }

  // STATS
  const ds_table_ext =
    ds_table.length > 0
      ? GetUniques(
          ds_table.map((d) => {
            return `${d.provider}:${d.name}`;
          })
        )
      : undefined;

  const pip = ds_table_ext
    ? ds_table_ext.map((b) => {
        const prov = b.split(':')[0],
          recv = b.split(':')[1];
        const prvrev =
          ds_table.find((n) => n.provider === prov && n.name === recv) ||
          ds_table.find((n) => n.provider || n.name);

        return prvrev;
      })
    : undefined;

  const ds_mp = {
    discoPop: sum({ array: ds, field: 'pop' }),
    mapPop: sum({ array: mp, field: 'pop' }),
    applicants: sum({ array: cs_ap, field: 'pop' }),
    allocation: sum({ array: cs_al, field: 'pop' }),
    installed: sum({ array: cs_in, field: 'pop' }),
    mapUploads: sum({ array: map_alo, field: 'pop' }),
    discoUploads: sum({ array: disco_alo, field: 'pop' }),
    mapActivities:
      mps.summary.length > 0
        ? mps.summary.map((d) => {
            const disco = myFunc(
              dses.summary
                .filter((e) => e.provider === d.provider)
                .map((a) => a.total)
            );
            return { name: d.provider, view: d.total, value: disco };
          })
        : [{}],
    discoActivities:
      dalo.summary.length > 0
        ? dalo.summary.map((g) => {
            const disco = myFunc(
              dses.summary
                .filter((e) => e.provider === g.provider)
                .map((a) => a.total)
            );
            return {
              name: g.name,
              provider: g.provider,
              view: disco,
              value: g.allocated,
            };
          })
        : [{}],

    meterInfo: pip ? pip : ds_table,
    mapInfo: mp_table,
    transitMeters: maler,
    metersOnTransitCount: myFunc([
      ...mp_table.map((d) => (d ? d.transitTotal : 0)),
    ]),
    unAllocatedMeterCount:
      sum({ array: map_alo, field: 'pop' }) -
      myFunc([...mp_table.map((d) => (d ? d.allocationTotal : 0))]),
  };

  return ds_mp;
};

module.exports = ANALYSIS;
