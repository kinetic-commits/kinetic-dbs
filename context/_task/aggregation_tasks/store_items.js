const { ND } = require('../../../helpers/Types')
const Metering = require('../../../model/Meter_Data')
const { myFunc } = require('../../essentials/usables')
const {
  meter_data_parser,
  body_recognition,
} = require('../bodyApplicationParser')
const { parse_num } = require('./aggregation_tools')

async function StoreDetails(req) {
  const { QUERIES: q, user } = req
  const { role, abbrv } = q

  const who_s_visting =
    role === ND()
      ? {
          map_allocation_to: abbrv,
          allocation_status: 'Allocated',
          disco_acknowledgement: true,
          disco_allocation_to: 'undefined',
        }
      : { uploaded_by: abbrv, allocation_status: 'In store' }

  const st = await Metering.aggregate({
    where: { ...who_s_visting },
    group: { destination_store: '_id' },
    _id: 'destination_store',
    id_name: 'total',
  })

  const org =
    st[0] == null
      ? st
      : st.map((el) => {
          return parse_num({ ...el, map: user.abbrv }, 'total')
        })
  return org
}

const GetStoreItems = async (req) => {
  const { QUERIES: q } = req
  const { role, abbrv } = q
  const { destination_store } = body_recognition(q.queries)
  const who_s_visting =
    role === ND()
      ? {
          map_allocation_to: abbrv,
          allocation_status: 'Allocated',
          disco_acknowledgement: true,
          disco_allocation_to: 'undefined',
          destination_store,
        }
      : {
          uploaded_by: abbrv,
          allocation_status: 'In store',
          destination_store,
        }

  const st = await Metering.aggregate({
    where: { ...who_s_visting },
    group: {
      destination_store: '_id',
      phase: 'phase',
      meter_owner: 'meter_owner',
      default_unit: 'default_unit',
      carton_id: 'carton_id',
      store_id: 'store_id',
    },
    _id: 'destination_store',
  })

  const utie =
    st.length > 0
      ? st.map((el) => {
          return meter_data_parser(el)
        })
      : []
  const ut = {
    each: utie.length > 0 ? utie.filter((v) => v.pop > 0) : [],
    all: {
      singlePhase: myFunc(
        utie.filter((d) => d.phase === '1-Phase').map((e) => e.pop)
      ),
      threePhase: myFunc(
        utie.filter((d) => d.phase === '3-Phase').map((e) => e.pop)
      ),
      md: 0,
      total: myFunc(utie.map((d) => d.pop)),
    },
  }
  return ut
}

const getStoreDetails = async (req) => {
  const { QUERIES: q } = req

  if (q.search === 'STORE') return StoreDetails(req)
  else if (q.search === 'ITEMS') return GetStoreItems(req)
}
module.exports = getStoreDetails
