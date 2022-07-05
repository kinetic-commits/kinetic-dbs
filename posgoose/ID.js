const alphas = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '1',
  '2',
  '3',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
  '!',
  '@',
  '#',
  '$',
  '^',
  '%',
  '&',
  '*',
  '(',
  ')',
  '_',
  '-',
  '+',
  '=',
  '{',
  '}',
  ':',
  ';',
  '?',
  '/',
  '.',
  '>',
  '<',
  '|',
  `'\\'`,
];

const generateRandomString = (length) => {
  const len = length || 15;
  const date = new Date();
  const ms = date.getMilliseconds();
  const m = date.getMonth();
  const d = date.getDate();
  const wk = date.getDay();
  const y = date.getFullYear();
  const str = `${y}${ms}${d}${m}${wk}`;

  let string = '';
  for (let i = 0; i < len; i++) {
    const randomNumber = Math.floor(Math.random() * alphas.length);
    string += alphas[randomNumber];
  }

  return `${str}${string}`;
};

module.exports = generateRandomString;
