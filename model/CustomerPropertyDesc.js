const CreatePropertyDesc = {
  user_email: {
    type: String,
    rkey: 'references user_data (email)',
  },
  customer_id: {
    type: String,
    pkey: true,
  },

  property_image: String,
  phase: String,
  building_type: String,
  building_activity: String,
  building_use: String,
  volt: String,
  area_type: String,
  property_owner_name: String,
  property_owner_contact: String,
  occupant_name: String,
  occupant_contact: String,
  occupant_id_means: String,
  occupant_role: String,
  occupant_email: String,
  building_structure: String,
};

module.exports = CreatePropertyDesc;
