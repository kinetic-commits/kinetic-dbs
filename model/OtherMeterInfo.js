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
  after_installation_image: String,
  before_installation_image: String,
  needs_replacement: Boolean,
  replacement_reason: String,
  replace_with_id: String,
  replace_acknowledged: Boolean,
  faulty_meter_image: String,
  map_snap_shot: String,
  disco_snap_shot: String,
  replacement_meter_image: String,
}

module.exports = createOtherMeterInfo
