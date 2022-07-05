const { myFunc } = require('../../essential');
const QUERIES = require('../../Queries');

async function applicant({ req }) {
  const { abbrv } = QUERIES(req);
  const gg = await User.aggregate([
    { $match: { role: 'DISCO' } },
    { $group: { _id: '$abbrv' } },
  ]);

  const appli = await Form74.aggregate([
    { $match: { customerId: { $exists: true } } },
    {
      $group: {
        _id: {
          registered: '$hasAppliedForMeter',
          isVerified: '$isCertified',
          isCancelled: '$isCancelled',
          allocation: '$hasAllocation',
          hasVended: '$hasVended',
          installation: '$meterInstalled',
          disco: '$disco',
        },
        pop: { $sum: 1 },
      },
    },
  ]);

  const bc = untie(appli);

  const gd = gg.map((io) => {
    const registered = bc.filter(
      (i) =>
        i.registered && io._id === i.disco && i.isVerified && i.installation
    );
    const beingProcessed = bc.filter(
      (i) => i.isVerified && io._id === i.disco && !i.allocation
    );
    const cancelled = bc.filter(
      (i) => i.isCancelled === true && io._id === i.disco
    );
    const allocation = bc.filter(
      (i) => i.allocation === true && io._id === i.disco
    );

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

module.exports = applicant;
