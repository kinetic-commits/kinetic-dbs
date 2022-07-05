const postgoose = require('../posgoose/Postgoose');
const { OutGoingForMeter } = require('./in_&_outs/OutgoingData');
const createMeterActivities = require('./Meter_Activities');
const createOtherMeterInfo = require('./OtherMeterInfo');

const Metering = new postgoose();

Metering.Schema({
  meter_number: {
    type: String,
    pkey: true,
    len: 12,
    required: 'Meter number ID is required',
  },
  phase: String,
  meter_type: String,
  meter_model: String,
  meter_series: String,
  meter_serial_number: String,
  meter_make: String,
  carton_id: { type: String, required: 'Carton ID is required' },
  sequence: String,
  capacity: String,
  meter_digit: String,
  category: String,
  volt: String,
  default_unit: Number,
  prepaid_meter_type: String,
  meter_owner: { type: String, required: 'Meter provider name is required' },
});

Metering.getChildEntries([
  {
    parentID: 'meter_number',
    ref: 'meter_id',
    table: 'meter_activities',
    item: createMeterActivities,
  },
  {
    parentID: 'meter_number',
    ref: 'meter_id',
    table: 'other_meter_info',
    item: createOtherMeterInfo,
  },
]);

Metering.outGoings(undefined, OutGoingForMeter);

Metering.model('meter_data');

module.exports = Metering;
