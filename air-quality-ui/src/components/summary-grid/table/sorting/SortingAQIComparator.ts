export default function sortAQIComparator(
  valueA: string,
  valueB: string,
): number {
  const absA = Math.abs(parseInt(valueA))
  const absB = Math.abs(parseInt(valueB))
  if (valueA === undefined) {
    return -1
  }
  if (valueB === undefined) {
    return 1
  }
  if (absA == absB || (isNaN(absA) && isNaN(absB))) {
    const originalValueA = parseInt(valueA)
    const originalValueB = parseInt(valueB)
    if (originalValueA === originalValueB) {
      return 0
    }
    return originalValueA > originalValueB ? 1 : -1
  } else if (isNaN(absA)) {
    return -1
  } else if (isNaN(absB)) {
    return 1
  }

  return absA > absB ? 1 : -1
}
