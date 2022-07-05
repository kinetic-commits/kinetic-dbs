const { NM, ND } = require('../../../helpers/Types');
const User = require('../../../model/UserData');
const { agg_returns } = require('../aggregation_tasks/aggregation_tools');
const { body_recognition } = require('../bodyApplicationParser');

const all_selection_queries = async (req, message) => {
  const { QUERIES: q } = req;
  const query_parser = body_recognition(q.queries, true);

  if (q.role === NM() && q.skip === 'ALLOCATE') {
    const rs_ = await User.find(query_parser);
    return agg_returns(rs_, message);
  } else if (q.role === ND() && q.skip === `ALLOCATE:${q.role}`) {
    const rs_ = await User.find(query_parser);
    const rs =
      rs_.length > 0
        ? rs_.map((d) => {
            const { franchiseStates, fullName, email, abbrv } = d;
            return { franchiseStates, fullName, email, abbrv };
          })
        : rs_;
    return agg_returns(rs, message);
  }
};

module.exports = all_selection_queries;
