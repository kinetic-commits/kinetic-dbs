const _customerID = () => {
  const date = new Date()
  return (
    Math.ceil(
      Math.random() * 341039900 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + 30000000000
  )
}

const _ide = () => {
  const date = new Date()
  const s = date.getSeconds(),
    m = date.getMinutes(),
    mm = date.getMonth(),
    d = date.getDate(),
    w = date.getDay(),
    y = date.getFullYear()
  return `${s}${m}${mm}${d}${w}${y}`
}

const _accountID = () => {
  const date = new Date()
  return (
    Math.ceil(
      Math.random() * 141039900 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + 40000000000
  )
}
const _userID = () => {
  const date = new Date()
  return (
    Math.ceil(
      Math.random() * 8999009 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + 20000000
  )
}

const _contactCodeID = () => {
  const date = new Date()
  return (
    Math.ceil(
      Math.random() * 8990 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + 100000
  )
}

const _transformerID = () => {
  const date = new Date()
  return (
    Math.ceil(
      Math.random() * 841039900 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + 650000000
  )
}

const _contractID = () => {
  const date = new Date()
  return `${
    Math.ceil(
      Math.random() * 769900 +
        date.getDate() +
        date.getSeconds() +
        date.getMonth()
    ) + 5000000
  }${date.getFullYear()}`
}

const feederID = () => {
  const date = new Date()
  return (
    Math.ceil(
      Math.random() * 840900 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + 80000099800
  )
}

const storeID = () => {
  const date = new Date()
  return (
    Math.ceil(
      Math.random() * 84656450900 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + 1700009090000
  )
}

const com_id = () => {
  const date = new Date()
  return (
    Math.ceil(
      Math.random() * 840900 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + 67000000
  )
}

const _refId = (startWith = 4) => {
  const value = parseInt(`${startWith}0000069000000000`)
  const date = new Date()
  return `${
    Math.ceil(
      Math.random() * 84103569900 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + value
  }${date.getDate()}${date.getFullYear()}${date.getMonth()}`
}

const __tokenization = (numb) => {
  const date = new Date()
  const value =
    Math.ceil(
      Math.random() * 3419997654039900 +
        date.getMilliseconds() +
        date.getDate() +
        date.getSeconds() +
        date.getFullYear() +
        date.getMonth()
    ) + 90000088700008780000
  let val = !numb ? value : numb
  var str = val.toString().split('.')
  str[0] = str[0].replace(/\B(?=(\d{4})+(?!\d))/g, '-')
  return `${str.join('.')}`
}

const coordsID = (obj) => {
  if (!obj) return {}
  const { LAT: lat, LONG: lng } = obj || {}
  const LAT = typeof lat === 'number' ? lat.toString() : lat
  const LONG = typeof lng === 'number' ? lng.toString() : lng

  if (!LAT || !LONG) return {}

  let _center, areaCode, geoCode
  if (LAT && LONG) {
    const frs_lt = LAT.split('.')
    const frs_ln = LONG.split('.')
    const s_lt = frs_lt[1]
    const s_ln = frs_ln[1]
    geoCode = `${frs_lt[0]}${s_lt[0]}${frs_ln[0]}${s_ln[0]}`
    areaCode = `${s_lt.substr(1, 2)}${s_ln.substr(1, 2)}`
    _center = `${s_lt.substr(3, 4)}${s_ln.substr(3, 4)}`
  }
  return { _center, areaCode, geoCode }
}

module.exports = {
  _contactCodeID,
  __tokenization,
  storeID,
  coordsID,
  _ide,
  tempID: com_id,
  _customerID,
  _userID,
  _accountID,
  _transformerID,
  feederID,
  _refId,
  _contractID,
}
