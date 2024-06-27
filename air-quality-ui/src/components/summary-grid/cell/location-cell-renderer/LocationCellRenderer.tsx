import { ICellRendererParams } from 'ag-grid-community'
import { Link } from 'react-router-dom'

import classes from './LocationCellRenderer.module.css'
import { RouteConstants } from '../../../../routes'

export const LocationCellRenderer = (
  props: Pick<ICellRendererParams, 'value'>,
) => {
  return (
    <Link
      to={`${RouteConstants.SINGLE_CITY}/${props.value}`}
      role="link"
      className={classes['location-link']}
    >
      {props.value}
    </Link>
  )
}
