import md5 from 'md5'
import { pwdPrefix } from '@/dic/pwd'

export const encodePwByMd5 = (pw: string) => {
  if (!pw) return ''
  return md5(md5(`${pwdPrefix}${pw}`))
}
