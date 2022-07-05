const createOtherMeterInfo = {
  meter_id: {
    type: String,
    rkey: 'references meter_data (meter_number)',
    len: 12,
    required: 'Meter number ID is required',
  },
  destination_store: String,
  store_address: String,
  store_manager_name: String,
  store_manager_contact: String,
  store_id: String,
};

module.exports = createOtherMeterInfo;
