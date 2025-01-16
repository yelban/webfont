import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 取得 response
  const response = NextResponse.next()

  // 設定 CORS
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', '*')
  
  // 設定快取
  response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  
  return response
}

// 配置 middleware 只在字體檔案請求時執行
export const config = {
  matcher: '/fonts/:path*',
}
