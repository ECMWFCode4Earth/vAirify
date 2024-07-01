import each from 'jest-each'

import sortAQIComparator from './SortingAQIComparator'

describe('Sorting AQI comparator', () => {
  each([
    ['0', '+1', -1],
    ['+1', '0', 1],
    ['0', '0', -1],
    [undefined, '+1', -1],
    ['+1', undefined, 1],
    ['0', undefined, 1],
    [undefined, '0', -1],
    [undefined, undefined, -1],
    ['-1', '-1', 0],
    ['+1', '+1', 0],
    ['+1', '-1', 1],
    ['-1', '+1', -1],
    ['+2', '-1', 1],
    ['-1', '+2', -1],
    ['+1', '-2', -1],
    ['-2', '+1', 1],
  ]).it(`If comparing %s and %s, return %d`, (valueA, valueB, expected) => {
    const result = sortAQIComparator(valueA, valueB)
    expect(result).toBe(expected)
  })
})
