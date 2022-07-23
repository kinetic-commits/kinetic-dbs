const { NM, FIRSTCLASS, CREATE_URL } = require('../../helpers/Types')
const { makeObject } = require('../../posgoose/tool')
const generateString = require('../../utils/GenKeys')
const { _accountID: _ide } = require('../../utils/idGen')
const { isArray } = require('../essentials/usables')

const bodyAppParser = (req) => {
  const rs = ['POST', 'PUT', 'PATCH', 'DELETE']
  const ID = _ide()
  const { originalUrl: url, method } = req
  const _ = CREATE_URL === url && method === 'POST'
  req.main = req.body
  if (rs.includes(method)) {
    const user = req.user || {}
    const av = user ? user.abbrv : undefined
    const ue = user ? user.email : undefined

    const body = isArray(req.body) ? req.body : [req.body]

    const bum = body.map((data) =>
      app_parser({
        ...data,
        av,
        ue,
        store_id: data.store_id || ID,
        role: _ || user.role === 'ADMIN' ? data.role : user.role,
        user_key: _ ? generateString(50) : undefined,
        admin_key: _
          ? data.role === 'ADMIN'
            ? generateString(95)
            : undefined
          : undefined,
      })
    )

    const done = bum.map((c) => makeObject([c]))

    return isArray(req.body) ? done : done[0]
  } else return undefined
}

const app_parser = (data, ign) => {
  const { av, ue, abbrv, email, role } = data || {}
  const who = abbrv || (av && !ign) ? (abbrv || av).toUpperCase() : undefined
  const who_email = email || (ue && !ign) ? email || ue : undefined
  const allocated_to = data.allocation_to || data.allocationTo
  const role_ = [NM(), ...FIRSTCLASS()].includes(role) ? who : undefined

  return {
    sequence: data.sequence || undefined,
    capacity: data.capacity || undefined,
    category: data.category || undefined,
    volt: data.volt || undefined,
    meter_number: data.meterNumber || data.meter_number,
    meter_type: data.meterType || data.meter_type,
    meter_series: data.meterSeries || data.meter_series,
    phase: data.phase || data.phase,
    meter_serial_number: data.meterSerialNumber || data.meter_serial_number,
    meter_model: data.meterModel || data.meter_model,
    carton_id: data.cartonID || data.carton_id,
    meter_make: data.meterMake || data.meter_make,
    meter_owner:
      data.meterOwner || data.meter_owner
        ? (data.meterOwner || data.meter_owner).toUpperCase()
        : undefined,
    default_unit: data.defaultUnit || data.default_unit,
    destination_store: data.destinationStore || data.destination_store,
    prepaid_meter_type: data.prepaidMeterType || data.prepaid_meter_type,
    store_address: data.storeAddress || data.store_address,
    store_manager_contact:
      data.storeManagerContact || data.store_manager_contact,
    store_manager_name: data.storeManagerName || data.store_manager_name,
    store_id: data.storeID || data.store_id,
    meter_id: data.meterNumber || data.meter_number,
    _id: data.customerID || data.customer_id,
    customer_id: data.customerID || data.customer_id,
    allocation_customer_id:
      data.allocation_customer_id || data.allocationCustomerID,

    fname: data.fname || undefined,
    lname: data.lname || undefined,
    telephone: data.telephone1 || data.telephone,
    identity_id: data.identityID || data.identity_id || data.identity_number,
    identity_type: data.identityType || data.identity_type,
    gender: data.gender || undefined,
    city: data.city || undefined,
    email: data.email || undefined,
    street_number: data.streetNumber || data.street_number,
    street_name: data.streetName || data.street_name,
    area_name: data.areaName || data.area_name,
    bus_stop: data.busStop || data.bus_stop,
    land_mark: data.landMark || data.land_mark,
    lga: data.lga || undefined,
    state: data.state || undefined,
    nationality: data.nationality || undefined,
    location_coords: data.locationCoords || data.location_coords,
    _center: data._center || undefined,
    geo_code: data.geoCode || data.geo_code,
    area_code: data.areaCode || data.area_code,
    lat: data.LAT || data.lat,
    lng: data.LONG || data.lng,
    property_image: data.propertyImage || data.property_image,
    building_type: data.buildingType || data.building_type,
    building_activity: data.buildingActivity || data.building_activity,
    building_use: data.buildingUse || data.building_use,
    area_type: data.areaType || data.area_type,
    property_owner_name: data.propertyOwnerName || data.property_owner_name,
    property_owner_contact:
      data.propertyOwnerContact || data.property_owner_contact,
    occupant_name: data.occupantName || data.occupant_name,
    occupant_contact: data.occupantContact || data.occupant_contact,
    occupant_id_means: data.occupantIdMeans || data.occupant_id_means,
    occupant_role: data.occupantRole || data.occupant_role,
    occupant_email: data.occupantEmail || data.occupant_email,
    building_structure: data.buildingStructure || data.building_structure,
    meter_installed: data.meterInstalled || data.meter_installed,
    meter_phase:
      data.preferredMeterPhase ||
      data.preferred_meter_phase ||
      data.meter_phase,
    disco: data.discoName || who || false,
    is_certified: data.isCertified || data.is_certified,
    is_cancelled: data.isCancelled || data.is_cancelled,
    has_priority: data.hasPriority || data.has_priority,
    has_allocation: data.hasAllocation || data.has_allocation,
    allocation_to: allocated_to || data.allocatedTo,
    province: data.state || data.province,
    abbrv: who,
    role: data.role || undefined,
    country: data.nationality || data.country,
    password: data.password || undefined,
    password1: data.password1 || undefined,
    confirm_password: data.confirm_password || undefined,
    states:
      data.franchise_states || data.franchiseStates || data.franchisestates,
    franchiseStates: data.franchiseStates || data.states,
    // email_verified: false,
    sender: data.sender || undefined,
    receiver: data.receiver || undefined,
    stage_status: data.stateStatus || data.stage_status,
    logger_type: data.loggerType || data.logger_type,
    message: data.message || undefined,
    is_read: data.isRead || data.is_read,
    create_at: data.createAt || data.create_at,
    comment: data.comment || undefined,
    limit: (typeof data.limit === 'string' ? +data.limit : data.limit) || 1000,
    max: data.max || 200000,
    mean: 20000,
    offset: data.offset || 0,
    uploaded_by: role ? (role === 'MAP' ? who : undefined) : undefined,
    map_allocation_to: data.map_allocation_to,
    disco_allocation_to: data.disco_allocation_to,
    disco_acknowledgement_by: data.disco_acknowledgement_by,
    disco_acknowledgement: data.disco_acknowledgement,
    allocation_status: data.allocation_status,
    user_email: data.user_email || ue || who_email,
    replacement_reason: data.replacement_reason || data.replacementReason,
    replace_with_id: data.replace_with_id || data.replaceWithId,
    needs_replacement: false,
    replace_acknowledged: false,
    unique_id: data.unique_id,
    shared_profile: data.shared_profile,
    parent_user: data.parent_user,
    user_key: data.user_key,
    admin_key: data.admin_key,
    right_to_share_profile: data.right_to_share_profile,
  }
}

const _meters = (data, role) => {
  const mapAllocationTo = data.map_allocation_to
    ? data.map_allocation_to !== 'undefined'
      ? data.map_allocation_to
      : undefined
    : undefined
  const discoAllocationTo = data.disco_allocation_to
    ? data.disco_allocation_to !== 'undefined'
      ? data.disco_allocation_to
      : undefined
    : undefined

  const allocationStatus = data.allocation_status
    ? data.allocation_status !== 'undefined'
      ? data.allocation_status
      : undefined
    : undefined

  const installationStatus = data.installation_status
    ? data.installation_status !== 'undefined'
      ? data.installation_status
      : undefined
    : undefined

  const role_ =
    role === 'DISCO'
      ? allocationStatus === 'Allocated' && !discoAllocationTo
        ? 'In store'
        : allocationStatus
      : allocationStatus

  return {
    sequence: data.sequence,
    capacity: data.capacity,
    category: data.category,
    volt: data.volt,
    meterNumber: data.meter_number,
    meterType: data.meter_type,
    meterSeries: data.meter_series,
    phase: data.phase,
    pop: typeof data.pop === 'string' ? +data.pop : data.pop,
    total: typeof data.total === 'string' ? +data.total : data.total,
    meterModel: data.meter_model,
    cartonID: data.carton_id,
    meterMake: data.meter_make,
    meterOwner: data.meter_owner,
    defaultUnit: data.default_unit,
    destinationStore: data.destination_store,
    prepaidMeterType: data.prepaid_meter_type,
    storeAddress: data.store_address,
    storeManagerContact: data.store_manager_contact,
    storeManagerName: data.store_manager_name,
    storeID: data.store_id,
    allocationStatus: data.allocation_status,
    allocatedTo:
      data.disco_allocation_to || data.allocatedTo || data.allocated_to,
    mapAllocationTo,
    discoAllocationTo,
    allocationStatus: role_,
    installationStatus,
    uploadedBy: data.uploaded_by,
    isReceived: role === 'MAP' ? true : data.disco_acknowledgement,
    meterOwner: data.meter_owner,
    phase: data.phase,
    discoUpload: data.disco_acknowledgement_by,
    replacementComment: data.replacement_reason,
    replacementMeterNumber: data.replace_with_id,
    afterInstallationImage: data.after_installation_image,
    beforeInstallationImage: data.before_installation_image,
    discoSnapShot: data.disco_snap_shot,
    mapSnapShot: data.map_snap_shot,
    faultyImage: data.faulty_meter_image,
    replacementImage: data.replacement_image,
    createAt: data.create_at,
    needsReplacement: data.needs_replacement,
    replaceAcknowledged: data.replace_acknowledged,
  }
}

const body_recognition = (data) => {
  const data_ = { ...data, av: undefined, ue: undefined }
  const check = app_parser(data_)
  const done = makeObject([check])
  return done
}

const meter_data_parser = (data, role) => {
  const check = _meters(data, role)
  const done = makeObject([check])
  return done
}

module.exports = { bodyAppParser, body_recognition, meter_data_parser }
