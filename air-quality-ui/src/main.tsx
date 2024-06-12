import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'

import GlobalSummary from './components/summary-view/GlobalSummary'
import SingleCity from './SingleCity'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/cities',
    element: <GlobalSummary />,
  },
  {
    path: '/cities/:name',
    element: <SingleCity />,
  },
  {
    path: '*',
    element: <Navigate replace to="/cities" />,
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
