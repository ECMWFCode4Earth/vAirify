import { useQueries } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Select, { ActionMeta, MultiValue, OnChangeValue } from 'react-select'

import { AverageComparisonChart } from './average-comparison-chart/AverageComparisonChart'
import classes from './SingleCity.module.css'
import { useForecastContext } from '../../context'
import { PollutantType, pollutantTypes } from '../../models'
import { textToColor } from '../../services/echarts-service'
import { getForecastData } from '../../services/forecast-data-service'
import { getMeasurements } from '../../services/measurement-data-service'
import { MeasurementsResponseDto } from '../../services/types'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { SiteMeasurementsChart } from './site-measurement-chart/SiteMeasurementsChart'

interface SiteOption {
  value: string
  label: string
}

const getSiteName = (measurement: MeasurementsResponseDto): string => {
  return measurement.site_name.replace(/\b\w/g, (char) => char.toUpperCase())
}

export const SingleCity = () => {
  const { forecastBaseDate, maxInSituDate, maxForecastDate } =
    useForecastContext()
  const { name: locationName = '' } = useParams()
  const [
    {
      data: forecastData,
      isPending: forecastDataPending,
      isError: forecastDataError,
    },
    {
      data: measurementData,
      isPending: measurementDataPending,
      isError: measurementDataError,
    },
  ] = useQueries({
    queries: [
      {
        queryKey: [forecastBaseDate, locationName],
        queryFn: () =>
          getForecastData(
            forecastBaseDate,
            maxForecastDate,
            forecastBaseDate,
            locationName,
          ),
      },
      {
        queryKey: ['measurements', locationName, forecastBaseDate],
        queryFn: () =>
          getMeasurements(forecastBaseDate, maxInSituDate, 'city', [
            locationName,
          ]),
      },
    ],
  })

  const [sites, setSites] = useState<MultiValue<SiteOption>>([])
  const [selectedSites, setSelectedSites] = useState<MultiValue<SiteOption>>([])
  useEffect(() => {
    const sites = Array.from(
      measurementData
        ?.map((measurement) => getSiteName(measurement))
        .reduce((sites, name) => sites.add(name), new Set<string>()) ?? [],
    ).map((name) => ({
      value: name,
      label: name,
    }))

    setSites(sites)
    setSelectedSites(sites)
  }, [measurementData])

  const onSelectionChange = useCallback(
    (
      changeValue: OnChangeValue<SiteOption, true>,
      detail: ActionMeta<SiteOption>,
    ) => {
      if (
        detail.action === 'remove-value' ||
        detail.action === 'select-option'
      ) {
        setSelectedSites(changeValue)
      }
    },
    [],
  )

  const measurementsByPollutantBySite = useMemo(() => {
    return measurementData
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
  }, [measurementData, selectedSites])
  const measurements = useMemo(() => {
    return measurementData?.filter((measurement) =>
      selectedSites.find(
        (site) => site && site.value === getSiteName(measurement),
      ),
    )
  }, [measurementData, selectedSites])
  const [siteColors, setSiteColors] = useState<Record<string, string>>({})
  useEffect(() => {
    const updateColors = async () => {
      const colorsBySite: Record<string, string> = {}
      for (const { value } of sites) {
        const color = await textToColor(value)
        colorsBySite[value] = color
      }
      setSiteColors(colorsBySite)
    }
    updateColors()
  }, [sites])
  const deselectSite = useCallback((siteName: string) => {
    setSelectedSites((current) =>
      current.filter(({ value }) => value !== siteName),
    )
  }, [])

  if (forecastDataError || measurementDataError) {
    return <>An error occurred</>
  }

  return (
    <section className={classes['single-city-container']}>
      {(forecastDataPending || measurementDataPending) && <LoadingSpinner />}
      {!forecastDataPending && !measurementDataPending && (
        <>
          <section
            data-testid="main-comparison-chart"
            className={classes['single-city-section']}
          >
            <AverageComparisonChart
              forecastData={forecastData}
              measurementsData={measurements}
              forecastBaseTime={forecastBaseDate}
            />
          </section>
          <section className={classes['site-measurements-section']}>
            <form
              className={classes['site-select-form']}
              data-testid="sites-form"
            >
              <label
                className={classes['site-select-label']}
                htmlFor="sites-select"
              >
                Measurement Sites
              </label>
              <Select
                className={classes['site-select']}
                inputId="sites-select"
                isClearable={false}
                isMulti
                name="sites-select"
                onChange={onSelectionChange}
                options={sites}
                value={selectedSites}
              />
            </form>
          </section>
          <section className={classes['site-measurements-section']}>
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
                    className={classes['site-measurement-chart']}
                  >
                    <SiteMeasurementsChart
                      forecastData={forecastData}
                      measurementsBySite={measurementsBySite}
                      onSiteClick={deselectSite}
                      pollutantType={pollutantType as PollutantType}
                      seriesColorsBySite={siteColors}
                    />
                  </div>
                ))}
          </section>
        </>
      )}
    </section>
  )
}
