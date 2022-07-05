const CreateForm74Address = {
  user_email: {
    type: String,
    rkey: 'references user_data (email)',
  },
  customer_id: {
    type: String,
    pkey: true,
  },

  street_number: String,
  street_name: String,
  bus_stop: String,
  land_mark: String,
  lga: String,
  state: String,
  nationality: String,
  _center: String,
  geo_code: String,
  area_code: String,
  location_coords: String,
  lat: String,
  lng: String,
};

module.exports = CreateForm74Address;
