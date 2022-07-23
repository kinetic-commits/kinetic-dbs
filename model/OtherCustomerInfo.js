const { dateAndTime } = require('../utils/dateTime')

const CreateCustomerInfo = {
  user_email: {
    type: String,
    rkey: 'references user_data (email)',
  },
  customer_id: {
    type: String,
    pkey: true,
  },
  meter_number: String,
  meter_installed: {
    type: Boolean,
    default: false,
  },
  meter_owner: String,
  meter_phase: String,
  disco: {
    type: String,
    required: 'Document owner email is required',
  },
  allocation_date: 'Date',
  installation_date: 'Date',
  is_certified: {
    type: Boolean,
    default: false,
  },
  is_cancelled: {
    type: Boolean,
    default: false,
  },
  has_priority: {
    type: Boolean,
    default: false,
  },
  has_allocation: {
    type: Boolean,
    default: false,
  },
  create_at: {
    type: 'Date',
    default: dateAndTime().currentDate_time,
  },
}

module.exports = CreateCustomerInfo
