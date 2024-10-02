import { ICellRendererParams } from 'ag-grid-community'
import { useCallback, useEffect, useId } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import classes from './LocationCellRenderer.module.css'
import { RouteConstants } from '../../../../routes'

export const LocationCellRenderer = (
  props: Pick<ICellRendererParams, 'value' | 'eGridCell'>,
) => {
  const { eGridCell, value } = props
  const linkTo = `${RouteConstants.SINGLE_CITY}/${value}`
  const linkId = useId()
  const navigate = useNavigate()

  const navListener = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === 'Enter') navigate(linkTo)
    },
    [linkTo, navigate],
  )

  useEffect(() => {
    eGridCell.setAttribute('aria-activedescendant', linkId)
    eGridCell.addEventListener('keydown', navListener)

    return () => {
      eGridCell.removeEventListener('keydown', navListener)
    }
  }, [eGridCell, linkId, navListener])

  return (
    <Link
      id={linkId}
      to={linkTo}
      role="link"
      className={classes['location-link']}
    >
      {value}
    </Link>
  )
}
