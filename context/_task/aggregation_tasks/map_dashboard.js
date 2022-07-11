const { NM, ND, FIRSTCLASS, NM_URL } = require('../../../helpers/Types')
const Form74 = require('../../../model/CustomerData')
const Metering = require('../../../model/Meter_Data')
const { GetUniques, myFunc } = require('../../essentials/usables')
const { meter_data_parser } = require('../bodyApplicationParser')
const {
  filter_two_values,
  generate_view,
  _cm,
  _gp,
} = require('./aggregation_tools')

const map_dashboard_config = async ({ req, rol_, meters, applicant }) => {
  const { QUERIES: q, baseUrl: url } = req
  const who = q.skip || q.abbrv
  const r = !q.skip ? q.role : NM_URL === url ? NM() : ND()
  const create_role = rol_ || r

  const who_s_visting = {
    ...(create_role === NM() || FIRSTCLASS().includes(create_role)
      ? { uploaded_by: who }
      : ''),
    ...(create_role === ND() || FIRSTCLASS().includes(create_role)
      ? {
          map_allocation_to: who,
          disco_acknowlegement_by: who,
          // allocation_status: 'Allocated',
        }
      : ''),
  }

  const _cm_query = { disco: who }
  const customer_record =
    create_role === ND()
      ? rol_
        ? applicant
        : await Form74.aggregate({ where: _cm_query, group: _cm })
      : undefined

  const cm_parse = customer_record
    ? customer_record.map((f) => {
        return {
          mapAllocationTo: f.disco,
          installationStatus: f.meter_installed,
          meterOwner: f.meter_owner !== 'undefined' ? f.meter_owner : undefined,
          disco: f.disco,
          phase: f.meter_phase,
          hasAllocation: f.has_allocation,
          pop: typeof f.pop === 'string' ? +f.pop : f.pop,
        }
      })
    : undefined

  const uploads = rol_
    ? meters
    : await Metering.aggregate({
        where: who_s_visting,
        group: _gp,
      })
  // console.log(uploads);
  const utie =
    uploads.length > 0
      ? uploads.map((el) => meter_data_parser(el, create_role))
      : []
  const unique_asset_value =
    utie.length > 0 && create_role === ND()
      ? GetUniques(utie.map((h) => `${h.uploadedBy}:${h.mapAllocationTo}`))
      : undefined

  const create_assest_with_phases = []
  const create_assest_no_phases = []

  if (unique_asset_value) {
    unique_asset_value.forEach((b) => {
      const [q, w] = b.split(':')
      const tb_gen = utie.filter(
        (er) =>
          er.uploadedBy === q &&
          er.mapAllocationTo === w &&
          er.isReceived === true
      )

      // console.log(tb_gen);

      const not_there = utie.filter(
        (er) => !er.uploadedBy === q && !er.mapAllocationTo === w
      )

      if (tb_gen.length > 0) {
        const sn = tb_gen.filter((qa) => qa.phase === '1-Phase')
        const th = tb_gen.filter((qa) => qa.phase === '3-Phase')
        if (sn.length > 0) {
          create_assest_with_phases.push({
            phase: '1-Phase',
            pop: myFunc(sn.map((l) => l.pop)),
            meterOwner: sn[0].meterOwner,
            mapAllocationTo: sn[0].mapAllocationTo,
            uploadedBy: sn[0].uploadedBy,
            isReceived: true,
          })
        }
        if (th.length > 0) {
          create_assest_with_phases.push({
            phase: '3-Phase',
            pop: myFunc(th.map((l) => l.pop)),
            meterOwner: th[0].meterOwner,
            mapAllocationTo: th[0].mapAllocationTo,
            uploadedBy: th[0].uploadedBy,
            isReceived: true,
          })
        }

        const is = sn.filter((d) => d.installationStatus === true)
        const aas = sn.filter((d) => d.mapAllocationTo && d.discoAllocationTo)

        const its = th.filter((d) => d.installationStatus === true)
        const aats = th.filter((d) => d.mapAllocationTo && d.discoAllocationTo)

        const iss = myFunc(is.length > 0 ? is.map((d) => d.pop) : [])
        const ass = myFunc(aas.length > 0 ? aas.map((d) => d.pop) : [])

        const itt = myFunc(its.length > 0 ? its.map((d) => d.pop) : [])
        const att = myFunc(aats.length > 0 ? aats.map((d) => d.pop) : [])

        const ns = myFunc(sn.length > 0 ? sn.map((d) => d.pop) : [])
        const ht = myFunc(th.length > 0 ? th.map((d) => d.pop) : [])

        create_assest_no_phases.push({
          pop: myFunc(tb_gen.map((l) => l.pop)),
          meterOwner: tb_gen[0].meterOwner,
          mapAllocationTo: tb_gen[0].mapAllocationTo,
          uploadedBy: tb_gen[0].uploadedBy,
          single: ns,
          three: ht,
          total: ns + ht,
          single_phase_sent: ass,
          single_phase_sent_and_install: iss,
          three_phase_sent: att,
          three_phase_sent_and_install: itt,
          total_sent: ass + att,
          total_installed: iss + aats,
          isReceived: true,
        })
      } else {
        not_there.forEach((d) => create_assest.push(d))
      }
    })
  }
  // console.log(create_assest_no_phases);
  // METERS ON TRANSIT;
  const tnsit =
    utie.length > 0
      ? utie.filter((s) => s.isReceived === false && s.mapAllocationTo)
      : []

  const transit = filter_two_values({
    param0: true,
    param1: false,
    field: 'isReceived',
    skip: true,
    value: false,
    array: tnsit,
  })

  // console.log(transit.total);

  // 1Q & 3Q PHASE EXTRACTION
  const phase = filter_two_values({
    param0: '1-Phase',
    param1: '3-Phase',
    field: 'phase',
    array: utie,
  })

  // ALLOCATION EXTRACTION
  const allocations = filter_two_values({
    param0: 'In store',
    param1: 'Allocated',
    param2: 'Installed',
    field: 'allocationStatus',
    array: utie,
  })

  // console.log(allocations);

  // STILL ALLOCATION EXTRACTION
  const bn = generate_view({
    table: utie,
    role: create_role,
    allocation: [...allocations.q1_data, ...allocations.q2_data],
  })

  // console.log(bn);

  // CUSTOMER REGISTRATION EXTRACTION
  const cus_al = filter_two_values({
    param0: true,
    param1: false,
    field: 'hasAllocation',
    array: cm_parse,
    skip: true,
  })

  const map_provision = []
  const disco_provision = []

  if (create_role === NM() && utie.length > 0) {
    const map_uniq = GetUniques(utie.map((d) => d.uploadedBy))
    map_uniq.forEach((b) => {
      const ftl = utie.filter(
        (d) => d.uploadedBy === b && d.mapAllocationTo !== undefined
      )
      const ltf = utie.filter(
        (d) => d.uploadedBy === b && d.mapAllocationTo === undefined
      )
      if (ftl.length > 0) {
        const s = ftl.filter((d) => d.phase === '1-Phase')
        const t = ftl.filter((d) => d.phase === '3-Phase')
        const total = myFunc(ftl.map((d) => d.pop))
        const single = myFunc(s.map((d) => d.pop))
        const three = myFunc(t.map((d) => d.pop))

        if (ltf.length > 0) {
          const ss = ltf.filter((d) => d.phase === '1-Phase')
          const tt = ltf.filter((d) => d.phase === '3-Phase')
          const totals = myFunc(ltf.map((d) => d.pop))
          const singles = myFunc(ss.map((d) => d.pop))
          const threes = myFunc(tt.map((d) => d.pop))

          map_provision.push({
            uploadedBy: b,
            single_phase_sent: single,
            three_phase_sent: three,
            total_sent: total,
            single_phase_in_store: singles,
            three_phase_in_store: threes,
            total_in_store: totals,
          })
        } else {
          map_provision.push({
            uploadedBy: b,
            single_phase_sent: single,
            three_phase_sent: three,
            total_sent: total,
            single_phase_in_store: 0,
            three_phase_in_store: 0,
            total_in_store: 0,
          })
        }
      }
    })
  }

  if (create_role === ND() && create_assest_no_phases.length > 0) {
    const utie = create_assest_no_phases
    const ds_uniq = GetUniques(
      utie.map((d) => `${d.mapAllocationTo}:${d.uploadedBy}`)
    )
    ds_uniq.forEach((b) => {
      const [q, w] = b.split(':')
      const ftl = utie.filter(
        (d) => d.mapAllocationTo === q && d.uploadedBy === w && d.total_sent > 0
      )
      const ltf = utie.filter(
        (d) =>
          d.mapAllocationTo === q && d.uploadedBy === w && d.total_sent === 0
      )

      if (ftl.length > 0) {
        const total = myFunc(ftl.map((d) => d.pop))
        const single = myFunc(ftl.map((d) => d.single))
        const three = myFunc(ftl.map((d) => d.three))
        const single_allo = myFunc(ftl.map((d) => d.single_phase_sent))
        const three_allo = myFunc(ftl.map((d) => d.three_phase_sent))
        const inst_single = myFunc(
          ftl.map((d) => d.single_phase_sent_and_install)
        )
        const inst_three = myFunc(
          ftl.map((d) => d.three_phase_sent_and_install)
        )

        disco_provision.push({
          provider: w,
          receiver: q,
          single_phase_received: single,
          three_phase_received: three,
          total_received: total,
          single_phase_sent: single_allo,
          three_phase_sent: three_allo,
          single_phase_sent_and_install: inst_single,
          three_phase_sent_and_install: inst_three,
          total_received: single + three,
        })
      } else if (ltf.length > 0) {
        ltf.forEach((c) => {
          const lt = ltf.filter(
            (s) =>
              s.mapAllocationTo === c.mapAllocationTo &&
              s.uploadedBy === c.uploadedBy
          )

          const total = myFunc(lt.map((d) => d.pop))
          const single = myFunc(lt.map((d) => d.single))
          const three = myFunc(lt.map((d) => d.three))
          const single_allo = myFunc(lt.map((d) => d.single_phase_sent))
          const three_allo = myFunc(lt.map((d) => d.three_phase_sent))
          const inst_single = myFunc(
            lt.map((d) => d.single_phase_sent_and_install)
          )
          const inst_three = myFunc(
            lt.map((d) => d.three_phase_sent_and_install)
          )

          disco_provision.push({
            provider: c.uploadedBy,
            receiver: c.mapAllocationTo,
            single_phase_received: single,
            three_phase_received: three,
            total_received: total,
            single_phase_sent: single_allo,
            three_phase_sent: three_allo,
            single_phase_sent_and_install: inst_single,
            three_phase_sent_and_install: inst_three,
            total_received: single + three,
          })
        })
      }
    })
  }

  // REPLACEMENT
  const { q0_pop: replacementRegistered } = filter_two_values({
    param0: true,
    param1: false,
    field: 'needsReplacement',
    array: utie,
  })
  const { q0_pop: replacementTreated } = filter_two_values({
    param0: true,
    param1: false,
    field: 'replaceAcknowledged',
    array: utie,
  })

  const summary = {
    single: phase.q0_pop,
    three: phase.q1_pop,
    inStore: allocations.q0_data,
    allocated: allocations.q1_data,
    inStoreCount: allocations.q0_pop,
    outOfStoreCount: allocations.q1_pop + allocations.q2_pop,
    total: phase.total,
    allocations: bn,
    customer_count: cus_al.total,
    customer_allocated_stats: cus_al.q0_pop,
    customer_allocated_data: cus_al.q0_data,
    customer_unallocated_stats: cus_al.q1_pop,
    customer_unallocated_data: cus_al.q1_data,
    installation_count: allocations.q2_pop,
    installation_data: allocations.q2_data,
    on_transit_count: transit.total,
    on_transit_data: transit.q1_data,
    create_assest_no_phases,
    create_assest_with_phases,
    map_provision,
    disco_provision,
    replacementRegistered,
    replacementTreated,
    pendingReplacement: replacementRegistered - replacementTreated,
  }

  // console.log(disco_provision);

  // console.log(summary);

  return summary
}

module.exports = map_dashboard_config
