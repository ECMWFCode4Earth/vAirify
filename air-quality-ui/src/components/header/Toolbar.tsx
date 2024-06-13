import Breadcrumbs from './Breadcrumbs'
import classes from './Toolbar.module.css'

const Toolbar = () => {
  return (
    <section className={classes['toolbar-section']}>
      <Breadcrumbs />
    </section>
  )
}

export default Toolbar
