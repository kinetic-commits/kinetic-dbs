const NAVIGATION = require('../../../helpers/action/docs/navigation');
const { FIRSTCLASS } = require('../../../helpers/Types');
const MobileActivities = require('../mobile_activities');
const { agg_returns } = require('./aggregation_tools');
const CBS_Aggs = require('./cbs_dashboard');
const exception_anomally = require('./exceptions');
const map_dashboard_config = require('./map_dashboard');
const getStoreDetails = require('./store_items');

const Aggregation_Functional_Component = async ({ req, message }) => {
  const { QUERIES: q } = req;
  const stores = ['ITEMS', 'STORE'];
  const disk = ['DISK-MAP', 'DISK'];
  const web = ['DISK-MAP-WEB', 'DISK-WEB'];
  const mobile = ['METER-INSTALLATION', 'VERIFY-PROPERTY', 'FROM-INSTALLER'];

  if (stores.includes(q.search)) {
    const v = await getStoreDetails(req);
    return agg_returns(v, message);
  } else if (FIRSTCLASS().includes(q.role) && q.search === 'CBS') {
    const v = await CBS_Aggs(req);
    return agg_returns(v, message);
  } else if (web.includes(q.search)) {
    const v = await map_dashboard_config({ req });
    return agg_returns(v, message);
  } else if (mobile.includes(q.search)) return MobileActivities(req, message);
  else if (q.search === 'VIEW') {
    const v = await exception_anomally(req);
    return agg_returns(v, message);
  } else if (disk.includes(q.search)) {
    const v = await NAVIGATION({ req });
    return agg_returns(v, message);
  }
};

module.exports = Aggregation_Functional_Component;