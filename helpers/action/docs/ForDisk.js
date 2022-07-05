const { gUnq, sum } = require('../../essential');
const { getDiscoInfoAndForm74Info } = require('../docs_helper/forDsk');

const DISK = async ({ req }) => {
  const { AA, a0a, ha1, ha2 } = await getDiscoInfoAndForm74Info({ req });

  const phs = gUnq({
    array: AA,
    field: 'phase',
    single: '1-Phase',
    three: '3-Phase',
  }).summary;

  const alo = gUnq({
    array: a0a,
    field: 'hasAllocation',
    single: true,
    main: 'allocation',
    three: false,
    sub: 'noAllocation',
  });

  const insl = gUnq({
    array: a0a,
    field: 'installed',
    single: true,
    main: 'installed',
    three: false,
    sub: 'uninstalled',
  });

  // Append Allocations Add to Phases Ezekiel 6:10-12
  const formTable = phs.map((b) => {
    const aloC = alo.single
      ? alo.single.filter(
          (f) =>
            f.phase === '1-Phase' &&
            f.name === b.name &&
            f.provider === b.provider
        )
      : [];

    const aloT = alo.three
      ? alo.three.filter(
          (f) =>
            f.phase === '3-Phase' &&
            f.name === b.name &&
            f.provider === b.provider
        )
      : [];

    const inslC = insl.single
      ? insl.single.filter(
          (f) =>
            f.phase === '1-Phase' &&
            f.name === b.name &&
            f.provider === b.provider
        )
      : [];

    const inslT = insl.three
      ? insl.three.filter(
          (f) =>
            f.phase === '3-Phase' &&
            f.name === b.name &&
            f.provider === b.provider
        )
      : [];

    const alToIn = ha1.filter(
      (a) => a.parent === b.name && a.provider === b.provider
    );

    const alToUn = ha2.filter(
      (a) => a.parent === b.name && a.provider === b.provider
    );

    return {
      ...b,
      allocations:
        sum({ array: aloC, field: 'pop' }) + sum({ array: aloT, field: 'pop' }),
      installations:
        sum({ array: inslC, field: 'pop' }) +
        sum({ array: inslT, field: 'pop' }),
      customer: sum({ array: a0a, field: 'pop' }),
      singleAllocation: sum({ array: aloC, field: 'pop' }),
      threeAllocation: sum({ array: aloT, field: 'pop' }),
      singleInstallation: sum({ array: inslC, field: 'pop' }),
      threeInstallation: sum({ array: inslT, field: 'pop' }),

      installer: alToIn,
      office: alToUn,
    };
  });

  return formTable;
};

module.exports = DISK;
