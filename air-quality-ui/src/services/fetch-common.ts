export const fetchJson = async (
  urlString: string,
  params: Record<string, string | string[]>,
) => {
  const url = new URL(urlString)
  Object.keys(params).forEach((key) => {
    const value = params[key]
    if (typeof value === 'string') {
      url.searchParams.append(key, value)
    } else {
      value.forEach((v) => url.searchParams.append(key, v))
    }
  })
  return fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json())
}
