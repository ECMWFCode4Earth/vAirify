import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import GlobalSummary from './components/GlobalSummary'
import SingleCity from './SingleCity'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalSummary />,
  },
  {
    path: '/city/:name',
    element: <SingleCity />,
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
