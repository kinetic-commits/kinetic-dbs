const { FIRSTCLASS } = require('../../../helpers/Types')
const FIELD_ACTIVITIES = require('../../events/calls/re_tpp')
const MobileActivities = require('../mobile_activities')
const { agg_returns } = require('./aggregation_tools')
const CBS_Aggs = require('./cbs_dashboard')
const exception_anomally = require('./exceptions')
const map_dashboard_config = require('./map_dashboard')
const getStoreDetails = require('./store_items')

const Aggregation_Functional_Component = async ({ req, message }) => {
  const { QUERIES: q } = req
  const stores = ['ITEMS', 'STORE']
  const web = ['DISK-MAP', 'DISK']
  const mobile = ['METER-INSTALLATION', 'VERIFY-PROPERTY', 'FROM-INSTALLER']
  const field = ['FAULT', 'REPLACEMENT', 'FAULT-ACKNOWLEDGE']

  if (stores.includes(q.search)) {
    const v = await getStoreDetails(req)
    return agg_returns(v, message)
  } else if (FIRSTCLASS().includes(q.role) && q.search === 'CBS') {
    const v = await CBS_Aggs(req)
    return agg_returns(v, message)
  } else if (web.includes(q.search)) {
    const v = await map_dashboard_config({ req })
    return agg_returns(v, message)
  } else if (mobile.includes(q.search)) return MobileActivities(req, message)
  else if (field.includes(q.search)) return FIELD_ACTIVITIES(req, message)
  else if (q.search === 'VIEW') {
    const v = await exception_anomally(req)
    return agg_returns(v, message)
  }
}

module.exports = Aggregation_Functional_Component
