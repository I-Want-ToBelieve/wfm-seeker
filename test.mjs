
import data from './data.json' assert { type: 'json' }
import data_cn from './data_cn.json' assert { type: 'json' }

const inputValue = process.argv.at(2) ?? 'link'
const isCN = !!process.argv.at(3)

const nameKey = 'item_name'
const _nameKey = (nameKey || 'name')
const items = (isCN ? data_cn : data).payload.items

const inputEscapingMap = [
  [/\\/g, '\\\\'],
  [/\(/g, '\\('],
  [/\)/g, '\\)'],
  [/\[/g, '\\['],
  [/\]/g, '\\]'],
]


const value = inputEscapingMap.reduce((acc, pair) => {
  return acc.replace(pair[0], pair[1]);
}, inputValue)

const parts = value.trim().split(' ')

const regexBase = parts.reduce((regexBase, part, index) => (part.length > 0 ? (regexBase += `(^|.*?[\\s·])(${part})`) : regexBase), '');

const regex = new RegExp(regexBase, 'ig')

const itemMatchPairs = items
  .map((item) => {
    if (regex === null) {
      return [1, item];
    }

    let name = item[_nameKey]
    let matchedlenght = name.match(regex)?.[0].length || 0;
    if (!!name.includes(inputValue)) {
      console.log(name, name.match(regex))
    }


    return [matchedlenght, item];
  })
    .filter((pair) => {
      return pair[0] > 0;
    }).sort((a, b) => {
      let matchLenghtA = a[0];
      let matchLenghtB = b[0];
      let itemA = a[1];
      let itemB = b[1];
      let aName = itemA[_nameKey]
      let bName = itemB[_nameKey]
      let aGroup = itemA.group || 'without'
      let bGroup = itemB.group || 'without'

      if (aGroup === bGroup) {
        if (matchLenghtA === matchLenghtB) {
          return aName.localeCompare(bName);
        }

        return matchLenghtA - matchLenghtB;
      }

      let aPriority = groupPriority[aGroup] || groupPriority.with;
      let bPriority = groupPriority[bGroup] || groupPriority.with;
      if (aPriority === bPriority) {
        return aGroup.localeCompare(bGroup);
      }

      return aPriority - bPriority;
    })

const availableToSelect = itemMatchPairs.map((pair) => pair[1])

console.log('availableToSelect: ', availableToSelect.slice(0, 6).map((it) => it[_nameKey]))

for (const [index, item] of availableToSelect.entries()) {
  let name = item[_nameKey]
  const textNodes = []

  for (let charIndex = name.search(regex), cnt = 0; charIndex !== -1 && cnt < 30; cnt++) {
      let matchedlenght = name.match(regex)[0].trim().length;

      if (charIndex !== 0) {
          charIndex++;
          textNodes.push(`<span key={cnt}>${name.slice(0, charIndex)}</span>`);
      }

      textNodes.push(`<b key={cnt}>${name.slice(charIndex, charIndex + matchedlenght)}</b>`);
      name = name.slice(charIndex + matchedlenght);
      charIndex = name.search(regex);
  }

  if (name.length > 0) {
      textNodes.push(`<span key={'fin'}>${name}</span>`);
  }

  console.log(textNodes)
}

