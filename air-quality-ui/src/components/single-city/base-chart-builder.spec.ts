import { EChartsOption, ToolboxComponentOption } from 'echarts'

import { baseOptions } from './base-chart-builder'

const getToolboxFeatures = (options: EChartsOption) => {
  return (options.toolbox as ToolboxComponentOption).feature
}

describe('toolbox', () => {
  it('should show export button', () => {
    const result = baseOptions('title', 49, 'subtext')
    expect(getToolboxFeatures(result)?.saveAsImage).toBeDefined()
  })

  it('export should exlude the dataZoom', () => {
    const result = baseOptions('title', 49, 'subtext')
    expect(
      getToolboxFeatures(result)?.saveAsImage?.excludeComponents,
    ).toContain('dataZoom')
  })

  it('export should exlude the toolbox', () => {
    const result = baseOptions('title', 49, 'subtext')
    expect(
      getToolboxFeatures(result)?.saveAsImage?.excludeComponents,
    ).toContain('toolbox')
  })

  it('should be positioned inline with the right edge of the chart', () => {
    const result = baseOptions('title', 49, 'subtext')
    expect((result.toolbox as ToolboxComponentOption)?.right).toBe('10%')
  })
})
