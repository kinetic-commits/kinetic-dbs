const CreateUserAddress = {
  user_email: {
    type: String,
    rkey: 'references user_data (email)',
    required: 'User email is required',
  },
  street_number: String,
  street_name: String,
  area_name: String,
  city: String,
  province: String,
  country: String,
  location_coords: String,
  lat: String,
  lng: String,
};

module.exports = CreateUserAddress;
