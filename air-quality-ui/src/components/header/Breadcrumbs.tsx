import { useMemo } from 'react'
import { Link, UIMatch, useMatches } from 'react-router-dom'

import classes from './Breadcrumbs.module.css'

interface BreadcrumbConfig {
  path?: string
  title: (match: UIMatch<unknown, unknown>) => string
}

interface BreadcrumbHandle {
  breadcrumbs: BreadcrumbConfig[]
}

const isBreadcrumbConfig = (object: unknown): object is BreadcrumbConfig =>
  object !== null &&
  typeof object === 'object' &&
  (!('path' in object) ||
    ('path' in object && typeof object.path === 'string')) &&
  'title' in object &&
  typeof object.title === 'function'

const isBreadcrumbHandle = (object: unknown): object is BreadcrumbHandle =>
  object !== null &&
  typeof object === 'object' &&
  'breadcrumbs' in object &&
  Array.isArray(object.breadcrumbs) &&
  object.breadcrumbs.every((entry) => isBreadcrumbConfig(entry))

export const Breadcrumbs = (): JSX.Element => {
  const matches = useMatches()
  const breadcrumbs = useMemo(
    () =>
      matches.flatMap((match) => {
        const { handle } = match
        if (!isBreadcrumbHandle(handle)) {
          return []
        }
        return handle.breadcrumbs.map(({ path, title }) => ({
          path,
          title: title(match),
        }))
      }),
    [matches],
  )

  return (
    <nav>
      <ol className={classes['breadcrumb-list']}>
        {breadcrumbs.flatMap(({ path, title }, index) => {
          const breadcrumbComponents = [
            <li key={`crumb-${index}`} className={classes['breadcrumb']}>
              {path && (
                <Link
                  className={classes['breadcrumb-link']}
                  to={path}
                  role="link"
                >
                  {title}
                </Link>
              )}
              {!path && (
                <div className={classes['breadcrumb-leaf']}>{title}</div>
              )}
            </li>,
          ]
          if (index < breadcrumbs.length - 1) {
            breadcrumbComponents.push(
              <li key={`crumb-separator-${index}`}>/</li>,
            )
          }
          return breadcrumbComponents
        })}
      </ol>
    </nav>
  )
}
