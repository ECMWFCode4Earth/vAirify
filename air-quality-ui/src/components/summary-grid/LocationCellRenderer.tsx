import { ICellRendererParams } from 'ag-grid-community'
import { Link } from 'react-router-dom'

import { RouteConstants } from '../../routes'

export const LocationCellRenderer = (
  props: Pick<ICellRendererParams, 'value'>,
) => {
  return (
    <Link to={`${RouteConstants.SINGLE_CITY}/${props.value}`} role="link">
      {props.value}
    </Link>
  )
}
