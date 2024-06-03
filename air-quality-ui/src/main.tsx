import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import GlobalSummary from './GlobalSummary'
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
