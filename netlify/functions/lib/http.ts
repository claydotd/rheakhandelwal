import type { HandlerResponse } from '@netlify/functions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
}

export function json(
  statusCode: number,
  body: unknown,
  extraHeaders: Record<string, string> = {},
): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  }
}

export function binary(
  statusCode: number,
  body: Buffer,
  contentType: string,
): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...corsHeaders,
    },
    body: body.toString('base64'),
    isBase64Encoded: true,
  }
}

export function noContent(): HandlerResponse {
  return {
    statusCode: 204,
    headers: corsHeaders,
    body: '',
  }
}
