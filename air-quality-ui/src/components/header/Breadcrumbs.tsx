import { Link, UIMatch, useMatches } from 'react-router-dom'

import classes from './Breadcrumbs.module.css'

interface Breadcrumb {
  path?: string
  title: (match: UIMatch<unknown, unknown>) => string
}

interface BreadcrumbHandle {
  breadcrumbConfig: Breadcrumb[]
}

const isBreadcrumbConfig = (object: unknown): object is Breadcrumb =>
  object !== null &&
  typeof object === 'object' &&
  (!('path' in object) ||
    ('path' in object && typeof object.path === 'string')) &&
  'title' in object &&
  (typeof object.title === 'function' || typeof object.title === 'string')

const isBreadcrumbHandle = (object: unknown): object is BreadcrumbHandle =>
  object !== null &&
  typeof object === 'object' &&
  'breadcrumbConfig' in object &&
  Array.isArray(object.breadcrumbConfig) &&
  object.breadcrumbConfig.every((entry) => isBreadcrumbConfig(entry))

function Breadcrumbs() {
  const matches = useMatches()
  const breadcrumbs = matches.flatMap((match) => {
    const { handle } = match
    if (!isBreadcrumbHandle(handle)) {
      return []
    }
    return handle.breadcrumbConfig.map(({ path, title }) => ({
      path,
      title: title(match),
    }))
  })

  return (
    <nav>
      <ol className={classes['breadcrumb-list']}>
        {breadcrumbs.map(({ path, title }, index) => (
          <>
            <li key={index} className={classes['breadcrumb']}>
              {path && (
                <Link className={classes['breadcrumb-link']} to={path}>
                  {title}
                </Link>
              )}
              {!path && (
                <div className={classes['breadcrumb-leaf']}>{title}</div>
              )}
            </li>
            <li>{index < breadcrumbs.length - 1 && <>/</>}</li>
          </>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
