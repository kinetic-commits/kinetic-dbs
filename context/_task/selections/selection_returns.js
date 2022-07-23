const { NM, ND } = require('../../../helpers/Types')
const Form74 = require('../../../model/CustomerData')
const User = require('../../../model/UserData')
const { strip } = require('../../essentials/usables')
const { agg_returns } = require('../aggregation_tasks/aggregation_tools')

const all_selection_queries = async (req, message) => {
  const { QUERIES: q, user } = req
  const bl = strip(user.franchiseStates)

  if (q.role === NM() && q.skip === 'ALLOCATE') {
    const params = `where role='${ND()}' and province in ${bl} and email_verified=true`
    const rs_ = await User.find(params)
    return agg_returns(rs_, message)
  } else if (q.role === ND() && q.skip === `ALLOCATE:${q.role}`) {
    const vp = strip(['MAP:INSTALLER', 'DISCO:INSTALLER', 'INSTALLER'])

    const rs_ = await User.find(
      `where role in ${vp} and province in ${bl} and email_verified=true`
    )
    const rs =
      rs_.length > 0
        ? rs_.map((d) => {
            const { franchiseStates, fullName, email, abbrv } = d
            return { franchiseStates, fullName, email, abbrv }
          })
        : rs_
    return agg_returns(rs, message)
  } else if (q.role === ND() && q.skip === `SHARED`) {
    const rs_ = await User.find(
      `where parent_user='${user.email}' and email_verified=true`
    )
    const rs =
      rs_.length > 0
        ? rs_.map((d) => {
            const { franchiseStates, fullName, email, abbrv } = d
            return { franchiseStates, fullName, email, abbrv }
          })
        : rs_
    return agg_returns(rs, message)
  } else if (q.role === 'SITE-VERIFICATION-OFFICER') {
    const rs_ = await Form74.find({ ...q.queries, customer_id: q.hasId })
    const rs =
      rs_.length > 0
        ? rs_.map((d) => {
            const { franchiseStates, fullName, email, abbrv } = d
            return { franchiseStates, fullName, email, abbrv }
          })
        : rs_
    return agg_returns(rs, message)
  }
}

module.exports = all_selection_queries
