import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const useGetSingleCityForecastData = (
  valid_date_from: string,
  valid_date_to: string,
  location_type: string,
  forecast_base_time: string,
  location_name: string | undefined,
) => {
  const queryOptions = {
    queryKey: ['data'],
    queryFn: async () => {
      const request = await axios.get(
        'http://127.0.0.1:8000/air-pollutant-forecast',
        {
          params: {
            valid_date_from: valid_date_from,
            valid_date_to: valid_date_to,
            location_type: location_type,
            forecast_base_time: forecast_base_time,
            location_name: location_name,
          },
        },
      )
      return await request.data
    },
  }
  return useQuery(queryOptions)
}
