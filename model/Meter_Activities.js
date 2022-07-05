const { dateAndTime } = require('../utils/dateTime');

const createMeterActivities = {
  meter_id: {
    type: String,
    rkey: 'references meter_data (meter_number)',
    len: 12,
    required: 'Meter number ID is required',
  },
  uploaded_by: {
    type: String,
    required: 'Document owner email is required',
  },
  disco_acknowledgement: {
    type: Boolean,
    default: false,
  },
  disco_acknowledgement_by: String,
  map_allocation_to: String,
  disco_allocation_to: String,
  installation_status: {
    type: Boolean,
    default: false,
  },
  installation_by: String,
  create_at: {
    type: 'Date',
    default: dateAndTime().currentDate_time,
  },
  allocation_status: { type: String, empty: true, default: 'In store' },
  property_ref_id: String,
};

module.exports = createMeterActivities;
