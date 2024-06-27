export default function sortAQIComparator(
  valueA: string,
  valueB: string,
): number {
  if (valueA === undefined) {
    return -1
  }
  if (valueB === undefined) return 1

  const signA = valueA.toString().split('')[0]
  const signB = valueB.toString().split('')[0]
  const numA = parseFloat(valueA.toString().split('')[1])
  const numB = parseFloat(valueB.toString().split('')[1])

  if (signA === '0') {
    return -1
  } else if (signB === '0') {
    return 1
  } else if (numA === numB) {
    if (signA === signB) return 0
    return signA === '+' ? 1 : -1
  }
  return numA > numB ? 1 : -1
}
