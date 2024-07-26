import { Breadcrumbs } from './Breadcrumbs'
import { ForecastBaseDatePicker } from './ForecastBaseDatePicker'
import classes from './Toolbar.module.css'

export const Toolbar = () => {
  return (
    <section
      role="toolbar"
      aria-label="Toolbar with site navigation, search and date selection"
      className={classes['toolbar-section']}
    >
      <Breadcrumbs />
      <ForecastBaseDatePicker />
    </section>
  )
}
