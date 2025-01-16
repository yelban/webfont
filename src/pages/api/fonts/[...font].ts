// pages/api/fonts/[...font].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

// MIME 類型對照表
const MIME_TYPES = {
  'woff2': 'font/woff2',
  'woff': 'font/woff',
  'ttf': 'font/ttf',
  'otf': 'font/otf'
} as const;

// 檢查副檔名是否為支援的字體格式
function isValidFontExtension(ext: string): ext is keyof typeof MIME_TYPES {
  return ext in MIME_TYPES;
}

// 檢查路徑是否試圖訪問上層目錄
function isPathTraversal(filePath: string): boolean {
  return filePath.includes('..');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允許 GET 和 OPTIONS 方法
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).end('Method Not Allowed');
  }

  // 處理 OPTIONS 請求（CORS 預檢請求）
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  try {
    // 從 query 取得字體路徑
    const fontPath = Array.isArray(req.query.font) 
      ? req.query.font.join('/') 
      : req.query.font || '';

    // 安全性檢查：防止目錄遍歷攻擊
    if (isPathTraversal(fontPath)) {
      return res.status(400).end('Invalid font path');
    }

    // 取得副檔名
    const ext = path.extname(fontPath).slice(1).toLowerCase();

    // 檢查是否為支援的字體格式
    if (!isValidFontExtension(ext)) {
      return res.status(400).end('Unsupported font format');
    }

    // 組合完整的檔案路徑
    const fullPath = path.join(process.cwd(), 'public', 'fonts', fontPath);

    // 檢查檔案是否存在
    if (!existsSync(fullPath)) {
      return res.status(404).end('Font not found');
    }

    // 讀取字體檔案
    const fontData = await readFile(fullPath);

    // 設定回應標頭
    res.setHeader('Content-Type', MIME_TYPES[ext]);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // 回傳字體檔案
    return res.send(fontData);

  } catch (error) {
    console.error('Error serving font:', error);
    return res.status(500).end('Internal Server Error');
  }
}

// 設定不要解析 body，因為我們只需要處理二進制檔案
export const config = {
  api: {
    bodyParser: false,
  },
}
