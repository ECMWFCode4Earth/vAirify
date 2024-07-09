import classes from './Header.module.css'
import { Toolbar } from './Toolbar'

export const Header = () => (
  <header>
    <section className={classes['header-section']}>
      <div>
        <img
          src="https://www.ecmwf.int/themes/ecmwf/src/images/svg/ECMWF_logo.svg"
          alt="ECMWF Logo"
        />
      </div>
      <div>
        <img
          className={classes['vairify-logo']}
          src="/vAirifyLogo.png"
          data-testid="vairify-logo"
          alt="vAirify"
        />
      </div>
    </section>
    <Toolbar></Toolbar>
  </header>
)
