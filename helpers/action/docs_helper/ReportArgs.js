const { aggregate } = require('../../../context/essentials/Sentials');
const { GetUniques, sum, myFunc } = require('../../essential');
const { exceptions } = require('./ForAggregates');

const getAllExceptions = async () => {
  const args = await aggregate(exceptions);

  if (args.length > 0) {
    const ech = GetUniques(args.map((v) => `${v.provider}:${v.disconame}`));
    const r_ = args.map((d) => {
      return { ...d, pop: +d.pop };
    });

    const rs = ech.map((d) => {
      const ho2 = d.split(':');

      const isR = r_.filter(
        (a) => a.isreceived && a.provider === ho2[0] && a.disconame === ho2[1]
      );
      const isF = r_.filter(
        (a) =>
          a.isreceived === false &&
          a.provider === ho2[0] &&
          a.disconame === ho2[1]
      );
      const snt = [...isF, ...isR];
      const ist = isR.length > 0 ? isR : [];
      const b_snt = myFunc(snt.map((n) => n.pop));
      const r_ist = myFunc(ist.map((n) => n.pop));

      return {
        from: ho2[0],
        to: ho2[1],
        sent: b_snt,
        receive: r_ist,
        diff: b_snt - r_ist,
      };
    });

    return rs;
  } else return [];
};

module.exports = { getAllExceptions };
