const { GetUniques } = require('../../context/essentials/usables')

const OutGoingForMeter = (table, id) => {
  const un = GetUniques(table.map((b) => b[id]))
  const tabl = un.map((d) => {
    const user = table.filter((a) => a[id] === d)
    const data = user[0] || {}
    const forOne =
      user.length > 0
        ? {
            sequence: data.sequence || '',
            capacity: data.capacity || '',
            category: data.category || '',
            volt: data.volt || '',
            meterNumber: data.meter_number || '',
            meterType: data.meter_type || '',
            meterSeries: data.meter_series || '',
            phase: data.phase || '',
            meterSerialNumber: data.meter_serial_number || '',
            meterModel: data.meter_model || '',
            cartonID: data.carton_id || '',
            meterMake: data.meter_make || '',
            meterOwner: data.meter_owner || '',
            defaultUnit: data.default_unit || '',
            destinationStore: data.destination_store || '',
            prepaidMeterType: data.prepaid_meter_type || '',
            storeAddress: data.store_address || '',
            storeManagerContact: data.store_manager_contact || '',
            storeManagerName: data.store_manager_name || '',
            storeID: data.store_id || '',
            allocationStatus: data.allocation_status || '',
            allocatedTo: data.disco_allocation_to || '',
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
          }
        : {}

    return forOne
  })
  return tabl
}

const OutGoingForCustomer = (table, id) => {
  if (!table || table.length === 0) return []

  const un = GetUniques(table.map((b) => b[id]))
  const tabl = un.map((d) => {
    const user = table.filter((a) => a[id] === d)
    const data = user[0] || {}
    const forOne =
      user.length > 0
        ? {
            customer_id: data._id,
            fname: data.fname || '',
            lname: data.lname || '',
            fullName: ads_getters(data).fullName,
            buildingAddress: ads_getters(data).buildingAddress,
            telephone: data.telephone || '',
            identityID: data.identity_id || '',
            identityType: data.identity_type || '',
            gender: data.gender || '',
            email: data.email || '',
            streetNumber: data.street_number || '',
            streetName: data.street_name || '',
            busStop: data.bus_stop || '',
            landMark: data.land_mark || '',
            lga: data.lga || '',
            state: data.state || '',
            nationality: data.nationality || '',
            locationCoords: data.location_coords || '',
            _center: data._center || '',
            geoCode: data.geo_code || '',
            areaCode: data.area_code || '',
            LAT: data.lat || '',
            LONG: data.lng || '',
            propertyImage: data.property_image || '',
            phase: data.phase || '',
            buildingType: data.building_type || '',
            buildingActivity: data.building_activity || '',
            buildingUse: data.building_use || '',
            volt: data.volt || '',
            areaType: data.area_type || '',
            propertyOwnerName: data.property_owner_name || '',
            propertyOwnerContact: data.property_owner_contact || '',
            occupantName: data.occupant_name || '',
            occupantContact: data.occupant_contact || '',
            occupantIdMeans: data.occupant_id_means || '',
            occupantRole: data.occupant_role || '',
            occupantEmail: data.occupant_email || '',
            buildingStructure: data.building_structure || '',
            meterNumber: data.meter_number || '',
            meterInstalled: data.meter_installed || false,
            meterOwner: data.meter_owner || '',
            preferredMeterPhase: data.meter_phase || '',
            discoName: data.disco || '',
            isCertified: data.is_certified || false,
            isCancelled: data.is_cancelled || false,
            hasPriority: data.has_priority || false,
            hasAllocation: data.has_allocation || false,
            createAt: data.create_at,
          }
        : {}

    return forOne
  })
  return tabl
}

const OutGoingForUser = (table, id) => {
  const un = GetUniques(table.map((b) => b[id]))

  const tabl = un.map((d) => {
    const user = table.filter((a) => a[id] === d)
    const info = user[0] || {}
    const forOne =
      user.length > 0
        ? {
            ...info,
            createAt: info.create_at,
            fullName: ads_getters(info).fullName,
            buildingAddress: ads_getters(info).buildingAddress,
            franchiseStates: info.states ? info.states.split(',') : [],
          }
        : {}
    return forOne
  })
  return tabl
}

const loggerTableOutgoing = (table) => {
  const un = GetUniques(table.map((b) => b.logger_id))
  const tabl = un.map((d) => {
    const user = table.filter((a) => a.logger_id === d)
    const info = user[0] || {}
    const forOne =
      user.length > 0
        ? {
            sender: info.sender || '',
            receiver: info.receiver || '',
            loggerID: info.logger_id || '',
            stageStatus: info.state_status || '',
            loggerType: info.logger_type || '',
            uniqueID: info.unique_id || '',
            message: info.message || '',
            uploadedBy: info.uploaded_by || '',
            isRead: info.is_read || '',
            createdAt: info.create_at || '',
            comment: info.comment || '',
          }
        : {}
    return forOne
  })
  return tabl
}

function ads_getters(obj = {}) {
  const {
    street_number,
    street_name,
    city,
    area_name,
    state,
    province,
    nationality,
    fname,
    lname,
  } = obj
  const ste = state || province
  const stner =
      street_name && street_name !== 'undefined' ? street_name : undefined,
    stn =
      street_name && street_number !== 'undefined' ? street_number : undefined,
    c = city && city !== 'undefined' ? city : undefined,
    ar = area_name && area_name !== 'undefined' ? area_name : undefined,
    te = ste && ste !== 'undefined' ? ste : undefined,
    na = nationality && nationality !== 'undefined' ? nationality : 'Nigeria',
    f = fname && fname !== 'undefined' ? fname : undefined,
    ln = lname && lname !== 'undefined' ? lname : undefined
  let address, fullName;
  if (stner && stn && ar && c && te && na) {
    address = stn + ' ' + stner + ', ' + ar + ' ' + c + ', ' + te + ', ' + na
  } else if (stner && stn && c && te && na) {
    address = stn + ' ' + stner + ', ' + c + ', ' + te + ', ' + na
  } else if (stner && stn && te && na) {
    address = stn + ' ' + stner + ', ' + te + ', ' + na
  } else if (stner && te && na) {
    address = stner + ', ' + te + ', ' + na
  }else if(te && na){
    address = te + ', ' + na
  }else address = na;

  if(f && ln) fullName = f + ' ' + ln
  else if(f && !ln) fullName = f;
  else if(!f && ln) fullName = ln;
  else fullName = f;

  return { buildingAddress: address, fullName }
}

module.exports = {
  OutGoingForMeter,
  OutGoingForCustomer,
  OutGoingForUser,
  loggerTableOutgoing,
}
