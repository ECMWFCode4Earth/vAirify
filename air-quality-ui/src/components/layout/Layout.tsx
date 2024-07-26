import { Outlet } from 'react-router-dom'

import { ForecastContextProvider } from '../../context'
import { Header } from '../header/Header'

export default function Layout() {
  return (
    <>
      <ForecastContextProvider>
        <Header />
        <main>
          <Outlet />
        </main>
      </ForecastContextProvider>
    </>
  )
}
