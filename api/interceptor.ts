import { hasNaN } from './validators.ts'

export const install = (): void => {
  uni.addInterceptor('request', {
    invoke(args: Record<string, unknown>) {
      if (hasNaN(args.data as Record<string, unknown>) || (args.url && String(args.url).includes('NaN'))) {
        console.warn('已拦截含有 NaN 的无效请求:', args.url, args.data)
        return false
      }

      const header = (args.header || {}) as Record<string, string>
      args.header = header
      if (!header['Content-Type'] && !header['content-type']) {
        header['Content-Type'] = 'application/json'
      }
    },
    success(_args: unknown) {},
    fail(_err: unknown) {},
    complete(_res: unknown) {}
  })
}
