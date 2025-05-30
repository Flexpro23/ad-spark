import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    geminiApiKey: process.env.GEMINI_API_KEY ? "✅ Found" : "❌ Missing",
    googleCloudApiKey: process.env.GOOGLE_CLOUD_API_KEY ? "✅ Found" : "❌ Missing",
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
} 