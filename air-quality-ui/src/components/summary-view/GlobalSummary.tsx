import { useQueries, useQuery } from '@tanstack/react-query'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { useCallback, useMemo, useState, useEffect } from 'react'

import classes from './GlobalSummary.module.css'
import { SummaryViewHeader } from './SummaryViewHeader'
import { useForecastContext } from '../../context'
import { getForecastData } from '../../services/forecast-data-service'
import { getValidForecastTimesBetween } from '../../services/forecast-time-service'
import { getMeasurementSummary, getMeasurementCounts, type MeasurementCounts } from '../../services/measurement-data-service'
import {
  ForecastResponseDto,
  MeasurementSummaryResponseDto,
} from '../../services/types'
import { LoadingSpinner } from '../common/LoadingSpinner'
import World from '../globe/World'
import GlobalSummaryTable from '../summary-grid/table/GlobalSummaryTable'
import SummaryBarChart from './charts/SummaryBarChart'
import SummaryScatterChart from './charts/SummaryScatterChart'

const GlobalSummary = (): JSX.Element => {
  const { forecastDetails } = useForecastContext()
  const [showAllColoured, setShowAllColoured] = useState<boolean>(true)
  const [measurementCounts, setMeasurementCounts] = useState<MeasurementCounts | null>(null)
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)

  const wrapSetShowAllColoured = useCallback(
    (val: boolean) => {
      setShowAllColoured(val)
    },
    [setShowAllColoured],
  )

  const {
    data: forecastData,
    isPending: forecastPending,
    isError: forecastDataError,
  } = useQuery({
    queryKey: [
      forecastDetails.forecastBaseDate,
      forecastDetails.maxForecastDate,
    ],
    queryFn: () =>
      getForecastData(
        forecastDetails.forecastBaseDate,
        forecastDetails.maxForecastDate,
        forecastDetails.forecastBaseDate,
      ).then((forecastData) =>
        forecastData.reduce<Record<string, ForecastResponseDto[]>>(
          (acc, reading) => {
            const location = reading.location_name
            if (!acc[location]) {
              acc[location] = []
            }
            acc[location].push(reading)
            return acc
          },
          {},
        ),
      ),
  })

  const forecastValidTimeRange = useMemo(() => {
    return getValidForecastTimesBetween(
      forecastDetails.forecastBaseDate,
      forecastDetails.maxMeasurementDate,
    )
  }, [forecastDetails])

  const {
    data: summarizedMeasurementData,
    isPending: summaryPending,
    isError: summaryDataError,
  } = useQueries({
    queries: forecastValidTimeRange.map((validTime) => ({
      queryKey: [
        'summary',
        validTime.toMillis(),
        forecastDetails.maxMeasurementDate,
      ],
      queryFn: () => getMeasurementSummary(validTime),
    })),
    combine: (results) => {
      const measurementsByLocation = results
        .flatMap(({ data }) => data)
        .reduce<Record<string, MeasurementSummaryResponseDto[]>>(
          (acc, measurement) => {
            if (measurement) {
              const locationName = measurement.location_name
              if (!acc[locationName]) {
                acc[locationName] = []
              }
              acc[locationName].push(measurement)
            }
            return acc
          },
          {},
        )
      return { data: measurementsByLocation, isError: false, isPending: false }
    },
  })

  useEffect(() => {
    const fetchMeasurementCounts = async () => {
      try {
        const counts = await getMeasurementCounts(
          forecastDetails.forecastBaseDate,
          forecastDetails.maxForecastDate,
          'city'
        )
        setMeasurementCounts(counts)
      } catch (error) {
        console.error('Error fetching measurement counts:', error)
      }
    }

    fetchMeasurementCounts()
  }, [forecastDetails])

  if (forecastDataError || summaryDataError) {
    return <span>Error occurred</span>
  }
  return (
    <>
      {(forecastPending || summaryPending) && (
        <span className={classes['loading-container']}>
          <LoadingSpinner />
        </span>
      )}
      {!forecastPending && !summaryPending && (
        <div className={classes['summary-container']}>
          <SummaryViewHeader
            setShowAllColoured={wrapSetShowAllColoured}
            showAllColoured={showAllColoured}
          />
          <GlobalSummaryTable
            forecast={forecastData}
            summarizedMeasurements={summarizedMeasurementData}
            showAllColoured={showAllColoured}
            onCityHover={setHoveredCity}
          />
          <div className={classes['charts-row']}>
            <div className={classes['chart-container']}>
              <SummaryBarChart 
                title="" 
                measurementCounts={measurementCounts}
                totalCities={Object.keys(forecastData || {}).length}
                selectedCity={hoveredCity}
              />
            </div>
            <div className={classes['chart-container']}>
              <SummaryScatterChart 
                title="Forecast vs. Measurement (3-hourly avg)"
                summarizedMeasurements={summarizedMeasurementData}
                forecast={forecastData}
                selectedCity={hoveredCity}
              />
            </div>
            <div className={classes['chart-container']}>
              <World
                forecastData={forecastData || {}}
                summarizedMeasurementData={summarizedMeasurementData}
                toggle="world-visible"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GlobalSummary
