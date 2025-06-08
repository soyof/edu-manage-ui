export const getNewUrl = (url: string | undefined, param: any): string => {
  url = url || ''
  param = param || {}
  if (!url) return ''
  url = url.indexOf('?') > 0 ? `${url}&` : `${url}?`
  url = Object.keys(param).reduce((preVal: string, curItem: string) => {
    if (param[curItem] !== undefined && param[curItem] !== null) {
      preVal += `${curItem}=${encodeURIComponent(param[curItem])}&`
    }
    return preVal
  }, url)
  return url.replace(/[&?]$/, '')
}
