import { ICellRendererParams } from 'ag-grid-community'
import { Link } from 'react-router-dom'

export const LocationCellRenderer = (
  props: Pick<ICellRendererParams, 'value'>,
) => {
  return (
    <Link to={`city/${props.value}`} role="link">
      {props.value}
    </Link>
  )
}
