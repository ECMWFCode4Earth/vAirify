import { CategoryScale } from 'chart.js'
import Chart from 'chart.js/auto'
import ReactECharts from 'echarts-for-react'
import { Line } from 'react-chartjs-2'

import './SingleCity.css'

Chart.register(CategoryScale)

function SingleCity() {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const forecastData = [
    {
      aqi: 1,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Mon',
    },
    {
      aqi: 1,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Tue',
    },
    {
      aqi: 2,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Wed',
    },
    {
      aqi: 2,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Thu',
    },
    {
      aqi: 6,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Fri',
    },
  ]

  const realData = [
    {
      aqi: 3,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Mon',
    },
    {
      aqi: 2,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Tue',
    },
    {
      aqi: 1,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Wed',
    },
    {
      aqi: 4,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Thu',
    },
    {
      aqi: 5,
      o3: 20,
      no2: 10,
      so2: 10,
      pm2_5: 4,
      pm10: 10,
      day: 'Fri',
    },
  ]

  const data = {
    labels,
    datasets: [
      {
        label: 'Forecast',
        data: forecastData,
        parsing: {
          yAxisKey: 'aqi',
          xAxisKey: 'day',
        },
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Measured',
        data: realData,
        parsing: {
          yAxisKey: 'aqi',
          xAxisKey: 'day',
        },
        fill: false,
        borderColor: 'rgb(238, 75, 43)',
        tension: 0.1,
      },
    ],
  }
  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const { raw } = context
            return Object.entries(raw)
              .filter(([k]) => k !== 'day')
              .map(([k, v]) => `${k}: ${v}`)
          },
        },
      },
    },
  }

  const echartOptions = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: forecastData.map((f) => f['aqi']),
        type: 'line',
        name: 'Forecast',
      },
      {
        data: realData.map((f) => f['aqi']),
        type: 'line',
        name: 'Real',
      },
    ],
    legend: {
      data: ['Forecast', 'Real'],
      orient: 'horizontal',
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const data = (params.seriesIndex === 0 ? forecastData : realData)[
          params.dataIndex
        ]
        return Object.entries(data)
          .filter(([k]) => k !== 'day')
          .map(([k, v]) => `${params.marker}${k}: ${v}<br/>`)
          .join('')
      },
    },
  }

  return (
    <div className="chart-section">
      <section>
        <label>ChartJS</label>
        <Line data={data} options={options}></Line>
      </section>
      <section>
        <label>ECharts</label>
        <ReactECharts
          option={echartOptions}
          notMerge={true}
          lazyUpdate={true}
        />
      </section>
    </div>
  )
}

export default SingleCity
