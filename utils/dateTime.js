const { default: slugify } = require('slugify');

const date = new Date();
const lm = date.getMonth() + 1 <= 9 ? `0${date.getMonth()}` : date.getMonth(),
  mm =
    date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1,
  dd = date.getDate() + 1 <= 9 ? `0${date.getDate()}` : date.getDate(),
  yr = date.getFullYear();

function dateContructor(y, m, d = 0) {
  return new Date(y, m, d);
}

function dateComparison(value) {
  const mm = value + 1 <= 9 ? `0${value + 1}` : value + 1;
  return mm;
}

function dateAndTime(customeDate) {
  const min =
      date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes(),
    sec = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds(),
    hrs = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours(),
    period = date.getHours() < 12 ? 'AM' : 'PM';

  let c_mm, c_dd, c_yr, c_date;
  if (customeDate) {
    c_date = new Date(customeDate);
    c_mm =
      c_date.getMonth() < 10
        ? `0${c_date.getMonth() + 1}`
        : c_date.getMonth() + 1;
    c_dd = c_date.getDate() < 10 ? `0${c_date.getDate()}` : c_date.getDate();
    c_yr = c_date.getFullYear();
  }

  return {
    currentDate: `${yr}-${mm}-${dd}`,
    currentTime: `${hrs}:${min}:${sec} ${period}`,
    currentDate_time: `${yr}-${mm}-${dd} ${hrs}:${min}:${sec} ${period}`,
    lastMonth: `${yr}-${lm}-${dd}`,
    lastMonthFigure: `${lm}`,
    currentDay: `${dd}`,
    cycle: `${yr}${mm}`,
    year: yr,
    month: mm,
    custome_currentDate: `${c_yr}-${c_mm}-${c_dd}`,
    c_dd,
    c_mm,
    c_yr,
  };
}

function monthOfAYear() {
  const arrayOfMonths = [
    {
      month: 'JAN',
      days: dateContructor(yr, '01').getDate(),
      code: dateComparison(dateContructor(yr, '01').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'FEB',
      days: dateContructor(yr, '02').getDate(),
      code: dateComparison(dateContructor(yr, '02').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'MAR',
      days: dateContructor(yr, '03').getDate(),
      code: dateComparison(dateContructor(yr, '03').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'APR',
      days: dateContructor(yr, '04').getDate(),
      code: dateComparison(dateContructor(yr, '04').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'MAY',
      days: dateContructor(yr, '05').getDate(),
      code: dateComparison(dateContructor(yr, '05').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'JUN',
      days: dateContructor(yr, '06').getDate(),
      code: dateComparison(dateContructor(yr, '06').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'JUL',
      days: dateContructor(yr, '07').getDate(),
      code: dateComparison(dateContructor(yr, '07').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'AUG',
      days: dateContructor(yr, '08').getDate(),
      code: dateComparison(dateContructor(yr, '08').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'SEP',
      days: dateContructor(yr, '09').getDate(),
      code: dateComparison(dateContructor(yr, '09').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'OCT',
      days: dateContructor(yr, '10').getDate(),
      code: dateComparison(dateContructor(yr, '10').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'NOV',
      days: dateContructor(yr, '11').getDate(),
      code: dateComparison(dateContructor(yr, '11').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
    {
      month: 'DEC',
      days: dateContructor(yr, '12').getDate(),
      code: dateComparison(dateContructor(yr, '12').getMonth()),
      year: `${new Date().getFullYear()}`,
      time: `${new Date().getHours()}: ${new Date().getMinutes()}`,
    },
  ];

  return {
    arrayOfMonths,
  };
}

const putMonth = (pre, nxt) => {
  let val = 0;
  if (pre.length !== 0 && nxt !== 0)
    val = new Date(nxt).getDate() + 1 - (new Date(pre).getDate() + 1);

  return val < 10
    ? `0${val !== 0 ? val + 1 : 0}`
    : `${val !== 0 ? val + 1 : 0}`;
};

const getCyclePeriod = (nxt) => {
  let val = { month: '', year: '' };
  if (nxt !== 0) {
    day = new Date(nxt);
    val = { year: day.getFullYear(), month: day.getMonth() + 1 };
  }
  const m = val.month < 10 ? `0${val.month}` : val.month;
  return `${val.year}${m}`;
};
const getPeriod = (nxt) => {
  let val = { month: '', year: '' };
  if (nxt !== 0) {
    day = new Date(nxt);
    val = { year: day.getFullYear(), month: day.getMonth() + 1 };
  }
  const m = val.month < 10 ? `0${val.month}` : val.month;
  return `${val.year}${m}`;
};

const currentMonth = (nxt) => {
  let val = '00';
  if (nxt !== 0) {
    day = new Date(nxt).getMonth();
    const m = day < 10 ? `0${day}` : day;
    val = m;
  }

  return val;
};

const dateExtract = (customeDate) => {
  let c_mm, c_dd, c_yr, c_date;
  if (customeDate) {
    c_date = new Date(customeDate);
    c_mm =
      c_date.getMonth() < 10
        ? `0${c_date.getMonth() + 1}`
        : c_date.getMonth() + 1;
    c_dd = c_date.getDate() < 10 ? `0${c_date.getDate()}` : c_date.getDate();
    c_yr = c_date.getFullYear();
  }

  return `${c_yr}-${c_mm}-${c_dd}`;
};

function customizeDate(customeDate) {
  const customized = new Date(customeDate);
  const lm =
      customized.getMonth() + 1 <= 9
        ? `0${customized.getMonth()}`
        : customized.getMonth(),
    mm =
      customized.getMonth() + 1 <= 9
        ? `0${customized.getMonth() + 1}`
        : customized.getMonth() + 1,
    dd =
      customized.getDate() + 1 <= 9
        ? `0${customized.getDate()}`
        : customized.getDate(),
    yr = customized.getFullYear();

  return {
    currentDate: `${yr}-${mm}-${dd}`,
    lastMonth: `${yr}-${lm}-${dd}`,
    lastMonthFigure: `${lm}`,
    currentDay: `${dd}`,
    cycle: `${yr}${mm}`,
    year: yr,
    month: mm,
  };
}

const tokenForProd = ({ title, period, locs }) =>
  slugify(`${title} ${period} ${locs} ${dd}`).toUpperCase();
const estimateDate = ({ numOfMonths, month }) => {
  const dae = new Date().getTime();
  const dD = (24 * (60 * (60 * 1000)) * month || 30) * numOfMonths || 1;
  return customizeDate(dD);
};

module.exports = {
  dateAndTime,
  monthOfAYear,
  putMonth,
  getCyclePeriod,
  estimateDate,
  getPeriod,
  currentMonth,
  dateExtract,
  customizeDate,
  tokenForProd,
};
