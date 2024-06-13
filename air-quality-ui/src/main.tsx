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
import GlobalSummary from './components/summary-view/GlobalSummary'
import SingleCity from './SingleCity'

import './index.css'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/city/summary',
        handle: { breadcrumbConfig: [{ title: () => 'Cities' }] },
        element: <GlobalSummary />,
      },
      {
        path: '/city/:name',
        handle: {
          breadcrumbConfig: [
            { path: '/city/summary', title: () => 'Cities' },
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
        element: <Navigate replace to="/city/summary" />,
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
