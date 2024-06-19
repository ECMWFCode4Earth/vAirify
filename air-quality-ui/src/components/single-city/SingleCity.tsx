import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Select, { ActionMeta, OnChangeValue } from 'react-select'

import { AverageComparisonChart } from './AverageComparisonChart'
import classes from './SingleCity.module.css'
import { SiteMeasurementsChart } from './SiteMeasurementsChart'
import { ForecastContext } from '../../context'
import { PollutantType, pollutantTypes } from '../../models'
import { getForecastData } from '../../services/forecast-data-service'
import {
  getLatestBaseForecastTime,
  getLatestValidForecastTime,
} from '../../services/forecast-time-service'
import { getMeasurements } from '../../services/measurement-data-service'
import {
  ForecastResponseDto,
  MeasurementsResponseDto,
} from '../../services/types'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface SiteOption {
  value: string
  label: string
}

const getSiteName = (measurement: MeasurementsResponseDto): string => {
  return measurement.site_name.replace(/\b\w/g, (char) => char.toUpperCase())
}

export const SingleCity = () => {
  const { forecastBaseTime, forecastValidTime } = useContext(ForecastContext)
  const { name: locationName = '' } = useParams()
  const { data, isPending, isError } = useQuery({
    queryKey: ['measurements', locationName],
    queryFn: () =>
      getMeasurements(forecastBaseTime, forecastValidTime, 'city', [
        locationName,
      ]),
  })

  const [processedData, setProcessedData] = useState<(string | number)[][]>()

  let todaysDate = DateTime.now().toUTC()
  let dateFiveDaysAgo = todaysDate.minus({ days: 5 }).toUTC()
  todaysDate = todaysDate.set({ minute: 0, second: 0, millisecond: 0 })
  dateFiveDaysAgo = dateFiveDaysAgo.set({
    minute: 0,
    second: 0,
    millisecond: 0,
  })

  const { data: dataF, isPending: isPendingF } = useQuery({
    queryKey: ['forecast'],
    queryFn: () =>
      getForecastData(
        getLatestValidForecastTime(dateFiveDaysAgo),
        getLatestValidForecastTime(todaysDate),
        getLatestBaseForecastTime(dateFiveDaysAgo),
        locationName,
      ),
  })
  useEffect(() => {
    if (dataF) {
      setProcessedData(
        dataF.map((measurement: ForecastResponseDto) => {
          return [measurement.valid_time, measurement.overall_aqi_level]
        }),
      )
    }
  }, [dataF])

  const [sites, setSites] = useState<SiteOption[]>([])
  const [selectedSites, setSelectedSites] = useState<SiteOption[]>([])
  useEffect(() => {
    const sites = Array.from(
      data
        ?.map((measurement) => getSiteName(measurement))
        .reduce((sites, name) => sites.add(name), new Set<string>()) ?? [],
    ).map((name) => ({
      value: name,
      label: name,
    }))

    setSites(sites)
    setSelectedSites(sites)
  }, [data])

  const onSelectionChange = useCallback(
    (
      changeValue: OnChangeValue<SiteOption, true>,
      detail: ActionMeta<SiteOption>,
    ) => {
      if (
        detail.action === 'remove-value' ||
        detail.action === 'select-option'
      ) {
        setSelectedSites(changeValue as SiteOption[])
      }
    },
    [],
  )

  const measurementsByPollutantBySite = useMemo(() => {
    return data
      ?.filter((measurement) =>
        selectedSites.find(
          (site) => site && site.value === getSiteName(measurement),
        ),
      )
      .reduce<Record<PollutantType, Record<string, MeasurementsResponseDto[]>>>(
        (acc, measurement) => {
          pollutantTypes.forEach((pollutantType) => {
            const value = measurement[pollutantType]
            if (value) {
              const pollutantGroup = acc[pollutantType]
              const siteName = getSiteName(measurement)
              let measurements = pollutantGroup[siteName]
              if (!measurements) {
                measurements = []
                pollutantGroup[siteName] = measurements
              }
              measurements.push(measurement)
            }
          })
          return acc
        },
        { pm2_5: {}, pm10: {}, no2: {}, o3: {}, so2: {} },
      )
  }, [data, selectedSites])

  if (isError) {
    return <>An error occurred</>
  }

  return (
    <section className={classes['single-city-container']}>
      <section data-testid="main-comparison-chart">
        <AverageComparisonChart isPending={isPendingF} data={processedData} />
      </section>
      {isPending && <LoadingSpinner />}
      {!isPending && (
        <>
          <section className={classes['selected-sites']}>
            <h3>Selected Sites</h3>
            <Select
              isMulti
              options={sites}
              value={selectedSites}
              onChange={onSelectionChange}
              isClearable={false}
            />
          </section>
          <section className={classes['site-measurements']}>
            <h3>Site Measurements</h3>
            {measurementsByPollutantBySite &&
              Object.entries(measurementsByPollutantBySite)
                .filter(
                  ([, measurementsBySite]) =>
                    !!Object.keys(measurementsBySite).length,
                )
                .map(([pollutantType, measurementsBySite]) => (
                  <div
                    key={`site_measurements_chart_${pollutantType}`}
                    data-testid={`site_measurements_chart_${pollutantType}`}
                  >
                    <SiteMeasurementsChart
                      pollutantType={pollutantType as PollutantType}
                      measurementsBySite={measurementsBySite}
                    />
                  </div>
                ))}
          </section>
        </>
      )}
    </section>
  )
}
