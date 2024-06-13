import { Breadcrumbs } from './Breadcrumbs'
import classes from './Toolbar.module.css'

export const Toolbar = () => {
  return (
    <section role="toolbar" className={classes['toolbar-section']}>
      <Breadcrumbs />
    </section>
  )
}
