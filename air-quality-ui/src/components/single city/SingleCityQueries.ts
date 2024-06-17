import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const useGetSingleCityForecastData = (
  valid_date_from: string | null,
  valid_date_to: string | null,
  location_type: string,
  forecast_base_time: string | null,
  location_name: string | undefined,
) => {
  const queryOptions = {
    queryKey: ['data'],
    queryFn: async () => {
      const request = await axios.get(
        'http://127.0.0.1:8000/air-pollutant/forecast',
        {
          params: {
            location_type: location_type,
            valid_time_from: valid_date_from,
            valid_time_to: valid_date_to,
            base_time: forecast_base_time,
            location_name: location_name,
          },
        },
      )
      return await request.data
    },
  }
  return useQuery(queryOptions)
}
