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
  '01',
]

const generateString = (length = 15) => {
  const n = new Date().getSeconds()
  let string = ''
  for (let i = 0; i < length; i++) {
    const randomNumber = Math.floor(Math.random() * alphas.length)
    string += alphas[randomNumber]
  }

  return `${string}${n}`
}

module.exports = generateString
