import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  Navigate,
  RouterProvider,
  UIMatch,
  createBrowserRouter,
} from 'react-router-dom'

import Layout from './components/layout/Layout'
import { SingleCity } from './components/single-city/SingleCity'
import GlobalSummary from './components/summary-view/GlobalSummary'
import { RouteConstants } from './routes'

import './index.css'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: RouteConstants.CITY_SUMMARY,
        handle: { breadcrumbs: [{ title: () => 'Cities' }] },
        element: <GlobalSummary />,
      },
      {
        path: `${RouteConstants.SINGLE_CITY}/:name`,
        handle: {
          breadcrumbs: [
            { path: RouteConstants.CITY_SUMMARY, title: () => 'Cities' },
            {
              title: (match: UIMatch<unknown, unknown>) =>
                `${match.params.name}`,
            },
          ],
        },
        element: <SingleCity />,
      },
      {
        path: '*',
        element: <Navigate replace to={RouteConstants.CITY_SUMMARY} />,
      },
    ],
  },
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
