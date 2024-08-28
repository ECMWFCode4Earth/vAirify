import { useQueries } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Select, { ActionMeta, MultiValue, OnChangeValue } from 'react-select'

import { AverageComparisonChart } from './average-comparison-chart/AverageComparisonChart'
import classes from './SingleCity.module.css'
import { SiteMeasurementsChart } from './site-measurement-chart/SiteMeasurementsChart'
import { Station, StationMap } from './station-map/StationMap'
import { useForecastContext } from '../../context'
import { PollutantType, pollutantTypes } from '../../models'
import { indexToColor } from '../../services/echarts-service'
import { getForecastData } from '../../services/forecast-data-service'
import { getMeasurements } from '../../services/measurement-data-service'
import { MeasurementsResponseDto } from '../../services/types'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface SiteOption {
  value: string
  label: string
}

const getSiteName = (measurement: MeasurementsResponseDto): string => {
  return measurement.site_name.replace(/\b\w/g, (char) => char.toUpperCase())
}

export const SingleCity = () => {
  const { forecastDetails } = useForecastContext()

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
        queryKey: [
          forecastDetails.forecastBaseDate,
          locationName,
          forecastDetails.maxMeasurementDate,
          forecastDetails.maxForecastDate,
        ],
        queryFn: () =>
          getForecastData(
            forecastDetails.forecastBaseDate,
            forecastDetails.maxForecastDate,
            forecastDetails.forecastBaseDate,
            locationName,
          ),
      },
      {
        queryKey: [
          'measurements',
          locationName,
          forecastDetails.forecastBaseDate,
          forecastDetails.maxMeasurementDate,
          forecastDetails.maxForecastDate,
        ],
        queryFn: () =>
          getMeasurements(
            forecastDetails.forecastBaseDate,
            forecastDetails.maxMeasurementDate,
            'city',
            [locationName],
          ),
      },
    ],
  })

  const [sites, setSites] = useState<MultiValue<SiteOption> | undefined>(
    undefined,
  )
  const [selectedSites, setSelectedSites] = useState<MultiValue<SiteOption>>([])

  useEffect(() => {
    if (!measurementDataPending) {
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
    }
  }, [measurementData, measurementDataPending])

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

  const siteLocations = useMemo(() => {
    return measurementData?.reduce<Record<string, Station>>(
      (locations, measurement) => {
        const siteName = getSiteName(measurement)
        const location = locations[siteName]
        if (!location) {
          locations[siteName] = {
            name: siteName,
            longitude: measurement.location.longitude,
            latitude: measurement.location.latitude,
          }
        }
        return locations
      },
      {},
    )
  }, [measurementData])

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

  const [siteColors, setSiteColors] = useState<
    Record<string, string> | undefined
  >(undefined)
  useEffect(() => {
    if (sites) {
      const colorsBySite: Record<string, string> = {}
      sites.forEach((value, index) => {
        const color = indexToColor(index)
        colorsBySite[value.label] = color
      })
      setSiteColors(colorsBySite)
    }
  }, [sites])

  const deselectSite = useCallback((siteName: string) => {
    setSelectedSites((current) =>
      current.filter(({ value }) => value !== siteName),
    )
  }, [])

  const selectSite = useCallback((siteName: string) => {
    setSelectedSites((current) =>
      current.concat({ value: siteName, label: siteName }),
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
          <section className={classes['section-columns']}>
            <div
              key="aqi_chart"
              data-testid="aqi_chart"
              className={classes['chart']}
            >
              <AverageComparisonChart
                cityName={locationName}
                forecastData={forecastData}
                measurementsData={measurements}
                forecastBaseTime={forecastDetails.forecastBaseDate}
              />
            </div>
            {measurementsByPollutantBySite &&
              Object.entries(measurementsByPollutantBySite).map(
                ([pollutantType, measurementsBySite]) => (
                  <div
                    key={`site_measurements_chart_${pollutantType}`}
                    data-testid={`site_measurements_chart_${pollutantType}`}
                    className={classes['chart']}
                  >
                    <SiteMeasurementsChart
                      forecastData={forecastData}
                      measurementsBySite={measurementsBySite}
                      onSiteClick={deselectSite}
                      pollutantType={pollutantType as PollutantType}
                      seriesColorsBySite={siteColors}
                      cityName={locationName}
                    />
                  </div>
                ),
              )}
          </section>
          <section className={classes['site-measurements-section']}>
            <div className={classes['site-measurements-title']}>
              Measurement Sites
            </div>
            <div className={classes['section-columns']}>
              {forecastData[0] && siteColors && (
                <div
                  key="station_map"
                  data-testid="station_map"
                  className={`${classes['site-select']} ${classes['map']}`}
                >
                  <StationMap
                    mapCenter={forecastData[0].location}
                    stations={siteLocations!}
                    visibleLocations={selectedSites.map((site) => site.label)}
                    stationColors={siteColors}
                    removeSite={deselectSite}
                    addSite={selectSite}
                  ></StationMap>
                </div>
              )}
              <form
                className={classes['site-select-form']}
                data-testid="sites-form"
              >
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
            </div>
          </section>
        </>
      )}
    </section>
  )
}
