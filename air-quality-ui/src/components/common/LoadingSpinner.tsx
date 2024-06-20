import classes from './LoadingSpinner.module.css'

export const LoadingSpinner = (): JSX.Element => (
  <span data-testid="loading-spinner" className={classes['loader']}></span>
)
