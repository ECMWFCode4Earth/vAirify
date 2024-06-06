import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import './index.css'
import GlobalSummary from './components/global summary/GlobalSummary'
import SingleCity from './components/single city/SingleCity'

const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalSummary />,
  },
  {
    path: '/city/:city',
    element: <SingleCity />,
  },
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
    ,
  </QueryClientProvider>,
)
