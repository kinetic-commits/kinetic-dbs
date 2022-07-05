const { aggregate } = require('../../../model/meter_schema/MeterLogics');
const { myFunc, sum } = require('../../essential');
const QUERIES = require('../../Queries');
const { NM } = require('../../Types');
const {
  customer_aggregate_string,
  pickProperties,
} = require('../docs_helper/ForAggregates');

const OVERVIEW = async ({ req }) => {
  const { skip } = QUERIES(req);

  if (skip === 'DISCO' || skip === 'MAP') {
    const et = await skip_({ req });
    return et;
  }
  if (skip === 'DISCO-VIEW' || skip === 'MAP-VIEW') {
    const mt = await firstClass({
      schema: NM() === user.role ? Map : Disco,
    });
    return mt;
  } else if (skip === 'APPLICANT') {
    const applicn = await applicant(req);

    return applicn;
  }
  if (skip === 'EXCEPTION') {
    const exp = await exceptions(req);
    return exp;
  }
  if (skip === 'EXCEPTION-ALO') {
    const exp = await beacation(req);
    return exp;
  } else return undefined;
};

async function skip_({ req }) {
  const { skip } = QUERIES(req);

  const usr = await aggregate(`
        select count(*) as pop, child.abbrv, concat(main.fname, ' ', main.lname) as fullname, child.role, child.last_login_info
        from user_data as main
        left join other_user_info as child on main.email = child.user_email
        where role = '${skip}' 
        group by abbrv, fullname, role, last_login_info
    `);

  const users =
    usr.length > 0
      ? usr.map((d) => {
          return {
            name: d.abbrv,
            fullName: d.fullname,
            lastLogginDate: d.last_login_info,
            role: d.role,
          };
        })
      : [];

  //   const gg = await aggregate(`
  //         select count(*) as pop, abbrv as _id
  //         from other_user_info
  //         where role='${skip}'
  //         group by abbrv
  //     `);

  //   const where =
  //     skip === 'DISCO'
  //       ? `where map_allocation_to is not null and disco_acknowledgement_by is not null`
  //       : `where uploaded_by is not null`;

  //   const u__ = await aggregate(meter_aggregate_without_group_by(where));
  //   const trim = skip === NM() ? pickProvider(u__) : pickReceiver(u__);
  //   const upl =
  //     trim.length > 0
  //       ? trim.map((v) => {
  //           return { _id: skip === NM() ? v.providerName : v.discoName, ...v };
  //         })
  //       : [];
  //   const ar = await aggregate(customer_aggregate_string);

  //   const appl = skip === NM() ? upl : pickProperties(ar);

  //   const matched = gg.map((d) => {
  //     const df = upl.filter((e) => e._id === d._id);

  //     const allc = appl.filter((a) => a._id === d._id && a.allocation === true);
  //     const inl = appl.filter((a) => a._id === d._id && a.installed === true);

  //     return {
  //       role: skip,
  //       uploads: df.length > 0 ? sum({ field: 'pop', array: df }) : 0,
  //       name: d._id,
  //       allocated: allc ? sum({ field: 'pop', array: allc }) : 0,
  //       installations: inl ? sum({ field: 'pop', array: inl }) : 0,
  //     };
  //   });
  //

  const et = users.map((e) => {
    const { name, lastLogginDate, lastLogginTime, fullName } = e;
    // const kk = matched.filter((d) => d.name === name)[0];

    return {
      name,
      lastLogginDate,
      lastLogginTime,
      role: skip,
      fullName,
      //   meters: kk,
    };
  });

  return et;
}

async function firstClass({ schema, mainField, match }) {
  let cartonItem;

  const phases = await schema.aggregate([
    { $match: { phase: { $exists: true }, ...(match ? match : '') } },
    {
      $group: {
        _id: {
          phase: '$phase',
          owner: mainField ? `$${mainField}` : '$meterOwner',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const categories = await schema.aggregate([
    { $match: { category: { $exists: true }, ...(match ? match : '') } },
    {
      $group: {
        _id: {
          categories: '$category',
          owner: mainField ? `$${mainField}` : '$meterOwner',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const installations = await schema.aggregate([
    {
      $match: { allocationStatus: { $exists: true }, ...(match ? match : '') },
    },
    {
      $group: {
        _id: {
          status: '$allocationStatus',
          owner: mainField ? `$${mainField}` : '$meterOwner',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await schema.aggregate([
    { $match: { ...(match ? match : '') } },
    {
      $group: {
        _id: {
          installations: '$allocationStatus',
          categories: '$category',
          phases: '$phase',
          owners: mainField ? `$${mainField}` : '$meterOwner',
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const gOwners = getUniques(total.map((el) => el._id.owners));

  let array = [];

  for (let i = 0; i < gOwners.length; i++) {
    const sg = myFunc(
      phases
        .filter(
          (el) => el._id.phase === '1-Phase' && el._id.owner === gOwners[i]
        )
        .map((ae) => ae.count)
    );

    const th = myFunc(
      phases
        .filter(
          (el) => el._id.phase === '3-Phase' && el._id.owner === gOwners[i]
        )
        .map((ae) => ae.count)
    );

    const nonMD = myFunc(
      categories
        .filter(
          (el) => el._id.categories === 'Non-MD' && el._id.owner === gOwners[i]
        )
        .map((ae) => ae.count)
    );

    const MD = myFunc(
      categories
        .filter(
          (el) => el._id.categories === 'MD' && el._id.owner === gOwners[i]
        )
        .map((ae) => ae.count)
    );

    const installed = myFunc(
      installations
        .filter(
          (el) => el._id.status === 'Installed' && el._id.owner === gOwners[i]
        )
        .map((ae) => ae.count)
    );

    const uninstalled = myFunc(
      installations
        .filter(
          (el) => el._id.status === 'In store' && el._id.owner === gOwners[i]
        )
        .map((ae) => ae.count)
    );

    array.push({
      owners: gOwners[i],
      single: sg,
      three: th,
      all: sg + th,
      nonMD,
      MD,
      installed,
      uninstalled,
    });
  }

  cartonItem = array;

  return cartonItem;
}

async function applicant(req) {
  const usr = await aggregate(`
    select count(*) as pop, role, abbrv
    from other_user_info
    where role = 'DISCO' 
    group by role, abbrv
`);

  const users =
    usr.length > 0
      ? usr.map((d) => {
          return {
            _id: d.abbrv,
            role: d.role,
          };
        })
      : [];

  const ar = await aggregate(customer_aggregate_string);
  const ai = pickProperties(ar);
  const unames = ai.length > 0 ? ai.map((o) => o.name) : [];

  const bc = unames.map((g) => {
    const ei = ai.filter((c) => c.name === g);
    return ei.length > 0
      ? {
          registered: ei.length,
          isVerified: ei.filter((a) => a.isCertified).length,
          isCancelled: ei.filter((a) => a.isCancelled).length,
          allocation: ei.filter((a) => a.hasAllocation).length,
          hasVended: ei.filter((a) => a.hasVended).length,
          installation: ei.filter((a) => a.installed).length,
          disco: ei[0].name,
          pop: ei.length,
        }
      : [];
  });

  const gd = users.map((io) => {
    const registered = bc.filter(
      (i) => i.registered && io._id === i.disco && !i.allocation
    );

    const beingProcessed = bc.filter(
      (i) => i.isVerified && io._id === i.disco && !i.allocation
    );
    const cancelled = bc.filter((i) => i.isCancelled && io._id === i.disco);
    const allocation = bc.filter((i) => i.allocation && io._id === i.disco);

    const ow = bc.filter((b) => b.disco === io._id);

    return {
      registered: myFunc(registered.map((d) => d.pop)) || 0,
      beingProcessed: myFunc(beingProcessed.map((d) => d.pop)) || 0,
      cancelled: myFunc(cancelled.map((d) => d.pop)) || 0,
      allocation: myFunc(allocation.map((a) => a.pop)) || 0,
      disco: io._id,
      total: myFunc(ow.map((d) => d.pop)) || 0,
    };
  });

  return gd;
}

async function exceptions() {
  //   const exp = await _ana({
  //     schema: Order,
  //     match: { orderType: 'Meter upload error' },
  //     group: {
  //       _id: {
  //         uploader: '$meterOwnerRole',
  //         uploaderName: '$meterOwnerName',
  //         recipientName: '$recipientName',
  //         recipientRole: '$uploaderRole',
  //         title: '$orderType',
  //       },
  //       pop: { $sum: 1 },
  //     },
  //   });
  //   return exp.map((d) => {
  //     const { uploader, uploaderName, recipientName, recipientRole } = d._id;
  //     return { uploader, uploaderName, recipientName, recipientRole, pop: d.pop };
  //   });
}

async function beacation(req) {
  //   const { user } = QUERIES(req);
  //   const exp = await _ana({
  //     schema: Map,
  //     match: { meterNumber: { $exists: true } },
  //     group: {
  //       _id: {
  //         name: '$allocatedTo',
  //         provider: '$meterOwner',
  //       },
  //       pop: { $sum: 1 },
  //     },
  //   });
  //   const exp0 = await _ana({
  //     schema: Disco,
  //     match: { meterNumber: { $exists: true } },
  //     group: {
  //       _id: {
  //         provider: '$meterOwner',
  //         name: '$uploadedBy',
  //       },
  //       pop: { $sum: 1 },
  //     },
  //   });
  //   const dsep = untie(exp0);
  //   const mpep = untie(exp);
  //   return dsep.map((d) => {
  //     const ds = mpep.filter(
  //       (a) => a.provider === d.provider && a.name === d.name
  //     );
  //     return {
  //       from: d.provider,
  //       to: d.name,
  //       sent: sum({ array: ds, field: 'pop' }),
  //       receive: d.pop,
  //       diff: sum({ array: ds, field: 'pop' }) - d.pop,
  //     };
  //   });
}

module.exports = OVERVIEW;
