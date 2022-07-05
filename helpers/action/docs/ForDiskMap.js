const { gUnq, sum } = require('../../essential');
const getAllMetersForMapUser = require('../docs_helper/ForDskM');

const DISK_MAP = (async = async ({ req }) => {
  const { AA } = await getAllMetersForMapUser(req);

  const aloh = gUnq({
    array: AA.filter((a) => a.allocatedTo),
    field: 'phase',
    single: '1-Phase',
    three: '3-Phase',
  });

  const alo = aloh.summary;

  const phs = gUnq({
    array: AA,
    field: 'phase',
    single: '1-Phase',
    three: '3-Phase',
  }).summary;

  const insl = gUnq({
    array: AA,
    field: 'isInstalled',
    single: true,
    main: 'installed',
    three: false,
    sub: 'uninstalled',
  });

  // Append Allocations Add to Phases Ezekiel 6:10-12
  const formTable = phs.map((b) => {
    const inslC = insl.single
      ? insl.single.filter((f) => f.phase === '1-Phase' && f.name === b.name)
      : [];
    const inslT = insl.three
      ? insl.three.filter((f) => f.phase === '3-Phase' && f.name === b.name)
      : [];
    const aloC =
      alo.length > 0 ? alo.filter((f) => f.provider === b.provider) : [];

    return {
      ...b,
      allocations: sum({ array: aloC, field: 'total' }),
      installations:
        sum({ array: inslC, field: 'pop' }) +
        sum({ array: inslT, field: 'pop' }),
      singleInstallation: sum({ array: inslC, field: 'pop' }),
      threeInstallation: sum({ array: inslT, field: 'pop' }),
      allocationDetail: [...aloh.three, ...aloh.single],
    };
  });

  return formTable;
});

module.exports = { DISK_MAP };
