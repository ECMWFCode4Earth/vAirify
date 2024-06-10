import { ICellRendererParams } from 'ag-grid-community'
import { Link } from 'react-router-dom'

export interface LocationCellRendererProps {
  name: string
  type: string
}

export const LocationCellRenderer = (props: ICellRendererParams) => {
  return <Link to={`city/${props.value}`}>{props.value}</Link>
}
