import { Breadcrumbs } from './Breadcrumbs'
import classes from './Toolbar.module.css'

export const Toolbar = () => {
  return (
    <section
      role="toolbar"
      aria-label="Toolbar with site navigation, search and date selection"
      className={classes['toolbar-section']}
    >
      <Breadcrumbs />
    </section>
  )
}
